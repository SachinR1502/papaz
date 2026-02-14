import { Colors } from '@/constants/theme';
import { useAdmin } from '@/context/AdminContext';
import { useAuth } from '@/context/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    Image,
    RefreshControl,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const MENU_ITEMS = [
    { id: 'approvals', title: 'Pending Approvals', icon: 'shield-account', color: '#FF9800', route: '/(admin)/(tabs)/approvals' },
    { id: 'jobs', title: 'Live Job Monitor', icon: 'car-connected', color: '#2196F3', route: '/(admin)/(tabs)/jobs' },
    { id: 'reports', title: 'Financial Reports', icon: 'file-chart', color: '#4CAF50', route: '/(admin)/(tabs)/reports' },
    { id: 'settings', title: 'Platform Settings', icon: 'cog', color: '#607D8B', route: '/(admin)/(tabs)/settings' },
];

export default function AdminDashboard() {
    const { logout } = useAuth();
    const { stats, pendingUsers, isLoading, settings, refreshDashboard } = useAdmin();
    const router = useRouter();
    const [refreshing, setRefreshing] = useState(false);
    const colorScheme = useColorScheme();
    const theme = colorScheme ?? 'light';
    const colors = Colors[theme];
    const isDark = theme === 'dark';

    const onRefresh = async () => {
        setRefreshing(true);
        await refreshDashboard();
        setRefreshing(false);
    };

    const confirmLogout = () => {
        Alert.alert("Logout", "Are you sure you want to logout?", [
            { text: "Cancel", style: "cancel" },
            { text: "Logout", style: "destructive", onPress: logout }
        ]);
    };

    const renderHeader = () => (
        <View style={styles.header}>
            <View style={styles.headerTop}>
                <View style={styles.profileContainer}>
                    <Image
                        source={{ uri: 'https://ui-avatars.com/api/?name=Admin+User&background=AF52DE&color=fff&size=128' }}
                        style={styles.avatar}
                    />
                    <View>
                        <Text style={[styles.greeting, { color: colors.text }]}>Hello, Administrator</Text>
                        <Text style={[styles.date, { color: colors.icon }]}>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</Text>
                    </View>
                </View>
                <TouchableOpacity onPress={confirmLogout} style={[styles.iconBtn, { backgroundColor: colors.card, shadowColor: colors.shadow }]}>
                    <Ionicons name="log-out-outline" size={24} color="#FF3B30" />
                </TouchableOpacity>
            </View>

            {/* Stats Overview */}
            <View style={styles.statsContainer}>
                {/* Hero Revenue Card - Full Width */}
                <TouchableOpacity style={styles.heroCard} onPress={() => router.push('/(admin)/(tabs)/reports')}>
                    <View style={styles.heroBgCircle} />
                    <View style={styles.heroContent}>
                        <View>
                            <Text style={styles.heroTitle}>Total Revenue</Text>
                            <Text style={styles.heroValue}>{settings.currency === 'INR' ? '₹' : '$'}{(stats.totalRevenue / 1000).toFixed(2)}k </Text>
                            <View style={styles.trendPill}>
                                <Ionicons name="trending-up" size={14} color="#FFF" />
                                <Text style={styles.trendText}>+12.5% this week</Text>
                            </View>
                        </View>
                        <View style={styles.heroIconBox}>
                            <MaterialCommunityIcons name="finance" size={32} color="#FFF" />
                        </View>
                    </View>
                </TouchableOpacity>

                {/* Secondary Stats Grid */}
                <View style={styles.gridRow}>
                    <TouchableOpacity style={[styles.gridCard, { backgroundColor: colors.card, shadowColor: colors.shadow }]} onPress={() => router.push('/(admin)/(tabs)/jobs')}>
                        <View style={styles.cardHeader}>
                            <View style={[styles.iconBox, { backgroundColor: isDark ? '#2196F320' : '#E3F2FD' }]}>
                                <MaterialCommunityIcons name="car-wrench" size={22} color="#2196F3" />
                            </View>
                            <View style={[styles.statusDot, { backgroundColor: '#2196F3' }]} />
                        </View>
                        <Text style={[styles.gridValue, { color: colors.text }]}>{stats.activeJobs}</Text>
                        <Text style={[styles.gridLabel, { color: colors.icon }]}>Active Jobs</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.gridCard, { backgroundColor: colors.card, shadowColor: colors.shadow }]} onPress={() => router.push('/(admin)/(tabs)/approvals')}>
                        <View style={styles.cardHeader}>
                            <View style={[styles.iconBox, { backgroundColor: isDark ? '#FF980020' : '#FFF3E0' }]}>
                                <MaterialCommunityIcons name="account-clock" size={22} color="#FF9800" />
                            </View>
                            {stats.pendingApprovals > 0 && (
                                <View style={styles.badge}>
                                    <Text style={styles.badgeText}>{stats.pendingApprovals}</Text>
                                </View>
                            )}
                        </View>
                        <Text style={[styles.gridValue, { color: colors.text }]}>{stats.pendingApprovals}</Text>
                        <Text style={[styles.gridLabel, { color: colors.icon }]}>Pending Apps</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );

    const renderPendingItem = ({ item }: { item: any }) => (
        <View style={styles.pendingItem}>
            <View style={[styles.pendingIcon, { backgroundColor: isDark ? colors.background : '#F5F5F5' }]}>
                <MaterialCommunityIcons name={item.type === 'technician' ? "wrench" : "store"} size={22} color={colors.icon} />
            </View>
            <View style={styles.pendingInfo}>
                <Text style={[styles.pendingName, { color: colors.text }]}>{item.businessName || item.name}</Text>
                <Text style={[styles.pendingType, { color: colors.icon }]}>{item.type.toUpperCase()} • {item.location}</Text>
            </View>
            <TouchableOpacity
                style={[styles.reviewBtn, { backgroundColor: isDark ? colors.background : '#F8F9FA', borderColor: colors.border }]}
                onPress={() => router.push('/(admin)/(tabs)/approvals')}
            >
                <Text style={[styles.reviewText, { color: colors.text }]}>Review</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
            <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
            >
                {renderHeader()}

                {/* Quick Actions Grid */}
                <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Actions</Text>
                </View>
                <View style={styles.menuGrid}>
                    {MENU_ITEMS.map((item) => (
                        <TouchableOpacity
                            key={item.id}
                            style={[styles.menuItem, { backgroundColor: colors.card, shadowColor: colors.shadow }]}
                            onPress={() => router.push(item.route as any)}
                        >
                            <View style={[styles.menuIcon, { backgroundColor: item.color + '15' }]}>
                                <MaterialCommunityIcons name={item.icon as any} size={28} color={item.color} />
                            </View>
                            <Text style={[styles.menuTitle, { color: colors.text }]}>{item.title}</Text>
                            <Ionicons name="chevron-forward" size={16} color={colors.icon} style={{ marginTop: 4 }} />
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Recent Activity / Pending List */}
                <View style={[styles.sectionHeader, { marginTop: 30 }]}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Applications</Text>
                    <TouchableOpacity onPress={() => router.push('/(admin)/(tabs)/approvals')}>
                        <Text style={styles.seeAll}>See All</Text>
                    </TouchableOpacity>
                </View>

                <View style={[styles.listContainer, { backgroundColor: colors.card, shadowColor: colors.shadow }]}>
                    {isLoading ? (
                        <ActivityIndicator size="small" color="#AF52DE" style={{ padding: 20 }} />
                    ) : pendingUsers.length > 0 ? (
                        pendingUsers.slice(0, 5).map((u, index) => (
                            <React.Fragment key={u.id}>
                                {renderPendingItem({ item: u })}
                                {index < Math.min(pendingUsers.length, 5) - 1 && <View style={[styles.divider, { backgroundColor: colors.border }]} />}
                            </React.Fragment>
                        ))
                    ) : (
                        <View style={styles.emptyState}>
                            <Text style={[styles.emptyText, { color: colors.icon }]}>No pending applications.</Text>
                        </View>
                    )}
                </View>

                <View style={{ height: 120 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    scrollContent: { paddingBottom: 120 },

    header: { paddingHorizontal: 20, paddingTop: 10, marginBottom: 10 },
    headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    profileContainer: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    avatar: { width: 48, height: 48, borderRadius: 24, borderWidth: 2, borderColor: '#FFF' },
    greeting: { fontSize: 18, fontWeight: 'bold' },
    date: { fontSize: 13, fontWeight: '500' },
    iconBtn: { padding: 8, borderRadius: 12, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },

    statsContainer: { gap: 15 },
    heroCard: {
        backgroundColor: '#AF52DE',
        borderRadius: 24,
        padding: 24,
        minHeight: 140,
        position: 'relative',
        overflow: 'hidden',
        shadowColor: '#AF52DE',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 16,
        elevation: 8,
    },
    heroBgCircle: {
        position: 'absolute',
        top: -20,
        right: -20,
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    heroContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    heroTitle: { fontSize: 14, color: 'rgba(255,255,255,0.9)', fontWeight: '600', marginBottom: 8 },
    heroValue: { fontSize: 36, fontWeight: '800', color: '#FFF', marginBottom: 12 },
    heroIconBox: { padding: 10, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 16 },
    trendPill: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20, alignSelf: 'flex-start', gap: 6 },
    trendText: { color: '#FFF', fontSize: 12, fontWeight: '700' },

    gridRow: { flexDirection: 'row', gap: 15 },
    gridCard: {
        flex: 1,
        borderRadius: 20,
        padding: 16,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 3,
    },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
    iconBox: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
    statusDot: { width: 8, height: 8, borderRadius: 4 },
    badge: { backgroundColor: '#FF3B30', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 10, minWidth: 20, alignItems: 'center' },
    badgeText: { color: '#FFF', fontSize: 10, fontWeight: 'bold' },
    gridValue: { fontSize: 24, fontWeight: '800' },
    gridLabel: { fontSize: 13, marginTop: 4, fontWeight: '500' },

    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 15 },
    sectionTitle: { fontSize: 18, fontWeight: '700' },
    seeAll: { fontSize: 14, fontWeight: '600', color: '#AF52DE' },

    menuGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 15, paddingHorizontal: 20 },
    menuItem: { width: (width - 55) / 2, padding: 16, borderRadius: 20, alignItems: 'center', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
    menuIcon: { width: 56, height: 56, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
    menuTitle: { fontSize: 14, fontWeight: '600', textAlign: 'center' },

    listContainer: { marginHorizontal: 20, borderRadius: 24, padding: 8, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
    pendingItem: { flexDirection: 'row', alignItems: 'center', padding: 12 },
    pendingIcon: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    pendingInfo: { flex: 1 },
    pendingName: { fontSize: 15, fontWeight: '700' },
    pendingType: { fontSize: 12, marginTop: 2 },
    reviewBtn: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 10, borderWidth: 1 },
    reviewText: { fontSize: 12, fontWeight: '600' },
    divider: { height: 1, marginHorizontal: 12 },
    emptyState: { padding: 24, alignItems: 'center' },
    emptyText: { fontStyle: 'italic' },
});
