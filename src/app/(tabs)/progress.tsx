import { router } from 'expo-router';
import React from 'react';
import { Platform, Share, View } from 'react-native';
import { useStore, useToday } from '../../data/store';
import { fmtDate, parseKey } from '../../domain/dates';
import { proteinRange } from '../../domain/nutrition';
import { hideWeight } from '../../domain/safety';
import { history, weekMessage, weekNumber } from '../../domain/stats';
import type { MeasureKind } from '../../domain/types';
import { MEASURE_LABEL, measureUnit } from '../../domain/validation';
import { Button, Card, Choice, Choices, Header, Note, Row, Screen, Section, Toggle, Txt } from '../../ui/components';
import { BarChart, LineChart } from '../../ui/charts';
import { MeButton } from '../../ui/pieces';
import { useColors, useToast } from '../../ui/theme';

const KINDS: MeasureKind[] = ['weight', 'waist', 'hips', 'chest', 'arm'];

export default function Progress() {
  const c = useColors();
  const toast = useToast();
  const today = useToday();
  const { state, update } = useStore();
  const p = state.profile;
  const hist = history(state, today);
  const cur = hist[hist.length - 1];
  const labels = hist.map((h) => h.label);
  const total = state.logs.sessions.length;
  const wk = weekNumber(state, today);
  const kinds = state.settings.tracked.filter((k) => !(k === 'weight' && hideWeight(p)));
  const energy = hist.filter((h) => h.energy != null);

  const share = async () => {
    const text = `I’ve done ${total} strength sessions in ${wk} week${wk > 1 ? 's' : ''} with Protyn.`;
    try {
      if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(text);
        toast(`Copied: ${text}`);
      } else await Share.share({ message: text });
    } catch {
      toast(text);
    }
  };

  return (
    <Screen>
      <Header title="Progress" eyebrow={`Week ${wk}`} right={<MeButton />} />
      <Section title="Weekly summary" tint>
        <Row between>
          <Txt>Strength sessions</Txt>
          <Txt bold>
            {cur.sessions} of {cur.planned} so far
          </Txt>
        </Row>
        <Row between>
          <Txt>Days with protein in range</Txt>
          <Txt bold>
            {cur.proteinDays} of {cur.days}
          </Txt>
        </Row>
        <Row between>
          <Txt>Habits kept</Txt>
          <Txt bold>{cur.habitPct}%</Txt>
        </Row>
        <Txt color={c.sageDeep}>{weekMessage(cur)}</Txt>
      </Section>

      <Card>
        <Row between>
          <Txt variant="card">Strength sessions per week</Txt>
          <Txt variant="small">Plan: {p.workoutDays.length}</Txt>
        </Row>
        <BarChart title="Strength sessions per week" values={hist.map((h) => h.sessions)} labels={labels} max={Math.max(p.workoutDays.length, ...hist.map((h) => h.sessions))} target={p.workoutDays.length} unit="sessions" />
      </Card>
      <Card>
        <Txt variant="card">Days with protein in range</Txt>
        <BarChart title="Days with protein in range" values={hist.map((h) => h.proteinDays)} labels={labels} max={7} unit="days" />
        <Txt variant="small">Range {proteinRange(p).join('–')} g a day.</Txt>
      </Card>
      <Card>
        <Txt variant="card">Habits kept</Txt>
        {hist.length > 1 ? <LineChart title="Habits kept" points={hist.map((h) => h.habitPct)} labels={labels} min={0} max={100} unit="%" /> : <Txt variant="small">Your trend appears after your second week.</Txt>}
      </Card>
      {energy.length > 1 ? (
        <Card>
          <Txt variant="card">Average energy</Txt>
          <LineChart title="Average energy, 1 is low and 3 is good" points={energy.map((h) => Math.round((h.energy ?? 0) * 10) / 10)} labels={energy.map((h) => h.label)} min={1} max={3} unit="" decimals={1} />
          <Txt variant="small">From your daily check-ins. 1 is low, 3 is good.</Txt>
        </Card>
      ) : null}

      <Card>
        <Toggle
          label="Measurements"
          detail="Off by default. Turn on only if it helps you. Weight is only one measure of progress."
          value={state.settings.showMeasurements}
          onChange={(v) => update((s) => void (s.settings.showMeasurements = v))}
        />
        {state.settings.showMeasurements ? (
          <>
            {hideWeight(p) ? <Note tone="why">Weight tracking stays hidden because of your health check answers. You can still track other measurements.</Note> : null}
            <Txt variant="small">Choose what to track</Txt>
            <Choices>
              {KINDS.filter((k) => !(k === 'weight' && hideWeight(p))).map((k) => (
                <Choice
                  multi
                  key={k}
                  label={MEASURE_LABEL[k]}
                  on={state.settings.tracked.includes(k)}
                  onPress={() =>
                    update((s) => {
                      s.settings.tracked = s.settings.tracked.includes(k) ? s.settings.tracked.filter((x) => x !== k) : [...s.settings.tracked, k];
                    })
                  }
                />
              ))}
            </Choices>
            {kinds.map((k) => {
              const rows = state.logs.measurements.filter((m) => m.kind === k).sort((a, b) => a.date.localeCompare(b.date));
              return (
                <View key={k} style={{ gap: 6 }}>
                  <Row between>
                    <Txt variant="card">
                      {MEASURE_LABEL[k]} ({measureUnit(k)})
                    </Txt>
                    {rows.length ? <Txt variant="small">Latest {rows[rows.length - 1].value}</Txt> : null}
                  </Row>
                  {rows.length > 1 ? (
                    <LineChart title={`${MEASURE_LABEL[k]} over time`} points={rows.map((r) => r.value)} labels={rows.map((r) => fmtDate(parseKey(r.date)))} unit={measureUnit(k)} decimals={1} />
                  ) : (
                    <Txt variant="small">{rows.length ? 'Add another entry to see a trend.' : 'No entries yet.'}</Txt>
                  )}
                </View>
              );
            })}
            <Button label="Add a measurement" kind="soft" onPress={() => router.push('/measure')} />
            <Txt variant="small">Measurements go up and down day to day. Strength and energy often change first.</Txt>
          </>
        ) : null}
      </Card>

      <View style={{ borderRadius: 20, padding: 20, backgroundColor: c.sageDeep, gap: 6 }}>
        <Txt variant="eyebrow" color={c.bg}>Milestone</Txt>
        <Txt variant="big" color={c.bg}>{total}</Txt>
        <Txt color={c.bg}>
          strength sessions in {wk} week{wk > 1 ? 's' : ''}
        </Txt>
        <Button label="Share" small kind="soft" onPress={share} hint="Shares your session count only, never weight or photos" />
        <Txt variant="small" color={c.bg}>Shares sessions only. Never weight or photos.</Txt>
      </View>
    </Screen>
  );
}
