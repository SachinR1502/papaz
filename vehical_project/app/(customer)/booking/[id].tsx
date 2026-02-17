import { EmptyState, ErrorBoundary, JobCardSkeleton } from '@/components/ui';
import { AppButton } from '@/components/ui/AppButton';
import { AudioPlayer } from '@/components/ui/AudioPlayer';
import { ImageModal } from '@/components/ui/ImageModal';
import { PaymentSimulator } from '@/components/ui/PaymentSimulator';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { StatusStepper } from '@/components/ui/StatusStepper';
import { Colors } from '@/constants/theme';
import { useAdmin } from '@/context/AdminContext';
import { useAuth } from '@/context/AuthContext';
import { useCall } from '@/context/CallContext';
import { useChat } from '@/context/ChatContext';
import { useCustomer } from '@/context/CustomerContext';
import { useLanguage } from '@/context/LanguageContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { socketService } from '@/services/socket';
import { getMediaUrl, parseDescription } from '@/utils/mediaHelpers';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    Alert,
    Animated,
    Image,
    Modal,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    ActivityIndicator
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';

function BookingDetailsContent() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const { user } = useAuth();
    const { createConversation } = useChat();
    const { activeJobs, historyJobs, respondToBill, respondToQuote, profile, cancelJob, rateJob, isLoading, refresh } = useCustomer();
    const { settings } = useAdmin();
    const { t } = useLanguage();
    const [actionLoading, setActionLoading] = useState(false);
    const [approvalModalVisible, setApprovalModalVisible] = useState(false);
    const [partsSource, setPartsSource] = useState<'tech_inventory' | 'customer_own'>('tech_inventory');
    const [paymentMethod, setPaymentMethod] = useState<'razorpay' | 'cash' | 'wallet'>('razorpay');
    const [handoverConfirmed, setHandoverConfirmed] = useState(false);
    const [showPaymentSimulator, setShowPaymentSimulator] = useState(false);

    // Cancel & Rate State
    const [cancelModalVisible, setCancelModalVisible] = useState(false);
    const [cancelReason, setCancelReason] = useState('');
    const [rateModalVisible, setRateModalVisible] = useState(false);
    const [rating, setRating] = useState(5);
    const [review, setReview] = useState('');

    // Interactive Media State
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    const colorScheme = useColorScheme();
    const theme = colorScheme ?? 'light';
    const colors = Colors[theme];
    const isDark = theme === 'dark';

    const currencySymbol = settings.currency === 'INR' ? '₹' : '$';

    // Derived job state
    const job = activeJobs.find(j => j.id === id) || historyJobs.find(j => j.id === id);

    // Determine if we should show Bill or Quote data
    const isBillView = !!job?.bill && ['billing_pending', 'vehicle_delivered', 'completed'].includes(job?.status || '');
    const displaySource = job ? (isBillView ? job.bill : job.quote) : undefined;

    // Animation Refs
    const blobAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(blobAnim, { toValue: 1, duration: 8000, useNativeDriver: true }),
                Animated.timing(blobAnim, { toValue: 0, duration: 8000, useNativeDriver: true }),
            ])
        ).start();
    }, []);

    const [technicianLocation, setTechnicianLocation] = useState<{ latitude: number; longitude: number } | null>(null);

    useEffect(() => {
        if (job?.status === 'accepted') {
            socketService.on('technician_location', (data: { latitude: number; longitude: number; jobId: string }) => {
                if (data.jobId === job.id) {
                    setTechnicianLocation({
                        latitude: data.latitude,
                        longitude: data.longitude
                    });
                }
            });
        }

        return () => {
            socketService.off('technician_location');
        };
    }, [job?.id, job?.status]);

    const { startCall } = useCall();

    if (isLoading) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
                <View style={{ padding: 20 }}>
                    <JobCardSkeleton />
                    <View style={{ height: 20 }} />
                    <JobCardSkeleton />
                </View>
            </SafeAreaView>
        );
    }

    if (!job) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
                <View style={styles.headerContent}>
                    <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace('/(customer)/(tabs)')} style={[styles.backBtn, { backgroundColor: isDark ? colors.icon + '20' : colors.icon + '10' }]}>
                        <Ionicons name="arrow-back" size={24} color={colors.text} />
                    </TouchableOpacity>
                </View>
                <EmptyState
                    icon="document-text-outline"
                    title={t('job_not_found')}
                    description={t('job_not_found_desc')}
                    action={{
                        label: t('go_home'),
                        onPress: () => router.replace('/(customer)/(tabs)')
                    }}
                />
            </SafeAreaView>
        );
    }

    const handleAction = async (action: 'approve' | 'reject') => {
        if (action === 'approve') {
            setShowPaymentSimulator(true);
            return;
        }

        setActionLoading(true);
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);

        try {
            await respondToBill(job.id, action);
            refresh();
        } catch (e) {
            Alert.alert('Error', 'Failed to process request.');
        } finally {
            setActionLoading(false);
        }
    };

    const handlePaymentSuccess = async (referenceId: string, isReal: boolean, method?: string) => {
        setShowPaymentSimulator(false);
        setActionLoading(true);
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        try {
            // Re-fetch data to show paid status (PaymentSimulator already called backend)
            await refresh();

            const msg = method === 'wallet' ? 'Paid via PAPAZ Wallet.' : method === 'cash' ? 'Cash payment confirmed.' : 'Payment verified successfully.';
            Alert.alert('Success', msg);
        } catch (e) {
            Alert.alert('Error', 'Failed to refresh job status.');
        } finally {
            setActionLoading(false);
        }
    };

    const handlePaymentFailure = (error: string) => {
        setShowPaymentSimulator(false);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Alert.alert('Payment Failed', error);
    };

    const handleApproveConfirm = async () => {
        setApprovalModalVisible(false);
        setActionLoading(true);
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        let responseType = 'accept_with_parts';
        if (partsSource === 'customer_own') {
            responseType = 'accept_own_parts';
        }

        try {
            await respondToQuote(job.id, responseType as any);
            Alert.alert(t('job_approved'), t('technician_notified'));
        } catch (e: any) {
            const errorMessage = e.response?.data?.message || e.message || t('failed_to_approve');
            Alert.alert(t('error'), errorMessage);
            console.error('Approve Error:', errorMessage, e);
        } finally {
            setActionLoading(false);
        }
    };

    const handleReject = async () => {
        setActionLoading(true);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        try {
            await respondToQuote(job.id, 'reject');
            Alert.alert(t('job_rejected'), t('technician_notified'));
        } catch (e: any) {
            const errorMessage = e.response?.data?.message || e.message || 'Failed to reject quote';
            Alert.alert(t('error'), errorMessage);
        } finally {
            setActionLoading(false);
        }
    };

    const vehicleName = (job as any).vehicle?.make
        ? `${(job as any).vehicle.make} ${(job as any).vehicle.model}`
        : (job as any).vehicleName || job.vehicleModel || t('vehicle');
    const lastUpdate = job.updatedAt ? new Date(job.updatedAt) : new Date(job.createdAt);

    const handleChat = () => {
        if (!job) return;
        Haptics.selectionAsync();

        const targetUserId = (job.technician as any)?.user?._id || (job.technician as any)?.user || job.technicianId || 'technician';
        const targetName = (job.technician as any)?.user?.name || (job.technician as any)?.fullName || job.technicianName || 'Technician';

        const conversationId = createConversation([
            { userId: user?.id || 'customer', role: 'customer', name: 'You' },
            { userId: targetUserId, role: 'technician', name: targetName }
        ], job.id);
        router.push({ pathname: '/(customer)/chat/[id]', params: { id: conversationId } });
    };

    const handleCall = () => {
        Haptics.selectionAsync();
        const targetUserId = (job.technician as any)?.user?._id || (job.technician as any)?.user || job.technicianId || 'technician';
        const targetName = (job.technician as any)?.user?.name || (job.technician as any)?.fullName || job.technicianName || 'Technician';
        startCall(targetUserId, targetName, 'audio');
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

            {/* Background Blob */}
            <View style={StyleSheet.absoluteFill} pointerEvents="none">
                <Animated.View style={[
                    styles.blob,
                    {
                        backgroundColor: colors.primary,
                        transform: [
                            { translateX: blobAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 50] }) },
                            { translateY: blobAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 30] }) },
                        ]
                    }
                ]} />
            </View>

            {/* Header */}
            <BlurView intensity={Platform.OS === 'ios' ? 80 : 0} tint={isDark ? 'dark' : 'light'} style={styles.headerContainer}>
                <SafeAreaView edges={['top']} style={styles.headerSafeArea}>
                    <View style={styles.headerContent}>
                        <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace('/(customer)/(tabs)')} style={[styles.backBtn, { backgroundColor: isDark ? colors.icon + '20' : colors.icon + '10' }]}>
                            <Ionicons name="arrow-back" size={24} color={colors.text} />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={{ flex: 1, alignItems: 'center' }}
                            onPress={() => {
                                const vId = (job as any).vehicle?._id || (job as any).vehicle?.id || (typeof (job as any).vehicle === 'string' ? (job as any).vehicle : null);
                                if (vId) {
                                    router.push({ pathname: '/(customer)/vehicle/[id]', params: { id: vId } });
                                } else {
                                    Alert.alert(t('Error'), t('Vehicle details are not available'));
                                }
                            }}
                        >
                            <Text style={[styles.headerTitle, { color: colors.text }]}>{t('job_card')} #{job.id.slice(0, 8).toUpperCase()}</Text>
                            <Text style={[styles.headerSub, { color: colors.icon }]}>
                                {vehicleName} <Ionicons name="chevron-forward" size={12} color={colors.primary} />
                            </Text>
                        </TouchableOpacity>
                        <View style={{ flexDirection: 'row', gap: 10 }}>
                            <TouchableOpacity onPress={handleCall} style={[styles.helpBtn, { backgroundColor: isDark ? colors.sales + '20' : colors.sales + '10' }]}>
                                <Ionicons name="call" size={20} color={colors.sales} />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleChat} style={[styles.helpBtn, { backgroundColor: isDark ? colors.customers + '20' : colors.customers + '10' }]}>
                                <Ionicons name="chatbubble-ellipses-outline" size={22} color={colors.customers} />
                            </TouchableOpacity>
                            {(job.status === 'pending' || job.status === 'accepted') && (
                                <TouchableOpacity onPress={() => setCancelModalVisible(true)} style={[styles.helpBtn, { backgroundColor: '#FF3B3020' }]}>
                                    <Ionicons name="close-circle" size={22} color="#FF3B30" />
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                </SafeAreaView>
            </BlurView>

            <ScrollView
                contentContainerStyle={[styles.scrollContent, { paddingTop: 120 }]}
                showsVerticalScrollIndicator={false}
            >
                {/* 1. Status Overview */}
                <View style={styles.statusCard}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
                        <StatusBadge status={job.status} size="medium" />

                        {/* Service Method Badge */}
                        <View style={{ backgroundColor: colors.primary + '15', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                            <Ionicons
                                name={job.serviceMethod === 'walk_in' ? 'walk' : job.serviceMethod === 'home_pickup' ? 'car' : 'construct'}
                                size={12}
                                color={colors.primary}
                            />
                            <Text style={{ fontSize: 12, fontFamily: 'NotoSans-Bold', color: colors.primary, textTransform: 'capitalize' }}>
                                {job.serviceMethod ? job.serviceMethod.replace('_', ' ') : 'Standard'}
                            </Text>
                        </View>

                        {/* Service Charge Badge */}
                        {((job as any).serviceCharge > 0 || (job as any).metadata?.serviceCharge > 0) && (
                            <View style={{ backgroundColor: '#34C75915', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                <Text style={{ fontSize: 12, fontFamily: 'NotoSans-Bold', color: '#34C759' }}>
                                    {currencySymbol}{(job as any).serviceCharge || (job as any).metadata?.serviceCharge}
                                </Text>
                            </View>
                        )}
                    </View>
                    <Text style={[styles.statusTime, { color: colors.icon }]}>Updated {lastUpdate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                </View>

                {/* Live Tracking Map */}
                {job.status === 'accepted' && (
                    <View style={[styles.mapContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <View style={[styles.mapHeader, { borderBottomColor: colors.border }]}>
                            <Ionicons name={job.serviceMethod === 'walk_in' ? "storefront-outline" : "map-outline"} size={20} color={colors.primary} />
                            <Text style={[styles.mapTitle, { color: colors.text }]}>
                                {job.serviceMethod === 'walk_in' ? t('Garage Location') :
                                    job.serviceMethod === 'home_pickup' ? t('Technician En Route') :
                                        t('Technician Live Location')}
                            </Text>
                        </View>
                        <View style={{ flex: 1 }}>
                            <MapView
                                provider={PROVIDER_GOOGLE}
                                style={styles.map}
                                initialRegion={{
                                    latitude: (job.serviceMethod === 'walk_in' ? (job.technician?.location?.coordinates?.[1] || job.technician?.latitude) : (technicianLocation?.latitude || job.location?.latitude || job.location?.lat)) || 0,
                                    longitude: (job.serviceMethod === 'walk_in' ? (job.technician?.location?.coordinates?.[0] || job.technician?.longitude) : (technicianLocation?.longitude || job.location?.longitude || job.location?.lng)) || 0,
                                    latitudeDelta: 0.01,
                                    longitudeDelta: 0.01,
                                }}
                                region={technicianLocation ? {
                                    latitude: technicianLocation.latitude,
                                    longitude: technicianLocation.longitude,
                                    latitudeDelta: 0.01,
                                    longitudeDelta: 0.01,
                                } : undefined}
                            >
                                {technicianLocation && job.serviceMethod !== 'walk_in' && (
                                    <Marker
                                        coordinate={technicianLocation}
                                        title="Technician"
                                        description="Live Location"
                                    >
                                        <View style={{ backgroundColor: colors.primary, padding: 8, borderRadius: 20, borderWidth: 3, borderColor: '#FFF' }}>
                                            <MaterialCommunityIcons name="account-wrench" size={20} color="#FFF" />
                                        </View>
                                    </Marker>
                                )}
                                {(job.location?.latitude || job.location?.lat) && job.serviceMethod !== 'walk_in' && (
                                    <Marker
                                        coordinate={{
                                            latitude: job.location?.latitude || job.location?.lat || 0,
                                            longitude: job.location?.longitude || job.location?.lng || 0,
                                        }}
                                        title="Your Location"
                                        pinColor={colors.notification}
                                    />
                                )}
                                {job.serviceMethod === 'walk_in' && (job.technician?.location?.coordinates || (job.technician?.latitude && job.technician?.longitude)) && (
                                    <Marker
                                        coordinate={{
                                            latitude: job.technician?.location?.coordinates?.[1] || job.technician?.latitude || 0,
                                            longitude: job.technician?.location?.coordinates?.[0] || job.technician?.longitude || 0,
                                        }}
                                        title={job.garageName || "Garage"}
                                        description={t('Navigate here')}
                                        pinColor={colors.primary}
                                    />
                                )}
                            </MapView>
                        </View>
                        <View style={{ padding: 12, backgroundColor: colors.primary + '10' }}>
                            <Text style={{ fontSize: 11, color: colors.primary, fontFamily: 'NotoSans-Bold', textAlign: 'center' }}>
                                {job.serviceMethod === 'walk_in' ? t('Please proceed to the garage location') :
                                    job.serviceMethod === 'home_pickup' ? (technicianLocation ? t('Technician is on the way to pick up vehicle') : t('Waiting for technician location...')) :
                                        (technicianLocation ? t('Technician is on the way') : t('Waiting for technician location...'))}
                            </Text>
                        </View>
                    </View>
                )}

                {job.status === 'completed' && !(job as any).rating && (
                    <View style={[styles.actionCard, { backgroundColor: colors.card, borderColor: '#FF9500', shadowColor: '#FF9500' }]}>
                        <View style={styles.actionHeader}>
                            <Ionicons name="star" size={24} color="#FF9500" />
                            <Text style={[styles.actionTitle, { color: colors.text }]}>Rate Service</Text>
                        </View>
                        <Text style={[styles.actionBody, { color: colors.icon }]}>How was your experience with the technician?</Text>
                        <AppButton title="Rate Technician" onPress={() => setRateModalVisible(true)} variant="secondary" />
                    </View>
                )}

                {job.status === 'completed' && (job as any).rating && (
                    <View style={[styles.actionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <View style={styles.actionHeader}>
                            <Ionicons name="star" size={24} color="#FF9500" />
                            <Text style={[styles.actionTitle, { color: colors.text }]}>You rated this job</Text>
                        </View>
                        <View style={{ flexDirection: 'row', gap: 5, marginBottom: 10 }}>
                            {[1, 2, 3, 4, 5].map(s => (
                                <Ionicons key={s} name={s <= (job as any).rating ? "star" : "star-outline"} size={20} color="#FF9500" />
                            ))}
                        </View>
                        <Text style={[styles.actionBody, { color: colors.icon }]}>"{(job as any).review || 'No review'}"</Text>
                    </View>
                )}

                {job.status === 'cancelled' && (
                    <View style={[styles.actionCard, { borderColor: '#FF3B30', backgroundColor: colors.card }]}>
                        <View style={styles.actionHeader}>
                            <Ionicons name="close-circle" size={24} color="#FF3B30" />
                            <Text style={[styles.actionTitle, { color: colors.text }]}>Job Cancelled</Text>
                        </View>
                        <Text style={[styles.actionBody, { color: colors.icon }]}>This job has been cancelled. No further actions are required.</Text>
                    </View>
                )}

                {/* 2. Timeline Stepper */}
                <View style={[styles.section, { marginBottom: 25 }]}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('service_timeline') || 'Service Progress'}</Text>
                    <View style={[styles.timelineCard, { backgroundColor: colors.card, paddingVertical: 10 }]}>
                        <StatusStepper currentStatus={job.status} />
                    </View>
                </View>

                {/* 2A. Reported Issue / Original Request */}
                <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, shadowColor: colors.text }]}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 8 }}>
                        <View style={{ backgroundColor: colors.primary + '15', padding: 8, borderRadius: 10 }}>
                            <Ionicons name="alert-circle" size={20} color={colors.primary} />
                        </View>
                        <Text style={[styles.cardTitle, { color: colors.text, marginBottom: 0 }]}>{t('Reported Issue')}</Text>
                    </View>

                    {(() => {
                        const parsed = parseDescription(job.description);
                        const allPhotos = Array.from(new Set([
                            ...(job.photos || []),
                            ...(parsed.photoUris || [])
                        ]));
                        const primaryVoice = job.voiceNote || parsed.voiceUri;

                        return (
                            <>
                                <Text style={{ fontSize: 15, color: colors.text, lineHeight: 22, fontFamily: 'NotoSans-Medium' }}>
                                    {parsed.cleaned || t('No description provided')}
                                </Text>

                                {(allPhotos.length > 0 || primaryVoice) && (
                                    <View style={{ marginTop: 15, gap: 12 }}>
                                        {(() => {
                                            console.log('[JOB_DETAILS] Media data:', {
                                                photos: allPhotos,
                                                voiceNote: primaryVoice,
                                                hasPhotos: allPhotos.length > 0,
                                                hasVoice: !!primaryVoice
                                            });
                                            return null;
                                        })()}
                                        {allPhotos.length > 0 && (
                                            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                                {allPhotos.map((photo: string, index: number) => (
                                                    <TouchableOpacity key={index} onPress={() => setSelectedImage(getMediaUrl(photo))} style={{ marginRight: 10 }}>
                                                        <Image source={{ uri: getMediaUrl(photo) || '' }} style={{ width: 110, height: 110, borderRadius: 12, backgroundColor: colors.border }} />
                                                    </TouchableOpacity>
                                                ))}
                                            </ScrollView>
                                        )}
                                        {primaryVoice && (
                                            <View style={{ backgroundColor: isDark ? '#ffffff05' : '#F9F9F9', borderRadius: 12, padding: 10, borderWidth: 1, borderColor: colors.border }}>
                                                <AudioPlayer uri={primaryVoice} />
                                            </View>
                                        )}
                                    </View>
                                )}
                            </>
                        );
                    })()}
                </View>

                {/* 2B. Approved Work Details / Final Invoice */}
                {['parts_required', 'parts_ordered', 'in_progress'].includes(job.status) && displaySource && (
                    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, shadowColor: colors.text }]}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
                            <View style={{ gap: 4 }}>
                                <Text style={[styles.cardTitle, { color: colors.text, marginBottom: 0 }]}>
                                    {isBillView ? t('Final Invoice') : t('approved_work')}
                                </Text>
                                {job.partsSource && (
                                    <Text style={{ fontSize: 10, fontFamily: 'NotoSans-Bold', color: job.partsSource === 'customer' ? '#FF9500' : '#34C759' }}>
                                        {job.partsSource === 'customer' ? 'Source: Customer' : 'Source: Workshop'}
                                    </Text>
                                )}
                            </View>
                            {(job.status === 'parts_required' || job.status === 'in_progress') && (
                                <TouchableOpacity
                                    onPress={() => {
                                        const queryParams = new URLSearchParams();
                                        const vMake = (job as any).vehicle?.make;
                                        const vModel = (job as any).vehicle?.model;
                                        const searchName = vMake ? `${vMake} ${vModel}` : (job.vehicleModel || vehicleName);

                                        if (searchName && searchName !== t('vehicle')) {
                                            queryParams.set('vehicle', searchName);
                                        }

                                        const quoteItems = job.quote?.items || [];
                                        const partItems = quoteItems.filter((i: any) => !(i.isNote || i.unitPrice === 0));

                                        if (partItems.length > 0) {
                                            const itemsToRequest = partItems.map((i: any) => ({
                                                name: i.name || i.description?.split('\n')[0] || i.description,
                                                description: i.description,
                                                qty: i.quantity,
                                                price: i.unitPrice,
                                                productId: i.product?._id || i.product || i.productId,
                                                image: i.image,
                                                partNumber: i.partNumber,
                                                brand: i.brand
                                            }));
                                            queryParams.set('prefillItems', JSON.stringify(itemsToRequest));
                                            queryParams.set('initialTab', 'standard');
                                        } else {
                                            queryParams.set('initialTab', 'custom');
                                        }

                                        // Send Quote context instead of Job context
                                        const quoteArgs = job.quote as any;
                                        const quoteNote = quoteArgs?.note || quoteArgs?.description || '';
                                        if (quoteNote) {
                                            queryParams.set('initialNotes', quoteNote);
                                        }

                                        queryParams.set('jobId', job.id);

                                        // Use Quote Media if available (not Vehicle/Job Media)
                                        // Aggregate global quote photos and per-item photos to ensure all relevant context is passed
                                        const quoteGlobalPhotos = quoteArgs?.photos || quoteArgs?.metadata?.photos || [];
                                        const quoteItemPhotos = (quoteArgs?.items || []).flatMap((i: any) => i.images || (i.image ? [i.image] : [])).filter(Boolean);

                                        // Combine and deduplicate
                                        const allQuotePhotos = Array.from(new Set([...quoteGlobalPhotos, ...quoteItemPhotos]));

                                        if (allQuotePhotos.length > 0) {
                                            queryParams.set('initialPhotos', JSON.stringify(allQuotePhotos));
                                        }

                                        // Prioritize global voice note, then fall back to first item's voice note
                                        const quoteGlobalVoice = quoteArgs?.voiceNote || quoteArgs?.metadata?.voiceNote;
                                        const quoteItemVoice = (quoteArgs?.items || []).find((i: any) => i.voiceNote)?.voiceNote;
                                        const voiceToSend = quoteGlobalVoice || quoteItemVoice;

                                        if (voiceToSend) {
                                            queryParams.set('initialVoiceNote', voiceToSend);
                                        }

                                        // Strictly ensure NO job/vehicle photos are passed here validation
                                        // (The above logic only pulls from quoteArgs)

                                        if (job.partsSource) {
                                            queryParams.set('partsSource', job.partsSource);
                                        }
                                        if (job.vehicle) {
                                            queryParams.set('vehicleId', typeof job.vehicle === 'object' ? (job.vehicle._id || job.vehicle.id) : job.vehicle);
                                        }

                                        router.push(`/(customer)/(tabs)/request-product?${queryParams.toString()}` as any);
                                    }}
                                    style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        backgroundColor: job.partsSource === 'customer' ? '#FF950015' : colors.primary + '15',
                                        paddingHorizontal: 12,
                                        paddingVertical: 6,
                                        borderRadius: 12,
                                        borderWidth: job.partsSource === 'customer' ? 1.5 : 0,
                                        borderColor: '#FF950040'
                                    }}
                                >
                                    <MaterialCommunityIcons
                                        name={job.partsSource === 'customer' ? "shopping-outline" : "cart-outline"}
                                        size={18}
                                        color={job.partsSource === 'customer' ? '#FF9500' : colors.primary}
                                    />
                                    <Text style={{
                                        fontSize: 12,
                                        fontFamily: 'NotoSans-Bold',
                                        color: job.partsSource === 'customer' ? '#FF9500' : colors.primary,
                                        marginLeft: 6
                                    }}>
                                        {job.partsSource === 'customer' ? (t('order_my_parts') || 'Order My Parts') : t('buy_parts')}
                                    </Text>
                                </TouchableOpacity>
                            )}
                        </View>

                        {/* Dedicated Service Fees Block */}
                        {displaySource.items?.some((item: any) => {
                            const desc = (item.description || '').toLowerCase();
                            return desc.includes('service fee') || desc.includes('pickup fee');
                        }) && (
                                <View style={{ backgroundColor: isDark ? '#2C2C2E' : '#F8F9FE', borderRadius: 16, padding: 12, marginBottom: 15 }}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                                        <Ionicons name="construct-outline" size={14} color={colors.primary} />
                                        <Text style={{ fontSize: 12, fontFamily: 'NotoSans-Bold', color: colors.primary, textTransform: 'uppercase' }}>Service Mode & Fees</Text>
                                    </View>
                                    {displaySource.items?.filter((item: any, idx: number, self: any[]) => {
                                        const desc = (item.description || '').toLowerCase();
                                        if (desc.includes('service fee') || desc.includes('pickup fee')) {
                                            return self.findIndex(i => (i.description || '').toLowerCase() === desc) === idx;
                                        }
                                        return false;
                                    }).map((item: any, index: number) => (
                                        <View key={`fee-${index}`} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4 }}>
                                            <Text style={{ color: colors.text, fontSize: 14, fontFamily: 'NotoSans-Medium' }}>{item.description}</Text>
                                            <Text style={{ color: colors.text, fontSize: 14, fontFamily: 'NotoSans-Bold' }}>
                                                {currencySymbol}{(item.total || 0).toFixed(2)}
                                            </Text>
                                        </View>
                                    ))}
                                </View>
                            )}

                        {/* Regular Items / Parts List */}
                        {(displaySource.items || []).filter((item: any) => {
                            const desc = (item.description || '').toLowerCase();
                            return !desc.includes('service fee') && !desc.includes('pickup fee');
                        }).map((item: any, idx: number) => {
                            const parsed = parseDescription(item.description);
                            let displayName = parsed.displayName || item.description || '';
                            const { photoUri, voiceUri } = parsed;
                            const isNote = item.unitPrice === 0;

                            // Explicit fields from the item object
                            const brand = item.brand || (item.product as any)?.brand;
                            const partNo = item.partNumber || (item.product as any)?.partNumber;

                            return (
                                <View key={item.id || idx} style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12, borderBottomWidth: 1, borderBottomColor: colors.border, paddingBottom: 8 }}>
                                    <View style={{ flex: 1, paddingRight: 10 }}>
                                        <Text style={{ fontSize: 14, fontFamily: 'NotoSans-Bold', color: colors.text }}>{displayName}</Text>
                                        <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap', marginTop: 2 }}>
                                            {brand && <Text style={{ fontSize: 11, color: colors.icon, backgroundColor: isDark ? '#333' : '#F0F0F0', paddingHorizontal: 4, borderRadius: 4 }}>{brand}</Text>}
                                            {partNo && <Text style={{ fontSize: 11, color: colors.icon }}>PN: {partNo}</Text>}
                                        </View>
                                        <View style={{ gap: 6, marginTop: 4 }}>
                                            {/* Media Previews */}
                                            {((parsed.photoUri || (item.images && item.images.length > 0))) && (
                                                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexDirection: 'row' }}>
                                                    {parsed.photoUri && (
                                                        <TouchableOpacity onPress={() => setSelectedImage(getMediaUrl(parsed.photoUri!))} style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.primary + '10', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, marginRight: 8 }}>
                                                            <Ionicons name="image" size={12} color={colors.primary} />
                                                            <Text style={{ fontSize: 11, color: colors.primary, marginLeft: 4, fontFamily: 'NotoSans-Bold' }}>View Photo</Text>
                                                        </TouchableOpacity>
                                                    )}
                                                    {item.images && item.images.map((img: string, i: number) => (
                                                        <TouchableOpacity key={i} onPress={() => setSelectedImage(getMediaUrl(img))} style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.primary + '10', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, marginRight: 8 }}>
                                                            <Ionicons name="image" size={12} color={colors.primary} />
                                                            <Text style={{ fontSize: 11, color: colors.primary, marginLeft: 4, fontFamily: 'NotoSans-Bold' }}>Photo {i + 1}</Text>
                                                        </TouchableOpacity>
                                                    ))}
                                                </ScrollView>
                                            )}

                                            {parsed.voiceUri && <View style={{ width: 220, marginTop: 4 }}><AudioPlayer uri={parsed.voiceUri} /></View>}
                                            {item.voiceNote && <View style={{ width: 220, marginTop: 4 }}><AudioPlayer uri={item.voiceNote} /></View>}

                                            {!isNote && item.quantity > 1 && <Text style={{ fontSize: 11, color: colors.icon, marginTop: 2 }}>{item.quantity} units @ {currencySymbol}{(item.unitPrice || 0).toFixed(2)}</Text>}
                                        </View>
                                    </View>
                                    <View style={{ alignItems: 'flex-end' }}>
                                        {isNote ? <View style={{ backgroundColor: colors.border, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 }}><Text style={{ fontSize: 10, fontFamily: 'NotoSans-Bold', color: colors.text }}>NOTE</Text></View> : <Text style={{ fontSize: 14, fontFamily: 'NotoSans-Bold', color: colors.text }}>{currencySymbol}{(item.total || 0).toFixed(2)}</Text>}
                                    </View>
                                </View>
                            );
                        })}
                        <View style={{ height: 1, backgroundColor: colors.border, marginVertical: 10 }} />
                        <View style={{ gap: 8 }}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                <Text style={{ fontSize: 14, color: colors.icon, fontFamily: 'NotoSans-Medium' }}>{t('labor_charges')}</Text>
                                <Text style={{ fontSize: 14, color: colors.text, fontFamily: 'NotoSans-Bold' }}>{currencySymbol}{(displaySource.laborAmount || 0).toFixed(2)}</Text>
                            </View>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
                                <Text style={{ fontSize: 16, color: colors.text, fontFamily: 'NotoSans-Bold' }}>{isBillView ? t('Total Amount') : t('Total Estimate')}</Text>
                                <Text style={{ fontSize: 18, color: colors.primary, fontFamily: 'NotoSans-Black' }}>{currencySymbol}{(displaySource.totalAmount || 0).toFixed(2)}</Text>
                            </View>
                        </View>
                    </View>
                )}

                {/* 3. Action Required: Quote Review */}
                {job.status === 'quote_pending' && job.quote && (
                    <View style={[styles.actionCard, { backgroundColor: colors.card, borderColor: colors.primary, shadowColor: colors.primary }]}>
                        <View style={styles.actionHeader}>
                            <Ionicons name="alert-circle" size={24} color={colors.primary} />
                            <Text style={[styles.actionTitle, { color: colors.text }]}>{t('Review Estimate')}</Text>
                        </View>
                        <Text style={[styles.actionBody, { color: colors.icon }]}>{t('Technician has assessed the vehicle. Please review to proceed.')}</Text>

                        <View style={[styles.miniInvoice, { backgroundColor: isDark ? '#ffffff10' : '#F9F9F9' }]}>
                            <Text style={{ fontSize: 14, fontFamily: 'NotoSans-Bold', color: colors.text, marginBottom: 12 }}>Quote Details</Text>

                            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12, padding: 8, backgroundColor: partsSource === 'customer_own' ? (isDark ? '#FF950020' : '#FFF3E0') : (isDark ? '#34C75920' : '#E8F5E9'), borderRadius: 8 }}>
                                <Ionicons name={partsSource === 'customer_own' ? 'person' : 'build'} size={16} color={partsSource === 'customer_own' ? '#FF9500' : '#34C759'} />
                                <Text style={{ fontSize: 12, fontFamily: 'NotoSans-Bold', color: partsSource === 'customer_own' ? '#FF9500' : '#34C759', marginLeft: 6 }}>{partsSource === 'customer_own' ? 'Customer Provided Parts' : 'Technician Sourced Parts'}</Text>
                            </View>

                            {/* Service Fees Block */}
                            {job.quote?.items?.some((item: any) => {
                                const desc = (item.description || '').toLowerCase();
                                return desc.includes('service fee') || desc.includes('pickup fee');
                            }) && (
                                    <View style={{ backgroundColor: isDark ? '#ffffff10' : '#F0F0F0', borderRadius: 12, padding: 12, marginBottom: 15 }}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                                            <Ionicons name="construct-outline" size={14} color={colors.primary} />
                                            <Text style={{ fontSize: 12, fontFamily: 'NotoSans-Bold', color: colors.primary, textTransform: 'uppercase' }}>Service Mode & Fees</Text>
                                        </View>
                                        {job.quote.items.filter((item: any, idx: number, self: any[]) => {
                                            const desc = (item.description || '').toLowerCase();
                                            if (desc.includes('service fee') || desc.includes('pickup fee')) {
                                                return self.findIndex(i => (i.description || '').toLowerCase() === desc) === idx;
                                            }
                                            return false;
                                        }).map((item: any, index: number) => (
                                            <View key={`quote-fee-${index}`} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4 }}>
                                                <Text style={{ color: colors.text, fontSize: 13, fontFamily: 'NotoSans-Medium' }}>{item.description}</Text>
                                                <Text style={{ color: colors.text, fontSize: 13, fontFamily: 'NotoSans-Bold' }}>
                                                    {currencySymbol}{(item.total || 0).toFixed(2)}
                                                </Text>
                                            </View>
                                        ))}
                                    </View>
                                )}

                            {(job.quote?.items || []).filter((item: any) => {
                                const desc = (item.description || '').toLowerCase();
                                return !desc.includes('service fee') && !desc.includes('pickup fee');
                            }).map((item: any, idx: number) => {
                                const parsed = parseDescription(item.description);
                                const displayName = parsed.displayName || 'Item';
                                const hasMedia = parsed.photoUri || parsed.voiceUri;
                                const isCustom = item.isCustom || (item.quantity === 1 && (hasMedia || parsed.cleaned.length > 20 || !item.product));
                                const isNote = item.isNote || item.unitPrice === 0;

                                // Logic for brand/part details
                                const brand = item.brand || (item.product as any)?.brand;
                                const partNo = item.partNumber || (item.product as any)?.partNumber;

                                return (
                                    <View key={item.id || idx} style={{ marginBottom: 16, borderLeftWidth: 3, borderLeftColor: isCustom ? colors.primary : colors.sales, paddingLeft: 12, opacity: (partsSource === 'customer_own' && !isNote) ? 0.6 : 1 }}>
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                            <View style={{ flex: 1, paddingRight: 8 }}>
                                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                                                    <View style={{ backgroundColor: isCustom ? colors.primary + '15' : colors.sales + '15', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                                                        <Text style={{ fontSize: 9, fontFamily: 'NotoSans-Black', color: isCustom ? colors.primary : colors.sales }}>
                                                            {isCustom ? 'CUSTOM REQUEST' : (isNote ? 'GENERAL NOTE' : 'STANDARD PART')}
                                                        </Text>
                                                    </View>
                                                    {brand && <Text style={{ fontSize: 10, fontFamily: 'NotoSans-Bold', color: colors.icon }}>{brand}</Text>}
                                                </View>

                                                <Text style={[styles.invoiceLabel, { color: (partsSource === 'customer_own' && !isNote) ? colors.icon : colors.text, fontSize: 14, lineHeight: 20, fontFamily: 'NotoSans-Bold', textDecorationLine: (partsSource === 'customer_own' && !isNote) ? 'line-through' : 'none' }]}>
                                                    {displayName}
                                                    {item.quantity > 1 && <Text style={{ fontSize: 12, color: colors.icon, fontFamily: 'NotoSans-Medium' }}>  x{item.quantity}</Text>}
                                                </Text>

                                                {partsSource === 'customer_own' && !isNote && (
                                                    <Text style={{ fontSize: 10, color: colors.primary, fontFamily: 'NotoSans-Bold', marginTop: 2 }}>{t('you_will_provide_this')}</Text>
                                                )}

                                                {partNo && <Text style={{ fontSize: 10, color: colors.icon, marginTop: 2 }}>P/N: {partNo}</Text>}
                                                {parsed.displayNotes ? <Text style={{ fontSize: 11, color: colors.icon, marginTop: 4, lineHeight: 16, borderTopWidth: 0.5, borderTopColor: colors.border, paddingTop: 4 }}>{parsed.displayNotes}</Text> : null}
                                            </View>
                                            <View style={{ alignItems: 'flex-end' }}>
                                                <Text style={[styles.invoiceValue, {
                                                    color: isNote ? colors.icon : ((partsSource === 'customer_own' && !isNote) ? colors.icon : colors.text),
                                                    fontSize: 14,
                                                    fontFamily: 'NotoSans-Black'
                                                }]}>
                                                    {isNote ? 'NOTE' : (partsSource === 'customer_own' ? '---' : `${currencySymbol}${(item.total || 0).toFixed(2)}`)}
                                                </Text>
                                            </View>
                                        </View>

                                        {/* Individual Item Media Attachments */}
                                        {((item.images && item.images.length > 0) || item.voiceNote || parsed.photoUri || parsed.voiceUri) && (
                                            <View style={{ marginTop: 10, gap: 10 }}>
                                                {/* Images Section */}
                                                {((item.images && item.images.length > 0) || parsed.photoUri) && (
                                                    <ScrollView
                                                        horizontal
                                                        showsHorizontalScrollIndicator={false}
                                                        contentContainerStyle={{ alignItems: 'center', paddingVertical: 4 }}
                                                    >
                                                        {/* Legacy Parsed Photo */}
                                                        {parsed.photoUri && (
                                                            <TouchableOpacity onPress={() => setSelectedImage(getMediaUrl(parsed.photoUri!))} style={{ marginRight: 10 }}>
                                                                <Image
                                                                    source={{ uri: getMediaUrl(parsed.photoUri) || '' }}
                                                                    style={{ width: 60, height: 60, borderRadius: 10, backgroundColor: colors.border, borderWidth: 1, borderColor: colors.border }}
                                                                />
                                                            </TouchableOpacity>
                                                        )}
                                                        {/* New Array Images */}
                                                        {item.images?.map((img: string, i: number) => (
                                                            <TouchableOpacity key={`img-${i}`} onPress={() => setSelectedImage(getMediaUrl(img))} style={{ marginRight: 10 }}>
                                                                <Image
                                                                    source={{ uri: getMediaUrl(img) || '' }}
                                                                    style={{ width: 60, height: 60, borderRadius: 10, backgroundColor: colors.border, borderWidth: 1, borderColor: colors.border }}
                                                                />
                                                            </TouchableOpacity>
                                                        ))}
                                                    </ScrollView>
                                                )}

                                                {/* Voice Notes Section */}
                                                {(item.voiceNote || parsed.voiceUri) && (
                                                    <View style={{ gap: 8 }}>
                                                        {parsed.voiceUri && (
                                                            <View style={{ height: 40, justifyContent: 'center', backgroundColor: colors.background, borderRadius: 12, paddingHorizontal: 8 }}>
                                                                <AudioPlayer uri={parsed.voiceUri} />
                                                            </View>
                                                        )}
                                                        {item.voiceNote && (
                                                            <View style={{ height: 40, justifyContent: 'center', backgroundColor: colors.background, borderRadius: 12, paddingHorizontal: 8 }}>
                                                                <AudioPlayer uri={item.voiceNote} />
                                                            </View>
                                                        )}
                                                    </View>
                                                )}
                                            </View>
                                        )}
                                    </View>
                                );
                            })}

                            <View style={{ height: 1, backgroundColor: colors.border, marginVertical: 10 }} />

                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 }}>
                                <Text style={{ fontSize: 14, color: colors.icon, fontFamily: 'NotoSans-Medium' }}>{t('labor_charges')}</Text>
                                <Text style={{ fontSize: 14, color: colors.text, fontFamily: 'NotoSans-Bold' }}>{currencySymbol}{(job.quote?.laborAmount || 0).toFixed(2)}</Text>
                            </View>

                            <View style={[styles.invoiceRow, { borderTopWidth: 1, borderTopColor: colors.border, marginTop: 5, paddingTop: 5 }]}>
                                <Text style={[styles.invoiceLabel, { fontFamily: 'NotoSans-Bold', color: colors.text }]}>{t('Total Estimate')}</Text>
                                <Text style={[styles.invoiceValue, { fontSize: 16, color: colors.primary }]}>
                                    {currencySymbol}
                                    {(
                                        (job.quote?.items || []).reduce((acc: number, i: any) => {
                                            const isNote = i.isNote || i.unitPrice === 0;
                                            // Exclude notes from total always
                                            if (isNote) return acc;
                                            // Also exclude customer-provided parts
                                            if (partsSource === 'customer_own') return acc;
                                            return acc + (i.total || 0);
                                        }, 0) + (job.quote?.laborAmount || 0)
                                    ).toFixed(2)}
                                </Text>
                            </View>

                            {/* Section for Librarian/Technician Metadata (Notes, Photos, Audio) */}
                            {(job.quote?.note || (job.quote?.photos && job.quote.photos.length > 0) || job.quote?.voiceNote) && (
                                <View style={{ marginTop: 20, padding: 12, backgroundColor: isDark ? colors.primary + '10' : colors.primary + '05', borderRadius: 12, borderWidth: 1, borderColor: colors.primary + '20' }}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 6 }}>
                                        <Ionicons name="chatbox-ellipses" size={18} color={colors.primary} />
                                        <Text style={{ fontSize: 14, fontFamily: 'NotoSans-Bold', color: colors.primary }}>Technician's Comments</Text>
                                    </View>

                                    {job.quote?.note && <Text style={{ fontSize: 13, color: colors.text, lineHeight: 18, marginBottom: 12 }}>{job.quote.note}</Text>}

                                    {job.quote?.photos && job.quote.photos.length > 0 && (
                                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: job.quote?.voiceNote ? 12 : 0 }}>
                                            {job.quote.photos.map((photo: string, pIdx: number) => (
                                                <TouchableOpacity key={pIdx} onPress={() => setSelectedImage(getMediaUrl(photo))} style={{ marginRight: 10 }}>
                                                    <Image source={{ uri: getMediaUrl(photo) || '' }} style={{ width: 80, height: 80, borderRadius: 10, backgroundColor: colors.border }} />
                                                </TouchableOpacity>
                                            ))}
                                        </ScrollView>
                                    )}

                                    {job.quote?.voiceNote && (
                                        <View style={{ backgroundColor: colors.background, borderRadius: 10, padding: 8 }}>
                                            <AudioPlayer uri={job.quote.voiceNote} />
                                        </View>
                                    )}
                                </View>
                            )}
                        </View>
                        <View style={styles.actionButtons}>
                            <AppButton title={t('Reject')} onPress={handleReject} variant="danger" style={{ flex: 1 }} />
                            <AppButton title={t('Approve Work')} onPress={() => setApprovalModalVisible(true)} variant="primary" style={{ flex: 2 }} />
                        </View>
                    </View>
                )}

                {/* 4. Action Required: Final Bill */}
                {(job.status === 'billing_pending' || job.status === 'vehicle_delivered' || job.status === 'completed' || job.status === 'payment_pending_cash') && (
                    <View style={[styles.premiumPaymentCard, { backgroundColor: colors.card, borderColor: isDark ? colors.sales + '40' : colors.sales + '20' }]}>
                        {!job.bill ? (
                            <View style={{ padding: 20, alignItems: 'center' }}>
                                <ActivityIndicator size="small" color={colors.primary} />
                                <Text style={{ marginTop: 10, color: colors.icon, fontFamily: 'NotoSans-Bold' }}>{t('Generating Invoice...') || 'Generating Invoice...'}</Text>
                            </View>
                        ) : (
                            <>
                                {/* Header with Secure Badge */}
                                <View style={styles.paymentHeader}>
                                    <View style={[styles.paymentIconCircle, { backgroundColor: colors.sales + '15' }]}>
                                        <Ionicons name="receipt" size={20} color={colors.sales} />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={[styles.paymentHeading, { color: colors.text }]}>Service Invoice</Text>
                                        <View style={styles.secureRow}>
                                            <Ionicons name="shield-checkmark" size={12} color="#34C759" />
                                            <Text style={styles.secureBadgeText}>SECURE CHECKOUT</Text>
                                        </View>
                                    </View>
                                    <View style={[styles.statusBadgeCapsule, { backgroundColor: job.bill.status === 'paid' ? '#34C75915' : colors.sales + '15' }]}>
                                        <Text style={[styles.statusBadgeText, { color: job.bill.status === 'paid' ? '#34C759' : colors.sales }]}>
                                            {job.bill.status === 'paid' ? 'PAID' : 'DUE'}
                                        </Text>
                                    </View>
                                </View>

                                <View style={[styles.amountContainer, { borderBottomColor: colors.border, justifyContent: 'center', paddingBottom: 25 }]}>
                                    <View style={{ alignItems: 'center' }}>
                                        <Text style={[styles.amountLabel, { color: colors.icon }]}>Total Amount To Pay</Text>
                                        <Text style={[styles.amountValue, { color: colors.text, fontSize: 36 }]}>{currencySymbol}{job.bill.totalAmount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</Text>
                                    </View>
                                </View>

                                <View style={styles.paymentBody}>
                                    {job.status === 'billing_pending' ? (
                                        <View style={[styles.handoverStatusBox, { backgroundColor: isDark ? colors.warning + '10' : '#FFF9E6', borderColor: colors.warning + '30' }]}>
                                            <View style={styles.statusBoxIcon}>
                                                <MaterialCommunityIcons name="car-key" size={24} color={colors.warning} />
                                            </View>
                                            <View style={{ flex: 1 }}>
                                                <Text style={[styles.statusBoxTitle, { color: colors.warning }]}>Handover in Progress</Text>
                                                <Text style={styles.statusBoxDesc}>Once the technician returns your vehicle, the payment option will be enabled.</Text>
                                            </View>
                                        </View>
                                    ) : job.bill.status === 'paid' ? (
                                        <View style={styles.successState}>
                                            <View style={styles.checkmarkCircle}>
                                                <Ionicons name="checkmark" size={32} color="#34C759" />
                                            </View>
                                            <Text style={[styles.successTitle, { color: colors.text }]}>Payment Completed</Text>
                                            <Text style={[styles.successSubtitle, { color: colors.icon }]}>Transaction ID: TXN-{job.id.slice(-6).toUpperCase()}</Text>
                                            <TouchableOpacity
                                                style={styles.viewReceiptBtn}
                                                onPress={() => router.push({ pathname: '/(customer)/booking/invoice', params: { id: job.id } })}
                                            >
                                                <Ionicons name="download-outline" size={16} color={colors.primary} />
                                                <Text style={[styles.viewReceiptText, { color: colors.primary }]}>Download Receipt</Text>
                                            </TouchableOpacity>
                                        </View>
                                    ) : (
                                        <>
                                            {/* Itemized Bill Breakdown */}
                                            {job.bill?.items && job.bill.items.length > 0 && (
                                                <View style={{ marginBottom: 20 }}>
                                                    <Text style={{ fontSize: 14, fontFamily: 'NotoSans-Bold', color: colors.text, marginBottom: 12 }}>Bill Details</Text>

                                                    {/* Service Fees Block */}
                                                    {job.bill.items.some((item: any) => {
                                                        const desc = (item.description || '').toLowerCase();
                                                        return desc.includes('service fee') || desc.includes('pickup fee');
                                                    }) && (
                                                            <View style={{ backgroundColor: isDark ? '#ffffff10' : '#F4F4F4', borderRadius: 12, padding: 12, marginBottom: 15 }}>
                                                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                                                                    <Ionicons name="construct-outline" size={14} color={colors.primary} />
                                                                    <Text style={{ fontSize: 12, fontFamily: 'NotoSans-Bold', color: colors.primary, textTransform: 'uppercase' }}>Service Mode & Fees</Text>
                                                                </View>
                                                                {job.bill.items.filter((item: any, idx: number, self: any[]) => {
                                                                    const desc = (item.description || '').toLowerCase();
                                                                    if (desc.includes('service fee') || desc.includes('pickup fee')) {
                                                                        return self.findIndex(i => (i.description || '').toLowerCase() === desc) === idx;
                                                                    }
                                                                    return false;
                                                                }).map((item: any, index: number) => (
                                                                    <View key={`bill-fee-${index}`} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4 }}>
                                                                        <Text style={{ color: colors.text, fontSize: 13, fontFamily: 'NotoSans-Medium' }}>{item.description}</Text>
                                                                        <Text style={{ color: colors.text, fontSize: 13, fontFamily: 'NotoSans-Bold' }}>
                                                                            {currencySymbol}{(item.total || 0).toFixed(2)}
                                                                        </Text>
                                                                    </View>
                                                                ))}
                                                            </View>
                                                        )}

                                                    {/* Parts & Tasks list */}
                                                    {job.bill.items.filter((item: any) => {
                                                        const desc = (item.description || '').toLowerCase();
                                                        return !desc.includes('service fee') && !desc.includes('pickup fee');
                                                    }).map((item: any, idx: number) => {
                                                        const parsed = parseDescription(item.description);
                                                        const displayName = parsed.displayName || 'Item';
                                                        const hasMedia = parsed.photoUri || parsed.voiceUri;
                                                        const isCustom = item.isCustom || (item.quantity === 1 && (hasMedia || parsed.cleaned.length > 20 || !item.product));
                                                        const isNote = item.isNote || item.unitPrice === 0;

                                                        const brand = item.brand || (item.product as any)?.brand;
                                                        const partNo = item.partNumber || (item.product as any)?.partNumber;

                                                        return (
                                                            <View key={item.id || idx} style={{ marginBottom: 16, borderLeftWidth: 3, borderLeftColor: isCustom ? colors.primary : colors.sales, paddingLeft: 12 }}>
                                                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                                    <View style={{ flex: 1, paddingRight: 8 }}>
                                                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                                                                            <View style={{ backgroundColor: isCustom ? colors.primary + '15' : colors.sales + '15', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                                                                                <Text style={{ fontSize: 9, fontFamily: 'NotoSans-Black', color: isCustom ? colors.primary : colors.sales }}>
                                                                                    {isCustom ? 'CUSTOM REQUEST' : (isNote ? 'GENERAL NOTE' : 'STANDARD PART')}
                                                                                </Text>
                                                                            </View>
                                                                            {brand && <Text style={{ fontSize: 10, fontFamily: 'NotoSans-Bold', color: colors.icon }}>{brand}</Text>}
                                                                        </View>

                                                                        <Text style={{ fontSize: 14, lineHeight: 20, fontFamily: 'NotoSans-Bold', color: colors.text }}>
                                                                            {displayName}
                                                                            {item.quantity > 1 && <Text style={{ fontSize: 12, color: colors.icon, fontFamily: 'NotoSans-Medium' }}>  x{item.quantity}</Text>}
                                                                        </Text>

                                                                        {partNo && <Text style={{ fontSize: 10, color: colors.icon, marginTop: 2 }}>P/N: {partNo}</Text>}
                                                                        {!isNote && item.quantity > 1 && <Text style={{ fontSize: 11, color: colors.icon, marginTop: 2 }}>{item.quantity} units @ {currencySymbol}{(item.unitPrice || 0).toFixed(2)}</Text>}
                                                                        {parsed.displayNotes ? <Text style={{ fontSize: 11, color: colors.icon, marginTop: 4, lineHeight: 16, borderTopWidth: 0.5, borderTopColor: colors.border, paddingTop: 4 }}>{parsed.displayNotes}</Text> : null}
                                                                    </View>
                                                                    <View style={{ alignItems: 'flex-end' }}>
                                                                        <Text style={{ fontSize: 14, fontFamily: 'NotoSans-Black', color: isNote ? colors.icon : colors.text }}>
                                                                            {isNote ? 'NOTE' : `${currencySymbol}${(item.total || 0).toFixed(2)}`}
                                                                        </Text>
                                                                    </View>
                                                                </View>

                                                                {/* Individual Item Media Attachments */}
                                                                {((item.images && item.images.length > 0) || item.voiceNote || parsed.photoUri || parsed.voiceUri) && (
                                                                    <View style={{ marginTop: 10, gap: 10 }}>
                                                                        {(item.images && item.images.length > 0) && (
                                                                            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                                                                {item.images.map((img: string, imgIdx: number) => (
                                                                                    <TouchableOpacity key={imgIdx} onPress={() => setSelectedImage(getMediaUrl(img))} style={{ marginRight: 8 }}>
                                                                                        <Image source={{ uri: getMediaUrl(img) || '' }} style={{ width: 60, height: 60, borderRadius: 8, backgroundColor: colors.border }} />
                                                                                    </TouchableOpacity>
                                                                                ))}
                                                                            </ScrollView>
                                                                        )}
                                                                        {item.voiceNote && (
                                                                            <View style={{ backgroundColor: isDark ? '#ffffff05' : '#F9F9F9', borderRadius: 8, padding: 8 }}>
                                                                                <AudioPlayer uri={item.voiceNote} />
                                                                            </View>
                                                                        )}
                                                                        {parsed.photoUri && (
                                                                            <TouchableOpacity onPress={() => setSelectedImage(getMediaUrl(parsed.photoUri!))}>
                                                                                <Image source={{ uri: getMediaUrl(parsed.photoUri) || '' }} style={{ width: 60, height: 60, borderRadius: 8, backgroundColor: colors.border }} />
                                                                            </TouchableOpacity>
                                                                        )}
                                                                        {parsed.voiceUri && (
                                                                            <View style={{ backgroundColor: isDark ? '#ffffff05' : '#F9F9F9', borderRadius: 8, padding: 8 }}>
                                                                                <AudioPlayer uri={parsed.voiceUri} />
                                                                            </View>
                                                                        )}
                                                                    </View>
                                                                )}
                                                            </View>
                                                        );
                                                    })}

                                                    <View style={{ height: 1, backgroundColor: colors.border, marginVertical: 10 }} />

                                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 }}>
                                                        <Text style={{ fontSize: 14, color: colors.icon, fontFamily: 'NotoSans-Medium' }}>{t('labor_charges')}</Text>
                                                        <Text style={{ fontSize: 14, color: colors.text, fontFamily: 'NotoSans-Bold' }}>{currencySymbol}{(job.bill.laborAmount || 0).toFixed(2)}</Text>
                                                    </View>

                                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: colors.border, marginTop: 5, paddingTop: 5 }}>
                                                        <Text style={{ fontFamily: 'NotoSans-Bold', color: colors.text }}>Total Amount</Text>
                                                        <Text style={{ fontSize: 16, color: colors.primary, fontFamily: 'NotoSans-Black' }}>
                                                            {currencySymbol}
                                                            {(
                                                                (job.bill.items || []).reduce((acc: number, i: any) => {
                                                                    const isNote = i.isNote || i.unitPrice === 0;
                                                                    if (isNote) return acc;
                                                                    return acc + (i.total || 0);
                                                                }, 0) + (job.bill.laborAmount || 0)
                                                            ).toFixed(2)}
                                                        </Text>
                                                    </View>
                                                </View>
                                            )}

                                            {/* Technician Bill Metadata (Notes, Photos, Audio) */}
                                            {(job.bill?.note || (job.bill?.photos && job.bill.photos.length > 0) || job.bill?.voiceNote) && (
                                                <View style={{ marginBottom: 20, padding: 12, backgroundColor: isDark ? colors.primary + '10' : colors.primary + '05', borderRadius: 12, borderWidth: 1, borderColor: colors.primary + '20' }}>
                                                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 6 }}>
                                                        <Ionicons name="chatbox-ellipses" size={18} color={colors.primary} />
                                                        <Text style={{ fontSize: 14, fontFamily: 'NotoSans-Bold', color: colors.primary }}>Technician's Final Notes</Text>
                                                    </View>

                                                    {job.bill?.note && <Text style={{ fontSize: 13, color: colors.text, lineHeight: 18, marginBottom: 12 }}>{job.bill.note}</Text>}

                                                    {job.bill?.photos && job.bill.photos.length > 0 && (
                                                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: job.bill?.voiceNote ? 12 : 0 }}>
                                                            {job.bill.photos.map((photo: string, pIdx: number) => (
                                                                <TouchableOpacity key={pIdx} onPress={() => setSelectedImage(getMediaUrl(photo))} style={{ marginRight: 10 }}>
                                                                    <Image source={{ uri: getMediaUrl(photo) || '' }} style={{ width: 80, height: 80, borderRadius: 10, backgroundColor: colors.border }} />
                                                                </TouchableOpacity>
                                                            ))}
                                                        </ScrollView>
                                                    )}

                                                    {job.bill?.voiceNote && (
                                                        <View style={{ backgroundColor: colors.background, borderRadius: 10, padding: 8 }}>
                                                            <AudioPlayer uri={job.bill.voiceNote} />
                                                        </View>
                                                    )}
                                                </View>
                                            )}

                                            {(job.status === 'vehicle_delivered' && !handoverConfirmed) ? (
                                                <View style={styles.handoverConfirmBox}>
                                                    <Text style={[styles.handoverSubtext, { color: colors.icon }]}>Confirm vehicle receipt to unlock payment</Text>
                                                    <TouchableOpacity
                                                        style={[styles.confirmHandoverBtn, { backgroundColor: colors.sales }]}
                                                        onPress={() => {
                                                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                                                            setHandoverConfirmed(true);
                                                        }}
                                                    >
                                                        <MaterialCommunityIcons name="gesture-double-tap" size={20} color="#FFF" />
                                                        <Text style={styles.confirmHandoverText}>Vehicle Received</Text>
                                                    </TouchableOpacity>
                                                </View>
                                            ) : job.status === 'payment_pending_cash' ? (
                                                <View style={styles.handoverConfirmBox}>
                                                    <View style={[styles.handoverStatusBox, { backgroundColor: isDark ? colors.sales + '10' : '#E8F5E9', borderColor: colors.sales + '30', padding: 15 }]}>
                                                        <View style={[styles.statusBoxIcon, { backgroundColor: colors.sales + '15' }]}>
                                                            <Ionicons name="cash-outline" size={24} color={colors.sales} />
                                                        </View>
                                                        <View style={{ flex: 1 }}>
                                                            <Text style={[styles.statusBoxTitle, { color: colors.sales, fontSize: 16 }]}>Waiting for Confirmation</Text>
                                                            <Text style={[styles.statusBoxDesc, { fontSize: 12 }]}>Cash payment chosen. Waiting for technician to confirm receipt of {currencySymbol}{job.bill.totalAmount}.</Text>
                                                        </View>
                                                    </View>
                                                    <TouchableOpacity
                                                        style={[styles.viewReceiptBtn, { marginTop: 20, width: '100%', justifyContent: 'center' }]}
                                                        onPress={handleCall}
                                                    >
                                                        <Ionicons name="call" size={16} color={colors.primary} />
                                                        <Text style={[styles.viewReceiptText, { color: colors.primary }]}>Call Technician</Text>
                                                    </TouchableOpacity>
                                                </View>
                                            ) : (
                                                <View style={{ gap: 20 }}>
                                                    <View style={styles.invoiceInfoRow}>
                                                        <View style={[styles.infoTag, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)' }]}>
                                                            <Ionicons name="time-outline" size={14} color={colors.icon} />
                                                            <Text style={[styles.infoTagText, { color: colors.icon }]}>
                                                                {job.bill?.createdAt ? new Date(job.bill.createdAt).toLocaleDateString() : 'Generated Now'}
                                                            </Text>
                                                        </View>
                                                        <View style={[styles.infoTag, { backgroundColor: isDark ? 'rgba(52,199,89,0.1)' : 'rgba(52,199,89,0.05)' }]}>
                                                            <Ionicons name="shield-checkmark" size={14} color="#34C759" />
                                                            <Text style={[styles.infoTagText, { color: "#34C759" }]}>Protected</Text>
                                                        </View>
                                                    </View>

                                                    <View style={styles.paymentSecurityInfo}>
                                                        <MaterialCommunityIcons name="security" size={16} color={colors.icon} opacity={0.6} />
                                                        <Text style={[styles.securityText, { color: colors.icon }]}>Your payment is held in escrow until you approve the service.</Text>
                                                    </View>

                                                    <View style={styles.actionButtonRow}>
                                                        <TouchableOpacity
                                                            style={[styles.disputeButton, { borderColor: colors.border, backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'transparent' }]}
                                                            onPress={() => {
                                                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                                                Alert.alert('Dispute Bill', 'Please speak with your technician regarding the bill concerns.', [{ text: 'Call Technician', onPress: handleCall }, { text: 'Cancel', style: 'cancel' }]);
                                                            }}
                                                        >
                                                            <Text style={[styles.disputeButtonText, { color: colors.text }]}>Dispute</Text>
                                                        </TouchableOpacity>

                                                        <TouchableOpacity
                                                            style={[styles.payMainButton, { backgroundColor: colors.sales }]}
                                                            onPress={() => {
                                                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                                                                setShowPaymentSimulator(true);
                                                            }}
                                                            activeOpacity={0.8}
                                                        >
                                                            <Text style={styles.payMainButtonText}>Pay Now</Text>
                                                            <View style={styles.payButtonIconCircle}>
                                                                <Ionicons name="arrow-forward" size={16} color={colors.sales} />
                                                            </View>
                                                        </TouchableOpacity>
                                                    </View>
                                                </View>
                                            )}
                                        </>
                                    )}
                                </View>
                            </>
                        )}
                    </View>
                )}

                {/* 5. Job Details */}
                <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, shadowColor: colors.text, marginTop: 20 }]}>
                    <Text style={[styles.cardTitle, { color: colors.text }]}>{t('service_details')}</Text>
                    <View style={styles.detailRow}>
                        <MaterialCommunityIcons name="garage" size={20} color={colors.icon} />
                        <View style={{ marginLeft: 10 }}>
                            <Text style={[styles.detailLabel, { color: colors.icon }]}>{t('provider')}</Text>
                            <Text style={[styles.detailValue, { color: colors.text }]}>{job.technician?.garageName || job.garageName || t('assigned_garage')}</Text>
                        </View>
                    </View>
                    <View style={styles.detailRow}>
                        <MaterialCommunityIcons name="account-wrench" size={20} color={colors.icon} />
                        <View style={{ marginLeft: 10 }}>
                            <Text style={[styles.detailLabel, { color: colors.icon }]}>{t('technician')}</Text>
                            <Text style={[styles.detailValue, { color: colors.text }]}>{job.technician?.fullName || job.technicianName || t('assigned_technician')}</Text>
                        </View>
                    </View>
                </View>
            </ScrollView>

            {/* Modals */}
            <Modal animationType="slide" transparent={true} visible={approvalModalVisible} onRequestClose={() => setApprovalModalVisible(false)}>
                <View style={styles.modalOverlay}>
                    <BlurView intensity={80} tint={isDark ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
                    <View style={[styles.modalContent, { backgroundColor: colors.card, paddingVertical: 35 }]}>
                        <View style={{ alignItems: 'center', marginBottom: 25 }}>
                            <View style={{ backgroundColor: colors.primary + '15', width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', marginBottom: 15 }}>
                                <MaterialCommunityIcons name="tools" size={30} color={colors.primary} />
                            </View>
                            <Text style={[styles.modalTitle, { color: colors.text, marginBottom: 5 }]}>Parts Procurement</Text>
                            <Text style={{ color: colors.icon, textAlign: 'center', paddingHorizontal: 20 }}>Decide who will source the necessary parts for your repair.</Text>
                        </View>

                        <TouchableOpacity
                            style={[styles.modalOption, { backgroundColor: partsSource === 'tech_inventory' ? colors.primary + '10' : 'transparent', borderColor: partsSource === 'tech_inventory' ? colors.primary : colors.border }]}
                            onPress={() => {
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                setPartsSource('tech_inventory');
                            }}
                        >
                            <View style={[styles.optionIcon, { backgroundColor: partsSource === 'tech_inventory' ? colors.primary : colors.border + '20' }]}>
                                <MaterialCommunityIcons name="shield-check" size={24} color={partsSource === 'tech_inventory' ? '#FFF' : colors.icon} />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={[styles.optionTitle, { color: colors.text }]}>Technician Sourced</Text>
                                <Text style={[styles.optionDesc, { color: colors.icon }]}>Ensures compatibility and quality warranty.</Text>
                            </View>
                            <Ionicons name={partsSource === 'tech_inventory' ? "radio-button-on" : "radio-button-off"} size={22} color={partsSource === 'tech_inventory' ? colors.primary : colors.border} />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.modalOption, { backgroundColor: partsSource === 'customer_own' ? colors.primary + '10' : 'transparent', borderColor: partsSource === 'customer_own' ? colors.primary : colors.border }]}
                            onPress={() => {
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                setPartsSource('customer_own');
                            }}
                        >
                            <View style={[styles.optionIcon, { backgroundColor: partsSource === 'customer_own' ? colors.primary : colors.border + '20' }]}>
                                <MaterialCommunityIcons name="account-details" size={24} color={partsSource === 'customer_own' ? '#FFF' : colors.icon} />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={[styles.optionTitle, { color: colors.text }]}>I Will Provide Parts</Text>
                                <Text style={[styles.optionDesc, { color: colors.icon }]}>You source specific parts, labor only by tech.</Text>
                            </View>
                            <Ionicons name={partsSource === 'customer_own' ? "radio-button-on" : "radio-button-off"} size={22} color={partsSource === 'customer_own' ? colors.primary : colors.border} />
                        </TouchableOpacity>

                        <AppButton
                            title="Confirm & Approve"
                            onPress={handleApproveConfirm}
                            loading={actionLoading}
                            style={{ marginTop: 30, height: 60 }}
                        />
                        <TouchableOpacity onPress={() => setApprovalModalVisible(false)} style={{ marginTop: 15, alignItems: 'center' }}>
                            <Text style={{ color: colors.icon, fontFamily: 'NotoSans-Bold' }}>Review Estimate Again</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            <Modal transparent visible={cancelModalVisible} animationType="slide">
                <View style={styles.modalOverlay}>
                    <BlurView intensity={20} style={StyleSheet.absoluteFill} />
                    <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
                        <Text style={[styles.modalTitle, { color: colors.text }]}>Cancel Job</Text>
                        <TextInput style={[styles.input, { color: colors.text, borderColor: colors.border }]} placeholder="Reason..." value={cancelReason} onChangeText={setCancelReason} multiline />
                        <AppButton title="Confirm Cancel" onPress={async () => { await cancelJob(job.id, cancelReason); setCancelModalVisible(false); }} variant="danger" style={{ marginTop: 20 }} />
                        <AppButton title="Back" onPress={() => setCancelModalVisible(false)} variant="ghost" />
                    </View>
                </View>
            </Modal>

            <Modal transparent visible={rateModalVisible} animationType="fade">
                <View style={styles.modalOverlay}>
                    <BlurView intensity={30} style={StyleSheet.absoluteFill} tint={isDark ? 'dark' : 'light'} />
                    <View style={[styles.modalContent, { backgroundColor: colors.card, borderTopColor: colors.primary, borderTopWidth: 4 }]}>
                        <View style={{ alignItems: 'center', marginBottom: 10 }}>
                            <View style={{ backgroundColor: colors.primary + '10', width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center' }}>
                                <Ionicons name="star" size={32} color={colors.primary} />
                            </View>
                        </View>
                        <Text style={[styles.modalTitle, { color: colors.text }]}>{t('rate_your_service')}</Text>
                        <Text style={{ fontSize: 14, textAlign: 'center', color: colors.icon, marginBottom: 20 }}>
                            {t('share_your_experience')}
                        </Text>

                        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 12, marginVertical: 20 }}>
                            {[1, 2, 3, 4, 5].map((star) => (
                                <TouchableOpacity
                                    key={star}
                                    onPress={() => {
                                        setRating(star);
                                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                    }}
                                >
                                    <Ionicons
                                        name={star <= rating ? "star" : "star-outline"}
                                        size={40}
                                        color={star <= rating ? "#FF9500" : colors.icon + '40'}
                                    />
                                </TouchableOpacity>
                            ))}
                        </View>

                        <TextInput
                            style={[styles.input, {
                                color: colors.text,
                                borderColor: colors.border,
                                backgroundColor: isDark ? colors.icon + '10' : '#F9F9F9',
                                height: 120,
                                textAlignVertical: 'top'
                            }]}
                            placeholder={t('review_placeholder')}
                            placeholderTextColor={colors.icon}
                            value={review}
                            onChangeText={setReview}
                            multiline
                        />

                        <View style={{ gap: 10, marginTop: 20 }}>
                            <AppButton
                                title={t('submit_rating')}
                                onPress={async () => {
                                    setActionLoading(true);
                                    try {
                                        await rateJob(job.id, rating, review);
                                        setRateModalVisible(false);
                                        Alert.alert(t('success'), t('rating_success'));
                                    } catch (e) {
                                        Alert.alert(t('error'), t('rating_error'));
                                    } finally {
                                        setActionLoading(false);
                                    }
                                }}
                                loading={actionLoading}
                            />
                            <TouchableOpacity
                                onPress={() => setRateModalVisible(false)}
                                style={{ padding: 10, alignItems: 'center' }}
                            >
                                <Text style={{ color: colors.icon, fontFamily: 'NotoSans-Bold' }}>{t('later')}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            <ImageModal visible={!!selectedImage} uri={selectedImage || ''} onClose={() => setSelectedImage(null)} />

            <PaymentSimulator
                visible={showPaymentSimulator}
                amount={job.bill?.totalAmount || 0}
                type="bill"
                jobId={job.id}
                walletBalance={profile?.walletBalance || 0}
                userData={{
                    name: profile?.fullName || (user as any)?.name || 'Customer',
                    email: (user as any)?.email || profile?.email || 'customer@vehical.app',
                    phone: user?.phoneNumber
                }}
                onSuccess={handlePaymentSuccess}
                onCancel={() => setShowPaymentSimulator(false)}
                onFailure={handlePaymentFailure}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    mapContainer: {
        height: 300,
        borderRadius: 24,
        overflow: 'hidden',
        marginBottom: 20,
        borderWidth: 1,
        elevation: 5,
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
    },
    map: {
        flex: 1,
    },
    mapHeader: {
        padding: 15,
        borderBottomWidth: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10
    },
    mapTitle: {
        fontSize: 16,
        fontFamily: 'NotoSans-Black',
    },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    scrollContent: { padding: 20, paddingBottom: 100 },
    headerContainer: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 100 },
    headerSafeArea: { paddingBottom: 10 },
    headerContent: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, height: 60 },
    backBtn: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
    headerTitle: { fontSize: 16, fontFamily: 'NotoSans-Black' },
    headerSub: { fontSize: 12, fontFamily: 'NotoSans-Bold' },
    helpBtn: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
    statusCard: { alignItems: 'center', marginBottom: 20 },
    statusTime: { fontSize: 12, marginTop: 5, fontFamily: 'NotoSans-Medium' },
    card: { padding: 20, borderRadius: 24, borderWidth: 1, marginBottom: 15, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 5 },
    cardTitle: { fontSize: 18, fontFamily: 'NotoSans-Black', marginBottom: 15 },
    actionCard: { padding: 20, borderRadius: 24, borderWidth: 2, marginBottom: 20, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.15, shadowRadius: 20, elevation: 8 },
    actionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 10 },
    actionTitle: { fontSize: 18, fontFamily: 'NotoSans-Black' },
    actionBody: { fontSize: 14, fontFamily: 'NotoSans-Medium', marginBottom: 15, lineHeight: 20 },
    miniInvoice: { padding: 15, borderRadius: 16, marginBottom: 15 },
    invoiceRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
    invoiceLabel: { fontSize: 14, fontFamily: 'NotoSans-Medium' },
    invoiceValue: { fontSize: 14, fontFamily: 'NotoSans-Bold' },
    finalAmountLabel: { fontSize: 14, marginBottom: 2 },
    finalAmountValue: { fontSize: 32, fontFamily: 'NotoSans-Black' },
    actionButtons: { flexDirection: 'row', gap: 10 },
    timeline: { gap: 0 },
    stepRow: { flexDirection: 'row', gap: 15 },
    stepIndicator: { alignItems: 'center', width: 20 },
    dot: { width: 12, height: 12, borderRadius: 6, zIndex: 1 },
    line: { width: 2, flex: 1, marginVertical: -2 },
    stepContent: { flex: 1, paddingBottom: 25 },
    stepLabel: { fontSize: 14, fontFamily: 'NotoSans-Bold' },
    detailRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
    detailLabel: { fontSize: 12, fontFamily: 'NotoSans-Bold' },
    detailValue: { fontSize: 14, fontFamily: 'NotoSans-Bold' },
    modalOverlay: { flex: 1, justifyContent: 'center', padding: 20 },
    modalContent: { padding: 25, borderRadius: 30, elevation: 10 },
    modalTitle: { fontSize: 22, fontFamily: 'NotoSans-Black', marginBottom: 10, textAlign: 'center' },
    modalSub: { fontSize: 14, textAlign: 'center', marginBottom: 20 },
    modalOption: { padding: 15, borderRadius: 15, borderWidth: 2, marginBottom: 10, flexDirection: 'row', alignItems: 'center', gap: 15 },
    radioCircle: { width: 20, height: 20, borderRadius: 10, borderWidth: 2 },
    optionTitle: { fontSize: 16, fontFamily: 'NotoSans-Bold' },
    optionDesc: { fontSize: 12 },
    optionIcon: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    input: { height: 100, borderWidth: 1, borderRadius: 15, padding: 15, marginTop: 10 },
    blob: { position: 'absolute', width: 200, height: 200, borderRadius: 100, opacity: 0.1, top: -50, right: -50 },
    waitingForReturn: { padding: 15, borderRadius: 15, borderWidth: 1, alignItems: 'center', marginBottom: 15, borderStyle: 'dashed' },
    waitingTitle: { fontSize: 16, fontFamily: 'NotoSans-Black', marginTop: 10 },
    waitingDesc: { fontSize: 13, textAlign: 'center', marginTop: 5, lineHeight: 18 },
    sectionTitle: { fontSize: 18, fontFamily: 'NotoSans-Black', marginBottom: 10 },

    // Premium Payment Card Styles
    premiumPaymentCard: { borderRadius: 28, padding: 22, borderWidth: 1, marginBottom: 20, elevation: 10, shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.12, shadowRadius: 24, shadowColor: '#000' },
    paymentHeader: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 20 },
    paymentIconCircle: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
    paymentHeading: { fontSize: 17, fontFamily: 'NotoSans-Black' },
    secureRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
    secureBadgeText: { fontSize: 9, fontFamily: 'NotoSans-Black', letterSpacing: 0.5, color: '#34C759' },
    statusBadgeCapsule: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 10 },
    statusBadgeText: { fontSize: 10, fontFamily: 'NotoSans-Black' },
    amountContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', paddingBottom: 18, borderBottomWidth: 1, marginBottom: 18 },
    amountLabel: { fontSize: 12, fontFamily: 'NotoSans-Bold', marginBottom: 4 },
    amountValue: { fontSize: 28, fontFamily: 'NotoSans-Black' },
    paymentBody: { gap: 10 },
    handoverStatusBox: { flexDirection: 'row', gap: 12, padding: 14, borderRadius: 16, borderWidth: 1 },
    statusBoxIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(255,149,0,0.1)', justifyContent: 'center', alignItems: 'center' },
    statusBoxTitle: { fontSize: 14, fontFamily: 'NotoSans-Black' },
    statusBoxDesc: { fontSize: 11, fontFamily: 'NotoSans-Medium', opacity: 0.7, marginTop: 2, lineHeight: 16 },
    successState: { alignItems: 'center', paddingVertical: 10 },
    checkmarkCircle: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#34C75915', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
    successTitle: { fontSize: 18, fontFamily: 'NotoSans-Black' },
    successSubtitle: { fontSize: 12, fontFamily: 'NotoSans-Medium', marginTop: 4 },
    viewReceiptBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 15, paddingVertical: 8, paddingHorizontal: 15, borderRadius: 10, backgroundColor: 'rgba(0,122,255,0.05)' },
    viewReceiptText: { fontSize: 13, fontFamily: 'NotoSans-Bold' },
    handoverConfirmBox: { alignItems: 'center', paddingVertical: 5 },
    handoverSubtext: { fontSize: 12, fontFamily: 'NotoSans-Medium', marginBottom: 15 },
    confirmHandoverBtn: { width: '100%', height: 50, borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, elevation: 4, shadowOpacity: 0.2 },
    confirmHandoverText: { color: '#FFF', fontSize: 15, fontFamily: 'NotoSans-Black' },
    invoiceInfoRow: { flexDirection: 'row', gap: 10 },
    infoTag: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(0,0,0,0.03)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    infoTagText: { fontSize: 10, fontFamily: 'NotoSans-Bold' },
    actionButtonRow: { flexDirection: 'row', gap: 12, marginTop: 8 },
    disputeButton: { flex: 1, height: 52, borderRadius: 16, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
    disputeButtonText: { fontSize: 14, fontFamily: 'NotoSans-Bold' },
    payMainButton: { flex: 2, height: 52, borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.2 },
    payMainButtonText: { color: '#FFF', fontSize: 16, fontFamily: 'NotoSans-Black' },
    paymentSecurityInfo: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(52,199,89,0.05)', padding: 12, borderRadius: 12 },
    securityText: { fontSize: 11, fontFamily: 'NotoSans-Medium', flex: 1, lineHeight: 16 },
    payButtonIconCircle: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center' },
    section: { marginBottom: 25 },
    timelineCard: {
        borderRadius: 20,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
});

export default function BookingDetailsScreen() {
    return (
        <ErrorBoundary>
            <BookingDetailsContent />
        </ErrorBoundary>
    );
}
