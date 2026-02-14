import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import React from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';

interface AppTextInputProps extends TextInputProps {
    label?: string;
    error?: string;
    containerStyle?: any;
    inputStyle?: any;
}

export const AppTextInput = ({
    label,
    error,
    containerStyle,
    inputStyle,
    style,
    ...props
}: AppTextInputProps) => {
    const colorScheme = useColorScheme();
    const theme = colorScheme ?? 'light';
    const colors = Colors[theme];
    const isDark = theme === 'dark';

    return (
        <View style={[styles.inputGroup, containerStyle]}>
            {label && (
                <Text style={[styles.label, error ? { color: colors.notification } : { color: colors.text }]}>
                    {label}
                </Text>
            )}
            <View style={[
                styles.inputWrapper,
                { backgroundColor: colors.inputBg, borderColor: colors.border }
            ]}>
                <TextInput
                    style={[styles.input, { color: colors.text }, inputStyle, style]}
                    placeholderTextColor={colors.placeHolder}
                    {...props}
                />
            </View>
            {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
    );
};

const styles = StyleSheet.create({
    inputGroup: { gap: 8, marginBottom: 16 },
    label: { fontSize: 13, fontWeight: '600', marginLeft: 4 },
    inputWrapper: { borderRadius: 14, borderWidth: 1, overflow: 'hidden' },
    inputWrapperError: { borderColor: '#FF3B30', backgroundColor: '#FFF9F9' },
    input: { padding: 14, fontSize: 15 },
    errorText: { fontSize: 11, color: '#FF3B30', marginLeft: 4, marginTop: -4 },
});
