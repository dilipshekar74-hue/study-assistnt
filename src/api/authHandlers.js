import prisma from '../lib/prisma.js';
import {
  hashPassword,
  verifyPassword,
  createSession,
  validateSession,
  checkRateLimit,
} from '../lib/auth.js';

/**
 * Extracts client IP from standard reverse proxy headers or socket.
 * @param {object} req 
 * @returns {string}
 */
export function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return req.socket?.remoteAddress || req.connection?.remoteAddress || '127.0.0.1';
}

/**
 * Extracts session token from Authorization header or Cookie header.
 * @param {object} req 
 * @returns {string|null}
 */
export function extractSessionToken(req) {
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7).trim();
  }

  const cookieHeader = req.headers['cookie'];
  if (cookieHeader) {
    const cookies = cookieHeader.split(';').map((c) => c.trim());
    const sessionCookie = cookies.find((c) => c.startsWith('ved_session='));
    if (sessionCookie) {
      return sessionCookie.split('=')[1];
    }
  }

  return null;
}

/**
 * Handler for POST /api/auth/register
 */
export async function handleRegister(body, req) {
  const ip = getClientIp(req);

  // Rate Limiting Invariant: Max 5 attempts per IP per minute
  if (!checkRateLimit(ip)) {
    return {
      status: 429,
      data: {
        error: 'Too many registration attempts. Please wait a minute before trying again.',
      },
    };
  }

  const { email, password, academicLevel, major } = body || {};

  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return {
      status: 400,
      data: { error: 'A valid email address is required.' },
    };
  }

  if (!password || typeof password !== 'string' || password.length < 8) {
    return {
      status: 400,
      data: { error: 'Password must be at least 8 characters long.' },
    };
  }

  const normalizedEmail = email.toLowerCase().trim();

  try {
    // Check if user already exists
    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      return {
        status: 409,
        data: { error: 'An account with this email address already exists.' },
      };
    }

    // Hash password with bcrypt (12 salt rounds)
    const passwordHash = await hashPassword(password);

    // Create User & StudentProfile atomically
    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        passwordHash,
        role: 'STUDENT',
        studentProfile: {
          create: {
            academicLevel: academicLevel || 'Undergraduate',
            major: major || null,
            socraticFriction: 0.7,
            totalStudyMinutes: 0,
            streakDays: 1,
          },
        },
      },
      include: {
        studentProfile: true,
      },
    });

    // Create session token (UUIDv4 with 30-day rolling expiration)
    const session = await createSession(user.id, ip);

    // Invariant: Passwords must NEVER be returned in any JSON payload
    const { passwordHash: _, ...safeUser } = user;

    return {
      status: 201,
      headers: {
        'Set-Cookie': `ved_session=${session.sessionToken}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${30 * 24 * 60 * 60}`,
      },
      data: {
        success: true,
        user: safeUser,
        session: {
          token: session.sessionToken,
          expiresAt: session.expiresAt,
        },
      },
    };
  } catch (error) {
    console.error('Registration error:', error.message);
    return {
      status: 500,
      data: { error: 'An unexpected error occurred during registration.' },
    };
  }
}

/**
 * Handler for POST /api/auth/login
 */
export async function handleLogin(body, req) {
  const ip = getClientIp(req);

  // Rate Limiting Invariant: Max 5 attempts per IP per minute
  if (!checkRateLimit(ip)) {
    return {
      status: 429,
      data: {
        error: 'Too many authentication attempts. Please wait a minute before retrying.',
      },
    };
  }

  const { email, password } = body || {};

  if (!email || !password) {
    return {
      status: 400,
      data: { error: 'Email and password are required.' },
    };
  }

  const normalizedEmail = email.toLowerCase().trim();

  try {
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      include: {
        studentProfile: true,
      },
    });

    if (!user) {
      return {
        status: 401,
        data: { error: 'Invalid email or password.' },
      };
    }

    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return {
        status: 401,
        data: { error: 'Invalid email or password.' },
      };
    }

    // Create session token with 30-day rolling expiration
    const session = await createSession(user.id, ip);

    // Invariant: Passwords must NEVER be returned in any JSON payload
    const { passwordHash: _, ...safeUser } = user;

    return {
      status: 200,
      headers: {
        'Set-Cookie': `ved_session=${session.sessionToken}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${30 * 24 * 60 * 60}`,
      },
      data: {
        success: true,
        user: safeUser,
        session: {
          token: session.sessionToken,
          expiresAt: session.expiresAt,
        },
      },
    };
  } catch (error) {
    console.error('Login error:', error.message);
    return {
      status: 500,
      data: { error: 'An unexpected error occurred during authentication.' },
    };
  }
}

/**
 * Handler for GET /api/auth/me
 */
export async function handleMe(req) {
  const token = extractSessionToken(req);

  if (!token) {
    return {
      status: 401,
      data: { error: 'Unauthorized: No active session token found.' },
    };
  }

  const result = await validateSession(token);

  if (!result) {
    return {
      status: 401,
      data: { error: 'Unauthorized: Session invalid or expired.' },
    };
  }

  return {
    status: 200,
    data: {
      success: true,
      user: result.user,
      session: result.session,
    },
  };
}

/**
 * Handler for POST /api/auth/logout
 */
export async function handleLogout(req) {
  const token = extractSessionToken(req);

  if (token) {
    await prisma.session.deleteMany({
      where: { sessionToken: token },
    }).catch(() => {});
  }

  return {
    status: 200,
    headers: {
      'Set-Cookie': 'ved_session=; Path=/; HttpOnly; Max-Age=0',
    },
    data: { success: true, message: 'Logged out successfully.' },
  };
}
