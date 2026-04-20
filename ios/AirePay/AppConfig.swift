import Foundation

/// Central place for environment-specific URLs. Point `webAppURL` at local Next dev or production.
enum AppConfig {
    /// Default: local Next.js dev server. Override per scheme in Xcode (Run → Arguments / Environment) or replace here.
    static var webAppURL: URL {
        if let override = ProcessInfo.processInfo.environment["AIRE_WEB_BASE_URL"],
           let url = URL(string: override), !override.isEmpty {
            return url
        }
        return URL(string: "http://localhost:3000")!
    }
}
