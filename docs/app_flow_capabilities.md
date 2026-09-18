# Panduan Dokumentasi Star Habit: Alur Pengguna & Kapabilitas Menu

**Star Habit** adalah aplikasi modifikasi perilaku anak berbasis *Token Economy* (sistem hadiah berbasis token) yang bersifat **offline-first** dan menjaga privasi keluarga sepenuhnya. Seluruh data disimpan secara lokal pada perangkat pengguna.

---

## 1. Alur Kerja End-to-End Pengguna Baru (*New User Flow*)

Ketika pengguna pertama kali mengunduh dan membuka aplikasi Star Habit, mereka akan melalui langkah-langkah onboarding berikut:

### Langkah 1: Halaman Selamat Datang (*Welcome Screen*)
*   **Tampilan Awal**: Menampilkan logo bintang Star Habit, tagline produk, dan segmentasi target usia anak (5-9 tahun).
*   **Opsi Utama**:
    1.  **Start New Family**: Tombol utama untuk memulai konfigurasi keluarga baru.
    2.  **Restore from Backup**: Tombol sekunder bagi orang tua yang ingin memulihkan seluruh data dan konfigurasi dari file backup JSON sebelumnya.

### Langkah 2: Setup Profil Keluarga (*Family Setup*)
*   **Input Data**:
    *   **Family Name**: Nama identitas keluarga (contoh: *The Anderson Family*).
    *   **Your Name**: Nama panggilan orang tua/admin (contoh: *Mama*, *Papa*).
    *   **Create PIN & Confirm PIN**: PIN keamanan 4-digit yang berfungsi untuk mengunci mode admin (Parent Mode). PIN ini krusial untuk mencegah anak memanipulasi saldo bintang mereka sendiri.

### Langkah 3: Tambah Profil Anak (*Add Child*)
*   **Input Data**:
    *   **Nama Anak**: Nama panggilan anak (maksimal 4 anak).
    *   **Tanggal Lahir**: Tanggal lahir anak (tidak boleh tanggal di masa depan).
    *   **Avatar**: Memilih dari 10 pilihan avatar petualang bergaya ilustrasi (*Dicebear SVG*) yang diunduh secara offline.
*   **Fitur**: Orang tua dapat memilih opsi **Save & Add Another Child** untuk menambahkan beberapa profil sekaligus sebelum lanjut, atau langsung menekan **Save & Continue**.

### Langkah 4: Membuat Misi Pertama (*Create First Mission*)
*   **Input Data Misi**:
    *   **Mission Title**: Nama misi atau tugas harian (maksimal 25 karakter). Tersedia *Quick Templates* seperti: *Brush Teeth, Make Bed, Homework, Clean Room, Help at Home, Read a Book*.
    *   **Category**: Memilih kategori tugas (*Hygiene, Time, Responsibility, Skill, Family, Social, Dressing, Emotion*).
    *   **Mission Icon / Image**: Memilih ikon bawaan (Bintang, Sapu, Buku, dll) ATAU mengunggah foto kustom (Maksimal 1MB, otomatis dikonversi ke format WebP hemat penyimpanan).
    *   **Mission Style**:
        *   *Simple (Checklist)*: Tugas sederhana yang hanya perlu ditandai selesai.
        *   *Progress (Target)*: Tugas dengan target angka tertentu (misalnya: minum 8 gelas air, membaca 10 halaman buku) beserta unit pengukurannya.
    *   **Hadiah (Stars & XP)**: Memilih tingkat kesulitan preset (*Milestone* = 0★/5XP; *Easy* = 5★/10XP; *Medium* = 10★/10XP; *Hard* = 15★/15XP; *Special* = 25★/20XP) atau menentukan nominal kustom.
    *   **Expired Time**: Batas waktu penyelesaian tugas dalam sehari (Opsional).
    *   **Repetition**: Pengulangan jadwal misi (*Once, Daily, Weekly, Monthly,* atau *Custom* menggunakan formulir RRule builder).
    *   **Assign To**: Memilih anak mana saja yang ditugaskan untuk misi ini.
*   *Catatan Mekanik*: Setelah misi pertama disimpan, sistem akan secara otomatis membuat misi bawaan tambahan bernama **Setup Profile 🚀** (Misi sekali jadi bernilai 10★/10XP) agar anak langsung mendapatkan pencapaian bintang pertama mereka dengan mudah.

