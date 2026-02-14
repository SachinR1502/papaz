import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';

const { width } = Dimensions.get('window');

export type StepStatus = 'pending' | 'active' | 'complete';

interface Step {
    id: string;
    label: string;
    icon: string;
    iconType: 'Ionicons' | 'MaterialCommunityIcons';
}

interface StatusStepperProps {
    currentStatus: string;
}

const STEPS: Step[] = [
    { id: 'accepted', label: 'Confirmed', icon: 'check-circle-outline', iconType: 'MaterialCommunityIcons' },
    { id: 'arrived', label: 'Arrived', icon: 'map-marker-outline', iconType: 'MaterialCommunityIcons' },
    { id: 'diagnosing', label: 'Inspection', icon: 'magnify', iconType: 'MaterialCommunityIcons' },
    { id: 'repairing', label: 'Repairing', icon: 'wrench-outline', iconType: 'MaterialCommunityIcons' },
    { id: 'completed', label: 'Ready', icon: 'flag-checkered', iconType: 'MaterialCommunityIcons' },
];

const getStepStatus = (stepId: string, currentStatus: string): StepStatus => {
    const statusPriority: Record<string, number> = {
        'pending': 0,
        'accepted': 1,
        'arrived': 2,
        'diagnosing': 3,
        'quote_pending': 3.5,
        'parts_required': 4,
        'parts_ordered': 4,
        'in_progress': 4.5,
        'quality_check': 5,
        'ready_for_delivery': 5.5,
        'billing_pending': 5.5,
        'vehicle_delivered': 5.8,
        'payment_pending_cash': 5.9,
        'completed': 6,
    };

    const stepPriority: Record<string, number> = {
        'accepted': 1,
        'arrived': 2,
        'diagnosing': 3,
        'repairing': 4.5,
        'completed': 6,
    };

    const currentP = statusPriority[currentStatus] || 0;
    const stepP = stepPriority[stepId];

    if (currentP > stepP) return 'complete';
    if (Math.floor(currentP) === Math.floor(stepP)) return 'active';
    return 'pending';
};

export function StatusStepper({ currentStatus }: StatusStepperProps) {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const colors = {
        primary: '#007AFF',
        success: '#34C759',
        border: isDark ? '#2C2C2E' : '#E5E5EA',
        text: isDark ? '#FFFFFF' : '#1A1A1A',
        subText: isDark ? '#A1A1A6' : '#8E8E93',
        card: isDark ? '#1C1C1E' : '#FFFFFF',
        inactive: isDark ? '#2C2C2E' : '#F2F2F7',
    };

    return (
        <View style={styles.container}>
            <View style={styles.stepsRow}>
                {STEPS.map((step, index) => {
                    const status = getStepStatus(step.id, currentStatus);
                    const isLast = index === STEPS.length - 1;

                    return (
                        <React.Fragment key={step.id}>
                            <View style={styles.stepWrapper}>
                                <View style={[
                                    styles.iconCircle,
                                    {
                                        backgroundColor: status === 'complete' ? colors.success :
                                            status === 'active' ? colors.primary : colors.inactive,
                                        borderColor: status === 'active' ? colors.primary : 'transparent'
                                    }
                                ]}>
                                    {step.iconType === 'Ionicons' ? (
                                        <Ionicons name={step.icon as any} size={20} color={status === 'pending' ? colors.subText : '#FFF'} />
                                    ) : (
                                        <MaterialCommunityIcons name={step.icon as any} size={20} color={status === 'pending' ? colors.subText : '#FFF'} />
                                    )}
                                </View>
                                <Text style={[
                                    styles.stepLabel,
                                    { color: status === 'pending' ? colors.subText : colors.text }
                                ]} numberOfLines={1}>
                                    {step.label}
                                </Text>
                            </View>
                            {!isLast && (
                                <View style={[
                                    styles.connector,
                                    { backgroundColor: status === 'complete' ? colors.success : colors.border }
                                ]} />
                            )}
                        </React.Fragment>
                    );
                })}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingVertical: 20,
        paddingHorizontal: 10,
        width: '100%',
    },
    stepsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    stepWrapper: {
        alignItems: 'center',
        zIndex: 2,
        width: (width - 60) / 5,
    },
    iconCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
    },
    stepLabel: {
        fontSize: 10,
        marginTop: 8,
        fontWeight: '600',
        fontFamily: 'NotoSans-SemiBold',
        textAlign: 'center',
    },
    connector: {
        flex: 1,
        height: 2,
        marginTop: -20, // Align with center of circle
        marginHorizontal: -10,
        zIndex: 1,
    }
});
