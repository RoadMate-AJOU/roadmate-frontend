// screens/MapScreen/MicButton.tsx
import React, { useRef, useState } from 'react';
import { Animated, Dimensions, Easing, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function MicButton() {
  const [expanded, setExpanded] = useState(false);
  const window = Dimensions.get('window');

  // 애니메이션 관련 값
  const anim = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  const micSize = anim.interpolate({ inputRange: [0, 1], outputRange: [60, 160] });
  const micLeft = anim.interpolate({ inputRange: [0, 1], outputRange: [window.width - 80, window.width / 2 - 80] });
  const micTop = anim.interpolate({ inputRange: [0, 1], outputRange: [window.height - 160, window.height / 2 - 80] });
  const micRadius = anim.interpolate({ inputRange: [0, 1], outputRange: [30, 80] });

  const toggleMic = () => {
    Animated.parallel([
      Animated.timing(anim, {
        toValue: expanded ? 0 : 1,
        duration: 400,
        easing: Easing.out(Easing.exp),
        useNativeDriver: false,
      }),
      Animated.timing(scale, {
        toValue: expanded ? 1 : 1.8,
        duration: 400,
        easing: Easing.out(Easing.exp),
        useNativeDriver: false,
      })
    ]).start();

    if (!expanded) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(opacity, { toValue: 0.3, duration: 400, useNativeDriver: false }),
          Animated.timing(opacity, { toValue: 1, duration: 400, useNativeDriver: false })
        ])
      ).start();
    } else {
      opacity.setValue(1);
    }

    setExpanded(!expanded);
  };

  return (
    <Animated.View style={{
      position: 'absolute',
      backgroundColor: '#FF5900',
      elevation: 6,
      borderWidth: 2,
      borderColor: 'white',
      shadowColor: '#FF5900',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.4,
      shadowRadius: 6,
      width: micSize,
      height: micSize,
      borderRadius: micRadius,
      left: micLeft,
      top: micTop,
      opacity: opacity,
      justifyContent: 'center',
      alignItems: 'center',
    }}>
      <TouchableOpacity onPress={toggleMic}>
        <Animated.View style={{ transform: [{ scale }] }}>
          <Ionicons name="mic" size={50} color="white" />
        </Animated.View>
      </TouchableOpacity>
    </Animated.View>
  );
}
