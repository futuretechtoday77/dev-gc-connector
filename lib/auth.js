/**
 * Authentication Helper
 * Verifies JWT tokens for protected routes
 */

import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'default-secret-change-in-production'
);

/**
 * Verify admin authentication token
 * @param {Request} request - The incoming request
 * @throws {Error} If authentication fails
 * @returns {Promise<Object>} JWT payload
 */
export async function verifyAuth(request) {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Missing or invalid authorization header');
  }
  
  const token = authHeader.substring(7);
  
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
}
