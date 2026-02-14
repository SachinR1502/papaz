import { customerService } from '@/services/customerService';
import { socketService } from '@/services/socket';
import { supplierService } from '@/services/supplierService';
import { technicianService } from '@/services/technicianService';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';

interface NotificationContextType {
    hasUnread: boolean;
    notifications: any[];
    unreadCount: number;
    refreshNotifications: () => Promise<void>;
    markAsRead: (id: string) => Promise<void>;
    clearAll: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState<any[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);

    const refreshNotifications = useCallback(async () => {
        if (!user || !user.role) return;

        try {
            let data: any[] = [];
            if (user.role === 'customer') {
                data = await customerService.getNotifications();
            } else if (user.role === 'technician') {
                data = await technicianService.getNotifications();
            } else if (user.role === 'supplier') {
                data = await supplierService.getNotifications();
            }

            setNotifications(data || []);
            setUnreadCount((data || []).filter((n: any) => !n.read).length);
        } catch (error) {
            console.error('Failed to refresh notifications:', error);
        }
    }, [user]);

    useEffect(() => {
        if (user) {
            refreshNotifications();

            // Setup real-time listener
            socketService.on('new_notification', (notification: any) => {
                console.log('Real-time notification received:', notification);
                // Prepend to list or just refresh
                setNotifications(prev => [notification, ...prev]);
                setUnreadCount(prev => prev + 1);
            });

            // Polling as a robust backup
            const interval = setInterval(refreshNotifications, 60000); // 60s backup
            return () => {
                clearInterval(interval);
                socketService.off('new_notification');
            };
        }
    }, [user, refreshNotifications]);

    const markAllAsRead = async () => {
        if (!user || !user.role) return;
        try {
            // Optimistic update
            const oldNotifications = [...notifications];
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            setUnreadCount(0);

            if (user.role === 'customer') {
                // customerService doesn't have markAllRead yet, let's skip API or loop?
                // Wait, existing services usually have clearAll, but maybe not markAllRead.
                // checking service files... customerService has clearAllNotifications, markNotificationRead
                // technicianService has clearAllNotifications, markNotificationRead
                // So we can implement clearAll.
                // For markAllRead, we might need to iterate or add API.
                // For now let's just stick to what `NotificationsScreen` needs: markAsRead (single) and clearAll.
            }
        } catch (e) {
            console.error(e);
        }
    }

    const markAsRead = async (id: string) => {
        if (!user || !user.role) return;

        // Optimistic Update
        setNotifications(prev => prev.map(n => (n._id === id || n.id === id) ? { ...n, read: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));

        try {
            if (user.role === 'customer') {
                await customerService.markNotificationRead(id);
            } else if (user.role === 'technician') {
                await technicianService.markNotificationRead(id);
            } else if (user.role === 'supplier') {
                await supplierService.markNotificationRead(id);
            }
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
            refreshNotifications(); // Revert on failure
        }
    };

    const clearAll = async () => {
        if (!user || !user.role) return;

        // Optimistic
        setNotifications([]);
        setUnreadCount(0);

        try {
            if (user.role === 'customer') {
                await customerService.clearAllNotifications();
            } else if (user.role === 'technician') {
                await technicianService.clearAllNotifications();
            } else if (user.role === 'supplier') {
                await supplierService.clearAllNotifications();
            }
        } catch (error) {
            console.error('Failed to clear notifications:', error);
            refreshNotifications();
        }
    };

    return (
        <NotificationContext.Provider value={{
            hasUnread: unreadCount > 0,
            notifications,
            unreadCount,
            refreshNotifications,
            markAsRead,
            clearAll
        }}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
};
