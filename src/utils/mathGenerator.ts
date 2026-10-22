import {
  ExamQuestionPart1,
  ExamQuestionPart2,
  ExamQuestionPart3,
  ExamScoreReport,
  ExamSubmission,
  GeneratedExam,
  GradeLevel,
} from '../types';

export function generateExam(
  grade: GradeLevel,
  examType: 'Giữa học kì I' | 'Cuối học kì I' | 'Giữa học kì II' | 'Cuối học kì II' | 'Ôn tốt nghiệp',
  schoolName: string = 'Trường THPT Ba Chúc, An Giang'
): GeneratedExam {
  const seed = Math.floor(Math.random() * 1000);
  const examId = `EXAM-${grade}-${Date.now().toString().slice(-4)}`;

  // Random variations
  const k1 = ((seed % 3) + 2); // 2, 3, or 4
  const k2 = ((seed % 4) + 1); // 1, 2, 3, 4
  const c1 = ((seed % 5) - 2); // -2, -1, 0, 1, 2

  // Part 1: 12 Multiple choice questions
  const part1Questions: ExamQuestionPart1[] = [
    {
      id: `${examId}-p1-1`,
      part: 'part1',
      questionNumber: 1,
      question: `Cho hàm số $y = f(x)$ có bảng biến thiên với $f'(x) > 0$ trên $(-\\infty; -${k1})$ và $(${k1}; +\\infty)$, $f'(x) < 0$ trên $(-${k1}; ${k1})$. Hàm số đã cho đồng biến trên khoảng nào dưới đây?`,
      options: [
        { key: 'A', text: `(${k1}; +\\infty)` },
        { key: 'B', text: `(-${k1}; ${k1})` },
        { key: 'C', text: `(-${k1}; +\\infty)` },
        { key: 'D', text: `(-\\infty; ${k1})` },
      ],
      correctAnswer: 'A',
      explanation: `Hàm số đồng biến trên các khoảng mà $f'(x) > 0$, tức là $(-\\infty; -${k1})$ và $(${k1}; +\\infty)$. Do đó phương án đúng là A.`,
      topic: 'Tính đơn điệu của hàm số',
    },
    {
      id: `${examId}-p1-2`,
      part: 'part1',
      questionNumber: 2,
      question: `Đồ thị hàm số $y = \\frac{${k2}x - 1}{x + ${k1}}$ có đường tiệm cận đứng là:`,
      options: [
        { key: 'A', text: `x = -${k1}` },
        { key: 'B', text: `x = ${k1}` },
        { key: 'C', text: `y = ${k2}` },
        { key: 'D', text: `y = -${k1}` },
      ],
      correctAnswer: 'A',
      explanation: `Mẫu số $x + ${k1} = 0 \\Leftrightarrow x = -${k1}$. Giới hạn $\\lim_{x \\to (-${k1})^\\pm} y = \\pm\\infty$, vậy tiệm cận đứng là $x = -${k1}$.`,
      topic: 'Đường tiệm cận',
    },
    {
      id: `${examId}-p1-3`,
      part: 'part1',
      questionNumber: 3,
      question: `Giá trị cực tiểu của hàm số $y = x^3 - 3x + ${c1}$ là:`,
      options: [
        { key: 'A', text: `${c1 - 2}` },
        { key: 'B', text: `${c1 + 2}` },
        { key: 'C', text: `1` },
        { key: 'D', text: `-1` },
      ],
      correctAnswer: 'A',
      explanation: `Ta có $y' = 3x^2 - 3 = 0 \\Leftrightarrow x = \\pm 1$. Tại $x = 1$, $y'' = 6 > 0$ nên đạt cực tiểu tại $x = 1$. Giá trị cực tiểu $y_{CT} = y(1) = 1 - 3 + ${c1} = ${c1 - 2}$.`,
      topic: 'Cực trị của hàm số',
    },
    {
      id: `${examId}-p1-4`,
      part: 'part1',
      questionNumber: 4,
      question: `Trong không gian $Oxyz$, cho điểm $M(1, -${k1}, ${k2})$. Toạ độ hình chiếu vuông góc của điểm $M$ lên mặt phẳng $(Oxy)$ là:`,
      options: [
        { key: 'A', text: `(1, -${k1}, 0)` },
        { key: 'B', text: `(0, 0, ${k2})` },
        { key: 'C', text: `(1, 0, ${k2})` },
        { key: 'D', text: `(0, -${k1}, ${k2})` },
      ],
      correctAnswer: 'A',
      explanation: `Hình chiếu của $M(x, y, z)$ lên mặt phẳng $(Oxy)$ có cao độ $z = 0$, giữ nguyên hoành độ và tung độ: $(1, -${k1}, 0)$.`,
      topic: 'Toạ độ trong không gian',
    },
    {
      id: `${examId}-p1-5`,
      part: 'part1',
      questionNumber: 5,
      question: `Cho $\\vec{a} = (1, 2, -1)$ và $\\vec{b} = (2, -1, ${k1})$. Tích vô hướng $\\vec{a} \\cdot \\vec{b}$ bằng:`,
      options: [
        { key: 'A', text: `${-k1}` },
        { key: 'B', text: `${k1}` },
        { key: 'C', text: `0` },
        { key: 'D', text: `${4 - k1}` },
      ],
      correctAnswer: 'A',
      explanation: `$\\vec{a} \\cdot \\vec{b} = 1 \\cdot 2 + 2 \\cdot (-1) + (-1) \\cdot ${k1} = 2 - 2 - ${k1} = -${k1}$.`,
      topic: 'Vectơ trong không gian',
    },
    {
      id: `${examId}-p1-6`,
      part: 'part1',
      questionNumber: 6,
      question: `Họ tất cả các nguyên hàm của hàm số $f(x) = ${k1}x + \\sin x$ là:`,
      options: [
        { key: 'A', text: `\\frac{${k1}}{2}x^2 - \\cos x + C` },
        { key: 'B', text: `\\frac{${k1}}{2}x^2 + \\cos x + C` },
        { key: 'C', text: `${k1}x^2 - \\cos x + C` },
        { key: 'D', text: `${k1} + \\cos x + C` },
      ],
      correctAnswer: 'A',
      explanation: `$\\int (${k1}x + \\sin x) dx = ${k1} \\frac{x^2}{2} - \\cos x + C$.`,
      topic: 'Nguyên hàm',
    },
    {
      id: `${examId}-p1-7`,
      part: 'part1',
      questionNumber: 7,
      question: `Nghiệm của phương trình $\\log_2(x - 1) = ${k2}$ là:`,
      options: [
        { key: 'A', text: `x = ${Math.pow(2, k2) + 1}` },
        { key: 'B', text: `x = ${Math.pow(2, k2)}` },
        { key: 'C', text: `x = ${Math.pow(2, k2) - 1}` },
        { key: 'D', text: `x = ${2 * k2 + 1}` },
      ],
      correctAnswer: 'A',
      explanation: `$\\log_2(x - 1) = ${k2} \\Leftrightarrow x - 1 = 2^{${k2}} \\Leftrightarrow x = ${Math.pow(2, k2)} + 1 = ${Math.pow(2, k2) + 1}$.`,
      topic: 'Phương trình logarit',
    },
    {
      id: `${examId}-p1-8`,
      part: 'part1',
      questionNumber: 8,
      question: `Cho cấp số cộng $(u_n)$ có số hạng đầu $u_1 = ${k1}$ và công sai $d = 3$. Số hạng thứ tư $u_4$ bằng:`,
      options: [
        { key: 'A', text: `${k1 + 9}` },
        { key: 'B', text: `${k1 + 12}` },
        { key: 'C', text: `${k1 + 6}` },
        { key: 'D', text: `${k1 * 27}` },
      ],
      correctAnswer: 'A',
      explanation: `$u_4 = u_1 + 3d = ${k1} + 3 \\times 3 = ${k1 + 9}$.`,
      topic: 'Cấp số cộng',
    },
    {
      id: `${examId}-p1-9`,
      part: 'part1',
      questionNumber: 9,
      question: `Tập nghiệm của bất phương trình $2^{x - 1} < 8$ là:`,
      options: [
        { key: 'A', text: `(-\\infty; 4)` },
        { key: 'B', text: `(4; +\\infty)` },
        { key: 'C', text: `(-\\infty; 3)` },
        { key: 'D', text: `(1; 4)` },
      ],
      correctAnswer: 'A',
      explanation: `$2^{x - 1} < 2^3 \\Leftrightarrow x - 1 < 3 \\Leftrightarrow x < 4$. Vậy tập nghiệm là $(-\\infty; 4)$.`,
      topic: 'Bất phương trình mũ',
    },
    {
      id: `${examId}-p1-10`,
      part: 'part1',
      questionNumber: 10,
      question: `Cho hai biến cố xung khắc $A$ và $B$. Biết $P(A) = 0,3$ và $P(B) = 0,4$. Xác suất của biến cố $A \\cup B$ bằng:`,
      options: [
        { key: 'A', text: `0,7` },
        { key: 'B', text: `0,12` },
        { key: 'C', text: `0,1` },
        { key: 'D', text: `0,58` },
      ],
      correctAnswer: 'A',
      explanation: `Vì hai biến cố xung khắc nên $P(A \\cup B) = P(A) + P(B) = 0,3 + 0,4 = 0,7$.`,
      topic: 'Quy tắc cộng xác suất',
    },
    {
      id: `${examId}-p1-11`,
      part: 'part1',
      questionNumber: 11,
      question: `Góc giữa hai trục toạ độ $Ox$ và $Oy$ trong mặt phẳng toạ độ bằng:`,
      options: [
        { key: 'A', text: `90°` },
        { key: 'B', text: `0°` },
        { key: 'C', text: `180°` },
        { key: 'D', text: `45°` },
      ],
      correctAnswer: 'A',
      explanation: `Hệ trục toạ độ vuông góc nên trục hoành $Ox$ và trục tung $Oy$ vuông góc với nhau, góc giữa chúng bằng $90^\\circ$.`,
      topic: 'Hình học phẳng',
    },
    {
      id: `${examId}-p1-12`,
      part: 'part1',
      questionNumber: 12,
      question: `Đạo hàm của hàm số $y = e^{2x}$ là:`,
      options: [
        { key: 'A', text: `y' = 2e^{2x}` },
        { key: 'B', text: `y' = e^{2x}` },
        { key: 'C', text: `y' = \\frac{1}{2}e^{2x}` },
        { key: 'D', text: `y' = 2xe^{2x - 1}` },
      ],
      correctAnswer: 'A',
      explanation: `Áp dụng công thức đạo hàm hàm hợp $(e^u)' = u' \\cdot e^u \\Rightarrow (e^{2x})' = (2x)' \\cdot e^{2x} = 2e^{2x}$.`,
      topic: 'Đạo hàm hàm số mũ',
    },
  ];

  // Part 2: 4 True/False Questions with 4 sub-items each
  const part2Questions: ExamQuestionPart2[] = [
    {
      id: `${examId}-p2-1`,
      part: 'part2',
      questionNumber: 1,
      stem: `Cho hàm số $y = f(x) = x^3 - 3x^2 + 2$.`,
      subItems: [
        {
          key: 'a',
          statement: `Đạo hàm của hàm số là $f'(x) = 3x^2 - 6x$.`,
          correct: true,
          explanation: `$(x^3 - 3x^2 + 2)' = 3x^2 - 6x$. Khẳng định đúng.`,
        },
        {
          key: 'b',
          statement: `Hàm số nghịch biến trên khoảng $(0; 2)$.`,
          correct: true,
          explanation: `$f'(x) = 3x(x - 2) < 0$ khi $x \\in (0; 2)$. Do đó hàm số nghịch biến trên $(0; 2)$. Khẳng định đúng.`,
        },
        {
          key: 'c',
          statement: `Điểm cực đại của đồ thị hàm số là $(2; -2)$.`,
          correct: false,
          explanation: `Tại $x = 0$, $f'(x)$ đổi dấu từ dương sang âm nên $(0; 2)$ là điểm cực đại. $(2; -2)$ là điểm cực tiểu. Khẳng định sai.`,
        },
        {
          key: 'd',
          statement: `Giá trị lớn nhất của hàm số trên đoạn $[-1; 1]$ bằng $2$.`,
          correct: true,
          explanation: `$f(-1) = -2, f(0) = 2, f(1) = 0$. GTLN là $f(0) = 2$. Khẳng định đúng.`,
        },
      ],
      topic: 'Khảo sát hàm số bậc ba',
    },
    {
      id: `${examId}-p2-2`,
      part: 'part2',
      questionNumber: 2,
      stem: `Trong không gian $Oxyz$, cho mặt cầu $(S): (x - 1)^2 + (y + 2)^2 + (z - 3)^2 = 16$ và điểm $A(1, -2, 7)$.`,
      subItems: [
        {
          key: 'a',
          statement: `Tâm của mặt cầu $(S)$ là $I(1, -2, 3)$.`,
          correct: true,
          explanation: `Phương trình chính tắc dạng $(x - a)^2 + (y - b)^2 + (z - c)^2 = R^2 \\Rightarrow I(1, -2, 3)$. Đúng.`,
        },
        {
          key: 'b',
          statement: `Bán kính của mặt cầu $(S)$ là $R = 16$.`,
          correct: false,
          explanation: `Bán kính $R = \\sqrt{16} = 4$. Khẳng định sai.`,
        },
        {
          key: 'c',
          statement: `Điểm $A(1, -2, 7)$ nằm trên mặt cầu $(S)$.`,
          correct: true,
          explanation: `Thay toạ độ $A$: $(1 - 1)^2 + (-2 + 2)^2 + (7 - 3)^2 = 0 + 0 + 16 = 16$. Đúng.`,
        },
        {
          key: 'd',
          statement: `Mặt phẳng $(Oxy)$ cắt mặt cầu $(S)$ theo một đường tròn.`,
          correct: true,
          explanation: `Khoảng cách từ tâm $I(1, -2, 3)$ đến mặt phẳng $(Oxy): z = 0$ là $d = |3| = 3 < R = 4$. Do đó $(Oxy)$ cắt $(S)$ theo đường tròn. Đúng.`,
        },
      ],
      topic: 'Phương pháp toạ độ Oxyz',
    },
    {
      id: `${examId}-p2-3`,
      part: 'part2',
      questionNumber: 3,
      stem: `Một xưởng may sản xuất áo sơ mi với chi phí để sản xuất $x$ chiếc áo ($x \\ge 1$) được cho bởi hàm số $C(x) = 2x^2 + 50x + 1800$ (nghìn đồng). Chi phí sản xuất trung bình cho mỗi chiếc áo là $\\overline{C}(x) = \\frac{C(x)}{x}$.`,
      subItems: [
        {
          key: 'a',
          statement: `Hàm chi phí trung bình là $\\overline{C}(x) = 2x + 50 + \\frac{1800}{x}$.`,
          correct: true,
          explanation: `$\\overline{C}(x) = \\frac{2x^2 + 50x + 1800}{x} = 2x + 50 + \\frac{1800}{x}$. Khẳng định đúng.`,
        },
        {
          key: 'b',
          statement: `Đạo hàm $\\overline{C}'(x) = 2 - \\frac{1800}{x^2}$.`,
          correct: true,
          explanation: `$(2x)' = 2$, $(50)' = 0$, $(1800/x)' = -1800/x^2$. Khẳng định đúng.`,
        },
        {
          key: 'c',
          statement: `Chi phí trung bình thấp nhất khi xưởng sản xuất 30 chiếc áo.`,
          correct: true,
          explanation: `$\\overline{C}'(x) = 0 \\Leftrightarrow 2 = 1800/x^2 \\Leftrightarrow x^2 = 900 \\Rightarrow x = 30$. Đúng.`,
        },
        {
          key: 'd',
          statement: `Chi phí trung bình thấp nhất cho mỗi chiếc áo là 120 nghìn đồng.`,
          correct: false,
          explanation: `Thay $x = 30$: $\\overline{C}(30) = 2(30) + 50 + 1800/30 = 60 + 50 + 60 = 170$ nghìn đồng (không phải 120). Khẳng định sai.`,
        },
      ],
      topic: 'Toán thực tiễn kinh tế',
    },
    {
      id: `${examId}-p2-4`,
      part: 'part2',
      questionNumber: 4,
      stem: `Một hộp chứa 6 quả cầu đỏ và 4 quả cầu xanh. Chọn ngẫu nhiên lần lượt không hoàn lại 2 quả cầu.`,
      subItems: [
        {
          key: 'a',
          statement: `Số phần tử của không gian mẫu là $C_{10}^2 = 45$.`,
          correct: true,
          explanation: `Chọn ngẫu nhiên 2 quả từ 10 quả: $C_{10}^2 = 45$. Đúng.`,
        },
        {
          key: 'b',
          statement: `Xác suất để cả 2 quả cầu lấy ra đều màu đỏ là $\\frac{1}{3}$.`,
          correct: true,
          explanation: `$P = \\frac{C_6^2}{45} = \\frac{15}{45} = \\frac{1}{3}$. Đúng.`,
        },
        {
          key: 'c',
          statement: `Xác suất để 2 quả cầu lấy ra có cùng màu là $\\frac{7}{15}$.`,
          correct: true,
          explanation: `Cùng màu gồm 2 đỏ hoặc 2 xanh: $C_6^2 + C_4^2 = 15 + 6 = 21$. Xác suất $21/45 = 7/15$. Đúng.`,
        },
        {
          key: 'd',
          statement: `Xác suất để có ít nhất một quả cầu màu đỏ là $\\frac{2}{15}$.`,
          correct: false,
          explanation: `Xác suất biến cố đối (không có quả đỏ nào, tức cả 2 màu xanh): $C_4^2 / 45 = 6/45 = 2/15$. Vậy xác suất có ít nhất 1 quả đỏ là $1 - 2/15 = 13/15$. Khẳng định sai.`,
        },
      ],
      topic: 'Xác suất cổ điển và biến cố đối',
    },
  ];

  // Part 3: 6 Short Answer Questions
  const part3Questions: ExamQuestionPart3[] = [
    {
      id: `${examId}-p3-1`,
      part: 'part3',
      questionNumber: 1,
      question: `Cho hàm số $y = -x^3 + 3x^2 + 9x - 1$. Tìm hoành độ điểm cực đại của hàm số đã cho.`,
      correctAnswer: '3',
      acceptedAnswers: ['3', 'x=3', 'x = 3'],
      explanation: `$y' = -3x^2 + 6x + 9 = -3(x^2 - 2x - 3) = -3(x - 3)(x + 1)$. Cho $y' = 0 \\Leftrightarrow x = 3$ hoặc $x = -1$. Hệ số $a = -3 < 0$, đạo hàm đổi dấu từ dương sang âm qua $x = 3$. Điểm cực đại là $x = 3$.`,
      topic: 'Cực trị hàm số',
    },
    {
      id: `${examId}-p3-2`,
      part: 'part3',
      questionNumber: 2,
      question: `Một vật chuyển động thẳng với gia tốc $a(t) = 6t\\text{ (m/s}^2)$. Tại thời điểm ban đầu $t = 0$, vận tốc của vật là $v(0) = 2\\text{ m/s}$. Tính vận tốc của vật tại thời điểm $t = 3\\text{ s}$ (đơn vị: m/s).`,
      correctAnswer: '29',
      acceptedAnswers: ['29', '29 m/s'],
      explanation: `$v(t) = \\int a(t) dt = \\int 6t dt = 3t^2 + C$. Vì $v(0) = 2 \\Rightarrow C = 2$. Do đó $v(t) = 3t^2 + 2$. Tại $t = 3\\text{ s}$, $v(3) = 3 \\cdot 3^2 + 2 = 27 + 2 = 29\\text{ m/s}$.`,
      topic: 'Ứng dụng nguyên hàm trong vật lý',
    },
    {
      id: `${examId}-p3-3`,
      part: 'part3',
      questionNumber: 3,
      question: `Trong không gian $Oxyz$, cho hai điểm $A(1, 2, 3)$ và $B(3, 6, 7)$. Tính độ dài đoạn thẳng $AB$.`,
      correctAnswer: '6',
      acceptedAnswers: ['6', 'AB=6'],
      explanation: `$AB = \\sqrt{(3 - 1)^2 + (6 - 2)^2 + (7 - 3)^2} = \\sqrt{2^2 + 4^2 + 4^2} = \\sqrt{4 + 16 + 16} = \\sqrt{36} = 6$.`,
      topic: 'Khoảng cách giữa hai điểm trong Oxyz',
    },
    {
      id: `${examId}-p3-4`,
      part: 'part3',
      questionNumber: 4,
      question: `Một bể bơi hình chữ nhật có diện tích $S = 200\\text{ m}^2$. Người ta muốn xây dựng lối đi xung quanh hồ có chiều rộng bằng nhau. Biết chu vi nhỏ nhất của hồ bơi khi hồ có dạng hình vuông. Tính chu vi nhỏ nhất đó (mét).`,
      correctAnswer: '56.57',
      acceptedAnswers: ['56.57', '56.6', '40√2', '40*sqrt(2)', '56,57', '56,6'],
      explanation: `Hồ bơi hình chữ nhật kích thước $x \\times y = 200$. Chu vi $P = 2(x + y) \\ge 4\\sqrt{xy} = 4\\sqrt{200} = 40\\sqrt{2} \\approx 56,57\\text{ m}$.`,
      topic: 'Bất đẳng thức Cauchy trong bài toán tối ưu',
    },
    {
      id: `${examId}-p3-5`,
      part: 'part3',
      questionNumber: 5,
      question: `Có bao nhiêu số tự nhiên có 3 chữ số đôi một khác nhau được lập từ các chữ số $\\{1, 2, 3, 4, 5\\}$?`,
      correctAnswer: '60',
      acceptedAnswers: ['60', '60 số'],
      explanation: `Mỗi số tự nhiên có 3 chữ số phân biệt lập từ 5 chữ số là một chỉnh hợp chập 3 của 5 phần tử: $A_5^3 = \\frac{5!}{(5-3)!} = 5 \\times 4 \\times 3 = 60$.`,
      topic: 'Quy tắc đếm và Chỉnh hợp',
    },
    {
      id: `${examId}-p3-6`,
      part: 'part3',
      questionNumber: 6,
      question: `Biết $\\int_0^1 (2x + 1) dx = a$. Tìm giá trị của số thực $a$.`,
      correctAnswer: '2',
      acceptedAnswers: ['2', 'a=2'],
      explanation: `$\\int_0^1 (2x + 1) dx = [x^2 + x]_0^1 = (1^2 + 1) - 0 = 2$. Do đó $a = 2$.`,
      topic: 'Tích phân cơ bản',
    },
  ];

  return {
    id: examId,
    title: `ĐỀ KIỂM TRA TOÁN KHỐI ${grade} - ${examType.toUpperCase()}`,
    schoolName,
    grade,
    examType,
    durationMinutes: 90,
    structure: 'Chuẩn Bộ GD&ĐT 2025: 12 TN (3.0đ) · 4 Đ/S (4.0đ) · 6 TLN (3.0đ)',
    createdAt: new Date().toLocaleDateString('vi-VN'),
    part1Questions,
    part2Questions,
    part3Questions,
  };
}

