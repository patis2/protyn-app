import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Image, Platform, View } from 'react-native';
import { useStore, useToday } from '../data/store';
import { fmtDate } from '../domain/dates';
import { rewardById } from '../domain/rewards';
import { Button, Card, Note, Row, Screen, SheetHeader, Toggle, Txt } from '../ui/components';
import { Icon, Logo } from '../ui/icons';
import { FadeIn } from '../ui/motion';
import { rewardPreview, shareReward, type ShareTarget } from '../ui/rewardImage';
import { useColors, useToast } from '../ui/theme';
import { font } from '../ui/tokens';

export default function RewardScreen() {
  const c = useColors();
  const toast = useToast();
  const today = useToday();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { state, update } = useStore();
  const reward = id ? rewardById(state, today, id) : null;
  const [showName, setShowName] = useState(true);
  const [preview, setPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState<ShareTarget | null>(null);
  const name = showName && state.profile.name.trim() ? state.profile.name.trim() : null;
  const dateLabel = fmtDate(today);
  const close = () => (router.canGoBack() ? router.back() : router.replace('/progress'));

  useEffect(() => {
    if (reward?.earned && !state.settings.seenRewards.includes(reward.id))
      update((s) => {
        s.settings.seenRewards = [...s.settings.seenRewards, reward.id];
      });
  }, [reward, state.settings.seenRewards, update]);

  useEffect(() => {
    let url: string | null = null;
    let live = true;
    if (reward?.earned)
      rewardPreview(reward, name, dateLabel)
        .then((u) => {
          url = u;
          if (live) setPreview(u);
        })
        .catch(() => setPreview(null));
    return () => {
      live = false;
      if (url) URL.revokeObjectURL(url);
    };
  }, [reward?.id, reward?.earned, name, dateLabel]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!reward)
    return (
      <Screen>
        <SheetHeader eyebrow="Reward" onClose={close} />
        <Note>This reward doesn’t exist any more.</Note>
      </Screen>
    );

  if (!reward.earned)
    return (
      <Screen>
        <SheetHeader eyebrow="Reward" onClose={close} />
        <Txt variant="title">{reward.title}</Txt>
        <Txt variant="muted">{reward.hint}</Txt>
        <Txt variant="small">{Math.round(reward.progress * 100)}% of the way there. Keep going.</Txt>
      </Screen>
    );

  const go = async (target: ShareTarget) => {
    setBusy(target);
    try {
      const out = await shareReward(reward, name, dateLabel, target);
      if (out === 'saved') toast(target === 'instagram' ? 'Image saved. Open Instagram and add it to your story or post.' : 'Image saved to your device.');
      if (out === 'opened' && target === 'facebook') toast('Facebook opened with a link to Protyn. Save the image to post it too.');
    } catch {
      toast('Sharing didn’t work this time. Try saving the image instead.');
    } finally {
      setBusy(null);
    }
  };

  return (
    <Screen>
      <SheetHeader eyebrow="Reward unlocked" onClose={close} />
      <FadeIn>
        {preview ? (
          <Image source={{ uri: preview }} accessibilityLabel={`Reward card: ${reward.title}${name ? ` for ${name}` : ''}`} style={{ width: '100%', aspectRatio: 1080 / 1350, borderRadius: 20 }} />
        ) : (
          <CardPreview title={reward.title} figure={reward.figure} name={name} line={reward.line} />
        )}
      </FadeIn>
      <Toggle value={showName} onChange={setShowName} label="Show my name on the card" detail="The card never shows your weight, measurements or health answers." />
      <Card>
        <Txt variant="card">Share your reward</Txt>
        <Row wrap gap={8}>
          <Button label="WhatsApp" kind="soft" small loading={busy === 'whatsapp'} onPress={() => go('whatsapp')} />
          <Button label="Instagram" kind="soft" small loading={busy === 'instagram'} onPress={() => go('instagram')} />
          <Button label="Facebook" kind="soft" small loading={busy === 'facebook'} onPress={() => go('facebook')} />
          <Button label="More…" kind="ghost" small loading={busy === 'any'} onPress={() => go('any')} />
        </Row>
        {Platform.OS === 'web' ? <Button label="Save image" kind="ghost" small loading={busy === 'save'} onPress={() => go('save')} /> : null}
        <Txt variant="small">
          {Platform.OS === 'web'
            ? 'On a phone, each button opens your share sheet with the image. On a computer, WhatsApp and Facebook open with a link, and Instagram saves the image for you to post.'
            : 'Shares a message with a link to Protyn.'}
        </Txt>
      </Card>
    </Screen>
  );
}

/** Shown while the image is drawn, and on the phone apps. */
function CardPreview({ title, figure, name, line }: { title: string; figure: string; name: string | null; line: string }) {
  const c = useColors();
  return (
    <View style={{ backgroundColor: '#2F5240', borderRadius: 20, padding: 22, gap: 14, alignItems: 'center', overflow: 'hidden' }}>
      <Row style={{ alignSelf: 'flex-start' }}>
        <Logo size={36} />
        <Txt color="#F8F1E9" style={{ fontFamily: font.displayBold, fontSize: 24 }}>protyn</Txt>
      </Row>
      <View style={{ width: 120, height: 120, borderRadius: 60, backgroundColor: '#F8F1E9', borderWidth: 10, borderColor: c.coral, alignItems: 'center', justifyContent: 'center' }}>
        <Txt color="#2F5240" style={{ fontFamily: font.displayBold, fontSize: 44, lineHeight: 50 }}>{figure}</Txt>
      </View>
      <Txt color="#F8F1E9" style={{ fontFamily: font.displayBold, fontSize: 26 }}>{title}</Txt>
      {name ? <Txt color="#F8F1E9" style={{ fontFamily: font.display, fontSize: 18 }}>{name}</Txt> : null}
      <Txt center color="#C9D8CD">{line.charAt(0).toUpperCase() + line.slice(1)}</Txt>
      <Row gap={6}>
        <Icon name="trophy" size={18} color="#F5B4A1" />
        <Txt color="#F5B4A1" style={{ fontFamily: font.display }}>Plan it. Plate it. Pump it.</Txt>
      </Row>
    </View>
  );
}
