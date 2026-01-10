import bcrypt from 'bcryptjs';
import { nanoid } from 'nanoid';
import * as db from './db';
import { sessions as sessionsTable } from '../drizzle/schema';
import { eq } from 'drizzle-orm';

const SALT_ROUNDS = 10;
const SESSION_EXPIRY_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Verify a password against a hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Create a new user with email and password
 */
export async function registerUser(
  email: string,
  firstName: string,
  lastName: string,
  password: string
): Promise<{ id: number; email: string; firstName: string; lastName: string }> {
  // Check if user already exists
  const existingUser = await db.getUserByEmail(email);
  if (existingUser) {
    throw new Error('User with this email already exists');
  }

  // Hash password
  const passwordHash = await hashPassword(password);

  // Create user
  const user = await db.createUser(email, firstName, lastName, passwordHash);
  if (!user) {
    throw new Error('Failed to create user');
  }

  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
  };
}

/**
 * Authenticate user with email and password
 */
export async function loginUser(
  email: string,
  password: string
): Promise<{ id: number; email: string; firstName: string; lastName: string }> {
  const user = await db.getUserByEmail(email);
  if (!user) {
    throw new Error('Invalid email or password');
  }

  if (!user.passwordHash) {
    throw new Error('This account uses OAuth login. Please use the OAuth button.');
  }

  const isValid = await verifyPassword(password, user.passwordHash);
  if (!isValid) {
    throw new Error('Invalid email or password');
  }

  // Update last signed in
  await db.updateUserLastSignedIn(user.id);

  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
  };
}

/**
 * Create a session token for a user
 */
export async function createSessionToken(userId: number): Promise<string> {
  const sessionId = nanoid();
  const expiresAt = new Date(Date.now() + SESSION_EXPIRY_MS);

  const drizzleDb = await db.getDb();
  if (!drizzleDb) throw new Error('Database not available');

  await drizzleDb.insert(sessionsTable).values({
    id: sessionId,
    userId,
    expiresAt,
  });

  return sessionId;
}

/**
 * Verify and get user from session token
 */
export async function verifySessionToken(sessionId: string): Promise<{ id: number; email: string; firstName: string; lastName: string } | null> {
  const drizzleDb = await db.getDb();
  if (!drizzleDb) return null;

  const session = await drizzleDb
    .select()
    .from(sessionsTable)
    .where(eq(sessionsTable.id, sessionId))
    .limit(1);

  if (session.length === 0) return null;

  const sessionRecord = session[0];

  // Check if session is expired
  if (sessionRecord.expiresAt < new Date()) {
    // Delete expired session
    await drizzleDb.delete(sessionsTable).where(eq(sessionsTable.id, sessionId));
    return null;
  }

  const user = await db.getUserById(sessionRecord.userId);
  if (!user) return null;

  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
  };
}

/**
 * Delete a session token
 */
export async function deleteSessionToken(sessionId: string): Promise<void> {
  const drizzleDb = await db.getDb();
  if (!drizzleDb) return;

  await drizzleDb.delete(sessionsTable).where(eq(sessionsTable.id, sessionId));
}
