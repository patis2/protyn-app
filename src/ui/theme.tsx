import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
import { AccessibilityInfo, Text, useColorScheme, useWindowDimensions, View } from 'react-native';
import { dark, font, light, sidebarBreakpoint, type Palette } from './tokens';

export function useColors(): Palette {
  return useColorScheme() === 'dark' ? dark : light;
}

export function useWide() {
  const { width } = useWindowDimensions();
  return width >= sidebarBreakpoint;
}

// Small toast for confirmations. It is announced to screen readers too.
type ToastCtx = (msg: string) => void;
const ToastContext = createContext<ToastCtx>(() => undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const c = useColors();
  const [msg, setMsg] = useState('');
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const show = useCallback((m: string) => {
    setMsg(m);
    AccessibilityInfo.announceForAccessibility?.(m);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setMsg(''), 2800);
  }, []);
  return (
    <ToastContext.Provider value={show}>
      {children}
      {msg ? (
        <View
          accessibilityLiveRegion="polite"
          role="status"
          pointerEvents="none"
          style={{ position: 'absolute', left: 16, right: 16, bottom: 96, alignItems: 'center' }}
        >
          <View style={{ backgroundColor: c.ink, paddingVertical: 11, paddingHorizontal: 14, borderRadius: 14, maxWidth: 480, width: '100%' }}>
            <Text style={{ color: c.bg, fontFamily: font.body, fontSize: 14 }}>{msg}</Text>
          </View>
        </View>
      ) : null}
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
