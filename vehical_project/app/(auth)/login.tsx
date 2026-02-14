import { Colors } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Animated,
    Dimensions,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

// Responsive helpers
const isSmallDevice = width < 375;
const isTablet = width >= 768;
const scale = (size: number) => (width / 375) * size;
const verticalScale = (size: number) => (height / 812) * size;
const moderateScale = (size: number, factor = 0.5) => size + (scale(size) - size) * factor;

type Role = 'customer' | 'technician' | 'supplier' | 'admin';

export default function LoginScreen() {
    const router = useRouter();
    const { login, verifyOtp, isLoading, checkSession } = useAuth();
    const { t } = useLanguage();
    const colorScheme = useColorScheme();
    const theme = colorScheme ?? 'light';
    const colors = Colors[theme];
    const isDark = theme === 'dark';

    const [step, setStep] = useState<'phone' | 'otp'>('phone');
    const [role, setRole] = useState<Role>('customer');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [otp, setOtp] = useState(['', '', '', '']);
    const [localLoading, setLocalLoading] = useState(false);
    const [biometricsAvailable, setBiometricsAvailable] = useState(false);

    useEffect(() => {
        const checkBio = async () => {
            if (Platform.OS !== 'web') {
                const enabled = await SecureStore.getItemAsync('biometrics_enabled');
                if (enabled === 'true') setBiometricsAvailable(true);
            }
        };
        checkBio();
    }, []);

    const handleBiometricLogin = async () => {
        try {
            const hasHardware = await LocalAuthentication.hasHardwareAsync();
            if (!hasHardware) {
                Alert.alert('Not Supported', 'Biometric authentication is not supported on this device.');
                return;
            }

            const isEnrolled = await LocalAuthentication.isEnrolledAsync();
            if (!isEnrolled) {
                Alert.alert('Not Enrolled', 'No biometrics found. Please set them up in your device settings.');
                return;
            }

            const result = await LocalAuthentication.authenticateAsync({
                promptMessage: 'Login with Biometrics',
                fallbackLabel: 'Enter Passcode',
            });

            if (result.success) {
                await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                await checkSession();
            }
        } catch (error) {
            console.error('Biometric login error:', error);
            Alert.alert('Error', 'An unexpected error occurred during biometric login.');
        }
    };

    const fadeAnim = useRef(new Animated.Value(1)).current;
    const slideAnim = useRef(new Animated.Value(0)).current;

    // Background animation refs
    const blob1Anim = useRef(new Animated.Value(0)).current;
    const blob2Anim = useRef(new Animated.Value(0)).current;

    const otpInputs = useRef<(TextInput | null)[]>([]);

    useEffect(() => {
        // Subtle breathing animation for background blobs
        Animated.loop(
            Animated.parallel([
                Animated.sequence([
                    Animated.timing(blob1Anim, { toValue: 1, duration: 4000, useNativeDriver: true }),
                    Animated.timing(blob1Anim, { toValue: 0, duration: 4000, useNativeDriver: true }),
                ]),
                Animated.sequence([
                    Animated.timing(blob2Anim, { toValue: 1, duration: 5000, useNativeDriver: true }),
                    Animated.timing(blob2Anim, { toValue: 0, duration: 5000, useNativeDriver: true }),
                ])
            ])
        ).start();
    }, []);

    const animateTransition = (nextStep: typeof step) => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
            Animated.timing(slideAnim, { toValue: -20, duration: 200, useNativeDriver: true })
        ]).start(() => {
            setStep(nextStep);
            slideAnim.setValue(20);
            Animated.parallel([
                Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
                Animated.timing(slideAnim, { toValue: 0, duration: 200, useNativeDriver: true })
            ]).start();
        });
    };

    const handleSendOTP = async () => {
        if (phoneNumber.length < 10) {
            Alert.alert('Invalid Number', 'Please enter a valid 10-digit phone number.');
            return;
        }
        console.log(`[LOGIN] Attempting login. Number: ${phoneNumber}, Role: ${role}`);
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

        try {
            setLocalLoading(true);
            // Login flow (isRegister = false)
            await login(phoneNumber, role, false);

            // If successful, move to next step
            animateTransition('otp');
        } catch (e: any) {
            if (e.response?.status === 404) {
                Alert.alert(
                    t('account_not_found'),
                    t('number_not_registered'),
                    [
                        {
                            text: 'OK',
                            onPress: () => router.push({ pathname: '/(auth)/register', params: { role, mobile: phoneNumber } })
                        }
                    ]
                );
            } else {
                Alert.alert(t('error'), e.response?.data?.message || t('error_submit'));
            }
        } finally {
            setLocalLoading(false);
        }
    };

    const handleVerifyOTP = async () => {
        const enteredOtp = otp.join('');
        if (enteredOtp.length !== 4) {
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            Alert.alert(t('error'), t('incomplete_otp') || 'Please enter the 4-digit code.');
            return;
        }

        const success = await verifyOtp(phoneNumber, enteredOtp);
        if (success) {
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            // Navigation is handled in AuthContext listener
        } else {
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        }
    };

    const handleOtpChange = (value: string, index: number) => {
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);
        if (value && index < 3) {
            otpInputs.current[index + 1]?.focus();
        }
    };

    const handleOtpKeyPress = (e: any, index: number) => {
        if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
            otpInputs.current[index - 1]?.focus();
        }
    };

    const handleRoleChange = (newRole: Role) => {
        Haptics.selectionAsync();
        setRole(newRole);
    }

    const handleQuickLogin = async (number: string, r: Role) => {
        Haptics.selectionAsync();
        setPhoneNumber(number);
        setRole(r);

        if (number.length < 10) {
            Alert.alert(t('error'), t('invalid_number') || 'Please enter a valid 10-digit phone number.');
            return;
        }

        try {
            setLocalLoading(true);
            await login(number, r, false);
            animateTransition('otp');
        } catch (e: any) {
            if (e.response?.status === 404) {
                Alert.alert(
                    t('account_not_found'),
                    t('number_not_registered'),
                    [
                        {
                            text: 'OK',
                            onPress: () => router.push({ pathname: '/(auth)/register', params: { role: r, mobile: number } })
                        }
                    ]
                );
            } else {
                Alert.alert(t('error'), e.response?.data?.message || t('error_submit'));
            }
        } finally {
            setLocalLoading(false);
        }
    }

    const QuickActionBtn = ({ r, number, label, icon, color, bgColor }: any) => (
        <TouchableOpacity
            style={[styles.quickBtn, { backgroundColor: isDark ? colors.card : bgColor, borderColor: isDark ? colors.border : 'transparent', borderWidth: isDark ? 1 : 0 }]}
            onPress={() => handleQuickLogin(number, r)}
        >
            <MaterialCommunityIcons name={icon} size={16} color={color} />
            <Text style={[styles.quickBtnText, { color: color }]}>{label}</Text>
        </TouchableOpacity>
    );

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={colors.background} />

            {/* Background Atmosphere */}
            <View style={StyleSheet.absoluteFill} pointerEvents="none">
                <Animated.View style={[
                    styles.blob,
                    {
                        backgroundColor: colors.primary,
                        opacity: 0.1,
                        top: -100,
                        right: -100,
                        transform: [
                            { scale: blob1Anim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.2] }) },
                        ]
                    }
                ]} />
                <Animated.View style={[
                    styles.blob,
                    {
                        backgroundColor: colors.secondary,
                        opacity: 0.08,
                        bottom: -150,
                        left: -100,
                        width: 400,
                        height: 400,
                        transform: [
                            { scale: blob2Anim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.1] }) },
                        ]
                    }
                ]} />
            </View>

            <SafeAreaView style={{ flex: 1 }}>
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                        <View style={styles.content}>
                            {/* Hero Section */}
                            <View style={styles.hero}>
                                <View style={[styles.logoCircle, { backgroundColor: colors.card, shadowColor: colors.primary }]}>
                                    <MaterialCommunityIcons name="shield-car" size={moderateScale(60)} color={colors.primary} />
                                </View>
                                <Text style={[styles.brandTitle, { color: colors.text }]}>PAPAZ</Text>
                                <Text style={[styles.brandSubtitle, { color: colors.icon }]}>Premium Vehicle Network</Text>
                            </View>

                            <Animated.View style={[
                                styles.card,
                                {
                                    backgroundColor: colors.card,
                                    shadowColor: isDark ? '#000' : colors.primary,
                                    opacity: fadeAnim,
                                    transform: [{ translateX: slideAnim }]
                                }
                            ]}>
                                <Text style={[styles.stepTitle, { color: colors.text }]}>
                                    {step === 'phone' ? t('get_started') : t('verification')}
                                </Text>
                                <Text style={[styles.stepSubtitle, { color: colors.icon }]}>
                                    {step === 'phone'
                                        ? t('auth_subtitle_phone')
                                        : `${t('auth_subtitle_otp')} as a ${role.toUpperCase()}`}
                                </Text>

                                {step === 'phone' && (
                                    <View style={[styles.roleToggleContainer, { backgroundColor: colors.background }]}>
                                        {(['customer', 'technician', 'supplier', 'admin'] as Role[]).map((r) => (
                                            <TouchableOpacity
                                                key={r}
                                                style={[
                                                    styles.roleOption,
                                                    role === r && styles.roleOptionActive,
                                                    role === r && { backgroundColor: isDark ? colors.border : '#FFFFFF' }
                                                ]}
                                                onPress={() => handleRoleChange(r)}
                                            >
                                                <Text style={[
                                                    styles.roleOptionText,
                                                    { color: role === r ? colors.primary : colors.icon }
                                                ]}>
                                                    {r === 'technician' ? t('partner') : t(r).toUpperCase()}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                )}

                                {step === 'phone' ? (
                                    <View style={styles.form}>
                                        <View style={[styles.inputWrapper, { backgroundColor: colors.inputBg, borderColor: isDark ? colors.border : 'transparent' }]}>
                                            <View style={[styles.prefixBox, { borderColor: colors.border }]}>
                                                <Text style={[styles.prefixText, { color: colors.text }]}>+91</Text>
                                            </View>
                                            <TextInput
                                                style={[styles.textInput, { color: colors.text }]}
                                                placeholder={t('mobile_number')}
                                                placeholderTextColor={colors.placeHolder}
                                                keyboardType="number-pad"
                                                maxLength={10}
                                                value={phoneNumber}
                                                onChangeText={setPhoneNumber}
                                            />
                                        </View>

                                        <TouchableOpacity
                                            activeOpacity={0.8}
                                            disabled={localLoading || phoneNumber.length < 10}
                                            onPress={handleSendOTP}
                                        >
                                            <LinearGradient
                                                colors={[colors.primary, '#FF8C00']} // Slight gradient variation
                                                start={{ x: 0, y: 0 }}
                                                end={{ x: 1, y: 0 }}
                                                style={[
                                                    styles.mainBtn,
                                                    (!phoneNumber || phoneNumber.length < 10) && { opacity: 0.5 }
                                                ]}
                                            >
                                                {localLoading ? (
                                                    <ActivityIndicator color="#FFF" />
                                                ) : (
                                                    <>
                                                        <Text style={styles.btnText}>{t('send_otp')}</Text>
                                                        <Ionicons name="arrow-forward" size={20} color="#FFF" />
                                                    </>
                                                )}
                                            </LinearGradient>
                                        </TouchableOpacity>

                                        {biometricsAvailable && (
                                            <TouchableOpacity
                                                onPress={handleBiometricLogin}
                                                style={{
                                                    marginTop: 15,
                                                    padding: 15,
                                                    borderRadius: 16,
                                                    backgroundColor: colors.inputBg,
                                                    flexDirection: 'row',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: 10
                                                }}
                                            >
                                                <MaterialCommunityIcons name="face-recognition" size={24} color={colors.primary} />
                                                <Text style={{ fontFamily: 'NotoSans-Bold', fontSize: 16, color: colors.primary }}>
                                                    {t('login_with_biometrics') || 'Login with Biometrics'}
                                                </Text>
                                            </TouchableOpacity>
                                        )}

                                        {/* Quick Access - Development Only */}
                                        {__DEV__ && (
                                            <>
                                                <View style={styles.divider}>
                                                    <View style={[styles.line, { backgroundColor: colors.border }]} />
                                                    <Text style={[styles.dividerText, { color: colors.icon }]}>{t('quick_access')} (DEV)</Text>
                                                    <View style={[styles.line, { backgroundColor: colors.border }]} />
                                                </View>

                                                <View style={styles.quickActions}>
                                                    <QuickActionBtn r="customer" number="9876543210" label={t('customer')} icon="account" color="#007AFF" bgColor="#F0F7FF" />
                                                    <QuickActionBtn r="technician" number="8888888888" label={t('partner')} icon="cog" color="#34C759" bgColor="#F0FFF4" />
                                                    <QuickActionBtn r="supplier" number="9900880077" label={t('supplier')} icon="truck-delivery" color="#FF9500" bgColor="#FFF5F0" />
                                                    <QuickActionBtn r="admin" number="1234567890" label={t('admin_hub')} icon="shield-account" color="#5856D6" bgColor="#F5F2FF" />
                                                </View>
                                            </>
                                        )}
                                    </View>
                                ) : (
                                    <View style={styles.form}>
                                        <View style={styles.otpRow}>
                                            {otp.map((digit, index) => (
                                                <TextInput
                                                    key={index}
                                                    ref={(ref) => { if (ref) otpInputs.current[index] = ref; }}
                                                    style={[
                                                        styles.otpBox,
                                                        {
                                                            backgroundColor: colors.inputBg,
                                                            borderColor: digit ? colors.primary : (isDark ? colors.border : 'transparent'),
                                                            color: colors.text
                                                        }
                                                    ]}
                                                    keyboardType="number-pad"
                                                    maxLength={1}
                                                    value={digit}
                                                    onChangeText={(val) => handleOtpChange(val, index)}
                                                    onKeyPress={(e) => handleOtpKeyPress(e, index)}
                                                />
                                            ))}
                                        </View>

                                        <TouchableOpacity
                                            activeOpacity={0.8}
                                            disabled={isLoading}
                                            onPress={handleVerifyOTP}
                                        >
                                            <LinearGradient
                                                colors={[colors.primary, '#FF8C00']}
                                                start={{ x: 0, y: 0 }}
                                                end={{ x: 1, y: 0 }}
                                                style={styles.mainBtn}
                                            >
                                                {isLoading ? (
                                                    <ActivityIndicator color="#FFF" />
                                                ) : (
                                                    <Text style={styles.btnText}>{t('verify_login')}</Text>
                                                )}
                                            </LinearGradient>
                                        </TouchableOpacity>

                                        <TouchableOpacity onPress={() => setStep('phone')} style={styles.backBtn}>
                                            <Text style={[styles.backBtnText, { color: colors.primary }]}>{t('edit_phone')}</Text>
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </Animated.View>

                            <View style={styles.footer}>
                                <Text style={[styles.footerText, { color: colors.icon }]}>{t('new_to_app')}</Text>
                                <TouchableOpacity onPress={() => router.push({ pathname: '/(auth)/register', params: { role: role === 'admin' ? 'customer' : role } })}>
                                    <Text style={[styles.footerLink, { color: colors.text }]}>
                                        {role === 'customer' ? t('create_customer_acc') : t('join_as_partner')}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    blob: {
        position: 'absolute',
        width: scale(300),
        height: scale(300),
        borderRadius: 999,
    },
    content: {
        flex: 1,
        paddingHorizontal: isTablet ? 60 : isSmallDevice ? 20 : 30,
        justifyContent: 'center',
        maxWidth: isTablet ? 600 : '100%',
        alignSelf: 'center',
        width: '100%'
    },
    hero: {
        alignItems: 'center',
        marginBottom: verticalScale(40)
    },
    logoCircle: {
        width: moderateScale(100),
        height: moderateScale(100),
        borderRadius: moderateScale(50),
        justifyContent: 'center',
        alignItems: 'center',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 5,
        marginBottom: verticalScale(20)
    },
    brandTitle: {
        fontSize: moderateScale(32),
        fontFamily: 'NotoSans-Black',
        letterSpacing: -1
    },
    brandSubtitle: {
        fontSize: moderateScale(13),
        fontFamily: 'NotoSans-Bold',
        textTransform: 'uppercase',
        letterSpacing: 2,
        marginTop: verticalScale(4)
    },

    card: {
        borderRadius: moderateScale(32),
        padding: isTablet ? 40 : isSmallDevice ? 20 : 30,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 15,
        elevation: 2
    },
    stepTitle: {
        fontSize: moderateScale(24),
        fontFamily: 'NotoSans-Bold'
    },
    stepSubtitle: {
        fontSize: moderateScale(14),
        marginTop: verticalScale(10),
        lineHeight: moderateScale(22),
        fontFamily: 'NotoSans-Regular'
    },
    form: { marginTop: verticalScale(30) },

    inputWrapper: {
        flexDirection: 'row',
        borderRadius: moderateScale(20),
        height: moderateScale(64),
        alignItems: 'center',
        borderWidth: 1,
    },
    prefixBox: {
        paddingHorizontal: scale(20),
        borderRightWidth: 1,
        justifyContent: 'center'
    },
    prefixText: {
        fontSize: moderateScale(16),
        fontFamily: 'NotoSans-Bold'
    },
    textInput: {
        flex: 1,
        height: '100%',
        paddingHorizontal: scale(20),
        fontSize: moderateScale(18),
        fontFamily: 'NotoSans-SemiBold'
    },

    mainBtn: {
        height: moderateScale(64),
        borderRadius: moderateScale(20),
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: verticalScale(20),
        gap: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 20,
        elevation: 5
    },
    btnText: {
        color: '#FFF',
        fontSize: moderateScale(17),
        fontFamily: 'NotoSans-Bold'
    },

    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: verticalScale(30)
    },
    line: { flex: 1, height: 1 },
    dividerText: {
        marginHorizontal: scale(15),
        fontSize: moderateScale(10),
        fontFamily: 'NotoSans-Black',
        letterSpacing: 1
    },

    quickActions: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: scale(10),
        justifyContent: 'space-between'
    },
    quickBtn: {
        width: isTablet ? '23%' : '48%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        height: moderateScale(48),
        borderRadius: moderateScale(14)
    },
    quickBtnText: {
        fontSize: moderateScale(13),
        fontFamily: 'NotoSans-Bold'
    },

    otpRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: verticalScale(30)
    },
    otpBox: {
        width: isSmallDevice ? scale(50) : moderateScale(60),
        height: isSmallDevice ? scale(56) : moderateScale(64),
        borderRadius: moderateScale(16),
        textAlign: 'center',
        fontSize: moderateScale(24),
        fontFamily: 'NotoSans-Black',
        borderWidth: 2
    },

    backBtn: {
        marginTop: verticalScale(25),
        alignItems: 'center'
    },
    backBtnText: {
        fontSize: moderateScale(14),
        fontFamily: 'NotoSans-Bold'
    },

    footer: {
        marginTop: verticalScale(40),
        alignItems: 'center'
    },
    footerText: {
        fontSize: moderateScale(14),
        fontFamily: 'NotoSans-Regular'
    },
    footerLink: {
        fontSize: moderateScale(14),
        fontFamily: 'NotoSans-Bold',
        marginTop: verticalScale(8)
    },

    roleToggleContainer: {
        flexDirection: 'row',
        borderRadius: moderateScale(12),
        padding: scale(4),
        marginBottom: verticalScale(25)
    },
    roleOption: {
        flex: 1,
        paddingVertical: verticalScale(10),
        alignItems: 'center',
        borderRadius: moderateScale(10)
    },
    roleOptionActive: {
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2
    },
    roleOptionText: {
        fontSize: isSmallDevice ? moderateScale(9) : moderateScale(11),
        fontFamily: 'NotoSans-Black',
        letterSpacing: 1
    },
});
