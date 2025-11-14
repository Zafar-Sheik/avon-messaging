"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { showSuccess } from "@/utils/toast";
import { clearAllReminders } from "@/utils/reminderStore";
import { clearAllGroups } from "@/utils/groupStore";
import { getCompanyProfile, saveCompanyProfile, clearCompanyProfile } from "@/utils/companyStore";
import { getWahaConfig, saveWahaConfig, clearWahaConfig } from "@/utils/wahaStore";

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
    showSuccess("Company profile saved.");
  };

  const handleClearCompany = () => {
    clearCompanyProfile();
    setName("");
    setEmail("");
    setPhone("");
    setWebsite("");
    setAddress("");
    showSuccess("Company profile cleared.");
  };

  const handleSaveWaha = () => {
    saveWahaConfig({
      apiKey: wahaApiKey.trim(),
      baseUrl: wahaBaseUrl.trim(),
      sessionName: wahaSessionName.trim(),
    });
    // Notify other components (like WahaConnect) that the config changed
    window.dispatchEvent(new CustomEvent("waha-config-changed"));
    showSuccess("WAHA settings saved.");
  };

  const handleClearWaha = () => {
    clearWahaConfig();
    setWahaApiKey("");
    setWahaBaseUrl("");
    setWahaSessionName("");
    showSuccess("WAHA settings cleared.");
  };

  const clearGroups = () => {
    clearAllGroups();
    showSuccess("All groups cleared.");
  };

  const clearReminders = () => {
    clearAllReminders();
    showSuccess("All reminders cleared.");
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto p-6 space-y-6">
        <h1 className="text-2xl font-bold">Settings</h1>

        <Card>
          <CardHeader>
            <CardTitle>Company Profile</CardTitle>
            <CardDescription>Manage your organization details used across the app.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="company-name">Company Name</Label>
                <Input
                  id="company-name"
                  placeholder="Acme Inc."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company-email">Email</Label>
                <Input
                  id="company-email"
                  type="email"
                  placeholder="hello@acme.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company-phone">Phone</Label>
                <Input
                  id="company-phone"
                  placeholder="+1 (555) 000-0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company-website">Website</Label>
                <Input
                  id="company-website"
                  type="url"
                  placeholder="https://www.acme.com"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="company-address">Address</Label>
                <Textarea
                  id="company-address"
                  placeholder="123 Business Rd, Suite 100, City, State, ZIP"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex gap-2 justify-end">
            <Button variant="secondary" onClick={handleClearCompany}>Clear</Button>
            <Button onClick={handleSaveCompany}>Save</Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>WAHA Settings</CardTitle>
            <CardDescription>Configure your WAHA instance connection details.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="waha-base-url">Base URL</Label>
                <Input
                  id="waha-base-url"
                  type="url"
                  placeholder="https://your-waha-host:port"
                  value={wahaBaseUrl}
                  onChange={(e) => setWahaBaseUrl(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="waha-api-key">API Key</Label>
                <Input
                  id="waha-api-key"
                  type="password"
                  placeholder="Enter your WAHA API key"
                  value={wahaApiKey}
                  onChange={(e) => setWahaApiKey(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="waha-session-name">Session Name</Label>
                <Input
                  id="waha-session-name"
                  placeholder="default"
                  value={wahaSessionName}
                  onChange={(e) => setWahaSessionName(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex gap-2 justify-end">
            <Button variant="secondary" onClick={handleClearWaha}>Clear</Button>
            <Button onClick={handleSaveWaha}>Save</Button>
          </CardFooter>
        </Card>

        <Card className="p-4 space-y-3">
          <h2 className="text-lg font-semibold">Data</h2>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button variant="destructive" onClick={clearGroups}>Clear All Groups</Button>
            <Button variant="destructive" onClick={clearReminders}>Clear All Reminders</Button>
          </div>
          <p className="text-xs text-muted-foreground">
            This only affects local storage in your browser.
          </p>
        </Card>
      </div>
    </div>
  );
};

export default SettingsPage;