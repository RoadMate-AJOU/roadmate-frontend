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
                    <Text style={styles.title} numberOfLines={2}
                        ellipsizeMode="tail">{item.name}</Text>
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
                    <ActivityIndicator size={20} color="#FF5900" />
                    <Text style={styles.searchingText}>경로 검색 중...</Text>
                </View>
            )}
        </TouchableOpacity>
    );
}
const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderColor: '#eee',
    },
    cardSearching: {
        opacity: 0.6,
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
        fontSize: 25,
        fontWeight: '600',
        flex: 1,
        marginRight: 12,
    },
    distance: {
        fontSize: 19,
        color: '#FF5900',
        fontWeight: '600',
    },
    category: {
        fontSize: 17,
        color: '#888',
        marginTop: 4,
    },
    addressRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 6,
    },
    address: {
        marginLeft: 4,
        fontSize: 17,
        color: '#666',
        flex: 1,
    },
    searchingOverlay: {
        position: 'absolute',
        right: 5,
        top: '50%',
        transform: [{ translateY: -15 }],
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF8F2',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    searchingText: {
        marginLeft: 6,
        fontSize: 15,
        color: '#FF5900',
        fontWeight: '500',
    },
});
