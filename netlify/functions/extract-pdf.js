// netlify/functions/extract-pdf.js
// Proxy seguro para llamar a Claude API desde el cliente
// La API key vive en variables de entorno de Netlify, nunca en el código

export async function handler(event) {
  // Solo aceptar POST
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' }
  }

  // Verificar que existe la API key en el servidor
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

  const prompt = `Eres un asistente que extrae información de la "Guía de Actividades para la Reunión Vida y Ministerio Cristianos".

Analiza este PDF y extrae TODAS las semanas. Devuelve SOLO un JSON con esta estructura exacta, sin texto adicional ni bloques de código:

{
  "weeks": [
    {
      "id": "semana-1",
      "dateRange": "6-12 DE JULIO",
      "bibleReading": "JEREMÍAS 13-15",
      "openingSong": "123",
      "midSong": "49",
      "closingSong": "61",
      "sections": [
        {
          "name": "TESOROS DE LA BIBLIA",
          "icon": "💎",
          "items": [
            { "number": 1, "title": "Jehová merece que le obedezcamos", "duration": 10, "type": "talk", "assignedTo": "" },
            { "number": 2, "title": "Busquemos perlas escondidas", "duration": 10, "type": "discussion", "assignedTo": "" },
            { "number": 3, "title": "Lectura de la Biblia (Jer 13:1-14)", "duration": 4, "type": "reading", "assignedTo": "" }
          ]
        },
        {
          "name": "SEAMOS MEJORES MAESTROS",
          "icon": "📖",
          "items": [
            { "number": 4, "title": "Empiece conversaciones", "duration": 3, "type": "demo", "assignedTo": "" },
            { "number": 5, "title": "Haga revisitas", "duration": 4, "type": "demo", "assignedTo": "" },
            { "number": 6, "title": "Discurso", "duration": 5, "type": "talk", "assignedTo": "" }
          ]
        },
        {
          "name": "NUESTRA VIDA CRISTIANA",
          "icon": "🏠",
          "items": [
            { "number": 7, "title": "Título del tema", "duration": 15, "type": "discussion", "assignedTo": "" },
            { "number": 8, "title": "Estudio bíblico de la congregación", "duration": 30, "type": "study", "assignedTo": "" }
          ]
        }
      ]
    }
  ]
}

Reglas importantes:
- Extrae TODAS las semanas del PDF sin excepción
- El campo assignedTo siempre empieza como string vacío ""
- Tipos válidos: talk, reading, demo, discussion, study
- Devuelve SOLO el JSON puro, sin bloques de código ni explicaciones`

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 8000,
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

    if (!response.ok) {
      const err = await response.text()
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: `Error de Claude API: ${response.status}`, detail: err })
      }
    }

    const data = await response.json()
    const text = (data.content?.[0]?.text || '')
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim()

    // Validar que sea JSON válido
    JSON.parse(text)

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: text
    }

  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message || 'Error interno del servidor' })
    }
  }
}
