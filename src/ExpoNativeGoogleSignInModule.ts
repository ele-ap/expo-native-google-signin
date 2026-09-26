import { NativeModule, requireNativeModule } from "expo";

import type { SignInOptions, SignInResult } from "./types";

declare class ExpoNativeGoogleSignInModule extends NativeModule<
  Record<string, never>
> {
  signIn(options: SignInOptions): Promise<SignInResult>;
  signOut(): Promise<void>;
}

// On native platforms this resolves to the Kotlin/Swift module registered under this name; on
// web, `index.web.ts` is resolved instead and this file is never imported.
export default requireNativeModule<ExpoNativeGoogleSignInModule>(
  "ExpoNativeGoogleSignIn",
);
