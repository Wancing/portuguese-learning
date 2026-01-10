import { eq, and, like, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, User, users, categories, phrases, userRecordings, InsertCategory, InsertPhrase, InsertUserRecording } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function createUser(email: string, firstName: string, lastName: string, passwordHash: string): Promise<User | undefined> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const role = email === ENV.ownerEmail ? 'admin' : 'user';
  
  const result = await db.insert(users).values({
    email,
    firstName,
    lastName,
    passwordHash,
    loginMethod: 'email',
    role,
  });
  
  const userId = Number((result as any).insertId);
  const user = await getUserById(userId);
  if (!user) throw new Error("Failed to create user");
  return user;
}

export async function getUserByEmail(email: string): Promise<User | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number): Promise<User | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.email) {
    throw new Error("User email is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      email: user.email,
      firstName: user.firstName || "User",
      lastName: user.lastName || "Account",
    };
    const updateSet: Record<string, unknown> = {};

    if (user.firstName) {
      updateSet.firstName = user.firstName;
    }
    if (user.lastName) {
      updateSet.lastName = user.lastName;
    }
    if (user.passwordHash) {
      values.passwordHash = user.passwordHash;
      updateSet.passwordHash = user.passwordHash;
    }
    if (user.loginMethod) {
      values.loginMethod = user.loginMethod;
      updateSet.loginMethod = user.loginMethod;
    }

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string): Promise<User | undefined> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Category queries
export async function getAllCategories() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(categories);
}

export async function getCategoryById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(categories).where(eq(categories.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createCategory(category: InsertCategory) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(categories).values(category);
  return result;
}

// Phrase queries
export async function getPhrasesByCategory(categoryId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(phrases).where(eq(phrases.categoryId, categoryId));
}

export async function searchPhrases(searchTerm: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(phrases).where(
    like(phrases.textPt, `%${searchTerm}%`)
  );
}

export async function getPhraseById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(phrases).where(eq(phrases.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createPhrase(phrase: InsertPhrase) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(phrases).values(phrase);
  return result;
}

export async function getAllPhrases() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(phrases);
}

// User recording queries
export async function createUserRecording(recording: InsertUserRecording) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(userRecordings).values(recording);
  return result;
}

export async function getUserRecordingsByPhrase(userId: number, phraseId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(userRecordings)
    .where(and(eq(userRecordings.userId, userId), eq(userRecordings.phraseId, phraseId)))
    .orderBy(desc(userRecordings.createdAt));
}

export async function getUserRecordingById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(userRecordings).where(eq(userRecordings.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateRecordingTranscription(id: number, transcription: string, feedback: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(userRecordings)
    .set({ transcription, feedback })
    .where(eq(userRecordings.id, id));
}

export async function updatePhraseAudio(id: number, audioUrl: string, audioKey: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(phrases)
    .set({ audioUrl, audioKey })
    .where(eq(phrases.id, id));
}

export async function updateUserLastSignedIn(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(users)
    .set({ lastSignedIn: new Date() })
    .where(eq(users.id, id));
}
