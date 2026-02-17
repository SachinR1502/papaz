import { AppButton } from '@/components/ui/AppButton';
import { AudioPlayer } from '@/components/ui/AudioPlayer';
import { ImageModal } from '@/components/ui/ImageModal';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { StatusStepper } from '@/components/ui/StatusStepper';
import { VehicleIcon } from '@/components/ui/VehicleIcon';
import { useAdmin } from '@/context/AdminContext';
import { useAuth } from '@/context/AuthContext';
import { useCall } from '@/context/CallContext';
import { useChat } from '@/context/ChatContext';
import { useLanguage } from '@/context/LanguageContext';
import { useTechnician } from '@/context/TechnicianContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { customerService } from '@/services/customerService';
import { socketService } from '@/services/socket';
import { technicianService } from '@/services/technicianService';
import { formatCurrency } from '@/utils/formatting';
import { getMediaUrl, parseDescription } from '@/utils/mediaHelpers';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
    Alert,
    Animated,
    Dimensions,
    Image,
    Linking,
    Modal,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export default function JobDetailsScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const { user } = useAuth();
    const { availableJobs, myJobs, acceptJob, markArrived, updateJobStatus, cancelJob, updateRequirementStatus, respondToPartRequest, refreshJobs } = useTechnician();
    const { createConversation } = useChat();
    const { startCall } = useCall();
    const [actionLoading, setActionLoading] = useState(false);
    const [showDemoModal, setShowDemoModal] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [cancellationReason, setCancellationReason] = useState('');
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const { settings } = useAdmin();
    const { t } = useLanguage();

    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const colors = {
        background: isDark ? '#000000' : '#FFFFFF',
        card: isDark ? '#1C1C1E' : '#FFFFFF',
        text: isDark ? '#FFFFFF' : '#1A1A1A',
        subText: isDark ? '#A1A1A6' : '#8E8E93',
        border: isDark ? '#2C2C2E' : '#F5F5F7',
        primary: '#FF6B00',
        iconBg: isDark ? '#2C2C2E' : '#FFFFFF',
        icon: isDark ? '#A1A1A6' : '#8E8E93',
        shadow: isDark ? '#000' : '#000',
        success: '#34C759',
        warning: '#FF9500',
        error: '#FF3B30',
        inputBg: isDark ? '#1C1C1E' : '#F8F9FE',
    };

    // Animation Refs
    const blob1Anim = useRef(new Animated.Value(0)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;

    // Local state for fetched job details
    const [fetchedJob, setFetchedJob] = useState<any>(null);

    const contextJob = [...availableJobs, ...myJobs].find(j => j.id === id);

    // Fetch full job details if context is incomplete
    useEffect(() => {
        const loadJobDetails = async () => {
            if (!id) return;

            // Check if context job has full vehicle data
            const hasFullVehicle = contextJob?.vehicle &&
                typeof contextJob.vehicle === 'object' &&
                !('length' in contextJob.vehicle) &&
                ('make' in contextJob.vehicle || 'model' in contextJob.vehicle);

            // If we have full data in context, use it
            if (hasFullVehicle && contextJob.customer) {
                console.log('[JobDetails] Using context job with full data');
                setFetchedJob(contextJob);
                return;
            }

            // Otherwise fetch full details
            try {
                console.log('[JobDetails] Fetching full job details for:', id);
                const fullJob = await technicianService.getJob(id);
                if (fullJob) {
                    console.log('[JobDetails] ✅ Full job data fetched');
                    setFetchedJob(fullJob);
                }
            } catch (e) {
                console.error('[JobDetails] ❌ Failed to fetch job details:', e);
            }
        };

        loadJobDetails();
    }, [id, contextJob]);

    // Merge fetched job with context status for real-time updates
    const job = useMemo(() => {
        if (!fetchedJob && !contextJob) return null;
        if (!contextJob) return fetchedJob;
        if (!fetchedJob) return contextJob;

        // Merge: Use fetched job as base, but override status from context for real-time updates
        return {
            ...fetchedJob,
            status: contextJob.status || fetchedJob.status,
        };
    }, [contextJob, fetchedJob]);

    useEffect(() => {
        Animated.parallel([
            Animated.loop(
                Animated.sequence([
                    Animated.timing(blob1Anim, { toValue: 1, duration: 6000, useNativeDriver: true }),
                    Animated.timing(blob1Anim, { toValue: 0, duration: 6000, useNativeDriver: true }),
                ])
            ),
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 800,
                useNativeDriver: true,
            })
        ]).start();
    }, []);

    // Location Streaming logic
    useEffect(() => {
        let watchSubscription: Location.LocationSubscription | null = null;

        const startTracking = async () => {
            if (job?.status === 'accepted') {
                try {
                    const { status } = await Location.requestForegroundPermissionsAsync();
                    if (status !== 'granted') {
                        console.log('Location permission denied');
                        return;
                    }

                    watchSubscription = await Location.watchPositionAsync(
                        {
                            accuracy: Location.Accuracy.Balanced,
                            distanceInterval: 10, // Update every 10 meters
                            timeInterval: 5000,   // Or every 5 seconds
                        },
                        (location) => {
                            const targetUserId = (job.customer as any)?.user?._id || (job.customer as any)?.user;
                            if (targetUserId) {
                                socketService.streamLocation({
                                    targetId: targetUserId,
                                    latitude: location.coords.latitude,
                                    longitude: location.coords.longitude,
                                    jobId: job.id
                                });
                            }
                        }
                    );
                } catch (error) {
                    console.error('Error starting location tracking:', error);
                }
            } else {
                if (watchSubscription) {
                    watchSubscription.remove();
                    watchSubscription = null;
                }
            }
        };

        startTracking();

        return () => {
            if (watchSubscription) {
                watchSubscription.remove();
            }
        };
    }, [job?.status]);

    if (!job) return (
        <View style={[styles.center, { backgroundColor: colors.background }]}>
            <Text style={{ color: colors.text }}>{t('Job not found')}</Text>
        </View>
    );

    const isNew = job.status === 'pending';
    const statusColor = isNew ? '#FF3B30' : colors.primary;

    const handleAction = async (newStatus: string, message: string) => {
        setActionLoading(true);
        try {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            await updateJobStatus(job.id, newStatus);
        } catch (e: any) {
            const errorMsg = e.response?.data?.message || e.message || 'Failed to update status';
            Alert.alert('Error', errorMsg);
        } finally {
            setActionLoading(false);
        }
    };

    const handleAccept = async () => {
        setActionLoading(true);
        try {
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            await acceptJob(job.id);

            if (job.serviceMethod === 'walk_in') {
                Alert.alert('Job Accepted', 'Please wait for the customer to arrive with the vehicle.', [
                    { text: 'OK' }
                ]);
            } else {
                Alert.alert('Job Accepted', 'Navigate to the customer location.', [
                    { text: 'Start Navigation', onPress: handleNavigate },
                    { text: 'OK' }
                ]);
            }
        } catch (e) {
            Alert.alert('Error', 'Failed to accept job');
        } finally {
            setActionLoading(false);
        }
    };

    const handleArrived = async () => {
        setActionLoading(true);
        try {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            await markArrived(job.id);
        } catch (e) {
            Alert.alert('Error', 'Failed to mark arrived');
        } finally {
            setActionLoading(false);
        }
    };

    const handleCancel = async () => {
        if (!cancellationReason.trim()) {
            Alert.alert('Required', 'Please enter a cancellation reason.');
            return;
        }
        setActionLoading(true);
        try {
            await cancelJob(job.id, cancellationReason);
            setShowCancelModal(false);
            Alert.alert('Success', 'Job has been cancelled.');
            if (router.canGoBack()) {
                router.back();
            } else {
                router.replace('/(technician)/(tabs)');
            }
        } catch (e) {
            Alert.alert('Error', 'Failed to cancel job');
        } finally {
            setActionLoading(false);
        }
    };

    const handleRequirementToggle = async (reqId: string, currentStatus: boolean) => {
        try {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            await updateRequirementStatus(job.id, reqId, !currentStatus);
        } catch (e) {
            Alert.alert('Error', 'Failed to update requirement');
        }
    };

    const handleNavigate = () => {
        Haptics.selectionAsync();

        const lat = job.location?.latitude || job.location?.lat;
        const lng = job.location?.longitude || job.location?.lng;
        const address = job.address;

        if (!lat && !lng && !address) {
            Alert.alert('Error', 'No location or address available.');
            return;
        }

        const query = (lat && lng) ? `${lat},${lng}` : encodeURIComponent(address!);
        const label = encodeURIComponent('Customer Location');

        const url = Platform.select({
            ios: `maps:0,0?q=${query}&label=${label}`,
            android: `geo:0,0?q=${query}(${label})`,
        });
        Linking.openURL(url!);
    };

    const simulateCustomerResponse = async (type: 'quote' | 'bill', response: any) => {
        setShowDemoModal(false);
        setActionLoading(true);
        try {
            if (type === 'quote') {
                await customerService.respondToQuote(job.id, response);
            } else if (type === 'bill') {
                await customerService.respondToBill(job.id, response.action, response.paymentMethod);
            }

            // Refresh job details to show proper next action
            const fullJob = await technicianService.getJob(id);
            if (fullJob) setFetchedJob(fullJob);
            await refreshJobs(false, true);

            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch (e) {
            Alert.alert('Error', 'Failed to submit response');
        } finally {
            setActionLoading(false);
        }
    };

    const renderStep = (title: string, status: 'complete' | 'active' | 'pending', subtitle: string, isLast: boolean) => (
        <View style={styles.stepItem}>
            <View style={styles.stepLeft}>
                <View style={[
                    styles.stepCircle,
                    { borderColor: colors.card },
                    status === 'complete' && { backgroundColor: '#34C759' },
                    status === 'active' && { backgroundColor: statusColor },
                    status === 'pending' && { backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7' }
                ]}>
                    {status === 'complete' ? (
                        <Ionicons name="checkmark" size={14} color="#FFF" />
                    ) : (
                        <View style={[styles.stepDot, status === 'active' && { backgroundColor: '#FFF' }]} />
                    )}
                </View>
                {!isLast && (
                    <View style={[
                        styles.stepLine,
                        { backgroundColor: status === 'complete' ? '#34C759' : isDark ? '#2C2C2E' : '#E5E5EA' }
                    ]} />
                )}
            </View>
            <View style={styles.stepRight}>
                <Text style={[
                    styles.stepTitle,
                    { color: status === 'pending' ? colors.icon : colors.text }
                ]}>{title}</Text>
                <Text style={[styles.stepSubtitle, { color: colors.icon }]}>{subtitle}</Text>
            </View>
        </View>
    );


    const handleChat = () => {
        if (!job) return;
        Haptics.selectionAsync();

        // Use real customer User ID if available, else fallback
        const targetUserId = (job.customer as any)?.user?._id || (job.customer as any)?.user || job.id + '_customer';
        const targetName = (job.customer as any)?.user?.name || (job.customer as any)?.fullName || job.customerName || 'Customer';

        const conversationId = createConversation([
            { userId: user?.id || 'technician', role: 'technician', name: 'You' },
            { userId: targetUserId, role: 'customer', name: targetName }
        ], job.id);
        router.push({ pathname: '/(technician)/chat/[id]', params: { id: conversationId } });
    };

    const handleCall = () => {
        Haptics.selectionAsync();
        const targetUserId = (job.customer as any)?.user?._id || (job.customer as any)?.user || job.id + '_customer';
        const targetName = (job.customer as any)?.user?.name || (job.customer as any)?.fullName || job.customerName || 'Customer';
        startCall(targetUserId, targetName, 'audio');
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

            {/* Background Blob */}
            {!isDark && (
                <View style={StyleSheet.absoluteFill} pointerEvents="none">
                    <Animated.View style={[
                        styles.blob,
                        {
                            backgroundColor: colors.primary,
                            transform: [
                                { scale: blob1Anim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.2] }) },
                            ]
                        }
                    ]} />
                </View>
            )}

            {/* Transparent Header */}
            <BlurView intensity={Platform.OS === 'ios' ? (isDark ? 40 : 80) : 0} tint={isDark ? 'dark' : 'light'} style={styles.headerContainer}>
                <SafeAreaView edges={['top']} style={styles.headerSafeArea}>
                    <View style={styles.headerContent}>
                        <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace('/(technician)/(tabs)')} style={[styles.backBtn, { backgroundColor: colors.iconBg }]}>
                            <Ionicons name="arrow-back" size={24} color={colors.text} />
                        </TouchableOpacity>
                        <Text style={[styles.headerTitle, { color: colors.text }]}>{t('job_details') || 'Job Details'}</Text>
                        <View style={{ flexDirection: 'row', gap: 10 }}>
                            <TouchableOpacity onPress={handleCall} style={[styles.iconBtn, { backgroundColor: '#FF6B0020' }]}>
                                <Ionicons name="call" size={20} color="#FF6B00" />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleChat} style={[styles.iconBtn, { backgroundColor: '#34C75920' }]}>
                                <Ionicons name="chatbubble-ellipses" size={20} color="#34C759" />
                            </TouchableOpacity>
                            {job.status !== 'cancelled' && job.status !== 'completed' && job.status !== 'vehicle_delivered' && (
                                <TouchableOpacity onPress={() => setShowCancelModal(true)} style={[styles.iconBtn, { backgroundColor: '#FF3B3020' }]}>
                                    <Ionicons name="close-circle" size={20} color="#FF3B30" />
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                </SafeAreaView>
            </BlurView>

            <ScrollView
                contentContainerStyle={[styles.content, { paddingTop: 120 }]}
                showsVerticalScrollIndicator={false}
            >
                {/* Hero Card */}
                {/* Cancelled Banner */}
                {job.status === 'cancelled' && (
                    <Animated.View style={[styles.section, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
                        <View style={{ backgroundColor: '#FF3B30', padding: 15, borderRadius: 16, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                            <Ionicons name="close-circle" size={24} color="#FFF" />
                            <View style={{ flex: 1 }}>
                                <Text style={{ color: '#FFF', fontSize: 16, fontFamily: 'NotoSans-Bold' }}>Job Cancelled</Text>
                                <Text style={{ color: '#FFF', fontSize: 12, marginTop: 2 }}>The customer has cancelled this service.</Text>
                            </View>
                        </View>
                    </Animated.View>
                )}

                {/* Hero Card */}
                <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={() => {
                        Haptics.selectionAsync();
                        const vId = (typeof job.vehicle === 'object' ? (job.vehicle?.id || job.vehicle?._id) : job.vehicle) || job.vehicleNumber;
                        if (!vId) {
                            Alert.alert('Error', 'Vehicle ID not available');
                            return;
                        }

                        router.push({
                            pathname: '/(technician)/job/[id]/vehicle-details',
                            params: {
                                id: job.id,
                                vehicleId: vId
                            }
                        });
                    }}
                >
                    <Animated.View style={[styles.heroCard, { backgroundColor: colors.card, shadowColor: colors.shadow, opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
                        <View style={styles.heroTop}>
                            <View style={styles.vehicleInfo}>
                                <LinearGradient
                                    colors={isNew ? ['#FF3B3020', '#FF3B3010'] : [colors.primary + '20', colors.primary + '10']}
                                    style={styles.vehicleIcon}
                                >
                                    <VehicleIcon
                                        type={job.vehicle?.vehicleType}
                                        make={job.vehicle?.make}
                                        model={job.vehicle?.model}
                                        size={30}
                                        color={isNew ? '#FF3B30' : colors.primary}
                                    />
                                </LinearGradient>
                                <View>
                                    <Text style={[styles.vehicleTitle, { color: colors.text }]}>{job.vehicleModel}</Text>
                                    <Text style={[styles.customerName, { color: colors.subText }]}>{job.customerName}</Text>
                                </View>
                            </View>
                            <View style={{ flexDirection: 'row', gap: 6 }}>
                                <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
                                    <View style={{
                                        backgroundColor: colors.primary + '20',
                                        paddingHorizontal: 8,
                                        paddingVertical: 4,
                                        borderRadius: 6,
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        gap: 4
                                    }}>
                                        <Ionicons
                                            name={job.serviceMethod === 'walk_in' ? 'walk' : job.serviceMethod === 'home_pickup' ? 'car' : 'construct'}
                                            size={10}
                                            color={colors.primary}
                                        />
                                        <Text style={{ fontSize: 10, fontFamily: 'NotoSans-Bold', color: colors.primary, textTransform: 'capitalize' }}>
                                            {job.serviceMethod ? job.serviceMethod.replace('_', ' ') : 'Standard'}
                                        </Text>
                                    </View>

                                    {/* Service Charge Badge */}
                                    {(job.serviceCharge > 0 || job.metadata?.serviceCharge > 0) && (
                                        <View style={{
                                            backgroundColor: '#34C75920',
                                            paddingHorizontal: 8,
                                            paddingVertical: 4,
                                            borderRadius: 6,
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                            gap: 4
                                        }}>
                                            <Text style={{ fontSize: 10, fontFamily: 'NotoSans-Bold', color: '#34C759' }}>
                                                {formatCurrency(job.serviceCharge || job.metadata?.serviceCharge, settings.currency)}
                                            </Text>
                                        </View>
                                    )}
                                    <StatusBadge status={job.status} size="small" />
                                </View>
                            </View>
                        </View>

                        <View style={[styles.heroBottom, { borderTopColor: colors.border }]}>
                            {/* Detailed Vehicle Specs */}
                            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 12 }}>
                                <View style={{ width: '48%', backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7', padding: 10, borderRadius: 12 }}>
                                    <Text style={{ fontSize: 10, color: colors.icon, textTransform: 'uppercase' }}>Vehicle No</Text>
                                    <Text style={{ fontSize: 14, fontFamily: 'NotoSans-Bold', color: colors.text }}>{job.vehicleNumber || job.vehicle?.registrationNumber || 'N/A'}</Text>
                                </View>
                                <View style={{ width: '48%', backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7', padding: 10, borderRadius: 12 }}>
                                    <Text style={{ fontSize: 10, color: colors.icon, textTransform: 'uppercase' }}>Vehicle Type</Text>
                                    <Text style={{ fontSize: 14, fontFamily: 'NotoSans-Bold', color: colors.text }}>{job.vehicle?.vehicleType || 'N/A'}</Text>
                                </View>

                                <View style={{ width: '48%', backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7', padding: 10, borderRadius: 12 }}>
                                    <Text style={{ fontSize: 10, color: colors.icon, textTransform: 'uppercase' }}>Make & Model</Text>
                                    <Text style={{ fontSize: 14, fontFamily: 'NotoSans-Bold', color: colors.text }} numberOfLines={1}>{job.vehicle?.make && job.vehicle?.model ? `${job.vehicle.make} ${job.vehicle.model}` : job.vehicleModel || 'N/A'}</Text>
                                </View>
                                <View style={{ width: '48%', backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7', padding: 10, borderRadius: 12 }}>
                                    <Text style={{ fontSize: 10, color: colors.icon, textTransform: 'uppercase' }}>Year</Text>
                                    <Text style={{ fontSize: 14, fontFamily: 'NotoSans-Bold', color: colors.text }} numberOfLines={1}>{job.vehicle?.year || 'N/A'}</Text>
                                </View>
                            </View>

                            <View style={styles.infoRow}>
                                <Ionicons name="location-outline" size={18} color={colors.icon} />
                                <Text style={[styles.infoText, { color: colors.text }]} numberOfLines={2}>
                                    {(job.address && !job.address.toLowerCase().includes('undefined')) ? job.address : 'Address not provided'}
                                </Text>
                            </View>
                            {job.description && (
                                <View style={[styles.infoRow, { alignItems: 'flex-start' }]}>
                                    <Ionicons name="document-text-outline" size={18} color={colors.icon} style={{ marginTop: 2 }} />
                                    <Text style={[styles.infoText, { color: colors.text }]}>{job.description}</Text>
                                </View>
                            )}
                            <Text style={[styles.timeText, { color: colors.icon }]}>{t('received')}: {new Date(job.createdAt).toLocaleString()}</Text>
                        </View>
                    </Animated.View>
                </TouchableOpacity>

                {/* Requirements Checklist */}
                {job.requirements && job.requirements.length > 0 && (
                    <Animated.View style={[styles.section, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
                        <Text style={[styles.sectionTitle, { color: colors.subText }]}>{t('service_checklist') || 'Service Checklist'}</Text>
                        <View style={[styles.checklistCard, { backgroundColor: colors.card }]}>
                            {job.requirements.map((req: any) => (
                                <TouchableOpacity
                                    key={req._id || req.id}
                                    style={[styles.checkItem, { borderBottomColor: colors.border }]}
                                    onPress={() => handleRequirementToggle(req._id || req.id, req.isCompleted)}
                                >
                                    <View style={[
                                        styles.checkbox,
                                        {
                                            backgroundColor: req.isCompleted ? '#34C759' : 'transparent',
                                            borderColor: req.isCompleted ? '#34C759' : colors.icon
                                        }
                                    ]}>
                                        {req.isCompleted && <Ionicons name="checkmark" size={14} color="#FFF" />}
                                    </View>
                                    <Text style={[
                                        styles.checkText,
                                        {
                                            color: req.isCompleted ? colors.subText : colors.text,
                                            textDecorationLine: req.isCompleted ? 'line-through' : 'none'
                                        }
                                    ]}>
                                        {req.title}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </Animated.View>
                )}

                {/* Media Gallery */}
                {((job.photos?.length || 0) > 0 || job.voiceNote) && (
                    <Animated.View style={[styles.section, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
                        <Text style={[styles.sectionTitle, { color: colors.subText }]}>{t('attachments_label') || 'Attachments'}</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.mediaRow}>
                            {job.voiceNote && (
                                <View style={[styles.voiceCard, { backgroundColor: colors.card }]}>
                                    <View style={styles.voiceIconBg}>
                                        <Ionicons name="mic" size={20} color="#FFF" />
                                    </View>
                                    <AudioPlayer uri={job.voiceNote} />
                                </View>
                            )}
                            {job.photos?.map((uri: string, idx: number) => {
                                const resolvedUrl = getMediaUrl(uri);
                                console.log(`[PHOTO_${idx}] Original:`, uri, '→ Resolved:', resolvedUrl);
                                return (
                                    <TouchableOpacity
                                        key={idx}
                                        activeOpacity={0.8}
                                        onPress={() => {
                                            console.log('[IMAGE_CLICK] Opening:', resolvedUrl);
                                            setSelectedImage(resolvedUrl);
                                        }}
                                    >
                                        <Image source={{ uri: resolvedUrl || '' }} style={styles.mediaThumb} />
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>
                    </Animated.View>
                )}

                {/* Service Timeline */}
                <Animated.View style={[styles.section, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
                    <Text style={[styles.sectionTitle, { color: colors.subText }]}>{t('service_timeline')}</Text>
                    <View style={[styles.timelineCard, { backgroundColor: colors.card, paddingVertical: 10 }]}>
                        <StatusStepper currentStatus={job.status} />
                    </View>
                </Animated.View>

                {/* Part Requests Section */}
                {job.partRequests && job.partRequests.length > 0 && (
                    <Animated.View style={[styles.section, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
                        <Text style={[styles.sectionTitle, { color: colors.subText }]}>{t('part_requests') || 'Part Requests'}</Text>
                        {job.partRequests.map((order: any, idx: number) => (
                            <View key={idx} style={[styles.orderCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                                <View style={styles.orderHeader}>
                                    <View style={[styles.orderIdBadge, { backgroundColor: colors.primary + '15' }]}>
                                        <Text style={{ fontSize: 10, color: colors.primary, fontFamily: 'NotoSans-Bold' }}>#{order.orderId}</Text>
                                    </View>
                                    <StatusBadge status={order.status} size="small" />
                                </View>

                                {order.items.map((part: any, pIdx: number) => {
                                    const imageUrl = getMediaUrl(part.image);
                                    const voiceUrl = part.voiceUri ? getMediaUrl(part.voiceUri) : null;

                                    console.log(`[PART_REQUEST_${idx}_${pIdx}] Image:`, part.image, '→', imageUrl);
                                    if (part.voiceUri) {
                                        console.log(`[PART_REQUEST_${idx}_${pIdx}] Voice:`, part.voiceUri, '→', voiceUrl);
                                    }

                                    return (
                                        <View key={pIdx} style={styles.orderItem}>
                                            {part.image && (
                                                <TouchableOpacity
                                                    onPress={() => {
                                                        console.log('[PART_IMAGE_CLICK] Opening:', imageUrl);
                                                        setSelectedImage(imageUrl);
                                                    }}
                                                >
                                                    <Image
                                                        source={{ uri: imageUrl || '' }}
                                                        style={styles.orderItemThumb}
                                                    />
                                                </TouchableOpacity>
                                            )}
                                            <View style={{ flex: 1 }}>
                                                <Text style={[styles.orderItemName, { color: colors.text }]}>
                                                    {part.quantity}x {part.name}
                                                </Text>
                                                {part.description && (
                                                    <Text style={[styles.orderItemDesc, { color: colors.icon }]} numberOfLines={2}>
                                                        {part.description}
                                                    </Text>
                                                )}
                                                {part.voiceUri && (
                                                    <View style={{ marginTop: 8, maxWidth: 200 }}>
                                                        <AudioPlayer uri={part.voiceUri} />
                                                    </View>
                                                )}
                                            </View>
                                        </View>
                                    );
                                })}

                                <View style={[styles.divider, { backgroundColor: colors.border, marginVertical: 12 }]} />
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Text style={{ fontSize: 12, color: colors.icon }}>
                                        {t('supplier')}: {order.supplier?.storeName || t('any_available')}
                                    </Text>
                                    <Text style={{ fontSize: 14, fontFamily: 'NotoSans-Bold', color: colors.text }}>
                                        {formatCurrency(order.totalAmount, settings.currency)}
                                    </Text>
                                </View>

                                {/* Quote Action Buttons */}
                                {order.totalAmount > 0 && order.status === 'pending' && (
                                    <View style={{ flexDirection: 'row', gap: 10, marginTop: 15 }}>
                                        <TouchableOpacity
                                            style={{
                                                flex: 1, paddingVertical: 10, borderRadius: 10, borderWidth: 1, borderColor: '#FF3B30',
                                                alignItems: 'center', justifyContent: 'center'
                                            }}
                                            onPress={() => {
                                                Alert.alert(t('confirm_reject'), t('confirm_reject_quote_msg'), [
                                                    { text: t('cancel'), style: 'cancel' },
                                                    { text: t('reject'), style: 'destructive', onPress: () => respondToPartRequest(order.id || order._id, 'reject') }
                                                ]);
                                            }}
                                        >
                                            <Text style={{ color: '#FF3B30', fontWeight: 'bold' }}>{t('reject')}</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={{
                                                flex: 1, paddingVertical: 10, borderRadius: 10, backgroundColor: '#34C759',
                                                alignItems: 'center', justifyContent: 'center'
                                            }}
                                            onPress={() => {
                                                Alert.alert(t('confirm_accept'), t('confirm_accept_quote_msg'), [
                                                    { text: t('cancel'), style: 'cancel' },
                                                    { text: t('accept'), onPress: () => respondToPartRequest(order.id || order._id, 'accept') }
                                                ]);
                                            }}
                                        >
                                            <Text style={{ color: '#FFF', fontWeight: 'bold' }}>{t('accept')}</Text>
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </View>
                        ))}
                    </Animated.View>
                )}

                {/* Financial Quotes */}
                {(job.quote || job.bill) && (
                    <Animated.View style={[styles.section, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
                        {(() => {
                            const displaySource = job.bill && (job.bill.items?.length > 0 || job.bill.laborAmount > 0) ? job.bill : job.quote;
                            const isBill = !!(job.bill && (job.bill.items?.length > 0 || job.bill.laborAmount > 0));

                            return (
                                <>
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, paddingRight: 5 }}>
                                        <Text style={[styles.sectionTitle, { color: colors.subText, marginBottom: 0 }]}>
                                            {isBill ? t('bill_details') || 'Bill Details' : t('approved_work_scope')}
                                        </Text>
                                        {job.partsSource && (
                                            <View style={{ backgroundColor: job.partsSource === 'customer' ? '#FF950020' : '#34C75920', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 }}>
                                                <Text style={{ fontSize: 10, fontFamily: 'NotoSans-Bold', color: job.partsSource === 'customer' ? '#FF9500' : '#34C759' }}>
                                                    {job.partsSource === 'customer' ? 'Customer Parts' : 'Workshop Parts'}
                                                </Text>
                                            </View>
                                        )}
                                    </View>
                                    <View style={[styles.quoteCard, { backgroundColor: colors.card }]}>
                                        {/* Service Fees Section */}
                                        {displaySource.items?.some((item: any) => {
                                            const desc = (item.description || '').toLowerCase();
                                            return desc.includes('service fee') || desc.includes('pickup fee') || desc.includes('service charge');
                                        }) && (
                                                <View style={{ backgroundColor: isDark ? '#2C2C2E' : '#F8F9FE', borderRadius: 16, padding: 12, marginBottom: 12 }}>
                                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                                                        <Ionicons name="construct-outline" size={14} color={colors.primary} />
                                                        <Text style={{ fontSize: 12, fontFamily: 'NotoSans-Bold', color: colors.primary, textTransform: 'uppercase' }}>Service Mode & Fees</Text>
                                                    </View>
                                                    {displaySource.items?.filter((item: any, idx: number, self: any[]) => {
                                                        const desc = (item.description || '').toLowerCase();
                                                        if (desc.includes('service fee') || desc.includes('pickup fee') || desc.includes('service charge')) {
                                                            return self.findIndex(i => (i.description || '').toLowerCase() === desc) === idx;
                                                        }
                                                        return false;
                                                    }).map((item: any, index: number) => (
                                                        <View key={`fee-${index}`} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4 }}>
                                                            <Text style={{ color: colors.text, fontSize: 14, fontFamily: 'NotoSans-Medium' }}>{item.description}</Text>
                                                            <Text style={{ color: colors.text, fontSize: 14, fontFamily: 'NotoSans-Bold' }}>
                                                                {formatCurrency(item.total, settings.currency)}
                                                            </Text>
                                                        </View>
                                                    ))}
                                                </View>
                                            )}

                                        {/* Regular Items / Parts */}
                                        {displaySource.items?.filter((item: any) => {
                                            const desc = (item.description || '').toLowerCase();
                                            return !desc.includes('service fee') && !desc.includes('pickup fee') && !desc.includes('service charge');
                                        }).map((item: any, index: number) => {
                                            const parsed = parseDescription(item.description);
                                            let displayName = parsed.displayName || item.description || '';
                                            let displayNotes = parsed.displayNotes;
                                            const { photoUri, voiceUri } = parsed;

                                            // Metadata extraction
                                            let displayMeta = '';
                                            if (displayName.includes(' - ')) {
                                                const parts = displayName.split(' - ');
                                                const brand = parts.pop();
                                                displayName = parts.join(' - ');
                                                displayMeta = brand ? ` • ${brand}` : '';
                                            }

                                            const pnMatch = displayName.match(/\(PN: (.*?)\)/);
                                            if (pnMatch) {
                                                const pn = pnMatch[1];
                                                displayName = displayName.replace(pnMatch[0], '').trim();
                                                displayMeta = ` • PN: ${pn}` + displayMeta;
                                            }

                                            const isNote = item.unitPrice === 0;

                                            return (
                                                <View key={index} style={[styles.quoteItem, { borderBottomColor: colors.border }]}>
                                                    <View style={{ flex: 1, paddingRight: 10 }}>
                                                        <Text style={[styles.quoteItemTitle, { color: colors.text }]}>{displayName}</Text>
                                                        {(displayMeta || displayNotes) ? (
                                                            <Text style={{ fontSize: 12, color: colors.icon, marginTop: 2 }}>
                                                                {displayMeta.replace(/^ • /, '')}
                                                                {displayMeta && displayNotes ? '\n' : ''}
                                                                {displayNotes}
                                                            </Text>
                                                        ) : null}

                                                        {/* Media Attachments */}
                                                        <View style={{ gap: 6, marginTop: 4 }}>
                                                            {/* Parsed Photo from Description */}
                                                            {photoUri && (
                                                                <TouchableOpacity
                                                                    onPress={() => setSelectedImage(getMediaUrl(photoUri))}
                                                                    style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.primary + '10', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, alignSelf: 'flex-start' }}
                                                                >
                                                                    <Ionicons name="image" size={12} color={colors.primary} />
                                                                    <Text style={{ fontSize: 11, color: colors.primary, marginLeft: 4, fontFamily: 'NotoSans-Bold' }}>View Photo</Text>
                                                                </TouchableOpacity>
                                                            )}
                                                            {/* Attached Images (Array) */}
                                                            {item.images && item.images.length > 0 && item.images.map((img: string, i: number) => (
                                                                <TouchableOpacity
                                                                    key={i}
                                                                    onPress={() => setSelectedImage(getMediaUrl(img))}
                                                                    style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.primary + '10', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, alignSelf: 'flex-start' }}
                                                                >
                                                                    <Ionicons name="image" size={12} color={colors.primary} />
                                                                    <Text style={{ fontSize: 11, color: colors.primary, marginLeft: 4, fontFamily: 'NotoSans-Bold' }}>View Photo {item.images.length > 1 ? i + 1 : ''}</Text>
                                                                </TouchableOpacity>
                                                            ))}

                                                            {/* Parsed Voice from Description */}
                                                            {voiceUri && (
                                                                <View style={{ width: 220, marginTop: 4 }}>
                                                                    <AudioPlayer uri={voiceUri} />
                                                                </View>
                                                            )}
                                                            {/* Attached Voice Note */}
                                                            {item.voiceNote && item.voiceNote !== voiceUri && (
                                                                <View style={{ width: 220, marginTop: 4 }}>
                                                                    <AudioPlayer uri={item.voiceNote} />
                                                                </View>
                                                            )}

                                                            {!isNote && (
                                                                <Text style={[styles.quoteItemSub, { color: colors.icon }]}>
                                                                    {item.quantity} x {formatCurrency(item.unitPrice, settings.currency)}
                                                                </Text>
                                                            )}
                                                        </View>
                                                    </View>
                                                    <View style={{ alignItems: 'flex-end' }}>
                                                        {isNote ? (
                                                            <View style={{ backgroundColor: colors.border, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 }}>
                                                                <Text style={{ fontSize: 10, fontFamily: 'NotoSans-Bold', color: colors.text }}>NOTE</Text>
                                                            </View>
                                                        ) : (
                                                            <Text style={[styles.quoteItemPrice, { color: colors.text }]}>
                                                                {formatCurrency(item.total, settings.currency)}
                                                            </Text>
                                                        )}
                                                    </View>
                                                </View>
                                            );
                                        })}

                                        {/* Labor Charges Row */}
                                        {displaySource.laborAmount > 0 && (
                                            <View style={[styles.quoteItem, { borderBottomColor: colors.border, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 12, marginTop: 4 }]}>
                                                <View style={{ flex: 1 }}>
                                                    <Text style={[styles.quoteItemTitle, { color: colors.text, fontFamily: 'NotoSans-Bold' }]}>{t('labor_charges') || 'Labor Charges'}</Text>
                                                    <Text style={{ fontSize: 12, color: colors.icon }}>Service & Installation</Text>
                                                </View>
                                                <View style={{ alignItems: 'flex-end' }}>
                                                    <Text style={[styles.quoteItemPrice, { color: colors.text }]}>
                                                        {formatCurrency(displaySource.laborAmount, settings.currency)}
                                                    </Text>
                                                </View>
                                            </View>
                                        )}

                                        <View style={[styles.divider, { backgroundColor: colors.border }]} />
                                        <View style={styles.totalRow}>
                                            <Text style={[styles.totalLabel, { color: colors.text }]}>{t('total_payable')}</Text>
                                            <Text style={[styles.totalValue, { color: colors.primary }]}>{formatCurrency((displaySource.totalAmount || 0), settings.currency)}</Text>
                                        </View>
                                        <View style={[styles.earningsBanner, { backgroundColor: colors.primary + '15' }]}>
                                            <Ionicons name="wallet-outline" size={20} color={colors.primary} />
                                            <Text style={[styles.earningsText, { color: colors.primary }]}>Est. Earnings: {formatCurrency(displaySource.laborAmount || 0, settings.currency)}</Text>
                                        </View>
                                    </View>
                                </>
                            );
                        })()}
                    </Animated.View>
                )}

                {/* Customer Feedback (if rated) */}
                {job.rating && (
                    <Animated.View style={[styles.section, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
                        <Text style={[styles.sectionTitle, { color: colors.subText }]}>{t('customer_feedback') || 'Customer Feedback'}</Text>
                        <View style={{ backgroundColor: colors.card, padding: 20, borderRadius: 24, borderWidth: 1, borderColor: '#FF950030', shadowColor: '#FF9500', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 3 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                                <View style={{ flexDirection: 'row', gap: 4 }}>
                                    {[1, 2, 3, 4, 5].map(s => (
                                        <Ionicons key={s} name={s <= job.rating ? "star" : "star-outline"} size={22} color="#FF9500" />
                                    ))}
                                </View>
                                <Text style={{ fontSize: 12, color: colors.icon, fontFamily: 'NotoSans-Bold' }}>
                                    {new Date(job.updatedAt).toLocaleDateString()}
                                </Text>
                            </View>
                            {job.review ? (
                                <Text style={{ color: colors.text, fontSize: 15, fontFamily: 'NotoSans-Medium', fontStyle: 'italic', lineHeight: 22 }}>
                                    "{job.review}"
                                </Text>
                            ) : (
                                <Text style={{ color: colors.icon, fontSize: 14, fontStyle: 'italic' }}>Rating provided without a written review.</Text>
                            )}
                        </View>
                    </Animated.View>
                )}

                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Sticky Action Footer */}
            <BlurView intensity={90} tint={isDark ? 'dark' : 'light'} style={[styles.footer, { borderTopColor: colors.border }]}>
                {job.status === 'pending' ? (
                    <AppButton
                        title="Accept Job"
                        onPress={handleAccept}
                        loading={actionLoading}
                        icon="checkmark-circle"
                        style={styles.fullBtn}
                    />
                ) : job.status === 'accepted' ? (
                    <View style={styles.footerRow}>
                        {job.serviceMethod !== 'walk_in' && (
                            <AppButton
                                title="Navigate"
                                onPress={handleNavigate}
                                variant="secondary"
                                icon="navigate"
                                style={styles.halfBtn}
                            />
                        )}
                        <AppButton
                            title={job.serviceMethod === 'walk_in' ? "Vehicle Received" : "Arrived"}
                            onPress={handleArrived}
                            loading={actionLoading}
                            variant="success"
                            icon={job.serviceMethod === 'walk_in' ? "car-sport" : "location"}
                            style={job.serviceMethod === 'walk_in' ? styles.fullBtn : styles.halfBtn}
                        />
                    </View>
                ) : job.status === 'arrived' ? (
                    <AppButton
                        title="Start Inspection"
                        onPress={() => handleAction('diagnosing', 'Started Inspection')}
                        loading={actionLoading}
                        icon="scan"
                        style={styles.fullBtn}
                    />
                ) : job.status === 'diagnosing' ? (
                    <AppButton
                        title="Create Quote"
                        onPress={() => router.push({ pathname: '/(technician)/job/[id]/quote', params: { id: job.id, type: 'quote' } })}
                        style={styles.fullBtn}
                        icon="receipt-outline"
                    />
                ) : job.status === 'quote_pending' ? (
                    <TouchableOpacity
                        activeOpacity={__DEV__ ? 0.7 : 1}
                        onPress={() => __DEV__ && setShowDemoModal(true)}
                        style={styles.pendingBox}
                    >
                        <Text style={[styles.pendingText, { color: colors.subText }]}>{t('waiting_customer_approval') || 'Waiting for customer approval...'}</Text>
                    </TouchableOpacity>
                ) : job.status === 'parts_required' ? (
                    job.partsSource === 'customer' ? (
                        <AppButton
                            title="Parts Received"
                            onPress={() => handleAction('parts_ordered', 'Parts Received from Customer')}
                            variant="primary"
                            style={styles.fullBtn}
                            icon="cube-outline"
                        />
                    ) : (
                        <View style={styles.footerRow}>
                            <AppButton
                                title="Order Parts"
                                onPress={() => router.push({ pathname: '/(technician)/parts/request', params: { jobId: job.id } })}
                                style={styles.halfBtn}
                            />
                            <AppButton
                                title="Start Work"
                                onPress={() => handleAction('in_progress', 'Started')}
                                variant="secondary"
                                style={styles.halfBtn}
                            />
                        </View>
                    )
                ) : job.status === 'in_progress' ? (
                    job.partsSource === 'customer' ? (
                        <AppButton
                            title="Work Finished"
                            onPress={() => handleAction('quality_check', 'Work Completed')}
                            variant="success"
                            style={styles.fullBtn}
                            icon="shield-checkmark-outline"
                        />
                    ) : (
                        <View style={styles.footerRow}>
                            <AppButton
                                title="Order More Parts"
                                onPress={() => router.push({ pathname: '/(technician)/parts/request', params: { jobId: job.id } })}
                                style={styles.halfBtn}
                                variant="primary" // Changed to primary to distinguish
                                icon="cart-outline"
                            />
                            <AppButton
                                title="Work Finished"
                                onPress={() => handleAction('quality_check', 'Work Completed')}
                                variant="success"
                                style={styles.halfBtn}
                                icon="shield-checkmark-outline"
                            />
                        </View>
                    )
                ) : job.status === 'parts_ordered' ? (
                    job.partsSource === 'customer' ? (
                        <AppButton
                            title="Start Work"
                            onPress={() => handleAction('in_progress', 'Started')}
                            style={styles.fullBtn}
                            variant="success"
                            icon="play"
                        />
                    ) : (
                        <View style={styles.footerRow}>
                            <AppButton
                                title="Order Parts"
                                variant='primary'
                                style={styles.halfBtn}
                                icon="cart-outline"
                                onPress={() => router.push({ pathname: '/(technician)/parts/request', params: { jobId: job.id } })}
                            />
                            <AppButton
                                title="Parts Received"
                                onPress={() => handleAction('in_progress', 'Parts Received')}
                                style={styles.halfBtn}
                                variant="secondary"
                                icon="download-outline"
                            />
                        </View>
                    )
                ) : job.status === 'quality_check' ? (
                    <AppButton
                        title="Quality Check Done"
                        onPress={() => handleAction('ready_for_delivery', 'Quality Verified')}
                        variant="primary"
                        style={styles.fullBtn}
                        icon="checkmark-circle-outline"
                    />
                ) : job.status === 'ready_for_delivery' ? (
                    <AppButton
                        title="Generate Bill"
                        onPress={() => router.push({
                            pathname: '/(technician)/job/[id]/quote',
                            params: {
                                id: job.id,
                                type: 'bill',
                                laborAmount: (job.quote?.laborAmount || 0).toString()
                            }
                        })}
                        variant="success"
                        style={styles.fullBtn}
                        icon="receipt-outline"
                    />
                ) : job.status === 'quote_rejected' ? (
                    <View style={styles.pendingBox}>
                        <Text style={[styles.pendingText, { color: colors.error }]}>Quote Rejected by Customer</Text>
                        <AppButton
                            title="Revise Quote"
                            onPress={() => router.push({
                                pathname: '/(technician)/job/[id]/quote',
                                params: {
                                    id: job.id,
                                    type: 'quote',
                                    laborAmount: (job.quote?.laborAmount || 0).toString()
                                }
                            })}
                            variant="primary"
                            size="small"
                        />
                    </View>
                ) : job.status === 'cancelled' ? (
                    <View style={styles.closedBox}>
                        <Text style={[styles.closedText, { color: colors.error }]}>Job Cancelled</Text>
                    </View>
                ) : (job.status === 'billing_pending' || job.status === 'bill_rejected') ? (
                    (job.bill?.status === 'rejected' || job.status === 'bill_rejected') ? (
                        <TouchableOpacity
                            activeOpacity={__DEV__ ? 0.7 : 1}
                            onPress={() => __DEV__ && setShowDemoModal(true)}
                            style={styles.pendingBox}
                        >
                            <Text style={[styles.pendingText, { color: colors.error }]}>Bill Rejected by Customer</Text>
                            <AppButton title="Contact Customer" onPress={handleCall} variant="secondary" size="small" icon="call" />
                        </TouchableOpacity>
                    ) : (
                        <View style={{ width: '100%', gap: 10 }}>
                            <AppButton
                                title="Mark Vehicle Delivered"
                                onPress={() => handleAction('vehicle_delivered', 'Delivered')}
                                style={styles.fullBtn}
                                icon="car-outline"
                            />
                            {__DEV__ && (
                                <TouchableOpacity onPress={() => setShowDemoModal(true)} style={{ alignSelf: 'center' }}>
                                    <Text style={[styles.demoLink, { color: colors.primary, fontSize: 10 }]}>[Demo]</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    )
                ) : (
                    <View style={styles.closedBox}>
                        <Text style={[styles.closedText, { color: job.status === 'completed' ? '#34C759' : colors.warning }]}>
                            {job.status === 'completed' ? 'Job Completed' :
                                job.status === 'payment_pending_cash' ? 'Collect Cash' :
                                    job.status === 'vehicle_delivered' ? 'Handover Confirmed' : 'Waiting for Payment'}
                        </Text>

                        {job.status === 'vehicle_delivered' && (
                            job.bill?.status === 'paid' ? (
                                <AppButton title="Close Job" onPress={() => handleAction('completed', 'Done')} variant="success" size="small" icon="checkmark-done" />
                            ) : (
                                <View style={{ alignItems: 'center', marginTop: 10 }}>
                                    <TouchableOpacity
                                        activeOpacity={__DEV__ ? 0.7 : 1}
                                        onPress={() => __DEV__ && setShowDemoModal(true)}
                                    >
                                        <Text style={{ fontSize: 12, color: colors.subText }}>Waiting for customer payment...</Text>
                                    </TouchableOpacity>
                                    <View style={{ flexDirection: 'row', gap: 10, marginTop: 5 }}>
                                        <AppButton title="Contact" onPress={handleCall} variant="ghost" size="small" />
                                    </View>
                                </View>
                            )
                        )}

                        {job.status === 'payment_pending_cash' && (
                            <AppButton title="Confirm Cash Received" onPress={() => handleAction('completed', 'Done')} variant="success" size="small" icon="cash" />
                        )}
                    </View>
                )}
            </BlurView>

            {/* Demo Modal */}
            <Modal visible={showDemoModal} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <BlurView intensity={20} style={StyleSheet.absoluteFill} />
                    <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
                        {job.status === 'quote_pending' ? (
                            <>
                                <Text style={[styles.modalTitle, { color: colors.text }]}>Demo: Quote Approval</Text>
                                <AppButton title="Approve with Tech Parts" onPress={() => simulateCustomerResponse('quote', 'accept_with_parts')} style={{ marginBottom: 10 }} />
                                <AppButton title="Approve with Own Parts" onPress={() => simulateCustomerResponse('quote', 'accept_own_parts')} variant="secondary" style={{ marginBottom: 10 }} />
                                <AppButton title="Reject Quote" onPress={() => simulateCustomerResponse('quote', 'reject')} variant="danger" style={{ marginBottom: 10 }} />
                            </>
                        ) : (job.status === 'billing_pending' || job.status === 'bill_rejected' || job.status === 'vehicle_delivered') ? (
                            <>
                                <Text style={[styles.modalTitle, { color: colors.text }]}>Demo: Payment & Bill</Text>
                                <AppButton title="Pay via Razorpay" onPress={() => simulateCustomerResponse('bill', { action: 'approve', paymentMethod: 'razorpay' })} style={{ marginBottom: 10 }} />
                                <AppButton title="Pay via Cash" onPress={() => simulateCustomerResponse('bill', { action: 'approve', paymentMethod: 'cash' })} variant="secondary" style={{ marginBottom: 10 }} />
                                <AppButton title="Reject Bill" onPress={() => simulateCustomerResponse('bill', { action: 'reject' })} variant="danger" style={{ marginBottom: 10 }} />
                            </>
                        ) : (
                            <Text style={{ color: colors.text, textAlign: 'center', marginBottom: 20 }}>No demo actions available for {job.status}</Text>
                        )}
                        <AppButton title="Close" onPress={() => setShowDemoModal(false)} variant="ghost" />
                    </View>
                </View>
            </Modal>

            {/* Cancel Modal */}
            <Modal visible={showCancelModal} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <BlurView intensity={20} style={StyleSheet.absoluteFill} />
                    <View style={[styles.modalContent, { backgroundColor: colors.card, paddingBottom: 50 }]}>
                        <Text style={[styles.modalTitle, { color: colors.text }]}>Cancel Job</Text>
                        <Text style={{ color: colors.subText, marginBottom: 15, textAlign: 'center' }}>Are you sure you want to cancel this job? This action cannot be undone.</Text>

                        <Text style={{ color: colors.text, marginBottom: 5, fontFamily: 'NotoSans-Bold' }}>Reason</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.border }]}
                            placeholder="Why are you cancelling?"
                            placeholderTextColor={colors.icon}
                            value={cancellationReason}
                            onChangeText={setCancellationReason}
                            multiline
                        />

                        <AppButton
                            title="Cancel Job"
                            onPress={handleCancel}
                            loading={actionLoading}
                            variant="danger"
                            style={{ marginBottom: 10, marginTop: 20 }}
                        />
                        <AppButton title="Go Back" onPress={() => setShowCancelModal(false)} variant="ghost" />
                    </View>
                </View>
            </Modal>

            <ImageModal
                visible={!!selectedImage}
                uri={selectedImage}
                onClose={() => setSelectedImage(null)}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    blob: {
        position: 'absolute',
        width: 300,
        height: 300,
        borderRadius: 999,
        opacity: 0.08,
        top: -100,
        right: -50,
    },
    headerContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
    },
    headerSafeArea: { backgroundColor: 'transparent' },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 10
    },
    backBtn: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    iconBtn: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    headerTitle: { fontSize: 17, fontFamily: 'NotoSans-Bold' },
    content: { padding: 20 },

    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    heroCard: {
        borderRadius: 24,
        padding: 20,
        marginBottom: 20,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
        elevation: 4
    },
    heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
    vehicleInfo: { flexDirection: 'row', gap: 14, flex: 1 },
    vehicleIcon: { width: 52, height: 52, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
    vehicleTitle: { fontSize: 18, fontFamily: 'NotoSans-Bold' },
    customerName: { fontSize: 13, fontFamily: 'NotoSans-Medium', marginTop: 2 },
    heroBottom: { gap: 10, paddingTop: 15, borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.05)' },
    infoRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
    infoText: { fontSize: 13, flex: 1, fontFamily: 'NotoSans-Medium' },
    timeText: { fontSize: 11, marginTop: 5, fontFamily: 'NotoSans-Regular' },

    mediaRow: { gap: 10, paddingVertical: 5 },
    mediaThumb: { width: 80, height: 80, borderRadius: 16, backgroundColor: '#EEE' },
    voiceCard: { flexDirection: 'row', alignItems: 'center', borderRadius: 16, paddingHorizontal: 12, height: 80, minWidth: 150 },
    voiceIconBg: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#FF6B00', justifyContent: 'center', alignItems: 'center', marginRight: 8 },

    timelineContainer: { borderRadius: 24, padding: 24, gap: 0 },
    stepItem: { flexDirection: 'row', gap: 15, minHeight: 70 },
    stepLeft: { alignItems: 'center', width: 20 },
    stepCircle: { width: 16, height: 16, borderRadius: 8, borderWidth: 3, zIndex: 2 },
    stepDot: { width: 6, height: 6, borderRadius: 3 },
    stepLine: { width: 2, height: '110%', position: 'absolute', top: 16, zIndex: 1 },
    stepRight: { flex: 1, paddingBottom: 25, justifyContent: 'flex-start' },
    stepTitle: { fontSize: 14, fontFamily: 'NotoSans-Bold', marginBottom: 3 },
    stepSubtitle: { fontSize: 12, fontFamily: 'NotoSans-Medium' },

    quoteCard: { borderRadius: 24, padding: 20 },
    quoteItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12, borderBottomWidth: 1, paddingBottom: 12 },
    quoteItemTitle: { fontSize: 14, fontFamily: 'NotoSans-Medium' },
    quoteItemSub: { fontSize: 12, marginTop: 2 },
    orderCard: { borderRadius: 24, padding: 20, marginBottom: 15, borderWidth: 1 },
    orderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
    orderIdBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
    orderItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 15 },
    orderItemThumb: { width: 50, height: 50, borderRadius: 10, backgroundColor: '#F2F2F7' },
    orderItemName: { fontSize: 14, fontFamily: 'NotoSans-Bold' },
    orderItemDesc: { fontSize: 12, fontFamily: 'NotoSans-Regular', marginTop: 2 },
    quoteItemPrice: { fontSize: 14, fontFamily: 'NotoSans-Bold' },
    totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 5, marginBottom: 15 },
    totalLabel: { fontSize: 15, fontFamily: 'NotoSans-Bold' },
    totalValue: { fontSize: 18, fontFamily: 'NotoSans-Black' },
    divider: { height: 1, marginVertical: 15 },
    earningsBanner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 12, borderRadius: 16, gap: 8 },
    earningsText: { fontSize: 13, fontFamily: 'NotoSans-Bold' },

    checklistCard: { borderRadius: 24, padding: 5, overflow: 'hidden' },
    checkItem: { flexDirection: 'row', alignItems: 'center', padding: 15, borderBottomWidth: 1, gap: 12 },
    checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, justifyContent: 'center', alignItems: 'center' },
    checkText: { fontSize: 15, fontFamily: 'NotoSans-Medium' },

    section: { marginBottom: 25 },
    sectionTitle: { fontSize: 12, fontFamily: 'NotoSans-Bold', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1.5, marginLeft: 5 },

    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 20,
        paddingBottom: 35,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -5 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 10,
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.05)'
    },
    footerRow: { flexDirection: 'row', gap: 15 },
    fullBtn: { width: '100%' },
    halfBtn: { flex: 1 },
    pendingBox: { alignItems: 'center', padding: 10 },
    pendingText: { marginBottom: 5, fontFamily: 'NotoSans-Medium' },
    demoLink: { fontFamily: 'NotoSans-Bold' },
    closedBox: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    closedText: { fontSize: 16, fontFamily: 'NotoSans-Bold' },

    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 30, paddingBottom: 40 },
    modalTitle: { fontSize: 18, fontFamily: 'NotoSans-Bold', marginBottom: 20, textAlign: 'center' },
    input: {
        borderWidth: 1,
        borderRadius: 12,
        padding: 15,
        marginTop: 5,
        fontSize: 16,
        minHeight: 100,
        textAlignVertical: 'top'
    },
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
