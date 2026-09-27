package expo.modules.nativegooglesignin

import android.os.CancellationSignal
import androidx.core.content.ContextCompat
import androidx.credentials.ClearCredentialStateRequest
import androidx.credentials.CredentialManager
import androidx.credentials.CredentialManagerCallback
import androidx.credentials.CustomCredential
import androidx.credentials.GetCredentialRequest
import androidx.credentials.GetCredentialResponse
import androidx.credentials.exceptions.ClearCredentialException
import androidx.credentials.exceptions.GetCredentialException
import com.google.android.libraries.identity.googleid.GetSignInWithGoogleOption
import com.google.android.libraries.identity.googleid.GoogleIdTokenCredential
import com.google.android.libraries.identity.googleid.GoogleIdTokenParsingException
import expo.modules.kotlin.Promise
import expo.modules.kotlin.exception.CodedException
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class ExpoNativeGoogleSignInModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("ExpoNativeGoogleSignIn")

    // Promise-based overloads: a lambda that only throws has type `Nothing`, which Expo's reified
    // AsyncFunction can't accept (see CLAUDE.md -> Conventions).
    AsyncFunction("signIn") { options: SignInOptions, promise: Promise ->
      signIn(options, promise)
    }

    AsyncFunction("signOut") { promise: Promise ->
      signOut(promise)
    }
  }

  private fun signIn(options: SignInOptions, promise: Promise) {
    val webClientId = options.webClientId.trim()
    if (webClientId.isEmpty()) {
      promise.reject(
        CodedException(
          ErrorCodes.CONFIGURATION_ERROR,
          "expo-native-google-signin: `webClientId` is required on Android (pass the OAuth " +
            "web client ID as `serverClientId` -- see docs/ARCHITECTURE.md).",
          null
        )
      )
      return
    }

    val activity = appContext.currentActivity
    if (activity == null) {
      promise.reject(
        CodedException(
          ErrorCodes.NO_PRESENTER,
          "expo-native-google-signin: no current Activity to present the sign-in UI from.",
          null
        )
      )
      return
    }

    try {
      // Treat a blank nonce as absent.
      val nonce = options.nonce?.trim()?.takeUnless { it.isEmpty() }
      val signInOption = GetSignInWithGoogleOption.Builder(serverClientId = webClientId)
        .apply { nonce?.let { setNonce(it) } }
        .build()
      val request = GetCredentialRequest.Builder()
        .addCredentialOption(signInOption)
        .build()

      CredentialManager.create(activity).getCredentialAsync(
        activity,
        request,
        CancellationSignal(),
        ContextCompat.getMainExecutor(activity),
        object : CredentialManagerCallback<GetCredentialResponse, GetCredentialException> {
          override fun onResult(result: GetCredentialResponse) = resolveSignIn(result, promise)

          override fun onError(e: GetCredentialException) = rejectSignIn(e, promise)
        }
      )
    } catch (t: Throwable) {
      promise.reject(CodedException(ErrorCodes.SIGN_IN_FAILED, t.message ?: t.toString(), t))
    }
  }

  private fun resolveSignIn(response: GetCredentialResponse, promise: Promise) {
    try {
      // 1.6.0 exposes only `credential` (singular); the `credentials` list arrived in 1.7.0-alpha03.
      val credential = response.credential
      if (
        credential !is CustomCredential ||
        credential.type != GoogleIdTokenCredential.TYPE_GOOGLE_ID_TOKEN_CREDENTIAL
      ) {
        promise.reject(
          CodedException(
            ErrorCodes.UNEXPECTED_CREDENTIAL,
            "expo-native-google-signin: received an unexpected credential of type " +
              "'${credential.type}'.",
            null
          )
        )
        return
      }

      val googleIdTokenCredential = GoogleIdTokenCredential.createFrom(credential.data)

      // Omit null user fields rather than sending null, since the TS types are optional.
      val user = mutableMapOf<String, Any?>("email" to googleIdTokenCredential.id)
      googleIdTokenCredential.displayName?.let { user["name"] = it }
      googleIdTokenCredential.givenName?.let { user["givenName"] = it }
      googleIdTokenCredential.familyName?.let { user["familyName"] = it }
      googleIdTokenCredential.profilePictureUri?.let { user["photoUrl"] = it.toString() }

      promise.resolve(
        mapOf(
          "type" to "success",
          "idToken" to googleIdTokenCredential.idToken,
          "user" to user
        )
      )
    } catch (e: GoogleIdTokenParsingException) {
      promise.reject(
        CodedException(
          ErrorCodes.UNEXPECTED_CREDENTIAL,
          "expo-native-google-signin: failed to parse the Google ID token credential " +
            "(${e.message ?: e.toString()}).",
          e
        )
      )
    } catch (t: Throwable) {
      promise.reject(CodedException(ErrorCodes.SIGN_IN_FAILED, t.message ?: t.toString(), t))
    }
  }

  private fun rejectSignIn(e: GetCredentialException, promise: Promise) {
    try {
      when (val failure = mapGetCredentialException(e)) {
        is SignInFailure.Cancelled -> promise.resolve(mapOf("type" to "cancelled"))
        is SignInFailure.Coded ->
          promise.reject(CodedException(failure.code, failure.message, e))
      }
    } catch (t: Throwable) {
      promise.reject(CodedException(ErrorCodes.SIGN_IN_FAILED, t.message ?: t.toString(), t))
    }
  }

  private fun signOut(promise: Promise) {
    val context = appContext.reactContext
    if (context == null) {
      promise.reject(
        CodedException(
          ErrorCodes.SIGN_IN_FAILED,
          "expo-native-google-signin: no application context available to sign out.",
          null
        )
      )
      return
    }

    try {
      CredentialManager.create(context).clearCredentialStateAsync(
        ClearCredentialStateRequest(),
        CancellationSignal(),
        ContextCompat.getMainExecutor(context),
        object : CredentialManagerCallback<Void?, ClearCredentialException> {
          override fun onResult(result: Void?) {
            promise.resolve(null)
          }

          override fun onError(e: ClearCredentialException) {
            promise.reject(
              CodedException(
                ErrorCodes.SIGN_IN_FAILED,
                e.message ?: e.type,
                e
              )
            )
          }
        }
      )
    } catch (t: Throwable) {
      promise.reject(CodedException(ErrorCodes.SIGN_IN_FAILED, t.message ?: t.toString(), t))
    }
  }
}
