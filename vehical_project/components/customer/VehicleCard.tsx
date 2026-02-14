import { VehicleIcon } from '@/components/ui/VehicleIcon';
import { Colors } from '@/constants/theme';
import { useLanguage } from '@/context/LanguageContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Vehicle } from '@/types/models';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface VehicleCardProps {
    vehicle: Vehicle;
}

export const VehicleCard = ({ vehicle }: VehicleCardProps) => {
    const router = useRouter();
    const { t } = useLanguage();
    const colorScheme = useColorScheme();
    const theme = colorScheme ?? 'light';
    const colors = Colors[theme];
    const isDark = theme === 'dark';

    const handleVehiclePress = () => {
        Haptics.selectionAsync();
        router.push(`/(customer)/vehicle/${vehicle.id}`);
    };

    const handleServicePress = () => {
        Haptics.selectionAsync();
        router.push({ pathname: '/(customer)/booking/create', params: { vehicleId: vehicle.id } });
    };

    const handlePartsPress = () => {
        Haptics.selectionAsync();
        router.push({ pathname: '/(customer)/(tabs)/request-product', params: { vehicle: `${vehicle.make} ${vehicle.model}` } });
    };

    return (
        <TouchableOpacity
            style={[styles.vehicleCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={handleVehiclePress}
            activeOpacity={0.8}
        >
            <View style={styles.cardHeader}>
                <View style={[styles.iconContainer, { backgroundColor: isDark ? colors.customers + '20' : '#F0F7FF' }]}>
                    <VehicleIcon
                        type={vehicle.vehicleType}
                        make={vehicle.make}
                        model={vehicle.model}
                        size={24}
                        color={colors.customers}
                    />
                </View>
                <View style={styles.vehicleInfo}>
                    <Text style={[styles.vehicleName, { color: colors.text }]}>{vehicle.make} {vehicle.model}</Text>
                    <Text style={[styles.regNumber, { color: colors.icon }]}>{vehicle.registrationNumber}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: isDark ? colors.sales + '20' : '#E8F5E9' }]}>
                    <View style={[styles.statusDot, { backgroundColor: colors.sales }]} />
                    <Text style={[styles.statusText, { color: colors.sales }]}>{t('healthy')}</Text>
                </View>
            </View>

            <View style={[styles.cardFooter, { borderTopColor: colors.border }]}>
                <TouchableOpacity style={styles.actionBtn} onPress={handleServicePress}>
                    <Ionicons name="construct" size={16} color={colors.customers} />
                    <Text style={[styles.actionText, { color: colors.customers }]}>{t('repair')}</Text>
                </TouchableOpacity>
                <View style={[styles.divider, { backgroundColor: colors.border }]} />
                <TouchableOpacity style={styles.actionBtn} onPress={handlePartsPress}>
                    <Ionicons name="cart-outline" size={16} color={colors.primary} />
                    <Text style={[styles.actionText, { color: colors.primary }]}>{t('parts')}</Text>
                </TouchableOpacity>
                <View style={[styles.divider, { backgroundColor: colors.border }]} />
                <TouchableOpacity style={styles.actionBtn} onPress={handleVehiclePress}>
                    <Ionicons name="qr-code" size={16} color={colors.text} />
                    <Text style={[styles.actionText, { color: colors.text }]}>{t('digital_id')}</Text>
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    vehicleCard: {
        borderRadius: 28,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.03,
        shadowRadius: 10,
        elevation: 2
    },
    cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 15, marginBottom: 20 },
    iconContainer: { width: 52, height: 52, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
    vehicleInfo: { flex: 1 },
    vehicleName: { fontSize: 18, fontFamily: 'NotoSans-Bold' },
    regNumber: { fontSize: 13, marginTop: 2, fontFamily: 'NotoSans-Regular' },
    statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
    statusDot: { width: 6, height: 6, borderRadius: 3 },
    statusText: { fontSize: 11, fontFamily: 'NotoSans-Bold' },
    cardFooter: { flexDirection: 'row', borderTopWidth: 1, paddingTop: 15, alignItems: 'center' },
    actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
    actionText: { fontSize: 13, fontFamily: 'NotoSans-Bold' },
    divider: { width: 1, height: 20 },
});
