import { Colors } from '@/constants/theme';
import { AdminProvider } from '@/context/AdminContext';
import { useAuth } from '@/context/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Stack, useRouter } from 'expo-router';
import React from 'react';
import { ActivityIndicator, View } from 'react-native';

export default function AdminLayout() {
    const { user, isLoading } = useAuth();
    const router = useRouter();
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
        <AdminProvider>
            <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
                <Stack.Screen name="(tabs)" />
            </Stack>
        </AdminProvider>
    );
}
