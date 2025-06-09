export interface ReadingSettings {
  fontSize: number;
  lineHeight: number;
  fontFamily: string;
  theme: 'light' | 'dark' | 'sepia';
  showProgress: boolean;
}

export interface BookmarkData {
  position: number;
  timestamp: number;
  note?: string;
  chapterId?: string;
}

export interface Chapter {
  id: string;
  title: string;
  subtitle?: string;
  author: string;
  content: string;
  estimatedReadTime: number;
  category: string;
  tags: string[];
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
}

export interface Article {
  id: string;
  title: string;
  author: string;
  content: string;
  estimatedReadTime: number;
}