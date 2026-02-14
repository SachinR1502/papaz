import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');

interface ProductCardProps {
    product: any;
    onAdd: (product: any) => void;
    onWishlist: (product: any) => void;
    isWishlisted?: boolean;
}

export const ProductCard = ({ product, onAdd, onWishlist, isWishlisted }: ProductCardProps) => {
    const colorScheme = useColorScheme();
    const theme = colorScheme ?? 'light';
    const colors = Colors[theme];
    const isDark = theme === 'dark';

    return (
        <View style={[styles.card, { backgroundColor: colors.card, shadowColor: isDark ? '#000' : colors.primary }]}>
            <View style={styles.imageContainer}>
                <Image
                    source={{ uri: product.image }}
                    style={styles.image}
                    contentFit="cover"
                    transition={300}
                />
                <TouchableOpacity
                    style={[styles.wishlistBtn, { backgroundColor: isDark ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.8)' }]}
                    onPress={() => onWishlist(product)}
                >
                    <Ionicons
                        name={isWishlisted ? "heart" : "heart-outline"}
                        size={20}
                        color={isWishlisted ? colors.notification : colors.text}
                    />
                </TouchableOpacity>
            </View>

            <View style={styles.info}>
                <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>{product.name}</Text>

                <View style={styles.supplierRow}>
                    <MaterialCommunityIcons name="store" size={12} color={colors.icon} />
                    <Text style={[styles.supplierText, { color: colors.icon }]} numberOfLines={1}>
                        {product.supplier?.storeName || 'Premium Dealer'}
                    </Text>
                </View>

                <View style={styles.footer}>
                    <View>
                        <Text style={[styles.priceTag, { color: colors.primary }]}>₹{product.price}</Text>
                        {product.distance && (
                            <Text style={[styles.distance, { color: colors.icon }]}>
                                {typeof product.distance === 'number' ? `${product.distance.toFixed(1)} km` : product.distance}
                            </Text>
                        )}
                    </View>

                    <TouchableOpacity
                        style={[styles.addBtn, { backgroundColor: colors.primary }]}
                        onPress={() => onAdd(product)}
                    >
                        <Ionicons name="add" size={24} color="#FFF" />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        width: (width - 60) / 2,
        borderRadius: 24,
        marginBottom: 20,
        overflow: 'hidden',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 3,
    },
    imageContainer: {
        width: '100%',
        height: 140,
        position: 'relative',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    wishlistBtn: {
        position: 'absolute',
        top: 10,
        right: 10,
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    info: {
        padding: 12,
    },
    name: {
        fontSize: 15,
        fontFamily: 'NotoSans-Bold',
    },
    supplierRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 4,
    },
    supplierText: {
        fontSize: 11,
        fontFamily: 'NotoSans-Regular',
        flex: 1,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        marginTop: 10,
    },
    priceTag: {
        fontSize: 16,
        fontFamily: 'NotoSans-Black',
    },
    distance: {
        fontSize: 10,
        fontFamily: 'NotoSans-Regular',
        marginTop: 2,
    },
    addBtn: {
        width: 36,
        height: 36,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