### Langkah 5: Membuat Hadiah Pertama (*Create First Reward*)
*   **Input Data Hadiah**:
    *   **Reward Name**: Nama hadiah yang dapat ditukarkan (maksimal 25 karakter). Tersedia *Quick Suggestions* seperti: *Screen Time, Ice Cream, Movie Night, New Toy, New Game, Play in Park*.
    *   **Reward Cost**: Biaya penukaran dalam satuan Bintang (nilai 0-9999).
    *   **Reward Type**:
        *   *Unlimited*: Hadiah yang bisa diklaim berulang kali kapan saja asal saldo bintang mencukupi.
        *   *One-time*: Hadiah sekali pakai (akan hilang dari katalog setelah diklaim).
        *   *Milestone (Accumulative)*: Hadiah yang terkunci dan baru terbuka setelah anak menyelesaikan suatu misi tertentu dalam jumlah frekuensi yang ditentukan (misalnya: harus menyelesaikan "Clean Room" sebanyak 5 kali terlebih dahulu).
    *   **Reward Icon / Image**: Ikon bawaan kategori (Game, Treat, Event, Gift, Food, Activity, Book, Art) atau unggahan foto kustom.
    *   **Assign To**: Memilih anak yang berhak menukarkan hadiah ini.

### Langkah 6: Penyelesaian Setup (*Finish Setup*)
*   Aplikasi menandai onboarding telah selesai (`onboardingStep: 'completed'`) dan mengarahkan pengguna ke halaman utama.

---

## 2. Struktur Menu & Kapabilitas Setiap Mode

Star Habit memiliki dua mode visual dan fungsi utama yang dipisahkan oleh proteksi autentikasi: **Mode Anak (Child Mode)** dan **Mode Orang Tua (Parent Mode)**. Masing-masing mode memiliki menu navigasi bawah (*Bottom Nav*) yang berbeda.

### A. MODE ANAK (Child Mode)
*Tema Visual: Berwarna cerah (Colorful Child Theme), ramah anak, dan interaktif.*

#### 1. Menu Home (Dashboard)
*   **Fungsi**: Pusat informasi harian anak.
*   **Kapabilitas**:
    *   Melihat sisa saldo bintang saat ini (*Current Balance*).
    *   Melihat Level XP anak saat ini, sisa progress bar menuju level berikutnya, serta indikator XP.
    *   Melihat notifikasi/pemberitahuan langsung (misalnya jika verifikasi misi disetujui atau ditolak oleh orang tua).
    *   **Daily Quests (Misi Harian)**: Panel misi mikro harian seperti *First Win* (menyelesaikan 1 misi hari ini) atau *Three Mission Day* (menyelesaikan 3 misi hari ini) untuk mengklaim bonus XP ekstra.

#### 2. Menu Missions (Daftar Tugas)
*   **Fungsi**: Tempat anak melihat tugas-tugas yang ditugaskan kepada mereka dan menandainya sebagai selesai.
*   **Kapabilitas**:
    *   Menyaring misi berdasarkan kategori menggunakan filter ikon di bagian atas.
    *   **Misi Checklist**: Menandai selesai (*check*) misi harian. Misi yang ditandai selesai akan masuk ke antrean verifikasi orang tua (*Verification Queue*).
    *   **Misi Progress**: Mengisi input angka progres (misalnya mencatat gelas ke-5 dari target 8 gelas) dan memperbarui progres.
    *   **Excuse Request**: Mengirim permintaan dispensasi ke orang tua jika tidak dapat menyelesaikan tugas (misalnya karena sakit) disertai alasan tertulis.

#### 3. Menu Progress
*   **Fungsi**: Visualisasi perkembangan gamifikasi anak.
*   **Kapabilitas**:
    *   Menampilkan **Gamification Panel** yang mencatat akumulasi XP.
    *   Melihat *Streak* (run beruntun pengerjaan misi harian) untuk memicu motivasi anak agar tidak memutuskan rantai streak mereka.
    *   Menampilkan informasi kenaikan level anak.

#### 4. Menu Rewards (Penukaran Hadiah)
*   **Fungsi**: Katalog tempat menukarkan bintang yang dikumpulkan anak dengan hadiah nyata.
*   **Kapabilitas**:
    *   Melihat daftar semua hadiah yang tersedia beserta harganya.
    *   Indikator visual apakah saldo bintang anak mencukupi atau kurang untuk membeli suatu hadiah.
    *   Melakukan penukaran (*Redeem*) hadiah. Bintang anak akan terpotong secara otomatis, dan permintaan klaim akan dicatat.

