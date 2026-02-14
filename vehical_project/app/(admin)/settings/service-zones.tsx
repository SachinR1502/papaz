import { Colors } from '@/constants/theme';
import { useAdmin } from '@/context/AdminContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ServiceZones() {
    const { getServiceZones, updateServiceZones } = useAdmin();
    const router = useRouter();
    const colorScheme = useColorScheme();
    const theme = colorScheme ?? 'light';
    const colors = Colors[theme];
    const isDark = theme === 'dark';

    const [zones, setZones] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [newZoneName, setNewZoneName] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        loadZones();
    }, []);

    const loadZones = async () => {
        setIsLoading(true);
        const data = await getServiceZones();
        setZones(data);
        setIsLoading(false);
    };

    const handleAddZone = async () => {
        if (!newZoneName.trim()) return;
        const newZone = { name: newZoneName.trim(), active: true };
        const updatedZones = [...zones, newZone];
        setZones(updatedZones);
        setNewZoneName('');
        await saveZones(updatedZones);
    };

    const handleToggleZone = async (index: number) => {
        const updatedZones = [...zones];
        updatedZones[index].active = !updatedZones[index].active;
        setZones(updatedZones);
        await saveZones(updatedZones);
    };

    const handleDeleteZone = (index: number) => {
        Alert.alert(
            "Delete Zone",
            "Are you sure you want to remove this service zone?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        const updatedZones = zones.filter((_, i) => i !== index);
                        setZones(updatedZones);
                        await saveZones(updatedZones);
                    }
                }
            ]
        );
    };

    const saveZones = async (updatedZones: any[]) => {
        setIsSaving(true);
        await updateServiceZones(updatedZones);
        setIsSaving(false);
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <View>
                    <Text style={[styles.title, { color: colors.text }]}>Service Zones</Text>
                    <Text style={[styles.subtitle, { color: colors.icon }]}>Manage operational geographic areas</Text>
                </View>
            </View>

            <View style={styles.inputSection}>
                <View style={[styles.inputWrapper, { backgroundColor: colors.card }]}>
                    <TextInput
                        style={[styles.input, { color: colors.text }]}
                        placeholder="Enter City or Area Name..."
                        placeholderTextColor={colors.icon}
                        value={newZoneName}
                        onChangeText={setNewZoneName}
                    />
                    <TouchableOpacity
                        style={[styles.addBtn, { backgroundColor: colors.primary }]}
                        onPress={handleAddZone}
                        disabled={!newZoneName.trim() || isSaving}
                    >
                        {isSaving ? (
                            <ActivityIndicator size="small" color="#FFF" />
                        ) : (
                            <Ionicons name="add" size={24} color="#FFF" />
                        )}
                    </TouchableOpacity>
                </View>
            </View>

            {isLoading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            ) : (
                <FlatList
                    data={zones}
                    keyExtractor={(_, index) => index.toString()}
                    contentContainerStyle={styles.list}
                    renderItem={({ item, index }) => (
                        <View style={[styles.zoneCard, { backgroundColor: colors.card, shadowColor: colors.shadow }]}>
                            <View style={styles.zoneInfo}>
                                <Text style={[styles.zoneName, { color: colors.text }]}>{item.name}</Text>
                                <View style={[styles.statusBadge, { backgroundColor: item.active ? '#34C75915' : '#8E8E9315' }]}>
                                    <View style={[styles.statusDot, { backgroundColor: item.active ? '#34C759' : '#8E8E93' }]} />
                                    <Text style={[styles.statusText, { color: item.active ? '#34C759' : '#8E8E93' }]}>
                                        {item.active ? 'Operational' : 'Inactive'}
                                    </Text>
                                </View>
                            </View>
                            <View style={styles.zoneActions}>
                                <Switch
                                    value={item.active}
                                    onValueChange={() => handleToggleZone(index)}
                                    trackColor={{ true: '#34C759', false: '#CCC' }}
                                />
                                <TouchableOpacity onPress={() => handleDeleteZone(index)} style={styles.deleteBtn}>
                                    <Ionicons name="trash-outline" size={20} color="#FF3B30" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                    ListEmptyComponent={
                        <View style={styles.empty}>
                            <Ionicons name="map-outline" size={60} color={colors.icon} />
                            <Text style={[styles.emptyText, { color: colors.icon }]}>No service zones added yet.</Text>
                        </View>
                    }
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', padding: 20, gap: 16 },
    backBtn: { padding: 8, borderRadius: 12 },
    title: { fontSize: 24, fontWeight: '800' },
    subtitle: { fontSize: 13, marginTop: 2 },

    inputSection: { padding: 20 },
    inputWrapper: { flexDirection: 'row', alignItems: 'center', borderRadius: 16, padding: 8, gap: 12 },
    input: { flex: 1, height: 48, paddingHorizontal: 16, fontSize: 16 },
    addBtn: { width: 48, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },

    list: { padding: 20 },
    zoneCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderRadius: 16, marginBottom: 12, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
    zoneInfo: { flex: 1 },
    zoneName: { fontSize: 16, fontWeight: '700' },
    statusBadge: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, marginTop: 6, gap: 6 },
    statusDot: { width: 6, height: 6, borderRadius: 3 },
    statusText: { fontSize: 11, fontWeight: '700' },

    zoneActions: { flexDirection: 'row', alignItems: 'center', gap: 16 },
    deleteBtn: { padding: 8 },

    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    empty: { alignItems: 'center', marginTop: 100, gap: 20 },
    emptyText: { fontSize: 15, opacity: 0.6 },
});
