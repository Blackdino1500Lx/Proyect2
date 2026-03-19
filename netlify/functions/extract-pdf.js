// netlify/functions/extract-pdf.js
// Proxy seguro para llamar a Claude API desde el cliente

export async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' }
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'API key no configurada en el servidor' })
    }
  }

  let body
  try {
    body = JSON.parse(event.body)
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Body inválido' }) }
  }

  const { pdfBase64 } = body
  if (!pdfBase64) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Falta el PDF' }) }
  }

  const prompt = `Extrae TODAS las semanas de esta Guía de Actividades para la Reunión.

Devuelve SOLO JSON con esta estructura (sin texto extra, sin bloques de código):
{"weeks":[{"id":"s1","dateRange":"6-12 DE JULIO","bibleReading":"JEREMÍAS 13-15","openingSong":"123","midSong":"49","closingSong":"61","sections":[{"name":"TESOROS DE LA BIBLIA","icon":"💎","items":[{"number":1,"title":"título","duration":10,"type":"talk","assignedTo":""},{"number":2,"title":"Busquemos perlas escondidas","duration":10,"type":"discussion","assignedTo":""},{"number":3,"title":"Lectura (cita bíblica)","duration":4,"type":"reading","assignedTo":""}]},{"name":"SEAMOS MEJORES MAESTROS","icon":"📖","items":[{"number":4,"title":"título","duration":3,"type":"demo","assignedTo":""},{"number":5,"title":"título","duration":4,"type":"demo","assignedTo":""},{"number":6,"title":"título","duration":5,"type":"talk","assignedTo":""}]},{"name":"NUESTRA VIDA CRISTIANA","icon":"🏠","items":[{"number":7,"title":"título","duration":15,"type":"discussion","assignedTo":""},{"number":8,"title":"Estudio bíblico de la congregación","duration":30,"type":"study","assignedTo":""}]}]}]}

IMPORTANTE: assignedTo siempre "". Títulos cortos (máx 60 caracteres). TODAS las semanas.`

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-beta': 'pdfs-2024-09-25'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 6000,
        messages: [{
          role: 'user',
          content: [
            {
              type: 'document',
              source: { type: 'base64', media_type: 'application/pdf', data: pdfBase64 }
            },
            { type: 'text', text: prompt }
          ]
        }]
      })
    })

    const responseText = await response.text()
    console.log('Claude API status:', response.status)
    console.log('Claude API response preview:', responseText.slice(0, 300))

    if (!response.ok) {
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: `Error de Claude API: ${response.status}`, detail: responseText })
      }
    }

    const data = JSON.parse(responseText)
    const text = (data.content?.[0]?.text || '')
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim()

    // Validar JSON
    const parsed = JSON.parse(text)
    if (!parsed?.weeks?.length) throw new Error('No se encontraron semanas')

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(parsed)
    }

  } catch (err) {
    console.log('Function error:', err.message)
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message || 'Error interno del servidor' })
    }
  }
}