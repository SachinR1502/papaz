import { AdminSettingsRow } from '@/components/admin/AdminSettingsRow';
import { Colors } from '@/constants/theme';
import { useAdmin } from '@/context/AdminContext';
import { useAuth } from '@/context/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    Alert,
    Animated,
    Dimensions,
    Image,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const HEADER_HEIGHT = 120;
const { width } = Dimensions.get('window');

export default function AdminSettings() {
    const router = useRouter();
    const { logout } = useAuth();
    const { settings, updateSettings, stats, refreshDashboard } = useAdmin();
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
        try {
            await refreshDashboard();
        } catch (error) {
            console.error(error);
        } finally {
            setRefreshing(false);
        }
    };

    const handleMaintenance = (val: boolean) => {
        if (val) {
            Alert.alert("Maintenance Mode", "Enabling this will suspend all user activity. Are you sure?", [
                { text: "Cancel", style: "cancel" },
                { text: "Enable", style: "destructive", onPress: () => updateSettings({ maintenanceMode: true }) }
            ]);
        } else {
            updateSettings({ maintenanceMode: false });
        }
    };

    const IconBox = ({ icon, color, bg }: { icon: any; color: string; bg?: string }) => (
        <View style={[styles.iconBox, { backgroundColor: bg || (color + '15') }]}>
            {icon}
        </View>
    );

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
                <Text style={[styles.stickyHeaderText, { color: colors.text }]}>Admin Console</Text>
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
                                    source={{ uri: 'https://ui-avatars.com/api/?name=Admin+User&background=6200ea&color=fff&size=200' }}
                                    style={styles.profileImage}
                                />
                                <View style={[styles.editBadge, { backgroundColor: colors.primary, borderColor: '#FFF' }]}>
                                    <MaterialCommunityIcons name="shield-check" size={12} color="#FFF" />
                                </View>
                            </View>
                        </View>
                        <View style={styles.profileInfo}>
                            <Text style={[styles.name, { color: colors.text }]}>System Admin</Text>
                            <Text style={[styles.role, { color: colors.primary }]}>Super Administrator</Text>
                            <View style={styles.locationRow}>
                                <View style={[styles.statusDot, { backgroundColor: '#34C759' }]} />
                                <Text style={[styles.location, { color: colors.icon }]}>
                                    System Operational
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* Stats */}
                    {stats && (
                        <View style={[styles.statsContainer, { backgroundColor: isDark ? '#ffffff10' : '#F8F9FA' }]}>
                            <View style={styles.statItem}>
                                <Text style={[styles.statValue, { color: colors.text }]}>{(stats.totalCustomers + stats.totalTechnicians + stats.totalSuppliers) || '0'}</Text>
                                <Text style={[styles.statLabel, { color: colors.icon }]}>Users</Text>
                            </View>
                            <View style={[styles.divider, { backgroundColor: colors.border }]} />
                            <View style={styles.statItem}>
                                <Text style={[styles.statValue, { color: colors.text }]}>{stats.activeJobs || '0'}</Text>
                                <Text style={[styles.statLabel, { color: colors.icon }]}>Active Jobs</Text>
                            </View>
                            <View style={[styles.divider, { backgroundColor: colors.border }]} />
                            <View style={styles.statItem}>
                                <Text style={[styles.statValue, { color: colors.text }]}>{stats.pendingApprovals || '0'}</Text>
                                <Text style={[styles.statLabel, { color: colors.icon }]}>Pending</Text>
                            </View>
                        </View>
                    )}
                </View>

                {/* System Controls */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.icon }]}>System Controls</Text>
                    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <AdminSettingsRow
                            icon={<IconBox icon={<MaterialCommunityIcons name="alert-octagon" size={20} color="#FF3B30" />} color="#FF3B30" bg={isDark ? '#FF3B3020' : '#FF3B3015'} />}
                            label="Maintenance Mode"
                            subLabel="Suspend all platform activity"
                            rightElement={
                                <Switch
                                    value={settings.maintenanceMode}
                                    onValueChange={handleMaintenance}
                                    trackColor={{ false: isDark ? '#3A3A3C' : '#E5E5EA', true: '#FF3B30' }}
                                />
                            }
                        />
                        <View style={[styles.menuDivider, { backgroundColor: colors.border }]} />
                        <AdminSettingsRow
                            icon={<IconBox icon={<MaterialCommunityIcons name="account-plus" size={20} color="#34C759" />} color="#34C759" bg={isDark ? '#34C75920' : '#34C75915'} />}
                            label="New Registrations"
                            subLabel="Allow new users to sign up"
                            isLast
                            rightElement={
                                <Switch
                                    value={settings.allowRegistrations}
                                    onValueChange={(val) => updateSettings({ allowRegistrations: val })}
                                    trackColor={{ true: '#34C759', false: isDark ? '#3A3A3C' : '#E5E5EA' }}
                                />
                            }
                        />
                    </View>
                </View>

                {/* Financial Configuration */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.icon }]}>Financial Configuration</Text>
                    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <AdminSettingsRow
                            icon={<IconBox icon={<MaterialCommunityIcons name="percent" size={20} color="#AF52DE" />} color="#AF52DE" bg={isDark ? '#AF52DE20' : '#AF52DE15'} />}
                            label="Commission Rate"
                            value={`${settings.commissionRate}%`}
                            showChevron
                            onPress={() => { }}
                        />
                        <View style={[styles.menuDivider, { backgroundColor: colors.border }]} />
                        <AdminSettingsRow
                            icon={<IconBox icon={<MaterialCommunityIcons name="credit-card-settings" size={20} color="#007AFF" />} color="#007AFF" bg={isDark ? '#007AFF20' : '#007AFF15'} />}
                            label="Payment Gateways"
                            showChevron
                            onPress={() => { }}
                        />
                        <View style={[styles.menuDivider, { backgroundColor: colors.border }]} />
                        <AdminSettingsRow
                            icon={<IconBox icon={<MaterialCommunityIcons name="bank" size={20} color="#FF9500" />} color="#FF9500" bg={isDark ? '#FF950020' : '#FF950015'} />}
                            label="Payout Schedule"
                            value={settings.payoutSchedule}
                            showChevron
                            onPress={() => { }}
                        />
                        <View style={[styles.menuDivider, { backgroundColor: colors.border }]} />
                        <AdminSettingsRow
                            icon={<IconBox icon={<MaterialCommunityIcons name="currency-inr" size={20} color="#34C759" />} color="#34C759" bg={isDark ? '#34C75920' : '#34C75915'} />}
                            label="Platform Currency"
                            value={settings.currency}
                            rightElement={<Ionicons name="swap-horizontal" size={18} color={colors.icon} />}
                            onPress={() => {
                                const next = settings.currency === 'INR' ? 'USD' : 'INR';
                                updateSettings({ currency: next });
                                Alert.alert("Currency Updated", `System-wide currency changed to ${next}`);
                            }}
                        />
                        <View style={[styles.menuDivider, { backgroundColor: colors.border }]} />
                        <AdminSettingsRow
                            icon={<IconBox icon={<Ionicons name="globe-outline" size={20} color="#5856D6" />} color="#5856D6" bg={isDark ? '#5856D620' : '#5856D615'} />}
                            label="App Language"
                            value="English"
                            isLast
                            showChevron
                            onPress={() => {
                                router.push('/(admin)/settings/language' as any);
                            }}
                        />
                    </View>
                </View>

                {/* Operations */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.icon }]}>Operations</Text>
                    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <AdminSettingsRow
                            icon={<IconBox icon={<MaterialCommunityIcons name="map-marker-radius" size={20} color="#5856D6" />} color="#5856D6" bg={isDark ? '#5856D620' : '#5856D615'} />}
                            label="Service Zones"
                            showChevron
                            onPress={() => router.push('/(admin)/settings/service-zones' as any)}
                        />
                        <View style={[styles.menuDivider, { backgroundColor: colors.border }]} />
                        <AdminSettingsRow
                            icon={<IconBox icon={<MaterialCommunityIcons name="file-document-outline" size={20} color="#FF2D55" />} color="#FF2D55" bg={isDark ? '#FF2D5520' : '#FF2D5515'} />}
                            label="Policies & Terms"
                            showChevron
                            onPress={() => { }}
                        />
                        <View style={[styles.menuDivider, { backgroundColor: colors.border }]} />
                        <AdminSettingsRow
                            icon={<IconBox icon={<MaterialCommunityIcons name="shield-check" size={20} color="#FF9500" />} color="#FF9500" bg={isDark ? '#FF950020' : '#FF950015'} />}
                            label="Security & Access"
                            showChevron
                            isLast
                            onPress={() => router.push('/(admin)/settings/security' as any)}
                        />
                    </View>
                </View>

                {/* Logout Button */}
                <TouchableOpacity
                    style={[styles.logoutButton, { backgroundColor: '#FF3B3015' }]}
                    onPress={logout}
                >
                    <Ionicons name="log-out-outline" size={20} color="#FF3B30" />
                    <Text style={styles.logoutText}>Sign Out</Text>
                </TouchableOpacity>

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
        gap: 6,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    location: {
        fontSize: 13,
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
    section: {
        marginBottom: 24,
        paddingHorizontal: 20,
    },
    sectionTitle: {
        fontSize: 13,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 8,
        marginLeft: 4,
    },
    card: {
        borderRadius: 20,
        overflow: 'hidden',
        borderWidth: 1,
        padding: 8,
    },
    iconBox: {
        width: 36,
        height: 36,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    menuDivider: {
        height: 1,
        marginLeft: 56, // Adjust based on icon size + padding
        marginVertical: 4,
    },
    logoutButton: {
        marginHorizontal: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 16,
        gap: 8,
        marginBottom: 40,
    },
    logoutText: {
        color: '#FF3B30',
        fontSize: 16,
        fontWeight: '600',
    },
});
