import { Colors } from '@/constants/theme';
import { useLanguage } from '@/context/LanguageContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getMediaUrl } from '@/utils/mediaHelpers';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');

interface TechnicianProductCardProps {
    product: any;
    onAddToCart: (product: any) => void;
    currencySymbol: string;
}

export const TechnicianProductCard = ({ product, onAddToCart, currencySymbol }: TechnicianProductCardProps) => {
    const { t } = useLanguage();
    const colorScheme = useColorScheme();
    const theme = colorScheme ?? 'light';
    const colors = Colors[theme];

    return (
        <TouchableOpacity
            style={[styles.productCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            activeOpacity={0.9}
        >
            <View style={styles.imageBox}>
                <Image
                    source={{ uri: getMediaUrl(product.image) || '' }}
                    style={styles.productImage}
                    contentFit="cover"
                    transition={300}
                />
                <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.6)']}
                    style={StyleSheet.absoluteFill}
                />
                <View style={styles.itemBadges}>
                    <View style={[styles.moqBadge, { backgroundColor: 'rgba(0,0,0,0.75)' }]}>
                        <Text style={styles.moqText}>MOQ: {product.moq || 1}</Text>
                    </View>
                </View>
                <BlurView intensity={20} tint="dark" style={styles.ratingBadgeSmall}>
                    <Ionicons name="star" size={12} color="#FFD700" />
                    <Text style={[styles.ratingTextSmall, { color: '#FFF' }]}>{product.rating || '4.5'}</Text>
                </BlurView>
            </View>

            <View style={styles.productBody}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <Text style={[styles.categoryLabel, { color: colors.primary }]}>{t(product.category || 'Spare Parts')}</Text>
                </View>
                <Text style={[styles.productName, { color: colors.text }]} numberOfLines={2}>{product.name}</Text>

                <View style={styles.priceContainer}>
                    <View>
                        <Text style={[styles.priceLabel, { color: colors.icon }]}>{t('wholesale_price')}</Text>
                        <Text style={[styles.wholesalePrice, { color: colors.text }]}>
                            {currencySymbol}{product.price.toLocaleString()}
                        </Text>
                    </View>
                    <TouchableOpacity
                        style={[styles.addBtnContainer, { backgroundColor: colors.primary }]}
                        onPress={() => onAddToCart(product)}
                    >
                        <LinearGradient
                            colors={[colors.primary, colors.primary + 'CC']}
                            style={styles.addBtnGradient}
                        >
                            <Ionicons name="cart-outline" size={20} color="#FFF" />
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    productCard: {
        width: (width - 56) / 2,
        borderRadius: 24,
        overflow: 'hidden',
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2
    },
    imageBox: { height: 160, backgroundColor: '#F0F2F5', position: 'relative' },
    productImage: { width: '100%', height: '100%' },
    itemBadges: { position: 'absolute', top: 10, left: 10 },
    moqBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
    moqText: { color: '#FFF', fontSize: 9, fontFamily: 'NotoSans-Black' },
    ratingBadgeSmall: {
        position: 'absolute',
        bottom: 10,
        right: 10,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 10,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        overflow: 'hidden'
    },
    ratingTextSmall: { fontSize: 10, fontFamily: 'NotoSans-Black' },
    productBody: { padding: 12 },
    categoryLabel: { fontSize: 10, fontFamily: 'NotoSans-Black', textTransform: 'uppercase' },
    productName: { fontSize: 14, fontFamily: 'NotoSans-Bold', height: 40, marginBottom: 10 },
    priceContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
    priceLabel: { fontSize: 9, fontFamily: 'NotoSans-Bold', textTransform: 'uppercase', marginBottom: 2 },
    wholesalePrice: { fontSize: 16, fontFamily: 'NotoSans-Black' },
    addBtnContainer: { width: 36, height: 36, borderRadius: 12, overflow: 'hidden' },
    addBtnGradient: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' },
});
