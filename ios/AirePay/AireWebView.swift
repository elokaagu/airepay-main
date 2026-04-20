import SwiftUI
import WebKit

/// Embeds the Next.js app (same features as `/m` + `/app`) inside the native chrome.
struct AireWebView: UIViewRepresentable {
    var path: String
    @Binding var loadError: String?

    func makeCoordinator() -> Coordinator {
        Coordinator(loadError: $loadError)
    }

    func makeUIView(context: Context) -> WKWebView {
        let config = WKWebViewConfiguration()
        config.allowsInlineMediaPlayback = true
        config.preferences.javaScriptCanOpenWindowsAutomatically = false
        if #available(iOS 15.0, *) {
            config.defaultWebpagePreferences.preferredContentMode = .mobile
        }
        if #available(iOS 14.0, *) {
            config.limitsNavigationsToAppBoundDomains = false
        }

        let webView = WKWebView(frame: .zero, configuration: config)
        webView.isOpaque = true
        webView.backgroundColor = .black
        webView.scrollView.backgroundColor = .black
        webView.scrollView.contentInsetAdjustmentBehavior = .never
        webView.scrollView.delaysContentTouches = false
        webView.navigationDelegate = context.coordinator
        webView.uiDelegate = context.coordinator
        context.coordinator.apply(path: path, to: webView)
        return webView
    }

    func updateUIView(_ webView: WKWebView, context: Context) {
        context.coordinator.apply(path: path, to: webView)
    }

    final class Coordinator: NSObject, WKNavigationDelegate, WKUIDelegate {
        private var loadError: Binding<String?>
        private var lastLoadedPath: String?

        init(loadError: Binding<String?>) {
            self.loadError = loadError
        }

        func apply(path: String, to webView: WKWebView) {
            if lastLoadedPath == path { return }
            if lastLoadedPath != nil {
                webView.stopLoading()
            }
            lastLoadedPath = path
            loadError.wrappedValue = nil
            let url = AppConfig.url(forPath: path)
            webView.load(URLRequest(url: url))
        }

        func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
            loadError.wrappedValue = nil
        }

        func webView(_ webView: WKWebView, didFailProvisionalNavigation navigation: WKNavigation!, withError error: Error) {
            loadError.wrappedValue = error.localizedDescription
        }

        func webView(_ webView: WKWebView, didFail navigation: WKNavigation!, withError error: Error) {
            loadError.wrappedValue = error.localizedDescription
        }

        /// Keep `target=_blank` / new-window navigations inside this WebView (avoids SpringBoard trying to open untrusted `http://` in Safari).
        func webView(
            _ webView: WKWebView,
            decidePolicyFor navigationAction: WKNavigationAction,
            decisionHandler: @escaping (WKNavigationActionPolicy) -> Void
        ) {
            if navigationAction.targetFrame == nil, let url = navigationAction.request.url {
                webView.load(URLRequest(url: url))
                decisionHandler(.cancel)
                return
            }
            decisionHandler(.allow)
        }

        func webView(
            _ webView: WKWebView,
            createWebViewWith configuration: WKWebViewConfiguration,
            for navigationAction: WKNavigationAction,
            windowFeatures: WKWindowFeatures
        ) -> WKWebView? {
            if let url = navigationAction.request.url {
                webView.load(URLRequest(url: url))
            }
            return nil
        }
    }
}
