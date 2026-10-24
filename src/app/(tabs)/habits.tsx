import { router } from 'expo-router';
import React, { useState } from 'react';
import { View } from 'react-native';
import { DAYS } from '../../content/library';
import { useStore, useToday } from '../../data/store';
import { daysBetween, fmtDate, keyOf, parseKey, weekDays, weekStart } from '../../domain/dates';
import { habitDone, myHabits } from '../../domain/stats';
import { noteSchema } from '../../domain/validation';
import { Button, Card, Field, Header, IconButton, ListItem, Row, Screen, Section, Tick, Txt } from '../../ui/components';
import { MeButton } from '../../ui/pieces';
import { useColors } from '../../ui/theme';

export default function Habits() {
  const c = useColors();
  const today = useToday();
  const { state, update } = useStore();
  const habits = myHabits(state);
  const k = keyOf(today);
  const day = state.logs.habits[k] ?? {};
  const days = weekDays(weekStart(today));
  const [note, setNote] = useState(state.logs.notes[k] ?? '');
  const noteError = noteSchema.safeParse(note).error?.issues[0]?.message;
  const pastNotes = Object.entries(state.logs.notes)
    .filter(([d, n]) => d !== k && n.trim())
    .sort(([a], [b]) => b.localeCompare(a))
    .slice(0, 5);

  const setHabit = (id: string, v: number | boolean) =>
    update((s) => {
      s.logs.habits[k] = { ...(s.logs.habits[k] ?? {}), [id]: v };
    });

  return (
    <Screen>
      <Header title="Habits" eyebrow={`${habits.length} habits · no streak penalties`} right={<MeButton />} />
      <Section title="Today">
        {habits.length === 0 ? <Txt variant="small">No habits yet. Choose a few small ones to start.</Txt> : null}
        {habits.map((h, i) => {
          const v = day[h.id];
          return (
            <ListItem key={h.id} first={i === 0}>
              <View style={{ flex: 1 }}>
                <Txt>{h.name}</Txt>
                {h.type === 'count' ? (
                  <Txt variant="small">
                    {Number(v || 0)} of {h.goal} {h.unit}
                  </Txt>
                ) : h.kind === 'reduce' ? (
                  <Txt variant="small">Cutting back</Txt>
                ) : null}
              </View>
              {h.type === 'count' ? (
                <Row gap={6}>
                  <IconButton icon="minus" label={`Remove a glass. ${Number(v || 0)} so far`} onPress={() => setHabit(h.id, Math.max(Number(v || 0) - 1, 0))} />
                  <IconButton icon="plus" label={`Add a glass. ${Number(v || 0)} so far`} tint onPress={() => setHabit(h.id, Math.min(Number(v || 0) + 1, 20))} />
                </Row>
              ) : (
                <Tick on={!!v} label={h.name} onPress={() => setHabit(h.id, !v)} />
              )}
            </ListItem>
          );
        })}
      </Section>

      <Section title="This week">
        {habits.map((h) => (
          <View key={h.id} style={{ gap: 4 }}>
            <Txt variant="small" color={c.ink}>{h.name}</Txt>
            <View style={{ flexDirection: 'row' }}>
              {days.map((d, i) => {
                const future = daysBetween(d, today) < 0;
                const done = habitDone(state, d, h);
                return (
                  <View key={i} style={{ flex: 1, alignItems: 'center' }} accessibilityLabel={`${h.name}, ${DAYS[i]}: ${future ? 'coming up' : done ? 'done' : 'not done'}`}>
                    <View style={{ width: 22, height: 22, borderRadius: 11, borderWidth: keyOf(d) === k ? 2 : 1.5, borderColor: keyOf(d) === k ? c.coral : done ? c.sage : c.line, backgroundColor: done ? c.sage : 'transparent', borderStyle: future ? 'dashed' : 'solid', opacity: future ? 0.6 : 1 }} />
                  </View>
                );
              })}
            </View>
          </View>
        ))}
        <View style={{ flexDirection: 'row' }}>
          {DAYS.map((d) => (
            <Txt key={d} variant="small" center style={{ flex: 1 }}>
              {d}
            </Txt>
          ))}
        </View>
        <Txt variant="small">Missed days are fine. Tomorrow starts fresh.</Txt>
      </Section>

      <Card>
        <Field
          label="Note for today"
          multiline
          value={note}
          onChangeText={setNote}
          onBlur={() => {
            if (!noteError) update((s) => void (s.logs.notes[k] = note));
          }}
          placeholder="Slept badly, skipped the walk. Office dinner tonight."
          error={noteError}
          maxLength={520}
        />
        <Row between>
          <Txt variant="small">Only you see notes.</Txt>
          <Button label="Save note" kind="soft" small disabled={!!noteError} onPress={() => update((s) => void (s.logs.notes[k] = note))} />
        </Row>
      </Card>

      {pastNotes.length ? (
        <Section title="Recent notes">
          {pastNotes.map(([d, n], i) => (
            <ListItem key={d} first={i === 0}>
              <View style={{ flex: 1 }}>
                <Txt variant="small" bold>{fmtDate(parseKey(d))}</Txt>
                <Txt>{n}</Txt>
              </View>
            </ListItem>
          ))}
        </Section>
      ) : null}

      <Button label="Change my habits" kind="ghost" block onPress={() => router.push('/edit-habits')} />
    </Screen>
  );
}
