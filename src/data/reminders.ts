import { Platform } from 'react-native';
import type { Profile, Reminders } from '../domain/types';

// Local, on-device reminders. Messages are encouraging and never mention
// weight. Quiet hours (10 pm to 7 am) are respected by the fixed times below.
// Web browsers don't get scheduled reminders in this version.

export const remindersSupported = Platform.OS === 'ios' || Platform.OS === 'android';

const COPY = {
  workout: 'Your 20-minute session is ready when you are. An easier version is one tap away.',
  meals: 'Tomorrow’s meals are planned. Take a look at the shopping list if you need anything.',
  habits: 'Quick check-in: how did today go? Missed things are fine. Tomorrow starts fresh.',
  summary: 'Your weekly summary is ready. See what went well this week.',
};

/** Replaces all scheduled reminders with ones that match the current settings. Returns false if permission was refused. */
export async function syncReminders(r: Reminders, p: Profile, allowed: boolean): Promise<boolean> {
  if (!remindersSupported) return true;
  const N = await import('expo-notifications');
  await N.cancelAllScheduledNotificationsAsync();
  if (!allowed || !(r.workout || r.meals || r.habits || r.summary)) return true;
  const perm = await N.requestPermissionsAsync();
  if (!perm.granted) return false;
  const [hh, mm] = r.time.split(':').map(Number);
  const weekly = (weekday: number, hour: number, minute: number, body: string) =>
    N.scheduleNotificationAsync({
      content: { title: 'Protyn', body },
      trigger: { type: N.SchedulableTriggerInputTypes.WEEKLY, weekday, hour, minute },
    });
  const daily = (hour: number, minute: number, body: string) =>
    N.scheduleNotificationAsync({ content: { title: 'Protyn', body }, trigger: { type: N.SchedulableTriggerInputTypes.DAILY, hour, minute } });
  // Our days run Monday = 0; the OS counts Sunday = 1.
  if (r.workout) for (const d of p.workoutDays) await weekly(((d + 1) % 7) + 1, hh, mm, COPY.workout);
  if (r.meals) await daily(20, 0, COPY.meals);
  if (r.habits) await daily(21, 0, COPY.habits);
  if (r.summary) await weekly(1, 18, 0, COPY.summary);
  return true;
}
