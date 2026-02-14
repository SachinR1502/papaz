import { Colors } from '@/constants/theme';
import { useSupplier } from '@/context/SupplierContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
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
    useColorScheme
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SupplierEditProfile() {
    const { updateProfile, profile, isLoading } = useSupplier();
    const router = useRouter();
    const colorScheme = useColorScheme();
    const theme = colorScheme ?? 'light';
    const colors = Colors[theme];
    const isDark = theme === 'dark';

    const [form, setForm] = useState({
        shopName: '',
        ownerName: '',
        address: '',
        phone: '',
        gst: '',
        serviceArea: ''
    });

    useEffect(() => {
        if (profile) {
            setForm({
                shopName: profile.shopName || '',
                ownerName: profile.ownerName || '',
                address: profile.address || '',
                phone: profile.phone || '',
                gst: profile.gst || '',
                serviceArea: profile.serviceArea || ''
            });
        }
    }, [profile]);

    const handleSubmit = async () => {
        if (!form.shopName || !form.ownerName || !form.phone || !form.address) {
            Alert.alert('Incomplete Form', 'Please fill all required fields to proceed.');
            return;
        }

        try {
            await updateProfile(form);
            Alert.alert("Success", "Profile updated successfully.");
            router.back();
        } catch (e) {
            Alert.alert("Error", "Something went wrong. Please try again.");
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
            <View style={styles.bgBlob1} />
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                    <View style={styles.header}>
                        <TouchableOpacity onPress={() => router.back()} style={{ position: 'absolute', left: 0, top: 0, padding: 10, zIndex: 10 }}>
                            <Ionicons name="arrow-back" size={24} color={colors.text} />
                        </TouchableOpacity>
                        <View style={[styles.iconContainer, { backgroundColor: colors.primary + '15' }]}>
                            <Ionicons name="pencil" size={40} color={colors.primary} />
                        </View>
                        <Text style={[styles.title, { color: colors.text }]}>Edit Profile</Text>
                        <Text style={[styles.subtitle, { color: colors.icon }]}>Update your business details below.</Text>
                    </View>

                    <View style={styles.formContainer}>
                        <View style={styles.sectionHeader}>
                            <Text style={[styles.sectionTitle, { color: colors.text }]}>Business Information</Text>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: colors.text }]}>Shop Name <Text style={styles.required}>*</Text></Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: isDark ? colors.card : '#F8F9FE', borderColor: colors.border, color: colors.text }]}
                                placeholder="e.g. A1 Auto Parts"
                                placeholderTextColor={colors.icon}
                                value={form.shopName}
                                onChangeText={t => setForm({ ...form, shopName: t })}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: colors.text }]}>Owner Name <Text style={styles.required}>*</Text></Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: isDark ? colors.card : '#F8F9FE', borderColor: colors.border, color: colors.text }]}
                                placeholder="Full Name"
                                placeholderTextColor={colors.icon}
                                value={form.ownerName}
                                onChangeText={t => setForm({ ...form, ownerName: t })}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: colors.text }]}>Contact Number <Text style={styles.required}>*</Text></Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: isDark ? colors.card : '#F8F9FE', borderColor: colors.border, color: colors.text }]}
                                placeholder="+91 98765 43210"
                                keyboardType="phone-pad"
                                placeholderTextColor={colors.icon}
                                value={form.phone}
                                onChangeText={t => setForm({ ...form, phone: t })}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: colors.text }]}>Detailed Address <Text style={styles.required}>*</Text></Text>
                            <TextInput
                                style={[styles.input, { height: 80, paddingTop: 12, backgroundColor: isDark ? colors.card : '#F8F9FE', borderColor: colors.border, color: colors.text }]}
                                placeholder="Shop No, Street, Landmark, City, Pincode"
                                placeholderTextColor={colors.icon}
                                multiline
                                textAlignVertical="top"
                                value={form.address}
                                onChangeText={t => setForm({ ...form, address: t })}
                            />
                        </View>

                        <View style={styles.sectionHeader}>
                            <Text style={[styles.sectionTitle, { color: colors.text }]}>Business Details</Text>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: colors.text }]}>Service Radius / City</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: isDark ? colors.card : '#F8F9FE', borderColor: colors.border, color: colors.text }]}
                                placeholder="e.g. Bangalore (10km)"
                                placeholderTextColor={colors.icon}
                                value={form.serviceArea}
                                onChangeText={t => setForm({ ...form, serviceArea: t })}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: colors.text }]}>GST Number (Optional)</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: isDark ? colors.card : '#F8F9FE', borderColor: colors.border, color: colors.text }]}
                                placeholder="Enter GSTIN"
                                placeholderTextColor={colors.icon}
                                autoCapitalize="characters"
                                value={form.gst}
                                onChangeText={t => setForm({ ...form, gst: t })}
                            />
                        </View>

                        <TouchableOpacity
                            style={[styles.submitBtn, { backgroundColor: colors.primary }]}
                            onPress={handleSubmit}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.submitText}>Update Profile</Text>
                            )}
                        </TouchableOpacity>
                    </View>

                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, position: 'relative', overflow: 'hidden' },
    bgBlob1: { position: 'absolute', top: -150, right: -100, width: 350, height: 350, borderRadius: 175, backgroundColor: '#007AFF05', zIndex: -1 },

    scrollContent: { padding: 24, paddingBottom: 50 },

    header: { alignItems: 'center', marginBottom: 40, marginTop: 20 },
    iconContainer: { width: 80, height: 80, borderRadius: 24, backgroundColor: '#F0F7FF', justifyContent: 'center', alignItems: 'center', marginBottom: 20, shadowColor: '#007AFF', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 20 },
    title: { fontSize: 28, fontWeight: '900', color: '#1A1A1A', marginBottom: 8, letterSpacing: -0.5 },
    subtitle: { fontSize: 14, color: '#8E8E93', textAlign: 'center', paddingHorizontal: 20, lineHeight: 22 },

    formContainer: { gap: 10 },

    sectionHeader: { marginBottom: 12, marginTop: 8 },
    sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#1A1A1A' },

    inputGroup: { gap: 8, marginBottom: 16 },
    label: { fontSize: 13, fontWeight: '600', color: '#1A1A1A', marginLeft: 4 },
    required: { color: '#FF3B30' },
    input: { height: 50, borderRadius: 14, backgroundColor: '#F8F9FE', borderWidth: 1, borderColor: '#F0F0F0', paddingHorizontal: 16, fontSize: 16, color: '#1A1A1A' },

    submitBtn: { height: 56, borderRadius: 18, backgroundColor: '#1A1A1A', justifyContent: 'center', alignItems: 'center', marginTop: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 5 },
    submitText: { color: '#fff', fontSize: 17, fontWeight: 'bold' },
});
