import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import React, { ReactNode, useState } from 'react';
import { RefreshControl, ScrollView, ScrollViewProps, StyleSheet } from 'react-native';

interface PullToRefreshProps extends Omit<ScrollViewProps, 'refreshControl'> {
    onRefresh: () => Promise<void>;
    children: ReactNode;
}

export const PullToRefresh: React.FC<PullToRefreshProps> = ({ onRefresh, children, ...scrollViewProps }) => {
    const [refreshing, setRefreshing] = useState(false);
    const colorScheme = useColorScheme();
    const theme = colorScheme ?? 'light';
    const colors = Colors[theme];

    const handleRefresh = async () => {
        setRefreshing(true);
        try {
            await onRefresh();
        } catch (error) {
            console.error('Refresh error:', error);
        } finally {
            setRefreshing(false);
        }
    };

    return (
        <ScrollView
            {...scrollViewProps}
            refreshControl={
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={handleRefresh}
                    tintColor={colors.primary}
                    colors={[colors.primary]}
                    progressBackgroundColor={colors.card}
                />
            }
        >
            {children}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    // Add any additional styles if needed
});
