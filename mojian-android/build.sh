#!/usr/bin/env bash
# 墨笺 Android APK 构建脚本(无 Gradle, 直接使用 SDK build-tools)
set -euo pipefail
cd "$(dirname "$0")"

SDK="${ANDROID_SDK_ROOT:-/opt/android-sdk}"
BT="$SDK/build-tools/35.0.0"
PLATFORM="$SDK/platforms/android-34/android.jar"
OUT=build

rm -rf "$OUT" assets
mkdir -p "$OUT" dist

echo "[1/8] 同步 Web 资源到 assets/"
mkdir -p assets
cp -r ../mojian/index.html ../mojian/css ../mojian/js assets/

echo "[2/8] aapt2 编译资源"
"$BT/aapt2" compile --dir res -o "$OUT/res.zip"

echo "[3/8] aapt2 链接"
"$BT/aapt2" link -o "$OUT/base.apk" \
  -I "$PLATFORM" \
  --manifest AndroidManifest.xml \
  --min-sdk-version 24 --target-sdk-version 34 \
  --version-code 1 --version-name 1.0 \
  --auto-add-overlay \
  "$OUT/res.zip"

echo "[4/8] javac 编译"
mkdir -p "$OUT/obj" "$OUT/dex"
javac -source 1.8 -target 1.8 \
  -bootclasspath "$PLATFORM" \
  -classpath "$PLATFORM" \
  -d "$OUT/obj" \
  $(find src -name '*.java')

echo "[5/8] d8 转 dex"
"$BT/d8" --release --min-api 24 --lib "$PLATFORM" \
  --output "$OUT/dex" \
  $(find "$OUT/obj" -name '*.class')

echo "[6/8] 打包(追加 dex + assets)"
cp "$OUT/base.apk" "$OUT/unsigned.apk"
python3 - <<'PYEOF'
import zipfile
z = zipfile.ZipFile('build/unsigned.apk', 'a', zipfile.ZIP_DEFLATED)
z.write('build/dex/classes.dex', 'classes.dex')
import os
for root, dirs, files in os.walk('assets'):
    for f in files:
        p = os.path.join(root, f)
        z.write(p, p)
z.close()
print('  packed:', len(z.namelist()) if hasattr(z, 'namelist') else 'ok')
PYEOF

echo "[7/8] zipalign 对齐"
"$BT/zipalign" -f 4 "$OUT/unsigned.apk" "$OUT/aligned.apk"

echo "[8/8] 签名"
if [ ! -f keystore.jks ]; then
  keytool -genkeypair -keystore keystore.jks -alias mojian \
    -keyalg RSA -keysize 2048 -validity 10000 \
    -storepass mojian2026 -keypass mojian2026 \
    -dname "CN=Mojian, OU=Dev, O=Mojian, L=Beijing, C=CN" 2>/dev/null
fi
"$BT/apksigner" sign \
  --ks keystore.jks --ks-pass pass:mojian2026 --key-pass pass:mojian2026 \
  --out dist/Mojian-1.0.apk "$OUT/aligned.apk"

"$BT/apksigner" verify dist/Mojian-1.0.apk && echo "签名验证通过"
ls -lh dist/Mojian-1.0.apk
echo "DONE: dist/Mojian-1.0.apk"
