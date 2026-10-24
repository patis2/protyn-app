import { Platform, Share } from 'react-native';
import { SHARE_URL, shareText, type Reward } from '../domain/rewards';
import { font } from './tokens';

// Builds the shareable reward card as a PNG (1080 × 1350, Instagram's portrait
// size) and hands it to the share sheet. Web only for the image: on the
// phone apps the card is shared as text with a link until image capture is added.

const W = 1080;
const H = 1350;

const LOGO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><rect width="120" height="120" rx="28" fill="#2F5240"/><rect x="30" y="30" width="11" height="60" rx="5.5" fill="#F8F1E9"/><circle cx="70" cy="50" r="18" fill="none" stroke="#677E6F" stroke-width="11"/><circle cx="70" cy="50" r="18" fill="none" stroke="#E8735A" stroke-width="11" stroke-dasharray="85 200" transform="rotate(-90 70 50)"/></svg>`;

const loadImage = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });

function wrap(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const lines: string[] = [];
  let line = '';
  for (const word of text.split(' ')) {
    const next = line ? `${line} ${word}` : word;
    if (ctx.measureText(next).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else line = next;
  }
  if (line) lines.push(line);
  return lines;
}

/** Draws the card. `name` is left off when the person chooses not to show it. */
export async function rewardPng(reward: Reward, name: string | null, dateLabel: string): Promise<Blob> {
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;
  await Promise.all(
    [`700 72px ${font.displayBold}`, `600 56px ${font.display}`, `400 36px ${font.body}`, `600 32px ${font.bodySemi}`].map((f) => document.fonts?.load(f).catch(() => null)),
  );

  ctx.fillStyle = '#2F5240';
  ctx.fillRect(0, 0, W, H);
  const blob = (x: number, y: number, r: number, color: string) => {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
  };
  blob(W - 60, 40, 420, 'rgba(79,122,94,0.45)');
  blob(40, H - 40, 320, 'rgba(232,115,90,0.22)');

  const logo = await loadImage(`data:image/svg+xml;charset=utf-8,${encodeURIComponent(LOGO_SVG)}`);
  ctx.drawImage(logo, 90, 90, 150, 150);
  ctx.fillStyle = '#F8F1E9';
  ctx.font = `700 84px ${font.displayBold}`;
  ctx.textBaseline = 'middle';
  ctx.fillText('protyn', 270, 168);

  ctx.textAlign = 'center';
  ctx.fillStyle = '#C9D8CD';
  ctx.font = `600 32px ${font.bodySemi}`;
  ctx.fillText('R E W A R D   U N L O C K E D', W / 2, 360);

  // The badge
  blob(W / 2, 620, 200, '#F8F1E9');
  ctx.beginPath();
  ctx.arc(W / 2, 620, 168, 0, Math.PI * 2);
  ctx.strokeStyle = '#E8735A';
  ctx.lineWidth = 20;
  ctx.stroke();
  ctx.fillStyle = '#2F5240';
  ctx.font = `700 ${reward.figure.length > 2 ? 140 : 180}px ${font.displayBold}`;
  ctx.fillText(reward.figure, W / 2, 630);

  ctx.fillStyle = '#F8F1E9';
  ctx.font = `700 76px ${font.displayBold}`;
  ctx.fillText(reward.title, W / 2, 900);

  ctx.font = `600 52px ${font.display}`;
  let y = 1000;
  if (name) {
    ctx.fillText(name, W / 2, y);
    y += 66;
  }
  ctx.fillStyle = '#C9D8CD';
  ctx.font = `400 36px ${font.body}`;
  const line = name ? reward.line : `Earned ${dateLabel}`;
  for (const l of wrap(ctx, line.charAt(0).toUpperCase() + line.slice(1), 860)) {
    ctx.fillText(l, W / 2, y);
    y += 48;
  }

  ctx.fillStyle = '#F5B4A1';
  ctx.font = `600 46px ${font.display}`;
  ctx.fillText('Plan it. Plate it. Pump it.', W / 2, 1220);
  ctx.fillStyle = '#C9D8CD';
  ctx.font = `400 30px ${font.body}`;
  ctx.fillText(SHARE_URL.replace('https://', ''), W / 2, 1278);

  return new Promise((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Could not create the image.'))), 'image/png'));
}

export type ShareTarget = 'any' | 'whatsapp' | 'facebook' | 'instagram' | 'save';
export type ShareOutcome = 'shared' | 'opened' | 'saved' | 'cancelled';

const fileName = (r: Reward) => `protyn-${r.id}.png`;

function download(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

/**
 * Shares the card. On phones the system share sheet carries the image to
 * WhatsApp, Instagram or Facebook. Where the browser can't share images,
 * WhatsApp and Facebook open with a text post and the image is saved instead.
 */
export async function shareReward(reward: Reward, name: string | null, dateLabel: string, target: ShareTarget): Promise<ShareOutcome> {
  const text = shareText(name ?? '', reward);
  if (Platform.OS !== 'web') {
    const res = await Share.share({ message: text });
    return res.action === Share.dismissedAction ? 'cancelled' : 'shared';
  }
  const blob = await rewardPng(reward, name, dateLabel);
  const file = new File([blob], fileName(reward), { type: 'image/png' });
  if (target === 'save') {
    download(blob, file.name);
    return 'saved';
  }
  const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean };
  if (nav.share && nav.canShare?.({ files: [file] })) {
    try {
      await nav.share({ files: [file], text, title: `Protyn: ${reward.title}` });
      return 'shared';
    } catch (e) {
      if ((e as Error).name === 'AbortError') return 'cancelled';
    }
  }
  if (target === 'whatsapp') {
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
    return 'opened';
  }
  if (target === 'facebook') {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(SHARE_URL)}`, '_blank', 'noopener');
    return 'opened';
  }
  download(blob, file.name);
  return 'saved';
}

/** A preview image for the reward screen, as a data URL. */
export async function rewardPreview(reward: Reward, name: string | null, dateLabel: string): Promise<string | null> {
  if (Platform.OS !== 'web') return null;
  const blob = await rewardPng(reward, name, dateLabel);
  return URL.createObjectURL(blob);
}
