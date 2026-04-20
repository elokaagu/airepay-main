import SwiftUI

/// Visual tokens aligned with `src/styles.css` (dark “engine” + primary oklch ~268).
enum AireTheme {
    /// Mobile `/m` canvas
    static let canvas = Color(red: 0.02, green: 0.02, blue: 0.02)
    static let surfaceGlass = Color.white.opacity(0.10)
    static let surfaceGlassStrong = Color.white.opacity(0.15)
    static let borderSubtle = Color.white.opacity(0.10)
    static let textPrimary = Color.white
    static let textMuted = Color.white.opacity(0.60)
    static let textTab = Color.white.opacity(0.85)

    /// Primary / “orange” token in web CSS (oklch hue ~268 → blue‑violet).
    static let accent = Color(red: 0.38, green: 0.42, blue: 0.95)
    static let accentDeep = Color(red: 0.30, green: 0.34, blue: 0.88)
    static let dotAlert = Color(red: 0.94, green: 0.27, blue: 0.27)

    static let tabBarBackground = Color.white.opacity(0.07)
    static let tabBarStroke = Color.white.opacity(0.10)

    static func tabLabelFont() -> Font {
        .system(size: 10, weight: .semibold, design: .default)
    }

    static func headerSearchFont() -> Font {
        .system(size: 14, weight: .regular, design: .default)
    }
}
