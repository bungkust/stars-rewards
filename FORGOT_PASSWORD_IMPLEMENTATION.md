# Forgot Password Implementation - Stars Rewards

## 📋 Overview
Fitur forgot password telah diimplementasikan menggunakan Supabase Auth untuk mengirim email reset password dan menangani update password melalui link yang dikirim ke email user.

## 🔄 Password Reset Flow

### 1. **User Requests Password Reset**
- User mengklik "Forgot Password?" di halaman Login
- Diarahkan ke `/forgot-password`
- Memasukkan email address
- Supabase mengirim email dengan link reset

### 2. **Email Link Processing**
- User menerima email dari Supabase
- Klik link yang berisi: `access_token`, `refresh_token`, `type=recovery`
- Diarahkan ke `/reset-password` dengan token di URL

### 3. **Password Update**
- Sistem memverifikasi token dari URL
- User memasukkan password baru
- Password diupdate via Supabase Auth
- User diarahkan kembali ke login

## 📱 Komponen yang Dibuat

### **1. ForgotPassword Page** (`src/pages/auth/ForgotPassword.tsx`)
```typescript
// Halaman untuk meminta reset password
- Form input email
- Validasi email
- Success state dengan konfirmasi email terkirim
- Error handling
```

### **2. ResetPassword Page** (`src/pages/auth/ResetPassword.tsx`)
```typescript
// Halaman untuk reset password dari email link
- Verifikasi token dari URL
- Form password baru dengan konfirmasi
- Show/hide password toggle
- Success state dengan redirect otomatis
- Error handling untuk invalid link
```

### **3. Updated Login Page** (`src/pages/auth/Login.tsx`)
```typescript
// Menambahkan link "Forgot Password?"
- Link ke /forgot-password
- Disabled saat loading
```

## 🔧 Store Functions

### **resetPassword** (`src/store/useAppStore.ts`)
```typescript
resetPassword: async (email: string) => {
  // Mengirim email reset menggunakan Supabase
  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `https://app.starhabit.web.id/reset-password`,
  });
}
```

### **updatePassword** (`src/store/useAppStore.ts`)
```typescript
updatePassword: async (password: string) => {
  // Update password menggunakan Supabase Auth
  await supabase.auth.updateUser({
    password: password
  });
}
```

### **setAuthFromUrl** (`src/store/useAppStore.ts`)
```typescript
setAuthFromUrl: async () => {
  // Handle auth state dari URL parameters (password reset link)
  const urlParams = new URLSearchParams(window.location.hash);
  // Set session dengan access_token dan refresh_token dari URL
}
```

## 🛣️ Routing Configuration

### **App.tsx - Unauthenticated Routes**
```typescript
<Routes>
  <Route path="/" element={<Welcome />} />
  <Route path="/login" element={<Login />} />
  <Route path="/forgot-password" element={<ForgotPassword />} />
  <Route path="/reset-password" element={<ResetPassword />} />
  <Route path="/onboarding/parent-setup" element={<ParentSetup />} />
  <Route path="*" element={<Navigate to="/" replace />} />
</Routes>
```

## 📧 Email Template

### **Supabase Auth Email**
Supabase secara otomatis mengirim email dengan:
- Subject: "Reset your password"
- Link dengan format: `https://yourapp.com/reset-password#access_token=...&refresh_token=...&type=recovery`
- Branded dengan nama app Anda

## 🔐 Security Features

### **Token Validation**
- ✅ Verifikasi `access_token`, `refresh_token`, `type=recovery`
- ✅ Token expired handling
- ✅ Invalid link detection

### **Password Requirements**
- ✅ Minimum 6 characters
- ✅ Password confirmation matching
- ✅ Show/hide password toggle

### **Session Management**
- ✅ Automatic logout setelah password update
- ✅ Session cleanup
- ✅ Redirect ke login page

## 🎨 UI/UX Features

### **ForgotPassword Page**
- Clean, centered layout dengan gradient background
- Email validation
- Success state dengan email confirmation
- Loading states
- Error messages
- Back to login option

### **ResetPassword Page**
- Token validation on page load
- Password strength indicators
- Confirm password field
- Show/hide password buttons
- Success animation dengan auto-redirect
- Invalid link error handling

