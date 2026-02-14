import { Colors } from '@/constants/theme';
import { useLanguage } from '@/context/LanguageContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface BookingSummaryProps {
    vehicleName?: string;
    address?: string;
    serviceMethod?: string;
    serviceCharge?: number;
    isBroadcast: boolean;
    garageName?: string;
}

export const BookingSummary = ({
    vehicleName,
    address,
    serviceMethod,
    serviceCharge,
    isBroadcast,
    garageName
}: BookingSummaryProps) => {
    const { t } = useLanguage();
    const colorScheme = useColorScheme();
    const theme = colorScheme ?? 'light';
    const colors = Colors[theme];

    if (!vehicleName && !address) return null;

    return (
        <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.header}>
                <MaterialCommunityIcons name="clipboard-text-outline" size={20} color={colors.primary} />
                <Text style={[styles.headerTitle, { color: colors.text }]}>{t('booking_summary')}</Text>
            </View>

            <View style={styles.row}>
                <View style={styles.item}>
                    <Text style={[styles.label, { color: colors.icon }]}>{t('vehicle')}</Text>
                    <Text style={[styles.value, { color: colors.text }]}>{vehicleName || t('not_selected')}</Text>
                </View>
                <View style={styles.item}>
                    <Text style={[styles.label, { color: colors.icon }]}>{t('method')}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Text style={[styles.value, { color: colors.text }]}>
                            {serviceMethod ? t(`service_${serviceMethod}`) : t('not_selected')}
                        </Text>
                        {serviceCharge !== undefined && serviceCharge > 0 && (
                            <Text style={[styles.chargeLabel, { color: colors.primary }]}>
                                ₹{serviceCharge}
                            </Text>
                        )}
                    </View>
                </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.fullRow}>
                <Text style={[styles.label, { color: colors.icon }]}>{t('service_location')}</Text>
                <Text style={[styles.value, { color: colors.text }]} numberOfLines={2}>
                    {address || t('not_selected')}
                </Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.footerRow}>
                <Ionicons
                    name={isBroadcast ? "flash" : "business"}
                    size={16}
                    color={colors.primary}
                />
                <Text style={[styles.footerText, { color: colors.icon }]}>
                    {isBroadcast ? t('broadcast_to_nearby') : `${t('selected_garage')}: ${garageName || ''}`}
                </Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        borderRadius: 24,
        padding: 20,
        borderWidth: 1,
        marginTop: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.03,
        shadowRadius: 10,
        elevation: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 16,
    },
    headerTitle: {
        fontSize: 15,
        fontWeight: '700',
        fontFamily: 'NotoSans-Bold',
        letterSpacing: 0.5,
        textTransform: 'uppercase',
    },
    row: {
        flexDirection: 'row',
        gap: 24,
    },
    item: {
        flex: 1,
    },
    fullRow: {
        width: '100%',
    },
    label: {
        fontSize: 12,
        fontFamily: 'NotoSans-Regular',
        marginBottom: 4,
        textTransform: 'uppercase',
    },
    value: {
        fontSize: 15,
        fontWeight: '600',
        fontFamily: 'NotoSans-SemiBold',
    },
    divider: {
        height: 1,
        backgroundColor: '#e0e0e020',
        marginVertical: 12,
    },
    footerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    footerText: {
        fontSize: 13,
        fontFamily: 'NotoSans-Medium',
    },
    chargeLabel: {
        fontSize: 13,
        fontFamily: 'NotoSans-Bold',
        backgroundColor: '#FF3B3015',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 6,
    }
});
