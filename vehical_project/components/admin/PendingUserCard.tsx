import { StatusBadge } from '@/components/ui/StatusBadge';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { PendingUser } from '@/services/adminService';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface PendingUserCardProps {
    user: PendingUser;
    onPress: () => void;
    onApprove: (id: string, type: 'technician' | 'supplier') => void;
    onReject: (id: string, type: 'technician' | 'supplier') => void;
    processingId?: string | null;
}

export const PendingUserCard = ({
    user,
    onPress,
    onApprove,
    onReject,
    processingId
}: PendingUserCardProps) => {
    const colorScheme = useColorScheme();
    const theme = colorScheme ?? 'light';
    const colors = Colors[theme];
    const isDark = theme === 'dark';

    return (
        <TouchableOpacity
            style={[styles.card, { backgroundColor: colors.card, shadowColor: colors.shadow, borderLeftColor: '#007AFF', borderLeftWidth: 4 }]}
            onPress={onPress}
        >
            <View style={styles.cardHeader}>
                <View style={[styles.avatar, { backgroundColor: isDark ? '#F0F7FF20' : '#F0F7FF' }]}>
                    <Text style={styles.avatarText}>{user.name[0]}</Text>
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={[styles.name, { color: colors.text }]}>{user.name}</Text>
                    <Text style={[styles.type, { color: colors.icon }]}>{user.type.toUpperCase()}</Text>
                </View>
                <StatusBadge status="pending" size="small" showIcon={false} />
            </View>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            <View style={styles.cardBody}>
                <View style={styles.infoRow}>
                    <Ionicons name="business" size={16} color={colors.icon} />
                    <Text style={[styles.infoText, { color: colors.text }]}>{user.businessName}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Ionicons name="location" size={16} color={colors.icon} />
                    <Text style={[styles.infoText, { color: colors.text }]}>{user.location}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Ionicons name="time" size={16} color={colors.icon} />
                    <Text style={[styles.infoText, { color: colors.text }]}>Applied: {user.appliedDate}</Text>
                </View>
            </View>

            <View style={styles.cardFooter}>
                <TouchableOpacity
                    style={[styles.actionBtnReject, { backgroundColor: isDark ? '#FF3B3020' : '#FFF0F0' }]}
                    onPress={() => onReject(user.id, user.type)}
                    disabled={!!processingId}
                >
                    {processingId === user.id ? <ActivityIndicator size="small" color="#FF3B30" /> : <Text style={styles.rejectText}>Reject</Text>}
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.actionBtnApprove}
                    onPress={() => onApprove(user.id, user.type)}
                    disabled={!!processingId}
                >
                    {processingId === user.id ? <ActivityIndicator size="small" color="#FFF" /> : <Text style={styles.approveText}>Approve</Text>}
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: { borderRadius: 20, padding: 16, marginBottom: 16, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
    cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    avatar: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
    avatarText: { fontSize: 18, fontWeight: 'bold', color: '#007AFF' },
    name: { fontSize: 16, fontWeight: 'bold' },
    type: { fontSize: 11, fontWeight: '700', marginTop: 2, letterSpacing: 0.5 },
    divider: { height: 1, marginVertical: 12 },
    cardBody: { marginBottom: 16 },
    infoRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
    infoText: { fontSize: 13, fontWeight: '500' },
    cardFooter: { flexDirection: 'row', gap: 12 },
    actionBtnReject: { flex: 1, paddingVertical: 10, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    rejectText: { color: '#FF3B30', fontWeight: 'bold', fontSize: 13 },
    actionBtnApprove: { flex: 1, paddingVertical: 10, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: '#007AFF', shadowColor: '#007AFF', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
    approveText: { color: '#FFF', fontWeight: 'bold', fontSize: 13 }
});
