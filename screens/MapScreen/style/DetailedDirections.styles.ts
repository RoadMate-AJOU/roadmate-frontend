import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    wrapper: {
        marginHorizontal: 20,
        marginTop: 10,
        backgroundColor: '#F8F9FA',
        borderRadius: 12,
        padding: 12,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: '#333',
        marginBottom: 8,
        textAlign: 'center',
    },
    scrollArea: {
        maxHeight: 240,
    },
    stepItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 10,
        paddingVertical: 6,
        paddingHorizontal: 10,
        backgroundColor: '#FFF',
        borderRadius: 8,
        borderLeftWidth: 3,
        borderLeftColor: '#E5E7EB',
    },
    currentStepItem: {
        backgroundColor: '#FFF1E6',
        borderLeftColor: '#FF6A00',
    },
    stepNumber: {
        width: 22,
        height: 22,
        borderRadius: 11,
        backgroundColor: '#E5E7EB',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
        marginTop: 2,
    },
    currentStepNumber: {
        backgroundColor: '#FF6A00',
    },
    stepNumberText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#6B7280',
    },
    currentStepNumberText: {
        color: '#FFF',
    },
    stepContent: {
        flex: 1,
    },
    stepInstruction: {
        fontSize: 14,
        fontWeight: '400',
        color: '#374151',
        lineHeight: 20,
    },
    currentStepInstruction: {
        color: '#FF6A00',
        fontWeight: '700',
    },
    stepDistance: {
        fontSize: 13,
        color: '#6B7280',
        marginTop: 2,
    },
    currentStepDistance: {
        color: '#FF8533',
        fontWeight: '500',
    },
});
