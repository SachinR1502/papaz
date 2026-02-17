import { AudioPlayer } from '@/components/ui/AudioPlayer';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Colors } from '@/constants/theme';
import { useLanguage } from '@/context/LanguageContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { parseDescription } from '@/utils/mediaHelpers';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface WholesaleOrderCardProps {
    item: any;
    onQuote: (item: any) => void;
    onViewImage: (uri: string) => void;
    onAction: (orderId: string, action: string, status?: string, data?: any) => Promise<void>;
    actionLoading: string | null;
    onView?: (item: any) => void;
}

export const WholesaleOrderCard = ({ item, onQuote, onViewImage, onAction, actionLoading, onView }: WholesaleOrderCardProps) => {
    const { t } = useLanguage();
    const colorScheme = useColorScheme();
    const theme = colorScheme ?? 'light';
    const colors = Colors[theme];

    const currentStatus = item.status || 'inquiry';
    const isActionable = currentStatus === 'inquiry' || currentStatus === 'pending' || currentStatus === 'quoted';

    return (
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, borderLeftWidth: 4, borderLeftColor: colors.primary }]}>
            <TouchableOpacity onPress={() => onView?.(item)} activeOpacity={0.7} style={styles.cardHeader}>
                <View style={[styles.iconBox, { backgroundColor: colors.primary + '15' }]}>
                    <Ionicons name="briefcase" size={24} color={colors.primary} />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={[styles.partName, { color: colors.text }]}>{item.technicianName}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 4 }}>
                        <Ionicons name="time-outline" size={12} color={colors.icon} />
                        <Text style={[styles.location, { color: colors.icon }]}>{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : t('recently')}</Text>
                    </View>
                </View>
                <StatusBadge status={currentStatus} size="small" showIcon={false} />
            </TouchableOpacity>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            <Text style={[styles.itemListTitle, { color: colors.text }]}>{t('requested_items')} ({item.items.length})</Text>
            {item.items.map((part: any, idx: number) => {
                const parsed = parseDescription(part.description || part.name);
                let displayName = parsed.displayName || part.name || '';
                let displayNotes = parsed.displayNotes;

                // Prioritize explicit fields, fallback to parsed from description
                const photoUri = (part.photos && part.photos.length > 0) ? part.photos[0] : (part.photoUri || parsed.photoUri);
                const voiceUri = part.voiceNote || part.voiceUri || parsed.voiceUri;
                const allPhotos = part.photos || (photoUri ? [photoUri] : []);

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

                const isNote = (part.price === 0 || part.unitPrice === 0) && !part.product;

                return (
                    <View key={idx} style={styles.partLineItem}>
                        <View style={[styles.partBullet, { backgroundColor: colors.primary }]} />
                        <View style={{ flex: 1 }}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                <Text style={[styles.partLineText, { color: colors.text, fontWeight: '700' }]}>
                                    {part.qty || part.quantity || 1}x {displayName}
                                </Text>
                                {isNote && (
                                    <View style={{ backgroundColor: colors.border, paddingHorizontal: 6, paddingVertical: 1, borderRadius: 4 }}>
                                        <Text style={{ fontSize: 9, fontFamily: 'NotoSans-Bold', color: colors.text }}>NOTE</Text>
                                    </View>
                                )}
                            </View>

                            {(displayMeta || displayNotes) ? (
                                <Text style={{ fontSize: 11, color: colors.icon, marginTop: 2 }}>
                                    {displayMeta ? displayMeta.replace(/^ • /, '') : ''}
                                    {(displayMeta && displayNotes) ? ' • ' : ''}
                                    {displayNotes}
                                </Text>
                            ) : null}

                            {/* Item Media (Photos/Voice) */}
                            {(allPhotos.length > 0 || voiceUri) && (
                                <View style={{ flexDirection: 'row', gap: 6, marginTop: 4, flexWrap: 'wrap' }}>
                                    {allPhotos.map((p: string, pIdx: number) => (
                                        <TouchableOpacity
                                            key={pIdx}
                                            onPress={() => onViewImage(p)}
                                            style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.primary + '10', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}
                                        >
                                            <Ionicons name="image" size={10} color={colors.primary} />
                                            <Text style={{ fontSize: 10, color: colors.primary, marginLeft: 2, fontFamily: 'NotoSans-Bold' }}>Photo {allPhotos.length > 1 ? pIdx + 1 : ''}</Text>
                                        </TouchableOpacity>
                                    ))}
                                    {voiceUri && (
                                        <View style={{ width: 180, marginTop: 2 }}>
                                            <AudioPlayer uri={voiceUri} />
                                        </View>
                                    )}
                                </View>
                            )}
                        </View>
                    </View>
                );
            })}

            {isActionable ? (
                <View style={styles.actionRow}>
                    {currentStatus === 'inquiry' && (
                        <TouchableOpacity
                            style={[styles.quoteBtn, { backgroundColor: colors.primary }]}
                            onPress={() => onQuote(item)}
                            disabled={actionLoading === item.id}
                        >
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                <Text style={{ color: '#FFF', fontWeight: '700' }}>{t('submit_quote')}</Text>
                                <Ionicons name="paper-plane" size={18} color="#FFF" />
                            </View>
                        </TouchableOpacity>
                    )}
                    {(currentStatus === 'quoted' || currentStatus === 'pending') && (
                        <TouchableOpacity
                            style={[styles.convertBtn, { backgroundColor: colors.sales }]}
                            onPress={() => onAction(item.id, 'accept')}
                            disabled={actionLoading === item.id}
                        >
                            {actionLoading === item.id ? (
                                <ActivityIndicator color="#FFF" />
                            ) : (
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                    <Text style={{ color: '#FFF', fontWeight: '700' }}>{t('convert_to_order') || 'Convert to Order'}</Text>
                                    <Ionicons name="checkmark-circle" size={18} color="#FFF" />
                                </View>
                            )}
                        </TouchableOpacity>
                    )}
                </View>
            ) : (
                currentStatus !== 'delivered' && currentStatus !== 'rejected' && (
                    <TouchableOpacity
                        style={[styles.statusBtn, { backgroundColor: colors.sales }]}
                        onPress={() => {
                            const nextStatus =
                                (currentStatus === 'accepted' || currentStatus === 'confirmed') ? 'packed' :
                                    currentStatus === 'packed' ? 'out_for_delivery' :
                                        currentStatus === 'out_for_delivery' ? 'shipped' :
                                            'delivered';
                            onAction(item.id, 'update_status', nextStatus);
                        }}
                        disabled={actionLoading === item.id}
                    >
                        {actionLoading === item.id ? (
                            <ActivityIndicator color="#FFF" />
                        ) : (
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                <Text style={{ color: '#FFF', fontWeight: '700' }}>
                                    {t('mark_as')} {
                                        (currentStatus === 'accepted' || currentStatus === 'confirmed') ? t('packed') :
                                            currentStatus === 'packed' ? t('out_for_delivery') :
                                                currentStatus === 'out_for_delivery' ? t('shipped') :
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
    cardHeader: { flexDirection: 'row', alignItems: 'center' },
    iconBox: { width: 48, height: 48, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
    partName: { fontSize: 16, fontWeight: 'bold' },
    location: { fontSize: 13, fontWeight: '500' },
    divider: { height: 1, marginVertical: 16 },
    itemListTitle: { fontSize: 13, fontFamily: 'NotoSans-Bold', marginBottom: 12 },
    partLineItem: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
    partBullet: { width: 6, height: 6, borderRadius: 3 },
    partLineText: { fontSize: 14 },
    actionRow: { flexDirection: 'row', gap: 10, marginTop: 20 },
    quoteBtn: { flex: 1, height: 50, borderRadius: 14, justifyContent: 'center', alignItems: 'center', shadowColor: '#FF6B00', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
    convertBtn: { flex: 1, height: 50, borderRadius: 14, justifyContent: 'center', alignItems: 'center', shadowColor: '#34C759', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
    statusBtn: { width: '100%', height: 50, borderRadius: 14, justifyContent: 'center', alignItems: 'center', shadowColor: '#34C759', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4, marginTop: 20 },
});
