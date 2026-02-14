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
    const isDark = colorScheme === 'dark';
    const insets = useSafeAreaInsets();
    const theme = colorScheme ?? 'light';

    const colors = {
        background: isDark ? '#1C1C1E' : '#FFFFFF',
        active: Colors[theme].primary, // Use theme primary (Saffron)
        inactive: isDark ? '#8E8E93' : '#8E8E93',
        shadow: isDark ? '#000000' : '#000000',
        slidingIndicator: isDark ? '#2C2C2E' : '#F2F2F7',
    };

    const tabWidth = TAB_BAR_WIDTH / state.routes.length;
    const translateX = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.spring(translateX, {
            toValue: state.index * tabWidth,
            useNativeDriver: true,
            damping: 15,
            mass: 1,
            stiffness: 120,
        }).start();
    }, [state.index]);

    return (
        <View style={[styles.tabBarContainer, {
            backgroundColor: colors.background,
            shadowColor: colors.shadow,
            shadowOpacity: isDark ? 0.3 : 0.1,
            bottom: insets.bottom > 0 ? insets.bottom + 10 : 20, // Add more padding for non-Home Indicator devices
        }]}>
            {/* Sliding Indicator */}
            <Animated.View style={[
                styles.slidingIndicator,
                {
                    width: tabWidth,
                    transform: [{ translateX }],
                }
            ]}>
                <View style={[styles.innerIndicator, { backgroundColor: colors.slidingIndicator }]} />
            </Animated.View>

            {state.routes.map((route: any, index: number) => {
                const { options } = descriptors[route.key];
                const isFocused = state.index === index;

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
                if (route.name === 'dashboard') iconName = isFocused ? 'grid' : 'grid-outline';
                else if (route.name === 'inventory') iconName = isFocused ? 'cube' : 'cube-outline';
                else if (route.name === 'orders') iconName = isFocused ? 'reader' : 'reader-outline';
                else if (route.name === 'profile') iconName = isFocused ? 'person' : 'person-outline';

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

export default function SupplierTabs() {
    return (
        <Tabs
            tabBar={props => <CustomTabBar {...props} />}
            screenOptions={{
                headerShown: false,
            }}
        >
            <Tabs.Screen name="dashboard" options={{ title: 'Dashboard' }} />
            <Tabs.Screen name="inventory" options={{ title: 'Inventory' }} />
            <Tabs.Screen name="orders" options={{ title: 'Orders' }} />
            <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
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
