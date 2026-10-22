import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Plus,
  Trash2,
  Edit2,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  Check,
  Copy,
  Code2,
  Sparkles,
  Info,
  HelpCircle,
  FileCode,
  Save,
} from 'lucide-react';
import { MathView } from './MathView';

interface FormulaEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  lessonId: string;
  lessonName: string;
  chapterTitle?: string;
  defaultFormulas: string[];
  currentFormulas: string[];
  onSaveFormulas: (formulas: string[]) => void;
  onResetToDefault: () => void;
  isCustomized: boolean;
}

const MATH_SYMBOLS = [
  { label: 'a/b', insert: '$\\frac{a}{b}$', title: 'Phân số' },
  { label: '√x', insert: '$\\sqrt{x}$', title: 'Căn bậc hai' },
  { label: 'x²', insert: '$x^2$', title: 'Lũy thừa / Số mũ' },
  { label: 'xₙ', insert: '$x_n$', title: 'Chỉ số dưới' },
  { label: 'u⃗', insert: '$\\vec{u}$', title: 'Vectơ' },
  { label: '±', insert: '$\\pm$', title: 'Cộng trừ' },
  { label: '≠', insert: '$\\ne$', title: 'Khác' },
  { label: '≤', insert: '$\\le$', title: 'Nhỏ hơn hoặc bằng' },
  { label: '≥', insert: '$\\ge$', title: 'Lớn hơn hoặc bằng' },
  { label: '∈', insert: '$\\in$', title: 'Thuộc tập hợp' },
  { label: '∉', insert: '$\\notin$', title: 'Không thuộc' },
  { label: '⊂', insert: '$\\subset$', title: 'Tập con' },
  { label: '∩', insert: '$\\cap$', title: 'Giao tập hợp' },
  { label: '∪', insert: '$\\cup$', title: 'Hợp tập hợp' },
  { label: '∀', insert: '$\\forall$', title: 'Với mọi' },
  { label: '∃', insert: '$\\exists$', title: 'Tồn tại' },
  { label: '⇒', insert: '$\\Rightarrow$', title: 'Mệnh đề kéo theo' },
  { label: '⇔', insert: '$\\Leftrightarrow$', title: 'Mệnh đề tương đương' },
  { label: '∞', insert: '$\\infty$', title: 'Vô cực' },
  { label: 'π', insert: '$\\pi$', title: 'Số Pi' },
  { label: 'α', insert: '$\\alpha$', title: 'Góc Alpha' },
  { label: 'Δ', insert: '$\\Delta$', title: 'Biệt thức Delta' },
  { label: '∫', insert: '$\\int_{a}^{b} f(x)\\,dx$', title: 'Tích phân' },
  { label: 'lim', insert: '$\\lim_{x \\to x_0} f(x)$', title: 'Giới hạn' },
];

