'use client';

import { Activity } from 'lucide-react';

interface RevenueData {
    date: string | { _id: string, total: number }; // Handle both formats from backend (transaction list vs aggregation)
    amount?: number;
    total?: number;
    _id?: string;
}

interface RevenueBarChartProps {
    data: any[]; // Ideally strict type, but data structure varies slightly between dashboard and reports (see below)
    period: string;
}

export function RevenueBarChart({ data, period }: RevenueBarChartProps) {
    if (!data || data.length === 0) {
        return (
            <div className="w-full h-full flex flex-col items-center justify-center text-muted border border-dashed border-white/10 rounded-xl bg-white/[0.02]">
                <Activity size={32} className="opacity-20 mb-2" />
                <span className="text-xs font-bold uppercase tracking-widest opacity-50">No Data Available</span>
            </div>
        );
    }

    // Normalize data structure
    const normalizedData = data.map(d => ({
        date: d.date || d._id,
        amount: d.amount || d.total || 0
    }));

    const maxVal = Math.max(...normalizedData.map(d => d.amount)) || 1000;

    return (
        <div className="w-full h-full flex items-end justify-between px-2 gap-2">
            {normalizedData.map((d, i) => {
                const heightPercent = Math.max((d.amount / maxVal) * 100, 5); // Min 5% height

                return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                        <div className="relative w-full max-w-[40px] flex items-end h-full">
                            {/* Bar */}
                            <div
                                className="w-full rounded-t-lg bg-primary/20 border-x border-t border-primary/30 group-hover:bg-primary group-hover:shadow-[0_0_20px_rgba(var(--primary-rgb),0.5)] transition-all duration-300 ease-out"
                                style={{ height: `${heightPercent}%` }}
                            >
                                {/* Tooltip */}
                                <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-popover text-popover-foreground text-[10px] font-bold py-1 px-2 rounded shadow-xl whitespace-nowrap z-20 pointer-events-none mb-2">
                                    ₹{d.amount.toLocaleString()}
                                </div>
                            </div>
                        </div>
                        <span className="text-[10px] font-bold text-muted uppercase tracking-wider group-hover:text-foreground transition-colors text-center whitespace-nowrap">
                            {period === 'week' && !isNaN(new Date(d.date).getTime())
                                ? new Date(d.date).getDate()
                                : d.date}
                        </span>
                    </div>
                );
            })}
        </div>
    );
}
