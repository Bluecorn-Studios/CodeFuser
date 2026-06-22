export interface SupabaseUser {
  id: string;
  email: string;
  user_metadata?: any;
  fullName?: string;
  businessName?: string;
}

export interface AuthSession {
  user: SupabaseUser;
  token: string;
}

export function getAuthUser(): SupabaseUser | null {
  const userStr = localStorage.getItem("fuser_user");
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
}

export function getAuthToken(): string | null {
  return localStorage.getItem("fuser_token");
}

export function setAuthSession(user: SupabaseUser, token: string) {
  localStorage.setItem("fuser_user", JSON.stringify(user));
  localStorage.setItem("fuser_token", token);
}

export function clearAuthSession() {
  localStorage.removeItem("fuser_user");
  localStorage.removeItem("fuser_token");
  localStorage.removeItem("fuser_client_project_id");
  localStorage.removeItem("codefuser_current_project");
}
