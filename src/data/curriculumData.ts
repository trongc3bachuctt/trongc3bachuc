import { Chapter, GradeLevel } from '../types';

export const CURRICULUM_DATA: Record<GradeLevel, Chapter[]> = {
  '10': [
    {
      id: 'g10-c1',
      title: 'Chương I. Mệnh đề và tập hợp',
      grade: '10',
      lessons: [
        {
          id: 'g10-c1-l1',
          name: 'Bài 1. Mệnh đề toán học',
          typeCount: 15,
          chapterId: 'g10-c1',
          grade: '10',
          theoryContent: {
            summary:
              'Mệnh đề là một câu khẳng định có tính đúng hoặc sai (không thể vừa đúng vừa sai). Mệnh đề chứa biến P(x) trở thành mệnh đề khi thay x bởi một giá trị cụ thể trong tập xác định.',
            boxedFormulas: [
              'Phủ định: $\\overline{P}$ đúng khi $P$ sai, $\\overline{P}$ sai khi $P$ đúng.',
              'Mệnh đề kéo theo: $P \\Rightarrow Q$ chỉ sai khi $P$ đúng mà $Q$ sai.',
              'Mệnh đề tương đương: $P \\Leftrightarrow Q$ đúng khi $P$ và $Q$ có cùng chân trị (cùng đúng hoặc cùng sai).',
              'Lượng từ với mọi & tồn tại: Phủ định của $\\forall x \\in X, P(x)$ là $\\exists x \\in X, \\overline{P(x)}$. Phủ định của $\\exists x \\in X, P(x)$ là $\\forall x \\in X, \\overline{P(x)}$.',
              'Quy tắc phủ định dấu: Phủ định của ">" là "$\\le$", của "<" là "$\\ge$", của "=" là "$\\ne$".',
            ],
          },
          problemTypes: [
            {
              id: 't-10-1-1',
              title: 'Dạng 1: Nhận biết mệnh đề và mệnh đề chứa biến',
              description: 'Phân biệt khẳng định đúng/sai với câu hỏi, câu cảm thán, câu mệnh lệnh.',
              sampleQuestion: 'Trong các câu sau đây, câu nào là một mệnh đề toán học?',
              sampleOptions: [
                'A. Phương trình x² + 2x + 5 = 0 vô nghiệm trên ℝ.',
                'B. Toán học là một môn rất thú vị!',
                'C. Bạn đã làm bài tập về nhà chưa?',
                'D. Hãy giải phương trình này ngay đi!',
              ],
              correctAnswer: 'A',
              explanation:
                'Câu A là một khẳng định chắc chắn đúng (do biệt thức Δ = 2² - 4·1·5 = -16 < 0), nên là mệnh đề toán học. B là câu cảm, C là câu hỏi, D là câu mệnh lệnh.',
            },
            {
              id: 't-10-1-2',
              title: 'Dạng 2: Phủ định mệnh đề có chứa lượng từ ∀ và ∃',
              description: 'Đổi lượng từ ∀ thành ∃ (hoặc ngược lại) và phủ định biểu thức vị từ.',
              sampleQuestion: 'Mệnh đề phủ định của mệnh đề "∀x ∈ ℝ, x² - 4x + 5 > 0" là:',
              sampleOptions: [
                'A. ∃x ∈ ℝ, x² - 4x + 5 ≤ 0',
                'B. ∃x ∈ ℝ, x² - 4x + 5 < 0',
                'C. ∀x ∈ ℝ, x² - 4x + 5 ≤ 0',
                'D. ∃x ∉ ℝ, x² - 4x + 5 ≤ 0',
              ],
              correctAnswer: 'A',
              explanation:
                'Quy tắc: Phủ định của "∀x ∈ X, P(x)" là "∃x ∈ X, P̄(x)". Phủ định của ">" là "≤". Do đó đáp án là A.',
            },
            {
              id: 't-10-1-3',
              title: 'Dạng 3: Mệnh đề đảo và điều kiện cần, điều kiện đủ',
              description: 'Xác định quan hệ P là điều kiện đủ để có Q, Q là điều kiện cần để có P.',
              sampleQuestion: 'Cho định lý: "Nếu tam giác ABC đều thì tam giác ABC cân". Khẳng định nào sau đây là đúng?',
              sampleOptions: [
                'A. Tam giác ABC đều là điều kiện đủ để tam giác ABC cân.',
                'B. Tam giác ABC cân là điều kiện đủ để tam giác ABC đều.',
                'C. Tam giác ABC đều là điều kiện cần để tam giác ABC cân.',
                'D. Hai mệnh đề trên là tương đương.',
              ],
              correctAnswer: 'A',
              explanation:
                'Trong mệnh đề P ⇒ Q, P được gọi là điều kiện đủ để có Q; Q được gọi là điều kiện cần để có P. Vì tam giác đều kéo theo cân, nên tam giác đều là điều kiện đủ.',
            },
          ],
        },
        {
          id: 'g10-c1-l2',
          name: 'Bài 2. Tập hợp và các phép toán trên tập hợp',
          typeCount: 15,
          chapterId: 'g10-c1',
          grade: '10',
          theoryContent: {
            summary:
              'Tập hợp là khái niệm cơ bản của toán học. Biểu diễn tập hợp bằng cách liệt kê phần tử hoặc nêu tính chất đặc trưng. Các phép toán giao, hợp, hiệu và phần bù trên tập hợp số thực.',
            boxedFormulas: [
              'Giao của hai tập hợp: $A \\cap B = \\{x \\mid x \\in A \\text{ và } x \\in B\\}$',
              'Hợp của hai tập hợp: $A \\cup B = \\{x \\mid x \\in A \\text{ hoặc } x \\in B\\}$',
              'Hiệu của hai tập hợp: $A \\setminus B = \\{x \\mid x \\in A \\text{ và } x \\notin B\\}$',
              'Phần bù: Khi $A \\subset E$, thì $C_E A = E \\setminus A$. Số phần tử: $n(A \\cup B) = n(A) + n(B) - n(A \\cap B)$.',
            ],
          },
          problemTypes: [
            {
              id: 't-10-1-4',
              title: 'Dạng 1: Các phép toán giao, hợp, hiệu trên tập số thực',
              description: 'Xác định các khoảng, đoạn, nửa khoảng trên trục số.',
              sampleQuestion: 'Cho A = [-3; 2] và B = (0; 5). Tập hợp A ∩ B là:',
              sampleOptions: ['A. (0; 2]', 'B. [-3; 5)', 'C. [0; 2]', 'D. (-3; 0)'],
              correctAnswer: 'A',
              explanation: 'Giao là tập các số x vừa thuộc A vừa thuộc B: -3 ≤ x ≤ 2 và 0 < x < 5 ⇔ 0 < x ≤ 2, tức là nửa khoảng (0; 2].',
            },
            {
              id: 't-10-1-5',
              title: 'Dạng 2: Bài toán thực tế sử dụng biểu đồ Ven',
              description: 'Áp dụng công thức số phần tử n(A ∪ B) = n(A) + n(B) - n(A ∩ B).',
              sampleQuestion: 'Lớp 10A có 25 học sinh thích môn Toán, 20 học sinh thích môn Văn, 10 học sinh thích cả hai môn. Số học sinh thích ít nhất một trong hai môn là:',
              sampleOptions: ['A. 35', 'B. 45', 'C. 55', 'D. 30'],
              correctAnswer: 'A',
              explanation: 'Số học sinh thích ít nhất một môn: n(T ∪ V) = n(T) + n(V) - n(T ∩ V) = 25 + 20 - 10 = 35 học sinh.',
            },
          ],
        },
      ],
    },
    {
      id: 'g10-c2',
      title: 'Chương II. Bất phương trình và hệ bất phương trình bậc nhất hai ẩn',
      grade: '10',
      lessons: [
        {
          id: 'g10-c2-l1',
          name: 'Bài 3. Bất phương trình bậc nhất hai ẩn',
          typeCount: 12,
          chapterId: 'g10-c2',
          grade: '10',
          theoryContent: {
            summary:
              'Bất phương trình bậc nhất hai ẩn có dạng ax + by + c > 0 (hoặc ≥, <, ≤) với a, b không đồng thời bằng 0. Miền nghiệm là nửa mặt phẳng bờ d: ax + by + c = 0.',
            boxedFormulas: [
              'Dạng tổng quát: $ax + by + c \\le 0$ với $a^2 + b^2 \\ne 0$.',
              'Phương pháp biểu diễn miền nghiệm: Vẽ đường thẳng bờ $d: ax + by + c = 0$. Chọn điểm thử $O(0, 0)$ nếu $c \\ne 0$ để xét dấu.',
            ],
          },
          problemTypes: [
            {
              id: 't-10-2-1',
              title: 'Dạng 1: Điểm thuộc miền nghiệm của bất phương trình',
              description: 'Thay toạ độ điểm vào bất phương trình để xác định nghiệm.',
              sampleQuestion: 'Điểm nào sau đây thuộc miền nghiệm của bất phương trình 3x - 2y + 4 > 0?',
              sampleOptions: ['A. (0, 0)', 'B. (-2, 0)', 'C. (-1, 2)', 'D. (0, 3)'],
              correctAnswer: 'A',
              explanation: 'Thay (0, 0): 3(0) - 2(0) + 4 = 4 > 0 (thoả mãn). Do đó (0, 0) thuộc miền nghiệm.',
            },
          ],
        },
        {
          id: 'g10-c2-l2',
          name: 'Bài 4. Hệ bất phương trình bậc nhất hai ẩn & Bài toán tối ưu',
          typeCount: 15,
          chapterId: 'g10-c2',
          grade: '10',
          theoryContent: {
            summary:
              'Hệ bất phương trình gồm hai hay nhiều bất phương trình bậc nhất hai ẩn. Miền nghiệm là phần giao của các miền nghiệm thành phần (thường là miền đa giác).',
            boxedFormulas: [
              'Giá trị lớn nhất và nhỏ nhất của hàm mục tiêu $F(x, y) = ax + by$ trên miền đa giác lồi luôn đạt tại một trong các đỉnh của đa giác đó.',
            ],
          },
          problemTypes: [
            {
              id: 't-10-2-2',
              title: 'Dạng 1: Tìm giá trị lớn nhất, nhỏ nhất của biểu thức F(x, y)',
              description: 'Tìm toạ độ các đỉnh của miền nghiệm đa giác và so sánh giá trị.',
              sampleQuestion: 'Biết miền nghiệm là tam giác có các đỉnh O(0, 0), A(0, 4), B(3, 0). Giá trị lớn nhất của F(x, y) = 2x + 3y là:',
              sampleOptions: ['A. 12', 'B. 6', 'C. 0', 'D. 18'],
              correctAnswer: 'A',
              explanation: 'F(0, 0) = 0; F(3, 0) = 2·3 + 0 = 6; F(0, 4) = 0 + 3·4 = 12. Vậy giá trị lớn nhất là 12 tại điểm A(0, 4).',
            },
          ],
        },
      ],
    },
    {
      id: 'g10-c3',
      title: 'Chương III. Hệ thức lượng trong tam giác',
      grade: '10',
      lessons: [
        {
          id: 'g10-c3-l1',
          name: 'Bài 5. Giá trị lượng giác của một góc từ 0° đến 180°',
          typeCount: 14,
          chapterId: 'g10-c3',
          grade: '10',
          theoryContent: {
            summary:
              'Mở rộng khái niệm lượng giác cho góc từ 0° đến 180° trên nửa đường tròn đơn vị. Điểm M(x₀, y₀) có hoành độ là cos α và tung độ là sin α.',
            boxedFormulas: [
              'Quan hệ góc bù: $\\sin(180^\\circ - \\alpha) = \\sin\\alpha, \\cos(180^\\circ - \\alpha) = -\\cos\\alpha$',
              'Đẳng thức cơ bản: $\\sin^2\\alpha + \\cos^2\\alpha = 1, 1 + \\tan^2\\alpha = \\frac{1}{\\cos^2\\alpha} (\\alpha \\ne 90^\\circ)$',
            ],
          },
          problemTypes: [
            {
              id: 't-10-3-1',
              title: 'Dạng 1: Tính giá trị lượng giác của góc bù nhau',
              description: 'Áp dụng sin(180° - α) = sin α và cos(180° - α) = -cos α.',
              sampleQuestion: 'Giá trị của biểu thức P = sin(30°) + cos(150°) là:',
              sampleOptions: ['A. 1/2 - √3/2', 'B. 1/2 + √3/2', 'C. -1/2', 'D. √3/2'],
              correctAnswer: 'A',
              explanation: 'sin(30°) = 1/2. cos(150°) = cos(180° - 30°) = -cos(30°) = -√3/2. Do đó P = 1/2 - √3/2.',
            },
          ],
        },
        {
          id: 'g10-c3-l2',
          name: 'Bài 6. Định lý côsin, định lý sin và công thức diện tích',
          typeCount: 16,
          chapterId: 'g10-c3',
          grade: '10',
          theoryContent: {
            summary:
              'Giải tam giác: Tính các cạnh và góc còn lại khi biết một số yếu tố ban đầu. Công thức diện tích tam giác liên hệ các cạnh và bán kính đường tròn ngoại tiếp, nội tiếp.',
            boxedFormulas: [
              'Định lý Côsin: $a^2 = b^2 + c^2 - 2bc \\cos A, \\cos A = \\frac{b^2 + c^2 - a^2}{2bc}$',
              'Định lý Sin: $\\frac{a}{\\sin A} = \\frac{b}{\\sin B} = \\frac{c}{\\sin C} = 2R$',
              'Công thức Heron: $S = \\sqrt{p(p-a)(p-b)(p-c)}$ với nửa chu vi $p = \\frac{a+b+c}{2}$',
              'Diện tích qua bán kính: $S = \\frac{abc}{4R} = pr$',
            ],
          },
          problemTypes: [
            {
              id: 't-10-3-2',
              title: 'Dạng 1: Tính cạnh thứ ba nhờ định lý Côsin',
              description: 'Biết hai cạnh b, c và góc xen giữa A.',
              sampleQuestion: 'Cho tam giác ABC có b = 5, c = 8, góc A = 60°. Độ dài cạnh a là:',
              sampleOptions: ['A. 7', 'B. √89', 'C. 6.5', 'D. 9'],
              correctAnswer: 'A',
              explanation: 'a² = b² + c² - 2bc cos A = 25 + 64 - 2·5·8·(1/2) = 89 - 40 = 49. Suy ra a = 7.',
            },
          ],
        },
      ],
    },
    {
      id: 'g10-c6',
      title: 'Chương VI. Hàm số, đồ thị và ứng dụng',
      grade: '10',
      lessons: [
        {
          id: 'g10-c6-l1',
          name: 'Bài 15. Hàm số bậc hai',
          typeCount: 16,
          chapterId: 'g10-c6',
          grade: '10',
          theoryContent: {
            summary:
              'Hàm số bậc hai y = ax² + bx + c (a ≠ 0) có đồ thị là một parabol có đỉnh I(-b/(2a); -Δ/(4a)), trục đối xứng x = -b/(2a). Bề lõm hướng lên nếu a > 0, hướng xuống nếu a < 0.',
            boxedFormulas: [
              'Toạ độ đỉnh: $I\\left(-\\frac{b}{2a}; -\\frac{\\Delta}{4a}\\right)$, trục đối xứng $x = -\\frac{b}{2a}$',
              'Khoảng đơn điệu ($a > 0$): nghịch biến trên $(-\\infty; -b/(2a))$, đồng biến trên $(-b/(2a); +\\infty)$.',
            ],
            diagramType: 'quadratic_curve',
          },
          problemTypes: [
            {
              id: 't-10-6-1',
              title: 'Dạng 1: Tìm toạ độ đỉnh và trục đối xứng của parabol',
              description: 'Áp dụng công thức x_I = -b/(2a).',
              sampleQuestion: 'Trục đối xứng của parabol y = 2x² - 4x + 3 là đường thẳng:',
              sampleOptions: ['A. x = 1', 'B. x = -1', 'C. x = 2', 'D. y = 1'],
              correctAnswer: 'A',
              explanation: 'Trục đối xứng là x = -b/(2a) = -(-4)/(2·2) = 4/4 = 1.',
            },
          ],
        },
        {
          id: 'g10-c6-l2',
          name: 'Bài 17. Dấu của tam thức bậc hai',
          typeCount: 15,
          chapterId: 'g10-c6',
          grade: '10',
          theoryContent: {
            summary:
              'Tam thức bậc hai f(x) = ax² + bx + c (a ≠ 0). Quy tắc xét dấu: Nếu Δ < 0, f(x) luôn cùng dấu với a với mọi x; Nếu Δ = 0, f(x) cùng dấu với a trừ khi x = -b/(2a); Nếu Δ > 0, f(x) "trong trái ngoài cùng" so với hai nghiệm.',
            boxedFormulas: [
              '$\\Delta < 0 \\Rightarrow a \\cdot f(x) > 0, \\forall x \\in \\mathbb{R}$',
              '$\\Delta > 0 \\Rightarrow f(x)$ cùng dấu với $a$ khi $x \\in (-\\infty; x_1) \\cup (x_2; +\\infty)$, trái dấu với $a$ khi $x \\in (x_1; x_2)$.',
            ],
          },
          problemTypes: [
            {
              id: 't-10-6-2',
              title: 'Dạng 1: Giải bất phương trình bậc hai một ẩn',
              description: 'Xét dấu tam thức bậc hai.',
              sampleQuestion: 'Tập nghiệm của bất phương trình x² - 5x + 6 < 0 là:',
              sampleOptions: ['A. (2; 3)', 'B. (-∞; 2) ∪ (3; +∞)', 'C. [2; 3]', 'D. (-3; -2)'],
              correctAnswer: 'A',
              explanation: 'Nghiệm của x² - 5x + 6 = 0 là x = 2 và x = 3. Hệ số a = 1 > 0, bất phương trình mang dấu âm ("trong trái") nên tập nghiệm là (2; 3).',
            },
          ],
        },
      ],
    },
  ],

  '11': [
    {
      id: 'g11-c1',
      title: 'Chương I. Hàm số lượng giác và phương trình lượng giác',
      grade: '11',
      lessons: [
        {
          id: 'g11-c1-l1',
          name: 'Bài 1. Giá trị lượng giác của góc lượng giác',
          typeCount: 15,
          chapterId: 'g11-c1',
          grade: '11',
          theoryContent: {
            summary:
              'Đơn vị đo góc: 1 rad = (180/π)°, 1° = (π/180) rad. Điểm biểu diễn góc α trên đường tròn lượng giác có toạ độ M(cos α, sin α). Các tính chất tuần hoàn và cung liên kết.',
            boxedFormulas: [
              'Tuần hoàn: $\\sin(\\alpha + k2\\pi) = \\sin\\alpha, \\cos(\\alpha + k2\\pi) = \\cos\\alpha, \\tan(\\alpha + k\\pi) = \\tan\\alpha$',
              'Cung đối: $\\cos(-\\alpha) = \\cos\\alpha, \\sin(-\\alpha) = -\\sin\\alpha$',
              'Cung bù: $\\sin(\\pi - \\alpha) = \\sin\\alpha, \\cos(\\pi - \\alpha) = -\\cos\\alpha$',
              'Cung phụ: $\\sin\\left(\\frac{\\pi}{2} - \\alpha\\right) = \\cos\\alpha, \\cos\\left(\\frac{\\pi}{2} - \\alpha\\right) = \\sin\\alpha$',
            ],
            diagramType: 'trig_circle',
          },
          problemTypes: [
            {
              id: 't-11-1-1',
              title: 'Dạng 1: Đổi đơn vị đo góc giữa độ và radian',
              description: 'Áp dụng công thức a rad = a · (180/π)°.',
              sampleQuestion: 'Góc 120° đổi sang radian bằng:',
              sampleOptions: ['A. 2π/3', 'B. 3π/4', 'C. 5π/6', 'D. π/3'],
              correctAnswer: 'A',
              explanation: '120° = 120 · (π/180) = 2π/3 rad.',
            },
            {
              id: 't-11-1-2',
              title: 'Dạng 2: Tính giá trị lượng giác khi biết một giá trị',
              description: 'Áp dụng hệ thức sin²α + cos²α = 1 kết hợp dấu góc phần tư.',
              sampleQuestion: 'Cho cos α = -3/5 với π < α < 3π/2. Giá trị của sin α là:',
              sampleOptions: ['A. -4/5', 'B. 4/5', 'C. -3/4', 'D. 3/4'],
              correctAnswer: 'A',
              explanation: 'Vì π < α < 3π/2 (góc phần tư thứ III), sin α mang dấu âm. Do đó sin α = -√(1 - cos²α) = -√(1 - 9/25) = -4/5.',
            },
          ],
        },
        {
          id: 'g11-c1-l4',
          name: 'Bài 4. Phương trình lượng giác cơ bản',
          typeCount: 15,
          chapterId: 'g11-c1',
          grade: '11',
          theoryContent: {
            summary:
              'Công thức nghiệm của các phương trình lượng giác cơ bản sin x = m, cos x = m, tan x = m, cot x = m.',
            boxedFormulas: [
              '$\\sin u = \\sin v \\Leftrightarrow u = v + k2\\pi$ hoặc $u = \\pi - v + k2\\pi (k \\in \\mathbb{Z})$',
              '$\\cos u = \\cos v \\Leftrightarrow u = \\pm v + k2\\pi (k \\in \\mathbb{Z})$',
              '$\\tan u = \\tan v \\Leftrightarrow u = v + k\\pi (k \\in \\mathbb{Z})$',
            ],
          },
          problemTypes: [
            {
              id: 't-11-1-4',
              title: 'Dạng 1: Giải phương trình sin x = m và cos x = m',
              description: 'Áp dụng công thức họ nghiệm chuẩn.',
              sampleQuestion: 'Nghiệm của phương trình cos x = 1/2 là:',
              sampleOptions: [
                'A. x = ±π/3 + k2π (k ∈ ℤ)',
                'B. x = ±π/6 + k2π (k ∈ ℤ)',
                'C. x = π/3 + kπ (k ∈ ℤ)',
                'D. x = ±2π/3 + k2π (k ∈ ℤ)',
              ],
              correctAnswer: 'A',
              explanation: 'Vì 1/2 = cos(π/3), nên cos x = cos(π/3) ⇔ x = ±π/3 + k2π (k ∈ ℤ).',
            },
          ],
        },
      ],
    },
    {
      id: 'g11-c2',
      title: 'Chương II. Dãy số. Cấp số cộng và cấp số nhân',
      grade: '11',
      lessons: [
        {
          id: 'g11-c2-l2',
          name: 'Bài 6. Cấp số cộng và cấp số nhân',
          typeCount: 16,
          chapterId: 'g11-c2',
          grade: '11',
          theoryContent: {
            summary:
              'Cấp số cộng có hiệu hai số hạng liên tiếp không đổi d. Cấp số nhân có thương hai số hạng liên tiếp không đổi q.',
            boxedFormulas: [
              'Cấp số cộng: $u_n = u_1 + (n - 1)d, S_n = \\frac{n(u_1 + u_n)}{2} = \\frac{n[2u_1 + (n - 1)d]}{2}$',
              'Cấp số nhân: $u_n = u_1 \\cdot q^{n - 1}, S_n = \\frac{u_1(1 - q^n)}{1 - q} (q \\ne 1)$',
            ],
          },
          problemTypes: [
            {
              id: 't-11-2-2',
              title: 'Dạng 1: Tìm số hạng và công sai của cấp số cộng',
              description: 'Thiết lập hệ phương trình theo u1 và d.',
              sampleQuestion: 'Cấp số cộng có u1 = 2 và công sai d = 5. Số hạng thứ 8 bằng:',
              sampleOptions: ['A. 37', 'B. 42', 'C. 35', 'D. 40'],
              correctAnswer: 'A',
              explanation: 'u₈ = u₁ + 7d = 2 + 7·5 = 2 + 35 = 37.',
            },
          ],
        },
      ],
    },
    {
      id: 'g11-c9',
      title: 'Chương IX. Đạo hàm',
      grade: '11',
      lessons: [
        {
          id: 'g11-c9-l1',
          name: 'Bài 31. Định nghĩa và ý nghĩa của đạo hàm',
          typeCount: 16,
          chapterId: 'g11-c9',
          grade: '11',
          theoryContent: {
            summary:
              'Đạo hàm f\'(x₀) là giới hạn của tỉ số số gia hàm số trên số gia đối số. Ý nghĩa hình học: Hệ số góc của tiếp tuyến k = f\'(x₀). Ý nghĩa vật lý: Vận tốc tức thời v(t) = s\'(t), gia tốc a(t) = v\'(t).',
            boxedFormulas: [
              'Ý nghĩa hình học: Tiếp tuyến tại $M(x_0, y_0)$ có PT: $y = f\'(x_0)(x - x_0) + y_0$',
              'Ý nghĩa vật lý: $v(t) = s\'(t), a(t) = v\'(t) = s\'\'(t)$',
            ],
          },
          problemTypes: [
            {
              id: 't-11-9-1',
              title: 'Dạng 1: Viết phương trình tiếp tuyến của đồ thị hàm số',
              description: 'Tính f\'(x0) và áp dụng công thức y = f\'(x0)(x - x0) + y0.',
              sampleQuestion: 'Tiếp tuyến của đồ thị y = x² - 3x + 2 tại điểm có hoành độ x₀ = 2 có hệ số góc là:',
              sampleOptions: ['A. 1', 'B. -1', 'C. 2', 'D. 0'],
              correctAnswer: 'A',
              explanation: 'y\' = 2x - 3. Tại x₀ = 2, hệ số góc k = y\'(2) = 2·2 - 3 = 1.',
            },
          ],
        },
      ],
    },
  ],

  '12': [
    {
      id: 'g12-c1',
      title: 'Chương I. Ứng dụng đạo hàm để khảo sát và vẽ đồ thị hàm số',
      grade: '12',
      lessons: [
        {
          id: 'g12-c1-l1',
          name: 'Bài 1. Tính đơn điệu và cực trị của hàm số',
          typeCount: 18,
          chapterId: 'g12-c1',
          grade: '12',
          theoryContent: {
            summary:
              'Định lý mở rộng về tính đơn điệu: f\'(x) ≥ 0 trên K (và f\'(x) = 0 chỉ tại hữu hạn điểm) ⇒ f đồng biến trên K. Điểm cực trị là điểm f\'(x) đổi dấu khi đi qua nó.',
            boxedFormulas: [
              '$f\'(x) > 0$ trên $K \\Rightarrow f$ đồng biến; $f\'(x) < 0$ trên $K \\Rightarrow f$ nghịch biến.',
              '$f\'(x_0) = 0$ và $f\'\'(x_0) > 0 \\Rightarrow x_0$ là điểm cực tiểu.',
              '$f\'(x_0) = 0$ và $f\'\'(x_0) < 0 \\Rightarrow x_0$ là điểm cực đại.',
            ],
            diagramType: 'variation_table',
            variationTableData: {
              x: ['-∞', '-1', '1', '+∞'],
              yPrime: ['+', '0', '-', '0', '+'],
              y: [
                { val: '-∞' },
                { val: '2', arrow: 'up' },
                { val: '-2', arrow: 'down' },
                { val: '+∞', arrow: 'up' },
              ],
            },
          },
          problemTypes: [
            {
              id: 't-12-1-1',
              title: 'Dạng 1: Tìm khoảng đơn điệu của hàm số đa thức bậc ba',
              description: 'Tính y\' và lập bảng xét dấu.',
              sampleQuestion: 'Hàm số y = x³ - 3x + 1 nghịch biến trên khoảng nào?',
              sampleOptions: ['A. (-1; 1)', 'B. (-∞; -1)', 'C. (1; +∞)', 'D. (-∞; 1)'],
              correctAnswer: 'A',
              explanation:
                'y\' = 3x² - 3 = 0 ⇔ x = ±1. Trong khoảng hai nghiệm (-1; 1), y\' < 0 nên hàm số nghịch biến.',
            },
            {
              id: 't-12-1-2',
              title: 'Dạng 2: Tìm toạ độ điểm cực trị của đồ thị hàm số',
              description: 'Xác định cả hoành độ và tung độ cực trị.',
              sampleQuestion: 'Điểm cực đại của đồ thị hàm số y = -x³ + 3x là:',
              sampleOptions: ['A. (1, 2)', 'B. (-1, -2)', 'C. (0, 0)', 'D. (2, -2)'],
              correctAnswer: 'A',
              explanation:
                'y\' = -3x² + 3. y\' = 0 ⇔ x = ±1. Qua x = 1, y\' đổi dấu từ dương sang âm, đạt cực đại tại x = 1, y(1) = 2. Toạ độ điểm cực đại là (1, 2).',
            },
          ],
        },
        {
          id: 'g12-c1-l2',
          name: 'Bài 2. Giá trị lớn nhất và giá trị nhỏ nhất của hàm số',
          typeCount: 15,
          chapterId: 'g12-c1',
          grade: '12',
          theoryContent: {
            summary:
              'Quy tắc tìm GTLN, GTNN trên đoạn [a; b]: Tính f\'(x), tìm các nghiệm x_i thuộc khoảng (a; b), tính các giá trị f(a), f(b), f(x_i) rồi kết luận giá trị lớn nhất M và nhỏ nhất m.',
            boxedFormulas: [
              'Quy tắc trên $[a; b]$: Tính $f(a), f(b)$ và các $f(x_i)$ tại đó $f\'(x_i) = 0$.',
              '$\\max_{[a; b]} f(x) = \\max\\{f(a), f(b), f(x_i)\\}$, $\\min_{[a; b]} f(x) = \\min\\{f(a), f(b), f(x_i)\\}$',
            ],
          },
          problemTypes: [
            {
              id: 't-12-1-3',
              title: 'Dạng 1: Tìm GTLN, GTNN của hàm số trên đoạn',
              description: 'Áp dụng quy tắc so sánh giá trị.',
              sampleQuestion: 'Giá trị nhỏ nhất của hàm số f(x) = x³ - 3x + 5 trên đoạn [0; 2] là:',
              sampleOptions: ['A. 3', 'B. 5', 'C. 7', 'D. 2'],
              correctAnswer: 'A',
              explanation:
                'f\'(x) = 3x² - 3 = 0 ⇔ x = 1 ∈ (0; 2). Tính: f(0) = 5, f(1) = 1 - 3 + 5 = 3, f(2) = 8 - 6 + 5 = 7. GTNN là 3 tại x = 1.',
            },
          ],
        },
        {
          id: 'g12-c1-l3',
          name: 'Bài 3. Đường tiệm cận của đồ thị hàm số',
          typeCount: 15,
          chapterId: 'g12-c1',
          grade: '12',
          theoryContent: {
            summary:
              'Tiệm cận đứng x = x₀ nếu ít nhất một giới hạn một bên lim (x → x₀^±) y = ±∞. Tiệm cận ngang y = y₀ nếu lim (x → ±∞) y = y₀. Tiệm cận xiên y = ax + b nếu lim (x → ±∞) [y - (ax + b)] = 0.',
            boxedFormulas: [
              'TCĐ: $\\lim_{x \\to x_0^+} y = \\pm\\infty$ hoặc $\\lim_{x \\to x_0^-} y = \\pm\\infty \\Rightarrow x = x_0$',
              'TCN: $\\lim_{x \\to +\\infty} y = y_0$ hoặc $\\lim_{x \\to -\\infty} y = y_0 \\Rightarrow y = y_0$',
              'Hàm nhất biến $y = \\frac{ax + b}{cx + d} (c \\ne 0)$: TCĐ $x = -\\frac{d}{c}$, TCN $y = \\frac{a}{c}$',
            ],
            diagramType: 'rational_curve',
          },
          problemTypes: [
            {
              id: 't-12-1-4',
              title: 'Dạng 1: Xác định tiệm cận đứng và ngang của hàm nhất biến',
              description: 'Nghiệm mẫu số là TCĐ, tỉ số hệ số bậc nhất là TCN.',
              sampleQuestion: 'Đồ thị hàm số y = (3x - 1)/(x + 2) có tiệm cận đứng và ngang là:',
              sampleOptions: [
                'A. x = -2 và y = 3',
                'B. x = 2 và y = 3',
                'C. x = -2 và y = -1/2',
                'D. x = 3 và y = -2',
              ],
              correctAnswer: 'A',
              explanation: 'Mẫu số x + 2 = 0 ⇔ x = -2 là TCĐ. Bậc tử bằng bậc mẫu, TCN y = 3/1 = 3.',
            },
          ],
        },
        {
          id: 'g12-c1-l5',
          name: 'Bài 5. Ứng dụng đạo hàm giải quyết vấn đề thực tiễn',
          typeCount: 15,
          chapterId: 'g12-c1',
          grade: '12',
          theoryContent: {
            summary:
              'Mô hình hoá bài toán thực tiễn: Lập hàm mục tiêu f(x) trên khoảng xác định. Tìm điểm cực trị hoặc GTLN/GTNN để tối ưu hoá chi phí, diện tích, thể tích hoặc lợi nhuận.',
            boxedFormulas: [
              'Bước 1: Chọn ẩn số $x$ và tìm miền xác định $D$.',
              'Bước 2: Biểu diễn đại lượng cần tối ưu qua hàm số $y = f(x)$.',
              'Bước 3: Khảo sát hàm số $f(x)$ trên $D$ để tìm điểm tối ưu.',
            ],
          },
          problemTypes: [
            {
              id: 't-12-1-5',
              title: 'Dạng 1: Tối ưu hoá thể tích hình hộp',
              description: 'Cắt 4 góc miếng tôn vuông cạnh L rồi gập lại làm hộp không nắp.',
              sampleQuestion: 'Từ tấm tôn vuông cạnh 60 cm, cắt 4 góc các hình vuông cạnh x rồi gập lại làm hộp. Thể tích lớn nhất khi x bằng:',
              sampleOptions: ['A. 10 cm', 'B. 15 cm', 'C. 12 cm', 'D. 20 cm'],
              correctAnswer: 'A',
              explanation: 'V(x) = x(60 - 2x)². V\'(x) = 4(30 - x)(30 - 3x) = 0 ⇔ x = 10 cm (do 0 < x < 30).',
            },
          ],
        },
      ],
    },
    {
      id: 'g12-c2',
      title: 'Chương II. Vectơ và toạ độ trong không gian Oxyz',
      grade: '12',
      lessons: [
        {
          id: 'g12-c2-l1',
          name: 'Bài 6. Vectơ và hệ toạ độ trong không gian',
          typeCount: 15,
          chapterId: 'g12-c2',
          grade: '12',
          theoryContent: {
            summary:
              'Không gian Oxyz gồm 3 trục vuông góc từng đôi một Ox, Oy, Oz. Vectơ đơn vị i, j, k. Toạ độ điểm M(x, y, z) và vectơ u(x, y, z).',
            boxedFormulas: [
              'Độ dài vectơ: $|\\vec{u}| = \\sqrt{x^2 + y^2 + z^2}$',
              'Tích vô hướng: $\\vec{u} \\cdot \\vec{v} = x_1 x_2 + y_1 y_2 + z_1 z_2$',
              'Khoảng cách: $AB = \\sqrt{(x_B - x_A)^2 + (y_B - y_A)^2 + (z_B - z_A)^2}$',
            ],
          },
          problemTypes: [
            {
              id: 't-12-2-1',
              title: 'Dạng 1: Tính độ dài đoạn thẳng và tích vô hướng',
              description: 'Áp dụng công thức toạ độ Oxyz.',
              sampleQuestion: 'Trong không gian Oxyz, khoảng cách giữa A(1, 2, -1) và B(3, 0, 1) là:',
              sampleOptions: ['A. 2√3', 'B. √12', 'C. 4', 'D. 2√2'],
              correctAnswer: 'A',
              explanation: 'AB = √[(3 - 1)² + (0 - 2)² + (1 - (-1))²] = √[4 + 4 + 4] = √12 = 2√3.',
            },
          ],
        },
      ],
    },
    {
      id: 'g12-c4',
      title: 'Chương IV. Nguyên hàm và tích phân',
      grade: '12',
      lessons: [
        {
          id: 'g12-c4-l1',
          name: 'Bài 11. Nguyên hàm',
          typeCount: 16,
          chapterId: 'g12-c4',
          grade: '12',
          theoryContent: {
            summary:
              'Hàm số F(x) là nguyên hàm của f(x) trên K nếu F\'(x) = f(x). Mọi nguyên hàm có dạng F(x) + C. Các phương pháp đổi biến số và từng phần.',
            boxedFormulas: [
              '$\\int x^n dx = \\frac{x^{n+1}}{n+1} + C (n \\ne -1)$',
              '$\\int \\frac{1}{x} dx = \\ln|x| + C, \\int e^x dx = e^x + C$',
              '$\\int \\sin x dx = -\\cos x + C, \\int \\cos x dx = \\sin x + C$',
              'Nguyên hàm từng phần: $\\int u dv = u v - \\int v du$',
            ],
          },
          problemTypes: [
            {
              id: 't-12-4-1',
              title: 'Dạng 1: Tìm nguyên hàm cơ bản của hàm số sơ cấp',
              description: 'Áp dụng bảng nguyên hàm.',
              sampleQuestion: 'Họ nguyên hàm của hàm số f(x) = 4x³ + 2x là:',
              sampleOptions: ['A. x⁴ + x² + C', 'B. 12x² + 2 + C', 'C. 4x⁴ + 2x² + C', 'D. x⁴ + 2x² + C'],
              correctAnswer: 'A',
              explanation: '∫ (4x³ + 2x) dx = 4(x⁴/4) + 2(x²/2) + C = x⁴ + x² + C.',
            },
          ],
        },
      ],
    },
  ],
};
