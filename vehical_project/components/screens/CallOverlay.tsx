import { useCall } from '@/context/CallContext';
import { useLanguage } from '@/context/LanguageContext';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Dimensions, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
const { width, height } = Dimensions.get('window');

// Safe webRTC View wrapper to prevent crashes if native module is missing
const SafeRTCView = (props: any) => {
    try {
        const { RTCView } = require('react-native-webrtc');
        return <RTCView {...props} />;
    } catch (e) {
        return <View style={[props.style, { backgroundColor: '#333', justifyContent: 'center', alignItems: 'center' }]}>
            <Text style={{ color: '#fff', fontSize: 10 }}>Video Preview Unavailable</Text>
        </View>;
    }
};

export default function CallOverlay() {
    const { t } = useLanguage();
    const { callState, callType, caller, acceptCall, rejectCall, endCall, localStream, remoteStream, isMuted, toggleMute, switchCamera } = useCall();
    const [duration, setDuration] = useState(0);

    // ... (keep useEffect and formatTime)

    useEffect(() => {
        let timer: any;
        if (callState === 'connected') {
            timer = setInterval(() => {
                setDuration(prev => prev + 1);
            }, 1000);
        } else {
            setDuration(0);
        }
        return () => clearInterval(timer);
    }, [callState]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    if (callState === 'idle') return null;

    return (
        <Modal visible={true} animationType="slide" transparent={false}>
            <View style={styles.container}>
                {/* Background Video Layer */}
                {callType === 'video' && localStream && (
                    <View style={styles.fullScreenVideo}>
                        {remoteStream ? (
                            <SafeRTCView
                                streamURL={remoteStream.toURL()}
                                style={styles.remoteVideo}
                                objectFit="cover"
                            />
                        ) : (
                            <View style={[styles.remoteVideo, { backgroundColor: '#1A1A1A' }]} />
                        )}
                        {/* Local PiP */}
                        <View style={styles.localVideoContainer}>
                            <SafeRTCView
                                streamURL={localStream.toURL()}
                                style={styles.localVideo}
                                objectFit="cover"
                                zOrder={1}
                            />
                        </View>
                    </View>
                )}

                {/* Audio Or Calling UI Background */}
                {(callType === 'audio' || !localStream) && (
                    <View style={[styles.fullScreenVideo, { backgroundColor: '#202124' }]}>
                        <View style={styles.bgCircle} />
                    </View>
                )}

                <SafeAreaView style={styles.overlayContent}>
                    {/* Header Info */}
                    <View style={styles.header}>
                        <View style={styles.callerInfo}>
                            <Text style={styles.statusText}>
                                {callState === 'calling' ? t('Calling...') :
                                    callState === 'incoming' ? t('Incoming Call...') :
                                        callState === 'connected' ? t('Connected') : t('Ending...')}
                            </Text>
                            <Text style={styles.callerName}>{caller?.name || t('Unknown')}</Text>
                            {callState === 'connected' && (
                                <Text style={styles.timerText}>{formatTime(duration)}</Text>
                            )}
                        </View>
                    </View>

                    {/* Avatar for Audio Calls */}
                    {callType === 'audio' && (
                        <View style={styles.avatarContainer}>
                            <View style={styles.avatar}>
                                <Text style={styles.avatarText}>{caller?.name?.[0] || '?'}</Text>
                            </View>
                        </View>
                    )}

                    {/* Action Buttons */}
                    <View style={styles.controls}>
                        {callState === 'incoming' ? (
                            <View style={styles.incomingControls}>
                                <TouchableOpacity style={[styles.controlBtn, styles.declineBtn]} onPress={rejectCall}>
                                    <Ionicons name="close" size={32} color="#FFF" />
                                    <Text style={styles.btnLabel}>{t('Decline')}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={[styles.controlBtn, styles.acceptBtn]} onPress={acceptCall}>
                                    <Ionicons name="call" size={32} color="#FFF" />
                                    <Text style={styles.btnLabel}>{t('Accept')}</Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <View style={styles.activeControls}>
                                <View style={styles.controlRow}>
                                    <TouchableOpacity style={[styles.optionBtn, isMuted && styles.activeOption]} onPress={toggleMute}>
                                        <Ionicons name={isMuted ? "mic-off" : "mic"} size={24} color="#FFF" />
                                    </TouchableOpacity>

                                    {callType === 'video' && (
                                        <TouchableOpacity style={styles.optionBtn} onPress={switchCamera}>
                                            <Ionicons name="camera-reverse" size={24} color="#FFF" />
                                        </TouchableOpacity>
                                    )}

                                    <TouchableOpacity style={styles.optionBtn}>
                                        <Ionicons name="volume-high" size={24} color="#FFF" />
                                    </TouchableOpacity>
                                </View>

                                <TouchableOpacity style={styles.endCallBtn} onPress={endCall}>
                                    <MaterialCommunityIcons name="phone-hangup" size={32} color="#FFF" />
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                </SafeAreaView>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#1A1A1A' },
    fullScreenVideo: { ...StyleSheet.absoluteFillObject, zIndex: 0 },
    remoteVideo: { flex: 1, width: '100%', height: '100%' },
    localVideoContainer: {
        position: 'absolute',
        top: 60,
        right: 20,
        width: 100,
        height: 150,
        borderRadius: 12,
        overflow: 'hidden',
        borderWidth: 2,
        borderColor: '#FFF',
        backgroundColor: '#000',
        elevation: 10,
        shadowColor: '#000',
        shadowOpacity: 0.5,
        shadowRadius: 10
    },
    localVideo: { flex: 1 },

    bgCircle: {
        position: 'absolute',
        top: -100,
        left: -100,
        width: 500,
        height: 500,
        borderRadius: 250,
        backgroundColor: 'rgba(255,255,255,0.05)'
    },

    overlayContent: { flex: 1, justifyContent: 'space-between', zIndex: 2 },

    header: { alignItems: 'center', marginTop: 40 },
    callerInfo: { alignItems: 'center' },
    statusText: { color: '#B0B3B8', fontSize: 14, marginBottom: 8 },
    callerName: { color: '#E4E6EB', fontSize: 26, fontWeight: 'bold', marginBottom: 6 },
    timerText: { color: '#FFF', fontSize: 16, fontWeight: '600' },

    avatarContainer: { alignItems: 'center', justifyContent: 'center', flex: 1 },
    avatar: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#3A3B3C',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 4,
        borderColor: 'rgba(255,255,255,0.1)'
    },
    avatarText: { fontSize: 48, fontWeight: 'bold', color: '#FFF' },

    controls: { paddingBottom: 50, paddingHorizontal: 40 },

    incomingControls: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', paddingHorizontal: 20 },
    controlBtn: { alignItems: 'center', justifyContent: 'center', gap: 8 },
    declineBtn: { width: 70, height: 70, borderRadius: 35, backgroundColor: '#FF3B30' },
    acceptBtn: { width: 70, height: 70, borderRadius: 35, backgroundColor: '#34C759' },
    btnLabel: { color: '#FFF', fontSize: 14, fontWeight: '600', marginTop: 8 },

    activeControls: { alignItems: 'center', gap: 40 },
    controlRow: { flexDirection: 'row', gap: 30 },
    optionBtn: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: 'rgba(255,255,255,0.15)',
        justifyContent: 'center',
        alignItems: 'center'
    },
    activeOption: { backgroundColor: '#FFF' },

    endCallBtn: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: '#FF3B30',
        justifyContent: 'center',
        alignItems: 'center'
    }
});
