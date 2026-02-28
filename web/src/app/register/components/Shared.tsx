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
            <label className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 ml-1">
                {label} {required && <span className="text-orange-500">*</span>}
            </label>
            <div className="relative group/input">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within/input:text-orange-500 transition-colors pointer-events-none">
                    {React.cloneElement(icon as React.ReactElement<any>, { size: 18 })}
                </div>
                <input
                    type={type}
                    value={value || ''}
                    onChange={e => onChange(e.target.value)}
                    placeholder={placeholder}
                    className="w-full h-12 bg-gray-50 border border-gray-200 rounded-xl pl-11 pr-5 focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-100 transition-all text-sm font-medium outline-none placeholder:text-gray-300"
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
        <div
            onClick={() => inputRef.current?.click()}
            className={cn(
                "relative h-32 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-2 cursor-pointer transition-all",
                value
                    ? "bg-green-50 border-green-200 hover:border-green-300"
                    : "bg-gray-50 border-gray-200 hover:border-orange-200 hover:bg-orange-50/30"
            )}
        >
            <input type="file" ref={inputRef} className="hidden" onChange={onUpload} accept="image/*,.pdf" />

            {isUploading ? (
                <div className="animate-spin w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full" />
            ) : value ? (
                <CheckCircle2 size={24} className="text-green-500" />
            ) : (
                <div className="p-3 bg-white rounded-xl shadow-sm">
                    <Camera size={20} className="text-orange-500" />
                </div>
            )}

            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                {value ? 'Uploaded' : label}
            </span>

            {value && (
                <div className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-sm">
                    <CheckCircle2 size={12} className="text-green-500" />
                </div>
            )}
        </div>
    );
}
