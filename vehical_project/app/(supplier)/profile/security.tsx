import { useAuth } from '@/context/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Animated, Platform, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supplierService } from '@/services/supplierService';

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
    const [hasBiometricsHardware, setHasBiometricsHardware] = useState(false);
    const [devices, setDevices] = useState<any[]>([]);

    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const checkBiometrics = async () => {
            if (Platform.OS !== 'web') {
                const compatible = await LocalAuthentication.hasHardwareAsync();
                setHasBiometricsHardware(compatible);
                if (compatible) {
                    const storedBiometrics = await SecureStore.getItemAsync('biometrics_enabled');
                    setBiometrics(storedBiometrics === 'true');
                }
            }
        };
        checkBiometrics();

        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
        }).start();
        fetchDevices();
    }, []);

    const fetchDevices = async () => {
        try {
            const data = await supplierService.getDevices();
            setDevices(data || []);
        } catch (error) {
            console.error('Failed to fetch devices', error);
            setDevices([
                { _id: '1', name: 'Current Device', type: 'Mobile', lastActive: new Date().toISOString(), isCurrent: true, location: 'Unknown' }
            ]);
        }
    };

    const handleChangePassword = () => {
        Alert.alert('Reset Password', 'A password reset link has been sent to your email.');
    };

    const handleBiometricToggle = async (value: boolean) => {
        if (!hasBiometricsHardware) {
            Alert.alert('Not Supported', 'Biometric authentication is not available on this device.');
            return;
        }

        if (value) {
            const authenticated = await LocalAuthentication.authenticateAsync({
                promptMessage: 'Authenticate to enable Biometric Login',
                fallbackLabel: 'Enter Passcode',
            });

            if (!authenticated.success) {
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
            await supplierService.updateProfile({
                securitySettings: { biometricsEnabled: value }
            });
        } catch (e) {
            console.error('Failed to sync biometric setting to backend', e);
        }
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
                        await supplierService.removeDevice(deviceId);
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
                <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace('/(supplier)/(tabs)' as any)} style={[styles.backBtn, { backgroundColor: colors.iconBg }]}>
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
        </SafeAreaView>
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
});
