import { Colors } from '@/constants/theme';
import { useLanguage } from '@/context/LanguageContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Vehicle } from '@/types/models';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import React from 'react';
import { FlatList, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface VehicleSelectionModalProps {
    visible: boolean;
    onClose: () => void;
    vehicles: Vehicle[];
    selectedVehicleId: string | null;
    onSelectVehicle: (vehicleId: string) => void;
    onAddNewVehicle: () => void;
}

export const VehicleSelectionModal: React.FC<VehicleSelectionModalProps> = ({
    visible,
    onClose,
    vehicles,
    selectedVehicleId,
    onSelectVehicle,
    onAddNewVehicle
}) => {
    const { t } = useLanguage();
    const colorScheme = useColorScheme();
    const theme = colorScheme ?? 'light';
    const colors = Colors[theme];
    const isDark = theme === 'dark';

    const getVehicleIcon = (type?: string) => {
        switch (type?.toLowerCase()) {
            case 'bike':
            case 'motorcycle':
                return 'motorbike';
            case 'truck':
                return 'truck';
            case 'bus':
                return 'bus';
            default:
                return 'car-side';
        }
    };

    return (
        <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
            <BlurView intensity={isDark ? 40 : 80} style={styles.modalOverlay} tint={isDark ? 'dark' : 'light'}>
                <View style={[styles.modalContainer, { backgroundColor: colors.card }]}>
                    {/* Header */}
                    <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
                        <Text style={[styles.modalTitle, { color: colors.text }]}>{t('select_vehicle')}</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Ionicons name="close" size={24} color={colors.icon} />
                        </TouchableOpacity>
                    </View>

                    {/* Vehicle List */}
                    <FlatList
                        data={vehicles}
                        keyExtractor={(item) => item._id || item.id || ''}
                        contentContainerStyle={styles.vehicleList}
                        renderItem={({ item }) => {
                            const isSelected = item._id === selectedVehicleId;
                            return (
                                <TouchableOpacity
                                    style={[
                                        styles.vehicleCard,
                                        {
                                            backgroundColor: isDark ? colors.background : '#FFF',
                                            borderColor: isSelected ? colors.primary : colors.border,
                                            borderWidth: isSelected ? 2 : 1
                                        }
                                    ]}
                                    onPress={() => {
                                        if (item._id || item.id) {
                                            onSelectVehicle(item._id || item.id || '');
                                            onClose();
                                        }
                                    }}
                                >
                                    <View style={[styles.vehicleIconContainer, { backgroundColor: colors.primary + '15' }]}>
                                        <MaterialCommunityIcons
                                            name={getVehicleIcon(item.vehicleType) as any}
                                            size={32}
                                            color={colors.primary}
                                        />
                                    </View>
                                    <View style={styles.vehicleInfo}>
                                        <Text style={[styles.vehicleName, { color: colors.text }]}>
                                            {item.make} {item.model}
                                        </Text>
                                        <Text style={[styles.vehicleNumber, { color: colors.icon }]}>
                                            {item.registrationNumber}
                                        </Text>
                                        {item.year && (
                                            <Text style={[styles.vehicleYear, { color: colors.icon }]}>
                                                {item.year}
                                            </Text>
                                        )}
                                    </View>
                                    {isSelected && (
                                        <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
                                    )}
                                </TouchableOpacity>
                            );
                        }}
                    />

                    {/* Add New Vehicle Button */}
                    <TouchableOpacity
                        style={[styles.addButton, { backgroundColor: colors.primary }]}
                        onPress={() => {
                            onClose();
                            onAddNewVehicle();
                        }}
                    >
                        <Ionicons name="add-circle-outline" size={20} color="#FFF" />
                        <Text style={styles.addButtonText}>{t('add_new_vehicle')}</Text>
                    </TouchableOpacity>
                </View>
            </BlurView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    modalContainer: {
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: '80%',
        paddingBottom: 20,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '700',
        fontFamily: 'NotoSans-Bold',
    },
    closeButton: {
        padding: 4,
    },
    vehicleList: {
        padding: 16,
        gap: 12,
    },
    vehicleCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
        gap: 12,
    },
    vehicleIconContainer: {
        width: 56,
        height: 56,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    vehicleInfo: {
        flex: 1,
    },
    vehicleName: {
        fontSize: 16,
        fontWeight: '600',
        fontFamily: 'NotoSans-SemiBold',
        marginBottom: 4,
    },
    vehicleNumber: {
        fontSize: 14,
        fontFamily: 'NotoSans-Regular',
        marginBottom: 2,
    },
    vehicleYear: {
        fontSize: 12,
        fontFamily: 'NotoSans-Regular',
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 16,
        marginTop: 8,
        padding: 16,
        borderRadius: 16,
        gap: 8,
    },
    addButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '600',
        fontFamily: 'NotoSans-SemiBold',
    },
});
