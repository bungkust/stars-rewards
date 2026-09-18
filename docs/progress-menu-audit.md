# Audit: Menu Progress (`/child/progress`)
*Star Habit — Product Audit Report*
*Generated: 2026-09-18*

---

## Overview

Menu Progress adalah pusat gamifikasi anak di Star Habit. Saat ini terdiri dari:
- **1 halaman utama** (`/child/progress`) → dashboard cards ringkasan
- **4 sub-halaman detail** via `/child/progress/:section`:
  - `quests` — Daily Quests
  - `unlocks` — Rewards Shelf (inventory)
  - `achievements` — Achievements + Claim Stars
  - `history` — XP History

---

## Struktur & Flow Saat Ini

```
/child/progress
├── Next Unlock card (Next level reward preview)
├── Daily Quests card (summary: X/3 completed)
├── [Grid] Personal League + Rewards Shelf
├── Achievements card (unlocked count + claim badge)
└── XP History card (latest XP gain preview)

Tap any card → navigate to detail sub-page
Back button → navigate('/child/progress')
```

---

## Yang Sudah Bagus ✅

### 1. Arsitektur data bersih dan testable
Seluruh kalkulasi gamifikasi di `gamificationUtils.ts` dan `xpUtils.ts`, terpisah dari UI.

### 2. Level curve realistis untuk anak
Level 1-5 butuh 50–350 XP (achievable minggu pertama), lalu 150 XP/level. Anak merasakan progress nyata.

### 3. Level rewards lengkap di 13 milestone
Badges, frames, titles, streak freeze, themes dari Level 2 hingga Level 100.

### 4. Achievements variatif (18 items, 3 kategori)
Mission count, streak milestone, XP total — coverage bagus untuk early-mid game.

### 5. Claim Stars dari Achievements sudah ada + anti-double-claim
Bridge antara XP (abstract) dan Stars (reward currency) via `reference_id`.

### 6. Daily Quests direset otomatis tiap hari
`getDailyQuests` date-aware menggunakan `getLocalDateString()`.

### 7. XP History menampilkan level-up markers
`getHistoryWithLevelUps()` melacak running XP dan menandai kapan level naik — sangat edukatif.

### 8. Personal League self-competition
Weekly XP tracking dengan 4 tier (Bronze → Silver → Gold → Diamond). Kompetisi melawan diri sendiri, bukan orang lain — cocok untuk anak.

---

## Yang Kurang & Perlu Diperbaiki 🚨

### 1. [KRITIS] Level bar & XP total tidak ada di halaman Progress

**Masalah:** Halaman `/child/progress` tidak menampilkan level saat ini, XP bar, atau progress ke level berikutnya di hero section. Informasi paling penting justru tidak ada.

**Dampak:** Anak harus guess level mereka dari "Next Unlock" card. Confusing.

**Rekomendasi:** Tambah Level Hero Card di paling atas:
```
┌─────────────────────────────────────────┐
│  ⭐ Level 5 · Champion                   │
│  [████████░░░░░░░] 240/350 XP            │
│  110 XP to Level 6 — Explorer Frame     │
└─────────────────────────────────────────┘
```

---

### 2. [KRITIS] Daily Quests tidak bisa di-claim dari UI

**Masalah:** Di `/child/progress/quests`, quest yang selesai hanya menampilkan CheckCircle icon — tidak ada tombol "Claim XP". Klaim terjadi otomatis di background tanpa momen reward yang satisfying.

**Dampak:** Anak tidak tahu XP-nya sudah diklaim. Kehilangan momen gamifikasi utama.

**Rekomendasi:** Tambah tombol "Claim XP" yang visible + animasi confetti saat berhasil.

---

### 3. [PENTING] Personal League card tidak bisa di-click

**Masalah:** Card "Personal League" di grid tidak punya `onClick` handler. Satu-satunya card yang non-navigable.

**Dampak:** Anak tidak bisa melihat history minggu-minggu sebelumnya atau detail tier.

**Rekomendasi:** Buat halaman `/child/progress/league` dengan:
- Weekly XP chart (bar chart per hari minggu ini)
- History tier minggu-minggu sebelumnya
- Penjelasan aturan league yang kid-friendly

---

### 4. [PENTING] Tidak ada Streak section di Progress

**Masalah:** Streak adalah motivator terkuat dalam habit apps (lihat: Duolingo) tapi tidak ada dedicated section di Progress. Streak hanya visible di Dashboard secara implicit.

