import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { View } from 'react-native';
import { COOL_DOWN, REST_SECONDS, SESSIONS, WARM_UP } from '../content/library';
import { useStore, useToday } from '../data/store';
import { keyOf, parseKey } from '../domain/dates';
import { STOP_NOTE } from '../domain/safety';
import type { Feel, SessionTemplate } from '../domain/types';
import { buildSession, sessionForDate, variantName, workoutMode } from '../domain/workouts';
import { Button, Choice, Choices, IconButton, Note, ProgressBar, Row, Screen, Txt } from '../ui/components';
import { FigureArt } from '../ui/icons';
import { useColors, useToast } from '../ui/theme';
import { font } from '../ui/tokens';

type Phase = 'warm' | 'ex' | 'rest' | 'cool' | 'feel' | 'pain';

export default function Workout() {
  const c = useColors();
  const toast = useToast();
  const today = useToday();
  const { date: dk, session: sid, easier: easierParam } = useLocalSearchParams<{ date?: string; session?: SessionTemplate['id']; easier?: string }>();
  const { state, update } = useStore();
  const p = state.profile;
  const date = dk ? parseKey(dk) : today;
  const template = (sid && SESSIONS[sid]) || sessionForDate(p, date) || SESSIONS.A;
  const mode = workoutMode(p, state.settings.moveMode);
  const plan = useMemo(
    () => buildSession(p, template, mode, state.logs.sessions, state.logs.checkins[keyOf(today)], easierParam === '1'),
    // The plan is fixed when the session starts, so later logging doesn't reshuffle it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
  const [phase, setPhase] = useState<Phase>('warm');
  const [i, setI] = useState(0);
  const [set, setSet] = useState(1);
  const [rest, setRest] = useState(REST_SECONDS);
  const [easier, setEasier] = useState<Record<string, boolean>>(() => Object.fromEntries(plan.moves.map((m) => [m.ex.id, m.easier])));
  const [setsDone, setSetsDone] = useState(0);
  const [pain, setPain] = useState(false);
  const [feel, setFeel] = useState<Feel | null>(null);

  useEffect(() => {
    if (phase !== 'rest') return;
    const t = setInterval(() => setRest((r) => r - 1), 1000);
    return () => clearInterval(t);
  }, [phase]);
  useEffect(() => {
    if (phase === 'rest' && rest <= 0) setPhase('ex');
  }, [phase, rest]);

  const move = plan.moves[i];
  const close = () => (router.canGoBack() ? router.back() : router.replace('/move'));
  const nextMove = () => {
    setSet(1);
    if (i < plan.moves.length - 1) {
      setI(i + 1);
      setPhase('ex');
    } else setPhase('cool');
  };
  const doneSet = () => {
    setSetsDone((n) => n + 1);
    if (set < move.sets) {
      setSet(set + 1);
      setRest(REST_SECONDS);
      setPhase('rest');
    } else nextMove();
  };
  const save = () => {
    if (!feel) return;
    update((s) => {
      const k = keyOf(today);
      s.logs.sessions = s.logs.sessions.filter((x) => x.date !== k);
      s.logs.sessions.push({ date: k, sessionId: template.id, feel, easier: Object.keys(easier).filter((e) => easier[e]), setsDone, painReported: pain });
    });
    toast(feel === 'hard' ? 'Session saved. Next time starts with easier options.' : 'Session saved. Nice work.');
    close();
  };

  const pct = phase === 'warm' ? 0 : phase === 'cool' || phase === 'feel' ? 100 : Math.round((i / plan.moves.length) * 100);
  const name = move ? (easier[move.ex.id] ? move.ex.easier : variantName(move.ex, mode, p)) : '';

  return (
    <Screen>
      <Row>
        <IconButton icon="close" label="Close workout without saving" onPress={close} />
        <View style={{ flex: 1, gap: 6 }}>
          <Txt variant="card">{plan.template.name}</Txt>
          <ProgressBar pct={pct} label={`Workout ${pct}% complete`} />
        </View>
      </Row>

      {phase === 'warm' ? (
        <>
          <Figure />
          <Txt variant="title">Warm up · 3 minutes</Txt>
          {WARM_UP.map((w, j) => (
            <Txt key={j}>
              {j + 1}. {w}
            </Txt>
          ))}
          <Note>{STOP_NOTE}</Note>
          {plan.progression === 'easier' ? <Note tone="why">Today starts with easier options, based on how your last session or today’s check-in felt.</Note> : null}
          {plan.progression === 'harder' ? <Note tone="why">Your last two sessions felt easy. Try the harder option on any move that feels comfortable.</Note> : null}
          <Button label="I’m warmed up" block onPress={() => setPhase('ex')} />
        </>
      ) : null}

      {(phase === 'ex' || phase === 'rest') && move ? (
        <>
          {phase === 'rest' ? (
            <View style={{ borderRadius: 20, backgroundColor: c.sageSoft, height: 170, alignItems: 'center', justifyContent: 'center' }} accessibilityLiveRegion="polite">
              <Txt variant="small" color={c.sageDeep}>Rest</Txt>
              <Txt style={{ fontFamily: font.display, fontSize: 64, lineHeight: 70 }}>{rest}</Txt>
              <Txt variant="small">seconds</Txt>
            </View>
          ) : (
            <Figure />
          )}
          <View style={{ gap: 4 }}>
            <Txt variant="eyebrow">
              Move {i + 1} of {plan.moves.length}
              {easier[move.ex.id] ? ' · easier option' : ''}
            </Txt>
            <Txt variant="title">{name}</Txt>
            <Txt variant="muted">
              {move.ex.reps} · {move.ex.cue}
            </Txt>
          </View>
          <View style={{ gap: 4 }}>
            {move.ex.steps.map((s, j) => (
              <Txt key={j} variant="small">
                {j + 1}. {s}
              </Txt>
            ))}
          </View>
          <Row gap={6} style={{ justifyContent: 'center' }} >
            {Array.from({ length: move.sets }, (_, j) => (
              <View key={j} style={{ width: 34, height: 6, borderRadius: 3, backgroundColor: j < set - 1 ? c.sage : c.line }} />
            ))}
          </Row>
          {phase === 'rest' ? (
            <>
              <Txt center variant="muted">
                Next: set {set} of {move.sets}
              </Txt>
              <Button label="Skip rest" block onPress={() => setPhase('ex')} />
            </>
          ) : (
            <>
              <Txt center>
                Set {set} of {move.sets}
              </Txt>
              <Button label="Done" block onPress={doneSet} hint={`Finish set ${set} of ${move.sets}`} />
            </>
          )}
          <Row>
            <Button label={easier[move.ex.id] ? 'Back to standard' : 'Easier option'} kind="ghost" small flex onPress={() => setEasier({ ...easier, [move.ex.id]: !easier[move.ex.id] })} />
            <Button label="Something hurts" kind="ghost" small flex color={c.coralInk} onPress={() => setPhase('pain')} />
          </Row>
          {!easier[move.ex.id] ? <Txt variant="small" center>Feeling strong? Harder option: {move.ex.harder}</Txt> : null}
        </>
      ) : null}

      {phase === 'pain' && move ? (
        <>
          <Txt variant="title">Let’s look after that</Txt>
          <Txt>
            Sharp pain, chest pain, dizziness or unusual breathlessness: <Txt bold>stop now</Txt>. If it doesn’t settle, seek medical help.
          </Txt>
          <Txt variant="muted">A dull ache from effort is normal. You can switch to the easier option, skip this move, or end today’s session.</Txt>
          <Button label="Use the easier option" block onPress={() => { setPain(true); setEasier({ ...easier, [move.ex.id]: true }); setPhase('ex'); }} />
          <Button label="Skip this move" kind="ghost" block onPress={() => { setPain(true); nextMove(); }} />
          <Button
            label="End the session and rest"
            kind="ghost"
            block
            onPress={() => {
              toast('Session ended. Rest up, and tell us tomorrow how it feels.');
              close();
            }}
          />
        </>
      ) : null}

      {phase === 'cool' ? (
        <>
          <Figure />
          <Txt variant="title">Cool down · 2 minutes</Txt>
          {COOL_DOWN.map((w, j) => (
            <Txt key={j}>
              {j + 1}. {w}
            </Txt>
          ))}
          <Button label="Finish" block onPress={() => setPhase('feel')} />
        </>
      ) : null}

      {phase === 'feel' ? (
        <>
          <Txt variant="title">How did that feel?</Txt>
          <Txt variant="muted">Your answer shapes the next session.</Txt>
          <Choices column>
            <Choice full label="Too easy" sub="Next time suggests harder options" on={feel === 'easy'} onPress={() => setFeel('easy')} />
            <Choice full label="Just right" sub="Keep progressing slowly" on={feel === 'right'} onPress={() => setFeel('right')} />
            <Choice full label="Too hard" sub="Next time starts with easier options" on={feel === 'hard'} onPress={() => setFeel('hard')} />
          </Choices>
          <Button label="Save session" block disabled={!feel} onPress={save} />
        </>
      ) : null}
    </Screen>
  );
}

function Figure() {
  const c = useColors();
  return (
    <View style={{ borderRadius: 20, backgroundColor: c.sageSoft, height: 170, alignItems: 'center', justifyContent: 'center' }}>
      <FigureArt color={c.sageDeep} />
    </View>
  );
}
