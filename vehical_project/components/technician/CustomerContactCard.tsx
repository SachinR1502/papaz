import { Colors } from '@/constants/theme';
import { useLanguage } from '@/context/LanguageContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Alert, Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface Customer {
    _id: string;
    fullName: string;
    phoneNumber?: string;
    address?: string;
    user?: {
        _id: string;
        name?: string;
        email?: string;
    };
}

interface CustomerContactCardProps {
    customer: Customer;
    jobId: string;
    showAddress?: boolean;
}

export const CustomerContactCard: React.FC<CustomerContactCardProps> = ({
    customer,
    jobId,
    showAddress = true
}) => {
    const { t } = useLanguage();
    const router = useRouter();
    const colorScheme = useColorScheme();
    const theme = colorScheme ?? 'light';
    const colors = Colors[theme];
    const isDark = theme === 'dark';

    const handleCall = () => {
        if (!customer.phoneNumber) {
            Alert.alert(t('error'), t('phone_number_not_available'));
            return;
        }

        Alert.alert(
            t('call_customer'),
            `${t('call')} ${customer.fullName}?`,
            [
                { text: t('cancel'), style: 'cancel' },
                {
                    text: t('call'),
                    onPress: () => {
                        Linking.openURL(`tel:${customer.phoneNumber}`);
                    }
                }
            ]
        );
    };

    const handleChat = () => {
        if (!customer.user?._id) {
            Alert.alert(t('error'), t('customer_not_available'));
            return;
        }

        router.push({
            pathname: '/(technician)/chat/[id]',
            params: {
                id: customer.user._id,
                name: customer.fullName,
                jobId: jobId
            }
        });
    };

    const handleNavigate = () => {
        if (!customer.address) {
            Alert.alert(t('error'), t('address_not_available'));
            return;
        }

        // Open in maps app
        const address = encodeURIComponent(customer.address);
        const url = `https://maps.google.com/?q=${address}`;
        Linking.openURL(url);
    };

    return (
        <View style={[styles.container, { backgroundColor: isDark ? colors.background : '#FFF', borderColor: colors.border }]}>
            {/* Header */}
            <View style={styles.header}>
                <View style={[styles.avatarContainer, { backgroundColor: colors.primary + '15' }]}>
                    <Text style={[styles.avatarText, { color: colors.primary }]}>
                        {customer.fullName?.charAt(0).toUpperCase() || 'C'}
                    </Text>
                </View>
                <View style={styles.customerInfo}>
                    <Text style={[styles.customerName, { color: colors.text }]}>{customer.fullName}</Text>
                    {customer.phoneNumber && (
                        <Text style={[styles.customerPhone, { color: colors.icon }]}>{customer.phoneNumber}</Text>
                    )}
                </View>
            </View>

            {/* Address */}
            {showAddress && customer.address && (
                <TouchableOpacity
                    style={[styles.addressContainer, { backgroundColor: isDark ? colors.card : '#F5F5F5' }]}
                    onPress={handleNavigate}
                >
                    <Ionicons name="location" size={20} color={colors.primary} />
                    <Text style={[styles.addressText, { color: colors.text }]} numberOfLines={2}>
                        {customer.address}
                    </Text>
                    <Ionicons name="chevron-forward" size={20} color={colors.icon} />
                </TouchableOpacity>
            )}

            {/* Action Buttons */}
            <View style={styles.actions}>
                <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: colors.primary }]}
                    onPress={handleCall}
                >
                    <Ionicons name="call" size={20} color="#FFF" />
                    <Text style={styles.actionButtonText}>{t('call')}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: colors.primary }]}
                    onPress={handleChat}
                >
                    <MaterialCommunityIcons name="message-text" size={20} color="#FFF" />
                    <Text style={styles.actionButtonText}>{t('chat')}</Text>
                </TouchableOpacity>

                {customer.address && (
                    <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: colors.primary }]}
                        onPress={handleNavigate}
                    >
                        <MaterialCommunityIcons name="navigation-variant" size={20} color="#FFF" />
                        <Text style={styles.actionButtonText}>{t('navigate')}</Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        gap: 16,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    avatarContainer: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        fontSize: 24,
        fontWeight: '700',
        fontFamily: 'NotoSans-Bold',
    },
    customerInfo: {
        flex: 1,
    },
    customerName: {
        fontSize: 18,
        fontWeight: '700',
        fontFamily: 'NotoSans-Bold',
        marginBottom: 4,
    },
    customerPhone: {
        fontSize: 14,
        fontFamily: 'NotoSans-Regular',
    },
    addressContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 12,
        gap: 8,
    },
    addressText: {
        flex: 1,
        fontSize: 14,
        fontFamily: 'NotoSans-Regular',
    },
    actions: {
        flexDirection: 'row',
        gap: 8,
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
        borderRadius: 12,
        gap: 6,
    },
    actionButtonText: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: '600',
        fontFamily: 'NotoSans-SemiBold',
    },
});
