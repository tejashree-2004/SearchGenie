import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import type { WebSearchResult, WebResultSource, WebImageResult } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const parseGroundingChunks = (response: GenerateContentResponse): WebResultSource[] => {
    const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
    if (!groundingMetadata?.groundingChunks) {
        return [];
    }

    const sources: WebResultSource[] = [];
    const seenUris = new Set<string>();

    for (const chunk of groundingMetadata.groundingChunks) {
        if (chunk.web && chunk.web.uri && !seenUris.has(chunk.web.uri)) {
            sources.push({
                uri: chunk.web.uri,
                title: chunk.web.title || chunk.web.uri,
            });
            seenUris.add(chunk.web.uri);
        }
    }
    return sources;
};

export const geminiService = {
    performWebSearch: async (query: string): Promise<WebSearchResult> => {
        try {
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: `Search for this and provide a concise summary: "${query}"`,
                config: {
                    tools: [{ googleSearch: {} }],
                },
            });
            
            const summary = response.text;
            const sources = parseGroundingChunks(response);

            if (!summary && sources.length === 0) {
                 throw new Error("The model returned an empty response. Please try a different query.");
            }
            
            return { summary: summary || '', sources };
        } catch (error) {
            console.error("Error performing web search:", error);
            throw new Error("Failed to fetch web search results. The API may be unavailable or the query may be inappropriate.");
        }
    },

    performWebImageSearch: async (query: string): Promise<WebImageResult[]> => {
        try {
            const prompt = `
Your task is to act as a web image search engine for the query: '${query}'.
You will be given search results. From these results, find up to 6 direct image URLs.

You MUST follow these rules for your response:
1.  Your entire response must be ONLY a single JSON object. No other text, no explanations, no markdown.
2.  The JSON object must have a single key: "images". The value must be an array of image objects.
3.  EACH image object in the array must contain ALL three of these keys: "imageUrl", "sourceUrl", and "description".
4.  The "imageUrl" value MUST be a direct, hotlinkable URL to an image file (e.g., ends in .jpg, .png, .webp).
5.  The "sourceUrl" value MUST be the URL of the webpage where the image was found. They must not be the same.

Here is an example of a perfect response for the query "aurora borealis":
{
  "images": [
    {
      "imageUrl": "https://i.natgeofe.com/n/861c26b5-1993-4179-8395-654b41b4e207/aurora-borealis-gleam-in-the-sky-over-a-snow-covered-landscape-in-norway_3x2.jpg",
      "sourceUrl": "https://www.nationalgeographic.com/science/article/aurora-borealis-northern-lights",
      "description": "The aurora borealis, or northern lights, over a snow-covered landscape in Norway."
    }
  ]
}
`;

            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: prompt,
                config: {
                   tools: [{ googleSearch: {} }],
                },
            });
            
            const text = response.text;

            if (!text) {
                const finishReason = response.candidates?.[0]?.finishReason;
                if (finishReason === 'SAFETY') {
                    throw new Error("Image search was blocked for safety reasons. Please try a different query.");
                }
                throw new Error("The model returned an empty response. Unable to find images.");
            }

            // Robustly find and extract the JSON object from the response string.
            const startIndex = text.indexOf('{');
            const endIndex = text.lastIndexOf('}');

            if (startIndex === -1 || endIndex === -1 || endIndex < startIndex) {
                throw new Error("Could not find a valid JSON object in the model's response.");
            }

            const jsonString = text.substring(startIndex, endIndex + 1);
            const parsedObject = JSON.parse(jsonString);
            
            if (!parsedObject.images || !Array.isArray(parsedObject.images)) {
                 throw new Error("The model returned data in an unexpected format. Expected an object with an 'images' array.");
            }

            const results: WebImageResult[] = parsedObject.images;

            // Filter out any malformed items to prevent crashes.
            return results.filter(item => item && item.imageUrl && item.sourceUrl && item.description);
        } catch (error) {
            console.error("Error performing web image search:", error);
            if (error instanceof SyntaxError) {
                 throw new Error("Failed to parse image search results. The model returned malformed JSON.");
            }
            if (error instanceof Error) {
                throw error;
            }
            throw new Error("Failed to fetch image search results. The model may have returned an invalid format or no results were found.");
        }
    },

    performImageGeneration: async (prompt: string): Promise<string[]> => {
        try {
            const response = await ai.models.generateImages({
                model: 'imagen-3.0-generate-002',
                prompt: prompt,
                config: {
                    numberOfImages: 4,
                    outputMimeType: 'image/jpeg',
                    aspectRatio: '16:9',
                },
            });

            if (!response.generatedImages || response.generatedImages.length === 0) {
                throw new Error("Image generation failed. This could be due to safety restrictions. Please try a different or more specific prompt.");
            }

            return response.generatedImages.map(img => `data:image/jpeg;base64,${img.image.imageBytes}`);
        } catch (error) {
            console.error("Error performing image generation:", error);
            throw new Error("Failed to generate images. The API may be unavailable or the prompt may be inappropriate.");
        }
    }
};