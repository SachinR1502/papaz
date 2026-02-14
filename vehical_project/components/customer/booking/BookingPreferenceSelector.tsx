import { Colors } from '@/constants/theme';
import { useLanguage } from '@/context/LanguageContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface BookingPreferenceSelectorProps {
    isBroadcast: boolean;
    onToggle: (isBroadcast: boolean) => void;
    garages?: any[];
    selectedGarageId?: string | null;
    onSelectGarage?: (id: string) => void;
    disableBroadcast?: boolean;
}

export const BookingPreferenceSelector = ({
    isBroadcast,
    onToggle,
    garages = [],
    selectedGarageId,
    onSelectGarage,
    disableBroadcast = false
}: BookingPreferenceSelectorProps) => {
    const { t } = useLanguage();
    const colorScheme = useColorScheme();
    const theme = colorScheme ?? 'light';
    const colors = Colors[theme];

    const handleSelect = (broadcast: boolean) => {
        if (broadcast && disableBroadcast) return;
        onToggle(broadcast);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    };

    return (
        <View style={styles.container}>
            <View style={styles.preferenceRow}>
                <TouchableOpacity
                    style={[
                        styles.prefCard,
                        {
                            backgroundColor: isBroadcast ? colors.primary : colors.card,
                            borderColor: isBroadcast ? colors.primary : colors.border,
                            shadowColor: isBroadcast ? colors.primary : '#000',
                            opacity: disableBroadcast ? 0.5 : 1
                        },
                        isBroadcast && styles.activeCard
                    ]}
                    onPress={() => handleSelect(true)}
                    activeOpacity={disableBroadcast ? 1 : 0.9}
                    disabled={disableBroadcast}
                >
                    <View style={[styles.iconContainer, { backgroundColor: isBroadcast ? 'rgba(255,255,255,0.2)' : colors.primary + '10' }]}>
                        <Ionicons name="flash" size={24} color={isBroadcast ? '#FFF' : colors.primary} />
                    </View>
                    <Text style={[styles.prefTitle, { color: isBroadcast ? '#FFF' : colors.text }]}>{t('auto_broadcast')}</Text>
                    <Text style={[styles.prefDesc, { color: isBroadcast ? 'rgba(255,255,255,0.8)' : colors.icon }]}>
                        {t('auto_broadcast_desc')}
                    </Text>
                    {isBroadcast && (
                        <View style={styles.checkBadge}>
                            <Ionicons name="checkmark-sharp" size={14} color={colors.primary} />
                        </View>
                    )}
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.prefCard,
                        {
                            backgroundColor: !isBroadcast ? colors.primary : colors.card,
                            borderColor: !isBroadcast ? colors.primary : colors.border,
                            shadowColor: !isBroadcast ? colors.primary : '#000',
                        },
                        !isBroadcast && styles.activeCard
                    ]}
                    onPress={() => handleSelect(false)}
                    activeOpacity={0.9}
                >
                    <View style={[styles.iconContainer, { backgroundColor: !isBroadcast ? 'rgba(255,255,255,0.2)' : colors.primary + '10' }]}>
                        <MaterialCommunityIcons name="garage-variant" size={24} color={!isBroadcast ? '#FFF' : colors.primary} />
                    </View>
                    <Text style={[styles.prefTitle, { color: !isBroadcast ? '#FFF' : colors.text }]}>{t('select_garage_label')}</Text>
                    <Text style={[styles.prefDesc, { color: !isBroadcast ? 'rgba(255,255,255,0.8)' : colors.icon }]}>
                        {t('private_booking_desc')}
                    </Text>
                    {!isBroadcast && (
                        <View style={styles.checkBadge}>
                            <Ionicons name="checkmark-sharp" size={14} color={colors.primary} />
                        </View>
                    )}
                </TouchableOpacity>
            </View>

            {!isBroadcast && garages.length > 0 && (
                <View style={styles.garageScrollerContainer}>
                    <View style={styles.scrollerHeader}>
                        <Text style={[styles.scrollerLabel, { color: colors.icon }]}>{t('nearby_workshops')}</Text>
                        <View style={[styles.countBadge, { backgroundColor: colors.primary + '15' }]}>
                            <Text style={[styles.countText, { color: colors.primary }]}>{garages.length}</Text>
                        </View>
                    </View>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.garageList}
                        decelerationRate="fast"
                        snapToInterval={152} // card (140) + gap (12)
                        snapToAlignment="start"
                    >
                        {garages.map((garage) => {
                            const isSelected = selectedGarageId === garage.id;
                            return (
                                <TouchableOpacity
                                    key={garage.id}
                                    style={[
                                        styles.garageCard,
                                        {
                                            backgroundColor: isSelected ? colors.primary : colors.card,
                                            borderColor: isSelected ? colors.primary : colors.border,
                                            shadowColor: isSelected ? colors.primary : '#000',
                                        },
                                        isSelected && styles.selectedGarageCard
                                    ]}
                                    onPress={() => {
                                        onSelectGarage?.(garage.id);
                                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                    }}
                                    activeOpacity={0.8}
                                >
                                    <View style={[styles.garageIcon, { backgroundColor: isSelected ? 'rgba(255,255,255,0.2)' : colors.primary + '10' }]}>
                                        <MaterialCommunityIcons
                                            name="garage-variant"
                                            size={22}
                                            color={isSelected ? '#FFF' : colors.primary}
                                        />
                                    </View>
                                    <Text
                                        style={[styles.garageName, { color: isSelected ? '#FFF' : colors.text }]}
                                        numberOfLines={1}
                                    >
                                        {garage.name}
                                    </Text>

                                    <View style={styles.garageMeta}>
                                        <View style={styles.distanceBadge}>
                                            <Ionicons name="navigate-circle" size={10} color={isSelected ? 'rgba(255,255,255,0.8)' : colors.icon} />
                                            <Text style={[styles.garageDistance, { color: isSelected ? 'rgba(255,255,255,0.9)' : colors.icon }]}>
                                                {garage.distance ? `${garage.distance} km` : 'Near'}
                                            </Text>
                                        </View>
                                        <View style={styles.ratingRow}>
                                            <Ionicons name="star" size={10} color={isSelected ? '#FFF' : "#FFD700"} />
                                            <Text style={[styles.ratingText, { color: isSelected ? '#FFF' : colors.text }]}>{garage.rating || 4.5}</Text>
                                        </View>
                                    </View>

                                    {isSelected && (
                                        <View style={styles.selectedBadge}>
                                            <Ionicons name="checkmark-circle" size={16} color="#FFF" />
                                        </View>
                                    )}
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        gap: 24,
    },
    preferenceRow: {
        flexDirection: 'row',
        gap: 12,
    },
    prefCard: {
        flex: 1,
        borderRadius: 24,
        padding: 16,
        paddingTop: 24,
        borderWidth: 2,
        alignItems: 'flex-start',
        position: 'relative',
        minHeight: 160,
    },
    activeCard: {
        elevation: 8,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    prefTitle: {
        fontSize: 16,
        fontWeight: '700',
        fontFamily: 'NotoSans-Bold',
        marginBottom: 6,
    },
    prefDesc: {
        fontSize: 11,
        fontFamily: 'NotoSans-Regular',
        lineHeight: 16,
    },
    checkBadge: {
        position: 'absolute',
        top: 12,
        right: 12,
        backgroundColor: '#FFF',
        width: 22,
        height: 22,
        borderRadius: 11,
        justifyContent: 'center',
        alignItems: 'center',
    },
    garageScrollerContainer: {
        marginTop: 4,
    },
    scrollerHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
        paddingHorizontal: 4,
    },
    scrollerLabel: {
        fontSize: 13,
        fontFamily: 'NotoSans-Bold',
        textTransform: 'uppercase',
        letterSpacing: 1.2,
    },
    countBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
    },
    countText: {
        fontSize: 10,
        fontFamily: 'NotoSans-Bold',
    },
    garageList: {
        gap: 12,
        paddingRight: 20,
    },
    garageCard: {
        width: 140,
        borderRadius: 24,
        padding: 16,
        borderWidth: 1.5,
        alignItems: 'flex-start',
        position: 'relative',
        elevation: 2,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
    },
    selectedGarageCard: {
        elevation: 6,
        shadowOpacity: 0.2,
    },
    garageIcon: {
        width: 44,
        height: 44,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    garageName: {
        fontSize: 14,
        fontWeight: '700',
        fontFamily: 'NotoSans-Bold',
        marginBottom: 8,
    },
    garageMeta: {
        width: '100%',
        flexDirection: 'column',
        gap: 6,
    },
    distanceBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    garageDistance: {
        fontSize: 10,
        fontFamily: 'NotoSans-Bold',
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    ratingText: {
        fontSize: 10,
        fontFamily: 'NotoSans-Bold',
    },
    selectedBadge: {
        position: 'absolute',
        top: 12,
        right: 12,
    }
});
