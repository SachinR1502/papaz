import { LanguageProvider } from '@/context/LanguageContext';
import { TechnicianProvider, useTechnician } from '@/context/TechnicianContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';

function TechnicianStack() {
    const { isApproved, isRegistered, isLoading } = useTechnician();
    const router = useRouter();
    const segments = useSegments();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    useEffect(() => {
        if (isLoading) return;

        // Helper boolean flags
        const inOnboarding = segments.some(s => s === 'onboarding');
        const inRegistration = segments.some(s => s === 'registration');
        const inStatus = segments.some(s => s === 'status');

        if (!isRegistered) {
            // If not registered, force registration screen
            // But allow doc uploads if that's part of registration flow (if applicable)
            // For now, simple check: if not in registration, go there.
            if (!inRegistration) {
                router.replace('/(technician)/onboarding/registration');
            }
        } else if (!isApproved) {
            // Registered but awaiting approval
            if (!inStatus) {
                router.replace('/(technician)/onboarding/status');
            }
        } else {
            // Approved
            // Should not be in onboarding screens
            if (inOnboarding) {
                router.replace('/(technician)/(tabs)');
            }
        }
    }, [isApproved, isRegistered, isLoading, segments]);

    const bg = isDark ? '#000000' : '#F8F9FB';

    if (isLoading && !isRegistered) { // Use !isRegistered (which implies !profile) to keep showing loader until we know who the user is
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: bg }}>
                <ActivityIndicator size="large" color="#007AFF" />
            </View>
        );
    }

    return (
        <Stack
            screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: bg },
                animation: 'slide_from_right',
            }}
        >
            <Stack.Screen name="(tabs)" options={{ gestureEnabled: false }} />
            <Stack.Screen name="job/[id]/index" options={{ presentation: 'card', headerShown: false }} />
            <Stack.Screen name="job/[id]/quote" options={{ presentation: 'modal', headerShown: true, title: 'Final Billing', headerStyle: { backgroundColor: isDark ? '#1C1C1E' : '#FFF' }, headerTintColor: isDark ? '#FFF' : '#000' }} />
            <Stack.Screen name="profile/docs" options={{ headerShown: false, presentation: 'card' }} />
            <Stack.Screen name="profile/payouts" options={{ headerShown: false, presentation: 'card' }} />
            <Stack.Screen name="profile/history" options={{ headerShown: false, presentation: 'card' }} />
            <Stack.Screen name="profile/support" options={{ headerShown: false, presentation: 'card' }} />
            <Stack.Screen name="profile/profile_info" options={{ headerShown: false, presentation: 'card' }} />
            <Stack.Screen name="profile/inventory" options={{ headerShown: false, presentation: 'card' }} />
            <Stack.Screen name="profile/notifications" options={{ headerShown: false, presentation: 'card' }} />
            <Stack.Screen name="profile/security" options={{ headerShown: false, presentation: 'card' }} />
            <Stack.Screen name="profile/settings" options={{ headerShown: false, presentation: 'card' }} />
            <Stack.Screen name="profile/legal" options={{ headerShown: false, presentation: 'card' }} />
            <Stack.Screen name="onboarding/registration" options={{ headerShown: false, presentation: 'card', gestureEnabled: false }} />
            <Stack.Screen name="onboarding/docs" options={{ headerShown: false, presentation: 'card' }} />
            <Stack.Screen name="onboarding/status" options={{ headerShown: false, presentation: 'card', gestureEnabled: false }} />
            <Stack.Screen name="scan/index" options={{ headerShown: false, presentation: 'card' }} />
            <Stack.Screen name="parts/request" options={{ headerShown: false, presentation: 'card' }} />
            <Stack.Screen name="vehicle/[id]/history" options={{ headerShown: false, presentation: 'card' }} />
        </Stack>
    );
}

export default function TechnicianLayout() {
    return (
        <TechnicianProvider>
            <LanguageProvider>
                <TechnicianStack />
            </LanguageProvider>
        </TechnicianProvider>
    );
}
