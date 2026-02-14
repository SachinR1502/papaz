import { StatusBadge } from '@/components/ui/StatusBadge';
import { Colors } from '@/constants/theme';
import { useAdmin } from '@/context/AdminContext';
import { useLanguage } from '@/context/LanguageContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { customerService } from '@/services/customerService';
import { getMediaUrl } from '@/utils/mediaHelpers';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    FlatList,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function MyOrdersScreen() {
    const router = useRouter();
    const { settings } = useAdmin();
    const { t } = useLanguage();
    const colorScheme = useColorScheme();
    const theme = colorScheme ?? 'light';
    const colors = Colors[theme];
    const isDark = theme === 'dark';
    const currencySymbol = settings.currency === 'INR' ? '₹' : '$';

    const [orders, setOrders] = useState<any[]>([]);

    useEffect(() => {
        loadOrders();
    }, []);

    const loadOrders = async () => {
        try {
            const data = await customerService.getOrders();
            setOrders(data.map((o: any) => ({
                id: o.orderId || o._id,
                originalId: o._id,
                date: new Date(o.createdAt).toLocaleDateString(),
                total: o.totalAmount.toString(),
                status: o.status.charAt(0).toUpperCase() + o.status.slice(1),
                items: o.items.map((i: any) => i.name).join(', '),
                image: o.items[0]?.image || 'https://via.placeholder.com/200'
            })));
        } catch (e) {
            console.error(e);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Delivered': return colors.sales;
            case 'On the way': return colors.customers;
            default: return colors.icon;
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
            <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>{t('My Orders')}</Text>
                <View style={{ width: 44 }} />
            </View>

            <FlatList
                data={orders}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContent}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={[styles.orderCard, { backgroundColor: colors.card }]}
                        onPress={() => router.push(`/(customer)/order/${item.originalId}`)}
                    >
                        <Image source={{ uri: getMediaUrl(item.image) || '' }} style={[styles.orderImage, { backgroundColor: colors.background }]} />
                        <View style={styles.orderInfo}>
                            <View style={styles.orderRow}>
                                <Text style={[styles.orderId, { color: colors.text }]}>{item.id}</Text>
                                <Text style={[styles.orderDate, { color: colors.icon }]}>{item.date}</Text>
                            </View>
                            <Text style={[styles.orderItems, { color: colors.icon }]} numberOfLines={1}>{item.items}</Text>
                            <View style={styles.orderRow}>
                                <Text style={[styles.orderTotal, { color: colors.text }]}>{currencySymbol}{parseInt(item.total).toLocaleString()}</Text>
                                <StatusBadge status={item.status.toLowerCase()} />
                            </View>
                        </View>
                    </TouchableOpacity>
                )}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="receipt-outline" size={80} color={colors.icon} />
                        <Text style={[styles.emptyText, { color: colors.icon }]}>{t('No orders yet')}</Text>
                    </View>
                }
                extraData={theme}
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
    listContent: { padding: 20 },
    orderCard: {
        backgroundColor: '#FFF',
        borderRadius: 24,
        padding: 15,
        flexDirection: 'row',
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.03,
        shadowRadius: 10,
        elevation: 2
    },
    orderImage: { width: 80, height: 80, borderRadius: 16, backgroundColor: '#F8F9FE' },
    orderInfo: { flex: 1, marginLeft: 15, justifyContent: 'space-between' },
    orderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    orderId: { fontSize: 15, fontFamily: 'NotoSans-Bold', color: '#1A1A1A' },
    orderDate: { fontSize: 12, color: '#8E8E93', fontFamily: 'NotoSans-Regular' },
    orderItems: { fontSize: 13, color: '#8E8E93', marginTop: 4 },
    orderTotal: { fontSize: 16, fontFamily: 'NotoSans-Black', color: '#1A1A1A' },
    statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, gap: 6 },
    statusDot: { width: 6, height: 6, borderRadius: 3 },
    statusText: { fontSize: 11, fontFamily: 'NotoSans-Bold' },
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 100 },
    emptyText: { fontSize: 18, fontFamily: 'NotoSans-Bold', color: '#8E8E93', marginTop: 20 }
});
