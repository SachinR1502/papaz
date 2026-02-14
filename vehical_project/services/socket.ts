import { io, Socket } from 'socket.io-client';

const LOCAL_SOCKET_URL = process.env.EXPO_PUBLIC_SOCKET_URL;
const PROD_SOCKET_URL = 'https://vehicles-app-c3pv.onrender.com';

// Use appropriate URL for socket based on environment
const getBaseUrl = () => {
    // If environment variable is set (e.g. from .env file), use it
    if (process.env.EXPO_PUBLIC_SOCKET_URL) {
        return process.env.EXPO_PUBLIC_SOCKET_URL;
    }

    // Fallbacks for when .env is not loaded or missing
    const fallback = __DEV__ ? LOCAL_SOCKET_URL : PROD_SOCKET_URL;
    console.log(`[SOCKET Source] Initializing with fallback: ${fallback} (__DEV__: ${__DEV__})`);
    return fallback;
};

class SocketService {
    public socket: Socket | null = null;
    private reconnectAttempts = 0;
    private currentUrl: string = getBaseUrl();
    private lastRegisteredUserId: string | null = null;

    connect() {
        if (!this.socket) {
            console.log('Initiating socket connection to:', this.currentUrl);
            this.socket = io(this.currentUrl, {
                transports: ['websocket', 'polling'], // Prioritize websocket
                upgrade: true,
                autoConnect: true,
                reconnection: true,
                reconnectionAttempts: Infinity,
                reconnectionDelay: 2000,
                reconnectionDelayMax: 10000,
                timeout: 20000,
                forceNew: true,
                path: '/socket.io/' // Explicitly set default path
            });

            this.socket.on('connect', () => {
                console.log('Socket connected successfully:', this.socket?.id);
                this.reconnectAttempts = 0;
            });

            this.socket.on('disconnect', (reason) => {
                console.log('Socket disconnected:', reason);
                this.lastRegisteredUserId = null;
            });

            this.socket.on('connect_error', (err) => {
                this.reconnectAttempts++;
                console.log(`Socket connect_error (Attempt ${this.reconnectAttempts}):`, err.message);

                // Fallback to Production URL if Local fails
                if (this.currentUrl === LOCAL_SOCKET_URL && this.reconnectAttempts >= 3) {
                    console.log('Local socket unreachable. Switching to Production socket...');
                    this.disconnect(); // Closers current socket and resets attempts
                    this.currentUrl = PROD_SOCKET_URL;
                    this.connect(); // Re-initiate connection with new URL
                    return;
                }

                if (this.reconnectAttempts % 5 === 0) {
                    console.log(`Socket connection still failing after ${this.reconnectAttempts} attempts. Check if backend is running at ${this.currentUrl}`);
                }
            });

            this.socket.on('reconnect', (attemptNumber) => {
                console.log('Socket reconnected after', attemptNumber, 'attempts');
            });
        } else if (!this.socket.connected) {
            this.socket.connect();
        }
        return this.socket;
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
            this.reconnectAttempts = 0;
        }
    }

    emit(event: string, data: any) {
        if (this.socket) {
            this.socket.emit(event, data);
        }
    }

    register(userId: string) {
        if (this.socket && this.lastRegisteredUserId !== userId) {
            this.socket.emit('register', userId);
            this.lastRegisteredUserId = userId;
        }
    }

    streamLocation(data: { targetId: string; latitude: number; longitude: number; jobId: string }) {
        if (this.socket) {
            this.socket.emit('track_location', data);
        }
    }

    on(event: string, callback: (...args: any[]) => void) {
        this.socket?.on(event, callback);
    }

    off(event: string, callback?: (...args: any[]) => void) {
        this.socket?.off(event, callback);
    }

    isConnected(): boolean {
        return this.socket?.connected ?? false;
    }
}

export const socketService = new SocketService();

