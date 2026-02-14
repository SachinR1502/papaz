import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useNetworkStatus, useOfflineQueue } from '@/hooks/useOfflineQueue';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Animated, StyleSheet, Text } from 'react-native';

export const NetworkStatusBar: React.FC = () => {
    const { isOnline } = useNetworkStatus();
    const { queueSize } = useOfflineQueue();
    const [visible, setVisible] = useState(false);
    const slideAnim = useState(new Animated.Value(-100))[0];

    const colorScheme = useColorScheme();
    const theme = colorScheme ?? 'light';
    const colors = Colors[theme];

    useEffect(() => {
        if (!isOnline || queueSize > 0) {
            setVisible(true);
            Animated.spring(slideAnim, {
                toValue: 0,
                useNativeDriver: true,
                tension: 50,
                friction: 7,
            }).start();
        } else {
            Animated.timing(slideAnim, {
                toValue: -100,
                duration: 300,
                useNativeDriver: true,
            }).start(() => setVisible(false));
        }
    }, [isOnline, queueSize]);

    if (!visible) return null;

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    backgroundColor: isOnline ? '#FF9500' : '#FF3B30',
                    transform: [{ translateY: slideAnim }],
                },
            ]}
        >
            <Ionicons
                name={isOnline ? 'cloud-upload-outline' : 'cloud-offline-outline'}
                size={16}
                color="#FFF"
            />
            <Text style={styles.text}>
                {isOnline
                    ? `Syncing ${queueSize} ${queueSize === 1 ? 'item' : 'items'}...`
                    : 'You are offline. Changes will sync when online.'}
            </Text>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
        paddingTop: 50, // Account for status bar
        gap: 8,
        zIndex: 9999,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5,
    },
    text: {
        color: '#FFF',
        fontSize: 13,
        fontWeight: '600',
        fontFamily: 'NotoSans-Bold',
    },
});
