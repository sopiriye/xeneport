// User-facing auth and profile types:
// These interfaces mirror the normalized response shapes returned by the backend API layer.
export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  status: string;
  emailVerified: boolean;
  emailVerifiedAt: string | null;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AuthSession {
  accessToken: string;
  user: UserProfile;
}

// Portfolio and holdings domain types:
// These describe the core investor data rendered across dashboard, portfolio detail, and analytics screens.
export interface Portfolio {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  status: string;
  driftMultiplier: number;
  currentAssetCount: number;
  currentTotalMarketValue: number;
  currentEqualWeight: number;
  currentDriftThreshold: number;
  alertCount: number;
  lastRecalculatedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Holding {
  id: string;
  portfolioId: string;
  securityId: string;
  ticker: string;
  companyName: string;
  exchange: {
    tickerPrefix: string;
    name: string;
  };
  shares: number;
  currentMarketPrice: number;
  currentMarketValue: number;
  currentWeight: number;
  lastTransactionAt: string | null;
  createdAt: string;
  updatedAt: string;
}

// Allocation and drift response types:
// These capture the backend-calculated portfolio intelligence used by charts, status tables, and alerts.
export interface AllocationItem {
  holdingId: string;
  securityId: string;
  ticker: string;
  companyName: string;
  exchange: {
    id: string;
    tickerPrefix: string;
    name: string;
  };
  shares: number;
  marketPrice: number;
  marketValue: number;
  allocationWeight: number;
  priceTimestamp: string | null;
  lastTransactionAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AllocationResponse {
  portfolio: {
    id: string;
    name: string;
    status: string;
    driftMultiplier: number;
    lastRecalculatedAt: string | null;
    createdAt: string;
    updatedAt: string;
  };
  summary: {
    assetCount: number;
    totalMarketValue: number;
    equalWeight: number;
    driftThreshold: number;
  };
  allocations: AllocationItem[];
}

export interface DriftItem {
  holdingId: string;
  securityId: string;
  ticker: string;
  companyName: string;
  exchange: {
    id: string;
    tickerPrefix: string;
    name: string;
  };
  shares: number;
  currentMarketPrice: number;
  currentMarketValue: number;
  currentWeight: number;
  equalWeight: number;
  driftThreshold: number;
  hasDrift: boolean;
  openDriftEvent: {
    id: string;
    detectedAt: string;
    eventStatus: string;
    emailStatus: string;
  } | null;
}

export interface DriftStatusResponse {
  portfolio: {
    id: string;
    name: string;
    status: string;
    driftMultiplier: number;
    currentAssetCount: number;
    currentTotalMarketValue: number;
    currentEqualWeight: number;
    currentDriftThreshold: number;
    lastRecalculatedAt: string | null;
  };
  summary: {
    checkedHoldings: number;
    driftedHoldings: number;
    hasDrift: boolean;
  };
  items: DriftItem[];
}

// Reference and alert types:
// These support ticker search, alert review, and the generic paginated response wrapper shared by list endpoints.
export interface Security {
  id: string;
  ticker: string;
  companyName: string;
  securityType: string;
  createdAt: string;
  updatedAt: string;
  exchange: {
    id: string;
    tickerPrefix: string;
    name: string;
    currencyCode: string | null;
    country: string | null;
    timezone: string | null;
  };
}

export interface Alert {
  id: string;
  userId: string;
  portfolioId: string;
  driftEventId: string | null;
  type: string;
  channel: string;
  status: string;
  title: string;
  message: string;
  sentAt: string | null;
  readAt: string | null;
  archivedAt: string | null;
  createdAt: string;
  updatedAt: string;
  portfolio: {
    id: string;
    name: string;
  } | null;
  driftEvent: {
    id: string;
    detectedAt: string;
    eventStatus: string;
    assetWeight?: number;
    equalWeight?: number;
    driftThreshold?: number;
  } | null;
}

export interface PaginatedResponse<T, M = Record<string, unknown>> {
  data: T[];
  meta: M;
}
