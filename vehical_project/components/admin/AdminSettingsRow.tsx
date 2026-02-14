import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface AdminSettingsRowProps {
    icon: React.ReactNode;
    label: string;
    subLabel?: string;
    rightElement?: React.ReactNode;
    onPress?: () => void;
    showChevron?: boolean;
    value?: string;
    isLast?: boolean;
}

export const AdminSettingsRow = ({
    icon,
    label,
    subLabel,
    rightElement,
    onPress,
    showChevron,
    value,
    isLast
}: AdminSettingsRowProps) => {
    const colorScheme = useColorScheme();
    const theme = colorScheme ?? 'light';
    const colors = Colors[theme];

    const Content = (
        <View style={styles.row}>
            <View style={styles.rowInfo}>
                {icon}
                <View>
                    <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
                    {subLabel && <Text style={[styles.subLabel, { color: colors.icon }]}>{subLabel}</Text>}
                </View>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                {value && <Text style={[styles.valueText, { color: colors.icon }]}>{value}</Text>}
                {rightElement}
                {showChevron && <Ionicons name="chevron-forward" size={18} color={colors.icon} />}
            </View>
        </View>
    );

    return (
        <>
            {onPress ? (
                <TouchableOpacity onPress={onPress}>
                    {Content}
                </TouchableOpacity>
            ) : (
                <View>
                    {Content}
                </View>
            )}
            {!isLast && <View style={[styles.divider, { backgroundColor: colors.border }]} />}
        </>
    );
};

const styles = StyleSheet.create({
    row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 12 },
    rowInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    label: { fontSize: 15, fontWeight: '600' },
    subLabel: { fontSize: 12, marginTop: 2 },
    valueText: { fontSize: 14, fontWeight: '500' },
    divider: { height: 1, marginHorizontal: 12 },
});
