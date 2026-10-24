import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { View } from 'react-native';
import { DAYS } from '../content/library';
import { useStore, useToday } from '../data/store';
import { dayIndex, parseKey } from '../domain/dates';
import { allergenLabel, dietLabel, swapKey } from '../domain/nutrition';
import { provider } from '../domain/provider';
import type { Slot } from '../domain/types';
import { SLOT_LABEL } from '../domain/types';
import { Button, Card, ListItem, Note, Screen, SheetHeader, Txt } from '../ui/components';
import { useToast } from '../ui/theme';

export default function Swap() {
  const { date: dk, slot, pick } = useLocalSearchParams<{ date: string; slot: Slot; pick?: string }>();
  const today = useToday();
  const toast = useToast();
  const { state, update } = useStore();
  const p = state.profile;
  const date = dk ? parseKey(dk) : today;
  const current = provider.mealsForDay(p, state.logs.swaps, date)[slot];
  let options = provider.mealOptions(p, current, slot);
  if (pick) options = [...options.filter((d) => d.id === pick), ...options.filter((d) => d.id !== pick)];
  const close = () => (router.canGoBack() ? router.back() : router.replace('/food'));
  const use = (id: string, name: string) => {
    update((s) => {
      s.logs.swaps[swapKey(date, slot)] = id;
    });
    toast(`Swapped to ${name}.`);
    close();
  };

  return (
    <Screen>
      <SheetHeader eyebrow={`Swap ${SLOT_LABEL[slot].toLowerCase()} · ${DAYS[dayIndex(date)]}`} onClose={close} />
      <Txt variant="small">
        Only dishes that fit {dietLabel(p.diet).toLowerCase()}
        {p.allergies.length ? ` and avoid ${p.allergies.map(allergenLabel).join(', ').toLowerCase()}` : ''}
        {p.avoidFoods.length ? `, without ${p.avoidFoods.join(', ')}` : ''}.
        {current ? ` Now: ${current.name} (${current.protein} g).` : ''}
      </Txt>
      {options.length === 0 ? (
        <Note>No other dishes fit your preferences for this meal yet. We’re adding more recipes.</Note>
      ) : (
        <Card>
          {options.map((d, i) => (
            <ListItem key={d.id} first={i === 0}>
              <View style={{ flex: 1 }}>
                <Txt>{d.name}</Txt>
                <Txt variant="small">
                  {d.portion} · {d.protein} g{d.cuisines.includes(p.cuisine || 'N') ? '' : ' · other region'}
                </Txt>
              </View>
              <Button label="Use" kind="soft" small onPress={() => use(d.id, d.name)} hint={`Use ${d.name}`} />
            </ListItem>
          ))}
        </Card>
      )}
    </Screen>
  );
}
