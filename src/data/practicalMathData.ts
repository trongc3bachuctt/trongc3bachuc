import { PracticalProblem } from '../types';

export const PRACTICAL_PROBLEMS: PracticalProblem[] = [
  {
    id: 'prac-1',
    grade: '11',
    title: 'Vận tốc tức thời vật rơi tự do',
    context: 'Vật lý & Cơ học cổ điển',
    type: 'multiple_choice',
    difficulty: 'Thông hiểu',
    curriculumLink: 'Toán 11 – Bài 31. Định nghĩa và ý nghĩa của đạo hàm',
    generate: () => {
      // s(t) = 4.9 * t^2. Random t from 2 to 6
      const t = Math.floor(Math.random() * 5) + 2; // e.g. 2, 3, 4, 5, 6
      const v = 9.8 * t;
      const vRounded = Math.round(v * 10) / 10;
      const optA = (vRounded * 2).toFixed(1);
      const optB = vRounded.toFixed(1);
      const optC = (vRounded / 4).toFixed(1);
      const optD = (vRounded / 2).toFixed(1);

      return {
        question: `Một vật rơi tự do theo phương trình $s(t) = 4,9t^2$ (m). Vận tốc tức thời của vật tại thời điểm $t = ${t}\\text{ s}$ là:`,
        options: [
          { id: 'A', text: `${optA} m/s` },
          { id: 'B', text: `${optB} m/s` },
          { id: 'C', text: `${optC} m/s` },
          { id: 'D', text: `${optD} m/s` },
        ],
        correctAnswer: 'B',
        solutionSteps: [
          `Vận tốc tức thời của vật tại thời điểm $t$ chính là đạo hàm của hàm quãng đường theo thời gian: $v(t) = s'(t)$.`,
          `Tính đạo hàm: $s'(t) = (4,9t^2)' = 2 \\times 4,9 \\times t = 9,8t$ (m/s).`,
          `Thay thời điểm $t = ${t}\\text{ s}$ vào công thức vận tốc: $v(${t}) = 9,8 \\times ${t} = ${optB}\\text{ m/s}$.`,
          `Do đó đáp án chính xác là **B**.`,
        ],
      };
    },
  },
  {
    id: 'prac-2',
    grade: '10',
    title: 'Số sản phẩm để có lãi trong sản xuất',
    context: 'Kinh tế & Quản trị kinh doanh',
    type: 'multiple_choice',
    difficulty: 'Vận dụng',
    curriculumLink: 'Toán 10 – Bài 17. Dấu của tam thức bậc hai',
    generate: () => {
      // P(x) = -x^2 + (r1+r2)x - r1*r2. Let r1 = 11, r2 = 46 or similar
      const roots = [
        { r1: 11, r2: 46, sum: 57, prod: 506 },
        { r1: 15, r2: 50, sum: 65, prod: 750 },
        { r1: 10, r2: 40, sum: 50, prod: 400 },
        { r1: 12, r2: 48, sum: 60, prod: 576 },
      ];
      const r = roots[Math.floor(Math.random() * roots.length)];

      return {
        question: `Lợi nhuận (triệu đồng) khi bán $x$ sản phẩm của một xưởng mộc là $P(x) = -x^2 + ${r.sum}x - ${r.prod}$. Xưởng có lãi ($P(x) > 0$) khi số sản phẩm $x$ thoả mãn:`,
        options: [
          { id: 'A', text: `$x > ${r.r2}$` },
          { id: 'B', text: `$x < ${r.r1}$ hoặc $x > ${r.r2}$` },
          { id: 'C', text: `$x < ${r.r1}$` },
          { id: 'D', text: `$${r.r1} < x < ${r.r2}$` },
        ],
        correctAnswer: 'D',
        solutionSteps: [
          `Xưởng có lãi khi và chỉ khi hàm lợi nhuận dương, tức là: $P(x) > 0 \\Leftrightarrow -x^2 + ${r.sum}x - ${r.prod} > 0$.`,
          `Giải phương trình $-x^2 + ${r.sum}x - ${r.prod} = 0$, ta có hai nghiệm phân biệt $x_1 = ${r.r1}$ và $x_2 = ${r.r2}$.`,
          `Hệ số $a = -1 < 0$. Theo quy tắc xét dấu tam thức bậc hai "trong trái ngoài cùng", đa thức nhận dấu dương ở khoảng giữa hai nghiệm.`,
          `Suy ra: $${r.r1} < x < ${r.r2}$. Vậy đáp án đúng là **D**.`,
        ],
      };
    },
  },
  {
    id: 'prac-3',
    grade: '12',
    title: 'Thiết kế bồn chứa dầu hình trụ tối ưu chi phí kim loại',
    context: 'Kỹ thuật cơ khí & Tối ưu hoá',
    type: 'short_answer',
    difficulty: 'Vận dụng cao',
    curriculumLink: 'Toán 12 – Bài 5. Ứng dụng đạo hàm giải quyết vấn đề thực tiễn',
    generate: () => {
      // V = 54pi m^3. Min area when h = 2r. V = pi*r^2*(2r) = 2*pi*r^3 = 54pi => r^3 = 27 => r = 3, h = 6
      const choices = [
        { vCoeff: 54, rAns: 3, hAns: 6 },
        { vCoeff: 16, rAns: 2, hAns: 4 },
        { vCoeff: 128, rAns: 4, hAns: 8 },
      ];
      const c = choices[Math.floor(Math.random() * choices.length)];

      return {
        question: `Một công ty xăng dầu cần chế tạo một bồn chứa hình trụ có thể tích $V = ${c.vCoeff}\\pi\\text{ m}^3$ bằng thép. Để lượng thép làm vỏ bồn (diện tích toàn phần) là ít nhất, bán kính đáy $r$ (mét) của bồn chứa phải bằng bao nhiêu?`,
        correctAnswer: `${c.rAns}`,
        solutionSteps: [
          `Gọi bán kính đáy là $r$ ($r > 0$) và chiều cao là $h$ ($h > 0$). Thể tích hình trụ: $V = \\pi r^2 h = ${c.vCoeff}\\pi \\Rightarrow h = \\frac{${c.vCoeff}}{r^2}$.`,
          `Diện tích toàn phần của bồn: $S_{tp} = 2\\pi r^2 + 2\\pi rh = 2\\pi r^2 + 2\\pi r \\cdot \\frac{${c.vCoeff}}{r^2} = 2\\pi \\left(r^2 + \\frac{${c.vCoeff}}{r}\\right)$.`,
          `Khảo sát hàm số $f(r) = r^2 + \\frac{${c.vCoeff}}{r}$ với $r > 0$: $f'(r) = 2r - \\frac{${c.vCoeff}}{r^2} = \\frac{2r^3 - ${c.vCoeff}}{r^2}$.`,
          `Cho $f'(r) = 0 \\Leftrightarrow 2r^3 = ${c.vCoeff} \\Leftrightarrow r^3 = ${c.vCoeff / 2} \\Rightarrow r = ${c.rAns}\\text{ m}$.`,
          `Hàm số đạt giá trị nhỏ nhất tại $r = ${c.rAns}\\text{ m}$. Đáp số: **${c.rAns}**.`,
        ],
      };
    },
  },
  {
    id: 'prac-4',
    grade: '11',
    title: 'Tính số tiền nhận được khi gửi tiết kiệm ngân hàng lãi kép',
    context: 'Tài chính cá nhân',
    type: 'multiple_choice',
    difficulty: 'Thông hiểu',
    curriculumLink: 'Toán 11 – Bài 6. Cấp số nhân & Hàm số mũ',
    generate: () => {
      const deposits = [100, 200, 50]; // million VND
      const p = deposits[Math.floor(Math.random() * deposits.length)];
      const rate = 6; // 6%/year
      const years = 3;
      // S = P * (1 + 0.06)^3 = P * 1.191016
      const total = (p * Math.pow(1 + rate / 100, years)).toFixed(2);
      const wrong1 = (p * (1 + (rate * years) / 100)).toFixed(2); // Simple interest
      const wrong2 = (Number(total) + 15).toFixed(2);
      const wrong3 = (Number(total) - 8).toFixed(2);

      return {
        question: `Bác Ba gửi tiết kiệm $${p}$ triệu đồng vào ngân hàng với lãi suất $${rate}\\%$/năm theo hình thức lãi kép (tiền lãi hàng năm được nhập vào vốn). Sau $${years}$ năm, số tiền cả gốc lẫn lãi bác Ba nhận được là:`,
        options: [
          { id: 'A', text: `${total} triệu đồng` },
          { id: 'B', text: `${wrong1} triệu đồng` },
          { id: 'C', text: `${wrong2} triệu đồng` },
          { id: 'D', text: `${wrong3} triệu đồng` },
        ],
        correctAnswer: 'A',
        solutionSteps: [
          `Áp dụng công thức lãi kép: $T = P \\cdot (1 + r)^n$, trong đó:`,
          `$P = ${p}$ triệu đồng, lãi suất $r = ${rate}\\% = 0,06$, số kì hạn $n = ${years}$ năm.`,
          `Tính toán: $T = ${p} \\times (1 + 0,06)^3 = ${p} \\times 1,191016 \\approx ${total}$ triệu đồng.`,
          `Đáp án chính xác là **A**.`,
        ],
      };
    },
  },
  {
    id: 'prac-5',
    grade: '10',
    title: 'Đo khoảng cách từ bờ đến một hòn đảo bằng giác kế',
    context: 'Trắc địa & Đo đạc thực địa',
    type: 'multiple_choice',
    difficulty: 'Vận dụng',
    curriculumLink: 'Toán 10 – Bài 6. Hệ thức lượng trong tam giác',
    generate: () => {
      return {
        question: `Để đo khoảng cách từ một điểm $A$ trên bờ đến chân tháp hải đăng $C$ ngoài biển, người ta chọn một điểm $B$ cùng trên bờ cách $A$ một khoảng $AB = 500\\text{ m}$. Dùng giác kế đo được góc $\\widehat{CAB} = 65^\\circ$ và $\\widehat{CBA} = 75^\\circ$. Khoảng cách từ $A$ đến $C$ gần nhất với giá trị nào?`,
        options: [
          { id: 'A', text: '751,8 m' },
          { id: 'B', text: '685,4 m' },
          { id: 'C', text: '812,0 m' },
          { id: 'D', text: '592,3 m' },
        ],
        correctAnswer: 'A',
        solutionSteps: [
          `Trong tam giác $ABC$, tổng ba góc bằng $180^\\circ$. Do đó: $\\widehat{ACB} = 180^\\circ - 65^\\circ - 75^\\circ = 40^\\circ$.`,
          `Áp dụng định lý Sin trong tam giác $ABC$: $\\frac{AC}{\\sin \\widehat{CBA}} = \\frac{AB}{\\sin \\widehat{ACB}}$.`,
          `Suy ra: $AC = \\frac{AB \\cdot \\sin 75^\\circ}{\\sin 40^\\circ} = \\frac{500 \\cdot \\sin 75^\\circ}{\\sin 40^\\circ} \\approx \\frac{500 \\cdot 0,9659}{0,6428} \\approx 751,8\\text{ m}$.`,
          `Vậy khoảng cách từ điểm $A$ đến tháp hải đăng là xấp xỉ $751,8\\text{ m}$ (Đáp án **A**).`,
        ],
      };
    },
  },
  {
    id: 'prac-6',
    grade: '12',
    title: 'Xác suất người có kết quả xét nghiệm dương tính thực sự mắc bệnh',
    context: 'Y học & Dịch tễ học',
    type: 'multiple_choice',
    difficulty: 'Vận dụng cao',
    curriculumLink: 'Toán 12 – Bài 16. Xác suất có điều kiện và công thức Bayes',
    generate: () => {
      return {
        question: `Tỉ lệ mắc một căn bệnh trong cộng đồng là $1\\%$. Một bộ kit xét nghiệm y tế có độ nhạy (xác suất người có bệnh xét nghiệm dương tính) là $99\\%$, và độ đặc hiệu (xác suất người không bệnh xét nghiệm âm tính) là $95\\%$. Khi một người ngẫu nhiên xét nghiệm cho kết quả dương tính, xác suất thực sự người đó bị bệnh xấp xỉ bằng:`,
        options: [
          { id: 'A', text: '16,7%' },
          { id: 'B', text: '99,0%' },
          { id: 'C', text: '85,4%' },
          { id: 'D', text: '50,0%' },
        ],
        correctAnswer: 'A',
        solutionSteps: [
          `Gọi $B$ là biến cố "Người đó bị bệnh" $\\Rightarrow P(B) = 0,01$ và $P(\\overline{B}) = 0,99$.`,
          `Gọi $D$ là biến cố "Kết quả xét nghiệm dương tính". Ta có: $P(D|B) = 0,99$, $P(D|\\overline{B}) = 1 - 0,95 = 0,05$.`,
          `Theo công thức xác suất toàn phần: $P(D) = P(B)P(D|B) + P(\\overline{B})P(D|\\overline{B}) = 0,01 \\cdot 0,99 + 0,99 \\cdot 0,05 = 0,0099 + 0,0495 = 0,0594$.`,
          `Áp dụng công thức Bayes: $P(B|D) = \\frac{P(B)P(D|B)}{P(D)} = \\frac{0,0099}{0,0594} \\approx 0,1667 = 16,7\\%$.`,
          `Kết quả: Chỉ có khoảng $16,7\\%$ người có kết quả dương tính là thực sự mắc bệnh. Đáp án đúng là **A**.`,
        ],
      };
    },
  },
];
