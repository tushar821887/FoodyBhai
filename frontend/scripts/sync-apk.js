const fs = require('fs');
const path = require('path');
const os = require('os');

console.log('🔄 [FoodyBhai APK Auto-Sync] Initializing...');

// Standard paths to search for newly built or placed APKs
const searchPaths = [
  // 1. Android build outputs
  path.join(__dirname, '../android/app/build/outputs/apk/release/app-release.apk'),
  path.join(__dirname, '../android/app/build/outputs/apk/release/app-release-unsigned.apk'),
  path.join(__dirname, '../android/app/build/outputs/apk/debug/app-debug.apk'),
  // 2. Project root or backend uploads
  path.join(__dirname, '../../backend/uploads/foodybhai.apk'),
  path.join(__dirname, '../../FoodyBhai.apk'),
  path.join(__dirname, '../FoodyBhai.apk'),
];

// Check command line argument for direct path
if (process.argv[2]) {
  searchPaths.unshift(path.resolve(process.argv[2]));
}

// Also check User's Downloads folder for real APKs (> 1MB)
const userDownloads = path.join(os.homedir(), 'Downloads');
if (fs.existsSync(userDownloads)) {
  try {
    const files = fs.readdirSync(userDownloads);
    for (const f of files) {
      if (f.toLowerCase().endsWith('.apk')) {
        const fullP = path.join(userDownloads, f);
        try {
          const s = fs.statSync(fullP);
          // Only add if it's a real APK > 1MB (not the 1.5KB index.html)
          if (s.size > 1024 * 1024) {
            searchPaths.push(fullP);
          }
        } catch (e) {}
      }
    }
  } catch (e) {}
}

// Destinations
const destinations = [
  path.join(__dirname, '../public/downloads/foodybhai.apk'),
  path.join(__dirname, '../dist/foody-bhai/browser/downloads/foodybhai.apk'),
  path.join(__dirname, '../../backend/uploads/foodybhai.apk')
];

let sourceApk = null;
let foundStat = null;

for (const p of searchPaths) {
  if (fs.existsSync(p)) {
    try {
      const stat = fs.statSync(p);
      if (stat.isFile() && stat.size > 1024 * 1024) { // Real APKs are > 1MB
        sourceApk = p;
        foundStat = stat;
        break;
      }
    } catch (e) {}
  }
}

if (!sourceApk) {
  console.log('⚠️ No valid compiled APK (> 1MB) found in standard locations.');
  console.log('💡 How to automatically sync an APK:');
  console.log('   1. Build your APK in Android Studio or run Gradle assemble.');
  console.log('   2. OR pass the APK file location:');
  console.log('      npm run sync-apk -- "C:\\path\\to\\your-app.apk"');
  process.exit(1);
}

const sizeMb = (foundStat.size / (1024 * 1024)).toFixed(2);
console.log(`📦 Found valid APK source: ${sourceApk} (${sizeMb} MB)`);

for (const dest of destinations) {
  try {
    const dir = path.dirname(dest);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.copyFileSync(sourceApk, dest);
    console.log(`✅ Synced to: ${dest}`);
  } catch (err) {
    // Ignore if dist doesn't exist yet
  }
}

console.log(`\n🎉 Success! foodybhai.apk is now available for download (${sizeMb} MB).`);
