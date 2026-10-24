import React, { useState } from 'react';
import { View } from 'react-native';
import Svg, { Circle, Line, Path, Polyline, Rect, Text as SvgText } from 'react-native-svg';
import { useColors } from './theme';
import { font } from './tokens';

// Small SVG charts that look the same on phones and on the web. Each chart has
// a text summary for screen readers, since the drawing itself is decorative.

function useWidth(): [number, (w: number) => void] {
  const [w, setW] = useState(300);
  return [w, setW];
}

type BarProps = { values: number[]; labels: string[]; max: number; target?: number; unit: string; title: string };

export function BarChart({ values, labels, max, target, unit, title }: BarProps) {
  const c = useColors();
  const [W, setW] = useWidth();
  const H = 140, pl = 26, pb = 20, top = 14;
  const step = (W - pl) / Math.max(values.length, 1);
  const bw = Math.min(30, step * 0.55);
  const y = (v: number) => H - pb - (v / (max || 1)) * (H - pb - top);
  const summary = `${title}. ${labels.map((l, i) => `${l}: ${values[i]} ${unit}`).join(', ')}.`;
  return (
    <View onLayout={(e) => setW(e.nativeEvent.layout.width)} accessibilityRole="image" accessibilityLabel={summary}>
      <Svg width={W} height={H} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        {[0, max / 2, max].map((v) => (
          <React.Fragment key={v}>
            <Line x1={pl} x2={W} y1={y(v)} y2={y(v)} stroke={c.line} strokeWidth={1} />
            <SvgText x={pl - 6} y={y(v) + 3} fontSize={10} fill={c.muted} textAnchor="end" fontFamily={font.body}>{Math.round(v)}</SvgText>
          </React.Fragment>
        ))}
        {target != null ? <Line x1={pl} x2={W} y1={y(target)} y2={y(target)} stroke={c.coral} strokeDasharray="4 3" strokeWidth={1.5} /> : null}
        {values.map((v, i) => {
          const x = pl + step * i + (step - bw) / 2;
          return (
            <React.Fragment key={i}>
              <Rect x={x} y={y(v)} width={bw} height={Math.max(y(0) - y(v), 1)} rx={4} fill={i === values.length - 1 ? c.coral : c.sage} />
              <SvgText x={x + bw / 2} y={H - 5} fontSize={10} fill={c.muted} textAnchor="middle" fontFamily={font.body}>{labels[i]}</SvgText>
              <SvgText x={x + bw / 2} y={y(v) - 4} fontSize={10} fill={c.muted} textAnchor="middle" fontFamily={font.body}>{v}</SvgText>
            </React.Fragment>
          );
        })}
      </Svg>
    </View>
  );
}

type LineProps = { points: number[]; labels: string[]; min?: number; max?: number; unit: string; title: string; decimals?: number };

export function LineChart({ points, labels, min, max, unit, title, decimals = 0 }: LineProps) {
  const c = useColors();
  const [W, setW] = useWidth();
  if (points.length === 0) return null;
  const lo = min ?? Math.floor(Math.min(...points) - 1);
  const hi = max ?? Math.ceil(Math.max(...points) + 1);
  const H = 130, pl = 34, pb = 20, top = 12, pr = 14;
  const step = (W - pl - pr) / Math.max(points.length - 1, 1);
  const x = (i: number) => pl + step * i;
  const y = (v: number) => H - pb - ((v - lo) / (hi - lo || 1)) * (H - pb - top);
  const fmt = (v: number) => (decimals ? v.toFixed(decimals) : String(Math.round(v)));
  const every = Math.ceil(labels.length / 6);
  const summary = `${title}. ${labels.map((l, i) => `${l}: ${fmt(points[i])} ${unit}`).join(', ')}.`;
  const area = `M${x(0)},${y(lo)} ${points.map((v, i) => `L${x(i)},${y(v)}`).join(' ')} L${x(points.length - 1)},${y(lo)} Z`;
  return (
    <View onLayout={(e) => setW(e.nativeEvent.layout.width)} accessibilityRole="image" accessibilityLabel={summary}>
      <Svg width={W} height={H} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        {[lo, (lo + hi) / 2, hi].map((v) => (
          <React.Fragment key={v}>
            <Line x1={pl} x2={W} y1={y(v)} y2={y(v)} stroke={c.line} strokeWidth={1} />
            <SvgText x={pl - 6} y={y(v) + 3} fontSize={10} fill={c.muted} textAnchor="end" fontFamily={font.body}>{fmt(v)}</SvgText>
          </React.Fragment>
        ))}
        <Path d={area} fill={c.sageSoft} opacity={0.8} />
        <Polyline points={points.map((v, i) => `${x(i)},${y(v)}`).join(' ')} fill="none" stroke={c.sage} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
        {labels.map((l, i) =>
          i % every === 0 || i === labels.length - 1 ? (
            <SvgText key={i} x={x(i)} y={H - 5} fontSize={10} fill={c.muted} textAnchor="middle" fontFamily={font.body}>{l}</SvgText>
          ) : null,
        )}
        <Circle cx={x(points.length - 1)} cy={y(points[points.length - 1])} r={4.5} fill={c.coral} />
      </Svg>
    </View>
  );
}
