import 'dotenv/config';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import Database from 'better-sqlite3';

const app = express();
const port = Number(process.env.API_PORT || 3001);
const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const dataDirectory = path.join(currentDirectory, 'data');
fs.mkdirSync(dataDirectory, { recursive: true });
const database = new Database(path.join(dataDirectory, 'accounts.sqlite'));
const codeRequests = new Map();

database.pragma('journal_mode = WAL');
database.exec(`
  CREATE TABLE IF NOT EXISTS accounts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    role TEXT NOT NULL CHECK (role IN ('staff', 'supplier')),
    username TEXT NOT NULL COLLATE NOCASE,
    phone TEXT NOT NULL UNIQUE,
    password_salt TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (role, username)
  )
`);

app.use(express.json({ limit: '10kb' }));

function sendError(response, status, message) {
  response.status(status).json({ error: message });
}

function validateIdentity({ role, username, phone }) {
  if (!['staff', 'supplier'].includes(role)) return 'Choose a valid account type.';
  if (typeof username !== 'string' || username.trim().length < 2 || username.trim().length > 80) {
    return 'Enter a valid username or supplier ID.';
  }
  if (typeof phone !== 'string' || !/^\+[1-9]\d{7,14}$/.test(phone.trim())) {
    return 'Enter a phone number in international format, such as +94771234567.';
  }
  return null;
}

function validatePassword(password) {
  return typeof password === 'string' && password.length >= 8 && password.length <= 200;
}

function hashPassword(password, salt = crypto.randomBytes(16)) {
  return new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, 64, (error, derivedKey) => {
      if (error) reject(error);
      else resolve({ salt: salt.toString('hex'), hash: derivedKey.toString('hex') });
    });
  });
}

function passwordsMatch(password, account) {
  return new Promise((resolve, reject) => {
    crypto.scrypt(password, Buffer.from(account.password_salt, 'hex'), 64, (error, derivedKey) => {
      if (error) {
        reject(error);
        return;
      }
      const savedHash = Buffer.from(account.password_hash, 'hex');
      resolve(savedHash.length === derivedKey.length && crypto.timingSafeEqual(savedHash, derivedKey));
    });
  });
}

function twilioCredentials(response) {
  const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_VERIFY_SERVICE_SID } = process.env;
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_VERIFY_SERVICE_SID) {
    sendError(response, 503, 'SMS password recovery is not configured. Set the Twilio credentials in the server environment.');
    return null;
  }
  return { accountSid: TWILIO_ACCOUNT_SID, authToken: TWILIO_AUTH_TOKEN, serviceSid: TWILIO_VERIFY_SERVICE_SID };
}

async function twilioRequest(credentials, endpoint, values) {
  const url = `https://verify.twilio.com/v2/Services/${credentials.serviceSid}/${endpoint}`;
  const authorization = Buffer.from(`${credentials.accountSid}:${credentials.authToken}`).toString('base64');
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${authorization}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams(values),
  });
  const result = await response.json();
  if (!response.ok) {
    const error = new Error(result.message || 'SMS verification request failed.');
    error.status = response.status;
    throw error;
  }
  return result;
}

function rateLimitCodeRequest(key) {
  const now = Date.now();
  const attempts = (codeRequests.get(key) || []).filter((time) => now - time < 60 * 60 * 1000);
  if (attempts.length >= 5) return false;
  attempts.push(now);
  codeRequests.set(key, attempts);
  return true;
}

app.post('/api/auth/register', async (request, response) => {
  const identityError = validateIdentity(request.body);
  if (identityError) return sendError(response, 400, identityError);
  if (!validatePassword(request.body.password)) {
    return sendError(response, 400, 'Password must be between 8 and 200 characters.');
  }

  const username = request.body.username.trim();
  const phone = request.body.phone.trim();
  const existingAccount = database.prepare(
    'SELECT id FROM accounts WHERE (role = ? AND username = ?) OR phone = ?',
  ).get(request.body.role, username, phone);
  if (existingAccount) return sendError(response, 409, 'This username or phone number is already registered.');

  try {
    const { salt, hash } = await hashPassword(request.body.password);
    database.prepare(`
      INSERT INTO accounts (role, username, phone, password_salt, password_hash)
      VALUES (?, ?, ?, ?, ?)
    `).run(request.body.role, username, phone, salt, hash);
    response.status(201).json({ username, role: request.body.role });
  } catch (error) {
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return sendError(response, 409, 'This username or phone number is already registered.');
    }
    console.error('Account registration failed:', error);
    sendError(response, 500, 'Unable to create the account.');
  }
});

