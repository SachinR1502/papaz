import { Colors } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface TransactionItemProps {
    tx: any;
}

export const TransactionItem = ({ tx }: TransactionItemProps) => {
    const { currencySymbol } = useAuth();
    const colorScheme = useColorScheme();
    const theme = colorScheme ?? 'light';
    const colors = Colors[theme];
    const isDark = theme === 'dark';

    return (
        <View style={[styles.transactionItem, { borderBottomColor: colors.border }]}>
            <View style={[styles.txIcon, {
                backgroundColor: tx.type === 'earnings' ? colors.sales + '20' : colors.notification + '20'
            }]}>
                <Ionicons
                    name={tx.type === 'earnings' ? 'arrow-down' : 'arrow-up'}
                    size={20}
                    color={tx.type === 'earnings' ? colors.sales : colors.notification}
                />
            </View>
            <View style={styles.txDetails}>
                <Text style={[styles.txDesc, { color: colors.text }]}>{tx.description}</Text>
                <Text style={[styles.txDate, { color: colors.icon }]}>
                    {new Date(tx.createdAt).toLocaleDateString()}
                </Text>
            </View>
            <Text style={[styles.txAmount, {
                color: tx.type === 'earnings' ? colors.sales : colors.notification
            }]}>
                {tx.type === 'earnings' ? '+' : '-'}{currencySymbol}{Math.abs(tx.amount).toFixed(2)}
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    transactionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1
    },
    txIcon: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
    txDetails: { flex: 1, marginLeft: 12 },
    txDesc: { fontSize: 14, fontWeight: 'bold' },
    txDate: { fontSize: 12, marginTop: 2 },
    txAmount: { fontSize: 15, fontWeight: '900' },
});
