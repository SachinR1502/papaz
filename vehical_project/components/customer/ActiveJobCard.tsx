import { StatusBadge, getStatusColor } from '@/components/ui/StatusBadge';
import { VehicleIcon } from '@/components/ui/VehicleIcon';
import { Colors } from '@/constants/theme';
import { useLanguage } from '@/context/LanguageContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ServiceRequest, Vehicle } from '@/types/models';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ActiveJobCardProps {
    job: ServiceRequest;
    vehicle: Vehicle | undefined;
}

export const ActiveJobCard = ({ job, vehicle }: ActiveJobCardProps) => {
    const router = useRouter();
    const { t } = useLanguage();
    const colorScheme = useColorScheme();
    const theme = colorScheme ?? 'light';
    const colors = Colors[theme];
    const statusColor = getStatusColor(job.status);

    const handlePress = () => {
        Haptics.selectionAsync();
        router.push({ pathname: '/(customer)/booking/[id]', params: { id: job.id } });
    };

    return (
        <TouchableOpacity
            style={[styles.jobCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={handlePress}
        >
            <View style={styles.jobCardTop}>
                <View style={[styles.jobIconBg, { backgroundColor: statusColor + '15' }]}>
                    {vehicle?.images && vehicle.images.length > 0 ? (
                        <Image source={{ uri: vehicle.images[0] }} style={styles.jobVehicleImg} />
                    ) : (
                        <VehicleIcon
                            type={vehicle?.vehicleType}
                            make={vehicle?.make}
                            model={vehicle?.model}
                            size={24}
                            color={statusColor}
                        />
                    )}
                </View>
                <View style={styles.jobIdRow}>
                    <Text style={[styles.jobVehicleName, { color: colors.text }]}>
                        {t(vehicle?.make || '')} {t(vehicle?.model || '')}
                    </Text>
                    <Text style={styles.jobIdText}>#{job.id}</Text>
                </View>
                <StatusBadge status={job.status} size="small" showIcon={false} />
            </View>
            <View style={styles.jobCardBody}>
                <Text style={[styles.jobDescription, { color: colors.text }]} numberOfLines={2}>
                    {t(job.description)}
                </Text>
            </View>
            <View style={[styles.jobCardFooter, { borderTopColor: colors.border }]}>
                <View style={styles.jobTimeGroup}>
                    <Ionicons name="time-outline" size={14} color={colors.icon} />
                    <Text style={[styles.jobTimeText, { color: colors.icon }]}>
                        {new Date(job.createdAt).toLocaleDateString()}
                    </Text>
                </View>
                <TouchableOpacity style={styles.trackBtn} onPress={handlePress}>
                    <Text style={[styles.trackBtnText, { color: colors.customers }]}>{t('live_track')}</Text>
                    <Ionicons name="chevron-forward" size={12} color={colors.customers} />
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    jobCard: {
        borderRadius: 24,
        padding: 16,
        marginBottom: 15,
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.02,
        shadowRadius: 10,
        elevation: 2,
    },
    jobCardTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    jobIconBg: { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
    jobVehicleImg: { width: '100%', height: '100%', contentFit: 'cover' },
    jobIdRow: { flex: 1 },
    jobVehicleName: { fontSize: 16, fontWeight: '700', fontFamily: 'NotoSans-Bold' },
    jobIdText: { fontSize: 11, color: '#8E8E93', fontWeight: '500', marginTop: 1, fontFamily: 'NotoSans-Regular' },
    jobCardBody: { marginVertical: 12, paddingLeft: 56 },
    jobDescription: { fontSize: 14, fontWeight: '400', lineHeight: 20, fontFamily: 'NotoSans-Regular' },
    jobCardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, paddingTop: 12, marginLeft: 56 },
    jobTimeGroup: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    jobTimeText: { fontSize: 12, fontWeight: '500', fontFamily: 'NotoSans-Regular' },
    trackBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    trackBtnText: { fontSize: 13, fontWeight: '700', color: '#007AFF', fontFamily: 'NotoSans-Bold' },
});
