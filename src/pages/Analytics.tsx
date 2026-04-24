import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import AppLayout from "@/components/layout/AppLayout";
import { allocationApi, driftApi, portfoliosApi } from "@/lib/api";
import { formatPercent } from "@/lib/formatters";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from "recharts";
import { Clock } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/context/AuthContext";
import { getStoredActivePortfolioId, setStoredActivePortfolioId } from "@/lib/storage";

const COLORS = [
  "hsl(195, 65%, 28%)", "hsl(195, 50%, 42%)", "hsl(195, 40%, 55%)",
  "hsl(152, 55%, 38%)", "hsl(38, 92%, 50%)", "hsl(280, 40%, 55%)",
  "hsl(340, 50%, 55%)", "hsl(210, 30%, 65%)",
];

export default function Analytics() {
  const { user } = useAuth();
  const portfoliosQuery = useQuery({
    queryKey: ["portfolios"],
    queryFn: portfoliosApi.list,
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

  const pieData = (allocationQuery.data?.allocations ?? []).map((holding) => ({
    name: holding.ticker,
    value: holding.allocationWeight,
  }));

  const driftData = (driftQuery.data?.items ?? []).map((holding) => ({
    name: holding.ticker,
    allocation: holding.currentWeight,
    threshold: holding.driftThreshold,
    equalWeight: holding.equalWeight,
  }));

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto">
        <div className="page-header">
          <h1 className="page-title">Analytics</h1>
          <p className="page-subtitle">Portfolio allocation insights and drift patterns</p>
        </div>

        {portfolios.length > 0 ? (
          <div className="mb-6">
            <Select value={selectedPortfolioId} onValueChange={setSelectedPortfolioId}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Select portfolio" />
              </SelectTrigger>
              <SelectContent>
                {portfolios.map((portfolio) => (
                  <SelectItem key={portfolio.id} value={portfolio.id}>
                    {portfolio.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : null}

        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          <div className="card-elevated p-5">
            <h3 className="font-display font-semibold mb-4">Current Allocation</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={95} paddingAngle={2} dataKey="value">
                    {pieData.map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => `${value.toFixed(1)}%`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {(allocationQuery.data?.allocations ?? []).map((holding, index) => (
                <div key={holding.holdingId} className="flex items-center gap-2 text-sm">
                  <div
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ background: COLORS[index % COLORS.length] }}
                  />
                  <span className="font-medium">{holding.ticker}</span>
                  <span className="text-muted-foreground ml-auto">{formatPercent(holding.allocationWeight)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card-elevated p-5">
            <h3 className="font-display font-semibold mb-4">Allocation vs Drift Threshold</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={driftData} margin={{ top: 10, right: 20, left: -10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-20" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tickFormatter={(value) => `${value}%`} tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(value: number) => `${value.toFixed(1)}%`} />
                  <Bar dataKey="allocation" fill="hsl(195, 65%, 42%)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="threshold" fill="hsl(38, 92%, 50%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="card-elevated mb-6">
          <div className="p-5 border-b">
            <h3 className="font-display font-semibold">Drift Table</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Ticker</th>
                  <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">Allocation</th>
                  <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">Equal Weight</th>
                  <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">Threshold</th>
                  <th className="text-center text-xs font-medium text-muted-foreground px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {(driftQuery.data?.items ?? []).map((holding) => {
                  const exceeded = holding.currentWeight >= holding.driftThreshold;
                  return (
                    <tr key={holding.holdingId} className="border-b last:border-0">
                      <td className="px-5 py-3 font-medium">{holding.ticker}</td>
                      <td className="px-5 py-3 text-right">{formatPercent(holding.currentWeight)}</td>
                      <td className="px-5 py-3 text-right">{formatPercent(holding.equalWeight)}</td>
                      <td className="px-5 py-3 text-right">{formatPercent(holding.driftThreshold)}</td>
                      <td className="px-5 py-3 text-center">
                        <span className={exceeded ? "badge-destructive" : "badge-success"}>
                          {exceeded ? "Exceeded" : "Within Limit"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card-elevated p-5">
          <h3 className="font-display font-semibold mb-4">Historical Analytics</h3>
          <div className="h-56 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
              <Clock className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="font-display font-semibold text-muted-foreground">Coming Soon</p>
            <p className="text-xs text-muted-foreground mt-1 max-w-xs">
              Historical allocation snapshots will be shown here.
            </p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
