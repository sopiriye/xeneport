// Mock data for the Portfolio Drift Monitor prototype — Nigerian Exchange (NGX)

export interface Portfolio {
  id: string;
  name: string;
  description?: string;
  totalValue: number;
  holdings: number;
  driftMultiplier: number;
  alertCount: number;
  lastUpdated: string;
  status: 'healthy' | 'warning' | 'alert';
}

export interface Holding {
  id: string;
  ticker: string;
  companyName: string;
  shares: number;
  currentPrice: number;
  totalValue: number;
  allocation: number;
  equalWeight: number;
  driftThreshold: number;
  status: 'normal' | 'warning' | 'drift';
  change24h: number;
}

export interface DriftAlert {
  id: string;
  portfolioId: string;
  portfolioName: string;
  ticker: string;
  companyName: string;
  triggeredAt: string;
  currentAllocation: number;
  driftThreshold: number;
  equalWeight: number;
  status: 'unread' | 'read' | 'resolved';
  emailSent: boolean;
}

export interface AllocationSnapshot {
  date: string;
  [ticker: string]: number | string;
}

export const mockPortfolios: Portfolio[] = [
  {
    id: '1',
    name: 'Core Growth Portfolio',
    description: 'Long-term DCA portfolio focused on NGX blue chips',
    totalValue: 14752050,
    holdings: 8,
    driftMultiplier: 1.5,
    alertCount: 2,
    lastUpdated: '2026-03-19T10:30:00Z',
    status: 'alert',
  },
  {
    id: '2',
    name: 'Dividend Income',
    description: 'Stable dividend-paying NGX companies',
    totalValue: 5234000,
    holdings: 5,
    driftMultiplier: 1.8,
    alertCount: 0,
    lastUpdated: '2026-03-18T14:20:00Z',
    status: 'healthy',
  },
  {
    id: '3',
    name: 'Emerging Leaders',
    description: 'High-growth mid-cap NGX opportunities',
    totalValue: 2890075,
    holdings: 6,
    driftMultiplier: 1.4,
    alertCount: 1,
    lastUpdated: '2026-03-19T09:15:00Z',
    status: 'warning',
  },
];

// Portfolio 1 holdings
export const mockHoldingsPortfolio1: Holding[] = [
  { id: '1', ticker: 'DANGCEM', companyName: 'Dangote Cement Plc', shares: 450, currentPrice: 290.50, totalValue: 130725, allocation: 22.8, equalWeight: 12.5, driftThreshold: 18.75, status: 'drift', change24h: 1.2 },
  { id: '2', ticker: 'GTCO', companyName: 'Guaranty Trust Holding Co.', shares: 2200, currentPrice: 48.30, totalValue: 106260, allocation: 23.9, equalWeight: 12.5, driftThreshold: 18.75, status: 'drift', change24h: -0.3 },
  { id: '3', ticker: 'MTNN', companyName: 'MTN Nigeria Communications', shares: 300, currentPrice: 195.80, totalValue: 58740, allocation: 13.5, equalWeight: 12.5, driftThreshold: 18.75, status: 'normal', change24h: 0.8 },
  { id: '4', ticker: 'AIRTELAFRI', companyName: 'Airtel Africa Plc', shares: 250, currentPrice: 2120.40, totalValue: 530100, allocation: 12.3, equalWeight: 12.5, driftThreshold: 18.75, status: 'normal', change24h: 2.1 },
  { id: '5', ticker: 'BUACEMENT', companyName: 'BUA Cement Plc', shares: 500, currentPrice: 85.60, totalValue: 42800, allocation: 8.8, equalWeight: 12.5, driftThreshold: 18.75, status: 'normal', change24h: 3.4 },
  { id: '6', ticker: 'ZENITHBANK', companyName: 'Zenith Bank Plc', shares: 1500, currentPrice: 38.20, totalValue: 57300, allocation: 12.0, equalWeight: 12.5, driftThreshold: 18.75, status: 'normal', change24h: -1.1 },
  { id: '7', ticker: 'SEPLAT', companyName: 'Seplat Energy Plc', shares: 80, currentPrice: 3150.00, totalValue: 252000, allocation: 3.7, equalWeight: 12.5, driftThreshold: 18.75, status: 'normal', change24h: -2.5 },
  { id: '8', ticker: 'ACCESSCORP', companyName: 'Access Holdings Plc', shares: 5000, currentPrice: 20.90, totalValue: 104500, allocation: 5.4, equalWeight: 12.5, driftThreshold: 18.75, status: 'normal', change24h: 0.6 },
];

