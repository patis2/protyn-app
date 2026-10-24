import { router } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { View } from 'react-native';
import { CONTENT_VERSION } from '../../content/dishes';
import { DAYS, GOALS, HABIT_BY_ID } from '../../content/library';
import { syncReminders, remindersSupported } from '../../data/reminders';
import { useStore } from '../../data/store';
import { signOut } from '../../data/supabase';
import { allergenLabel, cuisineLabel, dietLabel } from '../../domain/nutrition';
import { provider } from '../../domain/provider';
import { PROFESSIONAL_NOTE, STOP_NOTE, WELLNESS_NOTE } from '../../domain/safety';
import type { Reminders } from '../../domain/types';
import { Button, Card, Chip, Divider, Header, Row, Screen, Section, Segmented, Toggle, Txt } from '../../ui/components';
import { Icon } from '../../ui/icons';
import { useColors, useToast, useWide } from '../../ui/theme';

export default function Me() {
  const c = useColors();
  const wide = useWide();
  const toast = useToast();
  const { state, update, clearLocal } = useStore();
  const p = state.profile;
  const g = GOALS.find((x) => x.id === p.goal) ?? GOALS[0];
  const age = p.birthYear ? new Date().getFullYear() - Number(p.birthYear) : null;
  const r = state.settings.reminders;
  const cons = state.settings.consents;
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    syncReminders(r, p, cons.reminders).then((ok) => {
      if (!ok) toast('Notifications are off for Protyn in your phone settings, so reminders can’t be shown.');
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(r), cons.reminders, p.workoutDays.join()]);

  const setReminder = (k: keyof Reminders, v: boolean | string) => update((s) => void ((s.settings.reminders as Record<string, unknown>)[k] = v));

  const kv = (label: string, value: string) => (
    <Row between align="flex-start" key={label}>
      <Txt variant="muted">{label}</Txt>
      <Txt style={{ flex: 1, textAlign: 'right' }}>{value}</Txt>
    </Row>
  );

  return (
    <Screen>
      <Header title="Me" onBack={wide ? undefined : () => (router.canGoBack() ? router.back() : router.replace('/today'))} />
      <Card>
        <Row>
          <View style={{ width: 52, height: 52, borderRadius: 26, backgroundColor: c.sageSoft, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="user" color={c.sageDeep} />
          </View>
          <View style={{ flex: 1 }}>
            <Txt variant="card">{p.name}</Txt>
            <Txt variant="small">
              {age ?? '–'} · {dietLabel(p.diet)} · {cuisineLabel(p.cuisine)}
            </Txt>
          </View>
          {state.mode === 'demo' ? <Chip label="Demo" tone="amber" /> : state.mode === 'cloud' ? <Chip label="Synced" /> : <Chip label="On this device" tone="line" />}
        </Row>
        {kv('Goal', g.name)}
        {p.why ? kv('Your why', p.why) : null}
        {kv('Height', p.heightCm ? `${p.heightCm} cm` : '–')}
        {kv('Workouts', `${({ home: 'Home', gym: 'Gym', both: 'Home and gym' } as const)[p.place || 'home']}, ${p.workoutDays.map((d) => DAYS[d]).join(', ')}`)}
        {kv('Allergies', p.allergies.map(allergenLabel).join(', ') || 'None')}
        {p.avoidFoods.length ? kv('Avoiding', p.avoidFoods.join(', ')) : null}
        {kv('Habits', p.habits.map((h) => HABIT_BY_ID[h]?.name).filter(Boolean).join(', ') || 'None')}
        <Row wrap>
          <Button label="Edit answers or goal" kind="ghost" small onPress={() => router.push({ pathname: '/onboarding', params: { edit: '1' } })} />
          <Button label="Add a measurement" kind="ghost" small onPress={() => router.push('/measure')} />
        </Row>
      </Card>

      <Section title="Reminders">
        {!remindersSupported ? <Txt variant="small">Reminders work in the phone app. On the web your choices are saved for when you use the app.</Txt> : null}
        <Toggle label="Workout days" detail={`${r.time === '07:00' ? '7:00 am' : r.time === '18:00' ? '6:00 pm' : '8:00 am'}, ${p.workoutDays.map((d) => DAYS[d]).join(', ')}`} value={r.workout} onChange={(v) => setReminder('workout', v)} />
        {r.workout ? <Segmented label="Workout reminder time" value={r.time} onChange={(v) => setReminder('time', v)} options={[['07:00', '7 am'], ['08:00', '8 am'], ['18:00', '6 pm']]} /> : null}
        <Divider />
        <Toggle label="Meal plan" detail="Evening before, 8:00 pm" value={r.meals} onChange={(v) => setReminder('meals', v)} />
        <Divider />
        <Toggle label="Habit check-in" detail="9:00 pm" value={r.habits} onChange={(v) => setReminder('habits', v)} />
        <Divider />
        <Toggle label="Weekly summary" detail="Sunday 6:00 pm" value={r.summary} onChange={(v) => setReminder('summary', v)} />
        <Txt variant="small">Quiet hours are 10 pm to 7 am. Reminders are encouraging and never mention weight.</Txt>
      </Section>

      <Section title="Privacy and data">
        <Row between>
          <View style={{ flex: 1 }}>
            <Txt>Use my profile to build my plan</Txt>
            <Txt variant="small">Needed for the app to work</Txt>
          </View>
          <Chip label="Required" />
        </Row>
        <Divider />
        <Toggle
          label="Use my health check answers"
          detail={cons.health ? 'Turns on gentler defaults. Turning this off deletes your health answers.' : 'Off. Your health answers have been deleted.'}
          value={cons.health}
          onChange={(v) =>
            update((s) => {
              s.settings.consents.health = v;
              if (!v) {
                s.profile.health = [];
                s.profile.healthNote = '';
              }
            })
          }
        />
        <Divider />
        <Toggle label="Reminders" detail="Lets Protyn send the reminders above" value={cons.reminders} onChange={(v) => update((s) => void (s.settings.consents.reminders = v))} />
        <Divider />
        <Toggle label="Anonymous product analytics" detail="Off by default. This version doesn’t collect any analytics." value={cons.analytics} onChange={(v) => update((s) => void (s.settings.consents.analytics = v))} />
        <Divider />
        <Row between>
          <Txt>Advertising</Txt>
          <Chip label="None, ever" tone="line" />
        </Row>
        <Txt variant="small">
          {state.mode === 'cloud'
            ? 'Your plan and logs are stored in your account in India and protected so only you can read them. Health answers stay on this device.'
            : 'Your data is stored only on this device. On phones, health answers are kept in secure storage.'}
        </Txt>
        <Row wrap>
          <Button label="Export my data" kind="ghost" small onPress={() => router.push('/export')} />
          <Button label={state.mode === 'demo' ? 'Leave demo' : 'Delete my data'} kind="ghost" small color={c.coralInk} onPress={() => router.push('/delete')} />
          {state.mode === 'cloud' ? (
            <Button
              label="Sign out"
              kind="ghost"
              small
              onPress={async () => {
                await signOut();
                await clearLocal();
                router.replace('/welcome');
              }}
            />
          ) : null}
        </Row>
        <Txt variant="small">Export and deletion are free. A named grievance contact for data questions will be listed here before launch.</Txt>
      </Section>

      <Section title="Safety">
        <Txt variant="small">{WELLNESS_NOTE} Protyn is not a substitute for a doctor, dietitian or qualified fitness professional. Plans are not clinically validated.</Txt>
        <Txt variant="small">{STOP_NOTE}</Txt>
        <Txt variant="small">{PROFESSIONAL_NOTE}</Txt>
      </Section>
      <Txt variant="small" center>
        Plans by {provider.id} · content {CONTENT_VERSION}
      </Txt>
    </Screen>
  );
}
