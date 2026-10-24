import { Redirect, router } from 'expo-router';
import React from 'react';
import { Animated, Easing, Platform, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';
import { useStore } from '../data/store';
import { Button, Txt } from '../ui/components';
import { Icon, type IconName } from '../ui/icons';
import { FadeIn, reduceMotion } from '../ui/motion';
import { useColors } from '../ui/theme';
import { font } from '../ui/tokens';

export default function Index() {
  const { state } = useStore();
  if (state.onboarded) return <Redirect href="/today" />;
  if (state.mode !== 'none') return <Redirect href="/onboarding" />;
  return <Landing />;
}

export const TAGLINE: [string, IconName][] = [
  ['Plan it.', 'plan'],
  ['Plate it.', 'plate'],
  ['Pump it.', 'dumbbell'],
];

/** First screen for new visitors: just the mark, the name and the tagline. */
function Landing() {
  const c = useColors();
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, backgroundColor: c.hero, overflow: 'hidden' }}>
      <View pointerEvents="none" style={{ position: 'absolute', width: 420, height: 420, borderRadius: 210, right: -180, top: -160, backgroundColor: c.sage, opacity: 0.3 }} />
      <View pointerEvents="none" style={{ position: 'absolute', width: 300, height: 300, borderRadius: 150, left: -140, bottom: -110, backgroundColor: c.coral, opacity: 0.18 }} />
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20, paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24, gap: 30 }}>
        <AnimatedLogo size={176} />
        <FadeIn delay={1900}>
          <Txt center role="heading" color={c.onHero} style={{ fontFamily: font.displayBold, fontSize: 76, lineHeight: 82, letterSpacing: -3 }}>
            protyn
          </Txt>
        </FadeIn>
        <View accessible accessibilityLabel="Plan it. Plate it. Pump it." style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 10 }}>
          {TAGLINE.map(([word, icon], i) => (
            <FadeIn key={word} delay={2250 + i * 280}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, paddingLeft: 10, paddingRight: 18, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.1)' }}>
                <View style={{ width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', backgroundColor: i === 2 ? c.coral : '#F8F1E9' }}>
                  <Icon name={icon} size={22} color={i === 2 ? '#F8F1E9' : '#2F5240'} strokeWidth={2} />
                </View>
                <Txt color={c.onHero} style={{ fontFamily: font.display, fontSize: 23, lineHeight: 28 }}>
                  {word}
                </Txt>
              </View>
            </FadeIn>
          ))}
        </View>
        <FadeIn delay={3300} style={{ width: '100%', maxWidth: 320, marginTop: 6 }}>
          <Button label="Get started" block kind="hero" onPress={() => router.push('/welcome')} />
        </FadeIn>
      </View>
    </View>
  );
}

const native = Platform.OS !== 'web';
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

// The protein arc on the P is 85 units long on a ring of radius 18.
const ARC = 85;
const RING = 2 * Math.PI * 18;

/**
 * The Protyn "P" mark, built in beats: the tile lands, the stem rises, the
 * ring appears and the coral protein arc sweeps round. Afterwards the mark
 * floats gently. Static if motion is reduced.
 */
function AnimatedLogo({ size }: { size: number }) {
  const still = reduceMotion();
  const v = React.useRef([0, 1, 2, 3, 4].map(() => new Animated.Value(still ? 1 : 0))).current;
  const [tile, stem, ring, arc, float] = v;

  React.useEffect(() => {
    if (still) return;
    const seq = Animated.sequence([
      Animated.timing(tile, { toValue: 1, duration: 500, easing: Easing.out(Easing.back(1.5)), useNativeDriver: native }),
      Animated.timing(stem, { toValue: 1, duration: 380, easing: Easing.out(Easing.cubic), useNativeDriver: native }),
      Animated.timing(ring, { toValue: 1, duration: 300, easing: Easing.out(Easing.cubic), useNativeDriver: native }),
      Animated.timing(arc, { toValue: 1, duration: 700, easing: Easing.inOut(Easing.cubic), useNativeDriver: false }),
    ]);
    const bob = Animated.loop(
      Animated.sequence([
        Animated.timing(float, { toValue: 1, duration: 1600, easing: Easing.inOut(Easing.sin), useNativeDriver: native }),
        Animated.timing(float, { toValue: 0, duration: 1600, easing: Easing.inOut(Easing.sin), useNativeDriver: native }),
      ]),
    );
    seq.start(({ finished }) => finished && bob.start());
    return () => {
      seq.stop();
      bob.stop();
    };
  }, [still, tile, stem, ring, arc, float]);

  const u = size / 120;
  const hidden = { accessibilityElementsHidden: true, importantForAccessibility: 'no-hide-descendants' as const };

  return (
    <Animated.View style={{ transform: [{ translateY: still ? 0 : float.interpolate({ inputRange: [0, 1], outputRange: [0, -8] }) }] }}>
      {/* soft glow behind the tile */}
      <Animated.View
        pointerEvents="none"
        style={{ position: 'absolute', left: -size * 0.18, top: -size * 0.18, width: size * 1.36, height: size * 1.36, borderRadius: size, backgroundColor: '#F8F1E9', opacity: arc.interpolate({ inputRange: [0, 1], outputRange: [0, 0.07] }) }}
      />
      <Animated.View
        accessibilityRole="image"
        accessibilityLabel="Protyn logo"
        style={{
          width: size,
          height: size,
          borderRadius: 28 * u,
          backgroundColor: '#2F5240',
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.16)',
          shadowColor: '#000',
          shadowOpacity: 0.25,
          shadowRadius: 24,
          shadowOffset: { width: 0, height: 12 },
          opacity: tile,
          transform: [{ scale: tile.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] }) }, { rotate: tile.interpolate({ inputRange: [0, 1], outputRange: ['-10deg', '0deg'] }) }],
        }}
      >
        {/* stem of the P, rising from the bottom */}
        <Animated.View
          style={{
            position: 'absolute',
            left: 30 * u,
            top: 30 * u,
            width: 11 * u,
            height: 60 * u,
            borderRadius: 5.5 * u,
            backgroundColor: '#F8F1E9',
            opacity: stem,
            transform: [{ translateY: stem.interpolate({ inputRange: [0, 1], outputRange: [30 * u, 0] }) }, { scaleY: stem }],
          }}
        />
        {/* the protein ring */}
        <Animated.View style={{ position: 'absolute', left: 0, top: 0, opacity: ring, transform: [{ scale: ring.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1] }) }] }}>
          <Svg width={size} height={size} viewBox="0 0 120 120" {...hidden}>
            <Circle cx={70} cy={50} r={18} fill="none" stroke="#677E6F" strokeWidth={11} />
            <AnimatedCircle
              cx={70}
              cy={50}
              r={18}
              fill="none"
              stroke="#E8735A"
              strokeWidth={11}
              strokeDasharray={`${ARC} ${RING}`}
              strokeDashoffset={arc.interpolate({ inputRange: [0, 1], outputRange: [ARC, 0] })}
              transform="rotate(-90 70 50)"
            />
          </Svg>
        </Animated.View>
      </Animated.View>
    </Animated.View>
  );
}
