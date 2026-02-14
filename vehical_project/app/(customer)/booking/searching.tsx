import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Animated,
    Dimensions,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export default function SearchingGarageScreen() {
    const router = useRouter();
    const { technicianId } = useLocalSearchParams<{ technicianId: string }>();
    const isDirectBooking = technicianId && technicianId !== 'null';

    const [statusMsg, setStatusMsg] = useState(isDirectBooking ? 'Connecting to workshop...' : 'Initializing search...');

    const colorScheme = useColorScheme();
    const theme = colorScheme ?? 'light';
    const colors = Colors[theme];
    const isDark = theme === 'dark';

    // Animations
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const ripple1 = useRef(new Animated.Value(0)).current;
    const ripple2 = useRef(new Animated.Value(0)).current;
    const directAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (!isDirectBooking) {
            // Pulse main circle - Only for Broadcast
            Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, { toValue: 1.1, duration: 1500, useNativeDriver: true }),
                    Animated.timing(pulseAnim, { toValue: 1, duration: 1500, useNativeDriver: true }),
                ])
            ).start();

            // Ripple animations - ONLY for broadcast
            const startRipple = (anim: Animated.Value, delay: number) => {
                Animated.loop(
                    Animated.sequence([
                        Animated.delay(delay),
                        Animated.timing(anim, { toValue: 1, duration: 2500, useNativeDriver: true }),
                        Animated.timing(anim, { toValue: 0, duration: 0, useNativeDriver: true }),
                    ])
                ).start();
            };

            startRipple(ripple1, 0);
            startRipple(ripple2, 1250);
        } else {
            // Direct booking animation - simple slide up or fade
            Animated.timing(directAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true
            }).start();
        }

        // Dynamic status messages
        const broadcastMsgs = [
            'Locating nearby experts...',
            'Broadcasting your request...',
            'Comparing garage ratings...',
            'Waiting for live bids...',
            'Finding best match...'
        ];
        const directMsgs = [
            'Notifying workshop...',
            'Uploading job details...',
            'Awaiting technician response...',
            'Finalizing request...'
        ];

        const msgs = isDirectBooking ? directMsgs : broadcastMsgs;
        let idx = 0;
        const msgTimer = setInterval(() => {
            setStatusMsg(msgs[idx % msgs.length]);
            idx++;
        }, 2000);

        // Auto-redirect to dashboard after 8 seconds (simulating success)
        const successTimer = setTimeout(() => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            router.replace('/(customer)/(tabs)');
        }, isDirectBooking ? 5000 : 8000); // Shorter for direct

        return () => {
            clearInterval(msgTimer);
            clearTimeout(successTimer);
        };
    }, [isDirectBooking]);

    const handleCancel = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        router.replace('/(customer)/(tabs)');
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
            <SafeAreaView style={{ flex: 1 }}>
                <View style={styles.content}>
                    <View style={styles.radarContainer}>
                        {!isDirectBooking && (
                            <>
                                {/* Pulsing Ripples - ONLY for broadcast */}
                                <Animated.View style={[styles.ripple, {
                                    borderColor: colors.primary,
                                    backgroundColor: isDark ? colors.primary + '10' : colors.primary + '20',
                                    transform: [{ scale: ripple1.interpolate({ inputRange: [0, 1], outputRange: [1, 3] }) }],
                                    opacity: ripple1.interpolate({ inputRange: [0, 1], outputRange: [0.5, 0] })
                                }]} />
                                <Animated.View style={[styles.ripple, {
                                    borderColor: colors.primary,
                                    backgroundColor: isDark ? colors.primary + '10' : colors.primary + '20',
                                    transform: [{ scale: ripple2.interpolate({ inputRange: [0, 1], outputRange: [1, 3] }) }],
                                    opacity: ripple2.interpolate({ inputRange: [0, 1], outputRange: [0.5, 0] })
                                }]} />
                            </>
                        )}

                        <Animated.View style={[styles.mainRadar, {
                            backgroundColor: isDark ? colors.card : '#F0F7FF',
                            shadowColor: colors.primary,
                            transform: [
                                { scale: pulseAnim },
                                { translateY: isDirectBooking ? directAnim.interpolate({ inputRange: [0, 1], outputRange: [50, 0] }) : 0 }
                            ],
                            opacity: isDirectBooking ? directAnim : 1,
                            borderRadius: 60,
                            width: 120, height: 120
                        }]}>
                            <MaterialCommunityIcons
                                name={isDirectBooking ? "store-check" : "satellite-variant"}
                                size={48}
                                color={colors.primary}
                            />
                        </Animated.View>

                        {isDirectBooking && (
                            <Animated.View style={{
                                position: 'absolute',
                                bottom: -20,
                                opacity: directAnim,
                                transform: [{ translateY: directAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }]
                            }}>
                                <View style={{ backgroundColor: colors.primary, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 }}>
                                    <Text style={{ color: '#FFF', fontSize: 10, fontFamily: 'NotoSans-Bold' }}>DIRECT REQUEST</Text>
                                </View>
                            </Animated.View>
                        )}
                    </View>

                    <View style={styles.textGroup}>
                        <Text style={[styles.title, { color: colors.text, textAlign: 'center' }]}>
                            {isDirectBooking ? "Sending Request" : "Searching Garages"}
                        </Text>
                        <Text style={[styles.subtitle, { color: colors.icon }]}>
                            {isDirectBooking
                                ? "We're notifying the selected workshop. Please wait while they review your request."
                                : "We're notifying top-rated mechanics nearby. You'll receive live bids shortly."
                            }
                        </Text>
                    </View>

                    <View style={[styles.statusBox, { backgroundColor: isDark ? colors.card : '#F8F9FE', borderColor: isDark ? colors.border : '#F0F0F0' }]}>
                        <ActivityIndicator color={colors.primary} size="small" />
                        <Text style={[styles.statusText, { color: colors.primary }]}>{statusMsg}</Text>
                    </View>
                </View>

                <View style={[styles.footer, { backgroundColor: colors.background }]}>
                    <TouchableOpacity style={[styles.cancelBtn, { backgroundColor: isDark ? '#4A0000' : '#FFF0F0' }]} onPress={handleCancel}>
                        <Text style={styles.cancelText}>
                            {isDirectBooking ? "Cancel Request" : "Cancel Broadcast"}
                        </Text>
                    </TouchableOpacity>
                    <View style={styles.safetyInfo}>
                        <Ionicons name="shield-checkmark" size={14} color={colors.icon} />
                        <Text style={[styles.hint, { color: colors.icon }]}>All partner garages are PAPAZ verified</Text>
                    </View>
                </View>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 },
    radarContainer: { width: 200, height: 200, justifyContent: 'center', alignItems: 'center', marginBottom: 50 },
    ripple: {
        position: 'absolute',
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 1,
    },
    mainRadar: {
        justifyContent: 'center',
        alignItems: 'center',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
        zIndex: 5
    },
    textGroup: { alignItems: 'center', gap: 12 },
    title: { fontSize: 28, fontFamily: 'NotoSans-Bold' },
    subtitle: { fontSize: 15, textAlign: 'center', fontFamily: 'NotoSans-Regular', lineHeight: 22 },

    statusBox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingHorizontal: 24,
        paddingVertical: 14,
        borderRadius: 30,
        marginTop: 40,
        borderWidth: 1,
    },
    statusText: { fontSize: 13, fontFamily: 'NotoSans-Bold' },

    footer: { padding: 24, gap: 15 },
    cancelBtn: {
        height: 60,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center'
    },
    cancelText: { color: '#FF3B30', fontSize: 16, fontFamily: 'NotoSans-Bold' },
    safetyInfo: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
    hint: { fontSize: 12, fontFamily: 'NotoSans-Regular' },
});
