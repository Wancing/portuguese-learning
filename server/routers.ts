import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { storagePut } from "./storage";
import { transcribeAudio } from "./_core/voiceTranscription";
import { invokeLLM } from "./_core/llm";
import { nanoid } from "nanoid";
import { flashcardRouter, contributorRouter } from "./flashcard-router";
import { badgesRouter, conversationRouter } from "./badges-router";

export const appRouter = router({
  system: systemRouter,
  flashcards: flashcardRouter,
  contributors: contributorRouter,
  badges: badgesRouter,
  conversations: conversationRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    login: publicProcedure
      .input(z.object({
        email: z.string().email(),
        password: z.string().min(1),
      }))
      .mutation(async ({ input, ctx }) => {
        const { loginUser } = await import('./auth');
        const user = await loginUser(input.email, input.password);
        
        // Create session
        const { createSessionToken } = await import('./auth');
        const sessionToken = await createSessionToken(user.id);
        
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: 30 * 24 * 60 * 60 * 1000 });
        
        return { success: true };
      }),
    register: publicProcedure
      .input(z.object({
        firstName: z.string().min(1),
        lastName: z.string().min(1),
        email: z.string().email(),
        password: z.string().min(6),
      }))
      .mutation(async ({ input, ctx }) => {
        const { registerUser, createSessionToken } = await import('./auth');
        const user = await registerUser(input.firstName, input.lastName, input.email, input.password);
        
        // Create session
        const sessionToken = await createSessionToken(user.id);
        
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: 30 * 24 * 60 * 60 * 1000 });
        
        return { success: true };
      }),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  categories: router({
    list: publicProcedure.query(async () => {
      return db.getAllCategories();
    }),
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return db.getCategoryById(input.id);
      }),
  }),

  phrases: router({
    list: publicProcedure.query(async () => {
      return db.getAllPhrases();
    }),
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return db.getPhraseById(input.id);
      }),
    getByCategory: publicProcedure
      .input(z.object({ categoryId: z.number() }))
      .query(async ({ input }) => {
        return db.getPhrasesByCategory(input.categoryId);
      }),
    search: publicProcedure
      .input(z.object({ searchTerm: z.string() }))
      .query(async ({ input }) => {
        return db.searchPhrases(input.searchTerm);
      }),
    updateAudio: protectedProcedure
      .input(z.object({
        phraseId: z.number(),
        audioData: z.string(), // base64 encoded audio
        mimeType: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Only admins can update phrase audio
        if (ctx.user.role !== 'admin') {
          throw new Error('Unauthorized: Admin access required');
        }

        // Convert base64 to buffer
        const audioBuffer = Buffer.from(input.audioData, 'base64');
        
        // Upload to S3
        const fileExtension = input.mimeType.split('/')[1] || 'mp3';
        const fileKey = `native-audio/${input.phraseId}-${nanoid()}.${fileExtension}`;
        const { url } = await storagePut(fileKey, audioBuffer, input.mimeType);

        // Update phrase audio URL
        await db.updatePhraseAudio(input.phraseId, url, fileKey);

        return { url };
      }),
  }),

  recordings: router({
    upload: protectedProcedure
      .input(z.object({
        phraseId: z.number(),
        audioData: z.string(), // base64 encoded audio
        mimeType: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Convert base64 to buffer
        const audioBuffer = Buffer.from(input.audioData, 'base64');
        
        // Upload to S3
        const fileKey = `recordings/${ctx.user.id}/${input.phraseId}-${nanoid()}.webm`;
        const { url } = await storagePut(fileKey, audioBuffer, input.mimeType);

        // Create recording record
        const result = await db.createUserRecording({
          userId: ctx.user.id,
          phraseId: input.phraseId,
          audioUrl: url,
          audioKey: fileKey,
        });

        // Get the inserted ID from the result
        const insertId = (result as any).insertId || 0;

        return {
          id: Number(insertId),
          url,
        };
      }),
    
    transcribe: protectedProcedure
      .input(z.object({
        recordingId: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        const recording = await db.getUserRecordingById(input.recordingId);
        if (!recording) {
          throw new Error("Recording not found");
        }
        if (recording.userId !== ctx.user.id) {
          throw new Error("Unauthorized");
        }

        // Get the phrase for comparison
        const phrase = await db.getPhraseById(recording.phraseId);
        if (!phrase) {
          throw new Error("Phrase not found");
        }

        // Transcribe the audio
        const transcriptionResult = await transcribeAudio({
          audioUrl: recording.audioUrl,
          language: "pt",
          prompt: "Transcribe European Portuguese speech",
        });

        // Check if transcription failed
        if ('error' in transcriptionResult) {
          throw new Error(`Transcription failed: ${transcriptionResult.error}`);
        }

        // Generate AI feedback
        const feedbackResponse = await invokeLLM({
          messages: [
            {
              role: "system",
              content: "You are a European Portuguese pronunciation tutor. Compare the user's transcribed speech with the correct phrase and provide helpful, encouraging feedback on pronunciation mistakes and tips for improvement. Be specific about which sounds or words need work.",
            },
            {
              role: "user",
              content: `Correct phrase: "${phrase.textPt}"\nUser's transcription: "${transcriptionResult.text}"\n\nProvide feedback on pronunciation accuracy and tips for improvement.`,
            },
          ],
        });

        const messageContent = feedbackResponse.choices[0]?.message?.content;
        const feedback = typeof messageContent === 'string' ? messageContent : "Unable to generate feedback at this time.";

        // Update recording with transcription and feedback
        await db.updateRecordingTranscription(input.recordingId, transcriptionResult.text, feedback);

        return {
          transcription: transcriptionResult.text,
          feedback,
        };
      }),

    getByPhrase: protectedProcedure
      .input(z.object({ phraseId: z.number() }))
      .query(async ({ ctx, input }) => {
        return db.getUserRecordingsByPhrase(ctx.user.id, input.phraseId);
      }),
  }),
});

export type AppRouter = typeof appRouter;
