import { chatService } from '@/services/chatService';
import { socketService } from '@/services/socket';
import { ChatConversation, ChatMessage } from '@/types/chat';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';

interface ChatContextType {
    conversations: ChatConversation[];
    messages: Record<string, ChatMessage[]>;
    getMessages: (conversationId: string) => ChatMessage[];
    sendMessage: (conversationId: string, content: string, type?: 'text' | 'image', senderRole?: string) => void;
    markAsRead: (conversationId: string) => void;
    createConversation: (participants: { userId: string; role: string; name: string }[], contextId?: string) => string;
    loadConversationMessages: (conversationId: string) => Promise<void>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChat = () => {
    const context = useContext(ChatContext);
    if (!context) throw new Error('useChat must be used within a ChatContext');
    return context;
};

export const ChatProvider = ({ children }: { children: React.ReactNode }) => {
    const { user } = useAuth();
    const [conversations, setConversations] = useState<ChatConversation[]>([]);
    const [messages, setMessages] = useState<Record<string, ChatMessage[]>>({});

    // Initialize Socket
    useEffect(() => {
        const socket = socketService.connect();

        const userId = user?.id || user?._id;

        if (user && userId) {
            console.log('Registering socket for user:', userId);
            socket?.emit('register', userId); // Register user ID with server
        }

        const handleNewMessage = (msg: ChatMessage) => {
            console.log('New Message Received:', msg);
            receiveMessage(msg);
        };

        const handleMessagesRead = ({ conversationId }: { conversationId: string }) => {
            console.log('[ChatContext] Messages Read Event for:', conversationId);
            setMessages(prev => {
                const msgs = prev[conversationId] || [];
                return {
                    ...prev,
                    [conversationId]: msgs.map(m => m.senderId === userId ? { ...m, status: 'read' } : m)
                };
            });
        };

        socketService.on('new_message', handleNewMessage);
        socketService.on('messages_read', handleMessagesRead);

        return () => {
            socketService.off('new_message');
            socketService.off('messages_read');
            // Don't disconnect here if CallContext also uses it
        };
    }, [user]);

    const getMessages = (conversationId: string) => {
        return messages[conversationId] || [];
    };

    const receiveMessage = (message: ChatMessage) => {
        console.log('[ChatContext] receiveMessage called:', message.id, message.conversationId);
        setMessages(prev => {
            const current = prev[message.conversationId] || [];

            // Prevent duplicates
            if (current.some(m => m.id === message.id)) {
                return prev;
            }

            console.log(`[ChatContext] Updating messages for ${message.conversationId}. Prev count: ${current.length}, New count: ${current.length + 1}`);
            return {
                ...prev,
                [message.conversationId]: [...current, message]
            };
        });

        setConversations(prev => {
            // Check if conversation exists, if not create it (syncing incoming message context)
            const exists = prev.find(c => c.id === message.conversationId);
            if (exists) {
                return prev.map(c => c.id === message.conversationId ? {
                    ...c,
                    lastMessage: message,
                    unreadCount: c.unreadCount + 1,
                    updatedAt: message.timestamp
                } : c);
            } else {
                console.log('[ChatContext] Incoming message for new conversation. Pending conversation sync.');
                // Determine participants from message if possible or generic
                // This handles case where receiver gets message for conversation they didn't create locally yet
                // For now, we skip creating conversation object here as UI might reload or fetch it
                return prev;
            }
        });
    };

    const sendMessage = async (conversationId: string, content: string, type: 'text' | 'image' = 'text') => {
        console.log('[ChatContext] sendMessage start:', conversationId, content);

        const userId = user?.id || user?._id;

        if (!user || !userId) {
            console.log('[ChatContext] sendMessage abort: No user ID found (checked id and _id)');
            return;
        }

        // Find receiver
        const conversation = conversations.find(c => c.id === conversationId);
        // Note: receiver check might need similar fallback if participants uses id vs _id inconsistency
        const receiver = conversation?.participants.find(p => p.userId !== userId);

        const senderRole = user.role === 'customer' ? 'customer' :
            user.role === 'admin' ? 'admin' :
                user.role === 'technician' ? 'technician' : 'supplier';

        const newMessage: ChatMessage = {
            id: 'm_' + Date.now(),
            conversationId,
            senderId: userId,
            senderRole: senderRole as any,
            content,
            messageType: type,
            timestamp: new Date().toISOString(),
            status: 'sent'
        };

        // UI Optimistic Update
        console.log('[ChatContext] Optimistic update:', newMessage.id);
        receiveMessage(newMessage);

        // Socket Emit
        console.log('[ChatContext] Emitting socket message to target:', receiver?.userId);
        socketService.emit('send_message', { ...newMessage, targetId: receiver?.userId });

        // Persist to Backend
        try {
            await chatService.sendMessage({
                conversationId,
                content,
                messageType: type,
                targetId: receiver?.userId,
                senderRole // Optional if backend needs it explicit
            });
            console.log('[ChatContext] Message persisted to backend success');
        } catch (e) {
            console.error("Failed to save message to backend", e);
        }
    };

    const markAsRead = async (conversationId: string) => {
        setConversations(prev => prev.map(c => c.id === conversationId ? { ...c, unreadCount: 0 } : c));

        // Update local messages status
        const userId = user?.id || user?._id;
        setMessages(prev => {
            const msgs = prev[conversationId] || [];
            if (msgs.every(m => m.senderId === userId || m.status === 'read')) return prev;

            return {
                ...prev,
                [conversationId]: msgs.map(m => m.senderId !== userId ? { ...m, status: 'read' } : m)
            };
        });

        const receiver = conversations.find(c => c.id === conversationId)?.participants.find(p => p.userId !== userId);
        if (receiver) {
            socketService.emit('mark_read', { conversationId, targetId: receiver.userId });
        }

        try {
            await chatService.markAsRead(conversationId);
        } catch (e) { console.error("Mark read API failed", e); }
    };

    const createConversation = (participants: { userId: string; role: string; name: string }[], contextId?: string) => {
        // Deterministic ID based on context (Job ID)
        if (contextId) {
            const deterministicId = `chat_${contextId}`;
            const existingWithContext = conversations.find(c => c.id === deterministicId);
            if (existingWithContext) return deterministicId;

            // If strictly creating new based on context, we check if it's already in the list
            // The next block checks by participants, but if we have contextId, we prefer that ID format.
        }

        const existing = conversations.find(c =>
            c.participants.every(p => participants.some(np => np.userId === p.userId))
        );
        if (existing) return existing.id;

        const newId = contextId ? `chat_${contextId}` : 'c_' + Date.now();

        const newConv: ChatConversation = {
            id: newId,
            participants: participants as any,
            unreadCount: 0,
            updatedAt: new Date().toISOString()
        };
        setConversations(prev => {
            if (prev.find(c => c.id === newId)) return prev;
            return [newConv, ...prev];
        });
        return newId;
    };

    const loadConversationMessages = async (conversationId: string) => {
        try {
            const msgs = await chatService.getMessages(conversationId);
            setMessages(prev => ({
                ...prev,
                [conversationId]: msgs
            }));
        } catch (e) {
            console.error("Failed to load messages:", e);
        }
    };

    return (
        <ChatContext.Provider value={{
            conversations,
            messages,
            getMessages,
            sendMessage,
            markAsRead,
            createConversation,
            loadConversationMessages
        }}>
            {children}
        </ChatContext.Provider>
    );
};
