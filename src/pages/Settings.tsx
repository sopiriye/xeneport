import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { usersApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

export default function SettingsPage() {
  const { updateUser } = useAuth();
  const profileQuery = useQuery({
    queryKey: ["profile"],
    queryFn: usersApi.getMe,
  });
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  useEffect(() => {
    if (profileQuery.data) {
      setFirstName(profileQuery.data.firstName);
      setLastName(profileQuery.data.lastName);
    }
  }, [profileQuery.data]);

  const updateProfileMutation = useMutation({
    mutationFn: () =>
      usersApi.updateMe({
        firstName,
        lastName,
      }),
    onSuccess: (response) => {
      updateUser(response.user);
      toast.success(response.message);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Unable to update profile");
    },
  });

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto">
        <div className="page-header">
          <h1 className="page-title">Settings</h1>
          <p className="page-subtitle">Manage your account and preferences</p>
        </div>

        <section className="card-elevated p-6 mb-6">
          <h2 className="font-display font-semibold mb-4">Profile</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>First Name</Label>
              <Input value={firstName} onChange={(event) => setFirstName(event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Last Name</Label>
              <Input value={lastName} onChange={(event) => setLastName(event.target.value)} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>Email</Label>
              <Input value={profileQuery.data?.email ?? ""} type="email" disabled />
              <p className="text-xs text-muted-foreground">Email changes are not supported.</p>
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <Button size="sm" onClick={() => updateProfileMutation.mutate()} disabled={updateProfileMutation.isPending}>
              {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </section>

        <section className="card-elevated p-6 mb-6">
          <h2 className="font-display font-semibold mb-4">Notifications</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Email Drift Alerts</p>
                <p className="text-xs text-muted-foreground">Drift alert emails are currently managed by the backend.</p>
              </div>
              <Switch defaultChecked disabled />
            </div>
          </div>
        </section>

        <section className="card-elevated p-6">
          <h2 className="font-display font-semibold mb-4">Account</h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium">Status</p>
              <p className="text-xs text-muted-foreground capitalize">{profileQuery.data?.status ?? "Loading"}</p>
            </div>
            <Separator />
            <div>
              <p className="text-sm font-medium">Verification</p>
              <p className="text-xs text-muted-foreground">
                {profileQuery.data?.emailVerified ? "Email verified" : "Email not verified"}
              </p>
            </div>
          </div>
        </section>
      </div>
    </AppLayout>
  );
}
