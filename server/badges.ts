import { eq, and } from "drizzle-orm";
import { getDb } from "./db";
import { badges, userBadges, users, learningStreaks, categoryPerformance } from "../drizzle/schema";

/**
 * Get all available badges
 */
export async function getAllBadges() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(badges);
}

/**
 * Get user's earned badges
 */
export async function getUserBadges(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return db
    .select({
      badge: badges,
      unlockedAt: userBadges.unlockedAt,
    })
    .from(userBadges)
    .innerJoin(badges, eq(userBadges.badgeId, badges.id))
    .where(eq(userBadges.userId, userId));
}

/**
 * Check and award badges based on user progress
 */
export async function checkAndAwardBadges(userId: number) {
  const db = await getDb();
  if (!db) return [];

  const awardedBadges = [];

  // Get user's learning streak
  const streakData = await db
    .select()
    .from(learningStreaks)
    .where(eq(learningStreaks.userId, userId));

  if (streakData.length > 0) {
    const streak = streakData[0];

    // Check for streak badges
    const streakBadges = await db
      .select()
      .from(badges)
      .where(eq(badges.badgeType, "streak"));

    for (const badge of streakBadges) {
      // Simple condition parsing - in production, use a more robust system
      if (
        badge.condition &&
        streak.currentStreak >= parseInt(badge.condition)
      ) {
        // Check if user already has this badge
        const existing = await db
          .select()
          .from(userBadges)
          .where(
            and(
              eq(userBadges.userId, userId),
              eq(userBadges.badgeId, badge.id)
            )
          );

        if (existing.length === 0) {
          await db.insert(userBadges).values({
            userId,
            badgeId: badge.id,
          });
          awardedBadges.push(badge);
        }
      }
    }
  }

  // Check for milestone badges (total phrases practiced)
  const categoryPerf = await db
    .select()
    .from(categoryPerformance)
    .where(eq(categoryPerformance.userId, userId));

  const totalPractices = categoryPerf.reduce(
    (sum, cp) => sum + cp.totalPractices,
    0
  );

  const milestoneBadges = await db
    .select()
    .from(badges)
    .where(eq(badges.badgeType, "milestone"));

  for (const badge of milestoneBadges) {
    if (
      badge.condition &&
      totalPractices >= parseInt(badge.condition)
    ) {
      const existing = await db
        .select()
        .from(userBadges)
        .where(
          and(
            eq(userBadges.userId, userId),
            eq(userBadges.badgeId, badge.id)
          )
        );

      if (existing.length === 0) {
        await db.insert(userBadges).values({
          userId,
          badgeId: badge.id,
        });
        awardedBadges.push(badge);
      }
    }
  }

  return awardedBadges;
}

/**
 * Create a new badge (admin only)
 */
export async function createBadge(badgeData: {
  name: string;
  description?: string;
  icon?: string;
  badgeType: "streak" | "milestone" | "category" | "achievement";
  condition?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(badges).values(badgeData);
  return result;
}
