'use client';

import { useSupplier } from '@/context/SupplierContext';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import {
    ArrowLeft,
    Pencil,
    Store,
    User,
    Phone,
    MapPin,
    Locate,
    FileText,
    Save,
    Loader2,
    CheckCircle2
} from 'lucide-react';

export default function SupplierEditProfilePage() {
    const { updateProfile, profile, isLoading } = useSupplier();
    const router = useRouter();

    const [form, setForm] = useState({
        storeName: '',
        fullName: '',
        address: '',
        phoneNumber: '',
        gst: '',
        city: ''
    });

    useEffect(() => {
        if (profile) {
            setForm({
                storeName: profile.storeName || '',
                fullName: profile.fullName || '',
                address: profile.address || '',
                phoneNumber: profile.phoneNumber || '',
                gst: profile.gst || '',
                city: profile.city || ''
            });
        }
    }, [profile]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!form.storeName || !form.fullName || !form.phoneNumber || !form.address || !form.city) {
            alert('Please fill all required fields to proceed.');
            return;
        }

        try {
            await updateProfile(form);
            router.push('/supplier/profile');
        } catch (e) {
            alert("Something went wrong. Please try again.");
        }
    };

    return (
        <div style={{
            maxWidth: '900px',
            margin: '0 auto',
            padding: '48px 24px',
            position: 'relative',
            minHeight: 'calc(100vh - 72px)'
        }}>
            {/* Ambient Background Element */}
            <div style={{
                position: 'fixed',
                top: '10%',
                right: '5%',
                width: '300px',
                height: '300px',
                background: 'var(--color-primary)',
                filter: 'blur(150px)',
                opacity: 0.05,
                zIndex: -1,
                borderRadius: '50%'
            }} />

            {/* Header Area */}
            <header style={{
                marginBottom: '48px',
                display: 'flex',
                alignItems: 'center',
                gap: '24px',
                position: 'relative'
            }}>
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
                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                        e.currentTarget.style.transform = 'translateX(-4px)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                        e.currentTarget.style.transform = 'translateX(0)';
                    }}
                >
                    <ArrowLeft size={22} />
                </button>

                <div>
                    <h1 className="text-gradient" style={{
                        fontSize: '2.75rem',
                        fontWeight: 900,
                        margin: '0 0 4px',
                        letterSpacing: '-1.5px'
                    }}>
                        Edit Profile
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', fontWeight: 500 }}>
                        Refine your business identity on the PAPAZ network
                    </p>
                </div>

                <div style={{
                    marginLeft: 'auto',
                    padding: '8px 16px',
                    borderRadius: '100px',
                    background: 'rgba(52, 199, 89, 0.1)',
                    color: '#34C759',
                    fontSize: '0.85rem',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    letterSpacing: '0.5px'
                }}>
                    <CheckCircle2 size={16} />
                    ACCOUNT ACTIVE
                </div>
            </header>

            <form onSubmit={handleSubmit} style={{
                display: 'grid',
                gridTemplateColumns: '1fr',
                gap: '32px'
            }}>
                {/* Main Content Card */}
                <div className="glass-panel" style={{
                    padding: '40px',
                    borderRadius: '32px',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '40px'
                }}>
                    {/* Section: Basic Identity */}
                    <section>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            marginBottom: '24px',
                            color: 'var(--color-primary)'
                        }}>
                            <div style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '8px',
                                background: 'rgba(var(--color-primary-rgb), 0.1)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <Store size={18} />
                            </div>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-body)' }}>Identity Details</h2>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                            <InputGroup
                                label="Business Name"
                                required
                                placeholder="Enter your shop name"
                                icon={<Store size={18} />}
                                value={form.storeName}
                                onChange={(v) => setForm({ ...form, storeName: v })}
                            />
                            <InputGroup
                                label="Owner / Manager Name"
                                required
                                placeholder="Full name of person-in-charge"
                                icon={<User size={18} />}
                                value={form.fullName}
                                onChange={(v) => setForm({ ...form, fullName: v })}
                            />
                        </div>
                    </section>

                    {/* Section: Contact & Reach */}
                    <section>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            marginBottom: '24px',
                            color: 'var(--color-primary)'
                        }}>
                            <div style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '8px',
                                background: 'rgba(var(--color-primary-rgb), 0.1)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <Phone size={18} />
                            </div>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-body)' }}>Contact & Coverage</h2>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
                            <InputGroup
                                label="Primary Phone"
                                required
                                placeholder="+91 00000 00000"
                                icon={<Phone size={18} />}
                                value={form.phoneNumber}
                                onChange={(v) => setForm({ ...form, phoneNumber: v })}
                            />
                            <InputGroup
                                label="Operational City"
                                required
                                placeholder="e.g. Bangalore"
                                icon={<Locate size={18} />}
                                value={form.city}
                                onChange={(v) => setForm({ ...form, city: v })}
                            />
                        </div>

                        <div style={{ marginBottom: '8px' }}>
                            <label style={{
                                display: 'block',
                                fontSize: '0.75rem',
                                fontWeight: 800,
                                color: 'var(--text-muted)',
                                marginBottom: '10px',
                                marginLeft: '4px',
                                letterSpacing: '1px'
                            }}>
                                BUSINESS ADDRESS <span style={{ color: '#ff3b30' }}>*</span>
                            </label>
                            <div style={{ position: 'relative' }}>
                                <div style={{
                                    position: 'absolute',
                                    left: '18px',
                                    top: '18px',
                                    color: 'var(--color-primary)',
                                    opacity: 0.6
                                }}>
                                    <MapPin size={20} />
                                </div>
                                <textarea
                                    value={form.address}
                                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                                    placeholder="Enter full physical address of the store..."
                                    style={{
                                        width: '100%',
                                        padding: '18px 18px 18px 52px',
                                        borderRadius: '20px',
                                        border: '1px solid var(--border-color)',
                                        background: 'rgba(255, 255, 255, 0.03)',
                                        color: 'var(--text-body)',
                                        fontSize: '1rem',
                                        minHeight: '140px',
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
                        </div>
                    </section>

                    {/* Section: Compliance */}
                    <section>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            marginBottom: '24px',
                            color: 'var(--color-primary)'
                        }}>
                            <div style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '8px',
                                background: 'rgba(var(--color-primary-rgb), 0.1)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <FileText size={18} />
                            </div>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-body)' }}>Tax & Compliance</h2>
                        </div>

                        <div style={{ maxWidth: '400px' }}>
                            <InputGroup
                                label="GST Identification Number"
                                placeholder="Enter valid GSTIN"
                                icon={<FileText size={18} />}
                                value={form.gst}
                                onChange={(v) => setForm({ ...form, gst: v.toUpperCase() })}
                            />
                        </div>
                    </section>
                </div>

                {/* Fixed Footer Action Bar or Large Buttons */}
                <div style={{
                    display: 'flex',
                    gap: '20px',
                    marginTop: '8px'
                }}>
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
                            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                            e.currentTarget.style.transform = 'translateY(-2px)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                            e.currentTarget.style.transform = 'translateY(0)';
                        }}
                    >
                        Discard Changes
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
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-4px)';
                            e.currentTarget.style.boxShadow = '0 25px 50px rgba(var(--color-primary-rgb), 0.3)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 20px 40px rgba(var(--color-primary-rgb), 0.2)';
                        }}
                    >
                        {isLoading ? (
                            <Loader2 size={28} className="animate-spin" />
                        ) : (
                            <>
                                <Save size={24} />
                                Synchronize Profile
                            </>
                        )}
                    </button>
                </div>
            </form>
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
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{
                display: 'block',
                fontSize: '0.75rem',
                fontWeight: 800,
                color: 'var(--text-muted)',
                marginLeft: '4px',
                letterSpacing: '1px'
            }}>
                {label.toUpperCase()} {required && <span style={{ color: '#ff3b30' }}>*</span>}
            </label>
            <div style={{ position: 'relative' }}>
                <div style={{
                    position: 'absolute',
                    left: '18px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--color-primary)',
                    opacity: 0.6,
                    pointerEvents: 'none'
                }}>
                    {icon}
                </div>
                <input
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    style={{
                        width: '100%',
                        padding: '16px 16px 16px 52px',
                        borderRadius: '18px',
                        border: '1px solid var(--border-color)',
                        background: 'rgba(255, 255, 255, 0.03)',
                        color: 'var(--text-body)',
                        fontSize: '1rem',
                        outline: 'none',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        fontWeight: 600
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
        </div>
    );
}
