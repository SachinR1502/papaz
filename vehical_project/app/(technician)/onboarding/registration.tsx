import { Colors } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { authService } from '@/services/authService';
import { FontAwesome, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as ExpoLocation from 'expo-location';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export default function TechnicianOnboardingRegistration() {
    const router = useRouter();
    const { user, refreshUser, logout } = useAuth();
    const colorScheme = useColorScheme();
    const theme = colorScheme ?? 'light';
    const colors = Colors[theme];
    const isDark = theme === 'dark';

    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1);
    const [verifyingBank, setVerifyingBank] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);

    const [formData, setFormData] = useState({
        registrationType: 'individual' as 'individual' | 'garage',
        name: user?.fullName || '',
        garageName: '',
        workshopAddress: '',
        locationName: '',
        coordinates: [0, 0] as [number, number],
        dob: '',
        aadharNo: '',
        panNo: '',
        udyamNo: '',
        profession: '',
        workType: '',
        services: [] as string[],
        vehicleTypes: [] as string[],
        technicalSkills: [] as string[],
        softSkills: [] as string[],
        bankDetails: {
            holderName: user?.fullName || '',
            accountNo: '',
            ifsc: '',
            isVerified: false
        }
    });

    React.useEffect(() => {
        if (user?.profile && !isInitialized) {
            const p = user.profile;
            setFormData(prev => ({
                ...prev,
                registrationType: p.registrationType || 'individual',
                name: p.fullName || prev.name,
                garageName: p.garageName || '',
                workshopAddress: p.address || '',
                locationName: p.locationName || '',
                coordinates: p.location?.coordinates || [0, 0],
                dob: p.dob || '',
                aadharNo: p.aadharNo || '',
                panNo: p.panNo || '',
                udyamNo: p.udyamNo || '',
                profession: p.profession || '',
                workType: p.workType || '',
                vehicleTypes: p.vehicleTypes || [],
                technicalSkills: p.technicalSkills || [],
                softSkills: p.softSkills || [],
                bankDetails: p.bankAccounts?.[0] ? {
                    holderName: p.bankAccounts[0].accountHolderName || prev.name,
                    accountNo: p.bankAccounts[0].accountNumber || '',
                    ifsc: p.bankAccounts[0].ifscCode || '',
                    isVerified: p.bankAccounts[0].isVerified || false
                } : prev.bankDetails
            }));

            // Determine initial step
            if (!p.profession || p.vehicleTypes?.length === 0) {
                setStep(2);
            } else if (p.technicalSkills?.length === 0) {
                setStep(3);
            } else if (!p.bankAccounts?.[0]?.isVerified) {
                setStep(4);
            } else {
                setStep(1); // Default to 1 if something is weird, but usually layout will redirect to status if done
            }

            setIsInitialized(true);
        }
    }, [user, isInitialized]);

    const technicalSkillsList = [
        'Engine Repair', 'Brake System', 'Electrician System', 'Transmissions',
        'Suspensions', 'HVAC', 'Diagnostics', 'Software'
    ];

    const softSkillsList = [
        'Problem Solving', 'Communications', 'Attention to Detail',
        'Time Management', 'Customer Services', 'Team Work'
    ];

    const handleDobChange = (text: string) => {
        // Remove all non-numeric characters
        const cleaned = text.replace(/\D/g, '');
        let formatted = cleaned;

        if (cleaned.length > 2) {
            formatted = `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
        }
        if (cleaned.length > 4) {
            formatted = `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}/${cleaned.slice(4, 8)}`;
        }

        setFormData({ ...formData, dob: formatted });
    };

    const toggleItem = (list: string[], item: string, field: string) => {
        const newList = list.includes(item)
            ? list.filter(i => i !== item)
            : [...list, item];
        setFormData({ ...formData, [field]: newList });
    };

    const handleVerifyBank = () => {
        if (!formData.bankDetails.accountNo || !formData.bankDetails.ifsc) {
            Alert.alert('Incomplete Data', 'Please enter account number and IFSC code.');
            return;
        }
        setVerifyingBank(true);
        setTimeout(() => {
            setVerifyingBank(false);
            setFormData({
                ...formData,
                bankDetails: { ...formData.bankDetails, isVerified: true }
            });
            Alert.alert('Success', 'Bank account verified successfully.');
        }, 2000);
    };

    const handleGetLocation = async () => {
        setLoading(true);
        try {
            let { status } = await ExpoLocation.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission denied', 'Allow location access to set your workshop/service area.');
                return;
            }

            let location = await ExpoLocation.getCurrentPositionAsync({});
            const { latitude, longitude } = location.coords;

            // Reverse geocode to get address
            let reverseCoords = await ExpoLocation.reverseGeocodeAsync({ latitude, longitude });
            let addressName = "";
            if (reverseCoords.length > 0) {
                const ac = reverseCoords[0];
                addressName = `${ac.name || ''}, ${ac.street || ''}, ${ac.district || ''}, ${ac.city || ''}, ${ac.region || ''}`;
                addressName = addressName.replace(/^,\s*/, '').replace(/,\s*,/g, ',');
            }

            setFormData({
                ...formData,
                coordinates: [longitude, latitude],
                locationName: addressName,
                // Also pre-fill workshop address if it's empty
                workshopAddress: formData.workshopAddress || addressName
            });
        } catch (error) {
            Alert.alert('Error', 'Could not fetch your location. Please try again or enter manually.');
        } finally {
            setLoading(false);
        }
    };

    const handleGeocodeAddress = async () => {
        if (!formData.locationName) return;
        setLoading(true);
        try {
            const geocoded = await ExpoLocation.geocodeAsync(formData.locationName);
            if (geocoded.length > 0) {
                const { latitude, longitude } = geocoded[0];
                setFormData({
                    ...formData,
                    coordinates: [longitude, latitude],
                    // ensure workshopAddress syncs if type is garage and it's empty
                    workshopAddress: formData.registrationType === 'garage' && !formData.workshopAddress ? formData.locationName : formData.workshopAddress
                });
                Alert.alert('Location Found', `Coordinates set: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
            } else {
                Alert.alert('Not Found', 'Could not find coordinates for this address.');
            }
        } catch (error) {
            Alert.alert('Error', 'Geocoding failed. Please try a different address.');
        } finally {
            setLoading(false);
        }
    };

    const handleNext = async () => {
        if (step === 1) {
            if (formData.registrationType === 'individual') {
                if (!formData.name || !formData.aadharNo || !formData.panNo) {
                    Alert.alert('Required', 'Please complete your identity details.');
                    return;
                }
            } else {
                if (!formData.garageName || !formData.workshopAddress || !formData.panNo) {
                    Alert.alert('Required', 'Please complete your business details.');
                    return;
                }
            }
            if (formData.coordinates[0] === 0) {
                Alert.alert('Location Required', 'Please set your workshop/service location to proceed.');
                return;
            }
        } else if (step === 2) {
            if (formData.registrationType === 'individual' && !formData.profession) {
                Alert.alert('Required', 'Please specify your profession.');
                return;
            }
            if (formData.vehicleTypes.length === 0) {
                Alert.alert('Required', 'Please select at least one vehicle specialization.');
                return;
            }
        } else if (step === 3) {
            if (formData.technicalSkills.length === 0) {
                Alert.alert('Required', 'Select at least one technical skill.');
                return;
            }
        }

        setLoading(true);
        try {
            // Prepare API payload with formatted location
            const payload = {
                ...formData,
                address: formData.registrationType === 'garage' ? formData.workshopAddress : formData.locationName,
                location: {
                    type: 'Point',
                    coordinates: formData.coordinates
                },
                profileCompleted: false
            };
            await authService.updateProfile(payload);
            await refreshUser();
            setStep(step + 1);
        } catch (e: any) {
            Alert.alert('Progress Not Saved', e.response?.data?.message || 'Could not save your progress. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!formData.bankDetails.isVerified) {
            Alert.alert('Verification Needed', 'Please verify your bank account details.');
            return;
        }
        setLoading(true);
        try {
            // Prepare API payload
            const payload = {
                ...formData,
                address: formData.registrationType === 'garage' ? formData.workshopAddress : formData.locationName,
                location: {
                    type: 'Point',
                    coordinates: formData.coordinates
                },
                profileCompleted: false
            };
            await authService.updateProfile(payload);
            await refreshUser();
            Alert.alert(
                'Information Saved',
                'Basic profile information saved. Next: Upload your documents.',
                [{ text: 'Proceed to Documents', onPress: () => router.push('/(technician)/onboarding/docs') }]
            );
        } catch (e: any) {
            Alert.alert('Error', e.response?.data?.message || 'Failed to save profile.');
        } finally {
            setLoading(false);
        }
    };

    const StepIndicator = () => (
        <View style={[styles.stepIndicatorContainer, { backgroundColor: colors.background }]}>
            {[1, 2, 3, 4].map((i) => (
                <View key={i} style={styles.stepWrapper}>
                    <View style={[
                        styles.stepCircle,
                        step >= i && { backgroundColor: isDark ? '#1a3322' : '#F0F9F4', borderWidth: 2, borderColor: '#FF9500' },
                        step > i && { backgroundColor: '#FF9500' }
                    ]}>
                        {step > i ? (
                            <Ionicons name="checkmark" size={14} color="#FFF" />
                        ) : (
                            <Text style={[styles.stepText, { color: colors.icon }, step >= i && { color: '#FF9500' }]}>{i}</Text>
                        )}
                    </View>
                    {i < 4 && <View style={[styles.stepLine, { backgroundColor: colors.border }, step > i && { backgroundColor: '#FF9500' }]} />}
                </View>
            ))}
        </View>
    );

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={colors.background} />
            <SafeAreaView style={{ flex: 1 }}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={{ flex: 1 }}
                >
                    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                        <View style={{ flex: 1 }}>
                            <View style={[styles.header, { borderBottomColor: colors.border }]}>
                                <TouchableOpacity
                                    onPress={() => step > 1 ? setStep(step - 1) : logout()}
                                    style={[styles.backBtn, { backgroundColor: colors.card }]}
                                >
                                    <Ionicons name="chevron-back" size={24} color={colors.text} />
                                </TouchableOpacity>
                                <Text style={[styles.headerTitle, { color: colors.text }]}>Establish Workshop</Text>
                                <View style={{ width: 44 }} />
                            </View>

                            <StepIndicator />

                            <ScrollView
                                contentContainerStyle={styles.scrollContent}
                                showsVerticalScrollIndicator={false}
                            >
                                {step === 1 && (
                                    <View style={styles.animatedStep}>
                                        <View style={styles.hero}>
                                            <Text style={[styles.heroTitle, { color: colors.text }]}>Professional Identity</Text>
                                            <Text style={[styles.heroSubtitle, { color: colors.icon }]}>Select your operational mode and verify your identity.</Text>
                                        </View>

                                        <View style={styles.typeSelector}>
                                            <TouchableOpacity
                                                style={[styles.typeCard, { backgroundColor: formData.registrationType === 'individual' ? (isDark ? colors.border : '#FFFFFF') : colors.card, borderColor: formData.registrationType === 'individual' ? '#FF9500' : colors.border }]}
                                                onPress={() => setFormData({ ...formData, registrationType: 'individual' })}
                                            >
                                                <View style={[styles.iconBox, { backgroundColor: formData.registrationType === 'individual' ? '#FF9500' : (isDark ? '#333' : '#FFF') }]}>
                                                    <Ionicons
                                                        name="person"
                                                        size={32}
                                                        color={formData.registrationType === 'individual' ? '#FFF' : '#FF9500'}
                                                    />
                                                </View>
                                                <Text style={[styles.typeTitle, { color: colors.text }]}>Individual</Text>
                                                <Text style={[styles.typeDesc, { color: colors.icon }]}>Freelance technician or independent expert.</Text>
                                            </TouchableOpacity>

                                            <TouchableOpacity
                                                style={[styles.typeCard, { backgroundColor: formData.registrationType === 'garage' ? (isDark ? colors.border : '#FFFFFF') : colors.card, borderColor: formData.registrationType === 'garage' ? '#FF9500' : colors.border }]}
                                                onPress={() => setFormData({ ...formData, registrationType: 'garage' })}
                                            >
                                                <View style={[styles.iconBox, { backgroundColor: formData.registrationType === 'garage' ? '#FF9500' : (isDark ? '#333' : '#FFF') }]}>
                                                    <MaterialCommunityIcons
                                                        name="garage"
                                                        size={32}
                                                        color={formData.registrationType === 'garage' ? '#FFF' : '#FF9500'}
                                                    />
                                                </View>
                                                <Text style={[styles.typeTitle, { color: colors.text }]}>Workshop</Text>
                                                <Text style={[styles.typeDesc, { color: colors.icon }]}>Registered vehicle service station or garage.</Text>
                                            </TouchableOpacity>
                                        </View>

                                        <View style={styles.inputStack}>
                                            {formData.registrationType === 'individual' ? (
                                                <>
                                                    <View style={styles.formGroup}>
                                                        <Text style={[styles.label, { color: colors.icon }]}>FULL NAME</Text>
                                                        <TextInput
                                                            style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
                                                            placeholder="Legal name as per Aadhar"
                                                            placeholderTextColor={colors.icon}
                                                            value={formData.name}
                                                            onChangeText={(t) => setFormData({ ...formData, name: t })}
                                                        />
                                                    </View>
                                                    <View style={styles.row}>
                                                        <View style={[styles.formGroup, { flex: 1, marginRight: 10 }]}>
                                                            <Text style={[styles.label, { color: colors.icon }]}>DOB</Text>
                                                            <TextInput
                                                                style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
                                                                placeholder="DD/MM/YYYY"
                                                                placeholderTextColor={colors.icon}
                                                                keyboardType="number-pad"
                                                                maxLength={10}
                                                                value={formData.dob}
                                                                onChangeText={handleDobChange}
                                                            />
                                                        </View>
                                                        <View style={[styles.formGroup, { flex: 1 }]}>
                                                            <Text style={[styles.label, { color: colors.icon }]}>AADHAR NO</Text>
                                                            <TextInput
                                                                style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
                                                                placeholder="12 digit no"
                                                                placeholderTextColor={colors.icon}
                                                                keyboardType="number-pad"
                                                                maxLength={12}
                                                                value={formData.aadharNo}
                                                                onChangeText={(t) => setFormData({ ...formData, aadharNo: t })}
                                                            />
                                                        </View>
                                                    </View>
                                                </>
                                            ) : (
                                                <>
                                                    <View style={styles.formGroup}>
                                                        <Text style={[styles.label, { color: colors.icon }]}>GARAGE NAME</Text>
                                                        <TextInput
                                                            style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
                                                            placeholder="Name of your enterprise"
                                                            placeholderTextColor={colors.icon}
                                                            value={formData.garageName}
                                                            onChangeText={(t) => setFormData({ ...formData, garageName: t })}
                                                        />
                                                    </View>
                                                    <View style={styles.formGroup}>
                                                        <Text style={[styles.label, { color: colors.icon }]}>WORKSHOP ADDRESS</Text>
                                                        <TextInput
                                                            style={[styles.input, { height: 80, textAlignVertical: 'top', backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
                                                            placeholder="Complete street address"
                                                            placeholderTextColor={colors.icon}
                                                            multiline
                                                            value={formData.workshopAddress}
                                                            onChangeText={(t) => setFormData({ ...formData, workshopAddress: t })}
                                                        />
                                                    </View>
                                                </>
                                            )}
                                            <View style={styles.row}>
                                                <View style={[styles.formGroup, { flex: 1, marginRight: 10 }]}>
                                                    <Text style={[styles.label, { color: colors.icon }]}>PAN NUMBER</Text>
                                                    <TextInput
                                                        style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
                                                        placeholder="ABCDE1234F"
                                                        placeholderTextColor={colors.icon}
                                                        autoCapitalize="characters"
                                                        value={formData.panNo}
                                                        onChangeText={(t) => setFormData({ ...formData, panNo: t })}
                                                    />
                                                </View>
                                                <View style={[styles.formGroup, { flex: 1 }]}>
                                                    <Text style={[styles.label, { color: colors.icon }]}>MSME REG NO.</Text>
                                                    <TextInput
                                                        style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
                                                        placeholder="Optional"
                                                        placeholderTextColor={colors.icon}
                                                        value={formData.udyamNo}
                                                        onChangeText={(t) => setFormData({ ...formData, udyamNo: t })}
                                                    />
                                                </View>
                                            </View>

                                            <View style={styles.formGroup}>
                                                <Text style={[styles.label, { color: colors.icon }]}>WORKSHOP/SERVICE LOCATION</Text>

                                                {/* Option 1: Current Location */}
                                                <TouchableOpacity
                                                    style={[styles.locationPicker, { marginBottom: 10, backgroundColor: colors.card, borderColor: colors.border }]}
                                                    onPress={handleGetLocation}
                                                >
                                                    <View style={[styles.locationIcon, { backgroundColor: '#FF950020' }]}>
                                                        <Ionicons name="navigate" size={20} color="#FF9500" />
                                                    </View>
                                                    <Text style={[styles.locationTitle, { fontSize: 14, color: colors.text, flex: 1, marginLeft: 10 }]}>
                                                        Use Current GPS Location
                                                    </Text>
                                                    <Ionicons name="chevron-forward" size={16} color={colors.icon} />
                                                </TouchableOpacity>

                                                {/* Option 2: Custom Location */}
                                                <Text style={[styles.label, { color: colors.icon, fontSize: 10, marginBottom: 8 }]}>OR ENTER MANUALLY</Text>
                                                <View style={{ flexDirection: 'row', gap: 10 }}>
                                                    <TextInput
                                                        style={[styles.input, { flex: 1, backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
                                                        placeholder="City, Area, or Pin Code"
                                                        placeholderTextColor={colors.icon}
                                                        value={formData.locationName}
                                                        onChangeText={(t) => setFormData({ ...formData, locationName: t })}
                                                        onSubmitEditing={handleGeocodeAddress}
                                                    />
                                                    <TouchableOpacity
                                                        style={{
                                                            width: 50,
                                                            borderRadius: 12,
                                                            backgroundColor: colors.card,
                                                            borderWidth: 1,
                                                            borderColor: colors.border,
                                                            justifyContent: 'center',
                                                            alignItems: 'center'
                                                        }}
                                                        onPress={handleGeocodeAddress}
                                                    >
                                                        <Ionicons name="search" size={20} color={colors.text} />
                                                    </TouchableOpacity>
                                                </View>

                                                {/* Status Feedback */}
                                                {formData.coordinates[0] !== 0 ? (
                                                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10 }}>
                                                        <Ionicons name="checkmark-circle" size={16} color="#34C759" />
                                                        <Text style={[styles.locationHint, { color: '#34C759', marginLeft: 5 }]}>
                                                            Location verified ({formData.coordinates[1].toFixed(4)}, {formData.coordinates[0].toFixed(4)})
                                                        </Text>
                                                    </View>
                                                ) : (
                                                    <Text style={[styles.locationHint, { color: colors.icon, marginTop: 5 }]}>
                                                        Required to calculate service radius.
                                                    </Text>
                                                )}
                                            </View>
                                        </View>
                                    </View>
                                )}

                                {step === 2 && (
                                    <View style={styles.animatedStep}>
                                        <View style={styles.hero}>
                                            <Text style={[styles.heroTitle, { color: colors.text }]}>Expertise Profile</Text>
                                            <Text style={[styles.heroSubtitle, { color: colors.icon }]}>Define your professional niche and fleet specializations.</Text>
                                        </View>

                                        <View style={styles.inputStack}>
                                            <View style={styles.formGroup}>
                                                <Text style={[styles.label, { color: colors.icon }]}>PROFESSIONAL TITLE</Text>
                                                <TextInput
                                                    style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
                                                    placeholder="e.g. Senior Diagnostic Expert"
                                                    placeholderTextColor={colors.icon}
                                                    value={formData.profession}
                                                    onChangeText={(t) => setFormData({ ...formData, profession: t })}
                                                />
                                            </View>

                                            {formData.registrationType === 'individual' && (
                                                <View style={styles.formGroup}>
                                                    <Text style={[styles.label, { color: colors.icon }]}>EMPLOYMENT STATUS</Text>
                                                    <TextInput
                                                        style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
                                                        placeholder="e.g. Independent Contractor"
                                                        placeholderTextColor={colors.icon}
                                                        value={formData.workType}
                                                        onChangeText={(t) => setFormData({ ...formData, workType: t })}
                                                    />
                                                </View>
                                            )}

                                            <Text style={[styles.label, { color: colors.icon, marginTop: 10, marginBottom: 15 }]}>VEHICLE SPECIALIZATIONS</Text>
                                            <ScrollView
                                                horizontal
                                                showsHorizontalScrollIndicator={false}
                                                style={styles.typeScroll}
                                                contentContainerStyle={styles.typeContainer}
                                            >
                                                {[
                                                    { id: 'Car', icon: 'car', iconSet: 'FA' },
                                                    { id: 'Bike', icon: 'motorcycle', iconSet: 'FA' },
                                                    { id: 'Scooter', icon: 'scooter', iconSet: 'MCI' },
                                                    { id: 'Truck', icon: 'truck', iconSet: 'FA' },
                                                    { id: 'Bus', icon: 'bus', iconSet: 'FA' },
                                                    { id: 'Tractor', icon: 'tractor', iconSet: 'MCI' },
                                                    { id: 'Van', icon: 'van-utility', iconSet: 'MCI' },
                                                    { id: 'Rickshaw', icon: 'rickshaw', iconSet: 'MCI' },
                                                    { id: 'Earthmover', icon: 'excavator', iconSet: 'MCI' },
                                                    { id: 'EV Vehicle', icon: 'vehicle-electric', iconSet: 'MCI' },
                                                    { id: 'Other', icon: 'question-circle', iconSet: 'FA' },
                                                ].map(item => (
                                                    <TouchableOpacity
                                                        key={item.id}
                                                        style={[
                                                            styles.typeBtn,
                                                            { backgroundColor: colors.card, borderColor: colors.border },
                                                            formData.vehicleTypes.includes(item.id) && { backgroundColor: '#FF9500', borderColor: '#FF9500' }
                                                        ]}
                                                        onPress={() => toggleItem(formData.vehicleTypes, item.id, 'vehicleTypes')}
                                                    >
                                                        {item.iconSet === 'FA' ? (
                                                            <FontAwesome
                                                                name={item.icon as any}
                                                                size={22}
                                                                color={formData.vehicleTypes.includes(item.id) ? '#FFF' : '#FF9500'}
                                                            />
                                                        ) : (
                                                            <MaterialCommunityIcons
                                                                name={item.icon as any}
                                                                size={24}
                                                                color={formData.vehicleTypes.includes(item.id) ? '#FFF' : '#FF9500'}
                                                            />
                                                        )}
                                                        <Text style={[
                                                            styles.typeBtnText,
                                                            { color: colors.text },
                                                            formData.vehicleTypes.includes(item.id) && { color: '#FFF' }
                                                        ]}>
                                                            {item.id}
                                                        </Text>
                                                    </TouchableOpacity>
                                                ))}
                                            </ScrollView>
                                        </View>
                                    </View>
                                )}

                                {step === 3 && (
                                    <View style={styles.animatedStep}>
                                        <View style={styles.hero}>
                                            <Text style={[styles.heroTitle, { color: colors.text }]}>Skill Inventory</Text>
                                            <Text style={[styles.heroSubtitle, { color: colors.icon }]}>Select your core technical competencies and soft skills.</Text>
                                        </View>

                                        <View style={styles.skillsWrapper}>
                                            <Text style={[styles.label, { color: colors.icon, marginBottom: 20 }]}>TECHNICAL DOMAINS</Text>
                                            <View style={styles.chipGrid}>
                                                {technicalSkillsList.map(skill => (
                                                    <TouchableOpacity
                                                        key={skill}
                                                        style={[
                                                            styles.chip,
                                                            { backgroundColor: colors.card, borderColor: colors.border },
                                                            formData.technicalSkills.includes(skill) && { backgroundColor: '#FF9500', borderColor: '#FF9500' }
                                                        ]}
                                                        onPress={() => toggleItem(formData.technicalSkills, skill, 'technicalSkills')}
                                                    >
                                                        <Text style={[
                                                            styles.chipText,
                                                            { color: colors.text },
                                                            formData.technicalSkills.includes(skill) && { color: '#FFF' }
                                                        ]}>{skill}</Text>
                                                    </TouchableOpacity>
                                                ))}
                                            </View>

                                            <Text style={[styles.label, { color: colors.icon, marginTop: 30, marginBottom: 20 }]}>PROFESSIONAL SOFT SKILLS</Text>
                                            <View style={styles.chipGrid}>
                                                {softSkillsList.map(skill => (
                                                    <TouchableOpacity
                                                        key={skill}
                                                        style={[
                                                            styles.chip,
                                                            { backgroundColor: colors.card, borderColor: colors.border },
                                                            formData.softSkills.includes(skill) && { backgroundColor: '#FF9500', borderColor: '#FF9500' }
                                                        ]}
                                                        onPress={() => toggleItem(formData.softSkills, skill, 'softSkills')}
                                                    >
                                                        <Text style={[
                                                            styles.chipText,
                                                            { color: colors.text },
                                                            formData.softSkills.includes(skill) && { color: '#FFF' }
                                                        ]}>{skill}</Text>
                                                    </TouchableOpacity>
                                                ))}
                                            </View>
                                        </View>
                                    </View>
                                )}

                                {step === 4 && (
                                    <View style={styles.animatedStep}>
                                        <View style={styles.hero}>
                                            <Text style={[styles.heroTitle, { color: colors.text }]}>Financial Payouts</Text>
                                            <Text style={[styles.heroSubtitle, { color: colors.icon }]}>Configure your verified bank account for service settlements.</Text>
                                        </View>

                                        <View style={styles.inputStack}>
                                            <View style={styles.formGroup}>
                                                <Text style={[styles.label, { color: colors.icon }]}>ACCOUNT HOLDER NAME</Text>
                                                <TextInput
                                                    style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
                                                    placeholder="Legal bank name"
                                                    placeholderTextColor={colors.icon}
                                                    value={formData.bankDetails.holderName}
                                                    onChangeText={(t) => setFormData({
                                                        ...formData,
                                                        bankDetails: { ...formData.bankDetails, holderName: t }
                                                    })}
                                                />
                                            </View>

                                            <View style={styles.formGroup}>
                                                <Text style={[styles.label, { color: colors.icon }]}>ACCOUNT NUMBER</Text>
                                                <View style={[styles.input, { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, borderColor: colors.border }]}>
                                                    <Ionicons name="card-outline" size={20} color={colors.icon} style={{ marginRight: 10 }} />
                                                    <TextInput
                                                        style={{ flex: 1, height: '100%', fontSize: 16, fontWeight: '600', color: colors.text }}
                                                        placeholder="Enter bank account number"
                                                        placeholderTextColor={colors.icon}
                                                        keyboardType="number-pad"
                                                        value={formData.bankDetails.accountNo}
                                                        onChangeText={(t) => setFormData({
                                                            ...formData,
                                                            bankDetails: { ...formData.bankDetails, accountNo: t }
                                                        })}
                                                    />
                                                </View>
                                            </View>

                                            <View style={styles.formGroup}>
                                                <Text style={[styles.label, { color: colors.icon }]}>IFSC CODE</Text>
                                                <TextInput
                                                    style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
                                                    placeholder="e.g. SBIN0001234"
                                                    placeholderTextColor={colors.icon}
                                                    autoCapitalize="characters"
                                                    value={formData.bankDetails.ifsc}
                                                    onChangeText={(t) => setFormData({
                                                        ...formData,
                                                        bankDetails: { ...formData.bankDetails, ifsc: t }
                                                    })}
                                                />
                                            </View>

                                            <TouchableOpacity
                                                style={[
                                                    styles.verifyCard,
                                                    { backgroundColor: isDark ? '#1a2a24' : '#F0F9F4', borderColor: colors.border },
                                                    formData.bankDetails.isVerified && { backgroundColor: isDark ? '#1a3322' : '#ECFDF5', borderColor: '#10B981' }
                                                ]}
                                                onPress={handleVerifyBank}
                                                disabled={verifyingBank || formData.bankDetails.isVerified}
                                            >
                                                {verifyingBank ? (
                                                    <ActivityIndicator color="#FF9500" />
                                                ) : (
                                                    <>
                                                        <MaterialCommunityIcons
                                                            name={formData.bankDetails.isVerified ? "check-decagram" : "shield-key"}
                                                            size={24}
                                                            color={formData.bankDetails.isVerified ? "#10B981" : "#FF9500"}
                                                        />
                                                        <View style={styles.verifyTextContent}>
                                                            <Text style={[
                                                                styles.verifyStatus,
                                                                { color: '#FF9500' },
                                                                formData.bankDetails.isVerified && { color: "#10B981" }
                                                            ]}>
                                                                {formData.bankDetails.isVerified ? 'Verified Account' : 'Connect via Razorpay'}
                                                            </Text>
                                                            <Text style={[styles.verifyHint, { color: colors.icon }]}>
                                                                {formData.bankDetails.isVerified ? 'Banking credentials established.' : 'Instant KYC validation for payouts.'}
                                                            </Text>
                                                        </View>
                                                        {!formData.bankDetails.isVerified && (
                                                            <Ionicons name="chevron-forward" size={18} color="#FF9500" />
                                                        )}
                                                    </>
                                                )}
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                )}
                            </ScrollView>

                            <View style={[styles.footer, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
                                <TouchableOpacity
                                    style={[
                                        styles.actionBtn,
                                        { backgroundColor: colors.text },
                                        (loading || (step === 4 && !formData.bankDetails.isVerified)) && { opacity: 0.6 }
                                    ]}
                                    onPress={step < 4 ? handleNext : handleSubmit}
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <ActivityIndicator color={colors.background} />
                                    ) : (
                                        <>
                                            <Text style={[styles.actionBtnText, { color: colors.background }]}>
                                                {step < 4 ? 'Proceed to Next Phase' : 'Activate Technician Profile'}
                                            </Text>
                                            <Ionicons name="arrow-forward" size={20} color={colors.background} style={{ marginLeft: 10 }} />
                                        </>
                                    )}
                                </TouchableOpacity>

                                {step === 1 && (
                                    <TouchableOpacity
                                        onPress={() => logout()}
                                        style={styles.loginLink}
                                    >
                                        <Text style={[styles.loginLinkText, { color: colors.icon }]}>
                                            Already have an account? <Text style={{ color: '#FF9500' }}>Login</Text>
                                        </Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        height: 60,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
    },
    backBtn: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center'
    },
    headerTitle: { fontSize: 18, fontWeight: '700' },

    // Step Indicator
    stepIndicatorContainer: {
        flexDirection: 'row',
        paddingHorizontal: 25,
        paddingVertical: 15,
        alignItems: 'center',
        justifyContent: 'center'
    },
    stepWrapper: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    stepCircle: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#E5E7EB',
        justifyContent: 'center',
        alignItems: 'center'
    },
    stepText: { fontSize: 12, fontWeight: '700' },
    stepLine: {
        width: 40,
        height: 2,
        marginHorizontal: 8
    },

    scrollContent: { paddingHorizontal: 25, paddingTop: 20, paddingBottom: 40, flexGrow: 1 },

    hero: { marginBottom: 30 },
    heroTitle: { fontSize: 32, fontWeight: '900', letterSpacing: -1 },
    heroSubtitle: { fontSize: 16, marginTop: 8, lineHeight: 24 },

    // Type Selector
    typeSelector: { flexDirection: 'row', gap: 15, marginBottom: 25 },
    typeCard: {
        flex: 1,
        padding: 25,
        borderRadius: 28,
        borderWidth: 2,
        position: 'relative',
        shadowColor: '#000',
        shadowOpacity: 0.03,
        shadowRadius: 10,
        elevation: 2
    },
    iconBox: {
        width: 64,
        height: 64,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 10
    },
    typeTitle: { fontSize: 16, fontWeight: '700' },
    typeDesc: { fontSize: 12, marginTop: 6, lineHeight: 18 },

    // Form
    inputStack: { gap: 20 },
    formGroup: { marginBottom: 5 },
    label: { fontSize: 11, fontWeight: '900', letterSpacing: 1.5, marginBottom: 10 },
    input: {
        borderRadius: 16,
        padding: 18,
        fontSize: 16,
        fontWeight: '600',
        borderWidth: 1.5,
    },
    row: { flexDirection: 'row' },

    // Grid Specialization
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    gridLabel: { fontSize: 13, fontWeight: '700', marginTop: 8 },

    // Skills
    skillsWrapper: {},
    chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    chip: {
        paddingHorizontal: 18,
        paddingVertical: 12,
        borderRadius: 16,
        borderWidth: 1.5,
    },
    chipText: { fontSize: 14, fontWeight: '600' },

    // Verify Card
    verifyCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        borderRadius: 24,
        borderWidth: 1.5,
        marginTop: 10
    },
    verifyTextContent: { flex: 1, marginHorizontal: 15 },
    verifyStatus: { fontSize: 15, fontWeight: '700' },
    verifyHint: { fontSize: 12, marginTop: 4 },

    footer: {
        padding: 20,
        paddingBottom: Platform.OS === 'ios' ? 40 : 20,
        borderTopWidth: 1,
    },
    actionBtn: {
        height: 64,
        borderRadius: 20,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 15,
        elevation: 5
    },
    actionBtnText: { fontSize: 17, fontWeight: 'bold' },
    animatedStep: { flex: 1 },

    // Horizontal Scroll Selection
    typeScroll: { marginHorizontal: -25, marginTop: 5 },
    typeContainer: { paddingHorizontal: 25, gap: 12, paddingBottom: 10 },
    typeBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 14,
        borderRadius: 18,
        borderWidth: 2,
        shadowColor: '#000',
        shadowOpacity: 0.03,
        shadowRadius: 10,
        elevation: 1
    },
    typeBtnText: {
        fontSize: 15,
        fontWeight: '700',
        marginLeft: 10
    },
    locationPicker: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 20,
        borderWidth: 2,
        borderStyle: 'dashed',
        marginTop: 5
    },
    locationIcon: {
        width: 48,
        height: 48,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center'
    },
    locationTitle: {
        fontSize: 15,
        fontWeight: '700'
    },
    locationSubtitle: {
        fontSize: 12,
        marginTop: 2
    },
    locationHint: {
        fontSize: 11,
        fontWeight: '600',
        marginTop: 8,
        marginLeft: 4
    },
    loginLink: {
        marginTop: 15,
        alignItems: 'center',
    },
    loginLinkText: {
        fontSize: 14,
        fontWeight: '600',
    }
});
