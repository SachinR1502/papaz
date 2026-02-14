import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
        };
    }

    static getDerivedStateFromError(error: Error): Partial<State> {
        return {
            hasError: true,
            error,
        };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        // Log error to error reporting service
        console.error('ErrorBoundary caught an error:', error, errorInfo);

        this.setState({
            error,
            errorInfo,
        });

        // TODO: Send to error tracking service (e.g., Sentry)
        // logErrorToService(error, errorInfo);
    }

    handleReset = () => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null,
        });
    };

    handleGoHome = () => {
        this.handleReset();
        router.replace('/');
    };

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return <ErrorScreen error={this.state.error} onReset={this.handleReset} onGoHome={this.handleGoHome} />;
        }

        return this.props.children;
    }
}

interface ErrorScreenProps {
    error: Error | null;
    onReset: () => void;
    onGoHome: () => void;
}

const ErrorScreen: React.FC<ErrorScreenProps> = ({ error, onReset, onGoHome }) => {
    const colorScheme = useColorScheme();
    const theme = colorScheme ?? 'light';
    const colors = Colors[theme];

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.iconContainer, { backgroundColor: colors.notification + '15' }]}>
                <Ionicons name="alert-circle" size={64} color={colors.notification} />
            </View>

            <Text style={[styles.title, { color: colors.text }]}>Oops! Something went wrong</Text>
            <Text style={[styles.description, { color: colors.icon }]}>
                We're sorry for the inconvenience. The app encountered an unexpected error.
            </Text>

            {__DEV__ && error && (
                <View style={[styles.errorDetails, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <Text style={[styles.errorTitle, { color: colors.notification }]}>Error Details:</Text>
                    <Text style={[styles.errorMessage, { color: colors.text }]}>{error.message}</Text>
                    {error.stack && (
                        <Text style={[styles.errorStack, { color: colors.icon }]} numberOfLines={5}>
                            {error.stack}
                        </Text>
                    )}
                </View>
            )}

            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={[styles.button, styles.primaryButton, { backgroundColor: colors.primary }]}
                    onPress={onReset}
                >
                    <Ionicons name="refresh" size={20} color="#FFFFFF" />
                    <Text style={styles.primaryButtonText}>Try Again</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.button, styles.secondaryButton, { borderColor: colors.border }]}
                    onPress={onGoHome}
                >
                    <Ionicons name="home-outline" size={20} color={colors.primary} />
                    <Text style={[styles.secondaryButtonText, { color: colors.primary }]}>Go Home</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    iconContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        fontFamily: 'NotoSans-Bold',
        marginBottom: 12,
        textAlign: 'center',
    },
    description: {
        fontSize: 15,
        fontFamily: 'NotoSans-Regular',
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 24,
        paddingHorizontal: 16,
    },
    errorDetails: {
        width: '100%',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        marginBottom: 24,
        maxHeight: 200,
    },
    errorTitle: {
        fontSize: 14,
        fontWeight: '600',
        fontFamily: 'NotoSans-SemiBold',
        marginBottom: 8,
    },
    errorMessage: {
        fontSize: 13,
        fontFamily: 'NotoSans-Regular',
        marginBottom: 8,
    },
    errorStack: {
        fontSize: 11,
        fontFamily: 'NotoSans-Regular',
        lineHeight: 16,
    },
    buttonContainer: {
        width: '100%',
        gap: 12,
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: 12,
        gap: 8,
    },
    primaryButton: {
        // backgroundColor set dynamically
    },
    primaryButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
        fontFamily: 'NotoSans-SemiBold',
    },
    secondaryButton: {
        backgroundColor: 'transparent',
        borderWidth: 2,
    },
    secondaryButtonText: {
        fontSize: 16,
        fontWeight: '600',
        fontFamily: 'NotoSans-SemiBold',
    },
});
