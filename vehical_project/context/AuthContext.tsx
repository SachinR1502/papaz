import { authService } from '@/services/authService';
import { commonService, PlatformSettings } from '@/services/commonService';
import { socketService } from '@/services/socket';
import * as Device from 'expo-device';
import * as Location from 'expo-location';
import * as LocalAuthentication from 'expo-local-authentication';
import { useRouter, useSegments } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Alert, Platform } from 'react-native';

type UserRole = 'customer' | 'technician' | 'supplier' | 'admin' | null;

interface UserData {
    _id: string;
    id?: string; // Mapped alias for _id
    phoneNumber: string;
    role: UserRole;
    profileCompleted: boolean;
    isRegistered?: boolean;
    fullName?: string;
    name?: string;
    avatar?: string;
    profile?: any; // To store extended profile data (Customer/Technician models)
}

interface AuthContextType {
    user: UserData | null;
    isLoading: boolean;
    settings: PlatformSettings;
    currencySymbol: string;
    login: (phoneNumber: string, role: string, isRegister?: boolean) => Promise<void>;
    verifyOtp: (phoneNumber: string, otp: string) => Promise<boolean>;
    logout: () => Promise<void>;
    authenticate: () => Promise<boolean>;
    refreshUser: () => Promise<void>;
    checkSession: () => Promise<void>;
}

const DEFAULT_SETTINGS: PlatformSettings = {
    currency: 'INR',
    serviceZones: [],
    maintenanceMode: false,
    allowRegistrations: true
};

