import { Colors } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { useNotifications } from '@/context/NotificationContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useGreeting } from '@/utils/useGreeting';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React from 'react';
import { Alert, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export const CustomerHeader = () => {
    const router = useRouter();
    const { user, logout } = useAuth();
    const { hasUnread } = useNotifications();
    const { t } = useLanguage();
    const getGreeting = useGreeting();
    const colorScheme = useColorScheme();
    const theme = colorScheme ?? 'light';
    const colors = Colors[theme];
    const isDark = theme === 'dark';

    const handleLogout = async () => {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        try {
            await logout();
        } catch (e) {
            console.error('Logout error:', e);
        }
    };

    const confirmLogout = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        Alert.alert(
            t('logout'),
            t('logout_confirm'),
            [
                { text: t('cancel'), style: "cancel" },
                { text: t('logout'), style: "destructive", onPress: handleLogout }
            ]
        );
    };

    return (
        <BlurView
            intensity={Platform.OS === 'ios' ? 80 : 0}
            tint={isDark ? 'dark' : 'light'}
            style={[
                styles.headerAbsolute,
                { backgroundColor: isDark ? '#121212' : '#FFFFFF' }
            ]}
        >
            <SafeAreaView edges={['top']} style={styles.headerSafeArea}>
                <View style={styles.headerContent}>
                    <View style={styles.userProfile}>
                        <TouchableOpacity
                            style={[styles.avatarContainer, { borderColor: colors.card }]}
                            onPress={() => router.push('/(customer)/(tabs)/profile')}
                        >
                            <Image
                                source={{ uri: user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop' }}
                                style={styles.avatar}
                            />
                            <View style={styles.onlineStatus} />
                        </TouchableOpacity>
                        <View style={styles.greetingContainer}>
                            <Text style={[styles.greetingText, { color: colors.icon }]}>{getGreeting()}</Text>
                            <Text style={[styles.userNameText, { color: colors.text }]}>
                                {user?.profile?.fullName || t('guest_user')}
                            </Text>
                        </View>
                    </View>
                    <View style={styles.headerActions}>
                        <TouchableOpacity
                            style={[styles.headerBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)', borderColor: 'transparent' }]}
                            onPress={() => {
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                router.push('/(customer)/notifications');
                            }}
                        >
                            {hasUnread && <View style={styles.notificationDot} />}
                            <Ionicons name="notifications-outline" size={24} color={colors.text} />
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={confirmLogout}
                            style={[styles.logoutBtn, { backgroundColor: isDark ? '#4A0000' : '#FFF0F0' }]}
                        >
                            <Ionicons name="log-out-outline" size={24} color="#FF3B30" />
                        </TouchableOpacity>
                    </View>
                </View>
            </SafeAreaView>
        </BlurView>
    );
};

const styles = StyleSheet.create({
    headerAbsolute: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 100 },
    headerSafeArea: {},
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 10
    },
    userProfile: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    avatarContainer: { position: 'relative', borderWidth: 2, borderRadius: 26, padding: 2 },
    avatar: { width: 44, height: 44, borderRadius: 22 },
    onlineStatus: {
        position: 'absolute',
        bottom: 2,
        right: 2,
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#34C759',
        borderWidth: 2,
        borderColor: '#FFF'
    },
    greetingContainer: {},
    greetingText: { fontSize: 14, fontWeight: '500', fontFamily: 'NotoSans-Regular' },
    userNameText: { fontSize: 18, fontWeight: '800', fontFamily: 'NotoSans-Black' },
    headerActions: { flexDirection: 'row', gap: 10 },
    headerBtn: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', position: 'relative', borderWidth: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
    notificationDot: { position: 'absolute', top: 12, right: 14, width: 8, height: 8, borderRadius: 4, backgroundColor: '#FF3B30', borderWidth: 1.5, borderColor: '#FFF' },
    logoutBtn: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
});
