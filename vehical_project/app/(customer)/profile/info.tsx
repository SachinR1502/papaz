import { Colors } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useCustomer } from '@/context/CustomerContext';
import { useLanguage } from '@/context/LanguageContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getMediaUrl } from '@/utils/mediaHelpers';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    Image,
    KeyboardAvoidingView,
    Linking,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PersonalInfoScreen() {
    const { user } = useAuth();
    const { profile, updateProfile, uploadFile } = useCustomer();
    const router = useRouter();
    const { t } = useLanguage();
    const colorScheme = useColorScheme();
    const theme = colorScheme ?? 'light';
    const colors = Colors[theme];
    const isDark = theme === 'dark';

    const [name, setName] = useState(profile?.fullName || user?.fullName || '');
    const [email, setEmail] = useState(profile?.email || '');
    const [phone, setPhone] = useState(user?.phoneNumber || '');
    const [address, setAddress] = useState(profile?.address || '');
    const [city, setCity] = useState(profile?.city || '');
    const [avatarUri, setAvatarUri] = useState(profile?.avatar || user?.avatar || null);
    const [uploading, setUploading] = useState(false);

    const handlePickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert(t('Error'), t('Permission to access gallery was denied'));
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
        });

        if (!result.canceled) {
            setAvatarUri(result.assets[0].uri);
        }
    };

    const handleSave = async () => {
        if (!name) {
            Alert.alert(t("Error"), t("Please fill in all required fields."));
            return;
        }

        setUploading(true);
        try {
            let finalAvatar = profile?.avatar;

            if (avatarUri && avatarUri !== profile?.avatar && !avatarUri.startsWith('http')) {
                // Upload new avatar
                const uploaded = await uploadFile(avatarUri, 'image');
                finalAvatar = uploaded.url || uploaded.path;
            }

            await updateProfile({
                fullName: name,
                email,
                address,
                city,
                avatar: finalAvatar
            });
            Alert.alert(t("Success"), t("Profile updated successfully!"));
            if (router.canGoBack()) {
                router.back();
            } else {
                router.replace('/(customer)/(tabs)');
            }
        } catch (e) {
            console.error(e);
            Alert.alert(t("Error"), t("Failed to update profile"));
        } finally {
            setUploading(false);
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
            <View style={[styles.header, { borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace('/(customer)/(tabs)')} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>{t('Personal Information')}</Text>
                <View style={{ width: 44 }} />
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <View style={styles.avatarSection}>
                        <View style={styles.avatarWrapper}>
                            <Image
                                source={{ uri: getMediaUrl(avatarUri) || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop' }}
                                style={[styles.avatar, { backgroundColor: colors.card }]}
                            />
                            <TouchableOpacity
                                style={styles.changePicBtn}
                                onPress={handlePickImage}
                            >
                                <Ionicons name="camera" size={18} color="#FFF" />
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.avatarHint}>{t('Tap to change profile picture')}</Text>
                    </View>

                    <View style={styles.form}>
                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: colors.icon }]}>{t('Full Name')}</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
                                value={name}
                                onChangeText={setName}
                                placeholder={t("Enter your full name")}
                                placeholderTextColor={colors.icon}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: colors.icon }]}>{t('Email Address')}</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
                                value={email}
                                onChangeText={setEmail}
                                placeholder={t("Enter your email")}
                                keyboardType="email-address"
                                placeholderTextColor={colors.icon}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: colors.icon }]}>{t('Phone Number')}</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
                                value={phone}
                                editable={false} // Phone usually comes from auth and is immutable here for now
                                placeholder={t("Enter your phone number")}
                                keyboardType="phone-pad"
                                placeholderTextColor={colors.icon}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: colors.icon }]}>{t('Address')}</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
                                value={address}
                                onChangeText={setAddress}
                                placeholder={t("Enter your address")}
                                placeholderTextColor={colors.icon}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: colors.icon }]}>{t('City')}</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
                                value={city}
                                onChangeText={setCity}
                                placeholder={t("Enter your city")}
                                placeholderTextColor={colors.icon}
                            />
                        </View>

                        <TouchableOpacity style={[styles.saveBtn, { backgroundColor: colors.primary }]} onPress={handleSave}>
                            <Text style={[styles.saveBtnText, { color: '#FFF' }]}>{uploading ? t('Saving...') : t('Save Changes')}</Text>
                        </TouchableOpacity>

                        <View style={styles.footer}>
                            <TouchableOpacity onPress={() => Linking.openURL('https://www.agrozonetechnology.com/')}>
                                <Text style={[styles.footerText, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                                    Developed by <Text style={{ color: '#FFC107', fontWeight: 'bold' }}>Agro</Text>zone Technology Pvt. Ltd.
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFF' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#F2F2F7'
    },
    backBtn: { width: 44, height: 44, justifyContent: 'center' },
    headerTitle: { fontSize: 18, fontFamily: 'NotoSans-Bold', color: '#1A1A1A' },
    scrollContent: { padding: 24, paddingBottom: 100 },

    avatarSection: { alignItems: 'center', marginBottom: 30 },
    avatarWrapper: { position: 'relative' },
    avatar: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#F2F2F7' },
    changePicBtn: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#1A1A1A',
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#FFF'
    },
    avatarHint: { fontSize: 13, color: '#8E8E93', marginTop: 12, fontFamily: 'NotoSans-Regular' },

    form: { gap: 20 },
    inputGroup: { gap: 8 },
    label: { fontSize: 14, fontFamily: 'NotoSans-Bold', color: '#8E8E93', marginLeft: 4 },
    input: {
        height: 56,
        backgroundColor: '#F8F9FE',
        borderRadius: 16,
        paddingHorizontal: 16,
        fontSize: 16,
        fontFamily: 'NotoSans-Regular',
        color: '#1A1A1A',
        borderWidth: 1,
        borderColor: '#F0F0F0'
    },
    saveBtn: {
        backgroundColor: '#1A1A1A',
        height: 56,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20
    },
    saveBtnText: { color: '#FFF', fontSize: 16, fontFamily: 'NotoSans-Bold' },

    footer: { alignItems: 'center', marginTop: 30 },
    footerText: { fontSize: 12, fontFamily: 'NotoSans-Regular' }
});
