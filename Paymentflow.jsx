// PaymentFlow.jsx
// Drop this into your project and import CheckoutSheet + PaymentSuccess into App.jsx
// Handles: buyer info → payment summary → Billplz redirect → success screen

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";

const fmtRM = v => isNaN(parseFloat(v)) ? "0.00" : parseFloat(v).toFixed(2);

// ─── PAYMENT METHOD ICONS ────────────────────────────────────────────────────
const PM_ICONS = {
  tng:    { label:"Touch 'n Go eWallet", icon:"💙", color:"bg-blue-600"  },
  fpx:    { label:"Online Banking (FPX)",  icon:"🏦", color:"bg-slate-700" },
  card:   { label:"Debit / Credit Card",   icon:"💳", color:"bg-indigo-600"},
  duitnow:{ label:"DuitNow QR",            icon:"🔴", color:"bg-red-600"   },
  grabpay:{ label:"GrabPay",               icon:"🟢", color:"bg-green-600" },
  boost:  { label:"Boost eWallet",         icon:"🔵", color:"bg-cyan-600"  },
};

// ─── BUYER CHECKOUT SHEET ────────────────────────────────────────────────────
export function CheckoutSheet({ cart, vendorGroups, t, onClose, onSuccess }) {
  const [step, setStep]       = useState("summary"); // summary → info → paying → done
  const [form, setForm]       = useState({ name:"", email:"", phone:"" });
  const [deliveryMode, setDeliveryMode] = useState("pickup");
  const [paying, setPaying]   = useState(false);
  const [error, setError]     = useState("");
  const [orders, setOrders]   = useState([]);

  const upd = (k, v) => setForm(p => ({...p, [k]: v}));

  // Calculate totals
  const itemsTotal = cart.reduce((s, i) => s + i.dealPrice, 0);
  const deliveryCost = deliveryMode === "delivery"
    ? vendorGroups.reduce((s, v) => v.unlocked ? s : s + 8, 0)
    : 0;
  const totalPaid    = itemsTotal + deliveryCost;
  const commission   = totalPaid * 0.10;
  const vendorTotal  = totalPaid - commission - deliveryCost;

  const canProceed = form.name.trim() && form.email.includes("@");

  // Group cart items by vendor
  const byVendor = cart.reduce((acc, item) => {
    if (!acc[item.vendorId]) acc[item.vendorId] = { vendorId: item.vendorId, vendorName: item.vendorName, items: [], freeDeliveryThreshold: item.freeDeliveryThreshold };
    acc[item.vendorId].items.push(item);
    return acc;
  }, {});

  const handlePay = async () => {
    if (!canProceed) return;
    setPaying(true);
    setError("");
    try {
      const vendorIds = [...new Set(cart.map(i => i.vendorId))];
      const allOrders = [];

      for (const vendorId of vendorIds) {
        const vendorItems = cart.filter(i => i.vendorId === vendorId);
        const vSubtotal   = vendorItems.reduce((s, i) => s + i.dealPrice, 0);
        const vGroup      = vendorGroups.find(v => v.vendorId === vendorId);
        const vDelivery   = deliveryMode === "delivery" ? (vGroup?.unlocked ? 0 : 8) : 0;

        const res = await fetch("/api/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            vendorId,
            items: vendorItems.map(i => ({ listingId: i.id, price: i.dealPrice, title: i.title })),
            buyerName:    form.name,
            buyerEmail:   form.email,
            buyerPhone:   form.phone,
            deliveryMode,
            deliveryFee:  vDelivery,
          }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Checkout failed");
        allOrders.push(data);
      }

      setOrders(allOrders);

      // If only one vendor → redirect to Billplz directly
      // If multiple vendors → open each in sequence (first one now)
      if (allOrders.length === 1) {
        // Redirect to Billplz payment page
        window.location.href = allOrders[0].paymentUrl;
      } else {
        // Multi-vendor: show links for each bill
        setStep("multi-pay");
      }

    } catch (e) {
      setError(e.message || "Something went wrong");
      setPaying(false);
    }
  };

  return (
    <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
      className="fixed inset-0 z-[500] bg-black/80 backdrop-blur-md flex items-end justify-center"
      onClick={onClose}>
      <motion.div initial={{y:"100%"}} animate={{y:0}} exit={{y:"100%"}}
        transition={{type:"spring",damping:28,stiffness:280}}
        onClick={e=>e.stopPropagation()}
        className="w-full max-w-sm bg-white rounded-t-[36px] max-h-[92vh] flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-slate-100 flex-shrink-0">
          <div>
            <h2 className="font-black text-xl">Checkout</h2>
            <p className="text-slate-400 text-xs mt-0.5">
              {step === "summary" ? "Review your order" : "Your details"}
            </p>
          </div>
          <button onClick={onClose} className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-sm">✕</button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">

            {/* ── STEP 1: ORDER SUMMARY ──────────────────────────────────────── */}
            {step === "summary" && (
              <motion.div key="summary" initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-20}} className="px-5 py-4 space-y-4">

                {/* Items per vendor */}
                {Object.values(byVendor).map((vg) => {
                  const vSub = vg.items.reduce((s,i)=>s+i.dealPrice,0);
                  const vUnlocked = vg.freeDeliveryThreshold && vSub >= vg.freeDeliveryThreshold;
                  return(
                    <div key={vg.vendorId} className="bg-slate-50 rounded-2xl p-4">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">🏪 {vg.vendorName}</p>
                      {vg.items.map((item,i) => (
                        <div key={i} className="flex justify-between items-center mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-base">{item.emoji || "🍱"}</span>
                            <p className="text-sm font-bold text-slate-800 leading-tight">{item.title}</p>
                          </div>
                          <p className="text-sm font-black text-emerald-600 flex-shrink-0 ml-2">RM{fmtRM(item.dealPrice)}</p>
                        </div>
                      ))}
                      {vg.freeDeliveryThreshold && (
                        <div className={`mt-2 text-[9px] font-black px-2 py-1 rounded-lg ${vUnlocked?"bg-emerald-100 text-emerald-600":"bg-slate-200 text-slate-500"}`}>
                          {vUnlocked ? "🎉 Free delivery unlocked for this vendor!" : `🚗 RM${fmtRM(vg.freeDeliveryThreshold-vSub)} more for free delivery`}
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Delivery toggle */}
                <div>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Delivery Method</p>
                  <div className="grid grid-cols-2 gap-2">
                    {[{id:"pickup",icon:"🚶",label:"Self Pickup",sub:"Free"},{id:"delivery",icon:"🛵",label:"Lalamove",sub:deliveryCost===0?"Vendor pays":"Est. RM8/vendor"}].map(opt=>(
                      <button key={opt.id} onClick={()=>setDeliveryMode(opt.id)}
                        className={`p-3 rounded-2xl border-2 text-left transition-all ${deliveryMode===opt.id?"border-emerald-500 bg-emerald-50":"border-slate-100 bg-slate-50"}`}>
                        <div className="text-xl mb-1">{opt.icon}</div>
                        <p className={`font-black text-xs ${deliveryMode===opt.id?"text-emerald-700":"text-slate-700"}`}>{opt.label}</p>
                        <p className="text-[9px] text-slate-400">{opt.sub}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price breakdown */}
                <div className="bg-slate-50 rounded-2xl p-4 space-y-2">
                  <div className="flex justify-between text-xs"><span className="text-slate-500">Items total</span><span className="font-bold">RM{fmtRM(itemsTotal)}</span></div>
                  {deliveryCost > 0 && <div className="flex justify-between text-xs"><span className="text-slate-500">Delivery fee</span><span className="font-bold">RM{fmtRM(deliveryCost)}</span></div>}
                  <div className="h-px bg-slate-200"/>
                  <div className="flex justify-between text-sm"><span className="font-black">Total</span><span className="font-black text-emerald-600 text-base">RM{fmtRM(totalPaid)}</span></div>
                </div>

                {/* Commission transparency */}
                <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
                  <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-2">💡 How your payment works</p>
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs"><span className="text-slate-600">You pay</span><span className="font-bold">RM{fmtRM(totalPaid)}</span></div>
                    <div className="flex justify-between text-xs"><span className="text-slate-400">Sapot Lokal fee (10%)</span><span className="text-slate-400">−RM{fmtRM(commission)}</span></div>
                    <div className="flex justify-between text-xs text-emerald-700 font-black pt-1 border-t border-blue-100"><span>Vendor receives</span><span>RM{fmtRM(vendorTotal)}</span></div>
                  </div>
                </div>

                <button onClick={()=>setStep("info")}
                  className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-sm active:scale-95 transition-transform">
                  Continue →
                </button>
              </motion.div>
            )}

            {/* ── STEP 2: BUYER INFO ─────────────────────────────────────────── */}
            {step === "info" && (
              <motion.div key="info" initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-20}} className="px-5 py-4 space-y-4">
                <button onClick={()=>setStep("summary")} className="text-slate-400 text-xs font-bold">← Back</button>
                <div>
                  <h3 className="font-black text-base mb-1">Your Details</h3>
                  <p className="text-slate-400 text-xs">Used for your receipt and pickup verification</p>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1.5">Full Name *</label>
                    <input value={form.name} onChange={e=>upd("name",e.target.value)} placeholder="Your name"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:border-emerald-500 focus:outline-none"/>
                  </div>
                  <div>
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1.5">Email * <span className="text-slate-400 normal-case font-normal">(receipt sent here)</span></label>
                    <input value={form.email} onChange={e=>upd("email",e.target.value)} type="email" placeholder="your@email.com"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:border-emerald-500 focus:outline-none"/>
                  </div>
                  <div>
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1.5">Phone <span className="text-slate-400 normal-case font-normal">(optional)</span></label>
                    <input value={form.phone} onChange={e=>upd("phone",e.target.value)} type="tel" placeholder="01x-xxxxxxx"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:border-emerald-500 focus:outline-none"/>
                  </div>
                </div>

                {/* Payment methods available via Billplz */}
                <div>
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Accepted Payment Methods</p>
                  <div className="grid grid-cols-3 gap-2">
                    {Object.entries(PM_ICONS).map(([k,v])=>(
                      <div key={k} className={`${v.color} rounded-xl p-2 flex flex-col items-center gap-1`}>
                        <span className="text-lg">{v.icon}</span>
                        <p className="text-white text-[8px] font-black text-center leading-tight">{v.label}</p>
                      </div>
                    ))}
                  </div>
                  <p className="text-slate-400 text-[9px] mt-2 text-center">Payment handled securely by Billplz · PCI DSS compliant</p>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                    <p className="text-red-600 text-xs font-bold">⚠️ {error}</p>
                  </div>
                )}

                {/* Final total before pay */}
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex justify-between items-center">
                  <div><p className="text-emerald-700 font-black text-sm">Total to pay</p><p className="text-emerald-600 text-[10px]">via Billplz secure checkout</p></div>
                  <p className="text-emerald-700 font-black text-2xl">RM{fmtRM(totalPaid)}</p>
                </div>

                <button onClick={handlePay} disabled={!canProceed || paying}
                  className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-2 transition-all active:scale-95 ${canProceed&&!paying?"bg-[#1a6ef5] text-white shadow-lg shadow-blue-200":"bg-slate-100 text-slate-400 cursor-not-allowed"}`}>
                  {paying
                    ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>Redirecting to payment...</>
                    : <>💙 Pay RM{fmtRM(totalPaid)} via Billplz</>
                  }
                </button>
                <p className="text-slate-300 text-[9px] text-center pb-4">You will be redirected to Billplz to complete payment.<br/>TNG · FPX · Card · DuitNow · GrabPay · Boost</p>
              </motion.div>
            )}

            {/* ── MULTI-VENDOR PAYMENT LINKS ────────────────────────────────── */}
            {step === "multi-pay" && (
              <motion.div key="multi" initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-20}} className="px-5 py-6 space-y-4">
                <div className="text-center mb-2">
                  <div className="text-4xl mb-2">🏪</div>
                  <h3 className="font-black text-lg">Multiple Vendor Payments</h3>
                  <p className="text-slate-400 text-xs mt-1">You have items from {orders.length} vendors.<br/>Complete each payment separately.</p>
                </div>
                {orders.map((order, idx) => (
                  <div key={order.orderId} className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                    <div className="flex justify-between items-center mb-3">
                      <p className="font-black text-sm">Payment {idx+1} of {orders.length}</p>
                      <span className="bg-amber-100 text-amber-700 text-[9px] font-black px-2 py-1 rounded-full uppercase">Pending</span>
                    </div>
                    <div className="flex justify-between text-xs mb-3">
                      <span className="text-slate-400">Amount</span>
                      <span className="font-black text-emerald-600">RM{fmtRM(order.amountPaid)}</span>
                    </div>
                    <a href={order.paymentUrl} target="_blank" rel="noreferrer"
                      className="w-full bg-[#1a6ef5] text-white py-3 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-transform">
                      💙 Pay RM{fmtRM(order.amountPaid)}
                    </a>
                  </div>
                ))}
                <p className="text-slate-400 text-[10px] text-center">Each payment goes directly to the respective vendor (minus 10% platform fee).</p>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── PAYMENT SUCCESS SCREEN ───────────────────────────────────────────────────
// Show this after buyer returns from Billplz redirect
// Usage: detect `?payment_done=1&order=123` in URL and show this component

export function PaymentSuccess({ orderId, onDone }) {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("checking"); // checking → paid → failed

  useEffect(() => {
    let attempts = 0;
    const poll = async () => {
      try {
        const res = await fetch(`/api/orders/${orderId}`);
        const data = await res.json();
        setOrder(data);
        if (data.status === "paid" || data.status === "completed") {
          setStatus("paid");
          setLoading(false);
        } else if (data.status === "failed") {
          setStatus("failed");
          setLoading(false);
        } else if (attempts < 10) {
          attempts++;
          setTimeout(poll, 2000); // poll every 2s up to 20s
        } else {
          setStatus("checking"); // still show "verifying"
          setLoading(false);
        }
      } catch {
        setLoading(false);
        setStatus("failed");
      }
    };
    poll();
  }, [orderId]);

  return (
    <motion.div initial={{opacity:0}} animate={{opacity:1}}
      className="fixed inset-0 z-[600] bg-white flex flex-col items-center justify-center p-6 text-center">

      {loading && (
        <div className="space-y-4">
          <div className="w-16 h-16 border-4 border-slate-200 border-t-emerald-500 rounded-full animate-spin mx-auto"/>
          <p className="font-black text-lg">Verifying payment...</p>
          <p className="text-slate-400 text-sm">Waiting for Billplz confirmation</p>
        </div>
      )}

      {!loading && status === "paid" && order && (
        <motion.div initial={{scale:0.9,opacity:0}} animate={{scale:1,opacity:1}} className="w-full max-w-sm space-y-5">
          <motion.div initial={{scale:0}} animate={{scale:1}} transition={{type:"spring",delay:0.1}} className="text-7xl">🎉</motion.div>
          <div>
            <h2 className="font-black text-2xl text-slate-900">Payment Successful!</h2>
            <p className="text-slate-400 text-sm mt-1">Order #{order.id} confirmed</p>
          </div>

          {/* Pickup code */}
          <div className="bg-emerald-50 border-2 border-emerald-200 border-dashed rounded-3xl p-6">
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2">Your Pickup Code</p>
            <p className="text-emerald-600 font-black text-4xl tracking-[10px]">{order.pickup_code}</p>
            <p className="text-slate-400 text-xs mt-2">Show this to the vendor when collecting</p>
          </div>

          {/* Payment breakdown */}
          <div className="bg-slate-50 rounded-2xl p-4 space-y-2 text-left">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Payment Summary</p>
            <div className="flex justify-between text-xs"><span className="text-slate-400">You paid</span><span className="font-bold">RM{fmtRM(order.amount_paid)}</span></div>
            <div className="flex justify-between text-xs"><span className="text-slate-400">Platform fee (10%)</span><span className="text-slate-400">RM{fmtRM(order.commission_rm)}</span></div>
            <div className="flex justify-between text-xs text-emerald-700 font-bold border-t border-slate-200 pt-2"><span>Vendor received</span><span>RM{fmtRM(order.vendor_payout_rm)}</span></div>
          </div>

          {/* Payout status */}
          <div className={`rounded-2xl px-4 py-3 flex items-center gap-3 ${
            order.payout_status==='processing'?"bg-blue-50 border border-blue-100":
            order.payout_status==='no_bank_details'?"bg-amber-50 border border-amber-100":
            "bg-slate-50 border border-slate-100"}`}>
            <span className="text-xl flex-shrink-0">
              {order.payout_status==='processing'?"⚡":order.payout_status==='no_bank_details'?"⏳":"💸"}
            </span>
            <div className="text-left">
              <p className="font-black text-xs">
                {order.payout_status==='processing'?"Vendor payout sent via DuitNow":
                 order.payout_status==='no_bank_details'?"Vendor payout pending bank setup":
                 "Payout status: "+order.payout_status}
              </p>
              <p className="text-slate-400 text-[9px] mt-0.5">
                {order.payout_status==='processing'?`RM${fmtRM(order.vendor_payout_rm)} transferred to ${order.vendor_name}`:
                 "Vendor will receive funds shortly"}
              </p>
            </div>
          </div>

          <button onClick={onDone}
            className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-sm active:scale-95 transition-transform">
            Done — Back to Deals
          </button>
        </motion.div>
      )}

      {!loading && status === "failed" && (
        <motion.div initial={{scale:0.9,opacity:0}} animate={{scale:1,opacity:1}} className="space-y-4 w-full max-w-sm">
          <div className="text-6xl">😞</div>
          <h2 className="font-black text-xl">Payment Not Confirmed</h2>
          <p className="text-slate-400 text-sm">Your payment may have been cancelled or timed out.<br/>Your cart has been preserved.</p>
          <button onClick={onDone} className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-sm">
            Try Again
          </button>
        </motion.div>
      )}

      {!loading && status === "checking" && (
        <motion.div initial={{scale:0.9,opacity:0}} animate={{scale:1,opacity:1}} className="space-y-4 w-full max-w-sm">
          <div className="text-6xl">⏳</div>
          <h2 className="font-black text-xl">Waiting for Confirmation</h2>
          <p className="text-slate-400 text-sm">Billplz is processing your payment.<br/>This can take up to 1 minute.</p>
          <p className="text-slate-400 text-[10px]">Order #{orderId}</p>
          <button onClick={onDone} className="w-full border-2 border-slate-200 text-slate-600 py-4 rounded-2xl font-black uppercase tracking-widest text-sm">
            Go Back
          </button>
        </motion.div>
      )}
    </motion.div>
  );
}

// ─── VENDOR BANK SETUP PANEL ──────────────────────────────────────────────────
// Show this in vendor settings so they can receive payouts
export function VendorBankSetup({ vendorId, onSaved }) {
  const [banks, setBanks]     = useState([]);
  const [form, setForm]       = useState({ bankAccountName:"", bankAccountNo:"", bankCode:"" });
  const [saving, setSaving]   = useState(false);
  const [saved, setSaved]     = useState(false);
  const upd = (k,v) => setForm(p=>({...p,[k]:v}));

  useEffect(()=>{
    fetch('/api/banks').then(r=>r.json()).then(setBanks);
  },[]);

  const handleSave = async () => {
    if (!form.bankAccountName || !form.bankAccountNo || !form.bankCode) return;
    setSaving(true);
    await fetch(`/api/vendors/${vendorId}/bank`,{
      method:'PUT',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify(form),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(()=>{setSaved(false);onSaved?.();},2000);
  };

  const canSave = form.bankAccountName && form.bankAccountNo.length >= 10 && form.bankCode;

  return(
    <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
      <div>
        <p className="text-white font-black text-sm">🏦 Payout Bank Account</p>
        <p className="text-white/40 text-xs mt-1">Your 90% share is sent here automatically after each order</p>
      </div>

      <div>
        <label className="text-white/40 text-[9px] font-black uppercase tracking-widest block mb-1.5">Account Holder Name</label>
        <input value={form.bankAccountName} onChange={e=>upd("bankAccountName",e.target.value)}
          placeholder="As per bank records"
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm font-bold focus:border-emerald-500 focus:outline-none"/>
      </div>

      <div>
        <label className="text-white/40 text-[9px] font-black uppercase tracking-widest block mb-1.5">Bank</label>
        <select value={form.bankCode} onChange={e=>upd("bankCode",e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm font-bold focus:border-emerald-500 focus:outline-none">
          <option value="">Select your bank</option>
          {banks.map(b=><option key={b.code} value={b.code} className="text-black">{b.name}</option>)}
        </select>
      </div>

      <div>
        <label className="text-white/40 text-[9px] font-black uppercase tracking-widest block mb-1.5">Account Number</label>
        <input value={form.bankAccountNo} onChange={e=>upd("bankAccountNo",e.target.value.replace(/\D/g,""))}
          placeholder="e.g. 1234567890"
          type="text" inputMode="numeric"
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm font-bold focus:border-emerald-500 focus:outline-none"/>
      </div>

      <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 flex gap-2 text-left">
        <span className="flex-shrink-0">⚡</span>
        <div>
          <p className="text-emerald-400 font-black text-xs">DuitNow Transfer</p>
          <p className="text-white/40 text-[9px] mt-0.5">Payouts use DuitNow via Billplz — funds arrive within minutes of buyer payment</p>
        </div>
      </div>

      <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3">
        <p className="text-amber-300 text-[10px] font-bold">⚠️ Please double-check your account number. Incorrect details may result in failed payouts.</p>
      </div>

      <button onClick={handleSave} disabled={!canSave||saving||saved}
        className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-2 transition-all active:scale-95 ${saved?"bg-emerald-500 text-white":canSave&&!saving?"bg-emerald-500 text-white":"bg-white/10 text-white/30 cursor-not-allowed"}`}>
        {saved?"✅ Saved!":saving?<><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>Saving...</>:"Save Bank Details"}
      </button>
    </div>
  );
}