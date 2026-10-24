import { router } from 'expo-router';
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { DAYS } from '../content/library';
import { useStore } from '../data/store';
import { daysBetween, keyOf, weekDays, weekStart } from '../domain/dates';
import { proteinRange } from '../domain/nutrition';
import { provider } from '../domain/provider';
import { habitDone, proteinOn } from '../domain/stats';
import type { Reward } from '../domain/rewards';
import type { CheckIn, HabitDef, Slot } from '../domain/types';
import { SLOT_LABEL } from '../domain/types';
import { sessionForDate, sessionOn } from '../domain/workouts';
import { Choice, IconButton, ListItem, Segmented, Tick, Txt } from './components';
import { Icon } from './icons';
import { useColors } from './theme';
import { font } from './tokens';

// Pieces that know about Protyn's data: meal rows, habit chips, the check-in
// and the week dots. Shared by Today, Food and Habits.

export function MealRow({ date, slot, first, today }: { date: Date; slot: Slot; first?: boolean; today: Date }) {
  const c = useColors();
  const { state, update } = useStore();
  const dish = provider.mealsForDay(state.profile, state.logs.swaps, date)[slot];
  if (!dish) return null;
  const k = keyOf(date);
  const on = !!state.logs.eaten[k]?.[slot];
  const canLog = daysBetween(date, today) >= 0;
  const open = () => router.push({ pathname: '/recipe', params: { date: k, slot } });
  return (
    <ListItem first={first}>
      <View style={{ flex: 1, gap: 1 }}>
        <Txt variant="slot">{SLOT_LABEL[slot]}</Txt>
        <Pressable accessibilityRole="button" accessibilityLabel={`${dish.name}, open recipe`} onPress={open}>
          <Text style={{ fontFamily: font.bodyMedium, fontSize: 15, color: c.ink }}>{dish.name}</Text>
        </Pressable>
        <Txt variant="small">
          {dish.portion} · {dish.protein} g protein
        </Txt>
      </View>
      {canLog ? (
        <Tick
          on={on}
          label={`Eaten: ${dish.name}`}
          onPress={() =>
            update((s) => {
              s.logs.eaten[k] = { ...(s.logs.eaten[k] ?? {}), [slot]: !on };
            })
          }
        />
      ) : null}
    </ListItem>
  );
}

export function HabitChip({ h, date }: { h: HabitDef; date: Date }) {
  const { state, update } = useStore();
  const k = keyOf(date);
  const v = state.logs.habits[k]?.[h.id];
  const done = habitDone(state, date, h);
  const tap = () =>
    update((s) => {
      const day = (s.logs.habits[k] = s.logs.habits[k] ?? {});
      day[h.id] = h.type === 'count' ? Math.min(Number(day[h.id] || 0) + 1, h.goal ?? 8) : !day[h.id];
    });
  if (h.type === 'count') return <Choice multi on={done} onPress={tap} label={`${Number(v || 0)}/${h.goal} ${h.unit}`} sub="Tap to add a glass" />;
  return <Choice multi on={done} onPress={tap} label={h.name} />;
}

export function CheckInCard({ date }: { date: Date }) {
  const { state, update } = useStore();
  const k = keyOf(date);
  const ci: CheckIn = state.logs.checkins[k] ?? {};
  const set = (f: keyof CheckIn, v: string) =>
    update((s) => {
      s.logs.checkins[k] = { ...(s.logs.checkins[k] ?? {}), [f]: v };
    });
  const lv: ['low' | 'ok' | 'good', string][] = [['low', 'Low'], ['ok', 'OK'], ['good', 'Good']];
  return (
    <View style={{ gap: 10 }}>
      <View style={{ gap: 6 }}>
        <Txt variant="small" bold color={undefined}>Energy</Txt>
        <Segmented label="Energy" value={ci.energy} onChange={(v) => set('energy', v)} options={lv} />
      </View>
      <View style={{ gap: 6 }}>
        <Txt variant="small" bold>Mood</Txt>
        <Segmented label="Mood" value={ci.mood} onChange={(v) => set('mood', v)} options={lv} />
      </View>
      <View style={{ gap: 6 }}>
        <Txt variant="small" bold>Plan difficulty</Txt>
        <Segmented label="Plan difficulty" value={ci.diff} onChange={(v) => set('diff', v)} options={[['easy', 'Too easy'], ['right', 'Just right'], ['hard', 'Too hard']]} />
      </View>
      {ci.diff === 'hard' ? (
        <Txt variant="small">Thanks for saying so. Your next session starts with easier options.</Txt>
      ) : ci.diff === 'easy' ? (
        <Txt variant="small">Good to know. After two easy sessions, we’ll suggest harder options.</Txt>
      ) : ci.energy === 'low' ? (
        <Txt variant="small">Low energy days happen. Today’s session will start with easier options, or rest if you need to.</Txt>
      ) : ci.energy ? (
        <Txt variant="small">Saved. Missed a day? Tomorrow starts fresh.</Txt>
      ) : null}
    </View>
  );
}

