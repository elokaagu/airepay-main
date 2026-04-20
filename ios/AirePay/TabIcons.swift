import SwiftUI

/// Tab bar icons aligned with `src/routes/m.tsx` (stroke 2–2.2pt on 24×24).
private enum TabIconScale {
    static func point(_ x: CGFloat, _ y: CGFloat, in rect: CGRect) -> CGPoint {
        CGPoint(x: rect.minX + x * rect.width / 24, y: rect.minY + y * rect.height / 24)
    }
}

struct TabIconHome: Shape {
    func path(in rect: CGRect) -> Path {
        let p = TabIconScale.point
        var path = Path()
        path.move(to: p(7, 4, rect))
        path.addLine(to: p(7, 20, rect))
        path.move(to: p(7, 12, rect))
        path.addCurve(to: p(18, 4, rect), control1: p(12, 12, rect), control2: p(15, 9, rect))
        path.move(to: p(7, 12, rect))
        path.addCurve(to: p(18, 20, rect), control1: p(12, 12, rect), control2: p(15, 15, rect))
        return path
    }
}

struct TabIconGoals: View {
    var body: some View {
        ZStack {
            Circle().stroke(lineWidth: 2).scaleEffect(18 / 24)
            Circle().stroke(lineWidth: 2).scaleEffect(10 / 24)
            Circle().fill().frame(width: 3.2, height: 3.2)
        }
        .frame(width: 22, height: 22)
    }
}

struct TabIconBond: Shape {
    func path(in rect: CGRect) -> Path {
        let p = TabIconScale.point
        let r = rect.width * 3 / 24
        var path = Path()
        path.addEllipse(in: CGRect(x: p(6, 12, rect).x - r, y: p(6, 12, rect).y - r, width: 2 * r, height: 2 * r))
        path.addEllipse(in: CGRect(x: p(18, 12, rect).x - r, y: p(18, 12, rect).y - r, width: 2 * r, height: 2 * r))
        path.move(to: p(9, 12, rect))
        path.addLine(to: p(15, 12, rect))
        return path
    }
}

struct TabIconYou: Shape {
    func path(in rect: CGRect) -> Path {
        let p = TabIconScale.point
        var path = Path()
        path.addEllipse(in: CGRect(x: p(8.5, 5.5, rect).x, y: p(8.5, 5.5, rect).y, width: rect.width * 7 / 24, height: rect.height * 7 / 24))
        path.move(to: p(5, 20, rect))
        path.addQuadCurve(to: p(19, 20, rect), control: p(12, 15.5, rect))
        return path
    }
}

struct TabIconBar: View {
    let tab: AireTab
    var active: Bool

    var body: some View {
        Group {
            switch tab {
            case .home:
                TabIconHome().stroke(style: StrokeStyle(lineWidth: 2.2, lineCap: .round, lineJoin: .round))
            case .goals:
                TabIconGoals()
            case .wishlist:
                Image(systemName: "heart")
                    .font(.system(size: 15, weight: .semibold))
                    .frame(width: 22, height: 22)
            case .bond:
                TabIconBond().stroke(style: StrokeStyle(lineWidth: 2, lineCap: .round, lineJoin: .round))
            case .you:
                TabIconYou().stroke(style: StrokeStyle(lineWidth: 2, lineCap: .round, lineJoin: .round))
            }
        }
        .frame(width: 22, height: 22)
        .foregroundStyle(active ? AireTheme.textPrimary : AireTheme.textTab)
    }
}
