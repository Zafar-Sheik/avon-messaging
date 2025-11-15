"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Settings } from "lucide-react";
import PoweredBy from "@/components/PoweredBy";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import SlipPreview from "@/components/pos/SlipPreview";
import { getAppSettings, saveAppSettings, clearAppSettings } from "@/utils/appSettingsStore";
import { getCompanyProfile } from "@/utils/companyStore";
import { showSuccess } from "@/utils/toast";
import { Save, Trash2 } from "lucide-react";

const PosSettingsPage: React.FC = () => {
  const [allowStockBelowCost, setAllowStockBelowCost] = React.useState<boolean>(true);
  const [dontSellBelowCost, setDontSellBelowCost] = React.useState<boolean>(false);
  const [slipMessage1, setSlipMessage1] = React.useState<string>("");
  const [slipMessage2, setSlipMessage2] = React.useState<string>("");
  const [slipMessage3, setSlipMessage3] = React.useState<string>("");

  const [company, setCompany] = React.useState(getCompanyProfile());

  React.useEffect(() => {
    const s = getAppSettings();
    setAllowStockBelowCost(s.allowStockBelowCost);
    setDontSellBelowCost(s.dontSellBelowCost);
    setSlipMessage1(s.slipMessage1 || "");
    setSlipMessage2(s.slipMessage2 || "");
    setSlipMessage3(s.slipMessage3 || "");

    const c = getCompanyProfile();
    setCompany(c);
  }, []);

  const handleSaveAppSettings = () => {
    saveAppSettings({
      allowStockBelowCost,
      dontSellBelowCost,
      slipMessage1: slipMessage1.trim(),
      slipMessage2: slipMessage2.trim(),
      slipMessage3: slipMessage3.trim(),
    });
    showSuccess("Store POS settings saved");
  };

  const handleClearAppSettings = () => {
    clearAppSettings();
    setAllowStockBelowCost(true);
    setDontSellBelowCost(false);
    setSlipMessage1("");
    setSlipMessage2("");
    setSlipMessage3("");
    showSuccess("Store POS settings cleared");
  };

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden border-none bg-gradient-to-r from-gray-600 via-blue-600 to-purple-600 text-white">
        <CardHeader className="p-6">
          <CardTitle className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <Settings className="size-6" />
            Settings
          </CardTitle>
          <CardDescription className="text-white/90">
            Configure store POS preferences and integrations.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 pt-0 flex gap-3">
          <Link to="/store-pos">
            <Button variant="secondary" className="bg-white/10 hover:bg-white/20 text-white">Back to Store Pos</Button>
          </Link>
        </CardContent>
      </Card>

      <Card className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
        <CardHeader className="p-0 pb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Settings className="size-5 text-purple-600" />
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
            company={company}
            messages={[slipMessage1, slipMessage2, slipMessage3]}
            className="mt-2"
          />
        </CardContent>

        <div className="flex gap-3 justify-end pt-6">
          <Button
            variant="outline"
            onClick={handleClearAppSettings}
            className="border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            <Trash2 className="size-4 mr-2" />
            Clear
          </Button>
          <Button
            onClick={handleSaveAppSettings}
            className="bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-2"
          >
            <Save className="size-4" />
            Save POS Settings
          </Button>
        </div>
      </Card>

      <PoweredBy className="pt-2" />
    </div>
  );
};

export default PosSettingsPage;