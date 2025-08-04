/* eslint-disable @typescript-eslint/no-explicit-any */
import { GoogleGenerativeAI } from '@google/generative-ai';
import {
  WardrobeItem,
  StyleProfile,
  OutfitSuggestion,
  BodyType,
  ColorProfile,
} from '../types/wardrobe';

class GeminiService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor() {
    const apiKey = 'AIzaSyBE8d2iMY1ZtV5Hs201Njy55K6xobgBd6E';
    if (!apiKey) {
      throw new Error('Gemini API key not found in environment variables');
    }

    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  }

  async analyzeClothingItem(imageBase64: string): Promise<Partial<WardrobeItem>> {
    try {
      const prompt = `
        Analyze this clothing item and provide detailed information in JSON format:
        {
          "name": "descriptive name",
          "category": "tops|bottoms|dresses|outerwear|shoes|accessories|undergarments",
          "subcategory": "specific type (e.g., t-shirt, jeans, sneakers)",
          "colors": ["array of colors present"],
          "dominantColor": "main color",
          "tags": ["descriptive tags"],
          "season": ["spring|summer|fall|winter"],
          "occasion": ["casual|work|formal|party|athletic|vacation|date"],
          "style": ["minimalist|bohemian|classic|edgy|romantic|sporty|vintage"],
          "fit": "tight|fitted|regular|loose|oversized",
          "material": "fabric type if identifiable"
        }
        Be specific and accurate. If unsure about any field, provide best guess.
      `;

      const imagePart = {
        inlineData: {
          data: imageBase64.split(',')[1],
          mimeType: 'image/jpeg',
        },
      };

      const result = await this.model.generateContent([prompt, imagePart]);
      const response = await result.response;
      const text = response.text();

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      throw new Error('Invalid response format from Gemini');
    } catch (error) {
      console.error('Error analyzing clothing item:', error);
      throw error;
    }
  }

  async analyzeBodyType(imageBase64: string): Promise<BodyType> {
    try {
      const prompt = `
        Analyze this full-body photo and determine the body type. 
        Respond with only one of these exact words: hourglass, pear, apple, rectangle, inverted-triangle
      `;

      const imagePart = {
        inlineData: {
          data: imageBase64.split(',')[1],
          mimeType: 'image/jpeg',
        },
      };

      const result = await this.model.generateContent([prompt, imagePart]);
      const response = await result.response;
      const bodyType = response.text().trim().toLowerCase();

      return bodyType as BodyType;
    } catch (error) {
      console.error('Error analyzing body type:', error);
      throw error;
    }
  }

  async analyzeColorProfile(imageBase64: string): Promise<ColorProfile> {
    try {
      const prompt = `
        Analyze this person's skin tone and provide color analysis in JSON format:
        {
          "season": "spring|summer|autumn|winter",
          "undertone": "warm|cool|neutral",
          "bestColors": ["array of recommended colors"],
          "avoidColors": ["array of colors to avoid"]
        }
        Use seasonal color analysis principles.
      `;

      const imagePart = {
        inlineData: {
          data: imageBase64.split(',')[1],
          mimeType: 'image/jpeg',
        },
      };

      const result = await this.model.generateContent([prompt, imagePart]);
      const response = await result.response;
      const text = response.text();

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      throw new Error('Invalid color analysis response');
    } catch (error) {
      console.error('Error analyzing color profile:', error);
      throw error;
    }
  }

  async generateOutfitSuggestions(
    wardrobeItems: WardrobeItem[],
    occasion: string,
    weather?: string,
    styleProfile?: StyleProfile
  ): Promise<OutfitSuggestion[]> {
    try {
      const prompt = `
        Create 3 outfit combinations from these wardrobe items for ${occasion}${weather ? ` in ${weather} weather` : ''}.
        Wardrobe items: ${JSON.stringify(
          wardrobeItems.map((item) => ({
            id: item.id,
            name: item.name,
            category: item.category,
            colors: item.colors,
            style: item.style,
            occasion: item.occasion,
          }))
        )}
        ${styleProfile ? `Style profile: ${JSON.stringify(styleProfile)}` : ''}
        Respond in JSON format:
        {
          "outfits": [
            {
              "itemIds": ["array of item IDs"],
              "confidence": 0.8,
              "reasoning": "why this combination works",
              "missingItems": ["items that would improve the outfit"]
            }
          ]
        }
        Ensure color coordination and appropriate style matching.
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const data = JSON.parse(jsonMatch[0]);
        return data.outfits.map((outfit: any, index: number) => ({
          outfit: {
            id: `generated-${Date.now()}-${index}`,
            name: `${occasion} Outfit ${index + 1}`,
            items: outfit.itemIds,
            occasion: occasion as any,
            season: 'spring' as any,
            style: 'classic' as any,
            createdDate: new Date(),
          },
          confidence: outfit.confidence,
          reasoning: outfit.reasoning,
          missingItems: outfit.missingItems,
        }));
      }

      throw new Error('Invalid outfit suggestion response');
    } catch (error) {
      console.error('Error generating outfit suggestions:', error);
      throw error;
    }
  }

  async findSimilarItems(item: WardrobeItem): Promise<string[]> {
    try {
      const prompt = `
        Find similar clothing items online for: ${item.name}
        Category: ${item.category}
        Colors: ${item.colors.join(', ')}
        Style: ${item.style.join(', ')}
        Provide search terms that would help find similar items on shopping websites.
        Respond with an array of search terms in JSON format:
        ["search term 1", "search term 2", "search term 3"]
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      throw new Error('Invalid similar items response');
    } catch (error) {
      console.error('Error finding similar items:', error);
      throw error;
    }
  }
}

export const geminiService = new GeminiService(); 