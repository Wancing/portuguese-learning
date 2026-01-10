import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import { TRPCError } from "@trpc/server";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAdminContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "admin-user",
    email: "admin@example.com",
    name: "Admin User",
    loginMethod: "manus",
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };

  return ctx;
}

function createNonAdminContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 2,
    openId: "regular-user",
    email: "user@example.com",
    name: "Regular User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };

  return ctx;
}

describe("phrases.updateAudio", () => {
  it("rejects non-admin users", async () => {
    const ctx = createNonAdminContext();
    const caller = appRouter.createCaller(ctx);

    // Create a small base64 audio sample (empty MP3 header)
    const base64Audio = "SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA";

    await expect(
      caller.phrases.updateAudio({
        phraseId: 1,
        audioData: base64Audio,
        mimeType: "audio/mp3",
      })
    ).rejects.toThrow("Unauthorized: Admin access required");
  });

  it("allows admin users to update phrase audio", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    // Create a small base64 audio sample
    const base64Audio = "SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA";

    const result = await caller.phrases.updateAudio({
      phraseId: 1,
      audioData: base64Audio,
      mimeType: "audio/mp3",
    });

    expect(result).toBeDefined();
    expect(result.url).toBeDefined();
    expect(typeof result.url).toBe("string");
    expect(result.url).toMatch(/^https?:\/\//);
  });
});
