import React, { useState, useEffect } from 'react';
import {
  Layers,
  Plus,
  Trash2,
  Edit3,
  Search,
  BookOpen,
  Check,
  X,
  Sparkles,
  Download,
  Upload,
  Copy,
  RotateCcw,
  CheckCircle2,
  ArrowUpDown,
  Filter,
  FileText,
  Eye,
  CheckSquare,
  Sparkle
} from 'lucide-react';
import { MathView } from './MathView';
import {
  BankQuestion,
  getBankQuestions,
  saveBankQuestion,
  deleteBankQuestion,
  resetBankQuestions,
  importBankQuestionsJSON,
  exportBankQuestionsJSON
} from '../utils/questionBankStorage';
import { extractDocxTextAndMath, parseExamFromWordText } from '../wordExamConverter.js';

interface QuestionBankManagerProps {
  onOpenExamGenerator?: (questions: BankQuestion[]) => void;
}

export const QuestionBankManager: React.FC<QuestionBankManagerProps> = ({ onOpenExamGenerator }) => {
  const [questions, setQuestions] = useState<BankQuestion[]>([]);
  const [selectedGrade, setSelectedGrade] = useState<'all' | '10' | '11' | '12'>('all');
  const [selectedSection, setSelectedSection] = useState<'all' | 'A' | 'B' | 'C'>('all');
  const [selectedLevel, setSelectedLevel] = useState<'all' | 'NB' | 'TH' | 'VD' | 'VDC'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [notification, setNotification] = useState<string | null>(null);

  // Modal Sửa / Thêm câu hỏi (Thiết kế chuẩn theo Ảnh 3)
  const [editingModalOpen, setEditingModalOpen] = useState<boolean>(false);
  const [editingQuestion, setEditingQuestion] = useState<BankQuestion | null>(null);
  const [isNewQuestion, setIsNewQuestion] = useState<boolean>(false);

  // Trạng thái xử lý file Word
  const [isProcessingWord, setIsProcessingWord] = useState<boolean>(false);

  useEffect(() => {
    setQuestions(getBankQuestions());
    const handleUpdate = (e: any) => {
      if (e.detail) setQuestions(e.detail);
      else setQuestions(getBankQuestions());
    };
    window.addEventListener('question_bank_updated', handleUpdate);
    return () => window.removeEventListener('question_bank_updated', handleUpdate);
  }, []);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  // Lọc câu hỏi theo các tiêu chí
  const filteredQuestions = questions.filter(q => {
    if (selectedGrade !== 'all' && q.grade !== selectedGrade) return false;
    if (selectedSection !== 'all' && q.section !== selectedSection) return false;
    if (selectedLevel !== 'all' && q.level !== selectedLevel) return false;
    if (searchQuery.trim()) {
      const qLower = searchQuery.toLowerCase();
      const matchStem = (q.stem || '').toLowerCase().includes(qLower);
      const matchSol = (q.sol || '').toLowerCase().includes(qLower);
      const matchOpts = (q.opts || []).some(o => o.toLowerCase().includes(qLower));
      if (!matchStem && !matchSol && !matchOpts) return false;
    }
    return true;
  });

  // Thống kê số lượng
  const countGroup1 = questions.filter(q => q.section === 'A').length;
  const countGroup2 = questions.filter(q => q.section === 'B').length;
  const countGroup3 = questions.filter(q => q.section === 'C').length;

  // Xử lý mở Modal thêm câu hỏi mới
  const handleOpenAddModal = (section: 'A' | 'B' | 'C' = 'A') => {
    const newQ: BankQuestion = {
      id: `bank-q-${Date.now()}`,
      grade: selectedGrade !== 'all' ? selectedGrade : '12',
      chapterName: 'Chuyên đề Toán THPT',
      section: section,
      groupName: section === 'A' ? 'Nhóm 1 (Trắc nghiệm)' : section === 'B' ? 'Nhóm 2 (Đúng / Sai)' : 'Nhóm 3 (Trả lời ngắn)',
      stem: '',
      opts: ['', '', '', ''],
      items: [
        { s: '', t: true },
        { s: '', t: false },
        { s: '', t: true },
        { s: '', t: false }
      ],
      ci: 0,
      ans: '',
      sol: '',
      level: 'NB',
      score: 2.0,
      createdAt: new Date().toISOString()
    };
    setEditingQuestion(newQ);
    setIsNewQuestion(true);
    setEditingModalOpen(true);
  };

  // Mở modal sửa câu hỏi
  const handleOpenEditModal = (q: BankQuestion) => {
    setEditingQuestion(JSON.parse(JSON.stringify(q)));
    setIsNewQuestion(false);
    setEditingModalOpen(true);
  };

  // Lưu câu hỏi từ Modal (Ảnh 3)
  const handleSaveModal = () => {
    if (!editingQuestion) return;
    if (!editingQuestion.stem.trim()) {
      alert('Vui lòng nhập nội dung đề bài!');
      return;
    }

    let finalAns = editingQuestion.ans;
    if (editingQuestion.section === 'A') {
      finalAns = editingQuestion.opts[editingQuestion.ci] || '';
    } else if (editingQuestion.section === 'B' && editingQuestion.items) {
      finalAns = editingQuestion.items.map(it => it.t ? 'Đ' : 'S').join('-');
    }

    const saved = saveBankQuestion({
      ...editingQuestion,
      ans: finalAns
    });
    setQuestions(saved);
    setEditingModalOpen(false);
    showToast(isNewQuestion ? 'Đã thêm câu hỏi mới vào ngân hàng!' : 'Đã cập nhật câu hỏi thành công!');
  };

  // Xóa câu hỏi
  const handleDelete = (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa câu hỏi này khỏi ngân hàng?')) {
      const updated = deleteBankQuestion(id);
      setQuestions(updated);
      showToast('Đã xóa câu hỏi!');
    }
  };

  // Nhân bản câu hỏi
  const handleDuplicate = (q: BankQuestion) => {
    const dup: BankQuestion = {
      ...JSON.parse(JSON.stringify(q)),
      id: `bank-q-${Date.now()}`,
      stem: q.stem + ' (Bản sao)',
      createdAt: new Date().toISOString()
    };
    const updated = saveBankQuestion(dup);
    setQuestions(updated);
    showToast('Đã nhân bản câu hỏi thành công!');
  };

  // Nhập file Word (.docx) vào Ngân hàng câu hỏi
  const handleImportDocx = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessingWord(true);
    try {
      let extractedText = '';
      if (file.name.toLowerCase().endsWith('.docx')) {
        const buffer = await file.arrayBuffer();
        extractedText = await extractDocxTextAndMath(buffer);
      } else {
        extractedText = await file.text();
      }

      const parsed = parseExamFromWordText(extractedText, file.name, selectedGrade !== 'all' ? selectedGrade : '12');
      if (parsed) {
        let addedCount = 0;
        const currentBank = getBankQuestions();
        const newItems: BankQuestion[] = [];

        // Phần A: Nhóm 1
        (parsed.A || []).forEach((q: any, idx: number) => {
          newItems.push({
            id: `bank-import-a-${Date.now()}-${idx + 1}`,
            grade: (parsed.grade as any) || '12',
            section: 'A',
            groupName: 'Nhóm 1 (Trắc nghiệm)',
            stem: q.stem,
            opts: q.opts,
            ci: q.ci ?? 0,
            ans: q.ans || q.opts[q.ci ?? 0] || '',
            sol: q.sol || '',
            level: 'NB',
            score: 2.0,
            createdAt: new Date().toISOString()
          });
          addedCount++;
        });

        // Phần B: Nhóm 2
        (parsed.B || []).forEach((q: any, idx: number) => {
          newItems.push({
            id: `bank-import-b-${Date.now()}-${idx + 1}`,
            grade: (parsed.grade as any) || '12',
            section: 'B',
            groupName: 'Nhóm 2 (Đúng / Sai)',
            stem: q.stem,
            opts: [],
            items: q.items || [],
            ci: 0,
            ans: (q.items || []).map((it: any) => it.t ? 'Đ' : 'S').join('-'),
            sol: q.sol || '',
            level: 'TH',
            score: 4.0,
            createdAt: new Date().toISOString()
          });
          addedCount++;
        });

        // Phần C: Nhóm 3
        (parsed.C || []).forEach((q: any, idx: number) => {
          newItems.push({
            id: `bank-import-c-${Date.now()}-${idx + 1}`,
            grade: (parsed.grade as any) || '12',
            section: 'C',
            groupName: 'Nhóm 3 (Trả lời ngắn)',
            stem: q.stem,
            opts: [],
            ci: 0,
            ans: q.ans || '',
            sol: q.sol || '',
            level: 'VD',
            score: 2.0,
            createdAt: new Date().toISOString()
          });
          addedCount++;
        });

        if (addedCount > 0) {
          const merged = [...newItems, ...currentBank];
          localStorage.setItem('toan_tran_trong_question_bank_v2', JSON.stringify(merged));
          setQuestions(merged);
          showToast(`Nhập thành công ${addedCount} câu hỏi từ file Word vào ngân hàng!`);
        } else {
          alert('Không tìm thấy câu hỏi hợp lệ trong file!');
        }
      }
    } catch (err: any) {
      alert('Lỗi đọc file: ' + err.message);
    } finally {
      setIsProcessingWord(false);
      e.target.value = '';
    }
  };

  // Xuất file JSON
  const handleExportJSON = () => {
    const jsonStr = exportBankQuestionsJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ngan_hang_cau_hoi_toan_tran_trong_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Đã xuất file dữ liệu ngân hàng câu hỏi!');
  };

  // Nhập file JSON
  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content && importBankQuestionsJSON(content)) {
        setQuestions(getBankQuestions());
        showToast('Đã nhập dữ liệu ngân hàng thành công!');
      } else {
        alert('Tệp dữ liệu không hợp lệ!');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const mathShortcuts = [
    { label: 'a/b', insert: '$\\frac{a}{b}$' },
    { label: '√x', insert: '$\\sqrt{x}$' },
    { label: 'x²', insert: '$x^2$' },
    { label: 'π', insert: '$\\pi$' },
    { label: 'α', insert: '$\\alpha$' },
    { label: 'sin', insert: '$\\sin\\alpha$' },
    { label: 'cos', insert: '$\\cos\\alpha$' },
    { label: 'tan', insert: '$\\tan\\alpha$' },
    { label: 'cot', insert: '$\\cot\\alpha$' },
    { label: '°', insert: '^\\circ' },
    { label: 'cm', insert: '\\text{ cm}' },
    { label: '∈', insert: '$\\in$' },
    { label: 'ℝ', insert: '$\\mathbb{R}$' },
    { label: '≤', insert: '$\\le$' },
    { label: '≥', insert: '$\\ge$' }
  ];

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Top Banner Ngân hàng câu hỏi */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white rounded-2xl p-6 sm:p-7 shadow-lg border border-indigo-700/50 relative overflow-hidden">
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-200 text-xs font-bold border border-indigo-400/30">
            <Layers className="w-3.5 h-3.5 text-amber-300" />
            <span>Ngân hàng câu hỏi Toán THPT (10 - 11 - 12)</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            Kho đề thi & Câu hỏi chuẩn 3 nhóm (Trắc nghiệm, Đúng/Sai, Trả lời ngắn)
          </h2>

          <p className="text-indigo-100 text-xs sm:text-sm leading-relaxed max-w-3xl">
            Tự động mã hóa công thức KaTeX, nhận diện gạch chân là đáp án đúng từ Word (.docx), hỗ trợ soạn thảo trực quan với xem trước theo thời gian thực và tự động chia đều thang điểm 10.
          </p>

          {/* Quick Stats Badges */}
          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
            <span className="px-3 py-1 rounded-xl bg-white/10 font-bold text-white border border-white/10">
              Tổng kho: <b className="text-amber-300 font-black">{questions.length}</b> câu
            </span>
            <span className="px-3 py-1 rounded-xl bg-emerald-500/20 font-bold text-emerald-200 border border-emerald-400/30">
              Nhóm 1 (Trắc nghiệm): <b className="text-emerald-300 font-black">{countGroup1}</b> câu
            </span>
            <span className="px-3 py-1 rounded-xl bg-sky-500/20 font-bold text-sky-200 border border-sky-400/30">
              Nhóm 2 (Đúng / Sai): <b className="text-sky-300 font-black">{countGroup2}</b> câu
            </span>
            <span className="px-3 py-1 rounded-xl bg-purple-500/20 font-bold text-purple-200 border border-purple-400/30">
              Nhóm 3 (Trả lời ngắn): <b className="text-purple-300 font-black">{countGroup3}</b> câu
            </span>
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2 pt-2">
            <button
              onClick={() => handleOpenAddModal('A')}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs sm:text-sm shadow-md transition-all cursor-pointer hover:scale-105"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Thêm câu hỏi mới</span>
            </button>

            <label className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-indigo-700 hover:bg-indigo-600 text-white font-bold text-xs sm:text-sm border border-indigo-500/50 transition-all cursor-pointer shadow-xs">
              <Upload className="w-4 h-4" />
              <span>{isProcessingWord ? 'Đang đọc file Word...' : 'Nhập từ Word (.docx)'}</span>
              <input
                type="file"
                accept=".docx,.txt"
                className="hidden"
                disabled={isProcessingWord}
                onChange={handleImportDocx}
              />
            </label>

            <button
              onClick={handleExportJSON}
              className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-200 font-semibold text-xs border border-slate-700 transition-all cursor-pointer"
              title="Xuất bản sao lưu JSON"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Xuất sao lưu</span>
            </button>

            <label className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-200 font-semibold text-xs border border-slate-700 transition-all cursor-pointer">
              <Upload className="w-3.5 h-3.5" />
              <span>Nhập sao lưu</span>
              <input
                type="file"
                accept=".json"
                className="hidden"
                onChange={handleImportJSON}
              />
            </label>

            <button
              onClick={() => {
                if (window.confirm('Khôi phục ngân hàng câu hỏi về danh sách câu hỏi mẫu chuẩn ban đầu?')) {
                  const r = resetBankQuestions();
                  setQuestions(r);
                  showToast('Đã khôi phục ngân hàng câu hỏi mẫu!');
                }
              }}
              className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-rose-900/40 hover:bg-rose-900 text-rose-200 font-semibold text-xs border border-rose-700/50 transition-all cursor-pointer ml-auto"
              title="Khôi phục câu hỏi mẫu chuẩn"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Mẫu mặc định</span>
            </button>
          </div>

          {notification && (
            <div className="flex items-center gap-2 p-3 bg-emerald-500/20 border border-emerald-400 text-emerald-200 rounded-xl text-xs sm:text-sm font-semibold animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
              <span>{notification}</span>
            </div>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center gap-3 justify-between">
          {/* Lọc Khối */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-slate-500 mr-1">Khối:</span>
            {[
              { id: 'all', label: 'Tất cả' },
              { id: '10', label: 'Toán 10' },
              { id: '11', label: 'Toán 11' },
              { id: '12', label: 'Toán 12' }
            ].map(g => (
              <button
                key={g.id}
                onClick={() => setSelectedGrade(g.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors ${selectedGrade === g.id ? 'bg-indigo-700 text-white shadow-xs' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}
              >
                {g.label}
              </button>
            ))}
          </div>

          {/* Lọc Nhóm */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-bold text-slate-500 mr-1">Nhóm:</span>
            {[
              { id: 'all', label: 'Tất cả 3 nhóm' },
              { id: 'A', label: 'Nhóm 1 (Trắc nghiệm)' },
              { id: 'B', label: 'Nhóm 2 (Đúng / Sai)' },
              { id: 'C', label: 'Nhóm 3 (Trả lời ngắn)' }
            ].map(sec => (
              <button
                key={sec.id}
                onClick={() => setSelectedSection(sec.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors ${selectedSection === sec.id ? 'bg-teal-700 text-white shadow-xs' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}
              >
                {sec.label}
              </button>
            ))}
          </div>

          {/* Lọc Mức độ */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-slate-500 mr-1">Mức độ:</span>
            {[
              { id: 'all', label: 'Tất cả' },
              { id: 'NB', label: 'NB' },
              { id: 'TH', label: 'TH' },
              { id: 'VD', label: 'VD' },
              { id: 'VDC', label: 'VDC' }
            ].map(lv => (
              <button
                key={lv.id}
                onClick={() => setSelectedLevel(lv.id as any)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors ${selectedLevel === lv.id ? 'bg-amber-500 text-slate-950 shadow-xs' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}
              >
                {lv.label}
              </button>
            ))}
          </div>
        </div>

        {/* Ô Tìm kiếm */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm nhanh nội dung câu hỏi, công thức, số đo góc, bán kính, cực trị, hàm số..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs sm:text-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              Xóa lọc
            </button>
          )}
        </div>
      </div>

      {/* Danh sách thẻ câu hỏi */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-slate-500 px-1">
          <span>Hiển thị <b>{filteredQuestions.length}</b> / {questions.length} câu hỏi phù hợp</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleOpenAddModal('A')}
              className="text-indigo-600 font-bold hover:underline cursor-pointer flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Thêm vào Nhóm 1</span>
            </button>
            <span>•</span>
            <button
              onClick={() => handleOpenAddModal('B')}
              className="text-teal-600 font-bold hover:underline cursor-pointer flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Thêm vào Nhóm 2</span>
            </button>
            <span>•</span>
            <button
              onClick={() => handleOpenAddModal('C')}
              className="text-purple-600 font-bold hover:underline cursor-pointer flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Thêm vào Nhóm 3</span>
            </button>
          </div>
        </div>

        {filteredQuestions.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center space-y-3">
            <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-bold text-slate-600">Không tìm thấy câu hỏi nào phù hợp với bộ lọc!</p>
            <p className="text-xs text-slate-400">Hãy thử đổi tiêu chí tìm kiếm hoặc nhấn nút "Thêm câu hỏi mới" ở trên.</p>
            <button
              onClick={() => handleOpenAddModal('A')}
              className="px-4 py-2 rounded-xl bg-indigo-700 hover:bg-indigo-800 text-white text-xs font-bold cursor-pointer"
            >
              + Tạo câu hỏi mới ngay
            </button>
          </div>
        ) : (
          filteredQuestions.map((q, idx) => (
            <div
              key={q.id}
              className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs hover:border-indigo-300 transition-all space-y-3"
            >
              {/* Header Thẻ Câu hỏi */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 text-xs flex-wrap gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-black text-indigo-700 text-sm">
                    Câu {idx + 1}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold text-[11px]">
                    Toán {q.grade}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] ${
                    q.section === 'A'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : q.section === 'B'
                      ? 'bg-sky-50 text-sky-800 border border-sky-200'
                      : 'bg-purple-50 text-purple-800 border border-purple-200'
                  }`}>
                    {q.section === 'A' ? 'Nhóm 1 (Trắc nghiệm)' : q.section === 'B' ? 'Nhóm 2 (Đúng / Sai)' : 'Nhóm 3 (Trả lời ngắn)'}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 font-extrabold text-[11px] border border-amber-200">
                    {q.level}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    • {q.score}đ
                  </span>
                  {q.chapterName && (
                    <span className="text-[11px] text-slate-500 italic hidden sm:inline">
                      ({q.chapterName})
                    </span>
                  )}
                </div>

                {/* Các nút tác vụ Sửa / Nhân bản / Xóa */}
                <div className="flex items-center gap-1 text-slate-400">
                  <button
                    onClick={() => handleOpenEditModal(q)}
                    className="p-1.5 hover:text-indigo-600 cursor-pointer rounded-lg hover:bg-slate-100 flex items-center gap-1 text-xs font-semibold"
                    title="Chỉnh sửa câu hỏi này"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Sửa</span>
                  </button>
                  <button
                    onClick={() => handleDuplicate(q)}
                    className="p-1.5 hover:text-teal-600 cursor-pointer rounded-lg hover:bg-slate-100 flex items-center gap-1 text-xs font-semibold"
                    title="Nhân bản câu hỏi"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Nhân bản</span>
                  </button>
                  <button
                    onClick={() => handleDelete(q.id)}
                    className="p-1.5 hover:text-rose-600 cursor-pointer rounded-lg hover:bg-rose-50 flex items-center gap-1 text-xs font-semibold"
                    title="Xóa câu hỏi này"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                    <span className="text-rose-500">Xóa</span>
                  </button>
                </div>
              </div>

              {/* Thân câu hỏi với KaTeX */}
              <div className="text-sm sm:text-base font-medium leading-relaxed text-slate-900">
                <MathView content={q.stem} />
              </div>

              {/* Nhóm 1: Các phương án lựa chọn A, B, C, D */}
              {q.section === 'A' && q.opts && q.opts.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  {q.opts.map((opt, optIdx) => {
                    const isCorrect = q.ci === optIdx;
                    const letter = ['A', 'B', 'C', 'D'][optIdx] || `${optIdx + 1}`;
                    return (
                      <div
                        key={optIdx}
                        className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                          isCorrect
                            ? 'border-emerald-500 bg-emerald-50/50 shadow-xs'
                            : 'border-slate-200 bg-slate-50/50'
                        }`}
                      >
                        <span className={`font-black text-xs shrink-0 ${isCorrect ? 'text-emerald-700' : 'text-slate-700'}`}>
                          {letter}.
                        </span>
                        <div className="text-sm font-medium leading-snug flex-1">
                          <MathView content={opt} />
                        </div>
                        {isCorrect ? (
                          <div className="flex items-center gap-1.5 shrink-0 text-emerald-600 font-bold text-xs">
                            <Check className="w-4 h-4 stroke-[3]" />
                            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 shrink-0 text-slate-400">
                            <span className="w-3.5 h-3.5 rounded-full border border-slate-300"></span>
                            <ArrowUpDown className="w-3.5 h-3.5 text-slate-300" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Nhóm 2: Các khẳng định Đúng / Sai */}
              {q.section === 'B' && q.items && q.items.length > 0 && (
                <div className="space-y-2 pt-1">
                  {q.items.map((it, itIdx) => {
                    const subLetter = String.fromCharCode(97 + itIdx);
                    return (
                      <div
                        key={itIdx}
                        className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50/40"
                      >
                        <div className="flex items-center gap-2 flex-1 pr-3">
                          <span className="font-bold text-slate-700">{subLetter})</span>
                          <MathView content={it.s} />
                        </div>
                        <span className={`px-2.5 py-1 rounded-lg font-bold text-[11px] ${
                          it.t ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {it.t ? 'ĐÚNG ✓' : 'SAI ✗'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Nhóm 3: Đáp số trả lời ngắn */}
              {q.section === 'C' && (
                <div className="p-3 rounded-xl border border-dashed border-indigo-200 bg-indigo-50/40 text-xs flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-slate-700">Đáp số chuẩn:</span>
                    <span className="px-3 py-1 rounded-lg bg-white border border-slate-300 font-mono font-black text-indigo-700">
                      {q.ans || 'Chưa thiết lập'}
                    </span>
                  </div>
                </div>
              )}

              {/* Lời giải chi tiết (Hiển thị thanh dọc xanh lá bên trái giống ảnh) */}
              {q.sol && (
                <div className="border-l-4 border-emerald-600 pl-3.5 py-1.5 bg-slate-50/60 rounded-r-xl text-xs sm:text-sm text-slate-700 leading-relaxed">
                  <span className="font-black text-slate-900 mr-1.5">Lời giải:</span>
                  <MathView content={q.sol} />
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* =========================================================================
          MODAL CHỈNH SỬA / THÊM CÂU HỎI (THIẾT KẾ Y HỆT ẢNH 3 CỦA NGƯỜI DÙNG)
          ========================================================================= */}
      {editingModalOpen && editingQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 p-5 sm:p-6 space-y-4">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-indigo-600" />
                <h3 className="font-black text-lg text-slate-900">
                  {isNewQuestion ? 'Thêm câu hỏi mới vào ngân hàng' : `Chỉnh sửa Câu hỏi`}
                </h3>
              </div>
              <button
                onClick={() => setEditingModalOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chọn Nhóm câu hỏi (Nhóm 1: TN, Nhóm 2: Đ/S, Nhóm 3: TLN) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Phân loại nhóm câu hỏi:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'A', name: 'Nhóm 1: Trắc nghiệm' },
                  { id: 'B', name: 'Nhóm 2: Đúng / Sai' },
                  { id: 'C', name: 'Nhóm 3: Trả lời ngắn' }
                ].map(item => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setEditingQuestion({
                        ...editingQuestion,
                        section: item.id as any,
                        groupName: item.name
                      });
                    }}
                    className={`py-2 px-3 rounded-xl text-xs font-bold cursor-pointer border transition-colors ${
                      editingQuestion.section === item.id
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700 ring-2 ring-indigo-500'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    {item.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Nội dung đề bài (Hỗ trợ công thức KaTeX ...) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-700">
                  Nội dung đề bài (Hỗ trợ công thức KaTeX ...):
                </label>
                {/* Thanh phím tắt công thức toán */}
                <div className="flex items-center gap-1 overflow-x-auto max-w-xs">
                  {mathShortcuts.slice(0, 8).map((sc, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        setEditingQuestion({
                          ...editingQuestion,
                          stem: editingQuestion.stem + ' ' + sc.insert
                        });
                      }}
                      className="px-1.5 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-[11px] font-mono text-slate-700 cursor-pointer"
                    >
                      {sc.label}
                    </button>
                  ))}
                </div>
              </div>
              <textarea
                rows={3}
                value={editingQuestion.stem}
                onChange={(e) => setEditingQuestion({ ...editingQuestion, stem: e.target.value })}
                placeholder="Ví dụ: Một đường tròn có bán kính $9\text{ cm}$. Độ dài cung có số đo $\frac{8\pi}{9}$ là..."
                className="w-full p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium leading-relaxed"
              />
            </div>

            {/* XEM TRƯỚC HIỂN THỊ (Giống Ảnh 3) */}
            <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-200 space-y-1">
              <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider block">
                Xem trước hiển thị:
              </span>
              <div className="text-sm font-medium text-slate-900 min-h-[22px]">
                {editingQuestion.stem.trim() ? (
                  <MathView content={editingQuestion.stem} />
                ) : (
                  <span className="text-xs text-slate-400 italic">Nhập đề bài để xem trước công thức KaTeX tại đây...</span>
                )}
              </div>
            </div>

            {/* Nhóm 1: Các phương án lựa chọn (Chọn nút tròn để chỉ định đáp án đúng) */}
            {editingQuestion.section === 'A' && (
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700">
                  Các phương án lựa chọn (Chọn nút tròn để chỉ định đáp án đúng):
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {['A', 'B', 'C', 'D'].map((letter, optIdx) => {
                    const isChecked = editingQuestion.ci === optIdx;
                    return (
                      <div
                        key={optIdx}
                        className={`flex items-center gap-2.5 p-2 rounded-xl border transition-colors ${
                          isChecked ? 'border-emerald-500 bg-emerald-50/40 ring-1 ring-emerald-500' : 'border-slate-200 bg-white'
                        }`}
                      >
                        <input
                          type="radio"
                          name="correctOptionRadio"
                          checked={isChecked}
                          onChange={() => setEditingQuestion({ ...editingQuestion, ci: optIdx })}
                          className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 cursor-pointer shrink-0"
                        />
                        <span className={`font-black text-xs shrink-0 ${isChecked ? 'text-emerald-700' : 'text-indigo-600'}`}>
                          {letter}.
                        </span>
                        <input
                          type="text"
                          value={editingQuestion.opts[optIdx] || ''}
                          onChange={(e) => {
                            const newOpts = [...editingQuestion.opts];
                            newOpts[optIdx] = e.target.value;
                            setEditingQuestion({ ...editingQuestion, opts: newOpts });
                          }}
                          placeholder={`Phương án ${letter} (vd: 8\\pi\\text{ cm})`}
                          className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-xs font-medium focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Nhóm 2: Các khẳng định Đúng / Sai */}
            {editingQuestion.section === 'B' && editingQuestion.items && (
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700">
                  Các mệnh đề khẳng định (Chọn ĐÚNG hoặc SAI):
                </label>
                <div className="space-y-2">
                  {editingQuestion.items.map((it, itIdx) => {
                    const subLetter = String.fromCharCode(97 + itIdx);
                    return (
                      <div key={itIdx} className="flex items-center gap-2 p-2 rounded-xl border border-slate-200 bg-slate-50/30">
                        <span className="font-black text-xs text-indigo-700 shrink-0">{subLetter})</span>
                        <input
                          type="text"
                          value={it.s}
                          onChange={(e) => {
                            const updated = [...editingQuestion.items!];
                            updated[itIdx] = { ...updated[itIdx], s: e.target.value };
                            setEditingQuestion({ ...editingQuestion, items: updated });
                          }}
                          placeholder={`Khẳng định ${subLetter}...`}
                          className="flex-1 px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-white"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const updated = [...editingQuestion.items!];
                            updated[itIdx] = { ...updated[itIdx], t: !updated[itIdx].t };
                            setEditingQuestion({ ...editingQuestion, items: updated });
                          }}
                          className={`px-3 py-1.5 rounded-lg font-bold text-xs cursor-pointer ${
                            it.t ? 'bg-emerald-600 text-white shadow-xs' : 'bg-rose-600 text-white shadow-xs'
                          }`}
                        >
                          {it.t ? 'ĐÚNG ✓' : 'SAI ✗'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Nhóm 3: Đáp số trả lời ngắn */}
            {editingQuestion.section === 'C' && (
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Đáp số / Kết quả chính xác:
                </label>
                <input
                  type="text"
                  value={editingQuestion.ans}
                  onChange={(e) => setEditingQuestion({ ...editingQuestion, ans: e.target.value })}
                  placeholder="Ví dụ: 11 hoặc -3.5..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono font-bold text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            )}

            {/* Hàng 2 cột: Mức độ nhận thức & Điểm số (Giống Ảnh 3) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Mức độ nhận thức:
                </label>
                <select
                  value={editingQuestion.level}
                  onChange={(e) => setEditingQuestion({ ...editingQuestion, level: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="NB">Nhận biết (NB)</option>
                  <option value="TH">Thông hiểu (TH)</option>
                  <option value="VD">Vận dụng (VD)</option>
                  <option value="VDC">Vận dụng cao (VDC)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Khối lớp:
                </label>
                <select
                  value={editingQuestion.grade}
                  onChange={(e) => setEditingQuestion({ ...editingQuestion, grade: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="10">Toán 10 (KNTT)</option>
                  <option value="11">Toán 11 (KNTT)</option>
                  <option value="12">Toán 12 (KNTT)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Điểm số câu này:
                </label>
                <input
                  type="number"
                  step="0.25"
                  min="0"
                  max="10"
                  value={editingQuestion.score}
                  onChange={(e) => setEditingQuestion({ ...editingQuestion, score: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Lời giải chi tiết (Giống Ảnh 3) */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Lời giải chi tiết:
              </label>
              <textarea
                rows={3}
                value={editingQuestion.sol}
                onChange={(e) => setEditingQuestion({ ...editingQuestion, sol: e.target.value })}
                placeholder="Ví dụ: Độ dài cung $l = R\alpha = 9 \cdot \frac{8\pi}{9} = 8\pi\text{ cm}$."
                className="w-full p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs sm:text-sm font-medium leading-relaxed"
              />
              {editingQuestion.sol.trim() && (
                <div className="border-l-4 border-emerald-600 pl-3 py-1 bg-slate-50 rounded-r-lg text-xs text-slate-700">
                  <span className="font-bold mr-1 text-slate-900">Xem trước lời giải:</span>
                  <MathView content={editingQuestion.sol} />
                </div>
              )}
            </div>

            {/* Modal Actions (Hủy / Lưu Câu Hỏi) */}
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setEditingModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleSaveModal}
                className="px-5 py-2 rounded-xl bg-indigo-700 hover:bg-indigo-800 text-white text-xs font-bold shadow-md cursor-pointer flex items-center gap-1.5"
              >
                <span>💾 Lưu Câu Hỏi</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
