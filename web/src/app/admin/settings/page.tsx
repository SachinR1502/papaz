'use client';

import { useState, useEffect } from 'react';
import { adminService } from '@/services/adminService';
import {
    Shield,
    Save,
    RefreshCcw,
    Server,
    Settings,
    Database,
    Globe,
    Lock,
    Cpu
} from 'lucide-react';

export default function AdminSettingsPage() {
    const [activeTab, setActiveTab] = useState('infrastructure');
    const [isSaving, setIsSaving] = useState(false);
    const [settings, setSettings] = useState<any>({});
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const data = await adminService.getSettings();
                setSettings(data);
            } catch (error) {
                console.error('Failed to fetch settings:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchSettings();
    }, []);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await adminService.updateSettings(settings);
            // Show toast would go here
        } catch (error) {
            console.error('Failed to save settings:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleChange = (key: string, value: any) => {
        setSettings((prev: any) => ({ ...prev, [key]: value }));
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
                <div className="animate-spin w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full"></div>
                <p className="text-muted font-bold tracking-widest text-xs animate-pulse">LOADING CONFIGURATION...</p>
            </div>
        );
    }

    return (
        <div className="relative pb-20">
            {/* Ambient Background */}
            <div className="fixed top-[10%] left-[20%] w-[500px] h-[500px] bg-orange-500 blur-[200px] opacity-[0.03] -z-10 pointer-events-none" />

            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8 md:mb-12">
                <div>
                    <h1 className="text-4xl md:text-5xl font-black m-0 tracking-tighter text-foreground italic uppercase">
                        Settings
                    </h1>
                    <p className="text-muted text-sm md:text-base font-medium mt-2">
                        System configuration & operational parameters
                    </p>
                </div>
                <button
                    className={`group relative flex items-center gap-2 px-6 py-3 rounded-2xl bg-orange-500 text-white text-sm font-bold transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-orange-500/20 overflow-hidden ${isSaving ? 'cursor-wait' : 'hover:scale-105 hover:shadow-orange-500/40'}`}
                    onClick={handleSave}
                    disabled={isSaving}
                >
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                    {isSaving ? <RefreshCcw size={18} className="animate-spin" /> : <Save size={18} />}
                    <span className="relative">{isSaving ? 'Syncing...' : 'Save Configuration'}</span>
                </button>
            </header>

            {/* Top Navigation Tabs */}
            <div className="flex flex-col gap-8 max-w-5xl mx-auto">
                <div className="glass-panel p-1.5 rounded-2xl border border-white/5 flex flex-wrap justify-center md:justify-start gap-2 bg-black/40 backdrop-blur-md sticky top-4 z-30 shadow-2xl shadow-black/50 mx-auto md:mx-0 w-fit">
                    <SettingsTab
                        active={activeTab === 'infrastructure'}
                        onClick={() => setActiveTab('infrastructure')}
                        icon={<Server size={18} />}
                        label="General"
                    />
                    <SettingsTab
                        active={activeTab === 'business'}
                        onClick={() => setActiveTab('business')}
                        icon={<Database size={18} />}
                        label="Business Logic"
                    />
                    <SettingsTab
                        active={activeTab === 'security'}
                        onClick={() => setActiveTab('security')}
                        icon={<Shield size={18} />}
                        label="Security"
                    />
                </div>

                {/* Main Settings Panel */}
                <div className="glass-panel p-8 md:p-10 rounded-[40px] border border-white/5 bg-black/40 backdrop-blur-md min-h-[500px] relative overflow-hidden w-full">
                    {/* Inner ambient glow */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500 blur-[100px] opacity-[0.05] pointer-events-none" />

                    {activeTab === 'infrastructure' && (
                        <div className="flex flex-col gap-12 animate-slide-up-fade">
                            <SettingsSection title="Platform Identity" description="Core platform identification settings">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <SettingsInput label="Platform Name" value={settings.platformName} onChange={(v) => handleChange('platformName', v)} icon={<Globe size={16} />} />
                                    <SettingsInput label="Default Currency" value={settings.currency} onChange={(v) => handleChange('currency', v)} />
                                </div>
                            </SettingsSection>


                        </div>
                    )}

                    {activeTab === 'business' && (
                        <div className="flex flex-col gap-12 animate-slide-up-fade">
                            <SettingsSection title="Financial Rules" description="Commission and payout configurations">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <SettingsInput
                                        label="Platform Commission (%)"
                                        value={settings.commissionRate}
                                        type="number"
                                        onChange={(v) => handleChange('commissionRate', parseFloat(v))}
                                        suffix="%"
                                    />
                                    <SettingsInput
                                        label="Min Withdrawal Limit"
                                        value={settings.minWithdrawal}
                                        type="number"
                                        onChange={(v) => handleChange('minWithdrawal', parseFloat(v))}
                                        prefix="₹"
                                    />
                                </div>
                                <div className="mt-4">
                                    <SettingsInput label="Payout Schedule" value={settings.payoutSchedule} onChange={(v) => handleChange('payoutSchedule', v)} />
                                </div>
                            </SettingsSection>

                            <div className="h-px bg-white/5 w-full" />

                            <SettingsSection title="Onboarding" description="User registration controls">
                                <ToggleCard
                                    label="Allow New Registrations"
                                    description="Open platform for new user signups"
                                    active={settings.allowRegistrations}
                                    onClick={() => handleChange('allowRegistrations', !settings.allowRegistrations)}
                                />
                            </SettingsSection>
                        </div>
                    )}

                    {activeTab === 'security' && (
                        <div className="flex flex-col gap-12 animate-slide-up-fade">
                            <SettingsSection title="Environment Security" description="Server-side security configurations">
                                <div className="p-6 rounded-2xl bg-white/5 border border-white/5 flex gap-4 items-start">
                                    <div className="p-3 rounded-xl bg-orange-500/10 text-orange-500">
                                        <Lock size={20} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-foreground text-sm mb-1">Managed Externally</h4>
                                        <p className="text-muted text-xs leading-relaxed max-w-md">
                                            Sensitive security keys, JWT secrets, and database credentials are managed via environment variables (env) and cannot be modified from this dashboard.
                                        </p>
                                    </div>
                                </div>
                            </SettingsSection>

                            <SettingsSection title="System Health" description="Current operational status">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex flex-col gap-2">
                                        <span className="text-xs font-bold text-muted uppercase">API Latency</span>
                                        <div className="flex items-center gap-2 text-green-500 font-black text-xl">
                                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> 24ms
                                        </div>
                                    </div>
                                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex flex-col gap-2">
                                        <span className="text-xs font-bold text-muted uppercase">Uptime</span>
                                        <div className="flex items-center gap-2 text-orange-500 font-black text-xl">
                                            <Cpu size={18} /> 99.9%
                                        </div>
                                    </div>
                                </div>
                            </SettingsSection>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// --- Reusable Components ---

function SettingsTab({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-3 px-6 py-3 rounded-2xl transition-all font-black text-xs uppercase tracking-wide relative overflow-hidden group shadow-xl ${active
                ? 'bg-orange-500 text-white shadow-orange-500/40 scale-105 z-10'
                : 'bg-white text-orange-600 shadow-black/10 hover:bg-gray-50 hover:scale-[1.02]'
                }`}
        >
            <span className={`transition-transform duration-300 ${active ? 'scale-110' : 'group-hover:scale-110'}`}>{icon}</span>
            {label}
        </button>
    );
}

function SettingsSection({ title, description, children }: { title: string, description: string, children: React.ReactNode }) {
    return (
        <div className="flex flex-col gap-6">
            <div>
                <h3 className="text-lg font-black mb-1 tracking-tight flex items-center gap-2 text-foreground">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500" /> {title}
                </h3>
                <p className="text-sm text-muted font-medium pl-3.5 border-l border-white/10">{description}</p>
            </div>
            <div className="flex flex-col gap-4">
                {children}
            </div>
        </div>
    );
}

function SettingsInput({ label, value, type = "text", onChange, icon, prefix, suffix }: { label: string, value: any, type?: string, onChange: (val: string) => void, icon?: React.ReactNode, prefix?: string, suffix?: string }) {
    return (
        <div className="flex flex-col gap-3 group">
            <label className="text-[10px] font-black text-muted tracking-widest uppercase ml-1 group-focus-within:text-orange-500 transition-colors">{label}</label>
            <div className="relative flex items-center">
                {icon && <div className="absolute left-4 text-muted group-focus-within:text-foreground transition-colors pointer-events-none">{icon}</div>}
                {prefix && <div className="absolute left-4 text-muted font-bold pointer-events-none">{prefix}</div>}

                <input
                    type={type}
                    value={value || ''}
                    onChange={(e) => onChange(e.target.value)}
                    className={`w-full  border border-orange-500/50 text-foreground font-bold rounded-xl outline-none focus:border-orange-500  focus:shadow-[0_0_20px_rgba(249,115,22,0.15)] transition-all placeholder:text-muted/20 hover:border-white/20
                        ${icon ? 'pl-11 pr-4 py-4' : prefix ? 'pl-10 pr-4 py-4' : suffix ? 'pl-4 pr-10 py-4' : 'px-4 py-4'}`}
                />

                {suffix && <div className="absolute right-4 text-muted font-bold pointer-events-none text-xs">{suffix}</div>}
            </div>
        </div>
    );
}

function ToggleCard({ label, description, active, onClick, danger }: { label: string, description: string, active: boolean, onClick: () => void, danger?: boolean }) {
    return (
        <div
            onClick={onClick}
            className={`flex justify-between items-center p-5 rounded-2xl border transition-all cursor-pointer group select-none ${active
                ? (danger ? 'bg-gradient-to-r from-red-900/20 to-red-600/10 border-red-500/50' : 'bg-gradient-to-r from-orange-900/20 to-orange-600/10 border-orange-500/50')
                : 'bg-orange-500/10 border-orange-500/50 hover:border-orange-500/20 hover:bg-orange-500/[0.02]'}`}
        >
            <div className="flex flex-col gap-1.5">
                <span className={`font-black text-sm ${active ? (danger ? 'text-red-500' : 'text-orange-500') : 'text-foreground'}`}>{label}</span>
                <span className="text-xs text-gray-400 font-medium pr-4">{description}</span>
            </div>

            <div className={`w-12 h-7 rounded-full relative transition-colors duration-300 flex items-center px-1 shrink-0 border ${active ? (danger ? 'bg-red-500 border-red-400' : 'bg-orange-600 border-orange-400') : 'bg-orange-500/10 border-orange-500/50 group-hover:bg-orange-500/20'}`}>
                <div
                    className={`w-5 h-5 rounded-full bg-white shadow-md transition-all duration-300 transform ${active ? 'translate-x-[20px]' : 'translate-x-0'}`}
                />
            </div>
        </div>
    );
}
