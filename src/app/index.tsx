import { Redirect, router } from 'expo-router';
import React from 'react';
import { Animated, Easing, Platform, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';
import { useStore } from '../data/store';
import { Button, Txt } from '../ui/components';
import { FadeIn, reduceMotion } from '../ui/motion';
import { useColors } from '../ui/theme';
import { font } from '../ui/tokens';

export default function Index() {
  const { state } = useStore();
  if (state.onboarded) return <Redirect href="/today" />;
  if (state.mode !== 'none') return <Redirect href="/onboarding" />;
  return <Landing />;
}

/** First screen for new visitors: the logo builds itself, then the name and tagline arrive. */
function Landing() {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const { startDemo } = useStore();
  return (
    <View style={{ flex: 1, backgroundColor: c.hero, overflow: 'hidden' }}>
      <View pointerEvents="none" style={{ position: 'absolute', width: 420, height: 420, borderRadius: 210, right: -180, top: -160, backgroundColor: c.sage, opacity: 0.3 }} />
      <View pointerEvents="none" style={{ position: 'absolute', width: 300, height: 300, borderRadius: 150, left: -140, bottom: -110, backgroundColor: c.coral, opacity: 0.18 }} />
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24, paddingTop: insets.top + 24, paddingBottom: 24, gap: 22 }}>
        <AnimatedLogo size={120} />
        <FadeIn delay={900}>
          <Txt center role="heading" color={c.onHero} style={{ fontFamily: font.displayBold, fontSize: 56, lineHeight: 60, letterSpacing: -2.4 }}>
            protyn
          </Txt>
        </FadeIn>
        <FadeIn delay={1200} style={{ gap: 10, maxWidth: 420 }}>
          <Txt center color={c.onHero} style={{ fontFamily: font.display, fontSize: 22, lineHeight: 28 }}>
            Ghar ka khana. Real protein. A stronger you.
          </Txt>
          <Txt center color={c.heroMuted}>
            Weekly meal plans from your own regional kitchen, veg or non-veg, with short workouts you can do at home.
          </Txt>
        </FadeIn>
        <FadeIn delay={1500} style={{ width: '100%', maxWidth: 360, gap: 10, marginTop: 8 }}>
          <Button label="Get started" block kind="hero" onPress={() => router.push('/welcome')} />
          <Button
            label="Try the demo"
            block
            kind="ghost"
            color={c.onHero}
            hint="Opens the app with sample data for Rajashree from Bhubaneswar"
            onPress={() => {
              startDemo();
              router.replace('/today');
            }}
          />
        </FadeIn>
      </View>
      <FadeIn delay={1700} style={{ paddingBottom: insets.bottom + 14, paddingHorizontal: 16 }}>
        <Txt variant="small" center color={c.heroMuted}>
          General wellness guidance, not medical advice.
        </Txt>
      </FadeIn>
    </View>
  );
}

const native = Platform.OS !== 'web';

/**
 * The Protyn mark, built in three beats: the tile lands, the strength bar
 * rises, then the coral protein ring sweeps round. Static if motion is reduced.
 */
function AnimatedLogo({ size }: { size: number }) {
  const still = reduceMotion();
  const tile = React.useRef(new Animated.Value(still ? 1 : 0)).current;
  const bar = React.useRef(new Animated.Value(still ? 1 : 0)).current;
  const arc = React.useRef(new Animated.Value(still ? 1 : 0)).current;
  const [sweep, setSweep] = React.useState(still ? 1 : 0);

  React.useEffect(() => {
    if (still) return;
    const id = arc.addListener(({ value }) => setSweep(value));
    const seq = Animated.sequence([
      Animated.spring(tile, { toValue: 1, speed: 10, bounciness: 9, useNativeDriver: native }),
      Animated.timing(bar, { toValue: 1, duration: 380, easing: Easing.out(Easing.back(1.6)), useNativeDriver: native }),
      Animated.timing(arc, { toValue: 1, duration: 700, easing: Easing.inOut(Easing.cubic), useNativeDriver: false }),
    ]);
    seq.start();
    return () => {
      seq.stop();
      arc.removeListener(id);
    };
  }, [still, tile, bar, arc]);

  const u = size / 120; // the mark is drawn on a 120-unit grid
  const r = 18 * u;
  const len = 2 * Math.PI * r;
  return (
    <Animated.View
      accessibilityRole="image"
      accessibilityLabel="Protyn logo"
      style={{
        width: size,
        height: size,
        borderRadius: 28 * u,
        backgroundColor: '#2F5240',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.14)',
        opacity: tile,
        transform: [{ scale: tile.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] }) }, { rotate: tile.interpolate({ inputRange: [0, 1], outputRange: ['-8deg', '0deg'] }) }],
      }}
    >
      <Animated.View
        style={{
          position: 'absolute',
          left: 30 * u,
          top: 30 * u,
          width: 11 * u,
          height: 60 * u,
          borderRadius: 5.5 * u,
          backgroundColor: '#F8F1E9',
          transform: [{ translateY: bar.interpolate({ inputRange: [0, 1], outputRange: [30 * u, 0] }) }, { scaleY: bar }],
        }}
      />
      <Svg width={size} height={size} style={{ position: 'absolute' }} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        <Circle cx={70 * u} cy={50 * u} r={r} fill="none" stroke="#677E6F" strokeWidth={11 * u} opacity={sweep > 0 ? 1 : 0} />
        <Circle
          cx={70 * u}
          cy={50 * u}
          r={r}
          fill="none"
          stroke="#E8735A"
          strokeWidth={11 * u}
          strokeDasharray={`${len * 0.75 * sweep} ${len}`}
          transform={`rotate(-90 ${70 * u} ${50 * u})`}
        />
      </Svg>
    </Animated.View>
  );
}
