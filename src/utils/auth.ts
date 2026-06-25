import { safeLocalStorage } from "./safeStorage";

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
  const userStr = safeLocalStorage.getItem("fuser_user");
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
}

export function getAuthToken(): string | null {
  return safeLocalStorage.getItem("fuser_token");
}

export function setAuthSession(user: SupabaseUser, token: string) {
  safeLocalStorage.setItem("fuser_user", JSON.stringify(user));
  safeLocalStorage.setItem("fuser_token", token);
}

export function clearAuthSession() {
  safeLocalStorage.removeItem("fuser_user");
  safeLocalStorage.removeItem("fuser_token");
  safeLocalStorage.removeItem("fuser_client_project_id");
  safeLocalStorage.removeItem("codefuser_current_project");
}
