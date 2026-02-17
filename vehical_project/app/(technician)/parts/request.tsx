import { PartRequestItem, TechnicianPartRequestModal } from '@/components/technician/TechnicianPartRequestModal';
import { AudioPlayer } from '@/components/ui/AudioPlayer';
import { Colors } from '@/constants/theme';
import { useAdmin } from '@/context/AdminContext';
import { useLanguage } from '@/context/LanguageContext';
import { useTechnician } from '@/context/TechnicianContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { technicianService } from '@/services/technicianService';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Audio as ExpoAudio } from 'expo-av';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Image, Keyboard, Platform, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function RequestProductScreen() {
    const router = useRouter();
    const { jobId } = useLocalSearchParams<{ jobId: string }>(); // Capture jobId
    const { requestProduct, myJobs, uploadFile, requestParts } = useTechnician();
    const { settings } = useAdmin();
    const { t } = useLanguage();
    const colorScheme = useColorScheme();
    const theme = colorScheme ?? 'light';
    const colors = Colors[theme];
    const isDark = theme === 'dark';

    const currencySymbol = settings.currency === 'INR' ? '₹' : '$';

    const job = myJobs.find(j => j.id === jobId);
    const [search, setSearch] = useState(job?.vehicleModel || '');
    const [selectedProduct, setSelectedProduct] = useState<any>(null);
    const [products, setProducts] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [requesting, setRequesting] = useState(false);
    const [customModalVisible, setCustomModalVisible] = useState(false);
    const [submittingCustom, setSubmittingCustom] = useState(false);

    useEffect(() => {
        if (!search && job?.vehicleModel) {
            setSearch(job.vehicleModel);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [job]);

    useEffect(() => {
        const fetchProducts = async () => {
            setIsLoading(true);
            try {
                // Fetch directly from API Service which combines Static + Dynamic Supplier Stock
                const results: any = await technicianService.getProducts({ search });
                setProducts(results);
            } catch (e) {
                console.error(e);
            } finally {
                setIsLoading(false);
            }
        };
        fetchProducts();
    }, [search]);

    const handleRequest = async (product: any) => {
        setRequesting(true);
        try {
            // Pass shop info and jobId to context
            await requestProduct(product.id, 1, product.shop, jobId);
            Alert.alert(t('success'), t('part_requested'), [
                { text: 'OK', onPress: () => router.back() }
            ]);
        } catch (e) {
            Alert.alert(t('error'), t('request_fail_msg'));
        } finally {
            setRequesting(false);
            setSelectedProduct(null);
        }
    };

    const handleCustomSubmit = async (items: PartRequestItem[], notes: string, supplierId: string | null, photos: string[], voiceNote: string | null, vehicleId: string | null) => {
        setSubmittingCustom(true);
        try {
            const uploadedPhotos = await Promise.all(
                photos.map(async (uri) => {
                    if (uri.startsWith('http')) return uri;
                    const res = await uploadFile(uri, 'image');
                    return res.url || res.path;
                })
            );

            let uploadedVoice = null;
            if (voiceNote) {
                if (voiceNote.startsWith('http')) {
                    uploadedVoice = voiceNote;
                } else {
                    const res = await uploadFile(voiceNote, 'audio');
                    uploadedVoice = res.url || res.path;
                }
            }

            const processedParts = items.map((item, idx) => {
                let description = item.description || notes;
                // DO NOT bundle global media into item descriptions anymore
                // We will pass them as top-level metadata

                return {
                    ...item,
                    name: item.name,
                    brand: item.brand,
                    quantity: item.quantity,
                    description: description,
                    price: item.price || 0,
                    image: item.image,
                };
            });

            await requestParts(jobId!, processedParts, {
                photos: uploadedPhotos,
                voiceNote: uploadedVoice,
                supplierId: supplierId
            });

            setCustomModalVisible(false);
            Alert.alert(t('success'), t('part_requested_success') || t('part_requested'), [
                { text: 'OK', onPress: () => router.back() }
            ]);
        } catch (e) {
            console.error("Custom submit error:", e);
            Alert.alert(t('error'), t('request_fail_msg'));
        } finally {
            setSubmittingCustom(false);
        }
    };

    const renderItem = ({ item, index }: { item: any, index: number }) => (
        <Animated.View entering={FadeInDown.delay(index * 100).springify()}>
            <TouchableOpacity
                style={[styles.itemCard, { backgroundColor: colors.card, borderColor: isDark ? colors.border : 'rgba(0,0,0,0.05)', shadowColor: colors.shadow }]}
                onPress={() => setSelectedProduct(item)}
            >
                <View style={[styles.itemIcon, { backgroundColor: colors.primary + '10' }]}>
                    {item.icon && ['water', 'disc', 'air-filter', 'flash', 'spray'].includes(item.icon) ? (
                        <MaterialCommunityIcons name={item.icon} size={24} color={colors.primary} />
                    ) : (
                        <Ionicons name={item.icon || 'cube-outline'} size={24} color={colors.primary} />
                    )}
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={[styles.itemName, { color: colors.text }]}>{item.name}</Text>
                    <Text style={[styles.itemShop, { color: colors.icon }]}>{t('sold_by')} {item.shop}</Text>
                </View>
                <View style={[styles.priceTag, { backgroundColor: colors.background }]}>
                    <Text style={[styles.itemPrice, { color: colors.primary }]}>{currencySymbol}{item.price}</Text>
                </View>
            </TouchableOpacity>
        </Animated.View>
    );

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={{ flex: 1, backgroundColor: colors.background }}>
                <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

                {/* Glass Header */}
                <BlurView intensity={Platform.OS === 'ios' ? 80 : 0} tint={isDark ? 'dark' : 'light'} style={styles.headerContainer}>
                    <SafeAreaView edges={['top']}>
                        <View style={styles.headerContent}>
                            <TouchableOpacity onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}>
                                <Ionicons name="arrow-back" size={24} color={colors.text} />
                            </TouchableOpacity>
                            <Text style={[styles.title, { color: colors.text }]}>{t('request_product')}</Text>
                            <View style={{ width: 40 }} />
                        </View>
                    </SafeAreaView>
                </BlurView>

                {/* Content */}
                <View style={{ flex: 1, paddingTop: 100 }}>

                    {/* Job Context Banner */}
                    {job && (
                        <View style={[styles.contextBanner, { backgroundColor: colors.primary + '10', borderColor: colors.primary + '20' }]}>
                            <Ionicons name="car-sport" size={18} color={colors.primary} />
                            <Text style={[styles.contextText, { color: colors.text }]}>
                                {t('ordering_for')}: <Text style={{ fontFamily: 'NotoSans-Bold' }}>{job.vehicleModel}</Text> ({job.vehicleNumber})
                            </Text>
                        </View>
                    )}

                    {/* Search Bar */}
                    <View style={[styles.searchContainer, { backgroundColor: isDark ? colors.card : '#FFFFFF', borderColor: isDark ? colors.border : 'rgba(0,0,0,0.05)', shadowColor: colors.shadow }]}>
                        <Ionicons name="search" size={20} color={colors.icon} />
                        <TextInput
                            style={[styles.searchInput, { color: colors.text }]}
                            placeholder={t('search_parts_placeholder') || "Search parts..."}
                            placeholderTextColor={colors.icon}
                            value={search}
                            onChangeText={setSearch}
                        />
                    </View>

                    {isLoading ? (
                        <View style={{ marginTop: 40 }}>
                            <ActivityIndicator size="large" color={colors.primary} />
                        </View>
                    ) : (
                        <FlatList
                            data={products}
                            renderItem={renderItem}
                            keyExtractor={item => item.id}
                            contentContainerStyle={styles.list}
                            ListEmptyComponent={
                                <View style={styles.empty}>
                                    <Text style={{ color: colors.icon, marginBottom: 15 }}>{t('no_products_match')} &apos;{search}&apos;.</Text>
                                    <TouchableOpacity
                                        style={{ backgroundColor: colors.primary, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12 }}
                                        onPress={() => setCustomModalVisible(true)}
                                    >
                                        <Text style={{ color: '#FFF', fontWeight: 'bold' }}>{t('request_custom_part')}</Text>
                                    </TouchableOpacity>
                                </View>
                            }
                        />
                    )}

                    {/* Confirmation Modal Overlay */}
                    {selectedProduct && (
                        <View style={styles.overlay}>
                            <View style={[styles.modal, { backgroundColor: colors.card }]}>
                                <View style={[styles.modalIcon, { backgroundColor: colors.primary + '15' }]}>
                                    <MaterialCommunityIcons name="check-decagram" size={32} color={colors.primary} />
                                </View>
                                <Text style={[styles.modalTitle, { color: colors.text }]}>{t('confirm_request')}</Text>
                                <Text style={[styles.modalText, { color: colors.icon }]}>
                                    {t('requesting')} <Text style={{ fontWeight: 'bold', color: colors.text }}>{selectedProduct.name}</Text> {t('from')} {selectedProduct.shop}?
                                </Text>
                                <View style={styles.modalActions}>
                                    <TouchableOpacity
                                        style={[styles.cancelBtn, { backgroundColor: isDark ? '#FFFFFF10' : '#F2F2F7' }]}
                                        onPress={() => setSelectedProduct(null)}
                                        disabled={requesting}
                                    >
                                        <Text style={[styles.cancelText, { color: colors.text }]}>{t('cancel')}</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.confirmBtn, { backgroundColor: colors.primary }]}
                                        onPress={() => handleRequest(selectedProduct)}
                                        disabled={requesting}
                                    >
                                        {requesting ? (
                                            <ActivityIndicator color="#FFF" />
                                        ) : (
                                            <Text style={styles.confirmText}>{t('send_request')}</Text>
                                        )}
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    )}
                </View>

                {/* Custom Request Modal */}
                <TechnicianPartRequestModal
                    visible={customModalVisible}
                    onClose={() => setCustomModalVisible(false)}
                    onSubmit={handleCustomSubmit}
                    suppliers={[]}
                    partsSource="garage"
                    vehicles={job ? [{
                        id: job.vehicleId || (job.vehicle as any)?._id,
                        make: (job.vehicle as any)?.make || 'Unknown',
                        model: job.vehicleModel || (job.vehicle as any)?.model || 'Vehicle',
                        registrationNumber: job.vehicleNumber || (job.vehicle as any)?.registrationNumber
                    }] : []}
                    submitting={submittingCustom}
                    initialNotes={search}
                />

            </View>
        </TouchableWithoutFeedback >
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    headerContainer: {
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 100
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 10,
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 17,
        fontFamily: 'NotoSans-Bold',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 20,
        marginBottom: 15,
        paddingHorizontal: 16,
        height: 54,
        borderRadius: 18,
        borderWidth: 1,
        gap: 12,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        height: '100%',
        fontFamily: 'NotoSans-Medium'
    },
    list: {
        paddingHorizontal: 20,
        paddingBottom: 40,
        paddingTop: 10,
    },
    itemCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 20,
        marginBottom: 12,
        borderWidth: 1,
        gap: 15,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 2
    },
    itemIcon: {
        width: 50,
        height: 50,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    itemName: {
        fontSize: 15,
        fontFamily: 'NotoSans-Bold',
    },
    itemShop: {
        fontSize: 12,
        marginTop: 2,
        fontFamily: 'NotoSans-Medium'
    },
    priceTag: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center'
    },
    itemPrice: {
        fontSize: 14,
        fontFamily: 'NotoSans-Black',
    },
    empty: {
        alignItems: 'center',
        marginTop: 40,
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        zIndex: 100,
    },
    modal: {
        width: '100%',
        padding: 24,
        borderRadius: 24,
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 10,
    },
    modalIcon: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#F0F7FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    modalText: {
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 22,
        fontSize: 14,
    },
    modalActions: {
        flexDirection: 'row',
        gap: 15,
        width: '100%',
    },
    cancelBtn: {
        flex: 1,
        height: 50,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cancelText: {
        fontWeight: '700',
    },
    confirmBtn: {
        flex: 1,
        height: 50,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    confirmText: {
        color: '#FFF',
        fontWeight: '700',
    },
    input: {
        width: '100%',
        height: 50,
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 15,
        marginBottom: 15,
        fontSize: 16,
        fontFamily: 'NotoSans-Medium'
    },
    contextBanner: {
        marginHorizontal: 20,
        marginBottom: 12,
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    contextText: {
        fontSize: 14,
        fontFamily: 'NotoSans-Medium',
        flex: 1,
    }
});
