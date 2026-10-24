import { router } from 'expo-router';
import React from 'react';
import { Platform, Share, Text, View } from 'react-native';
import { GROUP_LABEL } from '../content/dishes';
import { useStore, useToday } from '../data/store';
import { fmtDate, keyOf, weekDays, weekStart } from '../domain/dates';
import { provider } from '../domain/provider';
import type { IngredientGroup } from '../domain/types';
import { SLOTS } from '../domain/types';
import { Button, Card, ListItem, Screen, SheetHeader, Tick, Txt } from '../ui/components';
import { useColors, useToast } from '../ui/theme';
import { font } from '../ui/tokens';

export default function Shopping() {
  const c = useColors();
  const today = useToday();
  const toast = useToast();
  const { state, update } = useStore();
  const start = weekStart(today);
  const wk = keyOf(start);
  const ticks = state.logs.shopTicks[wk] ?? {};

  // Count how many planned meals use each ingredient this week.
  const map = new Map<string, { group: IngredientGroup; count: number }>();
  for (const d of weekDays(start)) {
    const meals = provider.mealsForDay(state.profile, state.logs.swaps, d);
    for (const s of SLOTS)
      for (const ing of meals[s]?.ingredients ?? []) {
        const cur = map.get(ing.name) ?? { group: ing.group, count: 0 };
        cur.count++;
        map.set(ing.name, cur);
      }
  }
  const groups = (Object.keys(GROUP_LABEL) as IngredientGroup[])
    .map((g) => ({ g, items: [...map.entries()].filter(([, v]) => v.group === g).sort(([a], [b]) => a.localeCompare(b)) }))
    .filter((x) => x.items.length);

  const close = () => (router.canGoBack() ? router.back() : router.replace('/food'));
  const share = async () => {
    const text = `Protyn shopping list, week of ${fmtDate(start)}\n\n${groups
      .map((x) => `${GROUP_LABEL[x.g]}\n${x.items.filter(([n]) => !ticks[n]).map(([n]) => `• ${n}`).join('\n')}`)
      .join('\n\n')}`;
    try {
      if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(text);
        toast('Copied the list. Paste it into WhatsApp or notes.');
      } else await Share.share({ message: text });
    } catch {
      toast('Couldn’t share the list. Try again.');
    }
  };

  return (
    <Screen footer={<Button label={Platform.OS === 'web' ? 'Copy list' : 'Share list'} flex onPress={share} />}>
      <SheetHeader eyebrow={`Shopping list · week of ${fmtDate(start)}`} onClose={close} />
      <Txt variant="small">Made from your plan, including swaps. Tick things off as you buy them.</Txt>
      {groups.map(({ g, items }) => (
        <Card key={g}>
          <Txt variant="card" role="heading">{GROUP_LABEL[g]}</Txt>
          {items.map(([name, v], i) => {
            const on = !!ticks[name];
            return (
              <ListItem key={name} first={i === 0}>
                <Tick
                  on={on}
                  label={`Got ${name}`}
                  onPress={() =>
                    update((s) => {
                      s.logs.shopTicks[wk] = { ...(s.logs.shopTicks[wk] ?? {}), [name]: !on };
                    })
                  }
                />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: font.body, fontSize: 15, color: on ? c.muted : c.ink, textDecorationLine: on ? 'line-through' : 'none' }}>{name}</Text>
                </View>
                <Txt variant="small">
                  {v.count} meal{v.count > 1 ? 's' : ''}
                </Txt>
              </ListItem>
            );
          })}
        </Card>
      ))}
    </Screen>
  );
}
