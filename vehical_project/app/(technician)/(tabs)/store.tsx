import { PartRequestItem, TechnicianPartRequestModal } from '@/components/technician/TechnicianPartRequestModal';
import { TechnicianProductCard } from '@/components/technician/TechnicianProductCard';
import { PaymentSimulator } from '@/components/ui/PaymentSimulator';
import { Colors } from '@/constants/theme';
import { useAdmin } from '@/context/AdminContext';
import { useLanguage } from '@/context/LanguageContext';
import { useTechnician } from '@/context/TechnicianContext';
import { technicianService } from '@/services/technicianService';
import { getMediaUrl } from '@/utils/mediaHelpers';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
    Alert,
    Animated,
    Dimensions,
    Image,
    LayoutAnimation,
    Modal,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    UIManager,
    useColorScheme,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

if (Platform.OS === 'android') {
    if (UIManager.setLayoutAnimationEnabledExperimental) {
        UIManager.setLayoutAnimationEnabledExperimental(true);
    }
}

const { width, height } = Dimensions.get('window');

const SUPPLIER_CATEGORIES = [
    { id: '1', title: 'cat_spare_parts', icon: 'cog-outline', color: '#007AFF' },
    { id: '2', title: 'cat_accessories', icon: 'car-seat', color: '#AF52DE' },
    { id: '3', title: 'cat_tires', icon: 'tire', color: '#FF3B30' },
    { id: '4', title: 'cat_batteries', icon: 'battery-charging', color: '#FFCC00' },
    { id: '6', title: 'cat_lubricants', icon: 'oil', color: '#34C759' },
];

