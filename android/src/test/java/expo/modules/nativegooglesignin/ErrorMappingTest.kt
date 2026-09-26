package expo.modules.nativegooglesignin

import androidx.credentials.exceptions.GetCredentialCancellationException
import androidx.credentials.exceptions.GetCredentialProviderConfigurationException
import androidx.credentials.exceptions.GetCredentialUnknownException
import androidx.credentials.exceptions.GetCredentialUnsupportedException
import androidx.credentials.exceptions.NoCredentialException
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

class ErrorMappingTest {
  @Test
  fun cancellationMapsToCancelled() {
    val failure = mapGetCredentialException(GetCredentialCancellationException("user tapped away"))

    assertEquals(SignInFailure.Cancelled, failure)
  }

  @Test
  fun noCredentialMapsToNoGoogleAccountAndKeepsTheMessage() {
    val failure =
      mapGetCredentialException(NoCredentialException("no Google account on this device"))

    val coded = failure as SignInFailure.Coded
    assertEquals(ErrorCodes.NO_GOOGLE_ACCOUNT, coded.code)
    assertTrue(coded.message.contains("no Google account on this device"))
  }

  @Test
  fun providerConfigurationErrorMapsToProviderUnavailable() {
    val failure = mapGetCredentialException(
      GetCredentialProviderConfigurationException("missing provider dependency")
    )

    val coded = failure as SignInFailure.Coded
    assertEquals(ErrorCodes.PROVIDER_UNAVAILABLE, coded.code)
    assertTrue(coded.message.contains("missing provider dependency"))
  }

  @Test
  fun unsupportedProviderMapsToProviderUnavailable() {
    val failure = mapGetCredentialException(
      GetCredentialUnsupportedException("Credential Manager is disabled")
    )

    val coded = failure as SignInFailure.Coded
    assertEquals(ErrorCodes.PROVIDER_UNAVAILABLE, coded.code)
    assertTrue(coded.message.contains("Credential Manager is disabled"))
  }

  @Test
  fun anythingElseMapsToSignInFailed() {
    val failure = mapGetCredentialException(GetCredentialUnknownException("boom"))

    val coded = failure as SignInFailure.Coded
    assertEquals(ErrorCodes.SIGN_IN_FAILED, coded.code)
    assertTrue(coded.message.contains("boom"))
  }

  @Test
  fun fallsBackToTheExceptionTypeWhenThereIsNoMessage() {
    val failure = mapGetCredentialException(GetCredentialUnknownException())

    val coded = failure as SignInFailure.Coded
    assertEquals(ErrorCodes.SIGN_IN_FAILED, coded.code)
    assertTrue(coded.message.contains("android.credentials.GetCredentialException.TYPE_UNKNOWN"))
  }

  @Test
  fun messageIsPrefixedWithTheExceptionClassNameForDebugging() {
    val failure = mapGetCredentialException(NoCredentialException("no account"))

    val coded = failure as SignInFailure.Coded
    assertTrue(coded.message.startsWith("NoCredentialException:"))
  }
}
