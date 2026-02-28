'use client';

import { useState, useRef, useEffect } from 'react';
import {
    Package,
    IndianRupee,
    FileText,
    Save,
    Loader2,
    Settings,
    Plus,
    Trash2,
    Image as ImageIcon,
    X,
    ChevronDown
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { uploadService } from '@/services/uploadService';

const CATEGORIES = [
    'Batteries', 'Tires', 'Engine Oil', 'Brakes', 'Lights',
    'Filters', 'Accessories', 'Spare Parts', 'Lubricants',
    'Suspension', 'Electrical'
];

const VEHICLE_TYPES = ['2W', '3W', '4W', 'Commercial'];
const FUEL_TYPES = ['Petrol', 'Diesel', 'Electric', 'Hybrid'];
const GST_RATES = [0, 5, 12, 18, 28];

interface ProductFormProps {
    initialData?: any;
    onSubmit: (data: any) => Promise<void>;
    isSubmitting: boolean;
    buttonText: string;
}

export function ProductForm({ initialData, onSubmit, isSubmitting, buttonText }: ProductFormProps) {
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [form, setForm] = useState({
        name: '',
        brand: '',
        gtinHsn: '',
        modelNumber: '',
        mfgDate: '',
        category: 'Spare Parts',
        fuelType: [] as string[],
        vehicleType: [] as string[],
        compatibility: [] as { model: string, fromYear: string, toYear: string, engineType: string }[],
        warranty: { available: false, period: '', unit: 'Months' },
        guarantee: { available: false, period: '', unit: 'Months' },
        costPrice: '',
        price: '',
        mrp: '',
        gst: 0,
        stock: '',
        minStockLevel: '5',
        image: '',
        images: [] as { url: string }[],
        shortDescription: '',
    });

    useEffect(() => {
        if (initialData) {
            setForm({
                ...form,
                ...initialData,
                costPrice: initialData.costPrice?.toString() || '',
                price: (initialData.price || initialData.sellingPrice)?.toString() || '',
                mrp: initialData.mrp?.toString() || '',
                stock: (initialData.stock || initialData.quantity)?.toString() || '',
                minStockLevel: initialData.minStockLevel?.toString() || '5',
                images: Array.isArray(initialData.images)
                    ? initialData.images.map((img: any) => typeof img === 'string' ? { url: img } : img)
                    : initialData.image ? [{ url: initialData.image }] : [],
                compatibility: (initialData.compatibility || initialData.compatibleModels || []).map((c: any) => {
                    if (typeof c === 'string') return { model: c, fromYear: '', toYear: '', engineType: '' };
                    return {
                        model: c.model || '',
                        fromYear: c.yearRange?.from || c.fromYear || '',
                        toYear: c.yearRange?.to || c.toYear || '',
                        engineType: c.engineType || ''
                    };
                })
            });
        }
    }, [initialData]);

    const [metrics, setMetrics] = useState({
        margin: 0,
        marginPercent: 0,
        gstAmount: 0,
        finalPrice: 0
    });

    useEffect(() => {
        const cost = parseFloat(form.costPrice) || 0;
        const selling = parseFloat(form.price) || 0;
        const gstRate = form.gst || 0;

        const margin = selling - cost;
        const marginPercent = cost > 0 ? (margin / cost) * 100 : 0;
        const gstAmount = (selling * gstRate) / 100;
        const finalPrice = selling + gstAmount;

        setMetrics({ margin, marginPercent, gstAmount, finalPrice });
    }, [form.costPrice, form.price, form.gst]);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        setIsUploading(true);
        const toastId = toast.loading(`Uploading assets...`);

        try {
            const results = await Promise.all(
                files.map(file => uploadService.uploadFile(file))
            );

            setForm(prev => {
                const newImages = [...prev.images, ...results.filter(r => r.category === 'images')];
                return {
                    ...prev,
                    images: newImages.slice(0, 5),
                    image: newImages.length > 0 ? newImages[0].url : prev.image,
                };
            });

            toast.success('Upload complete', { id: toastId });
        } catch (error: any) {
            toast.error('Upload failed', { id: toastId });
        } finally {
            setIsUploading(false);
            if (e.target) e.target.value = '';
        }
    };

    const toggleArrayItem = (field: 'fuelType' | 'vehicleType', value: string) => {
        setForm(prev => ({
            ...prev,
            [field]: prev[field].includes(value)
                ? prev[field].filter(v => v !== value)
                : [...prev[field], value]
        }));
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // High-level validation
        if (!form.name || form.name.length < 3) return toast.error('Name is too short');
        if (!form.image) return toast.error('Primary product image is required');
        if (!form.price) return toast.error('Selling price is required');
        if (!form.mrp) return toast.error('MRP is required');
        if (!form.category) return toast.error('Category is required');

        // Prepare surgical payload to match Product.js schema exactly
        const payload: any = {
            name: form.name.trim(),
            brand: form.brand.trim() || 'Generic',
            category: form.category,
            // Main fields
            price: parseFloat(form.price),
            sellingPrice: parseFloat(form.price), // Alias for backward compatibility
            mrp: parseFloat(form.mrp),
            stock: parseInt(form.stock) || 0,
            quantity: parseInt(form.stock) || 0, // Alias for backward compatibility
            minStockLevel: parseInt(form.minStockLevel) || 5,

            // Media
            image: form.image,
            images: form.images.map(img => img.url),

            // Tax & Specs
            gst: Number(form.gst) || 18,
            fuelType: form.fuelType.length > 0 ? form.fuelType : undefined,
            vehicleType: form.vehicleType.length > 0 ? form.vehicleType : undefined,
            shortDescription: form.shortDescription.trim() || '',

            // Identity
            modelNumber: form.modelNumber.trim() || undefined,
            gtinHsn: form.gtinHsn.trim() || undefined,
            sku: (form.modelNumber?.trim() || form.name?.trim()?.slice(0, 5)?.toUpperCase() + '-' + Date.now().toString().slice(-4)),

            // Compatibility - Backend expects object with model/fromYear/toYear/engineType
            compatibility: form.compatibility
                .filter(c => c.model && c.model.trim())
                .map(c => ({
                    model: c.model.trim(),
                    fromYear: String(c.fromYear || '').trim(),
                    toYear: String(c.toYear || '').trim(),
                    engineType: String(c.engineType || '').trim()
                }))
        };

        // Handle MF Date
        if (form.mfgDate && form.mfgDate !== '') {
            payload.mfgDate = form.mfgDate;
        }

        // Warranty / Guarantee
        if (form.warranty.available) {
            payload.warranty = {
                available: true,
                period: parseInt(form.warranty.period || '0') || 0,
                unit: form.warranty.unit || 'Months'
            };
        }

        if (form.guarantee.available) {
            payload.guarantee = {
                available: true,
                period: parseInt(form.guarantee.period || '0') || 0,
                unit: form.guarantee.unit || 'Months'
            };
        }

        console.log('[ProductForm] Dispatching Payload:', JSON.stringify(payload, null, 2));

        try {
            await onSubmit(payload);
        } catch (error: any) {
            console.error('[ProductForm] Submission Error Detail:', error.response?.data);
            throw error; // Let the page component catch it for the toast
        }
    };

    return (
        <form onSubmit={handleFormSubmit} className="max-w-4xl mx-auto space-y-6">
            <Section title="General Information" icon={<Package size={18} />}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormInput
                        label="Product Name"
                        required
                        placeholder="Premium Gear"
                        value={form.name}
                        onChange={(v: any) => setForm({ ...form, name: v })}
                    />
                    <FormInput
                        label="Brand"
                        required
                        placeholder="OEM"
                        value={form.brand}
                        onChange={(v: any) => setForm({ ...form, brand: v })}
                    />
                    <FormInput
                        label="Model Number / Part No."
                        placeholder="MN-1234"
                        value={form.modelNumber}
                        onChange={(v: any) => setForm({ ...form, modelNumber: v })}
                    />
                    <FormInput
                        label="GTIN / HSN Code"
                        placeholder="8708.xx.xx"
                        value={form.gtinHsn}
                        onChange={(v: any) => setForm({ ...form, gtinHsn: v })}
                    />
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-gray-700">Category</label>
                        <select
                            className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500/20 outline-none"
                            value={form.category}
                            onChange={(e) => setForm({ ...form, category: e.target.value })}
                        >
                            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                </div>
            </Section>

            <Section title="Specifications" icon={<Settings size={18} />}>
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-gray-700">Fuel Type</label>
                            <div className="flex flex-wrap gap-2">
                                {FUEL_TYPES.map(f => (
                                    <button
                                        key={f} type="button"
                                        onClick={() => toggleArrayItem('fuelType', f)}
                                        className={cn(
                                            "px-3 py-1.5 rounded-md text-xs font-medium border transition-all",
                                            form.fuelType.includes(f)
                                                ? "bg-orange-500 border-orange-500 text-white"
                                                : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
                                        )}
                                    >{f}</button>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-gray-700">Vehicle Category</label>
                            <div className="flex flex-wrap gap-2">
                                {VEHICLE_TYPES.map(v => (
                                    <button
                                        key={v} type="button"
                                        onClick={() => toggleArrayItem('vehicleType', v)}
                                        className={cn(
                                            "px-3 py-1.5 rounded-md text-xs font-medium border transition-all",
                                            form.vehicleType.includes(v)
                                                ? "bg-slate-800 border-slate-800 text-white"
                                                : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
                                        )}
                                    >{v}</button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-gray-100">
                        <div className="flex items-center justify-between mb-3 text-xs font-bold text-gray-700 uppercase tracking-widest">
                            Compatibility
                            <button
                                type="button"
                                onClick={() => setForm(p => ({ ...p, compatibility: [...p.compatibility, { model: '', fromYear: '', toYear: '', engineType: '' }] }))}
                                className="text-orange-600 flex items-center gap-1 hover:underline"
                            >
                                <Plus size={14} /> Add Model
                            </button>
                        </div>
                        <div className="space-y-3">
                            {form.compatibility.map((c, i) => (
                                <div key={i} className="flex flex-col md:flex-row gap-2 items-start md:items-center bg-gray-50/50 p-2 rounded-lg border border-gray-100">
                                    <input
                                        placeholder="Car Model (e.g. Swift)"
                                        className="flex-[2] w-full bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:ring-1 focus:ring-orange-500/20 outline-none"
                                        value={c.model}
                                        onChange={e => {
                                            const nl = [...form.compatibility]; nl[i].model = e.target.value;
                                            setForm({ ...form, compatibility: nl });
                                        }}
                                    />
                                    <div className="flex items-center gap-1 flex-1 w-full">
                                        <input
                                            placeholder="From"
                                            className="w-full bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-xs outline-none"
                                            value={c.fromYear}
                                            onChange={e => {
                                                const nl = [...form.compatibility]; nl[i].fromYear = e.target.value;
                                                setForm({ ...form, compatibility: nl });
                                            }}
                                        />
                                        <span className="text-gray-400 text-[10px]">-</span>
                                        <input
                                            placeholder="To"
                                            className="w-full bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-xs outline-none"
                                            value={c.toYear}
                                            onChange={e => {
                                                const nl = [...form.compatibility]; nl[i].toYear = e.target.value;
                                                setForm({ ...form, compatibility: nl });
                                            }}
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setForm(p => ({ ...p, compatibility: p.compatibility.filter((_, idx) => idx !== i) }))}
                                        className="p-1.5 text-gray-300 hover:text-red-500 transition-colors"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </Section>

            <Section title="Pricing & Inventory" icon={<IndianRupee size={18} />}>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                    <FormInput label="Cost Price" type="number" value={form.costPrice} onChange={(v: any) => setForm({ ...form, costPrice: v })} />
                    <FormInput label="Selling Price" required type="number" value={form.price} onChange={(v: any) => setForm({ ...form, price: v })} />
                    <FormInput label="MRP" required type="number" value={form.mrp} onChange={(v: any) => setForm({ ...form, mrp: v })} />
                    <FormInput label="In Stock" type="number" value={form.stock} onChange={(v: any) => setForm({ ...form, stock: v })} />
                    <div className="space-y-1.5 w-full">
                        <label className="text-xs font-medium text-gray-700">GST (%)</label>
                        <select
                            className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500/20 outline-none transition-all"
                            value={form.gst}
                            onChange={(e) => setForm({ ...form, gst: parseInt(e.target.value) })}
                        >
                            {GST_RATES.map(r => <option key={r} value={r}>{r}%</option>)}
                        </select>
                    </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 flex justify-between text-xs font-medium text-gray-500 border border-gray-100">
                    <span>Margin: <span className="text-orange-600 font-bold">₹{metrics.margin.toFixed(0)}</span></span>
                    <span>GST Amount: <span className="text-gray-800 font-bold">₹{metrics.gstAmount.toFixed(0)}</span></span>
                    <span>Landing Price: <span className="text-gray-950 font-bold">₹{metrics.finalPrice.toFixed(0)}</span></span>
                </div>
            </Section>

            <Section title="Warranty & Guarantee" icon={<FileText size={18} />}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="warranty"
                                checked={form.warranty.available}
                                onChange={e => setForm({ ...form, warranty: { ...form.warranty, available: e.target.checked } })}
                                className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                            />
                            <label htmlFor="warranty" className="text-xs font-bold text-gray-700 uppercase">Brand Warranty</label>
                        </div>
                        {form.warranty.available && (
                            <div className="flex gap-2 animate-in fade-in slide-in-from-top-1 duration-200">
                                <input
                                    type="number"
                                    placeholder="Period"
                                    className="flex-1 bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none"
                                    value={form.warranty.period}
                                    onChange={e => setForm({ ...form, warranty: { ...form.warranty, period: e.target.value } })}
                                />
                                <select
                                    className="bg-white border border-gray-200 rounded-lg px-2 py-2 text-sm outline-none"
                                    value={form.warranty.unit}
                                    onChange={e => setForm({ ...form, warranty: { ...form.warranty, unit: e.target.value } })}
                                >
                                    <option value="Months">Months</option>
                                    <option value="Years">Years</option>
                                </select>
                            </div>
                        )}
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="guarantee"
                                checked={form.guarantee.available}
                                onChange={e => setForm({ ...form, guarantee: { ...form.guarantee, available: e.target.checked } })}
                                className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                            />
                            <label htmlFor="guarantee" className="text-xs font-bold text-gray-700 uppercase">Satisfaction Guarantee</label>
                        </div>
                        {form.guarantee.available && (
                            <div className="flex gap-2 animate-in fade-in slide-in-from-top-1 duration-200">
                                <input
                                    type="number"
                                    placeholder="Period"
                                    className="flex-1 bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none"
                                    value={form.guarantee.period}
                                    onChange={e => setForm({ ...form, guarantee: { ...form.guarantee, period: e.target.value } })}
                                />
                                <select
                                    className="bg-white border border-gray-200 rounded-lg px-2 py-2 text-sm outline-none"
                                    value={form.guarantee.unit}
                                    onChange={e => setForm({ ...form, guarantee: { ...form.guarantee, unit: e.target.value } })}
                                >
                                    <option value="Months">Months</option>
                                    <option value="Years">Years</option>
                                </select>
                            </div>
                        )}
                    </div>
                </div>
            </Section>

            <Section title="Media Gallery" icon={<ImageIcon size={18} />}>
                <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                    {form.images.map((img, idx) => (
                        <div key={idx} className="relative aspect-square rounded-lg border border-gray-200 overflow-hidden group">
                            <img src={img.url} className="w-full h-full object-cover" />
                            <button
                                type="button"
                                onClick={() => setForm({ ...form, images: form.images.filter((_, i) => i !== idx) })}
                                className="absolute top-1 right-1 p-1 bg-white border rounded shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <X size={12} className="text-red-500" />
                            </button>
                            {idx === 0 && <div className="absolute bottom-0 left-0 right-0 bg-orange-500 text-[8px] text-white text-center font-bold py-0.5 uppercase">Primary</div>}
                        </div>
                    ))}
                    {form.images.length < 5 && (
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="aspect-square rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-400 hover:text-orange-500 hover:border-orange-500 transition-all"
                        >
                            <Plus size={20} />
                        </button>
                    )}
                </div>
            </Section>

            <Section title="Product Description" icon={<FileText size={18} />}>
                <div className="space-y-1">
                    <textarea
                        rows={3}
                        placeholder="Brief description..."
                        maxLength={150}
                        value={form.shortDescription}
                        onChange={(e) => setForm({ ...form, shortDescription: e.target.value })}
                        className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-orange-500/20 outline-none resize-none"
                    />
                    <div className="flex justify-end">
                        <span className={cn(
                            "text-[10px] font-medium",
                            form.shortDescription.length > 140 ? "text-orange-500" : "text-gray-400"
                        )}>
                            {form.shortDescription.length}/150
                        </span>
                    </div>
                </div>
            </Section>

            <div className="flex justify-end gap-3 pt-2">
                <button
                    type="submit"
                    disabled={isSubmitting || isUploading}
                    className="bg-slate-900 text-white px-8 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-slate-800 disabled:opacity-50 transition-all shadow-sm"
                >
                    {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                    {buttonText}
                </button>
            </div>

            <input type="file" ref={fileInputRef} hidden multiple accept="image/*" onChange={e => handleUpload(e)} />
        </form>
    );
}

function Section({ title, icon, children }: { title: string, icon: any, children: React.ReactNode }) {
    return (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            <div className="px-4 py-3 bg-gray-50/50 border-b border-gray-100 flex items-center gap-2">
                <div className="text-orange-600">{icon}</div>
                <h3 className="text-xs font-bold text-gray-800 uppercase tracking-widest">{title}</h3>
            </div>
            <div className="p-4">{children}</div>
        </div>
    );
}

function FormInput({ label, required, value, onChange, type = "text", placeholder }: any) {
    return (
        <div className="space-y-1.5 w-full">
            <label className="text-xs font-medium text-gray-700">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <input
                type={type}
                value={value}
                onChange={e => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500/20 outline-none transition-all placeholder:text-gray-300"
            />
        </div>
    );
}


