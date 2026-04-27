import type { AuthSession } from "./types";

const AUTH_STORAGE_KEY = "xeneport.auth";
const PENDING_EMAIL_STORAGE_KEY = "xeneport.pending-email";
const ACTIVE_PORTFOLIO_STORAGE_KEY = "xeneport.active-portfolio";

export const getStoredSession = (): AuthSession | null => {
  // getStoredSession helper:
  // Read the persisted auth session and fail closed by clearing corrupted local storage values.
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
  // setStoredSession helper:
  // Persist the bearer token together with the current public user payload after login or bootstrap refresh.
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
};

export const clearStoredSession = () => {
  // clearStoredSession helper:
  // Remove the authenticated session from local storage during logout or stale-token recovery.
  localStorage.removeItem(AUTH_STORAGE_KEY);
};

export const getStoredAccessToken = () => getStoredSession()?.accessToken ?? null;

export const getPendingVerificationEmail = () =>
  localStorage.getItem(PENDING_EMAIL_STORAGE_KEY);

export const setPendingVerificationEmail = (email: string) => {
  // setPendingVerificationEmail helper:
  // Cache the signup email temporarily so the OTP verification screen can finish the auth flow.
  localStorage.setItem(PENDING_EMAIL_STORAGE_KEY, email);
};

export const clearPendingVerificationEmail = () => {
  // clearPendingVerificationEmail helper:
  // Remove the temporary signup email after verification completes or the flow is restarted.
  localStorage.removeItem(PENDING_EMAIL_STORAGE_KEY);
};

type ActivePortfolioMap = Record<string, string>;

const readActivePortfolioMap = (): ActivePortfolioMap => {
  // readActivePortfolioMap helper:
  // Keep a per-user last-selected portfolio map so dashboard-style screens can restore context after refresh.
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
  // getStoredActivePortfolioId helper:
  // Resolve the last portfolio selected by the current user without leaking state across different accounts.
  if (!userId) {
    return null;
  }

  return readActivePortfolioMap()[userId] ?? null;
};

export const setStoredActivePortfolioId = (userId: string, portfolioId: string) => {
  // setStoredActivePortfolioId helper:
  // Persist the active portfolio id under the current user so follow-up pages can reuse that backend id.
  const currentMap = readActivePortfolioMap();
  currentMap[userId] = portfolioId;
  localStorage.setItem(ACTIVE_PORTFOLIO_STORAGE_KEY, JSON.stringify(currentMap));
};
