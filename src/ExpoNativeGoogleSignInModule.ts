import { NativeModule, requireOptionalNativeModule } from "expo";

import type { SignInOptions, SignInResult } from "./types";

declare class ExpoNativeGoogleSignInModule extends NativeModule<
  Record<string, never>
> {
  signIn(options: SignInOptions): Promise<SignInResult>;
  signOut(): Promise<void>;
}

// On native platforms this resolves to the Kotlin/Swift module registered under this name; on
// web, `index.web.ts` is resolved instead and this file is never imported. `null` when the
// native module isn't installed (e.g. Expo Go) -- `requireOptionalNativeModule` (rather than
// `requireNativeModule`) means importing this package never throws there; `src/index.ts` turns
// the `null` into a clear `CONFIGURATION_ERROR` when `signIn`/`signOut` is actually called.
export default requireOptionalNativeModule<ExpoNativeGoogleSignInModule>(
  "ExpoNativeGoogleSignIn",
);
