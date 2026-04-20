import SwiftUI

struct ContentView: View {
    var body: some View {
        NavigationStack {
            VStack(spacing: 20) {
                Text("Aire")
                    .font(.largeTitle.weight(.semibold))

                Text("Native companion for the Aire web app. Connect your API and Supabase flows here.")
                    .font(.body)
                    .multilineTextAlignment(.center)
                    .foregroundStyle(.secondary)
                    .padding(.horizontal)

                Link("Open web app", destination: AppConfig.webAppURL)
                    .buttonStyle(.borderedProminent)
            }
            .padding()
            .navigationTitle("Home")
        }
    }
}

#Preview {
    ContentView()
}
