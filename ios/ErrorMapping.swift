import Foundation
import GoogleSignIn

/// Error codes `signIn`/`signOut` reject with. Must match `ERROR_CODES` in `src/types.ts` exactly
/// -- see docs/ARCHITECTURE.md -> "Public API shape". String values mirror Android's
/// `ErrorCodes` object in `ErrorMapping.kt`.
enum ErrorCodes {
  static let configurationError = "CONFIGURATION_ERROR"
  static let noGoogleAccount = "NO_GOOGLE_ACCOUNT"
  static let providerUnavailable = "PROVIDER_UNAVAILABLE"
  static let noPresenter = "NO_PRESENTER"
  static let unexpectedCredential = "UNEXPECTED_CREDENTIAL"
  static let signInFailed = "SIGN_IN_FAILED"
}

/// The outcome of classifying a `GIDSignIn` completion error for `signIn`.
///
/// Kept free of `ExpoModulesCore` types (pure logic over `NSError`'s own properties), mirroring
/// the shape of Android's `SignInFailure` in `ErrorMapping.kt`, which has a JVM unit test
/// (`ErrorMappingTest.kt`). No equivalent Swift unit-test target exists yet; adding one (XCTest in
/// the podspec and CI) is tracked as item 8 in docs/plans/backlog/README.md.
enum SignInFailure: Equatable {
  /// The user dismissed the sign-in sheet; `signIn` should resolve `{ type: 'cancelled' }`.
  case cancelled
  /// `signIn` should reject with this coded error.
  case coded(code: String, message: String)
}

/// Classifies an `NSError` from the `GIDSignIn.sharedInstance.signIn` completion handler.
///
/// Unlike Credential Manager on Android, `GoogleSignIn`'s error domain doesn't distinguish "no
/// Google account" or "provider unavailable" from any other failure -- see
/// `kGIDSignInErrorDomain` / `GIDSignInErrorCode` in `GIDSignIn.h`. So, deliberately diverging
/// from Android, every non-cancel error collapses to `SIGN_IN_FAILED` here; the native message
/// (with the domain and code) is always preserved for logging -- see docs/ARCHITECTURE.md ->
/// "Public API shape".
func classifySignInError(_ error: NSError) -> SignInFailure {
  // `kGIDSignInErrorDomain` is the plain exported `NSErrorDomain` constant from `GIDSignIn.h`;
  // `GIDSignInError.Code` is the enum Swift synthesizes from the header's
  // `NS_ERROR_ENUM(kGIDSignInErrorDomain, GIDSignInErrorCode)` (dropping the `Code` suffix for
  // the outer type, and the `kGIDSignInErrorCode` prefix for each case).
  if error.domain == kGIDSignInErrorDomain, error.code == GIDSignInError.Code.canceled.rawValue {
    return .cancelled
  }
  return .coded(code: ErrorCodes.signInFailed, message: nativeMessage(error))
}

/// The native message, with the domain and code appended so a `SIGN_IN_FAILED` rejection stays
/// debuggable even though every non-cancel `GIDSignIn` error collapses to that one code.
private func nativeMessage(_ error: NSError) -> String {
  "\(error.localizedDescription) (domain: \(error.domain), code: \(error.code))"
}
