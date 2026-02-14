import { AppButton } from '@/components/ui/AppButton';
import { Colors } from '@/constants/theme';
import { useLanguage } from '@/context/LanguageContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import React from 'react';
import {
    Modal,
    StyleSheet,
    Text,
    View,
} from 'react-native';

interface OrderSuccessModalProps {
    visible: boolean;
    onClose: () => void;
    onViewHistory: () => void;
    orderId?: string | null;
}

export const OrderSuccessModal: React.FC<OrderSuccessModalProps> = ({
    visible,
    onClose,
    onViewHistory,
    orderId
}) => {
    const { t } = useLanguage();
    const colorScheme = useColorScheme();
    const theme = colorScheme ?? 'light';
    const colors = Colors[theme];
    const isDark = theme === 'dark';

    return (
        <Modal visible={visible} animationType="fade" transparent>
            <View style={styles.modalOverlay}>
                <BlurView intensity={20} tint={isDark ? "dark" : "light"} style={StyleSheet.absoluteFill} />
                <View style={[styles.container, { backgroundColor: colors.background }]}>
                    <View style={[styles.iconContainer, { backgroundColor: colors.primary + '15' }]}>
                        <Ionicons name="checkmark-circle" size={80} color={colors.primary} />
                    </View>

                    <Text style={[styles.title, { color: colors.text }]}>{t('order_placed_successfully') || 'Order Placed!'}</Text>
                    <Text style={[styles.subtitle, { color: colors.icon }]}>
                        {t('order_success_desc') || 'Your request has been sent to our network. You will receive quotes soon.'}
                    </Text>

                    {orderId && (
                        <View style={[styles.orderIdBadge, { backgroundColor: colors.border + '30' }]}>
                            <Text style={[styles.orderIdLabel, { color: colors.icon }]}>{t('order_id')}: </Text>
                            <Text style={[styles.orderIdValue, { color: colors.text }]}>{orderId}</Text>
                        </View>
                    )}

                    <View style={styles.footer}>
                        <AppButton
                            title={t('view_history')}
                            onPress={onViewHistory}
                            style={{ marginBottom: 12 }}
                        />
                        <AppButton
                            title={t('continue_shopping')}
                            onPress={onClose}
                            variant="outline"
                        />
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    container: { borderRadius: 32, padding: 30, alignItems: 'center', width: '100%', maxWidth: 400 },
    iconContainer: { width: 120, height: 120, borderRadius: 60, justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
    title: { fontSize: 24, fontFamily: 'NotoSans-Bold', textAlign: 'center', marginBottom: 12 },
    subtitle: { fontSize: 16, fontFamily: 'NotoSans-Regular', textAlign: 'center', marginBottom: 24, lineHeight: 24 },
    orderIdBadge: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12, marginBottom: 32 },
    orderIdLabel: { fontSize: 14, fontFamily: 'NotoSans-Regular' },
    orderIdValue: { fontSize: 14, fontFamily: 'NotoSans-Bold' },
    footer: { width: '100%' }
});
