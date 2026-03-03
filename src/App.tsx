import React, { useState, useEffect, useRef } from "react";
import { supabase, getActiveListings, createListing, createOrder, getVendorSales, upsertVendor, getVendor, getAdsFromDB, updateAdInDB } from "./supabase";
import { motion, AnimatePresence } from "motion/react";

// ─── TRANSLATIONS ────────────────────────────────────────────────────────────
const T = {
  en: {
    appTagline:"Vendor Portal", buy:"Deals", sell:"Sell", studentTab:"🎓 Students",
    searchPlaceholder:"Search food or shops...",
    catAll:"All", catFood:"Food", catDrink:"Drink", catFruit:"Fruit", catBakery:"Bakery", catOther:"Other",
    onboardAreaPH:"Select Area", nearYou:"Near You",
    addToCart:"Add to Cart", checkoutTNG:"💙 Pay with TNG eWallet",
    cart:"Cart", continueShoppingBtn:"Add more from {0}",
    choosePlan:"Choose Your Plan", choosePlanSub:"Start free for 60 days",
    subscribeCTA:"💙 Subscribe via TNG", celebTitle:"Welcome aboard! 🎉", celebBtn:"Start Posting",
    celebSub:"Your {0} plan is now active.",
  },
  bm: {
    appTagline:"Portal Vendor", buy:"Deal", sell:"Jual", studentTab:"🎓 Pelajar",
    searchPlaceholder:"Cari makanan...",
    catAll:"Semua", catFood:"Makanan", catDrink:"Minuman", catFruit:"Buah", catBakery:"Bakeri", catOther:"Lain",
    onboardAreaPH:"Pilih Kawasan", nearYou:"Berdekatan",
    addToCart:"Tambah", checkoutTNG:"Bayar via TNG",
    cart:"Troli", continueShoppingBtn:"Tambah dari {0}",
    choosePlan:"Pilih Pelan", choosePlanSub:"Percuma 60 hari",
    subscribeCTA:"Langgan via TNG", celebTitle:"Selamat datang! 🎉", celebBtn:"Mula Post",
    celebSub:"Pelan {0} anda aktif.",
  },
  zh: {
    appTagline:"校园美食优惠", buy:"优惠", sell:"卖家", studentTab:"🎓 学生",
    searchPlaceholder:"搜索食物...",
    catAll:"全部", catFood:"食物", catDrink:"饮料", catFruit:"水果", catBakery:"面包", catOther:"其他",
    onboardAreaPH:"选择地区", nearYou:"附近",
    addToCart:"加入购物车", checkoutTNG:"使用TNG付款",
    cart:"购物车", continueShoppingBtn:"从{0}添加更多",
    choosePlan:"选择计划", choosePlanSub:"免费试用60天",
    subscribeCTA:"通过TNG订阅", celebTitle:"欢迎加入！🎉", celebBtn:"开始发布",
    celebSub:"您的{0}计划现已激活。",
  }
};

// ─── CONSTANTS & MOCK DATA (UNTOUCHED) ───────────────────────────────────────
const DELIVERY_FEE = 8;
const MOCK_VENDORS_GEO = {
  1:{lat:3.0696,lon:101.5989,area:"Puchong"},
  2:{lat:3.1073,lon:101.6067,area:"Subang Jaya"},
  3:{lat:3.1478,lon:101.6953,area:"Chow Kit"},
  4:{lat:3.0169,lon:101.5969,area:"Shah Alam"},
  5:{lat:3.1209,lon:101.6538,area:"Bangsar"},
  6:{lat:3.1878,lon:101.7029,area:"Ampang"},
  7:{lat:3.1319,lon:101.6841,area:"KLCC"},
  8:{lat:3.2068,lon:101.5987,area:"Kepong"},
  9:{lat:3.1073,lon:101.6370,area:"Petaling Jaya"},
};

const MOCK_LISTINGS = [
  {id:1,vendorId:1,vendorName:"Warung Mak Teh",title:"Nasi Lemak Bungkus",originalPrice:5.00,dealPrice:3.00,emoji:"🍛",image:"https://picsum.photos/seed/nasilemak1/800/600",category:"Food",area:"Puchong"},
  {id:2,vendorId:1,vendorName:"Warung Mak Teh",title:"Teh Tarik Large",originalPrice:3.50,dealPrice:2.00,emoji:"🧋",image:"https://picsum.photos/seed/tehtarik/800/600",category:"Drink",area:"Puchong"},
  {id:3,vendorId:2,vendorName:"Bakeri Fariz",title:"Assorted Pastry Box",originalPrice:15.00,dealPrice:9.90,emoji:"🥐",image:"https://picsum.photos/seed/pastrybox1/800/600",category:"Bakery",area:"Subang Jaya"},
];

