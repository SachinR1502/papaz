import { Colors } from '@/constants/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ViewStyle, useColorScheme } from 'react-native';

interface StatCardProps {
    title: string;
    value: string | number;
    icon: keyof typeof MaterialCommunityIcons.glyphMap;
    color: string;
    onPress?: () => void;
    style?: ViewStyle;
}

export const StatCard = ({ title, value, icon, color, onPress, style }: StatCardProps) => {
    const colorScheme = useColorScheme();
    const theme = colorScheme ?? 'light';
    const colors = Colors[theme];

    return (
        <TouchableOpacity
            style={[styles.container, { backgroundColor: `${color}08` }, style]}
            onPress={onPress}
            disabled={!onPress}
        >
            <View style={[styles.innerBlob, { backgroundColor: `${color}10` }]} />
            <View style={[styles.iconBg, { backgroundColor: `${color}15` }]}>
                <MaterialCommunityIcons name={icon} size={22} color={color} />
            </View>
            <Text style={[styles.value, { color: color }]}>{value}</Text>
            <Text style={[styles.label, { color: colors.icon }]}>{title}</Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '48%',
        padding: 16,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },
    innerBlob: {
        position: 'absolute',
        width: 80,
        height: 80,
        borderRadius: 40,
        top: -20,
        right: -20,
        zIndex: 0,
    },
    iconBg: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    value: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    label: {
        fontSize: 12,
        // color removed
        marginTop: 4,
    },
});
