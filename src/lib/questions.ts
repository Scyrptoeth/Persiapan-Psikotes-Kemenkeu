import { CATEGORY_LABELS, formatMathNumber, OPERATION_SYMBOLS, roundToTwo } from "@/lib/format";
import type {
  CategorySlug,
  Operation,
  OptionLabel,
  PublicQuestion,
  PublicQuestionPackage,
  Question,
  QuestionOption,
  QuestionPackage,
} from "@/lib/types";

const DURATION_SECONDS = 7 * 60;
const PACKAGE_COUNT = 10;
const QUESTIONS_PER_PACKAGE = 40;
const MIX_OPERATION_COUNT = 10;
const OPTION_LABELS: OptionLabel[] = ["A", "B", "C", "D"];

const CATEGORY_OPERATION: Record<Exclude<CategorySlug, "mix">, Operation> = {
  tambah: "add",
  kurang: "subtract",
  kali: "multiply",
  bagi: "divide",
};

type Rng = () => number;

export function getQuestionPackage(category: CategorySlug, packageNumber: number): QuestionPackage {
  if (!Number.isInteger(packageNumber) || packageNumber < 1 || packageNumber > PACKAGE_COUNT) {
    throw new Error("Package number must be an integer from 1 to 10.");
  }

  const isDecimal = packageNumber > 5;
  const operations = getOperations(category, `${category}-${packageNumber}`);
  const questions = operations.map((operation, index) =>
    createQuestion(category, packageNumber, index + 1, operation, isDecimal),
  );

  return {
    category,
    packageNumber,
    title: `${CATEGORY_LABELS[category]} Paket ${packageNumber}`,
    isDecimal,
    durationSeconds: DURATION_SECONDS,
    questions,
  };
}

export function getPublicQuestionPackage(
  category: CategorySlug,
  packageNumber: number,
): PublicQuestionPackage {
  const questionPackage = getQuestionPackage(category, packageNumber);
  return {
    ...questionPackage,
    questions: questionPackage.questions.map(toPublicQuestion),
  };
}

function toPublicQuestion(question: Question): PublicQuestion {
  return {
    id: question.id,
    category: question.category,
    packageNumber: question.packageNumber,
    number: question.number,
    operation: question.operation,
    expression: question.expression,
    options: question.options,
    isDecimal: question.isDecimal,
  };
}

export function listAllPackages() {
  return (["tambah", "kurang", "kali", "bagi", "mix"] as CategorySlug[]).flatMap((category) =>
    Array.from({ length: PACKAGE_COUNT }, (_, index) => ({
      category,
      packageNumber: index + 1,
      title: `${CATEGORY_LABELS[category]} Paket ${index + 1}`,
      isDecimal: index + 1 > 5,
    })),
  );
}

function getOperations(category: CategorySlug, seed: string): Operation[] {
  if (category !== "mix") {
    return Array.from({ length: QUESTIONS_PER_PACKAGE }, () => CATEGORY_OPERATION[category]);
  }

  const operations: Operation[] = [
    ...Array.from({ length: MIX_OPERATION_COUNT }, () => "add" as const),
    ...Array.from({ length: MIX_OPERATION_COUNT }, () => "subtract" as const),
    ...Array.from({ length: MIX_OPERATION_COUNT }, () => "multiply" as const),
    ...Array.from({ length: MIX_OPERATION_COUNT }, () => "divide" as const),
  ];

  return shuffle(operations, createRng(seed));
}

function createQuestion(
  category: CategorySlug,
  packageNumber: number,
  number: number,
  operation: Operation,
  isDecimal: boolean,
): Question {
  const rng = createRng(`${category}-${packageNumber}-${number}-${operation}`);
  const operands = isDecimal ? createDecimalOperands(operation, rng) : createIntegerOperands(operation, rng);
  const expression = `${formatMathNumber(operands.left)} ${OPERATION_SYMBOLS[operation]} ${formatMathNumber(
    operands.right,
  )} = ...`;
  const options = createOptions(operands.answer, isDecimal, rng);

  return {
    id: `${category}-${packageNumber}-${number}`,
    category,
    packageNumber,
    number,
    operation,
    expression,
    answer: operands.answer,
    options,
    isDecimal,
  };
}

