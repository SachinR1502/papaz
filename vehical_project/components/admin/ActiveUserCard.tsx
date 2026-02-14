import { StatusBadge } from '@/components/ui/StatusBadge';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ActiveUserCardProps {
    user: any;
    onPress: () => void;
}

export const ActiveUserCard = ({ user, onPress }: ActiveUserCardProps) => {
    const colorScheme = useColorScheme();
    const theme = colorScheme ?? 'light';
    const colors = Colors[theme];
    const isDark = theme === 'dark';

    const typeColors: any = {
        technician: { border: '#007AFF', bg: '#007AFF15', text: '#007AFF', icon: 'construct' },
        supplier: { border: '#AF52DE', bg: '#AF52DE15', text: '#AF52DE', icon: 'business' },
        customer: { border: '#34C759', bg: '#34C75915', text: '#34C759', icon: 'person' }
    };

    const config = typeColors[user.type] || typeColors.customer;

    return (
        <TouchableOpacity
            style={[styles.card, { backgroundColor: colors.card, shadowColor: colors.shadow, borderLeftColor: config.border, borderLeftWidth: 4 }]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <View style={styles.cardHeader}>
                <View style={[styles.avatar, { backgroundColor: isDark ? config.bg : config.bg }]}>
                    <Text style={[styles.avatarText, { color: config.text }]}>{user.name[0]}</Text>
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={[styles.name, { color: colors.text }]}>{user.name}</Text>
                    <Text style={[styles.type, { color: config.text }]}>{user.type.toUpperCase()}</Text>
                </View>
                <StatusBadge status="active" size="small" showIcon={false} />
            </View>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <View style={styles.cardBody}>
                <View style={styles.infoRow}>
                    <Ionicons name={config.icon} size={16} color={colors.icon} />
                    <Text style={[styles.infoText, { color: colors.text }]}>{user.businessName || 'Individual'}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Ionicons name="location" size={16} color={colors.icon} />
                    <Text style={[styles.infoText, { color: colors.text }]}>{user.location}</Text>
                </View>
            </View>
            <View style={[styles.manageBtn, { backgroundColor: isDark ? colors.background : '#F8F9FA' }]}>
                <Text style={[styles.manageText, { color: config.border }]}>View & Manage</Text>
                <Ionicons name="chevron-forward" size={16} color={config.border} />
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: { borderRadius: 20, padding: 16, marginBottom: 16, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
    cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    avatar: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
    avatarText: { fontSize: 18, fontWeight: 'bold' },
    name: { fontSize: 16, fontWeight: 'bold' },
    type: { fontSize: 11, fontWeight: '700', marginTop: 2, letterSpacing: 0.5 },
    divider: { height: 1, marginVertical: 12 },
    cardBody: { marginBottom: 16 },
    infoRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
    infoText: { fontSize: 13, fontWeight: '500' },
    manageBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: 12, gap: 4 },
    manageText: { fontSize: 13, fontWeight: '700' }
});
