const Technician = require('../models/Technician');
const Transaction = require('../models/Transaction');
const { createPayout } = require('../utils/razorpayService');

// @desc    Get Technician Wallet Balance & History
// @route   GET /api/technician/wallet
const getTechnicianWallet = async (req, res) => {
    try {
        const technician = await Technician.findOne({ user: req.user._id });
        if (!technician) return res.status(404).json({ message: 'Technician not found' });

        const transactions = await Transaction.find({ technician: technician._id })
            .sort({ createdAt: -1 })
            .limit(50);

        res.json({
            walletBalance: technician.walletBalance || 0,
            totalEarnings: technician.totalEarnings || 0,
            transactions
        });
    } catch (error) {
        console.error('getTechnicianWallet Error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Request Withdrawal
// @route   POST /api/technician/wallet/withdraw
const requestWithdrawal = async (req, res) => {
    try {
        const { amount, bankAccountId } = req.body;
        const technician = await Technician.findOne({ user: req.user._id });
        if (!technician) return res.status(404).json({ message: 'Technician not found' });

        // Validation
        if (!amount || amount <= 0) {
            return res.status(400).json({ message: 'Invalid withdrawal amount' });
        }

        const minWithdrawal = 100;
        if (amount < minWithdrawal) {
            return res.status(400).json({ message: `Minimum withdrawal amount is ₹${minWithdrawal}` });
        }

        if (technician.walletBalance < amount) {
            return res.status(400).json({ message: 'Insufficient wallet balance' });
        }

        // For now, create a pending withdrawal transaction
        // In production, this would integrate with Razorpay X for actual payout
        const withdrawal = await Transaction.create({
            technician: technician._id,
            type: 'settlement',
            amount: -amount,
            description: 'Withdrawal Request',
            status: 'pending',
            referenceId: `WD-${Date.now()}`,
            paymentMethod: 'bank_transfer'
        });

        // Deduct from wallet (will be reversed if payout fails)
        technician.walletBalance -= amount;
        await technician.save();

        // TODO: In production, call Razorpay X payout API
        // const payout = await createPayout(bankAccountId, amount, 'technician_withdrawal');

        res.json({
            success: true,
            withdrawal,
            newBalance: technician.walletBalance,
            message: 'Withdrawal request submitted. Funds will be transferred within 1-2 business days.'
        });
    } catch (error) {
        console.error('requestWithdrawal Error:', error);
        res.status(500).json({ message: 'Withdrawal request failed', error: error.message });
    }
};

// @desc    Get Withdrawal History
// @route   GET /api/technician/wallet/withdrawals
const getWithdrawalHistory = async (req, res) => {
    try {
        const technician = await Technician.findOne({ user: req.user._id });
        if (!technician) return res.status(404).json({ message: 'Technician not found' });

        const withdrawals = await Transaction.find({
            technician: technician._id,
            type: 'settlement'
        }).sort({ createdAt: -1 });

        res.json(withdrawals);
    } catch (error) {
        console.error('getWithdrawalHistory Error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get Earnings Summary
// @route   GET /api/technician/wallet/earnings
const getEarningsSummary = async (req, res) => {
    try {
        const technician = await Technician.findOne({ user: req.user._id });
        if (!technician) return res.status(404).json({ message: 'Technician not found' });

        // Get earnings for different time periods
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));

        const monthlyEarnings = await Transaction.aggregate([
            {
                $match: {
                    technician: technician._id,
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

        const weeklyEarnings = await Transaction.aggregate([
            {
                $match: {
                    technician: technician._id,
                    type: 'earnings',
                    createdAt: { $gte: startOfWeek }
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
            totalEarnings: technician.totalEarnings || 0,
            walletBalance: technician.walletBalance || 0,
            monthlyEarnings: monthlyEarnings[0] || { total: 0, count: 0 },
            weeklyEarnings: weeklyEarnings[0] || { total: 0, count: 0 }
        });
    } catch (error) {
        console.error('getEarningsSummary Error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Add Bank Account
// @route   POST /api/technician/wallet/bank-account
const addBankAccount = async (req, res) => {
    try {
        const { accountHolderName, accountNumber, ifscCode, bankName } = req.body;
        const technician = await Technician.findOne({ user: req.user._id });
        if (!technician) return res.status(404).json({ message: 'Technician not found' });

        // Validation
        if (!accountHolderName || !accountNumber || !ifscCode) {
            return res.status(400).json({ message: 'All bank details are required' });
        }

        // Store bank account details
        if (!technician.bankAccounts) {
            technician.bankAccounts = [];
        }

        const newAccount = {
            accountHolderName,
            accountNumber: accountNumber.slice(-4), // Store only last 4 digits for security
            accountNumberFull: accountNumber, // In production, encrypt this
            ifscCode,
            bankName: bankName || 'Not specified',
            isDefault: technician.bankAccounts.length === 0,
            addedAt: new Date()
        };

        technician.bankAccounts.push(newAccount);
        await technician.save();

        res.json({
            success: true,
            message: 'Bank account added successfully',
            account: {
                accountHolderName: newAccount.accountHolderName,
                accountNumber: newAccount.accountNumber,
                ifscCode: newAccount.ifscCode,
                bankName: newAccount.bankName,
                isDefault: newAccount.isDefault
            }
        });
    } catch (error) {
        console.error('addBankAccount Error:', error);
        res.status(500).json({ message: 'Failed to add bank account', error: error.message });
    }
};

// @desc    Get Bank Accounts
// @route   GET /api/technician/wallet/bank-accounts
const getBankAccounts = async (req, res) => {
    try {
        const technician = await Technician.findOne({ user: req.user._id });
        if (!technician) return res.status(404).json({ message: 'Technician not found' });

        const accounts = (technician.bankAccounts || []).map(acc => ({
            _id: acc._id,
            accountHolderName: acc.accountHolderName,
            accountNumber: acc.accountNumber,
            ifscCode: acc.ifscCode,
            bankName: acc.bankName,
            isDefault: acc.isDefault
        }));

        res.json(accounts);
    } catch (error) {
        console.error('getBankAccounts Error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    getTechnicianWallet,
    requestWithdrawal,
    getWithdrawalHistory,
    getEarningsSummary,
    addBankAccount,
    getBankAccounts
};
