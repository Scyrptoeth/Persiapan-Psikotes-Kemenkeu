import { describe, expect, it } from "vitest";
import { getQuestionPackage } from "@/lib/questions";
import { scoreAttempt } from "@/lib/scoring";

describe("scoreAttempt", () => {
  it("scores correct, wrong, and blank answers with +1/0/0", () => {
    const questionPackage = getQuestionPackage("tambah", 1);
    const [first, second, third] = questionPackage.questions;
    const correctFirst = first.options.find((option) => option.value === first.answer);
    const wrongSecond = second.options.find((option) => option.value !== second.answer);

    const result = scoreAttempt("tambah", 1, {
      [first.id]: correctFirst?.label,
      [second.id]: wrongSecond?.label,
      [third.id]: null,
    });

    expect(result.score).toBe(1);
    expect(result.correctCount).toBe(1);
    expect(result.wrongCount).toBe(1);
    expect(result.blankCount).toBe(38);
  });
});

