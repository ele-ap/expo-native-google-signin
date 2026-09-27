import { isErrorWithCode, signIn, signOut } from "../index";

// `../index` (this file) is only actually loaded by the "iOS" and "Android" Jest projects: the
// "Web" and "Node" projects resolve the extensionless `../index` specifier to `../index.web.ts`
// instead (see `index.web-test.ts` for its dedicated coverage), because Jest's
// `moduleFileExtensions` for those projects lists `web.ts` before `ts`. `process.env.EXPO_OS` is
// inlined to a literal string by `babel-preset-expo` per Jest project ("ios", "android", or "web"
// for both the "Web" and "Node" projects) -- checking it here (rather than importing `Platform`
// from `react-native`, which fails to resolve under the "Web"/"Node" projects without
// `react-native-web` installed) lets this file guard the native-wrapper-only assertions below
// without breaking any of the four projects `expo-module-scripts` runs `src` tests under.
const isNativeProject = process.env.EXPO_OS !== "web";

const mockNativeSignIn = jest.fn();
const mockNativeSignOut = jest.fn();

// Applies on the "iOS"/"Android" projects (where `../index` really is this file, and imports
// `../ExpoNativeGoogleSignInModule`); inert -- but harmless -- on "Web"/"Node", where the mocked
// module is never imported by `../index.web`.
jest.mock("../ExpoNativeGoogleSignInModule", () => ({
  __esModule: true,
  default: {
    signIn: (...args: unknown[]) => mockNativeSignIn(...args),
    signOut: (...args: unknown[]) => mockNativeSignOut(...args),
  },
}));

beforeEach(() => {
  mockNativeSignIn.mockReset();
  mockNativeSignOut.mockReset();
});

// A CONFIGURATION_ERROR for an empty `webClientId` is expected on every platform: the real
// wrapper validates it before calling native, and the web stub always rejects with this code too.
describe("signIn", () => {
  it("rejects an empty webClientId with CONFIGURATION_ERROR, without calling native", async () => {
    await expect(signIn({ webClientId: "   " })).rejects.toMatchObject({
      code: "CONFIGURATION_ERROR",
    });
    expect(mockNativeSignIn).not.toHaveBeenCalled();
  });

  it("is recognised by isErrorWithCode", async () => {
    expect.assertions(1);
    try {
      await signIn({ webClientId: "" });
    } catch (error) {
      expect(isErrorWithCode(error)).toBe(true);
    }
  });
});

if (isNativeProject) {
  describe("signIn (native wrapper)", () => {
    it("rejects a non-string nonce with CONFIGURATION_ERROR, without calling native", async () => {
      await expect(
        signIn({
          webClientId: "web-client-id",
          iosClientId: "ios-client-id",
          nonce: 12345 as unknown as string,
        }),
      ).rejects.toMatchObject({ code: "CONFIGURATION_ERROR" });
      expect(mockNativeSignIn).not.toHaveBeenCalled();
    });

    it("passes valid options through and returns a successful native result unchanged", async () => {
      const nativeResult = {
        type: "success" as const,
        idToken: "id-token",
        user: { email: "user@example.com" },
      };
      mockNativeSignIn.mockResolvedValueOnce(nativeResult);

      const options = {
        webClientId: "web-client-id",
        iosClientId: "ios-client-id",
      };
      await expect(signIn(options)).resolves.toEqual(nativeResult);
      expect(mockNativeSignIn).toHaveBeenCalledWith(options);
    });

    it("passes valid options through and returns a cancelled native result unchanged", async () => {
      mockNativeSignIn.mockResolvedValueOnce({ type: "cancelled" });

      await expect(
        signIn({ webClientId: "web-client-id", iosClientId: "ios-client-id" }),
      ).resolves.toEqual({ type: "cancelled" });
    });

    if (process.env.EXPO_OS === "ios") {
      it("rejects a missing iosClientId on iOS with CONFIGURATION_ERROR", async () => {
        await expect(
          signIn({ webClientId: "web-client-id" }),
        ).rejects.toMatchObject({ code: "CONFIGURATION_ERROR" });
        expect(mockNativeSignIn).not.toHaveBeenCalled();
      });
    }

    if (process.env.EXPO_OS === "android") {
      it("does not require an iosClientId on Android", async () => {
        mockNativeSignIn.mockResolvedValueOnce({ type: "cancelled" });
        await expect(signIn({ webClientId: "web-client-id" })).resolves.toEqual(
          { type: "cancelled" },
        );
      });
    }
  });

  describe("signOut (native wrapper)", () => {
    it("passes through to native", async () => {
      mockNativeSignOut.mockResolvedValueOnce(undefined);
      await signOut();
      expect(mockNativeSignOut).toHaveBeenCalledTimes(1);
    });
  });

  // Uses `jest.resetModules` + `jest.doMock` (rather than the top-level `jest.mock` used by the
  // rest of this file) to re-require `../index` with the native module resolved to `null`, the
  // same way `ExpoNativeGoogleSignInModule.ts` resolves it in Expo Go. Runs last and reaches into
  // the module registry directly so it doesn't disturb the `signIn`/`signOut` bindings the tests
  // above already captured from the top-level import.
  describe("when the native module is missing (Expo Go)", () => {
    afterEach(() => {
      jest.dontMock("../ExpoNativeGoogleSignInModule");
      jest.resetModules();
    });

    it("rejects signIn and signOut with a CONFIGURATION_ERROR pointing at the README", async () => {
      jest.resetModules();
      jest.doMock("../ExpoNativeGoogleSignInModule", () => ({
        __esModule: true,
        default: null,
      }));

      const {
        signIn: signInWithoutNativeModule,
        signOut: signOutWithoutNativeModule,
      } = require("../index") as typeof import("../index");

      await expect(
        signInWithoutNativeModule({
          webClientId: "web-client-id",
          iosClientId: "ios-client-id",
        }),
      ).rejects.toMatchObject({
        code: "CONFIGURATION_ERROR",
        message: expect.stringContaining("development build"),
      });

      await expect(signOutWithoutNativeModule()).rejects.toMatchObject({
        code: "CONFIGURATION_ERROR",
        message: expect.stringContaining("development build"),
      });
    });
  });
}
