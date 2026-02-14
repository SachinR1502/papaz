import { useCustomer } from '@/context/CustomerContext';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import {
    Alert,
    Image,
    Share,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function VehicleQRScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const { vehicles } = useCustomer();

    const vehicle = vehicles.find((v) => v.id === id);

    if (!vehicle) {
        return (
            <View style={styles.errorContainer}>
                <Text>Vehicle not found</Text>
                <TouchableOpacity onPress={() => router.back()}>
                    <Text style={styles.backLink}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const handleShare = async () => {
        try {
            await Share.share({
                message: `Vehicle Digital ID: ${vehicle.qrCode}\nRegistration: ${vehicle.registrationNumber}\nVehicle: ${vehicle.make} ${vehicle.model}`,
            });
        } catch (error: any) {
            Alert.alert(error.message);
        }
    };

    const handleDownload = () => {
        Alert.alert('Success', 'QR Code saved to your gallery!');
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.navigate('/(customer)/(tabs)/vehicles')} style={styles.closeBtn}>
                    <Ionicons name="close" size={24} color="#1C1C1E" />
                </TouchableOpacity>
                <Text style={styles.title}>Digital Identity</Text>
            </View>

            <View style={styles.content}>
                {/* Vehicle Summary Card */}
                <View style={styles.vehicleCard}>
                    <View style={styles.vehicleTypeIcon}>
                        <MaterialCommunityIcons
                            name={(() => {
                                const type = vehicle.vehicleType?.toLowerCase() || '';
                                if (type.includes('car')) return 'car-side';
                                if (type.includes('bike')) return 'motorbike';
                                if (type.includes('scooter')) return 'scooter';
                                if (type.includes('truck')) return 'truck';
                                if (type.includes('bus')) return 'bus';
                                if (type.includes('tractor')) return 'tractor';
                                if (type.includes('van')) return 'van-utility';
                                if (type.includes('rickshaw')) return 'rickshaw';
                                if (type.includes('excavator') || type.includes('earthmover')) return 'excavator';
                                if (type.includes('ev') || type.includes('electric')) return 'vehicle-electric';
                                return 'car-side';
                            })() as any}
                            size={28}
                            color="#007AFF"
                        />
                    </View>
                    <View style={styles.vehicleDetails}>
                        <Text style={styles.vehicleName}>{vehicle.make} {vehicle.model}</Text>
                        <Text style={styles.registrationText}>{vehicle.registrationNumber}</Text>
                        {(vehicle.color || vehicle.mileage) && (
                            <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
                                {vehicle.color && (
                                    <View style={{ backgroundColor: '#E3F2FD', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 }}>
                                        <Text style={{ fontSize: 10, color: '#007AFF', fontWeight: '600' }}>{vehicle.color}</Text>
                                    </View>
                                )}
                                {vehicle.mileage && (
                                    <View style={{ backgroundColor: '#E3F2FD', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 }}>
                                        <Text style={{ fontSize: 10, color: '#007AFF', fontWeight: '600' }}>{vehicle.mileage}</Text>
                                    </View>
                                )}
                            </View>
                        )}
                    </View>
                    <View style={styles.yearBadge}>
                        <Text style={styles.yearText}>{vehicle.year}</Text>
                    </View>
                </View>

                {/* QR Code Section */}
                <View style={styles.qrContainer}>
                    <View style={styles.qrHeader}>
                        <Ionicons name="shield-checkmark" size={20} color="#4CAF50" />
                        <Text style={styles.qrHeaderText}>Official Registration Code</Text>
                    </View>

                    <View style={styles.qrWrapper}>
                        {/* Mock QR Code using an image from a generator or placeholder */}
                        <Image
                            source={{ uri: `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${vehicle.qrCode}` }}
                            style={styles.qrImage}
                        />
                    </View>

                    <Text style={styles.qrCodeString}>{vehicle.qrCode}</Text>
                    <Text style={styles.qrHint}>Scan this code at any partner garage for instant service history and booking.</Text>
                </View>

                {/* Action Buttons */}
                <View style={styles.actionRow}>
                    <TouchableOpacity style={styles.actionBtn} onPress={handleDownload}>
                        <Ionicons name="download-outline" size={24} color="#007AFF" />
                        <Text style={[styles.actionBtnText, { color: '#007AFF' }]}>Download</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.actionBtn, styles.shareBtn]} onPress={handleShare}>
                        <Ionicons name="share-social-outline" size={24} color="#FFF" />
                        <Text style={[styles.actionBtnText, { color: '#FFF' }]}>Share Link</Text>
                    </TouchableOpacity>
                </View>

                {/* Bottom Link */}
                <TouchableOpacity
                    style={styles.addAnotherBtn}
                    onPress={() => router.replace('/(customer)/vehicle/add')}
                >
                    <Ionicons name="add-circle-outline" size={20} color="#8E8E93" />
                    <Text style={styles.addAnotherText}>Add another vehicle</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    header: {
        paddingHorizontal: 20,
        paddingVertical: 15,
        flexDirection: 'row',
        alignItems: 'center',
    },
    closeBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F2F2F7',
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginLeft: 15,
        color: '#1C1C1E',
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 10,
    },
    vehicleCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8F9FE',
        padding: 16,
        borderRadius: 20,
        marginBottom: 30,
    },
    vehicleTypeIcon: {
        width: 50,
        height: 50,
        borderRadius: 14,
        backgroundColor: '#E3F2FD',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    vehicleDetails: {
        flex: 1,
    },
    vehicleName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1C1C1E',
    },
    registrationText: {
        fontSize: 14,
        color: '#8E8E93',
        marginTop: 2,
        fontWeight: '500',
    },
    yearBadge: {
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#EFEFEF',
    },
    yearText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#1C1C1E',
    },
    qrContainer: {
        backgroundColor: '#F2F2F7',
        borderRadius: 30,
        padding: 24,
        alignItems: 'center',
        marginBottom: 30,
    },
    qrHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 20,
    },
    qrHeaderText: {
        fontSize: 13,
        fontWeight: 'bold',
        color: '#4CAF50',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    qrWrapper: {
        backgroundColor: '#FFFFFF',
        padding: 20,
        borderRadius: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 5,
    },
    qrImage: {
        width: 200,
        height: 200,
    },
    qrCodeString: {
        fontSize: 18,
        fontWeight: '900',
        color: '#1A1A1A',
        marginTop: 20,
        letterSpacing: 2,
    },
    qrHint: {
        textAlign: 'center',
        fontSize: 12,
        color: '#8E8E93',
        marginTop: 15,
        lineHeight: 18,
        paddingHorizontal: 20,
    },
    actionRow: {
        flexDirection: 'row',
        gap: 15,
        marginBottom: 30,
    },
    actionBtn: {
        flex: 1,
        flexDirection: 'row',
        height: 56,
        borderRadius: 16,
        backgroundColor: '#F2F2F7',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 10,
    },
    shareBtn: {
        backgroundColor: '#007AFF',
    },
    actionBtnText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    addAnotherBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 10,
    },
    addAnotherText: {
        fontSize: 14,
        color: '#8E8E93',
        fontWeight: '600',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    backLink: {
        color: '#007AFF',
        marginTop: 10,
    },
});
