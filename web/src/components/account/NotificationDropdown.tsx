'use client';

import { useState, useEffect, useRef } from 'react';
import { Bell, Check, Trash2, X, Clock, Package, AlertCircle, Info } from 'lucide-react';
import { customerService } from '@/services/customerService';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

interface Notification {
    _id: string;
    title: string;
    body: string;
    type: 'order' | 'alert' | 'info' | 'service';
    read: boolean;
    createdAt: string;
}

export default function NotificationDropdown() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const unreadCount = notifications.filter(n => !n.read).length;

    useEffect(() => {
        fetchNotifications();
        // Set up polling or socket listeners here if needed
        const interval = setInterval(fetchNotifications, 60000); // refresh every minute
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchNotifications = async () => {
        try {
            const res = await customerService.getNotifications();
            if (res.success) {
                setNotifications(res.data);
            }
        } catch (err) {
            console.error('Fetch notifications error:', err);
        }
    };

    const markAsRead = async (id: string) => {
        try {
            await customerService.markNotificationRead(id);
            setNotifications(prev =>
                prev.map(n => n._id === id ? { ...n, read: true } : n)
            );
        } catch (err) {
            console.error('Mark as read error:', err);
        }
    };

    const clearAll = async () => {
        try {
            setLoading(true);
            await customerService.clearNotifications();
            setNotifications([]);
            toast.success('Notifications cleared');
        } catch (err) {
            toast.error('Failed to clear notifications');
        } finally {
            setLoading(false);
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'order': return <Package className="text-orange-500" size={16} />;
            case 'alert': return <AlertCircle className="text-red-500" size={16} />;
            case 'info': return <Info className="text-blue-500" size={16} />;
            default: return <Bell className="text-gray-500" size={16} />;
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* TOGGLE BUTTON */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "relative w-9 h-9 flex items-center justify-center rounded-lg border transition",
                    isOpen ? "bg-orange-50 border-orange-200" : "border-gray-200 hover:bg-gray-50"
                )}
            >
                <Bell size={16} className={isOpen ? "text-orange-600" : "text-gray-600"} />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center bg-orange-500 text-white text-[10px] font-bold rounded-full ring-2 ring-white">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* DROPDOWN */}
            {isOpen && (
                <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">

                    {/* Header */}
                    <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                        <div>
                            <h3 className="text-sm font-bold text-gray-800">Notifications</h3>
                            <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">
                                {unreadCount} New Alerts
                            </p>
                        </div>
                        {notifications.length > 0 && (
                            <button
                                onClick={clearAll}
                                disabled={loading}
                                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                                title="Clear all"
                            >
                                <Trash2 size={16} />
                            </button>
                        )}
                    </div>

                    {/* Scrollable Area */}
                    <div className="max-h-[400px] overflow-y-auto hide-scrollbar">
                        {notifications.length === 0 ? (
                            <div className="py-12 flex flex-col items-center justify-center text-center px-6">
                                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                    <Bell size={24} className="text-gray-300" />
                                </div>
                                <h4 className="text-sm font-semibold text-gray-700">All caught up!</h4>
                                <p className="text-xs text-gray-400 mt-1">No new notifications to show.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-50">
                                {notifications.map((notif) => (
                                    <div
                                        key={notif._id}
                                        onClick={() => !notif.read && markAsRead(notif._id)}
                                        className={cn(
                                            "group p-4 flex gap-4 hover:bg-gray-50 transition cursor-pointer relative",
                                            !notif.read && "bg-orange-50/30"
                                        )}
                                    >
                                        <div className={cn(
                                            "flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center",
                                            !notif.read ? "bg-white shadow-sm" : "bg-gray-50"
                                        )}>
                                            {getIcon(notif.type)}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <h5 className={cn(
                                                    "text-sm",
                                                    !notif.read ? "font-bold text-gray-900" : "font-medium text-gray-700"
                                                )}>
                                                    {notif.title}
                                                </h5>
                                                <span className="text-[10px] text-gray-400 whitespace-nowrap mt-1 flex items-center gap-1">
                                                    <Clock size={10} />
                                                    {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                                                {notif.body}
                                            </p>
                                        </div>

                                        {/* Unread indicator */}
                                        {!notif.read && (
                                            <div className="absolute top-4 right-4 w-1.5 h-1.5 bg-orange-500 rounded-full shadow-sm shadow-orange-500/50" />
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    {notifications.length > 0 && (
                        <div className="p-3 bg-gray-50/50 border-t border-gray-50">
                            <button className="w-full py-2 text-xs font-bold text-gray-500 hover:text-gray-800 transition uppercase tracking-widest">
                                View All Activity
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
