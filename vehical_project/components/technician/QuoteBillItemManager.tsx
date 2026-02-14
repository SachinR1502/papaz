
import { AudioPlayer } from '@/components/ui/AudioPlayer';
import { Colors } from '@/constants/theme';
import { useLanguage } from '@/context/LanguageContext';
import { useTechnician } from '@/context/TechnicianContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getMediaUrl } from '@/utils/mediaHelpers';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { BlurView } from 'expo-blur';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import { Alert, Image, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export interface QuoteBillItem {
    id: string;
    description: string;
    brand?: string;
    partNumber?: string;
    quantity: number;
    unitPrice: number;
    total: number;
    isCustom?: boolean;
    isNote?: boolean;
    productId?: string; // Optional: Link to a catalog product
    images?: string[];
    voiceNote?: string | null;
}

interface QuoteBillItemManagerProps {
    items: QuoteBillItem[];
    laborAmount: number;
    onItemsChange: (items: QuoteBillItem[]) => void;
    onLaborAmountChange: (amount: number) => void;
    mode: 'quote' | 'bill';
    editable?: boolean;
}

export const QuoteBillItemManager: React.FC<QuoteBillItemManagerProps> = ({
    items,
    laborAmount,
    onItemsChange,
    onLaborAmountChange,
    mode,
    editable = true
}) => {
    const { t } = useLanguage();
    const colorScheme = useColorScheme();
    const theme = colorScheme ?? 'light';
    const colors = Colors[theme];
    const isDark = theme === 'dark';
    const { uploadFile } = useTechnician();

    const [showAddModal, setShowAddModal] = useState(false);
    const [editingItem, setEditingItem] = useState<QuoteBillItem | null>(null);
    const [formData, setFormData] = useState({
        description: '',
        brand: '',
        partNumber: '',
        quantity: '1',
        unitPrice: '0',
        isNote: false
    });

    // Media State
    const [photos, setPhotos] = useState<string[]>([]);
    const [voiceNote, setVoiceNote] = useState<string | null>(null);
    const [isRecording, setIsRecording] = useState(false);
    const [recordingDuration, setRecordingDuration] = useState(0);
    const [recording, setRecording] = useState<Audio.Recording | null>(null);
    const [timer, setTimer] = useState<any>(null);

    const getItemsTotal = () => {
        return items.reduce((sum, item) => {
            if (item.isNote || item.unitPrice === 0) return sum;
            return sum + (item.total || 0);
        }, 0);
    };

    const calculateTotal = () => {
        return getItemsTotal() + (parseFloat(laborAmount.toString()) || 0);
    };

    const resetForm = () => {
        setFormData({
            description: '',
            brand: '',
            partNumber: '',
            quantity: '1',
            unitPrice: '0',
            isNote: false
        });
        setPhotos([]);
        setVoiceNote(null);
        setEditingItem(null);
    };

    // Media Handlers
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
            console.log('[ItemManager] Photo captured, uploading:', result.assets[0].uri);
            try {
                // Upload newly captured photo
                const uploadRes = await uploadFile(result.assets[0].uri, 'image');
                console.log('[ItemManager] Photo upload success:', uploadRes);
                const url = uploadRes.url || uploadRes.path; // handle different response structures
                if (url) {
                    setPhotos([...photos, url]);
                }
            } catch (error) {
                console.error("[ItemManager] Photo upload failed:", error);
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
            console.log('[ItemManager] Image picked, uploading:', result.assets[0].uri);
            try {
                // Upload newly picked image
                const uploadRes = await uploadFile(result.assets[0].uri, 'image');
                console.log('[ItemManager] Image upload success:', uploadRes);
                const url = uploadRes.url || uploadRes.path;
                if (url) {
                    setPhotos([...photos, url]);
                }
            } catch (error) {
                console.error("[ItemManager] Image upload failed:", error);
                Alert.alert(t('error'), t('upload_failed') || "Failed to upload image");
            }
        }
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
                setVoiceNote(url);
            } catch (error) {
                console.error("Failed to upload voice note:", error);
                Alert.alert(t('error'), t('upload_failed') || "Failed to upload voice note");
            }
        }

        setRecording(null);
    };

    const handleAddItem = () => {
        if (!formData.description.trim()) {
            Alert.alert(t('error') || 'Error', t('description_required') || 'Description is required');
            return;
        }

        const quantity = parseInt(formData.quantity) || 1;
        const unitPrice = formData.isNote ? 0 : (parseFloat(formData.unitPrice) || 0);

        const newItem: QuoteBillItem = {
            id: editingItem?.id || Date.now().toString(),
            description: formData.description,
            brand: formData.brand,
            partNumber: formData.partNumber,
            quantity,
            unitPrice,
            total: quantity * unitPrice,
            isCustom: editingItem?.isCustom || false,
            isNote: formData.isNote,
            images: photos,
            voiceNote: voiceNote
        };

        if (editingItem) {
            onItemsChange(items.map(item => item.id === editingItem.id ? newItem : item));
        } else {
            onItemsChange([...items, newItem]);
        }

        setShowAddModal(false);
        resetForm();
    };

    const handleEditItem = (item: QuoteBillItem) => {
        setEditingItem(item);
        setFormData({
            description: item.description,
            brand: item.brand || '',
            partNumber: item.partNumber || '',
            quantity: item.quantity.toString(),
            unitPrice: item.unitPrice.toString(),
            isNote: item.isNote || item.unitPrice === 0
        });
        setPhotos(item.images || []);
        setVoiceNote(item.voiceNote || null);
        setShowAddModal(true);
    };

    const handleRemoveItem = (itemId: string) => {
        Alert.alert(
            t('confirm'),
            t('remove_item_confirm'),
            [
                { text: t('cancel'), style: 'cancel' },
                {
                    text: t('remove'),
                    style: 'destructive',
                    onPress: () => onItemsChange(items.filter(item => item.id !== itemId))
                }
            ]
        );
    };

    return (
        <View style={styles.container}>
            {/* Unified Content Area */}
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <Ionicons name={mode === 'quote' ? "document-text" : "receipt"} size={22} color={colors.primary} />
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>
                            {mode === 'quote' ? (t('quote_items') || 'Quote Items') : (t('bill_items') || 'Bill Items')}
                        </Text>
                    </View>
                    {editable && (
                        <TouchableOpacity
                            style={[styles.addButton, { backgroundColor: colors.primary }]}
                            onPress={() => {
                                resetForm();
                                setShowAddModal(true);
                            }}
                        >
                            <Ionicons name="add" size={20} color="#FFF" />
                            <Text style={styles.addButtonText}>{t('add_item') || 'Add Item'}</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {items.length === 0 ? (
                    <View style={[styles.emptyState, { backgroundColor: isDark ? colors.card : '#F9F9FB', borderColor: colors.border, borderWidth: 1, borderStyle: 'dashed' }]}>
                        <MaterialCommunityIcons name="package-variant" size={48} color={colors.icon} style={{ opacity: 0.5 }} />
                        <Text style={[styles.emptyText, { color: colors.icon }]}>
                            {t('no_items_added') || 'No items added yet'}
                        </Text>
                    </View>
                ) : (
                    <View style={styles.itemsList}>
                        {items.map((item) => (
                            <View
                                key={item.id}
                                style={[
                                    styles.itemCard,
                                    {
                                        backgroundColor: isDark ? colors.background : '#FFF',
                                        borderColor: colors.border
                                    }
                                ]}
                            >
                                <View style={styles.itemContent}>
                                    <View style={styles.itemHeader}>
                                        <Text style={[styles.itemDescription, { color: colors.text }]}>
                                            {item.description}
                                        </Text>
                                    </View>

                                    {/* Brand & Part Number Display */}
                                    {(item.brand || item.partNumber) && (
                                        <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
                                            {item.brand && (
                                                <View style={[styles.typeBadge, { backgroundColor: colors.border }]}>
                                                    <Text style={[styles.typeBadgeText, { color: colors.text }]}>{item.brand}</Text>
                                                </View>
                                            )}
                                            {item.partNumber && (
                                                <View style={[styles.typeBadge, { backgroundColor: colors.border }]}>
                                                    <Text style={[styles.typeBadgeText, { color: colors.text }]}>PN: {item.partNumber}</Text>
                                                </View>
                                            )}
                                        </View>
                                    )}

                                    <View style={styles.itemFooter}>
                                        {item.description.toLowerCase().includes('service fee') || item.description.toLowerCase().includes('pickup fee') ? (
                                            <View style={[styles.noteBadge, { backgroundColor: colors.primary + '20' }]}>
                                                <Text style={[styles.noteBadgeText, { color: colors.primary }]}>SERVICE FEE</Text>
                                            </View>
                                        ) : item.isNote || item.unitPrice === 0 ? (
                                            <View style={[styles.noteBadge, { backgroundColor: colors.border }]}>
                                                <Text style={[styles.noteBadgeText, { color: colors.text }]}>NOTE</Text>
                                            </View>
                                        ) : (
                                            <>
                                                <Text style={[styles.itemQuantity, { color: colors.icon }]}>
                                                    {`${item.quantity} × ₹${item.unitPrice.toFixed(2)}`}
                                                </Text>
                                                <Text style={[styles.itemTotal, { color: colors.primary }]}>
                                                    ₹{item.total.toFixed(2)}
                                                </Text>
                                            </>
                                        )}
                                    </View>

                                    {/* Media Visibility */}
                                    {(item.images || item.voiceNote) && (
                                        <View style={{ marginTop: 8, gap: 6 }}>
                                            {item.images && item.images.length > 0 && (
                                                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexDirection: 'row' }}>
                                                    {item.images.map((img, i) => (
                                                        <Image
                                                            key={i}
                                                            source={{ uri: getMediaUrl(img) || '' }}
                                                            style={{ width: 40, height: 40, borderRadius: 8, marginRight: 6, backgroundColor: colors.border }}
                                                        />
                                                    ))}
                                                </ScrollView>
                                            )}
                                            {item.voiceNote && (
                                                <View style={{ width: '100%', maxWidth: 200 }}>
                                                    <AudioPlayer uri={item.voiceNote} />
                                                </View>
                                            )}
                                        </View>
                                    )}
                                </View>
                                {editable && (
                                    <View style={styles.itemActions}>
                                        <TouchableOpacity
                                            style={[styles.actionButton, { backgroundColor: colors.primary + '15' }]}
                                            onPress={() => handleEditItem(item)}
                                        >
                                            <Ionicons name="pencil" size={16} color={colors.primary} />
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={[styles.actionButton, { backgroundColor: colors.notification + '15' }]}
                                            onPress={() => handleRemoveItem(item.id)}
                                        >
                                            <Ionicons name="trash-outline" size={16} color={colors.notification} />
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </View>
                        ))}
                    </View>
                )}
            </View>

            {/* Labor Amount */}
            <View style={[styles.laborSection, { backgroundColor: isDark ? colors.card : '#F8F9FE', borderColor: colors.border, borderWidth: 1, marginTop: 10 }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <View style={[styles.laborIconBg, { backgroundColor: colors.sales + '15' }]}>
                        <Ionicons name="hammer-outline" size={20} color={colors.sales} />
                    </View>
                    <Text style={[styles.laborLabel, { color: colors.text }]}>{t('labor_charges') || 'Labor Charges'}</Text>
                </View>
                {editable ? (
                    <View style={styles.laborInputWrapper}>
                        <Text style={{ color: colors.icon, fontSize: 16, marginRight: 4 }}>₹</Text>
                        <TextInput
                            style={[styles.laborInput, { color: colors.text }]}
                            value={laborAmount.toString()}
                            onChangeText={(text) => onLaborAmountChange(parseFloat(text) || 0)}
                            keyboardType="numeric"
                            placeholder="0"
                            placeholderTextColor={colors.icon}
                        />
                    </View>
                ) : (
                    <Text style={[styles.laborValue, { color: colors.primary }]}>
                        ₹{laborAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </Text>
                )}
            </View>

            {/* Grand Total & Breakdown */}
            <View style={[styles.totalSection, { backgroundColor: colors.primary }]}>
                <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4, opacity: 0.9 }}>
                        <Text style={[styles.totalLabel, { fontSize: 10 }]}>{t('items_total') || 'Items Total'}</Text>
                        <Text style={[styles.totalLabel, { fontSize: 10 }]}>₹{getItemsTotal().toLocaleString()}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8, opacity: 0.9 }}>
                        <Text style={[styles.totalLabel, { fontSize: 10 }]}>{t('labor_charges') || 'Labor Charges'}</Text>
                        <Text style={[styles.totalLabel, { fontSize: 10 }]}>₹{parseFloat(laborAmount.toString() || '0').toLocaleString()}</Text>
                    </View>
                    <View style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.2)', marginBottom: 8 }} />
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text style={styles.totalLabel}>{mode === 'quote' ? t('estimated_total') : t('final_total')}</Text>
                        <Text style={styles.totalValue}>₹{calculateTotal().toLocaleString(undefined, { minimumFractionDigits: 2 })}</Text>
                    </View>
                </View>
            </View>


            {/* Add/Edit Item Modal */}
            <Modal visible={showAddModal} animationType="slide" transparent onRequestClose={() => setShowAddModal(false)}>
                <BlurView intensity={isDark ? 40 : 80} style={styles.modalOverlay} tint={isDark ? 'dark' : 'light'}>
                    <View style={[styles.modalContainer, { backgroundColor: colors.card }]}>
                        <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
                            <Text style={[styles.modalTitle, { color: colors.text }]}>
                                {editingItem ? t('edit_item') : t('add_item')}
                                {editingItem?.isCustom && ' (Special Request)'}
                            </Text>
                            <TouchableOpacity onPress={() => setShowAddModal(false)}>
                                <Ionicons name="close" size={24} color={colors.icon} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>

                            {/* Part Name / Description */}
                            <View style={styles.formGroup}>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                                    <Text style={[styles.label, { color: colors.text, marginBottom: 0 }]}>
                                        {t('part_name') || 'Part Name / Description'} *
                                    </Text>
                                    <TouchableOpacity
                                        onPress={() => setFormData({ ...formData, isNote: !formData.isNote })}
                                        style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}
                                    >
                                        <Ionicons
                                            name={formData.isNote ? "checkbox" : "square-outline"}
                                            size={20}
                                            color={formData.isNote ? colors.primary : colors.icon}
                                        />
                                        <Text style={{ fontSize: 13, color: colors.text }}>Mark as Note</Text>
                                    </TouchableOpacity>
                                </View>
                                <TextInput
                                    style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: isDark ? colors.background : '#FFF' }]}
                                    value={formData.description}
                                    onChangeText={(text) => setFormData({ ...formData, description: text })}
                                    placeholder={t('enter_part_name') || 'Enter part name...'}
                                    placeholderTextColor={colors.icon}
                                />
                            </View>

                            {/* Brand & Part Number */}
                            <View style={styles.row}>
                                <View style={[styles.formGroup, { flex: 1 }]}>
                                    <Text style={[styles.label, { color: colors.text }]}>{t('brand') || 'Brand'}</Text>
                                    <TextInput
                                        style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: isDark ? colors.background : '#FFF' }]}
                                        value={formData.brand}
                                        onChangeText={(text) => setFormData({ ...formData, brand: text })}
                                        placeholder="e.g. Bosch"
                                        placeholderTextColor={colors.icon}
                                    />
                                </View>
                                <View style={[styles.formGroup, { flex: 1 }]}>
                                    <Text style={[styles.label, { color: colors.text }]}>{t('part_number') || 'Part Number'}</Text>
                                    <TextInput
                                        style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: isDark ? colors.background : '#FFF' }]}
                                        value={formData.partNumber}
                                        onChangeText={(text) => setFormData({ ...formData, partNumber: text })}
                                        placeholder="e.g. 123-456"
                                        placeholderTextColor={colors.icon}
                                    />
                                </View>
                            </View>

                            {/* Qty & Price */}
                            {!formData.isNote && (
                                <View style={styles.row}>
                                    <View style={[styles.formGroup, { flex: 1 }]}>
                                        <Text style={[styles.label, { color: colors.text }]}>{t('quantity') || 'Quantity'}</Text>
                                        <TextInput
                                            style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: isDark ? colors.background : '#FFF' }]}
                                            value={formData.quantity}
                                            onChangeText={(text) => setFormData({ ...formData, quantity: text })}
                                            keyboardType="numeric"
                                            placeholder="1"
                                            placeholderTextColor={colors.icon}
                                        />
                                    </View>
                                    <View style={[styles.formGroup, { flex: 1 }]}>
                                        <Text style={[styles.label, { color: colors.text }]}>{t('unit_price') || 'Unit Price'} (₹)</Text>
                                        <TextInput
                                            style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: isDark ? colors.background : '#FFF' }]}
                                            value={formData.unitPrice}
                                            onChangeText={(text) => setFormData({ ...formData, unitPrice: text })}
                                            keyboardType="numeric"
                                            placeholder="0"
                                            placeholderTextColor={colors.icon}
                                        />
                                    </View>
                                </View>
                            )}

                            {/* Media Capture */}
                            {/* Media Capture */}
                            <View style={[styles.formGroup, { marginTop: 12 }]}>
                                <Text style={[styles.label, { color: colors.text }]}>{t('attachments') || 'Attachments'}</Text>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexDirection: 'row', marginBottom: 12 }}>
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
                                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                                    {photos.map((photo: string, idx: number) => (
                                        <View key={idx} style={styles.previewContainer}>
                                            <Image source={{ uri: getMediaUrl(photo) || undefined }} style={styles.smallPreview} />
                                            <TouchableOpacity
                                                style={styles.removePreviewBtn}
                                                onPress={() => setPhotos(photos.filter((_, i) => i !== idx))}
                                            >
                                                <Ionicons name="close-circle" size={18} color={colors.notification} />
                                            </TouchableOpacity>
                                        </View>
                                    ))}
                                    {voiceNote && (
                                        <View style={[styles.voicePreview, { backgroundColor: colors.card, borderColor: colors.border }]}>
                                            <Ionicons name="mic" size={16} color={colors.primary} />
                                            <Text style={[styles.voiceText, { color: colors.text }]} numberOfLines={1}>{t('recorded')}</Text>
                                            <TouchableOpacity onPress={() => setVoiceNote(null)}>
                                                <Ionicons name="trash-outline" size={16} color={colors.notification} />
                                            </TouchableOpacity>
                                        </View>
                                    )}
                                </View>
                            </View>

                        </ScrollView>

                        <View style={[styles.modalFooter, { borderTopWidth: 1, borderTopColor: colors.border }]}>
                            <TouchableOpacity
                                style={[styles.modalButton, { backgroundColor: colors.primary }]}
                                onPress={handleAddItem}
                            >
                                <Text style={styles.modalButtonText}>
                                    {editingItem ? (t('update_item') || 'Update Item') : (t('add_item') || 'Add Item')}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </BlurView>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        gap: 16,
    },
    tabs: {
        flexDirection: 'row',
        borderRadius: 12,
        padding: 4,
    },
    tab: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
        borderRadius: 8,
        gap: 8,
    },
    tabText: {
        fontSize: 14,
        fontFamily: 'NotoSans-Bold',
    },
    section: {
        gap: 12,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        fontFamily: 'NotoSans-Bold',
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 12,
        gap: 4,
    },
    addButtonText: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: '600',
        fontFamily: 'NotoSans-SemiBold',
    },
    emptyState: {
        padding: 40,
        borderRadius: 16,
        alignItems: 'center',
        gap: 12,
    },
    emptyText: {
        fontSize: 14,
        fontFamily: 'NotoSans-Regular',
    },
    itemsList: {
        gap: 12,
    },
    itemCard: {
        flexDirection: 'row',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        gap: 12,
    },
    itemContent: {
        flex: 1,
        gap: 6,
    },
    itemHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    itemDescription: {
        flex: 1,
        fontSize: 15,
        fontWeight: '600',
        fontFamily: 'NotoSans-SemiBold',
    },
    noteBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
    },
    noteBadgeText: {
        fontSize: 11,
        fontWeight: '600',
        fontFamily: 'NotoSans-SemiBold',
    },
    typeBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
    },
    typeBadgeText: {
        fontSize: 10,
        fontFamily: 'NotoSans-Bold',
        textTransform: 'uppercase',
    },
    itemMeta: {
        fontSize: 13,
        fontFamily: 'NotoSans-Regular',
    },
    itemFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    itemQuantity: {
        fontSize: 13,
        fontFamily: 'NotoSans-Regular',
    },
    itemTotal: {
        fontSize: 16,
        fontWeight: '700',
        fontFamily: 'NotoSans-Bold',
    },
    itemActions: {
        gap: 8,
    },
    actionButton: {
        width: 32,
        height: 32,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    laborSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderRadius: 20,
    },
    laborIconBg: {
        width: 36,
        height: 36,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    laborLabel: {
        fontSize: 15,
        fontWeight: '700',
        fontFamily: 'NotoSans-Bold',
    },
    laborInputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 2,
        borderBottomColor: '#AF52DE40',
        paddingHorizontal: 8,
    },
    laborInput: {
        fontSize: 18,
        fontWeight: '800',
        fontFamily: 'NotoSans-Black',
        textAlign: 'left',
        minWidth: 80,
    },
    laborValue: {
        fontSize: 18,
        fontWeight: '800',
        fontFamily: 'NotoSans-Black',
    },
    totalSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 22,
        borderRadius: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
    totalLabel: {
        color: '#FFF',
        fontSize: 12,
        fontWeight: '700',
        fontFamily: 'NotoSans-Bold',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    totalValue: {
        color: '#FFF',
        fontSize: 28,
        fontWeight: '800',
        fontFamily: 'NotoSans-Black',
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    modalContainer: {
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        maxHeight: '85%',
        elevation: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -10 },
        shadowOpacity: 0.1,
        shadowRadius: 15,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 24,
        borderBottomWidth: 1,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: '800',
        fontFamily: 'NotoSans-Black',
    },
    modalContent: {
        padding: 24,
    },
    typeSelector: {
        flexDirection: 'row',
        borderRadius: 14,
        padding: 4,
        marginBottom: 24,
    },
    typeTab: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 10,
        alignItems: 'center',
    },
    typeTabText: {
        fontSize: 13,
        fontWeight: '700',
        fontFamily: 'NotoSans-Bold',
    },
    formGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 13,
        fontWeight: '700',
        fontFamily: 'NotoSans-Bold',
        marginBottom: 10,
        textTransform: 'uppercase',
        opacity: 0.7,
    },
    input: {
        borderWidth: 1.5,
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        fontFamily: 'NotoSans-Medium',
    },
    row: {
        flexDirection: 'row',
        gap: 16,
    },
    modalFooter: {
        padding: 24,
        paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    },
    modalButton: {
        padding: 18,
        borderRadius: 18,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    modalButtonText: {
        color: '#FFF',
        fontSize: 17,
        fontWeight: '800',
        fontFamily: 'NotoSans-Black',
    },
    mediaPill: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1, marginRight: 10, gap: 6 },
    mediaPillText: { fontSize: 13, fontWeight: '600', fontFamily: 'NotoSans-Bold' },
    previewContainer: { position: 'relative' },
    smallPreview: { width: 50, height: 50, borderRadius: 8 },
    removePreviewBtn: { position: 'absolute', top: -5, right: -5 },
    voicePreview: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12, borderWidth: 1, gap: 6 },
    voiceText: { fontSize: 12, maxWidth: 60, fontFamily: 'NotoSans-Regular' },
});
