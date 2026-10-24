import { router } from 'expo-router';
import React, { useState } from 'react';
import { useStore } from '../data/store';
import { Button, Note, Screen, SheetHeader, Txt } from '../ui/components';

export default function Delete() {
  const { state, deleteEverything } = useStore();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const demo = state.mode === 'demo';
  const close = () => (router.canGoBack() ? router.back() : router.replace('/me'));

  const run = async () => {
    setBusy(true);
    setError(null);
    try {
      await deleteEverything();
      router.replace('/welcome');
    } catch {
      setError('We couldn’t delete everything. Check your connection and try again.');
      setBusy(false);
    }
  };

  return (
    <Screen>
      <SheetHeader eyebrow={demo ? 'Leave demo' : 'Delete my data'} onClose={close} />
      <Txt variant="title">{demo ? 'Leave the demo?' : 'Delete your data?'}</Txt>
      <Txt>
        {demo
          ? 'This clears the sample data and takes you back to the start, where you can set up your own plan.'
          : `This deletes your profile, health answers, plans, check-ins, notes and measurements${state.mode === 'cloud' ? ' from this device and from your account' : ' from this device'}. It can’t be undone.`}
      </Txt>
      {!demo ? <Note>Want a copy first? Use Export my data before deleting.</Note> : null}
      {error ? <Note tone="error">{error}</Note> : null}
      <Button label={demo ? 'Leave demo' : 'Delete everything'} kind="danger" block loading={busy} onPress={run} />
      <Button label={demo ? 'Stay in the demo' : 'Keep my data'} kind="ghost" block onPress={close} />
    </Screen>
  );
}
