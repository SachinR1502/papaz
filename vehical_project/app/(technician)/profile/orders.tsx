import { AudioPlayer } from '@/components/ui/AudioPlayer';
import { PaymentSimulator } from '@/components/ui/PaymentSimulator';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Colors } from '@/constants/theme';
import { useAdmin } from '@/context/AdminContext';
import { useLanguage } from '@/context/LanguageContext';
import { useTechnician } from '@/context/TechnicianContext';
import { socketService } from '@/services/socket';
import { technicianService } from '@/services/technicianService';
import { getMediaUrl, parseDescription } from '@/utils/mediaHelpers';
import { ImageModal } from '@/components/ui/ImageModal';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
    Modal,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    useColorScheme,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TechnicianWholesaleOrders() {
    const router = useRouter();
    const { settings } = useAdmin();
    const { t } = useLanguage();
    const { profile } = useTechnician();

    const [orders, setOrders] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<any>(null);
    const [isPaymentVisible, setIsPaymentVisible] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    const colorScheme = useColorScheme();
    const theme = colorScheme || 'light';
    const isDark = theme === 'dark';
    const colors = Colors[theme];
    const currencySymbol = settings.currency === 'INR' ? '₹' : '$';

    const fetchOrders = async (silent = false) => {
        if (!silent) setIsLoading(true);
        try {
            const data = await technicianService.getWholesaleOrders();
            setOrders(data);
        } catch (error) {
            console.error('Failed to fetch wholesale orders', error);
        } finally {
            setIsLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchOrders();

        const socket = socketService.connect();
        const handleUpdate = (data: any) => {
            console.log('Wholesale Order Update:', data);
            fetchOrders(true); // Silent refresh
        };

        socketService.on('order_update', handleUpdate);
        return () => { socketService.off('order_update', handleUpdate); };
    }, []);

    // Sync selected order with updated list
    useEffect(() => {
        if (selectedOrder) {
            const updated = orders.find(o => o._id === selectedOrder._id);
            if (updated) setSelectedOrder(updated);

            console.log('[TechnicianOrders] Selected Order Metadata:', {
                id: selectedOrder._id,
                photos: selectedOrder.photos,
                voiceNote: selectedOrder.voiceNote,
                description: selectedOrder.description,
                status: selectedOrder.status
            });
        }
    }, [orders, selectedOrder]);

    const globalPhotos = selectedOrder ? Array.from(new Set([
        ...(selectedOrder.photos || []),
        ...(selectedOrder.images || []),
        ...(selectedOrder.image ? [selectedOrder.image] : []),
        ...(selectedOrder.items?.[0]?.image ? [selectedOrder.items[0].image] : []),
        ...(selectedOrder.items?.[0]?.images || []),
        ...(selectedOrder.items?.[0]?.photos || []),
        ...(parseDescription(selectedOrder.description).photoUris || [])
    ].map(p => getMediaUrl(p)).filter(Boolean))) as string[] : [];

    const globalVoice = selectedOrder ? (
        getMediaUrl(selectedOrder.voiceNote) ||
        getMediaUrl(selectedOrder.voiceUri) ||
        getMediaUrl(selectedOrder.items?.[0]?.voiceUri) ||
        getMediaUrl(selectedOrder.items?.[0]?.voiceNote) ||
        parseDescription(selectedOrder.description).voiceUri
    ) : null;
    const hasGeneralNote = selectedOrder?.description && parseDescription(selectedOrder.description).displayNotes.trim().length > 0;

    const onRefresh = () => {
        setRefreshing(true);
        fetchOrders(true);
    };

    const renderOrderItem = ({ item }: { item: any }) => (
        <View style={[styles.orderCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.cardHeader}>
                <View style={[styles.orderIdContainer, { backgroundColor: colors.primary + '15' }]}>
                    <Text style={[styles.orderIdText, { color: colors.primary }]}>#{item.orderId || item._id.slice(-6).toUpperCase()}</Text>
                </View>
                <StatusBadge status={item.status} size="small" />
            </View>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            <View style={styles.supplierInfo}>
                <View style={[styles.supplierIcon, { backgroundColor: colors.primary + '15' }]}>
                    <Ionicons name="business" size={20} color={colors.primary} />
                </View>
                <View style={styles.supplierDetails}>
                    <Text style={[styles.supplierName, { color: colors.text }]}>{item.supplier?.storeName || item.supplier?.fullName || t('unknown_supplier')}</Text>
                    <Text style={[styles.supplierLocation, { color: colors.icon }]}>{item.supplier?.city || t('parts_supplier')}</Text>
                </View>
                <View style={styles.amountContainer}>
                    <Text style={[styles.totalLabel, { color: colors.icon }]}>{t('total')}</Text>
                    <Text style={[styles.totalAmount, { color: colors.text }]}>{currencySymbol}{item.totalAmount?.toLocaleString()}</Text>
                </View>
            </View>

            <View style={[styles.itemsPreview, { backgroundColor: isDark ? '#00000030' : '#F9F9F9' }]}>
                {item.items.slice(0, 2).map((part: any, idx: number) => {
                    const partParsed = parseDescription(part.description || '');
                    const partImage = getMediaUrl(part.image) || getMediaUrl(part.images?.[0]) || getMediaUrl(part.photos?.[0]) || partParsed.photoUri;

                    return (
                        <View key={idx} style={styles.partItem}>
                            <View style={[styles.partImage, { backgroundColor: colors.primary + '05', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }]}>
                                {partImage ? (
                                    <Image source={{ uri: partImage }} style={{ width: '100%', height: '100%' }} />
                                ) : (
                                    <Ionicons name="cube-outline" size={14} color={colors.primary} />
                                )}
                            </View>
                            <Text style={[styles.partName, { color: colors.text }]} numberOfLines={1}>
                                {part.quantity}x {part.name}
                            </Text>
                        </View>
                    );
                })}
                {item.items.length > 2 && (
                    <Text style={[styles.moreItems, { color: colors.primary }]}>
                        + {item.items.length - 2} {t('more_items')}
                    </Text>
                )}
            </View>

            <View style={styles.cardFooter}>
                <View style={styles.dateContainer}>
                    <Ionicons name="calendar-outline" size={14} color={colors.icon} />
                    <Text style={[styles.dateText, { color: colors.icon }]}>
                        {new Date(item.createdAt).toLocaleDateString()}
                    </Text>
                </View>
                <TouchableOpacity
                    style={[styles.detailsBtn, { backgroundColor: colors.primary + '15' }]}
                    onPress={() => setSelectedOrder(item)}
                >
                    <Text style={[styles.detailsBtnText, { color: colors.primary }]}>{t('view_details')}</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
            <View style={[styles.header, { borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>{t('wholesale_orders') || 'Procurement Records'}</Text>
                <View style={{ width: 40 }} />
            </View>

            {isLoading && !refreshing ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            ) : (
                <FlatList
                    data={orders}
                    renderItem={renderOrderItem}
                    keyExtractor={item => item._id}
                    contentContainerStyle={styles.listContainer}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <View style={[styles.emptyIconContainer, { backgroundColor: colors.card }]}>
                                <MaterialCommunityIcons name="receipt-text-minus-outline" size={60} color={colors.icon} />
                            </View>
                            <Text style={[styles.emptyTitle, { color: colors.text }]}>{t('no_orders_yet')}</Text>
                            <Text style={[styles.emptySub, { color: colors.icon }]}>{t('procurement_empty_desc') || "Your wholesale orders and part requests will appear here once placed."}</Text>
                            <TouchableOpacity
                                style={[styles.exploreBtn, { backgroundColor: colors.primary }]}
                                onPress={() => router.push('/(technician)/(tabs)/store')}
                            >
                                <Text style={styles.exploreBtnText}>{t('browse_marketplace') || 'Shop Parts'}</Text>
                            </TouchableOpacity>
                        </View>
                    }
                />
            )}

            <Modal
                visible={!!selectedOrder}
                animationType="slide"
                transparent
                onRequestClose={() => setSelectedOrder(null)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: colors.text }]}>{t('order_details')}</Text>
                            <TouchableOpacity onPress={() => setSelectedOrder(null)}>
                                <Ionicons name="close" size={24} color={colors.text} />
                            </TouchableOpacity>
                        </View>

                        {selectedOrder && (
                            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalBody}>
                                <View style={styles.detailCard}>
                                    <View style={styles.detailRow}>
                                        <Text style={[styles.detailLabel, { color: colors.icon }]}>{t('order_id')}</Text>
                                        <Text style={[styles.detailValue, { color: colors.text }]}>#{selectedOrder.orderId || selectedOrder._id}</Text>
                                    </View>
                                    <View style={styles.detailRow}>
                                        <Text style={[styles.detailLabel, { color: colors.icon }]}>{t('status_label')}</Text>
                                        <StatusBadge status={selectedOrder.status} size="small" />
                                    </View>
                                    <View style={styles.detailRow}>
                                        <Text style={[styles.detailLabel, { color: colors.icon }]}>{t('date')}</Text>
                                        <Text style={[styles.detailValue, { color: colors.text }]}>{new Date(selectedOrder.createdAt).toLocaleString()}</Text>
                                    </View>
                                </View>

                                {/* Global Attachments Section */}
                                {(globalPhotos.length > 0 || globalVoice || hasGeneralNote) && (
                                    <View style={{ marginBottom: 20 }}>
                                        <Text style={[styles.sectionHeading, { color: colors.text, marginTop: 0 }]}>{t('main_attachments') || 'Main Attachments'}</Text>
                                        <View style={[styles.supplierCard, { backgroundColor: colors.background, borderColor: colors.border, gap: 12 }]}>
                                            {hasGeneralNote && (
                                                <View>
                                                    <Text style={[styles.detailLabel, { color: colors.icon, marginBottom: 4, fontSize: 12 }]}>{t('general_note') || 'General Note'}</Text>
                                                    <Text style={[styles.detailValue, { color: colors.text }]}>{selectedOrder.description}</Text>
                                                </View>
                                            )}

                                            {globalPhotos.length > 0 && (
                                                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
                                                    {globalPhotos.map((uri, idx) => (
                                                        <TouchableOpacity key={idx} onPress={() => setSelectedImage(uri)}>
                                                            <Image source={{ uri }} style={{ width: 150, height: 150, borderRadius: 12, backgroundColor: colors.border }} />
                                                        </TouchableOpacity>
                                                    ))}
                                                </ScrollView>
                                            )}

                                            {globalVoice && (
                                                <View>
                                                    <Text style={[styles.detailLabel, { color: colors.icon, marginBottom: 8, fontSize: 12 }]}>{t('voice_note') || 'Voice Note'}</Text>
                                                    <AudioPlayer uri={globalVoice} />
                                                </View>
                                            )}
                                        </View>
                                    </View>
                                )}

                                <Text style={[styles.sectionHeading, { color: colors.text }]}>{t('supplier_details')}</Text>
                                <View style={[styles.supplierCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                                    <Text style={[styles.supplierNameText, { color: colors.text }]}>
                                        {selectedOrder.supplier?.storeName || selectedOrder.supplier?.fullName || t('unknown_supplier')}
                                    </Text>
                                    <Text style={[styles.supplierLocationText, { color: colors.icon }]}>
                                        {selectedOrder.supplier?.city || t('parts_supplier')}
                                    </Text>
                                </View>

                                <Text style={[styles.sectionHeading, { color: colors.text }]}>{t('items_caps')}</Text>
                                {selectedOrder.items.map((item: any, idx: number) => {
                                    const itemParsed = parseDescription(item.description || '');
                                    const itemPhotos = Array.from(new Set([
                                        ...(item.photos || []),
                                        ...(item.images || []),
                                        ...(item.image ? [item.image] : []),
                                        ...(itemParsed.photoUris || [])
                                    ].map(p => getMediaUrl(p)).filter(Boolean))) as string[];

                                    const itemVoice = item.voiceUri || item.voiceNote || itemParsed.voiceUri;

                                    return (
                                        <View key={idx} style={[styles.itemDetailRow, { borderBottomColor: colors.border, paddingVertical: 15 }]}>
                                            <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                                                {itemPhotos.length > 0 ? (
                                                    <TouchableOpacity onPress={() => setSelectedImage(itemPhotos[0])}>
                                                        <Image source={{ uri: itemPhotos[0] }} style={styles.itemThumb} />
                                                    </TouchableOpacity>
                                                ) : (
                                                    <View style={[styles.itemThumb, { backgroundColor: colors.primary + '10', justifyContent: 'center', alignItems: 'center' }]}>
                                                        <Ionicons name="cube-outline" size={20} color={colors.primary} />
                                                    </View>
                                                )}
                                                <View style={{ flex: 1, marginLeft: 12 }}>
                                                    <Text style={[styles.itemNameText, { color: colors.text }]}>{item.name}</Text>
                                                    <Text style={[styles.itemQtyText, { color: colors.icon }]}>
                                                        {item.quantity} x {currencySymbol}{(item.price || 0).toLocaleString()}
                                                    </Text>

                                                    {itemParsed.displayNotes ? (
                                                        <Text style={{ fontSize: 12, color: colors.icon, marginTop: 4 }} numberOfLines={2}>
                                                            {itemParsed.displayNotes}
                                                        </Text>
                                                    ) : null}

                                                    {itemPhotos.length > 1 && (
                                                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }}>
                                                            {itemPhotos.slice(1).map((p, pIdx) => (
                                                                <TouchableOpacity key={pIdx} onPress={() => setSelectedImage(p)} style={{ marginRight: 8 }}>
                                                                    <Image source={{ uri: p }} style={{ width: 40, height: 40, borderRadius: 8 }} />
                                                                </TouchableOpacity>
                                                            ))}
                                                        </ScrollView>
                                                    )}

                                                    {itemVoice && (
                                                        <View style={{ marginTop: 8, maxWidth: 200 }}>
                                                            <AudioPlayer uri={itemVoice} />
                                                        </View>
                                                    )}
                                                </View>
                                                <View style={{ alignItems: 'flex-end' }}>
                                                    <Text style={[styles.itemSubtotal, { color: colors.text }]}>{currencySymbol}{((item.price || 0) * (item.quantity || 1)).toLocaleString()}</Text>
                                                </View>
                                            </View>
                                        </View>
                                    );
                                })}

                                <View style={styles.totalSummary}>
                                    <View style={styles.summaryRow}>
                                        <Text style={[styles.summaryLabel, { color: colors.icon }]}>{t('total')}</Text>
                                        <Text style={[styles.summaryValue, { color: colors.text, fontSize: 20, fontFamily: 'NotoSans-Black' }]}>
                                            {currencySymbol}{selectedOrder.totalAmount?.toLocaleString()}
                                        </Text>
                                    </View>
                                    <View style={styles.summaryRow}>
                                        <Text style={[styles.summaryLabel, { color: colors.icon }]}>{t('payment_status')}</Text>
                                        <Text style={[styles.summaryValue, { color: selectedOrder.paymentStatus === 'paid' ? '#34C759' : '#FF9500' }]}>
                                            {selectedOrder.paymentStatus?.toUpperCase() || 'PENDING'}
                                        </Text>
                                    </View>

                                    {selectedOrder.status === 'quoted' ? (
                                        <View style={{ marginTop: 20, flexDirection: 'row', gap: 10 }}>
                                            <TouchableOpacity
                                                style={[styles.payBtn, { flex: 1, backgroundColor: colors.error, marginTop: 0 }]}
                                                onPress={() => {
                                                    Alert.alert(t('Reject Quote'), t('Are you sure you want to reject this quote?'), [
                                                        { text: t('Cancel'), style: 'cancel' },
                                                        {
                                                            text: t('Reject'), style: 'destructive', onPress: async () => {
                                                                try {
                                                                    await technicianService.respondToPartRequest(selectedOrder._id, 'reject');
                                                                    setSelectedOrder({ ...selectedOrder, status: 'rejected' });
                                                                    fetchOrders(true);
                                                                    Alert.alert(t('Quote Rejected'));
                                                                } catch (e) { Alert.alert(t('Error'), t('Action failed')); }
                                                            }
                                                        }
                                                    ]);
                                                }}
                                            >
                                                <Text style={styles.payBtnText}>{t('Reject')}</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                style={[styles.payBtn, { flex: 1, backgroundColor: colors.success, marginTop: 0 }]}
                                                onPress={() => {
                                                    Alert.alert(t('Approve Quote'), t('Accept this price and proceed?'), [
                                                        { text: t('Cancel'), style: 'cancel' },
                                                        {
                                                            text: t('Approve'), onPress: async () => {
                                                                try {
                                                                    await technicianService.respondToPartRequest(selectedOrder._id, 'accept');
                                                                    setSelectedOrder({ ...selectedOrder, status: 'confirmed' }); // Optimistic update
                                                                    fetchOrders(true);
                                                                    Alert.alert(t('Quote Approved'), t('Order confirmed. You can now pay.'));
                                                                } catch (e) { Alert.alert(t('Error'), t('Action failed')); }
                                                            }
                                                        }
                                                    ]);
                                                }}
                                            >
                                                <Text style={styles.payBtnText}>{t('Approve')}</Text>
                                            </TouchableOpacity>
                                        </View>
                                    ) : (selectedOrder.paymentStatus !== 'paid' && selectedOrder.status !== 'cancelled' && selectedOrder.status !== 'rejected') && (
                                        <TouchableOpacity
                                            style={[styles.payBtn, { backgroundColor: colors.primary }]}
                                            onPress={() => setIsPaymentVisible(true)}
                                        >
                                            <Text style={styles.payBtnText}>{t('Pay Now')}</Text>
                                        </TouchableOpacity>
                                    )}
                                </View>
                            </ScrollView>
                        )}
                    </View>
                </View>
            </Modal>

            <PaymentSimulator
                visible={isPaymentVisible}
                amount={selectedOrder?.totalAmount || 0}
                orderId={selectedOrder?._id || selectedOrder?.orderId}
                type="wholesale"
                walletBalance={profile?.walletBalance || 0}
                onSuccess={() => {
                    setIsPaymentVisible(false);
                    setSelectedOrder(null);
                    fetchOrders();
                    Alert.alert(t('Success'), t('Payment successful!'));
                }}
                onCancel={() => setIsPaymentVisible(false)}
                onFailure={(err) => Alert.alert(t('Error'), err)}
            />

            <ImageModal
                visible={!!selectedImage}
                uri={selectedImage}
                onClose={() => setSelectedImage(null)}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 15,
        paddingVertical: 15,
        borderBottomWidth: 1,
    },
    backBtn: { width: 40, height: 40, justifyContent: 'center' },
    headerTitle: { fontSize: 18, fontFamily: 'NotoSans-Bold' },

    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    listContainer: { padding: 15, paddingBottom: 100 },

    orderCard: {
        borderRadius: 24,
        padding: 20,
        marginBottom: 15,
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    orderIdContainer: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 10,
    },
    orderIdText: {
        fontSize: 12,
        fontFamily: 'NotoSans-Bold',
    },

    divider: { height: 1, marginVertical: 15 },

    supplierInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    supplierIcon: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    supplierDetails: { flex: 1 },
    supplierName: { fontSize: 16, fontFamily: 'NotoSans-Bold' },
    supplierLocation: { fontSize: 12, fontFamily: 'NotoSans-Regular', marginTop: 2 },

    amountContainer: { alignItems: 'flex-end' },
    totalLabel: { fontSize: 10, fontFamily: 'NotoSans-Bold', textTransform: 'uppercase' },
    totalAmount: { fontSize: 18, fontFamily: 'NotoSans-Black', marginTop: 2 },

    itemsPreview: {
        borderRadius: 15,
        padding: 12,
        marginBottom: 15,
    },
    partItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    partImage: {
        width: 24,
        height: 24,
        borderRadius: 6,
        marginRight: 10,
        backgroundColor: '#FFF',
    },
    partName: { fontSize: 13, fontFamily: 'NotoSans-Medium', flex: 1 },
    moreItems: { fontSize: 11, fontFamily: 'NotoSans-Bold', marginLeft: 34 },

    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    dateContainer: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    dateText: { fontSize: 12, fontFamily: 'NotoSans-Regular' },
    detailsBtn: {
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 10,
    },
    detailsBtnText: { fontSize: 13, fontFamily: 'NotoSans-Bold' },

    emptyContainer: { alignItems: 'center', justifyContent: 'center', marginTop: 60, paddingHorizontal: 30 },
    emptyIconContainer: { width: 120, height: 120, borderRadius: 60, justifyContent: 'center', alignItems: 'center', marginBottom: 25 },
    emptyTitle: { fontSize: 22, fontFamily: 'NotoSans-Black', marginBottom: 12 },
    emptySub: { fontSize: 14, fontFamily: 'NotoSans-Regular', textAlign: 'center', lineHeight: 22, marginBottom: 30 },
    exploreBtn: { paddingHorizontal: 30, paddingVertical: 15, borderRadius: 15 },
    exploreBtnText: { color: '#FFF', fontFamily: 'NotoSans-Bold', fontSize: 16 },

    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        height: '85%',
        paddingBottom: 40,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 24,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.05)',
    },
    modalTitle: {
        fontSize: 20,
        fontFamily: 'NotoSans-Bold',
    },
    modalBody: {
        padding: 24,
    },
    detailCard: {
        paddingVertical: 10,
        marginBottom: 20,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    detailLabel: {
        fontSize: 14,
        fontFamily: 'NotoSans-Medium',
    },
    detailValue: {
        fontSize: 14,
        fontFamily: 'NotoSans-Bold',
    },
    sectionHeading: {
        fontSize: 16,
        fontFamily: 'NotoSans-Bold',
        marginTop: 20,
        marginBottom: 12,
    },
    supplierCard: {
        padding: 16,
        borderRadius: 15,
        borderWidth: 1,
        marginBottom: 10,
    },
    supplierNameText: {
        fontSize: 16,
        fontFamily: 'NotoSans-Bold',
    },
    supplierLocationText: {
        fontSize: 13,
        fontFamily: 'NotoSans-Regular',
        marginTop: 4,
    },
    itemDetailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
    itemThumb: {
        width: 50,
        height: 50,
        borderRadius: 10,
        marginRight: 12,
        backgroundColor: '#FFF',
    },
    itemNameText: {
        fontSize: 14,
        fontFamily: 'NotoSans-Bold',
    },
    itemQtyText: {
        fontSize: 12,
        fontFamily: 'NotoSans-Regular',
        marginTop: 2,
    },
    itemSubtotal: {
        fontSize: 14,
        fontFamily: 'NotoSans-Bold',
    },
    totalSummary: {
        marginTop: 30,
        paddingTop: 20,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.1)',
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    summaryLabel: {
        fontSize: 14,
        fontFamily: 'NotoSans-Medium',
    },
    summaryValue: {
        fontSize: 16,
        fontFamily: 'NotoSans-Bold',
    },
    payBtn: { marginTop: 20, paddingVertical: 15, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
    payBtnText: { color: '#FFF', fontSize: 16, fontFamily: 'NotoSans-Bold' },
});
