import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, Modal, StyleSheet, TouchableOpacity, View } from 'react-native';

interface ImageModalProps {
    visible: boolean;
    uri: string | null;
    onClose: () => void;
}

export function ImageModal({ visible, uri, onClose }: ImageModalProps) {
    if (!uri) return null;

    return (
        <Modal visible={visible} transparent={true} animationType="fade" onRequestClose={onClose}>
            <View style={styles.container}>
                <TouchableOpacity
                    style={styles.closeBtn}
                    onPress={onClose}
                >
                    <Ionicons name="close-circle" size={32} color="#FFF" />
                </TouchableOpacity>

                <Image
                    source={{ uri }}
                    style={styles.image}
                />
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.9)',
        justifyContent: 'center',
        alignItems: 'center'
    },
    closeBtn: {
        position: 'absolute',
        top: 50,
        right: 20,
        zIndex: 10,
        padding: 10
    },
    image: {
        width: '90%',
        height: '80%',
        resizeMode: 'contain',
        borderRadius: 12
    }
});
