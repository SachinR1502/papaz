import { Colors } from '@/constants/theme';
import { useLanguage } from '@/context/LanguageContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface InventoryItemCardProps {
    item: any;
    currencySymbol: string;
}

export const InventoryItemCard = ({ item, currencySymbol }: InventoryItemCardProps) => {
    const { t } = useLanguage();
    const router = useRouter();


    const colorScheme = useColorScheme();
    const theme = colorScheme ?? 'light';
    const colors = Colors[theme];
    const isDark = theme === 'dark';

    // Local theme logic (matches parent) instead of full Colors object if needed,
    // but we can use the passed colors or internal logic.
    // Parent used a standard Theme Colors access.

    return (
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.cardHeader}>
                <View style={[styles.iconContainer, { backgroundColor: colors.primary + '15' }]}>
                    <MaterialCommunityIcons
                        name={item.type === 'Car' ? 'car-cog' : 'motorbike'}
                        size={24}
                        color={colors.primary}
                    />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={[styles.productName, { color: colors.text }]}>{t(item.name || 'Unknown Product')}</Text>
                    <Text style={[styles.productType, { color: colors.icon }]}>
                        {item.type ? t(item.type.toLowerCase()) : t('spare_parts')} {t('part')}
                    </Text>
                </View>
                <Text style={[styles.price, { color: colors.text }]}>{currencySymbol}{item.price}</Text>
            </View>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            <View style={styles.cardFooter}>
                <View style={styles.metaItem}>
                    <Ionicons name="cube-outline" size={16} color={colors.icon} />
                    <Text style={[styles.metaText, { color: item.quantity < 5 ? colors.notification : colors.icon }]}>
                        {t('stock')}: <Text style={{ fontWeight: 'bold', color: item.quantity < 5 ? colors.notification : colors.text }}>{item.quantity}</Text>
                    </Text>
                </View>
                <View style={styles.metaItem}>
                    <Ionicons name="time-outline" size={16} color={colors.icon} />
                    <Text style={[styles.metaText, { color: colors.icon }]}>{t(item.deliveryTime)}</Text>
                </View>
                <TouchableOpacity
                    style={[styles.editBtn, { backgroundColor: colors.primary + '15' }]}
                    onPress={() => router.push({
                        pathname: '/(supplier)/inventory/add',
                        params: {
                            id: item.id,
                            name: item.name,
                            type: item.type,
                            price: item.price.toString(),
                            quantity: item.quantity.toString(),
                            deliveryTime: item.deliveryTime
                        }
                    })}
                >
                    <Text style={[styles.editText, { color: colors.primary }]}>{t('edit')}</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: { padding: 16, borderRadius: 20, borderWidth: 1, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 8, elevation: 2 },
    cardHeader: { flexDirection: 'row', alignItems: 'center' },
    iconContainer: { width: 48, height: 48, borderRadius: 16, backgroundColor: '#F0F7FF', justifyContent: 'center', alignItems: 'center' },
    productName: { fontSize: 16, fontWeight: 'bold', marginBottom: 2 },
    productType: { fontSize: 12, fontWeight: '600' },
    price: { fontSize: 18, fontWeight: '900' },
    divider: { height: 1, backgroundColor: '#F0F0F0', marginVertical: 12 },
    cardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    metaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    metaText: { fontSize: 13, fontWeight: '500' },
    editBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
    editText: { fontSize: 12, fontWeight: '700' },
});
