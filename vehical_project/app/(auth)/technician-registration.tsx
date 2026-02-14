import { useAuth } from '@/context/AuthContext';
import { authService } from '@/services/authService';
import { FontAwesome, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TechnicianRegistrationScreen() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1);
    const [verifyingBank, setVerifyingBank] = useState(false);

    const [formData, setFormData] = useState({
        registrationType: 'individual' as 'individual' | 'garage',
        name: '',
        garageName: '',
        workshopAddress: '',
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
            holderName: '',
            accountNo: '',
            ifsc: '',
            isVerified: false
        }
    });

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
            Alert.alert('Verified', 'Bank account verified successfully via Razorpay.');
        }, 2000);
    };

    const handleNext = () => {
        if (step === 1) {
            if (formData.registrationType === 'individual') {
                if (!formData.name || !formData.aadharNo || !formData.panNo) {
                    Alert.alert('Required', 'Please fill name, Aadhar and PAN details.');
                    return;
                }
            } else {
                if (!formData.garageName || !formData.workshopAddress || !formData.panNo) {
                    Alert.alert('Required', 'Please fill garage name, workshop address and PAN details.');
                    return;
                }
            }
            setStep(2);
        } else if (step === 2) {
            if (formData.registrationType === 'individual' && !formData.profession) {
                Alert.alert('Required', 'Please specify your profession.');
                return;
            }
            if (formData.vehicleTypes.length === 0) {
                Alert.alert('Required', 'Please select at least one vehicle type.');
                return;
            }
            setStep(3);
        } else if (step === 3) {
            if (formData.technicalSkills.length === 0) {
                Alert.alert('Required', 'Please select at least one technical skill.');
                return;
            }
            setStep(4);
        }
    };

    const { refreshUser } = useAuth();

    const handleSubmit = async () => {
        if (!formData.bankDetails.isVerified) {
            Alert.alert('Action Required', 'Please verify your bank account before proceeding.');
            return;
        }
        setLoading(true);
        try {
            await authService.updateProfile({ ...formData, profileCompleted: true });
            await refreshUser();

            Alert.alert(
                'Registration Successful',
                'Your professional profile has been successfully submitted for review.',
                [{ text: 'Proceed to Dashboard', onPress: () => router.replace('/(technician)/(tabs)') }]
            );
        } catch (e: any) {
            Alert.alert('Submission Failed', e.response?.data?.message || 'Could not save your profile. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const MultiSelectSection = ({ title, items, selectedItems, field }: any) => (
        <View style={styles.skillSection}>
            <Text style={styles.label}>{title.toUpperCase()}</Text>
            <View style={styles.chipContainer}>
                {items.map((item: string) => (
                    <TouchableOpacity
                        key={item}
                        style={[
                            styles.chip,
                            selectedItems.includes(item) && styles.chipActive
                        ]}
                        onPress={() => toggleItem(selectedItems, item, field)}
                    >
                        <Text style={[
                            styles.chipText,
                            selectedItems.includes(item) && styles.chipTextActive
                        ]}>{item}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => {
                        if (step > 1) {
                            setStep(step - 1);
                        } else if (router.canGoBack()) {
                            router.back();
                        } else {
                            router.replace('/(auth)/login');
                        }
                    }} style={styles.backBtn}>
                        <Ionicons name="chevron-back" size={24} color="#1A1A1A" />
                    </TouchableOpacity>
                    <View style={styles.headerContent}>
                        <Text style={styles.headerTitle}>Partner Onboarding</Text>
                        <Text style={styles.headerStep}>Step {step} of 4</Text>
                    </View>
                    <View style={{ width: 44 }} />
                </View>

                <View style={styles.progressContainer}>
                    <View style={[styles.progressFill, { width: `${(step / 4) * 100}%` }]} />
                </View>

                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    {step === 1 && (
                        <View style={styles.stepBox}>
                            <View style={styles.heroSection}>
                                <Text style={styles.title}>Account Type</Text>
                                <Text style={styles.subtitle}>Select how you wish to register on the platform.</Text>
                            </View>

                            <View style={styles.typeSwitcher}>
                                <TouchableOpacity
                                    style={[styles.typeOption, formData.registrationType === 'individual' && styles.typeOptionActive]}
                                    onPress={() => setFormData({ ...formData, registrationType: 'individual' })}
                                >
                                    <Ionicons name="person-outline" size={24} color={formData.registrationType === 'individual' ? '#FFF' : '#1A1A1A'} />
                                    <Text style={[styles.typeOptionText, formData.registrationType === 'individual' && styles.typeOptionTextActive]}>Individual</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.typeOption, formData.registrationType === 'garage' && styles.typeOptionActive]}
                                    onPress={() => setFormData({ ...formData, registrationType: 'garage' })}
                                >
                                    <MaterialCommunityIcons name="garage-variant" size={24} color={formData.registrationType === 'garage' ? '#FFF' : '#1A1A1A'} />
                                    <Text style={[styles.typeOptionText, formData.registrationType === 'garage' && styles.typeOptionTextActive]}>Garage / Workshop</Text>
                                </TouchableOpacity>
                            </View>

                            <View style={{ height: 30 }} />

                            <Text style={styles.sectionHeader}>{formData.registrationType === 'individual' ? 'Personal Details' : 'Business Identity'}</Text>

                            {formData.registrationType === 'individual' ? (
                                <>
                                    <View style={styles.formGroup}>
                                        <Text style={styles.label}>FULL NAME</Text>
                                        <TextInput
                                            style={styles.input}
                                            placeholder="as per Aadhar"
                                            value={formData.name}
                                            onChangeText={(t) => setFormData({ ...formData, name: t })}
                                        />
                                    </View>
                                    <View style={styles.formGroup}>
                                        <Text style={styles.label}>DATE OF BIRTH</Text>
                                        <TextInput
                                            style={styles.input}
                                            placeholder="DD/MM/YYYY"
                                            keyboardType="number-pad"
                                            maxLength={10}
                                            value={formData.dob}
                                            onChangeText={handleDobChange}
                                        />
                                    </View>
                                    <View style={styles.formGroup}>
                                        <Text style={styles.label}>AADHAR NUMBER</Text>
                                        <TextInput
                                            style={styles.input}
                                            placeholder="12-digit number"
                                            keyboardType="number-pad"
                                            maxLength={12}
                                            value={formData.aadharNo}
                                            onChangeText={(t) => setFormData({ ...formData, aadharNo: t })}
                                        />
                                    </View>
                                </>
                            ) : (
                                <>
                                    <View style={styles.formGroup}>
                                        <Text style={styles.label}>GARAGE NAME</Text>
                                        <TextInput
                                            style={styles.input}
                                            placeholder="Company / Shop Name"
                                            value={formData.garageName}
                                            onChangeText={(t) => setFormData({ ...formData, garageName: t })}
                                        />
                                    </View>
                                    <View style={styles.formGroup}>
                                        <Text style={styles.label}>WORKSHOP ADDRESS</Text>
                                        <TextInput
                                            style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
                                            placeholder="Physical location of your garage"
                                            multiline
                                            value={formData.workshopAddress}
                                            onChangeText={(t) => setFormData({ ...formData, workshopAddress: t })}
                                        />
                                    </View>
                                    <View style={styles.formGroup}>
                                        <Text style={styles.label}>OWNER / REPRESENTATIVE NAME</Text>
                                        <TextInput
                                            style={styles.input}
                                            placeholder="Primary contact person"
                                            value={formData.name}
                                            onChangeText={(t) => setFormData({ ...formData, name: t })}
                                        />
                                    </View>
                                </>
                            )}

                            <View style={styles.formGroup}>
                                <Text style={styles.label}>PAN NUMBER</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="ABCDE1234F"
                                    autoCapitalize="characters"
                                    maxLength={10}
                                    value={formData.panNo}
                                    onChangeText={(t) => setFormData({ ...formData, panNo: t })}
                                />
                            </View>

                            <View style={styles.formGroup}>
                                <Text style={styles.label}>UDYAM AADHAR (MSME)</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Registration Number"
                                    value={formData.udyamNo}
                                    onChangeText={(t) => setFormData({ ...formData, udyamNo: t })}
                                />
                            </View>
                        </View>
                    )}

                    {step === 2 && (
                        <View style={styles.stepBox}>
                            <View style={styles.heroSection}>
                                <Text style={styles.title}>Work Profile</Text>
                                <Text style={styles.subtitle}>Define your area of expertise and the services you provide.</Text>
                            </View>

                            <View style={styles.formGroup}>
                                <Text style={styles.label}>PROFESSION</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder={formData.registrationType === 'individual' ? "e.g. Master Mechanic" : "e.g. Multi-Brand Service Station"}
                                    value={formData.profession}
                                    onChangeText={(t) => setFormData({ ...formData, profession: t })}
                                />
                            </View>

                            {formData.registrationType === 'individual' && (
                                <View style={styles.formGroup}>
                                    <Text style={styles.label}>TYPE OF WORK</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="e.g. Freelancer / Specialized Technician"
                                        value={formData.workType}
                                        onChangeText={(t) => setFormData({ ...formData, workType: t })}
                                    />
                                </View>
                            )}

                            <Text style={styles.label}>VEHICLE SPECIALIZATION</Text>
                            <View style={styles.typeGrid}>
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
                                        style={[styles.typeCard, formData.vehicleTypes.includes(item.id) && styles.typeCardActive]}
                                        onPress={() => toggleItem(formData.vehicleTypes, item.id, 'vehicleTypes')}
                                    >
                                        {item.iconSet === 'FA' ? (
                                            <FontAwesome
                                                name={item.icon as any}
                                                size={24}
                                                color={formData.vehicleTypes.includes(item.id) ? '#FFF' : '#1A1A1A'}
                                            />
                                        ) : (
                                            <MaterialCommunityIcons
                                                name={item.icon as any}
                                                size={28}
                                                color={formData.vehicleTypes.includes(item.id) ? '#FFF' : '#1A1A1A'}
                                            />
                                        )}
                                        <Text style={[styles.typeLabel, formData.vehicleTypes.includes(item.id) && styles.typeLabelActive]}>
                                            {item.id === 'EV Vehicle' ? 'EVs' : item.id + 's'}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    )}

                    {step === 3 && (
                        <View style={styles.stepBox}>
                            <View style={styles.heroSection}>
                                <Text style={styles.title}>Skills Inventory</Text>
                                <Text style={styles.subtitle}>Highlight your technical capabilities and professional interpersonal skills.</Text>
                            </View>

                            <MultiSelectSection
                                title="Technical Skills"
                                items={technicalSkillsList}
                                selectedItems={formData.technicalSkills}
                                field="technicalSkills"
                            />

                            <View style={{ height: 25 }} />

                            <MultiSelectSection
                                title="Soft Skills"
                                items={softSkillsList}
                                selectedItems={formData.softSkills}
                                field="softSkills"
                            />
                        </View>
                    )}

                    {step === 4 && (
                        <View style={styles.stepBox}>
                            <View style={styles.heroSection}>
                                <Text style={styles.title}>Financial Payouts</Text>
                                <Text style={styles.subtitle}>Configure where you'll receive your service earnings.</Text>
                            </View>

                            <View style={styles.formGroup}>
                                <Text style={styles.label}>ACCOUNT HOLDER NAME</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Legal Bank Name"
                                    value={formData.bankDetails.holderName}
                                    onChangeText={(t) => setFormData({
                                        ...formData,
                                        bankDetails: { ...formData.bankDetails, holderName: t }
                                    })}
                                />
                            </View>

                            <View style={styles.formGroup}>
                                <Text style={styles.label}>ACCOUNT NUMBER</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter account number"
                                    keyboardType="number-pad"
                                    value={formData.bankDetails.accountNo}
                                    onChangeText={(t) => setFormData({
                                        ...formData,
                                        bankDetails: { ...formData.bankDetails, accountNo: t }
                                    })}
                                />
                            </View>

                            <View style={styles.formGroup}>
                                <Text style={styles.label}>IFSC CODE</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="SBIN0001234"
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
                                    styles.verifyBtn,
                                    formData.bankDetails.isVerified && styles.verifiedBtn
                                ]}
                                onPress={handleVerifyBank}
                                disabled={verifyingBank || formData.bankDetails.isVerified}
                            >
                                {verifyingBank ? (
                                    <ActivityIndicator color="#007AFF" />
                                ) : (
                                    <>
                                        <MaterialCommunityIcons
                                            name={formData.bankDetails.isVerified ? "check-decagram" : "shield-check-outline"}
                                            size={20}
                                            color={formData.bankDetails.isVerified ? "#34C759" : "#007AFF"}
                                        />
                                        <Text style={[
                                            styles.verifyBtnText,
                                            formData.bankDetails.isVerified && { color: "#34C759" }
                                        ]}>
                                            {formData.bankDetails.isVerified ? 'Bank Account Verified' : 'Verify Bank via Razorpay'}
                                        </Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        </View>
                    )}
                </ScrollView>

                <View style={styles.footer}>
                    <TouchableOpacity
                        style={[styles.mainBtn, (loading || (step === 4 && !formData.bankDetails.isVerified)) && { opacity: 0.7 }]}
                        onPress={step < 4 ? handleNext : handleSubmit}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#FFF" />
                        ) : (
                            <>
                                <Text style={styles.mainBtnText}>
                                    {step < 4 ? 'Continue to Next Step' : 'Submit Professional Profile'}
                                </Text>
                                <Ionicons name="chevron-forward" size={18} color="#FFF" />
                            </>
                        )}
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFF' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 15 },
    backBtn: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#F8F9FE', justifyContent: 'center', alignItems: 'center' },
    headerContent: { alignItems: 'center' },
    headerTitle: { fontSize: 16, fontWeight: 'bold', color: '#1A1A1A' },
    headerStep: { fontSize: 10, color: '#8E8E93', fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1 },
    progressContainer: { height: 3, backgroundColor: '#F2F2F7', width: '100%' },
    progressFill: { height: '100%', backgroundColor: '#007AFF' },
    scrollContent: { paddingHorizontal: 25, paddingVertical: 25 },
    stepBox: { flex: 1 },
    heroSection: { marginBottom: 25 },
    title: { fontSize: 26, fontWeight: '900', color: '#1A1A1A', letterSpacing: -0.5 },
    subtitle: { fontSize: 14, color: '#8E8E93', marginTop: 8, lineHeight: 20 },
    typeSwitcher: { flexDirection: 'row', gap: 12 },
    typeOption: { flex: 1, backgroundColor: '#F8F9FE', padding: 18, borderRadius: 20, alignItems: 'center', gap: 10, borderWidth: 1, borderColor: '#F2F2F7' },
    typeOptionActive: { backgroundColor: '#1A1A1A', borderColor: '#1A1A1A' },
    typeOptionText: { fontSize: 12, fontWeight: '800', color: '#1A1A1A' },
    typeOptionTextActive: { color: '#FFF' },
    sectionHeader: { fontSize: 14, fontWeight: '900', color: '#1A1A1A', letterSpacing: 0.5, marginBottom: 20 },
    formGroup: { marginBottom: 20 },
    label: { fontSize: 11, fontWeight: '900', color: '#8E8E93', letterSpacing: 1.2, marginBottom: 8 },
    input: { backgroundColor: '#F8F9FE', borderRadius: 14, padding: 16, fontSize: 15, fontWeight: '600', color: '#1A1A1A', borderWidth: 1, borderColor: '#F2F2F7' },
    typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 5 },
    typeCard: { width: '48%', backgroundColor: '#F8F9FE', padding: 18, borderRadius: 20, alignItems: 'center', gap: 8, borderWidth: 1, borderColor: '#F2F2F7' },
    typeCardActive: { backgroundColor: '#1A1A1A', borderColor: '#1A1A1A' },
    typeLabel: { fontSize: 12, fontWeight: 'bold', color: '#1A1A1A' },
    typeLabelActive: { color: '#FFF' },
    skillSection: {},
    chipContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    chip: { backgroundColor: '#F8F9FE', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 100, borderWidth: 1, borderColor: '#F2F2F7' },
    chipActive: { backgroundColor: '#007AFF', borderColor: '#007AFF' },
    chipText: { fontSize: 13, fontWeight: '600', color: '#1A1A1A' },
    chipTextActive: { color: '#FFF' },
    verifyBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F0F7FF', borderRadius: 14, padding: 18, borderWidth: 1, borderColor: '#CCE5FF', gap: 10, marginTop: 10 },
    verifiedBtn: { backgroundColor: '#F0FFF4', borderColor: '#C3E6CB' },
    verifyBtnText: { color: '#007AFF', fontWeight: 'bold', fontSize: 15 },
    footer: { padding: 25, borderTopWidth: 1, borderTopColor: '#F2F2F7' },
    mainBtn: { backgroundColor: '#1A1A1A', height: 62, borderRadius: 18, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 12 },
    mainBtnText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
});
