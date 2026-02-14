import { Colors } from '@/constants/theme';
import { useLanguage } from '@/context/LanguageContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ServiceMethodTileProps {
    id: string;
    title: string;
    description: string;
    icon: string;
    isActive: boolean;
    price?: string;
    onPress: () => void;
}

export const ServiceMethodTile = ({
    id,
    title,
    description,
    icon,
    isActive,
    price,
    onPress
}: ServiceMethodTileProps) => {
    const { t } = useLanguage();
    const colorScheme = useColorScheme();
    const theme = colorScheme ?? 'light';
    const colors = Colors[theme];

    return (
        <TouchableOpacity
            style={[
                styles.card,
                {
                    backgroundColor: isActive ? colors.primary + '08' : colors.card,
                    borderColor: isActive ? colors.primary : colors.border
                }
            ]}
            onPress={onPress}
            activeOpacity={0.8}
        >
            <View style={[
                styles.iconBg,
                { backgroundColor: isActive ? colors.primary : colors.icon + '15' }
            ]}>
                <MaterialCommunityIcons
                    name={icon as any}
                    size={28}
                    color={isActive ? '#FFF' : colors.icon}
                />
            </View>

            <View style={styles.textContainer}>
                <Text style={[styles.title, { color: colors.text }]}>{t(title)}</Text>
                <Text style={[styles.description, { color: colors.icon }]}>{t(description)}</Text>
            </View>

            {isActive && (
                <View style={styles.checkBadge}>
                    <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
                </View>
            )}

            {/* Price Badge */}
            <View style={[styles.priceBadge, { backgroundColor: isActive ? colors.primary : colors.card, borderColor: isActive ? colors.primary : colors.border }]}>
                <Text style={[styles.priceText, { color: isActive ? '#FFF' : colors.text }]}>
                    {price || 'Free'}
                </Text>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        borderRadius: 24,
        padding: 20,
        borderWidth: 2,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        position: 'relative',
        overflow: 'hidden',
    },
    iconBg: {
        width: 60,
        height: 60,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    textContainer: {
        flex: 1,
    },
    title: {
        fontSize: 17,
        fontWeight: '700',
        fontFamily: 'NotoSans-Bold',
        marginBottom: 4,
    },
    description: {
        fontSize: 13,
        fontFamily: 'NotoSans-Regular',
        lineHeight: 18,
    },
    checkBadge: {
        position: 'absolute',
        top: 12,
        right: 12,
    },
    priceBadge: {
        position: 'absolute',
        bottom: 12,
        right: 12,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        borderWidth: 1,
    },
    priceText: {
        fontSize: 12,
        fontFamily: 'NotoSans-Bold',
    }
});
