import { getStoredAccessToken } from "./storage";
import type {
  Alert,
  AllocationResponse,
  DriftStatusResponse,
  Holding,
  PaginatedResponse,
  Portfolio,
  Security,
  UserProfile,
} from "./types";

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api"
).replace(/\/$/, "");

type RequestOptions = {
  method?: string;
  body?: unknown;
  query?: Record<string, string | number | undefined | null>;
  token?: string | null;
};

export class ApiError extends Error {
  status: number;
  details: unknown;

  constructor(message: string, status: number, details: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

const buildUrl = (path: string, query?: RequestOptions["query"]) => {
  // buildUrl helper:
  // Resolve a frontend API path against the configured base URL and append only the non-empty query values.
  const url = new URL(`${API_BASE_URL}${path}`);

  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.set(key, String(value));
      }
    });
  }

  return url.toString();
};

async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  // apiRequest helper:
  // Centralize token injection, JSON serialization, and backend error normalization for every frontend API call.
  const token = options.token ?? getStoredAccessToken();
  const response = await fetch(buildUrl(path, options.query), {
    method: options.method ?? "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const text = await response.text();
  let parsed: unknown = null;

  if (text) {
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = text;
    }
  }

  if (!response.ok) {
    const errorPayload = parsed as
      | { message?: string | string[] }
      | string
      | null;
    const message =
      typeof errorPayload === "object" && errorPayload?.message instanceof Array
        ? errorPayload.message.join(", ")
        : typeof errorPayload === "object" && errorPayload?.message
          ? errorPayload.message
          : typeof errorPayload === "string"
            ? errorPayload
            : "Request failed";

    throw new ApiError(message, response.status, parsed);
  }

  return parsed as T;
}

export const authApi = {
  // authApi.register:
  // Create a new investor account and trigger OTP issuance without attaching an existing bearer token.
  register: (payload: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }) =>
    apiRequest<{
      message: string;
      user: UserProfile;
      otpPreview?: string;
    }>("/auth/register", {
      method: "POST",
      body: payload,
      token: null,
    }),
  // authApi.verifyOtp:
  // Submit the email verification code and return the verified public user payload from the backend.
  verifyOtp: (payload: { email: string; otp: string }) =>
    apiRequest<{
      message: string;
      user: UserProfile;
    }>("/auth/verify-otp", {
      method: "POST",
      body: payload,
      token: null,
    }),
  // authApi.resendOtp:
  // Request a fresh email verification code for the pending signup email address.
  resendOtp: (payload: { email: string }) =>
    apiRequest<{
      message: string;
      otpPreview?: string;
    }>("/auth/resend-otp", {
      method: "POST",
      body: payload,
      token: null,
    }),
  // authApi.login:
  // Exchange credentials for the bearer token and the authenticated user's public profile.
  login: (payload: { email: string; password: string }) =>
    apiRequest<{
      message: string;
      accessToken: string;
      tokenType: string;
      expiresIn: string;
      user: UserProfile;
    }>("/auth/login", {
      method: "POST",
      body: payload,
      token: null,
    }),
  // authApi.logout:
  // Revoke the current authenticated session on the backend.
  logout: () =>
    apiRequest<{ message: string }>("/auth/logout", {
      method: "POST",
    }),
};

export const usersApi = {
  // usersApi.getMe:
  // Fetch the current authenticated user's profile for session bootstrap and settings screens.
  getMe: () => apiRequest<UserProfile>("/users/me"),
  // usersApi.updateMe:
  // Persist editable profile fields while keeping immutable fields like email outside the frontend write flow.
  updateMe: (payload: { firstName?: string; lastName?: string }) =>
    apiRequest<{ message: string; user: UserProfile }>("/users/me", {
      method: "PATCH",
      body: payload,
    }),
};

export const portfoliosApi = {
  // portfoliosApi.list:
  // Load the current user's active portfolios with a high enough limit for dashboard and selector screens.
  list: () =>
    apiRequest<
      PaginatedResponse<
        Portfolio,
        {
          page: number;
          limit: number;
          total: number;
          totalPages: number;
          hasNextPage: boolean;
          hasPreviousPage: boolean;
          appliedFilters: { status: string | null; search: string | null };
        }
      >
    >("/portfolios", {
      query: { limit: 100 },
    }),
  // portfoliosApi.getById:
  // Fetch one owned portfolio for detail screens and drift-setting updates.
  getById: (id: string) => apiRequest<Portfolio>(`/portfolios/${id}`),
  // portfoliosApi.create:
  // Create a portfolio first so the returned portfolio id can drive the follow-up holding creation requests.
  create: (payload: {
    name: string;
    description?: string;
    driftMultiplier: number;
  }) =>
    apiRequest<{ message: string; portfolio: Portfolio }>("/portfolios", {
      method: "POST",
      body: payload,
    }),
  // portfoliosApi.updateDriftMultiplier:
  // Update the portfolio-specific drift tolerance that later powers allocation and drift-status views.
  updateDriftMultiplier: (id: string, payload: { driftMultiplier: number }) =>
    apiRequest<{ message: string; portfolio: Portfolio }>(
      `/portfolios/${id}/drift-multiplier`,
      {
        method: "PATCH",
        body: payload,
      },
    ),
};

