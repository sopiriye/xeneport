import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Bell, Mail, AlertTriangle, Info } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { alertsApi } from "@/lib/api";
import { formatDateTime, formatPercent } from "@/lib/formatters";
import { toast } from "sonner";

export default function Alerts() {
  const queryClient = useQueryClient();
  const [selectedAlertId, setSelectedAlertId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");

  const alertsQuery = useQuery({
    queryKey: ["alerts", filter],
    queryFn: () =>
      alertsApi.list({
        channel: "in_app",
        status: filter === "all" ? undefined : filter,
        limit: 50,
      }),
  });

  const selectedAlertQuery = useQuery({
    queryKey: ["alert", selectedAlertId],
    queryFn: () => alertsApi.getById(selectedAlertId!),
    enabled: Boolean(selectedAlertId),
  });

  const markAsReadMutation = useMutation({
    mutationFn: (alertId: string) => alertsApi.markAsRead(alertId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["alerts"] });
      if (selectedAlertId) {
        void queryClient.invalidateQueries({ queryKey: ["alert", selectedAlertId] });
      }
      toast.success("Alert marked as read");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Unable to update alert");
    },
  });

  const alerts = alertsQuery.data?.data ?? [];
  const selectedAlert = selectedAlertQuery.data ?? null;
  const unreadCount = alertsQuery.data?.meta.unreadCount ?? 0;

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto">
        <div className="page-header">
          <h1 className="page-title">Drift Alerts</h1>
          <p className="page-subtitle">Monitor and review portfolio drift events</p>
        </div>

        <div className="flex gap-1.5 mb-6">
          {(["all", "unread", "read"] as const).map((value) => (
            <button
              key={value}
              onClick={() => setFilter(value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize ${
                filter === value ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {value}
              {value === "all" ? ` (${alerts.length})` : value === "unread" ? ` (${unreadCount})` : ""}
            </button>
          ))}
        </div>

        {alerts.length > 0 ? (
          <div className="card-elevated divide-y">
            {alerts.map((alert) => (
              <button
                key={alert.id}
                onClick={() => setSelectedAlertId(alert.id)}
                className="w-full text-left px-5 py-4 flex items-start gap-4 hover:bg-muted/30 transition-colors"
              >
                <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${
                  alert.status === "unread" ? "bg-destructive" : "bg-warning"
                }`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-sm">{alert.title}</span>
                    <span className="text-xs text-muted-foreground">in {alert.portfolio?.name ?? "Portfolio"}</span>
                    {alert.channel === "email" && <Mail className="w-3 h-3 text-muted-foreground" />}
                  </div>
                  <p className="text-sm text-muted-foreground">{alert.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">{formatDateTime(alert.createdAt)}</p>
                </div>
                <span className={alert.status === "unread" ? "badge-destructive" : "badge-warning"}>
                  {alert.status}
                </span>
              </button>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon">
              <Bell className="w-7 h-7" />
            </div>
            <h3 className="font-display font-semibold mb-1">No alerts</h3>
            <p className="text-sm text-muted-foreground">No drift alerts match this filter.</p>
          </div>
        )}
      </div>

      <Dialog open={!!selectedAlertId} onOpenChange={() => setSelectedAlertId(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              Drift Alert
            </DialogTitle>
          </DialogHeader>
          {selectedAlert && (
            <div className="space-y-4 py-2">
              <div className="card-elevated p-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Title</span>
                  <span className="font-semibold">{selectedAlert.title}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Portfolio</span>
                  <span className="font-medium">{selectedAlert.portfolio?.name ?? "N/A"}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Current Allocation</span>
                  <span className="font-bold text-destructive">
                    {formatPercent(selectedAlert.driftEvent?.assetWeight ?? 0)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Equal Weight</span>
                  <span>{formatPercent(selectedAlert.driftEvent?.equalWeight ?? 0)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Drift Threshold</span>
                  <span className="text-primary font-medium">
                    {formatPercent(selectedAlert.driftEvent?.driftThreshold ?? 0)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Triggered</span>
                  <span>{formatDateTime(selectedAlert.createdAt)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Status</span>
                  <span>{selectedAlert.status}</span>
                </div>
              </div>

              <div className="rounded-lg bg-accent/50 p-4 flex gap-3">
                <Info className="w-4 h-4 text-accent-foreground mt-0.5 shrink-0" />
                <div className="text-sm text-accent-foreground">
                  <p className="font-medium mb-1">What should you do?</p>
                  <p className="text-xs leading-relaxed">
                    This asset has exceeded your drift threshold. Review the allocation and rebalance through your external brokerage account if needed.
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={() => setSelectedAlertId(null)}>Close</Button>
                {selectedAlert.status === "unread" && (
                  <Button
                    size="sm"
                    onClick={() => markAsReadMutation.mutate(selectedAlert.id)}
                    disabled={markAsReadMutation.isPending}
                  >
                    Mark Read
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
