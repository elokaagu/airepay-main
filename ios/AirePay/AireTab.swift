import Foundation

/// Bottom tabs — same destinations as `src/routes/m.tsx`.
enum AireTab: Int, CaseIterable, Identifiable {
    case home
    case goals
    case wishlist
    case bond
    case you

    var id: Int { rawValue }

    var path: String {
        switch self {
        case .home: return "/m"
        case .goals: return "/m/goals"
        case .wishlist: return "/m/wishlist"
        case .bond: return "/m/bond"
        case .you: return "/m/settings"
        }
    }

    var label: String {
        switch self {
        case .home: return "Home"
        case .goals: return "Goals"
        case .wishlist: return "Wishlist"
        case .bond: return "Bond"
        case .you: return "You"
        }
    }

    /// Which tab should appear selected for a given path (longest prefix wins).
    static func matching(path: String) -> AireTab {
        let p = path.components(separatedBy: "?").first ?? path
        if p.hasPrefix("/m/goals") { return .goals }
        if p.hasPrefix("/m/wishlist") { return .wishlist }
        if p.hasPrefix("/m/bond") { return .bond }
        if p.hasPrefix("/m/settings") { return .you }
        if p.hasPrefix("/app") { return .home }
        return .home
    }
}
