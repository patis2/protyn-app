import { Redirect } from 'expo-router';
import { useStore } from '../data/store';

export default function Index() {
  const { state } = useStore();
  if (state.onboarded) return <Redirect href="/today" />;
  if (state.mode !== 'none') return <Redirect href="/onboarding" />;
  return <Redirect href="/welcome" />;
}
