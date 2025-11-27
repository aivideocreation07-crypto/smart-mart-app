
import { GoogleGenAI, Type } from "@google/genai";
import { Product } from "../types";
import { PRODUCT_CATEGORIES } from "../constants";

const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("API Key not found in environment");
    throw new Error("API Key missing");
  }
  return new GoogleGenAI({ apiKey });
};

/**
 * Analyzes a product image to extract details automatically.
 */
export const analyzeProductImage = async (base64Image: string): Promise<Partial<Product> | null> => {
  try {
    const ai = getAiClient();
    const categoriesList = PRODUCT_CATEGORIES.join(", ");
    const prompt = `
      Analyze this product image for a local shop listing. 
      Return a JSON object with the following fields:
      - name: English name of the product.
      - nameBn: Bengali name of the product (use Bengali script).
      - category: One of [${categoriesList}]. Select the most appropriate one.
      - description: A short, appealing description in English (max 15 words).
      - estimatedPrice: A number representing estimated price in BDT.
      - tags: An array of 3-5 keywords for marketing (e.g. ['fresh', 'organic', 'offer']).
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          { inlineData: { mimeType: "image/jpeg", data: base64Image } },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            nameBn: { type: Type.STRING },
            category: { type: Type.STRING },
            description: { type: Type.STRING },
            estimatedPrice: { type: Type.NUMBER },
            tags: { type: Type.ARRAY, items: { type: Type.STRING } }
          }
        }
      }
    });

    if (response.text) {
      const data = JSON.parse(response.text);
      return {
        name: data.name,
        nameBn: data.nameBn,
        category: data.category,
        description: data.description,
        price: data.estimatedPrice,
        tags: data.tags
      };
    }
    return null;
  } catch (error) {
    console.error("Gemini Vision Error:", error);
    return null;
  }
};

/**
 * Generates marketing copy for a product.
 */
export const generateMarketingCopy = async (product: Product, type: 'facebook' | 'poster'): Promise<string> => {
  try {
    const ai = getAiClient();
    const prompt = `
      Write a ${type === 'facebook' ? 'Facebook post' : 'short poster tagline'} in Bengali 
      for a local shop selling: ${product.name} (${product.nameBn}).
      Price: ${product.price} BDT.
      Keep it exciting, friendly, and use emojis.
      Return ONLY the text.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    return response.text || "Could not generate ad.";
  } catch (error) {
    console.error("Gemini Text Error:", error);
    return "Error generating content. Please try again.";
  }
};

/**
 * Analyzes a marketing poster image to extract details.
 */
export const analyzePoster = async (base64Image: string): Promise<{summaryBn: string, offer?: string} | null> => {
  try {
    const ai = getAiClient();
    const prompt = `
      Analyze this shop poster/flyer.
      Extract the main offer (e.g. "10% Off", "Buy 1 Get 1") if present.
      Write a very short, 1-sentence summary in Bengali encouraging a customer to visit.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          { inlineData: { mimeType: "image/jpeg", data: base64Image } },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summaryBn: { type: Type.STRING },
            offer: { type: Type.STRING },
          }
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text);
    }
    return null;
  } catch (e) {
    console.error("Poster analysis error", e);
    return null;
  }
};

/**
 * Generates a helpful voice guidance string in Bengali based on the current step.
 */
export const getVoiceGuidance = async (context: string): Promise<string> => {
  try {
    const ai = getAiClient();
    const prompt = `
      You are a helpful assistant for a rural Bangladeshi shopkeeper using a mobile app.
      Translate the following guidance into natural, spoken Bengali (Bangla). 
      Keep it short (max 1 sentence).
      Context: ${context}
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    return response.text || "";
  } catch (error) {
    console.error("Gemini Voice Guidance Error:", error);
    return "";
  }
};
