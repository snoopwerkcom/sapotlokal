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
    freeDeliveryFrom:"🎁 Merchant covers delivery from RM{0}",
    noDelivery:"Self-pickup only",
    halalDisclaimerTitle:"Halal Status Notice",
    halalDisclaimerBody:"Halal and Non-Halal status is self-declared by vendors. Sapot Lokal does not verify or guarantee any halal status.\n\nPlease use your own judgement when purchasing.",
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
    thresholdOff:"No merchant delivery offer",
    thresholdWarning:"~RM8 delivery cost deducted from your payout",
    saveSettings:"Save", settingsSaved:"✅ Saved",
    offerFreeDelivery:"Offer to cover delivery cost",
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
    catAll:"All Deals", catFood:"Food",
    // Services tabs
    cateringTab:"🎂 Event Catering", canopyTab:"⛺ Canopy Rental",
    cateringTagline:"Full-service catering for your special event",
    canopyTagline:"Tables, chairs, canopies & fans delivered to you",
    // Catering form
    cateringStep1:"Event Details", cateringStep2:"Your Info", cateringStep3:"Submitted!",
    cateringPax:"How many pax?", cateringPaxPlaceholder:"e.g. 50",
    cateringEvent:"Type of event?", cateringEventPlaceholder:"e.g. Birthday, Full Moon, Anniversary...",
    cateringDate:"Event date?", cateringTime:"Event time?",
    cateringVenue:"Venue / location?", cateringVenuePlaceholder:"e.g. Taman Puchong Indah Community Hall",
    cateringNotes:"Special requests (optional)", cateringNotesPlaceholder:"Dietary needs, theme, etc.",
    cateringName:"Your name", cateringPhone:"Your phone number",
    cateringNamePlaceholder:"Full name", cateringPhonePlaceholder:"e.g. 0123456789",
    cateringSubmit:"Send Enquiry →", cateringBack:"← Back",
    cateringSuccessTitle:"Enquiry Sent! 🎉", cateringSuccessId:"Reference ID",
    cateringSuccessMsg:"We'll WhatsApp you a menu & quotation within 24 hours.",
    cateringWA:"Contact via WhatsApp",
    cateringNewQuery:"Submit Another Enquiry",
    cateringEvents:["Birthday 🎂","Full Moon 🌕","Anniversary 💍","Wedding 💒","Corporate 🏢","Aqiqah 🐑","Kenduri 🍽️","Other ✏️"],
    cateringEventOther:"Other (please specify)",
    cateringMyQueries:"My Enquiries",
    cateringStatusPending:"Pending Review", cateringStatusQuoted:"Quotation Sent", cateringStatusAccepted:"Accepted", cateringStatusPaid:"Paid",
    cateringPayNow:"Pay Deposit Now",
    // Canopy form
    canopyStep1:"Rental Details", canopyStep2:"Your Info", canopyStep3:"Confirmed!",
    canopyDate:"Event date?", canopyTime:"Setup time?",
    canopyVenue:"Delivery address?", canopyVenuePlaceholder:"e.g. No. 5, Jalan Wawasan, Puchong",
    canopyQtyCanopy:"No. of canopies", canopyQtyTable:"No. of tables", canopyQtyChair:"No. of chairs", canopyQtyFan:"No. of fans",
    canopyNotes:"Additional notes (optional)", canopyNotesPlaceholder:"e.g. Need lighting, generator, etc.",
    canopyName:"Your name", canopyPhone:"Your phone number",
    canopyNamePlaceholder:"Full name", canopyPhonePlaceholder:"e.g. 0123456789",
    canopySubmit:"Send Rental Enquiry →",
    canopySuccessTitle:"Enquiry Received! ⛺", canopySuccessMsg:"We'll WhatsApp you a quotation within 24 hours.",
    canopyWA:"Contact via WhatsApp",
    canopyNewQuery:"Submit Another Enquiry",
    canopyMyQueries:"My Enquiries",
    canopyStatusPending:"Pending Review", canopyStatusQuoted:"Quote Sent", canopyStatusAccepted:"Confirmed", canopyStatusPaid:"Paid", catDrink:"Drink", catFruit:"Fruit", catBakery:"Bakery", catDessert:"Dessert", catTongSui:"Tong Sui", catOther:"Other",
    // Merchant Orders Dashboard
    ordersTab:"Orders", ordersManage:"Manage incoming orders",
    orderStatusNew:"New", orderStatusCooking:"Cooking", orderStatusReady:"Ready", orderStatusDone:"Done",
    ordersActive:"Active", ordersDone:"Done", ordersAll:"All",
    ordersNoActive:"No active orders", ordersNoneYet:"No orders yet",
    ordersBuyersHere:"Orders from buyers will appear here",
    ordersLoadDemo:"Load Demo Orders",
    ordersPickupCode:"Pickup Code",
    ordersTotal:"Total", ordersDelivery:"Lalamove Delivery",
    ordersDrop:"Drop", ordersMobile:"Mobile",
    ordersMinLeft:"{0}m left",
    ordersCookingBtn:"Cooking ({0}m)", ordersStartCooking:"Start Cooking",
    ordersHowManyMins:"How many minutes to cook?", ordersMinsPlaceholder:"mins",
    ordersStartBtn:"Start",
    ordersMarkReady:"✅ Mark Ready + Notify Buyer",
    ordersDoneCollected:"✓ Done / Collected",
    ordersCallRider:"🛵 Call Rider",
    ordersWABuyer:"💬 WhatsApp Buyer",
    ordersNotifyReadyMsg:"✅ *Your order is READY!*\n\nOrder {0}\n🏪 Come pickup now!\n\nPowered by Sapot Lokal",
    ordersRiderMsg:"🛵 *Rider Pickup Request*\n\nOrder: {0}\nItems: {1}\nFrom: {2}\nTo: {3}\n\nBook via Lalamove: https://web.lalamove.com",
    ordersWABuyerMsg:"Hi! Your Sapot Lokal order {0} update:",
    ordersNewPill:"{0} New", ordersCookingPill:"{0} Cooking", ordersReadyPill:"{0} Ready",
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
    freeDeliveryFrom:"🎁 Peniaga cover penghantaran dari RM{0}",
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
    catAll:"Semua Deal", catFood:"Makanan",
    cateringTab:"🎂 Katering Acara", canopyTab:"⛺ Sewa Kanopi",
    cateringTagline:"Katering lengkap untuk majlis istimewa anda",
    canopyTagline:"Meja, kerusi, kanopi & kipas dihantar ke lokasi anda",
    cateringStep1:"Butiran Acara", cateringStep2:"Maklumat Anda", cateringStep3:"Dihantar!",
    cateringPax:"Berapa pax?", cateringPaxPlaceholder:"cth. 50",
    cateringEvent:"Jenis acara?", cateringEventPlaceholder:"cth. Hari Jadi, Bulan Penuh, Ulang Tahun...",
    cateringDate:"Tarikh acara?", cateringTime:"Masa acara?",
    cateringVenue:"Tempat / lokasi?", cateringVenuePlaceholder:"cth. Dewan Komuniti Taman Puchong Indah",
    cateringNotes:"Permintaan khas (pilihan)", cateringNotesPlaceholder:"Keperluan pemakanan, tema, dll.",
    cateringName:"Nama anda", cateringPhone:"No. telefon anda",
    cateringNamePlaceholder:"Nama penuh", cateringPhonePlaceholder:"cth. 0123456789",
    cateringSubmit:"Hantar Pertanyaan →", cateringBack:"← Kembali",
    cateringSuccessTitle:"Pertanyaan Dihantar! 🎉", cateringSuccessId:"ID Rujukan",
    cateringSuccessMsg:"Kami akan WhatsApp menu & sebut harga dalam 24 jam.",
    cateringWA:"Hubungi via WhatsApp",
    cateringNewQuery:"Hantar Pertanyaan Lain",
    cateringEvents:["Hari Jadi 🎂","Bulan Penuh 🌕","Ulang Tahun 💍","Perkahwinan 💒","Korporat 🏢","Aqiqah 🐑","Kenduri 🍽️","Lain-lain ✏️"],
    cateringEventOther:"Lain-lain (sila nyatakan)",
    cateringMyQueries:"Pertanyaan Saya",
    cateringStatusPending:"Menunggu Semakan", cateringStatusQuoted:"Sebut Harga Dihantar", cateringStatusAccepted:"Diterima", cateringStatusPaid:"Dibayar",
    cateringPayNow:"Bayar Deposit Sekarang",
    canopyStep1:"Butiran Sewaan", canopyStep2:"Maklumat Anda", canopyStep3:"Disahkan!",
    canopyDate:"Tarikh acara?", canopyTime:"Masa pemasangan?",
    canopyVenue:"Alamat penghantaran?", canopyVenuePlaceholder:"cth. No. 5, Jalan Wawasan, Puchong",
    canopyQtyCanopy:"Bil. kanopi", canopyQtyTable:"Bil. meja", canopyQtyChair:"Bil. kerusi", canopyQtyFan:"Bil. kipas",
    canopyNotes:"Nota tambahan (pilihan)", canopyNotesPlaceholder:"cth. Perlukan pencahayaan, penjana, dll.",
    canopyName:"Nama anda", canopyPhone:"No. telefon anda",
    canopyNamePlaceholder:"Nama penuh", canopyPhonePlaceholder:"cth. 0123456789",
    canopySubmit:"Hantar Pertanyaan Sewaan →",
    canopySuccessTitle:"Pertanyaan Diterima! ⛺", canopySuccessMsg:"Kami akan WhatsApp sebut harga dalam 24 jam.",
    canopyWA:"Hubungi via WhatsApp",
    canopyNewQuery:"Hantar Pertanyaan Lain",
    canopyMyQueries:"Pertanyaan Saya",
    canopyStatusPending:"Menunggu Semakan", canopyStatusQuoted:"Sebut Harga Dihantar", canopyStatusAccepted:"Disahkan", canopyStatusPaid:"Dibayar", catDrink:"Minuman", catFruit:"Buah", catBakery:"Bakeri", catDessert:"Pencuci Mulut", catTongSui:"Tong Sui", catOther:"Lain-lain",
    shareTitle:"Kongsi Deal", shareWhatsapp:"Kongsi di WhatsApp", shareCopy:"Salin Pautan", shareCopied:"Pautan disalin!",
    shareMsg:"🍱 Tengok deal ni kat Sapot Lokal: {0} dari {1} hanya RM{2}! 👉 {3}",
    // Merchant Orders Dashboard
    ordersTab:"Pesanan", ordersManage:"Urus pesanan masuk",
    orderStatusNew:"Baru", orderStatusCooking:"Memasak", orderStatusReady:"Siap", orderStatusDone:"Selesai",
    ordersActive:"Aktif", ordersDone:"Selesai", ordersAll:"Semua",
    ordersNoActive:"Tiada pesanan aktif", ordersNoneYet:"Belum ada pesanan",
    ordersBuyersHere:"Pesanan dari pembeli akan muncul di sini",
    ordersLoadDemo:"Muat Demo Pesanan",
    ordersPickupCode:"Kod Ambil",
    ordersTotal:"Jumlah", ordersDelivery:"Penghantaran Lalamove",
    ordersDrop:"Hantar ke", ordersMobile:"Telefon",
    ordersMinLeft:"{0}m lagi",
    ordersCookingBtn:"Memasak ({0}m)", ordersStartCooking:"Mula Masak",
    ordersHowManyMins:"Berapa minit untuk masak?", ordersMinsPlaceholder:"min",
    ordersStartBtn:"Mula",
    ordersMarkReady:"✅ Tandakan Siap + Beritahu Pembeli",
    ordersDoneCollected:"✓ Selesai / Diambil",
    ordersCallRider:"🛵 Hubungi Rider",
    ordersWABuyer:"💬 WhatsApp Pembeli",
    ordersNotifyReadyMsg:"✅ *Pesanan anda SIAP!*\n\nPesanan {0}\n🏪 Datang ambil sekarang!\n\nDijana oleh Sapot Lokal",
    ordersRiderMsg:"🛵 *Permintaan Ambil Rider*\n\nPesanan: {0}\nItem: {1}\nDari: {2}\nKe: {3}\n\nTempah via Lalamove: https://web.lalamove.com",
    ordersWABuyerMsg:"Hai! Kemas kini pesanan Sapot Lokal anda {0}:",
    ordersNewPill:"{0} Baru", ordersCookingPill:"{0} Memasak", ordersReadyPill:"{0} Siap",
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
    freeDeliveryFrom:"🎁 商家承担RM{0}以上运费",
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
    catAll:"全部优惠", catFood:"食物",
    cateringTab:"🎂 活动餐饮", canopyTab:"⛺ 帐篷租借",
    cateringTagline:"为您的特别活动提供全套餐饮服务",
    canopyTagline:"桌椅、帐篷和风扇送到您的活动现场",
    cateringStep1:"活动详情", cateringStep2:"您的资料", cateringStep3:"已提交！",
    cateringPax:"需要多少人份？", cateringPaxPlaceholder:"例：50",
    cateringEvent:"活动类型？", cateringEventPlaceholder:"例：生日、满月、周年纪念...",
    cateringDate:"活动日期？", cateringTime:"活动时间？",
    cateringVenue:"地点/场地？", cateringVenuePlaceholder:"例：Taman Puchong Indah 社区礼堂",
    cateringNotes:"特别要求（可选）", cateringNotesPlaceholder:"饮食要求、主题等",
    cateringName:"您的姓名", cateringPhone:"您的手机号",
    cateringNamePlaceholder:"全名", cateringPhonePlaceholder:"例：0123456789",
    cateringSubmit:"发送询价 →", cateringBack:"← 返回",
    cateringSuccessTitle:"询价已发送！🎉", cateringSuccessId:"参考编号",
    cateringSuccessMsg:"我们将在24小时内通过WhatsApp发送菜单及报价。",
    cateringWA:"通过WhatsApp联系",
    cateringNewQuery:"提交另一个询价",
    cateringEvents:["生日 🎂","满月 🌕","周年纪念 💍","婚礼 💒","企业活动 🏢","Aqiqah 🐑","Kenduri 🍽️","其他 ✏️"],
    cateringEventOther:"其他（请说明）",
    cateringMyQueries:"我的询价",
    cateringStatusPending:"待审核", cateringStatusQuoted:"已发报价", cateringStatusAccepted:"已接受", cateringStatusPaid:"已付款",
    cateringPayNow:"立即支付订金",
    canopyStep1:"租借详情", canopyStep2:"您的资料", canopyStep3:"已确认！",
    canopyDate:"活动日期？", canopyTime:"安装时间？",
    canopyVenue:"送货地址？", canopyVenuePlaceholder:"例：No. 5, Jalan Wawasan, Puchong",
    canopyQtyCanopy:"帐篷数量", canopyQtyTable:"桌子数量", canopyQtyChair:"椅子数量", canopyQtyFan:"风扇数量",
    canopyNotes:"额外备注（可选）", canopyNotesPlaceholder:"例：需要照明、发电机等",
    canopyName:"您的姓名", canopyPhone:"您的手机号",
    canopyNamePlaceholder:"全名", canopyPhonePlaceholder:"例：0123456789",
    canopySubmit:"发送租借询价 →",
    canopySuccessTitle:"询价已收到！⛺", canopySuccessMsg:"我们将在24小时内通过WhatsApp发送报价。",
    canopyWA:"通过WhatsApp联系",
    canopyNewQuery:"提交另一个询价",
    canopyMyQueries:"我的询价",
    canopyStatusPending:"待审核", canopyStatusQuoted:"已发报价", canopyStatusAccepted:"已确认", canopyStatusPaid:"已付款", catDrink:"饮料", catFruit:"水果", catBakery:"面包烘焙", catDessert:"甜点", catTongSui:"糖水", catOther:"其他",
    shareTitle:"分享优惠", shareWhatsapp:"WhatsApp分享", shareCopy:"复制链接", shareCopied:"链接已复制！",
    shareMsg:"🍱 在Sapot Lokal发现好优惠：{0}，来自{1}，只需RM{2}！👉 {3}",
    // Merchant Orders Dashboard
    ordersTab:"订单", ordersManage:"管理买家订单",
    orderStatusNew:"新订单", orderStatusCooking:"烹饪中", orderStatusReady:"已准备好", orderStatusDone:"完成",
    ordersActive:"进行中", ordersDone:"已完成", ordersAll:"全部",
    ordersNoActive:"暂无进行中订单", ordersNoneYet:"暂无订单",
    ordersBuyersHere:"买家订单将显示在这里",
    ordersLoadDemo:"加载示范订单",
    ordersPickupCode:"取餐码",
    ordersTotal:"总计", ordersDelivery:"Lalamove送餐",
    ordersDrop:"送到", ordersMobile:"电话",
    ordersMinLeft:"剩{0}分钟",
    ordersCookingBtn:"烹饪中（{0}分钟）", ordersStartCooking:"开始烹饪",
    ordersHowManyMins:"需要几分钟烹饪？", ordersMinsPlaceholder:"分钟",
    ordersStartBtn:"开始",
    ordersMarkReady:"✅ 标记完成 + 通知买家",
    ordersDoneCollected:"✓ 完成 / 已取",
    ordersCallRider:"🛵 联系骑手",
    ordersWABuyer:"💬 WhatsApp 买家",
    ordersNotifyReadyMsg:"✅ *您的订单已准备好！*\n\n订单 {0}\n🏪 请来取餐！\n\nSapot Lokal",
    ordersRiderMsg:"🛵 *骑手取餐请求*\n\n订单：{0}\n商品：{1}\n取货地点：{2}\n送往：{3}\n\n通过Lalamove预订：https://web.lalamove.com",
    ordersWABuyerMsg:"您好！您的Sapot Lokal订单 {0} 更新：",
    ordersNewPill:"{0} 新", ordersCookingPill:"{0} 烹饪中", ordersReadyPill:"{0} 已准备好",
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
  99:{lat:3.0696,lon:101.5989,area:"Puchong"}, // local merchant (this app's vendor)
};

