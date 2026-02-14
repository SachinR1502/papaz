import { Colors } from '@/constants/theme';

import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { useTechnician } from '@/context/TechnicianContext';
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
    Switch,
    Text,
    TouchableOpacity,
    View,
    useColorScheme
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TechnicianProfile() {
    const router = useRouter();
    const { logout, user, currencySymbol } = useAuth();
    const { profile, isOnline, toggleOnline, myJobs, refresh } = useTechnician();
    const { t, language } = useLanguage();
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
    const theme = colorScheme || 'light';
    const isDark = theme === 'dark';
    const colors = Colors[theme];

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

    const getLanguageLabel = (lang: string) => {
        switch (lang) {
            case 'en': return 'English';
            case 'hi': return 'Hindi';
            case 'mr': return 'Marathi';
            case 'kn': return 'Kannada';
            case 'ta': return 'Tamil';
            case 'te': return 'Telugu';
            case 'ml': return 'Malayalam';
            case 'gu': return 'Gujarati';
            case 'bn': return 'Bengali';
            case 'pa': return 'Punjabi';
            default: return 'English';
        }
    };

    const completedJobs = myJobs ? myJobs.filter(j => j.status === 'completed').length : 0;
    const activeJobsCount = myJobs ? myJobs.filter(j => j.status !== 'completed').length : 0;

    const sections = [
        {
            title: t('Business Configuration'),
            items: [
                { id: 'personal', icon: 'person-outline', label: t('Garage Profile'), color: colors.customers, sub: t('Identity & Availability'), path: '/(technician)/profile/profile_info' },
                { id: 'inventory', icon: 'cube-outline', label: t('Garage Inventory'), color: colors.sales, sub: t('Stock & Parts Management'), path: '/(technician)/profile/inventory' },
                { id: 'store', icon: 'cart-outline', label: t('Parts Sourcing'), color: colors.primary, sub: t('Wholesale B2B Marketplace'), path: '/(technician)/(tabs)/store' },
                { id: 'orders', icon: 'receipt-outline', label: t('My Wholesale Orders'), color: colors.secondary, sub: t('Track procurement history'), path: '/(technician)/profile/orders' },
                { id: 'docs', icon: 'document-text-outline', label: t('Certifications'), color: colors.customers, sub: t('Verification & Credentials'), path: '/(technician)/profile/docs' },
            ]
        },
        {
            title: t('Financial Hub'),
            items: [
                { id: 'payout', icon: 'wallet-outline', label: t('Revenue Settlements'), color: colors.revenue, sub: t('Manage payouts & bank'), path: '/(technician)/profile/payouts' },
            ]
        },
        {
            title: t('Account & Security'),
            items: [
                { id: 'notifications', icon: 'notifications-outline', label: t('App Notifications'), color: colors.notification, sub: t('Job alerts & updates'), path: '/(technician)/profile/notifications' },
                { id: 'security', icon: 'shield-checkmark-outline', label: t('Platform Security'), color: colors.revenue, sub: t('Password & Biometrics'), path: '/(technician)/profile/security' },
                { id: 'preferences', icon: 'settings-outline', label: t('App Preferences'), color: colors.icon, sub: `${t('language')}: ${getLanguageLabel(language)}`, path: '/(technician)/profile/settings' },
            ]
        },
        {
            title: t('Resource Archives'),
            items: [
                { id: 'history', icon: 'time-outline', label: t('Service Records'), color: colors.primary, sub: t('Full history of all jobs'), path: '/(technician)/profile/history' },
                { id: 'support', icon: 'help-circle-outline', label: t('Garage Support'), color: colors.customers, sub: t('Incident assistance'), path: '/(technician)/profile/support' },
                { id: 'legal', icon: 'document-text-outline', label: t('Legal & Privacy'), color: colors.sales, sub: t('Terms of Service'), path: '/(technician)/profile/legal' },
            ]
        }
    ];

    const quickActions = [
        { label: t('My Jobs'), icon: 'briefcase-outline', color: colors.customers, path: '/(technician)/(tabs)/jobs' },
        { label: t('Store'), icon: 'cart-outline', color: colors.sales, path: '/(technician)/(tabs)/store' },
        { label: t('Support'), icon: 'headset-outline', color: colors.primary, path: '/(technician)/profile/support' },
        { label: t('Settings'), icon: 'settings-outline', color: colors.icon, path: '/(technician)/profile/settings' },
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
                    <Text style={[styles.headerTitle, { color: colors.text }]}>{t('Garage Controls')}</Text>
                    <TouchableOpacity
                        style={[styles.editBtn, { backgroundColor: isDark ? colors.customers + '20' : colors.customers + '10' }]}
                        onPress={() => {
                            Haptics.selectionAsync();
                            router.push('/(technician)/profile/profile_info');
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
                                source={{ uri: getMediaUrl(profile?.avatar) || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop' }}
                                style={[styles.avatar, { backgroundColor: colors.border }]}
                            />
                            <View style={[styles.badgeContainer, { borderColor: colors.card }]}>
                                <MaterialCommunityIcons name="check-decagram" size={14} color="#FFF" />
                                <Text style={styles.badgeText}>PRO</Text>
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
                        <Text style={[styles.userName, { color: colors.text }]}>{profile?.name || user?.fullName || t('Technician')}</Text>
                        <View style={[styles.membershipBadge, { backgroundColor: isDark ? colors.primary + '20' : colors.primary + '10' }]}>
                            <Ionicons name="build" size={14} color={colors.primary} />
                            <Text style={[styles.membershipText, { color: colors.primary }]}>{t('Master Technician')}</Text>
                        </View>
                        <Text style={[styles.userEmail, { color: colors.icon }]}>{profile?.garageName || 'Premium Motors'}</Text>

                        {/* Online Toggle within Card */}
                        <View style={[styles.statusToggleBar, { backgroundColor: isDark ? colors.background : '#F8F9FE', marginTop: 20 }]}>
                            <Text style={[styles.toggleLabel, { color: isOnline ? '#34C759' : colors.icon }]}>
                                {isOnline ? t('Active for Missions') : t('Offline Mode')}
                            </Text>
                            <Switch
                                value={isOnline}
                                onValueChange={toggleOnline}
                                trackColor={{ false: isDark ? '#3A3A3C' : '#E5E5EA', true: '#34C759' }}
                                thumbColor="#FFF"
                                style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
                            />
                        </View>

                        <View style={styles.statsRow}>
                            <View style={styles.statBox}>
                                <Text style={[styles.statVal, { color: colors.text }]}>{profile?.stats?.csrScore || '100%'}</Text>
                                <Text style={[styles.statLabel, { color: colors.icon }]}>{t('CSR SCORE')}</Text>
                            </View>
                            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
                            <View style={styles.statBox}>
                                <Text style={[styles.statVal, { color: colors.text }]}>{activeJobsCount}</Text>
                                <Text style={[styles.statLabel, { color: colors.icon }]}>{t('active_jobs')}</Text>
                            </View>
                            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
                            <View style={styles.statBox}>
                                <Text style={[styles.statVal, { color: colors.text }]}>{completedJobs}</Text>
                                <Text style={[styles.statLabel, { color: colors.icon }]}>{t('TASKS DONE')}</Text>
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
                                            if (item.path && item.path !== '#') {
                                                router.push(item.path as any);
                                            } else {
                                                Alert.alert(t('Information'), `${item.label} ${t('is coming soon')}`);
                                            }
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

    scrollContent: { paddingBottom: 120 },

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

    statusToggleBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 10, width: '80%', marginTop: 15 },
    toggleLabel: { fontSize: 12, fontFamily: 'NotoSans-Bold', textTransform: 'uppercase' },

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
