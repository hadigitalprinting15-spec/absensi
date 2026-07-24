# Panduan Build APK LIMO PANCER

## Prasyarat
1. **Node.js** (v14+) - [Download](https://nodejs.org)
2. **Java JDK 11+** - [Download](https://www.oracle.com/java/technologies/javase-jdk11-downloads.html)
3. **Android SDK** - Via Android Studio atau cmdline-tools
4. **Gradle** - Biasanya terinstall dengan Android SDK
5. **Git** - [Download](https://git-scm.com)

## Langkah 1: Setup Environment

### Windows:
```bash
# Set JAVA_HOME
setx JAVA_HOME "C:\Program Files\Java\jdk-11.0.x"
setx ANDROID_SDK_ROOT "C:\Users\YourUsername\AppData\Local\Android\Sdk"
setx PATH "%PATH%;%ANDROID_SDK_ROOT%\tools;%ANDROID_SDK_ROOT%\platform-tools"
```

### Mac/Linux:
```bash
export JAVA_HOME=/usr/libexec/java_home
export ANDROID_SDK_ROOT=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_SDK_ROOT/tools:$ANDROID_SDK_ROOT/platform-tools
```

## Langkah 2: Install Cordova

```bash
npm install -g cordova
```

## Langkah 3: Setup Proyek

```bash
cd cordova
npm install
```

## Langkah 4: Add Platform Android

```bash
cordova platform add android
```

## Langkah 5: Install Plugins

```bash
cordova plugin add cordova-plugin-camera
cordova plugin add cordova-plugin-file
cordova plugin add cordova-plugin-device
cordova plugin add cordova-plugin-whitelist
```

## Langkah 6: Build APK

### Development Build (Tidak Signed):
```bash
cordova build android
```

### Release Build (Signed):
```bash
cordova build android --release
```

APK akan tersimpan di: `cordova/platforms/android/app/build/outputs/apk/`

## Langkah 7: Sign APK (Release Only)

### Buat Keystore (Sekali saja):
```bash
keytool -genkey -v -keystore limo-pancer.keystore -keyalg RSA -keysize 2048 -validity 10000 -alias limopancer
```

### Sign APK:
```bash
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 \
  -keystore limo-pancer.keystore \
  platforms/android/app/build/outputs/apk/release/app-release-unsigned.apk \
  limopancer
```

### Align APK (Optimize):
```bash
zipalign -v 4 \
  platforms/android/app/build/outputs/apk/release/app-release-unsigned.apk \
  platforms/android/app/build/outputs/apk/release/LIMO-PANCER-v1.0.0.apk
```

## Troubleshooting

### Error: Android SDK not found
```bash
cordova requirements
# Jalankan Android Studio dan install SDK yang diperlukan
```

### Error: Gradle build failed
```bash
cd cordova/platforms/android
./gradlew clean
cd ../../..
cordova build android
```

### Error: Java not found
Pastikan JAVA_HOME sudah diset ke lokasi JDK yang benar.

## File Output

- **Development APK**: `cordova/platforms/android/app/build/outputs/apk/debug/app-debug.apk`
- **Release APK**: `cordova/platforms/android/app/build/outputs/apk/release/LIMO-PANCER-v1.0.0.apk`

## Testing di Device

```bash
# Install ke device yang terhubung
cordova run android

# Atau manual
adb install platforms/android/app/build/outputs/apk/debug/app-debug.apk
```

## Versioning Update

Edit `cordova/config.xml`:
```xml
<widget id="com.limopancer.absensi" version="1.0.1" ...>
```

Lalu rebuild APK dengan versi baru.
