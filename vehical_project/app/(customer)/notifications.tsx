import { NotificationItem } from '@/components/ui/NotificationItem';
import { Colors } from '@/constants/theme';
import { useNotifications } from '@/context/NotificationContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function NotificationsScreen() {
    const router = useRouter();
    const { notifications, refreshNotifications, markAsRead, clearAll } = useNotifications();
    const colorScheme = useColorScheme();
    const theme = colorScheme ?? 'light';
    const colors = Colors[theme];
    const isDark = theme === 'dark';
    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = async () => {
        setRefreshing(true);
        await refreshNotifications();
        setRefreshing(false);
    };

    const getIcon = (type: string): any => {
        switch (type) {
            case 'service': return 'hammer-outline';
            case 'order': return 'cart-outline';
            case 'payment': return 'card-outline';
            case 'system': return 'information-circle-outline';
            default: return 'notifications-outline';
        }
    };

    const formatTime = (isoString: string) => {
        if (!isoString) return '';
        const date = new Date(isoString);
        const now = new Date();
        const diff = now.getTime() - date.getTime();

        if (diff < 60000) return 'Just now';
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
        return date.toLocaleDateString();
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header */}
            <View style={[styles.header, { borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace('/(customer)/(tabs)')} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Notifications</Text>
                <TouchableOpacity onPress={clearAll}>
                    <Text style={{ color: colors.primary, fontFamily: 'NotoSans-Bold', fontSize: 14 }}>Clear</Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={notifications}
                keyExtractor={item => item.id || item._id}
                contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="notifications-off-outline" size={64} color={colors.icon} />
                        <Text style={[styles.emptyText, { color: colors.icon }]}>No notifications yet</Text>
                    </View>
                }
                renderItem={({ item }) => (
                    <NotificationItem
                        notification={{
                            id: item.id || item._id,
                            title: item.title,
                            body: item.body,
                            type: item.type,
                            timestamp: item.timestamp || item.createdAt,
                            read: item.read
                        }}
                        onPress={markAsRead}
                    />
                )}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
    headerTitle: {
        fontSize: 18,
        fontFamily: 'NotoSans-Bold',
    },
    backButton: {
        padding: 4,
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
        borderWidth: 1,
        gap: 12,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    cardTitle: {
        fontSize: 16,
        fontFamily: 'NotoSans-Bold',
        flex: 1,
    },
    cardBody: {
        fontSize: 13,
        marginTop: 4,
        lineHeight: 18,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        position: 'absolute',
        top: 16,
        right: 16,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 100,
        gap: 16,
    },
    emptyText: {
        fontSize: 16,
        fontFamily: 'NotoSans-Regular',
    }
});