/**
 * Auto-grades the exam based on official MOET 2025 grading rubrics:
 * Part 1: 12 questions * 0.25 pt = 3.0 pts
 * Part 2: 4 questions * 1.0 pt = 4.0 pts (Graded per question: 1 correct = 0.1, 2 = 0.25, 3 = 0.5, 4 = 1.0)
 * Part 3: 6 questions * 0.5 pt = 3.0 pts
 * Total: 10.0 pts
 */
export function gradeExam(exam: GeneratedExam, submission: ExamSubmission): ExamScoreReport {
  // Part 1 scoring
  let correctPart1Count = 0;
  exam.part1Questions.forEach((q) => {
    if (submission.part1Answers[q.id] === q.correctAnswer) {
      correctPart1Count++;
    }
  });
  const part1Score = Math.round(correctPart1Count * 0.25 * 100) / 100;

  // Part 2 scoring (MOET 2025 staircase scale)
  let part2Score = 0;
  let correctPart2SubCount = 0;
  const totalPart2SubCount = exam.part2Questions.length * 4;

  exam.part2Questions.forEach((q) => {
    const qAnswers = submission.part2Answers[q.id] || { a: null, b: null, c: null, d: null };
    let correctInThisQ = 0;

    q.subItems.forEach((sub) => {
      if (qAnswers[sub.key] === sub.correct) {
        correctInThisQ++;
        correctPart2SubCount++;
      }
    });

    // Official 2025 step grading for 4 sub-items
    if (correctInThisQ === 1) part2Score += 0.1;
    else if (correctInThisQ === 2) part2Score += 0.25;
    else if (correctInThisQ === 3) part2Score += 0.5;
    else if (correctInThisQ === 4) part2Score += 1.0;
  });
  part2Score = Math.round(part2Score * 100) / 100;

  // Part 3 scoring
  let correctPart3Count = 0;
  exam.part3Questions.forEach((q) => {
    const userAns = (submission.part3Answers[q.id] || '').trim().toLowerCase().replace(/\s+/g, '');
    const correctAns = q.correctAnswer.toLowerCase().replace(/\s+/g, '');
    const accepted = (q.acceptedAnswers || []).map((a) => a.toLowerCase().replace(/\s+/g, ''));

    if (userAns === correctAns || accepted.includes(userAns)) {
      correctPart3Count++;
    }
  });
  const part3Score = Math.round(correctPart3Count * 0.5 * 100) / 100;

  const totalScore = Math.min(10, Math.round((part1Score + part2Score + part3Score) * 100) / 100);

  let feedback = '';
  if (totalScore >= 9.0) {
    feedback = 'Xuất sắc! Bạn nắm rất vững kiến thức và kỹ năng giải toán theo ma trận 2025.';
  } else if (totalScore >= 8.0) {
    feedback = 'Giỏi! Khả năng tư duy toán học và xử lý bài toán thực tiễn rất tốt.';
  } else if (totalScore >= 6.5) {
    feedback = 'Khá! Bạn làm tốt phần trắc nghiệm căn bản, hãy rèn luyện thêm phần Đúng/Sai và Trả lời ngắn.';
  } else if (totalScore >= 5.0) {
    feedback = 'Trung bình. Cần ôn tập lại các công thức cốt lõi và kiểm tra kỹ các bước biến đổi.';
  } else {
    feedback = 'Chưa đạt. Hãy xem kỹ lời giải chi tiết bên dưới để nắm chắc phương pháp giải từng dạng bài.';
  }

  return {
    totalScore,
    maxScore: 10,
    part1Score,
    part2Score,
    part3Score,
    correctPart1Count,
    totalPart1Count: exam.part1Questions.length,
    correctPart2SubCount,
    totalPart2SubCount,
    correctPart3Count,
    totalPart3Count: exam.part3Questions.length,
    feedback,
  };
}
