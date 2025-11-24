"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings2, Save, Trash2, Loader2 } from "lucide-react";
import type { CompanyProfile } from "@/utils/companyStore";

interface CompanyProfileFormProps {
  profile: CompanyProfile | null;
  onSave: (profile: CompanyProfile) => Promise<void>;
  onClear: () => Promise<void>;
  saving: boolean;
  clearing: boolean;
}

const CompanyProfileForm: React.FC<CompanyProfileFormProps> = ({
  profile,
  onSave,
  onClear,
  saving,
  clearing,
}) => {
  const [name, setName] = React.useState(profile?.name || "");
  const [email, setEmail] = React.useState(profile?.email || "");
  const [phone, setPhone] = React.useState(profile?.phone || "");
  const [website, setWebsite] = React.useState(profile?.website || "");
  const [address, setAddress] = React.useState(profile?.address || "");
  const [licenseNumber, setLicenseNumber] = React.useState(profile?.licenseNumber || "");

  React.useEffect(() => {
    setName(profile?.name || "");
    setEmail(profile?.email || "");
    setPhone(profile?.phone || "");
    setWebsite(profile?.website || "");
    setAddress(profile?.address || "");
    setLicenseNumber(profile?.licenseNumber || "");
  }, [profile]);

  const handleSave = () => {
    onSave({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim() || undefined,
      website: website.trim() || undefined,
      address: address.trim() || undefined,
      licenseNumber: licenseNumber.trim() || undefined,
      vatNumber: profile?.vatNumber, // Preserve other fields
      regNumber: profile?.regNumber, // Preserve other fields
      logoDataUrl: profile?.logoDataUrl, // Preserve other fields
    });
  };

  return (
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
          onClick={onClear}
          disabled={clearing || saving}
          className="border-gray-300 text-gray-700 hover:bg-gray-50"
        >
          {clearing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="size-4 mr-2" />}
          Clear
        </Button>
        <Button
          onClick={handleSave}
          disabled={saving || clearing || !name.trim() || !email.trim()}
          className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
        >
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="size-4" />}
          Save Profile
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CompanyProfileForm;