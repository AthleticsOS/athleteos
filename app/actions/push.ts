'use server'

import webpush from 'web-push'
import { createClient } from '@supabase/supabase-js'

webpush.setVapidDetails(
  'mailto:' + process.env.VAPID_EMAIL!,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
)

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function subscribeUser(userId: string, sub: {
  endpoint: string
  keys: { p256dh: string; auth: string }
}) {
  await supabaseAdmin.from('push_subscriptions').upsert({
    user_id: userId,
    endpoint: sub.endpoint,
    p256dh: sub.keys.p256dh,
    auth: sub.keys.auth,
  }, { onConflict: 'endpoint' })

  return { success: true }
}

export async function unsubscribeUser(endpoint: string) {
  await supabaseAdmin
    .from('push_subscriptions')
    .delete()
    .eq('endpoint', endpoint)

  return { success: true }
}

export async function sendPushToUser(userId: string, title: string, body: string) {
  const { data: subs } = await supabaseAdmin
    .from('push_subscriptions')
    .select('*')
    .eq('user_id', userId)

  if (!subs || subs.length === 0) return { success: false }

  await Promise.all(subs.map((sub) =>
    webpush.sendNotification(
      { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
      JSON.stringify({ title, body, icon: '/icon-192.png' })
    ).catch(() => null)
  ))

  return { success: true }
}

export async function sendPushToAll(clubId: string, title: string, body: string) {
  const { data: athletes } = await supabaseAdmin
    .from('athletes')
    .select('user_id')
    .eq('club_id', clubId)
    .not('user_id', 'is', null)

  if (!athletes) return { success: false }

  const userIds = athletes.map((a) => a.user_id)

  const { data: subs } = await supabaseAdmin
    .from('push_subscriptions')
    .select('*')
    .in('user_id', userIds)

  if (!subs || subs.length === 0) return { success: false }

  await Promise.all(subs.map((sub) =>
    webpush.sendNotification(
      { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
      JSON.stringify({ title, body, icon: '/icon-192.png' })
    ).catch(() => null)
  ))

  return { success: true }
}
