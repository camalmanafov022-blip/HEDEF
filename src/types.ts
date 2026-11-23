export type Category =
  | 'Sağlamlıq'
  | 'Ruh Sağlamlığı'
  | 'Maliyyə'
  | 'Karyera'
  | 'Münasibətlər'
  | 'Öyrənmə'
  | 'Yaradıcılıq'
  | 'Hobi'
  | 'Fərdi İnkişaf';

export interface Step {
  id: string;
  text: string;
  note?: string;
  dueDate?: string; // YYYY-MM-DD
  dueTime?: string; // HH:mm
  completed: boolean;
}

export interface Goal {
  id: string;
  text: string;
  description?: string;
  category: Category;
  steps: Step[];
  completed: boolean;
  startDate?: string; // YYYY-MM-DD
  targetDate?: string; // YYYY-MM-DD
  targetTime?: string; // HH:mm
  createdAt: number;
}

export interface Routine {
  id: string;
  title: string;
  description?: string;
  category: Category;
  days: number[]; // 0 for Sun, 1 for Mon, etc.
  completedDates: string[]; // ISO date strings
}
