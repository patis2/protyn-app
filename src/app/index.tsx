import { Redirect, router } from 'expo-router';
import React from 'react';
import { Animated, Easing, Platform, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg from 'react-native-svg';
import { useStore } from '../data/store';
import { Button, Txt } from '../ui/components';
import { Icon, LogoArt, type IconName } from '../ui/icons';
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
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20, paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24, gap: 26 }}>
        <AnimatedLogo size={136} />
        <FadeIn delay={1500}>
          <Txt center role="heading" color={c.onHero} style={{ fontFamily: font.displayBold, fontSize: 60, lineHeight: 64, letterSpacing: -2.6 }}>
            protyn
          </Txt>
        </FadeIn>
        <View accessible accessibilityLabel="Plan it. Plate it. Pump it." style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 10 }}>
          {TAGLINE.map(([word, icon], i) => (
            <FadeIn key={word} delay={1850 + i * 260}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8, paddingLeft: 8, paddingRight: 14, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.1)' }}>
                <View style={{ width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center', backgroundColor: i === 2 ? c.coral : '#F8F1E9' }}>
                  <Icon name={icon} size={18} color={i === 2 ? '#F8F1E9' : '#2F5240'} strokeWidth={2} />
                </View>
                <Txt color={c.onHero} style={{ fontFamily: font.display, fontSize: 19, lineHeight: 24 }}>
                  {word}
                </Txt>
              </View>
            </FadeIn>
          ))}
        </View>
        <FadeIn delay={2800} style={{ width: '100%', maxWidth: 320, marginTop: 6 }}>
          <Button label="Get started" block kind="hero" onPress={() => router.push('/welcome')} />
        </FadeIn>
      </View>
    </View>
  );
}

const native = Platform.OS !== 'web';

/**
 * The Protyn mark, built in beats: the tile lands, the plate appears, the food
 * pops onto it, then the dumbbell swings in. Static if motion is reduced.
 */
function AnimatedLogo({ size }: { size: number }) {
  const still = reduceMotion();
  const v = React.useRef([0, 1, 2, 3].map(() => new Animated.Value(still ? 1 : 0))).current;
  const [tile, plate, food, bell] = v;

  React.useEffect(() => {
    if (still) return;
    const seq = Animated.sequence([
      Animated.timing(tile, { toValue: 1, duration: 450, easing: Easing.out(Easing.back(1.4)), useNativeDriver: native }),
      Animated.timing(plate, { toValue: 1, duration: 320, easing: Easing.out(Easing.cubic), useNativeDriver: native }),
      Animated.spring(food, { toValue: 1, speed: 14, bounciness: 14, useNativeDriver: native }),
      Animated.spring(bell, { toValue: 1, speed: 8, bounciness: 12, useNativeDriver: native }),
    ]);
    seq.start();
    return () => seq.stop();
  }, [still, tile, plate, food, bell]);

  const layer = (parts: 'plate' | 'food' | 'dumbbell', a: Animated.Value, transform: object[]) => (
    <Animated.View style={{ position: 'absolute', top: 0, left: 0, width: size, height: size, opacity: a, transform }}>
      <Svg width={size} height={size} viewBox="0 0 120 120" accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        <LogoArt parts={parts} />
      </Svg>
    </Animated.View>
  );

  return (
    <Animated.View
      accessibilityRole="image"
      accessibilityLabel="Protyn logo: a plate of food and a dumbbell"
      style={{
        width: size,
        height: size,
        borderRadius: (28 / 120) * size,
        backgroundColor: '#2F5240',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.14)',
        opacity: tile,
        transform: [{ scale: tile.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] }) }, { rotate: tile.interpolate({ inputRange: [0, 1], outputRange: ['-8deg', '0deg'] }) }],
      }}
    >
      {layer('plate', plate, [{ scale: plate.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] }) }])}
      {layer('food', food, [{ scale: food.interpolate({ inputRange: [0, 1], outputRange: [0.3, 1] }) }])}
      {layer('dumbbell', bell, [
        { translateX: bell.interpolate({ inputRange: [0, 1], outputRange: [size * 0.25, 0] }) },
        { rotate: bell.interpolate({ inputRange: [0, 1], outputRange: ['-70deg', '0deg'] }) },
      ])}
    </Animated.View>
  );
}
