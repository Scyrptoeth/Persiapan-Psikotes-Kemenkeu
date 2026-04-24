import { describe, expect, it } from "vitest";
import { CATEGORY_SLUGS } from "@/lib/types";
import { getQuestionPackage } from "@/lib/questions";

describe("question package generator", () => {
  it("creates 10 packages with 40 questions for every category", () => {
    for (const category of CATEGORY_SLUGS) {
      for (let packageNumber = 1; packageNumber <= 10; packageNumber += 1) {
        const questionPackage = getQuestionPackage(category, packageNumber);
        expect(questionPackage.questions).toHaveLength(40);
      }
    }
  });

  it("keeps all correct answers and options inside 0-1000", () => {
    for (const category of CATEGORY_SLUGS) {
      for (let packageNumber = 1; packageNumber <= 10; packageNumber += 1) {
        const questionPackage = getQuestionPackage(category, packageNumber);
        for (const question of questionPackage.questions) {
          expect(question.answer).toBeGreaterThanOrEqual(0);
          expect(question.answer).toBeLessThanOrEqual(1000);
          expect(question.options).toHaveLength(4);
          for (const option of question.options) {
            expect(option.value).toBeGreaterThanOrEqual(0);
            expect(option.value).toBeLessThanOrEqual(1000);
          }
        }
      }
    }
  });

  it("uses integer answers for packages 1-5 and max two decimals for packages 6-10", () => {
    for (const category of CATEGORY_SLUGS) {
      for (let packageNumber = 1; packageNumber <= 10; packageNumber += 1) {
        const questionPackage = getQuestionPackage(category, packageNumber);
        for (const question of questionPackage.questions) {
          const decimalPlaces = `${question.answer}`.split(".")[1]?.length ?? 0;
          if (packageNumber <= 5) {
            expect(Number.isInteger(question.answer)).toBe(true);
          } else {
            expect(decimalPlaces).toBeLessThanOrEqual(2);
          }
        }
      }
    }
  });

  it("balances mix packages across four operations", () => {
    for (let packageNumber = 1; packageNumber <= 10; packageNumber += 1) {
      const questionPackage = getQuestionPackage("mix", packageNumber);
      const counts = questionPackage.questions.reduce<Record<string, number>>((acc, question) => {
        acc[question.operation] = (acc[question.operation] ?? 0) + 1;
        return acc;
      }, {});
      expect(counts.add).toBe(10);
      expect(counts.subtract).toBe(10);
      expect(counts.multiply).toBe(10);
      expect(counts.divide).toBe(10);
    }
  });
});

