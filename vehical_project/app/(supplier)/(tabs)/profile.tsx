import { Colors } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { useSupplier } from '@/context/SupplierContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    Image,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const HEADER_HEIGHT = 120;

export default function SupplierProfileScreen() {
    const { logout } = useAuth();
    const { profile, inventory, orders, refreshData } = useSupplier();
    const router = useRouter();
    const { t, language } = useLanguage();
    const colorScheme = useColorScheme();
    const insets = useSafeAreaInsets();
    const theme = colorScheme ?? 'light';
    const colors = Colors[theme];
    const isDark = theme === 'dark';

    const scrollY = useRef(new Animated.Value(0)).current;
    const [refreshing, setRefreshing] = useState(false);

    // Animation Values
    const blob1Anim = useRef(new Animated.Value(0)).current;
    const blob2Anim = useRef(new Animated.Value(0)).current;
    const headerOpacity = scrollY.interpolate({
        inputRange: [0, 100],
        outputRange: [0, 1],
        extrapolate: 'clamp'
    });

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

    const onRefresh = async () => {
        setRefreshing(true);
        await refreshData();
        setRefreshing(false);
    };

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

    const sections = [
        {
            title: t('Business Management'),
            items: [
                { id: 'profile', icon: 'storefront-outline', label: t('Shop Profile'), color: colors.primary, sub: t('Identity & Details'), path: '/(supplier)/profile/edit' },
                { id: 'inventory', icon: 'cube-outline', label: t('Inventory Management'), color: colors.secondary, sub: t('Stock & Catalog'), path: '/(supplier)/profile/inventory' },
                { id: 'orders', icon: 'receipt-outline', label: t('Order History'), color: colors.customers, sub: t('Track all orders'), path: '/(supplier)/profile/orders' },
                { id: 'payments', icon: 'wallet-outline', label: t('Payments & Withdrawals'), color: colors.revenue, sub: t('Manage finances'), path: '/(supplier)/profile/payments' },
            ]
        },
        {
            title: t('Account & Preferences'),
            items: [
                { id: 'notifications', icon: 'notifications-outline', label: t('Notifications'), color: colors.notification, sub: t('Alert preferences'), path: '/(supplier)/profile/notifications' },
                { id: 'language', icon: 'globe-outline', label: t('Language'), color: colors.icon, sub: `${t('Current')}: ${getLanguageLabel(language)}`, path: '/(supplier)/profile/language' },
                { id: 'security', icon: 'shield-checkmark-outline', label: t('Security'), color: colors.revenue, sub: t('Password & Access'), path: '/(supplier)/profile/security' },
            ]
        },
        {
            title: t('Support & Legal'),
            items: [
                { id: 'support', icon: 'help-circle-outline', label: t('Help & Support'), color: colors.primary, sub: t('FAQs and Contact'), path: '/(supplier)/profile/support' },
                { id: 'legal', icon: 'document-text-outline', label: t('Terms & Privacy'), color: colors.icon, sub: t('Legal Information'), path: '/(supplier)/profile/legal' },
            ]
        }
    ];

    const quickActions = [
        { id: 'add_product', label: t('Add Product'), icon: 'add-circle-outline', color: colors.primary, path: '/(supplier)/inventory/add' },
        { id: 'scan', label: t('Scan Check'), icon: 'qr-code-outline', color: colors.secondary, path: '/(supplier)/orders/scan' },
        { id: 'stats', label: t('Analytics'), icon: 'bar-chart-outline', color: colors.revenue, path: '/(supplier)/analytics' },
    ];

    const blob1TranslateY = blob1Anim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, -50]
    });

    const blob2TranslateY = blob2Anim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 50]
    });

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Animated Background */}
            <View style={StyleSheet.absoluteFill}>
                <Animated.View style={[
                    styles.blob,
                    {
                        backgroundColor: isDark ? '#1A237E30' : '#E8F5E9',
                        top: -100,
                        right: -100,
                        transform: [{ translateY: blob1TranslateY }, { scale: 1.5 }]
                    }
                ]} />
                <Animated.View style={[
                    styles.blob,
                    {
                        backgroundColor: isDark ? '#311B9230' : '#E3F2FD',
                        bottom: 0,
                        left: -50,
                        transform: [{ translateY: blob2TranslateY }, { scale: 1.2 }]
                    }
                ]} />
            </View>

            {/* Custom Header */}
            <Animated.View style={[
                styles.stickyHeader,
                {
                    backgroundColor: isDark ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.9)',
                    opacity: headerOpacity,
                    paddingTop: insets.top,
                    borderBottomColor: colors.border
                }
            ]}>
                <Text style={[styles.stickyHeaderText, { color: colors.text }]}>{profile?.shopName || t('Profile')}</Text>
            </Animated.View>

            <Animated.ScrollView
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                    { useNativeDriver: true }
                )}
                scrollEventThrottle={16}
                contentContainerStyle={{ paddingTop: HEADER_HEIGHT + insets.top, paddingBottom: 100 }}
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
            >
                {/* Profile Card */}
                <View style={[styles.profileCard, { marginTop: -HEADER_HEIGHT / 2 }]}>
                    <View style={styles.profileHeader}>
                        <View style={styles.imageContainer}>
                            <View style={[styles.imageWrapper, { backgroundColor: colors.card, borderColor: colors.border }]}>
                                <Image
                                    source={{ uri: profile?.shopImage || 'https://images.unsplash.com/photo-1556740738-b6a63e27c4df?w=200&h=200&fit=crop' }}
                                    style={styles.profileImage}
                                />
                                <TouchableOpacity style={[styles.editBadge, { backgroundColor: colors.primary }]}>
                                    <Ionicons name="camera" size={12} color="#FFF" />
                                </TouchableOpacity>
                            </View>
                        </View>
                        <View style={styles.profileInfo}>
                            <Text style={[styles.name, { color: colors.text }]}>{profile?.shopName || t('Your Shop')}</Text>
                            <Text style={[styles.role, { color: colors.primary }]}>{t('Supplier Partner')}</Text>
                            <View style={styles.locationRow}>
                                <Ionicons name="location-outline" size={14} color={colors.icon} />
                                <Text style={[styles.location, { color: colors.icon }]} numberOfLines={1}>
                                    {profile?.city || t('Location not set')}
                                </Text>
                            </View>
                        </View>
                        <TouchableOpacity style={[styles.settingsBtn, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={() => router.push('/(supplier)/profile/edit')}>
                            <Ionicons name="settings-outline" size={20} color={colors.text} />
                        </TouchableOpacity>
                    </View>

                    {/* Stats */}
                    <View style={[styles.statsContainer, { backgroundColor: isDark ? '#ffffff10' : '#F8F9FA' }]}>
                        <View style={styles.statItem}>
                            <Text style={[styles.statValue, { color: colors.text }]}>{inventory.length}</Text>
                            <Text style={[styles.statLabel, { color: colors.icon }]}>{t('Products')}</Text>
                        </View>
                        <View style={[styles.divider, { backgroundColor: colors.border }]} />
                        <View style={styles.statItem}>
                            <Text style={[styles.statValue, { color: colors.text }]}>{orders.length}</Text>
                            <Text style={[styles.statLabel, { color: colors.icon }]}>{t('Orders')}</Text>
                        </View>
                        <View style={[styles.divider, { backgroundColor: colors.border }]} />
                        <View style={styles.statItem}>
                            <Text style={[styles.statValue, { color: colors.text }]}>{profile?.rating || '4.8'}</Text>
                            <Text style={[styles.statLabel, { color: colors.icon }]}>{t('Rating')}</Text>
                        </View>
                    </View>
                </View>

                {/* Quick Actions */}
                <View style={styles.quickActionsContainer}>
                    <Text style={[styles.sectionTitle, { color: colors.text, paddingHorizontal: 20 }]}>{t('Quick Actions')}</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickActionsScroll}>
                        {quickActions.map((action, index) => (
                            <TouchableOpacity
                                key={index}
                                style={[styles.actionCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                                onPress={() => router.push(action.path as any)}
                            >
                                <View style={[styles.actionIcon, { backgroundColor: action.color + '15' }]}>
                                    <Ionicons name={action.icon as any} size={24} color={action.color} />
                                </View>
                                <Text style={[styles.actionLabel, { color: colors.text }]}>{action.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {/* Menu Sections */}
                <View style={styles.sectionsContainer}>
                    {sections.map((section, sIndex) => (
                        <View key={sIndex} style={styles.section}>
                            <Text style={[styles.sectionHeader, { color: colors.icon }]}>{section.title}</Text>
                            <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                                {section.items.map((item, iIndex) => (
                                    <View key={iIndex}>
                                        <TouchableOpacity
                                            style={styles.menuItem}
                                            onPress={() => router.push(item.path as any)}
                                        >
                                            <View style={[styles.menuIconContainer, { backgroundColor: item.color + '10' }]}>
                                                <Ionicons name={item.icon as any} size={20} color={item.color} />
                                            </View>
                                            <View style={styles.menuContent}>
                                                <Text style={[styles.menuLabel, { color: colors.text }]}>{item.label}</Text>
                                                {item.sub && <Text style={[styles.menuSub, { color: colors.icon }]}>{item.sub}</Text>}
                                            </View>
                                            <Ionicons name="chevron-forward" size={20} color={colors.border} />
                                        </TouchableOpacity>
                                        {iIndex < section.items.length - 1 && (
                                            <View style={[styles.menuDivider, { backgroundColor: colors.border }]} />
                                        )}
                                    </View>
                                ))}
                            </View>
                        </View>
                    ))}
                </View>

                {/* Logout Button */}
                <TouchableOpacity
                    style={[styles.logoutButton, { backgroundColor: '#FF3B3015' }]}
                    onPress={logout}
                >
                    <Ionicons name="log-out-outline" size={20} color="#FF3B30" />
                    <Text style={styles.logoutText}>{t('Sign Out')}</Text>
                </TouchableOpacity>

                <Text style={[styles.versionText, { color: colors.icon }]}>Version 1.2.0 • Build 240</Text>
            </Animated.ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    blob: {
        position: 'absolute',
        width: 300,
        height: 300,
        borderRadius: 150,
        opacity: 0.6,
    },
    stickyHeader: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 80,
        zIndex: 100,
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingBottom: 12,
        borderBottomWidth: 1,
    },
    stickyHeaderText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    profileCard: {
        marginHorizontal: 20,
        marginBottom: 24,
    },
    profileHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    imageContainer: {
        marginRight: 16,
    },
    imageWrapper: {
        position: 'relative',
        padding: 3,
        borderRadius: 40,
        borderWidth: 1,
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
    },
    profileImage: {
        width: 70,
        height: 70,
        borderRadius: 35,
    },
    editBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#FFF',
    },
    profileInfo: {
        flex: 1,
    },
    name: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    role: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 4,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    location: {
        fontSize: 13,
    },
    settingsBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
    },
    statsContainer: {
        flexDirection: 'row',
        padding: 16,
        borderRadius: 20,
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statValue: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        fontWeight: '500',
    },
    divider: {
        width: 1,
        height: 30,
    },
    quickActionsContainer: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    quickActionsScroll: {
        paddingHorizontal: 20,
        gap: 12,
    },
    actionCard: {
        width: 100,
        padding: 12,
        borderRadius: 16,
        alignItems: 'center',
        borderWidth: 1,
        gap: 8,
    },
    actionIcon: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 4,
    },
    actionLabel: {
        fontSize: 12,
        fontWeight: '600',
        textAlign: 'center',
    },
    sectionsContainer: {
        paddingHorizontal: 20,
        marginBottom: 24,
    },
    section: {
        marginBottom: 24,
    },
    sectionHeader: {
        fontSize: 13,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 8,
        marginLeft: 4,
    },
    sectionCard: {
        borderRadius: 20,
        overflow: 'hidden',
        borderWidth: 1,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        gap: 16,
    },
    menuIconContainer: {
        width: 36,
        height: 36,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    menuContent: {
        flex: 1,
        gap: 2,
    },
    menuLabel: {
        fontSize: 16,
        fontWeight: '600',
    },
    menuSub: {
        fontSize: 12,
    },
    menuDivider: {
        height: 1,
        marginLeft: 68,
    },
    logoutButton: {
        marginHorizontal: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 16,
        gap: 8,
        marginBottom: 12,
    },
    logoutText: {
        color: '#FF3B30',
        fontSize: 16,
        fontWeight: '600',
    },
    versionText: {
        textAlign: 'center',
        fontSize: 12,
        marginBottom: 20,
    }
});
