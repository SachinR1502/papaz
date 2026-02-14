import { socketService } from '@/services/socket';
import Constants from 'expo-constants';
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';
// Note: These imports will fail if the native module is not linked (rebuild required)
// import { MediaStream, RTCPeerConnection, RTCSessionDescription } from 'react-native-webrtc';
import { useAuth } from './AuthContext';

// Mock signaling (In a real app, use Socket.io or Firestore)

type CallType = 'audio' | 'video';
type CallState = 'idle' | 'calling' | 'incoming' | 'connected' | 'ended';

interface CallContextType {
    callState: CallState;
    callType: CallType;
    caller: { id: string; name: string } | null;
    startCall: (userId: string, userName: string, type: CallType) => void;
    acceptCall: () => void;
    rejectCall: () => void;
    endCall: () => void;
    localStream: any | null;
    remoteStream: any | null;
    isMuted: boolean;
    toggleMute: () => void;
    switchCamera: () => void;
}

const CallContext = createContext<CallContextType | undefined>(undefined);

export const useCall = () => {
    const context = useContext(CallContext);
    if (!context) throw new Error('useCall must be used within a CallProvider');
    return context;
};

// Default WebRTC Config
const peerConstraints = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' }
    ]
};

export const CallProvider = ({ children }: { children: React.ReactNode }) => {
    const { user } = useAuth();
    const [callState, setCallState] = useState<CallState>('idle');
    const [callType, setCallType] = useState<CallType>('audio');
    const [caller, setCaller] = useState<{ id: string; name: string } | null>(null);
    const [localStream, setLocalStream] = useState<any | null>(null); // Use any to avoid import crash
    const [remoteStream, setRemoteStream] = useState<any | null>(null);
    const [isMuted, setIsMuted] = useState(false);

    const [incomingOffer, setIncomingOffer] = useState<any>(null);

    const peerConnection = useRef<any | null>(null);

    useEffect(() => {
        // Socket listeners for signaling
        socketService.on('call_offer', handleReceiveOffer);
        socketService.on('call_answer', handleReceiveAnswer);
        socketService.on('ice_candidate', handleReceiveIceCandidate);

        return () => {
            socketService.off('call_offer');
            socketService.off('call_answer');
            socketService.off('ice_candidate');
        };
    }, []);

    // Initializer for a fresh PeerConnection
    const createPeerConnection = () => {
        // Expo Go does not support WebRTC
        if (Constants.appOwnership === 'expo') {
            console.warn('WebRTC disabled in Expo Go');
            Alert.alert('Not Supported', 'Calls are not supported in Expo Go. Use a development build.');
            return null;
        }

        try {
            let WebRTC;
            try {
                WebRTC = require('react-native-webrtc');
            } catch (e) {
                // Module not resolvable
            }

            if (!WebRTC || !WebRTC.RTCPeerConnection) {
                console.warn('WebRTC not initialized');
                Alert.alert('Feature Unavailable', 'Voice calling requires a custom dev client. It does not work in Expo Go.');
                return null;
            }

            const { RTCPeerConnection } = WebRTC;
            const pc = new RTCPeerConnection(peerConstraints);

            pc.onicecandidate = (event: any) => {
                if (event.candidate && caller) {
                    socketService.emit('ice_candidate', { targetId: caller.id, candidate: event.candidate });
                }
            };

            pc.onaddstream = (event: any) => {
                setRemoteStream(event.stream);
            };
            return pc;
        } catch (e) {
            console.error('WebRTC Module Error', e);
            Alert.alert('Error', 'WebRTC initialization failed.');
            return null;
        }
    };

    const startCall = async (userId: string, userName: string, type: CallType) => {
        setCallType(type);
        setCaller({ id: userId, name: userName });
        setCallState('calling');

        const pc = createPeerConnection();
        if (!pc) {
            setCallState('idle');
            setCaller(null);
            return;
        }
        peerConnection.current = pc;

        try {
            // Get Local Stream
            let stream = null;
            try {
                const { mediaDevices } = require('react-native-webrtc');
                const isVideo = type === 'video';
                stream = await mediaDevices.getUserMedia({
                    audio: true,
                    video: isVideo ? { width: 640, height: 480, frameRate: 30, facingMode: 'user' } : false
                });
                setLocalStream(stream);
            } catch (e) {
                console.warn('Failed to get local stream', e);
            }

            if (stream) {
                pc.addStream(stream);
            }

            // Create Offer
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            // Send offer via socket
            socketService.emit('call_offer', {
                targetId: userId,
                callerId: user?.id,
                callerName: user?.name || 'User',
                sdp: offer,
                type
            });

        } catch (err) {
            console.error('Start call error:', err);
            Alert.alert('Error', 'Could not start call');
            endCall();
        }
    };

    const handleReceiveOffer = async (data: any) => {
        setCaller({ id: data.callerId, name: data.callerName });
        setCallType(data.type);
        setCallState('incoming');
        setIncomingOffer(data.sdp);
    };

    const handleReceiveAnswer = async (data: any) => {
        const pc = peerConnection.current;
        if (pc) {
            const { RTCSessionDescription } = require('react-native-webrtc');
            await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
            setCallState('connected');
        }
    };

    const handleReceiveIceCandidate = async (data: any) => {
        const pc = peerConnection.current;
        if (pc) {
            const { RTCIceCandidate } = require('react-native-webrtc');
            pc.addIceCandidate(new RTCIceCandidate(data.candidate));
        }
    };

    const acceptCall = async () => {
        setCallState('connected');

        const pc = createPeerConnection();
        if (!pc) {
            setCallState('idle');
            return;
        }
        peerConnection.current = pc;

        try {
            // Get Local Stream for Callee
            let stream = null;
            try {
                const { mediaDevices } = require('react-native-webrtc');
                const isVideo = callType === 'video';
                stream = await mediaDevices.getUserMedia({
                    audio: true,
                    video: isVideo ? { width: 640, height: 480, frameRate: 30, facingMode: 'user' } : false
                });
                setLocalStream(stream);
            } catch (e) {
                console.warn('Failed to get local stream', e);
            }

            if (stream) {
                pc.addStream(stream);
            }

            if (incomingOffer) {
                const { RTCSessionDescription } = require('react-native-webrtc');
                await pc.setRemoteDescription(new RTCSessionDescription(incomingOffer));

                const answer = await pc.createAnswer();
                await pc.setLocalDescription(answer);

                socketService.emit('call_answer', {
                    targetId: caller?.id,
                    sdp: answer
                });
            }
        } catch (e) {
            console.error(e);
            Alert.alert('Error', 'Could not accept call');
            endCall();
        }
    };

    const rejectCall = () => {
        // Emit 'call_rejected' event if dealing with real backend
        endCall();
    };

    const endCall = () => {
        if (localStream) {
            localStream.getTracks().forEach((t: any) => t.stop());
            // localStream.release(); // Removed as it might not be a function
        }
        if (peerConnection.current) {
            peerConnection.current.close();
        }
        setLocalStream(null);
        setRemoteStream(null);
        setCallState('idle');
        setCaller(null);
        setIncomingOffer(null);
        setIsMuted(false);
    };

    const toggleMute = () => {
        if (localStream) {
            localStream.getAudioTracks().forEach((track: any) => {
                track.enabled = !track.enabled;
            });
            setIsMuted(!isMuted);
        }
    };

    const switchCamera = () => {
        if (localStream) {
            localStream.getVideoTracks().forEach((track: any) => {
                // @ts-ignore - _switchCamera is a private API method often used in RN-WebRTC, or standard logic
                if (typeof track._switchCamera === 'function') {
                    track._switchCamera();
                }
            });
        }
    };

    // NOTE: This implementation requires 'react-native-webrtc' to be properly linked.
    // If you see "native module not found", you must run: npx expo run:android OR npx expo run:ios

    return (
        <CallContext.Provider value={{
            callState,
            callType,
            caller,
            startCall,
            acceptCall,
            rejectCall,
            endCall,
            localStream,
            remoteStream,
            isMuted,
            toggleMute,
            switchCamera
        }}>
            {children}
        </CallContext.Provider>
    );
};
