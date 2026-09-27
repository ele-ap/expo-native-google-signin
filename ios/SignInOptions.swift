import ExpoModulesCore

/// Options for `signIn`. Field names and types must match `SignInOptions` in `src/types.ts`
/// exactly, since `src/index.ts` passes the JS object straight through. Mirrors Android's
/// `SignInOptions.kt`.
struct SignInOptions: Record {
  @Field
  var webClientId: String = ""
  @Field
  var iosClientId: String?
  @Field
  var nonce: String?
}
