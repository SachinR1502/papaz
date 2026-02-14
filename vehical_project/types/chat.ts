
export type MessageType = 'text' | 'image' | 'location';

export interface ChatMessage {
    id: string;
    conversationId: string;
    senderId: string;
    senderRole: 'customer' | 'technician' | 'store' | 'admin';
    content: string;
    messageType: MessageType;
    timestamp: string;
    status: 'sent' | 'delivered' | 'read';
    // isRead: boolean; // Deprecated
}

export interface ChatConversation {
    id: string;
    participants: {
        userId: string;
        role: 'customer' | 'technician' | 'store' | 'admin';
        name: string;
        avatar?: string;
    }[];
    lastMessage?: ChatMessage;
    unreadCount: number;
    updatedAt: string;
    relatedJobId?: string; // Optional link to a job
}
