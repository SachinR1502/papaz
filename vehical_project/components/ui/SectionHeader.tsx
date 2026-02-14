import { Colors } from '@/constants/theme';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ViewStyle, useColorScheme } from 'react-native';

interface SectionHeaderProps {
    title: string;
    actionText?: string;
    onAction?: () => void;
    rightElement?: React.ReactNode;
    style?: ViewStyle;
}

export const SectionHeader = ({ title, actionText, onAction, rightElement, style }: SectionHeaderProps) => {
    const colorScheme = useColorScheme();
    const theme = colorScheme ?? 'light';
    const colors = Colors[theme];

    return (
        <View style={[styles.container, style]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
                {rightElement}
            </View>
            {actionText && onAction && (
                <TouchableOpacity onPress={onAction}>
                    <Text style={[styles.action, { color: colors.primary }]}>{actionText}</Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        // color removed, controlled by inline style
    },
    action: {
        fontSize: 14,
        fontWeight: '600',
        // color removed
    },
});
