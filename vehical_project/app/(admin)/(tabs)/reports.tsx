import { ReportTransactionList } from '@/components/admin/ReportTransactionList';
import { RevenueChart } from '@/components/admin/RevenueChart';
import { Colors } from '@/constants/theme';
import { useAdmin } from '@/context/AdminContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AdminReports() {
    const router = useRouter();
    const { settings, stats, transactions, isLoading, loadTransactions, refreshDashboard } = useAdmin();
    const [timeRange, setTimeRange] = useState('Week');
    const colorScheme = useColorScheme();
    const theme = colorScheme ?? 'light';
    const colors = Colors[theme];
    const isDark = theme === 'dark';

    const currencySymbol = settings.currency === 'INR' ? '₹' : '$';

    const onRefresh = async () => {
        const period = timeRange === 'Week' ? '7' : timeRange === 'Month' ? '30' : '365';
        await Promise.all([
            refreshDashboard(period),
            loadTransactions({ period })
        ]);
    };

    React.useEffect(() => {
        onRefresh();
    }, [timeRange]);

    const formatCurrency = (amount: number) => {
        if (amount >= 10000000) return `${currencySymbol}${(amount / 10000000).toFixed(2)}Cr`;
        if (amount >= 100000) return `${currencySymbol}${(amount / 100000).toFixed(2)}L`;
        if (amount >= 1000) return `${currencySymbol}${(amount / 1000).toFixed(1)}k`;
        return `${currencySymbol}${amount}`;
    };

    const getChartData = () => {
        const today = new Date();
        const data: { label: string; value: number }[] = [];

        if (timeRange === 'Week') {
            const labels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            for (let i = 6; i >= 0; i--) {
                const d = new Date();
                d.setDate(today.getDate() - i);
                const dateStr = d.toISOString().split('T')[0];
                const dataPoint = stats.revenueHistory?.find(h => h.date === dateStr);
                data.push({
                    label: labels[d.getDay()],
                    value: dataPoint ? dataPoint.amount : 0
                });
            }
        } else if (timeRange === 'Month') {
            // Show last 30 days, labeled every 5 days
            for (let i = 29; i >= 0; i--) {
                const d = new Date();
                d.setDate(today.getDate() - i);
                const dateStr = d.toISOString().split('T')[0];
                const dataPoint = stats.revenueHistory?.find(h => h.date === dateStr);
                data.push({
                    label: i % 5 === 0 ? d.getDate().toString() : '',
                    value: dataPoint ? dataPoint.amount : 0
                });
            }
        } else if (timeRange === 'Year') {
            // Show last 12 months
            const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            for (let i = 11; i >= 0; i--) {
                const d = new Date();
                d.setMonth(today.getMonth() - i);
                const monthYearStr = d.toISOString().slice(0, 7); // YYYY-MM

                // Aggregate daily data for this month
                const monthTotal = stats.revenueHistory?.reduce((sum, h) => {
                    if (h.date.startsWith(monthYearStr)) return sum + h.amount;
                    return sum;
                }, 0) || 0;

                data.push({
                    label: monthLabels[d.getMonth()],
                    value: monthTotal
                });
            }
        }
        return data;
    };

    const chartData = getChartData();
    const maxVal = Math.max(...chartData.map(d => d.value), 100);

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <View>
                    <Text style={[styles.title, { color: colors.text }]}>Financial Reports</Text>
                    <Text style={[styles.subtitle, { color: colors.icon }]}>Revenue & Growth Analysis</Text>
                </View>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView
                contentContainerStyle={styles.content}
                refreshControl={<RefreshControl refreshing={isLoading} onRefresh={onRefresh} tintColor={colors.primary} />}
            >
                {/* Time Range Filter */}
                <View style={[styles.filterContainer, { backgroundColor: isDark ? colors.card : '#E5E5EA' }]}>
                    {['Week', 'Month', 'Year'].map((range) => (
                        <TouchableOpacity
                            key={range}
                            style={[styles.filterBtn, timeRange === range && { backgroundColor: isDark ? colors.background : '#FFF', shadowColor: colors.shadow }]}
                            onPress={() => setTimeRange(range)}
                        >
                            <Text style={[styles.filterText, { color: timeRange === range ? colors.text : colors.icon }]}>
                                {range}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Main Stats */}
                <View style={styles.statsCard}>
                    <Text style={styles.statsLabel}>TOTAL EARNINGS</Text>
                    <Text style={styles.statsValue}>{formatCurrency(stats.totalRevenue)}</Text>
                    <View style={styles.trendContainer}>
                        <Ionicons name="trending-up" size={16} color="#34C759" />
                        <Text style={styles.trendText}>+12.5% platform growth</Text>
                    </View>
                </View>

                <View style={styles.gridContainer}>
                    <View style={[styles.gridCard, { backgroundColor: colors.card, shadowColor: colors.shadow }]}>
                        <MaterialCommunityIcons name="briefcase-check" size={24} color="#007AFF" style={{ marginBottom: 8 }} />
                        <Text style={[styles.gridValue, { color: colors.text }]}>{stats.completedJobs}</Text>
                        <Text style={[styles.gridLabel, { color: colors.icon }]}>Completed Jobs</Text>
                    </View>
                    <View style={[styles.gridCard, { backgroundColor: colors.card, shadowColor: colors.shadow }]}>
                        <MaterialCommunityIcons name="bank-transfer" size={24} color="#FF9500" style={{ marginBottom: 8 }} />
                        <Text style={[styles.gridValue, { color: colors.text }]}>{formatCurrency(stats.platformCommission)}</Text>
                        <Text style={[styles.gridLabel, { color: colors.icon }]}>Net Commission</Text>
                    </View>
                </View>

                {/* Revenue Chart */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Revenue Trend</Text>
                    <RevenueChart data={chartData} maxVal={maxVal} />
                </View>

                {/* Transactions List */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Transactions</Text>
                    <ReportTransactionList transactions={transactions} currencySymbol={currencySymbol} />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 10, marginBottom: 10 },
    backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'flex-start' },
    title: { fontSize: 22, fontWeight: 'bold' },
    subtitle: { fontSize: 13 },
    content: { padding: 20, paddingBottom: 120 },

    filterContainer: { flexDirection: 'row', borderRadius: 12, padding: 4, marginBottom: 20 },
    filterBtn: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 8 },
    filterText: { fontSize: 13, fontWeight: '600' },

    statsCard: { backgroundColor: '#AF52DE', borderRadius: 24, padding: 24, marginBottom: 15, shadowColor: '#AF52DE', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.25, shadowRadius: 16, elevation: 8 },
    statsLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: '700', letterSpacing: 1 },
    statsValue: { color: '#FFF', fontSize: 36, fontWeight: '800', marginVertical: 8 },
    trendContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)', alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, gap: 4 },
    trendText: { color: '#FFF', fontSize: 12, fontWeight: '600' },

    gridContainer: { flexDirection: 'row', gap: 15, marginBottom: 25 },
    gridCard: { flex: 1, borderRadius: 20, padding: 16, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
    gridValue: { fontSize: 20, fontWeight: '800' },
    gridLabel: { fontSize: 12, marginTop: 2, fontWeight: '500' },

    section: { marginBottom: 25 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
});
