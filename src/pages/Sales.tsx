"use client";

import React from "react";
import { Link } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableHeader,
  TableHead,
  TableRow,
  TableCell,
  TableBody
} from "@/components/ui/table";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import PoweredBy from "@/components/PoweredBy";
import { ShoppingCart, Trash2, Minus, Plus } from "lucide-react";
import { initialStockItems, type StockItem } from "@/components/pos/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Printer, Save } from "lucide-react";
import { formatWhatsAppLink } from "@/utils/groupStore";
import { recordSale } from "@/utils/saleStore";
import { getCompanyProfile } from "@/utils/companyStore";
import { getAppSettings } from "@/utils/appSettingsStore";

type CartLine = {
  stockCode: string;
  stockDescr: string;
  qty: number;
  price: number; // sellingPrice
  vat: number;   // percent
  available: number; // quantityOnHand at time of add
};

// NEW: post-sale actions
type PostSaleAction = "print" | "download"; // Removed "whatsapp" and "email"

const SalesPage: React.FC = () => {
  const { toast } = useToast();

  // Local stock items state for sales
  const [items, setItems] = React.useState<StockItem[]>(initialStockItems);

  // Search/filter
  const [query, setQuery] = React.useState("");

  // Cart
  const [cart, setCart] = React.useState<CartLine[]>([]
  );

  // Payment
  const [method, setMethod] = React.useState<"cash" | "card">("cash");
  const [tendered, setTendered] = React.useState<string>("");

  // NEW: sale type and account sale fields
  const [saleType, setSaleType] = React.useState<"new" | "account">("new");
  const [customerCode, setCustomerCode] = React.useState<string>("");
  const [accountBalances, setAccountBalances] = React.useState<Record<string, number>>({});

  // NEW: dialog and action state
  const [isFinalizeOpen, setIsFinalizeOpen] = React.useState(false);
  const [selectedAction, setSelectedAction] = React.useState<PostSaleAction>("print");
  const [pendingSaleNo, setPendingSaleNo] = React.useState<string | null>(null);

  // NEW: company + settings
  const [company, setCompany] = React.useState<ReturnType<typeof getCompanyProfile> | null>(null);
  const [settings, setSettings] = React.useState(getAppSettings());

  React.useEffect(() => {
    setCompany(getCompanyProfile());
    setSettings(getAppSettings());

    const onSettingsChange = () => setSettings(getAppSettings());
    window.addEventListener("storage", onSettingsChange);
    return () => window.removeEventListener("storage", onSettingsChange);
  }, []);

  const filteredItems = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (i) =>
        i.stockCode.toLowerCase().includes(q) ||
        i.stockDescr.toLowerCase().includes(q)
    );
  }, [query, items]);

  const addToCart = (it: StockItem) => {
    // NEW: below-cost selection constraint
    if (!settings.allowStockBelowCost && it.sellingPrice < it.costPrice) {
      toast({
        title: "Blocked",
        description: `${it.stockCode} is priced below cost and selection is disabled.`,
      });
      return;
    }

    setCart((prev) => {
      const existing = prev.find((l) => l.stockCode === it.stockCode);
      const available = it.quantityOnHand;
      if (existing) {
        const nextQty = existing.qty + 1;
        if (nextQty > available) {
          toast({
            title: "Insufficient stock",
            description: `Only ${available} available for ${it.stockCode}.`
          });
          return prev;
        }
        return prev.map((l) =>
          l.stockCode === it.stockCode ? { ...l, qty: nextQty, available } : l
        );
      }

      if (available <= 0) {
        toast({
          title: "Out of stock",
          description: `${it.stockCode} has no stock on hand.`
        });
        return prev;
      }

      // NEW: don't sell below cost enforcement at add time (optional)
      if (settings.dontSellBelowCost && it.sellingPrice < it.costPrice) {
        toast({
          title: "Below cost",
          description: `${it.stockCode} is priced below cost. Selling is disabled.`,
        });
        return prev;
      }

      return [
        ...prev,
        {
          stockCode: it.stockCode,
          stockDescr: it.stockDescr,
          qty: 1,
          price: it.sellingPrice,
          vat: it.vat,
          available
        }
      ];
    });
  };

  const updateQty = (code: string, qty: number) => {
    setCart((prev) => {
      const line = prev.find((l) => l.stockCode === code);
      const available = items.find((i) => i.stockCode === code)?.quantityOnHand ?? 0;
      if (!line) return prev;
      if (qty < 1) qty = 1;
      if (qty > available) {
        toast({
          title: "Insufficient stock",
          description: `Only ${available} available for ${code}.`
        });
        return prev;
      }
      return prev.map((l) =>
        l.stockCode === code ? { ...l, qty, available } : l
      );
    });
  };

  const removeLine = (code: string) => {
    setCart((prev) => prev.filter((l) => l.stockCode !== code));
  };

  const subtotal = React.useMemo(
    () => cart.reduce((sum, l) => sum + l.price * l.qty, 0),
    [cart]
  );

  const tax = React.useMemo(
    () => cart.reduce((sum, l) => sum + (l.price * l.qty * (l.vat || 0)) / 100, 0),
    [cart]
  );

  const total = subtotal + tax;
  const tenderedNum = parseFloat(tendered || "0");
  const isCashPayment = saleType === "new" && method === "cash";
  const change = isCashPayment ? Math.max(0, tenderedNum - total) : 0;

  // NEW: sale number generator (daily sequence)
  const nextSaleNo = (): string => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const dateStr = `${y}${m}${day}`;
    const key = `pos_sale_seq_${dateStr}`;
    const current = parseInt(localStorage.getItem(key) || "0", 10) || 0;
    const next = current + 1;
    localStorage.setItem(key, String(next));
    return `S-${dateStr}-${String(next).padStart(4, "0")}`;
  };

  // NEW: build receipt text
  const buildReceiptText = (saleNo: string): string => {
    const lines = cart.map(
      (l) => `${l.stockCode} ${l.stockDescr}  x${l.qty}  @ ${l.price.toFixed(2)}  = ${(l.price * l.qty).toFixed(2)}`
    );
    const d = new Date();

    // NEW: company header + license
    const headerCompany: string[] = [];
    if (company?.name) headerCompany.push(company.name);
    if (company?.address) headerCompany.push(company.address);
    if (company?.phone) headerCompany.push(`Contact: ${company.phone}`);
    if (company?.licenseNumber) headerCompany.push(`License: ${company.licenseNumber}`);

    const header = [
      ...headerCompany,
      `Sale No: ${saleNo}`,
      `Date: ${d.toLocaleDateString()} ${d.toLocaleTimeString()}`,
      `Type: ${saleType === "account" ? "Account" : "New"} ${saleType === "new" ? `(${method})` : ""}`,
      saleType === "account" ? `Customer: ${customerCode || "-"}` : "",
      "".trim(),
    ].filter(Boolean);

    const totals = [
      `Subtotal: ${subtotal.toFixed(2)}`,
      `Tax: ${tax.toFixed(2)}`,
      `Total: ${total.toFixed(2)}`,
      isCashPayment ? `Tendered: ${tenderedNum.toFixed(2)}` : "",
      isCashPayment ? `Change: ${change.toFixed(2)}` : "",
    ].filter(Boolean);

    // NEW: slip messages
    const msgs = [
      settings.slipMessage1 || "",
      settings.slipMessage2 || "",
      settings.slipMessage3 || "",
    ].filter((m) => m.trim() !== "");

    return [...header, "Items:", ...lines, "", ...totals, "", ...msgs, "Thank you!"].join("\n");
  };

  // NEW: print slip (simple receipt window)
  const printSlip = (saleNo: string) => {
    const text = buildReceiptText(saleNo).replace(/\n/g, "<br/>");
    const html = `
      <html>
        <head>
          <title>${saleNo}</title>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <style>
            body { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; padding: 12px; }
            .receipt { width: 320px; max-width: 100%; }
            .print { display: none; }
            @media print { .no-print { display: none; } .receipt { width: 58mm; } }
          </style>
        </head>
        <body>
          <div class="receipt">${text}</div>
          <button class="no-print" onclick="window.print()">Print</button>
        </body>
      </html>
    `;
    const w = window.open("", "_blank", "noopener,noreferrer,width=400,height=600");
    if (!w) return;
    w.document.open();
    w.document.write(html);
    w.document.close();
    // auto print after load
    w.onload = () => w.print();
  };

  // NEW: download slip as .txt
  const downloadSlip = (saleNo: string) => {
    const text = buildReceiptText(saleNo);
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${saleNo}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  // UPDATED: do not finalize immediately; open action dialog first
  const completeSale = () => {
    if (cart.length === 0) {
      toast({ title: "Cart is empty", description: "Add items before completing the sale." });
      return;
    }

    // NEW: don't sell below cost enforcement before finalize
    if (settings.dontSellBelowCost) {
      const violating = cart.find((l) => {
        const stock = items.find((i) => i.stockCode === l.stockCode);
        return stock && stock.sellingPrice < stock.costPrice;
      });
      if (violating) {
        toast({
          title: "Below cost",
          description: `Item ${violating.stockCode} is priced below cost. You cannot complete this sale.`,
        });
        return;
      }
    }

    // Validate quantities against stock on hand
    for (const line of cart) {
      const stock = items.find((i) => i.stockCode === line.stockCode);
      if (!stock || line.qty > stock.quantityOnHand) {
        toast({ title: "Stock changed", description: `Update quantities for ${line.stockCode}.` });
        return;
      }
    }

    // Payment validation
    if (saleType === "new") {
      if (method === "cash" && (!Number.isFinite(tenderedNum) || tenderedNum < total)) {
        toast({ title: "Insufficient cash", description: "Tendered amount must cover the total." });
        return;
      }
    } else {
      if (!customerCode.trim()) {
        toast({ title: "Customer required", description: "Enter a customer code/name for account sale." });
        return;
      }
    }

    // Prepare sale number and open dialog
    const saleNo = nextSaleNo();
    setPendingSaleNo(saleNo);
    setIsFinalizeOpen(true);
  };

  // NEW: finalize stock + balances and reset
  const finalizeSale = (saleNo: string) => {
    // Reduce stock on hand
    const nextItems = items.map((i) => {
      const line = cart.find((l) => l.stockCode === i.stockCode);
      if (!line) return i;
      return { ...i, quantityOnHand: i.quantityOnHand - line.qty };
    });
    setItems(nextItems);

    // Record sale in local store
    const methodForStore: "cash" | "card" | "account" =
      saleType === "account" ? "account" : method;
    recordSale({
      saleNo,
      date: new Date().toISOString(),
      saleType,
      method: methodForStore,
      customerCode: saleType === "account" ? customerCode.trim() : undefined,
      subtotal,
      tax,
      total,
    });

    // Account sale: update balances
    if (saleType === "account") {
      const code = customerCode.trim();
      setAccountBalances((prev) => {
        const current = prev[code] ?? 0;
        return { ...prev, [code]: current + total };
      });
      toast({
        title: `Sale ${saleNo} recorded`,
        description: `Customer ${code} charged ${total.toFixed(2)}.`,
      });
    } else {
      toast({
        title: `Sale ${saleNo} completed`,
        description: `Total ${total.toFixed(2)}${isCashPayment ? `, change ${change.toFixed(2)}` : ""}.`,
      });
    }

    // Reset cart/payment fields
    setCart([]);
    setTendered("");
    setCustomerCode("");
    setPendingSaleNo(null);
    setIsFinalizeOpen(false);
  };

  // NEW: perform selected action then finalize
  const performSelectedAction = async () => {
    if (!pendingSaleNo) return;
    const saleNo = pendingSaleNo;
    const receiptText = buildReceiptText(saleNo);

    if (selectedAction === "print") {
      printSlip(saleNo);
      finalizeSale(saleNo);
      return;
    }

    if (selectedAction === "download") {
      downloadSlip(saleNo);
      finalizeSale(saleNo);
      return;
    }

    // Removed WhatsApp and Email actions
  };

  return (
    <div className="vibe-coding space-y-6">
      {/* Header */}
      <Card className="overflow-hidden border-none bg-gradient-to-r from-green-600 via-teal-600 to-cyan-600 text-white">
        <CardHeader className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingCart className="size-5" />
              <CardTitle className="text-lg md:text-xl font-bold">Cashier – Over the Counter</CardTitle>
            </div>
            <div className="flex gap-2">
              <Link to="/store-pos">
                <Button variant="secondary" className="bg-white/10 hover:bg-white/20 text-white">
                  Back to Store Pos
                </Button>
              </Link>
              <Button
                variant="secondary"
                className="bg-white/10 hover:bg-white/20 text-white"
                onClick={() => {
                  setCart([]);
                  setTendered("");
                  toast({ title: "Cleared", description: "Cart has been cleared." });
                }}
              >
                Clear Cart
              </Button>
            </div>
          </div>
          <CardDescription className="text-white/90 text-xs md:text-sm">
            Search items, add to cart, choose payment, and complete the sale.
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Product search and add */}
        <Card className="lg:col-span-6">
          <CardHeader className="p-4 pb-0">
            <CardTitle className="text-base font-semibold">Find Products</CardTitle>
            <CardDescription className="text-xs">Search by code or name</CardDescription>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            <Input
              placeholder="Search items..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="h-9 text-sm"
            />

            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead className="text-right w-24">On Hand</TableHead>
                    <TableHead className="text-right w-24">Price</TableHead>
                    <TableHead className="text-right w-28">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItems.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground">
                        No items found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredItems.map((it) => {
                      const imgSrc =
                        it.imageDataUrl && it.imageDataUrl.trim() !== ""
                          ? it.imageDataUrl
                          : "/placeholder.svg";
                      const isBelowCost = it.sellingPrice < it.costPrice;
                      return (
                        <TableRow key={it.stockCode}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <img
                                src={imgSrc}
                                alt={it.stockDescr}
                                className="h-12 w-12 rounded-md border object-cover bg-white"
                              />
                              <div className="min-w-0">
                                <div className="truncate font-medium">{it.stockDescr}</div>
                                <div className="text-xs text-muted-foreground font-mono truncate">
                                  {it.stockCode}
                                </div>
                                {isBelowCost && (
                                  <div className="text-[11px] text-red-600">Below cost</div>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">{it.quantityOnHand}</TableCell>
                          <TableCell className="text-right">{it.sellingPrice.toFixed(2)}</TableCell>
                          <TableCell className="text-right">
                            <Button size="sm" onClick={() => addToCart(it)} disabled={!settings.allowStockBelowCost && isBelowCost}>
                              Add
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Right: Cart and payment */}
        <div className="lg:col-span-6 space-y-6">
          <Card>
            <CardHeader className="p-4 pb-0">
              <CardTitle className="text-base font-semibold">Cart</CardTitle>
              <CardDescription className="text-xs">Adjust quantities and remove items as needed</CardDescription>
            </CardHeader>
            <CardContent className="p-4">
              <div className="rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-24">Code</TableHead>
                      <TableHead>Item</TableHead>
                      <TableHead className="text-right w-32">Qty</TableHead>
                      <TableHead className="text-right w-24">Price</TableHead>
                      <TableHead className="text-right w-24">Line</TableHead>
                      <TableHead className="text-right w-20">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cart.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground">
                          Cart is empty.
                        </TableCell>
                      </TableRow>
                    ) : (
                      cart.map((l) => (
                        <TableRow key={l.stockCode}>
                          <TableCell className="font-mono">{l.stockCode}</TableCell>
                          <TableCell className="truncate">{l.stockDescr}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => updateQty(l.stockCode, l.qty - 1)}
                              >
                                <Minus className="h-4 w-4" />
                              </Button>
                              <Input
                                type="number"
                                min={1}
                                step={1}
                                value={l.qty}
                                onChange={(e) => updateQty(l.stockCode, Number(e.target.value || 1))}
                                className="h-8 w-16 text-right text-sm"
                              />
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => updateQty(l.stockCode, l.qty + 1)}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                            <div className="text-[11px] text-muted-foreground text-right">
                              Available: {l.available}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">{l.price.toFixed(2)}</TableCell>
                          <TableCell className="text-right">{(l.price * l.qty).toFixed(2)}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="destructive"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => removeLine(l.stockCode)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="p-4 pb-0">
              <CardTitle className="text-base font-semibold">Payment</CardTitle>
              <CardDescription className="text-xs">Choose method and complete sale</CardDescription>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* NEW: Sale Type */}
                <div className="space-y-1.5">
                  <Label className="text-sm">Sale Type</Label>
                  <Select value={saleType} onValueChange={(v: "new" | "account") => setSaleType(v)}>
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">New Sale (Counter)</SelectItem>
                      <SelectItem value="account">Account Sale</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Show method only for New Sale */}
                {saleType === "new" && (
                  <div className="space-y-1.5">
                    <Label className="text-sm">Method</Label>
                    <Select value={method} onValueChange={(v: "cash" | "card") => setMethod(v)}>
                      <SelectTrigger className="h-9 text-sm">
                        <SelectValue placeholder="Select method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cash">Cash</SelectItem>
                        <SelectItem value="card">Card</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="space-y-1.5">
                  <Label className="text-sm">Subtotal</Label>
                  <Input readOnly value={subtotal.toFixed(2)} className="h-9 text-sm" />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-sm">Tax</Label>
                  <Input readOnly value={tax.toFixed(2)} className="h-9 text-sm" />
                </div>

                <div className="space-y-1.5 md:col-span-1">
                  <Label className="text-sm">Total</Label>
                  <Input readOnly value={total.toFixed(2)} className="h-9 text-sm font-semibold" />
                </div>

                {/* Account Sale: Customer field */}
                {saleType === "account" && (
                  <div className="space-y-1.5 md:col-span-1">
                    <Label className="text-sm">Customer</Label>
                    <Input
                      placeholder="Customer code or name"
                      value={customerCode}
                      onChange={(e) => setCustomerCode(e.target.value)}
                      className="h-9 text-sm"
                    />
                    <div className="text-[11px] text-muted-foreground">
                      This sale will be charged to the customer's account.
                    </div>
                  </div>
                )}

                {/* Cash tendered + change only for New Sale and cash */}
                {saleType === "new" && method === "cash" && (
                  <>
                    <div className="space-y-1.5">
                      <Label className="text-sm">Tendered</Label>
                      <Input
                        type="number"
                        inputMode="decimal"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        value={tendered}
                        onChange={(e) => setTendered(e.target.value)}
                        className="h-9 text-sm"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-sm">Change</Label>
                      <Input readOnly value={change.toFixed(2)} className="h-9 text-sm" />
                    </div>
                  </>
                )}
              </div>

              <div className="flex justify-end">
                <Button
                  className="bg-green-600 hover:bg-green-700 text-white"
                  onClick={completeSale}
                >
                  Complete Sale
                </Button>
              </div>

              {/* Optional: show in-memory balances summary */}
              {Object.keys(accountBalances).length > 0 && (
                <div className="pt-2 text-xs text-muted-foreground">
                  Account balances:{" "}
                  {Object.entries(accountBalances).map(([code, bal]) => `${code}: ${bal.toFixed(2)}`).join(" • ")}
                </div>
              )}
            </CardContent>
          </Card>

          {/* NEW: Finalize dialog */}
          <Dialog open={isFinalizeOpen} onOpenChange={setIsFinalizeOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Finalize Sale</DialogTitle>
                <DialogDescription>
                  Choose how you want to output the receipt. The sale will be updated after your choice.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-sm">Sale No</Label>
                    <Input readOnly value={pendingSaleNo || ""} className="h-9 text-sm font-mono" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm">Action</Label>
                    <Select value={selectedAction} onValueChange={(v: PostSaleAction) => setSelectedAction(v)}>
                      <SelectTrigger className="h-9 text-sm">
                        <SelectValue placeholder="Select action" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="print">
                          <div className="flex items-center gap-2"><Printer className="h-4 w-4" /> Print Slip</div>
                        </SelectItem>
                        <SelectItem value="download">
                          <div className="flex items-center gap-2"><Save className="h-4 w-4" /> Store on PC</div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="rounded-md border p-3 bg-muted/30">
                  <div className="text-xs font-medium mb-1">Receipt Preview</div>
                  <pre className="text-xs whitespace-pre-wrap">{pendingSaleNo ? buildReceiptText(pendingSaleNo) : ""}</pre>
                </div>
              </div>

              <DialogFooter>
                <Button variant="ghost" onClick={() => setIsFinalizeOpen(false)}>Cancel</Button>
                <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={performSelectedAction}>
                  Confirm & Update
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <PoweredBy className="pt-2" />
        </div>
      </div>
    </div>
  );
};

export default SalesPage;