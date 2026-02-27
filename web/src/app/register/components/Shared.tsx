'use client';

import React, { useRef } from 'react';
import { Camera, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function AuthInput({ label, value, onChange, placeholder, icon, type = 'text', required = false }: {
    label: string,
    value: string,
    onChange: (v: string) => void,
    placeholder?: string,
    icon: React.ReactNode,
    type?: string,
    required?: boolean
}) {
    return (
        <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] ml-1">
                {label} {required && <span className="text-orange-500">*</span>}
            </label>
            <div className="relative group">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-orange-500 opacity-60 group-hover:opacity-100 transition-opacity pointer-events-none">
                    {icon}
                </div>
                <input
                    type={type}
                    value={value || ''}
                    onChange={e => onChange(e.target.value)}
                    placeholder={placeholder}
                    className="w-full h-14 bg-[var(--bg-body)]/50 border border-[var(--border-color)] rounded-2xl pl-14 pr-5 focus:border-orange-500 transition-all font-bold text-sm outline-none"
                    required={required}
                />
            </div>
        </div>
    );
}

export function OnboardingUploader({ label, value, isUploading, onUpload }: {
    label: string,
    value: string,
    isUploading: boolean,
    onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
}) {
    const inputRef = useRef<HTMLInputElement>(null);
    return (
        <div onClick={() => inputRef.current?.click()} className={cn("relative h-28 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-1 cursor-pointer transition-all", value ? "bg-green-500/5 border-green-500/20" : "bg-white/5 border-white/10 hover:border-orange-500/30")}>
            <input type="file" ref={inputRef} className="hidden" onChange={onUpload} accept="image/*,.pdf" />
            {isUploading ? <div className="animate-spin w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full" /> : value ? <CheckCircle2 size={24} className="text-green-500" /> : <Camera size={20} className="text-orange-500 opacity-40" />}
            <span className="text-[8px] font-black uppercase tracking-widest text-muted">{label}</span>
        </div>
    );
}
