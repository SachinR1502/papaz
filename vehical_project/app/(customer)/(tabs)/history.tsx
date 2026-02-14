import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { StatusBadge, getStatusColor } from '@/components/ui/StatusBadge';
import { VehicleIcon } from '@/components/ui/VehicleIcon';
import { Colors } from '@/constants/theme';
import { useAdmin } from '@/context/AdminContext';
import { useCustomer } from '@/context/CustomerContext';
import { useLanguage } from '@/context/LanguageContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { formatCurrency } from '@/utils/formatting';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    FlatList,
    Platform,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export default function HistoryScreen() {
    const { activeJobs, historyJobs, vehicles, refresh } = useCustomer();
    const { settings } = useAdmin();
    const { t } = useLanguage();
    const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');
    const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
    const router = useRouter();
    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = async () => {
        setRefreshing(true);
        try {
            await refresh();
        } catch (e) {
            console.error(e);
        } finally {
            setRefreshing(false);
        }
    };

    const colorScheme = useColorScheme();
    const theme = colorScheme ?? 'light';
    const colors = Colors[theme];
    const isDark = theme === 'dark';

    // Animation Refs
    const blob1Anim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(blob1Anim, { toValue: 1, duration: 8000, useNativeDriver: true }),
                Animated.timing(blob1Anim, { toValue: 0, duration: 8000, useNativeDriver: true }),
            ])
        ).start();
    }, []);

    // Filtered Data
    const ongoingJobs = activeJobs
        .filter(j => j.status !== 'completed' && j.status !== 'cancelled')
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const completedJobsForVehicle = selectedVehicleId
        ? historyJobs
            .filter(j => j.vehicleId === selectedVehicleId) // Include both completed and cancelled
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        : [];

    const selectedVehicle = vehicles.find(v => v.id === selectedVehicleId);

    // Handlers
    const handleTabChange = (tab: 'active' | 'completed') => {
        Haptics.selectionAsync();
        setActiveTab(tab);
        setSelectedVehicleId(null); // Reset drill-down on tab switch
    };

    // Render Components
    const renderActiveJob = ({ item }: { item: any }) => {
        const statusColor = getStatusColor(item.status);

        return (
            <TouchableOpacity
                style={[styles.historyCard, { backgroundColor: colors.card, borderLeftColor: statusColor, shadowColor: colors.shadow }]}
                onPress={() => {
                    Haptics.selectionAsync();
                    router.push({ pathname: '/(customer)/booking/[id]', params: { id: item.id } });
                }}
            >
                <View style={styles.cardHeader}>
                    <StatusBadge status={item.status} size="small" showIcon={false} />
                    <Text style={[styles.dateText, { color: colors.icon }]}>
                        {new Date(item.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                    </Text>
                </View>
                <View style={styles.cardBody}>
                    <View style={{ flex: 1 }}>
                        <Text style={[styles.vehicleTitle, { color: colors.text }]}>{item.vehicleModel || t('vehicle')}</Text>
                        <Text style={[styles.serviceDesc, { color: colors.icon }]} numberOfLines={1}>{item.description}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={colors.icon} />
                </View>
            </TouchableOpacity>
        );
    };

    const renderVehicleItem = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={[styles.vehicleCard, { backgroundColor: colors.card, shadowColor: colors.shadow }]}
            onPress={() => {
                Haptics.selectionAsync();
                setSelectedVehicleId(item.id);
            }}
            activeOpacity={0.8}
        >
            <View style={[styles.vehicleIcon, { backgroundColor: isDark ? colors.customers + '20' : '#F0F9FF' }]}>
                <VehicleIcon
                    type={item.vehicleType}
                    make={item.make}
                    model={item.model}
                    size={32}
                    color={colors.customers}
                />
            </View>
            <View style={{ flex: 1 }}>
                <Text style={[styles.vehicleTitle, { color: colors.text }]}>{item.make} {item.model}</Text>
                <Text style={[styles.vehicleSubtitle, { color: colors.icon }]}>{item.year} • {item.registrationNumber}</Text>
            </View>
            <View style={{ alignItems: 'flex-end', gap: 4 }}>
                <Text style={{ fontSize: 10, color: colors.icon, fontFamily: 'NotoSans-Bold' }}>
                    {historyJobs.filter(j => j.vehicleId === item.id).length} {t('records')}
                </Text>
                <Ionicons name="chevron-forward" size={24} color={colors.icon} />
            </View>
        </TouchableOpacity>
    );

    const renderCompletedJob = ({ item }: { item: any }) => {
        const isCancelled = item.status === 'cancelled';
        const statusColor = isCancelled ? '#FF3B30' : colors.sales;

        return (
            <TouchableOpacity
                style={[styles.historyCard, { backgroundColor: colors.card, borderLeftColor: statusColor, shadowColor: colors.shadow }]}
                activeOpacity={0.9}
                onPress={() => {
                    Haptics.selectionAsync();
                    router.push({ pathname: '/(customer)/booking/[id]', params: { id: item.id } });
                }}
            >
                <View style={[styles.cardHeader, { marginBottom: 10 }]}>
                    <Text style={[styles.dateText, { color: colors.icon }]}>
                        {new Date(item.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                    </Text>
                    <StatusBadge status={isCancelled ? 'cancelled' : 'completed'} size="small" showIcon={false} />
                </View>

                <View style={styles.cardBody}>
                    <View style={{ flex: 1 }}>
                        <Text style={[styles.serviceDesc, { color: colors.text }]} numberOfLines={2}>{item.description}</Text>
                        <Text style={[styles.invoiceId, { color: colors.icon }]}>{t('invoice_id')}: {item.id ? item.id.slice(0, 8).toUpperCase() : 'N/A'}</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                        <Text style={[styles.costValue, { color: isCancelled ? colors.icon : colors.text }]}>
                            {isCancelled ? '—' : (item.bill || item.quote
                                ? formatCurrency((item.bill?.totalAmount || item.quote?.totalAmount || 0), settings.currency)
                                : '...')}
                        </Text>
                        {!isCancelled && <Text style={[styles.costLabel, { color: colors.icon }]}>{t('total_amount')}</Text>}
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <ErrorBoundary>
            <View style={[styles.container, { backgroundColor: colors.background }]}>
                {/* Background Blob */}
                <View style={StyleSheet.absoluteFill} pointerEvents="none">
                    <Animated.View style={[
                        styles.blob,
                        {
                            backgroundColor: colors.primary,
                            top: -50,
                            right: -50,
                            opacity: 0.05,
                            transform: [
                                { scale: blob1Anim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.2] }) }
                            ]
                        }
                    ]} />
                </View>

                <SafeAreaView style={{ flex: 1 }} edges={['top']}>
                    {/* Header */}
                    <View style={[styles.header, { backgroundColor: isDark ? colors.card : 'rgba(255,255,255,0.8)', shadowColor: colors.shadow }]}>
                        <View style={styles.headerTop}>
                            <View>
                                <Text style={[styles.headerTitle, { color: colors.text }]}>
                                    {selectedVehicleId ? (selectedVehicle?.model || t('vehicle')) : t('services_title')}
                                </Text>
                                <Text style={[styles.headerSubtitle, { color: colors.icon }]}>
                                    {selectedVehicleId
                                        ? (selectedVehicle?.registrationNumber || '')
                                        : `${t('active_jobs') || 'Active Jobs'}: ${ongoingJobs.length}`
                                    }
                                </Text>
                            </View>
                            <TouchableOpacity
                                style={[styles.addCircleBtn, { backgroundColor: colors.text, shadowColor: colors.shadow }]}
                                onPress={() => {
                                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                                    if (selectedVehicleId) {
                                        setSelectedVehicleId(null);
                                    } else {
                                        router.push('/(customer)/booking/create');
                                    }
                                }}
                            >
                                <Ionicons
                                    name={selectedVehicleId ? "close" : "add"}
                                    size={26}
                                    color={colors.background}
                                />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Tabs */}
                    {!selectedVehicleId && (
                        <View style={styles.tabContainer}>
                            <View style={[styles.tabWrapper, { backgroundColor: isDark ? colors.border : '#F5F5F5' }]}>
                                <TouchableOpacity
                                    style={[styles.tabItem, activeTab === 'active' && [styles.tabItemActive, { backgroundColor: colors.card, shadowColor: colors.shadow }]]}
                                    onPress={() => handleTabChange('active')}
                                >
                                    <Text style={[styles.tabText, { color: colors.icon }, activeTab === 'active' && [styles.tabTextActive, { color: colors.text }]]}>{t('tab_active')}</Text>
                                    {ongoingJobs.length > 0 && (
                                        <View style={[styles.tabBadge, { backgroundColor: colors.notification }]}>
                                            <Text style={styles.tabBadgeText}>{ongoingJobs.length}</Text>
                                        </View>
                                    )}
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.tabItem, activeTab === 'completed' && [styles.tabItemActive, { backgroundColor: colors.card, shadowColor: colors.shadow }]]}
                                    onPress={() => handleTabChange('completed')}
                                >
                                    <Text style={[styles.tabText, { color: colors.icon }, activeTab === 'completed' && [styles.tabTextActive, { color: colors.text }]]}>{t('tab_history')}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}

                    <View style={[styles.contentArea, { backgroundColor: isDark ? colors.background : '#F8F9FE' }]}>
                        {/* Active Tab Content */}
                        {activeTab === 'active' && (
                            <FlatList
                                data={ongoingJobs}
                                renderItem={renderActiveJob}
                                keyExtractor={item => item.id}
                                contentContainerStyle={styles.listContent}
                                showsVerticalScrollIndicator={false}
                                refreshControl={
                                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
                                }
                                ListEmptyComponent={
                                    <EmptyState
                                        icon="time-outline"
                                        title={t('no_active_jobs')}
                                        description="All your active service requests will appear here"
                                        action={{
                                            label: t('book_service'),
                                            onPress: () => router.push('/(customer)/booking/create')
                                        }}
                                    />
                                }
                            />
                        )}

                        {/* Completed Tab Content */}
                        {activeTab === 'completed' && (
                            <>
                                {!selectedVehicleId ? (
                                    <FlatList
                                        data={vehicles}
                                        renderItem={renderVehicleItem}
                                        keyExtractor={item => item.id}
                                        contentContainerStyle={styles.listContent}
                                        showsVerticalScrollIndicator={false}
                                        refreshControl={
                                            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
                                        }
                                        ListHeaderComponent={<Text style={[styles.sectionHeader, { color: colors.icon }]}>{t('select_vehicle_history')}</Text>}
                                    />
                                ) : (
                                    <FlatList
                                        data={completedJobsForVehicle}
                                        renderItem={renderCompletedJob}
                                        keyExtractor={item => item.id}
                                        contentContainerStyle={styles.listContent}
                                        showsVerticalScrollIndicator={false}
                                        refreshControl={
                                            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
                                        }
                                        ListEmptyComponent={
                                            <EmptyState
                                                icon="document-text-outline"
                                                title={t('no_completed_jobs')}
                                                description="Service history for this vehicle will appear here once completed"
                                            />
                                        }
                                    />
                                )}
                            </>
                        )}
                    </View>
                </SafeAreaView>
            </View>
        </ErrorBoundary>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    blob: { position: 'absolute', width: 300, height: 300, borderRadius: 150 },
    header: {
        paddingHorizontal: 24,
        paddingTop: 10,
        paddingBottom: 25,
        borderBottomLeftRadius: 35,
        borderBottomRightRadius: 35,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.04,
        shadowRadius: 20,
        elevation: 4,
    },
    headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    headerTitle: { fontSize: 28, fontFamily: 'NotoSans-Black' },
    headerSubtitle: { fontSize: 13, fontFamily: 'NotoSans-Regular', marginTop: 2 },
    addCircleBtn: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 5
    },

    tabContainer: { paddingHorizontal: 20, marginBottom: 15 },
    tabWrapper: { flexDirection: 'row', borderRadius: 12, padding: 4 },
    tabItem: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: 10, gap: 6 },
    tabItemActive: { shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 1 },
    tabText: { fontFamily: 'NotoSans-Bold', fontSize: 13 },
    tabTextActive: {},
    tabBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 10, minWidth: 20, justifyContent: 'center', alignItems: 'center' },
    tabBadgeText: { color: '#FFF', fontSize: 10, fontFamily: 'NotoSans-Bold' },

    contentArea: { flex: 1 },
    listContent: { padding: 20, paddingBottom: 120 },
    sectionHeader: { fontSize: 14, fontFamily: 'NotoSans-Bold', marginBottom: 15, marginLeft: 5 },

    // Vehicle Card
    vehicleCard: { flexDirection: 'row', alignItems: 'center', padding: 15, borderRadius: 16, marginBottom: 12, gap: 15, shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
    vehicleIcon: { width: 50, height: 50, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    vehicleTitle: { fontSize: 16, fontFamily: 'NotoSans-Bold' },
    vehicleSubtitle: { fontSize: 13, fontFamily: 'NotoSans-Regular' },

    // History Card (Simplified)
    historyCard: { borderRadius: 18, padding: 18, marginBottom: 12, borderLeftWidth: 4, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    statusChip: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
    statusText: { fontSize: 11, fontFamily: 'NotoSans-Bold' },
    dateText: { fontSize: 13, fontFamily: 'NotoSans-Regular' },

    cardBody: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    serviceDesc: { fontSize: 15, fontFamily: 'NotoSans-Bold', marginBottom: 4 },
    invoiceId: { fontSize: 11, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' },

    costValue: { fontSize: 18, fontFamily: 'NotoSans-Black' },
    costLabel: { fontSize: 10, fontFamily: 'NotoSans-Bold' },

    // Empty State
    emptyState: { alignItems: 'center', paddingTop: 60, gap: 10 },
    emptyStateText: { fontSize: 14, fontFamily: 'NotoSans-Regular' },
});
