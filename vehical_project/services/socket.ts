import { io, Socket } from 'socket.io-client';

const AWS_SOCKET_URL = 'http://16.170.108.222:8080';

class SocketService {
    public socket: Socket | null = null;
    private reconnectAttempts = 0;
    private lastRegisteredUserId: string | null = null;

    // Use the URL from .env if available, otherwise fallback to AWS IP
    private getUrl() {
        const url = process.env.EXPO_PUBLIC_SOCKET_URL || AWS_SOCKET_URL;
        // socket.io-client handles path normalization, but ensure no trailing slash
        return url.endsWith('/') ? url.slice(0, -1) : url;
    }

    connect() {
        if (!this.socket) {
            const url = this.getUrl();
            console.log('Initiating socket connection to:', url);

            // AWS/Production optimization: Use 'polling' first to ensure connectivity 
            // through proxies/firewalls, then upgrade to 'websocket'
            this.socket = io(url, {
                transports: ['polling', 'websocket'],
                autoConnect: true,
                reconnection: true,
                reconnectionAttempts: Infinity,
                reconnectionDelay: 2000,
                timeout: 30000,
                path: '/socket.io/',
                // Important for cross-domain AWS connectivity
                rememberUpgrade: true,
                forceNew: true
            });

            this.socket.on('connect', () => {
                console.log('Socket connected successfully:', this.socket?.id);
                this.reconnectAttempts = 0;
            });

            this.socket.on('connect_error', (err) => {
                this.reconnectAttempts++;
                console.log(`Socket connection error (${url}) Attempt ${this.reconnectAttempts}:`, err.message);

                // If it fails, try to force polling-only if it's a websocket protocol issue
                if (err.message.includes('websocket') && this.socket) {
                    console.log('Detected WebSocket protocol issue, forcing polling...');
                    this.socket.io.opts.transports = ['polling'];
                }
            });

            this.socket.on('disconnect', (reason) => {
                console.log('Socket disconnected:', reason);
                this.lastRegisteredUserId = null;
                // Reconnect if server dropped us
                if (reason === 'io server disconnect') {
                    this.socket?.connect();
                }
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
        if (this.socket?.connected) {
            this.socket.emit(event, data);
        } else {
            console.log(`Socket not connected, cannot emit: ${event}`);
        }
    }

    register(userId: string) {
        if (this.socket && this.lastRegisteredUserId !== userId) {
            this.socket.emit('register', userId);
            this.lastRegisteredUserId = userId;
            console.log(`Requested socket registration for user: ${userId}`);
        }
    }

    streamLocation(data: { targetId: string; latitude: number; longitude: number; jobId: string }) {
        if (this.socket?.connected) {
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
