import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Tabs } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const TAB_MARGIN = 20;
const TAB_BAR_WIDTH = SCREEN_WIDTH - (TAB_MARGIN * 2);

const CustomTabBar = ({ state, descriptors, navigation }: any) => {
    const colorScheme = useColorScheme();
    const theme = colorScheme ?? 'light';
    const themeColors = Colors[theme];
    const isDark = theme === 'dark';
    const insets = useSafeAreaInsets();

    const colors = {
        background: themeColors.card,
        active: themeColors.revenue, // Purple for Admin
        inactive: themeColors.icon,
        shadow: themeColors.shadow,
        slidingIndicator: isDark ? themeColors.border : themeColors.background,
    };

    // Filter out hidden routes (reports)
    const visibleRoutes = state.routes.filter((route: any) => {
        const { options } = descriptors[route.key];
        return options.href !== null && route.name !== 'reports';
    });

    const tabWidth = TAB_BAR_WIDTH / visibleRoutes.length;
    const translateX = useRef(new Animated.Value(0)).current;

    // Find the index of the active tab within the visible routes
    const activeRouteIndex = visibleRoutes.findIndex(
        (r: any) => r.key === state.routes[state.index].key
    );

    useEffect(() => {
        if (activeRouteIndex !== -1) {
            Animated.spring(translateX, {
                toValue: activeRouteIndex * tabWidth,
                useNativeDriver: true,
                damping: 15,
                mass: 1,
                stiffness: 120,
            }).start();
        }
    }, [activeRouteIndex, tabWidth]); // Dependency on activeRouteIndex

    if (activeRouteIndex === -1 && state.routes[state.index].name === 'reports') {
        // Hide tab bar if on a hidden screen? Or just show empty?
        // Usually we keep the tab bar visible showing the last active tab or no active tab.
        // For simplicity, if we are on a non-visible tab, we might not render the indicator or selection.
        // But for this specific app, let's render the bar.
    }

    return (
        <View style={[styles.tabBarContainer, {
            backgroundColor: colors.background,
            shadowColor: colors.shadow,
            shadowOpacity: isDark ? 0.3 : 0.1,
            bottom: insets.bottom > 0 ? insets.bottom + 10 : 20,
        }]}>
            {/* Sliding Indicator */}
            {activeRouteIndex !== -1 && (
                <Animated.View style={[
                    styles.slidingIndicator,
                    {
                        width: tabWidth,
                        transform: [{ translateX }],
                    }
                ]}>
                    <View style={[styles.innerIndicator, { backgroundColor: colors.slidingIndicator }]} />
                </Animated.View>
            )}

            {visibleRoutes.map((route: any, index: number) => {
                const { options } = descriptors[route.key];
                const isFocused = state.routes[state.index].key === route.key;

                const onPress = () => {
                    const event = navigation.emit({
                        type: 'tabPress',
                        target: route.key,
                        canPreventDefault: true,
                    });

                    if (!isFocused && !event.defaultPrevented) {
                        navigation.navigate(route.name);
                        Haptics.selectionAsync();
                    }
                };

                let iconName: any;
                if (route.name === 'index') iconName = isFocused ? 'grid' : 'grid-outline';
                else if (route.name === 'approvals') iconName = isFocused ? 'people' : 'people-outline';
                else if (route.name === 'jobs') iconName = isFocused ? 'pulse' : 'pulse-outline';
                else if (route.name === 'settings') iconName = isFocused ? 'settings' : 'settings-outline';

                return (
                    <TouchableOpacity
                        key={index}
                        accessibilityRole="button"
                        accessibilityState={isFocused ? { selected: true } : {}}
                        accessibilityLabel={options.tabBarAccessibilityLabel}
                        testID={options.tabBarTestID}
                        onPress={onPress}
                        style={[styles.tabItem, { width: tabWidth }]}
                    >
                        <Animated.View style={[
                            styles.iconWrapper,
                            isFocused && { transform: [{ scale: 1.1 }] } // Simple scale for active
                        ]}>
                            <Ionicons
                                name={iconName}
                                size={24}
                                color={isFocused ? colors.active : colors.inactive}
                            />
                            {isFocused && (
                                <View style={[styles.dot, { backgroundColor: colors.active }]} />
                            )}
                        </Animated.View>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
};

export default function AdminTabsLayout() {
    return (
        <Tabs
            tabBar={props => <CustomTabBar {...props} />}
            screenOptions={{
                headerShown: false,
            }}
        >
            <Tabs.Screen name="index" options={{ title: 'Home' }} />
            <Tabs.Screen name="approvals" options={{ title: 'Users' }} />
            <Tabs.Screen name="jobs" />
            <Tabs.Screen name="settings" />
            <Tabs.Screen name="reports" options={{ href: null }} />
        </Tabs>
    );
}

const styles = StyleSheet.create({
    tabBarContainer: {
        position: 'absolute',
        left: TAB_MARGIN,
        right: TAB_MARGIN,
        height: 70,
        borderRadius: 25,
        flexDirection: 'row',
        alignItems: 'center',
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 10,
        elevation: 5,
    },
    slidingIndicator: {
        position: 'absolute',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 0,
    },
    innerIndicator: {
        width: '80%',
        height: '80%',
        borderRadius: 20,
    },
    tabItem: {
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1,
    },
    iconWrapper: {
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4
    },
    dot: {
        width: 4,
        height: 4,
        borderRadius: 2,
    }
});
