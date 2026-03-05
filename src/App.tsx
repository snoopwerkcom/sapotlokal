import React, { useState, useEffect, useRef } from "react";
import { supabase, getActiveListings, createListing, createOrder, getVendorSales, upsertVendor, getVendor, getAdsFromDB, updateAdInDB } from "./supabase";
import { motion, AnimatePresence } from "motion/react";

// ─── TRANSLATIONS (Simple English) ───────────────────────────────────────────
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
    halalDisclaimerBody:"The Halal and Muslim-Owned badges are self-declared by vendors. Sapot Lokal does not check or guarantee any halal status.\n\nPlease use your own judgement. Sapot Lokal is not responsible for any halal claims.",
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
    // Single vendor cart
    orderingFrom:"Ordering from",
    differentVendorTitle:"Start a new order?",
    differentVendorBody:"You already have items from {0} in your cart. Adding from {1} needs a separate order.",
    clearCartBtn:"Start new order",
    keepCartBtn:"Keep current cart",
    continueShoppingBtn:"Add more from {0}",
    vendorLockedMsg:"Finish your current order first",
    // Subscription plans
    planBasic:"Basic",
    planPro:"Pro",
    planBusiness:"Business",
    planPopular:"Most Popular",
    planBasicDesc:"For new vendors just starting out",
    planProDesc:"For active vendors growing fast",
    planBusinessDesc:"For high-volume food businesses",
    planBasicPerks:["Post up to 3 deals","15% commission","Basic dashboard","Student corner listings"],
    planProPerks:["Post up to 10 deals","10% commission","Full dashboard","Priority buyer alerts","One-tap repost","Free delivery settings"],
    planBusinessPerks:["Unlimited posts","8% commission","Advanced analytics","Dedicated support","Custom storefront","API access"],
    choosePlan:"Choose Your Plan",
    choosePlanSub:"Start free for 60 days, then subscribe",
    currentPlan:"Current Plan",
    upgradePlan:"Upgrade",
    celebTitle:"Welcome aboard! 🎉",
    celebSub:"Your {0} plan is now active.",
    celebBtn:"Start Posting",
    // Categories
    catAll:"All Deals", catFood:"Food", catDrink:"Drink", catFruit:"Fruit", catBakery:"Bakery", catDessert:"Dessert", catTongSui:"Tong Sui", catOther:"Other",
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
    halalDisclaimerBody:"Lencana Halal dan Milik Muslim dalam app ini adalah pengisytiharan sendiri oleh vendor. Sapot Lokal tidak mengesahkan atau menjamin status halal mana-mana makanan.\n\nPembeli dinasihatkan untuk membuat pertimbangan sendiri. Sapot Lokal tidak bertanggungjawab ke atas status halal.",
    halalDisclaimerBtn:"Saya faham, teruskan",
    studentCornerTitle:"🎓 Sudut Pelajar",
    studentCornerDesc:"Harga khas yang dipost oleh vendor yang menyokong pelajar kampus. Tiada pengesahan diperlukan.",
    studentCornerEmpty:"Tiada deal pelajar buat masa ini",
    studentCornerEmptySub:"Vendor post deal pelajar baru sepanjang hari. Semak semula nanti!",
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
    postSuccess:"Posting Berjaya!", liveNote:"Deal anda live. Pembeli berdekatan akan dimaklumkan.",
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
    timeModeStock:"⏳ Selagi ada stok", timeModeStock_desc:"Kekal live sehingga habis atau anda buang",
    timeModeHours:"⚡ Tempoh tetap", timeModeHours_desc:"Auto-buang selepas jam yang ditetapkan",
    timeModeSched:"🕐 Jadual hari ini", timeModeSched_desc:"Live dari buka hingga tutup kedai",
    openTime:"Buka jam", closeTime:"Tutup jam",
    liveUntil:"Live sehingga", liveUntilStock:"Live · Selagi ada stok", liveUntilClose:"Live · Hingga waktu tutup",
    removePost:"✕ Buang", cancelConfirm:"Buang listing ini?", cancelYes:"Ya, buang", cancelNo:"Kekalkan live",
    trialActive:"Percubaan Percuma", trialDaysLeft:"{0} hari lagi",
    trialExpired:"Percubaan percuma tamat", trialExpiredDesc:"Langgan untuk terus posting deal.",
    trialBannerFree:"🎁 Percuma {0} hari lagi", trialBannerWarn:"⚠️ {0} hari lagi dalam percubaan",
    trialBannerUrgent:"🔴 Percubaan tamat dalam {0} hari!", trialBannerExpired:"🔒 Percubaan tamat — langgan untuk post",
    subscribeNow:"Langgan Sekarang", alreadySubscribed:"✅ Langganan aktif", subscribedUntil:"Dilanggan hingga {0}",
    maxPostsReached:"Maks 3 posting aktif — buang satu untuk post semula",
    onboardTitle:"Sediakan Kedai Anda", onboardSub:"Ambil masa 30 saat.",
    onboardShopName:"Nama Kedai", onboardShopNamePH:"cth: Warung Mak Teh",
    onboardArea:"Kawasan / Bandar Anda", onboardAreaPH:"cth: Puchong, Kepong",
    onboardPhone:"Nombor WhatsApp", onboardPhonePH:"cth: 0123456789",
    onboardDone:"Mula Jual →", onboardSkip:"Langkau buat masa ini",
    locating:"Mencari lokasi anda...", locationDenied:"Di mana anda? 📍",
    locationDeniedDesc:"Taip kawasan anda untuk melihat deal berdekatan",
    nearYou:"Berdekatan Anda", kmAway:"{0}km jauh",
    noDealsArea:"Tiada deal berdekatan anda buat masa ini",
    noDealsAreaSub:"Vendor di {0} belum post hari ini. Semak semula nanti!",
    changeLocation:"Tukar lokasi",
    orderingFrom:"Menempah dari",
    differentVendorTitle:"Mulakan pesanan baru?",
    differentVendorBody:"Anda ada item dari {0} dalam troli. Menambah dari {1} perlukan pesanan berasingan.",
    clearCartBtn:"Mulakan pesanan baru", keepCartBtn:"Kekalkan troli semasa",
    continueShoppingBtn:"Tambah lagi dari {0}", vendorLockedMsg:"Selesaikan pesanan semasa dahulu",
    planBasic:"Asas", planPro:"Pro", planBusiness:"Perniagaan", planPopular:"Paling Popular",
    planBasicDesc:"Untuk vendor baru bermula", planProDesc:"Untuk vendor aktif berkembang", planBusinessDesc:"Untuk perniagaan makanan besar",
    planBasicPerks:["Post sehingga 3 deal","Komisyen 15%","Dashboard asas","Senarai Sudut Pelajar"],
    planProPerks:["Post sehingga 10 deal","Komisyen 10%","Dashboard penuh","Amaran pembeli keutamaan","Repost satu ketuk","Tetapan penghantaran percuma"],
    planBusinessPerks:["Post tanpa had","Komisyen 8%","Analitik lanjutan","Sokongan khusus","Storefront tersuai","Akses API"],
    choosePlan:"Pilih Pelan Anda", choosePlanSub:"Cuba percuma 60 hari, kemudian langgan",
    currentPlan:"Pelan Semasa", upgradePlan:"Naik Taraf",
    celebTitle:"Selamat datang! 🎉", celebSub:"Pelan {0} anda kini aktif.", celebBtn:"Mula Post",
    catAll:"Semua Deal", catFood:"Makanan", catDrink:"Minuman", catFruit:"Buah", catBakery:"Bakeri", catDessert:"Pencuci Mulut", catTongSui:"Tong Sui", catOther:"Lain-lain",
    shareTitle:"Kongsi Deal", shareWhatsapp:"Kongsi di WhatsApp", shareCopy:"Salin Pautan", shareCopied:"Pautan disalin!",
    shareMsg:"🍱 Tengok deal ni kat Sapot Lokal: {0} dari {1} hanya RM{2}! 👉 {3}",
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
    noDeals:"没有找到优惠", tryFilter:"尝试更改筛选条件或重新搜索",
    halalCertLabel:"清真认证", muslimOwnedLabel:"穆斯林经营", nonHalalLabel:"非清真",
    halalSelfDeclared:"*商家自行申报清真状态",
    almostOut:"快售完 —", unitsLeft:"份", soldOutLabel:"已售罄 🎉",
    endsAt:"截止", units:"份", back:"← 返回",
    freeDeliveryFrom:"🚗 消费RM{0}免运费",
    noDelivery:"仅限自取",
    halalDisclaimerTitle:"清真状态声明",
    halalDisclaimerBody:"本应用显示的清真及穆斯林经营标志均由商家自行申报。Sapot Lokal 不对任何食品或商家的清真状态进行核实或保证。\n\n买家请自行判断。Sapot Lokal 对本平台出售的任何商品的清真状态不承担任何责任。",
    halalDisclaimerBtn:"我明白，继续",
    studentCornerTitle:"🎓 学生专区",
    studentCornerDesc:"商家为校园学生提供的特别价格。无需验证 — 诚信制度。",
    studentCornerEmpty:"暂无学生优惠",
    studentCornerEmptySub:"商家全天发布新的学生优惠，请稍后再查！",
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
    specialType:"🌟 特别推介", specialDesc:"低价推出新菜品，收集反馈",
    chooseCategory:"选择类别", templateNote:"模板自动填写基本信息",
    postNewDeal:"发布新优惠", liveNow:"正在上线", repeatBtn:"重复", activeLabel:"进行中",
    snapPhoto:"拍摄食物照片", retakePhoto:"重新拍照", uploading:"上传中...", snapFirst2:"拍摄食物照片",
    foodName:"食物名称", foodNamePH:"例：椰浆饭套餐",
    shortDesc:"简短描述", shortDescPH:"例：鸡蛋、参巴、江鱼仔",
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
    postSuccess:"发布成功！", liveNote:"您的优惠已上线。附近买家将收到通知。",
    salePrice:"售价", commission:"Sapot费用",
    youGet:"您收到", payoutNote:"取餐确认后转入您的TNG",
    viewDash:"查看仪表板",
    addStudentPrice:"添加学生价？",
    addStudentPriceDesc:"在学生专区显示更低价格",
    studentPriceRM:"学生价 (RM)", studentPricePH:"例：2.50",
    vendorSettings:"商店设置",
    freeDeliveryThreshold:"免运费门槛 (RM)",
    thresholdOff:"不提供免运费",
    thresholdWarning:"触发时约RM8运费将从您的收款中扣除",
    saveSettings:"保存", settingsSaved:"✅ 已保存",
    offerFreeDelivery:"为买家提供免运费",
    monthlyPlan:"月度计划", perMonth:"/月",
    subscribeCTA:"💙 通过TNG订阅", autoRenew:"自动续订 · 随时取消",
    processing:"处理中...",
    timeModeLabel:"帖子保留多长时间？",
    timeModeStock:"⏳ 售完为止", timeModeStock_desc:"一直显示直到售罄或您手动移除",
    timeModeHours:"⚡ 固定时长", timeModeHours_desc:"设定小时后自动移除",
    timeModeSched:"🕐 今日营业时间", timeModeSched_desc:"从开店到关店时间显示",
    openTime:"开店时间", closeTime:"关店时间",
    liveUntil:"显示至", liveUntilStock:"显示中 · 售完为止", liveUntilClose:"显示中 · 至关店时间",
    removePost:"✕ 移除", cancelConfirm:"移除此商品？", cancelYes:"是，移除", cancelNo:"继续显示",
    trialActive:"免费试用", trialDaysLeft:"还剩{0}天",
    trialExpired:"免费试用已结束", trialExpiredDesc:"订阅以继续发布优惠。",
    trialBannerFree:"🎁 还有{0}天免费", trialBannerWarn:"⚠️ 试用还剩{0}天",
    trialBannerUrgent:"🔴 试用还剩{0}天！", trialBannerExpired:"🔒 试用已结束 — 订阅后可继续发帖",
    subscribeNow:"立即订阅", alreadySubscribed:"✅ 订阅有效", subscribedUntil:"订阅至{0}",
    maxPostsReached:"最多3个活跃帖子 — 请先移除一个",
    onboardTitle:"设置您的商店", onboardSub:"只需30秒。",
    onboardShopName:"商店名称", onboardShopNamePH:"例：Warung Mak Teh",
    onboardArea:"您的地区/城镇", onboardAreaPH:"例：Puchong、Subang",
    onboardPhone:"WhatsApp号码", onboardPhonePH:"例：0123456789",
    onboardDone:"开始销售 →", onboardSkip:"暂时跳过",
    locating:"正在获取您的位置...", locationDenied:"您在哪里？📍",
    locationDeniedDesc:"请输入您的地区以查看附近食物优惠",
    nearYou:"附近", kmAway:"{0}公里外",
    noDealsArea:"附近暂无优惠",
    noDealsAreaSub:"{0}的商家今天还没有发布优惠，请稍后再查！",
    changeLocation:"更改位置",
    orderingFrom:"正在从以下商家订购",
    differentVendorTitle:"开始新订单？",
    differentVendorBody:"您的购物车已有来自{0}的商品。添加来自{1}的商品需要单独下单。",
    clearCartBtn:"开始新订单", keepCartBtn:"保留当前购物车",
    continueShoppingBtn:"继续从{0}添加", vendorLockedMsg:"请先完成当前订单",
    planBasic:"基础版", planPro:"专业版", planBusiness:"商业版", planPopular:"最受欢迎",
    planBasicDesc:"适合刚起步的新商家", planProDesc:"适合快速成长的活跃商家", planBusinessDesc:"适合高销量食品企业",
    planBasicPerks:["最多发布3个优惠","15%佣金","基础仪表板","学生专区列表"],
    planProPerks:["最多发布10个优惠","10%佣金","完整仪表板","优先买家通知","一键重复发布","免运费设置"],
    planBusinessPerks:["无限发布","8%佣金","高级分析","专属支持","自定义店面","API访问"],
    choosePlan:"选择您的计划", choosePlanSub:"免费试用60天，然后订阅",
    currentPlan:"当前计划", upgradePlan:"升级",
    celebTitle:"欢迎加入！🎉", celebSub:"您的{0}计划现已激活。", celebBtn:"开始发布",
    catAll:"全部优惠", catFood:"食物", catDrink:"饮料", catFruit:"水果", catBakery:"面包烘焙", catDessert:"甜点", catTongSui:"糖水", catOther:"其他",
    shareTitle:"分享优惠", shareWhatsapp:"WhatsApp分享", shareCopy:"复制链接", shareCopied:"链接已复制！",
    shareMsg:"🍱 在Sapot Lokal发现好优惠：{0}，来自{1}，只需RM{2}！👉 {3}",
  },
  };

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const DELIVERY_FEE = 8;
const DEFAULT_RADIUS = 10;

