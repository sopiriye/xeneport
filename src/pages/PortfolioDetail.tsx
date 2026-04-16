import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import AppLayout from "@/components/layout/AppLayout";
import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft, Plus, Edit2, Trash2, Settings2, Clock, Search,
} from "lucide-react";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
} from "recharts";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { alertsApi, allocationApi, driftApi, holdingsApi, portfoliosApi, securitiesApi } from "@/lib/api";
import { formatCurrency, formatPercent } from "@/lib/formatters";
import { setStoredActivePortfolioId } from "@/lib/storage";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

const COLORS = [
  "hsl(195, 65%, 28%)", "hsl(195, 50%, 42%)", "hsl(195, 40%, 55%)",
  "hsl(152, 55%, 38%)", "hsl(38, 92%, 50%)", "hsl(280, 40%, 55%)",
  "hsl(340, 50%, 55%)", "hsl(210, 30%, 65%)",
];

export default function PortfolioDetail() {
  const { id } = useParams();
  const portfolioId = id ?? "";
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [driftModalOpen, setDriftModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingHoldingId, setEditingHoldingId] = useState<string | null>(null);
  const [holdingToDeleteId, setHoldingToDeleteId] = useState<string | null>(null);
  const [editShares, setEditShares] = useState("");
  const [addShares, setAddShares] = useState("");
  const [multiplier, setMultiplier] = useState([1.5]);
  const [tickerSearch, setTickerSearch] = useState("");
  const [selectedTicker, setSelectedTicker] = useState<{ ticker: string; name: string } | null>(null);

  const portfolioQuery = useQuery({
    queryKey: ["portfolio", portfolioId],
    queryFn: () => portfoliosApi.getById(portfolioId),
    enabled: Boolean(portfolioId),
  });
  const holdingsQuery = useQuery({
    queryKey: ["holdings", portfolioId],
    queryFn: () => holdingsApi.listByPortfolio(portfolioId),
    enabled: Boolean(portfolioId),
  });
  const allocationQuery = useQuery({
    queryKey: ["allocation", portfolioId],
    queryFn: () => allocationApi.getByPortfolio(portfolioId),
    enabled: Boolean(portfolioId),
  });
  const driftQuery = useQuery({
    queryKey: ["drift", portfolioId],
    queryFn: () => driftApi.getByPortfolio(portfolioId),
    enabled: Boolean(portfolioId),
  });
  const alertsQuery = useQuery({
    queryKey: ["alerts", "portfolio", portfolioId],
    queryFn: () => alertsApi.list({ channel: "in_app", portfolioId, limit: 20 }),
    enabled: Boolean(portfolioId),
  });
  const securitiesQuery = useQuery({
    queryKey: ["securities", tickerSearch],
    queryFn: () => securitiesApi.search(tickerSearch),
    enabled: tickerSearch.trim().length > 0,
  });

  useEffect(() => {
    if (portfolioQuery.data) {
      setMultiplier([portfolioQuery.data.driftMultiplier]);

      if (user?.id) {
        setStoredActivePortfolioId(user.id, portfolioQuery.data.id);
      }
    }
  }, [portfolioQuery.data, user?.id]);

  const portfolio = portfolioQuery.data;
  const holdings = holdingsQuery.data?.data ?? [];
  const allocations = allocationQuery.data?.allocations ?? [];
  const driftItems = driftQuery.data?.items ?? [];
  const portfolioAlerts = alertsQuery.data?.data ?? [];
  const pieData = allocations.map((holding) => ({ name: holding.ticker, value: holding.allocationWeight }));
  const totalValue = allocationQuery.data?.summary.totalMarketValue ?? portfolio?.currentTotalMarketValue ?? 0;
  const editingHolding = holdings.find((holding) => holding.id === editingHoldingId) ?? null;
  const holdingToDelete = holdings.find((holding) => holding.id === holdingToDeleteId) ?? null;
  const existingTickers = holdings.map((holding) => holding.ticker);
  const filteredSecurities = (securitiesQuery.data?.data ?? []).filter(
    (security) => !existingTickers.includes(security.ticker),
  );

  const invalidatePortfolioQueries = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["portfolios"] }),
      queryClient.invalidateQueries({ queryKey: ["portfolio", portfolioId] }),
      queryClient.invalidateQueries({ queryKey: ["holdings", portfolioId] }),
      queryClient.invalidateQueries({ queryKey: ["allocation", portfolioId] }),
      queryClient.invalidateQueries({ queryKey: ["drift", portfolioId] }),
      queryClient.invalidateQueries({ queryKey: ["alerts"] }),
    ]);
  };

  const addHoldingMutation = useMutation({
    mutationFn: () =>
      holdingsApi.create({
        portfolioId,
        ticker: selectedTicker!.ticker,
        shares: Number(addShares),
      }),
    onSuccess: async (response) => {
      await invalidatePortfolioQueries();
      setAddModalOpen(false);
      setTickerSearch("");
      setSelectedTicker(null);
      setAddShares("");
      toast.success(response.message);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Unable to add holding");
    },
  });

  const updateHoldingMutation = useMutation({
    mutationFn: () => holdingsApi.update(editingHoldingId!, { shares: Number(editShares) }),
    onSuccess: async (response) => {
      await invalidatePortfolioQueries();
      setEditModalOpen(false);
      setEditingHoldingId(null);
      toast.success(response.message);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Unable to update holding");
    },
  });

  const deleteHoldingMutation = useMutation({
    mutationFn: () => holdingsApi.remove(holdingToDeleteId!),
    onSuccess: async (response) => {
      await invalidatePortfolioQueries();
      setDeleteModalOpen(false);
      setHoldingToDeleteId(null);
      toast.success(response.message);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Unable to remove holding");
    },
  });

  const updateDriftMutation = useMutation({
    mutationFn: () => portfoliosApi.updateDriftMultiplier(portfolioId, { driftMultiplier: multiplier[0] }),
    onSuccess: async (response) => {
      await invalidatePortfolioQueries();
      setDriftModalOpen(false);
      toast.success(response.message);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Unable to update drift multiplier");
    },
  });

  const openEditModal = (holdingId: string, shares: number) => {
    setEditingHoldingId(holdingId);
    setEditShares(String(shares));
    setEditModalOpen(true);
  };

  const openAddModal = () => {
    setTickerSearch("");
    setSelectedTicker(null);
    setAddShares("");
    setAddModalOpen(true);
  };

  const handleAddHolding = () => {
    if (!selectedTicker || Number(addShares) < 1) {
      toast.error("Select a ticker and enter at least 1 share.");
      return;
    }

    addHoldingMutation.mutate();
  };

  const handleUpdateHolding = () => {
    if (!editingHoldingId || Number(editShares) < 1) {
      toast.error("Enter at least 1 share.");
      return;
    }

    updateHoldingMutation.mutate();
  };

  const holdingDriftLookup = new Map(
    driftItems.map((item) => [item.holdingId, item]),
  );

  if (!portfolioId) {
    return (
      <AppLayout>
        <div className="card-elevated p-6 text-sm text-destructive">Portfolio id is missing.</div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto">
        <Link to="/portfolios" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="w-3.5 h-3.5" /> Portfolios
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="page-title">{portfolio?.name ?? "Loading..."}</h1>
            <p className="page-subtitle">{portfolio?.description ?? "Portfolio allocation and holdings overview"}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setDriftModalOpen(true)} className="gap-1.5">
              <Settings2 className="w-3.5 h-3.5" /> Drift Settings
            </Button>
            <Button size="sm" onClick={openAddModal} className="gap-1.5">
              <Plus className="w-4 h-4" /> Add Holding
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          <div className="stat-card">
            <p className="text-xs text-muted-foreground">Total Value</p>
            <p className="text-xl font-display font-bold">{formatCurrency(totalValue)}</p>
          </div>
          <div className="stat-card">
            <p className="text-xs text-muted-foreground">Holdings</p>
            <p className="text-xl font-display font-bold">{holdings.length}</p>
          </div>
          <div className="stat-card">
            <p className="text-xs text-muted-foreground">Drift Multiplier</p>
            <p className="text-xl font-display font-bold">{multiplier[0].toFixed(1)}x</p>
          </div>
          <div className="stat-card">
            <p className="text-xs text-muted-foreground">Active Alerts</p>
            <p className="text-xl font-display font-bold text-destructive">
              {portfolioAlerts.filter((alert) => alert.status === "unread").length}
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2 card-elevated p-5">
            <h3 className="font-display font-semibold mb-4">Allocation</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={2} dataKey="value">
                    {pieData.map((_, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(value: number) => `${value.toFixed(1)}%`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card-elevated p-5">
            <h3 className="font-display font-semibold mb-4">Recent Alerts</h3>
            {portfolioAlerts.length > 0 ? (
              <div className="space-y-3">
                {portfolioAlerts.slice(0, 4).map((alert) => (
                  <div key={alert.id} className="flex items-start gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${alert.status === "unread" ? "bg-destructive" : "bg-muted-foreground/30"}`} />
                    <div>
                      <p className="text-sm">{alert.title}</p>
                      <p className="text-xs text-muted-foreground">{new Date(alert.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No alerts yet</p>
            )}
          </div>
        </div>

        <div className="card-elevated">
          <div className="p-5 border-b">
            <h3 className="font-display font-semibold">Holdings</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Asset</th>
                  <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">Units</th>
                  <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">Price</th>
                  <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">Value</th>
                  <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">Weight</th>
                  <th className="text-center text-xs font-medium text-muted-foreground px-5 py-3">Status</th>
                  <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {holdings.map((holding) => {
                  const driftItem = holdingDriftLookup.get(holding.id);
                  return (
                    <tr key={holding.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="px-5 py-3">
                        <span className="font-semibold text-sm">{holding.ticker}</span>
                        <p className="text-xs text-muted-foreground">{holding.companyName}</p>
                      </td>
                      <td className="text-right px-5 py-3 text-sm">{holding.shares}</td>
                      <td className="text-right px-5 py-3 text-sm">{formatCurrency(holding.currentMarketPrice)}</td>
                      <td className="text-right px-5 py-3 text-sm font-medium">{formatCurrency(holding.currentMarketValue)}</td>
                      <td className="text-right px-5 py-3 text-sm font-medium">{formatPercent(holding.currentWeight)}</td>
                      <td className="text-center px-5 py-3">
                        <span className={driftItem?.hasDrift ? "badge-destructive" : "badge-success"}>
                          {driftItem?.hasDrift ? "Drift" : "Normal"}
                        </span>
                      </td>
                      <td className="text-right px-5 py-3">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEditModal(holding.id, holding.shares)}>
                            <Edit2 className="w-3.5 h-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => { setHoldingToDeleteId(holding.id); setDeleteModalOpen(true); }}>
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card-elevated p-5 mt-6">
          <h3 className="font-display font-semibold mb-4">Allocation History</h3>
          <div className="h-56 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
              <Clock className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="font-display font-semibold text-muted-foreground">Coming Soon</p>
            <p className="text-xs text-muted-foreground mt-1 max-w-xs">
              Historical allocation data will appear here as your portfolio is tracked over time.
            </p>
          </div>
        </div>
      </div>

      <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display">Add Holding</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Stock Ticker</Label>
              {selectedTicker ? (
                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-muted/50">
                  <div className="flex-1">
                    <span className="font-semibold text-sm">{selectedTicker.ticker}</span>
                    <span className="text-xs text-muted-foreground ml-2">{selectedTicker.name}</span>
                  </div>
                  <button
                    onClick={() => setSelectedTicker(null)}
                    className="text-xs text-muted-foreground hover:text-destructive"
                  >
                    Change
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search NGX stocks..."
                    className="pl-9"
                    value={tickerSearch}
                    onChange={(event) => setTickerSearch(event.target.value)}
                  />
                </div>
              )}
              {!selectedTicker && tickerSearch && (
                <div className="border rounded-lg max-h-40 overflow-y-auto">
                  {filteredSecurities.slice(0, 8).map((security) => (
                    <button
                      key={security.ticker}
                      onClick={() => {
                        setSelectedTicker({ ticker: security.ticker, name: security.companyName });
                        setTickerSearch("");
                      }}
                      className="w-full flex items-center justify-between px-3 py-2 hover:bg-muted transition-colors text-left text-sm"
                    >
                      <div>
                        <span className="font-semibold">{security.ticker}</span>
                        <span className="text-muted-foreground ml-2">{security.companyName}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">{security.exchange.tickerPrefix}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label>Number of Units</Label>
              <Input type="number" placeholder="e.g., 500" value={addShares} onChange={(event) => setAddShares(event.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddModalOpen(false)}>Cancel</Button>
            <Button onClick={handleAddHolding} disabled={addHoldingMutation.isPending}>
              {addHoldingMutation.isPending ? "Adding..." : "Add Holding"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display">Edit Holding</DialogTitle>
          </DialogHeader>
          {editingHolding && (
            <div className="space-y-4 py-2">
              <div className="p-3 rounded-lg bg-muted/50">
                <span className="font-semibold text-sm">{editingHolding.ticker}</span>
                <p className="text-xs text-muted-foreground">{editingHolding.companyName}</p>
              </div>
              <div className="space-y-2">
                <Label>Number of Units</Label>
                <Input
                  type="number"
                  value={editShares}
                  onChange={(event) => setEditShares(event.target.value)}
                  placeholder="e.g., 500"
                />
                <p className="text-xs text-muted-foreground">
                  Current: {editingHolding.shares} units @ {formatCurrency(editingHolding.currentMarketPrice)} each
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditModalOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdateHolding} disabled={updateHoldingMutation.isPending}>
              {updateHoldingMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display">Remove Holding</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            {holdingToDelete ? `Remove ${holdingToDelete.ticker} from this portfolio?` : "Are you sure you want to remove this holding?"}
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteHoldingMutation.mutate()} disabled={deleteHoldingMutation.isPending}>
              {deleteHoldingMutation.isPending ? "Removing..." : "Remove"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={driftModalOpen} onOpenChange={setDriftModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display">Drift Multiplier Settings</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="flex justify-between items-center">
              <Label>Drift Multiplier</Label>
              <span className="text-xl font-display font-bold text-primary">{multiplier[0].toFixed(1)}x</span>
            </div>
            <Slider value={multiplier} onValueChange={setMultiplier} min={1.1} max={3.0} step={0.1} />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>More Conservative</span>
              <span>More Aggressive</span>
            </div>
            <div className="space-y-2 text-sm pt-2 border-t">
              <div className="flex justify-between text-muted-foreground">
                <span>Equal weight</span><span className="text-foreground font-medium">{formatPercent(portfolio?.currentEqualWeight ?? 0)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Drift threshold</span><span className="text-primary font-medium">{formatPercent((portfolio?.currentEqualWeight ?? 0) * multiplier[0])}</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Alerts trigger when any asset exceeds {formatPercent((portfolio?.currentEqualWeight ?? 0) * multiplier[0])} allocation.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDriftModalOpen(false)}>Cancel</Button>
            <Button onClick={() => updateDriftMutation.mutate()} disabled={updateDriftMutation.isPending}>
              {updateDriftMutation.isPending ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
