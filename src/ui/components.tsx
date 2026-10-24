import React from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
  type PressableProps,
  type StyleProp,
  type TextInputProps,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon, type IconName } from './icons';
import { useColors } from './theme';
import { font, maxContentWidth, radius } from './tokens';

// The Protyn UI kit. Every screen on phone and web is built from these pieces,
// so spacing, colour, focus rings and touch targets stay consistent.

type Children = { children?: React.ReactNode };
type PressState = { pressed: boolean; focused?: boolean; hovered?: boolean };

// Show focus rings only when the keyboard is being used, like :focus-visible.
let keyboardMode = false;
if (Platform.OS === 'web' && typeof window !== 'undefined') {
  window.addEventListener('keydown', (e) => { if (e.key === 'Tab') keyboardMode = true; }, true);
  window.addEventListener('pointerdown', () => { keyboardMode = false; }, true);
}

export const focusRing = (s: PressState, color: string): ViewStyle =>
  Platform.OS === 'web' && s.focused && keyboardMode ? ({ outlineColor: color, outlineWidth: 2, outlineStyle: 'solid', outlineOffset: 2 } as ViewStyle) : {};

// ---------- text ----------

type TxtProps = Children & {
  variant?: 'body' | 'small' | 'muted' | 'card' | 'screen' | 'title' | 'eyebrow' | 'big' | 'slot';
  style?: StyleProp<TextStyle>;
  center?: boolean;
  color?: string;
  bold?: boolean;
  numberOfLines?: number;
  role?: 'heading';
};

export function Txt({ variant = 'body', style, center, color, bold, children, numberOfLines, role }: TxtProps) {
  const c = useColors();
  const base: Record<NonNullable<TxtProps['variant']>, TextStyle> = {
    body: { fontFamily: font.body, fontSize: 15, lineHeight: 22, color: c.ink },
    small: { fontFamily: font.body, fontSize: 13, lineHeight: 18, color: c.muted },
    muted: { fontFamily: font.body, fontSize: 15, lineHeight: 22, color: c.muted },
    card: { fontFamily: font.bodySemi, fontSize: 16, lineHeight: 22, color: c.ink },
    screen: { fontFamily: font.display, fontSize: 27, lineHeight: 31, color: c.ink, letterSpacing: -0.4 },
    title: { fontFamily: font.display, fontSize: 22, lineHeight: 27, color: c.ink, letterSpacing: -0.3 },
    eyebrow: { fontFamily: font.bodySemi, fontSize: 12, lineHeight: 16, letterSpacing: 0.9, textTransform: 'uppercase', color: c.sageDeep },
    big: { fontFamily: font.displayMedium, fontSize: 38, lineHeight: 42, color: c.ink },
    slot: { fontFamily: font.bodySemi, fontSize: 12, lineHeight: 16, letterSpacing: 0.7, textTransform: 'uppercase', color: c.muted },
  };
  const isHeading = role === 'heading' || variant === 'screen' || variant === 'title';
  return (
    <Text
      role={isHeading ? 'heading' : undefined}
      numberOfLines={numberOfLines}
      style={[base[variant], center && { textAlign: 'center' }, bold && { fontFamily: font.bodySemi }, color ? { color } : null, style]}
    >
      {children}
    </Text>
  );
}

// ---------- layout ----------

/** Set to false by layouts that already pad for the status bar. */
export const TopInset = React.createContext(true);