function createIntegerOperands(operation: Operation, rng: Rng) {
  if (operation === "add") {
    const answer = randInt(rng, 10, 1000);
    const left = randInt(rng, 1, answer - 1);
    return { left, right: answer - left, answer };
  }

  if (operation === "subtract") {
    const answer = randInt(rng, 0, 1000);
    const right = randInt(rng, 0, Math.max(1, 1000 - answer));
    return { left: answer + right, right, answer };
  }

  if (operation === "multiply") {
    for (let attempt = 0; attempt < 100; attempt += 1) {
      const left = randInt(rng, 2, 40);
      const right = randInt(rng, 2, 40);
      const answer = left * right;
      if (answer <= 1000) {
        return { left, right, answer };
      }
    }
  }

  const answer = randInt(rng, 2, 200);
  const right = randInt(rng, 2, 25);
  return { left: answer * right, right, answer };
}

function createDecimalOperands(operation: Operation, rng: Rng) {
  if (operation === "add") {
    const answerCents = randInt(rng, 100, 100000);
    const leftCents = randInt(rng, 1, answerCents - 1);
    return {
      left: cents(leftCents),
      right: cents(answerCents - leftCents),
      answer: cents(answerCents),
    };
  }

  if (operation === "subtract") {
    const answerCents = randInt(rng, 0, 100000);
    const rightCents = randInt(rng, 1, 100000 - answerCents + 1);
    return {
      left: cents(answerCents + rightCents),
      right: cents(rightCents),
      answer: cents(answerCents),
    };
  }

  if (operation === "multiply") {
    for (let attempt = 0; attempt < 100; attempt += 1) {
      const leftTenths = randInt(rng, 11, 300);
      const rightTenths = randInt(rng, 11, 300);
      const answer = roundToTwo((leftTenths * rightTenths) / 100);
      if (answer <= 1000) {
        return {
          left: roundToTwo(leftTenths / 10),
          right: roundToTwo(rightTenths / 10),
          answer,
        };
      }
    }
  }

  const right = randInt(rng, 2, 20);
  const maxAnswerCents = Math.max(1, Math.floor((1000 / right) * 100));
  const answer = cents(randInt(rng, 1, maxAnswerCents));
  return {
    left: roundToTwo(answer * right),
    right,
    answer,
  };
}

function createOptions(answer: number, isDecimal: boolean, rng: Rng): QuestionOption[] {
  const values = new Set<string>([keyForValue(answer, isDecimal)]);
  const candidates: number[] = [answer];
  const deltas = isDecimal
    ? [0.1, 0.2, 0.5, 1, 1.5, 2, 5, 10, 25, 50]
    : [1, 2, 3, 5, 8, 10, 12, 15, 20, 25, 50, 100];

  while (candidates.length < 4) {
    const delta = deltas[randInt(rng, 0, deltas.length - 1)];
    const direction = rng() > 0.5 ? 1 : -1;
    const candidate = normalizeOptionValue(answer + delta * direction, isDecimal);
    const key = keyForValue(candidate, isDecimal);

    if (candidate >= 0 && candidate <= 1000 && !values.has(key)) {
      values.add(key);
      candidates.push(candidate);
    }
  }

  return shuffle(candidates, rng).map((value, index) => ({
    label: OPTION_LABELS[index],
    value,
    display: formatMathNumber(value),
  }));
}

function normalizeOptionValue(value: number, isDecimal: boolean) {
  const normalized = isDecimal ? roundToTwo(value) : Math.round(value);
  return Math.min(1000, Math.max(0, normalized));
}

function keyForValue(value: number, isDecimal: boolean) {
  return isDecimal ? roundToTwo(value).toFixed(2) : `${Math.round(value)}`;
}

function cents(value: number) {
  return roundToTwo(value / 100);
}

function createRng(seed: string): Rng {
  let state = xmur3(seed)();
  return () => {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function xmur3(seed: string) {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i += 1) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }

  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return (h ^= h >>> 16) >>> 0;
  };
}

function randInt(rng: Rng, min: number, max: number) {
  return Math.floor(rng() * (max - min + 1)) + min;
}

function shuffle<T>(items: T[], rng: Rng): T[] {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = randInt(rng, 0, index);
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
}
