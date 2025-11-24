"use client";

import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Settings2, Loader2 } from "lucide-react";
import { getAppSettings, saveAppSettings, clearAppSettings, AppSettings } from "@/utils/appSettingsStore";
import { showSuccess, showError } from "@/utils/toast";
import { clearAllReminders } from "@/utils/reminderStore";
import { clearAllGroups } from "@/utils/groupStore";
import {
  getCompanyProfile,
  saveCompanyProfile,
  clearCompanyProfile,
  CompanyProfile,
} from "@/utils/companyStore";

// Import new modular components
import CompanyProfileForm from "@/components/settings/CompanyProfileForm";
import CompanyComplianceForm from "@/components/settings/CompanyComplianceForm";
import AppSettingsForm from "@/components/settings/AppSettingsForm";
import DataManagementCard from "@/components/settings/DataManagementCard";
import SettingsSidebar from "@/components/settings/SettingsSidebar";

const SettingsPage = () => {
  const [companyProfile, setCompanyProfile] = React.useState<CompanyProfile | null>(null);
  const [appSettings, setAppSettings] = React.useState<AppSettings | null>(null);

  const [loading, setLoading] = React.useState(true);
  const [savingCompany, setSavingCompany] = React.useState(false);
  const [clearingCompany, setClearingCompany] = React.useState(false);
  const [savingApp, setSavingApp] = React.useState(false);
  const [clearingApp, setClearingApp] = React.useState(false);

  const loadAllSettings = React.useCallback(async () => {
    setLoading(true);
    try {
      const [company, app] = await Promise.all([
        getCompanyProfile(),
        getAppSettings(),
      ]);
      setCompanyProfile(company);
      setAppSettings(app);
    } catch (error) {
      console.error("Failed to load all settings:", error);
      showError("Failed to load settings.");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadAllSettings();
  }, [loadAllSettings]);

  // Handlers for Company Profile
  const handleSaveCompany = async (profile: CompanyProfile) => {
    setSavingCompany(true);
    try {
      await saveCompanyProfile(profile);
      showSuccess("Company profile saved successfully");
      await loadAllSettings(); // Re-fetch to ensure UI is in sync
    } catch (error) {
      showError("Failed to save company profile.");
      console.error("Error saving company profile:", error);
    } finally {
      setSavingCompany(false);
    }
  };

  const handleClearCompany = async () => {
    setClearingCompany(true);
    try {
      await clearCompanyProfile();
      showSuccess("Company profile cleared");
      await loadAllSettings(); // Re-fetch to ensure UI is in sync
    } catch (error) {
      showError("Failed to clear company profile.");
      console.error("Error clearing company profile:", error);
    } finally {
      setClearingCompany(false);
    }
  };

  // Handlers for App Settings (non-WAHA)
  const handleSaveAppSettings = async (settings: Partial<AppSettings>) => {
    setSavingApp(true);
    try {
      const currentSettings = appSettings || await getAppSettings(); // Ensure we have full settings
      await saveAppSettings({
        ...currentSettings,
        ...settings, // Apply only the updated fields
      });
      showSuccess("App settings saved successfully");
      await loadAllSettings(); // Re-fetch to ensure UI is in sync
    } catch (error) {
      showError("Failed to save app settings.");
      console.error("Error saving app settings:", error);
    } finally {
      setSavingApp(false);
    }
  };

  const handleClearAppSettings = async () => {
    setClearingApp(true);
    try {
      const currentSettings = appSettings || await getAppSettings(); // Ensure we have full settings
      await saveAppSettings({
        ...currentSettings, // Preserve WAHA settings
        allowStockBelowCost: true,
        dontSellBelowCost: false,
        slipMessage1: "",
        slipMessage2: "",
        slipMessage3: "",
      });
      showSuccess("App settings cleared");
      await loadAllSettings(); // Re-fetch to ensure UI is in sync
    } catch (error) {
      showError("Failed to clear app settings.");
      console.error("Error clearing app settings:", error);
    } finally {
      setClearingApp(false);
    }
  };

  // Handlers for Data Management
  const handleClearGroups = () => {
    clearAllGroups();
    showSuccess("All groups cleared successfully");
  };

  const handleClearReminders = () => {
    clearAllReminders();
    showSuccess("All reminders cleared successfully");
  };

  if (loading) {
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
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {companyProfile && (
              <CompanyProfileForm
                profile={companyProfile}
                onSave={handleSaveCompany}
                onClear={handleClearCompany}
                saving={savingCompany}
                clearing={clearingCompany}
              />
            )}

            {companyProfile && (
              <CompanyComplianceForm
                profile={companyProfile}
                onSave={handleSaveCompany}
                saving={savingCompany}
              />
            )}

            {appSettings && companyProfile && (
              <AppSettingsForm
                appSettings={appSettings}
                companyProfile={companyProfile}
                onSave={handleSaveAppSettings}
                onClear={handleClearAppSettings}
                saving={savingApp}
                clearing={clearingApp}
              />
            )}

            <DataManagementCard
              onClearGroups={handleClearGroups}
              onClearReminders={handleClearReminders}
            />
          </div>

          {/* Sidebar */}
          <SettingsSidebar hasCompanyData={!!companyProfile?.name && !!companyProfile?.email} />
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;