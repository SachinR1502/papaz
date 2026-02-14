import {
    EmptyState,
    ErrorBoundary,
    ListSkeleton
} from '@/components/ui';
import { Colors } from '@/constants/theme';
import { useTechnician } from '@/context/TechnicianContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { technicianService } from '@/services/technicianService';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Modal,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

function WalletContent() {
    const router = useRouter();
    const { profile } = useTechnician();
    const colorScheme = useColorScheme();
    const theme = colorScheme ?? 'light';
    const colors = Colors[theme];
    const isDark = theme === 'dark';

    const [walletData, setWalletData] = useState<any>(null);
    const [earnings, setEarnings] = useState<any>(null);
    const [transactions, setTransactions] = useState<any[]>([]);
    const [withdrawals, setWithdrawals] = useState<any[]>([]);
    const [bankAccounts, setBankAccounts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Pagination State
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);

    const [withdrawModalVisible, setWithdrawModalVisible] = useState(false);
    const [withdrawAmount, setWithdrawAmount] = useState('');
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
            setPage(1);
            setHasMore(true);
            const [walletRes, earningsRes, bankAccountsRes, transactionsRes] = await Promise.all([
                technicianService.getWallet(),
                technicianService.getEarningsSummary(),
                technicianService.getBankAccounts(),
                technicianService.getWalletTransactions(1, 10)
            ]);

            setWalletData(walletRes);
            setEarnings(earningsRes);
            setBankAccounts(bankAccountsRes);

            // Handle transactions pagination
            setTransactions(transactionsRes.transactions || transactionsRes || []);
            setHasMore((transactionsRes.transactions || transactionsRes || []).length >= 10);

        } catch (error) {
            console.error('Failed to load wallet data:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const loadMoreTransactions = async () => {
        if (loadingMore || !hasMore) return;

        setLoadingMore(true);
        try {
            const nextPage = page + 1;
            const res = await technicianService.getWalletTransactions(nextPage, 10);
            const newTransactions = res.transactions || res || [];

            if (newTransactions.length > 0) {
                setTransactions(prev => [...prev, ...newTransactions]);
                setPage(nextPage);
                setHasMore(newTransactions.length >= 10);
            } else {
                setHasMore(false);
            }
        } catch (error) {
            console.error('Failed to load more transactions:', error);
        } finally {
            setLoadingMore(false);
        }
    };

    const handleWithdraw = async () => {
        const amount = parseFloat(withdrawAmount);
        if (!amount || amount <= 0) {
            Alert.alert('Invalid Amount', 'Please enter a valid amount');
            return;
        }

        if (amount > (walletData?.walletBalance || 0)) {
            Alert.alert('Insufficient Balance', 'You don\'t have enough balance');
            return;
        }

        if (amount < 100) {
            Alert.alert('Minimum Withdrawal', 'Minimum withdrawal amount is ₹100');
            return;
        }

        if (bankAccounts.length === 0) {
            Alert.alert('No Bank Account', 'Please add a bank account first');
            setWithdrawModalVisible(false);
            setAddBankModalVisible(true);
            return;
        }

        try {
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            const result = await technicianService.requestWithdrawal(amount);
            Alert.alert('Success', result.message || 'Withdrawal request submitted');
            setWithdrawModalVisible(false);
            setWithdrawAmount('');
            loadWalletData();
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.message || 'Failed to request withdrawal');
        }
    };

    const handleAddBankAccount = async () => {
        if (!bankDetails.accountHolderName || !bankDetails.accountNumber || !bankDetails.ifscCode) {
            Alert.alert('Missing Details', 'Please fill all required fields');
            return;
        }

        try {
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            await technicianService.addBankAccount(bankDetails);
            Alert.alert('Success', 'Bank account added successfully');
            setAddBankModalVisible(false);
            setBankDetails({ accountHolderName: '', accountNumber: '', ifscCode: '', bankName: '' });
            loadWalletData();
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.message || 'Failed to add bank account');
        }
    };

    const renderHeader = () => (
        <View>
            {/* Wallet Balance Card */}
            <View style={[styles.walletCard, { backgroundColor: isDark ? colors.card : '#1A1A1A' }]}>
                <View style={styles.walletHeader}>
                    <Text style={styles.walletTitle}>Available Balance</Text>
                    <MaterialCommunityIcons name="wallet" size={24} color="#FFF" />
                </View>
                <Text style={styles.walletBalance}>₹{(walletData?.walletBalance || 0).toFixed(2)}</Text>
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

            {/* Earnings Summary */}
            <View style={styles.earningsGrid}>
                <View style={[styles.earningCard, { backgroundColor: colors.card }]}>
                    <MaterialCommunityIcons name="chart-line" size={24} color={colors.sales} />
                    <Text style={[styles.earningValue, { color: colors.text }]}>₹{(earnings?.totalEarnings || 0).toFixed(0)}</Text>
                    <Text style={[styles.earningLabel, { color: colors.icon }]}>Total Earnings</Text>
                </View>
                <View style={[styles.earningCard, { backgroundColor: colors.card }]}>
                    <MaterialCommunityIcons name="calendar-month" size={24} color={colors.customers} />
                    <Text style={[styles.earningValue, { color: colors.text }]}>₹{(earnings?.monthlyEarnings?.total || 0).toFixed(0)}</Text>
                    <Text style={[styles.earningLabel, { color: colors.icon }]}>This Month</Text>
                </View>
            </View>

            {/* Bank Accounts */}
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Bank Accounts</Text>
                    <TouchableOpacity onPress={() => setAddBankModalVisible(true)}>
                        <Ionicons name="add-circle" size={24} color={colors.primary} />
                    </TouchableOpacity>
                </View>
                {bankAccounts.length > 0 ? (
                    bankAccounts.map((account, index) => (
                        <View key={index} style={[styles.bankCard, { backgroundColor: colors.card }]}>
                            <View style={[styles.bankIcon, { backgroundColor: colors.primary + '20' }]}>
                                <MaterialCommunityIcons name="bank" size={24} color={colors.primary} />
                            </View>
                            <View style={styles.bankInfo}>
                                <Text style={[styles.bankName, { color: colors.text }]}>{account.bankName || 'Bank Account'}</Text>
                                <Text style={[styles.accountNumber, { color: colors.icon }]}>•••• {account.accountNumber}</Text>
                                <Text style={[styles.ifsc, { color: colors.icon }]}>IFSC: {account.ifscCode}</Text>
                            </View>
                            {account.isDefault && (
                                <View style={[styles.defaultBadge, { backgroundColor: colors.sales + '20' }]}>
                                    <Text style={[styles.defaultText, { color: colors.sales }]}>Default</Text>
                                </View>
                            )}
                        </View>
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

            <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: 15 }]}>Recent Transactions</Text>
        </View>
    );

    const renderTransaction = ({ item }: { item: any }) => (
        <View style={[styles.transactionItem, { borderBottomColor: colors.border }]}>
            <View style={[styles.txIcon, {
                backgroundColor: item.type === 'earnings' ? colors.sales + '20' : colors.notification + '20'
            }]}>
                <Ionicons
                    name={item.type === 'earnings' ? 'arrow-down' : 'arrow-up'}
                    size={20}
                    color={item.type === 'earnings' ? colors.sales : colors.notification}
                />
            </View>
            <View style={styles.txDetails}>
                <Text style={[styles.txDesc, { color: colors.text }]}>{item.description}</Text>
                <Text style={[styles.txDate, { color: colors.icon }]}>
                    {new Date(item.createdAt).toLocaleDateString()}
                </Text>
            </View>
            <Text style={[styles.txAmount, {
                color: item.type === 'earnings' ? colors.sales : colors.notification
            }]}>
                {item.type === 'earnings' ? '+' : '-'}₹{Math.abs(item.amount).toFixed(2)}
            </Text>
        </View>
    );

    if (loading) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
                <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
                    <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace('/(technician)/(tabs)' as any)} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={24} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: colors.text }]}>Wallet</Text>
                    <View style={{ width: 44 }} />
                </View>
                <View style={{ padding: 20 }}>
                    <ListSkeleton count={3} />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
            <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace('/(technician)/(tabs)' as any)} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Wallet</Text>
                <View style={{ width: 44 }} />
            </View>

            <FlatList
                data={transactions}
                renderItem={renderTransaction}
                keyExtractor={(item: any, index: number) => item.id || index.toString()}
                contentContainerStyle={styles.scrollContent}
                ListHeaderComponent={renderHeader}
                ListEmptyComponent={
                    <EmptyState
                        icon="receipt-outline"
                        title="No transactions yet"
                        description="Your recent wallet transactions will appear here"
                    />
                }
                onEndReached={loadMoreTransactions}
                onEndReachedThreshold={0.5}
                ListFooterComponent={loadingMore ? <ActivityIndicator style={{ padding: 20 }} color={colors.primary} /> : null}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadWalletData(); }} />}
            />

            {/* Withdraw Modal */}
            <Modal visible={withdrawModalVisible} animationType="slide" transparent onRequestClose={() => setWithdrawModalVisible(false)}>
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
                        <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
                            <Text style={[styles.modalTitle, { color: colors.text }]}>Withdraw Funds</Text>
                            <TouchableOpacity onPress={() => setWithdrawModalVisible(false)}>
                                <Ionicons name="close" size={24} color={colors.text} />
                            </TouchableOpacity>
                        </View>

                        <View style={{ paddingVertical: 20 }}>
                            <Text style={[styles.inputLabel, { color: colors.icon }]}>Amount to Withdraw</Text>
                            <TextInput
                                style={[styles.amountInput, { backgroundColor: isDark ? colors.border : '#F5F5F5', color: colors.text }]}
                                placeholder="Enter amount"
                                placeholderTextColor={colors.icon}
                                keyboardType="numeric"
                                value={withdrawAmount}
                                onChangeText={setWithdrawAmount}
                            />

                            <View style={styles.infoBox}>
                                <Ionicons name="information-circle-outline" size={16} color={colors.icon} />
                                <Text style={[styles.infoText, { color: colors.icon }]}>
                                    Minimum withdrawal: ₹100. Funds will be transferred within 1-2 business days.
                                </Text>
                            </View>

                            <TouchableOpacity
                                style={[styles.confirmBtn, { backgroundColor: colors.primary }]}
                                onPress={handleWithdraw}
                            >
                                <Text style={styles.confirmBtnText}>Request Withdrawal</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Add Bank Account Modal */}
            <Modal visible={addBankModalVisible} animationType="slide" transparent onRequestClose={() => setAddBankModalVisible(false)}>
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
                        <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
                            <Text style={[styles.modalTitle, { color: colors.text }]}>Add Bank Account</Text>
                            <TouchableOpacity onPress={() => setAddBankModalVisible(false)}>
                                <Ionicons name="close" size={24} color={colors.text} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={{ paddingVertical: 20 }}>
                            <Text style={[styles.inputLabel, { color: colors.icon }]}>Account Holder Name</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: isDark ? colors.border : '#F5F5F5', color: colors.text }]}
                                placeholder="Full Name"
                                placeholderTextColor={colors.icon}
                                value={bankDetails.accountHolderName}
                                onChangeText={(text) => setBankDetails({ ...bankDetails, accountHolderName: text })}
                            />

                            <Text style={[styles.inputLabel, { color: colors.icon, marginTop: 15 }]}>Account Number</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: isDark ? colors.border : '#F5F5F5', color: colors.text }]}
                                placeholder="Account Number"
                                placeholderTextColor={colors.icon}
                                keyboardType="numeric"
                                value={bankDetails.accountNumber}
                                onChangeText={(text) => setBankDetails({ ...bankDetails, accountNumber: text })}
                            />

                            <Text style={[styles.inputLabel, { color: colors.icon, marginTop: 15 }]}>IFSC Code</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: isDark ? colors.border : '#F5F5F5', color: colors.text }]}
                                placeholder="IFSC Code"
                                placeholderTextColor={colors.icon}
                                autoCapitalize="characters"
                                value={bankDetails.ifscCode}
                                onChangeText={(text) => setBankDetails({ ...bankDetails, ifscCode: text.toUpperCase() })}
                            />

                            <Text style={[styles.inputLabel, { color: colors.icon, marginTop: 15 }]}>Bank Name (Optional)</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: isDark ? colors.border : '#F5F5F5', color: colors.text }]}
                                placeholder="Bank Name"
                                placeholderTextColor={colors.icon}
                                value={bankDetails.bankName}
                                onChangeText={(text) => setBankDetails({ ...bankDetails, bankName: text })}
                            />

                            <TouchableOpacity
                                style={[styles.confirmBtn, { backgroundColor: colors.primary, marginTop: 20 }]}
                                onPress={handleAddBankAccount}
                            >
                                <Text style={styles.confirmBtnText}>Add Account</Text>
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

