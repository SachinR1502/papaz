import { StatusBadge } from '@/components/ui/StatusBadge';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { AdminJob } from '@/services/adminService';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface JobCardProps {
    job: AdminJob;
    onPress: () => void;
}

export const JobCard = ({ job, onPress }: JobCardProps) => {
    const colorScheme = useColorScheme();
    const theme = colorScheme ?? 'light';
    const colors = Colors[theme];

    return (
        <TouchableOpacity
            style={[styles.card, { backgroundColor: colors.card, shadowColor: colors.shadow }]}
            onPress={onPress}
        >
            <View style={styles.row}>
                <Text style={[styles.jobId, { color: colors.text }]}>#{job.id.slice(-6).toUpperCase()}</Text>
                <StatusBadge status={job.status} size="small" showIcon={false} />
            </View>

            <Text style={[styles.jobType, { color: colors.icon }]}>{job.vehicleModel}</Text>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            <View style={styles.row}>
                <View style={styles.userRow}>
                    <Ionicons name="person" size={14} color={colors.icon} />
                    <Text style={[styles.userName, { color: colors.text }]}>{job.customer}</Text>
                </View>
                <Ionicons name="arrow-forward" size={14} color={colors.border} />
                <View style={styles.userRow}>
                    <Ionicons name="construct" size={14} color={colors.icon} />
                    <Text style={[styles.userName, { color: colors.text }]}>{job.technician}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: { borderRadius: 20, padding: 16, marginBottom: 12, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
    row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    jobId: { fontSize: 16, fontWeight: 'bold' },
    jobType: { fontSize: 14, marginTop: 4, fontWeight: '500' },
    divider: { height: 1, marginVertical: 12 },
    userRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    userName: { fontSize: 13, fontWeight: '600' }
});
