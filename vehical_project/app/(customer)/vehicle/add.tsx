import { AppButton } from '@/components/ui/AppButton';
import { VehicleIcon } from '@/components/ui/VehicleIcon';
import { VEHICLE_DATA } from '@/constants/brands';
import { Colors } from '@/constants/theme';
import { useCustomer } from '@/context/CustomerContext';
import { useLanguage } from '@/context/LanguageContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { FontAwesome, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { Image as ExpoImage } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
    Alert,
    Animated,
    Image,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AddVehicleScreen() {
    const router = useRouter();
    const { addVehicle, uploadFile } = useCustomer();
    const { t } = useLanguage();
    const [loading, setLoading] = useState(false);

    const colorScheme = useColorScheme();
    const theme = colorScheme ?? 'light';
    const colors = Colors[theme];
    const isDark = theme === 'dark';

    // Animation Refs
    const blob1Anim = useRef(new Animated.Value(0)).current;
    const blob2Anim = useRef(new Animated.Value(0)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.95)).current;

    // Progress Tracking
    const [formProgress, setFormProgress] = useState(0);

    useEffect(() => {
        Animated.parallel([
            Animated.loop(
                Animated.sequence([
                    Animated.timing(blob1Anim, { toValue: 1, duration: 8000, useNativeDriver: true }),
                    Animated.timing(blob1Anim, { toValue: 0, duration: 8000, useNativeDriver: true }),
                ])
            ),
            Animated.loop(
                Animated.sequence([
                    Animated.timing(blob2Anim, { toValue: 1, duration: 10000, useNativeDriver: true }),
                    Animated.timing(blob2Anim, { toValue: 0, duration: 10000, useNativeDriver: true }),
                ])
            ),
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                tension: 50,
                friction: 7,
                useNativeDriver: true,
            })
        ]).start();
    }, []);

    // Form State
    const [vehicleType, setVehicleType] = useState('Car');
    const [customVehicleType, setCustomVehicleType] = useState('');
    const [brand, setBrand] = useState('');
    const [model, setModel] = useState('');
    const [customModel, setCustomModel] = useState('');
    const [year, setYear] = useState(new Date().getFullYear().toString());
    const [regNumber, setRegNumber] = useState('');
    const [chassisNumber, setChassisNumber] = useState('');
    const [engineNumber, setEngineNumber] = useState('');
    const [fuelType, setFuelType] = useState('Petrol');
    const [customFuelType, setCustomFuelType] = useState('');
    const [bsNorm, setBsNorm] = useState('');
    const [customBsNorm, setCustomBsNorm] = useState('');
    const [color, setColor] = useState('');
    const [mileage, setMileage] = useState('');
    const [images, setImages] = useState<string[]>([]);
    const [errors, setErrors] = useState<Record<string, string | undefined>>({});

    // Dropdown Modal State
    const [modalVisible, setModalVisible] = useState(false);

    // Full-Screen Image Viewer State
    const [fullScreenVisible, setFullScreenVisible] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const imageScale = useRef(new Animated.Value(1)).current;
    const imageTranslateX = useRef(new Animated.Value(0)).current;
    const imageTranslateY = useRef(new Animated.Value(0)).current;
    const [modalType, setModalType] = useState<'brand' | 'model' | 'fuel' | 'emission'>('brand');
    const [searchQuery, setSearchQuery] = useState('');

    const currentBrands = useMemo(() => {
        if (!vehicleType || vehicleType === 'Other') return [];
        return VEHICLE_DATA[vehicleType] || [];
    }, [vehicleType]);

    const currentModels = useMemo(() => {
        if (!vehicleType || !brand) return [];
        const foundBrand = VEHICLE_DATA[vehicleType]?.find(b => b.name === brand);
        return foundBrand?.models || [];
    }, [vehicleType, brand]);

    // Calculate form progress
    useEffect(() => {
        const requiredFields = [vehicleType, brand, model, regNumber, year, fuelType, bsNorm];
        const filledFields = requiredFields.filter(field => field && field.trim()).length;
        const progress = (filledFields / requiredFields.length) * 100;
        setFormProgress(progress);
    }, [vehicleType, brand, model, regNumber, year, fuelType, bsNorm]);

    const handleVehicleTypeChange = (type: string) => {
        Haptics.selectionAsync();
        setVehicleType(type);
        setBrand('');
        setModel('');
        setCustomModel('');
        if (type !== 'Other') {
            // Reset custom fields if switching back
            setCustomVehicleType('');
        }
    };

    const openModal = (type: 'brand' | 'model' | 'fuel' | 'emission') => {
        setModalType(type);
        setSearchQuery('');
        setModalVisible(true);
        Haptics.selectionAsync();
    };

    const handleSelection = (value: string) => {
        Haptics.selectionAsync();
        if (modalType === 'brand') {
            setBrand(value);
            setModel(''); // Reset model when brand changes
            setCustomVehicleType(''); // Reset custom brand text if selected from dropdown
        } else if (modalType === 'model') {
            setModel(value);
            setCustomModel('');
        } else if (modalType === 'fuel') {
            setFuelType(value);
        } else if (modalType === 'emission') {
            setBsNorm(value);
        }
        setModalVisible(false);
    };

    const validateForm = () => {
        let newErrors: Record<string, string> = {};

        // Custom Vehicle Type (Make) Logic
        // If Type='Other', brand inputs are manual.
        // If Type!='Other', brand might be 'Other', then inputs are manual.

        // Brand Validation
        if (!brand || !brand.trim()) {
            newErrors.brand = t('required');
        } else if (brand === 'Other' && !customVehicleType.trim()) {
            newErrors.customVehicleType = t('required');
        }

        // Model Validation
        if (!model || !model.trim()) {
            newErrors.model = t('required');
        } else if (model === 'Other' && !customModel.trim()) {
            newErrors.model = t('required');
        }

        if (!regNumber || !regNumber.trim()) {
            newErrors.regNumber = t('required');
        } else {
            if (regNumber.length < 5) newErrors.regNumber = t('invalid_format');
        }

        const currentYear = new Date().getFullYear();
        const yearInt = parseInt(year);
        if (!year || isNaN(yearInt) || yearInt < 1950 || yearInt > currentYear + 1) {
            newErrors.year = t('invalid_format');
        }

        if (fuelType === 'Other' && !customFuelType.trim()) {
            newErrors.customFuelType = t('required');
        }

        if (!bsNorm) {
            newErrors.bsNorm = t('required');
        } else if (bsNorm === 'Other' && !customBsNorm.trim()) {
            newErrors.customBsNorm = t('required');
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    const handlePhotoAction = () => {
        Haptics.selectionAsync();
        Alert.alert(
            t('add_photo_btn'),
            t('choose_source'),
            [
                { text: t('camera'), onPress: takePhoto },
                { text: t('library'), onPress: pickImage },
                { text: t('cancel'), style: 'cancel' }
            ]
        );
    };

    const takePhoto = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert(t('permission_denied'), t('permission_denied_camera'));
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: false, // Changed to false for full image
            quality: 0.9, // Higher quality
        });

        if (!result.canceled) {
            setImages(prev => [...prev, result.assets[0].uri]);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
    };

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert(t('permission_denied'), t('permission_denied_gallery'));
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: false, // Changed to false for full images
            quality: 0.9, // Higher quality
            allowsMultipleSelection: true,
        });

        if (!result.canceled) {
            const newUris = result.assets.map(asset => asset.uri);
            setImages(prev => [...prev, ...newUris]);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
    };

    const removeImage = (index: number) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setImages(prev => prev.filter((_, i) => i !== index));
        if (fullScreenVisible) {
            if (images.length === 1) {
                setFullScreenVisible(false);
            } else if (currentImageIndex >= images.length - 1) {
                setCurrentImageIndex(Math.max(0, currentImageIndex - 1));
            }
        }
    };

    const openFullScreen = (index: number) => {
        setCurrentImageIndex(index);
        setFullScreenVisible(true);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    };

    const closeFullScreen = () => {
        setFullScreenVisible(false);
        // Reset transformations
        Animated.parallel([
            Animated.spring(imageScale, { toValue: 1, useNativeDriver: true }),
            Animated.spring(imageTranslateX, { toValue: 0, useNativeDriver: true }),
            Animated.spring(imageTranslateY, { toValue: 0, useNativeDriver: true })
        ]).start();
    };

    const navigateImage = (direction: 'next' | 'prev') => {
        Haptics.selectionAsync();
        if (direction === 'next' && currentImageIndex < images.length - 1) {
            setCurrentImageIndex(currentImageIndex + 1);
        } else if (direction === 'prev' && currentImageIndex > 0) {
            setCurrentImageIndex(currentImageIndex - 1);
        }
        // Reset zoom
        Animated.parallel([
            Animated.spring(imageScale, { toValue: 1, useNativeDriver: true }),
            Animated.spring(imageTranslateX, { toValue: 0, useNativeDriver: true }),
            Animated.spring(imageTranslateY, { toValue: 0, useNativeDriver: true })
        ]).start();
    };

    const handleSave = async () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        if (!validateForm()) {
            Alert.alert(t('validation_error'), t('validation_msg'));
            return;
        }

        setLoading(true);
        try {
            const finalMake = (vehicleType === 'Other' || brand === 'Other') ? customVehicleType : brand;
            const finalModel = model === 'Other' ? customModel : model;

            // Upload Photos First
            let uploadedImages: string[] = [];
            if (images.length > 0) {
                try {
                    uploadedImages = await Promise.all(images.map(img =>
                        uploadFile(img, 'image').then(res => res.url || res.path)
                    ));
                } catch (err) {
                    console.error('Failed to upload images', err);
                    Alert.alert(t('error'), t('failed_to_upload_images'));
                    setLoading(false);
                    return;
                }
            }

            const vehicleData = {
                make: finalMake,
                model: finalModel,
                vehicleType: vehicleType,
                year: year || '2023',
                registrationNumber: regNumber,
                fuelType: fuelType === 'Other' ? customFuelType : fuelType,
                bsNorm: bsNorm === 'Other' ? customBsNorm : bsNorm,
                chassisNumber: chassisNumber || undefined,
                engineNumber: engineNumber || undefined,
                color: color || undefined,
                mileage: mileage || undefined,
                images: uploadedImages.length > 0 ? uploadedImages : undefined,
            };

            console.log('Submitting vehicle data:', vehicleData);
            const newVehicleId = await addVehicle(vehicleData);
            console.log('Vehicle registered with ID:', newVehicleId);

            setTimeout(() => {
                setLoading(false);
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                router.replace({
                    pathname: '/(customer)/vehicle/[id]',
                    params: { id: newVehicleId }
                });
            }, 1000);
        } catch (e: any) {
            setLoading(false);
            console.error('Vehicle registration error:', e);
            const errorMessage = e.response?.data?.message || e.message || 'Failed to register vehicle';
            Alert.alert(t('error'), errorMessage);
        }
    };

    // Filter Logic for Modal
    const getModalData = () => {
        let data: string[] = [];
        if (modalType === 'brand') {
            data = currentBrands.map(b => b.name);
        } else if (modalType === 'model') {
            data = currentModels;
        } else if (modalType === 'fuel') {
            data = ['Petrol', 'Diesel', 'EV', 'CNG', 'LPG', 'Hybrid'];
        } else if (modalType === 'emission') {
            data = ['BS III', 'BS IV', 'BS VI', 'Euro 4', 'Euro 5', 'Euro 6', 'Electric'];
        }
        data.push('Other'); // Always add Other option

        if (!searchQuery) return data;
        return data.filter(item => item.toLowerCase().includes(searchQuery.toLowerCase()));
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

            {/* Enhanced Background Blobs */}
            <View style={StyleSheet.absoluteFill} pointerEvents="none">
                <Animated.View style={[
                    styles.blob,
                    {
                        backgroundColor: colors.primary,
                        top: -100,
                        left: -100,
                        opacity: isDark ? 0.08 : 0.05,
                        transform: [
                            { scale: blob1Anim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.2] }) },
                            { translateX: blob1Anim.interpolate({ inputRange: [0, 1], outputRange: [0, 20] }) }
                        ]
                    }
                ]} />
                <Animated.View style={[
                    styles.blob,
                    {
                        backgroundColor: colors.primary,
                        bottom: -150,
                        right: -120,
                        opacity: isDark ? 0.06 : 0.04,
                        transform: [
                            { scale: blob2Anim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.3] }) },
                            { translateY: blob2Anim.interpolate({ inputRange: [0, 1], outputRange: [0, -30] }) }
                        ]
                    }
                ]} />
            </View>

            <SafeAreaView style={{ flex: 1 }} edges={['top']}>
                {/* Enhanced Header with Progress */}
                <View style={{ backgroundColor: colors.background }}>
                    <View style={[styles.header, { borderBottomColor: colors.border }]}>
                        <TouchableOpacity
                            onPress={() => router.canGoBack() ? router.back() : router.replace('/(customer)/(tabs)')}
                            style={[styles.backBtn, { backgroundColor: isDark ? '#333' : '#F5F5F5' }]}
                        >
                            <Ionicons name="arrow-back" size={24} color={colors.text} />
                        </TouchableOpacity>
                        <View style={{ flex: 1, alignItems: 'center' }}>
                            <Text style={[styles.headerTitle, { color: colors.text }]}>{t('register_vehicle_title')}</Text>
                            <Text style={[styles.headerSubtitle, { color: colors.icon }]}>
                                {Math.round(formProgress)}% {t('complete') || 'Complete'}
                            </Text>
                        </View>
                        <View style={{ width: 44 }} />
                    </View>
                    {/* Progress Bar */}
                    <View style={[styles.progressBarContainer, { backgroundColor: isDark ? '#1C1C1E' : '#F5F5F5' }]}>
                        <Animated.View
                            style={[
                                styles.progressBar,
                                {
                                    width: `${formProgress}%`,
                                    backgroundColor: colors.primary,
                                    opacity: fadeAnim
                                }
                            ]}
                        />
                    </View>
                </View>

                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={{ flex: 1 }}
                >
                    <ScrollView
                        style={styles.scrollView}
                        contentContainerStyle={styles.content}
                        showsVerticalScrollIndicator={false}
                    >
                        {/* Vehicle Type Selection */}
                        <Text style={[styles.sectionTitle, { color: colors.icon }]}>{t('vehicle_type')}</Text>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            style={styles.typeScroll}
                            contentContainerStyle={styles.typeContainer}
                        >
                            {[
                                { id: 'Car', icon: 'car', iconSet: 'FA' },
                                { id: 'Bike', icon: 'motorcycle', iconSet: 'FA' },
                                { id: 'Scooter', icon: 'scooter', iconSet: 'MCI' },
                                { id: 'Truck', icon: 'truck', iconSet: 'FA' },
                                { id: 'Bus', icon: 'bus', iconSet: 'FA' },
                                { id: 'Tractor', icon: 'tractor', iconSet: 'MCI' },
                                { id: 'Van', icon: 'van-utility', iconSet: 'MCI' },
                                { id: 'Rickshaw', icon: 'rickshaw', iconSet: 'MCI' },
                                { id: 'Earthmover', icon: 'excavator', iconSet: 'MCI' },
                                { id: 'EV Vehicle', icon: 'vehicle-electric', iconSet: 'MCI' },
                                { id: 'Other', icon: 'question-circle', iconSet: 'FA' },
                            ].map((item) => (
                                <TouchableOpacity
                                    key={item.id}
                                    style={[styles.typeBtn, { backgroundColor: colors.card, borderColor: colors.border }, vehicleType === item.id && { backgroundColor: colors.primary, borderColor: colors.primary }]}
                                    onPress={() => handleVehicleTypeChange(item.id)}
                                >
                                    <VehicleIcon
                                        type={item.id}
                                        size={22}
                                        color={vehicleType === item.id ? '#fff' : colors.primary}
                                    />
                                    <Text style={[styles.typeBtnText, { color: colors.text }, vehicleType === item.id && styles.typeBtnTextActive]}>{item.id}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        {/* Form Content */}
                        <View style={styles.formContainer}>
                            <View style={[styles.sectionHeader, { borderBottomColor: colors.border }]}>
                                <MaterialCommunityIcons name="information-outline" size={20} color={colors.primary} />
                                <Text style={[styles.sectionHeaderText, { color: colors.text }]}>{t('basic_details')}</Text>
                            </View>

                            {/* Custom Vehicle Type Input (Only if Type is Other) */}
                            {vehicleType === 'Other' && (
                                <View style={styles.inputGroup}>
                                    <Text style={[styles.label, { color: colors.text }]}>{t('enter_vehicle_name')}</Text>
                                    <View style={[styles.inputWrapper, { backgroundColor: colors.card, borderColor: colors.border }, errors.customVehicleType && styles.inputWrapperError]}>
                                        <TextInput
                                            style={[styles.input, { color: colors.text }]}
                                            placeholder={t('vehicle_name_placeholder')}
                                            placeholderTextColor={colors.icon}
                                            value={customVehicleType}
                                            onChangeText={(val) => {
                                                setCustomVehicleType(val);
                                                if (errors.customVehicleType) setErrors(prev => ({ ...prev, customVehicleType: undefined }));
                                            }}
                                        />
                                    </View>
                                    {errors.customVehicleType && <Text style={styles.errorText}>{errors.customVehicleType}</Text>}
                                </View>
                            )}

                            {/* Brand Selection */}
                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, { color: colors.text }]}>
                                    {vehicleType === 'Other' ? 'Brand Name' : `${vehicleType} ${t('brand_label')}`}
                                </Text>

                                {vehicleType === 'Other' ? (
                                    // Text Input for manual brand entry
                                    <View style={[styles.inputWrapper, { backgroundColor: colors.card, borderColor: colors.border }, errors.brand && styles.inputWrapperError]}>
                                        <TextInput
                                            style={[styles.input, { color: colors.text }]}
                                            placeholder={t('enter_brand')}
                                            placeholderTextColor={colors.icon}
                                            value={brand}
                                            onChangeText={(val) => {
                                                setBrand(val);
                                                if (errors.brand) setErrors(prev => ({ ...prev, brand: undefined }));
                                            }}
                                        />
                                    </View>
                                ) : (
                                    // Dropdown Trigger for Brand
                                    <>
                                        {currentBrands.length > 0 && (
                                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.suggestScroll}>
                                                {currentBrands.map(b => (
                                                    <TouchableOpacity
                                                        key={b.name}
                                                        style={[
                                                            styles.brandPill,
                                                            { backgroundColor: colors.card, borderColor: colors.border },
                                                            brand === b.name && { backgroundColor: isDark ? colors.primary + '20' : '#E3F2FD', borderColor: colors.primary }
                                                        ]}
                                                        onPress={() => {
                                                            Haptics.selectionAsync();
                                                            setBrand(b.name);
                                                            setModel(''); // Reset model when brand changes via pill
                                                            setCustomVehicleType('');
                                                        }}
                                                    >
                                                        <View style={[styles.brandLogo, { borderColor: colors.border }]}>
                                                            <ExpoImage
                                                                source={{ uri: `https://www.google.com/s2/favicons?domain=${b.domain}&sz=128` }}
                                                                style={styles.brandLogoImage}
                                                                contentFit="contain"
                                                            />
                                                        </View>
                                                        <Text style={[styles.brandPillText, { color: colors.text }, brand === b.name && { color: colors.primary, fontWeight: '700' }]}>{b.name}</Text>
                                                    </TouchableOpacity>
                                                ))}
                                                {/* Other Brand Pill */}
                                                <TouchableOpacity
                                                    style={[
                                                        styles.brandPill,
                                                        { backgroundColor: colors.card, borderColor: colors.border },
                                                        brand === 'Other' && { backgroundColor: isDark ? colors.primary + '20' : '#E3F2FD', borderColor: colors.primary }
                                                    ]}
                                                    onPress={() => {
                                                        Haptics.selectionAsync();
                                                        setBrand('Other');
                                                        setModel('');
                                                        setCustomVehicleType('');
                                                    }}
                                                >
                                                    <FontAwesome name="pencil" size={16} color={brand === 'Other' ? colors.primary : colors.text} />
                                                    <Text style={[styles.brandPillText, { color: colors.text }, brand === 'Other' && { color: colors.primary, fontWeight: '700' }]}>Other</Text>
                                                </TouchableOpacity>
                                            </ScrollView>
                                        )}

                                        <TouchableOpacity
                                            style={[styles.dropdownTrigger, { backgroundColor: colors.card, borderColor: colors.border }, errors.brand && styles.inputWrapperError]}
                                            onPress={() => openModal('brand')}
                                        >
                                            <Text style={[styles.dropdownText, { color: brand ? colors.text : colors.icon }]}>
                                                {brand || t('enter_brand') || 'Select Brand'}
                                            </Text>
                                            <Ionicons name="chevron-down" size={20} color={colors.icon} />
                                        </TouchableOpacity>

                                        {brand === 'Other' && (
                                            <View style={[styles.inputWrapper, { marginTop: 10, backgroundColor: colors.card, borderColor: colors.border }]}>
                                                <TextInput
                                                    style={[styles.input, { color: colors.text }]}
                                                    placeholder="Specify Brand Name"
                                                    placeholderTextColor={colors.icon}
                                                    value={customVehicleType}
                                                    onChangeText={(val) => {
                                                        setCustomVehicleType(val);
                                                        if (errors.customVehicleType) setErrors(prev => ({ ...prev, customVehicleType: undefined }));
                                                    }}
                                                />
                                            </View>
                                        )}
                                    </>
                                )}
                                {errors.brand && <Text style={styles.errorText}>{errors.brand}</Text>}
                            </View>

                            {/* Model Selection */}
                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, { color: colors.text }]}>{t('model_label')}</Text>
                                {vehicleType === 'Other' || brand === 'Other' || !brand ? (
                                    // Text Input if no structured data available
                                    <View style={[
                                        styles.inputWrapper,
                                        { backgroundColor: colors.card, borderColor: colors.border },
                                        errors.model && styles.inputWrapperError,
                                        (!brand && vehicleType !== 'Other') && { opacity: 0.5, backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F5F5F5' }
                                    ]}>
                                        <TextInput
                                            style={[styles.input, { color: colors.text }]}
                                            placeholder={(!brand && vehicleType !== 'Other') ? "Select Brand First" : t('enter_model')}
                                            placeholderTextColor={colors.icon}
                                            value={model}
                                            onChangeText={(val) => {
                                                setModel(val);
                                                if (errors.model) setErrors(prev => ({ ...prev, model: undefined }));
                                            }}
                                            editable={!!brand || vehicleType === 'Other'} // Disable if no brand selected (unless type is other)
                                        />
                                    </View>
                                ) : (
                                    // Dropdown for Models
                                    <>
                                        {currentModels.length > 0 && (
                                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.suggestScroll}>
                                                {currentModels.map((m) => {
                                                    // Determine icon based on vehicle type
                                                    let iconName: any = 'car-side';
                                                    if (vehicleType === 'Bike') iconName = 'motorbike';
                                                    else if (vehicleType === 'Scooter') iconName = 'scooter';
                                                    else if (vehicleType === 'Truck') iconName = 'truck';
                                                    else if (vehicleType === 'Bus') iconName = 'bus';
                                                    else if (vehicleType === 'Tractor') iconName = 'tractor';
                                                    else if (vehicleType === 'Van') iconName = 'van-utility';
                                                    else if (vehicleType === 'Rickshaw') iconName = 'rickshaw';
                                                    else if (vehicleType === 'Earthmover') iconName = 'excavator';

                                                    return (
                                                        <TouchableOpacity
                                                            key={m}
                                                            style={[
                                                                styles.brandPill,
                                                                { backgroundColor: colors.card, borderColor: colors.border },
                                                                model === m && { backgroundColor: isDark ? colors.primary + '20' : '#E3F2FD', borderColor: colors.primary }
                                                            ]}
                                                            onPress={() => {
                                                                Haptics.selectionAsync();
                                                                setModel(m);
                                                                setCustomModel('');
                                                                if (errors.model) setErrors(prev => ({ ...prev, model: undefined }));
                                                            }}
                                                        >
                                                            <MaterialCommunityIcons
                                                                name={iconName}
                                                                size={16}
                                                                color={model === m ? colors.primary : colors.icon}
                                                            />
                                                            <Text style={[styles.brandPillText, { color: colors.text }, model === m && { color: colors.primary, fontWeight: '700' }]}>{m}</Text>
                                                        </TouchableOpacity>
                                                    );
                                                })}
                                                {/* Other Model Pill */}
                                                <TouchableOpacity
                                                    style={[
                                                        styles.brandPill,
                                                        { backgroundColor: colors.card, borderColor: colors.border },
                                                        model === 'Other' && { backgroundColor: isDark ? colors.primary + '20' : '#E3F2FD', borderColor: colors.primary }
                                                    ]}
                                                    onPress={() => {
                                                        Haptics.selectionAsync();
                                                        setModel('Other');
                                                        setCustomModel('');
                                                        if (errors.model) setErrors(prev => ({ ...prev, model: undefined }));
                                                    }}
                                                >
                                                    <FontAwesome name="pencil" size={16} color={model === 'Other' ? colors.primary : colors.text} />
                                                    <Text style={[styles.brandPillText, { color: colors.text }, model === 'Other' && { color: colors.primary, fontWeight: '700' }]}>Other</Text>
                                                </TouchableOpacity>
                                            </ScrollView>
                                        )}

                                        <TouchableOpacity
                                            style={[styles.dropdownTrigger, { backgroundColor: colors.card, borderColor: colors.border }, errors.model && styles.inputWrapperError]}
                                            onPress={() => openModal('model')}
                                        >
                                            <Text style={[styles.dropdownText, { color: model ? colors.text : colors.icon }]}>
                                                {model || t('enter_model') || 'Select Model'}
                                            </Text>
                                            <Ionicons name="chevron-down" size={20} color={colors.icon} />
                                        </TouchableOpacity>
                                    </>
                                )}
                                {model === 'Other' && (
                                    <View style={[styles.inputWrapper, { marginTop: 10, backgroundColor: colors.card, borderColor: colors.border }]}>
                                        <TextInput
                                            style={[styles.input, { color: colors.text }]}
                                            placeholder="Specify Model Name"
                                            placeholderTextColor={colors.icon}
                                            value={customModel}
                                            onChangeText={(val) => {
                                                setCustomModel(val);
                                                if (errors.model) setErrors(prev => ({ ...prev, model: undefined }));
                                            }}
                                        />
                                    </View>
                                )}
                                {errors.model && <Text style={styles.errorText}>{errors.model}</Text>}
                            </View>

                            {/* Registration Number */}
                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, { color: colors.text }, errors.regNumber && styles.labelError]}>{t('vehicle_number')}</Text>
                                <View style={[styles.inputWrapper, { backgroundColor: colors.card, borderColor: colors.border }, errors.regNumber && styles.inputWrapperError]}>
                                    <TextInput
                                        style={[styles.input, { color: colors.text }]}
                                        placeholder={t('vehicle_number_placeholder')}
                                        placeholderTextColor={colors.icon}
                                        autoCapitalize="characters"
                                        value={regNumber}
                                        onChangeText={(val) => {
                                            setRegNumber(val);
                                            if (errors.regNumber) setErrors(prev => ({ ...prev, regNumber: undefined }));
                                        }}
                                    />
                                </View>
                                {errors.regNumber && <Text style={styles.errorText}>{errors.regNumber}</Text>}
                            </View>

                            {/* Technical Details */}
                            <View style={[styles.sectionHeader, { marginTop: 15, borderBottomColor: colors.border }]}>
                                <MaterialCommunityIcons name="cog-outline" size={20} color={colors.primary} />
                                <Text style={[styles.sectionHeaderText, { color: colors.text }]}>{t('technical_details')}</Text>
                            </View>

                            <View style={styles.row}>
                                <View style={[styles.inputGroup, { flex: 1 }]}>
                                    <Text style={[styles.label, { color: colors.text }]}>{t('chassis_number')}</Text>
                                    <View style={[styles.inputWrapper, { backgroundColor: colors.card, borderColor: colors.border }]}>
                                        <TextInput
                                            style={[styles.input, { color: colors.text }]}
                                            placeholder="VIN"
                                            placeholderTextColor={colors.icon}
                                            autoCapitalize="characters"
                                            value={chassisNumber}
                                            onChangeText={setChassisNumber}
                                        />
                                    </View>
                                </View>
                                <View style={[styles.inputGroup, { flex: 1 }]}>
                                    <Text style={[styles.label, { color: colors.text }]}>{t('engine_number')}</Text>
                                    <View style={[styles.inputWrapper, { backgroundColor: colors.card, borderColor: colors.border }]}>
                                        <TextInput
                                            style={[styles.input, { color: colors.text }]}
                                            placeholder="Eng No."
                                            placeholderTextColor={colors.icon}
                                            autoCapitalize="characters"
                                            value={engineNumber}
                                            onChangeText={setEngineNumber}
                                        />
                                    </View>
                                </View>
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, { color: colors.text }, errors.year && styles.labelError]}>{t('manufacturing_year')}</Text>
                                <View style={[styles.inputWrapper, { backgroundColor: colors.card, borderColor: colors.border }, errors.year && styles.inputWrapperError]}>
                                    <TextInput
                                        style={[styles.input, { color: colors.text }]}
                                        placeholder="Ex: 2023"
                                        placeholderTextColor={colors.icon}
                                        keyboardType="numeric"
                                        maxLength={4}
                                        value={year}
                                        onChangeText={(val) => {
                                            setYear(val);
                                            if (errors.year) setErrors(prev => ({ ...prev, year: undefined }));
                                        }}
                                    />
                                </View>
                                {errors.year && <Text style={styles.errorText}>{errors.year}</Text>}
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, { color: colors.text }, errors.fuelType && styles.labelError]}>{t('fuel_type')}</Text>
                                <TouchableOpacity
                                    style={[styles.dropdownTrigger, { backgroundColor: colors.card, borderColor: colors.border }, errors.fuelType && styles.inputWrapperError]}
                                    onPress={() => openModal('fuel')}
                                >
                                    <Text style={[styles.dropdownText, { color: fuelType ? colors.text : colors.icon }]}>
                                        {fuelType || t('specify_fuel_type') || 'Select Fuel Type'}
                                    </Text>
                                    <Ionicons name="chevron-down" size={20} color={colors.icon} />
                                </TouchableOpacity>

                                {fuelType === 'Other' && (
                                    <View style={[styles.inputWrapper, { marginTop: 10, backgroundColor: colors.card, borderColor: colors.border }, errors.customFuelType && styles.inputWrapperError]}>
                                        <TextInput
                                            style={[styles.input, { color: colors.text }]}
                                            placeholder="Ex: Hydrogen, Multi-fuel..."
                                            placeholderTextColor={colors.icon}
                                            value={customFuelType}
                                            onChangeText={(val) => {
                                                setCustomFuelType(val);
                                                if (errors.customFuelType) setErrors(prev => ({ ...prev, customFuelType: undefined }));
                                            }}
                                        />
                                    </View>
                                )}
                                {errors.customFuelType && <Text style={styles.errorText}>{errors.customFuelType}</Text>}
                            </View>

                            {/* BS Norm Selection */}
                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, { color: colors.text }, errors.bsNorm && styles.labelError]}>{t('bs_norm') || 'BS Emission Standard'}</Text>
                                <TouchableOpacity
                                    style={[styles.dropdownTrigger, { backgroundColor: colors.card, borderColor: colors.border }, errors.bsNorm && styles.inputWrapperError]}
                                    onPress={() => openModal('emission')}
                                >
                                    <Text style={[styles.dropdownText, { color: bsNorm ? colors.text : colors.icon }]}>
                                        {bsNorm || t('select_bs_norm') || 'Select Standard'}
                                    </Text>
                                    <Ionicons name="chevron-down" size={20} color={colors.icon} />
                                </TouchableOpacity>
                                {errors.bsNorm && <Text style={styles.errorText}>{errors.bsNorm}</Text>}

                                {bsNorm === 'Other' && (
                                    <View style={[styles.inputWrapper, { marginTop: 10, backgroundColor: colors.card, borderColor: colors.border }, errors.customBsNorm && styles.inputWrapperError]}>
                                        <TextInput
                                            style={[styles.input, { color: colors.text }]}
                                            placeholder="Specify Standard"
                                            placeholderTextColor={colors.icon}
                                            value={customBsNorm}
                                            onChangeText={(val) => {
                                                setCustomBsNorm(val);
                                                if (errors.customBsNorm) setErrors(prev => ({ ...prev, customBsNorm: undefined }));
                                            }}
                                        />
                                    </View>
                                )}
                                {errors.customBsNorm && <Text style={styles.errorText}>{errors.customBsNorm}</Text>}
                            </View>

                            {/* Additional Details Section */}
                            <View style={[styles.sectionHeader, { marginTop: 15, borderBottomColor: colors.border }]}>
                                <MaterialCommunityIcons name="information-outline" size={20} color={colors.primary} />
                                <Text style={[styles.sectionHeaderText, { color: colors.text }]}>{t('additional_details') || 'Additional Details'}</Text>
                            </View>

                            <View style={styles.row}>
                                <View style={[styles.inputGroup, { flex: 1 }]}>
                                    <Text style={[styles.label, { color: colors.text }]}>{t('color') || 'Color'}</Text>
                                    <View style={[styles.inputWrapper, { backgroundColor: colors.card, borderColor: colors.border }]}>
                                        <TextInput
                                            style={[styles.input, { color: colors.text }]}
                                            placeholder={t('vehicle_color') || 'e.g. White, Black'}
                                            placeholderTextColor={colors.icon}
                                            value={color}
                                            onChangeText={setColor}
                                        />
                                    </View>
                                </View>
                                <View style={[styles.inputGroup, { flex: 1 }]}>
                                    <Text style={[styles.label, { color: colors.text }]}>{t('mileage') || 'Mileage'}</Text>
                                    <View style={[styles.inputWrapper, { backgroundColor: colors.card, borderColor: colors.border }]}>
                                        <TextInput
                                            style={[styles.input, { color: colors.text }]}
                                            placeholder={t('km_driven') || 'e.g. 15000 km'}
                                            placeholderTextColor={colors.icon}
                                            value={mileage}
                                            onChangeText={setMileage}
                                        />
                                    </View>
                                </View>
                            </View>

                            {/* Photos Section */}
                            <View style={[styles.sectionHeader, { marginTop: 15, borderBottomColor: colors.border }]}>
                                <MaterialCommunityIcons name="camera-outline" size={20} color={colors.primary} />
                                <Text style={[styles.sectionHeaderText, { color: colors.text }]}>{t('vehicle_photos')}</Text>
                            </View>

                            <View style={[styles.photoContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
                                {/* Images Display - Horizontal Scroll */}
                                {images.length > 0 && (
                                    <ScrollView
                                        horizontal
                                        showsHorizontalScrollIndicator={false}
                                        contentContainerStyle={{ paddingVertical: 10, gap: 12 }}
                                    >
                                        {images.map((uri, index) => (
                                            <View key={index} style={styles.imageThumbContainer}>
                                                <TouchableOpacity
                                                    onPress={() => openFullScreen(index)}
                                                    activeOpacity={0.8}
                                                    style={styles.imageThumb}
                                                >
                                                    <Image
                                                        source={{ uri }}
                                                        style={styles.thumbImage}
                                                    />
                                                </TouchableOpacity>
                                                <TouchableOpacity
                                                    style={styles.thumbRemoveBtn}
                                                    onPress={() => removeImage(index)}
                                                >
                                                    <Ionicons name="close-circle" size={24} color="#FF3B30" />
                                                </TouchableOpacity>
                                            </View>
                                        ))}
                                    </ScrollView>
                                )}

                                {/* Add Photo Button */}
                                <TouchableOpacity
                                    style={[styles.addPhotoBtn, { backgroundColor: isDark ? colors.background : '#F8F9FE', borderColor: colors.primary }]}
                                    onPress={handlePhotoAction}
                                >
                                    <MaterialCommunityIcons name="camera-plus" size={32} color={colors.primary} />
                                    <Text style={[styles.addPhotoText, { color: colors.primary }]}>{t('add_photo_btn')}</Text>
                                </TouchableOpacity>

                                {images.length === 0 && (
                                    <Text style={[styles.photoInfo, { color: colors.icon }]}>{t('photo_instruction')}</Text>
                                )}
                            </View>

                            <AppButton
                                title={t('register_btn')}
                                onPress={handleSave}
                                loading={loading}
                                size="large"
                                icon="shield-checkmark"
                                style={{ marginTop: 20, marginBottom: 40 }}
                            />
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>

                {/* Selection Modal */}
                <Modal
                    visible={modalVisible}
                    animationType="slide"
                    transparent
                    onRequestClose={() => setModalVisible(false)}
                >
                    <View style={styles.modalOverlay}>
                        <BlurView intensity={20} tint={isDark ? "dark" : "light"} style={StyleSheet.absoluteFill} />
                        <View style={[styles.modalContent, { backgroundColor: colors.background, borderColor: colors.border }]}>
                            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
                                <Text style={[styles.modalTitle, { color: colors.text }]}>
                                    Select {modalType === 'brand' ? 'Brand' : modalType === 'model' ? 'Model' : modalType === 'fuel' ? 'Fuel Type' : 'Emission Standard'}
                                </Text>
                                <TouchableOpacity onPress={() => setModalVisible(false)}>
                                    <Ionicons name="close" size={24} color={colors.text} />
                                </TouchableOpacity>
                            </View>

                            <View style={[styles.searchContainer, { backgroundColor: colors.card }]}>
                                <Ionicons name="search" size={20} color={colors.icon} />
                                <TextInput
                                    style={[styles.searchInput, { color: colors.text }]}
                                    placeholder="Search..."
                                    placeholderTextColor={colors.icon}
                                    value={searchQuery}
                                    onChangeText={setSearchQuery}
                                />
                            </View>

                            <ScrollView contentContainerStyle={{ padding: 15 }}>
                                {getModalData().map((item, index) => (
                                    <TouchableOpacity
                                        key={index}
                                        style={[styles.modalItem, { borderBottomColor: colors.border }]}
                                        onPress={() => handleSelection(item)}
                                    >
                                        <Text style={[styles.modalItemText, { color: colors.text }]}>{item}</Text>
                                        {(modalType === 'brand' && brand === item) || (modalType === 'model' && model === item) || (modalType === 'fuel' && fuelType === item) || (modalType === 'emission' && bsNorm === item) ? (
                                            <Ionicons name="checkmark" size={20} color={colors.primary} />
                                        ) : null}
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                    </View>
                </Modal>

                {/* Full-Screen Image Viewer */}
                <Modal
                    visible={fullScreenVisible}
                    animationType="fade"
                    transparent={false}
                    onRequestClose={closeFullScreen}
                >
                    <View style={[styles.fullScreenContainer, { backgroundColor: '#000' }]}>
                        <StatusBar barStyle="light-content" backgroundColor="#000" />

                        {/* Header Controls */}
                        <SafeAreaView style={styles.fullScreenHeader}>
                            <TouchableOpacity
                                style={styles.fullScreenCloseBtn}
                                onPress={closeFullScreen}
                            >
                                <Ionicons name="close" size={28} color="#FFF" />
                            </TouchableOpacity>

                            <Text style={styles.fullScreenCounter}>
                                {currentImageIndex + 1} / {images.length}
                            </Text>

                            <TouchableOpacity
                                style={styles.fullScreenDeleteBtn}
                                onPress={() => {
                                    Alert.alert(
                                        t('delete_photo') || 'Delete Photo',
                                        t('delete_photo_confirm') || 'Are you sure you want to delete this photo?',
                                        [
                                            { text: t('cancel'), style: 'cancel' },
                                            {
                                                text: t('delete') || 'Delete',
                                                style: 'destructive',
                                                onPress: () => removeImage(currentImageIndex)
                                            }
                                        ]
                                    );
                                }}
                            >
                                <Ionicons name="trash-outline" size={24} color="#FF3B30" />
                            </TouchableOpacity>
                        </SafeAreaView>

                        {/* Image Display */}
                        <View style={styles.fullScreenImageContainer}>
                            <Animated.Image
                                source={{ uri: images[currentImageIndex] }}
                                style={[
                                    styles.fullScreenImage,
                                    {
                                        transform: [
                                            { scale: imageScale },
                                            { translateX: imageTranslateX },
                                            { translateY: imageTranslateY }
                                        ]
                                    }
                                ]}
                                resizeMode="contain"
                            />
                        </View>

                        {/* Navigation Controls */}
                        {images.length > 1 && (
                            <View style={styles.fullScreenNavigation}>
                                <TouchableOpacity
                                    style={[
                                        styles.navButton,
                                        currentImageIndex === 0 && styles.navButtonDisabled
                                    ]}
                                    onPress={() => navigateImage('prev')}
                                    disabled={currentImageIndex === 0}
                                >
                                    <Ionicons
                                        name="chevron-back"
                                        size={32}
                                        color={currentImageIndex === 0 ? '#666' : '#FFF'}
                                    />
                                </TouchableOpacity>

                                <View style={styles.thumbnailContainer}>
                                    <ScrollView
                                        horizontal
                                        showsHorizontalScrollIndicator={false}
                                        contentContainerStyle={styles.thumbnailScroll}
                                    >
                                        {images.map((uri, index) => (
                                            <TouchableOpacity
                                                key={index}
                                                onPress={() => {
                                                    setCurrentImageIndex(index);
                                                    Haptics.selectionAsync();
                                                }}
                                                style={[
                                                    styles.thumbnail,
                                                    currentImageIndex === index && styles.thumbnailActive
                                                ]}
                                            >
                                                <Image source={{ uri }} style={styles.thumbnailImage} />
                                            </TouchableOpacity>
                                        ))}
                                    </ScrollView>
                                </View>

                                <TouchableOpacity
                                    style={[
                                        styles.navButton,
                                        currentImageIndex === images.length - 1 && styles.navButtonDisabled
                                    ]}
                                    onPress={() => navigateImage('next')}
                                    disabled={currentImageIndex === images.length - 1}
                                >
                                    <Ionicons
                                        name="chevron-forward"
                                        size={32}
                                        color={currentImageIndex === images.length - 1 ? '#666' : '#FFF'}
                                    />
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                </Modal>

            </SafeAreaView>
        </View >
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    blob: { position: 'absolute', width: 350, height: 350, borderRadius: 175 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
    backBtn: { width: 44, height: 44, padding: 0, justifyContent: 'center', alignItems: 'center', borderRadius: 12 },
    headerTitle: { fontSize: 18, fontFamily: 'NotoSans-Bold' },
    headerSubtitle: { fontSize: 11, fontFamily: 'NotoSans-Medium', marginTop: 2 },
    progressBarContainer: {
        height: 3,
        width: '100%',
        overflow: 'hidden',
    },
    progressBar: {
        height: '100%',
        borderRadius: 2,
    },
    scrollView: { flex: 1 },
    content: { padding: 20 },
    sectionTitle: {
        fontSize: 14,
        fontFamily: 'NotoSans-Bold',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 15,
        marginLeft: 4
    },
    typeScroll: { marginBottom: 25 },
    typeContainer: { flexDirection: 'row', gap: 12, paddingRight: 20 },
    typeBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 16,
        borderWidth: 1,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    typeBtnText: { fontSize: 13, fontFamily: 'NotoSans-Regular' },
    typeBtnTextActive: { color: '#ffffff', fontFamily: 'NotoSans-Bold' },
    formContainer: { gap: 20 },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingBottom: 8,
        borderBottomWidth: 1,
        marginBottom: 8
    },
    sectionHeaderText: { fontSize: 16, fontFamily: 'NotoSans-Bold' },
    inputGroup: { gap: 8 },
    row: { flexDirection: 'row', gap: 12 },
    label: { fontSize: 13, fontFamily: 'NotoSans-Bold', marginLeft: 4 },
    inputWrapper: {
        borderRadius: 14,
        borderWidth: 1,
        overflow: 'hidden',
    },
    input: {
        padding: 14,
        fontSize: 15,
        fontFamily: 'NotoSans-Regular',
    },
    suggestScroll: { marginBottom: 12, marginLeft: 4 },
    brandPill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: 12,
        borderWidth: 1,
        marginRight: 10,
    },
    brandPillText: { fontSize: 12, fontFamily: 'NotoSans-Regular' },
    brandLogo: {
        width: 22,
        height: 22,
        borderRadius: 11,
        backgroundColor: '#fff',
        overflow: 'hidden',
        borderWidth: 1,
    },
    brandLogoImage: { width: '100%', height: '100%' },
    photoContainer: {
        borderRadius: 16,
        padding: 15,
        borderWidth: 1,
    },
    imageThumbContainer: {
        position: 'relative',
        marginRight: 12,
    },
    imageThumb: {
        width: 80,
        height: 80,
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: '#f0f0f0',
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.1)',
    },
    thumbImage: {
        width: '100%',
        height: '100%',
    },
    thumbRemoveBtn: {
        position: 'absolute',
        top: -8,
        right: -8,
        backgroundColor: '#fff',
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    addPhotoBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        paddingVertical: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderStyle: 'dashed',
        marginTop: 10,
    },
    addPhotoText: {
        fontSize: 14,
        fontFamily: 'NotoSans-Bold',
    },
    photoInfo: {
        fontSize: 12,
        textAlign: 'center',
        marginTop: 12,
        fontFamily: 'NotoSans-Regular',
        fontStyle: 'italic'
    },
    labelError: { color: '#FF3B30' },
    inputWrapperError: { borderColor: '#FF3B30', backgroundColor: '#FFF9F9' },
    errorText: { fontSize: 11, color: '#FF3B30', marginLeft: 4, marginTop: -4 },

    // Modal & Dropdown Styles
    dropdownTrigger: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 14,
        borderRadius: 14,
        borderWidth: 1,
    },
    dropdownText: { fontSize: 15, fontFamily: 'NotoSans-Regular' },
    modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
    modalContent: {
        height: '70%',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        borderWidth: 1,
        borderBottomWidth: 0,
        elevation: 5,
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 20,
        borderBottomWidth: 1,
    },
    modalTitle: { fontSize: 18, fontFamily: 'NotoSans-Bold' },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        margin: 15,
        paddingHorizontal: 15,
        height: 48,
        borderRadius: 12,
        gap: 10,
    },
    searchInput: { flex: 1, fontSize: 16, fontFamily: 'NotoSans-Regular', height: '100%' },
    modalItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        paddingHorizontal: 5,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.05)',
    },
    modalItemText: { fontSize: 16, fontFamily: 'NotoSans-Medium' },

    // Full-Screen Image Viewer Styles
    fullScreenContainer: {
        flex: 1,
    },
    fullScreenHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    fullScreenCloseBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255,255,255,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    fullScreenCounter: {
        color: '#FFF',
        fontSize: 16,
        fontFamily: 'NotoSans-Bold',
    },
    fullScreenDeleteBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255,59,48,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    fullScreenImageContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    fullScreenImage: {
        width: '100%',
        height: '100%',
    },
    fullScreenNavigation: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 20,
        backgroundColor: 'rgba(0,0,0,0.5)',
        gap: 10,
    },
    navButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255,255,255,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    navButtonDisabled: {
        opacity: 0.3,
    },
    thumbnailContainer: {
        flex: 1,
    },
    thumbnailScroll: {
        gap: 8,
        paddingHorizontal: 5,
    },
    thumbnail: {
        width: 60,
        height: 60,
        borderRadius: 8,
        overflow: 'hidden',
        borderWidth: 2,
        borderColor: 'transparent',
    },
    thumbnailActive: {
        borderColor: '#FFF',
    },
    thumbnailImage: {
        width: '100%',
        height: '100%',
    },
});
