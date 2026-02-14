import { AudioPlayer } from '@/components/ui/AudioPlayer';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Colors } from '@/constants/theme';
import { useLanguage } from '@/context/LanguageContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { parseDescription } from '@/utils/mediaHelpers';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface SupplierOrderCardProps {
    item: any;
    currencySymbol: string;
    actionLoading: string | null;
    onAction: (orderId: string, action: string, status?: string, data?: any) => Promise<void>;
    onQuote: (item: any) => void;
    onOpenDeliveryModal: (item: any) => void;
    onViewImage?: (uri: string) => void;
    onView?: (item: any) => void;
}

export const SupplierOrderCard = ({
    item,
    currencySymbol,
    actionLoading,
    onAction,
    onQuote,
    onOpenDeliveryModal,
    onViewImage,
    onView
}: SupplierOrderCardProps) => {
    const { t } = useLanguage();
    const colorScheme = useColorScheme();
    const theme = colorScheme ?? 'light';
    const colors = Colors[theme];

    const isPending = item.status === 'pending';

    const parsed = parseDescription(item.partName || item.name || item.description);
    let displayName = parsed.displayName || item.partName || item.name || 'Unknown Part';
    let displayNotes = parsed.displayNotes;
    const { photoUri, voiceUri } = parsed;

    let displayMeta = '';
    if (displayName.includes(' - ')) {
        const parts = displayName.split(' - ');
        const brand = parts.pop();
        displayName = parts.join(' - ');
        displayMeta = brand ? ` • ${brand}` : '';
    }

    const pnMatch = displayName.match(/\(PN: (.*?)\)/);
    if (pnMatch) {
        const pn = pnMatch[1];
        displayName = displayName.replace(pnMatch[0], '').trim();
        displayMeta = ` • PN: ${pn}` + displayMeta;
    }

    return (
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <TouchableOpacity onPress={() => onView?.(item)} activeOpacity={0.7} style={styles.cardHeader}>
                <View style={[styles.iconBox, { backgroundColor: item.type === 'Bike' ? colors.primary + '15' : colors.sales + '15' }]}>
                    <MaterialCommunityIcons
                        name={item.type === 'Bike' ? 'motorbike' : 'car-cog'}
                        size={24}
                        color={item.type === 'Bike' ? colors.primary : colors.sales}
                    />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={[styles.partName, { color: colors.text }]}>{displayName}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 4 }}>
                        <Ionicons name="location" size={12} color={colors.icon} />
                        <Text style={[styles.location, { color: colors.icon }]}>
                            {typeof item.location === 'string' ? t(item.location) : 'Online Order'}
                            {displayMeta ? ` ${displayMeta}` : ''}
                        </Text>
                    </View>
                    {displayNotes ? (
                        <Text style={{ fontSize: 11, color: colors.icon, marginTop: 4 }}>Note: {displayNotes}</Text>
                    ) : null}

                    {/* Media Attachments */}
                    <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
                        {photoUri && (
                            <TouchableOpacity
                                onPress={() => onViewImage?.(photoUri)}
                                style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.primary + '10', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 }}
                            >
                                <Ionicons name="image" size={14} color={colors.primary} />
                                <Text style={{ fontSize: 12, color: colors.primary, marginLeft: 6, fontWeight: '700' }}>View Photo</Text>
                            </TouchableOpacity>
                        )}
                        {voiceUri && (
                            <View style={{ width: 220 }}>
                                <AudioPlayer uri={voiceUri} />
                            </View>
                        )}
                    </View>
                </View>
                <StatusBadge status={item.status || 'pending'} size="small" showIcon={false} />
            </TouchableOpacity>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            <View style={styles.detailsRow}>
                <View style={styles.detailItem}>
                    <Text style={[styles.label, { color: colors.icon }]}>{t('quantity_label')}</Text>
                    <Text style={[styles.value, { color: colors.text }]}>{item.quantity}</Text>
                </View>
                <View style={styles.detailItem}>
                    <Text style={[styles.label, { color: colors.icon }]}>{t('urgency_label')}</Text>
                    <Text style={[styles.value, { color: item.urgency === 'High' ? colors.notification : colors.text }]}>{t(item.urgency) || 'Medium'}</Text>
                </View>
                <View style={styles.detailItem}>
                    <Text style={[styles.label, { color: colors.icon }]}>{t('total_label')}</Text>
                    <Text style={[styles.value, { color: colors.text }]}>{currencySymbol}{item.amount}</Text>
                </View>
            </View>

            {item.deliveryDetails ? (
                <View style={{ backgroundColor: colors.background, padding: 12, borderRadius: 12, marginBottom: 15, borderWidth: 1, borderColor: colors.border }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Ionicons name="car-sport" size={16} color={colors.primary} />
                            <Text style={{ fontSize: 13, fontFamily: 'NotoSans-Bold', color: colors.text, marginLeft: 8 }}>{item.deliveryDetails.vehicleNumber}</Text>
                        </View>
                        {['out_for_delivery', 'shipped', 'packed', 'accepted'].includes(item.status) && (
                            <TouchableOpacity onPress={() => onOpenDeliveryModal(item)}>
                                <Ionicons name="create-outline" size={18} color={colors.primary} />
                            </TouchableOpacity>
                        )}
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Ionicons name="person" size={16} color={colors.primary} />
                        <Text style={{ fontSize: 13, color: colors.icon, marginLeft: 8 }}>{item.deliveryDetails.driverName} • {item.deliveryDetails.driverPhone}</Text>
                    </View>
                </View>
            ) : (
                ['out_for_delivery', 'shipped'].includes(item.status) && (
                    <TouchableOpacity
                        style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.primary + '10', padding: 10, borderRadius: 12, marginBottom: 15, borderStyle: 'dashed', borderWidth: 1, borderColor: colors.primary }}
                        onPress={() => onOpenDeliveryModal(item)}
                    >
                        <Ionicons name="add-circle" size={20} color={colors.primary} />
                        <Text style={{ fontSize: 13, color: colors.primary, fontFamily: 'NotoSans-Bold', marginLeft: 8 }}>{t('add_delivery_details') || 'Add Gadi & Driver Details'}</Text>
                    </TouchableOpacity>
                )
            )}

            {isPending || item.status === 'inquiry' ? (
                <View style={styles.actionRow}>
                    {item.status === 'inquiry' ? (
                        <TouchableOpacity
                            style={[styles.statusBtn, { backgroundColor: colors.primary }]}
                            onPress={() => onQuote(item)}
                            disabled={actionLoading === item.id}
                        >
                            {actionLoading === item.id ? <ActivityIndicator color="#FFF" /> : (
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                    <Text style={{ color: '#FFF', fontWeight: 'bold' }}>{t('submit_quote') || 'Submit Quote'}</Text>
                                    <Ionicons name="pricetag" size={18} color="#FFF" />
                                </View>
                            )}
                        </TouchableOpacity>
                    ) : (
                        <>
                            <TouchableOpacity
                                style={[styles.rejectBtn, { borderColor: colors.notification }]}
                                onPress={() => onAction(item.id, 'reject')}
                                disabled={actionLoading === item.id}
                            >
                                <Text style={{ color: colors.notification, fontWeight: '700' }}>{t('reject')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.acceptBtn, { backgroundColor: colors.sales }]}
                                onPress={() => onAction(item.id, 'accept')}
                                disabled={actionLoading === item.id}
                            >
                                {actionLoading === item.id ? <ActivityIndicator color="#FFF" /> : <Text style={{ color: '#FFF', fontWeight: 'bold' }}>{t('accept_process') || 'Accept & Packed'}</Text>}
                            </TouchableOpacity>
                        </>
                    )}
                </View>
            ) : (
                item.status !== 'delivered' && item.status !== 'rejected' && (
                    <TouchableOpacity
                        style={[styles.statusBtn, { backgroundColor: colors.sales }]}
                        onPress={() => {
                            const nextStatus =
                                (item.status === 'accepted' || item.status === 'confirmed' || item.status === 'pending') ? 'packed' :
                                    item.status === 'packed' ? 'out_for_delivery' :
                                        item.status === 'out_for_delivery' ? 'shipped' :
                                            'delivered';

                            if (nextStatus === 'out_for_delivery') {
                                onOpenDeliveryModal(item);
                            } else {
                                onAction(item.id, 'update_status', nextStatus);
                            }
                        }}
                        disabled={actionLoading === item.id}
                    >
                        {actionLoading === item.id ? (
                            <ActivityIndicator color="#FFF" />
                        ) : (
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                <Text style={{ color: '#FFF', fontWeight: '700' }}>
                                    {t('mark_as')} {
                                        (item.status === 'accepted' || item.status === 'confirmed' || item.status === 'pending') ? t('packed') :
                                            item.status === 'packed' ? t('out_for_delivery') :
                                                item.status === 'out_for_delivery' ? t('shipped') :
                                                    t('delivered')
                                    }
                                </Text>
                                <Ionicons name="arrow-forward-circle" size={20} color="#FFF" />
                            </View>
                        )}
                    </TouchableOpacity>
                )
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    card: { padding: 16, borderRadius: 20, borderWidth: 1, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 8, elevation: 2 },
    cardHeader: { flexDirection: 'row', alignItems: 'flex-start' },
    iconBox: { width: 48, height: 48, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
    partName: { fontSize: 16, fontWeight: 'bold' },
    location: { fontSize: 13, fontWeight: '500' },
    divider: { height: 1, marginVertical: 16 },
    detailsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
    detailItem: { alignItems: 'center', flex: 1 },
    label: { fontSize: 11, fontWeight: '600', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
    value: { fontSize: 15, fontWeight: '700' },
    actionRow: { flexDirection: 'row', gap: 12 },
    rejectBtn: { flex: 1, height: 50, borderRadius: 14, borderWidth: 1.5, justifyContent: 'center', alignItems: 'center' },
    acceptBtn: { flex: 2, height: 50, borderRadius: 14, justifyContent: 'center', alignItems: 'center', shadowColor: '#34C759', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
    statusBtn: { width: '100%', height: 50, borderRadius: 14, justifyContent: 'center', alignItems: 'center', shadowColor: '#34C759', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
});

