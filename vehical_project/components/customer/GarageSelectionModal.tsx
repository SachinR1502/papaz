import { Colors } from '@/constants/theme';
import { useLanguage } from '@/context/LanguageContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import React from 'react';
import { ActivityIndicator, Dimensions, FlatList, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');

interface Garage {
    id: string;
    name: string;
    rating: number;
    distance?: number | null;
    city?: string;
    address?: string;
    logo?: string;
}

interface GarageSelectionModalProps {
    visible: boolean;
    onClose: () => void;
    garages: Garage[];
    selectedGarageId: string | null;
    onSelectGarage: (garageId: string) => void;
    loading?: boolean;
    onSkip?: () => void;
}

export const GarageSelectionModal: React.FC<GarageSelectionModalProps> = ({
    visible,
    onClose,
    garages,
    selectedGarageId,
    onSelectGarage,
    loading = false,
    onSkip
}) => {
    const { t } = useLanguage();
    const colorScheme = useColorScheme();
    const theme = colorScheme ?? 'light';
    const colors = Colors[theme];
    const isDark = theme === 'dark';

    return (
        <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
            <BlurView intensity={isDark ? 40 : 80} style={styles.modalOverlay} tint={isDark ? 'dark' : 'light'}>
                <View style={[styles.modalContainer, { backgroundColor: colors.card }]}>
                    {/* Header */}
                    <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
                        <Text style={[styles.modalTitle, { color: colors.text }]}>{t('select_garage')}</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Ionicons name="close" size={24} color={colors.icon} />
                        </TouchableOpacity>
                    </View>

                    {loading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color={colors.primary} />
                            <Text style={[styles.loadingText, { color: colors.icon }]}>{t('loading_garages')}</Text>
                        </View>
                    ) : garages.length === 0 ? (
                        <View style={styles.emptyContainer}>
                            <MaterialCommunityIcons name="garage-variant" size={64} color={colors.icon} />
                            <Text style={[styles.emptyText, { color: colors.text }]}>{t('no_garages_found')}</Text>
                            <Text style={[styles.emptySubtext, { color: colors.icon }]}>
                                {t('no_garages_description')}
                            </Text>
                        </View>
                    ) : (
                        <FlatList
                            data={garages}
                            keyExtractor={(item) => item.id}
                            contentContainerStyle={styles.garageList}
                            renderItem={({ item }) => {
                                const isSelected = item.id === selectedGarageId;
                                return (
                                    <TouchableOpacity
                                        style={[
                                            styles.garageCard,
                                            {
                                                backgroundColor: isDark ? colors.background : '#FFF',
                                                borderColor: isSelected ? colors.primary : colors.border,
                                                borderWidth: isSelected ? 2 : 1
                                            }
                                        ]}
                                        onPress={() => {
                                            onSelectGarage(item.id);
                                            onClose();
                                        }}
                                    >
                                        <View style={[styles.garageIconContainer, { backgroundColor: colors.primary + '15' }]}>
                                            <MaterialCommunityIcons name="garage-variant" size={28} color={colors.primary} />
                                        </View>
                                        <View style={styles.garageInfo}>
                                            <Text style={[styles.garageName, { color: colors.text }]}>{item.name}</Text>
                                            <View style={styles.garageMetaRow}>
                                                <View style={styles.ratingContainer}>
                                                    <Ionicons name="star" size={14} color="#FFB800" />
                                                    <Text style={[styles.ratingText, { color: colors.icon }]}>
                                                        {item.rating.toFixed(1)}
                                                    </Text>
                                                </View>
                                                {item.distance !== null && item.distance !== undefined && (
                                                    <>
                                                        <Text style={[styles.separator, { color: colors.border }]}>•</Text>
                                                        <Text style={[styles.distanceText, { color: colors.icon }]}>
                                                            {item.distance.toFixed(1)} km
                                                        </Text>
                                                    </>
                                                )}
                                            </View>
                                            {item.address && (
                                                <Text style={[styles.garageAddress, { color: colors.icon }]} numberOfLines={1}>
                                                    {item.address}
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
                    )}

                    {/* Skip Button */}
                    {onSkip && (
                        <TouchableOpacity
                            style={[styles.skipButton, { borderColor: colors.border }]}
                            onPress={() => {
                                onSkip();
                                onClose();
                            }}
                        >
                            <Text style={[styles.skipButtonText, { color: colors.text }]}>{t('skip_for_now')}</Text>
                        </TouchableOpacity>
                    )}
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
    loadingContainer: {
        padding: 40,
        alignItems: 'center',
        gap: 16,
    },
    loadingText: {
        fontSize: 14,
        fontFamily: 'NotoSans-Regular',
    },
    emptyContainer: {
        padding: 40,
        alignItems: 'center',
        gap: 12,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: '600',
        fontFamily: 'NotoSans-SemiBold',
        textAlign: 'center',
    },
    emptySubtext: {
        fontSize: 14,
        fontFamily: 'NotoSans-Regular',
        textAlign: 'center',
    },
    garageList: {
        padding: 16,
        gap: 12,
    },
    garageCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
        gap: 12,
    },
    garageIconContainer: {
        width: 56,
        height: 56,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    garageInfo: {
        flex: 1,
    },
    garageName: {
        fontSize: 16,
        fontWeight: '600',
        fontFamily: 'NotoSans-SemiBold',
        marginBottom: 6,
    },
    garageMetaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 4,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    ratingText: {
        fontSize: 13,
        fontFamily: 'NotoSans-Regular',
    },
    separator: {
        fontSize: 12,
    },
    distanceText: {
        fontSize: 13,
        fontFamily: 'NotoSans-Regular',
    },
    garageAddress: {
        fontSize: 12,
        fontFamily: 'NotoSans-Regular',
    },
    skipButton: {
        marginHorizontal: 16,
        marginTop: 8,
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        alignItems: 'center',
    },
    skipButtonText: {
        fontSize: 16,
        fontWeight: '600',
        fontFamily: 'NotoSans-SemiBold',
    },
});