export function Screen({ children, footer, scroll = true }: Children & { footer?: React.ReactNode; scroll?: boolean }) {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const padTop = React.useContext(TopInset);
  const inner = (
    <View style={{ width: '100%', maxWidth: maxContentWidth, alignSelf: 'center', gap: 16, paddingHorizontal: 16, paddingTop: 18 + (padTop ? insets.top : 0), paddingBottom: 28 }}>
      {children}
    </View>
  );
  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      {scroll ? (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
          {inner}
        </ScrollView>
      ) : (
        inner
      )}
      {footer ? (
        <View style={{ borderTopWidth: 1, borderTopColor: c.line, backgroundColor: c.surface, paddingBottom: Math.max(insets.bottom, 14) }}>
          <View style={{ width: '100%', maxWidth: maxContentWidth, alignSelf: 'center', flexDirection: 'row', gap: 10, paddingHorizontal: 16, paddingTop: 12 }}>
            {footer}
          </View>
        </View>
      ) : null}
    </View>
  );
}

export function Row({ children, gap = 10, style, between, wrap, align = 'center' }: Children & { gap?: number; style?: StyleProp<ViewStyle>; between?: boolean; wrap?: boolean; align?: ViewStyle['alignItems'] }) {
  return <View style={[{ flexDirection: 'row', alignItems: align, gap }, between && { justifyContent: 'space-between' }, wrap && { flexWrap: 'wrap' }, style]}>{children}</View>;
}

export function Card({ children, tint, style, label }: Children & { tint?: boolean; style?: StyleProp<ViewStyle>; label?: string }) {
  const c = useColors();
  return (
    <View
      accessibilityLabel={label}
      style={[{ backgroundColor: tint ? c.sageSoft : c.surface, borderWidth: 1, borderColor: tint ? 'transparent' : c.line, borderRadius: radius.lg, padding: 16, gap: 10 }, style]}
    >
      {children}
    </View>
  );
}

export function Divider() {
  const c = useColors();
  return <View style={{ height: 1, backgroundColor: c.line }} />;
}

export function ListItem({ children, first }: Children & { first?: boolean }) {
  const c = useColors();
  return <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 11, borderTopWidth: first ? 0 : 1, borderTopColor: c.line }}>{children}</View>;
}

// ---------- buttons ----------

type ButtonProps = {
  label: string;
  onPress?: () => void;
  kind?: 'primary' | 'ghost' | 'soft' | 'danger';
  small?: boolean;
  block?: boolean;
  disabled?: boolean;
  loading?: boolean;
  flex?: boolean;
  hint?: string;
  color?: string;
};

export function Button({ label, onPress, kind = 'primary', small, block, disabled, loading, flex, hint, color }: ButtonProps) {
  const c = useColors();
  const bg = { primary: c.sage, ghost: 'transparent', soft: c.sageSoft, danger: c.coralInk }[kind];
  const fg = color ?? { primary: c.onSage, ghost: c.ink, soft: c.sageDeep, danger: c.surface }[kind];
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={hint}
      accessibilityState={{ disabled: !!disabled || !!loading, busy: !!loading }}
      disabled={disabled || loading}
      onPress={onPress}
      style={(s: PressState) => [
        {
          backgroundColor: bg,
          borderRadius: radius.pill,
          paddingVertical: small ? 8 : 12,
          paddingHorizontal: small ? 14 : 18,
          minHeight: small ? 36 : 46,
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'row',
          gap: 6,
          borderWidth: kind === 'ghost' ? 1 : 0,
          borderColor: c.line,
          opacity: disabled ? 0.45 : s.pressed ? 0.85 : 1,
        },
        block && { alignSelf: 'stretch' },
        !block && !flex && { alignSelf: 'flex-start' },
        flex && { flex: 1 },
        focusRing(s, c.sage),
      ]}
    >
      {loading ? <ActivityIndicator color={fg} size="small" /> : null}
      <Text style={{ color: fg, fontFamily: font.bodySemi, fontSize: small ? 13 : 15 }}>{label}</Text>
    </Pressable>
  );
}

export function LinkButton({ label, onPress, hint }: { label: string; onPress: () => void; hint?: string }) {
  const c = useColors();
  return (
    <Pressable accessibilityRole="button" accessibilityHint={hint} onPress={onPress} hitSlop={8} style={(s: PressState) => [{ paddingVertical: 4, alignSelf: 'flex-start' }, focusRing(s, c.sage)]}>
      <Text style={{ color: c.sageDeep, fontFamily: font.bodySemi, fontSize: 14, textDecorationLine: 'underline' }}>{label}</Text>
    </Pressable>
  );
}

