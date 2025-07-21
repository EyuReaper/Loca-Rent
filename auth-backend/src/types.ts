import { email } from './../../backend/node_modules/zod/src/v4/core/regexes';
//this file represents the structure for the user object
//it might be stored by betterauth or passed in its session
export interface BetterAuthUser {
    id: string;
    email: string;
    name: string;
    //other fields can be added as needed
}
//this interface represents the custom payload in the JWT
// the role is crucial for supabase RLS
export interface CustomJwTPayload extends Jwt.JwtPayload {
    sub: string; // user id
    email: string; // user email
    role: 'tenant' | 'landlord' | 'admin'; // user role
    // any other supabae RLS policies can be added here
}