package expo.modules.nativegooglesignin

import androidx.credentials.exceptions.GetCredentialCancellationException
import androidx.credentials.exceptions.GetCredentialException
import androidx.credentials.exceptions.GetCredentialProviderConfigurationException
import androidx.credentials.exceptions.GetCredentialUnsupportedException
import androidx.credentials.exceptions.NoCredentialException

/**
 * Error codes `signIn`/`signOut` reject with. Must match `ERROR_CODES` in `src/types.ts` exactly
 * -- see docs/ARCHITECTURE.md -> "Public API shape".
 */
object ErrorCodes {
  const val CONFIGURATION_ERROR = "CONFIGURATION_ERROR"
  const val NO_GOOGLE_ACCOUNT = "NO_GOOGLE_ACCOUNT"
  const val PROVIDER_UNAVAILABLE = "PROVIDER_UNAVAILABLE"
  const val NO_PRESENTER = "NO_PRESENTER"
  const val UNEXPECTED_CREDENTIAL = "UNEXPECTED_CREDENTIAL"
  const val SIGN_IN_FAILED = "SIGN_IN_FAILED"
}

/**
 * The outcome of mapping a Credential Manager [GetCredentialException] for `signIn`.
 *
 * Kept free of Android framework calls (pure logic over the exception's own properties) so it can
 * be covered by a plain JVM unit test -- see `ErrorMappingTest`.
 */
sealed interface SignInFailure {
  /** The user dismissed the account chooser; `signIn` should resolve `{ type: 'cancelled' }`. */
  object Cancelled : SignInFailure

  /** `signIn` should reject with this coded error. */
  data class Coded(val code: String, val message: String) : SignInFailure
}

/**
 * Maps a [GetCredentialException] thrown by `CredentialManager.getCredentialAsync` to a
 * [SignInFailure] -- see docs/ARCHITECTURE.md -> "Public API shape" and the plan's "Native
 * behaviour -> Android -> Error mapping" for the rationale behind each mapping.
 */
fun mapGetCredentialException(e: GetCredentialException): SignInFailure = when (e) {
  is GetCredentialCancellationException -> SignInFailure.Cancelled
  is NoCredentialException -> SignInFailure.Coded(ErrorCodes.NO_GOOGLE_ACCOUNT, nativeMessage(e))
  is GetCredentialProviderConfigurationException,
  is GetCredentialUnsupportedException ->
    SignInFailure.Coded(ErrorCodes.PROVIDER_UNAVAILABLE, nativeMessage(e))
  else -> SignInFailure.Coded(ErrorCodes.SIGN_IN_FAILED, nativeMessage(e))
}

/**
 * The native message: [Throwable.message] (which androidx sets from the exception's error
 * message; `errorMessage` itself is a restricted API), falling back to
 * [GetCredentialException.type]. Prefixed with the exception's simple class name, since several
 * exception types share a single error code above.
 */
private fun nativeMessage(e: GetCredentialException): String {
  val message = e.message ?: e.type
  return "${e.javaClass.simpleName}: $message"
}
