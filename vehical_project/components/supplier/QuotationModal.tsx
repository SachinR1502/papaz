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

interface QuotationModalProps {
    visible: boolean;
    onClose: () => void;
    onSubmit: (items: any[], totalAmount: number) => Promise<void>;
    initialItems: any[];
    order?: any; // For vehicle details display
    currencySymbol?: string;
    loading?: boolean;
}

export function QuotationModal({
    visible,
    onClose,
    onSubmit,
    initialItems,
    order,
    currencySymbol = '$',
    loading = false
}: QuotationModalProps) {
    const { t } = useLanguage();
    const colorScheme = useColorScheme();
    const theme = colorScheme ?? 'light';
    const colors = Colors[theme];

    const [items, setItems] = useState<any[]>([]);
    const [amount, setAmount] = useState('');

    useEffect(() => {
        if (visible) {
            setItems(initialItems.map(item => ({
                ...item,
                // Ensure unique ID for list rendering if not present
                id: item.id || Math.random().toString(36).substr(2, 9),
                // Ensure values are strings for TextInputs
                quantity: (item.quantity !== undefined && item.quantity !== null) ? item.quantity.toString() : '1',
                price: (item.price !== undefined && item.price !== null) ? item.price.toString() : ''
            })));
        }
    }, [visible, initialItems]);

    useEffect(() => {
        const total = items.reduce((acc, item) => {
            const price = parseFloat(item.price) || 0;
            const qty = parseFloat(item.quantity) || 0;
            return acc + (price * qty);
        }, 0);
        setAmount(total.toString());
    }, [items]);

    const addItem = () => {
        setItems(prev => [...prev, { id: Math.random().toString(36).substr(2, 9), name: '', quantity: '1', price: '' }]);
    };

    const removeItem = (id: string) => {
        setItems(prev => prev.filter(item => item.id !== id));
    };

    const updateItem = (id: string, field: string, value: string) => {
        setItems(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
    };

    const handleSubmit = async () => {
        const hasValidItems = items.every(item => item.name && parseFloat(item.quantity) > 0 && parseFloat(item.price) >= 0);
        if (!hasValidItems) {
            Alert.alert(t('error') || 'Error', t('please_fill_all_item_details') || 'Please fill name, quantity and price for all items');
            return;
        }
        await onSubmit(items, Number(amount));
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
                        <Text style={[styles.modalTitle, { color: colors.text }]}>{t('submit_quote') || 'Submit Quotation'}</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close" size={24} color={colors.text} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                        {order && order.vehicleDetails && (
                            <View style={{ marginBottom: 20, padding: 12, backgroundColor: colors.card, borderRadius: 12 }}>
                                <Text style={{ fontSize: 13, color: colors.icon, marginBottom: 4 }}>Requested Vehicle</Text>
                                <Text style={{ fontSize: 16, fontWeight: 'bold', color: colors.text }}>
                                    {order.vehicleDetails.make} {order.vehicleDetails.model}
                                </Text>
                                <Text style={{ fontSize: 13, color: colors.text, marginTop: 2 }}>
                                    {order.vehicleDetails.year} • {order.vehicleDetails.fuelType || 'N/A'}
                                </Text>
                            </View>
                        )}

                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
                            <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('items') || 'Items'}</Text>
                            <TouchableOpacity onPress={addItem} style={[styles.addButton, { backgroundColor: colors.primary + '15' }]}>
                                <Ionicons name="add" size={20} color={colors.primary} />
                                <Text style={{ color: colors.primary, fontWeight: '700', marginLeft: 4 }}>{t('add_item') || 'Add Item'}</Text>
                            </TouchableOpacity>
                        </View>

                        {items.map((item, index) => (
                            <View key={item.id} style={[styles.quoteItemCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
                                    <Text style={{ color: colors.icon, fontSize: 12, fontWeight: 'bold' }}>#{index + 1}</Text>
                                    <TouchableOpacity onPress={() => removeItem(item.id)}>
                                        <Ionicons name="trash-outline" size={18} color="#FF3B30" />
                                    </TouchableOpacity>
                                </View>
                                <TextInput
                                    style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border, marginBottom: 10 }]}
                                    value={item.name}
                                    onChangeText={(v) => updateItem(item.id, 'name', v)}
                                    placeholder={t('item_name') || 'Item Name'}
                                    placeholderTextColor={colors.icon}
                                />
                                <View style={{ flexDirection: 'row', gap: 10 }}>
                                    <View style={{ flex: 1 }}>
                                        <TextInput
                                            style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                                            value={item.quantity}
                                            onChangeText={(v) => updateItem(item.id, 'quantity', v)}
                                            placeholder={t('qty') || 'Qty'}
                                            placeholderTextColor={colors.icon}
                                            keyboardType="numeric"
                                        />
                                    </View>
                                    <View style={{ flex: 2 }}>
                                        <View style={[styles.inputContainer, { backgroundColor: colors.background, borderColor: colors.border }]}>
                                            <Text style={[styles.currencyPrefix, { color: colors.primary }]}>{currencySymbol}</Text>
                                            <TextInput
                                                style={[styles.input, { flex: 1, borderWidth: 0, color: colors.text }]}
                                                value={item.price}
                                                onChangeText={(v) => updateItem(item.id, 'price', v)}
                                                placeholder={t('price') || 'Price'}
                                                placeholderTextColor={colors.icon}
                                                keyboardType="numeric"
                                            />
                                        </View>
                                    </View>
                                </View>
                            </View>
                        ))}

                        <View style={[styles.divider, { backgroundColor: colors.border, marginVertical: 20 }]} />

                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text style={[styles.modalTitle, { color: colors.text, fontSize: 18 }]}>{t('total_amount') || 'Total Amount'}</Text>
                            <Text style={[styles.modalTitle, { color: colors.primary, fontSize: 24 }]}>{currencySymbol}{Number(amount).toFixed(2)}</Text>
                        </View>

                        <TouchableOpacity
                            style={[styles.saveBtn, { backgroundColor: colors.primary, marginTop: 25 }]}
                            onPress={handleSubmit}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#FFF" />
                            ) : (
                                <Text style={styles.saveBtnText}>{t('send_quote_to_client') || 'Send Quote to Client'}</Text>
                            )}
                        </TouchableOpacity>
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
    sectionTitle: { fontSize: 16, fontFamily: 'NotoSans-Black', marginTop: 0, marginBottom: 0 },
    addButton: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
    quoteItemCard: { padding: 15, borderRadius: 16, borderWidth: 1, marginBottom: 12 },
    input: { height: 50, borderRadius: 12, paddingHorizontal: 15, fontSize: 16, fontFamily: 'NotoSans-Regular', borderWidth: 1 },
    inputContainer: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, borderWidth: 1, paddingHorizontal: 15 },
    currencyPrefix: { fontSize: 18, fontWeight: 'bold', marginRight: 5 },
    divider: { height: 1 },
    saveBtn: { height: 55, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
    saveBtnText: { color: '#FFF', fontSize: 16, fontFamily: 'NotoSans-Bold' },
});
