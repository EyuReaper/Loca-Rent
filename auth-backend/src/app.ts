//main entry point for better-auth backend
import 'dotenv/config'; // Load environment variables from .env
import express from 'express';
import { betterAuth } from 'better-auth';
import { Pool } from 'pg'; // PostgreSQL client for direct DB access
import cors from 'cors';
import { generateCustomAccessToken, sendEmail } from './utils'; // Import utils

const app = express();
app.use(express.json()); // Enable JSON body parsing

// Configure CORS
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
app.use(cors({
  origin: frontendUrl,
  credentials: true, // Allow cookies and auth headers for session management
}));

// Database connection for Better Auth and custom profile role fetching
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error('DATABASE_URL is not set in environment variables');
}
const dbClient = new Pool({ connectionString: databaseUrl });

// Better Auth Initialization
const betterAuthSecret = process.env.BETTER_AUTH_SECRET;
if (!betterAuthSecret) {
  throw new Error('BETTER_AUTH_SECRET is not set in environment variables');
}

// Initialize Better Auth with configurations
export const auth = betterAuth({
  database: dbClient, // Connects Better Auth directly to your Supabase Postgres
  secret: betterAuthSecret,
  emailAndPassword: {
    enabled: true,
    // autoSignIn: false, // Set to false if you want users to verify email before auto-login
  },
  // Customize JWT generation to include 'role' from our profiles table
  session: {
    generateAccessToken: (session) => generateCustomAccessToken(session, dbClient),
    // You can also customize refresh tokens here if needed
  },
  // Email sending configuration for verification, password reset, etc.
  email: {
    send: sendEmail, // Use the sendEmail function from utils.ts
  },
  // Social providers (e.g., Google, GitHub) - Uncomment and configure if needed
  // socialProviders: {
  //   google: {
  //     clientId: process.env.GOOGLE_CLIENT_ID!,
  //     clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  //     // Callback URL must be accessible by Google and point to your auth backend's endpoint
  //     callbackURL: `${process.env.AUTH_API_URL || 'http://localhost:3001/api/auth'}/google/callback`,
  //   },
  // },
  // Hooks for custom logic after user creation, etc.
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          // This hook runs AFTER Better Auth creates a user in its 'auth.users' table.
          // We can use this to create a corresponding entry in our 'public.profiles' table.
          // This ensures that the 'profiles' table is populated for new users.
          try {
            await dbClient.query(
              `INSERT INTO public.profiles (id, full_name, email, role, is_landlord, is_verified)
               VALUES ($1, $2, $3, $4, $5, $6)`,
              [
                user.id,
                user.name || '', // Better Auth's user might have a 'name' field
                user.email,
                'tenant', // Default role for new users. User can change this during registration.
                false,
                false // Email verification handled by Better Auth
              ]
            );
            console.log(`Profile created in public.profiles for new user: ${user.id}`);
          } catch (error) {
            console.error(`Error creating profile for new user ${user.id} in public.profiles:`, error);
            // Handle error: perhaps log to a monitoring system, or attempt rollback if critical
          }
        },
      },
    },
  },
});

// Expose Better Auth's API routes under /api/auth
// This line integrates Better Auth's built-in Express handlers
app.use('/api/auth', auth.api);

// Basic health check endpoint
app.get('/health', (req, res) => {
  res.status(200).send('Auth service is healthy');
});

const PORT = parseInt(process.env.AUTH_PORT || '3001', 10);
app.listen(PORT, () => {
  console.log(`Auth Backend running on http://localhost:${PORT}`);
  console.log(`Auth API endpoints available at http://localhost:${PORT}/api/auth`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down auth backend...');
  await dbClient.end(); // Close PostgreSQL database connection pool
  process.exit(0);
});