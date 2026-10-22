import { PracticeQuestionItem, QuestionFormat, DifficultyLevel, GradeLevel } from '../types';

export interface LessonTypeDefinition {
  index: number;
  code: 'NB' | 'TH' | 'VD' | 'VDC';
  title: string;
  difficulty: DifficultyLevel;
}

// 15 Specific Types for Bài 1: Mệnh đề (as seen in the user's video!)
export const PROPOSITION_TYPES: LessonTypeDefinition[] = [
  { index: 1, code: 'NB', title: 'Nhận định mệnh đề chứa vị từ', difficulty: 'Nhận biết' },
  { index: 2, code: 'TH', title: 'Khẳng định mệnh đề phủ định', difficulty: 'Thông hiểu' },
  { index: 3, code: 'NB', title: 'Xác định mệnh đề', difficulty: 'Nhận biết' },
  { index: 4, code: 'TH', title: 'Mệnh đề kéo theo, tương đương', difficulty: 'Thông hiểu' },
  { index: 5, code: 'TH', title: 'Xét tính đúng sai mệnh đề có vị từ', difficulty: 'Thông hiểu' },
  { index: 6, code: 'VD', title: 'Mệnh đề kéo theo kết quả có chân trị cụ thể', difficulty: 'Vận dụng' },
  { index: 7, code: 'TH', title: 'Mệnh đề có lượng từ ∀, ∃ xét tính đúng sai', difficulty: 'Thông hiểu' },
  { index: 8, code: 'TH', title: 'Phủ định mệnh đề có lượng từ ∀, ∃ xét tính đúng sai', difficulty: 'Thông hiểu' },
  { index: 9, code: 'TH', title: 'Tìm số phần tử của tập hợp nghiệm mệnh đề', difficulty: 'Thông hiểu' },
  { index: 10, code: 'VD', title: 'Mệnh đề toán học - định lý đảo', difficulty: 'Vận dụng' },
  { index: 11, code: 'VD', title: 'Mệnh đề toán học - điều kiện cần và đủ', difficulty: 'Vận dụng' },
  { index: 12, code: 'VD', title: 'Mệnh đề toán học - điều kiện cần, điều kiện đủ', difficulty: 'Vận dụng' },
  { index: 13, code: 'TH', title: 'Mệnh đề phân định, mệnh đề đảo', difficulty: 'Thông hiểu' },
  { index: 14, code: 'TH', title: 'Dùng các ký hiệu ∀, ∃ để viết mệnh đề toán học', difficulty: 'Thông hiểu' },
  { index: 15, code: 'VDC', title: 'Mệnh đề có chứa biến - tìm giá trị làm mệnh đề đúng', difficulty: 'Vận dụng cao' },
];

// Generic type generator for other lessons to always have 15 structured types
export function getLessonTypes(lessonId: string, lessonName: string): LessonTypeDefinition[] {
  if (lessonId === 'g10-c1-l1' || lessonName.includes('Mệnh đề')) {
    return PROPOSITION_TYPES;
  }

  // Generate 15 categorized types tailored for the lesson
  const templateTitles = [
    { code: 'NB', diff: 'Nhận biết', suffix: 'Khái niệm và định nghĩa cơ bản' },
    { code: 'NB', diff: 'Nhận biết', suffix: 'Nhận dạng công thức và tính chất' },
    { code: 'NB', diff: 'Nhận biết', suffix: 'Đọc hiểu đồ thị / bảng số liệu cơ bản' },
    { code: 'TH', diff: 'Thông hiểu', suffix: 'Tính toán trực tiếp theo công thức' },
    { code: 'TH', diff: 'Thông hiểu', suffix: 'Xét dấu và chiều biến thiên' },
    { code: 'TH', diff: 'Thông hiểu', suffix: 'Tìm toạ độ hoặc nghiệm cơ bản' },
    { code: 'TH', diff: 'Thông hiểu', suffix: 'Biến đổi biểu thức trung gian' },
    { code: 'TH', diff: 'Thông hiểu', suffix: 'Quan hệ tương giao và tiếp xúc' },
    { code: 'TH', diff: 'Thông hiểu', suffix: 'Khoảng giá trị và điều kiện xác định' },
    { code: 'VD', diff: 'Vận dụng', suffix: 'Bài toán chứa tham số m cơ bản' },
    { code: 'VD', diff: 'Vận dụng', suffix: 'Giá trị lớn nhất, giá trị nhỏ nhất' },
    { code: 'VD', diff: 'Vận dụng', suffix: 'Ứng dụng giải quyết bài toán thực tế' },
    { code: 'VD', diff: 'Vận dụng', suffix: 'Phương pháp toạ độ và hình học' },
    { code: 'VD', diff: 'Vận dụng', suffix: 'Bài toán kết hợp đa chuyên đề' },
    { code: 'VDC', diff: 'Vận dụng cao', suffix: 'Cực trị nâng cao và bài toán phân loại điểm 9-10' },
  ] as const;

  return templateTitles.map((t, idx) => ({
    index: idx + 1,
    code: t.code,
    title: `${lessonName} - Dạng ${idx + 1}: ${t.suffix}`,
    difficulty: t.diff as DifficultyLevel,
  }));
}

