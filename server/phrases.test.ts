import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createMockContext(): TrpcContext {
  const ctx: TrpcContext = {
    user: undefined,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };

  return ctx;
}

describe("categories.list", () => {
  it("returns all categories", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.categories.list();

    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
    
    // Check structure of first category
    if (result.length > 0) {
      const category = result[0];
      expect(category).toHaveProperty('id');
      expect(category).toHaveProperty('name');
      expect(category).toHaveProperty('nameEn');
      expect(category).toHaveProperty('icon');
    }
  });
});

describe("categories.getById", () => {
  it("returns a specific category by id", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.categories.getById({ id: 1 });

    expect(result).toBeDefined();
    if (result) {
      expect(result.id).toBe(1);
      expect(result.name).toBeDefined();
      expect(result.nameEn).toBeDefined();
    }
  });

  it("returns undefined for non-existent category", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.categories.getById({ id: 99999 });

    expect(result).toBeUndefined();
  });
});

describe("phrases.list", () => {
  it("returns all phrases", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.phrases.list();

    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
    
    // Check structure of first phrase
    if (result.length > 0) {
      const phrase = result[0];
      expect(phrase).toHaveProperty('id');
      expect(phrase).toHaveProperty('textPt');
      expect(phrase).toHaveProperty('textEn');
      expect(phrase).toHaveProperty('audioUrl');
      expect(phrase).toHaveProperty('difficulty');
      expect(phrase).toHaveProperty('categoryId');
    }
  });
});

describe("phrases.getByCategory", () => {
  it("returns phrases for a specific category", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.phrases.getByCategory({ categoryId: 1 });

    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
    
    // All phrases should belong to category 1
    result.forEach(phrase => {
      expect(phrase.categoryId).toBe(1);
    });
  });

  it("returns empty array for category with no phrases", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.phrases.getByCategory({ categoryId: 99999 });

    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(0);
  });
});

describe("phrases.getById", () => {
  it("returns a specific phrase by id", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.phrases.getById({ id: 1 });

    expect(result).toBeDefined();
    if (result) {
      expect(result.id).toBe(1);
      expect(result.textPt).toBeDefined();
      expect(result.textEn).toBeDefined();
      expect(result.audioUrl).toBeDefined();
    }
  });

  it("returns undefined for non-existent phrase", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.phrases.getById({ id: 99999 });

    expect(result).toBeUndefined();
  });
});

describe("phrases.search", () => {
  it("finds phrases matching Portuguese text", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.phrases.search({ searchTerm: "Bom" });

    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
    
    // Check that results contain the search term
    result.forEach(phrase => {
      expect(phrase.textPt.toLowerCase()).toContain("bom".toLowerCase());
    });
  });

  it("returns empty array for non-matching search", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.phrases.search({ searchTerm: "xyzabc123notfound" });

    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(0);
  });
});
