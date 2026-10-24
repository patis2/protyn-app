# Changelog

## 1.3.0 (2026-10-24)

- **P logo is back everywhere.** The original Protyn "P" mark (a stem and a protein ring) is the logo again on the landing screen, app icon, browser tab, header and reward cards. The plate-and-dumbbell mark from 1.2.0 stays in `assets/brand/protyn-icon-v2.svg` as an alternate.
- **Bigger landing screen.** The logo, name and tagline are larger. The logo builds itself (the tile lands, the stem rises, the ring appears and the coral protein arc sweeps round), then floats gently. Motion is skipped when the device asks to reduce it.
- **Netlify badge no longer covers buttons on phones.** Netlify's free plan adds a "Powered by Netlify" badge to the bottom-right corner that can't be turned off. On screens narrower than 600 px the app now leaves a strip at the bottom for it, so the tab bar and buttons stay clear. Desktop is unchanged.

## 1.2.0 (2026-10-24)

- **New tagline and logo.** "Plan it. Plate it. Pump it." The new mark shows a plate of home food (dal, greens, roti) with a dumbbell. The landing screen now shows only the logo building itself, the name and the tagline. The original brand files are kept; the new mark is `assets/brand/protyn-icon-v2.svg`.
- **Food from your state.** Onboarding asks for your state or union territory instead of a region, and meals come from that state's home cooking first. When a diet leaves too few dishes for a meal, the nearest region fills in. About 95 state dishes were added, each checked against a source listed in `docs/state-food-sources.md`.
- **Full name and inches.** Onboarding asks for your full name (greetings use your first name). Waist and other body measurements are in inches; earlier centimetre entries are converted automatically.
- **Shareable rewards.** Milestones (first workout, 5/10/25/50 workouts, a protein week, habits kept, check-ins, one month strong) unlock a reward card with your name that you can share to WhatsApp, Instagram or Facebook, or save as an image. Cards never show weight, measurements or health answers, and you can hide your name.

## 1.1.0 (2026-10-24)

- **Landing screen.** New visitors first see the Protyn logo build itself (tile, strength bar, then protein ring), followed by the name and tagline "Ghar ka khana. Real protein. A stronger you."
- **Livelier design.** A deep sage banner with a protein ring on Today, soft background shapes, gentle card shadows, and calm motion: screens ease in, buttons give under the finger, ticks and tabs pop, and bars fill. All motion is skipped when the device asks to reduce motion.
- **Non-vegetarian diet.** A new "Non-vegetarian" choice with chicken, fish, prawn and mutton dishes from every region. Fish and prawns/shellfish are new allergy options, and meat stays out of every other diet. Recipes with meat or fish carry a cooking safety note.
- **Meals stay in your region.** Plans now use only your region's dishes (plus pan-Indian ones). Other regions fill in only when your filters leave fewer than two options for a meal. Added Odia and Bengali dishes such as ghuguni, chakuli pitha, dalma, chhena tarkari, chhena besara, machha jhola and kukuda kasa.
- **No habit limit.** Choose as many habits to build or cut back on as you like. Ten new habits added.
- **Demo.** The demo user is now Rajashree from Bhubaneswar (non-vegetarian, East Indian food).

## 1.0.0

First version: onboarding, Today dashboard, meal plans with swaps and shopping list, workouts with easier and harder options, habits, progress history and demo mode.
