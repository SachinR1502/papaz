import { Colors } from '@/constants/theme';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PaymentMethodsScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const theme = colorScheme ?? 'light';
    const colors = Colors[theme];
    const isDark = theme === 'dark';

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
            <View style={styles.bgBlob1} />

            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: isDark ? colors.card : '#F8F9FE' }]}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.title, { color: colors.text }]}>Payment Methods</Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.icon }]}>Linked Accounts</Text>

                    {/* Primary Account */}
                    <View style={[styles.card, { backgroundColor: isDark ? colors.card : '#1A1A1A' }]}>
                        <View style={styles.cardTop}>
                            <View style={[styles.bankIcon, { backgroundColor: isDark ? colors.text : '#FFF' }]}>
                                <MaterialCommunityIcons name="bank" size={24} color={isDark ? colors.background : "#007AFF"} />
                            </View>
                            <View style={styles.badge}>
                                <Text style={styles.badgeText}>PRIMARY</Text>
                            </View>
                        </View>
                        <Text style={[styles.bankName, { color: isDark ? colors.text : '#FFF' }]}>HDFC Bank</Text>
                        <Text style={styles.accountNum}>•••• •••• •••• 8899</Text>
                        <View style={styles.cardFooter}>
                            <Text style={[styles.holderName, { color: isDark ? colors.text : '#FFF' }]}>Sunil Kumar</Text>
                            <Ionicons name="checkmark-circle" size={20} color="#34C759" />
                        </View>
                    </View>

                    {/* Second Account */}
                    <View style={[styles.card, { borderColor: colors.border, borderWidth: 1, backgroundColor: colors.background, elevation: 0 }]}>
                        <View style={styles.cardTop}>
                            <View style={[styles.bankIcon, { backgroundColor: isDark ? colors.card : '#F2F2F7' }]}>
                                <MaterialCommunityIcons name="bank" size={24} color={colors.icon} />
                            </View>
                        </View>
                        <Text style={[styles.bankName, { color: colors.text }]}>SBI Bank</Text>
                        <Text style={[styles.accountNum, { color: colors.icon }]}>•••• •••• •••• 4421</Text>
                        <View style={styles.cardFooter}>
                            <Text style={[styles.holderName, { color: colors.icon }]}>Sunil Kumar</Text>
                        </View>
                    </View>
                </View>

                <TouchableOpacity style={[styles.addBtn, { backgroundColor: colors.primary }]}>
                    <Ionicons name="add" size={24} color="#FFF" />
                    <Text style={styles.addBtnText}>Add New Bank Account</Text>
                </TouchableOpacity>

                <Text style={[styles.uipText, { color: colors.icon }]}>UPI ID linked: sunil.shop@okhdfcbank</Text>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, position: 'relative', overflow: 'hidden' },
    bgBlob1: { position: 'absolute', top: -150, right: -100, width: 350, height: 350, borderRadius: 175, backgroundColor: '#007AFF05', zIndex: -1 },

    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 10 },
    backBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#F8F9FE', justifyContent: 'center', alignItems: 'center' },
    title: { fontSize: 18, fontWeight: 'bold', color: '#1A1A1A' },

    content: { padding: 24 },
    section: { marginBottom: 30 },
    sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#8E8E93', marginBottom: 15, textTransform: 'uppercase', letterSpacing: 0.5 },

    card: {
        backgroundColor: '#1A1A1A',
        borderRadius: 24,
        padding: 24,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5
    },
    cardTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
    bankIcon: { width: 48, height: 48, borderRadius: 16, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center' },
    badge: { backgroundColor: '#34C759', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, height: 24, justifyContent: 'center' },
    badgeText: { color: '#FFF', fontSize: 10, fontWeight: '900' },
    bankName: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
    accountNum: { color: '#8E8E93', fontSize: 16, marginTop: 4, letterSpacing: 2 },
    cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 24 },
    holderName: { color: '#FFF', fontSize: 14, fontWeight: '600' },

    addBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 56, borderRadius: 18, backgroundColor: '#007AFF', gap: 10, shadowColor: '#007AFF', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
    addBtnText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },

    uipText: { textAlign: 'center', marginTop: 24, color: '#8E8E93', fontSize: 14 }
});
