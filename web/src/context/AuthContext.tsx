'use client';
import React, { createContext, useContext, useEffect, useState } from 'react';
import apiClient from '@/services/apiClient';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/authService';

interface User {
    id: string;
    role: string;
    email?: string;
    name?: string;
    phoneNumber?: string;
    profile?: any;
    [key: string]: any; // Allow for other dynamic fields
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (token: string, userData: any) => void;
    logout: () => void;
    refreshUser: () => Promise<any>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
    login: () => { },
    logout: () => { },
    refreshUser: async () => { },
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        const storedToken = localStorage.getItem('auth_token');
        const storedUser = localStorage.getItem('user_data');

        if (storedToken) {
            setToken(storedToken);
            if (storedUser) {
                setUser(JSON.parse(storedUser));
            }
            // Fetch latest data from backend
            try {
                const response = await authService.getMe();
                if (response?.data) {
                    const userData = response.data;
                    const role = userData.role?.toLowerCase() || 'customer';
                    const standardizedUser = { ...userData, role };
                    setUser(standardizedUser);
                    localStorage.setItem('user_data', JSON.stringify(standardizedUser));
                }
            } catch (err) {
                console.error('[AUTH] Failed to refresh user data:', err);
                // If 401, token might be expired
                if ((err as any).response?.status === 401) {
                    logout();
                }
            }
        }
        setIsLoading(false);
    };

    const refreshUser = async () => {
        try {
            const response = await authService.getMe();
            if (response?.data) {
                const userData = response.data;
                const role = userData.role?.toLowerCase() || 'customer';
                const standardizedUser = { ...userData, role };
                setUser(standardizedUser);
                localStorage.setItem('user_data', JSON.stringify(standardizedUser));
                return standardizedUser;
            }
        } catch (err) {
            console.error('[AUTH] Refresh failed:', err);
        }
    };

    const login = (token: string, userData: any) => {
        const role = userData.role?.toLowerCase() || 'customer';
        console.log('[AUTH] Login started for role:', role);
        const standardizedUser = { ...userData, role };

        try {
            localStorage.setItem('auth_token', token);
            localStorage.setItem('user_data', JSON.stringify(standardizedUser));

            // Set cookies with explicit expiration and path
            const now = new Date();
            now.setTime(now.getTime() + (30 * 24 * 60 * 60 * 1000)); // 30 days
            const expires = "expires=" + now.toUTCString();

            // We set them one by one. path=/ is critical for middleware
            const cookieOptions = `${expires}; path=/; SameSite=Lax`;
            document.cookie = `auth_token=${token}; ${cookieOptions}`;
            document.cookie = `user_role=${role}; ${cookieOptions}`;
            document.cookie = `profile_completed=${userData.profileCompleted ? 'true' : 'false'}; ${cookieOptions}`;

            console.log('[AUTH] Storage and cookies updated for role:', role);
            console.log('[AUTH] Profile status:', userData.profileCompleted ? 'completed' : 'pending');
            setUser(standardizedUser);
            setToken(token);
        } catch (err) {
            console.error('[AUTH] Login storage error:', err);
        }
    };

    const logout = () => {
        console.log('[AUTH] Logging out...');
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');

        // Clear cookies by setting expiration in the past
        const past = "expires=Thu, 01 Jan 1970 00:00:00 GMT";
        document.cookie = `auth_token=; ${past}; path=/`;
        document.cookie = `user_role=; ${past}; path=/`;
        document.cookie = `profile_completed=; ${past}; path=/`;

        setUser(null);
        setToken(null);
        window.location.href = '/login'; // Full reload on logout 
    };

    // MOCK FOR DEVELOPMENT if no user exists
    useEffect(() => {
        if (!isLoading && !user) {
            // Uncomment to test supplier flow without real backend login
            /*
            setUser({
              id: '123',
              role: 'supplier',
              profile: {
                // shopName: 'Test Shop' 
                // Uncomment shopName to test "Registered" state
              }
            });
            */
        }
    }, [isLoading, user]);

    return (
        <AuthContext.Provider value={{ user, token, isAuthenticated: !!user, isLoading, login, logout, refreshUser }}>
            {children}
        </AuthContext.Provider>
    );
}
