import { Colors } from '@/constants/theme';
import { useAdmin } from '@/context/AdminContext';
import { useLanguage } from '@/context/LanguageContext';
import { useTechnician } from '@/context/TechnicianContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function VehicleHistoryScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const { getVehicleHistory } = useTechnician();
    const { settings } = useAdmin();
    const { t } = useLanguage();

    const currencySymbol = settings.currency === 'INR' ? '₹' : '$';
    const colorScheme = useColorScheme();
    const theme = colorScheme ?? 'light';
    const colors = Colors[theme];

    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any>(null);

    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const fetchHistory = async () => {
            const history = await getVehicleHistory(id!);
            setData(history);
            setLoading(false);
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
            }).start();
        };
        fetchHistory();
    }, [id, getVehicleHistory]);

    if (loading) {
        return (
            <View style={[styles.center, { backgroundColor: colors.background }]}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
            <View style={[styles.bgBlob1, { backgroundColor: colors.primary + '10' }]} />
            <View style={[styles.bgBlob2, { backgroundColor: colors.secondary + '10' }]} />

            <View style={[styles.header, { borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: colors.card }]}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.title, { color: colors.text }]}>{t('vehicle_history_title')}</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <Animated.View style={{ opacity: fadeAnim }}>
                    {/* Vehicle Identity */}
                    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <View style={styles.vehicleHeader}>
                            <View style={[styles.iconBox, { backgroundColor: colors.background }]}>
                                <Ionicons name="car-sport" size={32} color={colors.primary} />
                            </View>
                            <View>
                                <Text style={[styles.modelName, { color: colors.text }]}>{data.vehicle?.make} {data.vehicle?.model}</Text>
                                <Text style={[styles.ownerName, { color: colors.icon }]}>{t('owner')}: {data.vehicle?.owner?.fullName || t('unknown')}</Text>
                                <Text style={{ fontSize: 12, color: colors.icon, marginTop: 2 }}>{data.vehicle?.registrationNumber}</Text>
                            </View>
                        </View>
                    </View>

                    <TouchableOpacity
                        style={[styles.diagnoseBtn, { backgroundColor: colors.primary }]}
                        onPress={() => router.push('/(technician)/(tabs)')}
                    >
                        <Ionicons name="construct" size={20} color="#FFF" />
                        <Text style={styles.diagnoseBtnText}>{t('start_diagnosis')}</Text>
                    </TouchableOpacity>

                    {/* History Timeline */}
                    <Text style={[styles.sectionTitle, { color: colors.icon }]}>{t('service_timeline_caps')}</Text>

                    {data.history.map((item: any, index: number) => (
                        <View key={index} style={[styles.historyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                            <View style={styles.historyHeader}>
                                <View style={[styles.typeTag, { backgroundColor: item.type === 'Service' ? colors.customers + '15' : colors.sales + '15' }]}>
                                    <Text style={[styles.typeText, { color: item.type === 'Service' ? colors.customers : colors.sales }]}>{item.type}</Text>
                                </View>
                                <Text style={[styles.date, { color: colors.icon }]}>{item.date}</Text>
                            </View>
                            <Text style={[styles.desc, { color: colors.text }]}>{item.details}</Text>
                            <View style={styles.footer}>
                                <Text style={[styles.cost, { color: colors.text }]}>{currencySymbol}{item.cost}</Text>
                                <View style={[styles.verifiedBadge, { backgroundColor: colors.primary + '15' }]}>
                                    <Ionicons name="checkmark-circle" size={14} color={colors.primary} />
                                    <Text style={[styles.verifiedText, { color: colors.primary }]}>{t('verified')}</Text>
                                </View>
                            </View>
                        </View>
                    ))}
                </Animated.View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, position: 'relative' },
    bgBlob1: { position: 'absolute', top: -100, right: -100, width: 300, height: 300, borderRadius: 150, zIndex: -1 },
    bgBlob2: { position: 'absolute', top: 150, left: -100, width: 250, height: 250, borderRadius: 125, zIndex: -1 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 20,
        borderBottomWidth: 1,
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    content: {
        padding: 20,
    },
    card: {
        padding: 20,
        borderRadius: 24,
        marginBottom: 20,
        borderWidth: 1,
    },
    vehicleHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    iconBox: {
        width: 56,
        height: 56,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modelName: {
        fontSize: 20,
        fontWeight: '800',
    },
    ownerName: {
        fontSize: 14,
        fontWeight: '500',
        marginTop: 4,
    },
    diagnoseBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        height: 56,
        borderRadius: 16,
        marginBottom: 30,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    diagnoseBtnText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: '800',
        letterSpacing: 1.2,
        marginBottom: 16,
    },
    historyCard: {
        padding: 16,
        borderRadius: 20,
        marginBottom: 16,
        borderWidth: 1,
    },
    historyHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    typeTag: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    typeText: {
        fontSize: 11,
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    date: {
        fontSize: 12,
        fontWeight: '600',
    },
    desc: {
        fontSize: 15,
        fontWeight: '500',
        marginBottom: 12,
        lineHeight: 22,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.05)',
        paddingTop: 12,
    },
    cost: {
        fontSize: 16,
        fontWeight: '800',
    },
    verifiedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    verifiedText: {
        fontSize: 11,
        fontWeight: '700',
    },
});
