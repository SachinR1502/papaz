import { CartModal } from '@/components/customer/CartModal';
import { CheckoutModal } from '@/components/customer/CheckoutModal';
import { OrderSuccessModal } from '@/components/customer/OrderSuccessModal';
import { PartRequestItem, PartRequestModal } from '@/components/customer/PartRequestModal';
import { ProductCard } from '@/components/customer/ProductCard';
import { Colors } from '@/constants/theme';
import { useCustomer } from '@/context/CustomerContext';
import { useLanguage } from '@/context/LanguageContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { customerService } from '@/services/customerService';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as Location from 'expo-location';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    Image,
    Platform,
    RefreshControl,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const CATEGORIES = [
    { id: 'cat_spare_parts', icon: 'cog-outline', color: '#007AFF', label: 'Spare Parts' },
    { id: 'cat_accessories', icon: 'car-sport-outline', color: '#AF52DE', label: 'Accessories' },
    { id: 'cat_tires', icon: 'disc-outline', color: '#FF3B30', label: 'Tires' }, // changed icon to valid Ionicons
    { id: 'cat_batteries', icon: 'battery-charging-outline', color: '#FFCC00', label: 'Batteries' },
    { id: 'cat_lubricants', icon: 'water-outline', color: '#34C759', label: 'Oils & Fluids' },
];

