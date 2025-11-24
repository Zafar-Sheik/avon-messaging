"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings, MessageCircle, Save, Trash2, Loader2 } from "lucide-react";
import { getAppSettings, saveAppSettings, clearAppSettings } from "@/utils/appSettingsStore";
import { showSuccess, showError } from "@/utils/toast";

const SetupPage: React.FC = () => {
  const [wahaBaseUrl, setWahaBaseUrl] = React.useState<string>("");
  const [wahaApiKey, setWahaApiKey] = React.useState<string>("");
  const [wahaSessionName, setWahaSessionName] = React.useState<string>("");
  const [wahaPhoneNumber, setWahaPhoneNumber] = React.useState<string>("");

  const [loadingSettings, setLoadingSettings] = React.useState(true);
  const [savingSettings, setSavingSettings] = React.useState(false);
  const [clearingSettings, setClearingSettings] = React.useState(false);

  const loadWahaSettings = React.useCallback(async () => {
    setLoadingSettings(true);
    try {
      const s = await getAppSettings();
      setWahaBaseUrl(s.wahaBaseUrl || "");
      setWahaApiKey(s.wahaApiKey || "");
      setWahaSessionName(s.wahaSessionName || "");
      setWahaPhoneNumber(s.wahaPhoneNumber || "");
    } catch (error) {
      console.error("Failed to load WAHA settings:", error);
      showError("Failed to load WAHA settings.");
    } finally {
      setLoadingSettings(false);
    }
  }, []);

  React.useEffect(() => {
    loadWahaSettings();
  }, [loadWahaSettings]);

  const handleSaveWahaSettings = async () => {
    setSavingSettings(true);
    try {
      const currentSettings = await getAppSettings(); // Get all current settings
      await saveAppSettings({
        ...currentSettings, // Spread existing settings to preserve other fields
        wahaBaseUrl: wahaBaseUrl.trim(),
        wahaApiKey: wahaApiKey.trim(),
        wahaSessionName: wahaSessionName.trim(),
        wahaPhoneNumber: wahaPhoneNumber.trim(),
      });
      showSuccess("WAHA API settings saved successfully.");
      await loadWahaSettings(); // Re-fetch to ensure UI is in sync
    } catch (error) {
      showError("Failed to save WAHA API settings.");
      console.error("Error saving WAHA API settings:", error);
    } finally {
      setSavingSettings(false);
    }
  };

  const handleClearWahaSettings = async () => {
    setClearingSettings(true);
    try {
      const currentSettings = await getAppSettings(); // Get all current settings
      await saveAppSettings({
        ...currentSettings, // Preserve other settings
        wahaBaseUrl: "",
        wahaApiKey: "",
        wahaSessionName: "",
        wahaPhoneNumber: "",
      });
      showSuccess("WAHA API settings cleared.");
      await loadWahaSettings(); // Re-fetch to ensure UI is in sync
    } catch (error) {
      showError("Failed to clear WAHA API settings.");
      console.error("Error clearing WAHA API settings:", error);
    } finally {
      setClearingSettings(false);
    }
  };

  if (loadingSettings) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading settings...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-full mx-auto p-6 space-y-6">
        <div className="flex items-center gap-3">
          <Settings className="h-6 w-6 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold">Setup</h1>
            <p className="text-muted-foreground">
              Configure initial application settings and integrations.
            </p>
          </div>
        </div>

        <Card className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
          <CardHeader className="p-0 pb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <MessageCircle className="size-5 text-green-600" />
              </div>
              <div>
                <CardTitle className="text-xl font-semibold text-gray-900">
                  WAHA API Settings
                </CardTitle>
                <CardDescription>
                  Configure your WAHA API integration details for sending WhatsApp messages.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label htmlFor="waha-base-url" className="text-sm font-medium text-gray-700">
                  Base URL
                </Label>
                <Input
                  id="waha-base-url"
                  placeholder="e.g., https://api.waha.dev"
                  value={wahaBaseUrl}
                  onChange={(e) => setWahaBaseUrl(e.target.value)}
                  className="border-gray-300 focus:border-green-500"
                />
              </div>
              <div className="space-y-3">
                <Label htmlFor="waha-api-key" className="text-sm font-medium text-gray-700">
                  API Key
                </Label>
                <Input
                  id="waha-api-key"
                  type="password"
                  placeholder="Your WAHA API Key"
                  value={wahaApiKey}
                  onChange={(e) => setWahaApiKey(e.target.value)}
                  className="border-gray-300 focus:border-green-500"
                />
              </div>
              <div className="space-y-3">
                <Label htmlFor="waha-session-name" className="text-sm font-medium text-gray-700">
                  Session Name
                </Label>
                <Input
                  id="waha-session-name"
                  placeholder="e.g., default"
                  value={wahaSessionName}
                  onChange={(e) => setWahaSessionName(e.target.value)}
                  className="border-gray-300 focus:border-green-500"
                />
              </div>
              <div className="space-y-3">
                <Label htmlFor="waha-phone-number" className="text-sm font-medium text-gray-700">
                  Phone Number (with country code)
                </Label>
                <Input
                  id="waha-phone-number"
                  placeholder="e.g., 27821234567"
                  value={wahaPhoneNumber}
                  onChange={(e) => setWahaPhoneNumber(e.target.value)}
                  className="border-gray-300 focus:border-green-500"
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex gap-3 justify-end pt-6 px-0">
            <Button
              variant="outline"
              onClick={handleClearWahaSettings}
              disabled={clearingSettings || savingSettings}
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              {clearingSettings ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="size-4 mr-2" />}
              Clear
            </Button>
            <Button
              onClick={handleSaveWahaSettings}
              disabled={savingSettings || clearingSettings}
              className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
            >
              {savingSettings ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="size-4" />}
              Save WAHA Settings
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default SetupPage;