### **Login Page Enhancement**
- "Forgot Password?" link di kanan bawah
- Disabled state saat loading
- Seamless navigation

## 🧪 Testing Scenarios

### **Happy Path**
1. ✅ User clicks "Forgot Password?"
2. ✅ Enters valid email → receives email
3. ✅ Clicks email link → redirected to reset page
4. ✅ Enters new password → success message
5. ✅ Auto-redirect to login after 3 seconds

### **Error Cases**
1. ✅ Invalid email → error message
2. ✅ Invalid reset link → error page with retry option
3. ✅ Password mismatch → validation error
4. ✅ Short password → validation error
5. ✅ Expired token → error message

## 🔧 Step-by-Step Supabase Setup for Beginners

### **Step 1: Login to Supabase Dashboard**
1. Buka [supabase.com](https://supabase.com)
2. Login dengan akun Anda
3. Pilih project Stars Rewards Anda

### **Step 2: Setup Email Configuration**
1. **Navigate to Authentication** → **Email Templates**
2. **Find "Reset Password" template**
3. **Customize email content** (optional):
   ```html
   <h2>Reset your Stars Rewards password</h2>
   <p>Click the link below to reset your password:</p>
   <p><a href="{{ .ConfirmationURL }}">Reset Password</a></p>
   <p>If you didn't request this, please ignore this email.</p>
   ```
4. **Save changes**

### **Step 3: Setup SMTP Settings**
1. **Go to Authentication** → **Providers**
2. **Scroll down to "Email" section**
3. **Enable email provider**:
   - **For Development**: Gunakan built-in Supabase SMTP
   - **For Production**: Setup custom SMTP (Gmail, SendGrid, etc.)

   **Built-in SMTP Setup**:
   - ✅ Sudah otomatis aktif untuk development
   - ✅ Rate limit: 30 emails per hour

   **Custom SMTP Setup** (recommended for production):
   - **SMTP Host**: `smtp.gmail.com` (atau provider lain)
   - **SMTP Port**: `587` (TLS) atau `465` (SSL)
   - **SMTP User**: `your-email@gmail.com`
   - **SMTP Password**: `your-app-password`

### **Step 4: Configure Site URL & Redirects**
1. **Go to Authentication** → **Settings**
2. **Site URL**: Masukkan domain Anda
   ```
   For Development: http://localhost:5173
   For Production: https://yourdomain.com
   ```

3. **Redirect URLs**: Tambahkan URL untuk password reset
   ```
   http://localhost:5173/reset-password
   https://yourdomain.com/reset-password
   ```

### **Step 5: Enable Password Reset**
1. **Go to Authentication** → **Settings**
2. **Scroll to "Password Reset" section**
3. ✅ **Enable password reset**: Pastikan dicentang
4. **Reset password redirect URL**: `/reset-password`

### **Step 6: Test Email Delivery**
1. **Go to Authentication** → **Users**
2. **Find test user** atau **buat user baru**
3. **Manual trigger password reset**:
   - Klik user email
   - Klik "Send password recovery"

### **Step 7: Verify Environment Variables**
Pastikan di file `.env` Anda:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

---

## 🔍 **Troubleshooting Guide**

### **Email Tidak Diterima**
```bash
# 1. Check Spam Folder
- Email mungkin masuk ke spam

# 2. Verify SMTP Settings
- Pastikan SMTP credentials benar
- Test dengan email lain

# 3. Check Supabase Logs
- Go to Supabase Dashboard → Logs → Auth
- Look for email sending errors
```

### **"Invalid Link" Error**
```bash
# 1. Check Redirect URL
- Pastikan URL di Supabase Dashboard cocok dengan app URL
- Format: https://yourdomain.com/reset-password

# 2. Check Token Validity
- Reset password links expire dalam 1 jam
- User perlu request link baru
```

### **SMTP Connection Failed**
```bash
# Gmail App Password Setup:
1. Go to Google Account Settings
2. Enable 2-Factor Authentication
3. Generate App Password
4. Use App Password (not regular password) in SMTP settings
```

### **CORS Issues**
```bash
# Add your domain to Supabase CORS settings:
1. Supabase Dashboard → Settings → API
2. Add your domain to "Allowed Origins"
   - http://localhost:5173 (development)
   - https://yourdomain.com (production)
```

---

## 📧 **Email Template Examples**

### **Reset Password Email**
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Reset Your Password - Stars Rewards</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <h1 style="color: #2563eb;">Reset Your Stars Rewards Password</h1>

    <p>Hello,</p>

    <p>We received a request to reset your password for your Stars Rewards account.</p>

    <p>Click the button below to reset your password:</p>

    <div style="text-align: center; margin: 30px 0;">
      <a href="{{ .ConfirmationURL }}"
         style="background-color: #2563eb; color: white; padding: 12px 24px;
                text-decoration: none; border-radius: 6px; font-weight: bold;">
        Reset Password
      </a>
    </div>

    <p><strong>This link will expire in 1 hour.</strong></p>

    <p>If you didn't request this password reset, please ignore this email.</p>

    <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">

    <p style="color: #666; font-size: 14px;">
      If the button doesn't work, copy and paste this link into your browser:<br>
      <span style="word-break: break-all;">{{ .ConfirmationURL }}</span>
    </p>

    <p style="color: #666; font-size: 14px;">
      Best regards,<br>
      Stars Rewards Team
    </p>
  </div>
</body>
</html>
```

---

## ⚙️ **Advanced Configuration**

### **Custom Email Provider (Production)**
```javascript
// For high-volume email sending, use:
1. SendGrid
2. Mailgun
3. AWS SES
4. Postmark

// Setup in Supabase:
Authentication → Providers → Email → Custom SMTP
```

### **Rate Limiting**
- **Development**: 30 emails/hour
- **Production**: Depends on your SMTP provider
- **Monitor**: Check Supabase Dashboard → Logs

### **Security Best Practices**
```javascript
// 1. Use HTTPS in production
// 2. Set short token expiry (1 hour recommended)
// 3. Monitor failed login attempts
// 4. Use strong password requirements
```

---

## 🎯 **Quick Setup Checklist**

### **✅ Minimum Requirements (Development)**
- [ ] Supabase project created
- [ ] Site URL configured
- [ ] Reset password redirect URL added
- [ ] Email templates customized (optional)
- [ ] Test password reset flow

### **✅ Production Requirements**
- [ ] Custom SMTP provider configured
- [ ] HTTPS domain configured
- [ ] Email templates branded
- [ ] Rate limiting monitored
- [ ] Backup recovery process documented

---

## 📞 **Need Help?**

### **Common Issues & Solutions**
1. **"Email not sending"** → Check SMTP settings and spam folder
2. **"Invalid link"** → Verify redirect URLs match exactly
3. **"CORS error"** → Add domain to Supabase CORS settings
4. **"Rate limited"** → Upgrade SMTP plan or reduce test frequency

### **Supabase Support**
- 📚 [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- 💬 [Supabase Discord](https://supabase.com/discord)
- 🎫 [GitHub Issues](https://github.com/supabase/supabase/issues)

---

**Dengan setup ini, forgot password feature akan bekerja perfectly! 🚀**

## 📞 User Support

### **Common Issues**
1. **Email not received** → Check spam folder, resend link
2. **Link expired** → Request new reset link
3. **Invalid link** → Request new reset link

### **Support Flow**
1. User contacts support
2. Verify email ownership
3. Send new reset link manually if needed
4. Guide through password reset process

## 📊 Analytics & Monitoring

### **Track Password Reset Events**
```typescript
// Optional: Add analytics tracking
analytics.track('password_reset_requested', { email: email });
analytics.track('password_reset_completed', { user_id: userId });
analytics.track('password_reset_failed', { reason: error.message });
```

---

## 🚀 Deployment Checklist

### **Pre-Deployment**
- [ ] Supabase email templates configured
- [ ] SMTP settings verified
- [ ] Site URL set correctly in Supabase
- [ ] Reset password redirect URL configured

### **Testing**
- [ ] Forgot password flow tested end-to-end
- [ ] Email delivery confirmed
- [ ] Password update verified
- [ ] Error cases tested

### **Post-Deployment**
- [ ] Monitor password reset success rate
- [ ] Check for user support tickets
- [ ] Review email delivery metrics

---

**Status:** ✅ **Forgot password flow fully implemented and ready for use!** 🎉
