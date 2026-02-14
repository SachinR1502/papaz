import { Colors } from '@/constants/theme';
import { useLanguage } from '@/context/LanguageContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface WholesaleSummaryCardProps {
    request: any;
    index: number;
}

export const WholesaleSummaryCard = ({ request, index }: WholesaleSummaryCardProps) => {
    const { t } = useLanguage();
    const router = useRouter();
    const colorScheme = useColorScheme();
    const theme = colorScheme ?? 'light';
    const colors = Colors[theme];
    const isDark = theme === 'dark';

    return (
        <TouchableOpacity
            style={[styles.wholesaleCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => router.push('/(supplier)/(tabs)/orders')}
        >
            <View style={styles.wholesaleHeader}>
                <View style={[styles.garageChip, { backgroundColor: colors.revenue + '20' }]}>
                    <Ionicons name="construct" size={12} color={colors.revenue} />
                    <Text style={[styles.garageName, { color: colors.revenue }]}>{request.technicianName}</Text>
                </View>
                <View style={[styles.itemCountBadge, { backgroundColor: isDark ? colors.background : '#F8F9FE' }]}>
                    <Text style={styles.itemCountText}>{request.items.length} {t('items_caps')}</Text>
                </View>
            </View>
            <Text style={[styles.wholesalePreview, { color: colors.text }]} numberOfLines={2}>
                {request.items.map((i: any) => i.name).join(', ')}
            </Text>
            <View style={[styles.wholesaleFooter, { borderTopColor: colors.border }]}>
                <Text style={styles.orderIdText}>{request.id}</Text>
                <TouchableOpacity style={styles.viewDetailedBtn}>
                    <Text style={[styles.viewDetailedText, { color: colors.revenue }]}>{t('quote_now')}</Text>
                    <Ionicons name="arrow-forward" size={14} color={colors.revenue} />
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    wholesaleCard: { width: 280, borderRadius: 24, padding: 20, borderWidth: 1, marginRight: 15, shadowColor: '#5856D6', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
    wholesaleHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
    garageChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10, gap: 5 },
    garageName: { fontSize: 11, fontWeight: 'bold' },
    itemCountBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
    itemCountText: { fontSize: 10, fontWeight: '800', color: '#8E8E93' },
    wholesalePreview: { fontSize: 14, fontWeight: '600', lineHeight: 20, height: 40, marginBottom: 15 },
    wholesaleFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, paddingTop: 15 },
    orderIdText: { fontSize: 11, color: '#C7C7CC', fontWeight: 'bold' },
    viewDetailedBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    viewDetailedText: { fontSize: 13, fontWeight: 'bold' }
});
