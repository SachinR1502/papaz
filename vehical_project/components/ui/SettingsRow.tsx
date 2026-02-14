import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface SettingsRowProps {
    icon: any;
    iconColor: string;
    iconBg?: string;
    label: string;
    onPress: () => void;
    colors: any;
    rightElement?: React.ReactNode;
}

export const SettingsRow = ({ icon, iconColor, iconBg, label, onPress, colors, rightElement }: SettingsRowProps) => {
    return (
        <TouchableOpacity
            style={styles.row}
            onPress={onPress}
        >
            <View style={styles.rowLeft}>
                <View style={[styles.iconBox, { backgroundColor: iconBg || (iconColor + '15') }]}>
                    <Ionicons name={icon} size={20} color={iconColor} />
                </View>
                <Text style={[styles.rowLabel, { color: colors.text }]}>{label}</Text>
            </View>
            {rightElement || <Ionicons name="chevron-forward" size={20} color={colors.icon} />}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4 },
    rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    iconBox: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
    rowLabel: { fontSize: 15, fontWeight: '500' },
});
