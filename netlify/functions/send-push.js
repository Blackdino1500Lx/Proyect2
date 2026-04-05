// netlify/functions/send-push.js
const webpush = require('web-push')

webpush.setVapidDetails(
  'mailto:admin@congregacionvistagrande.com',
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
)

exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' }
  }

  let body
  try {
    body = JSON.parse(event.body)
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'JSON invalido' }) }
  }

  // Caso especial: renovación de suscripción desde el SW
  if (body.renewedSubscription) {
    console.log('Suscripcion renovada:', body.renewedSubscription.endpoint?.slice(0, 50))
    return { statusCode: 200, body: JSON.stringify({ ok: true }) }
  }

  const { subscriptions, title, message, weekId } = body

  if (!subscriptions || !subscriptions.length) {
    return { statusCode: 200, body: JSON.stringify({ sent: 0 }) }
  }

  const payload = JSON.stringify({
    title:  title   || 'Pizarra Digital',
    body:   message || 'Tienes una nueva asignacion',
    weekId: weekId  || null
  })

  const results = await Promise.allSettled(
    subscriptions.map(sub =>
      webpush.sendNotification(sub, payload).catch(err => {
        if (err.statusCode === 410 || err.statusCode === 404) {
          return { expired: true, endpoint: sub.endpoint }
        }
        throw err
      })
    )
  )

  const expired = results
    .filter(r => r.status === 'fulfilled' && r.value?.expired)
    .map(r => r.value.endpoint)

  const sent = results.filter(r => r.status === 'fulfilled' && !r.value?.expired).length

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sent, expired })
  }
}