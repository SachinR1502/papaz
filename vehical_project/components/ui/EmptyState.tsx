import { Colors } from '@/constants/theme';
import { useLanguage } from '@/context/LanguageContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface EmptyStateProps {
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    description: string;
    action?: {
        label: string;
        onPress: () => void;
    };
}

export const EmptyState: React.FC<EmptyStateProps> = ({
    icon,
    title,
    description,
    action
}) => {
    const { t } = useLanguage();
    const colorScheme = useColorScheme();
    const theme = colorScheme ?? 'light';
    const colors = Colors[theme];

    return (
        <View style={styles.container}>
            <View style={[styles.iconContainer, { backgroundColor: colors.primary + '15' }]}>
                <Ionicons name={icon} size={64} color={colors.primary} />
            </View>
            <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
            <Text style={[styles.description, { color: colors.icon }]}>{description}</Text>
            {action && (
                <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: colors.primary }]}
                    onPress={action.onPress}
                >
                    <Text style={styles.actionButtonText}>{action.label}</Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
    },
    iconContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        fontFamily: 'NotoSans-Bold',
        marginBottom: 8,
        textAlign: 'center',
    },
    description: {
        fontSize: 15,
        fontFamily: 'NotoSans-Regular',
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 24,
    },
    actionButton: {
        paddingHorizontal: 32,
        paddingVertical: 14,
        borderRadius: 12,
        marginTop: 8,
    },
    actionButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
        fontFamily: 'NotoSans-SemiBold',
    },
});
