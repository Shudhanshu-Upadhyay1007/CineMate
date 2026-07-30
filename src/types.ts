export interface MovieCardData {
  title: string;
  year?: string;
  director?: string;
  genre?: string;
  imdbRating?: string;
  taglineOrVibe?: string;
}

export interface MemoryUpdates {
  moviesMentioned?: string[];
  userPreferences?: string[];
  hotTakes?: string[];
}

export interface MemoryBank {
  moviesMentioned: string[];
  userPreferences: string[];
  hotTakes: string[];
  lastToneDetected: string;
}

export interface ChatMessageData {
  id: string;
  sender: 'user' | 'cinemood';
  text: string;
  timestamp: string;
  detectedTone?: string;
  movieCard?: MovieCardData | null;
}

export interface StarterSpark {
  id: string;
  label: string;
  prompt: string;
  vibe: string;
  iconName: string;
}
