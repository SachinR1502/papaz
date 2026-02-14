import { NotificationItem } from '@/components/ui/NotificationItem';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { supplierService } from '@/services/supplierService';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SupplierNotificationsScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const theme = colorScheme ?? 'light';
    const colors = Colors[theme];
    const isDark = theme === 'dark';
    const [refreshing, setRefreshing] = useState(false);

    const [notifications, setNotifications] = useState<any[]>([]);

    useEffect(() => {
        loadNotifications();
    }, []);

    const loadNotifications = async () => {
        try {
            const data = await supplierService.getNotifications();
            setNotifications(data || []);
        } catch (e) {
            console.log('Failed to load notifications');
        }
    };

    const markAsRead = async (id: string) => {
        try {
            await supplierService.markNotificationRead(id);
            setNotifications(prev => prev.map(n => (n._id === id || n.id === id) ? { ...n, read: true } : n));
        } catch (e) {
            console.log('Failed to mark notification as read');
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadNotifications();
        setRefreshing(false);
    };

    const clearAll = async () => {
        try {
            await supplierService.clearAllNotifications();
            setNotifications([]);
        } catch (e) {
            console.log('Failed to clear notifications');
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header */}
            <View style={[styles.header, { borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace('/(supplier)/(tabs)' as any)} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Notifications</Text>
                <TouchableOpacity onPress={clearAll}>
                    <Text style={{ color: colors.primary, fontFamily: 'NotoSans-Bold', fontSize: 14 }}>Clear</Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={notifications}
                keyExtractor={item => item._id || item.id}
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
                            id: item._id || item.id,
                            title: item.title,
                            body: item.body,
                            type: item.type,
                            timestamp: item.createdAt || item.timestamp,
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
    container: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1 },
    headerTitle: { fontSize: 18, fontFamily: 'NotoSans-Bold' },
    backButton: { padding: 4 },
    emptyContainer: { alignItems: 'center', justifyContent: 'center', marginTop: 100, gap: 16 },
    emptyText: { fontSize: 16, fontFamily: 'NotoSans-Regular' }
});