/** Seven dots for the week. Full: protein in range and any planned session done. Half: one of the two. */
export function WeekDots({ today }: { today: Date }) {
  const c = useColors();
  const { state } = useStore();
  const [lo] = proteinRange(state.profile);
  const days = weekDays(weekStart(today));
  return (
    <View style={{ gap: 8 }}>
      <View style={{ flexDirection: 'row' }}>
        {days.map((d, i) => {
          const future = daysBetween(d, today) < 0;
          const planned = !!sessionForDate(state.profile, d);
          const ses = !!sessionOn(state.logs.sessions, d);
          const pr = proteinOn(state, d) >= lo;
          const full = (ses || !planned) && pr;
          const half = !full && (ses || pr);
          const isToday = keyOf(d) === keyOf(today);
          const status = future ? 'coming up' : full ? 'protein in range and session done' : half ? 'partly done' : 'not logged';
          return (
            <View key={i} style={{ flex: 1, alignItems: 'center', gap: 4 }} accessibilityLabel={`${DAYS[i]}: ${status}`}>
              <Text style={{ fontSize: 11, color: c.muted, fontFamily: font.body }}>{DAYS[i]}</Text>
              <View
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 12,
                  borderWidth: isToday ? 2 : 1.5,
                  borderColor: isToday ? c.coral : full || half ? c.sage : c.line,
                  borderStyle: future ? 'dashed' : 'solid',
                  opacity: future ? 0.6 : 1,
                  overflow: 'hidden',
                  flexDirection: 'row',
                }}
              >
                {full ? <View style={{ flex: 1, backgroundColor: c.sage }} /> : half ? <><View style={{ flex: 1, backgroundColor: c.sage }} /><View style={{ flex: 1 }} /></> : null}
              </View>
            </View>
          );
        })}
      </View>
      <Txt variant="small">Full dot: protein in range and any planned session done. Half: one of the two. Missed days are fine.</Txt>
    </View>
  );
}

export function MeButton() {
  return <IconButton icon="user" label="Me, profile and privacy" onPress={() => router.navigate('/me')} />;
}

/** Milestone badges. Earned ones open a shareable card; locked ones show how close you are. */
export function RewardBadges({ list }: { list: Reward[] }) {
  const c = useColors();
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
      {list.map((r) => (
        <Pressable
          key={r.id}
          accessibilityRole="button"
          accessibilityLabel={r.earned ? `${r.title}, earned. Open to share.` : `${r.title}, locked. ${Math.round(r.progress * 100)}% there.`}
          onPress={() => router.push({ pathname: '/reward', params: { id: r.id } })}
          style={({ pressed }) => [{ width: 96, alignItems: 'center', gap: 6, opacity: pressed ? 0.8 : 1 }]}
        >
          <View style={{ width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', backgroundColor: r.earned ? c.hero : c.sunk, borderWidth: 3, borderColor: r.earned ? c.coral : c.line }}>
            {r.earned ? (
              <Txt color={c.onHero} style={{ fontFamily: font.displayBold, fontSize: 20, lineHeight: 24 }}>{r.figure}</Txt>
            ) : (
              <Icon name={r.icon} size={24} color={c.muted} />
            )}
          </View>
          <Txt variant="small" center color={r.earned ? c.ink : c.muted} numberOfLines={2}>
            {r.title}
          </Txt>
        </Pressable>
      ))}
    </View>
  );
}
