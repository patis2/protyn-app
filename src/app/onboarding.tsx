import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { View } from 'react-native';
import { ALLERGENS, DAYS, GOALS, HABITS, HEALTH_FLAGS, MEAT_STAPLES, STAPLES } from '../content/library';
import { useStore } from '../data/store';
import { keyOf } from '../domain/dates';
import { cuisineLabel, proteinRange } from '../domain/nutrition';
import { provider } from '../domain/provider';
import { ALLERGEN_NOTE, goalNotice, isGentle, PROFESSIONAL_NOTE } from '../domain/safety';
import type { Profile } from '../domain/types';
import { SLOT_LABEL, SLOTS } from '../domain/types';
import { parseAvoid, stepError, type StepKey } from '../domain/validation';
import { Button, Card, Chip, Choice, Choices, Field, IconButton, LinkButton, ListItem, Note, ProgressBar, Row, Screen, Segmented, Txt } from '../ui/components';

const STEPS: { key: StepKey; title: string; why: string; optional?: boolean }[] = [
  { key: 'about', title: 'About you', why: 'Height, weight and age set a safe protein range and workout level. Waist is optional and is never shown on your dashboard unless you turn measurements on.' },
  { key: 'goal', title: 'Your goal', why: 'Your goal decides where your protein range sits and what your sessions focus on. You can change it any time.' },
  { key: 'activity', title: 'Activity', why: 'We start easier than you might expect, then adjust after your first few check-ins.' },
  { key: 'food', title: 'Food', why: 'Diet, allergies and foods to avoid are hard filters. A dish that breaks them is never shown, even as a swap.' },
  { key: 'workouts', title: 'Workouts', why: 'We only plan exercises you can do with what you have, on the days that suit you.' },
  { key: 'habits', title: 'Habits', why: 'Pick as many habits as you want to work on. Your current sleep and water help us pick sensible starting points.', optional: true },
  { key: 'health', title: 'Health check', why: 'These answers turn on gentler defaults and a prompt to see a professional. They never block you. On phones they are stored in the device’s secure storage, and they are never sent to our servers or used for ads.', optional: true },
  { key: 'preview', title: 'Your plan', why: '' },
];

