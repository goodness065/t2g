export interface WardrobeItem {
  id: string;
  name: string;
  category: ClothingCategory;
  subcategory: string;
  colors: string[];
  dominantColor: string;
  image: string;
  tags: string[];
  season: Season[];
  occasion: Occasion[];
  style: StyleType[];
  fit: FitType;
  material: string;
  brand?: string;
  dateAdded: Date;
  lastWorn?: Date;
  timesWorn: number;
  isFavorite: boolean;
}

export type ClothingCategory =
  | 'tops'
  | 'bottoms'
  | 'dresses'
  | 'outerwear'
  | 'shoes'
  | 'accessories'
  | 'undergarments';

export type Season = 'spring' | 'summer' | 'fall' | 'winter';

export type Occasion =
  | 'casual'
  | 'work'
  | 'formal'
  | 'party'
  | 'athletic'
  | 'vacation'
  | 'date';

export type StyleType =
  | 'minimalist'
  | 'bohemian'
  | 'classic'
  | 'edgy'
  | 'romantic'
  | 'sporty'
  | 'vintage';

export type FitType = 'tight' | 'fitted' | 'regular' | 'loose' | 'oversized';

export interface Outfit {
  id: string;
  name: string;
  items: string[];
  occasion: Occasion;
  season: Season;
  style: StyleType;
  rating?: number;
  notes?: string;
  createdDate: Date;
  lastWorn?: Date;
  imageUrl?: string;
}

export interface StyleProfile {
  bodyType?: BodyType;
  colorProfile?: ColorProfile;
  preferredStyles: StyleType[];
  sizeInfo: SizeInfo;
  preferences: StylePreferences;
}

export type BodyType =
  | 'hourglass'
  | 'pear'
  | 'apple'
  | 'rectangle'
  | 'inverted-triangle';

export interface ColorProfile {
  season: 'spring' | 'summer' | 'autumn' | 'winter';
  undertone: 'warm' | 'cool' | 'neutral';
  bestColors: string[];
  avoidColors: string[];
}

export interface SizeInfo {
  tops: string;
  bottoms: string;
  shoes: string;
  dresses: string;
}

export interface StylePreferences {
  comfortLevel: number;
  trendiness: number;
  colorfulness: number;
  formality: number;
}

export interface OutfitSuggestion {
  outfit: Outfit;
  confidence: number;
  reasoning: string;
  missingItems?: string[];
  alternatives?: WardrobeItem[];
  bodyTypeNotes?: string;
  colorTheme?: string;
} 