# Praise Feed

## Goal

Bring Duolingo's feed/cheer pattern into a private family context. Children should feel seen by their parent, not only scored by the app.

## Feed Events

- Mission approved.
- Reward redeemed.
- Streak milestone reached.
- Badge unlocked.
- Family quest completed.
- Parent sent praise.

## Parent Praise Options

After approving a mission, parent can optionally choose:

- Great effort!
- I am proud of you!
- You kept your promise!
- You did it without reminders!
- Amazing comeback!

## User Experience

Child dashboard shows latest 3 positive items:

```text
Today
Dad approved Brush Teeth. "Great effort!"
You reached a 3-day streak.
You earned the Morning Hero badge.
```

Child history can show a fuller feed.

Parent mode should not be cluttered. Add praise picker after approval or inside verification success modal.

## Tone Rules

- Feed should be positive or neutral.
- Do not show rejected/missed items in the child feed unless framed constructively.
- Avoid guilt copy.
- Keep messages short.

## Data Model Draft

```ts
interface PraiseFeedItem {
  id: string;
  child_id: string;
  type: 'MISSION_APPROVED' | 'REWARD_REDEEMED' | 'STREAK' | 'BADGE' | 'FAMILY_QUEST' | 'PRAISE';
  message: string;
  reference_id?: string;
  created_at: string;
}
```

## Trigger Points

- `verifyTask`: create mission approved feed item.
- praise picker: attach custom praise to feed item.
- `redeemReward`: create reward redeemed item.
- achievement unlock: create badge item.
- family quest completion: create family item.

## Backup And Restore

Decision needed:

- If feed is treated as family memory/history, include it in backup.
- If feed is treated as ephemeral UI, exclude it and regenerate from history.

Recommendation: include it once implemented, because praise messages are authored family content.

## Audit Points

- No duplicate feed item for same verified log.
- Parent-authored praise survives backup/restore.
- Feed remains private/offline.
- Does not expose parent-only details in child mode.

