import { useColorScheme } from '@/hooks/use-color-scheme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';

export type StatusType = 'pending' | 'accepted' | 'arrived' | 'diagnosing' | 'quote_pending' | 'parts_required' | 'parts_ordered' | 'in_progress' | 'billing_pending' | 'vehicle_delivered' | 'payment_pending_cash' | 'completed' | 'cancelled';

interface StatusConfig {
    color: string;
    bg: string;
    icon: string;
    label: string;
}

const getStatusConfig = (isDark: boolean): Record<string, StatusConfig> => ({
    pending: {
        color: isDark ? '#FFA726' : '#FF9500',
        bg: isDark ? '#3E2723' : '#FFF3E0',
        icon: 'clock-outline',
        label: 'Requested'
    },
    inquiry: {
        color: isDark ? '#42A5F5' : '#2196F3',
        bg: isDark ? '#0D47A1' : '#E3F2FD',
        icon: 'help-circle-outline',
        label: 'Inquiry'
    },
    pending_pickup: {
        color: isDark ? '#FFA726' : '#FF9500',
        bg: isDark ? '#3E2723' : '#FFF3E0',
        icon: 'moped-electric',
        label: 'Awaiting Pickup'
    },
    accepted: {
        color: isDark ? '#7C4DFF' : '#5856D6',
        bg: isDark ? '#311B92' : '#ECECFF',
        icon: 'check-circle-outline',
        label: 'Accepted'
    },
    confirmed: {
        color: isDark ? '#6B4EE0' : '#5856D6',
        bg: isDark ? '#311B92' : '#ECECFF',
        icon: 'clipboard-check-outline',
        label: 'Confirmed'
    },
    quoted: {
        color: isDark ? '#26A69A' : '#00897B',
        bg: isDark ? '#004D40' : '#E0F2F1',
        icon: 'file-document-edit-outline',
        label: 'Quoted'
    },
    arrived: {
        color: isDark ? '#448AFF' : '#007AFF',
        bg: isDark ? '#0D47A1' : '#E3F2FD',
        icon: 'map-marker-outline',
        label: 'Tech Arrived'
    },
    diagnosing: {
        color: isDark ? '#E040FB' : '#AF52DE',
        bg: isDark ? '#4A148C' : '#F3E5F5',
        icon: 'magnify',
        label: 'System Check'
    },
    quote_pending: {
        color: isDark ? '#FFA726' : '#FF9500',
        bg: isDark ? '#3E2723' : '#FFF3E0',
        icon: 'file-document-outline',
        label: 'Quote Ready'
    },
    parts_required: {
        color: isDark ? '#FFA726' : '#FF9500',
        bg: isDark ? '#3E2723' : '#FFF3E0',
        icon: 'tools',
        label: 'Sourcing Parts'
    },
    parts_ordered: {
        color: isDark ? '#7C4DFF' : '#5856D6',
        bg: isDark ? '#311B92' : '#ECECFF',
        icon: 'truck-delivery-outline',
        label: 'Parts Ordered'
    },
    in_progress: {
        color: isDark ? '#448AFF' : '#007AFF',
        bg: isDark ? '#0D47A1' : '#E3F2FD',
        icon: 'wrench-outline',
        label: 'Repairing'
    },
    billing_pending: {
        color: isDark ? '#FFA726' : '#FF9500',
        bg: isDark ? '#3E2723' : '#FFF3E0',
        icon: 'file-document-outline',
        label: 'Payment Due'
    },
    vehicle_delivered: {
        color: isDark ? '#FFA726' : '#FF9500',
        bg: isDark ? '#3E2723' : '#FFF3E0',
        icon: 'car-key',
        label: 'Vehicle Returned'
    },
    payment_pending_cash: {
        color: isDark ? '#FFA726' : '#FF9500',
        bg: isDark ? '#3E2723' : '#FFF3E0',
        icon: 'cash-clock',
        label: 'Cash Pending'
    },
    packed: {
        color: isDark ? '#7C4DFF' : '#5856D6',
        bg: isDark ? '#311B92' : '#ECECFF',
        icon: 'package-variant-closed',
        label: 'Packed'
    },
    out_for_delivery: {
        color: isDark ? '#448AFF' : '#007AFF',
        bg: isDark ? '#0D47A1' : '#E3F2FD',
        icon: 'moped',
        label: 'Out for Delivery'
    },
    shipped: {
        color: isDark ? '#448AFF' : '#007AFF',
        bg: isDark ? '#0D47A1' : '#E3F2FD',
        icon: 'truck-delivery',
        label: 'Shipped'
    },
    delivered: {
        color: isDark ? '#69F0AE' : '#34C759',
        bg: isDark ? '#1B5E20' : '#E8F5E9',
        icon: 'check-decagram',
        label: 'Delivered'
    },
    rejected: {
        color: isDark ? '#FF5252' : '#FF3B30',
        bg: isDark ? '#B71C1C' : '#FFEBEE',
        icon: 'close-circle-outline',
        label: 'Rejected'
    },
    completed: {
        color: isDark ? '#69F0AE' : '#34C759',
        bg: isDark ? '#1B5E20' : '#E8F5E9',
        icon: 'checkbox-marked-circle-outline',
        label: 'Service Done'
    },
    cancelled: {
        color: isDark ? '#FF5252' : '#FF3B30',
        bg: isDark ? '#B71C1C' : '#FFEBEE',
        icon: 'close-circle-outline',
        label: 'Cancelled'
    },
});

interface StatusBadgeProps {
    status: string;
    showIcon?: boolean;
    size?: 'small' | 'medium' | 'large';
    style?: ViewStyle;
}

export function StatusBadge({ status, showIcon = true, size = 'small', style }: StatusBadgeProps) {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    // Get colors for current theme
    const statusConfigMap = getStatusConfig(isDark);
    const config = statusConfigMap[status] || statusConfigMap.pending;

    // Scale sizes
    const paddingHorizontal = size === 'small' ? 8 : size === 'medium' ? 12 : 16;
    const paddingVertical = size === 'small' ? 4 : size === 'medium' ? 6 : 8;
    const fontSize = size === 'small' ? 11 : size === 'medium' ? 13 : 15;
    const iconSize = size === 'small' ? 14 : size === 'medium' ? 16 : 20;
    const borderRadius = size === 'small' ? 8 : 12;

    return (
        <View style={[
            styles.container,
            { backgroundColor: config.bg, paddingHorizontal, paddingVertical, borderRadius },
            style
        ]}>
            {showIcon && (
                <MaterialCommunityIcons
                    name={config.icon as any}
                    size={iconSize}
                    color={config.color}
                    style={{ marginRight: 6 }}
                />
            )}
            <Text style={[styles.text, { color: config.color, fontSize }]}>
                {config.label.toUpperCase()}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
    },
    text: {
        fontWeight: '700',
        fontFamily: 'NotoSans-Bold',
    }
});

// Helper if you just want the color for something else
export function getStatusColor(status: string) {
    return (getStatusConfig(false)[status] || getStatusConfig(false).pending).color;
}
