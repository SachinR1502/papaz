const Supplier = require('../models/Supplier');
const Transaction = require('../models/Transaction');
const { createPayout } = require('../utils/razorpayService');

// @desc    Get Supplier Wallet Balance & History
// @route   GET /api/supplier/wallet
const getSupplierWallet = async (req, res) => {
    try {
        const supplier = await Supplier.findOne({ user: req.user._id });
        if (!supplier) return res.status(404).json({ message: 'Supplier not found' });

        const transactions = await Transaction.find({ supplier: supplier._id })
            .sort({ createdAt: -1 })
            .limit(50);

        res.json({
            walletBalance: supplier.walletBalance || 0,
            revenue: supplier.revenue || 0,
            transactions
        });
    } catch (error) {
        console.error('getSupplierWallet Error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Request Withdrawal
// @route   POST /api/supplier/wallet/withdraw
const requestWithdrawal = async (req, res) => {
    try {
        const { amount, bankAccountId } = req.body;
        const supplier = await Supplier.findOne({ user: req.user._id });
        if (!supplier) return res.status(404).json({ message: 'Supplier not found' });

        // Validation
        if (!amount || amount <= 0) {
            return res.status(400).json({ message: 'Invalid withdrawal amount' });
        }

        const minWithdrawal = 500; // Suppliers usually have higher minimums
        if (amount < minWithdrawal) {
            return res.status(400).json({ message: `Minimum withdrawal amount is ₹${minWithdrawal}` });
        }

        if (supplier.walletBalance < amount) {
            return res.status(400).json({ message: 'Insufficient wallet balance' });
        }

        // Create a pending withdrawal transaction
        const withdrawal = await Transaction.create({
            supplier: supplier._id,
            type: 'settlement',
            amount: -amount,
            description: 'Supplier Withdrawal Request',
            status: 'pending',
            referenceId: `SWD-${Date.now()}`,
            paymentMethod: 'bank_transfer'
        });

        // Deduct from wallet
        supplier.walletBalance -= amount;
        await supplier.save();

        res.json({
            success: true,
            withdrawal,
            newBalance: supplier.walletBalance,
            message: 'Withdrawal request submitted. Funds will be transferred within 2-3 business days.'
        });
    } catch (error) {
        console.error('requestWithdrawal Error:', error);
        res.status(500).json({ message: 'Withdrawal request failed', error: error.message });
    }
};

// @desc    Get Earnings Summary
// @route   GET /api/supplier/wallet/earnings
const getEarningsSummary = async (req, res) => {
    try {
        const supplier = await Supplier.findOne({ user: req.user._id });
        if (!supplier) return res.status(404).json({ message: 'Supplier not found' });

        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const monthlyEarnings = await Transaction.aggregate([
            {
                $match: {
                    supplier: supplier._id,
                    type: 'earnings',
                    createdAt: { $gte: startOfMonth }
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: '$amount' },
                    count: { $sum: 1 }
                }
            }
        ]);

        res.json({
            revenue: supplier.revenue || 0,
            walletBalance: supplier.walletBalance || 0,
            monthlyEarnings: monthlyEarnings[0] || { total: 0, count: 0 }
        });
    } catch (error) {
        console.error('getEarningsSummary Error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Add Bank Account
// @route   POST /api/supplier/wallet/bank-account
const addBankAccount = async (req, res) => {
    try {
        const { accountHolderName, accountNumber, ifscCode, bankName } = req.body;
        const supplier = await Supplier.findOne({ user: req.user._id });
        if (!supplier) return res.status(404).json({ message: 'Supplier not found' });

        if (!accountHolderName || !accountNumber || !ifscCode) {
            return res.status(400).json({ message: 'All bank details are required' });
        }

        const newAccount = {
            accountHolderName,
            accountNumber: accountNumber.slice(-4),
            accountNumberFull: accountNumber,
            ifscCode,
            bankName: bankName || 'Not specified',
            isDefault: (supplier.bankAccounts || []).length === 0,
            addedAt: new Date()
        };

        if (!supplier.bankAccounts) supplier.bankAccounts = [];
        supplier.bankAccounts.push(newAccount);
        await supplier.save();

        res.json({
            success: true,
            message: 'Bank account added successfully',
            account: newAccount
        });
    } catch (error) {
        console.error('addBankAccount Error:', error);
        res.status(500).json({ message: 'Failed to add bank account', error: error.message });
    }
};

// @desc    Get Bank Accounts
// @route   GET /api/supplier/wallet/bank-accounts
const getBankAccounts = async (req, res) => {
    try {
        const supplier = await Supplier.findOne({ user: req.user._id });
        if (!supplier) return res.status(404).json({ message: 'Supplier not found' });

        res.json(supplier.bankAccounts || []);
    } catch (error) {
        console.error('getBankAccounts Error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    getSupplierWallet,
    requestWithdrawal,
    getEarningsSummary,
    addBankAccount,
    getBankAccounts
};
