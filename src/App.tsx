import React, { useState, useEffect, useRef } from "react";
import { supabase, getActiveListings, createListing, createOrder, getVendorSales, upsertVendor, getVendor, getAdsFromDB, updateAdInDB } from "./supabase";
import { motion, AnimatePresence } from "motion/react";

// ─── TRANSLATIONS ─────────────────────────────────────────────────────────────
const T = {
  en: {
    appTagline:"Vendor Portal", buy:"Deals", sell:"Sell", studentTab:"🎓 Students",
    searchPlaceholder:"Search food or vendors...",
    halalAny:"Halal", halalCert:"Certified", muslimOwned:"Muslim-Owned", all:"All", allCat:"All",
    nearbyDeals:"Deals Near You", searchResults:"Search Results ({0})",
    almostGone:"Almost Gone", item:"item",
    save:"SAVE", perUnit:"unit left", soldOut:"Sold Out",
    surplusTag:"🔥 Limited Deal", promoTag:"⚡ Flash Deal", specialTag:"🌟 Vendor Special",
    studentTag:"🎓 Student Deal",
    microwave:"♨️ Microwave", addToCart:"Add to Cart", addedToCart:"✅ Added",
    expired:"Expired", justNow:"Just now", minAgo:"min ago", hrAgo:"hr ago",
    noDeals:"No deals found", tryFilter:"Try changing filters or search again",
    halalCertLabel:"Halal Cert", muslimOwnedLabel:"Muslim-Owned", nonHalalLabel:"Non-Halal",
    halalSelfDeclared:"*Self-declared by vendor",
    almostOut:"Almost out —", unitsLeft:"units left", soldOutLabel:"Sold Out 🎉",
    endsAt:"Until", units:"units", back:"← Back",
    freeDeliveryFrom:"🚗 Free delivery from RM{0}",
    freeDeliveryShared:"🚗 Free delivery — combined cart counts",
    noDelivery:"Self-pickup only",
    cartTopupBanner:"RM{0} more for free delivery from {1}",
    cartTopupSharedBanner:"RM{0} more total cart → free delivery from {1}",
    // Halal disclaimer
    halalDisclaimerTitle:"Halal Status Notice",
    halalDisclaimerBody:"Halal and Muslim-Owned badges shown in this app are self-declared by vendors. Sapot Lokal does not verify, audit, or guarantee the halal status of any food or business listed.\n\nBuyers are advised to exercise their own judgement. Sapot Lokal accepts no liability for the halal status of any item sold through this platform.",
    halalDisclaimerBtn:"I understand, continue",
    halalDisclaimerLink:"See full policy",
    // Student corner
    studentCornerTitle:"🎓 Student Corner",
    studentCornerDesc:"Special prices posted by vendors who support campus students. No verification needed — honour system.",
    studentCornerEmpty:"No student deals right now",
    studentCornerEmptySub:"Vendors post new student deals throughout the day. Check back soon!",
    studentPriceLabel:"Student price",
    // Notification
    notifNewDeal:"New deal nearby!",
    notifAt:"{0} · {1}km away",
    notifView:"View",
    notifPermTitle:"Get notified about new deals?",
    notifPermDesc:"We'll alert you when vendors post within {0}km",
    notifPermYes:"Yes, notify me",
    notifPermNo:"Maybe later",
    // Cart
    cart:"Cart", cartEmpty:"Your cart is empty", browseDeals:"Browse deals above",
    multiVendorWarn:"{0} vendors in cart — separate pickup per vendor.",
    sharedPoolNote:"✨ Combined cart total counts toward {0}'s free delivery",
    subtotal:"Subtotal", deliveryFee:"Delivery Fee",
    free:"FREE", total:"Total",
    freeDeliveryUnlocked:"🎉 Free delivery unlocked!",
    addMoreForFree:"Add RM{0} more → free delivery",
    addMoreShared:"RM{0} more total cart → free delivery",
    noThreshold:"No free delivery from this vendor",
    tapToTopup:"Tap to add more →",
    // Topup
    topupTitle:"Get Free Delivery", topupFrom:"from {0}",
    topupNeedRM:"Need RM{0} more",
    topupNeedRMShared:"Need RM{0} more (total cart)",
    topupVendorItems:"More from {0}",
    topupVendorEmpty:"No more items from {0} right now.",
    topupSuggestTitle:"Add from nearby vendors",
    topupSuggestDescOwn:"Each item brings you closer to RM{0} from {1}",
    topupSuggestDescShared:"These count toward your combined total too",
    topupNoSuggest:"No suggestions available right now.",
    topupSkip:"Skip — I'll pay delivery",
    topupDone:"🎉 Free delivery unlocked!",
    // Delivery
    selfPickup:"Self-Pickup", selfPickupDesc:"Walk over and collect (Free)",
    delivery:"Lalamove Delivery", deliveryDesc:"Delivered to your door",
    deliveryPaid:"Vendor pays · 30–45 min",
    deliveryUserPays:"Est. RM6–10 · 30–45 min",
    checkoutTNG:"💙 Pay via TNG eWallet",
    processingTNG:"Processing TNG...",
    removeItem:"Remove",
    orderPlaced:"Order Placed!", pickupNote:"Show this code to vendor when collecting",
    deliveryNote:"Lalamove rider dispatched",
    pickupCode:"Pickup Code", goPickup:"Got it!", myOrders:"Orders",
    // Vendor
    whatToPost:"What to post today?", chooseType:"Choose your deal type",
    surplusType:"🔥 Limited Deal", surplusDesc:"Discounted food — limited quantity available",
    promoType:"⚡ Flash Deal", promoDesc:"Time-limited offer to fill quiet hours",
    specialType:"🌟 Vendor Special", specialDesc:"Launch a new dish cheaply, get feedback",
    chooseCategory:"Choose Category", templateNote:"Template pre-fills basic info",
    postNewDeal:"Post New Deal", liveNow:"Live Now", repeatBtn:"Repeat", activeLabel:"Active",
    snapPhoto:"Snap Food Photo", retakePhoto:"Retake Photo", uploading:"Uploading...", snapFirst2:"Snap food photo",
    foodName:"Food Name", foodNamePH:"e.g. Nasi Lemak Bungkus",
    shortDesc:"Short Description", shortDescPH:"e.g. Egg, Sambal, Anchovies",
    originalPrice:"Original Price (RM)", dealPrice:"Deal Price (RM)",
    youReceive:"You receive (after 10%)",
    endTime:"End Time", quick:"⚡ Quick", manual:"🕐 Manual", endAt:"Ends at:",
    qty:"Quantity (Optional)", qtyPH:"e.g. 20 units", qtyNote:"Leave empty for unlimited",
    reheat:"Reheat Method", eatDirect:"🍽️ Direct", oven:"🔥 Oven",
    goLive:"⚡ Go Live Now", snapFirst:"📸 Snap Photo First",
    fillName:"✏️ Fill Food Name", fillPrice:"💰 Fill Deal Price",
    tngNote:"Payments processed via TNG eWallet",
    pastPosts:"Past Postings", repostNote:"Tap to repost instantly",
    repost:"🔁 Repost", sold:"sold",
    postSuccess:"Posted!", liveNote:"Your deal is live. Buyers within {0}km will be notified.",
    salePrice:"Sale Price", commission:"Sapot Commission (10%)",
    deliveryDeduct:"Delivery (if triggered)",
    youGet:"You Receive", payoutNote:"Paid to TNG after pickup confirmed",
    viewDash:"View Dashboard",
    // Student price in vendor form
    addStudentPrice:"Add Student Price?",
    addStudentPriceDesc:"Show a lower price in Student Corner — vendor's choice, no verification",
    studentPriceRM:"Student Price (RM)",
    studentPricePH:"e.g. 2.50",
    // Vendor settings
    vendorSettings:"Shop Settings", vendorSettingsDesc:"Configure your shop",
    freeDeliveryThreshold:"Free Delivery Threshold (RM)",
    thresholdDesc:"Buyers spending this amount from your shop get free delivery (you absorb ~RM8 delivery cost)",
    thresholdOff:"No free delivery offered",
    thresholdExample:"e.g. 25",
    thresholdWarning:"~RM8 delivery cost deducted from your payout when triggered",
    sharedPoolLabel:"Allow shared cart total?",
    sharedPoolDesc:"Buyer's total cart spend (across all vendors) counts toward your threshold — easier for buyers to unlock",
    sharedPoolNote2:"Riskier — buyers may reach threshold without buying much from you",
    notifRadiusLabel:"Notify buyers within (km)",
    notifRadiusDesc:"Buyers within this radius get an in-app alert when you post a deal",
    saveSettings:"Save Settings", settingsSaved:"✅ Saved",
    offerFreeDelivery:"Offer free delivery",
    monthlyPlan:"Monthly Plan", perMonth:"/month", commission10:"10% (subscribers)", komisyen:"commission",
    subPerks:["Instant photo posting","10% commission (vs 15%)","One-tap deal repeat","Sales dashboard","Vendor Storefront — show full menu after buyer adds to cart","Buyer alerts within your radius"],
    tngFlow:"Pay & Receive via TNG", tngDesc:"Buyer pays → 10% deducted → balance to your TNG",
    subscribeCTA:"💙 Subscribe via TNG eWallet", autoRenew:"Auto-renew · Cancel anytime",
    processing:"Processing...",
    // Time frame
    timeModeLabel:"How long to stay posted?",
    timeModeStock:"⏳ While stock lasts",
    timeModeStock_desc:"Stays live until sold out or you remove it",
    timeModeHours:"⚡ Fixed duration",
    timeModeHours_desc:"Auto-removes after set hours",
    timeModeSched:"🕐 Today's schedule",
    timeModeSched_desc:"Live from open to closing time",
    openTime:"Opens at", closeTime:"Closes at",
    stockOnly:"No time limit — remove manually",
    cancelPost:"Remove post",
    cancelConfirm:"Remove this listing?",
    cancelYes:"Yes, remove it",
    cancelNo:"Keep it live",
    postExpiredLabel:"Ended",
    postCancelledLabel:"Removed",
    liveUntil:"Live until",
    liveUntilStock:"Live · Until sold out",
    liveUntilClose:"Live · Until closing time",
    removePost:"✕ Remove",
    vendorHours:"Shop Hours",
    vendorHoursDesc:"Used for daily schedule posts",
    // Trial system
    trialActive:"Free Trial",
    trialDaysLeft:"{0} days left",
    trialExpiresSoon:"Trial expires in {0} days — subscribe to keep posting",
    trialExpiresToday:"Trial expires today!",
    trialExpired:"Free trial ended",
    trialExpiredDesc:"Subscribe to continue posting deals. Your past listings and settings are saved.",
    trialBannerFree:"🎁 Free for {0} more days",
    trialBannerWarn:"⚠️ {0} days left in your trial",
    trialBannerUrgent:"🔴 Trial ends in {0} days!",
    trialBannerExpired:"🔒 Trial ended — subscribe to post",
    subscribeNow:"Subscribe Now — RM29.90/mo",
    trialSubtitle:"Your 60-day free trial started when you posted your first deal",
    trialStarted:"Trial started",
    trialEnds:"Trial ends",
    alreadySubscribed:"✅ Active subscription",
    subscribedUntil:"Subscribed until {0}",
    maxPostsReached:"Max 3 active posts — remove one to post again",
    // Onboarding
    onboardTitle:"Set Up Your Shop",
    onboardSub:"Takes 30 seconds. You can change this anytime in Settings.",
    onboardShopName:"Shop Name",
    onboardShopNamePH:"e.g. Warung Mak Teh, Bakeri Fariz",
    onboardArea:"Your Area / Town",
    onboardAreaPH:"e.g. Puchong, Kepong, Petaling Jaya",
    onboardPhone:"WhatsApp Number",
    onboardPhonePH:"e.g. 0123456789",
    onboardDone:"Start Selling →",
    onboardSkip:"Skip for now",
    // Location
    locating:"Finding your location...",
    locationDenied:"Where are you? 📍",
    locationDeniedDesc:"Type your area to see the closest food deals near you",
    nearYou:"Near You",
    kmAway:"{0}km away",
    noDealsArea:"No deals near you right now",
    noDealsAreaSub:"Vendors in {0} haven't posted yet today. Check back soon!",
    changeLocation:"Change location",
    yourLocation:"Your location",
    // Order history
    myOrdersTitle:"My Orders",
    myOrdersEmpty:"No orders yet",
    myOrdersEmptySub:"Your orders and pickup codes will appear here",
    orderCode:"Code",
    orderFrom:"from",
    orderPaid:"Paid",
    orderPickup:"Self-pickup",
    orderDelivery:"Delivery",
    viewCode:"View Code",
    // Share
    shareTitle:"Share Deal",
    shareWhatsapp:"Share on WhatsApp",
    shareCopy:"Copy Link",
    shareCopied:"Link copied!",
    shareMsg:"🍱 Check out this deal on Sapot Lokal: {0} from {1} for only RM{2}! 👉 {3}",
  },
  bm: {
    appTagline:"Portal Vendor", buy:"Deal", sell:"Jual", studentTab:"🎓 Pelajar",
    searchPlaceholder:"Cari makanan atau kedai...",
    halalAny:"Halal", halalCert:"Bertauliah", muslimOwned:"Milik Muslim", all:"Semua", allCat:"Semua",
    nearbyDeals:"Deal Berdekatan", searchResults:"Hasil Carian ({0})",
    almostGone:"Hampir Habis", item:"item",
    save:"JIMAT", perUnit:"unit tinggal", soldOut:"Sold Out",
    surplusTag:"♻️ Lebihan", promoTag:"⚡ Flash Deal", specialTag:"🌟 Menu Baru",
    studentTag:"🎓 Harga Pelajar",
    microwave:"♨️ Microwave", addToCart:"Tambah ke Troli", addedToCart:"✅ Ditambah",
    expired:"Tamat", justNow:"Baru sahaja", minAgo:"min lalu", hrAgo:"jam lalu",
    noDeals:"Tiada deal dijumpai", tryFilter:"Cuba tukar filter atau cari semula",
    halalCertLabel:"Halal Cert", muslimOwnedLabel:"Milik Muslim", nonHalalLabel:"Non-Halal",
    halalSelfDeclared:"*Diisytihar sendiri oleh vendor",
    almostOut:"Hampir habis —", unitsLeft:"unit", soldOutLabel:"Habis Terjual 🎉",
    endsAt:"Hingga", units:"unit", back:"← Kembali",
    freeDeliveryFrom:"🚗 Penghantaran percuma dari RM{0}",
    freeDeliveryShared:"🚗 Penghantaran percuma — jumlah troli dikira",
    noDelivery:"Ambil sendiri sahaja",
    cartTopupBanner:"RM{0} lagi untuk penghantaran percuma dari {1}",
    cartTopupSharedBanner:"RM{0} lagi jumlah troli → penghantaran percuma dari {1}",
    halalDisclaimerTitle:"Notis Status Halal",
    halalDisclaimerBody:"Lencana Halal dan Milik Muslim dalam app ini adalah pengisytiharan sendiri oleh vendor. Sapot Lokal tidak mengesahkan, mengaudit, atau menjamin status halal mana-mana makanan atau perniagaan yang disenaraikan.\n\nPembeli dinasihatkan untuk membuat pertimbangan sendiri. Sapot Lokal tidak bertanggungjawab ke atas status halal mana-mana item yang dijual melalui platform ini.",
    halalDisclaimerBtn:"Saya faham, teruskan",
    halalDisclaimerLink:"Lihat polisi penuh",
    studentCornerTitle:"🎓 Sudut Pelajar",
    studentCornerDesc:"Harga khas yang dipost oleh vendor yang menyokong pelajar kampus. Tiada pengesahan diperlukan — sistem amanah.",
    studentCornerEmpty:"Tiada deal pelajar buat masa ini",
    studentCornerEmptySub:"Vendor post deal pelajar baru sepanjang hari. Semak semula nanti!",
    studentPriceLabel:"Harga pelajar",
    notifNewDeal:"Deal baru berdekatan!",
    notifAt:"{0} · {1}km jauh",
    notifView:"Lihat",
    notifPermTitle:"Nak dapat notifikasi deal baru?",
    notifPermDesc:"Kami akan maklumkan apabila vendor post dalam {0}km",
    notifPermYes:"Ya, beritahu saya",
    notifPermNo:"Mungkin kemudian",
    cart:"Troli", cartEmpty:"Troli anda kosong", browseDeals:"Semak deal di atas",
    multiVendorWarn:"{0} vendor dalam troli — pickup berasingan per vendor.",
    sharedPoolNote:"✨ Jumlah troli gabungan dikira untuk penghantaran percuma {0}",
    subtotal:"Subtotal", deliveryFee:"Yuran Penghantaran",
    free:"PERCUMA", total:"Jumlah",
    freeDeliveryUnlocked:"🎉 Penghantaran percuma dibuka!",
    addMoreForFree:"Tambah RM{0} lagi → penghantaran percuma",
    addMoreShared:"RM{0} lagi jumlah troli → penghantaran percuma",
    noThreshold:"Tiada penghantaran percuma dari vendor ini",
    tapToTopup:"Tap untuk tambah →",
    topupTitle:"Dapatkan Penghantaran Percuma", topupFrom:"dari {0}",
    topupNeedRM:"Perlu RM{0} lagi",
    topupNeedRMShared:"Perlu RM{0} lagi (jumlah troli)",
    topupVendorItems:"Lagi dari {0}",
    topupVendorEmpty:"Tiada item lain dari {0} buat masa ini.",
    topupSuggestTitle:"Tambah dari vendor lain",
    topupSuggestDescOwn:"Setiap item bawa anda lebih dekat ke RM{0} dari {1}",
    topupSuggestDescShared:"Ini juga dikira dalam jumlah gabungan anda",
    topupNoSuggest:"Tiada cadangan buat masa ini.",
    topupSkip:"Langkau — bayar penghantaran",
    topupDone:"🎉 Penghantaran percuma dibuka!",
    selfPickup:"Ambil Sendiri", selfPickupDesc:"Jalan ambil sendiri (Percuma)",
    delivery:"Penghantaran Lalamove", deliveryDesc:"Dihantar ke pintu anda",
    deliveryPaid:"Vendor tanggung · 30–45 min",
    deliveryUserPays:"Anggaran RM6–10 · 30–45 min",
    checkoutTNG:"💙 Bayar via TNG eWallet",
    processingTNG:"Memproses TNG...",
    removeItem:"Buang",
    orderPlaced:"Pesanan Berjaya!", pickupNote:"Tunjukkan kod ini kepada vendor",
    deliveryNote:"Rider Lalamove dalam perjalanan",
    pickupCode:"Kod Pickup", goPickup:"Okay, Faham!", myOrders:"Pesanan",
    whatToPost:"Apa nak post hari ni?", chooseType:"Pilih jenis deal anda",
    surplusType:"🔥 Limited Deal", surplusDesc:"Makanan lebihan — pulang modal sebelum tutup",
    promoType:"⚡ Flash Deal", promoDesc:"Tawaran masa terhad untuk masa sunyi",
    specialType:"🌟 Menu Baru", specialDesc:"Lancar hidangan baru — dapat feedback murah",
    chooseCategory:"Pilih Kategori", templateNote:"Template isi maklumat asas",
    postNewDeal:"Post Deal Baru", liveNow:"Live Sekarang", repeatBtn:"Ulang", activeLabel:"Aktif",
    snapPhoto:"Snap Gambar Makanan", retakePhoto:"Tukar Gambar", uploading:"Memuat...", snapFirst2:"Snap gambar makanan",
    foodName:"Nama Makanan", foodNamePH:"cth: Nasi Lemak Bungkus",
    shortDesc:"Huraian Ringkas", shortDescPH:"cth: Telur, Sambal, Ikan Bilis",
    originalPrice:"Harga Asal (RM)", dealPrice:"Harga Deal (RM)",
    youReceive:"Anda terima (selepas 10%)",
    endTime:"Masa Tamat", quick:"⚡ Pantas", manual:"🕐 Manual", endAt:"Tamat pada:",
    qty:"Kuantiti (Pilihan)", qtyPH:"cth: 20 unit", qtyNote:"Kosongkan untuk tiada had",
    reheat:"Cara Panaskan Semula", eatDirect:"🍽️ Terus", oven:"🔥 Oven",
    goLive:"⚡ Go Live Sekarang", snapFirst:"📸 Snap Gambar Dahulu",
    fillName:"✏️ Isi Nama", fillPrice:"💰 Isi Harga",
    tngNote:"Bayaran diproses melalui TNG eWallet",
    pastPosts:"Posting Lepas", repostNote:"Tap untuk repost serta-merta",
    repost:"🔁 Repost", sold:"dijual",
    postSuccess:"Posting Berjaya!", liveNote:"Deal anda live. Pembeli dalam {0}km akan dimaklumkan.",
    salePrice:"Harga Jual", commission:"Komisyen Sapot (10%)",
    deliveryDeduct:"Penghantaran (jika dicetuskan)",
    youGet:"Anda Terima", payoutNote:"Dibayar ke TNG selepas pickup disahkan",
    viewDash:"Lihat Dashboard",
    addStudentPrice:"Tambah Harga Pelajar?",
    addStudentPriceDesc:"Paparkan harga lebih rendah dalam Sudut Pelajar — pilihan vendor, tiada pengesahan",
    studentPriceRM:"Harga Pelajar (RM)",
    studentPricePH:"cth: 2.50",
    vendorSettings:"Tetapan Kedai", vendorSettingsDesc:"Konfigurasi kedai anda",
    freeDeliveryThreshold:"Had Penghantaran Percuma (RM)",
    thresholdDesc:"Pembeli yang belanja jumlah ini dari kedai anda dapat penghantaran percuma (anda tanggung ~RM8)",
    thresholdOff:"Tiada penghantaran percuma",
    thresholdExample:"cth: 25",
    thresholdWarning:"~RM8 kos penghantaran ditolak dari bayaran anda apabila dicetuskan",
    sharedPoolLabel:"Benarkan jumlah troli gabungan?",
    sharedPoolDesc:"Jumlah belanja pembeli (merentasi semua vendor) dikira untuk had anda — lebih mudah untuk pembeli buka penghantaran percuma",
    sharedPoolNote2:"Lebih berisiko — pembeli mungkin capai had tanpa beli banyak dari anda",
    notifRadiusLabel:"Maklumkan pembeli dalam (km)",
    notifRadiusDesc:"Pembeli dalam jejari ini dapat amaran dalam-app apabila anda post deal",
    saveSettings:"Simpan Tetapan", settingsSaved:"✅ Disimpan",
    offerFreeDelivery:"Tawarkan penghantaran percuma",
    monthlyPlan:"Pelan Bulanan", perMonth:"/bulan", commission10:"10% (subscribers)", komisyen:"komisyen",
    subPerks:["Posting foto instant","Komisyen 10% (vs 15%)","Repost satu ketuk","Dashboard jualan","Vendor Storefront — tunjuk menu penuh kepada pembeli","Amaran pembeli dalam jejari anda"],
    tngFlow:"Bayar & Terima via TNG", tngDesc:"Pembeli bayar → 10% dipotong → baki masuk TNG anda",
    subscribeCTA:"💙 Langganan via TNG eWallet", autoRenew:"Auto-renew · Batal bila-bila masa",
    processing:"Memproses...",
    timeModeLabel:"Berapa lama posting ini kekal?",
    timeModeStock:"⏳ Selagi ada stok",
    timeModeStock_desc:"Kekal live sehingga habis atau anda buang",
    timeModeHours:"⚡ Tempoh tetap",
    timeModeHours_desc:"Auto-buang selepas jam yang ditetapkan",
    timeModeSched:"🕐 Jadual hari ini",
    timeModeSched_desc:"Live dari buka hingga tutup kedai",
    openTime:"Buka jam", closeTime:"Tutup jam",
    stockOnly:"Tiada had masa — buang secara manual",
    cancelPost:"Buang posting",
    cancelConfirm:"Buang listing ini?",
    cancelYes:"Ya, buang",
    cancelNo:"Kekalkan live",
    postExpiredLabel:"Tamat",
    postCancelledLabel:"Dibuang",
    liveUntil:"Live sehingga",
    liveUntilStock:"Live · Selagi ada stok",
    liveUntilClose:"Live · Hingga waktu tutup",
    removePost:"✕ Buang",
    vendorHours:"Waktu Operasi",
    vendorHoursDesc:"Digunakan untuk posting jadual harian",
    trialActive:"Percubaan Percuma",
    trialDaysLeft:"{0} hari lagi",
    trialExpiresSoon:"Percubaan tamat dalam {0} hari — langgan untuk terus post",
    trialExpiresToday:"Percubaan tamat hari ini!",
    trialExpired:"Percubaan percuma tamat",
    trialExpiredDesc:"Langgan untuk terus posting deal. Listing dan tetapan anda disimpan.",
    trialBannerFree:"🎁 Percuma {0} hari lagi",
    trialBannerWarn:"⚠️ {0} hari lagi dalam percubaan anda",
    trialBannerUrgent:"🔴 Percubaan tamat dalam {0} hari!",
    trialBannerExpired:"🔒 Percubaan tamat — langgan untuk post",
    subscribeNow:"Langgan Sekarang — RM29.90/bln",
    trialSubtitle:"Percubaan 60 hari bermula apabila anda post deal pertama",
    trialStarted:"Percubaan bermula",
    trialEnds:"Percubaan tamat",
    alreadySubscribed:"✅ Langganan aktif",
    subscribedUntil:"Dilanggan hingga {0}",
    maxPostsReached:"Maks 3 posting aktif — buang satu untuk post semula",
    onboardTitle:"Sediakan Kedai Anda",
    onboardSub:"Ambil masa 30 saat. Boleh ubah bila-bila masa dalam Tetapan.",
    onboardShopName:"Nama Kedai",
    onboardShopNamePH:"cth: Warung Mak Teh, Bakeri Fariz",
    onboardArea:"Kawasan / Bandar Anda",
    onboardAreaPH:"cth: Puchong, Kepong, Petaling Jaya",
    onboardPhone:"Nombor WhatsApp",
    onboardPhonePH:"cth: 0123456789",
    onboardDone:"Mula Jual →",
    onboardSkip:"Langkau buat masa ini",
    locating:"Mencari lokasi anda...",
    locationDenied:"Akses lokasi ditolak",
    locationDeniedDesc:"Benarkan lokasi dalam tetapan pelayar, atau taip kawasan anda di bawah",
    nearYou:"Berdekatan Anda",
    kmAway:"{0}km jauh",
    noDealsArea:"Tiada deal berdekatan anda buat masa ini",
    noDealsAreaSub:"Vendor di {0} belum post hari ini. Semak semula nanti!",
    changeLocation:"Tukar lokasi",
    yourLocation:"Lokasi anda",
    myOrdersTitle:"Pesanan Saya",
    myOrdersEmpty:"Belum ada pesanan",
    myOrdersEmptySub:"Pesanan dan kod pickup anda akan muncul di sini",
    orderCode:"Kod",
    orderFrom:"dari",
    orderPaid:"Dibayar",
    orderPickup:"Ambil sendiri",
    orderDelivery:"Penghantaran",
    viewCode:"Lihat Kod",
    shareTitle:"Kongsi Deal",
    shareWhatsapp:"Kongsi di WhatsApp",
    shareCopy:"Salin Pautan",
    shareCopied:"Pautan disalin!",
    shareMsg:"🍱 Tengok deal ni kat Sapot Lokal: {0} dari {1} hanya RM{2}! 👉 {3}",
  },
  zh: {
    appTagline:"校园美食优惠", buy:"优惠", sell:"卖家", studentTab:"🎓 学生",
    searchPlaceholder:"搜索食物或商家...",
    halalAny:"清真", halalCert:"认证", muslimOwned:"穆斯林经营", all:"全部", allCat:"全部",
    nearbyDeals:"附近优惠", searchResults:"搜索结果 ({0})",
    almostGone:"快卖完了", item:"个",
    save:"省", perUnit:"份剩余", soldOut:"售罄",
    surplusTag:"♻️ 剩余食物", promoTag:"⚡ 限时优惠", specialTag:"🌟 特别推介",
    studentTag:"🎓 学生价",
    microwave:"♨️ 微波炉", addToCart:"加入购物车", addedToCart:"✅ 已加入",
    expired:"已过期", justNow:"刚刚", minAgo:"分钟前", hrAgo:"小时前",
    noDeals:"没有找到优惠", tryFilter:"尝试更改筛选条件或重新搜索",
    halalCertLabel:"清真认证", muslimOwnedLabel:"穆斯林经营", nonHalalLabel:"非清真",
    halalSelfDeclared:"*商家自行申报",
    almostOut:"快售完 —", unitsLeft:"份", soldOutLabel:"已售罄 🎉",
    endsAt:"截止", units:"份", back:"← 返回",
    freeDeliveryFrom:"🚗 消费RM{0}免运费",
    freeDeliveryShared:"🚗 免运费 — 购物车总额合并计算",
    noDelivery:"仅限自取",
    cartTopupBanner:"再消费RM{0}即可享{1}免运费",
    cartTopupSharedBanner:"购物车再消费RM{0} → {1}免运费",
    halalDisclaimerTitle:"清真状态声明",
    halalDisclaimerBody:"本应用显示的清真及穆斯林经营标志均由商家自行申报。Sapot Lokal 不对任何食品或商家的清真状态进行核实、审查或保证。\n\n买家请自行判断。Sapot Lokal 对本平台出售的任何商品的清真状态不承担任何责任。",
    halalDisclaimerBtn:"我明白，继续",
    halalDisclaimerLink:"查看完整政策",
    studentCornerTitle:"🎓 学生专区",
    studentCornerDesc:"商家为校园学生提供的特别价格。无需验证 — 诚信制度。",
    studentCornerEmpty:"暂无学生优惠",
    studentCornerEmptySub:"商家全天发布新的学生优惠，请稍后再查！",
    studentPriceLabel:"学生价",
    notifNewDeal:"附近有新优惠！",
    notifAt:"{0} · 距离{1}公里",
    notifView:"查看",
    notifPermTitle:"想收到新优惠通知吗？",
    notifPermDesc:"商家在{0}公里内发布优惠时，我们会提醒您",
    notifPermYes:"是的，通知我",
    notifPermNo:"稍后再说",
    cart:"购物车", cartEmpty:"购物车是空的", browseDeals:"浏览上方优惠",
    multiVendorWarn:"购物车有{0}个商家 — 每个商家需分别取餐。",
    sharedPoolNote:"✨ 购物车总额合并计入{0}的免运条件",
    subtotal:"小计", deliveryFee:"运费",
    free:"免费", total:"总计",
    freeDeliveryUnlocked:"🎉 免运费已解锁！",
    addMoreForFree:"再加RM{0} → 免运费",
    addMoreShared:"购物车再加RM{0} → 免运费",
    noThreshold:"此商家不提供免运费",
    tapToTopup:"点击添加更多 →",
    topupTitle:"达成免运费", topupFrom:"来自{0}",
    topupNeedRM:"还差RM{0}",
    topupNeedRMShared:"购物车总额还差RM{0}",
    topupVendorItems:"{0}的其他商品",
    topupVendorEmpty:"{0}暂时没有其他商品。",
    topupSuggestTitle:"或从其他商家添加",
    topupSuggestDescOwn:"每件商品让您更接近从{1}获得RM{0}免运费",
    topupSuggestDescShared:"这些也计入您的总额",
    topupNoSuggest:"暂时没有推荐商品。",
    topupSkip:"跳过 — 我来付运费",
    topupDone:"🎉 免运费已解锁！",
    selfPickup:"自取", selfPickupDesc:"步行前往取餐（免费）",
    delivery:"Lalamove 送餐", deliveryDesc:"送到您门口",
    deliveryPaid:"商家承担运费 · 30–45分钟",
    deliveryUserPays:"预计RM6–10 · 30–45分钟",
    checkoutTNG:"💙 使用TNG电子钱包付款",
    processingTNG:"TNG处理中...",
    removeItem:"移除",
    orderPlaced:"订单成功！", pickupNote:"取餐时向商家出示此码",
    deliveryNote:"Lalamove骑手已出发",
    pickupCode:"取餐码", goPickup:"好的，明白了！", myOrders:"订单",
    whatToPost:"今天发布什么？", chooseType:"选择优惠类型",
    surplusType:"♻️ 剩余食物", surplusDesc:"剩余食物 — 关店前回收成本",
    promoType:"⚡ 限时优惠", promoDesc:"限时特卖填补淡季",
    specialType:"🌟 特别推介", specialDesc:"低价推出新菜品，收集反馈",
    chooseCategory:"选择类别", templateNote:"模板自动填写基本信息",
    postNewDeal:"发布新优惠", liveNow:"正在上线", repeatBtn:"重复", activeLabel:"进行中",
    snapPhoto:"拍摄食物照片", retakePhoto:"重新拍照", uploading:"上传中...", snapFirst2:"拍摄食物照片",
    foodName:"食物名称", foodNamePH:"例：椰浆饭套餐",
    shortDesc:"简短描述", shortDescPH:"例：鸡蛋、参巴、江鱼仔",
    originalPrice:"原价 (RM)", dealPrice:"优惠价 (RM)",
    youReceive:"您收到（扣除10%后）",
    endTime:"结束时间", quick:"⚡ 快速", manual:"🕐 手动", endAt:"结束于：",
    qty:"数量（可选）", qtyPH:"例：20份", qtyNote:"留空表示不限量",
    reheat:"加热方式", eatDirect:"🍽️ 直接食用", oven:"🔥 烤箱",
    goLive:"⚡ 立即上线", snapFirst:"📸 先拍照",
    fillName:"✏️ 填写名称", fillPrice:"💰 填写价格",
    tngNote:"通过TNG电子钱包处理付款",
    pastPosts:"过往发布", repostNote:"点击立即重新发布",
    repost:"🔁 重新发布", sold:"已售",
    postSuccess:"发布成功！", liveNote:"您的优惠已上线。{0}公里内的买家将收到通知。",
    salePrice:"售价", commission:"Sapot佣金（10%）",
    deliveryDeduct:"运费（如触发）",
    youGet:"您收到", payoutNote:"取餐确认后转入您的TNG",
    viewDash:"查看仪表板",
    addStudentPrice:"添加学生价？",
    addStudentPriceDesc:"在学生专区显示更低价格 — 商家自选，无需验证",
    studentPriceRM:"学生价 (RM)",
    studentPricePH:"例：2.50",
    vendorSettings:"商店设置", vendorSettingsDesc:"配置您的商店偏好",
    freeDeliveryThreshold:"免运费门槛 (RM)",
    thresholdDesc:"买家从您的商店消费此金额即可享免运费（您承担约RM8运费）",
    thresholdOff:"不提供免运费",
    thresholdExample:"例：25",
    thresholdWarning:"触发时约RM8运费将从您的收款中扣除",
    sharedPoolLabel:"允许合并购物车总额？",
    sharedPoolDesc:"买家的整体购物车消费（跨所有商家）计入您的门槛 — 买家更容易解锁免运费",
    sharedPoolNote2:"风险较高 — 买家可能在您处购买不多就达到门槛",
    notifRadiusLabel:"通知范围内买家（公里）",
    notifRadiusDesc:"此范围内的买家在您发布优惠时将收到应用内提醒",
    saveSettings:"保存设置", settingsSaved:"✅ 已保存",
    offerFreeDelivery:"为买家提供免运费",
    monthlyPlan:"月度计划", perMonth:"/月", commission10:"10%", komisyen:"佣金",
    subPerks:["即时照片发布","TNG自动转账","一键重复发布","销售仪表板","支持学生专区","买家范围内通知"],
    tngFlow:"通过TNG付款和收款", tngDesc:"买家付款 → 扣除10% → 余额转入您的TNG",
    subscribeCTA:"💙 通过TNG电子钱包订阅", autoRenew:"自动续订 · 随时取消",
    processing:"处理中...",
    timeModeLabel:"帖子保留多长时间？",
    timeModeStock:"⏳ 售完为止",
    timeModeStock_desc:"一直显示直到售罄或您手动移除",
    timeModeHours:"⚡ 固定时长",
    timeModeHours_desc:"设定小时后自动移除",
    timeModeSched:"🕐 今日营业时间",
    timeModeSched_desc:"从开店到关店时间显示",
    openTime:"开店时间", closeTime:"关店时间",
    stockOnly:"不限时间 — 手动移除",
    cancelPost:"移除帖子",
    cancelConfirm:"移除此商品？",
    cancelYes:"是，移除",
    cancelNo:"继续显示",
    postExpiredLabel:"已结束",
    postCancelledLabel:"已移除",
    liveUntil:"显示至",
    liveUntilStock:"显示中 · 售完为止",
    liveUntilClose:"显示中 · 至关店时间",
    removePost:"✕ 移除",
    vendorHours:"营业时间",
    vendorHoursDesc:"用于每日时间表帖子",
    trialActive:"免费试用",
    trialDaysLeft:"还剩{0}天",
    trialExpiresSoon:"试用将在{0}天后到期 — 订阅以继续发布",
    trialExpiresToday:"试用今天到期！",
    trialExpired:"免费试用已结束",
    trialExpiredDesc:"订阅以继续发布优惠。您的历史帖子和设置已保存。",
    trialBannerFree:"🎁 还有{0}天免费",
    trialBannerWarn:"⚠️ 试用还剩{0}天",
    trialBannerUrgent:"🔴 试用还剩{0}天！",
    trialBannerExpired:"🔒 试用已结束 — 订阅后可继续发帖",
    subscribeNow:"立即订阅 — RM29.90/月",
    trialSubtitle:"60天免费试用从您发布第一个优惠时开始计算",
    trialStarted:"试用开始",
    trialEnds:"试用结束",
    alreadySubscribed:"✅ 订阅有效",
    subscribedUntil:"订阅至{0}",
    maxPostsReached:"最多3个活跃帖子 — 请先移除一个",
    onboardTitle:"设置您的商店",
    onboardSub:"只需30秒，随时可在设置中更改。",
    onboardShopName:"商店名称",
    onboardShopNamePH:"例：Warung Mak Teh、Bakeri Fariz",
    onboardArea:"您的地区/城镇",
    onboardAreaPH:"例：Puchong、Kepong、Petaling Jaya",
    onboardPhone:"WhatsApp号码",
    onboardPhonePH:"例：0123456789",
    onboardDone:"开始销售 →",
    onboardSkip:"暂时跳过",
    locating:"正在获取您的位置...",
    locationDenied:"位置访问被拒绝",
    locationDeniedDesc:"请在浏览器设置中允许位置访问，或在下方输入您的地区",
    nearYou:"附近",
    kmAway:"{0}公里外",
    noDealsArea:"附近暂无优惠",
    noDealsAreaSub:"{0}的商家今天还没有发布优惠，请稍后再查！",
    changeLocation:"更改位置",
    yourLocation:"您的位置",
    myOrdersTitle:"我的订单",
    myOrdersEmpty:"暂无订单",
    myOrdersEmptySub:"您的订单和取餐码将显示在这里",
    orderCode:"码",
    orderFrom:"来自",
    orderPaid:"已付款",
    orderPickup:"自取",
    orderDelivery:"外卖",
    viewCode:"查看码",
    shareTitle:"分享优惠",
    shareWhatsapp:"WhatsApp分享",
    shareCopy:"复制链接",
    shareCopied:"链接已复制！",
    shareMsg:"🍱 在Sapot Lokal发现好优惠：{0}，来自{1}，只需RM{2}！👉 {3}",
  }
};

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const DELIVERY_FEE = 8;
const DEFAULT_RADIUS = 10;

