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
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
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
        Create 3 outfit perfect combinations from these wardrobe items for ${occasion}${weather ? ` in ${weather} weather` : ''}.
        Wardrobe items: ${JSON.stringify(
          wardrobeItems.map((item) => ({
            id: item.id,
            name: item.name,
            category: item.category,
            colors: item.colors,
            style: item.style,
            occasion: item.occasion,
            subcategory: item.subcategory,
            fit: item.fit,
            material: item.material,
            dominantColor: item.dominantColor,
            tags: item.tags,
            season: item.season,
          }))
        )}
        ${styleProfile ? `Style profile: ${JSON.stringify(styleProfile)}` : ''}.

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
        Ensure color coordination and appropriate style matching. Be conscious of the weather and the occasion. also be conscious of the category and subcategory of the items so you can create a perfect combination. For example do not combine a category of bottoms and a category of dresses. it can not work because trouser and dresses can not be combined.
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

  async generateBodyTypeOutfits(
    wardrobeItems: WardrobeItem[],
    bodyType: string,
    styleProfile?: StyleProfile
  ): Promise<OutfitSuggestion[]> {
    try {
      const bodyTypeGuidelines = {
        pear: "Focus on balancing broader hips with the upper body. Emphasize the waist, add volume to shoulders, and choose A-line or straight-leg bottoms.",
        apple: "Create a defined waistline and draw attention away from the midsection. Choose empire waists, V-necks, and avoid tight-fitting tops around the waist.",
        hourglass: "Emphasize the natural waistline and maintain the balanced proportions. Choose fitted styles that follow your curves without being too tight.",
        rectangle: "Create curves and definition by adding volume and shape. Use belts, layering, and fitted styles to create the illusion of a waist.",
        inverted_triangle: "Balance broad shoulders with fuller hips. Choose wider leg pants, A-line skirts, and avoid shoulder pads or details that add bulk to shoulders."
      };
  
      const guidelines = bodyTypeGuidelines[bodyType.toLowerCase() as keyof typeof bodyTypeGuidelines] || 
        "Focus on creating a balanced and proportioned silhouette that makes you feel confident.";
  
      const prompt = `
        Create maximum of 4 outfits and minimum of 2 outfits that are specifically designed to flatter a ${bodyType} body type from these wardrobe items.
        
        BODY TYPE GUIDELINES FOR ${bodyType.toUpperCase()}:
        ${guidelines}
        
        STYLING PRINCIPLES:
        - Focus on creating balance and proportion
        - Highlight the person's best features
        - Use fit, silhouette, and styling to enhance their natural shape
        - Consider how different cuts, fits, and proportions work with this body type
        - Pay attention to where items hit on the body (waist, hips, etc.)
        
        Wardrobe items: ${JSON.stringify(
          wardrobeItems.map((item) => ({
            id: item.id,
            name: item.name,
            category: item.category,
            subcategory: item.subcategory,
            colors: item.colors,
            style: item.style,
            fit: item.fit,
            material: item.material,
            occasion: item.occasion,
          }))
        )}
        
        ${styleProfile ? `Additional style profile: ${JSON.stringify(styleProfile)}` : ''}
        
        Respond in JSON format:
        {
          "outfits": [
            {
              "itemIds": ["array of item IDs"],
              "confidence": 0.85,
              "reasoning": "Detailed explanation of WHY this outfit flatters a ${bodyType} body type and how it follows the styling principles",
              "bodyTypeNotes": "Specific notes about how this outfit works for ${bodyType} body type",
              "missingItems": ["items that would enhance this body-type specific look"]
            }
          ]
        }
        
        Focus specifically on how each outfit choice enhances and flatters the ${bodyType} body type.
        Provide detailed reasoning about fit, proportions, and how the styling principles are applied.
      `;
  
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
  
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const data = JSON.parse(jsonMatch[0]);
        return data.outfits.map((outfit: any, index: number) => ({
          outfit: {
            id: `bodytype-${bodyType}-${Date.now()}-${index}`,
            name: `${bodyType} Body Type Outfit ${index + 1}`,
            items: outfit.itemIds,
            occasion: 'general' as any,
            season: 'spring' as any,
            style: 'flattering' as any,
            createdDate: new Date(),
          },
          confidence: outfit.confidence,
          reasoning: outfit.reasoning,
          bodyTypeNotes: outfit.bodyTypeNotes,
          missingItems: outfit.missingItems || [],
        }));
      }
  
      throw new Error('Invalid body type outfit response');
    } catch (error) {
      console.error('Error generating body type outfits:', error);
      throw error;
    }
  }

  async generateWeeklyOutfits(
    wardrobeItems: WardrobeItem[],
    workStyle: string,
    weather?: string,
    styleProfile?: StyleProfile
  ): Promise<{ [day: string]: OutfitSuggestion }> {
    try {
      const weekdays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
      
      const prompt = `
        Create 5 complete work outfits for Monday through Friday from these wardrobe items.
        Work environment: ${workStyle}
        ${weather ? `Weather: ${weather}` : ''}
        
        IMPORTANT REQUIREMENTS:
        1. Each outfit should be appropriate for ${workStyle} work environment
        2. Minimize item repetition across the week (ideally no item used more than twice)
        3. Ensure variety in colors and styles throughout the week
        4. Consider laundry cycles - don't use the same item on consecutive days
        5. Create professional, cohesive looks that follow color coordination principles
        
        Wardrobe items: ${JSON.stringify(
          wardrobeItems.map((item) => ({
            id: item.id,
            name: item.name,
            category: item.category,
            subcategory: item.subcategory,
            colors: item.colors,
            dominantColor: item.dominantColor,
            style: item.style,
            occasion: item.occasion,
            fit: item.fit,
            material: item.material,
          }))
        )}
        
        ${styleProfile ? `Style profile: ${JSON.stringify(styleProfile)}` : ''}
        
        Respond in JSON format:
        {
          "weeklyPlan": {
            "monday": {
              "itemIds": ["array of item IDs"],
              "confidence": 0.8,
              "reasoning": "why this combination works for Monday",
              "missingItems": ["items that would improve the outfit"],
              "colorTheme": "description of the color scheme"
            },
            "tuesday": {
              "itemIds": ["array of item IDs"],
              "confidence": 0.8,
              "reasoning": "why this combination works for Tuesday",
              "missingItems": ["items that would improve the outfit"],
              "colorTheme": "description of the color scheme"
            },
            "wednesday": {
              "itemIds": ["array of item IDs"],
              "confidence": 0.8,
              "reasoning": "why this combination works for Wednesday",
              "missingItems": ["items that would improve the outfit"],
              "colorTheme": "description of the color scheme"
            },
            "thursday": {
              "itemIds": ["array of item IDs"],
              "confidence": 0.8,
              "reasoning": "why this combination works for Thursday",
              "missingItems": ["items that would improve the outfit"],
              "colorTheme": "description of the color scheme"
            },
            "friday": {
              "itemIds": ["array of item IDs"],
              "confidence": 0.8,
              "reasoning": "why this combination works for Friday",
              "missingItems": ["items that would improve the outfit"],
              "colorTheme": "description of the color scheme"
            }
          },
          "weekSummary": {
            "varietyScore": 0.9,
            "repetitionAnalysis": "which items are repeated and why",
            "overallTheme": "description of the week's style theme"
          }
        }
        
        Ensure each outfit is complete and work-appropriate, with good color coordination and style consistency. Be conscious of the weather and the ${workStyle} work environment. also be conscious of the category and subcategory of the items so you can create a perfect combination. For example do not combine a category of bottoms and a category of dresses. it can not work because trouser and dresses can not be combined.
      `;
  
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
  
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const data = JSON.parse(jsonMatch[0]);
        const weeklyOutfits: { [day: string]: OutfitSuggestion } = {};
  
        weekdays.forEach((day) => {
          const dayOutfit = data.weeklyPlan[day];
          if (dayOutfit) {
            weeklyOutfits[day] = {
              outfit: {
                id: `weekly-${day}-${Date.now()}`,
                name: `${day.charAt(0).toUpperCase() + day.slice(1)} Work Outfit`,
                items: dayOutfit.itemIds,
                occasion: workStyle as any,
                season: 'spring' as any,
                style: workStyle as any,
                createdDate: new Date(),
              },
              confidence: dayOutfit.confidence,
              reasoning: dayOutfit.reasoning,
              missingItems: dayOutfit.missingItems || [],
              colorTheme: dayOutfit.colorTheme,
            };
          }
        });
  
        return weeklyOutfits;
      }
  
      throw new Error('Invalid weekly outfit response');
    } catch (error) {
      console.error('Error generating weekly outfits:', error);
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