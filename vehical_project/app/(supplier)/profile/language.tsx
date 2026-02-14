
import { Colors } from '@/constants/theme';
import { Language } from '@/constants/translations';
import { useLanguage } from '@/context/LanguageContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const LANGUAGES: { id: Language; label: string; sub: string }[] = [
    { id: 'en', label: 'English', sub: 'Primary' },
    { id: 'hi', label: 'Hindi (हिंदी)', sub: 'National' },
    { id: 'mr', label: 'Marathi (मराठी)', sub: 'Regional' },
    { id: 'kn', label: 'Kannada (ಕನ್ನಡ)', sub: 'South' },
    { id: 'ta', label: 'Tamil (தமிழ்)', sub: 'South' },
    { id: 'te', label: 'Telugu (తెలుగు)', sub: 'South' },
    { id: 'ml', label: 'Malayalam (മലയാളം)', sub: 'South' },
    { id: 'gu', label: 'Gujarati (ગુજરાતી)', sub: 'West' },
    { id: 'bn', label: 'Bengali (বাংলা)', sub: 'East' },
    { id: 'pa', label: 'Punjabi (ਪੰਜਾਬੀ)', sub: 'North' },
];

export default function LanguageScreen() {
    const router = useRouter();
    const { language, setLanguage, t } = useLanguage();
    const colorScheme = useColorScheme();
    const theme = colorScheme ?? 'light';
    const colors = Colors[theme];
    const isDark = theme === 'dark';

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
            <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>{t('select_language')}</Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {LANGUAGES.map((lang) => (
                    <TouchableOpacity
                        key={lang.id}
                        style={[
                            styles.langItem,
                            { backgroundColor: colors.card, borderColor: colors.border },
                            language === lang.id && { borderColor: colors.primary, backgroundColor: isDark ? colors.primary + '15' : '#F0F7FF' }
                        ]}
                        onPress={() => setLanguage(lang.id)}
                    >
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 15 }}>
                            <View style={[styles.radioCircle, { borderColor: colors.border }, language === lang.id && { borderColor: colors.primary }]}>
                                {language === lang.id && <View style={[styles.radioDot, { backgroundColor: colors.primary }]} />}
                            </View>
                            <View>
                                <Text style={[styles.langLabel, { color: colors.text }]}>{lang.label}</Text>
                                <Text style={[styles.langSub, { color: colors.icon }]}>{lang.sub}</Text>
                            </View>
                        </View>
                        {language === lang.id && (
                            <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
                        )}
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFFFFF' },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: '#FFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    headerTitle: { fontSize: 18, fontFamily: 'NotoSans-Bold', color: '#1A1A1A' },
    backBtn: { padding: 4 },
    content: { padding: 20 },
    langItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 20,
        backgroundColor: '#F8F9FE',
        borderRadius: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#E5E5EA',
    },
    activeLangItem: {
        borderColor: '#007AFF',
        backgroundColor: '#F0F7FF',
    },
    radioCircle: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#C7C7CC',
        justifyContent: 'center',
        alignItems: 'center',
    },
    radioActive: {
        borderColor: '#007AFF',
    },
    radioDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#007AFF',
    },
    langLabel: { fontSize: 16, fontFamily: 'NotoSans-Bold', color: '#1A1A1A' },
    langSub: { fontSize: 12, fontFamily: 'NotoSans-Regular', color: '#8E8E93', marginTop: 2 },
});
