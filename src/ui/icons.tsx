import React from 'react';
import { View } from 'react-native';
import Svg, { Circle, Defs, Ellipse, G, Path, RadialGradient, Rect, Stop } from 'react-native-svg';
import { useTween } from './motion';
import { useColors } from './theme';

export type IconName = 'home' | 'food' | 'move' | 'habits' | 'progress' | 'user' | 'check' | 'back' | 'close' | 'list' | 'plus' | 'minus' | 'heart' | 'shield' | 'plan' | 'plate' | 'dumbbell' | 'trophy' | 'share' | 'download';

type Props = { name: IconName; size?: number; color: string; strokeWidth?: number };

/** Line icons drawn on a 24 px grid, matching the prototype. Always decorative: label the button instead. */
export function Icon({ name, size = 22, color, strokeWidth = 1.8 }: Props) {
  const common = { stroke: color, strokeWidth, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, fill: 'none' };
  const paths: Record<IconName, React.ReactNode> = {
    home: (<><Path d="M3 11l9-7 9 7" {...common} /><Path d="M5 10v10h14V10" {...common} /><Path d="M10 20v-6h4v6" {...common} /></>),
    food: (<><Path d="M3 12h18" {...common} /><Path d="M4 12a8 8 0 0016 0" {...common} /><Path d="M9 8c0-2 2-2 2-4M13 8c0-2 2-2 2-4" {...common} /></>),
    move: <Path d="M6.5 6.5v11M17.5 6.5v11M3.5 9v6M20.5 9v6M6.5 12h11" {...common} />,
    habits: (<><Circle cx={12} cy={12} r={9} {...common} /><Path d="M8 12.5l2.8 2.8L16.5 9.5" {...common} /></>),
    progress: <Path d="M4 20V10M10 20V4M16 20v-7M22 20H2" {...common} />,
    user: (<><Circle cx={12} cy={8} r={4} {...common} /><Path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" {...common} /></>),
    check: <Path d="M5 12.5l4.5 4.5L19 7.5" {...common} strokeWidth={2.6} />,
    back: <Path d="M15 5l-7 7 7 7" {...common} strokeWidth={2} />,
    close: <Path d="M6 6l12 12M18 6L6 18" {...common} strokeWidth={2} />,
    list: (<><Path d="M9 6h11M9 12h11M9 18h11" {...common} /><Circle cx={4.5} cy={6} r={1} {...common} /><Circle cx={4.5} cy={12} r={1} {...common} /><Circle cx={4.5} cy={18} r={1} {...common} /></>),
    plus: <Path d="M12 5v14M5 12h14" {...common} strokeWidth={2} />,
    minus: <Path d="M5 12h14" {...common} strokeWidth={2} />,
    heart: <Path d="M12 20s-7-4.4-7-10a4 4 0 017-2.6A4 4 0 0119 10c0 5.6-7 10-7 10z" {...common} />,
    shield: <Path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3z" {...common} />,
    plan: (<><Rect x={4} y={5} width={16} height={15} rx={2.5} {...common} /><Path d="M4 10h16M8.5 3v4M15.5 3v4M8 14.5l2 2 4-4" {...common} /></>),
    plate: (<><Circle cx={12} cy={12} r={8.5} {...common} /><Circle cx={12} cy={12} r={4.5} {...common} /><Path d="M2 5v5M2 7.5h0M22 4v16" {...common} /></>),
    dumbbell: <Path d="M3 9.5v5M6 7v10M18 7v10M21 9.5v5M6 12h12" {...common} strokeWidth={2.2} />,
    trophy: (<><Path d="M8 4h8v5a4 4 0 01-8 0V4z" {...common} /><Path d="M8 6H5a3 3 0 003 4M16 6h3a3 3 0 01-3 4M12 13v4M8.5 20h7M10 17h4" {...common} /></>),
    share: (<><Circle cx={18} cy={5.5} r={2.5} {...common} /><Circle cx={6} cy={12} r={2.5} {...common} /><Circle cx={18} cy={18.5} r={2.5} {...common} /><Path d="M8.2 10.8l7.6-4M8.2 13.2l7.6 4" {...common} /></>),
    download: <Path d="M12 4v11M7 10.5l5 5 5-5M5 20h14" {...common} />,
  };
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      {paths[name]}
    </Svg>
  );
}

/** The Protyn mark: a plate of home food and a dumbbell on deep sage. */
export function Logo({ size = 40 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 120 120" accessibilityLabel="Protyn" role="img">
      <Rect width={120} height={120} rx={28} fill="#2F5240" />
      <LogoArt />
    </Svg>
  );
}

