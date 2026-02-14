import { StatusBadge } from '@/components/ui/StatusBadge';
import { Colors } from '@/constants/theme';
import { useCall } from '@/context/CallContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Linking, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface ActiveUserManageModalProps {
    visible: boolean;
    user: any | null;
    onClose: () => void;
    onUpdate: (id: string, data: any) => Promise<void>;
    onSuspend: (user: any) => void;
    onResetPassword: () => void;
    onViewActivity: () => void;
    currencySymbol: string;
}

export const ActiveUserManageModal = ({
    visible,
    user,
    onClose,
    onUpdate,
    onSuspend,
    onResetPassword,
    onViewActivity,
    currencySymbol
}: ActiveUserManageModalProps) => {
    const colorScheme = useColorScheme();
    const theme = colorScheme ?? 'light';
    const colors = Colors[theme];
    const isDark = theme === 'dark';
    const { startCall } = useCall();

    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [editForm, setEditForm] = useState({ name: '', businessName: '', email: '', phone: '' });

    useEffect(() => {
        if (user) {
            setEditForm({
                name: user.name || '',
                businessName: user.businessName || '',
                email: user.email === 'Not specified' ? '' : user.email,
                phone: user.phone === 'Not specified' ? '' : user.phone
            });
            setIsEditing(false); // Reset edit mode when user changes
        }
    }, [user]);

    const handleSave = async () => {
        if (!user) return;
        setIsSaving(true);
        try {
            await onUpdate(user.id, {
                type: user.type,
                name: editForm.name,
                businessName: editForm.businessName,
                email: editForm.email,
                phone: editForm.phone
            });
            setIsEditing(false);
        } catch (error) {
            // Error handled by parent usually, but we stop loading here
        } finally {
            setIsSaving(false);
        }
    };

    if (!user) return null;

    const typeColors: any = {
        technician: { text: '#007AFF', bg: '#007AFF15', jobLabel: 'Jobs Completed', revenueLabel: 'Total Earnings' },
        supplier: { text: '#AF52DE', bg: '#AF52DE15', jobLabel: 'Orders Fulfilled', revenueLabel: 'Store Revenue' },
        customer: { text: '#34C759', bg: '#34C75915', jobLabel: 'Orders Placed', revenueLabel: 'Wallet Spent' }
    };
    const config = typeColors[user.type] || typeColors.customer;

    return (
        <Modal visible={visible} animationType="slide" transparent={false}>
            <SafeAreaView style={[styles.fullScreenModal, { backgroundColor: colors.background }]}>
                <View style={[styles.modalHeaderFullScreen, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
                    <TouchableOpacity onPress={() => { setIsEditing(false); onClose(); }} style={styles.closeBtn}>
                        <Ionicons name="close" size={24} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={[styles.modalTitle, { color: colors.text }]}>{isEditing ? 'Edit User' : 'Manage User'}</Text>
                    {isEditing ? (
                        <TouchableOpacity onPress={handleSave} disabled={isSaving}>
                            {isSaving ? (
                                <ActivityIndicator size="small" color={colors.text} />
                            ) : (
                                <Text style={styles.saveText}>Save</Text>
                            )}
                        </TouchableOpacity>
                    ) : (
                        <View style={{ width: 24 }} />
                    )}
                </View>

                <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 100 }}>
                    {/* Profile Header */}
                    <View style={styles.profileHeader}>
                        <View style={[styles.largeAvatar, { backgroundColor: isDark ? config.bg : config.bg }]}>
                            <Text style={[styles.largeAvatarText, { color: config.text }]}>{user.name[0]}</Text>
                        </View>
                        {isEditing ? (
                            <>
                                <TextInput
                                    style={[styles.editInputTitle, { color: colors.text }]}
                                    value={editForm.name}
                                    onChangeText={(t) => setEditForm({ ...editForm, name: t })}
                                    placeholder="User Name"
                                    placeholderTextColor={colors.icon}
                                />
                                {user.type !== 'customer' && (
                                    <TextInput
                                        style={[styles.editInputSubtitle, { color: colors.text }]}
                                        value={editForm.businessName}
                                        onChangeText={(t) => setEditForm({ ...editForm, businessName: t })}
                                        placeholder="Business Name"
                                        placeholderTextColor={colors.icon}
                                    />
                                )}
                            </>
                        ) : (
                            <>
                                <Text style={[styles.profileName, { color: colors.text }]}>{user.name}</Text>
                                {user.type !== 'customer' && (
                                    <Text style={[styles.profileBusiness, { color: colors.icon }]}>{user.businessName}</Text>
                                )}
                                <View style={{ marginTop: 8, alignSelf: 'center' }}>
                                    <StatusBadge status="active" size="small" showIcon={false} />
                                </View>
                            </>
                        )}
                        {user.type !== 'customer' && (
                            <View style={[styles.ratingContainer, { backgroundColor: colors.card, shadowColor: colors.shadow }]}>
                                <Ionicons name="star" size={16} color="#FFD60A" />
                                <Text style={[styles.ratingText, { color: colors.text }]}>{user.rating} (Rating)</Text>
                            </View>
                        )}
                    </View>

                    {/* Stats Grid */}
                    <View style={styles.statsGrid}>
                        <View style={[styles.statBox, { backgroundColor: colors.card, shadowColor: colors.shadow }]}>
                            <Text style={[styles.statLabel, { color: colors.icon }]}>{config.jobLabel}</Text>
                            <Text style={[styles.statNum, { color: colors.text }]}>{user.jobsCount || 0}</Text>
                        </View>
                        <View style={[styles.statBox, { backgroundColor: colors.card, shadowColor: colors.shadow }]}>
                            <Text style={[styles.statLabel, { color: colors.icon }]}>{config.revenueLabel}</Text>
                            <Text style={[styles.statNum, { color: colors.text }]}>{currencySymbol}{user.earning || 0}</Text>
                        </View>
                        <View style={[styles.statBox, { backgroundColor: colors.card, shadowColor: colors.shadow }]}>
                            <Text style={[styles.statLabel, { color: colors.icon }]}>Platform Rating</Text>
                            <Text style={[styles.statNum, { color: colors.text }]}>{user.type === 'customer' ? 'Top Tier' : user.rating || '5.0'}</Text>
                        </View>
                    </View>

                    {/* Contact Info */}
                    <View style={[styles.section, { backgroundColor: colors.card }]}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>Contact Information</Text>
                        <TouchableOpacity style={styles.contactRow} onPress={() => Linking.openURL(`mailto:${user.email || ''}`)}>
                            <View style={[styles.contactIcon, { backgroundColor: isDark ? colors.background : '#F2F2F7' }]}>
                                <Ionicons name="mail" size={20} color="#007AFF" />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={[styles.contactLabel, { color: colors.icon }]}>Email Address</Text>
                                {isEditing ? (
                                    <TextInput
                                        style={[styles.editInput, { color: colors.text }]}
                                        value={editForm.email}
                                        onChangeText={(t) => setEditForm({ ...editForm, email: t })}
                                    />
                                ) : (
                                    <Text style={[styles.contactValue, { color: colors.text }]}>{user.email || 'Not specified'}</Text>
                                )}
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.contactRow} onPress={() => startCall(user?.id || 'unknown_user', user?.name || 'User', 'audio')}>
                            <View style={[styles.contactIcon, { backgroundColor: isDark ? colors.background : '#F2F2F7' }]}>
                                <Ionicons name="call" size={20} color="#34C759" />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={[styles.contactLabel, { color: colors.icon }]}>Phone Number</Text>
                                {isEditing ? (
                                    <TextInput
                                        style={[styles.editInput, { color: colors.text }]}
                                        value={editForm.phone}
                                        onChangeText={(t) => setEditForm({ ...editForm, phone: t })}
                                    />
                                ) : (
                                    <Text style={[styles.contactValue, { color: colors.text }]}>{user.phone || 'Not specified'}</Text>
                                )}
                            </View>
                        </TouchableOpacity>
                    </View>

                    {/* Actions */}
                    {!isEditing && (
                        <View style={[styles.section, { backgroundColor: colors.card }]}>
                            <Text style={[styles.sectionTitle, { color: colors.text }]}>Account Actions</Text>
                            <TouchableOpacity
                                style={[styles.actionRow, { borderBottomColor: colors.border }]}
                                onPress={() => setIsEditing(true)}
                            >
                                <Ionicons name="create-outline" size={24} color={colors.text} />
                                <Text style={[styles.actionRowText, { color: colors.text }]}>Edit User Details</Text>
                                <Ionicons name="chevron-forward" size={20} color={colors.icon} />
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.actionRow, { borderBottomColor: colors.border }]}
                                onPress={onViewActivity}
                            >
                                <Ionicons name="time" size={24} color={colors.text} />
                                <Text style={[styles.actionRowText, { color: colors.text }]}>View Activity History</Text>
                                <Ionicons name="chevron-forward" size={20} color={colors.icon} />
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.actionRow, { borderBottomColor: colors.border }]}
                                onPress={onResetPassword}
                            >
                                <Ionicons name="key" size={24} color={colors.text} />
                                <Text style={[styles.actionRowText, { color: colors.text }]}>Reset Session</Text>
                                <Ionicons name="chevron-forward" size={20} color={colors.icon} />
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.actionRow, { borderBottomWidth: 0 }]} onPress={() => onSuspend(user)}>
                                <Ionicons
                                    name={user.status === 'suspended' ? "checkmark-circle" : "ban"}
                                    size={24}
                                    color={user.status === 'suspended' ? "#34C759" : "#FF3B30"}
                                />
                                <Text style={[styles.actionRowText, { color: user.status === 'suspended' ? "#34C759" : "#FF3B30" }]}>
                                    {user.status === 'suspended' ? "Activate Account" : "Suspend Account"}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </ScrollView>
            </SafeAreaView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    fullScreenModal: { flex: 1 },
    modalHeaderFullScreen: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 15, borderBottomWidth: 1 },
    modalTitle: { fontSize: 18, fontWeight: 'bold' },
    closeBtn: { padding: 4 },
    saveText: { color: '#007AFF', fontWeight: 'bold', fontSize: 16 },
    profileHeader: { alignItems: 'center', marginBottom: 24 },
    largeAvatar: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
    largeAvatarText: { fontSize: 32, fontWeight: 'bold' },
    profileName: { fontSize: 22, fontWeight: 'bold', marginBottom: 4, textAlign: 'center' },
    profileBusiness: { fontSize: 14, marginBottom: 8, textAlign: 'center' },
    ratingContainer: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, gap: 4, marginTop: 12, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
    ratingText: { fontSize: 13, fontWeight: '700' },
    statsGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24, gap: 12 },
    statBox: { flex: 1, padding: 12, borderRadius: 16, alignItems: 'center', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
    statLabel: { fontSize: 11, marginBottom: 4, textAlign: 'center' },
    statNum: { fontSize: 15, fontWeight: 'bold', textAlign: 'center' },
    section: { borderRadius: 16, padding: 16, marginBottom: 16 },
    sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 16 },
    contactRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
    contactIcon: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    contactLabel: { fontSize: 13, marginBottom: 4 },
    contactValue: { fontSize: 15, fontWeight: '500' },
    editInput: { borderBottomWidth: 1, borderBottomColor: '#C7C7CC', paddingVertical: 4, fontSize: 15, fontWeight: '500' },
    editInputTitle: { borderBottomWidth: 1, borderBottomColor: '#C7C7CC', paddingVertical: 4, fontSize: 22, fontWeight: 'bold', textAlign: 'center', minWidth: 120, marginBottom: 8 },
    editInputSubtitle: { borderBottomWidth: 1, borderBottomColor: '#C7C7CC', paddingVertical: 4, fontSize: 14, textAlign: 'center', minWidth: 150 },
    actionRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, gap: 12, borderBottomWidth: 1 },
    actionRowText: { flex: 1, fontSize: 16, fontWeight: '600' }
});
