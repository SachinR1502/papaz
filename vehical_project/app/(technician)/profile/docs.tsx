import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { Animated, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const DOCS = [
    { title: 'Garage License', status: 'Verified', date: 'Exp: 12/2026', icon: 'business' },
    { title: 'ID Proof (Aadhar)', status: 'Verified', date: 'Uploaded on 15 Oct', icon: 'card' },
    { title: 'ASE Certification', status: 'Pending', date: 'Under Review', icon: 'ribbon' },
    { title: 'Pollution Control Cert', status: 'Expired', date: 'Exp: 01/2024', icon: 'leaf' },
];

export default function CertificationsScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const colors = {
        background: isDark ? '#000000' : '#F8F9FB',
        card: isDark ? '#1C1C1E' : '#FFFFFF',
        text: isDark ? '#FFFFFF' : '#1A1A1A',
        subText: isDark ? '#A1A1A6' : '#8E8E93',
        border: isDark ? '#2C2C2E' : '#F0F0F0',
        iconBg: isDark ? '#2C2C2E' : '#F8F9FE',
    };

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(20)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 600,
                useNativeDriver: true,
            })
        ]).start();
    }, []);

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
            <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: isDark ? '#2C2C2E' : '#F8F9FE' }]}>
                    <Ionicons name="chevron-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Certifications & Docs</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
                    <View style={[styles.infoCard, { backgroundColor: colors.card }]}>
                        <Ionicons name="shield-checkmark" size={40} color="#34C759" />
                        <Text style={[styles.infoTitle, { color: colors.text }]}>Trust & Verification</Text>
                        <Text style={[styles.infoSub, { color: colors.subText }]}>Keep your documents updated to maintain your &quot;Verified Garage&quot; status and attract more customers.</Text>
                    </View>

                    {DOCS.map((doc, index) => (
                        <View key={index} style={[styles.docItem, { backgroundColor: colors.card }]}>
                            <View style={[styles.iconBg, { backgroundColor: doc.status === 'Verified' ? (isDark ? '#1b3a24' : '#E8F5E9') : (doc.status === 'Expired' ? (isDark ? '#3a1b1b' : '#FFEBEE') : (isDark ? '#3a2e1b' : '#FFF3E0')) }]}>
                                <Ionicons name={doc.icon as any} size={22} color={doc.status === 'Verified' ? '#34C759' : (doc.status === 'Expired' ? '#FF3B30' : '#FF9500')} />
                            </View>
                            <View style={styles.docText}>
                                <Text style={[styles.docTitle, { color: colors.text }]}>{doc.title}</Text>
                                <Text style={[styles.docDate, { color: colors.subText }]}>{doc.date}</Text>
                            </View>
                            <View style={[styles.statusBadge, { backgroundColor: doc.status === 'Verified' ? '#34C759' : (doc.status === 'Expired' ? '#FF3B30' : '#FF9500') }]}>
                                <Text style={styles.statusText}>{doc.status}</Text>
                            </View>
                        </View>
                    ))}

                    <TouchableOpacity style={styles.uploadBtn}>
                        <Ionicons name="cloud-upload-outline" size={20} color="#FFF" />
                        <Text style={styles.uploadText}>Upload New Document</Text>
                    </TouchableOpacity>
                </Animated.View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 15, paddingVertical: 10, borderBottomWidth: 1 },
    backBtn: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
    headerTitle: { fontSize: 17, fontWeight: 'bold' },
    content: { padding: 20 },
    infoCard: { borderRadius: 24, padding: 25, alignItems: 'center', marginBottom: 25, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 3 },
    infoTitle: { fontSize: 18, fontWeight: 'bold', marginTop: 15 },
    infoSub: { fontSize: 13, textAlign: 'center', marginTop: 8, lineHeight: 18 },
    docItem: { flexDirection: 'row', alignItems: 'center', padding: 15, borderRadius: 20, marginBottom: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 5, elevation: 1 },
    iconBg: { width: 46, height: 46, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
    docText: { flex: 1 },
    docTitle: { fontSize: 15, fontWeight: 'bold' },
    docDate: { fontSize: 11, marginTop: 3 },
    statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    statusText: { fontSize: 10, fontWeight: 'bold', color: '#FFF' },
    uploadBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: '#007AFF', height: 56, borderRadius: 18, marginTop: 10 },
    uploadText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
});
