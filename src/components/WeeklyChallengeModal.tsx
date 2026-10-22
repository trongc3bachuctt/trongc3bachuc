import React, { useState, useEffect } from 'react';
import { Trophy, Award, Send, CheckCircle2, HelpCircle } from 'lucide-react';
import { MathView } from './MathView';

const DEFAULT_WEEKLY_PROBLEM = {
  week: 'Tuần 3 - Tháng 10/2026',
  title: 'Cực trị hình học không gian kết hợp bất đẳng thức AM-GM',
  question:
    'Cho khối chóp $S.ABC$ có đáy $ABC$ là tam giác đều cạnh $a$. Cạnh bên $SA$ vuông góc với mặt phẳng đáy $(ABC)$. Gọi $M, N$ lần lượt là hình chiếu vuông góc của $A$ lên $SB$ và $SC$. Biết khoảng cách từ $A$ đến mặt phẳng $(SMN)$ đạt giá trị lớn nhất. Tìm giá trị của độ dài đoạn thẳng $SA$ theo $a$.',
  options: ['A. a√2/2', 'B. a√3/2', 'C. a', 'D. a/2'],
  correct: 'A',
  solution:
    'Ta có $BC \\perp (SAB) \\Rightarrow (SAB) \\perp (SBC)$. Khi $SA = x$, thể tích tứ diện $S.AMN$ đạt giá trị lớn nhất khi $x = \\frac{a\\sqrt{2}}{2}$ theo bất đẳng thức AM-GM. Do đó đáp án là A.',
};

interface WeeklyProblemData {
  week: string;
  title: string;
  question: string;
  options: string[];
  correct: string;
  solution: string;
}

export const WeeklyChallengeModal: React.FC<{ onClose?: () => void }> = () => {
  const [submitted, setSubmitted] = useState(false);
  const [answer, setAnswer] = useState('');
  const [showSolution, setShowSolution] = useState(false);
  const [weeklyProblem, setWeeklyProblem] = useState<WeeklyProblemData>(() => {
    try {
      const stored = localStorage.getItem('weekly_challenge_data');
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return DEFAULT_WEEKLY_PROBLEM;
  });

  useEffect(() => {
    const handleUpdate = () => {
      try {
        const stored = localStorage.getItem('weekly_challenge_data');
        if (stored) setWeeklyProblem(JSON.parse(stored));
      } catch (e) {}
    };
    window.addEventListener('weekly_challenge_updated', handleUpdate);
    return () => window.removeEventListener('weekly_challenge_updated', handleUpdate);
  }, []);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
        <div className="p-3 bg-amber-50 text-amber-700 rounded-2xl border border-amber-200">
          <Trophy className="w-6 h-6" />
        </div>
        <div>
          <span className="text-xs font-bold text-amber-800 uppercase font-mono">
            {weeklyProblem.week}
          </span>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Bài toán tuần này – Thử thách cùng thầy Trần Trọng
          </h2>
        </div>
      </div>

      <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
        <h3 className="font-bold text-teal-900 text-base">{weeklyProblem.title}</h3>
        <div className="text-sm sm:text-base text-slate-800 leading-relaxed font-medium">
          <MathView text={weeklyProblem.question} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {weeklyProblem.options.map((opt) => (
          <button
            key={opt}
            onClick={() => setAnswer(opt.charAt(0))}
            className={`p-3.5 rounded-xl border text-left text-sm font-medium transition-all cursor-pointer ${
              answer === opt.charAt(0)
                ? 'bg-teal-50 border-teal-700 text-teal-950 font-semibold ring-1 ring-teal-700'
                : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-800'
            }`}
          >
            <MathView text={opt} />
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
        <div className="flex items-center gap-2">
          <button
            disabled={!answer}
            onClick={() => {
              setSubmitted(true);
              if (answer === weeklyProblem.correct && typeof window !== 'undefined' && (window as any).triggerFireworks) {
                (window as any).triggerFireworks();
              }
            }}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              answer
                ? 'bg-teal-800 text-white hover:bg-teal-900 cursor-pointer shadow-xs'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}
          >
            <Send className="w-4 h-4" />
            <span>Gửi câu trả lời</span>
          </button>

          <button
            onClick={() => setShowSolution(!showSolution)}
            className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold border border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer"
          >
            {showSolution ? 'Ẩn lời giải' : 'Xem lời giải tuần'}
          </button>
        </div>

        {submitted && (
          <div className="flex items-center gap-1.5 text-emerald-700 text-xs sm:text-sm font-bold">
            <CheckCircle2 className="w-4 h-4" />
            <span>Đã gửi câu trả lời! Đáp án chính xác là {weeklyProblem.correct}.</span>
          </div>
        )}
      </div>

      {showSolution && (
        <div className="p-4 bg-teal-50/50 rounded-xl border border-teal-200 text-xs sm:text-sm text-slate-800 space-y-1.5">
          <div className="font-bold text-teal-900 flex items-center gap-1.5">
            <HelpCircle className="w-4 h-4 text-teal-700" />
            <span>Hướng dẫn giải chi tiết từ thầy Trần Trọng:</span>
          </div>
          <p className="leading-relaxed pl-5">{weeklyProblem.solution}</p>
        </div>
      )}
    </div>
  );
};
