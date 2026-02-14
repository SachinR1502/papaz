import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface BankCardProps {
    account: any;
}

export const BankCard = ({ account }: BankCardProps) => {
    const colorScheme = useColorScheme();
    const theme = colorScheme ?? 'light';
    const colors = Colors[theme];
    const isDark = theme === 'dark';

    return (
        <View style={[styles.bankCard, { backgroundColor: colors.card }]}>
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
    );
};

const styles = StyleSheet.create({
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
    bankName: { fontSize: 15, fontWeight: 'bold' },
    accountNumber: { fontSize: 13, marginTop: 2 },
    ifsc: { fontSize: 11, marginTop: 2 },
    defaultBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
    defaultText: { fontSize: 10, fontWeight: 'bold' },
});
