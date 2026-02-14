import { Colors } from '@/constants/theme';
import { useLanguage } from '@/context/LanguageContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import { ActivityIndicator, Animated, Dimensions, Image, StatusBar, StyleSheet, Text, View } from 'react-native';

export default function SplashScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const theme = colorScheme ?? 'light';
    const colors = Colors[theme];
    const { t } = useLanguage();

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.9)).current;
    const translateY = useRef(new Animated.Value(20)).current;

    useEffect(() => {
        // Animation sequence
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 1200,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 6,
                useNativeDriver: true,
            }),
            Animated.timing(translateY, {
                toValue: 0,
                duration: 1000,
                useNativeDriver: true,
            }),
        ]).start();

        // Auto-redirect to Login after 2.5 seconds
        const timer = setTimeout(() => {
            router.replace('/(auth)/login');
        }, 2500);

        return () => clearTimeout(timer);
    }, [router, fadeAnim, scaleAnim, translateY]);

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar barStyle={theme === 'dark' ? "light-content" : "dark-content"} backgroundColor={colors.background} />

            {/* Background Blobs for Atmosphere */}
            <View style={[styles.bgBlob, styles.blobTop, { backgroundColor: colors.primary, opacity: 0.08 }]} />
            <View style={[styles.bgBlob, styles.blobBottom, { backgroundColor: colors.primary, opacity: 0.12 }]} />

            <Animated.View
                style={[
                    styles.content,
                    {
                        opacity: fadeAnim,
                        transform: [
                            { scale: scaleAnim },
                            { translateY: translateY }
                        ],
                    },
                ]}
            >
                <View style={[styles.logoContainer, { backgroundColor: colors.card, shadowColor: colors.primary }]}>
                    <Image
                        source={require('../assets/images/splash.png')}
                        style={styles.image}
                        resizeMode="contain"
                    />
                </View>

                <Text style={[styles.title, { color: colors.text }]}>PAPAZ</Text>
                <Text style={[styles.tagline, { color: colors.icon }]}>{t('app_tagline')}</Text>

                <View style={styles.loaderContainer}>
                    <ActivityIndicator size="small" color={colors.primary} />
                    <Text style={[styles.loadingText, { color: colors.primary }]}>{t('initializing')}...</Text>
                </View>
            </Animated.View>

            <View style={styles.footer}>
                <Text style={[styles.footerText, { color: colors.icon }]}>{t('powered_by')}</Text>
            </View>
        </View>
    );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
    container: {
        flex: 1,
        position: 'relative',
        overflow: 'hidden',
    },
    bgBlob: {
        position: 'absolute',
        borderRadius: 999,
        zIndex: -1,
    },
    blobTop: {
        top: -100,
        right: -100,
        width: 300,
        height: 300,
    },
    blobBottom: {
        bottom: 100,
        left: -150,
        width: 400,
        height: 400,
    },
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 20,
    },
    logoContainer: {
        width: width * 0.5,
        height: width * 0.5,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 30,
        shadowOffset: {
            width: 0,
            height: 10,
        },
        shadowOpacity: 0.15,
        shadowRadius: 20,
        elevation: 10,
    },
    image: {
        width: width * 0.4,
        height: width * 0.4,
    },
    title: {
        fontSize: 36,
        fontWeight: '900',
        letterSpacing: -1,
        marginBottom: 8,
        fontFamily: 'NotoSans-Black',
    },
    tagline: {
        fontSize: 16,
        fontWeight: '500',
        textAlign: 'center',
        marginBottom: 40,
        fontFamily: 'NotoSans-Regular',
    },
    loaderContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingVertical: 10,
        paddingHorizontal: 20,
    },
    loadingText: {
        fontSize: 14,
        fontWeight: '700',
        letterSpacing: 1,
        textTransform: 'uppercase',
        fontFamily: 'NotoSans-Bold',
    },
    footer: {
        paddingBottom: 40,
        alignItems: 'center',
    },
    footerText: {
        fontSize: 12,
        fontWeight: '500',
        fontFamily: 'NotoSans-Regular',
        opacity: 0.6,
    },
});
