import { Colors } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { authService } from '@/services/authService';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Animated,
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

export default function ProfileSetupScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const theme = colorScheme ?? 'light';
    const colors = Colors[theme];
    const isDark = theme === 'dark';
    const { t } = useLanguage();

    const [loading, setLoading] = useState(false);
    const [locateLoading, setLocateLoading] = useState(false);
    const [formData, setFormData] = useState({
        fullName: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        zipCode: '',
    });

    const [focusedInput, setFocusedInput] = useState<string | null>(null);
    const { user, refreshUser, logout } = useAuth();

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(20)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
            Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true })
        ]).start();
    }, []);

    const handleLocateCurrentAddress = async () => {
        try {
            setLocateLoading(true);
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert(t('error'), t('location_permission_denied') || 'Permission to access location was denied');
                return;
            }

            let location = await Location.getCurrentPositionAsync({});
            const { latitude, longitude } = location.coords;

            let reverseGeocode = await Location.reverseGeocodeAsync({ latitude, longitude });
            if (reverseGeocode.length > 0) {
                const addr = reverseGeocode[0];
                setFormData(prev => ({
                    ...prev,
                    addressLine1: [addr.name, addr.streetNumber, addr.street].filter(Boolean).join(' '),
                    addressLine2: addr.subregion || addr.district || '',
                    city: addr.city || (addr as any).town || (addr as any).village || '',
                    state: addr.region || '',
                    zipCode: addr.postalCode || ''
                }));
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
        } catch (error) {
            console.error('Location Error:', error);
            Alert.alert(t('error'), t('failed_to_get_location') || 'Failed to fetch current location');
        } finally {
            setLocateLoading(false);
        }
    };

    const handleContinue = async () => {
        if (!formData.fullName || !formData.addressLine1 || !formData.city || !formData.state || !formData.zipCode) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            Alert.alert(t('error'), t('essential_details') || 'Please complete your primary details to continue.');
            return;
        }

        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        setLoading(true);
        try {
            // Construct a descriptive address for general use
            const fullAddress = `${formData.addressLine1}${formData.addressLine2 ? ', ' + formData.addressLine2 : ''}, ${formData.city}, ${formData.state} - ${formData.zipCode}`;

            await authService.updateProfile({
                ...formData,
                address: fullAddress
            });
            await refreshUser();
            // Navigation handled by AuthContext state change or manual
            if (user?.role === 'technician') {
                router.replace('/(technician)/(tabs)');
            } else if (user?.role === 'supplier') {
                router.replace('/(supplier)/(tabs)/dashboard');
            } else {
                router.replace('/(customer)/(tabs)');
            }
        } catch (e: any) {
            Alert.alert(t('error'), t('error_submit') || 'Failed to update profile. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        if (router.canGoBack()) {
            router.back();
        } else {
            logout();
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View style={{ flex: 1 }}>
                        <View style={[styles.header, { borderBottomColor: colors.border }]}>
                            <TouchableOpacity
                                onPress={handleBack}
                                style={[styles.backBtn, { backgroundColor: colors.card }]}
                            >
                                <Ionicons name="chevron-back" size={24} color={colors.text} />
                            </TouchableOpacity>
                            <Text style={[styles.headerTitle, { color: colors.text }]}>{t('create_account')}</Text>
                            <View style={{ width: 44 }} />
                        </View>

                        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                            <Animated.View style={[styles.hero, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
                                <View style={[styles.badge, { backgroundColor: colors.primary + '15' }]}>
                                    <Text style={[styles.badgeText, { color: colors.primary }]}>{t('final_step')}</Text>
                                </View>
                                <Text style={[styles.title, { color: colors.text }]}>{t('personalize_your_profile')}</Text>
                                <Text style={[styles.subtitle, { color: colors.icon }]}>{t('tell_us_about_yourself')}</Text>
                            </Animated.View>

                            <Animated.View style={[styles.form, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
                                <View style={styles.inputGroup}>
                                    <Text style={[styles.label, { color: colors.icon }]}>{t('full_name_label')}</Text>
                                    <TextInput
                                        style={[
                                            styles.input,
                                            { backgroundColor: colors.card, borderColor: focusedInput === 'fullName' ? colors.primary : colors.border, color: colors.text }
                                        ]}
                                        placeholder="Michael Smith"
                                        placeholderTextColor={colors.icon + '80'}
                                        onFocus={() => setFocusedInput('fullName')}
                                        onBlur={() => setFocusedInput(null)}
                                        value={formData.fullName}
                                        onChangeText={(text) => setFormData({ ...formData, fullName: text })}
                                    />
                                </View>

                                <TouchableOpacity
                                    activeOpacity={0.7}
                                    onPress={handleLocateCurrentAddress}
                                    disabled={locateLoading}
                                    style={[styles.locateBtn, { backgroundColor: colors.primary + '10' }]}
                                >
                                    {locateLoading ? (
                                        <ActivityIndicator size="small" color={colors.primary} />
                                    ) : (
                                        <>
                                            <MaterialCommunityIcons name="map-marker-radius" size={20} color={colors.primary} />
                                            <Text style={[styles.locateText, { color: colors.primary }]}>{t('use_current_location')}</Text>
                                        </>
                                    )}
                                </TouchableOpacity>

                                <View style={styles.inputGroup}>
                                    <Text style={[styles.label, { color: colors.icon }]}>{t('Address Line 1')}</Text>
                                    <TextInput
                                        style={[
                                            styles.input,
                                            { backgroundColor: colors.card, borderColor: focusedInput === 'addressLine1' ? colors.primary : colors.border, color: colors.text }
                                        ]}
                                        placeholder="Flat 101, Sky Heights"
                                        placeholderTextColor={colors.icon + '80'}
                                        onFocus={() => setFocusedInput('addressLine1')}
                                        onBlur={() => setFocusedInput(null)}
                                        value={formData.addressLine1}
                                        onChangeText={(text) => setFormData({ ...formData, addressLine1: text })}
                                    />
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={[styles.label, { color: colors.icon }]}>{t('Address Line 2 (Optional)')}</Text>
                                    <TextInput
                                        style={[
                                            styles.input,
                                            { backgroundColor: colors.card, borderColor: focusedInput === 'addressLine2' ? colors.primary : colors.border, color: colors.text }
                                        ]}
                                        placeholder="Downtown Area"
                                        placeholderTextColor={colors.icon + '80'}
                                        onFocus={() => setFocusedInput('addressLine2')}
                                        onBlur={() => setFocusedInput(null)}
                                        value={formData.addressLine2}
                                        onChangeText={(text) => setFormData({ ...formData, addressLine2: text })}
                                    />
                                </View>

                                <View style={{ flexDirection: 'row', gap: 15 }}>
                                    <View style={[styles.inputGroup, { flex: 1 }]}>
                                        <Text style={[styles.label, { color: colors.icon }]}>{t('city_region')}</Text>
                                        <TextInput
                                            style={[
                                                styles.input,
                                                { backgroundColor: colors.card, borderColor: focusedInput === 'city' ? colors.primary : colors.border, color: colors.text }
                                            ]}
                                            placeholder="London"
                                            placeholderTextColor={colors.icon + '80'}
                                            onFocus={() => setFocusedInput('city')}
                                            onBlur={() => setFocusedInput(null)}
                                            value={formData.city}
                                            onChangeText={(text) => setFormData({ ...formData, city: text })}
                                        />
                                    </View>
                                    <View style={[styles.inputGroup, { flex: 1 }]}>
                                        <Text style={[styles.label, { color: colors.icon }]}>{t('State')}</Text>
                                        <TextInput
                                            style={[
                                                styles.input,
                                                { backgroundColor: colors.card, borderColor: focusedInput === 'state' ? colors.primary : colors.border, color: colors.text }
                                            ]}
                                            placeholder="England"
                                            placeholderTextColor={colors.icon + '80'}
                                            onFocus={() => setFocusedInput('state')}
                                            onBlur={() => setFocusedInput(null)}
                                            value={formData.state}
                                            onChangeText={(text) => setFormData({ ...formData, state: text })}
                                        />
                                    </View>
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={[styles.label, { color: colors.icon }]}>{t('Zip Code')}</Text>
                                    <TextInput
                                        style={[
                                            styles.input,
                                            { backgroundColor: colors.card, borderColor: focusedInput === 'zipCode' ? colors.primary : colors.border, color: colors.text }
                                        ]}
                                        placeholder="EC1A 1BB"
                                        placeholderTextColor={colors.icon + '80'}
                                        onFocus={() => setFocusedInput('zipCode')}
                                        onBlur={() => setFocusedInput(null)}
                                        value={formData.zipCode}
                                        onChangeText={(text) => setFormData({ ...formData, zipCode: text })}
                                        keyboardType="numeric"
                                    />
                                </View>
                            </Animated.View>
                        </ScrollView>

                        <View style={[styles.footer, { borderTopColor: colors.border, backgroundColor: colors.background }]}>
                            <TouchableOpacity
                                activeOpacity={0.8}
                                style={[
                                    styles.button,
                                    { backgroundColor: colors.text },
                                    (!formData.fullName || !formData.addressLine1 || !formData.city || !formData.state || !formData.zipCode) && styles.buttonDisabled
                                ]}
                                onPress={handleContinue}
                                disabled={loading}
                            >
                                {loading ? (
                                    <ActivityIndicator color={colors.background} />
                                ) : (
                                    <>
                                        <Text style={[styles.buttonText, { color: colors.background }]}>{t('continue_btn')}</Text>
                                        <Ionicons name="arrow-forward" size={18} color={colors.background} />
                                    </>
                                )}
                            </TouchableOpacity>
                            <Text style={styles.termsText}>{t('terms_consent')}</Text>
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}


const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { height: 64, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20 },
    backBtn: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
    headerTitle: { fontSize: 17, fontWeight: '800' },
    scrollContent: { paddingHorizontal: 25, paddingBottom: 40, paddingTop: 10 },
    hero: { marginBottom: 35 },
    badge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, marginBottom: 12 },
    badgeText: { fontSize: 10, fontWeight: '900', letterSpacing: 1 },
    title: { fontSize: 28, fontWeight: '900', letterSpacing: -0.5 },
    subtitle: { fontSize: 15, marginTop: 10, lineHeight: 22 },
    form: { gap: 20 },
    inputGroup: { gap: 8 },
    label: { fontSize: 11, fontWeight: '900', letterSpacing: 1.5, opacity: 0.6 },
    input: {
        borderRadius: 20,
        padding: 18,
        fontSize: 16,
        fontWeight: '600',
        borderWidth: 1.5,
    },
    textArea: { height: 100, textAlignVertical: 'top' },
    footer: { padding: 25, borderTopWidth: 1 },
    button: {
        height: 64,
        borderRadius: 22,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 5,
    },
    buttonDisabled: { opacity: 0.5, shadowOpacity: 0 },
    buttonText: { fontSize: 18, fontWeight: '800' },
    termsText: { fontSize: 12, color: '#C7C7CC', textAlign: 'center', marginTop: 15 },
    locateBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        borderRadius: 15,
        borderWidth: 1,
        borderStyle: 'dashed',
        borderColor: '#007AFF50',
        gap: 8,
        marginVertical: 5
    },
    locateText: {
        fontSize: 14,
        fontWeight: '700',
    }
});
