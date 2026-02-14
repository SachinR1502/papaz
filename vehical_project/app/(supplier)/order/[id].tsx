import { AudioPlayer } from '@/components/ui/AudioPlayer';
import { ImageModal } from '@/components/ui/ImageModal';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Colors } from '@/constants/theme';
import { useAdmin } from '@/context/AdminContext';
import { useLanguage } from '@/context/LanguageContext';
import { useSupplier } from '@/context/SupplierContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { parseDescription } from '@/utils/mediaHelpers';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Dimensions, FlatList, Image, KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
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
    const [isQuoteModalVisible, setIsQuoteModalVisible] = useState(false);
    const [quoteAmount, setQuoteAmount] = useState('');
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    const order = orders.find((o: any) => o.id === id) || wholesaleOrders.find((wo: any) => wo.id === id);

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

    const isWholesale = !!order.technicianName;
    const currentStatus = order.status || 'inquiry';
    const isActionable = currentStatus === 'inquiry' || (isWholesale && (currentStatus === 'pending' || currentStatus === 'quoted'));

    // Extract global media from order description/name
    const mainParsed = parseDescription(order.partName || order.name || order.description || '');

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
        const initialAmount = order.amount || order.totalAmount || 0;
        setQuoteAmount(initialAmount > 0 ? initialAmount.toString() : '');
        setIsQuoteModalVisible(true);
    };

    const handleSubmitQuote = async () => {
        if (!quoteAmount || isNaN(Number(quoteAmount))) {
            Alert.alert(t('error'), t('invalid_price'));
            return;
        }

        setActionLoading(true);
        setIsQuoteModalVisible(false);
        try {
            await sendQuotation(order.id, [], Number(quoteAmount));
            Alert.alert(t('success'), t('quote_sent_success'));
        } catch (e) {
            Alert.alert(t('error'), t('failed_to_send_quote'));
        } finally {
            setActionLoading(false);
        }
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
                {(mainParsed.photoUri || mainParsed.voiceUri) && (
                    <View style={{ marginBottom: 24 }}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('global_attachments') || 'Main Attachments'}</Text>
                        <View style={{ gap: 12 }}>
                            {mainParsed.photoUri && (
                                <TouchableOpacity
                                    style={[styles.imageCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                                    onPress={() => setSelectedImage(mainParsed.photoUri)}
                                >
                                    <Image source={{ uri: mainParsed.photoUri }} style={styles.attachedImage} resizeMode="cover" />
                                </TouchableOpacity>
                            )}
                            {mainParsed.voiceUri && <AudioPlayer uri={mainParsed.voiceUri} />}
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
                                {isWholesale ? order.technicianName : (order.customer?.fullName || 'Valuable Customer')}
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
                                {order.location || order.customer?.city || 'Direct Shop Pickup'}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Order Items with Per-Item Attachments */}
                <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('items_ordered') || 'Items Ordered'}</Text>
                <View style={[styles.detailSection, { backgroundColor: colors.card, borderColor: colors.border, padding: 0 }]}>
                    {(order.items || [{ name: order.partName || order.name, quantity: order.quantity, amount: order.amount }]).map((item: any, index: number, arr: any[]) => {
                        const itemParsed = parseDescription(item.description || item.name || '');

                        // Support explicit photo/voice fields
                        const photoUri = (item.photos && item.photos.length > 0) ? item.photos[0] : (item.photoUri || itemParsed.photoUri);
                        const voiceUri = item.voiceNote || item.voiceUri || itemParsed.voiceUri;
                        const allPhotos = item.photos || (photoUri ? [photoUri] : []);

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
                                    <Text style={{ fontSize: 13, color: colors.icon }}>{item.brand || order.brand || item.company || ''}</Text>
                                    {itemParsed.displayNotes ? (
                                        <Text style={{ fontSize: 13, color: colors.icon, marginTop: 4 }}>{itemParsed.displayNotes}</Text>
                                    ) : null}

                                    {/* Item Attachments */}
                                    {(allPhotos.length > 0 || voiceUri) && (
                                        <View style={{ gap: 10, marginTop: 8 }}>
                                            {allPhotos.length > 0 && (
                                                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexDirection: 'row', gap: 10 }}>
                                                    {allPhotos.map((p: string, pIdx: number) => (
                                                        <TouchableOpacity key={pIdx} onPress={() => setSelectedImage(p)}>
                                                            <Image source={{ uri: p }} style={{ width: 60, height: 60, borderRadius: 8, marginRight: 10 }} />
                                                        </TouchableOpacity>
                                                    ))}
                                                </ScrollView>
                                            )}
                                            {voiceUri && (
                                                <View style={{ flex: 1, maxWidth: 220 }}>
                                                    <AudioPlayer uri={voiceUri} />
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
                            <View style={styles.detailRow}>
                                <MaterialCommunityIcons name="truck-delivery" size={24} color={colors.sales} />
                                <View style={{ flex: 1, marginLeft: 16 }}>
                                    <Text style={[styles.detailLabel, { color: colors.sales }]}>{t('vehicle_number')}</Text>
                                    <Text style={[styles.detailValue, { color: colors.text, fontSize: 16 }]}>{order.deliveryDetails.vehicleNumber}</Text>
                                </View>
                            </View>
                            <View style={[styles.detailRow, { marginTop: 16 }]}>
                                <Ionicons name="person-circle" size={24} color={colors.sales} />
                                <View style={{ flex: 1, marginLeft: 16 }}>
                                    <Text style={[styles.detailLabel, { color: colors.sales }]}>{t('driver')}</Text>
                                    <Text style={[styles.detailValue, { color: colors.text }]}>
                                        {order.deliveryDetails.driverName} • {order.deliveryDetails.driverPhone}
                                    </Text>
                                </View>
                            </View>
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
                        onPress={() => handleAction('update_status', (currentStatus === 'accepted' || currentStatus === 'confirmed') ? 'packed' : 'out_for_delivery')}
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
            <Modal
                visible={isQuoteModalVisible}
                animationType="slide"
                transparent
                onRequestClose={() => setIsQuoteModalVisible(false)}
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.modalOverlay}
                >
                    <View style={[styles.modalContent, { backgroundColor: colors.background, borderColor: colors.border }]}>
                        <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
                            <Text style={[styles.modalTitle, { color: colors.text }]}>{t('submit_quote')}</Text>
                            <TouchableOpacity onPress={() => setIsQuoteModalVisible(false)}>
                                <Ionicons name="close" size={24} color={colors.text} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.modalBody}>
                            <Text style={[styles.inputLabel, { color: colors.text }]}>{t('enter_price_desc')}</Text>
                            <View style={[styles.inputContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
                                <Text style={[styles.currencyPrefix, { color: colors.primary }]}>{currencySymbol}</Text>
                                <TextInput
                                    style={[styles.input, { flex: 1, borderWidth: 0, color: colors.text }]}
                                    value={quoteAmount}
                                    onChangeText={setQuoteAmount}
                                    placeholder="0.00"
                                    placeholderTextColor={colors.icon}
                                    keyboardType="numeric"
                                    autoFocus
                                />
                            </View>

                            <TouchableOpacity
                                style={[styles.saveBtn, { backgroundColor: colors.primary, marginTop: 20 }]}
                                onPress={handleSubmitQuote}
                            >
                                <Text style={styles.saveBtnText}>{t('send_quote') || 'Send Quote'}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>

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
    saveBtnText: { color: '#FFF', fontSize: 16, fontFamily: 'NotoSans-Bold' }
});