const FOOD_TEMPLATES = [
  {id:"nasi_lemak",label:"Nasi Lemak",emoji:"🍛",defaultTitle:"Nasi Lemak Bungkus",defaultDesc:"Egg, Sambal, Anchovies",defaultPrice:"3.50",defaultOriginal:"5.00",category:"Food"},
  {id:"econ_rice",label:"Economy Rice",emoji:"🍱",defaultTitle:"Nasi Campur Special",defaultDesc:"2 Veg + 1 Main",defaultPrice:"5.50",defaultOriginal:"8.00",category:"Food"},
  {id:"roti",label:"Roti / Bread",emoji:"🥐",defaultTitle:"Assorted Pastry Box",defaultDesc:"Croissant, Danish, Sweet Bun",defaultPrice:"9.90",defaultOriginal:"15.00",category:"Bakery"},
  {id:"drinks",label:"Drinks",emoji:"🧋",defaultTitle:"Drink Bundle",defaultDesc:"Teh Tarik / Milo / Juice",defaultPrice:"2.50",defaultOriginal:"4.00",category:"Drink"},
  {id:"kuih",label:"Kuih/Dessert",emoji:"🍡",defaultTitle:"Kuih Set",defaultDesc:"Kuih Lapis, Onde-onde, Seri Muka",defaultPrice:"6.00",defaultOriginal:"10.00",category:"Dessert"},
  {id:"tong_sui",label:"Tong Sui",emoji:"🍮",defaultTitle:"Tong Sui Set",defaultDesc:"Bubur Kacang, Bubur Cha Cha, Tau Fu Fah",defaultPrice:"3.50",defaultOriginal:"5.50",category:"TongSui"},
  {id:"fruit",label:"Fruit",emoji:"🍉",defaultTitle:"Fresh Fruit Pack",defaultDesc:"Seasonal cut fruits",defaultPrice:"5.00",defaultOriginal:"8.00",category:"Fruit"},
  {id:"custom",label:"Custom",emoji:"✏️",defaultTitle:"",defaultDesc:"",defaultPrice:"",defaultOriginal:"",category:"Other"}
];

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
  {id:1,vendorId:1,vendorName:"Warung Mak Teh",vendorPhone:"60123456789",freeDeliveryThreshold:20,studentPrice:2.00,title:"Nasi Lemak Bungkus",desc:"Egg, Sambal, Anchovies",originalPrice:5.00,dealPrice:3.00,emoji:"🍛",image:"https://picsum.photos/seed/nasilemak1/800/600",category:"Food",halal:1,endTime:"21:00",qty:18,claimed:6,type:"limited",reheat:"none",postedAt:Date.now()-60000*20,vendorSubscribed:true},
  {id:2,vendorId:1,vendorName:"Warung Mak Teh",vendorPhone:"60123456789",freeDeliveryThreshold:20,studentPrice:1.50,title:"Teh Tarik Large",desc:"Fresh, thick teh tarik",originalPrice:3.50,dealPrice:2.00,emoji:"🧋",image:"https://picsum.photos/seed/tehtarik/800/600",category:"Drink",halal:1,endTime:"21:00",qty:null,claimed:0,type:"promo",reheat:"none",postedAt:Date.now()-60000*10,vendorSubscribed:true},
  {id:3,vendorId:2,vendorName:"Bakeri Fariz",vendorPhone:"60197654321",freeDeliveryThreshold:30,studentPrice:7.50,title:"Assorted Pastry Box",desc:"Croissant, Danish Almond, Chocolate Bun",originalPrice:15.00,dealPrice:9.90,emoji:"🥐",image:"https://picsum.photos/seed/pastrybox1/800/600",category:"Bakery",halal:1,endTime:"20:30",qty:10,claimed:9,type:"limited",reheat:"oven",postedAt:Date.now()-60000*45,vendorSubscribed:true},
  {id:4,vendorId:3,vendorName:"Uncle Lim Kopitiam",vendorPhone:"60112233445",freeDeliveryThreshold:null,studentPrice:null,title:"Drink Bundle",desc:"Teh Tarik + Milo Ais + Lime Juice",originalPrice:9.00,dealPrice:5.50,emoji:"🧋",image:"https://picsum.photos/seed/drinks1/800/600",category:"Drink",halal:2,endTime:"22:00",qty:null,claimed:3,type:"promo",reheat:"none",postedAt:Date.now()-60000*10,vendorSubscribed:false},
  {id:5,vendorId:4,vendorName:"Pak Din Gerai",vendorPhone:"60169988776",freeDeliveryThreshold:25,studentPrice:3.50,title:"Economy Rice",desc:"2 Veg + 1 Main of your choice",originalPrice:8.00,dealPrice:5.00,emoji:"🍱",image:"https://picsum.photos/seed/nasicamp1/800/600",category:"Food",halal:1,endTime:"14:30",qty:20,claimed:14,type:"promo",reheat:"microwave",postedAt:Date.now()-60000*5,vendorSubscribed:false},
  {id:6,vendorId:5,vendorName:"Kuih Mak Jah",vendorPhone:"60133344556",freeDeliveryThreshold:20,studentPrice:5.00,title:"Traditional Kuih Set",desc:"Kuih Lapis, Onde-onde, Seri Muka",originalPrice:12.00,dealPrice:7.00,emoji:"🍡",image:"https://picsum.photos/seed/kuih1/800/600",category:"Food",halal:1,endTime:"18:00",qty:8,claimed:5,type:"special",reheat:"none",postedAt:Date.now()-60000*60,vendorSubscribed:true},
  {id:7,vendorId:6,vendorName:"Restoran Maju Jaya",vendorPhone:"60144455667",freeDeliveryThreshold:35,studentPrice:6.00,title:"Honey Chicken (New!)",desc:"New recipe — try it and give feedback",originalPrice:14.00,dealPrice:8.00,emoji:"🍗",image:"https://picsum.photos/seed/ayampercik/800/600",category:"Food",halal:1,endTime:"20:00",qty:15,claimed:2,type:"special",reheat:"oven",postedAt:Date.now()-60000*15,vendorSubscribed:true},
  {id:8,vendorId:7,vendorName:"Mat Zin Mee Goreng",vendorPhone:"60155566778",freeDeliveryThreshold:20,studentPrice:2.50,title:"Mamak Fried Noodles",desc:"Spicy, crispy, fresh from the wok",originalPrice:7.00,dealPrice:4.00,emoji:"🍜",image:"https://picsum.photos/seed/meegoreng/800/600",category:"Food",halal:1,endTime:"23:00",qty:30,claimed:8,type:"limited",reheat:"none",postedAt:Date.now()-60000*8,vendorSubscribed:false},
  {id:9,vendorId:8,vendorName:"Kepong Home Kitchen",vendorPhone:"60166677889",freeDeliveryThreshold:25,studentPrice:null,title:"Char Kuey Teow",desc:"High wok heat, big prawns",originalPrice:9.00,dealPrice:5.50,emoji:"🍳",image:"https://picsum.photos/seed/ckt/800/600",category:"Food",halal:0,endTime:"21:30",qty:12,claimed:3,type:"promo",reheat:"none",postedAt:Date.now()-60000*25,vendorSubscribed:true},
  {id:10,vendorId:9,vendorName:"PJ Kopitiam",vendorPhone:"60177788990",freeDeliveryThreshold:30,studentPrice:3.00,title:"Kopitiam Breakfast Set",desc:"Toast + Egg + Coffee",originalPrice:10.00,dealPrice:6.50,emoji:"☕",image:"https://picsum.photos/seed/kopitiam/800/600",category:"Drink",halal:0,endTime:"11:00",qty:20,claimed:7,type:"promo",reheat:"none",postedAt:Date.now()-60000*40,vendorSubscribed:false},
  {id:11,vendorId:4,vendorName:"Pak Din Gerai",vendorPhone:"60169988776",freeDeliveryThreshold:25,studentPrice:null,title:"Fresh Watermelon Pack",desc:"1kg cut watermelon, chilled",originalPrice:7.00,dealPrice:4.50,emoji:"🍉",image:"https://picsum.photos/seed/watermelon/800/600",category:"Fruit",halal:1,endTime:"18:00",qty:15,claimed:2,type:"limited",reheat:"none",postedAt:Date.now()-60000*12,vendorSubscribed:false},
];

const MOCK_PAST_POSTS = [
  {id:"p1",title:"Nasi Lemak Bungkus",desc:"Egg, Sambal, Anchovies",price:"3.50",original:"5.00",emoji:"🍛",type:"limited",sold:24},
  {id:"p2",title:"Assorted Pastry Box",desc:"Croissant, Danish, Bun",price:"9.90",original:"15.00",emoji:"🥐",type:"promo",sold:11}
];

// ─── SUBSCRIPTION PLANS ───────────────────────────────────────────────────────
const SUBSCRIPTION_PLAN = {
  id:"subscriber", name:"Subscriber", price:"29.90",
  color:"from-emerald-600 to-teal-700",
  accent:"text-emerald-300", border:"border-emerald-500/40",
  commission:"10%",
  perks:["10% commission (save 5%)","Unlimited posts","Full dashboard","Priority buyer alerts","One-tap repost","Free delivery settings"],
};

// ─── UTILS ────────────────────────────────────────────────────────────────────
const fmtRM = v=>{const n=parseFloat(v);return isNaN(n)?"0.00":n.toFixed(2);};
const savingsPct = (o,s)=>{const ov=parseFloat(o),sv=parseFloat(s);if(!ov||!sv||ov<=sv)return null;return Math.round(((ov-sv)/ov)*100);};
const getNow = ()=>new Date().toTimeString().slice(0,5);
const addHours = (time,hrs)=>{var p=time.split(":");var h=parseInt(p[0]);var m=parseInt(p[1]);var t=h*60+m+hrs*60;return String(Math.floor(t/60)%24).padStart(2,"0")+":"+String(t%60).padStart(2,"0");};
const timeAgo = (ts)=>{const m=Math.floor((Date.now()-ts)/60000);if(m<1)return"Just now";if(m<60)return`${m}m ago`;return`${Math.floor(m/60)}h ago`;};
const stockPct = (qty,claimed)=>qty?Math.min(Math.round((claimed/qty)*100),100):null;
const dealTag = (type)=>({limited:{label:"🔥 Limited",bg:"bg-orange-500"},promo:{label:"⚡ Flash",bg:"bg-blue-500"},special:{label:"🌟 Special",bg:"bg-purple-500"}})[type]||{label:"🔥 Limited",bg:"bg-orange-500"};
const fill = (str,...vals)=>vals.reduce((s,v,i)=>s.replace(`{${i}}`,v),str);
const halalBadge = (h)=>{
  if(h===1)return{label:"Halal ✓",bg:"bg-emerald-500"};
  if(h===2)return{label:"Muslim",bg:"bg-blue-500"};
  if(h===3)return{label:"Non-Halal",bg:"bg-slate-500"};
  return null;
};

function useCountdown(endTime){
  const [left, setLeft]=useState("");
  useEffect(()=>{
    if(!endTime){setLeft("While stock lasts");return;}
    const calc=()=>{
      const now=new Date();const p=endTime.split(":").map(Number);
      const end=new Date();end.setHours(p[0],p[1],0,0);
      if(end<now){setLeft("Expired");return;}
      const d=end-now;const hh=Math.floor(d/3600000);const mm=Math.floor((d%3600000)/60000);
      setLeft(hh>0?`${hh}h ${mm}m left`:`${mm} min left`);
    };
    calc();const id=setInterval(calc,30000);return()=>clearInterval(id);
  },[endTime]);
  return left;
}

// ─── LOCAL STORAGE ────────────────────────────────────────────────────────────
const LS_VENDOR = 'sapot_vendor_profile';
const LS_ORDERS = 'sapot_orders';
const LS_SUB = 'sapot_subscription';
const LS_LAT = 'sapot_lat';
const LS_LON = 'sapot_lon';
const LS_AREA = 'sapot_area';

function getVendorProfile(){try{return JSON.parse(localStorage.getItem(LS_VENDOR)||'null');}catch{return null;}}
function saveVendorProfile(p){localStorage.setItem(LS_VENDOR,JSON.stringify(p));}
function getSubscription(){try{return JSON.parse(localStorage.getItem(LS_SUB)||'null');}catch{return null;}}
function saveSubscription(s){localStorage.setItem(LS_SUB,JSON.stringify(s));}
function getOrders(){try{return JSON.parse(localStorage.getItem(LS_ORDERS)||'[]');}catch{return[];}}
function saveOrder(o){const e=getOrders();localStorage.setItem(LS_ORDERS,JSON.stringify([o,...e].slice(0,20)));}