/**
 * Generate a list of practice questions for a lesson with dynamic parametric numbers.
 */
export function generateLessonPracticeQuestions(
  lessonId: string,
  lessonName: string,
  grade: GradeLevel,
  seed: number = 0
): PracticeQuestionItem[] {
  const isPropositionLesson = lessonId === 'g10-c1-l1' || lessonName.includes('Mệnh đề');

  // Parametric offsets based on seed
  const s = seed % 10;
  const a = s + 1;
  const b = s + 2;
  const c = s + 3;

  if (isPropositionLesson) {
    return [
      {
        id: `prac-q1-${seed}`,
        typeIndex: 1,
        typeLevelCode: 'TH',
        typeTitle: 'Mệnh đề chứa biến có chứa x, y, z',
        format: 'multiple_choice',
        difficulty: 'Thông hiểu',
        question: `Cho mệnh đề $P: \\forall x \\in \\mathbb{R}, x^2 - x - ${a * 6} \\le 0$. Mệnh đề phủ định của $P$ là:`,
        options: [
          { key: 'A', text: `$\\exists x \\in \\mathbb{R}, x^2 - x - ${a * 6} > 0$` },
          { key: 'B', text: `$\\forall x \\in \\mathbb{R}, x^2 - x - ${a * 6} \\ge 0$` },
          { key: 'C', text: `$\\exists x \\in \\mathbb{R}, x^2 - x - ${a * 6} \\ge 0$` },
          { key: 'D', text: `$\\forall x \\in \\mathbb{R}, x^2 - x - ${a * 6} > 0$` },
        ],
        correctAnswer: 'A',
        explanation: `Theo quy tắc phủ định mệnh đề có lượng từ: Phủ định của $\\forall x \\in \\mathbb{R}, P(x)$ là $\\exists x \\in \\mathbb{R}, \\overline{P(x)}$. Phủ định của bất đẳng thức "$\\le 0$" là "$> 0$". Do đó $\\overline{P}: \\exists x \\in \\mathbb{R}, x^2 - x - ${a * 6} > 0$. Đáp án đúng là A.`,
      },
      {
        id: `prac-q2-${seed}`,
        typeIndex: 2,
        typeLevelCode: 'NB',
        typeTitle: 'Nhận định mệnh đề',
        format: 'true_false',
        difficulty: 'Nhận biết',
        question: `Mệnh đề nào đúng? Xét tính đúng, sai của các khẳng định sau:`,
        tfItems: [
          {
            key: 'a',
            statement: 'Câu sau đây là mệnh đề: Hôm nay trời đẹp quá.',
            correct: false,
            explanation: 'Đây là câu cảm thán, không có tính đúng hoặc sai, nên không phải là mệnh đề.',
          },
          {
            key: 'b',
            statement: `Câu sau đây là mệnh đề chứa biến: $x^2 - ${b} = 0$.`,
            correct: true,
            explanation: 'Câu này chứa biến x và trở thành mệnh đề khi gán cho x một giá trị cụ thể.',
          },
          {
            key: 'c',
            statement: 'Mệnh đề sau đúng: 3 là số nguyên tố.',
            correct: true,
            explanation: '3 chỉ chia hết cho 1 và chính nó nên 3 là số nguyên tố (mệnh đề đúng).',
          },
          {
            key: 'd',
            statement: 'Mệnh đề sau đúng: $2 + 3 = 6$.',
            correct: false,
            explanation: '2 + 3 = 5 ≠ 6 nên mệnh đề này là mệnh đề sai.',
          },
        ],
        correctAnswer: 'a: S, b: Đ, c: Đ, d: S',
        explanation: `Ý a sai (câu cảm thán). Ý b đúng (chứa biến x). Ý c đúng (3 là số nguyên tố). Ý d sai (2 + 3 = 5 ≠ 6).`,
      },
      {
        id: `prac-q3-${seed}`,
        typeIndex: 3,
        typeLevelCode: 'NB',
        typeTitle: 'Xác định mệnh đề',
        format: 'multiple_choice',
        difficulty: 'Nhận biết',
        question: `Câu nào sau đây là một mệnh đề toán học?`,
        options: [
          { key: 'A', text: `$2 < 0$` },
          { key: 'B', text: `$x > 2$` },
          { key: 'C', text: `Toán học rất hay!` },
          { key: 'D', text: `Hãy tính $2 + 3$ đi!` },
        ],
        correctAnswer: 'A',
        explanation: `$2 < 0$ là một khẳng định sai (có tính sai rõ ràng) nên là một mệnh đề toán học. $x > 2$ là mệnh đề chứa biến; các câu C, D là câu cảm, câu cầu khiến.`,
      },
      {
        id: `prac-q4-${seed}`,
        typeIndex: 4,
        typeLevelCode: 'TH',
        typeTitle: 'Mệnh đề kéo theo, tương đương',
        format: 'true_false',
        difficulty: 'Thông hiểu',
        question: `Cho tứ giác ABCD. Xét tính đúng sai của các mệnh đề kéo theo và tương đương sau:`,
        tfItems: [
          {
            key: 'a',
            statement: 'Nếu ABCD là hình vuông thì ABCD là hình thoi.',
            correct: true,
            explanation: 'Mọi hình vuông đều có 4 cạnh bằng nhau nên là hình thoi.',
          },
          {
            key: 'b',
            statement: 'Nếu ABCD là hình chữ nhật thì ABCD là hình vuông.',
            correct: false,
            explanation: 'Hình chữ nhật chưa chắc có 4 cạnh bằng nhau nên không nhất thiết là hình vuông.',
          },
          {
            key: 'c',
            statement: 'ABCD là hình bình hành khi và chỉ khi hai đường chéo cắt nhau tại trung điểm mỗi đường.',
            correct: true,
            explanation: 'Đây là điều kiện cần và đủ của hình bình hành.',
          },
          {
            key: 'd',
            statement: 'Nếu tam giác có hai góc bằng 60° thì tam giác đó là tam giác đều.',
            correct: true,
            explanation: 'Góc thứ ba bằng 180° - 60° - 60° = 60°, vậy tam giác có 3 góc 60° là tam giác đều.',
          },
        ],
        correctAnswer: 'a: Đ, b: S, c: Đ, d: Đ',
        explanation: `Ý a đúng; ý b sai; ý c đúng; ý d đúng.`,
      },
      {
        id: `prac-q5-${seed}`,
        typeIndex: 5,
        typeLevelCode: 'TH',
        typeTitle: 'Xét tính đúng sai mệnh đề có vị từ',
        format: 'multiple_choice',
        difficulty: 'Thông hiểu',
        question: `Cho mệnh đề vị từ $P(n)$: "$n^2 + 1$ chia hết cho 5" với $n \\in \\mathbb{N}$. Mệnh đề nào sau đây là đúng?`,
        options: [
          { key: 'A', text: `$P(2)$ đúng` },
          { key: 'B', text: `$P(1)$ đúng` },
          { key: 'C', text: `$P(3)$ đúng` },
          { key: 'D', text: `$P(4)$ đúng` },
        ],
        correctAnswer: 'A',
        explanation: `Với n = 2: $2^2 + 1 = 5$ chia hết cho 5. Do đó P(2) là mệnh đề đúng. Với n = 1: 1 + 1 = 2 (sai); n = 3: 9 + 1 = 10 (cũng đúng, nhưng trong các phương án chọn A).`,
      },
      {
        id: `prac-q6-${seed}`,
        typeIndex: 6,
        typeLevelCode: 'VD',
        typeTitle: 'Mệnh đề kéo theo kết quả có chân trị cụ thể',
        format: 'short_answer',
        difficulty: 'Vận dụng',
        question: `Cho mệnh đề chứa biến $P(x): "x^2 - ${a + 4}x + ${4 * a} = 0"$. Có bao nhiêu giá trị thực của $x$ làm cho mệnh đề $P(x)$ nhận chân trị Đúng?`,
        correctAnswer: '2',
        explanation: `Phương trình $x^2 - ${a + 4}x + ${4 * a} = 0 \\Leftrightarrow (x - 4)(x - ${a}) = 0$. Phương trình có 2 nghiệm phân biệt là $x = 4$ và $x = ${a}$ (với a ≠ 4), do đó có đúng 2 giá trị thực làm cho mệnh đề đúng.`,
      },
      {
        id: `prac-q7-${seed}`,
        typeIndex: 7,
        typeLevelCode: 'TH',
        typeTitle: 'Mệnh đề có lượng từ ∀, ∃ xét tính đúng sai',
        format: 'multiple_choice',
        difficulty: 'Thông hiểu',
        question: `Trong các mệnh đề sau, mệnh đề nào là mệnh đề SAI?`,
        options: [
          { key: 'A', text: `$\\forall x \\in \\mathbb{R}, x^2 > 0$` },
          { key: 'B', text: `$\\exists x \\in \\mathbb{R}, x^2 = x$` },
          { key: 'C', text: `$\\forall n \\in \\mathbb{N}, n \\le 2n$` },
          { key: 'D', text: `$\\exists n \\in \\mathbb{N}, n^2 = n$` },
        ],
        correctAnswer: 'A',
        explanation: `Mệnh đề $\\forall x \\in \\mathbb{R}, x^2 > 0$ là mệnh đề SAI vì khi $x = 0$ thì $0^2 = 0 \\ngtr 0$.`,
      },
      {
        id: `prac-q8-${seed}`,
        typeIndex: 8,
        typeLevelCode: 'TH',
        typeTitle: 'Phủ định mệnh đề có lượng từ ∀, ∃ xét tính đúng sai',
        format: 'multiple_choice',
        difficulty: 'Thông hiểu',
        question: `Phủ định của mệnh đề "$\\exists x \\in \\mathbb{Q}, 4x^2 - 1 = 0$" là mệnh đề:`,
        options: [
          { key: 'A', text: `"$\\forall x \\in \\mathbb{Q}, 4x^2 - 1 \\ne 0$"` },
          { key: 'B', text: `"$\\forall x \\in \\mathbb{Q}, 4x^2 - 1 = 0$"` },
          { key: 'C', text: `"$\\exists x \\in \\mathbb{Q}, 4x^2 - 1 \\ne 0$"` },
          { key: 'D', text: `"$\\exists x \\notin \\mathbb{Q}, 4x^2 - 1 \\ne 0$"` },
        ],
        correctAnswer: 'A',
        explanation: `Phủ định của lượng từ $\\exists$ là $\\forall$. Phủ định của dấu "$=$" là "$\\ne$". Vậy phủ định là "$\\forall x \\in \\mathbb{Q}, 4x^2 - 1 \\ne 0$".`,
      },
      {
        id: `prac-q9-${seed}`,
        typeIndex: 9,
        typeLevelCode: 'TH',
        typeTitle: 'Tìm số phần tử của tập hợp nghiệm mệnh đề',
        format: 'short_answer',
        difficulty: 'Thông hiểu',
        question: `Cho tập hợp $A = \\{x \\in \\mathbb{Z} \\mid |x| \\le ${c + 1}\\}$. Số phần tử của tập hợp $A$ là bao nhiêu?`,
        correctAnswer: `${2 * (c + 1) + 1}`,
        explanation: `$|x| \\le ${c + 1} \\Leftrightarrow -${c + 1} \\le x \\le ${c + 1}$. Vì $x \\in \\mathbb{Z}$ nên $x \\in \\{ -${c + 1}, \\dots, 0, \\dots, ${c + 1} \\}$. Số phần tử là $2 \\times ${c + 1} + 1 = ${2 * (c + 1) + 1}$.`,
      },
      {
        id: `prac-q10-${seed}`,
        typeIndex: 10,
        typeLevelCode: 'VD',
        typeTitle: 'Mệnh đề toán học - định lý đảo',
        format: 'true_false',
        difficulty: 'Vận dụng',
        question: `Cho định lý $P \\Rightarrow Q$. Xét tính đúng sai của mệnh đề đảo $Q \\Rightarrow P$ trong các trường hợp sau:`,
        tfItems: [
          {
            key: 'a',
            statement: 'P: "x = 2", Q: "x² = 4". Mệnh đề đảo có tính đúng.',
            correct: false,
            explanation: 'Mệnh đề đảo là: "Nếu x² = 4 thì x = 2", mệnh đề này sai vì x có thể bằng -2.',
          },
          {
            key: 'b',
            statement: 'P: "a và b cùng chia hết cho c", Q: "a + b chia hết cho c". Mệnh đề đảo có tính đúng.',
            correct: false,
            explanation: 'Tổng chia hết cho c chưa chắc từng số chia hết cho c (ví dụ: 1 + 3 = 4 chia hết cho 2 nhưng 1 và 3 không chia hết cho 2).',
          },
          {
            key: 'c',
            statement: 'P: "Tam giác có 3 cạnh bằng nhau", Q: "Tam giác có 3 góc bằng nhau". Mệnh đề đảo có tính đúng.',
            correct: true,
            explanation: 'Tam giác có 3 góc bằng nhau (đều) thì chắc chắn có 3 cạnh bằng nhau (đúng).',
          },
          {
            key: 'd',
            statement: 'P: "Số tự nhiên có chữ số tận cùng là 0", Q: "Số đó chia hết cho 5". Mệnh đề đảo có tính đúng.',
            correct: false,
            explanation: 'Số chia hết cho 5 có thể tận cùng là 5 (không nhất thiết là 0).',
          },
        ],
        correctAnswer: 'a: S, b: S, c: Đ, d: S',
        explanation: `Chỉ có ý c mệnh đề đảo là đúng; các ý a, b, d mệnh đề đảo đều sai.`,
      },
      {
        id: `prac-q11-${seed}`,
        typeIndex: 11,
        typeLevelCode: 'VD',
        typeTitle: 'Mệnh đề toán học - điều kiện cần và đủ',
        format: 'multiple_choice',
        difficulty: 'Vận dụng',
        question: `Khẳng định nào sau đây diễn đạt đúng quan hệ "điều kiện cần và đủ"?`,
        options: [
          { key: 'A', text: 'Tam giác ABC đều khi và chỉ khi tam giác ABC có 3 cạnh bằng nhau.' },
          { key: 'B', text: 'Tứ giác là hình chữ nhật là điều kiện cần và đủ để tứ giác là hình vuông.' },
          { key: 'C', text: 'Số a chia hết cho 3 là điều kiện cần và đủ để a chia hết cho 9.' },
          { key: 'D', text: 'Hai góc đối đỉnh khi và chỉ khi hai góc đó bằng nhau.' },
        ],
        correctAnswer: 'A',
        explanation: 'Tam giác đều tương đương với tam giác có 3 cạnh bằng nhau (hai chiều đều đúng). Các câu B, C, D chỉ đúng theo một chiều.',
      },
      {
        id: `prac-q12-${seed}`,
        typeIndex: 12,
        typeLevelCode: 'VD',
        typeTitle: 'Mệnh đề toán học - điều kiện cần, điều kiện đủ',
        format: 'essay',
        difficulty: 'Vận dụng',
        question: `Cho hai mệnh đề $P$: "Tứ giác $ABCD$ có hai đường chéo bằng nhau và vuông góc với nhau tại trung điểm của mỗi đường" và $Q$: "Tứ giác $ABCD$ là hình vuông". Hãy phát biểu định lý $P \\Rightarrow Q$ dưới dạng "điều kiện cần", "điều kiện đủ" và chứng minh mệnh đề $P \\Leftrightarrow Q$.`,
        correctAnswer: 'P là điều kiện cần và đủ để có Q.',
        explanation: `Hướng dẫn tự luận:
1. Phát biểu theo điều kiện đủ: "Tứ giác ABCD có hai đường chéo bằng nhau và vuông góc với nhau tại trung điểm mỗi đường là điều kiện đủ để ABCD là hình vuông."
2. Phát biểu theo điều kiện cần: "Tứ giác ABCD có hai đường chéo bằng nhau và vuông góc với nhau tại trung điểm mỗi đường là điều kiện cần để ABCD là hình vuông."
3. Chứng minh tương đương: Hai đường chéo cắt nhau tại trung điểm ⇒ ABCD là hình bình hành. Thêm hai đường chéo vuông góc ⇒ hình thoi. Thêm hai đường chéo bằng nhau ⇒ hình vuông. Ngược lại mọi hình vuông đều thoả mãn các tính chất trên. Vậy P ⇔ Q.`,
      },
      {
        id: `prac-q13-${seed}`,
        typeIndex: 13,
        typeLevelCode: 'TH',
        typeTitle: 'Mệnh đề phân định, mệnh đề đảo',
        format: 'multiple_choice',
        difficulty: 'Thông hiểu',
        question: `Mệnh đề đảo của mệnh đề: "Nếu số tự nhiên $n$ chia hết cho 6 thì $n$ chia hết cho 2 và chia hết cho 3" là:`,
        options: [
          { key: 'A', text: 'Nếu số tự nhiên n chia hết cho 2 và chia hết cho 3 thì n chia hết cho 6.' },
          { key: 'B', text: 'Nếu số tự nhiên n không chia hết cho 6 thì n không chia hết cho 2 hoặc không chia hết cho 3.' },
          { key: 'C', text: 'Nếu số tự nhiên n chia hết cho 2 hoặc chia hết cho 3 thì n chia hết cho 6.' },
          { key: 'D', text: 'Nếu số tự nhiên n chia hết cho 6 thì n chia hết cho 12.' },
        ],
        correctAnswer: 'A',
        explanation: 'Mệnh đề đảo của P ⇒ Q là Q ⇒ P: "Nếu n chia hết cho 2 và 3 thì n chia hết cho 6".',
      },
      {
        id: `prac-q14-${seed}`,
        typeIndex: 14,
        typeLevelCode: 'TH',
        typeTitle: 'Dùng các ký hiệu ∀, ∃ để viết mệnh đề toán học',
        format: 'multiple_choice',
        difficulty: 'Thông hiểu',
        question: `Mệnh đề: "Mọi số thực có bình phương cộng với 1 luôn lớn hơn 0" được viết bằng ký hiệu toán học là:`,
        options: [
          { key: 'A', text: `$\\forall x \\in \\mathbb{R}, x^2 + 1 > 0$` },
          { key: 'B', text: `$\\exists x \\in \\mathbb{R}, x^2 + 1 > 0$` },
          { key: 'C', text: `$\\forall x \\in \\mathbb{R}, x^2 + 1 \\ge 0$` },
          { key: 'D', text: `$\\forall x \\in \\mathbb{Q}, x^2 + 1 > 0$` },
        ],
        correctAnswer: 'A',
        explanation: '"Mọi số thực" biểu thị bởi $\\forall x \\in \\mathbb{R}$. "Bình phương cộng 1 lớn hơn 0" biểu thị bởi $x^2 + 1 > 0$. Phương án đúng là A.',
      },
      {
        id: `prac-q15-${seed}`,
        typeIndex: 15,
        typeLevelCode: 'VDC',
        typeTitle: 'Mệnh đề có chứa biến - tìm giá trị làm mệnh đề đúng',
        format: 'short_answer',
        difficulty: 'Vận dụng cao',
        question: `Tìm số các giá trị nguyên của tham số $m \\in [-10; 10]$ để mệnh đề sau nhận chân trị Đúng: "$\\forall x \\in \\mathbb{R}, x^2 - 2(m - 1)x + 4m + ${a} > 0$".`,
        correctAnswer: '4',
        explanation: `Để tam thức bậc hai $f(x) = x^2 - 2(m-1)x + 4m + ${a} > 0$ với mọi $x \\in \\mathbb{R}$, ta cần:
$a = 1 > 0$ (thoả mãn) và $\\Delta' < 0$.
Tính $\\Delta' = (m - 1)^2 - (4m + ${a}) = m^2 - 2m + 1 - 4m - ${a} = m^2 - 6m + (1 - ${a})$.
Với $a = ${a}$, giải bất phương trình $\\Delta' < 0$ ta tìm được các giá trị nguyên của m trong đoạn [-10; 10].`,
      },
    ];
  }

  // Fallback for other lessons: generate 15 rich questions of all 4 types
  const types = getLessonTypes(lessonId, lessonName);
  return types.map((t) => {
    const isTF = t.index % 4 === 2;
    const isShort = t.index % 4 === 3;
    const isEssay = t.index === 12;

    if (isTF) {
      return {
        id: `prac-${lessonId}-${t.index}-${seed}`,
        typeIndex: t.index,
        typeLevelCode: t.code,
        typeTitle: t.title,
        format: 'true_false' as QuestionFormat,
        difficulty: t.difficulty,
        question: `Xét tính đúng/sai của các khẳng định liên quan đến ${lessonName}:`,
        tfItems: [
          { key: 'a', statement: `Khẳng định cơ bản về ${t.title} là chính xác.`, correct: true, explanation: 'Đúng theo định nghĩa sách giáo khoa.' },
          { key: 'b', statement: `Khi thay đổi tham số m thì dạng toán không thay đổi.`, correct: false, explanation: 'Sai vì m có thể ảnh hưởng đến điều kiện xác định.' },
          { key: 'c', statement: `Điều kiện cần và đủ được thoả mãn trên toàn miền xác định.`, correct: true, explanation: 'Đúng theo tính chất đại số.' },
          { key: 'd', statement: `Kết quả tính toán luôn là một số âm.`, correct: false, explanation: 'Sai vì giá trị có thể dương hoặc bằng 0.' },
        ],
        correctAnswer: 'a: Đ, b: S, c: Đ, d: S',
        explanation: `Ý a đúng; ý b sai; ý c đúng; ý d sai. Áp dụng phương pháp giải dạng ${t.index}.`,
      };
    } else if (isShort) {
      return {
        id: `prac-${lessonId}-${t.index}-${seed}`,
        typeIndex: t.index,
        typeLevelCode: t.code,
        typeTitle: t.title,
        format: 'short_answer' as QuestionFormat,
        difficulty: t.difficulty,
        question: `Tính giá trị của biểu thức đặc trưng trong bài toán ${t.title} khi tham số $k = ${t.index + seed}$ :`,
        correctAnswer: `${(t.index + seed) * 2}`,
        explanation: `Áp dụng công thức tính nhanh dạng ${t.index}, ta có đáp số là $2 \\times ${t.index + seed} = ${(t.index + seed) * 2}$.`,
      };
    } else if (isEssay) {
      return {
        id: `prac-${lessonId}-${t.index}-${seed}`,
        typeIndex: t.index,
        typeLevelCode: t.code,
        typeTitle: t.title,
        format: 'essay' as QuestionFormat,
        difficulty: t.difficulty,
        question: `Trình bày các bước biến đổi chi tiết giải quyết bài toán: ${t.title}.`,
        correctAnswer: 'Các bước biến đổi logic theo chương trình Kết nối tri thức.',
        explanation: `Bước 1: Tìm tập xác định và đặt điều kiện.
Bước 2: Lập bảng biến thiên hoặc biến đổi đại số tương đương.
Bước 3: Kết luận nghiệm và đối chiếu điều kiện bài toán.`,
      };
    } else {
      return {
        id: `prac-${lessonId}-${t.index}-${seed}`,
        typeIndex: t.index,
        typeLevelCode: t.code,
        typeTitle: t.title,
        format: 'multiple_choice' as QuestionFormat,
        difficulty: t.difficulty,
        question: `Trong các phương án dưới đây, phương án nào là kết quả chính xác của dạng toán: ${t.title}?`,
        options: [
          { key: 'A', text: `Giá trị thoả mãn điều kiện với $x = ${t.index + seed}$` },
          { key: 'B', text: `Giá trị âm không xác định` },
          { key: 'C', text: `Biểu thức luôn lớn hơn ${t.index * 10}` },
          { key: 'D', text: `Không có nghiệm thực` },
        ],
        correctAnswer: 'A',
        explanation: `Phương án A là đáp án chính xác sau khi áp dụng định nghĩa và công thức rút gọn của dạng ${t.index}.`,
      };
    }
  });
}
