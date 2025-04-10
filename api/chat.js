const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

/**
 * Endpoint serverless para Vercel que responde a POST /api/chat
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Método no permitido' });
    return;
  }

  const { message } = req.body;

  const prompt = `Eres un asistente virtual experto en fundas personalizadas y en el sitio web FundasPro. Solo responde preguntas relacionadas con fundas para celulares, personalización, compra, envío, o el sitio web. Si la pregunta no está relacionada, responde educadamente que solo puedes ayudar con temas de fundas personalizadas y el sitio.

Pregunta: ${message}`;

  const huggingfaceApiKey = process.env.HUGGINGFACE_API_KEY;
  if (!huggingfaceApiKey) {
    res.status(500).json({ error: 'No está configurada la API Key de Hugging Face' });
    return;
  }

  try {
    const response = await fetch('https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${huggingfaceApiKey}`
      },
      body: JSON.stringify({ inputs: prompt })
    });

    const data = await response.json();

    console.log('Respuesta cruda Hugging Face:', data);

    if (!response.ok) {
      console.error('Error Hugging Face API:', data);
      res.status(response.status).json({ error: 'Error Hugging Face API', details: data });
      return;
    }

    let replyText = '';

    if (Array.isArray(data) && data.length > 0 && data[0].generated_text) {
      replyText = data[0].generated_text;
    } else if (typeof data === 'object' && data.generated_text) {
      replyText = data.generated_text;
    } else {
      replyText = 'No se pudo generar una respuesta.';
    }

    // Limpiar respuesta
    let cleanedReply = replyText;
    const preguntaIndex = cleanedReply.indexOf('Pregunta:');
    if (preguntaIndex !== -1) {
      cleanedReply = cleanedReply.slice(preguntaIndex + 'Pregunta:'.length);
    }
    cleanedReply = cleanedReply.trim();

    console.log('Respuesta enviada al frontend:', cleanedReply);

    res.status(200).json({ reply: cleanedReply });
  } catch (error) {
    console.error('Error al conectar con Hugging Face:', error);
    res.status(500).json({ error: 'Error al conectar con Hugging Face', details: error.toString() });
  }
}