import React from 'react';
import Svg, { Circle, Ellipse, Path, Rect } from 'react-native-svg';

export type IconName = 'home' | 'food' | 'move' | 'habits' | 'progress' | 'user' | 'check' | 'back' | 'close' | 'list' | 'plus' | 'minus' | 'heart' | 'shield';

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
  };
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      {paths[name]}
    </Svg>
  );
}

/** The Protyn app icon: strength bar and protein ring on deep sage. */
export function Logo({ size = 40 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 120 120" accessibilityLabel="Protyn" role="img">
      <Rect width={120} height={120} rx={28} fill="#2F5240" />
      <Rect x={30} y={30} width={11} height={60} rx={5.5} fill="#F8F1E9" />
      <Circle cx={70} cy={50} r={18} fill="none" stroke="#677E6F" strokeWidth={11} />
      <Circle cx={70} cy={50} r={18} fill="none" stroke="#E8735A" strokeWidth={11} strokeDasharray="85 200" transform="rotate(-90 70 50)" />
    </Svg>
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
