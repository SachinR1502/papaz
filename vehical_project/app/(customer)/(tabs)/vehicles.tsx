import { VehicleCard } from '@/components/customer/VehicleCard';
import { Colors } from '@/constants/theme';
import { useCustomer } from '@/context/CustomerContext';
import { useLanguage } from '@/context/LanguageContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  FlatList,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function VehiclesScreen() {
  const router = useRouter();
  const { vehicles, refresh } = useCustomer();
  const { t } = useLanguage();
  const [refreshing, setRefreshing] = useState(false);

  const colorScheme = useColorScheme();
  const theme = colorScheme ?? 'light';
  const colors = Colors[theme];
  const isDark = theme === 'dark';

  // Animation Refs
  const blob1Anim = useRef(new Animated.Value(0)).current;
  const blob2Anim = useRef(new Animated.Value(0)).current;

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

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refresh();
    } catch (e) {
      console.error(e);
    } finally {
      setRefreshing(false);
    }
  }, [refresh]);

  const renderHeader = () => (
    <View style={styles.listHeader}>
      <View style={[styles.statsBanner, { backgroundColor: isDark ? colors.card : '#1A1A1A', borderColor: colors.border, borderWidth: isDark ? 1 : 0 }]}>
        <View style={styles.statBox}>
          <Text style={[styles.statVal, { color: isDark ? colors.text : '#FFF' }]}>{vehicles.length}</Text>
          <Text style={[styles.statLabel, { color: isDark ? colors.icon : '#8E8E93' }]}>{t('tab_vehicles')}</Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor: isDark ? colors.border : '#333' }]} />
        <View style={styles.statBox}>
          <Text style={[styles.statVal, { color: isDark ? colors.text : '#FFF' }]}>0</Text>
          <Text style={[styles.statLabel, { color: isDark ? colors.icon : '#8E8E93' }]}>{t('alerts')}</Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor: isDark ? colors.border : '#333' }]} />
        <View style={styles.statBox}>
          <Text style={[styles.statVal, { color: colors.sales }]}>{t('good')}</Text>
          <Text style={[styles.statLabel, { color: isDark ? colors.icon : '#8E8E93' }]}>{t('condition')}</Text>
        </View>
      </View>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('your_fleet')}</Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

      {/* Background Blobs */}
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
            ]
          }
        ]} />
      </View>

      <SafeAreaView edges={['top']} style={{ flex: 1 }}>
        <View style={[styles.header, { backgroundColor: isDark ? colors.card : 'rgba(255,255,255,0.8)', shadowColor: colors.shadow }]}>
          <View style={styles.headerTop}>
            <View>
              <Text style={[styles.headerTitle, { color: colors.text }]}>{t('my_vehicles')}</Text>
              <Text style={[styles.headerSubtitle, { color: colors.icon }]}>{t('manage_fleet')} ({vehicles.length})</Text>
            </View>
            <TouchableOpacity
              style={[styles.addCircleBtn, { backgroundColor: colors.text, shadowColor: colors.shadow }]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                router.push('/(customer)/vehicle/add');
              }}
            >
              <Ionicons name="add" size={26} color={colors.background} />
            </TouchableOpacity>
          </View>
        </View>

        <FlatList
          data={vehicles}
          renderItem={({ item }) => <VehicleCard vehicle={item} />}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.scrollContent}
          ListHeaderComponent={renderHeader}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={[styles.emptyIconCircle, { backgroundColor: isDark ? colors.border : '#F8F9FE' }]}>
                <FontAwesome name="car" size={50} color={colors.icon} />
              </View>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>{t('no_vehicles')}</Text>
              <Text style={[styles.emptySubtitle, { color: colors.icon }]}>{t('add_first_vehicle_msg')}</Text>
              <TouchableOpacity
                style={[styles.primaryAddBtn, { backgroundColor: colors.customers }]}
                onPress={() => router.push('/(customer)/vehicle/add')}
              >
                <Text style={styles.primaryAddBtnText}>{t('register_now')}</Text>
              </TouchableOpacity>
            </View>
          }
        />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, position: 'relative', overflow: 'hidden' },
  blob: { position: 'absolute', width: 350, height: 350, borderRadius: 175 },
  header: {
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 25,
    borderBottomLeftRadius: 35,
    borderBottomRightRadius: 35,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.04,
    shadowRadius: 20,
    elevation: 4,
  },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontSize: 28, fontFamily: 'NotoSans-Black' },
  headerSubtitle: { fontSize: 13, fontFamily: 'NotoSans-Regular', marginTop: 2 },
  addCircleBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5
  },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 120 },
  listHeader: { marginTop: 25 },
  statsBanner: {
    flexDirection: 'row',
    borderRadius: 28,
    padding: 20,
    marginBottom: 30,
    alignItems: 'center',
    justifyContent: 'space-around'
  },
  statBox: { alignItems: 'center' },
  statVal: { fontSize: 18, fontFamily: 'NotoSans-Black' },
  statLabel: { fontSize: 10, fontFamily: 'NotoSans-Bold', marginTop: 2, textTransform: 'uppercase' },
  statDivider: { width: 1, height: 30 },
  sectionTitle: { fontSize: 20, fontFamily: 'NotoSans-Bold', marginBottom: 15 },
  emptyContainer: { alignItems: 'center', marginTop: 50, paddingHorizontal: 30 },
  emptyIconCircle: { width: 100, height: 100, borderRadius: 50, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  emptyTitle: { fontSize: 20, fontFamily: 'NotoSans-Bold', marginBottom: 10 },
  emptySubtitle: { fontSize: 14, textAlign: 'center', lineHeight: 22, fontFamily: 'NotoSans-Regular', marginBottom: 25 },
  primaryAddBtn: { paddingHorizontal: 30, paddingVertical: 15, borderRadius: 18 },
  primaryAddBtnText: { color: '#FFF', fontFamily: 'NotoSans-Bold', fontSize: 16 }
});
