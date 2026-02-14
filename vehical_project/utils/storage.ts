import AsyncStorage from '@react-native-async-storage/async-storage';

export const STORAGE_KEYS = {
    JOBS: 'app_data_jobs',
    INVENTORY: 'app_data_inventory',
    USERS: 'app_data_users',
    SETTINGS: 'app_data_settings',
    ORDERS: 'app_data_orders',
    VEHICLES: 'app_data_vehicles',
    WHOLESALE_ORDERS: 'app_data_wholesale_orders',
    CHAT_CONVERSATIONS: 'app_data_conversations'
};

export class StorageHelper {
    static async get<T>(key: string, defaultValue: T): Promise<T> {
        try {
            const json = await AsyncStorage.getItem(key);
            if (!json) {
                if (defaultValue !== undefined) {
                    await AsyncStorage.setItem(key, JSON.stringify(defaultValue));
                }
                return defaultValue;
            }
            return JSON.parse(json);
        } catch (e) {
            console.error(`Error reading ${key}`, e);
            return defaultValue;
        }
    }

    static async set(key: string, data: any): Promise<void> {
        try {
            await AsyncStorage.setItem(key, JSON.stringify(data));
        } catch (e) {
            console.error(`Error writing ${key}`, e);
        }
    }

    static async update<T>(key: string, updateFn: (current: T) => T, defaultValue: T): Promise<void> {
        const current = await this.get(key, defaultValue);
        const updated = updateFn(current);
        await this.set(key, updated);
    }

    static async clear(key: string): Promise<void> {
        try {
            await AsyncStorage.removeItem(key);
        } catch (e) {
            console.error(`Error clearing ${key}`, e);
        }
    }
}
