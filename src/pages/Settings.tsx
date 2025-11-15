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

  // NEW: Company profile state
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [website, setWebsite] = React.useState("");
  const [address, setAddress] = React.useState("");
  const [licenseNumber, setLicenseNumber] = React.useState("");
  const [vatNumber, setVatNumber] = React.useState("");
  const [regNumber, setRegNumber] = React.useState("");
  const [logoDataUrl, setLogoDataUrl] = React.useState<string | null>(null);

  React.useEffect(() => {
    const waha = getWahaConfig();
    if (waha) {
      setWahaApiKey(waha.apiKey || "");
      setWahaBaseUrl(waha.baseUrl || "");
      setWahaSessionName(waha.sessionName || "");
    }
  }, []);

  // NEW: Initialize company profile
  React.useEffect(() => {
    const c = getCompanyProfile();
    if (c) {
      setName(c.name || "");
      setEmail(c.email || "");
      setPhone(c.phone || "");
      setWebsite(c.website || "");
      setAddress(c.address || "");
      setLicenseNumber(c.licenseNumber || "");
      setVatNumber(c.vatNumber || "");
      setRegNumber(c.regNumber || "");
      setLogoDataUrl(c.logoDataUrl || null);
    }
  }, []);

  // NEW: handlers
  const handleSaveCompany = () => {
    const payload = {
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim() || undefined,
      website: website.trim() || undefined,
      address: address.trim() || undefined,
      licenseNumber: licenseNumber.trim() || undefined,
      vatNumber: vatNumber.trim() || undefined,
      regNumber: regNumber.trim() || undefined,
      logoDataUrl: logoDataUrl || undefined,
    };
    saveCompanyProfile(payload);
    showSuccess("Company profile saved successfully");
  };

  const handleClearCompany = () => {
    clearCompanyProfile();
    setName("");
    setEmail("");
    setPhone("");
    setWebsite("");
    setAddress("");
    setLicenseNumber("");
    setVatNumber("");
    setRegNumber("");
    setLogoDataUrl(null);
    showSuccess("Company profile cleared");
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setLogoDataUrl(reader.result as string);
    reader.readAsDataURL(file);
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

  const hasCompanyData = !!getCompanyProfile();
  const canSaveCompanyExtras = !!name.trim() && !!email.trim();
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
            {/* NEW: Company Profile Card */}
            <Card className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
              <CardHeader className="p-0 pb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Settings2 className="size-5 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-semibold text-gray-900">
                      Company Profile
                    </CardTitle>
                    <CardDescription>
                      Organization details used on Store POS slips
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label htmlFor="company-name" className="text-sm font-medium text-gray-700">
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
                    <Label htmlFor="company-email" className="text-sm font-medium text-gray-700">
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
                    <Label htmlFor="company-phone" className="text-sm font-medium text-gray-700">
                      Contact Number
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
                    <Label htmlFor="company-website" className="text-sm font-medium text-gray-700">
                      Website
                    </Label>
                    <Input
                      id="company-website"
                      type="url"
                      placeholder="https://www.example.com"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      className="border-gray-300 focus:border-blue-500"
                    />
                  </div>
                  <div className="md:col-span-2 space-y-3">
                    <Label htmlFor="company-address" className="text-sm font-medium text-gray-700">
                      Address
                    </Label>
                    <Input
                      id="company-address"
                      placeholder="123 Business Rd, Suite 100, City, State, ZIP"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="border-gray-300 focus:border-blue-500"
                    />
                  </div>
                  <div className="space-y-3 md:col-span-2">
                    <Label htmlFor="license-number" className="text-sm font-medium text-gray-700">
                      License Number
                    </Label>
                    <Input
                      id="license-number"
                      placeholder="e.g. REG-123456"
                      value={licenseNumber}
                      onChange={(e) => setLicenseNumber(e.target.value)}
                      className="border-gray-300 focus:border-blue-500"
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex gap-3 justify-end pt-6 px-0">
                <Button
                  variant="outline"
                  onClick={handleClearCompany}
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  <Trash2 className="size-4 mr-2" />
                  Clear
                </Button>
                <Button
                  onClick={handleSaveCompany}
                  disabled={!name.trim() || !email.trim()}
                  className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
                >
                  <Save className="size-4" />
                  Save Profile
                </Button>
              </CardFooter>
            </Card>

            {/* NEW: Company Compliance Card */}
            <Card className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
              <CardHeader className="p-0 pb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Shield className="size-5 text-purple-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-semibold text-gray-900">
                      Company Compliance
                    </CardTitle>
                    <CardDescription>
                      Manage VAT number, registration number, and company logo for slips
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label htmlFor="vat-number" className="text-sm font-medium text-gray-700">
                      VAT No
                    </Label>
                    <Input
                      id="vat-number"
                      placeholder="e.g. VAT-789012"
                      value={vatNumber}
                      onChange={(e) => setVatNumber(e.target.value)}
                      className="border-gray-300 focus:border-blue-500"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="reg-number" className="text-sm font-medium text-gray-700">
                      Registration No
                    </Label>
                    <Input
                      id="reg-number"
                      placeholder="e.g. REG-345678"
                      value={regNumber}
                      onChange={(e) => setRegNumber(e.target.value)}
                      className="border-gray-300 focus:border-blue-500"
                    />
                  </div>
                  <div className="md:col-span-2 space-y-3">
                    <Label className="text-sm font-medium text-gray-700">
                      Company Logo
                    </Label>
                    <div className="flex flex-col sm:flex-row gap-4 items-start">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoChange}
                        className="border-gray-300 focus:border-blue-500 sm:max-w-xs"
                      />
                      {logoDataUrl ? (
                        <div className="flex items-center gap-3">
                          <img
                            src={logoDataUrl}
                            alt="Company Logo Preview"
                            className="h-16 w-16 rounded-md border object-contain bg-white"
                          />
                          <Button
                            variant="outline"
                            onClick={() => setLogoDataUrl(null)}
                            className="border-gray-300 text-gray-700 hover:bg-gray-50"
                          >
                            Remove Logo
                          </Button>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">
                          Upload a PNG or JPG. Max ~1MB recommended.
                        </p>
                      )}
                    </div>
                    {!canSaveCompanyExtras && (
                      <p className="text-xs text-gray-500">
                        Company name and email must be set to save these details.
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex gap-3 justify-end pt-6 px-0">
                <Button
                  onClick={handleSaveCompany}
                  disabled={!canSaveCompanyExtras}
                  className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
                >
                  <Save className="size-4" />
                  Save Company Details
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