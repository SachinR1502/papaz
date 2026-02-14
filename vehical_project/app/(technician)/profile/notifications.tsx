import { Colors } from '@/constants/theme';
import { useTechnician } from '@/context/TechnicianContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function NotificationsScreen() {
    const { profile, updateProfile } = useTechnician();
    const router = useRouter();
    const colorScheme = useColorScheme();
    const theme = colorScheme ?? 'light';
    const colors = Colors[theme];
    const isDark = theme === 'dark';

    const [settings, setSettings] = useState({
        push: true,
        email: true,
        sms: false,
        newJobs: true,
        serviceUpdates: true
    });

    useEffect(() => {
        if (profile?.notificationSettings) {
            setSettings(profile.notificationSettings);
        }
    }, [profile]);

    const toggleSetting = async (key: keyof typeof settings) => {
        const newSettings = { ...settings, [key]: !settings[key] };
        setSettings(newSettings);
        try {
            await updateProfile({ notificationSettings: newSettings });
        } catch (e) {
            console.error('Failed to update notification settings', e);
        }
    };

    const notificationGroups = [
        {
            title: 'CHANNELS',
            items: [
                { id: 'push', label: 'Push Notifications', sub: 'Instant alerts on your device', icon: 'notifications-outline' },
                { id: 'email', label: 'Email Alerts', sub: 'Weekly summaries & reports', icon: 'mail-outline' },
                { id: 'sms', label: 'SMS Updates', sub: 'Critical direct messages', icon: 'chatbox-outline' },
            ]
        },
        {
            title: 'OPERATIONAL',
            items: [
                { id: 'newJobs', label: 'New Job Leads', sub: 'When a customer requests service nearby', icon: 'flash-outline' },
                { id: 'serviceUpdates', label: 'Service Cycles', sub: 'Customer approvals & status changes', icon: 'sync-outline' },
            ]
        }
    ];

    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
        }).start();
    }, []);

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
            <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: isDark ? '#2C2C2E' : '#F8F9FE' }]}>
                    <Ionicons name="chevron-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Communications</Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <Animated.View style={{ opacity: fadeAnim }}>
                    <View style={[styles.heroSection, { backgroundColor: colors.card }]}>
                        <View style={[styles.iconBg, { backgroundColor: colors.primary + '15' }]}>
                            <Ionicons name="notifications" size={32} color={colors.primary} />
                        </View>
                        <Text style={[styles.heroTitle, { color: colors.text }]}>Control your alerts</Text>
                        <Text style={[styles.heroSub, { color: colors.icon }]}>Choose how you want to be notified about operations and finances.</Text>
                    </View>

                    {notificationGroups.map((group, gIdx) => (
                        <View key={gIdx} style={styles.section}>
                            <Text style={[styles.sectionTitle, { color: colors.icon }]}>{group.title}</Text>
                            <View style={[styles.card, { backgroundColor: colors.card }]}>
                                {group.items.map((item, iIdx) => (
                                    <View key={item.id} style={[styles.row, iIdx !== group.items.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border }]}>
                                        <View style={[styles.rowIconBg, { backgroundColor: colors.background }]}>
                                            <Ionicons name={item.icon as any} size={20} color={colors.text} />
                                        </View>
                                        <View style={styles.rowText}>
                                            <Text style={[styles.rowLabel, { color: colors.text }]}>{item.label}</Text>
                                            <Text style={[styles.rowSub, { color: colors.icon }]}>{item.sub}</Text>
                                        </View>
                                        <Switch
                                            value={settings[item.id as keyof typeof settings]}
                                            onValueChange={() => toggleSetting(item.id as keyof typeof settings)}
                                            trackColor={{ false: '#D1D1D6', true: '#34C759' }}
                                            thumbColor="#FFF"
                                        />
                                    </View>
                                ))}
                            </View>
                        </View>
                    ))}
                </Animated.View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 15, borderBottomWidth: 1 },
    backBtn: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    headerTitle: { fontSize: 17, fontWeight: 'bold' },
    content: { paddingBottom: 40 },
    heroSection: { alignItems: 'center', padding: 30, marginBottom: 20 },
    iconBg: { width: 64, height: 64, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
    heroTitle: { fontSize: 20, fontWeight: 'bold' },
    heroSub: { fontSize: 14, textAlign: 'center', marginTop: 8, lineHeight: 20, paddingHorizontal: 20 },
    section: { paddingHorizontal: 20, marginTop: 10 },
    sectionTitle: { fontSize: 11, fontWeight: '900', letterSpacing: 1.2, marginBottom: 15, paddingLeft: 5 },
    card: { borderRadius: 24, paddingHorizontal: 15, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.02, shadowRadius: 10, elevation: 1 },
    row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 18 },
    rowIconBg: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
    rowText: { flex: 1 },
    rowLabel: { fontSize: 15, fontWeight: 'bold' },
    rowSub: { fontSize: 12, marginTop: 2 },
});