#### 5. Menu Stats (Statistik & Riwayat)
*   **Fungsi**: Laporan grafik perolehan bintang dan riwayat lengkap transaksi.
*   **Kapabilitas**:
    *   **Summary Cards**: Ringkasan total bintang yang pernah didapatkan (*Earned*) dan total bintang yang pernah dibelanjakan (*Spent*).
    *   **Progress Tracker**: Grafik garis interaktif perolehan bintang bersih secara harian (*7 Days Week View*) atau mingguan (*4 Weeks Month View*).
    *   **Claimed Rewards**: Menampilkan riwayat hadiah yang baru saja diklaim beserta tanggal penukarannya.
    *   **Recent History**: Log lengkap kronologis berisi tugas yang disetujui orang tua (ditandai bintang masuk hijau), hadiah yang dibeli (ditandai bintang keluar merah), serta catatan penolakan tugas (*Rejected*), kegagalan tenggat waktu (*Failed*), atau dispensasi (*Excused*). Detail setiap item dapat dilihat melalui *popup modal*.

---

### B. MODE ORANG TUA (Parent Mode / Admin)
*Tema Visual: Minimalis, elegan, dan didominasi warna Emerald/Hijau Tua (Parent Theme).*

#### 1. Menu Home (Dashboard Admin)
*   **Fungsi**: Panel kontrol utama persetujuan pengerjaan tugas dan dispensasi anak.
*   **Kapabilitas**:
    *   **Verification Center (Pusat Verifikasi)**: Antrean seluruh aksi anak yang butuh keputusan orang tua:
        *   *Task Completion Verification*: Membaca misi yang dilaporkan selesai oleh anak. Orang tua dapat menyetujui (anak menerima bintang & XP) atau menolak (membuka popup modal untuk memasukkan alasan penolakan).
        *   *Excuse/Exemption Approval*: Membaca permohonan skip tugas anak. Jika disetujui (*Excused*), tugas dianggap selesai untuk mempertahankan *Streak*, namun tidak menghasilkan bintang. Jika ditolak, tugas harus tetap dikerjakan anak.
    *   **Adjust Balance**: Melakukan penyesuaian saldo bintang secara manual (menambah bonus bintang atau memotong denda bintang) untuk satu atau beberapa anak sekaligus disertai alasan penulisan.

#### 2. Menu Missions (Kelola Tugas)
*   **Fungsi**: Tempat membuat dan menyunting daftar tugas harian/rutinitas.
*   **Kapabilitas**:
    *   Melihat semua template misi yang aktif dan tidak aktif.
    *   Menambahkan misi baru (*AdminTaskForm*) dengan konfigurasi lengkap (tipe pengulangan, waktu kedaluwarsa, target progres, alokasi anak, dsb).
    *   Menyunting (*Edit*) parameter misi yang sudah ada atau menghapus misi tersebut.

#### 3. Menu Rewards (Kelola Hadiah)
*   **Fungsi**: Tempat merancang katalog penukaran hadiah anak.
*   **Kapabilitas**:
    *   Melihat daftar hadiah yang tersedia untuk semua profil anak.
    *   Menambahkan hadiah baru (*AdminRewardForm*) dengan konfigurasi tipe (Unlimited, One-time, Milestone).
    *   Menyunting (*Edit*) harga bintang, alokasi akses anak, atau menghapus hadiah dari katalog.

#### 4. Menu Stats (Statistik Admin)
*   **Fungsi**: Analisis performa dan kedisiplinan anak secara mendalam untuk membantu orang tua mengevaluasi kebiasaan anak.
*   **Kapabilitas**:
    *   Melihat kepatuhan penyelesaian tugas anak (*Compliance/Completion Rate*).
    *   Melihat metrik tren tugas yang paling sering selesai dan tugas yang paling sering terlewatkan.

---

### C. MENU UTAMA DI HEADER (Lebih Banyak Opsi / Hamburger Menu)

Header pojok kanan atas menyediakan menu dropdown dengan kapabilitas berikut tergantung pada mode aktif:

*   **Jika dalam Mode Anak**:
    *   **Parent Login**: Pintu masuk menuju Parent Mode. Orang tua harus memasukkan metode autentikasi yang dipilih (PIN, Pattern, atau Sidik Jari/Biometrik) untuk beralih mode.
    *   **Settings**: Mengarahkan ke halaman pengaturan (memerlukan Parent Login terlebih dahulu).
    *   **Switch Profile**: Membuka popup *Child Selector* untuk memilih profil anak lain yang aktif.
*   **Jika dalam Mode Orang Tua**:
    *   **Back to Child**: Keluar dari Parent Mode dan kembali ke dashboard anak yang sedang dipilih.
    *   **Settings**: Mengarahkan ke konfigurasi sistem.
    *   **Switch Profile**: Melakukan *non-destructive logout* (menghapus status sesi anak aktif dan langsung menampilkan popup pemilih profil anak).

---

## 3. Struktur Halaman Pengaturan (Settings)

Halaman pengaturan hanya dapat diakses oleh orang tua dan terbagi menjadi beberapa bagian penting:

