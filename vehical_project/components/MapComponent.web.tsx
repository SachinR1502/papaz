import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export const PROVIDER_GOOGLE = 'google';

export const Marker = (props: any) => {
    return <View>{props.children}</View>;
}

const MapView = (props: any) => {
    return (
        <View style={[props.style, styles.container]}>
            <Text style={styles.text}>Map View (Web Placeholder)</Text>
            {/* Render children so marker contents (like custom icons) might still show up if needed, or just hide them */}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#F0F0F0',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden'
    },
    text: {
        color: '#666',
        fontSize: 14
    }
});

export default MapView;
