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
    const { businessCart, addToBusinessCart, updateBusinessCartQuantity, clearBusinessCart, walletBalance, profile } = useTechnician();
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
    const [supplierName, setSupplierName] = useState('');
    const [customParts, setCustomParts] = useState<any[]>([{ id: '1', name: '', company: '', partNumber: '', qty: '1', description: '', photos: [], voiceNote: null }]);
    const [isRecording, setIsRecording] = useState(false);
    const [recordingDuration, setRecordingDuration] = useState(0);
    const [recording, setRecording] = useState<Audio.Recording | null>(null);
    const [recordingItemId, setRecordingItemId] = useState<string | null>(null);
    const recordingTimer = useRef<any>(null);

    const [toast, setToast] = useState<{ visible: boolean; message: string }>({ visible: false, message: '' });
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        return () => {
            if (recordingTimer.current) clearInterval(recordingTimer.current);
            if (recording) recording.stopAndUnloadAsync();
        };
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

    const addCustomPartRow = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setCustomParts([...customParts, { id: Date.now().toString(), name: '', company: '', partNumber: '', qty: '1', description: '', photos: [], voiceNote: null }]);
    };

    const handleItemTakePhoto = async (itemId: string) => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') return;
        const result = await ImagePicker.launchCameraAsync({ quality: 0.7, mediaTypes: ImagePicker.MediaTypeOptions.Images });
        if (!result.canceled) {
            try {
                const uploadRes = await technicianService.uploadFile(result.assets[0].uri, 'image');
                const url = uploadRes.url || uploadRes.path;
                if (url) {
                    setCustomParts(prev => prev.map(p => p.id === itemId ? { ...p, photos: [...p.photos, url] } : p));
                }
            } catch (error) {
                console.error("Failed to upload photo:", error);
                Alert.alert(t('error'), t('upload_failed') || "Failed to upload image");
            }
        }
    };

    const handleItemPickImage = async (itemId: string) => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') return;
        const result = await ImagePicker.launchImageLibraryAsync({ quality: 0.7, mediaTypes: ImagePicker.MediaTypeOptions.Images });
        if (!result.canceled) {
            try {
                const uploadRes = await technicianService.uploadFile(result.assets[0].uri, 'image');
                const url = uploadRes.url || uploadRes.path;
                if (url) {
                    setCustomParts(prev => prev.map(p => p.id === itemId ? { ...p, photos: [...p.photos, url] } : p));
                }
            } catch (error) {
                console.error("Failed to upload image:", error);
                Alert.alert(t('error'), t('upload_failed') || "Failed to upload image");
            }
        }
    };

    const handleStartRecording = async (itemId: string) => {
        try {
            const { status } = await Audio.requestPermissionsAsync();
            if (status !== 'granted') return;
            await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
            const { recording: newRecording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
            setRecording(newRecording);
            setIsRecording(true);
            setRecordingItemId(itemId);
            setRecordingDuration(0);
            recordingTimer.current = setInterval(() => setRecordingDuration(prev => prev + 1), 1000);
        } catch (err) { console.error('Failed to start recording', err); }
    };

    const removeCustomPartRow = (id: string) => {
        if (customParts.length > 1) {
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            setCustomParts(customParts.filter(p => p.id !== id));
        }
    };

    const updateCustomPart = (id: string, field: string, value: any) => {
        setCustomParts(customParts.map(p => p.id === id ? { ...p, [field]: value } : p));
    };

    const handleStopRecording = async () => {
        if (!recording || !recordingItemId) return;
        setIsRecording(false);
        if (recordingTimer.current) clearInterval(recordingTimer.current);
        await recording.stopAndUnloadAsync();
        const uri = recording.getURI();
        if (uri) {
            try {
                const uploadRes = await technicianService.uploadFile(uri, 'audio');
                const url = uploadRes.url || uploadRes.path;
                if (url) {
                    setCustomParts(prev => prev.map(p => p.id === recordingItemId ? { ...p, voiceNote: url } : p));
                }
            } catch (error) {
                console.error("Failed to upload voice note:", error);
                Alert.alert(t('error'), t('upload_failed') || "Failed to upload voice note");
            }
        }
        setRecording(null);
        setRecordingItemId(null);
    };

    const handleCustomOrderSubmit = async () => {
        const isItemsValid = customParts.every(p => p.name.trim().length > 0 && p.company.trim().length > 0);
        const isSupplierValid = supplierName.trim().length > 0;

        if (!isSupplierValid) {
            Alert.alert(t('supplier_required'), t('supplier_required_msg'));
            return;
        }

        if (!isItemsValid) {
            Alert.alert(t('missing_info'), t('missing_info_msg'));
            return;
        }

        try {
            setLoading(true);
            // Media are now uploaded immediately, so customParts already contains URLs.
            // Just double check and map for consistency if needed.
            const processedItems = customParts.map(item => ({
                ...item,
                photos: item.photos || [],
                voiceNote: item.voiceNote || null
            }));

            const response: any = await technicianService.requestCustomOrder(supplierName, processedItems);
            if (response.success) {
                setIsCustomOrderVisible(false);
                setOrderConfirmed(true);
                setCustomParts([{ id: '1', name: '', company: '', partNumber: '', qty: '1', description: '', photos: [], voiceNote: null }]);
            } else {
                Alert.alert(t('error'), t('dispatch_error'));
            }
        } catch (error) {
            console.error("Submit error:", error);
            Alert.alert(t('error'), t('unexpected_error'));
        } finally {
            setLoading(false);
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
            if (res.success && res.order) {
                setPendingOrderId(res.order.id || res.order._id);
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

            <Modal visible={isCustomOrderVisible} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={[styles.cartContainer, { backgroundColor: colors.background }]}>
                        <View style={styles.cartHeader}>
                            <View>
                                <Text style={[styles.cartTitle, { color: colors.text }]}>{t('custom_request')}</Text>
                                <Text style={[styles.headerSubtitle, { color: colors.icon }]}>{t('multi_part_order')}</Text>
                            </View>
                            <TouchableOpacity onPress={() => setIsCustomOrderVisible(false)}>
                                <Ionicons name="close" size={28} color={colors.text} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.cartList} showsVerticalScrollIndicator={false}>
                            <View style={[styles.formGroup, { marginBottom: 25 }]}>
                                <Text style={[styles.inputLabel, { color: colors.text }]}>{t('target_supplier')}</Text>
                                <View style={[styles.supplierInputWrapper, { backgroundColor: colors.card, borderColor: colors.border }]}>
                                    <Ionicons name="business-outline" size={20} color={colors.primary} style={{ marginRight: 12 }} />
                                    <TextInput
                                        placeholder={t('enter_supplier_placeholder')}
                                        style={[styles.premiumInput, { flex: 1, borderWidth: 0, backgroundColor: 'transparent', color: colors.text }]}
                                        value={supplierName}
                                        onChangeText={setSupplierName}
                                        placeholderTextColor={colors.icon}
                                    />
                                </View>
                            </View>

                            <Text style={[styles.customInstruction, { color: colors.icon }]}>{t('list_parts_instruction')} {supplierName || t('the_supplier')}.</Text>

                            {customParts.map((item, index) => (
                                <View key={item.id} style={[styles.customPartCard, { backgroundColor: isDark ? colors.card : '#F8F9FE', borderColor: colors.border }]}>
                                    <View style={styles.partCardHeader}>
                                        <View style={[styles.partIndexChip, { backgroundColor: colors.text }]}>
                                            <Text style={[styles.partIndexText, { color: colors.background }]}>{t('item')} #{index + 1}</Text>
                                        </View>
                                        {customParts.length > 1 && (
                                            <TouchableOpacity
                                                onPress={() => removeCustomPartRow(item.id)}
                                                style={[styles.removePartBtn, { backgroundColor: isDark ? '#3A0000' : '#FFE5E5' }]}
                                            >
                                                <Ionicons name="trash-outline" size={18} color="#FF3B30" />
                                            </TouchableOpacity>
                                        )}
                                    </View>

                                    <View style={styles.formGroup}>
                                        <Text style={[styles.inputLabel, { color: colors.text }]}>{t('product_name')}</Text>
                                        <TextInput
                                            placeholder={t('product_name_placeholder')}
                                            style={[styles.premiumInput, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
                                            value={item.name}
                                            onChangeText={(val) => updateCustomPart(item.id, 'name', val)}
                                            placeholderTextColor={colors.icon}
                                        />
                                    </View>

                                    <View style={styles.inputRow}>
                                        <View style={[styles.formGroup, { flex: 1 }]}>
                                            <Text style={[styles.inputLabel, { color: colors.text }]}>{t('brand_company')}</Text>
                                            <TextInput
                                                placeholder={t('brand_company_placeholder')}
                                                style={[styles.premiumInput, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
                                                value={item.company}
                                                onChangeText={(val) => updateCustomPart(item.id, 'company', val)}
                                                placeholderTextColor={colors.icon}
                                            />
                                        </View>
                                        <View style={[styles.formGroup, { flex: 1 }]}>
                                            <Text style={[styles.inputLabel, { color: colors.text }]}>{t('part_number')}</Text>
                                            <TextInput
                                                placeholder={t('sku_placeholder')}
                                                style={[styles.premiumInput, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
                                                value={item.partNumber}
                                                onChangeText={(val) => updateCustomPart(item.id, 'partNumber', val)}
                                                placeholderTextColor={colors.icon}
                                            />
                                        </View>
                                    </View>
                                    <View style={styles.formGroup}>
                                        <Text style={[styles.inputLabel, { color: colors.text }]}>{t('product_description')}</Text>
                                        <TextInput
                                            placeholder={t('product_description_placeholder')}
                                            style={[styles.premiumInput, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
                                            value={item.description}
                                            onChangeText={(val) => updateCustomPart(item.id, 'description', val)}
                                            placeholderTextColor={colors.icon}
                                        />
                                    </View>

                                    {/* Per-Item Media Section */}
                                    <View style={{ marginTop: 12 }}>
                                        <Text style={[styles.inputLabel, { color: colors.text }]}>{t('attachments')}</Text>
                                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexDirection: 'row', marginBottom: 12 }}>
                                            <TouchableOpacity
                                                style={[styles.mediaPill, { borderColor: colors.primary, backgroundColor: colors.primary + '10' }]}
                                                onPress={() => handleItemTakePhoto(item.id)}
                                            >
                                                <Ionicons name="camera" size={18} color={colors.primary} />
                                                <Text style={[styles.mediaPillText, { color: colors.primary }]}>{t('camera')}</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                style={[styles.mediaPill, { borderColor: colors.primary, backgroundColor: colors.primary + '10' }]}
                                                onPress={() => handleItemPickImage(item.id)}
                                            >
                                                <Ionicons name="image" size={18} color={colors.primary} />
                                                <Text style={[styles.mediaPillText, { color: colors.primary }]}>{t('gallery')}</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                style={[
                                                    styles.mediaPill,
                                                    {
                                                        borderColor: (isRecording && recordingItemId === item.id) ? colors.notification : colors.primary,
                                                        backgroundColor: (isRecording && recordingItemId === item.id) ? colors.notification + '10' : colors.primary + '10'
                                                    }
                                                ]}
                                                onPress={() => (isRecording && recordingItemId === item.id) ? handleStopRecording() : handleStartRecording(item.id)}
                                                disabled={isRecording && recordingItemId !== item.id}
                                            >
                                                <Ionicons
                                                    name={(isRecording && recordingItemId === item.id) ? "stop-circle" : "mic"}
                                                    size={18}
                                                    color={(isRecording && recordingItemId === item.id) ? colors.notification : colors.primary}
                                                />
                                                <Text style={[
                                                    styles.mediaPillText,
                                                    { color: (isRecording && recordingItemId === item.id) ? colors.notification : colors.primary }
                                                ]}>
                                                    {(isRecording && recordingItemId === item.id) ? `0:${recordingDuration.toString().padStart(2, '0')}` : t('voice')}
                                                </Text>
                                            </TouchableOpacity>
                                        </ScrollView>

                                        {/* Captured Media Previews */}
                                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                                            {item.photos?.map((photo: string, idx: number) => (
                                                <View key={idx} style={styles.previewContainer}>
                                                    <Image source={{ uri: getMediaUrl(photo) || undefined }} style={styles.smallPreview} />
                                                    <TouchableOpacity
                                                        style={styles.removePreviewBtn}
                                                        onPress={() => updateCustomPart(item.id, 'photos', item.photos.filter((_: any, i: number) => i !== idx))}
                                                    >
                                                        <Ionicons name="close-circle" size={18} color={colors.notification} />
                                                    </TouchableOpacity>
                                                </View>
                                            ))}
                                            {item.voiceNote && (
                                                <View style={[styles.voicePreview, { backgroundColor: colors.card, borderColor: colors.border }]}>
                                                    <Ionicons name="mic" size={16} color={colors.primary} />
                                                    <Text style={[styles.voiceText, { color: colors.text }]} numberOfLines={1}>{t('recorded')}</Text>
                                                    <TouchableOpacity onPress={() => updateCustomPart(item.id, 'voiceNote', null)}>
                                                        <Ionicons name="trash-outline" size={16} color={colors.notification} />
                                                    </TouchableOpacity>
                                                </View>
                                            )}
                                        </View>
                                    </View>

                                    <View style={[styles.qtyActionArea, { borderTopColor: colors.border }]}>
                                        <Text style={[styles.inputLabel, { color: colors.text }]}>{t('order_qty')}</Text>
                                        <View style={[styles.premiumStepper, { backgroundColor: colors.card, borderColor: colors.border }]}>
                                            <TouchableOpacity
                                                style={[styles.stepControl, { backgroundColor: isDark ? colors.background : '#F0F0F0' }]}
                                                onPress={() => updateCustomPart(item.id, 'qty', Math.max(1, (parseInt(item.qty) || 1) - 1).toString())}
                                            >
                                                <Ionicons name="remove" size={18} color={colors.text} />
                                            </TouchableOpacity>
                                            <TextInput
                                                keyboardType="numeric"
                                                style={[styles.stepValue, { color: colors.text }]}
                                                value={item.qty}
                                                onChangeText={(val) => updateCustomPart(item.id, 'qty', val)}
                                            />
                                            <TouchableOpacity
                                                style={[styles.stepControl, { backgroundColor: isDark ? colors.background : '#F0F0F0' }]}
                                                onPress={() => updateCustomPart(item.id, 'qty', ((parseInt(item.qty) || 1) + 1).toString())}
                                            >
                                                <Ionicons name="add" size={18} color={colors.text} />
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </View>
                            ))}

                            <TouchableOpacity style={[styles.addRowBtn, { backgroundColor: isDark ? colors.card : '#F0F7FF', borderColor: colors.primary }]} onPress={addCustomPartRow}>
                                <Ionicons name="add-circle-outline" size={20} color={colors.primary} />
                                <Text style={[styles.addRowText, { color: colors.primary }]}>{t('add_another_part')}</Text>
                            </TouchableOpacity>
                        </ScrollView>

                        <View style={[styles.cartFooter, { borderTopColor: colors.border }]}>
                            <TouchableOpacity style={[styles.checkoutBtn, { backgroundColor: colors.primary }]} onPress={handleCustomOrderSubmit}>
                                <Text style={styles.checkoutText}>{t('dispatch_request')}</Text>
                                <Ionicons name="send" size={18} color="#FFF" />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

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
                            {supplierName ? `${supplierName} ${t('order_success_msg')}` : `${t('the_supplier')} ${t('order_success_msg')}`}
                        </Text>
                        <TouchableOpacity
                            onPress={() => {
                                setOrderConfirmed(false);
                                setSupplierName('');
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
                                setSupplierName('');
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
