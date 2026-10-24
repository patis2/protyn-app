import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { View } from 'react-native';
import { DAYS } from '../content/library';
import { useStore, useToday } from '../data/store';
import { dayIndex, daysBetween, parseKey } from '../domain/dates';
import { whyThis } from '../domain/nutrition';
import { provider } from '../domain/provider';
import { ALLERGEN_NOTE } from '../domain/safety';
import type { Slot } from '../domain/types';
import { SLOT_LABEL } from '../domain/types';
import { Button, Chip, Note, Row, Screen, SheetHeader, Txt } from '../ui/components';
import { useToast } from '../ui/theme';

export default function Recipe() {
  const { date: dk, slot } = useLocalSearchParams<{ date: string; slot: Slot }>();
  const today = useToday();
  const toast = useToast();
  const { state, update } = useStore();
  const date = dk ? parseKey(dk) : today;
  const dish = provider.mealsForDay(state.profile, state.logs.swaps, date)[slot ?? 'l'];
  const close = () => (router.canGoBack() ? router.back() : router.replace('/food'));
  if (!dish)
    return (
      <Screen>
        <SheetHeader eyebrow="Recipe" onClose={close} />
        <Note>This meal isn’t available any more, usually because your food preferences changed. Pick a swap instead.</Note>
      </Screen>
    );
  const eaten = !!state.logs.eaten[dk]?.[slot];
  const saved = state.logs.saved.includes(dish.id);
  const canLog = daysBetween(date, today) >= 0;

  return (
    <Screen
      footer={
        <>
          <Button label="Swap" kind="ghost" flex onPress={() => router.replace({ pathname: '/swap', params: { date: dk, slot } })} />
          {canLog ? (
            <Button
              label={eaten ? 'Mark not eaten' : 'Mark eaten'}
              flex
              onPress={() => {
                update((s) => {
                  s.logs.eaten[dk] = { ...(s.logs.eaten[dk] ?? {}), [slot]: !eaten };
                });
                if (!eaten) toast(`Logged ${dish.name}. ${dish.protein} g protein added.`);
                close();
              }}
            />
          ) : null}
        </>
      }
    >
      <SheetHeader eyebrow={`${SLOT_LABEL[slot]} · ${DAYS[dayIndex(date)]}`} onClose={close} />
      <Txt variant="title">{dish.name}</Txt>
      <Row wrap gap={6}>
        <Chip label={`${dish.protein} g protein`} />
        <Chip label={dish.portion} tone="line" />
      </Row>
      <Note tone="why">Why this: {whyThis(state.profile, dish)}.</Note>
      <View style={{ gap: 6 }}>
        <Txt variant="card" role="heading">You’ll need</Txt>
        {dish.ingredients.map((i) => (
          <Txt key={i.name}>• {i.name}</Txt>
        ))}
      </View>
      <View style={{ gap: 6 }}>
        <Txt variant="card" role="heading">Steps</Txt>
        {dish.steps.map((s, i) => (
          <Txt key={i}>
            {i + 1}. {s}
          </Txt>
        ))}
      </View>
      {dish.substitution ? <Note>Swap idea: {dish.substitution}</Note> : null}
      {state.profile.allergies.length || state.profile.otherAllergy ? <Note>{ALLERGEN_NOTE}</Note> : null}
      <Button
        label={saved ? 'Saved to your meals' : 'Save this meal'}
        kind="soft"
        small
        onPress={() =>
          update((s) => {
            s.logs.saved = saved ? s.logs.saved.filter((x) => x !== dish.id) : [...s.logs.saved, dish.id];
          })
        }
      />
      <Txt variant="small">Protein values are estimates and will be reviewed by a registered dietitian before launch.</Txt>
    </Screen>
  );
}
