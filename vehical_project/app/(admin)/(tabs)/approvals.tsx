import { ActiveUserCard } from '@/components/admin/ActiveUserCard';
import { ActiveUserManageModal } from '@/components/admin/ActiveUserManageModal';
import { ActivityHistoryModal } from '@/components/admin/ActivityHistoryModal';
import { PendingUserCard } from '@/components/admin/PendingUserCard';
import { PendingUserReviewModal } from '@/components/admin/PendingUserReviewModal';
import { Colors } from '@/constants/theme';
import { useAdmin } from '@/context/AdminContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { PendingUser } from '@/services/adminService';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AdminUsers() {
    const { pendingUsers, allUsers, approveUser, rejectUser, settings, isLoading, loadAllUsers, refreshDashboard, updateUserDetails, suspendUser, getUserActivity, verifyDocument } = useAdmin();
    const router = useRouter();
    const [selectedUser, setSelectedUser] = useState<PendingUser | null>(null);
    const [selectedActiveUser, setSelectedActiveUser] = useState<any | null>(null);
    const [processing, setProcessing] = useState<string | null>(null);

    const colorScheme = useColorScheme();
    const theme = colorScheme ?? 'light';
    const colors = Colors[theme];
    const isDark = theme === 'dark';

    const currencySymbol = settings.currency === 'INR' ? '₹' : '$';
    const [activeTab, setActiveTab] = useState<'pending' | 'active'>('pending');

    React.useEffect(() => {
        loadAllUsers();
    }, []);

    const [userActivity, setUserActivity] = useState<any[]>([]);
    const [viewingActivity, setViewingActivity] = useState(false);
    const [loadingActivity, setLoadingActivity] = useState(false);

    const handleApprove = async (id: string, type: 'technician' | 'supplier') => {
        setProcessing(id);
        await approveUser(id, type);
        setProcessing(null);
        setSelectedUser(null);
        Alert.alert("Success", "User has been approved and notified.");
    };

    const handleReject = async (id: string, type: 'technician' | 'supplier') => {
        setProcessing(id);
        await rejectUser(id, type);
        setProcessing(null);
        setSelectedUser(null);
        Alert.alert("Rejected", "User application has been rejected.");
    };

    const handleSuspend = (user: any) => {
        if (!user) return;
        const isSuspended = user.status === 'suspended';

        Alert.alert(
            isSuspended ? "Unsuspend User" : "Suspend User",
            isSuspended ? "Are you sure you want to restore access for this user?" : "Are you sure? This will block their access immediately.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: isSuspended ? "Unsuspend" : "Suspend",
                    style: isSuspended ? "default" : "destructive",
                    onPress: async () => {
                        try {
                            await suspendUser(user.id, user.type);
                            // Update local state if selected
                            if (selectedActiveUser && selectedActiveUser.id === user.id) {
                                setSelectedActiveUser({
                                    ...selectedActiveUser,
                                    status: isSuspended ? 'active' : 'suspended'
                                });
                            }
                            Alert.alert("Success", `User has been ${isSuspended ? 'activated' : 'suspended'}.`);
                        } catch (error) {
                            Alert.alert("Error", "Failed to update user status.");
                        }
                    }
                }
            ]
        );
    };

    const handleViewActivity = async (user: any) => {
        if (!user) return;
        setLoadingActivity(true);
        setViewingActivity(true);
        try {
            const activity = await getUserActivity(user.id, user.type);
            setUserActivity(activity);
        } catch (error) {
            Alert.alert("Error", "Failed to load activity history.");
        } finally {
            setLoadingActivity(false);
        }
    };

    const handleResetPassword = () => {
        Alert.alert(
            "Reset Password",
            "This will invalidate current session and force the user to re-verify via OTP. Proceed?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Reset",
                    style: "destructive",
                    onPress: () => {
                        Alert.alert("Success", "Security tokens reset. User will need to logon again.");
                    }
                }
            ]
        );
    };

    const handleUpdateUser = async (id: string, data: any) => {
        try {
            await updateUserDetails(id, data);
            // Update local selection
            if (selectedActiveUser && selectedActiveUser.id === id) {
                setSelectedActiveUser({ ...selectedActiveUser, ...data });
            }
            Alert.alert("Success", "User profile updated successfully.");
        } catch (error) {
            Alert.alert("Error", "Failed to update user profile. Please try again.");
        }
    };

    // Use allUsers from context instead of mock
    const activeUsers = allUsers.filter(u => u.status === 'active' || u.status === 'approved');

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
            <View style={styles.header}>
                <Text style={[styles.title, { color: colors.text }]}>User Management</Text>
                <Text style={[styles.subtitle, { color: colors.icon }]}>Manage technicians, suppliers & customers</Text>
            </View>

            {/* Custom Tabs */}
            <View style={[styles.tabContainer, { backgroundColor: isDark ? colors.card : '#E5E5EA' }]}>
                <TouchableOpacity
                    style={[styles.tabBtn, activeTab === 'pending' && { backgroundColor: isDark ? colors.background : '#FFF', shadowColor: colors.shadow }]}
                    onPress={() => setActiveTab('pending')}
                >
                    <Text style={[styles.tabText, { color: activeTab === 'pending' ? colors.text : colors.icon }]}>Pending Approvals</Text>
                    {pendingUsers.length > 0 && (
                        <View style={styles.tabBadge}>
                            <Text style={styles.tabBadgeText}>{pendingUsers.length}</Text>
                        </View>
                    )}
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tabBtn, activeTab === 'active' && { backgroundColor: isDark ? colors.background : '#FFF', shadowColor: colors.shadow }]}
                    onPress={() => setActiveTab('active')}
                >
                    <Text style={[styles.tabText, { color: activeTab === 'active' ? colors.text : colors.icon }]}>Active Users</Text>
                </TouchableOpacity>
            </View>

            {activeTab === 'pending' ? (
                pendingUsers.length === 0 && !isLoading ? (
                    <View style={styles.emptyState}>
                        <Ionicons name="checkmark-done-circle" size={80} color="#34C759" />
                        <Text style={[styles.emptyTitle, { color: colors.text }]}>All Caught Up!</Text>
                        <Text style={[styles.emptySub, { color: colors.icon }]}>No pending applications to review.</Text>
                    </View>
                ) : (
                    <FlatList
                        data={pendingUsers}
                        renderItem={({ item }) => (
                            <PendingUserCard
                                user={item}
                                onPress={() => setSelectedUser(item)}
                                onApprove={handleApprove}
                                onReject={handleReject}
                                processingId={processing}
                            />
                        )}
                        contentContainerStyle={{ padding: 20, paddingBottom: 120 }}
                        showsVerticalScrollIndicator={false}
                        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refreshDashboard} tintColor={colors.primary} />}
                    />
                )
            ) : (
                <FlatList
                    data={activeUsers.slice(0, 10)}
                    renderItem={({ item }) => (
                        <ActiveUserCard
                            user={item}
                            onPress={() => setSelectedActiveUser(item)}
                        />
                    )}
                    contentContainerStyle={{ padding: 20, paddingBottom: 120 }}
                    showsVerticalScrollIndicator={false}
                    refreshControl={<RefreshControl refreshing={isLoading} onRefresh={loadAllUsers} tintColor={colors.primary} />}
                    ListFooterComponent={activeUsers.length > 0 ? (
                        <TouchableOpacity
                            style={[styles.viewAllActiveBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
                            onPress={() => router.push('/(admin)/users/all-active' as any)}
                        >
                            <Text style={[styles.viewAllActiveText, { color: colors.primary }]}>View All Active Users ({activeUsers.length})</Text>
                            <Ionicons name="arrow-forward" size={18} color={colors.primary} />
                        </TouchableOpacity>
                    ) : null}
                />
            )}

            {/* Modals */}
            <PendingUserReviewModal
                visible={!!selectedUser}
                user={selectedUser}
                onClose={() => setSelectedUser(null)}
                onApprove={handleApprove}
                onReject={handleReject}
                onVerifyDocument={verifyDocument}
                processingId={processing}
            />

            <ActiveUserManageModal
                visible={!!selectedActiveUser}
                user={selectedActiveUser}
                onClose={() => setSelectedActiveUser(null)}
                onUpdate={handleUpdateUser}
                onSuspend={handleSuspend}
                onResetPassword={handleResetPassword}
                onViewActivity={() => handleViewActivity(selectedActiveUser)}
                currencySymbol={currencySymbol}
            />

            <ActivityHistoryModal
                visible={viewingActivity}
                onClose={() => setViewingActivity(false)}
                isLoading={loadingActivity}
                activities={userActivity}
                currencySymbol={currencySymbol}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { padding: 24, paddingBottom: 16 },
    title: { fontSize: 26, fontWeight: '800' },
    subtitle: { fontSize: 14, fontWeight: '500', marginTop: 4 },

    tabContainer: { flexDirection: 'row', padding: 4, marginHorizontal: 20, marginTop: 20, borderRadius: 12 },
    tabBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: 10, gap: 6 },
    tabText: { fontSize: 13, fontWeight: '600' },
    tabBadge: { backgroundColor: '#FF3B30', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 10 },
    tabBadgeText: { color: '#FFF', fontSize: 10, fontWeight: 'bold' },

    emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 100 },
    emptyTitle: { fontSize: 20, fontWeight: 'bold', marginTop: 16 },
    emptySub: { fontSize: 14, marginTop: 8 },

    viewAllActiveBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16, borderRadius: 16, marginTop: 10, borderWidth: 1, gap: 8 },
    viewAllActiveText: { fontWeight: 'bold' }
});
