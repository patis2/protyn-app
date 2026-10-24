import { router } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { DAYS, SESSIONS } from '../../content/library';
import { useStore, useToday } from '../../data/store';
import { daysBetween, keyOf, weekStart } from '../../domain/dates';
import { provider } from '../../domain/provider';
import { isGentle, STOP_NOTE } from '../../domain/safety';
import { buildSession, sessionOn, workoutMode } from '../../domain/workouts';
import { Button, Card, Chip, Header, ListItem, Note, Row, Screen, Segmented, Txt } from '../../ui/components';
import { Icon } from '../../ui/icons';
import { MeButton } from '../../ui/pieces';
import { useColors } from '../../ui/theme';

export default function Move() {
  const c = useColors();
  const today = useToday();
  const { state, update } = useStore();
  const p = state.profile;
  const mode = workoutMode(p, state.settings.moveMode);
  const week = provider.workoutWeek(p, weekStart(today));
  const [open, setOpen] = useState<string | null>(null);
  const kit = mode === 'gym' ? 'Gym' : p.equipment.includes('dumbbells') ? 'Home with dumbbells' : 'Home, no equipment';

  return (
    <Screen>
      <Header title="Workout plan" eyebrow={`${p.workoutDays.length} × ${p.minutes} min · ${kit}`} right={<MeButton />} />
      {p.place === 'both' ? (
        <Segmented
          label="Where"
          value={state.settings.moveMode}
          onChange={(v) => update((s) => void (s.settings.moveMode = v))}
          options={[['home', 'Home'], ['gym', 'Gym']]}
        />
      ) : null}
      <Card style={{ gap: 0 }}>
        {week.map(({ date, session }, i) => {
          const done = sessionOn(state.logs.sessions, date);
          const isToday = keyOf(date) === keyOf(today);
          const past = daysBetween(date, today) > 0;
          return (
            <ListItem key={i} first={i === 0}>
              <View style={{ width: 44 }}>
                <Txt bold color={isToday ? undefined : c.muted}>{DAYS[i]}</Txt>
                <Txt variant="small">{date.getDate()}</Txt>
              </View>
              <View style={{ flex: 1 }}>
                {session ? (
                  <>
                    <Txt variant="card">{session.name}</Txt>
                    <Txt variant="small">{session.focus}</Txt>
                  </>
                ) : (
                  <>
                    <Txt variant="muted">Rest day</Txt>
                    <Txt variant="small">Optional walk or stretching</Txt>
                  </>
                )}
              </View>
              {session ? (
                done ? (
                  <Chip label="Done" />
                ) : daysBetween(date, today) >= 0 ? (
                  <Button
                    label={past ? 'Do now' : 'Start'}
                    kind={isToday ? 'primary' : 'ghost'}
                    small
                    hint={`Start ${session.name}`}
                    onPress={() => router.push({ pathname: '/workout', params: { date: keyOf(past ? today : date), session: session.id } })}
                  />
                ) : null
              ) : null}
            </ListItem>
          );
        })}
      </Card>
      {Object.values(SESSIONS).map((t) => {
        const plan = buildSession(p, t, mode, state.logs.sessions);
        const expanded = open === t.id;
        return (
          <Card key={t.id}>
            <Pressable accessibilityRole="button" accessibilityState={{ expanded }} accessibilityLabel={`${t.name}, ${t.focus}. ${expanded ? 'Hide' : 'Show'} moves`} onPress={() => setOpen(expanded ? null : t.id)}>
              <Row between>
                <Txt variant="card">
                  {t.name} · {t.focus}
                </Txt>
                <Txt variant="small">{expanded ? 'Hide' : `${plan.moves.length} moves`}</Txt>
              </Row>
            </Pressable>
            {expanded
              ? plan.moves.map((m, j) => (
                  <Row key={m.ex.id + j} align="flex-start">
                    <View style={{ width: 26, height: 26, borderRadius: 13, backgroundColor: c.sageSoft, alignItems: 'center', justifyContent: 'center' }}>
                      <Txt variant="small" color={c.sageDeep} bold>{j + 1}</Txt>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Txt>{m.name}</Txt>
                      <Txt variant="small">
                        {m.sets} sets × {m.ex.reps} · rest 45 sec
                      </Txt>
                      <Txt variant="small">Easier: {m.ex.easier}. Harder: {m.ex.harder}.</Txt>
                    </View>
                  </Row>
                ))
              : null}
          </Card>
        );
      })}
      {isGentle(p) ? <Note tone="why">Gentler defaults are on: two sets per move and easier options first.</Note> : null}
      <Row gap={8} align="flex-start">
        <Icon name="shield" color={c.coralInk} size={20} />
        <Txt variant="small" style={{ flex: 1 }}>
          {STOP_NOTE} Protyn is not a substitute for a doctor or a qualified trainer. Exercises are pending review by a certified trainer.
        </Txt>
      </Row>
    </Screen>
  );
}
