import { getQuestionPackage } from "@/lib/questions";
import type { CategorySlug, OptionLabel } from "@/lib/types";

export type SubmittedAnswers = Record<string, OptionLabel | null | undefined>;

export type ScoreResult = {
  score: number;
  totalQuestions: number;
  correctCount: number;
  wrongCount: number;
  blankCount: number;
  answerReview: Array<{
    questionId: string;
    selectedLabel: OptionLabel | null;
    selectedValue: number | null;
    correctValue: number;
    isCorrect: boolean;
  }>;
};

export function scoreAttempt(
  category: CategorySlug,
  packageNumber: number,
  submittedAnswers: SubmittedAnswers,
): ScoreResult {
  const questionPackage = getQuestionPackage(category, packageNumber);
  let correctCount = 0;
  let wrongCount = 0;
  let blankCount = 0;

  const answerReview = questionPackage.questions.map((question) => {
    const selectedLabel = submittedAnswers[question.id] ?? null;
    const selectedOption = selectedLabel
      ? question.options.find((option) => option.label === selectedLabel)
      : undefined;
    const selectedValue = selectedOption?.value ?? null;
    const isCorrect = selectedValue === question.answer;

    if (!selectedLabel) {
      blankCount += 1;
    } else if (isCorrect) {
      correctCount += 1;
    } else {
      wrongCount += 1;
    }

    return {
      questionId: question.id,
      selectedLabel,
      selectedValue,
      correctValue: question.answer,
      isCorrect,
    };
  });

  return {
    score: correctCount,
    totalQuestions: questionPackage.questions.length,
    correctCount,
    wrongCount,
    blankCount,
    answerReview,
  };
}

