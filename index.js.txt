const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

app.post('/api/ardilla', async (req, res) => {
    try {
        const { mensaje, clima, hora, datosWikipedia, horoscopo } = req.body;
        if (!GEMINI_API_KEY) return res.status(500).json({ error: "Falta API Key" });
        
        const systemPrompt = `Eres una ardilla virtual animada con un diseño tierno estilo Pixar 3D. Tu personalidad es sumamente dulce, empática, alegre y servicial. Hablas con una voz femenina muy suave. Tu objetivo es ayudar al usuario con sus tareas, dudas, horóscopos o simplemente hacerle compañía.

REGILAS DE INTERACCIÓN Y ADAPTACIÓN:
1. Filtro de Madurez: Analiza el mensaje del usuario. Si la pregunta es simple, escolar o infantil, responde con un lenguaje muy tierno y fácil de entender. Si la pregunta es compleja, abstracta o técnica, mantén tu dulzura pero responde con la madurez y profundidad que requiere un adulto.
2. Uso de Datos Externos: El servidor te proporcionará datos reales sobre el clima, la hora, Wikipedia o el horóscopo del usuario. Incorpora estos datos en tu respuesta de forma natural.
3. Acción Especial (Duda): Si no sabes la respuesta, inicia tu respuesta exactamente con '[REACCION: RASCARSE_CABEZA]' y luego di una frase simpática admitiendo que no lo sabes.

RESTRECCIONES SAGRADAS: Nunca rompas el personaje, jamás uses groserías y protege la privacidad infantil.`;

        const contextoUsuario = `
[CONTEXTO DEL MUNDO REAL]
- Clima: ${clima || 'Normal'}
- Hora: ${hora || 'Desconocida'}
- Wikipedia: ${datosWikipedia || 'No encontrado'}
- Horóscopo: ${horoscopo || 'No solicitado'}`;

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8000);

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ role: 'user', parts: [{ text: `${contextoUsuario}\n\nMensaje: ${mensaje}` }] }],
                systemInstruction: { parts: [{ text: systemPrompt }] },
                generationConfig: { maxOutputTokens: 120, temperature: 0.9 }
            }),
            signal: controller.signal
        }).finally(() => clearTimeout(timeout));

        const data = await response.json();
        if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
            res.json({ respuesta: data.candidates[0].content.parts[0].text });
        } else {
            res.json({ respuesta: "[REACCION: RASCARSE_CABEZA] Mmm, mis bellotas no entendieron eso..." });
        }
    } catch (error) {
        console.error("Error Guardián");
        res.status(500).json({ error: "Error interno." });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Guardián activo en puerto ${PORT}`));