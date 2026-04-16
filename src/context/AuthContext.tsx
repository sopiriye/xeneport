import { createContext, useContext, useEffect, useState } from "react";
import { usersApi } from "@/lib/api";
import {
  clearStoredSession,
  getStoredSession,
  setStoredSession,
} from "@/lib/storage";
import type { AuthSession, UserProfile } from "@/lib/types";

type AuthContextValue = {
  session: AuthSession | null;
  user: UserProfile | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isBootstrapping: boolean;
  setSession: (session: AuthSession) => void;
  updateUser: (user: UserProfile) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSessionState] = useState<AuthSession | null>(() => getStoredSession());
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  useEffect(() => {
    let isActive = true;

    const bootstrap = async () => {
      if (!session?.accessToken) {
        if (isActive) {
          setIsBootstrapping(false);
        }
        return;
      }

      try {
        const user = await usersApi.getMe();

        if (!isActive) {
          return;
        }

        const nextSession = {
          ...session,
          user,
        };

        setSessionState(nextSession);
        setStoredSession(nextSession);
      } catch {
        if (!isActive) {
          return;
        }

        clearStoredSession();
        setSessionState(null);
      } finally {
        if (isActive) {
          setIsBootstrapping(false);
        }
      }
    };

    void bootstrap();

    return () => {
      isActive = false;
    };
  }, []);

  const setSession = (nextSession: AuthSession) => {
    setStoredSession(nextSession);
    setSessionState(nextSession);
  };

  const updateUser = (user: UserProfile) => {
    setSessionState((currentSession) => {
      if (!currentSession) {
        return currentSession;
      }

      const nextSession = {
        ...currentSession,
        user,
      };

      setStoredSession(nextSession);
      return nextSession;
    });
  };

  const logout = () => {
    clearStoredSession();
    setSessionState(null);
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user: session?.user ?? null,
        accessToken: session?.accessToken ?? null,
        isAuthenticated: Boolean(session?.accessToken),
        isBootstrapping,
        setSession,
        updateUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
