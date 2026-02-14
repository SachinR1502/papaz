import { useAuth } from '@/context/AuthContext';
import { useTechnician } from '@/context/TechnicianContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { Alert, Animated, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PayoutsScreen() {
    const router = useRouter();
    const { walletBalance, requestWithdrawal, getWallet } = useTechnician();
    const { currencySymbol } = useAuth();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const colors = {
        background: isDark ? '#000000' : '#F8F9FB',
        card: isDark ? '#1C1C1E' : '#FFFFFF',
        text: isDark ? '#FFFFFF' : '#1A1A1A',
        subText: isDark ? '#A1A1A6' : '#8E8E93',
        border: isDark ? '#2C2C2E' : '#DDD',
        iconBg: isDark ? '#2C2C2E' : '#F5F5F5',
        creditIconBg: isDark ? '#1b3a24' : '#E8F5E9',
        sectionTitle: isDark ? '#FFFFFF' : '#1A1A1A',
    };

    const [transactions, setTransactions] = React.useState<any[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);

    useEffect(() => {
        loadWalletData();
    }, [walletBalance]);

    const loadWalletData = async () => {
        if (typeof getWallet !== 'function') return;

        setIsLoading(true);
        try {
            const data = await getWallet();
            if (data && data.transactions) {
                setTransactions(data.transactions);
            }
        } catch (error) {
            console.error('Failed to load wallet', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleWithdraw = () => {
        Alert.alert('Initiate Settlement', `Transfer ${currencySymbol}${(walletBalance || 0).toFixed(2)} to your linked bank account?`, [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Transfer Now',
                onPress: async () => {
                    try {
                        await requestWithdrawal(walletBalance || 0);
                        Alert.alert('Request Sent', 'Payment usually reflects in 24-48 hours.');
                        loadWalletData();
                    } catch (error) {
                        Alert.alert('Error', 'Withdrawal failed. Please try again.');
                    }
                }
            }
        ]);
    };

    const transactionsList = (transactions || []).map(t => ({
        id: t._id || Math.random().toString(),
        type: t.type === 'settlement' ? 'Debit' : 'Credit',
        amount: Math.abs(t.amount || 0),
        date: t.createdAt ? new Date(t.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'Date N/A',
        desc: t.description || (t.type === 'settlement' ? 'Bank Withdrawal' : 'Service Earnings')
    }));

    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
        }).start();
    }, []);

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="chevron-back" size={24} color="#FFF" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Revenue Settlements</Text>
                <View style={{ width: 40 }} />
            </View>

            <View style={styles.balanceCard}>
                <Text style={styles.balanceLabel}>Available Balance</Text>
                <Text style={styles.balanceAmount}>{currencySymbol}{(walletBalance || 0).toFixed(2)}</Text>
                <TouchableOpacity style={styles.withdrawBtn} onPress={handleWithdraw}>
                    <Text style={styles.withdrawText}>Withdraw to Bank</Text>
                    <Ionicons name="arrow-forward" size={18} color="#000" />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <Animated.View style={{ opacity: fadeAnim }}>
                    <View style={[styles.sectionHeader, { marginTop: 0 }]}>
                        <Text style={[styles.sectionTitle, { color: colors.sectionTitle }]}>Recent Settlements</Text>
                        <TouchableOpacity onPress={loadWalletData}><Text style={styles.seeAll}>Refresh</Text></TouchableOpacity>
                    </View>

                    {isLoading ? (
                        <View style={{ alignItems: 'center', marginTop: 20 }}>
                            <Text style={{ color: colors.subText }}>Loading history...</Text>
                        </View>
                    ) : transactionsList.length === 0 ? (
                        <View style={{ alignItems: 'center', marginTop: 20 }}>
                            <Text style={{ color: colors.subText }}>No transactions yet.</Text>
                        </View>
                    ) : (
                        transactionsList.map((t) => (
                            <View key={t.id} style={[styles.tItem, { backgroundColor: colors.card }]}>
                                <View style={[styles.tIcon, { backgroundColor: t.type === 'Credit' ? colors.creditIconBg : colors.iconBg }]}>
                                    <MaterialCommunityIcons
                                        name={t.type === 'Credit' ? 'arrow-bottom-left' : 'bank-transfer-out'}
                                        size={22}
                                        color={t.type === 'Credit' ? '#34C759' : colors.text}
                                    />
                                </View>
                                <View style={styles.tContent}>
                                    <Text style={[styles.tDesc, { color: colors.text }]}>{t.desc}</Text>
                                    <Text style={[styles.tDate, { color: colors.subText }]}>{t.date}</Text>
                                </View>
                                <Text style={[styles.tAmount, { color: t.type === 'Credit' ? '#34C759' : colors.text }]}>
                                    {t.type === 'Credit' ? '+' : '-'}{currencySymbol}{t.amount.toLocaleString()}
                                </Text>
                            </View>
                        ))
                    )}

                    <View style={[styles.bankCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <View style={styles.bankInfo}>
                            <MaterialCommunityIcons name="bank" size={24} color="#8E8E93" />
                            <View style={{ marginLeft: 15 }}>
                                <Text style={[styles.bankName, { color: colors.text }]}>HDFC Bank Primary</Text>
                                <Text style={[styles.bankAcc, { color: colors.subText }]}>XXXX XXXX 4210</Text>
                            </View>
                        </View>
                        <Ionicons name="checkmark-circle" size={20} color="#34C759" />
                    </View>
                </Animated.View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 15, paddingVertical: 10, backgroundColor: '#1A1A1A' },
    backBtn: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
    headerTitle: { fontSize: 17, fontWeight: 'bold', color: '#FFF' },
    balanceCard: { backgroundColor: '#1A1A1A', padding: 30, borderBottomLeftRadius: 30, borderBottomRightRadius: 30, alignItems: 'center' },
    balanceLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 14, fontWeight: '600' },
    balanceAmount: { color: '#FFF', fontSize: 42, fontWeight: '900', marginVertical: 10 },
    withdrawBtn: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#FFF', paddingHorizontal: 25, paddingVertical: 15, borderRadius: 16, marginTop: 10 },
    withdrawText: { color: '#000', fontSize: 15, fontWeight: 'bold' },
    content: { padding: 20 },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, marginTop: 10 },
    sectionTitle: { fontSize: 16, fontWeight: 'bold' },
    seeAll: { fontSize: 13, color: '#007AFF', fontWeight: '600' },
    tItem: { flexDirection: 'row', alignItems: 'center', padding: 15, borderRadius: 20, marginBottom: 12 },
    tIcon: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
    tContent: { flex: 1 },
    tDesc: { fontSize: 14, fontWeight: 'bold' },
    tDate: { fontSize: 11, marginTop: 3 },
    tAmount: { fontSize: 15, fontWeight: '900' },
    bankCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, borderRadius: 24, marginTop: 20, borderStyle: 'dashed', borderWidth: 1 },
    bankInfo: { flexDirection: 'row', alignItems: 'center' },
    bankName: { fontSize: 14, fontWeight: 'bold' },
    bankAcc: { fontSize: 12, marginTop: 2 },
});
