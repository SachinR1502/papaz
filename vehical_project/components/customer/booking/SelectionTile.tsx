import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface SelectionTileProps {
    title: string;
    subtitle: string;
    icon: React.ReactNode;
    isSelected: boolean;
    onPress: () => void;
    onClear?: () => void;
    placeholder?: string;
}

export const SelectionTile = ({
    title,
    subtitle,
    icon,
    isSelected,
    onPress,
    onClear,
    placeholder
}: SelectionTileProps) => {
    const colorScheme = useColorScheme();
    const theme = colorScheme ?? 'light';
    const colors = Colors[theme];
    const isDark = theme === 'dark';

    return (
        <TouchableOpacity
            style={[
                styles.card,
                {
                    backgroundColor: isDark ? colors.card : '#FFF',
                    borderColor: isSelected ? colors.primary : colors.border,
                    shadowColor: isSelected ? colors.primary : '#000',
                },
                isSelected && styles.selectedCard
            ]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <View style={styles.content}>
                <View style={[styles.iconContainer, { backgroundColor: isSelected ? colors.primary : colors.primary + '15' }]}>
                    {React.cloneElement(icon as any, {
                        color: isSelected ? '#FFF' : colors.primary,
                        size: 24
                    })}
                </View>

                <View style={styles.info}>
                    {isSelected ? (
                        <>
                            <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
                            <Text style={[styles.subtitle, { color: colors.icon }]} numberOfLines={1}>{subtitle}</Text>
                        </>
                    ) : (
                        <Text style={[styles.placeholder, { color: colors.icon }]}>{placeholder}</Text>
                    )}
                </View>

                {isSelected && onClear ? (
                    <TouchableOpacity onPress={onClear} style={styles.actionBtn}>
                        <Ionicons name="close-circle" size={24} color={colors.icon} />
                    </TouchableOpacity>
                ) : (
                    <Ionicons name="chevron-forward" size={20} color={colors.icon} />
                )}
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        borderRadius: 20,
        padding: 16,
        borderWidth: 1.5,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 2,
    },
    selectedCard: {
        borderWidth: 2,
        shadowOpacity: 0.1,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    iconContainer: {
        width: 52,
        height: 52,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    info: {
        flex: 1,
    },
    title: {
        fontSize: 16,
        fontWeight: '700',
        fontFamily: 'NotoSans-Bold',
        marginBottom: 2,
    },
    subtitle: {
        fontSize: 13,
        fontFamily: 'NotoSans-Regular',
    },
    placeholder: {
        fontSize: 15,
        fontFamily: 'NotoSans-SemiBold',
    },
    actionBtn: {
        padding: 4,
    }
});
