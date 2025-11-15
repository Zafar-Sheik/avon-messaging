"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { getAppSettings, saveAppSettings, clearAppSettings } from "@/utils/appSettingsStore";
import { showSuccess } from "@/utils/toast";
import { clearAllReminders } from "@/utils/reminderStore";
import { clearAllGroups } from "@/utils/groupStore";
import {
  getCompanyProfile,
} from "@/utils/companyStore";
import {
  getWahaConfig,
  saveWahaConfig,
  clearWahaConfig,
} from "@/utils/wahaStore";
import WahaConnect from "@/components/WahaConnect";
import {
  Settings2,
  Trash2,
  Database,
  Save,
  Shield,
} from "lucide-react";

const SettingsPage = () => {
  const [wahaApiKey, setWahaApiKey] = React.useState("");
  const [wahaBaseUrl, setWahaBaseUrl] = React.useState("");
  const [wahaSessionName, setWahaSessionName] = React.useState("");

  React.useEffect(() => {
    const waha = getWahaConfig();
    if (waha) {
      setWahaApiKey(waha.apiKey || "");
      setWahaBaseUrl(waha.baseUrl || "");
      setWahaSessionName(waha.sessionName || "");
    }
  }, []);

  // Compute status from stored profile
  const hasCompanyData = !!getCompanyProfile();

  const handleSaveWaha = () => {
    saveWahaConfig({
      apiKey: wahaApiKey.trim(),
      baseUrl: wahaBaseUrl.trim(),
      sessionName: wahaSessionName.trim(),
    });
    // Notify other components (like WahaConnect) that the config changed
    window.dispatchEvent(new CustomEvent("waha-config-changed"));
    showSuccess("WAHA settings saved successfully");
  };

  const handleClearWaha = () => {
    clearWahaConfig();
    setWahaApiKey("");
    setWahaBaseUrl("");
    setWahaSessionName("");
    showSuccess("WAHA settings cleared");
  };

  const clearGroups = () => {
    clearAllGroups();
    showSuccess("All groups cleared successfully");
  };

  const clearReminders = () => {
    clearAllReminders();
    showSuccess("All reminders cleared successfully");
  };

  const hasWahaData = wahaApiKey || wahaBaseUrl || wahaSessionName;

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-full mx-auto p-6 space-y-8">
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Settings2 className="size-8 text-blue-600" />
              Settings
            </h1>
            <p className="text-gray-600 text-lg mt-2">
              Manage your application preferences and configurations
            </p>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <Badge variant="secondary" className="text-sm font-medium">
              Configuration
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* WAHA Settings Card */}
            <Card className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
              <CardHeader className="p-0 pb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Shield className="size-5 text-green-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-semibold text-gray-900">
                      WAHA Configuration
                    </CardTitle>
                    <CardDescription>
                      Connect to your WhatsApp HTTP API instance
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0 space-y-6">
                <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-3">
                    <Label
                      htmlFor="waha-base-url"
                      className="text-sm font-medium text-gray-700">
                      Base URL *
                    </Label>
                    <Input
                      id="waha-base-url"
                      type="url"
                      placeholder="https://your-waha-host:3000"
                      value={wahaBaseUrl}
                      onChange={(e) => setWahaBaseUrl(e.target.value)}
                      className="border-gray-300 focus:border-blue-500"
                    />
                    <p className="text-xs text-gray-500">
                      The full URL of your WAHA instance including port (usually
                      3000)
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label
                        htmlFor="waha-api-key"
                        className="text-sm font-medium text-gray-700">
                        API Key *
                      </Label>
                      <Input
                        id="waha-api-key"
                        type="password"
                        placeholder="Enter your WAHA API key"
                        value={wahaApiKey}
                        onChange={(e) => setWahaApiKey(e.target.value)}
                        className="border-gray-300 focus:border-blue-500"
                      />
                    </div>
                    <div className="space-y-3">
                      <Label
                        htmlFor="waha-session-name"
                        className="text-sm font-medium text-gray-700">
                        Session Name
                      </Label>
                      <Input
                        id="waha-session-name"
                        placeholder="default"
                        value={wahaSessionName}
                        onChange={(e) => setWahaSessionName(e.target.value)}
                        className="border-gray-300 focus:border-blue-500"
                      />
                      <p className="text-xs text-gray-500">
                        Leave as "default" if unsure
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex gap-3 justify-end pt-6 px-0">
                <Button
                  variant="outline"
                  onClick={handleClearWaha}
                  disabled={!hasWahaData}
                  className="border-gray-300 text-gray-700 hover:bg-gray-50">
                  <Trash2 className="size-4 mr-2" />
                  Clear
                </Button>
                <Button
                  onClick={handleSaveWaha}
                  disabled={!wahaBaseUrl.trim() || !wahaApiKey.trim()}
                  className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2">
                  <Save className="size-4" />
                  Save WAHA Settings
                </Button>
              </CardFooter>
            </Card>

            {/* WAHA Connection Status */}
            <WahaConnect />

            {/* Data Management Card */}
            <Card className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
              <CardHeader className="p-0 pb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <Database className="size-5 text-red-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-semibold text-gray-900">
                      Data Management
                    </CardTitle>
                    <CardDescription>
                      Manage your local application data
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="space-y-4">
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-sm text-red-700">
                      <strong>Warning:</strong> These actions will permanently
                      delete your data. This cannot be undone.
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button
                      variant="destructive"
                      onClick={clearGroups}
                      className="flex items-center gap-2 bg-red-600 hover:bg-red-700">
                      <Trash2 className="size-4" />
                      Clear All Groups
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={clearReminders}
                      className="flex items-center gap-2 bg-red-600 hover:bg-red-700">
                      <Trash2 className="size-4" />
                      Clear All Reminders
                    </Button>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-6 px-0">
                <p className="text-xs text-gray-500">
                  All data is stored locally in your browser. Clearing data will
                  remove everything from this device only.
                </p>
              </CardFooter>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Status Card */}
            <Card className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-4">
                Configuration Status
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Company Profile</span>
                  <Badge
                    variant={hasCompanyData ? "default" : "secondary"}
                    className={hasCompanyData ? "bg-green-100 text-green-800" : ""}
                  >
                    {hasCompanyData ? "Configured" : "Not Set"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">WAHA Settings</span>
                  <Badge
                    variant={hasWahaData ? "default" : "secondary"}
                    className={hasWahaData ? "bg-green-100 text-green-800" : ""}
                  >
                    {hasWahaData ? "Configured" : "Not Set"}
                  </Badge>
                </div>
                <div className="pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-500">
                    Required fields are marked with *
                  </p>
                </div>
              </div>
            </Card>

            {/* Help Card */}
            <Card className="p-6 bg-blue-50 border border-blue-200 rounded-xl">
              <h3 className="font-semibold text-blue-900 mb-3">Need Help?</h3>
              <div className="space-y-3 text-sm text-blue-700">
                <p>
                  <strong>WAHA Setup:</strong> Ensure your WAHA instance is
                  running and accessible.
                </p>
                <p>
                  <strong>API Key:</strong> Find this in your WAHA dashboard
                  under API settings.
                </p>
                <p>
                  <strong>Data Safety:</strong> Your data is stored locally in
                  browser storage.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;