/**
 * Decode JWT token and extract payload
 * @param token JWT token string
 * @returns Decoded payload or null if invalid
 */
export const decodeJWT = (token: string): any | null => {
  try {
    // JWT has 3 parts separated by dots: header.payload.signature
    const parts = token.split('.');

    if (parts.length !== 3) {
      console.error('Invalid JWT format');
      return null;
    }

    // Decode the payload (second part)
    const payload = parts[1];

    // Decode base64url (replace - with + and _ with /)
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');

    // Decode and parse JSON
    const decodedPayload = JSON.parse(atob(base64));

    return decodedPayload;
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
};

/**
 * Check if JWT token is expired
 * @param token JWT token string
 * @returns true if token is expired, false otherwise
 */
export const isTokenExpired = (token: string): boolean => {
  try {
    const payload = decodeJWT(token);

    if (!payload || !payload.exp) {
      return true;
    }

    // JWT exp is in seconds, Date.now() is in milliseconds
    const expirationTime = payload.exp * 1000;
    const currentTime = Date.now();

    // Add 5 minute buffer to refresh before actual expiration
    const bufferTime = 5 * 60 * 1000;

    return currentTime >= (expirationTime - bufferTime);
  } catch (error) {
    console.error('Error checking token expiration:', error);
    return true;
  }
};

/**
 * Extract user information from JWT token
 * @param token JWT token string
 * @returns User object with id, email, name, and roles or null if expired
 */
export const extractUserFromJWT = (token: string) => {
  const payload = decodeJWT(token);

  if (!payload) {
    return null;
  }

  // Check if token is expired
  if (isTokenExpired(token)) {
    console.log('Token is expired');
    return null;
  }

  // Extract fields from JWT payload
  // Based on the token structure: nameid, name, email, role
  const userId = payload.nameid || payload.sub || payload.userId || '';
  const username = payload.name || payload.unique_name || '';
  const email = payload.email || '';
  const role = payload.role || '';
  const userProfileId = payload.UserProfileId || '';

  // Roles can be a string or array
  const roles = Array.isArray(role) ? role : role ? [role] : [];

  return {
    id: userId,
    email: email,
    name: username || email.split('@')[0],
    username: username,
    userProfileId: userProfileId,
    roles: roles,
  };
};
