import { useLanguage } from '@/context/LanguageContext';
import { useTechnician } from '@/context/TechnicianContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { technicianService } from '@/services/technicianService';
import { getMediaUrl } from '@/utils/mediaHelpers';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Image as ExpoImage } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export default function VehicleDetailsScreen() {
    const { id, vehicleId } = useLocalSearchParams<{ id: string; vehicleId: string }>();
    const router = useRouter();
    const { availableJobs, myJobs } = useTechnician();
    const { t } = useLanguage();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const colors = {
        background: isDark ? '#000000' : '#FFFFFF',
        card: isDark ? '#1C1C1E' : '#FFFFFF',
        text: isDark ? '#FFFFFF' : '#1A1A1A',
        subText: isDark ? '#8E8E93' : '#666666',
        border: isDark ? '#2C2C2E' : '#F5F5F7',
        primary: '#FF6B00',
        iconBg: isDark ? '#2C2C2E' : '#F2F2F7',
    };

    const [vehicleData, setVehicleData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const contextJob = [...availableJobs, ...myJobs].find((j) => j.id === id);

    useEffect(() => {
        const loadVehicleDetails = async () => {
            setLoading(true);
            try {
                // Priority 1: Use Context Data if complete
                if (
                    contextJob?.vehicle &&
                    typeof contextJob.vehicle === 'object' &&
                    !('length' in contextJob.vehicle) &&
                    ('make' in contextJob.vehicle || 'model' in contextJob.vehicle)
                ) {
                    console.log('[VehicleDetails] Using context vehicle data');
                    setVehicleData(contextJob.vehicle);
                    setLoading(false);
                    return;
                }

                // Priority 2: Fetch Job from API (most reliable for fresh data)
                if (id) {
                    const job = await technicianService.getJob(id);
                    if (job?.vehicle && typeof job.vehicle === 'object') {
                        console.log('[VehicleDetails] Fetched vehicle via Job API');
                        setVehicleData(job.vehicle);
                        setLoading(false);
                        return;
                    }
                }

                // Priority 3: Fetch Vehicle History (returns vehicle object)
                if (vehicleId) {
                    console.log('[VehicleDetails] Fetching vehicle via History API');
                    const historyData = await technicianService.getVehicleHistory(vehicleId);
                    if (historyData?.vehicle) {
                        setVehicleData(historyData.vehicle);
                        setLoading(false);
                        return;
                    }
                }
            } catch (error) {
                console.error('Failed to load vehicle details', error);
            } finally {
                setLoading(false);
            }
        };

        loadVehicleDetails();
    }, [id, vehicleId, contextJob]);

    if (loading) {
        return (
            <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    if (!vehicleData) {
        return (
            <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
                <Text style={{ color: colors.subText }}>{t('Vehicle details not available')}</Text>
                <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 20 }}>
                    <Text style={{ color: colors.primary }}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const MetaItem = ({ icon, label, value, fullWidth = false }: { icon: any; label: string; value: string; fullWidth?: boolean }) => (
        <View style={[styles.metaItem, { width: fullWidth ? '100%' : '48%', backgroundColor: isDark ? '#2C2C2E' : '#F8F9FE' }]}>
            <View style={styles.metaIcon}>
                <Ionicons name={icon} size={18} color={colors.primary} />
            </View>
            <View>
                <Text style={[styles.metaLabel, { color: colors.subText }]}>{label}</Text>
                <Text style={[styles.metaValue, { color: colors.text }]} numberOfLines={1}>
                    {value || 'N/A'}
                </Text>
            </View>
        </View>
    );

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

            {/* Header */}
            <BlurView intensity={Platform.OS === 'ios' ? 80 : 0} tint={isDark ? 'dark' : 'light'} style={styles.header}>
                <SafeAreaView edges={['top']}>
                    <View style={styles.headerContent}>
                        <TouchableOpacity onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: colors.iconBg }]}>
                            <Ionicons name="arrow-back" size={24} color={colors.text} />
                        </TouchableOpacity>
                        <Text style={[styles.headerTitle, { color: colors.text }]}>{t('vehicle_details')}</Text>
                        <View style={{ width: 40 }} />
                    </View>
                </SafeAreaView>
            </BlurView>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Hero Image */}
                <Animated.View entering={FadeInDown.springify()} style={styles.heroSection}>
                    {vehicleData.images && vehicleData.images.length > 0 ? (
                        <ExpoImage
                            source={{ uri: getMediaUrl(vehicleData.images[0]) || '' }}
                            style={styles.heroImage}
                            contentFit="cover"
                        />
                    ) : (
                        <View style={[styles.placeholderImage, { backgroundColor: colors.iconBg }]}>
                            <Ionicons name="car-sport" size={60} color={colors.subText} />
                        </View>
                    )}
                    <View style={styles.overlay}>
                        <Text style={styles.brandName}>{vehicleData.make}</Text>
                        <Text style={styles.modelName}>{vehicleData.model}</Text>
                    </View>
                </Animated.View>

                {/* Main Info */}
                <Animated.View entering={FadeInDown.delay(100).springify()} style={[styles.section, { backgroundColor: colors.card }]}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('Overview')}</Text>
                    <View style={styles.grid}>
                        <MetaItem icon="pricetag" label={t('Registration')} value={vehicleData.registrationNumber} fullWidth />
                        <MetaItem icon="calendar" label={t('Year')} value={vehicleData.year || vehicleData.manufacturersYear} />
                        <MetaItem icon="water" label={t('Fuel Type')} value={vehicleData.fuelType} />
                        <MetaItem icon="color-palette" label={t('Color')} value={vehicleData.color} />
                        <MetaItem icon="speedometer" label={t('Mileage')} value={vehicleData.mileage ? `${vehicleData.mileage} km` : 'N/A'} />
                    </View>
                </Animated.View>

                {/* Technical Specs */}
                <Animated.View entering={FadeInDown.delay(200).springify()} style={[styles.section, { backgroundColor: colors.card }]}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('Technical Specs')}</Text>
                    <View style={styles.listContainer}>
                        <View style={[styles.listItem, { borderBottomColor: colors.border }]}>
                            <Text style={[styles.listLabel, { color: colors.subText }]}>{t('Chassis Number')}</Text>
                            <Text style={[styles.listValue, { color: colors.text }]}>{vehicleData.chassisNumber || 'N/A'}</Text>
                        </View>
                        <View style={[styles.listItem, { borderBottomColor: colors.border }]}>
                            <Text style={[styles.listLabel, { color: colors.subText }]}>{t('Engine Number')}</Text>
                            <Text style={[styles.listValue, { color: colors.text }]}>{vehicleData.engineNumber || 'N/A'}</Text>
                        </View>
                        <View style={[styles.listItem, { borderBottomColor: colors.border }]}>
                            <Text style={[styles.listLabel, { color: colors.subText }]}>{t('BS Norm')}</Text>
                            <Text style={[styles.listValue, { color: colors.text }]}>{vehicleData.bsNorm || 'N/A'}</Text>
                        </View>
                        <View style={[styles.listItem, { borderBottomColor: 'transparent' }]}>
                            <Text style={[styles.listLabel, { color: colors.subText }]}>{t('Vehicle Type')}</Text>
                            <Text style={[styles.listValue, { color: colors.text }]}>{vehicleData.vehicleType || 'Car'}</Text>
                        </View>
                    </View>
                </Animated.View>

                {/* View History Button */}
                <Animated.View entering={FadeInDown.delay(300).springify()}>
                    <TouchableOpacity
                        style={[styles.historyBtn, { backgroundColor: colors.card, borderColor: colors.primary }]}
                        onPress={() => {
                            router.push({
                                pathname: '/(technician)/job/[id]/vehicle-history',
                                params: { id, vehicleId: vehicleData._id || vehicleData.id || vehicleId },
                            });
                        }}
                    >
                        <MaterialCommunityIcons name="history" size={24} color={colors.primary} />
                        <Text style={[styles.historyBtnText, { color: colors.primary }]}>{t('View Service History')}</Text>
                        <Ionicons name="chevron-forward" size={20} color={colors.primary} />
                    </TouchableOpacity>
                </Animated.View>

                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { zIndex: 10, position: 'absolute', top: 0, left: 0, right: 0 },
    headerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10 },
    backBtn: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
    headerTitle: { fontSize: 17, fontFamily: 'NotoSans-Bold' },
    scrollContent: { paddingTop: 100, paddingHorizontal: 20, paddingBottom: 40 },

    heroSection: { height: 220, borderRadius: 24, overflow: 'hidden', marginBottom: 20, position: 'relative' },
    heroImage: { width: '100%', height: '100%' },
    placeholderImage: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' },
    overlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 20,
        backgroundColor: 'rgba(0,0,0,0.6)',
    },
    brandName: { color: '#FFF', fontSize: 28, fontFamily: 'NotoSans-Black', textTransform: 'uppercase' },
    modelName: { color: 'rgba(255,255,255,0.8)', fontSize: 16, fontFamily: 'NotoSans-Medium' },

    section: { borderRadius: 20, padding: 20, marginBottom: 20 },
    sectionTitle: { fontSize: 16, fontFamily: 'NotoSans-Bold', marginBottom: 15 },
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },

    metaItem: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12, gap: 10 },
    metaIcon: { width: 32, height: 32, borderRadius: 8, backgroundColor: 'rgba(255, 107, 0, 0.1)', justifyContent: 'center', alignItems: 'center' },
    metaLabel: { fontSize: 10, fontFamily: 'NotoSans-Bold', textTransform: 'uppercase' },
    metaValue: { fontSize: 14, fontFamily: 'NotoSans-Bold' },

    listContainer: { gap: 0 },
    listItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1 },
    listLabel: { fontSize: 14, fontFamily: 'NotoSans-Medium' },
    listValue: { fontSize: 14, fontFamily: 'NotoSans-Bold' },

    historyBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderStyle: 'dashed',
        gap: 10,
    },
    historyBtnText: { fontSize: 16, fontFamily: 'NotoSans-Bold' },
});
