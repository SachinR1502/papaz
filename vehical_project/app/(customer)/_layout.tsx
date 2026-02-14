import { Colors } from '@/constants/theme';
import { CustomerProvider } from '@/context/CustomerContext';
import { LanguageProvider } from '@/context/LanguageContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Stack } from 'expo-router';

export default function CustomerLayout() {
    const colorScheme = useColorScheme();
    const theme = colorScheme ?? 'light';
    const colors = Colors[theme];

    return (
        <CustomerProvider>
            <LanguageProvider>
                <Stack
                    screenOptions={{
                        headerShown: false,
                        contentStyle: { backgroundColor: colors.background }
                    }}
                >
                    <Stack.Screen name="(tabs)" />
                    <Stack.Screen
                        name="vehicle/add"
                        options={{
                            presentation: 'modal',
                            headerShown: true,
                            title: 'Add Vehicle',
                            headerStyle: { backgroundColor: colors.card },
                            headerTitleStyle: { fontWeight: 'bold', fontSize: 18, color: colors.text },
                            headerTintColor: colors.text,
                            headerShadowVisible: false
                        }}
                    />
                    <Stack.Screen
                        name="booking/create"
                        options={{
                            presentation: 'card',
                            headerShown: false, // Custom header in file
                            title: 'Request Service'
                        }}
                    />
                    <Stack.Screen
                        name="booking/[id]"
                        options={{
                            headerShown: false,
                            title: 'Booking Details'
                        }}
                    />
                </Stack>
            </LanguageProvider>
        </CustomerProvider>
    );
}
