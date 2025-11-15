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

type CartLine = {
  stockCode: string;
  stockDescr: string;
  qty: number;
  price: number; // sellingPrice
  vat: number;   // percent
  available: number; // quantityOnHand at time of add
};

const SalesPage: React.FC = () => {
  const { toast } = useToast();

  // Local stock items state for sales
  const [items, setItems] = React.useState<StockItem[]>(initialStockItems);

  // Search/filter
  const [query, setQuery] = React.useState("");

  // Cart
  const [cart, setCart] = React.useState<CartLine[]>([]);

  // Payment
  const [method, setMethod] = React.useState<"cash" | "card">("cash");
  const [tendered, setTendered] = React.useState<string>("");

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
  const change = method === "cash" ? Math.max(0, tenderedNum - total) : 0;

  const completeSale = () => {
    if (cart.length === 0) {
      toast({ title: "Cart is empty", description: "Add items before completing the sale." });
      return;
    }
    if (method === "cash" && (!Number.isFinite(tenderedNum) || tenderedNum < total)) {
      toast({ title: "Insufficient cash", description: "Tendered amount must cover the total." });
      return;
    }

    // Validate again that all qty <= on hand
    for (const line of cart) {
      const stock = items.find((i) => i.stockCode === line.stockCode);
      if (!stock || line.qty > stock.quantityOnHand) {
        toast({ title: "Stock changed", description: `Update quantities for ${line.stockCode}.` });
        return;
      }
    }

    // Reduce stock on hand
    const nextItems = items.map((i) => {
      const line = cart.find((l) => l.stockCode === i.stockCode);
      if (!line) return i;
      return {
        ...i,
        quantityOnHand: i.quantityOnHand - line.qty
      };
    });

    setItems(nextItems);
    setCart([]);
    setTendered("");
    toast({
      title: "Sale completed",
      description: `Total ${total.toFixed(2)}${method === "cash" ? `, change ${change.toFixed(2)}` : ""}.`
    });
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
                    <TableHead className="w-24">Code</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead className="text-right w-24">On Hand</TableHead>
                    <TableHead className="text-right w-24">Price</TableHead>
                    <TableHead className="text-right w-28">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItems.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">
                        No items found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredItems.map((it) => (
                      <TableRow key={it.stockCode}>
                        <TableCell className="font-mono">{it.stockCode}</TableCell>
                        <TableCell className="truncate">{it.stockDescr}</TableCell>
                        <TableCell className="text-right">{it.quantityOnHand}</TableCell>
                        <TableCell className="text-right">{it.sellingPrice.toFixed(2)}</TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" onClick={() => addToCart(it)}>
                            Add
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

                {method === "cash" && (
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
            </CardContent>
          </Card>

          <PoweredBy className="pt-2" />
        </div>
      </div>
    </div>
  );
};

export default SalesPage;