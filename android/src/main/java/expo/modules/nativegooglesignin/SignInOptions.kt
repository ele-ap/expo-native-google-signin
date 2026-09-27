package expo.modules.nativegooglesignin

import expo.modules.kotlin.records.Field
import expo.modules.kotlin.records.Record
import expo.modules.kotlin.types.OptimizedRecord

/**
 * Options for `signIn`. Field names and types must match `SignInOptions` in `src/types.ts`
 * exactly, since `src/index.ts` passes the JS object straight through.
 *
 * `iosClientId` is accepted (so the JS object doesn't need platform-specific stripping) but
 * ignored on Android -- see docs/ARCHITECTURE.md -> "No `androidClientId` option".
 */
@OptimizedRecord
data class SignInOptions(
  @Field
  val webClientId: String = "",
  @Field
  val iosClientId: String? = null,
  @Field
  val nonce: String? = null
) : Record
