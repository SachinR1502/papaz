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
                const data = await technicianService.getJobs();
                setJobs(data || []);
            } catch (err) {
                console.error("Failed to fetch jobs", err);
                // Fallback mock data for demo
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
        <div style={{ padding: '40px' }}>
            <div style={{ marginBottom: '40px' }}>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 800, margin: '0 0 8px' }}>Active Jobs</h1>
                <p style={{ color: 'var(--text-muted)' }}>Manage and update your ongoing service assignments.</p>
            </div>

            <div style={{ display: 'grid', gap: '24px' }}>
                {isLoading ? (
                    <div className="glass-panel" style={{ padding: '40px', textAlign: 'center' }}>Loading jobs...</div>
                ) : jobs.length > 0 ? (
                    jobs.map(job => (
                        <div key={job.id} className="glass-panel" style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                    <span style={{ fontWeight: 800, fontSize: '1.2rem' }}>{job.vehicle}</span>
                                    <span style={{ fontSize: '0.8rem', background: 'rgba(0,0,0,0.05)', padding: '2px 8px', borderRadius: '4px' }}>#{job.id}</span>
                                </div>
                                <p style={{ margin: 0, color: 'var(--text-muted)' }}>Customer: <strong>{job.customerName}</strong></p>
                                <p style={{ margin: '4px 0 0', color: 'var(--color-primary)', fontWeight: 600 }}>{job.serviceType}</p>
                            </div>
                            <div style={{ textAlign: 'right', display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
                                <span style={{
                                    padding: '6px 12px',
                                    borderRadius: '8px',
                                    fontSize: '0.85rem',
                                    fontWeight: 700,
                                    background: job.status === 'Pending' ? 'rgba(255, 140, 0, 0.1)' : 'rgba(52, 199, 89, 0.1)',
                                    color: job.status === 'Pending' ? 'var(--color-primary)' : 'var(--status-success)'
                                }}>
                                    {job.status}
                                </span>
                                <button className="btn btn-secondary" style={{ padding: '8px 16px' }}>View Details</button>
                                <button className="btn btn-primary" style={{ padding: '8px 16px' }}>Update Status</button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="glass-panel" style={{ padding: '60px', textAlign: 'center' }}>
                        <span style={{ fontSize: '3rem', display: 'block', marginBottom: '16px' }}>📭</span>
                        <h3 style={{ margin: 0 }}>No active jobs</h3>
                        <p style={{ color: 'var(--text-muted)' }}>Check back later for new service requests.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
