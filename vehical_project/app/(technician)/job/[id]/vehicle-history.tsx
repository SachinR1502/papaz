import { useLanguage } from '@/context/LanguageContext';
import { useTechnician } from '@/context/TechnicianContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { technicianService } from '@/services/technicianService';
import { getMediaUrl } from '@/utils/mediaHelpers';
import { Ionicons } from '@expo/vector-icons';
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
    View
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');



export default function VehicleHistoryScreen() {
    const { id, vehicleId } = useLocalSearchParams<{ id: string, vehicleId: string }>();
    const router = useRouter();
    const { availableJobs, myJobs, getVehicleHistory } = useTechnician();
    const { t } = useLanguage();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    useEffect(() => {
        loadHistory();
        console.log('[VehicleHistory] Vehicle ID:', vehicleId);
    }, [vehicleId]);

    // Theme Colors
    const colors = {
        background: isDark ? '#000000' : '#FFFFFF',
        card: isDark ? '#1C1C1E' : '#F2F2F7',
        text: isDark ? '#FFFFFF' : '#1A1A1A',
        subText: isDark ? '#8E8E93' : '#666666',
        border: isDark ? '#2C2C2E' : '#E5E5EA',
        primary: '#FF6B00',
        icon: isDark ? '#8E8E93' : '#666666',
    };

    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [vehicleData, setVehicleData] = useState<any>(null);
    const [jobDetails, setJobDetails] = useState<any>(null);

    const contextJob = [...availableJobs, ...myJobs].find(j => j.id === id);
    const job = jobDetails || contextJob;

    // Fetch full job details if context job is missing or has incomplete vehicle data
    useEffect(() => {
        const fetchJobDetails = async () => {
            if (!id) return;

            // If we already have a context job with a full vehicle object, we might not need to fetch
            // But if contextJob is undefined (reload) or vehicle is just an ID, we fetch
            const hasFullVehicle = contextJob?.vehicle &&
                typeof contextJob.vehicle === 'object' &&
                !('length' in contextJob.vehicle) &&
                ('make' in contextJob.vehicle || 'model' in contextJob.vehicle || 'year' in contextJob.vehicle);

            if (hasFullVehicle && contextJob.customer) {
                console.log('[VehicleHistory] Using context job with full data');
                setJobDetails(contextJob);
                return;
            }

            try {
                console.log('[VehicleHistory] Fetching full job details for:', id);
                const fullJob = await technicianService.getJob(id);
                if (fullJob) {
                    setJobDetails(fullJob);
                    if (fullJob.vehicle && typeof fullJob.vehicle === 'object' && !('length' in fullJob.vehicle)) {
                        setVehicleData(fullJob.vehicle);
                    }
                }
            } catch (e) {
                console.error('[VehicleHistory] Failed to fetch job details:', e);
            }
        };

        fetchJobDetails();
    }, [id, contextJob]);

    // Log vehicle data for debugging
    useEffect(() => {
        if (job) {
            // Only update if we have a populated vehicle object
            // This prevents overwriting with an ID string or partial data on background refreshes
            if (job.vehicle && typeof job.vehicle === 'object' && !('length' in job.vehicle)) {
                // Check if it has actual data keys
                const hasDetailedData = 'make' in job.vehicle || 'model' in job.vehicle || 'year' in job.vehicle;

                if (hasDetailedData) {
                    console.log('[VehicleHistory] Updating vehicle data from Job context');
                    setVehicleData(job.vehicle);
                }
            }
        }
    }, [job]);

    useEffect(() => {
        loadHistory();
    }, [vehicleId]);

    const loadHistory = async () => {
        if (!vehicleId) {
            console.log('[VehicleHistory] No vehicle ID provided');
            setLoading(false);
            return;
        }
        setLoading(true);
        console.log('[VehicleHistory] Loading history for vehicle ID:', vehicleId);
        try {
            const data = await getVehicleHistory(vehicleId);
            setHistory(data?.history || []);

            // Store vehicle data from response if available and valid
            if (data?.vehicle && typeof data.vehicle === 'object') {
                console.log('[VehicleHistory] Updating vehicle data from History API');
                setVehicleData(data.vehicle);
            } else {
                console.warn('[VehicleHistory] ⚠️ No vehicle data in response!');
            }
        } catch (e: any) {
            console.error('[VehicleHistory] ❌ Error loading history:', e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

            {/* Header */}
            <BlurView intensity={Platform.OS === 'ios' ? 80 : 0} tint={isDark ? 'dark' : 'light'} style={styles.header}>
                <SafeAreaView edges={['top']}>
                    <View style={styles.headerContent}>
                        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                            <Ionicons name="arrow-back" size={24} color={colors.text} />
                        </TouchableOpacity>
                        <Text style={[styles.headerTitle, { color: colors.text }]}>{t('vehicle_history_title') || 'Vehicle History'}</Text>
                        <View style={{ width: 40 }} />
                    </View>
                </SafeAreaView>
            </BlurView>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Vehicle Overview Card */}
                {job && (
                    <View style={[styles.card, { backgroundColor: colors.card }]}>
                        <View style={styles.vehicleHeader}>
                            {((vehicleData?.images || job.vehicle?.images) && (vehicleData?.images?.length > 0 || job.vehicle?.images?.length > 0)) ? (
                                <ExpoImage
                                    source={{ uri: getMediaUrl((vehicleData?.images || job.vehicle?.images)[0]) || '' }}
                                    style={styles.vehicleImage}
                                    contentFit="cover"
                                />
                            ) : (
                                <View style={styles.iconBox}>
                                    <Ionicons name="car-sport" size={24} color={colors.primary} />
                                </View>
                            )}
                            <View style={{ flex: 1 }}>
                                <Text style={[styles.vehicleName, { color: colors.text }]}>{vehicleData?.make && vehicleData?.model ? `${vehicleData.make} ${vehicleData.model}` : job.vehicleModel}</Text>
                                <Text style={[styles.vehicleSub, { color: colors.subText }]}>{vehicleData?.licensePlate || job.vehicleNumber || 'No License Plate'}</Text>
                            </View>
                        </View>

                        <View style={[styles.divider, { backgroundColor: colors.border }]} />

                        <View style={{ gap: 12 }}>
                            <View style={{ flexDirection: 'row', gap: 12 }}>
                                <View style={[styles.statItem, { flex: 1, backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#F2F2F7', padding: 12, borderRadius: 16 }]}>
                                    <Ionicons name="leaf-outline" size={20} color={colors.primary} style={{ marginBottom: 8 }} />
                                    <Text style={[styles.statLabel, { color: colors.subText }]}>{t('bs_norm') || 'BS Norm'}</Text>
                                    <Text style={[styles.statValue, { color: colors.text }]}>{vehicleData?.bsNorm || job.vehicle?.bsNorm || 'N/A'}</Text>
                                </View>
                                <View style={[styles.statItem, { flex: 1, backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#F2F2F7', padding: 12, borderRadius: 16 }]}>
                                    <Ionicons name="calendar-outline" size={20} color={colors.primary} style={{ marginBottom: 8 }} />
                                    <Text style={[styles.statLabel, { color: colors.subText }]}>{t('manufacturing_year') || 'Year'}</Text>
                                    <Text style={[styles.statValue, { color: colors.text }]}>{vehicleData?.year || vehicleData?.manufacturersYear || job.vehicle?.year || job.manufacturersYear || 'N/A'}</Text>
                                </View>
                            </View>

                            <View style={{ flexDirection: 'row', gap: 12 }}>
                                <View style={[styles.statItem, { flex: 1, backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#F2F2F7', padding: 12, borderRadius: 16 }]}>
                                    <Ionicons name="water-outline" size={20} color={colors.primary} style={{ marginBottom: 8 }} />
                                    <Text style={[styles.statLabel, { color: colors.subText }]}>{t('fuel_type') || 'Fuel'}</Text>
                                    <Text style={[styles.statValue, { color: colors.text }]}>{vehicleData?.fuelType || job.vehicle?.fuelType || 'N/A'}</Text>
                                </View>
                                <View style={[styles.statItem, { flex: 1, backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#F2F2F7', padding: 12, borderRadius: 16 }]}>
                                    <Ionicons name="barcode-outline" size={20} color={colors.primary} style={{ marginBottom: 8 }} />
                                    <Text style={[styles.statLabel, { color: colors.subText }]}>{t('chassis_number') || 'Chassis No.'}</Text>
                                    <Text style={[styles.statValue, { color: colors.text }]} numberOfLines={1}>{vehicleData?.chassisNumber || job.vehicle?.chassisNumber || 'N/A'}</Text>
                                </View>
                            </View>

                            <View style={[styles.statItem, { width: '100%', backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#F2F2F7', padding: 12, borderRadius: 16, flexDirection: 'row', alignItems: 'center', gap: 12 }]}>
                                <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)', justifyContent: 'center', alignItems: 'center' }}>
                                    <Ionicons name="hardware-chip-outline" size={22} color={colors.primary} />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={[styles.statLabel, { color: colors.subText, marginBottom: 2 }]}>{t('engine_number') || 'Engine No.'}</Text>
                                    <Text style={[styles.statValue, { color: colors.text }]} numberOfLines={1}>{vehicleData?.engineNumber || job.vehicle?.engineNumber || 'N/A'}</Text>
                                </View>
                            </View>

                            {/* Photos Section */}
                            {/* Photos Section */}
                            <View style={{ marginTop: 4 }}>
                                <Text style={[styles.statLabel, { color: colors.subText, marginBottom: 8 }]}>{t('uploaded_photos') || 'Vehicle Photos'}</Text>
                                {((vehicleData?.images || job.vehicle?.images) && (vehicleData?.images?.length > 0 || job.vehicle?.images?.length > 0)) ? (
                                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                                        {(vehicleData?.images || job.vehicle?.images).map((photo: string, index: number) => {
                                            const photoUrl = getMediaUrl(photo);
                                            console.log(`[VehicleHistory] Photo ${index}:`, photo, '→', photoUrl);
                                            return (
                                                <ExpoImage
                                                    key={index}
                                                    source={{ uri: photoUrl || '' }}
                                                    style={{ width: 80, height: 80, borderRadius: 12, backgroundColor: colors.border }}
                                                    contentFit="cover"
                                                />
                                            );
                                        })}
                                    </ScrollView>
                                ) : (
                                    <View style={{
                                        padding: 16,
                                        backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                                        borderRadius: 12,
                                        alignItems: 'center',
                                        borderWidth: 1,
                                        borderColor: colors.border,
                                        borderStyle: 'dashed'
                                    }}>
                                        <Ionicons name="images-outline" size={24} color={colors.icon} style={{ marginBottom: 4 }} />
                                        <Text style={{ fontSize: 12, color: colors.subText, textAlign: 'center' }}>
                                            {t('no_photos_uploaded') || 'No photos uploaded'}
                                        </Text>
                                    </View>
                                )}
                            </View>
                        </View>
                    </View>
                )}

                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <Text style={[styles.sectionTitle, { color: colors.subText, marginBottom: 0 }]}>{t('service_record') || 'Service Record'}</Text>
                    <View style={[styles.badge, { backgroundColor: colors.primary + '15' }]}>
                        <Text style={{ fontSize: 12, color: colors.primary, fontFamily: 'NotoSans-Bold' }}>{history.length} {t('records') || 'Records'}</Text>
                    </View>
                </View>

                {loading ? (
                    <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
                ) : (
                    <View style={styles.historyList}>
                        {history.length > 0 ? (
                            history.map((record, index) => (
                                <Animated.View
                                    key={record.id}
                                    entering={FadeInDown.delay(index * 150).springify()}
                                    style={styles.timelineItem}
                                >
                                    {/* Timeline Line */}
                                    <View style={styles.timelineLeft}>
                                        <View style={[styles.timelineDot, { borderColor: colors.primary, backgroundColor: colors.background }]} />
                                        {index !== history.length - 1 && <View style={[styles.timelineLine, { backgroundColor: colors.border }]} />}
                                    </View>

                                    {/* Content Card */}
                                    <View style={[styles.historyCard, { backgroundColor: colors.card, shadowColor: colors.text }]}>
                                        <View style={styles.cardHeader}>
                                            <Text style={[styles.serviceDate, { color: colors.primary }]}>{record.date}</Text>
                                            <Text style={[styles.serviceCost, { color: colors.text }]}>${record.cost}</Text>
                                        </View>

                                        <Text style={[styles.serviceName, { color: colors.text }]}>{record.service}</Text>
                                        <Text style={[styles.serviceNotes, { color: colors.subText }]}>{record.notes}</Text>

                                        <View style={[styles.cardFooter, { borderTopColor: colors.border }]}>
                                            <View style={styles.techRow}>
                                                <Ionicons name="person-circle-outline" size={16} color={colors.icon || '#8E8E93'} />
                                                <Text style={[styles.techName, { color: colors.subText }]}>{record.technician}</Text>
                                            </View>
                                            <TouchableOpacity style={styles.detailsLink}>
                                                <Text style={[styles.linkText, { color: colors.primary }]}>View Details</Text>
                                                <Ionicons name="chevron-forward" size={12} color={colors.primary} />
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </Animated.View>
                            ))
                        ) : (
                            <View style={styles.emptyState}>
                                <Ionicons name="document-text-outline" size={48} color={colors.border} />
                                <Text style={{ color: colors.subText, marginTop: 10 }}>{t('no_history') || 'No service history available.'}</Text>
                            </View>
                        )}
                    </View>
                )}
                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { zIndex: 10 },
    headerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10 },
    backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
    headerTitle: { fontSize: 17, fontFamily: 'NotoSans-Bold' },
    scrollContent: { padding: 20 },
    card: { borderRadius: 20, padding: 20, marginBottom: 30 },
    vehicleHeader: { flexDirection: 'row', alignItems: 'center', gap: 15 },
    iconBox: { width: 50, height: 50, borderRadius: 16, backgroundColor: 'rgba(255,107,0,0.1)', justifyContent: 'center', alignItems: 'center' },
    vehicleImage: { width: 50, height: 50, borderRadius: 16, backgroundColor: '#eee' },
    vehicleName: { fontSize: 18, fontFamily: 'NotoSans-Bold' },
    vehicleSub: { fontSize: 13, fontFamily: 'NotoSans-Medium', marginTop: 2 },
    divider: { height: 1, marginVertical: 20, opacity: 0.5 },
    statsRow: { flexDirection: 'row', justifyContent: 'space-between' },
    statItem: { alignItems: 'center', flex: 1 },
    statLabel: { fontSize: 11, marginBottom: 6, textTransform: 'uppercase', fontFamily: 'NotoSans-Bold' },
    statValue: { fontSize: 14, fontFamily: 'NotoSans-Bold' },

    sectionTitle: { fontSize: 13, fontFamily: 'NotoSans-Bold', textTransform: 'uppercase', letterSpacing: 1 },
    badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },

    historyList: { paddingLeft: 10 },
    timelineItem: { flexDirection: 'row', marginBottom: 20 },
    timelineLeft: { width: 20, alignItems: 'center', marginRight: 15 },
    timelineDot: { width: 14, height: 14, borderRadius: 7, borderWidth: 3, zIndex: 1 },
    timelineLine: { width: 2, flex: 1, position: 'absolute', top: 14, bottom: -20, left: 6, opacity: 0.3 },

    historyCard: {
        flex: 1,
        borderRadius: 16,
        padding: 16,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2
    },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
    serviceDate: { fontSize: 12, fontFamily: 'NotoSans-Bold' },
    serviceCost: { fontSize: 14, fontFamily: 'NotoSans-Black' },
    serviceName: { fontSize: 15, fontFamily: 'NotoSans-Bold', marginBottom: 4 },
    serviceNotes: { fontSize: 13, fontFamily: 'NotoSans-Regular', lineHeight: 18, marginBottom: 12 },

    cardFooter: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: 12, borderTopWidth: 1, alignItems: 'center' },
    techRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    techName: { fontSize: 12, fontFamily: 'NotoSans-Medium' },
    detailsLink: { flexDirection: 'row', alignItems: 'center', gap: 2 },
    linkText: { fontSize: 12, fontFamily: 'NotoSans-Bold' },

    emptyState: { alignItems: 'center', paddingVertical: 40, opacity: 0.7 }
});
