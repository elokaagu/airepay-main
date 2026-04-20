# Aire — iOS (SwiftUI)

Native **SwiftUI** app alongside the Next.js web app.

## Open in Xcode

The repo includes **`AirePay.xcodeproj`**, so you can open it without any extra tools:

```bash
open ios/AirePay.xcodeproj
```

Select the **AirePay** scheme, pick a simulator or device, press Run (⌘R).

## Regenerate the Xcode project (optional)

If you edit **`project.yml`**, regenerate the project with [XcodeGen](https://github.com/yonaskolb/XcodeGen):

```bash
brew install xcodegen   # once
npm run ios:gen         # or: cd ios && xcodegen generate
```

Then commit the updated `AirePay.xcodeproj` if you want others to get the same settings without running XcodeGen.

## Layout

| Path | Purpose |
|------|---------|
| `project.yml` | XcodeGen spec — targets, bundle ID, build settings |
| `AirePay/` | Swift sources and `Assets.xcassets` |
| `AirePay.xcodeproj` | Xcode project (checked in) |

## Web URL

`AppConfig.webAppURL` defaults to `http://localhost:3000`. On a **physical device**, set **`AIRE_WEB_BASE_URL`** in the Xcode scheme (e.g. `http://192.168.x.x:3000`) or change the default in `AppConfig.swift`.

## App icon

`AppIcon.appiconset` includes a **1024×1024** `AppIcon.png` for the App Store / universal slot. Replace it in Xcode’s asset catalog when you have final art.
