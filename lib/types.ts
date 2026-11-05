export type Role = "student" | "admin";

export type SessionUser = {
  id: string;
  email: string;
  role: Role;
};

export type Subject = {
  id: string;
  slug: string;
  name: string;
  description: string;
  position: number;
};

export type Test = {
  id: string;
  subjectId: string;
  slug: string;
  title: string;
  description: string;
  passage: string | null;
  position: number;
  published: boolean;
};

export type Question = {
  id: string;
  testId: string;
  prompt: string;
  choices: string[];
  correctIndex: number;
  explanation: string;
  position: number;
};

export type PublicQuestion = {
  id: string;
  prompt: string;
  choices: string[];
};

export type PublicTest = {
  slug: string;
  title: string;
  description: string;
  passage: string | null;
  subjectSlug: string;
  subjectName: string;
  questions: PublicQuestion[];
};

export type ReviewItem = {
  id: string;
  prompt: string;
  choices: string[];
  selectedIndex: number | null;
  correctIndex: number;
  explanation: string;
};

export type GradeResult = {
  correct: number;
  total: number;
  review: ReviewItem[];
};

export type EditorQuestion = {
  prompt: string;
  choices: string[];
  correctIndex: number;
  explanation: string;
};

export type EditorTest = {
  id: string;
  subjectId: string;
  title: string;
  slug: string;
  description: string;
  passage: string;
  published: boolean;
  questions: EditorQuestion[];
};

export type SaveTestInput = {
  id?: string;
  subjectId: string;
  title: string;
  slug: string;
  description: string;
  passage: string;
  published: boolean;
  questions: EditorQuestion[];
};

export type CatalogGroup = {
  subject: Subject;
  tests: Test[];
};

export type Store = {
  subjects: Subject[];
  tests: Test[];
  questions: Question[];
  saved: Record<string, string[]>;
};