app.post('/api/auth/login', async (request, response) => {
  const { role, username, password } = request.body;
  if (
    !['staff', 'supplier'].includes(role)
    || typeof username !== 'string'
    || username.trim().length < 2
    || username.trim().length > 80
    || typeof password !== 'string'
  ) {
    return sendError(response, 400, 'Enter your account details.');
  }
  try {
    const account = database.prepare(
      'SELECT role, username, password_salt, password_hash FROM accounts WHERE role = ? AND username = ?',
    ).get(role, username.trim());
    if (!account || !(await passwordsMatch(password, account))) {
      return sendError(response, 401, 'Incorrect username, supplier ID, or password.');
    }
    response.json({ role: account.role, username: account.username });
  } catch (error) {
    console.error('Sign in failed:', error);
    sendError(response, 500, 'Unable to sign in.');
  }
});

app.post('/api/auth/forgot-password', async (request, response) => {
  const identityError = validateIdentity(request.body);
  if (identityError) return sendError(response, 400, identityError);
  const phone = request.body.phone.trim();
  const rateLimitKey = `${request.ip}:${phone}`;
  if (!rateLimitCodeRequest(rateLimitKey)) {
    return sendError(response, 429, 'Too many code requests. Try again later.');
  }

  const credentials = twilioCredentials(response);
  if (!credentials) return;

  try {
    const account = database.prepare(
      'SELECT id FROM accounts WHERE role = ? AND username = ? AND phone = ?',
    ).get(request.body.role, request.body.username.trim(), phone);
    if (account) {
      await twilioRequest(credentials, 'Verifications', { To: phone, Channel: 'sms' });
    }
    response.json({ message: 'If the account details match, a verification code has been sent by SMS.' });
  } catch (error) {
    console.error('SMS verification request failed:', error);
    sendError(response, 502, 'Unable to send the SMS code. Check the phone number and try again.');
  }
});

app.post('/api/auth/reset-password', async (request, response) => {
  const { role, username, phone, code, password } = request.body;
  const identityError = validateIdentity({ role, username, phone });
  if (identityError) return sendError(response, 400, identityError);
  if (typeof code !== 'string' || !/^\d{4,10}$/.test(code.trim())) {
    return sendError(response, 400, 'Enter the numeric code sent to your phone.');
  }
  if (!validatePassword(password)) {
    return sendError(response, 400, 'Password must be between 8 and 200 characters.');
  }

  const credentials = twilioCredentials(response);
  if (!credentials) return;

  try {
    const phoneNumber = phone.trim();
    const account = database.prepare(
      'SELECT id FROM accounts WHERE role = ? AND username = ? AND phone = ?',
    ).get(role, username.trim(), phoneNumber);
    if (!account) return sendError(response, 400, 'The account details or verification code are invalid.');

    const verification = await twilioRequest(credentials, 'VerificationCheck', {
      To: phoneNumber,
      Code: code.trim(),
    });
    if (verification.status !== 'approved') {
      return sendError(response, 400, 'The verification code is invalid or expired.');
    }

    const { salt, hash } = await hashPassword(password);
    database.prepare('UPDATE accounts SET password_salt = ?, password_hash = ? WHERE id = ?')
      .run(salt, hash, account.id);
    response.json({ message: 'Password updated. Sign in with your new password.' });
  } catch (error) {
    console.error('Password reset failed:', error);
    sendError(response, error.status === 404 ? 400 : 502, 'The verification code is invalid or expired.');
  }
});

app.listen(port, () => {
  console.log(`Authentication API listening on http://localhost:${port}`);
});
