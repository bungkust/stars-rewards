#!/usr/bin/env node

/**
 * Google Play Store Compliance Checker - Stars Rewards
 * Run with: node check-compliance.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 Google Play Store Compliance Checker - Stars Rewards\n');

// Check functions
function checkFileExists(filePath, description) {
  const exists = fs.existsSync(filePath);
  console.log(`${exists ? '✅' : '❌'} ${description}: ${filePath}`);
  return exists;
}

function checkDirectoryExists(dirPath, description) {
  const exists = fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory();
  console.log(`${exists ? '✅' : '❌'} ${description}: ${dirPath}`);
  return exists;
}

function checkAndroidManifestCompliance() {
  const manifestPath = 'android/app/src/main/AndroidManifest.xml';
  if (!fs.existsSync(manifestPath)) {
    console.log('❌ AndroidManifest.xml not found');
    return false;
  }

  const manifest = fs.readFileSync(manifestPath, 'utf8');
  const hasFamilyPolicy = manifest.includes('com.google.android.gms.family_policy');
  console.log(`${hasFamilyPolicy ? '✅' : '❌'} Family Policy meta-data in AndroidManifest.xml`);

  return hasFamilyPolicy;
}

function checkPrivacyPolicyLinks() {
  const settingsPath = 'src/pages/settings/Settings.tsx';
  if (!fs.existsSync(settingsPath)) {
    console.log('❌ Settings.tsx not found');
    return false;
  }

  const settings = fs.readFileSync(settingsPath, 'utf8');
  const hasPrivacyLink = settings.includes('privacy') && settings.includes('https://');
  const hasTermsLink = settings.includes('terms') && settings.includes('https://');

  console.log(`${hasPrivacyLink ? '✅' : '❌'} Privacy Policy link in Settings`);
  console.log(`${hasTermsLink ? '✅' : '❌'} Terms & Conditions link in Settings`);

  return hasPrivacyLink && hasTermsLink;
}

// Run checks
console.log('📱 Android Assets:');
checkFileExists('android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png', 'App Icon (xxxhdpi)');
checkFileExists('android/app/src/main/res/drawable/splash.png', 'Splash Screen');
checkDirectoryExists('release-assets', 'Store Assets Directory');

console.log('\n🔒 Privacy & Legal:');
checkFileExists('PRIVACY_POLICY.md', 'Privacy Policy Document');
checkFileExists('TERMS_AND_CONDITIONS.md', 'Terms & Conditions Document');
checkPrivacyPolicyLinks();

console.log('\n🤖 Android Configuration:');
checkAndroidManifestCompliance();

console.log('\n📊 Data Safety:');
checkFileExists('DATA_SAFETY_FORM.md', 'Data Safety Form Guide');

console.log('\n📋 Compliance Documentation:');
checkFileExists('GOOGLE_PLAY_COMPLIANCE.md', 'Compliance Checklist');
checkFileExists('PLAY_STORE_READINESS.md', 'Readiness Guide');

// Summary
console.log('\n' + '='.repeat(50));
console.log('🎯 COMPLIANCE SUMMARY');
console.log('='.repeat(50));
console.log('📝 Documents to Create/Host:');
console.log('   • Privacy Policy website (https://starsrewards.app/privacy)');
console.log('   • Terms & Conditions website (https://starsrewards.app/terms)');
console.log('');
console.log('🖼️  Assets to Create:');
console.log('   • Feature Graphic (1024x500)');
console.log('   • 4-6 Screenshots');
console.log('   • Final App Icon (512x512)');
console.log('');
console.log('⚙️  Play Console Tasks:');
console.log('   • Complete Data Safety form');
console.log('   • Complete Content Rating questionnaire');
console.log('   • Justify app permissions');
console.log('');
console.log('📞 Contact Information Needed:');
console.log('   • Privacy Officer contact details');
console.log('   • Support email for user inquiries');
console.log('');
console.log('🚀 Ready for submission? Check all ✅ above first!');

console.log('\n💡 Tip: Run this script again after making changes to track progress.');
