// components/FloatingMicButton.styles.ts
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 30,
        right: 20,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
    },
    micButton: {
        width: 100,
        height: 100,
        borderRadius: 50,
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2,
    },
    touchArea: {
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 30,
    },
    borderRing: {
        position: 'absolute',
        width: 110,
        height: 110,
        borderRadius: 55,
        borderWidth: 2,
        borderColor: 'rgba(255, 89, 0, 0.3)',
        zIndex: 1,
    },
    glowEffect: {
        position: 'absolute',
        width: 130,
        height: 130,
        borderRadius: 65,
        backgroundColor: '#FF5900',
        shadowColor: '#FF5900',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        elevation: 0,
        zIndex: 0,
    },
});
