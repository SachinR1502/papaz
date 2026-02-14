import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface NotificationItemProps {
    notification: {
        id: string;
        title: string;
        body: string;
        type: string;
        timestamp: string;
        read: boolean;
    };
    onPress: (id: string) => void;
}

export const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onPress }) => {
    const colorScheme = useColorScheme();
    const theme = colorScheme ?? 'light';
    const colors = Colors[theme];
    const isDark = theme === 'dark';

    const getIcon = (type: string): any => {
        switch (type) {
            case 'service': return 'construct-outline';
            case 'payment': return 'wallet-outline';
            case 'order': return 'cart-outline';
            case 'promo': return 'gift-outline';
            default: return 'notifications-outline';
        }
    };

    const formatTime = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        if (days === 1) return 'Yesterday';
        if (days < 7) return `${days}d ago`;
        return date.toLocaleDateString();
    };

    return (
        <TouchableOpacity
            style={[
                styles.card,
                {
                    backgroundColor: notification.read ? colors.card : (isDark ? '#1C1C1E' : '#E5F1FF'),
                    borderColor: colors.border
                }
            ]}
            onPress={() => onPress(notification.id)}
            activeOpacity={0.7}
        >
            <View style={[styles.iconContainer, { backgroundColor: isDark ? '#2C2C2E' : '#FFFFFF' }]}>
                <Ionicons name={getIcon(notification.type)} size={22} color={colors.primary} />
            </View>
            <View style={styles.content}>
                <View style={styles.row}>
                    <Text
                        style={[styles.title, { color: colors.text, fontWeight: notification.read ? '600' : 'bold' }]}
                        numberOfLines={1}
                    >
                        {notification.title}
                    </Text>
                    <Text style={[styles.time, { color: colors.icon }]}>
                        {formatTime(notification.timestamp)}
                    </Text>
                </View>
                <Text style={[styles.body, { color: colors.icon }]} numberOfLines={2}>
                    {notification.body}
                </Text>
            </View>
            {!notification.read && (
                <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        padding: 12,
        borderRadius: 16,
        marginBottom: 12,
        borderWidth: 1,
        alignItems: 'center',
        position: 'relative'
    },
    iconContainer: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2
    },
    content: {
        flex: 1,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4
    },
    title: {
        fontSize: 15,
        flex: 1,
        marginRight: 8
    },
    time: {
        fontSize: 10,
        fontFamily: 'NotoSans-Regular'
    },
    body: {
        fontSize: 13,
        lineHeight: 18,
        fontFamily: 'NotoSans-Regular'
    },
    unreadDot: {
        position: 'absolute',
        top: 12,
        right: 12,
        width: 8,
        height: 8,
        borderRadius: 4
    }
});
