import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

export async function registerForPushNotificationsAsync() {
    // Expo Go does not support remote push notifications in SDK 53+
    if (Constants.appOwnership === 'expo') {
        console.log('Skipping Push Notification registration in Expo Go');
        return;
    }
    let token;

    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF9500',
        });
    }

    if (Device.isDevice) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }
        if (finalStatus !== 'granted') {
            console.log('Failed to get push token for push notification!');
            return;
        }
        try {
            // You might need projectId here if using EAS
            token = (await Notifications.getExpoPushTokenAsync()).data;
            console.log('Push Token:', token);
        } catch (e) {
            console.log('Error fetching token', e);
        }
    } else {
        console.log('Must use physical device for Push Notifications');
    }

    return token;
}
