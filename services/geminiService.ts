
import { GoogleGenAI, Chat } from "@google/genai";
import { TrendAnalysis, Product } from "../types";

// Initialize Gemini Client
// Note: In a real app, strict error handling for missing keys is needed.
const getClient = () => {
  if (!process.env.API_KEY) {
    console.warn("API_KEY not found in environment variables. Using mock data.");
    return null;
  }
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const generateSeasonalTrend = async (): Promise<TrendAnalysis> => {
  const client = getClient();
  
  // Default fallback data to use when API is unavailable or limits are reached
  const fallbackTrend: TrendAnalysis = {
    title: "DIGITAL BOTANICALS",
    description: "A fusion of organic shapes and cybernetic aesthetics. Nature reclaimed by the digital void.",
    colorPalette: ["#2E4A3B", "#8FBC8F", "#000000", "#FFFFFF"]
  };
  
  // Fallback for demo purposes if no key is present
  if (!client) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          title: "NEO-NOIR MINIMALISM",
          description: "This season focuses on stark contrasts, heavy textures, and a return to monochromatic silhouettes. Expect oversized shoulders paired with cinched waists.",
          colorPalette: ["#000000", "#1A1A1A", "#F5F5F0", "#D4AF37"]
        });
      }, 1500);
    });
  }

  try {
    const response = await client.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: "Generate a high-fashion, editorial trend forecast for the upcoming season. Return a JSON object with 'title' (short, punchy), 'description' (2 sentences), and 'colorPalette' (array of 4 hex codes). Do not use markdown code blocks.",
    });

    const text = response.text || "{}";
    // Sanitize in case model wraps in ```json ... ```
    const jsonStr = text.replace(/```json|```/g, "").trim();
    return JSON.parse(jsonStr) as TrendAnalysis;
  } catch (error: any) {
    // Gracefully handle 429 (Quota Exceeded) or other API errors
    const isRateLimit = error?.status === 429 || 
                        error?.response?.status === 429 || 
                        error?.message?.includes('429') ||
                        (error?.error && error.error.code === 429);

    if (isRateLimit) {
        console.warn("Gemini API Quota Exceeded. Serving curated fallback trend data.");
    } else {
        console.warn("Gemini API Error (Trends):", error.message || error);
    }
    return fallbackTrend;
  }
};

export const getStyleMatch = async (productName: string): Promise<string> => {
  const client = getClient();
  const fallbackTip = "Style with monochromatic layers for an elevated silhouette.";
  
  if (!client) {
    return new Promise(resolve => setTimeout(() => resolve(`To style the ${productName}, pair it with wide-leg trousers in charcoal and chunky silver jewelry for a brutalist look.`), 1000));
  }

  try {
    const response = await client.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Suggest a styling tip for a fashion product named "${productName}". Keep it editorial, concise, and luxurious. Max 30 words.`,
    });
    return response.text || "Pair with confidence and minimalist accessories.";
  } catch (error: any) {
    const isRateLimit = error?.status === 429 || 
                        error?.response?.status === 429 || 
                        error?.message?.includes('429') ||
                        (error?.error && error.error.code === 429);
                        
    if (isRateLimit) {
        // Silent fallback for style match on rate limit to avoid UI disruption
        console.warn("Gemini API Quota Exceeded (Style Match). Using fallback.");
    } else {
        console.warn("Gemini Style Match Error:", error.message || error);
    }
    return fallbackTip;
  }
};

export const searchProductsByImage = async (base64Image: string, products: Product[]): Promise<string[]> => {
  const client = getClient();
  
  if (!client || products.length === 0) return [];

  // Prepare catalog for the model context
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
      4. If no products closely match, return an empty array for matchIds.
      
      CATALOG:
      ${JSON.stringify(catalog)}
    `;

    // Strip data url prefix if present
    const cleanBase64 = base64Image.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, "");

    const response = await client.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [
        { text: prompt },
        { inlineData: { mimeType: 'image/jpeg', data: cleanBase64 } }
      ],
      config: {
        responseMimeType: 'application/json'
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

  // Prepare catalog context
  const catalogSummary = products.map(p => 
    `- ${p.name} (${p.designer}): $${p.price}. ${p.description}`
  ).join('\n');

  const systemInstruction = `
    You are the Digital Concierge for MyFitStore, an ultra-luxury fashion marketplace.
    Your Persona:
    - Sophisticated, knowledgeable, slightly editorial, and polite.
    - You speak like a high-end boutique assistant in Paris or Milan.
    - Keep responses concise (max 2-3 sentences) unless asked for details.
    
    Your Capabilities:
    - You can recommend products from the Catalog provided below.
    - You provide styling advice.
    - You answer questions about shipping (Global Express is free) and authenticity (Guaranteed).
    
    Catalog Context:
    ${catalogSummary}
    
    If a user asks for a product you don't have, apologize elegantly and suggest a similar category if available.
    Always prioritize the "MyFitStore" brand values: Innovation, Heritage, Curation.
  `;

  return client.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: systemInstruction,
    }
  });
};
