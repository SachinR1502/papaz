import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { customerService } from '@/services/customerService';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Animated,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Image
} from 'react-native';
import RazorpayCheckout from 'react-native-razorpay';

// Use the key ID from the project configuration
const RAZORPAY_KEY = 'rzp_test_S6r6AbClB7bYPF';

interface PaymentSimulatorProps {
    visible: boolean;
    amount: number;
    jobId?: string; // For bill payments
    orderId?: string; // For store orders
    type?: 'topup' | 'bill' | 'order' | 'wholesale';
    walletBalance?: number;
    userData?: {
        name?: string;
        email?: string;
        phone?: string;
    };
    onSuccess: (referenceId: string, isReal: boolean, method?: string) => void;
    onCancel: () => void;
    onFailure: (error: string) => void;
    initialMethod?: 'razorpay' | 'wallet' | 'cash';
}

export function PaymentSimulator({
    visible,
    amount,
    jobId,
    orderId: initialOrderId,
    type = 'topup',
    walletBalance = 0,
    userData,
    onSuccess,
    onCancel,
    onFailure,
    initialMethod
}: PaymentSimulatorProps) {
    const colorScheme = useColorScheme();
    const theme = colorScheme ?? 'light';
    const colors = Colors[theme];
    const isDark = theme === 'dark';

    const [status, setStatus] = useState<'checkout' | 'processing' | 'verifying' | 'success' | 'failure'>('checkout');
    const [selectedMethod, setSelectedMethod] = useState<'razorpay' | 'wallet' | 'cash'>('razorpay');
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [verifyStep, setVerifyStep] = useState(0);

    // Animation states
    const [fadeAnim] = useState(new Animated.Value(0));
    const [slideAnim] = useState(new Animated.Value(400));

    useEffect(() => {
        if (visible) {
            setStatus('checkout');
            setErrorMsg('');
            setLoading(false);
            setVerifyStep(0);
            setSelectedMethod(initialMethod || 'razorpay');
            Animated.parallel([
                Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
                Animated.timing(slideAnim, { toValue: 0, duration: 400, useNativeDriver: true })
            ]).start();
        } else {
            fadeAnim.setValue(0);
            slideAnim.setValue(400);
        }
    }, [visible, initialMethod]);

    const handleBackpress = () => {
        if (status === 'checkout') onCancel();
        else setStatus('checkout');
    };

    const handleProceed = async () => {
        if (selectedMethod === 'wallet' && walletBalance < amount) {
            Alert.alert('Insufficient Balance', 'Please top up your wallet or choose another payment method.');
            return;
        }

        if (selectedMethod === 'razorpay') {
            startRazorpayPayment();
        } else {
            // Handle Wallet and Cash
            handleOtherPayment(selectedMethod);
        }
    };

    const handleOtherPayment = async (method: 'wallet' | 'cash') => {
        try {
            setLoading(true);
            setStatus('processing');
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

            if (method === 'wallet') {
                if (type === 'bill' && jobId) {
                    await customerService.respondToBill(jobId, 'approve', 'wallet');
                } else if (type === 'order' && initialOrderId) {
                    await customerService.payStoreOrderWithWallet(initialOrderId);
                } else if (type === 'wholesale' && initialOrderId) {
                    const { technicianService } = require('@/services/technicianService');
                    await technicianService.payWholesaleOrderWithWallet(initialOrderId);
                } else {
                    throw new Error('Wallet payment is not available for this transaction.');
                }
            } else if (method === 'cash') {
                if (type === 'bill' && jobId) {
                    await customerService.respondToBill(jobId, 'approve', 'cash');
                } else if (type === 'wholesale' && initialOrderId) {
                    const { technicianService } = require('@/services/technicianService');
                    await technicianService.payWholesaleOrderWithCash(initialOrderId);
                } else {
                    throw new Error('Cash payment is only available for service bills or wholesale orders.');
                }
            }

            setStatus('verifying');
            setVerifyStep(1);
            setTimeout(() => setVerifyStep(2), 500);
            setTimeout(() => setVerifyStep(3), 1000);

            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            setTimeout(() => setStatus('success'), 1200);
            setTimeout(() => {
                onSuccess(method === 'wallet' ? 'wallet_txn_' + Date.now() : 'cash_txn_' + Date.now(), true, method);
            }, 2500);

        } catch (error: any) {
            console.error('Payment Error:', error);
            setErrorMsg(error.response?.data?.message || error.message || 'Failed to process payment');
            setStatus('failure');
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        } finally {
            setLoading(false);
        }
    };

    const startRazorpayPayment = async () => {
        try {
            setLoading(true);
            setStatus('processing');
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

            let rzpOrderId = '';

            try {
                if (type === 'topup') {
                    const res = await customerService.createWalletTopupOrder(amount);
                    rzpOrderId = res.orderId;
                } else if (type === 'bill' && jobId) {
                    const res = await customerService.createBillPaymentOrder(jobId);
                    rzpOrderId = res.orderId;
                } else if (type === 'order' && initialOrderId) {
                    const res = await customerService.createStoreOrderPayment(initialOrderId);
                    rzpOrderId = res.orderId || res.id; // Support both flattened and nested response
                } else if (type === 'wholesale' && initialOrderId) {
                    const { technicianService } = require('@/services/technicianService');
                    const res = await technicianService.createWholesaleOrderPayment(initialOrderId);
                    rzpOrderId = res.orderId || res.id;
                }
            } catch (err: any) {
                console.error('Order creation failed:', err);
                throw new Error(err.response?.data?.message || 'Failed to initialize payment gateway');
            }

            const options = {
                description: type === 'topup' ? 'Wallet Topup' : type === 'bill' ? 'Service Bill Payment' : type === 'wholesale' ? 'Wholesale Order Payment' : 'Store Order Payment',
                image: Image.resolveAssetSource(require('@/assets/logo/logo.jpeg')).uri,
                currency: 'INR',
                key: RAZORPAY_KEY,
                amount: Math.round(amount * 100),
                name: 'PAPAZ LLP',
                order_id: rzpOrderId,
                prefill: {
                    email: userData?.email || 'customer@vehical.app',
                    contact: userData?.phone || '9999999999',
                    name: userData?.name || 'Customer'
                },
                theme: { color: colors.primary },
                // Enable all payment methods
                config: {
                    display: {
                        language: 'en' as const,
                        blocks: {
                            banks: {
                                name: 'Pay via UPI / Cards / Netbanking',
                                instruments: [
                                    { method: 'upi' },
                                    { method: 'card' },
                                    { method: 'netbanking' },
                                    { method: 'wallet' }
                                ]
                            }
                        },
                        sequence: ['block.banks'],
                        preferences: { show_default_blocks: true }
                    }
                }
            };

            if (!RazorpayCheckout?.open) {
                setLoading(false);
                setStatus('checkout');
                Alert.alert('Payment Unavailable', 'Online payment is not supported in the current environment. Please try PAPAZ Wallet or Cash.');
                return;
            }

            let data;
            try {
                data = await RazorpayCheckout.open(options);
            } catch (sdkError: any) {
                if (sdkError.code === 0) { // User cancelled
                    setStatus('checkout');
                    setLoading(false);
                    return;
                }
                throw sdkError;
            }

            setStatus('verifying');
            setVerifyStep(1);
            try {
                setTimeout(() => setVerifyStep(2), 500);
                const verifyData = {
                    razorpay_order_id: data.razorpay_order_id,
                    razorpay_payment_id: data.razorpay_payment_id,
                    razorpay_signature: data.razorpay_signature,
                    // Backward compatibility
                    orderId: data.razorpay_order_id,
                    paymentId: data.razorpay_payment_id,
                    signature: data.razorpay_signature
                };

                if (type === 'topup') {
                    await customerService.verifyWalletTopup(verifyData);
                } else if (type === 'bill' && jobId) {
                    await customerService.verifyBillPayment(jobId, verifyData);
                } else if (type === 'order' && initialOrderId) {
                    await customerService.verifyStoreOrderPayment(initialOrderId, verifyData);
                } else if (type === 'wholesale' && initialOrderId) {
                    const { technicianService } = require('@/services/technicianService');
                    await technicianService.verifyWholesaleOrderPayment(initialOrderId, verifyData);
                }

                setVerifyStep(3);
                await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                setTimeout(() => setStatus('success'), 400);
                setTimeout(() => onSuccess(data.razorpay_payment_id, true, 'razorpay'), 1500);
            } catch (err: any) {
                throw new Error(err.response?.data?.message || 'Verification failed. Please contact support.');
            }

        } catch (error: any) {
            console.error('Payment Error:', error);
            setErrorMsg(error.description || error.message || 'Something went wrong');
            setStatus('failure');
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal visible={visible} transparent animationType="none" onRequestClose={onCancel}>
            <View style={styles.overlay}>
                <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]}>
                    <TouchableOpacity style={styles.flex1} activeOpacity={1} onPress={onCancel} />
                </Animated.View>

                <Animated.View
                    style={[
                        styles.sheet,
                        {
                            backgroundColor: colors.background,
                            transform: [{ translateY: slideAnim }]
                        }
                    ]}
                >
                    <View style={styles.header}>
                        <TouchableOpacity onPress={handleBackpress} style={[styles.circleBtn, { backgroundColor: isDark ? '#ffffff10' : '#00000008' }]}>
                            <Ionicons name="arrow-back" size={20} color={colors.text} />
                        </TouchableOpacity>
                        <View style={styles.headerTitleContainer}>
                            <Text style={[styles.headerTitle, { color: colors.text }]}>
                                {status === 'checkout' ? 'Payment Secure' : 'Processing...'}
                            </Text>
                            <View style={styles.secureBadgeRow}>
                                <Ionicons name="lock-closed" size={10} color="#34C759" />
                                <Text style={styles.secureBadgeText}>SSL ENCRYPTED</Text>
                            </View>
                        </View>
                        <View style={styles.appLogoPlaceholder}>
                            <MaterialCommunityIcons name="shield-check" size={24} color={colors.primary} />
                        </View>
                    </View>

                    {status === 'checkout' && (
                        <View style={styles.flex1}>
                            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                                <View style={[styles.billSummaryCard, { borderColor: isDark ? colors.border : '#EEE' }]}>
                                    <View style={styles.billMain}>
                                        <View>
                                            <Text style={[styles.billLabel, { color: colors.icon }]}>TOTAL PAYABLE</Text>
                                            <Text style={[styles.billAmount, { color: colors.text }]}>₹{amount.toLocaleString('en-IN')}</Text>
                                        </View>
                                        <View style={[styles.txBadge, { backgroundColor: colors.primary + '15' }]}>
                                            <Text style={[styles.txBadgeText, { color: colors.primary }]}>{type.toUpperCase()}</Text>
                                        </View>
                                    </View>
                                    <View style={[styles.billDivider, { backgroundColor: isDark ? '#ffffff10' : '#EEE' }]} />
                                    <View style={styles.billDetails}>
                                        <Ionicons name="information-circle-outline" size={14} color={colors.icon} />
                                        <Text style={[styles.billNote, { color: colors.icon }]}>Charges are inclusive of GST and service fees.</Text>
                                    </View>
                                </View>

                                <Text style={[styles.sectionHeading, { color: colors.icon }]}>CHOOSE PAYMENT METHOD</Text>

                                <View style={styles.methodsGrid}>
                                    <TouchableOpacity
                                        activeOpacity={0.7}
                                        style={[
                                            styles.methodItem,
                                            { borderColor: selectedMethod === 'razorpay' ? colors.primary : colors.border },
                                            selectedMethod === 'razorpay' && { backgroundColor: colors.primary + '05' }
                                        ]}
                                        onPress={() => setSelectedMethod('razorpay')}
                                    >
                                        <View style={[styles.methodIconBox, { backgroundColor: '#3395FF15' }]}>
                                            <MaterialCommunityIcons name="credit-card-outline" size={22} color="#3395FF" />
                                        </View>
                                        <View style={styles.methodTextPart}>
                                            <Text style={[styles.methodName, { color: colors.text }]}>Online Pay</Text>
                                            <Text style={styles.methodDesc}>UPI, Card, Netbanking</Text>
                                        </View>
                                        <View style={[styles.radioOuter, { borderColor: selectedMethod === 'razorpay' ? colors.primary : colors.icon }]}>
                                            {selectedMethod === 'razorpay' && <View style={[styles.radioInner, { backgroundColor: colors.primary }]} />}
                                        </View>
                                    </TouchableOpacity>

                                    {(type === 'bill' || type === 'order' || type === 'wholesale') && (
                                        <TouchableOpacity
                                            activeOpacity={0.7}
                                            style={[
                                                styles.methodItem,
                                                { borderColor: selectedMethod === 'wallet' ? colors.primary : colors.border },
                                                selectedMethod === 'wallet' && { backgroundColor: colors.primary + '05' }
                                            ]}
                                            onPress={() => setSelectedMethod('wallet')}
                                        >
                                            <View style={[styles.methodIconBox, { backgroundColor: '#34C75915' }]}>
                                                <MaterialCommunityIcons name="wallet-outline" size={22} color="#34C759" />
                                            </View>
                                            <View style={styles.methodTextPart}>
                                                <Text style={[styles.methodName, { color: colors.text }]}>PAPAZ Wallet</Text>
                                                <Text style={[styles.methodDesc, { color: walletBalance < amount ? '#FF3B30' : '#34C759' }]}>
                                                    Balance: ₹{walletBalance.toLocaleString('en-IN')}
                                                </Text>
                                            </View>
                                            <View style={[styles.radioOuter, { borderColor: selectedMethod === 'wallet' ? colors.primary : colors.icon }]}>
                                                {selectedMethod === 'wallet' && <View style={[styles.radioInner, { backgroundColor: colors.primary }]} />}
                                            </View>
                                        </TouchableOpacity>
                                    )}

                                    {(type === 'bill' || type === 'wholesale') && (
                                        <TouchableOpacity
                                            activeOpacity={0.7}
                                            style={[
                                                styles.methodItem,
                                                { borderColor: selectedMethod === 'cash' ? colors.primary : colors.border },
                                                selectedMethod === 'cash' && { backgroundColor: colors.primary + '05' }
                                            ]}
                                            onPress={() => setSelectedMethod('cash')}
                                        >
                                            <View style={[styles.methodIconBox, { backgroundColor: '#FF950015' }]}>
                                                <MaterialCommunityIcons name="cash-multiple" size={22} color="#FF9500" />
                                            </View>
                                            <View style={styles.methodTextPart}>
                                                <Text style={[styles.methodName, { color: colors.text }]}>Cash Payment</Text>
                                                <Text style={styles.methodDesc}>Pay after service completion</Text>
                                            </View>
                                            <View style={[styles.radioOuter, { borderColor: selectedMethod === 'cash' ? colors.primary : colors.icon }]}>
                                                {selectedMethod === 'cash' && <View style={[styles.radioInner, { backgroundColor: colors.primary }]} />}
                                            </View>
                                        </TouchableOpacity>
                                    )}
                                </View>
                            </ScrollView>

                            <View style={[styles.actionFooter, { borderTopColor: colors.border }]}>
                                <View style={styles.trustInfo}>
                                    <Ionicons name="shield-checkmark" size={12} color={colors.icon} />
                                    <Text style={[styles.trustText, { color: colors.icon }]}>Payments are 100% Secure & Protected</Text>
                                </View>
                                <TouchableOpacity
                                    style={[styles.mainPayBtn, { backgroundColor: colors.primary }]}
                                    activeOpacity={0.8}
                                    onPress={handleProceed}
                                >
                                    <Text style={styles.mainPayBtnText}>PROCEED TO PAY</Text>
                                    <Ionicons name="arrow-forward" size={18} color="#FFF" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}

                    {(status === 'processing' || status === 'verifying') && (
                        <View style={styles.fullStatusCenter}>
                            <View style={styles.loaderGraphic}>
                                <ActivityIndicator size="large" color={colors.primary} />
                                <View style={styles.loaderIcon}>
                                    <Ionicons name="lock-closed" size={20} color={colors.primary} />
                                </View>
                            </View>
                            <Text style={[styles.statusMainTitle, { color: colors.text }]}>
                                {status === 'processing' ? 'Processing Transaction' : 'Verifying with Bank'}
                            </Text>
                            <Text style={[styles.statusSubTitle, { color: colors.icon }]}>
                                Please wait, we are securing your payment. Do not refresh or exit.
                            </Text>

                            <View style={styles.auditSteps}>
                                <View style={styles.auditItem}>
                                    <Ionicons name={verifyStep >= 1 ? "checkmark-circle" : "sync"} size={18} color={verifyStep >= 1 ? "#34C759" : colors.primary} />
                                    <Text style={[styles.auditLabel, { color: verifyStep >= 1 ? colors.text : colors.icon }]}>Initializing Order</Text>
                                </View>
                                <View style={styles.auditItem}>
                                    <Ionicons name={verifyStep >= 2 ? "checkmark-circle" : "ellipse-outline"} size={18} color={verifyStep >= 2 ? "#34C759" : colors.icon} />
                                    <Text style={[styles.auditLabel, { color: verifyStep >= 2 ? colors.text : colors.icon }]}>Secure Handshake</Text>
                                </View>
                                <View style={styles.auditItem}>
                                    <Ionicons name={verifyStep >= 3 ? "checkmark-circle" : "ellipse-outline"} size={18} color={verifyStep >= 3 ? "#34C759" : colors.icon} />
                                    <Text style={[styles.auditLabel, { color: verifyStep >= 3 ? colors.text : colors.icon }]}>API Confirmation</Text>
                                </View>
                            </View>
                        </View>
                    )}

                    {status === 'success' && (
                        <View style={styles.fullStatusCenter}>
                            <View style={styles.successBlast}>
                                <Ionicons name="checkmark-circle" size={80} color="#34C759" />
                            </View>
                            <Text style={[styles.statusMainTitle, { color: colors.text }]}>Payment Successful!</Text>
                            <Text style={[styles.statusSubTitle, { color: colors.icon }]}>
                                Your transaction has been confirmed. Redirecting you to the dashboard.
                            </Text>
                            <View style={[styles.receiptFlat, { backgroundColor: isDark ? '#ffffff08' : '#F9F9F9' }]}>
                                <Text style={[styles.receiptFlatText, { color: colors.text }]}>Transaction ID: TXN{Date.now().toString().slice(-8)}</Text>
                            </View>
                        </View>
                    )}

                    {status === 'failure' && (
                        <View style={styles.fullStatusCenter}>
                            <View style={styles.failureBlast}>
                                <Ionicons name="alert-circle" size={80} color="#FF3B30" />
                            </View>
                            <Text style={[styles.statusMainTitle, { color: colors.text }]}>Payment Failed</Text>
                            <Text style={[styles.statusSubTitle, { color: colors.icon }]}>
                                {errorMsg || 'We were unable to process your payment at this moment.'}
                            </Text>
                            <TouchableOpacity
                                style={[styles.errorBtn, { backgroundColor: colors.text }]}
                                onPress={() => setStatus('checkout')}
                            >
                                <Text style={{ color: colors.background, fontFamily: 'NotoSans-Black' }}>TRY AGAIN</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </Animated.View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: { flex: 1, justifyContent: 'flex-end' },
    backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.8)' },
    flex1: { flex: 1 },
    sheet: {
        borderTopLeftRadius: 36,
        borderTopRightRadius: 36,
        padding: 24,
        paddingBottom: Platform.OS === 'ios' ? 40 : 24,
        minHeight: 580,
        maxHeight: '92%',
        elevation: 20
    },
    header: { flexDirection: 'row', alignItems: 'center', marginBottom: 24, gap: 16 },
    circleBtn: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
    headerTitleContainer: { flex: 1 },
    headerTitle: { fontSize: 20, fontFamily: 'NotoSans-Black' },
    secureBadgeRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
    secureBadgeText: { fontSize: 9, fontFamily: 'NotoSans-Black', color: '#34C759', letterSpacing: 0.5 },
    appLogoPlaceholder: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
    scrollContent: { paddingBottom: 24 },
    billSummaryCard: { padding: 20, borderRadius: 24, borderWidth: 1, marginBottom: 24 },
    billMain: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    billLabel: { fontSize: 10, fontFamily: 'NotoSans-Black', letterSpacing: 1, marginBottom: 4 },
    billAmount: { fontSize: 32, fontFamily: 'NotoSans-Black' },
    txBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    txBadgeText: { fontSize: 10, fontFamily: 'NotoSans-Black' },
    billDivider: { height: 1, marginVertical: 16 },
    billDetails: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    billNote: { fontSize: 11, fontFamily: 'NotoSans-Medium' },
    sectionHeading: { fontSize: 12, fontFamily: 'NotoSans-Black', letterSpacing: 1, marginBottom: 16 },
    methodsGrid: { gap: 12 },
    methodItem: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 20, borderWidth: 1.5, gap: 16 },
    methodIconBox: { width: 48, height: 48, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
    methodTextPart: { flex: 1 },
    methodName: { fontSize: 16, fontFamily: 'NotoSans-Bold' },
    methodDesc: { fontSize: 12, fontFamily: 'NotoSans-Medium', opacity: 0.6 },
    radioOuter: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, justifyContent: 'center', alignItems: 'center' },
    radioInner: { width: 12, height: 12, borderRadius: 6 },
    actionFooter: { paddingTop: 20, borderTopWidth: 1 },
    trustInfo: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 16 },
    trustText: { fontSize: 11, fontFamily: 'NotoSans-Medium' },
    mainPayBtn: { height: 60, borderRadius: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8 },
    mainPayBtnText: { color: '#FFF', fontSize: 16, fontFamily: 'NotoSans-Black' },
    fullStatusCenter: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 },
    loaderGraphic: { width: 80, height: 80, justifyContent: 'center', alignItems: 'center' },
    loaderIcon: { position: 'absolute' },
    statusMainTitle: { fontSize: 22, fontFamily: 'NotoSans-Black', marginTop: 24, textAlign: 'center' },
    statusSubTitle: { fontSize: 14, fontFamily: 'NotoSans-Medium', textAlign: 'center', marginTop: 8, opacity: 0.7, lineHeight: 20 },
    auditSteps: { width: '100%', marginTop: 40, gap: 16 },
    auditItem: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: 'rgba(0,0,0,0.03)', padding: 14, borderRadius: 16 },
    auditLabel: { fontSize: 14, fontFamily: 'NotoSans-Bold' },
    successBlast: { width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(52,199,89,0.1)', justifyContent: 'center', alignItems: 'center' },
    receiptFlat: { marginTop: 20, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10 },
    receiptFlatText: { fontSize: 12, fontFamily: 'NotoSans-Bold', opacity: 0.6 },
    failureBlast: { width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(255,59,48,0.1)', justifyContent: 'center', alignItems: 'center' },
    errorBtn: { marginTop: 30, height: 50, paddingHorizontal: 40, borderRadius: 25, justifyContent: 'center', alignItems: 'center' }
});
