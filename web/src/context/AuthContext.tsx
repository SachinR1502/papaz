'use client';
import React, { createContext, useContext, useEffect, useState } from 'react';
import apiClient from '@/services/apiClient';
import { useRouter } from 'next/navigation';

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
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
    login: () => { },
    logout: () => { },
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
        try {
            console.log('[AUTH] Checking session...');
            const token = localStorage.getItem('auth_token');
            const storedUser = localStorage.getItem('user_data');

            if (token && storedUser) {
                const parsedUser = JSON.parse(storedUser);
                console.log('[AUTH] Session found:', parsedUser.role);
                setUser(parsedUser);
                setToken(token);
            } else {
                console.log('[AUTH] No session found');
            }
        } catch (e) {
            console.error('[AUTH] Check error:', e);
        } finally {
            setIsLoading(false);
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
        <AuthContext.Provider value={{ user, token, isAuthenticated: !!user, isLoading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}
