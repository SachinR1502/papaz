import { Colors } from '@/constants/theme';
import { useLanguage } from '@/context/LanguageContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React from 'react';
import { Modal, Text, TouchableOpacity, View } from 'react-native';

interface FilterModalProps {
    visible: boolean;
    onClose: () => void;
    statusFilter: string;
    onSelectFilter: (filter: 'all' | 'action_required' | 'video_update') => void;
}

export const FilterModal = ({ visible, onClose, statusFilter, onSelectFilter }: FilterModalProps) => {
    const { t } = useLanguage();
    const colorScheme = useColorScheme();
    const theme = colorScheme ?? 'light';
    const colors = Colors[theme];

    const options = [
        { id: 'all', label: t('All Jobs'), icon: 'apps' },
        { id: 'action_required', label: t('Action Required'), icon: 'alert-circle' },
        { id: 'video_update', label: t('In Progress'), icon: 'construct' }
    ];

    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <TouchableOpacity
                style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 }}
                activeOpacity={1}
                onPress={onClose}
            >
                <View style={{ backgroundColor: colors.card, borderRadius: 20, padding: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.25, shadowRadius: 20, elevation: 10 }}>
                    <Text style={{ fontSize: 18, fontFamily: 'NotoSans-Bold', color: colors.text, marginBottom: 20 }}>{t('filter_jobs')}</Text>

                    {options.map((opt) => (
                        <TouchableOpacity
                            key={opt.id}
                            style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: colors.border }}
                            onPress={() => {
                                Haptics.selectionAsync();
                                onSelectFilter(opt.id as any);
                                onClose();
                            }}
                        >
                            <Ionicons name={opt.icon as any} size={22} color={statusFilter === opt.id ? colors.primary : colors.icon} />
                            <Text style={{ flex: 1, marginLeft: 15, fontSize: 16, fontFamily: 'NotoSans-Medium', color: statusFilter === opt.id ? colors.primary : colors.text }}>
                                {opt.label}
                            </Text>
                            {statusFilter === opt.id && (
                                <Ionicons name="checkmark" size={22} color={colors.primary} />
                            )}
                        </TouchableOpacity>
                    ))}
                </View>
            </TouchableOpacity>
        </Modal>
    );
};
