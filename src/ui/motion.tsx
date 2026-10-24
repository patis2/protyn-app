import React from 'react';
import { AccessibilityInfo, Animated, Easing, Platform, type StyleProp, type ViewStyle } from 'react-native';

// Small, calm motion: content eases up as a screen opens, buttons give a
// little under the finger, ticks pop and bars fill. Everything is skipped
// when the person has asked their device to reduce motion.

const native = Platform.OS !== 'web';

let reduced = false;
AccessibilityInfo.isReduceMotionEnabled?.()
  .then((v) => (reduced = v))
  .catch(() => {});
AccessibilityInfo.addEventListener?.('reduceMotionChanged', (v: boolean) => (reduced = v));

export const reduceMotion = () => reduced;

/** Fades and lifts its children in once, after `delay` ms. */
export function FadeIn({ children, delay = 0, style }: { children?: React.ReactNode; delay?: number; style?: StyleProp<ViewStyle> }) {
  const v = React.useRef(new Animated.Value(reduced ? 1 : 0)).current;
  React.useEffect(() => {
    if (reduced) return;
    const a = Animated.timing(v, { toValue: 1, duration: 420, delay, easing: Easing.out(Easing.cubic), useNativeDriver: native });
    a.start();
    return () => a.stop();
  }, [v, delay]);
  return (
    <Animated.View style={[style, { opacity: v, transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [14, 0] }) }] }]}>
      {children}
    </Animated.View>
  );
}

/** A value that springs between 1 and `to` while pressed. */
export function usePressScale(to = 0.97) {
  const scale = React.useRef(new Animated.Value(1)).current;
  const go = (n: number) => {
    if (reduced) return;
    Animated.spring(scale, { toValue: n, speed: 40, bounciness: 6, useNativeDriver: native }).start();
  };
  return { scale, onPressIn: () => go(to), onPressOut: () => go(1) };
}

/** A short pop whenever `on` turns true. */
export function usePop(on: boolean) {
  const scale = React.useRef(new Animated.Value(1)).current;
  const first = React.useRef(true);
  React.useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (!on || reduced) return;
    scale.setValue(0.7);
    Animated.spring(scale, { toValue: 1, speed: 18, bounciness: 14, useNativeDriver: native }).start();
  }, [on, scale]);
  return scale;
}

/** Animates from the previous number to `to`, for bars and rings. */
export function useTween(to: number, duration = 700) {
  const v = React.useRef(new Animated.Value(reduced ? to : 0)).current;
  React.useEffect(() => {
    if (reduced) return v.setValue(to);
    const a = Animated.timing(v, { toValue: to, duration, easing: Easing.out(Easing.cubic), useNativeDriver: false });
    a.start();
    return () => a.stop();
  }, [v, to, duration]);
  return v;
}
