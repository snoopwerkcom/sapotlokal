import React, { useState, useEffect, useRef } from "react";
import { supabase, getActiveListings, createListing, createOrder, getVendorSales, upsertVendor, getVendor, getAdsFromDB, updateAdInDB } from "./supabase";
import { motion, AnimatePresence } from "motion/react";

// ─── TRANSLATIONS ────────────────────────────────────────────────────────────
const T = {
  en: {
    appTagline:"Vendor Portal", buy:"Deals", sell:"Sell", studentTab:"🎓 Students",
    searchPlaceholder:"Search food or shops...",
    halalAny:"Halal", halalCert:"Certified", muslimOwned:"Muslim-Owned", all:"All", allCat:"All",
    nearbyDeals:"Deals Near You", searchResults:"Search Results ({0})",
    almostGone:"Almost Gone", item:"item",
    save:"SAVE", perUnit:"unit left", soldOut:"Sold Out",
    surplusTag:"🔥 Limited Deal", promoTag:"⚡ Flash Deal", specialTag:"🌟 Special",
    studentTag:"🎓 Student Deal",
    microwave:"♨️ Microwave", addToCart:"Add to Cart", addedToCart:"✅ Added",
    expired:"Expired", justNow:"Just now", minAgo:"min ago", hrAgo:"hr ago",
    noDeals:"No deals found", tryFilter:"Try a different filter or search",
    halalCertLabel:"Halal Cert", muslimOwnedLabel:"Muslim-Owned", nonHalalLabel:"Non-Halal",
    halalSelfDeclared:"*Halal status is self-declared by vendors",
    almostOut:"Almost out —", unitsLeft:"units left", soldOutLabel:"Sold Out 🎉",
    endsAt:"Until", units:"units", back:"← Back",
    freeDeliveryFrom:"🚗 Free delivery from RM{0}",
    noDelivery:"Self-pickup only",
    halalDisclaimerTitle:"Halal Status Notice",
    halalDisclaimerBody:"The Halal and Muslim-Owned badges are self-declared by vendors. Sapot Lokal does not check or guarantee any halal status.",
    halalDisclaimerBtn:"I understand, continue",
    studentCornerTitle:"🎓 Student Corner",
    studentCornerDesc:"Special prices posted by vendors who support students. No verification needed.",
    studentCornerEmpty:"No student deals right now",
    studentCornerEmptySub:"Check back later — vendors post new student deals throughout the day.",
    studentPriceLabel:"Student price",
    cart:"Cart", cartEmpty:"Your cart is empty", browseDeals:"Browse deals above",
    subtotal:"Subtotal", deliveryFee:"Delivery Fee",
    free:"FREE", total:"Total",
    selfPickup:"Self-Pickup", selfPickupDesc:"Walk over and collect (Free)",
    delivery:"Delivery", deliveryDesc:"Delivered to your door",
    checkoutTNG:"💙 Pay with TNG eWallet",
    processingTNG:"Processing...",
    removeItem:"Remove",
    orderPlaced:"Order Confirmed!", pickupNote:"Show this code to the vendor",
    pickupCode:"Pickup Code", goPickup:"Got it!",
    whatToPost:"What to post today?", chooseType:"Pick a deal type",
    surplusType:"🔥 Limited Deal", surplusDesc:"Discounted food — limited quantity",
    promoType:"⚡ Flash Deal", promoDesc:"Time-limited offer",
    specialType:"🌟 Special", specialDesc:"New dish — get feedback",
    chooseCategory:"Choose Category", templateNote:"Template fills in basic info",
    postNewDeal:"Post a Deal", liveNow:"Live Now", repeatBtn:"Repeat", activeLabel:"Active",
    snapPhoto:"Take Food Photo", retakePhoto:"Retake", uploading:"Uploading...", snapFirst2:"Take a photo",
    foodName:"Food Name", foodNamePH:"e.g. Nasi Lemak",
    shortDesc:"Description", shortDescPH:"e.g. Egg, Sambal, Anchovies",
    originalPrice:"Original Price (RM)", dealPrice:"Deal Price (RM)",
    youReceive:"You get (after fees)",
    endTime:"End Time", quick:"⚡ Quick", manual:"🕐 Manual", endAt:"Ends at:",
    qty:"Quantity (Optional)", qtyPH:"e.g. 20", qtyNote:"Leave empty for unlimited",
    reheat:"How to reheat", eatDirect:"🍽️ Ready to eat", oven:"🔥 Oven",
    goLive:"⚡ Go Live", snapFirst:"📸 Take Photo First",
    fillName:"✏️ Add Food Name", fillPrice:"💰 Add Deal Price",
    tngNote:"Payments handled via TNG eWallet",
    pastPosts:"Past Posts", repostNote:"Tap to repost",
    repost:"🔁 Repost", sold:"sold",
    postSuccess:"Posted!", liveNote:"Your deal is live. Nearby buyers will be notified.",
    salePrice:"Sale Price", commission:"Sapot Fee",
    youGet:"You Receive", payoutNote:"Paid to your TNG after pickup",
    viewDash:"View Dashboard",
    addStudentPrice:"Add Student Price?",
    addStudentPriceDesc:"Show a lower price in Student Corner",
    studentPriceRM:"Student Price (RM)",
    studentPricePH:"e.g. 2.50",
    vendorSettings:"Shop Settings",
    freeDeliveryThreshold:"Free Delivery Min (RM)",
    thresholdOff:"No free delivery",
    thresholdWarning:"~RM8 delivery cost deducted from your payout",
    saveSettings:"Save", settingsSaved:"✅ Saved",
    offerFreeDelivery:"Offer free delivery",
    monthlyPlan:"Monthly Plan", perMonth:"/mo",
    subscribeCTA:"💙 Subscribe via TNG", autoRenew:"Auto-renews · Cancel anytime",
    processing:"Processing...",
    timeModeLabel:"How long to show?",
    timeModeStock:"⏳ While stock lasts",
    timeModeStock_desc:"Live until sold out or removed",
    timeModeHours:"⚡ Fixed time",
    timeModeHours_desc:"Auto-removes after set hours",
    timeModeSched:"🕐 Today's hours",
    timeModeSched_desc:"Live from open to close",
    openTime:"Opens at", closeTime:"Closes at",
    liveUntil:"Live until",
    liveUntilStock:"Live · Until sold out",
    liveUntilClose:"Live · Until closing",
    removePost:"✕ Remove",
    cancelConfirm:"Remove this post?",
    cancelYes:"Yes, remove",
    cancelNo:"Keep it live",
    trialActive:"Free Trial",
    trialDaysLeft:"{0} days left",
    trialExpired:"Free trial ended",
    trialExpiredDesc:"Subscribe to keep posting deals.",
    trialBannerFree:"🎁 Free for {0} more days",
    trialBannerWarn:"⚠️ {0} days left in trial",
    trialBannerUrgent:"🔴 Trial ends in {0} days!",
    trialBannerExpired:"🔒 Trial ended — subscribe to post",
    subscribeNow:"Subscribe Now",
    alreadySubscribed:"✅ Active plan",
    subscribedUntil:"Active until {0}",
    maxPostsReached:"Max 3 active posts — remove one first",
    onboardTitle:"Set Up Your Shop",
    onboardSub:"Takes 30 seconds.",
    onboardShopName:"Shop Name",
    onboardShopNamePH:"e.g. Warung Mak Teh",
    onboardArea:"Your Area",
    onboardAreaPH:"e.g. Puchong, Subang",
    onboardPhone:"WhatsApp Number",
    onboardPhonePH:"e.g. 0123456789",
    onboardDone:"Start Selling →",
    onboardSkip:"Skip for now",
    locating:"Finding your location...",
    locationDenied:"Where are you? 📍",
    locationDeniedDesc:"Type your area to see nearby food deals",
    nearYou:"Near You",
    kmAway:"{0}km away",
    noDealsArea:"No deals near you right now",
    noDealsAreaSub:"Vendors in {0} haven't posted yet. Check back soon!",
    changeLocation:"Change location",
    orderingFrom:"Ordering from",
    differentVendorTitle:"Start a new order?",
    differentVendorBody:"You already have items from {0} in your cart. Adding from {1} needs a separate order.",
    clearCartBtn:"Start new order",
    keepCartBtn:"Keep current cart",
    continueShoppingBtn:"Add more from {0}",
    vendorLockedMsg:"Finish your current order first",
    planBasic:"Basic", planPro:"Pro", planBusiness:"Business", planPopular:"Most Popular",
    planBasicDesc:"For new vendors just starting out",
    planProDesc:"For active vendors growing fast",
    planBusinessDesc:"For high-volume food businesses",
    planBasicPerks:["Post up to 3 deals","15% commission","Basic dashboard","Student corner listings"],
    choosePlan:"Choose Your Plan",
    choosePlanSub:"Start free for 60 days, then subscribe",
    currentPlan:"Current Plan",
    upgradePlan:"Upgrade",
    celebTitle:"Welcome aboard! 🎉",
    celebSub:"Your {0} plan is now active.",
    celebBtn:"Start Posting",
    catAll:"All Deals", catFood:"Food", catDrink:"Drink", catFruit:"Fruit", catBakery:"Bakery", catOther:"Other",
  },
  bm: {
    appTagline:"Portal Vendor", buy:"Deal", sell:"Jual", studentTab:"🎓 Pelajar",
    searchPlaceholder:"Cari makanan atau kedai...",
    halalAny:"Halal", halalCert:"Bertauliah", muslimOwned:"Milik Muslim", all:"Semua", allCat:"Semua",
    nearbyDeals:"Deal Berdekatan", searchResults:"Hasil Carian ({0})",
    almostGone:"Hampir Habis", item:"item",
    save:"JIMAT", perUnit:"unit tinggal", soldOut:"Sold Out",
    surplusTag:"🔥 Limited Deal", promoTag:"⚡ Flash Deal", specialTag:"🌟 Menu Baru",
    studentTag:"🎓 Harga Pelajar",
    microwave:"♨️ Microwave", addToCart:"Tambah ke Troli", addedToCart:"✅ Ditambah",
    expired:"Tamat", justNow:"Baru sahaja", minAgo:"min lalu", hrAgo:"jam lalu",
    noDeals:"Tiada deal dijumpai", tryFilter:"Cuba tukar filter atau cari semula",
    halalCertLabel:"Halal Cert", muslimOwnedLabel:"Milik Muslim", nonHalalLabel:"Non-Halal",
    halalSelfDeclared:"*Diisytihar sendiri oleh vendor",
    almostOut:"Hampir habis —", unitsLeft:"unit", soldOutLabel:"Habis Terjual 🎉",
    endsAt:"Hingga", units:"unit", back:"← Kembali",
    freeDeliveryFrom:"🚗 Penghantaran percuma dari RM{0}",
    noDelivery:"Ambil sendiri sahaja",
    halalDisclaimerTitle:"Notis Status Halal",
    halalDisclaimerBody:"Lencana Halal dan Milik Muslim dalam app ini adalah pengisytiharan sendiri oleh vendor.",
    halalDisclaimerBtn:"Saya faham, teruskan",
    studentCornerTitle:"🎓 Sudut Pelajar",
    studentCornerDesc:"Harga khas yang dipost oleh vendor yang menyokong pelajar kampus.",
    studentCornerEmpty:"Tiada deal pelajar buat masa ini",
    studentCornerEmptySub:"Vendor post deal pelajar baru sepanjang hari.",
    studentPriceLabel:"Harga pelajar",
    cart:"Troli", cartEmpty:"Troli anda kosong", browseDeals:"Semak deal di atas",
    subtotal:"Subtotal", deliveryFee:"Yuran Penghantaran",
    free:"PERCUMA", total:"Jumlah",
    selfPickup:"Ambil Sendiri", selfPickupDesc:"Jalan ambil sendiri (Percuma)",
    delivery:"Penghantaran", deliveryDesc:"Dihantar ke pintu anda",
    checkoutTNG:"💙 Bayar via TNG eWallet",
    processingTNG:"Memproses...",
    removeItem:"Buang",
    orderPlaced:"Pesanan Berjaya!", pickupNote:"Tunjukkan kod ini kepada vendor",
    pickupCode:"Kod Pickup", goPickup:"Okay, Faham!",
    whatToPost:"Apa nak post hari ni?", chooseType:"Pilih jenis deal anda",
    surplusType:"🔥 Limited Deal", surplusDesc:"Makanan lebihan — kuantiti terhad",
    promoType:"⚡ Flash Deal", promoDesc:"Tawaran masa terhad",
    specialType:"🌟 Menu Baru", specialDesc:"Lancar hidangan baru — dapat feedback",
    chooseCategory:"Pilih Kategori", templateNote:"Template isi maklumat asas",
    postNewDeal:"Post Deal Baru", liveNow:"Live Sekarang", repeatBtn:"Ulang", activeLabel:"Aktif",
    snapPhoto:"Snap Gambar Makanan", retakePhoto:"Tukar Gambar", uploading:"Memuat...", snapFirst2:"Snap gambar makanan",
    foodName:"Nama Makanan", foodNamePH:"cth: Nasi Lemak Bungkus",
    shortDesc:"Huraian Ringkas", shortDescPH:"cth: Telur, Sambal, Ikan Bilis",
    originalPrice:"Harga Asal (RM)", dealPrice:"Harga Deal (RM)",
    youReceive:"Anda terima (selepas fi)",
    endTime:"Masa Tamat", quick:"⚡ Pantas", manual:"🕐 Manual", endAt:"Tamat pada:",
    qty:"Kuantiti (Pilihan)", qtyPH:"cth: 20 unit", qtyNote:"Kosongkan untuk tiada had",
    reheat:"Cara Panaskan Semula", eatDirect:"🍽️ Terus", oven:"🔥 Oven",
    goLive:"⚡ Go Live Sekarang", snapFirst:"📸 Snap Gambar Dahulu",
    fillName:"✏️ Isi Nama", fillPrice:"💰 Isi Harga",
    tngNote:"Bayaran diproses melalui TNG eWallet",
    pastPosts:"Posting Lepas", repostNote:"Tap untuk repost serta-merta",
    repost:"🔁 Repost", sold:"dijual",
    postSuccess:"Posting Berjaya!", liveNote:"Deal anda live.",
    salePrice:"Harga Jual", commission:"Fi Sapot",
    youGet:"Anda Terima", payoutNote:"Dibayar ke TNG selepas pickup",
    viewDash:"Lihat Dashboard",
    addStudentPrice:"Tambah Harga Pelajar?",
    addStudentPriceDesc:"Paparkan harga lebih rendah dalam Sudut Pelajar",
    studentPriceRM:"Harga Pelajar (RM)", studentPricePH:"cth: 2.50",
    vendorSettings:"Tetapan Kedai",
    freeDeliveryThreshold:"Had Penghantaran Percuma (RM)",
    thresholdOff:"Tiada penghantaran percuma",
    thresholdWarning:"~RM8 kos penghantaran ditolak dari bayaran anda",
    saveSettings:"Simpan", settingsSaved:"✅ Disimpan",
    offerFreeDelivery:"Tawarkan penghantaran percuma",
    monthlyPlan:"Pelan Bulanan", perMonth:"/bulan",
    subscribeCTA:"💙 Langgan via TNG", autoRenew:"Auto-renew · Batal bila-bila masa",
    processing:"Memproses...",
    timeModeLabel:"Berapa lama posting ini kekal?",
    timeModeStock:"⏳ Selagi ada stok",
    timeModeHours:"⚡ Tempoh tetap",
    timeModeSched:"🕐 Jadual hari ini",
    openTime:"Buka jam", closeTime:"Tutup jam",
    liveUntil:"Live sehingga",
    removePost:"✕ Buang",
    trialActive:"Percubaan Percuma",
    trialDaysLeft:"{0} hari lagi",
    trialExpired:"Percubaan percuma tamat",
    trialBannerFree:"🎁 Percuma {0} hari lagi",
    subscribeNow:"Langgan Sekarang",
    maxPostsReached:"Maks 3 posting aktif — buang satu",
    onboardTitle:"Sediakan Kedai Anda",
    onboardShopName:"Nama Kedai",
    onboardArea:"Kawasan Anda",
    onboardPhone:"Nombor WhatsApp",
    onboardDone:"Mula Jual →",
    nearYou:"Berdekatan Anda",
    kmAway:"{0}km jauh",
    noDealsArea:"Tiada deal berdekatan anda",
    changeLocation:"Tukar lokasi",
    continueShoppingBtn:"Tambah dari {0}",
    planBasic:"Asas", planPro:"Pro", planBusiness:"Perniagaan",
    choosePlan:"Pilih Pelan",
    celebTitle:"Selamat datang! 🎉",
    catAll:"Semua Deal", catFood:"Makanan", catDrink:"Minuman", catFruit:"Buah", catBakery:"Bakeri", catOther:"Lain-lain",
  },
  zh: {
    appTagline:"校园美食优惠", buy:"优惠", sell:"卖家", studentTab:"🎓 学生",
    searchPlaceholder:"搜索食物或商家...",
    halalAny:"清真", halalCert:"认证", muslimOwned:"穆斯林经营", all:"全部", allCat:"全部",
    nearbyDeals:"附近优惠", searchResults:"搜索结果 ({0})",
    almostGone:"快卖完了", item:"个",
    save:"省", perUnit:"份剩余", soldOut:"售罄",
    surplusTag:"🔥 限量优惠", promoTag:"⚡ 限时优惠", specialTag:"🌟 特别推介",
    studentTag:"🎓 学生价",
    microwave:"♨️ 微波炉", addToCart:"加入购物车", addedToCart:"✅ 已加入",
    expired:"已过期", justNow:"刚刚", minAgo:"分钟前", hrAgo:"小时前",
    noDeals:"没有找到优惠", tryFilter:"尝试更改筛选条件",
    halalCertLabel:"清真认证", muslimOwnedLabel:"穆斯林经营", nonHalalLabel:"非清真",
    halalSelfDeclared:"*商家自行申报清真状态",
    almostOut:"快售完 —", unitsLeft:"份", soldOutLabel:"已售罄 🎉",
    endsAt:"截止", units:"份", back:"← 返回",
    freeDeliveryFrom:"🚗 消费RM{0}免运费",
    noDelivery:"仅限自取",
    halalDisclaimerTitle:"清真状态声明",
    halalDisclaimerBody:"本应用显示的清真及穆斯林经营标志均由商家自行申报。",
    halalDisclaimerBtn:"我明白，继续",
    studentCornerTitle:"🎓 学生专区",
    studentCornerDesc:"商家为校园学生提供的特别价格。",
    studentCornerEmpty:"暂无学生优惠",
    studentCornerEmptySub:"请稍后再查！",
    studentPriceLabel:"学生价",
    cart:"购物车", cartEmpty:"购物车是空的", browseDeals:"浏览上方优惠",
    subtotal:"小计", deliveryFee:"运费",
    free:"免费", total:"总计",
    selfPickup:"自取", selfPickupDesc:"步行前往取餐（免费）",
    delivery:"外卖配送", deliveryDesc:"送到您门口",
    checkoutTNG:"💙 使用TNG电子钱包付款",
    processingTNG:"处理中...",
    removeItem:"移除",
    orderPlaced:"订单成功！", pickupNote:"取餐时向商家出示此码",
    pickupCode:"取餐码", goPickup:"好的，明白了！",
    whatToPost:"今天发布什么？", chooseType:"选择优惠类型",
    surplusType:"🔥 限量优惠", surplusDesc:"剩余食物 — 数量有限",
    promoType:"⚡ 限时优惠", promoDesc:"限时特卖填补淡季",
    specialType:"🌟 特别推介", specialDesc:"低价推出新菜品",
    chooseCategory:"选择类别", templateNote:"模板自动填写基本信息",
    postNewDeal:"发布新优惠", liveNow:"正在上线", repeatBtn:"重复", activeLabel:"进行中",
    snapPhoto:"拍摄食物照片", retakePhoto:"重新拍照", uploading:"上传中...", snapFirst2:"拍摄食物照片",
    foodName:"食物名称", foodNamePH:"例：椰浆饭套餐",
    shortDesc:"简短描述", shortDescPH:"例：鸡蛋、参巴",
    originalPrice:"原价 (RM)", dealPrice:"优惠价 (RM)",
    youReceive:"您收到（扣除费用后）",
    endTime:"结束时间", quick:"⚡ 快速", manual:"🕐 手动", endAt:"结束于：",
    qty:"数量（可选）", qtyPH:"例：20份", qtyNote:"留空表示不限量",
    reheat:"加热方式", eatDirect:"🍽️ 直接食用", oven:"🔥 烤箱",
    goLive:"⚡ 立即上线", snapFirst:"📸 先拍照",
    fillName:"✏️ 填写名称", fillPrice:"💰 填写价格",
    tngNote:"通过TNG电子钱包处理付款",
    pastPosts:"过往发布", repostNote:"点击立即重新发布",
    repost:"🔁 重新发布", sold:"已售",
    postSuccess:"发布成功！", liveNote:"您的优惠已上线。",
    salePrice:"售价", commission:"Sapot费用",
    youGet:"您收到", payoutNote:"取餐确认后转入您的TNG",
    viewDash:"查看仪表板",
    addStudentPrice:"添加学生价？",
    addStudentPriceDesc:"在学生专区显示更低价格",
    studentPriceRM:"学生价 (RM)", studentPricePH:"例：2.50",
    vendorSettings:"商店设置",
    freeDeliveryThreshold:"免运费门槛 (RM)",
    thresholdOff:"不提供免运费",
    thresholdWarning:"RM8运费将从您的收款中扣除",
    saveSettings:"保存", settingsSaved:"✅ 已保存",
    offerFreeDelivery:"为买家提供免运费",
    monthlyPlan:"月度计划", perMonth:"/月",
    subscribeCTA:"💙 通过TNG订阅", autoRenew:"自动续订",
    processing:"处理中...",
    timeModeLabel:"帖子保留多长时间？",
    timeModeStock:"⏳ 售完为止",
    timeModeHours:"⚡ 固定时长",
    timeModeSched:"🕐 今日营业时间",
    openTime:"开店时间", closeTime:"关店时间",
    liveUntil:"显示至",
    removePost:"✕ 移除",
    trialActive:"免费试用",
    trialDaysLeft:"还剩{0}天",
    trialExpired:"免费试用已结束",
    trialBannerFree:"🎁 还有{0}天免费",
    subscribeNow:"立即订阅",
    maxPostsReached:"最多3个活跃帖子",
    onboardTitle:"设置您的商店",
    onboardShopName:"商店名称",
    onboardArea:"您的地区",
    onboardPhone:"WhatsApp号码",
    onboardDone:"开始销售 →",
    nearYou:"附近",
    kmAway:"{0}公里外",
    noDealsArea:"附近暂无优惠",
    changeLocation:"更改位置",
    continueShoppingBtn:"从{0}添加更多",
    planBasic:"基础版", planPro:"专业版", planBusiness:"商业版",
    choosePlan:"选择您的计划",
    celebTitle:"欢迎加入！🎉",
    catAll:"全部优惠", catFood:"食物", catDrink:"饮料", catFruit:"水果", catBakery:"面包烘焙", catOther:"其他",
  },
};

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const DELIVERY_FEE = 8;
const FOOD_TEMPLATES = [
  {id:"nasi_lemak",label:"Nasi Lemak",emoji:"🍛",category:"Food"},
  {id:"econ_rice",label:"Economy Rice",emoji:"🍱",category:"Food"},
  {id:"roti",label:"Roti / Bread",emoji:"🥐",category:"Bakery"},
  {id:"drinks",label:"Drinks",emoji:"🧋",category:"Drink"},
  {id:"fruit",label:"Fruit",emoji:"🍉",category:"Fruit"},
  {id:"custom",label:"Custom",emoji:"✏️",category:"Other"}
];

