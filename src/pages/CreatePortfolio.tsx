import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { ArrowLeft, ArrowRight, Search, X } from "lucide-react";
import { holdingsApi, portfoliosApi, securitiesApi } from "@/lib/api";
import { setStoredActivePortfolioId } from "@/lib/storage";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

export default function CreatePortfolio() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<{ ticker: string; name: string; shares: string }[]>([]);
  const [multiplier, setMultiplier] = useState([1.5]);

  const securitiesQuery = useQuery({
    queryKey: ["securities", search],
    queryFn: () => securitiesApi.search(search),
    enabled: search.trim().length > 0,
  });

  const filtered = (securitiesQuery.data?.data ?? []).filter(
    (security) =>
      !selected.find((item) => item.ticker === security.ticker) &&
      (security.ticker.toLowerCase().includes(search.toLowerCase()) ||
        security.companyName.toLowerCase().includes(search.toLowerCase())),
  );

  const addSecurity = (ticker: string, securityName: string) => {
    setSelected((previous) => [...previous, { ticker, name: securityName, shares: "" }]);
    setSearch("");
  };

  const removeSecurity = (ticker: string) => {
    setSelected((previous) => previous.filter((security) => security.ticker !== ticker));
  };

  const updateShares = (ticker: string, shares: string) => {
    setSelected((previous) =>
      previous.map((security) =>
        security.ticker === ticker ? { ...security, shares } : security,
      ),
    );
  };

  const numAssets = selected.length || 1;
  const eqWeight = (100 / numAssets).toFixed(1);
  const threshold = ((100 / numAssets) * multiplier[0]).toFixed(1);

  const createPortfolioMutation = useMutation({
    mutationFn: async () => {
      const portfolioResponse = await portfoliosApi.create({
        name,
        description: description.trim() || undefined,
        driftMultiplier: multiplier[0],
      });

      for (const holding of selected) {
        await holdingsApi.create({
          portfolioId: portfolioResponse.portfolio.id,
          ticker: holding.ticker,
          shares: Number(holding.shares),
        });
      }

      return portfolioResponse.portfolio.id;
    },
    onSuccess: (portfolioId) => {
      if (user?.id) {
        setStoredActivePortfolioId(user.id, portfolioId);
      }

      toast.success("Portfolio created successfully");
      navigate(`/portfolios/${portfolioId}`);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Unable to create portfolio");
    },
  });

  const handleCreatePortfolio = () => {
    if (selected.some((holding) => Number(holding.shares) < 1)) {
      toast.error("Each selected holding must have at least 1 share.");
      return;
    }

    createPortfolioMutation.mutate();
  };

  return (
    <AppLayout>
      <div className="max-w-xl mx-auto">
        <Link to="/portfolios" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Portfolios
        </Link>

        <h1 className="page-title mb-1">Create Portfolio</h1>
        <p className="page-subtitle mb-6">Set up a new portfolio to monitor</p>

        <div className="flex gap-1.5 mb-8">
          {["Details", "Holdings", "Drift Settings"].map((label, index) => (
            <button
              key={label}
              onClick={() => index <= step && setStep(index)}
              className={`flex-1 text-center py-2 text-xs font-medium rounded-lg transition-colors ${
                index === step ? "bg-primary text-primary-foreground" : index < step ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {step === 0 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Portfolio Name *</Label>
              <Input placeholder="e.g., Core Growth Portfolio" value={name} onChange={(event) => setName(event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input placeholder="Optional description" value={description} onChange={(event) => setDescription(event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Base Currency</Label>
              <Input value="NGN" disabled />
              <p className="text-xs text-muted-foreground">Nigerian Naira is the default currency</p>
            </div>
            <div className="flex justify-end pt-4">
              <Button onClick={() => setStep(1)} disabled={!name.trim()} className="gap-1.5">
                Next <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search NGX stocks by ticker or name..."
                className="pl-9"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>

            {search && (
              <div className="card-elevated max-h-48 overflow-y-auto">
                {filtered.slice(0, 8).map((security) => (
                  <button
                    key={security.ticker}
                    onClick={() => addSecurity(security.ticker, security.companyName)}
                    className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-muted transition-colors text-left"
                  >
                    <div>
                      <span className="font-semibold text-sm">{security.ticker}</span>
                      <span className="text-sm text-muted-foreground ml-2">{security.companyName}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{security.exchange.tickerPrefix}</span>
                  </button>
                ))}
              </div>
            )}

            {selected.length > 0 ? (
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Selected Holdings ({selected.length})</Label>
                {selected.map((security) => (
                  <div key={security.ticker} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <div className="flex-1 min-w-0">
                      <span className="font-semibold text-sm">{security.ticker}</span>
                      <span className="text-xs text-muted-foreground ml-2">{security.name}</span>
                    </div>
                    <Input
                      type="number"
                      placeholder="Units"
                      className="w-24"
                      value={security.shares}
                      onChange={(event) => updateShares(security.ticker, event.target.value)}
                    />
                    <button onClick={() => removeSecurity(security.ticker)} className="text-muted-foreground hover:text-destructive">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state py-12">
                <p className="text-sm text-muted-foreground">Search and add NGX stocks to your portfolio</p>
              </div>
            )}

            <div className="flex justify-between pt-4">
              <Button variant="ghost" onClick={() => setStep(0)} className="gap-1.5">
                <ArrowLeft className="w-4 h-4" /> Back
              </Button>
              <Button onClick={() => setStep(2)} disabled={selected.length === 0} className="gap-1.5">
                Next <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div className="card-elevated p-5">
              <div className="flex justify-between items-center mb-4">
                <Label>Drift Multiplier</Label>
                <span className="text-2xl font-display font-bold text-primary">{multiplier[0].toFixed(1)}x</span>
              </div>
              <Slider value={multiplier} onValueChange={setMultiplier} min={1.1} max={3.0} step={0.1} className="mb-4" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>More Conservative</span>
                <span>More Aggressive</span>
              </div>
            </div>

            <div className="card-elevated p-5 space-y-3">
              <h4 className="text-sm font-semibold">Threshold Preview</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Assets in portfolio</span>
                  <span className="font-medium text-foreground">{numAssets}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Equal weight</span>
                  <span className="font-medium text-foreground">{eqWeight}%</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Drift threshold</span>
                  <span className="font-medium text-primary">{threshold}%</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground pt-2 border-t">
                Any asset exceeding <strong>{threshold}%</strong> allocation triggers an alert.
              </p>
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="ghost" onClick={() => setStep(1)} className="gap-1.5">
                <ArrowLeft className="w-4 h-4" /> Back
              </Button>
              <Button className="gap-1.5" onClick={handleCreatePortfolio} disabled={createPortfolioMutation.isPending}>
                {createPortfolioMutation.isPending ? "Creating..." : "Create Portfolio"}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
