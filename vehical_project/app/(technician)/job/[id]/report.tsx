import { useAdmin } from '@/context/AdminContext';
import { useTechnician } from '@/context/TechnicianContext';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function RepairReportScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const { addRepairDetails, uploadFile } = useTechnician();
    const { settings } = useAdmin();
    const colorScheme = useColorScheme();
    const theme = colorScheme ?? 'light';
    const colors = Colors[theme];
    const isDark = theme === 'dark';

    const currencySymbol = settings.currency === 'INR' ? '₹' : '$';

    const [problem, setProblem] = useState('');
    const [workDone, setWorkDone] = useState('');
    const [laborCost, setLaborCost] = useState('');
    const [partsCost, setPartsCost] = useState('');
    const [completionDate, setCompletionDate] = useState('');
    const [nextService, setNextService] = useState('');
    const [photos, setPhotos] = useState<string[]>([]);
    const [uploading, setUploading] = useState(false);

    const handlePickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission denied', 'Sorry, we need camera roll permissions to make this work!');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            allowsEditing: true,
            quality: 0.5,
        });

        if (!result.canceled) {
            setPhotos([...photos, result.assets[0].uri]);
        }
    };

    const handleRemovePhoto = (index: number) => {
        const newPhotos = [...photos];
        newPhotos.splice(index, 1);
        setPhotos(newPhotos);
    };

    const handleSave = async () => {
        if (!problem || !workDone || !laborCost) {
            alert('Please fill critical details');
            return;
        }

        setUploading(true);
        try {
            // Upload photos first
            const uploadedPhotos = photos.length > 0
                ? await Promise.all(photos.map(p => uploadFile(p, 'image').then(res => res.url || res.path)))
                : [];

            const details = {
                problemsFound: problem,
                workPerformed: workDone,
                laborCost: parseFloat(laborCost),
                partsCost: parseFloat(partsCost || '0'),
                estimatedCompletion: completionDate,
                nextServiceDue: nextService,
                photos: uploadedPhotos,
                timestamp: new Date().toISOString()
            };

            await addRepairDetails(id!, details);
            router.back();
        } catch (e) {
            console.error(e);
            Alert.alert('Error', 'Failed to save report');
        } finally {
            setUploading(false);
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
            <View style={[styles.header, { backgroundColor: colors.card, shadowColor: colors.shadow }]}>
                <TouchableOpacity onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: isDark ? colors.background : '#F8F9FF' }]}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Repair Report</Text>
                <View style={{ width: 44 }} />
            </View>

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

                    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>Service Details</Text>

                        <View style={styles.formGroup}>
                            <Text style={[styles.label, { color: colors.text }]}>Problem Detected</Text>
                            <TextInput
                                style={[styles.input, { color: colors.text, backgroundColor: isDark ? colors.background : '#FCFCFD', borderColor: colors.border }]}
                                placeholder="Describe the main issue found..."
                                placeholderTextColor={colors.icon}
                                multiline
                                numberOfLines={3}
                                value={problem}
                                onChangeText={setProblem}
                            />
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={[styles.label, { color: colors.text }]}>Work Performed</Text>
                            <TextInput
                                style={[styles.input, { minHeight: 80, color: colors.text, backgroundColor: isDark ? colors.background : '#FCFCFD', borderColor: colors.border }]}
                                placeholder="List the repairs executed..."
                                placeholderTextColor={colors.icon}
                                multiline
                                numberOfLines={3}
                                value={workDone}
                                onChangeText={setWorkDone}
                            />
                        </View>
                    </View>

                    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>Costs & Schedule</Text>

                        <View style={styles.row}>
                            <View style={[styles.formGroup, { flex: 1 }]}>
                                <Text style={[styles.label, { color: colors.text }]}>Labor Cost ({currencySymbol})</Text>
                                <TextInput
                                    style={[styles.input, { color: colors.text, backgroundColor: isDark ? colors.background : '#FCFCFD', borderColor: colors.border }]}
                                    placeholder="0.00"
                                    placeholderTextColor={colors.icon}
                                    keyboardType="numeric"
                                    value={laborCost}
                                    onChangeText={setLaborCost}
                                />
                            </View>
                            <View style={[styles.formGroup, { flex: 1 }]}>
                                <Text style={[styles.label, { color: colors.text }]}>Parts Cost ({currencySymbol})</Text>
                                <TextInput
                                    style={[styles.input, { color: colors.text, backgroundColor: isDark ? colors.background : '#FCFCFD', borderColor: colors.border }]}
                                    placeholder="0.00"
                                    placeholderTextColor={colors.icon}
                                    keyboardType="numeric"
                                    value={partsCost}
                                    onChangeText={setPartsCost}
                                />
                            </View>
                        </View>

                        <View style={styles.row}>
                            <View style={[styles.formGroup, { flex: 1 }]}>
                                <Text style={[styles.label, { color: colors.text }]}>Completion Date</Text>
                                <TextInput
                                    style={[styles.input, { color: colors.text, backgroundColor: isDark ? colors.background : '#FCFCFD', borderColor: colors.border }]}
                                    placeholder="YYYY-MM-DD"
                                    placeholderTextColor={colors.icon}
                                    value={completionDate}
                                    onChangeText={setCompletionDate}
                                />
                            </View>
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={[styles.label, { color: colors.text }]}>Next Service Recommendation</Text>
                            <TextInput
                                style={[styles.input, { color: colors.text, backgroundColor: isDark ? colors.background : '#FCFCFD', borderColor: colors.border }]}
                                placeholder="e.g. 5,000 KM or 6 Months"
                                placeholderTextColor={colors.icon}
                                value={nextService}
                                onChangeText={setNextService}
                            />
                        </View>
                    </View>

                    <View style={styles.photoSection}>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.photoList}>
                            {photos.map((uri, index) => (
                                <View key={index} style={styles.photoWrapper}>
                                    <Image source={{ uri }} style={styles.photoThumb} />
                                    <TouchableOpacity style={styles.removePhotoBtn} onPress={() => handleRemovePhoto(index)}>
                                        <Ionicons name="close" size={12} color="#FFF" />
                                    </TouchableOpacity>
                                </View>
                            ))}
                            <TouchableOpacity style={[styles.addPhotoBtn, { backgroundColor: isDark ? colors.background : '#F0F9FF', borderColor: colors.primary }]} onPress={handlePickImage}>
                                <Ionicons name="camera" size={24} color={colors.primary} />
                                <Text style={[styles.addPhotoText, { color: colors.primary }]}>Add Photo</Text>
                            </TouchableOpacity>
                        </ScrollView>
                    </View>

                    <View style={{ height: 40 }} />
                </ScrollView>

                <View style={[styles.footer, { backgroundColor: colors.card, shadowColor: colors.shadow }]}>
                    <TouchableOpacity style={[styles.saveBtn, { backgroundColor: colors.primary, shadowColor: colors.primary }]} onPress={handleSave} disabled={uploading}>
                        <Text style={styles.saveBtnText}>{uploading ? 'Uploading...' : 'Save Repair Record'}</Text>
                        {!uploading && <Ionicons name="save-outline" size={20} color="#FFF" />}
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 20,
        backgroundColor: '#FFFFFF',
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 4,
        zIndex: 10
    },
    backBtn: { width: 44, height: 44, borderRadius: 14, backgroundColor: '#F8F9FF', justifyContent: 'center', alignItems: 'center' },
    headerTitle: { fontSize: 18, fontFamily: 'NotoSans-Bold', color: '#1A1A1A' },

    content: { padding: 20, paddingBottom: 100 },

    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 20,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
        borderWidth: 1,
        borderColor: '#F0F0F0'
    },
    sectionTitle: { fontSize: 16, fontFamily: 'NotoSans-Bold', color: '#1A1A1A', marginBottom: 20 },

    formGroup: { marginBottom: 15 },
    label: { fontSize: 13, fontFamily: 'NotoSans-Bold', color: '#1A1A1A', marginLeft: 4, marginBottom: 8 },
    input: {
        backgroundColor: '#FCFCFD',
        borderWidth: 1,
        borderColor: '#E5E5EA',
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
        fontFamily: 'NotoSans-Medium',
        color: '#1A1A1A',
        textAlignVertical: 'top'
    },
    row: { flexDirection: 'row', gap: 15 },

    photoBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 20,
        borderWidth: 1,
        borderStyle: 'dashed',
        borderColor: '#007AFF',
        backgroundColor: '#F0F9FF',
        borderRadius: 20,
        gap: 10,
        marginBottom: 20
    },
    photoText: { fontSize: 15, fontFamily: 'NotoSans-Bold', color: '#007AFF' },

    footer: {
        position: 'absolute', bottom: 0, left: 0, right: 0,
        backgroundColor: '#FFFFFF',
        padding: 20,
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.05,
        shadowRadius: 15,
        elevation: 10
    },
    saveBtn: {
        backgroundColor: '#007AFF',
        height: 60,
        borderRadius: 20,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 12,
        shadowColor: '#007AFF',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 15,
        elevation: 8
    },
    saveBtnText: { color: '#FFF', fontSize: 18, fontFamily: 'NotoSans-Bold' },

    // Photo Styles
    photoSection: { marginBottom: 20 },
    photoList: { gap: 10 },
    photoWrapper: { width: 100, height: 100, borderRadius: 16, overflow: 'hidden', position: 'relative' },
    photoThumb: { width: '100%', height: '100%' },
    removePhotoBtn: {
        position: 'absolute', top: 5, right: 5, backgroundColor: 'rgba(0,0,0,0.6)',
        width: 20, height: 20, borderRadius: 10, justifyContent: 'center', alignItems: 'center'
    },
    addPhotoBtn: {
        width: 100, height: 100, borderRadius: 16, backgroundColor: '#F0F9FF',
        justifyContent: 'center', alignItems: 'center', borderWidth: 1,
        borderColor: '#007AFF', borderStyle: 'dashed', gap: 5
    },
    addPhotoText: { fontSize: 12, color: '#007AFF', fontFamily: 'NotoSans-Bold' }
});