export default function RequestProductScreen() {
    const router = useRouter();
    const params = useLocalSearchParams<any>();
    const { t } = useLanguage();
    const colorScheme = useColorScheme();
    const theme = colorScheme ?? 'light';
    const colors = Colors[theme];
    const isDark = theme === 'dark';

    const {
        cart,
        addToCart,
        updateCartQuantity,
        clearCart,
        wishlist,
        addToWishlist,
        removeFromWishlist,
        profile,
        loadGarages,
        garages,
        vehicles,
        uploadFile
    } = useCustomer();

    // UI States
    const [search, setSearch] = useState(params.vehicle || '');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [userLocationName, setUserLocationName] = useState(t('detecting_location_dots'));
    const [userCoords, setUserCoords] = useState<{ latitude: number, longitude: number } | null>(null);
    const [sortByNearest, setSortByNearest] = useState(false);

    // Data States
    const [products, setProducts] = useState<any[]>([]);
    const [suppliers, setSuppliers] = useState<any[]>([]);

    // Modal States
    const [isCartVisible, setIsCartVisible] = useState(false);
    const [isCheckoutVisible, setIsCheckoutVisible] = useState(false);
    const [isRequestModalVisible, setIsRequestModalVisible] = useState(false);
    const [isSuccessVisible, setIsSuccessVisible] = useState(false);
    const [lastOrderId, setLastOrderId] = useState<string | null>(null);
    const [isSubmittingRequest, setIsSubmittingRequest] = useState(false);

    // Prefill logic
    const prefillItems = useMemo(() => {
        if (params.prefillItems) {
            try {
                return JSON.parse(params.prefillItems);
            } catch (e) {
                return [];
            }
        }
        return [];
    }, [params.prefillItems]);


    const initialNotes = params.initialNotes || '';
    const initialPhotos = useMemo(() => {
        try { return params.initialPhotos ? JSON.parse(params.initialPhotos) : []; } catch { return []; }
    }, [params.initialPhotos]);
    const initialVoiceNote = params.initialVoiceNote || null;

    useEffect(() => {
        if (prefillItems.length > 0) {
            setIsRequestModalVisible(true);
        }
        detectLocation();
        loadData();
    }, [selectedCategory, sortByNearest]);

    const detectLocation = async () => {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setUserLocationName('Default Location');
                return;
            }

            const location = await Location.getCurrentPositionAsync({});
            const coords = { latitude: location.coords.latitude, longitude: location.coords.longitude };
            setUserCoords(coords);

            const reverse = await Location.reverseGeocodeAsync(coords);
            if (reverse[0]) {
                setUserLocationName(`${reverse[0].city || reverse[0].district}, ${reverse[0].region}`);
            }

            // Reload data with coordinates
            loadData(coords);
        } catch (error) {
            console.error('Location detection failed:', error);
        }
    };

    const loadData = async (coords?: { latitude: number, longitude: number }) => {
        setLoading(true);
        try {
            const lat = coords?.latitude || userCoords?.latitude;
            const lng = coords?.longitude || userCoords?.longitude;

            const [prodData, supplierData] = await Promise.all([
                customerService.getProducts(selectedCategory || undefined, search || undefined, lat, lng, sortByNearest),
                customerService.getSuppliers(lat, lng)
            ]);

            setProducts(prodData);
            setSuppliers(supplierData);

            if (lat && lng) {
                loadGarages(undefined, lat, lng);
            }
        } catch (error) {
            console.error('Data load failed:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        loadData();
    };

    const handlePartRequest = async (items: PartRequestItem[], notes: string, supplierId: string | null, photos: string[], voiceNote: string | null, vehicleId: string | null) => {
        setIsSubmittingRequest(true);
        try {
            // Upload media if present
            const uploadedPhotosPromise = photos.length > 0
                ? Promise.all(photos.map(p => {
                    // Check if it's already a remote URL (e.g. from prefill)
                    if (p.startsWith('http')) return Promise.resolve(p);
                    return uploadFile(p, 'image').then(res => res.url || res.path);
                }))
                : Promise.resolve([]);

            const uploadedVoicePromise = voiceNote
                ? (voiceNote.startsWith('http') ? Promise.resolve(voiceNote) : uploadFile(voiceNote, 'audio').then(res => res.url || res.path))
                : Promise.resolve(null);

            const [uploadedPhotos, uploadedVoice] = await Promise.all([uploadedPhotosPromise, uploadedVoicePromise]);

            // Master notes no longer get the extra photo links
            let finalNotes = notes;

            const mappedItems = items.map((item, idx) => ({
                name: item.name,
                description: item.description, // Keep item description specific
                quantity: item.quantity || 1,
                price: item.price,
                productId: item.productId,
                partNumber: item.partNumber,
                brand: item.brand,
                image: item.image, // Only use item-specific image if it exists
            }));

            console.log('[handlePartRequest] Requesting part with data:', {
                itemCount: items.length,
                jobId: params.jobId,
                vehicleId: vehicleId || params.vehicleId
            });

            const response = await customerService.requestPart({
                items: mappedItems,
                name: items.length === 1 ? items[0].name : `Bulk Request (${items.length} items)`,
                description: finalNotes,
                quantity: items.length,
                supplierId: supplierId || undefined,
                jobId: params.jobId,
                vehicleId: vehicleId || params.vehicleId,
                vehicleDetails: (vehicleId || params.vehicleId) ? vehicles.find(v => (v.id || v._id) === (vehicleId || params.vehicleId)) : undefined,
                photos: uploadedPhotos,
                voiceNote: uploadedVoice
            });

            console.log('[handlePartRequest] Raw Response:', JSON.stringify(response, null, 2));

            const order = response?.order || response;

            if (order && (order._id || order.id)) {
                console.log('[handlePartRequest] Success! Order ID:', order._id || order.id);
                setLastOrderId(order._id || order.id);
                setIsRequestModalVisible(false);
                setIsSuccessVisible(true);
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            } else {
                console.warn('[handlePartRequest] Invalid response structure - order not found in:', response);
                Alert.alert(t('error'), t('request_failed'));
            }
        } catch (error) {
            console.error('Request part error:', error);
            Alert.alert(t('error'), t('request_failed'));
        } finally {
            setIsSubmittingRequest(false);
        }
    };

    const handlePlaceOrder = async (checkoutData: any) => {
        console.log('[RequestProduct] handlePlaceOrder called with:', checkoutData);
        try {
            const orderData = {
                items: cart.map(it => ({
                    product: it.id || it._id,
                    name: it.name,
                    price: it.price,
                    quantity: it.quantity,
                    image: it.image,
                    category: it.category
                })),
                paymentMethod: checkoutData.paymentMethod,
                deliveryType: checkoutData.deliveryType,
                deliveryAddressId: checkoutData.deliveryAddressId,
                garageId: checkoutData.garageId,
                totalAmount: cart.reduce((sum, it) => sum + (parseFloat(it.price) * it.quantity), 0)
            };

            console.log('[RequestProduct] Constructed orderData:', JSON.stringify(orderData, null, 2));

            const response = await customerService.createOrder(orderData);
            console.log('[RequestProduct] CreateOrder Response:', response);

            // Backend returns the order object directly for createOrder, but { order: ... } for requestPart
            const order = response?.order || response;

            if (order && (order._id || order.id)) {
                console.log('[RequestProduct] Order creation successful, ID:', order._id || order.id);
                setLastOrderId(order._id || order.id);
                clearCart();
                setIsCheckoutVisible(false);

                // Small delay to ensure CheckoutModal closes smoothly before SuccessModal opens
                setTimeout(() => {
                    setIsSuccessVisible(true);
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                }, 400);
            } else {
                console.warn('[RequestProduct] Order creation response invalid structure:', response);
            }
        } catch (error: any) {
            console.error('[RequestProduct] handlePlaceOrder error:', error);
            Alert.alert(t('error'), error.message || t('order_failed'));
        }
    };

    const isJobOrder = prefillItems.length > 0;

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
            <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

            {/* Background Blobs for specific Space/Premium feel */}
            <View style={[styles.blob, { top: -100, right: -100, backgroundColor: colors.primary + '10' }]} />
            <View style={[styles.blob, { bottom: 100, left: -100, backgroundColor: colors.secondary + '10' }]} />

            {/* Header */}
            <View style={[styles.header, { backgroundColor: isDark ? 'rgba(28,28,30,0.8)' : 'rgba(255,255,255,0.8)', borderBottomColor: colors.border }]}>
                <View style={styles.headerTop}>
                    <TouchableOpacity onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: colors.card }]}>
                        <Ionicons name="arrow-back" size={24} color={colors.text} />
                    </TouchableOpacity>
                    <View style={styles.headerTitleContainer}>
                        <Text style={[styles.headerTitle, { color: colors.text }]}>{t('spare_parts_store')}</Text>
                        <View style={styles.locationRow}>
                            <Ionicons name="location" size={12} color={colors.primary} />
                            <Text style={[styles.locationText, { color: colors.icon }]} numberOfLines={1}>{userLocationName}</Text>
                        </View>
                    </View>
                    <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.card }]} onPress={() => setIsCartVisible(true)}>
                        <Ionicons name="cart-outline" size={24} color={colors.text} />
                        {cart.length > 0 && (
                            <View style={[styles.badge, { backgroundColor: colors.primary }]}>
                                <Text style={styles.badgeText}>{cart.length}</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                </View>

                {/* Sub-Header Actions */}
                <View style={styles.subHeaderActions}>
                    <TouchableOpacity
                        style={[
                            styles.nearbyToggle,
                            {
                                backgroundColor: sortByNearest ? colors.primary + '15' : colors.card,
                                borderColor: sortByNearest ? colors.primary : colors.border
                            }
                        ]}
                        onPress={() => {
                            setSortByNearest(!sortByNearest);
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        }}
                    >
                        <Ionicons name="navigate-circle" size={18} color={sortByNearest ? colors.primary : colors.icon} />
                        <Text style={[styles.nearbyText, { color: sortByNearest ? colors.primary : colors.icon }]}>
                            {sortByNearest ? t('nearby_active') || 'Nearby Active' : t('sort_by_nearest') || 'Sort by Nearest'}
                        </Text>
                        {sortByNearest && <View style={[styles.nearbyDot, { backgroundColor: colors.primary }]} />}
                    </TouchableOpacity>

                    {userCoords && (
                        <View style={styles.coordinatesPill}>
                            <Text style={[styles.coordsText, { color: colors.icon }]}>
                                {userCoords.latitude.toFixed(3)}, {userCoords.longitude.toFixed(3)}
                            </Text>
                        </View>
                    )}
                </View>

                {/* Search */}
                <View style={[styles.searchBar, { backgroundColor: isDark ? '#2C2C2E' : '#F0F0F0' }]}>
                    <Ionicons name="search" size={20} color={colors.icon} />
                    <TextInput
                        style={[styles.searchInput, { color: colors.text }]}
                        placeholder={t('search_parts_placeholder')}
                        placeholderTextColor={colors.icon}
                        value={search}
                        onChangeText={setSearch}
                        onSubmitEditing={() => loadData()}
                    />
                    {search.length > 0 && (
                        <TouchableOpacity onPress={() => { setSearch(''); loadData(); }}>
                            <Ionicons name="close-circle" size={18} color={colors.icon} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* Job Context Banner */}
            {isJobOrder && (
                <View style={[styles.jobBanner, { backgroundColor: '#FF950015', borderBottomColor: '#FF950030' }]}>
                    <View style={styles.jobBannerContent}>
                        <Ionicons name="construct" size={16} color="#FF9500" />
                        <Text style={[styles.jobBannerText, { color: '#FF9500' }]}>
                            {t('ordering_for_job_parts').replace('{vehicle}', search || t('your_vehicle'))}
                        </Text>
                    </View>
                    <TouchableOpacity
                        style={styles.jobBannerAction}
                        onPress={() => setIsRequestModalVisible(true)}
                    >
                        <Text style={[styles.jobBannerActionText, { color: '#FF9500' }]}>{t('view_request_list')}</Text>
                        <Ionicons name="arrow-forward" size={14} color="#FF9500" />
                    </TouchableOpacity>
                </View>
            )}

            <ScrollView
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Categories */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('categories_label')}</Text>
                    </View>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryList}>
                        {CATEGORIES.map((cat) => (
                            <TouchableOpacity
                                key={cat.id}
                                style={[
                                    styles.categoryBtn,
                                    {
                                        backgroundColor: selectedCategory === cat.id ? colors.primary : colors.card,
                                        borderColor: selectedCategory === cat.id ? colors.primary : colors.border
                                    }
                                ]}
                                onPress={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
                            >
                                <Ionicons name={cat.icon as any} size={20} color={selectedCategory === cat.id ? '#FFF' : colors.primary} />
                                <Text style={[styles.categoryText, { color: selectedCategory === cat.id ? '#FFF' : colors.text }]}>{cat.label || t(cat.id)}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {/* Custom Request Banner - More prominent */}
                <TouchableOpacity
                    style={[styles.requestBanner, { backgroundColor: colors.card, borderColor: colors.primary }]}
                    onPress={() => setIsRequestModalVisible(true)}
                >
                    <View style={[styles.requestBannerLeft, { backgroundColor: colors.primary + '15' }]}>
                        <MaterialCommunityIcons name="clipboard-edit-outline" size={32} color={colors.primary} />
                    </View>
                    <View style={{ flex: 1, paddingHorizontal: 15 }}>
                        <Text style={[styles.requestBannerTitle, { color: colors.text }]}>{t('cant_find_the_part')}</Text>
                        <Text style={[styles.requestBannerSub, { color: colors.icon }]}>{t('request_it_now')}</Text>
                    </View>
                    <View style={[styles.requestBannerAction, { backgroundColor: colors.primary }]}>
                        <Ionicons name="arrow-forward" size={20} color="#FFF" />
                    </View>
                </TouchableOpacity>

                {/* Product Grid */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('available_parts')}</Text>
                        {loading && <ActivityIndicator size="small" color={colors.primary} />}
                    </View>

                    {loading && !refreshing && products.length === 0 ? (
                        <View style={{ padding: 20, alignItems: 'center' }}>
                            <ActivityIndicator color={colors.primary} />
                        </View>
                    ) : (
                        <View style={styles.productGrid}>
                            {products.length > 0 ? products.map((item) => (
                                <ProductCard
                                    key={item.id || item._id}
                                    product={item}
                                    onAdd={(it) => {
                                        addToCart(it);
                                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                    }}
                                    onWishlist={(it) => {
                                        const id = it.id || it._id;
                                        if (wishlist.includes(id)) {
                                            removeFromWishlist(id);
                                        } else {
                                            addToWishlist(id);
                                        }
                                    }}
                                    isWishlisted={wishlist.includes(item.id || item._id)}
                                />
                            )) : (
                                <View style={styles.emptyState}>
                                    <View style={[styles.emptyIconCircle, { backgroundColor: colors.border }]}>
                                        <Ionicons name="search" size={40} color={colors.icon} />
                                    </View>
                                    <Text style={[styles.emptyText, { color: colors.text }]}>{t('no_products_found')}</Text>
                                    <Text style={[styles.emptySubText, { color: colors.icon }]}>{t('try_adjusting_search')}</Text>
                                    <TouchableOpacity
                                        style={[styles.emptyActionBtn, { backgroundColor: colors.primary }]}
                                        onPress={() => setIsRequestModalVisible(true)}
                                    >
                                        <Text style={{ color: '#FFF', fontWeight: 'bold' }}>{t('create_custom_request')}</Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>
                    )}
                </View>
            </ScrollView>

            {/* Modals */}
            <CartModal
                visible={isCartVisible}
                onClose={() => setIsCartVisible(false)}
                items={cart}
                onUpdateQuantity={updateCartQuantity}
                onRemove={(id) => updateCartQuantity(id, -100)}
                onCheckout={() => {
                    setIsCartVisible(false);
                    setIsCheckoutVisible(true);
                }}
                currencySymbol="₹"
            />

            <CheckoutModal
                visible={isCheckoutVisible}
                onClose={() => setIsCheckoutVisible(false)}
                items={cart}
                total={cart.reduce((sum, it) => sum + (parseFloat(it.price) * it.quantity), 0)}
                addresses={profile?.savedAddresses || []}
                garages={garages}
                walletBalance={profile?.walletBalance || 0}
                onPlaceOrder={handlePlaceOrder}
                currencySymbol="₹"
            />

            <PartRequestModal
                visible={isRequestModalVisible}
                onClose={() => setIsRequestModalVisible(false)}
                onSubmit={handlePartRequest}
                suppliers={suppliers}
                prefillItems={prefillItems}
                initialNotes={initialNotes}
                initialPhotos={initialPhotos}
                initialVoiceNote={initialVoiceNote}
                partsSource={params.partsSource}
                vehicles={vehicles}
                submitting={isSubmittingRequest}
            />

            <OrderSuccessModal
                visible={isSuccessVisible}
                onClose={() => setIsSuccessVisible(false)}
                onViewHistory={() => {
                    setIsSuccessVisible(false);
                    router.push('/(customer)/(tabs)/history');
                }}
                orderId={lastOrderId}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, position: 'relative', overflow: 'hidden' },
    blob: { position: 'absolute', width: 300, height: 300, borderRadius: 150, zIndex: -1 },
    header: { paddingHorizontal: 20, paddingBottom: 16, borderBottomWidth: 1 },
    headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 12 },
    headerTitleContainer: { flex: 1, paddingHorizontal: 15 },
    headerTitle: { fontSize: 24, fontWeight: '800', fontFamily: 'NotoSans-Bold' },
    locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
    locationText: { fontSize: 12, maxWidth: 200, fontWeight: '500' },
    backBtn: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
    actionBtn: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
    badge: { position: 'absolute', top: -5, right: -5, minWidth: 20, height: 20, borderRadius: 10, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#FFF' },
    badgeText: { color: '#FFF', fontSize: 10, fontWeight: '800' },
    searchBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, height: 50, borderRadius: 16, gap: 10 },
    searchInput: { flex: 1, fontSize: 15, fontFamily: 'NotoSans-Medium' },

    scrollContent: { padding: 20, gap: 24, paddingBottom: 100 },
    section: { gap: 12 },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 },
    sectionTitle: { fontSize: 18, fontWeight: '800', fontFamily: 'NotoSans-Bold' },

    categoryList: { gap: 12 },
    categoryBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 14, borderWidth: 1, gap: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 4, elevation: 1 },
    categoryText: { fontSize: 14, fontWeight: '700' },

    requestBanner: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 20, borderWidth: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 3 },
    requestBannerLeft: { width: 56, height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
    requestBannerTitle: { fontSize: 16, fontWeight: '800' },
    requestBannerSub: { fontSize: 13, fontWeight: '500', marginTop: 2 },
    requestBannerAction: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },

    productGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },

    emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 40, gap: 12 },
    emptyIconCircle: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
    emptyText: { fontSize: 18, fontWeight: '700' },
    emptySubText: { fontSize: 14, textAlign: 'center', maxWidth: '70%' },
    emptyActionBtn: { paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12, marginTop: 10 },

    jobBanner: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12, borderBottomWidth: 1 },
    jobBannerContent: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
    jobBannerText: { fontSize: 13, fontFamily: 'NotoSans-Bold' },
    jobBannerAction: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    jobBannerActionText: { fontSize: 13, fontFamily: 'NotoSans-Bold', textDecorationLine: 'underline' },
    subHeaderActions: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 10, marginBottom: 5 },
    nearbyToggle: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        gap: 6
    },
    nearbyText: { fontSize: 12, fontWeight: '700', fontFamily: 'NotoSans-Bold' },
    nearbyDot: { width: 4, height: 4, borderRadius: 2, marginLeft: 2 },
    coordinatesPill: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        backgroundColor: '#00000005',
    },
    coordsText: { fontSize: 10, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace', opacity: 0.7 },
});
