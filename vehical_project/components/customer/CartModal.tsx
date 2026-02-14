import { AppButton } from '@/components/ui/AppButton';
import { Colors } from '@/constants/theme';
import { useLanguage } from '@/context/LanguageContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import React from 'react';
import {
    Dimensions,
    FlatList,
    Image,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const { width, height } = Dimensions.get('window');

interface Product {
    id: string;
    _id?: string;
    name: string;
    price: string | number;
    category: string;
    image: string;
}

interface CartItem extends Product {
    quantity: number;
}

interface CartModalProps {
    visible: boolean;
    onClose: () => void;
    items: CartItem[];
    onUpdateQuantity: (id: string, delta: number) => void;
    onRemove: (id: string) => void;
    onCheckout: () => void;
    currencySymbol?: string;
}

export const CartModal: React.FC<CartModalProps> = ({
    visible,
    onClose,
    items,
    onUpdateQuantity,
    onRemove,
    onCheckout,
    currencySymbol = '$'
}) => {
    const { t } = useLanguage();
    const colorScheme = useColorScheme();
    const theme = colorScheme ?? 'light';
    const colors = Colors[theme];
    const isDark = theme === 'dark';

    const total = items.reduce((sum, item) => sum + (parseFloat(item.price.toString()) * item.quantity), 0);

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View style={styles.modalOverlay}>
                <BlurView intensity={20} tint={isDark ? "dark" : "light"} style={StyleSheet.absoluteFill} />
                <View style={[styles.container, { backgroundColor: colors.background }]}>
                    <View style={[styles.header, { borderBottomColor: colors.border }]}>
                        <Text style={[styles.title, { color: colors.text }]}>{t('your_cart') || 'Your Cart'} ({items.length})</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close-circle" size={30} color={colors.icon} />
                        </TouchableOpacity>
                    </View>

                    {items.length === 0 ? (
                        <View style={styles.emptyContainer}>
                            <Ionicons name="cart-outline" size={64} color={colors.icon} />
                            <Text style={[styles.emptyText, { color: colors.icon }]}>{t('cart_empty') || 'Your cart is empty'}</Text>
                        </View>
                    ) : (
                        <>
                            <FlatList
                                data={items}
                                keyExtractor={(item) => item.id}
                                contentContainerStyle={styles.list}
                                renderItem={({ item }) => (
                                    <View style={[styles.cartItem, { borderBottomColor: colors.border }]}>
                                        <Image source={{ uri: item.image }} style={styles.itemImage} />
                                        <View style={styles.itemInfo}>
                                            <Text style={[styles.itemName, { color: colors.text }]} numberOfLines={1}>{item.name}</Text>
                                            <Text style={[styles.itemPrice, { color: colors.primary }]}>
                                                {currencySymbol}{parseFloat(item.price.toString()).toFixed(2)}
                                            </Text>
                                        </View>
                                        <View style={styles.quantityControls}>
                                            <TouchableOpacity
                                                style={[styles.qtyBtn, { backgroundColor: colors.border + '30' }]}
                                                onPress={() => onUpdateQuantity(item.id, -1)}
                                            >
                                                <Ionicons name="remove" size={16} color={colors.text} />
                                            </TouchableOpacity>
                                            <Text style={[styles.qtyText, { color: colors.text }]}>{item.quantity}</Text>
                                            <TouchableOpacity
                                                style={[styles.qtyBtn, { backgroundColor: colors.border + '30' }]}
                                                onPress={() => onUpdateQuantity(item.id, 1)}
                                            >
                                                <Ionicons name="add" size={16} color={colors.text} />
                                            </TouchableOpacity>
                                        </View>
                                        <TouchableOpacity onPress={() => onRemove(item.id)} style={styles.removeBtn}>
                                            <Ionicons name="trash-outline" size={20} color={colors.requestsBadge || '#FF3B30'} />
                                        </TouchableOpacity>
                                    </View>
                                )}
                            />

                            <View style={[styles.footer, { borderTopColor: colors.border }]}>
                                <View style={styles.totalRow}>
                                    <Text style={[styles.totalLabel, { color: colors.text }]}>{t('total')}</Text>
                                    <Text style={[styles.totalValue, { color: colors.primary }]}>{currencySymbol}{total.toFixed(2)}</Text>
                                </View>
                                <AppButton
                                    title={t('checkout')}
                                    onPress={onCheckout}
                                    style={{ marginTop: 15 }}
                                />
                            </View>
                        </>
                    )}
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: { flex: 1, justifyContent: 'flex-end' },
    container: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, height: height * 0.7 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, paddingBottom: 15, borderBottomWidth: 1 },
    title: { fontSize: 20, fontFamily: 'NotoSans-Bold' },
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 10 },
    emptyText: { fontSize: 16, fontFamily: 'NotoSans-Regular' },
    list: { paddingBottom: 20 },
    cartItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1 },
    itemImage: { width: 60, height: 60, borderRadius: 12, backgroundColor: '#f0f0f0' },
    itemInfo: { flex: 1, marginLeft: 12 },
    itemName: { fontSize: 16, fontWeight: '600' },
    itemPrice: { fontSize: 14, fontWeight: '700', marginTop: 4 },
    quantityControls: { flexDirection: 'row', alignItems: 'center', gap: 12, marginHorizontal: 15 },
    qtyBtn: { width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
    qtyText: { fontSize: 16, fontWeight: '700', minWidth: 20, textAlign: 'center' },
    removeBtn: { padding: 8 },
    footer: { paddingVertical: 15, borderTopWidth: 1 },
    totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    totalLabel: { fontSize: 18, fontWeight: '600' },
    totalValue: { fontSize: 24, fontWeight: '800' }
});