const FOOD_TEMPLATES = [
  {id:"nasi_lemak",label:"Nasi Lemak",   emoji:"🍛",defaultTitle:"Nasi Lemak Bungkus",  defaultDesc:"Telur, Sambal Ikan Bilis, Timun",defaultPrice:"3.50",defaultOriginal:"5.00", category:"Rice"},
  {id:"econ_rice", label:"Economy Rice", emoji:"🍱",defaultTitle:"Nasi Campur Special", defaultDesc:"2 Sayur + 1 Lauk Pilihan",       defaultPrice:"5.50",defaultOriginal:"8.00", category:"Rice"},
  {id:"roti",      label:"Roti / Bread", emoji:"🥐",defaultTitle:"Assorted Pastry Box", defaultDesc:"Croissant, Danish, Bun Manis",   defaultPrice:"9.90",defaultOriginal:"15.00",category:"Bakery"},
  {id:"drinks",    label:"Beverages",    emoji:"🧋",defaultTitle:"Bundle Minuman",      defaultDesc:"Teh Tarik / Milo / Air Sejuk",  defaultPrice:"2.50",defaultOriginal:"4.00", category:"Drinks"},
  {id:"kuih",      label:"Kuih/Dessert", emoji:"🍡",defaultTitle:"Set Kuih Muih",       defaultDesc:"Kuih Lapis, Onde-onde, Seri Muka",defaultPrice:"6.00",defaultOriginal:"10.00",category:"Dessert"},
  {id:"custom",    label:"Custom",       emoji:"✏️",defaultTitle:"",defaultDesc:"",defaultPrice:"",defaultOriginal:"",category:"Other"}
];
const MOCK_PAST_POSTS = [
  {id:"p1",title:"Nasi Lemak Bungkus",desc:"Telur, Sambal, Ikan Bilis",price:"3.50",original:"5.00",emoji:"🍛",type:"limited",sold:24},
  {id:"p2",title:"Assorted Pastry Box",desc:"Croissant, Danish, Bun",price:"9.90",original:"15.00",emoji:"🥐",type:"promo",sold:11}
];
const CATEGORIES = ["Rice","Bakery","Drinks","Dessert","Other"];

// halal: 0=unlabelled, 1=halal-cert, 2=muslim-owned, 3=non-halal
// sharedPool: vendor opts in → buyer's full cart total counts toward this vendor's threshold
// studentPrice: null = no student deal, number = student price
// Mock vendors spread across Klang Valley — distance calculated live from user GPS
// lat/lon are real coords so haversine works correctly wherever user is
const MOCK_VENDORS_GEO = {
  1:{lat:3.0696,lon:101.5989,area:"Puchong"},      // Puchong SS14
  2:{lat:3.1073,lon:101.6067,area:"Subang Jaya"},  // Subang SS15
  3:{lat:3.1478,lon:101.6953,area:"Chow Kit"},     // KL Chow Kit
  4:{lat:3.0169,lon:101.5969,area:"Shah Alam"},    // Shah Alam
  5:{lat:3.1209,lon:101.6538,area:"Bangsar"},      // Bangsar
  6:{lat:3.1878,lon:101.7029,area:"Ampang"},       // Ampang
  7:{lat:3.1319,lon:101.6841,area:"KLCC"},         // KLCC area
  8:{lat:3.2068,lon:101.5987,area:"Kepong"},       // Kepong
  9:{lat:3.1073,lon:101.6370,area:"Petaling Jaya"},// PJ SS2
};

const MOCK_LISTINGS = [
  {id:1, vendorId:1,vendorSubscribed:true,vendorName:"Warung Mak Teh",       freeDeliveryThreshold:20,sharedPool:false,studentPrice:2.00, branch:null,           title:"Nasi Lemak Bungkus",       desc:"Telur, Sambal Ikan Bilis, Timun Fresh",  originalPrice:5.00, dealPrice:3.00,emoji:"🍛",image:"https://picsum.photos/seed/nasilemak1/800/600", category:"Rice",   halal:1,endTime:"21:00",qty:18,claimed:6, type:"limited",reheat:"none",     postedAt:Date.now()-60000*20},
  {id:2, vendorId:1,vendorSubscribed:true,vendorName:"Warung Mak Teh",       freeDeliveryThreshold:20,sharedPool:false,studentPrice:1.50, branch:null,           title:"Teh Tarik Gelas Besar",    desc:"Teh tarik pekat, fresh buat",            originalPrice:3.50,dealPrice:2.00,emoji:"🧋",image:"https://picsum.photos/seed/tehtarik/800/600",  category:"Drinks", halal:1,endTime:"21:00",qty:null,claimed:0,type:"promo",  reheat:"none",     postedAt:Date.now()-60000*10},
  {id:3, vendorId:2,vendorSubscribed:true,vendorName:"Bakeri Fariz",         freeDeliveryThreshold:30,sharedPool:true, studentPrice:7.50, branch:"SS15",         title:"Assorted Pastry Box",      desc:"Croissant, Danish Almond, Bun Coklat",  originalPrice:15.00,dealPrice:9.90,emoji:"🥐",image:"https://picsum.photos/seed/pastrybox1/800/600",category:"Bakery", halal:1,endTime:"20:30",qty:10,claimed:9, type:"limited",reheat:"oven",     postedAt:Date.now()-60000*45},
  {id:4, vendorId:3,vendorSubscribed:true,vendorName:"Kedai Kopi Uncle Lim", freeDeliveryThreshold:null,sharedPool:false,studentPrice:null,branch:null,          title:"Bundle Minuman Special",   desc:"Teh Tarik + Milo Ais + Air Limau",       originalPrice:9.00, dealPrice:5.50,emoji:"🧋",image:"https://picsum.photos/seed/drinks1/800/600",  category:"Drinks", halal:2,endTime:"22:00",qty:null,claimed:3,type:"promo",  reheat:"none",     postedAt:Date.now()-60000*10},
  {id:5, vendorId:4,vendorSubscribed:false,vendorName:"Gerai Pak Din",        freeDeliveryThreshold:25,sharedPool:false,studentPrice:3.50, branch:null,           title:"Nasi Campur Ekonomi",      desc:"2 Sayur + 1 Lauk Pilihan Anda",          originalPrice:8.00, dealPrice:5.00,emoji:"🍱",image:"https://picsum.photos/seed/nasicamp1/800/600", category:"Rice",   halal:1,endTime:"14:30",qty:20,claimed:14,type:"promo",  reheat:"microwave",postedAt:Date.now()-60000*5},
  {id:6, vendorId:5,vendorSubscribed:true,vendorName:"Kuih Mak Jah",         freeDeliveryThreshold:20,sharedPool:true, studentPrice:5.00, branch:null,           title:"Set Kuih Muih Tradisional",desc:"Kuih Lapis, Onde-onde, Seri Muka",        originalPrice:12.00,dealPrice:7.00,emoji:"🍡",image:"https://picsum.photos/seed/kuih1/800/600",    category:"Dessert",halal:1,endTime:"18:00",qty:8, claimed:5, type:"special",reheat:"none",     postedAt:Date.now()-60000*60},
  {id:7, vendorId:6,vendorSubscribed:true,vendorName:"Restoran Maju Jaya",   freeDeliveryThreshold:35,sharedPool:false,studentPrice:6.00, branch:null,           title:"Ayam Percik Madu Baru",    desc:"Resipi baru! Cuba dan bagi feedback",    originalPrice:14.00,dealPrice:8.00,emoji:"🍗",image:"https://picsum.photos/seed/ayampercik/800/600",category:"Rice",   halal:3,endTime:"20:00",qty:15,claimed:2, type:"special",reheat:"oven",     postedAt:Date.now()-60000*15},
  {id:8, vendorId:7,vendorSubscribed:false,vendorName:"Mee Goreng Mat Zin",   freeDeliveryThreshold:20,sharedPool:false,studentPrice:2.50, branch:null,           title:"Mee Goreng Mamak",         desc:"Pedas, rangup, fresh dari kuali",        originalPrice:7.00, dealPrice:4.00,emoji:"🍜",image:"https://picsum.photos/seed/meegoreng/800/600",category:"Rice",   halal:1,endTime:"23:00",qty:30,claimed:8, type:"limited",reheat:"none",     postedAt:Date.now()-60000*8},
  {id:9, vendorId:8,vendorSubscribed:true,vendorName:"Kepong Home Kitchen",  freeDeliveryThreshold:25,sharedPool:false,studentPrice:null, branch:null,           title:"Char Kuey Teow",           desc:"Wok hei tinggi, udang besar",            originalPrice:9.00, dealPrice:5.50,emoji:"🍳",image:"https://picsum.photos/seed/ckt/800/600",      category:"Rice",   halal:0,endTime:"21:30",qty:12,claimed:3, type:"promo",  reheat:"none",     postedAt:Date.now()-60000*25},
  {id:10,vendorId:9,vendorSubscribed:false,vendorName:"PJ Kopitiam",          freeDeliveryThreshold:30,sharedPool:false,studentPrice:3.00, branch:"SS2",          title:"Set Breakfast Kopitiam",   desc:"Roti Bakar + Telur + Kopi O",            originalPrice:10.00,dealPrice:6.50,emoji:"☕",image:"https://picsum.photos/seed/kopitiam/800/600",category:"Drinks", halal:0,endTime:"11:00",qty:20,claimed:7, type:"promo",  reheat:"none",     postedAt:Date.now()-60000*40},
];


// ─── FOOD SEARCH ALIASES ──────────────────────────────────────────────────────
const FOOD_ALIASES = {
  "bak kut teh":["bkt","bak kut","pork rib","pork soup","klang"],
  "bkt":        ["bak kut teh","bkt","pork rib","klang"],
  "char kuey teow":["ckt","char kuey","kuey teow","kwetiau"],
  "ckt":        ["char kuey teow","kuey teow","ckt"],
  "nasi lemak": ["nasi lemak","naslem"],
  "roti canai": ["roti canai","canai","chapati"],
  "mee goreng": ["mee goreng","mi goreng","mee"],
  "dim sum":    ["dim sum","dimsum","yum cha"],
  "satay":      ["satay","sate"],
  "laksa":      ["laksa","assam laksa","curry laksa"],
  "wonton":     ["wonton","wantan","dumpling"],
  "curry":      ["curry","kari","gulai"],
  "nasi goreng":["nasi goreng","fried rice"],
  "fried rice": ["nasi goreng","fried rice"],
  "sup tulang": ["sup tulang","bone soup","tulang"],
  "rendang":    ["rendang","beef rendang"],
  "teh tarik":  ["teh tarik","tea","teh"],
  "coffee":     ["kopi","coffee","cafe"],
  "kopi":       ["kopi","coffee"],
  "kuih":       ["kuih","kueh","dessert","onde"],
  "bread":      ["roti","bread","bun","pastry","croissant"],
  "ayam":       ["chicken","ayam"],
  "ikan":       ["fish","ikan","seafood"],
  "daging":     ["beef","daging"],
  "vegetarian": ["vegetarian","veggie","sayur"],
  "chinese":    ["kopitiam","char","wonton","ckt"],
  "mamak":      ["mamak","roti canai","murtabak","tosai"],
};
function expandSearch(q){
  const lower=q.toLowerCase().trim();
  const direct=FOOD_ALIASES[lower]||[];
  const partial=Object.keys(FOOD_ALIASES).filter(k=>k.includes(lower)||lower.includes(k));
  const extra=partial.reduce(function(a,k){return a.concat(FOOD_ALIASES[k]);},[]);
  return [lower].concat(direct).concat(extra);
}
function matchesSearch(listing,terms){
  const hay=[listing.title,listing.desc,listing.vendorName,listing.category,listing.branch||'',listing.vendorArea||listing.area||''].join(' ').toLowerCase();
  return terms.some(function(t){return hay.includes(t);});
}

// ─── UTILS ────────────────────────────────────────────────────────────────────
const fmtRM     = v=>{const n=parseFloat(v);return isNaN(n) ? "0.00" : n.toFixed(2);};
const netPayout = (p, subscribed)=>{const n=parseFloat(p);if(isNaN(n)) return "0.00"; return (n*(subscribed?0.90:0.85)).toFixed(2);};
const savingsPct= (o,s)=>{const ov=parseFloat(o),sv=parseFloat(s);if(!ov||!sv||ov<=sv)return null;return Math.round(((ov-sv)/ov)*100);};
const getNow    = ()=>new Date().toTimeString().slice(0,5);
const addHours  = (time,hrs)=>{var parts=time.split(":"); var h=parseInt(parts[0]); var m=parseInt(parts[1]); var t=h*60+m+hrs*60; return String(Math.floor(t/60)%24).padStart(2,"0")+":"+String(t%60).padStart(2,"0");}; 
const timeAgo   = (ts,t)=>{const m=Math.floor((Date.now()-ts)/60000);if(m<1)return t.justNow;if(m<60)return`${m} ${t.minAgo}`;return`${Math.floor(m/60)} ${t.hrAgo}`;};
const stockPct  = (qty,claimed)=>qty?Math.min(Math.round((claimed/qty)*100),100):null;
const dealTag   = (type,t)=>({limited:{label:t.surplusTag,bg:"bg-orange-500"},promo:{label:t.promoTag,bg:"bg-blue-500"},special:{label:t.specialTag,bg:"bg-purple-500"}})[type]||{label:t.surplusTag,bg:"bg-orange-500"};
const fill      = (str,...vals)=>vals.reduce((s,v,i)=>s.replace(`{${i}}`,v),str);
const halalBadge= (h,t)=>{
  if(h===1)return{label:t.halalCertLabel,  bg:"bg-emerald-500"};
  if(h===2)return{label:t.muslimOwnedLabel,bg:"bg-blue-500"};
  if(h===3)return{label:t.nonHalalLabel,   bg:"bg-slate-500"};
  return null;
};

function useCountdown(endTime,t){
  const [left, setLeft]=useState("");
  useEffect(()=>{
    // null endTime = "while stock lasts" — no countdown, never expires by time
    if(!endTime){setLeft(t.liveUntilStock||"While stock lasts");return;}
    const calc=()=>{
      const now=new Date(); const parts=endTime.split(":").map(Number); const h=parts[0]; const m=parts[1];
      const end=new Date();end.setHours(h,m,0,0);
      if(end<now){setLeft(t.expired);return;}
      const d=end-now; const hh=Math.floor(d/3600000); const mm=Math.floor((d%3600000)/60000);
      setLeft(hh>0?`${hh}h ${mm}m`:`${mm} min`);
    };
    calc();const id=setInterval(calc,30000);return()=>clearInterval(id);
  },[endTime]);
  return left;
}

// ─── BLUR DETECTION ──────────────────────────────────────────────────────────
// Uses canvas Laplacian variance — standard blur metric. Score < 80 = blurry.
function detectBlur(dataUrl){
  return new Promise(resolve=>{
    const img=new Image();
    img.onload=()=>{
      const canvas=document.createElement('canvas');
      const W=160; const H=120; // small sample — fast
      canvas.width=W;canvas.height=H;
      const ctx=canvas.getContext('2d');
      ctx.drawImage(img,0,0,W,H);
      const d=ctx.getImageData(0,0,W,H).data;
      // Convert to greyscale
      const grey=[];
      for(let i=0;i<d.length;i+=4) grey.push(0.299*d[i]+0.587*d[i+1]+0.114*d[i+2]);
      // Laplacian kernel variance
      let sum=0; let sum2=0; let n=0;
      for(let y=1;y<H-1;y++) for(let x=1;x<W-1;x++){
        const lap=Math.abs(-grey[(y-1)*W+x]-grey[(y+1)*W+x]-grey[y*W+(x-1)]-grey[y*W+(x+1)]+4*grey[y*W+x]);
        sum+=lap;sum2+=lap*lap;n++;
      }
      const mean=sum/n;
      const variance=sum2/n-mean*mean;
      resolve(variance); // > 120 = sharp, < 120 = blurry (food needs detail)
    };
    img.src=dataUrl;
  });
}


// ─── TRIAL SYSTEM ─────────────────────────────────────────────────────────────
// localStorage keys:
//   sapot_trial_start   — ISO date of first post (set once, never overwritten)
//   sapot_subscribed    — ISO date subscription was activated
//   sapot_sub_expires   — ISO date subscription expires

const TRIAL_DAYS = 60;
const LS_TRIAL   = 'sapot_trial_start';
const LS_SUBBED  = 'sapot_subscribed';
const LS_EXPIRY  = 'sapot_sub_expires';

