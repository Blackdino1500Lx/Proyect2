// netlify/functions/send-push.js
const webpush = require('web-push')
const { createClient } = require('@supabase/supabase-js')

webpush.setVapidDetails(
  'mailto:' + (process.env.VAPID_EMAIL || 'admin@congregacion.com'),
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
)

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY   // service_role key, no la anon
)

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' }
  }

  let body
  try { body = JSON.parse(event.body) }
  catch { return { statusCode: 400, body: JSON.stringify({ error: 'JSON inválido' }) } }

  const { toUserId, title, body: msgBody, data } = body

  if (!toUserId) {
    return { statusCode: 400, body: JSON.stringify({ error: 'toUserId requerido' }) }
  }

  // Buscar suscripción del usuario en Supabase
  const { data: sub, error } = await supabase
    .from('push_subscriptions')
    .select('endpoint, p256dh, auth')
    .eq('user_id', toUserId)
    .single()

  if (error || !sub) {
    return { statusCode: 404, body: JSON.stringify({ error: 'Sin suscripción para este usuario' }) }
  }

  const pushSubscription = {
    endpoint: sub.endpoint,
    keys: { p256dh: sub.p256dh, auth: sub.auth }
  }

  const payload = JSON.stringify({
    title: title || 'Pizarra Digital',
    body:  msgBody || 'Tienes una nueva asignación',
    icon:  '/icons/icon-192.png',
    badge: '/icons/icon-72.png',
    tag:   'asignacion',
    data:  data || {}
  })

  try {
    await webpush.sendNotification(pushSubscription, payload)
    return {
      statusCode: 200,
      body: JSON.stringify({ ok: true })
    }
  } catch(err) {
    // Suscripción expirada o inválida → limpiar BD
    if (err.statusCode === 410 || err.statusCode === 404) {
      await supabase.from('push_subscriptions').delete().eq('user_id', toUserId)
    }
    console.error('[send-push]', err)
    return {
      statusCode: err.statusCode || 500,
      body: JSON.stringify({ error: err.message })
    }
  }
}
