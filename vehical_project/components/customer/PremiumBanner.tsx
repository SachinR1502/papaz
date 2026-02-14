import { useLanguage } from '@/context/LanguageContext';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export const PremiumBanner = () => {
    const router = useRouter();
    const { t } = useLanguage();

    return (
        <TouchableOpacity
            style={styles.premiumBanner}
            onPress={() => {
                Haptics.selectionAsync();
                router.push('/(customer)/vehicle/add');
            }}
        >
            <View style={styles.premiumContent}>
                <View style={styles.premiumBadge}>
                    <Text style={styles.premiumBadgeText}>{t('exclusive_offer')}</Text>
                </View>
                <Text style={styles.premiumTitle}>{t('promo_title')}</Text>
                <Text style={styles.premiumSub}>{t('promo_desc')}</Text>
                <View style={styles.premiumAction}>
                    <Text style={styles.premiumActionText}>{t('book_now')}</Text>
                    <Ionicons name="chevron-forward" size={16} color="#FFF" />
                </View>
            </View>
            <Image
                source={{ uri: 'https://cdn-icons-png.flaticon.com/512/3063/3063822.png' }}
                style={styles.bannerImg}
            />
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    premiumBanner: {
        backgroundColor: '#FFD60A',
        borderRadius: 30,
        padding: 24,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 30,
        overflow: 'hidden',
        shadowColor: '#FFD60A',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 16,
        elevation: 8
    },
    premiumContent: { flex: 1, zIndex: 1 },
    premiumBadge: { backgroundColor: '#1A1A1A', alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, marginBottom: 12 },
    premiumBadgeText: { color: '#FFD60A', fontSize: 10, fontWeight: '800', fontFamily: 'NotoSans-Black' },
    premiumTitle: { fontSize: 24, fontWeight: '800', color: '#1A1A1A', lineHeight: 28, marginBottom: 8, fontFamily: 'NotoSans-Black' },
    premiumSub: { fontSize: 13, color: 'rgba(0,0,0,0.7)', lineHeight: 18, marginBottom: 20, fontWeight: '500', fontFamily: 'NotoSans-Regular' },
    premiumAction: {
        backgroundColor: '#1A1A1A',
        alignSelf: 'flex-start',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 14,
        gap: 8
    },
    premiumActionText: { color: '#FFF', fontSize: 13, fontWeight: '700', fontFamily: 'NotoSans-Bold' },
    bannerImg: { width: 100, height: 100, position: 'absolute', right: -10, bottom: -10, opacity: 0.9 },
});
