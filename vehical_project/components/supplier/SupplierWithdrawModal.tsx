import { Colors } from '@/constants/theme';
import { useLanguage } from '@/context/LanguageContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface SupplierWithdrawModalProps {
    visible: boolean;
    onClose: () => void;
    onWithdraw: (amount: number) => Promise<void>;
    walletBalance: number;
    currencySymbol: string;
}

export const SupplierWithdrawModal = ({
    visible,
    onClose,
    onWithdraw,
    walletBalance,
    currencySymbol
}: SupplierWithdrawModalProps) => {
    const { t } = useLanguage();
    const colorScheme = useColorScheme();
    const theme = colorScheme ?? 'light';
    const colors = Colors[theme];
    const isDark = theme === 'dark';

    const [withdrawAmount, setWithdrawAmount] = useState('');

    const handleWithdraw = async () => {
        const amount = parseFloat(withdrawAmount);
        if (!amount || isNaN(amount) || amount <= 0) {
            alert(t('invalid_amount') || 'Invalid amount');
            return;
        }
        if (amount > walletBalance) {
            alert(t('insufficient_balance') || 'Insufficient balance');
            return;
        }

        try {
            await onWithdraw(amount);
            onClose();
            setWithdrawAmount('');
            alert(t('payout_initiated_success') || 'Withdrawal initiated successfully');
        } catch (e) {
            console.error(e);
            alert(t('payout_failed') || 'Withdrawal failed');
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
                <View style={[styles.detailsContainer, { backgroundColor: colors.card }]}>
                    <View style={styles.modalHeader}>
                        <Text style={[styles.modalTitle, { color: colors.text }]}>{t('withdraw_funds')}</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close-circle" size={30} color={colors.icon} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.balanceRow}>
                        <Text style={[styles.balanceLabel, { color: colors.icon }]}>{t('available_balance')}</Text>
                        <Text style={[styles.balanceValue, { color: colors.text }]}>{currencySymbol}{walletBalance.toFixed(0)}</Text>
                    </View>

                    <TouchableOpacity style={[styles.bankSelect, { backgroundColor: isDark ? colors.background : '#F8F9FE', borderColor: colors.border }]}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                            <View style={styles.bankIcon}>
                                <Ionicons name="business" size={24} color="#007AFF" />
                            </View>
                            <View>
                                <Text style={[styles.bankName, { color: colors.text }]}>HDFC Bank •••• 4589</Text>
                                <Text style={[styles.bankSub, { color: colors.icon }]}>{t('primary_account')}</Text>
                            </View>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
                    </TouchableOpacity>

                    <Text style={[styles.inputLabel, { color: colors.text }]}>{t('amount_withdraw')}</Text>
                    <View style={[styles.inputWrapper, { backgroundColor: isDark ? colors.background : '#F8F9FE', borderColor: colors.border }]}>
                        <Text style={[styles.currencySymbol, { color: colors.text }]}>{currencySymbol}</Text>
                        <TextInput
                            style={[styles.withdrawInput, { color: colors.text }]}
                            value={withdrawAmount}
                            onChangeText={setWithdrawAmount}
                            placeholder="0"
                            keyboardType="numeric"
                            placeholderTextColor="#C7C7CC"
                        />
                    </View>

                    <TouchableOpacity
                        style={styles.confirmBtn}
                        onPress={handleWithdraw}
                    >
                        <Text style={styles.confirmBtnText}>{t('confirm_withdrawal')}</Text>
                        <Ionicons name="arrow-forward" size={20} color="#FFF" />
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
    detailsContainer: {
        backgroundColor: '#FFF',
        borderTopLeftRadius: 40,
        borderTopRightRadius: 40,
        padding: 24,
        height: '85%',
        width: '100%',
    },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
    modalTitle: { fontSize: 26, fontWeight: 'bold' },
    balanceRow: { alignItems: 'center', marginBottom: 40, marginTop: 20 },
    balanceLabel: { fontSize: 14, fontWeight: '600', marginBottom: 8, letterSpacing: 1 },
    balanceValue: { fontSize: 42, fontWeight: '900' },
    bankSelect: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderRadius: 24,
        marginBottom: 30,
        borderWidth: 1,
    },
    bankIcon: { width: 48, height: 48, borderRadius: 16, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4 },
    bankName: { fontSize: 16, fontWeight: 'bold' },
    bankSub: { fontSize: 13, marginTop: 2 },
    inputLabel: { fontSize: 14, fontWeight: 'bold', marginBottom: 15 },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 20,
        paddingHorizontal: 20,
        height: 70,
        marginBottom: 40,
        borderWidth: 1,
    },
    currencySymbol: { fontSize: 24, fontWeight: 'bold', marginRight: 10 },
    withdrawInput: { flex: 1, fontSize: 24, fontWeight: 'bold', height: '100%' },
    confirmBtn: {
        backgroundColor: '#1A1A1A',
        height: 64,
        borderRadius: 22,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 20,
        elevation: 5,
        marginTop: 'auto',
        marginBottom: 20,
    },
    confirmBtnText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
});