export default function TechnicianWholesaleStore() {
    const {
        businessCart,
        addToBusinessCart,
        updateBusinessCartQuantity,
        clearBusinessCart,
        walletBalance,
        profile,
        myJobs,
        requestParts,
        uploadFile
    } = useTechnician();
    const { settings } = useAdmin();
    const { t } = useLanguage();
    const router = useRouter();
    const colorScheme = useColorScheme();
    const theme = colorScheme ?? 'light';
    const colors = Colors[theme as keyof typeof Colors];
    const isDark = theme === 'dark';

    const currencySymbol = settings.currency === 'INR' ? '₹' : '$';
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [products, setProducts] = useState<any[]>([]);
    const [isCartVisible, setIsCartVisible] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<'razorpay' | 'wallet' | 'cash'>('razorpay');
    const [orderConfirmed, setOrderConfirmed] = useState(false);
    const [isScannerVisible, setIsScannerVisible] = useState(false);
    const [permission, requestPermission] = useCameraPermissions();
    const [scanned, setScanned] = useState(false);
    const [showPaymentSimulator, setShowPaymentSimulator] = useState(false);
    const [pendingOrderId, setPendingOrderId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const [sortByNearest, setSortByNearest] = useState(false);
    const [techLocation, setTechLocation] = useState('Tech Hub, Main Ave');

    const [isCustomOrderVisible, setIsCustomOrderVisible] = useState(false);
    const [isSubmittingCustom, setIsSubmittingCustom] = useState(false);
    const [submittedSupplierName, setSubmittedSupplierName] = useState('');

    const [toast, setToast] = useState<{ visible: boolean; message: string }>({ visible: false, message: '' });
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Initialization if needed
    }, []);

    useEffect(() => {
        loadProducts();
    }, [search, selectedCategory, sortByNearest]);

    const loadProducts = async () => {
        try {
            let locationData = null;
            if (sortByNearest) {
                const { status } = await Location.requestForegroundPermissionsAsync();
                if (status === 'granted') {
                    const loc = await Location.getCurrentPositionAsync({});
                    locationData = {
                        latitude: loc.coords.latitude,
                        longitude: loc.coords.longitude
                    };
                    setTechLocation(`${loc.coords.latitude.toFixed(4)}, ${loc.coords.longitude.toFixed(4)}`);
                } else {
                    setSortByNearest(false);
                    Alert.alert(t('permission_denied'), t('location_permission_msg'));
                    return;
                }
            }

            const data = await technicianService.getProducts({
                category: selectedCategory || undefined,
                search: search || undefined,
                nearby: sortByNearest || undefined,
                ...(locationData || {})
            });
            setProducts(data);
        } catch (error) {
            console.error("Failed to load products", error);
        }
    };

    const showToast = (message: string) => {
        setToast({ visible: true, message });
        Animated.sequence([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.delay(2000),
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }),
        ]).start(() => setToast({ visible: false, message: '' }));
    };

    useEffect(() => {
        if (isScannerVisible) {
            setScanned(false);
            if (!permission?.granted) requestPermission();
        }
    }, [isScannerVisible, permission, requestPermission]);

    const handleBarCodeScanned = ({ type, data }: any) => {
        setScanned(true);
        setIsScannerVisible(false);

        const modelMapping: { [key: string]: string } = {
            'w1': 'Castrol 5W-30',
            'w2': 'Gabriel Front Strut',
            'w3': 'Brembo Ceramic',
            'w4': 'Bosch Spark Pack',
            'vin-123456': 'Model 3 Performance'
        };

        const result = modelMapping[data] || data;
        setSearch(result);
        Alert.alert(t('part_identified'), `${t('model')}: ${result}\n${t('scan_type')}: ${type}`);
    };

    const pickImageAndScan = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            setIsScannerVisible(false);
            setTimeout(() => {
                const mockModel = 'Brembo Ceramic';
                setSearch(mockModel);
                Alert.alert(t('upload_scan'), `${t('decoded_part')}: ${mockModel}`);
            }, 600);
        }
    };

    const uniqueSuppliers = useMemo(() => {
        const found = new Map();
        products.forEach(p => {
            const sid = p.shopId || (p.supplier && (p.supplier._id || p.supplier.id || p.supplier));
            const name = p.shop || (p.supplier && p.supplier.storeName) || 'Supplier';
            if (sid && !found.has(sid)) {
                found.set(sid, { id: sid, storeName: name });
            }
        });
        return Array.from(found.values());
    }, [products]);

    const vehicles = useMemo(() => {
        return myJobs.map(j => ({
            id: j.vehicleId || j.id,
            ...j.vehicle,
            make: j.vehicle?.make || j.vehicleModel || 'Vehicle',
            model: j.vehicle?.model || j.vehicleNumber || '',
            registrationNumber: j.vehicle?.registrationNumber || j.vehicleNumber,
        }));
    }, [myJobs]);



    const handlePartRequest = async (items: PartRequestItem[], notes: string, supplierId: string | null, photos: string[], voiceNote: string | null, vehicleId: string | null, manualVehicleDetails?: any) => {
        setIsSubmittingCustom(true);
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

            // Find linked job to get ID and vehicle details
            const linkedJob = myJobs.find(j => j.vehicleId === vehicleId || j.id === vehicleId);
            const jobId = linkedJob?.id || undefined;
            const vehicleInfo = linkedJob?.vehicle || (vehicleId ? vehicles.find(v => (v.id || v._id) === vehicleId) : undefined) || manualVehicleDetails;

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

            // console.log('[handlePartRequest] Requesting part with data:', {
            //     itemCount: items.length,
            //     jobId: jobId,
            //     vehicleId: vehicleId
            // });

            const response = await technicianService.requestPart({
                items: mappedItems,
                name: items.length === 1 ? items[0].name : `Bulk Request (${items.length} items)`,
                description: finalNotes,
                quantity: items.length,
                supplierId: supplierId || undefined,
                jobId: jobId,
                vehicleId: vehicleId || undefined,
                vehicleDetails: vehicleInfo,
                photos: uploadedPhotos,
                voiceNote: uploadedVoice
            });

            console.log('[handlePartRequest] Raw Response:', JSON.stringify(response, null, 2));

            const order = response?.order || response;

            if (order && (order._id || order.id)) {
                console.log('[handlePartRequest] Success! Order ID:', order._id || order.id);
                setPendingOrderId(order._id || order.id);
                setIsCustomOrderVisible(false);
                setOrderConfirmed(true);
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            } else {
                console.warn('[handlePartRequest] Invalid response structure - order not found in:', response);
                Alert.alert(t('error'), t('request_failed'));
            }
        } catch (error) {
            console.error('Request part error:', error);
            Alert.alert(t('error'), t('request_failed'));
        } finally {
            setIsSubmittingCustom(false);
        }
    };

    const cartTotal = useMemo(() => {
        return businessCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    }, [businessCart]);

    const handleCheckout = async () => {
        if (businessCart.length === 0) return;
        try {
            const supplierId = businessCart[0]?.supplier?._id || businessCart[0]?.supplier;
            const res = await technicianService.placeWholesaleOrder(businessCart, supplierId, cartTotal);
            if (res && (res.id || res._id)) {
                setPendingOrderId(res.id || res._id);
                setIsCartVisible(false);
                setShowPaymentSimulator(true);
            }
        } catch (error) {
            Alert.alert(t('error'), t('order_failed'));
        }
    };

    const handlePaymentSuccess = async (referenceId: string, isReal: boolean) => {
        setShowPaymentSimulator(false);
        setOrderConfirmed(true);
        setTimeout(() => {
            clearBusinessCart();
            setPendingOrderId(null);
        }, 500);
    };

    const handlePaymentFailure = (error: string) => {
        setShowPaymentSimulator(false);
        Alert.alert(t('error'), error || t('order_failed'));
    };



    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
            <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

            <LinearGradient
                colors={isDark ? ['#121212', '#000000'] : ['#F9FAFB', '#FFFFFF']}
                style={StyleSheet.absoluteFill}
            />

            {!isDark && (
                <>
                    <View style={styles.bgBlob1} />
                    <View style={styles.bgBlob2} />
                    <View style={styles.bgBlob3} />
                </>
            )}

            <BlurView intensity={isDark ? 40 : 80} tint={isDark ? "dark" : "light"} style={styles.headerWrapper}>
                <View style={styles.header}>
                    <View>
                        <Text style={[styles.headerTitle, { color: colors.text }]}>{t('wholesale')}</Text>
                        <Text style={[styles.headerSubtitle, { color: colors.icon }]}>{t('b2b_marketplace')}</Text>
                    </View>
                    <TouchableOpacity
                        style={[styles.headerIconBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
                        onPress={() => setIsCartVisible(true)}
                    >
                        <Ionicons name="receipt-outline" size={24} color={colors.text} />
                        {businessCart.length > 0 && (
                            <LinearGradient
                                colors={['#AF52DE', '#8E44AD']}
                                style={styles.cartBadge}
                            >
                                <Text style={styles.cartBadgeText}>{businessCart.length}</Text>
                            </LinearGradient>
                        )}
                    </TouchableOpacity>
                </View>

                <View style={[styles.searchContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <Ionicons name="search" size={20} color={colors.icon} />
                    <TextInput
                        placeholder={t('find_suppliers')}
                        style={[styles.searchInput, { color: colors.text }]}
                        value={search}
                        onChangeText={setSearch}
                        placeholderTextColor={colors.icon}
                    />
                    <TouchableOpacity style={styles.scanBtn} onPress={() => setIsScannerVisible(true)}>
                        <Ionicons name="qr-code-outline" size={20} color={colors.text} />
                    </TouchableOpacity>
                </View>
            </BlurView>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollPadding}>

                {/* Custom Request Banner - NEW */}
                <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={() => setIsCustomOrderVisible(true)}
                    style={{ marginBottom: 25, borderRadius: 20, overflow: 'hidden', shadowColor: '#FF6B00', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 16, elevation: 6 }}
                >
                    <LinearGradient
                        colors={['#FF6B00', '#FF8F33']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={{ padding: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
                    >
                        <View style={{ flex: 1, marginRight: 10 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6, gap: 6 }}>
                                <View style={{ backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 }}>
                                    <Text style={{ color: '#FFF', fontSize: 10, fontWeight: 'bold' }}>NEW</Text>
                                </View>
                                <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 12, fontWeight: '600', textTransform: 'uppercase' }}>{t('express_service')}</Text>
                            </View>
                            <Text style={{ color: '#FFF', fontSize: 20, fontWeight: 'bold', marginBottom: 4 }}>{t('cant_find_part')}</Text>
                            <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 13, lineHeight: 18 }}>{t('upload_photo_voice_quote')}</Text>
                        </View>
                        <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center' }}>
                            <Ionicons name="camera" size={24} color="#FF6B00" />
                        </View>
                    </LinearGradient>
                </TouchableOpacity>

                {sortByNearest && (
                    <View style={styles.nearestBadge}>
                        <Ionicons name="location" size={14} color={colors.primary} />
                        <Text style={[styles.nearestText, { color: colors.primary }]}>{t('nearby_suppliers_for')}: {techLocation}</Text>
                    </View>
                )}

                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('categories')}</Text>
                    </View>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesList} contentContainerStyle={{ paddingRight: 20 }}>
                        <TouchableOpacity
                            style={[
                                styles.categoryPill,
                                {
                                    backgroundColor: sortByNearest ? colors.primary : colors.card,
                                    borderColor: sortByNearest ? colors.primary : colors.border
                                }
                            ]}
                            onPress={() => {
                                setSortByNearest(!sortByNearest);
                                if (!sortByNearest) showToast(t('sorted_by_nearby_suppliers'));
                            }}
                            activeOpacity={0.7}
                        >
                            <View style={[
                                styles.pillIconBg,
                                { backgroundColor: sortByNearest ? 'rgba(255,255,255,0.2)' : colors.background }
                            ]}>
                                <Ionicons
                                    name="navigate"
                                    size={18}
                                    color={sortByNearest ? '#FFF' : colors.text}
                                />
                            </View>
                            <Text style={[
                                styles.pillText,
                                { color: sortByNearest ? '#FFF' : colors.text }
                            ]}>
                                {t('Nearby')}
                            </Text>
                        </TouchableOpacity>

                        {SUPPLIER_CATEGORIES.map(cat => (
                            <TouchableOpacity
                                key={cat.id}
                                style={[
                                    styles.categoryPill,
                                    {
                                        backgroundColor: selectedCategory === cat.title ? cat.color : colors.card,
                                        borderColor: selectedCategory === cat.title ? cat.color : colors.border
                                    }
                                ]}
                                onPress={() => setSelectedCategory(selectedCategory === cat.title ? null : cat.title)}
                                activeOpacity={0.7}
                            >
                                <View style={[
                                    styles.pillIconBg,
                                    { backgroundColor: selectedCategory === cat.title ? 'rgba(0,0,0,0.1)' : colors.background }
                                ]}>
                                    <MaterialCommunityIcons
                                        name={cat.icon as any}
                                        size={18}
                                        color={selectedCategory === cat.title ? '#FFF' : cat.color}
                                    />
                                </View>
                                <Text style={[
                                    styles.pillText,
                                    { color: selectedCategory === cat.title ? '#FFF' : colors.text }
                                ]}>{t(cat.title)}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <View>
                            <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('verified_listings')}</Text>
                            <Text style={[styles.countText, { color: colors.icon }]}>{products.length} {t('found')}</Text>
                        </View>
                        <TouchableOpacity style={styles.seeAllBtn}>
                            <Text style={[styles.seeAllText, { color: colors.primary }]}>{t('see_all')}</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.productGrid}>
                        {products.map((product, index) => (
                            <TechnicianProductCard
                                key={product.id || product._id || `prod-${index}`}
                                product={product}
                                currencySymbol={currencySymbol}
                                onAddToCart={(p) => {
                                    addToBusinessCart(p);
                                    showToast(`${p.name.split(' ')[0]} ${t('added')}`);
                                }}
                            />
                        ))}
                    </View>
                </View>

                <TouchableOpacity
                    style={styles.customBannerContainer}
                    onPress={() => setIsCustomOrderVisible(true)}
                    activeOpacity={0.9}
                >
                    <LinearGradient
                        colors={['#AF52DE', '#8E44AD']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.customRequestBanner}
                    >
                        <View style={styles.promoContent}>
                            <View style={styles.promoIconBg}>
                                <MaterialCommunityIcons name="playlist-plus" size={28} color="#AF52DE" />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.promoTitle}>{t('custom_order_title')}</Text>
                                <Text style={styles.promoSub}>{t('custom_order_desc')}</Text>
                            </View>
                            <View style={styles.promoChevron}>
                                <Ionicons name="chevron-forward" size={20} color="#FFF" />
                            </View>
                        </View>
                    </LinearGradient>
                </TouchableOpacity>
                <View style={{ height: 120 }} />
            </ScrollView>

            <Modal visible={isCartVisible} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={[styles.cartContainer, { backgroundColor: colors.background }]}>
                        <View style={styles.cartHeader}>
                            <Text style={[styles.cartTitle, { color: colors.text }]}>{t('wholesale_order')}</Text>
                            <TouchableOpacity onPress={() => setIsCartVisible(false)}>
                                <Ionicons name="close" size={28} color={colors.text} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.cartList} showsVerticalScrollIndicator={false}>
                            {businessCart.length === 0 ? (
                                <View style={styles.emptyCartBox}>
                                    <View style={[styles.emptyCartIcon, { backgroundColor: colors.background }]}>
                                        <Ionicons name="receipt-outline" size={60} color={colors.icon} />
                                    </View>
                                    <Text style={[styles.emptyCartText, { color: colors.icon }]}>{t('empty_procurement')}</Text>
                                    <TouchableOpacity
                                        style={[styles.startShopBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
                                        onPress={() => setIsCartVisible(false)}
                                    >
                                        <Text style={[styles.startShopText, { color: colors.text }]}>{t('browse_supplies')}</Text>
                                    </TouchableOpacity>
                                </View>
                            ) : (
                                businessCart.map(item => (
                                    <View key={item.id} style={[styles.cartItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
                                        <Image source={{ uri: getMediaUrl(item.image) || '' }} style={styles.cartItemImage} />
                                        <View style={styles.cartItemDetails}>
                                            <Text style={[styles.cartItemName, { color: colors.text }]} numberOfLines={1}>{item.name}</Text>
                                            <Text style={[styles.cartItemPrice, { color: colors.icon }]}>{t('moq')}: {item.moq} • {currencySymbol}{item.price.toLocaleString()}</Text>
                                            <View style={styles.qtyContainer}>
                                                <TouchableOpacity
                                                    style={[styles.qtyBtn, { backgroundColor: colors.background, borderColor: colors.border }]}
                                                    onPress={() => updateBusinessCartQuantity(item.id, -1)}
                                                >
                                                    <Ionicons name="remove" size={16} color={colors.text} />
                                                </TouchableOpacity>
                                                <Text style={[styles.qtyText, { color: colors.text }]}>{item.quantity}</Text>
                                                <TouchableOpacity
                                                    style={[styles.qtyBtn, { backgroundColor: colors.background, borderColor: colors.border }]}
                                                    onPress={() => updateBusinessCartQuantity(item.id, 1)}
                                                >
                                                    <Ionicons name="add" size={16} color={colors.text} />
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                        <Text style={[styles.itemTotalAmount, { color: colors.text }]}>{currencySymbol}{(item.price * item.quantity).toLocaleString()}</Text>
                                    </View>
                                ))
                            )}
                        </ScrollView>

                        {businessCart.length > 0 && (
                            <View style={[styles.cartFooter, { borderTopColor: colors.border }]}>
                                <View style={styles.feeRow}>
                                    <Text style={[styles.feeLabel, { color: colors.icon }]}>{t('subtotal_items')}</Text>
                                    <Text style={[styles.feeValue, { color: colors.text }]}>{currencySymbol}{cartTotal.toLocaleString()}</Text>
                                </View>
                                <View style={[styles.feeRow, styles.totalRow]}>
                                    <Text style={[styles.totalLabel, { color: colors.text }]}>{t('grand_total')}</Text>
                                    <Text style={[styles.totalValue, { color: colors.text }]}>{currencySymbol}{cartTotal.toLocaleString()}</Text>
                                </View>

                                <Text style={[styles.paymentMethodHeading, { color: colors.icon }]}>{t('select_payment_method')}</Text>
                                <View style={styles.paymentMethodsRow}>
                                    {[
                                        { id: 'razorpay', label: t('online'), icon: 'card-outline', color: '#007AFF' },
                                        { id: 'wallet', label: t('wallet'), icon: 'wallet-outline', color: '#34C759' },
                                        { id: 'cash', label: t('cash'), icon: 'cash-outline', color: '#FF9500' }
                                    ].map((method) => (
                                        <TouchableOpacity
                                            key={method.id}
                                            style={[
                                                styles.paymentMethodCard,
                                                {
                                                    borderColor: paymentMethod === method.id ? colors.primary : colors.border,
                                                    backgroundColor: paymentMethod === method.id ? colors.primary + '10' : colors.card
                                                }
                                            ]}
                                            onPress={() => setPaymentMethod(method.id as any)}
                                        >
                                            <Ionicons
                                                name={method.icon as any}
                                                size={20}
                                                color={paymentMethod === method.id ? colors.primary : colors.icon}
                                            />
                                            <Text style={[
                                                styles.paymentMethodLabel,
                                                { color: paymentMethod === method.id ? colors.primary : colors.text }
                                            ]}>
                                                {method.label}
                                            </Text>
                                            {method.id === 'wallet' && (
                                                <Text style={[styles.walletBalanceText, { color: colors.icon }]}>
                                                    {currencySymbol}{walletBalance.toLocaleString()}
                                                </Text>
                                            )}
                                        </TouchableOpacity>
                                    ))}
                                </View>

                                <TouchableOpacity onPress={handleCheckout} activeOpacity={0.8}>
                                    <LinearGradient
                                        colors={[colors.primary, colors.primary + 'DD']}
                                        style={styles.checkoutBtn}
                                    >
                                        <Text style={styles.checkoutText}>
                                            {paymentMethod === 'cash' ? t('place_cash_order') : t('proceed_to_pay')}
                                        </Text>
                                        <Ionicons name="arrow-forward" size={20} color="#FFF" />
                                    </LinearGradient>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                </View>
            </Modal>

            <TechnicianPartRequestModal
                visible={isCustomOrderVisible}
                onClose={() => setIsCustomOrderVisible(false)}
                onSubmit={handlePartRequest}
                suppliers={uniqueSuppliers}
                partsSource="garage"
                vehicles={vehicles}
                submitting={isSubmittingCustom}
            />

            <Modal visible={orderConfirmed} animationType="fade" transparent>
                <View style={styles.modalOverlay}>
                    <View style={[styles.successBox, { backgroundColor: colors.background }]}>
                        <LinearGradient
                            colors={['#34C759', '#28A745']}
                            style={styles.successIconCircle}
                        >
                            <Ionicons name="checkmark" size={50} color="#FFF" />
                        </LinearGradient>
                        <Text style={[styles.successTitle, { color: colors.text }]}>{t('order_dispatched')}</Text>
                        <Text style={[styles.successDesc, { color: colors.icon }]}>
                            {submittedSupplierName ? `${submittedSupplierName} ${t('order_success_msg')}` : `${t('the_supplier')} ${t('order_success_msg')}`}
                        </Text>
                        <TouchableOpacity
                            onPress={() => {
                                setOrderConfirmed(false);
                                setSubmittedSupplierName('');
                            }}
                            activeOpacity={0.8}
                            style={{ width: '100%' }}
                        >
                            <LinearGradient
                                colors={[colors.primary, colors.primary + 'DD']}
                                style={styles.doneBtn}
                            >
                                <Text style={styles.doneText}>{t('acknowledge')}</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => {
                                setOrderConfirmed(false);
                                setSubmittedSupplierName('');
                                router.replace('/(technician)/(tabs)');
                            }}
                            style={{ marginTop: 20 }}
                        >
                            <Text style={{ color: colors.primary, fontFamily: 'NotoSans-Bold', fontSize: 16 }}>{t('go_home')}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {toast.visible && (
                <Animated.View style={[styles.toastContainer, { opacity: fadeAnim }]}>
                    <BlurView intensity={80} tint="dark" style={styles.toastContent}>
                        <Ionicons name="checkmark-circle" size={20} color="#FFF" />
                        <Text style={styles.toastText}>{toast.message}</Text>
                    </BlurView>
                </Animated.View>
            )}

            <PaymentSimulator
                visible={showPaymentSimulator}
                amount={cartTotal}
                type="wholesale"
                orderId={pendingOrderId || undefined}
                walletBalance={walletBalance}
                userData={{
                    name: profile?.fullName || 'Technician',
                    email: profile?.email || 'tech@vehical.app',
                    phone: profile?.phoneNumber
                }}
                initialMethod={paymentMethod}
                onSuccess={handlePaymentSuccess}
                onCancel={() => setShowPaymentSimulator(false)}
                onFailure={handlePaymentFailure}
            />

            <Modal visible={isScannerVisible} animationType="slide">
                <View style={{ flex: 1, backgroundColor: '#000' }}>
                    {permission?.granted ? (
                        <CameraView
                            style={StyleSheet.absoluteFill}
                            facing="back"
                            onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
                            barcodeScannerSettings={{
                                barcodeTypes: ["qr", "ean13"],
                            }}
                        >
                            <SafeAreaView style={{ flex: 1 }}>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 20 }}>
                                    <TouchableOpacity onPress={() => setIsScannerVisible(false)} style={{ padding: 10, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 20 }}>
                                        <Ionicons name="close" size={24} color="#FFF" />
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={pickImageAndScan} style={{ flexDirection: 'row', alignItems: 'center', padding: 10, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 20, gap: 8 }}>
                                        <Ionicons name="images" size={20} color="#FFF" />
                                        <Text style={{ color: '#FFF', fontWeight: 'bold' }}>{t('upload')}</Text>
                                    </TouchableOpacity>
                                </View>
                                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                                    <View style={{ width: 250, height: 250, borderWidth: 2, borderColor: '#FFF', borderRadius: 20 }} />
                                    <Text style={{ color: '#FFF', marginTop: 20, fontWeight: 'bold' }}>{t('align_qr')}</Text>
                                    <Text style={{ color: '#CCC', marginTop: 8 }}>{t('or_upload_gallery')}</Text>
                                </View>
                            </SafeAreaView>
                        </CameraView>
                    ) : (
                        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
                            <Text style={{ color: colors.text, marginBottom: 20 }}>{t('camera_permission_required')}</Text>
                            <TouchableOpacity onPress={requestPermission} style={{ backgroundColor: '#AF52DE', padding: 15, borderRadius: 10 }}>
                                <Text style={{ color: '#FFF', fontWeight: 'bold' }}>{t('grant_permission')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => setIsScannerVisible(false)} style={{ marginTop: 20 }}>
                                <Text style={{ color: colors.text }}>{t('close')}</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, position: 'relative', overflow: 'hidden' },
    bgBlob1: { position: 'absolute', top: -100, left: -100, width: 300, height: 300, borderRadius: 150, backgroundColor: '#FF8C0010', zIndex: -1 },
    bgBlob2: { position: 'absolute', bottom: 100, right: -150, width: 400, height: 400, borderRadius: 200, backgroundColor: '#4A148C10', zIndex: -1 },
    bgBlob3: { position: 'absolute', top: 300, right: 100, width: 200, height: 200, borderRadius: 100, backgroundColor: '#34C75910', zIndex: -1 },
    headerWrapper: {
        paddingTop: Platform.OS === 'ios' ? 10 : 20,
        paddingBottom: 20,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        overflow: 'hidden',
    },
    header: {
        paddingHorizontal: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    headerTitle: { fontSize: 26, fontFamily: 'NotoSans-Black' },
    headerSubtitle: { fontSize: 13, fontFamily: 'NotoSans-Regular', marginTop: 2 },
    headerIconBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
    },
    cartBadge: {
        position: 'absolute',
        top: -4,
        right: -4,
        minWidth: 20,
        height: 20,
        paddingHorizontal: 4,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#FFF'
    },
    cartBadgeText: { color: '#FFF', fontSize: 9, fontFamily: 'NotoSans-Black' },

    scrollPadding: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 100 },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 20,
        paddingHorizontal: 16,
        height: 54,
        borderRadius: 18,
        gap: 12,
        borderWidth: 1,
    },
    searchInput: { flex: 1, fontSize: 15, fontFamily: 'NotoSans-Regular' },
    scanBtn: { padding: 8 },

    nearestBadge: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, paddingHorizontal: 5 },
    nearestText: { fontSize: 12, fontFamily: 'NotoSans-Bold', marginLeft: 5 },

    section: { marginBottom: 28 },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    sectionTitle: { fontSize: 20, fontFamily: 'NotoSans-Bold' },
    countText: { fontSize: 12, fontFamily: 'NotoSans-Regular', marginTop: 2 },
    seeAllBtn: { paddingVertical: 4 },
    seeAllText: { fontSize: 14, fontFamily: 'NotoSans-Bold' },

    categoriesList: { marginHorizontal: -20, paddingLeft: 20 },
    categoryPill: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 25,
        marginRight: 10,
        gap: 8,
        borderWidth: 1,
    },
    pillIconBg: {
        width: 30,
        height: 30,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
    },
    pillText: {
        fontSize: 13,
        fontFamily: 'NotoSans-Bold',
    },

    productGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, justifyContent: 'space-between' },


    customBannerContainer: { marginTop: 10, borderRadius: 24, overflow: 'hidden' },
    customRequestBanner: { padding: 20 },
    promoContent: { flexDirection: 'row', alignItems: 'center', gap: 15 },
    promoIconBg: { width: 50, height: 50, borderRadius: 25, backgroundColor: 'rgba(255,255,255,0.9)', justifyContent: 'center', alignItems: 'center' },
    promoTitle: { fontSize: 17, fontFamily: 'NotoSans-Black', color: '#FFF' },
    promoSub: { fontSize: 12, color: 'rgba(255,255,255,0.85)', marginTop: 2, fontFamily: 'NotoSans-Regular', lineHeight: 18 },
    promoChevron: { width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },

    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
    cartContainer: { borderTopLeftRadius: 35, borderTopRightRadius: 35, height: height * 0.85, padding: 24, overflow: 'hidden' },
    cartHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
    cartTitle: { fontSize: 24, fontFamily: 'NotoSans-Black' },
    cartList: { paddingBottom: 20 },
    cartItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, borderRadius: 20, padding: 12, borderWidth: 1 },
    cartItemImage: { width: 70, height: 70, borderRadius: 15, backgroundColor: '#FFF' },
    cartItemDetails: { flex: 1, marginLeft: 16 },
    cartItemName: { fontSize: 15, fontFamily: 'NotoSans-Bold' },
    cartItemPrice: { fontSize: 12, fontFamily: 'NotoSans-Regular', marginTop: 4 },
    qtyContainer: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 8 },
    qtyBtn: { width: 28, height: 28, borderRadius: 8, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
    qtyText: { fontSize: 14, fontFamily: 'NotoSans-Black', width: 20, textAlign: 'center' },
    itemTotalAmount: { fontSize: 15, fontFamily: 'NotoSans-Black', marginLeft: 10 },

    cartFooter: { borderTopWidth: 1, paddingTop: 20, paddingBottom: 40 },
    feeRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    feeLabel: { fontSize: 13, fontFamily: 'NotoSans-Regular' },
    feeValue: { fontSize: 13, fontFamily: 'NotoSans-Bold' },
    totalRow: { marginTop: 8, marginBottom: 20 },
    totalLabel: { fontSize: 18, fontFamily: 'NotoSans-Bold' },
    totalValue: { fontSize: 22, fontFamily: 'NotoSans-Black' },
    checkoutBtn: { height: 60, borderRadius: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12 },
    checkoutText: { color: '#FFF', fontSize: 16, fontFamily: 'NotoSans-Bold' },

    emptyCartBox: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingBottom: 50 },
    emptyCartIcon: { width: 100, height: 100, borderRadius: 50, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
    emptyCartText: { fontSize: 18, marginTop: 10, fontFamily: 'NotoSans-Bold' },
    startShopBtn: { marginTop: 24, paddingHorizontal: 25, paddingVertical: 14, borderRadius: 15, borderWidth: 1 },
    startShopText: { fontFamily: 'NotoSans-Bold' },

    successBox: { margin: 30, borderRadius: 35, padding: 35, alignItems: 'center', overflow: 'hidden' },
    successIconCircle: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 25 },
    successTitle: { fontSize: 24, fontFamily: 'NotoSans-Black' },
    successDesc: { fontSize: 14, textAlign: 'center', marginTop: 12, lineHeight: 20 },
    doneBtn: { marginTop: 30, height: 54, borderRadius: 16, width: '100%', alignItems: 'center', justifyContent: 'center' },
    doneText: { fontSize: 16, color: '#FFF', fontFamily: 'NotoSans-Bold' },

    toastContainer: { position: 'absolute', bottom: 100, left: 0, right: 0, alignItems: 'center', zIndex: 9999, pointerEvents: 'none' },
    toastContent: { paddingHorizontal: 18, paddingVertical: 10, borderRadius: 20, flexDirection: 'row', alignItems: 'center', gap: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8 },
    toastText: { color: '#FFF', fontSize: 13, fontFamily: 'NotoSans-Bold' },

    customInstruction: { fontSize: 13, fontFamily: 'NotoSans-Regular', marginBottom: 20, lineHeight: 18 },
    supplierInputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 16,
        borderWidth: 1,
        paddingHorizontal: 16,
        height: 52,
    },
    customPartCard: { borderRadius: 24, padding: 18, marginBottom: 18, borderWidth: 1 },
    partCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
    partIndexChip: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
    partIndexText: { fontSize: 9, fontFamily: 'NotoSans-Black' },
    removePartBtn: { width: 34, height: 34, borderRadius: 17, justifyContent: 'center', alignItems: 'center' },
    formGroup: { marginBottom: 14 },
    inputLabel: { fontSize: 11, fontFamily: 'NotoSans-Bold', opacity: 0.7, marginBottom: 6, marginLeft: 4 },
    premiumInput: { paddingHorizontal: 16, height: 50, borderRadius: 12, fontSize: 14, fontFamily: 'NotoSans-Bold', borderWidth: 1 },
    inputRow: { flexDirection: 'row', gap: 10 },
    qtyActionArea: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, borderTopWidth: 1, borderColor: '#F0F0F0', paddingTop: 18 },
    premiumStepper: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, borderWidth: 1, padding: 3 },
    stepControl: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center', borderRadius: 9 },
    stepValue: { width: 44, textAlign: 'center', fontSize: 15, fontFamily: 'NotoSans-Black' },

    addRowBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 15, borderRadius: 16, borderWidth: 1, borderStyle: 'dotted', marginTop: 10, gap: 10 },
    addRowText: { fontSize: 15, fontWeight: '700' },
    mediaPill: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1, marginRight: 10, gap: 6 },
    mediaPillText: { fontSize: 13, fontWeight: '600' },
    previewContainer: { position: 'relative' },
    smallPreview: { width: 50, height: 50, borderRadius: 8 },
    removePreviewBtn: { position: 'absolute', top: -5, right: -5 },
    voicePreview: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12, borderWidth: 1, gap: 6 },
    voiceText: { fontSize: 12, maxWidth: 60 },

    paymentMethodHeading: { fontSize: 12, fontFamily: 'NotoSans-Bold', textTransform: 'uppercase', marginBottom: 12, marginTop: 15, letterSpacing: 0.5 },
    paymentMethodsRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
    paymentMethodCard: { flex: 1, padding: 12, borderRadius: 16, borderWidth: 1.5, alignItems: 'center', gap: 6 },
    paymentMethodLabel: { fontSize: 11, fontFamily: 'NotoSans-Bold' },
    walletBalanceText: { fontSize: 9, fontFamily: 'NotoSans-Regular' }
});
