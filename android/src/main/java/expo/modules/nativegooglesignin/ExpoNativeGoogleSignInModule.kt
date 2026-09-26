package expo.modules.nativegooglesignin

import expo.modules.kotlin.Promise
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

    // Promise-based overloads: a lambda that only throws has type `Nothing`, which Expo's reified
    // AsyncFunction can't accept. L3's callback-based Credential Manager calls need promises anyway.
    AsyncFunction("signIn") { _: Map<String, Any?>, promise: Promise ->
      promise.reject(NotImplementedYetException("signIn"))
    }

    AsyncFunction("signOut") { promise: Promise ->
      promise.reject(NotImplementedYetException("signOut"))
    }
  }
}
