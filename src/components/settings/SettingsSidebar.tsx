"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface SettingsSidebarProps {
  hasCompanyData: boolean;
}

const SettingsSidebar: React.FC<SettingsSidebarProps> = ({ hasCompanyData }) => {
  return (
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
  );
};

export default SettingsSidebar;