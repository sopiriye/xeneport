import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import AppLayout from "@/components/layout/AppLayout";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  Briefcase,
  BarChart3,
  Bell,
  ArrowRight,
  Plus,
  Clock,
} from "lucide-react";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
} from "recharts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { alertsApi, allocationApi, driftApi, portfoliosApi } from "@/lib/api";
import { formatCurrency, formatPercent } from "@/lib/formatters";
import { getStoredActivePortfolioId, setStoredActivePortfolioId } from "@/lib/storage";
import { useAuth } from "@/context/AuthContext";

const CHART_COLORS = [
  "hsl(195, 65%, 28%)",
  "hsl(195, 50%, 42%)",
  "hsl(195, 40%, 55%)",
  "hsl(152, 55%, 38%)",
  "hsl(38, 92%, 50%)",
  "hsl(280, 40%, 55%)",
  "hsl(340, 50%, 55%)",
  "hsl(210, 30%, 65%)",
];

export default function Dashboard() {
  const { user } = useAuth();
  const portfoliosQuery = useQuery({
    queryKey: ["portfolios"],
    queryFn: portfoliosApi.list,
  });
  const alertsQuery = useQuery({
    queryKey: ["alerts", "dashboard"],
    queryFn: () => alertsApi.list({ channel: "in_app", status: "unread", limit: 20 }),
  });
  const portfolios = portfoliosQuery.data?.data ?? [];
  const [selectedPortfolioId, setSelectedPortfolioId] = useState("");

  useEffect(() => {
    if (!portfolios.length) {
      return;
    }

    const storedPortfolioId = getStoredActivePortfolioId(user?.id);
    const nextPortfolioId =
      portfolios.find((portfolio) => portfolio.id === storedPortfolioId)?.id ??
      portfolios[0].id;

    setSelectedPortfolioId((currentValue) => currentValue || nextPortfolioId);
  }, [portfolios, user?.id]);

  useEffect(() => {
    if (selectedPortfolioId && user?.id) {
      setStoredActivePortfolioId(user.id, selectedPortfolioId);
    }
  }, [selectedPortfolioId, user?.id]);

  const allocationQuery = useQuery({
    queryKey: ["allocation", selectedPortfolioId],
    queryFn: () => allocationApi.getByPortfolio(selectedPortfolioId),
    enabled: Boolean(selectedPortfolioId),
  });
  const driftQuery = useQuery({
    queryKey: ["drift", selectedPortfolioId],
    queryFn: () => driftApi.getByPortfolio(selectedPortfolioId),
    enabled: Boolean(selectedPortfolioId),
  });

  const selectedHoldings = allocationQuery.data?.allocations ?? [];
  const driftItems = driftQuery.data?.items ?? [];
  const pieData = selectedHoldings.map((holding) => ({
    name: holding.ticker,
    value: holding.allocationWeight,
  }));
  const totalValue = portfolios.reduce(
    (sum, portfolio) => sum + portfolio.currentTotalMarketValue,
    0,
  );
  const unreadAlerts = alertsQuery.data?.data ?? [];
  const driftHoldings = driftItems.filter((holding) => holding.hasDrift);
  const topHoldingsLink = selectedPortfolioId ? `/portfolios/${selectedPortfolioId}` : "/portfolios";

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto">
        <div className="page-header flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="page-title">Dashboard</h1>
            <p className="page-subtitle">Your portfolio overview at a glance</p>
          </div>
          <Link to="/portfolios/new">
            <Button size="sm" className="gap-1.5">
              <Plus className="w-4 h-4" /> New Portfolio
            </Button>
          </Link>
        </div>

        {driftHoldings.length > 0 && (
          <div className="mb-6 rounded-xl border border-destructive/20 bg-destructive/5 p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-destructive mt-0.5 shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium">
                {driftHoldings.length} holding{driftHoldings.length > 1 ? "s" : ""} exceeded drift threshold
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {driftHoldings.map((holding) => `${holding.ticker} (${formatPercent(holding.currentWeight)})`).join(", ")}. Review the allocation.
              </p>
            </div>
            <Link to="/alerts">
              <Button variant="outline" size="sm">View Alerts</Button>
            </Link>
          </div>
        )}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          <div className="stat-card">
            <p className="text-xs text-muted-foreground">Total Value</p>
            <p className="text-xl font-display font-bold">{formatCurrency(totalValue)}</p>
          </div>
          <div className="stat-card">
            <div className="flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">Portfolios</p>
            </div>
            <p className="text-xl font-display font-bold">{portfolios.length}</p>
          </div>
          <div className="stat-card">
            <div className="flex items-center gap-1.5">
              <BarChart3 className="w-3.5 h-3.5 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">Holdings</p>
            </div>
            <p className="text-xl font-display font-bold">
              {portfolios.reduce((sum, portfolio) => sum + portfolio.currentAssetCount, 0)}
            </p>
          </div>
          <div className="stat-card">
            <div className="flex items-center gap-1.5">
              <Bell className="w-3.5 h-3.5 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">Active Alerts</p>
            </div>
            <p className="text-xl font-display font-bold text-destructive">
              {alertsQuery.data?.meta.unreadCount ?? 0}
            </p>
          </div>
        </div>

        {portfolios.length === 0 ? (
          <div className="card-elevated p-8 text-center">
            <h3 className="font-display font-semibold mb-2">No portfolios yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Create your first portfolio to start monitoring allocation drift.
            </p>
            <Link to="/portfolios/new">
              <Button>Create Portfolio</Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-2">
              <Select value={selectedPortfolioId} onValueChange={setSelectedPortfolioId}>
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="Select portfolio" />
                </SelectTrigger>
                <SelectContent>
                  {portfolios.map((portfolio) => (
                    <SelectItem key={portfolio.id} value={portfolio.id}>{portfolio.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 card-elevated p-5">
                <h3 className="font-display font-semibold mb-4">Allocation Distribution</h3>
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  <div className="w-48 h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={80}
                          paddingAngle={2}
                          dataKey="value"
                        >
                          {pieData.map((_, index) => (
                            <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value: number) => `${value.toFixed(1)}%`} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex-1 grid grid-cols-2 gap-2 w-full">
                    {selectedHoldings.map((holding, index) => (
                      <div key={holding.holdingId} className="flex items-center gap-2 text-sm">
                        <div
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ background: CHART_COLORS[index % CHART_COLORS.length] }}
                        />
                        <span className="font-medium">{holding.ticker}</span>
                        <span className="text-muted-foreground ml-auto">{formatPercent(holding.allocationWeight)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="card-elevated p-5">
                <h3 className="font-display font-semibold mb-1">Drift Status</h3>
                <p className="text-xs text-muted-foreground mb-4">
                  Equal weight: {formatPercent(driftQuery.data?.portfolio.currentEqualWeight ?? 0)} • Threshold: {formatPercent(driftQuery.data?.portfolio.currentDriftThreshold ?? 0)}
                </p>
                <div className="space-y-2.5">
                  {driftItems.slice(0, 6).map((holding) => (
                    <div key={holding.holdingId} className="flex items-center gap-3">
                      <span className="text-sm font-medium w-20 truncate">{holding.ticker}</span>
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${holding.hasDrift ? "bg-destructive" : "bg-primary"}`}
                          style={{ width: `${Math.min((holding.currentWeight / Math.max(holding.driftThreshold, 1)) * 100, 100)}%` }}
                        />
                      </div>
                      <span className={`text-xs font-medium w-12 text-right ${holding.hasDrift ? "text-destructive" : "text-muted-foreground"}`}>
                        {formatPercent(holding.currentWeight)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="card-elevated p-5 mt-6">
              <h3 className="font-display font-semibold mb-4">Allocation Trend</h3>
              <div className="h-64 flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                  <Clock className="w-6 h-6 text-muted-foreground" />
                </div>
                <p className="font-display font-semibold text-muted-foreground">Coming Soon</p>
                <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                  Allocation trend analytics will be available here once enough historical data has been captured.
                </p>
              </div>
            </div>

            <div className="card-elevated mt-6">
              <div className="p-5 border-b flex items-center justify-between">
                <h3 className="font-display font-semibold">Top Holdings</h3>
                <Link to={topHoldingsLink} className="text-sm text-primary hover:underline flex items-center gap-1">
                  View all <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Asset</th>
                      <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">Units</th>
                      <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">Price</th>
                      <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">Value</th>
                      <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">Allocation</th>
                      <th className="text-center text-xs font-medium text-muted-foreground px-5 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedHoldings.map((holding) => (
                      <tr key={holding.holdingId} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                        <td className="px-5 py-3">
                          <div>
                            <span className="font-semibold text-sm">{holding.ticker}</span>
                            <p className="text-xs text-muted-foreground">{holding.companyName}</p>
                          </div>
                        </td>
                        <td className="text-right px-5 py-3 text-sm">{holding.shares}</td>
                        <td className="text-right px-5 py-3 text-sm">{formatCurrency(holding.marketPrice)}</td>
                        <td className="text-right px-5 py-3 text-sm font-medium">{formatCurrency(holding.marketValue)}</td>
                        <td className="text-right px-5 py-3 text-sm font-medium">{formatPercent(holding.allocationWeight)}</td>
                        <td className="text-center px-5 py-3">
                          <span className={driftItems.find((item) => item.holdingId === holding.holdingId)?.hasDrift ? "badge-destructive" : "badge-success"}>
                            {driftItems.find((item) => item.holdingId === holding.holdingId)?.hasDrift ? "Drift" : "Normal"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="card-elevated mt-6">
              <div className="p-5 border-b flex items-center justify-between">
                <h3 className="font-display font-semibold">Recent Alerts</h3>
                <Link to="/alerts" className="text-sm text-primary hover:underline flex items-center gap-1">
                  View all <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
              <div className="divide-y">
                {unreadAlerts.slice(0, 3).map((alert) => (
                  <div key={alert.id} className="px-5 py-3 flex items-center gap-4">
                    <div className={`w-2 h-2 rounded-full shrink-0 ${alert.status === "unread" ? "bg-destructive" : "bg-muted-foreground/30"}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">
                        <span className="font-semibold">{alert.title}</span>
                      </p>
                      <p className="text-xs text-muted-foreground">{alert.message}</p>
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {new Date(alert.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
}
