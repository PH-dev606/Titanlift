
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export interface AiTipResponse {
  text: string;
  sources?: { uri: string; title: string }[];
}

/**
 * Busca uma frase motivacional curta.
 */
export const getMotivationalQuote = async (): Promise<string> => {
  const defaultQuotes = ["Vá e vença.", "Foco no treino.", "Sua única competição é você."];
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: "Diga uma frase de motivação bem curta para academia. Máximo 5 palavras.",
    });
    return response.text?.trim() || defaultQuotes[0];
  } catch {
    return defaultQuotes[0];
  }
};

/**
 * Obtém uma dica técnica simples usando busca na internet para precisão.
 */
export const getExerciseTip = async (exerciseName: string): Promise<AiTipResponse> => {
  const fallback: AiTipResponse = { text: "Faça o movimento devagar e preste atenção na postura." };
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Explique de um jeito muito simples como fazer melhor o exercício: ${exerciseName}. Use a internet (Google Search) para encontrar dicas técnicas atuais e seguras.`,
      config: {
        systemInstruction: "Você é um personal trainer amigável e especialista. Use linguagem simples e direta.",
        tools: [{ googleSearch: {} }],
      }
    });
    
    const text = response.text?.trim() || fallback.text;
    const sources: { uri: string; title: string }[] = [];
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (chunks) {
      chunks.forEach((chunk: any) => {
        if (chunk.web) sources.push({ uri: chunk.web.uri, title: chunk.web.title });
      });
    }
    return { text, sources: sources.length > 0 ? sources : undefined };
  } catch {
    return fallback;
  }
};

/**
 * Analisa uma imagem (print/foto) de treino e extrai os dados estruturados via IA.
 */
export const scanWorkoutFromImage = async (base64Image: string): Promise<any> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [
        {
          inlineData: {
            mimeType: 'image/png',
            data: base64Image.split(',')[1] || base64Image,
          },
        },
        { text: "Analise este print de treino. Extraia os nomes dos exercícios, a quantidade de séries e repetições sugeridas. Retorne estritamente um JSON estruturado." }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            workoutName: { type: Type.STRING },
            exercises: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  setsCount: { type: Type.NUMBER },
                  repsSuggested: { type: Type.NUMBER }
                }
              }
            }
          }
        }
      }
    });
    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Erro ao escanear treino:", error);
    throw error;
  }
};
