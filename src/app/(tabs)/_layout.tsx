import { Redirect, router, Slot, usePathname } from 'expo-router';
import React from 'react';
import { Animated, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useStore } from '../../data/store';
import { focusRing, TopInset, Txt } from '../../ui/components';
import { Icon, Logo, type IconName } from '../../ui/icons';
import { useColors, useWide } from '../../ui/theme';
import { usePop } from '../../ui/motion';
import { font } from '../../ui/tokens';

// Five destinations: a bottom tab bar on phones and narrow windows, a sidebar
// on wide web screens. Both are built from the same list.

const TABS: { href: '/today' | '/food' | '/move' | '/habits' | '/progress'; label: string; icon: IconName }[] = [
  { href: '/today', label: 'Today', icon: 'home' },
  { href: '/food', label: 'Food', icon: 'food' },
  { href: '/move', label: 'Move', icon: 'move' },
  { href: '/habits', label: 'Habits', icon: 'habits' },
  { href: '/progress', label: 'Progress', icon: 'progress' },
];

type PressState = { pressed: boolean; focused?: boolean };
const ring = (s: PressState, color: string) => focusRing(s, color) as object;

export default function TabsLayout() {
  const c = useColors();
  const wide = useWide();
  const path = usePathname();
  const insets = useSafeAreaInsets();
  const { state } = useStore();
  if (!state.onboarded) return <Redirect href="/" />;

  const go = (href: string) => router.navigate(href as never);

  if (wide)
    return (
      <View style={{ flex: 1, flexDirection: 'row', backgroundColor: c.bg }}>
        <View role="navigation" accessibilityLabel="Main" style={{ width: 232, borderRightWidth: 1, borderRightColor: c.line, backgroundColor: c.surface, paddingVertical: 24, paddingHorizontal: 14, gap: 4 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 8, marginBottom: 18 }}>
            <Logo size={34} />
            <Text style={{ fontFamily: font.displayBold, fontSize: 26, letterSpacing: -1, color: c.ink }}>protyn</Text>
          </View>
          {[...TABS, { href: '/me' as const, label: 'Me and privacy', icon: 'user' as IconName }].map((t) => {
            const on = path === t.href;
            return (
              <Pressable
                key={t.href}
                accessibilityRole="link"
                accessibilityState={{ selected: on }}
                aria-current={on ? 'page' : undefined}
                onPress={() => go(t.href)}
                style={(s: PressState) => [{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, paddingHorizontal: 12, borderRadius: 12, backgroundColor: on ? c.sageSoft : s.pressed ? c.sunk : 'transparent' }, ring(s, c.sage)]}
              >
                <Icon name={t.icon} color={on ? c.sageDeep : c.muted} />
                <Text style={{ fontFamily: on ? font.bodySemi : font.bodyMedium, fontSize: 15, color: on ? c.sageDeep : c.ink }}>{t.label}</Text>
              </Pressable>
            );
          })}
          <View style={{ flex: 1 }} />
          {state.mode === 'demo' ? <Txt variant="small" style={{ paddingHorizontal: 8 }}>Demo mode · sample data</Txt> : null}
          <Txt variant="small" style={{ paddingHorizontal: 8 }}>General wellness guidance, not medical advice.</Txt>
        </View>
        <View style={{ flex: 1 }}>
          <Slot />
        </View>
      </View>
    );

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      {state.mode === 'demo' ? (
        <View style={{ backgroundColor: c.amberSoft, paddingTop: insets.top + 4, paddingBottom: 5, paddingHorizontal: 16 }}>
          <Text style={{ color: c.amberInk, fontFamily: font.bodyMedium, fontSize: 12 }}>Demo mode · sample data</Text>
        </View>
      ) : null}
      <View style={{ flex: 1 }}>
        <TopInset.Provider value={state.mode !== 'demo'}>
          <Slot />
        </TopInset.Provider>
      </View>
      <View role="navigation" accessibilityLabel="Main" style={{ flexDirection: 'row', borderTopWidth: 1, borderTopColor: c.line, backgroundColor: c.surface, paddingTop: 6, paddingBottom: Math.max(insets.bottom, 8), paddingHorizontal: 8 }}>
        {TABS.map((t) => {
          const on = path === t.href;
          return (
            <Pressable
              key={t.href}
              accessibilityRole="tab"
              accessibilityLabel={t.label}
              accessibilityState={{ selected: on }}
              aria-current={on ? 'page' : undefined}
              onPress={() => go(t.href)}
              style={(s: PressState) => [{ flex: 1, alignItems: 'center', gap: 2, paddingVertical: 4, borderRadius: 12 }, ring(s, c.sage)]}
            >
              <TabPill on={on} icon={t.icon} />
              <Text style={{ fontSize: 11, fontFamily: on ? font.bodySemi : font.body, color: on ? c.sageDeep : c.muted }}>{t.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

/** The tab icon gets a soft pill, which pops in when the tab is chosen. */
function TabPill({ on, icon }: { on: boolean; icon: IconName }) {
  const c = useColors();
  const pop = usePop(on);
  return (
    <Animated.View style={{ width: 52, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center', backgroundColor: on ? c.sageSoft : 'transparent', transform: [{ scale: pop }] }}>
      <Icon name={icon} color={on ? c.sageDeep : c.muted} />
    </Animated.View>
  );
}
