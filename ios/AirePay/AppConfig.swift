import Foundation

/// URLs for the embedded Next.js app (same routes as the `/m` mobile shell and `/app` desktop).
enum AppConfig {
    /// True on a physical iPhone/iPad when `AIRE_WEB_BASE_URL` is not set. `localhost` would point at the device, not your Mac.
    static var needsMacWebHost: Bool {
        #if targetEnvironment(simulator)
        return false
        #else
        let raw = ProcessInfo.processInfo.environment["AIRE_WEB_BASE_URL"] ?? ""
        return raw.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
        #endif
    }

    /// Root origin only (no path). Simulator default: `http://localhost:3000`. **Device:** set `AIRE_WEB_BASE_URL` (Mac LAN IP or HTTPS deploy).
    static var webRoot: URL {
        if let override = ProcessInfo.processInfo.environment["AIRE_WEB_BASE_URL"],
           let url = URL(string: override.trimmingCharacters(in: .whitespacesAndNewlines)),
           !override.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty {
            return normalizeRoot(url)
        }
        #if targetEnvironment(simulator)
        return URL(string: "http://localhost:3000")!
        #else
        // Unreachable when `needsMacWebHost` is true (UI shows setup). Avoid loading localhost on device.
        return URL(string: "http://127.0.0.1:9")!
        #endif
    }

    static func url(forPath path: String) -> URL {
        var components = URLComponents(url: webRoot, resolvingAgainstBaseURL: false) ?? URLComponents()
        let p = path.hasPrefix("/") ? path : "/" + path
        components.path = p
        components.fragment = nil
        var items = components.queryItems ?? []
        if p.hasPrefix("/m"), !items.contains(where: { $0.name == "embed" }) {
            items.append(URLQueryItem(name: "embed", value: "1"))
        }
        components.queryItems = items.isEmpty ? nil : items
        return components.url ?? webRoot
    }

    private static func normalizeRoot(_ url: URL) -> URL {
        guard var c = URLComponents(url: url, resolvingAgainstBaseURL: false) else { return url }
        if c.path == "/" { c.path = "" }
        return c.url ?? url
    }
}
