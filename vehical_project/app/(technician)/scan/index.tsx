import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    Alert,
    Animated,
    LayoutAnimation,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    UIManager,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

if (Platform.OS === 'android') {
    if (UIManager.setLayoutAnimationEnabledExperimental) {
        UIManager.setLayoutAnimationEnabledExperimental(true);
    }
}

export default function ScannerScreen() {
    const router = useRouter();

    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const colors = {
        background: isDark ? '#000000' : '#FFFFFF',
        text: isDark ? '#FFFFFF' : '#1A1A1A',
        subText: isDark ? '#A1A1A6' : '#8E8E93',
        card: isDark ? '#1C1C1E' : '#F2F2F7',
        primary: '#007AFF',
        secondary: '#5856D6',
        sales: '#34C759',
    };

    const [permission, requestPermission] = useCameraPermissions();
    const [activeTab, setActiveTab] = useState<'camera' | 'upload'>('camera');
    const [scanned, setScanned] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    // Animation for laser
    const laserAnim = useRef(new Animated.Value(0)).current;

    // Request permission on mount if camera
    useEffect(() => {
        if (!permission?.granted) {
            requestPermission();
        }
    }, [permission, requestPermission]);

    useEffect(() => {
        if (activeTab === 'camera' && !scanned) {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(laserAnim, {
                        toValue: 250,
                        duration: 1500,
                        useNativeDriver: false, // height/top layout property
                    }),
                    Animated.timing(laserAnim, {
                        toValue: 0,
                        duration: 0,
                        useNativeDriver: false,
                    })
                ])
            ).start();
        } else {
            laserAnim.stopAnimation();
        }
    }, [activeTab, scanned]);

    const handleTabChange = (tab: 'camera' | 'upload') => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setActiveTab(tab);
        setScanned(false);
        setUploadProgress(0);
    };

    const handleBarCodeScanned = ({ type, data }: { type: string, data: string }) => {
        if (scanned) return;
        setScanned(true);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        // Simple parser: assume data is ID, or "VEHICLE:ID"
        let vehicleId = data;
        if (data.startsWith('VEHICLE:')) {
            vehicleId = data.replace('VEHICLE:', '');
        }

        Alert.alert(
            "Vehicle Detected",
            `ID: ${vehicleId}\nView history for this vehicle?`,
            [
                { text: "Cancel", style: "cancel", onPress: () => setScanned(false) },
                {
                    text: "View History",
                    onPress: () => router.push({
                        pathname: '/(technician)/vehicle/[id]/history',
                        params: { id: vehicleId }
                    })
                }
            ]
        );
    };

    const handleUpload = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
        });

        if (!result.canceled) {
            setScanned(true);
            // Simulate scanning the uploaded image
            let progress = 0;
            const interval = setInterval(() => {
                progress += 20;
                setUploadProgress(progress);
                if (progress >= 100) {
                    clearInterval(interval);
                    Alert.alert("Scan Complete", `Successfully decoded QR from image. Vehicle ID: v-12345`, [
                        { text: "View Details", onPress: () => router.replace('/(technician)/vehicle/v-12345/history') }
                    ]);
                }
            }, 200);
        }
    };

    if (!permission) return <View style={{ flex: 1, backgroundColor: '#000' }} />;

    if (!permission.granted) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' }]}>
                <Text style={{ color: '#fff', textAlign: 'center', marginBottom: 20 }}>We need your permission to show the camera</Text>
                <TouchableOpacity onPress={requestPermission} style={{ padding: 10, backgroundColor: colors.primary, borderRadius: 8 }}>
                    <Text style={{ color: '#fff', fontWeight: 'bold' }}>Grant Permission</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const currentBg = activeTab === 'camera' ? '#000000' : colors.background;
    const currentText = activeTab === 'camera' ? '#FFFFFF' : colors.text;

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: currentBg }]} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={[styles.closeBtn, { backgroundColor: activeTab === 'camera' ? 'rgba(255,255,255,0.2)' : colors.card }]}>
                    <Ionicons name="close" size={24} color={currentText} />
                </TouchableOpacity>
                <Text style={[styles.title, { color: currentText }]}>Scan QR Code</Text>
                <View style={{ width: 40 }} />
            </View>

            {/* Toggle Tabs */}
            <View style={[styles.tabContainer, { backgroundColor: activeTab === 'camera' ? 'rgba(255,255,255,0.1)' : colors.card }]}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'camera' && { backgroundColor: 'rgba(255,255,255,0.2)' }]}
                    onPress={() => handleTabChange('camera')}
                >
                    <Ionicons name="camera-outline" size={20} color={activeTab === 'camera' ? '#FFF' : colors.subText} />
                    <Text style={[styles.tabText, { color: activeTab === 'camera' ? '#FFF' : colors.subText }]}>Camera</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'upload' && { backgroundColor: colors.background }]}
                    onPress={() => handleTabChange('upload')}
                >
                    <Ionicons name="image-outline" size={20} color={activeTab === 'upload' ? colors.text : (activeTab === 'camera' ? '#FFFFFF80' : colors.subText)} />
                    <Text style={[styles.tabText, { color: activeTab === 'upload' ? colors.text : (activeTab === 'camera' ? '#FFFFFF80' : colors.subText) }]}>Upload</Text>
                </TouchableOpacity>
            </View>

            {/* Content Area */}
            <View style={styles.content}>
                {activeTab === 'camera' ? (
                    <View style={styles.cameraBox}>
                        <View style={styles.cameraContainer}>
                            <CameraView
                                style={StyleSheet.absoluteFill}
                                facing="back"
                                onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
                                barcodeScannerSettings={{
                                    barcodeTypes: ["qr"],
                                }}
                            />
                            {/* Overlay Frame */}
                            <View style={[styles.scanFrame, { borderColor: scanned ? colors.sales : colors.primary }]}>
                                {!scanned && <Animated.View style={[styles.laser, { top: laserAnim, backgroundColor: colors.primary }]} />}
                                {scanned && (
                                    <View style={styles.successOverlay}>
                                        <Ionicons name="checkmark-circle" size={48} color={colors.sales} />
                                    </View>
                                )}
                            </View>
                        </View>
                        <Text style={[styles.hint, { color: '#BBB' }]}>{scanned ? 'Code Detected!' : 'Align QR code within frame'}</Text>
                    </View>
                ) : (
                    <View style={[styles.uploadBox, { backgroundColor: isDark ? '#1C1C1E' : '#F2F2F7', borderColor: colors.card }]}>
                        <View style={styles.placeholderImg}>
                            <Ionicons name="qr-code" size={80} color={colors.subText} />
                        </View>

                        {scanned ? (
                            <View style={styles.progressContainer}>
                                <Text style={[styles.processingText, { color: currentText }]}>Processing Image... {uploadProgress}%</Text>
                                <View style={[styles.progressBar, { backgroundColor: colors.card }]}>
                                    <View style={[styles.progressFill, { width: `${uploadProgress}%`, backgroundColor: colors.primary }]} />
                                </View>
                            </View>
                        ) : (
                            <Text style={[styles.hint, { color: colors.subText }]}>Upload an image containing a vehicle QR code.</Text>
                        )}
                    </View>
                )}
            </View>

            {/* Controls */}
            <View style={styles.footer}>
                {activeTab === 'camera' ? (
                    <TouchableOpacity
                        style={[styles.actionBtn, { backgroundColor: '#333', opacity: 0.5 }]}
                        disabled={true} // Camera is always scanning
                    >
                        <Text style={[styles.actionBtnText, { color: '#FFF' }]}>Scanning automatically...</Text>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity
                        style={[styles.actionBtn, { backgroundColor: colors.primary, opacity: scanned ? 0.8 : 1 }]}
                        onPress={handleUpload}
                        disabled={scanned}
                    >
                        {scanned ? (
                            <Text style={styles.actionBtnText}>Uploading...</Text>
                        ) : (
                            <>
                                <Ionicons name="cloud-upload-outline" size={24} color="#FFF" />
                                <Text style={styles.actionBtnText}>Upload from Gallery</Text>
                            </>
                        )}
                    </TouchableOpacity>
                )}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 20,
    },
    closeBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    tabContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginVertical: 10,
        marginHorizontal: 40,
        borderRadius: 20,
        padding: 4,
    },
    tab: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        borderRadius: 16,
        gap: 8,
    },
    tabText: {
        fontWeight: '600',
        fontSize: 14,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cameraBox: {
        alignItems: 'center',
    },
    cameraContainer: {
        width: 250,
        height: 250,
        borderRadius: 20,
        overflow: 'hidden',
        position: 'relative',
    },
    scanFrame: {
        ...StyleSheet.absoluteFillObject,
        borderWidth: 2,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    laser: {
        position: 'absolute',
        left: 0,
        right: 0,
        height: 2,
        opacity: 0.8,
        shadowColor: '#FFF',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        shadowRadius: 10,
    },
    successOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    uploadBox: {
        width: '80%',
        aspectRatio: 1,
        borderRadius: 20,
        borderWidth: 1,
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    placeholderImg: {
        marginBottom: 20,
    },
    progressContainer: {
        width: '100%',
        alignItems: 'center',
    },
    processingText: {
        marginBottom: 10,
        fontWeight: '600',
    },
    progressBar: {
        width: '100%',
        height: 6,
        borderRadius: 3,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
    },
    hint: {
        marginTop: 20,
        fontSize: 14,
        textAlign: 'center',
    },
    footer: {
        padding: 30,
        alignItems: 'center',
    },
    actionBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        width: '100%',
        height: 56,
        borderRadius: 16,
    },
    actionBtnText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
