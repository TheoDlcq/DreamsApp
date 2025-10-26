// Définition du type pour un rêve
export interface DreamData {
  title: string;
  dreamText: string;
  date: string;
  tags: string[];
  characters: string[];
  emotionBefore: string;
  emotionAfter: string;
  location: string;
}