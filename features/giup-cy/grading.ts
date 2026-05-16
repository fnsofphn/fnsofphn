import type { GiupCyExamQuestionRow, Json } from "@/types/database";

export type GradedDetail = {
  questionId: string;
  questionNumber: number;
  answer: Json;
  correctAnswer: Json;
  isCorrect: boolean | null;
  points: number;
  earnedPoints: number;
};

function normalizeText(value: unknown) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function gradeSingleAnswer(answer: Json, correctAnswer: Json) {
  if (correctAnswer === null || correctAnswer === undefined || correctAnswer === "") return null;
  return normalizeText(answer) === normalizeText(correctAnswer);
}

function gradeTrueFalse(answer: Json, correctAnswer: Json) {
  if (!correctAnswer || typeof correctAnswer !== "object" || Array.isArray(correctAnswer)) return null;
  if (!answer || typeof answer !== "object" || Array.isArray(answer)) return false;

  return Object.entries(correctAnswer).every(([key, value]) => {
    const answerValue = (answer as Record<string, unknown>)[key];
    return Boolean(answerValue) === Boolean(value);
  });
}

export function gradeAttempt(questions: GiupCyExamQuestionRow[], answers: Record<string, Json>) {
  const details: GradedDetail[] = [];
  let score = 0;
  let maxScore = 0;
  let correctCount = 0;
  let gradedCount = 0;

  for (const question of questions) {
    const answer = answers[question.id] ?? null;
    let isCorrect: boolean | null = null;

    if (question.question_type === "true_false") {
      isCorrect = gradeTrueFalse(answer, question.correct_answer);
    } else {
      isCorrect = gradeSingleAnswer(answer, question.correct_answer);
    }

    const points = Number(question.points ?? 0);
    const earnedPoints = isCorrect ? points : 0;

    if (isCorrect !== null) {
      gradedCount += 1;
      maxScore += points;
      score += earnedPoints;
      if (isCorrect) correctCount += 1;
    }

    details.push({
      questionId: question.id,
      questionNumber: question.question_number,
      answer,
      correctAnswer: question.correct_answer,
      isCorrect,
      points,
      earnedPoints
    });
  }

  return {
    details,
    score,
    maxScore,
    correctCount,
    gradedCount,
    totalCount: questions.length
  };
}
