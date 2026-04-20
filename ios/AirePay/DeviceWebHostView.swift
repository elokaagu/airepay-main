import SwiftUI

/// On a real iPhone, `localhost` is the phone itself — the Next dev server must be reached via your Mac’s LAN IP or HTTPS deploy URL.
struct DeviceWebHostView: View {
    var body: some View {
        ZStack {
            AireTheme.canvas.ignoresSafeArea()
            ScrollView {
                VStack(alignment: .leading, spacing: 20) {
                    Text("Connect this iPhone to your dev server")
                        .font(.title2.weight(.semibold))
                        .foregroundStyle(AireTheme.textPrimary)

                    Text(
                        "The app loads your real Aire site inside the shell. On device, localhost is this phone, not your Mac — set a reachable base URL (your Mac LAN IP or HTTPS deploy)."
                    )
                    .font(.body)
                    .foregroundStyle(AireTheme.textMuted)

                    VStack(alignment: .leading, spacing: 12) {
                        step(
                            1,
                            "On your Mac, run Next on all interfaces so the phone can reach it, e.g. `npm run dev -- --hostname 0.0.0.0` (port 3000)."
                        )
                        step(2, "Mac → System Settings → Network → Wi‑Fi → Details — note your **IP address** (e.g. 192.168.1.42).")
                        step(
                            3,
                            "Xcode → Product → Scheme → **Edit Scheme** → Run → **Arguments** → **Environment Variables** → add `AIRE_WEB_BASE_URL` = `http://YOUR_IP:3000` (same Wi‑Fi as the phone)."
                        )
                        step(4, "Stop the run, build again, and open the app.")
                    }

                    Text("Production")
                        .font(.headline)
                        .foregroundStyle(AireTheme.textPrimary)
                        .padding(.top, 8)

                    Text("Use your deployed HTTPS origin, e.g. `https://your-app.vercel.app`, as `AIRE_WEB_BASE_URL` — no ATS issues.")
                        .font(.body)
                        .foregroundStyle(AireTheme.textMuted)
                }
                .padding(24)
                .frame(maxWidth: 480)
                .frame(maxWidth: .infinity)
            }
        }
    }

    private func step(_ n: Int, _ text: String) -> some View {
        HStack(alignment: .top, spacing: 12) {
            Text("\(n)")
                .font(.caption.weight(.bold))
                .foregroundStyle(AireTheme.textPrimary)
                .frame(width: 24, height: 24)
                .background(AireTheme.accent.opacity(0.35), in: Circle())
            Text(text)
                .font(.subheadline)
                .foregroundStyle(AireTheme.textPrimary.opacity(0.92))
        }
    }
}

#Preview {
    DeviceWebHostView()
}
