import { JobCard } from '@/components/technician/JobCard';
import { ServiceType, ServiceTypeFilter } from '@/components/technician/ServiceTypeFilter';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { ListSkeleton } from '@/components/ui/SkeletonLoader';
import { useLanguage } from '@/context/LanguageContext';
import { useTechnician } from '@/context/TechnicianContext';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    FlatList,
    Platform,
    RefreshControl,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    UIManager,
    useColorScheme,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

if (Platform.OS === 'android') {
    if (UIManager.setLayoutAnimationEnabledExperimental) {
        UIManager.setLayoutAnimationEnabledExperimental(true);
    }
}

export default function JobBoardScreen() {
    const { availableJobs, myJobs, isLoading, refreshJobs } = useTechnician();
    const router = useRouter();
    const { tab } = useLocalSearchParams();
    const { t } = useLanguage();

    // Updated Tab State to 2 main tabs
    const [activeTab, setActiveTab] = useState<'pending' | 'active'>('pending');
    // Sub-filter for pending jobs
    const [pendingType, setPendingType] = useState<'broadcasts' | 'direct'>('broadcasts');

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedServiceType, setSelectedServiceType] = useState<ServiceType>('all');

    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const colors = {
        background: isDark ? '#000000' : '#F8F9FF',
        card: isDark ? '#1C1C1E' : '#FFFFFF',
        text: isDark ? '#FFFFFF' : '#1A1A1A',
        subText: isDark ? '#A1A1A6' : '#8E8E93',
        border: isDark ? '#2C2C2E' : '#E5E5EA',
        primary: '#007AFF',
        tabBg: isDark ? '#1C1C1E' : '#E5E5EA',
        activeTab: isDark ? '#636366' : '#FFFFFF',
        iconBg: isDark ? '#2C2C2E' : '#F2F2F7',
        inputBg: isDark ? '#1C1C1E' : '#FFFFFF',
        requestsBadge: '#FF3B30',
        broadcastsBadge: '#FF9500'
    };

    const pendingMyJobsCount = myJobs.filter(j => j.status === 'pending').length;

    useEffect(() => {
        if (tab) {
            if (tab === 'available') { setActiveTab('pending'); setPendingType('broadcasts'); }
            else if (tab === 'requests') { setActiveTab('pending'); setPendingType('direct'); }
            else if (tab === 'my-jobs') setActiveTab('active');
            else if (tab === 'history') router.push('/(technician)/profile/history');
        } else if (pendingMyJobsCount > 0) {
            setActiveTab('pending');
            setPendingType('direct');
        } else if (availableJobs.length > 0) {
            setActiveTab('pending');
            setPendingType('broadcasts');
        }
    }, [tab, availableJobs.length, pendingMyJobsCount]);

    useFocusEffect(
        useCallback(() => {
            refreshJobs();
        }, [])
    );

    const onRefresh = () => {
        refreshJobs();
    };

    // Filter Logic
    const getSourceData = () => {
        if (activeTab === 'pending') {
            if (pendingType === 'broadcasts') return availableJobs;
            return myJobs.filter(j => j.status === 'pending');
        } else {
            return myJobs.filter(j => j.status !== 'pending' && j.status !== 'completed' && j.status !== 'cancelled');
        }
    };

    const displayJobs = getSourceData().filter(job => {
        // Service type filter
        if (selectedServiceType !== 'all' && job.serviceType !== selectedServiceType) {
            return false;
        }

        // Search filter
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return (
            (job.vehicleModel && job.vehicleModel.toLowerCase().includes(query)) ||
            (job.vehicleNumber && job.vehicleNumber.toLowerCase().includes(query)) ||
            (job.customerName && job.customerName.toLowerCase().includes(query))
        );
    });

    if (isLoading && displayJobs.length === 0) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
                <View style={styles.header}>
                    <Text style={[styles.title, { color: colors.text }]}>{t('job_board')}</Text>
                </View>
                <ListSkeleton count={5} />
            </SafeAreaView>
        );
    }

    return (
        <ErrorBoundary>
            <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
                <View style={styles.header}>
                    <Text style={[styles.title, { color: colors.text }]}>{t('job_board')}</Text>

                    {/* Search Bar */}
                    <View style={[styles.searchContainer, { backgroundColor: colors.inputBg, borderColor: colors.border }]}>
                        <Ionicons name="search" size={20} color={colors.subText} />
                        <TextInput
                            style={[styles.searchInput, { color: colors.text }]}
                            placeholder={t('search_jobs')}
                            placeholderTextColor={colors.subText}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                        {searchQuery.length > 0 && (
                            <TouchableOpacity onPress={() => setSearchQuery('')}>
                                <Ionicons name="close-circle" size={18} color={colors.subText} />
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Main 2-Way Segmented Control */}
                    <View style={[styles.tabContainer, { backgroundColor: colors.tabBg, marginBottom: activeTab === 'pending' ? 15 : 20 }]}>
                        {/* Requests Tab */}
                        <TouchableOpacity
                            style={[styles.tab, activeTab === 'pending' && { backgroundColor: colors.activeTab, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 2 }]}
                            onPress={() => setActiveTab('pending')}
                        >
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                <Text style={[styles.tabText, { color: activeTab === 'pending' ? colors.text : colors.subText }, activeTab === 'pending' && styles.activeTabText]}>
                                    {t('requests') || 'Requests'}
                                </Text>
                                {(availableJobs.length + pendingMyJobsCount) > 0 && (
                                    <View style={{ backgroundColor: colors.requestsBadge, borderRadius: 10, paddingHorizontal: 6, paddingVertical: 2 }}>
                                        <Text style={{ color: '#FFF', fontSize: 10, fontWeight: 'bold' }}>{availableJobs.length + pendingMyJobsCount}</Text>
                                    </View>
                                )}
                            </View>
                        </TouchableOpacity>

                        {/* Active Tab */}
                        <TouchableOpacity
                            style={[styles.tab, activeTab === 'active' && { backgroundColor: colors.activeTab, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 2 }]}
                            onPress={() => setActiveTab('active')}
                        >
                            <Text style={[styles.tabText, { color: activeTab === 'active' ? colors.text : colors.subText }, activeTab === 'active' && styles.activeTabText]}>
                                {t('active') || 'Active'}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Sub-Filters for Pending Tab */}
                    {activeTab === 'pending' && (
                        <View style={{ flexDirection: 'row', marginBottom: 20, gap: 10 }}>
                            <TouchableOpacity
                                onPress={() => setPendingType('broadcasts')}
                                style={[
                                    styles.subFilterChip,
                                    {
                                        backgroundColor: pendingType === 'broadcasts' ? colors.primary + '15' : colors.card,
                                        borderColor: pendingType === 'broadcasts' ? colors.primary : colors.border
                                    }
                                ]}
                            >
                                <Ionicons name="radio" size={16} color={pendingType === 'broadcasts' ? colors.primary : colors.subText} />
                                <Text style={[styles.subFilterText, { color: pendingType === 'broadcasts' ? colors.primary : colors.text }]}>Broadcasts ({availableJobs.length})</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => setPendingType('direct')}
                                style={[
                                    styles.subFilterChip,
                                    {
                                        backgroundColor: pendingType === 'direct' ? colors.primary + '15' : colors.card,
                                        borderColor: pendingType === 'direct' ? colors.primary : colors.border
                                    }
                                ]}
                            >
                                <Ionicons name="person" size={16} color={pendingType === 'direct' ? colors.primary : colors.subText} />
                                <Text style={[styles.subFilterText, { color: pendingType === 'direct' ? colors.primary : colors.text }]}>Direct ({pendingMyJobsCount})</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* Service Type Filter */}
                    <ServiceTypeFilter
                        selectedType={selectedServiceType}
                        onSelectType={setSelectedServiceType}
                    />
                </View>

                <FlatList
                    data={displayJobs}
                    renderItem={({ item, index }) => (
                        <JobCard
                            item={item}
                            index={index}
                        />
                    )}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.list}
                    showsVerticalScrollIndicator={false}
                    refreshControl={<RefreshControl refreshing={isLoading} onRefresh={onRefresh} tintColor={colors.primary} />}
                    ListEmptyComponent={
                        <EmptyState
                            icon={activeTab === 'pending' ? (pendingType === 'broadcasts' ? "radio-outline" : "person-outline") : "briefcase-outline"}
                            title={activeTab === 'pending' ? (pendingType === 'broadcasts' ? t('no_broadcasts') : t('no_requests')) : t('no_active_jobs')}
                            description={activeTab === 'pending'
                                ? (pendingType === 'broadcasts' ? "No nearby broadcast jobs found. Check back soon!" : "You have no direct job requests at the moment.")
                                : "You have no active ongoing jobs. Accept a job to get started!"}
                        />
                    }
                />
            </SafeAreaView>
        </ErrorBoundary>
    );
}



