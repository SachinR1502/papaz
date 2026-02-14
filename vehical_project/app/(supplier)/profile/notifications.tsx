import { Colors } from '@/constants/theme';
import { useLanguage } from '@/context/LanguageContext';
import { useSupplier } from '@/context/SupplierContext';
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

export default function SupplierNotificationsSettings() {
    const { profile, updateProfile } = useSupplier();
    const router = useRouter();
    const { t } = useLanguage();
    const colorScheme = useColorScheme();
    const theme = colorScheme ?? 'light';
    const colors = Colors[theme];
    const isDark = theme === 'dark';

    const [settings, setSettings] = useState({
        push: true,
        email: true,
        orders: true,
        inventory: true
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
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>{t('notification_settings')}</Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.icon }]}>{t('alert_channels')}</Text>
                    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <View style={styles.row}>
                            <View style={styles.info}>
                                <Text style={[styles.label, { color: colors.text }]}>{t('push_notifications')}</Text>
                                <Text style={[styles.sub, { color: colors.icon }]}>{t('receive_real_time_updates')}</Text>
                            </View>
                            <Switch value={settings.push} onValueChange={() => toggle('push')} trackColor={{ true: colors.primary, false: colors.border }} thumbColor="#FFF" />
                        </View>
                        <View style={[styles.divider, { backgroundColor: colors.border }]} />
                        <View style={styles.row}>
                            <View style={styles.info}>
                                <Text style={[styles.label, { color: colors.text }]}>{t('email_notifications')}</Text>
                                <Text style={[styles.sub, { color: colors.icon }]}>{t('daily_reports_and_invoices')}</Text>
                            </View>
                            <Switch value={settings.email} onValueChange={() => toggle('email')} trackColor={{ true: colors.primary, false: colors.border }} thumbColor="#FFF" />
                        </View>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.icon }]}>{t('business_alerts')}</Text>
                    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <View style={styles.row}>
                            <View style={styles.info}>
                                <Text style={[styles.label, { color: colors.text }]}>{t('new_orders')}</Text>
                                <Text style={[styles.sub, { color: colors.icon }]}>{t('alert_when_new_order_received')}</Text>
                            </View>
                            <Switch value={settings.orders} onValueChange={() => toggle('orders')} trackColor={{ true: colors.primary, false: colors.border }} thumbColor="#FFF" />
                        </View>
                        <View style={[styles.divider, { backgroundColor: colors.border }]} />
                        <View style={styles.row}>
                            <View style={styles.info}>
                                <Text style={[styles.label, { color: colors.text }]}>{t('inventory_alerts')}</Text>
                                <Text style={[styles.sub, { color: colors.icon }]}>{t('notifications_for_low_stock')}</Text>
                            </View>
                            <Switch value={settings.inventory} onValueChange={() => toggle('inventory')} trackColor={{ true: colors.primary, false: colors.border }} thumbColor="#FFF" />
                        </View>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: 1,
    },
    backBtn: { width: 44, height: 44, justifyContent: 'center' },
    headerTitle: { fontSize: 18, fontWeight: 'bold' },
    scrollContent: { padding: 20 },
    section: { marginBottom: 30 },
    sectionTitle: { fontSize: 14, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 15, marginLeft: 5 },
    card: { borderRadius: 24, paddingVertical: 10, overflow: 'hidden', borderWidth: 1 },
    row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 15 },
    info: { flex: 1, marginRight: 20 },
    label: { fontSize: 16, fontWeight: 'bold' },
    sub: { fontSize: 12, marginTop: 2 },
    divider: { height: 1, marginHorizontal: 16 }
});
