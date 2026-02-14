import { useAuth } from '@/context/AuthContext';
import { useTechnician } from '@/context/TechnicianContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getMediaUrl } from '@/utils/mediaHelpers';
import { FontAwesome, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Animated,
    Image,
    KeyboardAvoidingView,
    Linking,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProfileInfoScreen() {
    const router = useRouter();
    const { user } = useAuth();
    const { profile, updateProfile, uploadFile } = useTechnician();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const colors = {
        background: isDark ? '#000000' : '#FFFFFF',
        headerBg: isDark ? '#000000' : '#FFFFFF',
        heroBg: isDark ? '#1C1C1E' : '#F8F9FE',
        card: isDark ? '#1C1C1E' : '#FFFFFF',
        text: isDark ? '#FFFFFF' : '#1A1A1A',
        subText: isDark ? '#A1A1A6' : '#8E8E93',
        border: isDark ? '#2C2C2E' : '#F2F2F7',
        iconBg: isDark ? '#2C2C2E' : '#F8F9FE',
        input: isDark ? '#2C2C2E' : '#F8F9FB',
        cta: isDark ? '#2C2C2E' : '#1A1A1A',
        sectionTitle: isDark ? '#8E8E93' : '#8E8E93',
        editBtn: isDark ? '#2C2C2E' : '#E1E9FF',
        primary: '#007AFF',
    };

    const [editModalVisible, setEditModalVisible] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [form, setForm] = useState({
        fullName: profile?.fullName || '',
        garageName: profile?.garageName || '',
        email: profile?.user?.email || profile?.email || '',
        address: profile?.address || profile?.workshopAddress || '',
        dob: profile?.dob || '',
        aadharNo: profile?.aadharNo || '',
        panNo: profile?.panNo || '',
        udyamNo: profile?.udyamNo || '',
        profession: profile?.profession || '',
        workType: profile?.workType || '',
        registrationType: profile?.registrationType || 'individual',
        vehicleTypes: profile?.vehicleTypes || [],
        technicalSkills: profile?.technicalSkills || [],
        softSkills: profile?.softSkills || [],
    });

    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        if (profile) {
            setForm({
                fullName: profile.fullName || '',
                garageName: profile.garageName || '',
                email: profile.user?.email || profile.email || '',
                address: profile.address || profile.workshopAddress || '',
                dob: profile.dob || '',
                aadharNo: profile.aadharNo || '',
                panNo: profile.panNo || '',
                udyamNo: profile.udyamNo || '',
                profession: profile.profession || '',
                workType: profile.workType || '',
                registrationType: profile.registrationType || 'individual',
                vehicleTypes: profile.vehicleTypes || [],
                technicalSkills: profile.technicalSkills || [],
                softSkills: profile.softSkills || [],
            });
        }
    }, [profile]);

    const technicalSkillsList = [
        'Engine Repair', 'Brake System', 'Electrician System', 'Transmissions',
        'Suspensions', 'HVAC', 'Diagnostics', 'Software'
    ];

    const softSkillsList = [
        'Problem Solving', 'Communications', 'Attention to Detail',
        'Time Management', 'Customer Services', 'Team Work'
    ];

    const vehicleTypesList = [
        { id: 'Car', icon: 'car', iconSet: 'FA' },
        { id: 'Bike', icon: 'motorcycle', iconSet: 'FA' },
        { id: 'Scooter', icon: 'scooter', iconSet: 'MCI' },
        { id: 'Truck', icon: 'truck', iconSet: 'FA' },
        { id: 'Bus', icon: 'bus', iconSet: 'FA' },
        { id: 'Tractor', icon: 'tractor', iconSet: 'MCI' },
        { id: 'Van', icon: 'van-utility', iconSet: 'MCI' },
        { id: 'Rickshaw', icon: 'rickshaw', iconSet: 'MCI' },
        { id: 'Earthmover', icon: 'excavator', iconSet: 'MCI' },
        { id: 'EV Vehicle', icon: 'flash', iconSet: 'Ion' },
    ];

    const toggleArrayItem = (list: string[], item: string, field: string) => {
        const newList = list.includes(item)
            ? list.filter(i => i !== item)
            : [...list, item];
        setForm({ ...form, [field]: newList } as any);
    };

    const handlePickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission denied', 'Sorry, we need camera roll permissions to make this work!');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
        });

        if (!result.canceled) {
            handleAvatarUpload(result.assets[0].uri);
        }
    };

    const handleAvatarUpload = async (uri: string) => {
        setUploading(true);
        try {
            const response = await uploadFile(uri, 'image');
            const newAvatar = response.url || response.path;
            await updateProfile({ avatar: newAvatar });
            Alert.alert('Success', 'Profile picture updated!');
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to upload image.');
        } finally {
            setUploading(false);
        }
    };

    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
        }).start();
    }, []);

    const handleUpdate = async () => {
        setSubmitting(true);
        try {
            await updateProfile(form);
            setEditModalVisible(false);
            Alert.alert('Success', 'Profile records updated successfully.');
        } catch (error) {
            Alert.alert('Update Failed', 'Could not sync changes. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const infoSections = [
        {
            title: 'PERSONAL & IDENTITY',
            items: [
                { label: 'Full Name', value: profile?.fullName || profile?.name, icon: 'person-outline' },
                { label: 'Phone Number', value: profile?.user?.phoneNumber || user?.phoneNumber || profile?.phone || 'Not provided', icon: 'call-outline' },
                { label: 'Email Address', value: profile?.user?.email || profile?.email || 'Not provided', icon: 'mail-outline' },
                { label: 'Date of Birth', value: profile?.dob || 'Not provided', icon: 'calendar-outline' },
                { label: 'Aadhar Number', value: profile?.aadharNo ? `XXXX-XXXX-${profile.aadharNo.slice(-4)}` : 'Not provided', icon: 'id-card-outline' },
                { label: 'PAN Number', value: profile?.panNo || 'Not provided', icon: 'card-outline' },
            ]
        },
        {
            title: 'BUSINESS & OPERATIONS',
            items: [
                { label: 'Account Type', value: profile?.registrationType?.toUpperCase() || 'INDIVIDUAL', icon: 'briefcase-outline' },
                { label: 'Garage Name', value: profile?.garageName || 'N/A', icon: 'business-outline' },
                { label: 'Workshop Address', value: profile?.address || profile?.workshopAddress || 'N/A', icon: 'location-outline' },
                { label: 'Profession', value: profile?.profession || 'N/A', icon: 'hammer-outline' },
                { label: 'Work Type', value: profile?.workType || 'N/A', icon: 'construct-outline' },
                { label: 'Udyam Aadhar', value: profile?.udyamNo || 'Not provided', icon: 'shield-outline' },
            ]
        },
        {
            title: 'SKILLS & SPECIALIZATIONS',
            items: [
                { label: 'Vehicle Types', value: profile?.vehicleTypes?.join(', ') || 'N/A', icon: 'car-outline' },
                { label: 'Technical Skills', value: profile?.technicalSkills?.join(', ') || 'N/A', icon: 'settings-outline' },
                { label: 'Soft Skills', value: profile?.softSkills?.join(', ') || 'N/A', icon: 'people-outline' },
            ]
        }
    ];

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
            <View style={[styles.header, { backgroundColor: colors.headerBg, borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace('/(technician)/(tabs)' as any)} style={[styles.backBtn, { backgroundColor: colors.iconBg }]}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <View>
                    <Text style={[styles.headerTitle, { color: colors.text }]}>Professional Profile</Text>
                    <Text style={[styles.headerSub, { color: colors.subText }]}>Identity, Business & Expertise</Text>
                </View>
                <TouchableOpacity style={[styles.editBtn, { backgroundColor: colors.editBtn }]} onPress={() => setEditModalVisible(true)}>
                    <Ionicons name="create-outline" size={20} color={colors.primary} />
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <Animated.View style={{ opacity: fadeAnim }}>
                    <View style={[styles.heroSection, { backgroundColor: colors.heroBg }]}>
                        <View style={styles.avatarContainer}>
                            <TouchableOpacity style={[styles.avatar, { backgroundColor: colors.card }]} onPress={handlePickImage} disabled={uploading}>
                                {profile?.avatar ? (
                                    <Image source={{ uri: getMediaUrl(profile.avatar) || '' }} style={{ width: 100, height: 100, borderRadius: 50 }} />
                                ) : (
                                    <Text style={[styles.avatarText, { color: colors.text }]}>
                                        {(profile?.fullName || profile?.name || 'T M')?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || 'AM'}
                                    </Text>
                                )}
                                {uploading && (
                                    <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 50, justifyContent: 'center', alignItems: 'center' }]}>
                                        <ActivityIndicator color="#FFF" size="small" />
                                    </View>
                                )}
                            </TouchableOpacity>
                            <View style={[styles.badgeContainer, { backgroundColor: colors.card }]}>
                                <MaterialCommunityIcons name="check-decagram" size={24} color="#34C759" />
                            </View>
                        </View>
                        <Text style={[styles.profileName, { color: colors.text }]}>{profile?.fullName || profile?.name || 'Technician'}</Text>
                        <Text style={[styles.profileRole, { color: colors.subText }]}>
                            {profile?.profession || 'Partner Technician'} • {profile?.garageName || 'Independent'}
                        </Text>

                        <View style={[styles.statsCard, { backgroundColor: colors.card }]}>
                            <View style={styles.statItem}>
                                <Text style={[styles.statValue, { color: colors.text }]}>{profile?.rating ? parseFloat(profile.rating).toFixed(1) : '5.0'}</Text>
                                <Text style={[styles.statLabel, { color: colors.subText }]}>Rating</Text>
                            </View>
                            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
                            <View style={styles.statItem}>
                                <Text style={[styles.statValue, { color: colors.text }]}>{profile?.stats?.tasksDone || profile?.totalJobs || '0'}</Text>
                                <Text style={[styles.statLabel, { color: colors.subText }]}>Jobs Done</Text>
                            </View>
                            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
                            <View style={styles.statItem}>
                                <Text style={[styles.statValue, { color: colors.text }]}>{profile?.stats?.csrScore || '100%'}</Text>
                                <Text style={[styles.statLabel, { color: colors.subText }]}>Quality</Text>
                            </View>
                        </View>
                    </View>

                    {infoSections.map((section, sIndex) => (
                        <View key={sIndex} style={styles.section}>
                            <Text style={[styles.sectionTitle, { color: colors.sectionTitle }]}>{section.title}</Text>
                            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                                {section.items.map((item, iIndex) => (
                                    <View
                                        key={iIndex}
                                        style={[
                                            styles.infoRow,
                                            iIndex !== section.items.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border }
                                        ]}
                                    >
                                        <View style={[styles.iconBg, { backgroundColor: colors.iconBg }]}>
                                            <Ionicons name={item.icon as any} size={20} color={colors.text} />
                                        </View>
                                        <View style={styles.infoContent}>
                                            <Text style={[styles.infoLabel, { color: colors.subText }]}>{item.label}</Text>
                                            <Text style={[styles.infoValue, { color: colors.text }]}>{item.value}</Text>
                                        </View>
                                    </View>
                                ))}
                            </View>
                        </View>
                    ))}

                    <TouchableOpacity style={[styles.updateCta, { backgroundColor: colors.cta }]} onPress={() => setEditModalVisible(true)}>
                        <Text style={styles.updateCtaText}>Update Account Records</Text>
                        <Ionicons name="chevron-forward" size={18} color="#FFF" />
                    </TouchableOpacity>

                    <View style={styles.footer}>
                        <TouchableOpacity onPress={() => Linking.openURL('https://www.agrozonetechnology.com/')}>
                            <Text style={[styles.footerText, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                                Developed by <Text style={{ color: '#FFC107', fontWeight: 'bold' }}>Agro</Text>zone Technology Pvt. Ltd.
                            </Text>
                        </TouchableOpacity>
                    </View>
                    <View style={{ height: 40 }} />
                </Animated.View>
            </ScrollView>

            <Modal visible={editModalVisible} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: colors.text }]}>Manage Identity</Text>
                            <TouchableOpacity onPress={() => setEditModalVisible(false)} style={styles.closeBtn}>
                                <Ionicons name="close" size={24} color={colors.text} />
                            </TouchableOpacity>
                        </View>

                        <KeyboardAvoidingView
                            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                            style={{ flex: 1 }}
                        >
                            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
                                <View style={styles.form}>

                                    <Text style={styles.formSectionTitle}>IDENTITY</Text>
                                    <View style={styles.inputGroup}>
                                        <Text style={[styles.label, { color: colors.subText }]}>FULL NAME</Text>
                                        <TextInput
                                            style={[styles.input, { backgroundColor: colors.input, color: colors.text }]}
                                            value={form.fullName}
                                            onChangeText={(val) => setForm({ ...form, fullName: val })}
                                            placeholder="Enter full name"
                                            placeholderTextColor={colors.subText}
                                        />
                                    </View>

                                    <View style={styles.inputGroup}>
                                        <Text style={[styles.label, { color: colors.subText }]}>DATE OF BIRTH</Text>
                                        <TextInput
                                            style={[styles.input, { backgroundColor: colors.input, color: colors.text }]}
                                            value={form.dob}
                                            onChangeText={(val) => setForm({ ...form, dob: val })}
                                            placeholder="DD/MM/YYYY"
                                            placeholderTextColor={colors.subText}
                                        />
                                    </View>

                                    <View style={styles.row}>
                                        <View style={[styles.inputGroup, { flex: 1 }]}>
                                            <Text style={[styles.label, { color: colors.subText }]}>AADHAR NO</Text>
                                            <TextInput
                                                style={[styles.input, { backgroundColor: colors.input, color: colors.text }]}
                                                value={form.aadharNo}
                                                onChangeText={(val) => setForm({ ...form, aadharNo: val })}
                                                placeholder="12-digit"
                                                maxLength={12}
                                                keyboardType="numeric"
                                                placeholderTextColor={colors.subText}
                                            />
                                        </View>
                                        <View style={[styles.inputGroup, { flex: 1 }]}>
                                            <Text style={[styles.label, { color: colors.subText }]}>PAN NO</Text>
                                            <TextInput
                                                style={[styles.input, { backgroundColor: colors.input, color: colors.text }]}
                                                value={form.panNo}
                                                onChangeText={(val) => setForm({ ...form, panNo: val })}
                                                placeholder="ABCDE1234F"
                                                autoCapitalize="characters"
                                                placeholderTextColor={colors.subText}
                                            />
                                        </View>
                                    </View>

                                    <Text style={styles.formSectionTitle}>BUSINESS</Text>
                                    <View style={styles.inputGroup}>
                                        <Text style={[styles.label, { color: colors.subText }]}>ACCOUNT TYPE</Text>
                                        <View style={styles.typeSwitcher}>
                                            <TouchableOpacity
                                                style={[styles.typeOption, form.registrationType === 'individual' && styles.typeOptionActive]}
                                                onPress={() => setForm({ ...form, registrationType: 'individual' })}
                                            >
                                                <Text style={[styles.typeOptionText, form.registrationType === 'individual' && styles.typeOptionTextActive]}>Individual</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                style={[styles.typeOption, form.registrationType === 'garage' && styles.typeOptionActive]}
                                                onPress={() => setForm({ ...form, registrationType: 'garage' })}
                                            >
                                                <Text style={[styles.typeOptionText, form.registrationType === 'garage' && styles.typeOptionTextActive]}>Garage</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>

                                    <View style={styles.inputGroup}>
                                        <Text style={[styles.label, { color: colors.subText }]}>GARAGE NAME</Text>
                                        <TextInput
                                            style={[styles.input, { backgroundColor: colors.input, color: colors.text }]}
                                            value={form.garageName}
                                            onChangeText={(val) => setForm({ ...form, garageName: val })}
                                            placeholder="Firm/Shop Name"
                                            placeholderTextColor={colors.subText}
                                        />
                                    </View>

                                    <View style={styles.inputGroup}>
                                        <Text style={[styles.label, { color: colors.subText }]}>WORKSHOP ADDRESS</Text>
                                        <TextInput
                                            style={[styles.input, { backgroundColor: colors.input, color: colors.text, height: 80, textAlignVertical: 'top' }]}
                                            multiline
                                            value={form.address}
                                            onChangeText={(val) => setForm({ ...form, address: val })}
                                            placeholder="Physical location"
                                            placeholderTextColor={colors.subText}
                                        />
                                    </View>

                                    <View style={styles.row}>
                                        <View style={[styles.inputGroup, { flex: 1 }]}>
                                            <Text style={[styles.label, { color: colors.subText }]}>PROFESSION</Text>
                                            <TextInput
                                                style={[styles.input, { backgroundColor: colors.input, color: colors.text }]}
                                                value={form.profession}
                                                onChangeText={(val) => setForm({ ...form, profession: val })}
                                                placeholder="e.g. Master Tech"
                                                placeholderTextColor={colors.subText}
                                            />
                                        </View>
                                        <View style={[styles.inputGroup, { flex: 1 }]}>
                                            <Text style={[styles.label, { color: colors.subText }]}>WORK TYPE</Text>
                                            <TextInput
                                                style={[styles.input, { backgroundColor: colors.input, color: colors.text }]}
                                                value={form.workType}
                                                onChangeText={(val) => setForm({ ...form, workType: val })}
                                                placeholder="e.g. Freelance"
                                                placeholderTextColor={colors.subText}
                                            />
                                        </View>
                                    </View>

                                    <Text style={styles.formSectionTitle}>EXPERTISE</Text>
                                    <View style={styles.inputGroup}>
                                        <Text style={[styles.label, { color: colors.subText }]}>VEHICLE TYPES</Text>
                                        <View style={styles.chipGrid}>
                                            {vehicleTypesList.map(item => (
                                                <TouchableOpacity
                                                    key={item.id}
                                                    style={[styles.rectChip, form.vehicleTypes.includes(item.id) && styles.rectChipActive]}
                                                    onPress={() => toggleArrayItem(form.vehicleTypes, item.id, 'vehicleTypes')}
                                                >
                                                    <Text style={[styles.rectChipText, form.vehicleTypes.includes(item.id) && styles.rectChipTextActive]}>{item.id}</Text>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    </View>

                                    <View style={styles.inputGroup}>
                                        <Text style={[styles.label, { color: colors.subText }]}>TECHNICAL SKILLS</Text>
                                        <View style={styles.chipGrid}>
                                            {technicalSkillsList.map(skill => (
                                                <TouchableOpacity
                                                    key={skill}
                                                    style={[styles.rectChip, form.technicalSkills.includes(skill) && styles.rectChipActive]}
                                                    onPress={() => toggleArrayItem(form.technicalSkills, skill, 'technicalSkills')}
                                                >
                                                    <Text style={[styles.rectChipText, form.technicalSkills.includes(skill) && styles.rectChipTextActive]}>{skill}</Text>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    </View>

                                    <View style={styles.inputGroup}>
                                        <Text style={[styles.label, { color: colors.subText }]}>SOFT SKILLS</Text>
                                        <View style={styles.chipGrid}>
                                            {softSkillsList.map(skill => (
                                                <TouchableOpacity
                                                    key={skill}
                                                    style={[styles.rectChip, form.softSkills.includes(skill) && styles.rectChipActive]}
                                                    onPress={() => toggleArrayItem(form.softSkills, skill, 'softSkills')}
                                                >
                                                    <Text style={[styles.rectChipText, form.softSkills.includes(skill) && styles.rectChipTextActive]}>{skill}</Text>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    </View>

                                    <TouchableOpacity
                                        style={[styles.saveBtn, submitting && { opacity: 0.7 }]}
                                        onPress={handleUpdate}
                                        disabled={submitting}
                                    >
                                        {submitting ? <ActivityIndicator color="#FFF" /> : <Text style={styles.saveBtnText}>Commit Changes</Text>}
                                    </TouchableOpacity>
                                </View>
                            </ScrollView>
                        </KeyboardAvoidingView>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { paddingHorizontal: 20, paddingVertical: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1 },
    backBtn: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    headerTitle: { fontSize: 18, fontWeight: 'bold' },
    headerSub: { fontSize: 11, fontWeight: '600' },
    editBtn: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },

    content: { flex: 1 },
    heroSection: { alignItems: 'center', paddingVertical: 30 },
    avatarContainer: { position: 'relative', marginBottom: 20 },
    avatar: { width: 100, height: 100, borderRadius: 50, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 5 },
    avatarText: { fontSize: 36, fontWeight: 'bold' },
    badgeContainer: { position: 'absolute', bottom: 0, right: 0, borderRadius: 12, padding: 2 },
    profileName: { fontSize: 22, fontWeight: 'bold' },
    profileRole: { fontSize: 13, marginTop: 4, fontWeight: '500' },

    statsCard: { flexDirection: 'row', borderRadius: 24, padding: 20, marginTop: 25, width: '90%', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
    statItem: { flex: 1, alignItems: 'center' },
    statValue: { fontSize: 18, fontWeight: 'bold' },
    statLabel: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', marginTop: 4 },
    statDivider: { width: 1, height: 30 },

    section: { paddingHorizontal: 25, marginTop: 30 },
    sectionTitle: { fontSize: 10, fontWeight: '900', letterSpacing: 1.2, marginBottom: 15, paddingLeft: 5 },
    card: { borderRadius: 24, borderWidth: 1, overflow: 'hidden' },
    infoRow: { flexDirection: 'row', alignItems: 'center', padding: 18 },
    iconBg: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
    infoContent: { flex: 1 },
    infoLabel: { fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase' },
    infoValue: { fontSize: 15, fontWeight: '600', marginTop: 4 },

    updateCta: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10, margin: 25, paddingVertical: 18, borderRadius: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 15, elevation: 5 },
    updateCtaText: { color: '#FFF', fontSize: 15, fontWeight: 'bold' },

    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { height: '85%', borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 25 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
    modalTitle: { fontSize: 22, fontWeight: 'bold' },
    closeBtn: { padding: 5 },

    form: { gap: 15 },
    formSectionTitle: { fontSize: 13, fontWeight: '900', color: '#007AFF', letterSpacing: 1, marginTop: 10, marginBottom: 5 },
    inputGroup: { gap: 8 },
    label: { fontSize: 11, fontWeight: '900', letterSpacing: 1 },
    input: { borderRadius: 16, padding: 16, fontSize: 16, borderWidth: 1, borderColor: 'transparent' },
    row: { flexDirection: 'row', gap: 12 },

    typeSwitcher: { flexDirection: 'row', backgroundColor: '#F0F0F0', borderRadius: 14, padding: 4 },
    typeOption: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
    typeOptionActive: { backgroundColor: '#FFF', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
    typeOptionText: { fontSize: 13, fontWeight: '700', color: '#8E8E93' },
    typeOptionTextActive: { color: '#1A1A1A' },

    chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    rectChip: { paddingHorizontal: 12, paddingVertical: 10, borderRadius: 12, backgroundColor: '#F0F0F0', borderWidth: 1, borderColor: '#E0E0E0' },
    rectChipActive: { backgroundColor: '#1A1A1A', borderColor: '#1A1A1A' },
    rectChipText: { fontSize: 12, fontWeight: '600', color: '#666' },
    rectChipTextActive: { color: '#FFF' },

    saveBtn: { backgroundColor: '#007AFF', height: 60, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginTop: 25, shadowColor: '#007AFF', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 15, elevation: 8 },
    saveBtnText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },

    footer: { alignItems: 'center', marginBottom: 20 },
    footerText: { fontSize: 12, fontWeight: '500' },
});