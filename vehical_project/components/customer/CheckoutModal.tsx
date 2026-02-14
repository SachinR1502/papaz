import { AppButton } from '@/components/ui/AppButton';
import { Colors } from '@/constants/theme';
import { useLanguage } from '@/context/LanguageContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
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

interface CheckoutModalProps {
    visible: boolean;
    onClose: () => void;
    items: CartItem[];
    total: number;
    addresses: any[];
    garages: any[];
    walletBalance: number;
    onPlaceOrder: (data: {
        deliveryType: 'address' | 'garage';
        deliveryAddressId?: string;
        garageId?: string;
        paymentMethod: 'razorpay' | 'wallet' | 'cash';
    }) => Promise<void>;
    currencySymbol?: string;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
    visible,
    onClose,
    items,
    total,
    addresses,
    garages,
    walletBalance,
    onPlaceOrder,
    currencySymbol = '$'
}) => {
    const { t } = useLanguage();
    const colorScheme = useColorScheme();
    const theme = colorScheme ?? 'light';
    const colors = Colors[theme];
    const isDark = theme === 'dark';

    const [step, setStep] = useState(1);
    const [deliveryType, setDeliveryType] = useState<'address' | 'garage'>('address');
    const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
    const [selectedGarageId, setSelectedGarageId] = useState<string | null>(null);
    const [paymentMethod, setPaymentMethod] = useState<'razorpay' | 'wallet' | 'cash'>('razorpay');
    const [loading, setLoading] = useState(false);

    const handleNext = () => {
        if (step === 1) setStep(2);
        else if (step === 2) {
            if (deliveryType === 'address' && !selectedAddressId) {
                Alert.alert(t('error'), t('select_delivery_address') || 'Please select a delivery address');
                return;
            }
            if (deliveryType === 'garage' && !selectedGarageId) {
                Alert.alert(t('error'), t('select_garage') || 'Please select a garage');
                return;
            }
            setStep(3);
        }
    };

    const handleBack = () => {
        if (step > 1) setStep(step - 1);
    };

    const handleSubmit = async () => {
        console.log('[CheckoutModal] handleSubmit triggered', {
            deliveryType,
            deliveryAddressId: deliveryType === 'address' ? selectedAddressId : undefined,
            garageId: deliveryType === 'garage' ? selectedGarageId : undefined,
            paymentMethod
        });

        setLoading(true);
        try {
            await onPlaceOrder({
                deliveryType,
                deliveryAddressId: deliveryType === 'address' ? selectedAddressId! : undefined,
                garageId: deliveryType === 'garage' ? selectedGarageId! : undefined,
                paymentMethod
            });
        } catch (e) {
            console.error('[CheckoutModal] onPlaceOrder error:', e);
        } finally {
            setLoading(false);
        }
    };

    const renderStepIndicators = () => (
        <View style={styles.stepsContainer}>
            {[1, 2, 3].map((s, index) => (
                <View key={s} style={styles.stepWrapper}>
                    <View style={[
                        styles.stepCircle,
                        {
                            backgroundColor: step >= s ? colors.primary : colors.card,
                            borderColor: step >= s ? colors.primary : colors.border
                        }
                    ]}>
                        {step > s ? (
                            <Ionicons name="checkmark" size={14} color="#FFF" />
                        ) : (
                            <Text style={[styles.stepNum, { color: step >= s ? '#FFF' : colors.icon }]}>{s}</Text>
                        )}
                    </View>
                    {index < 2 && <View style={[styles.stepLine, { backgroundColor: step > s ? colors.primary : colors.border }]} />}
                </View>
            ))}
        </View>
    );

    const getButtonText = () => {
        if (loading) return t('processing') || 'Processing...';
        if (paymentMethod === 'cash') return t('place_order') || 'Place Order';
        if (paymentMethod === 'wallet') return `${t('pay_from_wallet') || 'Pay'} • ${currencySymbol}${total.toFixed(2)}`;
        return `${t('pay_now')} • ${currencySymbol}${total.toFixed(2)}`;
    };

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View style={styles.modalOverlay}>
                <BlurView intensity={30} tint={isDark ? "dark" : "light"} style={StyleSheet.absoluteFill} />
                <View style={[styles.container, { backgroundColor: colors.background }]}>

                    {/* Header */}
                    <View style={[styles.header, { borderBottomColor: colors.border }]}>
                        <TouchableOpacity onPress={handleBack} disabled={step === 1} style={{ opacity: step === 1 ? 0 : 1, padding: 4 }}>
                            <Ionicons name="arrow-back" size={24} color={colors.text} />
                        </TouchableOpacity>
                        <Text style={[styles.title, { color: colors.text }]}>
                            {step === 1 ? t('review_order') : step === 2 ? t('delivery_details') : t('payment_method')}
                        </Text>
                        <TouchableOpacity onPress={onClose} style={{ padding: 4 }}>
                            <Ionicons name="close-circle" size={30} color={colors.icon} />
                        </TouchableOpacity>
                    </View>

                    {renderStepIndicators()}

                    <ScrollView
                        style={styles.content}
                        contentContainerStyle={{ paddingBottom: 100 }}
                        showsVerticalScrollIndicator={false}
                    >
                        {step === 1 && (
                            <View style={styles.stepContent}>
                                <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                                    {items.map((item, idx) => (
                                        <View key={idx} style={[styles.itemSummary, { borderBottomColor: colors.border }]}>
                                            <View style={[styles.itemIcon, { backgroundColor: colors.primary + '10' }]}>
                                                <Ionicons name="cube-outline" size={18} color={colors.primary} />
                                            </View>
                                            <View style={{ flex: 1 }}>
                                                <Text style={[styles.itemName, { color: colors.text }]}>{item.name}</Text>
                                                <Text style={[styles.itemPrice, { color: colors.icon }]}>
                                                    {item.quantity} x {currencySymbol}{parseFloat(item.price.toString()).toFixed(2)}
                                                </Text>
                                            </View>
                                            <Text style={{ fontWeight: '700', color: colors.text }}>
                                                {currencySymbol}{(parseFloat(item.price.toString()) * item.quantity).toFixed(2)}
                                            </Text>
                                        </View>
                                    ))}
                                    <View style={[styles.totalBlock, { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 16 }]}>
                                        <Text style={[styles.totalLabel, { color: colors.text }]}>{t('total_to_pay')}</Text>
                                        <Text style={[styles.totalValue, { color: colors.primary }]}>{currencySymbol}{total.toFixed(2)}</Text>
                                    </View>
                                </View>
                            </View>
                        )}

                        {step === 2 && (
                            <View style={styles.stepContent}>
                                <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('how_to_receive')}</Text>
                                <View style={styles.deliveryToggle}>
                                    <TouchableOpacity
                                        style={[
                                            styles.toggleBtn,
                                            { backgroundColor: deliveryType === 'address' ? colors.primary : colors.card, borderColor: deliveryType === 'address' ? colors.primary : colors.border }
                                        ]}
                                        onPress={() => setDeliveryType('address')}
                                    >
                                        <Ionicons name="location" size={18} color={deliveryType === 'address' ? '#FFF' : colors.text} />
                                        <Text style={[styles.toggleText, { color: deliveryType === 'address' ? '#FFF' : colors.text }]}>{t('to_home_address')}</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[
                                            styles.toggleBtn,
                                            { backgroundColor: deliveryType === 'garage' ? colors.primary : colors.card, borderColor: deliveryType === 'garage' ? colors.primary : colors.border }
                                        ]}
                                        onPress={() => setDeliveryType('garage')}
                                    >
                                        <MaterialCommunityIcons name="garage" size={18} color={deliveryType === 'garage' ? '#FFF' : colors.text} />
                                        <Text style={[styles.toggleText, { color: deliveryType === 'garage' ? '#FFF' : colors.text }]}>{t('to_partner_garage')}</Text>
                                    </TouchableOpacity>
                                </View>

                                {deliveryType === 'address' ? (
                                    <View style={styles.selectionList}>
                                        {addresses.length === 0 && (
                                            <View style={{ padding: 20, alignItems: 'center' }}>
                                                <Text style={{ color: colors.icon }}>{t('no_saved_addresses')}</Text>
                                            </View>
                                        )}
                                        {addresses.map((addr) => (
                                            <TouchableOpacity
                                                key={addr._id || addr.id}
                                                style={[
                                                    styles.selectionItem,
                                                    { backgroundColor: colors.card, borderColor: selectedAddressId === (addr._id || addr.id) ? colors.primary : colors.border }
                                                ]}
                                                onPress={() => setSelectedAddressId(addr._id || addr.id)}
                                            >
                                                <View style={[styles.selectionIcon, { backgroundColor: selectedAddressId === (addr._id || addr.id) ? colors.primary + '15' : colors.background }]}>
                                                    <Ionicons name={selectedAddressId === (addr._id || addr.id) ? "checkmark" : "location-outline"} size={20} color={selectedAddressId === (addr._id || addr.id) ? colors.primary : colors.icon} />
                                                </View>
                                                <View style={{ flex: 1 }}>
                                                    <Text style={[styles.selectionLabel, { color: colors.text }]}>{addr.label}</Text>
                                                    <Text style={[styles.selectionSub, { color: colors.icon }]} numberOfLines={2}>{addr.address || addr.addressLine1}</Text>
                                                </View>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                ) : (
                                    <View style={styles.selectionList}>
                                        {garages.length === 0 && (
                                            <View style={{ padding: 20, alignItems: 'center' }}>
                                                <Text style={{ color: colors.icon }}>{t('no_garages_available')}</Text>
                                            </View>
                                        )}
                                        {garages.map((garage) => (
                                            <TouchableOpacity
                                                key={garage.id}
                                                style={[
                                                    styles.selectionItem,
                                                    { backgroundColor: colors.card, borderColor: selectedGarageId === garage.id ? colors.primary : colors.border }
                                                ]}
                                                onPress={() => setSelectedGarageId(garage.id)}
                                            >
                                                <View style={[styles.selectionIcon, { backgroundColor: selectedGarageId === garage.id ? colors.primary + '15' : colors.background }]}>
                                                    <MaterialCommunityIcons name={selectedGarageId === garage.id ? "check" : "garage-variant"} size={20} color={selectedGarageId === garage.id ? colors.primary : colors.icon} />
                                                </View>
                                                <View style={{ flex: 1 }}>
                                                    <Text style={[styles.selectionLabel, { color: colors.text }]}>{garage.name}</Text>
                                                    <Text style={[styles.selectionSub, { color: colors.icon }]}>{garage.city}</Text>
                                                </View>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                )}
                            </View>
                        )}

                        {step === 3 && (
                            <View style={styles.stepContent}>
                                <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('payment_method')}</Text>

                                <TouchableOpacity
                                    style={[
                                        styles.paymentItem,
                                        { backgroundColor: colors.card, borderColor: paymentMethod === 'wallet' ? colors.primary : colors.border },
                                        walletBalance < total && { opacity: 0.6 }
                                    ]}
                                    onPress={() => {
                                        if (walletBalance >= total) setPaymentMethod('wallet');
                                        else Alert.alert(t('insufficient_balance'), t('add_money_to_wallet') || "Please add money to your wallet to proceed.");
                                    }}
                                >
                                    <View style={[styles.paymentIcon, { backgroundColor: colors.primary + '15' }]}>
                                        <Ionicons name="wallet" size={24} color={colors.primary} />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={[styles.paymentLabel, { color: colors.text }]}>{t('wallet_balance')}</Text>
                                        <Text style={[styles.paymentSub, { color: walletBalance >= total ? colors.primary : colors.notification, fontWeight: '700' }]}>
                                            {currencySymbol}{walletBalance.toFixed(2)}
                                            {walletBalance < total && <Text style={{ fontSize: 11, fontWeight: '400' }}> ({t('low_balance') || 'Low Balance'})</Text>}
                                        </Text>
                                    </View>
                                    <View style={[styles.radioOuter, { borderColor: paymentMethod === 'wallet' ? colors.primary : colors.icon }]}>
                                        {paymentMethod === 'wallet' && <View style={[styles.radioInner, { backgroundColor: colors.primary }]} />}
                                    </View>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[
                                        styles.paymentItem,
                                        { backgroundColor: colors.card, borderColor: paymentMethod === 'razorpay' ? colors.primary : colors.border }
                                    ]}
                                    onPress={() => setPaymentMethod('razorpay')}
                                >
                                    <View style={[styles.paymentIcon, { backgroundColor: '#34C75915' }]}>
                                        <Ionicons name="card" size={24} color="#34C759" />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={[styles.paymentLabel, { color: colors.text }]}>{t('online_payment')}</Text>
                                        <Text style={[styles.paymentSub, { color: colors.icon }]}>UPI, Cards, Netbanking</Text>
                                    </View>
                                    <View style={[styles.radioOuter, { borderColor: paymentMethod === 'razorpay' ? colors.primary : colors.icon }]}>
                                        {paymentMethod === 'razorpay' && <View style={[styles.radioInner, { backgroundColor: colors.primary }]} />}
                                    </View>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[
                                        styles.paymentItem,
                                        { backgroundColor: colors.card, borderColor: paymentMethod === 'cash' ? colors.primary : colors.border }
                                    ]}
                                    onPress={() => setPaymentMethod('cash')}
                                >
                                    <View style={[styles.paymentIcon, { backgroundColor: '#FF950015' }]}>
                                        <Ionicons name="cash" size={24} color="#FF9500" />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={[styles.paymentLabel, { color: colors.text }]}>{t('cash_on_delivery')}</Text>
                                        <Text style={[styles.paymentSub, { color: colors.icon }]}>{t('pay_at_doorstep')}</Text>
                                    </View>
                                    <View style={[styles.radioOuter, { borderColor: paymentMethod === 'cash' ? colors.primary : colors.icon }]}>
                                        {paymentMethod === 'cash' && <View style={[styles.radioInner, { backgroundColor: colors.primary }]} />}
                                    </View>
                                </TouchableOpacity>
                            </View>
                        )}
                    </ScrollView>

                    <View style={[styles.footer, { borderTopColor: colors.border, backgroundColor: colors.background }]}>
                        {step === 1 && (
                            <AppButton
                                title={t('proceed_to_delivery')}
                                onPress={handleNext}
                                variant="primary"
                            />
                        )}
                        {step === 2 && (
                            <AppButton
                                title={t('proceed_to_payment')}
                                onPress={handleNext}
                                variant="primary"
                                disabled={(deliveryType === 'address' && !selectedAddressId) || (deliveryType === 'garage' && !selectedGarageId)}
                            />
                        )}
                        {step === 3 && (
                            <AppButton
                                title={getButtonText()}
                                onPress={handleSubmit}
                                loading={loading}
                                variant="primary"
                            />
                        )}
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
    container: { borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 0, height: height * 0.85, overflow: 'hidden' },

    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1 },
    title: { fontSize: 18, fontFamily: 'NotoSans-Bold', fontWeight: '800' },

    stepsContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginVertical: 20 },
    stepWrapper: { flexDirection: 'row', alignItems: 'center' },
    stepCircle: { width: 32, height: 32, borderRadius: 16, borderWidth: 1, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 2 },
    stepNum: { fontSize: 14, fontFamily: 'NotoSans-Bold', fontWeight: 'bold' },
    stepLine: { width: 40, height: 2, marginHorizontal: 8 },

    content: { flex: 1, paddingHorizontal: 20 },
    stepContent: { paddingTop: 10 },

    summaryCard: { borderRadius: 20, borderWidth: 1, padding: 16 },
    itemSummary: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, gap: 12 },
    itemIcon: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    itemName: { fontSize: 15, fontWeight: '600', marginBottom: 2 },
    itemPrice: { fontSize: 13 },
    totalBlock: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    totalLabel: { fontSize: 16, fontWeight: '700' },
    totalValue: { fontSize: 22, fontWeight: '900' },

    sectionTitle: { fontSize: 18, fontFamily: 'NotoSans-Bold', fontWeight: '800', marginBottom: 16 },

    deliveryToggle: { flexDirection: 'row', gap: 12, marginBottom: 24 },
    toggleBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16, borderRadius: 16, borderWidth: 1, gap: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
    toggleText: { fontSize: 14, fontWeight: '700' },

    selectionList: { gap: 12 },
    selectionItem: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 18, borderWidth: 1, gap: 16 },
    selectionIcon: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
    selectionLabel: { fontSize: 15, fontWeight: '700', marginBottom: 2 },
    selectionSub: { fontSize: 13 },

    paymentItem: { flexDirection: 'row', alignItems: 'center', padding: 20, borderRadius: 20, borderWidth: 1, gap: 16, marginBottom: 16 },
    paymentIcon: { width: 48, height: 48, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
    paymentLabel: { fontSize: 16, fontWeight: '700', marginBottom: 2 },
    paymentSub: { fontSize: 13 },
    radioOuter: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, justifyContent: 'center', alignItems: 'center' },
    radioInner: { width: 12, height: 12, borderRadius: 6 },

    footer: { padding: 20, paddingBottom: 34, borderTopWidth: 1 }
});
