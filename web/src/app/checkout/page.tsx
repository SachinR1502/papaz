'use client';
import { useCart } from '@/context/CartContext';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

import { toast } from 'sonner';

declare global {
    interface Window {
        Razorpay: any;
    }
}

const loadRazorpay = () => {
    return new Promise((resolve) => {
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
    // removed useRazorpay hook
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
                // @ts-ignore
                fullName: user.profile?.fullName || user.role || '',
                // @ts-ignore
                phone: user.phoneNumber || ''
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
            toast.error('Protocol violation: All required fields must be populated');
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
                    toast.success('Location protocol synchronized');
                }
            } else {
                toast.error('Synchronization failed');
            }
        } catch (error) {
            console.error(error);
            toast.error('Network integrity compromised');
        }
    };

    const handlePlaceOrder = async () => {
        if (!token) {
            toast.error('Authorization required');
            return router.push('/login');
        }

        if (!selectedAddressId) {
            toast.error('Destination required');
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
                    // @ts-ignore
                    supplierId: item.supplierId
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
                throw new Error(errorData.message || 'Transmission failed');
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
                    toast.error('Wallet balance insufficient');
                }
            } else {
                // Razorpay Flow
                await handleRazorpayPayment(orderData._id, orderData.orderId, totalPrice, deliveryAddress);
            }

        } catch (error) {
            console.error(error);
            toast.error('Order sequence failed');
            setIsProcessing(false);
        }
    };

    const handleRazorpayPayment = async (mongoOrderId: string, orderNumber: string, amount: number, address: any) => {
        // Load Script Manually
        const isLoaded = await loadRazorpay();
        if (!isLoaded) {
            toast.error('Razorpay SDK failed to load. Check your internet connection.');
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
                throw new Error(errorData.message || 'Payment initiation failed');
            }

            const paymentData = await paymentRes.json();

            console.log("Razorpay Init Data:", {
                key: paymentData.keyId,
                order_id: paymentData.orderId,
                amount: paymentData.amount
            });

            if (!paymentData.keyId || !paymentData.orderId) {
                toast.error('Invalid payment configuration');
                setIsProcessing(false);
                return;
            }

            const options: any = {
                key: paymentData.keyId,
                amount: paymentData.amount,
                currency: "INR",
                name: "Papaz Platform",
                description: `Order Payment #${orderNumber}`,
                image: typeof window !== 'undefined' ? `${window.location.origin}/icon.png` : undefined,
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
                        toast.error('Verification timeout');
                        setIsProcessing(false);
                    }
                },
                prefill: {
                    name: address?.fullName || user?.profile?.fullName || '',
                    contact: (address?.phone || user?.phoneNumber || '').replace(/^\+91/, '') ? `+91${(address?.phone || user?.phoneNumber || '').replace(/^\+91/, '')}` : '',
                    email: user?.email || '',
                    // method: paymentMethod === 'upi' ? 'upi' : (paymentMethod === 'card' ? 'card' : undefined)
                    method: {
                        upi: true,
                        card: true,
                        netbanking: true,
                        wallet: true,
                        emi: true
                    }
                },
                notes: {
                    address: address?.address || ''
                },
                theme: {
                    color: "#FF8C00"
                },
                modal: {
                    ondismiss: function () {
                        setIsProcessing(false);
                        toast('Payment cancelled');
                    }
                }
            };

            if (!window.Razorpay) {
                toast.error("Payment gateway not ready");
                setIsProcessing(false);
                return;
            }

            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', function (response: any) {
                console.error("Payment Failed:", response);
                setIsProcessing(false);
                toast.error(response.error.description || 'Payment Failed');
            });
            rzp.open();

        } catch (error: any) {
            console.error(error);
            toast.error(error.message || 'Payment gateway unreachable');
            setIsProcessing(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-body)' }}>
            <Navbar />

            <main style={{ flex: 1, paddingTop: '120px', paddingBottom: '80px' }}>
                <div className="container" style={{ padding: '0 24px' }}>
                    <div style={{ marginBottom: '48px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '20px' }}>
                        <div>
                            <h1 style={{ fontSize: 'clamp(2.4rem, 6vw, 3.8rem)', fontWeight: 900, letterSpacing: '-2px', margin: 0, lineHeight: 1 }}>
                                Secure <span style={{ color: 'var(--color-primary)' }}>Checkout</span>
                            </h1>
                            <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', marginTop: '12px', fontWeight: 500 }}>
                                Complete your order securely.
                            </p>
                        </div>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            {[1, 2].map(num => (
                                <div key={num} style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '12px',
                                    background: step >= num ? 'var(--color-primary)' : 'var(--bg-card)',
                                    color: step >= num ? 'white' : 'var(--text-muted)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: 800,
                                    border: '1px solid var(--border-color)',
                                    transition: 'all 0.3s'
                                }}>{num}</div>
                            ))}
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.6fr) 1fr', gap: '48px' }} className="checkout-grid">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            <div className="glass-panel" style={{
                                padding: '40px',
                                borderRadius: '40px',
                                background: step === 1 ? 'var(--bg-card)' : 'rgba(255,255,255,0.02)',
                                border: '1px solid var(--border-color)',
                                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                opacity: step === 1 ? 1 : 0.6
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                                    <h2 style={{ fontSize: '1.8rem', fontWeight: 900, margin: 0, letterSpacing: '-0.5px' }}>1. Shipping Address</h2>
                                    {step > 1 && (
                                        <button onClick={() => setStep(1)} style={{
                                            background: 'rgba(255,140,0,0.1)',
                                            color: 'var(--color-primary)',
                                            border: 'none',
                                            padding: '8px 20px',
                                            borderRadius: '12px',
                                            fontWeight: 800,
                                            cursor: 'pointer'
                                        }}>Edit</button>
                                    )}
                                </div>

                                {step === 1 && (
                                    <div className="animate-fade-in">
                                        {!isAddingAddress && savedAddresses.length > 0 ? (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                                {savedAddresses.map((addr) => (
                                                    <div
                                                        key={addr._id}
                                                        onClick={() => setSelectedAddressId(addr._id)}
                                                        className={`address-option ${selectedAddressId === addr._id ? 'active' : ''}`}
                                                        style={{
                                                            padding: '24px',
                                                            borderRadius: '24px',
                                                            border: '1px solid var(--border-color)',
                                                            cursor: 'pointer',
                                                            transition: 'all 0.3s',
                                                            background: selectedAddressId === addr._id ? 'rgba(255,140,0,0.05)' : 'var(--bg-body)'
                                                        }}
                                                    >
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                                                            <span style={{ fontWeight: 900, fontSize: '1.1rem', letterSpacing: '-0.2px' }}>
                                                                {addr.label}
                                                            </span>
                                                            {selectedAddressId === addr._id && <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.7rem' }}>✓</div>}
                                                        </div>
                                                        <p style={{ margin: 0, color: 'var(--text-muted)', fontWeight: 500, lineHeight: 1.5 }}>{addr.address}</p>
                                                    </div>
                                                ))}

                                                <button onClick={() => setIsAddingAddress(true)} style={{
                                                    padding: '20px',
                                                    borderRadius: '24px',
                                                    border: '2px dashed var(--border-color)',
                                                    background: 'transparent',
                                                    color: 'var(--text-muted)',
                                                    fontWeight: 800,
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s',
                                                    fontSize: '1rem'
                                                }}>+ Add New Address</button>

                                                <button className="btn btn-primary" onClick={() => setStep(2)} style={{ padding: '20px', borderRadius: '18px', fontWeight: 900, marginTop: '16px', fontSize: '1.1rem' }}>
                                                    Continue to Payment
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="animate-fade-in">
                                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '20px' }}>
                                                    <div className="input-group">
                                                        <label className="premium-label">Full Name</label>
                                                        <input type="text" style={premiumInputStyle} value={newAddress.fullName} onChange={e => setNewAddress({ ...newAddress, fullName: e.target.value })} />
                                                    </div>
                                                    <div className="input-group">
                                                        <label className="premium-label">Mobile</label>
                                                        <input type="tel" style={premiumInputStyle} value={newAddress.phone} onChange={e => setNewAddress({ ...newAddress, phone: e.target.value })} />
                                                    </div>
                                                </div>
                                                <div className="input-group" style={{ marginBottom: '20px' }}>
                                                    <label className="premium-label">Address Line 1</label>
                                                    <input type="text" style={premiumInputStyle} value={newAddress.addressLine1} onChange={e => setNewAddress({ ...newAddress, addressLine1: e.target.value })} />
                                                </div>
                                                <div className="input-group" style={{ marginBottom: '20px' }}>
                                                    <label className="premium-label">Landmark / Area</label>
                                                    <input type="text" style={premiumInputStyle} value={newAddress.addressLine2} onChange={e => setNewAddress({ ...newAddress, addressLine2: e.target.value })} />
                                                </div>
                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '32px' }}>
                                                    <div className="input-group">
                                                        <label className="premium-label">Pincode</label>
                                                        <input type="text" style={premiumInputStyle} value={newAddress.zipCode} onChange={e => setNewAddress({ ...newAddress, zipCode: e.target.value })} />
                                                    </div>
                                                    <div className="input-group">
                                                        <label className="premium-label">City</label>
                                                        <input type="text" style={premiumInputStyle} value={newAddress.city} onChange={e => setNewAddress({ ...newAddress, city: e.target.value })} />
                                                    </div>
                                                </div>

                                                <div style={{ display: 'flex', gap: '12px', marginBottom: '32px' }}>
                                                    {['Home', 'Work'].map(type => (
                                                        <button key={type} onClick={() => setNewAddress({ ...newAddress, label: type })} style={{
                                                            padding: '12px 24px',
                                                            borderRadius: '100px',
                                                            border: `1px solid ${newAddress.label === type ? 'var(--color-primary)' : 'var(--border-color)'}`,
                                                            background: newAddress.label === type ? 'var(--color-primary)' : 'transparent',
                                                            color: newAddress.label === type ? 'white' : 'var(--text-body)',
                                                            fontWeight: 800,
                                                            cursor: 'pointer'
                                                        }}>{type}</button>
                                                    ))}
                                                </div>

                                                <div style={{ display: 'flex', gap: '16px' }}>
                                                    <button className="btn btn-primary" onClick={handleAddAddress} style={{ flex: 1, padding: '18px', borderRadius: '16px', fontWeight: 900 }}>Save Address</button>
                                                    {savedAddresses.length > 0 && <button onClick={() => setIsAddingAddress(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontWeight: 700, cursor: 'pointer' }}>Cancel</button>}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="glass-panel" style={{
                                padding: '40px',
                                borderRadius: '40px',
                                background: step === 2 ? 'var(--bg-card)' : 'rgba(255,255,255,0.02)',
                                border: '1px solid var(--border-color)',
                                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                opacity: step === 2 ? 1 : 0.6
                            }}>
                                <h2 style={{ fontSize: '1.8rem', fontWeight: 900, marginBottom: '32px', letterSpacing: '-0.5px' }}>2. Payment Method</h2>

                                {step === 2 && (
                                    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                        {[
                                            { id: 'upi', label: 'UPI', icon: '📱' },
                                            { id: 'card', label: 'Credit / Debit Card', icon: '💳' },
                                            { id: 'wallet', label: 'Wallet', icon: '👛' },
                                            { id: 'cod', label: 'Cash on Delivery', icon: '💵' }
                                        ].map(method => (
                                            <div
                                                key={method.id}
                                                className={`payment-option ${paymentMethod === method.id ? 'active' : ''}`}
                                                onClick={() => setPaymentMethod(method.id as any)}
                                                style={{
                                                    padding: '24px',
                                                    borderRadius: '24px',
                                                    border: '1px solid var(--border-color)',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.3s',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '20px',
                                                    background: paymentMethod === method.id ? 'rgba(255,140,0,0.05)' : 'var(--bg-body)'
                                                }}
                                            >
                                                <div style={{ width: '24px', height: '24px', borderRadius: '50%', border: '2px solid var(--border-color)', background: paymentMethod === method.id ? 'var(--color-primary)' : 'transparent', borderColor: paymentMethod === method.id ? 'var(--color-primary)' : 'var(--border-color)' }}></div>
                                                <span style={{ fontSize: '1.8rem' }}>{method.icon}</span>
                                                <span style={{ fontWeight: 800, fontSize: '1.1rem', flex: 1 }}>{method.label}</span>
                                            </div>
                                        ))}

                                        <button
                                            className="btn btn-primary"
                                            style={{
                                                marginTop: '24px',
                                                padding: '24px',
                                                borderRadius: '20px',
                                                fontWeight: 900,
                                                fontSize: '1.2rem',
                                                boxShadow: '0 10px 30px rgba(255,140,0,0.2)',
                                                opacity: isProcessing ? 0.7 : 1,
                                                cursor: isProcessing ? 'not-allowed' : 'pointer'
                                            }}
                                            onClick={handlePlaceOrder}
                                            disabled={isProcessing}
                                        >
                                            {isProcessing ? 'Processing Payment...' : (paymentMethod === 'cod' ? 'Place Order' : `Pay ₹${totalPrice.toLocaleString()}`)}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div>
                            <div className="glass-panel" style={{
                                padding: '40px',
                                position: 'sticky',
                                top: '120px',
                                background: 'var(--bg-card)',
                                border: '1px solid var(--border-color)',
                                borderRadius: '40px',
                                boxShadow: '0 40px 100px rgba(0,0,0,0.1)'
                            }}>
                                <h3 style={{ fontSize: '1.6rem', fontWeight: 900, marginBottom: '32px', letterSpacing: '-1px' }}>Order Summary</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                    {cart.map((item: any) => (
                                        <div key={item.id} style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                                            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--bg-body)', position: 'relative', overflow: 'hidden' }}>
                                                <img src={item.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <p style={{ margin: 0, fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-body)' }}>{item.name}</p>
                                                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>{item.quantity} unit{item.quantity > 1 ? 's' : ''}</p>
                                            </div>
                                            <span style={{ fontWeight: 800, fontSize: '0.95rem' }}>₹{(item.price * item.quantity).toLocaleString()}</span>
                                        </div>
                                    ))}
                                    <div style={{ height: '1px', background: 'var(--border-color)', margin: '12px 0' }} />
                                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontWeight: 700 }}>
                                        <span>Shipping</span>
                                        <span style={{ color: 'var(--status-success)' }}>FREE</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.8rem', fontWeight: 900, marginTop: '20px' }}>
                                        <span>Total</span>
                                        <span style={{ color: 'var(--color-primary)' }}>₹{totalPrice.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />

            <style jsx>{`
                .address-option.active, .payment-option.active {
                    border-color: var(--color-primary) !important;
                    transform: translateX(4px);
                }
                .premium-label {
                    display: block;
                    margin-bottom: 10px;
                    font-weight: 800;
                    font-size: 0.85rem;
                    text-transform: uppercase;
                    letter-spacing: 1.5px;
                    color: var(--text-muted);
                }
                @media (max-width: 992px) {
                    .checkout-grid {
                        grid-template-columns: 1fr !important;
                    }
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in {
                    animation: fadeIn 0.4s ease forwards;
                }
            `}</style>
        </div>
    );
}

const premiumInputStyle = {
    width: '100%',
    padding: '18px 24px',
    borderRadius: '18px',
    border: '1px solid var(--border-color)',
    background: 'var(--bg-body)',
    color: 'var(--text-body)',
    fontSize: '1.1rem',
    fontWeight: 600,
    outline: 'none',
    transition: 'all 0.3s'
};
