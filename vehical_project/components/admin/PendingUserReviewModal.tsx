import { StatusBadge } from '@/components/ui/StatusBadge';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { PendingUser } from '@/services/adminService';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ActivityIndicator, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ImageModal } from '../ui/ImageModal';

interface PendingUserReviewModalProps {
    visible: boolean;
    user: PendingUser | null;
    onClose: () => void;
    onApprove: (id: string, type: 'technician' | 'supplier') => void;
    onReject: (id: string, type: 'technician' | 'supplier') => void;
    onVerifyDocument: (userId: string, userType: string, docType: string, status: boolean) => Promise<void>;
    processingId?: string | null;
}

export const PendingUserReviewModal = ({
    visible,
    user,
    onClose,
    onApprove,
    onReject,
    onVerifyDocument,
    processingId
}: PendingUserReviewModalProps) => {
    const colorScheme = useColorScheme();
    const theme = colorScheme ?? 'light';
    const colors = Colors[theme];
    const isDark = theme === 'dark';
    const [viewingDocUrl, setViewingDocUrl] = useState<string | null>(null);

    // Local state to track document verification changes immediately
    const [localDocuments, setLocalDocuments] = useState<any[]>([]);

    React.useEffect(() => {
        if (user?.documents) {
            setLocalDocuments(user.documents);
        }
    }, [user]);

    if (!user) return null;

    const handleVerifyDoc = async (doc: any, index: number) => {
        const newStatus = !doc.verified;
        // Optimistic update
        const updatedDocs = [...localDocuments];
        updatedDocs[index] = { ...doc, verified: newStatus };
        setLocalDocuments(updatedDocs);

        await onVerifyDocument(user.id, user.type, doc.type, newStatus);
    };

    return (
        <Modal visible={visible} animationType="slide" transparent={false}>
            <SafeAreaView style={[styles.fullScreenModal, { backgroundColor: colors.background }]}>
                <View style={[styles.modalHeaderFullScreen, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
                    <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                        <Ionicons name="close" size={24} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={[styles.modalTitle, { color: colors.text }]}>Review Application</Text>
                    <View style={{ width: 24 }} />
                </View>

                <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 100 }}>
                    {/* Profile Snapshot */}
                    <View style={styles.profileHeader}>
                        <View style={[styles.largeAvatar, { backgroundColor: isDark ? '#007AFF15' : '#007AFF10' }]}>
                            <Text style={[styles.largeAvatarText, { color: '#007AFF' }]}>{user.name[0]}</Text>
                        </View>
                        <Text style={[styles.profileName, { color: colors.text }]}>{user.name}</Text>
                        <Text style={[styles.profileBusiness, { color: colors.icon }]}>{user.businessName || 'Individual Professional'}</Text>
                        <View style={{ marginTop: 12 }}>
                            <StatusBadge status="pending" size="medium" />
                        </View>
                    </View>

                    {/* Section: Identity & Contact */}
                    <View style={[styles.section, { backgroundColor: colors.card }]}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>Identity & Contact</Text>
                        <View style={styles.profileDetailGrid}>
                            <View style={styles.profileDetailItem}>
                                <Text style={[styles.detailLabelSmall, { color: colors.icon }]}>Phone</Text>
                                <Text style={[styles.detailValueSmall, { color: colors.text }]}>{user.phone || 'N/A'}</Text>
                            </View>
                            <View style={styles.profileDetailItem}>
                                <Text style={[styles.detailLabelSmall, { color: colors.icon }]}>Email</Text>
                                <Text style={[styles.detailValueSmall, { color: colors.text }]}>{user.email || 'N/A'}</Text>
                            </View>
                            <View style={styles.profileDetailItem}>
                                <Text style={[styles.detailLabelSmall, { color: colors.icon }]}>Date of Birth</Text>
                                <Text style={[styles.detailValueSmall, { color: colors.text }]}>{user.dob || 'N/A'}</Text>
                            </View>
                            <View style={styles.profileDetailItem}>
                                <Text style={[styles.detailLabelSmall, { color: colors.icon }]}>Location</Text>
                                <Text style={[styles.detailValueSmall, { color: colors.text }]}>{user.location}</Text>
                            </View>
                            <View style={styles.profileDetailItem}>
                                <Text style={[styles.detailLabelSmall, { color: colors.icon }]}>Reg. Type</Text>
                                <Text style={[styles.detailValueSmall, { color: colors.text }]}>{user.registrationType?.toUpperCase() || 'N/A'}</Text>
                            </View>
                            <View style={styles.profileDetailItem}>
                                <Text style={[styles.detailLabelSmall, { color: colors.icon }]}>Udyam No</Text>
                                <Text style={[styles.detailValueSmall, { color: colors.text }]}>{user.udyamNo || 'N/A'}</Text>
                            </View>
                            <View style={styles.profileDetailItem}>
                                <Text style={[styles.detailLabelSmall, { color: colors.icon }]}>Service Radius</Text>
                                <Text style={[styles.detailValueSmall, { color: colors.text }]}>{user.serviceRadius || '10'} KM</Text>
                            </View>
                        </View>

                        <View style={[styles.divider, { backgroundColor: colors.border, marginVertical: 15 }]} />

                        <View style={styles.profileDetailGrid}>
                            <View style={styles.profileDetailItem}>
                                <Text style={[styles.detailLabelSmall, { color: colors.icon }]}>Aadhar Number</Text>
                                <Text style={[styles.detailValueSmall, { color: colors.text }]}>{user.aadharNo || 'N/A'}</Text>
                            </View>
                            <View style={styles.profileDetailItem}>
                                <Text style={[styles.detailLabelSmall, { color: colors.icon }]}>PAN Number</Text>
                                <Text style={[styles.detailValueSmall, { color: colors.text }]}>{user.panNo || 'N/A'}</Text>
                            </View>
                        </View>
                    </View>

                    {/* Section: Professional Profile */}
                    {user.type === 'technician' && (
                        <View style={[styles.section, { backgroundColor: colors.card }]}>
                            <Text style={[styles.sectionTitle, { color: colors.text }]}>Professional Profile</Text>
                            <View style={styles.profileDetailItem}>
                                <Text style={[styles.detailLabelSmall, { color: colors.icon }]}>Profession</Text>
                                <Text style={[styles.detailValueSmall, { color: colors.text, fontSize: 16 }]}>{user.profession || 'Not specified'}</Text>
                            </View>

                            <Text style={[styles.detailLabelSmall, { color: colors.icon, marginTop: 15, marginBottom: 8 }]}>Vehicle Specializations</Text>
                            <View style={styles.badgeRow}>
                                {user.vehicleTypes && user.vehicleTypes.length > 0 ? (
                                    user.vehicleTypes.map((type: string, idx: number) => (
                                        <View key={idx} style={[styles.skillBadge, { backgroundColor: isDark ? colors.background : '#F0F7FF' }]}>
                                            <Text style={[styles.skillBadgeText, { color: '#007AFF' }]}>{type.toUpperCase()}</Text>
                                        </View>
                                    ))
                                ) : (
                                    <Text style={{ color: colors.icon, fontSize: 13 }}>No specializations listed</Text>
                                )}
                            </View>

                            <Text style={[styles.detailLabelSmall, { color: colors.icon, marginTop: 15, marginBottom: 8 }]}>Technical Skills</Text>
                            <View style={styles.badgeRow}>
                                {user.technicalSkills && user.technicalSkills.length > 0 ? (
                                    user.technicalSkills.map((skill: string, idx: number) => (
                                        <View key={idx} style={[styles.skillBadge, { backgroundColor: isDark ? colors.background : '#F0FFF4' }]}>
                                            <Text style={[styles.skillBadgeText, { color: '#34C759' }]}>{skill}</Text>
                                        </View>
                                    ))
                                ) : (
                                    <Text style={{ color: colors.icon, fontSize: 13 }}>No skills listed</Text>
                                )}
                            </View>
                        </View>
                    )}

                    {/* Section: Bank Details */}
                    <View style={[styles.section, { backgroundColor: colors.card }]}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>Payout Information</Text>
                        {user.bankDetails ? (
                            <View style={styles.bankInfoBox}>
                                <View style={styles.bankHeader}>
                                    <Ionicons name="card" size={20} color={colors.primary} />
                                    <Text style={[styles.bankNameLabel, { color: colors.text }]}>Settlement Account</Text>
                                    {user.bankDetails.isVerified && (
                                        <View style={styles.verifiedBadgeSmall}>
                                            <Ionicons name="checkmark-circle" size={12} color="#FFF" />
                                            <Text style={styles.verifiedBadgeText}>Auto-Verified</Text>
                                        </View>
                                    )}
                                </View>
                                <View style={styles.bankRow}>
                                    <Text style={[styles.bankLabel, { color: colors.icon }]}>Account Holder</Text>
                                    <Text style={[styles.bankValue, { color: colors.text }]}>{user.bankDetails.holderName}</Text>
                                </View>
                                <View style={styles.bankRow}>
                                    <Text style={[styles.bankLabel, { color: colors.icon }]}>Account Number</Text>
                                    <Text style={[styles.bankValue, { color: colors.text }]}>{user.bankDetails.accountNo}</Text>
                                </View>
                                <View style={styles.bankRow}>
                                    <Text style={[styles.bankLabel, { color: colors.icon }]}>IFSC Code</Text>
                                    <Text style={[styles.bankValue, { color: colors.text }]}>{user.bankDetails.ifsc}</Text>
                                </View>
                            </View>
                        ) : (
                            <Text style={{ color: colors.icon, fontStyle: 'italic' }}>Bank details not provided yet.</Text>
                        )}
                    </View>

                    {/* Section: Documents */}
                    <View style={[styles.section, { backgroundColor: colors.card }]}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>Verification Documents</Text>
                        {Array.isArray(localDocuments) && localDocuments.length > 0 ? (
                            localDocuments.map((doc: any, idx: number) => (
                                <View key={idx} style={[styles.docItem, { backgroundColor: isDark ? colors.background : '#F8F9FE' }]}>
                                    <View style={[styles.docIcon, { backgroundColor: doc.verified ? '#34C75915' : '#FF950015' }]}>
                                        <Ionicons name="document-text" size={20} color={doc.verified ? '#34C759' : '#FF9500'} />
                                    </View>
                                    <View style={{ flex: 1, marginLeft: 12 }}>
                                        <Text style={[styles.docName, { color: colors.text }]}>{doc.type}</Text>
                                        <Text style={[styles.docStatus, { color: doc.verified ? '#34C759' : '#FF9500' }]}>
                                            {doc.verified ? 'Verified' : 'Review Required'}
                                        </Text>
                                    </View>
                                    <View style={{ flexDirection: 'row', gap: 8 }}>
                                        <TouchableOpacity
                                            onPress={() => setViewingDocUrl(doc.url)}
                                            style={[styles.miniActionBtn, { backgroundColor: colors.card }]}
                                        >
                                            <Ionicons name="eye" size={16} color={colors.text} />
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            onPress={() => handleVerifyDoc(doc, idx)}
                                            style={[styles.miniActionBtn, { backgroundColor: doc.verified ? '#34C75920' : colors.card }]}
                                        >
                                            <Ionicons
                                                name={doc.verified ? "checkmark-circle" : "checkbox-outline"}
                                                size={16}
                                                color={doc.verified ? "#34C759" : colors.icon}
                                            />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            ))
                        ) : (
                            <Text style={{ color: colors.icon }}>No documents uploaded.</Text>
                        )}
                    </View>

                    {/* Sticky Bottom Actions */}
                    <View style={styles.pendingModalActions}>
                        <TouchableOpacity
                            style={[styles.rejectFullBtn, { backgroundColor: isDark ? '#FF3B3015' : '#FFF0F0' }]}
                            onPress={() => onReject(user.id, user.type)}
                            disabled={!!processingId}
                        >
                            {processingId === user.id ? <ActivityIndicator color="#FF3B30" /> : <Text style={styles.rejectFullText}>Reject Application</Text>}
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.approveFullBtn, { backgroundColor: '#34C759' }]}
                            onPress={() => onApprove(user.id, user.type)}
                            disabled={!!processingId}
                        >
                            {processingId === user.id ? <ActivityIndicator color="#FFF" /> : <Text style={styles.approveFullText}>Approve & Activate</Text>}
                        </TouchableOpacity>
                    </View>
                </ScrollView>

                <ImageModal
                    visible={!!viewingDocUrl}
                    uri={viewingDocUrl || ''}
                    onClose={() => setViewingDocUrl(null)}
                />
            </SafeAreaView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    fullScreenModal: { flex: 1 },
    modalHeaderFullScreen: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 15, borderBottomWidth: 1 },
    modalTitle: { fontSize: 18, fontWeight: 'bold' },
    closeBtn: { padding: 4 },
    profileHeader: { alignItems: 'center', marginBottom: 24 },
    largeAvatar: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
    largeAvatarText: { fontSize: 32, fontWeight: 'bold' },
    profileName: { fontSize: 22, fontWeight: 'bold', marginBottom: 4, textAlign: 'center' },
    profileBusiness: { fontSize: 14, marginBottom: 8, textAlign: 'center' },
    section: { borderRadius: 16, padding: 16, marginBottom: 16 },
    sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 16 },
    profileDetailGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
    profileDetailItem: { width: '47%' },
    detailLabelSmall: { fontSize: 12, marginBottom: 4 },
    detailValueSmall: { fontSize: 14, fontWeight: '600' },
    divider: { height: 1 },
    badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    skillBadge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
    skillBadgeText: { fontSize: 12, fontWeight: 'bold' },
    bankInfoBox: { gap: 12 },
    bankHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
    bankNameLabel: { fontSize: 14, fontWeight: 'bold', flex: 1 },
    verifiedBadgeSmall: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#34C759', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, gap: 4 },
    verifiedBadgeText: { color: '#FFF', fontSize: 10, fontWeight: 'bold' },
    bankRow: { flexDirection: 'row', justifyContent: 'space-between' },
    bankLabel: { fontSize: 13 },
    bankValue: { fontSize: 13, fontWeight: '600', fontFamily: 'monospace' },
    docItem: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12, marginBottom: 8 },
    docIcon: { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
    docName: { fontSize: 14, fontWeight: '600' },
    docStatus: { fontSize: 12, marginTop: 2, fontWeight: '500' },
    miniActionBtn: { padding: 8, borderRadius: 8 },
    pendingModalActions: { flexDirection: 'row', gap: 12, marginTop: 10 },
    rejectFullBtn: { flex: 1, padding: 16, borderRadius: 16, alignItems: 'center' },
    rejectFullText: { color: '#FF3B30', fontWeight: 'bold' },
    approveFullBtn: { flex: 1, padding: 16, borderRadius: 16, alignItems: 'center', shadowColor: '#34C759', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
    approveFullText: { color: '#FFF', fontWeight: 'bold' }
});
