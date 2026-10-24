import { router } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { useStore } from '../data/store';
import { cloudEnabled } from '../data/supabase';
import { Button, Card, Chip, Hero, Note, Row, Screen, Txt } from '../ui/components';
import { Icon, Logo, PlateArt } from '../ui/icons';
import { useColors } from '../ui/theme';
import { font } from '../ui/tokens';

function Check({ on, onPress, label }: { on: boolean; onPress: () => void; label: string }) {
  const c = useColors();
  return (
    <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: on }} accessibilityLabel={label} onPress={onPress} style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-start', paddingVertical: 4 }}>
      <View style={{ width: 24, height: 24, borderRadius: 6, borderWidth: 1.5, borderColor: on ? c.sage : c.muted, backgroundColor: on ? c.sage : c.surface, alignItems: 'center', justifyContent: 'center', marginTop: 1 }}>
        {on ? <Icon name="check" size={14} color={c.onSage} /> : null}
      </View>
      <Txt style={{ flex: 1 }}>{label}</Txt>
    </Pressable>
  );
}

export default function Welcome() {
  const c = useColors();
  const { startDemo, startLocal } = useStore();
  const [adult, setAdult] = useState(false);
  const [consent, setConsent] = useState(false);
  const [tried, setTried] = useState(false);
  const ok = adult && consent;

  const begin = (next: () => void) => {
    if (!ok) {
      setTried(true);
      return;
    }
    next();
  };

  return (
    <Screen>
      <Hero>
        <Row gap={12}>
          <Logo size={44} />
          <Txt style={{ fontFamily: font.displayBold, fontSize: 40, lineHeight: 44, letterSpacing: -1.6 }} color={c.onHero} role="heading">protyn</Txt>
        </Row>
        <Row gap={16} align="center">
          <PlateArt size={92} color={c.onHero} />
          <Txt style={{ flex: 1, fontFamily: font.display, fontSize: 20, lineHeight: 26 }} color={c.onHero}>
            Your weekly plan for more protein and strength, made from the food your family already cooks.
          </Txt>
        </Row>
        <Row wrap gap={6}>
          <Chip label="Veg, egg and non-veg" tone="hero" />
          <Chip label="Your regional food" tone="hero" />
          <Chip label="20-minute workouts" tone="hero" />
        </Row>
      </Hero>
      <Card>
        <Txt variant="card">What we are</Txt>
        <Txt variant="muted">A weekly plan from your own regional food, measured in katoris and rotis, with short strength sessions and a 30-second daily check-in.</Txt>
        <Txt variant="card">What we aren’t</Txt>
        <Txt variant="muted">Medical advice, a calorie counter, or a diet that promises results. If you have a health condition, are pregnant, or have a history of disordered eating, talk to a doctor first.</Txt>
      </Card>
      <Check on={adult} onPress={() => setAdult(!adult)} label="I am 18 or older." />
      <Check on={consent} onPress={() => setConsent(!consent)} label="I agree to the terms and privacy notice. My data is used only to build my plan, never sold or used for ads." />
      {tried && !ok ? <Note tone="error">Please confirm both boxes to continue. Protyn is for adults 18 and over for now.</Note> : null}
      <View style={{ gap: 10 }}>
        {cloudEnabled ? <Button label="Create an account or sign in" block onPress={() => begin(() => router.push('/sign-in'))} /> : null}
        <Button
          label={cloudEnabled ? 'Use without an account' : 'Get started'}
          kind={cloudEnabled ? 'ghost' : 'primary'}
          block
          hint="Your data stays on this device"
          onPress={() =>
            begin(() => {
              startLocal();
              router.replace('/onboarding');
            })
          }
        />
        <Button
          label="Try the demo (Rajashree, Bhubaneswar)"
          kind="ghost"
          block
          hint="Opens the app with sample data. Nothing you enter is kept if you reset."
          onPress={() => {
            startDemo();
            router.replace('/today');
          }}
        />
      </View>
      <Txt variant="small">
        {cloudEnabled
          ? 'With an account, your plan and logs sync securely. Health answers always stay on your device.'
          : 'Your data stays on this device. Accounts and sync arrive once the cloud backend is connected.'}
      </Txt>
    </Screen>
  );
}
