import { Colors } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useChat } from '@/context/ChatContext';
import { useLanguage } from '@/context/LanguageContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ChatMessage } from '@/types/chat';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    Alert,
    FlatList,
    Image,
    KeyboardAvoidingView,
    Platform,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ChatScreen() {
    const { id } = useLocalSearchParams<{ id: string }>(); // Conversation ID
    const router = useRouter();
    const { user } = useAuth();
    const { sendMessage, conversations, loadConversationMessages, messages: allMessages, markAsRead } = useChat();
    const { t } = useLanguage();

    const [inputText, setInputText] = useState('');
    const flatListRef = useRef<FlatList>(null);

    // Reactive messages list (Sorted Newest First)
    // Create copy before sort to avoid mutation
    const messages = allMessages[id || '']
        ? [...allMessages[id || '']].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        : [];

    const colorScheme = useColorScheme();
    const theme = colorScheme ?? 'light';
    const colors = Colors[theme];
    const isDark = theme === 'dark';

    const userId = user?.id || user?._id;
    const conversation = conversations.find(c => c.id === id);
    const otherParticipant = conversation?.participants.find(p => p.userId !== userId); // Use robust userId

    // Load history on mount
    useEffect(() => {
        if (id) {
            loadConversationMessages(id);
            markAsRead(id); // Mark as read on enter
        }
    }, [id]);

    // Mark as read when new messages arrive while on this screen
    useEffect(() => {
        if (id && messages.length > 0) {
            const hasUnread = messages.some(m => m.senderId !== userId && m.status !== 'read');
            if (hasUnread) {
                markAsRead(id);
            }
        }
    }, [messages, id]);

    const handleSend = () => {
        if (!inputText.trim() || !user || !id) return;

        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        sendMessage(id, inputText, 'text');
        setInputText('');
    };

    const renderMessage = ({ item }: { item: ChatMessage }) => {
        const isMe = item.senderId === userId;
        const isOptimistic = item.id.toString().startsWith('m_');

        let statusIcon = "time-outline";
        let statusColor = "rgba(255,255,255,0.7)";

        if (!isOptimistic) {
            if (item.status === 'read') {
                statusIcon = "checkmark-done";
                statusColor = "#34B7F1";
            } else if (item.status === 'delivered') {
                statusIcon = "checkmark-done";
                statusColor = "rgba(255,255,255,0.7)";
            } else {
                statusIcon = "checkmark";
                statusColor = "rgba(255,255,255,0.7)";
            }
        }

        const timeString = new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        return (
            <View style={[styles.msgContainer, isMe ? styles.msgMe : styles.msgOther]}>
                <View style={[
                    styles.bubble,
                    isMe ? { backgroundColor: colors.primary, borderTopRightRadius: 0 } : { backgroundColor: colors.card, borderTopLeftRadius: 0 }
                ]}>
                    <Text style={[styles.msgText, isMe ? styles.textMe : { color: colors.text }]}>
                        {item.content}
                    </Text>
                    <View style={styles.metaContainer}>
                        <Text style={[styles.timestamp, isMe ? styles.timeMe : { color: colors.icon }]}>
                            {timeString}
                        </Text>
                        {isMe && (
                            <Ionicons name={statusIcon as any} size={16} color={statusColor} style={{ marginLeft: 4 }} />
                        )}
                    </View>
                </View>
            </View>
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

            <SafeAreaViewEdges />

            <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <View style={styles.headerInfo}>
                    <Image source={{ uri: otherParticipant?.avatar || 'https://via.placeholder.com/150' }} style={styles.avatar} />
                    <View>
                        <Text style={[styles.headerName, { color: colors.text }]}>{otherParticipant?.name || t('chat')}</Text>
                        <Text style={[styles.headerRole, { color: colors.icon }]}>{otherParticipant?.role || ''}</Text>
                    </View>
                </View>
                <TouchableOpacity style={styles.callBtn} onPress={() => Alert.alert("Call", "Calling functionality coming next...")}>
                    <Ionicons name="call-outline" size={22} color={colors.primary} />
                </TouchableOpacity>
            </View>

            <FlatList
                ref={flatListRef}
                data={messages}
                renderItem={renderMessage}
                keyExtractor={item => item.id}
                inverted
                contentContainerStyle={styles.listContent}
            />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 0}
            >
                <View style={[styles.inputContainer, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
                    <TextInput
                        style={[styles.input, { backgroundColor: isDark ? colors.background : '#F0F0F0', color: colors.text }]}
                        value={inputText}
                        onChangeText={setInputText}
                        placeholder={t('chat_placeholder')}
                        placeholderTextColor={colors.icon}
                        multiline
                    />
                    <TouchableOpacity
                        style={[styles.sendBtn, { backgroundColor: colors.primary }]}
                        onPress={handleSend}
                        disabled={!inputText.trim()}
                    >
                        <Ionicons name="send" size={20} color="#FFF" />
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </View>
    );
}

// Helper for top safe area only background
function SafeAreaViewEdges() {
    return <SafeAreaView edges={['top']} style={{ backgroundColor: 'transparent' }} />;
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        paddingTop: Platform.OS === 'android' ? 10 : 16
    },
    backBtn: { marginRight: 15 },
    headerInfo: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
    avatar: { width: 40, height: 40, borderRadius: 20 },
    headerName: { fontSize: 16, fontFamily: 'NotoSans-Bold' },
    headerRole: { fontSize: 12, fontFamily: 'NotoSans-Regular', textTransform: 'capitalize' },
    callBtn: { padding: 8 },

    listContent: { padding: 15, paddingBottom: 20 },
    msgContainer: { marginBottom: 10, flexDirection: 'row' },
    msgMe: { justifyContent: 'flex-end' },
    msgOther: { justifyContent: 'flex-start' },
    bubble: { maxWidth: '80%', padding: 12, borderRadius: 20 },
    msgText: { fontSize: 15, lineHeight: 20, fontFamily: 'NotoSans-Regular' },
    textMe: { color: '#FFF' },
    timestamp: { fontSize: 10, fontFamily: 'NotoSans-Regular' },
    timeMe: { color: 'rgba(255,255,255,0.7)' },
    metaContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', marginTop: 4 },

    inputContainer: {
        flexDirection: 'row',
        padding: 10,
        alignItems: 'center',
        gap: 10,
        borderTopWidth: 1,
        paddingBottom: Platform.OS === 'ios' ? 30 : 10
    },
    input: {
        flex: 1,
        borderRadius: 20,
        paddingHorizontal: 15,
        paddingVertical: 10,
        maxHeight: 100,
        fontSize: 15,
        fontFamily: 'NotoSans-Regular'
    },
    sendBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center'
    }
});
