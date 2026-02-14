import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface InfoRowProps {
    icon: any;
    color: string;
    label: string;
    value: string;
    colors: any;
}

export const InfoRow = ({ icon, color, label, value, colors }: InfoRowProps) => {
    return (
        <View style={styles.infoRow}>
            <View style={[styles.infoIcon, { backgroundColor: color + '15' }]}>
                <Ionicons name={icon} size={20} color={color} />
            </View>
            <View style={{ flex: 1 }}>
                <Text style={[styles.infoLabel, { color: colors.icon }]}>{label}</Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>{value}</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    infoRow: { flexDirection: 'row', alignItems: 'center', gap: 16, paddingVertical: 4 },
    infoIcon: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    infoLabel: { fontSize: 12, fontWeight: '500' },
    infoValue: { fontSize: 15, fontWeight: '600', marginTop: 2 },
});
