import { isErrorWithCode, signIn, signOut } from "../index.web";

describe("index.web", () => {
  it("rejects signIn with a CONFIGURATION_ERROR", async () => {
    await expect(
      signIn({ webClientId: "test-client-id" }),
    ).rejects.toMatchObject({
      code: "CONFIGURATION_ERROR",
    });
  });

  it("rejects signOut with a CONFIGURATION_ERROR", async () => {
    await expect(signOut()).rejects.toMatchObject({
      code: "CONFIGURATION_ERROR",
    });
  });

  it("is recognised by isErrorWithCode", async () => {
    expect.assertions(1);
    try {
      await signIn({ webClientId: "test-client-id" });
    } catch (error) {
      expect(isErrorWithCode(error)).toBe(true);
    }
  });
});
