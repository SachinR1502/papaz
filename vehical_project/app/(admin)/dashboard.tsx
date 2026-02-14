import { Colors } from '@/constants/theme';
import { useAdmin } from '@/context/AdminContext';
import { useAuth } from '@/context/AuthContext';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AdminDashboard() {
    const { logout, user } = useAuth();
    const { stats, isLoading, refreshDashboard } = useAdmin();
    const router = useRouter();
    const colorScheme = useColorScheme();
    const theme = colorScheme ?? 'light';
    const colors = Colors[theme];

    // System health is mock for now but stats are real
    const [systemHealth, setSystemHealth] = useState('ONLINE');

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
            {/* Background Blobs for Atmosphere */}
            <View style={[styles.bgBlob, styles.blobTop, { backgroundColor: colors.primary + '15' }]} />
            <View style={[styles.bgBlob, styles.blobBottom, { backgroundColor: colors.secondary + '10' }]} />

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={isLoading} onRefresh={() => refreshDashboard()} tintColor={colors.primary} />}
            >
                {/* Header Section */}
                <View style={styles.header}>
                    <View>
                        <Text style={[styles.greeting, { color: colors.text }]}>Command Center</Text>
                        <Text style={[styles.subGreeting, { color: colors.icon }]}>
                            System Admin: {user?.phoneNumber || 'Unknown'}
                        </Text>
                    </View>
                    <TouchableOpacity
                        onPress={logout}
                        style={[styles.iconButton, { backgroundColor: colors.card, borderColor: colors.border }]}
                    >
                        <Ionicons name="log-out-outline" size={22} color={colors.notification} />
                    </TouchableOpacity>
                </View>

                {/* System Stats Cards */}
                <View style={styles.statsRow}>
                    <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <View style={[styles.iconContainer, { backgroundColor: colors.notification + '15' }]}>
                            <MaterialCommunityIcons name="shield-alert" size={24} color={colors.notification} />
                        </View>
                        <Text style={[styles.statVal, { color: colors.text }]}>{stats.pendingApprovals}</Text>
                        <Text style={[styles.statLabel, { color: colors.icon }]}>Pending Apps</Text>
                    </View>

                    <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <View style={[styles.iconContainer, { backgroundColor: colors.sales + '15' }]}>
                            <MaterialCommunityIcons name="server-network" size={24} color={colors.sales} />
                        </View>
                        <Text style={[styles.statVal, { color: colors.text }]}>{systemHealth}</Text>
                        <Text style={[styles.statLabel, { color: colors.icon }]}>System Status</Text>
                    </View>
                </View>

                {/* Platform Governance Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>Platform Governance</Text>
                        <TouchableOpacity>
                            <Text style={{ color: colors.primary, fontWeight: '600', fontSize: 13 }}>View Logs</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={[styles.emptyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <MaterialCommunityIcons name="shield-check" size={54} color={colors.border} />
                        <Text style={[styles.emptyText, { color: colors.text }]}>Monitoring {stats.totalJobs} Platform Entities</Text>
                        <Text style={[styles.emptySub, { color: colors.icon }]}>
                            The system is monitoring {stats.totalTechnicians} technicians and {stats.totalSuppliers} suppliers across all active zones.
                        </Text>
                    </View>
                </View>

                {/* Quick Controls */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: 15 }]}>Quick Controls</Text>
                    <View style={styles.actionRow}>
                        <QuickAction
                            icon="people"
                            label="Users"
                            color={colors.customers}
                            bg={colors.card}
                            border={colors.border}
                            textColor={colors.text}
                            onPress={() => router.push('/(admin)/(tabs)/approvals' as any)}
                        />
                        <QuickAction
                            icon="construct"
                            label="Jobs"
                            color={colors.sales}
                            bg={colors.card}
                            border={colors.border}
                            textColor={colors.text}
                            onPress={() => router.push('/(admin)/(tabs)/jobs' as any)}
                        />
                        <QuickAction
                            icon="cash"
                            label="Treasury"
                            color={colors.revenue}
                            bg={colors.card}
                            border={colors.border}
                            textColor={colors.text}
                        />
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

// Reusable Helper Component
function QuickAction({ icon, label, color, bg, border, textColor, onPress }: any) {
    return (
        <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: bg, borderColor: border }]}
            onPress={onPress}
        >
            <View style={[styles.actionIconBubble, { backgroundColor: color + '15' }]}>
                <Ionicons name={icon as any} size={22} color={color} />
            </View>
            <Text style={[styles.actionBtnText, { color: textColor }]}>{label}</Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        position: 'relative',
    },
    bgBlob: {
        position: 'absolute',
        borderRadius: 999,
        zIndex: -1,
    },
    blobTop: {
        top: -120,
        right: -100,
        width: 350,
        height: 350,
    },
    blobBottom: {
        bottom: 50,
        left: -150,
        width: 400,
        height: 400,
    },
    scrollContent: {
        padding: 24,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 32,
    },
    greeting: {
        fontSize: 28,
        fontWeight: '800',
        letterSpacing: -0.5,
    },
    subGreeting: {
        fontSize: 14,
        marginTop: 4,
        fontWeight: '500',
    },
    iconButton: {
        width: 44,
        height: 44,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    statsRow: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: 32,
    },
    statCard: {
        flex: 1,
        padding: 20,
        borderRadius: 24,
        alignItems: 'flex-start',
        borderWidth: 1,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.03,
        shadowRadius: 10,
        elevation: 2,
    },
    iconContainer: {
        padding: 10,
        borderRadius: 12,
        marginBottom: 12,
    },
    statVal: {
        fontSize: 22,
        fontWeight: '800',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        fontWeight: '600',
    },
    section: {
        marginBottom: 32,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
    },
    emptyCard: {
        padding: 40,
        borderRadius: 28,
        alignItems: 'center',
        borderWidth: 1,
        borderStyle: 'dashed',
    },
    emptyText: {
        fontSize: 16,
        fontWeight: '700',
        marginTop: 16,
        marginBottom: 8,
    },
    emptySub: {
        fontSize: 13,
        textAlign: 'center',
        lineHeight: 18,
    },
    actionRow: {
        flexDirection: 'row',
        gap: 12,
    },
    actionBtn: {
        flex: 1,
        paddingVertical: 20,
        borderRadius: 20,
        alignItems: 'center',
        gap: 10,
        borderWidth: 1,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 6,
        elevation: 2,
    },
    actionIconBubble: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    actionBtnText: {
        fontSize: 13,
        fontWeight: '600',
    }
});
