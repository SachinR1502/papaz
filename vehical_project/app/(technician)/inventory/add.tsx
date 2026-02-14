import { AppButton } from '@/components/ui/AppButton';
import { AppTextInput } from '@/components/ui/AppTextInput';
import { Colors } from '@/constants/theme';
import { useAdmin } from '@/context/AdminContext';
import { useTechnician } from '@/context/TechnicianContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { FontAwesome, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AddProductScreen() {
    const { addPart, updatePart, uploadFile } = useTechnician();
    const { settings } = useAdmin();
    const router = useRouter();
    const params = useLocalSearchParams();
    const isEditMode = !!params.id;

    const colorScheme = useColorScheme();
    const theme = colorScheme ?? 'light';
    const colors = Colors[theme];
    const isDark = theme === 'dark';

    const currencySymbol = settings.currency === 'INR' ? '₹' : '$';

    const [form, setForm] = useState({
        name: '',
        brand: '',
        partNumber: '',
        category: 'Universal',
        price: '',
        quantity: '',
        description: '',
        supplier: ''
    });

    const [compatibleModels, setCompatibleModels] = useState<string[]>([]);
    const [newModel, setNewModel] = useState('');
    const [images, setImages] = useState<string[]>([]);
    const [uploading, setUploading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string | undefined>>({});

    useEffect(() => {
        if (isEditMode) {
            setForm({
                name: params.name as string || '',
                brand: params.brand as string || '',
                partNumber: params.partNumber as string || '',
                category: params.category as string || params.type as string || 'Universal',
                price: params.price as string || '',
                quantity: params.quantity as string || '',
                description: params.description as string || '',
                supplier: params.supplier as string || ''
            });

            if (params.compatibleModels) {
                try {
                    const parsed = typeof params.compatibleModels === 'string'
                        ? JSON.parse(params.compatibleModels)
                        : params.compatibleModels;
                    setCompatibleModels(Array.isArray(parsed) ? parsed : []);
                } catch (e) {
                    console.error("Failed to parse compatibleModels", e);
                }
            }

            if (params.images) {
                try {
                    const parsed = typeof params.images === 'string'
                        ? JSON.parse(params.images)
                        : params.images;
                    setImages(Array.isArray(parsed) ? parsed : []);
                } catch (e) {
                    // Fallback to single image if images array fails
                    if (params.image) setImages([params.image as string]);
                }
            } else if (params.image) {
                setImages([params.image as string]);
            }
        }
    }, [params]);

    const handlePickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission denied', 'Sorry, we need camera roll permissions to make this work!');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            allowsMultipleSelection: true,
            selectionLimit: 5,
            quality: 0.6,
        });

        if (!result.canceled) {
            const newImages = result.assets.map(asset => asset.uri);
            setImages([...images, ...newImages]);
        }
    };

    const removeImage = (index: number) => {
        const newImages = [...images];
        newImages.splice(index, 1);
        setImages(newImages);
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

    const validateForm = () => {
        let newErrors: Record<string, string> = {};
        if (!form.name.trim()) newErrors.name = 'Product name is required';
        if (!form.price || isNaN(Number(form.price))) newErrors.price = 'Valid price is required';
        if (!form.quantity || isNaN(Number(form.quantity))) newErrors.quantity = 'Stock quantity is required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
        if (!validateForm()) return;

        setUploading(true);
        try {
            // Check which images are new (URIs from picker) and which are already uploaded (URLs)
            const uploadedUrls = await Promise.all(images.map(async img => {
                if (img.startsWith('http') || img.startsWith('https')) {
                    return img; // Already uploaded
                }
                // New local URI, needs upload
                const res = await uploadFile(img, 'image');
                return res.url || res.path;
            }));

            const partData = {
                ...form,
                price: parseFloat(form.price),
                quantity: parseInt(form.quantity),
                images: uploadedUrls,
                image: uploadedUrls.length > 0 ? uploadedUrls[0] : undefined,
                compatibleModels: compatibleModels.length > 0 ? compatibleModels : undefined,
                supplier: form.supplier || 'In-House'
            };

            if (isEditMode) {
                await updatePart({ ...partData, id: params.id });
                Alert.alert("Success", "Product updated.");
            } else {
                await addPart(partData);
                Alert.alert("Success", "Product added to shop inventory.");
            }

            if (router.canGoBack()) {
                router.back();
            } else {
                router.replace('/(technician)/inventory' as any);
            }
        } catch (e) {
            console.error(e);
            Alert.alert('Error', 'Failed to save product');
        } finally {
            setUploading(false);
        }
    };

    const vehicleTypes = [
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
    ];

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
            <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.title, { color: colors.text }]}>{isEditMode ? 'Edit Product' : 'Add New Product'}</Text>
                <View style={{ width: 40 }} />
            </View>

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

                    {/* Media Section */}
                    <View style={[styles.glassCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <View style={styles.sectionTitleRow}>
                            <MaterialCommunityIcons name="camera-outline" size={20} color={colors.primary} />
                            <Text style={[styles.sectionTitle, { color: colors.text }]}>Product Images</Text>
                        </View>

                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.imageGrid}>
                            {images.map((uri, index) => (
                                <View key={index} style={styles.imageWrapper}>
                                    <Image source={{ uri }} style={styles.image} />
                                    <TouchableOpacity style={styles.removeImg} onPress={() => removeImage(index)}>
                                        <Ionicons name="close-circle" size={22} color="#FF3B30" />
                                    </TouchableOpacity>
                                </View>
                            ))}
                            <TouchableOpacity style={styles.addImageBtn} onPress={handlePickImage}>
                                <Ionicons name="add-circle-outline" size={32} color={colors.primary} />
                                <Text style={[styles.addImageText, { color: colors.primary }]}>Add Photo</Text>
                            </TouchableOpacity>
                        </ScrollView>
                    </View>

                    {/* Basic Info Section */}
                    <View style={[styles.glassCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <View style={styles.sectionTitleRow}>
                            <MaterialCommunityIcons name="tag-outline" size={20} color="#5856D6" />
                            <Text style={[styles.sectionTitle, { color: colors.text }]}>Product Details</Text>
                        </View>

                        <AppTextInput
                            label="Product Title"
                            placeholder="e.g. Front Brake Pads"
                            value={form.name}
                            onChangeText={t => setForm({ ...form, name: t })}
                            error={errors.name}
                        />

                        <AppTextInput
                            label="Description"
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

                        <AppTextInput
                            label="Supplier (Optional)"
                            placeholder="e.g. Local Auto Store"
                            value={form.supplier}
                            onChangeText={t => setForm({ ...form, supplier: t })}
                        />
                    </View>

                    {/* Vehicle Category Section */}
                    <View style={[styles.glassCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <View style={styles.sectionTitleRow}>
                            <MaterialCommunityIcons name="shape-outline" size={22} color="#AF52DE" />
                            <Text style={[styles.sectionTitle, { color: colors.text }]}>Vehicle Category</Text>
                        </View>
                        <Text style={[styles.hint, { color: colors.icon }]}>Select which vehicle type this part belongs to.</Text>

                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeScroll}>
                            {vehicleTypes.map(item => (
                                <TouchableOpacity
                                    key={item.id}
                                    style={[
                                        styles.typeBtn,
                                        form.category === item.id
                                            ? { backgroundColor: colors.primary, borderColor: colors.primary }
                                            : { backgroundColor: colors.background, borderColor: colors.border }
                                    ]}
                                    onPress={() => setForm({ ...form, category: item.id })}
                                >
                                    {item.iconSet === 'FA' ? (
                                        <FontAwesome name={item.icon as any} size={20} color={form.category === item.id ? '#FFF' : colors.primary} />
                                    ) : (
                                        <MaterialCommunityIcons name={item.icon as any} size={22} color={form.category === item.id ? '#FFF' : colors.primary} />
                                    )}
                                    <Text style={[styles.typeBtnText, { color: form.category === item.id ? '#FFF' : colors.text }]}>{item.id}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>

                    {/* Compatibility Section */}
                    <View style={[styles.glassCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <View style={styles.sectionTitleRow}>
                            <MaterialCommunityIcons name="car-info" size={22} color="#34C759" />
                            <Text style={[styles.sectionTitle, { color: colors.text }]}>Compatibility</Text>
                        </View>
                        <Text style={[styles.hint, { color: colors.icon }]}>Add specific car/bike models this part fits.</Text>

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

                    <AppButton
                        title={uploading ? "Saving Product..." : (isEditMode ? "Update Product" : "Store in Inventory")}
                        onPress={handleSave}
                        loading={uploading}
                        size="large"
                        style={{ marginTop: 10, marginBottom: 50 }}
                    />

                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 20,
        borderBottomWidth: 1,
    },
    backBtn: {
        width: 44,
        height: 44,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    content: {
        padding: 24,
    },
    glassCard: {
        borderRadius: 24,
        padding: 20,
        marginBottom: 24,
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.02,
        shadowRadius: 12,
        elevation: 2
    },
    sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
    sectionTitle: { fontSize: 16, fontWeight: '700' },
    row: { flexDirection: 'row', gap: 12 },
    hint: { fontSize: 12, marginBottom: 16, marginLeft: 4 },

    // Image Styles
    imageGrid: { flexDirection: 'row', gap: 12, paddingBottom: 5 },
    imageWrapper: { width: 100, height: 100, borderRadius: 16, overflow: 'hidden', position: 'relative', borderWidth: 1, borderColor: '#EEE' },
    image: { width: '100%', height: '100%' },
    removeImg: { position: 'absolute', top: 5, right: 5, backgroundColor: '#FFF', borderRadius: 12 },
    addImageBtn: { width: 100, height: 100, borderRadius: 16, backgroundColor: '#F0F9FF', borderWidth: 1, borderColor: '#007AFF', borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center', gap: 4 },
    addImageText: { fontSize: 11, fontWeight: '700' },

    // Category Styles
    typeScroll: { marginBottom: 5 },
    typeBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 12, paddingHorizontal: 16, borderRadius: 16, borderWidth: 1, marginRight: 12 },
    typeBtnText: { fontSize: 13, fontWeight: '600' },

    // Compatibility Styles
    addModelRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
    addChipBtn: { width: 50, height: 50, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
    chipContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    chip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 12, borderWidth: 1 },
    chipText: { fontSize: 13, fontWeight: '600' },
});
