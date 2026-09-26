import ExpoModulesCore
import GoogleSignIn

public class ExpoNativeGoogleSignInModule: Module {
  public func definition() -> ModuleDefinition {
    Name("ExpoNativeGoogleSignIn")

    // Runs on the main queue: `currentViewController()` and `GIDSignIn`'s UI both require it.
    AsyncFunction("signIn") { (options: SignInOptions, promise: Promise) in
      self.signIn(options, promise: promise)
    }.runOnQueue(.main)

    AsyncFunction("signOut") {
      GIDSignIn.sharedInstance.signOut()
    }.runOnQueue(.main)
  }

  private func signIn(_ options: SignInOptions, promise: Promise) {
    let webClientId = options.webClientId.trimmingCharacters(in: .whitespacesAndNewlines)
    if webClientId.isEmpty {
      promise.reject(
        Exception(
          name: "ConfigurationError",
          description:
            "expo-native-google-signin: `webClientId` is required (pass the OAuth web client " +
            "ID -- see docs/ARCHITECTURE.md).",
          code: ErrorCodes.configurationError
        )
      )
      return
    }

    // A blank `iosClientId` counts as absent, same as a blank `nonce` below.
    let iosClientId = options.iosClientId?.trimmingCharacters(in: .whitespacesAndNewlines)
    guard let iosClientId, !iosClientId.isEmpty else {
      promise.reject(
        Exception(
          name: "ConfigurationError",
          description:
            "expo-native-google-signin: `iosClientId` is required on iOS (pass the OAuth iOS " +
            "client ID from Google Cloud Console -- Android does not need it, see " +
            "docs/ARCHITECTURE.md).",
          code: ErrorCodes.configurationError
        )
      )
      return
    }

    guard let presentingViewController = appContext?.utilities?.currentViewController() else {
      promise.reject(
        Exception(
          name: "NoPresenter",
          description:
            "expo-native-google-signin: no current view controller to present the sign-in UI " +
            "from.",
          code: ErrorCodes.noPresenter
        )
      )
      return
    }

    // Configure only once the call can proceed, so a failing call doesn't change the shared SDK state.
    GIDSignIn.sharedInstance.configuration = GIDConfiguration(
      clientID: iosClientId,
      serverClientID: webClientId
    )

    // Treat a blank nonce as absent.
    let trimmedNonce = options.nonce?.trimmingCharacters(in: .whitespacesAndNewlines)
    let nonce = (trimmedNonce?.isEmpty ?? true) ? nil : trimmedNonce

    GIDSignIn.sharedInstance.signIn(
      withPresenting: presentingViewController,
      hint: nil,
      additionalScopes: nil,
      nonce: nonce
    ) { result, error in
      self.handleSignInCompletion(result: result, error: error, promise: promise)
    }
  }

  private func handleSignInCompletion(result: GIDSignInResult?, error: Error?, promise: Promise) {
    if let error {
      switch classifySignInError(error as NSError) {
      case .cancelled:
        promise.resolve(["type": "cancelled"])
      case .coded(let code, let message):
        promise.reject(Exception(name: "SignInFailed", description: message, code: code))
      }
      return
    }

    guard let result else {
      // Not expected from `GIDSignIn` (exactly one of `result`/`error` should be non-nil), but
      // handled defensively so the promise always settles.
      promise.reject(
        Exception(
          name: "SignInFailed",
          description:
            "expo-native-google-signin: GoogleSignIn returned neither a result nor an error.",
          code: ErrorCodes.signInFailed
        )
      )
      return
    }

    guard let idToken = result.user.idToken?.tokenString else {
      promise.reject(
        Exception(
          name: "UnexpectedCredential",
          description: "expo-native-google-signin: the signed-in Google user has no ID token.",
          code: ErrorCodes.unexpectedCredential
        )
      )
      return
    }

    // `email` is required by `GoogleUser` in `src/types.ts`; `GIDGoogleUser.profile` is the only
    // source for it and is itself optional, so its absence is `UNEXPECTED_CREDENTIAL`.
    guard let profile = result.user.profile else {
      promise.reject(
        Exception(
          name: "UnexpectedCredential",
          description:
            "expo-native-google-signin: the signed-in Google user has no profile data (email).",
          code: ErrorCodes.unexpectedCredential
        )
      )
      return
    }

    // Omit null user fields rather than sending null, since the TS types are optional -- mirrors
    // Android's `ExpoNativeGoogleSignInModule.kt` -> `resolveSignIn`.
    var user: [String: Any] = [
      "email": profile.email,
      "name": profile.name,
    ]
    if let givenName = profile.givenName {
      user["givenName"] = givenName
    }
    if let familyName = profile.familyName {
      user["familyName"] = familyName
    }
    // 120pt is a judgement call (no direct Android equivalent to mirror -- Credential Manager's
    // `profilePictureUri` has no dimension parameter); large enough for a typical profile avatar.
    if profile.hasImage, let photoUrl = profile.imageURL(withDimension: 120)?.absoluteString {
      user["photoUrl"] = photoUrl
    }

    let payload: [String: Any] = [
      "type": "success",
      "idToken": idToken,
      "user": user,
    ]
    promise.resolve(payload)
  }
}
