import { ActiveJobCard } from '@/components/customer/ActiveJobCard';
import { CustomerHeader } from '@/components/customer/CustomerHeader';
import { FilterModal } from '@/components/customer/FilterModal';
import { PremiumBanner } from '@/components/customer/PremiumBanner';
import { ServiceGrid } from '@/components/customer/ServiceGrid';
import { VehicleList } from '@/components/customer/VehicleList';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { DashboardSkeleton } from '@/components/ui/SkeletonLoader';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useChat } from '@/context/ChatContext';
import { useCustomer } from '@/context/CustomerContext';
import { useLanguage } from '@/context/LanguageContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

export default function Dashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const { createConversation } = useChat();
  const { vehicles, activeJobs, refresh, isLoading } = useCustomer();
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');

  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | 'action_required' | 'video_update'>('all');
  const { t } = useLanguage();

  const colorScheme = useColorScheme();
  const theme = colorScheme ?? 'light';
  const colors = Colors[theme];
  const isDark = theme === 'dark';

  // Animation Refs
  const blob1Anim = useRef(new Animated.Value(0)).current;
  const blob2Anim = useRef(new Animated.Value(0)).current;
  const scrollY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(blob1Anim, { toValue: 1, duration: 6000, useNativeDriver: true }),
        Animated.timing(blob1Anim, { toValue: 0, duration: 6000, useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(blob2Anim, { toValue: 1, duration: 8000, useNativeDriver: true }),
        Animated.timing(blob2Anim, { toValue: 0, duration: 8000, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const filteredJobs = useMemo(() => {
    let result = activeJobs;

    if (statusFilter !== 'all') {
      if (statusFilter === 'action_required') {
        result = result.filter(j => ['quote_pending', 'billing_pending', 'vehicle_delivered'].includes(j.status));
      } else if (statusFilter === 'video_update') {
        result = result.filter(j => ['in_progress', 'diagnosing'].includes(j.status));
      }
    }

    if (!search.trim()) return result;
    return result.filter(job => {
      const vehicle = vehicles.find(v => v.id === job.vehicleId);
      const searchStr = `${vehicle?.make} ${vehicle?.model} ${job.description}`.toLowerCase();
      return searchStr.includes(search.toLowerCase());
    });
  }, [search, activeJobs, vehicles, statusFilter]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refresh();
    } catch (e) {
      console.error(e);
    } finally {
      setRefreshing(false);
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <DashboardSkeleton />
      </View>
    );
  }

  return (
    <ErrorBoundary>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

        {/* Animated Background Blobs */}
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          <Animated.View style={[
            styles.blob,
            {
              backgroundColor: colors.primary,
              top: -100,
              left: -100,
              opacity: 0.1,
              transform: [
                { scale: blob1Anim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.2] }) },
                { translateX: blob1Anim.interpolate({ inputRange: [0, 1], outputRange: [0, 50] }) }
              ]
            }
          ]} />
          <Animated.View style={[
            styles.blob,
            {
              backgroundColor: colors.secondary,
              bottom: -100,
              right: -100,
              opacity: 0.1,
              transform: [
                { scale: blob2Anim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.3] }) },
                { translateY: blob2Anim.interpolate({ inputRange: [0, 1], outputRange: [0, -50] }) }
              ]
            }
          ]} />
        </View>

        <CustomerHeader />

        <Animated.ScrollView
          contentContainerStyle={[styles.scrollContent, { paddingTop: 120 }]}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
          showsVerticalScrollIndicator={false}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: false }
          )}
          scrollEventThrottle={16}
        >
          {/* Search Bar & Actions */}
          <View style={[styles.searchContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Ionicons name="search" size={20} color={colors.icon} />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder={t('search_placeholder')}
              value={search}
              onChangeText={setSearch}
              placeholderTextColor={colors.icon}
            />
            <TouchableOpacity
              style={styles.filterBtn}
              onPress={() => {
                Haptics.selectionAsync();
                const convId = createConversation([
                  { userId: user?.id || 'u1', role: 'customer', name: 'You' },
                  { userId: 's1', role: 'store', name: 'Part Store' }
                ]);
                router.push({ pathname: '/(customer)/chat/[id]', params: { id: convId } });
              }}
            >
              <Ionicons name="chatbubbles-outline" size={20} color={colors.customers} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.filterBtn}
              onPress={() => {
                Haptics.selectionAsync();
                setFilterModalVisible(true);
              }}
            >
              <Ionicons name="options-outline" size={20} color={colors.customers} />
            </TouchableOpacity>
          </View>

          {/* Modern Summary Cards */}
          <View style={styles.summaryContainer}>
            <TouchableOpacity
              style={[styles.summaryCard, { backgroundColor: colors.sales }]}
              onPress={() => {
                Haptics.selectionAsync();
                router.push('/(customer)/(tabs)/vehicles');
              }}
            >
              <View style={styles.summaryIconBg}>
                <MaterialCommunityIcons name="car-multiple" size={20} color="#FFF" />
              </View>
              <View>
                <Text style={[styles.summaryVal, { color: '#FFF' }]}>{vehicles.length}</Text>
                <Text style={[styles.summaryLabel, { color: 'rgba(255,255,255,0.8)' }]}>{t('my_fleet')}</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.summaryCard, { backgroundColor: colors.card }]}
              onPress={() => {
                Haptics.selectionAsync();
                router.push('/(customer)/(tabs)/history');
              }}
            >
              <View style={[styles.summaryIconBg, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}>
                <MaterialCommunityIcons name="history" size={20} color={isDark ? '#FFF' : colors.text} />
              </View>
              <View>
                <Text style={[styles.summaryVal, { color: colors.text }]}>
                  {activeJobs.filter(j => j.status !== 'completed').length}
                </Text>
                <Text style={[styles.summaryLabel, { color: colors.icon }]}>{t('active_jobs')}</Text>
              </View>
            </TouchableOpacity>
          </View>

          <PremiumBanner />

          {/* Live Updates Segment */}
          {activeJobs.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('live_tracking')}</Text>
                <TouchableOpacity onPress={() => router.push('/(customer)/(tabs)/history')}>
                  <Text style={styles.sectionAction}>{t('tab_history')}</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.jobsList}>
                {filteredJobs.filter(job => job.status === 'pending').length > 0 ? (
                  filteredJobs.filter(job => job.status === 'pending').map(job => (
                    <ActiveJobCard
                      key={job.id}
                      job={job}
                      vehicle={vehicles.find(v => v.id === job.vehicleId)}
                    />
                  ))
                ) : (
                  <EmptyState
                    icon="briefcase-outline"
                    title={search ? t('no_matches') : t('no_active_jobs')}
                    description={search ? t('try_different_search') : t('start_by_booking_service')}
                    action={!search ? {
                      label: t('book_service'),
                      onPress: () => router.push('/(customer)/booking/create')
                    } : undefined}
                  />
                )}
              </View>
            </View>
          )}

          {/* Services Grid */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                {t('quick_services')}
              </Text>

              <TouchableOpacity
                style={styles.addButton}
                onPress={() => router.push('/(customer)/booking/create')}
              >
                <Ionicons name="add" size={28} color="#fff" />
              </TouchableOpacity>
            </View>

            <ServiceGrid />
          </View>


          {/* Garage Quick Access */}
          <View style={[styles.section, { marginBottom: 30 }]}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('your_vehicles')}</Text>
              <TouchableOpacity onPress={() => router.push('/(customer)/(tabs)/vehicles')}>
                <Text style={styles.sectionAction}>{t('manage')}</Text>
              </TouchableOpacity>
            </View>
            <VehicleList />
          </View>
          <View style={{ height: 120 }} />
        </Animated.ScrollView>

        <FilterModal
          visible={filterModalVisible}
          onClose={() => setFilterModalVisible(false)}
          statusFilter={statusFilter}
          onSelectFilter={setStatusFilter}
        />
      </View>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, position: 'relative', overflow: 'hidden' },
  blob: {
    position: 'absolute',
    width: 350,
    height: 350,
    borderRadius: 175,
  },
  scrollContent: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 120 },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 54,
    borderRadius: 16,
    gap: 12,
    marginBottom: 25,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 14,
    fontFamily: 'NotoSans-Regular'
  },
  filterBtn: { padding: 4 },

  summaryContainer: { flexDirection: 'row', gap: 15, marginBottom: 25 },
  summaryCard: {
    flex: 1,
    height: 90,
    borderRadius: 24,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderBottomWidth: 4,
    borderColor: 'rgba(0,0,0,0.1)'
  },
  addButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,        // Android shadow
    shadowColor: '#000', // iOS shadow
    shadowOpacity: 0.25,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
  },

  summaryIconBg: { width: 36, height: 36, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.25)', justifyContent: 'center', alignItems: 'center' },
  summaryVal: { fontSize: 24, fontWeight: '900', color: '#FFF', fontFamily: 'NotoSans-Black' },
  summaryLabel: { fontSize: 12, fontWeight: '600', color: 'rgba(26,26,26,0.6)', fontFamily: 'NotoSans-Bold' },

  section: { marginBottom: 25 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  sectionTitle: { fontSize: 18, fontWeight: '800', fontFamily: 'NotoSans-Bold' },
  sectionAction: { fontSize: 13, color: '#007AFF', fontWeight: '700', fontFamily: 'NotoSans-Bold' },

  jobsList: { gap: 12 },
  emptyState: { padding: 40, alignItems: 'center' },
  emptyStateText: { fontSize: 14, fontWeight: '400', textAlign: 'center' },
});
