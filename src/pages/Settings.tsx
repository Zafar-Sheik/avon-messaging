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
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { showSuccess } from "@/utils/toast";
import { clearAllReminders } from "@/utils/reminderStore";
import { clearAllGroups } from "@/utils/groupStore";
import {
  getCompanyProfile,
  saveCompanyProfile,
  clearCompanyProfile,
} from "@/utils/companyStore";
import {
  getWahaConfig,
  saveWahaConfig,
  clearWahaConfig,
} from "@/utils/wahaStore";
import WahaConnect from "@/components/WahaConnect";
import {
  Building,
  Settings2,
  Trash2,
  Database,
  Save,
  Shield,
  Globe,
  Phone,
} from "lucide-react";

const SettingsPage = () => {
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [website, setWebsite] = React.useState("");
  const [address, setAddress] = React.useState("");

  const [wahaApiKey, setWahaApiKey] = React.useState("");
  const [wahaBaseUrl, setWahaBaseUrl] = React.useState("");
  const [wahaSessionName, setWahaSessionName] = React.useState("");

  React.useEffect(() => {
    const existing = getCompanyProfile();
    if (existing) {
      setName(existing.name || "");
      setEmail(existing.email || "");
      setPhone(existing.phone || "");
      setWebsite(existing.website || "");
      setAddress(existing.address || "");
    }
  }, []);

  React.useEffect(() => {
    const waha = getWahaConfig();
    if (waha) {
      setWahaApiKey(waha.apiKey || "");
      setWahaBaseUrl(waha.baseUrl || "");
      setWahaSessionName(waha.sessionName || "");
    }
  }, []);

  const handleSaveCompany = () => {
    saveCompanyProfile({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim() || undefined,
      website: website.trim() || undefined,
      address: address.trim() || undefined,
    });
    showSuccess("Company profile saved successfully");
  };

  const handleClearCompany = () => {
    clearCompanyProfile();
    setName("");
    setEmail("");
    setPhone("");
    setWebsite("");
    setAddress("");
    showSuccess("Company profile cleared");
  };

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

  const hasCompanyData = name || email || phone || website || address;
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
            {/* Company Profile Card */}
            <Card className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
              <CardHeader className="p-0 pb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Building className="size-5 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-semibold text-gray-900">
                      Company Profile
                    </CardTitle>
                    <CardDescription>
                      Your organization details used across the application
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label
                      htmlFor="company-name"
                      className="text-sm font-medium text-gray-700">
                      Company Name *
                    </Label>
                    <Input
                      id="company-name"
                      placeholder="Acme Inc."
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="border-gray-300 focus:border-blue-500"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label
                      htmlFor="company-email"
                      className="text-sm font-medium text-gray-700">
                      Email Address *
                    </Label>
                    <Input
                      id="company-email"
                      type="email"
                      placeholder="hello@acme.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="border-gray-300 focus:border-blue-500"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label
                      htmlFor="company-phone"
                      className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <Phone className="size-4" />
                      Phone Number
                    </Label>
                    <Input
                      id="company-phone"
                      placeholder="+1 (555) 000-0000"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="border-gray-300 focus:border-blue-500"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label
                      htmlFor="company-website"
                      className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <Globe className="size-4" />
                      Website
                    </Label>
                    <Input
                      id="company-website"
                      type="url"
                      placeholder="https://www.acme.com"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      className="border-gray-300 focus:border-blue-500"
                    />
                  </div>
                  <div className="md:col-span-2 space-y-3">
                    <Label
                      htmlFor="company-address"
                      className="text-sm font-medium text-gray-700">
                      Business Address
                    </Label>
                    <Textarea
                      id="company-address"
                      placeholder="123 Business Rd, Suite 100, City, State, ZIP"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="min-h-20 border-gray-300 focus:border-blue-500 resize-none"
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex gap-3 justify-end pt-6 px-0">
                <Button
                  variant="outline"
                  onClick={handleClearCompany}
                  disabled={!hasCompanyData}
                  className="border-gray-300 text-gray-700 hover:bg-gray-50">
                  <Trash2 className="size-4 mr-2" />
                  Clear
                </Button>
                <Button
                  onClick={handleSaveCompany}
                  disabled={!name.trim() || !email.trim()}
                  className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2">
                  <Save className="size-4" />
                  Save Profile
                </Button>
              </CardFooter>
            </Card>

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
                    className={
                      hasCompanyData ? "bg-green-100 text-green-800" : ""
                    }>
                    {hasCompanyData ? "Configured" : "Not Set"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">WAHA Settings</span>
                  <Badge
                    variant={hasWahaData ? "default" : "secondary"}
                    className={
                      hasWahaData ? "bg-green-100 text-green-800" : ""
                    }>
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
