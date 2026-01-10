import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).unique(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  firstName: varchar("firstName", { length: 100 }).notNull(),
  lastName: varchar("lastName", { length: 100 }).notNull(),
  passwordHash: varchar("passwordHash", { length: 255 }),
  loginMethod: varchar("loginMethod", { length: 64 }).default("email").notNull(),
  role: mysqlEnum("role", ["user", "admin", "contributor"]).default("user").notNull(),
  isContributorApproved: boolean("isContributorApproved").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Helper type for user without sensitive fields
export type UserPublic = Omit<User, 'passwordHash'>;

/**
 * Session tokens for email/password authentication
 */
export const sessions = mysqlTable("sessions", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: int("userId").notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Session = typeof sessions.$inferSelect;
export type InsertSession = typeof sessions.$inferInsert;

/**
 * Categories for organizing phrases by daily life situations
 */
export const categories = mysqlTable("categories", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  nameEn: varchar("nameEn", { length: 100 }).notNull(),
  description: text("description"),
  icon: varchar("icon", { length: 50 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Category = typeof categories.$inferSelect;
export type InsertCategory = typeof categories.$inferInsert;

/**
 * Portuguese phrases with translations and native audio
 */
export const phrases = mysqlTable("phrases", {
  id: int("id").autoincrement().primaryKey(),
  categoryId: int("categoryId").notNull(),
  textPt: text("textPt").notNull(),
  textEn: text("textEn").notNull(),
  audioUrl: text("audioUrl").notNull(),
  audioKey: varchar("audioKey", { length: 255 }).notNull(),
  difficulty: mysqlEnum("difficulty", ["beginner", "intermediate", "advanced"]).default("beginner").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Phrase = typeof phrases.$inferSelect;
export type InsertPhrase = typeof phrases.$inferInsert;

/**
 * User audio recordings for pronunciation practice
 */
export const userRecordings = mysqlTable("userRecordings", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  phraseId: int("phraseId").notNull(),
  audioUrl: text("audioUrl").notNull(),
  audioKey: varchar("audioKey", { length: 255 }).notNull(),
  transcription: text("transcription"),
  feedback: text("feedback"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type UserRecording = typeof userRecordings.$inferSelect;
export type InsertUserRecording = typeof userRecordings.$inferInsert;

/**
 * Contributor recordings and live conversation sessions
 */
export const contributorRecordings = mysqlTable("contributorRecordings", {
  id: int("id").autoincrement().primaryKey(),
  contributorId: int("contributorId").notNull(),
  phraseId: int("phraseId"),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  audioUrl: text("audioUrl").notNull(),
  audioKey: varchar("audioKey", { length: 255 }).notNull(),
  type: mysqlEnum("type", ["phrase", "conversation", "lesson"]).default("phrase").notNull(),
  difficulty: mysqlEnum("difficulty", ["beginner", "intermediate", "advanced"]).default("beginner").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ContributorRecording = typeof contributorRecordings.$inferSelect;
export type InsertContributorRecording = typeof contributorRecordings.$inferInsert;

/**
 * Flashcards for vocabulary and phrase practice
 */
export const flashcards = mysqlTable("flashcards", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  phraseId: int("phraseId"),
  front: text("front").notNull(),
  back: text("back").notNull(),
  audioUrl: text("audioUrl"),
  difficulty: mysqlEnum("difficulty", ["easy", "medium", "hard"]).default("medium").notNull(),
  nextReviewAt: timestamp("nextReviewAt").defaultNow().notNull(),
  interval: int("interval").default(1).notNull(),
  easeFactor: int("easeFactor").default(2500).notNull(),
  repetitions: int("repetitions").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Flashcard = typeof flashcards.$inferSelect;
export type InsertFlashcard = typeof flashcards.$inferInsert;

/**
 * Flashcard study sessions tracking
 */
export const flashcardSessions = mysqlTable("flashcardSessions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  flashcardId: int("flashcardId").notNull(),
  quality: int("quality").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type FlashcardSession = typeof flashcardSessions.$inferSelect;
export type InsertFlashcardSession = typeof flashcardSessions.$inferInsert;

/**
 * Phrase practice sessions tracking
 */
export const phrasePracticeSessions = mysqlTable("phrasePracticeSessions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  phraseId: int("phraseId").notNull(),
  categoryId: int("categoryId").notNull(),
  recordingId: int("recordingId"),
  pronunciationScore: int("pronunciationScore"),
  feedback: text("feedback"),
  duration: int("duration"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PhrasePracticeSession = typeof phrasePracticeSessions.$inferSelect;
export type InsertPhrasePracticeSession = typeof phrasePracticeSessions.$inferInsert;

/**
 * User learning streaks
 */
export const learningStreaks = mysqlTable("learningStreaks", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  currentStreak: int("currentStreak").default(0).notNull(),
  longestStreak: int("longestStreak").default(0).notNull(),
  lastPracticeDate: timestamp("lastPracticeDate"),
  totalDaysActive: int("totalDaysActive").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type LearningStreak = typeof learningStreaks.$inferSelect;
export type InsertLearningStreak = typeof learningStreaks.$inferInsert;

/**
 * Category performance tracking
 */
export const categoryPerformance = mysqlTable("categoryPerformance", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  categoryId: int("categoryId").notNull(),
  totalPractices: int("totalPractices").default(0).notNull(),
  averageScore: int("averageScore").default(0).notNull(),
  lastPracticeDate: timestamp("lastPracticeDate"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CategoryPerformance = typeof categoryPerformance.$inferSelect;
export type InsertCategoryPerformance = typeof categoryPerformance.$inferInsert;

/**
 * Achievement badges for students
 */
export const badges = mysqlTable("badges", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  icon: varchar("icon", { length: 50 }),
  badgeType: mysqlEnum("badgeType", ["streak", "milestone", "category", "achievement"]).notNull(),
  condition: text("condition"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Badge = typeof badges.$inferSelect;
export type InsertBadge = typeof badges.$inferInsert;

/**
 * User badge achievements
 */
export const userBadges = mysqlTable("userBadges", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  badgeId: int("badgeId").notNull(),
  unlockedAt: timestamp("unlockedAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type UserBadge = typeof userBadges.$inferSelect;
export type InsertUserBadge = typeof userBadges.$inferInsert;

/**
 * Conversation practice sessions
 */
export const conversationSessions = mysqlTable("conversationSessions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  topic: varchar("topic", { length: 100 }).notNull(),
  difficulty: mysqlEnum("difficulty", ["beginner", "intermediate", "advanced"]).default("beginner").notNull(),
  conversationData: text("conversationData"),
  overallScore: int("overallScore"),
  feedback: text("feedback"),
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ConversationSession = typeof conversationSessions.$inferSelect;
export type InsertConversationSession = typeof conversationSessions.$inferInsert;
