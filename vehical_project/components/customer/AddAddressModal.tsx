import { AppButton } from '@/components/ui/AppButton';
import { Colors } from '@/constants/theme';
import { useLanguage } from '@/context/LanguageContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Dimensions,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

const { height } = Dimensions.get('window');

interface AddressData {
    label: string;
    addressLine1: string;
    addressLine2: string;
    city: string;
    state: string;
    zipCode: string;
    phone: string;
    lat?: number | null;
    lng?: number | null;
}

interface AddAddressModalProps {
    visible: boolean;
    onClose: () => void;
    onSubmit: (data: AddressData) => Promise<void>;
    initialData?: AddressData | null;
    isEditing?: boolean;
    onUseCurrentLocation?: () => void;
    isLocating?: boolean;
}

export const AddAddressModal = ({
    visible,
    onClose,
    onSubmit,
    initialData,
    isEditing = false,
    onUseCurrentLocation,
    isLocating = false
}: AddAddressModalProps) => {
    const { t } = useLanguage();
    const colorScheme = useColorScheme();
    const theme = colorScheme ?? 'light';
    const colors = Colors[theme];
    const isDark = theme === 'dark';

    const [label, setLabel] = useState('');
    const [line1, setLine1] = useState('');
    const [line2, setLine2] = useState('');
    const [city, setCity] = useState('');
    const [state, setState] = useState('');
    const [zip, setZip] = useState('');
    const [phone, setPhone] = useState('');
    const [lat, setLat] = useState<number | null>(null);
    const [lng, setLng] = useState<number | null>(null);

    useEffect(() => {
        if (visible) {
            if (initialData) {
                setLabel(initialData.label || '');
                setLine1(initialData.addressLine1 || '');
                setLine2(initialData.addressLine2 || '');
                setCity(initialData.city || '');
                setState(initialData.state || '');
                setZip(initialData.zipCode || '');
                setPhone(initialData.phone || '');
                setLat(initialData.lat || null);
                setLng(initialData.lng || null);
            } else {
                setLabel('');
                setLine1('');
                setLine2('');
                setCity('');
                setState('');
                setZip('');
                setPhone('');
                setLat(null);
                setLng(null);
            }
        }
    }, [visible, initialData]);

    const handleSubmit = async () => {
        if (!label || !line1 || !city || !state || !zip || !phone) {
            Alert.alert(t('error'), t('Please fill all required fields'));
            return;
        }

        await onSubmit({
            label,
            addressLine1: line1,
            addressLine2: line2,
            city,
            state,
            zipCode: zip,
            phone,
            lat,
            lng
        });
    };

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View style={styles.modalOverlay}>
                <BlurView intensity={20} tint={isDark ? "dark" : "light"} style={StyleSheet.absoluteFill} />
                <View style={[styles.container, { backgroundColor: colors.background }]}>
                    <View style={[styles.header, { borderBottomColor: colors.border }]}>
                        <Text style={[styles.title, { color: colors.text }]}>
                            {isEditing ? (t('edit_address') || 'Edit Address') : (t('add_address') || 'Add New Address')}
                        </Text>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close-circle" size={30} color={colors.icon} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.locationRow}>
                        <Text style={[styles.subtitle, { color: colors.icon }]}>
                            {t('fill_address_details') || 'Please fill in delivery details'}
                        </Text>
                        {onUseCurrentLocation && (
                            <TouchableOpacity
                                style={[styles.useLocBtn, { backgroundColor: colors.primary + '15' }]}
                                onPress={onUseCurrentLocation}
                                disabled={isLocating}
                            >
                                <Ionicons name="location" size={14} color={colors.primary} />
                                <Text style={[styles.useLocText, { color: colors.primary }]}>
                                    {isLocating ? t('locating') : t('use_current')}
                                </Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
                        <Text style={[styles.inputLabel, { color: colors.text }]}>{t('address_label') || 'Address Label'} *</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
                            placeholder="e.g. Home, Office"
                            placeholderTextColor={colors.icon}
                            value={label}
                            onChangeText={setLabel}
                        />

                        <Text style={[styles.inputLabel, { color: colors.text }]}>{t('address_line_1') || 'Address Line 1'} *</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
                            placeholder="Street address, P.O. box"
                            placeholderTextColor={colors.icon}
                            value={line1}
                            onChangeText={setLine1}
                        />

                        <Text style={[styles.inputLabel, { color: colors.text }]}>{t('address_line_2') || 'Address Line 2'}</Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
                            placeholder="Apartment, suite, unit, building, floor, etc."
                            placeholderTextColor={colors.icon}
                            value={line2}
                            onChangeText={setLine2}
                        />

                        <View style={styles.row}>
                            <View style={styles.halfInput}>
                                <Text style={[styles.inputLabel, { color: colors.text }]}>{t('city') || 'City'} *</Text>
                                <TextInput
                                    style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
                                    placeholder="City"
                                    placeholderTextColor={colors.icon}
                                    value={city}
                                    onChangeText={setCity}
                                />
                            </View>
                            <View style={styles.halfInput}>
                                <Text style={[styles.inputLabel, { color: colors.text }]}>{t('state') || 'State'} *</Text>
                                <TextInput
                                    style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
                                    placeholder="State"
                                    placeholderTextColor={colors.icon}
                                    value={state}
                                    onChangeText={setState}
                                />
                            </View>
                        </View>

                        <View style={styles.row}>
                            <View style={styles.halfInput}>
                                <Text style={[styles.inputLabel, { color: colors.text }]}>{t('zip_code') || 'ZIP Code'} *</Text>
                                <TextInput
                                    style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
                                    placeholder="ZIP"
                                    placeholderTextColor={colors.icon}
                                    value={zip}
                                    onChangeText={setZip}
                                    keyboardType="numeric"
                                />
                            </View>
                            <View style={styles.halfInput}>
                                <Text style={[styles.inputLabel, { color: colors.text }]}>{t('phone') || 'Phone'} *</Text>
                                <TextInput
                                    style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
                                    placeholder="Phone"
                                    placeholderTextColor={colors.icon}
                                    value={phone}
                                    onChangeText={setPhone}
                                    keyboardType="phone-pad"
                                />
                            </View>
                        </View>
                    </ScrollView>

                    <AppButton
                        title={isEditing ? (t('update_address') || 'Update Address') : (t('save_address') || 'Save Address')}
                        onPress={handleSubmit}
                        style={{ marginTop: 20 }}
                        loading={false}
                    />

                    <TouchableOpacity onPress={onClose} style={styles.cancelBtn}>
                        <Text style={[styles.cancelText, { color: colors.primary }]}>{t('cancel') || 'Cancel'}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
    container: { borderRadius: 24, padding: 20, maxHeight: '90%', width: '100%' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15, paddingBottom: 15, borderBottomWidth: 1 },
    title: { fontSize: 20, fontFamily: 'NotoSans-Bold' },
    locationRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
    subtitle: { fontSize: 13, flex: 1, marginRight: 10 },
    useLocBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
    useLocText: { fontSize: 12, fontFamily: 'NotoSans-Bold', marginLeft: 4 },
    content: { maxHeight: height * 0.6 },
    inputLabel: { fontSize: 13, fontFamily: 'NotoSans-Bold', marginBottom: 6, marginTop: 12 },
    input: { height: 48, borderRadius: 12, paddingHorizontal: 12, borderWidth: 1, fontSize: 14, fontFamily: 'NotoSans-Regular' },
    row: { flexDirection: 'row', gap: 12 },
    halfInput: { flex: 1 },
    cancelBtn: { alignSelf: 'center', marginTop: 15, padding: 10 },
    cancelText: { fontFamily: 'NotoSans-Bold', fontSize: 15 },
});
