# Android app (Google Play)

The PWA is wrapped in [Capacitor](https://capacitorjs.com/). `scripts/build-www.mjs`
assembles the static site into `www/`, and Capacitor packages that into a native
WebView served from `https://localhost`.

## Prerequisites

Node 20+ · JDK 17 or 21 · Android SDK Platform 36 + Build-Tools 36.

Set `ANDROID_HOME`, or create `android/local.properties` with `sdk.dir=/path/to/sdk`
(gitignored).

## Commands

```bash
npm run android:sync     # rebuild www/ and copy it into the native project
npm run android:apk      # debug APK for sideloading
npm run android:bundle   # signed release AAB — this is what Play takes
npm run android:open     # open in Android Studio
```

Output: `android/app/build/outputs/bundle/release/app-release.aab`.

## Configure the AI endpoint before shipping

**This is the one step that is not optional.** On the web the app and `/api/ai`
share an origin, so a relative fetch works. In the app the origin is
`https://localhost`, which has no `/api` route — every AI call would fail.

Set the deployment origin in [`native-config.js`](native-config.js):

```js
window.HA_API_BASE = "https://your-deployment.vercel.app";
```

Leaving it empty is a legitimate choice — training, nutrition, timers, logging
and progress all work fully offline, and the AI surfaces a clear
"AI NOT CONFIGURED FOR THIS BUILD" message instead of failing silently.

## Signing

`android/app/build.gradle` reads `android/keystore.properties`, falling back to
environment variables. **Both are gitignored — never commit them.**

```bash
keytool -genkeypair -v -keystore ~/hybrid-athlete-upload.jks \
  -alias hybrid -keyalg RSA -keysize 4096 -validity 10000
```

```properties
storeFile=/absolute/path/to/hybrid-athlete-upload.jks
storePassword=...
keyAlias=hybrid
keyPassword=...
```

CI equivalents: `ANDROID_KEYSTORE_FILE`, `ANDROID_KEYSTORE_PASSWORD`,
`ANDROID_KEY_ALIAS`, `ANDROID_KEY_PASSWORD`.

> Back up the keystore. Whoever holds it can publish updates to your listing;
> losing it means you cannot update your own app.

## What is already handled

- **`targetSdk` 36** — Play's floor for new submissions from 31 Aug 2026.
- **Service worker disabled natively** — the assets already ship in the APK, and
  `sw.js` is network-first for navigations, so it would fire doomed requests at
  `https://localhost` on every launch.
- **Back button** — returns to the Mission tab, then exits. Without this, a
  single-page app with no history entries ignores Back entirely and reads as a hang.
- **Status bar** — dark icons, to be legible against the light `#FAF9F5` UI.
- **Native theme** matches the web background, so there is no white flash on
  cold start.
- **Adaptive icon** with a full-bleed background layer.
- **R8 + resource shrinking** on release.
- **`api/` excluded from the bundle** — it is a serverless function, not app code.

## Data and backup

Training logs, measurements and **progress photos** live in the WebView's
localStorage. Android auto-backup is left enabled, so this restores onto a new
phone via the user's own Google Drive. If you would rather that data never leave
the device, set `android:allowBackup="false"` in
`android/app/src/main/AndroidManifest.xml` — and note it changes your Play Data
Safety answers.

## Play Console steps (manual)

1. Play Console account — $25 one-off, plus identity verification.
2. Play App Signing — recommended; Google holds the final signing key.
3. Privacy policy URL — required. Must cover the AI calls and any photo handling.
4. Data Safety form — this app sends images to a Gemini proxy when AI features
   are used. Declare that honestly.
5. Listing assets — 512×512 icon, 1024×500 feature graphic, ≥2 phone screenshots.
6. Content rating questionnaire, target audience, account-deletion policy.
7. Closed testing track — required before production for new accounts.

### Minimum Functionality

Google rejects thin wrappers around a website. This app is not one: it works
offline, stores data locally, and provides timers, logging and planning without a
network. Say so in the listing description.
