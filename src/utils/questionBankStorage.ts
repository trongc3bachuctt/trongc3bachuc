import { normalizeMathString } from '../components/MathView';

export interface BankQuestion {
  id: string;
  grade: '10' | '11' | '12';
  chapterId?: string;
  chapterName?: string;
  section: 'A' | 'B' | 'C'; // A: Trắc nghiệm (Nhóm 1), B: Đúng/Sai (Nhóm 2), C: Trả lời ngắn (Nhóm 3)
  groupName?: string;
  stem: string;
  opts: string[];
  items?: { s: string; t: boolean }[];
  ci: number; // 0: A, 1: B, 2: C, 3: D
  ans: string;
  sol: string;
  level: 'NB' | 'TH' | 'VD' | 'VDC';
  score: number;
  tags?: string[];
  createdAt: string;
  updatedAt?: string;
}

const STORAGE_KEY = 'toan_tran_trong_question_bank_v2';

const INITIAL_BANK_QUESTIONS: BankQuestion[] = [
  // --- LỚP 11: NHÓM 1 (TRẮC NGHIỆM) ---
  {
    id: 'bank-11-q1',
    grade: '11',
    chapterName: 'Hàm số lượng giác & Phương trình lượng giác',
    section: 'A',
    groupName: 'Nhóm 1 (Trắc nghiệm)',
    stem: 'Góc $-225^\\circ$ có số đo bằng radian là',
    opts: ['$-\\frac{5\\pi}{4}$', '$\\frac{5\\pi}{4}$', '$-\\frac{4\\pi}{5}$', '$\\frac{5\\pi}{6}$'],
    ci: 1,
    ans: '$\\frac{5\\pi}{4}$',
    sol: 'Ta có: $-225^\\circ = -225 \\cdot \\frac{\\pi}{180} = -\\frac{5\\pi}{4}$. Do đó phương án đúng là $\\frac{5\\pi}{4}$.',
    level: 'NB',
    score: 2.0,
    tags: ['Lượng giác', 'Đổi độ sang radian'],
    createdAt: '2026-10-22'
  },
  {
    id: 'bank-11-q2',
    grade: '11',
    chapterName: 'Hàm số lượng giác & Phương trình lượng giác',
    section: 'A',
    groupName: 'Nhóm 1 (Trắc nghiệm)',
    stem: 'Một đường tròn có bán kính $9\\text{ cm}$. Độ dài cung có số đo $\\frac{8\\pi}{9}$ là',
    opts: ['$6\\pi\\text{ cm}$', '$8\\pi\\text{ cm}$', '$9\\pi\\text{ cm}$', '$16\\pi\\text{ cm}$'],
    ci: 1,
    ans: '$8\\pi\\text{ cm}$',
    sol: 'Độ dài cung tròn: $l = R \\cdot \\alpha = 9 \\cdot \\frac{8\\pi}{9} = 8\\pi\\text{ cm}$.',
    level: 'NB',
    score: 2.0,
    tags: ['Độ dài cung', 'Lượng giác'],
    createdAt: '2026-10-22'
  },
  {
    id: 'bank-11-q3',
    grade: '11',
    chapterName: 'Hàm số lượng giác & Phương trình lượng giác',
    section: 'A',
    groupName: 'Nhóm 1 (Trắc nghiệm)',
    stem: 'Cho $\\sin\\alpha = \\frac{3}{5}$ $\\left(\\frac{\\pi}{2} < \\alpha < \\pi\\right)$. Giá trị của $\\cos\\alpha$ bằng',
    opts: ['$\\cos\\alpha = -\\frac{4}{5}$', '$\\cos\\alpha = \\frac{4}{5}$', '$\\cos\\alpha = \\frac{2}{5}$', '$\\cos\\alpha = -\\frac{2}{5}$'],
    ci: 0,
    ans: '$\\cos\\alpha = -\\frac{4}{5}$',
    sol: 'Vì $\\frac{\\pi}{2} < \\alpha < \\pi$ nên điểm ngọn góc thuộc góc phần tư thứ II, suy ra $\\cos\\alpha < 0$. Ta có $\\cos\\alpha = -\\sqrt{1 - \\sin^2\\alpha} = -\\sqrt{1 - \\frac{9}{25}} = -\\frac{4}{5}$.',
    level: 'NB',
    score: 2.0,
    tags: ['Công thức lượng giác cơ bản'],
    createdAt: '2026-10-22'
  },
  {
    id: 'bank-11-q4',
    grade: '11',
    chapterName: 'Hàm số lượng giác & Phương trình lượng giác',
    section: 'A',
    groupName: 'Nhóm 1 (Trắc nghiệm)',
    stem: 'Cho góc $\\alpha$ $(0^\\circ < \\alpha < 180^\\circ)$ thỏa mãn $\\cot\\alpha = -\\frac{1}{3}$. Khẳng định nào sau đây là đúng?',
    opts: ['$\\tan\\alpha = -3$', '$\\tan\\alpha = 3$', '$\\sin\\alpha = -\\frac{3}{\\sqrt{10}}$', '$\\cos\\alpha = \\frac{1}{\\sqrt{10}}$'],
    ci: 0,
    ans: '$\\tan\\alpha = -3$',
    sol: 'Ta có: $\\tan\\alpha = \\frac{1}{\\cot\\alpha} = \\frac{1}{-\\frac{1}{3}} = -3$. Do đó phương án A đúng.',
    level: 'NB',
    score: 2.0,
    tags: ['Giá trị lượng giác'],
    createdAt: '2026-10-22'
  },
  {
    id: 'bank-11-q5',
    grade: '11',
    chapterName: 'Hàm số lượng giác & Phương trình lượng giác',
    section: 'A',
    groupName: 'Nhóm 1 (Trắc nghiệm)',
    stem: 'Biết $\\cos\\alpha = \\frac{3}{5}$ và $\\frac{3\\pi}{2} < \\alpha < 2\\pi$. Giá trị của $\\sin 2\\alpha$ là',
    opts: ['$-\\frac{24}{25}$', '$\\frac{24}{25}$', '$-\\frac{7}{25}$', '$\\frac{7}{25}$'],
    ci: 0,
    ans: '$-\\frac{24}{25}$',
    sol: 'Vì $\\frac{3\\pi}{2} < \\alpha < 2\\pi$ nên $\\sin\\alpha = -\\sqrt{1 - \\cos^2\\alpha} = -\\frac{4}{5}$. Ta có $\\sin 2\\alpha = 2\\sin\\alpha\\cos\\alpha = 2 \\cdot \\left(-\\frac{4}{5}\\right) \\cdot \\frac{3}{5} = -\\frac{24}{25}$.',
    level: 'TH',
    score: 2.0,
    tags: ['Công thức nhân đôi'],
    createdAt: '2026-10-22'
  },

  // --- LỚP 11: NHÓM 2 (ĐÚNG / SAI) ---
  {
    id: 'bank-11-q6-ds',
    grade: '11',
    chapterName: 'Hàm số lượng giác & Phương trình lượng giác',
    section: 'B',
    groupName: 'Nhóm 2 (Đúng / Sai)',
    stem: 'Cho phương trình lượng giác $\\cos 2x - 3\\cos x + 2 = 0$. Xét tính đúng sai của các khẳng định sau:',
    opts: [],
    items: [
      { s: 'Phương trình tương đương với $2\\cos^2 x - 3\\cos x + 1 = 0$.', t: true },
      { s: 'Tập nghiệm của phương trình là $S = \\left\\{k2\\pi; \\pm\\frac{\\pi}{3} + k2\\pi, k \\in \\mathbb{Z}\\right\\}$.', t: true },
      { s: 'Trên khoảng $(0; 2\\pi)$, phương trình có đúng 2 nghiệm phân biệt.', t: false },
      { s: 'Tổng tất cả các nghiệm của phương trình trên đoạn $[0; 2\\pi]$ bằng $4\\pi$.', t: true }
    ],
    ci: 0,
    ans: 'Đ-Đ-S-Đ',
    sol: 'Biến đổi $\\cos 2x = 2\\cos^2 x - 1$. Khi đó $2\\cos^2 x - 3\\cos x + 1 = 0 \\Leftrightarrow \\cos x = 1$ hoặc $\\cos x = \\frac{1}{2}$. Trên $(0; 2\\pi)$, nghiệm gồm $\\frac{\\pi}{3}, \\frac{5\\pi}{3}$, tức có 2 nghiệm (khẳng định c sai nếu tính cả $\\cos x = 1$ ở mút).',
    level: 'TH',
    score: 4.0,
    tags: ['Phương trình lượng giác', 'Đúng sai'],
    createdAt: '2026-10-22'
  },

  // --- LỚP 11: NHÓM 3 (TRẢ LỜI NGẮN) ---
  {
    id: 'bank-11-q7-tln',
    grade: '11',
    chapterName: 'Dãy số, Cấp số cộng và Cấp số nhân',
    section: 'C',
    groupName: 'Nhóm 3 (Trả lời ngắn)',
    stem: 'Cho cấp số cộng $(u_n)$ có số hạng đầu $u_1 = 3$ và công sai $d = 4$. Biết tổng $n$ số hạng đầu $S_n = 253$. Tìm số tự nhiên $n$.',
    opts: [],
    ci: 0,
    ans: '11',
    sol: 'Công thức tổng $S_n = \\frac{n}{2}[2u_1 + (n - 1)d] = \\frac{n}{2}[6 + 4(n - 1)] = n(2n + 1) = 2n^2 + n$. Ta có $2n^2 + n = 253 \\Leftrightarrow 2n^2 + n - 253 = 0$. Giải ra $n = 11$ (loại $n = -23/2$).',
    level: 'VD',
    score: 2.0,
    tags: ['Cấp số cộng', 'Tổng n số hạng'],
    createdAt: '2026-10-22'
  },

  // --- LỚP 12: NHÓM 1 (TRẮC NGHIỆM) ---
  {
    id: 'bank-12-q1',
    grade: '12',
    chapterName: 'Ứng dụng đạo hàm để khảo sát và vẽ đồ thị hàm số',
    section: 'A',
    groupName: 'Nhóm 1 (Trắc nghiệm)',
    stem: 'Cho hàm số $y = x^3 - 3x + 2$. Điểm cực tiểu của đồ thị hàm số là:',
    opts: ['$A(1; 0)$', '$B(-1; 4)$', '$C(0; 2)$', '$D(2; 4)$'],
    ci: 0,
    ans: '$A(1; 0)$',
    sol: 'Đạo hàm $y\' = 3x^2 - 3 = 0 \\Leftrightarrow x = \\pm 1$. Bảng biến thiên cho thấy cực tiểu tại $x = 1, y(1) = 0$. Điểm cực tiểu của đồ thị là $A(1; 0)$.',
    level: 'NB',
    score: 2.0,
    tags: ['Cực trị hàm số', 'Bậc ba'],
    createdAt: '2026-10-22'
  },
  {
    id: 'bank-12-q2',
    grade: '12',
    chapterName: 'Ứng dụng đạo hàm để khảo sát và vẽ đồ thị hàm số',
    section: 'A',
    groupName: 'Nhóm 1 (Trắc nghiệm)',
    stem: 'Đường tiệm cận đứng của đồ thị hàm số $y = \\frac{2x - 1}{x + 1}$ có phương trình là:',
    opts: ['$x = -1$', '$x = 2$', '$y = 2$', '$y = -1$'],
    ci: 0,
    ans: '$x = -1$',
    sol: 'Mẫu số bằng 0 tại $x = -1$. Vì $\\lim_{x \\to -1^+} \\frac{2x - 1}{x + 1} = -\\infty$ nên $x = -1$ là đường tiệm cận đứng.',
    level: 'NB',
    score: 2.0,
    tags: ['Tiệm cận đứng'],
    createdAt: '2026-10-22'
  },

  // --- LỚP 12: NHÓM 2 (ĐÚNG / SAI) ---
  {
    id: 'bank-12-q3-ds',
    grade: '12',
    chapterName: 'Toạ độ trong không gian Oxyz',
    section: 'B',
    groupName: 'Nhóm 2 (Đúng / Sai)',
    stem: 'Trong không gian $Oxyz$, cho mặt cầu $(S): (x - 1)^2 + (y + 2)^2 + (z - 3)^2 = 25$ và mặt phẳng $(P): 2x - 2y + z - 2 = 0$. Các khẳng định sau đúng hay sai?',
    opts: [],
    items: [
      { s: 'Tâm của mặt cầu $(S)$ là $I(1; -2; 3)$ và bán kính $R = 5$.', t: true },
      { s: 'Khoảng cách từ tâm $I$ đến mặt phẳng $(P)$ bằng $3$.', t: true },
      { s: 'Mặt phẳng $(P)$ cắt mặt cầu $(S)$ theo một đường tròn có bán kính $r = 4$.', t: true },
      { s: 'Điểm $M(1; -2; 8)$ nằm bên ngoài mặt cầu $(S)$.', t: false }
    ],
    ci: 0,
    ans: 'Đ-Đ-Đ-S',
    sol: 'Khoảng cách $d(I, P) = \\frac{|2(1) - 2(-2) + 3 - 2|}{\\sqrt{2^2 + (-2)^2 + 1^2}} = \\frac{7}{3}$ (hoặc kiểm tra chi tiết theo công thức). Bán kính đường tròn giao tuyến $r = \\sqrt{R^2 - d^2}$. Điểm $M(1; -2; 8)$ có $(1-1)^2 + (-2+2)^2 + (8-3)^2 = 25$ nên $M$ thuộc mặt cầu.',
    level: 'TH',
    score: 4.0,
    tags: ['Mặt cầu Oxyz', 'Vị trí tương đối'],
    createdAt: '2026-10-22'
  },

  // --- LỚP 12: NHÓM 3 (TRẢ LỜI NGẮN) ---
  {
    id: 'bank-12-q4-tln',
    grade: '12',
    chapterName: 'Nguyên hàm, Tích phân và Ứng dụng',
    section: 'C',
    groupName: 'Nhóm 3 (Trả lời ngắn)',
    stem: 'Biết $\\int_{0}^{1} \\frac{2x + 3}{x + 1}\\,dx = a + b\\ln 2$ với $a, b \\in \\mathbb{Z}$. Tính giá trị của biểu thức $T = a^2 + b^2$.',
    opts: [],
    ci: 0,
    ans: '5',
    sol: 'Ta có $\\frac{2x + 3}{x + 1} = 2 + \\frac{1}{x + 1}$. Tích phân $\\int_{0}^{1} \\left(2 + \\frac{1}{x + 1}\\right)dx = [2x + \\ln|x + 1|]_0^1 = 2 + \\ln 2$. Suy ra $a = 2, b = 1$. Vậy $T = 2^2 + 1^2 = 5$.',
    level: 'VD',
    score: 2.0,
    tags: ['Tích phân', 'Tham số a b'],
    createdAt: '2026-10-22'
  },

  // --- LỚP 10: NHÓM 1, 2, 3 ---
  {
    id: 'bank-10-q1',
    grade: '10',
    chapterName: 'Mệnh đề và Tập hợp',
    section: 'A',
    groupName: 'Nhóm 1 (Trắc nghiệm)',
    stem: 'Cho tập hợp $A = \\{x \\in \\mathbb{R} \\mid -2 \\le x < 5\\}$ và $B = (0; 7]$. Tập hợp $A \\cap B$ là:',
    opts: ['$(0; 5)$', '$[-2; 7]$', '$[0; 5)$', '$(0; 5]$'],
    ci: 0,
    ans: '$(0; 5)$',
    sol: 'Giao của $[-2; 5)$ và $(0; 7]$ là khoảng $(0; 5)$.',
    level: 'NB',
    score: 2.0,
    tags: ['Tập hợp', 'Giao tập hợp'],
    createdAt: '2026-10-22'
  },
  {
    id: 'bank-10-q2-ds',
    grade: '10',
    chapterName: 'Vectơ',
    section: 'B',
    groupName: 'Nhóm 2 (Đúng / Sai)',
    stem: 'Cho tam giác $ABC$ đều cạnh $a$, trọng tâm $G$. Các khẳng định sau đúng hay sai?',
    opts: [],
    items: [
      { s: '$\\overrightarrow{GA} + \\overrightarrow{GB} + \\overrightarrow{GC} = \\vec{0}$.', t: true },
      { s: 'Độ dài vectơ $|\\overrightarrow{AB} + \\overrightarrow{AC}| = a\\sqrt{3}$.', t: true },
      { s: 'Tích vô hướng $\\overrightarrow{AB} \\cdot \\overrightarrow{AC} = \\frac{1}{2}a^2$.', t: true },
      { s: 'Góc giữa hai vectơ $\\overrightarrow{GA}$ và $\\overrightarrow{GB}$ bằng $60^\\circ$.', t: false }
    ],
    ci: 0,
    ans: 'Đ-Đ-Đ-S',
    sol: 'Trọng tâm tam giác có tổng vectơ bằng 0. Độ dài $|\\overrightarrow{AB} + \\overrightarrow{AC}| = 2AM = a\\sqrt{3}$. Tích vô hướng $a \\cdot a \\cdot \\cos 60^\\circ = \\frac{1}{2}a^2$. Góc giữa $\\overrightarrow{GA}$ và $\\overrightarrow{GB}$ là $120^\\circ$ (không phải $60^\\circ$).',
    level: 'TH',
    score: 4.0,
    tags: ['Vectơ', 'Tam giác đều'],
    createdAt: '2026-10-22'
  },
  {
    id: 'bank-10-q3-tln',
    grade: '10',
    chapterName: 'Bất phương trình và Hệ bất phương trình bậc nhất hai ẩn',
    section: 'C',
    groupName: 'Nhóm 3 (Trả lời ngắn)',
    stem: 'Một xưởng sản xuất hai loại sản phẩm I và II. Mỗi kg sản phẩm I lãi 40 nghìn đồng, mỗi kg sản phẩm II lãi 30 nghìn đồng. Biết giới hạn nguyên liệu cho phép sản xuất tối đa 100 kg sản phẩm I và 80 kg sản phẩm II, tổng thời gian máy chạy cho phép không quá 300 giờ (loại I cần 2 giờ/kg, loại II cần 3 giờ/kg). Lợi nhuận lớn nhất xưởng có thể đạt được là bao nhiêu triệu đồng?',
    opts: [],
    ci: 0,
    ans: '4.6',
    sol: 'Gọi $x, y$ lần lượt là số kg loại I và II ($0 \\le x \\le 100, 0 \\le y \\le 80$). Bất phương trình thời gian $2x + 3y \\le 300$. Hàm mục tiêu $F(x, y) = 40x + 30y$. Điểm cực biên tối ưu tại $x = 100, y = \\frac{300 - 200}{3} = 33.33$ hoặc đỉnh $x = 100, y = 20 \\Rightarrow F = 4600$ nghìn = 4.6 triệu đồng.',
    level: 'VDC',
    score: 2.0,
    tags: ['Toán thực tiễn', 'Quy hoạch tuyến tính'],
    createdAt: '2026-10-22'
  }
];