const SUBSCRIPTION_PLANS = [
  { id:"basic", name:"Basic", price:"29.90", color:"from-slate-800 to-slate-900", perks:["Post up to 3 deals", "15% commission"] },
  { id:"pro", name:"Pro", price:"49.90", color:"from-emerald-600 to-teal-700", perks:["Unlimited posts", "10% commission"] }
];

// ─── UTILS ────────────────────────────────────────────────────────────────────
const fmtRM = v => parseFloat(v).toFixed(2);
const fill = (str, ...vals) => vals.reduce((s, v, i) => s.replace(`{${i}}`, v), str);

export default function App() {
  // ─── STATE ───
  const [lang, setLang] = useState<'en' | 'bm' | 'zh'>('en');
  const [selCat, setSelCat] = useState('All');
  const [selArea, setSelArea] = useState('Puchong');
  const [cart, setCart] = useState<any[]>([]);
  const [showSubSheet, setShowSubSheet] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  
  const t = T[lang];

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans text-slate-900">
      
      {/* ─── NEW: LANGUAGE SELECTOR (Top Strip) ─── */}
      <div className="flex justify-end gap-4 p-2 bg-white px-6 border-b text-[10px] font-black uppercase tracking-widest">
        {['en', 'bm', 'zh'].map(l => (
          <button key={l} onClick={() => setLang(l as any)} className={lang === l ? "text-blue-600 underline" : "text-gray-400"}>
            {l}
          </button>
        ))}
      </div>

      <header className="bg-white p-4 shadow-sm sticky top-0 z-40">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-black text-blue-600 italic tracking-tighter">SAPOT LOKAL</h1>
          
          {/* ─── NEW: LOCATION DROPDOWN ─── */}
          <div className="flex items-center gap-1 bg-gray-100 px-3 py-1.5 rounded-full">
            <span className="text-sm">📍</span>
            <select 
              value={selArea} 
              onChange={(e) => setSelArea(e.target.value)}
              className="bg-transparent text-[11px] font-black border-none focus:ring-0 p-0 pr-4 uppercase"
            >
              {Object.values(MOCK_VENDORS_GEO).map(g => (
                <option key={g.area} value={g.area}>{g.area}</option>
              ))}
            </select>
          </div>
        </div>

        {/* ─── SEARCH & NEW: CATEGORY DROPDOWN ─── */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input 
              type="text" 
              placeholder={t.searchPlaceholder}
              className="w-full bg-gray-100 border-none rounded-2xl py-3 px-4 text-sm"
            />
          </div>
          
          <select 
            value={selCat} 
            onChange={(e) => setSelCat(e.target.value)}
            className="bg-gray-100 border-none rounded-2xl px-4 text-xs font-black uppercase"
          >
            <option value="All">{t.catAll}</option>
            <option value="Food">{t.catFood}</option>
            <option value="Drink">{t.catDrink}</option>
            <option value="Fruit">{t.catFruit}</option>
            <option value="Bakery">{t.catBakery}</option>
          </select>
        </div>
      </header>

      {/* ─── MAIN DEALS LIST ─── */}
      <main className="p-4">
        <div className="flex justify-between items-end mb-4">
          <h2 className="font-black text-xl uppercase tracking-tight">{t.nearYou} {selArea}</h2>
        </div>

        <div className="grid gap-6">
          {MOCK_LISTINGS
            .filter(l => (selCat === 'All' || l.category === selCat) && l.area === selArea)
            .map(listing => (
              <motion.div key={listing.id} className="bg-white rounded-[2rem] overflow-hidden shadow-xl border border-gray-100 relative">
                <img src={listing.image} className="h-56 w-full object-cover" alt={listing.title} />
                <div className="p-5">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-black text-lg leading-tight mb-1">{listing.emoji} {listing.title}</h3>
                      <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">{listing.vendorName}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-300 text-xs line-through font-bold">RM{fmtRM(listing.originalPrice)}</p>
                      <p className="text-blue-600 text-xl font-black italic">RM{fmtRM(listing.dealPrice)}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setCart([...cart, listing])}
                    className="w-full mt-4 bg-blue-600 text-white py-3 rounded-2xl font-black uppercase tracking-tighter text-sm shadow-lg shadow-blue-200"
                  >
                    {t.addToCart}
                  </button>
                </div>
              </motion.div>
            ))}
        </div>
      </main>

      {/* ─── CART SECTION ─── */}
      <AnimatePresence>
        {cart.length > 0 && (
          <motion.div initial={{ y: 100 }} animate={{ y: 0 }} className="fixed bottom-0 left-0 right-0 bg-white shadow-[0_-20px_50px_rgba(0,0,0,0.1)] rounded-t-[2.5rem] p-8 z-50 border-t">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-black text-2xl uppercase italic">{t.cart}</h2>
              <button onClick={() => setCart([])} className="text-gray-300 font-bold text-xs uppercase">Clear</button>
            </div>
            
            {/* Continue Shopping UI */}
            <div className="mb-6">
              <p className="text-[10px] font-black uppercase text-blue-600 mb-3 tracking-widest border-b border-dashed pb-2">
                {fill(t.continueShoppingBtn, cart[0].vendorName)}
              </p>
              <div className="flex gap-3 overflow-x-auto no-scrollbar py-2">
                {MOCK_LISTINGS
                  .filter(l => l.vendorId === cart[0].vendorId && !cart.find(c => c.id === l.id))
                  .map(item => (
                    <div key={item.id} className="min-w-[140px] bg-gray-50 p-3 rounded-2xl border border-gray-100">
                      <p className="text-[11px] font-black truncate uppercase">{item.title}</p>
                      <p className="text-blue-600 font-black text-xs">RM{fmtRM(item.dealPrice)}</p>
                      <button onClick={() => setCart([...cart, item])} className="mt-2 text-[9px] font-black uppercase text-blue-600 bg-white border border-blue-600 px-3 py-1 rounded-lg">+ Add</button>
                    </div>
                  ))}
              </div>
            </div>

            <button className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-lg italic shadow-xl shadow-blue-200 uppercase tracking-tighter">
              {t.checkoutTNG}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── VENDOR SUBSCRIPTION (DARK BOTTOM SHEET) ─── */}
      {!isSubscribed && (
        <div className="p-6">
          <button onClick={() => setShowSubSheet(true)} className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs">
            Activate Vendor Shop
          </button>
        </div>
      )}

      <AnimatePresence>
        {showSubSheet && (
          <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} className="fixed inset-0 z-50 flex items-end">
            <div className="absolute inset-0 bg-black/80" onClick={() => setShowSubSheet(false)} />
            <div className="relative w-full bg-slate-900 text-white rounded-t-[3rem] p-10 shadow-2xl">
              <h2 className="text-2xl font-black italic uppercase mb-2">{t.choosePlan}</h2>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-8">{t.choosePlanSub}</p>

              <div className="grid gap-4">
                {SUBSCRIPTION_PLANS.map(plan => (
                  <button key={plan.id} onClick={() => { setIsSubscribed(true); setShowSubSheet(false); }} className={`p-6 rounded-3xl bg-gradient-to-br ${plan.color} border border-slate-700 text-left`}>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xl font-black uppercase italic">{plan.name}</h3>
                      <p className="font-black">RM{plan.price}<span className="text-[10px] opacity-50">/MO</span></p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {plan.perks.map((p, i) => <span key={i} className="text-[9px] font-black uppercase bg-white/10 px-2 py-1 rounded-md">{p}</span>)}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Celebration Screen */}
      <AnimatePresence>
        {isSubscribed && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-[60] bg-blue-600 flex flex-col items-center justify-center text-white p-10 text-center">
            <h2 className="text-5xl font-black italic uppercase mb-4">{t.celebTitle}</h2>
            <p className="text-lg font-bold opacity-80 mb-12 uppercase tracking-tighter">{fill(t.celebSub, "PRO")}</p>
            <button onClick={() => setIsSubscribed(false)} className="bg-white text-blue-600 px-12 py-5 rounded-[2rem] font-black text-xl uppercase shadow-2xl">
              {t.celebBtn}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── FOOTER NAV ─── */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around py-4 z-40">
        <button className="flex flex-col items-center text-blue-600">
          <span className="text-xl">🛍️</span>
          <span className="text-[9px] font-black uppercase mt-1 tracking-widest">{t.buy}</span>
        </button>
        <button className="flex flex-col items-center text-gray-300">
          <span className="text-xl">🏪</span>
          <span className="text-[9px] font-black uppercase mt-1 tracking-widest">{t.sell}</span>
        </button>
      </nav>

    </div>
  );
}