export const FormulaEditorModal: React.FC<FormulaEditorModalProps> = ({
  isOpen,
  onClose,
  lessonId,
  lessonName,
  chapterTitle,
  defaultFormulas,
  currentFormulas,
  onSaveFormulas,
  onResetToDefault,
  isCustomized,
}) => {
  const [activeTab, setActiveTab] = useState<'editor' | 'code_guide'>('editor');
  const [formulas, setFormulas] = useState<string[]>(currentFormulas);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [formulaInput, setFormulaInput] = useState<string>('');
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [notification, setNotification] = useState<string | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setFormulas(currentFormulas);
  }, [currentFormulas, isOpen]);

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification(null);
    }, 2800);
  };

  const insertSymbol = (sym: string) => {
    if (!textareaRef.current) {
      setFormulaInput((prev) => prev + sym);
      return;
    }
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentVal = textarea.value;

    const newVal = currentVal.substring(0, start) + sym + currentVal.substring(end);
    setFormulaInput(newVal);

    setTimeout(() => {
      textarea.focus();
      const nextPos = start + sym.length;
      textarea.setSelectionRange(nextPos, nextPos);
    }, 10);
  };

  const handleStartEdit = (index: number) => {
    setEditingIndex(index);
    setFormulaInput(formulas[index]);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const handleCancelInput = () => {
    setEditingIndex(null);
    setFormulaInput('');
  };

  const handleSaveFormulaItem = () => {
    const trimmed = formulaInput.trim();
    if (!trimmed) return;

    let updated: string[];
    if (editingIndex !== null) {
      updated = [...formulas];
      updated[editingIndex] = trimmed;
      showToast('Đã cập nhật công thức thành công!');
    } else {
      updated = [...formulas, trimmed];
      showToast('Đã thêm công thức mới!');
    }

    setFormulas(updated);
    onSaveFormulas(updated);
    setEditingIndex(null);
    setFormulaInput('');
  };

  const handleDelete = (index: number) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa công thức này khỏi bài học không?')) {
      const updated = formulas.filter((_, idx) => idx !== index);
      setFormulas(updated);
      onSaveFormulas(updated);
      if (editingIndex === index) {
        handleCancelInput();
      }
      showToast('Đã xóa công thức.');
    }
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const updated = [...formulas];
    const temp = updated[index - 1];
    updated[index - 1] = updated[index];
    updated[index] = temp;
    setFormulas(updated);
    onSaveFormulas(updated);
  };

  const handleMoveDown = (index: number) => {
    if (index === formulas.length - 1) return;
    const updated = [...formulas];
    const temp = updated[index + 1];
    updated[index + 1] = updated[index];
    updated[index] = temp;
    setFormulas(updated);
    onSaveFormulas(updated);
  };

  const handleReset = () => {
    if (
      window.confirm(
        'Khôi phục lại danh sách công thức mặc định theo chương trình sách giáo khoa?'
      )
    ) {
      onResetToDefault();
      setFormulas(defaultFormulas);
      handleCancelInput();
      showToast('Đã khôi phục các công thức mặc định.');
    }
  };

  // Generate code snippet to paste in src/data/curriculumData.ts
  const generateTsCode = () => {
    const formatted = formulas
      .map((f) => {
        // escape backslashes for ts code string
        const escaped = f.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
        return `        "${escaped}",`;
      })
      .join('\n');

    return `// Trong file src/data/curriculumData.ts (Bài học: "${lessonName}", ID: "${lessonId}"):\nboxedFormulas: [\n${formatted}\n],`;
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(generateTsCode());
      setCopiedCode(true);
      showToast('Đã sao chép mã code vào Clipboard!');
      setTimeout(() => setCopiedCode(false), 2500);
    } catch {
      showToast('Không thể sao chép, vui lòng bôi đen và nhấn Ctrl+C.');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-200 bg-linear-to-r from-teal-900 via-teal-800 to-slate-900 text-white">
          <div className="space-y-0.5 pr-4">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-teal-700/80 text-[11px] font-semibold text-teal-100 uppercase tracking-wide">
                Quản lý công thức
              </span>
              {isCustomized && (
                <span className="px-2 py-0.5 rounded-md bg-amber-400 text-slate-900 text-[11px] font-bold">
                  Đã tùy chỉnh
                </span>
              )}
            </div>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white line-clamp-1">
              {lessonName}
            </h2>
            {chapterTitle && (
              <p className="text-xs text-teal-200/80 line-clamp-1">{chapterTitle}</p>
            )}
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-teal-200 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
            aria-label="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-2 px-5 sm:px-6 pt-3 border-b border-slate-200 bg-slate-50 text-xs sm:text-sm font-semibold">
          <button
            onClick={() => setActiveTab('editor')}
            className={`flex items-center gap-1.5 py-2.5 px-3 border-b-2 transition-all cursor-pointer ${
              activeTab === 'editor'
                ? 'border-teal-700 text-teal-800 font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Edit2 className="w-4 h-4" />
            <span>Sửa & Thêm trực tiếp trên giao diện</span>
            <span className="ml-1 px-1.5 py-0.5 rounded-full bg-slate-200 text-[11px]">
              {formulas.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('code_guide')}
            className={`flex items-center gap-1.5 py-2.5 px-3 border-b-2 transition-all cursor-pointer ${
              activeTab === 'code_guide'
                ? 'border-teal-700 text-teal-800 font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Code2 className="w-4 h-4" />
            <span>Hướng dẫn sửa vĩnh viễn trong code (curriculumData.ts)</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {notification && (
            <div className="flex items-center gap-2 p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-sm font-medium animate-in fade-in">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>{notification}</span>
            </div>
          )}

          {activeTab === 'editor' && (
            <div className="space-y-6">
              {/* Formula Input / Edit Form */}
              <div className="bg-slate-50 rounded-xl p-4 sm:p-5 border border-slate-200/90 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                    {editingIndex !== null ? (
                      <>
                        <Edit2 className="w-4 h-4 text-teal-700" />
                        <span>Đang sửa công thức #{editingIndex + 1}</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 text-teal-700" />
                        <span>Thêm công thức mới cho bài học</span>
                      </>
                    )}
                  </h3>

                  {editingIndex !== null && (
                    <button
                      onClick={handleCancelInput}
                      className="text-xs text-slate-500 hover:text-slate-800 font-medium cursor-pointer"
                    >
                      Hủy sửa
                    </button>
                  )}
                </div>

                {/* Quick math symbol toolbar */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>Chèn nhanh ký hiệu toán học (LaTeX):</span>
                  </div>
                  <div className="flex flex-wrap gap-1 p-2 bg-white rounded-lg border border-slate-200/80 max-h-24 overflow-y-auto">
                    {MATH_SYMBOLS.map((sym, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => insertSymbol(sym.insert)}
                        title={sym.title}
                        className="px-2 py-1 text-xs font-mono font-medium rounded hover:bg-teal-50 hover:text-teal-800 border border-slate-200/60 bg-slate-50/50 transition-colors cursor-pointer"
                      >
                        {sym.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Formula Textarea */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-600">
                    Nội dung công thức (viết chữ tự nhiên, phần công thức toán đặt trong cặp dấu $...$):
                  </label>
                  <textarea
                    ref={textareaRef}
                    value={formulaInput}
                    onChange={(e) => setFormulaInput(e.target.value)}
                    rows={3}
                    placeholder="Ví dụ: Định lý sin: $\frac{a}{\sin A} = \frac{b}{\sin B} = \frac{c}{\sin C} = 2R$"
                    className="w-full text-sm font-mono p-3 rounded-xl border border-slate-300 focus:border-teal-700 focus:ring-2 focus:ring-teal-700/20 outline-hidden bg-white text-slate-900 transition-all resize-y"
                  />
                </div>

                {/* Real-time Math KaTeX Live Preview */}
                {formulaInput.trim() && (
                  <div className="space-y-1.5">
                    <span className="text-xs font-semibold text-teal-800 uppercase tracking-wider flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                      Xem trước hiển thị trực tiếp (KaTeX):
                    </span>
                    <div className="p-3 bg-teal-50/60 border border-teal-200 rounded-xl text-slate-900 text-sm font-medium">
                      <MathView text={formulaInput} />
                    </div>
                  </div>
                )}

                {/* Action buttons for form */}
                <div className="flex items-center justify-end gap-2 pt-1">
                  {editingIndex !== null && (
                    <button
                      type="button"
                      onClick={handleCancelInput}
                      className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                    >
                      Hủy bỏ
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleSaveFormulaItem}
                    disabled={!formulaInput.trim()}
                    className={`flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-bold rounded-lg shadow-xs transition-all cursor-pointer ${
                      formulaInput.trim()
                        ? 'bg-teal-800 text-white hover:bg-teal-900'
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <Save className="w-4 h-4" />
                    <span>{editingIndex !== null ? 'Lưu thay đổi' : 'Thêm vào bài học'}</span>
                  </button>
                </div>
              </div>

              {/* List of current formulas */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
                    Danh sách công thức hiện có ({formulas.length})
                  </h3>
                  {isCustomized && (
                    <button
                      onClick={handleReset}
                      className="flex items-center gap-1 text-xs text-rose-600 hover:text-rose-700 font-semibold hover:underline cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Khôi phục gốc</span>
                    </button>
                  )}
                </div>

                {formulas.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 text-sm border-2 border-dashed border-slate-200 rounded-xl">
                    Chưa có công thức nào. Hãy nhập ở khung phía trên để thêm công thức!
                  </div>
                ) : (
                  <div className="space-y-2">
                    {formulas.map((item, idx) => (
                      <div
                        key={idx}
                        className={`group p-3.5 rounded-xl border transition-all ${
                          editingIndex === idx
                            ? 'bg-teal-50/70 border-teal-300 ring-2 ring-teal-600/20'
                            : 'bg-white border-slate-200/90 hover:border-teal-200 hover:shadow-xs'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-2.5 flex-1 min-w-0">
                            <span className="shrink-0 inline-flex items-center justify-center w-6 h-6 rounded-md bg-teal-100 text-teal-900 text-xs font-bold font-mono">
                              {idx + 1}
                            </span>
                            <div className="space-y-1 flex-1 min-w-0 overflow-x-auto">
                              {/* KaTeX display */}
                              <div className="text-sm font-medium text-slate-900">
                                <MathView text={item} />
                              </div>
                              {/* Raw text snippet */}
                              <p className="text-[11px] font-mono text-slate-400 truncate group-hover:text-slate-500">
                                {item}
                              </p>
                            </div>
                          </div>

                          {/* Controls: Move, Edit, Delete */}
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => handleMoveUp(idx)}
                              disabled={idx === 0}
                              title="Di chuyển lên trên"
                              className="p-1.5 text-slate-400 hover:text-teal-700 hover:bg-slate-100 rounded disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                            >
                              <ArrowUp className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleMoveDown(idx)}
                              disabled={idx === formulas.length - 1}
                              title="Di chuyển xuống dưới"
                              className="p-1.5 text-slate-400 hover:text-teal-700 hover:bg-slate-100 rounded disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                            >
                              <ArrowDown className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleStartEdit(idx)}
                              title="Sửa công thức này"
                              className="p-1.5 text-slate-500 hover:text-teal-800 hover:bg-teal-50 rounded cursor-pointer"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(idx)}
                              title="Xóa công thức"
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'code_guide' && (
            <div className="space-y-5 text-sm">
              {/* How it works info */}
              <div className="p-4 bg-teal-50/80 border border-teal-200 rounded-xl space-y-2 text-slate-800">
                <div className="flex items-center gap-2 font-bold text-teal-900">
                  <FileCode className="w-4 h-4 text-teal-700" />
                  <span>Cách chỉnh sửa vĩnh viễn trong mã nguồn dự án</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                  Tất cả các bài học và công thức cốt lõi được định nghĩa tập trung trong tệp:{' '}
                  <code className="px-1.5 py-0.5 bg-white text-teal-900 border border-teal-200 rounded font-mono font-semibold">
                    src/data/curriculumData.ts
                  </code>
                  .
                </p>
              </div>

              {/* Step by step guide */}
              <div className="space-y-3">
                <h4 className="font-bold text-slate-900 uppercase text-xs tracking-wider">
                  Các bước thực hiện trong mã nguồn:
                </h4>
                <ol className="list-decimal pl-5 space-y-2 text-slate-700 text-xs sm:text-sm">
                  <li>
                    Mở tệp <strong className="font-mono text-teal-800">src/data/curriculumData.ts</strong> trong bộ mã nguồn.
                  </li>
                  <li>
                    Tìm khối của bài học hiện tại: <strong className="text-slate-900">"{lessonName}"</strong> (mã bài:{' '}
                    <code className="px-1 bg-slate-100 rounded font-mono text-xs">{lessonId}</code>).
                  </li>
                  <li>
                    Tìm thuộc tính <code className="font-mono text-teal-800 font-semibold">theoryContent.boxedFormulas</code>.
                  </li>
                  <li>
                    Thêm, xóa hoặc chỉnh sửa các chuỗi công thức trong mảng này.
                  </li>
                  <li>
                    <strong>Quy tắc viết công thức LaTeX:</strong>
                    <ul className="list-disc pl-5 mt-1 space-y-1 text-slate-600">
                      <li>Công thức toán được kẹp giữa 2 dấu <code className="font-mono bg-slate-100 px-1">$...$</code>.</li>
                      <li>Trong chuỗi TypeScript/JavaScript, các ký tự dấu gạch chéo ngược cần được nhân đôi thành <code className="font-mono bg-slate-100 px-1">\\</code> (ví dụ: <code className="font-mono text-teal-800">\\frac&#123;a&#125;&#123;b&#125;</code>, <code className="font-mono text-teal-800">\\sqrt&#123;x&#125;</code>, <code className="font-mono text-teal-800">\\Rightarrow</code>).</li>
                    </ul>
                  </li>
                </ol>
              </div>

              {/* Code Generator & Copy Box */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                    Mã code sẵn sàng dán cho bài học này:
                  </span>
                  <button
                    onClick={handleCopyCode}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-800 hover:bg-teal-900 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                  >
                    {copiedCode ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-300" />
                        <span>Đã sao chép!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Sao chép mã code</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-900 text-slate-200">
                  <pre className="p-4 text-xs font-mono overflow-x-auto max-h-60 leading-relaxed whitespace-pre-wrap">
                    {generateTsCode()}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-3.5 border-t border-slate-200 bg-slate-50 text-xs sm:text-sm">
          <div className="text-slate-500 text-xs">
            {isCustomized ? (
              <span className="text-amber-700 font-medium">
                * Đang áp dụng công thức tùy chỉnh đã lưu trên trình duyệt của bạn.
              </span>
            ) : (
              <span>* Đang hiển thị bộ công thức gốc theo SGK GDPT 2018.</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 font-semibold text-slate-700 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
