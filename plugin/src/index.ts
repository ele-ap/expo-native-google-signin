import { createRunOncePlugin, type ConfigPlugin } from "expo/config-plugins";

const pkg = require("../../package.json");

export type ExpoNativeGoogleSignInPluginProps = {
  /**
   * The iOS URL scheme Google issues for the OAuth client, e.g.
   * `com.googleusercontent.apps.<ios-client-id>`. Required for the Google sign-in sheet to hand
   * control back to the app on iOS.
   *
   * TODO(L5): validate the `com.googleusercontent.apps.` prefix and append it to
   * `CFBundleURLTypes` via `IOSConfig.Scheme.appendScheme` (currently a pass-through).
   */
  iosUrlScheme?: string;
};

const withExpoNativeGoogleSignIn: ConfigPlugin<
  ExpoNativeGoogleSignInPluginProps | void
> = (config) => {
  return config;
};

export default createRunOncePlugin(
  withExpoNativeGoogleSignIn,
  pkg.name,
  pkg.version,
);
