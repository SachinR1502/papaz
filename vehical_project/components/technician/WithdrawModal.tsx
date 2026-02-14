import { Colors } from '@/constants/theme';
import { useLanguage } from '@/context/LanguageContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Alert, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface WithdrawModalProps {
    visible: boolean;
    onClose: () => void;
    onWithdraw: (amount: number) => Promise<void>;
    walletBalance: number;
    currencySymbol: string;
}

export const WithdrawModal = ({ visible, onClose, onWithdraw, walletBalance, currencySymbol }: WithdrawModalProps) => {
    const { t } = useLanguage();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const themeColors = Colors[colorScheme ?? 'light'];

    // Local colors map to match original design or theme
    const colors = {
        background: isDark ? '#000000' : '#FFFFFF',
        text: isDark ? '#FFFFFF' : '#1A1A1A',
        subText: isDark ? '#A1A1A6' : '#8E8E93',
        card: isDark ? '#1C1C1E' : '#FFFFFF',
        border: isDark ? '#2C2C2E' : '#F5F5F7',
        iconBg: isDark ? '#2C2C2E' : '#FFFFFF',
        shadow: '#000',
    };

    const [withdrawAmount, setWithdrawAmount] = useState('');
    const [loading, setLoading] = useState(false);

    const handleConfirm = async () => {
        const amount = parseFloat(withdrawAmount);
        if (!amount || isNaN(amount) || amount <= 0) {
            return Alert.alert(t('error'), t('invalid_amount') || 'Invalid amount');
        }
        if (amount > walletBalance) {
            return Alert.alert(t('error'), t('insufficient_balance') || 'Insufficient balance');
        }

        setLoading(true);
        try {
            await onWithdraw(amount);
            setWithdrawAmount('');
            onClose();
            Alert.alert(t('success'), t('payout_initiated_success'));
        } catch (e) {
            Alert.alert(t('error'), t('payout_failed') || 'Payout failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={[styles.detailsContainer, { backgroundColor: colors.background }]}>
                    <View style={styles.modalHeader}>
                        <Text style={[styles.modalTitle, { color: colors.text }]}>{t('settle_funds')}</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close-circle" size={30} color={colors.subText} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.balanceRow}>
                        <Text style={[styles.balanceLabel, { color: colors.subText }]}>{t('available_payout')}</Text>
                        <Text style={[styles.balanceValue, { color: colors.text }]}>{currencySymbol}{(walletBalance || 0).toFixed(0)}</Text>
                    </View>

                    <TouchableOpacity style={[styles.bankSelect, { backgroundColor: isDark ? colors.card : '#F8F9FE', borderColor: colors.border }]}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                            <View style={[styles.bankIcon, { backgroundColor: isDark ? colors.iconBg : '#FFF', shadowColor: colors.shadow }]}>
                                <Ionicons name="business" size={24} color="#007AFF" />
                            </View>
                            <View>
                                <Text style={[styles.bankName, { color: colors.text }]}>HDFC Bank •••• 9988</Text>
                                <Text style={[styles.bankSub, { color: colors.subText }]}>{t('primary_checkin')}</Text>
                            </View>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={colors.subText} />
                    </TouchableOpacity>

                    <Text style={[styles.inputLabel, { color: colors.text }]}>{t('payout_amount')}</Text>
                    <View style={[styles.inputWrapper, { backgroundColor: isDark ? colors.card : '#F8F9FE', borderColor: colors.border }]}>
                        <Text style={[styles.currencySymbol, { color: colors.text }]}>{currencySymbol}</Text>
                        <TextInput
                            style={[styles.withdrawInput, { color: colors.text }]}
                            value={withdrawAmount}
                            onChangeText={setWithdrawAmount}
                            placeholder="0"
                            keyboardType="numeric"
                            placeholderTextColor={colors.subText}
                            editable={!loading}
                        />
                    </View>

                    <TouchableOpacity
                        style={[styles.confirmBtn, { backgroundColor: colors.text, opacity: loading ? 0.7 : 1 }]}
                        onPress={handleConfirm}
                        disabled={loading}
                    >
                        <Text style={[styles.confirmBtnText, { color: colors.background }]}>
                            {loading ? t('processing') : t('confirm_payout')}
                        </Text>
                        {!loading && <Ionicons name="arrow-forward" size={20} color={colors.background} />}
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    detailsContainer: { borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 25, paddingBottom: 50 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
    modalTitle: { fontSize: 24, fontFamily: 'NotoSans-Bold' },
    balanceRow: { alignItems: 'center', marginBottom: 30 },
    balanceLabel: { fontSize: 13, fontFamily: 'NotoSans-Medium', textTransform: 'uppercase', letterSpacing: 1 },
    balanceValue: { fontSize: 42, fontFamily: 'NotoSans-Black', marginTop: 8 },
    bankSelect: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderRadius: 20, borderWidth: 1, marginBottom: 25 },
    bankIcon: { width: 48, height: 48, borderRadius: 16, justifyContent: 'center', alignItems: 'center', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 4 },
    bankName: { fontSize: 16, fontFamily: 'NotoSans-Bold' },
    bankSub: { fontSize: 12, marginTop: 2, fontFamily: 'NotoSans-Medium' },
    inputLabel: { fontSize: 14, fontFamily: 'NotoSans-Bold', marginBottom: 12, marginLeft: 6 },
    inputWrapper: { flexDirection: 'row', alignItems: 'center', height: 60, borderRadius: 20, paddingHorizontal: 20, borderWidth: 1, marginBottom: 30 },
    currencySymbol: { fontSize: 24, fontFamily: 'NotoSans-Bold', marginRight: 10 },
    withdrawInput: { flex: 1, fontSize: 24, fontFamily: 'NotoSans-Bold' },
    confirmBtn: { height: 60, borderRadius: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12 },
    confirmBtnText: { fontSize: 16, fontFamily: 'NotoSans-Bold' },
});