export default function TechnicianWalletScreen() {
    return (
        <ErrorBoundary>
            <WalletContent />
        </ErrorBoundary>
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
    walletTitle: { color: '#8E8E93', fontSize: 14, fontFamily: 'NotoSans-Bold', textTransform: 'uppercase' },
    walletBalance: { color: '#FFF', fontSize: 36, fontFamily: 'NotoSans-Black', marginBottom: 20 },
    withdrawBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: 'rgba(255,255,255,0.15)',
        paddingVertical: 12,
        borderRadius: 12
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

    bankCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2
    },
    bankIcon: { width: 48, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    bankInfo: { flex: 1, marginLeft: 12 },
    bankName: { fontSize: 15, fontFamily: 'NotoSans-Bold' },
    accountNumber: { fontSize: 13, marginTop: 2 },
    ifsc: { fontSize: 11, marginTop: 2 },
    defaultBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
    defaultText: { fontSize: 10, fontFamily: 'NotoSans-Bold' },

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

    transactionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1
    },
    txIcon: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
    txDetails: { flex: 1, marginLeft: 12 },
    txDesc: { fontSize: 14, fontFamily: 'NotoSans-Bold' },
    txDate: { fontSize: 12, marginTop: 2 },
    txAmount: { fontSize: 15, fontFamily: 'NotoSans-Black' },

    emptyText: { textAlign: 'center', padding: 20, fontSize: 14 },

    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 25, maxHeight: '80%' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, paddingBottom: 15, borderBottomWidth: 1 },
    modalTitle: { fontSize: 20, fontFamily: 'NotoSans-Black' },

    inputLabel: { fontSize: 14, fontFamily: 'NotoSans-Bold', marginBottom: 8 },
    input: {
        height: 50,
        borderRadius: 12,
        paddingHorizontal: 16,
        fontSize: 15,
        fontFamily: 'NotoSans-Regular'
    },
    amountInput: {
        height: 56,
        borderRadius: 12,
        paddingHorizontal: 16,
        fontSize: 18,
        fontFamily: 'NotoSans-Bold',
        marginBottom: 15
    },

    infoBox: { flexDirection: 'row', gap: 8, padding: 12, backgroundColor: 'rgba(255,152,0,0.1)', borderRadius: 8, marginBottom: 20 },
    infoText: { fontSize: 12, flex: 1, lineHeight: 18 },

    confirmBtn: {
        height: 56,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center'
    },
    confirmBtnText: { color: '#FFF', fontSize: 16, fontFamily: 'NotoSans-Bold' }
});
