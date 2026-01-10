import { router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import * as flashcardsDb from "./flashcards";
import { storagePut } from "./storage";

export const flashcardRouter = router({
  /**
   * Get flashcards due for review
   */
  getDueCards: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.user) throw new Error("Not authenticated");
    return flashcardsDb.getFlashcardsDueForReview(ctx.user.id);
  }),

  /**
   * Get all flashcards for current user
   */
  getAllCards: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.user) throw new Error("Not authenticated");
    return flashcardsDb.getUserFlashcards(ctx.user.id);
  }),

  /**
   * Create a new flashcard
   */
  create: protectedProcedure
    .input(
      z.object({
        front: z.string().min(1),
        back: z.string().min(1),
        phraseId: z.number().optional(),
        audioUrl: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new Error("Not authenticated");
      const id = await flashcardsDb.createFlashcard(
        ctx.user.id,
        input.front,
        input.back,
        input.phraseId,
        input.audioUrl
      );
      return { id };
    }),

  /**
   * Record a study session for a flashcard
   */
  recordSession: protectedProcedure
    .input(
      z.object({
        flashcardId: z.number(),
        quality: z.number().min(0).max(5),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new Error("Not authenticated");
      await flashcardsDb.recordFlashcardSession(
        ctx.user.id,
        input.flashcardId,
        input.quality
      );
      return { success: true };
    }),

  /**
   * Delete a flashcard
   */
  delete: protectedProcedure
    .input(z.object({ flashcardId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new Error("Not authenticated");
      await flashcardsDb.deleteFlashcard(ctx.user.id, input.flashcardId);
      return { success: true };
    }),

  /**
   * Get flashcard study statistics
   */
  getStats: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.user) throw new Error("Not authenticated");
    return flashcardsDb.getFlashcardStats(ctx.user.id);
  }),
});

export const contributorRouter = router({
  /**
   * Get contributor recordings
   */
  getRecordings: protectedProcedure
    .input(
      z.object({
        type: z.enum(["phrase", "conversation", "lesson"]).optional(),
        difficulty: z.enum(["beginner", "intermediate", "advanced"]).optional(),
      })
    )
    .query(async ({ input }) => {
      return flashcardsDb.getContributorRecordings(undefined, input.type, input.difficulty);
    }),

  /**
   * Upload contributor recording
   */
  uploadRecording: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1),
        description: z.string().optional(),
        type: z.enum(["phrase", "conversation", "lesson"]),
        difficulty: z.enum(["beginner", "intermediate", "advanced"]),
        phraseId: z.number().optional(),
        audioData: z.string(), // Base64 encoded audio
        audioName: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new Error("Not authenticated");

      try {
        // Decode base64 audio
        const audioBuffer = Buffer.from(input.audioData, "base64");

        // Upload to S3
        const fileKey = `contributor-recordings/${ctx.user.id}/${Date.now()}-${input.audioName}`;
        const { url } = await storagePut(fileKey, audioBuffer, "audio/mpeg");

        // Create recording in database
        const id = await flashcardsDb.createContributorRecording(
          ctx.user.id,
          input.title,
          url,
          fileKey,
          input.type,
          input.difficulty,
          input.description,
          input.phraseId
        );

        return { id, url };
      } catch (error) {
        console.error("Failed to upload contributor recording:", error);
        throw new Error("Failed to upload recording");
      }
    }),
});
