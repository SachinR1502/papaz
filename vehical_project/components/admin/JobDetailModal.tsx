import { StatusBadge } from '@/components/ui/StatusBadge';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ActivityIndicator, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface JobDetailModalProps {
    visible: boolean;
    job: any; // Using any for detailed job object as it matches parent usage
    onClose: () => void;
    onCancelJob: (id: string) => void;
    isLoading: boolean;
    currencySymbol: string;
}

export const JobDetailModal = ({
    visible,
    job,
    onClose,
    onCancelJob,
    isLoading,
    currencySymbol
}: JobDetailModalProps) => {
    const colorScheme = useColorScheme();
    const theme = colorScheme ?? 'light';
    const colors = Colors[theme];

    return (
        <Modal visible={visible} animationType="slide" transparent={false}>
            <SafeAreaView style={[styles.modalContainer, { backgroundColor: colors.background }]}>
                <View style={[styles.modalHeader, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
                    <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                        <Ionicons name="close" size={24} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={[styles.modalTitleText, { color: colors.text }]}>Job Details</Text>
                    <View style={{ width: 40 }} />
                </View>

                {isLoading ? (
                    <View style={styles.centerLoading}>
                        <ActivityIndicator size="large" color={colors.primary} />
                        <Text style={{ marginTop: 10, color: colors.icon }}>Loading details...</Text>
                    </View>
                ) : job && (
                    <ScrollView contentContainerStyle={styles.modalContent}>
                        <View style={{ alignItems: 'center', marginBottom: 20 }}>
                            <StatusBadge status={job.status} size="medium" />
                        </View>

                        <View style={[styles.section, { backgroundColor: colors.card }]}>
                            <Text style={[styles.sectionTitle, { color: colors.text }]}>Service Information</Text>
                            <View style={styles.detailRow}>
                                <Text style={[styles.detailLabel, { color: colors.icon }]}>Vehicle</Text>
                                <Text style={[styles.detailValue, { color: colors.text }]}>{job.vehicleModel}</Text>
                            </View>
                            <View style={styles.detailRow}>
                                <Text style={[styles.detailLabel, { color: colors.icon }]}>Service Type</Text>
                                <Text style={[styles.detailValue, { color: colors.text }]}>{job.serviceType}</Text>
                            </View>
                            <View style={styles.detailRow}>
                                <Text style={[styles.detailLabel, { color: colors.icon }]}>Job ID</Text>
                                <Text style={[styles.detailValue, { color: colors.text }]}>#{job.id.slice(-8).toUpperCase()}</Text>
                            </View>
                            <Text style={[styles.descTitle, { color: colors.icon }]}>Description</Text>
                            <Text style={[styles.descText, { color: colors.text }]}>{job.description || 'No description provided'}</Text>
                        </View>

                        <View style={[styles.section, { backgroundColor: colors.card }]}>
                            <Text style={[styles.sectionTitle, { color: colors.text }]}>Customer Details</Text>
                            <View style={styles.userInfo}>
                                <View style={styles.userMain}>
                                    <Text style={[styles.userNameLarge, { color: colors.text }]}>{job.customer?.fullName}</Text>
                                    <Text style={[styles.userContact, { color: colors.icon }]}>{job.customer?.phone || job.customer?.phoneNumber}</Text>
                                </View>
                            </View>
                        </View>

                        <View style={[styles.section, { backgroundColor: colors.card }]}>
                            <Text style={[styles.sectionTitle, { color: colors.text }]}>Technician Details</Text>
                            <View style={styles.userInfo}>
                                <View style={styles.userMain}>
                                    <Text style={[styles.userNameLarge, { color: colors.text }]}>{job.technician?.fullName}</Text>
                                    <Text style={[styles.userContact, { color: colors.icon }]}>{job.technician?.garageName}</Text>
                                    <Text style={[styles.userContact, { color: colors.icon }]}>{job.technician?.phoneNumber}</Text>
                                </View>
                            </View>
                        </View>

                        {job.bill && (
                            <View style={[styles.section, { backgroundColor: colors.card }]}>
                                <Text style={[styles.sectionTitle, { color: colors.text }]}>Billing Information</Text>
                                {job.bill.items.map((item: any, i: number) => (
                                    <View key={i} style={styles.billItem}>
                                        <Text style={[styles.billItemName, { color: colors.text }]}>{item.name}</Text>
                                        <Text style={[styles.billItemPrice, { color: colors.text }]}>{currencySymbol}{item.price}</Text>
                                    </View>
                                ))}
                                <View style={[styles.divider, { backgroundColor: colors.border, marginVertical: 8 }]} />
                                <View style={styles.billTotal}>
                                    <Text style={[styles.totalLabel, { color: colors.text }]}>Total Amount</Text>
                                    <Text style={[styles.totalValue, { color: colors.primary }]}>{currencySymbol}{job.bill.totalAmount}</Text>
                                </View>
                            </View>
                        )}

                        {job.status !== 'completed' && job.status !== 'cancelled' && (
                            <TouchableOpacity
                                style={styles.cancelButton}
                                onPress={() => onCancelJob(job.id)}
                            >
                                <Text style={styles.cancelButtonText}>Cancel Job</Text>
                            </TouchableOpacity>
                        )}
                    </ScrollView>
                )}
            </SafeAreaView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalContainer: { flex: 1 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1 },
    closeBtn: { padding: 8 },
    modalTitleText: { fontSize: 18, fontWeight: 'bold' },
    centerLoading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    modalContent: { padding: 20, paddingBottom: 100 },
    section: { padding: 20, borderRadius: 20, marginBottom: 15 },
    sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 15 },
    detailRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
    detailLabel: { fontSize: 14 },
    detailValue: { fontSize: 14, fontWeight: '600' },
    descTitle: { fontSize: 12, marginTop: 10 },
    descText: { fontSize: 14, marginTop: 4, lineHeight: 20 },
    userInfo: { flexDirection: 'row', alignItems: 'center', gap: 15 },
    userMain: { flex: 1 },
    userNameLarge: { fontSize: 16, fontWeight: 'bold' },
    userContact: { fontSize: 14, marginTop: 2 },
    billItem: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
    billItemName: { fontSize: 14 },
    billItemPrice: { fontSize: 14, fontWeight: '500' },
    divider: { height: 1 },
    billTotal: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    totalLabel: { fontSize: 16, fontWeight: 'bold' },
    totalValue: { fontSize: 20, fontWeight: '900' },
    cancelButton: { backgroundColor: '#FF3B30', padding: 18, borderRadius: 16, alignItems: 'center', marginTop: 20 },
    cancelButtonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
});
