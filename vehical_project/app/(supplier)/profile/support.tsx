import { Colors } from '@/constants/theme';
import { useCall } from '@/context/CallContext';
import { useChat } from '@/context/ChatContext';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SupportScreen() {
    const router = useRouter();
    const { createConversation } = useChat();
    const { startCall } = useCall();
    const colorScheme = useColorScheme();
    const theme = colorScheme ?? 'light';
    const colors = Colors[theme];
    const isDark = theme === 'dark';

    const handleChat = () => {
        const convId = createConversation([
            { userId: 's1', role: 'store', name: 'You' },
            { userId: 'admin_support', role: 'admin', name: 'Support Squad' }
        ]);
        router.push({ pathname: '/(supplier)/chat/[id]', params: { id: convId } });
    };

    const handleCall = () => {
        startCall('admin_support', 'Supplier Support', 'audio');
    };

    const faqItems = [
        { q: 'How do I update my inventory?', a: 'Go to the Inventory tab and click on the Edit button for any product.' },
        { q: 'When will I receive my payouts?', a: 'Payouts are processed every Wednesday for the previous week\'s sales.' },
        { q: 'How to contact a customer?', a: 'You can chat with the customer directly from the Order Details page.' },
    ];

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
            <View style={styles.bgBlob1} />

            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: isDark ? colors.card : '#F8F9FE' }]}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.title, { color: colors.text }]}>Help & Support</Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

                <View style={[styles.supportCard, { backgroundColor: colors.card, shadowColor: '#000' }]}>
                    <View style={[styles.iconBig, { backgroundColor: colors.primary + '15' }]}>
                        <MaterialCommunityIcons name="headset" size={32} color={colors.primary} />
                    </View>
                    <Text style={[styles.supportTitle, { color: colors.text }]}>Need immediate help?</Text>
                    <Text style={[styles.supportSub, { color: colors.icon }]}>Our support team is available 24/7 to assist you with any issues.</Text>

                    <View style={styles.actionRow}>
                        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: isDark ? colors.background : '#F0F7FF' }]} onPress={handleCall}>
                            <Ionicons name="call" size={20} color={colors.primary} />
                            <Text style={[styles.actionText, { color: colors.primary }]}>Call Us</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: isDark ? colors.background : '#F0F7FF' }]} onPress={handleChat}>
                            <Ionicons name="chatbubble" size={20} color={colors.primary} />
                            <Text style={[styles.actionText, { color: colors.primary }]}>Chat Now</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Frequently Asked Questions</Text>
                    {faqItems.map((item, index) => (
                        <View key={index} style={[styles.faqItem, { backgroundColor: isDark ? colors.card : '#F8F9FE', borderColor: colors.border }]}>
                            <Text style={[styles.question, { color: colors.text }]}>{item.q}</Text>
                            <Text style={[styles.answer, { color: colors.icon }]}>{item.a}</Text>
                        </View>
                    ))}
                </View>

                <TouchableOpacity style={styles.reportBtn}>
                    <Ionicons name="warning-outline" size={20} color="#FF3B30" />
                    <Text style={styles.reportText}>Report a Problem</Text>
                </TouchableOpacity>

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, position: 'relative', overflow: 'hidden' },
    bgBlob1: { position: 'absolute', top: -150, left: -100, width: 350, height: 350, borderRadius: 175, backgroundColor: '#FF950005', zIndex: -1 },

    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 10 },
    backBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#F8F9FE', justifyContent: 'center', alignItems: 'center' },
    title: { fontSize: 18, fontWeight: 'bold', color: '#1A1A1A' },

    content: { padding: 24 },

    supportCard: { backgroundColor: '#1A1A1A', borderRadius: 24, padding: 24, alignItems: 'center', marginBottom: 30, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 },
    iconBig: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#333', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
    supportTitle: { color: '#FFF', fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
    supportSub: { color: '#8E8E93', fontSize: 14, textAlign: 'center', marginBottom: 24, lineHeight: 20 },

    actionRow: { flexDirection: 'row', gap: 12, width: '100%' },
    actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 48, borderRadius: 14, backgroundColor: '#FFF', gap: 8 },
    actionText: { fontWeight: 'bold', color: '#007AFF', fontSize: 14 },

    section: { marginBottom: 30 },
    sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 15 },

    faqItem: { backgroundColor: '#F8F9FE', borderRadius: 16, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: '#F0F0F0' },
    question: { fontSize: 15, fontWeight: '600', color: '#1A1A1A', marginBottom: 6 },
    answer: { fontSize: 13, color: '#8E8E93', lineHeight: 18 },

    reportBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 15 },
    reportText: { color: '#FF3B30', fontWeight: '600', fontSize: 15 }
});
