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
        <div className="min-h-screen bg-background flex flex-col font-sans selection:bg-primary selection:text-white">
            <Navbar />

            <main className="flex-1 pt-32 pb-24 md:pt-40">
                <div className="container px-6">
                    {/* PAGE HEADER */}
                    <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-16">
                        <div className="animate-in fade-in slide-in-from-left duration-700">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-6 group">
                                <ShieldCheck size={12} className="text-primary" />
                                <span className="text-[10px] uppercase font-black tracking-[0.2em] text-primary">Secure Checkout</span>
                            </div>
                            <h1 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter leading-[0.8] m-0">
                                Simple <span className="text-primary drop-shadow-[0_0_15px_rgba(255,140,0,0.3)]">Checkout</span>
                            </h1>
                            <p className="mt-6 text-lg text-muted font-medium max-w-xl border-l-2 border-primary/30 pl-6">
                                Complete your order securely and verify your shipping details.
                            </p>
                        </div>

                        {/* STEPS INDICATOR */}
                        <div className="flex items-center gap-3 animate-in fade-in slide-in-from-right duration-700">
                            {[
                                { n: 1, label: 'Shipping', icon: MapPin },
                                { n: 2, label: 'Payment', icon: CreditCard }
                            ].map((s) => (
                                <div key={s.n} className="flex items-center gap-3">
                                    <div className={cn(
                                        "flex items-center gap-3 pl-2 pr-6 py-2 rounded-2xl border transition-all duration-500",
                                        step >= s.n
                                            ? "bg-primary border-primary text-white shadow-xl shadow-primary/20"
                                            : "bg-surface border-border text-muted"
                                    )}>
                                        <div className={cn(
                                            "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                                            step >= s.n ? "bg-white/20" : "bg-black/5"
                                        )}>
                                            <s.icon size={18} />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[8px] uppercase font-black tracking-widest opacity-60">Step 0{s.n}</span>
                                            <span className="text-xs font-black uppercase italic tracking-wider">{s.label}</span>
                                        </div>
                                    </div>
                                    {s.n < 2 && <ChevronRight size={16} className="text-muted/30" />}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 xl:gap-20 items-start">
                        {/* LEFT SECTION: CONTENT */}
                        <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-10">

                            {/* STEP 1: ADDRESS */}
                            <div className={cn(
                                "glass-panel p-8 md:p-12 rounded-[2.5rem] transition-all duration-700 overflow-hidden relative group",
                                step === 1 ? "ring-2 ring-primary/20 shadow-2xl scale-[1.01]" : "opacity-40 grayscale-[0.5]"
                            )}>
                                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[80px] -mr-32 -mt-32 pointer-events-none group-hover:bg-primary/10 transition-colors" />

                                <div className="flex items-center justify-between mb-12">
                                    <div className="flex items-center gap-5">
                                        <div className="w-1.5 h-10 bg-primary rounded-full shadow-[0_0_15px_rgba(255,140,0,0.5)]" />
                                        <h2 className="text-2xl md:text-3xl font-black italic uppercase tracking-tight">01. Shipping Address</h2>
                                    </div>
                                    {step > 1 && (
                                        <button
                                            onClick={() => setStep(1)}
                                            className="px-6 py-2 rounded-xl bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all active:scale-95"
                                        >
                                            Change Address
                                        </button>
                                    )}
                                </div>

                                {step === 1 && (
                                    <div className="animate-in fade-in slide-in-from-bottom duration-500">
                                        {!isAddingAddress && savedAddresses.length > 0 ? (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                {savedAddresses.map((addr) => (
                                                    <div
                                                        key={addr._id}
                                                        onClick={() => setSelectedAddressId(addr._id)}
                                                        className={cn(
                                                            "relative p-8 rounded-3xl border-2 transition-all cursor-pointer group/addr overflow-hidden",
                                                            selectedAddressId === addr._id
                                                                ? "bg-primary/5 border-primary shadow-xl shadow-primary/10"
                                                                : "bg-background/20 border-border hover:border-primary/40"
                                                        )}
                                                    >
                                                        <div className="flex justify-between items-start mb-6">
                                                            <div className={cn(
                                                                "p-3 rounded-2xl transition-colors",
                                                                selectedAddressId === addr._id ? "bg-primary text-white" : "bg-muted/10 text-muted"
                                                            )}>
                                                                {addr.label === 'Work' ? <Briefcase size={20} /> : <Home size={20} />}
                                                            </div>
                                                            {selectedAddressId === addr._id && (
                                                                <div className="animate-in zoom-in duration-300">
                                                                    <CheckCircle2 size={24} className="text-primary fill-primary/10" />
                                                                </div>
                                                            )}
                                                        </div>
                                                        <h3 className="text-lg font-black uppercase italic mb-2 tracking-tight">{addr.label}</h3>
                                                        <p className="text-sm text-muted font-medium leading-relaxed truncate-3-lines">{addr.address}</p>
                                                        <div className="mt-6 flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-muted/60">
                                                            <span>{addr.phone || 'No phone number'}</span>
                                                        </div>
                                                    </div>
                                                ))}

                                                <button
                                                    onClick={() => setIsAddingAddress(true)}
                                                    className="flex flex-col items-center justify-center p-8 rounded-3xl border-2 border-dashed border-border hover:border-primary/40 hover:bg-primary/5 transition-all group gap-4 min-h-[180px]"
                                                >
                                                    <div className="w-12 h-12 rounded-full border-2 border-dashed border-muted/30 flex items-center justify-center text-muted group-hover:scale-110 group-hover:text-primary group-hover:border-primary transition-all">
                                                        <Plus size={24} />
                                                    </div>
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-muted group-hover:text-primary">Add New Address</span>
                                                </button>

                                                <button
                                                    className="md:col-span-2 btn-primary-gradient w-full py-6 rounded-2xl text-[13px] font-black tracking-[0.2em] uppercase italic flex items-center justify-center gap-4 mt-8"
                                                    onClick={() => setStep(2)}
                                                >
                                                    Continue to Payment
                                                    <ChevronRight size={18} />
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="animate-in fade-in slide-in-from-bottom duration-500">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                                                    <PremiumInput label="Full Name" value={newAddress.fullName} onChange={(v: string) => setNewAddress({ ...newAddress, fullName: v })} placeholder="Enter full name" />
                                                    <PremiumInput label="Phone Number" value={newAddress.phone} onChange={(v: string) => setNewAddress({ ...newAddress, phone: v })} placeholder="Enter phone number" type="tel" />
                                                    <div className="md:col-span-2">
                                                        <PremiumInput label="Address Line 1" value={newAddress.addressLine1} onChange={(v: string) => setNewAddress({ ...newAddress, addressLine1: v })} placeholder="Street address, P.O. box, company name" />
                                                    </div>
                                                    <div className="md:col-span-2">
                                                        <PremiumInput label="Address Line 2 (Optional)" value={newAddress.addressLine2} onChange={(v: string) => setNewAddress({ ...newAddress, addressLine2: v })} placeholder="Apartment, suite, unit, building, floor, etc." />
                                                    </div>
                                                    <PremiumInput label="Pincode" value={newAddress.zipCode} onChange={(v: string) => setNewAddress({ ...newAddress, zipCode: v })} placeholder="Enter pincode" />
                                                    <PremiumInput label="City" value={newAddress.city} onChange={(v: string) => setNewAddress({ ...newAddress, city: v })} placeholder="Enter city" />
                                                </div>

                                                <div className="flex flex-col sm:flex-row items-center gap-6 pt-4 border-t border-border/50">
                                                    <div className="flex overflow-hidden rounded-2xl border border-border bg-muted/5 p-1 w-full sm:w-auto">
                                                        {['Home', 'Work'].map(type => (
                                                            <button
                                                                key={type}
                                                                onClick={() => setNewAddress({ ...newAddress, label: type })}
                                                                className={cn(
                                                                    "px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                                                    newAddress.label === type ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-muted hover:text-foreground"
                                                                )}
                                                            >
                                                                {type}
                                                            </button>
                                                        ))}
                                                    </div>

                                                    <div className="flex-1 flex gap-4 w-full">
                                                        <button
                                                            className="flex-1 btn-primary-gradient py-4 rounded-xl text-[10px] uppercase font-black tracking-widest"
                                                            onClick={handleAddAddress}
                                                        >
                                                            Save Address
                                                        </button>
                                                        {savedAddresses.length > 0 && (
                                                            <button
                                                                onClick={() => setIsAddingAddress(false)}
                                                                className="px-8 py-4 rounded-xl border border-border text-[10px] uppercase font-black tracking-widest text-muted hover:bg-muted/10 transition-colors"
                                                            >
                                                                Cancel
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* STEP 2: PAYMENT */}
                            <div className={cn(
                                "glass-panel p-8 md:p-12 rounded-[2.5rem] transition-all duration-700 overflow-hidden relative group",
                                step === 2 ? "ring-2 ring-primary/20 shadow-2xl scale-[1.01]" : "opacity-40 grayscale-[0.5]"
                            )}>
                                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[80px] -mr-32 -mt-32 pointer-events-none group-hover:bg-indigo-500/10 transition-colors" />

                                <div className="flex items-center gap-5 mb-12">
                                    <div className="w-1.5 h-10 bg-indigo-500 rounded-full shadow-[0_0_15px_rgba(99,102,241,0.5)]" />
                                    <h2 className="text-2xl md:text-3xl font-black italic uppercase tracking-tight">02. Payment Method</h2>
                                </div>

                                {step === 2 && (
                                    <div className="animate-in fade-in slide-in-from-bottom duration-500 flex flex-col gap-6">
                                        {[
                                            { id: 'upi', label: 'UPI Payment', icon: Smartphone, color: 'text-green-500', bg: 'bg-green-500/10' },
                                            { id: 'card', label: 'Credit / Debit Card', icon: CreditCard, color: 'text-blue-500', bg: 'bg-blue-500/10' },
                                            { id: 'wallet', label: 'Wallet', icon: Wallet, color: 'text-amber-500', bg: 'bg-amber-500/10' },
                                            { id: 'cod', label: 'Cash on Delivery', icon: Truck, color: 'text-purple-500', bg: 'bg-purple-500/10' }
                                        ].map(method => (
                                            <div
                                                key={method.id}
                                                onClick={() => setPaymentMethod(method.id as any)}
                                                className={cn(
                                                    "p-6 md:p-8 rounded-3xl border-2 transition-all cursor-pointer flex items-center gap-6 overflow-hidden relative group/pay",
                                                    paymentMethod === method.id
                                                        ? "border-primary bg-primary/5 shadow-xl shadow-primary/10"
                                                        : "border-border bg-background/20 hover:border-primary/30"
                                                )}
                                            >
                                                <div className={cn(
                                                    "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                                                    paymentMethod === method.id ? "border-primary bg-primary" : "border-border"
                                                )}>
                                                    {paymentMethod === method.id && <div className="w-2.5 h-2.5 rounded-full bg-white shadow-sm" />}
                                                </div>

                                                <div className={cn("p-4 rounded-2xl", method.bg, method.color)}>
                                                    <method.icon size={24} />
                                                </div>

                                                <div className="flex flex-col flex-1">
                                                    <span className="text-xs font-black uppercase tracking-widest text-muted opacity-60 mb-0.5">Select</span>
                                                    <span className="text-base font-black uppercase italic tracking-wider">{method.label}</span>
                                                </div>

                                                {paymentMethod === method.id && (
                                                    <div className="absolute right-8 animate-in slide-in-from-right duration-300">
                                                        <CheckCircle2 size={24} className="text-primary opacity-50" />
                                                    </div>
                                                )}
                                            </div>
                                        ))}

                                        <div className="pt-8 mt-4 border-t border-border/50">
                                            <button
                                                className={cn(
                                                    "w-full btn-primary-gradient py-8 rounded-[1.5rem] text-[15px] font-black uppercase italic tracking-[0.3em] flex items-center justify-center gap-6 shadow-2xl shadow-primary/40 relative overflow-hidden transition-all",
                                                    isProcessing && "opacity-80 scale-[0.98]"
                                                )}
                                                onClick={handlePlaceOrder}
                                                disabled={isProcessing}
                                            >
                                                {isProcessing ? (
                                                    <>
                                                        <Loader2 className="animate-spin" size={24} />
                                                        <span className="animate-pulse">Processing...</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Lock size={20} className="text-white/40" />
                                                        {paymentMethod === 'cod' ? 'Place Order' : `Pay ₹${totalPrice.toLocaleString()}`}
                                                        <ArrowLeft className="rotate-180 opacity-50" size={20} />
                                                    </>
                                                )}

                                                {/* Button background animation */}
                                                {!isProcessing && (
                                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full hover:animate-[shimmer_2s_infinite] pointer-events-none" />
                                                )}
                                            </button>

                                            <p className="text-center mt-6 text-[9px] font-black uppercase tracking-[0.2em] text-muted opacity-40">
                                                All payments are processed securely.
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* RIGHT SECTION: SUMMARY */}
                        <div className="lg:col-span-5 xl:col-span-4 sticky top-32 lg:top-40 flex flex-col gap-10">
                            <div className="glass-panel p-8 md:p-10 rounded-[2.5rem] shadow-2xl shadow-black/5 relative overflow-hidden border-2 border-primary/5">
                                <div className="absolute bottom-0 right-0 w-full h-1 bg-gradient-to-r from-primary/10 via-primary to-primary/10 opacity-30" />

                                <h3 className="text-2xl font-black italic uppercase tracking-tight mb-8">Order Summary</h3>

                                <div className="flex flex-col gap-6 max-h-[40vh] overflow-y-auto pr-4 hide-scrollbar">
                                    {cart.map((item: any) => (
                                        <div key={item.id} className="flex gap-5 items-center group/item">
                                            <div className="w-20 h-20 rounded-2xl bg-muted/5 border border-border p-2 overflow-hidden transition-transform group-hover/item:scale-105 duration-300 flex-shrink-0">
                                                <img src={item.image} alt={item.name} className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal" />
                                            </div>
                                            <div className="flex flex-col flex-1">
                                                <h4 className="text-[11px] font-black uppercase tracking-wider text-muted mb-1 opacity-70">Item #{item.id.slice(-4).toUpperCase()}</h4>
                                                <p className="text-sm font-black uppercase italic tracking-tight line-clamp-1">{item.name}</p>
                                                <div className="flex items-center justify-between mt-2">
                                                    <span className="text-[10px] font-black px-2 py-0.5 bg-muted/10 rounded-md uppercase">Qty: {item.quantity}</span>
                                                    <span className="text-sm font-black text-primary">₹{(item.price * item.quantity).toLocaleString()}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-10 pt-8 border-t border-dashed border-border flex flex-col gap-4">
                                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-muted">
                                        <span>Delivery Fee</span>
                                        <span className="text-green-500">FREE</span>
                                    </div>
                                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-muted">
                                        <span>Tax (GST)</span>
                                        <span>INCLUDED</span>
                                    </div>

                                    <div className="flex justify-between items-end mt-4 pt-6 border-t border-border">
                                        <div className="flex flex-col">
                                            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-muted opacity-60">Total Amount</span>
                                            <span className="text-3xl font-black italic tracking-tighter uppercase drop-shadow-[0_0_10px_rgba(255,140,0,0.1)]">₹{totalPrice.toLocaleString()}</span>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <span className="text-[8px] font-bold text-muted bg-muted/5 px-2 py-1 rounded-md uppercase tracking-tight italic">Order ID: #{Math.random().toString(36).slice(2, 8).toUpperCase()}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-8 flex items-center justify-center gap-4 py-4 px-6 rounded-2xl bg-green-500/5 border border-green-500/10 opacity-70">
                                    <ShieldCheck size={16} className="text-green-500" />
                                    <span className="text-[9px] font-black uppercase tracking-widest text-green-600">Secure Payment</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}

function PremiumInput({ label, value, onChange, placeholder, type = "text" }: any) {
    return (
        <div className="flex flex-col gap-3 group">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted opacity-60 ml-2 group-focus-within:text-primary transition-colors">{label}</label>
            <input
                type={type}
                value={value}
                onChange={e => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full bg-muted/5 border border-border rounded-2xl px-6 py-4 text-sm font-black italic placeholder:opacity-30 placeholder:uppercase outline-none focus:border-primary/50 focus:bg-background transition-all"
            />
        </div>
    );
}
