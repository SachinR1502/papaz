import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '@/context/LanguageContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

interface DeliveryModalProps {
    visible: boolean;
    onClose: () => void;
    onSubmit: (data: any) => Promise<void>;
    initialData?: {
        vehicleNumber?: string;
        driverName?: string;
        personName?: string;
        driverPhone?: string;
        // courier fields
        courierName?: string;
        trackingId?: string;
        trackingUrl?: string;
        notes?: string;
    };
    loading?: boolean;
}

export function DeliveryModal({
    visible,
    onClose,
    onSubmit,
    initialData,
    loading = false
}: DeliveryModalProps) {
    const { t } = useLanguage();
    const colorScheme = useColorScheme();
    const theme = colorScheme ?? 'light';
    const colors = Colors[theme];

    const [deliveryType, setDeliveryType] = useState<'local' | 'courier'>('local');
    const [deliveryForm, setDeliveryForm] = useState({
        driverName: '',
        vehicleNumber: '',
        personName: '',
        driverPhone: '',
        courierName: '',
        trackingId: '',
        trackingUrl: '',
        notes: ''
    });

    useEffect(() => {
        if (visible) {
            if (initialData) {
                setDeliveryForm(prev => ({
                    ...prev,
                    ...initialData
                }));
                // Try to infer type if not explicit, but default to local
                if (initialData.courierName) {
                    setDeliveryType('courier');
                } else {
                    setDeliveryType('local');
                }
            } else {
                // Reset form
                setDeliveryForm({
                    driverName: '',
                    vehicleNumber: '',
                    personName: '',
                    driverPhone: '',
                    courierName: '',
                    trackingId: '',
                    trackingUrl: '',
                    notes: ''
                });
                setDeliveryType('local');
            }
        }
    }, [visible, initialData]);


    const handleSubmit = async () => {
        if (deliveryType === 'local') {
            if (!deliveryForm.driverName || !deliveryForm.vehicleNumber) {
                Alert.alert(t('error') || 'Error', t('please_fill_required_fields') || 'Please enter driver name and vehicle number');
                return;
            }
        } else {
            if (!deliveryForm.courierName || !deliveryForm.trackingId) {
                Alert.alert(t('error') || 'Error', t('please_fill_required_fields') || 'Please enter courier name and tracking ID');
                return;
            }
        }

        const deliveryData = deliveryType === 'local' ? {
            type: 'local',
            driverName: deliveryForm.driverName,
            vehicleNumber: deliveryForm.vehicleNumber,
            personName: deliveryForm.personName,
            driverPhone: deliveryForm.driverPhone,
            notes: deliveryForm.notes
        } : {
            type: 'courier',
            courierName: deliveryForm.courierName,
            trackingId: deliveryForm.trackingId,
            trackingUrl: deliveryForm.trackingUrl,
            notes: deliveryForm.notes
        };

        await onSubmit(deliveryData);
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent
            onRequestClose={onClose}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.modalOverlay}
            >
                <View style={[styles.modalContent, { backgroundColor: colors.background, borderColor: colors.border }]}>
                    <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
                        <Text style={[styles.modalTitle, { color: colors.text }]}>{t('delivery_details') || 'Delivery Details'}</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close" size={24} color={colors.text} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                        {/* Delivery Type Tabs */}
                        <View style={{ flexDirection: 'row', marginBottom: 20, backgroundColor: colors.card, padding: 4, borderRadius: 12 }}>
                            <TouchableOpacity
                                style={{ flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8, backgroundColor: deliveryType === 'local' ? colors.primary : 'transparent' }}
                                onPress={() => setDeliveryType('local')}
                            >
                                <Text style={{ color: deliveryType === 'local' ? '#FFF' : colors.text, fontWeight: 'bold' }}>{t('local_delivery') || 'Local Delivery'}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={{ flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8, backgroundColor: deliveryType === 'courier' ? colors.primary : 'transparent' }}
                                onPress={() => setDeliveryType('courier')}
                            >
                                <Text style={{ color: deliveryType === 'courier' ? '#FFF' : colors.text, fontWeight: 'bold' }}>{t('courier_partner') || 'Courier Partner'}</Text>
                            </TouchableOpacity>
                        </View>

                        {deliveryType === 'local' ? (
                            <>
                                <Text style={[styles.inputLabel, { color: colors.text }]}>{t('person_name') || 'Person Name'}</Text>
                                <TextInput
                                    style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border, marginBottom: 15 }]}
                                    value={deliveryForm.personName}
                                    onChangeText={(v) => setDeliveryForm(prev => ({ ...prev, personName: v }))}
                                    placeholder={t('enter_person_name') || 'Enter Name'}
                                    placeholderTextColor={colors.icon}
                                />

                                <Text style={[styles.inputLabel, { color: colors.text }]}>{t('vehicle_number') || 'Vehicle Number'} *</Text>
                                <TextInput
                                    style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border, marginBottom: 15 }]}
                                    value={deliveryForm.vehicleNumber}
                                    onChangeText={(v) => setDeliveryForm(prev => ({ ...prev, vehicleNumber: v }))}
                                    placeholder={t('enter_vehicle_number') || 'Enter Vehicle No.'}
                                    placeholderTextColor={colors.icon}
                                />

                                <Text style={[styles.inputLabel, { color: colors.text }]}>{t('driver_name') || 'Driver Name'} *</Text>
                                <TextInput
                                    style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border, marginBottom: 15 }]}
                                    value={deliveryForm.driverName}
                                    onChangeText={(v) => setDeliveryForm(prev => ({ ...prev, driverName: v }))}
                                    placeholder={t('enter_driver_name') || 'Enter Driver Name'}
                                    placeholderTextColor={colors.icon}
                                />

                                <Text style={[styles.inputLabel, { color: colors.text }]}>{t('driver_phone') || 'Driver Phone'}</Text>
                                <TextInput
                                    style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border, marginBottom: 15 }]}
                                    value={deliveryForm.driverPhone}
                                    onChangeText={(v) => setDeliveryForm(prev => ({ ...prev, driverPhone: v }))}
                                    placeholder={t('enter_driver_phone') || 'Enter Driver Phone'}
                                    placeholderTextColor={colors.icon}
                                    keyboardType="phone-pad"
                                />
                            </>
                        ) : (
                            <>
                                <Text style={[styles.inputLabel, { color: colors.text }]}>{t('courier_name') || 'Delivery Partner Name'} *</Text>
                                <TextInput
                                    style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border, marginBottom: 15 }]}
                                    value={deliveryForm.courierName}
                                    onChangeText={(v) => setDeliveryForm(prev => ({ ...prev, courierName: v }))}
                                    placeholder={t('enter_courier_name') || 'e.g. BlueDart, FedEx'}
                                    placeholderTextColor={colors.icon}
                                />

                                <Text style={[styles.inputLabel, { color: colors.text }]}>{t('tracking_id') || 'Delivery/Tracking ID'} *</Text>
                                <TextInput
                                    style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border, marginBottom: 15 }]}
                                    value={deliveryForm.trackingId}
                                    onChangeText={(v) => setDeliveryForm(prev => ({ ...prev, trackingId: v }))}
                                    placeholder={t('enter_tracking_id') || 'Tracking ID'}
                                    placeholderTextColor={colors.icon}
                                />

                                <Text style={[styles.inputLabel, { color: colors.text }]}>{t('tracking_url') || 'Details/URL'}</Text>
                                <TextInput
                                    style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border, marginBottom: 15 }]}
                                    value={deliveryForm.trackingUrl}
                                    onChangeText={(v) => setDeliveryForm(prev => ({ ...prev, trackingUrl: v }))}
                                    placeholder={t('enter_other_details') || 'Other Details'}
                                    placeholderTextColor={colors.icon}
                                />
                            </>
                        )}

                        <TouchableOpacity
                            style={[styles.saveBtn, { backgroundColor: colors.primary, marginTop: 10 }]}
                            onPress={handleSubmit}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#FFF" />
                            ) : (
                                <Text style={styles.saveBtnText}>{t('confirm_shipping') || 'Confirm Shipping'}</Text>
                            )}
                        </TouchableOpacity>
                        <View style={{ height: 40 }} />
                    </ScrollView>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 25, maxHeight: '80%', borderWidth: 1 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, paddingBottom: 15, borderBottomWidth: 1 },
    modalTitle: { fontSize: 20, fontFamily: 'NotoSans-Black' },
    modalBody: { paddingBottom: 20 },
    inputLabel: { fontSize: 14, fontFamily: 'NotoSans-Bold', marginBottom: 8 },
    input: { height: 50, borderRadius: 12, paddingHorizontal: 15, fontSize: 16, fontFamily: 'NotoSans-Regular', borderWidth: 1 },
    saveBtn: { height: 55, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
    saveBtnText: { color: '#FFF', fontSize: 16, fontFamily: 'NotoSans-Bold' },
});
