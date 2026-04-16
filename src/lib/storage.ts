import type { AuthSession } from "./types";

const AUTH_STORAGE_KEY = "xeneport.auth";
const PENDING_EMAIL_STORAGE_KEY = "xeneport.pending-email";
const ACTIVE_PORTFOLIO_STORAGE_KEY = "xeneport.active-portfolio";

export const getStoredSession = (): AuthSession | null => {
  const rawValue = localStorage.getItem(AUTH_STORAGE_KEY);

  if (!rawValue) {
    return null;
  }

  try {
    return JSON.parse(rawValue) as AuthSession;
  } catch {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
};

export const setStoredSession = (session: AuthSession) => {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
};

export const clearStoredSession = () => {
  localStorage.removeItem(AUTH_STORAGE_KEY);
};

export const getStoredAccessToken = () => getStoredSession()?.accessToken ?? null;

export const getPendingVerificationEmail = () =>
  localStorage.getItem(PENDING_EMAIL_STORAGE_KEY);

export const setPendingVerificationEmail = (email: string) => {
  localStorage.setItem(PENDING_EMAIL_STORAGE_KEY, email);
};

export const clearPendingVerificationEmail = () => {
  localStorage.removeItem(PENDING_EMAIL_STORAGE_KEY);
};

type ActivePortfolioMap = Record<string, string>;

const readActivePortfolioMap = (): ActivePortfolioMap => {
  const rawValue = localStorage.getItem(ACTIVE_PORTFOLIO_STORAGE_KEY);

  if (!rawValue) {
    return {};
  }

  try {
    return JSON.parse(rawValue) as ActivePortfolioMap;
  } catch {
    localStorage.removeItem(ACTIVE_PORTFOLIO_STORAGE_KEY);
    return {};
  }
};

export const getStoredActivePortfolioId = (userId?: string | null) => {
  if (!userId) {
    return null;
  }

  return readActivePortfolioMap()[userId] ?? null;
};

export const setStoredActivePortfolioId = (userId: string, portfolioId: string) => {
  const currentMap = readActivePortfolioMap();
  currentMap[userId] = portfolioId;
  localStorage.setItem(ACTIVE_PORTFOLIO_STORAGE_KEY, JSON.stringify(currentMap));
};
