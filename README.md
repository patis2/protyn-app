# Protyn

A weekly plan for more protein and strength, made from the food Indian home cooks already make: vegetarian, eggetarian, Jain, vegan or non-vegetarian, from your own state. Tagline: *Plan it. Plate it. Pump it.* One Expo (React Native) codebase runs as an Android app, an iOS app and a responsive web app.

> General wellness guidance, not medical advice. Recipes, protein estimates and exercises are a **starter library that has not yet been reviewed** by a registered dietitian or a certified trainer. Nothing here is clinically validated.

## Run it

```bash
npm install
npm run web        # browser, at http://localhost:8081
npm start          # scan the QR code with Expo Go on your phone
npm test           # 38 rule and safety tests
npm run typecheck
npm run build:web  # static web build in dist/
```

Open the app and choose **Try the demo** to see three weeks of sample data (Rajashree, Bhubaneswar), or **Get started** to set up your own plan. Data is stored on the device.

### Turning on accounts (optional)

1. Create a Supabase project in the Mumbai region.
2. Run `supabase/schema.sql` in its SQL editor and deploy `supabase/functions/delete-account`.
3. Copy `.env.example` to `.env.local` and fill in the project URL and anon key.

Sign-in then uses a 6-digit code sent by email. Phone OTP can be switched on in Supabase once an SMS provider with DLT registration is set up.

## What's in version one

| Area | What works |
| --- | --- |
| Onboarding | 8 steps: about you, goal, activity, food, workouts, habits, health check, plan preview. Optional steps can be skipped, each step explains why it asks, inputs are validated with plain-language errors, under-18s are stopped kindly. |
| Today | Goal and plan summary, today's workout, protein meter, today's meals, habits, energy/mood/difficulty check-in, week dots. |
| Food | Week view, swap, recipe with portions in katoris, steps, substitutions and "why this", mark eaten, save meals, plate check-in for off-plan food, shopping list grouped by type (copy or share). |
| Move | Week schedule on your chosen days, home or gym, session details, workout player with warm-up, sets, rest timer, easier and harder options, "something hurts" flow, cool-down and feedback. |
| Habits | Up to five habits to build or cut back on, daily ticks, week view, notes, no streak penalties. |
| Progress | Weekly summary, sessions, protein days, habits and energy trends, optional measurements (weight in kg; waist, hips, chest and arm in inches) with charts, and shareable milestone reward cards for WhatsApp, Instagram and Facebook (no health data on the card). |
| Me | Profile and goal editing, reminders, consents, export (JSON file), delete data, safety notes. |

## Safety rules (src/domain/safety.ts, nutrition.ts, workouts.ts)

- Diet, allergies and foods to avoid are hard filters. Every plan passes through `withSafety`, and saved swaps are re-checked, so a new allergy can't resurface an old swap.
- Protein is shown as a range, never a calorie target. There is no calorie counting.
- Health answers turn on gentler defaults. A history of disordered eating hides weight and pauses weight-loss pacing; pregnancy and injury start moves on easier options. Everyone sees "see a professional" guidance.
- "Too hard" feedback, pain reports or low-energy check-ins make the next session easier.
- Weight is off by default and is never on the dashboard.

## Architecture

```
src/app/        screens (Expo Router). (tabs)/ holds the five tabs plus Me.
src/ui/         design tokens, UI kit, charts, icons. One design system for phone and web.
src/domain/     pure TypeScript rules: nutrition, workouts, safety, stats, validation (Zod).
src/content/    starter recipe and exercise library (CONTENT_VERSION marks it unreviewed).
src/data/       store, on-device storage, demo data, reminders, optional Supabase sync.
supabase/       schema with row-level security, delete-account function.
tests/          Vitest tests for the rules.
```

**Plugging in reviewed content or a recommendation service.** Screens ask `provider` (`src/domain/provider.ts`) for meals and workouts. Replace `RulesProvider` with any object implementing `RecommendationProvider` (for example, one backed by a reviewed content API). It is still wrapped by `withSafety`, so allergy and diet filters always run.

**Data protection.** On phones, health answers are kept in the OS secure store (Keychain/Keystore) and sign-in tokens likewise. With an account, everything except health answers syncs to a single row per user protected by row-level security. Export and delete are in Me › Privacy and data.

## Known gaps before a beta

- Expert review of every recipe, protein value and exercise (the deck's biggest open item).
- Normalised database tables, server-side safety re-check, and offline-first sync conflict handling (v1 sync is last write wins).
- Phone OTP and Google sign-in; currently email code only.
- Web reminders (phone reminders work through local notifications).
- Privacy notice, terms, grievance contact and a DPDP review by an Indian privacy lawyer.
- Accessibility audit with real screen readers; automated checks cover roles and labels only.
- App store builds via EAS (`npx eas-cli build`).
