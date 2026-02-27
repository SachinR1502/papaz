'use client';

import { useSupplier } from '@/context/SupplierContext';
import { useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
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
    X,
    Calendar,
    Settings,
    ShieldCheck,
    Tag,
    Info,
    AlertTriangle,
    Plus,
    Trash2,
    BookOpen
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { uploadService, UploadResult } from '@/services/uploadService';

const CATEGORIES = [
    'Batteries', 'Tires', 'Engine Oil', 'Brakes', 'Lights',
    'Filters', 'Accessories', 'Spare Parts', 'Lubricants',
    'Suspension', 'Electrical'
];

const VEHICLE_TYPES = ['2W', '3W', '4W', 'Commercial'];
const FUEL_TYPES = ['Petrol', 'Diesel', 'Electric', 'Hybrid'];
const GST_RATES = [0, 5, 12, 18, 28];
const WARRANTY_UNITS = ['Months', 'Years'];

export default function AddProductPage() {
    const { addProduct, isLoading } = useSupplier();
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const brochureInputRef = useRef<HTMLInputElement>(null);

    const [form, setForm] = useState({
        // 1. Basic Info
        name: '',
        brand: '',
        sku: '',
        gtinHsn: '',
        modelNumber: '',
        mfgDate: '',
        category: 'Spare Parts',

        // 2 & 3. Category & Compatibility
        fuelType: [] as string[],
        vehicleType: [] as string[],
        compatibility: [] as { model: string, fromYear: string, toYear: string, engineType: string }[],

        // 4. Warranty & Guarantee
        warranty: { available: false, period: '', unit: 'Months' },
        guarantee: { available: false, period: '', unit: 'Months' },

        // 5. Pricing
        costPrice: '',
        price: '', // Selling Price
        mrp: '',
        gst: 18,

        // 6. Inventory
        stock: '',
        minStockLevel: '5',
        warehouseLocation: '',

        // 7. Media
        image: '', // Primary
        images: [] as UploadResult[],
        video: '',
        brochure: '',

        // 8. Description
        shortDescription: '',
        description: '',
        specifications: '',
        installationInstructions: '',

        // 9. SEO
        metaTitle: '',
        metaDescription: '',
        tags: [] as string[],
        tagInput: ''
    });

    // Auto-calculate Margin & Final Price
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

        setMetrics({
            margin,
            marginPercent,
            gstAmount,
            finalPrice
        });
    }, [form.costPrice, form.price, form.gst]);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, isBrochure = false) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        setIsUploading(true);
        const toastId = toast.loading(`Syncing assets to cloud...`);

        try {
            const results = await Promise.all(
                files.map(file => uploadService.uploadFile(file))
            );

            if (isBrochure) {
                setForm(prev => ({ ...prev, brochure: results[0].url }));
            } else {
                setForm(prev => {
                    const newImages = [...prev.images, ...results.filter(r => r.category === 'images')];
                    const newVideo = results.find(r => r.category === 'videos')?.url || prev.video;

                    return {
                        ...prev,
                        images: newImages.slice(0, 5), // Max 5
                        image: newImages.length > 0 ? newImages[0].url : prev.image,
                        video: newVideo
                    };
                });
            }

            toast.success('Cloud Synced', { id: toastId });
        } catch (error: any) {
            toast.error('Sync Failed', { id: toastId });
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

    const addCompatibility = () => {
        setForm(prev => ({
            ...prev,
            compatibility: [...prev.compatibility, { model: '', fromYear: '', toYear: '', engineType: '' }]
        }));
    };

    const removeCompatibility = (index: number) => {
        setForm(prev => ({
            ...prev,
            compatibility: prev.compatibility.filter((_, i) => i !== index)
        }));
    };

    const handleTagKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && form.tagInput.trim()) {
            e.preventDefault();
            if (!form.tags.includes(form.tagInput.trim())) {
                setForm(prev => ({
                    ...prev,
                    tags: [...prev.tags, prev.tagInput.trim()],
                    tagInput: ''
                }));
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!form.name || form.name.length < 3) return toast.error('Check Product Name (min 3 chars)');
        if (!form.sku) return toast.error('SKU Code is Mandatory');
        if (!form.costPrice || !form.price || !form.mrp) return toast.error('Pricing data incomplete');
        if (parseFloat(form.price) > parseFloat(form.mrp)) return toast.error('Selling price cannot exceed MRP');

        setIsSubmitting(true);
        try {
            await addProduct({
                ...form,
                costPrice: parseFloat(form.costPrice),
                price: parseFloat(form.price),
                mrp: parseFloat(form.mrp),
                stock: parseInt(form.stock) || 0,
                minStockLevel: parseInt(form.minStockLevel) || 5,
                images: form.images.map(img => img.url),
                compatibility: form.compatibility // Assuming model supports this structure
            });
            toast.success('Listing Published Successfully');
            router.push('/supplier/inventory');
        } catch (err) {
            toast.error('Publishing Internal Error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto flex flex-col gap-10 md:gap-14 animate-fade-in pb-20 p-4 md:p-0">
            {/* Clean Header */}
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                    <button
                        onClick={() => router.back()}
                        className="w-12 h-12 rounded-2xl bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:text-orange-500 transition-all active:scale-90 shadow-sm"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-3xl font-black tracking-tight text-gray-900 italic uppercase">New <span className="text-orange-600">Product</span></h1>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Expansion Protocol: Manual Entry</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="px-4 py-2 bg-orange-50 border border-orange-100 rounded-xl">
                        <span className="text-[10px] font-black uppercase text-orange-600 tracking-widest">Status: Draft</span>
                    </div>
                </div>
            </header>

            <form onSubmit={handleSubmit} className="space-y-10">

                {/* 1. Basic Information */}
                <Section title="Basic Identity" icon={<Package size={18} />}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <FormInput
                            label="Product Name"
                            required
                            placeholder="e.g. Premium Hub Gear"
                            value={form.name}
                            onChange={(v: any) => setForm({ ...form, name: v })}
                        />
                        <FormInput
                            label="Brand Name"
                            required
                            placeholder="e.g. Bosch / OEM"
                            value={form.brand}
                            onChange={(v: any) => setForm({ ...form, brand: v })}
                        />
                        <FormInput
                            label="SKU Code"
                            required
                            placeholder="Unique SKU for tracking"
                            value={form.sku}
                            onChange={(v: any) => setForm({ ...form, sku: v })}
                        />
                        <FormInput
                            label="Model Number"
                            placeholder="Alphanumeric Model ID"
                            value={form.modelNumber}
                            onChange={(v: any) => setForm({ ...form, modelNumber: v })}
                        />
                        <FormInput
                            label="GTIN / HSN"
                            type="number"
                            placeholder="HSN Code for Invoicing"
                            value={form.gtinHsn}
                            onChange={(v: any) => setForm({ ...form, gtinHsn: v })}
                        />
                        <FormInput
                            label="Manufacturing Date"
                            type="date"
                            value={form.mfgDate}
                            max={new Date().toISOString().split('T')[0]}
                            onChange={(v: any) => setForm({ ...form, mfgDate: v })}
                        />
                    </div>
                </Section>

                {/* 2 & 3. Category & Compatibility */}
                <Section title="Configuration & Compatibility" icon={<Settings size={18} />}>
                    <div className="space-y-10">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4 block">Fuel Compatibility</label>
                                <div className="flex flex-wrap gap-3">
                                    {FUEL_TYPES.map(f => (
                                        <button
                                            key={f} type="button"
                                            onClick={() => toggleArrayItem('fuelType', f)}
                                            className={cn(
                                                "px-4 py-2 rounded-xl text-[10px] font-bold uppercase transition-all border",
                                                form.fuelType.includes(f) ? "bg-orange-600 border-orange-600 text-white" : "bg-white border-gray-200 text-gray-400 hover:border-gray-400"
                                            )}
                                        >{f}</button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4 block">Vehicle Class</label>
                                <div className="flex flex-wrap gap-3">
                                    {VEHICLE_TYPES.map(v => (
                                        <button
                                            key={v} type="button"
                                            onClick={() => toggleArrayItem('vehicleType', v)}
                                            className={cn(
                                                "px-4 py-2 rounded-xl text-[10px] font-bold uppercase transition-all border",
                                                form.vehicleType.includes(v) ? "bg-zinc-900 border-zinc-900 text-white" : "bg-white border-gray-200 text-gray-400 hover:border-gray-400"
                                            )}
                                        >{v}</button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-6">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Suitalbe Models (Matrix)</label>
                                <button type="button" onClick={addCompatibility} className="text-[10px] font-black uppercase text-orange-600 flex items-center gap-1 hover:underline">
                                    <Plus size={14} /> Add Entry
                                </button>
                            </div>
                            <div className="space-y-4">
                                {form.compatibility.map((c, i) => (
                                    <div key={i} className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_1fr_auto] gap-3 p-4 bg-gray-50 rounded-[20px] border border-gray-100 items-end">
                                        <div className="w-full">
                                            <input
                                                placeholder="Vehicle Model Name"
                                                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-xs font-bold outline-none"
                                                value={c.model}
                                                onChange={e => {
                                                    const newList = [...form.compatibility];
                                                    newList[i].model = e.target.value;
                                                    setForm({ ...form, compatibility: newList });
                                                }}
                                            />
                                        </div>
                                        <input
                                            placeholder="From Year"
                                            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-xs font-bold outline-none"
                                            value={c.fromYear}
                                            onChange={e => {
                                                const newList = [...form.compatibility];
                                                newList[i].fromYear = e.target.value;
                                                setForm({ ...form, compatibility: newList });
                                            }}
                                        />
                                        <input
                                            placeholder="To Year"
                                            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-xs font-bold outline-none"
                                            value={c.toYear}
                                            onChange={e => {
                                                const newList = [...form.compatibility];
                                                newList[i].toYear = e.target.value;
                                                setForm({ ...form, compatibility: newList });
                                            }}
                                        />
                                        <select
                                            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-xs font-bold outline-none"
                                            value={c.engineType}
                                            onChange={e => {
                                                const newList = [...form.compatibility];
                                                newList[i].engineType = e.target.value;
                                                setForm({ ...form, compatibility: newList });
                                            }}
                                        >
                                            <option value="">Engine Type</option>
                                            <option value="Standard">Standard</option>
                                            <option value="V4">V4</option>
                                            <option value="V6">V6</option>
                                            <option value="V8">V8</option>
                                            <option value="EV Motor">EV Motor</option>
                                        </select>
                                        <button type="button" onClick={() => removeCompatibility(i)} className="p-3 text-red-400 hover:text-red-500 transition-colors flex justify-center">
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </Section>

                {/* 4. Warranty */}
                <Section title="Protection Matrix" icon={<ShieldCheck size={18} />}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        <div className="p-6 rounded-3xl border border-gray-100 bg-gray-50/50">
                            <div className="flex items-center justify-between mb-6">
                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-900">Warranty Coverage</span>
                                <Toggle
                                    checked={form.warranty.available}
                                    onChange={(v: any) => setForm({ ...form, warranty: { ...form.warranty, available: v } })}
                                />
                            </div>
                            {form.warranty.available && (
                                <div className="flex gap-4">
                                    <input
                                        type="number" placeholder="Period"
                                        className="flex-1 bg-white border border-gray-200 rounded-xl px-4 py-3 text-xs font-bold outline-none"
                                        value={form.warranty.period}
                                        onChange={e => setForm({ ...form, warranty: { ...form.warranty, period: e.target.value } })}
                                    />
                                    <select
                                        className="w-1/3 bg-white border border-gray-200 rounded-xl px-4 py-3 text-[10px] font-black uppercase outline-none"
                                        value={form.warranty.unit}
                                        onChange={e => setForm({ ...form, warranty: { ...form.warranty, unit: e.target.value } })}
                                    >
                                        {WARRANTY_UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                                    </select>
                                </div>
                            )}
                        </div>

                        <div className="p-6 rounded-3xl border border-gray-100 bg-gray-50/50">
                            <div className="flex items-center justify-between mb-6">
                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-900">Guarantee Seal</span>
                                <Toggle
                                    checked={form.guarantee.available}
                                    onChange={(v: any) => setForm({ ...form, guarantee: { ...form.guarantee, available: v } })}
                                />
                            </div>
                            {form.guarantee.available && (
                                <div className="flex gap-4">
                                    <input
                                        type="number" placeholder="Period"
                                        className="flex-1 bg-white border border-gray-200 rounded-xl px-4 py-3 text-xs font-bold outline-none"
                                        value={form.guarantee.period}
                                        onChange={e => setForm({ ...form, guarantee: { ...form.guarantee, period: e.target.value } })}
                                    />
                                    <select
                                        className="w-1/3 bg-white border border-gray-200 rounded-xl px-4 py-3 text-[10px] font-black uppercase outline-none"
                                        value={form.guarantee.unit}
                                        onChange={e => setForm({ ...form, guarantee: { ...form.guarantee, unit: e.target.value } })}
                                    >
                                        {WARRANTY_UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                                    </select>
                                </div>
                            )}
                        </div>
                    </div>
                </Section>

                {/* 5. Pricing Details */}
                <Section title="Asset Valuation" icon={<IndianRupee size={18} />}>
                    <div className="space-y-10">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <FormInput label="Cost Price" type="number" value={form.costPrice} onChange={(v: any) => setForm({ ...form, costPrice: v })} />
                            <FormInput label="Selling Price" required type="number" value={form.price} onChange={(v: any) => setForm({ ...form, price: v })} />
                            <FormInput label="MRP Value" required type="number" value={form.mrp} onChange={(v: any) => setForm({ ...form, mrp: v })} />
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Tax Index (GST %)</label>
                                <select
                                    className="w-full bg-white border border-gray-200 rounded-2xl p-4 text-sm font-black outline-none italic"
                                    value={form.gst}
                                    onChange={e => setForm({ ...form, gst: parseInt(e.target.value) })}
                                >
                                    {GST_RATES.map(r => <option key={r} value={r}>{r}% Integrated</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <MetricBox label="Net Profit" value={`₹${metrics.margin.toFixed(2)}`} sub={`${metrics.marginPercent.toFixed(1)}% Yield`} highlight />
                            <MetricBox label="Tax Component" value={`₹${metrics.gstAmount.toFixed(2)}`} sub={`${form.gst}% Applied`} />
                            <MetricBox label="Final Quote" value={`₹${metrics.finalPrice.toFixed(2)}`} sub="Incl. All Taxes" dark />
                            <MetricBox label="Discount from MRP" value={`${form.mrp && form.price ? (((parseFloat(form.mrp) - parseFloat(form.price)) / parseFloat(form.mrp)) * 100).toFixed(1) : 0}%`} sub="Market Positioning" />
                        </div>
                    </div>
                </Section>

                {/* 6. Inventory Details */}
                <Section title="Warehouse Logistics" icon={<Warehouse size={18} />}>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <FormInput label="Stock Quantity" type="number" value={form.stock} onChange={(v: any) => setForm({ ...form, stock: v })} />
                        <FormInput label="Critical Alert Level" type="number" value={form.minStockLevel} onChange={(v: any) => setForm({ ...form, minStockLevel: v })} />
                        <FormInput label="Hangar / Bin Location" placeholder="e.g. Rack A-14" value={form.warehouseLocation} onChange={(v: any) => setForm({ ...form, warehouseLocation: v })} />
                    </div>
                    {parseInt(form.stock) <= parseInt(form.minStockLevel) && parseInt(form.stock) >= 0 && (
                        <div className="mt-4 flex items-center gap-3 p-4 bg-amber-50 border border-amber-100 rounded-2xl text-amber-700">
                            <AlertTriangle size={16} />
                            <span className="text-[10px] font-bold uppercase tracking-wider italic">Listing will flag as 'Low Stock' immediately upon publish.</span>
                        </div>
                    )}
                </Section>

                {/* 7. Product Media */}
                <Section title="Intelligence Media" icon={<ImageIcon size={18} />}>
                    <div className="space-y-10">
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-6">
                            {form.images.map((img, idx) => (
                                <div key={idx} className="relative aspect-square rounded-[24px] overflow-hidden border border-gray-200 group">
                                    <img src={img.url} className="w-full h-full object-cover" />
                                    <button
                                        type="button"
                                        onClick={() => setForm({ ...form, images: form.images.filter((_, i) => i !== idx) })}
                                        className="absolute top-2 right-2 p-1.5 bg-black/60 rounded-lg text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                    ><X size={12} /></button>
                                    {idx === 0 && <span className="absolute bottom-3 left-3 px-2 py-0.5 bg-zinc-900 text-[8px] font-black text-white uppercase rounded">Global Hub</span>}
                                </div>
                            ))}
                            {form.images.length < 5 && (
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="aspect-square rounded-[24px] border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-orange-500 hover:bg-orange-50 transition-all"
                                >
                                    <PlusCircle size={24} />
                                    <span className="text-[9px] font-black uppercase tracking-tighter">Sync Image</span>
                                </button>
                            )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Brochure / Manual (PDF)</label>
                                <button
                                    type="button"
                                    onClick={() => brochureInputRef.current?.click()}
                                    className="w-full p-6 border border-gray-200 border-dashed rounded-3xl flex items-center justify-between hover:bg-gray-50 transition-all"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center"><BookOpen size={20} /></div>
                                        <span className="text-xs font-bold text-gray-500 truncate max-w-[200px]">{form.brochure ? 'Brochure.pdf' : 'Attach Technical Manual'}</span>
                                    </div>
                                    <Upload size={18} className="text-gray-300" />
                                </button>
                            </div>
                            <FormInput label="Video Instruction URL" placeholder="YouTube / Vimeo Integration" value={form.video} onChange={(v: any) => setForm({ ...form, video: v })} />
                        </div>
                    </div>
                </Section>

                {/* 8. Description */}
                <Section title="Manual Specifications" icon={<FileText size={18} />}>
                    <div className="space-y-8">
                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Short Summary (Preview)</label>
                            <input
                                maxLength={150}
                                className="w-full bg-white border border-gray-200 rounded-2xl p-4 text-sm font-bold outline-none italic"
                                placeholder="Max 150 characters for catalog cards..."
                                value={form.shortDescription}
                                onChange={e => setForm({ ...form, shortDescription: e.target.value })}
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Detailed Operating Brief</label>
                            <textarea
                                className="w-full min-h-[160px] bg-white border border-gray-200 rounded-3xl p-6 text-sm font-medium outline-none leading-relaxed"
                                placeholder="Full product capabilities, performance data..."
                                value={form.description}
                                onChange={e => setForm({ ...form, description: e.target.value })}
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Technical Specifications</label>
                            <textarea
                                className="w-full min-h-[120px] bg-white border border-gray-200 rounded-3xl p-6 text-sm font-medium outline-none leading-relaxed"
                                placeholder="List specific technical capabilities, tolerances..."
                                value={form.specifications}
                                onChange={e => setForm({ ...form, specifications: e.target.value })}
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Installation Instructions (Optional)</label>
                            <textarea
                                className="w-full min-h-[120px] bg-white border border-gray-200 rounded-3xl p-6 text-sm font-medium outline-none leading-relaxed"
                                placeholder="Step-by-step guidance or required tools..."
                                value={form.installationInstructions}
                                onChange={e => setForm({ ...form, installationInstructions: e.target.value })}
                            />
                        </div>
                    </div>
                </Section>

                {/* 9. SEO */}
                <Section title="Search Indexing" icon={<Tag size={18} />}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <FormInput label="SEO Meta Title" value={form.metaTitle} onChange={(v: any) => setForm({ ...form, metaTitle: v })} />
                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Discovery Tags</label>
                            <div className="relative">
                                <input
                                    placeholder="Press Enter to index tags..."
                                    className="w-full bg-white border border-gray-200 rounded-2xl px-6 py-4 text-xs font-bold outline-none"
                                    value={form.tagInput}
                                    onChange={e => setForm({ ...form, tagInput: e.target.value })}
                                    onKeyDown={handleTagKeyDown}
                                />
                                <div className="mt-3 flex flex-wrap gap-2">
                                    {form.tags.map(t => (
                                        <span key={t} className="px-3 py-1 bg-gray-100 text-[9px] font-black text-gray-600 rounded-lg flex items-center gap-1.5 uppercase hover:bg-gray-200 cursor-pointer" onClick={() => setForm({ ...form, tags: form.tags.filter(tg => tg !== t) })}>
                                            {t} <X size={10} />
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="md:col-span-2 space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Search Description (Excerpt)</label>
                            <textarea
                                className="w-full min-h-[80px] bg-white border border-gray-200 rounded-2xl p-4 text-xs font-bold italic outline-none"
                                placeholder="Meta description for search engines..."
                                value={form.metaDescription}
                                onChange={e => setForm({ ...form, metaDescription: e.target.value })}
                            />
                        </div>
                    </div>
                </Section>

                {/* Submit Logic */}
                <div className="flex flex-col md:flex-row items-center gap-6 pt-10 border-t border-gray-100">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="w-full md:w-48 py-5 bg-white border border-gray-200 rounded-[24px] text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-gray-900 transition-all"
                    >Abort Setup</button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1 py-5 bg-zinc-900 text-white rounded-[24px] text-[10px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-3 hover:bg-orange-600 transition-all shadow-xl shadow-black/10 disabled:opacity-50"
                    >
                        {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <><Save size={18} /> Publish to Global Network</>}
                    </button>
                </div>

            </form>

            <input type="file" ref={fileInputRef} hidden multiple accept="image/*" onChange={e => handleUpload(e)} />
            <input type="file" ref={brochureInputRef} hidden accept=".pdf" onChange={e => handleUpload(e, true)} />
        </div>
    );
}

// UI Components
function Section({ title, icon, children }: { title: string, icon: any, children: React.ReactNode }) {
    return (
        <section className="bg-white border border-gray-100 rounded-[44px] p-8 md:p-12 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50/30 blur-[60px] rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="flex items-center gap-4 mb-10 pb-6 border-b border-gray-50">
                <div className="w-11 h-11 bg-zinc-900 text-white flex items-center justify-center rounded-2xl shadow-lg shadow-black/10">
                    {icon}
                </div>
                <h3 className="text-xl font-black italic uppercase tracking-tighter text-gray-900">{title}</h3>
            </div>
            {children}
        </section>
    );
}

function FormInput({ label, required, value, onChange, type = "text", placeholder, max }: any) {
    return (
        <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">
                {label} {required && <span className="text-orange-500">*</span>}
            </label>
            <input
                type={type}
                max={max}
                value={value}
                onChange={e => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full bg-white border border-gray-200 rounded-2xl px-6 py-4.5 text-sm font-black outline-none focus:border-orange-500/50 transition-all placeholder:text-gray-300 placeholder:italic"
            />
        </div>
    );
}

function MetricBox({ label, value, sub, highlight, dark }: any) {
    return (
        <div className={cn(
            "p-6 rounded-3xl border flex flex-col items-center text-center gap-1.5 transition-all",
            highlight ? "bg-orange-50 border-orange-100" : dark ? "bg-zinc-900 border-zinc-900 text-white" : "bg-white border-gray-100"
        )}>
            <span className={cn("text-[9px] font-black uppercase tracking-widest", dark ? "text-gray-400" : "text-gray-400")}>{label}</span>
            <span className="text-xl font-black italic">{value}</span>
            <span className={cn("text-[8px] font-bold uppercase", dark ? "text-orange-500" : "text-gray-400")}>{sub}</span>
        </div>
    );
}

function Toggle({ checked, onChange }: { checked: boolean, onChange: (v: boolean) => void }) {
    return (
        <button
            type="button"
            onClick={() => onChange(!checked)}
            className={cn(
                "w-12 h-6 rounded-full relative transition-all",
                checked ? "bg-orange-600 shadow-inner" : "bg-gray-200"
            )}
        >
            <div className={cn(
                "absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow-sm",
                checked ? "left-7" : "left-1"
            )} />
        </button>
    );
}
