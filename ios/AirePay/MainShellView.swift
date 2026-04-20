import SwiftUI

/// Native chrome matching `src/routes/m.tsx`: top bar, embedded web engine, floating pill tab bar.
struct MainShellView: View {
    @State private var activePath = "/m"
    @State private var userInitial = "A"
    /// Short delay before mounting WKWebView so the shell + WebKit networking extension can finish coming up (reduces “unresponsive” / 15s launch stalls under Xcode on device).
    @State private var webShellReady = false
    @State private var didScheduleWebWarmup = false
    @State private var webLoadError: String?

    private var selectedTab: AireTab {
        AireTab.matching(path: activePath)
    }

    var body: some View {
        if AppConfig.needsMacWebHost {
            DeviceWebHostView()
                .preferredColorScheme(.dark)
        } else {
            engineChrome
        }
    }

    @ViewBuilder
    private var engineChrome: some View {
        GeometryReader { geo in
            let maxW = min(480, geo.size.width)
            ZStack {
                AireTheme.canvas
                    .ignoresSafeArea()

                VStack(spacing: 0) {
                    topChrome(maxWidth: maxW)
                    Group {
                        if webShellReady {
                            ZStack(alignment: .top) {
                                AireWebView(path: activePath, loadError: $webLoadError)
                                    .frame(maxWidth: .infinity, maxHeight: .infinity)
                                if let err = webLoadError {
                                    Text(err)
                                        .font(.caption)
                                        .foregroundStyle(.white)
                                        .padding(10)
                                        .frame(maxWidth: .infinity)
                                        .background(.red.opacity(0.85))
                                }
                            }
                            .frame(maxWidth: .infinity, maxHeight: .infinity)
                        } else {
                            ProgressView()
                                .progressViewStyle(.circular)
                                .tint(AireTheme.accent)
                                .frame(maxWidth: .infinity, maxHeight: .infinity)
                        }
                    }
                }
                .frame(width: maxW)
                .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .top)
                .onAppear {
                    guard !didScheduleWebWarmup else { return }
                    didScheduleWebWarmup = true
                    Task { @MainActor in
                        try? await Task.sleep(for: .milliseconds(200))
                        webShellReady = true
                    }
                }
                .safeAreaInset(edge: .bottom, spacing: 0) {
                    bottomChrome(maxWidth: maxW)
                        .padding(.horizontal, 12)
                        .padding(.top, 8)
                        .padding(.bottom, max(10, geo.safeAreaInsets.bottom + 6))
                }
            }
        }
        .preferredColorScheme(.dark)
    }

    @ViewBuilder
    private func topChrome(maxWidth: CGFloat) -> some View {
        HStack(spacing: 10) {
            Button {
                activePath = "/m/settings"
            } label: {
                ZStack(alignment: .topTrailing) {
                    Text(userInitial)
                        .font(.system(size: 14, weight: .semibold))
                        .foregroundStyle(AireTheme.textPrimary)
                        .frame(width: 44, height: 44)
                        .background(AireTheme.surfaceGlass, in: Circle())
                    Circle()
                        .fill(AireTheme.dotAlert)
                        .frame(width: 8, height: 8)
                        .overlay(Circle().stroke(AireTheme.canvas, lineWidth: 2))
                        .offset(x: 2, y: -2)
                }
            }
            .accessibilityLabel("Account and settings")

            Button {
                activePath = "/m/simulator"
            } label: {
                HStack(spacing: 8) {
                    Image(systemName: "magnifyingglass")
                        .font(.system(size: 15, weight: .medium))
                    Text("Search")
                        .font(AireTheme.headerSearchFont())
                }
                .foregroundStyle(AireTheme.textMuted)
                .frame(maxWidth: .infinity)
                .frame(height: 44)
                .background(AireTheme.surfaceGlass, in: Capsule())
            }
            .accessibilityLabel("Compare scenarios")

            Button {
                activePath = "/m/simulator"
            } label: {
                Image(systemName: "chart.bar.xaxis")
                    .font(.system(size: 16, weight: .medium))
                    .foregroundStyle(AireTheme.textPrimary)
                    .frame(width: 44, height: 44)
                    .background(AireTheme.surfaceGlass, in: Circle())
            }
            .accessibilityLabel("Open compare")

            Button {
                activePath = "/app"
            } label: {
                Image(systemName: "display")
                    .font(.system(size: 15, weight: .medium))
                    .foregroundStyle(AireTheme.textPrimary)
                    .frame(width: 44, height: 44)
                    .background(AireTheme.surfaceGlass, in: Circle())
            }
            .accessibilityLabel("Open desktop engine view")
        }
        .padding(.horizontal, 16)
        .padding(.top, 10)
        .padding(.bottom, 12)
        .frame(maxWidth: maxWidth)
        .background(.ultraThinMaterial.opacity(0.2))
        .background(AireTheme.canvas.opacity(0.9))
    }

    @ViewBuilder
    private func bottomChrome(maxWidth: CGFloat) -> some View {
        HStack(spacing: 4) {
            ForEach(AireTab.allCases) { tab in
                let active = selectedTab == tab
                Button {
                    activePath = tab.path
                } label: {
                    VStack(spacing: 2) {
                        TabIconBar(tab: tab, active: active)
                        Text(tab.label)
                            .font(AireTheme.tabLabelFont())
                            .foregroundStyle(active ? AireTheme.textPrimary : AireTheme.textTab)
                    }
                    .padding(.horizontal, 14)
                    .padding(.vertical, 8)
                    .background(active ? AireTheme.surfaceGlassStrong : Color.clear, in: Capsule())
                }
                .buttonStyle(.plain)
            }
        }
        .padding(6)
        .background(AireTheme.tabBarBackground, in: Capsule())
        .overlay(Capsule().stroke(AireTheme.tabBarStroke, lineWidth: 1))
        .background(.ultraThinMaterial.opacity(0.15), in: Capsule())
        .frame(maxWidth: maxWidth)
    }
}

#Preview {
    MainShellView()
}
