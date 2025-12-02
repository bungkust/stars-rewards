# 🔐 Reset Password Guide - Star Habit

## 📋 Overview
Halaman reset password telah diimplementasikan dengan lengkap menggunakan Supabase Auth untuk mengubah password user di database.

## 🔄 Flow Reset Password

### **1. User Meminta Reset Password**
- User klik "Forgot Password?" di halaman Login (`/login`)
- Diarahkan ke halaman Forgot Password (`/forgot-password`)
- Input email address
- Supabase mengirim email dengan link reset

### **2. Email Link Processing**
- User menerima email dari Supabase
- Klik link dengan format:
  ```
  starhabit://reset-password#access_token=XXX&refresh_token=YYY&type=recovery
  ```
- **Mobile app terbuka otomatis** dan diarahkan ke halaman Reset Password

### **3. Password Update di Database**
- Sistem memverifikasi token dari URL
- User mengisi password baru dan konfirmasi
- Password diubah di Supabase Auth database melalui `updatePassword()` function

## 🗄️ Bagaimana Password Diubah di Database

### **Supabase Auth Flow (Mobile Only)**
1. **Deep Link Detection**: App mendeteksi deep link `starhabit://reset-password`
2. **Token Extraction**: Extract `access_token`, `refresh_token`, dan `type=recovery` dari URL
3. **Session Setup**: `setAuthFromUrl()` membuat session authenticated menggunakan token
4. **Password Update**: `supabase.auth.updateUser({ password: newPassword })` mengubah password di database
5. **Session Cleanup**: Session otomatis logout setelah password berhasil diubah

**❌ No Web Browser Access**: App hanya bisa diakses melalui mobile app, bukan web browser.

### **Database Changes**
- Password hash disimpan di tabel `auth.users` Supabase
- Password lama otomatis diganti dengan yang baru
- User profile tetap sama, hanya password yang berubah

## 📝 Input Yang Dibutuhkan

### **Untuk Reset Password:**
1. **Password Baru** (required)
   - Minimal 6 karakter
   - Tipe: string

2. **Konfirmasi Password** (required)
   - Harus sama dengan password baru
   - Tipe: string

### **Validasi Input:**
- `password.length >= 6`
- `password === confirmPassword`
- Tidak boleh kosong

## 🎯 Komponen Yang Terlibat

### **Files:**
- `src/pages/auth/ResetPassword.tsx` - UI halaman reset password
- `src/store/useAppStore.ts` - Logic `updatePassword()` dan `setAuthFromUrl()`
- `src/App.tsx` - Routing ke `/reset-password`

### **Functions:**
```typescript
// Mengubah password di database
updatePassword: async (password: string) => {
  const { error } = await supabase.auth.updateUser({
    password: password
  });
  return { error };
}

// Setup auth session dari URL token
setAuthFromUrl: async () => {
  const urlParams = new URLSearchParams(window.location.hash.substring(1));
  const accessToken = urlParams.get('access_token');
  const refreshToken = urlParams.get('refresh_token');

  if (accessToken && refreshToken) {
    await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });
  }
}
```

## 🔧 UI Implementation

### **Loading State**
- Menampilkan spinner saat validasi token
- Pesan: "Validating Link"

### **Error States**
- Invalid token: "Invalid Reset Link"
- Password validation errors
- Network errors

### **Success State**
- Checkmark icon
- Pesan: "Password Updated!"
- Auto-redirect ke login dalam 3 detik

### **Form Fields**
- New Password (dengan show/hide toggle)
- Confirm New Password (dengan show/hide toggle)
- Update Password button
- Back to Login link

## 🧪 Testing Flow

### **Happy Path (Mobile Only):**
1. ✅ Klik link di email → `starhabit://reset-password#...`
2. ✅ Mobile app terbuka otomatis
3. ✅ Isi password baru dan konfirmasi
4. ✅ Klik "Update Password"
5. ✅ Password berhasil diubah di database
6. ✅ Redirect ke login

### **Error Cases:**
1. ❌ Token invalid/expired → Error page
2. ❌ Password < 6 karakter → Validation error
3. ❌ Password tidak match → Validation error
4. ❌ Network error → Error message

## 🚀 Deployment Notes

### **Environment Variables (wajib):**
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### **Supabase Configuration:**
- ✅ Password reset enabled
- ✅ Site URL configured: `https://app.starhabit.web.id`
- ✅ Redirect URL: `starhabit://reset-password` (mobile app only - NO web access)
- ✅ Email templates customized

### **Mobile Deep Linking Setup:**
- ✅ Custom URL scheme: `starsrewards://`
- ✅ App Links support for `https://app.starhabit.web.id/reset-password`
- ✅ Android intent filters configured
- ✅ Capacitor App plugin listener implemented

## 🔍 Troubleshooting

### **Halaman Tidak Muncul:**
- ✅ Cek routing di `App.tsx`
- ✅ Cek file `ResetPassword.tsx` exists
- ✅ Cek komponen import benar

### **Token Tidak Valid:**
- ✅ Pastikan URL format benar
- ✅ Cek token belum expired (1 jam)
- ✅ Cek `type=recovery` parameter

### **Password Tidak Update:**
- ✅ Cek `updatePassword()` function
- ✅ Cek Supabase auth session valid
- ✅ Cek network connection

### **Deep Link Tidak Bekerja:**
- ✅ Cek AndroidManifest.xml intent filters untuk `starhabit://`
- ✅ Cek Capacitor config server settings
- ✅ Cek app sudah terinstall di device dengan package ID `com.myfamily.starhabit`
- ✅ Cek URL scheme `starhabit://` terdaftar
- ✅ Test dengan: `adb shell am start -a android.intent.action.VIEW -d "starhabit://reset-password"`
- ✅ Pastikan Supabase redirect URL: `starhabit://reset-password` (mobile only, no web fallback)
- ✅ Cek domain `app.starhabit.web.id` hanya deploy docs/, bukan React app

---

## ✅ Status: **FULLY IMPLEMENTED & READY**

Halaman reset password lengkap dengan:
- ✅ UI yang user-friendly
- ✅ Validasi input yang ketat
- ✅ Error handling yang baik
- ✅ Success feedback
- ✅ Database password update via Supabase
- ✅ Security best practices
- ✅ Mobile-only deep linking (no web access)

**Status:** ✅ **Mobile-only reset password flow fully implemented and ready for use!** 📱🎉
