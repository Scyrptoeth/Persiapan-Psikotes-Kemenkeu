export const CATEGORY_SLUGS = ["tambah", "kurang", "kali", "bagi", "mix"] as const;

export type CategorySlug = (typeof CATEGORY_SLUGS)[number];

export type Operation = "add" | "subtract" | "multiply" | "divide";

export type OptionLabel = "A" | "B" | "C" | "D";

export type QuestionOption = {
  label: OptionLabel;
  value: number;
  display: string;
};

export type Question = {
  id: string;
  category: CategorySlug;
  packageNumber: number;
  number: number;
  operation: Operation;
  expression: string;
  answer: number;
  options: QuestionOption[];
  isDecimal: boolean;
};

export type PublicQuestion = Omit<Question, "answer">;

export type QuestionPackage = {
  category: CategorySlug;
  packageNumber: number;
  title: string;
  isDecimal: boolean;
  durationSeconds: number;
  questions: Question[];
};

export type PublicQuestionPackage = Omit<QuestionPackage, "questions"> & {
  questions: PublicQuestion[];
};

export type ProfileRole = "user" | "superadmin";

export type Profile = {
  id: string;
  phone: string;
  display_name: string;
  role: ProfileRole;
  is_active: boolean;
  current_session_id: string | null;
  created_at: string;
  updated_at: string;
};

export type AttemptSummary = {
  id: string;
  user_id: string;
  category: CategorySlug;
  package_number: number;
  score: number;
  total_questions: number;
  correct_count: number;
  wrong_count: number;
  blank_count: number;
  elapsed_seconds: number;
  submitted_at: string;
};

