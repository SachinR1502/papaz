import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { Tabs } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const CustomTabBar = ({ state, descriptors, navigation }: any) => {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const insets = useSafeAreaInsets();

    // Animate tab items on mount
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
        }).start();
    }, []);

    const colors = {
        background: isDark ? 'rgba(28, 28, 30, 0.85)' : 'rgba(255, 255, 255, 0.85)',
        active: isDark ? '#FFF' : '#000',
        inactive: isDark ? '#8E8E93' : '#AEAEB2',
        activeBg: isDark ? '#3A3A3C' : '#F2F2F7',
    };

    return (
        <View style={[styles.tabContainer, { bottom: insets.bottom > 0 ? insets.bottom + 10 : 20 }]}>
            <BlurView
                intensity={Platform.OS === 'ios' ? 80 : 0}
                tint={isDark ? 'dark' : 'light'}
                style={[styles.blurContainer, { backgroundColor: Platform.OS === 'android' ? colors.background : undefined }]}
            >
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
                            navigation.navigate(route.name, route.params);
                            Haptics.selectionAsync();
                        }
                    };

                    let iconName: any;
                    if (route.name === 'index') iconName = isFocused ? 'grid' : 'grid-outline';
                    else if (route.name === 'jobs') iconName = isFocused ? 'briefcase' : 'briefcase-outline';
                    else if (route.name === 'store') iconName = isFocused ? 'cart' : 'cart-outline';
                    else if (route.name === 'profile') iconName = isFocused ? 'person' : 'person-outline';

                    // Individual Tab Animation
                    const scaleAnim = useRef(new Animated.Value(1)).current;

                    useEffect(() => {
                        Animated.spring(scaleAnim, {
                            toValue: isFocused ? 1.15 : 1,
                            useNativeDriver: true,
                            friction: 5
                        }).start();
                    }, [isFocused]);

                    return (
                        <TouchableOpacity
                            key={index}
                            accessibilityRole="button"
                            accessibilityState={isFocused ? { selected: true } : {}}
                            accessibilityLabel={options.tabBarAccessibilityLabel}
                            testID={options.tabBarTestID}
                            onPress={onPress}
                            style={styles.tabItem}
                        >
                            <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                                <Ionicons
                                    name={iconName}
                                    size={24}
                                    color={isFocused ? colors.active : colors.inactive}
                                />
                            </Animated.View>
                            {isFocused && (
                                <Animated.View
                                    style={[styles.activeDot, { backgroundColor: colors.active, opacity: fadeAnim }]}
                                />
                            )}
                        </TouchableOpacity>
                    );
                })}
            </BlurView>
        </View>
    );
};

export default function TechnicianTabLayout() {
    return (
        <Tabs
            tabBar={props => <CustomTabBar {...props} />}
            screenOptions={{
                headerShown: false,
                tabBarHideOnKeyboard: true,
            }}
        >
            <Tabs.Screen name="index" options={{ title: 'Home' }} />
            <Tabs.Screen name="jobs" options={{ title: 'Jobs' }} />
            <Tabs.Screen name="store" options={{ title: 'Store' }} />
            <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
        </Tabs>
    );
}

const styles = StyleSheet.create({
    tabContainer: {
        position: 'absolute',
        left: 20,
        right: 20,
        borderRadius: 35,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
        elevation: 10,
    },
    blurContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingVertical: 15,
        paddingHorizontal: 10,
    },
    tabItem: {
        alignItems: 'center',
        justifyContent: 'center',
        height: 50,
        width: 50,
    },
    activeDot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        marginTop: 6,
        position: 'absolute',
        bottom: 5
    }
});
