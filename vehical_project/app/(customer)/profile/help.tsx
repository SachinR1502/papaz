import { Colors } from '@/constants/theme';
import { useCall } from '@/context/CallContext';
import { useChat } from '@/context/ChatContext';
import { useLanguage } from '@/context/LanguageContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HelpCenter() {
    const router = useRouter();
    const { createConversation } = useChat();
    const { startCall } = useCall();
    const { t } = useLanguage();
    const colorScheme = useColorScheme();
    const theme = colorScheme ?? 'light';
    const colors = Colors[theme];
    const isDark = theme === 'dark';

    const handleChatSupport = () => {
        const convId = createConversation([
            { userId: 'u1', role: 'customer', name: t('You') },
            { userId: 'support_admin', role: 'admin', name: t('Support Agent') }
        ]);
        router.push({ pathname: '/(customer)/chat/[id]', params: { id: convId } });
    };

    const handlePhoneSupport = () => {
        startCall('support_agent', t('Customer Support'), 'audio');
    };

    const faqs = [
        { q: t('How do I book a service?'), a: t('Go to the home tab and click on the "Book Service" button.') },
        { q: t('How can I track my order?'), a: t('You can track your spare parts orders in the My Orders section.') },
        { q: t('What is PAPAZ Care?'), a: t('PAPAZ Care is our premium membership for faster service and extra discounts.') },
    ];

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
            <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>{t('Help Center')}</Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={[styles.searchBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <Ionicons name="search" size={20} color={colors.icon} />
                    <TextInput placeholder={t("Search FAQs...")} style={[styles.searchInput, { color: colors.text }]} placeholderTextColor={colors.icon} />
                </View>

                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.icon }]}>{t('Frequently Asked')}</Text>
                    {faqs.map((faq, idx) => (
                        <TouchableOpacity key={idx} style={[styles.faqItem, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={() => Alert.alert(faq.q, faq.a)}>
                            <Text style={[styles.faqLabel, { color: colors.text }]}>{faq.q}</Text>
                            <Ionicons name="chevron-down" size={18} color={colors.icon} />
                        </TouchableOpacity>
                    ))}
                </View>

                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.icon }]}>{t('Contact Support')}</Text>
                    <View style={[styles.card, { backgroundColor: colors.card }]}>
                        <TouchableOpacity style={styles.row} onPress={handleChatSupport}>
                            <View style={[styles.iconBg, { backgroundColor: isDark ? colors.customers + '20' : '#F0F7FF' }]}>
                                <Ionicons name="chatbubbles-outline" size={22} color={colors.customers} />
                            </View>
                            <View style={styles.info}>
                                <Text style={[styles.label, { color: colors.text }]}>{t('Live Chat')}</Text>
                                <Text style={[styles.sub, { color: colors.icon }]}>{t('Chat with our support experts')}</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={18} color={colors.icon} />
                        </TouchableOpacity>
                        <View style={[styles.divider, { backgroundColor: colors.border }]} />
                        <TouchableOpacity style={styles.row} onPress={handlePhoneSupport}>
                            <View style={[styles.iconBg, { backgroundColor: isDark ? colors.sales + '20' : '#F0FFF4' }]}>
                                <Ionicons name="call-outline" size={22} color={colors.sales} />
                            </View>
                            <View style={styles.info}>
                                <Text style={[styles.label, { color: colors.text }]}>{t('Phone Support')}</Text>
                                <Text style={[styles.sub, { color: colors.icon }]}>{t('Give us a call anytime')}</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={18} color={colors.icon} />
                        </TouchableOpacity>
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
    searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', paddingHorizontal: 16, height: 50, borderRadius: 15, gap: 10, marginBottom: 25, borderWidth: 1, borderColor: '#F0F0F0' },
    searchInput: { flex: 1, fontSize: 14, fontFamily: 'NotoSans-Regular' },
    section: { marginBottom: 30 },
    sectionTitle: { fontSize: 14, fontFamily: 'NotoSans-Bold', color: '#8E8E93', textTransform: 'uppercase', marginBottom: 15, marginLeft: 5 },
    faqItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FFF', padding: 18, borderRadius: 20, marginBottom: 10, borderWidth: 1, borderColor: '#F0F0F0' },
    faqLabel: { fontSize: 15, fontFamily: 'NotoSans-Bold', color: '#1A1A1A' },
    card: { backgroundColor: '#FFF', borderRadius: 24, paddingVertical: 5, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 10, elevation: 2 },
    row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 15 },
    iconBg: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
    info: { flex: 1 },
    label: { fontSize: 16, fontFamily: 'NotoSans-Bold', color: '#1A1A1A' },
    sub: { fontSize: 12, color: '#8E8E93', marginTop: 2 },
    divider: { height: 1, backgroundColor: '#F8F9FE', marginHorizontal: 16 }
});
