import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { StatusBadge } from '@/components/ui/StatusBadge';
import { VehicleIcon } from '@/components/ui/VehicleIcon';
import { Colors } from '@/constants/theme';
import { useLanguage } from '@/context/LanguageContext';
import { TechnicianJob } from '@/context/TechnicianContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getServiceTypeColor, getServiceTypeIcon } from './ServiceTypeFilter';

interface JobCardProps {
    item: TechnicianJob;
    index: number;
}

export const JobCard = ({ item, index }: JobCardProps) => {
    const router = useRouter();
    const { t } = useLanguage();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    // Use theme colors directly or fallbacks if needed, 
    // but better to match the parent's logic if it was using custom colors.
    // The parent uses a custom color object, let's try to map it to standard Colors or replicate logic.
    // Parent colors:
    /*
    const colors = {
        background: isDark ? '#000000' : '#F8F9FF',
        card: isDark ? '#1C1C1E' : '#FFFFFF',
        text: isDark ? '#FFFFFF' : '#1A1A1A',
        subText: isDark ? '#A1A1A6' : '#8E8E93',
        border: isDark ? '#2C2C2E' : '#E5E5EA',
        primary: '#007AFF',
        // ...
        iconBg: isDark ? '#2C2C2E' : '#F2F2F7',
    };
    */

    // We'll use the standard theme tokens where possible
    const themeColors = Colors[colorScheme ?? 'light'];

    // Replicating specific styles to maintain visual consistency
    const cardBg = isDark ? '#1C1C1E' : '#FFFFFF';
    const borderColor = isDark ? '#2C2C2E' : '#E5E5EA';
    const textColor = isDark ? '#FFFFFF' : '#1A1A1A';
    const subTextColor = isDark ? '#A1A1A6' : '#8E8E93';

    const isNew = item.status === 'pending';

    // Simple entry animation
    const animatedValue = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(animatedValue, {
            toValue: 1,
            duration: 500,
            delay: index * 100,
            useNativeDriver: true,
        }).start();
    }, []);

    return (
        <Animated.View style={{ opacity: animatedValue, transform: [{ translateY: animatedValue.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] }}>
            <TouchableOpacity
                style={[styles.jobCard, { backgroundColor: cardBg, borderColor: borderColor }]}
                onPress={() => router.push({ pathname: '/(technician)/job/[id]', params: { id: item.id } })}
                activeOpacity={0.9}
            >
                <View style={styles.cardHeader}>
                    <View style={styles.vehicleRow}>
                        <View style={[styles.vehicleIcon, { backgroundColor: isNew ? '#FFE5E5' : isDark ? '#007AFF20' : '#E3F2FD' }]}>
                            <VehicleIcon
                                type={item.vehicle?.vehicleType}
                                make={item.vehicle?.make}
                                model={item.vehicle?.model}
                                size={22}
                                color={isNew ? '#FF3B30' : '#007AFF'}
                            />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.vehicleName, { color: textColor }]} numberOfLines={1}>{t(item.vehicleModel || '')}</Text>
                            <Text style={[styles.customerName, { color: subTextColor }]}>{item.customerName || t('Unknown Customer')}</Text>
                        </View>
                    </View>
                    {isNew ? (
                        <View style={styles.newBadge}>
                            <Text style={styles.newText}>{t('NEW')}</Text>
                        </View>
                    ) : (
                        <StatusBadge status={item.status} size="small" showIcon={false} />
                    )}
                </View>

                <View style={[styles.cardDivider, { backgroundColor: borderColor }]} />

                <Text style={[styles.description, { color: isDark ? '#D1D1D6' : '#666' }]} numberOfLines={2}>
                    {t(item.description)}
                </Text>

                {/* Service Type & Voice Note Badge */}
                <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center', marginBottom: 16 }}>
                    {item.serviceType && item.serviceType !== 'other' && (
                        <View style={[styles.serviceTypeBadge, { backgroundColor: getServiceTypeColor(item.serviceType) + '15', marginBottom: 0 }]}>
                            <MaterialCommunityIcons
                                name={getServiceTypeIcon(item.serviceType) as any}
                                size={14}
                                color={getServiceTypeColor(item.serviceType)}
                            />
                            <Text style={[styles.serviceTypeText, { color: getServiceTypeColor(item.serviceType) }]}>
                                {t(`service_${item.serviceType}`)}
                            </Text>
                        </View>
                    )}

                    {item.voiceNote && (
                        <View style={[styles.voiceNoteBadge, { backgroundColor: isDark ? '#34C75920' : '#E8F5E9' }]}>
                            <Ionicons name="mic" size={12} color="#34C759" />
                            <Text style={styles.voiceNoteText}>{t('Voice Note')}</Text>
                        </View>
                    )}
                </View>

                <View style={styles.cardFooter}>
                    <View style={styles.metaItem}>
                        <Ionicons name="location-outline" size={16} color={subTextColor} />
                        <Text style={[styles.metaText, { color: subTextColor }]} numberOfLines={1}>
                            {t(item.address || 'Address hidden')}
                        </Text>
                    </View>
                    <View style={styles.metaItem}>
                        <Ionicons name="time-outline" size={16} color={subTextColor} />
                        <Text style={[styles.metaText, { color: subTextColor }]}>
                            {isNew ? t('Urgent Request') : t('In Progress')}
                        </Text>
                    </View>
                </View>
            </TouchableOpacity>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    jobCard: {
        borderRadius: 20,
        padding: 20,
        marginBottom: 16,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.04,
        shadowRadius: 12,
        elevation: 2,
        borderWidth: 1,
    },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    vehicleRow: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
    vehicleIcon: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    vehicleName: { fontSize: 16, fontFamily: 'NotoSans-Bold' },
    customerName: { fontSize: 12, marginTop: 2, fontFamily: 'NotoSans-Regular' },
    newBadge: { backgroundColor: '#FF3B30', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
    newText: { color: '#FFF', fontSize: 10, fontFamily: 'NotoSans-Bold' },
    cardDivider: { height: 1, marginVertical: 16 },
    description: { fontSize: 13, fontFamily: 'NotoSans-Regular', marginBottom: 20, lineHeight: 20 },
    serviceTypeBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
        gap: 4,
        marginBottom: 16,
    },
    serviceTypeText: {
        fontSize: 12,
        fontWeight: '600',
        fontFamily: 'NotoSans-SemiBold',
    },
    cardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
    metaItem: { flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 },
    metaText: { fontSize: 12, fontFamily: 'NotoSans-Medium', flex: 1 },
    voiceNoteBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        gap: 4,
    },
    voiceNoteText: {
        fontSize: 10,
        fontFamily: 'NotoSans-Bold',
        color: '#34C759',
    },
});
