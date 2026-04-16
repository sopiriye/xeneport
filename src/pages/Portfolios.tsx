import { useQuery } from "@tanstack/react-query";
import AppLayout from "@/components/layout/AppLayout";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus, Briefcase, AlertTriangle } from "lucide-react";
import { portfoliosApi } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/formatters";

export default function Portfolios() {
  const portfoliosQuery = useQuery({
    queryKey: ["portfolios"],
    queryFn: portfoliosApi.list,
  });

  const portfolios = portfoliosQuery.data?.data ?? [];

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto">
        <div className="page-header flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="page-title">Portfolios</h1>
            <p className="page-subtitle">Manage your investment portfolios</p>
          </div>
          <Link to="/portfolios/new">
            <Button size="sm" className="gap-1.5">
              <Plus className="w-4 h-4" /> Create Portfolio
            </Button>
          </Link>
        </div>

        {portfoliosQuery.isLoading ? (
          <div className="card-elevated p-6 text-sm text-muted-foreground">Loading portfolios...</div>
        ) : portfoliosQuery.isError ? (
          <div className="card-elevated p-6 text-sm text-destructive">
            {portfoliosQuery.error instanceof Error ? portfoliosQuery.error.message : "Unable to load portfolios."}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {portfolios.map((portfolio) => (
              <Link
                key={portfolio.id}
                to={`/portfolios/${portfolio.id}`}
                className="card-elevated p-5 hover:shadow-md transition-shadow group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
                    <Briefcase className="w-5 h-5 text-accent-foreground" />
                  </div>
                  {portfolio.alertCount > 0 && (
                    <span className="badge-destructive flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> {portfolio.alertCount}
                    </span>
                  )}
                </div>
                <h3 className="font-display font-semibold mb-1">{portfolio.name}</h3>
                {portfolio.description && (
                  <p className="text-xs text-muted-foreground mb-3 line-clamp-1">{portfolio.description}</p>
                )}
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold">{formatCurrency(portfolio.currentTotalMarketValue)}</span>
                  <span className="text-muted-foreground">{portfolio.currentAssetCount} holdings</span>
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t">
                  <span className="text-xs text-muted-foreground">
                    Updated {formatDate(portfolio.lastRecalculatedAt ?? portfolio.updatedAt)}
                  </span>
                  <span className={portfolio.alertCount > 0 ? "badge-destructive" : "badge-success"}>
                    {portfolio.alertCount > 0 ? "Alert" : "Healthy"}
                  </span>
                </div>
              </Link>
            ))}

            <Link
              to="/portfolios/new"
              className="border-2 border-dashed rounded-xl p-5 flex flex-col items-center justify-center text-center hover:border-primary/30 hover:bg-accent/30 transition-colors min-h-[200px]"
            >
              <Plus className="w-8 h-8 text-muted-foreground mb-2" />
              <p className="text-sm font-medium text-muted-foreground">Create New Portfolio</p>
            </Link>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
