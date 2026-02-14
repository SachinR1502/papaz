import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface ReportTransactionListProps {
    transactions: any[];
    currencySymbol: string;
}

export const ReportTransactionList = ({ transactions, currencySymbol }: ReportTransactionListProps) => {
    const colorScheme = useColorScheme();
    const theme = colorScheme ?? 'light';
    const colors = Colors[theme];

    return (
        <View style={[styles.listCard, { backgroundColor: colors.card }]}>
            {transactions.length > 0 ? (
                transactions.slice(0, 20).map((t, i) => {
                    const isCredit = ['payment', 'topup', 'earnings'].includes(t.type);
                    const typeLabel = t.type.charAt(0).toUpperCase() + t.type.slice(1);

                    return (
                        <React.Fragment key={t._id || t.id || i}>
                            <View style={styles.transactionRow}>
                                <View style={[styles.tIcon, { backgroundColor: isCredit ? '#34C75915' : '#FF3B3015' }]}>
                                    <MaterialCommunityIcons
                                        name={isCredit ? 'arrow-bottom-left' : 'arrow-top-right'}
                                        size={20}
                                        color={isCredit ? '#34C759' : '#FF3B30'}
                                    />
                                </View>
                                <View style={{ flex: 1, paddingHorizontal: 12 }}>
                                    <Text style={[styles.tDesc, { color: colors.text }]} numberOfLines={1}>
                                        {t.description || `${typeLabel} Transaction`}
                                    </Text>
                                    <Text style={[styles.tDate, { color: colors.icon }]}>
                                        {new Date(t.createdAt).toLocaleDateString()} • {typeLabel}
                                    </Text>
                                </View>
                                <Text style={[styles.tAmount, { color: isCredit ? '#34C759' : colors.text }]}>
                                    {isCredit ? '+' : '-'}{currencySymbol}{Math.abs(t.amount).toLocaleString()}
                                </Text>
                            </View>
                            {i < transactions.slice(0, 20).length - 1 && <View style={[styles.divider, { backgroundColor: colors.border }]} />}
                        </React.Fragment>
                    );
                })
            ) : (
                <View style={{ padding: 20, alignItems: 'center' }}>
                    <Text style={{ color: colors.icon }}>No recent transactions.</Text>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    listCard: { borderRadius: 20, padding: 8 },
    transactionRow: { flexDirection: 'row', alignItems: 'center', padding: 12 },
    tIcon: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
    tDesc: { fontSize: 14, fontWeight: '600' },
    tDate: { fontSize: 12, marginTop: 2 },
    tAmount: { fontSize: 14, fontWeight: '700' },
    divider: { height: 1, marginHorizontal: 20 },
});
