import { router } from 'expo-router';
import React, { useState } from 'react';
import { useStore, useToday } from '../data/store';
import { keyOf } from '../domain/dates';
import { hideWeight } from '../domain/safety';
import type { MeasureKind } from '../domain/types';
import { MEASURE_LABEL, measurementError, measureUnit } from '../domain/validation';
import { Button, Choice, Choices, Field, Screen, SheetHeader, Txt } from '../ui/components';
import { useToast } from '../ui/theme';

export default function Measure() {
  const today = useToday();
  const toast = useToast();
  const { state, update } = useStore();
  const kinds = state.settings.tracked.filter((k) => !(k === 'weight' && hideWeight(state.profile)));
  const [kind, setKind] = useState<MeasureKind>(kinds[0] ?? 'waist');
  const [value, setValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  const close = () => (router.canGoBack() ? router.back() : router.replace('/progress'));

  const save = () => {
    const e = measurementError(kind, value);
    if (e) return setError(e);
    const v = Math.round(Number(value.replace(',', '.')) * 10) / 10;
    update((s) => {
      const k = keyOf(today);
      s.logs.measurements = s.logs.measurements.filter((m) => !(m.kind === kind && m.date === k));
      s.logs.measurements.push({ date: k, kind, value: v });
      if (kind === 'weight') s.profile.weightKg = String(v);
      if (kind === 'waist') s.profile.waistCm = String(v);
    });
    toast('Saved.');
    close();
  };

  return (
    <Screen footer={<Button label="Save" flex onPress={save} />}>
      <SheetHeader eyebrow="Add a measurement" onClose={close} />
      {kinds.length === 0 ? (
        <Txt variant="muted">Choose what to track on the Progress screen first.</Txt>
      ) : (
        <>
          <Choices>
            {kinds.map((k) => (
              <Choice key={k} label={MEASURE_LABEL[k]} on={kind === k} onPress={() => { setKind(k); setError(null); }} />
            ))}
          </Choices>
          <Field
            label={`${MEASURE_LABEL[kind]} today (${measureUnit(kind)})`}
            value={value}
            onChangeText={(v) => { setValue(v.replace(/[^\d.,]/g, '')); setError(null); }}
            inputMode="decimal"
            keyboardType="decimal-pad"
            error={error}
            onSubmitEditing={save}
          />
          <Txt variant="small">One entry per day for each measurement. Saving again today replaces today’s entry.</Txt>
        </>
      )}
    </Screen>
  );
}
