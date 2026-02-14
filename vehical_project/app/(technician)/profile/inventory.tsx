import { useAdmin } from '@/context/AdminContext';
import { useTechnician } from '@/context/TechnicianContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Animated, KeyboardAvoidingView, Modal, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function InventoryManagementScreen() {
    const router = useRouter();
    const { partsInventory, addPart, updatePart, deletePart } = useTechnician();
    const { settings } = useAdmin();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const colors = {
        background: isDark ? '#000000' : '#F8F9FB',
        card: isDark ? '#1C1C1E' : '#FFFFFF',
        text: isDark ? '#FFFFFF' : '#1A1A1A',
        subText: isDark ? '#A1A1A6' : '#8E8E93',
        border: isDark ? '#2C2C2E' : '#F0F0F0',
        input: isDark ? '#2C2C2E' : '#F8F9FB',
        divider: isDark ? '#3A3A3C' : '#F2F2F7',
        placeholder: isDark ? '#636366' : '#C7C7CC',
    };

    const currencySymbol = settings.currency === 'INR' ? '₹' : '$';

    const [modalVisible, setModalVisible] = useState(false);
    const [editingPart, setEditingPart] = useState<any>(null);
    const [form, setForm] = useState({ name: '', price: '', supplier: '', stock: '' });

    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
        }).start();
    }, []);

    const openModal = (part: any = null) => {
        if (part) {
            setEditingPart(part);
            setForm({
                name: part.name,
                price: part.price.toString(),
                supplier: part.supplier,
                stock: part.stock.toString()
            });
        } else {
            setEditingPart(null);
            setForm({ name: '', price: '', supplier: '', stock: '' });
        }
        setModalVisible(true);
    };

    const handleSave = async () => {
        if (!form.name || !form.price || !form.stock) {
            Alert.alert('Error', 'Please fill all required fields');
            return;
        }

        const partData = {
            id: editingPart?.id,
            name: form.name,
            price: parseFloat(form.price),
            supplier: form.supplier || 'Unknown',
            stock: parseInt(form.stock)
        };

        if (editingPart) {
            await updatePart(partData);
        } else {
            await addPart(partData);
        }
        setModalVisible(false);
    };

    const confirmDelete = (partId: string) => {
        Alert.alert(
            'Delete Item',
            'Are you sure you want to remove this item from your inventory?',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Delete', style: 'destructive', onPress: () => deletePart(partId) }
            ]
        );
    };

    const renderPart = ({ item }: { item: any }) => (
        <View style={[styles.partCard, { backgroundColor: colors.card }]}>
            <View style={styles.partHeader}>
                <View style={styles.partInfo}>
                    <Text style={[styles.partName, { color: colors.text }]}>{item.name}</Text>
                    <Text style={[styles.partSupplier, { color: colors.subText }]}>{item.supplier}</Text>
                </View>
                <View style={styles.actionRow}>
                    <TouchableOpacity onPress={() => openModal(item)} style={styles.iconBtn}>
                        <Ionicons name="create-outline" size={20} color="#007AFF" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => confirmDelete(item.id)} style={styles.iconBtn}>
                        <Ionicons name="trash-outline" size={20} color="#FF3B30" />
                    </TouchableOpacity>
                </View>
            </View>
            <View style={[styles.partFooter, { borderTopColor: colors.divider }]}>
                <View style={styles.statBox}>
                    <Text style={[styles.statLabel, { color: colors.subText }]}>STOCK</Text>
                    <Text style={[styles.statValue, { color: item.stock < 5 ? '#FF3B30' : colors.text }]}>
                        {item.stock} Units
                    </Text>
                </View>
                <View style={[styles.statBox, { alignItems: 'flex-end' }]}>
                    <Text style={[styles.statLabel, { color: colors.subText }]}>PRICE</Text>
                    <Text style={[styles.statValue, { color: '#34C759' }]}>{currencySymbol}{item.price}</Text>
                </View>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
            <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: isDark ? '#2C2C2E' : '#F8F9FE' }]}>
                    <Ionicons name="chevron-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Garage Inventory</Text>
                <TouchableOpacity onPress={() => openModal()} style={[styles.addCta, { backgroundColor: isDark ? '#2C2C2E' : '#F8F9FE', borderRadius: 12 }]}>
                    <Ionicons name="add" size={24} color="#007AFF" />
                </TouchableOpacity>
            </View>

            <Animated.FlatList
                data={partsInventory}
                renderItem={renderPart}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.list}
                style={{ opacity: fadeAnim }}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="cube-outline" size={60} color={colors.border} />
                        <Text style={[styles.emptyText, { color: colors.text }]}>Empty Storage</Text>
                        <Text style={[styles.emptySub, { color: colors.subText }]}>Add parts to manage your workshop stock.</Text>
                    </View>
                }
            />

            <Modal visible={modalVisible} animationType="slide" transparent>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.modalOverlay}
                >
                    <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: colors.text }]}>{editingPart ? 'Edit Item' : 'Add New Item'}</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Ionicons name="close" size={24} color={colors.text} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.form}>
                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, { color: colors.subText }]}>PART NAME</Text>
                                <TextInput
                                    style={[styles.input, { backgroundColor: colors.input, color: colors.text }]}
                                    placeholder="e.g. Brake Pads"
                                    placeholderTextColor={colors.placeholder}
                                    value={form.name}
                                    onChangeText={(val) => setForm({ ...form, name: val })}
                                />
                            </View>
                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, { color: colors.subText }]}>SUPPLIER</Text>
                                <TextInput
                                    style={[styles.input, { backgroundColor: colors.input, color: colors.text }]}
                                    placeholder="e.g. Genuine Parts Co."
                                    placeholderTextColor={colors.placeholder}
                                    value={form.supplier}
                                    onChangeText={(val) => setForm({ ...form, supplier: val })}
                                />
                            </View>
                            <View style={styles.row}>
                                <View style={[styles.inputGroup, { flex: 1, marginRight: 15 }]}>
                                    <Text style={[styles.label, { color: colors.subText }]}>PRICE ({currencySymbol})</Text>
                                    <TextInput
                                        style={[styles.input, { backgroundColor: colors.input, color: colors.text }]}
                                        placeholder="0.00"
                                        placeholderTextColor={colors.placeholder}
                                        keyboardType="numeric"
                                        value={form.price}
                                        onChangeText={(val) => setForm({ ...form, price: val })}
                                    />
                                </View>
                                <View style={[styles.inputGroup, { width: 100 }]}>
                                    <Text style={[styles.label, { color: colors.subText }]}>STOCK</Text>
                                    <TextInput
                                        style={[styles.input, { backgroundColor: colors.input, color: colors.text }]}
                                        placeholder="0"
                                        placeholderTextColor={colors.placeholder}
                                        keyboardType="numeric"
                                        value={form.stock}
                                        onChangeText={(val) => setForm({ ...form, stock: val })}
                                    />
                                </View>
                            </View>

                            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                                <Text style={styles.saveBtnText}>Save Inventory Record</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 15, paddingVertical: 10, borderBottomWidth: 1 },
    backBtn: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
    headerTitle: { fontSize: 17, fontWeight: 'bold' },
    addCta: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
    list: { padding: 20 },
    partCard: { borderRadius: 24, padding: 20, marginBottom: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 3 },
    partHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
    partInfo: { flex: 1 },
    partName: { fontSize: 16, fontWeight: 'bold' },
    partSupplier: { fontSize: 12, marginTop: 4 },
    actionRow: { flexDirection: 'row', gap: 10 },
    iconBtn: { padding: 5 },
    partFooter: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, paddingTop: 15 },
    statBox: { flex: 1 },
    statLabel: { fontSize: 10, fontWeight: '900', letterSpacing: 0.5, marginBottom: 2 },
    statValue: { fontSize: 14, fontWeight: 'bold' },
    emptyContainer: { alignItems: 'center', justifyContent: 'center', marginTop: 100 },
    emptyText: { fontSize: 16, fontWeight: 'bold', marginTop: 15 },
    emptySub: { fontSize: 13, marginTop: 5 },

    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 25, paddingBottom: 40 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
    modalTitle: { fontSize: 20, fontWeight: 'bold' },
    form: { gap: 20 },
    inputGroup: { gap: 8 },
    label: { fontSize: 11, fontWeight: '900', letterSpacing: 1 },
    input: { borderRadius: 16, padding: 16, fontSize: 16 },
    row: { flexDirection: 'row' },
    saveBtn: { backgroundColor: '#1A1A1A', height: 60, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginTop: 10 },
    saveBtnText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
});
