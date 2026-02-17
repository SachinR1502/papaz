import { AudioPlayer } from '@/components/ui/AudioPlayer';
import { ImageModal } from '@/components/ui/ImageModal';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { QuotationModal } from '@/components/supplier/QuotationModal';
import { DeliveryModal } from '@/components/supplier/DeliveryModal';
import { Colors } from '@/constants/theme';
import { useAdmin } from '@/context/AdminContext';
import { useLanguage } from '@/context/LanguageContext';
import { useSupplier } from '@/context/SupplierContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getMediaUrl, parseDescription } from '@/utils/mediaHelpers';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Dimensions, Image, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export default function OrderDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const { settings } = useAdmin();
    const { orders, wholesaleOrders, isLoading, updateOrder, sendQuotation } = useSupplier();
    const currencySymbol = settings?.currency === 'INR' ? '₹' : '$';
    const { t } = useLanguage();
    const colorScheme = useColorScheme();
    const theme = colorScheme ?? 'light';
    const colors = Colors[theme];
    const isDark = theme === 'dark';

    const [actionLoading, setActionLoading] = useState(false);

    // Quotation State
    const [isQuoteModalVisible, setIsQuoteModalVisible] = useState(false);
    const [initialQuoteItems, setInitialQuoteItems] = useState<any[]>([]);

    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    // Delivery Modal State
    const [isDeliveryModalVisible, setIsDeliveryModalVisible] = useState(false);

    const order = orders.find((o: any) => o.id === id) || wholesaleOrders.find((wo: any) => wo.id === id);

    useEffect(() => {
        if (order) {
            const mainParsed = parseDescription(order.partName || order.name || order.description || '');
            const aggregatedPhotos = Array.from(new Set([
                ...(order.photos || []),
                ...(order.images || []),
                ...(order.image ? [order.image] : []),
                ...(mainParsed.photoUris || [])
            ].map(p => getMediaUrl(p)).filter(Boolean))) as string[];

            console.log('[OrderDetailScreen] MetaData:', {
                id: order.id,
                photos: order.photos,
                voiceNote: order.voiceNote,
                description: order.description,
                status: order.status,
                resolvedPhotos: aggregatedPhotos
            });
        }
    }, [order]);

    if (!order) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={24} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={[styles.title, { color: colors.text }]}>{t('order_details')}</Text>
                </View>
                <View style={[styles.center, { flex: 1 }]}>
                    {isLoading ? (
                        <ActivityIndicator size="large" color={colors.primary} />
                    ) : (
                        <>
                            <Ionicons name="alert-circle-outline" size={64} color={colors.icon} />
                            <Text style={[styles.emptyText, { color: colors.text, marginTop: 16 }]}>{t('order_not_found') || 'Order Not Found'}</Text>
                            <TouchableOpacity
                                style={[styles.closeBtn, { backgroundColor: colors.primary, marginTop: 24, paddingHorizontal: 40 }]}
                                onPress={() => router.back()}
                            >
                                <Text style={styles.closeBtnText}>{t('go_back') || 'Go Back'}</Text>
                            </TouchableOpacity>
                        </>
                    )}
                </View>
            </SafeAreaView>
        );
    }

    const isWholesale = !!order.technicianName || !!(order.technician && typeof order.technician === 'object');
    const currentStatus = order.status || 'inquiry';
    const isActionable = currentStatus === 'inquiry' || (isWholesale && (currentStatus === 'pending' || currentStatus === 'quoted'));

    // Extract global media from order description/name
    const mainParsed = parseDescription(order.partName || order.name || order.description || '');

    // Comprehensive global photos aggregation
    const globalPhotos = Array.from(new Set([
        ...(order.photos || []),
        ...(order.images || []),
        ...(order.image ? [order.image] : []),
        ...(mainParsed.photoUris || [])
    ].map(p => getMediaUrl(p)).filter(Boolean))) as string[];

    const globalVoice = getMediaUrl(order.voiceNote) || getMediaUrl(order.voiceUri) || mainParsed.voiceUri;

    // Check if there's actual text content in the description separate from URIs
    const hasGeneralNote = mainParsed.displayNotes && mainParsed.displayNotes.trim().length > 0;

    const handleAction = async (action: string, status?: string, data?: any) => {
        setActionLoading(true);
        try {
            await updateOrder(order.id, action, status, data);
            if (action === 'accept') {
                Alert.alert(t('success'), t('order_confirmed_success') || 'Order confirmed and moved to fulfillment.');
            }
        } catch (e) {
            Alert.alert(t('error'), t('failed_to_update'));
        } finally {
            setActionLoading(false);
        }
    };

    const handleQuote = () => {
        let items = [];
        if (order.items && order.items.length > 0) {
            items = order.items.map((i: any) => ({
                id: i.id || i._id || Math.random().toString(36).substr(2, 9),
                name: i.name || i.partName || 'Unknown Item',
                quantity: (i.quantity || i.qty || 1).toString(),
                price: (i.price || i.amount || 0).toString(),
                originalItem: i
            }));
        } else {
            items = [{
                id: Math.random().toString(36).substr(2, 9),
                name: order.partName || order.name || 'Spare Part',
                quantity: (order.quantity || order.qty || 1).toString(),
                price: (order.price || order.amount || 0).toString(),
                originalItem: order
            }];
        }
        setInitialQuoteItems(items);
        setIsQuoteModalVisible(true);
    };

    const handleSubmitQuote = async (items: any[], totalAmount: number) => {
        setActionLoading(true);
        try {
            // Prepare items with proper types and structure
            const itemsToSubmit = items.map(item => {
                const quantity = parseFloat(item.quantity) || 1;
                const price = parseFloat(item.price) || 0;

                return {
                    ...(item.originalItem || {}),
                    name: item.name,
                    quantity: quantity,
                    price: price,
                    total: quantity * price,
                    // Ensure we don't send client-generated temp IDs as ObjectIds
                    ...(item.id && item.id.length > 10 ? { id: item.id } : {})
                };
            });

            console.log('[OrderDetail] Submitting Quote:', { orderId: order.id, itemsCount: itemsToSubmit.length, totalAmount });

            await sendQuotation(order.id, itemsToSubmit, totalAmount);

            setIsQuoteModalVisible(false);
            Alert.alert(t('success'), t('quote_sent_success') || 'Quotation submitted successfully');

            // Optionally force refresh if not handled by context
            // refreshData();
        } catch (e) {
            console.error('[OrderDetail] Quote Error:', e);
            Alert.alert(t('error'), t('failed_to_send_quote'));
        } finally {
            setActionLoading(false);
        }
    };

    const submitDeliveryDetails = async (deliveryData: any) => {
        setIsDeliveryModalVisible(false);
        handleAction('update_status', 'out_for_delivery', { deliveryDetails: deliveryData });
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <View>
                    <Text style={[styles.title, { color: colors.text }]}>{t('order_details')}</Text>
                    <Text style={{ fontSize: 12, color: colors.icon }}>ID: #{order.id.slice(-8).toUpperCase()}</Text>
                </View>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
                {/* Status & Summary */}
                <View style={[styles.detailSection, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <View style={styles.detailRow}>
                        <Text style={[styles.detailLabel, { color: colors.icon }]}>{t('status')}</Text>
                        <StatusBadge status={order.status} size="small" />
                    </View>
                    <View style={styles.detailRow}>
                        <Text style={[styles.detailLabel, { color: colors.icon }]}>{t('date')}</Text>
                        <Text style={[styles.detailValue, { color: colors.text }]}>{new Date(order.createdAt || Date.now()).toLocaleDateString()}</Text>
                    </View>
                    <View style={[styles.divider, { backgroundColor: colors.border }]} />
                    <View style={styles.detailRow}>
                        <Text style={[styles.detailLabel, { color: colors.icon }]}>{t('total_amount')}</Text>
                        <Text style={[styles.detailValue, { color: colors.primary, fontSize: 20, fontWeight: 'bold' }]}>
                            {currencySymbol}{order.amount || order.totalAmount || 0}
                        </Text>
                    </View>
                </View>

                {/* Global Attachments (if any) */}
                {(globalPhotos.length > 0 || globalVoice || hasGeneralNote) && (
                    <View style={{ marginBottom: 24 }}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('global_attachments') || 'Main Attachments'}</Text>
                        <View style={[styles.detailSection, { backgroundColor: colors.card, borderColor: colors.border, gap: 16 }]}>
                            {hasGeneralNote && (
                                <View>
                                    <Text style={[styles.detailLabel, { color: colors.icon, marginBottom: 4 }]}>{t('general_note') || 'General Note'}</Text>
                                    <Text style={[styles.detailValue, { color: colors.text, fontSize: 16 }]}>{mainParsed.displayNotes}</Text>
                                </View>
                            )}

                            {globalPhotos.length > 0 && (
                                <View style={{ height: 210 }}>
                                    <ScrollView
                                        horizontal
                                        showsHorizontalScrollIndicator={false}
                                        contentContainerStyle={{ gap: 12, paddingRight: 20 }}
                                    >
                                        {globalPhotos.map((uri, idx) => {
                                            const cardWidth = globalPhotos.length > 1 ? 280 : width - 80;
                                            return (
                                                <TouchableOpacity
                                                    key={idx}
                                                    style={[styles.imageCard, {
                                                        backgroundColor: colors.background,
                                                        borderColor: colors.border,
                                                        width: cardWidth,
                                                        height: 200
                                                    }]}
                                                    onPress={() => setSelectedImage(uri)}
                                                >
                                                    <Image
                                                        source={{ uri }}
                                                        style={styles.attachedImage}
                                                        resizeMode="cover"
                                                        onLoad={() => console.log(`[OrderDetail] Image loaded: ${uri}`)}
                                                        onError={(e) => console.error(`[OrderDetail] Image error: ${uri}`, e.nativeEvent)}
                                                    />
                                                </TouchableOpacity>
                                            );
                                        })}
                                    </ScrollView>
                                </View>
                            )}

                            {globalVoice && (
                                <View>
                                    <Text style={[styles.detailLabel, { color: colors.icon, marginBottom: 8 }]}>{t('voice_note') || 'Voice Note'}</Text>
                                    <AudioPlayer uri={globalVoice} />
                                </View>
                            )}
                        </View>
                    </View>
                )}

                {/* Customer Information */}
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                    {isWholesale ? (t('technician_details') || 'Technician Details') : (t('customer_details') || 'Customer Details')}
                </Text>
                <View style={[styles.detailSection, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <View style={styles.detailRow}>
                        <View style={[styles.iconBox, { backgroundColor: colors.primary + '15' }]}>
                            <Ionicons name="person" size={20} color={colors.primary} />
                        </View>
                        <View style={{ flex: 1, marginLeft: 12 }}>
                            <Text style={[styles.detailLabel, { color: colors.icon }]}>{isWholesale ? t('technician') : t('customer')}</Text>
                            <Text style={[styles.detailValue, { color: colors.text, fontSize: 16 }]}>
                                {isWholesale
                                    ? (order.technicianName || order.technician?.garageName || order.technician?.fullName || 'Technician')
                                    : (order.customer?.fullName || order.customer?.name || 'Valuable Customer')}
                            </Text>
                        </View>
                    </View>

                    <View style={[styles.detailRow, { marginTop: 16 }]}>
                        <View style={[styles.iconBox, { backgroundColor: colors.primary + '15' }]}>
                            <Ionicons name="location" size={20} color={colors.primary} />
                        </View>
                        <View style={{ flex: 1, marginLeft: 12 }}>
                            <Text style={[styles.detailLabel, { color: colors.icon }]}>{t('delivery_address') || 'Address'}</Text>
                            <Text style={[styles.detailValue, { color: colors.text }]}>
                                {typeof order.location === 'string' ? order.location : (order.deliveryAddress?.address || order.customer?.city || 'Location Shared')}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Vehicle Details */}
                {order.vehicleDetails && (
                    <View style={[styles.detailSection, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <View style={styles.detailRow}>
                            <View style={[styles.iconBox, { backgroundColor: colors.primary + '15' }]}>
                                <Ionicons name="car-sport" size={20} color={colors.primary} />
                            </View>
                            <View style={{ flex: 1, marginLeft: 12 }}>
                                <Text style={[styles.detailLabel, { color: colors.icon }]}>{t('vehicle_details') || 'Vehicle'}</Text>
                                <Text style={[styles.detailValue, { color: colors.text }]}>
                                    {order.vehicleDetails.make} {order.vehicleDetails.model}{order.vehicleDetails.variant} ({order.vehicleDetails.year})
                                </Text>
                                {order.vehicleDetails.fuelType && <Text style={{ fontSize: 13, color: colors.icon }}>{order.vehicleDetails.fuelType}</Text>}
                            </View>
                        </View>
                    </View>
                )}

                {/* Order Items with Per-Item Attachments */}
                <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('items_ordered') || 'Items Ordered'}</Text>
                <View style={[styles.detailSection, { backgroundColor: colors.card, borderColor: colors.border, padding: 0 }]}>
                    {(order.items || [{ name: order.partName || order.name, quantity: order.quantity, amount: order.amount }]).map((item: any, index: number, arr: any[]) => {
                        const itemParsed = parseDescription(item.description || item.name || '');

                        // Aggregate and deduplicate photos for this item
                        const itemPhotos = Array.from(new Set([
                            ...(item.photos || []),
                            ...(item.images || []),
                            ...(item.image ? [item.image] : []),
                            ...(itemParsed.photoUris || [])
                        ].map(p => getMediaUrl(p)).filter(Boolean))) as string[];

                        const itemVoice = getMediaUrl(item.voiceNote) || getMediaUrl(item.voiceUri) || itemParsed.voiceUri;

                        return (
                            <View key={index} style={[styles.itemRow, index === arr.length - 1 && { borderBottomWidth: 0 }, { borderBottomColor: colors.border }]}>
                                <View style={{ flex: 1 }}>
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <Text style={[styles.itemName, { color: colors.text, flex: 1 }]}>{item.name || order.partName || 'Spare Part'}</Text>
                                        <View style={{ alignItems: 'flex-end', marginLeft: 10 }}>
                                            <Text style={[styles.itemQty, { color: colors.text }]}>x{item.quantity || item.qty || 1}</Text>
                                            <Text style={[styles.itemPrice, { color: colors.primary }]}>{currencySymbol}{item.price || item.amount || 0}</Text>
                                        </View>
                                    </View>
                                    <Text style={{ fontSize: 13, color: colors.icon }}>
                                        {item.brand || order.brand || ''}
                                        {(item.brand && item.partNumber) ? ' • ' : ''}
                                        {item.partNumber ? `PN: ${item.partNumber}` : ''}
                                    </Text>
                                    {itemParsed.displayNotes ? (
                                        <Text style={{ fontSize: 13, color: colors.icon, marginTop: 4 }}>{itemParsed.displayNotes}</Text>
                                    ) : null}

                                    {/* Item Attachments */}
                                    {(itemPhotos.length > 0 || itemVoice) && (
                                        <View style={{ gap: 10, marginTop: 12 }}>
                                            {itemPhotos.length > 0 && (
                                                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
                                                    {itemPhotos.map((p: string, pIdx: number) => (
                                                        <TouchableOpacity key={pIdx} onPress={() => setSelectedImage(p)}>
                                                            <Image source={{ uri: p }} style={{ width: 80, height: 80, borderRadius: 12, backgroundColor: colors.border }} />
                                                        </TouchableOpacity>
                                                    ))}
                                                </ScrollView>
                                            )}
                                            {itemVoice && (
                                                <View style={{ flex: 1, maxWidth: 250 }}>
                                                    <AudioPlayer uri={itemVoice} />
                                                </View>
                                            )}
                                        </View>
                                    )}
                                </View>
                            </View>
                        );
                    })}
                </View>

                {/* Delivery Details (If available) */}
                {order.deliveryDetails && (
                    <View style={{ marginTop: 24 }}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('delivery_tracking') || 'Delivery Details'}</Text>
                        <View style={[styles.detailSection, { backgroundColor: colors.sales + '10', borderColor: colors.sales + '30' }]}>

                            {/* Delivery Type Badge */}
                            <View style={{ flexDirection: 'row', marginBottom: 15 }}>
                                <View style={{ paddingHorizontal: 12, paddingVertical: 4, backgroundColor: colors.sales, borderRadius: 8 }}>
                                    <Text style={{ color: '#FFF', fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase' }}>
                                        {order.deliveryDetails.type === 'courier' ? (t('courier_delivery') || 'Courier Delivery') : (t('local_delivery') || 'Local Delivery')}
                                    </Text>
                                </View>
                            </View>

                            {/* Local Delivery Display */}
                            {(order.deliveryDetails.type === 'local' || !order.deliveryDetails.type) && (
                                <>
                                    <View style={styles.detailRow}>
                                        <MaterialCommunityIcons name="truck-delivery" size={24} color={colors.sales} />
                                        <View style={{ flex: 1, marginLeft: 16 }}>
                                            <Text style={[styles.detailLabel, { color: colors.sales }]}>{t('vehicle_number')}</Text>
                                            <Text style={[styles.detailValue, { color: colors.text, fontSize: 16 }]}>
                                                {order.deliveryDetails.vehicleNumber || 'N/A'}
                                            </Text>
                                        </View>
                                    </View>

                                    <View style={[styles.detailRow, { marginTop: 16 }]}>
                                        <Ionicons name="person" size={24} color={colors.sales} />
                                        <View style={{ flex: 1, marginLeft: 16 }}>
                                            <Text style={[styles.detailLabel, { color: colors.sales }]}>{t('driver_detail') || 'Driver'}</Text>
                                            <Text style={[styles.detailValue, { color: colors.text }]}>
                                                {order.deliveryDetails.driverName}
                                            </Text>
                                            {order.deliveryDetails.driverPhone && (
                                                <Text style={{ fontSize: 13, color: colors.icon }}>{order.deliveryDetails.driverPhone}</Text>
                                            )}
                                        </View>
                                    </View>

                                    {order.deliveryDetails.personName && (
                                        <View style={[styles.detailRow, { marginTop: 16 }]}>
                                            <Ionicons name="people-circle" size={24} color={colors.sales} />
                                            <View style={{ flex: 1, marginLeft: 16 }}>
                                                <Text style={[styles.detailLabel, { color: colors.sales }]}>{t('contact_person') || 'Contact Person'}</Text>
                                                <Text style={[styles.detailValue, { color: colors.text }]}>
                                                    {order.deliveryDetails.personName}
                                                </Text>
                                            </View>
                                        </View>
                                    )}
                                </>
                            )}

                            {/* Courier Delivery Display */}
                            {order.deliveryDetails.type === 'courier' && (
                                <>
                                    <View style={styles.detailRow}>
                                        <MaterialCommunityIcons name="truck-fast" size={24} color={colors.sales} />
                                        <View style={{ flex: 1, marginLeft: 16 }}>
                                            <Text style={[styles.detailLabel, { color: colors.sales }]}>{t('courier_partner') || 'Courier Partner'}</Text>
                                            <Text style={[styles.detailValue, { color: colors.text, fontSize: 16 }]}>
                                                {order.deliveryDetails.courierName}
                                            </Text>
                                        </View>
                                    </View>
                                    <View style={[styles.detailRow, { marginTop: 16 }]}>
                                        <MaterialCommunityIcons name="barcode-scan" size={24} color={colors.sales} />
                                        <View style={{ flex: 1, marginLeft: 16 }}>
                                            <Text style={[styles.detailLabel, { color: colors.sales }]}>{t('tracking_details') || 'Tracking Details'}</Text>
                                            <Text style={[styles.detailValue, { color: colors.text }]}>
                                                {order.deliveryDetails.trackingId}
                                            </Text>
                                            {order.deliveryDetails.trackingUrl && (
                                                <Text style={{ fontSize: 13, color: colors.primary, marginTop: 4 }}>
                                                    {order.deliveryDetails.trackingUrl}
                                                </Text>
                                            )}
                                        </View>
                                    </View>
                                </>
                            )}

                            {/* Common Notes */}
                            {order.deliveryDetails.notes && (
                                <View style={[styles.detailRow, { marginTop: 16 }]}>
                                    <Ionicons name="document-text-outline" size={24} color={colors.sales} />
                                    <View style={{ flex: 1, marginLeft: 16 }}>
                                        <Text style={[styles.detailLabel, { color: colors.sales }]}>{t('delivery_notes') || 'Notes'}</Text>
                                        <Text style={[styles.detailValue, { color: colors.text }]}>
                                            {order.deliveryDetails.notes}
                                        </Text>
                                    </View>
                                </View>
                            )}
                        </View>
                    </View>
                )}
            </ScrollView>

            {/* Action Bar */}
            <View style={[styles.actionBar, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
                {isActionable ? (
                    (isWholesale && (currentStatus === 'quoted' || currentStatus === 'pending')) ? (
                        <TouchableOpacity
                            style={[styles.primaryActionBtn, { backgroundColor: colors.sales }]}
                            onPress={() => handleAction('accept')}
                            disabled={actionLoading}
                        >
                            {actionLoading ? <ActivityIndicator color="#FFF" /> : (
                                <>
                                    <Ionicons name="checkmark-circle" size={22} color="#FFF" />
                                    <Text style={styles.actionBtnText}>{t('convert_to_order') || 'Convert to Order'}</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity
                            style={[styles.primaryActionBtn, { backgroundColor: colors.primary }]}
                            onPress={handleQuote}
                            disabled={actionLoading}
                        >
                            {actionLoading ? <ActivityIndicator color="#FFF" /> : (
                                <>
                                    <Ionicons name="paper-plane" size={20} color="#FFF" />
                                    <Text style={styles.actionBtnText}>{t('submit_quote')}</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    )
                ) : (currentStatus === 'accepted' || currentStatus === 'packed' || currentStatus === 'confirmed') && (
                    <TouchableOpacity
                        style={[styles.primaryActionBtn, { backgroundColor: colors.sales }]}
                        onPress={() => {
                            if (currentStatus === 'packed') {
                                setIsDeliveryModalVisible(true);
                            } else {
                                handleAction('update_status', (currentStatus === 'accepted' || currentStatus === 'confirmed') ? 'packed' : 'out_for_delivery');
                            }
                        }}
                        disabled={actionLoading}
                    >
                        {actionLoading ? <ActivityIndicator color="#FFF" /> : (
                            <>
                                <Ionicons name="arrow-forward-circle" size={22} color="#FFF" />
                                <Text style={styles.actionBtnText}>
                                    {(currentStatus === 'accepted' || currentStatus === 'confirmed') ? t('mark_as_packed') : t('mark_as_shipped')}
                                </Text>
                            </>
                        )}
                    </TouchableOpacity>
                )}
            </View>

            {/* Quotation Modal */}
            <QuotationModal
                visible={isQuoteModalVisible}
                onClose={() => setIsQuoteModalVisible(false)}
                onSubmit={handleSubmitQuote}
                initialItems={initialQuoteItems}
                order={order}
                currencySymbol={currencySymbol}
                loading={actionLoading}
            />

            {/* Delivery Details Modal */}
            <DeliveryModal
                visible={isDeliveryModalVisible}
                onClose={() => setIsDeliveryModalVisible(false)}
                onSubmit={submitDeliveryDetails}
                initialData={order.deliveryDetails}
                loading={actionLoading}
            />

            {/* Image Viewer */}
            <ImageModal
                visible={!!selectedImage}
                uri={selectedImage || ''}
                onClose={() => setSelectedImage(null)}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 15 },
    backBtn: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
    title: { fontSize: 20, fontFamily: 'NotoSans-Black' },
    content: { padding: 20, paddingBottom: 40 },
    detailSection: { padding: 20, borderRadius: 24, borderWidth: 1, marginBottom: 24 },
    detailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    detailLabel: { fontSize: 13, fontFamily: 'NotoSans-Medium' },
    detailValue: { fontSize: 15, fontFamily: 'NotoSans-Bold' },
    divider: { height: 1, marginVertical: 16 },
    sectionTitle: { fontSize: 16, fontFamily: 'NotoSans-Black', marginBottom: 12, marginLeft: 4 },
    iconBox: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    itemRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1 },
    itemName: { fontSize: 16, fontFamily: 'NotoSans-Bold' },
    itemQty: { fontSize: 14, fontFamily: 'NotoSans-Medium' },
    itemPrice: { fontSize: 16, fontFamily: 'NotoSans-Black' },
    mediaPlaceholder: { height: 120, borderRadius: 20, borderWidth: 1, borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center' },
    imageCard: { height: 200, borderRadius: 20, overflow: 'hidden', borderWidth: 1, position: 'relative' },
    attachedImage: { width: '100%', height: '100%' },
    imageOverlay: { position: 'absolute', bottom: 12, right: 12, backgroundColor: 'rgba(0,0,0,0.5)', width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
    center: { justifyContent: 'center', alignItems: 'center', padding: 40 },
    emptyText: { fontSize: 18, fontFamily: 'NotoSans-Bold', textAlign: 'center' },
    closeBtn: { height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center' },
    closeBtnText: { color: '#FFF', fontSize: 16, fontFamily: 'NotoSans-Bold' },

    // Action Bar
    actionBar: { padding: 20, paddingBottom: Platform.OS === 'ios' ? 40 : 20, borderTopWidth: 1, flexDirection: 'row', gap: 12 },
    primaryActionBtn: { flex: 1, height: 56, borderRadius: 18, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10 },
    actionBtnText: { color: '#FFF', fontSize: 16, fontFamily: 'NotoSans-Bold' },

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

    addButton: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
    quoteItemCard: { padding: 15, borderRadius: 16, borderWidth: 1, marginBottom: 12 },
});
