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
import { showSuccess, showError } from "@/utils/toast";
import { clearAllReminders } from "@/utils/reminderStore";
import { clearAllGroups } from "@/utils/groupStore";
import {
  getCompanyProfile,
  saveCompanyProfile,
  clearCompanyProfile,
} from "@/utils/companyStore";
import {
  Settings2,
  Trash2,
  Database,
  Save,
  Shield,
  Loader2,
}
from "lucide-react";

const SettingsPage = () => {
  // Company profile state
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [website, setWebsite] = React.useState("");
  const [address, setAddress] = React.useState("");
  const [licenseNumber, setLicenseNumber] = React.useState("");
  const [vatNumber, setVatNumber] = React.useState("");
  const [regNumber, setRegNumber] = React.useState("");
  const [logoDataUrl, setLogoDataUrl] = React.useState<string | null>(null);

  // App settings state (non-WAHA)
  const [allowStockBelowCost, setAllowStockBelowCost] = React.useState<boolean>(true);
  const [dontSellBelowCost, setDontSellBelowCost] = React.useState<boolean>(false);
  const [slipMessage1, setSlipMessage1] = React.useState<string>("");
  const [slipMessage2, setSlipMessage2] = React.useState<string>("");
  const [slipMessage3, setSlipMessage3] = React.useState<string>("");

  const [loadingAppSettings, setLoadingAppSettings] = React.useState(true);
  const [savingAppSettings, setSavingAppSettings] = React.useState(false);
  const [clearingAppSettings, setClearingAppSettings] = React.useState(false);

  // Initialize company profile and app settings
  const loadSettings = React.useCallback(async () => {
    setLoadingAppSettings(true);
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

    const s = await getAppSettings(); // Await the async function
    setAllowStockBelowCost(s.allowStockBelowCost);
    setDontSellBelowCost(s.dontSellBelowCost);
    setSlipMessage1(s.slipMessage1 || "");
    setSlipMessage2(s.slipMessage2 || "");
    setSlipMessage3(s.slipMessage3 || "");
    setLoadingAppSettings(false);
  }, []);

  React.useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  // Handlers for Company Profile
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

  // Handlers for App Settings (non-WAHA)
  const handleSaveAppSettings = async () => {
    setSavingAppSettings(true);
    try {
      const currentSettings = await getAppSettings(); // Get all current settings
      await saveAppSettings({
        ...currentSettings, // Spread existing settings to preserve WAHA fields
        allowStockBelowCost,
        dontSellBelowCost,
        slipMessage1: slipMessage1.trim(),
        slipMessage2: slipMessage2.trim(),
        slipMessage3: slipMessage3.trim(),
      });
      showSuccess("App settings saved successfully");
      await loadSettings(); // Re-fetch settings after successful save
    } catch (error) {
      showError("Failed to save app settings.");
      console.error("Error saving app settings:", error);
    } finally {
      setSavingAppSettings(false);
    }
  };

  const handleClearAppSettings = async () => {
    setClearingAppSettings(true);
    try {
      const currentSettings = await getAppSettings(); // Get all current settings
      await saveAppSettings({
        ...currentSettings, // Preserve WAHA settings
        allowStockBelowCost: defaultSettings.allowStockBelowCost,
        dontSellBelowCost: defaultSettings.dontSellBelowCost,
        slipMessage1: defaultSettings.slipMessage1,
        slipMessage2: defaultSettings.slipMessage2,
        slipMessage3: defaultSettings.slipMessage3,
      });
      showSuccess("App settings cleared");
      await loadSettings(); // Re-fetch settings after successful clear
    } catch (error) {
      showError("Failed to clear app settings.");
      console.error("Error clearing app settings:", error);
    } finally {
      setClearingAppSettings(false);
    }
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

  if (loadingAppSettings) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading settings...</span>
      </div>
    );
  }

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
                  <div className="md:col-span-2 space-y-3">
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
                    <p className="text-xs text-red-600">
                      Kindly note the system will not work until the license number is updated. License is updated by the installers Contact Computers.
                    </p>
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
                  className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
                >
                  <Save className="size-4" />
                  Save Profile
                </Button>
              </CardFooter>
            </Card>

            {/* Company Compliance Card */}
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
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex gap-3 justify-end pt-6 px-0">
                <Button
                  onClick={handleSaveCompany}
                  className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
                >
                  <Save className="size-4" />
                  Save Company Details
                </Button>
              </CardFooter>
            </Card>

            {/* App Settings (non-WAHA) Card */}
            <Card className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
              <CardHeader className="p-0 pb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Settings2 className="size-5 text-purple-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-semibold text-gray-900">
                      Slip & App Settings
                    </CardTitle>
                    <CardDescription>
                      Configure slip messages and cost control switches for Store POS
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-0 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label className="text-sm font-medium text-gray-700">Slip Message 1</Label>
                    <Input
                      placeholder="Thank you for shopping with us!"
                      value={slipMessage1}
                      onChange={(e) => setSlipMessage1(e.target.value)}
                      className="border-gray-300 focus:border-blue-500"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-sm font-medium text-gray-700">Slip Message 2</Label>
                    <Input
                      placeholder="Keep your receipt for returns."
                      value={slipMessage2}
                      onChange={(e) => setSlipMessage2(e.target.value)}
                      className="border-gray-300 focus:border-blue-500"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-sm font-medium text-gray-700">Slip Message 3</Label>
                    <Input
                      placeholder="Visit us again soon."
                      value={slipMessage3}
                      onChange={(e) => setSlipMessage3(e.target.value)}
                      className="border-gray-300 focus:border-blue-500"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label className="text-sm font-medium text-gray-700">Select Stock Below Cost</Label>
                    <div className="flex items-center justify-between rounded-md border p-3">
                      <span className="text-sm text-gray-600">Allow selecting items priced below cost</span>
                      <Switch
                        checked={allowStockBelowCost}
                        onCheckedChange={setAllowStockBelowCost}
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-sm font-medium text-gray-700">Don't Sell Below Cost</Label>
                    <div className="flex items-center justify-between rounded-md border p-3">
                      <span className="text-sm text-gray-600">Block sales if any item price is below its cost</span>
                      <Switch
                        checked={dontSellBelowCost}
                        onCheckedChange={setDontSellBelowCost}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="flex gap-3 justify-end pt-6 px-0">
                <Button
                  variant="outline"
                  onClick={handleClearAppSettings}
                  disabled={clearingAppSettings || savingAppSettings}
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  {clearingAppSettings ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="size-4 mr-2" />}
                  Clear
                </Button>
                <Button
                  onClick={handleSaveAppSettings}
                  disabled={savingAppSettings || clearingAppSettings}
                  className="bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-2"
                >
                  {savingAppSettings ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="size-4" />}
                  Save POS Settings
                </Button>
              </CardFooter>
            </Card>

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