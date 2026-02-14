import { AppButton } from '@/components/ui/AppButton';
import { Colors } from '@/constants/theme';
import { useLanguage } from '@/context/LanguageContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import React from 'react';
import {
    Dimensions,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

const { height } = Dimensions.get('window');

interface Address {
    id?: string;
    _id?: string;
    label: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    zipCode: string;
    phone?: string;
}

interface AddressSelectionModalProps {
    visible: boolean;
    onClose: () => void;
    addresses: Address[];
    selectedAddressId: string | null;
    onSelectAddress: (id: string) => void;
    onAddNewAddress: () => void;
    onEditAddress: (id: string) => void;
    onConfirm: () => void;
}

export const AddressSelectionModal = ({
    visible,
    onClose,
    addresses,
    selectedAddressId,
    onSelectAddress,
    onAddNewAddress,
    onEditAddress,
    onConfirm
}: AddressSelectionModalProps) => {
    const { t } = useLanguage();
    const colorScheme = useColorScheme();
    const theme = colorScheme ?? 'light';
    const colors = Colors[theme];
    const isDark = theme === 'dark';

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View style={styles.modalOverlay}>
                <BlurView intensity={20} tint={isDark ? "dark" : "light"} style={StyleSheet.absoluteFill} />
                <View style={[styles.container, { backgroundColor: colors.background }]}>
                    <View style={[styles.header, { borderBottomColor: colors.border }]}>
                        <Text style={[styles.title, { color: colors.text }]}>{t('select_address') || 'Select Delivery Address'}</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close-circle" size={30} color={colors.icon} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
                        {addresses.map((addr) => {
                            const addrId = addr.id || addr._id;
                            const isSelected = selectedAddressId === addrId;
                            return (
                                <View
                                    key={addrId}
                                    style={[
                                        styles.addressItem,
                                        {
                                            backgroundColor: colors.card,
                                            borderColor: isSelected ? colors.primary : colors.border,
                                            borderWidth: isSelected ? 2 : 1
                                        }
                                    ]}
                                >
                                    <TouchableOpacity
                                        style={{ flex: 1 }}
                                        onPress={() => addrId && onSelectAddress(addrId)}
                                        activeOpacity={0.7}
                                    >
                                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                                            <Ionicons name={addr.label.toLowerCase().includes('home') ? "home" : "business"} size={16} color={colors.primary} style={{ marginRight: 8 }} />
                                            <Text style={[styles.addrLabel, { color: colors.text }]}>{addr.label}</Text>
                                        </View>
                                        <Text style={[styles.addrText, { color: colors.text }]}>{addr.addressLine1}</Text>
                                        {addr.addressLine2 ? <Text style={[styles.addrText, { color: colors.text }]}>{addr.addressLine2}</Text> : null}
                                        <Text style={[styles.addrSub, { color: colors.icon }]}>
                                            {addr.city}, {addr.state} {addr.zipCode}
                                        </Text>
                                        {addr.phone && (
                                            <Text style={[styles.addrSub, { color: colors.icon, marginTop: 4 }]}>
                                                Phone: {addr.phone}
                                            </Text>
                                        )}
                                    </TouchableOpacity>
                                    <View style={{ alignItems: 'flex-end', justifyContent: 'space-between', paddingLeft: 10, alignSelf: 'stretch' }}>
                                        <TouchableOpacity onPress={() => addrId && onSelectAddress(addrId)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                                            <View style={[styles.radio, { borderColor: isSelected ? colors.primary : colors.icon }]}>
                                                {isSelected && <View style={[styles.radioInner, { backgroundColor: colors.primary }]} />}
                                            </View>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={{ paddingVertical: 8, paddingHorizontal: 4 }}
                                            onPress={() => {
                                                if (addrId) {
                                                    console.log('Editing address:', addrId);
                                                    onEditAddress(addrId);
                                                }
                                            }}
                                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                        >
                                            <Text style={{ color: colors.primary, fontSize: 12, fontFamily: 'NotoSans-Bold' }}>{t('edit')}</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            );
                        })}

                        <TouchableOpacity
                            style={[styles.addBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
                            onPress={onAddNewAddress}
                        >
                            <Ionicons name="add" size={24} color={colors.primary} />
                            <Text style={[styles.addBtnText, { color: colors.primary }]}>
                                {t('add_new_address') || 'Add New Address'}
                            </Text>
                        </TouchableOpacity>
                    </ScrollView>

                    <AppButton
                        title={t('continue_payment') || 'Continue to Payment'}
                        onPress={onConfirm}
                        disabled={!selectedAddressId}
                        loading={false}
                        style={{ opacity: !selectedAddressId ? 0.6 : 1, marginTop: 15 }}
                    />
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
    content: { maxHeight: height * 0.6 },
    addressItem: {
        flexDirection: 'row',
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
        alignItems: 'center'
    },
    addrLabel: { fontFamily: 'NotoSans-Bold', fontSize: 15 },
    addrText: { fontSize: 13, marginTop: 2 },
    addrSub: { fontSize: 12, marginTop: 4 },
    radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, justifyContent: 'center', alignItems: 'center' },
    radioInner: { width: 12, height: 12, borderRadius: 6 },
    addBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderStyle: 'dashed',
        marginTop: 10,
        gap: 8,
        marginBottom: 20
    },
    addBtnText: { fontFamily: 'NotoSans-Bold', fontSize: 15 },
});
