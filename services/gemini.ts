
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getAiSupportResponse = async (userMessage: string, context: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: userMessage,
      config: {
        systemInstruction: `You are the WhiteTriangle P2P Support Assistant. 
        The "White Triangle" logic is our secure 3-way escrow system:
        1. Buyer pays via PayPal to our Escrow.
        2. Seller delivers the electronic asset.
        3. Escrow releases PayPal funds to Seller once Buyer confirms receipt.
        Current Context: ${context}.
        Be professional, concise, and helpful. Use Google Search to provide up-to-date market rates or security advice if relevant.
        You have a high thinking budget for complex reasoning; use it to ensure user safety and precise guidance.`,
        tools: [{ googleSearch: {} }],
        thinkingConfig: { thinkingBudget: 32768 },
        temperature: 1, // Recommended for thinking models to allow exploration
      },
    });

    const text = response.text || "I'm sorry, I couldn't process that.";
    
    // Extract grounding URLs from metadata if present
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    const links = groundingChunks
      ?.map(chunk => chunk.web)
      .filter((web): web is { uri: string; title: string } => !!web && !!web.uri) || [];

    return { text, links };
  } catch (error) {
    console.error("Gemini API Error:", error);
    return { 
      text: "I'm having trouble connecting to my brain right now. Please try again or contact a human admin.", 
      links: [] 
    };
  }
};
