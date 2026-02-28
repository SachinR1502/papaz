'use client';
import { useCart } from '@/context/CartContext';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import {
    MapPin,
    CreditCard,
    Truck,
    Home,
    Briefcase,
    ChevronRight,
    Plus,
    Smartphone,
    Wallet,
    CheckCircle2,
    ArrowLeft,
    Loader2,
    ShieldCheck,
    Lock
} from 'lucide-react';
import { cn } from '@/lib/utils';

declare global {
    interface Window {
        Razorpay: any;
    }
}

const loadRazorpay = () => {
    return new Promise((resolve) => {
        if (typeof document === 'undefined') return resolve(false);
        if (document.getElementById('razorpay-script')) {
            resolve(true);
            return;
        }
        const script = document.createElement("script");
        script.id = 'razorpay-script';
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
};

export default function CheckoutPage() {
    const { cart, totalPrice, clearCart } = useCart();
    const { user, token } = useAuth();
    const router = useRouter();

    const [step, setStep] = useState(1);
    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'cod' | 'wallet'>('upi');

    const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
    const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
    const [isAddingAddress, setIsAddingAddress] = useState(false);
    const [loadingAddresses, setLoadingAddresses] = useState(false);

    const [newAddress, setNewAddress] = useState({
        label: 'Home',
        fullName: '',
        phone: '',
        addressLine1: '',
        addressLine2: '',
        city: 'Bangalore',
        state: 'Karnataka',
        zipCode: '',
        country: 'India',
        icon: 'home'
    });

    useEffect(() => {
        if (user) {
            setNewAddress(prev => ({
                ...prev,
                fullName: (user as any).profile?.fullName || (user as any).name || '',
                phone: (user as any).phoneNumber || ''
            }));
        }
    }, [user]);

    useEffect(() => {
        if (token) {
            fetchAddresses();
        }
    }, [token]);

    const fetchAddresses = async () => {
        setLoadingAddresses(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/customer/addresses`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const responseData = await res.json();
                const data = responseData.data || responseData;

                if (Array.isArray(data)) {
                    setSavedAddresses(data);
                    if (data.length > 0) {
                        setSelectedAddressId(data[0]._id);
                    } else {
                        setIsAddingAddress(true);
                    }
                }
            }
        } catch (error) {
            console.error('Failed to fetch addresses:', error);
        } finally {
            setLoadingAddresses(false);
        }
    };

    const handleAddAddress = async () => {
        if (!newAddress.addressLine1 || !newAddress.city || !newAddress.zipCode || !newAddress.phone) {
            toast.error('Please fill in all required fields');
            return;
        }

        try {
            const payload = {
                ...newAddress,
                address: `${newAddress.addressLine1}, ${newAddress.addressLine2 ? newAddress.addressLine2 + ', ' : ''}${newAddress.city} - ${newAddress.zipCode}`
            };

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/customer/addresses`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                const responseData = await res.json();
                const addresses = responseData.data || responseData;

                if (Array.isArray(addresses)) {
                    setSavedAddresses(addresses);
                    if (addresses.length > 0) {
                        const newAddr = addresses[addresses.length - 1];
                        setSelectedAddressId(newAddr._id);
                    }
                    setIsAddingAddress(false);
                    toast.success('Address saved successfully');
                }
            } else {
                const errorData = await res.json().catch(() => ({}));
                console.error('Failed to save address:', errorData);
                toast.error(errorData.message || 'Failed to save address. Please try again.');
            }
        } catch (error) {
            console.error(error);
            toast.error('Something went wrong. Please check your connection.');
        }
    };

    const handlePlaceOrder = async () => {
        if (!token) {
            toast.error('Please login to continue');
            return router.push('/login');
        }

        if (!selectedAddressId) {
            toast.error('Please select a shipping address');
            return;
        }

        setIsProcessing(true);
        const deliveryAddress = savedAddresses.find(addr => addr._id === selectedAddressId);

        try {
            const orderPayload = {
                items: cart.map(item => ({
                    id: item.id,
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity,
                    image: item.image,
                    supplierId: (item as any).supplierId
                })),
                totalAmount: totalPrice,
                paymentMethod: paymentMethod === 'cod' ? 'cash' : (paymentMethod === 'wallet' ? 'wallet' : 'razorpay'),
                deliveryType: 'address',
                deliveryAddressId: selectedAddressId,
                deliveryFee: 0
            };

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/customer/orders`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(orderPayload)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to place order');
            }
            const orderData = await response.json();

            if (paymentMethod === 'cod') {
                clearCart();
                router.push(`/order-success?id=${orderData.orderId}`);
            } else if (paymentMethod === 'wallet') {
                const payRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/customer/orders/${orderData._id}/wallet-pay`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (payRes.ok) {
                    clearCart();
                    router.push(`/order-success?id=${orderData.orderId}`);
                } else {
                    toast.error('Insufficient wallet balance');
                    setIsProcessing(false);
                }
            } else {
                await handleRazorpayPayment(orderData._id, orderData.orderId, totalPrice, deliveryAddress);
            }

        } catch (error: any) {
            console.error(error);
            toast.error(error.message || 'Order failed. Please try again.');
            setIsProcessing(false);
        }
    };

    const handleRazorpayPayment = async (mongoOrderId: string, orderNumber: string, amount: number, address: any) => {
        const isLoaded = await loadRazorpay();
        if (!isLoaded) {
            toast.error('Payment gateway failed to load. Please try again.');
            setIsProcessing(false);
            return;
        }

        try {
            const paymentRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/customer/orders/${mongoOrderId}/pay`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!paymentRes.ok) {
                const errorData = await paymentRes.json();
                throw new Error(errorData.message || 'Failed to initiate payment');
            }

            const paymentData = await paymentRes.json();

            if (!paymentData.keyId || !paymentData.orderId) {
                toast.error('Payment configuration error');
                setIsProcessing(false);
                return;
            }

            const options: any = {
                key: paymentData.keyId,
                amount: paymentData.amount,
                currency: "INR",
                name: "PAPAZ",
                description: `Order #${orderNumber}`,
                image: `${window.location.origin}/icon.png`,
                order_id: paymentData.orderId,
                handler: async (response: any) => {
                    try {
                        const verifyRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/customer/orders/${mongoOrderId}/verify`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${token}`
                            },
                            body: JSON.stringify({
                                razorpayOrderId: response.razorpay_order_id,
                                razorpayPaymentId: response.razorpay_payment_id,
                                razorpaySignature: response.razorpay_signature
                            })
                        });

                        if (verifyRes.ok) {
                            clearCart();
                            router.push(`/order-success?id=${orderNumber}`);
                        } else {
                            toast.error('Payment verification failed');
                            setIsProcessing(false);
                        }
                    } catch (err) {
                        toast.error('Verification timed out');
                        setIsProcessing(false);
                    }
                },
                prefill: {
                    name: address?.fullName || user?.profile?.fullName || '',
                    contact: (address?.phone || user?.phoneNumber || '').replace(/^\+91/, '') ? `+91${(address?.phone || user?.phoneNumber || '').replace(/^\+91/, '')}` : '',
                    email: user?.email || '',
                    method: { upi: true, card: true, netbanking: true, wallet: true, emi: true }
                },
                notes: { address: address?.address || '' },
                theme: { color: "#FF8C00" },
                modal: {
                    ondismiss: function () {
                        setIsProcessing(false);
                        toast.info('Payment cancelled');
                    }
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', function (response: any) {
                setIsProcessing(false);
                toast.error(response.error.description || 'Payment failed');
            });
            rzp.open();

        } catch (error: any) {
            console.error(error);
            toast.error(error.message || 'Payment gateway unreachable');
            setIsProcessing(false);
        }
    };

    if (cart.length === 0 && !isProcessing) {
        return (
            <div className="min-h-screen bg-background flex flex-col">
                <Navbar />
                <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                    <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-6 animate-pulse">
                        <Smartphone size={40} className="text-primary" />
                    </div>
                    <h2 className="text-3xl font-black italic uppercase tracking-tighter mb-4">Your cart is empty</h2>
                    <p className="text-muted font-medium max-w-xs mb-8">Add components to your cart to proceed with checkout.</p>
                    <button onClick={() => router.push('/')} className="btn-primary-gradient px-8 py-4 rounded-2xl uppercase italic tracking-widest text-[11px]">
                        Browse Products
                    </button>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            <Navbar />

            <main className="flex-1 pt-24 pb-20">
                <div className="max-w-6xl mx-auto px-4 md:px-6">
                    {/* Header */}
                    <div className="mb-10">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Checkout</h1>
                        <p className="text-sm text-gray-500">Complete your order by providing shipping and payment details.</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                        {/* Main Content */}
                        <div className="lg:col-span-8 space-y-6">

                            {/* Steps */}
                            <div className="bg-white rounded-2xl border border-gray-200 p-1 flex mb-6">
                                <button
                                    onClick={() => setStep(1)}
                                    className={cn(
                                        "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all",
                                        step === 1 ? "bg-orange-500 text-white shadow-sm" : "text-gray-500 hover:text-gray-700"
                                    )}
                                >
                                    <MapPin size={16} />
                                    <span>1. Shipping</span>
                                </button>
                                <button
                                    onClick={() => step > 1 && setStep(2)}
                                    disabled={step < 2 && !selectedAddressId}
                                    className={cn(
                                        "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all",
                                        step === 2 ? "bg-orange-500 text-white shadow-sm" : "text-gray-500 hover:text-gray-700 disabled:opacity-50"
                                    )}
                                >
                                    <CreditCard size={16} />
                                    <span>2. Payment</span>
                                </button>
                            </div>

                            {/* Shipping Address */}
                            <section className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
                                            <MapPin size={18} />
                                        </div>
                                        <h2 className="font-bold text-gray-900">Shipping Address</h2>
                                    </div>
                                    {step === 2 && (
                                        <button onClick={() => setStep(1)} className="text-xs font-bold text-orange-600 hover:underline">
                                            Edit
                                        </button>
                                    )}
                                </div>

                                <div className="p-6">
                                    {step === 1 ? (
                                        <div className="space-y-6">
                                            {!isAddingAddress && savedAddresses.length > 0 ? (
                                                <>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        {savedAddresses.map((addr) => (
                                                            <div
                                                                key={addr._id}
                                                                onClick={() => setSelectedAddressId(addr._id)}
                                                                className={cn(
                                                                    "p-4 rounded-xl border-2 cursor-pointer transition-all relative",
                                                                    selectedAddressId === addr._id
                                                                        ? "border-orange-500 bg-orange-50/30"
                                                                        : "border-gray-100 hover:border-gray-200 bg-gray-50/50"
                                                                )}
                                                            >
                                                                <div className="flex items-start justify-between mb-2">
                                                                    <div className="flex items-center gap-2">
                                                                        {addr.label === 'Work' ? <Briefcase size={14} className="text-gray-400" /> : <Home size={14} className="text-gray-400" />}
                                                                        <span className="text-xs font-bold uppercase tracking-wider text-gray-500">{addr.label}</span>
                                                                    </div>
                                                                    {selectedAddressId === addr._id && <CheckCircle2 size={18} className="text-orange-500" />}
                                                                </div>
                                                                <p className="text-sm font-bold text-gray-900 mb-1">{addr.fullName}</p>
                                                                <p className="text-xs text-gray-600 leading-relaxed mb-2">{addr.address}</p>
                                                                <p className="text-[10px] font-medium text-gray-400">{addr.phone}</p>
                                                            </div>
                                                        ))}
                                                        <button
                                                            onClick={() => setIsAddingAddress(true)}
                                                            className="flex flex-col items-center justify-center p-6 rounded-xl border-2 border-dashed border-gray-200 text-gray-400 hover:text-orange-500 hover:border-orange-500 hover:bg-orange-50/30 transition-all gap-2"
                                                        >
                                                            <Plus size={20} />
                                                            <span className="text-xs font-bold uppercase tracking-wider">New Address</span>
                                                        </button>
                                                    </div>
                                                    <button
                                                        onClick={() => setStep(2)}
                                                        disabled={!selectedAddressId}
                                                        className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl hover:bg-slate-800 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                                                    >
                                                        Proceed to Payment
                                                        <ChevronRight size={18} />
                                                    </button>
                                                </>
                                            ) : (
                                                <div className="space-y-4">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <SimpleInput label="Full Name" value={newAddress.fullName} onChange={(v: string) => setNewAddress({ ...newAddress, fullName: v })} placeholder="John Doe" />
                                                        <SimpleInput label="Phone Number" value={newAddress.phone} onChange={(v: string) => setNewAddress({ ...newAddress, phone: v })} placeholder="9876543210" />
                                                        <div className="md:col-span-2">
                                                            <SimpleInput label="Address Line 1" value={newAddress.addressLine1} onChange={(v: string) => setNewAddress({ ...newAddress, addressLine1: v })} placeholder="House No, Building, Street" />
                                                        </div>
                                                        <div className="md:col-span-2">
                                                            <SimpleInput label="Address Line 2" value={newAddress.addressLine2} onChange={(v: string) => setNewAddress({ ...newAddress, addressLine2: v })} placeholder="Area, Landmark" />
                                                        </div>
                                                        <SimpleInput label="Pincode" value={newAddress.zipCode} onChange={(v: string) => setNewAddress({ ...newAddress, zipCode: v })} placeholder="560001" />
                                                        <SimpleInput label="City" value={newAddress.city} onChange={(v: string) => setNewAddress({ ...newAddress, city: v })} placeholder="Bangalore" />
                                                    </div>
                                                    <div className="flex items-center gap-4 pt-4">
                                                        <div className="flex bg-gray-100 p-1 rounded-lg">
                                                            {['Home', 'Work'].map(l => (
                                                                <button
                                                                    key={l}
                                                                    onClick={() => setNewAddress({ ...newAddress, label: l })}
                                                                    className={cn(
                                                                        "px-4 py-2 rounded-md text-xs font-bold transition-all",
                                                                        newAddress.label === l ? "bg-white text-orange-600 shadow-sm" : "text-gray-500"
                                                                    )}
                                                                >{l}</button>
                                                            ))}
                                                        </div>
                                                        <div className="flex-1 flex gap-2">
                                                            <button onClick={handleAddAddress} className="flex-1 bg-orange-500 text-white text-xs font-bold py-3 rounded-xl hover:bg-orange-600 transition-all">Save & Continue</button>
                                                            {savedAddresses.length > 0 && (
                                                                <button onClick={() => setIsAddingAddress(false)} className="px-4 text-xs font-bold text-gray-500 hover:text-gray-700">Cancel</button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
                                            <div className="p-2 bg-white rounded-lg border border-gray-200">
                                                {savedAddresses.find(a => a._id === selectedAddressId)?.label === 'Work' ? <Briefcase size={16} /> : <Home size={16} />}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-gray-900">{savedAddresses.find(a => a._id === selectedAddressId)?.fullName}</p>
                                                <p className="text-xs text-gray-500 mt-1">{savedAddresses.find(a => a._id === selectedAddressId)?.address}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </section>

                            {/* Payment Method */}
                            <section className={cn(
                                "bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden transition-all",
                                step === 1 ? "opacity-50 pointer-events-none" : "opacity-100"
                            )}>
                                <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
                                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                        <CreditCard size={18} />
                                    </div>
                                    <h2 className="font-bold text-gray-900">Payment Method</h2>
                                </div>

                                <div className="p-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                                        {[
                                            { id: 'upi', label: 'UPI Payment', icon: Smartphone, color: 'text-green-600', bg: 'bg-green-50' },
                                            { id: 'card', label: 'Credit / Debit Card', icon: CreditCard, color: 'text-blue-600', bg: 'bg-blue-50' },
                                            { id: 'wallet', label: 'Wallet', icon: Wallet, color: 'text-amber-600', bg: 'bg-amber-50' },
                                            { id: 'cod', label: 'Cash on Delivery', icon: Truck, color: 'text-purple-600', bg: 'bg-purple-50' }
                                        ].map(m => (
                                            <div
                                                key={m.id}
                                                onClick={() => setPaymentMethod(m.id as any)}
                                                className={cn(
                                                    "p-4 rounded-xl border-2 flex items-center gap-4 cursor-pointer transition-all relative",
                                                    paymentMethod === m.id ? "border-orange-500 bg-orange-50/30" : "border-gray-50 bg-gray-50/50 hover:border-gray-200"
                                                )}
                                            >
                                                <div className={cn("p-2 rounded-lg", m.bg, m.color)}>
                                                    <m.icon size={20} />
                                                </div>
                                                <span className="text-sm font-bold text-gray-900">{m.label}</span>
                                                {paymentMethod === m.id && <div className="absolute right-4 w-2 h-2 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.6)]" />}
                                            </div>
                                        ))}
                                    </div>

                                    <div className="border-t border-gray-100 pt-6">
                                        <button
                                            onClick={handlePlaceOrder}
                                            disabled={isProcessing}
                                            className="w-full bg-slate-900 text-white font-bold py-5 rounded-2xl hover:bg-slate-800 disabled:opacity-50 transition-all flex items-center justify-center gap-3 shadow-lg shadow-slate-200"
                                        >
                                            {isProcessing ? (
                                                <Loader2 size={20} className="animate-spin" />
                                            ) : (
                                                <Lock size={18} className="opacity-50" />
                                            )}
                                            <span>{paymentMethod === 'cod' ? 'Confirm Order' : `Pay ₹${totalPrice.toLocaleString()}`}</span>
                                        </button>
                                        <div className="mt-4 flex items-center justify-center gap-2 text-gray-400">
                                            <ShieldCheck size={14} />
                                            <span className="text-[10px] font-bold uppercase tracking-widest leading-none">100% Secure Payment Powered by Razorpay</span>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        </div>

                        {/* Order Summary */}
                        <div className="lg:col-span-4 lg:sticky lg:top-24">
                            <aside className="bg-slate-900 rounded-2xl shadow-xl overflow-hidden text-white">
                                <div className="p-6 border-b border-white/10">
                                    <h3 className="font-bold text-lg">Order Summary</h3>
                                </div>
                                <div className="p-6">
                                    <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                        {cart.map(item => (
                                            <div key={item.id} className="flex gap-4">
                                                <div className="w-16 h-16 bg-white rounded-xl p-2 flex-shrink-0">
                                                    <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-bold truncate leading-tight">{item.name}</p>
                                                    <div className="flex items-center justify-between mt-1">
                                                        <span className="text-xs text-white/50">Qty: {item.quantity}</span>
                                                        <span className="text-xs font-bold text-orange-400">₹{(item.price * item.quantity).toLocaleString()}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="mt-8 pt-6 border-t border-white/10 space-y-3">
                                        <div className="flex justify-between text-xs text-white/50">
                                            <span>Subtotal</span>
                                            <span className="text-white">₹{totalPrice.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between text-xs text-white/50">
                                            <span>Delivery</span>
                                            <span className="text-green-400 font-bold uppercase tracking-wider">Free</span>
                                        </div>
                                        <div className="flex justify-between text-xs text-white/50">
                                            <span>GST (Included)</span>
                                            <span className="text-white">₹0</span>
                                        </div>
                                        <div className="flex justify-between items-end pt-4 border-t border-white/10">
                                            <div>
                                                <p className="text-[10px] uppercase font-bold text-white/40 tracking-widest">Total Payable</p>
                                                <p className="text-3xl font-black text-orange-500 tracking-tighter">₹{totalPrice.toLocaleString()}</p>
                                            </div>
                                            <div className="p-2 bg-orange-500/10 rounded-lg">
                                                <Truck size={20} className="text-orange-500" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-white/5 p-4 flex items-center justify-center gap-2">
                                    <CheckCircle2 size={14} className="text-orange-500" />
                                    <span className="text-[10px] font-bold uppercase tracking-widest">Genuine Parts Guranteed</span>
                                </div>
                            </aside>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}

function SimpleInput({ label, value, onChange, placeholder, type = "text" }: any) {
    return (
        <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-gray-500 ml-1">{label}</label>
            <input
                type={type}
                value={value}
                onChange={e => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all placeholder:text-gray-300 font-medium"
            />
        </div>
    );
}
