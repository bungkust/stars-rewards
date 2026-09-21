# Star Habit Design Guide

Use this guide whenever updating UI so Star Habit stays visually consistent.

## Design Intent

Star Habit is a mobile-first family habit app. The interface should feel friendly for children, calm for parents, and fast for repeated daily use.

- Child mode: playful, bright, rewarding, simple.
- Parent mode: organized, trustworthy, operational.
- The app should feel like a polished native mobile app, not a marketing website.
- Keep screens focused on the task at hand: missions, rewards, verification, history, settings.

## Theme System

Use DaisyUI themes from `tailwind.config.js`. Do not hardcode a new global palette unless a screen genuinely needs a one-off state color.

### Child Theme

`childTheme` is used in child mode (`/child/*`).

- `primary`: `#38BDF8` sky blue (CTA buttons, active navigation, active progress bars)
- `secondary`: `#99E6C9` mint (glows, secondary badges)
- `accent`: `#FFCC99` soft peach
- `neutral`: `#013576` deep blue (all primary headings, card titles, text)
- `base-100`: `#FFFFFF` (page background and card backgrounds)
- `success`: `#5FE28A` (completed badges, claimed milestones)
- `warning`: `#FFD580` (stars, coins, streak fire, star badges)
- `error`: `#FF6B6B`

Child UI should lean on `primary` (`#38BDF8`), `warning` (`#FFD580`), white surfaces, soft shadows, rounded shapes, and clear status badges.

### Parent Theme

`parentTheme` is used in parent mode (`/parent/*`, `/settings/*`, parent modals).

- `primary`: `#ABC270` sage green (parent primary actions, parent active nav tab)
- `secondary`: `#FEC868` warm yellow
- `accent`: `#FDA769` orange
- `neutral`: `#463C33` warm dark brown (parent headings and text)
- `base-100`: `#F9FAFB` (subtle off-white background)
- `success`: `#7ADF93`
- `warning`: `#FFCC99`
- `error`: `#C83F49`

Parent UI should feel steadier, calmer, and more operational. Never use child's playful bright blue in parent mode; always use sage green `#ABC270` and dark brown `#463C33`.

### Champ & Loyalty Feature Design Guidelines

The **Champ** tab (`/child/loyalty`) is the child's loyalty & streak hub:
- **Child Mode (`/child/loyalty`):**
  - Uses `childTheme` colors: deep navy text `#013576`, sky blue `#38BDF8` progress & claim buttons, warm gold `#FFD580` star badges.
  - Cosmic Tier Card: Navy-to-sky gradient, 5 swipable tiers (Bulan → Galaksi) with dot indicator.
  - Streak Challenge Cards: Clean white card, top-left gold star badge, bold navy title, dashed divider, left/right progress numbers, horizontal progress bar, and pill-shaped claim button.
- **Parent Mode (`EditChildModal`):**
  - Uses `parentTheme` colors: sage green accents, dark brown labels `#463C33`, muted borders.
  - Provides manual numeric inputs for adjusting a child's current streak and best streak.


## Layout Rules

- This app is mobile-first. Design for narrow screens first.
- Main app screens live under `Layout`, with fixed header and fixed bottom nav.
- Keep page content inside the existing main padding: `p-4 pt-28 pb-36`.
- Preserve safe-area support:
  - top: `pt-[env(safe-area-inset-top)]` or `.pt-safe`
  - bottom: `pb-[calc(env(safe-area-inset-bottom)+...)]` or `.pb-safe`
- Use vertical stacks with `gap-4` or `gap-6`.
- Avoid desktop-only layouts. Desktop can use modest grid upgrades, but mobile behavior must remain primary.
- Do not create landing-page style hero sections inside the authenticated app.

## Core Components

Prefer existing design-system components before making new ones.

### Cards

Use `AppCard` for standard surfaces:

```tsx
<AppCard>...</AppCard>
```

Default card style:

- white background
- `rounded-xl`
- `shadow-md`
- `p-4 md:p-6`

Use cards for individual repeated items, grouped settings, modals, stats blocks, and list containers. Do not nest cards inside cards unless the inner item is a real repeated row or control group.

### Buttons

Use:

- `PrimaryButton` for primary form actions.
- `SecondaryButton` for cancel/secondary actions.
- `ToggleButton` for filters, segmented controls, recurrence options, and mode choices.
- DaisyUI icon buttons for small edit/delete/back controls.

Button conventions:

- Primary action: `btn-primary`, white text, rounded `xl` when large.
- Destructive action: `btn-error` or `type="danger"` in `AlertModal`.
- Floating add action: use `WarningCTAButton`.
- Filter chips: use `ToggleButton`, not custom pill markup.

### Headers

Use `H1Header` for page titles.

```tsx
<H1Header>Manage Missions</H1Header>
```

Page title size should usually be `text-2xl font-bold text-neutral`. Do not use oversized hero typography inside app screens.

### Icons

- Use existing icon maps in `src/utils/icons.ts` for task/reward/category icons.
- Use `IconWrapper` for simple section icons.
- Keep icon sizes consistent:
  - section/list icons: `w-5 h-5` or `w-6 h-6`
  - card thumbnails: 44-64px containers
  - bottom nav: 24px
- Do not introduce a new icon library unless there is no suitable existing icon.

### Modals

Use existing modal patterns:

- `Modal` for general custom content.
- `AlertModal` for confirmation.
- Feature-specific modals in `src/components/modals`.

Modal style:

