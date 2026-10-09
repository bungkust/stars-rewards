# Release Notes — Star Habit 1.4.1

**Date:** 2026-10-08  
**Version:** 1.4.1  
**Version Code:** 1040100 (`1040000 + 100`)  
**minSdkVersion:** 24  
**targetSdkVersion / compileSdkVersion:** 36  

---

## Google Play "What's new" (Maks. 500 Karakter)

### Bahasa Indonesia (id)
```text
- Tampilan Progres Milestone: Perbaikan indikator tier Red Ranger & info rentang milestone reward.
- Desain Kartu Lebih Rapi: Standarisasi kartu di Hadiah, Statistik, & Riwayat dengan judul hingga 2 baris.
- Kompatibilitas Android: Peningkatan minSdkVersion ke 24 sesuai standar Google Play.
- Peningkatan Kinerja: Perbaikan bug minor dan optimasi antarmuka pengguna.
```
*(Versi Paragraf)*:
> Diperbaiki tampilan progres milestone hadiah — tier tertinggi (Red Ranger) tidak lagi menunjukkan 100% sebelum benar-benar tercapai, dan tier Green serta Blue menampilkan informasi rentang yang akurat. Kartu di Rewards, Stats, dan History kini lebih seragam dengan judul hingga dua baris.

---

### English (en-US)
```text
- Milestone Progress: Fixed Red Ranger top-tier display and milestone range info.
- Card Consistency: Standardized cards across Rewards, Stats, and History with 2-line title wrapping.
- Android Compatibility: Upgraded minSdkVersion to 24 meeting latest Google Play standards.
- Overall Improvements: Minor bug fixes, performance optimizations, and UI polish.
```
*(Paragraph Version)*:
> Fixed the progress display for reward milestones — the top tier (Red Ranger) no longer shows 100% before reaching it, and the Green and Blue tiers display accurate range info. Cards in Rewards, Stats, and History now share a consistent design with 2-line title wrapping.

---

## Detailed Changes in v1.4.1

### 🐛 Bug Fixes
- **Milestone Tier Progress Calculation**:
  - Memperbaiki kalkulasi progres tier tertinggi (**Red Ranger**, 10.000+ bintang). Sebelumnya keliru menampilkan 100% sebelum tercapai, kini berstatus terkunci (*Locked • 10.000+*) sampai target terpenuhi.
  - Memperbaiki duplikasi teks pada tier **Green Ranger** & **Blue Ranger** sehingga masing-masing menampilkan progres dan rentang milestone yang tepat.
  - Menambahkan helper `getTierRangeLabel` dengan format pemisah ribuan lokal (`id-ID`).

### 🎨 UI & UX Improvements
- **Komponen Kartu Konsisten (`AdminEntityCard`)**:
  - Mengganti styling kartu lama di *Rewards Shop* (mode anak & orang tua), *Category Performance*, dan seluruh daftar riwayat transaksi (*Child Stats*, *Parent Stats*, *Claimed Rewards*, serta *History pages*) dengan komponen standar `AdminEntityCard`.
  - **Dukungan Judul 2 Baris (`titleMaxLines={2}`)**: Judul reward dan aktivitas panjang tidak lagi terpotong secara kaku (truncated), melainkan dapat turun hingga 2 baris dengan rapi.

### ⚙️ Technical & Build Updates
- **Kepatuhan Standar Android Google Play**: Meningkatkan `minSdkVersion` dari 23 ke 24 (`android/variables.gradle`).
- **Pembeda Build Debug Android**: Build mode debug kini menampilkan label `[debug] Star Habit` di bawah ikon aplikasi untuk membedakan dengan mudah dari build release.
- **Pembaruan Versi**: Versi aplikasi dinaikkan menjadi `1.4.1` (`package.json`, `android/app/build.gradle` versionCode: 1040100).
