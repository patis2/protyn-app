import { useEffect, useState } from 'react';
import { Platform, useWindowDimensions } from 'react-native';

// Netlify's free plan adds a fixed "Powered by Netlify" badge to the
// bottom-right corner of every page, and it can't be turned off there. On
// narrow screens it would cover the tab bar and bottom buttons, so while the
// badge is on the page we keep that strip of the screen free for it.

const BADGE_ID = 'nl-badge-frame';
const NARROW = 600;

function badgeHeight(): number {
  const el = document.getElementById(BADGE_ID);
  if (!el) return 0;
  const style = getComputedStyle(el);
  if (style.display === 'none' || style.visibility === 'hidden') return 0;
  return el.getBoundingClientRect().height;
}

/** Space to leave at the bottom of the app for the host's badge, in points. */
export function useHostBadgeInset(): number {
  const { width } = useWindowDimensions();
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') return;
    const check = () => setHeight(Math.round(badgeHeight()));
    check();
    const watch = new MutationObserver(check);
    watch.observe(document.body, { childList: true, subtree: false, attributes: true, attributeFilter: ['style', 'class'] });
    const badge = document.getElementById(BADGE_ID);
    if (badge) watch.observe(badge, { attributes: true });
    // The badge sets its size a moment after it is added.
    const late = setTimeout(check, 1500);
    return () => {
      watch.disconnect();
      clearTimeout(late);
    };
  }, []);

  return Platform.OS === 'web' && width < NARROW ? height : 0;
}
