import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";
/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
    id: int("id").autoincrement().primaryKey(),
    openId: varchar("openId", { length: 64 }).notNull().unique(),
    name: text("name"),
    email: varchar("email", { length: 320 }),
    loginMethod: varchar("loginMethod", { length: 64 }),
    role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
    lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});
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
