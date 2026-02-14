import { getMediaUrl } from '@/utils/mediaHelpers';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';

interface AudioPlayerProps {
    uri: string | null;
    style?: ViewStyle;
}

export function AudioPlayer({ uri, style }: AudioPlayerProps) {
    const resolvedUri = getMediaUrl(uri);
    const [sound, setSound] = useState<Audio.Sound | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [duration, setDuration] = useState<number | null>(null);
    const [position, setPosition] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    console.log('[AudioPlayer] Initialized with:', { original: uri, resolved: resolvedUri });

    useEffect(() => {
        return () => {
            if (sound) {
                sound.unloadAsync();
            }
        };
    }, [sound]);

    const loadSound = async () => {
        if (!resolvedUri) {
            console.error('[AudioPlayer] No resolved URI available');
            return;
        }
        try {
            console.log('[AudioPlayer] Loading audio from:', resolvedUri);
            setIsLoading(true);
            const { sound: newSound, status } = await Audio.Sound.createAsync(
                { uri: resolvedUri },
                { shouldPlay: true },
                onPlaybackStatusUpdate
            );
            setSound(newSound);
            if (status.isLoaded) {
                setDuration(status.durationMillis || 0);
                setIsPlaying(true);
                console.log('[AudioPlayer] Audio loaded successfully, duration:', status.durationMillis);
            }
        } catch (error) {
            console.error('[AudioPlayer] Error loading sound:', error);
            console.error('[AudioPlayer] Failed URI:', resolvedUri);
        } finally {
            setIsLoading(false);
        }
    };

    const onPlaybackStatusUpdate = (status: any) => {
        if (status.isLoaded) {
            setPosition(status.positionMillis);
            setDuration(status.durationMillis || 0);
            setIsPlaying(status.isPlaying);
            if (status.didJustFinish) {
                setIsPlaying(false);
                setPosition(0);
                // Optional: replay or reset logic
                // sound?.setPositionAsync(0);
            }
        }
    };

    const handlePress = async () => {
        if (!sound) {
            await loadSound();
        } else {
            if (isPlaying) {
                await sound.pauseAsync();
            } else {
                if (position && duration && position >= duration) {
                    await sound.setPositionAsync(0);
                }
                await sound.playAsync();
            }
        }
    };

    const formatTime = (millis: number) => {
        const totalSeconds = millis / 1000;
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = Math.floor(totalSeconds % 60);
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    return (
        <View style={[styles.container, style]}>
            <TouchableOpacity
                style={styles.playButton}
                onPress={handlePress}
                disabled={isLoading}
            >
                {isLoading ? (
                    <ActivityIndicator color="#FFF" size="small" />
                ) : (
                    <Ionicons name={isPlaying ? "pause" : "play"} size={20} color="#FFF" />
                )}
            </TouchableOpacity>

            <View style={styles.content}>
                <View style={styles.trackContainer}>
                    <View style={styles.trackBar}>
                        <View style={[
                            styles.trackProgress,
                            {
                                width: duration && position
                                    ? `${(position / duration) * 100}%`
                                    : '0%'
                            }
                        ]} />
                    </View>
                </View>
                <Text style={styles.timeText}>
                    {position ? formatTime(position) : '0:00'} / {duration ? formatTime(duration) : '--:--'}
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F2F2F7',
        borderRadius: 12,
        padding: 8,
        paddingRight: 16,
        gap: 12,
        height: 56,
    },
    playButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#007AFF', // Using standard blue or primary color
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        gap: 6
    },
    trackContainer: {
        height: 4,
        width: '100%',
        justifyContent: 'center'
    },
    trackBar: {
        height: 4,
        backgroundColor: '#D1D1D6',
        borderRadius: 2,
        overflow: 'hidden'
    },
    trackProgress: {
        height: '100%',
        backgroundColor: '#007AFF',
    },
    timeText: {
        fontSize: 10,
        color: '#8E8E93',
        fontFamily: 'NotoSans-Medium',
        textAlign: 'right'
    }
});
