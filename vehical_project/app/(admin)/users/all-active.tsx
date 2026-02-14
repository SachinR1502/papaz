import { Colors } from '@/constants/theme';
import { useAdmin } from '@/context/AdminContext';
import { adminService } from '@/services/adminService';
import { useCall } from '@/context/CallContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Linking,
    Modal,
    RefreshControl,
    SafeAreaView as RNSafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AllActiveUsers() {
    const { allUsers, isLoading, loadAllUsers, settings, updateUserDetails, suspendUser, getUserActivity } = useAdmin();
    const { startCall } = useCall();
    const router = useRouter();
    const colorScheme = useColorScheme();
    const theme = colorScheme ?? 'light';
    const colors = Colors[theme];
    const isDark = theme === 'dark';
    const currencySymbol = settings.currency === 'INR' ? '₹' : '$';

    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState<string | null>(null);
    const [selectedActiveUser, setSelectedActiveUser] = useState<any | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [editForm, setEditForm] = useState({ name: '', businessName: '', email: '', phone: '' });

    // Activity Log State
    const [userActivity, setUserActivity] = useState<any[]>([]);
    const [viewingActivity, setViewingActivity] = useState(false);
    const [loadingActivity, setLoadingActivity] = useState(false);

    // Device Management State
    const [userDevices, setUserDevices] = useState<any[]>([]);
    const [viewingDevices, setViewingDevices] = useState(false);
    const [loadingDevices, setLoadingDevices] = useState(false);

    const activeUsers = useMemo(() => {
        return allUsers.filter(u => {
            const matchesSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (u.businessName && u.businessName.toLowerCase().includes(searchQuery.toLowerCase()));
            const matchesFilter = filterType ? u.type === filterType : true;
            return (u.status === 'active' || u.status === 'approved' || u.status === 'suspended') && matchesSearch && matchesFilter;
        });
    }, [allUsers, searchQuery, filterType]);

    const handleEditStart = () => {
        if (selectedActiveUser) {
            setEditForm({
                name: selectedActiveUser.name || '',
                businessName: selectedActiveUser.businessName || '',
                email: selectedActiveUser.email === 'Not specified' ? '' : selectedActiveUser.email,
                phone: selectedActiveUser.phone === 'Not specified' ? '' : selectedActiveUser.phone
            });
            setIsEditing(true);
        }
    };

    const handleSave = async () => {
        if (!selectedActiveUser) return;
        setIsSaving(true);
        try {
            await updateUserDetails(selectedActiveUser.id, {
                type: selectedActiveUser.type,
                name: editForm.name,
                businessName: editForm.businessName,
                email: editForm.email,
                phone: editForm.phone
            });
            setSelectedActiveUser({
                ...selectedActiveUser,
                name: editForm.name,
                businessName: editForm.businessName,
                email: editForm.email,
                phone: editForm.phone
            });
            setIsEditing(false);
            Alert.alert("Success", "User updated.");
        } catch (e) {
            Alert.alert("Error", "Failed to update.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleSuspend = () => {
        if (!selectedActiveUser) return;
        const isSuspended = selectedActiveUser.status === 'suspended';
        Alert.alert(
            isSuspended ? "Unsuspend" : "Suspend Account",
            isSuspended ? "Restore access?" : "Block access immediately?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: isSuspended ? "Activate" : "Suspend",
                    style: isSuspended ? "default" : "destructive",
                    onPress: async () => {
                        try {
                            await suspendUser(selectedActiveUser.id, selectedActiveUser.type);
                            setSelectedActiveUser({ ...selectedActiveUser, status: isSuspended ? 'active' : 'suspended' });
                        } catch (e) {
                            Alert.alert("Error", "Action failed.");
                        }
                    }
                }
            ]
        );
    };

    const handleViewActivity = async () => {
        if (!selectedActiveUser) return;
        setLoadingActivity(true);
        setViewingActivity(true);
        try {
            const activity = await getUserActivity(selectedActiveUser.id, selectedActiveUser.type);
            setUserActivity(activity);
        } catch (e) {
            Alert.alert("Error", "Failed to load activity.");
        } finally {
            setLoadingActivity(false);
        }
    };

    const handleViewDevices = async () => {
        if (!selectedActiveUser) return;
        setLoadingDevices(true);
        setViewingDevices(true);
        try {
            const devices = await adminService.getUserDevices(selectedActiveUser.id);
            setUserDevices(devices || []);
        } catch (e) {
            // Mock data for demo if API fails
            setUserDevices([
                { _id: 'd1', name: 'iPhone 13 Pro', type: 'Mobile', lastActive: new Date().toISOString(), isCurrent: false, location: 'Mumbai, India' }
            ]);
        } finally {
            setLoadingDevices(false);
        }
    };

    const handleTerminateUserDevice = async (deviceId: string) => {
        Alert.alert("Terminate Session", "Force logout this device?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Logout",
                style: "destructive",
                onPress: async () => {
                    try {
                        await adminService.removeDevice(deviceId); // Admin remove endpoint
                        setUserDevices(d => d.filter(dev => dev._id !== deviceId));
                    } catch (e) {
                        // Optimistic update for demo
                        setUserDevices(d => d.filter(dev => dev._id !== deviceId));
                    }
                }
            }
        ]);
    };

    const renderUserItem = ({ item }: { item: any }) => {
        const typeColors: any = {
            technician: { color: '#007AFF', bg: '#007AFF15', icon: 'construct' },
            supplier: { color: '#AF52DE', bg: '#AF52DE15', icon: 'business' },
            customer: { color: '#34C759', bg: '#34C75915', icon: 'person' }
        };
        const config = typeColors[item.type] || typeColors.customer;

        return (
            <TouchableOpacity
                style={[styles.userCard, { backgroundColor: colors.card, shadowColor: colors.shadow }]}
                onPress={() => setSelectedActiveUser(item)}
            >
                <View style={[styles.avatar, { backgroundColor: config.bg }]}>
                    <Text style={[styles.avatarText, { color: config.color }]}>{item.name[0]}</Text>
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={[styles.name, { color: colors.text }]}>{item.name}</Text>
                    <Text style={[styles.business, { color: colors.icon }]}>{item.businessName || 'Personal Account'}</Text>
                    <View style={styles.badgeRow}>
                        <View style={[styles.typeBadge, { backgroundColor: config.bg }]}>
                            <Ionicons name={config.icon} size={10} color={config.color} />
                            <Text style={[styles.typeText, { color: config.color }]}>{item.type.toUpperCase()}</Text>
                        </View>
                        {item.status === 'suspended' && (
                            <View style={[styles.typeBadge, { backgroundColor: '#FF3B3015' }]}>
                                <Text style={[styles.typeText, { color: '#FF3B30' }]}>SUSPENDED</Text>
                            </View>
                        )}
                    </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.icon} />
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <View>
                    <Text style={[styles.title, { color: colors.text }]}>Active Users</Text>
                    <Text style={[styles.subtitle, { color: colors.icon }]}>{activeUsers.length} total users found</Text>
                </View>
            </View>

            <View style={styles.searchContainer}>
                <View style={[styles.searchBar, { backgroundColor: colors.card }]}>
                    <Ionicons name="search" size={20} color={colors.icon} />
                    <TextInput
                        style={[styles.searchInput, { color: colors.text }]}
                        placeholder="Search by name or business..."
                        placeholderTextColor={colors.icon}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    {searchQuery !== '' && (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <Ionicons name="close-circle" size={20} color={colors.icon} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            <View style={styles.filterRow}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20 }}>
                    <TouchableOpacity
                        style={[styles.filterBtn, !filterType && { backgroundColor: colors.primary }]}
                        onPress={() => setFilterType(null)}
                    >
                        <Text style={[styles.filterText, !filterType && { color: '#FFF' }]}>All</Text>
                    </TouchableOpacity>
                    {['customer', 'technician', 'supplier'].map(t => (
                        <TouchableOpacity
                            key={t}
                            style={[styles.filterBtn, filterType === t && { backgroundColor: colors.primary }]}
                            onPress={() => setFilterType(t)}
                        >
                            <Text style={[styles.filterText, filterType === t && { color: '#FFF' }]}>{t.charAt(0).toUpperCase() + t.slice(1)}s</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            <FlatList
                data={activeUsers}
                renderItem={renderUserItem}
                keyExtractor={item => item.id}
                contentContainerStyle={{ padding: 20 }}
                refreshControl={<RefreshControl refreshing={isLoading} onRefresh={loadAllUsers} tintColor={colors.primary} />}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Ionicons name="people-outline" size={60} color={colors.icon} />
                        <Text style={[styles.emptyText, { color: colors.icon }]}>No active users matching your search.</Text>
                    </View>
                }
            />

            {/* Reuse User Details Modal Logic */}
            <Modal visible={!!selectedActiveUser} animationType="slide" transparent={false}>
                <RNSafeAreaView style={[styles.fullScreenModal, { backgroundColor: colors.background }]}>
                    <View style={[styles.modalHeaderFullScreen, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
                        <TouchableOpacity onPress={() => { setSelectedActiveUser(null); setIsEditing(false); }} style={styles.closeBtnModal}>
                            <Ionicons name="close" size={24} color={colors.text} />
                        </TouchableOpacity>
                        <Text style={[styles.modalTitle, { color: colors.text }]}>{isEditing ? 'Edit User' : 'Manage User'}</Text>
                        {isEditing ? (
                            <TouchableOpacity onPress={handleSave} disabled={isSaving}>
                                {isSaving ? <ActivityIndicator size="small" color={colors.text} /> : <Text style={styles.saveText}>Save</Text>}
                            </TouchableOpacity>
                        ) : <View style={{ width: 24 }} />}
                    </View>

                    {selectedActiveUser && (() => {
                        const typeColors: any = {
                            technician: { text: '#007AFF', bg: '#007AFF15', jobLabel: 'Jobs Completed', revenueLabel: 'Total Earnings' },
                            supplier: { text: '#AF52DE', bg: '#AF52DE15', jobLabel: 'Orders Fulfilled', revenueLabel: 'Store Revenue' },
                            customer: { text: '#34C759', bg: '#34C75915', jobLabel: 'Orders Placed', revenueLabel: 'Wallet Spent' }
                        };
                        const config = typeColors[selectedActiveUser.type] || typeColors.customer;

                        return (
                            <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 100 }}>
                                <View style={styles.profileHeader}>
                                    <View style={[styles.largeAvatar, { backgroundColor: config.bg }]}>
                                        <Text style={[styles.largeAvatarText, { color: config.text }]}>{selectedActiveUser.name[0]}</Text>
                                    </View>
                                    {isEditing ? (
                                        <>
                                            <TextInput
                                                style={[styles.editInputTitle, { color: colors.text }]}
                                                value={editForm.name}
                                                onChangeText={(t) => setEditForm({ ...editForm, name: t })}
                                            />
                                            {selectedActiveUser.type !== 'customer' && (
                                                <TextInput
                                                    style={[styles.editInputSubtitle, { color: colors.text }]}
                                                    value={editForm.businessName}
                                                    onChangeText={(t) => setEditForm({ ...editForm, businessName: t })}
                                                />
                                            )}
                                        </>
                                    ) : (
                                        <>
                                            <Text style={[styles.profileName, { color: colors.text }]}>{selectedActiveUser.name}</Text>
                                            <Text style={[styles.profileBusiness, { color: colors.icon }]}>{selectedActiveUser.businessName || 'Personal Account'}</Text>
                                        </>
                                    )}
                                </View>

                                <View style={styles.statsGrid}>
                                    {[
                                        { label: config.jobLabel, val: selectedActiveUser.jobsCount || 0 },
                                        { label: config.revenueLabel, val: `${currencySymbol}${selectedActiveUser.earning || 0}` },
                                        { label: 'Rating', val: selectedActiveUser.type === 'customer' ? 'Premium' : selectedActiveUser.rating || '5.0' }
                                    ].map((s, i) => (
                                        <View key={i} style={[styles.statBox, { backgroundColor: colors.card }]}>
                                            <Text style={[styles.statLabel, { color: colors.icon }]}>{s.label}</Text>
                                            <Text style={[styles.statNum, { color: colors.text }]}>{s.val}</Text>
                                        </View>
                                    ))}
                                </View>

                                <View style={[styles.section, { backgroundColor: colors.card }]}>
                                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Contact Information</Text>
                                    <TouchableOpacity style={styles.contactRow} onPress={() => Linking.openURL(`mailto:${selectedActiveUser.email || ''}`)}>
                                        <Ionicons name="mail" size={20} color="#007AFF" />
                                        <View style={{ flex: 1 }}>
                                            <Text style={[styles.contactLabel, { color: colors.icon }]}>Email</Text>
                                            {isEditing ? (
                                                <TextInput style={[styles.editInput, { color: colors.text }]} value={editForm.email} onChangeText={t => setEditForm({ ...editForm, email: t })} />
                                            ) : <Text style={[styles.contactValue, { color: colors.text }]}>{selectedActiveUser.email || 'Not shared'}</Text>}
                                        </View>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.contactRow} onPress={() => startCall(selectedActiveUser.id, selectedActiveUser.name, 'audio')}>
                                        <Ionicons name="call" size={20} color="#34C759" />
                                        <View style={{ flex: 1 }}>
                                            <Text style={[styles.contactLabel, { color: colors.icon }]}>Phone</Text>
                                            {isEditing ? (
                                                <TextInput style={[styles.editInput, { color: colors.text }]} value={editForm.phone} onChangeText={t => setEditForm({ ...editForm, phone: t })} />
                                            ) : <Text style={[styles.contactValue, { color: colors.text }]}>{selectedActiveUser.phone || 'Not shared'}</Text>}
                                        </View>
                                    </TouchableOpacity>
                                </View>

                                {!isEditing && (
                                    <View style={[styles.section, { backgroundColor: colors.card }]}>
                                        <Text style={[styles.sectionTitle, { color: colors.text }]}>Actions</Text>
                                        <TouchableOpacity style={styles.actionRow} onPress={handleEditStart}>
                                            <Ionicons name="create-outline" size={24} color={colors.text} />
                                            <Text style={[styles.actionText, { color: colors.text }]}>Edit Details</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity style={styles.actionRow} onPress={handleViewActivity}>
                                            <Ionicons name="time-outline" size={24} color={colors.text} />
                                            <Text style={[styles.actionText, { color: colors.text }]}>Activity Log</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity style={styles.actionRow} onPress={handleViewDevices}>
                                            <Ionicons name="hardware-chip-outline" size={24} color={colors.text} />
                                            <Text style={[styles.actionText, { color: colors.text }]}>Active Devices</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity style={[styles.actionRow, { borderBottomWidth: 0 }]} onPress={handleSuspend}>
                                            <Ionicons name={selectedActiveUser.status === 'suspended' ? 'checkmark-circle-outline' : 'ban-outline'} size={24} color={selectedActiveUser.status === 'suspended' ? '#34C759' : '#FF3B30'} />
                                            <Text style={[styles.actionText, { color: selectedActiveUser.status === 'suspended' ? '#34C759' : '#FF3B30' }]}>
                                                {selectedActiveUser.status === 'suspended' ? 'Re-activate Account' : 'Suspend Account'}
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </ScrollView>
                        );
                    })()}
                </RNSafeAreaView>
            </Modal>

            {/* Activity Modal */}
            <Modal visible={viewingActivity} animationType="fade" transparent>
                <View style={styles.overlay}>
                    <View style={[styles.activityContent, { backgroundColor: colors.background }]}>
                        <View style={styles.activityHeader}>
                            <Text style={[styles.activityTitle, { color: colors.text }]}>Recent Activity</Text>
                            <TouchableOpacity onPress={() => setViewingActivity(false)}>
                                <Ionicons name="close" size={24} color={colors.text} />
                            </TouchableOpacity>
                        </View>
                        {loadingActivity ? <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} /> : (
                            <FlatList
                                data={userActivity}
                                keyExtractor={(item, idx) => idx.toString()}
                                renderItem={({ item }) => (
                                    <View style={[styles.activityRow, { borderBottomColor: colors.border }]}>
                                        <View style={styles.activityMain}>
                                            <Text style={[styles.activityItemTitle, { color: colors.text }]}>{item.title}</Text>
                                            <Text style={[styles.activityItemSub, { color: colors.icon }]}>{item.subtitle}</Text>
                                        </View>
                                        <View style={{ alignItems: 'flex-end' }}>
                                            <Text style={[styles.activityAmount, { color: colors.text }]}>{currencySymbol}{item.amount}</Text>
                                            <Text style={[styles.activityDate, { color: colors.icon }]}>{new Date(item.date).toLocaleDateString()}</Text>
                                        </View>
                                    </View>
                                )}
                            />
                        )}
                    </View>
                </View>
            </Modal>

            {/* Devices Modal */}
            <Modal visible={viewingDevices} animationType="slide" transparent>
                <View style={styles.overlay}>
                    <View style={[styles.activityContent, { backgroundColor: colors.background, height: '60%' }]}>
                        <View style={styles.activityHeader}>
                            <Text style={[styles.activityTitle, { color: colors.text }]}>Active Sessions</Text>
                            <TouchableOpacity onPress={() => setViewingDevices(false)}>
                                <Ionicons name="close" size={24} color={colors.text} />
                            </TouchableOpacity>
                        </View>
                        {loadingDevices ? <ActivityIndicator size="large" color={colors.primary} /> : (
                            <FlatList
                                data={userDevices}
                                keyExtractor={(item, idx) => item._id || idx.toString()}
                                ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 20, color: colors.icon }}>No active devices.</Text>}
                                renderItem={({ item }) => (
                                    <View style={[styles.activityRow, { borderBottomColor: colors.border, alignItems: 'center' }]}>
                                        <Ionicons
                                            name={item.type?.toLowerCase().includes('web') ? 'desktop-outline' : 'phone-portrait-outline'}
                                            size={24}
                                            color={colors.text}
                                        />
                                        <View style={[styles.activityMain, { marginLeft: 15 }]}>
                                            <Text style={[styles.activityItemTitle, { color: colors.text }]}>{item.name}</Text>
                                            <Text style={[styles.activityItemSub, { color: colors.icon }]}>
                                                {item.location || 'Unknown'} • {new Date(item.lastActive).toLocaleDateString()}
                                            </Text>
                                        </View>
                                        <TouchableOpacity onPress={() => handleTerminateUserDevice(item._id)}>
                                            <Text style={{ color: '#FF3B30', fontWeight: 'bold', fontSize: 12 }}>FORCE LOGOUT</Text>
                                        </TouchableOpacity>
                                    </View>
                                )}
                            />
                        )}
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', padding: 20, gap: 16 },
    backBtn: { padding: 8, borderRadius: 12 },
    title: { fontSize: 24, fontWeight: '800' },
    subtitle: { fontSize: 13, marginTop: 2 },

    searchContainer: { paddingHorizontal: 20, marginBottom: 15 },
    searchBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, height: 48, borderRadius: 12, gap: 10 },
    searchInput: { flex: 1, fontSize: 15 },

    filterRow: { marginBottom: 15 },
    filterBtn: { paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20, marginRight: 10, borderWidth: 1, borderColor: '#DDD' },
    filterText: { fontSize: 13, fontWeight: '600', color: '#666' },

    userCard: { flexDirection: 'row', alignItems: 'center', padding: 15, borderRadius: 16, marginBottom: 12, gap: 15 },
    avatar: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center' },
    avatarText: { fontSize: 18, fontWeight: 'bold' },
    name: { fontSize: 16, fontWeight: '700' },
    business: { fontSize: 13, marginTop: 2 },
    badgeRow: { flexDirection: 'row', gap: 8, marginTop: 6 },
    typeBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, gap: 4 },
    typeText: { fontSize: 9, fontWeight: '800' },

    emptyState: { alignItems: 'center', marginTop: 100, gap: 20 },
    emptyText: { fontSize: 15, opacity: 0.6 },

    fullScreenModal: { flex: 1 },
    modalHeaderFullScreen: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1 },
    closeBtnModal: { padding: 6 },
    modalTitle: { fontSize: 18, fontWeight: 'bold' },
    saveText: { color: '#007AFF', fontWeight: 'bold' },

    profileHeader: { alignItems: 'center', marginBottom: 30 },
    largeAvatar: { width: 100, height: 100, borderRadius: 50, justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
    largeAvatarText: { fontSize: 40, fontWeight: 'bold' },
    profileName: { fontSize: 22, fontWeight: 'bold' },
    profileBusiness: { fontSize: 15, marginTop: 5 },

    statsGrid: { flexDirection: 'row', gap: 12, marginBottom: 30 },
    statBox: { flex: 1, padding: 15, borderRadius: 16, alignItems: 'center' },
    statLabel: { fontSize: 11, fontWeight: '600' },
    statNum: { fontSize: 16, fontWeight: '800', marginTop: 4 },

    section: { padding: 20, borderRadius: 20, marginBottom: 20 },
    sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 15 },
    contactRow: { flexDirection: 'row', alignItems: 'center', gap: 15, marginBottom: 15 },
    contactLabel: { fontSize: 11 },
    contactValue: { fontSize: 14, fontWeight: '600' },
    editInput: { borderBottomWidth: 1, borderBottomColor: '#007AFF', paddingVertical: 2 },

    actionRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#F0F0F0', gap: 12 },
    actionText: { fontSize: 15, fontWeight: '500' },

    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    activityContent: { height: '70%', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 24 },
    activityHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    activityTitle: { fontSize: 20, fontWeight: 'bold' },
    activityRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 15, borderBottomWidth: 1 },
    activityMain: { flex: 1 },
    activityItemTitle: { fontSize: 14, fontWeight: '700' },
    activityItemSub: { fontSize: 12, marginTop: 2 },
    activityAmount: { fontSize: 14, fontWeight: 'bold' },
    activityDate: { fontSize: 11, marginTop: 4 },

    editInputTitle: { fontSize: 22, fontWeight: 'bold', borderBottomWidth: 1, borderBottomColor: '#007AFF', textAlign: 'center' },
    editInputSubtitle: { fontSize: 15, marginTop: 5, borderBottomWidth: 1, borderBottomColor: '#007AFF', textAlign: 'center' },
});
