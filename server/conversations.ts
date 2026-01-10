import { eq } from "drizzle-orm";
import { getDb } from "./db";
import { conversationSessions } from "../drizzle/schema";
import { invokeLLM } from "./_core/llm";

interface ConversationTurn {
  role: "user" | "assistant";
  text: string;
  audioUrl?: string;
  transcription?: string;
  feedback?: string;
}

/**
 * Generate initial conversation prompt based on topic and difficulty
 */
export async function generateConversationPrompt(
  topic: string,
  difficulty: "beginner" | "intermediate" | "advanced"
): Promise<string> {
  const difficultyGuide = {
    beginner: "Use simple, common phrases. Short sentences. Present tense mostly.",
    intermediate:
      "Use varied vocabulary. Mix of present and past tense. Some idiomatic expressions.",
    advanced:
      "Use complex structures. Multiple tenses. Nuanced expressions and cultural references.",
  };

  const systemPrompt = `You are a European Portuguese conversation partner helping a student practice. 
${difficultyGuide[difficulty]}
Topic: ${topic}
Start the conversation naturally and encourage the student to respond. Keep responses brief (1-2 sentences).`;

  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: systemPrompt,
      },
      {
        role: "user",
        content: `Start a ${difficulty} level conversation about ${topic} in European Portuguese.`,
      },
    ],
  });

  const content = response.choices[0]?.message.content;
  return typeof content === "string" ? content : "";
}

/**
 * Generate AI response to student input
 */
export async function generateAIResponse(
  studentText: string,
  topic: string,
  difficulty: "beginner" | "intermediate" | "advanced",
  conversationHistory: ConversationTurn[]
): Promise<{
  response: string;
  feedback: string;
}> {
  const difficultyGuide = {
    beginner: "Simple, encouraging responses. Correct gently if needed.",
    intermediate: "Natural responses with occasional corrections.",
    advanced: "Natural, nuanced responses. Discuss cultural aspects.",
  };

  const historyText = conversationHistory
    .map((turn) => `${turn.role === "user" ? "Student" : "Assistant"}: ${turn.text}`)
    .join("\n");

  const systemPrompt = `You are a European Portuguese conversation partner.
${difficultyGuide[difficulty]}
Topic: ${topic}
Conversation history:
${historyText}

Respond naturally and provide brief feedback on the student's Portuguese.`;

  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: systemPrompt,
      },
      {
        role: "user",
        content: `Student said: "${studentText}". Respond naturally and provide one sentence of feedback.`,
      },
    ],
  });

  const messageContent = response.choices[0]?.message.content;
  const content = typeof messageContent === "string" ? messageContent : "";
  const parts = content.split("\n");

  return {
    response: parts[0] || "",
    feedback: parts[1] || "Good effort! Keep practicing.",
  };
}

/**
 * Create a new conversation session
 */
export async function createConversationSession(
  userId: number,
  topic: string,
  difficulty: "beginner" | "intermediate" | "advanced"
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const initialPrompt = await generateConversationPrompt(topic, difficulty);

  const conversationData: ConversationTurn[] = [
    {
      role: "assistant",
      text: initialPrompt,
    },
  ];

  const result = await db.insert(conversationSessions).values({
    userId,
    topic,
    difficulty,
    conversationData: JSON.stringify(conversationData),
  });

  return {
    id: (result as any).insertId,
    initialPrompt,
    conversationData,
  };
}

/**
 * Add turn to conversation and get AI response
 */
export async function addConversationTurn(
  sessionId: number,
  studentText: string,
  transcription?: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Get existing session
  const sessions = await db
    .select()
    .from(conversationSessions)
    .where(eq(conversationSessions.id, sessionId));

  if (sessions.length === 0) throw new Error("Session not found");

  const session = sessions[0];
  const conversationData: ConversationTurn[] = JSON.parse(
    session.conversationData || "[]"
  );

  // Add student turn
  conversationData.push({
    role: "user",
    text: studentText,
    transcription,
  });

  // Generate AI response
  const { response, feedback } = await generateAIResponse(
    studentText,
    session.topic,
    session.difficulty,
    conversationData
  );

  conversationData.push({
    role: "assistant",
    text: response,
    feedback,
  });

  // Update session
  await db
    .update(conversationSessions)
    .set({
      conversationData: JSON.stringify(conversationData),
    })
    .where(eq(conversationSessions.id, sessionId));

  return {
    response,
    feedback,
    conversationData,
  };
}

/**
 * Complete conversation session with score
 */
export async function completeConversation(
  sessionId: number,
  score: number,
  overallFeedback: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(conversationSessions)
    .set({
      overallScore: score,
      feedback: overallFeedback,
      completedAt: new Date(),
    })
    .where(eq(conversationSessions.id, sessionId));
}

/**
 * Get user's conversation history
 */
export async function getUserConversations(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(conversationSessions)
    .where(eq(conversationSessions.userId, userId));
}