const MOCK_LISTINGS = [
  {id:1,vendorId:1,vendorName:"Warung Mak Teh",freeDeliveryThreshold:20,studentPrice:2.00,title:"Nasi Lemak Bungkus",desc:"Egg, Sambal, Anchovies",originalPrice:5.00,dealPrice:3.00,emoji:"🍛",image:"https://picsum.photos/seed/nasilemak1/800/600",category:"Food",halal:1,endTime:"21:00",qty:18,claimed:6,type:"limited",reheat:"none",postedAt:Date.now()-60000*20,vendorSubscribed:true},
  {id:2,vendorId:1,vendorName:"Warung Mak Teh",freeDeliveryThreshold:20,studentPrice:1.50,title:"Teh Tarik Large",desc:"Fresh, thick teh tarik",originalPrice:3.50,dealPrice:2.00,emoji:"🧋",image:"https://picsum.photos/seed/tehtarik/800/600",category:"Drink",halal:1,endTime:"21:00",qty:null,claimed:0,type:"promo",reheat:"none",postedAt:Date.now()-60000*10,vendorSubscribed:true},
  {id:3,vendorId:2,vendorName:"Bakeri Fariz",freeDeliveryThreshold:30,studentPrice:7.50,title:"Assorted Pastry Box",desc:"Croissant, Danish Almond, Chocolate Bun",originalPrice:15.00,dealPrice:9.90,emoji:"🥐",image:"https://picsum.photos/seed/pastrybox1/800/600",category:"Bakery",halal:1,endTime:"20:30",qty:10,claimed:9,type:"limited",reheat:"oven",postedAt:Date.now()-60000*45,vendorSubscribed:true},
  {id:9,vendorId:8,vendorName:"Kepong Home Kitchen",freeDeliveryThreshold:25,studentPrice:null,title:"Char Kuey Teow",desc:"High wok heat, big prawns",originalPrice:9.00,dealPrice:5.50,emoji:"🍳",image:"https://picsum.photos/seed/ckt/800/600",category:"Food",halal:0,endTime:"21:30",qty:12,claimed:3,type:"promo",reheat:"none",postedAt:Date.now()-60000*25,vendorSubscribed:true},
];

