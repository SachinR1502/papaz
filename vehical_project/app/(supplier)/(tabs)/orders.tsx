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
import { ActivityIndicator, Alert, Dimensions, FlatList, KeyboardAvoidingView, Modal, Platform, RefreshControl, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
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
    const [quoteAmount, setQuoteAmount] = useState('');
    const [quoteOrder, setQuoteOrder] = useState<any>(null);

    useEffect(() => {
        const socket = socketService.connect();
        const handleUpdate = (data: any) => {
            console.log('Supplier Order Update:', data);
            refreshData();
        };

        socketService.on('order_update', handleUpdate);
        return () => { socketService.off('order_update', handleUpdate); };
    }, []);

    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [showDeliveryModal, setShowDeliveryModal] = useState(false);
    const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
    const [deliveryInfo, setDeliveryInfo] = useState({
        vehicleNumber: '',
        driverName: '',
        driverPhone: ''
    });

    const openDeliveryModal = (order: any) => {
        setSelectedOrderId(order.id);
        setDeliveryInfo({
            vehicleNumber: order.deliveryDetails?.vehicleNumber || '',
            driverName: order.deliveryDetails?.driverName || '',
            driverPhone: order.deliveryDetails?.driverPhone || ''
        });
        setShowDeliveryModal(true);
    };

    const handleAction = async (orderId: string, action: string, status?: string, data?: any) => {
        setActionLoading(orderId);
        await updateOrder(orderId, action, status, data);
        setActionLoading(null);
    };

    const handleConfirmDelivery = async () => {
        if (!selectedOrderId) return;
        if (!deliveryInfo.vehicleNumber || !deliveryInfo.driverName || !deliveryInfo.driverPhone) {
            Alert.alert(t('Missing Information'), t('Please fill all delivery details.'));
            return;
        }

        const currentOrder = orders.find(o => o.id === selectedOrderId) || wholesaleOrders.find(o => o.id === selectedOrderId);
        const statusToUse = (currentOrder?.status === 'packed' || currentOrder?.status === 'accepted') ? 'out_for_delivery' : currentOrder?.status || 'out_for_delivery';

        await handleAction(selectedOrderId, 'update_status', statusToUse, { deliveryDetails: deliveryInfo });
        setShowDeliveryModal(false);
        setDeliveryInfo({ vehicleNumber: '', driverName: '', driverPhone: '' });
        setSelectedOrderId(null);
    };

    const handleQuote = (item: any) => {
        setQuoteOrder(item);
        const initialAmount = item.amount || item.totalAmount || 0;
        setQuoteAmount(initialAmount > 0 ? initialAmount.toString() : '');
        setIsQuoteModalVisible(true);
    };

    const handleSubmitQuote = async () => {
        if (!quoteOrder) return;
        if (!quoteAmount || isNaN(Number(quoteAmount))) {
            Alert.alert(t('error') || 'Error', t('invalid_price') || 'Please enter a valid price');
            return;
        }

        const orderId = quoteOrder.id;
        setActionLoading(orderId);
        setIsQuoteModalVisible(false);
        try {
            await sendQuotation(orderId, [], Number(quoteAmount));
            Alert.alert(t('success') || 'Success', t('quote_sent_success') || 'Quotation submitted successfully');
        } catch (e) {
            console.error('Send quote error:', e);
            Alert.alert(t('error') || 'Error', t('failed_to_send_quote') || 'Failed to send quotation');
        } finally {
            setActionLoading(null);
            setQuoteOrder(null);
            setQuoteAmount('');
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
                            <Text style={[styles.modalTitle, { color: colors.text }]}>{t('submit_quote') || 'Submit Quotation'}</Text>
                            <TouchableOpacity onPress={() => setIsQuoteModalVisible(false)}>
                                <Ionicons name="close" size={24} color={colors.text} />
                            </TouchableOpacity>
                        </View>


                        <View style={styles.modalBody}>
                            {quoteOrder && quoteOrder.vehicleDetails && (
                                <View style={{ marginBottom: 20, padding: 12, backgroundColor: colors.card, borderRadius: 12 }}>
                                    <Text style={{ fontSize: 13, color: colors.icon, marginBottom: 4 }}>Requested Vehicle</Text>
                                    <Text style={{ fontSize: 16, fontWeight: 'bold', color: colors.text }}>
                                        {quoteOrder.vehicleDetails.make} {quoteOrder.vehicleDetails.model}
                                    </Text>
                                    <Text style={{ fontSize: 13, color: colors.text, marginTop: 2 }}>
                                        {quoteOrder.vehicleDetails.year} • {quoteOrder.vehicleDetails.fuelType || 'N/A'}
                                    </Text>
                                </View>
                            )}

                            <Text style={[styles.inputLabel, { color: colors.text }]}>{t('enter_price_desc') || "Enter the total price for this request."}</Text>
                            <View style={[styles.inputContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
                                <Text style={[styles.currencyPrefix, { color: colors.primary }]}>{currencySymbol}</Text>
                                <TextInput
                                    style={[styles.input, { flex: 1, borderWidth: 0 }]}
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
                                disabled={actionLoading === quoteOrder?.id}
                            >
                                {actionLoading === quoteOrder?.id ? <ActivityIndicator color="#FFF" /> : (
                                    <Text style={styles.saveBtnText}>{t('submit_quote') || 'Send Quote'}</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>

            {/* Delivery Details Modal */}
            <Modal
                visible={showDeliveryModal}
                animationType="slide"
                transparent
                onRequestClose={() => setShowDeliveryModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: colors.background, borderColor: colors.border }]}>
                        <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
                            <Text style={[styles.modalTitle, { color: colors.text }]}>{t('Delivery Details')}</Text>
                            <TouchableOpacity onPress={() => setShowDeliveryModal(false)}>
                                <Ionicons name="close" size={24} color={colors.text} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.modalBody}>
                            <Text style={[styles.inputLabel, { color: colors.text }]}>{t('Vehicle Number')}</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
                                value={deliveryInfo.vehicleNumber}
                                onChangeText={(val) => setDeliveryInfo(prev => ({ ...prev, vehicleNumber: val }))}
                                placeholder="KA 03 MG 1234"
                                placeholderTextColor={colors.icon}
                            />

                            <Text style={[styles.inputLabel, { color: colors.text, marginTop: 15 }]}>{t('Driver Name')}</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
                                value={deliveryInfo.driverName}
                                onChangeText={(val) => setDeliveryInfo(prev => ({ ...prev, driverName: val }))}
                                placeholder="John Doe"
                                placeholderTextColor={colors.icon}
                            />

                            <Text style={[styles.inputLabel, { color: colors.text, marginTop: 15 }]}>{t('Driver Mobile')}</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
                                value={deliveryInfo.driverPhone}
                                onChangeText={(val) => setDeliveryInfo(prev => ({ ...prev, driverPhone: val }))}
                                placeholder="+91 9988776655"
                                placeholderTextColor={colors.icon}
                                keyboardType="phone-pad"
                            />

                            <TouchableOpacity
                                style={[styles.saveBtn, { backgroundColor: colors.primary }]}
                                onPress={handleConfirmDelivery}
                            >
                                <Text style={styles.saveBtnText}>{t('Confirm Out for Delivery')}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

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
    closeBtnText: { color: '#FFF', fontSize: 16, fontFamily: 'NotoSans-Bold' }
});