export const holdingsApi = {
  // holdingsApi.listByPortfolio:
  // Return all holdings for a selected portfolio so the detail page can render a complete owned-asset view.
  listByPortfolio: (portfolioId: string) =>
    apiRequest<
      PaginatedResponse<
        Holding,
        {
          page: number;
          limit: number;
          total: number;
          totalPages: number;
          hasNextPage: boolean;
          hasPreviousPage: boolean;
          appliedFilters: { search: string | null };
        }
      > & {
        portfolio: {
          id: string;
          name: string;
          status: string;
        };
      }
    >(`/portfolios/${portfolioId}/holdings`, {
      query: { limit: 100 },
    }),
  // holdingsApi.create:
  // Add a holding using the backend-owned portfolio id and the predefined ticker selected by the user.
  create: (payload: { portfolioId: string; ticker: string; shares: number }) =>
    apiRequest<{ message: string; holding: Holding }>("/holdings", {
      method: "POST",
      body: payload,
    }),
  // holdingsApi.update:
  // Replace the stored share quantity for a holding so downstream portfolio recalculation stays backend-driven.
  update: (holdingId: string, payload: { shares: number }) =>
    apiRequest<{ message: string; holding: Holding }>(
      `/holdings/${holdingId}`,
      {
        method: "PATCH",
        body: payload,
      },
    ),
  // holdingsApi.remove:
  // Delete a holding from the selected portfolio and let the backend refresh cached allocation fields.
  remove: (holdingId: string) =>
    apiRequest<{ message: string; holding: Holding }>(
      `/holdings/${holdingId}`,
      {
        method: "DELETE",
      },
    ),
};

export const allocationApi = {
  // allocationApi.getByPortfolio:
  // Read the backend-calculated allocation summary and per-holding weights for one portfolio.
  getByPortfolio: (portfolioId: string) =>
    apiRequest<AllocationResponse>(`/portfolios/${portfolioId}/allocation`),
};

export const driftApi = {
  // driftApi.getByPortfolio:
  // Read the current drift state that the backend derived from cached allocation and threshold fields.
  getByPortfolio: (portfolioId: string) =>
    apiRequest<DriftStatusResponse>(`/portfolios/${portfolioId}/drift-status`),
};

export const alertsApi = {
  // alertsApi.list:
  // Load the current user's alert feed with optional frontend filters for unread state and portfolio scope.
  list: (query?: {
    status?: string;
    channel?: string;
    portfolioId?: string;
    limit?: number;
  }) =>
    apiRequest<
      PaginatedResponse<
        Alert,
        {
          page: number;
          limit: number;
          total: number;
          totalPages: number;
          hasNextPage: boolean;
          hasPreviousPage: boolean;
          unreadCount: number;
          appliedFilters: {
            status: string | null;
            channel: string | null;
            portfolioId: string | null;
          };
        }
      >
    >("/alerts", {
      query,
    }),
  // alertsApi.getById:
  // Load the full alert detail payload needed for the alert-review dialog.
  getById: (alertId: string) => apiRequest<Alert>(`/alerts/${alertId}`),
  // alertsApi.markAsRead:
  // Transition an unread in-app alert to read so badge counts and list state stay consistent.
  markAsRead: (alertId: string) =>
    apiRequest<{ message: string; alert: Alert }>(`/alerts/${alertId}/read`, {
      method: "PATCH",
    }),
};

export const securitiesApi = {
  // securitiesApi.search:
  // Search the predefined backend ticker list used by portfolio-creation and add-holding flows.
  search: (query?: string) =>
    apiRequest<
      PaginatedResponse<
        Security,
        {
          query: string | null;
          limit: number;
          count: number;
        }
      >
    >("/securities/search", {
      token: null,
      query: {
        q: query || undefined,
        limit: 20,
      },
    }),
};
