
export enum Difficulty {
  EASY = 'سهل',
  MEDIUM = 'متوسط',
  HARD = 'صعب',
  MIXED = 'مختلط'
}

export enum Category {
  RELIGIOUS = 'دينية',
  QURAN = 'قرآن',
  SEERAH = 'سيرة نبوية',
  SPORTS = 'رياضية',
  PUZZLES = 'ألغاز',
  GENERAL = 'ثقافة عامة'
}

export enum GameMode {
  ONE_VS_ONE = '1 ضد 1',
  TWO_VS_TWO = '2 ضد 2',
  GROUPS = 'مجموعات'
}

export interface Question {
  id: string;
  category: Category;
  level: Difficulty;
  text: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
  image?: string;
}

export interface HelperState {
  deleteTwo: number;
  addTime: number;
  doublePoints: number;
  skip: number;
}

export interface Player {
  id: string;
  name: string;
  score: number;
  color: string;
  avatar: string;
  helpers: HelperState;
}

export interface Lesson {
  id: string;
  title: string;
  subtitle: string;
  content: string;
  points: string[];
  takeaways: string[];
  category: 'SEERAH' | 'PRAYER' | 'ETHICS' | 'COMPANIONS' | 'FAMILY';
  icon: string;
  color: string;
}

export type Screen = 'HOME' | 'MODE_SELECT' | 'CONFIG' | 'SETUP' | 'WHEEL' | 'PLAY' | 'LEARN' | 'LEADERBOARD' | 'RULES' | 'ABOUT' | 'ADMIN';