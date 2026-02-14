import { Colors } from '@/constants/theme';
import { useCustomer } from '@/context/CustomerContext';
import { useLanguage } from '@/context/LanguageContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function NotificationsSettingsScreen() {
    const { profile, updateProfile } = useCustomer();
    const router = useRouter();
    const { t } = useLanguage();
    const colorScheme = useColorScheme();
    const theme = colorScheme ?? 'light';
    const colors = Colors[theme];
    const isDark = theme === 'dark';

    const [settings, setSettings] = useState({
        push: true,
        email: true,
        sms: false,
        offers: true,
        updates: true
    });

    useEffect(() => {
        if (profile?.notificationSettings) {
            setSettings(profile.notificationSettings);
        }
    }, [profile]);

    const toggle = async (key: keyof typeof settings) => {
        const newSettings = { ...settings, [key]: !settings[key] };
        setSettings(newSettings);
        try {
            await updateProfile({ notificationSettings: newSettings });
        } catch (e) {
            console.error('Failed to update notification settings', e);
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
            <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace('/(customer)/(tabs)')} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>{t('Notifications')}</Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.icon }]}>{t('Main Channels')}</Text>
                    <View style={[styles.card, { backgroundColor: colors.card }]}>
                        <View style={styles.row}>
                            <View style={styles.info}>
                                <Text style={[styles.label, { color: colors.text }]}>{t('Push Notifications')}</Text>
                                <Text style={[styles.sub, { color: colors.icon }]}>{t('Instant alerts for service updates')}</Text>
                            </View>
                            <Switch value={settings.push} onValueChange={() => toggle('push')} trackColor={{ true: colors.primary, false: colors.border }} thumbColor="#FFF" />
                        </View>
                        <View style={[styles.divider, { backgroundColor: colors.border }]} />
                        <View style={styles.row}>
                            <View style={styles.info}>
                                <Text style={[styles.label, { color: colors.text }]}>{t('Email Notifications')}</Text>
                                <Text style={[styles.sub, { color: colors.icon }]}>{t('Invoices and service history')}</Text>
                            </View>
                            <Switch value={settings.email} onValueChange={() => toggle('email')} trackColor={{ true: colors.primary, false: colors.border }} thumbColor="#FFF" />
                        </View>
                        <View style={[styles.divider, { backgroundColor: colors.border }]} />
                        <View style={styles.row}>
                            <View style={styles.info}>
                                <Text style={[styles.label, { color: colors.text }]}>{t('SMS Notifications')}</Text>
                                <Text style={[styles.sub, { color: colors.icon }]}>{t('Direct updates via text message')}</Text>
                            </View>
                            <Switch value={settings.sms} onValueChange={() => toggle('sms')} trackColor={{ true: colors.primary, false: colors.border }} thumbColor="#FFF" />
                        </View>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.icon }]}>{t('Preferences')}</Text>
                    <View style={[styles.card, { backgroundColor: colors.card }]}>
                        <View style={styles.row}>
                            <View style={styles.info}>
                                <Text style={[styles.label, { color: colors.text }]}>{t('Offers & Promos')}</Text>
                                <Text style={[styles.sub, { color: colors.icon }]}>{t('Exclusive deals on parts & services')}</Text>
                            </View>
                            <Switch value={settings.offers} onValueChange={() => toggle('offers')} trackColor={{ true: colors.primary, false: colors.border }} thumbColor="#FFF" />
                        </View>
                        <View style={[styles.divider, { backgroundColor: colors.border }]} />
                        <View style={styles.row}>
                            <View style={styles.info}>
                                <Text style={[styles.label, { color: colors.text }]}>{t('App Updates')}</Text>
                                <Text style={[styles.sub, { color: colors.icon }]}>{t('New features and improvements')}</Text>
                            </View>
                            <Switch value={settings.updates} onValueChange={() => toggle('updates')} trackColor={{ true: colors.primary, false: colors.border }} thumbColor="#FFF" />
                        </View>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FE' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: '#FFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F2F2F7'
    },
    backBtn: { width: 44, height: 44, justifyContent: 'center' },
    headerTitle: { fontSize: 18, fontFamily: 'NotoSans-Bold', color: '#1A1A1A' },
    scrollContent: { padding: 20 },
    section: { marginBottom: 30 },
    sectionTitle: { fontSize: 14, fontFamily: 'NotoSans-Bold', color: '#8E8E93', textTransform: 'uppercase', marginBottom: 15, marginLeft: 5 },
    card: { backgroundColor: '#FFF', borderRadius: 24, paddingVertical: 10, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 10, elevation: 2 },
    row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 15 },
    info: { flex: 1, marginRight: 20 },
    label: { fontSize: 16, fontFamily: 'NotoSans-Bold', color: '#1A1A1A' },
    sub: { fontSize: 12, color: '#8E8E93', marginTop: 2 },
    divider: { height: 1, backgroundColor: '#F8F9FE', marginHorizontal: 16 }
});
