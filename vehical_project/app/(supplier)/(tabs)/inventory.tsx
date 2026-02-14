import { InventoryItemCard } from '@/components/supplier/InventoryItemCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { ListSkeleton } from '@/components/ui/SkeletonLoader';
import { VehicleIcon } from '@/components/ui/VehicleIcon';
import { Colors } from '@/constants/theme';
import { useAdmin } from '@/context/AdminContext';
import { useLanguage } from '@/context/LanguageContext';
import { useSupplier } from '@/context/SupplierContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { FlatList, RefreshControl, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function InventoryScreen() {
    const { inventory, refreshData, isLoading } = useSupplier();
    const { settings } = useAdmin();
    const router = useRouter();
    const { t } = useLanguage();

    const currencySymbol = settings.currency === 'INR' ? '₹' : '$';
    const colorScheme = useColorScheme();
    const theme = colorScheme ?? 'light';
    const colors = Colors[theme];
    const isDark = theme === 'dark';
    const [search, setSearch] = useState('');
    const [filterType, setFilterType] = useState('All');

    const filteredInventory = inventory.filter(item => {
        const matchesSearch = (item.name?.toLowerCase() || '').includes(search.toLowerCase()) ||
            (item.type?.toLowerCase() || '').includes(search.toLowerCase());
        const matchesFilter = filterType === 'All' || item.type === filterType;
        return matchesSearch && matchesFilter;
    });

    const renderItem = ({ item }: { item: any }) => (
        <InventoryItemCard item={item} currencySymbol={currencySymbol} />
    );

    if (isLoading && inventory.length === 0) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
                <View style={styles.header}>
                    <Text style={[styles.title, { color: colors.text }]}>{t('my_inventory')}</Text>
                </View>
                <ListSkeleton count={6} />
            </SafeAreaView>
        );
    }

    return (
        <ErrorBoundary>
            <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
                <View style={styles.bgBlob1} />
                <View style={styles.bgBlob2} />

                <View style={styles.header}>
                    <View>
                        <Text style={[styles.title, { color: colors.text }]}>{t('my_inventory')}</Text>
                        <Text style={[styles.subtitle, { color: colors.icon }]}>{inventory.length} {t('products_listed')}</Text>
                    </View>
                    <TouchableOpacity
                        style={[styles.addBtn, { backgroundColor: colors.primary }]}
                        onPress={() => router.push('/(supplier)/inventory/add')}
                    >
                        <Ionicons name="add" size={24} color="#FFF" />
                        <Text style={styles.addBtnText}>{t('add_new')}</Text>
                    </TouchableOpacity>
                </View>

                {/* Filter Chips */}
                <View>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ paddingHorizontal: 20, gap: 10 }}
                        style={{ marginBottom: 15 }}
                    >
                        {[
                            'All',
                            'Car',
                            'Bike',
                            'Scooter',
                            'Truck',
                            'Bus',
                            'Tractor',
                            'Van',
                            'Rickshaw',
                            'Earthmover',
                            'EV Vehicle',
                            'Other'
                        ].map((type) => (
                            <TouchableOpacity
                                key={type}
                                style={[
                                    styles.filterChip,
                                    filterType === type
                                        ? { backgroundColor: colors.text, borderColor: colors.text }
                                        : { backgroundColor: colors.card, borderColor: colors.border },
                                    { flexDirection: 'row', alignItems: 'center', gap: 6 }
                                ]}
                                onPress={() => setFilterType(type)}
                            >
                                {type === 'All' ? (
                                    <Ionicons
                                        name="grid-outline"
                                        size={18}
                                        color={filterType === type ? colors.background : colors.text}
                                    />
                                ) : (
                                    <VehicleIcon
                                        type={type}
                                        size={18}
                                        color={filterType === type ? colors.background : colors.text}
                                    />
                                )}
                                <Text style={[
                                    styles.filterText,
                                    filterType === type ? { color: colors.background } : { color: colors.text }
                                ]}>
                                    {type === 'All' ? t('all_items') : type}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                <View style={[styles.searchContainer, { backgroundColor: isDark ? colors.card : '#F2F2F7', borderColor: colors.border }]}>
                    <Ionicons name="search" size={20} color={colors.icon} />
                    <TextInput
                        style={[styles.searchInput, { color: colors.text }]}
                        placeholder={t('search_parts_name')}
                        placeholderTextColor={colors.icon}
                        value={search}
                        onChangeText={setSearch}
                    />
                </View>

                <FlatList
                    data={filteredInventory}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.list}
                    showsVerticalScrollIndicator={false}
                    refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refreshData} />}
                    ListEmptyComponent={
                        <EmptyState
                            icon="cube-outline"
                            title={search ? t('no_matches') : t('no_products_found')}
                            description={search ? t('try_different_search') : t('add_spare_parts_msg')}
                            action={!search ? {
                                label: t('add_new'),
                                onPress: () => router.push('/(supplier)/inventory/add')
                            } : undefined}
                        />
                    }
                />
            </SafeAreaView>
        </ErrorBoundary>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, position: 'relative', overflow: 'hidden' },
    bgBlob1: { position: 'absolute', top: -100, right: -100, width: 300, height: 300, borderRadius: 150, backgroundColor: '#FF6B0005', zIndex: -1 },
    bgBlob2: { position: 'absolute', top: 200, left: -100, width: 250, height: 250, borderRadius: 125, backgroundColor: '#FF950005', zIndex: -1 },

    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingBottom: 10 },
    title: { fontSize: 28, fontWeight: '900', letterSpacing: -0.5 },
    subtitle: { fontSize: 13, fontWeight: '500', marginTop: 4 },
    addBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, gap: 6, shadowColor: '#FF6B00', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
    addBtnText: { color: '#FFF', fontWeight: 'bold' },

    searchContainer: { marginHorizontal: 20, marginBottom: 10, flexDirection: 'row', alignItems: 'center', borderRadius: 12, paddingHorizontal: 12, height: 44, borderWidth: 1 },
    searchInput: { flex: 1, marginLeft: 8, fontSize: 15, fontWeight: '500' },

    list: { padding: 20, paddingBottom: 120 },


    emptyContainer: { alignItems: 'center', marginTop: 80, paddingHorizontal: 40 },
    emptyIconBg: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#F0F7FF', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
    emptyText: { fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
    emptySub: { fontSize: 14, textAlign: 'center', lineHeight: 20 },

    filterChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
    filterText: { fontWeight: '600', fontSize: 13 },
});
