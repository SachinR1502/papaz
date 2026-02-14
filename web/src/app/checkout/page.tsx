'use client';
import { useCart } from '@/context/CartContext';
import Navbar from '@/components/layout/Navbar';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useRazorpay } from 'react-razorpay';
import { toast } from 'sonner';

export default function CheckoutPage() {
    const { cart, totalPrice, clearCart } = useCart();
    const { user, token } = useAuth();
    const router = useRouter();
    const { Razorpay } = useRazorpay();
    const [step, setStep] = useState(1);

    // Payment Method Options
    const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'cod' | 'wallet'>('upi');

    // Address State
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

    // Initialize form with user data when available
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

    // Fetch Addresses
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
                console.log('Fetch Addresses Response:', responseData);
                const data = responseData.data || responseData;

                if (Array.isArray(data)) {
                    setSavedAddresses(data);
                    if (data.length > 0) {
                        setSelectedAddressId(data[0]._id);
                    } else {
                        setIsAddingAddress(true);
                    }
                } else {
                    console.error('Invalid address format received');
                    setSavedAddresses([]);
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
                console.log('Add Address Response:', responseData);

                // Handle ApiResponse structure (success, data) or direct array
                const addresses = responseData.data || responseData;

                if (Array.isArray(addresses)) {
                    setSavedAddresses(addresses);
                    if (addresses.length > 0) {
                        const newAddr = addresses[addresses.length - 1];
                        setSelectedAddressId(newAddr._id);
                    }
                    setIsAddingAddress(false);
                    toast.success('Address added successfully');
                } else {
                    console.error('Unexpected address response format:', addresses);
                    toast.error('Received invalid data from server');
                }
            } else {
                toast.error('Failed to add address');
            }
        } catch (error) {
            console.error(error);
            toast.error('Error adding address');
        }
    };

    const handlePlaceOrder = async () => {
        if (!token) {
            toast.error('Please login to place an order');
            return router.push('/login');
        }

        if (!selectedAddressId) {
            toast.error('Please select a delivery address');
            return;
        }

        const deliveryAddress = savedAddresses.find(addr => addr._id === selectedAddressId);

        try {
            // 1. Create Order in Backend
            const orderPayload = {
                items: cart.map(item => ({
                    id: item.id, // Backend expects 'id' for the product ID
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity,
                    image: item.image,
                    // @ts-ignore
                    supplierId: item.supplierId
                })),
                totalAmount: totalPrice,
                paymentMethod: paymentMethod === 'cod' ? 'cash' : (paymentMethod === 'upi' ? 'razorpay' : paymentMethod),
                deliveryType: 'address',
                deliveryAddressId: selectedAddressId, // Backend expects 'deliveryAddressId'
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
                console.error('Order creation failed:', errorData);
                throw new Error(errorData.message || 'Failed to create order');
            }
            const orderData = await response.json();

            // 2. Handle Payment
            if (paymentMethod === 'cod') {
                clearCart();
                router.push(`/order-success?id=${orderData.orderId}`);
            } else if (paymentMethod === 'wallet') {
                // Wallet Payment
                const payRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/customer/orders/${orderData._id}/wallet-pay`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (payRes.ok) {
                    clearCart();
                    router.push(`/order-success?id=${orderData.orderId}`);
                } else {
                    toast.error('Wallet payment failed');
                }
            } else {
                // Razorpay Payment (UPI/Card)
                await handleRazorpayPayment(orderData._id, orderData.orderId, totalPrice, deliveryAddress);
            }

        } catch (error) {
            console.error(error);
            toast.error('Something went wrong processing your order');
        }
    };

    const handleRazorpayPayment = async (mongoOrderId: string, orderNumber: string, amount: number, address: any) => {
        try {
            // Get Order ID from Razorpay via Backend
            const paymentRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/customer/orders/${mongoOrderId}/pay`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!paymentRes.ok) {
                const errorData = await paymentRes.json();
                throw new Error(errorData.message || 'Failed to initiate payment');
            }

            const paymentData = await paymentRes.json();

            const options: any = {
                key: paymentData.keyId,
                amount: paymentData.amount,
                currency: "INR",
                name: "Papaz",
                description: `Order Payment #${orderNumber}`,
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
                            const errorData = await verifyRes.json();
                            toast.error(errorData.message || 'Payment verification failed');
                        }
                    } catch (err) {
                        console.error('Verification error:', err);
                        toast.error('Payment verification failed');
                    }
                },
                prefill: {
                    name: address?.fullName || user?.profile?.fullName || '',
                    contact: address?.phone || user?.phoneNumber || '',
                    email: user?.email || ''
                },
                theme: {
                    color: "#34C759"
                },
                modal: {
                    ondismiss: function () {
                        toast.info('Payment cancelled');
                    }
                }
            };

            const rzp = new Razorpay(options);
            rzp.open();

        } catch (error: any) {
            console.error('Payment Error:', error);
            toast.error(error.message || 'Failed to initiate payment');
        }
    };

    return (
        <main style={{ minHeight: '100vh', background: 'var(--bg-body)' }}>
            <Navbar />

            <div className="container" style={{ padding: '60px 24px', maxWidth: '1000px' }}>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '40px' }}>Checkout</h1>

                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '40px' }} className="checkout-grid">

                    <div>
                        {/* Step 1: Address */}
                        <div className="glass-panel" style={{ padding: '32px', marginBottom: '24px', opacity: step === 1 ? 1 : 0.6 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                                <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>1. Delivery Address</h2>
                                {step > 1 && !isAddingAddress && savedAddresses.length > 0 && (
                                    <button
                                        onClick={() => setStep(1)}
                                        style={{ color: 'var(--color-primary)', border: 'none', background: 'transparent', cursor: 'pointer', fontWeight: 600 }}
                                    >
                                        Change
                                    </button>
                                )}
                            </div>

                            {step === 1 ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                                    {!isAddingAddress && savedAddresses.length > 0 ? (
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
                                            {savedAddresses.map((addr) => (
                                                <div
                                                    key={addr._id}
                                                    onClick={() => setSelectedAddressId(addr._id)}
                                                    style={{
                                                        padding: '16px',
                                                        borderRadius: '12px',
                                                        border: `2px solid ${selectedAddressId === addr._id ? 'var(--color-primary)' : 'var(--border-color)'}`,
                                                        background: selectedAddressId === addr._id ? 'rgba(var(--color-primary-rgb), 0.05)' : 'transparent',
                                                        cursor: 'pointer',
                                                        transition: 'all 0.2s',
                                                        position: 'relative'
                                                    }}
                                                >
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                                        <span style={{ fontWeight: 700, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                            {addr.icon === 'home' ? '🏠' : addr.icon === 'work' ? '🏢' : '📍'} {addr.label}
                                                        </span>
                                                        {selectedAddressId === addr._id && <span style={{ color: 'var(--color-primary)', fontWeight: 600 }}>✓ Selected</span>}
                                                    </div>
                                                    <p style={{ margin: 0, color: 'var(--text-muted)' }}>{addr.address}</p>
                                                    <p style={{ margin: '4px 0 0', color: 'var(--text-body)', fontWeight: 500 }}>{addr.phone}</p>
                                                </div>
                                            ))}

                                            <button
                                                onClick={() => setIsAddingAddress(true)}
                                                style={{
                                                    padding: '16px',
                                                    borderRadius: '12px',
                                                    border: '2px dashed var(--border-color)',
                                                    background: 'transparent',
                                                    color: 'var(--text-muted)',
                                                    cursor: 'pointer',
                                                    fontWeight: 600
                                                }}
                                            >
                                                + Add New Address
                                            </button>

                                            <button className="btn btn-primary" onClick={() => setStep(2)} style={{ marginTop: '16px' }}>
                                                Deliver Here
                                            </button>
                                        </div>
                                    ) : (
                                        // Add Address Form
                                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                                                <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>{savedAddresses.length === 0 ? 'Add your first address' : 'Add New Address'}</h3>
                                                {savedAddresses.length > 0 && <button onClick={() => setIsAddingAddress(false)} style={{ color: 'var(--text-muted)' }}>Cancel</button>}
                                            </div>

                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                                                <input type="text" placeholder="Full Name" style={inputStyle} value={newAddress.fullName} onChange={e => setNewAddress({ ...newAddress, fullName: e.target.value })} />
                                                <input type="tel" placeholder="Mobile Number" style={inputStyle} value={newAddress.phone} onChange={e => setNewAddress({ ...newAddress, phone: e.target.value })} />
                                            </div>

                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '20px' }}>
                                                <input type="text" placeholder="Flat, House no., Building" style={inputStyle} value={newAddress.addressLine1} onChange={e => setNewAddress({ ...newAddress, addressLine1: e.target.value })} />
                                                <input type="text" placeholder="Area, Colony, Street" style={inputStyle} value={newAddress.addressLine2} onChange={e => setNewAddress({ ...newAddress, addressLine2: e.target.value })} />
                                            </div>

                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                                                <input type="text" placeholder="Pincode" style={inputStyle} value={newAddress.zipCode} onChange={e => setNewAddress({ ...newAddress, zipCode: e.target.value })} />
                                                <input type="text" placeholder="City" style={inputStyle} value={newAddress.city} onChange={e => setNewAddress({ ...newAddress, city: e.target.value })} />
                                            </div>

                                            <div style={{ marginBottom: '24px' }}>
                                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '0.9rem' }}>Address Type</label>
                                                <div style={{ display: 'flex', gap: '12px' }}>
                                                    {['Home', 'Work', 'Other'].map(type => (
                                                        <button
                                                            key={type}
                                                            onClick={() => setNewAddress({ ...newAddress, label: type, icon: type.toLowerCase() })}
                                                            style={{
                                                                padding: '8px 16px',
                                                                borderRadius: '20px',
                                                                border: `1px solid ${newAddress.label === type ? 'var(--color-primary)' : 'var(--border-color)'}`,
                                                                background: newAddress.label === type ? 'var(--color-primary)' : 'transparent',
                                                                color: newAddress.label === type ? 'white' : 'var(--text-body)',
                                                                cursor: 'pointer',
                                                                transition: 'all 0.2s'
                                                            }}
                                                        >
                                                            {type}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            <button className="btn btn-primary" onClick={handleAddAddress} style={{ width: '100%' }}>
                                                Save & Deliver Here
                                            </button>
                                        </div>
                                    )}

                                </div>
                            ) : (
                                <div style={{ color: 'var(--text-muted)' }}>
                                    {(() => {
                                        const addr = savedAddresses.find(a => a._id === selectedAddressId);
                                        if (addr) return (
                                            <>
                                                <span style={{ fontWeight: 600, color: 'var(--text-body)' }}>{addr.label}</span> • {addr.address}
                                            </>
                                        );
                                        return 'Select an address';
                                    })()}
                                </div>
                            )}
                        </div>

                        {/* Step 2: Payment */}
                        <div className="glass-panel" style={{ padding: '32px', opacity: step === 2 ? 1 : 0.6 }}>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '24px' }}>2. Payment Method</h2>

                            {step === 2 && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                                    <div
                                        style={{ ...paymentOptionStyle, borderColor: paymentMethod === 'upi' ? 'var(--color-primary)' : 'var(--border-color)' }}
                                        onClick={() => setPaymentMethod('upi')}
                                    >
                                        <input type="radio" name="payment" id="upi" checked={paymentMethod === 'upi'} readOnly />
                                        <label htmlFor="upi" style={{ flex: 1, fontWeight: 600 }}>UPI (Google Pay, PhonePe, Paytm)</label>
                                        <span style={{ fontSize: '1.5rem' }}>📱</span>
                                    </div>

                                    <div
                                        style={{ ...paymentOptionStyle, borderColor: paymentMethod === 'card' ? 'var(--color-primary)' : 'var(--border-color)' }}
                                        onClick={() => setPaymentMethod('card')}
                                    >
                                        <input type="radio" name="payment" id="card" checked={paymentMethod === 'card'} readOnly />
                                        <label htmlFor="card" style={{ flex: 1, fontWeight: 600 }}>Credit / Debit Card</label>
                                        <span style={{ fontSize: '1.5rem' }}>💳</span>
                                    </div>

                                    <div
                                        style={{ ...paymentOptionStyle, borderColor: paymentMethod === 'cod' ? 'var(--color-primary)' : 'var(--border-color)' }}
                                        onClick={() => setPaymentMethod('cod')}
                                    >
                                        <input type="radio" name="payment" id="cod" checked={paymentMethod === 'cod'} readOnly />
                                        <label htmlFor="cod" style={{ flex: 1, fontWeight: 600 }}>Cash on Delivery</label>
                                        <span style={{ fontSize: '1.5rem' }}>💵</span>
                                    </div>

                                    <div
                                        style={{ ...paymentOptionStyle, borderColor: paymentMethod === 'wallet' ? 'var(--color-primary)' : 'var(--border-color)' }}
                                        onClick={() => setPaymentMethod('wallet')}
                                    >
                                        <input type="radio" name="payment" id="wallet" checked={paymentMethod === 'wallet'} readOnly />
                                        <label htmlFor="wallet" style={{ flex: 1, fontWeight: 600 }}>Papaz Wallet</label>
                                        <span style={{ fontSize: '1.5rem' }}>👛</span>
                                    </div>

                                    <button className="btn btn-primary" style={{ marginTop: '20px', padding: '16px' }} onClick={handlePlaceOrder}>
                                        Pay ₹{totalPrice.toLocaleString()} & Place Order
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Summary */}
                    <div>
                        <div className="glass-panel" style={{ padding: '32px', position: 'sticky', top: '120px' }}>
                            <h3 style={{ fontWeight: 700, marginBottom: '20px' }}>Order Summary</h3>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                                <span style={{ color: 'var(--text-muted)' }}>Items Total</span>
                                <span>₹{totalPrice.toLocaleString()}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                                <span style={{ color: 'var(--text-muted)' }}>Delivery Charges</span>
                                <span style={{ color: 'var(--status-success)', fontWeight: 600 }}>FREE</span>
                            </div>
                            <div style={{ height: '1px', background: 'var(--border-color)', margin: '20px 0' }} />
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem', fontWeight: 800 }}>
                                <span>To Pay</span>
                                <span>₹{totalPrice.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            <style jsx global>{`
                @media (max-width: 768px) {
                    .checkout-grid {
                        grid-template-columns: 1fr !important;
                    }
                }
            `}</style>
        </main>
    );
}

const inputStyle = { width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-body)', fontSize: '1rem', outline: 'none' };
const paymentOptionStyle = { display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)', cursor: 'pointer', transition: 'all 0.2s ease' };
