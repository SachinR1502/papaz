'use client';

import { useSupplier } from '@/context/SupplierContext';
import { useRouter, useParams } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import {
    ArrowLeft,
    Package,
    Truck,
    IndianRupee,
    Layers,
    FileText,
    Save,
    Loader2,
    Warehouse,
    ChevronDown,
    Trash2,
    AlertTriangle,
    Upload,
    Image as ImageIcon,
    X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { uploadService } from '@/services/uploadService';

const CATEGORIES = [
    'Batteries', 'Tires', 'Engine Oil', 'Brakes', 'Lights',
    'Filters', 'Accessories', 'Spare Parts', 'Lubricants',
    'Suspension', 'Electrical'
];

const VEHICLE_TYPES = ['Car', 'Bike', 'Scooter', 'Truck', 'Bus', 'Tractor', 'EV Vehicle', 'Other'];

export default function EditProductPage() {
    const params = useParams();
    console.log("EditProductPage params:", params);
    const productId = params?.id || params?.productId;
    const { inventory, updateProduct, isLoading } = useSupplier();
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
        image: '',
        compatibleModels: [] as string[]
    });

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            toast.error('Invalid File Type', { description: 'Please upload an image file.' });
            return;
        }

        setIsUploading(true);
        const toastId = toast.loading('Updating cloud assets...');

        try {
            const result = await uploadService.uploadFile(file);
            setForm(prev => ({ ...prev, image: result.url }));
            toast.success('Image Updated', { id: toastId });
        } catch (error) {
            toast.error('Update Failed', { id: toastId });
        } finally {
            setIsUploading(false);
        }
    };

    useEffect(() => {
        if (productId && inventory.length > 0) {
            const product = inventory.find(p => p.id === productId);
            if (product) {
                setForm({
                    name: product.name || '',
                    category: product.category || 'Spare Parts',
                    price: (product.price || '').toString(),
                    quantity: (product.stock || product.quantity || '').toString(),
                    description: product.description || '',
                    brand: product.brand || '',
                    partNumber: product.partNumber || '',
                    image: product.image || '',
                    compatibleModels: product.compatibleModels || []
                });
            }
        }
    }, [productId, inventory]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name || !form.price || !form.quantity) {
            toast.error('Missing Required Fields');
            return;
        }

        setIsSubmitting(true);
        try {
            await updateProduct(productId as string, {
                ...form,
                price: parseFloat(form.price),
                stock: parseInt(form.quantity),
                image: form.image || 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?q=80&w=2832&auto=format&fit=crop'
            });
            toast.success('Listing Updated');
            router.push('/supplier/inventory');
        } catch (e) {
            toast.error('Update Failed');
        } finally {
            setIsSubmitting(false);
        }
    };

    const currentProduct = inventory.find(p => p.id === productId);

    if (inventory.length > 0 && !currentProduct) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] gap-6 animate-fade-in">
                <div className="w-20 h-20 bg-red-500/10 rounded-[30px] flex items-center justify-center text-red-500 border border-red-500/20">
                    <AlertTriangle size={40} />
                </div>
                <div className="text-center">
                    <h3 className="text-2xl font-black text-foreground italic uppercase mb-2">Item Not Found</h3>
                    <p className="text-muted font-bold uppercase tracking-widest text-[10px] opacity-60">The component identifier <span className="text-foreground">{productId}</span> does not exist in your warehouse.</p>
                </div>
                <button onClick={() => router.push('/supplier/inventory')} className="px-8 py-3 bg-card border border-border rounded-xl text-[10px] font-black uppercase tracking-widest text-muted hover:text-foreground transition-all">
                    Back to Inventory
                </button>
            </div>
        );
    }

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
                            <Warehouse size={10} className="text-primary" />
                            <span className="text-[10px] uppercase font-black tracking-widest text-primary">Warehouse Control</span>
                        </div>
                        <h1 className="text-4xl lg:text-5xl font-black m-0 tracking-tighter text-foreground italic uppercase">
                            Modify <span className="text-primary">Listing</span>
                        </h1>
                        <p className="mt-2 text-sm md:text-base text-muted font-bold opacity-80 leading-relaxed italic uppercase tracking-tight">
                            Edit component specifications and warehouse availability.
                        </p>
                    </div>
                </div>
                <button className="flex items-center gap-2 px-6 py-4 bg-red-500/5 text-red-500 rounded-2xl border border-red-500/10 text-[10px] font-black uppercase tracking-widest hover:bg-red-500/10 transition-all active:scale-95 italic">
                    <Trash2 size={16} /> Archive Listing
                </button>
            </header>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-10">
                <div className="flex flex-col gap-10">
                    {/* Component Identity */}
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
                                onChange={(v: any) => setForm({ ...form, name: v })}
                                icon={<Package size={18} />}
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <FormSelect
                                    label="Component Category"
                                    required
                                    options={CATEGORIES}
                                    value={form.category}
                                    onChange={(v: any) => setForm({ ...form, category: v })}
                                    icon={<Layers size={18} />}
                                />
                                <FormSelect
                                    label="Vehicle Compatibility"
                                    required
                                    options={VEHICLE_TYPES}
                                    value={form.compatibleModels[0] || ''}
                                    onChange={(v: any) => setForm({ ...form, compatibleModels: [v] })}
                                    icon={<Truck size={18} />}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <FormInput
                                    label="Brand / Manufacturer"
                                    placeholder="e.g. Bosch, Brembo, Generic"
                                    value={form.brand}
                                    onChange={(v: any) => setForm({ ...form, brand: v })}
                                    icon={<Layers size={18} />}
                                />
                                <FormInput
                                    label="Part Number / SKU"
                                    placeholder="e.g. P/N-123456"
                                    value={form.partNumber}
                                    onChange={(v: any) => setForm({ ...form, partNumber: v })}
                                    icon={<FileText size={18} />}
                                />
                            </div>

                            <div className="space-y-3 flex-1 group">
                                <label className="px-1 text-[10px] font-black uppercase tracking-[0.2em] text-muted opacity-60">
                                    Product Image <span className="text-red-500">*</span>
                                </label>
                                <div
                                    onClick={() => !isUploading && fileInputRef.current?.click()}
                                    className={cn(
                                        "relative h-48 w-full bg-card/40 border-2 border-dashed border-border rounded-[28px] flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden hover:border-primary/50",
                                        form.image && "border-solid border-primary/20",
                                        isUploading && "animate-pulse"
                                    )}
                                >
                                    {form.image ? (
                                        <>
                                            <img src={form.image} className="w-full h-full object-cover" alt="Preview" />
                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                                <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/20">
                                                    <Upload size={20} className="text-white" />
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setForm(prev => ({ ...prev, image: '' }));
                                                }}
                                                className="absolute top-4 right-4 bg-black/60 backdrop-blur-md p-2 rounded-xl border border-white/10 text-white hover:bg-red-500 transition-colors"
                                            >
                                                <X size={16} />
                                            </button>
                                        </>
                                    ) : (
                                        <div className="flex flex-col items-center gap-4 text-center px-6">
                                            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                                                {isUploading ? <Loader2 size={24} className="animate-spin" /> : <ImageIcon size={28} />}
                                            </div>
                                            <div>
                                                <p className="text-sm font-black uppercase tracking-tight italic">
                                                    {isUploading ? 'Syncing to S3...' : 'Update Component Image'}
                                                </p>
                                                <p className="text-[10px] font-bold text-muted/60 uppercase tracking-widest mt-1">
                                                    Click to replace existing asset
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                    />
                                </div>
                            </div>

                            <FormInput
                                label="Asset Cloud URL"
                                placeholder="https://..."
                                value={form.image}
                                onChange={(v: any) => setForm({ ...form, image: v })}
                                icon={<FileText size={18} />}
                            />
                        </div>
                    </section>

                    {/* Valuation & Stock */}
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
                                onChange={(v: any) => setForm({ ...form, price: v })}
                                icon={<IndianRupee size={18} />}
                            />
                            <FormInput
                                label="Warehouse Quantity"
                                required
                                type="number"
                                placeholder="Units in stock"
                                value={form.quantity}
                                onChange={(v: any) => setForm({ ...form, quantity: v })}
                                icon={<Warehouse size={18} />}
                            />
                        </div>
                    </section>

                    {/* Technical Specification */}
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
                                placeholder="Technical details..."
                                className="w-full min-h-[200px] bg-card/40 border border-border rounded-[28px] py-6 pl-16 pr-8 text-sm font-bold outline-none focus:border-primary/50 transition-all placeholder:text-muted/40 placeholder:italic resize-none leading-relaxed"
                            />
                        </div>
                    </section>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-6">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="w-full sm:w-1/3 py-5 bg-card border border-border rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] text-muted hover:text-foreground italic text-center"
                    >
                        Abort Modification
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
                                Sync Specification Changes
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}

function FormInput({ label, placeholder, value, onChange, icon, required = false, type = "text" }: any) {
    return (
        <div className="space-y-3 flex-1 group">
            <label className="px-1 text-[10px] font-black uppercase tracking-[0.2em] text-muted opacity-60">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <div className="relative">
                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-primary opacity-40 group-focus-within:opacity-100 transition-opacity pointer-events-none">
                    {icon}
                </div>
                <input
                    type={type}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    className="w-full bg-card/40 border border-border rounded-2xl py-4.5 pl-14 pr-6 text-sm font-black outline-none focus:border-primary/50 transition-all placeholder:text-muted/30 placeholder:italic italic"
                />
            </div>
        </div>
    );
}

function FormSelect({ label, value, onChange, icon, options, required = false }: any) {
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
