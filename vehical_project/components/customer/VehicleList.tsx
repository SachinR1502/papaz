import { VehicleIcon } from '@/components/ui/VehicleIcon';
import { Colors } from '@/constants/theme';
import { useCustomer } from '@/context/CustomerContext';
import { useLanguage } from '@/context/LanguageContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export const VehicleList = () => {
    const router = useRouter();
    const { vehicles } = useCustomer();
    const { t } = useLanguage();
    const colorScheme = useColorScheme();
    const theme = colorScheme ?? 'light';
    const colors = Colors[theme];
    const isDark = theme === 'dark';

    if (vehicles.length === 0) {
        return (
            <TouchableOpacity
                style={[styles.addVehiclePlaceholder, { backgroundColor: colors.card, borderColor: colors.customers }]}
                onPress={() => router.push('/(customer)/vehicle/add')}
            >
                <Ionicons name="add-circle" size={30} color={colors.customers} />
                <Text style={[styles.addVehicleMsg, { color: colors.customers }]}>{t('register_vehicle')}</Text>
            </TouchableOpacity>
        );
    }

    return (
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.fleetScroll}
        >
            {vehicles.map((v) => (
                <TouchableOpacity
                    key={v.id}
                    style={[styles.vehicleCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                    onPress={() => router.push(`/(customer)/vehicle/${v.id}`)}
                >
                    <View style={[styles.vehicleIconBg, { backgroundColor: isDark ? '#333' : '#F0F7FF' }]}>
                        <VehicleIcon
                            type={v.vehicleType}
                            make={v.make}
                            model={v.model}
                            size={20}
                            color="#007AFF"
                        />
                    </View>
                    <View>
                        <Text style={[styles.vehicleName, { color: colors.text }]}>{t(v.make)} {t(v.model)}</Text>
                        <Text style={[styles.vehicleReg, { color: colors.icon }]}>{v.registrationNumber}</Text>
                    </View>
                </TouchableOpacity>
            ))}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    addVehiclePlaceholder: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        padding: 20,
        borderRadius: 20,
        borderWidth: 1,
        borderStyle: 'dashed',
    },
    addVehicleMsg: { fontWeight: '700', fontSize: 14, fontFamily: 'NotoSans-Bold' },
    fleetScroll: { gap: 12, paddingRight: 20 },
    vehicleCard: {
        padding: 15,
        borderRadius: 20,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        borderWidth: 1,
        minWidth: 180,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 6,
        elevation: 2,
    },
    vehicleIconBg: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    vehicleName: { fontSize: 15, fontWeight: '700', fontFamily: 'NotoSans-Bold' },
    vehicleReg: { fontSize: 11, fontWeight: '500', marginTop: 1, fontFamily: 'NotoSans-Regular' },
});
