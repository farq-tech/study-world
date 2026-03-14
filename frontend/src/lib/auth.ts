export interface AuthUser {
  id: string;
  username: string;
  nameAr: string;
  role: 'STUDENT' | 'PARENT' | 'ADMIN';
  avatarUrl?: string;
  studentId?: string | null;
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

export function setToken(token: string): void {
  localStorage.setItem('token', token);
}

export function removeToken(): void {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

export function getStoredUser(): AuthUser | null {
  if (typeof window === 'undefined') return null;
  const str = localStorage.getItem('user');
  if (!str) return null;
  try {
    return JSON.parse(str);
  } catch {
    return null;
  }
}

export function setStoredUser(user: AuthUser): void {
  localStorage.setItem('user', JSON.stringify(user));
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

export function getDashboardPath(role: string): string {
  if (role === 'STUDENT') return '/student/dashboard';
  return '/admin/dashboard';
}
