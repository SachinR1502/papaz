'use client';

import { useSupplier } from '@/context/SupplierContext';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import {
    ArrowLeft,
    PlusCircle,
    Package,
    Truck,
    IndianRupee,
    Layers,
    FileText,
    Save,
    Loader2,
    CheckCircle2
} from 'lucide-react';

const PRODUCT_TYPES = ['Car', 'Bike', 'Scooter', 'Truck', 'Bus', 'Tractor', 'EV Vehicle', 'Other'];

export default function AddProductPage() {
    const { addProduct, isLoading } = useSupplier();
    const router = useRouter();
    const [form, setForm] = useState({
        name: '',
        type: 'Car',
        price: '',
        quantity: '',
        localDeliveryTime: '2-3 Hours',
        description: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name || !form.price || !form.quantity) {
            alert('Please fill required fields');
            return;
        }

        try {
            await addProduct({
                ...form,
                price: parseFloat(form.price),
                stock: parseInt(form.quantity),
                category: form.type
            });
            router.push('/supplier/inventory');
        } catch (e) {
            alert('Failed to add product');
        }
    };

    return (
        <div style={{ maxWidth: '850px', margin: '0 auto', padding: '48px 24px', position: 'relative' }}>
            {/* Background Blur */}
            <div style={{
                position: 'fixed',
                top: '20%',
                left: '20%',
                width: '300px',
                height: '300px',
                background: 'var(--color-primary)',
                filter: 'blur(140px)',
                opacity: 0.04,
                zIndex: -1,
                borderRadius: '50%'
            }} />

            {/* Header */}
            <header style={{ marginBottom: '48px', display: 'flex', alignItems: 'center', gap: '24px' }}>
                <button
                    onClick={() => router.back()}
                    style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid var(--border-color)',
                        width: '48px',
                        height: '48px',
                        borderRadius: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        color: 'var(--text-body)',
                        transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateX(-4px)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateX(0)'}
                >
                    <ArrowLeft size={22} />
                </button>
                <div>
                    <h1 className="text-gradient" style={{ fontSize: '2.5rem', fontWeight: 900, margin: 0, letterSpacing: '-1.5px' }}>
                        Create Listing
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', fontWeight: 500 }}>Add a new product to your public catalog</p>
                </div>
            </header>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                {/* Main Form Body */}
                <div className="glass-panel" style={{
                    padding: '40px',
                    borderRadius: '32px',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '40px'
                }}>

                    {/* Basic Info */}
                    <section>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px', color: 'var(--color-primary)' }}>
                            <Package size={20} />
                            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-body)' }}>General Information</h2>
                        </div>

                        <InputGroup
                            label="Product Title"
                            required
                            placeholder="e.g. Front Brake Pads for Mahindra XUV700"
                            icon={<Package size={18} />}
                            value={form.name}
                            onChange={(v) => setForm({ ...form, name: v })}
                        />
                    </section>

                    {/* Logistics & Pricing */}
                    <section>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px', color: 'var(--color-primary)' }}>
                            <Truck size={20} />
                            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-body)' }}>Logistics & Pricing</h2>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
                            <SelectGroup
                                label="Listing Category"
                                required
                                icon={<Layers size={18} />}
                                value={form.type}
                                options={PRODUCT_TYPES}
                                onChange={(v) => setForm({ ...form, type: v })}
                            />
                            <SelectGroup
                                label="Fulfillment Time"
                                required
                                icon={<Truck size={18} />}
                                value={form.localDeliveryTime}
                                options={['1-2 Hours', '2-4 Hours', 'Same Day', 'Next Day', '2-3 Days']}
                                onChange={(v) => setForm({ ...form, localDeliveryTime: v })}
                            />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                            <InputGroup
                                label="Unit Price (INR)"
                                required
                                type="number"
                                placeholder="0.00"
                                icon={<IndianRupee size={18} />}
                                value={form.price}
                                onChange={(v) => setForm({ ...form, price: v })}
                            />
                            <InputGroup
                                label="Available Stock"
                                required
                                type="number"
                                placeholder="0 units"
                                icon={<Package size={18} />}
                                value={form.quantity}
                                onChange={(v) => setForm({ ...form, quantity: v })}
                            />
                        </div>
                    </section>

                    {/* Additional Details */}
                    <section>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px', color: 'var(--color-primary)' }}>
                            <FileText size={20} />
                            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-body)' }}>Product Description</h2>
                        </div>

                        <div style={{ position: 'relative' }}>
                            <div style={{ position: 'absolute', left: '18px', top: '18px', color: 'var(--color-primary)', opacity: 0.6 }}>
                                <FileText size={20} />
                            </div>
                            <textarea
                                value={form.description}
                                onChange={(e) => setForm({ ...form, description: e.target.value })}
                                placeholder="Specifications, warranty info, or vehicle compatibility details..."
                                style={{
                                    width: '100%',
                                    padding: '18px 18px 18px 52px',
                                    borderRadius: '20px',
                                    border: '1px solid var(--border-color)',
                                    background: 'rgba(255, 255, 255, 0.03)',
                                    color: 'var(--text-body)',
                                    fontSize: '1rem',
                                    minHeight: '160px',
                                    resize: 'none',
                                    outline: 'none',
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    fontWeight: 500,
                                    lineHeight: '1.6'
                                }}
                                onFocus={(e) => {
                                    e.target.style.borderColor = 'var(--color-primary)';
                                    e.target.style.boxShadow = '0 0 0 4px rgba(var(--color-primary-rgb), 0.1)';
                                    e.target.style.background = 'rgba(255, 255, 255, 0.05)';
                                }}
                                onBlur={(e) => {
                                    e.target.style.borderColor = 'var(--border-color)';
                                    e.target.style.boxShadow = 'none';
                                    e.target.style.background = 'rgba(255, 255, 255, 0.03)';
                                }}
                            />
                        </div>
                    </section>
                </div>

                {/* Submit Actions */}
                <div style={{ display: 'flex', gap: '20px' }}>
                    <button
                        type="button"
                        onClick={() => router.back()}
                        style={{
                            flex: 1,
                            height: '64px',
                            borderRadius: '20px',
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid var(--border-color)',
                            color: 'var(--text-body)',
                            fontWeight: 700,
                            fontSize: '1.1rem',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                    >
                        Discard
                    </button>
                    <button
                        type="submit"
                        disabled={isLoading}
                        style={{
                            flex: 2,
                            height: '64px',
                            borderRadius: '20px',
                            background: 'var(--color-primary)',
                            border: 'none',
                            color: 'white',
                            fontWeight: 900,
                            fontSize: '1.2rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '12px',
                            boxShadow: '0 20px 40px rgba(var(--color-primary-rgb), 0.2)',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                        {isLoading ? (
                            <Loader2 size={28} className="animate-spin" />
                        ) : (
                            <>
                                <Save size={24} />
                                Publish to Store
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}

function InputGroup({ label, placeholder, value, onChange, icon, required = false, type = "text" }: {
    label: string,
    placeholder?: string,
    value: string,
    onChange: (v: string) => void,
    icon: React.ReactNode,
    required?: boolean,
    type?: string
}) {
    return (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '1px' }}>
                {label.toUpperCase()} {required && <span style={{ color: '#ff3b30' }}>*</span>}
            </label>
            <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-primary)', opacity: 0.6 }}>
                    {icon}
                </div>
                <input
                    type={type}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    style={{
                        width: '100%',
                        padding: '18px 18px 18px 52px',
                        borderRadius: '18px',
                        border: '1px solid var(--border-color)',
                        background: 'rgba(255, 255, 255, 0.03)',
                        color: 'var(--text-body)',
                        fontSize: '1rem',
                        outline: 'none',
                        transition: 'all 0.3s ease',
                        fontWeight: 600
                    }}
                    onFocus={(e) => {
                        e.target.style.borderColor = 'var(--color-primary)';
                        e.target.style.boxShadow = '0 0 0 4px rgba(var(--color-primary-rgb), 0.1)';
                    }}
                    onBlur={(e) => {
                        e.target.style.borderColor = 'var(--border-color)';
                        e.target.style.boxShadow = 'none';
                    }}
                />
            </div>
        </div>
    );
}

function SelectGroup({ label, value, onChange, icon, options, required = false }: {
    label: string,
    value: string,
    onChange: (v: string) => void,
    icon: React.ReactNode,
    options: string[],
    required?: boolean
}) {
    return (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '1px' }}>
                {label.toUpperCase()} {required && <span style={{ color: '#ff3b30' }}>*</span>}
            </label>
            <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-primary)', opacity: 0.6, pointerEvents: 'none' }}>
                    {icon}
                </div>
                <select
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    style={{
                        width: '100%',
                        padding: '18px 18px 18px 52px',
                        borderRadius: '18px',
                        border: '1px solid var(--border-color)',
                        background: 'rgba(255, 255, 255, 0.03)',
                        color: 'var(--text-body)',
                        fontSize: '1rem',
                        outline: 'none',
                        transition: 'all 0.3s ease',
                        fontWeight: 600,
                        appearance: 'none',
                    }}
                    onFocus={(e) => e.target.style.borderColor = 'var(--color-primary)'}
                    onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
                >
                    {options.map(opt => <option key={opt} value={opt} style={{ background: '#111', color: 'white' }}>{opt}</option>)}
                </select>
            </div>
        </div>
    );
}
