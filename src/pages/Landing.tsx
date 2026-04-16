import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  TrendingUp,
  Shield,
  Bell,
  BarChart3,
  ArrowRight,
  CheckCircle2,
  PieChart,
  Target,
} from "lucide-react";

const features = [
  {
    icon: PieChart,
    title: "Allocation Tracking",
    description: "Automatically calculate and visualize how your capital is distributed across holdings.",
  },
  {
    icon: Target,
    title: "Drift Detection",
    description: "Dynamic threshold calculation detects when any asset grows disproportionately large.",
  },
  {
    icon: Bell,
    title: "Rebalance Alerts",
    description: "Get notified when your portfolio drifts beyond your comfort zone. Review and act externally.",
  },
  {
    icon: BarChart3,
    title: "Portfolio Analytics",
    description: "Track allocation changes over time with clear, actionable historical data.",
  },
];

const steps = [
  { step: "01", title: "Create Portfolio", description: "Set up your portfolio and define your drift tolerance multiplier." },
  { step: "02", title: "Add Holdings", description: "Add your stock holdings with unit quantities. We fetch live prices from the NGX." },
  { step: "03", title: "Monitor & Act", description: "Receive drift alerts and review analytics. Rebalance through your own stockbroker." },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-lg">DriftWatch</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" size="sm">Log In</Button>
            </Link>
            <Link to="/signup">
              <Button size="sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="py-20 sm:py-28 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent text-accent-foreground text-xs font-medium mb-6">
            <Shield className="w-3.5 h-3.5" />
            Portfolio Intelligence for DCA Investors
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold tracking-tight leading-tight mb-6">
            Monitor drift.<br />
            Protect allocation.<br />
            <span className="text-primary">Stay balanced.</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-8 leading-relaxed">
            DriftWatch helps long-term investors detect portfolio drift before it becomes a problem.
            Track allocation, receive rebalance signals, and maintain your DCA strategy with precision.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/signup">
              <Button size="lg" className="gap-2 w-full sm:w-auto">
                Start Monitoring <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Log In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Dashboard Preview */}
      <section className="px-4 sm:px-6 pb-20">
        <div className="max-w-5xl mx-auto">
          <div className="rounded-2xl border bg-card shadow-lg p-4 sm:p-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              {[
                { label: "Portfolio Value", value: "₦14.7M" },
                { label: "Holdings", value: "8 assets" },
                { label: "Drift Alerts", value: "2 active" },
                { label: "Drift Multiplier", value: "1.5×" },
              ].map((s) => (
                <div key={s.label} className="stat-card">
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                  <p className="text-lg font-semibold font-display">{s.value}</p>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { ticker: "GTCO", alloc: "23.9%", status: "Drift Alert", statusClass: "badge-destructive" },
                { ticker: "DANGCEM", alloc: "22.8%", status: "Drift Alert", statusClass: "badge-destructive" },
                { ticker: "MTNN", alloc: "13.5%", status: "Normal", statusClass: "badge-success" },
              ].map((h) => (
                <div key={h.ticker} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div>
                    <p className="font-semibold text-sm">{h.ticker}</p>
                    <p className="text-xs text-muted-foreground">{h.alloc} allocation</p>
                  </div>
                  <span className={h.statusClass}>{h.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Not a brokerage */}
      <section className="py-16 px-4 sm:px-6 border-t">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-display font-bold mb-4">
            This is not a brokerage.
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto leading-relaxed">
            DriftWatch is a decision-support platform. We help you see when your portfolio
            is out of balance — you execute trades through your own stockbroker.
            Think of it as your capital allocation intelligence layer.
          </p>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-4 sm:px-6 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-center mb-12">How it works</h2>
          <div className="grid sm:grid-cols-3 gap-8">
            {steps.map((s) => (
              <div key={s.step} className="text-center sm:text-left">
                <div className="text-3xl font-display font-bold text-primary/20 mb-2">{s.step}</div>
                <h3 className="font-display font-semibold text-lg mb-2">{s.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-center mb-12">Key Features</h2>
          <div className="grid sm:grid-cols-2 gap-6">
            {features.map((f) => (
              <div key={f.title} className="card-elevated p-6">
                <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center mb-4">
                  <f.icon className="w-5 h-5 text-accent-foreground" />
                </div>
                <h3 className="font-display font-semibold mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why monitoring matters */}
      <section className="py-20 px-4 sm:px-6 bg-muted/30">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-center mb-8">
            Why allocation monitoring matters
          </h2>
          <div className="space-y-4">
            {[
              "Some stocks grow faster than others — your portfolio drifts silently.",
              "A single asset can dominate your portfolio, concentrating risk.",
              "Stockbrokers offer limited allocation monitoring and no drift alerts.",
              "DCA investors need systematic oversight, not manual spreadsheets.",
            ].map((text) => (
              <div key={text} className="flex gap-3 items-start">
                <CheckCircle2 className="w-5 h-5 text-success mt-0.5 shrink-0" />
                <p className="text-sm text-foreground/80">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-display font-bold mb-4">
            Ready to monitor your portfolio?
          </h2>
          <p className="text-muted-foreground mb-8">
            Start tracking allocation drift in minutes. Free to get started.
          </p>
          <Link to="/signup">
            <Button size="lg" className="gap-2">
              Create Account <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-10 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-primary flex items-center justify-center">
              <TrendingUp className="w-3 h-3 text-primary-foreground" />
            </div>
            <span className="font-display font-semibold text-sm">DriftWatch</span>
          </div>
          <p className="text-xs text-muted-foreground">
            © 2026 DriftWatch. Portfolio intelligence for disciplined investors.
          </p>
        </div>
      </footer>
    </div>
  );
}
