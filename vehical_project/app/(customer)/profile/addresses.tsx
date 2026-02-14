import { Colors } from '@/constants/theme';
import { useCustomer } from '@/context/CustomerContext';
import { useLanguage } from '@/context/LanguageContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
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
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SavedAddressesScreen() {
    const router = useRouter();
    const { profile, addNewAddress, updateAddress, removeAddress } = useCustomer();
    const { t } = useLanguage();
    const colorScheme = useColorScheme();
    const theme = colorScheme ?? 'light';
    const colors = Colors[theme];
    const isDark = theme === 'dark';

    const [isModalVisible, setIsModalVisible] = React.useState(false);
    const [editingId, setEditingId] = React.useState<string | null>(null);
    const [isSaving, setIsSaving] = React.useState(false);

    // Form State
    const [label, setLabel] = React.useState('');
    const [pincode, setPincode] = React.useState('');
    const [addressLine1, setAddressLine1] = React.useState('');
    const [addressLine2, setAddressLine2] = React.useState('');
    const [city, setCity] = React.useState(''); // Post Office Name (Area)
    const [district, setDistrict] = React.useState('');
    const [state, setState] = React.useState('');
    const [country, setCountry] = React.useState('');
    const [taluka, setTaluka] = React.useState('');

    // Pincode Logic
    const [postOffices, setPostOffices] = React.useState<any[]>([]);
    const [isLoadingPincode, setIsLoadingPincode] = React.useState(false);
    const [showPostOfficeSelection, setShowPostOfficeSelection] = React.useState(false);

    const addresses = profile?.savedAddresses || [];

    const resetForm = () => {
        setLabel('');
        setPincode('');
        setAddressLine1('');
        setAddressLine2('');
        setCity('');
        setDistrict('');
        setState('');
        setCountry('');
        setTaluka('');
        setPostOffices([]);
        setShowPostOfficeSelection(false);
        setEditingId(null);
    };

    const handlePincodeChange = async (text: string) => {
        // Only allow numbers
        if (!/^\d*$/.test(text)) return;

        setPincode(text);

        if (text.length === 6) {
            fetchPincodeDetails(text);
        } else {
            setPostOffices([]);
            setShowPostOfficeSelection(false);
        }
    };

    const fetchPincodeDetails = async (code: string) => {
        setIsLoadingPincode(true);
        try {
            const response = await fetch(`https://api.postalpincode.in/pincode/${code}`);
            const data = await response.json();

            if (data && data[0] && data[0].Status === 'Success') {
                const poList = data[0].PostOffice;
                setPostOffices(poList);

                // Auto-fill common fields from first entry
                if (poList.length > 0) {
                    const first = poList[0];
                    setDistrict(first.District);
                    setState(first.State);
                    setCountry(first.Country);
                    setTaluka(first.Block);

                    if (poList.length === 1) {
                        setCity(first.Name);
                    } else {
                        setShowPostOfficeSelection(true);
                    }
                }
            } else {
                Alert.alert("Invalid Pincode", "Could not fetch details for this pincode.");
                setPostOffices([]);
            }
        } catch (error) {
            console.error(error);
            Alert.alert("Error", "Failed to fetch pincode details.");
        } finally {
            setIsLoadingPincode(false);
        }
    };

    const selectPostOffice = (po: any) => {
        setCity(po.Name);
        setDistrict(po.District);
        setState(po.State);
        setCountry(po.Country);
        setTaluka(po.Block);
        setShowPostOfficeSelection(false);
    };

    const handleSaveAddress = async () => {
        if (!label || !pincode || !addressLine1 || !city || !state) {
            Alert.alert(t("Error"), t("Please fill all required fields"));
            return;
        }

        setIsSaving(true);
        try {
            const icon = label.toLowerCase().includes('home') ? 'home' : label.toLowerCase().includes('work') ? 'briefcase' : 'location';

            const payload = {
                label,
                addressLine1,
                addressLine2,
                city,
                state,
                country,
                district,
                taluka,
                zipCode: pincode,
                icon
            };

            if (editingId) {
                await updateAddress(editingId, payload);
                Alert.alert(t("Success"), t("Address updated successfully"));
            } else {
                await addNewAddress(payload);
                Alert.alert(t("Success"), t("Address added successfully"));
            }
            closeModal();
        } catch (e) {
            Alert.alert(t("Error"), t("Failed to save address"));
        } finally {
            setIsSaving(false);
        }
    };

    const handleRemoveAddress = (id: string) => {
        Alert.alert(
            t("Delete Address"),
            t("Are you sure you want to delete this address?"),
            [
                { text: t("Cancel"), style: "cancel" },
                {
                    text: t("Delete"),
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await removeAddress(id);
                        } catch (e) {
                            Alert.alert(t("Error"), t("Failed to delete address"));
                        }
                    }
                }
            ]
        );
    };

    const openEditModal = (item: any) => {
        setEditingId(item._id || item.id);
        setLabel(item.label || '');
        setPincode(item.zipCode || '');
        setAddressLine1(item.addressLine1 || '');
        setAddressLine2(item.addressLine2 || '');
        setCity(item.city || '');
        setDistrict(item.district || '');
        setState(item.state || '');
        setCountry(item.country || '');
        setTaluka(item.taluka || '');
        setIsModalVisible(true);
    };

    const closeModal = () => {
        setIsModalVisible(false);
        resetForm();
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
            <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace('/(customer)/(tabs)')} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>{t('Saved Addresses')}</Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {addresses.map((item: any) => (
                    <View key={item.id || item._id} style={[styles.addressCard, { backgroundColor: colors.card }]}>
                        <View style={[styles.iconBg, { backgroundColor: isDark ? colors.border : '#F0F7FF' }]}>
                            <Ionicons name={(item.icon || 'location') as any} size={22} color={colors.primary} />
                        </View>
                        <View style={styles.info}>
                            <Text style={[styles.label, { color: colors.text }]}>{item.label}</Text>
                            <Text style={[styles.text, { color: colors.icon }]}>{item.address}</Text>
                        </View>
                        <View style={{ flexDirection: 'row', gap: 15 }}>
                            <TouchableOpacity onPress={() => openEditModal(item)}>
                                <Ionicons name="create-outline" size={22} color={colors.primary} />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => handleRemoveAddress(item._id || item.id)}>
                                <Ionicons name="trash-outline" size={22} color={colors.sales} />
                            </TouchableOpacity>
                        </View>
                    </View>
                ))}

                <TouchableOpacity
                    style={[styles.addBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
                    onPress={() => setIsModalVisible(true)}
                >
                    <Ionicons name="add" size={20} color={colors.primary} />
                    <Text style={[styles.addBtnText, { color: colors.primary }]}>{t('Add New Address')}</Text>
                </TouchableOpacity>
            </ScrollView>

            <Modal
                visible={isModalVisible}
                animationType="slide"
                transparent
                onRequestClose={closeModal}
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                    style={styles.modalOverlay}
                >
                    <View style={[styles.modalContent, { backgroundColor: colors.background, borderColor: colors.border }]}>
                        <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
                            <Text style={[styles.modalTitle, { color: colors.text }]}>{editingId ? t('Edit Address') : t('Add New Address')}</Text>
                            <TouchableOpacity onPress={closeModal}>
                                <Ionicons name="close" size={24} color={colors.text} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalBody} contentContainerStyle={{ paddingBottom: 20 }} showsVerticalScrollIndicator={false}>

                            {/* Pincode Section */}
                            <Text style={[styles.inputLabel, { color: colors.text }]}>{t('Pincode')}</Text>
                            <View style={styles.pincodeContainer}>
                                <TextInput
                                    style={[styles.input, { flex: 1, backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
                                    value={pincode}
                                    onChangeText={handlePincodeChange}
                                    placeholder="424206"
                                    placeholderTextColor={colors.icon}
                                    keyboardType="numeric"
                                    maxLength={6}
                                />
                                {isLoadingPincode && <ActivityIndicator size="small" color={colors.primary} style={{ marginLeft: 10 }} />}
                            </View>

                            {/* Post Office Selection */}
                            {showPostOfficeSelection && postOffices.length > 0 && (
                                <View style={[styles.poList, { borderColor: colors.border, backgroundColor: isDark ? '#1C1C1E' : '#fafafa' }]}>
                                    <Text style={[styles.helperText, { color: colors.icon }]}>{t('Select Area / Post Office:')}</Text>
                                    <ScrollView style={{ maxHeight: 150 }} nestedScrollEnabled>
                                        {postOffices.map((po, index) => (
                                            <TouchableOpacity key={index} style={styles.poItem} onPress={() => selectPostOffice(po)}>
                                                <Text style={{ color: colors.text, fontFamily: 'NotoSans-Regular' }}>{po.Name}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </ScrollView>
                                </View>
                            )}

                            {/* Auto-Filled Fields */}
                            <View style={styles.row}>
                                <View style={{ flex: 1, marginRight: 10 }}>
                                    <Text style={[styles.inputLabel, { color: colors.text }]}>{t('State')}</Text>
                                    <TextInput style={[styles.input, { backgroundColor: colors.card, color: colors.icon, borderColor: colors.border }]} value={state} editable={false} />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={[styles.inputLabel, { color: colors.text }]}>{t('District')}</Text>
                                    <TextInput style={[styles.input, { backgroundColor: colors.card, color: colors.icon, borderColor: colors.border }]} value={district} editable={false} />
                                </View>
                            </View>

                            <View style={styles.row}>
                                <View style={{ flex: 1, marginRight: 10 }}>
                                    <Text style={[styles.inputLabel, { color: colors.text }]}>{t('Taluka / Block')}</Text>
                                    <TextInput style={[styles.input, { backgroundColor: colors.card, color: colors.icon, borderColor: colors.border }]} value={taluka} editable={false} />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={[styles.inputLabel, { color: colors.text }]}>{t('Country')}</Text>
                                    <TextInput style={[styles.input, { backgroundColor: colors.card, color: colors.icon, borderColor: colors.border }]} value={country} editable={false} />
                                </View>
                            </View>

                            <Text style={[styles.inputLabel, { color: colors.text, marginTop: 10 }]}>{t('Area / Post Office / City')}</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
                                value={city}
                                onChangeText={setCity}
                                placeholder="Locality"
                                placeholderTextColor={colors.icon}
                            />

                            {/* Manual Fields */}
                            <Text style={[styles.inputLabel, { color: colors.text, marginTop: 15 }]}>{t('House No / Building / Street')}</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
                                value={addressLine1}
                                onChangeText={setAddressLine1}
                                placeholder="Flat 101, Galaxy Apts..."
                                placeholderTextColor={colors.icon}
                            />

                            <Text style={[styles.inputLabel, { color: colors.text, marginTop: 10 }]}>{t('Landmark (Optional)')}</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
                                value={addressLine2}
                                onChangeText={setAddressLine2}
                                placeholder="Near Main Road"
                                placeholderTextColor={colors.icon}
                            />

                            <Text style={[styles.inputLabel, { color: colors.text, marginTop: 15 }]}>{t('Label (e.g. Home, Work)')}</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
                                value={label}
                                onChangeText={setLabel}
                                placeholder="Home"
                                placeholderTextColor={colors.icon}
                            />

                            <TouchableOpacity
                                style={[styles.saveBtn, { backgroundColor: colors.primary }]}
                                onPress={handleSaveAddress}
                                disabled={isSaving}
                            >
                                <Text style={styles.saveBtnText}>{isSaving ? t('Saving...') : editingId ? t('Update Address') : t('Save Address')}</Text>
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FE' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: '#FFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F2F2F7'
    },
    backBtn: { width: 44, height: 44, justifyContent: 'center' },
    headerTitle: { fontSize: 18, fontFamily: 'NotoSans-Bold', color: '#1A1A1A' },
    scrollContent: { padding: 20 },
    addressCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        padding: 16,
        borderRadius: 24,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.03,
        shadowRadius: 10,
        elevation: 2
    },
    iconBg: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#F0F7FF', justifyContent: 'center', alignItems: 'center' },
    info: { flex: 1, marginLeft: 15, marginRight: 10 },
    label: { fontSize: 16, fontFamily: 'NotoSans-Bold', color: '#1A1A1A' },
    text: { fontSize: 13, color: '#8E8E93', marginTop: 4, lineHeight: 18 },
    addBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        backgroundColor: '#FFF',
        padding: 18,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#F0F0F0'
    },
    addBtnText: { color: '#007AFF', fontSize: 16, fontFamily: 'NotoSans-Bold' },

    // Modal Styles
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 25, height: '90%' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, paddingBottom: 15, borderBottomWidth: 1 },
    modalTitle: { fontSize: 20, fontFamily: 'NotoSans-Black' },
    modalBody: { flex: 1 },
    inputLabel: { fontSize: 14, fontFamily: 'NotoSans-Bold', marginBottom: 8 },
    input: { height: 50, borderRadius: 12, paddingHorizontal: 15, fontSize: 16, fontFamily: 'NotoSans-Regular', borderWidth: 1, marginBottom: 5 },
    saveBtn: { height: 55, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginTop: 30, marginBottom: 20 },
    saveBtnText: { color: '#FFF', fontSize: 16, fontFamily: 'NotoSans-Bold' },

    // New Styles for Pincode UI
    pincodeContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
    poList: { borderWidth: 1, borderRadius: 12, padding: 10, marginBottom: 15, marginTop: 5 },
    helperText: { fontSize: 12, marginBottom: 10, fontFamily: 'NotoSans-Bold' },
    poItem: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#eee' },
    row: { flexDirection: 'row', marginBottom: 15 }
});
