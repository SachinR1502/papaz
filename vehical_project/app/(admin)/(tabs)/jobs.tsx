import { JobCard } from '@/components/admin/JobCard';
import { JobDetailModal } from '@/components/admin/JobDetailModal';
import { Colors } from '@/constants/theme';
import { useAdmin } from '@/context/AdminContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TextInput,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AdminJobs() {
    const { jobs, isLoading, loadAllJobs, getJobDetails, cancelJob, settings } = useAdmin();
    const colorScheme = useColorScheme();
    const theme = colorScheme ?? 'light';
    const colors = Colors[theme];
    const currencySymbol = settings.currency === 'INR' ? '₹' : '$';

    React.useEffect(() => {
        loadAllJobs();
    }, []);

    const [search, setSearch] = useState('');
    const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
    const [jobDetail, setJobDetail] = useState<any>(null);
    const [isDetailLoading, setIsDetailLoading] = useState(false);

    const filteredJobs = jobs.filter(job =>
        job.id.toLowerCase().includes(search.toLowerCase()) ||
        job.customer?.toLowerCase().includes(search.toLowerCase()) ||
        job.technician?.toLowerCase().includes(search.toLowerCase())
    );

    const fetchJobDetails = async (id: string) => {
        setSelectedJobId(id);
        setIsDetailLoading(true);
        const detail = await getJobDetails(id);
        setJobDetail(detail);
        setIsDetailLoading(false);
    };

    const handleCancelJob = (id: string) => {
        Alert.alert(
            "Cancel Job",
            "Are you sure you want to cancel this job? This action cannot be undone.",
            [
                { text: "No", style: "cancel" },
                {
                    text: "Yes, Cancel",
                    style: "destructive",
                    onPress: async () => {
                        await cancelJob(id, "Cancelled by Administrator");
                        setSelectedJobId(null);
                        setJobDetail(null);
                        Alert.alert("Success", "Job has been cancelled.");
                        loadAllJobs(); // Refresh list
                    }
                }
            ]
        );
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
            <View style={[styles.header, { backgroundColor: colors.card }]}>
                <Text style={[styles.title, { color: colors.text }]}>Live Monitoring</Text>
                <Text style={[styles.subtitle, { color: colors.icon }]}>Track active jobs in real-time</Text>
            </View>

            <View style={styles.content}>
                <View style={[styles.searchContainer, { backgroundColor: colors.card }]}>
                    <Ionicons name="search" size={20} color={colors.icon} />
                    <TextInput
                        style={[styles.searchInput, { color: colors.text }]}
                        placeholder="Search by ID, User or Technician..."
                        placeholderTextColor={colors.icon}
                        value={search}
                        onChangeText={setSearch}
                    />
                </View>

                {isLoading && jobs.length === 0 ? (
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 100 }}>
                        <ActivityIndicator size="large" color={colors.primary} />
                    </View>
                ) : (
                    <FlatList
                        data={filteredJobs}
                        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={loadAllJobs} tintColor={colors.primary} />}
                        keyExtractor={item => item.id}
                        renderItem={({ item }) => (
                            <JobCard
                                job={item}
                                onPress={() => fetchJobDetails(item.id)}
                            />
                        )}
                        contentContainerStyle={{ paddingBottom: 150 }}
                        ListEmptyComponent={
                            <View style={{ alignItems: 'center', marginTop: 50 }}>
                                <Text style={{ color: colors.icon }}>No jobs found matching your search.</Text>
                            </View>
                        }
                    />
                )}
            </View>

            <JobDetailModal
                visible={!!selectedJobId}
                job={jobDetail}
                onClose={() => setSelectedJobId(null)}
                onCancelJob={handleCancelJob}
                isLoading={isDetailLoading}
                currencySymbol={currencySymbol}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { padding: 24, paddingBottom: 10 },
    title: { fontSize: 24, fontWeight: '900' },
    subtitle: { fontSize: 14, fontWeight: '500', marginTop: 4 },
    content: { padding: 20 },
    searchContainer: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, paddingHorizontal: 16, height: 50, marginBottom: 20 },
    searchInput: { flex: 1, marginLeft: 10, fontSize: 16 }
});
