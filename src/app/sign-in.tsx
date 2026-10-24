import { router } from 'expo-router';
import React, { useState } from 'react';
import { useStore } from '../data/store';
import { cloudEnabled, sendCode, verifyCode } from '../data/supabase';
import { Button, Header, Note, Screen, Txt, Field } from '../ui/components';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function SignIn() {
  const { adoptCloud } = useStore();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [stage, setStage] = useState<'email' | 'code'>('email');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!cloudEnabled)
    return (
      <Screen>
        <Header title="Sign in" onBack={() => router.back()} />
        <Note>Accounts aren’t switched on in this build yet. You can use Protyn on this device without an account.</Note>
      </Screen>
    );

  const send = async () => {
    if (!EMAIL.test(email.trim())) return setError('Enter an email address like name@example.com.');
    setBusy(true);
    setError(null);
    try {
      await sendCode(email.trim());
      setStage('code');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'We couldn’t send a code. Try again.');
    } finally {
      setBusy(false);
    }
  };

  const verify = async () => {
    if (!/^\d{6}$/.test(code.trim())) return setError('Enter the 6-digit code from your email.');
    setBusy(true);
    setError(null);
    try {
      await verifyCode(email.trim(), code.trim());
      await adoptCloud();
      router.replace('/');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong. Try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen>
      <Header title={stage === 'email' ? 'Sign in or create an account' : 'Check your email'} onBack={() => (stage === 'code' ? setStage('email') : router.back())} />
      {stage === 'email' ? (
        <>
          <Txt variant="muted">We’ll email you a 6-digit code. No password to remember.</Txt>
          <Field label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoComplete="email" inputMode="email" error={error} onSubmitEditing={send} />
          <Button label="Send code" block loading={busy} onPress={send} />
        </>
      ) : (
        <>
          <Txt variant="muted">We sent a code to {email}. It can take a minute to arrive.</Txt>
          <Field label="6-digit code" value={code} onChangeText={setCode} keyboardType="number-pad" inputMode="numeric" maxLength={6} autoComplete="one-time-code" error={error} onSubmitEditing={verify} />
          <Button label="Sign in" block loading={busy} onPress={verify} />
          <Button label="Send a new code" kind="ghost" block disabled={busy} onPress={send} />
        </>
      )}
    </Screen>
  );
}
