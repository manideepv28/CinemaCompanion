import { User } from "@/types/content";

const AUTH_STORAGE_KEY = 'docustream_user';

export function getCurrentUser(): User | null {
  try {
    const userData = localStorage.getItem(AUTH_STORAGE_KEY);
    return userData ? JSON.parse(userData) : null;
  } catch {
    return null;
  }
}

export function setCurrentUser(user: User): void {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
}

export function clearCurrentUser(): void {
  localStorage.removeItem(AUTH_STORAGE_KEY);
}

export function updateUserFavorites(favorites: number[]): User | null {
  const user = getCurrentUser();
  if (user) {
    user.favorites = favorites;
    setCurrentUser(user);
    return user;
  }
  return null;
}
