import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function DestinationItem({
    item,
    isSearching,
    disabled,
    onPress,
}: {
    item: any;
    isSearching: boolean;
    disabled: boolean;
    onPress: () => void;
}) {
    return (
        <TouchableOpacity
            style={[styles.card, isSearching && styles.cardSearching]}
            onPress={onPress}
            disabled={disabled}
        >
            <View style={styles.info}>
                <View style={styles.titleRow}>
                    <Text style={styles.title}>{item.name}</Text>
                    <Text style={styles.distance}>{item.distance}</Text>
                </View>
                <Text style={styles.category}>{item.category}</Text>
                <View style={styles.addressRow}>
                    <Ionicons name="location-outline" size={14} color="#666" />
                    <Text style={styles.address}>{item.address}</Text>
                </View>
                {!!item.tel && (
                    <View style={styles.addressRow}>
                        <Ionicons name="call-outline" size={14} color="#666" />
                        <Text style={styles.address}>{item.tel}</Text>
                    </View>
                )}
            </View>
            {isSearching && (
                <View style={styles.searchingOverlay}>
                    <ActivityIndicator size="small" color="#FF5900" />
                    <Text style={styles.searchingText}>경로 검색 중...</Text>
                </View>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: 'rgba(250,129,47,0.15)',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 3 },
                shadowOpacity: 0.1,
                shadowRadius: 6,
            },
            android: {
                elevation: 3,
            },
        }),
        position: 'relative',
    },
    cardSearching: {
        opacity: 0.7,
        backgroundColor: '#FFF8F2',
    },
    info: {
        flex: 1,
    },
    titleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        flex: 1,
    },
    distance: {
        fontSize: 14,
        color: '#FF5900',
        fontWeight: '600',
    },
    category: {
        fontSize: 14,
        color: '#555',
        marginTop: 4,
    },
    addressRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 6,
    },
    address: {
        marginLeft: 4,
        fontSize: 13,
        color: '#666',
        flex: 1,
    },
    searchingOverlay: {
        position: 'absolute',
        right: 16,
        top: '50%',
        transform: [{ translateY: -15 }],
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    searchingText: {
        marginLeft: 6,
        fontSize: 12,
        color: '#FF5900',
        fontWeight: '500',
    },
});
