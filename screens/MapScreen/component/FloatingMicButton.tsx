import React, { useRef, useEffect } from 'react';
import { Animated, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../style/FloatingMicButton.styles';
import { useVoiceViewModel } from '../service/mic/FloatingMicViewModel';

const ENABLE_VOICE = false;

export default function FloatingMicButton() {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  const {
    isSpeaking,
    handleMicPress,
  } = useVoiceViewModel(ENABLE_VOICE);

  useEffect(() => {
    if (isSpeaking) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.1, duration: 800, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        ])
      ).start();

      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, { toValue: 1, duration: 1000, useNativeDriver: false }),
          Animated.timing(glowAnim, { toValue: 0.3, duration: 1000, useNativeDriver: false }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
      glowAnim.setValue(0);
    }
  }, [isSpeaking]);

  const glowOpacity = glowAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 0.6] });
  const glowRadius = glowAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 20] });

  return (
    <View style={styles.container}>
      {isSpeaking && ENABLE_VOICE && (
        <Animated.View style={[styles.glowEffect, { opacity: glowOpacity, shadowRadius: glowRadius }]} />
      )}
      <Animated.View
        style={[
          styles.micButton,
          {
            transform: [{ scale: pulseAnim }],
            backgroundColor: isSpeaking ? '#FF3B30' : '#FF5900',
          },
        ]}
      >
        <TouchableOpacity onPress={handleMicPress} style={styles.touchArea} activeOpacity={0.8}>
          <Ionicons name={isSpeaking ? 'stop' : 'mic'} size={28} color="white" />
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}
