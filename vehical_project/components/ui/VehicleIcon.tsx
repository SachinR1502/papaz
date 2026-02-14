import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleProp, TextStyle, ViewStyle } from 'react-native';

interface VehicleIconProps {
    type?: string;
    make?: string;
    model?: string;
    size?: number;
    color?: string;
    style?: StyleProp<TextStyle>;
    containerStyle?: ViewStyle;
}

export function getVehicleIconName(type?: string, make?: string, model?: string): keyof typeof MaterialCommunityIcons.glyphMap {
    const t = (type || '').toLowerCase();
    const name = ((make || '') + (model || '')).toLowerCase();

    if (t.includes('car')) return 'car-side';
    if (t.includes('bike') || name.includes('bike')) return 'motorbike';
    if (t.includes('scooter') || name.includes('scooter')) return 'scooter';
    if (t.includes('truck')) return 'truck';
    if (t.includes('bus')) return 'bus';
    if (t.includes('tractor')) return 'tractor';
    if (t.includes('van')) return 'van-utility';
    if (t.includes('rickshaw')) return 'rickshaw';
    if (t.includes('excavator') || t.includes('earthmover')) return 'excavator';
    if (t.includes('ev') || t.includes('electric')) return 'car-electric';

    // Fallbacks based on name if type is generic/missing
    if (name.includes('royal enfield') || name.includes('ducati') || name.includes('harley')) return 'motorbike';
    if (name.includes('activa') || name.includes('jupiter') || name.includes('access')) return 'scooter';

    return 'car-side';
}

export function VehicleIcon({ type, make, model, size = 24, color = '#000', style, containerStyle }: VehicleIconProps) {
    const iconName = getVehicleIconName(type, make, model);

    return (
        <MaterialCommunityIcons
            name={iconName}
            size={size}
            color={color}
            style={style}
        />
    );
}
