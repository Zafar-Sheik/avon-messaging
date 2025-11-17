"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { showError } from "@/utils/toast";

export type Mapping = {
  name: string;
  phone: string;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  headers: string[];
  initialMapping: Mapping;
  onConfirm: (mapping: Mapping) => void;
};

const ColumnMappingDialog: React.FC<Props> = ({
  open,
  onOpenChange,
  headers,
  initialMapping,
  onConfirm,
}) => {
  const [mapping, setMapping] = React.useState<Mapping>(initialMapping);

  React.useEffect(() => {
    if (open) {
      setMapping(initialMapping);
    }
  }, [open, initialMapping]);

  const handleConfirm = () => {
    if (!mapping.phone) {
      showError("Phone column is required.");
      return;
    }
    onConfirm(mapping);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Map Columns</DialogTitle>
          <DialogDescription>
            Match your spreadsheet columns to the required contact fields.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-3 items-center gap-4">
            <Label htmlFor="map-name" className="text-right">
              Name (Optional)
            </Label>
            <Select
              value={mapping.name}
              onValueChange={(value) => setMapping((m) => ({ ...m, name: value }))}
            >
              <SelectTrigger id="map-name" className="col-span-2">
                <SelectValue placeholder="Select a column" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">(None)</SelectItem>
                {headers.map((h) => (
                  <SelectItem key={`name-${h}`} value={h}>
                    {h}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-3 items-center gap-4">
            <Label htmlFor="map-phone" className="text-right font-semibold">
              Phone (Required)
            </Label>
            <Select
              value={mapping.phone}
              onValueChange={(value) => setMapping((m) => ({ ...m, phone: value }))}
            >
              <SelectTrigger id="map-phone" className="col-span-2">
                <SelectValue placeholder="Select a column" />
              </SelectTrigger>
              <SelectContent>
                {headers.map((h) => (
                  <SelectItem key={`phone-${h}`} value={h}>
                    {h}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={!mapping.phone}>
            Confirm & Import
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ColumnMappingDialog;