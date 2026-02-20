'use client';

import { useSupplier } from '@/context/SupplierContext';
import { useRouter } from 'next/navigation';
import { useState, useRef } from 'react';
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
    CheckCircle2,
    Zap,
    Warehouse,
    ChevronDown,
    Upload,
    Image as ImageIcon,
    X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { uploadService, UploadResult } from '@/services/uploadService';

const CATEGORIES = [
    'Batteries', 'Tires', 'Engine Oil', 'Brakes', 'Lights',
    'Filters', 'Accessories', 'Spare Parts', 'Lubricants',
    'Suspension', 'Electrical'
];

const VEHICLE_TYPES = ['Car', 'Bike', 'Scooter', 'Truck', 'Bus', 'Tractor', 'EV Vehicle', 'Other'];

export default function AddProductPage() {
    const { addProduct, isLoading } = useSupplier();
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [form, setForm] = useState({
        name: '',
        category: 'Spare Parts',
        price: '',
        quantity: '',
        description: '',
        brand: '',
        partNumber: '',
        image: '', // Primary image
        images: [] as UploadResult[],
        videos: [] as UploadResult[],
        audio: [] as UploadResult[],
        compatibleModels: [] as string[]
    });

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        setIsUploading(true);
        const toastId = toast.loading(`Uploading ${files.length} asset(s)...`);

        try {
            const results = await Promise.all(
                files.map(file => uploadService.uploadFile(file))
            );

            setForm(prev => {
                const newImages = [...prev.images, ...results.filter(r => r.category === 'images')];
                const newVideos = [...prev.videos, ...results.filter(r => r.category === 'videos')];
                const newAudio = [...prev.audio, ...results.filter(r => r.category === 'audio')];

                return {
                    ...prev,
                    images: newImages,
                    videos: newVideos,
                    audio: newAudio,
                    image: newImages.length > 0 ? newImages[0].url : prev.image
                };
            });

            toast.success('Assets Synced', { id: toastId, description: 'Cloud storage updated successfully.' });
        } catch (error: any) {
            console.error('Upload Error:', error);
            toast.error('Sync Failed', { id: toastId, description: error.message || 'Error occurred during upload.' });
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const removeAsset = (type: 'images' | 'videos' | 'audio', index: number) => {
        setForm(prev => {
            const list = [...prev[type]];
            list.splice(index, 1);
            return {
                ...prev,
                [type]: list,
                image: type === 'images' && index === 0 ? (list[0]?.url || '') : prev.image
            };
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name || !form.price || !form.quantity) {
            toast.error('Missing Required Fields', {
                description: 'Please provide title, price, and quantity.'
            });
            return;
        }

        setIsSubmitting(true);
        try {
            await addProduct({
                ...form,
                price: parseFloat(form.price),
                stock: parseInt(form.quantity),
                image: form.image || (form.images[0]?.url) || 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?q=80&w=2832&auto=format&fit=crop',
                // Flattening multiple assets for the main API if it only supports one string (backward compatibility)
                // However, if the API supports it, we could pass the full arrays.
                localDeliveryTime: '2-3 Hours'
            });
            toast.success('Listing Created', {
                description: 'Product published to global network.'
            });
            router.push('/supplier/inventory');
        } catch (e) {
            toast.error('Creation Failed', {
                description: 'Error while publishing your listing.'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto flex flex-col gap-10 md:gap-14 animate-fade-in pb-20">
            {/* Header */}
            <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-8">
                <div className="flex items-center gap-6">
                    <button
                        onClick={() => router.back()}
                        className="w-14 h-14 rounded-2xl bg-card border border-border flex items-center justify-center text-muted hover:text-primary hover:border-primary/30 transition-all active:scale-90 shadow-sm"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-3">
                            <PlusCircle size={10} className="text-primary" />
                            <span className="text-[10px] uppercase font-black tracking-widest text-primary">Catalog Expansion</span>
                        </div>
                        <h1 className="text-4xl lg:text-5xl font-black m-0 tracking-tighter text-foreground italic uppercase">
                            Create <span className="text-primary">Listing</span>
                        </h1>
                        <p className="mt-2 text-sm md:text-base text-muted font-bold opacity-80 leading-relaxed italic uppercase tracking-tight">
                            Publish a new component to the global technician network.
                        </p>
                    </div>
                </div>
            </header>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-10">
                {/* Main Content Sections */}
                <div className="flex flex-col gap-10">
                    {/* General Information */}
                    <section className="p-10 rounded-[40px] border border-border bg-card/20 backdrop-blur-xl group relative overflow-hidden">
                        <div className="flex items-center gap-4 mb-10">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                                <Package size={20} />
                            </div>
                            <h3 className="text-xl font-black text-foreground italic uppercase tracking-tight">Component Identity</h3>
                        </div>

                        <div className="space-y-8">
                            <FormInput
                                label="Listing Title"
                                required
                                placeholder="e.g. Front Performance Brake Pads"
                                value={form.name}
                                onChange={(v) => setForm({ ...form, name: v })}
                                icon={<Package size={18} />}
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <FormSelect
                                    label="Component Category"
                                    required
                                    options={CATEGORIES}
                                    value={form.category}
                                    onChange={(v) => setForm({ ...form, category: v })}
                                    icon={<Layers size={18} />}
                                />
                                <FormSelect
                                    label="Vehicle Compatibility"
                                    required
                                    options={VEHICLE_TYPES}
                                    value={form.compatibleModels[0] || ''}
                                    onChange={(v) => setForm({ ...form, compatibleModels: [v] })}
                                    icon={<Truck size={18} />}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <FormInput
                                    label="Brand / Manufacturer"
                                    placeholder="e.g. Bosch, Brembo, Generic"
                                    value={form.brand}
                                    onChange={(v) => setForm({ ...form, brand: v })}
                                    icon={<Zap size={18} />}
                                />
                                <FormInput
                                    label="Part Number / SKU"
                                    placeholder="e.g. P/N-123456"
                                    value={form.partNumber}
                                    onChange={(v) => setForm({ ...form, partNumber: v })}
                                    icon={<FileText size={18} />}
                                />
                            </div>

                            <div className="space-y-6">
                                <label className="px-1 text-[10px] font-black uppercase tracking-[0.2em] text-muted opacity-60 flex justify-between items-center">
                                    <span>Product Assets (Images, Videos, Audio)</span>
                                    <span className="text-primary italic">Cloud Synced</span>
                                </label>

                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                    {/* Existing Images */}
                                    {form.images.map((img, idx) => (
                                        <div key={`img-${idx}`} className="group relative aspect-square rounded-2xl overflow-hidden border border-border bg-card/40">
                                            <img src={img.url} className="w-full h-full object-cover" alt="Asset" />
                                            <button
                                                type="button"
                                                onClick={() => removeAsset('images', idx)}
                                                className="absolute top-2 right-2 bg-black/60 backdrop-blur-md p-1.5 rounded-lg text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                                            >
                                                <X size={14} />
                                            </button>
                                            {idx === 0 && (
                                                <div className="absolute bottom-0 left-0 right-0 bg-primary/80 text-[8px] font-black text-white text-center py-1 uppercase tracking-widest">
                                                    Main
                                                </div>
                                            )}
                                        </div>
                                    ))}

                                    {/* Existing Videos */}
                                    {form.videos.map((vid, idx) => (
                                        <div key={`vid-${idx}`} className="group relative aspect-square rounded-2xl overflow-hidden border border-border bg-blue-500/10 flex items-center justify-center">
                                            <div className="flex flex-col items-center gap-1">
                                                <Upload size={20} className="text-blue-500" />
                                                <span className="text-[8px] font-black uppercase text-blue-500">Video</span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => removeAsset('videos', idx)}
                                                className="absolute top-2 right-2 bg-black/60 backdrop-blur-md p-1.5 rounded-lg text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    ))}

                                    {/* Existing Audio */}
                                    {form.audio.map((aud, idx) => (
                                        <div key={`aud-${idx}`} className="group relative aspect-square rounded-2xl overflow-hidden border border-border bg-indigo-500/10 flex items-center justify-center">
                                            <div className="flex flex-col items-center gap-1">
                                                <Layers size={20} className="text-indigo-500" />
                                                <span className="text-[8px] font-black uppercase text-indigo-500">Audio</span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => removeAsset('audio', idx)}
                                                className="absolute top-2 right-2 bg-black/60 backdrop-blur-md p-1.5 rounded-lg text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    ))}

                                    {/* Upload Button */}
                                    <button
                                        type="button"
                                        onClick={() => !isUploading && fileInputRef.current?.click()}
                                        className={cn(
                                            "aspect-square rounded-2xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-2 hover:border-primary/50 hover:bg-primary/5 transition-all",
                                            isUploading && "animate-pulse"
                                        )}
                                    >
                                        {isUploading ? (
                                            <Loader2 size={24} className="animate-spin text-primary" />
                                        ) : (
                                            <>
                                                <PlusCircle size={24} className="text-muted" />
                                                <span className="text-[10px] font-black uppercase text-muted tracking-tighter">Add More</span>
                                            </>
                                        )}
                                    </button>
                                </div>

                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    multiple
                                    accept="image/*,video/*,audio/*"
                                    onChange={handleUpload}
                                />
                            </div>

                            <FormInput
                                label="Asset Cloud URL"
                                placeholder="https://..."
                                value={form.image}
                                onChange={(v) => setForm({ ...form, image: v })}
                                icon={<FileText size={18} />}
                            />
                        </div>
                    </section>

                    {/* Financials & Stock */}
                    <section className="p-10 rounded-[40px] border border-border bg-card/20 backdrop-blur-xl group relative overflow-hidden">
                        <div className="flex items-center gap-4 mb-10">
                            <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center text-green-500 border border-green-500/20">
                                <IndianRupee size={20} />
                            </div>
                            <h3 className="text-xl font-black text-foreground italic uppercase tracking-tight">Valuation & Stock</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <FormInput
                                label="Unit Value (INR)"
                                required
                                type="number"
                                placeholder="0.00"
                                value={form.price}
                                onChange={(v) => setForm({ ...form, price: v })}
                                icon={<IndianRupee size={18} />}
                            />
                            <FormInput
                                label="Warehouse Quantity"
                                required
                                type="number"
                                placeholder="Total units available"
                                value={form.quantity}
                                onChange={(v) => setForm({ ...form, quantity: v })}
                                icon={<Warehouse size={18} />}
                            />
                        </div>
                    </section>

                    {/* Specification Description */}
                    <section className="p-10 rounded-[40px] border border-border bg-card/20 backdrop-blur-xl group relative overflow-hidden">
                        <div className="flex items-center gap-4 mb-10">
                            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 border border-indigo-500/20">
                                <FileText size={20} />
                            </div>
                            <h3 className="text-xl font-black text-foreground italic uppercase tracking-tight">Technical Specification</h3>
                        </div>

                        <div className="relative group">
                            <label className="absolute left-6 top-6 text-primary opacity-40 group-focus-within:opacity-100 transition-opacity">
                                <FileText size={20} />
                            </label>
                            <textarea
                                value={form.description}
                                onChange={(e) => setForm({ ...form, description: e.target.value })}
                                placeholder="Detail dimensions, material specs, or specific engine compatibility codes..."
                                className="w-full min-h-[200px] bg-card/40 border border-border rounded-[28px] py-6 pl-16 pr-8 text-sm font-bold outline-none focus:border-primary/50 transition-all placeholder:text-muted/40 placeholder:italic resize-none leading-relaxed"
                            />
                        </div>
                    </section>
                </div>

                {/* Submission Control */}
                <div className="flex flex-col sm:flex-row items-center gap-6">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="w-full sm:w-1/3 py-5 bg-card border border-border rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] text-muted hover:text-foreground hover:bg-card/60 transition-all active:scale-95 italic text-center"
                    >
                        Discard Setup
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting || isLoading}
                        className="w-full sm:w-2/3 py-5 bg-primary text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-primary/30 transition-all hover:-translate-y-1 hover:brightness-110 active:scale-95 italic flex items-center justify-center gap-4"
                    >
                        {isSubmitting || isLoading ? (
                            <Loader2 size={24} className="animate-spin text-white" />
                        ) : (
                            <>
                                <Save size={20} />
                                Sync & Publish Listing
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}

interface FormInputProps {
    label: string;
    placeholder?: string;
    value: string;
    onChange: (v: string) => void;
    icon: React.ReactNode;
    required?: boolean;
    type?: string;
}

function FormInput({ label, placeholder, value, onChange, icon, required = false, type = "text" }: FormInputProps) {
    return (
        <div className="space-y-3 flex-1 group">
            <label className="px-1 text-[10px] font-black uppercase tracking-[0.2em] text-muted opacity-60">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <div className="relative">
                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-primary opacity-40 group-focus-within:opacity-100 transition-opacity">
                    {icon}
                </div>
                <input
                    type={type}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    className="w-full bg-card/40 border border-border rounded-2xl py-4.5 pl-14 pr-6 text-sm font-black outline-none focus:border-primary/50 transition-all placeholder:text-muted/30 placeholder:italic"
                />
            </div>
        </div>
    );
}

interface FormSelectProps {
    label: string;
    value: string;
    onChange: (v: string) => void;
    icon: React.ReactNode;
    options: string[];
    required?: boolean;
}

function FormSelect({ label, value, onChange, icon, options, required = false }: FormSelectProps) {
    return (
        <div className="space-y-3 flex-1 group">
            <label className="px-1 text-[10px] font-black uppercase tracking-[0.2em] text-muted opacity-60">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <div className="relative">
                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-primary opacity-40 group-focus-within:opacity-100 transition-opacity pointer-events-none z-10">
                    {icon}
                </div>
                <select
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full bg-card/40 border border-border rounded-2xl py-4.5 pl-14 pr-12 text-sm font-black outline-none focus:border-primary/50 transition-all appearance-none cursor-pointer relative z-0 italic"
                >
                    {options.map((opt: string) => (
                        <option key={opt} value={opt} className="bg-background text-foreground uppercase tracking-widest font-black text-[10px]">{opt}</option>
                    ))}
                </select>
                <div className="absolute right-6 top-1/2 -translate-y-1/2 text-muted opacity-40 pointer-events-none">
                    <ChevronDown size={14} />
                </div>
            </div>
        </div>
    );
}
