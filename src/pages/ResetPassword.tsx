import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TrendingUp } from "lucide-react";

export default function ResetPassword() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center mx-auto mb-4">
            <TrendingUp className="w-4.5 h-4.5 text-primary-foreground" />
          </div>
          <h1 className="text-xl font-display font-semibold">Set new password</h1>
          <p className="text-sm text-muted-foreground mt-1">Choose a strong password for your account</p>
        </div>

        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          <div className="space-y-2">
            <Label htmlFor="password">New password</Label>
            <Input id="password" type="password" placeholder="Min 8 characters" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm">Confirm password</Label>
            <Input id="confirm" type="password" placeholder="Repeat password" />
          </div>
          <Link to="/login">
            <Button className="w-full">Update Password</Button>
          </Link>
        </form>
      </div>
    </div>
  );
}
