import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ActivityIndicator, FlatList, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ActivityHistoryModalProps {
    visible: boolean;
    onClose: () => void;
    isLoading: boolean;
    activities: any[];
    currencySymbol: string;
}

export const ActivityHistoryModal = ({
    visible,
    onClose,
    isLoading,
    activities,
    currencySymbol
}: ActivityHistoryModalProps) => {
    const colorScheme = useColorScheme();
    const theme = colorScheme ?? 'light';
    const colors = Colors[theme];
    const isDark = theme === 'dark';

    return (
        <Modal visible={visible} animationType="fade" transparent={true}>
            <View style={styles.modalOverlay}>
                <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
                    <View style={styles.modalHeader}>
                        <Text style={[styles.modalTitle, { color: colors.text }]}>Activity History</Text>
                        <TouchableOpacity onPress={onClose} style={[styles.closeBtn, { backgroundColor: colors.card }]}>
                            <Ionicons name="close" size={24} color={colors.text} />
                        </TouchableOpacity>
                    </View>

                    {isLoading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color="#007AFF" />
                            <Text style={[styles.loadingText, { color: colors.icon }]}>Fetching logs...</Text>
                        </View>
                    ) : activities.length > 0 ? (
                        <FlatList
                            data={activities}
                            keyExtractor={(item) => item.id}
                            renderItem={({ item }) => (
                                <View style={[styles.activityItem, { borderBottomColor: colors.border }]}>
                                    <View style={[styles.activityIcon, { backgroundColor: isDark ? colors.card : '#F2F2F7' }]}>
                                        <Ionicons
                                            name={item.type === 'job' || item.type === 'service' ? "car-sport" : "cart"}
                                            size={20}
                                            color="#007AFF"
                                        />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={[styles.activityTitle, { color: colors.text }]}>{item.title}</Text>
                                        <Text style={[styles.activitySubtitle, { color: colors.icon }]}>{item.subtitle}</Text>
                                        <Text style={[styles.activityDate, { color: colors.icon }]}>{new Date(item.date).toLocaleDateString()}</Text>
                                    </View>
                                    <View style={{ alignItems: 'flex-end' }}>
                                        <Text style={[styles.activityAmount, { color: colors.text }]}>{currencySymbol}{item.amount}</Text>
                                        <View style={[styles.statusBadgeSmall, { backgroundColor: item.status === 'completed' ? '#34C75915' : '#FF950015' }]}>
                                            <Text style={[styles.statusTextSmall, { color: item.status === 'completed' ? '#34C759' : '#FF9500' }]}>
                                                {item.status.toUpperCase()}
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                            )}
                            showsVerticalScrollIndicator={false}
                        />
                    ) : (
                        <View style={styles.emptyStateContainer}>
                            <Ionicons name="list-outline" size={64} color={colors.icon} />
                            <Text style={[styles.emptyStateText, { color: colors.icon }]}>No activity found for this user.</Text>
                        </View>
                    )}
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
    modalContent: { borderRadius: 24, padding: 20, height: '80%', shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.25, shadowRadius: 20, elevation: 5 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    modalTitle: { fontSize: 20, fontWeight: 'bold' },
    closeBtn: { padding: 4, borderRadius: 12 },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText: { marginTop: 12, fontSize: 14 },
    activityItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, gap: 12, borderBottomWidth: 1 },
    activityIcon: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    activityTitle: { fontSize: 14, fontWeight: '600' },
    activitySubtitle: { fontSize: 12, marginTop: 2 },
    activityDate: { fontSize: 11, marginTop: 4 },
    activityAmount: { fontSize: 15, fontWeight: '700' },
    statusBadgeSmall: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginTop: 4 },
    statusTextSmall: { fontSize: 10, fontWeight: 'bold' },
    emptyStateContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
    emptyStateText: { fontSize: 16 }
});
