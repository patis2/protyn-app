import * as FileSystem from 'expo-file-system';
import { router } from 'expo-router';
import * as Sharing from 'expo-sharing';
import React, { useState } from 'react';
import { Platform, ScrollView, Text } from 'react-native';
import { CONTENT_VERSION } from '../content/dishes';
import { useStore } from '../data/store';
import { keyOf } from '../domain/dates';
import { Button, Note, Screen, SheetHeader, Txt } from '../ui/components';
import { useColors, useToast } from '../ui/theme';

export default function Export() {
  const c = useColors();
  const toast = useToast();
  const { state } = useStore();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const close = () => (router.canGoBack() ? router.back() : router.replace('/me'));
  const data = JSON.stringify(
    { exportedAt: new Date().toISOString(), app: 'Protyn', contentVersion: CONTENT_VERSION, profile: state.profile, settings: state.settings, logs: state.logs },
    null,
    2,
  );
  const name = `protyn-export-${keyOf(new Date())}.json`;

  const download = async () => {
    setBusy(true);
    setError(null);
    try {
      if (Platform.OS === 'web') {
        const url = URL.createObjectURL(new Blob([data], { type: 'application/json' }));
        const a = document.createElement('a');
        a.href = url;
        a.download = name;
        a.click();
        URL.revokeObjectURL(url);
        toast('Downloaded your data.');
      } else {
        const file = new FileSystem.File(FileSystem.Paths.cache, name);
        file.create({ overwrite: true });
        file.write(data);
        if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(file.uri, { mimeType: 'application/json', dialogTitle: 'Save your Protyn data' });
        else setError('Sharing isn’t available on this device.');
      }
    } catch {
      setError('We couldn’t create the file. Try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen footer={<Button label={Platform.OS === 'web' ? 'Download file' : 'Save or share file'} flex loading={busy} onPress={download} />}>
      <SheetHeader eyebrow="Export my data" onClose={close} />
      <Txt variant="muted">Everything Protyn holds about you, in one JSON file: your profile, health answers, settings, check-ins, notes, measurements and logs.</Txt>
      {error ? <Note tone="error">{error}</Note> : null}
      <ScrollView style={{ maxHeight: 360, backgroundColor: c.sunk, borderRadius: 12, padding: 12 }} accessibilityLabel="Preview of your data">
        <Text selectable style={{ fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' }), fontSize: 12, color: c.ink }}>
          {data}
        </Text>
      </ScrollView>
    </Screen>
  );
}
