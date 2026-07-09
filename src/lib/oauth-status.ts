export function getOAuthStatus() {
  return {
    googleEnabled: Boolean(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET),
    appleEnabled: Boolean(process.env.AUTH_APPLE_ID && process.env.AUTH_APPLE_SECRET),
  };
}
