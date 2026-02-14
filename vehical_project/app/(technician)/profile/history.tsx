import { useAdmin } from '@/context/AdminContext';
import { useTechnician } from '@/context/TechnicianContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { Animated, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ServiceHistoryScreen() {
    const router = useRouter();
    const { myJobs, isLoading, refresh } = useTechnician();
    const { settings } = useAdmin();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const colors = {
        background: isDark ? '#000000' : '#F8F9FB',
        card: isDark ? '#1C1C1E' : '#FFFFFF',
        text: isDark ? '#FFFFFF' : '#1A1A1A',
        subText: isDark ? '#A1A1A6' : '#8E8E93',
        border: isDark ? '#2C2C2E' : '#F0F0F0',
        summaryBg: isDark ? '#2C2C2E' : '#F2F2F7',
        divider: isDark ? '#3A3A3C' : '#D1D1D6',
    };

    const currencySymbol = settings.currency === 'INR' ? '₹' : '$';
    const pastJobs = myJobs ? myJobs.filter(j => j.status === 'completed' || j.status === 'cancelled') : [];

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(20)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 600,
                useNativeDriver: true,
            })
        ]).start();
    }, []);

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
            <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: isDark ? '#2C2C2E' : '#F8F9FE' }]}>
                    <Ionicons name="chevron-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Professional Records</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={isLoading}
                        onRefresh={refresh}
                        tintColor="#007AFF"
                    />
                }
            >
                <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
                    {pastJobs.length === 0 ? (
                        <View style={styles.emptyContainer}>
                            <Ionicons name="clipboard-outline" size={60} color={colors.divider} />
                            <Text style={[styles.emptyText, { color: colors.text }]}>No records found.</Text>
                            <Text style={[styles.emptySub, { color: colors.subText }]}>Finish your active jobs to see them here.</Text>
                        </View>
                    ) : (
                        pastJobs.map((job) => (
                            <TouchableOpacity
                                key={job.id}
                                style={[styles.historyCard, { backgroundColor: colors.card, borderLeftWidth: 4, borderLeftColor: job.status === 'completed' ? '#34C759' : '#FF3B30' }]}
                                onPress={() => router.push(`/(technician)/job/${job.id}`)}
                            >
                                <View style={styles.cardHeader}>
                                    <View>
                                        <Text style={[styles.jobId, { color: colors.text }]}>Job #{job.id.slice(0, 6).toUpperCase()}</Text>
                                        <Text style={[styles.jobDate, { color: colors.subText }]}>{new Date(job.createdAt).toLocaleDateString()}</Text>
                                    </View>
                                    <View style={[styles.statusBadge, { backgroundColor: job.status === 'completed' ? '#34C75920' : '#FF3B3020' }]}>
                                        <Text style={[styles.statusText, { color: job.status === 'completed' ? '#34C759' : '#FF3B30' }]}>
                                            {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                                        </Text>
                                    </View>
                                </View>
                                <View style={styles.vehicleRow}>
                                    <Ionicons name="car-sport" size={20} color="#007AFF" />
                                    <Text style={[styles.vehicleModel, { color: colors.text }]}>{job.vehicleModel}</Text>
                                </View>
                                <View style={[styles.summaryRow, { backgroundColor: colors.summaryBg }]}>
                                    <View style={styles.summaryItem}>
                                        <Text style={[styles.summaryLabel, { color: colors.subText }]}>Cost</Text>
                                        <Text style={[styles.summaryValue, { color: colors.text }]}>
                                            {job.status === 'cancelled' ? '-' : `${currencySymbol}${job.bill?.totalAmount || job.billTotal || '0'}`}
                                        </Text>
                                    </View>
                                    <View style={[styles.summaryDivider, { backgroundColor: colors.divider }]} />
                                    <View style={styles.summaryItem}>
                                        <Text style={[styles.summaryLabel, { color: colors.subText }]}>Rating</Text>
                                        <View style={styles.ratingRow}>
                                            <Text style={[styles.summaryValue, { color: colors.text }]}>{job.rating ? job.rating.toFixed(1) : '-'}</Text>
                                            <Ionicons name="star" size={14} color="#FFD700" />
                                        </View>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        ))
                    )}
                </Animated.View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 15, paddingVertical: 10, borderBottomWidth: 1 },
    backBtn: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
    headerTitle: { fontSize: 17, fontWeight: 'bold' },
    content: { padding: 20, paddingBottom: 100 },
    historyCard: { borderRadius: 24, padding: 20, marginBottom: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 3 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
    jobId: { fontSize: 13, fontWeight: '800', letterSpacing: 0.5 },
    jobDate: { fontSize: 11, fontWeight: '600' },
    vehicleRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 20 },
    vehicleModel: { fontSize: 16, fontWeight: 'bold' },
    summaryRow: { flexDirection: 'row', alignItems: 'center', padding: 15, borderRadius: 16 },
    summaryItem: { flex: 1, alignItems: 'center' },
    summaryLabel: { fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 4 },
    summaryValue: { fontSize: 15, fontWeight: 'bold' },
    summaryDivider: { width: 1, height: 20 },
    ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
    statusText: { fontSize: 11, fontWeight: 'bold' },
    emptyContainer: { alignItems: 'center', justifyContent: 'center', marginTop: 100 },
    emptyText: { fontSize: 16, fontWeight: 'bold', marginTop: 15 },
    emptySub: { fontSize: 13, marginTop: 5 },
});
