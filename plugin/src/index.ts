import {
  createRunOncePlugin,
  IOSConfig,
  WarningAggregator,
  withInfoPlist,
  type ConfigPlugin,
} from "expo/config-plugins";

const pkg = require("../../package.json");

const IOS_URL_SCHEME_PREFIX = "com.googleusercontent.apps.";

export type ExpoNativeGoogleSignInPluginProps = {
  /**
   * The iOS URL scheme Google issues for the OAuth client, e.g.
   * `com.googleusercontent.apps.<ios-client-id>`. It's the iOS OAuth client ID reversed, shown as
   * the "URL scheme" on the iOS OAuth client in the Google Cloud Console. Required for the Google
   * sign-in sheet to hand control back to the app on iOS -- without it, the plugin only logs a
   * warning (see the README).
   */
  iosUrlScheme?: string;
};

/**
 * Validates `iosUrlScheme` and appends it to `Info.plist`'s `CFBundleURLTypes` -- exactly once,
 * preserving any existing schemes -- or leaves `infoPlist` unchanged when `iosUrlScheme` is
 * `undefined`. Pure (no `expo/config-plugins` mod pipeline) so it can be unit-tested directly.
 */
export function setIosUrlScheme(
  infoPlist: IOSConfig.InfoPlist,
  iosUrlScheme: string | undefined,
): IOSConfig.InfoPlist {
  if (iosUrlScheme === undefined) {
    return infoPlist;
  }

  if (typeof iosUrlScheme !== "string" || iosUrlScheme.trim().length === 0) {
    throw new Error(
      "expo-native-google-signin: `iosUrlScheme` must be a non-empty string when provided " +
        `(got ${JSON.stringify(iosUrlScheme)}). It's the iOS OAuth client ID reversed, shown as ` +
        'the "URL scheme" on the iOS OAuth client in the Google Cloud Console -- see the README.',
    );
  }

  if (!iosUrlScheme.startsWith(IOS_URL_SCHEME_PREFIX)) {
    throw new Error(
      `expo-native-google-signin: \`iosUrlScheme\` must start with "${IOS_URL_SCHEME_PREFIX}" ` +
        `(got ${JSON.stringify(iosUrlScheme)}). It's the iOS OAuth client ID reversed, shown as ` +
        'the "URL scheme" on the iOS OAuth client in the Google Cloud Console -- see the README.',
    );
  }

  // `appendScheme` is already idempotent (it checks `hasScheme` internally), so applying this
  // twice, or to an `Info.plist` that already has the scheme, adds it exactly once.
  return IOSConfig.Scheme.appendScheme(iosUrlScheme, infoPlist);
}

const withExpoNativeGoogleSignIn: ConfigPlugin<
  ExpoNativeGoogleSignInPluginProps | void
> = (config, props) => {
  const iosUrlScheme = props?.iosUrlScheme;

  if (iosUrlScheme === undefined) {
    WarningAggregator.addWarningIOS(
      "iosUrlScheme",
      "expo-native-google-signin: no `iosUrlScheme` configured -- without it, the Google " +
        "sign-in sheet can't hand control back to the app on iOS. See the README.",
    );
    return config;
  }

  return withInfoPlist(config, (config) => {
    config.modResults = setIosUrlScheme(config.modResults, iosUrlScheme);
    return config;
  });
};

export default createRunOncePlugin(
  withExpoNativeGoogleSignIn,
  pkg.name,
  pkg.version,
);
