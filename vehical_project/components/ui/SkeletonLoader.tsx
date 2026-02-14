import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import React from 'react';
import { Animated, StyleSheet, View } from 'react-native';

interface SkeletonProps {
    width?: number | string;
    height?: number;
    borderRadius?: number;
    style?: any;
}

export const SkeletonLoader: React.FC<SkeletonProps> = ({
    width = '100%',
    height = 20,
    borderRadius = 8,
    style,
}) => {
    const colorScheme = useColorScheme();
    const theme = colorScheme ?? 'light';
    const colors = Colors[theme];
    const animatedValue = React.useRef(new Animated.Value(0)).current;

    React.useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(animatedValue, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.timing(animatedValue, {
                    toValue: 0,
                    duration: 1000,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, []);

    const opacity = animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [0.3, 0.7],
    });

    return (
        <Animated.View
            style={[
                {
                    width,
                    height,
                    borderRadius,
                    backgroundColor: colors.border,
                    opacity,
                },
                style,
            ]}
        />
    );
};

// Dashboard Skeleton
export const DashboardSkeleton: React.FC = () => {
    const colorScheme = useColorScheme();
    const theme = colorScheme ?? 'light';
    const colors = Colors[theme];

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header */}
            <View style={styles.header}>
                <SkeletonLoader width={150} height={24} />
                <SkeletonLoader width={40} height={40} borderRadius={20} />
            </View>

            {/* Stats Cards */}
            <View style={styles.statsRow}>
                <SkeletonLoader width="48%" height={100} borderRadius={16} />
                <SkeletonLoader width="48%" height={100} borderRadius={16} />
            </View>

            {/* Section Title */}
            <SkeletonLoader width={120} height={20} style={{ marginTop: 24, marginBottom: 16 }} />

            {/* List Items */}
            {[1, 2, 3].map((item) => (
                <View key={item} style={styles.listItem}>
                    <SkeletonLoader width={60} height={60} borderRadius={12} />
                    <View style={styles.listItemContent}>
                        <SkeletonLoader width="70%" height={18} />
                        <SkeletonLoader width="50%" height={14} style={{ marginTop: 8 }} />
                    </View>
                </View>
            ))}
        </View>
    );
};

// Job Card Skeleton
export const JobCardSkeleton: React.FC = () => {
    const colorScheme = useColorScheme();
    const theme = colorScheme ?? 'light';
    const colors = Colors[theme];

    return (
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.cardHeader}>
                <SkeletonLoader width={80} height={16} />
                <SkeletonLoader width={60} height={24} borderRadius={12} />
            </View>
            <SkeletonLoader width="100%" height={18} style={{ marginTop: 12 }} />
            <SkeletonLoader width="80%" height={14} style={{ marginTop: 8 }} />
            <View style={styles.cardFooter}>
                <SkeletonLoader width={100} height={14} />
                <SkeletonLoader width={80} height={14} />
            </View>
        </View>
    );
};

// Product Card Skeleton
export const ProductCardSkeleton: React.FC = () => {
    const colorScheme = useColorScheme();
    const theme = colorScheme ?? 'light';
    const colors = Colors[theme];

    return (
        <View style={[styles.productCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <SkeletonLoader width="100%" height={120} borderRadius={12} />
            <SkeletonLoader width="90%" height={16} style={{ marginTop: 12 }} />
            <SkeletonLoader width="60%" height={14} style={{ marginTop: 8 }} />
            <View style={styles.productFooter}>
                <SkeletonLoader width={80} height={20} />
                <SkeletonLoader width={40} height={40} borderRadius={20} />
            </View>
        </View>
    );
};

// List Skeleton
export const ListSkeleton: React.FC<{ count?: number }> = ({ count = 5 }) => {
    return (
        <View style={styles.listContainer}>
            {Array.from({ length: count }).map((_, index) => (
                <JobCardSkeleton key={index} />
            ))}
        </View>
    );
};

// Profile Skeleton
export const ProfileSkeleton: React.FC = () => {
    const colorScheme = useColorScheme();
    const theme = colorScheme ?? 'light';
    const colors = Colors[theme];

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Profile Header */}
            <View style={styles.profileHeader}>
                <SkeletonLoader width={100} height={100} borderRadius={50} />
                <SkeletonLoader width={150} height={24} style={{ marginTop: 16 }} />
                <SkeletonLoader width={200} height={16} style={{ marginTop: 8 }} />
            </View>

            {/* Profile Stats */}
            <View style={styles.statsRow}>
                <SkeletonLoader width="30%" height={60} borderRadius={12} />
                <SkeletonLoader width="30%" height={60} borderRadius={12} />
                <SkeletonLoader width="30%" height={60} borderRadius={12} />
            </View>

            {/* Settings List */}
            {[1, 2, 3, 4, 5].map((item) => (
                <View key={item} style={styles.settingsItem}>
                    <View style={styles.settingsItemLeft}>
                        <SkeletonLoader width={40} height={40} borderRadius={20} />
                        <View style={{ marginLeft: 12 }}>
                            <SkeletonLoader width={120} height={16} />
                            <SkeletonLoader width={180} height={12} style={{ marginTop: 6 }} />
                        </View>
                    </View>
                    <SkeletonLoader width={24} height={24} borderRadius={12} />
                </View>
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
    },
    listItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    listItemContent: {
        flex: 1,
        marginLeft: 12,
    },
    card: {
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        marginBottom: 12,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 16,
    },
    productCard: {
        padding: 12,
        borderRadius: 16,
        borderWidth: 1,
        width: 160,
        marginRight: 12,
    },
    productFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 12,
    },
    listContainer: {
        padding: 20,
    },
    profileHeader: {
        alignItems: 'center',
        marginBottom: 32,
    },
    settingsItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
    },
    settingsItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
});
