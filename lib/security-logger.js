/**
 * Security Event Logger
 * Logs security events for monitoring and audit trail
 */

export function logSecurityEvent(event, details = {}) {
  const timestamp = new Date().toISOString();
  const ip = details.ip || 'unknown';
  
  const logEntry = {
    timestamp,
    event,
    ip,
    ...details
  };
  
  // Log to console with emoji for easy scanning
  const emoji = {
    'rate_limit_exceeded': '🚫',
    'invalid_email': '⚠️',
    'failed_login': '🔒',
    'unauthorized_upload': '🛑',
    'invalid_popup': '❌',
    'suspicious_activity': '⚡',
  }[event] || '📝';
  
  console.log(`${emoji} SECURITY: ${event}`, JSON.stringify(logEntry));
  
  // In production, you could also:
  // - Send to external logging service (Datadog, Sentry, etc.)
  // - Store in database for audit trail
  // - Trigger alerts for critical events
  
  return logEntry;
}

/**
 * Log rate limit violation
 */
export function logRateLimitExceeded(ip, endpoint, limit, remaining) {
  return logSecurityEvent('rate_limit_exceeded', {
    ip,
    endpoint,
    limit,
    remaining,
    action: 'blocked'
  });
}

/**
 * Log failed authentication attempt
 */
export function logFailedAuth(ip, reason) {
  return logSecurityEvent('failed_login', {
    ip,
    reason,
    action: 'blocked'
  });
}

/**
 * Log invalid email submission
 */
export function logInvalidEmail(ip, email) {
  return logSecurityEvent('invalid_email', {
    ip,
    email: email.substring(0, 20), // Partial email for privacy
    action: 'rejected'
  });
}

/**
 * Log unauthorized upload attempt
 */
export function logUnauthorizedUpload(ip) {
  return logSecurityEvent('unauthorized_upload', {
    ip,
    action: 'blocked'
  });
}

/**
 * Log suspicious activity (multiple violations)
 */
export function logSuspiciousActivity(ip, violations) {
  return logSecurityEvent('suspicious_activity', {
    ip,
    violations,
    action: 'flagged'
  });
}