function getTrialState(){
  const raw   = localStorage.getItem(LS_TRIAL);
  const subExp= localStorage.getItem(LS_EXPIRY);
  const now   = Date.now();

  // Actively subscribed?
  if(subExp && new Date(subExp).getTime() > now){
    return{status:'subscribed', subExpires:subExp, daysLeft:null, trialStart:raw};
  }

  // No trial started yet (never posted)
  if(!raw) return{status:'no_trial', daysLeft:null, trialStart:null};

  const start   = new Date(raw).getTime();
  const end     = start + TRIAL_DAYS * 86400000;
  const daysLeft= Math.max(0, Math.ceil((end - now) / 86400000));

  if(daysLeft <= 0) return{status:'expired', daysLeft:0, trialStart:raw, trialEnd: new Date(end).toISOString()};
  return{status:'trial', daysLeft, trialStart:raw, trialEnd: new Date(end).toISOString()};
}

function stampTrialStart(){
  if(!localStorage.getItem(LS_TRIAL)){
    localStorage.setItem(LS_TRIAL, new Date().toISOString());
  }
}

function activateSubscription(){
  const now   = new Date();
  const expiry= new Date(now.getTime() + 30 * 86400000); // 30 days from now
  localStorage.setItem(LS_SUBBED,  now.toISOString());
  localStorage.setItem(LS_EXPIRY,  expiry.toISOString());
}

function useTrial(){
  const [state, setState]=useState(()=>getTrialState());
  // Re-check every minute so countdown stays live
  useEffect(()=>{
    const id=setInterval(()=>setState(getTrialState()),60000);
    return()=>clearInterval(id);
  },[]);
  const stamp=()=>{ stampTrialStart(); setState(getTrialState()); };
  const subscribe=()=>{ activateSubscription(); setState(getTrialState()); };
  return{...state, stamp, subscribe};
}

function fmtDate(iso){
  if(!iso)return'';
  const d=new Date(iso);
  return d.toLocaleDateString('en-MY',{day:'numeric',month:'short',year:'numeric'});
}


// ─── LOCATION SYSTEM ──────────────────────────────────────────────────────────
// localStorage: sapot_user_lat, sapot_user_lon, sapot_user_area
const LS_LAT  = 'sapot_user_lat';
const LS_LON  = 'sapot_user_lon';
const LS_AREA = 'sapot_user_area';

function getSavedLocation(){
  const lat=localStorage.getItem(LS_LAT);
  const lon=localStorage.getItem(LS_LON);
  const area=localStorage.getItem(LS_AREA)||'';
  if(lat&&lon) return{lat:parseFloat(lat),lon:parseFloat(lon),area,source:'saved'};
  return null;
}

