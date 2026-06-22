export function logAndMapAuthError(err: any, context?: string): string {
  const errorCode = err?.code || err?.status || err?.statusCode || "UNKNOWN_AUTH_ERROR";
  const errorMessage = err?.message || String(err);
  const stack = err?.stack || new Error().stack;
  
  console.error("Centralized Auth Error Occurred:", {
    context: context || "General Auth",
    originalError: err,
    errorCode,
    errorMessage,
    stack
  });

  const msgLower = errorMessage.toLowerCase();

  // Classified error flows
  if (msgLower.includes("oauth") || msgLower.includes("provider") || msgLower.includes("google")) {
    if (msgLower.includes("configuration_not_found") || msgLower.includes("config") || msgLower.includes("invalid client") || msgLower.includes("client_id") || msgLower.includes("client_secret") || msgLower.includes("api key") || msgLower.includes("not configured")) {
      return "Authentication configuration is incomplete.";
    }
    if (msgLower.includes("cancel") || msgLower.includes("user_cancelled") || msgLower.includes("closed") || msgLower.includes("cancelled")) {
      return "Authentication was cancelled.";
    }
    if (msgLower.includes("not authorized") || msgLower.includes("unauthorized") || msgLower.includes("forbidden") || msgLower.includes("access_denied") || msgLower.includes("not_authorized")) {
      return "This Google account is not authorized to access the application.";
    }
    return "Google sign-in is temporarily unavailable. Please try again shortly.";
  }

  if (msgLower.includes("fetch") || msgLower.includes("network") || msgLower.includes("unreachable") || msgLower.includes("failed to fetch") || msgLower.includes("connection") || msgLower.includes("timeout")) {
    return "Unable to contact the authentication service.";
  }

  if (msgLower.includes("expired") || msgLower.includes("token_expired") || msgLower.includes("refresh_token_not_found") || msgLower.includes("jwt expired") || msgLower.includes("session_expired")) {
    return "Your login session has expired.";
  }

  if (msgLower.includes("invalid credentials") || msgLower.includes("invalid login credentials")) {
    return "Invalid email or password. Please double check your credentials.";
  }

  if (msgLower.includes("user already exists") || msgLower.includes("already registered")) {
    return "An account with this email address already exists.";
  }

  return "Unable to complete authentication. Please try again shortly.";
}