const MOCK_LISTINGS = [
  {id:1,vendorId:1,vendorName:"Warung Mak Teh",vendorPhone:"60123456789",freeDeliveryThreshold:20,studentPrice:2.00,title:"Nasi Lemak Bungkus",desc:"Egg, Sambal, Anchovies",originalPrice:5.00,dealPrice:3.00,emoji:"🍛",image:"https://picsum.photos/seed/nasilemak1/800/600",category:"Food",halal:1,endTime:"21:00",qty:18,claimed:6,type:"limited",reheat:"none",postedAt:Date.now()-60000*20,vendorSubscribed:true},
  {id:2,vendorId:1,vendorName:"Warung Mak Teh",vendorPhone:"60123456789",freeDeliveryThreshold:20,studentPrice:1.50,title:"Teh Tarik Large",desc:"Fresh, thick teh tarik",originalPrice:3.50,dealPrice:2.00,emoji:"🧋",image:"https://picsum.photos/seed/tehtarik/800/600",category:"Drink",halal:1,endTime:"21:00",qty:null,claimed:0,type:"promo",reheat:"none",postedAt:Date.now()-60000*10,vendorSubscribed:true},
  {id:3,vendorId:2,vendorName:"Bakeri Fariz",vendorPhone:"60197654321",freeDeliveryThreshold:30,studentPrice:7.50,title:"Assorted Pastry Box",desc:"Croissant, Danish Almond, Chocolate Bun",originalPrice:15.00,dealPrice:9.90,emoji:"🥐",image:"https://picsum.photos/seed/pastrybox1/800/600",category:"Bakery",halal:1,endTime:"20:30",qty:10,claimed:9,type:"limited",reheat:"oven",postedAt:Date.now()-60000*45,vendorSubscribed:true},
  {id:4,vendorId:3,vendorName:"Uncle Lim Kopitiam",vendorPhone:"60112233445",freeDeliveryThreshold:null,studentPrice:null,title:"Drink Bundle",desc:"Teh Tarik + Milo Ais + Lime Juice",originalPrice:9.00,dealPrice:5.50,emoji:"🧋",image:"https://picsum.photos/seed/drinks1/800/600",category:"Drink",halal:1,endTime:"22:00",qty:null,claimed:3,type:"promo",reheat:"none",postedAt:Date.now()-60000*10,vendorSubscribed:false},
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
const timeAgo = (ts)=>{
  const diff=Date.now()-ts;
  if(diff<60000)return'just now';
  if(diff<3600000)return Math.floor(diff/60000)+'m ago';
  if(diff<86400000)return Math.floor(diff/3600000)+'h ago';
  return Math.floor(diff/86400000)+'d ago';
};
const addHours = (time,hrs)=>{var p=time.split(":");var h=parseInt(p[0]);var m=parseInt(p[1]);var t=h*60+m+hrs*60;return String(Math.floor(t/60)%24).padStart(2,"0")+":"+String(t%60).padStart(2,"0");};
const stockPct = (qty,claimed)=>qty?Math.min(Math.round((claimed/qty)*100),100):null;
const dealTag = (type)=>({limited:{label:"🔥 Limited",bg:"bg-orange-500"},promo:{label:"⚡ Flash",bg:"bg-blue-500"},special:{label:"🌟 Special",bg:"bg-purple-500"}})[type]||{label:"🔥 Limited",bg:"bg-orange-500"};
const fill = (str,...vals)=>vals.reduce((s,v,i)=>s.replace(`{${i}}`,v),str);
const halalBadge = (h)=>{
  if(h===1)return{label:"Halal",bg:"bg-emerald-500"};
  if(h===0)return{label:"Non-Halal",bg:"bg-slate-500"};
  return null;
};

function useCountdown(endTime){
  const [left, setLeft]=useState("");
  useEffect(()=>{
    if(!endTime){setLeft("Live");return;}
    const calc=()=>{
      const now=new Date();
      // endTime can be "HH:MM" string OR ms timestamp number
      let end;
      if(typeof endTime==="number"){
        end=new Date(endTime);
      } else {
        const p=endTime.split(":").map(Number);
        end=new Date();end.setHours(p[0],p[1],0,0);
        // if end time is earlier than now it means next-day edge — treat as expired for today
      }
      if(end<=now){setLeft("Expired");return;}
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
const LS_RATINGS = 'sapot_ratings';
const LS_NOTIFS = 'sapot_notifications';
const LS_VENDOR_PROFILE_EXT = 'sapot_vendor_profile_ext';
const LS_BOOSTS = 'sapot_boosts';
const LS_VENDOR_ORDERS = 'sapot_vendor_orders';
const LS_CATERING_QUERIES = 'sapot_catering_queries';
const LS_CANOPY_QUERIES   = 'sapot_canopy_queries';

// ─── CATERING / CANOPY QUERY HELPERS ─────────────────────────────────────────
function getCateringQueries(){try{return JSON.parse(localStorage.getItem(LS_CATERING_QUERIES)||'[]');}catch{return[];}}
function saveCateringQuery(q){
  const all=getCateringQueries();
  const idx=all.findIndex(x=>x.id===q.id);
  if(idx>=0){all[idx]=q;}else{all.unshift(q);}
  localStorage.setItem(LS_CATERING_QUERIES,JSON.stringify(all.slice(0,200)));
}
function getCanopyQueries(){try{return JSON.parse(localStorage.getItem(LS_CANOPY_QUERIES)||'[]');}catch{return[];}}
function saveCanopyQuery(q){
  const all=getCanopyQueries();
  const idx=all.findIndex(x=>x.id===q.id);
  if(idx>=0){all[idx]=q;}else{all.unshift(q);}
  localStorage.setItem(LS_CANOPY_QUERIES,JSON.stringify(all.slice(0,200)));
}
function genQueryId(){return 'Q'+Date.now().toString(36).toUpperCase()+Math.random().toString(36).slice(2,5).toUpperCase();}

function getVendorOrders(){try{return JSON.parse(localStorage.getItem(LS_VENDOR_ORDERS)||'[]');}catch{return[];}}
function saveVendorOrder(o){
  const all=getVendorOrders();
  const idx=all.findIndex(x=>x.pickupCode===o.pickupCode);
  if(idx>=0){all[idx]=o;}else{all.unshift(o);}
  localStorage.setItem(LS_VENDOR_ORDERS,JSON.stringify(all.slice(0,100)));
}
function updateOrderStatus(pickupCode,status,cookMins?){
  const all=getVendorOrders();
  const idx=all.findIndex(x=>x.pickupCode===pickupCode);
  if(idx>=0){all[idx]={...all[idx],status,cookMins:cookMins||all[idx].cookMins,statusAt:Date.now()};}
  localStorage.setItem(LS_VENDOR_ORDERS,JSON.stringify(all));
}

function getVendorProfile(){try{return JSON.parse(localStorage.getItem(LS_VENDOR)||'null');}catch{return null;}}
function saveVendorProfile(p){localStorage.setItem(LS_VENDOR,JSON.stringify(p));}
function getSubscription(){try{return JSON.parse(localStorage.getItem(LS_SUB)||'null');}catch{return null;}}
function saveSubscription(s){localStorage.setItem(LS_SUB,JSON.stringify(s));}
function getOrders(){try{return JSON.parse(localStorage.getItem(LS_ORDERS)||'[]');}catch{return[];}}
function saveOrder(o){const e=getOrders();localStorage.setItem(LS_ORDERS,JSON.stringify([o,...e].slice(0,20)));}

// ─── RATINGS ─────────────────────────────────────────────────────────────────
function getAllRatings(){try{return JSON.parse(localStorage.getItem(LS_RATINGS)||'{}');}catch{return{};}}
function getVendorRatings(vendorId){return getAllRatings()[String(vendorId)]||[];}
function addReview(vendorId,review){
  const all=getAllRatings();
  const existing=all[String(vendorId)]||[];
  all[String(vendorId)]=[review,...existing].slice(0,50);
  localStorage.setItem(LS_RATINGS,JSON.stringify(all));
}
function avgStars(vendorId){
  const reviews=getVendorRatings(vendorId);
  if(!reviews.length)return null;
  return(reviews.reduce((s,r)=>s+r.stars,0)/reviews.length);
}
(function seedDemoReviews(){
  const all=getAllRatings();
  if(all['1'])return;
  const DEMO_REVIEWS={
    '1':[
      {id:'r1a',vendorId:1,stars:5,comment:"Always fresh and generous portion!",buyerName:"Aisha R.",createdAt:Date.now()-86400000*2},
      {id:'r1b',vendorId:1,stars:4,comment:"Fast pickup, nasi lemak was great",buyerName:"Jun Wei",createdAt:Date.now()-86400000*5},
      {id:'r1c',vendorId:1,stars:5,comment:"Best teh tarik in Puchong!",buyerName:"Priya S.",createdAt:Date.now()-86400000*7},
    ],
    '2':[
      {id:'r2a',vendorId:2,stars:5,comment:"Croissants are legit buttery and flaky",buyerName:"Marcus T.",createdAt:Date.now()-86400000*1},
      {id:'r2b',vendorId:2,stars:4,comment:"Good value for pastry boxes",buyerName:"Lina H.",createdAt:Date.now()-86400000*3},
    ],
    '3':[
      {id:'r3a',vendorId:3,stars:4,comment:"Wonton mee dry style is perfect",buyerName:"David C.",createdAt:Date.now()-86400000*4},
    ],
    '4':[
      {id:'r4a',vendorId:4,stars:5,comment:"Best economy rice near here!",buyerName:"Rahim A.",createdAt:Date.now()-86400000*1},
      {id:'r4b',vendorId:4,stars:3,comment:"Queue was long but worth it",buyerName:"Siti N.",createdAt:Date.now()-86400000*6},
    ],
    '5':[
      {id:'r5a',vendorId:5,stars:5,comment:"Onde-onde melts in your mouth",buyerName:"Mei Ling",createdAt:Date.now()-86400000*2},
    ],
  };
  localStorage.setItem(LS_RATINGS,JSON.stringify(DEMO_REVIEWS));
})();

// Seed a welcome notification if none exist
(function seedWelcomeNotif(){
  if(getNotifications().length>0)return;
  addNotification({type:'welcome',title:'Welcome to Sapot Lokal! 🎉',body:'Fresh deals from local vendors near you. Tap a deal to order!',icon:'🛒'});
  addNotification({type:'deal_alert',title:'New deal: Nasi Lemak Box Set',body:'RM8 from Mak Teh Kitchen — only 5 left!',icon:'🍚'});
  addNotification({type:'deal_alert',title:'Flash deal ending soon!',body:'Croissant Bundle RM12 expires at 3pm',icon:'🥐'});
})();

// ─── NOTIFICATIONS ────────────────────────────────────────────────────────────
function getNotifications(){try{return JSON.parse(localStorage.getItem(LS_NOTIFS)||'[]');}catch{return[];}}
function saveNotifications(notifs){localStorage.setItem(LS_NOTIFS,JSON.stringify(notifs.slice(0,50)));}
function addNotification(notif){
  const existing=getNotifications();
  const n={id:Date.now().toString()+Math.random(),read:false,createdAt:Date.now(),...notif};
  saveNotifications([n,...existing]);
  return n;
}
function markAllRead(){saveNotifications(getNotifications().map(n=>({...n,read:true})));}
function unreadCount(){return getNotifications().filter(n=>!n.read).length;}

// ─── VENDOR EXTENDED PROFILE ──────────────────────────────────────────────────
function getVendorProfileExt(){try{return JSON.parse(localStorage.getItem(LS_VENDOR_PROFILE_EXT)||'null');}catch{return null;}}
function saveVendorProfileExt(p){localStorage.setItem(LS_VENDOR_PROFILE_EXT,JSON.stringify(p));}

// ─── BOOSTS / SPONSORED ──────────────────────────────────────────────────────
const BOOST_PLANS=[
  {id:'b1',label:'2-Hour Boost',hours:2,priceRM:5,badge:'⚡ Boosted',color:'bg-amber-500'},
  {id:'b2',label:'6-Hour Spotlight',hours:6,priceRM:12,badge:'🌟 Spotlight',color:'bg-purple-500'},
  {id:'b3',label:'24-Hour Featured',hours:24,priceRM:20,badge:'👑 Featured',color:'bg-orange-500'},
];
function getBoosts(){try{return JSON.parse(localStorage.getItem(LS_BOOSTS)||'{}');}catch{return{};}}
function isListingBoosted(listingId){
  const b=getBoosts()[String(listingId)];
  if(!b)return null;
  if(b.expiresAt<Date.now())return null;
  return b;
}
function saveBoost(listingId,record){
  const all=getBoosts();all[String(listingId)]=record;
  localStorage.setItem(LS_BOOSTS,JSON.stringify(all));
}

// ─── VENDOR MENUS ─────────────────────────────────────────────────────────────
const LS_MENUS = 'sapot_vendor_menus'; // { [vendorId]: MenuItem[] }
function getAllMenus(){try{return JSON.parse(localStorage.getItem(LS_MENUS)||'{}');}catch{return{};}}
function getVendorMenu(vendorId){return getAllMenus()[String(vendorId)]||[];}
function saveVendorMenu(vendorId,items){const all=getAllMenus();all[String(vendorId)]=items;localStorage.setItem(LS_MENUS,JSON.stringify(all));}

// Seed demo menus for mock vendors so buyers see something on first load
(function seedDemoMenus(){
  const all=getAllMenus();
  if(all['1'])return; // already seeded
  const DEMO={
    '1':[
      {id:'m1a',name:'Nasi Lemak',price:5.00,cat:'Food',desc:'Egg, sambal, anchovies',available:true},
      {id:'m1b',name:'Mee Goreng',price:5.50,cat:'Food',desc:'Spicy fried noodles',available:true},
      {id:'m1c',name:'Teh Tarik',price:2.50,cat:'Drink',desc:'Freshly pulled milk tea',available:true},
      {id:'m1d',name:'Roti Canai',price:2.00,cat:'Food',desc:'With dhal curry',available:true},
    ],
    '2':[
      {id:'m2a',name:'Croissant',price:4.50,cat:'Bakery',desc:'Buttery, freshly baked',available:true},
      {id:'m2b',name:'Chocolate Bun',price:3.00,cat:'Bakery',desc:'Soft with choc filling',available:true},
      {id:'m2c',name:'Coffee',price:5.00,cat:'Drink',desc:'Espresso-based',available:true},
    ],
    '3':[
      {id:'m3a',name:'Wonton Mee',price:8.00,cat:'Food',desc:'Dry or soup style',available:true},
      {id:'m3b',name:'Char Siu Rice',price:9.00,cat:'Food',desc:'BBQ pork over rice',available:true},
      {id:'m3c',name:'Ice Kopi',price:3.00,cat:'Drink',desc:'Traditional kopitiam coffee',available:true},
    ],
    '5':[
      {id:'m5a',name:'Kuih Lapis',price:1.50,cat:'Dessert',desc:'Layered steamed cake',available:true},
      {id:'m5b',name:'Onde-onde',price:5.00,cat:'Dessert',desc:'6 pcs, pandan & gula melaka',available:true},
      {id:'m5c',name:'Bubur Kacang',price:4.00,cat:'TongSui',desc:'Green bean dessert soup',available:true},
    ],
  };
  localStorage.setItem(LS_MENUS,JSON.stringify(DEMO));
})();

// ─── LOCATION HOOK ────────────────────────────────────────────────────────────

// ─── PUSH NOTIFICATION SYSTEM ────────────────────────────────────────────────
function useNotifications(){
  const [notifs,setNotifs]=useState(()=>getNotifications());
  const [showPanel,setShowPanel]=useState(false);
  const [permState,setPermState]=useState(()=>{
    if(typeof Notification==='undefined')return'unavailable';
    return Notification.permission;
  });
  const refresh=()=>setNotifs(getNotifications());
  const requestPush=async()=>{
    if(typeof Notification==='undefined')return;
    if(Notification.permission==='granted'){setPermState('granted');return;}
    const result=await Notification.requestPermission();
    setPermState(result);
    if(result==='granted'){
      addNotification({type:'system',title:'Notifications enabled!',body:"You'll get alerts when new deals go live near you.",icon:'🔔'});
      refresh();
    }
  };
  const push=(notif)=>{
    const n=addNotification(notif);refresh();
    if(typeof Notification!=='undefined'&&Notification.permission==='granted'){
      try{new Notification(notif.title,{body:notif.body});}catch(e){}
    }
    return n;
  };
  const markRead=()=>{markAllRead();refresh();};
  const unread=notifs.filter(n=>!n.read).length;
  return{notifs,unread,showPanel,setShowPanel,requestPush,permState,push,markRead,refresh};
}

function NotificationBell({hook}){
  const {unread,showPanel,setShowPanel,notifs,markRead,requestPush,permState}=hook;
  return(
    <>
      <button onClick={()=>{setShowPanel(!showPanel);if(!showPanel)markRead();}}
        className="relative w-8 h-8 flex items-center justify-center rounded-xl bg-slate-100 active:bg-slate-200 transition-colors">
        <motion.span
          animate={unread>0?{rotate:[0,-20,20,-15,15,-8,8,0],scale:[1,1.15,1.15,1.1,1.1,1.05,1.05,1]}:{}}
          transition={{duration:0.6,repeat:unread>0?Infinity:0,repeatDelay:3}}
          className="text-base leading-none">🔔</motion.span>
        {unread>0&&(
          <motion.span initial={{scale:0}} animate={{scale:1}} transition={{type:"spring",stiffness:400,damping:12}}
            className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[8px] font-black rounded-full flex items-center justify-center">
            {unread>9?'9+':unread}
          </motion.span>
        )}
      </button>
      <AnimatePresence>
        {showPanel&&(
          <motion.div initial={{opacity:0,y:-8,scale:0.95}} animate={{opacity:1,y:0,scale:1}} exit={{opacity:0,y:-8,scale:0.95}}
            transition={{type:"spring",damping:22,stiffness:300}}
            className="absolute top-14 right-3 z-[600] w-80 bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden"
            onClick={e=>e.stopPropagation()}>
            <div className="px-4 pt-4 pb-3 flex items-center justify-between border-b border-slate-100">
              <div>
                <p className="font-black text-slate-900 text-sm">Notifications</p>
                <p className="text-slate-400 text-[10px]">{notifs.length} total</p>
              </div>
              <button onClick={()=>setShowPanel(false)} className="w-7 h-7 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 text-xs">✕</button>
            </div>
            {permState!=='granted'&&permState!=='unavailable'&&(
              <div className="mx-3 mt-3 bg-amber-50 border border-amber-200 rounded-2xl p-3 flex items-start gap-3">
                <span className="text-xl flex-shrink-0">🔔</span>
                <div className="flex-1">
                  <p className="font-black text-amber-800 text-xs">Get deal alerts</p>
                  <p className="text-amber-600 text-[10px] mt-0.5">Never miss a flash deal near you</p>
                </div>
                <button onClick={requestPush} className="bg-amber-500 text-white px-3 py-1.5 rounded-xl font-black text-[10px] uppercase flex-shrink-0">Enable</button>
              </div>
            )}
            {permState==='granted'&&(
              <div className="mx-3 mt-3 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2 flex items-center gap-2">
                <span className="text-sm">✅</span>
                <p className="text-emerald-700 font-black text-[10px]">Push notifications active</p>
              </div>
            )}
            <div className="max-h-72 overflow-y-auto">
              {notifs.length===0?(
                <div className="py-10 text-center">
                  <p className="text-3xl mb-2">🔕</p>
                  <p className="text-slate-400 text-xs font-bold">No notifications yet</p>
                </div>
              ):(
                <div className="divide-y divide-slate-50">
                  {notifs.map(n=>(
                    <div key={n.id} className={`px-4 py-3 flex gap-3 items-start ${n.read?'':'bg-blue-50/40'}`}>
                      <span className="text-xl flex-shrink-0 mt-0.5">{n.icon||'📢'}</span>
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-black truncate ${n.read?'text-slate-600':'text-slate-900'}`}>{n.title}</p>
                        <p className="text-slate-400 text-[10px] leading-tight mt-0.5">{n.body}</p>
                        <p className="text-slate-300 text-[9px] mt-1">{timeAgo(n.createdAt)}</p>
                      </div>
                      {!n.read&&<div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1.5"/>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// ─── RATING MODAL ─────────────────────────────────────────────────────────────
function RatingModal({vendorId,vendorName,orderId,onDone}){
  const [stars,setStars]=useState(0);
  const [hovered,setHovered]=useState(0);
  const [comment,setComment]=useState('');
  const [submitted,setSubmitted]=useState(false);
  const QUICK=['Delicious!','Good value','Fast pickup','Fresh food','Will order again'];
  const handleSubmit=()=>{
    if(!stars)return;
    addReview(vendorId,{id:'rev_'+Date.now(),vendorId,orderId,stars,comment:comment.trim(),buyerName:'You',createdAt:Date.now()});
    setSubmitted(true);
    setTimeout(onDone,1200);
  };
  if(submitted)return(
    <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
      className="fixed inset-0 z-[800] bg-black/70 backdrop-blur-sm flex items-center justify-center p-5">
      <motion.div initial={{scale:0.8}} animate={{scale:1}} transition={{type:"spring",stiffness:300,damping:18}}
        className="bg-white rounded-3xl p-8 text-center max-w-xs w-full">
        <motion.div initial={{scale:0}} animate={{scale:[0,1.3,1]}} transition={{delay:0.1,duration:0.5}} className="text-5xl mb-3">🎉</motion.div>
        <p className="font-black text-slate-900 text-lg">Thanks for your review!</p>
        <p className="text-slate-400 text-sm mt-1">Your feedback helps other buyers.</p>
      </motion.div>
    </motion.div>
  );
  return(
    <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
      className="fixed inset-0 z-[800] bg-black/70 backdrop-blur-sm flex items-end justify-center">
      <motion.div initial={{y:"100%"}} animate={{y:0}} exit={{y:"100%"}} transition={{type:"spring",damping:28,stiffness:280}}
        className="w-full max-w-sm bg-white rounded-t-[36px] p-6 pb-10">
        <div className="flex justify-center mb-4"><div className="w-10 h-1 bg-slate-200 rounded-full"/></div>
        <div className="text-center mb-5">
          <p className="text-2xl mb-1">⭐</p>
          <h2 className="font-black text-slate-900 text-lg">Rate your order</h2>
          <p className="text-slate-500 text-sm mt-0.5">How was <span className="font-black text-slate-800">{vendorName}</span>?</p>
        </div>
        <div className="flex justify-center gap-3 mb-5">
          {[1,2,3,4,5].map(s=>(
            <motion.button key={s} whileTap={{scale:0.8}}
              onMouseEnter={()=>setHovered(s)} onMouseLeave={()=>setHovered(0)}
              onClick={()=>setStars(s)} className="text-4xl transition-transform">
              <motion.span animate={{scale:s<=(hovered||stars)?[1,1.25,1]:1}} transition={{duration:0.15}}>
                {s<=(hovered||stars)?'⭐':'☆'}
              </motion.span>
            </motion.button>
          ))}
        </div>
        {stars>0&&(
          <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} className="flex flex-wrap gap-2 justify-center mb-4">
            {QUICK.map(q=>{const sel=comment===q;return(
              <button key={q} onClick={()=>setComment(sel?'':q)}
                className={`px-3 py-1.5 rounded-full text-[11px] font-black border-2 transition-all ${sel?'bg-emerald-500 border-emerald-500 text-white':'border-slate-200 text-slate-600'}`}>
                {q}
              </button>
            );})}
          </motion.div>
        )}
        {stars>0&&(
          <motion.textarea initial={{opacity:0}} animate={{opacity:1}}
            value={comment} onChange={e=>setComment(e.target.value)}
            placeholder="Tell us more... (optional)"
            className="w-full border border-slate-200 rounded-2xl px-4 py-3 text-sm font-medium focus:border-emerald-500 focus:outline-none resize-none mb-4" rows={2}/>
        )}
        <button onClick={handleSubmit} disabled={!stars}
          className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all active:scale-95 ${stars?'bg-emerald-500 text-white shadow-lg shadow-emerald-100':'bg-slate-100 text-slate-300'}`}>
          {stars?`Submit ${stars}-Star Review`:'Tap a star to rate'}
        </button>
        <button onClick={onDone} className="w-full text-slate-300 text-xs font-bold py-3 mt-1">Skip for now</button>
      </motion.div>
    </motion.div>
  );
}

function StarDisplay({vendorId,size='sm'}){
  const avg=avgStars(vendorId);const count=getVendorRatings(vendorId).length;
  if(!avg)return null;
  return(
    <span className={`inline-flex items-center gap-0.5 ${size==='sm'?'text-[10px]':'text-xs'} font-black`}>
      <span className="text-yellow-400">★</span>
      <span className="text-slate-700">{avg.toFixed(1)}</span>
      <span className="text-slate-400 font-normal">({count})</span>
    </span>
  );
}

function VendorReviewsList({vendorId,vendorName,onClose}){
  const reviews=getVendorRatings(vendorId);
  const avg=avgStars(vendorId);
  const dist=[5,4,3,2,1].map(s=>({stars:s,count:reviews.filter(r=>r.stars===s).length}));
  return(
    <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
      className="fixed inset-0 z-[710] bg-black/70 backdrop-blur-sm flex items-end justify-center">
      <motion.div initial={{y:"100%"}} animate={{y:0}} exit={{y:"100%"}} transition={{type:"spring",damping:28}}
        className="w-full max-w-sm bg-white rounded-t-[36px] max-h-[88vh] flex flex-col">
        <div className="px-5 pt-5 pb-3 border-b border-slate-100 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div><p className="font-black text-slate-900 text-base">{vendorName}</p><p className="text-slate-400 text-xs">Customer Reviews</p></div>
            <button onClick={onClose} className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-500">✕</button>
          </div>
          {avg&&(
            <div className="flex items-center gap-4 mt-3 bg-slate-50 rounded-2xl p-3">
              <div className="text-center">
                <p className="font-black text-slate-900 text-3xl">{avg.toFixed(1)}</p>
                <div className="flex gap-0.5 justify-center">{[1,2,3,4,5].map(s=><span key={s} className={`text-sm ${s<=Math.round(avg)?'text-yellow-400':'text-slate-200'}`}>★</span>)}</div>
                <p className="text-slate-400 text-[10px] mt-0.5">{reviews.length} reviews</p>
              </div>
              <div className="flex-1">
                {dist.map(d=>(
                  <div key={d.stars} className="flex items-center gap-2 mb-0.5">
                    <span className="text-[10px] text-slate-500 w-3">{d.stars}</span>
                    <span className="text-yellow-400 text-[10px]">★</span>
                    <div className="flex-1 bg-slate-200 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-yellow-400 h-full rounded-full" style={{width:reviews.length?`${(d.count/reviews.length)*100}%`:'0%'}}/>
                    </div>
                    <span className="text-[10px] text-slate-400 w-3">{d.count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-3 space-y-3">
          {reviews.length===0?(
            <div className="py-10 text-center"><p className="text-3xl mb-2">💬</p><p className="text-slate-400 text-sm font-bold">No reviews yet</p></div>
          ):reviews.map(r=>(
            <div key={r.id} className="bg-slate-50 rounded-2xl p-3">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center text-[10px] font-black text-emerald-700">{r.buyerName?.[0]||'?'}</div>
                  <p className="font-black text-slate-700 text-xs">{r.buyerName||'Anonymous'}</p>
                </div>
                <div className="flex gap-0.5">{[1,2,3,4,5].map(s=><span key={s} className={`text-xs ${s<=r.stars?'text-yellow-400':'text-slate-200'}`}>★</span>)}</div>
              </div>
              {r.comment&&<p className="text-slate-600 text-xs leading-relaxed">{r.comment}</p>}
              <p className="text-slate-300 text-[9px] mt-1">{timeAgo(r.createdAt)}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── VENDOR PROFILE PAGE (buyer-facing) ──────────────────────────────────────
function VendorProfilePage({vendorId,vendorName,vendorPhone,listings,onClose,onAddToCart,cart,t}){
  const reviews=getVendorRatings(vendorId);
  const avg=avgStars(vendorId);
  const menu=getVendorMenu(vendorId);
  const ext=getVendorProfileExt()||{};
  const [showReviews,setShowReviews]=useState(false);
  const catEmoji={Food:"🍛",Drink:"🧋",Bakery:"🥐",Dessert:"🍡",TongSui:"🍮",Fruit:"🍉",Other:"📦"};
  const cartIds=cart.map(i=>String(i.id));
  // Use seeded bio for mock vendors
  const bioMap={1:"Family-run warung since 2015. Authentic kampung recipes passed down from grandma.",2:"Premium European-style bakery. All breads baked fresh daily at 6am.",3:"Traditional kopitiam, open since 1998.",4:"Pak Din's famous economy rice — always fresh, always generous.",5:"Traditional kuih made fresh every morning. Order early — sells out fast!"};
  const bio=ext.bio||(bioMap[vendorId]||"Local food vendor serving fresh, honest food.");
  const banner=ext.banner||`https://picsum.photos/seed/vendor${vendorId}b/800/300`;
  const avatar=ext.avatar||`https://picsum.photos/seed/vendor${vendorId}a/100/100`;
  const tags=ext.tags||['Halal','Homemade','Daily Fresh'];
  const open=ext.openHours||'8:00 AM';
  const close=ext.closeHours||'3:00 PM';
  const activeListings=listings.filter(l=>{
    if(!l.endTime)return true;
    if(typeof l.endTime==="number")return l.endTime>Date.now();
    const p=l.endTime.split(":").map(Number);const e=new Date();e.setHours(p[0],p[1],0,0);return e>new Date();
  });
  return(
    <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
      className="fixed inset-0 z-[650] bg-black/80 backdrop-blur-md flex items-end justify-center">
      <motion.div initial={{y:"100%"}} animate={{y:0}} exit={{y:"100%"}} transition={{type:"spring",damping:26,stiffness:250}}
        className="w-full max-w-sm bg-white rounded-t-[36px] max-h-[92vh] flex flex-col overflow-hidden">
        <div className="relative flex-shrink-0">
          <div className="w-full h-36 overflow-hidden rounded-t-[36px]">
            <img src={banner} className="w-full h-full object-cover" alt=""/>
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-t-[36px]"/>
          </div>
          <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center text-white text-sm">✕</button>
          <div className="absolute -bottom-8 left-5 w-16 h-16 rounded-2xl overflow-hidden shadow-xl" style={{border:'3px solid white'}}>
            <img src={avatar} className="w-full h-full object-cover" alt=""/>
          </div>
          {activeListings.length>0&&(
            <div className="absolute bottom-3 right-5 bg-emerald-500 text-white text-[9px] font-black px-2.5 py-1 rounded-full flex items-center gap-1">
              <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"/>
              {activeListings.length} Live Deal{activeListings.length!==1?'s':''}
            </div>
          )}
        </div>
        <div className="flex-1 overflow-y-auto">
          <div className="px-5 pt-10 pb-4 border-b border-slate-100">
            <h2 className="font-black text-slate-900 text-xl">{vendorName}</h2>
            <div className="flex items-center gap-3 mt-1.5 flex-wrap">
              {avg&&(
                <button onClick={()=>setShowReviews(true)} className="flex items-center gap-1 bg-yellow-50 border border-yellow-200 px-2.5 py-1 rounded-full">
                  <span className="text-yellow-500 text-sm">★</span>
                  <span className="font-black text-yellow-700 text-xs">{avg.toFixed(1)}</span>
                  <span className="text-yellow-500 text-[10px]">({reviews.length})</span>
                </button>
              )}
              <span className="text-slate-400 text-[10px] font-bold">🕐 {open}–{close}</span>
            </div>
            <p className="text-slate-500 text-xs mt-2 leading-relaxed">{bio}</p>
            <div className="flex gap-1.5 mt-2 flex-wrap">
              {tags.map(tag=><span key={tag} className="bg-emerald-50 text-emerald-700 text-[10px] font-black px-2 py-0.5 rounded-full border border-emerald-200">{tag}</span>)}
            </div>
            {vendorPhone&&(
              <a href={`https://wa.me/${vendorPhone}`} target="_blank" rel="noreferrer"
                className="mt-3 flex items-center gap-2 bg-[#25D366]/10 border border-[#25D366]/20 rounded-xl px-3 py-2 w-fit">
                <span className="text-base">💬</span><span className="text-[#25D366] font-black text-xs">Chat on WhatsApp</span>
              </a>
            )}
          </div>
          {activeListings.length>0&&(
            <div className="px-5 py-4 border-b border-slate-100">
              <p className="font-black text-slate-900 text-sm mb-3">🔥 Live Deals</p>
              <div className="space-y-2">
                {activeListings.map(l=>{
                  const inCart=cartIds.includes(String(l.id));
                  const savings=savingsPct(l.originalPrice,l.dealPrice);
                  return(
                    <div key={l.id} className="flex items-center gap-3 bg-slate-50 rounded-2xl p-3">
                      <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-slate-200"><img src={l.image} className="w-full h-full object-cover" alt=""/></div>
                      <div className="flex-1 min-w-0">
                        <p className="font-black text-slate-800 text-sm truncate">{l.title}</p>
                        <div className="flex items-center gap-1.5">
                          <p className="text-emerald-600 font-black text-sm">RM{fmtRM(l.dealPrice)}</p>
                          {savings&&<span className="bg-yellow-400 text-black text-[8px] font-black px-1.5 py-0.5 rounded-full">-{savings}%</span>}
                        </div>
                      </div>
                      <button onClick={()=>!inCart&&onAddToCart(l)} disabled={inCart}
                        className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-lg flex-shrink-0 ${inCart?"bg-emerald-100 text-emerald-600":"bg-slate-900 text-white"}`}>
                        {inCart?"✓":"+"}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          {menu.length>0&&(
            <div className="px-5 py-4 border-b border-slate-100">
              <p className="font-black text-slate-900 text-sm mb-3">📋 Menu ({menu.filter(m=>m.available!==false).length} items)</p>
              <div className="space-y-2">
                {menu.filter(m=>m.available!==false).slice(0,5).map(item=>{
                  const cartKey="menu_"+item.id;const inCart=cartIds.includes(cartKey);
                  return(
                    <div key={item.id} className="flex items-center gap-3 bg-slate-50 rounded-2xl px-3 py-2.5">
                      <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0 bg-white flex items-center justify-center text-base">
                        {item.image?<img src={item.image} className="w-full h-full object-cover" alt=""/>:<span>{catEmoji[item.cat]||"🍽️"}</span>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-black text-slate-800 text-xs truncate">{item.name}</p>
                        <p className="text-emerald-600 font-black text-xs">RM{fmtRM(item.price)}</p>
                      </div>
                      <button onClick={()=>!inCart&&onAddToCart({id:cartKey,vendorId,vendorName,vendorPhone,title:item.name,desc:item.desc||"",dealPrice:item.price,originalPrice:item.price,image:"",category:item.cat,halal:1,freeDeliveryThreshold:null,studentPrice:null,qty:null,claimed:0,type:"menu",})} disabled={inCart}
                        className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-base flex-shrink-0 ${inCart?"bg-emerald-100 text-emerald-600":"bg-slate-900 text-white"}`}>
                        {inCart?"✓":"+"}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          <div className="px-5 py-4">
            <div className="flex items-center justify-between mb-3">
              <p className="font-black text-slate-900 text-sm">Reviews</p>
              {reviews.length>0&&<button onClick={()=>setShowReviews(true)} className="text-emerald-600 font-black text-xs">See all →</button>}
            </div>
            {reviews.slice(0,2).map(r=>(
              <div key={r.id} className="bg-slate-50 rounded-2xl p-3 mb-2">
                <div className="flex items-center justify-between mb-1">
                  <p className="font-black text-slate-700 text-xs">{r.buyerName||'Anonymous'}</p>
                  <div className="flex gap-0.5">{[1,2,3,4,5].map(s=><span key={s} className={`text-[11px] ${s<=r.stars?'text-yellow-400':'text-slate-200'}`}>★</span>)}</div>
                </div>
                {r.comment&&<p className="text-slate-500 text-xs">{r.comment}</p>}
              </div>
            ))}
            {reviews.length===0&&<p className="text-slate-300 text-xs font-bold text-center py-4">No reviews yet</p>}
          </div>
        </div>
      </motion.div>
      <AnimatePresence>{showReviews&&<VendorReviewsList vendorId={vendorId} vendorName={vendorName} onClose={()=>setShowReviews(false)}/>}</AnimatePresence>
    </motion.div>
  );
}

// ─── VENDOR PROFILE EDITOR (merchant side) ───────────────────────────────────
function VendorProfileEditor({vendorMeta,onSave}){
  const existing=getVendorProfileExt()||{};
  const [form,setForm]=useState({bio:existing.bio||'',openHours:existing.openHours||'08:00',closeHours:existing.closeHours||'20:00',tags:existing.tags||[],banner:existing.banner||'',avatar:existing.avatar||''});
  const [saved,setSaved]=useState(false);
  const upd=(k,v)=>setForm(p=>({...p,[k]:v}));
  const TAG_OPTIONS=['Halal','Non-Halal','Homemade','Daily Fresh','Catering','Students Welcome','Delivery','Pickup Only'];
  const handleBanner=(e)=>{const file=e.target.files?.[0];if(!file)return;const r=new FileReader();r.onloadend=()=>upd('banner',r.result);r.readAsDataURL(file);};
  const handleAvatar=(e)=>{const file=e.target.files?.[0];if(!file)return;const r=new FileReader();r.onloadend=()=>upd('avatar',r.result);r.readAsDataURL(file);};
  const handleSave=()=>{saveVendorProfileExt(form);setSaved(true);setTimeout(()=>setSaved(false),2000);if(onSave)onSave(form);};
  return(
    <div className="px-4 pt-3 pb-28">
      <div className="flex items-center justify-between mb-4">
        <div><p className="text-white font-black text-base">Shop Profile</p><p className="text-white/30 text-[10px]">Visible to buyers — build trust</p></div>
        <motion.button whileTap={{scale:0.95}} onClick={handleSave}
          className={`px-4 py-2 rounded-xl font-black text-xs uppercase transition-all ${saved?"bg-emerald-300 text-emerald-900":"bg-emerald-500 text-white"}`}>
          {saved?"✅ Saved":"Save"}
        </motion.button>
      </div>
      <label className="block mb-3 cursor-pointer">
        <p className="text-white/40 text-[9px] font-black uppercase tracking-widest mb-1.5">Shop Banner</p>
        <div className={`w-full h-28 rounded-2xl overflow-hidden flex items-center justify-center border-2 border-dashed transition-all ${form.banner?"border-emerald-500/30":"border-white/10"}`}>
          {form.banner?<img src={form.banner} className="w-full h-full object-cover" alt=""/>:<div className="text-center"><p className="text-2xl mb-1">🖼️</p><p className="text-white/30 text-[10px] font-black">Upload banner photo</p></div>}
        </div>
        <input type="file" accept="image/*" className="hidden" onChange={handleBanner}/>
      </label>
      <label className="flex items-center gap-3 mb-4 cursor-pointer">
        <div className={`w-14 h-14 rounded-2xl overflow-hidden flex items-center justify-center border-2 flex-shrink-0 ${form.avatar?"border-emerald-500/30":"border-white/10 border-dashed"}`}>
          {form.avatar?<img src={form.avatar} className="w-full h-full object-cover" alt=""/>:<span className="text-2xl">🏪</span>}
        </div>
        <div><p className="text-white font-black text-xs">Shop Avatar / Logo</p><p className="text-white/30 text-[10px]">Tap to upload</p></div>
        <input type="file" accept="image/*" className="hidden" onChange={handleAvatar}/>
      </label>
      <div className="mb-3">
        <label className="text-white/40 text-[9px] font-black uppercase tracking-widest block mb-1.5">About Your Shop</label>
        <textarea value={form.bio} onChange={e=>upd('bio',e.target.value)}
          placeholder="Tell buyers about your food, your story, what makes you special..."
          className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-3 text-white text-xs font-medium focus:border-emerald-500 focus:outline-none resize-none" rows={3}/>
      </div>
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div>
          <label className="text-white/40 text-[9px] font-black uppercase tracking-widest block mb-1.5">Opens At</label>
          <input type="time" value={form.openHours} onChange={e=>upd('openHours',e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-xs font-black focus:border-emerald-500 focus:outline-none"/>
        </div>
        <div>
          <label className="text-white/40 text-[9px] font-black uppercase tracking-widest block mb-1.5">Closes At</label>
          <input type="time" value={form.closeHours} onChange={e=>upd('closeHours',e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-xs font-black focus:border-emerald-500 focus:outline-none"/>
        </div>
      </div>
      <div className="mb-4">
        <label className="text-white/40 text-[9px] font-black uppercase tracking-widest block mb-1.5">Shop Tags</label>
        <div className="flex flex-wrap gap-2">
          {TAG_OPTIONS.map(tag=>{const sel=form.tags.includes(tag);return(
            <button key={tag} type="button" onClick={()=>upd('tags',sel?form.tags.filter(x=>x!==tag):[...form.tags,tag])}
              className={`px-3 py-1.5 rounded-full text-[10px] font-black border transition-all ${sel?"bg-emerald-500 border-emerald-500 text-white":"border-white/20 bg-white/5 text-white/50"}`}>
              {tag}
            </button>
          );})}
        </div>
      </div>
      {/* Preview */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-3">
        <p className="text-white/30 text-[9px] font-black uppercase mb-2">Buyer preview</p>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl overflow-hidden bg-white/10 flex-shrink-0 flex items-center justify-center">
            {form.avatar?<img src={form.avatar} className="w-full h-full object-cover" alt=""/>:<span className="text-2xl">🏪</span>}
          </div>
          <div>
            <p className="text-white font-black text-sm">{vendorMeta?.shopName||"My Shop"}</p>
            <p className="text-white/40 text-[10px]">{form.openHours}–{form.closeHours} · {vendorMeta?.area||""}</p>
          </div>
        </div>
        {form.bio&&<p className="text-white/30 text-[10px] mt-2 line-clamp-2">{form.bio}</p>}
      </div>
    </div>
  );
}


// ─── MERCHANT ORDERS DASHBOARD ───────────────────────────────────────────────
// useOrderTimer: live countdown for cooking timer
function useOrderTimer(order){
  const [remaining,setRemaining]=useState(()=>{
    if(!order.cookMins||order.status!=='cooking')return null;
    const elapsed=Math.floor((Date.now()-order.statusAt)/60000);
    return Math.max(0,order.cookMins-elapsed);
  });
  useEffect(()=>{
    if(order.status!=='cooking'||!order.cookMins)return;
    const id=setInterval(()=>{
      const elapsed=Math.floor((Date.now()-order.statusAt)/60000);
      setRemaining(Math.max(0,order.cookMins-elapsed));
    },30000);
    return()=>clearInterval(id);
  },[order.status,order.cookMins,order.statusAt]);
  return remaining;
}

function OrderCard({order,onUpdate,t}){
  const [showCookPicker,setShowCookPicker]=useState(false);
  const [cookInput,setCookInput]=useState('10');
  const remaining=useOrderTimer(order);
  const statusColor={new:'bg-blue-500',cooking:'bg-amber-500',ready:'bg-emerald-500',done:'bg-slate-400'};
  const statusLabel={new:t.orderStatusNew,cooking:t.orderStatusCooking,ready:t.orderStatusReady,done:t.orderStatusDone};

  const notifyReady=()=>{
    if(!order.vendorPhone&&!order.mobile)return;
    const phone=order.mobile||'';
    const msg=encodeURIComponent(t.ordersNotifyReadyMsg.replace('{0}',order.pickupCode));
    window.open(`https://wa.me/${phone}?text=${msg}`,'_blank');
  };

  const callRider=()=>{
    const items=order.items?.map(i=>`${i.qty||1}x ${i.title}`).join(', ')||'';
    const msg=encodeURIComponent(t.ordersRiderMsg.replace('{0}',order.pickupCode).replace('{1}',items).replace('{2}',order.vendorName||'').replace('{3}',order.dropAddr||''));
    window.open(`https://wa.me/?text=${msg}`,'_blank');
  };

  return(
    <motion.div layout initial={{opacity:0,y:8}} animate={{opacity:1,y:0}}
      className={`bg-white/5 border rounded-2xl overflow-hidden transition-all ${order.status==='new'?'border-blue-500/40':'border-white/10'}`}>
      {/* Order header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${order.status==='new'?'bg-blue-400 animate-pulse':order.status==='cooking'?'bg-amber-400 animate-pulse':order.status==='ready'?'bg-emerald-400':''}`}/>
          <p className="text-white font-black text-sm">Order {order.pickupCode}</p>
        </div>
        <div className="flex items-center gap-2">
          {order.status==='cooking'&&remaining!==null&&(
            <span className="bg-amber-500/20 border border-amber-500/30 text-amber-300 font-black text-[10px] px-2 py-1 rounded-full">
              🍳 {t.ordersMinLeft.replace('{0}',String(remaining))}
            </span>
          )}
          <span className={`text-white text-[9px] font-black px-2 py-1 rounded-full ${statusColor[order.status||'new']}`}>
            {statusLabel[order.status||'new']}
          </span>
        </div>
      </div>

      {/* Items */}
      <div className="px-4 py-3 border-b border-white/10">
        {(order.items||[]).map((item,i)=>(
          <div key={i} className="flex items-center justify-between text-xs py-0.5">
            <span className="text-white/70">{item.qty||1}× {item.title}</span>
            <span className="text-emerald-400 font-black">RM{fmtRM(item.price||item.dealPrice)}</span>
          </div>
        ))}
        <div className="flex justify-between text-xs pt-2 border-t border-white/10 mt-2">
          <span className="text-white/40">{t.ordersTotal}</span>
          <span className="text-white font-black">RM{fmtRM(order.total||0)}</span>
        </div>
        {order.deliveryMode==='delivery'&&(
          <div className="mt-2 bg-blue-500/10 border border-blue-500/20 rounded-xl px-3 py-2">
            <p className="text-blue-300 font-black text-[9px] uppercase tracking-wider mb-1">{`🛵 ${t.ordersDelivery}`}</p>
            <p className="text-white/50 text-[9px]">{t.ordersDrop}: {order.dropAddr||'—'}</p>
            <p className="text-white/50 text-[9px]">{t.ordersMobile}: {order.mobile||'—'}</p>
          </div>
        )}
      </div>

      {/* Pickup code */}
      <div className="px-4 py-2 border-b border-white/10 flex items-center justify-between">
        <span className="text-white/30 text-[9px] font-black uppercase">{t.ordersPickupCode}</span>
        <span className="text-emerald-400 font-black text-lg tracking-widest">{order.pickupCode}</span>
      </div>

      {/* Action buttons */}
      <div className="px-4 py-3 space-y-2">
        {/* Cooking timer */}
        {(order.status==='new'||order.status==='cooking')&&(
          <>
            {!showCookPicker?(
              <button onClick={()=>setShowCookPicker(true)}
                className={`w-full py-3 rounded-xl font-black text-xs uppercase tracking-wide flex items-center justify-center gap-2 transition-all active:scale-95 ${order.status==='cooking'?'bg-amber-500/20 border border-amber-500/30 text-amber-300':'bg-amber-500 text-white shadow-lg shadow-amber-900/30'}`}>
                🍳 {order.status==='cooking'?t.ordersCookingBtn.replace('{0}',order.cookMins):t.ordersStartCooking}
              </button>
            ):(
              <motion.div initial={{opacity:0,y:-4}} animate={{opacity:1,y:0}} className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3">
                <p className="text-amber-300 font-black text-[10px] mb-2">How many minutes to cook?</p>
                <div className="flex gap-2 flex-wrap mb-2">
                  {[5,10,15,20,30].map(m=>(
                    <button key={m} onClick={()=>setCookInput(String(m))}
                      className={`px-3 py-1.5 rounded-lg font-black text-xs transition-all ${cookInput===String(m)?'bg-amber-500 text-white':'bg-white/10 text-white/50'}`}>
                      {m}m
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input value={cookInput} onChange={e=>setCookInput(e.target.value.replace(/\D/,''))} type="number"
                    className="flex-1 bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white text-xs font-bold focus:border-amber-400 focus:outline-none" placeholder="mins"/>
                  <button onClick={()=>{
                    const mins=parseInt(cookInput)||10;
                    updateOrderStatus(order.pickupCode,'cooking',mins);
                    onUpdate();
                    setShowCookPicker(false);
                  }} className="bg-amber-500 text-white px-4 py-2 rounded-xl font-black text-xs uppercase active:scale-95">
                    {t.ordersStartBtn}
                  </button>
                  <button onClick={()=>setShowCookPicker(false)} className="bg-white/10 text-white/50 px-3 py-2 rounded-xl text-xs">✕</button>
                </div>
              </motion.div>
            )}
          </>
        )}
        {/* Ready */}
        {order.status!=='done'&&order.status!=='ready'&&(
          <button onClick={()=>{updateOrderStatus(order.pickupCode,'ready',undefined);notifyReady();onUpdate();}}
            className="w-full py-3 rounded-xl bg-emerald-500 text-white font-black text-xs uppercase tracking-wide flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg shadow-emerald-900/30">
            ✅ Mark Ready + Notify Buyer
          </button>
        )}
        {order.status==='ready'&&(
          <div className="flex gap-2">
            <button onClick={()=>{updateOrderStatus(order.pickupCode,'done',undefined);onUpdate();}}
              className="flex-1 py-3 rounded-xl bg-slate-600 text-white font-black text-xs uppercase active:scale-95">
              ✓ Done / Collected
            </button>
            {order.deliveryMode==='delivery'&&(
              <button onClick={callRider}
                className="flex-1 py-3 rounded-xl bg-[#F7941D] text-white font-black text-xs uppercase flex items-center justify-center gap-1 active:scale-95">
                🛵 Call Rider
              </button>
            )}
          </div>
        )}
        {/* WhatsApp buyer direct */}
        {order.mobile&&(
          <a href={`https://wa.me/${order.mobile}?text=${encodeURIComponent(t.ordersWABuyerMsg.replace('{0}',order.pickupCode))}`} target="_blank" rel="noreferrer"
            className="w-full py-2 rounded-xl bg-[#25D366]/10 border border-[#25D366]/20 text-[#4CAF50] font-black text-[10px] uppercase flex items-center justify-center gap-2 active:scale-95">
            💬 WhatsApp Buyer
          </a>
        )}
      </div>
    </motion.div>
  );
}

function MerchantOrdersDash({vendorMeta,t}){
  const [orders,setOrders]=useState(()=>getVendorOrders());
  const [filterStatus,setFilterStatus]=useState('active'); // 'active' | 'done' | 'all'
  const refresh=()=>setOrders(getVendorOrders());

  useEffect(()=>{const id=setInterval(refresh,30000);return()=>clearInterval(id);},[]);

  const filtered=orders.filter(o=>{
    if(filterStatus==='active')return o.status!=='done';
    if(filterStatus==='done')return o.status==='done';
    return true;
  });

  const newCount=orders.filter(o=>o.status==='new').length;
  const cookingCount=orders.filter(o=>o.status==='cooking').length;
  const readyCount=orders.filter(o=>o.status==='ready').length;

  // Generate demo orders if empty
  const seedDemo=()=>{
    const DEMO=[
      {pickupCode:'A21B',vendorId:99,vendorName:vendorMeta?.shopName||'My Shop',items:[{qty:2,title:'Nasi Lemak',price:3.00},{qty:1,title:'Teh Tarik',price:2.00}],subtotal:8.00,deliveryCost:0,total:8.00,deliveryMode:'pickup',mobile:'0123456789',dropAddr:'',status:'new',statusAt:Date.now()-120000,orderNum:'#A21B',savedAt:Date.now()-120000},
      {pickupCode:'X4P2',vendorId:99,vendorName:vendorMeta?.shopName||'My Shop',items:[{qty:1,title:'Mee Goreng',price:4.00}],subtotal:4.00,deliveryCost:8.00,total:12.00,deliveryMode:'delivery',mobile:'0198887766',dropAddr:'Unit 3-5, Puchong Perdana',status:'cooking',cookMins:10,statusAt:Date.now()-300000,orderNum:'#X4P2',savedAt:Date.now()-300000},
    ];
    DEMO.forEach(o=>saveVendorOrder(o));
    refresh();
  };

  return(
    <div className="pb-28 px-4 pt-3">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-white font-black text-base">Orders</p>
          <p className="text-white/30 text-[10px]">Manage incoming orders</p>
        </div>
        <button onClick={refresh} className="w-8 h-8 bg-white/10 rounded-xl flex items-center justify-center text-white text-sm active:scale-95">↻</button>
      </div>

      {/* Status summary pills */}
      <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar">
        {newCount>0&&<div className="flex-shrink-0 bg-blue-500/20 border border-blue-500/30 text-blue-300 font-black text-[10px] px-3 py-1.5 rounded-full flex items-center gap-1.5"><div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse"/>{t.ordersNewPill.replace('{0}',newCount)}</div>}
        {cookingCount>0&&<div className="flex-shrink-0 bg-amber-500/20 border border-amber-500/30 text-amber-300 font-black text-[10px] px-3 py-1.5 rounded-full flex items-center gap-1.5">🍳 {t.ordersCookingPill.replace('{0}',cookingCount)}</div>}
        {readyCount>0&&<div className="flex-shrink-0 bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-black text-[10px] px-3 py-1.5 rounded-full flex items-center gap-1.5">✅ {t.ordersReadyPill.replace('{0}',readyCount)}</div>}
        {newCount===0&&cookingCount===0&&readyCount===0&&<div className="flex-shrink-0 bg-white/5 text-white/30 font-black text-[10px] px-3 py-1.5 rounded-full">{t.ordersNoActive}</div>}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-4">
        {[["active",t.ordersActive],["done",t.ordersDone],["all",t.ordersAll]].map(([v,l])=>(
          <button key={v} onClick={()=>setFilterStatus(v)}
            className={`px-3 py-1.5 rounded-xl font-black text-[10px] uppercase transition-all ${filterStatus===v?'bg-white/20 text-white':'bg-white/5 text-white/30'}`}>{l}</button>
        ))}
      </div>

      {filtered.length===0?(
        <div className="py-16 text-center">
          <p className="text-4xl mb-3">📋</p>
          <p className="text-white/40 font-black text-sm mb-1">{filterStatus==='active'?t.ordersNoActive:t.ordersNoneYet}</p>
          <p className="text-white/20 text-[10px] mb-6">Orders from buyers will appear here</p>
          <button onClick={seedDemo} className="bg-white/10 text-white/50 px-4 py-2 rounded-xl font-black text-[10px] uppercase active:scale-95">
            Load Demo Orders
          </button>
        </div>
      ):(
        <div className="space-y-3">
          {filtered.map(order=>(
            <OrderCard key={order.pickupCode} order={order} onUpdate={refresh} t={t}/>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── BOOST / ADVERTISE SHEET ──────────────────────────────────────────────────
function BoostSheet({post,onClose,onBoost}){
  const [selectedPlan,setSelectedPlan]=useState(null);
  const [paying,setPaying]=useState(false);
  const [done,setDone]=useState(false);
  const existing=isListingBoosted(post.id);
  const handlePay=()=>{
    if(!selectedPlan)return;
    setPaying(true);
    setTimeout(()=>{
      const record={listingId:post.id,planId:selectedPlan.id,planLabel:selectedPlan.label,paidRM:selectedPlan.priceRM,boostedAt:Date.now(),expiresAt:Date.now()+selectedPlan.hours*60*60*1000,badge:selectedPlan.badge,color:selectedPlan.color};
      saveBoost(post.id,record);
      setPaying(false);setDone(true);
      if(onBoost)onBoost(record);
    },1500);
  };
  if(done)return(
    <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
      className="fixed inset-0 z-[700] bg-black/70 backdrop-blur-sm flex items-end justify-center">
      <motion.div initial={{y:"100%"}} animate={{y:0}} exit={{y:"100%"}} transition={{type:"spring",damping:26}}
        className="w-full max-w-sm bg-[#0d1929] rounded-t-[36px] p-8 pb-12 text-center">
        <motion.div initial={{scale:0}} animate={{scale:[0,1.3,1]}} transition={{duration:0.5}} className="text-6xl mb-4">🚀</motion.div>
        <h2 className="text-white font-black text-xl mb-1">Deal Boosted!</h2>
        <p className="text-white/50 text-sm mb-6">Pinned to top of feed for {selectedPlan?.hours}h</p>
        <button onClick={onClose} className="w-full bg-emerald-500 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest active:scale-95">Done</button>
      </motion.div>
    </motion.div>
  );
  return(
    <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
      className="fixed inset-0 z-[700] bg-black/70 backdrop-blur-sm flex items-end justify-center" onClick={onClose}>
      <motion.div initial={{y:"100%"}} animate={{y:0}} exit={{y:"100%"}} transition={{type:"spring",damping:26,stiffness:260}}
        onClick={e=>e.stopPropagation()}
        className="w-full max-w-sm bg-[#0d1929] rounded-t-[36px] p-5 pb-10">
        <div className="flex justify-center mb-4"><div className="w-10 h-1 bg-white/10 rounded-full"/></div>
        <div className="flex items-center justify-between mb-4">
          <div><h2 className="text-white font-black text-xl">Boost Deal</h2><p className="text-white/40 text-xs mt-0.5">Pin to top · More visibility · More sales</p></div>
          <button onClick={onClose} className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center text-white">✕</button>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-3 mb-4 flex items-center gap-3">
          {post.image&&<div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0"><img src={post.image} className="w-full h-full object-cover" alt=""/></div>}
          <div className="flex-1 min-w-0">
            <p className="text-white font-black text-sm truncate">{post.title}</p>
            <p className="text-emerald-400 font-black text-xs">RM{fmtRM(post.dealPrice)}</p>
          </div>
          {existing&&<span className={`text-white text-[9px] font-black px-2 py-1 rounded-full ${existing.color}`}>{existing.badge}</span>}
        </div>
        {existing&&(
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl px-3 py-2 mb-4 flex items-center gap-2">
            <span className="text-sm">⚡</span>
            <p className="text-amber-300 text-[10px] font-bold">Active boost! Expires in {Math.max(0,Math.floor((existing.expiresAt-Date.now())/3600000))}h</p>
          </div>
        )}
        <div className="space-y-2 mb-5">
          {BOOST_PLANS.map(plan=>{
            const sel=selectedPlan?.id===plan.id;
            return(
              <motion.button key={plan.id} whileTap={{scale:0.98}} onClick={()=>setSelectedPlan(plan)}
                className={`w-full text-left p-4 rounded-2xl border-2 transition-all ${sel?'border-amber-400 bg-amber-400/10':'border-white/10 bg-white/5'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={`text-[10px] font-black text-white px-2 py-1 rounded-full ${plan.color}`}>{plan.badge}</span>
                    <div>
                      <p className={`font-black text-sm ${sel?"text-amber-300":"text-white"}`}>{plan.label}</p>
                      <p className="text-white/30 text-[10px]">{plan.hours}h boost · Pinned to top</p>
                    </div>
                  </div>
                  <p className={`font-black text-lg ${sel?"text-amber-300":"text-white/60"}`}>RM{plan.priceRM}</p>
                </div>
              </motion.button>
            );
          })}
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex gap-3 mb-4">
          <span className="text-lg flex-shrink-0">💡</span>
          <p className="text-white/40 text-[10px]">Boosted deals get 3–8x more views. RM5 boost can unlock RM150+ in extra orders.</p>
        </div>
        <button onClick={handlePay} disabled={!selectedPlan||paying}
          className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg ${selectedPlan&&!paying?"bg-amber-500 text-white shadow-amber-900/50":"bg-white/5 text-white/20"}`}>
          {paying?<><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>Processing...</>
          :selectedPlan?`💙 Pay RM${selectedPlan.priceRM} via TNG`:"Select a plan"}
        </button>
        <p className="text-white/20 text-[9px] text-center font-bold uppercase mt-2">Paid via TNG eWallet</p>
      </motion.div>
    </motion.div>
  );
}

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
function ListingCard({listing,onAddToCart,inCart,isStudentMode,isLocked,onLockedTap,onVendorTap,t}){
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
  const boost=isListingBoosted(listing.id);

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
        {boost&&<div className={`absolute top-8 right-2 text-white text-[8px] font-black px-2 py-1 rounded-lg shadow-lg ${boost.color}`}>{boost.badge}</div>}
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
        <button onClick={()=>onVendorTap&&onVendorTap(listing)} className="text-left w-full">
          <p className="text-slate-400 text-[9px] font-bold truncate underline-offset-1 hover:text-emerald-600 transition-colors">{listing.vendorName}</p>
        </button>
        <StarDisplay vendorId={listing.vendorId} size="sm"/>
        {isUrgent&&!isSoldOut&&<p className="text-[9px] font-black text-red-500 mt-0.5">⚠️ {listing.qty-listing.claimed} left!</p>}
        <div className="flex items-end justify-between mt-1.5 mb-2">
          <div>
            <p className="text-[9px] text-slate-300 line-through leading-none">RM{fmtRM(showStudentPrice?listing.dealPrice:listing.originalPrice)}</p>
            <p className={`font-black text-sm leading-none ${showStudentPrice?"text-indigo-600":"text-emerald-600"}`}>RM{fmtRM(showStudentPrice?listing.studentPrice:listing.dealPrice)}</p>
          </div>
          {listing.freeDeliveryThreshold&&<span className="text-[8px] font-black text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-md">🎁 Merchant Del</span>}
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

// ─── MENU BROWSE (buyer side) ─────────────────────────────────────────────────
function MenuBrowse({allListings,onAddToCart,cart,t}){
  const cartIds=cart.map(i=>String(i.id));
  const currentVendorId=cart[0]?.vendorId||null;

  const vendorMap=new Map();
  allListings.forEach(l=>vendorMap.set(l.vendorId,{vendorId:l.vendorId,vendorName:l.vendorName,vendorPhone:l.vendorPhone||""}));
  const vendors=[...vendorMap.values()];

  const [selectedVendorId,setSelectedVendorId]=React.useState(()=>currentVendorId||vendors[0]?.vendorId||null);
  const [menuItems,setMenuItems]=React.useState(()=>selectedVendorId?getVendorMenu(selectedVendorId):[]);

  React.useEffect(()=>{if(selectedVendorId)setMenuItems(getVendorMenu(selectedVendorId));},[selectedVendorId]);

  const selectedVendor=vendors.find(v=>v.vendorId===selectedVendorId);
  const catGroups=[...new Set(menuItems.map(m=>m.cat))];
  const catEmoji={Food:"🍛",Drink:"🧋",Bakery:"🥐",Dessert:"🍡",TongSui:"🍮",Fruit:"🍉",Other:"📦"};

  const addMenuItemToCart=(item)=>{
    onAddToCart({
      id:"menu_"+item.id,
      vendorId:selectedVendorId,
      vendorName:selectedVendor?.vendorName||"",
      vendorPhone:selectedVendor?.vendorPhone||"",
      title:item.name,
      desc:item.desc||"",
      dealPrice:item.price,
      originalPrice:item.price,
      image:"",
      category:item.cat,
      halal:1,
      freeDeliveryThreshold:null,
      studentPrice:null,
      qty:null,claimed:0,type:"menu",
    });
  };

  return(
    <div className="pb-32">
      {/* Vendor selector */}
      <div className="px-3 pt-3 mb-3">
        <p className="text-slate-400 text-[9px] font-black uppercase tracking-widest mb-2">Choose a merchant</p>
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {vendors.map(v=>{
            const menu=getVendorMenu(v.vendorId);
            const isActive=selectedVendorId===v.vendorId;
            const locked=!!(currentVendorId&&currentVendorId!==v.vendorId);
            return(
              <button key={v.vendorId} onClick={()=>setSelectedVendorId(v.vendorId)}
                className={`flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-2xl border-2 transition-all active:scale-95 ${isActive?"border-purple-500 bg-purple-50":"border-slate-200 bg-white"}`}>
                <span className="text-base">🏪</span>
                <div className="text-left">
                  <p className={`font-black text-[10px] ${isActive?"text-purple-800":"text-slate-700"}`}>{v.vendorName}</p>
                  <p className="text-slate-400 text-[8px]">{menu.length} items{locked?" · 🔒":""}</p>
                </div>
              </button>
            );
          })}
        </div>
        {currentVendorId&&selectedVendorId!==currentVendorId&&(
          <p className="text-amber-600 text-[9px] font-bold mt-1.5 px-1">⚠️ Cart has items from {cart[0]?.vendorName}. Adding from here will start a new order.</p>
        )}
      </div>

      {selectedVendorId&&(
        menuItems.length===0?(
          <div className="mx-3 bg-white rounded-3xl border border-slate-100 p-8 text-center">
            <p className="text-4xl mb-3">🍽️</p>
            <p className="font-black text-slate-700">No menu yet</p>
            <p className="text-slate-400 text-xs mt-1">{selectedVendor?.vendorName} has not added their menu. Ask them to set it up in their Sell tab.</p>
          </div>
        ):(
          <div className="px-3 space-y-4">
            {catGroups.map(cat=>{
              const items=menuItems.filter(m=>m.cat===cat&&m.available!==false);
              if(!items.length)return null;
              return(
                <div key={cat}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-base">{catEmoji[cat]||"🍽️"}</span>
                    <p className="font-black text-slate-700 text-sm">{cat}</p>
                    <div className="flex-1 h-px bg-slate-200"/>
                  </div>
                  <div className="space-y-2">
                    {items.map(item=>{
                      const cartKey="menu_"+item.id;
                      const inCart=cartIds.includes(cartKey);
                      return(
                        <div key={item.id} className="bg-white rounded-2xl border border-slate-100 px-4 py-3 flex items-center gap-3 shadow-sm">
                          <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 bg-slate-100 flex items-center justify-center text-xl">
                            {item.image
                              ?<img src={item.image} className="w-full h-full object-cover" alt=""/>
                              :<span>{catEmoji[item.cat]||"🍽️"}</span>
                            }
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-black text-slate-800 text-sm truncate">{item.name}</p>
                            {item.desc&&<p className="text-slate-400 text-[10px] truncate">{item.desc}</p>}
                            <p className="text-emerald-600 font-black text-sm mt-0.5">RM{fmtRM(item.price)}</p>
                          </div>
                          <motion.button whileTap={{scale:0.88}}
                            onClick={()=>!inCart&&addMenuItemToCart(item)}
                            disabled={inCart}
                            className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-lg flex-shrink-0 shadow-sm transition-all ${inCart?"bg-emerald-100 text-emerald-600":"bg-slate-900 text-white"}`}>
                            {inCart?"✓":"+"}
                          </motion.button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}
    </div>
  );
}

// ─── ADD MENU ITEMS FORM — numbered rows, save all at once ───────────────────
function AddMenuItemsForm({defaultName,defaultCat,onSave,onSkip}){
  const cats=["Food","Drink","Bakery","Dessert","TongSui","Fruit","Other"];
  const catEmoji={Food:"🍛",Drink:"🧋",Bakery:"🥐",Dessert:"🍡",TongSui:"🍮",Fruit:"🍉",Other:"📦"};
  const newRow=(o={})=>({uid:Date.now()+Math.random(),name:"",price:"",cat:"Food",desc:"",image:"",...o});
  const [rows,setRows]=React.useState([newRow({name:defaultName||"",cat:defaultCat||"Food"})]);

  const upd=(uid,k,v)=>setRows(r=>r.map(row=>row.uid===uid?{...row,[k]:v}:row));
  const addRow=()=>setRows(r=>[...r,newRow()]);
  const removeRow=(uid)=>setRows(r=>r.length>1?r.filter(row=>row.uid!==uid):r);
  const valid=rows.filter(r=>r.name.trim()&&r.price&&parseFloat(r.price)>0);

  const handleSave=()=>{
    const items=valid.map(r=>({
      id:Date.now().toString()+Math.random().toString(36).slice(2,5),
      name:r.name.trim(),price:parseFloat(r.price),
      cat:r.cat,desc:r.desc.trim(),image:r.image||"",available:true,
    }));
    onSave(items);
  };

  return(
    <div style={{display:"flex",flexDirection:"column",flex:1,overflow:"hidden"}}>
      <div className="px-5 pt-5 pb-3 border-b border-white/10 flex-shrink-0">
        <p className="text-white font-black text-base">Add to My Menu 🍽️</p>
        <p className="text-white/30 text-[10px] mt-0.5">Fill numbered rows — add as many as you need, then save all at once.</p>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {rows.map((row,idx)=>(
          <div key={row.uid} className="border border-white/10 rounded-2xl p-3 space-y-2">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center text-[10px] font-black text-white flex-shrink-0">{idx+1}</div>
              <p className="text-white/40 text-[9px] font-black uppercase tracking-widest flex-1">Item {idx+1}</p>
              {rows.length>1&&<button onClick={()=>removeRow(row.uid)} className="w-5 h-5 bg-red-500/20 rounded-full flex items-center justify-center text-red-400 text-[9px]">✕</button>}
            </div>
            <input value={row.name} onChange={e=>upd(row.uid,"name",e.target.value)}
              placeholder="Item name e.g. Nasi Lemak *"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-xs font-bold focus:border-emerald-500 focus:outline-none placeholder:text-white/20"/>
            <div className="grid grid-cols-2 gap-2">
              <div className="relative">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/30 text-[10px] font-bold">RM</span>
                <input value={row.price} onChange={e=>upd(row.uid,"price",e.target.value)} type="number" step="0.50" placeholder="Price *"
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-7 pr-2 py-2 text-white text-xs font-black focus:border-emerald-500 focus:outline-none placeholder:text-white/20"/>
              </div>
              <select value={row.cat} onChange={e=>upd(row.uid,"cat",e.target.value)}
                className="bg-white/10 border border-white/10 rounded-xl px-2 py-2 text-white text-xs font-bold focus:border-emerald-500 focus:outline-none">
                {cats.map(c=><option key={c} value={c} className="bg-slate-900">{catEmoji[c]} {c}</option>)}
              </select>
            </div>
            <input value={row.desc} onChange={e=>upd(row.uid,"desc",e.target.value)}
              placeholder="Description (optional)"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-xs font-bold focus:border-emerald-500 focus:outline-none placeholder:text-white/20"/>
            {/* Photo per row */}
            <label className={`flex items-center gap-2 cursor-pointer rounded-xl border px-3 py-2 transition-all ${row.image?"border-emerald-500/40 bg-emerald-500/10":"border-white/10 bg-white/5"}`}>
              {row.image
                ?<><img src={row.image} className="w-8 h-8 rounded-lg object-cover flex-shrink-0" alt=""/><span className="text-emerald-400 font-black text-[10px] flex-1">Photo added ✓</span><span className="text-white/20 text-[9px]">tap to change</span></>
                :<><span className="text-base">📷</span><span className="text-white/30 font-black text-[10px]">Add photo (optional)</span></>
              }
              <input type="file" accept="image/*" capture="environment" className="hidden" onChange={e=>{
                const file=e.target.files&&e.target.files[0];if(!file)return;
                const r2=new FileReader();
                r2.onloadend=()=>upd(row.uid,"image",r2.result);
                r2.readAsDataURL(file);
              }}/>
            </label>
          </div>
        ))}
        <button onClick={addRow}
          className="w-full border-2 border-dashed border-white/15 rounded-2xl py-3 flex items-center justify-center gap-2 text-white/30 font-black text-xs hover:border-white/30 hover:text-white/50 transition-all">
          + Add Row {rows.length+1}
        </button>
      </div>
      <div className="px-4 pb-8 pt-3 border-t border-white/10 flex-shrink-0 space-y-2">
        <motion.button whileTap={{scale:0.97}} onClick={handleSave} disabled={!valid.length}
          className={`w-full py-3.5 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${valid.length?"bg-emerald-500 text-white shadow-lg shadow-emerald-900/50":"bg-white/5 text-white/20"}`}>
          ✅ Save {valid.length} Item{valid.length!==1?"s":""} to Menu
        </motion.button>
        <button onClick={onSkip} className="w-full py-2 text-white/20 font-black text-[10px] uppercase">Skip for now</button>
      </div>
    </div>
  );
}

// ─── VENDOR MENU MANAGER (My Menu tab) ────────────────────────────────────────
function VendorMenuManager({vendorId,t,onDone}){
  const [items,setItems]=React.useState(()=>getVendorMenu(vendorId));
  const [showAdd,setShowAdd]=React.useState(false);
  const [editingId,setEditingId]=React.useState(null); // id of item being edited
  const [editForm,setEditForm]=React.useState({}); // {name,price,cat,desc,image}
  const cats=["Food","Drink","Bakery","Dessert","TongSui","Fruit","Other"];
  const catEmoji={Food:"🍛",Drink:"🧋",Bakery:"🥐",Dessert:"🍡",TongSui:"🍮",Fruit:"🍉",Other:"📦"};

  const persist=(updated)=>{setItems(updated);saveVendorMenu(vendorId,updated);};

  const handleSave=(newItems)=>{
    const updated=[...items,...newItems];
    persist(updated);
    setShowAdd(false);
    if(onDone) onDone();
  };

  const startEdit=(item)=>{
    setEditingId(item.id);
    setEditForm({name:item.name,price:String(item.price),cat:item.cat,desc:item.desc||"",image:item.image||""});
  };

  const saveEdit=(id)=>{
    if(!editForm.name.trim()||!editForm.price) return;
    const updated=items.map(i=>i.id===id?{...i,name:editForm.name.trim(),price:parseFloat(editForm.price),cat:editForm.cat,desc:editForm.desc.trim(),image:editForm.image}:i);
    persist(updated);
    setEditingId(null);
  };

  const handleEditPhoto=(e)=>{
    const file=e.target.files&&e.target.files[0];if(!file)return;
    const r=new FileReader();
    r.onloadend=()=>setEditForm(p=>({...p,image:r.result}));
    r.readAsDataURL(file);
  };

  const toggleAvail=(id)=>{persist(items.map(i=>i.id===id?{...i,available:!i.available}:i));};
  const deleteItem=(id)=>{persist(items.filter(i=>i.id!==id));if(editingId===id)setEditingId(null);};

  if(showAdd) return(
    <div style={{height:"calc(100vh - 130px)",display:"flex",flexDirection:"column"}}>
      <AddMenuItemsForm defaultName="" defaultCat="Food" onSave={handleSave} onSkip={()=>setShowAdd(false)}/>
    </div>
  );

  return(
    <div className="px-4 pt-3 pb-28">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-white font-black text-base">My Menu</p>
          <p className="text-white/30 text-[10px]">{items.length} item{items.length!==1?"s":""} · No expiry — live until you remove</p>
        </div>
        <motion.button whileTap={{scale:0.95}} onClick={()=>setShowAdd(true)}
          className="bg-emerald-500 text-white px-3 py-2 rounded-xl font-black text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-900/50">
          + Add Items
        </motion.button>
      </div>

      {items.length===0?(
        <div className="text-center py-16">
          <p className="text-5xl mb-3">🍽️</p>
          <p className="text-white/40 font-black">No menu items yet</p>
          <p className="text-white/20 text-xs mt-1 mb-5">Buyers can order from your menu anytime</p>
          <button onClick={()=>setShowAdd(true)} className="bg-emerald-500 text-white px-5 py-3 rounded-2xl font-black text-xs uppercase shadow-lg shadow-emerald-900/50">
            + Add Your First Items
          </button>
        </div>
      ):(
        <div className="space-y-2">
          <AnimatePresence>
          {items.map((item,idx)=>(
            <motion.div key={item.id} layout initial={{opacity:0,y:-6}} animate={{opacity:1,y:0}} exit={{opacity:0,x:-20}}>
              {editingId===item.id?(
                /* ── EDIT MODE ── */
                <div className="border-2 border-emerald-500/40 bg-emerald-500/5 rounded-2xl p-3 space-y-2">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center text-[10px] font-black text-white flex-shrink-0">{idx+1}</div>
                    <p className="text-emerald-400 font-black text-[10px] uppercase tracking-widest flex-1">Editing</p>
                    <button onClick={()=>setEditingId(null)} className="text-white/30 text-[10px] font-black">Cancel</button>
                  </div>
                  {/* Photo edit */}
                  <label className={`flex items-center gap-2 cursor-pointer rounded-xl border px-3 py-2 transition-all ${editForm.image?"border-emerald-500/40 bg-emerald-500/10":"border-white/10 bg-white/5"}`}>
                    {editForm.image
                      ?<><img src={editForm.image} className="w-8 h-8 rounded-lg object-cover flex-shrink-0" alt=""/><span className="text-emerald-400 font-black text-[10px] flex-1">Photo ✓</span><span className="text-white/30 text-[9px]">tap to change</span></>
                      :<><span className="text-base">📷</span><span className="text-white/30 font-black text-[10px]">Add photo</span></>
                    }
                    <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleEditPhoto}/>
                  </label>
                  <input value={editForm.name} onChange={e=>setEditForm(p=>({...p,name:e.target.value}))}
                    placeholder="Item name *"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-xs font-bold focus:border-emerald-500 focus:outline-none"/>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="relative">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/30 text-[10px] font-bold">RM</span>
                      <input value={editForm.price} onChange={e=>setEditForm(p=>({...p,price:e.target.value}))} type="number" step="0.50"
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-7 pr-2 py-2 text-white text-xs font-black focus:border-emerald-500 focus:outline-none"/>
                    </div>
                    <select value={editForm.cat} onChange={e=>setEditForm(p=>({...p,cat:e.target.value}))}
                      className="bg-white/10 border border-white/10 rounded-xl px-2 py-2 text-white text-xs font-bold focus:border-emerald-500 focus:outline-none">
                      {cats.map(c=><option key={c} value={c} className="bg-slate-900">{catEmoji[c]} {c}</option>)}
                    </select>
                  </div>
                  <input value={editForm.desc} onChange={e=>setEditForm(p=>({...p,desc:e.target.value}))}
                    placeholder="Description (optional)"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-xs font-bold focus:border-emerald-500 focus:outline-none"/>
                  <div className="flex gap-2 pt-1">
                    <button onClick={()=>saveEdit(item.id)} disabled={!editForm.name.trim()||!editForm.price}
                      className="flex-1 bg-emerald-500 text-white py-2.5 rounded-xl font-black text-xs uppercase disabled:opacity-30">
                      Save Changes
                    </button>
                    <button onClick={()=>deleteItem(item.id)}
                      className="px-4 bg-red-500/20 text-red-400 py-2.5 rounded-xl font-black text-xs uppercase">
                      Delete
                    </button>
                  </div>
                </div>
              ):(
                /* ── VIEW MODE ── */
                <div className={`bg-white/5 border ${item.available?"border-white/10":"border-white/5 opacity-40"} rounded-2xl px-3 py-3 flex items-center gap-3`}>
                  <div className="w-6 h-6 bg-white/10 rounded-lg flex items-center justify-center text-[10px] font-black text-white/40 flex-shrink-0">{idx+1}</div>
                  <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 bg-white/10 flex items-center justify-center">
                    {item.image
                      ?<img src={item.image} className="w-full h-full object-cover" alt=""/>
                      :<span className="text-base">{catEmoji[item.cat]||"🍽️"}</span>
                    }
                  </div>
                  <div className="flex-1 min-w-0" onClick={()=>startEdit(item)} style={{cursor:"pointer"}}>
                    <p className={`font-black text-sm truncate ${item.available?"text-white":"text-white/30"}`}>{item.name}</p>
                    <div className="flex items-center gap-1.5">
                      <p className="text-emerald-400 font-black text-xs">RM{fmtRM(item.price)}</p>
                      <span className="text-white/20 text-[8px]">·</span>
                      <p className="text-white/30 text-[9px]">{item.cat}</p>
                    </div>
                    {item.desc&&<p className="text-white/20 text-[9px] truncate">{item.desc}</p>}
                    <p className="text-white/15 text-[8px] mt-0.5">tap to edit</p>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button onClick={()=>toggleAvail(item.id)} className={`text-[9px] font-black px-2 py-1 rounded-lg ${item.available?"bg-emerald-500/20 text-emerald-400":"bg-white/10 text-white/30"}`}>
                      {item.available?"ON":"OFF"}
                    </button>
                    <button onClick={()=>deleteItem(item.id)} className="w-6 h-6 bg-red-500/15 rounded-lg flex items-center justify-center text-red-400 text-[9px]">✕</button>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

function ContinueShoppingBar({vendorId,vendorName,allListings,cart,onAdd,t}){
  const cartIds=cart.map(i=>String(i.id));
  const moreDeals=allListings.filter(l=>l.vendorId===vendorId&&!cartIds.includes(String(l.id))&&!(l.qty&&l.claimed>=l.qty)).slice(0,4);
  // Also pull menu items not already in cart
  const menuItems=getVendorMenu(vendorId).filter(m=>m.available!==false&&!cartIds.includes("menu_"+m.id)).slice(0,4);
  const catEmoji={Food:"🍛",Drink:"🧋",Bakery:"🥐",Dessert:"🍡",TongSui:"🍮",Fruit:"🍉",Other:"📦"};

  const addMenuItem=(item)=>{
    onAdd({
      id:"menu_"+item.id,
      vendorId,vendorName,
      vendorPhone:"",
      title:item.name,desc:item.desc||"",
      dealPrice:item.price,originalPrice:item.price,
      image:"",category:item.cat,halal:1,
      freeDeliveryThreshold:null,studentPrice:null,
      qty:null,claimed:0,type:"menu",
    });
  };

  if(moreDeals.length===0&&menuItems.length===0)return null;

  return(
    <div className="mt-3">
      <div className="border border-dashed border-emerald-300 bg-emerald-50 rounded-2xl overflow-hidden">
        <div className="px-4 py-3 flex items-center gap-2">
          <span className="text-base">🏪</span>
          <p className="font-black text-emerald-800 text-xs flex-1">{fill(t.continueShoppingBtn,vendorName)}</p>
          <span className="text-emerald-500 text-[10px] font-bold">{moreDeals.length+menuItems.length} more</span>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-3 px-4 no-scrollbar">
          {/* Deals */}
          {moreDeals.map(item=>{
            const inCart=cartIds.includes(String(item.id));
            const savings=savingsPct(item.originalPrice,item.dealPrice);
            return(
              <div key={item.id} className="flex-shrink-0 w-28 bg-white rounded-xl overflow-hidden border border-emerald-100 shadow-sm">
                <div className="relative w-full h-20">
                  <img src={item.image} className="w-full h-full object-cover" alt=""/>
                  {savings&&<span className="absolute top-1 left-1 bg-yellow-400 text-black text-[8px] font-black px-1 rounded">-{savings}%</span>}
                  <span className="absolute top-1 right-1 bg-orange-500 text-white text-[7px] font-black px-1 rounded">DEAL</span>
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
          {/* Menu items */}
          {menuItems.map(item=>{
            const inCart=cartIds.includes("menu_"+item.id);
            return(
              <div key={"m"+item.id} className="flex-shrink-0 w-28 bg-white rounded-xl overflow-hidden border border-purple-100 shadow-sm">
                <div className="w-full h-20 bg-purple-50 flex items-center justify-center text-3xl overflow-hidden">
                  {item.image
                    ?<img src={item.image} className="w-full h-full object-cover" alt=""/>
                    :<span>{catEmoji[item.cat]||"🍽️"}</span>
                  }
                </div>
                <div className="p-1.5">
                  <p className="font-black text-[9px] text-slate-800 truncate">{item.name}</p>
                  <p className="text-emerald-600 font-black text-[10px] mt-0.5">RM{fmtRM(item.price)}</p>
                  <button onClick={()=>!inCart&&addMenuItem(item)} disabled={inCart}
                    className={`w-full mt-1.5 py-1 rounded-lg font-black text-[9px] uppercase transition-all ${inCart?"bg-emerald-100 text-emerald-600":"bg-purple-600 text-white active:scale-95"}`}>
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
  const cartIds=cart.map(i=>String(i.id));
  const threshold=currentVendor?.freeDeliveryThreshold;
  const toGo=threshold?Math.max(0,threshold-subtotal):null;
  const freeUnlocked=threshold&&subtotal>=threshold;
  const deliveryCost=deliveryMode==="pickup"?0:(freeUnlocked?0:DELIVERY_FEE);
  const total=subtotal+deliveryCost;

  // Validate Lalamove form
  useEffect(()=>{
    setLalamoveReady(deliveryMode==="delivery"?(dropAddr.trim().length>5&&mobile.trim().length>=10):true);
  },[deliveryMode,dropAddr,mobile]);

  // Open Lalamove deep-link with prefilled data
  const openLalamove=()=>{
    const merchantName=encodeURIComponent(currentVendor?.vendorName||"Merchant");
    const merchantArea=encodeURIComponent(currentVendor?.vendorArea||"Puchong, Selangor");
    const drop=encodeURIComponent(dropAddr);
    const orders=encodeURIComponent(cart.map(i=>i.title).join(', '));
    window.open(`https://web.lalamove.com/?utm_source=sapotlokal&pickup=${merchantName}%2C${merchantArea}&dropoff=${drop}&phone=${mobile}&notes=Sapot+Lokal+Order+${pickupCode}+${orders}`,'_blank');
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
      pickupAddr:deliveryMode==="delivery"?(currentVendor?.vendorName+', '+(currentVendor?.vendorArea||'')):"",
      dropAddr:deliveryMode==="delivery"?dropAddr:"",
      mobile:deliveryMode==="delivery"?mobile:"",
      savedAt:Date.now(),
    };
    saveOrder(receipt);
    // ── SAVE TO VENDOR ORDERS (for merchant dashboard) ───────────────────────
    const vendorOrderRecord={
      ...receipt,
      status:'new', // 'new' | 'cooking' | 'ready' | 'done'
      cookMins:null,
      statusAt:Date.now(),
      orderNum:'#'+pickupCode,
      items:cart.map(i=>({id:i.id,title:i.title,qty:1,price:i.dealPrice})),
    };
    saveVendorOrder(vendorOrderRecord);
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
                <button onClick={()=>{onCheckout({pickupCode,vendorId:currentVendor?.vendorId,vendorName:currentVendor?.vendorName});onClose();}}
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
                  <div className="flex justify-between text-[10px]"><span className="text-slate-400">{t.deliveryFee}</span><span className={`font-bold ${deliveryCost===0?"text-emerald-600":""}`}>{deliveryMode==="pickup"?t.free:freeUnlocked?`RM${fmtRM(deliveryCost)} (Merchant Paid)`:`RM${fmtRM(deliveryCost)} (Lalamove)`}</span></div>
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
              <div className="px-4 mt-4 mb-2 space-y-2">
                {/* Notify merchant via WhatsApp */}
                <button onClick={()=>{
                  const itemLines=cart.map(i=>`• ${i.title} — RM${fmtRM(i.dealPrice)}`).join('%0A');
                  const msg=`🛒 *New Order — Sapot Lokal*%0A%0AOrder ${pickupCode}%0A${itemLines}%0A%0APickup Code: *${pickupCode}*%0ATotal: RM${fmtRM(total)}`;
                  const phone=currentVendor?.vendorPhone||'';
                  window.open(`https://wa.me/${phone}?text=${msg}`,'_blank');
                }}
                  className="w-full flex items-center justify-center gap-2 bg-[#25D366] text-white py-3.5 rounded-2xl font-black text-xs uppercase tracking-wide active:scale-95 transition-transform shadow-md shadow-green-100">
                  <span className="text-base">💬</span>
                  Notify Merchant via WhatsApp
                </button>
                <div className="grid grid-cols-2 gap-2">
                  {/* Save receipt */}
                  <button onClick={()=>{
                    if(navigator.share){
                      navigator.share({title:'My Sapot Lokal Receipt',text:`Order ${pickupCode} from ${currentVendor?.vendorName} — RM${fmtRM(total)}`}).catch(()=>{});
                    } else { window.print(); }
                  }}
                    className="flex items-center justify-center gap-2 bg-emerald-500 text-white py-3 rounded-2xl font-black text-xs uppercase tracking-wide active:scale-95 transition-transform shadow-md shadow-emerald-100">
                    <span className="text-base">📥</span>
                    Save Receipt
                  </button>
                  {/* Share my copy */}
                  <button onClick={()=>{
                    const msg=`🧾 *Sapot Lokal Receipt*\n🏪 ${currentVendor?.vendorName}\n📦 Code: ${pickupCode}\n💰 RM${fmtRM(total)}`;
                    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`,'_blank');
                  }}
                    className="flex items-center justify-center gap-2 bg-slate-700 text-white py-3 rounded-2xl font-black text-xs uppercase tracking-wide active:scale-95 transition-transform">
                    <span className="text-base">📤</span>
                    Share Copy
                  </button>
                </div>
              </div>
              {/* Download hint */}
              <p className="text-center text-slate-300 text-[9px] font-bold px-5 mb-3">
                {navigator.share?"Tap Save to share receipt via your phone":"Tap Save to print or screenshot this receipt"}
              </p>

              {/* Done button */}
              <div className="px-4 mb-8">
                <button onClick={()=>{onCheckout({pickupCode,vendorId:currentVendor?.vendorId,vendorName:currentVendor?.vendorName});onClose();}}
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
                    {/* Vendor info + quick profile link */}
                    {currentVendor&&(
                      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-base">🏪</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-emerald-700 font-black text-[10px]">{t.orderingFrom}</p>
                            <p className="text-emerald-800 font-black text-sm truncate">{currentVendor.vendorName}</p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <StarDisplay vendorId={currentVendor.vendorId} size="sm"/>
                            </div>
                          </div>
                        </div>
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
                              <p className="text-[10px] font-black text-slate-500">🎁 Add RM{fmtRM(toGo)} — merchant covers delivery!</p>
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

                    {/* "Want to add more?" prompt */}
                    {currentVendor&&(()=>{
                      const moreDeals=allListings.filter(l=>l.vendorId===currentVendor.vendorId&&!cartIds.includes(String(l.id))&&!(l.qty&&l.claimed>=l.qty));
                      const moreMenu=getVendorMenu(currentVendor.vendorId).filter(m=>m.available!==false&&!cartIds.includes("menu_"+m.id));
                      const moreCount=moreDeals.length+moreMenu.length;
                      const vThreshold=currentVendor.freeDeliveryThreshold;
                      const amountToFreeDelivery=vThreshold&&subtotal<vThreshold?fmtRM(vThreshold-subtotal):null;
                      if(!moreCount&&!amountToFreeDelivery)return null;
                      return(
                        <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 flex items-start gap-3">
                          <span className="text-xl flex-shrink-0 mt-0.5">🛒</span>
                          <div className="flex-1">
                            {amountToFreeDelivery&&(
                              <p className="font-black text-amber-800 text-xs">Add RM{amountToFreeDelivery} more — merchant covers delivery! 🎁</p>
                            )}
                            {moreCount>0&&(
                              <p className={`text-amber-700 text-[10px] ${amountToFreeDelivery?"mt-0.5":"font-black text-xs"}`}>
                                {currentVendor.vendorName} has {moreCount} more item{moreCount!==1?"s":""} — scroll up or check the 📋 Menu tab
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })()}

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

// ─── ACTIVE POST BADGE ────────────────────────────────────────────────────────
function ActivePostBadge({post}){
  const [label,setLabel]=React.useState("");
  React.useEffect(()=>{
    const calc=()=>{
      if(!post.endTime){setLabel("🟢 Live");return;}
      const now=Date.now();
      const end=typeof post.endTime==="number"?post.endTime:Date.now();
      if(end<=now){setLabel("🔴 Expired");return;}
      const d=end-now;
      const hh=Math.floor(d/3600000);const mm=Math.floor((d%3600000)/60000);
      const timeStr=new Date(end).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"});
      setLabel(hh>0?`⏱ Until ${timeStr}`:`⏱ ${mm}m left`);
    };
    calc();const id=setInterval(calc,30000);return()=>clearInterval(id);
  },[post.endTime]);
  return <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">{label}</span>;
}


// ─── CATERING SUPPLIER DASHBOARD ─────────────────────────────────────────────
function CateringSupplierDash({t}){
  const [queries,setQueries]=useState(()=>getCateringQueries());
  const [filter,setFilter]=useState('all'); // all | pending | quoted | accepted | paid
  const [expandedId,setExpandedId]=useState(null);
  const [quotingId,setQuotingId]=useState(null);
  const [quoteAmt,setQuoteAmt]=useState('');
  const [quoteNote,setQuoteNote]=useState('');

  const refresh=()=>setQueries(getCateringQueries());
  useEffect(()=>{const id=setInterval(refresh,15000);return()=>clearInterval(id);},[]);

  const filtered=filter==='all'?queries:queries.filter(q=>q.status===filter);
  const counts={all:queries.length,pending:queries.filter(q=>q.status==='pending').length,quoted:queries.filter(q=>q.status==='quoted').length,accepted:queries.filter(q=>q.status==='accepted').length,paid:queries.filter(q=>q.status==='paid').length};

  const updateStatus=(id,status,extra={})=>{
    const all=getCateringQueries();
    const idx=all.findIndex(x=>x.id===id);
    if(idx>=0)all[idx]={...all[idx],status,...extra,updatedAt:Date.now()};
    localStorage.setItem(LS_CATERING_QUERIES,JSON.stringify(all));
    refresh();
  };

  const sendQuote=(id)=>{
    if(!quoteAmt)return;
    updateStatus(id,'quoted',{quotation:quoteAmt,quotationNote:quoteNote});
    // WhatsApp buyer
    const q=getCateringQueries().find(x=>x.id===id);
    if(q?.phone){
      const msg=`🎂 *Sapot Lokal — Catering Quotation*\n\nHi ${q.name||''},\n\nRef: ${id}\nEvent: ${q.eventType} | ${q.pax} pax\nDate: ${q.date} at ${q.time}\n\n💰 Quotation: RM${quoteAmt}${quoteNote?'\n📝 '+quoteNote:''}\n\nReply to accept or ask questions.`;
      window.open(`https://wa.me/${q.phone}?text=${encodeURIComponent(msg)}`,'_blank');
    }
    setQuotingId(null);setQuoteAmt('');setQuoteNote('');
  };

  const acceptQuery=(id)=>updateStatus(id,'accepted');
  const markPaid=(id)=>updateStatus(id,'paid',{paidAt:Date.now()});

  const statusStyle={pending:'bg-amber-100 text-amber-700',quoted:'bg-blue-100 text-blue-700',accepted:'bg-emerald-100 text-emerald-700',paid:'bg-emerald-600 text-white'};
  const statusLabel={pending:t.cateringStatusPending,quoted:t.cateringStatusQuoted,accepted:t.cateringStatusAccepted,paid:t.cateringStatusPaid};

  // Seed demo if empty
  const seedDemo=()=>{
    const DEMOS=[
      {id:genQueryId(),type:'catering',pax:'80',eventType:'Birthday 🎂',date:'2026-03-20',time:'19:00',venue:'Dewan Komuniti Taman Puchong',notes:'Vegetarian options needed',name:'Ahmad Faizi',phone:'0123456789',status:'pending',submittedAt:Date.now()-3600000},
      {id:genQueryId(),type:'catering',pax:'200',eventType:'Aqiqah 🐑',date:'2026-03-25',time:'11:00',venue:'No. 5 Jalan Wawasan, Puchong',notes:'Full halal, no pork',name:'Siti Rahimah',phone:'0198887766',status:'quoted',quotation:'2400',quotationNote:'Includes full setup & cleanup',submittedAt:Date.now()-7200000},
    ];
    DEMOS.forEach(d=>saveCateringQuery(d));
    refresh();
  };

  return(
    <div className="pb-28 px-4 pt-3">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-white font-black text-base">🎂 Catering Enquiries</p>
          <p className="text-white/30 text-[10px]">Manage catering requests from buyers</p>
        </div>
        <button onClick={refresh} className="w-8 h-8 bg-white/10 rounded-xl flex items-center justify-center text-white text-sm active:scale-95">↻</button>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        {[['all','All',counts.all,'bg-white/10'],['pending','Pending',counts.pending,'bg-amber-500/20'],['quoted','Quoted',counts.quoted,'bg-blue-500/20'],['paid','Paid',counts.paid,'bg-emerald-500/20']].map(([v,l,c,bg])=>(
          <button key={v} onClick={()=>setFilter(v)}
            className={`${bg} border rounded-xl py-2 px-1 text-center transition-all active:scale-95 ${filter===v?'border-white/30':'border-white/10'}`}>
            <p className="text-white font-black text-lg leading-none">{c}</p>
            <p className="text-white/50 text-[8px] font-black uppercase mt-0.5">{l}</p>
          </button>
        ))}
      </div>

      {filtered.length===0?(
        <div className="py-16 text-center">
          <p className="text-4xl mb-3">🎂</p>
          <p className="text-white/40 font-black text-sm mb-1">No {filter==='all'?'':''+filter} enquiries yet</p>
          <p className="text-white/20 text-[10px] mb-6">Buyer enquiries will appear here</p>
          <button onClick={seedDemo} className="bg-white/10 text-white/50 px-4 py-2 rounded-xl font-black text-[10px] uppercase active:scale-95">Load Demo Enquiries</button>
        </div>
      ):(
        <div className="space-y-3">
          {filtered.map(q=>(
            <motion.div key={q.id} layout className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
              {/* Header row */}
              <button onClick={()=>setExpandedId(expandedId===q.id?null:q.id)}
                className="w-full flex items-center justify-between px-4 py-3 text-left active:bg-white/5">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${q.status==='pending'?'bg-amber-400 animate-pulse':q.status==='paid'?'bg-emerald-400':'bg-blue-400'}`}/>
                  <div className="min-w-0">
                    <p className="text-white font-black text-sm truncate">{q.eventType} — {q.pax} pax</p>
                    <p className="text-white/40 text-[9px]">{q.name} · {q.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`text-[9px] font-black px-2 py-1 rounded-full ${statusStyle[q.status]||'bg-white/10 text-white/50'}`}>{statusLabel[q.status]||q.status}</span>
                  <span className="text-white/30 text-xs">{expandedId===q.id?'▲':'▼'}</span>
                </div>
              </button>

              {/* Expanded detail */}
              <AnimatePresence>
              {expandedId===q.id&&(
                <motion.div initial={{height:0,opacity:0}} animate={{height:'auto',opacity:1}} exit={{height:0,opacity:0}} className="overflow-hidden">
                  <div className="px-4 pb-4 space-y-3 border-t border-white/10 pt-3">
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
                      <p><span className="text-white/40">Phone:</span> <span className="text-white font-bold">{q.phone}</span></p>
                      <p><span className="text-white/40">Date:</span> <span className="text-white font-bold">{q.date}</span></p>
                      <p><span className="text-white/40">Time:</span> <span className="text-white font-bold">{q.time}</span></p>
                      <p><span className="text-white/40">Pax:</span> <span className="text-white font-bold">{q.pax}</span></p>
                      <p className="col-span-2"><span className="text-white/40">Venue:</span> <span className="text-white font-bold">{q.venue}</span></p>
                      {q.notes&&<p className="col-span-2"><span className="text-white/40">Notes:</span> <span className="text-white font-bold">{q.notes}</span></p>}
                    </div>
                    {q.quotation&&(
                      <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-2.5">
                        <p className="text-emerald-300 font-black text-xs">💰 Quoted: RM{q.quotation}</p>
                        {q.quotationNote&&<p className="text-emerald-400/70 text-[9px] mt-0.5">{q.quotationNote}</p>}
                      </div>
                    )}
                    <p className="text-white/20 text-[8px]">Ref: {q.id}</p>

                    {/* Action buttons */}
                    <div className="space-y-2">
                      {/* Quote form */}
                      {(q.status==='pending'||q.status==='quoted')&&(
                        quotingId===q.id?(
                          <div className="bg-white/5 border border-white/10 rounded-xl p-3 space-y-2">
                            <p className="text-white/60 font-black text-[10px] uppercase">Send Quotation</p>
                            <div className="flex gap-2">
                              <input value={quoteAmt} onChange={e=>setQuoteAmt(e.target.value.replace(/\D/,''))} type="number"
                                placeholder="Amount (RM)" className="flex-1 bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white text-xs font-bold focus:outline-none focus:border-emerald-400"/>
                            </div>
                            <input value={quoteNote} onChange={e=>setQuoteNote(e.target.value)}
                              placeholder="Note (optional)" className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white text-xs font-bold focus:outline-none focus:border-emerald-400"/>
                            <div className="flex gap-2">
                              <button onClick={()=>sendQuote(q.id)} disabled={!quoteAmt}
                                className="flex-1 bg-emerald-500 text-white py-2 rounded-xl font-black text-xs uppercase active:scale-95 disabled:opacity-40">
                                Send via WhatsApp 💬
                              </button>
                              <button onClick={()=>setQuotingId(null)} className="bg-white/10 text-white/50 px-3 py-2 rounded-xl text-xs">✕</button>
                            </div>
                          </div>
                        ):(
                          <button onClick={()=>setQuotingId(q.id)}
                            className="w-full bg-blue-500/20 border border-blue-500/30 text-blue-300 font-black text-xs py-2.5 rounded-xl uppercase active:scale-95">
                            💰 {q.quotation?'Update Quotation':'Send Quotation'}
                          </button>
                        )
                      )}
                      {q.status==='quoted'&&(
                        <button onClick={()=>acceptQuery(q.id)}
                          className="w-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-black text-xs py-2.5 rounded-xl uppercase active:scale-95">
                          ✅ Mark as Accepted
                        </button>
                      )}
                      {q.status==='accepted'&&(
                        <button onClick={()=>markPaid(q.id)}
                          className="w-full bg-emerald-500 text-white font-black text-xs py-2.5 rounded-xl uppercase active:scale-95 shadow-lg shadow-emerald-900/30">
                          💳 Mark as Paid
                        </button>
                      )}
                      <a href={`https://wa.me/${q.phone}?text=${encodeURIComponent('Hi '+q.name+', regarding your catering enquiry ref '+q.id+':')}`} target="_blank" rel="noreferrer"
                        className="flex items-center justify-center gap-2 w-full bg-[#25D366]/10 border border-[#25D366]/20 text-[#4CAF50] font-black text-xs py-2 rounded-xl active:scale-95">
                        💬 WhatsApp Buyer
                      </a>
                    </div>
                  </div>
                </motion.div>
              )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── CANOPY SUPPLIER DASHBOARD ────────────────────────────────────────────────
function CanopySupplierDash({t}){
  const [queries,setQueries]=useState(()=>getCanopyQueries());
  const [filter,setFilter]=useState('all');
  const [expandedId,setExpandedId]=useState(null);
  const [quotingId,setQuotingId]=useState(null);
  const [quoteAmt,setQuoteAmt]=useState('');
  const [quoteNote,setQuoteNote]=useState('');

  const refresh=()=>setQueries(getCanopyQueries());
  useEffect(()=>{const id=setInterval(refresh,15000);return()=>clearInterval(id);},[]);

  const filtered=filter==='all'?queries:queries.filter(q=>q.status===filter);
  const counts={all:queries.length,pending:queries.filter(q=>q.status==='pending').length,quoted:queries.filter(q=>q.status==='quoted').length,accepted:queries.filter(q=>q.status==='accepted').length,paid:queries.filter(q=>q.status==='paid').length};

  const updateStatus=(id,status,extra={})=>{
    const all=getCanopyQueries();
    const idx=all.findIndex(x=>x.id===id);
    if(idx>=0)all[idx]={...all[idx],status,...extra,updatedAt:Date.now()};
    localStorage.setItem(LS_CANOPY_QUERIES,JSON.stringify(all));
    refresh();
  };

  const sendQuote=(id)=>{
    if(!quoteAmt)return;
    updateStatus(id,'quoted',{quotation:quoteAmt,quotationNote:quoteNote});
    const q=getCanopyQueries().find(x=>x.id===id);
    if(q?.phone){
      const msg=`⛺ *Sapot Lokal — Canopy Rental Quotation*\n\nHi ${q.name||''},\n\nRef: ${id}\n⛺${q.qtyCanopy} canopies · 🪵${q.qtyTable} tables · 🪑${q.qtyChair} chairs · 💨${q.qtyFan} fans\nDate: ${q.date} at ${q.time}\n📍 ${q.venue}\n\n💰 Quotation: RM${quoteAmt}${quoteNote?'\n📝 '+quoteNote:''}\n\nReply to confirm booking.`;
      window.open(`https://wa.me/${q.phone}?text=${encodeURIComponent(msg)}`,'_blank');
    }
    setQuotingId(null);setQuoteAmt('');setQuoteNote('');
  };

  const seedDemo=()=>{
    const DEMOS=[
      {id:genQueryId(),type:'canopy',date:'2026-03-22',time:'08:00',venue:'Padang Awam Puchong Perdana',notes:'Near main gate please',name:'Hafiz Rahman',phone:'0112233445',qtyCanopy:3,qtyTable:15,qtyChair:120,qtyFan:6,status:'pending',submittedAt:Date.now()-1800000},
      {id:genQueryId(),type:'canopy',date:'2026-03-29',time:'10:00',venue:'Taman Sri Puchong Community Ground',notes:'Need lighting too',name:'Noraini Hamid',phone:'0167788990',qtyCanopy:5,qtyTable:25,qtyChair:200,qtyFan:10,status:'accepted',quotation:'850',quotationNote:'Includes transport',submittedAt:Date.now()-10800000},
    ];
    DEMOS.forEach(d=>saveCanopyQuery(d));
    refresh();
  };

  const statusStyle={pending:'bg-amber-100 text-amber-700',quoted:'bg-blue-100 text-blue-700',accepted:'bg-emerald-100 text-emerald-700',paid:'bg-emerald-600 text-white'};
  const statusLabel={pending:t.canopyStatusPending,quoted:t.canopyStatusQuoted,accepted:t.canopyStatusAccepted,paid:t.canopyStatusPaid};

  return(
    <div className="pb-28 px-4 pt-3">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-white font-black text-base">⛺ Canopy Rental Enquiries</p>
          <p className="text-white/30 text-[10px]">Manage canopy rental requests</p>
        </div>
        <button onClick={refresh} className="w-8 h-8 bg-white/10 rounded-xl flex items-center justify-center text-white text-sm active:scale-95">↻</button>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        {[['all','All',counts.all,'bg-white/10'],['pending','Pending',counts.pending,'bg-amber-500/20'],['quoted','Quoted',counts.quoted,'bg-blue-500/20'],['paid','Paid',counts.paid,'bg-emerald-500/20']].map(([v,l,c,bg])=>(
          <button key={v} onClick={()=>setFilter(v)}
            className={`${bg} border rounded-xl py-2 px-1 text-center transition-all active:scale-95 ${filter===v?'border-white/30':'border-white/10'}`}>
            <p className="text-white font-black text-lg leading-none">{c}</p>
            <p className="text-white/50 text-[8px] font-black uppercase mt-0.5">{l}</p>
          </button>
        ))}
      </div>

      {filtered.length===0?(
        <div className="py-16 text-center">
          <p className="text-4xl mb-3">⛺</p>
          <p className="text-white/40 font-black text-sm mb-1">No {filter==='all'?'':''+filter} enquiries yet</p>
          <p className="text-white/20 text-[10px] mb-6">Canopy rental requests will appear here</p>
          <button onClick={seedDemo} className="bg-white/10 text-white/50 px-4 py-2 rounded-xl font-black text-[10px] uppercase active:scale-95">Load Demo Enquiries</button>
        </div>
      ):(
        <div className="space-y-3">
          {filtered.map(q=>(
            <motion.div key={q.id} layout className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
              <button onClick={()=>setExpandedId(expandedId===q.id?null:q.id)}
                className="w-full flex items-center justify-between px-4 py-3 text-left active:bg-white/5">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${q.status==='pending'?'bg-amber-400 animate-pulse':q.status==='paid'?'bg-emerald-400':'bg-blue-400'}`}/>
                  <div className="min-w-0">
                    <p className="text-white font-black text-sm">⛺{q.qtyCanopy} · 🪑{q.qtyChair} · 🪵{q.qtyTable} · 💨{q.qtyFan}</p>
                    <p className="text-white/40 text-[9px]">{q.name} · {q.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`text-[9px] font-black px-2 py-1 rounded-full ${statusStyle[q.status]||'bg-white/10 text-white/50'}`}>{statusLabel[q.status]||q.status}</span>
                  <span className="text-white/30 text-xs">{expandedId===q.id?'▲':'▼'}</span>
                </div>
              </button>

              <AnimatePresence>
              {expandedId===q.id&&(
                <motion.div initial={{height:0,opacity:0}} animate={{height:'auto',opacity:1}} exit={{height:0,opacity:0}} className="overflow-hidden">
                  <div className="px-4 pb-4 space-y-3 border-t border-white/10 pt-3">
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
                      <p><span className="text-white/40">Name:</span> <span className="text-white font-bold">{q.name}</span></p>
                      <p><span className="text-white/40">Phone:</span> <span className="text-white font-bold">{q.phone}</span></p>
                      <p><span className="text-white/40">Date:</span> <span className="text-white font-bold">{q.date}</span></p>
                      <p><span className="text-white/40">Time:</span> <span className="text-white font-bold">{q.time}</span></p>
                      <p className="col-span-2"><span className="text-white/40">Venue:</span> <span className="text-white font-bold">{q.venue}</span></p>
                      <p><span className="text-white/40">⛺ Canopy:</span> <span className="text-white font-bold">{q.qtyCanopy}</span></p>
                      <p><span className="text-white/40">🪵 Tables:</span> <span className="text-white font-bold">{q.qtyTable}</span></p>
                      <p><span className="text-white/40">🪑 Chairs:</span> <span className="text-white font-bold">{q.qtyChair}</span></p>
                      <p><span className="text-white/40">💨 Fans:</span> <span className="text-white font-bold">{q.qtyFan}</span></p>
                      {q.notes&&<p className="col-span-2"><span className="text-white/40">Notes:</span> <span className="text-white font-bold">{q.notes}</span></p>}
                    </div>
                    {q.quotation&&(
                      <div className="bg-sky-500/10 border border-sky-500/20 rounded-xl p-2.5">
                        <p className="text-sky-300 font-black text-xs">💰 Quoted: RM{q.quotation}</p>
                        {q.quotationNote&&<p className="text-sky-400/70 text-[9px] mt-0.5">{q.quotationNote}</p>}
                      </div>
                    )}
                    <p className="text-white/20 text-[8px]">Ref: {q.id}</p>

                    <div className="space-y-2">
                      {(q.status==='pending'||q.status==='quoted')&&(
                        quotingId===q.id?(
                          <div className="bg-white/5 border border-white/10 rounded-xl p-3 space-y-2">
                            <p className="text-white/60 font-black text-[10px] uppercase">Send Quotation</p>
                            <input value={quoteAmt} onChange={e=>setQuoteAmt(e.target.value.replace(/\D/,''))} type="number"
                              placeholder="Amount (RM)" className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white text-xs font-bold focus:outline-none focus:border-sky-400"/>
                            <input value={quoteNote} onChange={e=>setQuoteNote(e.target.value)}
                              placeholder="Note e.g. includes transport" className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white text-xs font-bold focus:outline-none focus:border-sky-400"/>
                            <div className="flex gap-2">
                              <button onClick={()=>sendQuote(q.id)} disabled={!quoteAmt}
                                className="flex-1 bg-sky-500 text-white py-2 rounded-xl font-black text-xs uppercase active:scale-95 disabled:opacity-40">
                                Send via WhatsApp 💬
                              </button>
                              <button onClick={()=>setQuotingId(null)} className="bg-white/10 text-white/50 px-3 py-2 rounded-xl text-xs">✕</button>
                            </div>
                          </div>
                        ):(
                          <button onClick={()=>setQuotingId(q.id)}
                            className="w-full bg-sky-500/20 border border-sky-500/30 text-sky-300 font-black text-xs py-2.5 rounded-xl uppercase active:scale-95">
                            💰 {q.quotation?'Update Quotation':'Send Quotation'}
                          </button>
                        )
                      )}
                      {q.status==='quoted'&&(
                        <button onClick={()=>updateStatus(q.id,'accepted')}
                          className="w-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-black text-xs py-2.5 rounded-xl uppercase active:scale-95">
                          ✅ Mark as Accepted
                        </button>
                      )}
                      {q.status==='accepted'&&(
                        <button onClick={()=>updateStatus(q.id,'paid',{paidAt:Date.now()})}
                          className="w-full bg-emerald-500 text-white font-black text-xs py-2.5 rounded-xl uppercase active:scale-95 shadow-lg shadow-emerald-900/30">
                          💳 Mark as Paid
                        </button>
                      )}
                      <a href={`https://wa.me/${q.phone}?text=${encodeURIComponent('Hi '+q.name+', regarding your canopy rental enquiry ref '+q.id+':')}`} target="_blank" rel="noreferrer"
                        className="flex items-center justify-center gap-2 w-full bg-[#25D366]/10 border border-[#25D366]/20 text-[#4CAF50] font-black text-xs py-2 rounded-xl active:scale-95">
                        💬 WhatsApp Buyer
                      </a>
                    </div>
                  </div>
                </motion.div>
              )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}


function VendorFlow({onNewListing,onPostDone,vendorMeta,subscription,onShowSubscription,t}){
  const [vendorFlowTab,setVendorFlowTab]=useState("orders"); // "deals" | "menu" | "profile" | "orders" | "catering" | "canopy"
  const [postDealNudge,setPostDealNudge]=useState(false);
  const [step,setStep]=useState(1);
  const [postType,setPostType]=useState(null);
  const [template,setTemplate]=useState(null);
  const [photo,setPhoto]=useState(null);
  const [uploading,setUploading]=useState(false);
  const [publishing,setPublishing]=useState(false);
  const [activePosts,setActivePosts]=useState([]);
  const [form,setForm]=useState({title:"",desc:"",price:"",original:"",endTime:"",qty:"",reheat:"none",halal:null,hasStudentPrice:false,studentPrice:""});
  const [cancelTarget,setCancelTarget]=useState(null);
  const [boostTarget,setBoostTarget]=useState(null); // post to boost
  const [showSuccess,setShowSuccess]=useState(false);
  const [showAddMenu,setShowAddMenu]=useState(false);
  const [lastPosted,setLastPosted]=useState(null);
  const upd=(k,v)=>setForm(p=>({...p,[k]:v}));

  const vendorId=99; // In production use real vendorId from auth
  const commission=15; // Fixed 15% platform commission
  // Time window: null=auto 12hr, or {from:"HH:MM", to:"HH:MM"}
  const [timeWindow,setTimeWindow]=useState(null); // null = use default 12hr
  const [customFrom,setCustomFrom]=useState(""); // e.g. "11:00"
  const [customTo,setCustomTo]=useState("");     // e.g. "14:00"
  // computedEnd: if custom set use today's end time as ms timestamp, else postedAt+12h (set at publish time)
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
        vendorPhone:vendorMeta?.phone||"",
        title:form.title,desc:form.desc,originalPrice:parseFloat(form.original)||parseFloat(form.price)*1.5,
        dealPrice:parseFloat(form.price),emoji:template?.emoji||"🍱",image:photo,
        category:template?.category||"Food",halal:form.halal!==null?form.halal:0,
        endTime:(()=>{
          const now=new Date();
          if(timeWindow==="custom"&&customTo){
            const [h,m]=customTo.split(":").map(Number);
            const t=new Date();t.setHours(h,m,0,0);
            // if the to-time is already past for today, it expires now (edge case)
            return t>now?t.getTime():now.getTime();
          }
          // default: 12 hours from posting
          return Date.now()+12*60*60*1000;
        })(),qty:form.qty?parseInt(form.qty):null,claimed:0,
        type:postType||"limited",postedAt:Date.now(),vendorSubscribed:false,
        freeDeliveryThreshold:null,studentPrice:form.hasStudentPrice&&form.studentPrice?parseFloat(form.studentPrice):null,
      };
      setActivePosts(p=>[post,...p]);
      onNewListing(post);
      setLastPosted(post);
      setPublishing(false);
      setShowSuccess(true);
      setShowAddMenu(false);
      setStep(1);setPostType(null);setTemplate(null);setPhoto(null);setTimeWindow(null);setCustomFrom("");setCustomTo("");
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
      {/* TrialBanner removed — subscription model discontinued */}
      {/* Sell tab switcher — scrollable */}
      <div className="sticky top-[60px] z-40 bg-[#0a0f1e]/95 backdrop-blur-md border-b border-white/10 px-4 py-3">
        <div className="flex gap-2 mb-1 overflow-x-auto no-scrollbar">
          <button onClick={()=>setVendorFlowTab("orders")}
            className={`relative flex-shrink-0 py-2 px-3 rounded-xl text-[10px] font-black uppercase tracking-wide transition-all ${vendorFlowTab==="orders"?"bg-blue-500 text-white":"bg-white/10 text-white/40"}`}>
            📋 Orders
            {(()=>{const n=getVendorOrders().filter(o=>o.status==='new').length;return n>0?<span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[7px] font-black rounded-full flex items-center justify-center">{n}</span>:null;})()}
          </button>
          <motion.button onClick={()=>setVendorFlowTab("deals")}
            animate={postDealNudge?{scale:[1,1.06,1,1.06,1],boxShadow:["0 0 0px #10b981","0 0 18px #10b981","0 0 0px #10b981"]}:{}}
            transition={{duration:0.5,repeat:postDealNudge?3:0}}
            className={`flex-shrink-0 py-2 px-3 rounded-xl text-[10px] font-black uppercase tracking-wide transition-all ${vendorFlowTab==="deals"?"bg-emerald-500 text-white":`bg-white/10 text-white/40 ${postDealNudge?"ring-2 ring-emerald-400 ring-offset-1 ring-offset-[#0a0f1e]":""}`}`}>
            ⚡ Post Deal{postDealNudge&&<span className="ml-1 text-emerald-300">← Now!</span>}
          </motion.button>
          <button onClick={()=>setVendorFlowTab("menu")}
            className={`flex-shrink-0 py-2 px-3 rounded-xl text-[10px] font-black uppercase tracking-wide transition-all ${vendorFlowTab==="menu"?"bg-purple-500 text-white":"bg-white/10 text-white/40"}`}>
            🍽️ My Menu
          </button>
          <button onClick={()=>setVendorFlowTab("profile")}
            className={`flex-shrink-0 py-2 px-3 rounded-xl text-[10px] font-black uppercase tracking-wide transition-all ${vendorFlowTab==="profile"?"bg-blue-400 text-white":"bg-white/10 text-white/40"}`}>
            🏪 Profile
          </button>
          <button onClick={()=>setVendorFlowTab("catering")}
            className={`relative flex-shrink-0 py-2 px-3 rounded-xl text-[10px] font-black uppercase tracking-wide transition-all whitespace-nowrap ${vendorFlowTab==="catering"?"bg-rose-500 text-white":"bg-white/10 text-white/40"}`}>
            🎂 Catering
            {(()=>{const n=getCateringQueries().filter(q=>q.status==='pending').length;return n>0?<span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-400 text-white text-[7px] font-black rounded-full flex items-center justify-center">{n}</span>:null;})()}
          </button>
          <button onClick={()=>setVendorFlowTab("canopy")}
            className={`relative flex-shrink-0 py-2 px-3 rounded-xl text-[10px] font-black uppercase tracking-wide transition-all whitespace-nowrap ${vendorFlowTab==="canopy"?"bg-sky-500 text-white":"bg-white/10 text-white/40"}`}>
            ⛺ Canopy
            {(()=>{const n=getCanopyQueries().filter(q=>q.status==='pending').length;return n>0?<span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-400 text-white text-[7px] font-black rounded-full flex items-center justify-center">{n}</span>:null;})()}
          </button>
        </div>
        {vendorFlowTab==="deals"&&(
          <div className="flex items-center justify-between mt-1">
            <p className="text-white/30 text-[10px]">Step {step} of 3</p>
            <div className="flex gap-2">
              {activePosts.length>0&&<div className="bg-emerald-500/20 border border-emerald-500/30 px-3 py-1.5 rounded-xl"><span className="text-emerald-400 text-[10px] font-black">{activePosts.length} {t.activeLabel}</span></div>}
            </div>
          </div>
        )}
      </div>

      {/* My Menu tab */}
      {vendorFlowTab==="menu"&&(
        <VendorMenuManager vendorId={vendorId} t={t} onDone={()=>{
          setVendorFlowTab("deals");
          setStep(1);
          setShowSuccess(false);
          setPostDealNudge(true);
          setTimeout(()=>setPostDealNudge(false),3000);
        }}/>
      )}

      {/* Profile tab */}
      {vendorFlowTab==="profile"&&(
        <VendorProfileEditor vendorMeta={vendorMeta} onSave={()=>{}}/>
      )}

      {/* Orders tab */}
      {vendorFlowTab==="orders"&&(
        <MerchantOrdersDash vendorMeta={vendorMeta} t={t}/>
      )}

      {/* Catering supplier dashboard — always mounted */}
      <div style={{display:vendorFlowTab==="catering"?"block":"none"}}>
        <CateringSupplierDash t={t}/>
      </div>

      {/* Canopy supplier dashboard — always mounted */}
      <div style={{display:vendorFlowTab==="canopy"?"block":"none"}}>
        <CanopySupplierDash t={t}/>
      </div>

      {/* Boost Sheet */}
      <AnimatePresence>
        {boostTarget&&(
          <BoostSheet
            post={boostTarget}
            onClose={()=>setBoostTarget(null)}
            onBoost={(record)=>{setBoostTarget(null);}}
          />
        )}
      </AnimatePresence>

      {/* Post Deal tab */}
      {vendorFlowTab==="deals"&&(
      <div>
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
                            <ActivePostBadge post={l}/>
                          </div>
                        </div>
                        <button onClick={()=>setBoostTarget(l)} className="w-7 h-7 bg-amber-500/20 rounded-lg flex items-center justify-center text-amber-400 text-xs" title="Boost this deal">🚀</button>
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
                    {[{val:1,icon:"🟢",label:"Halal"},{val:0,icon:"🔴",label:"Non-Halal"}].map(opt=>{
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
                {/* Time window picker */}
                <div>
                  <label className="text-white/40 text-[9px] font-black uppercase tracking-widest block mb-2">⏱ Live Duration</label>
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    {[
                      {id:null,  icon:"🕛", label:"12 hrs", sub:"Auto taken down"},
                      {id:"custom",icon:"🕐", label:"Set time", sub:"Pick start → end"},
                    ].map(opt=>(
                      <button key={String(opt.id)} type="button" onClick={()=>setTimeWindow(opt.id)}
                        className={`text-left px-3 py-2.5 rounded-xl border-2 transition-all ${timeWindow===opt.id?"border-amber-400 bg-amber-400/10":"border-white/10 bg-white/5"}`}>
                        <p className={`font-black text-xs ${timeWindow===opt.id?"text-amber-300":"text-white/70"}`}>{opt.icon} {opt.label}</p>
                        <p className="text-white/25 text-[9px]">{opt.sub}</p>
                      </button>
                    ))}
                  </div>
                  {timeWindow===null&&(
                    <div className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 flex items-center gap-2">
                      <span className="text-sm">⏰</span>
                      <p className="text-white/30 text-[9px]">Post will auto-expire <span className="text-amber-300 font-black">12 hours</span> after going live</p>
                    </div>
                  )}
                  {timeWindow==="custom"&&(
                    <div className="bg-white/5 border border-white/10 rounded-xl p-3 space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <p className="text-white/30 text-[9px] font-black uppercase mb-1">From</p>
                          <input type="time" value={customFrom} onChange={e=>setCustomFrom(e.target.value)}
                            className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white text-xs font-black focus:border-amber-400 focus:outline-none"/>
                        </div>
                        <div>
                          <p className="text-white/30 text-[9px] font-black uppercase mb-1">Until</p>
                          <input type="time" value={customTo} onChange={e=>setCustomTo(e.target.value)}
                            className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white text-xs font-black focus:border-amber-400 focus:outline-none"/>
                        </div>
                      </div>
                      {customFrom&&customTo&&(
                        <p className="text-amber-300 font-black text-[9px]">🟡 Live {customFrom} → auto taken down at {customTo}</p>
                      )}
                      {customTo&&!customFrom&&(
                        <p className="text-white/25 text-[9px]">From time optional — post goes live immediately</p>
                      )}
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
      </div>
      )} {/* end vendorFlowTab==="deals" */}
      <AnimatePresence>
        {showSuccess&&(
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            className="fixed inset-0 z-[300] bg-black/80 backdrop-blur-md flex items-end justify-center">
            <motion.div initial={{y:100}} animate={{y:0}} exit={{y:100}}
              transition={{type:"spring",damping:28}} onClick={e=>e.stopPropagation()}
              className="w-full max-w-sm bg-[#0d1929] rounded-t-[40px] overflow-hidden"
              style={{maxHeight:"92vh",display:"flex",flexDirection:"column"}}>

              {!showAddMenu ? (
                /* ── Step A: Celebrate + ask about menu ── */
                <div className="p-8 pb-10 text-center">
                  <motion.div initial={{scale:0}} animate={{scale:[0,1.2,1]}} transition={{type:"spring",delay:0.1}} className="text-6xl mb-4">🎉</motion.div>
                  <h2 className="text-white text-2xl font-black mb-1">{t.postSuccess}</h2>
                  <p className="text-white/50 text-sm mb-5">{t.liveNote}</p>
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-5 text-left">
                    <p className="text-white font-black text-sm mb-1">🍽️ Add this to your menu?</p>
                    <p className="text-white/30 text-xs leading-relaxed">Buyers can browse and order from your menu anytime — not just when a deal is live.</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <button onClick={()=>{setShowSuccess(false);if(onPostDone)onPostDone();}}
                      className="py-3.5 rounded-2xl border border-white/20 text-white/40 font-black text-xs uppercase">
                      Skip
                    </button>
                    <motion.button whileTap={{scale:0.96}} onClick={()=>setShowAddMenu(true)}
                      className="py-3.5 rounded-2xl bg-purple-500 text-white font-black text-xs uppercase shadow-lg shadow-purple-900/50">
                      Yes, Add to Menu →
                    </motion.button>
                  </div>
                  <button onClick={()=>{setShowSuccess(false);if(onPostDone)onPostDone();}}
                    className="w-full mt-3 py-2.5 rounded-2xl bg-emerald-500/20 text-emerald-400 font-black text-xs uppercase tracking-wide">
                    👁️ View My Post in Feed →
                  </button>
                </div>
              ) : (
                /* ── Step B: Numbered menu add form ── */
                <AddMenuItemsForm
                  defaultName={lastPosted?.title||""}
                  defaultCat={lastPosted?.category||"Food"}
                  onSave={(newItems)=>{
                    const existing=getVendorMenu(vendorId);
                    saveVendorMenu(vendorId,[...existing,...newItems]);
                    setShowSuccess(false);
                    setShowAddMenu(false);
                    if(onPostDone)onPostDone();
                  }}
                  onSkip={()=>{setShowSuccess(false);setShowAddMenu(false);if(onPostDone)onPostDone();}}
                />
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── SIDE ORDER POPUP ─────────────────────────────────────────────────────────
function SideOrderPopup({popup,cart,onAdd,onCheckout,onClose,allListings}){
  const cartIds=cart.map(i=>String(i.id));
  const subtotal=cart.reduce((s,i)=>s+i.dealPrice,0);
  const {vendorId,vendorName,threshold,moreDeals,moreMenu}=popup;

  const toFreeDelivery=threshold&&subtotal<threshold?parseFloat((threshold-subtotal).toFixed(2)):null;
  const freeUnlocked=threshold&&subtotal>=threshold;
  const catEmoji={Food:"🍛",Drink:"🧋",Bakery:"🥐",Dessert:"🍡",TongSui:"🍮",Fruit:"🍉",Other:"📦"};

  // Live-recalculate which items are still addable (cart changes as user adds)
  const currentCartIds=cart.map(i=>String(i.id));
  const availableDeals=moreDeals.filter(l=>!currentCartIds.includes(String(l.id)));
  const availableMenu=moreMenu.filter(m=>!currentCartIds.includes("menu_"+m.id));
  const hasItems=availableDeals.length>0||availableMenu.length>0;

  return(
    <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
      className="fixed inset-0 z-[400] bg-black/60 backdrop-blur-sm flex items-end justify-center"
      onClick={onClose}>
      <motion.div initial={{y:"100%"}} animate={{y:0}} exit={{y:"100%"}}
        transition={{type:"spring",damping:28,stiffness:280}}
        onClick={e=>e.stopPropagation()}
        className="w-full max-w-sm bg-white rounded-t-[32px] overflow-hidden max-h-[80vh] flex flex-col">

        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
          <div className="w-10 h-1 bg-slate-200 rounded-full"/>
        </div>

        {/* Header */}
        <div className="px-5 pt-2 pb-3 flex-shrink-0">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-black text-slate-900 text-base">🛒 Added to cart!</p>
              <p className="text-slate-500 text-xs mt-0.5">Want to add sides from <span className="font-black text-slate-700">{vendorName}</span>?</p>
            </div>
            <button onClick={onClose} className="w-7 h-7 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 text-xs mt-0.5">✕</button>
          </div>

          {/* Free delivery progress bar */}
          {threshold&&(
            <div className={`mt-3 rounded-2xl px-3 py-2.5 ${freeUnlocked?"bg-emerald-50 border border-emerald-200":"bg-blue-50 border border-blue-200"}`}>
              {freeUnlocked?(
                <p className="text-emerald-700 font-black text-xs">🎉 Free delivery unlocked! (RM{fmtRM(threshold)} reached)</p>
              ):(
                <>
                  <div className="flex justify-between items-center mb-1.5">
                    <p className="text-blue-700 font-black text-[10px]">🎁 Add RM{fmtRM(toFreeDelivery)} — merchant covers delivery!</p>
                    <p className="text-blue-500 text-[9px] font-bold">RM{fmtRM(subtotal)} / RM{fmtRM(threshold)}</p>
                  </div>
                  <div className="w-full bg-blue-200 h-2 rounded-full overflow-hidden">
                    <motion.div className="bg-blue-500 h-full rounded-full"
                      initial={{width:0}}
                      animate={{width:`${Math.min((subtotal/threshold)*100,100)}%`}}
                      transition={{duration:0.6,ease:"easeOut"}}/>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Items scroll area */}
        {hasItems&&(
          <div className="flex-1 overflow-y-auto px-5 pb-3 space-y-4">
            {/* More deals from same vendor */}
            {availableDeals.length>0&&(
              <div>
                <p className="text-slate-400 text-[9px] font-black uppercase tracking-widest mb-2">🔥 Deals from {vendorName}</p>
                <div className="space-y-2">
                  {availableDeals.slice(0,4).map(item=>{
                    const inCart=currentCartIds.includes(String(item.id));
                    return(
                      <div key={item.id} className="flex items-center gap-3 bg-slate-50 rounded-2xl p-3">
                        <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-slate-200">
                          <img src={item.image} className="w-full h-full object-cover" alt=""/>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-black text-slate-800 text-sm truncate">{item.title}</p>
                          <div className="flex items-center gap-1.5">
                            <p className="text-emerald-600 font-black text-sm">RM{fmtRM(item.dealPrice)}</p>
                            {item.originalPrice>item.dealPrice&&<p className="text-slate-300 text-[10px] line-through">RM{fmtRM(item.originalPrice)}</p>}
                          </div>
                        </div>
                        <motion.button whileTap={{scale:0.88}} onClick={()=>!inCart&&onAdd(item)} disabled={inCart}
                          className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-lg flex-shrink-0 shadow-sm ${inCart?"bg-emerald-100 text-emerald-600":"bg-slate-900 text-white"}`}>
                          {inCart?"✓":"+"}
                        </motion.button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            {/* Menu items from same vendor */}
            {availableMenu.length>0&&(
              <div>
                <p className="text-slate-400 text-[9px] font-black uppercase tracking-widest mb-2">📋 Menu from {vendorName}</p>
                <div className="space-y-2">
                  {availableMenu.slice(0,4).map(item=>{
                    const cartKey="menu_"+item.id;
                    const inCart=currentCartIds.includes(cartKey);
                    return(
                      <div key={item.id} className="flex items-center gap-3 bg-slate-50 rounded-2xl p-3">
                        <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center flex-shrink-0 text-2xl overflow-hidden">
                          {item.image
                            ?<img src={item.image} className="w-full h-full object-cover" alt=""/>
                            :<span>{catEmoji[item.cat]||"🍽️"}</span>
                          }
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-black text-slate-800 text-sm truncate">{item.name}</p>
                          {item.desc&&<p className="text-slate-400 text-[10px] truncate">{item.desc}</p>}
                          <p className="text-emerald-600 font-black text-sm">RM{fmtRM(item.price)}</p>
                        </div>
                        <motion.button whileTap={{scale:0.88}} onClick={()=>!inCart&&onAdd({
                          id:cartKey,vendorId,vendorName,vendorPhone:"",
                          title:item.name,desc:item.desc||"",
                          dealPrice:item.price,originalPrice:item.price,
                          image:"",category:item.cat,halal:1,
                          freeDeliveryThreshold:threshold||null,
                          studentPrice:null,qty:null,claimed:0,type:"menu",
                        })} disabled={inCart}
                          className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-lg flex-shrink-0 shadow-sm ${inCart?"bg-emerald-100 text-emerald-600":"bg-purple-600 text-white"}`}>
                          {inCart?"✓":"+"}
                        </motion.button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
        {!hasItems&&(
          <div className="px-5 pb-4 text-center text-slate-400 text-sm">All available items added ✓</div>
        )}

        {/* Footer buttons */}
        <div className="px-5 pb-8 pt-3 border-t border-slate-100 flex-shrink-0 grid grid-cols-2 gap-2">
          <button onClick={onClose}
            className="py-3.5 rounded-2xl border-2 border-slate-200 font-black text-slate-600 text-xs uppercase tracking-wide active:scale-95 transition-transform">
            Continue Adding
          </button>
          <motion.button whileTap={{scale:0.96}} onClick={onCheckout}
            className="py-3.5 rounded-2xl bg-slate-900 text-white font-black text-xs uppercase tracking-wide shadow-lg">
            Checkout →
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── BUYER FEED ───────────────────────────────────────────────────────────────

// ─── EVENT CATERING ENQUIRY ──────────────────────────────────────────────────
function CateringEnquiry({t}){
  const [step,setStep]=useState(1); // 1=event details, 2=contact, 3=success
  const [pax,setPax]=useState('');
  const [eventType,setEventType]=useState('');
  const [eventTypeOther,setEventTypeOther]=useState('');
  const [date,setDate]=useState('');
  const [time,setTime]=useState('');
  const [venue,setVenue]=useState('');
  const [notes,setNotes]=useState('');
  const [name,setName]=useState('');
  const [phone,setPhone]=useState('');
  const [submittedId,setSubmittedId]=useState('');
  const [myQueries,setMyQueries]=useState(()=>getCateringQueries());
  const [showHistory,setShowHistory]=useState(false);
  const [paying,setPaying]=useState(false);

  const PLATFORM_WA='60123456789'; // Platform admin WhatsApp

  const canProceed1=pax.trim()&&eventType&&date&&time&&venue.trim();
  const canSubmit=name.trim()&&phone.trim().length>=10;

  const handleSubmit=()=>{
    const id=genQueryId();
    const q={
      id, type:'catering',
      pax, eventType:eventType==='Other ✏️'?eventTypeOther:eventType,
      date, time, venue, notes, name, phone,
      status:'pending', // pending | quoted | accepted | paid
      quotation:null,
      submittedAt:Date.now(),
    };
    saveCateringQuery(q);
    setMyQueries(getCateringQueries());
    setSubmittedId(id);
    setStep(3);
  };

  const openWA=(query)=>{
    const msg=`🎂 *Event Catering Enquiry*\n\nRef: ${query.id}\n👤 ${query.name} | 📱 ${query.phone}\n📅 ${query.date} at ${query.time}\n📍 ${query.venue}\n👥 ${query.pax} pax\n🎉 ${query.eventType}${query.notes?'\n📝 '+query.notes:''}`;
    window.open(`https://wa.me/${PLATFORM_WA}?text=${encodeURIComponent(msg)}`,'_blank');
  };

  const mockPay=(qid)=>{
    setPaying(qid);
    setTimeout(()=>{
      const all=getCateringQueries();
      const idx=all.findIndex(x=>x.id===qid);
      if(idx>=0){all[idx].status='paid'; all[idx].paidAt=Date.now();}
      localStorage.setItem(LS_CATERING_QUERIES,JSON.stringify(all));
      setMyQueries(getCateringQueries());
      setPaying(false);
    },2000);
  };

  const statusColor={pending:'bg-amber-100 text-amber-700',quoted:'bg-blue-100 text-blue-700',accepted:'bg-emerald-100 text-emerald-700',paid:'bg-emerald-600 text-white'};
  const statusLabel=(s)=>({pending:t.cateringStatusPending,quoted:t.cateringStatusQuoted,accepted:t.cateringStatusAccepted,paid:t.cateringStatusPaid}[s]||s);

  return(
    <div className="px-4 pb-32 pt-2">
      {/* Hero banner */}
      <div className="relative rounded-3xl overflow-hidden mb-5 shadow-lg">
        <div className="absolute inset-0 bg-gradient-to-br from-rose-500 via-pink-500 to-orange-400"/>
        <div className="absolute inset-0 opacity-10" style={{backgroundImage:"url('https://picsum.photos/seed/catering1/800/400')",backgroundSize:"cover"}}/>
        <div className="relative px-5 py-6">
          <span className="text-4xl block mb-2">🎂</span>
          <h2 className="text-white font-black text-xl leading-tight">{t.cateringTab.replace('🎂 ','')}</h2>
          <p className="text-white/80 text-xs mt-1">{t.cateringTagline}</p>
          <div className="flex gap-2 mt-3 flex-wrap">
            {['50–500 Pax','Full Setup','Custom Menu','Book Nationwide'].map(b=>(
              <span key={b} className="bg-white/20 backdrop-blur text-white text-[9px] font-black px-2.5 py-1 rounded-full">{b}</span>
            ))}
          </div>
        </div>
      </div>

      {/* My Queries toggle */}
      {myQueries.length>0&&(
        <button onClick={()=>setShowHistory(!showHistory)}
          className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl mb-4 active:scale-[0.98] transition-transform">
          <div className="flex items-center gap-2">
            <span className="text-base">📋</span>
            <span className="font-black text-slate-700 text-sm">{t.cateringMyQueries}</span>
            <span className="bg-rose-500 text-white text-[9px] font-black w-5 h-5 rounded-full flex items-center justify-center">{myQueries.length}</span>
          </div>
          <span className="text-slate-400 text-xs">{showHistory?'▲':'▼'}</span>
        </button>
      )}

      {/* History panel */}
      <AnimatePresence>
      {showHistory&&(
        <motion.div initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}} className="mb-4 space-y-3">
          {myQueries.map(q=>(
            <div key={q.id} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <p className="font-black text-slate-800 text-sm">{q.eventType}</p>
                  <p className="text-slate-400 text-[10px]">{q.date} · {q.pax} pax · {q.venue}</p>
                </div>
                <span className={`text-[9px] font-black px-2 py-1 rounded-full flex-shrink-0 ${statusColor[q.status]||'bg-slate-100 text-slate-500'}`}>{statusLabel(q.status)}</span>
              </div>
              {q.quotation&&(
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-2.5 mb-2">
                  <p className="text-emerald-700 font-black text-xs mb-0.5">💰 Quotation</p>
                  <p className="text-emerald-800 font-black text-lg">RM {q.quotation}</p>
                  <p className="text-emerald-600 text-[9px] mt-0.5">{q.quotationNote||''}</p>
                </div>
              )}
              <div className="flex gap-2 mt-2">
                <p className="text-slate-300 text-[9px] flex-1">Ref: {q.id}</p>
                {(q.status==='accepted')&&(
                  <button onClick={()=>mockPay(q.id)} disabled={paying===q.id}
                    className="bg-emerald-500 text-white text-[10px] font-black px-3 py-1.5 rounded-xl active:scale-95 disabled:opacity-60">
                    {paying===q.id?'Processing...':t.cateringPayNow}
                  </button>
                )}
                {q.status!=='paid'&&(
                  <button onClick={()=>openWA(q)} className="bg-[#25D366] text-white text-[10px] font-black px-3 py-1.5 rounded-xl active:scale-95">
                    💬 WA
                  </button>
                )}
              </div>
            </div>
          ))}
        </motion.div>
      )}
      </AnimatePresence>

      {/* Step progress */}
      {step<3&&(
        <div className="flex items-center gap-2 mb-5">
          {[1,2].map(s=>(
            <div key={s} className={`flex-1 h-1.5 rounded-full transition-all ${s<=step?'bg-rose-500':'bg-slate-200'}`}/>
          ))}
          <span className="text-slate-400 text-[10px] font-black">{step}/2</span>
        </div>
      )}

      {/* ── STEP 1: Event Details ── */}
      <AnimatePresence mode="wait">
      {step===1&&(
        <motion.div key="s1" initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-20}} className="space-y-4">
          <h3 className="font-black text-slate-900 text-base">{t.cateringStep1}</h3>

          {/* Pax */}
          <div>
            <label className="text-slate-600 text-[10px] font-black uppercase tracking-wider block mb-1.5">{t.cateringPax}</label>
            <input value={pax} onChange={e=>setPax(e.target.value.replace(/\D/,''))} type="number" inputMode="numeric"
              placeholder={t.cateringPaxPlaceholder}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold focus:border-rose-400 focus:outline-none placeholder:text-slate-300 focus:bg-white transition-colors"/>
          </div>

          {/* Event type chips */}
          <div>
            <label className="text-slate-600 text-[10px] font-black uppercase tracking-wider block mb-2">{t.cateringEvent}</label>
            <div className="grid grid-cols-2 gap-2">
              {(t.cateringEvents||[]).map(ev=>(
                <button key={ev} onClick={()=>setEventType(ev)}
                  className={`py-2.5 px-3 rounded-2xl text-xs font-black text-left transition-all active:scale-95 border-2 ${eventType===ev?'border-rose-500 bg-rose-50 text-rose-700':'border-slate-200 bg-white text-slate-600'}`}>
                  {ev}
                </button>
              ))}
            </div>
            {eventType==='Other ✏️'&&(
              <input value={eventTypeOther} onChange={e=>setEventTypeOther(e.target.value)}
                placeholder={t.cateringEventPlaceholder}
                className="mt-2 w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold focus:border-rose-400 focus:outline-none placeholder:text-slate-300"/>
            )}
          </div>

          {/* Date + Time row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-600 text-[10px] font-black uppercase tracking-wider block mb-1.5">{t.cateringDate}</label>
              <input type="date" value={date} onChange={e=>setDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3 py-3 text-sm font-bold focus:border-rose-400 focus:outline-none"/>
            </div>
            <div>
              <label className="text-slate-600 text-[10px] font-black uppercase tracking-wider block mb-1.5">{t.cateringTime}</label>
              <input type="time" value={time} onChange={e=>setTime(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3 py-3 text-sm font-bold focus:border-rose-400 focus:outline-none"/>
            </div>
          </div>

          {/* Venue */}
          <div>
            <label className="text-slate-600 text-[10px] font-black uppercase tracking-wider block mb-1.5">{t.cateringVenue}</label>
            <textarea value={venue} onChange={e=>setVenue(e.target.value)} rows={2}
              placeholder={t.cateringVenuePlaceholder}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold focus:border-rose-400 focus:outline-none placeholder:text-slate-300 resize-none focus:bg-white transition-colors"/>
          </div>

          {/* Notes */}
          <div>
            <label className="text-slate-600 text-[10px] font-black uppercase tracking-wider block mb-1.5">{t.cateringNotes}</label>
            <textarea value={notes} onChange={e=>setNotes(e.target.value)} rows={2}
              placeholder={t.cateringNotesPlaceholder}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold focus:border-rose-400 focus:outline-none placeholder:text-slate-300 resize-none"/>
          </div>

          <div className="flex gap-3">
            <button onClick={()=>setStep(2)} disabled={!canProceed1}
              className="flex-1 bg-rose-500 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest active:scale-95 transition-all disabled:opacity-40 shadow-lg shadow-rose-200">
              {t.cateringSubmit}
            </button>
            <button onClick={()=>setStep(2)}
              className="flex-shrink-0 bg-slate-100 text-slate-400 py-4 px-4 rounded-2xl font-black text-xs active:scale-95 transition-all">
              Skip →
            </button>
          </div>
        </motion.div>
      )}

      {/* ── STEP 2: Contact Info ── */}
      {step===2&&(
        <motion.div key="s2" initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-20}} className="space-y-4">
          <h3 className="font-black text-slate-900 text-base">{t.cateringStep2}</h3>

          {/* Summary card */}
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4">
            <p className="text-rose-700 font-black text-[10px] uppercase tracking-wider mb-2">📋 Order Summary</p>
            <div className="space-y-1 text-xs">
              <p><span className="text-slate-400">Event:</span> <span className="font-black">{eventType==='Other ✏️'?eventTypeOther:eventType}</span></p>
              <p><span className="text-slate-400">Pax:</span> <span className="font-black">{pax} people</span></p>
              <p><span className="text-slate-400">Date:</span> <span className="font-black">{date} at {time}</span></p>
              <p><span className="text-slate-400">Venue:</span> <span className="font-black">{venue}</span></p>
            </div>
          </div>

          <div>
            <label className="text-slate-600 text-[10px] font-black uppercase tracking-wider block mb-1.5">{t.cateringName}</label>
            <input value={name} onChange={e=>setName(e.target.value)} placeholder={t.cateringNamePlaceholder}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold focus:border-rose-400 focus:outline-none placeholder:text-slate-300 focus:bg-white transition-colors"/>
          </div>
          <div>
            <label className="text-slate-600 text-[10px] font-black uppercase tracking-wider block mb-1.5">{t.cateringPhone}</label>
            <input value={phone} onChange={e=>setPhone(e.target.value)} type="tel" placeholder={t.cateringPhonePlaceholder}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold focus:border-rose-400 focus:outline-none placeholder:text-slate-300 focus:bg-white transition-colors"/>
          </div>

          <p className="text-slate-400 text-[10px] text-center">We'll WhatsApp you a menu & quotation within 24 hours.</p>

          <div className="flex gap-3">
            <button onClick={()=>setStep(1)} className="flex-shrink-0 bg-slate-100 text-slate-500 py-4 px-5 rounded-2xl font-black text-sm active:scale-95">←</button>
            <button onClick={handleSubmit} disabled={!canSubmit}
              className="flex-1 bg-rose-500 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest active:scale-95 disabled:opacity-40 shadow-lg shadow-rose-200">
              {t.cateringSubmit}
            </button>
          </div>
        </motion.div>
      )}

      {/* ── STEP 3: Success ── */}
      {step===3&&(
        <motion.div key="s3" initial={{opacity:0,scale:0.95}} animate={{opacity:1,scale:1}} className="text-center py-6">
          <motion.div initial={{scale:0}} animate={{scale:1}} transition={{type:'spring',delay:0.1}} className="text-6xl mb-4">🎉</motion.div>
          <h3 className="font-black text-slate-900 text-xl mb-2">{t.cateringSuccessTitle}</h3>
          <p className="text-slate-500 text-sm mb-1">{t.cateringSuccessMsg}</p>
          <div className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 inline-block mt-3 mb-5">
            <p className="text-slate-400 text-[9px] font-black uppercase">{t.cateringSuccessId}</p>
            <p className="text-slate-800 font-black text-lg tracking-widest">{submittedId}</p>
          </div>
          <div className="space-y-3 px-2">
            {(()=>{const q=getCateringQueries().find(x=>x.id===submittedId);return q?(
              <button onClick={()=>openWA(q)} className="w-full bg-[#25D366] text-white py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 active:scale-95 shadow-lg shadow-green-200">
                <span className="text-xl">💬</span>{t.cateringWA}
              </button>
            ):null;})()}
            <button onClick={()=>{setStep(1);setPax('');setEventType('');setEventTypeOther('');setDate('');setTime('');setVenue('');setNotes('');setName('');setPhone('');setShowHistory(true);}}
              className="w-full bg-slate-100 text-slate-600 py-3.5 rounded-2xl font-black text-sm active:scale-95">
              {t.cateringNewQuery}
            </button>
          </div>
        </motion.div>
      )}
      </AnimatePresence>
    </div>
  );
}

// ─── CANOPY RENTAL ENQUIRY ────────────────────────────────────────────────────
function CanopyRental({t}){
  const [step,setStep]=useState(1);
  const [date,setDate]=useState('');
  const [time,setTime]=useState('');
  const [venue,setVenue]=useState('');
  const [qtyCanopy,setQtyCanopy]=useState('1');
  const [qtyTable,setQtyTable]=useState('0');
  const [qtyChair,setQtyChair]=useState('0');
  const [qtyFan,setQtyFan]=useState('0');
  const [notes,setNotes]=useState('');
  const [name,setName]=useState('');
  const [phone,setPhone]=useState('');
  const [submittedId,setSubmittedId]=useState('');
  const [myQueries,setMyQueries]=useState(()=>getCanopyQueries());
  const [showHistory,setShowHistory]=useState(false);
  const [paying,setPaying]=useState(false);

  const PLATFORM_WA='60123456789';

  const canProceed1=date&&time&&venue.trim()&&(parseInt(qtyCanopy)||0)>0;
  const canSubmit=name.trim()&&phone.trim().length>=10;

  const QtyRow=({label,val,setVal,emoji})=>(
    <div className="flex items-center justify-between bg-slate-50 rounded-2xl px-4 py-3">
      <div className="flex items-center gap-2">
        <span className="text-xl">{emoji}</span>
        <span className="text-slate-700 font-black text-sm">{label}</span>
      </div>
      <div className="flex items-center gap-3">
        <button onClick={()=>setVal(v=>String(Math.max(0,parseInt(v||'0')-1)))}
          className="w-8 h-8 bg-slate-200 rounded-xl font-black text-slate-700 flex items-center justify-center active:scale-95 text-lg leading-none">−</button>
        <span className="text-slate-900 font-black text-base w-8 text-center">{val}</span>
        <button onClick={()=>setVal(v=>String(parseInt(v||'0')+1))}
          className="w-8 h-8 bg-slate-900 rounded-xl font-black text-white flex items-center justify-center active:scale-95 text-lg leading-none">+</button>
      </div>
    </div>
  );

  const handleSubmit=()=>{
    const id=genQueryId();
    const q={
      id, type:'canopy',
      date, time, venue, notes, name, phone,
      qtyCanopy:parseInt(qtyCanopy)||0,
      qtyTable:parseInt(qtyTable)||0,
      qtyChair:parseInt(qtyChair)||0,
      qtyFan:parseInt(qtyFan)||0,
      status:'pending',
      quotation:null,
      submittedAt:Date.now(),
    };
    saveCanopyQuery(q);
    setMyQueries(getCanopyQueries());
    setSubmittedId(id);
    setStep(3);
  };

  const openWA=(query)=>{
    const msg=`⛺ *Canopy Rental Enquiry*\n\nRef: ${query.id}\n👤 ${query.name} | 📱 ${query.phone}\n📅 ${query.date} at ${query.time}\n📍 ${query.venue}\n⛺ ${query.qtyCanopy} canopies · 🪑 ${query.qtyChair} chairs · 🪵 ${query.qtyTable} tables · 💨 ${query.qtyFan} fans${query.notes?'\n📝 '+query.notes:''}`;
    window.open(`https://wa.me/${PLATFORM_WA}?text=${encodeURIComponent(msg)}`,'_blank');
  };

  const mockPay=(qid)=>{
    setPaying(qid);
    setTimeout(()=>{
      const all=getCanopyQueries();
      const idx=all.findIndex(x=>x.id===qid);
      if(idx>=0){all[idx].status='paid';all[idx].paidAt=Date.now();}
      localStorage.setItem(LS_CANOPY_QUERIES,JSON.stringify(all));
      setMyQueries(getCanopyQueries());
      setPaying(false);
    },2000);
  };

  const statusColor={pending:'bg-amber-100 text-amber-700',quoted:'bg-blue-100 text-blue-700',accepted:'bg-emerald-100 text-emerald-700',paid:'bg-emerald-600 text-white'};
  const statusLabel=(s)=>({pending:t.canopyStatusPending,quoted:t.canopyStatusQuoted,accepted:t.canopyStatusAccepted,paid:t.canopyStatusPaid}[s]||s);

  return(
    <div className="px-4 pb-32 pt-2">
      {/* Hero banner */}
      <div className="relative rounded-3xl overflow-hidden mb-5 shadow-lg">
        <div className="absolute inset-0 bg-gradient-to-br from-sky-500 via-blue-500 to-indigo-500"/>
        <div className="absolute inset-0 opacity-10" style={{backgroundImage:"url('https://picsum.photos/seed/canopy2/800/400')",backgroundSize:"cover"}}/>
        <div className="relative px-5 py-6">
          <span className="text-4xl block mb-2">⛺</span>
          <h2 className="text-white font-black text-xl leading-tight">{t.canopyTab.replace('⛺ ','')}</h2>
          <p className="text-white/80 text-xs mt-1">{t.canopyTagline}</p>
          <div className="flex gap-2 mt-3 flex-wrap">
            {['Canopy Setup','Tables & Chairs','Fans','Delivery Included'].map(b=>(
              <span key={b} className="bg-white/20 backdrop-blur text-white text-[9px] font-black px-2.5 py-1 rounded-full">{b}</span>
            ))}
          </div>
        </div>
      </div>

      {/* My Queries toggle */}
      {myQueries.length>0&&(
        <button onClick={()=>setShowHistory(!showHistory)}
          className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl mb-4 active:scale-[0.98] transition-transform">
          <div className="flex items-center gap-2">
            <span className="text-base">📋</span>
            <span className="font-black text-slate-700 text-sm">{t.canopyMyQueries}</span>
            <span className="bg-sky-500 text-white text-[9px] font-black w-5 h-5 rounded-full flex items-center justify-center">{myQueries.length}</span>
          </div>
          <span className="text-slate-400 text-xs">{showHistory?'▲':'▼'}</span>
        </button>
      )}

      <AnimatePresence>
      {showHistory&&(
        <motion.div initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}} className="mb-4 space-y-3">
          {myQueries.map(q=>(
            <div key={q.id} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <p className="font-black text-slate-800 text-sm">{q.date} at {q.time}</p>
                  <p className="text-slate-400 text-[10px] truncate">{q.venue}</p>
                  <p className="text-slate-500 text-[10px]">⛺{q.qtyCanopy} · 🪵{q.qtyTable} tables · 🪑{q.qtyChair} chairs · 💨{q.qtyFan} fans</p>
                </div>
                <span className={`text-[9px] font-black px-2 py-1 rounded-full flex-shrink-0 ${statusColor[q.status]||'bg-slate-100 text-slate-500'}`}>{statusLabel(q.status)}</span>
              </div>
              {q.quotation&&(
                <div className="bg-sky-50 border border-sky-200 rounded-xl p-2.5 mb-2">
                  <p className="text-sky-700 font-black text-xs mb-0.5">💰 Quotation</p>
                  <p className="text-sky-800 font-black text-lg">RM {q.quotation}</p>
                </div>
              )}
              <div className="flex gap-2 mt-2">
                <p className="text-slate-300 text-[9px] flex-1">Ref: {q.id}</p>
                {q.status==='accepted'&&(
                  <button onClick={()=>mockPay(q.id)} disabled={paying===q.id}
                    className="bg-emerald-500 text-white text-[10px] font-black px-3 py-1.5 rounded-xl active:scale-95 disabled:opacity-60">
                    {paying===q.id?'Processing...':t.cateringPayNow}
                  </button>
                )}
                {q.status!=='paid'&&(
                  <button onClick={()=>openWA(q)} className="bg-[#25D366] text-white text-[10px] font-black px-3 py-1.5 rounded-xl active:scale-95">
                    💬 WA
                  </button>
                )}
              </div>
            </div>
          ))}
        </motion.div>
      )}
      </AnimatePresence>

      {/* Step progress */}
      {step<3&&(
        <div className="flex items-center gap-2 mb-5">
          {[1,2].map(s=>(
            <div key={s} className={`flex-1 h-1.5 rounded-full transition-all ${s<=step?'bg-sky-500':'bg-slate-200'}`}/>
          ))}
          <span className="text-slate-400 text-[10px] font-black">{step}/2</span>
        </div>
      )}

      <AnimatePresence mode="wait">
      {/* ── STEP 1: Rental Details ── */}
      {step===1&&(
        <motion.div key="c1" initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-20}} className="space-y-4">
          <h3 className="font-black text-slate-900 text-base">{t.canopyStep1}</h3>

          {/* Date + Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-600 text-[10px] font-black uppercase tracking-wider block mb-1.5">{t.canopyDate}</label>
              <input type="date" value={date} onChange={e=>setDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3 py-3 text-sm font-bold focus:border-sky-400 focus:outline-none"/>
            </div>
            <div>
              <label className="text-slate-600 text-[10px] font-black uppercase tracking-wider block mb-1.5">{t.canopyTime}</label>
              <input type="time" value={time} onChange={e=>setTime(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3 py-3 text-sm font-bold focus:border-sky-400 focus:outline-none"/>
            </div>
          </div>

          {/* Venue */}
          <div>
            <label className="text-slate-600 text-[10px] font-black uppercase tracking-wider block mb-1.5">{t.canopyVenue}</label>
            <textarea value={venue} onChange={e=>setVenue(e.target.value)} rows={2}
              placeholder={t.canopyVenuePlaceholder}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold focus:border-sky-400 focus:outline-none placeholder:text-slate-300 resize-none"/>
          </div>

          {/* Qty spinners */}
          <div className="space-y-2">
            <QtyRow label={t.canopyQtyCanopy} val={qtyCanopy} setVal={setQtyCanopy} emoji="⛺"/>
            <QtyRow label={t.canopyQtyTable} val={qtyTable} setVal={setQtyTable} emoji="🪵"/>
            <QtyRow label={t.canopyQtyChair} val={qtyChair} setVal={setQtyChair} emoji="🪑"/>
            <QtyRow label={t.canopyQtyFan} val={qtyFan} setVal={setQtyFan} emoji="💨"/>
          </div>

          {/* Notes */}
          <div>
            <label className="text-slate-600 text-[10px] font-black uppercase tracking-wider block mb-1.5">{t.canopyNotes}</label>
            <textarea value={notes} onChange={e=>setNotes(e.target.value)} rows={2}
              placeholder={t.canopyNotesPlaceholder}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold focus:border-sky-400 focus:outline-none placeholder:text-slate-300 resize-none"/>
          </div>

          <button onClick={()=>setStep(2)} disabled={!canProceed1}
            className="w-full bg-sky-500 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest active:scale-95 disabled:opacity-40 shadow-lg shadow-sky-200">
            {t.canopySubmit}
          </button>
        </motion.div>
      )}

      {/* ── STEP 2: Contact ── */}
      {step===2&&(
        <motion.div key="c2" initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-20}} className="space-y-4">
          <h3 className="font-black text-slate-900 text-base">{t.canopyStep2}</h3>

          {/* Summary card */}
          <div className="bg-sky-50 border border-sky-200 rounded-2xl p-4">
            <p className="text-sky-700 font-black text-[10px] uppercase tracking-wider mb-2">📋 Rental Summary</p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
              <p><span className="text-slate-400">Date:</span> <span className="font-black">{date}</span></p>
              <p><span className="text-slate-400">Time:</span> <span className="font-black">{time}</span></p>
              <p><span className="text-slate-400">⛺</span> <span className="font-black">{qtyCanopy} canopies</span></p>
              <p><span className="text-slate-400">🪵</span> <span className="font-black">{qtyTable} tables</span></p>
              <p><span className="text-slate-400">🪑</span> <span className="font-black">{qtyChair} chairs</span></p>
              <p><span className="text-slate-400">💨</span> <span className="font-black">{qtyFan} fans</span></p>
            </div>
            <p className="text-slate-500 text-xs mt-2 truncate">📍 {venue}</p>
          </div>

          <div>
            <label className="text-slate-600 text-[10px] font-black uppercase tracking-wider block mb-1.5">{t.canopyName}</label>
            <input value={name} onChange={e=>setName(e.target.value)} placeholder={t.canopyNamePlaceholder}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold focus:border-sky-400 focus:outline-none placeholder:text-slate-300 focus:bg-white transition-colors"/>
          </div>
          <div>
            <label className="text-slate-600 text-[10px] font-black uppercase tracking-wider block mb-1.5">{t.canopyPhone}</label>
            <input value={phone} onChange={e=>setPhone(e.target.value)} type="tel" placeholder={t.canopyPhonePlaceholder}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold focus:border-sky-400 focus:outline-none placeholder:text-slate-300 focus:bg-white transition-colors"/>
          </div>

          <p className="text-slate-400 text-[10px] text-center">We'll WhatsApp you a quotation within 24 hours.</p>

          <div className="flex gap-3">
            <button onClick={()=>setStep(1)} className="flex-shrink-0 bg-slate-100 text-slate-500 py-4 px-5 rounded-2xl font-black text-sm active:scale-95">←</button>
            <button onClick={handleSubmit} disabled={!canSubmit}
              className="flex-1 bg-sky-500 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest active:scale-95 disabled:opacity-40 shadow-lg shadow-sky-200">
              {t.canopySubmit}
            </button>
          </div>
        </motion.div>
      )}

      {/* ── STEP 3: Success ── */}
      {step===3&&(
        <motion.div key="c3" initial={{opacity:0,scale:0.95}} animate={{opacity:1,scale:1}} className="text-center py-6">
          <motion.div initial={{scale:0}} animate={{scale:1}} transition={{type:'spring',delay:0.1}} className="text-6xl mb-4">⛺</motion.div>
          <h3 className="font-black text-slate-900 text-xl mb-2">{t.canopySuccessTitle}</h3>
          <p className="text-slate-500 text-sm mb-1">{t.canopySuccessMsg}</p>
          <div className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 inline-block mt-3 mb-5">
            <p className="text-slate-400 text-[9px] font-black uppercase">Reference ID</p>
            <p className="text-slate-800 font-black text-lg tracking-widest">{submittedId}</p>
          </div>
          <div className="space-y-3 px-2">
            {(()=>{const q=getCanopyQueries().find(x=>x.id===submittedId);return q?(
              <button onClick={()=>openWA(q)} className="w-full bg-[#25D366] text-white py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 active:scale-95 shadow-lg shadow-green-200">
                <span className="text-xl">💬</span>{t.canopyWA}
              </button>
            ):null;})()}
            <button onClick={()=>{setStep(1);setDate('');setTime('');setVenue('');setQtyCanopy('1');setQtyTable('0');setQtyChair('0');setQtyFan('0');setNotes('');setName('');setPhone('');setShowHistory(true);}}
              className="w-full bg-slate-100 text-slate-600 py-3.5 rounded-2xl font-black text-sm active:scale-95">
              {t.canopyNewQuery}
            </button>
          </div>
        </motion.div>
      )}
      </AnimatePresence>
    </div>
  );
}


function BuyerFeed({vendorListings,activeTab,userLocation,locationHook,t,onVendorTap,onCheckoutDone}){
  const [search,setSearch]=useState("");
  const [catFilter,setCatFilter]=useState("all");
  const [dealFilter,setDealFilter]=useState("all");
  const [buyerTab,setBuyerTab]=useState("foods"); // "foods" | "deals" | "cook" | "catering" | "canopy"
  const [cart,setCart]=useState([]);
  const [showCart,setShowCart]=useState(false);
  const [differentVendor,setDifferentVendor]=useState(null);
  const [sideOrderPopup,setSideOrderPopup]=useState(null); // {vendorId, vendorName, threshold}
  const isStudentMode=activeTab==="student";

  // When merchant posts a new deal, reset filters so it's guaranteed visible
  useEffect(()=>{
    if(vendorListings.length>0){
      setBuyerTab("foods");
      setCatFilter("all");
      setSearch("");
    }
  },[vendorListings.length]);

  const hav=(la1,lo1,la2,lo2)=>{
    const R=6371;const dL=(la2-la1)*Math.PI/180;const dO=(lo2-lo1)*Math.PI/180;
    const a=Math.sin(dL/2)**2+Math.cos(la1*Math.PI/180)*Math.cos(la2*Math.PI/180)*Math.sin(dO/2)**2;
    return+(R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a))).toFixed(1);
  };

  const allListings=[...vendorListings,...MOCK_LISTINGS]
    .filter((l,i,a)=>a.findIndex(x=>String(x.id)===String(l.id))===i)
    .filter(l=>{
      // Auto-remove expired posts from feed
      if(!l.endTime) return true; // no expiry set — always show (legacy mock data)
      if(typeof l.endTime==="string"){
        // "HH:MM" string — check if today's time has passed
        const now=new Date();const p=l.endTime.split(":").map(Number);
        const end=new Date();end.setHours(p[0],p[1],0,0);
        return end>now;
      }
      // ms timestamp
      return l.endTime>Date.now();
    })
    .map(l=>({
    ...l,
    distance:userLocation&&MOCK_VENDORS_GEO[l.vendorId]?hav(userLocation.lat,userLocation.lon,MOCK_VENDORS_GEO[l.vendorId].lat,MOCK_VENDORS_GEO[l.vendorId].lon):null,
  }));

  const cartIds=cart.map(i=>String(i.id));
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
  const regular=filtered.filter(l=>!urgentDeals.find(u=>u.id===l.id))
    .sort((a,b)=>{const ba=isListingBoosted(a.id)?1:0,bb=isListingBoosted(b.id)?1:0;return bb-ba;});

  const attemptAddToCart=(item)=>{
    if(cartIds.includes(String(item.id)))return;
    if(item.qty&&item.claimed>=item.qty)return;
    if(currentVendorId&&item.vendorId!==currentVendorId){
      const currentName=cart[0]?.vendorName||"current vendor";
      setDifferentVendor({item,currentName,newName:item.vendorName});
      return;
    }
    setCart(prev=>{
      const updated=[...prev,item];
      // After adding, check if vendor has menu or more deals + free delivery threshold
      const vendorMenu=getVendorMenu(item.vendorId);
      const updatedIds=updated.map(i=>String(i.id));
      const moreDeals=allListings.filter(l=>l.vendorId===item.vendorId&&!updatedIds.includes(String(l.id))&&!(l.qty&&l.claimed>=l.qty));
      const moreMenu=vendorMenu.filter(m=>m.available!==false&&!updatedIds.includes("menu_"+m.id));
      const hasMore=moreDeals.length>0||moreMenu.length>0;
      const threshold=item.freeDeliveryThreshold;
      // Show popup if vendor has more items OR has a free delivery threshold
      if(hasMore||threshold){
        setTimeout(()=>setSideOrderPopup({
          vendorId:item.vendorId,
          vendorName:item.vendorName,
          threshold,
          moreDeals,
          moreMenu,
        }),300);
      }
      return updated;
    });
  };

  const removeFromCart=(idx)=>setCart(prev=>prev.filter((_,i)=>i!==idx));

  return(
    <div className="min-h-screen bg-slate-50 pb-28">
      <LocationPrompt locationHook={locationHook} t={t}/>
      <div className="bg-amber-50 border-b border-amber-200 px-4 py-1.5 flex items-center gap-2">
        <span className="text-xs flex-shrink-0">⚠️</span>
        <p className="text-amber-700 text-[10px] font-bold">{t.halalSelfDeclared}</p>
      </div>

      {/* ── STICKY NAV BAR — single compact row with inline dropdowns ── */}
      {(()=>{
        const CAT_OPTS=[
          {id:"all",emoji:"🍽️",label:"All"},
          {id:"Food",emoji:"🍛",label:t.catFood},
          {id:"Drink",emoji:"🧋",label:t.catDrink},
          {id:"Bakery",emoji:"🥐",label:t.catBakery},
          {id:"Dessert",emoji:"🍡",label:t.catDessert||"Dessert"},
          {id:"TongSui",emoji:"🍮",label:t.catTongSui||"Tong Sui"},
          {id:"Fruit",emoji:"🍉",label:t.catFruit},
          {id:"Other",emoji:"📦",label:t.catOther},
        ];
        const DEAL_OPTS=[
          {id:"all",label:"All Deals"},
          {id:"promo",label:"Promotion"},
          {id:"limited",label:"Limited"},
          {id:"surplus",label:"Surplus"},
          {id:"special",label:"Special"},
        ];
        const activeCat=CAT_OPTS.find(c=>c.id===catFilter)||CAT_OPTS[0];
        const activeDeal=DEAL_OPTS.find(d=>d.id===dealFilter)||DEAL_OPTS[0];
        return(
          <div className="bg-white border-b border-slate-100 px-3 py-2 sticky top-[60px] z-40">
            <div className="flex items-center gap-2">
              {/* Search icon — expands on food/deal/menu tabs */}
              {!isStudentMode&&buyerTab!=="catering"&&buyerTab!=="canopy"&&(
                <div className="relative flex-1">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs">🔍</span>
                  <input type="text" value={search} onChange={e=>setSearch(e.target.value)}
                    placeholder="Search..."
                    className="w-full bg-slate-100 rounded-xl pl-7 pr-7 py-2 text-xs font-medium outline-none focus:ring-2 focus:ring-emerald-400"/>
                  {search&&<button onClick={()=>setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs">✕</button>}
                </div>
              )}

              {/* ── TAB SELECTOR — native select styled as pill ── */}
              <div className="relative flex-shrink-0">
                <select
                  value={buyerTab}
                  onChange={e=>{setBuyerTab(e.target.value);setCatFilter("all");setDealFilter("all");}}
                  className={`appearance-none pl-2.5 pr-6 py-2 rounded-xl text-[11px] font-black border-0 outline-none cursor-pointer transition-all ${
                    buyerTab==="foods"?"bg-emerald-500 text-white":
                    buyerTab==="deals"?"bg-orange-500 text-white":
                    buyerTab==="cook"?"bg-purple-500 text-white":
                    buyerTab==="catering"?"bg-rose-500 text-white":
                    buyerTab==="canopy"?"bg-sky-500 text-white":
                    "bg-slate-100 text-slate-600"
                  }`}>
                  {!isStudentMode&&<option value="foods">🍽️ All Foods</option>}
                  {!isStudentMode&&<option value="deals">🔖 Deals</option>}
                  {!isStudentMode&&<option value="cook">📋 Menu</option>}
                  <option value="catering">🎂 Catering</option>
                  <option value="canopy">⛺ Canopy</option>
                </select>
                <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[8px] text-white/80">▼</span>
              </div>

              {/* ── CATEGORY DROPDOWN — only on All Foods tab ── */}
              {!isStudentMode&&buyerTab==="foods"&&(
                <div className="relative flex-shrink-0">
                  <select
                    value={catFilter}
                    onChange={e=>setCatFilter(e.target.value)}
                    className="appearance-none bg-slate-100 text-slate-700 pl-2.5 pr-6 py-2 rounded-xl text-[11px] font-black border-0 outline-none cursor-pointer">
                    {CAT_OPTS.map(c=><option key={c.id} value={c.id}>{c.emoji} {c.label}</option>)}
                  </select>
                  <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[8px] text-slate-400">▼</span>
                </div>
              )}

              {/* ── DEAL TYPE DROPDOWN — only on Deals tab ── */}
              {!isStudentMode&&buyerTab==="deals"&&(
                <div className="relative flex-shrink-0">
                  <select
                    value={dealFilter}
                    onChange={e=>setDealFilter(e.target.value)}
                    className="appearance-none bg-slate-100 text-slate-700 pl-2.5 pr-6 py-2 rounded-xl text-[11px] font-black border-0 outline-none cursor-pointer">
                    {DEAL_OPTS.map(d=><option key={d.id} value={d.id}>{d.label}</option>)}
                  </select>
                  <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[8px] text-slate-400">▼</span>
                </div>
              )}

              {/* ── CANOPY QUICK-TAP — visible when on Catering tab ── */}
              {buyerTab==="catering"&&(
                <button onClick={()=>setBuyerTab("canopy")}
                  className="flex-shrink-0 flex items-center gap-1 bg-sky-50 border border-sky-200 text-sky-600 px-3 py-2 rounded-xl text-[11px] font-black active:scale-95 transition-all whitespace-nowrap">
                  ⛺ Canopy
                </button>
              )}

              {/* ── CATERING QUICK-TAP — visible when on Canopy tab ── */}
              {buyerTab==="canopy"&&(
                <button onClick={()=>setBuyerTab("catering")}
                  className="flex-shrink-0 flex items-center gap-1 bg-rose-50 border border-rose-200 text-rose-500 px-3 py-2 rounded-xl text-[11px] font-black active:scale-95 transition-all whitespace-nowrap">
                  🎂 Catering
                </button>
              )}
            </div>
          </div>
        );
      })()}

      {/* ── ORDER TO COOK TAB — always mounted ── */}
      <div style={{display:(buyerTab==="cook"&&!isStudentMode)?"block":"none"}}>
        <MenuBrowse allListings={allListings} onAddToCart={attemptAddToCart} cart={cart} t={t}/>
      </div>

      {/* ── EVENT CATERING TAB — always mounted, hidden when inactive ── */}
      <div style={{display:buyerTab==="catering"?"block":"none"}}>
        <CateringEnquiry t={t}/>
      </div>

      {/* ── CANOPY RENTAL TAB — always mounted, hidden when inactive ── */}
      <div style={{display:buyerTab==="canopy"?"block":"none"}}>
        <CanopyRental t={t}/>
      </div>

      <div className="px-3 pt-3 pb-6" style={{display:(buyerTab==="cook"||buyerTab==="catering"||buyerTab==="canopy")?"none":"block"}}>
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
                    onVendorTap={onVendorTap}
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
                onVendorTap={onVendorTap}
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
            onCheckout={(meta)=>{setCart([]);setShowCart(false);if(onCheckoutDone&&meta)onCheckoutDone(meta);}}
            onAdd={attemptAddToCart}
            allListings={allListings}
            t={t}/>
        )}
      </AnimatePresence>

      {/* Side order popup — appears after adding to cart */}
      <AnimatePresence>
        {sideOrderPopup&&!showCart&&(
          <SideOrderPopup
            popup={sideOrderPopup}
            cart={cart}
            onAdd={attemptAddToCart}
            onCheckout={()=>{setSideOrderPopup(null);setShowCart(true);}}
            onClose={()=>setSideOrderPopup(null)}
            allListings={allListings}
          />
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
  const notifHook=useNotifications();
  const [showRating,setShowRating]=useState(null); // {vendorId,vendorName,orderId}
  const [viewVendorProfile,setViewVendorProfile]=useState(null); // {vendorId,...}
  const t=T[lang]||T.en;

  useEffect(()=>{if(locationHook.status==='idle')locationHook.request();},[]);

  const handleNewListing=(listing)=>{
    setVendorListings(p=>[listing,...p]);
    // Fire in-app notification to simulate buyer alert
    notifHook.push({type:'new_deal',title:`New deal: ${listing.title}`,body:`RM${fmtRM(listing.dealPrice)} from ${listing.vendorName||'a vendor near you'}`,icon:'🍽️'});
  };

  const handlePostDone=()=>{
    // After merchant finishes post flow (dismissed success modal), show them buyer feed
    setTab("deals");
  };

  return(
    <div className="max-w-sm mx-auto relative md:max-w-none md:mx-0">
      <AnimatePresence>
        {showHalalDisclaimer&&<HalalDisclaimer t={t} onAccept={()=>setShowHalalDisclaimer(false)}/>}
      </AnimatePresence>

      <header className="sticky top-0 z-50 bg-white border-b border-slate-100 px-4 py-2 flex items-center justify-between relative">
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
          <NotificationBell hook={notifHook}/>
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
        <BuyerFeed vendorListings={vendorListings} activeTab={tab} userLocation={locationHook.loc} locationHook={locationHook} t={t}
          onVendorTap={(listing)=>{
            // Build listings list for this vendor from allListings
            setViewVendorProfile({vendorId:listing.vendorId,vendorName:listing.vendorName,vendorPhone:listing.vendorPhone,listings:[listing],cart:[],onAddToCart:()=>{}});
          }}
          onCheckoutDone={(meta)=>{
            if(meta?.vendorId){setTimeout(()=>setShowRating({vendorId:meta.vendorId,vendorName:meta.vendorName,orderId:meta.pickupCode}),800);}
          }}
        />
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
            <VendorFlow onNewListing={handleNewListing} onPostDone={handlePostDone} vendorMeta={vendorMeta} subscription={subscription} onShowSubscription={()=>setShowSubscription(true)} t={t}/>
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

      {/* Rating Modal — shown after checkout */}
      <AnimatePresence>
        {showRating&&(
          <RatingModal
            vendorId={showRating.vendorId}
            vendorName={showRating.vendorName}
            orderId={showRating.orderId}
            onDone={()=>setShowRating(null)}
          />
        )}
      </AnimatePresence>

      {/* Vendor Profile Page — full sheet */}
      <AnimatePresence>
        {viewVendorProfile&&(
          <VendorProfilePage
            vendorId={viewVendorProfile.vendorId}
            vendorName={viewVendorProfile.vendorName}
            vendorPhone={viewVendorProfile.vendorPhone}
            listings={viewVendorProfile.listings||[]}
            onClose={()=>setViewVendorProfile(null)}
            onAddToCart={viewVendorProfile.onAddToCart||(()=>{})}
            cart={viewVendorProfile.cart||[]}
            t={t}
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