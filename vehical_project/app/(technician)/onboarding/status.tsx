import { Colors } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useTechnician } from '@/context/TechnicianContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import {
    ActivityIndicator,
    Animated,
    Linking,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ApprovalStatus() {
    const router = useRouter();
    const { logout, refreshUser, user } = useAuth();
    const { isApproved } = useTechnician();
    const colorScheme = useColorScheme();
    const theme = colorScheme ?? 'light';
    const colors = Colors[theme];
    const isDark = theme === 'dark';

    const [refreshing, setRefreshing] = React.useState(false);

    // Animations
    const scaleAnim = useRef(new Animated.Value(0.8)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 8,
                useNativeDriver: true,
            }),
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
            })
        ]).start();
    }, [isApproved]);

    // Auto-poll for status updates if not approved
    useEffect(() => {
        let interval: any;
        if (!isApproved) {
            interval = setInterval(async () => {
                await refreshUser();
            }, 5000); // Check every 5 seconds
        }
        return () => clearInterval(interval);
    }, [isApproved]);

    const onRefresh = async () => {
        setRefreshing(true);
        await refreshUser();
        setRefreshing(false);
    };

    const handleContinue = () => {
        if (isApproved) {
            router.replace('/(technician)/(tabs)');
        } else {
            handleCallSupport();
        }
    };

    const handleCallSupport = () => {
        Linking.openURL('tel:+1234567890');
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.navHeader}>
                <TouchableOpacity
                    onPress={logout}
                    style={[styles.logoutBtn, { backgroundColor: isDark ? 'rgba(255, 59, 48, 0.1)' : '#FFF0F0' }]}
                >
                    <Ionicons name="log-out-outline" size={20} color="#FF3B30" />
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={handleCallSupport}
                    style={[styles.supportBtn, { backgroundColor: isDark ? colors.card : '#F8F9FE' }]}
                >
                    <Ionicons name="chatbubble-ellipses-outline" size={22} color={colors.text} />
                </TouchableOpacity>
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor="#34C759"
                    />
                }
            >
                <Animated.View style={[styles.heroSection, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
                    <View style={[styles.statusIconBg,
                    isApproved
                        ? { backgroundColor: isDark ? 'rgba(52, 199, 89, 0.15)' : '#F0F9F4' }
                        : { backgroundColor: isDark ? 'rgba(255, 149, 0, 0.15)' : '#FFF9F0' }
                    ]}>
                        <MaterialCommunityIcons
                            name={isApproved ? "check-decagram" : "clock-fast"}
                            size={70}
                            color={isApproved ? "#34C759" : "#FF9500"}
                        />
                    </View>

                    <View style={[styles.badge,
                    isApproved
                        ? { backgroundColor: isDark ? 'rgba(52, 199, 89, 0.1)' : '#E8F5E9' }
                        : { backgroundColor: isDark ? 'rgba(255, 149, 0, 0.1)' : '#FFF3E0' }
                    ]}>
                        <Text style={[styles.badgeText, isApproved ? { color: '#34C759' } : { color: '#FF9500' }]}>
                            {isApproved ? "ACCOUNT ACTIVE" : "REVIEW IN PROGRESS"}
                        </Text>
                    </View>

                    <Text style={[styles.heroTitle, { color: colors.text }]}>
                        {isApproved ? "You're all set!" : "Verification Pending"}
                    </Text>

                    <Text style={[styles.heroSubtitle, { color: colors.icon }]}>
                        {isApproved
                            ? `Welcome, ${user?.fullName || 'Partner'}. Your professional profile is live and you can now start accepting service requests.`
                            : "We're currently reviewing your documents to ensure the highest standards of our professional network."}
                    </Text>
                </Animated.View>

                {!isApproved && (
                    <Animated.View style={[styles.timelineCard, { backgroundColor: colors.card, borderColor: colors.border, opacity: fadeAnim }]}>
                        <Text style={[styles.timelineTitle, { color: colors.text }]}>Verification Journey</Text>

                        {/* Step 1 */}
                        <View style={styles.timelineItem}>
                            <View style={styles.timelineLeft}>
                                <View style={[styles.circle, { backgroundColor: '#34C759' }]}>
                                    <Ionicons name="checkmark" size={14} color="#FFF" />
                                </View>
                                <View style={[styles.line, { backgroundColor: '#34C759' }]} />
                            </View>
                            <View style={styles.timelineContent}>
                                <Text style={[styles.stepText, { color: colors.text }]}>Registration Submitted</Text>
                                <Text style={[styles.stepSub, { color: colors.icon }]}>Information received successfully</Text>
                            </View>
                        </View>

                        {/* Step 2 */}
                        <View style={styles.timelineItem}>
                            <View style={styles.timelineLeft}>
                                <View style={[styles.circle, { backgroundColor: '#34C759' }]}>
                                    <Ionicons name="checkmark" size={14} color="#FFF" />
                                </View>
                                <View style={[styles.line, { backgroundColor: isApproved ? '#34C759' : '#FF9500' }]} />
                            </View>
                            <View style={styles.timelineContent}>
                                <Text style={[styles.stepText, { color: colors.text }]}>Documents Uploaded</Text>
                                <Text style={[styles.stepSub, { color: colors.icon }]}>Verification files submitted</Text>
                            </View>
                        </View>

                        {/* Step 3 */}
                        <View style={styles.timelineItem}>
                            <View style={styles.timelineLeft}>
                                <View style={[styles.circle, {
                                    backgroundColor: isApproved ? '#34C759' : '#FFF9F0',
                                    borderColor: isApproved ? '#34C759' : '#FF9500',
                                    borderWidth: isApproved ? 0 : 2
                                }]}>
                                    {isApproved ? (
                                        <Ionicons name="checkmark" size={14} color="#FFF" />
                                    ) : (
                                        <ActivityIndicator size="small" color="#FF9500" style={{ transform: [{ scale: 0.6 }] }} />
                                    )}
                                </View>
                            </View>
                            <View style={styles.timelineContent}>
                                <Text style={[styles.stepText, { color: colors.text }]}>Final Approval</Text>
                                <Text style={[styles.stepSub, { color: isApproved ? colors.icon : '#FF9500' }]}>
                                    {isApproved ? "Profile activated" : "Estimated wait: 24-48 hours"}
                                </Text>
                            </View>
                        </View>
                    </Animated.View>
                )}

                <View style={[styles.supportCard, { backgroundColor: isDark ? 'rgba(52, 199, 89, 0.05)' : '#F0F9F4' }]}>
                    <View style={styles.supportIcon}>
                        <Ionicons name="headset-outline" size={24} color="#34C759" />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={[styles.supportTitle, { color: colors.text }]}>Need assistance?</Text>
                        <Text style={[styles.supportText, { color: colors.icon }]}>Our support team is available 24/7 to help with your onboarding.</Text>
                    </View>
                </View>
            </ScrollView>

            <View style={[styles.footer, { borderTopColor: colors.border }]}>
                <TouchableOpacity
                    style={[
                        styles.actionBtn,
                        { backgroundColor: isApproved ? '#34C759' : colors.text }
                    ]}
                    onPress={handleContinue}
                >
                    <Text style={[styles.actionBtnText, { color: isApproved ? '#FFF' : colors.background }]}>
                        {isApproved ? "Enter Dashboard" : "Contact Support"}
                    </Text>
                </TouchableOpacity>

                {!isApproved && __DEV__ && (
                    <TouchableOpacity
                        style={styles.devBypass}
                        onPress={() => router.replace('/(technician)/(tabs)')}
                    >
                        <Text style={{ color: colors.icon, fontSize: 12, fontWeight: '600' }}>[DEV] FORCE BYPASS</Text>
                    </TouchableOpacity>
                )}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    navHeader: {
        paddingHorizontal: 25,
        paddingVertical: 15,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    logoutBtn: {
        width: 44,
        height: 44,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    supportBtn: {
        width: 44,
        height: 44,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollContent: { paddingHorizontal: 25, paddingBottom: 40 },

    heroSection: { alignItems: 'center', marginTop: 10, marginBottom: 40 },
    statusIconBg: {
        width: 140,
        height: 140,
        borderRadius: 70,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 25,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 5,
    },
    badge: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12, marginBottom: 20 },
    badgeText: { fontSize: 11, fontWeight: '800', letterSpacing: 1.2 },
    heroTitle: { fontSize: 32, fontWeight: '800', textAlign: 'center', marginBottom: 12, letterSpacing: -0.5 },
    heroSubtitle: { fontSize: 16, textAlign: 'center', lineHeight: 24, paddingHorizontal: 10 },

    timelineCard: { width: '100%', borderRadius: 32, padding: 25, marginBottom: 25, borderWidth: 1 },
    timelineTitle: { fontSize: 18, fontWeight: '800', marginBottom: 25 },
    timelineItem: { flexDirection: 'row', minHeight: 70 },
    timelineLeft: { alignItems: 'center', width: 30 },
    circle: { width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center', zIndex: 2 },
    line: { width: 3, flex: 1, backgroundColor: '#E0E0E0', marginVertical: 4, borderRadius: 1.5 },
    timelineContent: { marginLeft: 20, flex: 1, paddingTop: 2 },
    stepText: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
    stepSub: { fontSize: 13, lineHeight: 18 },

    supportCard: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 20,
        padding: 20,
        borderRadius: 24,
        marginBottom: 20,
    },
    supportIcon: {
        width: 48,
        height: 48,
        borderRadius: 16,
        backgroundColor: '#FFF',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    supportTitle: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
    supportText: { fontSize: 13, lineHeight: 18 },

    footer: { padding: 25, borderTopWidth: 1 },
    actionBtn: {
        width: '100%',
        height: 62,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 15,
        shadowOffset: { width: 0, height: 8 },
        elevation: 4,
    },
    actionBtnText: { fontSize: 18, fontWeight: '700' },
    devBypass: { marginTop: 15, padding: 10, width: '100%', alignItems: 'center' }
});
