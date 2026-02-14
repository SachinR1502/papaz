import { Colors } from '@/constants/theme';
import { useAdmin } from '@/context/AdminContext';
import { useAuth } from '@/context/AuthContext';
import { TechnicianJob, useTechnician } from '@/context/TechnicianContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { FlashList } from '@shopify/flash-list';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
    Dimensions,
    Platform,
    RefreshControl,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export default function TechnicianDashboard() {
    const { logout } = useAuth();
    const { availableJobs, myJobs, isLoading, refreshJobs, walletBalance, profile, isOnline, toggleOnline } = useTechnician();
    const { settings } = useAdmin();
    const router = useRouter();

    const currencySymbol = settings.currency === 'INR' ? '₹' : '$';
    const [activeTab, setActiveTab] = useState<'available' | 'ongoing'>('available');

    const colorScheme = useColorScheme();
    const theme = colorScheme ?? 'light';
    const colors = Colors[theme];
    const isDark = theme === 'dark';

    // Refresh jobs when screen comes into focus
    useFocusEffect(
        useCallback(() => {
            refreshJobs();
        }, [])
    );

    const onRefresh = async () => {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        refreshJobs();
    };

    const handleTabChange = (tab: 'available' | 'ongoing') => {
        Haptics.selectionAsync();
        setActiveTab(tab);
    };

    const handleToggleOnline = async () => {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        toggleOnline();
    };

    const renderJobCard = ({ item, index }: { item: TechnicianJob; index: number }) => {
        const isNew = item.status === 'pending';
        return (
            <Animated.View entering={FadeInDown.delay(index * 100).springify().damping(15)}>
                <TouchableOpacity
                    style={[
                        styles.jobCard,
                        {
                            backgroundColor: colors.card,
                            borderColor: isDark ? colors.border : '#F0F0F0',
                            shadowColor: colors.shadow
                        }
                    ]}
                    onPress={() => {
                        Haptics.selectionAsync();
                        router.push({ pathname: '/(technician)/job/[id]', params: { id: item.id } });
                    }}
                    activeOpacity={0.9}
                >
                    <View style={styles.cardHeader}>
                        <View style={styles.vehicleRow}>
                            <LinearGradient
                                colors={isNew ? ['#FF3B3020', '#FF3B3010'] : [colors.primary + '20', colors.primary + '10']}
                                style={styles.vehicleIcon}
                            >
                                <MaterialCommunityIcons
                                    name={(() => {
                                        const type = item.vehicle?.vehicleType?.toLowerCase() || '';
                                        if (type.includes('car')) return 'car-side';
                                        if (type.includes('bike')) return 'motorbike';
                                        if (type.includes('scooter')) return 'scooter';
                                        if (type.includes('truck')) return 'truck';
                                        if (type.includes('bus')) return 'bus';
                                        if (type.includes('tractor')) return 'tractor';
                                        if (type.includes('van')) return 'van-utility';
                                        if (type.includes('rickshaw')) return 'rickshaw';
                                        if (type.includes('excavator') || type.includes('earthmover')) return 'excavator';
                                        if (type.includes('ev') || type.includes('electric')) return 'vehicle-electric';

                                        const name = (item.vehicle?.make || '' + item.vehicle?.model || '').toLowerCase();
                                        if (name.includes('bike')) return 'motorbike';
                                        if (name.includes('scooter')) return 'scooter';
                                        return 'car-side';
                                    })() as any}
                                    size={22}
                                    color={isNew ? '#FF3B30' : colors.primary}
                                />
                            </LinearGradient>
                            <View>
                                <Text style={[styles.vehicleName, { color: colors.text }]}>{item.vehicleModel}</Text>
                                <Text style={[styles.customerName, { color: colors.icon }]}>{item.customerName}</Text>
                            </View>
                        </View>
                        <View style={{ alignItems: 'flex-end', gap: 4 }}>
                            {isNew && (
                                <View style={styles.newBadge}>
                                    <Text style={styles.newText}>NEW</Text>
                                </View>
                            )}
                            <Text style={[styles.timeAgo, { color: colors.icon }]}>2h ago</Text>
                        </View>
                    </View>

                    <View style={[styles.cardDivider, { backgroundColor: colors.border }]} />

                    <View style={styles.cardFooter}>
                        <View style={styles.metaItem}>
                            <View style={[styles.metaIcon, { backgroundColor: colors.background }]}>
                                <Ionicons name="location-outline" size={14} color={colors.icon} />
                            </View>
                            <Text style={[styles.metaText, { color: colors.icon }]} numberOfLines={1}>
                                {item.address || 'Location provided in details'}
                            </Text>
                        </View>
                        <View style={styles.metaItem}>
                            <View style={[styles.metaIcon, { backgroundColor: colors.background }]}>
                                <Ionicons name="time-outline" size={14} color={colors.icon} />
                            </View>
                            <Text style={[styles.metaText, { color: colors.icon }]}>
                                {isNew ? 'Urgent Request' : 'Scheduled'}
                            </Text>
                        </View>
                    </View>
                </TouchableOpacity>
            </Animated.View>
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

            {/* Background Gradient Blob */}
            <View style={StyleSheet.absoluteFill} pointerEvents="none">
                <LinearGradient
                    colors={[colors.primary + '10', 'transparent']}
                    style={{ width: '100%', height: 300 }}
                    start={{ x: 0.5, y: 0 }}
                    end={{ x: 0.5, y: 1 }}
                />
            </View>

            {/* Header Content with Safe Area */}
            <SafeAreaView edges={['top']} style={{ zIndex: 10 }}>
                <View style={styles.headerContent}>
                    <View>
                        <Text style={[styles.greeting, { color: colors.text }]}>Hello, {profile?.name || 'Partner'}</Text>
                        <TouchableOpacity onPress={handleToggleOnline} activeOpacity={0.8} style={styles.statusRow}>
                            <View style={[styles.statusDot, { backgroundColor: isOnline ? '#34C759' : colors.icon }]} />
                            <Text style={[styles.subGreeting, { color: colors.icon }]}>
                                {isOnline ? 'On Duty' : 'Offline'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity style={[styles.profileButton, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <Ionicons name="person" size={20} color={colors.text} />
                    </TouchableOpacity>
                </View>

                {/* Horizontal Stats Helper */}
                <View style={{ paddingHorizontal: 24, marginBottom: 20 }}>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ gap: 12 }}
                    >
                        {[
                            { label: 'Balance', value: `${currencySymbol}${(walletBalance || 0).toFixed(0)}`, icon: 'wallet-outline', color: colors.primary },
                            { label: 'Active', value: `${myJobs.length}`, icon: 'briefcase-outline', color: '#34C759' },
                            { label: 'Rating', value: '4.9', icon: 'star-outline', color: '#FF9500' }
                        ].map((stat, i) => (
                            <BlurView key={i} intensity={Platform.OS === 'ios' ? 20 : 0} tint={isDark ? 'dark' : 'default'} style={styles.statPill}>
                                <View style={[styles.statIcon, { backgroundColor: stat.color + '15' }]}>
                                    <Ionicons name={stat.icon as any} size={18} color={stat.color} />
                                </View>
                                <View>
                                    <Text style={[styles.statLabel, { color: colors.icon }]}>{stat.label}</Text>
                                    <Text style={[styles.statValue, { color: colors.text }]}>{stat.value}</Text>
                                </View>
                            </BlurView>
                        ))}
                    </ScrollView>
                </View>

                {/* Pill Segmented Control */}
                <View style={styles.pillContainer}>
                    <View style={[styles.pillWrapper, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <TouchableOpacity
                            style={[styles.pill, activeTab === 'available' && styles.activePill]}
                            onPress={() => handleTabChange('available')}
                        >
                            <Text style={[styles.pillText, activeTab === 'available' && styles.activePillText, { color: activeTab === 'available' ? '#FFF' : colors.icon }]}>
                                New Requests ({availableJobs.length})
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.pill, activeTab === 'ongoing' && styles.activePill]}
                            onPress={() => handleTabChange('ongoing')}
                        >
                            <Text style={[styles.pillText, activeTab === 'ongoing' && styles.activePillText, { color: activeTab === 'ongoing' ? '#FFF' : colors.icon }]}>
                                My Jobs ({myJobs.length})
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </SafeAreaView>

            {/* List with proper content offset for header */}
            <FlashList
                data={(activeTab === 'available' ? availableJobs : myJobs) as any[]}
                renderItem={renderJobCard as any}
                keyExtractor={(item: any) => item.id}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                estimatedItemSize={220}
                refreshControl={
                    <RefreshControl
                        refreshing={isLoading}
                        onRefresh={onRefresh}
                        tintColor={colors.primary}
                        colors={[colors.primary]}
                    />
                }
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <View style={[styles.emptyIcon, { backgroundColor: colors.border }]}>
                            <Ionicons
                                name={activeTab === 'available' ? "notifications-off" : "calendar-outline"}
                                size={40}
                                color={colors.icon}
                            />
                        </View>
                        <Text style={[styles.emptyTitle, { color: colors.text }]}>No Jobs Found</Text>
                        <Text style={[styles.emptySub, { color: colors.icon }]}>
                            {activeTab === 'available' ? 'Waiting for new requests...' : 'You have no active jobs.'}
                        </Text>
                    </View>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingTop: 10,
        paddingBottom: 20,
    },
    greeting: { fontSize: 24, fontFamily: 'NotoSans-Black', letterSpacing: -0.5 },
    statusRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
    statusDot: { width: 8, height: 8, borderRadius: 4 },
    subGreeting: { fontSize: 13, fontFamily: 'NotoSans-Medium' },
    profileButton: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },

    statPill: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        paddingRight: 16,
        borderRadius: 30,
        gap: 10,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    statIcon: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
    statLabel: { fontSize: 10, fontFamily: 'NotoSans-Bold', textTransform: 'uppercase' },
    statValue: { fontSize: 15, fontFamily: 'NotoSans-Black', marginTop: 1 },

    pillContainer: { paddingHorizontal: 24, paddingBottom: 10 },
    pillWrapper: { flexDirection: 'row', padding: 4, borderRadius: 30, borderWidth: 1 },
    pill: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 24 },
    activePill: { backgroundColor: '#FF6B00' },
    pillText: { fontSize: 13, fontFamily: 'NotoSans-Bold' },
    activePillText: { color: '#FFF' },

    listContent: { padding: 24, paddingBottom: 100, paddingTop: 10 },

    jobCard: {
        borderRadius: 24,
        padding: 20,
        marginBottom: 16,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
        elevation: 3,
        borderWidth: 1,
    },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    vehicleRow: { flexDirection: 'row', gap: 12, flex: 1 },
    vehicleIcon: { width: 48, height: 48, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
    vehicleName: { fontSize: 16, fontFamily: 'NotoSans-Bold', flexShrink: 1 },
    customerName: { fontSize: 12, marginTop: 2, fontFamily: 'NotoSans-Medium' },

    newBadge: { backgroundColor: '#FF3B30', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, marginBottom: 4 },
    newText: { color: '#FFF', fontSize: 10, fontFamily: 'NotoSans-Bold' },
    timeAgo: { fontSize: 11, fontFamily: 'NotoSans-Regular' },

    cardDivider: { height: 1, marginVertical: 16, opacity: 0.5 },
    cardFooter: { flexDirection: 'row', alignItems: 'center', gap: 15 },
    metaItem: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
    metaIcon: { width: 28, height: 28, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
    metaText: { fontSize: 12, fontFamily: 'NotoSans-Medium', flex: 1 },

    emptyState: { alignItems: 'center', paddingTop: 60 },
    emptyIcon: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
    emptyTitle: { fontSize: 18, fontFamily: 'NotoSans-Bold', marginBottom: 8 },
    emptySub: { fontSize: 14 }
});
