import { Colors } from '@/constants/theme';
import { useLanguage } from '@/context/LanguageContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity } from 'react-native';

export type ServiceType = 'all' | 'car_wash' | 'repairs' | 'maintenance' | 'towing' | 'inspection' | 'other';

interface ServiceTypeFilterProps {
    selectedType: ServiceType;
    onSelectType: (type: ServiceType) => void;
}

const SERVICE_TYPES: { type: ServiceType; icon: string; color: string }[] = [
    { type: 'all', icon: 'view-grid', color: '#8E8E93' },
    { type: 'car_wash', icon: 'car-wash', color: '#34C759' },
    { type: 'repairs', icon: 'wrench', color: '#FF9500' },
    { type: 'maintenance', icon: 'oil', color: '#007AFF' },
    { type: 'towing', icon: 'tow-truck', color: '#FF3B30' },
    { type: 'inspection', icon: 'clipboard-check', color: '#5856D6' },
    { type: 'other', icon: 'dots-horizontal', color: '#8E8E93' },
];

export const ServiceTypeFilter: React.FC<ServiceTypeFilterProps> = ({
    selectedType,
    onSelectType
}) => {
    const { t } = useLanguage();
    const colorScheme = useColorScheme();
    const theme = colorScheme ?? 'light';
    const colors = Colors[theme];
    const isDark = theme === 'dark';

    return (
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.container}
        >
            {SERVICE_TYPES.map((service) => {
                const isSelected = selectedType === service.type;
                return (
                    <TouchableOpacity
                        key={service.type}
                        style={[
                            styles.filterChip,
                            {
                                backgroundColor: isSelected
                                    ? service.color
                                    : isDark
                                        ? colors.background
                                        : '#F5F5F5',
                                borderColor: isSelected ? service.color : colors.border,
                            }
                        ]}
                        onPress={() => onSelectType(service.type)}
                    >
                        <MaterialCommunityIcons
                            name={service.icon as any}
                            size={18}
                            color={isSelected ? '#FFF' : service.color}
                        />
                        <Text
                            style={[
                                styles.filterText,
                                {
                                    color: isSelected ? '#FFF' : colors.text
                                }
                            ]}
                        >
                            {t(`service_${service.type}`)}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </ScrollView>
    );
};

export const getServiceTypeColor = (type?: string): string => {
    const service = SERVICE_TYPES.find(s => s.type === type);
    return service?.color || '#8E8E93';
};

export const getServiceTypeIcon = (type?: string): string => {
    const service = SERVICE_TYPES.find(s => s.type === type);
    return service?.icon || 'dots-horizontal';
};

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 16,
        gap: 8,
    },
    filterChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        borderWidth: 1,
        gap: 6,
    },
    filterText: {
        fontSize: 14,
        fontWeight: '600',
        fontFamily: 'NotoSans-SemiBold',
    },
});
