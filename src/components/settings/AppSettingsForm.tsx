"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import SlipPreview from "@/components/pos/SlipPreview";
import { Settings2, Save, Trash2, Loader2 } from "lucide-react";
import type { AppSettings } from "@/utils/appSettingsStore";
import type { CompanyProfile } from "@/utils/companyStore";

interface AppSettingsFormProps {
  appSettings: AppSettings;
  companyProfile: CompanyProfile | null;
  onSave: (settings: Partial<AppSettings>) => Promise<void>;
  onClear: () => Promise<void>;
  saving: boolean;
  clearing: boolean;
}

const AppSettingsForm: React.FC<AppSettingsFormProps> = ({
  appSettings,
  companyProfile,
  onSave,
  onClear,
  saving,
  clearing,
}) => {
  const [allowStockBelowCost, setAllowStockBelowCost] = React.useState<boolean>(appSettings.allowStockBelowCost);
  const [dontSellBelowCost, setDontSellBelowCost] = React.useState<boolean>(appSettings.dontSellBelowCost);
  const [slipMessage1, setSlipMessage1] = React.useState<string>(appSettings.slipMessage1 || "");
  const [slipMessage2, setSlipMessage2] = React.useState<string>(appSettings.slipMessage2 || "");
  const [slipMessage3, setSlipMessage3] = React.useState<string>(appSettings.slipMessage3 || "");

  React.useEffect(() => {
    setAllowStockBelowCost(appSettings.allowStockBelowCost);
    setDontSellBelowCost(appSettings.dontSellBelowCost);
    setSlipMessage1(appSettings.slipMessage1 || "");
    setSlipMessage2(appSettings.slipMessage2 || "");
    setSlipMessage3(appSettings.slipMessage3 || "");
  }, [appSettings]);

  const handleSave = () => {
    onSave({
      allowStockBelowCost,
      dontSellBelowCost,
      slipMessage1: slipMessage1.trim(),
      slipMessage2: slipMessage2.trim(),
      slipMessage3: slipMessage3.trim(),
    });
  };

  return (
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

        <SlipPreview
          company={companyProfile}
          messages={[slipMessage1, slipMessage2, slipMessage3]}
          className="mt-2"
        />
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
          disabled={saving || clearing}
          className="bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-2"
        >
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="size-4" />}
          Save POS Settings
        </Button>
      </CardFooter>
    </Card>
  );
};

export default AppSettingsForm;