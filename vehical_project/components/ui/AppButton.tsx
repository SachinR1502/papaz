import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TextStyle, TouchableOpacity, ViewStyle } from 'react-native';

interface AppButtonProps {
    title: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
    size?: 'small' | 'medium' | 'large';
    icon?: keyof typeof Ionicons.glyphMap;
    loading?: boolean;
    disabled?: boolean;
    style?: ViewStyle;
    textStyle?: TextStyle;
}

export function AppButton({
    title,
    onPress,
    variant = 'primary',
    size = 'medium',
    icon,
    loading = false,
    disabled = false,
    style,
    textStyle
}: AppButtonProps) {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const themeColors = Colors[colorScheme ?? 'light'];

    const getColors = () => {
        switch (variant) {
            case 'primary': return {
                bg: themeColors.primary,
                text: '#FFFFFF',
                border: themeColors.primary
            };
            case 'secondary': return {
                bg: themeColors.inputBg,
                text: themeColors.text,
                border: themeColors.inputBg
            };
            case 'outline': return {
                bg: 'transparent',
                text: themeColors.text,
                border: themeColors.border
            };
            case 'ghost': return {
                bg: 'transparent',
                text: themeColors.text,
                border: 'transparent'
            };
            case 'danger': return {
                bg: '#FF3B30',
                text: '#FFFFFF',
                border: '#FF3B30'
            };
            case 'success': return {
                bg: '#34C759',
                text: '#FFFFFF',
                border: '#34C759'
            };
            default: return {
                bg: themeColors.primary,
                text: '#FFFFFF',
                border: themeColors.primary
            };
        }
    };

    const colors = getColors();
    const height = size === 'small' ? 36 : size === 'medium' ? 50 : 56;
    const fontSize = size === 'small' ? 13 : size === 'medium' ? 16 : 18;
    const padding = size === 'small' ? 16 : size === 'medium' ? 24 : 32;

    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={disabled || loading}
            style={[
                styles.button,
                {
                    backgroundColor: disabled ? (isDark ? '#3A3A3C' : '#E5E5EA') : colors.bg,
                    borderColor: disabled ? (isDark ? '#3A3A3C' : '#E5E5EA') : colors.border,
                    borderWidth: variant === 'outline' ? 1 : 0,
                    height,
                    paddingHorizontal: padding,
                    opacity: disabled ? 0.7 : 1
                },
                style
            ]}
        >
            {loading ? (
                <ActivityIndicator color={variant === 'outline' || variant === 'secondary' || variant === 'ghost' ? themeColors.text : '#FFF'} />
            ) : (
                <>
                    {icon && <Ionicons name={icon} size={fontSize + 4} color={disabled ? '#8E8E93' : colors.text} style={{ marginRight: 8 }} />}
                    <Text style={[styles.text, { color: disabled ? '#8E8E93' : colors.text, fontSize }, textStyle]}>
                        {title}
                    </Text>
                </>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 14,
    },
    text: {
        fontWeight: '700',
        fontFamily: 'NotoSans-Bold',
    }
});

