import { router } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { DAYS } from '../../content/library';
import { DISH_BY_ID } from '../../content/dishes';
import { useStore, useToday } from '../../data/store';
import { addDays, dayIndex, fmtDate, keyOf, weekDays, weekStart } from '../../domain/dates';
import { dietLabel, homeLabel, proteinRange } from '../../domain/nutrition';
import { WELLNESS_NOTE } from '../../domain/safety';
import { plannedProtein } from '../../domain/stats';
import { SLOTS } from '../../domain/types';
import { Button, Card, Chip, Header, ListItem, Row, Screen, Section, Txt } from '../../ui/components';
import { MealRow, MeButton } from '../../ui/pieces';
import { useColors } from '../../ui/theme';
import { font } from '../../ui/tokens';

export default function Food() {
  const c = useColors();
  const today = useToday();
  const { state } = useStore();
  const p = state.profile;
  const [day, setDay] = useState(dayIndex(today));
  const days = weekDays(weekStart(today));
  const date = days[day];
  const [lo, hi] = proteinRange(p);
  const planned = plannedProtein(state, date);
  const k = keyOf(date);
  const saved = state.logs.saved.map((id) => DISH_BY_ID[id]).filter(Boolean);

  return (
    <Screen>
      <Header title="Meal plan" eyebrow={`${homeLabel(p)} · ${dietLabel(p.diet)}`} right={<MeButton />} />
      <View role="radiogroup" accessibilityLabel="Day" style={{ flexDirection: 'row', gap: 4 }}>
        {days.map((d, i) => {
          const on = i === day;
          const isToday = keyOf(d) === keyOf(today);
          return (
            <Pressable
              key={i}
              accessibilityRole="radio"
              accessibilityState={{ selected: on, checked: on }}
              accessibilityLabel={`${DAYS[i]} ${fmtDate(d)}${isToday ? ', today' : ''}`}
              onPress={() => setDay(i)}
              style={{ flex: 1, alignItems: 'center', paddingVertical: 6, borderRadius: 12, borderWidth: 1, borderColor: on || isToday ? c.sage : c.line, backgroundColor: on ? c.sage : c.surface, minHeight: 48, justifyContent: 'center' }}
            >
              <Text style={{ fontSize: 11, color: on ? c.onSage : c.muted, fontFamily: font.body }}>{DAYS[i]}</Text>
              <Text style={{ fontSize: 15, color: on ? c.onSage : c.ink, fontFamily: font.bodySemi }}>{d.getDate()}</Text>
            </Pressable>
          );
        })}
      </View>

      <Section title={keyOf(date) === keyOf(today) ? 'Today' : `${DAYS[day]} ${fmtDate(date)}`} right={<Chip label={`${planned} g planned`} tone={planned >= lo ? 'sage' : 'coral'} />}>
        <View>
          {SLOTS.map((s, i) => (
            <View key={s}>
              <MealRow date={date} slot={s} first={i === 0} today={today} />
              <Row gap={8} style={{ marginBottom: 6 }}>
                <Button label="Swap" kind="ghost" small onPress={() => router.push({ pathname: '/swap', params: { date: k, slot: s } })} />
                <Button label="Recipe" kind="ghost" small onPress={() => router.push({ pathname: '/recipe', params: { date: k, slot: s } })} />
              </Row>
            </View>
          ))}
        </View>
        <Txt variant="small">
          Range {lo}–{hi} g a day. Portions are household measures: 1 katori is about 150 ml.
        </Txt>
      </Section>

      <Card>
        <Row between>
          <View style={{ flex: 1 }}>
            <Txt variant="card">Shopping list</Txt>
            <Txt variant="small">Made from this week’s plan, grouped by type</Txt>
          </View>
          <Button label="Open" kind="soft" small onPress={() => router.push('/shopping')} />
        </Row>
      </Card>
      <Card>
        <Row between>
          <View style={{ flex: 1 }}>
            <Txt variant="card">Plate check-in</Txt>
            <Txt variant="small">Ate something off-plan? Add it in two taps.</Txt>
          </View>
          <Button label="Add" kind="soft" small onPress={() => router.push('/plate')} />
        </Row>
      </Card>
      {saved.length ? (
        <Section title="Saved meals">
          {saved.map((d, i) => (
            <ListItem key={d.id} first={i === 0}>
              <View style={{ flex: 1 }}>
                <Txt>{d.name}</Txt>
                <Txt variant="small">
                  {d.portion} · {d.protein} g
                </Txt>
              </View>
              <Button label="Use tomorrow" kind="ghost" small onPress={() => router.push({ pathname: '/swap', params: { date: keyOf(addDays(today, 1)), slot: d.slot, pick: d.id } })} />
            </ListItem>
          ))}
        </Section>
      ) : null}
      <Txt variant="small" center>
        {WELLNESS_NOTE} Protein values are estimates pending review by a registered dietitian.
      </Txt>
    </Screen>
  );
}
