import { AudioPlayer } from '@/components/ui/AudioPlayer';
import { ImageModal } from '@/components/ui/ImageModal';
import { PaymentSimulator } from '@/components/ui/PaymentSimulator';
import { Colors } from '@/constants/theme';
import { useAdmin } from '@/context/AdminContext';
import { useCustomer } from '@/context/CustomerContext';
import { useLanguage } from '@/context/LanguageContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { customerService } from '@/services/customerService';
import { socketService } from '@/services/socket';
import { getMediaUrl, parseDescription } from '@/utils/mediaHelpers';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    Linking,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function OrderDetailsScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const { settings } = useAdmin();
    const { profile } = useCustomer();
    const { t } = useLanguage();
    const colorScheme = useColorScheme();
    const theme = colorScheme ?? 'light';
    const colors = Colors[theme];
    const isDark = theme === 'dark';
    const currencySymbol = settings.currency === 'INR' ? '₹' : '$';

    const [order, setOrder] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [isPaymentVisible, setIsPaymentVisible] = useState(false);

    // Derived state for display
    const mainParsed = parseDescription(order ? (order.partName || order.name || order.description || '') : '');

    // Robust items fallback matching supplier logic
    const displayItems = (order?.items && order.items.length > 0) ? order.items : (order ? [{
        _id: 'root-item',
        name: order.partName || order.name || t('Item'),
        description: order.description,
        price: order.amount || order.totalAmount,
        quantity: order.quantity || 1,
        photos: order.photos,
        image: order.image,
        brand: order.brand
    }] : []);

    useEffect(() => {
        loadOrder();

        const socket = socketService.connect();
        const handleUpdate = (data: any) => {
            if (data.orderId === id || data._id === id) {
                console.log('Real-time order update received:', data);
                loadOrder();
            }
        };

        socketService.on('order_update', handleUpdate);

        return () => {
            socketService.off('order_update');
        };
    }, [id]);

    const loadOrder = async () => {
        if (!id) return;
        try {
            const data = await customerService.getOrder(id);
            setOrder(data);
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <View style={[styles.center, { backgroundColor: colors.background }]}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    if (!order) {
        return (
            <View style={[styles.center, { backgroundColor: colors.background }]}>
                <Text style={{ color: colors.text }}>{t('Order not found')}</Text>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

            <BlurView intensity={Platform.OS === 'ios' ? 80 : 0} tint={isDark ? 'dark' : 'light'} style={styles.headerContainer}>
                <SafeAreaView edges={['top']} style={styles.headerSafeArea}>
                    <View style={styles.headerContent}>
                        <TouchableOpacity onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: isDark ? colors.icon + '20' : colors.icon + '10' }]}>
                            <Ionicons name="arrow-back" size={24} color={colors.text} />
                        </TouchableOpacity>
                        <View style={{ flex: 1, alignItems: 'center' }}>
                            <Text style={[styles.headerTitle, { color: colors.text }]}>{t('Order')} #{order.orderId}</Text>
                            <Text style={[styles.headerSub, { color: colors.icon }]}>{new Date(order.createdAt).toLocaleDateString()}</Text>
                        </View>
                        <View style={{ width: 44 }} />
                    </View>
                </SafeAreaView>
            </BlurView>

            <ScrollView contentContainerStyle={[styles.scrollContent, { paddingTop: 120 }]}>
                {/* Order Status */}
                <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <View style={styles.statusSection}>
                        <MaterialCommunityIcons
                            name={order.status === 'delivered' ? 'check-decagram' : 'clock-fast'}
                            size={48}
                            color={order.status === 'delivered' ? colors.sales : colors.customers}
                        />
                        <Text style={[styles.statusMain, { color: colors.text }]}>{order.status.toUpperCase()}</Text>
                        <Text style={[styles.statusSub, { color: colors.icon }]}>
                            {order.status === 'confirmed' ? t('We have received your order') :
                                order.status === 'shipped' || order.status === 'out_for_delivery' ? t('Your order is on the way') :
                                    order.status === 'packed' ? t('Order is packed and ready') :
                                        order.status === 'delivered' ? t('Order delivered successfully') : t('Status updated')}
                        </Text>
                    </View>
                </View>

                {/* Tracking Stepper */}
                <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <Text style={[styles.cardTitle, { color: colors.text }]}>{t('Order Tracking')}</Text>
                    <View style={styles.timeline}>
                        {[
                            { id: 'confirmed', label: t('Confirmed'), active: true },
                            { id: 'shipped', label: t('Shipped'), active: ['shipped', 'out_for_delivery', 'delivered'].includes(order.status) },
                            { id: 'delivered', label: t('Delivered'), active: order.status === 'delivered' }
                        ].map((step, index, arr) => (
                            <View key={index} style={styles.stepRow}>
                                <View style={styles.stepIndicator}>
                                    <View style={[styles.dot, { backgroundColor: step.active ? colors.primary : colors.border }]} />
                                    {index !== arr.length - 1 && <View style={[styles.line, { backgroundColor: step.active ? colors.primary : colors.border }]} />}
                                </View>
                                <View style={styles.stepContent}>
                                    <Text style={[styles.stepLabel, { color: step.active ? colors.text : colors.icon }]}>{step.label}</Text>
                                </View>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Global Attachments (If any) */}
                {(mainParsed.photoUris.length > 0 || mainParsed.voiceUri) && (
                    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <Text style={[styles.cardTitle, { color: colors.text }]}>{t('Attachments')}</Text>
                        <View style={{ gap: 12 }}>
                            {mainParsed.photoUris.length > 0 && (
                                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                    {mainParsed.photoUris.map((uri: string, idx: number) => (
                                        <TouchableOpacity key={idx} onPress={() => setSelectedImage(getMediaUrl(uri))} style={{ marginRight: 10 }}>
                                            <Image source={{ uri: getMediaUrl(uri) || '' }} style={{ width: 150, height: 150, borderRadius: 12, backgroundColor: '#f0f0f0' }} resizeMode="cover" />
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            )}
                            {mainParsed.voiceUri && <AudioPlayer uri={mainParsed.voiceUri} />}
                        </View>
                    </View>
                )}

                {/* Vehicle Details */}
                {order.vehicleDetails && (
                    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 15 }}>
                            <Ionicons name="car-sport" size={24} color={colors.primary} />
                            <Text style={[styles.cardTitle, { color: colors.text, marginBottom: 0, marginLeft: 10 }]}>{t('Vehicle Details')}</Text>
                        </View>
                        <View>
                            <Text style={{ fontSize: 16, fontFamily: 'NotoSans-Bold', color: colors.text }}>
                                {order.vehicleDetails.make} {order.vehicleDetails.model}
                            </Text>
                            <Text style={{ fontSize: 14, color: colors.icon, marginTop: 2 }}>
                                {order.vehicleDetails.variant} ({order.vehicleDetails.year})
                            </Text>
                            {order.vehicleDetails.fuelType && (
                                <View style={{ flexDirection: 'row', marginTop: 8 }}>
                                    <View style={{ backgroundColor: colors.background, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 }}>
                                        <Text style={{ fontSize: 12, color: colors.text }}>{order.vehicleDetails.fuelType}</Text>
                                    </View>
                                </View>
                            )}
                        </View>
                    </View>
                )}

                {/* Delivery Details (If available) */}
                {order.deliveryDetails && (
                    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
                            <Text style={[styles.cardTitle, { color: colors.text, marginBottom: 0 }]}>{t('Delivery Information')}</Text>
                            <View style={{ paddingHorizontal: 8, paddingVertical: 4, backgroundColor: colors.primary + '20', borderRadius: 6 }}>
                                <Text style={{ fontSize: 10, fontFamily: 'NotoSans-Bold', color: colors.primary, textTransform: 'uppercase' }}>
                                    {order.deliveryDetails.type === 'courier' ? t('Courier') : t('Local')}
                                </Text>
                            </View>
                        </View>

                        {/* Local Delivery */}
                        {(order.deliveryDetails.type === 'local' || !order.deliveryDetails.type) && (
                            <>
                                <View style={styles.deliveryInfoRow}>
                                    <View style={styles.deliveryInfoItem}>
                                        <Ionicons name="car-sport" size={20} color={colors.primary} />
                                        <View style={{ marginLeft: 12 }}>
                                            <Text style={[styles.deliveryLabel, { color: colors.icon }]}>{t('Vehicle Number')}</Text>
                                            <Text style={[styles.deliveryValue, { color: colors.text }]}>{order.deliveryDetails.vehicleNumber || 'N/A'}</Text>
                                        </View>
                                    </View>
                                    <View style={[styles.deliveryInfoItem, { marginTop: 15 }]}>
                                        <Ionicons name="person" size={20} color={colors.primary} />
                                        <View style={{ marginLeft: 12 }}>
                                            <Text style={[styles.deliveryLabel, { color: colors.icon }]}>{t('Driver')}</Text>
                                            <Text style={[styles.deliveryValue, { color: colors.text }]}>{order.deliveryDetails.driverName}</Text>
                                            {order.deliveryDetails.driverPhone && (
                                                <Text style={{ fontSize: 13, color: colors.icon }}>{order.deliveryDetails.driverPhone}</Text>
                                            )}
                                        </View>
                                    </View>
                                    {order.deliveryDetails.personName && (
                                        <View style={[styles.deliveryInfoItem, { marginTop: 15 }]}>
                                            <Ionicons name="people" size={20} color={colors.primary} />
                                            <View style={{ marginLeft: 12 }}>
                                                <Text style={[styles.deliveryLabel, { color: colors.icon }]}>{t('Contact Person')}</Text>
                                                <Text style={[styles.deliveryValue, { color: colors.text }]}>{order.deliveryDetails.personName}</Text>
                                            </View>
                                        </View>
                                    )}
                                </View>
                                {order.deliveryDetails.driverPhone && (
                                    <TouchableOpacity
                                        style={[styles.callDriverBtn, { borderColor: colors.primary }]}
                                        onPress={() => Linking.openURL(`tel:${order.deliveryDetails.driverPhone}`)}
                                    >
                                        <Ionicons name="call" size={18} color={colors.primary} />
                                        <Text style={[styles.callDriverText, { color: colors.primary }]}>{t('Call Driver')}</Text>
                                    </TouchableOpacity>
                                )}
                            </>
                        )}

                        {/* Courier Delivery */}
                        {order.deliveryDetails.type === 'courier' && (
                            <View style={styles.deliveryInfoRow}>
                                <View style={styles.deliveryInfoItem}>
                                    <MaterialCommunityIcons name="truck-fast" size={20} color={colors.primary} />
                                    <View style={{ marginLeft: 12 }}>
                                        <Text style={[styles.deliveryLabel, { color: colors.icon }]}>{t('Courier Partner')}</Text>
                                        <Text style={[styles.deliveryValue, { color: colors.text }]}>{order.deliveryDetails.courierName}</Text>
                                    </View>
                                </View>
                                <View style={[styles.deliveryInfoItem, { marginTop: 15 }]}>
                                    <MaterialCommunityIcons name="barcode-scan" size={20} color={colors.primary} />
                                    <View style={{ marginLeft: 12 }}>
                                        <Text style={[styles.deliveryLabel, { color: colors.icon }]}>{t('Tracking ID')}</Text>
                                        <Text style={[styles.deliveryValue, { color: colors.text }]}>{order.deliveryDetails.trackingId}</Text>
                                    </View>
                                </View>
                                {order.deliveryDetails.trackingUrl && (
                                    <TouchableOpacity
                                        style={{ marginTop: 15, flexDirection: 'row', alignItems: 'center' }}
                                        onPress={() => Linking.openURL(order.deliveryDetails.trackingUrl)}
                                    >
                                        <Text style={{ color: colors.primary, fontFamily: 'NotoSans-Bold', marginRight: 5 }}>{t('Track Shipment')}</Text>
                                        <Ionicons name="open-outline" size={16} color={colors.primary} />
                                    </TouchableOpacity>
                                )}
                            </View>
                        )}

                        {/* Notes */}
                        {order.deliveryDetails.notes && (
                            <View style={{ marginTop: 15, padding: 12, backgroundColor: colors.background, borderRadius: 12 }}>
                                <Text style={{ fontSize: 12, color: colors.icon, marginBottom: 4 }}>{t('Notes')}</Text>
                                <Text style={{ color: colors.text }}>{order.deliveryDetails.notes}</Text>
                            </View>
                        )}
                    </View>
                )}

                {/* Global Attachments (if any) */}
                {(() => {
                    const mainParsed = parseDescription(order.description || '');
                    const globalPhotos = Array.from(new Set([
                        ...(order.photos || []),
                        ...(order.images || []),
                        ...(order.image ? [order.image] : []),
                        ...(order.items?.[0]?.image ? [order.items[0].image] : []),
                        ...(order.items?.[0]?.images || []),
                        ...(order.items?.[0]?.photos || []),
                        ...(mainParsed.photoUris || [])
                    ].map(p => getMediaUrl(p)).filter(Boolean))) as string[];

                    const globalVoice = getMediaUrl(order.voiceNote) ||
                        getMediaUrl(order.voiceUri) ||
                        getMediaUrl(order.items?.[0]?.voiceUri) ||
                        getMediaUrl(order.items?.[0]?.voiceNote) ||
                        mainParsed.voiceUri;
                    const hasGeneralNote = mainParsed.displayNotes && mainParsed.displayNotes.trim().length > 0;

                    if (globalPhotos.length === 0 && !globalVoice && !hasGeneralNote) return null;

                    return (
                        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                            <Text style={[styles.cardTitle, { color: colors.text }]}>{t('Main Attachments')}</Text>

                            {hasGeneralNote && (
                                <View style={{ marginBottom: 12 }}>
                                    <Text style={{ fontSize: 13, color: colors.text }}>{mainParsed.displayNotes}</Text>
                                </View>
                            )}

                            {globalPhotos.length > 0 && (
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingBottom: 5 }}>
                                    {globalPhotos.map((uri, idx) => (
                                        <TouchableOpacity key={idx} onPress={() => setSelectedImage(uri)}>
                                            <Image source={{ uri }} style={{ width: 120, height: 120, borderRadius: 12, backgroundColor: colors.border }} />
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            )}

                            {globalVoice && (
                                <View style={{ marginTop: 12 }}>
                                    <AudioPlayer uri={globalVoice} />
                                </View>
                            )}
                        </View>
                    );
                })()}

                {/* Items */}
                <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <Text style={[styles.cardTitle, { color: colors.text }]}>{t('Items')}</Text>
                    {displayItems.map((item: any, index: number) => {
                        // Parse the original description (contains customer request + metadata)
                        const parsed = parseDescription(item.description || '');

                        // authoritative product name (from supplier/quote)
                        const productName = item.name;

                        // original customer request (from description)
                        const originalRequest = parsed.displayName;

                        // Logic: 
                        // 1. If we have a specific productName (quoted), that is the PRIMARY display.
                        // 2. The originalRequest becomes the REFERENCE.
                        // 3. Fallback: if no productName, usage originalRequest as Primary.

                        const mainTitle = productName || originalRequest || t('Unknown Item');
                        const showReference = !!productName && !!originalRequest && (productName.trim() !== originalRequest.trim());

                        let displayNotes = parsed.displayNotes;
                        const { photoUri, voiceUri, photoUris, voiceUris } = parsed;

                        // Metadata extraction from main title
                        let displayMeta = '';
                        if (mainTitle.includes(' - ')) {
                            const parts = mainTitle.split(' - ');
                            const brand = parts.pop();
                            // mainTitle = parts.join(' - '); // Don't modify mainTitle here, it's already set
                            displayMeta = brand ? ` • ${brand}` : '';
                        }

                        const pnMatch = mainTitle.match(/\(PN: (.*?)\)/);
                        if (pnMatch) {
                            const pn = pnMatch[1];
                            // mainTitle = mainTitle.replace(pnMatch[0], '').trim(); // Don't modify mainTitle here
                            displayMeta = ` • PN: ${pn}` + displayMeta;
                        }

                        // Determine if it's a note (price is 0 and no product linked)
                        // If it's quoted, price should be > 0, so it won't be a note.
                        const isNote = (item.price === 0 || item.unitPrice === 0) && !item.product;

                        // Aggregate all photos from various possible fields
                        const allPhotos = Array.from(new Set([
                            ...(item.photos || []),
                            ...(item.images || []),
                            ...(item.image ? [item.image] : []),
                            ...(photoUris || [])
                        ])).filter(Boolean);

                        // Pick the first available voice note
                        const itemVoice = item.voiceNote || item.voiceUri || voiceUri || (voiceUris && voiceUris[0]);

                        return (
                            <View key={index} style={[styles.itemRow, { borderBottomColor: colors.border, borderBottomWidth: index === displayItems.length - 1 ? 0 : 1 }]}>
                                {allPhotos.length > 0 ? (
                                    <View>
                                        <TouchableOpacity onPress={() => setSelectedImage(getMediaUrl(allPhotos[0]))}>
                                            <Image source={{ uri: getMediaUrl(allPhotos[0]) || '' }} style={styles.itemImage} />
                                        </TouchableOpacity>
                                        {allPhotos.length > 1 && (
                                            <View style={[styles.photoCountBadge, { backgroundColor: colors.primary }]}>
                                                <Text style={styles.photoCountText}>+{allPhotos.length - 1}</Text>
                                            </View>
                                        )}
                                    </View>
                                ) : (
                                    <View style={[styles.itemImage, { justifyContent: 'center', alignItems: 'center' }]}>
                                        <Ionicons name={isNote ? "document-text" : "cube-outline"} size={24} color={colors.icon} />
                                    </View>
                                )}
                                <View style={styles.itemInfo}>
                                    {/* Main Product Name (Quoted) */}
                                    <Text style={[styles.itemName, { color: colors.text }]}>{mainTitle}</Text>

                                    {/* Original Request Reference */}
                                    {showReference && (
                                        <View style={{ marginTop: 6, padding: 8, backgroundColor: colors.background, borderRadius: 8 }}>
                                            <Text style={{ fontSize: 10, color: colors.icon, fontFamily: 'NotoSans-Bold', textTransform: 'uppercase', marginBottom: 2 }}>
                                                {t('Original Request')}
                                            </Text>
                                            <Text style={{ fontSize: 13, color: colors.text, fontFamily: 'NotoSans-Medium' }}>
                                                {originalRequest}
                                            </Text>
                                        </View>
                                    )}

                                    {/* Brand Display */}
                                    {(item.brand || order.brand || item.company) && (
                                        <Text style={{ fontSize: 12, color: colors.icon, marginTop: 2 }}>
                                            {item.brand || order.brand || item.company}
                                        </Text>
                                    )}

                                    {(displayNotes) ? (
                                        <Text style={{ fontSize: 12, color: colors.icon, marginTop: 4 }}>
                                            {displayNotes}
                                        </Text>
                                    ) : null}

                                    {allPhotos.length > 1 && (
                                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }}>
                                            {allPhotos.slice(1).map((p: string, pIdx: number) => (
                                                <TouchableOpacity key={pIdx} onPress={() => setSelectedImage(getMediaUrl(p))} style={{ marginRight: 8 }}>
                                                    <Image source={{ uri: getMediaUrl(p) || '' }} style={{ width: 40, height: 40, borderRadius: 8 }} />
                                                </TouchableOpacity>
                                            ))}
                                        </ScrollView>
                                    )}

                                    {itemVoice && (
                                        <View style={{ marginTop: 8, maxWidth: 200 }}>
                                            <AudioPlayer uri={itemVoice} />
                                        </View>
                                    )}

                                    {!isNote && (
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                                            <Text style={[styles.itemQty, { color: colors.icon }]}>Qty: {item.quantity}</Text>
                                            <Text style={[styles.itemPrice, { color: colors.primary }]}>{currencySymbol}{(item.price || item.unitPrice || 0).toLocaleString()}</Text>
                                        </View>
                                    )}
                                </View>
                                {isNote && (
                                    <View style={{ position: 'absolute', top: 15, right: 0 }}>
                                        <View style={{ backgroundColor: colors.border, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 }}>
                                            <Text style={{ fontSize: 10, fontFamily: 'NotoSans-Bold', color: colors.text }}>NOTE</Text>
                                        </View>
                                    </View>
                                )}
                            </View>
                        );
                    })}
                </View>

                {/* Summary */}
                <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <Text style={[styles.cardTitle, { color: colors.text }]}>{t('Order Summary')}</Text>
                    <View style={styles.summaryRow}>
                        <Text style={[styles.summaryLabel, { color: colors.icon }]}>{t('Subtotal')}</Text>
                        <Text style={[styles.summaryValue, { color: colors.text }]}>{currencySymbol}{order.totalAmount.toLocaleString()}</Text>
                    </View>
                    <View style={styles.summaryRow}>
                        <Text style={[styles.summaryLabel, { color: colors.icon }]}>{t('Delivery')}</Text>
                        <Text style={[styles.summaryValue, { color: colors.sales }]}>{t('FREE')}</Text>
                    </View>
                    <View style={[styles.divider, { backgroundColor: colors.border }]} />
                    <View style={styles.summaryRow}>
                        <Text style={[styles.totalLabel, { color: colors.text }]}>{t('Total')}</Text>
                        <Text style={[styles.totalValue, { color: colors.primary }]}>{currencySymbol}{order.totalAmount.toLocaleString()}</Text>
                    </View>
                </View>
            </ScrollView>

            {/* Respond to Quote / Pay Now */}
            {order.status === 'quoted' ? (
                <View style={[styles.footer, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
                    <Text style={{ textAlign: 'center', marginBottom: 10, color: colors.text, fontFamily: 'NotoSans-Bold' }}>
                        {t('Quote Received')} - {currencySymbol}{order.totalAmount.toLocaleString()}
                    </Text>
                    <View style={{ flexDirection: 'row', gap: 10 }}>
                        <TouchableOpacity
                            style={[styles.payBtn, { flex: 1, backgroundColor: colors.error }]}
                            onPress={() => {
                                Alert.alert(t('Reject Quote'), t('Are you sure you want to reject this quote?'), [
                                    { text: t('Cancel'), style: 'cancel' },
                                    {
                                        text: t('Reject'), style: 'destructive', onPress: async () => {
                                            try {
                                                await customerService.respondToOrderQuotation(order._id || order.id, 'reject');
                                                loadOrder();
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
                            style={[styles.payBtn, { flex: 1, backgroundColor: colors.success }]}
                            onPress={() => {
                                Alert.alert(t('Approve Quote'), t('Accept this price and proceed to payment?'), [
                                    { text: t('Cancel'), style: 'cancel' },
                                    {
                                        text: t('Approve'), onPress: async () => {
                                            try {
                                                await customerService.respondToOrderQuotation(order._id || order.id, 'approve');
                                                loadOrder();
                                                Alert.alert(t('Quote Approved'), t('You can now proceed to payment.'));
                                            } catch (e) { Alert.alert(t('Error'), t('Action failed')); }
                                        }
                                    }
                                ]);
                            }}
                        >
                            <Text style={styles.payBtnText}>{t('Approve')}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            ) : (order.paymentStatus !== 'paid' && order.status !== 'cancelled' && order.status !== 'rejected') && (
                <View style={[styles.footer, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
                    <TouchableOpacity
                        style={[styles.payBtn, { backgroundColor: colors.primary }]}
                        onPress={() => setIsPaymentVisible(true)}
                    >
                        <Text style={styles.payBtnText}>{t('Pay Now')} • {currencySymbol}{order.totalAmount.toLocaleString()}</Text>
                        <Ionicons name="arrow-forward" size={20} color="#FFF" />
                    </TouchableOpacity>
                </View>
            )}

            <PaymentSimulator
                visible={isPaymentVisible}
                amount={order.totalAmount}
                orderId={order._id || order.id}
                type="order"
                walletBalance={profile?.walletBalance || 0}
                onSuccess={() => {
                    setIsPaymentVisible(false);
                    loadOrder();
                    Alert.alert(t('Success'), t('Payment successful!'));
                }}
                onCancel={() => setIsPaymentVisible(false)}
                onFailure={(err) => Alert.alert(t('Error'), err)}
            />

            <ImageModal
                visible={!!selectedImage}
                uri={getMediaUrl(selectedImage)}
                onClose={() => setSelectedImage(null)}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    headerContainer: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 100 },
    headerSafeArea: { backgroundColor: 'transparent' },
    headerContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 10 },
    backBtn: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
    headerTitle: { fontSize: 16, fontFamily: 'NotoSans-Bold' },
    headerSub: { fontSize: 12, fontFamily: 'NotoSans-Regular' },
    scrollContent: { padding: 20, paddingBottom: 40 },
    card: { borderRadius: 24, padding: 20, marginBottom: 15, borderWidth: 1 },
    cardTitle: { fontSize: 16, fontFamily: 'NotoSans-Bold', marginBottom: 20 },
    statusSection: { alignItems: 'center', paddingVertical: 10 },
    statusMain: { fontSize: 24, fontFamily: 'NotoSans-Black', marginTop: 15 },
    statusSub: { fontSize: 14, fontFamily: 'NotoSans-Regular', marginTop: 5, textAlign: 'center' },
    timeline: { paddingLeft: 10 },
    stepRow: { flexDirection: 'row', gap: 15, minHeight: 45 },
    stepIndicator: { alignItems: 'center', width: 20 },
    dot: { width: 10, height: 10, borderRadius: 5 },
    line: { width: 2, flex: 1, marginVertical: 4 },
    stepContent: { paddingBottom: 20 },
    stepLabel: { fontSize: 14, fontFamily: 'NotoSans-Medium' },
    itemRow: { flexDirection: 'row', paddingVertical: 15, gap: 15 },
    itemImage: { width: 70, height: 70, borderRadius: 12, backgroundColor: '#F0F0F0' },
    itemInfo: { flex: 1, justifyContent: 'center' },
    itemName: { fontSize: 15, fontFamily: 'NotoSans-Bold' },
    itemQty: { fontSize: 12, marginTop: 4 },
    itemPrice: { fontSize: 14, fontFamily: 'NotoSans-Black', marginTop: 4 },
    summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
    summaryLabel: { fontSize: 14, fontFamily: 'NotoSans-Regular' },
    summaryValue: { fontSize: 14, fontFamily: 'NotoSans-Bold' },
    divider: { height: 1, marginVertical: 15 },
    totalLabel: { fontSize: 18, fontFamily: 'NotoSans-Bold' },
    totalValue: { fontSize: 20, fontFamily: 'NotoSans-Black' },
    deliveryInfoRow: { marginBottom: 20 },
    deliveryInfoItem: { flexDirection: 'row', alignItems: 'center' },
    deliveryLabel: { fontSize: 11, fontFamily: 'NotoSans-Regular', textTransform: 'uppercase' },
    deliveryValue: { fontSize: 15, fontFamily: 'NotoSans-Bold' },
    callDriverBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderRadius: 12, paddingVertical: 10, gap: 8 },
    callDriverText: { fontSize: 14, fontFamily: 'NotoSans-Bold' },
    footer: { padding: 20, borderTopWidth: 1, paddingBottom: Platform.OS === 'ios' ? 40 : 20 },
    payBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 56, borderRadius: 16, gap: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 5 },
    payBtnText: { fontSize: 16, fontFamily: 'NotoSans-Bold', color: '#FFF' },
    photoCountBadge: { position: 'absolute', bottom: -5, right: -5, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8, borderWidth: 2, borderColor: '#FFF' },
    photoCountText: { color: '#FFF', fontSize: 10, fontWeight: '800' },
});
