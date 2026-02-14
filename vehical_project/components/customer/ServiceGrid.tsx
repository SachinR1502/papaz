import { Colors } from '@/constants/theme';
import { useLanguage } from '@/context/LanguageContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');

export const ServiceGrid = () => {
    const router = useRouter();
    const { t } = useLanguage();
    const colorScheme = useColorScheme();
    const theme = colorScheme ?? 'light';
    const colors = Colors[theme];
    const isDark = theme === 'dark';

    const SERVICES = useMemo(() => [
        { id: '1', title: 'service_car_wash', icon: 'car-wash', color: colors.sales, bg: isDark ? colors.sales + '20' : '#E8F5E9', desc: 'desc_deep_clean', type: 'car_wash' },
        { id: '2', title: 'service_repairs', icon: 'wrench', color: colors.primary, bg: isDark ? colors.primary + '20' : '#FFF3E0', desc: 'desc_fix_issues', type: 'repairs' },
        { id: '3', title: 'service_puncher', icon: 'oil', color: colors.customers, bg: isDark ? colors.customers + '20' : '#E3F2FD', desc: 'desc_maintenance', type: 'maintenance' },
        { id: '4', title: 'service_towing', icon: 'tow-truck', color: colors.notification, bg: isDark ? colors.notification + '20' : '#FFEBEE', desc: 'desc_emergency', type: 'towing' },
    ], [colors, isDark]);

    return (
        <View style={styles.servicesGrid}>
            {SERVICES.map((service) => (
                <TouchableOpacity
                    key={service.id}
                    style={[
                        styles.serviceItem,
                        {
                            backgroundColor: isDark ? colors.card : service.bg,
                            borderColor: isDark ? colors.border : service.color + '20'
                        }
                    ]}
                    onPress={() => {
                        Haptics.selectionAsync();
                        router.push({
                            pathname: '/(customer)/booking/create',
                            params: {
                                prefillDescription: service.desc,
                                serviceType: service.type
                            }
                        });
                    }}
                >
                    <View style={[styles.serviceIconContainer, { backgroundColor: isDark ? colors.background : '#FFF' }]}>
                        <MaterialCommunityIcons name={service.icon as any} size={28} color={service.color} />
                    </View>
                    <Text style={[styles.serviceTitle, { color: isDark ? colors.text : service.color }]}>{t(service.title)}</Text>
                    <Text style={[styles.serviceDesc, { color: isDark ? colors.icon : service.color + 'AA' }]}>{t(service.desc)}</Text>
                </TouchableOpacity>
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    servicesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    serviceItem: {
        width: (width - 52) / 2,
        borderRadius: 24,
        padding: 16,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
    },
    serviceIconContainer: { width: 56, height: 56, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
    serviceTitle: { fontSize: 15, fontWeight: '700', textAlign: 'center', fontFamily: 'NotoSans-Bold' },
    serviceDesc: { fontSize: 11, fontWeight: '500', marginTop: 2, textAlign: 'center', fontFamily: 'NotoSans-Regular' },
});
