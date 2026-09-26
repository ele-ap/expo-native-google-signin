import ExpoModulesCore
import GoogleSignIn

/// Forwards the OAuth redirect URL to the `GoogleSignIn` SDK so an in-flight `signIn()` call can
/// complete.
public class ExpoNativeGoogleSignInAppDelegateSubscriber: ExpoAppDelegateSubscriber {
  public func application(
    _ app: UIApplication,
    open url: URL,
    options: [UIApplication.OpenURLOptionsKey: Any] = [:]
  ) -> Bool {
    return GIDSignIn.sharedInstance.handle(url)
  }
}