- `fixed inset-0`
- `bg-black/50` or `bg-black/60`
- `backdrop-blur-sm`
- white panel
- `rounded-2xl` or `rounded-3xl`
- scale/opacity transition when possible

## Screen Patterns

### Onboarding

Onboarding screens use centered forms, `app-gradient`, and a max width around `max-w-md`.

Keep onboarding friendly and guided:

- One major task per screen.
- Large page title.
- Short helper copy.
- Full-width primary CTA.
- Use quick templates where relevant.

### Child Dashboard

Child dashboard should prioritize:

- active child profile
- current star balance
- today's missions
- visible completion state
- easy action buttons

Mission cards should show:

- icon or custom image
- mission name
- star value
- recurrence/status badge
- progress info when applicable
- primary action (`Done` or `+`) only when actionable

Status colors:

- active: primary border
- pending: warning
- approved/verified: success
- failed/rejected: error
- excused/skipped: neutral/ghost
- in progress: blue/primary progress

### Parent Dashboard

Parent dashboard should prioritize pending decisions.

Verification cards should show:

- child name
- mission title
- reward amount or skip request note
- approve/reject icon buttons

Keep parent dashboard concise. Parent workflows should be scannable and fast.

### Mission And Reward Forms

Form layout should use:

- `flex flex-col gap-6`
- `form-control`
- bold labels
- rounded inputs: `input input-bordered rounded-xl`
- optional helper text in `label-text-alt`
- quick template buttons in small two-column grids
- assignment selectors as selectable child rows/cards

Mission forms should preserve:

- title max length 25
- emoji removal behavior
- category selection grid
- icon/image selector
- simple vs progress style toggle
- reward presets
- expiry time
- recurrence builder
- assignment to children

Reward forms should preserve:

- name max length 25
- emoji removal behavior
- cost presets and custom cost
- reward type cards: unlimited, one-time, milestone
- milestone unlock requirement
- icon/image selector
- assignment to children

### Lists And History

List rows should be compact but readable:

- icon/avatar on the left
- main title with `font-bold`
- metadata under title
- action buttons on the right
- `line-clamp` long titles/descriptions

History screens use:

- search input
- filter toggle button
- expandable filter panel
- `HistoryList`
- `HistoryDetailModal`
- load more pagination

Do not replace this with table-heavy desktop UI.

### Settings

Settings are grouped into `AppCard` sections:

- Family Information
- Notifications
- Security
- Customization
- Data Management
- Legal & Policy
- Danger Zone

Each settings row should use:

- small icon container
- title
- short description
- chevron or action button

Danger actions must remain visually separate with error coloring.

## Typography

- Page title: `text-2xl font-bold text-neutral`.
- Section title: `text-lg font-bold`.
- Card title: `font-bold text-neutral`.
- Metadata: `text-xs` or `text-sm` with `text-neutral/60` or `text-gray-500`.
- Avoid negative letter spacing.
- Avoid scaling text with viewport width.
- Keep labels short. Prefer direct nouns/actions.

## Spacing And Shape

- Standard page gap: `gap-6`.
- Standard list/card gap: `gap-3` or `gap-4`.
- Standard card radius: `rounded-xl`.
- Modal panel radius: `rounded-2xl` or `rounded-3xl`.
- Primary large buttons: `rounded-xl`.
- Toggle chips: `rounded-full`.
- Use soft shadows: `shadow-sm`, `shadow-md`, `shadow-xl` for modals.

Avoid adding very large rounded decorative blocks that do not carry content.

## Imagery

- Custom task/reward images should be displayed in fixed-size rounded containers.
- Use `object-cover` for thumbnail-like images.
- Use `object-contain` for previewing uploaded images in form controls.
- Uploaded images are converted to WebP before storage. Keep this behavior.
- Do not add remote stock imagery to core app screens.

## Motion

Use motion sparingly and consistently:

- Page transitions use `PageTransition` and `AnimatePresence`.
- Modals use opacity/scale transitions.
- Child task swipe is used for skip/exemption.
- Buttons may use `active:scale-95`.

Do not add heavy animation that slows daily mission completion.

## Accessibility And Interaction

- Interactive cards may be clickable, but nested buttons must call `e.stopPropagation()`.
- Form inputs should have stable `id` and `name` where possible.
- Keep touch targets large enough for mobile: buttons should usually be `btn-sm` or larger.
- Use disabled states instead of allowing invalid submissions.
- Status must be visible through text/badges, not color alone.

## Do Not

- Do not create a new design language for a single feature.
- Do not add a marketing landing-page style screen inside the authenticated app.
- Do not use huge hero sections for operational views.
- Do not replace DaisyUI theme tokens with unrelated hardcoded palettes.
- Do not introduce dense desktop tables for mobile-first workflows.
- Do not hide parent-only actions in child screens without auth protection.
- Do not use unbounded image sizes or dynamic content that shifts card layout.
- Do not add decorative gradient blobs, floating orbs, or purely ornamental backgrounds to app screens.
- Do not remove safe-area spacing for native mobile.

## AI Update Checklist

Before finishing a UI change, verify:

- The screen works in both parent and child theme if it is shared.
- New colors come from DaisyUI theme tokens or existing status colors.
- New cards/buttons use existing design-system patterns.
- Text fits on mobile and uses line clamps where needed.
- Forms have disabled invalid submit states.
- Parent-only actions are protected.
- Empty states exist for lists.
- Loading/error states are not raw browser-only `alert` unless matching existing local behavior temporarily.
- Native-safe spacing is preserved around header and bottom nav.
