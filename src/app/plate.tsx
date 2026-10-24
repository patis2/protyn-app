import { router } from 'expo-router';
import React from 'react';
import { View } from 'react-native';
import { QUICK_FOODS } from '../content/dishes';
import { useStore, useToday } from '../data/store';
import { keyOf } from '../domain/dates';
import { dietOK } from '../domain/nutrition';
import { proteinOn } from '../domain/stats';
import { Button, Card, LinkButton, ListItem, Row, Screen, SheetHeader, Txt } from '../ui/components';
import { useToast } from '../ui/theme';

export default function Plate() {
  const today = useToday();
  const toast = useToast();
  const { state, update } = useStore();
  const p = state.profile;
  const k = keyOf(today);
  const items = QUICK_FOODS.filter((q) => dietOK(p.diet === 'jain' ? 'veg' : p.diet, { diet: q.diet, jain: true, allergens: q.allergens }) && !q.allergens.some((a) => p.allergies.includes(a)) && !p.avoidFoods.some((a) => q.name.toLowerCase().includes(a.toLowerCase())));
  const added = state.logs.extras[k] ?? [];
  const close = () => (router.canGoBack() ? router.back() : router.replace('/today'));

  return (
    <Screen>
      <SheetHeader eyebrow="Plate check-in" onClose={close} />
      <Txt variant="title">What else did you eat today?</Txt>
      <Txt variant="small">Tap to add. Household portions, no weighing and no calorie counting.</Txt>
      <Card>
        {items.map((q, i) => (
          <ListItem key={q.id} first={i === 0}>
            <View style={{ flex: 1 }}>
              <Txt>{q.name}</Txt>
              <Txt variant="small">
                {q.unit} · {q.protein} g
              </Txt>
            </View>
            <Button
              label="+ Add"
              kind="soft"
              small
              hint={`Add ${q.unit} of ${q.name}`}
              onPress={() => {
                update((s) => {
                  (s.logs.extras[k] = s.logs.extras[k] ?? []).push({ id: q.id, name: q.name, unit: q.unit, protein: q.protein });
                });
                toast(`Added ${q.name}. ${proteinOn(state, today) + q.protein} g today.`);
              }}
            />
          </ListItem>
        ))}
      </Card>
      {added.length ? (
        <Card>
          <Txt variant="card">Added today</Txt>
          {added.map((a, i) => (
            <Row key={i} between>
              <Txt>
                {a.name} · {a.unit}
              </Txt>
              <LinkButton
                label="Remove"
                hint={`Remove ${a.name}`}
                onPress={() =>
                  update((s) => {
                    s.logs.extras[k].splice(i, 1);
                  })
                }
              />
            </Row>
          ))}
        </Card>
      ) : null}
      <Button label="Done" block onPress={close} />
    </Screen>
  );
}
