'use client';

import { useState, useEffect, useRef } from 'react';
import {
    Bell,
    Check,
    Trash2,
    Package,
    AlertCircle,
    Info,
    ArrowUpRight
} from 'lucide-react';
import { supplierService } from '@/services/supplierService';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

interface Notification {
    _id: string;
    title: string;
    body: string;
    type: 'order' | 'alert' | 'info' | 'service' | 'payout';
    read: boolean;
    createdAt: string;
    link?: string;
}

export default function SupplierNotificationDropdown() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const unreadCount = notifications.filter(n => !n.read).length;

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 60000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () =>
            document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchNotifications = async () => {
        try {
            const res = await supplierService.getNotifications();
            if (res.success) setNotifications(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const markAsRead = async (id: string) => {
        try {
            await supplierService.markNotificationRead(id);
            setNotifications(prev =>
                prev.map(n =>
                    n._id === id ? { ...n, read: true } : n
                )
            );
        } catch (err) {
            console.error(err);
        }
    };

    const clearAll = async () => {
        try {
            setLoading(true);
            await supplierService.clearNotifications();
            setNotifications([]);
            toast.success('All notifications cleared');
        } catch {
            toast.error('Failed to clear notifications');
        } finally {
            setLoading(false);
            setIsOpen(false);
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'order':
                return <Package className="text-orange-500" size={18} />;
            case 'alert':
                return <AlertCircle className="text-red-500" size={18} />;
            case 'payout':
                return <Check className="text-emerald-500" size={18} />;
            case 'info':
                return <Info className="text-blue-500" size={18} />;
            default:
                return <Bell className="text-gray-400" size={18} />;
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* TRIGGER */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "relative w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 border",
                    isOpen
                        ? "bg-orange-500 text-white border-orange-500 shadow-lg shadow-orange-200 scale-105"
                        : "bg-white border-gray-200 text-gray-500 hover:border-orange-300 hover:text-orange-500"
                )}
            >
                <Bell size={18} />

                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 min-w-[20px] px-1 flex items-center justify-center rounded-full text-[10px] font-semibold bg-orange-600 text-white ring-2 ring-white">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* DROPDOWN */}
            {isOpen && (
                <div className="absolute right-0 mt-4 w-[340px] sm:w-[420px] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden z-50 animate-in fade-in slide-in-from-top-3 duration-200">

                    {/* HEADER */}
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-semibold text-gray-900">
                                Notifications
                            </h3>
                            <p className="text-xs text-orange-500 font-medium mt-0.5">
                                {unreadCount} unread
                            </p>
                        </div>

                        {notifications.length > 0 && (
                            <button
                                onClick={clearAll}
                                disabled={loading}
                                className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition"
                            >
                                <Trash2 size={16} />
                            </button>
                        )}
                    </div>

                    {/* LIST */}
                    <div className="max-h-[420px] overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="py-16 text-center">
                                <Bell
                                    size={28}
                                    className="mx-auto text-gray-300 mb-4"
                                />
                                <p className="text-sm font-medium text-gray-700">
                                    No notifications yet
                                </p>
                                <p className="text-xs text-gray-400 mt-1">
                                    Updates will appear here.
                                </p>
                            </div>
                        ) : (
                            notifications.map(notif => (
                                <div
                                    key={notif._id}
                                    onClick={() =>
                                        !notif.read &&
                                        markAsRead(notif._id)
                                    }
                                    className={cn(
                                        "px-6 py-4 flex gap-4 hover:bg-gray-50 transition cursor-pointer border-l-4",
                                        notif.read
                                            ? "border-transparent"
                                            : "border-orange-500 bg-orange-50/40"
                                    )}
                                >
                                    <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                                        {getIcon(notif.type)}
                                    </div>

                                    <div className="flex-1">
                                        <div className="flex justify-between items-start gap-2">
                                            <h5
                                                className={cn(
                                                    "text-sm",
                                                    notif.read
                                                        ? "font-medium text-gray-700"
                                                        : "font-semibold text-gray-900"
                                                )}
                                            >
                                                {notif.title}
                                            </h5>

                                            <span className="text-xs text-gray-400">
                                                {formatDistanceToNow(
                                                    new Date(notif.createdAt),
                                                    { addSuffix: true }
                                                )}
                                            </span>
                                        </div>

                                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                                            {notif.body}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* FOOTER */}
                    <div className="p-4 border-t border-gray-100 bg-gray-50">
                        <button className="w-full py-2.5 rounded-xl bg-white border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-100 transition flex items-center justify-center gap-2">
                            View System Logs <ArrowUpRight size={14} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}