import { SupplierWithdrawModal } from '@/components/supplier/SupplierWithdrawModal';
import { WholesaleSummaryCard } from '@/components/supplier/WholesaleSummaryCard';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { DashboardSkeleton } from '@/components/ui/Skeleton';
import { StatCard } from '@/components/ui/StatCard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Colors } from '@/constants/theme';
import { useAdmin } from '@/context/AdminContext';
import { useAuth } from '@/context/AuthContext';
import { useChat } from '@/context/ChatContext';
import { useLanguage } from '@/context/LanguageContext';
import { useNotifications } from '@/context/NotificationContext';
import { useSupplier } from '@/context/SupplierContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { Image, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SupplierDashboard() {
    const { user, logout } = useAuth();
    const { profile, orders, wholesaleOrders: directWholesaleOrders, walletBalance, refreshData, isLoading, inventory, requestWithdrawal } = useSupplier();
    const { settings } = useAdmin();
    const { conversations } = useChat();
    const { t } = useLanguage();
    const { hasUnread } = useNotifications();
    const router = useRouter();

    const currencySymbol = settings.currency === 'INR' ? '₹' : '$';
    const colorScheme = useColorScheme();
    const theme = colorScheme ?? 'light';
    const colors = Colors[theme];
    const isDark = theme === 'dark';

    // UI State
    const [isWithdrawVisible, setIsWithdrawVisible] = React.useState(false);

    useEffect(() => {
        refreshData();
    }, []);

    // Derived Metrics
    // Derived Metrics
    // Combine direct wholesale orders and broadcast inquiries
    const broadcastInquiries = orders.filter(o => o.status === 'inquiry' && !o.supplier);

    // Merge and deduplicate wholesale requests
    const allWholesaleMap = new Map();
    directWholesaleOrders.forEach(o => allWholesaleMap.set(o.id, o));
    broadcastInquiries.forEach(o => allWholesaleMap.set(o.id, o));

    const allWholesale = Array.from(allWholesaleMap.values());

    // Filter for active wholesale requests/inquiries
    const activeWholesale = allWholesale.filter(o => ['inquiry', 'pending', 'quoted'].includes(o.status));

    const pendingOrders = orders.filter(o => o.status === 'pending').length;
    const completedOrders = orders.filter(o => o.status === 'delivered').length;
    const lowStockItems = inventory.filter(i => i.quantity < 5).length;
    const myChats = conversations.filter(c => c.participants.some(p => p.userId === (user?.id || 's1')));

    if (isLoading) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
                <DashboardSkeleton />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
            <View style={styles.bgBlob1} />
            <View style={styles.bgBlob2} />
            <View style={styles.bgBlob3} />

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refreshData} />}
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.userProfile}>
                        <TouchableOpacity
                            style={styles.avatarContainer}
                            onPress={() => router.push('/(supplier)/(tabs)/profile')}
                        >
                            <Image
                                source={{ uri: profile?.logo || 'https://images.unsplash.com/photo-1556740738-b6a63e27c4df?w=200&h=200&fit=crop' }}
                                style={[styles.avatar, { backgroundColor: colors.border }]}
                            />
                            <View style={styles.onlineStatus} />
                        </TouchableOpacity>
                        <View>
                            <Text style={[styles.greetingText, { color: colors.icon }]}>{t('welcome_back')},</Text>
                            <Text style={[styles.userNameText, { color: colors.text }]}>{profile?.shopName || t('my_shop')}</Text>
                        </View>
                    </View>
                    <View style={styles.headerActions}>
                        <TouchableOpacity
                            style={[styles.headerBtn, { backgroundColor: colors.card }]}
                            onPress={() => router.push('/(supplier)/notifications')}
                        >
                            {hasUnread && <View style={styles.notificationDot} />}
                            <Ionicons name="notifications-outline" size={24} color={colors.text} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={logout} style={[styles.logoutBtn, { backgroundColor: isDark ? '#3E1010' : '#FFF0F0' }]}>
                            <Ionicons name="log-out-outline" size={24} color="#FF3B30" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Earnings / Wallet Card */}
                <View style={[styles.earningsCard, { backgroundColor: isDark ? colors.card : '#1A1A1A', borderColor: colors.border, borderWidth: isDark ? 1 : 0 }]}>
                    <View style={styles.walletHeader}>
                        <Text style={[styles.earningsLabel, { color: isDark ? colors.icon : '#8E8E93' }]}>{String(t('total_revenue') || 'Total Revenue').toUpperCase()}</Text>
                        <TouchableOpacity
                            style={[styles.withdrawBtn, { backgroundColor: isDark ? colors.primary + '20' : 'rgba(255,255,255,0.15)' }]}
                            onPress={() => setIsWithdrawVisible(true)}
                        >
                            <Text style={[styles.withdrawText, { color: isDark ? colors.primary : '#FFF' }]}>{t('withdraw')}</Text>
                        </TouchableOpacity>
                    </View>
                    <Text style={[styles.earningsValue, { color: isDark ? colors.text : '#FFFFFF' }]}>{currencySymbol}{walletBalance.toFixed(0)}</Text>
                    <View style={styles.earningsFooter}>
                        <MaterialCommunityIcons name="shield-check" size={16} color="#4CAF50" />
                        <Text style={styles.earningsTrend}>{t('verified_earnings')}</Text>
                    </View>
                </View>

                {/* Stats Grid */}
                <View style={styles.statsGrid}>
                    <StatCard
                        title={t('pending_orders')}
                        value={pendingOrders}
                        icon="clock-outline"
                        color="#FF9500"
                        onPress={() => router.push('/(supplier)/(tabs)/orders')}
                    />
                    <StatCard
                        title={t('low_stock_val')}
                        value={lowStockItems}
                        icon="alert-circle-outline"
                        color="#FF3B30"
                        onPress={() => router.push('/(supplier)/(tabs)/inventory')}
                    />
                    <StatCard
                        title={t('delivered')}
                        value={completedOrders}
                        icon="check-decagram-outline"
                        color="#34C759"
                    />
                    <StatCard
                        title={t('wholesale_req')}
                        value={activeWholesale.length}
                        icon="briefcase-outline"
                        color="#5856D6"
                        onPress={() => router.push('/(supplier)/(tabs)/orders')}
                    />
                </View>

                {/* Recent Messages */}
                {myChats.length > 0 && (
                    <View style={styles.section}>
                        <SectionHeader title={t('recent_messages')} />
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -20, paddingHorizontal: 20, marginBottom: 30 }}>
                            {myChats.map((chat, index) => {
                                const otherParticipant = chat.participants.find(p => p.userId !== (user?.id || 's1'));
                                return (
                                    <TouchableOpacity
                                        key={chat.id || `chat-${index}`}
                                        style={[styles.wholesaleCard, { width: 260, backgroundColor: colors.card, borderColor: colors.border }]}
                                        onPress={() => router.push({ pathname: '/(supplier)/chat/[id]', params: { id: chat.id } } as any)}
                                    >
                                        <View style={styles.wholesaleHeader}>
                                            <View style={[styles.garageChip, { backgroundColor: colors.customers + '20' }]}>
                                                <Ionicons name="person" size={12} color={colors.customers} />
                                                <Text style={[styles.garageName, { color: colors.customers }]}>{otherParticipant?.name}</Text>
                                            </View>
                                            <Text style={styles.itemCountText}>{new Date(chat.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                                        </View>
                                        <Text style={[styles.wholesalePreview, { color: colors.text }]} numberOfLines={2}>
                                            {chat.lastMessage?.content ? t(chat.lastMessage.content) : t('no_messages_yet')}
                                        </Text>
                                        <View style={[styles.wholesaleFooter, { borderTopColor: colors.border }]}>
                                            <Text style={[styles.statusText, { color: colors.customers }]}>{chat.lastMessage ? t('active_status') : t('new_status')}</Text>
                                            <Ionicons name="chatbubble-ellipses" size={20} color={colors.customers} />
                                        </View>
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>
                    </View>
                )}

                {/* Wholesale Inquiries Section */}
                <SectionHeader
                    title={t('wholesale_inquiries')}
                    rightElement={
                        <View style={styles.newBadge}>
                            <Text style={styles.newBadgeText}>{t('new')}</Text>
                        </View>
                    }
                />

                {activeWholesale.length > 0 ? (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.wholesaleScroll}>
                        {activeWholesale.map((request, index) => (
                            <WholesaleSummaryCard key={request.id || `whale-${index}`} request={request} index={index} />
                        ))}
                    </ScrollView>
                ) : (
                    <View style={[styles.emptyCard, { backgroundColor: colors.card, marginBottom: 20 }]}>
                        <Text style={styles.emptyText}>{t('no_wholesale_inquiries')}</Text>
                    </View>
                )}

                {/* Quick Actions Section */}
                <SectionHeader title={t('quick_actions')} />
                <View style={styles.actionRow}>
                    <TouchableOpacity
                        style={[styles.actionBtn, { backgroundColor: colors.primary }]}
                        onPress={() => router.push('/(supplier)/inventory/add')}
                    >
                        <Ionicons name="add-circle" size={24} color="#fff" />
                        <Text style={styles.actionBtnText}>{t('add_product')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.actionBtn, { backgroundColor: colors.revenue }]}
                        onPress={() => router.push('/(supplier)/(tabs)/orders')}
                    >
                        <Ionicons name="list" size={24} color="#fff" />
                        <Text style={styles.actionBtnText}>{t('manage_orders')}</Text>
                    </TouchableOpacity>
                </View>

                {/* Recent Orders List */}
                <SectionHeader
                    title={t('recent_orders')}
                    actionText={t('see_all')}
                    onAction={() => router.push('/(supplier)/(tabs)/orders')}
                />

                {orders.length > 0 ? (
                    orders.slice(0, 3).map((order, index) => (
                        <TouchableOpacity
                            key={order.id || `order-${index}`}
                            style={[styles.activityCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                            onPress={() => router.push('/(supplier)/(tabs)/orders')}
                        >
                            <View style={[styles.activityIcon, { backgroundColor: order.urgency === 'High' ? colors.notification + '15' : colors.customers + '15' }]}>
                                <Ionicons name={order.type === 'Bike' ? "bicycle" : "car-sport"} size={20} color={order.urgency === 'High' ? colors.notification : colors.customers} />
                            </View>
                            <View style={styles.activityInfo}>
                                <Text style={[styles.activityTitle, { color: colors.text }]}>{t(order.partName || order.name || 'unknown_part')}</Text>
                                <Text style={styles.activitySub}>{t('qty_label')}: {order.quantity} • {typeof order.location === 'string' ? t(order.location) : t('online_order')}</Text>
                            </View>
                            <View style={{ alignItems: 'flex-end' }}>
                                <StatusBadge status={order.status} size="small" showIcon={false} />
                            </View>
                        </TouchableOpacity>
                    ))
                ) : (
                    <View style={[styles.emptyCard, { backgroundColor: colors.card }]}>
                        <Text style={styles.emptyText}>{t('no_recent_orders')}</Text>
                    </View>
                )}

                <View style={{ height: 120 }} />
            </ScrollView>



            {/* Withdraw Modal */}
            {/* Withdraw Modal */}
            <SupplierWithdrawModal
                visible={isWithdrawVisible}
                onClose={() => setIsWithdrawVisible(false)}
                onWithdraw={requestWithdrawal}
                walletBalance={walletBalance}
                currencySymbol={currencySymbol}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, position: 'relative', overflow: 'hidden' },
    bgBlob1: { position: 'absolute', top: -100, right: -100, width: 300, height: 300, borderRadius: 150, backgroundColor: '#FF6B0010', zIndex: -1 },
    bgBlob2: { position: 'absolute', bottom: 100, left: -150, width: 400, height: 400, borderRadius: 200, backgroundColor: '#34C75908', zIndex: -1 },
    bgBlob3: { position: 'absolute', top: '40%', right: -150, width: 350, height: 350, borderRadius: 175, backgroundColor: '#FFD70008', zIndex: -1 },
    scrollContent: { paddingHorizontal: 20, paddingBottom: 100 },

    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 20 },
    userProfile: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    avatarContainer: { position: 'relative' },
    avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#F0F0F0' },
    onlineStatus: { position: 'absolute', bottom: 2, right: 2, width: 12, height: 12, borderRadius: 6, backgroundColor: '#34C759', borderWidth: 2, borderColor: '#FFF' },
    greetingText: { fontSize: 13, color: '#8E8E93' },
    userNameText: { fontSize: 18, fontWeight: 'bold', color: '#1A1A1A' },
    headerActions: { flexDirection: 'row', gap: 10 },
    headerBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#F8F9FE', justifyContent: 'center', alignItems: 'center' },
    logoutBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFF0F0', justifyContent: 'center', alignItems: 'center' },
    notificationDot: { position: 'absolute', top: 12, right: 14, width: 8, height: 8, borderRadius: 4, backgroundColor: '#FF3B30', borderWidth: 1.5, borderColor: '#F8F9FE' },

    earningsCard: {
        backgroundColor: '#1A1A1A',
        borderRadius: 20,
        padding: 24,
        marginBottom: 25,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 5,
    },
    walletHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    earningsLabel: { color: '#8E8E93', fontSize: 11, fontWeight: '800', letterSpacing: 1 },
    withdrawBtn: { backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
    withdrawText: { color: '#FFF', fontSize: 12, fontWeight: '700' },
    earningsValue: { color: '#FFFFFF', fontSize: 36, fontWeight: '900', marginVertical: 10 },
    earningsFooter: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    earningsTrend: { color: '#4CAF50', fontSize: 13, fontWeight: '600' },

    statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12, marginBottom: 30 },

    actionRow: { flexDirection: 'row', gap: 12, marginBottom: 30 },
    actionBtn: { flex: 1, height: 100, borderRadius: 18, justifyContent: 'center', alignItems: 'center', gap: 8 },
    actionBtnText: { color: '#fff', fontSize: 14, fontWeight: 'bold' },

    activityCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderWidth: 1, borderColor: '#F0F0F0', padding: 15, borderRadius: 16, marginBottom: 10 },
    activityIcon: { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
    activityInfo: { flex: 1 },
    activityTitle: { fontSize: 15, fontWeight: 'bold', color: '#1C1C1E' },
    activitySub: { fontSize: 12, color: '#8E8E93', marginTop: 2 },
    statusText: { fontSize: 11, fontWeight: 'bold' },

    section: { marginBottom: 30 },
    emptyCard: { padding: 30, backgroundColor: '#F8F9FE', borderRadius: 16, alignItems: 'center' },
    emptyText: { color: '#999', fontSize: 14 },

    notificationDropdown: {
        position: 'absolute',
        top: 80,
        right: 20,
        width: 300,
        backgroundColor: '#FFF',
        borderRadius: 20,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.15,
        shadowRadius: 24,
        elevation: 10,
        zIndex: 100,
        borderWidth: 1,
        borderColor: '#F2F2F7',
    },
    notifHeader: { fontSize: 16, fontWeight: 'bold', marginBottom: 12, marginLeft: 4 },
    notifItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F2F2F7', gap: 12 },
    notifIcon: { width: 36, height: 36, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    notifTitle: { fontSize: 14, fontWeight: 'bold', color: '#1A1A1A' },
    notifdesc: { fontSize: 12, color: '#8E8E93', marginTop: 2, maxWidth: 200 },


    // Wholesale Dashboard Styles (Still used by Chat/Messages section)
    newBadge: { backgroundColor: '#FF3B30', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, marginLeft: 10, height: 20, justifyContent: 'center' },
    newBadgeText: { color: '#FFF', fontSize: 10, fontWeight: '900' },
    wholesaleScroll: { marginBottom: 30, marginHorizontal: -20, paddingHorizontal: 20 },
    wholesaleCard: { width: 280, backgroundColor: '#FFF', borderRadius: 24, padding: 20, borderWidth: 1, borderColor: '#F0F0F0', marginRight: 15, shadowColor: '#5856D6', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
    wholesaleHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
    garageChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#5856D610', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10, gap: 5 },
    garageName: { fontSize: 11, fontWeight: 'bold', color: '#5856D6' },
    itemCountBadge: { backgroundColor: '#F8F9FE', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
    itemCountText: { fontSize: 10, fontWeight: '800', color: '#8E8E93' },
    wholesalePreview: { fontSize: 14, fontWeight: '600', color: '#1A1A1A', lineHeight: 20, height: 40, marginBottom: 15 },
    wholesaleFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#F2F2F7', paddingTop: 15 },
    orderIdText: { fontSize: 11, color: '#C7C7CC', fontWeight: 'bold' },
    viewDetailedBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    viewDetailedText: { fontSize: 13, fontWeight: 'bold', color: '#5856D6' },

    // Modal Styles matching Customer Cart

});
