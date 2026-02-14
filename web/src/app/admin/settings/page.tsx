'use client';

import { useState } from 'react';
import {
    Settings,
    Shield,
    Lock,
    Bell,
    Globe,
    Cpu,
    Database,
    Cloud,
    Save,
    RefreshCcw,
    Server,
    Zap,
    Key,
    UserCog
} from 'lucide-react';

export default function AdminSettingsPage() {
    const [activeTab, setActiveTab] = useState('infrastructure');
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = () => {
        setIsSaving(true);
        setTimeout(() => setIsSaving(false), 1500);
    };

    return (
        <div style={{ position: 'relative' }}>
            <header style={{ marginBottom: '48px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <h1 className="text-gradient" style={{ fontSize: '3rem', fontWeight: 900, margin: 0, letterSpacing: '-1.5px' }}>
                        Settings
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', fontWeight: 500, marginTop: '4px' }}>
                        Manage platform configuration and preferences
                    </p>
                </div>
                <button
                    className="btn btn-primary"
                    onClick={handleSave}
                    disabled={isSaving}
                    style={{ borderRadius: '14px', padding: '12px 28px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                    {isSaving ? <RefreshCcw size={18} className="animate-spin" /> : <Save size={18} />}
                    {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '48px' }}>
                {/* Internal Navigation */}
                <aside style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <SettingsTab active={activeTab === 'infrastructure'} onClick={() => setActiveTab('infrastructure')} icon={<Server size={18} />} label="General" />
                    <SettingsTab active={activeTab === 'security'} onClick={() => setActiveTab('security')} icon={<Shield size={18} />} label="Security" />
                    <SettingsTab active={activeTab === 'notifications'} onClick={() => setActiveTab('notifications')} icon={<Bell size={18} />} label="Notifications" />
                    <SettingsTab active={activeTab === 'system'} onClick={() => setActiveTab('system')} icon={<Cpu size={18} />} label="System Health" />
                </aside>

                {/* Settings Panel */}
                <div className="glass-panel" style={{ padding: '48px', borderRadius: '40px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.01)' }}>
                    {activeTab === 'infrastructure' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
                            <SettingsSection title="Platform Information" description="Basic settings for the platform">
                                <SettingsField label="Platform Primary Domain" value="api.papaz.v4.cloud" type="text" />
                                <SettingsField label="Administrative Contact Email" value="ops@papaz.io" type="email" />
                            </SettingsSection>

                            <SettingsSection title="Business Rules" description="Settings for payouts and commissions">
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                                    <SettingsField label="Default Commission Rate (%)" value="15" type="number" />
                                    <SettingsField label="Minimum Payout Threshold (INR)" value="1000" type="number" />
                                </div>
                                <div style={{ marginTop: '24px' }}>
                                    <ToggleField label="Auto-Approve Certified Technicians" active={false} />
                                    <ToggleField label="Enable Global Supply Sourcing" active={true} />
                                </div>
                            </SettingsSection>
                        </div>
                    )}

                    {activeTab === 'security' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
                            <SettingsSection title="API Keys" description="Manage API access and security keys">
                                <SettingsField label="Master API Signature Key" value="********************************" type="password" />
                                <SettingsField label="CORS Whitelist Domains" value="localhost, *.papaz.app, papaz.io" type="text" />
                            </SettingsSection>

                            <SettingsSection title="Security Policies" description="Configure security rules">
                                <ToggleField label="Enable Multi-Factor Authentication (Admin Only)" active={true} />
                                <ToggleField label="Strict ID Verification for Suppliers" active={true} />
                                <ToggleField label="Log Aggressive Traffic Patterns" active={true} />
                            </SettingsSection>
                        </div>
                    )}

                    {activeTab !== 'infrastructure' && activeTab !== 'security' && (
                        <div style={{ padding: '80px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
                            <Settings size={64} opacity={0.1} style={{ marginBottom: '24px' }} />
                            <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Loading...</h3>
                            <p style={{ fontSize: '0.9rem' }}>Please wait while settings load.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function SettingsTab({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
    return (
        <button
            onClick={onClick}
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '16px 20px',
                borderRadius: '16px',
                border: 'none',
                background: active ? 'rgba(var(--color-primary-rgb), 0.1)' : 'transparent',
                color: active ? 'var(--color-primary)' : 'var(--text-muted)',
                fontWeight: 800,
                fontSize: '0.95rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
                textAlign: 'left'
            }}
        >
            <span style={{ opacity: active ? 1 : 0.6 }}>{icon}</span>
            {label}
        </button>
    );
}

function SettingsSection({ title, description, children }: { title: string, description: string, children: React.ReactNode }) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 900, marginBottom: '4px' }}>{title}</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>{description}</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {children}
            </div>
        </div>
    );
}

function SettingsField({ label, value, type }: { label: string, value: string, type: string }) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '0.5px' }}>{label.toUpperCase()}</label>
            <input
                type={type}
                defaultValue={value}
                style={{
                    padding: '16px',
                    borderRadius: '12px',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-body)',
                    fontWeight: 600,
                    fontSize: '1rem',
                    outline: 'none',
                    transition: 'border 0.2s'
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = 'var(--color-primary)'}
                onBlur={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
            />
        </div>
    );
}

function ToggleField({ label, active }: { label: string, active: boolean }) {
    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', borderRadius: '16px', background: 'rgba(255,255,255,0.02)', marginBottom: '8px' }}>
            <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{label}</span>
            <div style={{
                width: '48px',
                height: '24px',
                borderRadius: '100px',
                background: active ? 'var(--color-primary)' : 'rgba(255,255,255,0.1)',
                position: 'relative',
                cursor: 'pointer',
                transition: 'background 0.3s'
            }}>
                <div style={{
                    position: 'absolute',
                    top: '4px',
                    left: active ? '28px' : '4px',
                    width: '16px',
                    height: '16px',
                    borderRadius: '50%',
                    background: 'white',
                    transition: 'left 0.3s'
                }} />
            </div>
        </div>
    );
}
