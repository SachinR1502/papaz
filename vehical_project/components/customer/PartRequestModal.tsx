import { AppButton } from '@/components/ui/AppButton';
import { ImageModal } from '@/components/ui/ImageModal';
import { Colors } from '@/constants/theme';
import { useLanguage } from '@/context/LanguageContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Dimensions,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    LayoutAnimation
} from 'react-native';
import { MediaCaptureSection } from './MediaCaptureSection';

const { height } = Dimensions.get('window');

export interface PartRequestItem {
    name: string;
    brand?: string;
    price?: number;
    quantity?: number;
    image?: string;
    description?: string;
    productId?: string;
    partNumber?: string;
}

interface PartRequestModalProps {
    visible: boolean;
    onClose: () => void;
    onSubmit: (items: PartRequestItem[], notes: string, supplierId: string | null, photos: string[], voiceNote: string | null, vehicleId: string | null) => Promise<void>;
    prefillItems?: PartRequestItem[];
    suppliers: any[];
    submitting?: boolean;
    initialNotes?: string;
    initialPhotos?: string[];
    initialVoiceNote?: string | null;
    partsSource?: 'customer' | 'garage' | string;
    vehicles?: any[];
}

export const PartRequestModal: React.FC<PartRequestModalProps> = ({
    visible,
    onClose,
    onSubmit,
    prefillItems = [],
    suppliers = [],
    submitting = false,
    initialNotes,
    initialPhotos = [],
    initialVoiceNote = null,
    partsSource,
    vehicles = []
}) => {
    const { t } = useLanguage();
    const colorScheme = useColorScheme();
    const theme = colorScheme ?? 'light';
    const colors = Colors[theme];
    const isDark = theme === 'dark';

    const [selectedSupplier, setSelectedSupplier] = useState<string | null>(null);
    const [isSupplierDropdownVisible, setIsSupplierDropdownVisible] = useState(false);
    const [supplierSearch, setSupplierSearch] = useState('');
    const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);
    const [isVehicleDropdownVisible, setIsVehicleDropdownVisible] = useState(false);


    // Determine titles and visibility based on partsSource
    const isCustomerSourcing = partsSource === 'customer';

    const getModalTitle = () => {
        if (isCustomerSourcing) return t('list_my_parts') || 'List My Parts';
        if (prefillItems.length > 0) return t('part_req_supply_your_parts');
        return t('create_custom_request') || 'Custom Part Request';
    };

    // Form State
    const [partName, setPartName] = useState('');
    const [partNumber, setPartNumber] = useState('');
    const [brand, setBrand] = useState('');
    const [price, setPrice] = useState('');
    const [qty, setQty] = useState('1');
    const [manualItems, setManualItems] = useState<PartRequestItem[]>([]);

    // UI Expand State
    const [isAddItemExpanded, setIsAddItemExpanded] = useState(prefillItems.length === 0);

    // Custom Form State
    const [customNotes, setCustomNotes] = useState('');
    const [photos, setPhotos] = useState<string[]>([]);
    const [voiceNote, setVoiceNote] = useState<string | null>(null);
    const [isRecording, setIsRecording] = useState(false);
    const [recordingDuration, setRecordingDuration] = useState(0);
    const [recording, setRecording] = useState<Audio.Recording | null>(null);
    const [timer, setTimer] = useState<any>(null);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    const filteredSuppliers = suppliers.filter(s =>
        (s.storeName || s.fullName || '').toLowerCase().includes(supplierSearch.toLowerCase())
    );

    // Sync state with props when modal opens
    useEffect(() => {
        if (visible) {
            if (initialNotes !== undefined) setCustomNotes(initialNotes);
            if (initialPhotos?.length > 0) setPhotos(initialPhotos);
            if (initialVoiceNote) setVoiceNote(initialVoiceNote);
            setIsAddItemExpanded(prefillItems.length === 0);

            // If vehicle is passed, select the first one by default if not set
            if (vehicles.length > 0 && !selectedVehicle) {
                // defaulting logic if needed
            }
        }
    }, [visible, initialNotes, initialPhotos, initialVoiceNote, prefillItems]);

    const handleAddManualItem = () => {
        if (!partName.trim()) {
            Alert.alert(t('error'), t('part_name_required') || 'Please enter a part name');
            return;
        }

        const newItem: PartRequestItem = {
            name: partName,
            partNumber: partNumber,
            brand: brand,
            price: parseFloat(price) || 0,
            quantity: parseInt(qty) || 1
        };

        setManualItems([...manualItems, newItem]);
        setPartName('');
        setPartNumber('');
        setBrand('');
        setPrice('');
        setQty('1');
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    };

    const handleRemoveItem = (index: number, isManual: boolean) => {
        if (isManual) {
            setManualItems(manualItems.filter((_, i) => i !== index));
        } else {
            // Cannot remove prefilled items logic if we want to enforce it, 
            // but for now let's assume prefilled items are fixed or handled by parent.
            // If we want to allow removing prefilled, we need a callback prop.
            Alert.alert(t('note'), t('cannot_remove_prefilled') || 'Job items cannot be removed here.');
        }
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    };

    const handleTakePhoto = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert(t('error'), t('camera_permission_denied'));
            return;
        }
        const result = await ImagePicker.launchCameraAsync({ quality: 0.8, mediaTypes: ImagePicker.MediaTypeOptions.Images });
        if (!result.canceled) setPhotos([...photos, result.assets[0].uri]);
    };

    const handlePickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert(t('error'), t('gallery_permission_denied'));
            return;
        }
        const result = await ImagePicker.launchImageLibraryAsync({ quality: 0.8, mediaTypes: ImagePicker.MediaTypeOptions.Images });
        if (!result.canceled) setPhotos([...photos, result.assets[0].uri]);
    };

    const handleStartRecording = async () => {
        try {
            const { status } = await Audio.requestPermissionsAsync();
            if (status !== 'granted') return;
            await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
            const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
            setRecording(recording);
            setIsRecording(true);
            setRecordingDuration(0);
            const interval = setInterval(() => setRecordingDuration(prev => prev + 1), 1000);
            setTimer(interval);
        } catch (err) { console.error('Failed to start recording', err); }
    };

    const handleStopRecording = async () => {
        if (!recording) return;
        setIsRecording(false);
        if (timer) clearInterval(timer);
        setTimer(null);
        await recording.stopAndUnloadAsync();
        const uri = recording.getURI();
        setVoiceNote(uri);
        setRecording(null);
    };

    const handleSubmit = async () => {
        let items: PartRequestItem[] = [...prefillItems, ...manualItems];

        // If user actively typed in the form but forgot to click "Add"
        if (partName.trim()) {
            items.push({
                name: partName,
                partNumber: partNumber,
                brand: brand,
                price: parseFloat(price) || 0,
                quantity: parseInt(qty) || 1
            });
        }

        // Check if we have ANYTHING to submit
        if (items.length === 0 && !customNotes.trim() && photos.length === 0 && !voiceNote) {
            Alert.alert(t('empty_request'), t('please_add_details') || 'Please add at least one item or describe your request.');
            return;
        }

        // Logic fix: Ensure mixed requests are handled safely.
        // If there are NO structured items, but there ARE notes/media, create a dummy item to hold the request.
        if (items.length === 0) {
            items = [{
                name: t('custom_request_item') || 'General Part Request',
                description: customNotes || 'See details below',
                quantity: 1,
                image: photos[0],
            }];
        }

        await onSubmit(items, customNotes, selectedSupplier, photos, voiceNote, selectedVehicle);
    };

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.modalOverlay}
                enabled
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
            >
                <BlurView intensity={30} tint={isDark ? "dark" : "light"} style={StyleSheet.absoluteFill} />
                <View style={[styles.container, { backgroundColor: colors.background }]}>

                    {/* Header */}
                    <View style={[styles.header, { borderBottomColor: colors.border }]}>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.title, { color: colors.text }]}>{getModalTitle()}</Text>
                            {prefillItems.length > 0 && <Text style={{ fontSize: 12, color: colors.primary, fontWeight: '600' }}>● {t('linked_to_job')}</Text>}
                        </View>
                        <TouchableOpacity onPress={onClose} style={{ padding: 4 }}>
                            <Ionicons name="close-circle" size={32} color={colors.icon} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView
                        style={styles.content}
                        contentContainerStyle={{ paddingBottom: 40 }}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    >
                        {/* Supplier Selection (Hidden for customer sourcing) */}
                        {!isCustomerSourcing && (
                            <View style={styles.section}>
                                <Text style={[styles.fieldLabel, { color: colors.text }]}>{t('select_supplier_optional')}</Text>
                                <TouchableOpacity
                                    style={[styles.dropdownSelector, { backgroundColor: colors.card, borderColor: colors.border }]}
                                    onPress={() => {
                                        setIsSupplierDropdownVisible(!isSupplierDropdownVisible);
                                        setIsVehicleDropdownVisible(false);
                                    }}
                                >
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                        <Ionicons name="storefront-outline" size={18} color={selectedSupplier ? colors.primary : colors.icon} />
                                        <Text style={{ color: selectedSupplier ? colors.text : colors.icon, fontWeight: selectedSupplier ? '600' : '400' }}>
                                            {selectedSupplier ? (suppliers.find(s => (s._id || s.id) === selectedSupplier)?.storeName || 'Selected Supplier') : t('any_available_supplier')}
                                        </Text>
                                    </View>
                                    <Ionicons name={isSupplierDropdownVisible ? "chevron-up" : "chevron-down"} size={18} color={colors.icon} />
                                </TouchableOpacity>

                                {isSupplierDropdownVisible && (
                                    <View style={[styles.dropdownList, { backgroundColor: colors.card, borderColor: colors.border }]}>
                                        <TextInput
                                            style={[styles.dropdownSearch, { color: colors.text, borderBottomColor: colors.border }]}
                                            placeholder={t('search_supplier')}
                                            value={supplierSearch}
                                            onChangeText={setSupplierSearch}
                                            placeholderTextColor={colors.icon}
                                        />
                                        <ScrollView style={{ maxHeight: 150 }} nestedScrollEnabled>
                                            <TouchableOpacity
                                                style={[styles.dropdownItem, { borderBottomColor: colors.border }]}
                                                onPress={() => { setSelectedSupplier(null); setIsSupplierDropdownVisible(false); }}
                                            >
                                                <Text style={{ color: colors.primary, fontWeight: '600' }}>{t('any_available_supplier')}</Text>
                                            </TouchableOpacity>
                                            {filteredSuppliers.map((s, i) => (
                                                <TouchableOpacity
                                                    key={i}
                                                    style={[styles.dropdownItem, { borderBottomColor: colors.border }]}
                                                    onPress={() => { setSelectedSupplier(s._id || s.id); setIsSupplierDropdownVisible(false); }}
                                                >
                                                    <Text style={{ color: colors.text }}>{s.storeName || s.fullName}</Text>
                                                    {s.rating && <Text style={{ fontSize: 11, color: colors.icon }}>⭐ {s.rating}</Text>}
                                                </TouchableOpacity>
                                            ))}
                                        </ScrollView>
                                    </View>
                                )}
                            </View>
                        )}

                        {/* Vehicle Selection */}
                        <View style={styles.section}>
                            <Text style={[styles.fieldLabel, { color: colors.text }]}>{t('select_vehicle')}</Text>
                            <TouchableOpacity
                                style={[styles.dropdownSelector, { backgroundColor: colors.card, borderColor: colors.border }]}
                                onPress={() => {
                                    setIsVehicleDropdownVisible(!isVehicleDropdownVisible);
                                    setIsSupplierDropdownVisible(false);
                                }}
                            >
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                    <Ionicons name="car-outline" size={18} color={selectedVehicle ? colors.primary : colors.icon} />
                                    <Text style={{ color: selectedVehicle ? colors.text : colors.icon, fontWeight: selectedVehicle ? '600' : '400' }}>
                                        {(() => {
                                            const vehicle = vehicles.find(v => (v._id || v.id) === selectedVehicle);
                                            if (selectedVehicle) {
                                                return vehicle ? `${vehicle.make} ${vehicle.model}` : t('vehicle_selected');
                                            }
                                            return t('choose_vehicle_link');
                                        })()}
                                    </Text>
                                </View>
                                <Ionicons name={isVehicleDropdownVisible ? "chevron-up" : "chevron-down"} size={18} color={colors.icon} />
                            </TouchableOpacity>

                            {isVehicleDropdownVisible && (
                                <View style={[styles.dropdownList, { backgroundColor: colors.card, borderColor: colors.border }]}>
                                    <ScrollView style={{ maxHeight: 150 }} nestedScrollEnabled>
                                        {vehicles.map((v, i) => (
                                            <TouchableOpacity
                                                key={i}
                                                style={[styles.dropdownItem, { borderBottomColor: colors.border }]}
                                                onPress={() => { setSelectedVehicle(v._id || v.id); setIsVehicleDropdownVisible(false); }}
                                            >
                                                <Text style={{ color: colors.text }}>{v.make} {v.model}</Text>
                                                <Text style={{ fontSize: 11, color: colors.icon }}>{v.brand} {v.model} • {v.registrationNumber}</Text>
                                            </TouchableOpacity>
                                        ))}
                                        {vehicles.length === 0 && (
                                            <View style={{ padding: 12 }}>
                                                <Text style={{ color: colors.icon, fontSize: 13, fontStyle: 'italic' }}>{t('no_vehicles_found')}</Text>
                                            </View>
                                        )}
                                    </ScrollView>
                                </View>
                            )}
                        </View>

                        {/* List of Added Items */}
                        {([...prefillItems, ...manualItems].length > 0) ? (
                            <View style={styles.section}>
                                <Text style={[styles.fieldLabel, { color: colors.text }]}>{t('items_list')} ({prefillItems.length + manualItems.length})</Text>
                                {prefillItems.map((item, idx) => (
                                    <View key={`pre-${idx}`} style={[styles.itemCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                                        <View style={[styles.itemIcon, { backgroundColor: colors.primary + '15' }]}>
                                            <Ionicons name="construct" size={18} color={colors.primary} />
                                        </View>
                                        <View style={styles.itemInfo}>
                                            <Text style={[styles.itemName, { color: colors.text }]}>{item.name}</Text>
                                            <Text style={[styles.itemDetails, { color: colors.icon }]}>{item.quantity}x • {t('job_requirement')}</Text>
                                        </View>
                                        <Ionicons name="lock-closed" size={16} color={colors.icon} style={{ opacity: 0.5 }} />
                                    </View>
                                ))}
                                {manualItems.map((item, idx) => (
                                    <View key={`man-${idx}`} style={[styles.itemCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                                        <View style={[styles.itemIcon, { backgroundColor: colors.secondary + '15' }]}>
                                            <Ionicons name="cart" size={18} color={colors.secondary} />
                                        </View>
                                        <View style={styles.itemInfo}>
                                            <Text style={[styles.itemName, { color: colors.text }]}>{item.name}</Text>
                                            <Text style={[styles.itemDetails, { color: colors.icon }]}>
                                                {item.quantity}x {item.brand ? `• ${item.brand}` : ''} {item.partNumber ? `• ${item.partNumber}` : ''}
                                            </Text>
                                        </View>
                                        <TouchableOpacity onPress={() => handleRemoveItem(idx, true)} style={{ padding: 4 }}>
                                            <Ionicons name="trash-outline" size={20} color={colors.notification} />
                                        </TouchableOpacity>
                                    </View>
                                ))}
                            </View>
                        ) : null}

                        {/* Add Item Form */}
                        <View style={[styles.section, { marginBottom: 10 }]}>
                            <TouchableOpacity
                                onPress={() => { LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut); setIsAddItemExpanded(!isAddItemExpanded); }}
                                style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}
                            >
                                <Text style={[styles.fieldLabel, { color: colors.text, marginBottom: 0 }]}>{t('add_specific_part')}</Text>
                                <Ionicons name={isAddItemExpanded ? "chevron-up-circle" : "add-circle"} size={24} color={colors.primary} />
                            </TouchableOpacity>

                            {isAddItemExpanded && (
                                <View style={[styles.formCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                                    <TextInput
                                        style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: isDark ? '#2C2C2E' : '#F9F9F9' }]}
                                        placeholder={t('part_name_placeholder') || "Part Name (e.g. Brake Pads)"}
                                        placeholderTextColor={colors.icon}
                                        value={partName}
                                        onChangeText={setPartName}
                                    />
                                    <View style={styles.row}>
                                        <TextInput
                                            style={[styles.input, { flex: 1, color: colors.text, borderColor: colors.border, backgroundColor: isDark ? '#2C2C2E' : '#F9F9F9' }]}
                                            placeholder={t('part_number_opt') || "Part # (Optional)"}
                                            placeholderTextColor={colors.icon}
                                            value={partNumber}
                                            onChangeText={setPartNumber}
                                        />
                                        <View style={{ width: 10 }} />
                                        <TextInput
                                            style={[styles.input, { width: 80, color: colors.text, borderColor: colors.border, backgroundColor: isDark ? '#2C2C2E' : '#F9F9F9', textAlign: 'center' }]}
                                            placeholder="Qty"
                                            placeholderTextColor={colors.icon}
                                            value={qty}
                                            onChangeText={setQty}
                                            keyboardType="numeric"
                                        />
                                    </View>
                                    <View style={styles.row}>
                                        <TextInput
                                            style={[styles.input, { flex: 1, color: colors.text, borderColor: colors.border, backgroundColor: isDark ? '#2C2C2E' : '#F9F9F9' }]}
                                            placeholder={t('brand_opt') || "Brand (Optional)"}
                                            placeholderTextColor={colors.icon}
                                            value={brand}
                                            onChangeText={setBrand}
                                        />
                                    </View>
                                    <TouchableOpacity
                                        style={[styles.addButton, { borderColor: colors.primary, backgroundColor: colors.primary + '10' }]}
                                        onPress={handleAddManualItem}
                                    >
                                        <Ionicons name="add" size={18} color={colors.primary} />
                                        <Text style={{ color: colors.primary, fontWeight: '700' }}>{t('add_to_list')}</Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>

                        {/* General Notes and Media */}
                        <View style={styles.section}>
                            <Text style={[styles.fieldLabel, { color: colors.text }]}>{t('additional_details_media')}</Text>
                            <View style={[styles.mediaCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                                <TextInput
                                    style={[styles.textArea, { color: colors.text }]}
                                    placeholder={t('describe_request_placeholder') || "Describe what you need in detail, or add standard items above and use this for extra instructions..."}
                                    placeholderTextColor={colors.icon}
                                    value={customNotes}
                                    onChangeText={setCustomNotes}
                                    multiline
                                    numberOfLines={4}
                                    textAlignVertical="top"
                                />
                                <View style={{ height: 1, backgroundColor: colors.border, marginVertical: 12 }} />
                                <MediaCaptureSection
                                    photos={photos}
                                    voiceNote={voiceNote}
                                    isRecording={isRecording}
                                    recordingDuration={recordingDuration}
                                    onPickImage={handlePickImage}
                                    onTakePhoto={handleTakePhoto}
                                    onRemovePhoto={(idx) => setPhotos(photos.filter((_, i) => i !== idx))}
                                    onStartRecording={handleStartRecording}
                                    onStopRecording={handleStopRecording}
                                    onRemoveVoiceNote={() => setVoiceNote(null)}
                                    onViewPhoto={setSelectedImage}
                                />
                            </View>
                        </View>

                    </ScrollView>

                    <View style={[styles.footer, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
                        <AppButton
                            title={submitting ? t('sending') : t('submit_request')}
                            onPress={handleSubmit}
                            loading={submitting}
                            variant="primary"
                        />
                    </View>
                </View>

                <ImageModal
                    visible={!!selectedImage}
                    uri={selectedImage || ''}
                    onClose={() => setSelectedImage(null)}
                />
            </KeyboardAvoidingView >
        </Modal >
    );
};

const styles = StyleSheet.create({
    modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
    container: { height: '90%', width: '100%', borderTopLeftRadius: 24, borderTopRightRadius: 24, overflow: 'hidden' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1 },
    title: { fontSize: 20, fontFamily: 'NotoSans-Bold', fontWeight: '800' },
    content: { flex: 1, padding: 20 },
    section: { marginBottom: 24 },
    fieldLabel: { fontSize: 13, fontWeight: '700', fontFamily: 'NotoSans-Bold', marginBottom: 8, letterSpacing: 0.5, textTransform: 'uppercase' },

    dropdownSelector: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14, borderRadius: 14, borderWidth: 1 },
    dropdownList: { position: 'absolute', top: 50, left: 0, right: 0, borderRadius: 14, borderWidth: 1, zIndex: 100, padding: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 5 },
    dropdownSearch: { padding: 10, borderBottomWidth: 1, marginBottom: 4 },
    dropdownItem: { padding: 12, borderBottomWidth: 1 },

    itemCard: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 16, borderWidth: 1, marginBottom: 8, gap: 12 },
    itemIcon: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    itemInfo: { flex: 1 },
    itemName: { fontSize: 15, fontWeight: '700' },
    itemDetails: { fontSize: 12, marginTop: 2 },

    formCard: { padding: 16, borderRadius: 16, borderWidth: 1, gap: 12 },
    input: { height: 48, borderRadius: 12, borderWidth: 1, paddingHorizontal: 12, fontSize: 14 },
    row: { flexDirection: 'row', alignItems: 'center' },
    addButton: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', height: 44, borderRadius: 12, borderWidth: 1, borderStyle: 'dashed', gap: 6 },

    mediaCard: { padding: 16, borderRadius: 16, borderWidth: 1 },
    textArea: { height: 80, fontSize: 14 },

    footer: { padding: 20, borderTopWidth: 1 },
});
