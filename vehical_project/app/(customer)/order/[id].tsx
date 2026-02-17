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
                                order.status === 'shipped' ? t('Your order is on the way') :
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
                            { id: 'shipped', label: t('Shipped'), active: ['shipped', 'delivered'].includes(order.status) },
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

                {/* Delivery Details (If available) */}
                {order.deliveryDetails && (
                    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <Text style={[styles.cardTitle, { color: colors.text }]}>{t('Delivery Information')}</Text>
                        <View style={styles.deliveryInfoRow}>
                            <View style={styles.deliveryInfoItem}>
                                <Ionicons name="car-sport" size={20} color={colors.primary} />
                                <View style={{ marginLeft: 12 }}>
                                    <Text style={[styles.deliveryLabel, { color: colors.icon }]}>{t('Vehicle Number')}</Text>
                                    <Text style={[styles.deliveryValue, { color: colors.text }]}>{order.deliveryDetails.vehicleNumber}</Text>
                                </View>
                            </View>
                            <View style={[styles.deliveryInfoItem, { marginTop: 15 }]}>
                                <Ionicons name="person" size={20} color={colors.primary} />
                                <View style={{ marginLeft: 12 }}>
                                    <Text style={[styles.deliveryLabel, { color: colors.icon }]}>{t('Driver')}</Text>
                                    <Text style={[styles.deliveryValue, { color: colors.text }]}>{order.deliveryDetails.driverName} • {order.deliveryDetails.driverPhone}</Text>
                                </View>
                            </View>
                        </View>
                        <TouchableOpacity
                            style={[styles.callDriverBtn, { borderColor: colors.primary }]}
                            onPress={() => Linking.openURL(`tel:${order.deliveryDetails.driverPhone}`)}
                        >
                            <Ionicons name="call" size={18} color={colors.primary} />
                            <Text style={[styles.callDriverText, { color: colors.primary }]}>{t('Call Driver')}</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Items */}
                <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <Text style={[styles.cardTitle, { color: colors.text }]}>{t('Items')}</Text>
                    {order.items.map((item: any, index: number) => {
                        const parsed = parseDescription(item.description || item.name);
                        let displayName = parsed.displayName || item.name || '';
                        let displayNotes = parsed.displayNotes;
                        const { photoUri, voiceUri } = parsed;

                        // Metadata extraction from name
                        let displayMeta = '';
                        if (displayName.includes(' - ')) {
                            const parts = displayName.split(' - ');
                            const brand = parts.pop();
                            displayName = parts.join(' - ');
                            displayMeta = brand ? ` • ${brand}` : '';
                        }

                        const pnMatch = displayName.match(/\(PN: (.*?)\)/);
                        if (pnMatch) {
                            const pn = pnMatch[1];
                            displayName = displayName.replace(pnMatch[0], '').trim();
                            displayMeta = ` • PN: ${pn}` + displayMeta;
                        }

                        const isNote = (item.price === 0 || item.unitPrice === 0) && !item.product;
                        const allPhotos = item.photos || (item.image || photoUri ? [item.image || photoUri] : []);
                        const itemVoice = item.voiceNote || voiceUri;

                        return (
                            <View key={index} style={[styles.itemRow, { borderBottomColor: colors.border, borderBottomWidth: index === order.items.length - 1 ? 0 : 1 }]}>
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
                                    <Text style={[styles.itemName, { color: colors.text }]}>{displayName}</Text>
                                    {(displayMeta || displayNotes) ? (
                                        <Text style={{ fontSize: 12, color: colors.icon, marginTop: 2 }}>
                                            {displayMeta.replace(/^ • /, '')}
                                            {displayMeta && displayNotes ? '\n' : ''}
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