// Portfolio 2 holdings
export const mockHoldingsPortfolio2: Holding[] = [
  { id: '9', ticker: 'STANBIC', companyName: 'Stanbic IBTC Holdings', shares: 800, currentPrice: 65.00, totalValue: 52000, allocation: 22.0, equalWeight: 20.0, driftThreshold: 36.0, status: 'normal', change24h: 0.5 },
  { id: '10', ticker: 'NESTLE', companyName: 'Nestle Nigeria Plc', shares: 50, currentPrice: 890.00, totalValue: 44500, allocation: 18.8, equalWeight: 20.0, driftThreshold: 36.0, status: 'normal', change24h: -0.2 },
  { id: '11', ticker: 'TOTALENERGIES', companyName: 'TotalEnergies Marketing', shares: 120, currentPrice: 410.00, totalValue: 49200, allocation: 20.8, equalWeight: 20.0, driftThreshold: 36.0, status: 'normal', change24h: 1.0 },
  { id: '12', ticker: 'OANDO', companyName: 'Oando Plc', shares: 3000, currentPrice: 15.50, totalValue: 46500, allocation: 19.7, equalWeight: 20.0, driftThreshold: 36.0, status: 'normal', change24h: 0.3 },
  { id: '13', ticker: 'FBNH', companyName: 'FBN Holdings Plc', shares: 2000, currentPrice: 22.10, totalValue: 44200, allocation: 18.7, equalWeight: 20.0, driftThreshold: 36.0, status: 'normal', change24h: 0.8 },
];

// Portfolio 3 holdings
export const mockHoldingsPortfolio3: Holding[] = [
  { id: '14', ticker: 'BUAFOODS', companyName: 'BUA Foods Plc', shares: 400, currentPrice: 125.00, totalValue: 50000, allocation: 28.1, equalWeight: 16.67, driftThreshold: 23.33, status: 'drift', change24h: 2.0 },
  { id: '15', ticker: 'GEREGU', companyName: 'Geregu Power Plc', shares: 150, currentPrice: 480.00, totalValue: 72000, allocation: 14.5, equalWeight: 16.67, driftThreshold: 23.33, status: 'normal', change24h: -0.5 },
  { id: '16', ticker: 'TRANSCORP', companyName: 'Transnational Corp Plc', shares: 5000, currentPrice: 8.50, totalValue: 42500, allocation: 14.8, equalWeight: 16.67, driftThreshold: 23.33, status: 'normal', change24h: 1.5 },
  { id: '17', ticker: 'PRESCO', companyName: 'Presco Plc', shares: 200, currentPrice: 215.00, totalValue: 43000, allocation: 14.9, equalWeight: 16.67, driftThreshold: 23.33, status: 'normal', change24h: 0.2 },
  { id: '18', ticker: 'WAPCO', companyName: 'Lafarge Africa Plc', shares: 1200, currentPrice: 33.00, totalValue: 39600, allocation: 13.7, equalWeight: 16.67, driftThreshold: 23.33, status: 'normal', change24h: -0.8 },
  { id: '19', ticker: 'FLOURMILL', companyName: 'Flour Mills of Nigeria', shares: 1000, currentPrice: 40.00, totalValue: 40000, allocation: 14.0, equalWeight: 16.67, driftThreshold: 23.33, status: 'normal', change24h: 0.4 },
];

// Default holdings (portfolio 1) for backward compatibility
export const mockHoldings = mockHoldingsPortfolio1;

// Map portfolio ID to holdings
export const holdingsByPortfolio: Record<string, Holding[]> = {
  '1': mockHoldingsPortfolio1,
  '2': mockHoldingsPortfolio2,
  '3': mockHoldingsPortfolio3,
};

