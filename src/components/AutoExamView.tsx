import React, { useState, useEffect, useMemo } from 'react';
import {
  Sparkles,
  RefreshCw,
  BookOpen,
  CheckCircle2,
  Clock,
  Printer,
  Eye,
  Award,
  Upload,
  FileText,
  Plus,
  AlertCircle,
  HelpCircle,
  ChevronDown
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { GradeLevel } from '../types';
import { MathView } from './MathView';
import { TaoDeThiView } from './TaoDeThiView';

interface SampleQuestionPart1 {
  id: string;
  lessonId?: string;
  stem: string;
  opts: string[];
  ci: number; // 0, 1, 2, 3
  ans: string;
  sol: string;
}

interface SampleQuestionPart2 {
  id: string;
  lessonId?: string;
  stem: string;
  items: { s: string; t: boolean }[];
  sol: string;
}

interface SampleQuestionPart3 {
  id: string;
  lessonId?: string;
  stem: string;
  v: number;
  ans: string;
  sol: string;
}

interface SampleExamItem {
  id: string;
  title: string;
  grade: GradeLevel;
  min: number;
  desc: string;
  isCustom?: boolean;
  A: SampleQuestionPart1[];
  B: SampleQuestionPart2[];
  C: SampleQuestionPart3[];
}

const PRESET_SAMPLE_EXAMS: SampleExamItem[] = [
  {
    id: 'sample-12-gk1',
    grade: '12',
    title: 'Đề mẫu 1 (Toán 12): Khảo sát hàm số, Cực trị & Tối ưu thực tế',
    desc: 'Cấu trúc định dạng mới 2025: 12 trắc nghiệm nhiều phương án, 4 đúng/sai, 6 trả lời ngắn.',
    min: 90,
    A: [
      {
        id: '12-A1',
        lessonId: '12-1',
        stem: 'Cho hàm số $y = x^3 - 3x^2 + 2$. Mệnh đề nào dưới đây là đúng?',
        opts: ['Hàm số đồng biến trên khoảng $(0; 2)$', 'Hàm số nghịch biến trên khoảng $(0; 2)$', 'Hàm số đồng biến trên $\\mathbb{R}$', 'Hàm số nghịch biến trên $(2; +\\infty)$'],
        ci: 1,
        ans: 'Hàm số nghịch biến trên khoảng $(0; 2)$',
        sol: 'Ta có $y\' = 3x^2 - 6x = 3x(x - 2)$. Cho $y\' < 0 \\Leftrightarrow 0 < x < 2$. Do đó hàm số nghịch biến trên khoảng $(0; 2)$.'
      },
      {
        id: '12-A2',
        lessonId: '12-2',
        stem: 'Điểm cực đại của đồ thị hàm số $y = -x^3 + 3x - 1$ là:',
        opts: ['$M(1; 1)$', '$N(-1; -3)$', '$P(1; -1)$', '$Q(0; -1)$'],
        ci: 0,
        ans: '$M(1; 1)$',
        sol: '$y\' = -3x^2 + 3 = 0 \\Leftrightarrow x = \\pm 1$. Qua $x = 1$, đạo hàm đổi dấu từ dương sang âm nên $M(1; 1)$ là điểm cực đại.'
      },
      {
        id: '12-A3',
        lessonId: '12-3',
        stem: 'Giá trị nhỏ nhất của hàm số $f(x) = x^4 - 2x^2 + 3$ trên đoạn $[0; 2]$ bằng:',
        opts: ['$2$', '$3$', '$11$', '$1$'],
        ci: 0,
        ans: '$2$',
        sol: '$f\'(x) = 4x^3 - 4x = 0 \\Leftrightarrow x = 0$ hoặc $x = 1$ trên $[0; 2]$. Ta có $f(0) = 3, f(1) = 2, f(2) = 11$. Vậy GTNN bằng $2$.'
      },
      {
        id: '12-A4',
        lessonId: '12-4',
        stem: 'Đường tiệm cận đứng của đồ thị hàm số $y = \\dfrac{2x + 1}{x - 3}$ là đường thẳng:',
        opts: ['$x = 3$', '$x = 2$', '$y = 2$', '$y = 3$'],
        ci: 0,
        ans: '$x = 3$',
        sol: 'Tiệm cận đứng là $x = 3$ do mẫu số triệt tiêu tại $x = 3$.'
      },
      {
        id: '12-A5',
        lessonId: '12-4',
        stem: 'Đường tiệm cận ngang của đồ thị hàm số $y = \\dfrac{3x - 5}{x + 2}$ là đường thẳng:',
        opts: ['$y = 3$', '$x = -2$', '$y = -5$', '$x = 3$'],
        ci: 0,
        ans: '$y = 3$',
        sol: 'Tiệm cận ngang là $\\lim_{x \\to \\pm\\infty} y = \\dfrac{3}{1} = 3 \\Rightarrow y = 3$.'
      },
      {
        id: '12-A6',
        lessonId: '12-7',
        stem: 'Trong không gian $Oxyz$, cho hai điểm $A(1; 2; -1)$ và $B(3; 0; 1)$. Toạ độ của vectơ $\\overrightarrow{AB}$ là:',
        opts: ['$(2; -2; 2)$', '$(4; 2; 0)$', '$(-2; 2; -2)$', '$(2; 1; 0)$'],
        ci: 0,
        ans: '$(2; -2; 2)$',
        sol: '$\\overrightarrow{AB} = (3 - 1; 0 - 2; 1 - (-1)) = (2; -2; 2)$.'
      },
      {
        id: '12-A7',
        lessonId: '12-8',
        stem: 'Trong không gian $Oxyz$, cho hai vectơ $\\vec u = (1; 2; 3)$ và $\\vec v = (2; -1; 1)$. Tích vô hướng $\\vec u \\cdot \\vec v$ bằng:',
        opts: ['$3$', '$5$', '$0$', '$-1$'],
        ci: 0,
        ans: '$3$',
        sol: '$\\vec u \\cdot \\vec v = 1 \\cdot 2 + 2 \\cdot (-1) + 3 \\cdot 1 = 3$.'
      },
      {
        id: '12-A8',
        lessonId: '12-14',
        stem: 'Trong không gian $Oxyz$, tâm $I$ và bán kính $R$ của mặt cầu $(S): (x - 2)^2 + (y + 1)^2 + (z - 4)^2 = 25$ là:',
        opts: ['$I(2; -1; 4), R = 5$', '$I(-2; 1; -4), R = 5$', '$I(2; -1; 4), R = 25$', '$I(-2; 1; -4), R = 25$'],
        ci: 0,
        ans: '$I(2; -1; 4), R = 5$',
        sol: 'Tâm $I(2; -1; 4)$ và bán kính $R = \\sqrt{25} = 5$.'
      },
      {
        id: '12-A9',
        lessonId: '12-7',
        stem: 'Trong không gian $Oxyz$, toạ độ trung điểm $M$ của đoạn thẳng nối $A(2; 4; -2)$ và $B(4; 0; 6)$ là:',
        opts: ['$M(3; 2; 2)$', '$M(6; 4; 4)$', '$M(1; -2; 4)$', '$M(2; -4; 8)$'],
        ci: 0,
        ans: '$M(3; 2; 2)$',
        sol: '$M = \\left(\\dfrac{2+4}{2}; \\dfrac{4+0}{2}; \\dfrac{-2+6}{2}\\right) = (3; 2; 2)$.'
      },
      {
        id: '12-A10',
        lessonId: '12-1',
        stem: 'Cho hàm số $y = f(x)$ có $f\'(x) = (x - 1)^2 (x + 2)$. Số điểm cực trị của hàm số là:',
        opts: ['$1$', '$2$', '$3$', '$0$'],
        ci: 0,
        ans: '$1$',
        sol: '$f\'(x)$ chỉ đổi dấu qua nghiệm đơn $x = -2$, không đổi dấu qua nghiệm kép $x = 1$. Do đó hàm số chỉ có 1 điểm cực trị.'
      },
      {
        lessonId: '12-3',
        id: '12-A11',
        stem: 'Một hộp kim loại không nắp có đáy hình vuông cạnh $x$ (cm) và chiều cao $h$ (cm), thể tích $V = 500\\text{ cm}^3$. Diện tích bề mặt nhỏ nhất khi $x$ bằng:',
        opts: ['$10\\text{ cm}$', '$5\\text{ cm}$', '$15\\text{ cm}$', '$20\\text{ cm}$'],
        ci: 0,
        ans: '$10\\text{ cm}$',
        sol: '$h = \\dfrac{500}{x^2}$. $S(x) = x^2 + \\dfrac{2000}{x}$. $S\'(x) = 2x - \\dfrac{2000}{x^2} = 0 \\Leftrightarrow x = 10\\text{ cm}$.'
      },
      {
        id: '12-A12',
        lessonId: '12-14',
        stem: 'Trong không gian $Oxyz$, mặt cầu tâm $O(0; 0; 0)$ đi qua điểm $A(2; 1; 2)$ có phương trình là:',
        opts: ['$x^2 + y^2 + z^2 = 9$', '$x^2 + y^2 + z^2 = 3$', '$(x - 2)^2 + (y - 1)^2 + (z - 2)^2 = 9$', '$x^2 + y^2 + z^2 = 81$'],
        ci: 0,
        ans: '$x^2 + y^2 + z^2 = 9$',
        sol: 'Bán kính $R = OA = \\sqrt{2^2 + 1^2 + 2^2} = 3$. Mặt cầu là $x^2 + y^2 + z^2 = 9$.'
      }
    ],
    B: [
      {
        id: '12-B1',
        lessonId: '12-1',
        stem: 'Cho hàm số bậc ba $y = f(x) = x^3 - 3x^2 - 9x + 5$. Xét tính đúng/sai của các khẳng định sau:',
        items: [
          { s: 'Đạo hàm của hàm số là $f\'(x) = 3x^2 - 6x - 9$.', t: true },
          { s: 'Hàm số nghịch biến trên khoảng $(-1; 3)$.', t: true },
          { s: 'Hàm số đạt cực tiểu tại điểm $x = -1$.', t: false },
          { s: 'Giá trị lớn nhất của hàm số trên đoạn $[0; 4]$ bằng $5$.', t: true }
        ],
        sol: 'a) Đúng. b) Đúng: $f\'(x) < 0 \\Leftrightarrow x \\in (-1; 3)$. c) Sai vì $x = -1$ là điểm cực đại. d) Đúng vì $f(0) = 5$ là giá trị lớn nhất trên đoạn $[0; 4]$.'
      },
      {
        id: '12-B2',
        lessonId: '12-8',
        stem: 'Trong không gian $Oxyz$, cho ba điểm $A(1; 0; 2)$, $B(2; 1; 0)$ và $C(0; 2; 1)$.',
        items: [
          { s: 'Vectơ $\\overrightarrow{AB} = (1; 1; -2)$.', t: true },
          { s: 'Độ dài đoạn thẳng $AB$ bằng $\\sqrt{6}$.', t: true },
          { s: 'Tích vô hướng $\\overrightarrow{AB} \\cdot \\overrightarrow{AC} = 0$.', t: false },
          { s: 'Tam giác $ABC$ là tam giác vuông tại $A$.', t: false }
        ],
        sol: '$\\overrightarrow{AB} = (1; 1; -2) \\Rightarrow AB = \\sqrt{6}$. $\\overrightarrow{AC} = (-1; 2; -1) \\Rightarrow \\overrightarrow{AB} \\cdot \\overrightarrow{AC} = 3 \\ne 0$.'
      },
      {
        id: '12-B3',
        lessonId: '12-4',
        stem: 'Cho hàm số $y = \\dfrac{x + 1}{x - 2}$. Xét tính đúng/sai của các mệnh đề sau:',
        items: [
          { s: 'Tập xác định của hàm số là $D = \\mathbb{R} \\setminus \\{2\\}$.', t: true },
          { s: 'Đồ thị hàm số có tiệm cận đứng $x = 2$ và tiệm cận ngang $y = 1$.', t: true },
          { s: 'Đạo hàm $y\' > 0$ với mọi $x \\ne 2$.', t: false },
          { s: 'Tâm đối xứng của đồ thị là điểm $I(2; 1)$.', t: true }
        ],
        sol: '$y\' = \\dfrac{-3}{(x - 2)^2} < 0$ nên mệnh đề c) là sai.'
      },
      {
        id: '12-B4',
        lessonId: '12-3',
        stem: 'Một hộp giấy có thể tích $108\\text{ cm}^3$ đáy hình vuông cạnh $x$ (cm), không nắp.',
        items: [
          { s: 'Chiều cao hộp là $h = \\dfrac{108}{x^2}$.', t: true },
          { s: 'Diện tích bề mặt hộp là $S(x) = x^2 + \\dfrac{432}{x}$.', t: true },
          { s: 'Đạo hàm $S\'(x) = 2x - \\dfrac{432}{x^2}$.', t: true },
          { s: 'Diện tích nhỏ nhất khi cạnh đáy $x = 6\\text{ cm}$.', t: true }
        ],
        sol: '$S\'(x) = 0 \\Leftrightarrow 2x^3 = 432 \\Leftrightarrow x = 6\\text{ cm}$.'
      }
    ],
    C: [
      {
        id: '12-C1',
        lessonId: '12-2',
        stem: 'Tìm điểm cực tiểu của hàm số $y = x^3 - 3x + 4$.',
        v: 1,
        ans: '1',
        sol: '$y\' = 3x^2 - 3 = 0 \\Leftrightarrow x = 1$ (cực tiểu), $x = -1$ (cực đại).'
      },
      {
        id: '12-C2',
        lessonId: '12-3',
        stem: 'Tìm giá trị lớn nhất của hàm số $y = -x^4 + 4x^2 + 1$ trên đoạn $[0; 3]$.',
        v: 5,
        ans: '5',
        sol: '$y\' = -4x(x^2 - 2) = 0 \\Leftrightarrow x = \\sqrt{2}$. Giá trị tại $x = \\sqrt{2}$ là $y = 5$.'
      },
      {
        id: '12-C3',
        lessonId: '12-14',
        stem: 'Trong không gian $Oxyz$, cho mặt cầu $(S): x^2 + y^2 + z^2 - 2x + 4y - 6z - 11 = 0$. Bán kính $R$ bằng bao nhiêu?',
        v: 5,
        ans: '5',
        sol: '$R = \\sqrt{1^2 + (-2)^2 + 3^2 - (-11)} = \\sqrt{25} = 5$.'
      },
      {
        id: '12-C4',
        lessonId: '12-8',
        stem: 'Trong không gian $Oxyz$, cho $\\vec a = (2; m; 1)$ và $\\vec b = (3; 2; -4)$. Tìm $m$ để $\\vec a \\perp \\vec b$.',
        v: -1,
        ans: '-1',
        sol: '$\\vec a \\cdot \\vec b = 6 + 2m - 4 = 0 \\Leftrightarrow m = -1$.'
      },
      {
        id: '12-C5',
        lessonId: '12-1',
        stem: 'Có bao nhiêu giá trị nguyên $m \\in [-5; 5]$ để hàm số $y = \\dfrac{x + 2}{x + m}$ nghịch biến trên từng khoảng xác định?',
        v: 7,
        ans: '7',
        sol: '$y\' = \\dfrac{m - 2}{(x + m)^2} < 0 \\Leftrightarrow m < 2$. Do $m \\in [-5; 5]$, có $7$ giá trị $\\{-5, -4, -3, -2, -1, 0, 1\\}$.'
      },
      {
        id: '12-C6',
        lessonId: '12-3',
        stem: 'Một mảnh vườn chữ nhật ven sông dài $120\\text{ m}$ lưới rào (không rào bờ sông). Diện tích lớn nhất của vườn bằng bao nhiêu mét vuông?',
        v: 1800,
        ans: '1800',
        sol: '$S(x) = x(120 - 2x) = -2x^2 + 120x$. Đạt cực đại tại $x = 30\\text{ m}$, diện tích $S = 1800\\text{ m}^2$.'
      }
    ]
  }
];

export const AutoExamView: React.FC = () => {
  const [grade, setGrade] = useState<GradeLevel>('12');
  const [selectedSampleId, setSelectedSampleId] = useState<string>('sample-12-gk1');
  const [durationMinutes, setDurationMinutes] = useState<number>(90);
  const [schoolName, setSchoolName] = useState<string>('Trường THPT Ba Chúc, An Giang');
  const [studentName, setStudentName] = useState<string>('');

  // Active exam state
  const [activeExam, setActiveExam] = useState<{
    id: string;
    title: string;
    code: string;
    isSample: boolean;
    partA: SampleQuestionPart1[];
    partB: SampleQuestionPart2[];
    partC: SampleQuestionPart3[];
  } | null>(null);

  // User responses
  const [answersA, setAnswersA] = useState<Record<string, number>>({});
  const [answersB, setAnswersB] = useState<Record<string, Record<number, boolean>>>({});
  const [answersC, setAnswersC] = useState<Record<string, string>>({});

  // Timer & state
  const [timeLeft, setTimeLeft] = useState<number>(90 * 60);
  const [isTimerActive, setIsTimerActive] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [showKey, setShowKey] = useState<boolean>(false);

  // Chế độ xem trong Menu Đề Tự Sinh: 'sample' (Chọn Đề mẫu trong kho của Thầy) hoặc 'word' (Tạo Đề Từ File Word)
  const [activeTabMode, setActiveTabMode] = useState<'sample' | 'word'>('sample');

  // Available sample exams list
  const availableExams = useMemo(() => {
    return PRESET_SAMPLE_EXAMS.filter(e => e.grade === grade);
  }, [grade]);

  // Load sample exam
  const handleLoadSample = () => {
    const target = availableExams.find(e => e.id === selectedSampleId) || availableExams[0];
    if (!target) return;

    setActiveExam({
      id: target.id,
      title: target.title,
      code: 'GỐC-101',
      isSample: true,
      partA: [...target.A],
      partB: [...target.B],
      partC: [...target.C]
    });
    setAnswersA({});
    setAnswersB({});
    setAnswersC({});
    setIsSubmitted(false);
    setShowKey(false);
    setTimeLeft(durationMinutes * 60);
    setIsTimerActive(true);
  };

  // Generate similar exam (mutate numbers and randomize)
  const handleGenSimilar = () => {
    const target = availableExams.find(e => e.id === selectedSampleId) || availableExams[0];
    if (!target) return;

    const randomCode = Math.floor(Math.random() * 90 + 201);

    // Mutate and shuffle Part A
    const mutatedA = target.A.map((q, idx) => {
      if ((window as any).ExactExamGenerator && typeof (window as any).ExactExamGenerator.generateExactSimilarQuestion === 'function') {
        const exactQ = (window as any).ExactExamGenerator.generateExactSimilarQuestion(q, idx, 'A', target.grade || 12);
        if (exactQ) {
          return {
            ...exactQ,
            id: `sim-A-${idx}-${randomCode}`,
            opts: exactQ.opts || q.opts,
            ci: exactQ.ci !== undefined ? exactQ.ci : 0,
            ans: exactQ.ans || q.ans
          };
        }
      }
      const shuffled = [...q.opts].sort(() => Math.random() - 0.5);
      const newCi = shuffled.indexOf(q.ans);
      return {
        ...q,
        id: `sim-A-${idx}-${randomCode}`,
        opts: shuffled,
        ci: newCi >= 0 ? newCi : 0
      };
    });

    // Mutate Part B
    const mutatedB = target.B.map((q, idx) => {
      if ((window as any).ExactExamGenerator && typeof (window as any).ExactExamGenerator.generateExactSimilarQuestion === 'function') {
        const exactQ = (window as any).ExactExamGenerator.generateExactSimilarQuestion(q, idx, 'B', target.grade || 12);
        if (exactQ) return { ...exactQ, id: `sim-B-${idx}-${randomCode}` };
      }
      return {
        ...q,
        id: `sim-B-${idx}-${randomCode}`,
        items: q.items.map(it => ({ ...it }))
      };
    });

    // Mutate Part C
    const mutatedC = target.C.map((q, idx) => {
      if ((window as any).ExactExamGenerator && typeof (window as any).ExactExamGenerator.generateExactSimilarQuestion === 'function') {
        const exactQ = (window as any).ExactExamGenerator.generateExactSimilarQuestion(q, idx, 'C', target.grade || 12);
        if (exactQ) return { ...exactQ, id: `sim-C-${idx}-${randomCode}` };
      }
      return {
        ...q,
        id: `sim-C-${idx}-${randomCode}`
      };
    });

    setActiveExam({
      id: target.id,
      title: target.title,
      code: `TƯƠNG TỰ-${randomCode}`,
      isSample: false,
      partA: mutatedA,
      partB: mutatedB,
      partC: mutatedC
    });

    setAnswersA({});
    setAnswersB({});
    setAnswersC({});
    setIsSubmitted(false);
    setShowKey(false);
    setTimeLeft(durationMinutes * 60);
    setIsTimerActive(true);
  };

  // Countdown timer
  useEffect(() => {
    let timer: any = null;
    if (isTimerActive && timeLeft > 0 && !isSubmitted) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            setIsTimerActive(false);
            handleSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isTimerActive, timeLeft, isSubmitted]);

  // Format time MM:SS
  const formattedTime = useMemo(() => {
    const m = Math.floor(timeLeft / 60);
    const s = timeLeft % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }, [timeLeft]);

  // Submit and grading
  const handleSubmit = () => {
    if (!activeExam || isSubmitted) return;
    setIsSubmitted(true);
    setIsTimerActive(false);

    let rawScore = 0;
    let maxScore = 0;

    // Part A: 0.25 pt per question
    activeExam.partA.forEach(q => {
      maxScore += 0.25;
      if (answersA[q.id] === q.ci) rawScore += 0.25;
    });

    // Part B: 0.1, 0.25, 0.5, 1.0 pt
    activeExam.partB.forEach(q => {
      maxScore += 1.0;
      let correctCount = 0;
      q.items.forEach((item, idx) => {
        if (answersB[q.id]?.[idx] === item.t) correctCount++;
      });
      const step = [0, 0.1, 0.25, 0.5, 1.0][correctCount] || 0;
      rawScore += step;
    });

    // Part C: 0.5 pt per question
    activeExam.partC.forEach(q => {
      maxScore += 0.5;
      const val = answersC[q.id]?.trim().replace(',', '.');
      if (val && Math.abs(parseFloat(val) - q.v) < 0.01) {
        rawScore += 0.5;
      }
    });

    const scaledScore = Math.round((rawScore / (maxScore || 1)) * 100) / 10;
    if (scaledScore >= 8.0) {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 }
      });
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* 2 NÚT DUY NHẤT TRONG MENU ĐỀ TỰ SINH THEO YÊU CẦU */}
      <div className="bg-white rounded-2xl border border-slate-200 p-2.5 sm:p-3 shadow-xs flex flex-wrap items-center justify-between gap-3 no-print">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTabMode('sample')}
            className={`px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-black text-xs sm:text-sm flex items-center gap-2 cursor-pointer transition-all shadow-xs ${
              activeTabMode === 'sample'
                ? 'bg-teal-800 text-white shadow-md ring-2 ring-teal-500'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200'
            }`}
          >
            <BookOpen className={`w-4 h-4 ${activeTabMode === 'sample' ? 'text-amber-300' : 'text-slate-500'}`} />
            <span>Chọn Đề mẫu trong kho của Thầy</span>
          </button>

          <button
            onClick={() => setActiveTabMode('word')}
            className={`px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-black text-xs sm:text-sm flex items-center gap-2 cursor-pointer transition-all shadow-xs ${
              activeTabMode === 'word'
                ? 'bg-gradient-to-r from-teal-700 via-indigo-700 to-purple-700 text-white shadow-md ring-2 ring-indigo-400'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200'
            }`}
          >
            <FileText className={`w-4 h-4 ${activeTabMode === 'word' ? 'text-emerald-300' : 'text-slate-500'}`} />
            <span>Tạo Đề Từ File Word</span>
          </button>
        </div>

        <div className="text-xs text-slate-500 hidden lg:flex items-center gap-1.5 font-medium pr-2">
          <Sparkles className="w-3.5 h-3.5 text-teal-600" />
          <span>Thiết kế &amp; chuyển đổi Word MathType chuẩn KaTeX</span>
        </div>
      </div>

      {/* GIAO DIỆN TẠO ĐỀ TỪ FILE WORD CHUẨN ADMIN.TAODETHI.XYZ */}
      {activeTabMode === 'word' && (
        <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-xs bg-white">
          <TaoDeThiView
            onRunExamOnWeb={(examData) => {
              setActiveExam({
                id: examData.id,
                title: examData.title,
                code: `WORD-${Math.floor(100 + Math.random() * 900)}`,
                isSample: false,
                partA: (examData.A || []).map((q: any) => ({
                  id: q.id,
                  stem: q.stem,
                  opts: q.opts || [],
                  ci: q.ci ?? 0,
                  ans: q.ans || q.opts?.[q.ci ?? 0] || '',
                  sol: q.sol || ''
                })),
                partB: (examData.B || []).map((q: any) => ({
                  id: q.id,
                  stem: q.stem,
                  items: q.items || [],
                  sol: q.sol || ''
                })),
                partC: (examData.C || []).map((q: any) => ({
                  id: q.id,
                  stem: q.stem,
                  v: typeof q.v === 'number' ? q.v : parseFloat(q.ans || '0') || 0,
                  ans: q.ans || '',
                  sol: q.sol || ''
                }))
              });
              setAnswersA({});
              setAnswersB({});
              setAnswersC({});
              setIsSubmitted(false);
              setShowKey(false);
              setTimeLeft((examData.min || 90) * 60);
              setIsTimerActive(true);
              setActiveTabMode('sample');
            }}
          />
        </div>
      )}

      {/* GIAO DIỆN CHỌN ĐỀ MẪU TRONG KHO CỦA THẦY */}
      {activeTabMode === 'sample' && (
        <>

      {/* Control Panel */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4 no-print">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs sm:text-sm">
          <div>
            <label className="block font-bold text-slate-700 mb-1">1. Khối lớp *</label>
            <select
              value={grade}
              onChange={(e) => setGrade(e.target.value as GradeLevel)}
              className="w-full border border-slate-300 rounded-lg p-2 font-semibold bg-slate-50 focus:bg-white"
            >
              <option value="12">Toán 12 (KNTT)</option>
              <option value="11">Toán 11 (KNTT)</option>
              <option value="10">Toán 10 (KNTT)</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="block font-bold text-slate-700 mb-1">2. Chọn Đề mẫu trong kho của Thầy *</label>
            <select
              value={selectedSampleId}
              onChange={(e) => setSelectedSampleId(e.target.value)}
              className="w-full border border-slate-300 rounded-lg p-2 font-semibold bg-slate-50 focus:bg-white"
            >
              {availableExams.map(ex => (
                <option key={ex.id} value={ex.id}>
                  {ex.title} ({ex.min} phút)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">3. Thời gian làm bài</label>
            <select
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(Number(e.target.value))}
              className="w-full border border-slate-300 rounded-lg p-2 font-semibold bg-slate-50 focus:bg-white"
            >
              <option value={90}>90 phút (Chuẩn thi)</option>
              <option value={45}>45 phút (1 tiết)</option>
              <option value={15}>15 phút (Kiểm tra nhanh)</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="block font-bold text-slate-700 mb-1">Tên trường in trên đề thi</label>
            <input
              type="text"
              value={schoolName}
              onChange={(e) => setSchoolName(e.target.value)}
              className="w-full border border-slate-300 rounded-lg p-2"
              placeholder="Trường THPT Ba Chúc, An Giang"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block font-bold text-slate-700 mb-1">Họ tên học sinh</label>
            <input
              type="text"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              className="w-full border border-slate-300 rounded-lg p-2"
              placeholder="Nhập họ và tên học sinh..."
            />
          </div>
        </div>

        {/* Buttons Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-200">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleLoadSample}
              className="px-4 py-2.5 rounded-lg bg-teal-800 hover:bg-teal-900 text-white font-bold text-xs sm:text-sm transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <BookOpen className="w-4 h-4" />
              <span>📝 1. Làm Đề Mẫu Của Thầy</span>
            </button>
            <button
              onClick={handleGenSimilar}
              className="px-4 py-2.5 rounded-lg bg-gradient-to-r from-teal-700 to-sky-700 hover:from-teal-800 hover:to-sky-800 text-white font-black text-xs sm:text-sm transition-all shadow-md cursor-pointer flex items-center gap-1.5"
            >
              <RefreshCw className="w-4 h-4" />
              <span>⚡ 2. Sinh Đề Tương Tự (Đổi số)</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleSubmit}
              disabled={!activeExam || isSubmitted}
              className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold text-xs sm:text-sm cursor-pointer transition-all flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Nộp bài và chấm</span>
            </button>
            <button
              onClick={() => setShowKey(!showKey)}
              disabled={!activeExam}
              className="px-3.5 py-2 rounded-lg border border-slate-300 hover:bg-slate-100 disabled:opacity-50 text-slate-700 font-bold text-xs sm:text-sm cursor-pointer transition-all flex items-center gap-1.5"
            >
              <Eye className="w-4 h-4" />
              <span>Xem đáp án</span>
            </button>
            <button
              onClick={() => {
                if (!activeExam) {
                  handleLoadSample();
                }
                setTimeout(() => {
                  if ((window as any).ExactExamGenerator && typeof (window as any).ExactExamGenerator.printAutoExamA4 === 'function') {
                    (window as any).ExactExamGenerator.printAutoExamA4();
                  } else {
                    try {
                      window.print();
                    } catch (err) {
                      console.warn('print error', err);
                    }
                  }
                }, 100);
              }}
              className="px-3.5 py-2 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs sm:text-sm cursor-pointer transition-all flex items-center gap-1.5 shadow-sm"
              title="In đề thi ra khổ giấy A4 tiêu chuẩn (hoặc bấm Ctrl + P)"
            >
              <Printer className="w-4 h-4" />
              <span>🖨️ In ra A4</span>
            </button>
          </div>
        </div>
      </div>

      {/* Exam View Area */}
      {!activeExam ? (
        <div className="bg-white border-2 border-dashed border-slate-200 rounded-2xl p-12 text-center space-y-4">
          <div className="w-16 h-16 bg-teal-50 text-teal-800 rounded-full flex items-center justify-center mx-auto text-2xl font-black">
            📚
          </div>
          <h3 className="text-lg font-bold text-slate-800">
            Chọn Đề Mẫu và Bắt Đầu Luyện Tập
          </h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            Em có thể bấm <b>"1. Làm Đề Mẫu Của Thầy"</b> để luyện đề gốc, sau đó bấm <b>"2. Sinh Đề Tương Tự"</b> để hệ thống tự động sinh các đề thi mới cùng dạng toán nhưng số liệu mới 100%!
          </p>
          <div className="flex justify-center gap-3">
            <button
              onClick={handleLoadSample}
              className="px-4 py-2 bg-teal-800 text-white rounded-lg font-bold text-xs sm:text-sm shadow-xs hover:bg-teal-900 cursor-pointer"
            >
              📝 Bắt đầu với Đề mẫu
            </button>
            <button
              onClick={handleGenSimilar}
              className="px-4 py-2 bg-sky-700 text-white rounded-lg font-bold text-xs sm:text-sm shadow-xs hover:bg-sky-800 cursor-pointer"
            >
              ⚡ Sinh đề tương tự ngay
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Timer Sticky Bar */}
          <div className="sticky top-16 z-30 bg-slate-900 text-white rounded-xl px-5 py-3 shadow-lg flex items-center justify-between flex-wrap gap-3 no-print border border-slate-800">
            <div className="flex items-center gap-3 flex-wrap">
              <span className={`px-2.5 py-1 rounded-full text-xs font-black ${
                activeExam.isSample ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
              }`}>
                {activeExam.isSample ? '📖 ĐỀ MẪU GỐC CỦA GIÁO VIÊN' : '⚡ ĐỀ TỰ SINH TƯƠNG TỰ (ĐÃ ĐỔI SỐ)'}
              </span>
              <span className="text-xs text-slate-300">
                Mã đề: <b>{activeExam.code}</b> · {activeExam.title}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              <span className="text-xs text-slate-300">Thời gian còn lại:</span>
              <span className="font-mono text-lg font-black text-amber-400 tracking-wider">
                {formattedTime}
              </span>
            </div>
          </div>

          {/* Paper Body (Clean A4 layout) */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-10 shadow-sm print:p-0 print:border-none print:shadow-none space-y-6">
            {/* School Exam Header */}
            <div className="grid grid-cols-2 text-center gap-4 pb-4 border-b-2 border-slate-900 text-xs sm:text-sm">
              <div>
                <b className="block text-sm sm:text-base font-extrabold uppercase">{schoolName}</b>
                <span className="block font-bold text-slate-700">TỔ TOÁN</span>
                <i className="text-[11px] sm:text-xs text-slate-500">(Đề gồm 3 phần, cấu trúc GDPT 2018)</i>
              </div>
              <div>
                <b className="block text-sm sm:text-base font-extrabold uppercase text-teal-900">
                  ĐỀ KIỂM TRA MÔN TOÁN LỚP {grade}
                </b>
                <span className="block font-semibold text-slate-600">SÁCH KẾT NỐI TRI THỨC VỚI CUỘC SỐNG</span>
                <span className="block text-xs text-slate-500">Thời gian: <b>{durationMinutes} phút</b></span>
                <span className="inline-block mt-1 font-bold bg-slate-100 px-2 py-0.5 rounded border border-slate-300 text-xs">
                  Mã đề: {activeExam.code}
                </span>
              </div>
            </div>

            <div className="flex justify-between flex-wrap gap-2 text-xs sm:text-sm pb-3 border-b border-dashed border-slate-200 text-slate-600">
              <div>Thí sinh: <b>{studentName || '………………………………………'}</b></div>
              <div>Lớp: <b>………………</b></div>
              <div>SBD: <b>………………</b></div>
            </div>

            {/* PART I */}
            <div className="space-y-4">
              <div className="border-b border-teal-800 pb-1">
                <h3 className="text-sm sm:text-base font-extrabold text-teal-900 uppercase">
                  PHẦN I. Câu trắc nghiệm nhiều phương án lựa chọn.
                </h3>
                <p className="text-xs text-slate-500 italic">
                  Thí sinh trả lời từ câu 1 đến câu {activeExam.partA.length}. Mỗi câu hỏi chọn duy nhất 1 phương án (0,25 điểm/câu).
                </p>
              </div>

              <div className="space-y-4">
                {activeExam.partA.map((q, idx) => (
                  <div key={q.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                    <div className="font-semibold text-xs sm:text-sm text-slate-800">
                      <span className="text-rose-600 font-bold mr-1">Câu {idx + 1}.</span>
                      <MathView text={q.stem} />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm">
                      {q.opts.map((opt, optIdx) => {
                        const optKey = ['A', 'B', 'C', 'D'][optIdx];
                        const isSelected = answersA[q.id] === optIdx;
                        const isCorrect = q.ci === optIdx;
                        let btnStyle = 'border-slate-200 bg-white hover:border-teal-700 text-slate-700';

                        if (isSelected) {
                          btnStyle = 'border-teal-700 bg-teal-50 font-bold text-teal-900 ring-1 ring-teal-700';
                        }
                        if (isSubmitted) {
                          if (isCorrect) {
                            btnStyle = 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold ring-2 ring-emerald-500';
                          } else if (isSelected && !isCorrect) {
                            btnStyle = 'border-rose-500 bg-rose-50 text-rose-900 ring-2 ring-rose-400';
                          }
                        }

                        return (
                          <button
                            key={optIdx}
                            disabled={isSubmitted}
                            onClick={() => setAnswersA(prev => ({ ...prev, [q.id]: optIdx }))}
                            className={`p-2.5 rounded-lg border text-left flex items-start gap-2 cursor-pointer transition-all ${btnStyle}`}
                          >
                            <span className="font-bold text-teal-800 shrink-0">{optKey}.</span>
                            <div className="flex-1">
                              <MathView text={opt} />
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {isSubmitted && (
                      <div className="mt-2 pt-2 border-t border-dashed border-slate-200 text-xs text-slate-600 space-y-1">
                        <div className="font-bold text-emerald-700">
                          Đáp án đúng: {['A', 'B', 'C', 'D'][q.ci]}. <MathView text={q.opts[q.ci]} />
                        </div>
                        <div className="text-slate-700">
                          <b>Lời giải:</b> <MathView text={q.sol} />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* PART II */}
            <div className="space-y-4 pt-4">
              <div className="border-b border-teal-800 pb-1">
                <h3 className="text-sm sm:text-base font-extrabold text-teal-900 uppercase">
                  PHẦN II. Câu trắc nghiệm đúng sai.
                </h3>
                <p className="text-xs text-slate-500 italic">
                  Thí sinh trả lời từ câu 1 đến câu {activeExam.partB.length}. Trong mỗi ý a), b), c), d), thí sinh chọn Đúng hoặc Sai.
                </p>
              </div>

              <div className="space-y-4">
                {activeExam.partB.map((q, idx) => (
                  <div key={q.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                    <div className="font-semibold text-xs sm:text-sm text-slate-800">
                      <span className="text-rose-600 font-bold mr-1">Câu {idx + 1}.</span>
                      <MathView content={q.stem} inline />
                    </div>

                    <div className="space-y-2 text-xs sm:text-sm">
                      {q.items.map((it, itemIdx) => {
                        const itemKey = ['a', 'b', 'c', 'd'][itemIdx];
                        const userVal = answersB[q.id]?.[itemIdx];
                        const isCorrect = userVal === it.t;

                        return (
                          <div key={itemIdx} className="flex items-center justify-between gap-3 p-2 bg-white rounded-lg border border-slate-200">
                            <div className="flex-1">
                              <b className="text-slate-800 mr-1.5">{itemKey})</b>
                              <MathView content={it.s} inline />
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                disabled={isSubmitted}
                                onClick={() => {
                                  setAnswersB(prev => ({
                                    ...prev,
                                    [q.id]: { ...(prev[q.id] || {}), [itemIdx]: true }
                                  }));
                                }}
                                className={`px-2.5 py-1 rounded text-xs font-bold border cursor-pointer transition-all ${
                                  userVal === true
                                    ? 'bg-teal-800 text-white border-teal-800'
                                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-300'
                                }`}
                              >
                                Đúng
                              </button>
                              <button
                                disabled={isSubmitted}
                                onClick={() => {
                                  setAnswersB(prev => ({
                                    ...prev,
                                    [q.id]: { ...(prev[q.id] || {}), [itemIdx]: false }
                                  }));
                                }}
                                className={`px-2.5 py-1 rounded text-xs font-bold border cursor-pointer transition-all ${
                                  userVal === false
                                    ? 'bg-teal-800 text-white border-teal-800'
                                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-300'
                                }`}
                              >
                                Sai
                              </button>

                              {isSubmitted && (
                                <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded ${
                                  isCorrect ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                                }`}>
                                  {it.t ? 'Đ' : 'S'}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {isSubmitted && (
                      <div className="mt-2 pt-2 border-t border-dashed border-slate-200 text-xs text-slate-600">
                        <b>Lời giải:</b> <MathView content={q.sol} inline />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* PART III */}
            <div className="space-y-4 pt-4">
              <div className="border-b border-teal-800 pb-1">
                <h3 className="text-sm sm:text-base font-extrabold text-teal-900 uppercase">
                  PHẦN III. Câu trắc nghiệm trả lời ngắn.
                </h3>
                <p className="text-xs text-slate-500 italic">
                  Thí sinh trả lời từ câu 1 đến câu {activeExam.partC.length}. Thí sinh điền kết quả dạng số vào ô đáp án (0,5 điểm/câu).
                </p>
              </div>

              <div className="space-y-4">
                {activeExam.partC.map((q, idx) => {
                  const userVal = answersC[q.id] || '';
                  const numVal = parseFloat(userVal.replace(',', '.'));
                  const isCorrect = !isNaN(numVal) && Math.abs(numVal - q.v) < 0.01;

                  return (
                    <div key={q.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                      <div className="font-semibold text-xs sm:text-sm text-slate-800">
                        <span className="text-rose-600 font-bold mr-1">Câu {idx + 1}.</span>
                        <MathView content={q.stem} inline />
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-slate-600">Đáp số của em:</span>
                        <input
                          type="text"
                          disabled={isSubmitted}
                          value={userVal}
                          onChange={(e) => setAnswersC(prev => ({ ...prev, [q.id]: e.target.value }))}
                          placeholder="Ví dụ: 3.5 hoặc -12"
                          className="border border-slate-300 rounded-lg px-3 py-1.5 text-xs sm:text-sm font-semibold w-40 bg-white"
                        />
                        {isSubmitted && (
                          <span className={`text-xs font-bold px-2 py-1 rounded ${
                            isCorrect ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                          }`}>
                            {isCorrect ? '✓ Đúng' : `✗ Sai (Đáp án: ${q.ans})`}
                          </span>
                        )}
                      </div>

                      {isSubmitted && (
                        <div className="mt-2 pt-2 border-t border-dashed border-slate-200 text-xs text-slate-600">
                          <b>Lời giải:</b> <MathView content={q.sol} inline />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="text-center pt-8 pb-4 text-xs text-slate-400 font-semibold border-t border-slate-200">
              ———————————— HẾT ————————————
            </div>

            {/* Answer Key Table */}
            {showKey && (
              <div className="mt-8 pt-6 border-t-2 border-slate-900 space-y-4">
                <h4 className="font-extrabold text-sm uppercase text-slate-900">
                  BẢNG ĐÁP ÁN VÀ MA TRẬN CHẤM ĐIỂM ({activeExam.code})
                </h4>
                <div className="space-y-3 text-xs">
                  <div>
                    <b>Phần I:</b>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {activeExam.partA.map((q, i) => (
                        <span key={q.id} className="px-2 py-1 bg-slate-100 rounded border border-slate-300">
                          <b>{i + 1}:</b> {['A', 'B', 'C', 'D'][q.ci]}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <b>Phần II:</b>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {activeExam.partB.map((q, i) => (
                        <span key={q.id} className="px-2 py-1 bg-slate-100 rounded border border-slate-300">
                          <b>Câu {i + 1}:</b> {q.items.map(it => it.t ? 'Đ' : 'S').join('-')}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <b>Phần III:</b>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {activeExam.partC.map((q, i) => (
                        <span key={q.id} className="px-2 py-1 bg-slate-100 rounded border border-slate-300">
                          <b>Câu {i + 1}:</b> {q.ans}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
        </>
      )}
    </div>
  );
};
