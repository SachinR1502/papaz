'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { technicianService } from '@/services/technicianService';

export default function TechnicianDashboard() {
    const { user } = useAuth();
    const [jobs, setJobs] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchJobs = async () => {
            try {
                // Mock data for demo purposes or API call
                const data = await technicianService.getJobs();
                setJobs(data && data.length > 0 ? data : [
                    { id: 'JOB-101', customerName: 'John Doe', vehicle: 'Toyota Corolla', status: 'In-Progress', serviceType: 'Periodic Maintenance' },
                    { id: 'JOB-102', customerName: 'Jane Smith', vehicle: 'Honda City', status: 'Pending', serviceType: 'Brake Pad Replacement' },
                ]);
            } catch (err) {
                console.error("Failed to fetch jobs", err);
                setJobs([
                    { id: 'JOB-101', customerName: 'John Doe', vehicle: 'Toyota Corolla', status: 'In-Progress', serviceType: 'Periodic Maintenance' },
                    { id: 'JOB-102', customerName: 'Jane Smith', vehicle: 'Honda City', status: 'Pending', serviceType: 'Brake Pad Replacement' },
                ]);
            } finally {
                setIsLoading(false);
            }
        };
        fetchJobs();
    }, []);

    return (
        <div className="p-6 md:p-10 pb-20">
            <div className="mb-10">
                <h1 className="text-4xl md:text-5xl font-black mb-2 tracking-tight">Active Jobs</h1>
                <p className="text-muted font-medium">Manage and update your ongoing service assignments.</p>
            </div>

            <div className="grid gap-6">
                {isLoading ? (
                    <div className="glass-panel p-10 text-center rounded-2xl border border-white/5">
                        <div className="animate-spin w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full mx-auto mb-4"></div>
                        <p className="text-muted font-bold text-xs uppercase tracking-widest">Loading jobs...</p>
                    </div>
                ) : jobs.length > 0 ? (
                    jobs.map(job => (
                        <div key={job.id} className="glass-panel p-6 md:p-8 rounded-2xl border border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 hover:bg-white/[0.02] transition-colors">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="font-extrabold text-xl">{job.vehicle}</span>
                                    <span className="text-xs font-bold bg-white/10 px-2 py-1 rounded text-muted">#{job.id}</span>
                                </div>
                                <p className="text-muted text-sm mb-1">Customer: <strong className="text-foreground">{job.customerName}</strong></p>
                                <p className="text-primary font-bold text-sm">{job.serviceType}</p>
                            </div>
                            <div className="flex flex-wrap gap-3 items-center w-full md:w-auto">
                                <span className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wide ${job.status === 'Pending'
                                        ? 'bg-orange-500/10 text-orange-500'
                                        : 'bg-green-500/10 text-green-500'
                                    }`}>
                                    {job.status}
                                </span>
                                <div className="flex gap-3 ml-auto md:ml-0">
                                    <button className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold transition-colors">View Details</button>
                                    <button className="px-4 py-2 rounded-xl bg-primary text-white hover:bg-primary/90 text-xs font-bold transition-colors shadow-lg shadow-primary/20">Update Status</button>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="glass-panel p-16 text-center rounded-[32px] border border-dashed border-white/10">
                        <span className="text-5xl block mb-4 opacity-50">📭</span>
                        <h3 className="text-2xl font-black mb-2">No active jobs</h3>
                        <p className="text-muted font-medium">Check back later for new service requests.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
