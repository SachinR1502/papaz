'use client';

import { useSupplier } from '@/context/SupplierContext';
import { useState } from 'react';
import {
    Store,
    User,
    Phone,
    MapPin,
    ShieldCheck,
    ArrowRight,
    Rocket,
    CheckCircle2,
    Briefcase,
    Building2
} from 'lucide-react';

export default function SupplierRegistrationPage() {
    const { submitRegistration, isLoading } = useSupplier();
    const [form, setForm] = useState({
        storeName: '',
        fullName: '',
        address: '',
        phoneNumber: '',
        gst: '',
        city: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.storeName || !form.fullName || !form.phoneNumber || !form.address || !form.city) {
            alert('Please fill all required fields to proceed.');
            return;
        }

        try {
            await submitRegistration(form);
        } catch (e) {
            alert('Registration failed. Please try again.');
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'grid',
            gridTemplateColumns: 'minmax(400px, 1.2fr) 2fr',
            background: 'var(--bg-body)',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Visual Side Panel */}
            <div style={{
                position: 'relative',
                background: 'linear-gradient(135deg, rgba(var(--color-primary-rgb), 0.1), rgba(var(--color-primary-rgb), 0.05))',
                padding: '80px 60px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                borderRight: '1px solid var(--border-color)',
                zIndex: 1
            }}>
                <div>
                    <div style={{
                        width: '48px',
                        height: '48px',
                        background: 'var(--color-primary)',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        marginBottom: '40px',
                        boxShadow: '0 10px 20px rgba(var(--color-primary-rgb), 0.2)'
                    }}>
                        <Rocket size={24} />
                    </div>
                    <h1 className="text-gradient" style={{ fontSize: '3.5rem', fontWeight: 900, lineHeight: 1, letterSpacing: '-2px', marginBottom: '24px' }}>
                        Partner with PAPAZ
                    </h1>
                    <p style={{ fontSize: '1.25rem', color: 'var(--text-muted)', lineHeight: '1.6', fontWeight: 500 }}>
                        Join the most advanced ecosystem for master technicians and premium auto parts suppliers.
                    </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                    <FeatureItem
                        icon={<ShieldCheck size={20} />}
                        title="Verified Network"
                        desc="Connect with 5000+ verified automobile experts."
                    />
                    <FeatureItem
                        icon={<CheckCircle2 size={20} />}
                        title="Instant Payouts"
                        desc="Weekly settlements directly to your bank account."
                    />
                    <FeatureItem
                        icon={<Briefcase size={20} />}
                        title="Inventory Sync"
                        desc="Real-time stock management across all workshops."
                    />
                </div>

                {/* Decorative element */}
                <div style={{
                    position: 'absolute',
                    bottom: '-10%',
                    right: '-10%',
                    width: '300px',
                    height: '300px',
                    background: 'var(--color-primary)',
                    filter: 'blur(120px)',
                    opacity: 0.1,
                    zIndex: -1
                }} />
            </div>

            {/* Form Side */}
            <div style={{ padding: '80px 100px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{ maxWidth: '600px', width: '100%', margin: '0 auto' }}>
                    <header style={{ marginBottom: '48px' }}>
                        <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '8px' }}>Create your account</h2>
                        <p style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Complete the application to start receiving orders.</p>
                    </header>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>

                        {/* Business Identity */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            <InputGroup
                                label="Store / Shop Name"
                                required
                                icon={<Store size={18} />}
                                value={form.storeName}
                                onChange={(v) => setForm({ ...form, storeName: v })}
                                placeholder="A1 Auto Spares"
                            />
                            <InputGroup
                                label="Owner Name"
                                required
                                icon={<User size={18} />}
                                value={form.fullName}
                                onChange={(v) => setForm({ ...form, fullName: v })}
                                placeholder="Rahul Sharma"
                            />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(200px, 1fr) 2fr', gap: '20px' }}>
                            <InputGroup
                                label="Contact Number"
                                required
                                icon={<Phone size={18} />}
                                value={form.phoneNumber}
                                onChange={(v) => setForm({ ...form, phoneNumber: v })}
                                placeholder="+91 9900000000"
                            />
                            <InputGroup
                                label="Operating City"
                                required
                                icon={<MapPin size={18} />}
                                value={form.city}
                                onChange={(v) => setForm({ ...form, city: v })}
                                placeholder="Bangalore, Karnataka"
                            />
                        </div>

                        <div style={{ position: 'relative' }}>
                            <label style={labelStyle}>PHYSICAL BUSINESS ADDRESS *</label>
                            <div style={{ position: 'relative' }}>
                                <div style={{ position: 'absolute', left: '16px', top: '16px', color: 'var(--color-primary)', opacity: 0.6 }}>
                                    <Building2 size={20} />
                                </div>
                                <textarea
                                    required
                                    value={form.address}
                                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                                    placeholder="Complete physical address of your warehouse or shop..."
                                    style={{
                                        width: '100%',
                                        padding: '16px 16px 16px 48px',
                                        borderRadius: '16px',
                                        border: '1px solid var(--border-color)',
                                        background: 'rgba(255,255,255,0.02)',
                                        color: 'var(--text-body)',
                                        minHeight: '120px',
                                        resize: 'none',
                                        outline: 'none',
                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                        fontWeight: 500
                                    }}
                                    onFocus={(e) => {
                                        e.target.style.borderColor = 'var(--color-primary)';
                                        e.target.style.background = 'rgba(255,255,255,0.05)';
                                    }}
                                    onBlur={(e) => {
                                        e.target.style.borderColor = 'var(--border-color)';
                                        e.target.style.background = 'rgba(255,255,255,0.02)';
                                    }}
                                />
                            </div>
                        </div>

                        <div style={{ maxWidth: '300px' }}>
                            <InputGroup
                                label="GSTIN (Optional)"
                                icon={<ShieldCheck size={18} />}
                                value={form.gst}
                                onChange={(v) => setForm({ ...form, gst: v.toUpperCase() })}
                                placeholder="29XXXXX..."
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            style={{
                                width: '100%',
                                height: '64px',
                                borderRadius: '18px',
                                background: 'var(--color-primary)',
                                border: 'none',
                                color: 'white',
                                fontWeight: 900,
                                fontSize: '1.1rem',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '12px',
                                boxShadow: '0 20px 40px rgba(var(--color-primary-rgb), 0.2)',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                marginTop: '16px'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                            {isLoading ? 'Processing Registration...' : (
                                <>
                                    Submit Application <ArrowRight size={20} />
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

function FeatureItem({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
    return (
        <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
            <div style={{ color: 'var(--color-primary)', background: 'rgba(var(--color-primary-rgb), 0.1)', padding: '10px', borderRadius: '12px' }}>
                {icon}
            </div>
            <div>
                <h4 style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: '4px' }}>{title}</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 500 }}>{desc}</p>
            </div>
        </div>
    );
}

function InputGroup({ label, placeholder, value, onChange, icon, required = false }: {
    label: string,
    placeholder?: string,
    value: string,
    onChange: (v: string) => void,
    icon: React.ReactNode,
    required?: boolean
}) {
    return (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <label style={labelStyle}>
                {label.toUpperCase()} {required && <span style={{ color: '#ff3b30' }}>*</span>}
            </label>
            <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-primary)', opacity: 0.6, pointerEvents: 'none' }}>
                    {icon}
                </div>
                <input
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    style={{
                        width: '100%',
                        padding: '16px 16px 16px 48px',
                        borderRadius: '16px',
                        border: '1px solid var(--border-color)',
                        background: 'rgba(255,255,255,0.02)',
                        color: 'var(--text-body)',
                        fontSize: '1rem',
                        outline: 'none',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        fontWeight: 600
                    }}
                    onFocus={(e) => {
                        e.target.style.borderColor = 'var(--color-primary)';
                        e.target.style.background = 'rgba(255,255,255,0.05)';
                    }}
                    onBlur={(e) => {
                        e.target.style.borderColor = 'var(--border-color)';
                        e.target.style.background = 'rgba(255,255,255,0.02)';
                    }}
                />
            </div>
        </div>
    );
}

const labelStyle = {
    fontSize: '0.7rem',
    fontWeight: 900,
    color: 'var(--text-muted)',
    letterSpacing: '1.5px',
    marginLeft: '4px'
};
