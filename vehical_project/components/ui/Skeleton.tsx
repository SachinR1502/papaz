import { useColorScheme } from '@/hooks/use-color-scheme';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View, ViewStyle } from 'react-native';

interface SkeletonProps {
    width?: number | string;
    height?: number | string;
    borderRadius?: number;
    style?: ViewStyle;
}

export function Skeleton({ width, height, borderRadius = 8, style }: SkeletonProps) {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const opacity = useRef(new Animated.Value(0.3)).current;

    useEffect(() => {
        const animation = Animated.loop(
            Animated.sequence([
                Animated.timing(opacity, {
                    toValue: 0.7,
                    duration: 800,
                    useNativeDriver: true,
                }),
                Animated.timing(opacity, {
                    toValue: 0.3,
                    duration: 800,
                    useNativeDriver: true,
                }),
            ])
        );

        animation.start();
        return () => animation.stop();
    }, []);

    const backgroundColor = isDark ? '#2C2C2E' : '#E5E5EA';

    return (
        <Animated.View
            style={[
                {
                    width: width as any,
                    height: height as any,
                    borderRadius,
                    backgroundColor,
                    opacity,
                },
                style,
            ]}
        />
    );
}

export function DashboardSkeleton() {
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View>
                    <Skeleton width={120} height={20} borderRadius={4} style={{ marginBottom: 8 }} />
                    <Skeleton width={180} height={24} borderRadius={4} />
                </View>
                <Skeleton width={44} height={44} borderRadius={22} />
            </View>

            <Skeleton width="100%" height={160} borderRadius={24} style={{ marginBottom: 25 }} />

            <View style={styles.grid}>
                <Skeleton width="48%" height={120} borderRadius={20} />
                <Skeleton width="48%" height={120} borderRadius={20} />
                <Skeleton width="48%" height={120} borderRadius={20} />
                <Skeleton width="48%" height={120} borderRadius={20} />
            </View>

            <Skeleton width={150} height={24} borderRadius={4} style={{ marginVertical: 20 }} />
            <Skeleton width="100%" height={100} borderRadius={20} style={{ marginBottom: 15 }} />
            <Skeleton width="100%" height={100} borderRadius={20} style={{ marginBottom: 15 }} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 30,
        marginTop: 20,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 15,
        marginBottom: 20,
    }
});
