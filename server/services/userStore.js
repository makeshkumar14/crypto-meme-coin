import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  DEFAULT_ALERT_PREFERENCES,
  DEFAULT_REMINDER_SETTINGS,
  DEFAULT_THEME,
  normalizeAlertPreferences,
  normalizeReminderSettings,
} from '../../src/lib/defaults.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.join(__dirname, '..', 'data');
const dataFile = path.join(dataDir, 'appData.json');
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 30;

const DEFAULT_STORE = {
  users: [],
  sessions: [],
  notificationState: {},
};

function buildInitials(name, email) {
  const source = (name || email || 'MS').trim();
  return source.slice(0, 2).toUpperCase();
}

function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  return {
    salt,
    hash: crypto.scryptSync(password, salt, 64).toString('hex'),
  };
}

function normalizeUser(user) {
  return {
    ...user,
    watchlist: Array.isArray(user.watchlist) ? [...new Set(user.watchlist)] : [],
    alertPreferences: normalizeAlertPreferences(user.alertPreferences),
    reminderSettings: normalizeReminderSettings(user.reminderSettings),
    theme: user.theme === 'light' ? 'light' : DEFAULT_THEME,
  };
}

function sanitizeUser(user) {
  const normalized = normalizeUser(user);
  return {
    id: normalized.id,
    name: normalized.name,
    email: normalized.email,
    initials: normalized.initials,
    createdAt: normalized.createdAt,
    watchlist: normalized.watchlist,
    alertPreferences: normalized.alertPreferences,
    reminderSettings: normalized.reminderSettings,
    theme: normalized.theme,
  };
}

async function ensureStore() {
  await fs.mkdir(dataDir, { recursive: true });

  try {
    await fs.access(dataFile);
  } catch {
    await fs.writeFile(dataFile, JSON.stringify(DEFAULT_STORE, null, 2), 'utf8');
  }
}

async function readStore() {
  await ensureStore();
  const raw = await fs.readFile(dataFile, 'utf8');
  const parsed = JSON.parse(raw || '{}');
  const now = Date.now();

  return {
    users: Array.isArray(parsed.users) ? parsed.users.map(normalizeUser) : [],
    sessions: Array.isArray(parsed.sessions)
      ? parsed.sessions.filter((session) => new Date(session.expiresAt).getTime() > now)
      : [],
    notificationState:
      parsed.notificationState && typeof parsed.notificationState === 'object'
        ? parsed.notificationState
        : {},
  };
}

async function writeStore(store) {
  await ensureStore();
  await fs.writeFile(dataFile, JSON.stringify(store, null, 2), 'utf8');
}

function validateCredentials({ email, password, name }) {
  if (!email || !password) {
    throw new Error('Email and password are required.');
  }

  if (password.length < 6) {
    throw new Error('Password must be at least 6 characters.');
  }

  if (name !== undefined && String(name).trim().length < 2) {
    throw new Error('Name must be at least 2 characters.');
  }
}

function createSession(userId) {
  const createdAt = new Date().toISOString();
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS).toISOString();

  return {
    token: crypto.randomBytes(32).toString('hex'),
    userId,
    createdAt,
    expiresAt,
  };
}

async function getUserRecordByToken(token) {
  if (!token) {
    return null;
  }

  const store = await readStore();
  const session = store.sessions.find((entry) => entry.token === token);
  if (!session) {
    return null;
  }

  const user = store.users.find((entry) => entry.id === session.userId);
  if (!user) {
    return null;
  }

  return {
    store,
    session,
    user,
  };
}

export async function createUserAccount({ name, email, password }) {
  validateCredentials({ name, email, password });
  const store = await readStore();
  const normalizedEmail = email.trim().toLowerCase();

  if (store.users.some((user) => user.email.toLowerCase() === normalizedEmail)) {
    throw new Error('An account with this email already exists.');
  }

  const passwordData = hashPassword(password);
  const user = normalizeUser({
    id: crypto.randomUUID(),
    name: name.trim(),
    email: normalizedEmail,
    initials: buildInitials(name, email),
    passwordHash: passwordData.hash,
    passwordSalt: passwordData.salt,
    createdAt: new Date().toISOString(),
    watchlist: [],
    alertPreferences: DEFAULT_ALERT_PREFERENCES,
    reminderSettings: DEFAULT_REMINDER_SETTINGS,
    theme: DEFAULT_THEME,
  });
  const session = createSession(user.id);

  store.users.push(user);
  store.sessions.push(session);
  await writeStore(store);

  return {
    token: session.token,
    user: sanitizeUser(user),
  };
}

export async function authenticateUser({ email, password }) {
  validateCredentials({ email, password });
  const store = await readStore();
  const normalizedEmail = email.trim().toLowerCase();
  const user = store.users.find((entry) => entry.email.toLowerCase() === normalizedEmail);

  if (!user) {
    throw new Error('Invalid email or password.');
  }

  const passwordData = hashPassword(password, user.passwordSalt);
  if (passwordData.hash !== user.passwordHash) {
    throw new Error('Invalid email or password.');
  }

  const session = createSession(user.id);
  store.sessions.push(session);
  await writeStore(store);

  return {
    token: session.token,
    user: sanitizeUser(user),
  };
}

export async function getSessionUser(token) {
  const record = await getUserRecordByToken(token);
  return record ? sanitizeUser(record.user) : null;
}

export async function signOutSession(token) {
  if (!token) {
    return;
  }

  const store = await readStore();
  store.sessions = store.sessions.filter((session) => session.token !== token);
  await writeStore(store);
}

export async function updateUserState(token, updates = {}) {
  const record = await getUserRecordByToken(token);
  if (!record) {
    throw new Error('Session expired. Please sign in again.');
  }

  const { store, user } = record;
  const userIndex = store.users.findIndex((entry) => entry.id === user.id);
  if (userIndex === -1) {
    throw new Error('User not found.');
  }

  const nextUser = normalizeUser({
    ...user,
    watchlist: Array.isArray(updates.watchlist) ? updates.watchlist : user.watchlist,
    alertPreferences: updates.alertPreferences
      ? normalizeAlertPreferences(updates.alertPreferences)
      : user.alertPreferences,
    reminderSettings: updates.reminderSettings
      ? normalizeReminderSettings(updates.reminderSettings)
      : user.reminderSettings,
    theme: updates.theme === 'light' ? 'light' : updates.theme === 'dark' ? 'dark' : user.theme,
    name: updates.name ? String(updates.name).trim() : user.name,
  });

  nextUser.initials = buildInitials(nextUser.name, nextUser.email);
  store.users[userIndex] = nextUser;
  await writeStore(store);

  return sanitizeUser(nextUser);
}

export async function listUsers() {
  const store = await readStore();
  return store.users.map(sanitizeUser);
}

export async function getNotificationState(userId) {
  const store = await readStore();
  return store.notificationState?.[userId] || null;
}

export async function updateNotificationState(userId, updates = {}) {
  const store = await readStore();
  const currentState = store.notificationState?.[userId] || {};

  store.notificationState = {
    ...(store.notificationState || {}),
    [userId]: {
      ...currentState,
      ...updates,
    },
  };

  await writeStore(store);
  return store.notificationState[userId];
}