const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 20,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 10,
        zIndex: 10,
        marginBottom: 10
    },
    title: { fontSize: 28, fontFamily: 'NotoSans-Bold', marginBottom: 20 },

    // Search
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
        height: 50,
        borderRadius: 12,
        marginBottom: 20,
        borderWidth: 1,
        gap: 10
    },
    searchInput: {
        flex: 1,
        height: '100%',
        fontFamily: 'NotoSans-Medium',
        fontSize: 15
    },

    tabContainer: { flexDirection: 'row', borderRadius: 16, padding: 4 },
    tab: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 12 },
    tabText: { fontSize: 13, fontFamily: 'NotoSans-Medium' },
    activeTabText: { fontFamily: 'NotoSans-Bold' },

    list: { padding: 20, paddingBottom: 120 },



    emptyState: { alignItems: 'center', justifyContent: 'center', marginTop: 80 },
    emptyIcon: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
    emptyTitle: { fontSize: 18, fontFamily: 'NotoSans-Bold', marginBottom: 8 },
    emptySubtitle: { fontSize: 14, textAlign: 'center', paddingHorizontal: 40, lineHeight: 20 },

    subFilterChip: {
        flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8,
        borderRadius: 20, borderWidth: 1, gap: 6
    },
    subFilterText: { fontSize: 13, fontFamily: 'NotoSans-Medium' }
});
