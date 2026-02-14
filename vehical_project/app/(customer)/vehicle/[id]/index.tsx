import { Colors } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useCustomer } from '@/context/CustomerContext';
import { useLanguage } from '@/context/LanguageContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getMediaUrl } from '@/utils/mediaHelpers';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as MediaLibrary from 'expo-media-library';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Sharing from 'expo-sharing';
import React, { useRef, useState } from 'react';
import {
    Alert,
    Dimensions,
    Image,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { captureRef } from 'react-native-view-shot';

const { width } = Dimensions.get('window');

export default function VehicleDetailsScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const { user } = useAuth();
    const { vehicles, refresh, getVehicleHistory } = useCustomer();
    const { t } = useLanguage();
    const colorScheme = useColorScheme();
    const theme = colorScheme ?? 'light';
    const colors = Colors[theme];
    const isDark = theme === 'dark';
    const qrCardRef = useRef<View>(null);
    const [refreshing, setRefreshing] = useState(false);
    const [fullHistory, setFullHistory] = useState<any[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(true);

    const onRefresh = async () => {
        setRefreshing(true);
        try {
            await Promise.all([refresh(), loadHistory()]);
        } catch (e) {
            console.error(e);
        } finally {
            setRefreshing(false);
        }
    };

    const loadHistory = async () => {
        if (!id) return;
        setLoadingHistory(true);
        try {
            const data = await getVehicleHistory(id);
            setFullHistory(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoadingHistory(false);
        }
    };

    React.useEffect(() => {
        loadHistory();
    }, [id]);

    const vehicle = vehicles.find((v) => v.id === id);

    const itemStatusDisplay = (status: string) => {
        return status.toUpperCase().replace('_', ' ');
    };

    if (!vehicle) {
        return (
            <View style={styles.center}>
                <Text style={styles.errorText}>{t('Vehicle not found')}</Text>
                <TouchableOpacity onPress={() => router.back()}>
                    <Text style={styles.backLink}>{t('Go Back')}</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const handleShare = async () => {
        try {
            if (!qrCardRef.current) return;

            // Capture the entire card as an image for 'both image and text together'
            const uri = await captureRef(qrCardRef, {
                format: 'png',
                quality: 1,
            });

            await Sharing.shareAsync(uri, {
                mimeType: 'image/png',
                dialogTitle: `PAPAZ Digital ID - ${vehicle.make} ${vehicle.model}`,
                UTI: 'public.png',
            });
        } catch (error: any) {
            console.error(error);
            Alert.alert(t('Error'), t('Could not share Digital ID card. Please try again.'));
        }
    };

    const handleDownload = async () => {
        try {
            const { status } = await MediaLibrary.requestPermissionsAsync(true);
            if (status !== 'granted') {
                Alert.alert(t('Permission Denied'), t('Please allow access to your gallery to save the Identity Card.'));
                return;
            }

            if (!qrCardRef.current) return;

            // Capture the full identity card
            const uri = await captureRef(qrCardRef, {
                format: 'png',
                quality: 1,
            });

            await MediaLibrary.saveToLibraryAsync(uri);
            Alert.alert(t('Success'), t('Digital Identity Card saved to your gallery!'));
        } catch (error: any) {
            console.error(error);
            Alert.alert(t('Error'), t('Could not save Identity Card. Please try again.'));
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
            <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace('/(customer)/(tabs)')} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>{t('Vehicle Details')}</Text>
                <TouchableOpacity onPress={handleShare}>
                    <Ionicons name="share-outline" size={24} color={colors.customers} />
                </TouchableOpacity>
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
                }
            >
                {/* Vehicle Info Card */}
                <View style={[styles.infoCard, { backgroundColor: colors.card }]}>
                    <View style={[styles.iconBg, { backgroundColor: isDark ? colors.customers + '20' : '#F0F7FF' }]}>
                        {vehicle.images && vehicle.images.length > 0 ? (
                            <Image source={{ uri: getMediaUrl(vehicle.images[0]) || '' }} style={styles.vehicleThumb} />
                        ) : (
                            <MaterialCommunityIcons
                                name={(() => {
                                    const type = vehicle.vehicleType?.toLowerCase() || '';
                                    if (type.includes('car')) return 'car-side';
                                    if (type.includes('bike')) return 'motorbike';
                                    if (type.includes('scooter')) return 'scooter';
                                    if (type.includes('truck')) return 'truck';
                                    if (type.includes('bus')) return 'bus';
                                    if (type.includes('tractor')) return 'tractor';
                                    if (type.includes('van')) return 'van-utility';
                                    if (type.includes('rickshaw')) return 'rickshaw';
                                    if (type.includes('excavator') || type.includes('earthmover')) return 'excavator';
                                    if (type.includes('ev') || type.includes('electric')) return 'vehicle-electric';

                                    const name = (vehicle.make + vehicle.model).toLowerCase();
                                    if (name.includes('bike')) return 'motorbike';
                                    if (name.includes('scooter')) return 'scooter';
                                    return 'car-side';
                                })() as any}
                                size={32}
                                color={colors.customers}
                            />
                        )}
                    </View>
                    <View style={styles.details}>
                        <Text style={[styles.vehicleName, { color: colors.text }]}>{vehicle.make} {vehicle.model}</Text>
                        <Text style={[styles.regNo, { color: colors.icon }]}>{vehicle.registrationNumber}</Text>
                        <View style={styles.tagRow}>
                            <View style={[styles.yearTag, { backgroundColor: isDark ? colors.border : '#F2F2F7' }]}>
                                <Text style={[styles.yearText, { color: colors.text }]}>{vehicle.year}</Text>
                            </View>
                            <View style={[styles.verifiedTag, { backgroundColor: isDark ? colors.sales + '20' : '#E8F5E9' }]}>
                                <Ionicons name="checkmark-circle-outline" size={14} color={colors.sales} />
                                <Text style={[styles.verifiedText, { color: colors.sales }]}>{t('Verified')}</Text>
                            </View>
                            {vehicle.color && (
                                <View style={[styles.yearTag, { backgroundColor: isDark ? colors.border : '#F2F2F7' }]}>
                                    <Text style={[styles.yearText, { color: colors.text }]}>{vehicle.color}</Text>
                                </View>
                            )}
                            {vehicle.mileage && (
                                <View style={[styles.yearTag, { backgroundColor: isDark ? colors.border : '#F2F2F7' }]}>
                                    <Text style={[styles.yearText, { color: colors.text }]}>{vehicle.mileage}</Text>
                                </View>
                            )}
                        </View>
                    </View>
                </View>

                {/* Technical Details Section */}
                {(vehicle.chassisNumber || vehicle.engineNumber) && (
                    <View style={[styles.techDetailsContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        {vehicle.chassisNumber && (
                            <View style={styles.techItem}>
                                <Text style={[styles.techLabel, { color: colors.icon }]}>{t('CHASSIS NO.')}</Text>
                                <Text style={[styles.techValue, { color: colors.text }]}>{vehicle.chassisNumber}</Text>
                            </View>
                        )}
                        {vehicle.engineNumber && (
                            <View style={[styles.techItem, vehicle.chassisNumber && { borderLeftWidth: 1, borderLeftColor: colors.border }]}>
                                <Text style={[styles.techLabel, { color: colors.icon }]}>{t('ENGINE NO.')}</Text>
                                <Text style={[styles.techValue, { color: colors.text }]}>{vehicle.engineNumber}</Text>
                            </View>
                        )}
                    </View>
                )}

                {/* QR Code Section - Redesigned as a Premium Digital Card */}
                {/* QR Code Section - Redesigned as a Premium Digital Card */}
                <View ref={qrCardRef as any} collapsable={false} style={[styles.qrCardContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <View style={[styles.qrCardHeader, { backgroundColor: isDark ? colors.border : '#F8F9FE', borderBottomColor: colors.border }]}>
                        <View style={styles.qrAppBranding}>
                            <MaterialCommunityIcons name="shield-car" size={22} color={colors.customers} />
                            <Text style={[styles.qrAppName, { color: colors.text }]}>PAPAZ</Text>
                        </View>
                        <View style={[styles.qrBadge, { backgroundColor: isDark ? colors.customers + '20' : '#E1F0FF' }]}>
                            <Text style={[styles.qrBadgeText, { color: colors.customers }]}>{t('DIGITAL IDENTITY')}</Text>
                        </View>
                    </View>

                    <View style={styles.qrMainContent}>
                        <View style={styles.ownerInfo}>
                            <Text style={[styles.ownerLabel, { color: colors.icon }]}>{t('OFFICIAL OWNER')}</Text>
                            <Text style={[styles.ownerName, { color: colors.text }]}>{user?.profile?.fullName || 'Customer Name'}</Text>
                        </View>

                        <View style={[styles.qrImageBorder, { backgroundColor: '#FFF', borderColor: colors.border }]}>
                            <Image
                                source={{ uri: `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${vehicle.qrCode}&margin=10` }}
                                style={styles.qrImage}
                            />
                        </View>

                        <View style={[styles.qrIdentityValueRow, { backgroundColor: isDark ? colors.background : '#F9F9F9' }]}>
                            <Text style={[styles.qrIdentityLabel, { color: colors.icon }]}>{t('IDENTITY VALUE')}</Text>
                            <Text style={[styles.qrCodeString, { color: colors.text }]}>{vehicle.qrCode}</Text>
                        </View>

                        <Text style={[styles.qrInstruction, { color: colors.icon }]}>{t('Certified digital document for')} {vehicle.make} {vehicle.model} - {vehicle.registrationNumber}</Text>
                    </View>
                </View>

                <View style={[styles.qrCardFooter, { backgroundColor: colors.background }]}>
                    <View style={styles.qrActions}>
                        <TouchableOpacity style={[styles.qrActionBtn, { backgroundColor: isDark ? colors.card : '#F2F2F7' }]} onPress={handleDownload}>
                            <Ionicons name="download-outline" size={20} color={colors.customers} />
                            <Text style={[styles.qrActionText, { color: colors.customers }]}>{t('Save Card')}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.qrActionBtn, styles.qrActionBtnActive, { backgroundColor: colors.customers }]} onPress={handleShare}>
                            <Ionicons name="share-social-outline" size={20} color="#FFF" />
                            <Text style={[styles.qrActionText, { color: '#FFF' }]}>{t('Share Card')}</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>{t('Service History')}</Text>
                    <View style={styles.historyCountBadge}>
                        <Text style={styles.historyCountText}>{fullHistory.length} {t('records')}</Text>
                    </View>
                </View>

                {loadingHistory ? (
                    <View style={styles.loadingContainer}>
                        <Text style={{ color: colors.icon }}>{t('Loading history...')}</Text>
                    </View>
                ) : fullHistory.length > 0 ? (
                    fullHistory.map((job) => (
                        <TouchableOpacity
                            key={job.id}
                            style={[styles.historyItem, { backgroundColor: colors.card }]}
                            onPress={() => router.push({ pathname: '/(customer)/booking/[id]', params: { id: job.id } })}
                        >
                            <View style={styles.historyIcon}>
                                <MaterialCommunityIcons
                                    name={job.status === 'completed' ? 'check-circle' : 'clock-outline'}
                                    size={20}
                                    color={job.status === 'completed' ? colors.sales : colors.primary}
                                />
                            </View>
                            <View style={styles.historyInfo}>
                                <Text style={[styles.historyType, { color: colors.text }]} numberOfLines={1}>{job.description}</Text>
                                <Text style={[styles.historyDate, { color: colors.icon }]}>{new Date(job.createdAt).toLocaleDateString()}</Text>
                            </View>
                            <View style={styles.historyStatus}>
                                <Text style={[styles.statusText, { color: job.status === 'completed' ? colors.sales : colors.primary }]}>
                                    {itemStatusDisplay(job.status)}
                                </Text>
                                <Ionicons name="chevron-forward" size={16} color={colors.icon} />
                            </View>
                        </TouchableOpacity>
                    ))
                ) : (
                    <View style={[styles.emptyHistory, { backgroundColor: colors.card }]}>
                        <View style={[styles.emptyIconCircle, { backgroundColor: isDark ? colors.border : '#F8F9FE' }]}>
                            <Ionicons name="receipt-outline" size={32} color={colors.icon} />
                        </View>
                        <Text style={[styles.emptyHistoryText, { color: colors.icon }]}>{t('No service history yet')}</Text>
                        <View style={styles.emptyActions}>
                            <TouchableOpacity
                                style={[styles.bookNowBtn, { backgroundColor: isDark ? colors.customers + '20' : '#F0F7FF' }]}
                                onPress={() => router.push({ pathname: '/(customer)/booking/create', params: { vehicleId: vehicle.id } })}
                            >
                                <Text style={[styles.bookNowText, { color: colors.customers }]}>{t('Book Service')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.bookNowBtn, { backgroundColor: isDark ? colors.border : '#F2F2F7' }]}
                                onPress={() => router.push({ pathname: '/(customer)/(tabs)/request-product', params: { vehicle: `${vehicle.make} ${vehicle.model}` } })}
                            >
                                <Text style={[styles.bookNowText, { color: colors.text }]}>{t('Buy Parts')}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

                <View style={{ height: 40 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FE' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    errorText: { fontSize: 16, color: '#666', fontFamily: 'NotoSans-Regular' },
    backLink: { color: '#007AFF', marginTop: 10, fontFamily: 'NotoSans-Bold' },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#FFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    headerTitle: { fontSize: 18, fontFamily: 'NotoSans-Bold', color: '#1A1A1A' },
    backBtn: { padding: 4 },
    scrollContent: { padding: 20 },
    infoCard: {
        backgroundColor: '#FFF',
        borderRadius: 24,
        padding: 20,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15,
        marginBottom: 25,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
    },
    iconBg: { width: 70, height: 70, borderRadius: 20, backgroundColor: '#F0F7FF', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
    vehicleThumb: { width: '100%', height: '100%', resizeMode: 'cover' },
    details: { flex: 1 },
    vehicleName: { fontSize: 20, fontFamily: 'NotoSans-Bold', color: '#1A1A1A' },
    regNo: { fontSize: 14, fontFamily: 'NotoSans-Regular', color: '#8E8E93', marginTop: 2 },
    tagRow: { flexDirection: 'row', gap: 10, marginTop: 10, flexWrap: 'wrap' },
    yearTag: { backgroundColor: '#F2F2F7', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    yearText: { fontSize: 12, fontFamily: 'NotoSans-Bold', color: '#1A1A1A' },
    verifiedTag: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#E8F5E9', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    verifiedText: { fontSize: 12, fontFamily: 'NotoSans-Bold', color: '#34C759' },
    techDetailsContainer: {
        backgroundColor: '#FFF',
        borderRadius: 20,
        paddingHorizontal: 20,
        paddingVertical: 15,
        flexDirection: 'row',
        marginBottom: 25,
        borderWidth: 1,
        borderColor: '#F2F2F7',
    },
    techItem: { flex: 1, alignItems: 'center' },
    techLabel: { fontSize: 10, fontFamily: 'NotoSans-Bold', color: '#8E8E93', letterSpacing: 0.5, marginBottom: 4 },
    techValue: { fontSize: 14, fontFamily: 'NotoSans-Black', color: '#1A1A1A' },
    qrCardContainer: {
        backgroundColor: '#FFF',
        borderRadius: 24,
        overflow: 'hidden',
        marginBottom: 25,
        borderWidth: 1,
        borderColor: '#F0F0F0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.05,
        shadowRadius: 20,
        elevation: 5,
    },
    sectionTitle: { fontSize: 18, fontFamily: 'NotoSans-Bold', color: '#1A1A1A', marginBottom: 15 },
    qrCardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: '#F8F9FE',
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    qrAppBranding: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    qrAppName: { fontSize: 16, fontFamily: 'NotoSans-Black', color: '#1A1A1A', letterSpacing: 1 },
    qrBadge: { backgroundColor: '#E1F0FF', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
    qrBadgeText: { fontSize: 10, fontFamily: 'NotoSans-Bold', color: '#007AFF' },
    qrMainContent: { alignItems: 'center', padding: 25 },
    ownerInfo: { marginBottom: 20, alignItems: 'center' },
    ownerLabel: { fontSize: 10, fontFamily: 'NotoSans-Bold', color: '#8E8E93', letterSpacing: 1 },
    ownerName: { fontSize: 18, fontFamily: 'NotoSans-Black', color: '#1A1A1A', marginTop: 2 },
    qrImageBorder: {
        padding: 12,
        backgroundColor: '#FFF',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#F2F2F7',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    qrImage: { width: 200, height: 200 },
    qrIdentityValueRow: {
        marginTop: 20,
        backgroundColor: '#F9F9F9',
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        width: '100%',
        justifyContent: 'center'
    },
    qrIdentityLabel: { fontSize: 10, fontFamily: 'NotoSans-Bold', color: '#8E8E93' },
    qrCodeString: { fontSize: 18, fontFamily: 'NotoSans-Black', letterSpacing: 2, color: '#1A1A1A' },
    qrInstruction: { fontSize: 13, color: '#8E8E93', fontFamily: 'NotoSans-Regular', textAlign: 'center', marginTop: 15, lineHeight: 18 },
    qrCardFooter: { padding: 20, paddingTop: 0 },
    qrActions: { flexDirection: 'row', gap: 12, width: '100%' },
    qrActionBtn: {
        flex: 1,
        height: 48,
        borderRadius: 16,
        backgroundColor: '#F2F2F7',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    qrActionBtnActive: { backgroundColor: '#007AFF' },
    qrActionText: { fontSize: 13, fontFamily: 'NotoSans-Bold', color: '#007AFF' },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
    historyCountText: { fontSize: 13, color: '#8E8E93', fontFamily: 'NotoSans-Regular' },
    historyCountBadge: { backgroundColor: '#F2F2F7', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
    historyItem: {
        backgroundColor: '#FFF',
        borderRadius: 16,
        padding: 15,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        gap: 12,
    },
    historyIcon: { width: 40, height: 40, borderRadius: 10, backgroundColor: '#F8F9FE', justifyContent: 'center', alignItems: 'center' },
    historyInfo: { flex: 1 },
    historyType: { fontSize: 15, fontFamily: 'NotoSans-Bold', color: '#1A1A1A' },
    historyDate: { fontSize: 12, color: '#8E8E93', marginTop: 2 },
    historyStatus: { flexDirection: 'row', alignItems: 'center', gap: 5 },
    statusText: { fontSize: 11, fontFamily: 'NotoSans-Bold', textTransform: 'capitalize' },
    emptyHistory: { alignItems: 'center', padding: 40, backgroundColor: '#FFF', borderRadius: 24 },
    emptyIconCircle: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#F8F9FE', justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
    emptyHistoryText: { fontSize: 14, color: '#999', marginBottom: 20, fontFamily: 'NotoSans-Regular' },
    emptyActions: { flexDirection: 'row', gap: 12, width: '100%', justifyContent: 'center' },
    bookNowBtn: { flex: 1, backgroundColor: '#F0F7FF', paddingHorizontal: 15, paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
    bookNowText: { color: '#007AFF', fontFamily: 'NotoSans-Bold', fontSize: 14 },
    loadingContainer: { padding: 40, alignItems: 'center', justifyContent: 'center' },
});
