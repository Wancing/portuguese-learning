import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { invokeLLM } from "./_core/llm";

// ─── Zod schema for the structured LLM response ──────────────────────────────

export const GrammarErrorTypeSchema = z.enum([
  "article",
  "tense",
  "word_order",
  "agreement",
  "vocabulary",
  "spelling",
  "preposition",
  "accent",
  "other",
]);

export const GrammarCorrectionSchema = z.object({
  corrected: z.string(),
  explanation: z.string(),
  changes: z.array(
    z.object({
      original: z.string(),
      corrected: z.string(),
      reason: z.string(),
      errorType: GrammarErrorTypeSchema,
    })
  ),
  errorTags: z.array(GrammarErrorTypeSchema),
  practiceSentence: z.string(),
  practiceSentenceEnglish: z.string(),
  isAlreadyCorrect: z.boolean(),
});

export type GrammarCorrection = z.infer<typeof GrammarCorrectionSchema>;
export type GrammarErrorType = z.infer<typeof GrammarErrorTypeSchema>;

// ─── JSON schema mirror of the above (for the LLM outputSchema) ──────────────

const grammarOutputSchema = {
  name: "grammar_correction",
  strict: true,
  schema: {
    type: "object",
    required: [
      "corrected",
      "explanation",
      "changes",
      "errorTags",
      "practiceSentence",
      "practiceSentenceEnglish",
      "isAlreadyCorrect",
    ],
    additionalProperties: false,
    properties: {
      corrected: { type: "string" },
      explanation: { type: "string" },
      changes: {
        type: "array",
        items: {
          type: "object",
          required: ["original", "corrected", "reason", "errorType"],
          additionalProperties: false,
          properties: {
            original: { type: "string" },
            corrected: { type: "string" },
            reason: { type: "string" },
            errorType: {
              type: "string",
              enum: [
                "article",
                "tense",
                "word_order",
                "agreement",
                "vocabulary",
                "spelling",
                "preposition",
                "accent",
                "other",
              ],
            },
          },
        },
      },
      errorTags: {
        type: "array",
        items: {
          type: "string",
          enum: [
            "article",
            "tense",
            "word_order",
            "agreement",
            "vocabulary",
            "spelling",
            "preposition",
            "accent",
            "other",
          ],
        },
      },
      practiceSentence: { type: "string" },
      practiceSentenceEnglish: { type: "string" },
      isAlreadyCorrect: { type: "boolean" },
    },
  },
};

// ─── System prompt ────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are an expert European Portuguese (PT-PT) grammar tutor.
Your job is to analyse a learner's Portuguese sentence, correct it if needed, and
explain every change in simple, encouraging terms.

Rules:
- Focus on European Portuguese (PT-PT), not Brazilian Portuguese.
- Be specific: name the exact word or phrase that was wrong and why.
- If the sentence is already correct, set isAlreadyCorrect=true and keep \"changes\" empty.
- practiceSentence must be a NEW, related sentence that exercises the same grammar point,
  written in European Portuguese. It should be slightly harder than the original.
- practiceSentenceEnglish is the English translation of practiceSentence.
- Use plain language in explanations — imagine talking to a motivated beginner.
- errorTags must be a deduplicated array of the errorType values found in \"changes\".`;

// ─── Router ───────────────────────────────────────────────────────────────────

export const grammarRouter = router({
  check: publicProcedure
    .input(
      z.object({
        sentence: z
          .string()
          .min(1, "Please enter a sentence")
          .max(500, "Sentence is too long"),
      })
    )
    .mutation(async ({ input }) => {
      const response = await invokeLLM({
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: `Please analyse this Portuguese sentence: \"${input.sentence}\"`,
          },
        ],
        outputSchema: grammarOutputSchema,
      });

      const rawContent = response.choices[0]?.message?.content;
      if (typeof rawContent !== "string") {
        throw new Error("Unexpected LLM response format");
      }

      // Strip potential markdown code fences before parsing
      const jsonText = rawContent
        .replace(/^```(?:json)?\n?/, "")
        .replace(/\n?```$/, "")
        .trim();

      const parsed = JSON.parse(jsonText);
      const validated = GrammarCorrectionSchema.parse(parsed);
      return validated;
    }),
});