export const mockAlerts: DriftAlert[] = [
  { id: '1', portfolioId: '1', portfolioName: 'Core Growth Portfolio', ticker: 'GTCO', companyName: 'Guaranty Trust Holding Co.', triggeredAt: '2026-03-19T08:30:00Z', currentAllocation: 23.9, driftThreshold: 18.75, equalWeight: 12.5, status: 'unread', emailSent: true },
  { id: '2', portfolioId: '1', portfolioName: 'Core Growth Portfolio', ticker: 'DANGCEM', companyName: 'Dangote Cement Plc', triggeredAt: '2026-03-18T16:45:00Z', currentAllocation: 22.8, driftThreshold: 18.75, equalWeight: 12.5, status: 'unread', emailSent: true },
  { id: '3', portfolioId: '3', portfolioName: 'Emerging Leaders', ticker: 'BUAFOODS', companyName: 'BUA Foods Plc', triggeredAt: '2026-03-17T11:20:00Z', currentAllocation: 28.1, driftThreshold: 23.33, equalWeight: 16.67, status: 'read', emailSent: true },
  { id: '4', portfolioId: '1', portfolioName: 'Core Growth Portfolio', ticker: 'MTNN', companyName: 'MTN Nigeria Communications', triggeredAt: '2026-03-10T09:00:00Z', currentAllocation: 19.2, driftThreshold: 18.75, equalWeight: 12.5, status: 'resolved', emailSent: true },
  { id: '5', portfolioId: '2', portfolioName: 'Dividend Income', ticker: 'STANBIC', companyName: 'Stanbic IBTC Holdings', triggeredAt: '2026-03-05T14:30:00Z', currentAllocation: 25.0, driftThreshold: 22.0, equalWeight: 20.0, status: 'resolved', emailSent: false },
];

export const mockAllocationHistory: AllocationSnapshot[] = [
  { date: 'Jan', DANGCEM: 15.2, GTCO: 16.1, MTNN: 14.0, AIRTELAFRI: 13.5, BUACEMENT: 11.2, ZENITHBANK: 12.8, SEPLAT: 8.5, ACCESSCORP: 8.7 },
  { date: 'Feb', DANGCEM: 17.5, GTCO: 18.3, MTNN: 13.8, AIRTELAFRI: 12.9, BUACEMENT: 10.5, ZENITHBANK: 12.2, SEPLAT: 7.2, ACCESSCORP: 7.6 },
  { date: 'Mar', DANGCEM: 22.8, GTCO: 23.9, MTNN: 13.5, AIRTELAFRI: 12.3, BUACEMENT: 8.8, ZENITHBANK: 12.0, SEPLAT: 3.7, ACCESSCORP: 5.4 },
];

export const mockSecurities = [
  { ticker: 'DANGCEM', name: 'Dangote Cement Plc', exchange: 'NGX' },
  { ticker: 'GTCO', name: 'Guaranty Trust Holding Co.', exchange: 'NGX' },
  { ticker: 'MTNN', name: 'MTN Nigeria Communications', exchange: 'NGX' },
  { ticker: 'AIRTELAFRI', name: 'Airtel Africa Plc', exchange: 'NGX' },
  { ticker: 'BUACEMENT', name: 'BUA Cement Plc', exchange: 'NGX' },
  { ticker: 'ZENITHBANK', name: 'Zenith Bank Plc', exchange: 'NGX' },
  { ticker: 'SEPLAT', name: 'Seplat Energy Plc', exchange: 'NGX' },
  { ticker: 'ACCESSCORP', name: 'Access Holdings Plc', exchange: 'NGX' },
  { ticker: 'NESTLE', name: 'Nestle Nigeria Plc', exchange: 'NGX' },
  { ticker: 'STANBIC', name: 'Stanbic IBTC Holdings', exchange: 'NGX' },
  { ticker: 'FBNH', name: 'FBN Holdings Plc', exchange: 'NGX' },
  { ticker: 'OANDO', name: 'Oando Plc', exchange: 'NGX' },
  { ticker: 'BUAFOODS', name: 'BUA Foods Plc', exchange: 'NGX' },
  { ticker: 'GEREGU', name: 'Geregu Power Plc', exchange: 'NGX' },
  { ticker: 'TRANSCORP', name: 'Transnational Corp Plc', exchange: 'NGX' },
  { ticker: 'PRESCO', name: 'Presco Plc', exchange: 'NGX' },
  { ticker: 'WAPCO', name: 'Lafarge Africa Plc', exchange: 'NGX' },
  { ticker: 'FLOURMILL', name: 'Flour Mills of Nigeria', exchange: 'NGX' },
  { ticker: 'TOTALENERGIES', name: 'TotalEnergies Marketing', exchange: 'NGX' },
  { ticker: 'UBA', name: 'United Bank for Africa', exchange: 'NGX' },
];

export const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(value);

export const formatPercent = (value: number) => `${value.toFixed(1)}%`;

export const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

export const formatDateTime = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
