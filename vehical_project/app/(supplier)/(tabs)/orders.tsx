import { QuotationModal } from '@/components/supplier/QuotationModal';
import { DeliveryModal } from '@/components/supplier/DeliveryModal';
import { SupplierOrderCard } from '@/components/supplier/SupplierOrderCard';
import { WholesaleOrderCard } from '@/components/supplier/WholesaleOrderCard';
import { ImageModal } from '@/components/ui/ImageModal';
import { Colors } from '@/constants/theme';
import { useAdmin } from '@/context/AdminContext';
import { useLanguage } from '@/context/LanguageContext';
import { useSupplier } from '@/context/SupplierContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { socketService } from '@/services/socket';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Dimensions, FlatList, KeyboardAvoidingView, Modal, Platform, RefreshControl, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { height } = Dimensions.get('window');

export default function SupplierOrdersScreen() {
    const { orders, wholesaleOrders, updateOrder, sendQuotation, refreshData, isLoading } = useSupplier();
    const [selectedTab, setSelectedTab] = useState<'standard' | 'wholesale'>('standard');
    const { settings } = useAdmin();
    const { t } = useLanguage();
    const router = useRouter();
    const colorScheme = useColorScheme();

    const currencySymbol = settings.currency === 'INR' ? '₹' : '$';
    const theme = colorScheme ?? 'light';
    const colors = Colors[theme];
    const isDark = theme === 'dark';
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    // Quotation Modal State
    const [isQuoteModalVisible, setIsQuoteModalVisible] = useState(false);
    const [quoteOrder, setQuoteOrder] = useState<any>(null);
    const [initialQuoteItems, setInitialQuoteItems] = useState<any[]>([]);

    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    // Delivery Modal State
    const [showDeliveryModal, setShowDeliveryModal] = useState(false);
    const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
    const [initialDeliveryData, setInitialDeliveryData] = useState<any>(null);

    useEffect(() => {
        const socket = socketService.connect();
        const handleUpdate = (data: any) => {
            console.log('Supplier Order Update:', data);
            refreshData();
        };

        socketService.on('order_update', handleUpdate);
        return () => { socketService.off('order_update', handleUpdate); };
    }, []);

    useEffect(() => {
        if (selectedTab === 'wholesale') {
            refreshData();
        }
    }, [selectedTab]);


    const openDeliveryModal = (order: any) => {
        setSelectedOrderId(order.id);
        setInitialDeliveryData(order.deliveryDetails);
        setShowDeliveryModal(true);
    };

    const handleAction = async (orderId: string, action: string, status?: string, data?: any) => {
        setActionLoading(orderId);
        await updateOrder(orderId, action, status, data);
        setActionLoading(null);
    };

    const handleConfirmDelivery = async (data: any) => {
        if (!selectedOrderId) return;
        const currentOrder = orders.find(o => o.id === selectedOrderId) || wholesaleOrders.find(o => o.id === selectedOrderId);
        const statusToUse = (currentOrder?.status === 'packed' || currentOrder?.status === 'accepted') ? 'out_for_delivery' : currentOrder?.status || 'out_for_delivery';

        await handleAction(selectedOrderId, 'update_status', statusToUse, { deliveryDetails: data });
        setShowDeliveryModal(false);
        setSelectedOrderId(null);
    };

    const handleQuote = (item: any) => {
        setQuoteOrder(item);
        let items = [];
        if (item.items && item.items.length > 0) {
            items = item.items.map((i: any) => ({
                id: Math.random().toString(36).substr(2, 9),
                name: i.name || '',
                quantity: (i.quantity || i.qty || 1).toString(),
                price: (i.price || i.amount || 0).toString(),
                originalItem: i
            }));
        } else {
            items = [{
                id: Math.random().toString(36).substr(2, 9),
                name: item.partName || item.name || '',
                quantity: (item.quantity || item.qty || 1).toString(),
                price: (item.price || item.amount || 0).toString(),
                originalItem: item
            }];
        }
        setInitialQuoteItems(items);
        setIsQuoteModalVisible(true);
    };

    const handleSubmitQuote = async (items: any[], totalAmount: number) => {
        if (!quoteOrder) return;
        const orderId = quoteOrder.id;
        setActionLoading(orderId);

        try {
            const itemsToSubmit = items.map(item => ({
                ...(item.originalItem || {}),
                name: item.name,
                quantity: parseFloat(item.quantity),
                price: parseFloat(item.price)
            }));
            await sendQuotation(orderId, itemsToSubmit, totalAmount);
            setIsQuoteModalVisible(false);
            Alert.alert(t('success') || 'Success', t('quote_sent_success') || 'Quotation submitted successfully');
        } catch (e) {
            console.error('Send quote error:', e);
            Alert.alert(t('error') || 'Error', t('failed_to_send_quote') || 'Failed to send quotation');
        } finally {
            setActionLoading(null);
            setQuoteOrder(null);
        }
    };

    const renderItem = ({ item }: { item: any }) => {
        if (selectedTab === 'wholesale') {
            return (
                <WholesaleOrderCard
                    item={item}
                    onQuote={handleQuote}
                    onViewImage={setSelectedImage}
                    onAction={handleAction}
                    actionLoading={actionLoading}
                    onView={() => router.push(`/(supplier)/order/${item.id}`)}
                />
            );
        }

        return (
            <SupplierOrderCard
                item={item}
                currencySymbol={currencySymbol}
                actionLoading={actionLoading}
                onAction={handleAction}
                onQuote={handleQuote}
                onOpenDeliveryModal={openDeliveryModal}
                onViewImage={setSelectedImage}
                onView={() => router.push(`/(supplier)/order/${item.id}`)}
            />
        );
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
            <View style={styles.bgBlob1} />
            <View style={styles.bgBlob2} />

            <View style={styles.header}>
                <Text style={[styles.title, { color: colors.text }]}>{t('orders_title')}</Text>
                <View style={[styles.tabContainer, { backgroundColor: isDark ? colors.card : '#F2F2F7' }]}>
                    <TouchableOpacity
                        style={[styles.tab, selectedTab === 'standard' && (isDark ? { backgroundColor: colors.primary + '20' } : styles.activeTab)]}
                        onPress={() => setSelectedTab('standard')}
                    >
                        <Text style={[styles.tabText, selectedTab === 'standard' && { color: isDark ? colors.primary : '#1A1A1A' }]}>{t('tab_standard')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, selectedTab === 'wholesale' && (isDark ? { backgroundColor: colors.primary + '20' } : styles.activeTab)]}
                        onPress={() => setSelectedTab('wholesale')}
                    >
                        <Text style={[styles.tabText, selectedTab === 'wholesale' && { color: isDark ? colors.primary : '#1A1A1A' }]}>{t('wholesale')}</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <FlatList
                data={selectedTab === 'standard' ? orders : wholesaleOrders}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.list}
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refreshData} />}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <View style={[styles.emptyIconBg, { backgroundColor: colors.card }]}>
                            <Ionicons name="documents-outline" size={48} color={colors.primary} />
                        </View>
                        <Text style={[styles.emptyText, { color: colors.text }]}>{t('no_recent_orders')}</Text>
                        <Text style={[styles.emptySub, { color: colors.icon }]}>{t('no_orders_sub')}</Text>
                    </View>
                }
            />

            {/* Quotation Modal */}
            <QuotationModal
                visible={isQuoteModalVisible}
                onClose={() => setIsQuoteModalVisible(false)}
                onSubmit={handleSubmitQuote}
                initialItems={initialQuoteItems}
                order={quoteOrder}
                currencySymbol={currencySymbol}
                loading={actionLoading === quoteOrder?.id}
            />

            {/* Delivery Details Modal */}
            <DeliveryModal
                visible={showDeliveryModal}
                onClose={() => setShowDeliveryModal(false)}
                onSubmit={handleConfirmDelivery}
                initialData={initialDeliveryData}
                loading={!!actionLoading}
            />

            {/* Image Viewer Modal */}
            <ImageModal
                visible={!!selectedImage}
                uri={selectedImage || ''}
                onClose={() => setSelectedImage(null)}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, position: 'relative', overflow: 'hidden' },
    bgBlob1: { position: 'absolute', top: -100, right: -100, width: 300, height: 300, borderRadius: 150, backgroundColor: '#34C75905', zIndex: -1 },
    bgBlob2: { position: 'absolute', bottom: 100, left: -100, width: 250, height: 250, borderRadius: 125, backgroundColor: '#FF6B0005', zIndex: -1 },

    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, paddingBottom: 10 },
    title: { fontSize: 28, fontWeight: '900', letterSpacing: -0.5 },
    filterBadge: { paddingHorizontal: 12, paddingVertical: 6, backgroundColor: '#F2F2F7', borderRadius: 20 },
    filterText: { fontSize: 13, fontWeight: '600', color: '#1A1A1A' },

    list: { padding: 20, paddingBottom: 120 },

    emptyContainer: { alignItems: 'center', marginTop: 100, paddingHorizontal: 40 },
    emptyIconBg: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#F0F7FF', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
    emptyText: { fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
    emptySub: { fontSize: 14, textAlign: 'center', lineHeight: 20 },

    // Tabs
    tabContainer: { flexDirection: 'row', borderRadius: 12, padding: 4, width: 220 },
    tab: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 8 },
    activeTab: { backgroundColor: '#FFF', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
    tabText: { fontSize: 13, fontWeight: '600', color: '#8E8E93' },
    activeTabText: { color: '#1A1A1A' },

    // Modal Styles
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 25, maxHeight: '80%', borderWidth: 1 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, paddingBottom: 15, borderBottomWidth: 1 },
    modalTitle: { fontSize: 20, fontFamily: 'NotoSans-Black' },
    modalBody: { paddingBottom: 20 },
    inputLabel: { fontSize: 14, fontFamily: 'NotoSans-Bold', marginBottom: 8 },
    inputContainer: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, borderWidth: 1, paddingHorizontal: 15 },
    currencyPrefix: { fontSize: 18, fontWeight: 'bold', marginRight: 5 },
    input: { height: 50, borderRadius: 12, paddingHorizontal: 15, fontSize: 16, fontFamily: 'NotoSans-Regular', borderWidth: 1 },
    saveBtn: { height: 55, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginTop: 30 },
    saveBtnText: { color: '#FFF', fontSize: 16, fontFamily: 'NotoSans-Bold' },

    // Detail Modal Styles
    detailSection: { padding: 15, borderRadius: 16, borderWidth: 1, marginBottom: 20 },
    detailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 4 },
    detailLabel: { fontSize: 13, fontFamily: 'NotoSans-Medium' },
    detailValue: { fontSize: 14, fontFamily: 'NotoSans-Bold' },
    divider: { height: 1, backgroundColor: '#E5E5EA', marginVertical: 12 },
    sectionTitle: { fontSize: 16, fontFamily: 'NotoSans-Black', marginTop: 10, marginBottom: 12 },
    partItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1 },
    partMain: { flex: 1 },
    partNameText: { fontSize: 15, fontFamily: 'NotoSans-Bold' },
    partQty: { fontSize: 14, fontFamily: 'NotoSans-Bold' },
    closeBtn: { height: 50, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginTop: 20 },
    closeBtnText: { color: '#FFF', fontSize: 16, fontFamily: 'NotoSans-Bold' },

    addButton: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
    quoteItemCard: { padding: 15, borderRadius: 16, borderWidth: 1, marginBottom: 12 },
});