/** Everything inside the tile, on the 120-unit grid. Shared by the static and animated marks. */
export function LogoArt({ parts = 'all' }: { parts?: 'all' | 'plate' | 'food' | 'dumbbell' }) {
  const plate = (
    <>
      <Circle cx={54} cy={58} r={31} fill="#F8F1E9" />
      <Circle cx={54} cy={58} r={23} fill="none" stroke="#E4DACC" strokeWidth={2} />
    </>
  );
  const food = (
    <>
      <Circle cx={45} cy={51} r={9} fill="#E8A33D" />
      <Circle cx={45} cy={51} r={5.5} fill="#F2C46A" />
      <Path d="M58 68 C 58 56, 68 50, 74 50 C 74 60, 68 70, 58 68 Z" fill="#6FA07A" />
      <Path d="M60 66 L 71 53" stroke="#2F5240" strokeWidth={1.4} strokeLinecap="round" />
      <Circle cx={44} cy={70} r={6} fill="#D9B98A" />
    </>
  );
  const dumbbell = (
    <G transform="rotate(-35 84 86)">
      <Rect x={66} y={83} width={36} height={6} rx={3} fill="#E8735A" />
      <Rect x={64} y={75} width={8} height={22} rx={3} fill="#E8735A" />
      <Rect x={96} y={75} width={8} height={22} rx={3} fill="#E8735A" />
      <Rect x={58} y={78} width={6} height={16} rx={2.5} fill="#F08D74" />
      <Rect x={104} y={78} width={6} height={16} rx={2.5} fill="#F08D74" />
    </G>
  );
  if (parts === 'plate') return plate;
  if (parts === 'food') return food;
  if (parts === 'dumbbell') return dumbbell;
  return (
    <>
      {plate}
      {food}
      {dumbbell}
    </>
  );
}

export function PlateArt({ size = 96, color }: { size?: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100" fill="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <Circle cx={50} cy={50} r={46} fill={color} opacity={0.12} />
      <Circle cx={50} cy={50} r={38} stroke={color} strokeWidth={2.5} />
      <Circle cx={34} cy={38} r={11} stroke={color} strokeWidth={2.5} />
      <Circle cx={62} cy={34} r={9} stroke={color} strokeWidth={2.5} />
      <Circle cx={64} cy={62} r={11} stroke={color} strokeWidth={2.5} />
      <Ellipse cx={36} cy={64} rx={12} ry={8} stroke={color} strokeWidth={2.5} />
    </Svg>
  );
}

export function FigureArt({ size = 120, color }: { size?: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 120 120" fill="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <Circle cx={60} cy={22} r={10} stroke={color} strokeWidth={4} />
      <Path d="M60 34v34M60 44l-24 12M60 44l24 12M60 68l-16 30M60 68l16 30M26 54h-8M102 54h-8M18 48v12M102 48v12" stroke={color} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

/** Soft background shapes at the top of every screen. Purely decorative. */
export function Aura() {
  const c = useColors();
  return (
    <View pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 360 }} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <Svg width="100%" height="100%">
        <Defs>
          <RadialGradient id="auraSage" cx="50%" cy="50%" r="50%">
            <Stop offset="0" stopColor={c.sage} stopOpacity={0.22} />
            <Stop offset="1" stopColor={c.sage} stopOpacity={0} />
          </RadialGradient>
          <RadialGradient id="auraCoral" cx="50%" cy="50%" r="50%">
            <Stop offset="0" stopColor={c.coral} stopOpacity={0.18} />
            <Stop offset="1" stopColor={c.coral} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Circle cx="88%" cy={40} r={180} fill="url(#auraSage)" />
        <Circle cx="6%" cy={150} r={150} fill="url(#auraCoral)" />
      </Svg>
    </View>
  );
}

/** A progress ring: the coral arc fills toward the range, sage once you're in it. */
export function Ring({ pct, size = 96, stroke = 10, track, color, children }: { pct: number; size?: number; stroke?: number; track: string; color: string; children?: React.ReactNode }) {
  const r = (size - stroke) / 2;
  const len = 2 * Math.PI * r;
  const target = Math.max(0, Math.min(1, pct));
  const v = useTween(target, 900);
  const [p, setP] = React.useState(target);
  React.useEffect(() => {
    const id = v.addListener(({ value }) => setP(value));
    return () => v.removeListener(id);
  }, [v]);
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={{ position: 'absolute' }} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={track} strokeWidth={stroke} fill="none" />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${len * p} ${len}`}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      {children}
    </View>
  );
}