export default function Onboarding() {
  const { edit } = useLocalSearchParams<{ edit?: string }>();
  const editing = edit === '1';
  const { state, update } = useStore();
  const [p, setP] = useState<Profile>(() => JSON.parse(JSON.stringify(state.profile)));
  const [i, setI] = useState(0);
  const [tried, setTried] = useState(false);
  const [showWhy, setShowWhy] = useState(false);
  const [avoidText, setAvoidText] = useState(p.avoidFoods.join(', '));
  const step = STEPS[i];
  const error = stepError(step.key, p);

  const set = <K extends keyof Profile>(k: K, v: Profile[K]) => setP((prev) => ({ ...prev, [k]: v }));
  const toggle = <K extends 'allergies' | 'equipment' | 'habits' | 'health' | 'unavailable'>(k: K, v: Profile[K][number]) =>
    setP((prev) => {
      const arr = prev[k] as string[];
      const next = arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v];
      return { ...prev, [k]: next, ...(k === 'allergies' ? { allergiesConfirmed: true } : {}) };
    });
  const toggleDay = (d: number) => set('workoutDays', p.workoutDays.includes(d) ? p.workoutDays.filter((x) => x !== d) : [...p.workoutDays, d].sort());

  const finish = () => {
    update((s) => {
      const today = keyOf(new Date());
      const record = (kind: 'weight' | 'waist', raw: string, before: string) => {
        if (!raw.trim() || (s.onboarded && raw === before)) return;
        s.logs.measurements = s.logs.measurements.filter((m) => !(m.kind === kind && m.date === today));
        s.logs.measurements.push({ date: today, kind, value: Number(raw) });
      };
      record('weight', p.weightKg, s.profile.weightKg);
      record('waist', p.waistCm, s.profile.waistCm);
      s.profile = { ...p, avoidFoods: parseAvoid(avoidText), startedAt: s.onboarded ? s.profile.startedAt : today };
      if (!s.settings.consents.health) s.profile.health = [];
      if (p.place === 'gym') s.settings.moveMode = 'gym';
      s.onboarded = true;
      if (s.mode === 'none') s.mode = 'local';
    });
    router.replace(editing ? '/me' : '/today');
  };

  const next = () => {
    if (step.key === 'food') set('avoidFoods', parseAvoid(avoidText));
    if (error) return setTried(true);
    setTried(false);
    setShowWhy(false);
    if (i === STEPS.length - 1) finish();
    else setI(i + 1);
  };
  const back = () => {
    setTried(false);
    setShowWhy(false);
    if (i === 0) router.replace(editing ? '/me' : '/welcome');
    else setI(i - 1);
  };

  const body = (() => {
    switch (step.key) {
      case 'about':
        return (
          <>
            <Field label="First name or display name" value={p.name} onChangeText={(v) => set('name', v)} autoComplete="given-name" maxLength={40} />
            <Row wrap gap={12} align="flex-start">
              <Field label="Birth year" value={p.birthYear} onChangeText={(v) => set('birthYear', v.replace(/\D/g, ''))} inputMode="numeric" keyboardType="number-pad" maxLength={4} placeholder="e.g. 1995" />
              <Field label="Height (cm)" value={p.heightCm} onChangeText={(v) => set('heightCm', v.replace(/[^\d.]/g, ''))} inputMode="decimal" keyboardType="decimal-pad" placeholder="e.g. 160" />
            </Row>
            <Row wrap gap={12} align="flex-start">
              <Field label="Weight (kg)" value={p.weightKg} onChangeText={(v) => set('weightKg', v.replace(/[^\d.]/g, ''))} inputMode="decimal" keyboardType="decimal-pad" placeholder="e.g. 62" />
              <Field label="Waist (cm)" optional value={p.waistCm} onChangeText={(v) => set('waistCm', v.replace(/[^\d.]/g, ''))} inputMode="decimal" keyboardType="decimal-pad" />
            </Row>
          </>
        );
      case 'goal':
        return (
          <>
            <Choices column>
              {GOALS.map((g) => (
                <Choice key={g.id} label={g.name} sub={g.detail} on={p.goal === g.id} onPress={() => set('goal', g.id)} full />
              ))}
            </Choices>
            <Field label="Your own “why”" optional value={p.why} onChangeText={(v) => set('why', v)} placeholder="Keep up with my kids" maxLength={80} />
          </>
        );
      case 'activity':
        return (
          <>
            <Txt variant="card">How active are you on a normal day?</Txt>
            <Choices column>
              <Choice label="Mostly sitting" sub="Desk job, little walking" on={p.activity === 'low'} onPress={() => set('activity', 'low')} full />
              <Choice label="Lightly active" sub="Some walking or chores" on={p.activity === 'light'} onPress={() => set('activity', 'light')} full />
              <Choice label="Active" sub="On my feet or exercise often" on={p.activity === 'active'} onPress={() => set('activity', 'active')} full />
            </Choices>
            <Txt variant="card">Strength training experience</Txt>
            <Segmented label="Experience" value={p.experience || undefined} onChange={(v) => set('experience', v)} options={[['beginner', 'New to it'], ['some', 'Some'], ['regular', 'Regular']]} />
            <Txt variant="card">Minutes you can give on workout days</Txt>
            <Segmented label="Minutes" value={p.minutes} onChange={(v) => set('minutes', v)} options={[['10', '10 min'], ['20', '20 min'], ['30', '30 min']]} />
          </>
        );
      case 'food':
        return (
          <>
            <Txt variant="card">What do you eat?</Txt>
            <Choices>
              <Choice half label="Vegetarian" sub="With dairy" on={p.diet === 'veg'} onPress={() => set('diet', 'veg')} />
              <Choice half label="Eggetarian" sub="Vegetarian plus eggs" on={p.diet === 'egg'} onPress={() => set('diet', 'egg')} />
              <Choice half label="Non-vegetarian" sub="Chicken, fish, mutton and eggs" on={p.diet === 'nonveg'} onPress={() => set('diet', 'nonveg')} />
              <Choice half label="Jain" sub="No root vegetables" on={p.diet === 'jain'} onPress={() => set('diet', 'jain')} />
              <Choice half label="Vegan" sub="No dairy or eggs" on={p.diet === 'vegan'} onPress={() => set('diet', 'vegan')} />
            </Choices>
            <Txt variant="card">Your home cooking</Txt>
            <Choices>
              {(['N', 'S', 'E', 'W'] as const).map((cu) => (
                <Choice half key={cu} label={cuisineLabel(cu)} on={p.cuisine === cu} onPress={() => set('cuisine', cu)} />
              ))}
            </Choices>
            <Txt variant="card">Allergies</Txt>
            <Choices>
              {ALLERGENS.map(([a, l]) => (
                <Choice multi key={a} label={l} on={p.allergies.includes(a)} onPress={() => toggle('allergies', a)} />
              ))}
              <Choice label="No allergies" on={p.allergiesConfirmed && !p.allergies.length} onPress={() => setP((prev) => ({ ...prev, allergies: [], allergiesConfirmed: true }))} />
            </Choices>
            <Field label="Any other allergy" optional value={p.otherAllergy} onChangeText={(v) => set('otherAllergy', v)} placeholder="For example, mustard" hint="We can’t filter for this automatically yet, so add the food below as well." maxLength={80} />
            <Field label="Foods you don’t eat or want to avoid" optional value={avoidText} onChangeText={setAvoidText} placeholder="For example: mushroom, brinjal" hint="Separate with commas. Dishes containing these are left out." />
            <Txt variant="card">Hard to get where you live?</Txt>
            <Txt variant="small">We’ll plan fewer meals around these.</Txt>
            <Choices>
              {STAPLES.filter(([v]) => p.diet === 'nonveg' || !MEAT_STAPLES.includes(v)).map(([v, l]) => (
                <Choice multi key={v} label={l} on={p.unavailable.includes(v)} onPress={() => toggle('unavailable', v)} />
              ))}
            </Choices>
            <Note>{ALLERGEN_NOTE}</Note>
          </>
        );
      case 'workouts':
        return (
          <>
            <Txt variant="card">Where will you work out?</Txt>
            <Segmented label="Where" value={p.place || undefined} onChange={(v) => set('place', v)} options={[['home', 'At home'], ['gym', 'At a gym'], ['both', 'Both']]} />
            <Txt variant="card">What do you have at home?</Txt>
            <Choices>
              {([['dumbbells', 'Dumbbells'], ['mat', 'Yoga mat'], ['band', 'Resistance band'], ['chair', 'Sturdy chair']] as const).map(([v, l]) => (
                <Choice multi key={v} label={l} on={p.equipment.includes(v)} onPress={() => toggle('equipment', v)} />
              ))}
            </Choices>
            <Note>Nothing at home? That’s fine. Every session has a no-equipment version.</Note>
            <Txt variant="card">Workout days</Txt>
            <Txt variant="small">Pick two to four. Rest days in between help you recover.</Txt>
            <Choices>
              {DAYS.map((d, idx) => (
                <Choice multi key={d} label={d} on={p.workoutDays.includes(idx)} onPress={() => toggleDay(idx)} />
              ))}
            </Choices>
          </>
        );
      case 'habits':
        return (
          <>
            <Txt variant="card">How much do you usually sleep?</Txt>
            <Segmented label="Sleep" value={p.sleep || undefined} onChange={(v) => set('sleep', v)} options={[['under6', '< 6 h'], ['6to7', '6–7 h'], ['7to8', '7–8 h'], ['over8', '8 h +']]} />
            <Txt variant="card">Glasses of water on a normal day</Txt>
            <Segmented label="Water" value={p.water || undefined} onChange={(v) => set('water', v)} options={[['low', '1–3'], ['mid', '4–6'], ['high', '7 or more']]} />
            <Txt variant="card">Habits to build</Txt>
            <Choices column>
              {HABITS.filter((h) => h.kind === 'build').map((h) => (
                <Choice multi full key={h.id} label={h.name} sub={h.type === 'count' ? `${h.goal} ${h.unit}` : undefined} on={p.habits.includes(h.id)} onPress={() => toggle('habits', h.id)} />
              ))}
            </Choices>
            <Txt variant="card">Habits to cut back on</Txt>
            <Choices column>
              {HABITS.filter((h) => h.kind === 'reduce').map((h) => (
                <Choice multi full key={h.id} label={h.name} on={p.habits.includes(h.id)} onPress={() => toggle('habits', h.id)} />
              ))}
            </Choices>
            <Txt variant="small">{p.habits.length} chosen. Pick as many as you like, and change them any time.</Txt>
          </>
        );
      case 'health':
        return (
          <>
            <Txt variant="muted">Tick anything that applies. This stays private.</Txt>
            <Choices column>
              {HEALTH_FLAGS.map(([v, l]) => (
                <Choice multi full key={v} label={l} on={p.health.includes(v)} onPress={() => toggle('health', v)} />
              ))}
            </Choices>
            <Field label="Anything else we should know?" optional multiline value={p.healthNote} onChangeText={(v) => set('healthNote', v)} placeholder="For example, a knee injury last year" maxLength={300} />
            {isGentle(p) ? <Note tone="why">We’ll use gentler defaults: fewer sets, easier options first, and no weight on your dashboard. Please check with your doctor before starting.</Note> : null}
            <Note>{PROFESSIONAL_NOTE}</Note>
          </>
        );
      case 'preview': {
        const [lo, hi] = proteinRange(p);
        const g = GOALS.find((x) => x.id === p.goal) ?? GOALS[0];
        const meals = provider.mealsForDay(p, {}, new Date());
        const notice = goalNotice(p);
        const days = p.workoutDays.map((d) => DAYS[d]).join(', ');
        return (
          <>
            <Card tint>
              <Txt variant="eyebrow">{p.name ? `${p.name}’s first week` : 'Your first week'}</Txt>
              <Txt variant="title">{g.name}</Txt>
              <Txt>
                {p.workoutDays.length} strength sessions of {p.minutes} minutes, {p.place === 'gym' ? 'at the gym' : p.place === 'both' ? 'at home or the gym' : 'at home'}, on {days}.
              </Txt>
            </Card>
            {notice ? <Note tone="why">{notice}</Note> : null}
            <Card>
              <Row between>
                <Txt variant="card">Daily protein</Txt>
                <Chip label={`${lo}–${hi} g`} />
              </Row>
              <Txt variant="small">A range, not a target to hit exactly. Estimated from your weight and goal, and to be reviewed by a dietitian.</Txt>
            </Card>
            <Card>
              <Txt variant="card">A sample day</Txt>
              {SLOTS.map((s, idx) => {
                const d = meals[s];
                return d ? (
                  <ListItem key={s} first={idx === 0}>
                    <View style={{ flex: 1 }}>
                      <Txt variant="slot">{SLOT_LABEL[s]}</Txt>
                      <Txt>{d.name}</Txt>
                      <Txt variant="small">{d.portion}</Txt>
                    </View>
                    <Txt variant="small">{d.protein} g</Txt>
                  </ListItem>
                ) : null;
              })}
            </Card>
            <Txt variant="small">General wellness guidance, not medical advice. Plans are not clinically validated.</Txt>
          </>
        );
      }
    }
  })();

  return (
    <Screen
      footer={
        step.key === 'preview' ? (
          <>
            <Button label="Adjust" kind="ghost" flex onPress={back} />
            <Button label={editing ? 'Save changes' : 'Looks good'} flex onPress={next} />
          </>
        ) : (
          <Button label="Continue" flex onPress={next} />
        )
      }
    >
      <Row between>
        <IconButton icon="back" label="Back" onPress={back} />
        <Txt variant="small">
          Step {i + 1} of {STEPS.length}
        </Txt>
        {step.optional ? (
          <LinkButton label="Skip" onPress={() => { setTried(false); setI(i + 1); }} hint="Skip this optional step" />
        ) : (
          <View style={{ width: 40 }} />
        )}
      </Row>
      <ProgressBar pct={((i + 1) / STEPS.length) * 100} label={`Step ${i + 1} of ${STEPS.length}`} />
      <Txt variant="screen">{editing && i === 0 ? 'Edit your answers' : step.title}</Txt>
      {body}
      {step.why ? (
        <>
          <LinkButton label={showWhy ? 'Hide why we ask' : 'Why we ask'} onPress={() => setShowWhy(!showWhy)} />
          {showWhy ? <Note tone="why">{step.why}</Note> : null}
        </>
      ) : null}
      {tried && error ? <Note tone="error">{error}</Note> : null}
    </Screen>
  );
}