function useLocation(){
  const [loc, setLoc]=useState(()=>getSavedLocation());
  const [status, setStatus]=useState(()=>{ return getSavedLocation() ? 'ok' : 'idle'; }); // idle|requesting|ok|denied
  const [manualArea, setManualArea]=useState('');

  const request=()=>{
    if(!navigator.geolocation){setStatus('denied');return;}
    setStatus('requesting');
    navigator.geolocation.getCurrentPosition(
      pos=>{
        var lat=pos.coords.latitude; var lon=pos.coords.longitude;
        // Reverse-geocode using free Nominatim API (no key needed)
        fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&addressdetails=1`)
          .then(r=>r.json())
          .then(d=>{
            const addr=d.address||{};
            const area=addr.suburb||addr.city_district||addr.town||addr.city||addr.state||'Near you';
            localStorage.setItem(LS_LAT, lat);
            localStorage.setItem(LS_LON, lon);
            localStorage.setItem(LS_AREA, area);
            setLoc({lat,lon,area,source:'gps'});
            setStatus('ok');
          })
          .catch(()=>{
            // Nominatim failed — still save GPS, use generic label
            localStorage.setItem(LS_LAT, lat);
            localStorage.setItem(LS_LON, lon);
            localStorage.setItem(LS_AREA, 'Near you');
            setLoc({lat,lon,area:'Near you',source:'gps'});
            setStatus('ok');
          });
      },
      ()=>setStatus('denied'),
      {enableHighAccuracy:true,timeout:8000}
    );
  };

  const setManual=(area)=>{
    // Malaysia centroid fallback lat/lon — real distances will be rough but better than nothing
    // When backend is live, geocode the area name to real coords
    const MALAYSIA_AREAS={
      'kuala lumpur':{lat:3.1390,lon:101.6869},'kl':{lat:3.1390,lon:101.6869},
      'petaling jaya':{lat:3.1073,lon:101.6370},'pj':{lat:3.1073,lon:101.6370},
      'puchong':{lat:3.0696,lon:101.5989},
      'subang':{lat:3.1073,lon:101.6067},'subang jaya':{lat:3.1073,lon:101.6067},
      'kepong':{lat:3.2068,lon:101.5987},
      'cheras':{lat:3.0833,lon:101.7500},
      'ampang':{lat:3.1500,lon:101.7600},
      'shah alam':{lat:3.0738,lon:101.5183},
      'klang':{lat:3.0449,lon:101.4456},
      'bangsar':{lat:3.1209,lon:101.6538},
      'mont kiara':{lat:3.1726,lon:101.6529},
      'chow kit':{lat:3.1696,lon:101.6969},
      'setapak':{lat:3.2000,lon:101.7167},
      'wangsa maju':{lat:3.2052,lon:101.7435},
      'sentul':{lat:3.1881,lon:101.6869},
      'ttdi':{lat:3.1478,lon:101.6361},'taman tun':{lat:3.1478,lon:101.6361},
      'damansara':{lat:3.1478,lon:101.6167},
      'johor bahru':{lat:1.4927,lon:103.7414},'jb':{lat:1.4927,lon:103.7414},
      'penang':{lat:5.4164,lon:100.3327},'georgetown':{lat:5.4164,lon:100.3327},
      'ipoh':{lat:4.5975,lon:101.0901},
      'kota kinabalu':{lat:5.9788,lon:116.0753},'kk':{lat:5.9788,lon:116.0753},
      'kuching':{lat:1.5533,lon:110.3592},
      'malacca':{lat:2.1896,lon:102.2501},'melaka':{lat:2.1896,lon:102.2501},
      'seremban':{lat:2.7297,lon:101.9381},
      'nilai':{lat:2.8120,lon:101.7985},
    };
    const key=area.trim().toLowerCase();
    const coords=MALAYSIA_AREAS[key]||{lat:3.1390,lon:101.6869}; // default KL
    localStorage.setItem(LS_LAT, coords.lat);
    localStorage.setItem(LS_LON, coords.lon);
    localStorage.setItem(LS_AREA, area);
    setLoc({lat:coords.lat,lon:coords.lon,area,source:'manual'});
    setStatus('ok');
  };

  return{loc,status,request,setManual,manualArea,setManualArea};
}

// Location permission prompt — shows once, sits above the feed
function LocationPrompt({locationHook,t}){
  var status=locationHook.status; var request=locationHook.request; var setManual=locationHook.setManual; var manualArea=locationHook.manualArea; var setManualArea=locationHook.setManualArea;
  const [showManual, setShowManual]=useState(false);

  if(status==='ok'||status==='requesting') return null;

  return(
    <motion.div initial={{opacity:0,y:-20}} animate={{opacity:1,y:0}}
      className="mx-4 mt-3 mb-1 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
      {!showManual?(
        <div className="p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0 text-xl">📍</div>
            <div className="flex-1">
              <p className="font-black text-sm text-slate-800">
                {status==='denied'?"Where are you?" : "Find food near you 🍱"}
              </p>
              <p className="text-slate-400 text-xs mt-0.5">
                {status==='denied'
                  ? "Type your area (e.g. Puchong, SS15, Chow Kit) to see nearby deals"
                  : "We show the closest deals to you first"}
              </p>
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            {status!=='denied'&&(
              <button onClick={request}
                className="flex-1 bg-emerald-500 text-white py-2.5 rounded-xl font-black text-xs uppercase tracking-widest active:scale-95 transition-transform">
                📍 Use My Location
              </button>
            )}
            <button onClick={()=>setShowManual(true)}
              className={`flex-1 ${status==='denied'?'bg-slate-900 text-white':'bg-slate-100 text-slate-600'} py-2.5 rounded-xl font-black text-xs uppercase tracking-widest active:scale-95 transition-transform`}>
              ✏️ Type My Area
            </button>
          </div>
        </div>
      ):(
        <div className="p-4">
          <p className="font-black text-sm text-slate-800 mb-1">Type your area</p>
          <p className="text-slate-400 text-xs mb-3">e.g. Puchong, Subang Jaya, Chow Kit KL</p>
          <input
            value={manualArea}
            onChange={e=>setManualArea(e.target.value)}
            placeholder="Your area..."
            autoFocus
            className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:border-emerald-500 focus:outline-none mb-3"
            onKeyDown={e=>{if(e.key==='Enter'&&manualArea.trim()) setManual(manualArea.trim());}}
          />
          <div className="flex gap-2">
            <button onClick={()=>setShowManual(false)} className="flex-1 bg-slate-100 text-slate-600 py-2.5 rounded-xl font-black text-xs">← Back</button>
            <button onClick={()=>{if(manualArea.trim()) setManual(manualArea.trim());}}
              disabled={!manualArea.trim()}
              className="flex-1 bg-emerald-500 text-white py-2.5 rounded-xl font-black text-xs uppercase tracking-widest disabled:opacity-40 active:scale-95 transition-transform">
              Show Nearby Deals →
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
}

// ─── VENDOR ONBOARDING ────────────────────────────────────────────────────────
// localStorage: sapot_vendor_profile (JSON)
const LS_VENDOR = 'sapot_vendor_profile';

function getVendorProfile(){
  try{ return JSON.parse(localStorage.getItem(LS_VENDOR)||'null'); }
  catch{ return null; }
}
function saveVendorProfile(p){ localStorage.setItem(LS_VENDOR, JSON.stringify(p)); }


// ─── VENDOR AUTH ──────────────────────────────────────────────────────────────
// Full signup/login flow for vendors
// Replaces onboarding for new vendors — existing localStorage vendors still work

function VendorAuth({t, onDone, onSkip}){
  var [mode, setMode]       = useState("welcome"); // welcome | login | signup | profile
  var [email, setEmail]     = useState("");
  var [password, setPassword] = useState("");
  var [shopName, setShopName] = useState("");
  var [area, setArea]       = useState("");
  var [phone, setPhone]     = useState("");
  var [loading, setLoading] = useState(false);
  var [error, setError]     = useState("");
  var [showPw, setShowPw]   = useState(false);

  async function handleSignup(){
    if(!email||!password||!shopName){ setError("Please fill in all fields"); return; }
    if(password.length<6){ setError("Password must be at least 6 characters"); return; }
    setLoading(true); setError("");
    try{
      // 1. Create auth account
      var {data, error:signupErr} = await supabase.auth.signUp({email, password});
      if(signupErr) throw signupErr;
      var userId = data.user?.id;
      if(!userId) throw new Error("Signup failed");

      // 2. Create vendor profile in DB
      var {data:vendor, error:vendorErr} = await supabase.from('vendors').insert({
        user_id:      userId,
        name:         shopName.trim(),
        area:         area.trim()||'My Area',
        phone:        phone.trim(),
        trial_start:  new Date().toISOString(),
        subscribed:   false,
      }).select().single();
      if(vendorErr) throw vendorErr;

      // 3. Save to localStorage for offline
      var profile = {shopName:shopName.trim(), area:area.trim()||'My Area', phone:phone.trim(), joinedAt:new Date().toISOString(), sbId:vendor.id};
      saveVendorProfile(profile);
      onDone(profile);
    }catch(err){
      setError(err.message||"Signup failed. Please try again.");
    }finally{
      setLoading(false);
    }
  }

  async function handleLogin(){
    if(!email||!password){ setError("Please enter email and password"); return; }
    setLoading(true); setError("");
    try{
      var {data, error:loginErr} = await supabase.auth.signInWithPassword({email, password});
      if(loginErr) throw loginErr;
      var userId = data.user?.id;

      // Load vendor profile from DB
      var {data:vendor} = await supabase.from('vendors').select('*').eq('user_id', userId).single();
      if(vendor){
        var profile = {shopName:vendor.name, area:vendor.area||'', phone:vendor.phone||'', joinedAt:vendor.created_at, sbId:vendor.id};
        saveVendorProfile(profile);
        onDone(profile);
      } else {
        // Logged in but no vendor profile yet → go to profile setup
        setMode("profile");
      }
    }catch(err){
      setError(err.message||"Login failed. Check your email and password.");
    }finally{
      setLoading(false);
    }
  }

  async function handleCreateProfile(){
    if(!shopName){ setError("Shop name is required"); return; }
    setLoading(true); setError("");
    try{
      var {data:{session}} = await supabase.auth.getSession();
      if(!session) throw new Error("Not logged in");
      var {data:vendor, error:vendorErr} = await supabase.from('vendors').insert({
        user_id:      session.user.id,
        name:         shopName.trim(),
        area:         area.trim()||'My Area',
        phone:        phone.trim(),
        trial_start:  new Date().toISOString(),
        subscribed:   false,
      }).select().single();
      if(vendorErr) throw vendorErr;
      var profile = {shopName:shopName.trim(), area:area.trim()||'My Area', phone:phone.trim(), joinedAt:new Date().toISOString(), sbId:vendor.id};
      saveVendorProfile(profile);
      onDone(profile);
    }catch(err){
      setError(err.message||"Failed to create profile");
    }finally{
      setLoading(false);
    }
  }

  // ── Welcome screen ──────────────────────────────────────────────────────────
  if(mode==="welcome"){
    return(
      <motion.div initial={{opacity:0}} animate={{opacity:1}}
        className="fixed inset-0 z-[700] bg-[#0a0f1e] flex flex-col items-center justify-center p-6">
        <motion.div initial={{y:30,opacity:0}} animate={{y:0,opacity:1}} transition={{delay:0.1}}
          className="w-full max-w-sm text-center">
          <div className="text-7xl mb-5">🏪</div>
          <h2 className="text-white font-black text-2xl mb-2">Jual dengan Sapot Lokal</h2>
          <p className="text-white/40 text-sm mb-8">Post deals. Reach hungry buyers near you.</p>
          <div className="space-y-3">
            <button onClick={()=>setMode("signup")}
              className="w-full bg-emerald-500 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-sm shadow-lg shadow-emerald-900/50 active:scale-95 transition-all">
              🚀 Create Vendor Account
            </button>
            <button onClick={()=>setMode("login")}
              className="w-full bg-white/10 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-sm active:scale-95 transition-all">
              🔑 I Already Have an Account
            </button>
            <button onClick={onSkip}
              className="w-full text-white/20 text-xs font-bold py-2 mt-2">
              Continue without account
            </button>
          </div>
        </motion.div>
      </motion.div>
    );
  }

  // ── Signup screen ───────────────────────────────────────────────────────────
  if(mode==="signup"){
    return(
      <motion.div initial={{opacity:0}} animate={{opacity:1}}
        className="fixed inset-0 z-[700] bg-[#0a0f1e] overflow-y-auto">
        <div className="min-h-full flex flex-col items-center justify-center p-6">
          <motion.div initial={{y:30,opacity:0}} animate={{y:0,opacity:1}} transition={{delay:0.1}}
            className="w-full max-w-sm">
            <button onClick={()=>setMode("welcome")} className="text-white/30 text-sm mb-6 flex items-center gap-1">
              ← Back
            </button>
            <h2 className="text-white font-black text-2xl mb-1">Create Account</h2>
            <p className="text-white/30 text-sm mb-6">Free 60-day trial — no credit card needed</p>
            <div className="space-y-4">
              <div>
                <label className="text-white/40 text-[9px] font-black uppercase tracking-widest block mb-2">Shop Name *</label>
                <input value={shopName} onChange={e=>setShopName(e.target.value)}
                  placeholder="e.g. Warung Mak Teh" autoFocus
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white text-sm font-bold focus:border-emerald-500 focus:outline-none placeholder:text-white/20"/>
              </div>
              <div>
                <label className="text-white/40 text-[9px] font-black uppercase tracking-widest block mb-2">Area</label>
                <input value={area} onChange={e=>setArea(e.target.value)}
                  placeholder="e.g. SS15 Subang, Chow Kit KL"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white text-sm font-bold focus:border-emerald-500 focus:outline-none placeholder:text-white/20"/>
              </div>
              <div>
                <label className="text-white/40 text-[9px] font-black uppercase tracking-widest block mb-2">WhatsApp Number</label>
                <input value={phone} onChange={e=>setPhone(e.target.value)}
                  placeholder="01X-XXXXXXX" type="tel" inputMode="numeric"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white text-sm font-bold focus:border-emerald-500 focus:outline-none placeholder:text-white/20"/>
              </div>
              <div className="h-px bg-white/5"/>
              <div>
                <label className="text-white/40 text-[9px] font-black uppercase tracking-widest block mb-2">Email *</label>
                <input value={email} onChange={e=>setEmail(e.target.value)}
                  placeholder="your@email.com" type="email" inputMode="email"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white text-sm font-bold focus:border-emerald-500 focus:outline-none placeholder:text-white/20"/>
              </div>
              <div>
                <label className="text-white/40 text-[9px] font-black uppercase tracking-widest block mb-2">Password *</label>
                <div className="relative">
                  <input value={password} onChange={e=>setPassword(e.target.value)}
                    placeholder="Min 6 characters" type={showPw?"text":"password"}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white text-sm font-bold focus:border-emerald-500 focus:outline-none placeholder:text-white/20 pr-12"/>
                  <button onClick={()=>setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 text-sm">
                    {showPw?"🙈":"👁️"}
                  </button>
                </div>
              </div>
              {error&&<p className="text-red-400 text-xs font-bold bg-red-400/10 px-3 py-2 rounded-xl">{error}</p>}
            </div>
            <button onClick={handleSignup} disabled={loading||!email||!password||!shopName}
              className="w-full mt-6 bg-emerald-500 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-sm shadow-lg shadow-emerald-900/50 disabled:opacity-30 active:scale-95 transition-all flex items-center justify-center gap-2">
              {loading?<><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>Creating...</>:"🚀 Create Account — It's Free"}
            </button>
            <button onClick={()=>setMode("login")} className="w-full mt-3 text-white/30 text-xs font-bold py-2 text-center">
              Already have an account? Login
            </button>
          </motion.div>
        </div>
      </motion.div>
    );
  }

  // ── Login screen ────────────────────────────────────────────────────────────
  if(mode==="login"){
    return(
      <motion.div initial={{opacity:0}} animate={{opacity:1}}
        className="fixed inset-0 z-[700] bg-[#0a0f1e] flex flex-col items-center justify-center p-6">
        <motion.div initial={{y:30,opacity:0}} animate={{y:0,opacity:1}} transition={{delay:0.1}}
          className="w-full max-w-sm">
          <button onClick={()=>setMode("welcome")} className="text-white/30 text-sm mb-6 flex items-center gap-1">
            ← Back
          </button>
          <h2 className="text-white font-black text-2xl mb-1">Welcome Back</h2>
          <p className="text-white/30 text-sm mb-6">Login to your vendor account</p>
          <div className="space-y-4">
            <div>
              <label className="text-white/40 text-[9px] font-black uppercase tracking-widest block mb-2">Email</label>
              <input value={email} onChange={e=>setEmail(e.target.value)}
                placeholder="your@email.com" type="email" inputMode="email" autoFocus
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white text-sm font-bold focus:border-emerald-500 focus:outline-none placeholder:text-white/20"/>
            </div>
            <div>
              <label className="text-white/40 text-[9px] font-black uppercase tracking-widest block mb-2">Password</label>
              <div className="relative">
                <input value={password} onChange={e=>setPassword(e.target.value)}
                  placeholder="Your password" type={showPw?"text":"password"}
                  onKeyDown={e=>e.key==="Enter"&&handleLogin()}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white text-sm font-bold focus:border-emerald-500 focus:outline-none placeholder:text-white/20 pr-12"/>
                <button onClick={()=>setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 text-sm">
                  {showPw?"🙈":"👁️"}
                </button>
              </div>
            </div>
            {error&&<p className="text-red-400 text-xs font-bold bg-red-400/10 px-3 py-2 rounded-xl">{error}</p>}
          </div>
          <button onClick={handleLogin} disabled={loading||!email||!password}
            className="w-full mt-6 bg-emerald-500 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-sm shadow-lg shadow-emerald-900/50 disabled:opacity-30 active:scale-95 transition-all flex items-center justify-center gap-2">
            {loading?<><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>Logging in...</>:"🔑 Login"}
          </button>
          <button onClick={async()=>{
            if(!email){ setError("Enter your email first"); return; }
            setLoading(true);
            var {error:resetErr} = await supabase.auth.resetPasswordForEmail(email, {
              redirectTo: window.location.origin+'/reset-password'
            });
            setLoading(false);
            if(resetErr) setError(resetErr.message);
            else setError("✅ Password reset email sent! Check your inbox.");
          }} className="w-full mt-3 text-white/30 text-xs font-bold py-2 text-center">
            Forgot password?
          </button>
          <button onClick={()=>setMode("signup")} className="w-full text-white/30 text-xs font-bold py-2 text-center">
            No account yet? Sign up free
          </button>
        </motion.div>
      </motion.div>
    );
  }

  // ── Profile setup (after login, no vendor profile yet) ──────────────────────
  if(mode==="profile"){
    return(
      <motion.div initial={{opacity:0}} animate={{opacity:1}}
        className="fixed inset-0 z-[700] bg-[#0a0f1e] flex flex-col items-center justify-center p-6">
        <motion.div initial={{y:30,opacity:0}} animate={{y:0,opacity:1}}
          className="w-full max-w-sm">
          <div className="text-center mb-6">
            <div className="text-5xl mb-3">🏪</div>
            <h2 className="text-white font-black text-xl">Set Up Your Shop</h2>
            <p className="text-white/30 text-sm mt-1">Just a few details to get started</p>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-white/40 text-[9px] font-black uppercase tracking-widest block mb-2">Shop Name *</label>
              <input value={shopName} onChange={e=>setShopName(e.target.value)}
                placeholder="e.g. Warung Mak Teh" autoFocus
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white text-sm font-bold focus:border-emerald-500 focus:outline-none placeholder:text-white/20"/>
            </div>
            <div>
              <label className="text-white/40 text-[9px] font-black uppercase tracking-widest block mb-2">Area</label>
              <input value={area} onChange={e=>setArea(e.target.value)}
                placeholder="e.g. SS15 Subang"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white text-sm font-bold focus:border-emerald-500 focus:outline-none placeholder:text-white/20"/>
            </div>
            <div>
              <label className="text-white/40 text-[9px] font-black uppercase tracking-widest block mb-2">WhatsApp</label>
              <input value={phone} onChange={e=>setPhone(e.target.value)}
                placeholder="01X-XXXXXXX" type="tel"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white text-sm font-bold focus:border-emerald-500 focus:outline-none placeholder:text-white/20"/>
            </div>
            {error&&<p className="text-red-400 text-xs font-bold bg-red-400/10 px-3 py-2 rounded-xl">{error}</p>}
          </div>
          <button onClick={handleCreateProfile} disabled={loading||!shopName}
            className="w-full mt-6 bg-emerald-500 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-sm disabled:opacity-30 active:scale-95 transition-all flex items-center justify-center gap-2">
            {loading?<><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>Saving...</>:"✅ Save & Start Selling"}
          </button>
        </motion.div>
      </motion.div>
    );
  }

  return null;
}

function VendorOnboarding({t, onDone}){
  const [form, setForm]=useState({shopName:'',area:'',phone:''});
  const upd=(k,v)=>setForm(p=>({...p,[k]:v}));
  const canDone=form.shopName.trim().length>=2;

  const handleDone=()=>{
    const profile={
      shopName: form.shopName.trim(),
      area:     form.area.trim()||'My Area',
      phone:    form.phone.trim(),
      joinedAt: new Date().toISOString(),
    };
    saveVendorProfile(profile);
    onDone(profile);
  };

  return(
    <motion.div initial={{opacity:0}} animate={{opacity:1}}
      className="fixed inset-0 z-[700] bg-[#0a0f1e] flex flex-col items-center justify-center p-6">
      <motion.div initial={{y:30,opacity:0}} animate={{y:0,opacity:1}} transition={{delay:0.1}}
        className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🏪</div>
          <h2 className="text-white font-black text-2xl">{t.onboardTitle}</h2>
          <p className="text-white/40 text-sm mt-2">{t.onboardSub}</p>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-white/40 text-[9px] font-black uppercase tracking-widest block mb-2">
              {t.onboardShopName} <span className="text-red-400">*</span>
            </label>
            <input value={form.shopName} onChange={e=>upd('shopName',e.target.value)}
              placeholder={t.onboardShopNamePH} autoFocus
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white text-sm font-bold focus:border-emerald-500 focus:outline-none placeholder:text-white/20"/>
          </div>
          <div>
            <label className="text-white/40 text-[9px] font-black uppercase tracking-widest block mb-2">{t.onboardArea}</label>
            <input value={form.area} onChange={e=>upd('area',e.target.value)}
              placeholder={t.onboardAreaPH}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white text-sm font-bold focus:border-emerald-500 focus:outline-none placeholder:text-white/20"/>
            <p className="text-white/20 text-[9px] mt-1.5">Shown to buyers on your listings</p>
          </div>
          <div>
            <label className="text-white/40 text-[9px] font-black uppercase tracking-widest block mb-2">{t.onboardPhone}</label>
            <input value={form.phone} onChange={e=>upd('phone',e.target.value)}
              placeholder={t.onboardPhonePH} type="tel" inputMode="numeric"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white text-sm font-bold focus:border-emerald-500 focus:outline-none placeholder:text-white/20"/>
            <p className="text-white/20 text-[9px] mt-1.5">For buyers to contact you on WhatsApp</p>
          </div>
        </div>
        <button onClick={handleDone} disabled={!canDone}
          className="w-full mt-8 bg-emerald-500 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-sm shadow-lg shadow-emerald-900/50 disabled:opacity-30 active:scale-95 transition-all">
          {t.onboardDone}
        </button>
        <button onClick={()=>onDone({shopName:'My Shop',area:'',phone:'',joinedAt:new Date().toISOString()})}
          className="w-full mt-3 text-white/20 text-xs font-bold py-2">
          {t.onboardSkip}
        </button>
      </motion.div>
    </motion.div>
  );
}

// ─── ORDER HISTORY ────────────────────────────────────────────────────────────
const LS_ORDERS = 'sapot_order_history';

function saveOrderToHistory(order){
  try{
    const existing=JSON.parse(localStorage.getItem(LS_ORDERS)||'[]');
    const updated=[order,...existing].slice(0,20); // keep last 20
    localStorage.setItem(LS_ORDERS, JSON.stringify(updated));
  }catch(e){}
}
function getOrderHistory(){
  try{ return JSON.parse(localStorage.getItem(LS_ORDERS)||'[]'); }
  catch{ return []; }
}

function OrderHistorySheet({t, onClose}){
  const [orders]=useState(()=>getOrderHistory());
  const [expandedId, setExpandedId]=useState(null);
  const scrollRef=useRef(null);

  return(
    <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
      className="fixed inset-0 z-[400] bg-black/80 backdrop-blur-md flex items-end justify-center"
      onClick={onClose}>
      <motion.div initial={{y:'100%'}} animate={{y:0}} exit={{y:'100%'}}
        transition={{type:'spring',damping:28,stiffness:280}}
        onClick={e=>e.stopPropagation()}
        className="w-full max-w-sm bg-white rounded-t-[36px] max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-slate-100 flex-shrink-0">
          <h2 className="font-black text-xl">{t.myOrdersTitle}</h2>
          <button onClick={onClose} className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-sm">✕</button>
        </div>
        <div ref={scrollRef} className="flex-1 overflow-y-auto">
          {orders.length===0?(
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <p className="text-5xl mb-4">🧾</p>
              <p className="font-black text-slate-700">{t.myOrdersEmpty}</p>
              <p className="text-slate-400 text-sm mt-1">{t.myOrdersEmptySub}</p>
            </div>
          ):(
            <div className="p-4 space-y-3">
              {orders.map(o=>(
                <div key={o.id} className="bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden">
                  <div className="p-4 flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0 text-lg">
                      {o.emoji||'🍱'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-sm text-slate-800 truncate">{o.itemName}</p>
                      <p className="text-slate-400 text-xs">{t.orderFrom} {o.vendorName} · RM{fmtRM(o.amount)}</p>
                      <p className="text-slate-300 text-[9px] mt-0.5">{new Date(o.orderedAt||Date.now()).toLocaleString('en-MY',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})}</p>
                    </div>
                    <button onClick={()=>setExpandedId(expandedId===o.id?null:o.id)}
                      className={`flex-shrink-0 px-3 py-1.5 rounded-xl font-black text-xs transition-all ${expandedId===o.id?'bg-emerald-500 text-white':'bg-slate-200 text-slate-600'}`}>
                      {t.viewCode}
                    </button>
                  </div>
                  <AnimatePresence>
                    {expandedId===o.id&&(
                      <motion.div initial={{height:0}} animate={{height:'auto'}} exit={{height:0}}
                        className="overflow-hidden">
                        <div className="border-t border-slate-200 p-4 bg-emerald-50 text-center">
                          <p className="text-slate-400 text-[9px] font-black uppercase tracking-widest mb-1">{t.pickupCode}</p>
                          <p className="text-emerald-600 font-black text-3xl tracking-[8px]">{o.pickupCode}</p>
                          <p className="text-slate-400 text-[9px] mt-2">{t.pickupNote}</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── SHARE LISTING ────────────────────────────────────────────────────────────
function ShareButton({listing, t}){
  const [copied, setCopied]=useState(false);
  const [open, setOpen]=useState(false);

  const appUrl = window.location.origin;
  const shareUrl = `${appUrl}?item=${listing.id}`;
  const msg = fill(t.shareMsg, listing.title, listing.vendorName, fmtRM(listing.dealPrice), shareUrl);
  const waUrl = `https://wa.me/?text=${encodeURIComponent(msg)}`;

  const handleCopy=()=>{
    navigator.clipboard && navigator.clipboard.writeText(shareUrl).then(()=>{
      setCopied(true);setTimeout(()=>setCopied(false),2000);
    });
  };

  const handleNativeShare=()=>{
    if(navigator.share){
      navigator.share({title:'Sapot Lokal Deal',text:msg,url:shareUrl}).catch(()=>{});
    } else {
      setOpen(true);
    }
  };

  return(
    <>
      <button onClick={handleNativeShare}
        className="w-8 h-8 bg-black/20 hover:bg-black/30 rounded-full flex items-center justify-center text-white/80 text-sm transition-colors active:scale-90"
        aria-label="Share">
        📤
      </button>
      <AnimatePresence>
        {open&&(
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            className="fixed inset-0 z-[800] bg-black/60 flex items-end justify-center"
            onClick={()=>setOpen(false)}>
            <motion.div initial={{y:40,opacity:0}} animate={{y:0,opacity:1}} exit={{y:40,opacity:0}}
              onClick={e=>e.stopPropagation()}
              className="w-full max-w-sm bg-white rounded-t-[28px] p-5 pb-8">
              <p className="font-black text-base mb-4">{t.shareTitle}</p>
              <div className="space-y-3">
                <a href={waUrl} target="_blank" rel="noreferrer"
                  className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-2xl px-4 py-3.5 active:scale-95 transition-transform">
                  <span className="text-2xl">💬</span>
                  <div>
                    <p className="font-black text-sm text-green-800">{t.shareWhatsapp}</p>
                    <p className="text-green-600 text-xs">{listing.title} · RM{fmtRM(listing.dealPrice)}</p>
                  </div>
                </a>
                <button onClick={handleCopy}
                  className="w-full flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 active:scale-95 transition-transform">
                  <span className="text-2xl">{copied?'✅':'🔗'}</span>
                  <p className="font-black text-sm text-slate-700">{copied?t.shareCopied:t.shareCopy}</p>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}



// ─── REPORT LISTING ────────────────────────────────────────────────────────────
function ReportButton({listing, t}){
  const [open, setOpen]=useState(false);
  const [sent, setSent]=useState(false);
  const reasons=["Photo doesn't match food","Wrong price","Already sold out","Suspicious listing","Other"];

  if(sent) return(
    <div className="mt-2 bg-white/5 rounded-xl px-3 py-2 text-center">
      <p className="text-white/40 text-[9px] font-bold">✅ Report sent — thanks for keeping Sapot Lokal safe</p>
    </div>
  );

  return(
    <>
      <button onClick={function(e){e.stopPropagation();setOpen(true);}}
        className="absolute top-2 left-2 w-7 h-7 bg-black/50 rounded-full flex items-center justify-center text-white/40 text-[10px] active:scale-90 transition-transform"
        title="Report listing">
        🚩
      </button>
      {open&&(
        <div className="fixed inset-0 z-[800] bg-black/60 flex items-end justify-center" onClick={()=>setOpen(false)}>
          <div className="w-full max-w-sm bg-[#0d1929] rounded-t-3xl p-5" onClick={function(e){e.stopPropagation();}}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-black text-sm">🚩 Report Listing</h3>
              <button onClick={()=>setOpen(false)} className="text-white/30 text-sm">✕</button>
            </div>
            <p className="text-white/40 text-[10px] mb-3 font-bold">{listing.title} · {listing.vendorName}</p>
            <div className="space-y-2">
              {reasons.map(function(r){
                return(
                  <button key={r} onClick={function(){
                    setSent(true);setOpen(false);
                    // In production: POST to /api/reports
                    console.log('Report:',listing.id,r);
                  }} className="w-full text-left px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white/70 text-xs font-bold active:bg-white/10 transition-colors">
                    {r}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ─── VIDEO AD OVERLAY ─────────────────────────────────────────────────────────
// Mini inlay video ad — appears after search, dismissible, expandable
// In production: replace MOCK_ADS with real ad server data
const MOCK_ADS = [
  {
    id:"ad1",
    type:"vendor_spotlight",          // vendor paying to be featured
    advertiser:"Bak Kut Teh Ah Kow",
    area:"Klang",
    tagline:"Best BKT in Klang since 1978",
    cta:"View Menu",
    ctaUrl:"#",
    // Using a looping mp4-compatible video — free stock
    videoUrl:"https://www.w3schools.com/html/mov_bbb.mp4",
    thumbnail:"https://picsum.photos/seed/bkt/400/225",
    badge:"🍖 Vendor Spotlight",
    badgeBg:"bg-amber-500",
    triggerKeywords:["bak kut teh","bkt","pork","klang","sup"],
  },
  {
    id:"ad2",
    type:"banner",                    // external advertiser
    advertiser:"FoodPanda",
    tagline:"Free delivery with code SAPOT",
    cta:"Claim Now",
    ctaUrl:"#",
    videoUrl:"https://www.w3schools.com/html/mov_bbb.mp4",
    thumbnail:"https://picsum.photos/seed/delivery/400/225",
    badge:"📢 Sponsored",
    badgeBg:"bg-blue-500",
    triggerKeywords:[],               // empty = show in all searches
  },
];

function shouldShowAd(search, searchTerms){
  if(!search || search.trim()==='') return null;
  // First check vendor spotlight — keyword targeted
  const spotlight = MOCK_ADS.find(function(ad){
    return ad.triggerKeywords.some(function(k){
      return searchTerms.includes(k) || k.includes(search.toLowerCase());
    });
  });
  if(spotlight) return spotlight;
  // Fallback: show generic banner ad on any search after 1s
  return MOCK_ADS.find(function(a){ return a.type==='banner'; }) || null;
}

function VideoAdInlay({ad, onDismiss, t}){
  const [expanded, setExpanded]=useState(false);
  const [playing, setPlaying]=useState(false);
  const [dismissed, setDismissed]=useState(false);
  const videoRef=useRef(null);

  function handleExpand(){
    setExpanded(true);
    setPlaying(true);
    if(videoRef.current){
      videoRef.current.play().catch(function(){});
    }
  }

  function handleCollapse(){
    setExpanded(false);
    setPlaying(false);
    if(videoRef.current){
      videoRef.current.pause();
      videoRef.current.currentTime=0;
    }
  }

  function handleDismiss(e){
    e.stopPropagation();
    setDismissed(true);
    setTimeout(onDismiss, 300);
  }

  if(dismissed) return null;

  // ── EXPANDED — full modal video player ────────────────────────────────────
  if(expanded){
    return(
      <motion.div
        initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
        className="fixed inset-0 z-[900] bg-black flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-safe pt-4 pb-3 bg-black">
          <div className="flex items-center gap-2">
            <span className={"text-[9px] font-black px-2 py-1 rounded-full text-white "+ad.badgeBg}>{ad.badge}</span>
            <p className="text-white font-black text-sm">{ad.advertiser}</p>
          </div>
          <button onClick={handleCollapse}
            className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center text-white text-lg">
            ✕
          </button>
        </div>
        {/* Full video */}
        <div className="flex-1 bg-black flex items-center justify-center">
          <video
            ref={videoRef}
            src={ad.videoUrl}
            className="w-full max-h-full object-contain"
            autoPlay
            loop
            playsInline
            controls={false}
            onClick={function(){
              if(videoRef.current){
                if(videoRef.current.paused) videoRef.current.play().catch(function(){});
                else videoRef.current.pause();
              }
            }}
          />
        </div>
        {/* CTA bar */}
        <div className="p-4 bg-black border-t border-white/10">
          <p className="text-white/60 text-xs mb-3">{ad.tagline}</p>
          <a href={ad.ctaUrl}
            className="block w-full bg-emerald-500 text-white text-center py-4 rounded-2xl font-black uppercase tracking-widest text-sm active:scale-95 transition-transform">
            {ad.cta} →
          </a>
        </div>
      </motion.div>
    );
  }

  // ── MINI INLAY — bottom-right floating card ────────────────────────────────
  return(
    <motion.div
      initial={{opacity:0, x:120, y:20}}
      animate={{opacity:1, x:0, y:0, transition:{type:"spring",damping:22,stiffness:260}}}
      exit={{opacity:0, x:120}}
      className="fixed bottom-24 right-3 z-[600] w-48 shadow-2xl rounded-2xl overflow-hidden"
      style={{boxShadow:"0 8px 32px rgba(0,0,0,0.4)"}}>

      {/* Thumbnail with play overlay */}
      <div className="relative" onClick={handleExpand} style={{cursor:"pointer"}}>
        <img src={ad.thumbnail} alt="" className="w-full h-28 object-cover"/>
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20"/>
        {/* Badge top-left */}
        <span className={"absolute top-2 left-2 text-[8px] font-black px-1.5 py-0.5 rounded-full text-white "+ad.badgeBg}>
          {ad.badge}
        </span>
        {/* Dismiss X top-right */}
        <button
          onClick={handleDismiss}
          className="absolute top-1.5 right-1.5 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center text-white text-[9px] font-black">
          ✕
        </button>
        {/* Play button center */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-lg">
            <span className="text-base ml-0.5">▶</span>
          </div>
        </div>
        {/* Bottom text */}
        <div className="absolute bottom-0 left-0 right-0 px-2 pb-2">
          <p className="text-white font-black text-[10px] leading-tight">{ad.advertiser}</p>
        </div>
      </div>

      {/* CTA strip */}
      <div className="bg-slate-900 px-2.5 py-2 flex items-center justify-between">
        <p className="text-white/50 text-[8px] flex-1 truncate">{ad.tagline}</p>
        <a href={ad.ctaUrl}
          className="flex-shrink-0 bg-emerald-500 text-white text-[8px] font-black px-2 py-1 rounded-lg ml-1">
          {ad.cta}
        </a>
      </div>

      {/* Tap to expand hint — disappears after 3s */}
      <motion.div
        initial={{opacity:1}} animate={{opacity:0}} transition={{delay:2.5,duration:0.5}}
        className="absolute -bottom-6 left-0 right-0 text-center pointer-events-none">
        <span className="bg-black/70 text-white/70 text-[8px] px-2 py-0.5 rounded-full">tap to expand</span>
      </motion.div>
    </motion.div>
  );
}

// ─── LANG TOGGLE ─────────────────────────────────────────────────────────────
const LANG_CYCLE = {en:"bm", bm:"zh", zh:"en"};
const LANG_META  = {en:{flag:"🇬🇧",label:"EN"}, bm:{flag:"🇲🇾",label:"BM"}, zh:{flag:"🇨🇳",label:"中文"}};
function LangToggle({lang,setLang}){
  const meta=LANG_META[lang]||LANG_META.en;
  return(
    <button onClick={()=>setLang(LANG_CYCLE[lang]||"en")}
      className="flex items-center gap-1 bg-slate-100 hover:bg-slate-200 px-2.5 py-1.5 rounded-xl transition-all active:scale-95">
      <span className="text-sm">{meta.flag}</span>
      <span className="text-[10px] font-black text-slate-600">{meta.label}</span>
    </button>
  );
}

// ─── ORDER CONFIRMED TOAST ───────────────────────────────────────────────────
function OrderConfirmedToast({order,t,onDismiss}){
  useEffect(()=>{
    const id=setTimeout(onDismiss,8000);
    return()=>clearTimeout(id);
  },[]);
  return(
    <motion.div initial={{y:-120,opacity:0}} animate={{y:0,opacity:1}} exit={{y:-120,opacity:0}}
      transition={{type:"spring",damping:22,stiffness:300}}
      className="fixed top-4 left-1/2 -translate-x-1/2 z-[800] w-[calc(100%-32px)] max-w-sm">
      <div className="bg-emerald-600 rounded-2xl shadow-2xl shadow-emerald-900/50 overflow-hidden">
        <div className="px-4 py-3 flex items-start gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0 text-xl">🎉</div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-black text-sm leading-tight">Order Confirmed!</p>
            <p className="text-white/80 text-xs mt-0.5 truncate">{order.itemName} from {order.vendorName}</p>
            <div className="flex items-center gap-3 mt-1.5">
              <div className="bg-white/20 rounded-lg px-2 py-1">
                <p className="text-white text-[9px] font-black tracking-widest">CODE: {order.pickupCode}</p>
              </div>
              <p className="text-white/60 text-[9px]">Show to vendor on pickup</p>
            </div>
          </div>
          <button onClick={onDismiss} className="text-white/50 text-sm flex-shrink-0 mt-0.5">✕</button>
        </div>
        <div className="h-1 bg-white/20">
          <motion.div initial={{width:"100%"}} animate={{width:"0%"}} transition={{duration:8,ease:"linear"}} className="h-full bg-white/60"/>
        </div>
      </div>
    </motion.div>
  );
}

// ─── OUT OF STOCK TOAST ────────────────────────────────────────────────────
function OutOfStockToast({itemName,vendorName,onDismiss}){
  useEffect(()=>{
    const id=setTimeout(onDismiss,6000);
    return()=>clearTimeout(id);
  },[]);
  return(
    <motion.div initial={{y:-120,opacity:0}} animate={{y:0,opacity:1}} exit={{y:-120,opacity:0}}
      transition={{type:"spring",damping:22,stiffness:300}}
      className="fixed top-4 left-1/2 -translate-x-1/2 z-[800] w-[calc(100%-32px)] max-w-sm">
      <div className="bg-slate-800 border border-red-500/40 rounded-2xl shadow-2xl overflow-hidden">
        <div className="px-4 py-3 flex items-start gap-3">
          <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center flex-shrink-0 text-xl">😔</div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-black text-sm">Sorry, just sold out!</p>
            <p className="text-white/50 text-xs mt-0.5 truncate">{itemName} from {vendorName} is no longer available</p>
            <p className="text-white/40 text-[9px] mt-1">The vendor may repost later — check back soon</p>
          </div>
          <button onClick={onDismiss} className="text-white/50 text-sm flex-shrink-0 mt-0.5">✕</button>
        </div>
        <div className="h-0.5 bg-red-500/20">
          <motion.div initial={{width:"100%"}} animate={{width:"0%"}} transition={{duration:6,ease:"linear"}} className="h-full bg-red-400/60"/>
        </div>
      </div>
    </motion.div>
  );
}

// ─── HALAL DISCLAIMER MODAL ──────────────────────────────────────────────────
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

// ─── NOTIFICATION TOAST ──────────────────────────────────────────────────────
function NotifToast({listing,t,onDismiss,onView}){
  useEffect(()=>{const id=setTimeout(onDismiss,5000);return()=>clearTimeout(id);},[]);
  return(
    <motion.div
      initial={{y:-90,opacity:0}} animate={{y:0,opacity:1}} exit={{y:-90,opacity:0}}
      transition={{type:"spring",damping:22,stiffness:300}}
      className="fixed top-3 left-1/2 -translate-x-1/2 z-[800] w-[calc(100%-2rem)] max-w-sm">
      <div className="bg-slate-900 rounded-2xl p-3 shadow-2xl flex items-center gap-3 border border-white/10">
        <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-slate-700">
          <img src={listing.image} className="w-full h-full object-cover" alt=""/>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"/>
            <p className="text-white/60 text-[9px] font-black uppercase tracking-widest">{t.notifNewDeal}</p>
          </div>
          <p className="text-white font-black text-sm leading-tight truncate">{listing.title}</p>
          <p className="text-white/40 text-[10px] mt-0.5">{fill(t.notifAt,listing.vendorName,listing.distance)}</p>
        </div>
        <div className="flex flex-col gap-1.5 flex-shrink-0">
          <button onClick={onView} className="bg-emerald-500 text-white text-[10px] font-black px-3 py-1.5 rounded-xl">{t.notifView}</button>
          <button onClick={onDismiss} className="text-white/30 text-[10px] text-center">✕</button>
        </div>
      </div>
    </motion.div>
  );
}

// ─── NOTIF PERMISSION PROMPT ─────────────────────────────────────────────────
function NotifPermBanner({radius,onYes,onNo,t}){
  return(
    <motion.div initial={{height:0,opacity:0}} animate={{height:"auto",opacity:1}} exit={{height:0,opacity:0}}
      className="overflow-hidden bg-indigo-600 border-b border-indigo-700">
      <div className="px-4 py-3 flex items-center gap-3">
        <span className="text-xl flex-shrink-0">🔔</span>
        <div className="flex-1 min-w-0">
          <p className="text-white font-black text-xs">{t.notifPermTitle}</p>
          <p className="text-indigo-200 text-[10px]">{fill(t.notifPermDesc,radius)}</p>
        </div>
        <button onClick={onYes} className="bg-white text-indigo-700 text-[10px] font-black px-3 py-1.5 rounded-xl flex-shrink-0">{t.notifPermYes}</button>
        <button onClick={onNo} className="text-indigo-300 text-[10px] flex-shrink-0">✕</button>
      </div>
    </motion.div>
  );
}

// ─── TOPUP ITEM ROW ──────────────────────────────────────────────────────────
function TopupItemRow({item,inCart,onAdd,t}){
  const isSoldOut=item.qty&&item.claimed>=item.qty;
  const savings=savingsPct(item.originalPrice,item.dealPrice);
  return(
    <motion.div layout initial={{opacity:0,y:8}} animate={{opacity:1,y:0}}
      className="flex gap-3 items-center bg-white border border-slate-100 rounded-2xl p-3 shadow-sm">
      <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-slate-100 relative">
        <img src={item.image} className="w-full h-full object-cover" alt=""/>
        {savings&&<span className="absolute bottom-0 right-0 bg-yellow-400 text-black text-[8px] font-black px-1 rounded-tl-lg">{savings}%</span>}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-black text-sm leading-tight truncate">{item.title}</h4>
        <p className="text-slate-400 text-[10px] truncate">{item.vendorName}</p>
        <p className="text-emerald-600 font-black text-sm mt-0.5">RM{fmtRM(item.dealPrice)}</p>
      </div>
      <button onClick={()=>onAdd(item)} disabled={inCart||isSoldOut}
        className={`flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center font-black text-sm transition-all ${inCart?"bg-emerald-100 text-emerald-600":isSoldOut?"bg-slate-100 text-slate-300":"bg-slate-900 text-white active:scale-90"}`}>
        {inCart?"✓":isSoldOut?"✗":"+"}
      </button>
    </motion.div>
  );
}

// ─── TOP-UP SHEET ─────────────────────────────────────────────────────────────
function TopupSheet({vendor,allListings,cart,onAdd,onClose,t}){
  const cartIds=cart.map(i=>i.id);
  const cartTotal=cart.reduce((s,i)=>s+i.dealPrice,0);
  const vSubtotal=cart.filter(i=>i.vendorId===vendor.vendorId).reduce((s,i)=>s+i.dealPrice,0);
  const effectiveTotal=vendor.sharedPool?cartTotal:vSubtotal;
  const currentToGo=Math.max(0,(vendor.threshold||0)-effectiveTotal);
  const isUnlocked=currentToGo<=0;

  const vendorItems=allListings.filter(l=>l.vendorId===vendor.vendorId&&!cartIds.includes(l.id)&&!(l.qty&&l.claimed>=l.qty));
  const otherItems=allListings.filter(l=>l.vendorId!==vendor.vendorId&&!cartIds.includes(l.id)&&!(l.qty&&l.claimed>=l.qty)).sort((a,b)=>a.dealPrice-b.dealPrice).slice(0,4);

  return(
    <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
      className="fixed inset-0 z-[400] bg-black/70 backdrop-blur-sm flex items-end justify-center" onClick={onClose}>
      <motion.div initial={{y:"100%"}} animate={{y:0}} exit={{y:"100%"}}
        transition={{type:"spring",damping:28,stiffness:280}}
        onClick={e=>e.stopPropagation()}
        className="w-full max-w-sm bg-white rounded-t-[32px] max-h-[85vh] flex flex-col overflow-hidden">

        <div className="px-5 pt-5 pb-4 border-b border-slate-100 flex-shrink-0">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h2 className="font-black text-lg">{t.topupTitle}</h2>
              <p className="text-slate-400 text-xs mt-0.5">{fill(t.topupFrom,vendor.vendorName)}</p>
            </div>
            <button onClick={onClose} className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-sm ml-3">✕</button>
          </div>
          <AnimatePresence mode="wait">
            {isUnlocked?(
              <motion.div key="done" initial={{opacity:0}} animate={{opacity:1}} className="bg-emerald-50 border border-emerald-200 rounded-2xl px-4 py-3 flex items-center gap-3">
                <span className="text-2xl">🎉</span>
                <p className="font-black text-emerald-700 text-sm">{t.topupDone}</p>
              </motion.div>
            ):(
              <motion.div key="prog" className="bg-slate-50 rounded-2xl px-4 py-3">
                {vendor.sharedPool&&(
                  <p className="text-indigo-600 text-[9px] font-black uppercase tracking-widest mb-2">✨ Combined cart counts</p>
                )}
                <div className="flex justify-between items-center mb-2">
                  <p className="text-[10px] font-black text-slate-500">🚗 {vendor.sharedPool?fill(t.topupNeedRMShared,fmtRM(currentToGo)):fill(t.topupNeedRM,fmtRM(currentToGo))}</p>
                  <p className="text-[10px] font-black text-slate-400">RM{fmtRM(effectiveTotal)} / RM{fmtRM(vendor.threshold)}</p>
                </div>
                <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                  <motion.div className="bg-emerald-500 h-full rounded-full"
                    animate={{width:`${Math.min((effectiveTotal/(vendor.threshold||1))*100,100)}%`}}
                    transition={{duration:0.6,ease:"easeOut"}}/>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          <div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">{fill(t.topupVendorItems,vendor.vendorName)}</p>
            {vendorItems.length>0?(
              <div className="space-y-2">{vendorItems.map(item=><TopupItemRow key={item.id} item={item} inCart={cartIds.includes(item.id)} onAdd={onAdd} t={t}/>)}</div>
            ):(
              <div className="bg-slate-50 border border-slate-100 rounded-2xl px-4 py-4 flex gap-3 items-start">
                <span className="text-2xl flex-shrink-0">🏪</span>
                <div>
                  <p className="font-bold text-slate-600 text-sm">{fill(t.topupVendorEmpty,vendor.vendorName)}</p>
                  <p className="text-slate-400 text-xs mt-1">👇 {t.topupSuggestTitle}</p>
                </div>
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-slate-100"/>
            <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">{t.topupSuggestTitle}</p>
            <div className="flex-1 h-px bg-slate-100"/>
          </div>
          <div>
            <p className="text-slate-400 text-[10px] mb-3">
              {vendor.sharedPool?t.topupSuggestDescShared:fill(t.topupSuggestDescOwn,fmtRM(vendor.threshold),vendor.vendorName)}
            </p>
            {otherItems.length>0?(
              <div className="space-y-2">{otherItems.map(item=><TopupItemRow key={item.id} item={item} inCart={cartIds.includes(item.id)} onAdd={onAdd} t={t}/>)}</div>
            ):(
              <p className="text-slate-300 text-xs font-bold text-center py-4">{t.topupNoSuggest}</p>
            )}
          </div>
        </div>
        <div className="px-5 pb-8 pt-3 border-t border-slate-100 flex-shrink-0">
          <button onClick={onClose} className="w-full text-slate-400 text-xs font-bold py-3">{t.topupSkip} →</button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── LISTING CARD ─────────────────────────────────────────────────────────────
function ListingCard({listing,onAddToCart,inCart,cartTopupBanner,isStudentMode,t}){
  const countdown=useCountdown(listing.endTime,t);
  const pct=stockPct(listing.qty,listing.claimed);
  const savings=savingsPct(listing.originalPrice,listing.dealPrice);
  const studentSavings=listing.studentPrice?savingsPct(listing.originalPrice,listing.studentPrice):null;
  const isUrgent=listing.qty&&(listing.qty-listing.claimed)<=3;
  const isSoldOut=listing.qty&&listing.claimed>=listing.qty;
  const isExpired=listing.endTime&&countdown===t.expired;
  const tag=dealTag(listing.type,t);
  const hb=halalBadge(listing.halal,t);
  const showStudentPrice=isStudentMode&&listing.studentPrice;

  return(
    <motion.div layout initial={{opacity:0,y:24}} animate={{opacity:1,y:0}} exit={{opacity:0,scale:0.94}}
      className={`bg-white rounded-3xl overflow-hidden shadow-sm border ${showStudentPrice?"border-indigo-100":"border-slate-100"} ${(isSoldOut||isExpired)?"opacity-50":""}`}>
      <div className="relative h-44">
        <img src={listing.image} alt={listing.title} className="w-full h-full object-cover"/>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"/>
        {/* Halal badge + self-declared note */}
        <div className="absolute top-3 left-3 flex flex-col gap-1">
          {hb&&(
            <div>
              <span className={`text-white text-[9px] font-black px-2 py-1 rounded-t-lg uppercase tracking-wider inline-block ${hb.bg}`}>{hb.label}</span>
              <div className="bg-black/50 rounded-b-lg px-2 py-0.5">
                <p className="text-white/60 text-[7px] font-bold">{t.halalSelfDeclared}</p>
              </div>
            </div>
          )}
          <span className="bg-white/90 text-slate-800 text-[9px] font-black px-2 py-1 rounded-lg uppercase w-fit">{listing.category}</span>
        </div>
        {/* Savings badge */}
        {(showStudentPrice?studentSavings:savings)&&(
          <div className={`absolute top-3 right-3 text-[10px] font-black px-2.5 py-1.5 rounded-xl shadow -rotate-2 ${showStudentPrice?"bg-indigo-500 text-white":"bg-yellow-400 text-black"}`}>
            {t.save} {showStudentPrice?studentSavings:savings}%
          </div>
        )}
        <div className="absolute bottom-3 left-3 flex gap-1.5 flex-wrap">
          <span className={`text-[9px] font-black px-2.5 py-1 rounded-full uppercase text-white ${tag.bg}`}>{tag.label}</span>
          {showStudentPrice&&<span className="text-[9px] font-black px-2.5 py-1 rounded-full uppercase text-white bg-indigo-500">{t.studentTag}</span>}
        </div>
        <div className={`absolute bottom-3 right-3 text-[9px] font-black px-2.5 py-1 rounded-full ${isExpired?"bg-slate-800 text-white/50":"bg-red-500 text-white"}`}>⏱ {countdown}</div>
        {/* Share button — top right of card image */}
        <div className="absolute top-3 right-3">
          <ShareButton listing={listing} t={t}/>
      <ReportButton listing={listing} t={t}/>
        </div>
      </div>

      <div className="p-4">
        <div className="flex justify-between items-start mb-1">
          <div className="flex-1 pr-3">
            <h3 className="font-black text-slate-900 text-base leading-tight">{listing.title}</h3>
            <p className="text-slate-400 text-[11px] mt-0.5">{listing.desc}</p>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-[10px] text-slate-300 line-through">RM{fmtRM(listing.originalPrice)}</p>
            {showStudentPrice?(
              <div>
                <p className="text-[10px] text-slate-400 line-through">RM{fmtRM(listing.dealPrice)}</p>
                <p className="text-lg font-black text-indigo-600">RM{fmtRM(listing.studentPrice)}</p>
                <p className="text-[8px] text-indigo-400 font-black uppercase">{t.studentPriceLabel}</p>
              </div>
            ):(
              <p className="text-lg font-black text-emerald-600">RM{fmtRM(listing.dealPrice)}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5 mt-1.5 mb-2">
          <span className="text-[10px] text-slate-400 font-bold">📍 {listing.vendorName}{listing.branch?` · ${listing.branch}`:""} · {listing.distance}km</span>
          <span className="text-slate-200">·</span>
          <span className="text-[10px] text-slate-400">{timeAgo(listing.postedAt,t)}</span>
        </div>

        {/* Delivery teaser — shows shared pool badge if applicable */}
        {cartTopupBanner?(
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 mb-3 flex items-center gap-2">
            <span className="text-sm">🚗</span>
            <p className="text-amber-700 text-[10px] font-black flex-1">{cartTopupBanner}</p>
          </div>
        ):(
          <div className={`text-[10px] font-black px-3 py-1.5 rounded-xl mb-3 ${listing.freeDeliveryThreshold?"bg-emerald-50 text-emerald-700":"bg-slate-50 text-slate-400"}`}>
            {listing.freeDeliveryThreshold
              ? listing.sharedPool ? t.freeDeliveryShared : fill(t.freeDeliveryFrom,fmtRM(listing.freeDeliveryThreshold))
              : `🚶 ${t.noDelivery}`}
          </div>
        )}

        {pct!==null&&(
          <div className="mb-3">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1">
              {isSoldOut?t.soldOutLabel:isUrgent?`⚠️ ${t.almostOut} ${listing.qty-listing.claimed} ${t.unitsLeft}`:`${listing.qty-listing.claimed} / ${listing.qty} ${t.perUnit}`}
            </p>
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all duration-700 ${pct>=90?"bg-red-500":pct>=60?"bg-orange-400":"bg-emerald-500"}`} style={{width:`${pct}%`}}/>
            </div>
          </div>
        )}

        <button onClick={()=>onAddToCart({...listing,dealPrice:showStudentPrice?listing.studentPrice:listing.dealPrice})}
          disabled={isSoldOut||inCart||isExpired}
          className={`w-full py-3 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95 ${
            inCart?"bg-emerald-100 text-emerald-600 cursor-default"
            :isSoldOut||isExpired?"bg-slate-100 text-slate-400 cursor-not-allowed"
            :showStudentPrice?"bg-indigo-700 text-white"
            :"bg-slate-900 text-white"}`}>
          {inCart?t.addedToCart:isSoldOut?t.soldOut:isExpired?t.expired:t.addToCart}
        </button>
      </div>
    </motion.div>
  );
}

// ─── CART PANEL ───────────────────────────────────────────────────────────────

// ─── VENDOR STOREFRONT SHEET ────────────────────────────────────────────────
// Opens after buyer taps "Add to Cart" on a deal listing.
// Shows vendor's full menu + other live deals so buyer can add more items.
// Subscriber-only feature: shows free delivery progress bar.
// vendorProfile.freeDeliveryThreshold controls the free delivery minimum.

const MOCK_VENDOR_MENUS = {
  1: [ // Warung Mak Teh
    {id:101,title:"Nasi Putih",price:1.50,emoji:"🍚",desc:"Steamed white rice"},
    {id:102,title:"Ayam Goreng",price:4.00,emoji:"🍗",desc:"Crispy fried chicken"},
    {id:103,title:"Telur Mata",price:1.00,emoji:"🍳",desc:"Sunny side up egg"},
    {id:104,title:"Sayur Campur",price:2.00,emoji:"🥦",desc:"Mixed vegetables"},
    {id:105,title:"Teh O Ais",price:2.00,emoji:"🧊",desc:"Iced black tea"},
  ],
  2: [ // Bakeri Fariz
    {id:201,title:"Roti Bun",price:1.20,emoji:"🥖",desc:"Soft bread bun"},
    {id:202,title:"Donut Gula",price:1.50,emoji:"🍩",desc:"Sugar glazed donut"},
    {id:203,title:"Milo Panas",price:2.50,emoji:"☕",desc:"Hot Milo"},
    {id:204,title:"Kek Batik",price:3.50,emoji:"🍰",desc:"Chocolate layered cake"},
  ],
  3: [ // Kedai Kopi Uncle Lim
    {id:301,title:"Kopi O",price:1.80,emoji:"☕",desc:"Black coffee"},
    {id:302,title:"Roti Bakar",price:2.50,emoji:"🍞",desc:"Charcoal toasted bread + butter + kaya"},
    {id:303,title:"Half Boiled Egg",price:1.00,emoji:"🥚",desc:"2 half-boiled eggs"},
    {id:304,title:"Mee Goreng",price:5.00,emoji:"🍜",desc:"Fried noodles"},
  ],
};

function VendorStorefront({listing, allListings, cart, onAdd, onClose, t, isSubscriberVendor}){
  var threshold = listing.freeDeliveryThreshold;
  var cartIds   = cart.map(function(c){ return c.id; });
  var cartFromVendor = cart.filter(function(c){ return c.vendorId===listing.vendorId; });
  var vendorSubtotal = cartFromVendor.reduce(function(s,c){ return s+(c.dealPrice||c.price||0); }, 0);
  var toGo = threshold ? Math.max(0, threshold - vendorSubtotal) : null;
  var freeDelivery = threshold && vendorSubtotal >= threshold;

  // Live deals from this vendor (other than the one just added)
  var otherDeals = allListings.filter(function(l){
    return l.vendorId===listing.vendorId && l.id!==listing.id && !cartIds.includes(l.id);
  });

  // Full menu items (mock; in prod these come from vendor profile)
  var menuItems = MOCK_VENDOR_MENUS[listing.vendorId] || [];

  var [addedIds, setAddedIds] = useState([]);

  function handleAdd(item){
    var cartItem = {
      id: item.id,
      title: item.title,
      dealPrice: item.price,
      vendorId: listing.vendorId,
      vendorName: listing.vendorName,
      emoji: item.emoji,
      freeDeliveryThreshold: listing.freeDeliveryThreshold,
      sharedPool: listing.sharedPool,
      isMenuAdd: true,
    };
    onAdd(cartItem);
    setAddedIds(function(p){ return [...p, item.id]; });
  }

  return(
    <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
      className="fixed inset-0 z-[600] bg-black/70 backdrop-blur-sm flex items-end justify-center"
      onClick={onClose}>
      <motion.div initial={{y:"100%"}} animate={{y:0}} exit={{y:"100%"}}
        transition={{type:"spring",damping:26,stiffness:260}}
        onClick={function(e){e.stopPropagation();}}
        className="w-full max-w-sm bg-[#0d1929] rounded-t-[36px] max-h-[88vh] overflow-y-auto">

        {/* Header */}
        <div className="sticky top-0 bg-[#0d1929] z-10 px-5 pt-5 pb-3 border-b border-white/10">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-white font-black text-lg leading-none">{listing.vendorName}</h2>
              <p className="text-white/40 text-[10px] mt-0.5">Add more items from this vendor</p>
            </div>
            <button onClick={onClose} className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center text-white text-sm flex-shrink-0">✕</button>
          </div>

          {/* Free delivery progress — subscriber vendors only */}
          {threshold&&(
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl px-4 py-3">
              {freeDelivery?(
                <div className="flex items-center gap-2">
                  <span className="text-emerald-400 text-lg">🎉</span>
                  <p className="text-emerald-400 font-black text-xs">Free delivery unlocked!</p>
                </div>
              ):(
                <>
                  <div className="flex justify-between mb-1.5">
                    <p className="text-white/60 text-[10px] font-bold">🚗 Free delivery</p>
                    <p className="text-emerald-400 font-black text-[10px]">RM{vendorSubtotal.toFixed(2)} / RM{threshold.toFixed(2)}</p>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div className="bg-emerald-400 h-2 rounded-full transition-all"
                      style={{width:Math.min(100,(vendorSubtotal/threshold)*100)+'%'}}/>
                  </div>
                  {toGo>0&&<p className="text-white/30 text-[9px] mt-1">Add RM{toGo.toFixed(2)} more for free delivery</p>}
                </>
              )}
            </div>
          )}
        </div>

        <div className="px-5 pb-10 pt-4 space-y-5">

          {/* Other live deals from this vendor */}
          {otherDeals.length>0&&(
            <div>
              <p className="text-white/40 text-[9px] font-black uppercase tracking-widest mb-3">🔥 More deals from {listing.vendorName}</p>
              <div className="space-y-2">
                {otherDeals.map(function(deal){
                  var inCart=cartIds.includes(deal.id);
                  return(
                    <div key={deal.id} className="bg-white/5 border border-white/10 rounded-2xl p-3 flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0 text-2xl overflow-hidden">
                        {deal.image?<img src={deal.image} className="w-full h-full object-cover" alt=""/>:deal.emoji}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-black text-sm truncate">{deal.title}</p>
                        <div className="flex items-center gap-2">
                          <p className="text-emerald-400 font-black text-sm">RM{deal.dealPrice.toFixed(2)}</p>
                          {deal.originalPrice&&<p className="text-white/20 text-[9px] line-through">RM{deal.originalPrice.toFixed(2)}</p>}
                        </div>
                      </div>
                      <button onClick={function(){onAdd(deal);}}
                        disabled={inCart}
                        className={"px-3 py-2 rounded-xl font-black text-[10px] uppercase transition-all flex-shrink-0 "+(inCart?"bg-emerald-500/20 text-emerald-400":"bg-emerald-500 text-white active:scale-95")}>
                        {inCart?"Added ✓":"+ Add"}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Full vendor menu */}
          {menuItems.length>0&&(
            <div>
              <p className="text-white/40 text-[9px] font-black uppercase tracking-widest mb-3">📋 Full menu</p>
              <div className="space-y-2">
                {menuItems.map(function(item){
                  var added=addedIds.includes(item.id)||cartIds.includes(item.id);
                  return(
                    <div key={item.id} className="bg-white/5 border border-white/10 rounded-2xl p-3 flex items-center gap-3">
                      <span className="text-2xl flex-shrink-0">{item.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-black text-sm">{item.title}</p>
                        <p className="text-white/30 text-[9px]">{item.desc}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <p className="text-white font-black text-sm">RM{item.price.toFixed(2)}</p>
                        <button onClick={function(){handleAdd(item);}}
                          disabled={added}
                          className={"w-8 h-8 rounded-xl font-black text-sm transition-all "+(added?"bg-emerald-500/20 text-emerald-400":"bg-white/10 text-white active:scale-95 hover:bg-white/20")}>
                          {added?"✓":"+"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {otherDeals.length===0&&menuItems.length===0&&(
            <div className="text-center py-8">
              <p className="text-4xl mb-3">🏪</p>
              <p className="text-white/40 font-bold text-sm">No other items available right now</p>
            </div>
          )}

          <button onClick={onClose}
            className="w-full bg-emerald-500 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-sm active:scale-95 transition-all">
            Done — View Cart 🛒
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}


// ─── NATIONWIDE AD SYSTEM ─────────────────────────────────────────────────────
// Admin inserts ads here. In production: fetch from /api/ads
// Placement types: "receipt" (post-payment), "feed" (in listing feed)
// Format: image URL or YouTube embed URL
// Revenue: sold to national advertisers per week/month

// ─── AD CONFIG — stored in localStorage, editable via Admin Panel ─────────────
const LS_ADS = 'sapot_nationwide_ads';
const DEFAULT_ADS = {
  receipt: {
    active: false,
    type: "image",
    src: "",
    caption: "",
    ctaLabel: "Learn More",
    ctaUrl: "",
    advertiser: "",
  },
  feed: {
    active: false,
    type: "image",
    src: "",
    caption: "",
    ctaLabel: "Visit Now",
    ctaUrl: "",
    advertiser: "",
  },
};
function getAds(){
  try{ return Object.assign({},DEFAULT_ADS,JSON.parse(localStorage.getItem(LS_ADS)||'{}')); }
  catch(e){ return DEFAULT_ADS; }
}
function saveAds(ads){ localStorage.setItem(LS_ADS, JSON.stringify(ads)); }
// Load ads from Supabase (overrides localStorage if available)
async function loadAdsFromDB(){
  try{
    const ads = await getAdsFromDB();
    if(ads){ localStorage.setItem(LS_ADS, JSON.stringify(ads)); }
  }catch(e){ console.log('Ads load error:',e); }
}

// ── Receipt Ad Slot ──────────────────────────────────────────────────────────
function ReceiptAdSlot(){
  var ads = getAds();
  var ad = ads.receipt;
  var [dismissed, setDismissed] = useState(false);
  if(!ad || !ad.active || !ad.src || dismissed) return null;
  return(
    <div className="mx-5 mb-1">
      <div className="flex items-center justify-between mb-1.5">
        <p className="text-slate-300 text-[8px] font-black uppercase tracking-widest">Sponsored</p>
        <button onClick={()=>setDismissed(true)} className="text-slate-300 text-[9px]">✕</button>
      </div>
      <div className="rounded-2xl overflow-hidden border border-slate-100 shadow-sm">
        {ad.type==="video"?(
          <iframe src={ad.src} className="w-full h-40" frameBorder="0" allow="autoplay; encrypted-media" allowFullScreen title="ad"/>
        ):(
          <img src={ad.src} className="w-full h-32 object-cover" alt={ad.advertiser||"Sponsored"}/>
        )}
        <div className="bg-white px-4 py-3 flex items-center justify-between">
          <div className="flex-1 min-w-0 mr-2">
            <p className="font-black text-xs text-slate-800 truncate">{ad.caption}</p>
            {ad.advertiser&&<p className="text-slate-400 text-[9px]">{ad.advertiser}</p>}
          </div>
          {ad.ctaUrl&&(
            <a href={ad.ctaUrl} target="_blank" rel="noopener noreferrer"
              className="bg-slate-900 text-white text-[9px] font-black px-3 py-2 rounded-xl whitespace-nowrap flex-shrink-0">
              {ad.ctaLabel||"Learn More"}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Feed Banner Ad ────────────────────────────────────────────────────────────
function FeedBannerAd(){
  var ads = getAds();
  var ad = ads.feed;
  var [dismissed, setDismissed] = useState(false);
  if(!ad || !ad.active || !ad.src || dismissed) return null;
  return(
    <div className="mx-4 my-2 rounded-2xl overflow-hidden border border-slate-200 shadow-sm relative">
      <div className="absolute top-2 left-2 bg-black/50 backdrop-blur-sm px-2 py-0.5 rounded-full">
        <p className="text-white text-[7px] font-black uppercase tracking-widest">Sponsored</p>
      </div>
      <button onClick={()=>setDismissed(true)}
        className="absolute top-2 right-2 w-6 h-6 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white text-[9px]">✕</button>
      {ad.type==="video"?(
        <iframe src={ad.src} className="w-full h-36" frameBorder="0" allow="autoplay; encrypted-media" allowFullScreen title="ad"/>
      ):(
        <img src={ad.src} className="w-full h-28 object-cover" alt={ad.advertiser||"Sponsored"}/>
      )}
      <div className="bg-white px-3 py-2.5 flex items-center justify-between">
        <div className="flex-1 min-w-0 mr-2">
          <p className="font-bold text-xs text-slate-700 truncate">{ad.caption}</p>
          {ad.advertiser&&<p className="text-slate-400 text-[8px]">{ad.advertiser}</p>}
        </div>
        {ad.ctaUrl&&(
          <a href={ad.ctaUrl} target="_blank" rel="noopener noreferrer"
            className="bg-emerald-500 text-white text-[9px] font-black px-3 py-1.5 rounded-xl whitespace-nowrap flex-shrink-0 active:scale-95 transition-transform">
            {ad.ctaLabel||"Visit Now"}
          </a>
        )}
      </div>
    </div>
  );
}

function CartPanel({cart,onRemove,onClose,onCheckout,allListings,onAdd,t}){
  const [deliveryMode, setDeliveryMode]=useState("pickup");
  const [paying, setPaying]=useState(false);
  const [success, setSuccess]=useState(false);
  const [topupTarget, setTopupTarget]=useState(null);
  const [pickupCode]=useState(()=>Math.random().toString(36).slice(2,8).toUpperCase());

  const subtotal=cart.reduce((s,i)=>s+i.dealPrice,0);
  const cartIds=cart.map(i=>i.id);

  // Build per-vendor status — shared pool vendors use total cart, own-only use per-vendor subtotal
  const vendorGroups=cart.reduce((acc,item)=>{
    // Use vendorId+vendorName combo as key to avoid collisions between mock and real listings
    var key = (item.vendorId||'')+'_'+(item.vendorName||'');
    if(!acc[key]) acc[key]={vendorId:item.vendorId,vendorName:item.vendorName,items:[],threshold:item.freeDeliveryThreshold,sharedPool:item.sharedPool};
    acc[key].items.push(item);return acc;
  },{});
  const vendorStatus=Object.values(vendorGroups).map(v=>{
    const vSubtotal=v.items.reduce((s,i)=>s+i.dealPrice,0);
    const effectiveTotal=v.sharedPool?subtotal:vSubtotal;
    const hasThreshold=v.threshold!=null;
    const unlocked=hasThreshold&&effectiveTotal>=v.threshold;
    const toGo=hasThreshold?Math.max(0,v.threshold-effectiveTotal):null;
    return{...v,vSubtotal,effectiveTotal,hasThreshold,unlocked,toGo};
  });

  const anyUnlocked=vendorStatus.some(v=>v.unlocked);
  const deliveryCost=deliveryMode==="pickup"?0:vendorStatus.reduce((s,v)=>v.unlocked?s:s+DELIVERY_FEE,0);
  const total=subtotal+deliveryCost;

  return(
    <>
      <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
        className="fixed inset-0 z-[300] bg-black/80 backdrop-blur-md flex items-end justify-center"
        onClick={!success&&!topupTarget?onClose:undefined}>
        <motion.div initial={{y:"100%"}} animate={{y:0}} exit={{y:"100%"}}
          transition={{type:"spring",damping:28,stiffness:280}}
          onClick={e=>e.stopPropagation()}
          className="w-full max-w-sm bg-white rounded-t-[36px] overflow-hidden max-h-[92vh] flex flex-col">
          <AnimatePresence mode="wait">
            {success?(
              <motion.div key="ok" initial={{opacity:0,scale:0.95}} animate={{opacity:1,scale:1}}
                className="flex flex-col overflow-y-auto max-h-[88vh]">
                {/* Receipt header */}
                <div className="p-7 pb-4 text-center">
                  <motion.div initial={{scale:0}} animate={{scale:1}} transition={{type:"spring",delay:0.1}} className="text-6xl mb-3">🎉</motion.div>
                  <h2 className="font-black text-2xl mb-1">{t.orderPlaced}</h2>
                  <p className="text-slate-500 text-sm">{deliveryMode==="delivery"?t.deliveryNote:t.pickupNote}</p>
                </div>
                {/* Pickup code */}
                <div className="mx-5 bg-emerald-50 border-2 border-emerald-200 border-dashed rounded-2xl p-5 mb-4 text-center">
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">{t.pickupCode}</p>
                  <p className="text-emerald-600 font-black text-4xl tracking-[8px]">{pickupCode}</p>
                </div>
                {/* Order items */}
                <div className="mx-5 bg-slate-50 rounded-2xl p-4 mb-4 space-y-2">
                  {cart.map(function(item,i){
                    return(
                      <div key={i} className="flex justify-between items-center py-1 border-b border-slate-100 last:border-0">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{item.emoji||"🍱"}</span>
                          <div>
                            <p className="font-bold text-xs text-slate-800 leading-none">{item.title}</p>
                            <p className="text-slate-400 text-[9px]">{item.vendorName}</p>
                          </div>
                        </div>
                        <p className="font-black text-xs text-emerald-600">RM{fmtRM(item.dealPrice)}</p>
                      </div>
                    );
                  })}
                  <div className="pt-2 space-y-1">
                    <div className="flex justify-between text-xs"><span className="text-slate-400">{t.subtotal}</span><span className="font-bold">RM{fmtRM(subtotal)}</span></div>
                    <div className="flex justify-between text-xs"><span className="text-slate-400">{t.deliveryFee}</span><span className="font-bold">{deliveryCost===0?t.free:`RM${fmtRM(deliveryCost)}`}</span></div>
                    <div className="h-px bg-slate-200 my-1"/>
                    <div className="flex justify-between text-sm"><span className="font-black text-slate-900">{t.total}</span><span className="font-black text-emerald-600 text-base">RM{fmtRM(total)}</span></div>
                  </div>
                </div>
                {/* ── RECEIPT AD SLOT ── nationwide ad inserted by admin ── */}
                <ReceiptAdSlot/>
                {/* Action buttons */}
                <div className="mx-5 mb-8 mt-4 space-y-3">
                  <button onClick={()=>{onCheckout({itemName:(cart[0]&&cart[0].title),vendorName:(cart[0]&&cart[0].vendorName),pickupCode,deliveryMode});onClose();}}
                    className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs">
                    {t.goPickup}
                  </button>
                  <button onClick={()=>onClose()}
                    className="w-full bg-emerald-500 text-white py-3 rounded-2xl font-black uppercase tracking-widest text-xs">
                    🛍️ Continue Shopping
                  </button>
                </div>
              </motion.div>
            ):(
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
                      {vendorStatus.length>1&&(
                        <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 flex gap-2 items-start">
                          <span className="flex-shrink-0">⚠️</span>
                          <p className="text-amber-700 text-xs font-bold">{fill(t.multiVendorWarn,vendorStatus.length)}</p>
                        </div>
                      )}
                      {/* Shared pool note if any vendor uses it */}
                      {vendorStatus.some(v=>v.sharedPool)&&(
                        <div className="bg-indigo-50 border border-indigo-100 rounded-2xl px-4 py-3 flex gap-2 items-center">
                          <span className="text-lg flex-shrink-0">✨</span>
                          <p className="text-indigo-700 text-xs font-bold">
                            {fill(t.sharedPoolNote, vendorStatus.filter(v=>v.sharedPool).map(v=>v.vendorName).join(", "))}
                          </p>
                        </div>
                      )}
                      {/* Per-vendor delivery progress bars */}
                      {vendorStatus.map(v=>(
                        <div key={v.vendorId}
                          onClick={v.hasThreshold&&!v.unlocked?()=>setTopupTarget(v):undefined}
                          className={`rounded-2xl border overflow-hidden transition-colors ${v.unlocked?"bg-emerald-50 border-emerald-200":v.hasThreshold?"bg-slate-50 border-slate-200 cursor-pointer active:bg-slate-100":"bg-slate-50 border-slate-100"}`}>
                          <div className="px-4 py-3">
                            <div className="flex justify-between items-center mb-1.5">
                              <div className="flex items-center gap-1.5">
                                <p className="text-[10px] font-black uppercase tracking-wider text-slate-600">🏪 {v.vendorName}</p>
                                {v.sharedPool&&<span className="text-[8px] font-black text-indigo-500 bg-indigo-50 border border-indigo-200 px-1.5 py-0.5 rounded-full">✨ Shared</span>}
                              </div>
                              <p className={`text-[10px] font-black ${v.unlocked?"text-emerald-600":"text-slate-400"}`}>
                                {v.sharedPool?`RM${fmtRM(subtotal)} total`:`RM${fmtRM(v.vSubtotal)}`}
                              </p>
                            </div>
                            {v.hasThreshold?(
                              <>
                                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mb-1.5">
                                  <motion.div className={`h-full rounded-full ${v.unlocked?"bg-emerald-500":v.sharedPool?"bg-indigo-400":"bg-emerald-400"}`}
                                    animate={{width:`${Math.min((v.effectiveTotal/v.threshold)*100,100)}%`}} transition={{duration:0.6}}/>
                                </div>
                                {v.unlocked?(
                                  <p className="text-[9px] font-bold text-emerald-600">{t.freeDeliveryUnlocked}</p>
                                ):(
                                  <div className="flex items-center justify-between">
                                    <p className="text-[9px] font-bold text-slate-500">
                                      {v.sharedPool?fill(t.addMoreShared,fmtRM(v.toGo)):fill(t.addMoreForFree,fmtRM(v.toGo))}
                                    </p>
                                    <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">{t.tapToTopup}</span>
                                  </div>
                                )}
                              </>
                            ):<p className="text-[9px] font-bold text-slate-400">{t.noThreshold}</p>}
                          </div>
                        </div>
                      ))}
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
                    </div>
                    <div className="px-5 pb-8 pt-4 border-t border-slate-100 flex-shrink-0 space-y-4 bg-white">
                      <div className="grid grid-cols-2 gap-2">
                        {[{id:"pickup",icon:"🚶",title:t.selfPickup,desc:t.selfPickupDesc},{id:"delivery",icon:"🛵",title:t.delivery,desc:anyUnlocked?t.deliveryPaid:t.deliveryUserPays,badge:anyUnlocked?t.free:null}].map(opt=>(
                          <button key={opt.id} onClick={()=>setDeliveryMode(opt.id)}
                            className={`p-3 rounded-2xl border-2 text-left transition-all ${deliveryMode===opt.id?"border-emerald-500 bg-emerald-50":"border-slate-100 bg-slate-50"}`}>
                            <div className="text-xl mb-1">{opt.icon}</div>
                            <p className={`font-black text-[11px] ${deliveryMode===opt.id?"text-emerald-700":"text-slate-700"}`}>{opt.title}</p>
                            <p className="text-[9px] text-slate-400 leading-tight mt-0.5">{opt.desc}</p>
                            {opt.badge&&<span className="text-[8px] font-black text-emerald-600 bg-emerald-100 px-1.5 py-0.5 rounded-full mt-1 inline-block">{opt.badge}!</span>}
                          </button>
                        ))}
                      </div>
                      <div className="bg-slate-50 rounded-2xl px-4 py-3 space-y-1.5">
                        <div className="flex justify-between text-xs"><span className="text-slate-400">{t.subtotal}</span><span className="font-bold">RM{fmtRM(subtotal)}</span></div>
                        <div className="flex justify-between text-xs"><span className="text-slate-400">{t.deliveryFee}</span>
                          <span className={`font-bold ${deliveryCost===0?"text-emerald-600":""}`}>{deliveryMode==="pickup"?t.free:deliveryCost===0?`${t.free} 🎉`:`RM${fmtRM(deliveryCost)}`}</span>
                        </div>
                        <div className="h-px bg-slate-200"/>
                        <div className="flex justify-between text-sm"><span className="font-black text-slate-900">{t.total}</span><span className="font-black text-emerald-600 text-base">RM{fmtRM(total)}</span></div>
                      </div>
                      <button onClick={async()=>{
        setPaying(true);
        try{
          // Save to localStorage for offline access
          cart.forEach(item=>{
            saveOrderToHistory({
              id: Date.now()+Math.random(),
              itemName:   item.title,
              vendorName: item.vendorName,
              emoji:      item.emoji||'🍱',
              amount:     item.dealPrice,
              pickupCode,
              deliveryMode,
              orderedAt:  new Date().toISOString(),
            });
          });
          // Save to Supabase
          const session = await supabase.auth.getSession();
          const buyerId = session.data.session?.user?.id || null;
          await Promise.all(cart.map(item=>
            createOrder({
              buyer_id:    buyerId,
              listing_id:  item.fromDB ? item.id : null,
              vendor_id:   item.vendorSbId || null,
              item_name:   item.title,
              vendor_name: item.vendorName,
              amount:      item.dealPrice,
              delivery_mode: deliveryMode,
              pickup_code: pickupCode,
              status:      'confirmed',
            })
          ));
        }catch(err){
          console.error('Order save error:',err);
        }finally{
          setPaying(false);setSuccess(true);
        }
      }} disabled={paying||cart.length===0}
                        className="w-full bg-[#1a6ef5] text-white py-4 rounded-2xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-2 active:scale-95 transition-transform shadow-lg shadow-blue-200">
                        {paying?<><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>{t.processingTNG}</>:t.checkoutTNG}
                      </button>
                    </div>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
      <AnimatePresence>
        {topupTarget&&<TopupSheet vendor={topupTarget} allListings={allListings} cart={cart} onAdd={onAdd} onClose={()=>setTopupTarget(null)} t={t}/>}
      </AnimatePresence>
    </>
  );
}

// ─── VENDOR SETTINGS PANEL ───────────────────────────────────────────────────
function VendorSettingsPanel({profile,onSave,onClose,t}){
  const [p, setP]=useState(profile);
  const [saved, setSaved]=useState(false);
  const upd=(k,v)=>setP(prev=>({...prev,[k]:v}));
  const handleSave=()=>{onSave(p);setSaved(true);setTimeout(()=>{setSaved(false);onClose();},1200);};
  return(
    <motion.div initial={{x:"100%"}} animate={{x:0}} exit={{x:"100%"}} transition={{type:"spring",damping:28,stiffness:300}}
      className="fixed inset-0 z-[200] bg-[#0a0f1e] flex flex-col">
      <div className="flex items-center justify-between p-5 border-b border-white/10">
        <div><h2 className="text-white font-black text-lg">{t.vendorSettings}</h2><p className="text-white/40 text-xs">{t.vendorSettingsDesc}</p></div>
        <button onClick={onClose} className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center text-white">✕</button>
      </div>
      <div className="flex-1 overflow-y-auto p-5 space-y-5">

        {/* Free delivery toggle */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex-1 pr-4"><p className="text-white font-black text-sm">{t.offerFreeDelivery}</p><p className="text-white/40 text-xs mt-0.5">{t.thresholdDesc}</p></div>
            <button onClick={()=>upd("freeDeliveryThreshold",p.freeDeliveryThreshold?null:25)}
              className={`w-12 h-6 rounded-full relative flex-shrink-0 transition-colors ${p.freeDeliveryThreshold?"bg-emerald-500":"bg-white/20"}`}>
              <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 shadow transition-all ${p.freeDeliveryThreshold?"left-6":"left-0.5"}`}/>
            </button>
          </div>
          <AnimatePresence>
            {p.freeDeliveryThreshold&&(
              <motion.div initial={{opacity:0,height:0}} animate={{opacity:1,height:"auto"}} exit={{opacity:0,height:0}} className="overflow-hidden space-y-3">
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 font-black text-sm">RM</span>
                  <input type="number" value={p.freeDeliveryThreshold} onChange={e=>upd("freeDeliveryThreshold",parseFloat(e.target.value)||null)}
                    className="w-full bg-white/5 border border-emerald-500/40 rounded-xl pl-10 pr-4 py-3 text-emerald-400 text-lg font-black focus:border-emerald-500 focus:outline-none"/>
                </div>
                <div className="flex gap-2">
                  {["15","20","25","30","50"].map(v=>(
                    <button key={v} onClick={()=>upd("freeDeliveryThreshold",parseFloat(v))}
                      className={`flex-1 py-2 rounded-xl text-[10px] font-black transition-all ${p.freeDeliveryThreshold===parseFloat(v)?"bg-emerald-500 text-white":"bg-white/5 text-white/40 border border-white/10"}`}>
                      RM{v}
                    </button>
                  ))}
                </div>
                {/* Shared pool option */}
                <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex-1 pr-3">
                      <p className="text-white font-black text-xs">✨ {t.sharedPoolLabel}</p>
                      <p className="text-white/40 text-[10px] mt-0.5">{t.sharedPoolDesc}</p>
                    </div>
                    <button onClick={()=>upd("sharedPool",!p.sharedPool)}
                      className={`w-10 h-5 rounded-full relative flex-shrink-0 transition-colors ${p.sharedPool?"bg-indigo-500":"bg-white/20"}`}>
                      <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 shadow transition-all ${p.sharedPool?"left-5":"left-0.5"}`}/>
                    </button>
                  </div>
                  {p.sharedPool&&<p className="text-amber-300 text-[9px] font-bold">⚠️ {t.sharedPoolNote2}</p>}
                </div>
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 flex gap-2">
                  <span className="flex-shrink-0">⚠️</span>
                  <p className="text-amber-300 text-[10px] font-bold">{t.thresholdWarning}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Shop hours */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
          <p className="text-white font-black text-sm mb-1">🕐 {t.vendorHours}</p>
          <p className="text-white/40 text-xs mb-4">{t.vendorHoursDesc}</p>
          <div className="grid grid-cols-2 gap-3">
            <div><p className="text-white/40 text-[9px] font-black uppercase tracking-widest mb-1.5">{t.openTime}</p><input type="time" value={p.openTime||"09:00"} onChange={e=>upd("openTime",e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm font-bold focus:outline-none focus:border-emerald-500"/></div>
            <div><p className="text-white/40 text-[9px] font-black uppercase tracking-widest mb-1.5">{t.closeTime}</p><input type="time" value={p.closeTime||"22:00"} onChange={e=>upd("closeTime",e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm font-bold focus:outline-none focus:border-emerald-500"/></div>
          </div>
        </div>
        {/* Notification radius */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
          <p className="text-white font-black text-sm mb-1">🔔 {t.notifRadiusLabel}</p>
          <p className="text-white/40 text-xs mb-4">{t.notifRadiusDesc}</p>
          <div className="flex gap-2">
            {[3,5,10,15,20].map(r=>(
              <button key={r} onClick={()=>upd("notifRadius",r)}
                className={`flex-1 py-2.5 rounded-xl text-[10px] font-black transition-all ${(p.notifRadius||DEFAULT_RADIUS)===r?"bg-indigo-500 text-white":"bg-white/5 text-white/40 border border-white/10"}`}>
                {r}km
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="p-5 border-t border-white/10">
        <button onClick={handleSave}
          className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest text-sm transition-all ${saved?"bg-emerald-400 text-white":"bg-emerald-500 text-white active:scale-95"}`}>
          {saved?t.settingsSaved:t.saveSettings}
        </button>
      </div>
    </motion.div>
  );
}

// ─── BUYER FEED ───────────────────────────────────────────────────────────────
function BuyerFeed({vendorListings,sbListings=[],activeTab,notifQueue,onNotifView,t,userLocation,locationHook}){
  const scrollRef=useRef(null);
  const savedScroll=useRef(0);
  // Save scroll when leaving, restore when returning
  useEffect(function(){
    var el=scrollRef.current;
    if(!el) return;
    el.scrollTop=savedScroll.current;
    var onScroll=function(){ savedScroll.current=el.scrollTop; };
    el.addEventListener('scroll',onScroll);
    return function(){ el.removeEventListener('scroll',onScroll); };
  },[activeTab]);

  const [search, setSearch]=useState("");

  // Show video ad inlay 1.2s after user types a search query
  useEffect(function(){
    if(adTimerRef.current) clearTimeout(adTimerRef.current);
    if(!search || search.trim()===''){
      setCurrentAd(null);
      return;
    }
    adTimerRef.current = setTimeout(function(){
      const terms = expandSearch(search);
      const ad = shouldShowAd(search, terms);
      if(ad) setCurrentAd(ad);
    }, 1200);
    return function(){ clearTimeout(adTimerRef.current); };
  }, [search]);
  const [halalFilter, setHalalFilter]=useState("halal_any");
  const [catFilter, setCatFilter]=useState("all");
  const [typeFilter, setTypeFilter]=useState("all");
  const [cart, setCart]=useState([]);
  const [showCart, setShowCart]=useState(false);
  const [orderConfirmed, setOrderConfirmed]=useState(null);   // {itemName,vendorName,pickupCode}
  const [outOfStockItem, setOutOfStockItem]=useState(null);   // {itemName,vendorName}
  const [currentAd, setCurrentAd]=useState(null);            // video ad inlay
  const adTimerRef=useRef(null);

  const isStudentMode=activeTab==="student";

  // Haversine — recalculates every time user location updates
  const hav=(la1,lo1,la2,lo2)=>{
    const R=6371; const dL=(la2-la1)*Math.PI/180; const dO=(lo2-lo1)*Math.PI/180;
    const a=Math.sin(dL/2)**2+Math.cos(la1*Math.PI/180)*Math.cos(la2*Math.PI/180)*Math.sin(dO/2)**2;
    return+(R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a))).toFixed(1);
  };

  const calcDist=(l)=>{
    if(!userLocation) return l.distance||null;
    const geo=MOCK_VENDORS_GEO[l.vendorId];
    if(!geo) return l.distance||null;
    return hav(userLocation.lat,userLocation.lon,geo.lat,geo.lon);
  };

  const allListings=[...sbListings,...MOCK_LISTINGS,...vendorListings].filter((l,i,a)=>a.findIndex(x=>x.id===l.id)===i).map(l=>({
    ...l,
    distance: calcDist(l),
  }));
  const cartTotal=cart.reduce((s,i)=>s+i.dealPrice,0);
  const cartIds=cart.map(i=>i.id);

  // Per-vendor cart totals for topup banners
  const cartVendorTotals=cart.reduce((acc,item)=>{
    if(!acc[item.vendorId]) acc[item.vendorId]={vSubtotal:0,threshold:item.freeDeliveryThreshold,sharedPool:item.sharedPool};
    acc[item.vendorId].vSubtotal+=item.dealPrice; return acc;
  },{});

  const getCartTopupBanner=l=>{
    const vs=cartVendorTotals[l.vendorId];
    if(!vs||!vs.threshold) return null;
    const effective=vs.sharedPool?cartTotal:vs.vSubtotal;
    const toGo=Math.max(0,vs.threshold-effective);
    if(toGo<=0) return null;
    return vs.sharedPool
      ? fill(t.cartTopupSharedBanner,fmtRM(toGo),l.vendorName)
      : fill(t.cartTopupBanner,fmtRM(toGo),l.vendorName);
  };

  const searchTerms = search ? expandSearch(search) : [];
  const filtered=allListings.filter(l=>{
    if(isStudentMode) return l.studentPrice!=null;
    const ms=search===''||matchesSearch(l, searchTerms);
    const mh=halalFilter==="halal_all"?true:halalFilter==="halal_any"?l.halal>0:halalFilter==="halal_cert"?l.halal===1:l.halal===2;
    const mc=catFilter==="all"||l.category===catFilter;
    const mt=typeFilter==="all"||l.type===typeFilter||(typeFilter==="limited"&&(l.type==="surplus"||l.type==="limited"));
    return ms&&mh&&mc&&mt;
  });

  const urgentDeals=filtered.filter(l=>!isStudentMode&&l.qty&&(l.qty-l.claimed)<=3&&l.claimed<l.qty);
  const regular=filtered.filter(l=>!urgentDeals.find(u=>u.id===l.id));

  const [storefrontListing, setStorefrontListing]=useState(null); // open vendor storefront after add to cart

  const addToCart=item=>{
    if(cartIds.includes(item.id)) return;
    if(item.qty && item.claimed >= item.qty){
      setOutOfStockItem({itemName:item.title, vendorName:item.vendorName});
      return;
    }
    setCart(prev=>[...prev,item]);
    // Open vendor storefront ONLY if vendor is a subscriber — skip for menu adds
    if(!item.isMenuAdd && item.vendorSubscribed){
      setTimeout(function(){ setStorefrontListing(item); }, 300);
    }
  };
  const removeFromCart=idx=>setCart(prev=>prev.filter((_,i)=>i!==idx));

  return(
    <div className="min-h-screen bg-slate-50 pb-28">
      {/* Location prompt — shows until user grants GPS or types area */}
      {locationHook&&<LocationPrompt locationHook={locationHook} t={t}/>}
      {/* Halal notice strip — always visible */}
      <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 flex items-center gap-2">
        <span className="text-sm flex-shrink-0">⚠️</span>
        <p className="text-amber-700 text-[10px] font-bold">{t.halalSelfDeclared}. Sapot Lokal does not verify halal status.</p>
      </div>

      {/* Notification toast — sits inside feed area */}
      <AnimatePresence>
        {notifQueue.length>0&&(
          <NotifToast listing={notifQueue[0]} t={t} onDismiss={()=>onNotifView("dismiss")} onView={()=>onNotifView("view")}/>
        )}
        {orderConfirmed&&(
          <OrderConfirmedToast order={orderConfirmed} t={t} onDismiss={()=>setOrderConfirmed(null)}/>
        )}
        {outOfStockItem&&(
          <OutOfStockToast itemName={outOfStockItem.itemName} vendorName={outOfStockItem.vendorName} onDismiss={()=>setOutOfStockItem(null)}/>
        )}
      </AnimatePresence>

      {/* Video ad inlay — appears after search, bottom-right floating */}
      <AnimatePresence>
        {currentAd&&(
          <VideoAdInlay
            ad={currentAd}
            t={t}
            onDismiss={function(){ setCurrentAd(null); }}
          />
        )}
      </AnimatePresence>

      {/* Filters (main tab only) */}
      {!isStudentMode&&(
        <div className="bg-white border-b border-slate-100 px-4 pt-3 pb-3 sticky top-[60px] z-40">
          <div className="relative mb-3">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
            <input type="text" value={search} onChange={e=>setSearch(e.target.value)} placeholder="🔍 Search food or shop name..."
              className="w-full bg-slate-100 rounded-2xl pl-9 pr-4 py-2.5 text-sm font-medium outline-none focus:ring-2 focus:ring-emerald-400"/>
          </div>
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 mb-2">
            {[{id:"all",label:t.allCat},{id:"limited",label:t.surplusTag},{id:"promo",label:t.promoTag},{id:"special",label:t.specialTag}].map(f=>(
              <button key={f.id} onClick={()=>setTypeFilter(f.id)}
                className={`whitespace-nowrap px-3.5 py-1.5 rounded-full text-[10px] font-black uppercase border flex-shrink-0 transition-all ${typeFilter===f.id?"bg-slate-900 text-white border-slate-900":"bg-white border-slate-200 text-slate-500"}`}>{f.label}</button>
            ))}
          </div>
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {[{id:"halal_any",label:"Halal"},{id:"halal_cert",label:"Certified"},{id:"muslim_owned",label:"Muslim-Owned"},{id:"halal_all",label:"Show All"}].map(f=>(
              <button key={f.id} onClick={()=>setHalalFilter(f.id)}
                className={`whitespace-nowrap px-3.5 py-1.5 rounded-full text-[10px] font-black uppercase border flex-shrink-0 transition-all ${halalFilter===f.id?"bg-emerald-600 text-white border-emerald-600":"bg-white border-slate-200 text-slate-500"}`}>{f.label}</button>
            ))}
            <div className="w-px bg-slate-200 flex-shrink-0 mx-1"/>
            {CATEGORIES.map(c=>(
              <button key={c} onClick={()=>setCatFilter(c)}
                className={`whitespace-nowrap px-3.5 py-1.5 rounded-full text-[10px] font-black uppercase border flex-shrink-0 transition-all ${catFilter===c?"bg-slate-700 text-white border-slate-700":"bg-white border-slate-200 text-slate-500"}`}>
                {c}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="px-4 pt-4 space-y-6">
        {/* Student corner header */}
        {isStudentMode&&(
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 rounded-3xl p-5">
            <h2 className="font-black text-indigo-900 text-xl mb-1">{t.studentCornerTitle}</h2>
            <p className="text-indigo-600 text-xs leading-relaxed">{t.studentCornerDesc}</p>
          </div>
        )}

        {urgentDeals.length>0&&(
          <section>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"/>
              <h2 className="text-base font-black text-slate-900">{t.almostGone}</h2>
              <span className="bg-red-100 text-red-600 text-[9px] font-black px-2 py-0.5 rounded-full uppercase">{urgentDeals.length} {t.item}</span>
            </div>
            <div className="grid gap-4">
              {urgentDeals.map(l=><ListingCard key={l.id} listing={l} onAddToCart={addToCart} inCart={cartIds.includes(l.id)} cartTopupBanner={getCartTopupBanner(l)} isStudentMode={false} t={t}/>)}
            </div>
          </section>
        )}

        <section>
          {!isStudentMode&&(
            <h2 className="text-base font-black text-slate-900 mb-3">
              {search||catFilter!=="all"||typeFilter!=="all"?fill(t.searchResults,regular.length):t.nearbyDeals}
            </h2>
          )}
          {regular.length===0&&urgentDeals.length===0?(
            <div className="text-center py-20 px-8">
              <p className="text-5xl mb-3">{isStudentMode?"🎓":search||catFilter!=="all"||typeFilter!=="all"?"🔍":"🍽️"}</p>
              <p className="text-slate-600 font-black text-base">
                {isStudentMode?t.studentCornerEmpty
                 :search||catFilter!=="all"||typeFilter!=="all"?t.noDeals
                 :t.noDealsArea}
              </p>
              <p className="text-slate-400 text-sm mt-2">
                {isStudentMode?t.studentCornerEmptySub
                 :search||catFilter!=="all"||typeFilter!=="all"?t.tryFilter
                 :fill(t.noDealsAreaSub,(userLocation && userLocation.area)||"your area")}
              </p>
              {!isStudentMode&&!search&&catFilter==="all"&&typeFilter==="all"&&(
                <button onClick={()=>locationHook && locationHook.request()}
                  className="mt-5 bg-emerald-50 border border-emerald-200 text-emerald-700 font-black text-xs px-5 py-3 rounded-2xl uppercase tracking-widest active:scale-95 transition-transform">
                  📍 {t.changeLocation}
                </button>
              )}
            </div>
          ):(
            <div className="grid gap-4">
              {regular.map(function(l,idx){
                return(
                  <React.Fragment key={l.id}>
                    {idx===3&&<FeedBannerAd/>}
                    <ListingCard listing={l} onAddToCart={addToCart} inCart={cartIds.includes(l.id)} cartTopupBanner={getCartTopupBanner(l)} isStudentMode={isStudentMode} t={t}/>
                  </React.Fragment>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* Floating cart button */}
      <AnimatePresence>
        {cart.length>0&&(
          <motion.div initial={{y:100,opacity:0}} animate={{y:0,opacity:1}} exit={{y:100,opacity:0}}
            className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-sm">
            <button onClick={()=>setShowCart(true)}
              className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black flex items-center justify-between px-5 shadow-2xl shadow-slate-900/40 active:scale-95 transition-transform">
              <div className="flex items-center gap-3">
                <div className="bg-emerald-500 text-white w-7 h-7 rounded-full flex items-center justify-center text-xs font-black">{cart.length}</div>
                <span className="text-sm uppercase tracking-widest">{t.cart}</span>
              </div>
              <span className="text-emerald-400 font-black text-base">RM{fmtRM(cartTotal)}</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Vendor Storefront — opens after Add to Cart */}
      <AnimatePresence>
        {storefrontListing&&(
          <VendorStorefront
            listing={storefrontListing}
            allListings={allListings}
            cart={cart}
            onAdd={addToCart}
            onClose={()=>setStorefrontListing(null)}
            t={t}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showCart&&(
          <CartPanel cart={cart} onRemove={removeFromCart} onClose={()=>setShowCart(false)}
            onCheckout={(info)=>{setOrderConfirmed(info);setCart([]);setShowCart(false);}} onAdd={addToCart} allListings={allListings} t={t}/>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── VENDOR FLOW ──────────────────────────────────────────────────────────────

// ─── VENDOR SALES DASHBOARD ────────────────────────────────────────────────────
const LS_SALES = 'sapot_sales_log'; // [{itemName, amount, net, ts}]
function getSalesLog(){ try{ return JSON.parse(localStorage.getItem(LS_SALES)||'[]'); }catch(e){ return []; } }
function addSaleLog(item){ 
  try{
    const log = getSalesLog();
    log.unshift(item);
    localStorage.setItem(LS_SALES, JSON.stringify(log.slice(0,100)));
  }catch(e){}
}

function VendorDashboard({activePosts, t}){
  const sales = getSalesLog();
  const today = new Date().toDateString();
  const todaySales = sales.filter(function(s){ return new Date(s.ts).toDateString()===today; });
  const todayRevenue = todaySales.reduce(function(a,s){ return a+s.net; }, 0);
  const totalRevenue = sales.reduce(function(a,s){ return a+s.net; }, 0);
  const totalOrders  = sales.length;

  return(
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <p className="text-white/40 text-[9px] font-black uppercase tracking-widest">📊 Your Dashboard</p>
        <p className="text-white/20 text-[9px]">{activePosts.length}/3 posts live</p>
      </div>
      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-3 text-center">
          <p className="text-emerald-400 font-black text-lg">RM{todayRevenue.toFixed(2)}</p>
          <p className="text-white/30 text-[8px] font-bold uppercase mt-0.5">Today</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-3 text-center">
          <p className="text-white font-black text-lg">RM{totalRevenue.toFixed(2)}</p>
          <p className="text-white/30 text-[8px] font-bold uppercase mt-0.5">All Time</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-3 text-center">
          <p className="text-white font-black text-lg">{totalOrders}</p>
          <p className="text-white/30 text-[8px] font-bold uppercase mt-0.5">Orders</p>
        </div>
      </div>
      {todaySales.length>0&&(
        <div className="bg-white/5 border border-white/10 rounded-2xl p-3">
          <p className="text-white/30 text-[8px] font-black uppercase mb-2">Recent orders today</p>
          {todaySales.slice(0,3).map(function(s,i){
            return(
              <div key={i} className="flex items-center justify-between py-1.5 border-b border-white/5 last:border-0">
                <p className="text-white/70 text-[10px] font-bold truncate flex-1">{s.itemName}</p>
                <p className="text-emerald-400 text-[10px] font-black ml-2">+RM{s.net.toFixed(2)}</p>
              </div>
            );
          })}
        </div>
      )}
      {totalOrders===0&&(
        <div className="bg-white/5 border border-white/10 rounded-2xl p-3 text-center">
          <p className="text-white/20 text-[10px] font-bold">No sales yet — post your first deal below 👇</p>
        </div>
      )}
    </div>
  );
}

function VendorFlow({onNewListing,onPostSuccess,trial,t,vendorProfile,onUpdateProfile,vendorMeta,locationHook}){
  const [step, setStep]=useState(1);
  const [postType, setPostType]=useState(null);
  const [template, setTemplate]=useState(null);
  const [photo, setPhoto]=useState(null);
  const [photoBlurry, setPhotoBlurry]=useState(false);
  const [photoChecking, setPhotoChecking]=useState(false);
  const [uploading, setUploading]=useState(false);
  const [publishing, setPublishing]=useState(false);
  const [showPast, setShowPast]=useState(false);
  const [showSuccess, setShowSuccess]=useState(false);
  const [showSettings, setShowSettings]=useState(false);
  const [successPost, setSuccessPost]=useState(null);
  const [activePosts, setActivePosts]=useState([]);
  const [timeMode, setTimeMode]=useState("stock");   // "stock" | "hours" | "schedule"
  const [quickHours, setQuickHours]=useState(3);
  const [form, setForm]=useState({title:"",desc:"",price:"",original:"",studentPrice:"",hasStudentPrice:false,endTime:"",qty:"",reheat:"none",halal:null});
  const [cancelTarget, setCancelTarget]=useState(null);  // post id to confirm cancel
  const [showSubGate, setShowSubGate]=useState(false);   // subscription payment sheet
  const upd=(k,v)=>setForm(p=>({...p,[k]:v}));
  // computedEnd: null = while stock lasts, otherwise HH:MM string
  const computedEnd=
    timeMode==="stock"    ? null
    :timeMode==="hours"   ? addHours(getNow(),quickHours)
    :vendorProfile.closeTime||"22:00"; // schedule = closing time
  const MAX_ACTIVE_POSTS = 3;
  const trialBlocked = trial && trial.status==='expired';
  const maxPostsBlocked = activePosts.length >= MAX_ACTIVE_POSTS;
  const canPublish=form.title&&form.price&&photo&&!photoBlurry&&!photoChecking&&form.halal!==null&&!trialBlocked&&!maxPostsBlocked;
  const radius=vendorProfile.notifRadius||DEFAULT_RADIUS;

  const postTypes=[
    {id:"limited",icon:"♻️",title:t.surplusType,desc:t.surplusDesc,border:"border-orange-500/30"},
    {id:"promo",  icon:"⚡",title:t.promoType,  desc:t.promoDesc,  border:"border-blue-500/30"},
    {id:"special",icon:"🌟",title:t.specialType,desc:t.specialDesc,border:"border-purple-500/30"}
  ];

  const handlePhoto=e=>{
    const file=(e.target.files && e.target.files[0]);if(!file)return;
    setUploading(true);setPhotoBlurry(false);setPhotoChecking(true);
    const r=new FileReader();
    r.onloadend=()=>{
      const dataUrl=r.result;
      setPhoto(dataUrl);
      detectBlur(dataUrl)
        .then(score=>{
          setPhotoBlurry(score<120);
          setPhotoChecking(false);
          setTimeout(()=>setUploading(false),400);
        })
        .catch(()=>{
          setPhotoBlurry(false);
          setPhotoChecking(false);
          setTimeout(()=>setUploading(false),400);
        });
    };
    r.readAsDataURL(file);
  };
  const applyTemplate=tmpl=>{setTemplate(tmpl);setForm(p=>({...p,title:tmpl.defaultTitle,desc:tmpl.defaultDesc,price:tmpl.defaultPrice,original:tmpl.defaultOriginal}));setStep(3);};
  const applyRepost=post=>{
    const tmpl=FOOD_TEMPLATES.find(x=>x.emoji===post.emoji)||FOOD_TEMPLATES[5];
    setTemplate(tmpl);setPostType(post.type);
    setForm({title:post.title,desc:post.desc,price:post.price,original:post.original,studentPrice:"",hasStudentPrice:false,endTime:"",qty:"",reheat:"none",halal:null});
    setPhoto(null);setShowPast(false);setStep(3);
  };
  const handlePublish=async()=>{
    setPublishing(true);
    try{
      const newPost={
        id:Date.now(),vendorId:99,vendorName:(vendorMeta && vendorMeta.shopName)||"My Shop",
        vendorSubscribed:!!(trial&&trial.status==='subscribed'),
        branch:(vendorMeta && vendorMeta.area)||null,
        vendorLat:locationHook.loc && locationHook.loc.lat,
        vendorLon:locationHook.loc && locationHook.loc.lon,
        freeDeliveryThreshold:vendorProfile.freeDeliveryThreshold,
        sharedPool:vendorProfile.sharedPool||false,
        studentPrice:form.hasStudentPrice&&form.studentPrice?parseFloat(form.studentPrice):null,
        title:form.title,desc:form.desc,
        originalPrice:parseFloat(form.original)||parseFloat(form.price)*1.5,
        dealPrice:parseFloat(form.price),
        emoji:(template && template.emoji)||"🍱",image:photo,
        category:(template && template.category)||"Other",
        halal:form.halal!==null?form.halal:0,distance:0.1,endTime:computedEnd,timeMode,
        qty:form.qty?parseInt(form.qty):null,claimed:0,
        type:postType||"limited",reheat:form.reheat,postedAt:Date.now()
      };

      // Save to Supabase if vendor has DB id
      if(sbVendorId){
        const expiresAt = computedEnd ? new Date(computedEnd).toISOString() : null;
        await createListing(sbVendorId, {
          title: form.title,
          description: form.desc,
          original_price: parseFloat(form.original)||parseFloat(form.price)*1.5,
          deal_price: parseFloat(form.price),
          image: photo||null,
          emoji: (template && template.emoji)||'🍱',
          post_type: postType||'limited',
          halal: form.halal===1,
          halal_cert: form.halal===2,
          muslim_owned: form.muslimOwned||false,
          expires_at: expiresAt,
          qty_total: form.qty?parseInt(form.qty):1,
          qty_remaining: form.qty?parseInt(form.qty):1,
          free_delivery_threshold: vendorProfile.freeDeliveryThreshold||null,
          shared_pool: vendorProfile.sharedPool||false,
          active: true,
        });
      }

      setActivePosts(p=>[newPost,...p]);
      setSuccessPost({price:form.price,radius});
      addSaleLog({itemName:form.title, amount:parseFloat(form.price), net:parseFloat(form.price)*0.9, ts:Date.now()});
      onNewListing(newPost);
      onPostSuccess && onPostSuccess();
      setShowSuccess(true);
    }catch(err){
      console.error('Publish error:',err);
    }finally{
      setPublishing(false);
      setStep(1);setPostType(null);setTemplate(null);setPhoto(null);
      setTimeMode("stock");
      setForm({title:"",desc:"",price:"",original:"",studentPrice:"",hasStudentPrice:false,endTime:"",qty:"",reheat:"none",halal:null});
    }
  };

  const tag=postType?dealTag(postType,t):null;

  const Preview=()=>(
    <div className="relative w-full rounded-3xl overflow-hidden shadow-xl aspect-[4/5] bg-slate-900 mb-4">
      {photo?<img src={photo} className="absolute inset-0 w-full h-full object-cover" alt=""/>:<div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900"><span className="text-5xl mb-2">{template?.emoji||"📸"}</span><p className="text-white/30 text-[10px] font-black uppercase tracking-widest">{t.snapFirst2}</p></div>}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"/>
      <div className="absolute top-4 left-4 right-4 flex justify-between">
        {tag&&<span className={`text-white text-[9px] font-black px-2.5 py-1 rounded-lg uppercase ${dealTag(postType,t).bg}`}>{tag.label}</span>}
        {savingsPct(form.original,form.price)&&<span className="bg-yellow-400 text-black text-[10px] font-black px-2 py-1 rounded-xl -rotate-2">{t.save} {savingsPct(form.original,form.price)}%</span>}
      </div>
      {vendorProfile.freeDeliveryThreshold&&(
        <div className="absolute top-14 left-4">
          <span className={`text-white text-[8px] font-black px-2 py-1 rounded-lg ${vendorProfile.sharedPool?"bg-indigo-500/80":"bg-emerald-500/80"}`}>
            {vendorProfile.sharedPool?t.freeDeliveryShared:fill(t.freeDeliveryFrom,fmtRM(vendorProfile.freeDeliveryThreshold))}
          </span>
        </div>
      )}
      {form.hasStudentPrice&&form.studentPrice&&(
        <div className="absolute top-20 left-4"><span className="bg-indigo-500/80 text-white text-[8px] font-black px-2 py-1 rounded-lg">🎓 RM{fmtRM(form.studentPrice)}</span></div>
      )}
      <div className="absolute bottom-0 left-0 right-0 p-5">
        <h3 className="text-white font-black text-xl">{form.title||(template && template.defaultTitle)||t.foodNamePH}</h3>
        <p className="text-white/50 text-xs mb-3">{form.desc||(template && template.defaultDesc)}</p>
        <div className="flex justify-between items-end">
          <div><p className="text-white/40 text-[10px] line-through">RM{fmtRM(form.original)}</p><p className="text-emerald-400 text-2xl font-black">RM{fmtRM(form.price)}</p></div>
          <div className="text-right"><p className="text-white/40 text-[10px]">{computedEnd?`⏱ ${t.endsAt} ${computedEnd}`:t.liveUntilStock||"⏳ While stock lasts"}</p>{form.qty&&<p className="text-white/40 text-[10px]">📦 {form.qty} {t.units}</p>}</div>
        </div>
      </div>
    </div>
  );

  return(
    <div className="min-h-screen bg-[#0a0f1e] pb-28">
      {/* Trial/subscription status banner — auto, always visible */}
      <TrialBanner trial={trial||{status:'no_trial'}} t={t} onSubscribe={trial ? function(){ setShowSubGate(true); } : null}/>
      <div className="sticky top-[60px] z-40 bg-[#0a0f1e]/95 backdrop-blur-md border-b border-white/10 px-4 py-3 flex items-center justify-between">
        <div><p className="text-white font-black text-sm">{t.postNewDeal}</p><p className="text-white/30 text-[10px]">Step {step}/3</p></div>
        <div className="flex gap-2">
          <button onClick={()=>setShowSettings(true)} className="bg-white/10 border border-white/20 px-3 py-1.5 rounded-xl text-white text-[10px] font-black uppercase">⚙️</button>
          <button onClick={()=>setShowPast(true)} className="bg-white/10 border border-white/20 px-3 py-1.5 rounded-xl text-white text-[10px] font-black uppercase">🔁 {t.repeatBtn}</button>
          {(vendorMeta && vendorMeta.shopName)&&(
            <div className="bg-white/10 px-3 py-1.5 rounded-xl">
              <span className="text-white/60 text-[10px] font-black">🏪 {vendorMeta.shopName}</span>
            </div>
          )}
          {activePosts.length>0&&<div className="bg-emerald-500/20 border border-emerald-500/30 px-3 py-1.5 rounded-xl"><span className="text-emerald-400 text-[10px] font-black">{activePosts.length} {t.activeLabel}</span></div>}
        </div>
      </div>

      {/* Status bar */}
      <div className="mx-4 mt-3 flex gap-2">
        <div className={`flex-1 px-3 py-2 rounded-xl flex items-center gap-2 ${vendorProfile.freeDeliveryThreshold?"bg-emerald-500/10 border border-emerald-500/20":"bg-white/5 border border-white/10"}`}>
          <span className="text-sm">{vendorProfile.freeDeliveryThreshold?"🚗":"🚶"}</span>
          <p className={`text-[10px] font-bold truncate ${vendorProfile.freeDeliveryThreshold?"text-emerald-400":"text-white/30"}`}>
            {vendorProfile.freeDeliveryThreshold
              ? vendorProfile.sharedPool ? t.freeDeliveryShared : fill(t.freeDeliveryFrom,fmtRM(vendorProfile.freeDeliveryThreshold))
              : t.thresholdOff}
          </p>
        </div>
        <div className="bg-indigo-500/10 border border-indigo-500/20 px-3 py-2 rounded-xl flex items-center gap-1.5">
          <span className="text-sm">🔔</span>
          <p className="text-indigo-400 text-[10px] font-bold">{radius}km</p>
        </div>
        <button onClick={()=>setShowSettings(true)} className="bg-white/10 border border-white/10 px-3 py-2 rounded-xl text-white/40 text-[9px] font-black uppercase">Edit</button>
      </div>

      <div className="px-4 pt-3"><div className="flex gap-1.5 mt-2">{[1,2,3].map(s=><div key={s} className={`h-1 flex-1 rounded-full transition-all duration-500 ${s<=step?"bg-emerald-500":"bg-white/10"}`}/>)}</div></div>

      <div className="px-4 pt-5">
        <AnimatePresence mode="wait">
          {step===1&&(
            <motion.div key="s1" initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-20}}>
              <VendorDashboard activePosts={activePosts} t={t}/>
              <h2 className="text-white text-2xl font-black mb-1">{t.whatToPost}</h2>
              <p className="text-white/40 text-sm mb-5">{t.chooseType}</p>
              <div className="space-y-3 mb-8">
                {postTypes.map(type=>(
                  <motion.button key={type.id} whileTap={{scale:0.97}} onClick={()=>{ if(trialBlocked){setShowSubGate(true);return;} setPostType(type.id);setStep(2);}}
                    className={`w-full text-left p-5 rounded-2xl border-2 bg-white/5 ${type.border} ${trialBlocked?"opacity-40":""}`}>
                    <div className="flex items-center gap-4"><span className="text-3xl">{type.icon}</span><div><h3 className="text-white font-black text-base">{type.title}</h3><p className="text-white/40 text-xs mt-0.5">{type.desc}</p></div></div>
                  </motion.button>
                ))}
              </div>
              {/* Cancel confirmation dialog */}
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
                  <div className="flex items-center gap-2 mb-3"><div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"/><p className="text-white font-black text-sm uppercase tracking-wider">{t.liveNow}</p><span className="text-white/30 text-[9px] font-bold ml-auto">Tap × to remove</span></div>
                  <div className="space-y-2">
                    {activePosts.map(l=>(
                      <div key={l.id} className="bg-white/5 border border-white/10 rounded-2xl p-3 flex gap-3 items-center">
                        <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-white/10 flex items-center justify-center flex-shrink-0">{l.image?<img src={l.image} className="w-full h-full object-cover" alt=""/>:<span className="text-xl">{l.emoji}</span>}</div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-white font-black text-sm truncate">{l.title}</h4>
                          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                            {l.studentPrice&&<span className="text-indigo-400 text-[9px] font-black">🎓 RM{fmtRM(l.studentPrice)}</span>}
                            <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${
                              !l.endTime?"bg-emerald-500/20 text-emerald-400"
                              :l.timeMode==="schedule"?"bg-blue-500/20 text-blue-400"
                              :"bg-amber-500/20 text-amber-400"}`}>
                              {!l.endTime?t.liveUntilStock
                               :l.timeMode==="schedule"?t.liveUntilClose
                               :`${t.liveUntil} ${l.endTime}`}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-emerald-400 font-black text-sm">RM{fmtRM(l.dealPrice)}</span>
                          <button onClick={()=>setCancelTarget(l.id)} className="w-7 h-7 bg-red-500/20 hover:bg-red-500/40 rounded-lg flex items-center justify-center text-red-400 text-xs font-black transition-colors">✕</button>
                          <button onClick={()=>{
                            setActivePosts(function(p){ return p.map(function(x){
                              if(x.id!==l.id) return x;
                              addSaleLog({itemName:x.title,amount:parseFloat(x.dealPrice),net:parseFloat(x.dealPrice)*0.9,ts:Date.now()});
                              return Object.assign({},x,{claimed:(x.claimed||0)+1});
                            }); });
                          }} className="w-7 h-7 bg-emerald-500/20 hover:bg-emerald-500/40 rounded-lg flex items-center justify-center text-emerald-400 text-xs transition-colors" title="Confirm pickup">✅</button>
                        </div>
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
              <Preview/>
              <label className="w-full flex items-center justify-center gap-2 bg-white/10 border border-white/20 py-3 rounded-2xl cursor-pointer active:scale-95 transition-transform mb-5">
                <span className="text-lg">{photoChecking?"⏳":photo?(photoBlurry?"⚠️":"✅"):"📸"}</span>
                <span className="text-white font-black text-xs uppercase tracking-widest">
                  {photoChecking?"🔍 Checking...":uploading?"Uploading...":photo?(photoBlurry?"📷 Blurry — retake below":"✅ Photo OK"):t.snapPhoto}
                </span>
                {(uploading||photoChecking)&&<div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"/>}
                <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handlePhoto}/>
              </label>
              {/* Blur detection result */}
              {photo&&photoChecking&&(
                <div className="mt-2 bg-white/5 rounded-xl px-3 py-2.5 flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin flex-shrink-0"/>
                  <p className="text-white/50 text-xs font-bold">Checking photo sharpness...</p>
                </div>
              )}
              {photo&&photoBlurry&&!photoChecking&&(
                <div className="mt-2 bg-red-500/20 border-2 border-red-500/60 rounded-xl overflow-hidden">
                  <div className="px-3 py-2.5 flex items-start gap-2">
                    <span className="text-red-400 text-xl flex-shrink-0 mt-0.5">📷</span>
                    <div className="flex-1">
                      <p className="text-red-300 font-black text-sm">Photo is too blurry</p>
                      <p className="text-red-300/70 text-[10px] mt-0.5">Blurry photos reduce orders. Please retake a clear, well-lit shot of your food.</p>
                    </div>
                  </div>
                  <label className="block w-full bg-red-500 text-white text-center py-3 font-black text-xs uppercase tracking-widest cursor-pointer active:bg-red-600 transition-colors">
                    📸 Retake Photo
                    <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handlePhoto}/>
                  </label>
                </div>
              )}
              {photo&&!photoBlurry&&!photoChecking&&(
                <div className="mt-2 flex items-center justify-between px-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-emerald-400 text-sm">✅</span>
                    <p className="text-emerald-400 text-[10px] font-black">Photo looks sharp — good to go!</p>
                  </div>
                  <label className="text-white/30 text-[9px] underline cursor-pointer">
                    retake
                    <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handlePhoto}/>
                  </label>
                </div>
              )}
              <div className="space-y-4">
                <div>
                  <label className="text-white/40 text-[9px] font-black uppercase tracking-widest block mb-1.5">{t.foodName}</label>
                  <input value={form.title} onChange={e=>upd("title",e.target.value)} type="text" placeholder={t.foodNamePH} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm font-bold focus:border-emerald-500 focus:outline-none"/>
                </div>

                {/* ── Halal Status — REQUIRED ── */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <label className="text-white/40 text-[9px] font-black uppercase tracking-widest">Halal Status</label>
                    <span className="text-red-400 text-[9px] font-black">* Required</span>
                    {form.halal===null&&form.title&&(
                      <span className="text-amber-400 text-[9px] font-bold animate-pulse">← Please select</span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      {val:1, icon:"🟢", label:"Halal Certified",  sub:"Has halal certificate",      color:"emerald"},
                      {val:2, icon:"🔵", label:"Muslim-Owned",     sub:"Owner is Muslim",            color:"blue"},
                      {val:3, icon:"🔴", label:"Non-Halal",        sub:"Contains pork/alcohol etc.", color:"red"},
                      {val:0, icon:"⚪", label:"Not Stated",       sub:"No halal claim made",        color:"slate"},
                    ].map(function(opt){
                      var selected = form.halal===opt.val;
                      var base = "rounded-xl border-2 p-3 flex items-start gap-2 cursor-pointer transition-all active:scale-95 ";
                      var cls = selected
                        ? base+"border-"+opt.color+"-500 bg-"+opt.color+"-500/20"
                        : base+"border-white/10 bg-white/5 hover:border-white/20";
                      return(
                        <button key={opt.val} onClick={()=>upd("halal",opt.val)} className={cls} type="button">
                          <span className="text-xl flex-shrink-0 mt-0.5">{opt.icon}</span>
                          <div className="text-left">
                            <p className={"font-black text-xs "+(selected?"text-"+opt.color+"-300":"text-white/80")}>{opt.label}</p>
                            <p className="text-white/30 text-[9px] mt-0.5">{opt.sub}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  {form.halal!==null&&(
                    <p className="text-white/20 text-[9px] mt-1.5">* Self-declared. Sapot Lokal does not verify halal status.</p>
                  )}
                </div>
                <div><label className="text-white/40 text-[9px] font-black uppercase tracking-widest block mb-1.5">{t.shortDesc}</label><input value={form.desc} onChange={e=>upd("desc",e.target.value)} type="text" placeholder={t.shortDescPH} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm font-bold focus:border-emerald-500 focus:outline-none"/></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="text-white/40 text-[9px] font-black uppercase tracking-widest block mb-1.5">{t.originalPrice}</label><input value={form.original} onChange={e=>upd("original",e.target.value)} type="number" placeholder="0.00" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white/60 text-sm font-bold focus:outline-none"/></div>
                  <div><label className="text-white/40 text-[9px] font-black uppercase tracking-widest block mb-1.5">{t.dealPrice}</label><input value={form.price} onChange={e=>upd("price",e.target.value)} type="number" placeholder="0.00" className="w-full bg-white/5 border border-emerald-500/40 rounded-xl px-4 py-3 text-emerald-400 text-sm font-black focus:border-emerald-500 focus:outline-none"/></div>
                </div>
                {form.price&&(
  <motion.div initial={{opacity:0}} animate={{opacity:1}} className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3">
    <div className="flex justify-between mb-1">
      <span className="text-white/50 text-xs font-bold">{t.youReceive}</span>
      <span className="text-emerald-400 font-black">RM{netPayout(form.price,trial&&trial.status==='subscribed')}</span>
    </div>
    <div className="flex justify-between">
      <span className="text-white/20 text-[9px]">{trial&&trial.status==='subscribed'?"10% subscriber rate":"15% standard rate — subscribe for 10%"}</span>
      {!(trial&&trial.status==='subscribed')&&<button onClick={function(){}} className="text-indigo-400 text-[9px] font-black underline">Save 5%</button>}
    </div>
  </motion.div>
)}

                {/* Student price toggle */}
                <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 pr-3"><p className="text-white font-black text-sm">🎓 {t.addStudentPrice}</p><p className="text-white/40 text-xs mt-0.5">{t.addStudentPriceDesc}</p></div>
                    <button onClick={()=>upd("hasStudentPrice",!form.hasStudentPrice)}
                      className={`w-11 h-6 rounded-full relative flex-shrink-0 transition-colors ${form.hasStudentPrice?"bg-indigo-500":"bg-white/20"}`}>
                      <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 shadow transition-all ${form.hasStudentPrice?"left-5":"left-0.5"}`}/>
                    </button>
                  </div>
                  <AnimatePresence>
                    {form.hasStudentPrice&&(
                      <motion.div initial={{opacity:0,height:0}} animate={{opacity:1,height:"auto"}} exit={{opacity:0,height:0}} className="overflow-hidden mt-3">
                        <label className="text-indigo-300/60 text-[9px] font-black uppercase tracking-widest block mb-1.5">{t.studentPriceRM}</label>
                        <input value={form.studentPrice} onChange={e=>upd("studentPrice",e.target.value)} type="number" placeholder={t.studentPricePH}
                          className="w-full bg-indigo-500/10 border border-indigo-500/40 rounded-xl px-4 py-3 text-indigo-300 text-sm font-black focus:border-indigo-400 focus:outline-none"/>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div>
                  <label className="text-white/40 text-[9px] font-black uppercase tracking-widest block mb-2">{t.timeModeLabel}</label>
                  {/* 3-way time mode selector */}
                  <div className="space-y-2 mb-3">
                    {[
                      {id:"stock",    title:t.timeModeStock,    desc:t.timeModeStock_desc},
                      {id:"hours",    title:t.timeModeHours,    desc:t.timeModeHours_desc},
                      {id:"schedule", title:t.timeModeSched,    desc:t.timeModeSched_desc},
                    ].map(opt=>(
                      <button key={opt.id} onClick={()=>setTimeMode(opt.id)}
                        className={`w-full text-left px-4 py-3 rounded-xl border transition-all ${timeMode===opt.id?"bg-emerald-500/10 border-emerald-500/40":"bg-white/5 border-white/10"}`}>
                        <p className={`font-black text-xs ${timeMode===opt.id?"text-emerald-400":"text-white/70"}`}>{opt.title}</p>
                        <p className="text-white/30 text-[9px] mt-0.5">{opt.desc}</p>
                      </button>
                    ))}
                  </div>
                  {/* Hours sub-option */}
                  {timeMode==="hours"&&(
                    <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                      <div className="flex gap-2 mb-2">{[1,2,3,4,6,8].map(h=><button key={h} onClick={()=>setQuickHours(h)} className={`flex-1 py-2 rounded-lg text-[10px] font-black transition-all ${quickHours===h?"bg-emerald-500 text-white":"bg-white/5 text-white/40 border border-white/10"}`}>+{h}h</button>)}</div>
                      <p className="text-white/40 text-[9px]">{t.endAt} <span className="text-white/70 font-black">{computedEnd}</span></p>
                    </div>
                  )}
                  {/* Schedule sub-option */}
                  {timeMode==="schedule"&&(
                    <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                      <div className="grid grid-cols-2 gap-2 mb-2">
                        <div><p className="text-white/40 text-[9px] mb-1">{t.openTime}</p><input type="time" value={vendorProfile.openTime||"09:00"} onChange={e=>onUpdateProfile({...vendorProfile,openTime:e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-xs font-bold focus:outline-none focus:border-emerald-500"/></div>
                        <div><p className="text-white/40 text-[9px] mb-1">{t.closeTime}</p><input type="time" value={vendorProfile.closeTime||"22:00"} onChange={e=>onUpdateProfile({...vendorProfile,closeTime:e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-xs font-bold focus:outline-none focus:border-emerald-500"/></div>
                      </div>
                      <p className="text-white/40 text-[9px]">{t.liveUntil}: <span className="text-white/70 font-black">{vendorProfile.closeTime||"22:00"}</span></p>
                    </div>
                  )}
                </div>
                <div><label className="text-white/40 text-[9px] font-black uppercase tracking-widest block mb-1.5">{t.qty}</label><input value={form.qty} onChange={e=>upd("qty",e.target.value)} type="number" placeholder={t.qtyPH} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm font-bold focus:outline-none"/><p className="text-white/20 text-[9px] mt-1 font-bold">{t.qtyNote}</p></div>
                <div><label className="text-white/40 text-[9px] font-black uppercase tracking-widest block mb-2">{t.reheat}</label><div className="flex gap-2">{[{id:"none",label:t.eatDirect},{id:"microwave",label:t.microwave},{id:"oven",label:t.oven}].map(r=><button key={r.id} onClick={()=>upd("reheat",r.id)} className={`flex-1 py-2 rounded-xl text-[9px] font-black transition-all ${form.reheat===r.id?"bg-white/20 text-white":"bg-white/5 text-white/30"}`}>{r.label}</button>)}</div></div>
              </div>
              {/* Hard block when trial expired or max posts reached */}
            {trialBlocked&&(
              <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 text-center mb-3">
                <p className="text-red-400 font-black text-sm mb-1">🔒 {t.trialExpired}</p>
                <p className="text-red-400/60 text-xs mb-3">{t.trialExpiredDesc}</p>
                <button onClick={()=>setShowSubGate(true)}
                  className="w-full bg-red-500 text-white py-3 rounded-xl font-black text-xs uppercase tracking-widest active:scale-95 transition-transform">
                  {t.subscribeNow}
                </button>
              </div>
            )}
            {maxPostsBlocked&&!trialBlocked&&(
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl px-4 py-3 flex items-center gap-3 mb-3">
                <span className="text-xl flex-shrink-0">⚠️</span>
                <p className="text-amber-300 font-black text-xs">{t.maxPostsReached}</p>
              </div>
            )}
            {photoBlurry&&photo&&(
              <div className="mt-4 bg-red-500/10 border border-red-500/30 rounded-2xl px-4 py-3 text-center">
                <p className="text-red-400 font-black text-xs">📷 Retake photo above before going live</p>
              </div>
            )}
            <button onClick={handlePublish} disabled={!canPublish||publishing}
                className={`w-full mt-4 py-5 rounded-2xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-2 transition-all ${canPublish&&!publishing?"bg-emerald-500 text-white shadow-lg shadow-emerald-900/50 active:scale-95":"bg-white/10 text-white/30 cursor-not-allowed"}`}>
                {publishing?<><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>{t.processing}</>:!photo?t.snapFirst:!form.title?t.fillName:!form.price?t.fillPrice:form.halal===null?"☪️ Select Halal Status":t.goLive}
              </button>
              <p className="text-white/20 text-[9px] text-center mt-2 font-bold">{t.tngNote}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Subscription payment gate */}
      <AnimatePresence>
        {showSubGate&&(
          <SubscriptionGate
            t={t}
            onClose={()=>setShowSubGate(false)}
            onSubscribe={()=>{
              if(trial) trial.subscribe();
              setShowSubGate(false);
            }}
          />
        )}
      </AnimatePresence>

      {/* Past posts */}
      <AnimatePresence>
        {showPast&&(
          <motion.div initial={{x:"100%"}} animate={{x:0}} exit={{x:"100%"}} transition={{type:"spring",damping:28,stiffness:300}} className="fixed inset-0 z-[200] bg-[#0a0f1e] flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-white/10"><div><h2 className="text-white font-black text-lg">{t.pastPosts}</h2><p className="text-white/40 text-xs">{t.repostNote}</p></div><button onClick={()=>setShowPast(false)} className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center text-white">✕</button></div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {MOCK_PAST_POSTS.map(post=>(
                <div key={post.id} className="bg-white/5 border border-white/10 rounded-2xl p-4 flex gap-4 items-center">
                  <div className="w-14 h-14 bg-white/10 rounded-xl flex items-center justify-center text-2xl">{post.emoji}</div>
                  <div className="flex-1 min-w-0"><h4 className="text-white font-black text-sm truncate">{post.title}</h4><p className="text-white/40 text-[10px]">{post.desc}</p><div className="flex gap-2 mt-1"><span className="text-emerald-400 font-black text-xs">RM{post.price}</span><span className="text-white/30 text-[10px]">{post.sold} {t.sold}</span></div></div>
                  <button onClick={()=>applyRepost(post)} className="bg-emerald-500 text-white text-[10px] font-black px-3 py-2 rounded-xl uppercase">{t.repost}</button>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showSettings&&<VendorSettingsPanel profile={vendorProfile} t={t} onSave={onUpdateProfile} onClose={()=>setShowSettings(false)}/>}
      </AnimatePresence>

      {/* Post success */}
      <AnimatePresence>
        {showSuccess&&(
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 z-[300] bg-black/80 backdrop-blur-md flex items-end justify-center" onClick={()=>setShowSuccess(false)}>
            <motion.div initial={{y:100}} animate={{y:0}} exit={{y:100}} transition={{type:"spring",damping:28}} onClick={e=>e.stopPropagation()} className="w-full max-w-sm bg-[#0d1929] rounded-t-[40px] p-8 pb-12">
              <div className="text-center mb-5"><motion.div initial={{scale:0}} animate={{scale:1}} transition={{type:"spring",delay:0.1}} className="text-6xl mb-4">🎉</motion.div><h2 className="text-white text-2xl font-black mb-2">{t.postSuccess}</h2><p className="text-white/50 text-sm">{fill(t.liveNote,successPost?.radius||DEFAULT_RADIUS)}</p></div>
              <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl px-4 py-3 mb-5 flex items-center gap-3">
                <span className="text-2xl">🔔</span>
                <p className="text-indigo-300 text-sm font-bold">Buyers within {(successPost && successPost.radius)||DEFAULT_RADIUS}km notified</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-6 space-y-2">
                <div className="flex justify-between text-xs"><span className="text-white/40">{t.salePrice}</span><span className="text-white font-black">RM{fmtRM(successPost?.price)}</span></div>
                <div className="flex justify-between text-xs"><span className="text-white/40">{t.commission}</span><span className="text-red-400 font-black">- RM{(parseFloat(successPost?.price||0)*0.1).toFixed(2)}</span></div>
                <div className="h-px bg-white/10"/>
                <div className="flex justify-between"><span className="text-emerald-400 font-black text-xs uppercase">{t.youGet}</span><span className="text-emerald-400 font-black text-base">RM{netPayout(successPost&&successPost.price,trial&&trial.status==='subscribed')}</span></div>
                <p className="text-white/20 text-[9px] text-center pt-1">{t.payoutNote}</p>
              </div>
              <button onClick={()=>setShowSuccess(false)} className="w-full bg-emerald-500 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs">{t.viewDash}</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── SUBSCRIPTION GATE ────────────────────────────────────────────────────────

// ─── TRIAL BANNER (inside Sell tab) ──────────────────────────────────────────
function TrialBanner({trial, t, onSubscribe}){
  if(!trial.trialStart && trial.status==='no_trial') return null;

  var status=trial.status; var daysLeft=trial.daysLeft; var trialStart=trial.trialStart; var trialEnd=trial.trialEnd; var subExpires=trial.subExpires;

  // Active subscription — show brief green badge only
  if(status==='subscribed'){
    return(
      <div className="mx-4 mb-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-base">✅</span>
          <div>
            <p className="text-emerald-400 font-black text-xs">{t.alreadySubscribed}</p>
            <p className="text-emerald-400/60 text-[9px]">{fill(t.subscribedUntil, fmtDate(subExpires))}</p>
          </div>
        </div>
      </div>
    );
  }

  // Trial active — colour shifts as urgency grows
  const isCritical = status==='trial' && daysLeft<=7;
  const isWarn     = status==='trial' && daysLeft<=30 && daysLeft>7;
  const isGood     = status==='trial' && daysLeft>30;
  const isExpired  = status==='expired';

  var bg; var label; var textCol; var subCol;
  if(isExpired)       { bg='bg-red-500/10 border-red-500/30';   }
  else if(isCritical) { bg='bg-red-500/10 border-red-500/20';   }
  else if(isWarn)     { bg='bg-amber-500/10 border-amber-500/20'; }
  else                { bg='bg-indigo-500/10 border-indigo-500/20'; }

  if(isExpired)        { label=t.trialBannerExpired; }
  else if(daysLeft===1){ label=fill(t.trialBannerUrgent,'1'); }
  else if(daysLeft<=7) { label=fill(t.trialBannerUrgent,daysLeft); }
  else if(daysLeft<=30){ label=fill(t.trialBannerWarn,daysLeft); }
  else                 { label=fill(t.trialBannerFree,daysLeft); }

  if(isExpired||isCritical){ textCol='text-red-400';    subCol='text-red-400/60';    }
  else if(isWarn)           { textCol='text-amber-400';  subCol='text-amber-400/60';  }
  else                      { textCol='text-indigo-400'; subCol='text-indigo-400/60'; }

  return(
    <motion.div initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}}
      className={`mx-4 mb-4 border rounded-2xl overflow-hidden ${bg}`}>
      <div className="px-4 pt-3 pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <p className={`font-black text-xs ${textCol}`}>{label}</p>
            {status==='trial'&&(
              <p className={`text-[9px] mt-0.5 ${subCol}`}>
                {t.trialStarted}: {fmtDate(trialStart)} · {t.trialEnds}: {fmtDate(trialEnd)}
              </p>
            )}
            {isExpired&&(
              <p className={`text-[9px] mt-0.5 ${subCol}`}>{t.trialExpiredDesc}</p>
            )}
          </div>
          {/* Countdown ring for urgency */}
          {status==='trial' && daysLeft<=30 &&(
            <div className={`flex-shrink-0 w-10 h-10 rounded-full border-2 flex flex-col items-center justify-center ${isCritical?'border-red-400':isWarn?'border-amber-400':'border-indigo-400'}`}>
              <span className={`font-black text-xs leading-none ${textCol}`}>{daysLeft}</span>
              <span className={`text-[7px] ${subCol}`}>days</span>
            </div>
          )}
        </div>
      </div>
      {/* Subscribe CTA */}
      {(status==='expired'||daysLeft<=30)&&(
        <div className="px-4 pb-3">
          <button onClick={onSubscribe}
            className={`w-full py-2.5 rounded-xl font-black text-xs uppercase tracking-widest text-white transition-all active:scale-95 ${isExpired||isCritical?'bg-red-500':'bg-amber-500'}`}>
            {t.subscribeNow}
          </button>
        </div>
      )}
    </motion.div>
  );
}

function SubscriptionGate({onSubscribe,onClose,t}){
  const [loading, setLoading]=useState(false);
  const icons=["📸","💳","🔁","📊","🎓","🔔"];
  return(
    <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
      className="fixed inset-0 z-[500] bg-black/70 backdrop-blur-sm flex items-end justify-center"
      onClick={onClose}>
      <motion.div initial={{y:"100%"}} animate={{y:0}} exit={{y:"100%"}}
        transition={{type:"spring",damping:28,stiffness:280}}
        onClick={e=>e.stopPropagation()}
        className="w-full max-w-sm bg-[#0d1929] rounded-t-[36px] max-h-[88vh] overflow-y-auto">
        {/* Handle + close */}
        <div className="flex items-center justify-between px-5 pt-5 pb-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🛒</span>
            <div><h2 className="text-white font-black text-base leading-none">Sapot Lokal</h2><p className="text-emerald-400 text-[9px] font-bold uppercase tracking-widest">{t.monthlyPlan}</p></div>
          </div>
          <button onClick={onClose} className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center text-white text-sm flex-shrink-0">✕</button>
        </div>
        <div className="px-5 pb-10 pt-3">
          <div className="flex items-center justify-between mb-5 bg-white/5 border border-white/10 rounded-2xl p-4">
            <div><p className="text-white/50 text-[9px] uppercase tracking-widest font-bold mb-1">{t.monthlyPlan}</p><div className="flex items-end gap-1"><span className="text-3xl font-black text-white">RM29</span><span className="text-emerald-400 font-black text-base">.90</span><span className="text-white/40 text-xs mb-0.5">{t.perMonth}</span></div></div>
            <div className="bg-emerald-500/20 border border-emerald-500/30 px-3 py-2 rounded-2xl text-center"><p className="text-emerald-400 font-black text-[10px] uppercase">{t.commission10}</p><p className="text-emerald-300 font-black text-[10px]">{t.komisyen}</p></div>
          </div>
          <div className="space-y-2.5 mb-5">{t.subPerks.map((perk,i)=>(<div key={i} className="flex items-center gap-3 bg-white/5 rounded-xl px-3 py-2.5"><span className="text-base flex-shrink-0">{icons[i]}</span><span className="text-white/80 text-xs font-medium">{perk}</span></div>))}</div>
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-3 mb-4 flex items-center gap-3"><span className="text-xl flex-shrink-0">💙</span><div><p className="text-blue-300 font-black text-[10px] uppercase tracking-wider">{t.tngFlow}</p><p className="text-white/50 text-[10px]">{t.tngDesc}</p></div></div>
          <button onClick={()=>{setLoading(true);setTimeout(()=>{setLoading(false);onSubscribe();},2000);}} disabled={loading}
            className="w-full bg-emerald-500 active:scale-95 transition-all text-white py-4 rounded-2xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/50 mb-3">
            {loading?<><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>{t.processing}</>:t.subscribeCTA}
          </button>
          <p className="text-white/20 text-[9px] text-center font-bold uppercase tracking-wider">{t.autoRenew}</p>
        </div>
      </motion.div>
    </motion.div>
  );
}


// ─── ADMIN PANEL ──────────────────────────────────────────────────────────────
// Password-protected. Only you (the operator) can access this.
// Accessible via: triple-tap the app logo in the header.
// Lets you upload/swap ads for receipt and feed — no code changes needed.

const ADMIN_PASSWORD = "sapotadmin2026"; // Change this to your own password

function AdminPanel({onClose}){
  var [authed, setAuthed]       = useState(false);
  var [pw, setPw]               = useState("");
  var [pwError, setPwError]     = useState(false);
  var [ads, setAdsState]        = useState(()=>getAds());
  var [saved, setSaved]         = useState(false);
  var [activeTab, setActiveTab] = useState("receipt"); // "receipt" | "feed"

  function login(){
    if(pw===ADMIN_PASSWORD){ setAuthed(true); setPwError(false); }
    else{ setPwError(true); setPw(""); }
  }

  function updateAd(placement, field, value){
    setAdsState(function(prev){
      var updated = Object.assign({},prev);
      updated[placement] = Object.assign({},updated[placement],{[field]:value});
      return updated;
    });
    setSaved(false);
  }

  function handleSave(){
    saveAds(ads);
    // Also sync to Supabase so all users see the ad
    Object.entries(ads).forEach(([placement, ad])=>{
      updateAdInDB(placement, {
        active: ad.active,
        type: ad.type,
        src: ad.src,
        caption: ad.caption,
        advertiser: ad.advertiser,
        cta_label: ad.ctaLabel,
        cta_url: ad.ctaUrl,
      });
    });
    setSaved(true);
    setTimeout(()=>setSaved(false),2000);
  }

  function handleClear(placement){
    var cleared = Object.assign({},ads);
    cleared[placement] = Object.assign({},DEFAULT_ADS[placement],{active:false});
    setAdsState(cleared);
    saveAds(cleared);
    setSaved(true);
    setTimeout(()=>setSaved(false),2000);
  }

  // ── Login screen ──────────────────────────────────────────────────────────
  if(!authed){
    return(
      <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
        className="fixed inset-0 z-[900] bg-black/90 backdrop-blur-md flex items-center justify-center p-5">
        <motion.div initial={{scale:0.9,opacity:0}} animate={{scale:1,opacity:1}} transition={{type:"spring",damping:20}}
          className="w-full max-w-xs bg-[#0d1929] rounded-3xl p-7">
          <div className="text-center mb-6">
            <div className="text-4xl mb-3">🔐</div>
            <h2 className="text-white font-black text-xl">Admin Panel</h2>
            <p className="text-white/40 text-xs mt-1">Sapot Lokal · Operator Access</p>
          </div>
          <input
            type="password"
            value={pw}
            onChange={function(e){setPw(e.target.value);setPwError(false);}}
            onKeyDown={function(e){if(e.key==="Enter") login();}}
            placeholder="Enter admin password"
            className={"w-full bg-white/5 border rounded-2xl px-4 py-3 text-white text-sm font-bold focus:outline-none mb-3 "+(pwError?"border-red-500":"border-white/20 focus:border-indigo-500")}
            autoFocus
          />
          {pwError&&<p className="text-red-400 text-xs font-bold mb-3 text-center">Wrong password</p>}
          <button onClick={login}
            className="w-full bg-indigo-500 text-white py-3 rounded-2xl font-black uppercase tracking-widest text-xs active:scale-95 transition-transform mb-3">
            Login
          </button>
          <button onClick={onClose}
            className="w-full bg-white/5 text-white/40 py-2.5 rounded-2xl font-bold text-xs">
            Cancel
          </button>
        </motion.div>
      </motion.div>
    );
  }

  // ── Main admin UI ─────────────────────────────────────────────────────────
  var currentAd = ads[activeTab];
  var placements = [
    {id:"receipt", label:"Receipt Ad", icon:"🧾", desc:"Shows on buyer receipt after payment"},
    {id:"feed",    label:"Feed Banner", icon:"📋", desc:"Shows between listings in buyer feed"},
  ];

  return(
    <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
      className="fixed inset-0 z-[900] bg-black/90 backdrop-blur-md flex items-end justify-center"
      onClick={onClose}>
      <motion.div initial={{y:"100%"}} animate={{y:0}} exit={{y:"100%"}}
        transition={{type:"spring",damping:26,stiffness:260}}
        onClick={function(e){e.stopPropagation();}}
        className="w-full max-w-sm bg-[#0d1929] rounded-t-[36px] max-h-[92vh] overflow-y-auto">

        {/* Header */}
        <div className="sticky top-0 bg-[#0d1929] z-10 px-5 pt-5 pb-4 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-white font-black text-lg">🔐 Admin Panel</h2>
              <p className="text-white/30 text-[9px] font-bold uppercase tracking-widest">Nationwide Ad Manager</p>
            </div>
            <button onClick={onClose} className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center text-white text-sm">✕</button>
          </div>
          {/* Tab switcher */}
          <div className="flex gap-2 mt-4">
            {placements.map(function(p){
              return(
                <button key={p.id} onClick={()=>setActiveTab(p.id)}
                  className={"flex-1 py-2 rounded-xl text-[10px] font-black transition-all "+(activeTab===p.id?"bg-indigo-500 text-white":"bg-white/5 text-white/40")}>
                  {p.icon} {p.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="px-5 py-5 space-y-5">
          {/* Placement description */}
          <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl px-4 py-3">
            <p className="text-indigo-300 font-black text-xs">{placements.find(function(p){return p.id===activeTab;}).icon} {placements.find(function(p){return p.id===activeTab;}).label}</p>
            <p className="text-white/40 text-[10px] mt-0.5">{placements.find(function(p){return p.id===activeTab;}).desc}</p>
          </div>

          {/* Active toggle */}
          <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-2xl px-4 py-3">
            <div>
              <p className="text-white font-black text-sm">Ad Active</p>
              <p className="text-white/30 text-[9px]">Turn off to hide this placement</p>
            </div>
            <button onClick={()=>updateAd(activeTab,"active",!currentAd.active)}
              className={"w-12 h-6 rounded-full transition-all relative "+(currentAd.active?"bg-emerald-500":"bg-white/10")}>
              <div className={"w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all "+(currentAd.active?"left-6":"left-0.5")}/>
            </button>
          </div>

          {/* Ad type */}
          <div>
            <label className="text-white/40 text-[9px] font-black uppercase tracking-widest block mb-2">Ad Type</label>
            <div className="grid grid-cols-2 gap-2">
              {["image","video"].map(function(type){
                return(
                  <button key={type} onClick={()=>updateAd(activeTab,"type",type)}
                    className={"py-2.5 rounded-xl font-black text-xs uppercase transition-all "+(currentAd.type===type?"bg-indigo-500 text-white":"bg-white/5 text-white/40 border border-white/10")}>
                    {type==="image"?"🖼️ Image":"🎬 Video"}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Asset URL */}
          <div>
            <label className="text-white/40 text-[9px] font-black uppercase tracking-widest block mb-2">
              {currentAd.type==="video"?"YouTube Embed URL or Video URL":"Image URL"}
            </label>
            <input
              value={currentAd.src}
              onChange={function(e){updateAd(activeTab,"src",e.target.value);}}
              placeholder={currentAd.type==="video"?"https://www.youtube.com/embed/VIDEO_ID":"https://yourdomain.com/ad-image.jpg"}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-xs font-bold focus:border-indigo-500 focus:outline-none"
            />
            {currentAd.type==="image"&&<p className="text-white/20 text-[9px] mt-1">Tip: use Imgur, Cloudinary, or any direct image URL. Recommended size: 800×300px</p>}
            {currentAd.type==="video"&&<p className="text-white/20 text-[9px] mt-1">Tip: use YouTube embed URL format: https://www.youtube.com/embed/VIDEO_ID</p>}
          </div>

          {/* Preview */}
          {currentAd.src&&(
            <div>
              <label className="text-white/40 text-[9px] font-black uppercase tracking-widest block mb-2">Preview</label>
              <div className="rounded-2xl overflow-hidden border border-white/10">
                {currentAd.type==="video"?(
                  <iframe src={currentAd.src} className="w-full h-36" frameBorder="0" allow="autoplay; encrypted-media" allowFullScreen title="preview"/>
                ):(
                  <img src={currentAd.src} className="w-full h-28 object-cover" alt="preview"
                    onError={function(e){e.target.style.display="none";}}/>
                )}
                <div className="bg-white/5 px-3 py-2 flex items-center justify-between">
                  <p className="text-white/60 text-[10px] font-bold truncate flex-1">{currentAd.caption||"Caption appears here"}</p>
                  <span className="text-white/20 text-[9px] ml-2 whitespace-nowrap">{currentAd.ctaLabel||"CTA"}</span>
                </div>
              </div>
            </div>
          )}

          {/* Caption */}
          <div>
            <label className="text-white/40 text-[9px] font-black uppercase tracking-widest block mb-2">Caption</label>
            <input value={currentAd.caption} onChange={function(e){updateAd(activeTab,"caption",e.target.value);}}
              placeholder="Short tagline shown below the ad"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-xs font-bold focus:border-indigo-500 focus:outline-none"/>
          </div>

          {/* Advertiser name */}
          <div>
            <label className="text-white/40 text-[9px] font-black uppercase tracking-widest block mb-2">Advertiser Name</label>
            <input value={currentAd.advertiser} onChange={function(e){updateAd(activeTab,"advertiser",e.target.value);}}
              placeholder="e.g. Maxis, Grab, AirAsia"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-xs font-bold focus:border-indigo-500 focus:outline-none"/>
          </div>

          {/* CTA button */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-white/40 text-[9px] font-black uppercase tracking-widest block mb-2">CTA Label</label>
              <input value={currentAd.ctaLabel} onChange={function(e){updateAd(activeTab,"ctaLabel",e.target.value);}}
                placeholder="Learn More"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-3 text-white text-xs font-bold focus:border-indigo-500 focus:outline-none"/>
            </div>
            <div>
              <label className="text-white/40 text-[9px] font-black uppercase tracking-widest block mb-2">CTA Link</label>
              <input value={currentAd.ctaUrl} onChange={function(e){updateAd(activeTab,"ctaUrl",e.target.value);}}
                placeholder="https://..."
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-3 text-white text-xs font-bold focus:border-indigo-500 focus:outline-none"/>
            </div>
          </div>

          {/* Save / Clear buttons */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button onClick={()=>handleClear(activeTab)}
              className="py-3 rounded-2xl font-black text-xs uppercase bg-red-500/10 text-red-400 border border-red-500/20 active:scale-95 transition-transform">
              🗑️ Clear Ad
            </button>
            <button onClick={handleSave}
              className={"py-3 rounded-2xl font-black text-xs uppercase transition-all active:scale-95 "+(saved?"bg-emerald-500 text-white":"bg-indigo-500 text-white")}>
              {saved?"✅ Saved!":"💾 Save Ad"}
            </button>
          </div>

          <p className="text-white/20 text-[9px] text-center pb-2">Changes go live immediately for all users</p>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────
export default function App(){
  const [lang, setLang]=useState("en");
  const [tab, setTab]=useState("deals");  // "deals" | "student" | "sell"
  const trial       = useTrial();
  const [showAdmin, setShowAdmin]=useState(false);
  const logoTapCount=useRef(0);
  const logoTapTimer=useRef(null);
  function handleLogoTap(){
    logoTapCount.current+=1;
    if(logoTapTimer.current) clearTimeout(logoTapTimer.current);
    logoTapTimer.current=setTimeout(()=>{logoTapCount.current=0;},600);
    if(logoTapCount.current>=3){ setShowAdmin(true); logoTapCount.current=0; }
  }
  const locationHook= useLocation();
  const [vendorMeta,setVendorMeta]   = useState(()=>getVendorProfile());
  const [showOnboarding,setShowOnboarding] = useState(false);
  const [showOrders,setShowOrders]   = useState(false);

  // Auto-request GPS on first load (buyer side)
  useEffect(()=>{
    if(locationHook.status==='idle') locationHook.request();
    loadAdsFromDB(); // load latest ads from Supabase
  },[]);
  const [vendorListings, setVendorListings]=useState([]);
  const [vendorProfile, setVendorProfile]=useState({freeDeliveryThreshold:null,sharedPool:false,notifRadius:DEFAULT_RADIUS,openTime:'09:00',closeTime:'22:00'});
  const [sbListings, setSbListings]=useState([]);     // listings from Supabase
  const [sbLoading, setSbLoading]=useState(true);     // loading state
  const [authUser, setAuthUser]=useState(null);        // logged in user
  const [sbVendorId, setSbVendorId]=useState(null);   // vendor's supabase id

  // ── Auth listener ──────────────────────────────────────────────────────────
  useEffect(()=>{
    supabase.auth.getSession().then(({data:{session}})=>{
      setAuthUser(session?.user||null);
      if(session?.user) loadVendorFromDB(session.user.id);
    });
    const {data:{subscription}} = supabase.auth.onAuthStateChange((_,session)=>{
      setAuthUser(session?.user||null);
      if(session?.user) loadVendorFromDB(session.user.id);
    });
    return ()=>subscription.unsubscribe();
  },[]);

  async function loadVendorFromDB(userId){
    const {data} = await getVendor(userId);
    if(data){ setSbVendorId(data.id); }
  }

  // ── Load listings from Supabase ───────────────────────────────────────────
  useEffect(()=>{
    loadListings();
    // Realtime subscription — new listings appear instantly
    const channel = supabase.channel('listings-changes')
      .on('postgres_changes',{event:'INSERT',schema:'public',table:'listings'},
        (payload)=>{ setSbListings(p=>[mapListing(payload.new),...p]); })
      .on('postgres_changes',{event:'UPDATE',schema:'public',table:'listings'},
        (payload)=>{ setSbListings(p=>p.map(l=>l.id===payload.new.id?mapListing(payload.new):l)); })
      .subscribe();
    return ()=>supabase.removeChannel(channel);
  },[]);

  async function loadListings(){
    setSbLoading(true);
    const {data,error} = await getActiveListings();
    if(!error && data){ setSbListings(data.map(mapListing)); }
    setSbLoading(false);
  }

  function mapListing(l){
    return {
      id: l.id,
      vendorId: l.vendor_id,
      vendorName: l.vendors?.name || l.vendor_name || 'Vendor',
      title: l.title,
      description: l.description||'',
      originalPrice: l.original_price,
      dealPrice: l.deal_price,
      image: l.image||'https://picsum.photos/seed/'+l.id+'/400/300',
      emoji: l.emoji||'🍱',
      postType: l.post_type||'limited',
      halal: l.halal,
      muslimOwned: l.muslim_owned,
      halalCert: l.halal_cert,
      expiresAt: l.expires_at ? new Date(l.expires_at) : null,
      qty: l.qty_remaining||1,
      freeDeliveryThreshold: l.free_delivery_threshold||null,
      sharedPool: l.shared_pool||false,
      vendorLat: l.vendors?.lat||null,
      vendorLon: l.vendors?.lon||null,
      vendorArea: l.vendors?.area||null,
      vendorSubscribed: l.vendors?.subscribed||false,
      fromDB: true,
    };
  }
  const [showHalalDisclaimer, setShowHalalDisclaimer]=useState(true);
  const [notifEnabled, setNotifEnabled]=useState(null); // null=not asked, true, false
  const [showNotifPrompt, setShowNotifPrompt]=useState(false);
  const [notifQueue, setNotifQueue]=useState([]);
  const t=T[lang];

  // Show notif prompt after disclaimer is accepted
  const handleHalalAccept=()=>{
    setShowHalalDisclaimer(false);
    setTimeout(()=>setShowNotifPrompt(true),800);
  };

  // Haversine helper for notification radius check
  const haversineKm=(la1,lo1,la2,lo2)=>{
    const R=6371;
    const dL=(la2-la1)*Math.PI/180;
    const dO=(lo2-lo1)*Math.PI/180;
    const a=Math.sin(dL/2)*Math.sin(dL/2)+
            Math.cos(la1*Math.PI/180)*Math.cos(la2*Math.PI/180)*
            Math.sin(dO/2)*Math.sin(dO/2);
    return R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));
  };

  // When vendor posts: only notify buyers within vendor's radius.
  // Buyer location = locationHook.loc (live GPS or manually set).
  // Vendor location = listing.vendorLat/vendorLon (set at post time from vendorMeta).
  // If buyer has no GPS yet → still notify (give benefit of doubt).
  const handleNewListing=(listing)=>{
    setVendorListings(p=>[listing,...p]);
    if(trial) trial.stamp();
    if(notifEnabled){
      const buyerLoc=locationHook.loc;
      const notifRadius=vendorProfile.notifRadius||DEFAULT_RADIUS;
      var shouldNotify=true; // default: notify if we don't know buyer location
      if(buyerLoc && listing.vendorLat && listing.vendorLon){
        const dist=haversineKm(buyerLoc.lat,buyerLoc.lon,listing.vendorLat,listing.vendorLon);
        shouldNotify = dist <= notifRadius;
      }
      if(shouldNotify){
        setTimeout(()=>{
          setNotifQueue(q=>[...q,listing]);
        },1200);
      }
    }
  };

  const handlePostSuccess=()=>{
    // Auto-switch to deals tab after vendor posts — buyer sees it immediately
    setTimeout(()=>setTab("deals"),400);
  };

  const handleNotifAction=(action)=>{
    setNotifQueue(q=>q.slice(1));
    if(action==="view") setTab("deals");
  };

  return(
    <div className="max-w-sm mx-auto relative">
      {/* Halal disclaimer — first thing shown */}
      <AnimatePresence>
        {showHalalDisclaimer&&<HalalDisclaimer t={t} onAccept={handleHalalAccept}/>}
      </AnimatePresence>

      <header className="sticky top-0 z-50 bg-white border-b border-slate-100 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div onClick={handleLogoTap} className="w-9 h-9 bg-emerald-600 rounded-xl flex items-center justify-center cursor-pointer select-none flex-shrink-0">
            <span className="text-xl">🛒</span>
          </div>
          <div>
            <h1 className="font-black text-emerald-800 text-base leading-none">Sapot Lokal</h1>
            <button onClick={()=>locationHook.status!=='requesting'&&locationHook.request()}
              className="text-left">
              <p className="text-slate-400 text-[10px] font-bold">
                {(function(){
                   if(locationHook.status==='requesting') return '📍 Finding you...';
                   if(locationHook.loc && locationHook.loc.area) return '📍 '+locationHook.loc.area;
                   if(locationHook.status==='denied') return '📍 Tap to enter area';
                   return '📍 Detecting location...';
                 })()}
              </p>
            </button>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <button onClick={()=>setShowOrders(true)}
            className="w-8 h-8 bg-slate-100 rounded-xl flex items-center justify-center text-base relative">
            🧾
          </button>
          <LangToggle lang={lang} setLang={setLang}/>
          {/* 3-tab nav */}
          <div className="flex bg-slate-100 p-1 rounded-xl gap-0.5">
            <button onClick={()=>setTab("deals")} className={`px-2.5 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${tab==="deals"?"bg-white shadow-sm text-emerald-600":"text-slate-400"}`}>{t.buy}</button>
            <button onClick={()=>setTab("student")} className={`px-2 py-1.5 rounded-lg text-[10px] font-black transition-all ${tab==="student"?"bg-white shadow-sm text-indigo-600":"text-slate-400"}`}>{t.studentTab}</button>
            <button onClick={()=>{
              if(!vendorMeta){ setShowOnboarding(true); return; }
              setTab("sell");
            }} className={`px-2.5 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${tab==="sell"?"bg-white shadow-sm text-emerald-600":"text-slate-400"}`}>{t.sell}</button>
          </div>
        </div>
      </header>

      {/* Notification permission prompt — buyer/student tabs only, NOT sell */}
      <AnimatePresence>
        {showNotifPrompt&&notifEnabled===null&&tab!=="sell"&&(
          <NotifPermBanner
            radius={vendorProfile.notifRadius}
            t={t}
            onYes={()=>{setNotifEnabled(true);setShowNotifPrompt(false);}}
            onNo={()=>{setNotifEnabled(false);setShowNotifPrompt(false);}}
          />
        )}
      </AnimatePresence>

      {/* Keep BuyerFeed always mounted — just hide it — so cart and listings survive tab switches */}
      <div style={{display: (tab==="deals"||tab==="student") ? "block" : "none"}}>
        <BuyerFeed vendorListings={vendorListings} sbListings={sbListings} activeTab={tab} notifQueue={notifQueue} onNotifView={handleNotifAction} t={t} userLocation={locationHook.loc} locationHook={locationHook}/>
      </div>
      <AnimatePresence mode="wait">
        {tab==="sell"&&(
          <motion.div key="sell" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
            <VendorFlow onNewListing={handleNewListing} onPostSuccess={()=>setTab("deals")} trial={trial} t={t} vendorProfile={vendorProfile} onUpdateProfile={setVendorProfile} vendorMeta={vendorMeta} locationHook={locationHook} sbVendorId={sbVendorId} authUser={authUser}/>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Admin Panel — triple-tap logo to access */}
      <AnimatePresence>
        {showAdmin&&<AdminPanel onClose={()=>setShowAdmin(false)}/>}
      </AnimatePresence>

      {/* Vendor onboarding — first Sell tab tap */}
      <AnimatePresence>
        {showOnboarding&&(
          <VendorOnboarding t={t} onDone={(profile)=>{
            setVendorMeta(profile);
            setShowOnboarding(false);
            setTab("sell");
          }}/>
        )}
      </AnimatePresence>

      {/* Order history sheet */}
      <AnimatePresence>
        {showOrders&&<OrderHistorySheet t={t} onClose={()=>setShowOrders(false)}/>}
      </AnimatePresence>

    </div>
  );
}