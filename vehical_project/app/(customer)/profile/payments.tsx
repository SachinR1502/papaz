import { PaymentSimulator } from '@/components/ui/PaymentSimulator';
import { Colors } from '@/constants/theme';
import { useAdmin } from '@/context/AdminContext';
import { useCustomer } from '@/context/CustomerContext';
import { useLanguage } from '@/context/LanguageContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React from 'react';
import {
    Alert,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PaymentMethodsScreen() {
    const router = useRouter();
    const { settings } = useAdmin();
    const { profile, topupWallet, removeCard, addCard, transactions, refresh } = useCustomer();
    const { t } = useLanguage();
    const colorScheme = useColorScheme();
    const theme = colorScheme ?? 'light';
    const colors = Colors[theme];
    const isDark = theme === 'dark';

    const [isHistoryVisible, setIsHistoryVisible] = React.useState(false);
    const [isTopupModalVisible, setIsTopupModalVisible] = React.useState(false);
    const [topupAmount, setTopupAmount] = React.useState('1000');
    const [showPaymentSimulator, setShowPaymentSimulator] = React.useState(false);

    const currencySymbol = settings.currency === 'INR' ? '₹' : '$';
    const methods = profile?.savedCards || [];

    const handleAddMoney = () => {
        Haptics.selectionAsync();
        setIsTopupModalVisible(true);
    };

    const handleProceedToPayment = () => {
        const amount = Number(topupAmount);
        if (!amount || amount <= 0) {
            Alert.alert(t("Invalid Amount"), t("Please enter a valid amount"));
            return;
        }
        setIsTopupModalVisible(false);
        setShowPaymentSimulator(true);
    };

    const handlePaymentSuccess = async (referenceId: string, isReal: boolean) => {
        try {
            // Only call topupWallet if it's a mock simulation. 
            // Real payments are verified and credited in the PaymentSimulator component via API.
            if (!isReal) {
                await topupWallet(Number(topupAmount), referenceId);
            } else {
                await refresh(); // Just refresh to see updated balance
            }
            setShowPaymentSimulator(false);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Alert.alert(t("Success"), t("Wallet topped up successfully"));
            setTopupAmount('1000');
        } catch (e) {
            Alert.alert(t("Error"), t("Failed to top up"));
        }
    };

    const handlePaymentFailure = (error: string) => {
        setShowPaymentSimulator(false);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Alert.alert(t("Payment Failed"), error);
    };

    const handleAddCard = async () => {
        try {
            await addCard({
                type: 'visa',
                last4: Math.floor(1000 + Math.random() * 9000).toString(),
                expiry: '12/28',
                brand: 'Visa'
            });
            Alert.alert(t("Success"), t("Card added successfully"));
        } catch (e) {
            Alert.alert(t("Error"), t("Failed to add card"));
        }
    };

    const handleRemoveCard = (id: string) => {
        Alert.alert(
            t("Remove Card"),
            t("Are you sure you want to remove this card?"),
            [
                { text: t("Cancel"), style: "cancel" },
                {
                    text: t("Remove"),
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await removeCard(id);
                        } catch (e) {
                            Alert.alert(t("Error"), t("Failed to remove card"));
                        }
                    }
                }
            ]
        );
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
            <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>{t('Payment Methods')}</Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={[styles.walletCard, { backgroundColor: isDark ? colors.card : '#1A1A1A' }]}>
                    <View style={styles.walletHeader}>
                        <Text style={styles.walletTitle}>{t('PAPAZ Wallet')}</Text>
                        <MaterialCommunityIcons name="wallet-membership" size={24} color="#FFF" />
                    </View>
                    <Text style={[styles.walletBalance, { color: '#FFF' }]}>{currencySymbol} {(profile?.walletBalance || 0).toFixed(2)}</Text>
                    <View style={styles.walletActions}>
                        <TouchableOpacity style={[styles.walletActionBtn, { backgroundColor: 'rgba(255,255,255,0.15)' }]} onPress={handleAddMoney}>
                            <Ionicons name="add-circle" size={20} color="#FFF" />
                            <Text style={[styles.walletActionText, { color: '#FFF' }]}>{t('Add Money')}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.walletActionBtn, { backgroundColor: 'rgba(255,255,255,0.15)' }]} onPress={() => setIsHistoryVisible(true)}>
                            <Ionicons name="time" size={20} color="#FFF" />
                            <Text style={[styles.walletActionText, { color: '#FFF' }]}>{t('History')}</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.icon }]}>{t('Saved Cards')}</Text>
                    {methods.length > 0 ? methods.map((card: any) => (
                        <View key={card._id} style={[styles.paymentCard, { backgroundColor: colors.card }]}>
                            <View style={[styles.cardIcon, { backgroundColor: isDark ? colors.border : '#1A1A1A' }]}>
                                <Ionicons name="card" size={24} color={isDark ? colors.text : "#FFF"} />
                            </View>
                            <View style={styles.cardInfo}>
                                <Text style={[styles.cardNumber, { color: colors.text }]}>•••• •••• •••• {card.last4}</Text>
                                <Text style={[styles.cardExpiry, { color: colors.icon }]}>{t('Expires')} {card.expiry}</Text>
                            </View>
                            <TouchableOpacity onPress={() => handleRemoveCard(card._id)}>
                                <Ionicons name="trash-outline" size={20} color={colors.notification} />
                            </TouchableOpacity>
                        </View>
                    )) : (
                        <Text style={{ textAlign: 'center', color: colors.icon, marginVertical: 20 }}>{t('No saved payment methods')}</Text>
                    )}
                </View>

                <TouchableOpacity style={[styles.addBtn, { backgroundColor: colors.card, borderColor: colors.primary + '40', flexDirection: 'row' }]} onPress={handleAddCard}>
                    <Ionicons name="add" size={20} color={colors.primary} />
                    <Text style={[styles.addBtnText, { color: colors.primary }]}>{t('Add Mock Card')}</Text>
                </TouchableOpacity>
            </ScrollView>

            <Modal visible={isHistoryVisible} animationType="slide" transparent onRequestClose={() => setIsHistoryVisible(false)}>
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: colors.background, borderColor: colors.border }]}>
                        <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
                            <Text style={[styles.modalTitle, { color: colors.text }]}>{t('Transaction History')}</Text>
                            <TouchableOpacity onPress={() => setIsHistoryVisible(false)}>
                                <Ionicons name="close" size={24} color={colors.text} />
                            </TouchableOpacity>
                        </View>
                        <ScrollView style={{ maxHeight: 400 }}>
                            {transactions.length > 0 ? transactions.map((tx: any) => (
                                <View key={tx._id} style={[styles.historyItem, { borderBottomColor: colors.border }]}>
                                    <View>
                                        <Text style={[styles.historyDesc, { color: colors.text }]}>{tx.description}</Text>
                                        <Text style={[styles.historyDate, { color: colors.icon }]}>{new Date(tx.createdAt).toLocaleDateString()}</Text>
                                    </View>
                                    <Text style={[styles.historyAmount, { color: tx.type === 'topup' ? colors.sales : colors.notification }]}>
                                        {tx.type === 'topup' ? '+' : '-'}{currencySymbol}{tx.amount.toFixed(2)}
                                    </Text>
                                </View>
                            )) : (
                                <Text style={{ textAlign: 'center', color: colors.icon, padding: 20 }}>{t('No transactions yet')}</Text>
                            )}
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            {/* Top-up Amount Modal */}
            <Modal visible={isTopupModalVisible} animationType="slide" transparent onRequestClose={() => setIsTopupModalVisible(false)}>
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: colors.background, borderColor: colors.border }]}>
                        <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
                            <Text style={[styles.modalTitle, { color: colors.text }]}>{t('Top Up Wallet')}</Text>
                            <TouchableOpacity onPress={() => setIsTopupModalVisible(false)}>
                                <Ionicons name="close" size={24} color={colors.text} />
                            </TouchableOpacity>
                        </View>

                        <View style={{ paddingVertical: 20 }}>
                            <Text style={[styles.inputLabel, { color: colors.icon }]}>{t('Enter Amount')}</Text>
                            <TextInput
                                style={[styles.amountInput, { backgroundColor: isDark ? colors.border : '#F5F5F5', color: colors.text }]}
                                placeholder="1000"
                                placeholderTextColor={colors.icon}
                                keyboardType="numeric"
                                value={topupAmount}
                                onChangeText={setTopupAmount}
                            />

                            <View style={styles.quickAmounts}>
                                {[500, 1000, 2000, 5000].map(amt => (
                                    <TouchableOpacity
                                        key={amt}
                                        style={[styles.quickAmountBtn, {
                                            backgroundColor: topupAmount === amt.toString() ? colors.primary : colors.card,
                                            borderColor: topupAmount === amt.toString() ? colors.primary : colors.border
                                        }]}
                                        onPress={() => {
                                            Haptics.selectionAsync();
                                            setTopupAmount(amt.toString());
                                        }}
                                    >
                                        <Text style={[styles.quickAmountText, {
                                            color: topupAmount === amt.toString() ? '#FFF' : colors.text
                                        }]}>
                                            {currencySymbol}{amt}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <TouchableOpacity
                                style={[styles.proceedBtn, { backgroundColor: colors.primary }]}
                                onPress={handleProceedToPayment}
                            >
                                <Text style={styles.proceedBtnText}>{t('Proceed to Payment')}</Text>
                                <Ionicons name="arrow-forward" size={20} color="#FFF" />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Payment Simulator */}
            <PaymentSimulator
                visible={showPaymentSimulator}
                amount={Number(topupAmount)}
                type="topup"
                onSuccess={handlePaymentSuccess}
                onCancel={() => setShowPaymentSimulator(false)}
                onFailure={handlePaymentFailure}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FE' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: '#FFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F2F2F7'
    },
    backBtn: { width: 44, height: 44, justifyContent: 'center' },
    headerTitle: { fontSize: 18, fontFamily: 'NotoSans-Bold', color: '#1A1A1A' },
    scrollContent: { padding: 20 },
    section: { marginBottom: 30 },
    sectionTitle: { fontSize: 14, fontFamily: 'NotoSans-Bold', color: '#8E8E93', textTransform: 'uppercase', marginBottom: 15, marginLeft: 5 },
    paymentCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        padding: 16,
        borderRadius: 20,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2
    },
    cardIcon: { width: 48, height: 48, borderRadius: 12, backgroundColor: '#1A1A1A', justifyContent: 'center', alignItems: 'center' },
    cardInfo: { flex: 1, marginLeft: 15 },
    cardNumber: { fontSize: 16, fontFamily: 'NotoSans-Bold', color: '#1A1A1A' },
    cardExpiry: { fontSize: 12, color: '#8E8E93', marginTop: 2 },
    addBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        backgroundColor: '#F0F7FF',
        padding: 18,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#007AFF33',
        borderStyle: 'dashed'
    },
    addBtnText: { color: '#007AFF', fontSize: 16, fontFamily: 'NotoSans-Bold' },

    walletCard: {
        backgroundColor: '#1A1A1A',
        borderRadius: 24,
        padding: 24,
        marginBottom: 30,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
        elevation: 8
    },
    walletHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
    walletTitle: { color: '#8E8E93', fontSize: 14, fontFamily: 'NotoSans-Bold', textTransform: 'uppercase' },
    walletBalance: { color: '#FFF', fontSize: 32, fontFamily: 'NotoSans-Black', marginBottom: 20 },
    walletActions: { flexDirection: 'row', gap: 15 },
    walletActionBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12 },
    walletActionText: { color: '#FFF', fontSize: 13, fontFamily: 'NotoSans-Bold' },

    // Modal & History Styles
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 25, maxHeight: '80%' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, paddingBottom: 15, borderBottomWidth: 1 },
    modalTitle: { fontSize: 20, fontFamily: 'NotoSans-Black' },
    historyItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1 },
    historyDesc: { fontSize: 15, fontFamily: 'NotoSans-Bold' },
    historyDate: { fontSize: 12, marginTop: 2, fontFamily: 'NotoSans-Regular' },
    historyAmount: { fontSize: 16, fontFamily: 'NotoSans-Black' },

    // Top-up Modal Styles
    inputLabel: { fontSize: 14, fontFamily: 'NotoSans-Bold', marginBottom: 10 },
    amountInput: {
        height: 56,
        borderRadius: 12,
        paddingHorizontal: 16,
        fontSize: 18,
        fontFamily: 'NotoSans-Bold',
        marginBottom: 20,
    },
    quickAmounts: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 20,
    },
    quickAmountBtn: {
        flex: 1,
        minWidth: '45%',
        height: 48,
        borderRadius: 12,
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    quickAmountText: {
        fontSize: 16,
        fontFamily: 'NotoSans-Bold',
    },
    proceedBtn: {
        height: 56,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
    },
    proceedBtnText: {
        color: '#FFF',
        fontSize: 16,
        fontFamily: 'NotoSans-Bold',
    },
});
