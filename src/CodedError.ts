import type { ErrorCode } from "./types";

/**
 * A minimal stand-in for `expo-modules-core`'s `CodedError` -- same shape (an `Error` subclass
 * with a `code` string) -- shared by `index.ts` and `index.web.ts` so `isErrorWithCode` treats
 * JS-thrown errors (from either platform) and native-thrown errors identically.
 *
 * Deliberately not a dependency on `expo-modules-core` itself: this package only declares a peer
 * dependency on `expo`, which doesn't re-export `CodedError`, and depending on
 * `expo-modules-core` directly would break for consumers whose package manager doesn't hoist it
 * (pnpm, Yarn PnP). Not exported from the package's public surface (`src/index.ts`) -- it's an
 * internal implementation detail, not part of the public API.
 */
export class CodedError extends Error {
  code: ErrorCode;

  constructor(code: ErrorCode, message: string) {
    super(message);
    this.name = "CodedError";
    this.code = code;
  }
}
