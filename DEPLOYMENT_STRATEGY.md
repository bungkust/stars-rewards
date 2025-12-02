# 🚀 Star Habit - Deployment Strategy

## 📋 Overview
Star Habit adalah **mobile-only app**. Domain web (`app.starhabit.web.id`) hanya untuk landing page, privacy policy, dan terms of service. **User TIDAK boleh mengakses app React dari web browser.**

## 🏗️ Deployment Architecture

### **Domain Structure:**
```
app.starhabit.web.id/
├── / (root) → docs/index.html (Landing Page)
├── /privacy → docs/privacy.html
└── /terms → docs/terms.html

[NO REACT APP DEPLOYED TO WEB]
```

### **Mobile App Only:**
- ✅ Android APK/IPA
- ✅ App Store & Play Store
- ✅ Deep linking support
- ❌ No web access to app

## 🔧 Current Netlify Configuration

### **netlify.toml** (Updated)
```toml
[build]
  # Deploy docs folder to root domain - NO React app
  publish = "docs"
  command = "echo 'Deploying docs folder only - no build needed'"

# No SPA fallback needed for static docs
```

### **What Gets Deployed:**
- ✅ `docs/index.html` → Landing page
- ✅ `docs/privacy.html` → Privacy Policy
- ✅ `docs/terms.html` → Terms of Service
- ❌ `dist/` folder (React app) → **NOT deployed**

## 📱 Mobile Deployment

### **Android APK:**
```bash
npm run build:android
# Output: android/app/build/outputs/apk/debug/app-debug.apk
# Copy to: /Users/ruangguru/Documents/Bungkuss/android-build/star-habit-debug.apk
```

### **Google Play Store:**
- **App Name:** Star Habit
- **Package ID:** `com.myfamily.starhabit`
- **APK:** Upload `star-habit-debug.apk`

### **iOS (Future):**
- **App Name:** Star Habit
- **Bundle ID:** `com.myfamily.starhabit`
- **IPA:** Build via Xcode

## 🔗 Deep Linking Setup

### **Reset Password Flow:**
1. User klik link di email: `starhabit://reset-password#access_token=...`
2. **App terbuka langsung** (bukan browser)
3. Token diparsing dan user langsung ke reset password page

### **Supabase Configuration:**
- **Site URL:** `https://app.starhabit.web.id`
- **Redirect URLs:** `starhabit://reset-password`

## 🚫 Why No Web App?

### **Business Reasons:**
- ✅ **Mobile-first experience** - Optimized for phones/tablets
- ✅ **App Store compliance** - Better discoverability
- ✅ **Push notifications** - Only available in native apps
- ✅ **Offline functionality** - Better user experience
- ✅ **Native features** - Camera, contacts, etc.

### **Technical Reasons:**
- ✅ **Performance** - Native apps faster than web
- ✅ **Security** - Better data protection
- ✅ **User engagement** - Higher retention in apps
- ✅ **Monetization** - App stores provide better revenue

## 📋 Deployment Checklist

### **Pre-Deployment:**
- [x] Update app name to "Star Habit"
- [x] Update package ID to `com.myfamily.starhabit`
- [x] Update deep linking scheme to `starhabit://`
- [x] Update docs/ content with correct branding
- [x] Configure netlify.toml to deploy docs/ only

### **Web Deployment (Netlify):**
- [x] Domain: `app.starhabit.web.id`
- [x] Publish folder: `docs/`
- [x] No React app deployed
- [x] Privacy Policy & Terms accessible

### **Mobile Deployment:**
- [ ] Build Android APK with new package name
- [ ] Test deep linking functionality
- [ ] Upload to Google Play Store
- [ ] Test reset password flow end-to-end

### **Post-Deployment:**
- [ ] Update Supabase redirect URLs
- [ ] Test email reset password links
- [ ] Verify deep linking works
- [ ] Monitor app store submissions

## 🔍 Testing Checklist

### **Web Domain (`app.starhabit.web.id`):**
- [ ] Landing page loads correctly
- [ ] Privacy Policy accessible at `/privacy`
- [ ] Terms of Service accessible at `/terms`
- [ ] No React app accessible (404 or redirect)

### **Mobile App:**
- [ ] App installs with new name "Star Habit"
- [ ] Package ID: `com.myfamily.starhabit`
- [ ] Deep linking: `starhabit://reset-password`
- [ ] Reset password flow works end-to-end

### **Email Integration:**
- [ ] Reset password emails sent from Supabase
- [ ] Links use `starhabit://` scheme
- [ ] Clicking links opens mobile app directly

## 🚨 Important Notes

### **Security Considerations:**
- Web domain should NOT contain any app functionality
- All user data should only be accessible via mobile app
- Reset password links should ONLY work in mobile app

### **User Experience:**
- Clear messaging that app is mobile-only
- Easy download links on landing page
- No confusion between web and mobile versions

### **Maintenance:**
- Keep docs/ folder updated with latest branding
- Regular updates to privacy policy and terms
- Monitor deep linking functionality

---

## ✅ Status: **CONFIGURED FOR MOBILE-ONLY DEPLOYMENT**

Domain `app.starhabit.web.id` sekarang mengarah ke **docs folder** (landing page) bukan React app. User hanya bisa mengakses Star Habit melalui **mobile app** di App Store/Play Store! 📱🚀
