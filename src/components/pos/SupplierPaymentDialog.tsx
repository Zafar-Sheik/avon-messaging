"use client";

import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Supplier } from "@/components/pos/supplierTypes";

interface SupplierPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  supplier: Supplier | null;
  onConfirm: (amount: number) => void;
}

const SupplierPaymentDialog: React.FC<SupplierPaymentDialogProps> = ({ open, onOpenChange, supplier, onConfirm }) => {
  const [amount, setAmount] = React.useState<string>("");

  React.useEffect(() => {
    if (open) {
      setAmount("");
    }
  }, [open, supplier]);

  const parsedAmount = parseFloat(amount);
  const valid = !Number.isNaN(parsedAmount) && parsedAmount > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Record Payment</DialogTitle>
          <DialogDescription>
            {supplier
              ? `Pay an amount to ${supplier.supplierName} (${supplier.supplierCode}).`
              : "Select a supplier first."}
          </DialogDescription>
        </DialogHeader>

        {supplier && (
          <div className="space-y-3">
            <div className="text-sm text-muted-foreground">
              Current Balance: <span className="font-semibold text-foreground">{supplier.currentBalance.toFixed(2)}</span>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="payment-amount">Amount to pay</Label>
              <Input
                id="payment-amount"
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              {!valid && amount.length > 0 && (
                <p className="text-xs text-destructive">Enter a valid amount greater than 0.</p>
              )}
            </div>
          </div>
        )}

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
            disabled={!supplier || !valid}
            onClick={() => onConfirm(parsedAmount)}
          >
            Pay
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SupplierPaymentDialog;