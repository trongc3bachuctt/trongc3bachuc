import React, { useState } from 'react';
import {
  Sparkles,
  RefreshCw,
  Send,
  X,
  HelpCircle,
  CheckCircle2,
  XCircle,
  BookOpen,
  MessageSquare,
  Zap,
} from 'lucide-react';
import { MathView } from './MathView';
import { GradeLevel } from '../types';

interface AIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTopic?: string;
  defaultGrade?: GradeLevel;
  questionToMutate?: string;
}

export const AIAssistantModal: React.FC<AIAssistantModalProps> = ({
  isOpen,
  onClose,
  defaultTopic = 'Khảo sát hàm số & Cực trị',
  defaultGrade = '12',
  questionToMutate,
}) => {
  const [activeTab, setActiveTab] = useState<'generate' | 'transform' | 'ask'>('generate');

  // Generator states
  const [grade, setGrade] = useState<GradeLevel>(defaultGrade);
  const [topic, setTopic] = useState<string>(defaultTopic);
  const [difficulty, setDifficulty] = useState<string>('Vận dụng');
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Result question
  const [aiQuestion, setAiQuestion] = useState<any>(null);
  const [userSelectedOption, setUserSelectedOption] = useState<string | null>(null);
  const [checkedResult, setCheckedResult] = useState<boolean | null>(null);
  const [showSolution, setShowSolution] = useState<boolean>(false);

  // Mutate states
  const [inputQuestion, setInputQuestion] = useState<string>(questionToMutate || '');

  // Ask AI states
  const [askQuery, setAskQuery] = useState<string>('');
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);

  if (!isOpen) return null;

  // Handle AI Generate Question
  const handleGenerate = async () => {
    setIsLoading(true);
    setAiQuestion(null);
    setUserSelectedOption(null);
    setCheckedResult(null);
    setShowSolution(false);

    try {
      const res = await fetch('/api/ai/generate-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          grade,
          topic,
          difficulty,
          requestPrompt: customPrompt,
        }),
      });
      const data = await res.json();
      if (data.success && data.question) {
        setAiQuestion(data.question);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle AI Mutate / Transform Question (Đổi số)
  const handleTransform = async () => {
    if (!inputQuestion.trim()) return;
    setIsLoading(true);
    setAiQuestion(null);
    setUserSelectedOption(null);
    setCheckedResult(null);
    setShowSolution(false);

    try {
      const res = await fetch('/api/ai/transform-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          originalQuestion: inputQuestion,
          lessonTitle: topic,
        }),
      });
      const data = await res.json();
      if (data.success && data.question) {
        setAiQuestion(data.question);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Ask AI Tutor
  const handleAskTutor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!askQuery.trim()) return;
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: aiQuestion ? aiQuestion.question : topic,
          step: 'Tất cả các bước giải',
          userQuery: askQuery,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setAiExplanation(data.explanation);
      }
    } catch (err) {
      console.error(err);
      const q = askQuery.toLowerCase();
      let fallback = '';
      if (q.includes('bậc 2') || q.includes('bậc hai')) {
        fallback = `### Hướng dẫn giải phương trình bậc hai một ẩn $ax^2 + bx + c = 0$ ($a \\neq 0$)\n*(Chuẩn SGK Toán THCS & THPT Kết nối tri thức với cuộc sống)*\n\n#### 1. Dạng tổng quát & Điều kiện:\n$$ax^2 + bx + c = 0 \\quad (a \\neq 0)$$\n\n#### 2. Các bước giải chi tiết:\n- **Bước 1 (Xác định hệ số):** Đưa phương trình về dạng chuẩn, xác định $a, b, c$ ($a \\neq 0$).\n- **Bước 2 (Mẹo nhẩm nghiệm nhanh):**\n  - Nếu $a + b + c = 0 \\implies x_1 = 1, \\ x_2 = \\dfrac{c}{a}$.\n  - Nếu $a - b + c = 0 \\implies x_1 = -1, \\ x_2 = -\\dfrac{c}{a}$.\n- **Bước 3 (Công thức tổng quát $\\Delta = b^2 - 4ac$):**\n  - $\\Delta < 0$: Phương trình **vô nghiệm** trên $\\mathbb{R}$.\n  - $\\Delta = 0$: Phương trình có **nghiệm kép**: $x_1 = x_2 = -\\dfrac{b}{2a}$.\n  - $\\Delta > 0$: Phương trình có **2 nghiệm phân biệt**: $x_{1,2} = \\dfrac{-b \\pm \\sqrt{\\Delta}}{2a}$.\n\n> **Mẹo Casio fx-880 BTG:** Nhấn **HOME** ➔ chọn **Equation** ➔ chọn **Polynomial** ➔ chọn bậc 2 và nhập hệ số $a, b, c$ ➔ bấm **EXE** để hiển thị nghiệm và toạ độ đỉnh Parabol.\n\n#### 3. Ví dụ áp dụng:\nGiải phương trình: $x^2 - 5x + 6 = 0$\n- $a = 1, b = -5, c = 6$.\n- $\\Delta = (-5)^2 - 4 \\cdot 1 \\cdot 6 = 1 > 0$.\n- Do $\\Delta > 0$, phương trình có hai nghiệm phân biệt: $x_1 = 3, \\ x_2 = 2$.\n- Kết luận: Tập nghiệm $S = \\{2; 3\\}$.`;
      } else if (q.includes('tổng và hiệu') || q.includes('tổng hiệu')) {
        fallback = `### Hướng dẫn giải bài toán Tìm hai số khi biết Tổng và Hiệu (Toán Tiểu học)\n\n#### 1. Công thức cốt lõi:\n- **Số bé** = $(\\text{Tổng} - \\text{Hiệu}) : 2$\n- **Số lớn** = $(\\text{Tổng} + \\text{Hiệu}) : 2$\n\n#### 2. Các bước giải chuẩn:\n- **Bước 1:** Xác định rõ đâu là Tổng, đâu là Hiệu.\n- **Bước 2:** Vẽ sơ đồ đoạn thẳng biểu thị Số lớn và Số bé.\n- **Bước 3:** Áp dụng công thức tính và viết đáp số có kèm danh số.`;
      } else if (q.includes('chuyển động') || q.includes('vận tốc')) {
        fallback = `### Hướng dẫn giải bài toán Chuyển động đều (Toán Tiểu học & THCS)\n\n#### 1. Ba công thức cốt lõi:\n$$s = v \\times t, \\quad v = s : t, \\quad t = s : v$$\n\n#### 2. Chuyển động ngược chiều và cùng chiều:\n- Hai vật chuyển động ngược chiều gặp nhau: $v_{\\text{gặp}} = v_1 + v_2 \\implies t_{\\text{gặp}} = s : (v_1 + v_2)$.\n- Hai vật chuyển động cùng chiều đuổi nhau: $v_{\\text{đuổi}} = v_1 - v_2 \\implies t_{\\text{đuổi}} = \\text{Khoảng cách} : (v_1 - v_2)$.`;
      } else if (q.includes('cực trị') || q.includes('cực đại') || q.includes('cực tiểu')) {
        fallback = `### Phương pháp tìm cực trị của hàm số (Toán 12 - Kết nối tri thức)\n\n#### 1. Quy tắc xét dấu đạo hàm cấp 1:\n- **Bước 1:** Tìm tập xác định $D$ của hàm số $y = f(x)$.\n- **Bước 2:** Tính đạo hàm $f'(x)$. Giải phương trình $f'(x) = 0$ và tìm các điểm đạo hàm không xác định.\n- **Bước 3:** Lập bảng biến thiên hoặc xét dấu $f'(x)$:\n  - Đổi dấu từ dương $(+)$ sang âm $(-)$ $\\implies$ Điểm cực đại.\n  - Đổi dấu từ âm $(-)$ sang dương $(+)$ $\\implies$ Điểm cực tiểu.`;
      } else {
        fallback = `### Hướng dẫn sư phạm từ Thầy Trần Trọng (Sách Kết nối tri thức)\n\nĐối với câu hỏi của em về *\"${askQuery}\"*:\n\n1. **Nhận dạng kiến thức:** Xác định dạng toán thuộc khối lớp tương ứng (Tiểu học, THCS hoặc THPT).\n2. **Công thức cốt lõi:** Luôn xuất phát từ định nghĩa, định lý chuẩn trong SGK Kết nối tri thức với cuộc sống.\n3. **Thực hiện giải toán:** Trình bày rõ ràng từng bước theo cấu trúc tự luận logic hoặc dùng kỹ thuật bấm máy tính Casio fx-880 BTG để kiểm tra nghiệm.`;
      }
      setAiExplanation(fallback);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectOption = (optId: string) => {
    setUserSelectedOption(optId);
    setCheckedResult(null);
  };

  const handleCheckAnswer = () => {
    if (!aiQuestion || !userSelectedOption) return;
    setCheckedResult(userSelectedOption === aiQuestion.correctAnswer);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-5 sm:p-7 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-150 my-auto max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-teal-50 text-teal-800 border border-teal-200">
              <Sparkles className="w-5 h-5 text-teal-700" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base sm:text-lg flex items-center gap-2">
                <span>Trợ lý Toán học AI – Thầy Trần Trọng</span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 font-bold">
                  Gemini AI
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Tự động sinh bài toán mới, biến đổi số liệu và giải thích các bước giải trực quan
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setActiveTab('generate')}
            className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer text-center ${
              activeTab === 'generate'
                ? 'bg-white text-teal-950 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Sinh câu hỏi mới
          </button>
          <button
            onClick={() => setActiveTab('transform')}
            className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer text-center ${
              activeTab === 'transform'
                ? 'bg-white text-teal-950 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Đổi số liệu bài toán
          </button>
          <button
            onClick={() => setActiveTab('ask')}
            className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer text-center ${
              activeTab === 'ask'
                ? 'bg-white text-teal-950 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Hỏi AI giải thích
          </button>
        </div>

        {/* TAB 1: GENERATE NEW QUESTION */}
        {activeTab === 'generate' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Khối lớp:</label>
                <select
                  value={grade}
                  onChange={(e) => setGrade(e.target.value as GradeLevel)}
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 font-medium"
                >
                  <option value="12">Toán 12</option>
                  <option value="11">Toán 11</option>
                  <option value="10">Toán 10</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Mức độ:</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 font-medium"
                >
                  <option value="Nhận biết">Nhận biết</option>
                  <option value="Thông hiểu">Thông hiểu</option>
                  <option value="Vận dụng">Vận dụng</option>
                  <option value="Vận dụng cao">Vận dụng cao</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Chủ đề:</label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Ví dụ: Cực trị hàm số, Oxyz, Lượng giác..."
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Yêu cầu bổ sung (tuỳ chọn):
              </label>
              <input
                type="text"
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="Ví dụ: Sinh bài toán thực tế có liên quan đến lợi nhuận..."
                className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200"
              />
            </div>

            <div className="flex justify-end">
              <button
                disabled={isLoading}
                onClick={handleGenerate}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-800 text-white font-bold text-xs hover:bg-teal-900 transition-all cursor-pointer shadow-xs"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>{isLoading ? 'Đang tạo câu hỏi...' : 'Sinh bài toán AI ngay'}</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: TRANSFORM / CHANGE NUMBERS */}
        {activeTab === 'transform' && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Dán câu hỏi hoặc số liệu hiện tại cần đổi:
              </label>
              <textarea
                rows={3}
                value={inputQuestion}
                onChange={(e) => setInputQuestion(e.target.value)}
                placeholder="Ví dụ: Một vật rơi tự do theo phương trình s(t) = 4,9t² (m). Vận tốc tại t = 4s là..."
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
              />
            </div>

            <div className="flex justify-end">
              <button
                disabled={isLoading || !inputQuestion.trim()}
                onClick={handleTransform}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-800 text-white font-bold text-xs hover:bg-teal-900 transition-all cursor-pointer shadow-xs"
              >
                <RefreshCw className="w-4 h-4 text-teal-200" />
                <span>{isLoading ? 'Đang đổi số liệu...' : 'Đổi số liệu & Sinh bài mới'}</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 3: ASK TUTOR QUESTION */}
        {activeTab === 'ask' && (
          <div className="space-y-4">
            <form onSubmit={handleAskTutor} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Đặt câu hỏi thắc mắc cho Thầy Trần Trọng:
                </label>
                <textarea
                  rows={3}
                  value={askQuery}
                  onChange={(e) => setAskQuery(e.target.value)}
                  placeholder="Ví dụ: Thầy ơi, tại sao chỗ này đạo hàm lại đổi dấu khi qua nghiệm x = 1 ạ?"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isLoading || !askQuery.trim()}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-800 text-white font-bold text-xs hover:bg-teal-900 transition-all cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isLoading ? 'Thầy đang trả lời...' : 'Gửi câu hỏi cho Thầy'}</span>
                </button>
              </div>
            </form>

            {aiExplanation && (
              <div className="p-4 bg-teal-50/70 rounded-xl border border-teal-200 text-xs sm:text-sm text-slate-800 space-y-2 animate-in fade-in duration-150">
                <p className="font-bold text-teal-900 flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-teal-700" />
                  <span>Giải đáp từ Thầy Trần Trọng:</span>
                </p>
                <div className="leading-relaxed pl-5 whitespace-pre-line">
                  <MathView text={aiExplanation} />
                </div>
              </div>
            )}
          </div>
        )}

        {/* DISPLAY GENERATED QUESTION CARD */}
        {aiQuestion && (
          <div className="p-5 rounded-2xl border border-teal-200 bg-teal-50/20 space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-teal-100">
              <span className="text-xs font-bold text-teal-900 flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                Câu hỏi tự sinh bởi AI ({aiQuestion.difficulty || difficulty})
              </span>
              <span className="text-xs text-slate-500 font-mono">{aiQuestion.topic || topic}</span>
            </div>

            {/* Question Stem */}
            <div className="text-sm font-semibold text-slate-900 leading-relaxed">
              <MathView text={aiQuestion.question} />
            </div>

            {/* Options */}
            {aiQuestion.options && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {aiQuestion.options.map((opt: any) => {
                  const isSelected = userSelectedOption === opt.id;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => handleSelectOption(opt.id)}
                      className={`p-3 rounded-xl border text-left text-xs font-medium transition-all flex items-center gap-2.5 cursor-pointer ${
                        isSelected
                          ? 'bg-teal-50 border-teal-700 text-teal-950 font-semibold ring-1 ring-teal-700'
                          : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-800'
                      }`}
                    >
                      <span
                        className={`w-5 h-5 rounded flex items-center justify-center font-bold text-[11px] ${
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
            )}

            {/* Actions for generated question */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-teal-100">
              <div className="flex items-center gap-2">
                <button
                  disabled={!userSelectedOption}
                  onClick={handleCheckAnswer}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    userSelectedOption
                      ? 'bg-teal-800 text-white hover:bg-teal-900 cursor-pointer'
                      : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Kiểm tra</span>
                </button>

                <button
                  onClick={() => setShowSolution(!showSolution)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-300 text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  {showSolution ? 'Ẩn lời giải' : 'Xem lời giải'}
                </button>
              </div>

              {checkedResult !== null && (
                <div
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold ${
                    checkedResult
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-rose-50 text-rose-800 border border-rose-200'
                  }`}
                >
                  {checkedResult ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Chính xác! Đáp án đúng là {aiQuestion.correctAnswer}</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-3.5 h-3.5 text-rose-600" />
                      <span>Chưa đúng! Đáp án đúng là {aiQuestion.correctAnswer}</span>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Expanded Solution */}
            {showSolution && (
              <div className="p-3.5 bg-white rounded-xl border border-teal-200 text-xs text-slate-800 space-y-1">
                <div className="font-bold text-teal-900">
                  Đáp án: <span className="font-mono text-emerald-700">{aiQuestion.correctAnswer}</span>
                </div>
                <div className="leading-relaxed pl-3 text-slate-600">
                  <MathView text={aiQuestion.explanation} />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
