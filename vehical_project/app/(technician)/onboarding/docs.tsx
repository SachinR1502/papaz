import { Colors } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useTechnician } from '@/context/TechnicianContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { authService } from '@/services/authService';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Animated, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function DocumentUpload() {
    const router = useRouter();
    const { submitRegistration } = useTechnician();
    const colorScheme = useColorScheme();
    const theme = colorScheme ?? 'light';
    const isDark = theme === 'dark';
    const colors = Colors[theme];

    const [loading, setLoading] = useState(false);
    const [uploads, setUploads] = useState({
        idProof: false,
        garagePhoto: false,
        license: false,
    });

    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
        }).start();
    }, []);

    const handleUpload = (key: keyof typeof uploads) => {
        setUploads({ ...uploads, [key]: true });
    };

    const { refreshUser } = useAuth();
    const handleSubmit = async () => {
        if (!uploads.idProof || !uploads.garagePhoto) {
            Alert.alert('Incomplete', 'Please upload ID Proof and Garage Photo to proceed.');
            return;
        }

        setLoading(true);
        try {
            // Document upload simulation - in real app, these would be actual file uploads
            // We update the profile to indicate documents are done
            await authService.updateProfile({
                documents: {
                    idProof: true,
                    garagePhoto: true,
                    license: uploads.license
                },
                profileCompleted: true
            });

            await refreshUser();
            setLoading(false);

            Alert.alert(
                'Success',
                'Your documents have been submitted for review.',
                [{ text: 'View Status', onPress: () => router.replace('/(technician)/onboarding/status') }]
            );
        } catch (e: any) {
            setLoading(false);
            Alert.alert('Error', e.response?.data?.message || 'Failed to submit documents.');
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.navHeader}>
                <TouchableOpacity
                    onPress={() => router.back()}
                    style={[styles.backBtn, { backgroundColor: isDark ? colors.card : '#F8F9FE' }]}
                >
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <View style={styles.stepIndicator}>
                    <Text style={styles.stepText}>STEP 2 OF 2</Text>
                    <View style={styles.progressBar}>
                        <View style={[styles.progressLine, { backgroundColor: '#34C759', width: '100%' }]} />
                    </View>
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <Animated.View style={{ opacity: fadeAnim }}>
                    <View style={styles.heroSection}>
                        <Text style={[styles.heroTitle, { color: colors.text }]}>Verifications</Text>
                        <Text style={[styles.heroSubtitle, { color: colors.icon }]}>
                            Upload required documents to activate your professional profile
                        </Text>
                    </View>

                    <View style={[styles.infoBox, { backgroundColor: isDark ? 'rgba(52, 199, 89, 0.1)' : '#F0F9F4' }]}>
                        <Ionicons name="shield-checkmark" size={24} color="#34C759" />
                        <Text style={[styles.infoText, { color: isDark ? '#66BB6A' : '#1B5E20' }]}>
                            Documents are required to maintain a high-trust professional network.
                        </Text>
                    </View>

                    {[
                        { id: 'idProof', label: 'Identity Proof', sub: 'Aadhar, PAN or Voter ID', icon: 'card-outline', required: true },
                        { id: 'garagePhoto', label: 'Garage Photo', sub: 'Front view with signage', icon: 'images-outline', required: true },
                        { id: 'license', label: 'Trade License', sub: 'Business permit (Optional)', icon: 'document-text-outline', required: false },
                    ].map(doc => (
                        <TouchableOpacity
                            key={doc.id}
                            style={[
                                styles.uploadCard,
                                { backgroundColor: colors.card, borderColor: isDark ? colors.border : '#F2F2F7' },
                                uploads[doc.id as keyof typeof uploads] && {
                                    backgroundColor: isDark ? 'rgba(52, 199, 89, 0.1)' : '#F0F9F4',
                                    borderColor: '#34C759'
                                }
                            ]}
                            onPress={() => handleUpload(doc.id as keyof typeof uploads)}
                        >
                            <View style={styles.uploadInfo}>
                                <View style={[styles.iconBox, { backgroundColor: isDark ? colors.background : '#FFFFFF' }]}>
                                    <Ionicons
                                        name={uploads[doc.id as keyof typeof uploads] ? 'checkmark-circle' : doc.icon as any}
                                        size={28}
                                        color={uploads[doc.id as keyof typeof uploads] ? '#34C759' : colors.text}
                                    />
                                </View>
                                <View style={styles.textContainer}>
                                    <View style={styles.labelRow}>
                                        <Text style={[styles.docLabel, { color: colors.text }]}>{doc.label}</Text>
                                        {doc.required && (
                                            <View style={styles.reqBadge}>
                                                <Text style={styles.reqText}>Required</Text>
                                            </View>
                                        )}
                                    </View>
                                    <Text style={[styles.docSub, { color: colors.icon }]}>{doc.sub}</Text>
                                </View>
                            </View>
                            <View style={[styles.actionIcon, { backgroundColor: uploads[doc.id as keyof typeof uploads] ? '#34C759' : colors.background }]}>
                                <Ionicons
                                    name={uploads[doc.id as keyof typeof uploads] ? 'checkmark' : 'chevron-forward'}
                                    size={18}
                                    color={uploads[doc.id as keyof typeof uploads] ? '#FFF' : colors.icon}
                                />
                            </View>
                        </TouchableOpacity>
                    ))}

                    <View style={styles.disclaimer}>
                        <Ionicons name="information-circle-outline" size={20} color={colors.icon} style={{ alignSelf: 'center', marginBottom: 8 }} />
                        <Text style={[styles.disclaimerText, { color: colors.icon }]}>
                            By submitting, you agree that the information provided is accurate.
                            Impersonation leads to immediate ban.
                        </Text>
                    </View>
                </Animated.View>
            </ScrollView>

            <View style={[styles.footer, { borderTopColor: colors.border }]}>
                <TouchableOpacity
                    style={[styles.submitBtn, { backgroundColor: '#34C759' }, loading && { opacity: 0.7 }]}
                    onPress={handleSubmit}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#FFFFFF" />
                    ) : (
                        <Text style={[styles.submitBtnText, { color: '#FFFFFF' }]}>Submit for Approval</Text>
                    )}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    navHeader: {
        paddingHorizontal: 25,
        paddingVertical: 15,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    backBtn: {
        width: 44,
        height: 44,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    stepIndicator: {
        alignItems: 'flex-end',
    },
    stepText: {
        fontSize: 10,
        fontWeight: '800',
        color: '#8E8E93',
        letterSpacing: 1,
        marginBottom: 4,
    },
    progressBar: {
        width: 80,
        height: 4,
        backgroundColor: '#F2F2F7',
        borderRadius: 2,
        overflow: 'hidden',
    },
    progressLine: {
        height: '100%',
        borderRadius: 2,
    },
    scrollContent: { padding: 25 },
    heroSection: {
        marginBottom: 30,
    },
    heroTitle: {
        fontSize: 32,
        fontWeight: '800',
        letterSpacing: -0.5,
        marginBottom: 8,
    },
    heroSubtitle: {
        fontSize: 16,
        lineHeight: 22,
    },
    infoBox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15,
        padding: 20,
        borderRadius: 24,
        marginBottom: 30,
    },
    infoText: {
        flex: 1,
        fontSize: 14,
        lineHeight: 20,
        fontWeight: '500',
    },
    uploadCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 20,
        borderRadius: 28,
        marginBottom: 16,
        borderWidth: 1.5,
    },
    uploadInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        flex: 1,
    },
    iconBox: {
        width: 56,
        height: 56,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    textContainer: {
        flex: 1,
    },
    labelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 2,
    },
    docLabel: {
        fontSize: 17,
        fontWeight: '700',
    },
    reqBadge: {
        backgroundColor: '#FFF0F0',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
    },
    reqText: {
        color: '#FF3B30',
        fontSize: 10,
        fontWeight: '800',
        textTransform: 'uppercase',
    },
    docSub: {
        fontSize: 13,
    },
    actionIcon: {
        width: 28,
        height: 28,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    disclaimer: {
        marginTop: 40,
        paddingHorizontal: 10,
    },
    disclaimerText: {
        fontSize: 13,
        textAlign: 'center',
        lineHeight: 20,
    },
    footer: {
        padding: 25,
        paddingTop: 15,
        borderTopWidth: 1,
    },
    submitBtn: {
        height: 62,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#34C759',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 15,
        elevation: 5,
    },
    submitBtnText: {
        fontSize: 18,
        fontWeight: '700',
    },
});