// ─── LOCATION HOOK ────────────────────────────────────────────────────────────
function useLocation(){
  const [loc,setLoc]=useState(()=>{
    const lat=localStorage.getItem(LS_LAT);const lon=localStorage.getItem(LS_LON);const area=localStorage.getItem(LS_AREA)||'';
    if(lat&&lon)return{lat:parseFloat(lat),lon:parseFloat(lon),area,source:'saved'};return null;
  });
  const [status,setStatus]=useState(()=>localStorage.getItem(LS_LAT)?'ok':'idle');
  const [manualArea,setManualArea]=useState('');

  const AREAS={
    'puchong':{lat:3.0696,lon:101.5989},'subang':{lat:3.1073,lon:101.6067},'subang jaya':{lat:3.1073,lon:101.6067},
    'kuala lumpur':{lat:3.1390,lon:101.6869},'kl':{lat:3.1390,lon:101.6869},'petaling jaya':{lat:3.1073,lon:101.6370},
    'pj':{lat:3.1073,lon:101.6370},'kepong':{lat:3.2068,lon:101.5987},'bangsar':{lat:3.1209,lon:101.6538},
    'shah alam':{lat:3.0738,lon:101.5183},'klang':{lat:3.0449,lon:101.4456},'ampang':{lat:3.1500,lon:101.7600},
  };

  const request=()=>{
    if(!navigator.geolocation){setStatus('denied');return;}
    setStatus('requesting');
    navigator.geolocation.getCurrentPosition(
      pos=>{
        const lat=pos.coords.latitude,lon=pos.coords.longitude;
        fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`)
          .then(r=>r.json()).then(d=>{
            const a=d.address||{};
            const area=a.suburb||a.city_district||a.town||a.city||'Near you';
            localStorage.setItem(LS_LAT,lat);localStorage.setItem(LS_LON,lon);localStorage.setItem(LS_AREA,area);
            setLoc({lat,lon,area,source:'gps'});setStatus('ok');
          }).catch(()=>{
            localStorage.setItem(LS_LAT,lat);localStorage.setItem(LS_LON,lon);localStorage.setItem(LS_AREA,'Near you');
            setLoc({lat,lon,area:'Near you',source:'gps'});setStatus('ok');
          });
      },()=>setStatus('denied'),{enableHighAccuracy:true,timeout:8000}
    );
  };

  const setManual=(area)=>{
    const key=area.trim().toLowerCase();
    const coords=AREAS[key]||{lat:3.1390,lon:101.6869};
    localStorage.setItem(LS_LAT,coords.lat);localStorage.setItem(LS_LON,coords.lon);localStorage.setItem(LS_AREA,area);
    setLoc({lat:coords.lat,lon:coords.lon,area,source:'manual'});setStatus('ok');
  };

  return{loc,status,request,setManual,manualArea,setManualArea};
}

// ─── HALAL DISCLAIMER ────────────────────────────────────────────────────────
function HalalDisclaimer({t,onAccept}){
  return(
    <motion.div initial={{opacity:0}} animate={{opacity:1}}
      className="fixed inset-0 z-[900] bg-black/80 backdrop-blur-md flex items-center justify-center p-5">
      <motion.div initial={{scale:0.92,opacity:0}} animate={{scale:1,opacity:1}} transition={{type:"spring",delay:0.1}}
        className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl">
        <div className="text-center mb-4">
          <div className="text-5xl mb-3">⚠️</div>
          <h2 className="font-black text-lg">{t.halalDisclaimerTitle}</h2>
        </div>
        {t.halalDisclaimerBody.split("\n\n").map((para,i)=>(
          <p key={i} className="text-slate-600 text-sm leading-relaxed mb-3">{para}</p>
        ))}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 mb-5 flex gap-2 items-center">
          <span className="text-lg flex-shrink-0">ℹ️</span>
          <p className="text-amber-700 text-[11px] font-bold">{t.halalSelfDeclared}</p>
        </div>
        <button onClick={onAccept}
          className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest active:scale-95 transition-transform">
          {t.halalDisclaimerBtn}
        </button>
      </motion.div>
    </motion.div>
  );
}

// ─── LOCATION PROMPT ──────────────────────────────────────────────────────────
function LocationPrompt({locationHook,t}){
  const {status,request,setManual,manualArea,setManualArea,loc}=locationHook;
  const [showManual,setShowManual]=useState(false);

  if(showManual) return(
    <motion.div initial={{opacity:0,y:-6}} animate={{opacity:1,y:0}}
      className="mx-3 mt-1.5 mb-1 bg-white border border-slate-200 rounded-2xl shadow-sm p-3">
      <div className="flex gap-2 items-center">
        <input value={manualArea} onChange={e=>setManualArea(e.target.value)} placeholder="e.g. Puchong, Subang..." autoFocus
          className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold focus:border-emerald-500 focus:outline-none"
          onKeyDown={e=>{if(e.key==='Enter'&&manualArea.trim()){setManual(manualArea.trim());setShowManual(false);}}}/>
        <button onClick={()=>setShowManual(false)} className="text-slate-400 text-xs font-black px-2 py-2">X</button>
        <button onClick={()=>{if(manualArea.trim()){setManual(manualArea.trim());setShowManual(false);}}}
          disabled={!manualArea.trim()}
          className="bg-emerald-500 text-white px-3 py-2 rounded-xl font-black text-xs uppercase disabled:opacity-40">
          Go
        </button>
      </div>
    </motion.div>
  );

  if(status==='ok'&&loc){
    return(
      <div className="mx-3 mt-1.5 mb-1 bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-1.5 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="text-sm">📍</span>
          <p className="text-emerald-700 font-black text-[11px]">{loc.area}</p>
        </div>
        <button onClick={()=>setShowManual(true)} className="text-emerald-600 text-[10px] font-black bg-emerald-100 px-2 py-0.5 rounded-lg">{t.changeLocation||"Change"}</button>
      </div>
    );
  }

  if(status==='requesting') return(
    <div className="mx-3 mt-1.5 mb-1 bg-slate-50 border border-slate-100 rounded-xl px-3 py-1.5 flex items-center gap-2">
      <div className="w-3.5 h-3.5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin flex-shrink-0"/>
      <p className="text-slate-500 text-[11px] font-bold">{t.locating||"Finding your location..."}</p>
    </div>
  );

  return(
    <div className="mx-3 mt-1.5 mb-1 flex gap-2">
      <div className="flex-1 bg-amber-50 border border-amber-200 rounded-xl px-3 py-1.5 flex items-center gap-1.5 min-w-0">
        <span className="text-sm flex-shrink-0">📍</span>
        <p className="text-amber-700 font-black text-[11px] truncate">{t.locationDenied}</p>
      </div>
      <button onClick={request} className="bg-emerald-500 text-white px-3 py-1.5 rounded-xl font-black text-[10px] uppercase flex-shrink-0">Try</button>
      <button onClick={()=>setShowManual(true)} className="bg-slate-900 text-white px-3 py-1.5 rounded-xl font-black text-[10px] uppercase flex-shrink-0">Type</button>
    </div>
  );
}

// ─── 1. CATEGORY DROPDOWN ────────────────────────────────────────────────────
const CATEGORIES_DROPDOWN = [
  {id:"all",label:"All Deals",emoji:"🏪"},
  {id:"Food",label:"Food",emoji:"🍛"},
  {id:"Drink",label:"Drink",emoji:"🧋"},
  {id:"Fruit",label:"Fruit",emoji:"🍉"},
  {id:"Bakery",label:"Bakery",emoji:"🥐"},
  {id:"Other",label:"Other",emoji:"📦"},
];

function CategoryDropdown({value, onChange, t}){
  const [open,setOpen]=useState(false);
  const ref=useRef(null);

  const CATEGORIES_DYNAMIC = [
    {id:"all",label:t.catAll,emoji:"🏪"},
    {id:"Food",label:t.catFood,emoji:"🍛"},
    {id:"Drink",label:t.catDrink,emoji:"🧋"},
    {id:"Fruit",label:t.catFruit,emoji:"🍉"},
    {id:"Bakery",label:t.catBakery,emoji:"🥐"},
    {id:"Dessert",label:t.catDessert||"Dessert",emoji:"🍡"},
    {id:"Other",label:t.catOther,emoji:"📦"},
  ];

  const selected=CATEGORIES_DYNAMIC.find(c=>c.id===value)||CATEGORIES_DYNAMIC[0];

  useEffect(()=>{
    const handler=(e)=>{if(ref.current&&!ref.current.contains(e.target))setOpen(false);};
    document.addEventListener('mousedown',handler);
    return()=>document.removeEventListener('mousedown',handler);
  },[]);

  return(
    <div className="relative" ref={ref}>
      <button onClick={()=>setOpen(!open)}
        className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-xl text-[11px] font-black text-slate-700 transition-all active:scale-95 min-w-[100px]">
        <span>{selected.emoji}</span>
        <span className="flex-1 text-left">{selected.label}</span>
        <motion.span animate={{rotate:open?180:0}} transition={{duration:0.2}} className="text-slate-400 text-[8px]">▼</motion.span>
      </button>
      <AnimatePresence>
        {open&&(
          <motion.div
            initial={{opacity:0,y:-8,scale:0.95}} animate={{opacity:1,y:0,scale:1}} exit={{opacity:0,y:-8,scale:0.95}}
            transition={{type:"spring",damping:20,stiffness:300}}
            className="absolute top-full mt-1.5 left-0 z-50 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden min-w-[140px]">
            {CATEGORIES_DYNAMIC.map((cat,i)=>(
              <motion.button
                key={cat.id}
                initial={{opacity:0,x:-10}} animate={{opacity:1,x:0}} transition={{delay:i*0.03}}
                onClick={()=>{onChange(cat.id);setOpen(false);}}
                className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-left text-xs font-bold transition-colors ${value===cat.id?"bg-emerald-50 text-emerald-700":"text-slate-700 hover:bg-slate-50"}`}>
                <span className="text-base">{cat.emoji}</span>
                <span className="flex-1">{cat.label}</span>
                {value===cat.id&&<span className="text-emerald-500 font-black text-sm">✓</span>}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── LISTING CARD ─────────────────────────────────────────────────────────────
function ListingCard({listing,onAddToCart,inCart,isStudentMode,isLocked,onLockedTap,t}){
  const countdown=useCountdown(listing.endTime);
  const pct=stockPct(listing.qty,listing.claimed);
  const savings=savingsPct(listing.originalPrice,listing.dealPrice);
  const studentSavings=listing.studentPrice?savingsPct(listing.originalPrice,listing.studentPrice):null;
  const isUrgent=listing.qty&&(listing.qty-listing.claimed)<=3;
  const isSoldOut=listing.qty&&listing.claimed>=listing.qty;
  const isExpired=listing.endTime&&countdown==="Expired";
  const tag=dealTag(listing.type);
  const hb=halalBadge(listing.halal);
  const showStudentPrice=isStudentMode&&listing.studentPrice;

  return(
    <motion.div layout initial={{opacity:0,scale:0.95}} animate={{opacity:1,scale:1}}
      className={`bg-white rounded-2xl overflow-hidden shadow-sm border flex flex-col relative ${isLocked?"border-slate-200 opacity-60":"border-slate-100"} ${(isSoldOut||isExpired)?"opacity-50":""}`}>
      {/* Lock overlay */}
      {isLocked&&(
        <button onClick={onLockedTap} className="absolute inset-0 z-10 flex items-center justify-center bg-white/70 backdrop-blur-sm rounded-2xl">
          <div className="bg-slate-900 text-white px-3 py-2 rounded-xl text-[10px] font-black flex items-center gap-1.5">
            <span>🔒</span>
            <span>Finish current order first</span>
          </div>
        </button>
      )}
      <div className="relative w-full aspect-square">
        <img src={listing.image} alt={listing.title} className="w-full h-full object-cover"/>
        {(showStudentPrice?studentSavings:savings)&&(
          <div className={`absolute top-2 left-2 text-[9px] font-black px-2 py-1 rounded-lg shadow ${showStudentPrice?"bg-indigo-500 text-white":"bg-yellow-400 text-black"}`}>
            -{showStudentPrice?studentSavings:savings}%
          </div>
        )}
        {hb&&<div className={`absolute top-2 right-2 text-[8px] font-black px-2 py-1 rounded-lg text-white ${hb.bg}`}>{hb.label}</div>}
        <div className="absolute bottom-2 left-2">
          <span className={`text-[8px] font-black px-2 py-1 rounded-full uppercase text-white ${tag.bg}`}>{tag.label}</span>
        </div>
        {pct!==null&&(
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20">
            <div className={`h-full ${pct>=90?"bg-red-500":pct>=60?"bg-orange-400":"bg-emerald-400"}`} style={{width:`${pct}%`}}/>
          </div>
        )}
        {(isSoldOut||isExpired)&&(
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="bg-white text-slate-800 text-xs font-black px-3 py-1.5 rounded-full uppercase">{isSoldOut?"Sold Out":"Expired"}</span>
          </div>
        )}
      </div>
      <div className="p-2.5 flex flex-col flex-1">
        <p className="font-black text-slate-900 text-xs leading-tight line-clamp-2 mb-0.5">{listing.title}</p>
        <p className="text-slate-400 text-[9px] font-bold truncate">{listing.vendorName}</p>
        {isUrgent&&!isSoldOut&&<p className="text-[9px] font-black text-red-500 mt-0.5">⚠️ {listing.qty-listing.claimed} left!</p>}
        <div className="flex items-end justify-between mt-1.5 mb-2">
          <div>
            <p className="text-[9px] text-slate-300 line-through leading-none">RM{fmtRM(showStudentPrice?listing.dealPrice:listing.originalPrice)}</p>
            <p className={`font-black text-sm leading-none ${showStudentPrice?"text-indigo-600":"text-emerald-600"}`}>RM{fmtRM(showStudentPrice?listing.studentPrice:listing.dealPrice)}</p>
          </div>
          {listing.freeDeliveryThreshold&&<span className="text-[8px] font-black text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md">Free Del</span>}
        </div>
        <button onClick={()=>onAddToCart({...listing,dealPrice:showStudentPrice?listing.studentPrice:listing.dealPrice})}
          disabled={isSoldOut||inCart||isExpired||isLocked}
          className={`w-full mt-auto py-2 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-1 transition-all active:scale-95 ${
            inCart?"bg-emerald-100 text-emerald-600 cursor-default"
            :isSoldOut||isExpired?"bg-slate-100 text-slate-400 cursor-not-allowed"
            :showStudentPrice?"bg-indigo-700 text-white":"bg-slate-900 text-white"}`}>
          {inCart?t.addedToCart:isSoldOut?t.soldOut:isExpired?t.expired:t.addToCart}
        </button>
      </div>
    </motion.div>
  );
}

// ─── 2+3. SINGLE-VENDOR CART ──────────────────────────────────────────────────
function DifferentVendorModal({currentVendorName,newVendorName,onClear,onKeep,t}){
  return(
    <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
      className="fixed inset-0 z-[600] bg-black/70 backdrop-blur-sm flex items-center justify-center p-5">
      <motion.div initial={{scale:0.9,opacity:0}} animate={{scale:1,opacity:1}} transition={{type:"spring",damping:20}}
        className="bg-white rounded-3xl p-6 max-w-xs w-full shadow-2xl">
        <div className="text-center mb-4">
          <div className="text-4xl mb-3">🛒</div>
          <h2 className="font-black text-lg">{t.differentVendorTitle}</h2>
          <p className="text-slate-500 text-sm mt-2 leading-relaxed">
            {fill(t.differentVendorBody,currentVendorName,newVendorName)}
          </p>
        </div>
        <div className="space-y-2">
          <button onClick={onClear}
            className="w-full bg-slate-900 text-white py-3.5 rounded-2xl font-black text-sm active:scale-95 transition-transform">
            {t.clearCartBtn}
          </button>
          <button onClick={onKeep}
            className="w-full bg-slate-100 text-slate-700 py-3.5 rounded-2xl font-black text-sm active:scale-95 transition-transform">
            {t.keepCartBtn}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── ORDER TO COOK ────────────────────────────────────────────────────────────
function OrderToCook({allListings,t}){
  // Get unique vendors from listings
  const vendors=[...new Map(allListings.map(l=>[l.vendorId,{
    vendorId:l.vendorId,vendorName:l.vendorName,vendorPhone:l.vendorPhone||""
  }])).values()];

  const [selectedVendor,setSelectedVendor]=useState(null);
  const [foodName,setFoodName]=useState("");
  const [qty,setQty]=useState("1");
  const [notes,setNotes]=useState("");
  const [pickupTime,setPickupTime]=useState("");
  const [sent,setSent]=useState(false);

  const canSend=selectedVendor&&foodName.trim().length>2;

  const sendOrder=()=>{
    if(!canSend)return;
    const vendor=vendors.find(v=>v.vendorId===selectedVendor);
    const msg=`👨‍🍳 *Order to Cook — Sapot Lokal*\n\n`+
      `🏪 To: *${vendor.vendorName}*\n`+
      `🍽️ Food: *${foodName.trim()}*\n`+
      `📦 Qty: ${qty}\n`+
      (pickupTime?`⏰ Ready by: ${pickupTime}\n`:"")+
      (notes?`📝 Notes: ${notes.trim()}\n`:"")+
      `\n_Sent via Sapot Lokal — please confirm this order and share your price._`;

    const phone=vendor.vendorPhone||"";
    if(phone){
      window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`,'_blank');
    } else {
      // Fallback: open WhatsApp without a number (user picks contact)
      window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`,'_blank');
    }
    setSent(true);
    setTimeout(()=>setSent(false),4000);
  };

  return(
    <div className="px-3 pt-3 pb-28">
      {/* Explainer banner */}
      <motion.div initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}}
        className="bg-purple-50 border border-purple-200 rounded-2xl p-4 mb-4 flex gap-3">
        <span className="text-2xl flex-shrink-0">👨‍🍳</span>
        <div>
          <p className="font-black text-purple-800 text-sm">Order to Cook</p>
          <p className="text-purple-600 text-[10px] leading-relaxed mt-0.5">
            Message a merchant to cook a specific dish for you. Great for special requests, bulk orders, or dishes not listed as a deal. Merchant will confirm and quote a price via WhatsApp.
          </p>
        </div>
      </motion.div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-4 space-y-4">
        {/* Step 1 — Pick merchant */}
        <div>
          <label className="text-slate-500 text-[9px] font-black uppercase tracking-widest block mb-2">
            1 · Choose Merchant
          </label>
          <div className="flex flex-col gap-2 max-h-40 overflow-y-auto no-scrollbar">
            {vendors.map(v=>(
              <button key={v.vendorId} onClick={()=>setSelectedVendor(v.vendorId)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border-2 text-left transition-all active:scale-95 ${
                  selectedVendor===v.vendorId
                    ?"border-purple-500 bg-purple-50"
                    :"border-slate-100 bg-slate-50"
                }`}>
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${selectedVendor===v.vendorId?"bg-purple-100":"bg-slate-100"}`}>
                  <span className="text-base">🏪</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`font-black text-xs truncate ${selectedVendor===v.vendorId?"text-purple-800":"text-slate-700"}`}>{v.vendorName}</p>
                  {v.vendorPhone?<p className="text-slate-400 text-[9px]">WhatsApp available</p>:<p className="text-slate-300 text-[9px]">Manual WA</p>}
                </div>
                {selectedVendor===v.vendorId&&<span className="text-purple-500 font-black text-sm flex-shrink-0">✓</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Step 2 — Food details */}
        <div>
          <label className="text-slate-500 text-[9px] font-black uppercase tracking-widest block mb-2">
            2 · What do you want cooked?
          </label>
          <input value={foodName} onChange={e=>setFoodName(e.target.value)}
            placeholder="e.g. Nasi Goreng Kampung, Ayam Masak Merah, Laksa..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold focus:border-purple-400 focus:outline-none text-slate-700 placeholder:text-slate-300 mb-2"/>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-slate-400 text-[9px] font-bold block mb-1">Quantity (pax / packs)</label>
              <input value={qty} onChange={e=>setQty(e.target.value)} type="number" min="1"
                placeholder="1"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold focus:border-purple-400 focus:outline-none"/>
            </div>
            <div>
              <label className="text-slate-400 text-[9px] font-bold block mb-1">Ready by (optional)</label>
              <input value={pickupTime} onChange={e=>setPickupTime(e.target.value)} type="time"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold focus:border-purple-400 focus:outline-none"/>
            </div>
          </div>
        </div>

        {/* Step 3 — Notes */}
        <div>
          <label className="text-slate-500 text-[9px] font-black uppercase tracking-widest block mb-2">
            3 · Special notes (optional)
          </label>
          <textarea value={notes} onChange={e=>setNotes(e.target.value)} rows={2}
            placeholder="e.g. Less spicy, no onion, extra gravy, halal only..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold focus:border-purple-400 focus:outline-none resize-none text-slate-700 placeholder:text-slate-300"/>
        </div>

        {/* Send button */}
        <motion.button
          whileTap={{scale:0.96}}
          onClick={sendOrder}
          disabled={!canSend}
          className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg ${
            sent?"bg-emerald-500 shadow-emerald-100":canSend?"bg-[#25D366] shadow-green-100 active:scale-95":"bg-slate-200 text-slate-400 shadow-none"
          } text-white`}>
          {sent?(
            <><span className="text-base">✅</span> Message Sent!</>
          ):(
            <><span className="text-base">💬</span> Send via WhatsApp</>
          )}
        </motion.button>
        {!canSend&&<p className="text-center text-slate-300 text-[9px] font-bold">Pick a merchant and enter food name to continue</p>}

        {/* Info box */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 flex gap-2">
          <span className="text-base flex-shrink-0">💡</span>
          <div>
            <p className="text-amber-700 font-black text-[9px]">How it works</p>
            <p className="text-amber-600 text-[9px] leading-relaxed">Your request opens WhatsApp directly to the merchant. They'll reply to confirm, share the price, and let you know when it's ready. Payment is arranged directly with the merchant.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ContinueShoppingBar({vendorId,vendorName,allListings,cart,onAdd,t}){
  const cartIds=cart.map(i=>i.id);
  const moreItems=allListings.filter(l=>l.vendorId===vendorId&&!cartIds.includes(l.id)&&!(l.qty&&l.claimed>=l.qty)).slice(0,6);
  if(moreItems.length===0) return null;

  return(
    <div className="mt-3">
      <div className="border border-dashed border-emerald-300 bg-emerald-50 rounded-2xl overflow-hidden">
        <div className="px-4 py-3 flex items-center gap-2">
          <span className="text-base">🏪</span>
          <p className="font-black text-emerald-800 text-xs flex-1">{fill(t.continueShoppingBtn,vendorName)}</p>
          <span className="text-emerald-500 text-[10px] font-bold">{moreItems.length} more</span>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-3 px-4 no-scrollbar">
          {moreItems.map(item=>{
            const inCart=cartIds.includes(item.id);
            const savings=savingsPct(item.originalPrice,item.dealPrice);
            return(
              <div key={item.id} className="flex-shrink-0 w-28 bg-white rounded-xl overflow-hidden border border-emerald-100 shadow-sm">
                <div className="relative w-full h-20">
                  <img src={item.image} className="w-full h-full object-cover" alt=""/>
                  {savings&&<span className="absolute top-1 left-1 bg-yellow-400 text-black text-[8px] font-black px-1 rounded">-{savings}%</span>}
                </div>
                <div className="p-1.5">
                  <p className="font-black text-[9px] text-slate-800 truncate">{item.title}</p>
                  <p className="text-emerald-600 font-black text-[10px] mt-0.5">RM{fmtRM(item.dealPrice)}</p>
                  <button onClick={()=>onAdd(item)} disabled={inCart}
                    className={`w-full mt-1.5 py-1 rounded-lg font-black text-[9px] uppercase transition-all ${inCart?"bg-emerald-100 text-emerald-600":"bg-slate-900 text-white active:scale-95"}`}>
                    {inCart?"✓":"+ Add"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── ADVERT COUNTDOWN ─────────────────────────────────────────────────────────
function AdvertCountdown({seconds,onDone}){
  const [left,setLeft]=useState(seconds);
  useEffect(()=>{
    if(left<=0){onDone();return;}
    const id=setTimeout(()=>setLeft(l=>l-1),1000);
    return()=>clearTimeout(id);
  },[left]);
  return(
    <div className="w-8 h-8 rounded-full border-2 border-slate-200 flex items-center justify-center relative">
      <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 32 32">
        <circle cx="16" cy="16" r="13" fill="none" stroke="#e2e8f0" strokeWidth="2.5"/>
        <circle cx="16" cy="16" r="13" fill="none" stroke="#f97316" strokeWidth="2.5"
          strokeDasharray={`${(left/seconds)*81.7} 81.7`} strokeLinecap="round"/>
      </svg>
      <span className="text-[10px] font-black text-slate-600 relative z-10">{left}</span>
    </div>
  );
}

function CartPanel({cart,onRemove,onClose,onCheckout,allListings,onAdd,t}){
  const [deliveryMode,setDeliveryMode]=useState("pickup");
  const [paying,setPaying]=useState(false);
  const [success,setSuccess]=useState(false);
  const [pickupCode]=useState(()=>Math.random().toString(36).slice(2,8).toUpperCase());
  // Lalamove fields
  const [pickupAddr,setPickupAddr]=useState("");
  const [dropAddr,setDropAddr]=useState("");
  const [mobile,setMobile]=useState("");
  const [lalamoveReady,setLalamoveReady]=useState(false);
  const [showAdvert,setShowAdvert]=useState(false);
  const [advertDismissed,setAdvertDismissed]=useState(false);

  const subtotal=cart.reduce((s,i)=>s+i.dealPrice,0);
  const currentVendor=cart[0]||null;
  const threshold=currentVendor?.freeDeliveryThreshold;
  const toGo=threshold?Math.max(0,threshold-subtotal):null;
  const freeUnlocked=threshold&&subtotal>=threshold;
  const deliveryCost=deliveryMode==="pickup"?0:(freeUnlocked?0:DELIVERY_FEE);
  const total=subtotal+deliveryCost;

  // Validate Lalamove form
  useEffect(()=>{
    setLalamoveReady(deliveryMode==="delivery"?(pickupAddr.trim().length>5&&dropAddr.trim().length>5&&mobile.trim().length>=10):true);
  },[deliveryMode,pickupAddr,dropAddr,mobile]);

  // Open Lalamove deep-link with prefilled data
  const openLalamove=()=>{
    const msg=`Sapot Lokal Delivery%0APickup: ${encodeURIComponent(pickupAddr)}%0ADrop: ${encodeURIComponent(dropAddr)}%0AMobile: ${mobile}%0AOrder: ${cart.map(i=>i.title).join(', ')}`;
    // Try to open Lalamove app; fallback to web
    window.open(`https://web.lalamove.com/?utm_source=sapotlokal`,'_blank');
  };

  // After payment success, auto-save receipt then show ad
  const handlePaymentSuccess=()=>{
    setPaying(false);
    // ── AUTO-SAVE RECEIPT ──────────────────────────────────────────────────────
    const receipt={
      pickupCode,
      vendorId:cart[0]?.vendorId,
      vendorName:cart[0]?.vendorName||"Vendor",
      items:cart.map(i=>({id:i.id,title:i.title,image:i.image,dealPrice:i.dealPrice})),
      subtotal,
      deliveryCost,
      total,
      deliveryMode,
      pickupAddr:deliveryMode==="delivery"?pickupAddr:"",
      dropAddr:deliveryMode==="delivery"?dropAddr:"",
      mobile:deliveryMode==="delivery"?mobile:"",
      savedAt:Date.now(),
    };
    saveOrder(receipt);
    // ── NOTIFY MERCHANT VIA WHATSAPP ──────────────────────────────────────────
    // In production: replace vendorPhone with real number from vendor profile DB
    const vendorPhone=cart[0]?.vendorPhone||""; // e.g. "60123456789"
    if(vendorPhone){
      const items=cart.map(i=>`• ${i.title} — RM${fmtRM(i.dealPrice)}`).join('\n');
      const deliveryInfo=deliveryMode==="delivery"
        ?`\n🛵 *Lalamove Delivery*\nPickup: ${pickupAddr}\nDrop: ${dropAddr}\nContact: ${mobile}`
        :"\n🚶 *Self-Pickup*";
      const waMsg=`🧾 *New Order — Sapot Lokal*\n📦 Code: *${pickupCode}*\n\n${items}\n\n💰 Total: RM${fmtRM(total)}${deliveryInfo}\n\n_Please prepare the order. Buyer will show pickup code._`;
      window.open(`https://wa.me/${vendorPhone}?text=${encodeURIComponent(waMsg)}`,'_blank');
    }
    // ──────────────────────────────────────────────────────────────────────────
    setShowAdvert(true);
    setTimeout(()=>{setShowAdvert(false);setAdvertDismissed(true);setSuccess(true);},5000);
  };

  // MOCK AD DATA — replace with real ad from DB/CMS
  const MOCK_AD={
    type:"image", // "image" | "video"
    imageUrl:"https://picsum.photos/seed/sapotad1/600/300",
    videoUrl:"", // e.g. "https://cdn.example.com/ad.mp4"
    title:"Sponsored",
    brand:"KFC Malaysia",
    cta:"Order Now",
    ctaUrl:"https://kfc.com.my",
  };

  return(
    <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
      className="fixed inset-0 z-[300] bg-black/80 backdrop-blur-md flex items-end justify-center"
      onClick={(!success&&!showAdvert)?onClose:undefined}>
      <motion.div initial={{y:"100%"}} animate={{y:0}} exit={{y:"100%"}}
        transition={{type:"spring",damping:28,stiffness:280}}
        onClick={e=>e.stopPropagation()}
        className="w-full max-w-sm bg-white rounded-t-[36px] overflow-hidden max-h-[92vh] flex flex-col">
        <AnimatePresence mode="wait">

          {/* ── AD INTERSTITIAL (Future Upgrade) ── */}
          {showAdvert&&!advertDismissed&&(
            <motion.div key="ad" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
              className="flex flex-col overflow-y-auto max-h-[88vh]">
              {/* Future upgrade badge */}
              <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="text-lg">📢</span>
                  <div>
                    <p className="font-black text-xs text-slate-800">{MOCK_AD.brand}</p>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">{MOCK_AD.title}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="bg-amber-100 text-amber-600 text-[8px] font-black px-2 py-1 rounded-full uppercase tracking-wider">Future Upgrade</span>
                  <AdvertCountdown seconds={5} onDone={()=>{setShowAdvert(false);setAdvertDismissed(true);setSuccess(true);}}/>
                </div>
              </div>
              {/* Ad content */}
              <div className="mx-4 mt-4 rounded-2xl overflow-hidden bg-slate-100 relative">
                {MOCK_AD.type==="video"&&MOCK_AD.videoUrl?(
                  <video src={MOCK_AD.videoUrl} autoPlay muted playsInline className="w-full h-48 object-cover"/>
                ):(
                  <img src={MOCK_AD.imageUrl} alt={MOCK_AD.brand} className="w-full h-48 object-cover"/>
                )}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                  <p className="text-white font-black text-sm">{MOCK_AD.brand}</p>
                </div>
              </div>
              <div className="px-4 mt-3 mb-2">
                <a href={MOCK_AD.ctaUrl} target="_blank" rel="noreferrer"
                  className="block w-full bg-slate-900 text-white text-center py-3.5 rounded-2xl font-black text-sm uppercase tracking-widest active:scale-95 transition-transform">
                  {MOCK_AD.cta} →
                </a>
              </div>
              <p className="text-center text-slate-300 text-[9px] font-bold pb-4">Your receipt is ready — ad closes in a moment</p>
              {/* Ad slot placeholder notice */}
              <div className="mx-4 mb-4 bg-amber-50 border border-amber-200 border-dashed rounded-2xl p-3 flex gap-2 items-start">
                <span className="text-base flex-shrink-0">🔮</span>
                <div>
                  <p className="text-amber-700 font-black text-[10px]">Ad Slot — Future Upgrade</p>
                  <p className="text-amber-600 text-[9px] leading-relaxed">This space will show paid video or image ads from sponsors after each order. Revenue shared with Sapot Lokal platform.</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── RECEIPT / ORDER CONFIRMED ── */}
          {success&&(
            <motion.div key="ok" initial={{opacity:0}} animate={{opacity:1}} className="flex flex-col overflow-y-auto max-h-[88vh]">

              {/* Header */}
              <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-slate-100 flex-shrink-0">
                <div className="flex items-center gap-2">
                  <motion.div initial={{scale:0}} animate={{scale:1}} transition={{type:"spring",delay:0.1}} className="text-3xl">🎉</motion.div>
                  <div>
                    <h2 className="font-black text-lg leading-none">{t.orderPlaced}</h2>
                    <p className="text-slate-400 text-[10px] mt-0.5">{deliveryMode==="delivery"?"Lalamove will be notified":t.pickupNote}</p>
                  </div>
                </div>
                <button onClick={()=>{onCheckout({pickupCode});onClose();}}
                  className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 text-sm font-black">✕</button>
              </div>

              {/* Printable receipt card */}
              <div id="sapot-receipt" className="mx-4 mt-4 bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
                {/* Receipt header */}
                <div className="bg-emerald-600 px-5 py-4 text-center">
                  <p className="text-emerald-100 text-[9px] font-black uppercase tracking-widest mb-0.5">Sapot Lokal</p>
                  <p className="text-white font-black text-base">{currentVendor?.vendorName||"Vendor"}</p>
                  <p className="text-emerald-200 text-[10px] mt-0.5">{new Date().toLocaleString('en-MY',{dateStyle:'medium',timeStyle:'short'})}</p>
                </div>
                {/* Pickup code */}
                <div className="px-5 py-4 border-b border-dashed border-slate-200 text-center">
                  <p className="text-slate-400 text-[9px] font-black uppercase tracking-widest mb-1">{t.pickupCode}</p>
                  <p className="text-emerald-600 font-black text-4xl tracking-[10px]">{pickupCode}</p>
                  {deliveryMode==="delivery"&&<p className="text-slate-400 text-[9px] mt-1">Show to your Lalamove rider</p>}
                </div>
                {/* Delivery info */}
                {deliveryMode==="delivery"&&(
                  <div className="px-5 py-3 border-b border-dashed border-slate-200 bg-blue-50">
                    <p className="text-blue-600 font-black text-[10px] mb-1.5 flex items-center gap-1">🛵 Lalamove Delivery</p>
                    <p className="text-slate-600 text-[9px]"><span className="font-black">From:</span> {pickupAddr}</p>
                    <p className="text-slate-600 text-[9px] mt-0.5"><span className="font-black">To:</span> {dropAddr}</p>
                    <p className="text-slate-600 text-[9px] mt-0.5"><span className="font-black">Mobile:</span> {mobile}</p>
                  </div>
                )}
                {/* Items */}
                <div className="px-5 py-3 space-y-2 border-b border-dashed border-slate-200">
                  {cart.map((item,i)=>(
                    <div key={i} className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-7 h-7 rounded-lg overflow-hidden flex-shrink-0 bg-slate-100">
                          <img src={item.image} className="w-full h-full object-cover" alt=""/>
                        </div>
                        <span className="text-slate-700 text-[10px] font-bold truncate">{item.title}</span>
                      </div>
                      <span className="font-black text-[10px] text-slate-800 flex-shrink-0">RM{fmtRM(item.dealPrice)}</span>
                    </div>
                  ))}
                </div>
                {/* Totals */}
                <div className="px-5 py-3 space-y-1.5 border-b border-dashed border-slate-200">
                  <div className="flex justify-between text-[10px]"><span className="text-slate-400">{t.subtotal}</span><span className="font-bold">RM{fmtRM(subtotal)}</span></div>
                  <div className="flex justify-between text-[10px]"><span className="text-slate-400">{t.deliveryFee}</span><span className={`font-bold ${deliveryCost===0?"text-emerald-600":""}`}>{deliveryCost===0?t.free:`RM${fmtRM(deliveryCost)}`}</span></div>
                  <div className="flex justify-between text-sm pt-1 border-t border-slate-100 mt-1"><span className="font-black">Total</span><span className="font-black text-emerald-600">RM{fmtRM(total)}</span></div>
                </div>
                {/* Ad placeholder */}
                <div className="mx-4 my-3 rounded-2xl overflow-hidden border-2 border-dashed border-slate-200 relative h-20">
                  <img src={MOCK_AD.imageUrl} alt="Ad" className="w-full h-full object-cover opacity-40"/>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-xl mb-0.5">📺</span>
                    <p className="font-black text-slate-500 text-[9px]">Ad Space · Future Upgrade</p>
                  </div>
                  <span className="absolute top-1.5 right-1.5 bg-amber-400 text-white text-[7px] font-black px-1.5 py-0.5 rounded-full">FUTURE</span>
                </div>
                {/* Footer */}
                <div className="px-5 pb-4 text-center">
                  <p className="text-slate-300 text-[8px] font-bold">Thank you for using Sapot Lokal 🛒</p>
                  <p className="text-slate-200 text-[8px]">sapotlokal.com</p>
                </div>
              </div>

              {/* Action buttons */}
              <div className="px-4 mt-4 mb-3 grid grid-cols-2 gap-2">
                {/* Save as image / screenshot */}
                <button onClick={()=>{
                  // Use native share if available, else print
                  if(navigator.share){
                    navigator.share({title:'My Sapot Lokal Receipt',text:`Order ${pickupCode} from ${currentVendor?.vendorName} — RM${fmtRM(total)}`})
                      .catch(()=>{});
                  } else {
                    window.print();
                  }
                }}
                  className="flex items-center justify-center gap-2 bg-emerald-500 text-white py-3.5 rounded-2xl font-black text-xs uppercase tracking-wide active:scale-95 transition-transform shadow-md shadow-emerald-100">
                  <span className="text-base">📥</span>
                  Save Receipt
                </button>
                {/* Share via WhatsApp */}
                <button onClick={()=>{
                  const msg=`🧾 *Sapot Lokal Receipt*\n🏪 ${currentVendor?.vendorName}\n📦 Order: ${pickupCode}\n💰 Total: RM${fmtRM(total)}\n📅 ${new Date().toLocaleString('en-MY',{dateStyle:'short',timeStyle:'short'})}`;
                  window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`,'_blank');
                }}
                  className="flex items-center justify-center gap-2 bg-[#25D366] text-white py-3.5 rounded-2xl font-black text-xs uppercase tracking-wide active:scale-95 transition-transform shadow-md shadow-green-100">
                  <span className="text-base">💬</span>
                  Share WA
                </button>
              </div>
              {/* Download hint */}
              <p className="text-center text-slate-300 text-[9px] font-bold px-5 mb-3">
                {navigator.share?"Tap Save to share receipt via your phone":"Tap Save to print or screenshot this receipt"}
              </p>

              {/* Done button */}
              <div className="px-4 mb-8">
                <button onClick={()=>{onCheckout({pickupCode});onClose();}}
                  className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs active:scale-95 transition-transform">{t.goPickup}</button>
              </div>
            </motion.div>
          )}

          {/* ── CART VIEW ── */}
          {!success&&!showAdvert&&(
            <motion.div key="cart" className="flex flex-col flex-1 overflow-hidden">
              <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-slate-100 flex-shrink-0">
                <h2 className="font-black text-xl">{t.cart}</h2>
                <button onClick={onClose} className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-sm">✕</button>
              </div>
              {cart.length===0?(
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                  <p className="text-4xl mb-3">🛒</p>
                  <p className="font-bold text-slate-500">{t.cartEmpty}</p>
                  <p className="text-slate-300 text-xs mt-1">{t.browseDeals}</p>
                </div>
              ):(
                <>
                  <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
                    {/* Single vendor lock banner */}
                    {currentVendor&&(
                      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl px-4 py-3">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-base">🏪</span>
                          <div className="flex-1">
                            <p className="text-emerald-700 font-black text-xs">{t.orderingFrom}</p>
                            <p className="text-emerald-800 font-black text-sm">{currentVendor.vendorName}</p>
                          </div>
                          <span className="text-[9px] font-black text-emerald-600 bg-emerald-100 px-2 py-1 rounded-lg">1 Merchant Only</span>
                        </div>
                        <p className="text-emerald-600 text-[9px] leading-relaxed">Items from other merchants need a separate order. Tap 🔒 on other items to switch.</p>
                      </div>
                    )}
                    {/* Free delivery progress */}
                    {threshold&&(
                      <div className={`rounded-2xl border px-4 py-3 ${freeUnlocked?"bg-emerald-50 border-emerald-200":"bg-slate-50 border-slate-200"}`}>
                        {freeUnlocked?(
                          <p className="text-emerald-600 font-black text-xs">🎉 Free delivery unlocked!</p>
                        ):(
                          <>
                            <div className="flex justify-between items-center mb-2">
                              <p className="text-[10px] font-black text-slate-500">🚗 Add RM{fmtRM(toGo)} more for free delivery</p>
                              <p className="text-[10px] font-bold text-slate-400">RM{fmtRM(subtotal)}/RM{fmtRM(threshold)}</p>
                            </div>
                            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                              <motion.div className="bg-emerald-500 h-full rounded-full" animate={{width:`${Math.min((subtotal/threshold)*100,100)}%`}} transition={{duration:0.6}}/>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                    {/* Cart items */}
                    {cart.map((item,idx)=>(
                      <motion.div key={`${item.id}-${idx}`} layout exit={{opacity:0,x:-20}} className="flex gap-3 items-center bg-slate-50 rounded-2xl p-3">
                        <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-slate-200"><img src={item.image} className="w-full h-full object-cover" alt=""/></div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-black text-sm truncate">{item.title}</h4>
                          <p className="text-slate-400 text-[10px]">{item.vendorName}</p>
                          <p className="text-emerald-600 font-black text-sm mt-0.5">RM{fmtRM(item.dealPrice)}</p>
                        </div>
                        <button onClick={()=>onRemove(idx)} className="text-slate-300 hover:text-red-400 text-xs font-bold flex-shrink-0">{t.removeItem}</button>
                      </motion.div>
                    ))}
                    {/* Continue shopping from same vendor */}
                    {currentVendor&&(
                      <ContinueShoppingBar
                        vendorId={currentVendor.vendorId}
                        vendorName={currentVendor.vendorName}
                        allListings={allListings}
                        cart={cart}
                        onAdd={onAdd}
                        t={t}
                      />
                    )}
                  </div>

                  {/* ── CHECKOUT FOOTER ── */}
                  <div className="px-5 pb-8 pt-4 border-t border-slate-100 flex-shrink-0 space-y-4 bg-white">
                    {/* Delivery mode selector */}
                    <div className="grid grid-cols-2 gap-2">
                      <button onClick={()=>setDeliveryMode("pickup")}
                        className={`p-3 rounded-2xl border-2 text-left transition-all ${deliveryMode==="pickup"?"border-emerald-500 bg-emerald-50":"border-slate-100 bg-slate-50"}`}>
                        <div className="text-xl mb-1">🚶</div>
                        <p className={`font-black text-[11px] ${deliveryMode==="pickup"?"text-emerald-700":"text-slate-700"}`}>{t.selfPickup}</p>
                        <p className="text-[9px] text-slate-400 mt-0.5">Free</p>
                      </button>
                      <button onClick={()=>setDeliveryMode("delivery")}
                        className={`p-3 rounded-2xl border-2 text-left transition-all ${deliveryMode==="delivery"?"border-blue-500 bg-blue-50":"border-slate-100 bg-slate-50"}`}>
                        <div className="flex items-center gap-1 mb-1">
                          <span className="text-xl">🛵</span>
                          <span className="text-[8px] font-black bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full uppercase">Lalamove</span>
                        </div>
                        <p className={`font-black text-[11px] ${deliveryMode==="delivery"?"text-blue-700":"text-slate-700"}`}>{t.delivery}</p>
                        <p className="text-[9px] text-slate-400 mt-0.5">{freeUnlocked?"Vendor pays":`RM${fmtRM(DELIVERY_FEE)}`}</p>
                        {freeUnlocked&&<span className="text-[8px] font-black text-emerald-600 bg-emerald-100 px-1.5 py-0.5 rounded-full mt-1 inline-block">{t.free}!</span>}
                      </button>
                    </div>

                    {/* Lalamove address form */}
                    {deliveryMode==="delivery"&&(
                      <motion.div initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}}
                        className="bg-blue-50 border border-blue-200 rounded-2xl p-4 space-y-3">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-base">🛵</span>
                          <p className="font-black text-blue-700 text-xs">Lalamove Delivery Details</p>
                        </div>
                        <div>
                          <label className="text-blue-600 text-[9px] font-black uppercase tracking-wider block mb-1">📍 Pickup Address (Merchant)</label>
                          <input value={pickupAddr} onChange={e=>setPickupAddr(e.target.value)}
                            placeholder={`e.g. ${currentVendor?.vendorName||"Vendor"}, Jalan Puchong...`}
                            className="w-full bg-white border border-blue-200 rounded-xl px-3 py-2.5 text-xs font-bold focus:border-blue-500 focus:outline-none text-slate-700 placeholder:text-slate-300"/>
                        </div>
                        <div>
                          <label className="text-blue-600 text-[9px] font-black uppercase tracking-wider block mb-1">📦 Drop-off Address (You)</label>
                          <input value={dropAddr} onChange={e=>setDropAddr(e.target.value)}
                            placeholder="e.g. Unit 5-3, Sri Tiara, Puchong..."
                            className="w-full bg-white border border-blue-200 rounded-xl px-3 py-2.5 text-xs font-bold focus:border-blue-500 focus:outline-none text-slate-700 placeholder:text-slate-300"/>
                        </div>
                        <div>
                          <label className="text-blue-600 text-[9px] font-black uppercase tracking-wider block mb-1">📱 Mobile No. (Rider Contact)</label>
                          <input value={mobile} onChange={e=>setMobile(e.target.value)} type="tel"
                            placeholder="e.g. 0123456789"
                            className="w-full bg-white border border-blue-200 rounded-xl px-3 py-2.5 text-xs font-bold focus:border-blue-500 focus:outline-none text-slate-700 placeholder:text-slate-300"/>
                        </div>
                        <button onClick={openLalamove}
                          disabled={!(pickupAddr.trim().length>5&&dropAddr.trim().length>5&&mobile.trim().length>=10)}
                          className="w-full bg-[#F7941D] text-white py-3 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-transform disabled:opacity-40 shadow-md shadow-orange-200">
                          <span className="text-base">🛵</span>
                          Open Lalamove →
                        </button>
                        <p className="text-blue-400 text-[9px] text-center">Your details will be sent to Lalamove for booking</p>
                      </motion.div>
                    )}

                    {/* Order total */}
                    <div className="bg-slate-50 rounded-2xl px-4 py-3 space-y-1.5">
                      <div className="flex justify-between text-xs"><span className="text-slate-400">{t.subtotal}</span><span className="font-bold">RM{fmtRM(subtotal)}</span></div>
                      <div className="flex justify-between text-xs"><span className="text-slate-400">{t.deliveryFee}</span>
                        <span className={`font-bold ${deliveryCost===0?"text-emerald-600":""}`}>
                          {deliveryMode==="pickup"?t.free:deliveryCost===0?`${t.free} 🎉`:`RM${fmtRM(deliveryCost)}`}
                        </span>
                      </div>
                      <div className="h-px bg-slate-200"/>
                      <div className="flex justify-between text-sm"><span className="font-black">{t.total}</span><span className="font-black text-emerald-600 text-base">RM{fmtRM(total)}</span></div>
                    </div>

                    {/* Pay button */}
                    <button
                      onClick={()=>{
                        if(!lalamoveReady)return;
                        setPaying(true);
                        setTimeout(handlePaymentSuccess,1800);
                      }}
                      disabled={paying||!lalamoveReady}
                      className="w-full bg-[#1a6ef5] text-white py-4 rounded-2xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-2 active:scale-95 transition-transform shadow-lg shadow-blue-200 disabled:opacity-50">
                      {paying?<><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>{t.processingTNG}</>:t.checkoutTNG}
                    </button>
                    {deliveryMode==="delivery"&&!lalamoveReady&&(
                      <p className="text-slate-400 text-[9px] text-center font-bold">Fill in delivery details above to continue</p>
                    )}
                  </div>
                </>
              )}
            </motion.div>
          )}

        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

// ─── 5. SUBSCRIPTION PLANS SHEET ─────────────────────────────────────────────
function SubscriptionSheet({onClose,onSubscribe,isSubscribed,t}){
  const [loading,setLoading]=useState(false);
  const [celebrated,setCelebrated]=useState(false);
  const plan=SUBSCRIPTION_PLAN;

  function handleSubscribe(){
    setLoading(true);
    setTimeout(()=>{
      const sub={planId:plan.id,planName:plan.name,price:plan.price,activatedAt:new Date().toISOString(),expiresAt:new Date(Date.now()+30*86400000).toISOString()};
      saveSubscription(sub);
      setLoading(false);
      setCelebrated(true);
    },2000);
  }

  if(celebrated){
    return(
      <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
        className="fixed inset-0 z-[700] bg-black/70 backdrop-blur-sm flex items-end justify-center">
        <motion.div initial={{y:"100%"}} animate={{y:0}} exit={{y:"100%"}}
          transition={{type:"spring",damping:26}}
          className="w-full max-w-sm bg-[#0d1929] rounded-t-[36px] p-8 pb-12 text-center">
          <motion.div initial={{scale:0}} animate={{scale:[0,1.2,1]}} transition={{delay:0.1,duration:0.5}} className="text-7xl mb-4">🎉</motion.div>
          <h2 className="text-white font-black text-2xl mb-2">Welcome aboard!</h2>
          <p className="text-white/50 text-sm mb-8">You're now on the Subscriber plan. Enjoy 10% commission.</p>
          <div className={`bg-gradient-to-br ${plan.color} rounded-2xl p-4 mb-6 text-center border ${plan.border}`}>
            <p className="text-white/70 text-xs mb-1">Monthly Plan</p>
            <p className="text-white font-black text-3xl">RM{plan.price}<span className="text-base font-normal text-white/50">/mo</span></p>
          </div>
          <button onClick={()=>{onSubscribe(plan);onClose();}}
            className="w-full bg-emerald-500 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-sm active:scale-95 transition-transform">
            Start Posting 🚀
          </button>
        </motion.div>
      </motion.div>
    );
  }

  return(
    <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
      className="fixed inset-0 z-[700] bg-black/70 backdrop-blur-sm flex items-end justify-center"
      onClick={onClose}>
      <motion.div initial={{y:"100%"}} animate={{y:0}} exit={{y:"100%"}}
        transition={{type:"spring",damping:26,stiffness:260}}
        onClick={e=>e.stopPropagation()}
        className="w-full max-w-sm bg-[#0d1929] rounded-t-[36px] p-5 pb-10">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-white font-black text-xl">Subscribe · RM{plan.price}/mo</h2>
            <p className="text-white/40 text-xs mt-0.5">Free 2-month trial for all new vendors</p>
          </div>
          <button onClick={onClose} className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center text-white">✕</button>
        </div>
        {/* Plan Card */}
        <motion.div whileTap={{scale:0.99}}
          className={`w-full text-left rounded-3xl overflow-hidden border-2 ${plan.border} mb-4`}>
          <div className={`bg-gradient-to-br ${plan.color} p-5`}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-white font-black text-xl mb-1">Subscriber Plan</p>
                <p className="text-white/60 text-xs">10% commission · vs 15% without plan</p>
              </div>
              <div className="text-right">
                <p className="text-white font-black text-2xl leading-none">RM{plan.price}</p>
                <p className="text-white/50 text-[10px]">/month</p>
              </div>
            </div>
            <div className="space-y-1.5">
              {plan.perks.map((perk,i)=>(
                <div key={i} className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-[8px] font-black">✓</span>
                  </div>
                  <span className="text-white/80 text-[10px]">{perk}</span>
                </div>
              ))}
            </div>
          </div>
          {/* Compare */}
          <div className="bg-white/5 px-5 py-3">
            <div className="flex justify-between text-[9px] text-white/40 font-bold uppercase tracking-wider mb-1">
              <span>Without plan</span><span>With plan</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/50 text-sm line-through">15% commission</span>
              <span className="text-emerald-400 font-black text-sm">10% commission ✓</span>
            </div>
          </div>
        </motion.div>
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-3 flex items-center gap-3 mb-4">
          <span className="text-xl flex-shrink-0">💙</span>
          <div>
            <p className="text-blue-300 font-black text-[10px] uppercase tracking-wider">Pay & receive via TNG</p>
            <p className="text-white/50 text-[10px]">Buyer pays → fee deducted → balance sent to your TNG</p>
          </div>
        </div>
        <button onClick={handleSubscribe} disabled={loading||isSubscribed}
          className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 ${loading||isSubscribed?"bg-white/10 text-white/30":"bg-emerald-500 text-white shadow-emerald-900/50"}`}>
          {loading?<><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>Processing...</>:isSubscribed?"✅ Already Subscribed":t.subscribeCTA}
        </button>
        <p className="text-white/20 text-[9px] text-center font-bold uppercase tracking-wider mt-3">{t.autoRenew}</p>
      </motion.div>
    </motion.div>
  );
}

// ─── VENDOR ONBOARDING ────────────────────────────────────────────────────────
function VendorOnboarding({onDone,t}){
  const [form,setForm]=useState({shopName:'',area:'',phone:''});
  const upd=(k,v)=>setForm(p=>({...p,[k]:v}));
  const canDone=form.shopName.trim().length>=2;
  const handleDone=()=>{
    const profile={shopName:form.shopName.trim(),area:form.area.trim()||'My Area',phone:form.phone.trim(),joinedAt:new Date().toISOString()};
    saveVendorProfile(profile);onDone(profile);
  };
  return(
    <motion.div initial={{opacity:0}} animate={{opacity:1}}
      className="fixed inset-0 z-[700] bg-[#0a0f1e] flex flex-col items-center justify-center p-6">
      <motion.div initial={{y:30,opacity:0}} animate={{y:0,opacity:1}} transition={{delay:0.1}} className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🏪</div>
          <h2 className="text-white font-black text-2xl">{t.onboardTitle}</h2>
          <p className="text-white/40 text-sm mt-2">{t.onboardSub}</p>
        </div>
        <div className="space-y-4">
          {[{k:'shopName',label:t.onboardShopName,ph:t.onboardShopNamePH},{k:'area',label:t.onboardArea,ph:t.onboardAreaPH},{k:'phone',label:t.onboardPhone,ph:t.onboardPhonePH,type:'tel'}].map(f=>(
            <div key={f.k}>
              <label className="text-white/40 text-[9px] font-black uppercase tracking-widest block mb-2">{f.label}</label>
              <input value={form[f.k]} onChange={e=>upd(f.k,e.target.value)} placeholder={f.ph} type={f.type||'text'}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white text-sm font-bold focus:border-emerald-500 focus:outline-none placeholder:text-white/20"/>
            </div>
          ))}
        </div>
        <button onClick={handleDone} disabled={!canDone}
          className="w-full mt-8 bg-emerald-500 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-sm shadow-lg shadow-emerald-900/50 disabled:opacity-30 active:scale-95 transition-all">
          {t.onboardDone}
        </button>
        <button onClick={()=>onDone({shopName:'My Shop',area:'',phone:'',joinedAt:new Date().toISOString()})}
          className="w-full mt-3 text-white/20 text-xs font-bold py-2">{t.onboardSkip}</button>
      </motion.div>
    </motion.div>
  );
}

// ─── VENDOR FLOW ──────────────────────────────────────────────────────────────
function TrialBanner({subscription,onSubscribe}){
  if(subscription){
    return(
      <motion.button onClick={onSubscribe} whileTap={{scale:0.97}}
        className={`mx-4 mb-4 bg-gradient-to-r ${SUBSCRIPTION_PLAN.color} border ${SUBSCRIPTION_PLAN.border} rounded-2xl px-4 py-3 flex items-center justify-between w-[calc(100%-2rem)]`}>
        <div className="flex items-center gap-2">
          <span className="text-base">✅</span>
          <div>
            <p className={`font-black text-xs ${SUBSCRIPTION_PLAN.accent}`}>Subscriber Plan — Active</p>
            <p className="text-white/40 text-[9px]">10% commission · Tap to manage</p>
          </div>
        </div>
        <span className="text-white/40 text-xs">›</span>
      </motion.button>
    );
  }
  return(
    <motion.button onClick={onSubscribe} whileTap={{scale:0.97}}
      className="mx-4 mb-4 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl px-4 py-3 flex items-center justify-between w-[calc(100%-2rem)]">
      <div>
        <p className="text-indigo-400 font-black text-xs">🎁 Free Trial Active</p>
        <p className="text-white/30 text-[9px]">15% commission now · Subscribe for 10%</p>
      </div>
      <span className="bg-indigo-500 text-white text-[9px] font-black px-3 py-1.5 rounded-xl">RM29.90/mo</span>
    </motion.button>
  );
}

function VendorFlow({onNewListing,vendorMeta,subscription,onShowSubscription,t}){
  const [step,setStep]=useState(1);
  const [postType,setPostType]=useState(null);
  const [template,setTemplate]=useState(null);
  const [photo,setPhoto]=useState(null);
  const [uploading,setUploading]=useState(false);
  const [publishing,setPublishing]=useState(false);
  const [activePosts,setActivePosts]=useState([]);
  const [timeMode,setTimeMode]=useState("stock");
  const [quickHours,setQuickHours]=useState(3);
  const [form,setForm]=useState({title:"",desc:"",price:"",original:"",endTime:"",qty:"",reheat:"none",halal:null,hasStudentPrice:false,studentPrice:""});
  const [cancelTarget,setCancelTarget]=useState(null);
  const [showSuccess,setShowSuccess]=useState(false);
  const upd=(k,v)=>setForm(p=>({...p,[k]:v}));

  const commission=subscription?10:15;
  const computedEnd=timeMode==="stock"?null:timeMode==="hours"?addHours(getNow(),quickHours):"22:00";
  const canPublish=form.title&&form.price&&photo&&form.halal!==null;

  const handlePhoto=(e)=>{
    const file=e.target.files&&e.target.files[0];if(!file)return;
    setUploading(true);
    const r=new FileReader();
    r.onloadend=()=>{setPhoto(r.result);setTimeout(()=>setUploading(false),600);};
    r.readAsDataURL(file);
  };

  const applyTemplate=(tmpl)=>{setTemplate(tmpl);setForm(p=>({...p,title:tmpl.defaultTitle,desc:tmpl.defaultDesc,price:tmpl.defaultPrice,original:tmpl.defaultOriginal}));setStep(3);};

  const handlePublish=()=>{
    setPublishing(true);
    setTimeout(()=>{
      const post={
        id:'local_'+Date.now(),vendorId:99,vendorName:vendorMeta?.shopName||"My Shop",
        title:form.title,desc:form.desc,originalPrice:parseFloat(form.original)||parseFloat(form.price)*1.5,
        dealPrice:parseFloat(form.price),emoji:template?.emoji||"🍱",image:photo,
        category:template?.category||"Other",halal:form.halal!==null?form.halal:0,
        endTime:computedEnd,qty:form.qty?parseInt(form.qty):null,claimed:0,
        type:postType||"limited",postedAt:Date.now(),vendorSubscribed:!!subscription,
        freeDeliveryThreshold:null,studentPrice:form.hasStudentPrice&&form.studentPrice?parseFloat(form.studentPrice):null,
      };
      setActivePosts(p=>[post,...p]);
      onNewListing(post);
      setPublishing(false);setShowSuccess(true);
      setStep(1);setPostType(null);setTemplate(null);setPhoto(null);setTimeMode("stock");
      setForm({title:"",desc:"",price:"",original:"",endTime:"",qty:"",reheat:"none",halal:null,hasStudentPrice:false,studentPrice:""});
    },1500);
  };

  const postTypes=[
    {id:"limited",icon:"🔥",title:t.surplusType,desc:t.surplusDesc,border:"border-orange-500/30"},
    {id:"promo",icon:"⚡",title:t.promoType,desc:t.promoDesc,border:"border-blue-500/30"},
    {id:"special",icon:"🌟",title:t.specialType,desc:t.specialDesc,border:"border-purple-500/30"}
  ];

  return(
    <div className="min-h-screen bg-[#0a0f1e] pb-28">
      <TrialBanner subscription={subscription} onSubscribe={onShowSubscription}/>
      <div className="sticky top-[60px] z-40 bg-[#0a0f1e]/95 backdrop-blur-md border-b border-white/10 px-4 py-3 flex items-center justify-between">
        <div><p className="text-white font-black text-sm">{t.postNewDeal}</p><p className="text-white/30 text-[10px]">Step {step} of 3</p></div>
        <div className="flex gap-2">
          {activePosts.length>0&&<div className="bg-emerald-500/20 border border-emerald-500/30 px-3 py-1.5 rounded-xl"><span className="text-emerald-400 text-[10px] font-black">{activePosts.length} {t.activeLabel}</span></div>}
        </div>
      </div>
      <div className="px-4 pt-3"><div className="flex gap-1.5">{[1,2,3].map(s=><div key={s} className={`h-1 flex-1 rounded-full transition-all duration-500 ${s<=step?"bg-emerald-500":"bg-white/10"}`}/>)}</div></div>
      <div className="px-4 pt-5">
        <AnimatePresence mode="wait">
          {step===1&&(
            <motion.div key="s1" initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-20}}>
              <h2 className="text-white text-2xl font-black mb-1">{t.whatToPost}</h2>
              <p className="text-white/40 text-sm mb-5">{t.chooseType}</p>
              <div className="space-y-3 mb-8">
                {postTypes.map(type=>(
                  <motion.button key={type.id} whileTap={{scale:0.97}} onClick={()=>{setPostType(type.id);setStep(2);}}
                    className={`w-full text-left p-5 rounded-2xl border-2 bg-white/5 ${type.border}`}>
                    <div className="flex items-center gap-4"><span className="text-3xl">{type.icon}</span><div><h3 className="text-white font-black text-base">{type.title}</h3><p className="text-white/40 text-xs mt-0.5">{type.desc}</p></div></div>
                  </motion.button>
                ))}
              </div>
              {cancelTarget&&(
                <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 mb-2">
                  <p className="text-white font-black text-sm mb-3">🗑️ {t.cancelConfirm}</p>
                  <div className="flex gap-2">
                    <button onClick={()=>{setActivePosts(p=>p.filter(x=>x.id!==cancelTarget));setCancelTarget(null);}} className="flex-1 bg-red-500 text-white py-2.5 rounded-xl font-black text-xs uppercase">{t.cancelYes}</button>
                    <button onClick={()=>setCancelTarget(null)} className="flex-1 bg-white/10 text-white py-2.5 rounded-xl font-black text-xs uppercase">{t.cancelNo}</button>
                  </div>
                </div>
              )}
              {activePosts.length>0&&(
                <div>
                  <div className="flex items-center gap-2 mb-3"><div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"/><p className="text-white font-black text-sm uppercase tracking-wider">{t.liveNow}</p></div>
                  <div className="space-y-2">
                    {activePosts.map(l=>(
                      <div key={l.id} className="bg-white/5 border border-white/10 rounded-2xl p-3 flex gap-3 items-center">
                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-white/10 flex-shrink-0 flex items-center justify-center">{l.image?<img src={l.image} className="w-full h-full object-cover" alt=""/>:<span className="text-xl">{l.emoji}</span>}</div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-white font-black text-sm truncate">{l.title}</h4>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-emerald-400 font-black text-xs">RM{fmtRM(l.dealPrice)}</span>
                            <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">{l.endTime?`Until ${l.endTime}`:t.liveUntilStock}</span>
                          </div>
                        </div>
                        <button onClick={()=>setCancelTarget(l.id)} className="w-7 h-7 bg-red-500/20 rounded-lg flex items-center justify-center text-red-400 text-xs">✕</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
          {step===2&&(
            <motion.div key="s2" initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-20}}>
              <button onClick={()=>setStep(1)} className="text-white/40 text-xs font-bold mb-5">{t.back}</button>
              <h2 className="text-white text-2xl font-black mb-1">{t.chooseCategory}</h2>
              <p className="text-white/40 text-sm mb-5">{t.templateNote}</p>
              <div className="grid grid-cols-2 gap-3">
                {FOOD_TEMPLATES.map(tmpl=>(
                  <motion.button key={tmpl.id} whileTap={{scale:0.95}} onClick={()=>applyTemplate(tmpl)}
                    className="bg-white/5 border border-white/10 rounded-2xl p-4 text-left hover:border-emerald-500/40 transition-all">
                    <span className="text-3xl block mb-2">{tmpl.emoji}</span>
                    <h4 className="text-white font-black text-sm">{tmpl.label}</h4>
                    <p className="text-white/30 text-[9px]">{tmpl.category}</p>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
          {step===3&&(
            <motion.div key="s3" initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-20}}>
              <button onClick={()=>setStep(2)} className="text-white/40 text-xs font-bold mb-4">{t.back}</button>
              {/* Photo */}
              <label className="w-full flex items-center justify-center gap-2 bg-white/10 border border-white/20 py-4 rounded-2xl cursor-pointer active:scale-95 transition-transform mb-5">
                {uploading?<div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>:<span className="text-lg">{photo?"✅":"📸"}</span>}
                <span className="text-white font-black text-xs uppercase tracking-widest">{uploading?"Uploading...":photo?"Change Photo":t.snapPhoto}</span>
                <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handlePhoto}/>
              </label>
              {photo&&<div className="w-full h-40 rounded-2xl overflow-hidden mb-5"><img src={photo} className="w-full h-full object-cover" alt=""/></div>}
              <div className="space-y-4">
                <div>
                  <label className="text-white/40 text-[9px] font-black uppercase tracking-widest block mb-1.5">{t.foodName}</label>
                  <input value={form.title} onChange={e=>upd("title",e.target.value)} placeholder={t.foodNamePH} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm font-bold focus:border-emerald-500 focus:outline-none"/>
                </div>
                {/* Halal status */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <label className="text-white/40 text-[9px] font-black uppercase tracking-widest">Halal Status</label>
                    <span className="text-red-400 text-[9px]">* Required</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {[{val:1,icon:"🟢",label:"Halal Certified"},{val:2,icon:"🔵",label:"Muslim-Owned"},{val:3,icon:"🔴",label:"Non-Halal"},{val:0,icon:"⚪",label:"Not Stated"}].map(opt=>{
                      const sel=form.halal===opt.val;
                      return(
                        <button key={opt.val} onClick={()=>upd("halal",opt.val)} type="button"
                          className={`rounded-xl border-2 p-3 flex items-center gap-2 cursor-pointer transition-all ${sel?"border-emerald-500 bg-emerald-500/20":"border-white/10 bg-white/5"}`}>
                          <span className="text-xl">{opt.icon}</span>
                          <p className="font-black text-xs text-left text-white/80">{opt.label}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div><label className="text-white/40 text-[9px] font-black uppercase tracking-widest block mb-1.5">{t.shortDesc}</label><input value={form.desc} onChange={e=>upd("desc",e.target.value)} placeholder={t.shortDescPH} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm font-bold focus:border-emerald-500 focus:outline-none"/></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="text-white/40 text-[9px] font-black uppercase tracking-widest block mb-1.5">{t.originalPrice}</label><input value={form.original} onChange={e=>upd("original",e.target.value)} type="number" placeholder="0.00" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white/60 text-sm font-bold focus:outline-none"/></div>
                  <div><label className="text-white/40 text-[9px] font-black uppercase tracking-widest block mb-1.5">{t.dealPrice}</label><input value={form.price} onChange={e=>upd("price",e.target.value)} type="number" placeholder="0.00" className="w-full bg-white/5 border border-emerald-500/40 rounded-xl px-4 py-3 text-emerald-400 text-sm font-black focus:border-emerald-500 focus:outline-none"/></div>
                </div>
                {form.price&&(
                  <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3">
                    <div className="flex justify-between">
                      <span className="text-white/50 text-xs">{t.youReceive}</span>
                      <span className="text-emerald-400 font-black">RM{(parseFloat(form.price||0)*(1-commission/100)).toFixed(2)}</span>
                    </div>
                    <p className="text-white/20 text-[9px] mt-1">{commission}% fee · Paid to TNG after pickup</p>
                  </div>
                )}
                {/* Time mode */}
                <div>
                  <label className="text-white/40 text-[9px] font-black uppercase tracking-widest block mb-2">{t.timeModeLabel}</label>
                  <div className="space-y-2 mb-3">
                    {[{id:"stock",title:t.timeModeStock,desc:t.timeModeStock_desc},{id:"hours",title:t.timeModeHours,desc:t.timeModeHours_desc},{id:"schedule",title:t.timeModeSched,desc:t.timeModeSched_desc}].map(opt=>(
                      <button key={opt.id} onClick={()=>setTimeMode(opt.id)}
                        className={`w-full text-left px-4 py-3 rounded-xl border transition-all ${timeMode===opt.id?"bg-emerald-500/10 border-emerald-500/40":"bg-white/5 border-white/10"}`}>
                        <p className={`font-black text-xs ${timeMode===opt.id?"text-emerald-400":"text-white/70"}`}>{opt.title}</p>
                        <p className="text-white/30 text-[9px] mt-0.5">{opt.desc}</p>
                      </button>
                    ))}
                  </div>
                  {timeMode==="hours"&&(
                    <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                      <div className="flex gap-2">{[1,2,3,4,6,8].map(h=><button key={h} onClick={()=>setQuickHours(h)} className={`flex-1 py-2 rounded-lg text-[10px] font-black transition-all ${quickHours===h?"bg-emerald-500 text-white":"bg-white/5 text-white/40 border border-white/10"}`}>+{h}h</button>)}</div>
                    </div>
                  )}
                </div>
                <div><label className="text-white/40 text-[9px] font-black uppercase tracking-widest block mb-1.5">{t.qty}</label><input value={form.qty} onChange={e=>upd("qty",e.target.value)} type="number" placeholder={t.qtyPH} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm font-bold focus:outline-none"/><p className="text-white/20 text-[9px] mt-1">{t.qtyNote}</p></div>
              </div>
              <button onClick={handlePublish} disabled={!canPublish||publishing}
                className={`w-full mt-6 py-5 rounded-2xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-2 transition-all ${canPublish&&!publishing?"bg-emerald-500 text-white shadow-lg shadow-emerald-900/50 active:scale-95":"bg-white/10 text-white/30 cursor-not-allowed"}`}>
                {publishing?<><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>Posting...</>:!photo?t.snapFirst:!form.title?t.fillName:!form.price?t.fillPrice:form.halal===null?"Select Halal Status":t.goLive}
              </button>
              <p className="text-white/20 text-[9px] text-center mt-2">{t.tngNote}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <AnimatePresence>
        {showSuccess&&(
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 z-[300] bg-black/80 backdrop-blur-md flex items-end justify-center" onClick={()=>setShowSuccess(false)}>
            <motion.div initial={{y:100}} animate={{y:0}} exit={{y:100}} transition={{type:"spring",damping:28}} onClick={e=>e.stopPropagation()} className="w-full max-w-sm bg-[#0d1929] rounded-t-[40px] p-8 pb-12 text-center">
              <motion.div initial={{scale:0}} animate={{scale:1}} transition={{type:"spring",delay:0.1}} className="text-6xl mb-4">🎉</motion.div>
              <h2 className="text-white text-2xl font-black mb-2">{t.postSuccess}</h2>
              <p className="text-white/50 text-sm mb-6">{t.liveNote}</p>
              <button onClick={()=>setShowSuccess(false)} className="w-full bg-emerald-500 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs">{t.viewDash}</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── BUYER FEED ───────────────────────────────────────────────────────────────
function BuyerFeed({vendorListings,activeTab,userLocation,locationHook,t}){
  const [search,setSearch]=useState("");
  const [catFilter,setCatFilter]=useState("all");
  const [dealFilter,setDealFilter]=useState("all");
  const [buyerTab,setBuyerTab]=useState("foods"); // "foods" | "deals"
  const [cart,setCart]=useState([]);
  const [showCart,setShowCart]=useState(false);
  const [differentVendor,setDifferentVendor]=useState(null);
  const isStudentMode=activeTab==="student";

  const hav=(la1,lo1,la2,lo2)=>{
    const R=6371;const dL=(la2-la1)*Math.PI/180;const dO=(lo2-lo1)*Math.PI/180;
    const a=Math.sin(dL/2)**2+Math.cos(la1*Math.PI/180)*Math.cos(la2*Math.PI/180)*Math.sin(dO/2)**2;
    return+(R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a))).toFixed(1);
  };

  const allListings=[...vendorListings,...MOCK_LISTINGS].filter((l,i,a)=>a.findIndex(x=>String(x.id)===String(l.id))===i).map(l=>({
    ...l,
    distance:userLocation&&MOCK_VENDORS_GEO[l.vendorId]?hav(userLocation.lat,userLocation.lon,MOCK_VENDORS_GEO[l.vendorId].lat,MOCK_VENDORS_GEO[l.vendorId].lon):null,
  }));

  const cartIds=cart.map(i=>i.id);
  const currentVendorId=cart.length>0?cart[0].vendorId:null;
  const cartTotal=cart.reduce((s,i)=>s+i.dealPrice,0);

  const filtered=allListings.filter(l=>{
    if(isStudentMode)return l.studentPrice!=null;
    if(buyerTab==="cook")return false; // cook tab has its own component
    const ms=!search||[l.title,l.desc,l.vendorName,l.category].join(' ').toLowerCase().includes(search.toLowerCase());
    if(buyerTab==="foods"){
      const mc=catFilter==="all"||l.category===catFilter;
      return ms&&mc;
    } else {
      const md=dealFilter==="all"||l.type===dealFilter;
      return ms&&md;
    }
  });

  const urgentDeals=filtered.filter(l=>!isStudentMode&&l.qty&&(l.qty-l.claimed)<=3&&l.claimed<l.qty);
  const regular=filtered.filter(l=>!urgentDeals.find(u=>u.id===l.id));

  const attemptAddToCart=(item)=>{
    if(cartIds.includes(item.id))return;
    if(item.qty&&item.claimed>=item.qty)return;
    if(currentVendorId&&item.vendorId!==currentVendorId){
      const currentName=cart[0]?.vendorName||"current vendor";
      setDifferentVendor({item,currentName,newName:item.vendorName});
      return;
    }
    setCart(prev=>[...prev,item]);
  };

  const removeFromCart=(idx)=>setCart(prev=>prev.filter((_,i)=>i!==idx));

  return(
    <div className="min-h-screen bg-slate-50 pb-28">
      <LocationPrompt locationHook={locationHook} t={t}/>
      <div className="bg-amber-50 border-b border-amber-200 px-4 py-1.5 flex items-center gap-2">
        <span className="text-xs flex-shrink-0">⚠️</span>
        <p className="text-amber-700 text-[10px] font-bold">{t.halalSelfDeclared}</p>
      </div>

      {!isStudentMode&&(
        <div className="bg-white border-b border-slate-100 px-3 pt-2 pb-2 sticky top-[60px] z-40">
          {/* Search bar */}
          <div className="relative mb-2">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🔍</span>
            <input type="text" value={search} onChange={e=>setSearch(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full bg-slate-100 rounded-xl pl-8 pr-4 py-2 text-xs font-medium outline-none focus:ring-2 focus:ring-emerald-400"/>
            {search&&<button onClick={()=>setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">✕</button>}
          </div>
          {/* Three main tabs */}
          <div className="flex gap-1.5 mb-2">
            <button onClick={()=>setBuyerTab("foods")}
              className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-wide transition-all ${buyerTab==="foods"?"bg-emerald-500 text-white shadow-sm":"bg-slate-100 text-slate-500"}`}>
              🍽️ All Foods
            </button>
            <button onClick={()=>setBuyerTab("deals")}
              className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-wide transition-all ${buyerTab==="deals"?"bg-orange-500 text-white shadow-sm":"bg-slate-100 text-slate-500"}`}>
              🔖 Deals
            </button>
            <button onClick={()=>setBuyerTab("cook")}
              className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-wide transition-all ${buyerTab==="cook"?"bg-purple-500 text-white shadow-sm":"bg-slate-100 text-slate-500"}`}>
              👨‍🍳 Cook
            </button>
          </div>
          {/* Foods sub-filter: category pills */}
          {buyerTab==="foods"&&(
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-0.5">
              {[
                {id:"all",emoji:"🍽️",label:"All"},
                {id:"Food",emoji:"🍛",label:t.catFood},
                {id:"Drink",emoji:"🧋",label:t.catDrink},
                {id:"Bakery",emoji:"🥐",label:t.catBakery},
                {id:"Dessert",emoji:"🍡",label:t.catDessert||"Dessert"},
                {id:"TongSui",emoji:"🍮",label:t.catTongSui||"Tong Sui"},
                {id:"Fruit",emoji:"🍉",label:t.catFruit},
                {id:"Other",emoji:"📦",label:t.catOther},
              ].map(cat=>(
                <button key={cat.id} onClick={()=>setCatFilter(cat.id)}
                  className={`flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-black transition-all active:scale-95 border ${
                    catFilter===cat.id
                      ?"bg-emerald-600 text-white border-emerald-600"
                      :"bg-white text-slate-600 border-slate-200"
                  }`}>
                  <span className="text-sm leading-none">{cat.emoji}</span>
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>
          )}
          {/* Deals sub-filter: deal type pills */}
          {buyerTab==="deals"&&(
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-0.5">
              {[
                {id:"all",emoji:"🔖",label:"All Deals",color:"bg-slate-900"},
                {id:"promo",emoji:"⚡",label:"Promotion",color:"bg-blue-500"},
                {id:"limited",emoji:"🔥",label:"Limited",color:"bg-orange-500"},
                {id:"surplus",emoji:"💰",label:"Surplus",color:"bg-emerald-600"},
                {id:"special",emoji:"🌟",label:"Special",color:"bg-purple-500"},
              ].map(d=>(
                <button key={d.id} onClick={()=>setDealFilter(d.id)}
                  className={`flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-black transition-all active:scale-95 border ${
                    dealFilter===d.id
                      ?`${d.color} text-white border-transparent`
                      :"bg-white text-slate-600 border-slate-200"
                  }`}>
                  <span className="text-sm leading-none">{d.emoji}</span>
                  <span>{d.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── ORDER TO COOK TAB ── */}
      {buyerTab==="cook"&&!isStudentMode&&(
        <OrderToCook allListings={allListings} t={t}/>
      )}

      <div className="px-3 pt-3 pb-6" style={{display:buyerTab==="cook"?"none":"block"}}>
        {isStudentMode&&(
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 rounded-2xl p-4 mb-3">
            <h2 className="font-black text-indigo-900 text-base mb-0.5">{t.studentCornerTitle}</h2>
            <p className="text-indigo-600 text-xs">{t.studentCornerDesc}</p>
          </div>
        )}

        {urgentDeals.length>0&&(
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"/>
              <h2 className="text-sm font-black text-slate-900">{t.almostGone}</h2>
              <span className="bg-red-100 text-red-600 text-[9px] font-black px-2 py-0.5 rounded-full uppercase">{urgentDeals.length} left</span>
            </div>
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
              {urgentDeals.map(l=>(
                <div key={l.id} className="w-36 flex-shrink-0">
                  <ListingCard listing={l} onAddToCart={attemptAddToCart} inCart={cartIds.includes(l.id)}
                    isStudentMode={false}
                    isLocked={currentVendorId&&l.vendorId!==currentVendorId}
                    onLockedTap={()=>attemptAddToCart(l)}
                    t={t}/>
                </div>
              ))}
            </div>
          </div>
        )}

        {!isStudentMode&&(
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-black text-slate-900">{search||(buyerTab==="foods"&&catFilter!=="all")||(buyerTab==="deals"&&dealFilter!=="all")?`${regular.length} results`:t.nearbyDeals}</h2>
            <span className="text-[10px] text-slate-400">{filtered.length} deals</span>
          </div>
        )}

        {regular.length===0&&urgentDeals.length===0?(
          <div className="text-center py-20">
            <p className="text-5xl mb-3">{isStudentMode?"🎓":"🍽️"}</p>
            <p className="text-slate-600 font-black text-base">{isStudentMode?t.studentCornerEmpty:t.noDealsArea}</p>
            <p className="text-slate-400 text-sm mt-2">{isStudentMode?t.studentCornerEmptySub:fill(t.noDealsAreaSub,userLocation?.area||"your area")}</p>
          </div>
        ):(
          <div className="grid grid-cols-2 gap-2.5">
            {regular.map(l=>(
              <ListingCard key={l.id} listing={l} onAddToCart={attemptAddToCart} inCart={cartIds.includes(l.id)}
                isStudentMode={isStudentMode}
                isLocked={!!(currentVendorId&&l.vendorId!==currentVendorId)}
                onLockedTap={()=>attemptAddToCart(l)}
                t={t}/>
            ))}
          </div>
        )}
      </div>

      {/* Floating cart */}
      <AnimatePresence>
        {cart.length>0&&(
          <motion.div initial={{y:100,opacity:0}} animate={{y:0,opacity:1}} exit={{y:100,opacity:0}}
            className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-sm">
            <button onClick={()=>setShowCart(true)}
              className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black flex items-center justify-between px-5 shadow-2xl shadow-slate-900/40 active:scale-95 transition-transform">
              <div className="flex items-center gap-3">
                <div className="bg-emerald-500 text-white w-7 h-7 rounded-full flex items-center justify-center text-xs font-black">{cart.length}</div>
                <span className="text-sm uppercase tracking-widest">{t.cart}</span>
                <span className="text-slate-400 text-[10px]">· {cart[0]?.vendorName}</span>
              </div>
              <span className="text-emerald-400 font-black text-base">RM{fmtRM(cartTotal)}</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. Different vendor modal */}
      <AnimatePresence>
        {differentVendor&&(
          <DifferentVendorModal
            currentVendorName={differentVendor.currentName}
            newVendorName={differentVendor.newName}
            onClear={()=>{setCart([differentVendor.item]);setDifferentVendor(null);}}
            onKeep={()=>setDifferentVendor(null)}
            t={t}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showCart&&(
          <CartPanel cart={cart} onRemove={removeFromCart} onClose={()=>setShowCart(false)}
            onCheckout={()=>{setCart([]);setShowCart(false);}}
            onAdd={attemptAddToCart}
            allListings={allListings}
            t={t}/>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── 4. DESKTOP PHONE FRAME — handled in App export below ────────────────────

// ─── RECEIPTS PAGE ────────────────────────────────────────────────────────────
function ReceiptsPage({t, onBack}){
  const [orders,setOrders]=useState(()=>getOrders());
  const [expanded,setExpanded]=useState(null);
  const [shareMsg,setShareMsg]=useState(null);

  const refresh=()=>setOrders(getOrders());

  const deleteReceipt=(code)=>{
    const updated=getOrders().filter(o=>o.pickupCode!==code);
    localStorage.setItem(LS_ORDERS,JSON.stringify(updated));
    setOrders(updated);
  };

  const shareWhatsApp=(o)=>{
    const msg=`🧾 *Sapot Lokal Receipt*\n🏪 ${o.vendorName}\n📦 Code: ${o.pickupCode}\n📅 ${new Date(o.savedAt).toLocaleString('en-MY',{dateStyle:'short',timeStyle:'short'})}\n💰 Total: RM${fmtRM(o.total)}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`,'_blank');
  };

  const handleShare=(o)=>{
    if(navigator.share){
      navigator.share({title:'Sapot Lokal Receipt',text:`Order ${o.pickupCode} · ${o.vendorName} · RM${fmtRM(o.total)}`}).catch(()=>{});
    } else {
      window.print();
    }
  };

  if(orders.length===0){
    return(
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center pb-28 px-6 text-center">
        <motion.span initial={{scale:0,rotate:-20}} animate={{scale:1,rotate:0}} transition={{type:"spring",stiffness:300,damping:15}}
          className="text-6xl mb-4 block">🧾</motion.span>
        <h2 className="font-black text-slate-800 text-lg mb-2">No Receipts Yet</h2>
        <p className="text-slate-400 text-sm mb-6">Your receipts appear here automatically after each order.</p>
        <motion.button whileTap={{scale:0.95}} onClick={onBack}
          className="flex items-center gap-2 bg-emerald-500 text-white px-6 py-3 rounded-2xl font-black text-sm shadow-lg shadow-emerald-100 active:scale-95">
          <span>🛍️</span> Start Shopping
        </motion.button>
      </div>
    );
  }

  return(
    <div className="min-h-screen bg-slate-50 pb-32">
      {/* Page header with back button */}
      <div className="bg-white border-b border-slate-100 px-4 pt-4 pb-3 sticky top-[60px] z-40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <motion.button whileTap={{scale:0.88}} onClick={onBack}
              className="w-8 h-8 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500 active:bg-slate-200 transition-colors">
              <span className="text-sm">←</span>
            </motion.button>
            <div>
              <h2 className="font-black text-slate-900 text-base leading-none">My Receipts</h2>
              <p className="text-slate-400 text-[10px] font-bold mt-0.5">{orders.length} order{orders.length!==1?"s":""} saved automatically</p>
            </div>
          </div>
          <motion.span
            animate={{rotate:[0,-10,10,-6,6,0]}}
            transition={{duration:0.6,delay:0.3,ease:"easeInOut"}}
            className="text-2xl">🧾</motion.span>
        </div>
      </div>

      <div className="px-3 pt-3 space-y-3">
        {orders.map((o,idx)=>{
          const isOpen=expanded===o.pickupCode;
          const date=new Date(o.savedAt);
          return(
            <motion.div key={o.pickupCode} layout
              className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100">

              {/* Receipt top bar — always visible */}
              <button onClick={()=>setExpanded(isOpen?null:o.pickupCode)}
                className="w-full px-4 py-3.5 flex items-center gap-3 text-left">
                {/* Merchant icon */}
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-lg">🏪</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-black text-slate-900 text-sm truncate">{o.vendorName}</p>
                  <p className="text-slate-400 text-[10px] font-bold">
                    {date.toLocaleDateString('en-MY',{day:'numeric',month:'short',year:'numeric'})} · {date.toLocaleTimeString('en-MY',{hour:'2-digit',minute:'2-digit'})}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-black text-emerald-600 text-sm">RM{fmtRM(o.total)}</p>
                  <p className="text-slate-300 text-[9px]">{o.items?.length||0} item{(o.items?.length||0)!==1?"s":""}</p>
                </div>
                <motion.span animate={{rotate:isOpen?180:0}} transition={{duration:0.2}} className="text-slate-300 text-[10px] flex-shrink-0 ml-1">▼</motion.span>
              </button>

              {/* Expanded receipt detail */}
              <AnimatePresence>
                {isOpen&&(
                  <motion.div
                    initial={{height:0,opacity:0}} animate={{height:"auto",opacity:1}} exit={{height:0,opacity:0}}
                    transition={{duration:0.25,ease:"easeInOut"}}
                    className="overflow-hidden">
                    {/* Divider */}
                    <div className="mx-4 border-t border-dashed border-slate-200"/>

                    {/* Printable receipt body */}
                    <div id={`receipt-${o.pickupCode}`} className="px-4 pt-3 pb-2">
                      {/* Green header */}
                      <div className="bg-emerald-600 rounded-2xl px-4 py-3 text-center mb-3">
                        <p className="text-emerald-100 text-[8px] font-black uppercase tracking-widest">Sapot Lokal</p>
                        <p className="text-white font-black text-sm">{o.vendorName}</p>
                        <p className="text-emerald-200 text-[9px] mt-0.5">{date.toLocaleString('en-MY',{dateStyle:'medium',timeStyle:'short'})}</p>
                      </div>

                      {/* Pickup code */}
                      <div className="bg-emerald-50 border-2 border-dashed border-emerald-200 rounded-2xl px-4 py-3 text-center mb-3">
                        <p className="text-slate-400 text-[8px] font-black uppercase tracking-widest mb-1">{t.pickupCode}</p>
                        <p className="text-emerald-600 font-black text-3xl tracking-[8px]">{o.pickupCode}</p>
                        {o.deliveryMode==="delivery"&&<p className="text-slate-400 text-[8px] mt-1">Show to Lalamove rider</p>}
                      </div>

                      {/* Delivery info */}
                      {o.deliveryMode==="delivery"&&o.pickupAddr&&(
                        <div className="bg-blue-50 border border-blue-200 rounded-2xl px-3 py-2.5 mb-3 space-y-0.5">
                          <p className="text-blue-600 font-black text-[9px] flex items-center gap-1">🛵 Lalamove Delivery</p>
                          <p className="text-slate-500 text-[9px]"><span className="font-black">From:</span> {o.pickupAddr}</p>
                          <p className="text-slate-500 text-[9px]"><span className="font-black">To:</span> {o.dropAddr}</p>
                          <p className="text-slate-500 text-[9px]"><span className="font-black">Mobile:</span> {o.mobile}</p>
                        </div>
                      )}

                      {/* Items */}
                      <div className="space-y-1.5 mb-3">
                        {(o.items||[]).map((item,i)=>(
                          <div key={i} className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-xl overflow-hidden flex-shrink-0 bg-slate-100">
                              {item.image&&<img src={item.image} className="w-full h-full object-cover" alt=""/>}
                            </div>
                            <span className="flex-1 text-slate-700 text-[10px] font-bold truncate">{item.title}</span>
                            <span className="font-black text-[10px] text-slate-800 flex-shrink-0">RM{fmtRM(item.dealPrice)}</span>
                          </div>
                        ))}
                      </div>

                      {/* Totals */}
                      <div className="border-t border-dashed border-slate-200 pt-2 space-y-1">
                        <div className="flex justify-between text-[10px]"><span className="text-slate-400">{t.subtotal}</span><span className="font-bold">RM{fmtRM(o.subtotal)}</span></div>
                        <div className="flex justify-between text-[10px]"><span className="text-slate-400">{t.deliveryFee}</span><span className={`font-bold ${o.deliveryCost===0?"text-emerald-600":""}`}>{o.deliveryCost===0?t.free:`RM${fmtRM(o.deliveryCost)}`}</span></div>
                        <div className="flex justify-between text-sm pt-1 border-t border-slate-100"><span className="font-black">Total</span><span className="font-black text-emerald-600">RM{fmtRM(o.total)}</span></div>
                      </div>

                      {/* Footer */}
                      <p className="text-center text-slate-200 text-[8px] font-bold mt-2 pb-1">Thank you · sapotlokal.com</p>
                    </div>

                    {/* Action buttons */}
                    <div className="px-4 pb-4 grid grid-cols-3 gap-2">
                      <button onClick={()=>handleShare(o)}
                        className="flex flex-col items-center justify-center gap-1 bg-emerald-50 border border-emerald-200 text-emerald-700 py-2.5 rounded-2xl font-black text-[9px] uppercase active:scale-95 transition-transform">
                        <span className="text-base">📥</span>
                        Save
                      </button>
                      <button onClick={()=>shareWhatsApp(o)}
                        className="flex flex-col items-center justify-center gap-1 bg-green-50 border border-green-200 text-green-700 py-2.5 rounded-2xl font-black text-[9px] uppercase active:scale-95 transition-transform">
                        <span className="text-base">💬</span>
                        WhatsApp
                      </button>
                      <button onClick={()=>deleteReceipt(o.pickupCode)}
                        className="flex flex-col items-center justify-center gap-1 bg-red-50 border border-red-200 text-red-400 py-2.5 rounded-2xl font-black text-[9px] uppercase active:scale-95 transition-transform">
                        <span className="text-base">🗑️</span>
                        Delete
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* Floating Continue Shopping bar */}
      <motion.div
        initial={{y:80,opacity:0}} animate={{y:0,opacity:1}} transition={{type:"spring",damping:22,stiffness:260,delay:0.2}}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-32px)] max-w-sm">
        <motion.button
          whileTap={{scale:0.96}}
          onClick={onBack}
          className="w-full bg-emerald-500 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl shadow-emerald-200 active:bg-emerald-600 transition-colors">
          <motion.span
            animate={{x:[-2,2,-2]}}
            transition={{duration:1.2,repeat:Infinity,ease:"easeInOut"}}
            className="text-xl">🛍️</motion.span>
          Continue Shopping
          <span className="text-emerald-200 text-base">→</span>
        </motion.button>
      </motion.div>
    </div>
  );
}

// ─── LANG TOGGLE ─────────────────────────────────────────────────────────────
const LANG_CYCLE={en:"bm",bm:"zh",zh:"en"};
const LANG_META={en:{flag:"🇬🇧",label:"EN"},bm:{flag:"🇲🇾",label:"BM"},zh:{flag:"🇨🇳",label:"中"}};
function LangToggle({lang,setLang}){
  const meta=LANG_META[lang]||LANG_META.en;
  return(
    <button onClick={()=>setLang(LANG_CYCLE[lang]||"en")}
      className="flex items-center gap-1 bg-slate-100 px-2.5 py-1.5 rounded-xl active:scale-95">
      <span className="text-sm">{meta.flag}</span>
      <span className="text-[10px] font-black text-slate-600">{meta.label}</span>
    </button>
  );
}

// ─── MERCHANT GATE (PIN LOCK) ──────────────────────────────────────────────────
const MERCHANT_PIN = "1234"; // change this to your real PIN
const LS_MERCHANT_AUTH = "sapot_merchant_auth";

function getMerchantAuth(){
  try{
    const d=JSON.parse(localStorage.getItem(LS_MERCHANT_AUTH)||'null');
    if(!d)return false;
    // Session valid for 24 hours
    return (Date.now()-d.at)<86400000;
  }catch{return false;}
}
function saveMerchantAuth(){
  localStorage.setItem(LS_MERCHANT_AUTH,JSON.stringify({at:Date.now()}));
}
function clearMerchantAuth(){
  localStorage.removeItem(LS_MERCHANT_AUTH);
}

function MerchantGate({onUnlock,onCancel}){
  const [pin,setPin]=useState("");
  const [error,setError]=useState(false);
  const [shake,setShake]=useState(false);

  const handleDigit=(d)=>{
    if(pin.length>=4)return;
    const next=pin+d;
    setPin(next);
    setError(false);
    if(next.length===4){
      if(next===MERCHANT_PIN){
        saveMerchantAuth();
        onUnlock();
      } else {
        setShake(true);
        setError(true);
        setTimeout(()=>{setPin("");setShake(false);},700);
      }
    }
  };

  const handleDel=()=>{setPin(p=>p.slice(0,-1));setError(false);};

  return(
    <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
      className="fixed inset-0 z-[800] bg-[#0a0f1e]/98 backdrop-blur-md flex flex-col items-center justify-center p-6">
      <motion.div initial={{y:30,opacity:0}} animate={{y:0,opacity:1}} transition={{delay:0.05}}
        className="w-full max-w-xs text-center">
        {/* Icon */}
        <motion.div animate={shake?{x:[-8,8,-8,8,0]}:{x:0}} transition={{duration:0.35}}
          className={`w-20 h-20 mx-auto rounded-3xl flex items-center justify-center mb-6 ${error?"bg-red-500/20 border-2 border-red-500/40":"bg-emerald-500/20 border-2 border-emerald-500/30"}`}>
          <span className="text-4xl">{error?"❌":"🏪"}</span>
        </motion.div>
        <h2 className="text-white font-black text-2xl mb-1">Merchant Area</h2>
        <p className="text-white/40 text-sm mb-8">Enter your PIN to continue</p>

        {/* PIN dots */}
        <div className="flex justify-center gap-4 mb-8">
          {[0,1,2,3].map(i=>(
            <motion.div key={i}
              animate={pin.length>i?{scale:[1.2,1]}:{scale:1}}
              className={`w-4 h-4 rounded-full border-2 transition-all ${
                error?"border-red-500 bg-red-500":
                pin.length>i?"border-emerald-400 bg-emerald-400":"border-white/20 bg-transparent"
              }`}/>
          ))}
        </div>
        {error&&<p className="text-red-400 text-xs font-bold mb-4 -mt-4">Wrong PIN. Try again.</p>}

        {/* Numpad */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          {[1,2,3,4,5,6,7,8,9].map(d=>(
            <motion.button key={d} whileTap={{scale:0.88}}
              onClick={()=>handleDigit(String(d))}
              className="bg-white/8 border border-white/10 text-white font-black text-xl py-4 rounded-2xl active:bg-white/20 transition-all">
              {d}
            </motion.button>
          ))}
          <div/>
          <motion.button whileTap={{scale:0.88}} onClick={()=>handleDigit("0")}
            className="bg-white/8 border border-white/10 text-white font-black text-xl py-4 rounded-2xl active:bg-white/20 transition-all">
            0
          </motion.button>
          <motion.button whileTap={{scale:0.88}} onClick={handleDel}
            className="bg-white/8 border border-white/10 text-white font-black text-xl py-4 rounded-2xl active:bg-white/20 transition-all">
            ⌫
          </motion.button>
        </div>

        <button onClick={onCancel}
          className="w-full text-white/30 text-xs font-bold py-3 hover:text-white/50 transition-colors">
          ← Back to Buyer
        </button>
      </motion.div>
    </motion.div>
  );
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────
function useIsDesktop(){
  const [isDesktop,setIsDesktop]=useState(()=>typeof window!=='undefined'&&window.innerWidth>=768);
  useEffect(()=>{
    const h=()=>setIsDesktop(window.innerWidth>=768);
    window.addEventListener('resize',h);return()=>window.removeEventListener('resize',h);
  },[]);
  return isDesktop;
}

function AppInner(){
  const [lang,setLang]=useState("en");
  const [tab,setTab]=useState("deals");
  const [showHalalDisclaimer,setShowHalalDisclaimer]=useState(true);
  const [vendorMeta,setVendorMeta]=useState(()=>getVendorProfile());
  const [showOnboarding,setShowOnboarding]=useState(false);
  const [showSubscription,setShowSubscription]=useState(false);
  const [subscription,setSubscription]=useState(()=>getSubscription());
  const [vendorListings,setVendorListings]=useState([]);
  const [showMerchantGate,setShowMerchantGate]=useState(false);
  const [merchantUnlocked,setMerchantUnlocked]=useState(()=>getMerchantAuth());
  const locationHook=useLocation();
  const t=T[lang]||T.en;

  useEffect(()=>{if(locationHook.status==='idle')locationHook.request();},[]);

  const handleNewListing=(listing)=>setVendorListings(p=>[listing,...p]);

  return(
    <div className="max-w-sm mx-auto relative md:max-w-none md:mx-0">
      <AnimatePresence>
        {showHalalDisclaimer&&<HalalDisclaimer t={t} onAccept={()=>setShowHalalDisclaimer(false)}/>}
      </AnimatePresence>

      <header className="sticky top-0 z-50 bg-white border-b border-slate-100 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 bg-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <span className="text-xl">🛒</span>
          </div>
          <div>
            <h1 className="font-black text-emerald-800 text-base leading-none">Sapot Lokal</h1>
            <p className="text-slate-400 text-[10px] font-bold">
              {locationHook.status==='requesting'?'📍 Finding you...':locationHook.loc?.area?`📍 ${locationHook.loc.area}`:'📍 Tap to set area'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <LangToggle lang={lang} setLang={setLang}/>
          <div className="flex bg-slate-100 p-1 rounded-xl gap-0.5">
            <button onClick={()=>setTab("deals")} className={`px-2.5 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${tab==="deals"?"bg-white shadow-sm text-emerald-600":"text-slate-400"}`}>{t.buy}</button>
            <button onClick={()=>setTab("student")} className={`px-2 py-1.5 rounded-lg text-[10px] font-black transition-all ${tab==="student"?"bg-white shadow-sm text-indigo-600":"text-slate-400"}`}>🎓</button>
            <button onClick={()=>setTab("receipts")} className={`px-2 py-1.5 rounded-lg text-[10px] font-black transition-all relative ${tab==="receipts"?"bg-white shadow-sm text-amber-600":"text-slate-400"}`}>
              <motion.span
                animate={tab!=="receipts"&&getOrders().length>0
                  ?{rotate:[0,-15,15,-10,10,-5,5,0],scale:[1,1.2,1.2,1.15,1.15,1.1,1.1,1]}
                  :{rotate:0,scale:1}}
                transition={{duration:0.7,ease:"easeInOut",repeat:Infinity,repeatDelay:2.5}}
                className="inline-block text-base leading-none">🧾</motion.span>
              {getOrders().length>0&&tab!=="receipts"&&(
                <motion.span
                  initial={{scale:0}} animate={{scale:1}} transition={{type:"spring",stiffness:400,damping:12}}
                  className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-amber-500 text-white text-[7px] font-black rounded-full flex items-center justify-center">
                  {getOrders().length}
                </motion.span>
              )}
            </button>
            <button onClick={()=>{
              if(merchantUnlocked){
                if(!vendorMeta){setShowOnboarding(true);return;}
                setTab("sell");
              } else {
                setShowMerchantGate(true);
              }
            }} className={`px-2.5 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all flex items-center gap-1 ${tab==="sell"?"bg-white shadow-sm text-emerald-600":"text-slate-400"}`}>
              {!merchantUnlocked&&<span className="text-[8px]">🔒</span>}
              {t.sell}
            </button>
          </div>
          {/* Merchant logout when on sell tab */}
          {tab==="sell"&&merchantUnlocked&&(
            <button onClick={()=>{clearMerchantAuth();setMerchantUnlocked(false);setTab("deals");}}
              className="w-7 h-7 bg-red-100 rounded-lg flex items-center justify-center text-red-400 text-xs font-black"
              title="Lock merchant page">🔒</button>
          )}
        </div>
      </header>

      <div style={{display:(tab==="deals"||tab==="student")?"block":"none"}}>
        <BuyerFeed vendorListings={vendorListings} activeTab={tab} userLocation={locationHook.loc} locationHook={locationHook} t={t}/>
      </div>

      <AnimatePresence mode="wait">
        {tab==="receipts"&&(
          <motion.div key="receipts" initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-20}} transition={{duration:0.2}}>
            <ReceiptsPage t={t} onBack={()=>setTab("deals")}/>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {tab==="sell"&&(
          <motion.div key="sell" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
            <VendorFlow onNewListing={handleNewListing} vendorMeta={vendorMeta} subscription={subscription} onShowSubscription={()=>setShowSubscription(true)} t={t}/>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 5. Subscription Plans Sheet */}
      <AnimatePresence>
        {showSubscription&&(
          <SubscriptionSheet
            onClose={()=>setShowSubscription(false)}
            onSubscribe={(plan)=>{setSubscription(getSubscription());}}
            isSubscribed={!!subscription}
            t={t}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showOnboarding&&(
          <VendorOnboarding onDone={(profile)=>{setVendorMeta(profile);setShowOnboarding(false);setTab("sell");}} t={t}/>
        )}
      </AnimatePresence>

      {/* Merchant PIN Gate */}
      <AnimatePresence>
        {showMerchantGate&&(
          <MerchantGate
            onUnlock={()=>{
              setMerchantUnlocked(true);
              setShowMerchantGate(false);
              if(!vendorMeta){setShowOnboarding(true);}
              else{setTab("sell");}
            }}
            onCancel={()=>setShowMerchantGate(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default function App(){
  const isDesktop=useIsDesktop();
  if(isDesktop){
    return(
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-8 relative">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl"/>
          <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"/>
        </div>
        {/* iPhone-style frame */}
        <div className="relative flex-shrink-0" style={{width:393,height:852}}>
          {/* Outer shell */}
          <div className="absolute inset-0 rounded-[52px] bg-gradient-to-b from-slate-600 via-slate-500 to-slate-600 shadow-[0_60px_120px_rgba(0,0,0,0.9),0_0_0_1px_rgba(255,255,255,0.08),inset_0_1px_0_rgba(255,255,255,0.15)]">
            {/* Volume buttons */}
            <div className="absolute -left-[3px] top-24 w-[3px] h-8 bg-slate-500 rounded-l-full"/>
            <div className="absolute -left-[3px] top-36 w-[3px] h-14 bg-slate-500 rounded-l-full"/>
            <div className="absolute -left-[3px] top-54 w-[3px] h-14 bg-slate-500 rounded-l-full"/>
            {/* Power button */}
            <div className="absolute -right-[3px] top-40 w-[3px] h-20 bg-slate-500 rounded-r-full"/>
            {/* Inner bezel */}
            <div className="absolute inset-[3px] rounded-[49px] bg-slate-950 overflow-hidden">
              {/* Screen */}
              <div className="absolute inset-[2px] rounded-[47px] bg-white overflow-hidden">
                {/* Dynamic Island */}
                <div className="absolute top-3.5 left-1/2 -translate-x-1/2 z-[999] w-[126px] h-9 bg-black rounded-[20px] flex items-center justify-between px-3 shadow-xl">
                  <div className="w-3.5 h-3.5 bg-[#1a1a1a] rounded-full border border-[#333] flex items-center justify-center">
                    <div className="w-2 h-2 bg-[#0a84ff] rounded-full opacity-70"/>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-[#1a1a1a] rounded-full border border-[#333]"/>
                    <div className="w-1.5 h-1.5 bg-[#1a1a1a] rounded-full"/>
                  </div>
                </div>
                {/* Scrollable app content */}
                <div className="absolute inset-0 overflow-auto" style={{borderRadius:'47px'}}>
                  <div style={{paddingTop:'52px'}}>
                    <AppInner/>
                  </div>
                </div>
                {/* Home indicator */}
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-[999] w-32 h-1 bg-black/20 rounded-full pointer-events-none"/>
                {/* Glare */}
                <div className="absolute inset-0 rounded-[47px] bg-gradient-to-br from-white/6 via-transparent to-transparent pointer-events-none"/>
              </div>
            </div>
          </div>
          {/* Frame glare */}
          <div className="absolute inset-0 rounded-[52px] bg-gradient-to-br from-white/8 via-transparent to-transparent pointer-events-none"/>
        </div>
        {/* Side label */}
        <div className="ml-8 flex flex-col gap-3 opacity-40">
          <p className="text-white text-sm font-black tracking-wider rotate-0">Sapot Lokal</p>
          <p className="text-white/50 text-xs">v2.0 · Desktop Preview</p>
        </div>
      </div>
    );
  }
  return <AppInner/>;
}

// ── PRINT STYLES injected once ────────────────────────────────────────────────
if(typeof document!=='undefined'&&!document.getElementById('sapot-print-styles')){
  const s=document.createElement('style');
  s.id='sapot-print-styles';
  s.textContent=`
    @media print {
      body > *:not(#sapot-print-root) { display: none !important; }
      #sapot-receipt {
        display: block !important;
        position: fixed; top: 0; left: 0; right: 0;
        border: none !important;
        box-shadow: none !important;
        border-radius: 0 !important;
        page-break-inside: avoid;
      }
      @page { margin: 10mm; size: A5; }
    }
  `;
  document.head.appendChild(s);
}