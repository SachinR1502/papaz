/**
 * Sound Notification Service
 * Plays notification sounds for different events
 */

import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';

// Sound types
export enum NotificationSound {
    NEW_BROADCAST = 'new_broadcast',
    DIRECT_ASSIGNMENT = 'direct_assignment',
    JOB_UPDATE = 'job_update',
    PAYMENT_RECEIVED = 'payment_received',
    MESSAGE = 'message',
    GENERAL = 'general',
}

// Sound file mappings (you'll need to add these files to assets/sounds/)
const SOUND_FILES = {
    [NotificationSound.NEW_BROADCAST]: require('@/assets/sounds/broadcast.mp3'),
    [NotificationSound.DIRECT_ASSIGNMENT]: require('@/assets/sounds/assignment.mp3'),
    [NotificationSound.JOB_UPDATE]: require('@/assets/sounds/update.mp3'),
    [NotificationSound.PAYMENT_RECEIVED]: require('@/assets/sounds/payment.mp3'),
    [NotificationSound.MESSAGE]: require('@/assets/sounds/message.mp3'),
    [NotificationSound.GENERAL]: require('@/assets/sounds/notification.wav'),
};

class SoundNotificationService {
    private soundObjects: Map<string, Audio.Sound> = new Map();
    private isEnabled: boolean = true;
    private volume: number = 1.0;

    /**
     * Initialize audio mode
     */
    async initialize() {
        try {
            await Audio.setAudioModeAsync({
                allowsRecordingIOS: false,
                playsInSilentModeIOS: true,
                staysActiveInBackground: false,
                shouldDuckAndroid: true,
            });
            console.log('[SoundNotification] Audio mode initialized');
        } catch (error) {
            console.error('[SoundNotification] Failed to initialize audio:', error);
        }
    }

    /**
     * Load a sound file
     */
    private async loadSound(soundType: NotificationSound): Promise<Audio.Sound | null> {
        try {
            // Check if already loaded
            if (this.soundObjects.has(soundType)) {
                return this.soundObjects.get(soundType)!;
            }

            // Load new sound
            const soundFile = SOUND_FILES[soundType];
            if (!soundFile) {
                console.warn(`[SoundNotification] Sound file not found for: ${soundType}`);
                return null;
            }

            const { sound } = await Audio.Sound.createAsync(soundFile, {
                volume: this.volume,
                shouldPlay: false,
            });

            this.soundObjects.set(soundType, sound);
            return sound;
        } catch (error) {
            console.error(`[SoundNotification] Failed to load sound ${soundType}:`, error);
            return null;
        }
    }

    /**
     * Play notification sound
     */
    async playSound(soundType: NotificationSound, withHaptic: boolean = true) {
        if (!this.isEnabled) {
            console.log('[SoundNotification] Sounds are disabled');
            return;
        }

        try {
            // Play haptic feedback first
            if (withHaptic) {
                await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }

            // Load and play sound
            const sound = await this.loadSound(soundType);
            if (sound) {
                await sound.setPositionAsync(0); // Reset to start
                await sound.playAsync();
                console.log(`[SoundNotification] Playing sound: ${soundType}`);
            }
        } catch (error) {
            console.error(`[SoundNotification] Failed to play sound ${soundType}:`, error);
        }
    }

    /**
     * Play sound for new broadcast job
     */
    async playNewBroadcast() {
        await this.playSound(NotificationSound.NEW_BROADCAST, true);
    }

    /**
     * Play sound for direct assignment
     */
    async playDirectAssignment() {
        await this.playSound(NotificationSound.DIRECT_ASSIGNMENT, true);
    }

    /**
     * Play sound for job update
     */
    async playJobUpdate() {
        await this.playSound(NotificationSound.JOB_UPDATE, false);
    }

    /**
     * Play sound for payment received
     */
    async playPaymentReceived() {
        await this.playSound(NotificationSound.PAYMENT_RECEIVED, true);
    }

    /**
     * Play sound for new message
     */
    async playMessage() {
        await this.playSound(NotificationSound.MESSAGE, false);
    }

    /**
     * Play general notification sound
     */
    async playGeneral() {
        await this.playSound(NotificationSound.GENERAL, false);
    }

    /**
     * Enable/disable sounds
     */
    setEnabled(enabled: boolean) {
        this.isEnabled = enabled;
        console.log(`[SoundNotification] Sounds ${enabled ? 'enabled' : 'disabled'}`);
    }

    /**
     * Set volume (0.0 to 1.0)
     */
    async setVolume(volume: number) {
        this.volume = Math.max(0, Math.min(1, volume));

        // Update volume for all loaded sounds
        for (const [type, sound] of this.soundObjects) {
            try {
                await sound.setVolumeAsync(this.volume);
            } catch (error) {
                console.error(`[SoundNotification] Failed to set volume for ${type}:`, error);
            }
        }

        console.log(`[SoundNotification] Volume set to: ${this.volume}`);
    }

    /**
     * Unload all sounds
     */
    async cleanup() {
        for (const [type, sound] of this.soundObjects) {
            try {
                await sound.unloadAsync();
                console.log(`[SoundNotification] Unloaded sound: ${type}`);
            } catch (error) {
                console.error(`[SoundNotification] Failed to unload ${type}:`, error);
            }
        }
        this.soundObjects.clear();
    }

    /**
     * Get current settings
     */
    getSettings() {
        return {
            enabled: this.isEnabled,
            volume: this.volume,
            loadedSounds: Array.from(this.soundObjects.keys()),
        };
    }
}

// Singleton instance
export const soundNotificationService = new SoundNotificationService();

// Initialize on import
soundNotificationService.initialize();
