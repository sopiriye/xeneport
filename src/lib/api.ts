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
  import.meta.env.VITE_API_BASE_URL || "https://xeneport-api.onrender.com/api"
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
  verifyOtp: (payload: { email: string; otp: string }) =>
    apiRequest<{
      message: string;
      user: UserProfile;
    }>("/auth/verify-otp", {
      method: "POST",
      body: payload,
      token: null,
    }),
  resendOtp: (payload: { email: string }) =>
    apiRequest<{
      message: string;
      otpPreview?: string;
    }>("/auth/resend-otp", {
      method: "POST",
      body: payload,
      token: null,
    }),
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
  logout: () =>
    apiRequest<{ message: string }>("/auth/logout", {
      method: "POST",
    }),
};

export const usersApi = {
  getMe: () => apiRequest<UserProfile>("/users/me"),
  updateMe: (payload: { firstName?: string; lastName?: string }) =>
    apiRequest<{ message: string; user: UserProfile }>("/users/me", {
      method: "PATCH",
      body: payload,
    }),
};

export const portfoliosApi = {
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
  getById: (id: string) => apiRequest<Portfolio>(`/portfolios/${id}`),
  create: (payload: {
    name: string;
    description?: string;
    driftMultiplier: number;
  }) =>
    apiRequest<{ message: string; portfolio: Portfolio }>("/portfolios", {
      method: "POST",
      body: payload,
    }),
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
  create: (payload: { portfolioId: string; ticker: string; shares: number }) =>
    apiRequest<{ message: string; holding: Holding }>("/holdings", {
      method: "POST",
      body: payload,
    }),
  update: (holdingId: string, payload: { shares: number }) =>
    apiRequest<{ message: string; holding: Holding }>(
      `/holdings/${holdingId}`,
      {
        method: "PATCH",
        body: payload,
      },
    ),
  remove: (holdingId: string) =>
    apiRequest<{ message: string; holding: Holding }>(
      `/holdings/${holdingId}`,
      {
        method: "DELETE",
      },
    ),
};

export const allocationApi = {
  getByPortfolio: (portfolioId: string) =>
    apiRequest<AllocationResponse>(`/portfolios/${portfolioId}/allocation`),
};

export const driftApi = {
  getByPortfolio: (portfolioId: string) =>
    apiRequest<DriftStatusResponse>(`/portfolios/${portfolioId}/drift-status`),
};

export const alertsApi = {
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
  getById: (alertId: string) => apiRequest<Alert>(`/alerts/${alertId}`),
  markAsRead: (alertId: string) =>
    apiRequest<{ message: string; alert: Alert }>(`/alerts/${alertId}/read`, {
      method: "PATCH",
    }),
};

export const securitiesApi = {
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
