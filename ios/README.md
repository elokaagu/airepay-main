# Aire — iOS (SwiftUI)

Native shell around the **same Next.js app** you run for web: Goals, Wishlist, Bond, Compare (simulator), Earn, onboarding, Supabase auth, etc. The UI matches the **`/m` mobile** layout (black canvas, glass header, floating pill tab bar).

## Open in Xcode

```bash
open ios/AirePay.xcodeproj
```

Select **AirePay**, pick a simulator, **⌘R**. Start **`npm run dev`** so `http://localhost:3000` is up (Simulator can reach your Mac’s localhost).

## Point the app at your server

**Simulator:** default is `http://localhost:3000` (your Mac).

**Physical iPhone:** `localhost` is the phone itself, not your Mac. You **must** set **`AIRE_WEB_BASE_URL`** or the app shows an on-screen setup guide instead of the WebView.

1. Xcode → **Product → Scheme → Edit Scheme → Run → Arguments → Environment Variables**
2. Add **`AIRE_WEB_BASE_URL`** = e.g. `http://192.168.x.x:3000` (your Mac’s Wi‑Fi IP) or `https://your-deployment.vercel.app`
3. Start Next so it accepts LAN connections, e.g. `npm run dev -- --hostname 0.0.0.0` (same port, usually 3000).

`AppConfig.webRoot` reads that variable; tabs load `/m`, `/m/goals`, `/m/wishlist`, `/m/bond`, `/m/settings`, and the header shortcuts load `/m/simulator` and `/app`.

### WebKit “Networking” / GPU / WebContent took 10–20s / `processDidBecomeUnresponsive`

Under **Xcode debugging on a device**, WebKit child processes often start slowly the first time. Mitigations:

- Prefer a **USB cable** (turn off **Connect via network** for the device in Xcode’s Devices window).
- Try **Product → Scheme → Edit Scheme → Run** and temporarily disable **Debug executable** to confirm it’s debugger overhead.
- Use a **Release** build on device for realistic performance.
- The app **waits ~200ms** before creating `WKWebView` (lets the window settle first), uses **mobile** webpage preferences, **`stopLoading()`** when changing tabs, and **`delaysContentTouches = false`** on the scroll view to reduce jank.

The log line **`Failed to resolve host network app id … com.apple.WebKit.Networking`** is often a **benign system message** on recent iOS; if everything loads, you can ignore it.

### “Failed to open URL localhost” / “Request is not trusted”

That usually means something tried to open **plain HTTP localhost** in **Safari** from the device (where no dev server runs), or a `target=_blank` handoff. The app now keeps new-window navigations **inside `WKWebView`** and blocks **device + missing `AIRE_WEB_BASE_URL`** from loading localhost at all.

## Regenerate the Xcode project (optional)

If you edit **`project.yml`**:

```bash
brew install xcodegen   # once
npm run ios:gen
```

Commit the updated `AirePay.xcodeproj` if your team should not depend on XcodeGen.

## Branding

Swift tokens live in **`AirePay/AireTheme.swift`** (dark canvas, white/glass chrome, blue‑violet accent aligned with `src/styles.css` primary). **AccentColor** in the asset catalog matches that accent.

## App icon

`AppIcon.appiconset` includes a **1024×1024** universal slot. Replace in Xcode when you have final art.

## Local HTTP & ATS

`AirePay/Info.plist` sets **`NSAllowsLocalNetworking`** so the simulator can load `http://localhost:3000` in `WKWebView`. Production HTTPS needs no extra ATS.