export function IconButton({ icon, label, onPress, size = 40, tint }: { icon: IconName; label: string; onPress: () => void; size?: number; tint?: boolean }) {
  const c = useColors();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      hitSlop={6}
      style={(s: PressState) => [
        { width: size, height: size, borderRadius: size / 2, borderWidth: 1, borderColor: c.line, backgroundColor: tint ? c.sageSoft : c.surface, alignItems: 'center', justifyContent: 'center', opacity: s.pressed ? 0.8 : 1 },
        focusRing(s, c.sage),
      ]}
    >
      <Icon name={icon} size={20} color={tint ? c.sageDeep : c.ink} />
    </Pressable>
  );
}

/** Round tick used to mark meals eaten, habits kept and shopping items bought. */
export function Tick({ on, onPress, label }: { on: boolean; onPress: () => void; label: string }) {
  const c = useColors();
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityLabel={label}
      accessibilityState={{ checked: on }}
      onPress={onPress}
      hitSlop={8}
      style={(s: PressState) => [
        { width: 32, height: 32, borderRadius: 16, borderWidth: 1.5, borderColor: on ? c.sage : c.line, backgroundColor: on ? c.sage : c.surface, alignItems: 'center', justifyContent: 'center' },
        focusRing(s, c.sage),
      ]}
    >
      {on ? <Icon name="check" size={16} color={c.onSage} /> : null}
    </Pressable>
  );
}

// ---------- choices ----------

type ChoiceProps = { label: string; sub?: string; on: boolean; onPress: () => void; full?: boolean; half?: boolean; multi?: boolean };

export function Choice({ label, sub, on, onPress, full, half, multi }: ChoiceProps) {
  const c = useColors();
  return (
    <Pressable
      accessibilityRole={multi ? 'checkbox' : 'radio'}
      accessibilityState={multi ? { checked: on } : { selected: on, checked: on }}
      accessibilityLabel={sub ? `${label}. ${sub}` : label}
      onPress={onPress}
      style={(s: PressState) => [
        { borderWidth: 1.5, borderColor: on ? c.sage : c.line, backgroundColor: on ? c.sageSoft : c.surface, borderRadius: radius.md, paddingVertical: 10, paddingHorizontal: 13, gap: 2, minHeight: 44, justifyContent: 'center' },
        full && { alignSelf: 'stretch' },
        half && { flexGrow: 1, flexBasis: '45%' },
        focusRing(s, c.sage),
      ]}
    >
      <Text style={{ fontFamily: on ? font.bodySemi : font.bodyMedium, fontSize: 15, color: on ? c.sageDeep : c.ink }}>{label}</Text>
      {sub ? <Text style={{ fontFamily: font.body, fontSize: 13, color: c.muted }}>{sub}</Text> : null}
    </Pressable>
  );
}

