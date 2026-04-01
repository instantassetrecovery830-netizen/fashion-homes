
import { GoogleGenAI, Chat, Type } from "@google/genai";
import { TrendAnalysis, Product } from "../types";

// Initialize Gemini Client
const getClient = () => {
  if (!process.env.API_KEY) {
    // In production without key, log warning but don't crash
    console.warn("API_KEY not found. Features may be limited.");
    return null;
  }
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const generateSeasonalTrend = async (): Promise<TrendAnalysis> => {
  const client = getClient();
  
  const fallbackTrend: TrendAnalysis = {
    title: "DIGITAL BOTANICALS",
    description: "A fusion of organic shapes and cybernetic aesthetics. Nature reclaimed by the digital void.",
    colorPalette: ["#2E4A3B", "#8FBC8F", "#000000", "#FFFFFF"]
  };
  
  if (!client) {
    // Instant fallback for better UX if key is missing
    return fallbackTrend;
  }

  try {
    const response = await client.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: "Generate a high-fashion, editorial trend forecast for the upcoming season.",
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: "Short, punchy trend title" },
            description: { type: Type.STRING, description: "2 sentences explaining the trend" },
            colorPalette: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "Array of 4 hex codes"
            }
          },
          required: ["title", "description", "colorPalette"]
        }
      }
    });

    const text = response.text || "{}";
    return JSON.parse(text) as TrendAnalysis;
  } catch (error: any) {
    console.warn("Gemini API Error (Trends):", error.message || error);
    return fallbackTrend;
  }
};

export const getStyleMatch = async (productName: string): Promise<string> => {
  const client = getClient();
  const fallbackTip = "Style with monochromatic layers for an elevated silhouette.";
  
  if (!client) {
    // Instant fallback
    return `To style the ${productName}, pair it with wide-leg trousers in charcoal and chunky silver jewelry for a brutalist look.`;
  }

  try {
    const response = await client.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Suggest a styling tip for a fashion product named "${productName}". Keep it editorial, concise, and luxurious. Max 30 words.`,
    });
    return response.text || fallbackTip;
  } catch (error: any) {
    console.warn("Gemini Style Match Error:", error.message || error);
    return fallbackTip;
  }
};

export const searchProductsByImage = async (base64Image: string, products: Product[]): Promise<string[]> => {
  const client = getClient();
  if (!client || products.length === 0) return [];

  const catalog = products.map(p => ({
    id: p.id,
    name: p.name,
    category: p.category,
    description: p.description
  }));

  try {
    const prompt = `
      You are an expert fashion stylist AI with a visual search engine task.
      1. Analyze the clothing items in the provided image.
      2. Search through the provided CATALOG JSON to find items that visually match the style, color, category, or vibe of the item in the image.
      3. Return a JSON object with a key "matchIds" containing an array of the IDs of the top matching products (max 5).
      
      CATALOG:
      ${JSON.stringify(catalog)}
    `;

    const cleanBase64 = base64Image.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, "");

    const response = await client.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [
        { text: prompt },
        { inlineData: { mimeType: 'image/jpeg', data: cleanBase64 } }
      ],
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            matchIds: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "IDs of the top matching products"
            }
          },
          required: ["matchIds"]
        }
      }
    });

    const result = JSON.parse(response.text || '{}');
    return result.matchIds || [];
  } catch (error) {
    console.error("Visual Search Error:", error);
    return [];
  }
};

export const createConciergeChat = (products: Product[]): Chat | null => {
  const client = getClient();
  if (!client) return null;

  const catalogSummary = products.map(p => 
    `- ${p.name} (${p.designer}): $${p.price}. ${p.description}`
  ).join('\n');

  const systemInstruction = `
    You are the Digital Concierge for MyFitStore, an ultra-luxury fashion marketplace.
    Your Persona:
    - Sophisticated, knowledgeable, slightly editorial, and polite.
    - You speak like a high-end boutique assistant in Paris or Milan.
    - Keep responses concise (max 2-3 sentences) unless asked for details.
    
    Catalog Context:
    ${catalogSummary}
    
    If a user asks for a product you don't have, apologize elegantly and suggest a similar category if available.
  `;

  return client.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: systemInstruction,
    }
  });
};
