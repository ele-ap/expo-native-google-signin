import ExpoModulesCore

// TODO(L4): replace with the real GoogleSignIn-backed sign-in/sign-out flow.
private func notImplementedYetException(_ functionName: String) -> Exception {
  Exception(
    name: "NotImplementedYetException",
    description:
      "expo-native-google-signin: `\(functionName)` is not implemented yet on iOS (tracked for L4).",
    code: "SIGN_IN_FAILED"
  )
}

public class ExpoNativeGoogleSignInModule: Module {
  public func definition() -> ModuleDefinition {
    Name("ExpoNativeGoogleSignIn")

    AsyncFunction("signIn") { (_: [String: Any]) in
      throw notImplementedYetException("signIn")
    }

    AsyncFunction("signOut") {
      throw notImplementedYetException("signOut")
    }
  }
}
