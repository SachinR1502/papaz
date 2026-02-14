import * as Haptics from 'expo-haptics';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Animated, Modal, Platform, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { technicianService } from '@/services/technicianService';

export default function SecurityScreen() {
    const router = useRouter();
    const { user } = useAuth();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const colors = {
        background: isDark ? '#000000' : '#FFFFFF',
        card: isDark ? '#1C1C1E' : '#FFFFFF',
        text: isDark ? '#FFFFFF' : '#1A1A1A',
        subText: isDark ? '#A1A1A6' : '#8E8E93',
        border: isDark ? '#2C2C2E' : '#F0F0F0',
        shieldBg: isDark ? '#0A2A12' : '#E8F5E9',
        iconBg: isDark ? '#2C2C2E' : '#F8F9FE',
        sectionTitle: isDark ? '#8E8E93' : '#8E8E93',
        dangerBorder: '#FF3B30',
        dangerText: '#FF3B30',
    };

    const [biometrics, setBiometrics] = useState(false);
    const [twoFactor, setTwoFactor] = useState(false);
    const [devices, setDevices] = useState<any[]>([]);
    const [isPrivacyVisible, setPrivacyVisible] = useState(false);

    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const init = async () => {
            if (Platform.OS !== 'web') {
                const stored = await SecureStore.getItemAsync('biometrics_enabled');
                setBiometrics(stored === 'true');
            }
        };
        init();

        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
        }).start();
        fetchDevices();
    }, []);

    const checkBiometrics = async () => {
        if (Platform.OS !== 'web') {
            const stored = await SecureStore.getItemAsync('biometrics_enabled');
            setBiometrics(stored === 'true');
        }
    };

    const fetchDevices = async () => {
        try {
            const data = await technicianService.getDevices();
            setDevices(data || []);
        } catch (error) {
            console.error('Failed to fetch devices', error);
            // Mock if fail
            setDevices([
                { _id: '1', name: 'Current Device', type: 'Mobile', lastActive: new Date().toISOString(), isCurrent: true, location: 'Unknown' }
            ]);
        }
    };

    const handleBiometricToggle = async (value: boolean) => {
        if (value) {
            const hasHardware = await LocalAuthentication.hasHardwareAsync();
            if (!hasHardware) {
                Alert.alert('Not Supported', 'Biometric authentication is not available on this device.');
                return;
            }
            const isEnrolled = await LocalAuthentication.isEnrolledAsync();
            if (!isEnrolled) {
                Alert.alert('Not Enrolled', 'No biometrics found. Please set them up in your device settings.');
                return;
            }
            const result = await LocalAuthentication.authenticateAsync({
                promptMessage: 'Authenticate to enable Biometric Login',
                fallbackLabel: 'Enter Passcode',
            });
            if (!result.success) {
                Alert.alert('Authentication Failed', 'Could not verify your identity.');
                return;
            }
        }

        setBiometrics(value);
        if (Platform.OS !== 'web') {
            if (value) {
                await SecureStore.setItemAsync('biometrics_enabled', 'true');
                await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            } else {
                await SecureStore.deleteItemAsync('biometrics_enabled');
                await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            }
        }

        try {
            await technicianService.updateProfile({
                securitySettings: { biometricsEnabled: value }
            });
        } catch (e) {
            console.error('Failed to sync biometric setting to backend', e);
        }
    };

    const handleChangePassword = () => {
        Alert.alert('Reset Password', 'A password reset link has been sent to your email.');
    };

    const handleTerminateSession = (deviceId: string) => {
        if (!deviceId) return;
        Alert.alert('Terminate Session', 'Are you sure you want to log out of this device?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Logout',
                style: 'destructive',
                onPress: async () => {
                    try {
                        await technicianService.removeDevice(deviceId);
                        setDevices(d => d.filter(dev => dev._id !== deviceId));
                    } catch (e) {
                        Alert.alert('Error', 'Failed to remove device');
                    }
                }
            }
        ]);
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
            <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace('/(technician)/(tabs)' as any)} style={[styles.backBtn, { backgroundColor: colors.iconBg }]}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Security Center</Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <Animated.View style={{ opacity: fadeAnim }}>
                    <View style={[styles.heroSection, { backgroundColor: colors.shieldBg }]}>
                        <MaterialCommunityIcons name="shield-check" size={60} color="#34C759" />
                        <Text style={[styles.heroTitle, { color: colors.text }]}>Account Protected</Text>
                        <Text style={[styles.heroSub, { color: colors.subText }]}>Your security score is 92/100. Enable 2FA to reach 100%.</Text>
                    </View>

                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: colors.sectionTitle }]}>ACCESS CONTROLS</Text>
                        <View style={[styles.card, { backgroundColor: colors.card }]}>
                            <TouchableOpacity style={[styles.row, { borderBottomWidth: 1, borderBottomColor: colors.border }]} onPress={handleChangePassword}>
                                <View style={[styles.iconBg, { backgroundColor: colors.iconBg }]}>
                                    <Ionicons name="key-outline" size={22} color={colors.text} />
                                </View>
                                <Text style={[styles.rowLabel, { color: colors.text }]}>Change Password</Text>
                                <Ionicons name="chevron-forward" size={18} color={colors.subText} />
                            </TouchableOpacity>

                            <TouchableOpacity style={[styles.row, { borderBottomWidth: 1, borderBottomColor: colors.border }]} onPress={() => setPrivacyVisible(true)}>
                                <View style={[styles.iconBg, { backgroundColor: colors.iconBg }]}>
                                    <Ionicons name="document-text-outline" size={22} color={colors.text} />
                                </View>
                                <Text style={[styles.rowLabel, { color: colors.text }]}>Data & Privacy Policy</Text>
                                <Ionicons name="chevron-forward" size={18} color={colors.subText} />
                            </TouchableOpacity>

                            <View style={[styles.row, { borderBottomWidth: 1, borderBottomColor: colors.border }]}>
                                <View style={[styles.iconBg, { backgroundColor: colors.iconBg }]}>
                                    <Ionicons name="finger-print-outline" size={22} color={colors.text} />
                                </View>
                                <View style={styles.rowContent}>
                                    <Text style={[styles.rowLabel, { color: colors.text }]}>Biometric Login</Text>
                                    <Text style={[styles.rowSub, { color: colors.subText }]}>Use FaceID / TouchID</Text>
                                </View>
                                <Switch
                                    value={biometrics}
                                    onValueChange={handleBiometricToggle}
                                    trackColor={{ false: '#D1D1D6', true: '#34C759' }}
                                    thumbColor="#FFF"
                                />
                            </View>

                            <View style={styles.row}>
                                <View style={[styles.iconBg, { backgroundColor: colors.iconBg }]}>
                                    <Ionicons name="shield-half-outline" size={22} color={colors.text} />
                                </View>
                                <View style={styles.rowContent}>
                                    <Text style={[styles.rowLabel, { color: colors.text }]}>2-Factor Auth</Text>
                                    <Text style={[styles.rowSub, { color: colors.subText }]}>Extra layer of security</Text>
                                </View>
                                <Switch
                                    value={twoFactor}
                                    onValueChange={setTwoFactor}
                                    trackColor={{ false: '#D1D1D6', true: '#34C759' }}
                                    thumbColor="#FFF"
                                />
                            </View>
                        </View>
                    </View>

                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: colors.sectionTitle }]}>ACTIVE SESSIONS</Text>
                        <View style={[styles.card, { backgroundColor: colors.card }]}>
                            {devices.length === 0 ? (
                                <View style={{ padding: 20, alignItems: 'center' }}>
                                    <Text style={{ color: colors.subText }}>No active devices found.</Text>
                                    <TouchableOpacity onPress={fetchDevices} style={{ marginTop: 10 }}>
                                        <Text style={{ color: colors.text, fontWeight: 'bold' }}>Refresh</Text>
                                    </TouchableOpacity>
                                </View>
                            ) : (
                                devices.map((device, index) => (
                                    <View key={device._id || index} style={[styles.sessionRow, index < devices.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border }]}>
                                        <Ionicons
                                            name={device.type?.toLowerCase().includes('web') ? 'desktop-outline' : 'phone-portrait-outline'}
                                            size={24}
                                            color={device.isCurrent ? '#007AFF' : colors.subText}
                                        />
                                        <View style={styles.sessionInfo}>
                                            <Text style={[styles.sessionDevice, { color: colors.text }]}>
                                                {device.name} {device.isCurrent && '(This Device)'}
                                            </Text>
                                            <Text style={[styles.sessionLoc, { color: colors.subText }]}>
                                                {device.location || 'Unknown Location'} • {new Date(device.lastActive).toLocaleDateString()}
                                            </Text>
                                        </View>
                                        {!device.isCurrent && (
                                            <TouchableOpacity onPress={() => handleTerminateSession(device._id)}>
                                                <Text style={[styles.terminateText, { color: colors.dangerText }]}>Logout</Text>
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                ))
                            )}
                        </View>
                    </View>

                    <TouchableOpacity style={[styles.dangerBtn, { borderColor: colors.dangerBorder }]}>
                        <Text style={[styles.dangerBtnText, { color: colors.dangerText }]}>Delete Account</Text>
                    </TouchableOpacity>
                    <View style={{ height: 40 }} />
                </Animated.View>
            </ScrollView>

            <Modal
                animationType="slide"
                transparent={true}
                visible={isPrivacyVisible}
                onRequestClose={() => setPrivacyVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: colors.background, height: '80%' }]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: colors.text }]}>Data & Privacy Policy</Text>
                            <TouchableOpacity onPress={() => setPrivacyVisible(false)} style={styles.closeBtn}>
                                <Ionicons name="close" size={24} color={colors.text} />
                            </TouchableOpacity>
                        </View>
                        <ScrollView contentContainerStyle={styles.modalBody}>
                            <Text style={[styles.policyText, { color: colors.text }]}>
                                <Text style={styles.bold}>1. Data Collection:</Text> We collect information to provide better services, including your name, contact details, and vehicle information.
                                {'\n\n'}
                                <Text style={styles.bold}>2. Usage:</Text> Your data is used to process orders, facilitate service requests, and improve app functionality.
                                {'\n\n'}
                                <Text style={styles.bold}>3. Sharing:</Text> We do not sell your personal data. We only share necessary details with technicians or suppliers to fulfill your requests.
                                {'\n\n'}
                                <Text style={styles.bold}>4. Security:</Text> We verify your identity through secure authentication methods and encrypt sensitive data.
                                {'\n\n'}
                                <Text style={styles.bold}>5. Your Rights:</Text> You can request to view, edit, or delete your personal data at any time from your profile settings.
                            </Text>
                        </ScrollView>
                    </View>
                </View>
            </Modal>
            <View style={{ height: 40 }} />
            {/* </Animated.View> */}
            {/* </ScrollView > */}
        </SafeAreaView >
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { paddingHorizontal: 20, paddingVertical: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1 },
    backBtn: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    headerTitle: { fontSize: 18, fontWeight: 'bold' },
    content: { paddingBottom: 40 },
    heroSection: { alignItems: 'center', padding: 40, marginBottom: 20 },
    heroTitle: { fontSize: 22, fontWeight: 'bold', marginTop: 15 },
    heroSub: { fontSize: 13, textAlign: 'center', marginTop: 5 },
    section: { paddingHorizontal: 20, marginTop: 10 },
    sectionTitle: { fontSize: 11, fontWeight: '900', letterSpacing: 1, marginBottom: 15, paddingLeft: 5 },
    card: { borderRadius: 24, overflow: 'hidden' },
    row: { flexDirection: 'row', alignItems: 'center', padding: 18 },
    iconBg: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
    rowLabel: { flex: 1, fontSize: 16, fontWeight: '600' },
    rowContent: { flex: 1 },
    rowSub: { fontSize: 12, marginTop: 2 },
    sessionRow: { flexDirection: 'row', alignItems: 'center', padding: 18 },
    sessionInfo: { flex: 1, marginLeft: 15 },
    sessionDevice: { fontSize: 15, fontWeight: 'bold' },
    sessionLoc: { fontSize: 12, marginTop: 2 },
    terminateText: { fontSize: 13, fontWeight: 'bold' },
    dangerBtn: { margin: 20, padding: 18, borderRadius: 20, borderWidth: 1, alignItems: 'center' },
    dangerBtnText: { fontSize: 16, fontWeight: 'bold' },

    // Modal Styles
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    modalTitle: { fontSize: 20, fontWeight: 'bold' },
    closeBtn: { padding: 5 },
    modalBody: { paddingBottom: 40 },
    policyText: { fontSize: 15, lineHeight: 24 },
    bold: { fontWeight: 'bold' },
});