### 1. Family Information (Informasi Keluarga)
*   Menampilkan nama keluarga, nama orang tua, email pengguna (ditandai sebagai *Offline User*), serta jumlah profil anak (Maksimal 4 anak).
*   **Add Child**: Menambahkan anak baru ke dalam sistem lokal.
*   **Edit Child**: Menyunting nama, tanggal lahir, atau mengganti avatar anak yang sudah terdaftar.

### 2. Notifications (Notifikasi)
*   **Master Switch**: Mengaktifkan/menonaktifkan seluruh notifikasi sistem lokal.
*   **Notifikasi Granular**:
    *   *Mission Approvals*: Mengirimkan notifikasi push ke orang tua jika anak mengirimkan misi yang perlu diverifikasi.
    *   *Missed Daily Reminders*: Mengirimkan pengingat di malam hari jika ada misi harian anak yang belum selesai.
    *   *Daily Summary Report*: Ringkasan pagi hari mengenai tugas-tugas anak yang terlewat kemarin.

### 3. Security (Keamanan)
*   **Enable Fingerprint**: Mengaktifkan persetujuan biometrik perangkat (sidik jari/Face ID) jika didukung oleh perangkat keras (menggunakan plugin `capacitor-native-biometric`).
*   **Default Access Method (Metode Utama)**: Menentukan metode keamanan utama untuk masuk ke Parent Mode (pilih salah satu: *PIN Code*, *Pattern Lock*, atau *Fingerprint*).
*   **Manage Credentials**:
    *   *Change PIN*: Mengubah PIN numerik 4-digit.
    *   *Change Pattern/Setup Pattern*: Menggambar ulang atau mengonfigurasi pola garis geser (*Pattern*) sebagai kunci pengaman alternatif.

### 4. Customization (Kustomisasi Kategori)
*   **Manage Categories**: Mengedit, menambahkan, atau menghapus kategori misi beserta ikonnya agar relevan dengan aktivitas rumah tangga unik Anda.

### 5. Support (Dukungan)
*   **Rate Star Habit**: Mengarahkan orang tua untuk memberikan rating ulasan aplikasi di Google Play Store atau App Store dengan mudah.

### 6. Data Management (Manajemen Data Lokal)
*   Karena aplikasi berjalan 100% lokal di memori perangkat, fitur ini sangat penting untuk mencegah kehilangan data:
    *   **Backup Data**: Mengekspor seluruh basis data lokal (profil, daftar tugas, hadiah, riwayat transaksi, XP log) ke dalam file `.json` dengan format penamaan dinamis: `StarsRewards_[NamaKeluarga]_[NamaAnak-Anak]_[Tanggal]_[Waktu].json`.
    *   **Restore Data**: Mengimpor kembali file `.json` cadangan untuk menimpa database saat ini jika orang tua berganti perangkat HP atau jika aplikasi terinstal ulang.

### 7. Legal & Policy (Halaman Hukum)
*   Tautan langsung menuju halaman **Privacy Policy** dan **Terms & Conditions** eksternal.

### 8. Danger Zone (Zona Bahaya)
*   **Delete Child Profile**: Menghapus profil anak tertentu beserta seluruh riwayat pengerjaan tugas dan perolehan bintangnya secara permanen.
*   **Reset Application**: Menghapus seluruh data aplikasi secara total dan mengembalikan status Star Habit seperti pertama kali diunduh (Onboarding ulang).

---

## 4. Mekanisme Inti Sistem (*Core Mechanics*)

*   **Sistem Pengecekan Misi Terlewat (*Missed Mission System*)**: Setiap kali aplikasi dibuka atau kembali dari background (*App Resume*), sistem akan membandingkan tanggal terakhir pengecekan dengan tanggal lokal saat ini. Setiap misi harian yang terlewat secara otomatis akan dicatat sebagai **FAILED** di riwayat anak, dan jumlah streak misi tersebut akan diatur ulang (*reset*) menjadi 0.
*   **Persetujuan Otomatis (*Auto-Approve Queue*)**: Tugas yang menunggu verifikasi orang tua lebih dari 24 jam akan disetujui secara otomatis oleh sistem agar anak tidak kehilangan motivasi akibat keterlambatan verifikasi manual.
*   **Dopamine & Gamification Loops**:
    *   *Stars (Bintang)* bertindak sebagai instrumen keuangan riil untuk ditukarkan dengan hadiah fisik.
    *   *XP (Experience Points)* bertindak sebagai reputasi digital untuk meningkatkan Level anak, mengoleksi lencana prestasi (*Achievement Badges*), dan bersaing secara pasif di tingkatan Liga (*Bronze, Silver, Gold, Diamond*).
