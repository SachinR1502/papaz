import { Colors } from '@/constants/theme';

import { useAuth } from '@/context/AuthContext';
import { useCustomer } from '@/context/CustomerContext';
import { useLanguage } from '@/context/LanguageContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getMediaUrl } from '@/utils/mediaHelpers';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    Alert,
    Animated,
    Image,
    Linking,
    RefreshControl,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProfileScreen() {
    const { user, logout } = useAuth();
    const { vehicles, activeJobs, refresh, profile } = useCustomer();
    const { t, language } = useLanguage();
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
    const blob2Anim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(blob1Anim, { toValue: 1, duration: 6000, useNativeDriver: true }),
                Animated.timing(blob1Anim, { toValue: 0, duration: 6000, useNativeDriver: true }),
            ])
        ).start();

        Animated.loop(
            Animated.sequence([
                Animated.timing(blob2Anim, { toValue: 1, duration: 8000, useNativeDriver: true }),
                Animated.timing(blob2Anim, { toValue: 0, duration: 8000, useNativeDriver: true }),
            ])
        ).start();
    }, []);

    const sections = [
        {
            title: t('account_settings'),
            items: [
                { id: 'info', icon: 'person-outline', label: t('personal_info'), color: colors.customers, sub: t('personal_info_sub'), path: '/(customer)/profile/info' },
                { id: 'payments', icon: 'wallet-outline', label: t('payment_methods'), color: colors.sales, sub: t('payment_methods_sub'), path: '/(customer)/profile/payments' },
                { id: 'addresses', icon: 'location-outline', label: t('saved_addresses'), color: colors.primary, sub: t('saved_addresses_sub'), path: '/(customer)/profile/addresses' },
                {
                    id: 'language', icon: 'globe-outline', label: t('language'), color: colors.secondary, sub: {
                        'en': 'English',
                        'hi': 'Hindi',
                        'mr': 'Marathi',
                        'kn': 'Kannada',
                        'ta': 'Tamil',
                        'te': 'Telugu',
                        'ml': 'Malayalam',
                        'gu': 'Gujarati',
                        'bn': 'Bengali',
                        'pa': 'Punjabi'
                    }[language] || 'English', path: '/(customer)/profile/language'
                },
            ]
        },
        {
            title: t('my_shopping'),
            items: [
                { id: 'orders', icon: 'receipt-outline', label: t('my_orders'), color: colors.text, sub: t('my_orders_sub'), path: '/(customer)/profile/orders' },
                { id: 'wishlist', icon: 'heart-outline', label: t('wishlist'), color: colors.notification, sub: t('wishlist_sub'), path: '/(customer)/profile/wishlist' },
            ]
        },
        {
            title: t('support_privacy'),
            items: [
                { id: 'notifications', icon: 'notifications-outline', label: t('notifications'), color: colors.revenue, sub: t('notifications_sub'), path: '/(customer)/profile/notifications' },
                { id: 'security', icon: 'shield-checkmark-outline', label: t('security'), color: colors.notification, sub: t('security_sub'), path: '/(customer)/profile/security' },
                { id: 'help', icon: 'help-circle-outline', label: t('help_center'), color: colors.customers, sub: t('help_center_sub'), path: '/(customer)/profile/help' },
            ]
        }
    ];

    const quickActions = [
        { label: t('add_vehicle_btn') || t('register_vehicle_title'), icon: 'car-sport-outline', color: colors.customers, path: '/(customer)/(tabs)/vehicles' },
        { label: t('book_now'), icon: 'calendar-outline', color: colors.sales, path: '/(customer)/booking/create' }, // Adjusted path to index if 'book_now' implies finding a service
        { label: t('help_center'), icon: 'headset-outline', color: colors.primary, path: '/(customer)/profile/help' },
        { label: t('account_settings'), icon: 'settings-outline', color: colors.icon, path: '/(customer)/profile/security' },
    ];

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

            {/* Background Blobs */}
            <View style={StyleSheet.absoluteFill} pointerEvents="none">
                <Animated.View style={[
                    styles.blob,
                    {
                        backgroundColor: colors.primary,
                        top: -100,
                        left: -100,
                        opacity: 0.05,
                        transform: [
                            { scale: blob1Anim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.2] }) },
                            { translateX: blob1Anim.interpolate({ inputRange: [0, 1], outputRange: [0, 50] }) }
                        ]
                    }
                ]} />
                <Animated.View style={[
                    styles.blob,
                    {
                        backgroundColor: colors.secondary,
                        bottom: -100,
                        right: -100,
                        opacity: 0.05,
                        transform: [
                            { scale: blob2Anim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.3] }) },
                        ]
                    }
                ]} />
            </View>

            <SafeAreaView edges={['top']} style={{ flex: 1 }}>
                <View style={[styles.header, { backgroundColor: colors.card }]}>
                    <Text style={[styles.headerTitle, { color: colors.text }]}>{t('tab_profile')}</Text>
                    <TouchableOpacity
                        style={[styles.editBtn, { backgroundColor: isDark ? colors.customers + '20' : colors.customers + '10' }]}
                        onPress={() => {
                            Haptics.selectionAsync();
                            router.push('/(customer)/profile/info');
                        }}
                    >
                        <Text style={[styles.editBtnText, { color: colors.customers }]}>{t('edit') || 'Edit'}</Text>
                    </TouchableOpacity>
                </View>

                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
                    }
                >
                    {/* User Card - Premium Style */}
                    <View style={[styles.userSection, { backgroundColor: colors.card, shadowColor: colors.text, borderColor: colors.border, borderWidth: isDark ? 1 : 0 }]}>
                        <View style={styles.avatarWrapper}>
                            <Image
                                source={{ uri: getMediaUrl(user?.avatar) || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop' }}
                                style={[styles.avatar, { backgroundColor: colors.border }]}
                            />
                            <View style={[styles.badgeContainer, { borderColor: colors.card }]}>
                                <MaterialCommunityIcons name="shield-check" size={14} color="#FFF" />
                                <Text style={styles.badgeText}>{t('pro_badge')}</Text>
                            </View>
                            <TouchableOpacity
                                style={[styles.cameraBtn, { backgroundColor: colors.text, borderColor: colors.card }]}
                                onPress={() => {
                                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                                    Alert.alert("Upload", "Choose a profile picture");
                                }}
                                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                            >
                                <Ionicons name="camera" size={16} color={colors.background} />
                            </TouchableOpacity>
                        </View>
                        <Text style={[styles.userName, { color: colors.text }]}>{user?.profile?.fullName || user?.name || t('guest_user')}</Text>
                        <View style={[styles.membershipBadge, { backgroundColor: isDark ? colors.primary + '20' : colors.primary + '10' }]}>
                            <Ionicons name="star" size={14} color={colors.primary} />
                            <Text style={[styles.membershipText, { color: colors.primary }]}>{profile?.membershipTier || t('member')}</Text>
                        </View>
                        <Text style={[styles.userEmail, { color: colors.icon }]}>{user?.phoneNumber || ''}</Text>

                        <View style={styles.statsRow}>
                            <View style={styles.statBox}>
                                <Text style={[styles.statVal, { color: colors.text }]}>{activeJobs.length}</Text>
                                <Text style={[styles.statLabel, { color: colors.icon }]}>{t('active_jobs')}</Text>
                            </View>
                            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
                            <View style={styles.statBox}>
                                <Text style={[styles.statVal, { color: colors.text }]}>{vehicles.length}</Text>
                                <Text style={[styles.statLabel, { color: colors.icon }]}>{t('tab_vehicles')}</Text>
                            </View>
                            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
                            <View style={styles.statBox}>
                                <Text style={[styles.statVal, { color: colors.text }]}>{profile?.rating ? Number(profile.rating).toFixed(1) : '-'}</Text>
                                <Text style={[styles.statLabel, { color: colors.icon }]}>{t('rating') || 'Rating'}</Text>
                            </View>
                        </View>
                    </View>

                    {/* Quick Actions */}
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: colors.icon }]}>{t('quick_actions')}</Text>
                        <View style={styles.quickActionsGrid}>
                            {quickActions.map((action, idx) => (
                                <TouchableOpacity
                                    key={idx}
                                    style={[styles.quickActionCard, { backgroundColor: colors.card, shadowColor: colors.text }]}
                                    onPress={() => {
                                        Haptics.selectionAsync();
                                        router.push(action.path as any);
                                    }}
                                >
                                    <View style={[styles.actionIconBg, { backgroundColor: action.color + '15' }]}>
                                        <Ionicons name={action.icon as any} size={24} color={action.color} />
                                    </View>
                                    <Text style={[styles.actionLabel, { color: colors.text }]}>{action.label}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Settings Sections */}
                    {sections.map((section, sIdx) => (
                        <View key={sIdx} style={styles.section}>
                            <Text style={[styles.sectionTitle, { color: colors.icon }]}>{section.title}</Text>
                            <View style={[styles.menuContainer, { backgroundColor: colors.card }]}>
                                {section.items.map((item, iIdx) => (
                                    <TouchableOpacity
                                        key={iIdx}
                                        style={[styles.menuItem, { borderBottomColor: colors.border }, iIdx === section.items.length - 1 && styles.noBorder]}
                                        onPress={() => {
                                            Haptics.selectionAsync();
                                            router.push(item.path as any);
                                        }}
                                    >
                                        <View style={[styles.iconBg, { backgroundColor: item.color + '10' }]}>
                                            <Ionicons name={item.icon as any} size={22} color={item.color} />
                                        </View>
                                        <View style={styles.menuInfo}>
                                            <Text style={[styles.menuLabel, { color: colors.text }]}>{item.label}</Text>
                                            <Text style={[styles.menuSub, { color: colors.icon }]}>{item.sub}</Text>
                                        </View>
                                        <Ionicons name="chevron-forward" size={18} color={colors.border} />
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    ))}

                    {/* Account Actions */}
                    <TouchableOpacity
                        style={[styles.logoutBtn, { backgroundColor: isDark ? colors.notification + '20' : colors.notification + '10' }]}
                        onPress={() => {
                            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
                            Alert.alert(
                                t('logout'),
                                t('logout_confirm'),
                                [
                                    { text: t('cancel'), style: "cancel" },
                                    { text: t('logout'), style: "destructive", onPress: logout }
                                ]
                            );
                        }}
                    >
                        <Ionicons name="log-out-outline" size={20} color={colors.notification} />
                        <Text style={styles.logoutText}>{t('logout')}</Text>
                    </TouchableOpacity>

                    <View style={styles.footer}>
                        <Text style={[styles.versionText, { color: colors.icon }]}>PAPAZ Version 1.2.4</Text>
                        <TouchableOpacity onPress={() => Linking.openURL('https://www.agrozonetechnology.com/')}>
                            <Text style={[styles.versionText, { color: isDark ? '#FFFFFF' : '#000000', marginTop: 4 }]}>
                                Developed by <Text style={{ color: '#FFC107', fontWeight: 'bold' }}>Agro</Text>zone Technology Pvt. Ltd.
                            </Text>
                        </TouchableOpacity>
                        <View style={styles.socials}>
                            <MaterialCommunityIcons name="facebook" size={24} color={colors.icon} />
                            <MaterialCommunityIcons name="twitter" size={24} color={colors.icon} />
                            <MaterialCommunityIcons name="instagram" size={24} color={colors.icon} />
                        </View>
                    </View>

                    <View style={{ height: 120 }} />
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, position: 'relative', overflow: 'hidden' },
    blob: { position: 'absolute', width: 350, height: 350, borderRadius: 175 },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingVertical: 20,
    },
    headerTitle: { fontSize: 24, fontFamily: 'NotoSans-Bold' },
    editBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10 },
    editBtnText: { fontFamily: 'NotoSans-Bold', fontSize: 13 },

    scrollContent: { paddingBottom: 20 },

    userSection: {
        alignItems: 'center',
        paddingVertical: 30,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.05,
        shadowRadius: 15,
        elevation: 5,
        marginBottom: 25
    },
    avatarWrapper: { position: 'relative', marginBottom: 15 },
    avatar: { width: 100, height: 100, borderRadius: 50 },
    cameraBtn: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 34,
        height: 34,
        borderRadius: 17,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        zIndex: 5
    },
    userName: { fontSize: 22, fontFamily: 'NotoSans-Bold' },
    userEmail: { fontSize: 14, fontFamily: 'NotoSans-Regular', marginTop: 4 },

    statsRow: { flexDirection: 'row', alignItems: 'center', marginTop: 25, width: '100%', paddingHorizontal: 40 },
    statBox: { flex: 1, alignItems: 'center' },
    statVal: { fontSize: 18, fontFamily: 'NotoSans-Black' },
    statLabel: { fontSize: 12, fontFamily: 'NotoSans-Regular', marginTop: 2 },
    statDivider: { width: 1, height: 30 },

    membershipBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20, marginTop: 8, gap: 5 },
    membershipText: { fontSize: 12, fontFamily: 'NotoSans-Bold' },
    badgeContainer: { position: 'absolute', top: -10, left: -10, backgroundColor: '#34C759', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10, flexDirection: 'row', alignItems: 'center', gap: 4, borderWidth: 3 },
    badgeText: { color: '#FFF', fontSize: 10, fontFamily: 'NotoSans-Black' },

    quickActionsGrid: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
    quickActionCard: { flex: 1, borderRadius: 24, padding: 15, alignItems: 'center', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.02, shadowRadius: 10, elevation: 1 },
    actionIconBg: { width: 48, height: 48, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
    actionLabel: { fontSize: 11, fontFamily: 'NotoSans-Bold', textAlign: 'center' },

    section: { paddingHorizontal: 24, marginBottom: 25 },
    sectionTitle: { fontSize: 13, fontFamily: 'NotoSans-Bold', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 15 },
    menuContainer: { borderRadius: 24, padding: 8, overflow: 'hidden' },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderBottomWidth: 1,
    },
    noBorder: { borderBottomWidth: 0 },
    iconBg: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
    menuInfo: { flex: 1 },
    menuLabel: { fontSize: 15, fontFamily: 'NotoSans-Bold' },
    menuSub: { fontSize: 12, fontFamily: 'NotoSans-Regular', marginTop: 2 },

    logoutBtn: {
        marginHorizontal: 24,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        padding: 18,
        borderRadius: 20,
        marginTop: 10
    },
    logoutText: { fontFamily: 'NotoSans-Bold', fontSize: 16, color: '#FF3B30' },

    footer: { alignItems: 'center', marginTop: 40, paddingBottom: 20 },
    versionText: { fontSize: 12, fontFamily: 'NotoSans-Regular' },
    socials: { flexDirection: 'row', gap: 20, marginTop: 15 }
});