const SUBSCRIPTION_PLANS = [
  { id:"basic", name:"Basic", price:"29.90", color:"from-slate-800 to-slate-900", perks:["Post up to 3 deals", "15% commission", "Basic dashboard"] },
  { id:"pro", name:"Pro", price:"49.90", color:"from-emerald-600 to-teal-700", perks:["Unlimited posts", "10% commission", "Full dashboard", "Priority alerts"] }
];

// ─── UTILS ────────────────────────────────────────────────────────────────────
const fmtRM = v => parseFloat(v).toFixed(2);
const fill = (str, ...vals) => vals.reduce((s, v, i) => s.replace(`{${i}}`, v), str);

export default function App() {
  const [lang, setLang] = useState<'en' | 'bm' | 'zh'>('en');
  const [selCat, setSelCat] = useState('All');
  const [cart, setCart] = useState<any[]>([]);
  const [showSubSheet, setShowSubSheet] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const t = T[lang];

  const addToCart = (item: any) => {
    setCart([...cart, item]);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans text-slate-900">
      
      {/* ─── HEADER & LANGUAGE/CATEGORY ─── */}
      <header className="sticky top-0 z-40 bg-white border-b p-4 shadow-sm">
        <div className="flex justify-between items-center mb-3">
          <h1 className="text-xl font-black text-blue-600">Sapot Lokal</h1>
          <div className="flex gap-3 text-xs font-bold uppercase tracking-wider">
            {['en', 'bm', 'zh'].map(l => (
              <button key={l} onClick={() => setLang(l as any)} className={lang === l ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-400"}>
                {l}
              </button>
            ))}
          </div>
        </div>

        <select 
          value={selCat} 
          onChange={(e) => setSelCat(e.target.value)}
          className="w-full p-3 bg-gray-100 border-none rounded-xl font-semibold text-sm appearance-none"
        >
          <option value="All">{t.catAll}</option>
          <option value="Food">{t.catFood}</option>
          <option value="Drink">{t.catDrink}</option>
          <option value="Fruit">{t.catFruit}</option>
          <option value="Bakery">{t.catBakery}</option>
        </select>
      </header>

      {/* ─── MAIN LISTINGS ─── */}
      <main className="p-4 grid gap-4">
        {MOCK_LISTINGS
          .filter(l => selCat === 'All' || l.category === selCat)
          .map(listing => (
            <div key={listing.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
              <img src={listing.image} className="h-48 w-full object-cover" />
              <div className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-lg">{listing.title}</h3>
                    <p className="text-gray-500 text-sm">{listing.vendorName}</p>
                  </div>
                  <button onClick={() => addToCart(listing)} className="bg-blue-600 text-white px-4 py-2 rounded-xl font-bold text-sm">
                    {t.addToCart}
                  </button>
                </div>
              </div>
            </div>
          ))}
      </main>

      {/* ─── CART SHEET SNIPPET ─── */}
      <AnimatePresence>
        {cart.length > 0 && (
          <motion.div initial={{ y: 100 }} animate={{ y: 0 }} className="fixed bottom-0 left-0 right-0 bg-white shadow-2xl rounded-t-3xl p-6 z-50 border-t">
            <h2 className="font-black text-xl mb-4">{t.cart}</h2>
            
            {/* Continue Shopping - Same Vendor Feature */}
            <div className="mt-2 border-t border-dashed pt-4 overflow-hidden">
              <button className="text-blue-600 font-bold text-sm mb-3">
                {fill(t.continueShoppingBtn, cart[0].vendorName)}
              </button>
              <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar">
                {MOCK_LISTINGS
                  .filter(l => l.vendorId === cart[0].vendorId && !cart.find(c => c.id === l.id))
                  .map(item => (
                    <div key={item.id} className="min-w-[150px] bg-gray-50 p-3 rounded-2xl border">
                      <p className="text-sm font-bold truncate">{item.title}</p>
                      <p className="text-blue-600 font-bold">RM{fmtRM(item.dealPrice)}</p>
                      <button onClick={() => addToCart(item)} className="mt-2 w-full py-1 text-xs bg-white border border-blue-600 text-blue-600 rounded-lg font-bold">
                        + Add
                      </button>
                    </div>
                  ))}
              </div>
            </div>

            <button className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-lg shadow-lg">
              {t.checkoutTNG}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── VENDOR SUBSCRIPTION SHEET ─── */}
      {!isSubscribed && (
        <div className="p-4">
          <button onClick={() => setShowSubSheet(true)} className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold">
            Activate Shop
          </button>
        </div>
      )}

      <AnimatePresence>
        {showSubSheet && (
          <motion.div 
            initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
            className="fixed inset-0 z-50 flex items-end"
          >
            <div className="absolute inset-0 bg-black/60" onClick={() => setShowSubSheet(false)} />
            <div className="relative w-full bg-slate-900 text-white rounded-t-[40px] p-8 pb-12 shadow-2xl">
              <div className="w-12 h-1.5 bg-slate-700 rounded-full mx-auto mb-8" />
              <h2 className="text-2xl font-black mb-2">{t.choosePlan}</h2>
              <p className="text-slate-400 mb-8">{t.choosePlanSub}</p>

              <div className="grid gap-4">
                {SUBSCRIPTION_PLANS.map(plan => (
                  <button 
                    key={plan.id}
                    onClick={() => { setIsSubscribed(true); setShowSubSheet(false); }}
                    className={`relative overflow-hidden p-6 rounded-3xl bg-gradient-to-br ${plan.color} border border-slate-700 text-left`}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold">{plan.name}</h3>
                        <div className="flex items-baseline gap-1">
                          <span className="text-2xl font-black">RM{plan.price}</span>
                          <span className="text-sm opacity-60">/mo</span>
                        </div>
                      </div>
                      {plan.id === 'pro' && <span className="bg-emerald-400 text-emerald-950 text-[10px] font-black px-2 py-1 rounded-full uppercase">Popular</span>}
                    </div>
                    <ul className="space-y-2 opacity-80 text-sm">
                      {plan.perks.map((p, i) => <li key={i}>✓ {p}</li>)}
                    </ul>
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
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-[60] bg-blue-600 flex flex-col items-center justify-center text-white p-8 text-center">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }} className="text-8xl mb-6">🎉</motion.div>
            <h2 className="text-4xl font-black mb-4">{t.celebTitle}</h2>
            <p className="text-xl opacity-90 mb-12">{fill(t.celebSub, "Pro")}</p>
            <button onClick={() => setIsSubscribed(false)} className="bg-white text-blue-600 px-12 py-4 rounded-2xl font-black text-xl shadow-xl">
              {t.celebBtn}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}