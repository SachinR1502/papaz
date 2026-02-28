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
    Switch,
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
    taluka: string;
    district: string;
    division: string;
    region: string;
    country: string;
    isDefault: boolean;
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
    const [taluka, setTaluka] = useState('');
    const [district, setDistrict] = useState('');
    const [division, setDivision] = useState('');
    const [region, setRegion] = useState('');
    const [country, setCountry] = useState('India');
    const [isDefault, setIsDefault] = useState(false);
    const [lat, setLat] = useState<number | null>(null);
    const [lng, setLng] = useState<number | null>(null);

    const [isSaving, setIsSaving] = useState(false);

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
                setTaluka(initialData.taluka || '');
                setDistrict(initialData.district || '');
                setDivision(initialData.division || '');
                setRegion(initialData.region || '');
                setCountry(initialData.country || 'India');
                setIsDefault(initialData.isDefault || false);
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
                setTaluka('');
                setDistrict('');
                setDivision('');
                setRegion('');
                setCountry('India');
                setIsDefault(false);
                setLat(null);
                setLng(null);
            }
        }
    }, [visible, initialData]);

    const handleSubmit = async () => {
        if (!label || !line1 || !city || !state || !zip || !phone) {
            Alert.alert(t('error') || 'Error', t('Please fill all required fields') || 'Saari jankari bharein');
            return;
        }

        try {
            setIsSaving(true);
            await onSubmit({
                label,
                addressLine1: line1,
                addressLine2: line2,
                city,
                state,
                zipCode: zip,
                phone,
                taluka,
                district,
                division,
                region,
                country,
                isDefault,
                lat,
                lng
            });
            onClose();
        } catch (error) {
            Alert.alert(t('error') || 'Error', t('Failed to save address') || 'Address save nahi ho paya');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View style={styles.modalOverlay}>
                <BlurView intensity={20} tint={isDark ? "dark" : "light"} style={StyleSheet.absoluteFill} />
                <View style={[styles.container, { backgroundColor: colors.background }]}>
                    <View style={[styles.header, { borderBottomColor: colors.border }]}>
                        <View>
                            <Text style={[styles.title, { color: colors.text }]}>
                                {isEditing ? (t('edit_address') || 'Edit Address') : (t('add_address') || 'Add New Address')}
                            </Text>
                            <Text style={[styles.subtitle, { color: colors.icon }]}>
                                {t('fill_address_details') || 'Pata ki jankari bharein'}
                            </Text>
                        </View>
                        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                            <Ionicons name="close" size={24} color={isDark ? '#fff' : '#000'} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
                        {onUseCurrentLocation && (
                            <TouchableOpacity
                                style={[styles.useLocBtn, { backgroundColor: colors.primary + '10', borderColor: colors.primary + '30' }]}
                                onPress={onUseCurrentLocation}
                                disabled={isLocating}
                            >
                                <Ionicons name="location" size={18} color={colors.primary} />
                                <Text style={[styles.useLocText, { color: colors.primary }]}>
                                    {isLocating ? (t('locating') || 'Locating...') : (t('use_current_location') || 'Sahi location ka upyog karein')}
                                </Text>
                            </TouchableOpacity>
                        )}

                        <View style={styles.formSection}>
                            <Text style={[styles.inputLabel, { color: colors.text }]}>
                                {t('address_label') || 'Pata ka Naam (Label)'} *
                            </Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
                                placeholder="Ghar, Office, etc."
                                placeholderTextColor={colors.icon + '80'}
                                value={label}
                                onChangeText={setLabel}
                            />

                            <Text style={[styles.inputLabel, { color: colors.text }]}>
                                {t('address_line_1') || 'Ghar / Flat No / Gali (Line 1)'} *
                            </Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
                                placeholder="Flat no, building name, lane"
                                placeholderTextColor={colors.icon + '80'}
                                value={line1}
                                onChangeText={setLine1}
                            />

                            <Text style={[styles.inputLabel, { color: colors.text }]}>
                                {t('address_line_2') || 'Area / Colony (Line 2)'}
                            </Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
                                placeholder="Colony, Landmark, etc."
                                placeholderTextColor={colors.icon + '80'}
                                value={line2}
                                onChangeText={setLine2}
                            />

                            <View style={styles.row}>
                                <View style={styles.halfInput}>
                                    <Text style={[styles.inputLabel, { color: colors.text }]}>{t('city') || 'Shehar (City)'} *</Text>
                                    <TextInput
                                        style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
                                        placeholder="City"
                                        placeholderTextColor={colors.icon + '80'}
                                        value={city}
                                        onChangeText={setCity}
                                    />
                                </View>
                                <View style={styles.halfInput}>
                                    <Text style={[styles.inputLabel, { color: colors.text }]}>{t('state') || 'Rajya (State)'} *</Text>
                                    <TextInput
                                        style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
                                        placeholder="State"
                                        placeholderTextColor={colors.icon + '80'}
                                        value={state}
                                        onChangeText={setState}
                                    />
                                </View>
                            </View>

                            <View style={styles.row}>
                                <View style={styles.halfInput}>
                                    <Text style={[styles.inputLabel, { color: colors.text }]}>{t('zip_code') || 'Pin Code'} *</Text>
                                    <TextInput
                                        style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
                                        placeholder="6 digits"
                                        placeholderTextColor={colors.icon + '80'}
                                        value={zip}
                                        onChangeText={setZip}
                                        keyboardType="numeric"
                                        maxLength={6}
                                    />
                                </View>
                                <View style={styles.halfInput}>
                                    <Text style={[styles.inputLabel, { color: colors.text }]}>{t('phone') || 'Mobile Number'} *</Text>
                                    <TextInput
                                        style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
                                        placeholder="10 digits"
                                        placeholderTextColor={colors.icon + '80'}
                                        value={phone}
                                        onChangeText={setPhone}
                                        keyboardType="phone-pad"
                                        maxLength={10}
                                    />
                                </View>
                            </View>

                            <View style={styles.row}>
                                <View style={styles.halfInput}>
                                    <Text style={[styles.inputLabel, { color: colors.text }]}>{t('taluka') || 'Taluka / Tehsil'}</Text>
                                    <TextInput
                                        style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
                                        placeholder="Taluka"
                                        placeholderTextColor={colors.icon + '80'}
                                        value={taluka}
                                        onChangeText={setTaluka}
                                    />
                                </View>
                                <View style={styles.halfInput}>
                                    <Text style={[styles.inputLabel, { color: colors.text }]}>{t('district') || 'District'}</Text>
                                    <TextInput
                                        style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
                                        placeholder="District"
                                        placeholderTextColor={colors.icon + '80'}
                                        value={district}
                                        onChangeText={setDistrict}
                                    />
                                </View>
                            </View>

                            <View style={[styles.defaultRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
                                <View style={styles.defaultInfo}>
                                    <Text style={[styles.defaultTitle, { color: colors.text }]}>
                                        {t('set_as_default') || 'Default set karein'}
                                    </Text>
                                    <Text style={[styles.defaultSubtitle, { color: colors.icon }]}>
                                        {t('default_description') || 'Hamesha isi pate par delivery'}
                                    </Text>
                                </View>
                                <Switch
                                    value={isDefault}
                                    onValueChange={setIsDefault}
                                    trackColor={{ false: colors.border, true: colors.primary + '50' }}
                                    thumbColor={isDefault ? colors.primary : colors.icon}
                                />
                            </View>
                        </View>
                    </ScrollView>

                    <View style={styles.footer}>
                        <AppButton
                            title={isEditing ? (t('update_address') || 'Update Address') : (t('save_address') || 'Khata Band Karein (Save)')}
                            onPress={handleSubmit}
                            loading={isSaving}
                            style={styles.saveBtn}
                        />

                        <TouchableOpacity onPress={onClose} style={styles.cancelBtn}>
                            <Text style={[styles.cancelText, { color: colors.icon }]}>{t('cancel') || 'Cancel'}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
    container: { borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, paddingBottom: 34, maxHeight: height * 0.9, width: '100%', shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 20 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
    title: { fontSize: 24, fontFamily: 'NotoSans-Bold', letterSpacing: -0.5 },
    subtitle: { fontSize: 13, fontFamily: 'NotoSans-Regular', marginTop: 2 },
    closeBtn: { backgroundColor: '#f5f5f5', borderRadius: 12, padding: 4 },
    content: { marginBottom: 10 },
    useLocBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 16, borderWidth: 1, marginBottom: 20, gap: 8 },
    useLocText: { fontSize: 14, fontFamily: 'NotoSans-Bold' },
    formSection: { gap: 4 },
    inputLabel: { fontSize: 13, fontFamily: 'NotoSans-Bold', marginTop: 12, marginBottom: 6, marginLeft: 2 },
    input: { height: 52, borderRadius: 16, paddingHorizontal: 16, borderWidth: 1, fontSize: 15, fontFamily: 'NotoSans-Regular' },
    row: { flexDirection: 'row', gap: 16 },
    halfInput: { flex: 1 },
    defaultRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderRadius: 20, borderWidth: 1, marginTop: 24, marginBottom: 10 },
    defaultInfo: { flex: 1, marginRight: 10 },
    defaultTitle: { fontSize: 15, fontFamily: 'NotoSans-Bold' },
    defaultSubtitle: { fontSize: 12, fontFamily: 'NotoSans-Regular', marginTop: 2 },
    footer: { gap: 10 },
    saveBtn: { height: 56, borderRadius: 18 },
    cancelBtn: { alignSelf: 'center', padding: 10 },
    cancelText: { fontFamily: 'NotoSans-Bold', fontSize: 15 },
});
