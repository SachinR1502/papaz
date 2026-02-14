import { useLanguage } from '@/context/LanguageContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SettingsScreen() {
    const router = useRouter();
    const { language, setLanguage, t } = useLanguage();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const colors = {
        background: isDark ? '#000000' : '#FFFFFF',
        card: isDark ? '#1C1C1E' : '#FFFFFF',
        text: isDark ? '#FFFFFF' : '#1A1A1A',
        subText: isDark ? '#A1A1A6' : '#8E8E93',
        border: isDark ? '#2C2C2E' : '#F0F0F0',
        sectionTitle: isDark ? '#8E8E93' : '#8E8E93',
        iconBg: isDark ? '#2C2C2E' : '#F8F9FE',
    };

    const [dataUsage, setDataUsage] = useState(false);

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
                <TouchableOpacity onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: colors.iconBg }]}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>{t('app_preferences')}</Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <Animated.View style={{ opacity: fadeAnim }}>
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: colors.sectionTitle }]}>{t('regional')}</Text>
                        <View style={[styles.card, { backgroundColor: colors.card }]}>
                            <TouchableOpacity
                                style={[styles.row, { borderBottomWidth: 1, borderBottomColor: colors.border }]}
                                onPress={() => {
                                    router.push('/(technician)/profile/language' as any);
                                }}
                            >
                                <View style={[styles.iconBg, { backgroundColor: colors.iconBg }]}>
                                    <Ionicons name="language-outline" size={22} color={colors.text} />
                                </View>
                                <View style={styles.rowContent}>
                                    <Text style={[styles.rowLabel, { color: colors.text }]}>{t('language')}</Text>
                                    <Text style={[styles.rowSub, { color: colors.subText }]}>
                                        {{
                                            'en': 'English',
                                            'hi': 'Hindi (हिंदी)',
                                            'mr': 'Marathi (मराठी)',
                                            'kn': 'Kannada (ಕನ್ನಡ)',
                                            'ta': 'Tamil (தமிழ்)',
                                            'te': 'Telugu (తెలుగు)',
                                            'ml': 'Malayalam (മലയാളം)',
                                            'gu': 'Gujarati (ગુજરાતી)',
                                            'bn': 'Bengali (বাংলা)',
                                            'pa': 'Punjabi (ਪੰਜਾਬੀ)'
                                        }[language] || 'English'}
                                    </Text>
                                </View>
                                <Ionicons name="chevron-forward" size={18} color={colors.subText} />
                            </TouchableOpacity>

                            <View style={styles.row}>
                                <View style={[styles.iconBg, { backgroundColor: colors.iconBg }]}>
                                    <Ionicons name="locate-outline" size={22} color={colors.text} />
                                </View>
                                <View style={styles.rowContent}>
                                    <Text style={[styles.rowLabel, { color: colors.text }]}>{t('distances_unit')}</Text>
                                    <Text style={[styles.rowSub, { color: colors.subText }]}>{t('kilometers_km')}</Text>
                                </View>
                                <Ionicons name="chevron-forward" size={18} color={colors.subText} />
                            </View>
                        </View>
                    </View>

                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: colors.sectionTitle }]}>{t('performance')}</Text>
                        <View style={[styles.card, { backgroundColor: colors.card }]}>
                            <View style={styles.row}>
                                <View style={[styles.iconBg, { backgroundColor: colors.iconBg }]}>
                                    <Ionicons name="wifi-outline" size={22} color={colors.text} />
                                </View>
                                <View style={styles.rowContent}>
                                    <Text style={[styles.rowLabel, { color: colors.text }]}>{t('low_data_mode')}</Text>
                                    <Text style={[styles.rowSub, { color: colors.subText }]}>{t('save_data_desc')}</Text>
                                </View>
                                <Switch
                                    value={dataUsage}
                                    onValueChange={setDataUsage}
                                    trackColor={{ false: '#D1D1D6', true: '#34C759' }}
                                    thumbColor="#FFF"
                                />
                            </View>
                        </View>
                    </View>

                    <View style={styles.infoSection}>
                        <Ionicons name="cube-outline" size={40} color={colors.subText} />
                        <Text style={[styles.infoTitle, { color: colors.text }]}>PAPAZ Technician</Text>
                        <Text style={[styles.infoSub, { color: colors.subText }]}>{t('version')} 2.4.0 (Build 502)</Text>
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
    content: { paddingVertical: 20 },
    section: { paddingHorizontal: 20, marginTop: 20 },
    sectionTitle: { fontSize: 11, fontWeight: '900', letterSpacing: 1, marginBottom: 15, paddingLeft: 5 },
    card: { borderRadius: 24, overflow: 'hidden' },
    row: { flexDirection: 'row', alignItems: 'center', padding: 18 },
    iconBg: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
    rowContent: { flex: 1 },
    rowLabel: { fontSize: 16, fontWeight: '600' },
    rowSub: { fontSize: 12, marginTop: 2 },
    infoSection: { alignItems: 'center', marginTop: 50 },
    infoTitle: { fontSize: 16, fontWeight: 'bold', marginTop: 15 },
    infoSub: { fontSize: 13, marginTop: 5 },
});