export function Choices({ children, column }: Children & { column?: boolean }) {
  return <View style={column ? { gap: 8 } : { flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>{children}</View>;
}

export function Segmented<T extends string>({ value, options, onChange, label }: { value: T | undefined; options: [T, string][]; onChange: (v: T) => void; label: string }) {
  const c = useColors();
  return (
    <View role="radiogroup" accessibilityLabel={label} style={{ flexDirection: 'row', gap: 6 }}>
      {options.map(([v, l]) => {
        const on = v === value;
        return (
          <Pressable
            key={v}
            accessibilityRole="radio"
            accessibilityState={{ selected: on, checked: on }}
            accessibilityLabel={`${label}: ${l}`}
            onPress={() => onChange(v)}
            style={(s: PressState) => [
              { flex: 1, borderWidth: 1.5, borderColor: on ? c.sage : c.line, backgroundColor: on ? c.sageSoft : c.surface, borderRadius: radius.sm, paddingVertical: 9, alignItems: 'center', minHeight: 40, justifyContent: 'center' },
              focusRing(s, c.sage),
            ]}
          >
            <Text style={{ fontFamily: on ? font.bodySemi : font.body, fontSize: 14, color: on ? c.sageDeep : c.ink }}>{l}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function Toggle({ value, onChange, label, detail }: { value: boolean; onChange: (v: boolean) => void; label: string; detail?: string }) {
  const c = useColors();
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityLabel={label}
      accessibilityHint={detail}
      accessibilityState={{ checked: value }}
      onPress={() => onChange(!value)}
      style={(s: PressState) => [{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 11 }, focusRing(s, c.sage)]}
    >
      <View style={{ flex: 1 }}>
        <Txt>{label}</Txt>
        {detail ? <Txt variant="small">{detail}</Txt> : null}
      </View>
      <View style={{ width: 48, height: 28, borderRadius: 14, backgroundColor: value ? c.sage : c.line, padding: 3, alignItems: value ? 'flex-end' : 'flex-start' }}>
        <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: c.surface }} />
      </View>
    </Pressable>
  );
}

// ---------- inputs ----------

type FieldProps = TextInputProps & { label: string; optional?: boolean; error?: string | null; hint?: string; multiline?: boolean };

export function Field({ label, optional, error, hint, multiline, style, ...rest }: FieldProps) {
  const c = useColors();
  const [focused, setFocused] = React.useState(false);
  return (
    <View style={{ gap: 6, flex: 1, minWidth: 130 }}>
      <Text style={{ fontFamily: font.bodySemi, fontSize: 14, color: c.ink }}>
        {label}
        {optional ? <Text style={{ fontFamily: font.body, color: c.muted }}> optional</Text> : null}
      </Text>
      <TextInput
        accessibilityLabel={optional ? `${label}, optional` : label}
        accessibilityHint={hint}
        placeholderTextColor={c.muted}
        multiline={multiline}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={[
          {
            borderWidth: 1.5,
            borderColor: error ? c.coralInk : focused ? c.sage : c.line,
            backgroundColor: c.surface,
            borderRadius: radius.sm,
            paddingHorizontal: 12,
            paddingVertical: 10,
            fontFamily: font.body,
            fontSize: 16,
            color: c.ink,
            minHeight: multiline ? 84 : 46,
            textAlignVertical: multiline ? 'top' : 'center',
          },
          Platform.OS === 'web' ? ({ outlineStyle: 'none' } as unknown as TextStyle) : null,
          style,
        ]}
        {...rest}
      />
      {hint && !error ? <Txt variant="small">{hint}</Txt> : null}
      {error ? <Txt variant="small" color={c.coralInk}>{error}</Txt> : null}
    </View>
  );
}

// ---------- small display pieces ----------

export function Chip({ label, tone = 'sage' }: { label: string; tone?: 'sage' | 'coral' | 'amber' | 'line' }) {
  const c = useColors();
  const bg = { sage: c.sageSoft, coral: c.coralSoft, amber: c.amberSoft, line: 'transparent' }[tone];
  const fg = { sage: c.sageDeep, coral: c.coralInk, amber: c.amberInk, line: c.muted }[tone];
  return (
    <View style={{ backgroundColor: bg, borderRadius: radius.pill, paddingVertical: 4, paddingHorizontal: 10, borderWidth: tone === 'line' ? 1 : 0, borderColor: c.line, alignSelf: 'flex-start' }}>
      <Text style={{ color: fg, fontFamily: font.bodyMedium, fontSize: 13 }}>{label}</Text>
    </View>
  );
}

export function Note({ children, tone = 'note' }: Children & { tone?: 'note' | 'why' | 'error' }) {
  const c = useColors();
  const box: ViewStyle =
    tone === 'why'
      ? { borderLeftWidth: 3, borderLeftColor: c.sage, backgroundColor: c.sunk, borderTopRightRadius: 12, borderBottomRightRadius: 12 }
      : tone === 'error'
        ? { backgroundColor: c.coralSoft, borderRadius: 12 }
        : { backgroundColor: c.sunk, borderRadius: 12 };
  return (
    <View role={tone === 'error' ? 'alert' : undefined} accessibilityLiveRegion={tone === 'error' ? 'assertive' : undefined} style={[box, { paddingVertical: 10, paddingHorizontal: 12 }]}>
      <Text style={{ fontFamily: font.body, fontSize: 14, lineHeight: 20, color: tone === 'error' ? c.coralInk : tone === 'why' ? c.ink : c.muted }}>{children}</Text>
    </View>
  );
}

export function ProgressBar({ pct, label }: { pct: number; label: string }) {
  const c = useColors();
  return (
    <View accessibilityRole="progressbar" accessibilityLabel={label} accessibilityValue={{ min: 0, max: 100, now: Math.round(pct) }} style={{ height: 6, backgroundColor: c.sunk, borderRadius: 3, overflow: 'hidden' }}>
      <View style={{ width: `${Math.min(100, Math.max(0, pct))}%`, height: '100%', backgroundColor: c.sage, borderRadius: 3 }} />
    </View>
  );
}

/** Protein meter: a sage band shows the range, coral fill shows what's eaten. */
export function Meter({ value, lo, hi }: { value: number; lo: number; hi: number }) {
  const c = useColors();
  const max = Math.max(hi * 1.25, value + 5);
  return (
    <View
      accessibilityRole="image"
      accessibilityLabel={`${value} grams eaten. Your range is ${lo} to ${hi} grams.`}
      style={{ height: 14, borderRadius: 7, backgroundColor: c.sunk, overflow: 'hidden' }}
    >
      <View style={{ position: 'absolute', top: 0, bottom: 0, left: `${(lo / max) * 100}%`, width: `${((hi - lo) / max) * 100}%`, backgroundColor: c.band, borderLeftWidth: 2, borderRightWidth: 2, borderColor: c.sage }} />
      <View style={{ position: 'absolute', left: 0, top: 3, bottom: 3, width: `${Math.min((value / max) * 100, 100)}%`, borderRadius: 6, backgroundColor: c.coral }} />
    </View>
  );
}

export function Loading({ label = 'Loading' }: { label?: string }) {
  const c = useColors();
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: c.bg, gap: 12 }} accessibilityLabel={label}>
      <ActivityIndicator color={c.sage} size="large" />
      <Txt variant="small">{label}</Txt>
    </View>
  );
}

export function Header({ title, eyebrow, right, onBack }: { title: string; eyebrow?: string; right?: React.ReactNode; onBack?: () => void }) {
  return (
    <Row between align="flex-start">
      {onBack ? <IconButton icon="back" label="Back" onPress={onBack} /> : null}
      <View style={{ flex: 1, gap: 2 }}>
        {eyebrow ? <Txt variant="eyebrow">{eyebrow}</Txt> : null}
        <Txt variant="screen">{title}</Txt>
      </View>
      {right}
    </Row>
  );
}

export function SheetHeader({ eyebrow, onClose }: { eyebrow: string; onClose: () => void }) {
  return (
    <Row between>
      <Txt variant="eyebrow">{eyebrow}</Txt>
      <IconButton icon="close" label="Close" onPress={onClose} />
    </Row>
  );
}

export function Section({ title, right, children, tint, label }: Children & { title: string; right?: React.ReactNode; tint?: boolean; label?: string }) {
  return (
    <Card tint={tint} label={label}>
      <Row between>
        <Txt variant="eyebrow" role="heading">{title}</Txt>
        {right}
      </Row>
      {children}
    </Card>
  );
}

export type { PressableProps };