const AuthContext = createContext<AuthContextType>({
    user: null,
    isLoading: true,
    settings: DEFAULT_SETTINGS,
    currencySymbol: '₹',
    login: async () => { },
    verifyOtp: async () => false,
    logout: async () => { },
    authenticate: async () => false,
    refreshUser: async () => { },
    checkSession: async () => { },
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<UserData | null>(null);
    const [settings, setSettings] = useState<PlatformSettings>(DEFAULT_SETTINGS);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const segments = useSegments();

    useEffect(() => {
        checkUser();
        // Settings will be fetched after user is validated
    }, []); // Run once on mount

    const fetchSettings = async () => {
        try {
            const data = await commonService.getSettings();
            setSettings(data);
        } catch (error) {
            console.error('Error fetching global settings:', error);
        }
    };

    useEffect(() => {
        // ... user logic ...
        // console.log("user", user);
    }, [user]);

    useEffect(() => {
        if (isLoading) return;

        const inAuthGroup = segments[0] === '(auth)';

        if (!user && !inAuthGroup) {
            router.replace('/(auth)/login');
        } else if (user && inAuthGroup) {
            // Check if profile is completed
            const isCompleted = user.profileCompleted;

            if (!isCompleted) {
                if (user.role === 'customer') {
                    if (segments[1] !== 'profile-setup') {
                        router.replace('/(auth)/profile-setup');
                    }
                } else if (user.role === 'technician') {
                    router.replace('/(technician)/onboarding/registration');
                } else if (user.role === 'supplier') {
                    router.replace('/(supplier)/onboarding/registration');
                }
            } else {
                navigateToRoleDashboard(user.role);
            }
        }
    }, [user, segments, isLoading]);

    const checkUser = async () => {
        try {
            let token: string | null = null;
            if (Platform.OS === 'web') {
                token = localStorage.getItem('userToken');
            } else {
                token = await SecureStore.getItemAsync('userToken');
            }

            if (token) {
                // Check if Biometrics Enabled
                const biometricsEnabled = await SecureStore.getItemAsync('biometrics_enabled');

                if (biometricsEnabled === 'true') {
                    const authSuccess = await authenticate();
                    if (!authSuccess) {
                        // If biometric failed, DO NOT log in partially.
                        setIsLoading(false);
                        return;
                    }
                }

                // Validate token by fetching user me
                const userData = await authService.getMe();
                setUser(userData);
                socketService.connect();
                socketService.register(userData._id);

                // Fetch settings only after valid session is confirmed
                fetchSettings();
                registerCurrentDevice();
            }
        } catch (e: any) {
            console.error('Failed to load user session', e);
            // If 401 (Unauthorized), the token is invalid/expired. Clear it.
            if (e.response?.status === 401) {
                await logout();
            }
        } finally {
            setIsLoading(false);
        }
    };

    const authenticate = async (): Promise<boolean> => {
        if (Platform.OS === 'web') return true;

        try {
            const hasHardware = await LocalAuthentication.hasHardwareAsync();
            if (!hasHardware) return true;

            const isEnrolled = await LocalAuthentication.isEnrolledAsync();
            if (!isEnrolled) return true;

            const result = await LocalAuthentication.authenticateAsync({
                promptMessage: 'Authenticate to continue',
                fallbackLabel: 'Use Passcode',
            });

            return result.success;
        } catch (e) {
            console.error('Auth failed', e);
            return false;
        }
    };

    // Step 1: Send OTP
    const login = async (phoneNumber: string, role: string, isRegister: boolean = false) => {
        setIsLoading(true);
        try {
            await authService.sendOtp(phoneNumber, role, isRegister);
            // The UI should handle showing the OTP input now
        } catch (e: any) {
            console.error('Login/OTP failed', e);
            Alert.alert('Error', e.response?.data?.message || 'Failed to send OTP.');
            throw e; // Rethrow so UI knows it failed
        } finally {
            setIsLoading(false);
        }
    };

    // Step 2: Verify OTP
    const verifyOtp = async (phoneNumber: string, otp: string): Promise<boolean> => {
        setIsLoading(true);
        try {
            const data = await authService.verifyOtp(phoneNumber, otp);
            const { token, ...userData } = data;

            // Save Token
            if (Platform.OS === 'web') {
                localStorage.setItem('userToken', token);
            } else {
                await SecureStore.setItemAsync('userToken', token);
            }

            setUser(userData);
            socketService.connect();
            socketService.register(userData._id);

            // Fetch settings again on login to ensure fresh data
            fetchSettings();
            registerCurrentDevice();

            // Navigation handled by useEffect
            return true;
        } catch (e: any) {
            console.error('OTP Verification failed', e);
            Alert.alert('Error', e.response?.data?.message || 'Invalid OTP.');
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const refreshUser = async () => {
        try {
            const userData = await authService.getMe();
            setUser(userData);
        } catch (e) {
            console.error("Failed to refresh user", e);
        }
    }

    const logout = async () => {
        try {
            if (Platform.OS === 'web') {
                localStorage.removeItem('userToken');
            } else {
                await SecureStore.deleteItemAsync('userToken');
            }
            setUser(null);
            socketService.disconnect();
            router.replace('/(auth)/login');
        } catch (e) {
            console.error('Logout failed', e);
        }
    };

    const registerCurrentDevice = async () => {
        try {
            if (Platform.OS === 'web') return;

            let deviceId = await SecureStore.getItemAsync('device_uuid');
            if (!deviceId) {
                deviceId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
                await SecureStore.setItemAsync('device_uuid', deviceId);
            }

            const deviceName = Device.modelName || `Unknown ${Platform.OS} Device`;

            let locationString = 'Unknown Location';
            try {
                const { status } = await Location.getForegroundPermissionsAsync();
                if (status === 'granted') {
                    const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Low });
                    if (loc) {
                        const reverse = await Location.reverseGeocodeAsync({
                            latitude: loc.coords.latitude,
                            longitude: loc.coords.longitude
                        });
                        if (reverse && reverse.length > 0) {
                            const addr = reverse[0];
                            const city = addr.city || addr.subregion || '';
                            const region = addr.region || '';
                            const country = addr.isoCountryCode || addr.country || '';

                            // Construct readable string
                            const parts = [city, region, country].filter(p => p);
                            if (parts.length > 0) {
                                locationString = parts.join(', ');
                            }
                        }
                    }
                }
            } catch (err) {
                // console.warn('Location fetch failed for device registry', err);
            }

            await authService.registerDevice({
                deviceId,
                name: deviceName,
                type: Platform.OS,
                location: locationString
            });
        } catch (e) {
            console.error('Device registration failed', e);
        }
    };

    const navigateToRoleDashboard = (role: UserRole) => {
        switch (role) {
            case 'customer':
                router.replace('/(customer)/(tabs)');
                break;
            case 'technician':
                router.replace('/(technician)/(tabs)');
                break;
            case 'supplier':
                router.replace('/(supplier)/(tabs)/dashboard');
                break;
            case 'admin':
                router.replace('/(admin)/(tabs)');
                break;
            default:
                router.replace('/(auth)/login');
        }
    };

    const currencySymbol = settings.currency === 'USD' ? '$' : '₹';

    return (
        <AuthContext.Provider value={{
            user,
            isLoading,
            settings,
            currencySymbol,
            login,
            verifyOtp,
            logout,
            authenticate,
            refreshUser,
            checkSession: checkUser
        }}>
            {children}
        </AuthContext.Provider>
    );
}
