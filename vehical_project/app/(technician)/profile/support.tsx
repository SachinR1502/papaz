import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { Animated, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SupportScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const colors = {
        background: isDark ? '#000000' : '#F8F9FB',
        card: isDark ? '#1C1C1E' : '#FFFFFF',
        text: isDark ? '#FFFFFF' : '#1A1A1A',
        subText: isDark ? '#A1A1A6' : '#8E8E93',
        border: isDark ? '#2C2C2E' : '#F0F0F0',
        pulseBg: isDark ? 'rgba(52, 199, 89, 0.15)' : '#E8F5E9',
        sectionTitle: isDark ? '#8E8E93' : '#8E8E93',
        gridItemBg: isDark ? '#1C1C1E' : '#FFFFFF',
        iconBg: isDark ? '#2C2C2E' : '#F8F9FE',
    };

    const handleCall = () => Linking.openURL('tel:+919876543210');
    const handleEmail = () => Linking.openURL('mailto:support@papaz.com');
    const handleWhatsapp = () => Linking.openURL('https://wa.me/919876543210');

    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
        }).start();
    }, []);

    const helpTopics = [
        { icon: 'wallet-outline', label: 'Payments' },
        { icon: 'calendar-outline', label: 'Bookings' },
        { icon: 'person-outline', label: 'Profile' },
        { icon: 'alert-circle-outline', label: 'Disputes' },
    ];

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
            <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: colors.iconBg }]}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Help & Support</Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <Animated.View style={{ opacity: fadeAnim }}>
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: colors.sectionTitle }]}>CONTACT US</Text>
                        <View style={styles.contactGrid}>
                            <TouchableOpacity style={[styles.contactCard, { backgroundColor: colors.card }]} onPress={handleCall}>
                                <View style={[styles.contactIcon, { backgroundColor: '#E1E9FF' }]}>
                                    <Ionicons name="call" size={24} color="#007AFF" />
                                </View>
                                <Text style={[styles.contactLabel, { color: colors.text }]}>Call Support</Text>
                                <Text style={[styles.contactSub, { color: colors.subText }]}>+91 98765 43210</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.contactCard, { backgroundColor: colors.card }]} onPress={handleWhatsapp}>
                                <View style={[styles.contactIcon, { backgroundColor: '#E8F5E9' }]}>
                                    <Ionicons name="logo-whatsapp" size={24} color="#34C759" />
                                </View>
                                <Text style={[styles.contactLabel, { color: colors.text }]}>Chat Now</Text>
                                <Text style={[styles.contactSub, { color: colors.subText }]}>Fast Response</Text>
                            </TouchableOpacity>
                        </View>
                        <TouchableOpacity style={[styles.emailCard, { backgroundColor: colors.card }]} onPress={handleEmail}>
                            <View style={[styles.emailIcon, { backgroundColor: '#FFF0E6' }]}>
                                <Ionicons name="mail" size={22} color="#FF9500" />
                            </View>
                            <Text style={[styles.emailText, { color: colors.text }]}>Send us an Email</Text>
                            <Ionicons name="chevron-forward" size={20} color={colors.subText} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: colors.sectionTitle }]}>COMMON TOPICS</Text>
                        <View style={[styles.topicsGrid, { backgroundColor: colors.card }]}>
                            {helpTopics.map((topic, idx) => (
                                <TouchableOpacity key={idx} style={[styles.topicItem, { borderRightWidth: (idx + 1) % 2 === 0 ? 0 : 1, borderBottomWidth: idx < 2 ? 1 : 0, borderColor: colors.border }]}>
                                    <Ionicons name={topic.icon as any} size={28} color={colors.text} />
                                    <Text style={[styles.topicLabel, { color: colors.text }]}>{topic.label}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    <View style={[styles.statusCard, { backgroundColor: colors.background, borderColor: colors.border }]}>
                        <View style={[styles.pulse, { backgroundColor: colors.pulseBg }]}>
                            <View style={styles.dot} />
                        </View>
                        <View style={styles.statusContent}>
                            <Text style={[styles.statusTitle, { color: colors.text }]}>All Systems Operational</Text>
                            <Text style={[styles.statusSub, { color: colors.subText }]}>No outages reported in Mumbai today.</Text>
                        </View>
                    </View>
                </Animated.View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { paddingHorizontal: 20, paddingVertical: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1 },
    backBtn: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    headerTitle: { fontSize: 18, fontWeight: 'bold' },
    content: { paddingBottom: 40 },
    section: { paddingHorizontal: 20, marginTop: 25 },
    sectionTitle: { fontSize: 11, fontWeight: '900', letterSpacing: 1, marginBottom: 15, paddingLeft: 5 },
    contactGrid: { flexDirection: 'row', gap: 15 },
    contactCard: { flex: 1, padding: 20, borderRadius: 24, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.02, shadowRadius: 10, elevation: 1 },
    contactIcon: { width: 48, height: 48, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
    contactLabel: { fontSize: 14, fontWeight: 'bold' },
    contactSub: { fontSize: 11, marginTop: 2 },
    emailCard: { flexDirection: 'row', alignItems: 'center', padding: 15, borderRadius: 20, marginTop: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.02, shadowRadius: 10, elevation: 1 },
    emailIcon: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
    emailText: { flex: 1, fontSize: 15, fontWeight: '600' },
    topicsGrid: { flexDirection: 'row', flexWrap: 'wrap', borderRadius: 24, overflow: 'hidden' },
    topicItem: { width: '50%', alignItems: 'center', padding: 25, gap: 10 },
    topicLabel: { fontSize: 13, fontWeight: '600' },
    statusCard: { flexDirection: 'row', margin: 20, padding: 15, borderRadius: 20, borderWidth: 1, alignItems: 'center' },
    pulse: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
    dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#34C759' },
    statusContent: { flex: 1 },
    statusTitle: { fontSize: 14, fontWeight: 'bold' },
    statusSub: { fontSize: 11, marginTop: 2 },
});
