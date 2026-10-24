import { router } from 'expo-router';
import React from 'react';
import { View } from 'react-native';
import { GOALS } from '../../content/library';
import { useStore, useToday } from '../../data/store';
import { fmtDate, greeting, keyOf } from '../../domain/dates';
import { proteinRange, proteinTip } from '../../domain/nutrition';
import { provider } from '../../domain/provider';
import { goalNotice, isGentle, WELLNESS_NOTE } from '../../domain/safety';
import { myHabits, proteinOn, weekNumber } from '../../domain/stats';
import { SLOTS } from '../../domain/types';
import { sessionOn, workoutMode } from '../../domain/workouts';
import { Button, Chip, Choices, Header, LinkButton, Meter, Note, Row, Screen, Section, Tick, Txt } from '../../ui/components';
import { CheckInCard, HabitChip, MealRow, MeButton, WeekDots } from '../../ui/pieces';

const FEEL = { easy: 'too easy', right: 'just right', hard: 'too hard' };

export default function Today() {
  const today = useToday();
  const { state } = useStore();
  const p = state.profile;
  const [lo, hi] = proteinRange(p);
  const got = proteinOn(state, today);
  const goal = GOALS.find((g) => g.id === p.goal) ?? GOALS[0];
  const mode = workoutMode(p, state.settings.moveMode);
  const plan = provider.session(p, today, mode, state.logs.sessions, state.logs.checkins[keyOf(today)]);
  const done = sessionOn(state.logs.sessions, today);
  const habits = myHabits(state);
  const notice = goalNotice(p);
  const start = (easier?: boolean) => router.push({ pathname: '/workout', params: { date: keyOf(today), ...(easier ? { easier: '1' } : {}) } });

  return (
    <Screen>
      <Header title={`${greeting(today)}, ${p.name || 'there'}`} eyebrow={`${fmtDate(today)} · Week ${weekNumber(state, today)}`} right={<MeButton />} />
      <Row wrap gap={6}>
        <Chip label={goal.name} />
        {isGentle(p) ? <Chip label="Gentler defaults on" tone="coral" /> : null}
      </Row>
      {p.why ? <Txt variant="muted">Your why: {p.why}</Txt> : null}
      {notice ? <Note tone="why">{notice}</Note> : null}

      <Section title="Today’s workout" label="Today’s workout">
        {!plan ? (
          <>
            <Txt variant="card">Rest day</Txt>
            <Txt variant="small">Rest helps you get stronger. A 10-minute walk after dinner still counts toward your habits.</Txt>
          </>
        ) : done ? (
          <Row>
            <Tick on label={`${plan.template.name} done`} onPress={() => start()} />
            <View style={{ flex: 1 }}>
              <Txt variant="card">{plan.template.name} done</Txt>
              <Txt variant="small">Felt {FEEL[done.feel]}. Nice work.</Txt>
            </View>
          </Row>
        ) : (
          <>
            <Row between>
              <View style={{ flex: 1 }}>
                <Txt variant="card">
                  {plan.minutes} min {mode === 'gym' ? 'gym' : 'home'} strength
                </Txt>
                <Txt variant="small">
                  {plan.template.name} · {plan.template.focus}
                  {plan.progression === 'easier' ? ' · easier version' : plan.progression === 'harder' ? ' · harder options offered' : ''}
                </Txt>
              </View>
              <Button label="Start" onPress={() => start()} hint={`Start ${plan.template.name}`} />
            </Row>
            {plan.progression !== 'easier' ? <LinkButton label="Short on energy? Start the easier version" onPress={() => start(true)} /> : null}
          </>
        )}
      </Section>

      <Section title="Protein today" right={<Button label="+ Plate check-in" kind="soft" small onPress={() => router.push('/plate')} />}>
        <Row gap={8} align="flex-end">
          <Txt variant="big">{got}</Txt>
          <Txt variant="muted" style={{ marginBottom: 4 }}>
            g of {lo}–{hi} g
          </Txt>
        </Row>
        <Meter value={got} lo={lo} hi={hi} />
        <Txt variant="small">{got >= lo ? 'You’re in your range today.' : `About ${lo - got} g to go. ${proteinTip(p)}`}</Txt>
      </Section>

      <Section title="Today’s meals" right={<LinkButton label="Week plan" onPress={() => router.navigate('/food')} />}>
        <View>
          {SLOTS.map((s, i) => (
            <MealRow key={s} date={today} slot={s} first={i === 0} today={today} />
          ))}
        </View>
      </Section>

      <Section title="Habits today" right={<LinkButton label="All habits" onPress={() => router.navigate('/habits')} />}>
        {habits.length ? (
          <Choices>
            {habits.map((h) => (
              <HabitChip key={h.id} h={h} date={today} />
            ))}
          </Choices>
        ) : (
          <Txt variant="small">No habits chosen yet. Pick a few on the Habits tab.</Txt>
        )}
      </Section>

      <Section title="How do you feel today?">
        <CheckInCard date={today} />
      </Section>

      <Section title="This week">
        <WeekDots today={today} />
      </Section>

      <Txt variant="small" center>
        {WELLNESS_NOTE}
      </Txt>
    </Screen>
  );
}
