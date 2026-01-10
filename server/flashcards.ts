import { eq, and, gte, lte, desc } from "drizzle-orm";
import { getDb } from "./db";
import { flashcards, flashcardSessions, contributorRecordings } from "../drizzle/schema";
import type { InsertFlashcard, InsertFlashcardSession, InsertContributorRecording } from "../drizzle/schema";

/**
 * Spaced repetition algorithm (SM-2)
 * Calculates next review interval based on quality of recall (0-5)
 */
function calculateNextReview(
  quality: number,
  interval: number,
  easeFactor: number
): { newInterval: number; newEaseFactor: number; nextReviewAt: Date } {
  let newEaseFactor = easeFactor + (20 * quality - 50);
  newEaseFactor = Math.max(1300, newEaseFactor); // Minimum ease factor

  let newInterval = interval;
  if (quality < 3) {
    newInterval = 1; // Restart if forgotten
  } else if (interval === 1) {
    newInterval = 3;
  } else {
    newInterval = Math.round(interval * (newEaseFactor / 2500));
  }

  const nextReviewAt = new Date();
  nextReviewAt.setDate(nextReviewAt.getDate() + newInterval);

  return { newInterval, newEaseFactor, nextReviewAt };
}

/**
 * Create a new flashcard for a user
 */
export async function createFlashcard(
  userId: number,
  front: string,
  back: string,
  phraseId?: number,
  audioUrl?: string
): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(flashcards).values({
    userId,
    phraseId,
    front,
    back,
    audioUrl,
  });

  return Number((result as any).insertId);
}

/**
 * Get flashcards due for review
 */
export async function getFlashcardsDueForReview(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const now = new Date();
  const result = await db
    .select()
    .from(flashcards)
    .where(
      and(
        eq(flashcards.userId, userId),
        lte(flashcards.nextReviewAt, now)
      )
    )
    .orderBy(desc(flashcards.nextReviewAt))
    .limit(20);

  return result;
}

/**
 * Get all flashcards for a user
 */
export async function getUserFlashcards(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db
    .select()
    .from(flashcards)
    .where(eq(flashcards.userId, userId))
    .orderBy(desc(flashcards.createdAt));

  return result;
}

/**
 * Record a flashcard study session and update spaced repetition
 */
export async function recordFlashcardSession(
  userId: number,
  flashcardId: number,
  quality: number // 0-5 scale
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Get current flashcard
  const cards = await db
    .select()
    .from(flashcards)
    .where(
      and(
        eq(flashcards.id, flashcardId),
        eq(flashcards.userId, userId)
      )
    )
    .limit(1);

  if (cards.length === 0) throw new Error("Flashcard not found");

  const card = cards[0];

  // Record session
  await db.insert(flashcardSessions).values({
    userId,
    flashcardId,
    quality,
  });

  // Calculate next review
  const { newInterval, newEaseFactor, nextReviewAt } = calculateNextReview(
    quality,
    card.interval,
    card.easeFactor
  );

  // Update flashcard
  await db
    .update(flashcards)
    .set({
      interval: newInterval,
      easeFactor: newEaseFactor,
      nextReviewAt,
      repetitions: card.repetitions + 1,
    })
    .where(eq(flashcards.id, flashcardId));
}

/**
 * Delete a flashcard
 */
export async function deleteFlashcard(userId: number, flashcardId: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .delete(flashcards)
    .where(
      and(
        eq(flashcards.id, flashcardId),
        eq(flashcards.userId, userId)
      )
    );
}

/**
 * Get contributor recordings
 */
export async function getContributorRecordings(
  contributorId?: number,
  type?: string,
  difficulty?: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const conditions = [];

  if (contributorId) {
    conditions.push(eq(contributorRecordings.contributorId, contributorId));
  }
  if (type) {
    conditions.push(eq(contributorRecordings.type, type as any));
  }
  if (difficulty) {
    conditions.push(eq(contributorRecordings.difficulty, difficulty as any));
  }

  const query = db
    .select()
    .from(contributorRecordings)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(contributorRecordings.createdAt));

  return query;
}

/**
 * Create contributor recording
 */
export async function createContributorRecording(
  contributorId: number,
  title: string,
  audioUrl: string,
  audioKey: string,
  type: "phrase" | "conversation" | "lesson",
  difficulty: "beginner" | "intermediate" | "advanced",
  description?: string,
  phraseId?: number
): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(contributorRecordings).values({
    contributorId,
    phraseId,
    title,
    description,
    audioUrl,
    audioKey,
    type,
    difficulty,
  });

  return Number((result as any).insertId);
}

/**
 * Get flashcard study statistics for a user
 */
export async function getFlashcardStats(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const totalCards = await db
    .select()
    .from(flashcards)
    .where(eq(flashcards.userId, userId));

  const dueCards = await db
    .select()
    .from(flashcards)
    .where(
      and(
        eq(flashcards.userId, userId),
        lte(flashcards.nextReviewAt, new Date())
      )
    );

  const sessions = await db
    .select()
    .from(flashcardSessions)
    .where(eq(flashcardSessions.userId, userId));

  return {
    totalCards: totalCards.length,
    dueCards: dueCards.length,
    totalSessions: sessions.length,
    averageQuality: sessions.length > 0
      ? Math.round((sessions.reduce((sum, s) => sum + s.quality, 0) / sessions.length) * 100) / 100
      : 0,
  };
}
