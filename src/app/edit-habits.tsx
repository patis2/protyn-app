import { router } from 'expo-router';
import React from 'react';
import { HABITS } from '../content/library';
import { useStore } from '../data/store';
import { Button, Choice, Choices, Screen, SheetHeader, Txt } from '../ui/components';

export default function EditHabits() {
  const { state, update } = useStore();
  const chosen = state.profile.habits;
  const close = () => (router.canGoBack() ? router.back() : router.replace('/habits'));
  const toggle = (id: string) => {
    update((s) => {
      s.profile.habits = chosen.includes(id) ? chosen.filter((x) => x !== id) : [...chosen, id];
    });
  };
  return (
    <Screen footer={<Button label="Done" flex onPress={close} />}>
      <SheetHeader eyebrow="Choose your habits" onClose={close} />
      <Txt variant="card">To build</Txt>
      <Choices column>
        {HABITS.filter((h) => h.kind === 'build').map((h) => (
          <Choice multi full key={h.id} label={h.name} on={chosen.includes(h.id)} onPress={() => toggle(h.id)} />
        ))}
      </Choices>
      <Txt variant="card">To cut back on</Txt>
      <Choices column>
        {HABITS.filter((h) => h.kind === 'reduce').map((h) => (
          <Choice multi full key={h.id} label={h.name} on={chosen.includes(h.id)} onPress={() => toggle(h.id)} />
        ))}
      </Choices>
      <Txt variant="small">
        {chosen.length} chosen. Past check-ins stay in your history.
      </Txt>
    </Screen>
  );
}
