import { BankCard } from '@/components/supplier/BankCard';
import { SupplierWithdrawModal } from '@/components/supplier/SupplierWithdrawModal';
import { TransactionItem } from '@/components/supplier/TransactionItem';
import { AppTextInput } from '@/components/ui/AppTextInput';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { supplierService } from '@/services/supplierService';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Modal,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SupplierWalletScreen() {
    const router = useRouter();
    const { currencySymbol } = useAuth();
    const colorScheme = useColorScheme();
    const theme = colorScheme ?? 'light';
    const colors = Colors[theme];
    const isDark = theme === 'dark';

    const [walletData, setWalletData] = useState<any>(null);
    const [earnings, setEarnings] = useState<any>(null);
    const [transactions, setTransactions] = useState<any[]>([]);
    const [bankAccounts, setBankAccounts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const [withdrawModalVisible, setWithdrawModalVisible] = useState(false);
    const [addBankModalVisible, setAddBankModalVisible] = useState(false);
    const [bankDetails, setBankDetails] = useState({
        accountHolderName: '',
        accountNumber: '',
        ifscCode: '',
        bankName: ''
    });

    useEffect(() => {
        loadWalletData();
    }, []);

    const loadWalletData = async () => {
        try {
            const [walletRes, earningsRes, bankAccountsRes] = await Promise.all([
                supplierService.getWallet(),
                supplierService.getEarningsSummary(),
                supplierService.getBankAccounts()
            ]);

            setWalletData(walletRes);
            setTransactions(walletRes.transactions || []);
            setEarnings(earningsRes);
            setBankAccounts(bankAccountsRes);
        } catch (error) {
            console.error('Failed to load wallet data:', error);
            // Don't alert on first load if it's just a 404/empty state
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleWithdraw = async (amount: number) => {
        try {
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            const result = await supplierService.requestWithdrawal(amount);
            Alert.alert('Success', result.message || 'Withdrawal request submitted');
            setWithdrawModalVisible(false);
            loadWalletData();
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.message || 'Failed to request withdrawal');
            throw error;
        }
    };

    const handleAddBankAccount = async () => {
        if (!bankDetails.accountHolderName || !bankDetails.accountNumber || !bankDetails.ifscCode) {
            Alert.alert('Missing Details', 'Please fill all required fields');
            return;
        }

        try {
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            await supplierService.addBankAccount(bankDetails);
            Alert.alert('Success', 'Bank account added successfully');
            setAddBankModalVisible(false);
            setBankDetails({ accountHolderName: '', accountNumber: '', ifscCode: '', bankName: '' });
            loadWalletData();
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.message || 'Failed to add bank account');
        }
    };

    if (loading) {
        return (
            <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
            <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace('/(supplier)/(tabs)' as any)} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Supplier Wallet</Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadWalletData(); }} />}
            >
                {/* Wallet Balance Card */}
                <View style={[styles.walletCard, { backgroundColor: isDark ? colors.card : '#1A1A1A' }]}>
                    <View style={styles.walletHeader}>
                        <Text style={styles.walletTitle}>Account Balance</Text>
                        <MaterialCommunityIcons name="store" size={24} color="#FFF" />
                    </View>
                    <Text style={styles.walletBalance}>{currencySymbol}{(walletData?.walletBalance || 0).toFixed(2)}</Text>
                    <View style={styles.actionRow}>
                        <TouchableOpacity
                            style={styles.withdrawBtn}
                            onPress={() => {
                                Haptics.selectionAsync();
                                setWithdrawModalVisible(true);
                            }}
                        >
                            <Ionicons name="cash-outline" size={20} color="#FFF" />
                            <Text style={styles.withdrawBtnText}>Withdraw</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Sales Summary */}
                <View style={styles.earningsGrid}>
                    <View style={[styles.earningCard, { backgroundColor: colors.card }]}>
                        <MaterialCommunityIcons name="chart-bar" size={24} color={colors.sales} />
                        <Text style={[styles.earningValue, { color: colors.text }]}>{currencySymbol}{(earnings?.revenue || 0).toFixed(0)}</Text>
                        <Text style={[styles.earningLabel, { color: colors.icon }]}>Total Revenue</Text>
                    </View>
                    <View style={[styles.earningCard, { backgroundColor: colors.card }]}>
                        <MaterialCommunityIcons name="calendar-check" size={24} color={colors.customers} />
                        <Text style={[styles.earningValue, { color: colors.text }]}>{currencySymbol}{(earnings?.monthlyEarnings?.total || 0).toFixed(0)}</Text>
                        <Text style={[styles.earningLabel, { color: colors.icon }]}>This Month</Text>
                    </View>
                </View>

                {/* Bank Accounts Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>Payout Methods</Text>
                        <TouchableOpacity onPress={() => setAddBankModalVisible(true)}>
                            <Ionicons name="add-circle" size={24} color={colors.primary} />
                        </TouchableOpacity>
                    </View>
                    {bankAccounts.length > 0 ? (
                        bankAccounts.map((account, index) => (
                            <BankCard key={index} account={account} />
                        ))
                    ) : (
                        <TouchableOpacity
                            style={[styles.addBankPrompt, { backgroundColor: colors.card, borderColor: colors.border }]}
                            onPress={() => setAddBankModalVisible(true)}
                        >
                            <Ionicons name="add-circle-outline" size={32} color={colors.icon} />
                            <Text style={[styles.addBankText, { color: colors.icon }]}>Add Bank Account</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Transaction History */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Transaction History</Text>
                    {transactions.length > 0 ? (
                        transactions.map((tx, index) => (
                            <TransactionItem key={index} tx={tx} />
                        ))
                    ) : (
                        <Text style={[styles.emptyText, { color: colors.icon }]}>No transactions recorded</Text>
                    )}
                </View>
            </ScrollView>

            {/* Withdraw Modal */}
            <SupplierWithdrawModal
                visible={withdrawModalVisible}
                onClose={() => setWithdrawModalVisible(false)}
                onWithdraw={handleWithdraw}
                walletBalance={walletData?.walletBalance || 0}
                currencySymbol={currencySymbol}
            />

            {/* Add Bank Account Modal */}
            <Modal visible={addBankModalVisible} animationType="slide" transparent onRequestClose={() => setAddBankModalVisible(false)}>
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
                        <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
                            <Text style={[styles.modalTitle, { color: colors.text }]}>Add Payout Account</Text>
                            <TouchableOpacity onPress={() => setAddBankModalVisible(false)}>
                                <Ionicons name="close" size={24} color={colors.text} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={{ paddingVertical: 20 }}>
                            <AppTextInput
                                label="Account Holder Name"
                                placeholder="As per bank records"
                                value={bankDetails.accountHolderName}
                                onChangeText={(text) => setBankDetails({ ...bankDetails, accountHolderName: text })}
                            />

                            <AppTextInput
                                label="Account Number"
                                placeholder="Bank Account Number"
                                value={bankDetails.accountNumber}
                                onChangeText={(text) => setBankDetails({ ...bankDetails, accountNumber: text })}
                                keyboardType="numeric"
                            />

                            <AppTextInput
                                label="IFSC Code"
                                placeholder="11 character IFSC"
                                value={bankDetails.ifscCode}
                                onChangeText={(text) => setBankDetails({ ...bankDetails, ifscCode: text.toUpperCase() })}
                                autoCapitalize="characters"
                            />

                            <AppTextInput
                                label="Bank Name"
                                placeholder="e.g. HDFC Bank"
                                value={bankDetails.bankName}
                                onChangeText={(text) => setBankDetails({ ...bankDetails, bankName: text })}
                            />

                            <TouchableOpacity
                                style={[styles.confirmBtn, { backgroundColor: colors.primary, marginTop: 20 }]}
                                onPress={handleAddBankAccount}
                            >
                                <Text style={styles.confirmBtnText}>Save Account</Text>
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: 1
    },
    backBtn: { width: 44, height: 44, justifyContent: 'center' },
    headerTitle: { fontSize: 18, fontFamily: 'NotoSans-Bold' },
    scrollContent: { padding: 20 },

    walletCard: {
        borderRadius: 24,
        padding: 24,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
        elevation: 8
    },
    walletHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
    walletTitle: { color: 'rgba(255,255,255,0.7)', fontSize: 14, fontFamily: 'NotoSans-Bold', textTransform: 'uppercase' },
    walletBalance: { color: '#FFF', fontSize: 36, fontFamily: 'NotoSans-Black', marginBottom: 20 },
    actionRow: { flexDirection: 'row', gap: 12 },
    withdrawBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingVertical: 14,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)'
    },
    withdrawBtnText: { color: '#FFF', fontSize: 16, fontFamily: 'NotoSans-Bold' },

    earningsGrid: { flexDirection: 'row', gap: 12, marginBottom: 20 },
    earningCard: {
        flex: 1,
        padding: 16,
        borderRadius: 16,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2
    },
    earningValue: { fontSize: 20, fontFamily: 'NotoSans-Black', marginTop: 8 },
    earningLabel: { fontSize: 12, marginTop: 4 },

    section: { marginBottom: 30 },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
    sectionTitle: { fontSize: 16, fontFamily: 'NotoSans-Bold' },

    addBankPrompt: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        padding: 24,
        borderRadius: 16,
        borderWidth: 2,
        borderStyle: 'dashed'
    },
    addBankText: { fontSize: 14, fontFamily: 'NotoSans-Bold' },

    emptyText: { textAlign: 'center', padding: 20, fontSize: 14 },

    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 25, maxHeight: '85%' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, paddingBottom: 15, borderBottomWidth: 1 },
    modalTitle: { fontSize: 20, fontFamily: 'NotoSans-Black' },


    confirmBtn: {
        height: 56,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center'
    },
    confirmBtnText: { color: '#FFF', fontSize: 16, fontFamily: 'NotoSans-Bold' }
});
