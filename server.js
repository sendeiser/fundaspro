const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

require('dotenv').config();

// Importar fetch compatible con Node.js
let fetch;
try {
  fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
} catch {
  console.error('Error al importar node-fetch');
}

const app = express();
const PORT = 3000;

// Reemplaza con tu clave API de OpenAI
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

app.use(cors());
app.use(bodyParser.json());

app.post('/api/chat', async (req, res) => {
  const { message } = req.body;
const prompt = `Eres un asistente virtual experto en fundas personalizadas y en el sitio web FundasPro. Solo responde preguntas relacionadas con fundas para celulares, personalización, compra, envío, o el sitio web. Si la pregunta no está relacionada, responde educadamente que solo puedes ayudar con temas de fundas personalizadas y el sitio.

Pregunta: ${message}`;
  try {
    const response = await fetch('https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.HUGGINGFACE_TOKEN}`
      },
      body: JSON.stringify({
        inputs: prompt
      })
    });

    const data = await response.json();

    console.log('Respuesta cruda Hugging Face:', data);

    if (!response.ok) {
      console.error('Error Hugging Face API:', data);
      return res.status(response.status).json({ error: 'Error Hugging Face API', details: data });
    }

    let replyText = '';

    if (Array.isArray(data) && data.length > 0 && data[0].generated_text) {
      replyText = data[0].generated_text;
    } else if (typeof data === 'object' && data.generated_text) {
      replyText = data.generated_text;
    } else {
      replyText = 'No se pudo generar una respuesta.';
    }

    // Eliminar el prompt y la pregunta repetida para que solo quede la respuesta
    let cleanedReply = replyText;

    const preguntaIndex = cleanedReply.indexOf('Pregunta:');
    if (preguntaIndex !== -1) {
      cleanedReply = cleanedReply.slice(preguntaIndex + 'Pregunta:'.length);
    }

    cleanedReply = cleanedReply.trim();

    console.log('Respuesta enviada al frontend:', cleanedReply);

    res.json({ reply: cleanedReply });
  } catch (error) {
    console.error('Error al conectar con Hugging Face:', error);
    res.status(500).json({ error: 'Error al conectar con Hugging Face', details: error.toString() });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor backend escuchando en http://localhost:${PORT}`);
});