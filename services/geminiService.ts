import { GoogleGenAI } from "@google/genai";
import { TrendAnalysis } from "../types";

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