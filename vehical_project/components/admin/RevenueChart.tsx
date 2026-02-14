import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface RevenueChartProps {
    data: { label: string; value: number }[];
    maxVal: number;
}

export const RevenueChart = ({ data, maxVal }: RevenueChartProps) => {
    const colorScheme = useColorScheme();
    const theme = colorScheme ?? 'light';
    const colors = Colors[theme];

    return (
        <View style={[styles.chartContainer, { backgroundColor: colors.card }]}>
            <View style={[styles.chartBars, { justifyContent: data.length > 10 ? 'center' : 'space-between' }]}>
                {data.map((d, i) => (
                    <View key={i} style={[styles.barWrapper, { gap: data.length > 20 ? 4 : 8 }]}>
                        <View
                            style={[
                                styles.bar,
                                {
                                    height: `${(d.value / maxVal) * 100}%`,
                                    minHeight: 4,
                                    width: data.length > 20 ? 6 : data.length > 10 ? 15 : 30
                                }
                            ]}
                        />
                        {d.label ? (
                            <Text style={[styles.barLabel, { color: colors.icon, fontSize: data.length > 20 ? 10 : 12 }]}>
                                {d.label}
                            </Text>
                        ) : null}
                    </View>
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    chartContainer: { borderRadius: 20, padding: 20, height: 200, justifyContent: 'center' },
    chartBars: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 150, paddingHorizontal: 10 },
    barWrapper: { alignItems: 'center', gap: 8 },
    bar: { width: 30, backgroundColor: '#AF52DE', borderRadius: 6, opacity: 0.8 },
    barLabel: { fontSize: 12, fontWeight: '600' },
});