**Dampak:** Anak tidak sadar punya streak, atau tidak tahu best streak mereka.

**Rekomendasi:** Tambah Streak Card di Progress:
```
┌─────────────────────────────────────────┐
│  🔥 Active Streaks                       │
│  Brush Teeth · 12 days 🔥               │
│  Read Book   · 7 days 🔥                │
│  Best streak ever: 14 days              │
└─────────────────────────────────────────┘
```

---

### 5. [PENTING] Rewards Shelf empty state tidak motivating

**Masalah:** Empty state hanya text "Reach Level 2 to unlock the first badge." — tidak ada visual preview dari item yang terkunci, tidak ada info berapa XP lagi.

**Rekomendasi:**
- Tampilkan preview terkunci (greyed/blurred) dari beberapa item berikutnya
- Tambah callout "X XP lagi untuk unlock pertama!"

---

### 6. [PENTING] Tidak ada persistent mark setelah naik level

**Masalah:** LevelUpModal ada tapi temporary. Setelah modal tutup, tidak ada bukti pencapaian yang visible di Progress page.

**Rekomendasi:** Tambah "Last Level Up" info di Level Hero Card: "Reached Level 5 · 3 days ago 🎉"

---

### 7. [MINOR] XP History tidak ada pagination

**Masalah:** Semua `xpTransactions` dirender sekaligus tanpa batas. Untuk anak aktif berbulan-bulan bisa ratusan items.

**Rekomendasi:** Tampilkan 20 item terbaru dengan "Show more" button, atau group by week/month.

---

### 8. [MINOR] Achievements ditampilkan sebagai flat list tanpa kategori

**Masalah:** 18 achievements dalam flat list — user harus scroll panjang untuk menemukan achievement yang relevan.

**Rekomendasi:** Group menjadi 3 kategori:
- 🎯 Mission Achievements
- 🔥 Streak Achievements
- ⚡ XP & Level Milestones

---

### 9. [MINOR] Tidak ada loading/feedback saat Claim Achievement

**Masalah:** `isLoading` sudah dicheck di `disabled` prop, tapi tidak ada visual spinner atau success toast saat klaim.

**Rekomendasi:** Tambah loading spinner di tombol + toast "🌟 +X Stars claimed!" setelah berhasil.

---

### 10. [MINOR] Icon `frame` dan `theme` sama-sama pakai Sparkle

**Masalah:** `InventoryIcon` component menggunakan `<Sparkle>` untuk KEDUA `kind === 'frame'` dan `kind === 'theme'`. Tidak ada diferensiasi visual.

**Rekomendasi:**
- `frame` → `<FrameCorners>` atau `<PictureInPicture>`
- `theme` → `<PaintBrush>` atau `<Palette>`

---

## Verdict: Perlu Revamp?

**TIDAK perlu full revamp. Perlu penambahan fitur signifikan.**

Alasan:
- Arsitektur data dan kalkulasi sudah solid — tidak perlu diubah
- Navigation pattern (card → detail page) sudah familiar dan benar
- Banyak fitur yang sudah ada cukup bagus

Yang perlu dilakukan:
1. **[HIGH]** Tambah Level Hero Card dengan XP bar
2. **[HIGH]** Tambah Streak section/card
3. **[HIGH]** Perbaiki Daily Quest claim UX
4. **[MEDIUM]** League Detail Page (`/child/progress/league`)
5. **[MEDIUM]** Perbaiki empty state Rewards Shelf
6. **[LOW]** Group achievements by category
7. **[LOW]** Pagination XP history
8. **[LOW]** Fix duplicate Sparkle icon

---

## Quick Win Summary

| Item | Effort | Impact |
|------|--------|--------|
| Level Hero Card di progress page | Medium | ⬛⬛⬛⬛⬛ Sangat Tinggi |
| Streak card di progress page | Medium | ⬛⬛⬛⬛⬛ Sangat Tinggi |
| Daily Quest claim UX + confetti | Half day | ⬛⬛⬛⬛ Tinggi |
| Empty state Rewards Shelf | 1 jam | ⬛⬛⬛⬛ Tinggi |
| League detail page | Half day | ⬛⬛⬛ Medium |
| Group achievements by category | 1 jam | ⬛⬛⬛ Medium |
| Loading spinner di Claim button | 30 menit | ⬛⬛ Medium |
| Fix Sparkle icon duplicate | 5 menit | ⬛ Low |
