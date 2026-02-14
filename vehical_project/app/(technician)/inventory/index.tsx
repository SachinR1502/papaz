import { Colors } from '@/constants/theme';
import { useAdmin } from '@/context/AdminContext';
import { useTechnician } from '@/context/TechnicianContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    FlatList,
    Image,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function InventoryScreen() {
    const { partsInventory, refresh, deletePart } = useTechnician();
    const { settings } = useAdmin();
    const router = useRouter();
    const colorScheme = useColorScheme();
    const theme = colorScheme ?? 'light';
    const colors = Colors[theme];
    const isDark = theme === 'dark';

    const [refreshing, setRefreshing] = useState(false);

    const currencySymbol = settings.currency === 'INR' ? '₹' : '$';

    const onRefresh = async () => {
        setRefreshing(true);
        try {
            await refresh();
        } catch (error) {
            console.error(error);
        } finally {
            setRefreshing(false);
        }
    };

    const handleDelete = (item: any) => {
        Alert.alert(
            "Delete Product",
            `Are you sure you want to remove "${item.name}" from your inventory?`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await deletePart(item.id || item._id);
                            Alert.alert("Deleted", "Product has been removed.");
                        } catch (e) {
                            Alert.alert("Error", "Failed to delete product.");
                        }
                    }
                }
            ]
        );
    };

    const handleEdit = (item: any) => {
        router.push({
            pathname: '/(technician)/inventory/add',
            params: {
                id: item.id || item._id,
                name: item.name,
                brand: item.brand,
                partNumber: item.partNumber,
                category: item.category,
                price: item.price.toString(),
                quantity: item.quantity.toString(),
                description: item.description,
                supplier: item.supplier,
                compatibleModels: JSON.stringify(item.compatibleModels || []),
                images: JSON.stringify(item.images || []),
                image: item.image
            }
        });
    };

    const renderItem = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => handleEdit(item)}
            onLongPress={() => handleDelete(item)}
            activeOpacity={0.7}
        >
            <View style={[styles.imageBox, { backgroundColor: isDark ? colors.background : '#F0F4FF' }]}>
                {(item.images && item.images.length > 0) || item.image ? (
                    <Image source={{ uri: item.images?.[0] || item.image }} style={styles.productImage} />
                ) : (
                    <MaterialCommunityIcons name="cube-outline" size={28} color={colors.primary} />
                )}
            </View>

            <View style={styles.details}>
                <View style={styles.titleRow}>
                    <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>{item.name}</Text>
                    {item.brand && (
                        <View style={[styles.brandBadge, { backgroundColor: colors.primary + '15' }]}>
                            <Text style={[styles.brandText, { color: colors.primary }]}>{item.brand}</Text>
                        </View>
                    )}
                </View>

                <View style={styles.infoRow}>
                    <MaterialCommunityIcons name="shape-outline" size={14} color={colors.icon} />
                    <Text style={[styles.category, { color: colors.icon }]}>{item.category || item.type || 'Universal'}</Text>
                    <Text style={{ color: colors.border, marginHorizontal: 6 }}>|</Text>
                    <MaterialCommunityIcons name="store-outline" size={14} color={colors.icon} />
                    <Text style={[styles.supplier, { color: colors.icon }]} numberOfLines={1}>{item.supplier || 'In-House'}</Text>
                </View>

                <View style={styles.bottomRow}>
                    <Text style={[styles.price, { color: colors.primary }]}>{currencySymbol}{item.price}</Text>
                    <View style={[styles.qtyBadge, { backgroundColor: item.quantity > 5 ? '#34C75920' : '#FF3B3020' }]}>
                        <Text style={[styles.qtyText, { color: item.quantity > 5 ? '#34C759' : '#FF3B30' }]}>
                            {item.quantity} in stock
                        </Text>
                    </View>
                </View>
            </View>

            <TouchableOpacity style={styles.editIcon} onPress={() => handleEdit(item)}>
                <MaterialCommunityIcons name="pencil" size={18} color={colors.icon} />
            </TouchableOpacity>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
            <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: isDark ? colors.background : '#F8F9FE' }]}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.title, { color: colors.text }]}>Shop Inventory</Text>
                <Link href="/(technician)/inventory/add" asChild>
                    <TouchableOpacity style={[styles.addBtn, { backgroundColor: colors.primary }]}>
                        <Ionicons name="add" size={24} color="#FFF" />
                    </TouchableOpacity>
                </Link>
            </View>

            <FlatList
                data={partsInventory}
                renderItem={renderItem}
                keyExtractor={item => (item.id || item._id || Math.random().toString())}
                contentContainerStyle={styles.list}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
                }
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <View style={[styles.emptyIcon, { backgroundColor: colors.primary + '10' }]}>
                            <MaterialCommunityIcons name="package-variant" size={60} color={colors.primary} />
                        </View>
                        <Text style={[styles.emptyTitle, { color: colors.text }]}>Inventory is Empty</Text>
                        <Text style={[styles.emptySubtitle, { color: colors.icon }]}>Start adding products to your shop inventory to manage your stock efficiently.</Text>
                        <TouchableOpacity
                            style={[styles.emptyBtn, { backgroundColor: colors.primary }]}
                            onPress={() => router.push('/(technician)/inventory/add')}
                        >
                            <Text style={styles.emptyBtnText}>Add First Product</Text>
                        </TouchableOpacity>
                    </View>
                }
            />
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
    addBtn: {
        width: 44,
        height: 44,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#007AFF',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    list: {
        padding: 20,
        paddingBottom: 40,
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        marginBottom: 16,
        borderRadius: 20,
        borderWidth: 1,
        gap: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 8,
        elevation: 2,
        position: 'relative'
    },
    imageBox: {
        width: 80,
        height: 80,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    productImage: {
        width: '100%',
        height: '100%',
    },
    details: {
        flex: 1,
        justifyContent: 'center',
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    name: {
        fontSize: 15,
        fontWeight: '700',
        flex: 1,
    },
    brandBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
        marginLeft: 8,
    },
    brandText: {
        fontSize: 10,
        fontWeight: '800',
        textTransform: 'uppercase',
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    category: {
        fontSize: 12,
        marginLeft: 4,
    },
    supplier: {
        fontSize: 12,
        marginLeft: 4,
        maxWidth: 80,
    },
    bottomRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    price: {
        fontSize: 16,
        fontWeight: '800',
    },
    qtyBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 10,
    },
    qtyText: {
        fontSize: 11,
        fontWeight: '700',
    },
    editIcon: {
        position: 'absolute',
        top: 10,
        right: 10,
        padding: 4,
    },
    empty: {
        alignItems: 'center',
        marginTop: 60,
        paddingHorizontal: 40,
    },
    emptyIcon: {
        width: 120,
        height: 120,
        borderRadius: 60,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    emptySubtitle: {
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 32,
    },
    emptyBtn: {
        paddingHorizontal: 32,
        paddingVertical: 14,
        borderRadius: 16,
    },
    emptyBtnText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '700',
    },
});
