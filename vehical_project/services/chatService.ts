import api from './apiClient';

export const chatService = {
    getMessages: async (conversationId: string) => {
        const response = await api.get(`/chat/${conversationId}`);
        return (response.data || []).map((msg: any) => ({
            ...msg,
            id: msg._id || msg.id,
            senderId: msg.sender && typeof msg.sender === 'object' ? msg.sender._id : msg.sender,
            timestamp: msg.createdAt || msg.timestamp || new Date().toISOString()
        }));
    },
    sendMessage: async (data: { conversationId: string, content: string, messageType: string, targetId?: string, senderRole?: string }) => {
        const response = await api.post('/chat', data);
        const msg = response.data;
        return {
            ...msg,
            id: msg._id || msg.id,
            senderId: msg.sender && typeof msg.sender === 'object' ? msg.sender._id : msg.sender,
            timestamp: msg.createdAt || msg.timestamp || new Date().toISOString()
        };
    },
    markAsRead: async (conversationId: string) => {
        const response = await api.put(`/chat/${conversationId}/read`);
        return response.data;
    }
};
