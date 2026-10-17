import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import prisma from './prisma.js';

// Security Invariant: Min 12 salt rounds per .agents/rules/auth-database.md
const SALT_ROUNDS = 12;
const ROLLING_EXPIRATION_DAYS = 30;
const ROLLING_EXPIRATION_MS = ROLLING_EXPIRATION_DAYS * 24 * 60 * 60 * 1000;

// Rate limiting state: Max 5 attempts per IP per minute
const rateLimitMap = new Map();
const RATE_LIMIT_MAX_ATTEMPTS = 5;
const RATE_LIMIT_WINDOW_MS = 60 * 1000;

/**
 * Checks and records an authentication attempt for a given IP.
 * Enforces maximum 5 attempts per IP per minute.
 * @param {string} ip
 * @returns {boolean} true if allowed, false if rate limited
 */
export function checkRateLimit(ip = 'unknown') {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now - entry.firstAttempt > RATE_LIMIT_WINDOW_MS) {
    rateLimitMap.set(ip, { count: 1, firstAttempt: now });
    return true;
  }

  if (entry.count >= RATE_LIMIT_MAX_ATTEMPTS) {
    return false;
  }

  entry.count += 1;
  return true;
}

/**
 * Hash user password using bcrypt with minimum 12 salt rounds.
 * @param {string} password 
 * @returns {Promise<string>}
 */
export async function hashPassword(password) {
  if (!password || typeof password !== 'string' || password.length < 8) {
    throw new Error('Password must be at least 8 characters long.');
  }
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Verify user password against stored bcrypt hash.
 * @param {string} password 
 * @param {string} hash 
 * @returns {Promise<boolean>}
 */
export async function verifyPassword(password, hash) {
  if (!password || !hash) return false;
  return bcrypt.compare(password, hash);
}

/**
 * Create a cryptographically secure UUIDv4 session token with 30-day rolling expiration.
 * @param {string} userId 
 * @param {string|null} ipAddress 
 * @returns {Promise<{sessionToken: string, expiresAt: Date, userId: string}>}
 */
export async function createSession(userId, ipAddress = null) {
  if (!userId) {
    throw new Error('userId is required to create a session.');
  }

  const sessionToken = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + ROLLING_EXPIRATION_MS);

  const session = await prisma.session.create({
    data: {
      sessionToken,
      userId,
      expiresAt,
      ipAddress,
    },
  });

  return {
    id: session.id,
    sessionToken: session.sessionToken,
    expiresAt: session.expiresAt,
    userId: session.userId,
  };
}

/**
 * Validate a session token, implement 30-day rolling expiration,
 * and return safe user data with passwordHash stripped.
 * @param {string} token 
 * @returns {Promise<{session: object, user: object} | null>}
 */
export async function validateSession(token) {
  if (!token) return null;

  try {
    const session = await prisma.session.findUnique({
      where: { sessionToken: token },
      include: {
        user: {
          include: {
            studentProfile: true,
          },
        },
      },
    });

    if (!session || !session.user) {
      return null;
    }

    // Check expiration
    if (new Date() > new Date(session.expiresAt)) {
      // Invalidate expired session
      await prisma.session.delete({ where: { id: session.id } }).catch(() => {});
      return null;
    }

    // 30-day rolling expiration update
    const extendedExpiry = new Date(Date.now() + ROLLING_EXPIRATION_MS);
    await prisma.session.update({
      where: { id: session.id },
      data: { expiresAt: extendedExpiry },
    }).catch(() => {});

    // Invariant: Passwords must NEVER be returned in any query or response
    const { passwordHash, ...safeUser } = session.user;

    return {
      session: {
        id: session.id,
        sessionToken: session.sessionToken,
        expiresAt: extendedExpiry,
        userId: session.userId,
        ipAddress: session.ipAddress,
      },
      user: safeUser,
    };
  } catch (error) {
    console.error('Session validation error:', error.message);
    return null;
  }
}

/**
 * Atomic study minutes update per .agents/rules/auth-database.md
 * @param {string} userId 
 * @param {number} minutesToAdd 
 */
export async function incrementStudentStudyMinutes(userId, minutesToAdd = 1) {
  return prisma.studentProfile.update({
    where: { userId },
    data: {
      totalStudyMinutes: {
        increment: minutesToAdd,
      },
      lastActiveAt: new Date(),
    },
  });
}

/**
 * Enforce tenant isolation for artifact queries (WHERE userId = session.userId)
 * @param {string} userId 
 * @param {string} artifactId 
 */
export async function getTenantArtifact(userId, artifactId) {
  return prisma.artifact.findFirst({
    where: {
      id: artifactId,
      userId, // Strict tenant isolation
    },
  });
}
