import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import {
  getAllBadges,
  getUserBadges,
  checkAndAwardBadges,
  createBadge,
} from "./badges";
import {
  createConversationSession,
  addConversationTurn,
  completeConversation,
  getUserConversations,
} from "./conversations";
import { adminProcedure } from "./_core/trpc";

export const badgesRouter = router({
  /**
   * Get all available badges
   */
  list: publicProcedure.query(async () => {
    return getAllBadges();
  }),

  /**
   * Get user's earned badges
   */
  getUserBadges: protectedProcedure.query(async ({ ctx }) => {
    return getUserBadges(ctx.user.id);
  }),

  /**
   * Check and award badges to user
   */
  checkAndAward: protectedProcedure.mutation(async ({ ctx }) => {
    return checkAndAwardBadges(ctx.user.id);
  }),

  /**
   * Create a new badge (admin only)
   */
  create: adminProcedure
    .input(
      z.object({
        name: z.string(),
        description: z.string().optional(),
        icon: z.string().optional(),
        badgeType: z.enum(["streak", "milestone", "category", "achievement"]),
        condition: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return createBadge(input);
    }),
});

export const conversationRouter = router({
  /**
   * Start a new conversation session
   */
  start: protectedProcedure
    .input(
      z.object({
        topic: z.string(),
        difficulty: z.enum(["beginner", "intermediate", "advanced"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return createConversationSession(ctx.user.id, input.topic, input.difficulty);
    }),

  /**
   * Add a turn to conversation
   */
  addTurn: protectedProcedure
    .input(
      z.object({
        sessionId: z.number(),
        studentText: z.string(),
        transcription: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return addConversationTurn(
        input.sessionId,
        input.studentText,
        input.transcription
      );
    }),

  /**
   * Complete a conversation
   */
  complete: protectedProcedure
    .input(
      z.object({
        sessionId: z.number(),
        score: z.number().min(0).max(100),
        feedback: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      await completeConversation(input.sessionId, input.score, input.feedback);
      return { success: true };
    }),

  /**
   * Get user's conversation history
   */
  getHistory: protectedProcedure.query(async ({ ctx }) => {
    return getUserConversations(ctx.user.id);
  }),
});
