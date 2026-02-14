import { Colors } from '@/constants/theme';
import { useAdmin } from '@/context/AdminContext';
import { useCustomer } from '@/context/CustomerContext';
import { useLanguage } from '@/context/LanguageContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getMediaUrl } from '@/utils/mediaHelpers';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React from 'react';
import {
    FlatList,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function WishlistScreen() {
    const router = useRouter();
    const { settings } = useAdmin();
    const { t } = useLanguage();
    const { wishlist, removeFromWishlist, addToCart } = useCustomer();
    const colorScheme = useColorScheme();
    const theme = colorScheme ?? 'light';
    const colors = Colors[theme];
    const isDark = theme === 'dark';

    const currencySymbol = settings.currency === 'INR' ? '₹' : '$';

    const handleRemove = async (id: string) => {
        try {
            await removeFromWishlist(id);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch (e) {
            console.error(e);
        }
    };

    const handleAddToCart = (item: any) => {
        addToCart({
            id: item.id || item._id,
            name: item.name,
            price: item.price,
            category: item.category,
            image: item.image,
            rating: item.rating || 5
        });
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
            <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>{t('Wishlist')}</Text>
                <View style={{ width: 44 }} />
            </View>

            <FlatList
                data={wishlist}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContent}
                renderItem={({ item }) => (
                    <View style={[styles.wishCard, { backgroundColor: colors.card }]}>
                        <Image source={{ uri: getMediaUrl(item.image) || '' }} style={[styles.wishImage, { backgroundColor: isDark ? colors.border : '#F8F9FE' }]} />
                        <View style={styles.wishInfo}>
                            <Text style={[styles.wishCategory, { color: colors.customers }]}>{item.category}</Text>
                            <Text style={[styles.wishName, { color: colors.text }]} numberOfLines={1}>{item.name}</Text>
                            <Text style={[styles.wishPrice, { color: colors.text }]}>{currencySymbol}{Number(item.price).toLocaleString()}</Text>

                            <View style={styles.actions}>
                                <TouchableOpacity
                                    style={[styles.addBtn, { backgroundColor: colors.text }]}
                                    onPress={() => handleAddToCart(item)}
                                >
                                    <Ionicons name="cart-outline" size={18} color={colors.background} />
                                    <Text style={[styles.addText, { color: colors.background }]}>{t('Add to Cart')}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.removeBtn, { backgroundColor: isDark ? colors.notification + '20' : '#FFF0F0' }]}
                                    onPress={() => handleRemove(item.id || item._id)}
                                >
                                    <Ionicons name="trash-outline" size={18} color={colors.notification} />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                )}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="heart-outline" size={80} color={colors.icon} />
                        <Text style={[styles.emptyText, { color: colors.icon }]}>{t('Your wishlist is empty')}</Text>
                    </View>
                }
                extraData={theme}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FE' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: '#FFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F2F2F7'
    },
    backBtn: { width: 44, height: 44, justifyContent: 'center' },
    headerTitle: { fontSize: 18, fontFamily: 'NotoSans-Bold', color: '#1A1A1A' },
    listContent: { padding: 20 },
    wishCard: {
        backgroundColor: '#FFF',
        borderRadius: 24,
        padding: 12,
        flexDirection: 'row',
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.03,
        shadowRadius: 10,
        elevation: 2
    },
    wishImage: { width: 100, height: 100, borderRadius: 20, backgroundColor: '#F8F9FE' },
    wishInfo: { flex: 1, marginLeft: 15, justifyContent: 'center' },
    wishCategory: { fontSize: 10, fontFamily: 'NotoSans-Bold', color: '#007AFF', textTransform: 'uppercase', marginBottom: 4 },
    wishName: { fontSize: 16, fontFamily: 'NotoSans-Bold', color: '#1A1A1A', marginBottom: 4 },
    wishPrice: { fontSize: 18, fontFamily: 'NotoSans-Black', color: '#1A1A1A', marginBottom: 12 },
    actions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    addBtn: { flex: 1, backgroundColor: '#1A1A1A', height: 40, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
    addText: { color: '#FFF', fontSize: 13, fontFamily: 'NotoSans-Bold' },
    removeBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#FFF0F0', justifyContent: 'center', alignItems: 'center' },
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 100 },
    emptyText: { fontSize: 18, fontFamily: 'NotoSans-Bold', color: '#8E8E93', marginTop: 20 }
});
