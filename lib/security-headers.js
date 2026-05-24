/**
 * Security Headers Helper
 * Adds defense-in-depth HTTP security headers
 */

export function getSecurityHeaders() {
  return {
    // Force HTTPS connections
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    
    // Prevent MIME type sniffing
    'X-Content-Type-Options': 'nosniff',
    
    // Prevent clickjacking
    'X-Frame-Options': 'DENY',
    
    // Enable XSS protection
    'X-XSS-Protection': '1; mode=block',
    
    // Content Security Policy (restrictive)
    'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;",
    
    // Referrer policy
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    
    // Permissions policy
    'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
  };
}

/**
 * Merge security headers with CORS headers
 */
export function mergeHeaders(...headerObjects) {
  return Object.assign({}, ...headerObjects);
}
