import { AddAddressModal } from '@/components/customer/AddAddressModal';
import { AddressSelectionModal } from '@/components/customer/AddressSelectionModal';
import { BookingPreferenceSelector } from '@/components/customer/booking/BookingPreferenceSelector';
import { BookingSummary } from '@/components/customer/booking/BookingSummary';
import { SelectionTile } from '@/components/customer/booking/SelectionTile';
import { ServiceMethodTile } from '@/components/customer/booking/ServiceMethodTile';
import { GarageSelectionModal } from '@/components/customer/GarageSelectionModal';
import { MediaCaptureSection } from '@/components/customer/MediaCaptureSection';
import { VehicleSelectionModal } from '@/components/customer/VehicleSelectionModal';
import { AppButton } from '@/components/ui/AppButton';
import { Colors } from '@/constants/theme';
import { useCustomer } from '@/context/CustomerContext';
import { useLanguage } from '@/context/LanguageContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Dimensions,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const SERVICE_METHOD_PRICES: Record<string, number> = {
    on_spot: 199,
    home_pickup: 99,
    walk_in: 0
};

export default function CreateServiceRequest() {
    const router = useRouter();
    const { vehicleId: initialVehicleId, prefillDescription, serviceType: initialServiceType } = useLocalSearchParams<{
        vehicleId?: string;
        prefillDescription?: string;
        serviceType?: string;
    }>();

    const { vehicles, createServiceRequest, garages, loadGarages, profile, addNewAddress, updateAddress, uploadFile } = useCustomer();
    const { t } = useLanguage();

    const colorScheme = useColorScheme();
    const theme = colorScheme ?? 'light';
    const colors = Colors[theme];
    const isDark = theme === 'dark';

    // Form States
    const [selectedVehicleId, setSelectedVehicleId] = useState(initialVehicleId || '');
    const [description, setDescription] = useState(prefillDescription ? t(prefillDescription) : '');
    const [serviceType, setServiceType] = useState(initialServiceType || 'other');
    const [serviceMethod, setServiceMethod] = useState<'home_pickup' | 'on_spot' | 'walk_in'>('on_spot');
    const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
    const [useCurrentLocation, setUseCurrentLocation] = useState(false);
    const [currentLocation, setCurrentLocation] = useState<{ latitude: number, longitude: number, address: string } | null>(null);
    const [isBroadcast, setIsBroadcast] = useState(true);
    const [selectedGarageId, setSelectedGarageId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    // Media States
    const [photos, setPhotos] = useState<string[]>([]);
    const [voiceNote, setVoiceNote] = useState<string | null>(null);
    const [recording, setRecording] = useState<Audio.Recording | null>(null);
    const [isRecording, setIsRecording] = useState(false);
    const [recordingDuration, setRecordingDuration] = useState(0);

    // Modal States
    const [showVehicleModal, setShowVehicleModal] = useState(false);
    const [showAddressModal, setShowAddressModal] = useState(false);
    const [showAddAddressModal, setShowAddAddressModal] = useState(false);
    const [showGarageModal, setShowGarageModal] = useState(false);
    const [editingAddress, setEditingAddress] = useState<any>(null);

    const selectedVehicle = vehicles.find(v => v.id === selectedVehicleId);
    const selectedAddress = profile?.savedAddresses?.find((a: any) => a._id === selectedAddressId);
    const selectedGarage = garages.find(g => g.id === selectedGarageId);

    const activeAddress = useCurrentLocation ? currentLocation?.address : selectedAddress?.address;
    const activeCoords = useCurrentLocation ? { latitude: currentLocation?.latitude, longitude: currentLocation?.longitude } : {
        latitude: selectedAddress?.location?.coordinates?.[1],
        longitude: selectedAddress?.location?.coordinates?.[0]
    };

    // Effect: Handle Service Method Changes
    useEffect(() => {
        if (serviceMethod === 'walk_in') {
            setIsBroadcast(false); // Walk-in requires specific garage
        } else if (serviceMethod === 'home_pickup') {
            setIsBroadcast(true); // Pickup usually implies broadcasting to find nearest driver, or could be specific. Defaulting to broadcast for wider reach.
        }
        // on_spot can vary, so we leave user choice or existing state
    }, [serviceMethod]);

    useEffect(() => {
        if (activeCoords.latitude && activeCoords.longitude) {
            loadGarages(selectedVehicle?.vehicleType, activeCoords.latitude, activeCoords.longitude);
        }
    }, [selectedAddressId, selectedVehicleId, useCurrentLocation, serviceMethod]);

    const handleFetchCurrentLocation = async () => {
        try {
            setLoading(true);
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert(t('error'), t('location_permission_denied'));
                return;
            }

            let location = await Location.getCurrentPositionAsync({});
            const { latitude, longitude } = location.coords;

            let reverseGeocode = await Location.reverseGeocodeAsync({ latitude, longitude });
            if (reverseGeocode.length > 0) {
                const addr = reverseGeocode[0];
                const formattedAddr = `${addr.name || ''}, ${addr.street || ''}, ${addr.city || ''}, ${addr.region || ''} ${addr.postalCode || ''}`;
                setCurrentLocation({ latitude, longitude, address: formattedAddr });
                setUseCurrentLocation(true);
                setSelectedAddressId(null);
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
        } catch (error) {
            Alert.alert(t('error'), t('failed_to_get_location'));
        } finally {
            setLoading(false);
        }
    };

    // Media Handlers
    const handlePickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert(t('permission_denied'), t('camera_roll_permission_required'));
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsMultipleSelection: true,
            quality: 0.8,
        });

        if (!result.canceled) {
            setPhotos([...photos, ...result.assets.map(asset => asset.uri)]);
        }
    };

    const handleTakePhoto = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert(t('permission_denied'), t('camera_permission_required'));
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            quality: 0.8,
        });

        if (!result.canceled) {
            setPhotos([...photos, result.assets[0].uri]);
        }
    };

    const handleRemovePhoto = (index: number) => {
        setPhotos(photos.filter((_, i) => i !== index));
    };

    const handleStartRecording = async () => {
        try {
            const { status } = await Audio.requestPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert(t('permission_denied'), t('microphone_permission_required'));
                return;
            }

            await Audio.setAudioModeAsync({
                allowsRecordingIOS: true,
                playsInSilentModeIOS: true,
            });

            const { recording: newRecording } = await Audio.Recording.createAsync(
                Audio.RecordingOptionsPresets.HIGH_QUALITY
            );

            setRecording(newRecording);
            setIsRecording(true);

            // Start duration timer
            const interval = setInterval(() => {
                setRecordingDuration(prev => prev + 1);
            }, 1000);

            (newRecording as any).durationInterval = interval;
        } catch (error) {
            console.error('Failed to start recording:', error);
            Alert.alert(t('error'), t('recording_failed'));
        }
    };

    const handleStopRecording = async () => {
        if (!recording) return;

        try {
            setIsRecording(false);
            clearInterval((recording as any).durationInterval);
            setRecordingDuration(0);

            await recording.stopAndUnloadAsync();
            const uri = recording.getURI();
            setVoiceNote(uri);
            setRecording(null);

            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch (error) {
            console.error('Failed to stop recording:', error);
        }
    };

    const handleRemoveVoiceNote = () => {
        setVoiceNote(null);
    };

    const handleSubmit = async () => {
        if (!selectedVehicleId) {
            Alert.alert(t('error'), t('please_select_vehicle'));
            return;
        }

        if (!description.trim()) {
            Alert.alert(t('error'), t('please_enter_description'));
            return;
        }

        if (!activeAddress) {
            Alert.alert(t('error'), t('please_select_address'));
            return;
        }

        if (!isBroadcast && !selectedGarageId) {
            Alert.alert(t('error'), t('please_select_preferred_garage'));
            return;
        }

        setLoading(true);

        try {
            if (isBroadcast) {
                // Determine coordinates
                let coords = { latitude: 0, longitude: 0 };

                if (useCurrentLocation && currentLocation) {
                    coords = { latitude: currentLocation.latitude, longitude: currentLocation.longitude };
                } else if (selectedAddress && selectedAddress.location && selectedAddress.location.coordinates) {
                    // GeoJSON is [long, lat]
                    coords = {
                        latitude: selectedAddress.location.coordinates[1],
                        longitude: selectedAddress.location.coordinates[0]
                    };
                }

                if (!coords.latitude || !coords.longitude) {
                    Alert.alert(t('error'), t('invalid_location_coordinates'));
                    setLoading(false);
                    return;
                }
            }

            // Upload Photos
            const photoUrls = await Promise.all(photos.map(async (p) => {
                console.log('Uploading photo:', p);
                const res = await uploadFile(p, 'image');
                return res.url || res.path;
            }));

            // Upload Voice Note
            let voiceNoteUrl = null;
            if (voiceNote) {
                console.log('Uploading voice note:', voiceNote);
                const res = await uploadFile(voiceNote, 'audio');
                voiceNoteUrl = res.url || res.path;
            }

            console.log('[CREATE_REQUEST] Photo URLs:', photoUrls);
            console.log('[CREATE_REQUEST] Voice Note URL:', voiceNoteUrl);

            await createServiceRequest(
                selectedVehicleId,
                description,
                photoUrls,
                voiceNoteUrl,
                activeAddress,
                isBroadcast ? null : selectedGarageId,
                useCurrentLocation && currentLocation ? {
                    latitude: currentLocation.latitude,
                    longitude: currentLocation.longitude
                } : (selectedAddress?.location?.coordinates ? {
                    latitude: selectedAddress.location.coordinates[1],
                    longitude: selectedAddress.location.coordinates[0]
                } : { latitude: 0, longitude: 0 }),
                [], // requirements
                {
                    serviceMethod,
                    serviceType,
                    isBroadcast,
                    serviceCharge: SERVICE_METHOD_PRICES[serviceMethod]
                } as any
            );

            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

            Alert.alert(
                t('success'),
                t('service_request_created'),
                [
                    {
                        text: t('ok'),
                        onPress: () => router.push('/(customer)/(tabs)/history')
                    }
                ]
            );
        } catch (error: any) {
            Alert.alert(t('error'), error.message || t('something_went_wrong'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
            <Stack.Screen
                options={{
                    headerShown: true,
                    title: t('create_service_request'),
                    headerStyle: { backgroundColor: colors.card },
                    headerTintColor: colors.text,
                    headerShadowVisible: false,
                }}
            />

            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={100}
            >
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    overScrollMode="never"
                    bounces={true}
                >
                    {/* Header Intro */}
                    <View style={styles.introSection}>
                        <Text style={[styles.mainTitle, { color: colors.text }]}>{t('create_service_request')}</Text>
                        <Text style={[styles.mainSubtitle, { color: colors.icon }]}>{t('service_request_intro')}</Text>
                    </View>

                    {/* Service Method - MOVED TO TOP */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeaderRow}>
                            <View style={styles.sectionTitleGroup}>
                                <MaterialCommunityIcons name="cog" size={20} color={colors.primary} />
                                <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('service_method')}</Text>
                            </View>
                        </View>
                        <View style={styles.methodGrid}>
                            {[
                                { id: 'on_spot', title: 'service_on_spot', icon: 'map-marker-radius', desc: 'tech_comes_to_you', price: '₹199 Visit' },
                                { id: 'home_pickup', title: 'service_home_pickup', icon: 'car-pickup', desc: 'tech_picks_up_car', price: '₹99 Pickup' },
                                { id: 'walk_in', title: 'service_walk_in', icon: 'garage', desc: 'you_go_to_garage', price: 'Free Checkup' },
                            ].map((method) => (
                                <ServiceMethodTile
                                    key={method.id}
                                    id={method.id}
                                    title={method.title}
                                    description={method.desc}
                                    icon={method.icon}
                                    isActive={serviceMethod === method.id}
                                    price={method.price}
                                    onPress={() => {
                                        setServiceMethod(method.id as any);
                                        Haptics.selectionAsync();
                                    }}
                                />
                            ))}
                        </View>
                    </View>

                    {/* Vehicle Selection */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeaderRow}>
                            <View style={styles.sectionTitleGroup}>
                                <Ionicons name="car-sport" size={20} color={colors.primary} />
                                <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('select_vehicle')}</Text>
                            </View>
                        </View>
                        <SelectionTile
                            title={`${selectedVehicle?.make} ${selectedVehicle?.model}`}
                            subtitle={selectedVehicle?.registrationNumber || ''}
                            icon={<MaterialCommunityIcons name="car" />}
                            isSelected={!!selectedVehicleId}
                            onPress={() => setShowVehicleModal(true)}
                            placeholder={t('tap_to_select_vehicle')}
                        />
                    </View>

                    {/* Address Selection */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeaderRow}>
                            <View style={styles.sectionTitleGroup}>
                                <Ionicons name="location" size={20} color={colors.primary} />
                                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                                    {serviceMethod === 'walk_in' ? (t('your_location') || 'Your Location (for distance)') :
                                        serviceMethod === 'home_pickup' ? (t('pickup_location') || 'Pickup Location') :
                                            (t('vehicle_location') || 'Vehicle Location')}
                                </Text>
                            </View>
                            <TouchableOpacity
                                style={[styles.gpsBtn, { borderColor: useCurrentLocation ? colors.primary : colors.border, backgroundColor: useCurrentLocation ? colors.primary + '10' : 'transparent' }]}
                                onPress={handleFetchCurrentLocation}
                            >
                                <MaterialCommunityIcons name="crosshairs-gps" size={18} color={useCurrentLocation ? colors.primary : colors.icon} />
                                <Text style={[styles.gpsBtnText, { color: useCurrentLocation ? colors.primary : colors.icon }]}>
                                    {serviceMethod === 'walk_in' ? (t('use_my_location') || 'Use GPS') : (t('use_current_location') || 'Use GPS')}
                                </Text>
                            </TouchableOpacity>
                        </View>

                        <SelectionTile
                            title={useCurrentLocation ? t('current_location') : (selectedAddress?.label || '')}
                            subtitle={activeAddress || ''}
                            icon={<Ionicons name="location" />}
                            isSelected={!!activeAddress}
                            onPress={() => setShowAddressModal(true)}
                            onClear={useCurrentLocation ? () => { setUseCurrentLocation(false); setCurrentLocation(null); } : undefined}
                            placeholder={t('tap_to_select_address')}
                        />
                    </View>

                    {/* Description */}
                    <View style={styles.section}>
                        <View style={styles.sectionTitleGroup}>
                            <MaterialCommunityIcons name="comment-edit" size={20} color={colors.primary} />
                            <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('describe_issue')}</Text>
                        </View>
                        <TextInput
                            style={[
                                styles.textArea,
                                {
                                    color: colors.text,
                                    backgroundColor: isDark ? colors.card : '#FFF',
                                    borderColor: colors.border
                                }
                            ]}
                            value={description}
                            onChangeText={setDescription}
                            placeholder={t('describe_issue_placeholder')}
                            placeholderTextColor={colors.icon}
                            multiline
                            numberOfLines={4}
                            textAlignVertical="top"
                        />
                    </View>

                    {/* Media Capture */}
                    <View style={styles.section}>
                        <View style={styles.sectionTitleGroup}>
                            <Ionicons name="camera" size={20} color={colors.primary} />
                            <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('attachments')}</Text>
                        </View>
                        <MediaCaptureSection
                            photos={photos}
                            voiceNote={voiceNote}
                            isRecording={isRecording}
                            recordingDuration={recordingDuration}
                            onPickImage={handlePickImage}
                            onTakePhoto={handleTakePhoto}
                            onRemovePhoto={handleRemovePhoto}
                            onStartRecording={handleStartRecording}
                            onStopRecording={handleStopRecording}
                            onRemoveVoiceNote={handleRemoveVoiceNote}
                        />
                    </View>

                    {/* Booking Mode & Garage Selection */}
                    <View style={styles.section}>
                        <View style={styles.sectionTitleGroup}>
                            <Ionicons name="options" size={20} color={colors.primary} />
                            <Text style={[styles.sectionTitle, { color: colors.text }]}>
                                {serviceMethod === 'walk_in' ? (t('select_workshop') || 'Select Workshop') : (t('booking_preference') || 'Find Technician')}
                            </Text>
                        </View>

                        <BookingPreferenceSelector
                            isBroadcast={isBroadcast}
                            onToggle={(broadcast) => {
                                if (serviceMethod === 'walk_in' && broadcast) return; // Walk-in MUST be specific garage
                                setIsBroadcast(broadcast);
                                if (broadcast) setSelectedGarageId(null);
                            }}
                            garages={[...garages].sort((a, b) => (a.distance || 0) - (b.distance || 0))}
                            selectedGarageId={selectedGarageId}
                            onSelectGarage={setSelectedGarageId}
                            disableBroadcast={serviceMethod === 'walk_in'}
                        />
                    </View>

                    <View style={styles.divider} />

                    {/* Booking Summary Review */}
                    <BookingSummary
                        vehicleName={`${selectedVehicle?.make} ${selectedVehicle?.model}`}
                        address={activeAddress}
                        serviceMethod={serviceMethod}
                        serviceCharge={SERVICE_METHOD_PRICES[serviceMethod]}
                        isBroadcast={isBroadcast}
                        garageName={selectedGarage?.name}
                    />

                    <View style={{ height: 40 }} />
                </ScrollView>

                {/* Submit Button */}
                <View style={[styles.footer, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
                    <AppButton
                        title={t('create_request')}
                        onPress={handleSubmit}
                        loading={loading}
                        disabled={!selectedVehicleId || !description.trim() || !activeAddress}
                    />
                </View>
            </KeyboardAvoidingView>

            {/* Modals */}
            <VehicleSelectionModal
                visible={showVehicleModal}
                onClose={() => setShowVehicleModal(false)}
                vehicles={vehicles}
                selectedVehicleId={selectedVehicleId}
                onSelectVehicle={setSelectedVehicleId}
                onAddNewVehicle={() => {
                    setShowVehicleModal(false);
                    router.push('/(customer)/profile/vehicles' as any);
                }}
            />

            <AddressSelectionModal
                visible={showAddressModal}
                onClose={() => setShowAddressModal(false)}
                addresses={profile?.savedAddresses || []}
                selectedAddressId={selectedAddressId}
                onSelectAddress={(id: string) => {
                    setSelectedAddressId(id);
                }}
                onAddNewAddress={() => {
                    setEditingAddress(null);
                    setShowAddressModal(false);
                    setTimeout(() => {
                        setShowAddAddressModal(true);
                    }, 500);
                }}
                onEditAddress={(id: string) => {
                    const addr = profile?.savedAddresses?.find((a: any) => (a.id || a._id) === id);
                    if (addr) {
                        setEditingAddress(addr);
                        setShowAddressModal(false);
                        setTimeout(() => {
                            setShowAddAddressModal(true);
                        }, 500);
                    }
                }}
                onConfirm={() => {
                    setShowAddressModal(false);
                }}
            />

            <AddAddressModal
                visible={showAddAddressModal}
                onClose={() => {
                    setShowAddAddressModal(false);
                    setEditingAddress(null);
                }}
                initialData={editingAddress}
                isEditing={!!editingAddress}
                onSubmit={async (data) => {
                    try {
                        const fullAddress = `${data.addressLine1}, ${data.addressLine2 ? data.addressLine2 + ', ' : ''}${data.city}, ${data.state} - ${data.zipCode}`;
                        if (editingAddress) {
                            const id = editingAddress.id || editingAddress._id;
                            await updateAddress(id, {
                                ...data,
                                address: fullAddress
                            });
                            Alert.alert(t('success'), t('address_updated_successfully'));
                        } else {
                            await addNewAddress(data.label, fullAddress);
                            Alert.alert(t('success'), t('address_added_successfully'));
                        }
                        setShowAddAddressModal(false);
                        setEditingAddress(null);
                    } catch (error: any) {
                        Alert.alert(t('error'), error.message || t('failed_to_save_address'));
                    }
                }}
            />

            <GarageSelectionModal
                visible={showGarageModal}
                onClose={() => setShowGarageModal(false)}
                garages={garages}
                selectedGarageId={selectedGarageId}
                onSelectGarage={setSelectedGarageId}
                loading={false}
                onSkip={() => {
                    setSelectedGarageId(null);
                    setShowGarageModal(false);
                }}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
        gap: 28,
    },
    introSection: {
        marginTop: 8,
        marginBottom: -8,
    },
    mainTitle: {
        fontSize: 28,
        fontWeight: '800',
        fontFamily: 'NotoSans-Bold',
        letterSpacing: -0.5,
    },
    mainSubtitle: {
        fontSize: 15,
        fontFamily: 'NotoSans-Regular',
        marginTop: 4,
        lineHeight: 20,
    },
    section: {
        gap: 16,
    },
    sectionHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4
    },
    sectionTitleGroup: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        fontFamily: 'NotoSans-Bold',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    textArea: {
        borderRadius: 20,
        padding: 18,
        fontSize: 15,
        fontFamily: 'NotoSans-Regular',
        borderWidth: 1.5,
        minHeight: 140,
        textAlignVertical: 'top',
    },
    footer: {
        padding: 20,
        paddingBottom: Platform.OS === 'ios' ? 40 : 20,
        borderTopWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 8,
    },
    gpsBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1
    },
    gpsBtnText: {
        fontSize: 12,
        fontFamily: 'NotoSans-Bold'
    },
    methodGrid: {
        gap: 12
    },
    divider: {
        height: 1,
        backgroundColor: '#e0e0e040',
        marginHorizontal: -20,
    }
});
