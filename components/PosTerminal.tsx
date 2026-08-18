"use client";

import React, { useState, useEffect } from "react";
import {
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  Zap,
  Smartphone,
  CheckCircle2,
  Gift,
  Printer,
  RefreshCw,
  Search,
  UserCheck,
  Receipt,
  Sparkles,
  CreditCard,
} from "lucide-react";

interface CatalogItem {
  id: string;
  name: string;
  price: number;
  category: string;
}

const DEFAULT_CATALOG: CatalogItem[] = [
  { id: "1", name: "Espresso Single", price: 3.5, category: "Coffee" },
  { id: "2", name: "Flat White / Latte", price: 4.5, category: "Coffee" },
  { id: "3", name: "Iced Caramel Macchiato", price: 5.5, category: "Coffee" },
  { id: "4", name: "Butter Croissant", price: 4.0, category: "Bakery" },
  { id: "5", name: "Avocado Toast", price: 9.5, category: "Food" },
  { id: "6", name: "Matcha Latte", price: 5.5, category: "Tea" },
];

export const PosTerminal: React.FC = () => {
  const [cart, setCart] = useState<Array<{ item: CatalogItem; qty: number }>>([]);
  const [customItemName, setCustomItemName] = useState("");
  const [customItemPrice, setCustomItemPrice] = useState("");

  // Customer state
  const [custPhone, setCustPhone] = useState("9800000000");
  const [businessSlug, setBusinessSlug] = useState("coffee-house");
  const [customer, setCustomer] = useState<{
    id: string;
    name?: string;
    phone: string;
    stampBalance: number;
  } | null>(null);
  const [rewards, setRewards] = useState<
    Array<{ id: string; name: string; description?: string; stampsRequired: number }>
  >([]);
  const [selectedReward, setSelectedReward] = useState<{
    id: string;
    name: string;
    stampsRequired: number;
  } | null>(null);

  const [loading, setLoading] = useState(false);
  const [isTapping, setIsTapping] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [receipt, setReceipt] = useState<{
    orderId: string;
    timestamp: string;
    customerPhone: string;
    items: Array<{ name: string; price: number; qty: number }>;
    subtotal: number;
    stampsEarned: number;
    rewardRedeemed?: string;
    newBalance: number;
  } | null>(null);

  // Auto customer search
  const handleCustomerLookup = async (phoneToSearch?: string) => {
    const targetPhone = phoneToSearch || custPhone;
    if (!targetPhone) return;
    setLoading(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/customer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: businessSlug, phone: targetPhone }),
      });
      const data = await res.json();
      if (res.ok && data.customer) {
        setCustomer(data.customer);
        fetchCustomerRewards(businessSlug);
        setFeedback({
          type: "success",
          text: `Customer ${data.customer.name || targetPhone} identified! Balance: ${data.customer.stampBalance} Stamps`,
        });
      } else {
        setCustomer(null);
        setFeedback({
          type: "error",
          text: data.message || "Customer not found. You can add stamps to create account automatically.",
        });
      }
    } catch {
      setFeedback({ type: "error", text: "Customer lookup failed" });
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomerRewards = async (slug: string) => {
    try {
      const res = await fetch(`/api/customer/rewards?slug=${encodeURIComponent(slug)}`);
      const data = await res.json();
      if (res.ok && data.rewards) {
        setRewards(data.rewards);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSimulateNFCTap = async () => {
    setIsTapping(true);
    setTimeout(async () => {
      await handleCustomerLookup();
      setIsTapping(false);
    }, 1000);
  };

  const addToCart = (item: CatalogItem) => {
    setCart((prev) => {
      const existingIdx = prev.findIndex((i) => i.item.id === item.id);
      if (existingIdx >= 0) {
        const updated = [...prev];
        updated[existingIdx].qty += 1;
        return updated;
      }
      return [...prev, { item, qty: 1 }];
    });
  };

  const updateQty = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((i) => {
          if (i.item.id === id) {
            const newQty = i.qty + delta;
            return newQty > 0 ? { ...i, qty: newQty } : null;
          }
          return i;
        })
        .filter(Boolean) as Array<{ item: CatalogItem; qty: number }>
    );
  };

  const addCustomItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customItemName || !customItemPrice) return;
    const newItem: CatalogItem = {
      id: `custom-${Date.now()}`,
      name: customItemName,
      price: parseFloat(customItemPrice),
      category: "Custom",
    };
    addToCart(newItem);
    setCustomItemName("");
    setCustomItemPrice("");
  };

  const subtotal = cart.reduce((sum, i) => sum + i.item.price * i.qty, 0);
  // Calculate stamps earned: 1 stamp per $5 spent, minimum 1 if subtotal > 0
  const stampsToEarn = subtotal > 0 ? Math.max(1, Math.floor(subtotal / 5)) : 0;

  const handleCompleteSale = async () => {
    if (!customer) {
      setFeedback({ type: "error", text: "Please scan customer NFC tap or search phone first!" });
      return;
    }
    if (cart.length === 0) {
      setFeedback({ type: "error", text: "Cart is empty. Add items to register sale." });
      return;
    }

    setLoading(true);
    setFeedback(null);

    let updatedBalance = customer.stampBalance;

    try {
      // Step 1: If reward selected, redeem reward first
      if (selectedReward) {
        const redeemRes = await fetch(`/api/business/rewards/${customer.id}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ rewardId: selectedReward.id }),
        });
        const redeemData = await redeemRes.json();
        if (!redeemRes.ok) {
          throw new Error(redeemData.message || "Failed to redeem selected reward");
        }
        updatedBalance = redeemData.customer.stampBalance;
      }

      // Step 2: Issue earned stamps
      if (stampsToEarn > 0) {
        const stampRes = await fetch(`/api/business/customers/${customer.id}/stamps`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: stampsToEarn,
            description: `POS Sale Checkout ($${subtotal.toFixed(2)})`,
          }),
        });
        const stampData = await stampRes.json();
        if (!stampRes.ok) {
          throw new Error(stampData.message || "Failed to issue stamps");
        }
        updatedBalance = stampData.customer.stampBalance;
      }

      // Generate Digital Receipt
      const receiptData = {
        orderId: `ORD-${Math.floor(100000 + Math.random() * 900000)}`,
        timestamp: new Date().toLocaleString(),
        customerPhone: customer.phone,
        items: cart.map((i) => ({ name: i.item.name, price: i.item.price, qty: i.qty })),
        subtotal,
        stampsEarned: stampsToEarn,
        rewardRedeemed: selectedReward?.name,
        newBalance: updatedBalance,
      };

      setReceipt(receiptData);
      setCustomer((prev) => (prev ? { ...prev, stampBalance: updatedBalance } : null));
      setCart([]);
      setSelectedReward(null);
      setFeedback({ type: "success", text: "🎉 Sale completed & digital stamps updated!" });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Sale completion failed";
      setFeedback({ type: "error", text: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* POS Terminal Header Bar */}
      <div className="card-elevated rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold tracking-widest text-[#84CC16] uppercase bg-[#84CC16]/10 px-2.5 py-1 rounded-full border border-[#84CC16]/30">
            Live Point of Sale Register
          </span>
          <h2 className="text-2xl font-black text-[#09090B] mt-1 tracking-tight">
            UPAY<span className="text-[#84CC16]">Λ</span> POS Terminal
          </h2>
          <p className="text-xs text-slate-500">
            Build checkout cart, tap customer NFC card, apply reward discounts, and issue digital stamps instantly.
          </p>
        </div>

        {/* Customer Quick Scanner */}
        <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200">
          <input
            type="tel"
            value={custPhone}
            onChange={(e) => setCustPhone(e.target.value)}
            placeholder="Customer Phone"
            className="w-36 bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-[#09090B] font-mono focus:outline-none focus:border-[#84CC16]"
          />

          <button
            onClick={() => handleCustomerLookup()}
            disabled={loading}
            className="bg-slate-900 text-white font-semibold text-xs px-3 py-1.5 rounded-lg hover:bg-slate-800 transition flex items-center gap-1"
          >
            <Search className="w-3.5 h-3.5" /> Lookup
          </button>

          <button
            onClick={handleSimulateNFCTap}
            disabled={isTapping || loading}
            className={`font-bold text-xs px-3 py-1.5 rounded-lg transition flex items-center gap-1 text-slate-950 ${
              isTapping
                ? "bg-[#84CC16] nfc-wave-light"
                : "bg-[#84CC16] hover:bg-[#65a30d] text-white"
            }`}
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            {isTapping ? "Tapping..." : "NFC Tap"}
          </button>
        </div>
      </div>

      {feedback && (
        <div
          className={`p-3 rounded-xl text-xs font-semibold border ${
            feedback.type === "success"
              ? "bg-[#84CC16]/10 border-[#84CC16]/40 text-[#4d7c0f]"
              : "bg-red-500/10 border-red-500/30 text-red-600"
          }`}
        >
          {feedback.text}
        </div>
      )}

      {/* Main POS Register Layout: Grid (Catalog + Cart) */}
      <div className="grid lg:grid-cols-12 gap-6">
        {/* Left Column: Product Catalog Grid (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="card-elevated rounded-2xl p-6">
            <h3 className="text-sm font-bold text-[#09090B] uppercase tracking-wider mb-4 flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-[#84CC16]" /> Fast Item Selection
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {DEFAULT_CATALOG.map((item) => (
                <button
                  key={item.id}
                  onClick={() => addToCart(item)}
                  className="bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl p-3 text-left transition hover:border-[#84CC16] group"
                >
                  <span className="text-[10px] uppercase font-bold text-slate-400">
                    {item.category}
                  </span>
                  <h4 className="text-xs font-bold text-[#09090B] group-hover:text-[#65a30d] truncate">
                    {item.name}
                  </h4>
                  <div className="text-sm font-extrabold text-[#09090B] mt-1">
                    ${item.price.toFixed(2)}
                  </div>
                </button>
              ))}
            </div>

            {/* Custom Item Adder */}
            <div className="mt-6 pt-4 border-t border-slate-100">
              <h4 className="text-xs font-semibold text-slate-500 mb-2">Add Custom Order Item</h4>
              <form onSubmit={addCustomItem} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Item Name (e.g. Espresso Beans)"
                  value={customItemName}
                  onChange={(e) => setCustomItemName(e.target.value)}
                  className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-[#09090B]"
                />
                <input
                  type="number"
                  step="0.5"
                  placeholder="Price $"
                  value={customItemPrice}
                  onChange={(e) => setCustomItemPrice(e.target.value)}
                  className="w-24 bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-[#09090B]"
                />
                <button
                  type="submit"
                  className="bg-slate-900 text-white font-semibold text-xs px-3 py-1.5 rounded-lg hover:bg-slate-800 transition"
                >
                  + Add
                </button>
              </form>
            </div>
          </div>

          {/* Customer Profile & Rewards Selector Card */}
          {customer && (
            <div className="card-elevated rounded-2xl p-6 bg-emerald-50/40 border border-emerald-200/60">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#84CC16] text-white flex items-center justify-center font-bold">
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#09090B]">
                      {customer.name || "Customer Registered"}
                    </h4>
                    <p className="text-xs text-slate-500 font-mono">{customer.phone}</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xl font-black text-[#65a30d]">
                    {customer.stampBalance} Stamps
                  </span>
                  <p className="text-[10px] text-slate-500">Active Balance</p>
                </div>
              </div>

              {/* Available Rewards for Redemption */}
              <div className="border-t border-emerald-200/60 pt-3">
                <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1">
                  <Gift className="w-3.5 h-3.5 text-[#84CC16]" /> Available Rewards to Apply
                </h5>

                {rewards.length === 0 ? (
                  <p className="text-xs text-slate-500">No active rewards setup for business.</p>
                ) : (
                  <div className="space-y-2">
                    {rewards.map((r) => {
                      const canRedeem = customer.stampBalance >= r.stampsRequired;
                      const isSelected = selectedReward?.id === r.id;

                      return (
                        <div
                          key={r.id}
                          className={`p-2.5 rounded-xl border text-xs flex items-center justify-between transition ${
                            isSelected
                              ? "bg-[#84CC16]/20 border-[#84CC16] text-[#4d7c0f] font-bold"
                              : "bg-white border-slate-200 text-slate-800"
                          }`}
                        >
                          <div>
                            <span className="font-semibold">{r.name}</span>
                            <span className="text-[10px] text-slate-500 block">
                              Requires {r.stampsRequired} stamps
                            </span>
                          </div>

                          <button
                            onClick={() =>
                              setSelectedReward(
                                isSelected ? null : { id: r.id, name: r.name, stampsRequired: r.stampsRequired }
                              )
                            }
                            disabled={!canRedeem}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                              isSelected
                                ? "bg-[#84CC16] text-white"
                                : canRedeem
                                ? "bg-slate-900 text-white hover:bg-slate-800"
                                : "bg-slate-100 text-slate-400 cursor-not-allowed"
                            }`}
                          >
                            {isSelected ? "Selected" : canRedeem ? "Apply Reward" : "Need Stamps"}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Order Checkout Summary (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="card-elevated rounded-2xl p-6 flex flex-col h-full justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                <h3 className="text-sm font-bold text-[#09090B] uppercase tracking-wider flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-[#84CC16]" /> Active Order Cart
                </h3>
                <span className="text-xs text-slate-400 font-mono">
                  {cart.reduce((a, b) => a + b.qty, 0)} Items
                </span>
              </div>

              {/* Cart List */}
              {cart.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs">
                  <ShoppingBag className="w-8 h-8 mx-auto mb-2 opacity-40 text-slate-300" />
                  Cart is currently empty. Click catalog items to build register order.
                </div>
              ) : (
                <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                  {cart.map(({ item, qty }) => (
                    <div
                      key={item.id}
                      className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-between"
                    >
                      <div>
                        <h4 className="text-xs font-bold text-[#09090B]">{item.name}</h4>
                        <span className="text-xs text-slate-500 font-semibold">
                          ${(item.price * qty).toFixed(2)} (${item.price.toFixed(2)} ea)
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQty(item.id, -1)}
                          className="w-6 h-6 rounded-lg bg-white border border-slate-300 text-slate-700 flex items-center justify-center hover:bg-slate-100"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-bold w-4 text-center">{qty}</span>
                        <button
                          onClick={() => updateQty(item.id, 1)}
                          className="w-6 h-6 rounded-lg bg-white border border-slate-300 text-slate-700 flex items-center justify-center hover:bg-slate-100"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Calculations & Checkout Button */}
            <div className="border-t border-slate-100 pt-4 mt-6 space-y-3">
              <div className="flex justify-between text-xs text-slate-600">
                <span>Subtotal</span>
                <span className="font-semibold text-[#09090B]">${subtotal.toFixed(2)}</span>
              </div>

              {selectedReward && (
                <div className="flex justify-between text-xs text-[#65a30d] font-bold">
                  <span>Applied Reward</span>
                  <span>{selectedReward.name} (-{selectedReward.stampsRequired} Stamps)</span>
                </div>
              )}

              <div className="flex justify-between text-xs text-emerald-700 font-bold bg-emerald-50 p-2 rounded-lg border border-emerald-200">
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> Stamps to Earn
                </span>
                <span>+{stampsToEarn} Digital Stamp(s)</span>
              </div>

              <div className="flex justify-between text-lg font-black text-[#09090B] pt-2 border-t border-slate-100">
                <span>Total Amount</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>

              <button
                onClick={handleCompleteSale}
                disabled={loading || cart.length === 0}
                className="w-full bg-[#84CC16] hover:bg-[#65a30d] text-white font-bold py-3 px-4 rounded-xl text-sm transition flex items-center justify-center gap-2 glow-lime-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <CreditCard className="w-4 h-4" />
                )}
                Complete Sale & Issue Stamps
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Digital Receipt Modal */}
      {receipt && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full border border-slate-200 shadow-2xl space-y-4 font-mono text-xs">
            <div className="text-center pb-3 border-b border-slate-200">
              <h4 className="text-base font-black text-[#09090B] tracking-tight">UPAYA DIGITAL RECEIPT</h4>
              <p className="text-[10px] text-slate-500">{receipt.timestamp}</p>
              <p className="text-[10px] text-slate-500 font-bold mt-1">Ref: {receipt.orderId}</p>
            </div>

            <div className="space-y-1 text-slate-700">
              <p>Customer: <span className="font-bold text-[#09090B]">{receipt.customerPhone}</span></p>
              <div className="border-t border-dashed border-slate-300 my-2" />
              {receipt.items.map((i, idx) => (
                <div key={idx} className="flex justify-between">
                  <span>{i.qty}x {i.name}</span>
                  <span>${(i.price * i.qty).toFixed(2)}</span>
                </div>
              ))}
              <div className="border-t border-dashed border-slate-300 my-2" />
              <div className="flex justify-between font-bold text-[#09090B] text-sm">
                <span>TOTAL PAID:</span>
                <span>${receipt.subtotal.toFixed(2)}</span>
              </div>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-center space-y-1 text-emerald-800 font-sans">
              <p className="font-bold text-xs flex items-center justify-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-[#84CC16]" /> Stamps Issued: +{receipt.stampsEarned}
              </p>
              {receipt.rewardRedeemed && (
                <p className="text-[11px] font-semibold text-emerald-700">
                  Redeemed Reward: {receipt.rewardRedeemed}
                </p>
              )}
              <p className="text-xs font-black text-[#09090B] pt-1">
                New Stamp Balance: {receipt.newBalance} Stamps
              </p>
            </div>

            <button
              onClick={() => setReceipt(null)}
              className="w-full bg-slate-900 text-white font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-2 hover:bg-slate-800 transition font-sans"
            >
              <Printer className="w-3.5 h-3.5" /> Close & New Order
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
