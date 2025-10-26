// Définition du type pour un rêve
export interface DreamData {
  title: string;
  dreamText: string;
  date: string;
  tags: string[];
  characters: string[];
  emotionBefore: string;
  emotionAfter: string;
  // intensities for each emotion field (1..10)
  emotionBeforeIntensity: number;
  emotionAfterIntensity: number;
  location: string;
  // Notes 1..10
  clarity: number;
  sleepQuality: number;
  // free-form meaning and tone
  meaning: string;
  tone: 'positive' | 'negative' | 'neutral' | string;
}