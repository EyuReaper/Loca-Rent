import { BetterAuthUser } from './types';
import jwt from 'jsonwebtoken';
import { Pool } from 'pg'; // postgreSQL client
import nodemailer from 'nodemailer'; // for sending emails
import { CustomJwtPayload, BetterAuthUser } from './types'; //imports custom types

// .env variables
const JWT_SECRET = process.env.BETTER_AUTH_SECRET!;
const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587', 10);
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASSWORD = process.env.SMTP_PASSWORD;
const EMAIL_FROM = process.env.EMAIL_FROM || 'no-reply@localhost';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

//Nodemailer transporter for email sending
const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465, // true for 465, false for other ports
    auth: {
        user: SMTP_USER,
        pass: SMTP_PASSWORD,
    },
});

/**
 * Fetches the user's role from the public.profiles table in Supabase.
 * This is crucial because Better Auth's internal user table might not store our custom 'role'.
 * @param userId The UUID of the user.
 * @param dbClient The PostgreSQL Pool client connected to Supabase.
 * @returns The user's role ('tenant' or 'landlord') or undefined if not found/error.
 */

export const fetchUserRoleFromSupabase = async (userId: string, dbClient: Pool): Promise<'tenant' | 'landlord' | undefined> => {
  try {
    const result = await dbClient.query('SELECT role FROM public.profiles WHERE id = $1', [userId]);
    if (result.rows.length > 0) {
      return result.rows[0].role as 'tenant' | 'landlord';
    }
  } catch (error) {
    console.error(`[fetchUserRoleFromSupabase] Error fetching role for user ${userId}:`, error);
  }
  return undefined;
};

/**
 * Generates a custom JWT access token for Better Auth sessions.
 * This function is passed to Better Auth's `session.generateAccessToken` configuration.
 * It ensures the 'role' claim is included in the JWT, which is essential for Supabase RLS.
 * @param session The session object provided by Better Auth.
 * @param dbClient The PostgreSQL Pool client for database access.
 * @returns A signed JWT string.
 */
export const generateCustomAccessToken = async (session: { user: BetterAuthUser }, dbClient: Pool): Promise<string> => {
  const userId = session.user.id;
  const userEmail = session.user.email;

  // Fetch the role from our custom profiles table
  const userRole = await fetchUserRoleFromSupabase(userId, dbClient);

  const payload: CustomJwtPayload = {
    sub: userId, // Standard JWT subject claim (user ID)
    email: userEmail,
    role: userRole || 'tenant', // Default to 'tenant' if role not found (shouldn't happen with proper signup)
  };

  // Sign the JWT. Better Auth handles token expiration, but you can specify here too.
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '1h', // Token expires in 1 hour (adjust as needed)
    algorithm: 'HS256' // Must match what Better Auth expects/Supabase verifies
  });
};

/**
 * Sends an email using Nodemailer.
 * This function is passed to Better Auth's `email.send` configuration.
 * @param options Email options (to, subject, body, html).
 */
export const sendEmail = async (options: { to: string; subject: string; body: string; html?: string }) => {
  try {
    await transporter.sendMail({
      from: EMAIL_FROM,
      to: options.to,
      subject: options.subject,
      html: options.html || options.body,
    });
    console.log(`Email sent to ${options.to} successfully.`);
  } catch (error) {
    console.error(`Error sending email to ${options.to}:`, error);
    // In production, you might want to log this error to a monitoring service
  }
};