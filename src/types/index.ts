export type GradeLevel = '10' | '11' | '12';

export interface CustomLessonSection {
  id: string;
  title: string;
  type: 'note' | 'method' | 'example' | 'text' | 'formula_list' | 'notice';
  content: string;
  note?: string;
}

export interface LessonType {
  id: string;
  name: string;
  typeCount: number;
  chapterId: string;
  grade: GradeLevel;
  theoryContent: {
    summary: string;
    boxedFormulas: string[];
    extraSections?: CustomLessonSection[];
    diagramType?: 'cubic_curve' | 'quadratic_curve' | 'rational_curve' | 'trig_circle' | 'variation_table' | 'box_plot';
    variationTableData?: {
      x: string[];
      yPrime: string[];
      y: { val: string; arrow?: 'up' | 'down' | 'flat' }[];
    };
  };
  problemTypes: ProblemTypeItem[];
  customQuestions?: PracticeQuestionItem[];
}

export type QuestionFormat = 'multiple_choice' | 'true_false' | 'short_answer' | 'essay';
export type DifficultyLevel = 'Nhận biết' | 'Thông hiểu' | 'Vận dụng' | 'Vận dụng cao';

export interface PracticeQuestionItem {
  id: string;
  typeIndex: number; // 1 to 15
  typeLevelCode: 'NB' | 'TH' | 'VD' | 'VDC';
  typeTitle: string;
  format: QuestionFormat;
  difficulty: DifficultyLevel;
  question: string;
  options?: { key: 'A' | 'B' | 'C' | 'D'; text: string }[];
  tfItems?: { key: 'a' | 'b' | 'c' | 'd'; statement: string; correct: boolean; explanation?: string }[];
  correctAnswer: string;
  explanation: string;
}

export interface ProblemTypeItem {
  id: string;
  title: string;
  description: string;
  sampleQuestion: string;
  sampleOptions?: string[];
  correctAnswer: string;
  explanation: string;
  generateParams?: () => {
    question: string;
    options?: string[];
    correctAnswer: string;
    explanation: string;
  };
}

export interface Chapter {
  id: string;
  title: string;
  grade: GradeLevel;
  lessons: LessonType[];
}

export interface PracticalProblem {
  id: string;
  grade: GradeLevel;
  title: string;
  context: string;
  type: 'multiple_choice' | 'true_false' | 'short_answer' | 'essay';
  difficulty: 'Thông hiểu' | 'Vận dụng' | 'Vận dụng cao';
  curriculumLink: string;
  generate: () => {
    question: string;
    options?: { id: string; text: string }[];
    tfItems?: { id: string; text: string; correct: boolean }[];
    correctAnswer: string;
    solutionSteps: string[];
  };
}

export type QuestionPart = 'part1' | 'part2' | 'part3';

export interface ExamQuestionPart1 {
  id: string;
  part: 'part1';
  questionNumber: number;
  question: string;
  options: { key: 'A' | 'B' | 'C' | 'D'; text: string }[];
  correctAnswer: 'A' | 'B' | 'C' | 'D';
  explanation: string;
  topic: string;
}

export interface ExamQuestionPart2 {
  id: string;
  part: 'part2';
  questionNumber: number;
  stem: string;
  subItems: {
    key: 'a' | 'b' | 'c' | 'd';
    statement: string;
    correct: boolean;
    explanation: string;
  }[];
  topic: string;
}

export interface ExamQuestionPart3 {
  id: string;
  part: 'part3';
  questionNumber: number;
  question: string;
  correctAnswer: string; // e.g. "12", "3.5", "-4"
  acceptedAnswers?: string[];
  explanation: string;
  topic: string;
}

export type ExamQuestion = ExamQuestionPart1 | ExamQuestionPart2 | ExamQuestionPart3;

export interface GeneratedExam {
  id: string;
  title: string;
  schoolName: string;
  grade: GradeLevel;
  examType: 'Giữa học kì I' | 'Cuối học kì I' | 'Giữa học kì II' | 'Cuối học kì II' | 'Ôn tốt nghiệp';
  durationMinutes: number;
  structure: string;
  createdAt: string;
  part1Questions: ExamQuestionPart1[];
  part2Questions: ExamQuestionPart2[];
  part3Questions: ExamQuestionPart3[];
}

export interface ExamSubmission {
  part1Answers: Record<string, string>; // questionId -> 'A' | 'B' | 'C' | 'D'
  part2Answers: Record<string, Record<'a' | 'b' | 'c' | 'd', boolean | null>>; // questionId -> { a: true, ... }
  part3Answers: Record<string, string>; // questionId -> string
}

export interface ExamScoreReport {
  totalScore: number; // Max 10.0
  maxScore: number;
  part1Score: number; // Max 3.0
  part2Score: number; // Max 4.0
  part3Score: number; // Max 3.0
  correctPart1Count: number;
  totalPart1Count: number;
  correctPart2SubCount: number;
  totalPart2SubCount: number;
  correctPart3Count: number;
  totalPart3Count: number;
  feedback: string;
}
