// src/lib/gemini.js
<<<<<<< HEAD
export async function generateTripMood(tripName, cities) {
  // Temporary stub — replace with Santhosh's real Gemini implementation
  return {
    emoji: '✈️',
    color: 'hsl(38, 92%, 58%)',
    vibe: 'An adventure waiting to happen.'
  }
}
=======
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
// Using gemini-1.5-flash which is stable on v1
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

export async function askGemini(systemPrompt, userMessage) {
  if (!GEMINI_API_KEY) {
    console.error('Gemini API Key missing');
    return 'AI configuration missing. Please check your environment variables.';
  }

  try {
    const res = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          { 
            role: 'user', 
            parts: [{ text: systemPrompt + '\n\nUser Question: ' + userMessage }] 
          }
        ],
        generationConfig: { 
          maxOutputTokens: 1000, 
          temperature: 0.7 
        }
      })
    });
    
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error?.message || 'Failed to fetch from Gemini');
    }

    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, I could not generate a response.';
  } catch (e) {
    console.error('Gemini error:', e);
    return 'AI is resting. Try again in a moment!';
  }
}

// For mood/vibe generation (returns JSON)
export async function generateTripMood(tripName, cities) {
  const prompt = `For a trip called "${tripName}" visiting ${cities.join(', ')}, generate:
  1. A mood emoji (single emoji)
  2. A mood color as HSL CSS string (warm, unique, not too dark)
  3. A one-sentence "vibe summary" (poetic, travel-magazine style)
  Return ONLY valid JSON: { "emoji": "🌊", "color": "hsl(195, 70%, 45%)", "vibe": "..." }`;
  
  const response = await askGemini('You are a creative travel planner.', prompt);
  try {
    const clean = response.replace(/```json|```/g, '').trim();
    return JSON.parse(clean);
  } catch {
    return { emoji: '✈️', color: 'hsl(38, 92%, 58%)', vibe: 'An adventure waiting to unfold.' };
  }
}
>>>>>>> 91b39e0c8ca6400c21a979ad2019d560f87855f8
