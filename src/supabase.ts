import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://hqtwugmbzfsngwteixjh.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhxdHd1Z21iemZzbmd3dGVpeGpoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIzNDEzMDksImV4cCI6MjA4NzkxNzMwOX0.vzxlSIfsHX7AchN1bZjZlBLJuYbH0oICV5y4LB28yxY'

export const supabase = createClient(supabaseUrl, supabaseKey)

// ── Vendor helpers ────────────────────────────────────────────────────────────
export async function getVendor(userId: string) {
  const { data, error } = await supabase
    .from('vendors').select('*').eq('user_id', userId).single()
  return { data, error }
}

export async function upsertVendor(userId: string, profile: any) {
  const { data, error } = await supabase
    .from('vendors').upsert({ user_id: userId, ...profile }, { onConflict: 'user_id' }).select().single()
  return { data, error }
}

// ── Listings helpers ──────────────────────────────────────────────────────────
export async function getActiveListings() {
  const { data, error } = await supabase
    .from('listings').select('*, vendors(name, halal, muslim_owned, subscribed, lat, lon, area)')
    .eq('active', true).gt('qty_remaining', 0).order('created_at', { ascending: false })
  return { data, error }
}

export async function createListing(vendorId: string, listing: any) {
  const { data, error } = await supabase
    .from('listings').insert({ vendor_id: vendorId, ...listing }).select().single()
  return { data, error }
}

export async function decrementQty(listingId: string) {
  const { error } = await supabase.rpc('decrement_qty', { listing_id: listingId })
  return { error }
}

// ── Orders helpers ────────────────────────────────────────────────────────────
export async function createOrder(order: any) {
  const { data, error } = await supabase
    .from('orders').insert(order).select().single()
  return { data, error }
}

export async function getBuyerOrders(buyerId: string) {
  const { data, error } = await supabase
    .from('orders').select('*').eq('buyer_id', buyerId).order('ordered_at', { ascending: false })
  return { data, error }
}

export async function getVendorSales(vendorId: string) {
  const { data, error } = await supabase
    .from('sales').select('*').eq('vendor_id', vendorId).order('sold_at', { ascending: false })
  return { data, error }
}

// ── Ads helpers ───────────────────────────────────────────────────────────────
export async function getAdsFromDB() {
  const { data, error } = await supabase
    .from('ads').select('*')
  if (error || !data) return null
  const result: any = {}
  data.forEach((ad: any) => { result[ad.placement] = ad })
  return result
}

export async function updateAdInDB(placement: string, fields: any) {
  const { error } = await supabase
    .from('ads').update({ ...fields, updated_at: new Date().toISOString() }).eq('placement', placement)
  return { error }
}

// ── Auth helpers ──────────────────────────────────────────────────────────────
export async function signUp(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({ email, password })
  return { data, error }
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  return { data, error }
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  return { error }
}

export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession()
  return session
}