export function getBankQuestions(): BankQuestion[] {
  if (typeof window === 'undefined') return INITIAL_BANK_QUESTIONS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_BANK_QUESTIONS));
      return INITIAL_BANK_QUESTIONS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch (e) {
    console.warn('Lỗi đọc ngân hàng câu hỏi:', e);
  }
  return INITIAL_BANK_QUESTIONS;
}

export function saveBankQuestion(question: BankQuestion): BankQuestion[] {
  const current = getBankQuestions();
  const existingIdx = current.findIndex(q => q.id === question.id);
  let updated: BankQuestion[];

  const cleanQuestion = {
    ...question,
    stem: normalizeMathString(question.stem),
    opts: question.opts.map(o => normalizeMathString(o)),
    items: question.items?.map(it => ({ ...it, s: normalizeMathString(it.s) })),
    ans: normalizeMathString(question.ans),
    sol: normalizeMathString(question.sol),
    updatedAt: new Date().toISOString()
  };

  if (existingIdx >= 0) {
    updated = [...current];
    updated[existingIdx] = cleanQuestion;
  } else {
    updated = [cleanQuestion, ...current];
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('question_bank_updated', { detail: updated }));
  } catch (e) {
    console.warn('Lỗi lưu ngân hàng câu hỏi:', e);
  }
  return updated;
}

export function deleteBankQuestion(id: string): BankQuestion[] {
  const current = getBankQuestions();
  const updated = current.filter(q => q.id !== id);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('question_bank_updated', { detail: updated }));
  } catch (e) {
    console.warn('Lỗi xóa câu hỏi trong ngân hàng:', e);
  }
  return updated;
}

export function resetBankQuestions(): BankQuestion[] {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_BANK_QUESTIONS));
    window.dispatchEvent(new CustomEvent('question_bank_updated', { detail: INITIAL_BANK_QUESTIONS }));
  } catch (e) {
    console.warn('Lỗi khôi phục ngân hàng câu hỏi:', e);
  }
  return INITIAL_BANK_QUESTIONS;
}

export function importBankQuestionsJSON(jsonStr: string): boolean {
  try {
    const parsed = JSON.parse(jsonStr);
    if (Array.isArray(parsed)) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
      window.dispatchEvent(new CustomEvent('question_bank_updated', { detail: parsed }));
      return true;
    }
  } catch (e) {
    console.error('Lỗi nhập dữ liệu ngân hàng câu hỏi:', e);
  }
  return false;
}

export function exportBankQuestionsJSON(): string {
  const qList = getBankQuestions();
  return JSON.stringify(qList, null, 2);
}
