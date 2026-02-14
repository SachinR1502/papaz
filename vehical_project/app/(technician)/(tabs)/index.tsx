import { WithdrawModal } from '@/components/technician/WithdrawModal';
import { DashboardSkeleton } from '@/components/ui/Skeleton';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { VehicleIcon } from '@/components/ui/VehicleIcon';
import { useAdmin } from '@/context/AdminContext';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { useNotifications } from '@/context/NotificationContext';
import { useTechnician } from '@/context/TechnicianContext';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    Platform,
    RefreshControl,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    UIManager,
    useColorScheme,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ApprovalStatus from '../onboarding/status';

if (Platform.OS === 'android') {
    if (UIManager.setLayoutAnimationEnabledExperimental) {
        UIManager.setLayoutAnimationEnabledExperimental(true);
    }
}

const { width } = Dimensions.get('window');

export default function TechnicianHome() {
    const { logout, user } = useAuth();
    const { availableJobs, myJobs, isOnline, toggleOnline, walletBalance, profile, refreshJobs, isLoading, isRegistered, isApproved, requestWithdrawal } = useTechnician();
    const { settings } = useAdmin();
    const { t } = useLanguage();
    const { hasUnread } = useNotifications();
    const router = useRouter();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    // useEffect(() => {
    //     console.log('Available Jobs:', availableJobs);
    // }, [availableJobs]);

    const colors = {
        background: isDark ? '#000000' : '#FFFFFF',
        card: isDark ? '#1C1C1E' : '#FFFFFF',
        text: isDark ? '#FFFFFF' : '#1A1A1A',
        subText: isDark ? '#A1A1A6' : '#8E8E93',
        border: isDark ? '#2C2C2E' : '#F5F5F7',
        primary: '#FF6B00',
        iconBg: isDark ? '#2C2C2E' : '#FFFFFF',
        inputBg: isDark ? '#1C1C1E' : '#F8F9FE',
        shadow: isDark ? '#000' : '#000',
        success: '#34C759',
        warning: '#FF9500',
        error: '#FF3B30',
        walletCard: isDark ? '#2C2C2E' : '#1A1A1A',
    };
    const currencySymbol = settings.currency === 'INR' ? '₹' : '$';

    const [isWithdrawVisible, setIsWithdrawVisible] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    // Animations
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 600,
                useNativeDriver: true,
            })
        ]).start();
    }, []);

    // Failsafe checks
    useEffect(() => {
        if (isLoading) return;

        if (isRegistered && !isApproved) {
            router.replace('/(technician)/onboarding/status');
        }
    }, [isApproved, isRegistered, isLoading]);


    const onRefresh = async () => {
        setRefreshing(true);
        await refreshJobs();
        setRefreshing(false);
    };

    useFocusEffect(
        useCallback(() => {
            refreshJobs();
        }, [])
    );

    // Refined Stats Logic
    const pendingMyJobsCount = myJobs.filter(j => j.status === 'pending').length;
    const activeMyJobsCount = myJobs.filter(j => ['accepted', 'in_progress', 'parts_ordered', 'work_in_progress', 'quality_check', 'ready_for_delivery'].includes(j.status)).length;

    // Total "New Opportunities" = Broadcasts (Available) + Assigned Pending (My Jobs)
    const newLeadsCount = availableJobs.length + pendingMyJobsCount;

    const stats = [
        { label: t('active_jobs'), value: activeMyJobsCount, icon: 'hammer-wrench', color: '#FF6B00' },
        { label: t('new_leads'), value: newLeadsCount, icon: 'lightning-bolt', color: '#FF9500' },
        { label: t('completed_caps'), value: myJobs.filter(j => j.status === 'completed').length, icon: 'check-decagram', color: '#34C759' },
        { label: t('pro_rating'), value: profile?.rating || 'New', icon: 'star-face', color: '#FFD700' },
    ];

    if (isLoading) {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
                <DashboardSkeleton />
            </SafeAreaView>
        );
    }

    // Failsafe checks
    if (!isRegistered) return null; // Redirect handled by layout
    if (!isApproved) return <ApprovalStatus />;


    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
            <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
            {!isDark && (
                <>
                    <View style={styles.bgBlob1} />
                    <View style={styles.bgBlob2} />
                    <View style={styles.bgBlob3} />
                </>
            )}

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
            >
                {/* Header */}
                <Animated.View style={[styles.header, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
                    <View>
                        <Text style={[styles.greeting, { color: colors.text }]}>
                            {t('hi_there')}, {(profile?.fullName || profile?.name || user?.profile?.fullName || user?.profile?.name || 'Technician').split(' ')[0]}
                        </Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                            <Text style={[styles.subGreeting, { color: colors.subText }]}>{profile?.garageName || t('my_garage')}</Text>
                            <TouchableOpacity
                                onPress={toggleOnline}
                                style={[
                                    styles.statusToggle,
                                    isOnline ? styles.statusOnline : styles.statusOffline
                                ]}
                            >
                                <View style={[styles.statusDot, { backgroundColor: isOnline ? colors.success : colors.error }]} />
                                <Text style={[styles.statusText, { color: isOnline ? '#2E7D32' : '#C62828' }]}>
                                    {isOnline ? t('online_caps') : t('offline_caps')}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View style={[styles.headerRight, { gap: 10 }]}>
                        <TouchableOpacity
                            style={[styles.iconButton, { backgroundColor: colors.iconBg, borderColor: colors.border, borderWidth: isDark ? 1 : 0 }]}
                            onPress={() => router.push('/(technician)/notifications')}
                        >
                            {(availableJobs.length > 0 || hasUnread) && <View style={styles.notificationDot} />}
                            <Ionicons name="notifications-outline" size={22} color={colors.text} />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.iconButton, { backgroundColor: colors.iconBg, borderColor: colors.border, borderWidth: isDark ? 1 : 0 }]}
                            onPress={() => router.push('/(technician)/scan')}
                        >
                            <Ionicons name="qr-code-outline" size={22} color={colors.text} />
                        </TouchableOpacity>
                    </View>
                </Animated.View>

                {/* Wallet Card */}
                <Animated.View style={[styles.earningsCard, { backgroundColor: colors.walletCard, opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
                    <View style={styles.walletHeader}>
                        <Text style={styles.earningsLabel}>{t('total_operational_revenue')}</Text>
                        <TouchableOpacity
                            style={styles.withdrawBtn}
                            onPress={() => setIsWithdrawVisible(true)}
                        >
                            <Text style={styles.withdrawText}>{t('settle_funds')}</Text>
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.earningsValue}>{currencySymbol}{(profile?.totalEarnings || 0).toFixed(0)}</Text>
                    <View style={styles.earningsFooter}>
                        <MaterialCommunityIcons name="wallet-outline" size={16} color="#4CAF50" />
                        <Text style={styles.earningsTrend}>{t('available_to_settle') || 'Available'}: {currencySymbol}{(walletBalance || 0).toFixed(0)}</Text>
                    </View>
                </Animated.View>

                {/* Stats Grid */}
                <Animated.View style={[styles.statsGrid, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>

                    {/* Direct Requests - High Priority (Red) */}
                    <TouchableOpacity
                        style={[styles.statCard, { backgroundColor: '#FF3B30', shadowColor: '#FF3B30', shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 }]}
                        onPress={() => router.push({ pathname: '/(technician)/(tabs)/jobs', params: { tab: 'requests' } })}
                    >
                        <View style={[styles.statIconBg, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                            <MaterialCommunityIcons name="account-alert" size={24} color="#FFFFFF" />
                        </View>
                        <Text style={[styles.statValue, { color: '#FFFFFF' }]}>{pendingMyJobsCount}</Text>
                        <Text style={[styles.statLabel, { color: 'rgba(255,255,255,0.9)' }]}>{t('direct_requests')}</Text>
                    </TouchableOpacity>

                    {/* Broadcast Leads - Opportunity (Orange) */}
                    <TouchableOpacity
                        style={[styles.statCard, { backgroundColor: '#FF9500', shadowColor: '#FF9500', shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 }]}
                        onPress={() => router.push({ pathname: '/(technician)/(tabs)/jobs', params: { tab: 'broadcasts' } })}
                    >
                        <View style={[styles.statIconBg, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                            <MaterialCommunityIcons name="broadcast" size={24} color="#FFFFFF" />
                        </View>
                        <Text style={[styles.statValue, { color: '#FFFFFF' }]}>{availableJobs.length}</Text>
                        <Text style={[styles.statLabel, { color: 'rgba(255,255,255,0.9)' }]}>{t('nearby_leads')}</Text>
                    </TouchableOpacity>

                    {/* Active Jobs - Standard Card */}
                    <TouchableOpacity
                        style={[styles.statCard, { backgroundColor: isDark ? colors.card : '#FFF7ED', borderColor: isDark ? colors.border : 'transparent', borderWidth: isDark ? 1 : 0 }]}
                        onPress={() => router.push({ pathname: '/(technician)/(tabs)/jobs', params: { tab: 'active' } })}
                    >
                        {!isDark && <View style={[styles.innerBlob, { backgroundColor: '#FF6B0015' }]} />}
                        <View style={[styles.statIconBg, { backgroundColor: '#FF6B0015' }]}>
                            <MaterialCommunityIcons name="hammer-wrench" size={24} color="#FF6B00" />
                        </View>
                        <Text style={[styles.statValue, { color: isDark ? colors.text : '#FF6B00' }]}>{activeMyJobsCount}</Text>
                        <Text style={[styles.statLabel, { color: colors.subText }]}>{t('active_jobs')}</Text>
                    </TouchableOpacity>

                    {/* Completed Jobs */}
                    <TouchableOpacity
                        style={[styles.statCard, { backgroundColor: isDark ? colors.card : '#E8F5E9', borderColor: isDark ? colors.border : 'transparent', borderWidth: isDark ? 1 : 0 }]}
                        onPress={() => router.push('/(technician)/profile/history')}
                    >
                        {!isDark && <View style={[styles.innerBlob, { backgroundColor: '#34C75915' }]} />}
                        <View style={[styles.statIconBg, { backgroundColor: '#34C75915' }]}>
                            <MaterialCommunityIcons name="check-decagram" size={24} color="#34C759" />
                        </View>
                        <Text style={[styles.statValue, { color: isDark ? colors.text : '#34C759' }]}>{myJobs.filter(j => j.status === 'completed').length}</Text>
                        <Text style={[styles.statLabel, { color: colors.subText }]}>{t('completed_caps')}</Text>
                    </TouchableOpacity>

                    {/* Rating */}
                    <TouchableOpacity
                        style={[styles.statCard, { backgroundColor: isDark ? colors.card : '#FFF9C4', borderColor: isDark ? colors.border : 'transparent', borderWidth: isDark ? 1 : 0, width: '100%' }]}
                        onPress={() => router.push('/(technician)/profile/profile_info')}
                    >
                        {!isDark && <View style={[styles.innerBlob, { backgroundColor: '#FFD70015' }]} />}
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 15 }}>
                            <View style={[styles.statIconBg, { backgroundColor: '#FFD70015', marginBottom: 0 }]}>
                                <MaterialCommunityIcons name="star-face" size={24} color="#FFD700" />
                            </View>
                            <View>
                                <Text style={[styles.statValue, { color: isDark ? colors.text : '#D4AF37' }]}>{profile?.rating || 'New'}</Text>
                                <Text style={[styles.statLabel, { color: colors.subText, marginTop: 0 }]}>{t('pro_rating')}</Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                </Animated.View>

                {/* Quick Actions */}
                <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('quick_actions')}</Text>
                <Animated.View style={[styles.actionRow, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
                    <TouchableOpacity
                        style={[styles.actionBtn, { backgroundColor: '#FF9800' }]}
                        onPress={() => router.push('/(technician)/(tabs)/jobs')}
                    >
                        <Ionicons name="search" size={24} color="#fff" />
                        <Text style={styles.actionBtnText}>{t('find_new_jobs')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.actionBtn, { backgroundColor: '#FF6B00' }]}
                        onPress={() => router.push('/(technician)/parts/request')}
                    >
                        <MaterialCommunityIcons name="toolbox-outline" size={24} color="#fff" />
                        <Text style={styles.actionBtnText}>{t('order_parts')}</Text>
                    </TouchableOpacity>
                </Animated.View>

                {/* Recent Activity Mock -> Real Data */}
                <View style={styles.recentHeader}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('ongoing_jobs')}</Text>
                    <TouchableOpacity onPress={() => router.push('/(technician)/(tabs)/jobs')}>
                        <Text style={styles.seeAll}>{t('see_all')}</Text>
                    </TouchableOpacity>
                </View>

                {myJobs.filter(j => j.status !== 'completed' && j.status !== 'cancelled').length > 0 ? (
                    myJobs.filter(j => j.status !== 'completed' && j.status !== 'cancelled').slice(0, 3).map((job) => (
                        <TouchableOpacity
                            key={job.id}
                            style={[styles.activityCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                            onPress={() => router.push({ pathname: '/(technician)/job/[id]', params: { id: job.id } })}
                        >
                            <View style={[styles.activityIcon, { backgroundColor: isDark ? '#FF6B0020' : '#FFF7ED' }]}>
                                <VehicleIcon
                                    type={job.vehicle?.vehicleType}
                                    make={job.vehicle?.make}
                                    model={job.vehicle?.model}
                                    size={20}
                                    color="#FF6B00"
                                />
                            </View>
                            <View style={styles.activityInfo}>
                                <Text style={[styles.activityTitle, { color: colors.text }]}>
                                    {t(job.vehicleModel || 'Unknown Vehicle')}
                                </Text>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
                                    {job.vehicleNumber && <Text style={{ fontSize: 12, color: colors.subText }}>{job.vehicleNumber}</Text>}
                                    <StatusBadge status={job.status} size="small" showIcon={false} />
                                </View>
                            </View>
                            <Ionicons name="chevron-forward" size={18} color={colors.subText} />
                        </TouchableOpacity>
                    ))
                ) : (
                    <View style={[styles.emptyCard, { backgroundColor: isDark ? colors.card : '#F8F9FE' }]}>
                        <Text style={[styles.emptyText, { color: colors.subText }]}>{t('no_active_jobs')}</Text>
                    </View>
                )}

                <View style={{ height: 120 }} />
            </ScrollView>



            {/* Withdraw Modal */}
            {/* Withdraw Modal */}
            <WithdrawModal
                visible={isWithdrawVisible}
                onClose={() => setIsWithdrawVisible(false)}
                onWithdraw={requestWithdrawal}
                walletBalance={walletBalance}
                currencySymbol={currencySymbol}
            />
        </SafeAreaView >
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFFFFF', position: 'relative', overflow: 'hidden' },
    bgBlob1: { position: 'absolute', top: -100, right: -100, width: 300, height: 300, borderRadius: 150, backgroundColor: '#FF6B0010', zIndex: -1 },
    bgBlob2: { position: 'absolute', bottom: 100, left: -150, width: 400, height: 400, borderRadius: 200, backgroundColor: '#34C75908', zIndex: -1 },
    bgBlob3: { position: 'absolute', top: '40%', right: -150, width: 350, height: 350, borderRadius: 175, backgroundColor: '#FFD70008', zIndex: -1 },
    scrollContent: { paddingHorizontal: 20, paddingBottom: 100 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 20 },
    greeting: { fontSize: 26, fontWeight: 'bold', color: '#1A1A1A' },
    subGreeting: { fontSize: 13, color: '#8E8E93', fontWeight: '500' },
    iconBtn: { padding: 4 },
    iconButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        position: 'relative',
    },
    notificationDot: { position: 'absolute', top: 10, right: 10, width: 8, height: 8, borderRadius: 4, backgroundColor: '#FF3B30', borderWidth: 1.5, borderColor: '#FFF', zIndex: 10 },
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
    earningsLabel: { color: '#8E8E93', fontSize: 11, fontWeight: '800', letterSpacing: 1 },
    earningsValue: { color: '#FFFFFF', fontSize: 36, fontWeight: '900', marginVertical: 10 },
    earningsFooter: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    earningsTrend: { color: '#4CAF50', fontSize: 13, fontWeight: '600' },
    statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12, marginBottom: 30 },
    statCard: { width: '48%', padding: 16, borderRadius: 20, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
    innerBlob: { position: 'absolute', width: 80, height: 80, borderRadius: 40, top: -20, right: -20, zIndex: 0 },
    headerRight: { flexDirection: 'row', alignItems: 'center' },
    statusToggle: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20 },
    statusOnline: { backgroundColor: '#E8F5E9' },
    statusOffline: { backgroundColor: '#FFEBEE' },
    statusDot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
    statusText: { fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },
    walletHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    withdrawBtn: { backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
    withdrawText: { color: '#FFF', fontSize: 12, fontWeight: '700' },
    statIconBg: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
    statValue: { fontSize: 20, fontWeight: 'bold', color: '#1C1C1E' },
    statLabel: { fontSize: 12, color: '#8E8E93', marginTop: 4 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 15 },
    actionRow: { flexDirection: 'row', gap: 12, marginBottom: 30 },
    actionBtn: { flex: 1, height: 100, borderRadius: 18, justifyContent: 'center', alignItems: 'center', gap: 8 },
    actionBtnText: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
    recentHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
    seeAll: { fontSize: 14, color: '#FF6B00', fontWeight: '600' },
    activityCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderWidth: 1, borderColor: '#F0F0F0', padding: 15, borderRadius: 16, marginBottom: 10 },
    activityIcon: { width: 40, height: 40, borderRadius: 10, backgroundColor: '#E3F2FD', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
    activityInfo: { flex: 1 },
    activityTitle: { fontSize: 15, fontWeight: 'bold', color: '#1C1C1E' },
    activitySub: { fontSize: 12, color: '#8E8E93', marginTop: 2 },
    emptyCard: { padding: 30, backgroundColor: '#F8F9FE', borderRadius: 16, alignItems: 'center' },
    emptyText: { color: '#999', fontSize: 14 },

    // Modal Styles matching Supplier/Customer

    notifItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F2F2F7', gap: 12 },
    notifIcon: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    notifTitle: { fontSize: 14, fontWeight: 'bold', color: '#1A1A1A' },
    notifdesc: { fontSize: 12, color: '#8E8E93', marginTop: 2, maxWidth: 200 },
});
