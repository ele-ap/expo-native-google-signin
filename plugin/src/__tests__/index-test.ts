import type { IOSConfig } from "expo/config-plugins";

import { setIosUrlScheme } from "../index";

const VALID_SCHEME = "com.googleusercontent.apps.123-abc";

describe("setIosUrlScheme", () => {
  it("adds the scheme to an empty Info.plist", () => {
    const result = setIosUrlScheme({}, VALID_SCHEME);
    expect(result.CFBundleURLTypes).toEqual([
      { CFBundleURLSchemes: [VALID_SCHEME] },
    ]);
  });

  it("adds the scheme exactly once when applied twice", () => {
    const once = setIosUrlScheme({}, VALID_SCHEME);
    const twice = setIosUrlScheme(once, VALID_SCHEME);
    expect(twice.CFBundleURLTypes).toEqual([
      { CFBundleURLSchemes: [VALID_SCHEME] },
    ]);
  });

  it("adds the scheme exactly once when it's already present", () => {
    const infoPlist: IOSConfig.InfoPlist = {
      CFBundleURLTypes: [{ CFBundleURLSchemes: [VALID_SCHEME] }],
    };
    const result = setIosUrlScheme(infoPlist, VALID_SCHEME);
    expect(result.CFBundleURLTypes).toEqual([
      { CFBundleURLSchemes: [VALID_SCHEME] },
    ]);
  });

  it("keeps existing URL types and schemes", () => {
    const infoPlist: IOSConfig.InfoPlist = {
      CFBundleURLTypes: [
        { CFBundleURLSchemes: ["myapp", "other-existing-scheme"] },
      ],
    };
    const result = setIosUrlScheme(infoPlist, VALID_SCHEME);
    expect(result.CFBundleURLTypes).toEqual([
      { CFBundleURLSchemes: ["myapp", "other-existing-scheme"] },
      { CFBundleURLSchemes: [VALID_SCHEME] },
    ]);
  });

  it("leaves the Info.plist unchanged when iosUrlScheme is omitted", () => {
    const infoPlist: IOSConfig.InfoPlist = {
      CFBundleDevelopmentRegion: "en",
    };
    const result = setIosUrlScheme(infoPlist, undefined);
    expect(result).toBe(infoPlist);
    expect(result.CFBundleURLTypes).toBeUndefined();
  });

  it("rejects an empty string with a helpful message", () => {
    expect(() => setIosUrlScheme({}, "")).toThrow(/non-empty string/);
  });

  it("rejects a blank string with a helpful message", () => {
    expect(() => setIosUrlScheme({}, "   ")).toThrow(/non-empty string/);
  });

  it("rejects the wrong prefix with a helpful message pointing at the GCP console", () => {
    expect(() => setIosUrlScheme({}, "com.example.myapp")).toThrow(
      /com\.googleusercontent\.apps\./,
    );
  });
});
