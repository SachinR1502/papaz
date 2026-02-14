
import { QuoteBillItem, QuoteBillItemManager } from '@/components/technician/QuoteBillItemManager';
import { AppButton } from '@/components/ui/AppButton';
import { Colors } from '@/constants/theme';
import { useLanguage } from '@/context/LanguageContext';
import { useTechnician } from '@/context/TechnicianContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { technicianService } from '@/services/technicianService';
import { getMediaUrl } from '@/utils/mediaHelpers';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function GenerateQuoteBillScreen() {
    const { id, laborAmount: paramLaborAmount } = useLocalSearchParams<{ id: string, type?: string, laborAmount?: string }>();
    const router = useRouter();
    const { sendBill, sendQuote, availableJobs, myJobs, uploadFile } = useTechnician();
    const { t } = useLanguage();

    const colorScheme = useColorScheme();
    const theme = colorScheme ?? 'light';
    const colors = Colors[theme];
    const isDark = theme === 'dark';

    const job = [...availableJobs, ...myJobs].find(j => j.id === id);

    // Determine if this is a quote or bill based on job status
    const isQuote = job?.status === 'accepted' || job?.status === 'arrived' || job?.status === 'diagnosing' || job?.status === 'in_progress' || job?.status === 'quote_pending' || job?.status === 'quote_rejected' || job?.status === 'parts_required' || job?.status === 'parts_ordered';
    const isBill = job?.status === 'quality_check' || job?.status === 'ready_for_delivery' || job?.status === 'billing_pending' || job?.status === 'bill_rejected';

    const [items, setItems] = useState<QuoteBillItem[]>([]);
    const [laborAmount, setLaborAmount] = useState(paramLaborAmount ? parseFloat(paramLaborAmount) : 0);
    const [note, setNote] = useState('');
    const [photos, setPhotos] = useState<string[]>([]);
    const [voiceNote, setVoiceNote] = useState<string | null>(null);
    const [isRecording, setIsRecording] = useState(false);
    const [recordingDuration, setRecordingDuration] = useState(0);
    const [recording, setRecording] = useState<Audio.Recording | null>(null);
    const [timer, setTimer] = useState<any>(null);
    const [sending, setSending] = useState(false);
    const [showRequirements, setShowRequirements] = useState(false);
    const [fullJob, setFullJob] = useState<any>(null);
    const [loadingJob, setLoadingJob] = useState(false);

    useEffect(() => {
        const fetchFullJob = async () => {
            setLoadingJob(true);
            try {
                const jobData = await technicianService.getJob(id);
                // Robust data extraction: some APIs return { success, data } others return data directly
                const actualJob = jobData.data || jobData;

                if (actualJob) {
                    setFullJob(actualJob);

                    // Pre-populate items if it's a bill or a revision
                    if (items.length === 0) {
                        // Priority 1: Existing Bill (if revising)
                        // Priority 2: Existing Quote (if generating bill or revising quote)
                        // If we are in 'Bill' mode, we usually start from the 'Quote' if no Bill exists
                        const sourceData = (actualJob.bill && (actualJob.bill.items?.length > 0 || actualJob.bill.laborAmount > 0))
                            ? actualJob.bill
                            : actualJob.quote;

                        let initialItems: QuoteBillItem[] = [];

                        if (sourceData) {
                            console.log('[QuoteScreen] Pre-populating from:', sourceData === actualJob.bill ? 'Bill' : 'Quote');
                            if (sourceData.items?.length > 0) {
                                const rawItems = sourceData.items.map((i: any) => ({
                                    ...i,
                                    description: i.description || i.name || 'Unknown Item',
                                    id: i._id || i.id || Math.random().toString(),
                                    isOriginal: true // Mark as originally quoted
                                }));

                                // Deduplicate existing service fees if any
                                const serviceFeeIndices: number[] = [];
                                rawItems.forEach((item: any, idx: number) => {
                                    const desc = (item.description || '').toLowerCase();
                                    if (desc.includes('service fee') || desc.includes('pickup fee')) {
                                        serviceFeeIndices.push(idx);
                                    }
                                });

                                if (serviceFeeIndices.length > 1) {
                                    console.log('[QuoteScreen] Found duplicate service fees, keeping only the first one.');
                                    // Keep only the item at the first serviceFeeIndex
                                    initialItems = rawItems.filter((_: any, idx: number) => {
                                        const isFee = (rawItems[idx].description || '').toLowerCase().includes('service fee') ||
                                            (rawItems[idx].description || '').toLowerCase().includes('pickup fee');
                                        if (!isFee) return true;
                                        return idx === serviceFeeIndices[0];
                                    });
                                } else {
                                    initialItems = rawItems;
                                }
                            }
                            setLaborAmount(sourceData.laborAmount || 0);
                            setNote(sourceData.note || '');
                        }

                        // Add Service Fee automatically if applicable and not already present
                        const SERVICE_FEES = {
                            'on_spot': { price: 199, desc: 'On-Spot Service Fee' },
                            'home_pickup': { price: 99, desc: 'Home Pickup Fee' }
                        };

                        const method = actualJob.serviceMethod;
                        const jobServiceCharge = actualJob.serviceCharge || actualJob.metadata?.serviceCharge;

                        // @ts-ignore
                        const feeConfig = SERVICE_FEES[method];

                        if (feeConfig || jobServiceCharge > 0) {
                            const desc = feeConfig?.desc || (method === 'on_spot' ? 'On-Spot Service Fee' : 'Home Pickup Fee');
                            const price = jobServiceCharge > 0 ? jobServiceCharge : (feeConfig?.price || 0);

                            if (price > 0) {
                                // More robust check: Case-insensitive and matches "Service Fee" or "Pickup Fee"
                                const hasFee = initialItems.some(i => {
                                    const d = (i.description || '').toLowerCase();
                                    return d.includes('service fee') || d.includes('pickup fee');
                                });

                                if (!hasFee) {
                                    console.log('[QuoteScreen] Adding missing service fee:', desc, price);
                                    const feeItem: QuoteBillItem = {
                                        id: `fee_${method}_${Date.now()}`, // Stable ID to avoid duplicates on re-renders
                                        description: desc,
                                        quantity: 1,
                                        unitPrice: price,
                                        total: price,
                                        isCustom: false
                                    };
                                    initialItems.unshift(feeItem);
                                } else {
                                    console.log('[QuoteScreen] Service fee already present, skipping auto-add.');
                                }
                            }
                        }

                        console.log('[QuoteScreen] Final pre-populated items count:', initialItems.length);
                        setItems(initialItems);
                    }
                }
            } catch (error) {
                console.error('Failed to fetch full job details:', error);
            } finally {
                setLoadingJob(false);
            }
        };

        fetchFullJob();
    }, [id]);

    // Totals Calculation - Exclude Note items from financial totals
    const itemsTotal = items.reduce((sum, item) => {
        // Don't add notes to the financial total
        if (item.isNote || item.unitPrice === 0) return sum;
        return sum + (item.total || 0);
    }, 0);
    const grandTotal = itemsTotal + (laborAmount || 0);
    // Aligning with index.tsx "proper" display: Earnings = Labor Amount
    const estimateEarnings = laborAmount;

    const currencySymbol = '₹'; // Default to INR to match design tokens

    if (!job) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
                <Stack.Screen options={{ headerShown: false }} />
                <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle" size={64} color={colors.icon} />
                    <Text style={[styles.errorText, { color: colors.text }]}>{t('job_not_found')}</Text>
                    <AppButton
                        title={t('go_back')}
                        onPress={() => router.back()}
                        variant="secondary"
                    />
                </View>
            </SafeAreaView>
        );
    }

    const handleTakePhoto = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert(t('error'), t('camera_permission_denied'));
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: false,
            quality: 0.8,
        });

        if (!result.canceled) {
            console.log('[QuoteScreen] Photo captured, uploading:', result.assets[0].uri);
            try {
                const uploadRes = await uploadFile(result.assets[0].uri, 'image');
                console.log('[QuoteScreen] Photo upload success:', uploadRes);
                const url = uploadRes.url || uploadRes.path;
                if (url) {
                    setPhotos([...photos, url]);
                }
            } catch (error) {
                console.error("[QuoteScreen] Photo upload failed:", error);
                Alert.alert(t('error'), t('upload_failed') || "Failed to upload image");
            }
        }
    };

    const handlePickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert(t('error'), t('gallery_permission_denied'));
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            allowsEditing: false,
            quality: 0.8,
        });

        if (!result.canceled) {
            console.log('[QuoteScreen] Image picked, uploading:', result.assets[0].uri);
            try {
                const uploadRes = await uploadFile(result.assets[0].uri, 'image');
                console.log('[QuoteScreen] Image upload success:', uploadRes);
                const url = uploadRes.url || uploadRes.path;
                if (url) {
                    setPhotos([...photos, url]);
                }
            } catch (error) {
                console.error("[QuoteScreen] Image upload failed:", error);
                Alert.alert(t('error'), t('upload_failed') || "Failed to upload image");
            }
        }
    };

    const handleStartRecording = async () => {
        try {
            const { status } = await Audio.requestPermissionsAsync();
            if (status !== 'granted') return;

            await Audio.setAudioModeAsync({
                allowsRecordingIOS: true,
                playsInSilentModeIOS: true,
            });

            const { recording } = await Audio.Recording.createAsync(
                Audio.RecordingOptionsPresets.HIGH_QUALITY
            );
            setRecording(recording);
            setIsRecording(true);
            setRecordingDuration(0);

            const interval = setInterval(() => {
                setRecordingDuration(prev => prev + 1);
            }, 1000);
            setTimer(interval);
        } catch (err) {
            console.error('Failed to start recording', err);
        }
    };

    const handleStopRecording = async () => {
        if (!recording) return;
        setIsRecording(false);
        if (timer) clearInterval(timer);
        setTimer(null);

        await recording.stopAndUnloadAsync();
        const uri = recording.getURI();
        if (uri) {
            try {
                const uploadRes = await uploadFile(uri, 'audio');
                const url = uploadRes.url || uploadRes.path;
                if (url) {
                    setVoiceNote(url);
                }
            } catch (error) {
                console.error("Failed to upload voice note:", error);
                Alert.alert(t('error'), t('upload_failed') || "Failed to upload voice note");
            }
        }
        setRecording(null);
    };

    const handleSend = async () => {
        if (items.length === 0 && !note.trim() && photos.length === 0 && !voiceNote) {
            Alert.alert(t('error'), t('add_at_least_one_item'));
            return;
        }

        Alert.alert(
            t('confirm'),
            isQuote ? t('send_quote_confirm') : t('send_bill_confirm'),
            [
                { text: t('cancel'), style: 'cancel' },
                {
                    text: t('send'),
                    onPress: async () => {
                        setSending(true);
                        console.log('[QuoteScreen] Starting submission...', { isQuote, isBill });
                        try {
                            // Media are now uploaded immediately, so photos and voiceNote already contain URLs.
                            // However, we'll keep a check just in case.
                            const photoUrls = await Promise.all(photos.map(async (p) => {
                                if (p.startsWith('http') || p.startsWith('/')) return p;
                                const res = await uploadFile(p, 'image');
                                return res.url || res.path;
                            }));

                            let voiceNoteUrl = voiceNote;
                            if (voiceNote && !voiceNote.startsWith('http') && !voiceNote.startsWith('/')) {
                                const res = await uploadFile(voiceNote, 'audio');
                                voiceNoteUrl = res.url || res.path;
                            }

                            // Process items: Upload media for custom items if needed
                            const processedItems = await Promise.all(items.map(async (item) => {
                                let itemImages: string[] = [];
                                let itemVoice: string | null = null;

                                // Upload Item Images
                                if (item.images && item.images.length > 0) {
                                    const uploadedItemPhotos = await Promise.all(item.images.map(async (img) => {
                                        // If it's already a link, skip upload
                                        if (img.startsWith('http') || img.startsWith('/')) return { url: img };
                                        console.log('[QuoteScreen] Uploading item photo:', img);
                                        return uploadFile(img, 'image');
                                    }));
                                    itemImages = uploadedItemPhotos.map(res => res.url || res.path);
                                }

                                // Upload Item Voice Note
                                if (item.voiceNote) {
                                    if (item.voiceNote.startsWith('http') || item.voiceNote.startsWith('/')) {
                                        itemVoice = item.voiceNote;
                                    } else {
                                        console.log('[QuoteScreen] Uploading item voice note:', item.voiceNote);
                                        const res = await uploadFile(item.voiceNote, 'audio');
                                        itemVoice = res.url || res.path;
                                    }
                                }

                                return {
                                    id: item.id,
                                    product: item.productId,
                                    description: item.description,
                                    brand: item.brand,
                                    partNumber: item.partNumber,
                                    quantity: item.quantity,
                                    unitPrice: item.unitPrice,
                                    total: item.total,
                                    isCustom: item.isCustom ?? false,
                                    isNote: item.isNote ?? false,
                                    images: itemImages,
                                    voiceNote: itemVoice,
                                };
                            }));

                            const metadata = {
                                note: note.trim(),
                                photos: photoUrls,
                                voiceNote: voiceNoteUrl
                            };

                            const vehicleId = job.vehicle ? (typeof job.vehicle === 'object' ? (job.vehicle._id || job.vehicle.id) : job.vehicle) : undefined;

                            if (isQuote) {
                                await sendQuote(job.id, processedItems, laborAmount, metadata, vehicleId);
                            } else {
                                await sendBill(job.id, processedItems, laborAmount, metadata, vehicleId);
                            }

                            Alert.alert(
                                t('success'),
                                isQuote ? t('quote_sent_successfully') : t('bill_sent_successfully'),
                                [
                                    {
                                        text: t('ok'),
                                        onPress: () => router.back()
                                    }
                                ]
                            );
                        } catch (error: any) {
                            Alert.alert(t('error'), error.message || t('something_went_wrong'));
                        } finally {
                            setSending(false);
                        }
                    }
                }
            ]
        );
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
            <Stack.Screen
                options={{
                    headerShown: true,
                    title: isQuote ? t('generate_quote') : isBill ? t('generate_bill') : t('service_update'),
                    headerStyle: { backgroundColor: colors.card },
                    headerTintColor: colors.text,
                    headerShadowVisible: false,
                }}
            />

            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={100}
            >
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Job Info Header */}
                    <View style={[styles.jobHeader, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 15 }}>
                            <View style={styles.jobHeaderRow}>
                                <View style={[styles.jobIconContainer, { backgroundColor: colors.primary + '15' }]}>
                                    <Ionicons name="car-sport" size={24} color={colors.primary} />
                                </View>
                                <View style={styles.jobHeaderInfo}>
                                    <Text style={[styles.jobTitle, { color: colors.text }]}>
                                        {job.vehicleModel}
                                    </Text>
                                    <Text style={[styles.jobSubtitle, { color: colors.icon }]}>
                                        {job.customerName}
                                    </Text>
                                </View>
                            </View>
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
                        </View>

                        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 12 }}>
                            <View style={{ flex: 1, backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7', padding: 10, borderRadius: 12 }}>
                                <Text style={{ fontSize: 10, color: colors.icon, textTransform: 'uppercase' }}>Vehicle No</Text>
                                <Text style={{ fontSize: 14, fontFamily: 'NotoSans-Bold', color: colors.text }}>{job.vehicleNumber || 'N/A'}</Text>
                            </View>
                            <View style={{ flex: 1, backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7', padding: 10, borderRadius: 12 }}>
                                <Text style={{ fontSize: 10, color: colors.icon, textTransform: 'uppercase' }}>Job ID</Text>
                                <Text style={{ fontSize: 14, fontFamily: 'NotoSans-Bold', color: colors.text }}>#{job.id.slice(-6).toUpperCase()}</Text>
                            </View>
                        </View>

                        <Text style={[styles.jobSubtitle, { color: colors.icon, marginBottom: 5 }]}>
                            {t('initial_description') || 'Initial Description'}:
                        </Text>
                        <Text style={[styles.jobDescription, { color: colors.text }]}>
                            {job.description}
                        </Text>

                        {/* Standard Service Requirements / Parts Needed */}
                        {job.requirements && job.requirements.length > 0 && (
                            <View style={[styles.requirementsList, { backgroundColor: isDark ? '#ffffff05' : '#F8F9FA' }]}>
                                <Text style={[styles.requirementsTitle, { color: colors.icon }]}>
                                    {t('standard_parts_tasks') || 'Standard Parts & Tasks'}
                                </Text>
                                <View style={styles.requirementsGrid}>
                                    {job.requirements.map((req: any, idx: number) => (
                                        <View key={idx} style={styles.requirementItem}>
                                            <Ionicons
                                                name={req.isCompleted ? "checkmark-circle" : "radio-button-off"}
                                                size={16}
                                                color={req.isCompleted ? colors.sales : colors.icon}
                                            />
                                            <Text style={[styles.requirementText, { color: colors.text, textDecorationLine: req.isCompleted ? 'line-through' : 'none' }]}>
                                                {req.title}
                                            </Text>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        )}

                        {/* Collapsible Customer Requirements Reference */}
                        {((job.photos && job.photos.length > 0) || job.voiceNote) && (
                            <View style={{ marginTop: 15, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 12 }}>
                                <TouchableOpacity
                                    onPress={() => setShowRequirements(!showRequirements)}
                                    style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
                                >
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                        <Ionicons name="information-circle-outline" size={16} color={colors.primary} />
                                        <Text style={{ fontSize: 13, fontFamily: 'NotoSans-Bold', color: colors.primary }}>
                                            {t('view_customer_requirements') || 'View Customer Requirements'}
                                        </Text>
                                    </View>
                                    <Ionicons name={showRequirements ? "chevron-up" : "chevron-down"} size={16} color={colors.primary} />
                                </TouchableOpacity>

                                {showRequirements && (
                                    <View style={{ marginTop: 12, gap: 10 }}>
                                        {job.photos && (
                                            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                                {job.photos.map((p: string, i: number) => (
                                                    <TouchableOpacity key={i} onPress={() => {/* TODO: View Image Modal */ }} style={{ marginRight: 8, borderRadius: 8, overflow: 'hidden' }}>
                                                        <Image source={{ uri: getMediaUrl(p) || '' }} style={{ width: 80, height: 80, backgroundColor: colors.border }} />
                                                    </TouchableOpacity>
                                                ))}
                                            </ScrollView>
                                        )}
                                        {job.voiceNote && (
                                            <View style={{ backgroundColor: isDark ? '#ffffff05' : '#F9F9F9', borderRadius: 8, padding: 8, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                                <Ionicons name="mic-outline" size={18} color={colors.primary} />
                                                <Text style={{ fontSize: 12, color: colors.text }}>{t('customer_voice_note_attached') || 'Customer Voice Note Attached'}</Text>
                                            </View>
                                        )}
                                    </View>
                                )}
                            </View>
                        )}
                    </View>

                    {/* Part Requests Section (Standard & Custom) */}
                    {fullJob?.partRequests?.length > 0 && (
                        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                                <MaterialCommunityIcons name="tools" size={20} color={colors.primary} />
                                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                                    {t('customer_part_requests') || 'Customer Part Requests'}
                                </Text>
                            </View>

                            {fullJob.partRequests.map((order: any, idx: number) => (
                                <View key={order.id || idx} style={[styles.requestCard, { backgroundColor: isDark ? colors.background : '#F9F9FB', borderColor: colors.border }]}>
                                    <View style={styles.requestHeader}>
                                        <Text style={[styles.requestOrderId, { color: colors.icon }]}>#{order.orderId}</Text>
                                        <View style={[styles.statusBadge, { backgroundColor: colors.primary + '20' }]}>
                                            <Text style={[styles.statusText, { color: colors.primary }]}>{order.status?.toUpperCase()}</Text>
                                        </View>
                                    </View>

                                    {order.items?.map((item: any, i: number) => {
                                        // Determine if custom: if explicitly marked, or matches custom request name/structure
                                        // Manual items (Standard List) don't have productId but should NOT be treated as Custom
                                        const isCustom = item.isCustom ||
                                            item.name === 'Custom Product Request' ||
                                            item.name === t('custom_request') ||
                                            (!!item.description && !item.name); // Fallback: has description but no specific name?

                                        // For custom items, the description is the main identifier usually
                                        const displayName = isCustom ? (item.description || item.name) : item.name;

                                        return (
                                            <View key={i} style={styles.requestItem}>
                                                {item.image && (
                                                    <TouchableOpacity onPress={() => {/* TODO: View Image Modal */ }}>
                                                        <Image
                                                            source={{ uri: getMediaUrl(item.image) || '' }}
                                                            style={{ width: 40, height: 40, borderRadius: 8, backgroundColor: colors.border }}
                                                        />
                                                    </TouchableOpacity>
                                                )}
                                                <View style={styles.requestItemInfo}>
                                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                                                        <Text style={[styles.requestItemName, { color: colors.text }]} numberOfLines={1}>
                                                            {displayName}
                                                        </Text>
                                                        {isCustom ? (
                                                            <View style={[styles.typeBadge, { backgroundColor: '#AF52DE20' }]}>
                                                                <Text style={[styles.typeBadgeText, { color: '#AF52DE' }]}>{t('custom_product') || 'Custom Product'}</Text>
                                                            </View>
                                                        ) : (
                                                            <View style={[styles.typeBadge, { backgroundColor: '#34C75920' }]}>
                                                                <Text style={[styles.typeBadgeText, { color: '#34C759' }]}>{t('standard_product') || 'Standard Product'}</Text>
                                                            </View>
                                                        )}
                                                    </View>

                                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 }}>
                                                        <Text style={[styles.requestItemSub, { color: colors.icon }]}>
                                                            Qty: {item.quantity || 1}
                                                        </Text>
                                                        {item.brand && (
                                                            <View style={{ backgroundColor: colors.border, paddingHorizontal: 4, paddingVertical: 1, borderRadius: 4 }}>
                                                                <Text style={{ fontSize: 10, color: colors.text, fontFamily: 'NotoSans-Medium' }}>{item.brand}</Text>
                                                            </View>
                                                        )}
                                                        {item.partNumber && (
                                                            <Text style={{ fontSize: 11, color: colors.icon, fontFamily: 'NotoSans-Medium' }}>PN: {item.partNumber}</Text>
                                                        )}
                                                    </View>

                                                    {/* Show description if we're not using it as title, or if it's long */}
                                                    {(!isCustom && item.description) && (
                                                        <Text style={[styles.requestItemDesc, { color: colors.icon }]} numberOfLines={2}>
                                                            {item.description}
                                                        </Text>
                                                    )}
                                                </View>

                                                <TouchableOpacity
                                                    style={[styles.importBtn, { borderColor: colors.primary, backgroundColor: colors.primary + '10' }]}
                                                    onPress={() => {
                                                        const newItem: QuoteBillItem = {
                                                            id: Date.now().toString() + Math.random(),
                                                            description: displayName,
                                                            brand: item.brand,
                                                            partNumber: item.partNumber,
                                                            quantity: item.quantity || 1,
                                                            unitPrice: item.price || 0,
                                                            total: (item.price || 0) * (item.quantity || 1),
                                                            isCustom: isCustom,
                                                            images: item.image ? [item.image] : []
                                                        };
                                                        setItems([...items, newItem]);
                                                        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                                                    }}
                                                >
                                                    <Ionicons name="download" size={14} color={colors.primary} />
                                                    <Text style={[styles.importBtnText, { color: colors.primary, marginLeft: 4 }]}>{t('add') || 'Add'}</Text>
                                                </TouchableOpacity>
                                            </View>
                                        );
                                    })}
                                </View>
                            ))}
                        </View>
                    )}

                    {/* Parts Sourcing Reminder */}
                    {job.partsSource === 'customer' && (
                        <View style={[styles.warningBox, { backgroundColor: '#FF950015', borderColor: '#FF950040' }]}>
                            <Ionicons name="warning" size={20} color="#FF9500" />
                            <View style={{ flex: 1 }}>
                                <Text style={[styles.warningTitle, { color: '#FF9500' }]}>{t('customer_providing_parts') || 'Customer Providing Parts'}</Text>
                                <Text style={[styles.warningText, { color: colors.text, opacity: 0.8 }]}>
                                    {t('parts_sourcing_reminder') || 'The customer has opted to provide their own parts. Please only include labor charges and any consumable items you supplied.'}
                                </Text>
                            </View>
                        </View>
                    )}

                    {/* Quote/Bill Item Manager */}
                    <QuoteBillItemManager
                        items={items}
                        laborAmount={laborAmount}
                        onItemsChange={setItems}
                        onLaborAmountChange={setLaborAmount}
                        mode={isQuote ? 'quote' : 'bill'}
                        editable={true}
                    />

                    {/* General Note */}
                    <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('general_note')}</Text>
                        <TextInput
                            style={[styles.textArea, { color: colors.text, borderColor: colors.border, backgroundColor: isDark ? colors.background : '#F9F9F9' }]}
                            placeholder={t('enter_note_placeholder') || 'Enter additional details or message to customer...'}
                            placeholderTextColor={colors.icon}
                            multiline
                            numberOfLines={4}
                            value={note}
                            onChangeText={setNote}
                        />
                    </View>

                    {/* Media Capture */}
                    <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: 12 }]}>{t('attachments') || 'Attachments'}</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexDirection: 'row', marginBottom: 16 }}>
                            <TouchableOpacity
                                style={[styles.mediaPill, { borderColor: colors.primary, backgroundColor: colors.primary + '10' }]}
                                onPress={handleTakePhoto}
                            >
                                <Ionicons name="camera" size={18} color={colors.primary} />
                                <Text style={[styles.mediaPillText, { color: colors.primary }]}>{t('camera')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.mediaPill, { borderColor: colors.primary, backgroundColor: colors.primary + '10' }]}
                                onPress={handlePickImage}
                            >
                                <Ionicons name="image" size={18} color={colors.primary} />
                                <Text style={[styles.mediaPillText, { color: colors.primary }]}>{t('gallery')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    styles.mediaPill,
                                    {
                                        borderColor: isRecording ? colors.notification : colors.primary,
                                        backgroundColor: isRecording ? colors.notification + '10' : colors.primary + '10'
                                    }
                                ]}
                                onPress={() => isRecording ? handleStopRecording() : handleStartRecording()}
                            >
                                <Ionicons
                                    name={isRecording ? "stop-circle" : "mic"}
                                    size={18}
                                    color={isRecording ? colors.notification : colors.primary}
                                />
                                <Text style={[
                                    styles.mediaPillText,
                                    { color: isRecording ? colors.notification : colors.primary }
                                ]}>
                                    {isRecording ? `0:${recordingDuration.toString().padStart(2, '0')}` : t('voice')}
                                </Text>
                            </TouchableOpacity>
                        </ScrollView>

                        {/* Captured Media Previews */}
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
                            {photos.map((photo: string, idx: number) => (
                                <View key={idx} style={styles.previewContainer}>
                                    <Image source={{ uri: getMediaUrl(photo) || undefined }} style={styles.smallPreview} />
                                    <TouchableOpacity
                                        style={styles.removePreviewBtn}
                                        onPress={() => setPhotos(photos.filter((_, i) => i !== idx))}
                                    >
                                        <Ionicons name="close-circle" size={20} color={colors.notification} />
                                    </TouchableOpacity>
                                </View>
                            ))}
                            {voiceNote && (
                                <View style={[styles.voicePreview, { backgroundColor: colors.background, borderColor: colors.border }]}>
                                    <Ionicons name="mic" size={18} color={colors.primary} />
                                    <Text style={[styles.voiceText, { color: colors.text }]} numberOfLines={1}>{t('recorded')}</Text>
                                    <TouchableOpacity onPress={() => setVoiceNote(null)}>
                                        <Ionicons name="trash-outline" size={18} color={colors.notification} />
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>
                    </View>

                    {/* Info Note */}
                    <View style={[styles.infoBox, { backgroundColor: colors.primary + '10', borderColor: colors.primary + '30' }]}>
                        <Ionicons name="information-circle" size={20} color={colors.primary} />
                        <Text style={[styles.infoText, { color: colors.text }]}>
                            {isQuote
                                ? t('quote_info_message')
                                : t('bill_info_message')}
                        </Text>
                    </View>
                </ScrollView>

                {/* Send Button */}
                <View style={[styles.footer, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
                    <View style={styles.summaryGrid}>
                        <View style={styles.summaryItem}>
                            <Text style={[styles.summaryLabel, { color: colors.icon }]}>{t('items_total') || 'Items'}</Text>
                            <Text style={[styles.summaryValue, { color: colors.text, fontSize: 16 }]}>{currencySymbol}{itemsTotal.toFixed(2)}</Text>
                        </View>
                        <View style={styles.summaryItem}>
                            <Text style={[styles.summaryLabel, { color: colors.icon }]}>{t('labor_charges') || 'Labor'}</Text>
                            <Text style={[styles.summaryValue, { color: colors.text, fontSize: 16 }]}>{currencySymbol}{laborAmount.toFixed(2)}</Text>
                        </View>
                        <View style={styles.summaryItem}>
                            <Text style={[styles.summaryLabel, { color: colors.icon }]}>{t('total_amount') || 'Total'}</Text>
                            <Text style={[styles.summaryValue, { color: colors.primary, fontSize: 18 }]}>{currencySymbol}{grandTotal.toFixed(2)}</Text>
                        </View>
                    </View>
                    <AppButton
                        title={isQuote ? t('send_quote') : t('send_bill')}
                        onPress={handleSend}
                        loading={sending}
                        disabled={items.length === 0 && !note.trim() && photos.length === 0 && !voiceNote}
                    />
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
        gap: 16,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
        gap: 20,
    },
    errorText: {
        fontSize: 18,
        fontWeight: '600',
        fontFamily: 'NotoSans-SemiBold',
        textAlign: 'center',
    },
    jobHeader: {
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
    },
    jobHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    jobIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    jobHeaderInfo: {
        flex: 1,
    },
    jobTitle: {
        fontSize: 18,
        fontWeight: '700',
        fontFamily: 'NotoSans-Bold',
        marginBottom: 4,
    },
    jobSubtitle: {
        fontSize: 14,
        fontFamily: 'NotoSans-Regular',
    },
    jobDescription: {
        fontSize: 13,
        fontFamily: 'NotoSans-Medium',
        lineHeight: 18,
    },
    section: {
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        gap: 12,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        fontFamily: 'NotoSans-Bold',
    },
    textArea: {
        borderRadius: 12,
        padding: 12,
        fontSize: 15,
        fontFamily: 'NotoSans-Regular',
        borderWidth: 1,
        minHeight: 100,
        textAlignVertical: 'top',
    },
    infoBox: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        gap: 12,
    },
    infoText: {
        flex: 1,
        fontSize: 14,
        fontFamily: 'NotoSans-Regular',
        lineHeight: 20,
    },
    footer: {
        padding: 16,
        borderTopWidth: 1,
    },
    warningBox: {
        flexDirection: 'row',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        gap: 12,
        marginBottom: 8,
    },
    warningTitle: {
        fontSize: 14,
        fontWeight: '700',
        fontFamily: 'NotoSans-Bold',
        marginBottom: 2,
    },
    warningText: {
        fontSize: 12,
        fontFamily: 'NotoSans-Regular',
        lineHeight: 18,
    },
    summaryGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
        paddingHorizontal: 4,
    },
    summaryItem: {
        gap: 4,
    },
    summaryLabel: {
        fontSize: 12,
        fontFamily: 'NotoSans-Medium',
    },
    summaryValue: {
        fontSize: 20,
        fontFamily: 'NotoSans-Black',
    },
    requestCard: {
        borderRadius: 12,
        padding: 12,
        borderWidth: 1,
        marginBottom: 10,
    },
    requestHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
        paddingBottom: 8,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#CCC',
    },
    requestOrderId: {
        fontSize: 10,
        fontFamily: 'NotoSans-Bold',
    },
    statusBadge: {
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    statusText: {
        fontSize: 9,
        fontFamily: 'NotoSans-Bold',
    },
    requestItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginTop: 8,
    },
    requestItemInfo: {
        flex: 1,
    },
    requestItemName: {
        fontSize: 14,
        fontFamily: 'NotoSans-Bold',
    },
    requestItemSub: {
        fontSize: 12,
        fontFamily: 'NotoSans-Regular',
    },
    requestItemDesc: {
        fontSize: 11,
        fontFamily: 'NotoSans-Regular',
        marginTop: 2,
        fontStyle: 'italic',
    },
    importBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
        borderWidth: 1,
    },
    importBtnText: {
        fontSize: 12,
        fontFamily: 'NotoSans-Bold',
    },
    requirementsList: {
        marginTop: 15,
        padding: 12,
        borderRadius: 12,
        gap: 8,
    },
    requirementsTitle: {
        fontSize: 11,
        fontFamily: 'NotoSans-Bold',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    requirementsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    requirementItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    requirementText: {
        fontSize: 13,
        fontFamily: 'NotoSans-Medium',
    },
    typeBadge: {
        paddingHorizontal: 6,
        paddingVertical: 1,
        borderRadius: 4,
    },
    typeBadgeText: {
        fontSize: 8,
        fontFamily: 'NotoSans-Black',
        textTransform: 'uppercase',
    },

    mediaPill: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 20,
        borderWidth: 1,
        marginRight: 12,
        gap: 8
    },
    mediaPillText: {
        fontSize: 14,
        fontWeight: '600',
        fontFamily: 'NotoSans-Bold'
    },
    previewContainer: {
        position: 'relative'
    },
    smallPreview: {
        width: 60,
        height: 60,
        borderRadius: 12,
        backgroundColor: '#F0F0F0'
    },
    removePreviewBtn: {
        position: 'absolute',
        top: -6,
        right: -6,
        backgroundColor: '#FFF',
        borderRadius: 10
    },
    voicePreview: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 12,
        borderWidth: 1,
        gap: 8
    },
    voiceText: {
        fontSize: 13,
        maxWidth: 100,
        fontFamily: 'NotoSans-Regular'
    },
});
