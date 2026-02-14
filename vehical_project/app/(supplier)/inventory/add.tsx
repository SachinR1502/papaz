import { AppButton } from '@/components/ui/AppButton';
import { AppTextInput } from '@/components/ui/AppTextInput';
import { Colors } from '@/constants/theme';
import { useAdmin } from '@/context/AdminContext';
import { useSupplier } from '@/context/SupplierContext';
import { FontAwesome, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    useColorScheme
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AddProductScreen() {
    const { addProduct, updateProduct } = useSupplier();
    const { settings } = useAdmin();
    const router = useRouter();
    const params = useLocalSearchParams();
    const isEditMode = !!params.id;

    const colorScheme = useColorScheme();
    const theme = colorScheme ?? 'light';
    const colors = Colors[theme];
    const isDark = theme === 'dark';
    const [submitting, setSubmitting] = useState(false);

    const currencySymbol = settings.currency === 'INR' ? '₹' : '$';

    // Form State
    const [form, setForm] = useState({
        name: '',
        brand: '',
        partNumber: '',
        type: 'Car',
        price: '',
        quantity: '',
        localDeliveryTime: '2 hrs',
        transportDeliveryTime: '2 days',
        deliveryCharges: '0',
        description: ''
    });
    const [compatibleModels, setCompatibleModels] = useState<string[]>([]);
    const [newModel, setNewModel] = useState('');
    const [errors, setErrors] = useState<Record<string, string | undefined>>({});

    useEffect(() => {
        if (isEditMode) {
            setForm({
                name: params.name as string,
                brand: params.brand as string || '',
                partNumber: params.partNumber as string || '',
                type: params.type as string,
                price: params.price as string,
                quantity: params.quantity as string,
                localDeliveryTime: params.localDeliveryTime as string || '2 hrs',
                transportDeliveryTime: params.transportDeliveryTime as string || '2 days',
                deliveryCharges: params.deliveryCharges as string || '0',
                description: params.description as string || ''
            });
            if (params.compatibleModels) {
                try { setCompatibleModels(JSON.parse(params.compatibleModels as string)); } catch (e) { }
            }
        }
    }, [params]);

    const validateForm = () => {
        let newErrors: Record<string, string> = {};
        if (!form.name.trim()) newErrors.name = 'Product name is required';
        if (!form.price || isNaN(Number(form.price))) newErrors.price = 'Valid price is required';
        if (!form.quantity || isNaN(Number(form.quantity))) newErrors.quantity = 'Stock quantity is required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const addCompatibleModel = () => {
        if (newModel.trim() && !compatibleModels.includes(newModel.trim())) {
            setCompatibleModels(prev => [...prev, newModel.trim()]);
            setNewModel('');
        }
    };

    const removeCompatibleModel = (model: string) => {
        setCompatibleModels(prev => prev.filter(m => m !== model));
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        setSubmitting(true);
        try {
            const productData = {
                ...form,
                price: Number(form.price),
                quantity: Number(form.quantity),
                deliveryCharges: Number(form.deliveryCharges),
                compatibleModels: compatibleModels.length > 0 ? compatibleModels : undefined
            };

            if (isEditMode) {
                await updateProduct(params.id as string, productData);
                // Alert.alert("Success", "Product updated.");
                setShowSuccessModal(true);
            } else {
                await addProduct(productData);
                // Alert.alert("Success", "Product listed.");
                setShowSuccessModal(true);
            }
            // router.back(); // Removed, handled in modal
        } catch (e) {
            Alert.alert("Error", "Failed to save product.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleSuccessContinue = () => {
        setShowSuccessModal(false);
        if (isEditMode) {
            if (router.canGoBack()) {
                router.back();
            } else {
                router.replace('/(supplier)/(tabs)' as any);
            }
        } else {
            // Reset form for adding another
            setForm({
                name: '',
                brand: '',
                partNumber: '',
                type: 'Car',
                price: '',
                quantity: '',
                localDeliveryTime: '2 hrs',
                transportDeliveryTime: '2 days',
                deliveryCharges: '0',
                description: ''
            });
            setCompatibleModels([]);
            setNewModel('');
        }
    };

    const [showSuccessModal, setShowSuccessModal] = useState(false);

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
            <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace('/(supplier)/(tabs)' as any)} style={[styles.backBtn, { backgroundColor: isDark ? colors.background : '#F8F9FE' }]}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>{isEditMode ? 'Edit Listing' : 'List New Product'}</Text>
                <View style={{ width: 44 }} />
            </View>

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

                    <View style={[styles.glassCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <View style={styles.sectionTitleRow}>
                            <MaterialCommunityIcons name="tag-outline" size={20} color={colors.primary} />
                            <Text style={[styles.sectionTitle, { color: colors.text }]}>Product Details</Text>
                        </View>


                        <AppTextInput
                            label="Product Title"
                            placeholder="Ex: Front Brake Pads - Brembo"
                            value={form.name}
                            onChangeText={t => setForm({ ...form, name: t })}
                            error={errors.name}
                        />

                        <AppTextInput
                            label="Product Description"
                            placeholder="Describe the product details..."
                            value={form.description}
                            onChangeText={t => setForm({ ...form, description: t })}
                            multiline
                            numberOfLines={3}
                            inputStyle={{ height: 80, textAlignVertical: 'top' }}
                        />

                        <View style={styles.row}>
                            <AppTextInput
                                label="Brand"
                                placeholder="Brembo, Bosch..."
                                value={form.brand}
                                onChangeText={t => setForm({ ...form, brand: t })}
                                containerStyle={{ flex: 1 }}
                            />
                            <AppTextInput
                                label="Part Number"
                                placeholder="BR-901..."
                                value={form.partNumber}
                                onChangeText={t => setForm({ ...form, partNumber: t })}
                                containerStyle={{ flex: 1 }}
                            />
                        </View>

                        <View style={styles.row}>
                            <AppTextInput
                                label={`Price (${currencySymbol})`}
                                placeholder="0.00"
                                value={form.price}
                                onChangeText={t => setForm({ ...form, price: t })}
                                keyboardType="numeric"
                                error={errors.price}
                                containerStyle={{ flex: 1 }}
                            />
                            <AppTextInput
                                label="Stock Qty"
                                placeholder="100"
                                value={form.quantity}
                                onChangeText={t => setForm({ ...form, quantity: t })}
                                keyboardType="numeric"
                                error={errors.quantity}
                                containerStyle={{ flex: 1 }}
                            />
                        </View>
                    </View>

                    <View style={[styles.glassCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <View style={styles.sectionTitleRow}>
                            <MaterialCommunityIcons name="car-info" size={22} color="#34C759" />
                            <Text style={[styles.sectionTitle, { color: colors.text }]}>Compatibility</Text>
                        </View>
                        <Text style={[styles.hint, { color: colors.icon }]}>Add vehicle models this part fits into.</Text>

                        <View style={styles.addModelRow}>
                            <AppTextInput
                                placeholder="Ex: Honda City 2022"
                                value={newModel}
                                onChangeText={setNewModel}
                                onSubmitEditing={addCompatibleModel}
                                containerStyle={{ flex: 1, marginBottom: 0 }}
                            />
                            <TouchableOpacity style={[styles.addChipBtn, { backgroundColor: colors.primary }]} onPress={addCompatibleModel}>
                                <Ionicons name="add" size={24} color="#FFF" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.chipContainer}>
                            {compatibleModels.map(m => (
                                <View key={m} style={[styles.chip, { backgroundColor: colors.primary + '15', borderColor: colors.primary + '30' }]}>
                                    <Text style={[styles.chipText, { color: colors.primary }]}>{m}</Text>
                                    <TouchableOpacity onPress={() => removeCompatibleModel(m)}>
                                        <Ionicons name="close-circle" size={18} color={colors.primary} />
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </View>
                    </View>

                    <View style={[styles.glassCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <View style={styles.sectionTitleRow}>
                            <MaterialCommunityIcons name="truck-delivery-outline" size={22} color="#FF9500" />
                            <Text style={[styles.sectionTitle, { color: colors.text }]}>Logistics & Shipping</Text>
                        </View>

                        <AppTextInput
                            label="Local Area Delivery (Shop)"
                            placeholder="Ex: 2 hours, Same day..."
                            value={form.localDeliveryTime}
                            onChangeText={t => setForm({ ...form, localDeliveryTime: t })}
                        />

                        <View style={styles.row}>
                            <AppTextInput
                                label="Transport Time (Outside)"
                                placeholder="Ex: 2-3 days..."
                                value={form.transportDeliveryTime}
                                onChangeText={t => setForm({ ...form, transportDeliveryTime: t })}
                                containerStyle={{ flex: 1.5 }}
                            />
                            <AppTextInput
                                label="Delivery Charges"
                                placeholder="0"
                                value={form.deliveryCharges}
                                onChangeText={t => setForm({ ...form, deliveryCharges: t })}
                                keyboardType="numeric"
                                containerStyle={{ flex: 1 }}
                            />
                        </View>
                    </View>

                    <View style={[styles.glassCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <View style={styles.sectionTitleRow}>
                            <MaterialCommunityIcons name="shape-outline" size={22} color="#5856D6" />
                            <Text style={[styles.sectionTitle, { color: colors.text }]}>Vehicle Type</Text>
                        </View>
                        <Text style={[styles.hint, { color: colors.icon }]}>Select the category for this part.</Text>

                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeScroll}>
                            {[
                                { id: 'Car', icon: 'car', iconSet: 'FA' },
                                { id: 'Bike', icon: 'motorcycle', iconSet: 'FA' },
                                { id: 'Scooter', icon: 'scooter', iconSet: 'MCI' },
                                { id: 'Van', icon: 'van-utility', iconSet: 'MCI' },
                                { id: 'Rickshaw', icon: 'rickshaw', iconSet: 'MCI' },
                                { id: 'Truck', icon: 'truck', iconSet: 'FA' },
                                { id: 'Bus', icon: 'bus', iconSet: 'FA' },
                                { id: 'Tractor', icon: 'tractor', iconSet: 'MCI' },
                                { id: 'Earthmover', icon: 'excavator', iconSet: 'MCI' },
                                { id: 'EV Rickshaw', icon: 'rickshaw-electric', iconSet: 'MCI' },
                                { id: 'Universal', icon: 'earth', iconSet: 'MCI' },
                                { id: 'Other', icon: 'question-circle', iconSet: 'FA' },
                            ].map(item => (
                                <TouchableOpacity
                                    key={item.id}
                                    style={[styles.typeBtn, form.type === item.id ? { backgroundColor: colors.primary, borderColor: colors.primary } : { backgroundColor: colors.background, borderColor: colors.border }]}
                                    onPress={() => setForm({ ...form, type: item.id })}
                                >
                                    {item.iconSet === 'FA' ? (
                                        <FontAwesome name={item.icon as any} size={20} color={form.type === item.id ? '#FFF' : colors.primary} />
                                    ) : (
                                        <MaterialCommunityIcons name={item.icon as any} size={22} color={form.type === item.id ? '#FFF' : colors.primary} />
                                    )}
                                    <Text style={[styles.typeBtnText, { color: form.type === item.id ? '#FFF' : colors.text }]}>{item.id}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>

                    <AppButton
                        title={isEditMode ? 'Update Product' : 'List Product'}
                        onPress={handleSubmit}
                        loading={submitting}
                        size="large"
                        style={{ marginTop: 20, marginBottom: 50 }}
                    />

                </ScrollView>
            </KeyboardAvoidingView>

            {/* Success Modal */}
            {/* Modal Import needed if not present? It is not imported in original snippet. Will use View overlay or import Modal */}
            <Modal
                transparent={true}
                visible={showSuccessModal}
                animationType="fade"
                onRequestClose={() => setShowSuccessModal(false)}
            >
                <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }}>
                    <View style={{ backgroundColor: colors.card, width: '85%', padding: 24, borderRadius: 24, alignItems: 'center' }}>
                        <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center', marginBottom: 16 }}>
                            <Ionicons name="checkmark" size={32} color="#FFF" />
                        </View>
                        <Text style={{ fontSize: 20, fontWeight: 'bold', color: colors.text, marginBottom: 8 }}>Success!</Text>
                        <Text style={{ fontSize: 14, color: colors.icon, textAlign: 'center', marginBottom: 24 }}>
                            {isEditMode ? 'Product details have been updated successfully.' : 'Your product has been listed successfully and is now visible to customers.'}
                        </Text>

                        <AppButton
                            title={isEditMode ? "Go Back" : "Add Another Product"}
                            onPress={handleSuccessContinue}
                            style={{ width: '100%', marginBottom: 12 }}
                        />

                        <TouchableOpacity onPress={() => { setShowSuccessModal(false); router.replace('/(supplier)/(tabs)/inventory'); }}>
                            <Text style={{ color: colors.primary, fontWeight: 'bold', padding: 10 }}>Go to Inventory</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FE' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
    backBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#F8F9FE', justifyContent: 'center', alignItems: 'center' },
    headerTitle: { fontSize: 18, fontWeight: '700', color: '#1A1A1A' },

    content: { padding: 24 },
    sectionLabel: { fontSize: 14, fontWeight: '700', color: '#8E8E93', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 },

    typeScroll: { marginBottom: 10 },
    typeBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#FFF', paddingVertical: 12, paddingHorizontal: 16, borderRadius: 16, borderWidth: 1, borderColor: '#E5E5EA', marginRight: 12 },
    typeBtnActive: { backgroundColor: '#007AFF', borderColor: '#007AFF' },
    typeBtnText: { fontSize: 13, fontWeight: '600', color: '#1A1A1A' },
    typeBtnTextActive: { color: '#FFF' },

    glassCard: { backgroundColor: '#FFF', borderRadius: 24, padding: 20, marginBottom: 24, borderWidth: 1, borderColor: '#F2F2F7', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.02, shadowRadius: 12, elevation: 2 },
    sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
    sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1A1A1A' },

    sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1A1A1A' },

    row: { flexDirection: 'row', gap: 12 },

    hint: { fontSize: 12, color: '#8E8E93', marginBottom: 16, marginLeft: 4 },
    addModelRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
    addChipBtn: { width: 50, height: 50, borderRadius: 14, backgroundColor: '#007AFF', justifyContent: 'center', alignItems: 'center' },
    chipContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    chip: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#E3F2FD', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 12, borderWidth: 1, borderColor: '#CEE5FF' },
    chipText: { fontSize: 13, fontWeight: '600', color: '#007AFF' },

    imageGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    imageWrapper: { width: '30%', aspectRatio: 1, borderRadius: 14, overflow: 'hidden', position: 'relative' },
    image: { width: '100%', height: '100%' },
    removeImg: { position: 'absolute', top: 4, right: 4, backgroundColor: '#FFF', borderRadius: 12 },
    addImageBtn: { width: '30%', aspectRatio: 1, borderRadius: 14, backgroundColor: '#F8F9FE', borderWidth: 1, borderColor: '#007AFF', borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center', gap: 4 },
    addImageText: { fontSize: 12, fontWeight: '600', color: '#007AFF' },
});
