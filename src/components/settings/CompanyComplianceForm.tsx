"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, Save, Trash2, Loader2 } from "lucide-react";
import type { CompanyProfile } from "@/utils/companyStore";

interface CompanyComplianceFormProps {
  profile: CompanyProfile | null;
  onSave: (profile: CompanyProfile) => Promise<void>;
  saving: boolean;
}

const CompanyComplianceForm: React.FC<CompanyComplianceFormProps> = ({
  profile,
  onSave,
  saving,
}) => {
  const [vatNumber, setVatNumber] = React.useState(profile?.vatNumber || "");
  const [regNumber, setRegNumber] = React.useState(profile?.regNumber || "");
  const [logoDataUrl, setLogoDataUrl] = React.useState<string | null>(profile?.logoDataUrl || null);

  React.useEffect(() => {
    setVatNumber(profile?.vatNumber || "");
    setRegNumber(profile?.regNumber || "");
    setLogoDataUrl(profile?.logoDataUrl || null);
  }, [profile]);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setLogoDataUrl(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    if (!profile) return; // Should not happen if profile is loaded
    onSave({
      ...profile, // Spread existing profile to preserve other fields
      vatNumber: vatNumber.trim() || undefined,
      regNumber: regNumber.trim() || undefined,
      logoDataUrl: logoDataUrl || undefined,
    });
  };

  return (
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
          onClick={handleSave}
          disabled={saving}
          className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
        >
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="size-4" />}
          Save Company Details
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CompanyComplianceForm;