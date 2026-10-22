import React, { useState, useMemo } from 'react';
import {
  RefreshCw,
  CheckCircle2,
  XCircle,
  Eye,
  Zap,
  Filter,
  HelpCircle,
  ArrowRight,
} from 'lucide-react';
import { GradeLevel, PracticalProblem } from '../types';
import { PRACTICAL_PROBLEMS } from '../data/practicalMathData';
import { MathView } from './MathView';

export const PracticalView: React.FC = () => {
  const [selectedGrade, setSelectedGrade] = useState<'all' | GradeLevel>('all');
  const [selectedType, setSelectedType] = useState<
    'all' | 'multiple_choice' | 'true_false' | 'short_answer' | 'essay'
  >('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Trigger re-seed for parametric generator
  const [seed, setSeed] = useState<number>(0);

  // User input answers per problem
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [checkedStatus, setCheckedStatus] = useState<Record<string, boolean>>({});
  const [expandedSolutions, setExpandedSolutions] = useState<Record<string, boolean>>({});

  // Filter problems
  const filteredProblems = useMemo(() => {
    return PRACTICAL_PROBLEMS.filter((p) => {
      const matchGrade = selectedGrade === 'all' || p.grade === selectedGrade;
      const matchType = selectedType === 'all' || p.type === selectedType;
      const matchCat = selectedCategory === 'all' || p.context.includes(selectedCategory);
      return matchGrade && matchType && matchCat;
    });
  }, [selectedGrade, selectedType, selectedCategory]);

  // Generate dynamic instances of the filtered problems
  const problemInstances = useMemo(() => {
    // depend on seed to regenerate
    return filteredProblems.map((p) => {
      const instance = p.generate();
      return {
        ...p,
        generated: instance,
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredProblems, seed]);

  const handleRegenerate = () => {
    setSeed((prev) => prev + 1);
    setUserAnswers({});
    setCheckedStatus({});
    setExpandedSolutions({});
  };

  const handleSelectAnswer = (probId: string, ans: string) => {
    setUserAnswers((prev) => ({ ...prev, [probId]: ans }));
    setCheckedStatus((prev) => {
      const copy = { ...prev };
      delete copy[probId];
      return copy;
    });
  };

  const handleCheck = (probId: string, correctAns: string) => {
    const userAns = (userAnswers[probId] || '').trim().toLowerCase();
    const isCorrect = userAns === correctAns.trim().toLowerCase();
    setCheckedStatus((prev) => ({ ...prev, [probId]: isCorrect }));
  };

  const toggleSolution = (probId: string) => {
    setExpandedSolutions((prev) => ({ ...prev, [probId]: !prev[probId] }));
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Zap className="w-7 h-7 text-amber-500 fill-amber-500" />
            <span>Toán thực tiễn</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Ứng dụng kiến thức Toán 10, 11, 12 vào giải quyết các bài toán vật lý, kỹ thuật, kinh tế và đời sống.
          </p>
        </div>

        <button
          onClick={handleRegenerate}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-800 text-white font-semibold text-xs sm:text-sm hover:bg-teal-900 shadow-xs transition-all cursor-pointer shrink-0"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Sinh bài mới (Đổi số)</span>
        </button>
      </div>

      {/* Filter Bar (matching screenshot 5) */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs space-y-3.5">
        {/* Grade filter row */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-600 mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            Khối lớp:
          </span>
          {[
            { id: 'all', label: 'Tất cả' },
            { id: '10', label: 'Toán 10' },
            { id: '11', label: 'Toán 11' },
            { id: '12', label: 'Toán 12' },
          ].map((g) => (
            <button
              key={g.id}
              onClick={() => setSelectedGrade(g.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                selectedGrade === g.id
                  ? 'bg-teal-800 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {g.label}
            </button>
          ))}
        </div>

        {/* Category & Type Filters */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100">
          <div className="flex-1 min-w-[220px]">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-medium focus:outline-teal-700 cursor-pointer"
            >
              <option value="all">Ngẫu nhiên các bài thực tiễn (Tất cả chuyên đề)</option>
              <option value="Cơ học">Chuyển động rơi tự do & Cơ học</option>
              <option value="Kinh tế">Số sản phẩm, chi phí & Lợi nhuận</option>
              <option value="Tài chính">Gửi tiết kiệm lãi kép ngân hàng</option>
              <option value="Kỹ thuật">Tối ưu hoá thể tích & Chi phí kim loại</option>
              <option value="Trắc địa">Đo đạc hải đăng & Tam giác thực địa</option>
              <option value="Y học">Dịch tễ học & Xét nghiệm y tế</option>
            </select>
          </div>

          {/* Question types tabs */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-medium">
            <button
              onClick={() => setSelectedType('all')}
              className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                selectedType === 'all' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600'
              }`}
            >
              Tất cả
            </button>
            <button
              onClick={() => setSelectedType('multiple_choice')}
              className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                selectedType === 'multiple_choice' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600'
              }`}
            >
              Trắc nghiệm
            </button>
            <button
              onClick={() => setSelectedType('short_answer')}
              className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                selectedType === 'short_answer' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600'
              }`}
            >
              Trả lời ngắn
            </button>
          </div>
        </div>
      </div>

      {/* Problem Cards List (matching screenshot 5) */}
      <div className="space-y-5">
        {problemInstances.map((item, idx) => {
          const gen = item.generated;
          const userAns = userAnswers[item.id] || '';
          const isChecked = checkedStatus[item.id];
          const isSolutionOpen = expandedSolutions[item.id];

          return (
            <div
              key={item.id}
              className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-xs space-y-4 hover:border-slate-300 transition-all"
            >
              {/* Question Header & Badges */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-rose-600 text-sm sm:text-base">
                    Câu {idx + 1}.
                  </span>
                  <span className="font-semibold text-slate-800 text-xs sm:text-sm">
                    Thực tiễn: {item.title}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className="px-2.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 font-medium">
                    {item.type === 'multiple_choice' ? 'Trắc nghiệm · thực tiễn' : 'Trả lời ngắn · thực tiễn'}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                    {item.difficulty}
                  </span>
                </div>
              </div>

              {/* Question Body */}
              <div className="text-sm sm:text-base text-slate-800 font-medium leading-relaxed">
                <MathView text={gen.question} />
              </div>

              {/* Input Options (Multiple choice or Short answer) */}
              {gen.options ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {gen.options.map((opt) => {
                    const isSelected = userAns === opt.id;
                    return (
                      <button
                        key={opt.id}
                        onClick={() => handleSelectAnswer(item.id, opt.id)}
                        className={`p-3 rounded-xl border text-left text-xs sm:text-sm font-medium transition-all flex items-center gap-3 cursor-pointer ${
                          isSelected
                            ? 'bg-teal-50 border-teal-700 text-teal-950 font-semibold shadow-xs ring-1 ring-teal-700'
                            : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-800'
                        }`}
                      >
                        <span
                          className={`w-6 h-6 rounded-md flex items-center justify-center font-bold text-xs shrink-0 ${
                            isSelected ? 'bg-teal-800 text-white' : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {opt.id}
                        </span>
                        <div className="flex-1">
                          <MathView text={opt.text} />
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="flex items-center gap-3 max-w-sm">
                  <input
                    type="text"
                    placeholder="Điền đáp số (ví dụ: 3)..."
                    value={userAns}
                    onChange={(e) => handleSelectAnswer(item.id, e.target.value)}
                    className="flex-1 px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-teal-700"
                  />
                </div>
              )}

              {/* Action Buttons: Kiểm tra & Xem lời giải */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-2.5">
                  <button
                    disabled={!userAns}
                    onClick={() => handleCheck(item.id, gen.correctAnswer)}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      userAns
                        ? 'bg-teal-800 text-white hover:bg-teal-900 shadow-xs'
                        : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Kiểm tra</span>
                  </button>

                  <button
                    onClick={() => toggleSolution(item.id)}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border border-slate-200 text-slate-700 hover:bg-slate-50 transition-all cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 text-slate-500" />
                    <span>{isSolutionOpen ? 'Ẩn lời giải' : 'Xem lời giải'}</span>
                  </button>
                </div>

                {/* Instant Feedback indicator */}
                {isChecked !== undefined && (
                  <div
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold ${
                      isChecked
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-rose-50 text-rose-800 border border-rose-200'
                    }`}
                  >
                    {isChecked ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Chính xác! Đáp án đúng là {gen.correctAnswer}</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4 text-rose-600" />
                        <span>Chưa đúng! Đáp án đúng là {gen.correctAnswer}</span>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Step-by-Step Expanded Solution */}
              {isSolutionOpen && (
                <div className="p-4 sm:p-5 bg-teal-50/40 rounded-xl border border-teal-200/80 space-y-2.5 text-xs sm:text-sm text-slate-800 animate-in fade-in duration-150">
                  <div className="font-bold text-teal-900 flex items-center gap-1.5">
                    <HelpCircle className="w-4 h-4 text-teal-700" />
                    <span>Các bước giải chi tiết:</span>
                  </div>
                  <div className="space-y-1.5 pl-5 list-decimal">
                    {gen.solutionSteps.map((step, sIdx) => (
                      <div key={sIdx} className="leading-relaxed">
                        <MathView text={`Bước ${sIdx + 1}: ${step}`} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Curriculum anchor link */}
              <div className="pt-2 border-t border-slate-100 text-xs text-slate-500 flex items-center gap-1.5 font-medium">
                <span className="text-teal-700 font-semibold">Gắn với:</span>
                <span>{item.curriculumLink}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
