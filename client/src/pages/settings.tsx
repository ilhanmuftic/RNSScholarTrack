import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Settings as SettingsIcon } from "lucide-react";

export default function Settings() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-serif font-semibold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage application settings</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-serif">Application Settings</CardTitle>
          <CardDescription>Configure system preferences and defaults</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <SettingsIcon className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground mb-2">Settings page coming soon</p>
            <p className="text-sm text-muted-foreground">
              Configure categories, notifications, and system preferences
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
