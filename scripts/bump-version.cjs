const fs = require('fs');
const path = require('path');

const buildGradlePath = path.join(__dirname, '../android/app/build.gradle');
const packageJsonPath = path.join(__dirname, '../package.json');

const args = process.argv.slice(2);
const versionType = args[0]; // 'major', 'minor', 'patch', 'build'

if (!versionType) {
  console.error('Please provide version type: major, minor, patch, or build');
  process.exit(1);
}

// Read build.gradle
let gradleContent = fs.readFileSync(buildGradlePath, 'utf8');

// Regex to find version definitions
const majorRegex = /def versionMajor = (\d+)/;
const minorRegex = /def versionMinor = (\d+)/;
const patchRegex = /def versionPatch = (\d+)/;
const buildRegex = /def versionBuild = (\d+)/;

let major = parseInt(gradleContent.match(majorRegex)[1]);
let minor = parseInt(gradleContent.match(minorRegex)[1]);
let patch = parseInt(gradleContent.match(patchRegex)[1]);
let build = parseInt(gradleContent.match(buildRegex)[1]);

// Update Versions
switch (versionType) {
  case 'major':
    major++;
    minor = 0;
    patch = 0;
    build = 0;
    break;
  case 'minor':
    minor++;
    patch = 0;
    build = 0;
    break;
  case 'patch':
    patch++;
    build = 0;
    break;
  case 'build':
    build++;
    break;
  default:
    console.error('Invalid version type');
    process.exit(1);
}

// Replace in content
gradleContent = gradleContent.replace(majorRegex, `def versionMajor = ${major}`);
gradleContent = gradleContent.replace(minorRegex, `def versionMinor = ${minor}`);
gradleContent = gradleContent.replace(patchRegex, `def versionPatch = ${patch}`);
gradleContent = gradleContent.replace(buildRegex, `def versionBuild = ${build}`);

// Write back to build.gradle
fs.writeFileSync(buildGradlePath, gradleContent);

// Update package.json version
const packageJson = require(packageJsonPath);
packageJson.version = `${major}.${minor}.${patch}`;
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

console.log(`Updated version to ${major}.${minor}.${patch} (Build ${build})`);

