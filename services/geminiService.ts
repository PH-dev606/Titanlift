
import { GoogleGenAI } from "@google/genai";

export async function getExerciseTip(exerciseName: string) {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Forneça 3 dicas rápidas e técnicas para realizar o exercício "${exerciseName}" com perfeição. Seja conciso e direto.`,
      config: {
        temperature: 0.7,
      },
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Não foi possível carregar dicas de IA no momento.";
  }
}

export async function getMotivationalQuote() {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Diga uma frase curta e motivacional sobre treino e disciplina.`,
    });
    return response.text;
  } catch (error) {
    return "A consistência é a chave para o sucesso.";
  }
}
