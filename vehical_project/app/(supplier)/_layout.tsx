import { Colors } from '@/constants/theme';
import { LanguageProvider } from '@/context/LanguageContext';
import { SupplierProvider, useSupplier } from '@/context/SupplierContext';
import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, useColorScheme, View } from 'react-native';

function SupplierStack() {
    const { isRegistered, isLoading } = useSupplier();
    const router = useRouter();
    const segments = useSegments();

    useEffect(() => {
        if (isLoading) return;

        const inOnboarding = (segments as string[]).includes('onboarding');

        if (!isRegistered && !inOnboarding) {
            router.replace('/(supplier)/onboarding/registration');
        } else if (isRegistered && inOnboarding) {
            router.replace('/(supplier)/(tabs)/dashboard');
        }
    }, [isRegistered, isLoading, segments]);

    const colorScheme = useColorScheme();
    const theme = colorScheme ?? 'light';
    const colors = Colors[theme];

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="onboarding/registration" options={{ headerShown: false }} />
            <Stack.Screen name="orders/[id]" options={{ headerShown: false, presentation: 'modal' }} />
        </Stack>
    );
}

export default function SupplierLayout() {
    return (
        <SupplierProvider>
            <LanguageProvider>
                <SupplierStack />
            </LanguageProvider>
        </SupplierProvider>
    );
}
