import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { Animated, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LegalScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const colors = {
        background: isDark ? '#000000' : '#F8F9FB',
        card: isDark ? '#1C1C1E' : '#FFFFFF',
        text: isDark ? '#FFFFFF' : '#1A1A1A',
        subText: isDark ? '#A1A1A6' : '#8E8E93',
        border: isDark ? '#2C2C2E' : '#F0F0F0',
        iconBg: isDark ? '#2C2C2E' : '#F8F9FE',
        infoBox: isDark ? '#1C1C1E' : '#F0F7FF',
        infoText: isDark ? '#0A84FF' : '#007AFF', // Adjusted for dark mode readability
    };

    const legalItems = [
        { id: 'tos', label: 'Terms of Service', icon: 'document-text-outline' },
        { id: 'privacy', label: 'Privacy Policy', icon: 'shield-outline' },
        { id: 'licensing', label: 'Software Licenses', icon: 'code-slash-outline' },
        { id: 'safety', label: 'Workshop Safety Guidelines', icon: 'alert-circle-outline' },
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
                <Text style={[styles.headerTitle, { color: colors.text }]}>Legal & Compliance</Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <Animated.View style={{ opacity: fadeAnim }}>
                    <View style={[styles.heroSection, { backgroundColor: colors.card }]}>
                        <Text style={[styles.heroTitle, { color: colors.text }]}>Transparency & Compliance</Text>
                        <Text style={[styles.heroSub, { color: colors.subText }]}>Review the legal framework that governs our professional partnership.</Text>
                    </View>

                    <View style={styles.section}>
                        <View style={[styles.card, { backgroundColor: colors.card }]}>
                            {legalItems.map((item, idx) => (
                                <TouchableOpacity
                                    key={item.id}
                                    style={[styles.row, idx !== legalItems.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border }]}
                                >
                                    <View style={[styles.iconBg, { backgroundColor: colors.iconBg }]}>
                                        <Ionicons name={item.icon as any} size={20} color={colors.text} />
                                    </View>
                                    <Text style={[styles.label, { color: colors.text }]}>{item.label}</Text>
                                    <Ionicons name="chevron-forward" size={18} color={colors.subText} />
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    <View style={[styles.infoBox, { backgroundColor: colors.infoBox }]}>
                        <Ionicons name="information-circle-outline" size={20} color={colors.infoText} />
                        <Text style={[styles.infoText, { color: colors.infoText }]}>
                            By using the PAPAZ platform, you agree to our professional code of conduct and service quality standards.
                        </Text>
                    </View>

                    <View style={styles.footer}>
                        <Text style={[styles.copyright, { color: colors.subText }]}>© 2026 PAPAZ Technologies. All rights reserved.</Text>
                    </View>
                    <View style={{ height: 40 }} />
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
    heroSection: { padding: 30, marginBottom: 20 },
    heroTitle: { fontSize: 22, fontWeight: 'bold' },
    heroSub: { fontSize: 14, marginTop: 10, lineHeight: 22 },
    section: { paddingHorizontal: 20 },
    card: { borderRadius: 24, paddingHorizontal: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.02, shadowRadius: 10, elevation: 1 },
    row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 20 },
    iconBg: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
    label: { flex: 1, fontSize: 15, fontWeight: 'bold' },
    infoBox: { flexDirection: 'row', gap: 12, margin: 20, padding: 20, borderRadius: 20 },
    infoText: { flex: 1, fontSize: 13, lineHeight: 20, fontWeight: '500' },
    footer: { marginTop: 40, alignItems: 'center' },
    copyright: { fontSize: 12, fontWeight: '500' },
});
