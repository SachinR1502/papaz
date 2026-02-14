import { Colors } from '@/constants/theme';
import { useLanguage } from '@/context/LanguageContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getMediaUrl } from '@/utils/mediaHelpers';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React from 'react';
import { ActivityIndicator, Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');

interface MediaCaptureSectionProps {
    photos: string[];
    voiceNote: string | null;
    isRecording: boolean;
    recordingDuration: number;
    onPickImage: () => void;
    onTakePhoto: () => void;
    onRemovePhoto: (index: number) => void;
    onStartRecording: () => void;
    onStopRecording: () => void;
    onRemoveVoiceNote: () => void;
    onViewPhoto?: (photo: string) => void;
    readOnly?: boolean;
}

// Add AudioPlayer import at top level if not already present
import { AudioPlayer } from '@/components/ui/AudioPlayer';

export const MediaCaptureSection: React.FC<MediaCaptureSectionProps> = ({
    photos,
    voiceNote,
    isRecording,
    recordingDuration,
    onPickImage,
    onTakePhoto,
    onRemovePhoto,
    onStartRecording,
    onStopRecording,
    onRemoveVoiceNote,
    onViewPhoto,
    readOnly = false
}) => {
    const { t } = useLanguage();
    const colorScheme = useColorScheme();
    const theme = colorScheme ?? 'light';
    const colors = Colors[theme];
    const isDark = theme === 'dark';

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <View style={styles.container}>
            {/* Photos Section */}
            <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('photos')}</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.photoScroll}>
                    {/* Add Photo Buttons */}
                    {!readOnly && (
                        <>
                            <TouchableOpacity
                                style={[styles.addPhotoButton, { backgroundColor: isDark ? colors.background : '#F5F5F5', borderColor: colors.border }]}
                                onPress={onTakePhoto}
                            >
                                <Ionicons name="camera" size={24} color={colors.primary} />
                                <Text style={[styles.addPhotoText, { color: colors.icon }]}>{t('camera')}</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.addPhotoButton, { backgroundColor: isDark ? colors.background : '#F5F5F5', borderColor: colors.border }]}
                                onPress={onPickImage}
                            >
                                <Ionicons name="images" size={24} color={colors.primary} />
                                <Text style={[styles.addPhotoText, { color: colors.icon }]}>{t('gallery')}</Text>
                            </TouchableOpacity>
                        </>
                    )}

                    {/* Photo Previews */}
                    {photos.map((photo, index) => (
                        <View key={index} style={styles.photoContainer}>
                            <TouchableOpacity onPress={() => onViewPhoto && onViewPhoto(photo)}>
                                <Image source={{ uri: getMediaUrl(photo) || '' }} style={styles.photoPreview} contentFit="cover" />
                            </TouchableOpacity>
                            {!readOnly && (
                                <TouchableOpacity
                                    style={[styles.removePhotoButton, { backgroundColor: colors.notification }]}
                                    onPress={() => onRemovePhoto(index)}
                                >
                                    <Ionicons name="close" size={16} color="#FFF" />
                                </TouchableOpacity>
                            )}
                        </View>
                    ))}
                </ScrollView>
            </View>

            {/* Voice Note Section */}
            <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('voice_note')}</Text>
                {voiceNote ? (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                        <View style={{ flex: 1 }}>
                            <AudioPlayer uri={voiceNote} style={{ backgroundColor: isDark ? colors.background : '#F5F5F5' }} />
                        </View>
                        {!readOnly && (
                            <TouchableOpacity
                                style={[styles.removeVoiceButton, { backgroundColor: colors.notification + '15', height: 56, width: 44 }]}
                                onPress={onRemoveVoiceNote}
                            >
                                <Ionicons name="trash-outline" size={20} color={colors.notification} />
                            </TouchableOpacity>
                        )}
                    </View>
                ) : (
                    !readOnly && (
                        <TouchableOpacity
                            style={[
                                styles.recordButton,
                                {
                                    backgroundColor: isRecording ? colors.notification : colors.primary,
                                }
                            ]}
                            onPress={isRecording ? onStopRecording : onStartRecording}
                        >
                            {isRecording ? (
                                <>
                                    <View style={styles.recordingIndicator}>
                                        <ActivityIndicator size="small" color="#FFF" />
                                    </View>
                                    <Text style={styles.recordButtonText}>
                                        {t('stop_recording')} ({formatDuration(recordingDuration)})
                                    </Text>
                                </>
                            ) : (
                                <>
                                    <MaterialCommunityIcons name="microphone" size={20} color="#FFF" />
                                    <Text style={styles.recordButtonText}>{t('record_voice_note')}</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    )
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        gap: 20,
    },
    section: {
        gap: 12,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        fontFamily: 'NotoSans-SemiBold',
    },
    photoScroll: {
        flexDirection: 'row',
    },
    addPhotoButton: {
        width: 100,
        height: 100,
        borderRadius: 16,
        borderWidth: 2,
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
        gap: 6,
    },
    addPhotoText: {
        fontSize: 12,
        fontFamily: 'NotoSans-Regular',
    },
    photoContainer: {
        position: 'relative',
        marginRight: 12,
    },
    photoPreview: {
        width: 100,
        height: 100,
        borderRadius: 16,
    },
    removePhotoButton: {
        position: 'absolute',
        top: -6,
        right: -6,
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    voiceNoteCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
        gap: 12,
    },
    voiceIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    voiceNoteInfo: {
        flex: 1,
    },
    voiceNoteTitle: {
        fontSize: 15,
        fontWeight: '600',
        fontFamily: 'NotoSans-SemiBold',
        marginBottom: 2,
    },
    voiceNoteSubtitle: {
        fontSize: 13,
        fontFamily: 'NotoSans-Regular',
    },
    removeVoiceButton: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    recordButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 16,
        gap: 8,
    },
    recordingIndicator: {
        marginRight: 4,
    },
    recordButtonText: {
        color: '#FFF',
        fontSize: 15,
        fontWeight: '600',
        fontFamily: 'NotoSans-SemiBold',
    },
});
