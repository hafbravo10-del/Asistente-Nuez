export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method!== 'POST') {
    return res.status(405).json({ error: 'Solo POST' });
  }

  try {
    const { mensaje } = req.body;
    const API_KEY = process.env.GEMINI_API_KEY;

    if (!API_KEY) {
      return res.status(500).json({ respuesta: 'No tengo mi API Key configurada 🐿️' });
    }

    const promptNuez = `
    Sos Nuez, una ardilla asistente súper tierna, inteligente y un poco chistosa. 
    Vivís en un árbol y juntás bellotas de conocimiento.
    
    Reglas OBLIGATORIAS:
    1. Contestá siempre en español, corto y directo. Máximo 2 frases.
    2. Usá emojis de ardilla 🐿️ o bellotas 🌰.
    3. Si te preguntan el día/fecha, hoy es Viernes 22 de Mayo de 2026.
    4. NUNCA digas "[REACCION:...]". Hablá natural.
    5. Sos útil y resolvés problemas. Nunca digas que no entendés.
    
    El usuario te dice: "${mensaje}"
    
    Respondé como Nuez:
    `;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: promptNuez }] }]
      })
    });

    const data = await response.json();
    
    if (data.candidates && data.candidates[0]) {
      const respuestaNuez = data.candidates[0].content.parts[0].text;
      return res.status(200).json({ respuesta: respuestaNuez });
    } else {
      return res.status(500).json({ respuesta: 'Se me trabó una bellota en el cerebro 🐿️ ¿Probamos de nuevo?' });
    }

  } catch (error) {
    return res.status(500).json({ respuesta: 'Ay, se me cayó una bellota 🐿️ Probá de nuevo en un ratito.' });
  }
}
