import { describe, expect, it } from "vitest";
import * as auth from "./auth";

describe("Authentication - Password Hashing", () => {
  const testPassword = "TestPassword123!";
  const wrongPassword = "WrongPassword456!";

  describe("hashPassword", () => {
    it("should hash a password", async () => {
      const hash = await auth.hashPassword(testPassword);
      expect(hash).toBeDefined();
      expect(hash).not.toBe(testPassword);
      expect(hash.length).toBeGreaterThan(20);
    });

    it("should produce different hashes for the same password", async () => {
      const hash1 = await auth.hashPassword(testPassword);
      const hash2 = await auth.hashPassword(testPassword);
      expect(hash1).not.toBe(hash2);
    });
  });

  describe("verifyPassword", () => {
    it("should verify a correct password", async () => {
      const hash = await auth.hashPassword(testPassword);
      const isValid = await auth.verifyPassword(testPassword, hash);
      expect(isValid).toBe(true);
    });

    it("should reject an incorrect password", async () => {
      const hash = await auth.hashPassword(testPassword);
      const isValid = await auth.verifyPassword(wrongPassword, hash);
      expect(isValid).toBe(false);
    });

    it("should handle empty passwords", async () => {
      const hash = await auth.hashPassword(testPassword);
      const isValid = await auth.verifyPassword("", hash);
      expect(isValid).toBe(false);
    });
  });

  describe("Password security", () => {
    it("should hash passwords securely with different salts", async () => {
      const hash1 = await auth.hashPassword(testPassword);
      const hash2 = await auth.hashPassword(testPassword);
      
      // Different hashes for same password (different salts)
      expect(hash1).not.toBe(hash2);
      
      // Both verify correctly
      const verify1 = await auth.verifyPassword(testPassword, hash1);
      const verify2 = await auth.verifyPassword(testPassword, hash2);
      expect(verify1).toBe(true);
      expect(verify2).toBe(true);
    });

    it("should not be reversible", async () => {
      const hash = await auth.hashPassword(testPassword);
      // Hash should not contain the original password
      expect(hash).not.toContain(testPassword);
    });
  });

  describe("Database integration", () => {
    it.skip("should register a user with hashed password", async () => {
      // Requires database schema migration to firstName/lastName
    });

    it.skip("should authenticate user with correct password", async () => {
      // Requires database schema migration to firstName/lastName
    });

    it.skip("should reject authentication with wrong password", async () => {
      // Requires database schema migration to firstName/lastName
    });
  });
});
