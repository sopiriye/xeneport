import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  TrendingUp,
  ArrowRight,
  CheckCircle2,
  Briefcase,
  Settings2,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function Onboarding() {
  const { isAuthenticated } = useAuth();
  const nextLink = isAuthenticated ? "/portfolios/new" : "/login";
  const nextLabel = isAuthenticated ? "Create Your First Portfolio" : "Sign In To Continue";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="border-b bg-card">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5 text-primary-foreground" />
            </div>
          </Link>
          <div>
            <p className="text-sm font-medium">Portfolio setup</p>
            <p className="text-xs text-muted-foreground">Continue setup from the live app experience.</p>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-2xl animate-fade-in">
          <div className="text-center mb-10">
            <div className="w-16 h-16 rounded-2xl bg-accent flex items-center justify-center mx-auto mb-6">
              <TrendingUp className="w-8 h-8 text-accent-foreground" />
            </div>
            <h1 className="text-3xl font-display font-bold mb-3">Start with a live portfolio</h1>
            <p className="text-muted-foreground leading-relaxed max-w-xl mx-auto">
              Portfolio creation, holdings management, drift settings, and alerts now run against the backend
              from the main application screens.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-4 mb-8">
            <div className="card-elevated p-5 text-center">
              <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center mx-auto mb-3">
                <Briefcase className="w-5 h-5 text-accent-foreground" />
              </div>
              <h2 className="font-display font-semibold mb-2">Create portfolio</h2>
              <p className="text-sm text-muted-foreground">Set up a portfolio with live persistence.</p>
            </div>
            <div className="card-elevated p-5 text-center">
              <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center mx-auto mb-3">
                <Settings2 className="w-5 h-5 text-accent-foreground" />
              </div>
              <h2 className="font-display font-semibold mb-2">Configure drift</h2>
              <p className="text-sm text-muted-foreground">Use the backend drift multiplier per portfolio.</p>
            </div>
            <div className="card-elevated p-5 text-center">
              <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="w-5 h-5 text-accent-foreground" />
              </div>
              <h2 className="font-display font-semibold mb-2">Monitor alerts</h2>
              <p className="text-sm text-muted-foreground">Review live drift status and alert history.</p>
            </div>
          </div>

          <div className="text-center">
            <Link to={nextLink}>
              <Button className="gap-2">
                {nextLabel} <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
