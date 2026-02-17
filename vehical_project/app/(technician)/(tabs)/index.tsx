import { LinearGradient } from 'expo-linear-gradient';
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

                {/* Wallet Card - Premium Gradient */}
                <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
                    <LinearGradient
                        colors={isDark ? ['#1A1A1A', '#2C2C2E'] : ['#1A1A1A', '#000000']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.earningsCard}
                    >
                        {/* Background Decoration */}
                        <View style={{ position: 'absolute', top: -50, right: -50, width: 200, height: 200, borderRadius: 100, backgroundColor: 'rgba(255,255,255,0.05)' }} />

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
                            <MaterialCommunityIcons name="wallet-outline" size={14} color="#4CAF50" />
                            <Text style={styles.earningsTrend}>{t('available_to_settle') || 'Available'}: {currencySymbol}{(walletBalance || 0).toFixed(0)}</Text>
                        </View>
                    </LinearGradient>
                </Animated.View>

                {/* Stats Grid - Premium Layout */}
                <Animated.View style={[styles.statsGrid, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>

                    {/* Direct Requests - High Priority (Red) */}
                    <TouchableOpacity
                        style={[styles.statCard, { backgroundColor: '#FFF5F5', borderColor: '#FFE5E5' }]}
                        onPress={() => router.push({ pathname: '/(technician)/(tabs)/jobs', params: { tab: 'requests' } })}
                    >
                        <View style={[styles.statIconBg, { backgroundColor: '#FF3B30' }]}>
                            <MaterialCommunityIcons name="account-alert" size={24} color="#FFFFFF" />
                        </View>
                        <Text style={styles.statValue}>{pendingMyJobsCount}</Text>
                        <Text style={styles.statLabel}>{t('direct_requests')}</Text>
                    </TouchableOpacity>

                    {/* Broadcast Leads - Opportunity (Orange) */}
                    <TouchableOpacity
                        style={[styles.statCard, { backgroundColor: '#FFF8F0', borderColor: '#FFECCE' }]}
                        onPress={() => router.push({ pathname: '/(technician)/(tabs)/jobs', params: { tab: 'broadcasts' } })}
                    >
                        <View style={[styles.statIconBg, { backgroundColor: '#FF9500' }]}>
                            <MaterialCommunityIcons name="broadcast" size={24} color="#FFFFFF" />
                        </View>
                        <Text style={styles.statValue}>{availableJobs.length}</Text>
                        <Text style={styles.statLabel}>{t('nearby_leads')}</Text>
                    </TouchableOpacity>

                    {/* Active Jobs - Standard Card */}
                    <TouchableOpacity
                        style={[styles.statCard, { backgroundColor: isDark ? colors.card : '#FFFFFF' }]}
                        onPress={() => router.push({ pathname: '/(technician)/(tabs)/jobs', params: { tab: 'active' } })}
                    >
                        <View style={[styles.statIconBg, { backgroundColor: '#F2F2F7' }]}>
                            <MaterialCommunityIcons name="hammer-wrench" size={24} color="#FF6B00" />
                        </View>
                        <Text style={[styles.statValue, { color: isDark ? colors.text : '#1C1C1E' }]}>{activeMyJobsCount}</Text>
                        <Text style={styles.statLabel}>{t('active_jobs')}</Text>
                    </TouchableOpacity>

                    {/* Completed Jobs */}
                    <TouchableOpacity
                        style={[styles.statCard, { backgroundColor: isDark ? colors.card : '#FFFFFF' }]}
                        onPress={() => router.push('/(technician)/profile/history')}
                    >
                        <View style={[styles.statIconBg, { backgroundColor: '#F2F2F7' }]}>
                            <MaterialCommunityIcons name="check-decagram" size={24} color="#34C759" />
                        </View>
                        <Text style={[styles.statValue, { color: isDark ? colors.text : '#1C1C1E' }]}>{myJobs.filter(j => j.status === 'completed').length}</Text>
                        <Text style={styles.statLabel}>{t('completed_caps')}</Text>
                    </TouchableOpacity>

                    {/* Rating - Full Width */}
                    <TouchableOpacity
                        style={[styles.statCard, styles.fullWidthCard, { backgroundColor: '#FFFDE7', borderColor: '#FFF9C4', flexDirection: 'row', alignItems: 'center' }]}
                        onPress={() => router.push('/(technician)/profile/profile_info')}
                    >
                        <View style={[styles.statIconBg, { backgroundColor: '#FFD700', marginRight: 16, marginBottom: 0 }]}>
                            <MaterialCommunityIcons name="star" size={24} color="#FFF" />
                        </View>
                        <View>
                            <Text style={[styles.statValue, { color: '#D4AF37' }]}>{profile?.rating || 'New'}</Text>
                            <Text style={[styles.statLabel, { marginTop: 0 }]}>{t('pro_rating')}</Text>
                        </View>
                        <View style={{ position: 'absolute', right: 20 }}>
                            <MaterialCommunityIcons name="chevron-right" size={24} color="#D4AF37" style={{ opacity: 0.5 }} />
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
    bgBlob1: { position: 'absolute', top: -100, right: -100, width: 300, height: 300, borderRadius: 150, backgroundColor: '#FF6B0008', zIndex: -1 },
    bgBlob2: { position: 'absolute', bottom: 100, left: -150, width: 400, height: 400, borderRadius: 200, backgroundColor: '#34C75905', zIndex: -1 },
    bgBlob3: { position: 'absolute', top: '40%', right: -150, width: 350, height: 350, borderRadius: 175, backgroundColor: '#FFD70005', zIndex: -1 },
    scrollContent: { paddingHorizontal: 20, paddingBottom: 110, paddingTop: 10 },

    // Header
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
    greeting: { fontSize: 28, fontFamily: 'NotoSans-Bold', color: '#1A1A1A', letterSpacing: -0.5 },
    subGreeting: { fontSize: 13, color: '#8E8E93', fontFamily: 'NotoSans-Medium', marginTop: -4 },
    headerRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },

    iconButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 4,
        position: 'relative',
    },
    notificationDot: {
        position: 'absolute',
        top: 10,
        right: 12,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#FF3B30',
        borderWidth: 1.5,
        borderColor: '#FFF',
        zIndex: 10
    },

    // Status Toggle
    statusToggle: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
        marginTop: 4
    },
    statusOnline: { backgroundColor: '#E8F5E9', borderColor: '#C8E6C9' },
    statusOffline: { backgroundColor: '#FFEBEE', borderColor: '#FFCDD2' },
    statusDot: { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
    statusText: { fontSize: 11, fontFamily: 'NotoSans-Bold', textTransform: 'uppercase', letterSpacing: 0.5 },

    // Wallet Card
    earningsCard: {
        borderRadius: 24,
        padding: 24,
        marginBottom: 30,
        shadowColor: '#FF6B00',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 20,
        elevation: 8,
        position: 'relative',
        overflow: 'hidden'
    },
    walletHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    earningsLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 11, fontFamily: 'NotoSans-Bold', letterSpacing: 1, textTransform: 'uppercase' },
    withdrawBtn: {
        backgroundColor: 'rgba(255,255,255,0.15)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)'
    },
    withdrawText: { color: '#FFF', fontSize: 11, fontFamily: 'NotoSans-Bold' },
    earningsValue: { color: '#FFFFFF', fontSize: 38, fontFamily: 'NotoSans-Black', marginBottom: 16, letterSpacing: -1 },
    earningsFooter: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.1)', alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12 },
    earningsTrend: { color: '#4CAF50', fontSize: 12, fontFamily: 'NotoSans-Bold', marginLeft: 4 },

    // Stats Grid
    statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12, marginBottom: 30 },
    statCard: {
        width: '48%',
        padding: 18,
        borderRadius: 24,
        alignItems: 'flex-start',
        justifyContent: 'center',
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.03)'
    },
    fullWidthCard: { width: '100%', flexDirection: 'row', alignItems: 'center', paddingVertical: 14 },
    innerBlob: { position: 'absolute', width: 100, height: 100, borderRadius: 50, top: -30, right: -30, zIndex: 0, opacity: 0.6 },
    statIconBg: {
        width: 44,
        height: 44,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 8
    },
    statValue: { fontSize: 24, fontFamily: 'NotoSans-Bold', color: '#1C1C1E', letterSpacing: -0.5 },
    statLabel: { fontSize: 12, fontFamily: 'NotoSans-Medium', color: '#8E8E93', marginTop: 2 },

    // Section Headers
    sectionTitle: { fontSize: 18, fontFamily: 'NotoSans-Bold', color: '#1A1A1A', marginBottom: 16, letterSpacing: -0.5 },

    // Quick Actions
    actionRow: { flexDirection: 'row', gap: 12, marginBottom: 30 },
    actionBtn: {
        flex: 1,
        height: 110,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
        elevation: 6
    },
    actionBtnText: { color: '#fff', fontSize: 14, fontFamily: 'NotoSans-Bold' },

    // Recent Activity
    recentHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    seeAll: { fontSize: 13, color: '#FF6B00', fontFamily: 'NotoSans-Bold' },
    activityCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        padding: 16,
        borderRadius: 20,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.03)'
    },
    activityIcon: { width: 48, height: 48, borderRadius: 16, backgroundColor: '#FFF7ED', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
    activityInfo: { flex: 1 },
    activityTitle: { fontSize: 15, fontFamily: 'NotoSans-Bold', color: '#1C1C1E', marginBottom: 4 },
    activitySub: { fontSize: 12, color: '#8E8E93', fontFamily: 'NotoSans-Medium' },

    emptyCard: { padding: 40, backgroundColor: '#F8F9FE', borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
    emptyText: { color: '#8E8E93', fontSize: 14, fontFamily: 'NotoSans-Medium' },

    // Modal Styles
    notifItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F2F2F7', gap: 12 },
    notifIcon: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    notifTitle: { fontSize: 14, fontWeight: 'bold', color: '#1A1A1A' },
    notifdesc: { fontSize: 12, color: '#8E8E93', marginTop: 2, maxWidth: 200 },
});
