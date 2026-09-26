package expo.modules.nativegooglesignin

import expo.modules.kotlin.exception.CodedException
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

// TODO(L3): replace with the real Credential Manager sign-in/sign-out flow, plus a dedicated
// ErrorMapping.kt for GetCredentialException subtypes (see docs/plans/active).
private class NotImplementedYetException(functionName: String) : CodedException(
  "SIGN_IN_FAILED",
  "expo-native-google-signin: `$functionName` is not implemented yet on Android (tracked for L3).",
  null
)

class ExpoNativeGoogleSignInModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("ExpoNativeGoogleSignIn")

    AsyncFunction("signIn") { _: Map<String, Any?> ->
      throw NotImplementedYetException("signIn")
    }

    AsyncFunction("signOut") {
      throw NotImplementedYetException("signOut")
    }
  }
}
