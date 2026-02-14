import { Colors } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { authService } from '@/services/authService';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Animated,
    Dimensions,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

type RegisterStep = 'role' | 'mobile' | 'form' | 'docs' | 'success';
type Role = 'customer' | 'technician' | 'supplier';

export default function UnifiedRegistration() {
    const router = useRouter();
    const { t } = useLanguage();
    const params = useLocalSearchParams();
    const colorScheme = useColorScheme();
    const theme = colorScheme ?? 'light';
    const colors = Colors[theme];
    const isDark = theme === 'dark';

    // UI State
    const [step, setStep] = useState<RegisterStep>('role');
    const [role, setRole] = useState<Role>((params.role as Role) || 'customer');
    const [loading, setLoading] = useState(false);
    const [isOtpSent, setIsOtpSent] = useState(false);

    // Animation Values
    const fadeAnim = useRef(new Animated.Value(1)).current;
    const slideAnim = useRef(new Animated.Value(0)).current;

    // Mobile/OTP State
    const [phoneNumber, setPhoneNumber] = useState((params.mobile as string) || '');
    const [otp, setOtp] = useState(['', '', '', '']);
    const otpInputs = useRef<(TextInput | null)[]>([]);

    // Form State
    const [formData, setFormData] = useState({
        // Common
        fullName: '',
        address: '',
        city: '',
        email: '',
        // Technician Specific
        garageName: '',
        radius: '10',
        vehicleTypes: [] as string[],
        otherVehicleType: '',
        // Docs (Mock)
        idProof: false,
        garagePhoto: false,
        license: false,
    });

    const animateTransition = (nextStep: RegisterStep) => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 0, duration: 250, useNativeDriver: true }),
            Animated.timing(slideAnim, { toValue: -30, duration: 250, useNativeDriver: true })
        ]).start(() => {
            setStep(nextStep);
            slideAnim.setValue(30);
            Animated.parallel([
                Animated.timing(fadeAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
                Animated.timing(slideAnim, { toValue: 0, duration: 250, useNativeDriver: true })
            ]).start();
        });
    };

    // --- Action Handlers ---

    const handleBack = () => {
        if (step === 'mobile') animateTransition('role');
        else if (step === 'form') animateTransition('mobile');
        else if (step === 'docs') animateTransition('form');
        else if (step === 'success') router.replace('/(auth)/login');
        else if (router.canGoBack()) {
            router.back();
        } else {
            router.replace('/(auth)/login');
        }
    };

    const { login, verifyOtp, refreshUser, user: authUser } = useAuth();

    const handleSendOtp = async () => {
        if (phoneNumber.length < 10) {
            Alert.alert(t('error'), t('invalid_number') || 'Please enter a valid mobile number.');
            return;
        }
        setLoading(true);
        try {
            // isRegister = true
            await login(phoneNumber, role, true);
            setIsOtpSent(true);
        } catch (e: any) {
            // 400 means user exists, usually logic in backend handles it or we catch it here
            Alert.alert(t('error'), e.response?.data?.message || t('error_submit'));
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async () => {
        const enteredOtp = otp.join('');
        if (enteredOtp.length !== 4) {
            Alert.alert(t('error'), t('incomplete_otp') || 'Please enter the 4-digit verification code.');
            return;
        }
        setLoading(true);
        try {
            const success = await verifyOtp(phoneNumber, enteredOtp);
            if (success) {
                animateTransition('form');
            }
        } catch (e: any) {
            // Error alert handled in context
        } finally {
            setLoading(false);
        }
    };

    const handleFormSubmit = () => {
        if (role === 'customer') {
            if (!formData.fullName || !formData.address || !formData.city) {
                Alert.alert(t('selection_required'), t('essential_details'));
                return;
            }
            // Customer skip docs
            handleSubmitAll();
        } else if (role === 'supplier') {
            if (!formData.fullName || !formData.garageName || !formData.address || !formData.city) {
                Alert.alert(t('selection_required'), t('business_details'));
                return;
            }
            animateTransition('docs');
        } else {
            // Technician
            if (!formData.fullName || !formData.garageName || !formData.address) {
                Alert.alert(t('selection_required'), t('professional_identity'));
                return;
            }
            animateTransition('docs');
        }
    };

    const handleSubmitDocs = () => {
        if (!formData.idProof || !formData.garagePhoto) {
            Alert.alert(t('selection_required'), t('missing_documents_msg'));
            return;
        }
        handleSubmitAll();
    };

    const handleSubmitAll = async () => {
        setLoading(true);
        try {
            // Filter out 'Other' and add the custom type if it exists
            let finalVehicleTypes = formData.vehicleTypes;
            if (formData.vehicleTypes.includes('Other')) {
                finalVehicleTypes = formData.vehicleTypes.filter(t => t !== 'Other');
                if (formData.otherVehicleType.trim()) {
                    finalVehicleTypes.push(formData.otherVehicleType.trim());
                }
            }

            const finalData = { ...formData, vehicleTypes: finalVehicleTypes };
            await authService.updateProfile(finalData);
            await refreshUser();
            animateTransition('success');
        } catch (e: any) {
            Alert.alert(t('registration_failed'), t('registration_failed_msg'));
        } finally {
            setLoading(false);
        }
    };

    const toggleVehicleType = (type: string) => {
        const types = [...formData.vehicleTypes];
        if (types.includes(type)) {
            setFormData({ ...formData, vehicleTypes: types.filter(t => t !== type) });
        } else {
            setFormData({ ...formData, vehicleTypes: [...types, type] });
        }
    };

    const handleOtpChange = (value: string, index: number) => {
        const nextOtp = [...otp];
        nextOtp[index] = value;
        setOtp(nextOtp);
        if (value && index < 3) otpInputs.current[index + 1]?.focus();
    };

    // --- Sub-View Renderers ---

    const renderHeader = () => {
        if (step === 'success') return null;
        return (
            <View style={[styles.header, { borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={handleBack} style={[styles.backBtn, { backgroundColor: colors.card }]}>
                    <Ionicons name="chevron-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <View style={styles.logoMini}>
                    <MaterialCommunityIcons name="shield-car" size={28} color={colors.primary} />
                </View>
                <View style={{ width: 44 }} />
            </View>
        );
    };

    const renderStepContent = () => {
        switch (step) {
            case 'role':
                return (
                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                        <View style={styles.hero}>
                            <View style={[styles.badge, { backgroundColor: colors.primary + '15' }]}>
                                <Text style={[styles.badgeText, { color: colors.primary }]}>{t('join_network')}</Text>
                            </View>
                            <Text style={[styles.heroTitle, { color: colors.text }]}>{t('start_journey')}</Text>
                            <Text style={[styles.heroSubtitle, { color: colors.icon }]}>{t('choose_role_desc')}</Text>
                        </View>

                        <View style={styles.roleGrid}>
                            {[
                                { id: 'customer', title: t('customer'), sub: t('vehicle_owner') || 'Vehicle Owner', icon: 'person', type: 'ion', color: colors.primary, desc: t('manage_vehicles_desc') || 'Manage vehicles and book services' },
                                { id: 'technician', title: t('partner'), sub: t('tech_garage') || 'Technician / Garage', icon: 'wrench', type: 'mci', color: '#34C759', desc: t('accept_jobs_desc') || 'Accept jobs and grow your business' },
                                { id: 'supplier', title: t('supplier'), sub: t('spare_parts') || 'Spare Parts', icon: 'package-variant-closed', type: 'mci', color: '#FF9500', desc: t('sell_parts_desc') || 'Sell genuine parts to the network' },
                            ].map((item) => (
                                <TouchableOpacity
                                    key={item.id}
                                    activeOpacity={0.7}
                                    style={[
                                        styles.roleCard,
                                        {
                                            backgroundColor: colors.card,
                                            borderColor: role === item.id ? item.color : colors.border,
                                            borderWidth: role === item.id ? 2 : 1,
                                            shadowColor: item.color,
                                            shadowOpacity: role === item.id ? 0.15 : 0,
                                            shadowRadius: 10,
                                            elevation: role === item.id ? 4 : 0,
                                        }
                                    ]}
                                    onPress={() => {
                                        setRole(item.id as Role);
                                        Haptics.selectionAsync();
                                    }}
                                >
                                    <View style={[styles.roleIconBg, { backgroundColor: role === item.id ? item.color : (isDark ? '#2C2C2C' : '#F5F5F5') }]}>
                                        {item.type === 'ion' ? (
                                            <Ionicons name={item.icon as any} size={28} color={role === item.id ? '#FFF' : item.color} />
                                        ) : (
                                            <MaterialCommunityIcons name={item.icon as any} size={28} color={role === item.id ? '#FFF' : item.color} />
                                        )}
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={[styles.roleTitle, { color: colors.text }]}>{item.title}</Text>
                                        <Text style={[styles.roleSub, { color: colors.icon }]}>{item.sub}</Text>
                                        <Text style={[styles.roleDesc, { color: colors.icon }]} numberOfLines={1}>{item.desc}</Text>
                                    </View>
                                    {role === item.id && (
                                        <View style={[styles.checkBadge, { backgroundColor: item.color }]}>
                                            <Ionicons name="checkmark" size={16} color="#FFF" />
                                        </View>
                                    )}
                                </TouchableOpacity>
                            ))}
                        </View>

                        <TouchableOpacity
                            style={[styles.continueBtn, { backgroundColor: colors.text }]}
                            onPress={() => {
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                                animateTransition('mobile');
                            }}
                        >
                            <Text style={[styles.continueBtnText, { color: colors.background }]}>{t('next_step')}</Text>
                            <Ionicons name="arrow-forward" size={20} color={colors.background} />
                        </TouchableOpacity>
                    </ScrollView>
                );

            case 'mobile':
                return (
                    <ScrollView contentContainerStyle={styles.scrollContent}>
                        <View style={styles.hero}>
                            <Text style={[styles.heroTitle, { color: colors.text }]}>{t('your_mobile')}</Text>
                            <Text style={[styles.heroSubtitle, { color: colors.icon }]}>{t('secure_access_otp')}</Text>
                        </View>
                        <View style={styles.inputStack}>
                            <View style={[styles.inputWrapper, { backgroundColor: colors.card, borderColor: colors.border }]}>
                                <View style={[styles.prefix, { borderColor: colors.border }]}>
                                    <Text style={[styles.prefixText, { color: colors.text }]}>+91</Text>
                                </View>
                                <TextInput
                                    style={[styles.mainInput, { color: colors.text }]}
                                    placeholder={t('mobile_number')}
                                    placeholderTextColor={colors.icon}
                                    keyboardType="number-pad"
                                    maxLength={10}
                                    value={phoneNumber}
                                    onChangeText={setPhoneNumber}
                                    editable={!isOtpSent}
                                />
                                {isOtpSent && <Ionicons name="checkmark-circle" size={20} color="#34C759" style={{ marginRight: 15 }} />}
                            </View>

                            {!isOtpSent ? (
                                <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.text }]} onPress={handleSendOtp} disabled={loading}>
                                    {loading ? <ActivityIndicator color={colors.background} /> : <Text style={[styles.actionBtnText, { color: colors.background }]}>{t('send_verification_code')}</Text>}
                                </TouchableOpacity>
                            ) : (
                                <View style={{ marginTop: 25 }}>
                                    <View style={styles.otpRow}>
                                        {otp.map((digit, idx) => (
                                            <TextInput
                                                key={idx}
                                                ref={r => { if (r) otpInputs.current[idx] = r; }}
                                                style={[styles.otpBox, { backgroundColor: colors.card, borderColor: digit ? colors.text : colors.border, color: colors.text }]}
                                                keyboardType="number-pad"
                                                maxLength={1}
                                                value={digit}
                                                onChangeText={v => handleOtpChange(v, idx)}
                                                textContentType="oneTimeCode"
                                            />
                                        ))}
                                    </View>
                                    <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.text }]} onPress={handleVerifyOtp} disabled={loading}>
                                        {loading ? <ActivityIndicator color={colors.background} /> : <Text style={[styles.actionBtnText, { color: colors.background }]}>{t('verify_proceed')}</Text>}
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => setIsOtpSent(false)} style={styles.textLink}>
                                        <Text style={[styles.textLinkText, { color: colors.primary }]}>{t('change_mobile')}</Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>
                    </ScrollView>
                );

            case 'form':
                return (
                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                        <View style={styles.hero}>
                            <Text style={[styles.heroTitle, { color: colors.text }]}>
                                {role === 'customer' ? t('profile_setup') : role === 'supplier' ? t('business_identity') : t('workshop_identity')}
                            </Text>
                            <Text style={[styles.heroSubtitle, { color: colors.icon }]}>
                                {role === 'customer' ? t('tell_us_about_yourself') : t('tell_us_about_business') || 'Tell us about your business operations'}
                            </Text>
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={[styles.label, { color: colors.icon }]}>{t('full_name_label')}</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
                                placeholder={t('full_name_placeholder')}
                                placeholderTextColor={colors.icon}
                                value={formData.fullName}
                                onChangeText={t => setFormData({ ...formData, fullName: t })}
                            />
                        </View>

                        {(role === 'technician' || role === 'supplier') && (
                            <View style={styles.formGroup}>
                                <Text style={[styles.label, { color: colors.icon }]}>{role === 'technician' ? t('garage_name_label') : t('shop_business_name_label')}</Text>
                                <TextInput
                                    style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
                                    placeholder={t('business_name_placeholder')}
                                    placeholderTextColor={colors.icon}
                                    value={formData.garageName}
                                    onChangeText={t => setFormData({ ...formData, garageName: t })}
                                />
                            </View>
                        )}

                        <View style={styles.formGroup}>
                            <Text style={[styles.label, { color: colors.icon }]}>{t('address_label')}</Text>
                            <TextInput
                                style={[styles.input, { height: 80, textAlignVertical: 'top', backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
                                placeholder={t('address_placeholder')}
                                placeholderTextColor={colors.icon}
                                multiline
                                value={formData.address}
                                onChangeText={t => setFormData({ ...formData, address: t })}
                            />
                        </View>

                        {(role === 'customer' || role === 'supplier') && (
                            <View style={styles.formGroup}>
                                <Text style={[styles.label, { color: colors.icon }]}>{t('city_label')}</Text>
                                <TextInput
                                    style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
                                    placeholder={t('city_placeholder')}
                                    placeholderTextColor={colors.icon}
                                    value={formData.city}
                                    onChangeText={t => setFormData({ ...formData, city: t })}
                                />
                            </View>
                        )}

                        {role === 'technician' && (
                            <>
                                <View style={styles.formGroup}>
                                    <Text style={[styles.label, { color: colors.icon }]}>{t('service_radius_label')}: {formData.radius}KM</Text>
                                    <View style={styles.pills}>
                                        {['5', '10', '25', '50'].map(r => (
                                            <TouchableOpacity
                                                key={r}
                                                style={[styles.pill, { backgroundColor: colors.card, borderColor: colors.border }, formData.radius === r && { backgroundColor: colors.text }]}
                                                onPress={() => setFormData({ ...formData, radius: r })}
                                            >
                                                <Text style={[styles.pillText, { color: colors.text }, formData.radius === r && { color: colors.background }]}>{r}km</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </View>
                                <Text style={[styles.label, { color: colors.icon }]}>{t('vehicle_types_label')}</Text>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ flexDirection: 'row', gap: 10, paddingRight: 20 }}>
                                    {[
                                        { id: 'Bike', icon: 'motorbike' },
                                        { id: 'Car', icon: 'car-side' },
                                        { id: 'Auto', icon: 'rickshaw' },
                                        { id: 'Truck', icon: 'truck' },
                                        { id: 'Bus', icon: 'bus' },
                                        { id: 'Van', icon: 'van-passenger' },
                                        { id: 'Tractor', icon: 'tractor' },
                                        { id: 'JCB', icon: 'excavator' },
                                        { id: 'Other', icon: 'dots-horizontal' }
                                    ].map(t_type => (
                                        <TouchableOpacity
                                            key={t_type.id}
                                            style={[styles.typeCard, { width: 100, backgroundColor: colors.card, borderColor: colors.border }, formData.vehicleTypes.includes(t_type.id) && { backgroundColor: colors.text, borderColor: colors.text }]}
                                            onPress={() => toggleVehicleType(t_type.id)}
                                        >
                                            <MaterialCommunityIcons name={t_type.icon as any} size={24} color={formData.vehicleTypes.includes(t_type.id) ? colors.background : colors.text} />
                                            <Text style={[styles.typeLabel, { color: colors.text, fontSize: 11, marginTop: 4 }, formData.vehicleTypes.includes(t_type.id) && { color: colors.background }]}>{t(t_type.id.toLowerCase()) || t_type.id}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                                {formData.vehicleTypes.includes('Other') && (
                                    <View style={{ marginTop: 15 }}>
                                        <Text style={[styles.label, { color: colors.icon }]}>{t('specify_other_vehicle_label')}</Text>
                                        <TextInput
                                            style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
                                            placeholder={t('other_vehicle_placeholder')}
                                            placeholderTextColor={colors.icon}
                                            value={formData.otherVehicleType}
                                            onChangeText={t => setFormData({ ...formData, otherVehicleType: t })}
                                        />
                                    </View>
                                )}
                            </>
                        )}

                        <TouchableOpacity style={[styles.actionBtn, { marginVertical: 40, backgroundColor: colors.text }]} onPress={handleFormSubmit}>
                            <Text style={[styles.actionBtnText, { color: colors.background }]}>{role === 'customer' ? t('create_account') : t('verify_identity')}</Text>
                        </TouchableOpacity>
                    </ScrollView>
                );

            case 'docs':
                return (
                    <ScrollView contentContainerStyle={styles.scrollContent}>
                        <View style={styles.hero}>
                            <Text style={[styles.heroTitle, { color: colors.text }]}>{t('verifications')}</Text>
                            <Text style={[styles.heroSubtitle, { color: colors.icon }]}>{t('upload_proofs')}</Text>
                        </View>

                        <View style={{ gap: 15 }}>
                            {[
                                { id: 'idProof', label: t('identity_proof'), sub: t('identity_proof_desc'), icon: 'card-outline' },
                                { id: 'garagePhoto', label: t('workshop_photo'), sub: t('workshop_photo_desc'), icon: 'storefront-outline' },
                                { id: 'license', label: t('trade_license'), sub: t('trade_license_desc'), icon: 'document-text-outline' },
                            ].map(doc => (
                                <TouchableOpacity
                                    key={doc.id}
                                    style={[styles.uploadItem, { backgroundColor: colors.card, borderColor: colors.border }, formData[doc.id as keyof typeof formData] && { backgroundColor: isDark ? '#1a3322' : '#F0F9F4', borderColor: '#34C759' }]}
                                    onPress={() => {
                                        setFormData({ ...formData, [doc.id]: true });
                                        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                                    }}
                                >
                                    <View style={[styles.uploadIcon, { backgroundColor: isDark ? '#333' : '#FFF' }]}>
                                        <MaterialCommunityIcons name={doc.icon as any} size={24} color={formData[doc.id as keyof typeof formData] ? '#34C759' : colors.primary} />
                                    </View>
                                    <View style={{ flex: 1, marginLeft: 15 }}>
                                        <Text style={[styles.uploadTitle, { color: colors.text }]}>{doc.label}</Text>
                                        <Text style={[styles.uploadSub, { color: colors.icon }]}>{doc.sub}</Text>
                                    </View>
                                    <Ionicons name={formData[doc.id as keyof typeof formData] ? "checkmark-circle" : "add-circle-outline"} size={24} color={formData[doc.id as keyof typeof formData] ? "#34C759" : colors.border} />
                                </TouchableOpacity>
                            ))}
                        </View>

                        <TouchableOpacity style={[styles.actionBtn, { marginTop: 40, backgroundColor: colors.text }]} onPress={handleSubmitDocs} disabled={loading}>
                            {loading ? <ActivityIndicator color={colors.background} /> : <Text style={[styles.actionBtnText, { color: colors.background }]}>{t('confirm_submission')}</Text>}
                        </TouchableOpacity>
                    </ScrollView>
                );

            case 'success':
                return (
                    <ScrollView contentContainerStyle={[styles.scrollContent, { justifyContent: 'center', alignItems: 'center', flex: 1 }]}>
                        <View style={[styles.successCircle, { backgroundColor: role === 'customer' ? (isDark ? '#1a3322' : '#F0F9F4') : (isDark ? '#332a1a' : '#FFF9F0') }]}>
                            <MaterialCommunityIcons
                                name={role === 'customer' ? "check-decagram" : "clock-fast"}
                                size={80}
                                color={role === 'customer' ? "#34C759" : "#FF9500"}
                            />
                        </View>
                        <Text style={[styles.heroTitle, { color: colors.text, textAlign: 'center' }]}>
                            {role === 'customer' ? t('registration_success') : t('application_received')}
                        </Text>
                        <Text style={[styles.heroSubtitle, { color: colors.icon, textAlign: 'center', paddingHorizontal: 20 }]}>
                            {role === 'customer'
                                ? t('welcome_elite_network')
                                : t('review_credentials_msg')}
                        </Text>

                        {role === 'technician' && (
                            <View style={[styles.statusBadge, { backgroundColor: isDark ? '#332a1a' : '#FFF9F0' }]}>
                                <Text style={styles.statusBadgeText}>{t('pending_approval_caps')}</Text>
                            </View>
                        )}

                        <TouchableOpacity
                            style={[styles.actionBtn, { width: '100%', marginTop: 50, backgroundColor: colors.text }]}
                            onPress={() => {
                                if (role === 'customer') {
                                    router.replace('/(customer)/(tabs)');
                                } else if (role === 'technician') {
                                    router.replace('/(auth)/login');
                                } else if (role === 'supplier') {
                                    router.replace('/(auth)/login');
                                } else {
                                    router.replace('/(auth)/login');
                                }
                            }}
                        >
                            <Text style={[styles.actionBtnText, { color: colors.background }]}>
                                {role === 'customer' ? t('enter_dashboard') : t('back_to_login')}
                            </Text>
                        </TouchableOpacity>
                    </ScrollView>
                );
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={colors.background} />
            <SafeAreaView style={{ flex: 1 }}>
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                        <View style={{ flex: 1 }}>
                            {renderHeader()}
                            <Animated.View style={[
                                styles.content,
                                { opacity: fadeAnim, transform: [{ translateX: slideAnim }] }
                            ]}>
                                {renderStepContent()}
                            </Animated.View>
                        </View>
                    </TouchableWithoutFeedback>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { height: 60, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    backBtn: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    logoMini: { transform: [{ scale: 0.8 }] },
    content: { flex: 1 },
    scrollContent: { paddingHorizontal: 25, paddingBottom: 40, paddingTop: 20, flexGrow: 1 },
    hero: { marginBottom: 30 },
    heroTitle: { fontSize: 32, fontWeight: '900', letterSpacing: -1 },
    heroSubtitle: { fontSize: 16, marginTop: 8, lineHeight: 24 },
    roleGrid: { gap: 16 },
    roleCard: { borderRadius: 24, padding: 20, flexDirection: 'row', alignItems: 'center', gap: 16 },
    roleIconBg: { width: 56, height: 56, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
    roleTitle: { fontSize: 18, fontWeight: '800' },
    roleSub: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', opacity: 0.6, marginTop: 1 },
    roleDesc: { fontSize: 13, marginTop: 4, opacity: 0.7 },
    checkBadge: { width: 24, height: 24, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    badge: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, marginBottom: 12 },
    badgeText: { fontSize: 11, fontWeight: '900', letterSpacing: 1 },
    continueBtn: { height: 60, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginTop: 30, flexDirection: 'row', gap: 10 },
    continueBtnText: { fontSize: 17, fontWeight: '800' },
    inputStack: { gap: 20, marginTop: 10 },
    inputWrapper: { flexDirection: 'row', alignItems: 'center', height: 64, borderRadius: 20, borderWidth: 1 },
    prefix: { paddingHorizontal: 20, borderRightWidth: 1, justifyContent: 'center' },
    prefixText: { fontSize: 16, fontWeight: 'bold' },
    mainInput: { flex: 1, paddingHorizontal: 20, fontSize: 18, fontWeight: '600' },
    actionBtn: { height: 64, borderRadius: 20, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 15, elevation: 5 },
    actionBtnText: { fontSize: 17, fontWeight: 'bold' },
    otpRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30 },
    otpBox: { width: width * 0.18, height: 72, borderRadius: 16, textAlign: 'center', fontSize: 24, fontWeight: '900', borderWidth: 2 },
    textLink: { alignSelf: 'center', marginTop: 25 },
    textLinkText: { fontSize: 14, fontWeight: 'bold' },
    formGroup: { marginBottom: 20 },
    label: { fontSize: 11, fontWeight: '900', letterSpacing: 1.5, marginBottom: 10 },
    input: { borderRadius: 16, padding: 18, fontSize: 16, fontWeight: '600', borderWidth: 1 },
    pills: { flexDirection: 'row', gap: 10 },
    pill: { paddingVertical: 12, paddingHorizontal: 20, borderRadius: 12, borderWidth: 1 },
    pillText: { fontSize: 14, fontWeight: 'bold' },
    typeCard: { padding: 15, borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
    typeLabel: { fontSize: 13, fontWeight: 'bold' },
    uploadItem: { flexDirection: 'row', alignItems: 'center', padding: 20, borderRadius: 24, borderWidth: 1, borderStyle: 'dashed' },
    uploadIcon: { width: 52, height: 52, borderRadius: 16, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10 },
    uploadTitle: { fontSize: 15, fontWeight: 'bold' },
    uploadSub: { fontSize: 12, marginTop: 2 },
    successCircle: { width: 160, height: 160, borderRadius: 80, justifyContent: 'center', alignItems: 'center', marginBottom: 40 },
    statusBadge: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginTop: 25 },
    statusBadgeText: { color: '#FF9500', fontSize: 12, fontWeight: '900', letterSpacing: 1 },
});
