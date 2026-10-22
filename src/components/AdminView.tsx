import React, { useState, useEffect } from 'react';
import {
  Settings,
  BookOpen,
  Plus,
  Trash2,
  Edit2,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  Check,
  Copy,
  Sparkles,
  Save,
  Download,
  Upload,
  Eye,
  Layers,
  FileText,
  AlertTriangle,
  Lightbulb,
  FileCode,
  ListPlus,
  HelpCircle,
  CheckCircle2,
  BookmarkCheck,
  ChevronRight,
  FolderPlus,
  Trophy,
  ClipboardCheck,
  Send,
  Lock,
  LogOut,
  KeyRound,
} from 'lucide-react';
import { GradeLevel, LessonType, ProblemTypeItem, CustomLessonSection } from '../types';
import { CURRICULUM_DATA } from '../data/curriculumData';
import { MathView } from './MathView';
import { QuestionBankManager } from './QuestionBankManager';
import {
  getMergedCurriculumData,
  getLessonOverride,
  saveLessonOverride,
  resetLessonOverride,
  saveNewCustomLesson,
  deleteNewCustomLesson,
  exportAdminDataJSON,
  importAdminDataJSON,
  getAllLessonOverrides,
} from '../utils/curriculumStorage';

interface AdminViewProps {
  onNavigateToLesson?: (grade: GradeLevel, chapterId: string, lessonId: string) => void;
  initialGrade?: GradeLevel;
  initialChapterId?: string;
  initialLessonId?: string;
  initialSection?: 'curriculum' | 'question_bank' | 'weekly' | 'exams';
  initialAuthenticated?: boolean;
}

export const AdminView: React.FC<AdminViewProps> = ({
  onNavigateToLesson,
  initialGrade = '12',
  initialChapterId,
  initialLessonId,
  initialSection = 'curriculum',
  initialAuthenticated = false,
}) => {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    if (initialAuthenticated) return true;
    return typeof sessionStorage !== 'undefined' && sessionStorage.getItem('tt_admin_authenticated') === '1';
  });
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [authError, setAuthError] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = passwordInput.trim();
    const customPass = (typeof localStorage !== 'undefined' && localStorage.getItem('lkt_admin_password')) || 'Tvtrong90@';
    if (
      trimmed === 'Tvtrong90@' ||
      trimmed.toLowerCase() === 'tvtrong90@' ||
      trimmed === customPass ||
      trimmed.toLowerCase() === customPass.toLowerCase()
    ) {
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.setItem('tt_admin_authenticated', '1');
      }
      setIsAuthenticated(true);
      setAuthError('');
    } else {
      setAuthError('Mật khẩu không chính xác! Không thể vào trang quản trị. Vui lòng kiểm tra lại.');
    }
  };

  const handleLogout = () => {
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.removeItem('tt_admin_authenticated');
    }
    setIsAuthenticated(false);
    setPasswordInput('');
  };

  // Navigation / Selection State
  const [selectedGrade, setSelectedGrade] = useState<GradeLevel>(initialGrade);
  const [curriculumChapters, setCurriculumChapters] = useState(() =>
    getMergedCurriculumData(initialGrade)
  );

  const [selectedChapterId, setSelectedChapterId] = useState<string>(
    initialChapterId || curriculumChapters[0]?.id || ''
  );
  const [selectedLessonId, setSelectedLessonId] = useState<string>(
    initialLessonId || curriculumChapters[0]?.lessons[0]?.id || ''
  );

  // Active Tab in Editor: 'overview' | 'formulas' | 'extra_sections' | 'problem_types' | 'code_export'
  const [editorTab, setEditorTab] = useState<
    'overview' | 'formulas' | 'extra_sections' | 'problem_types' | 'code_export'
  >('overview');

  // Form State for Selected Lesson
  const [lessonName, setLessonName] = useState<string>('');
  const [lessonSummary, setLessonSummary] = useState<string>('');
  const [formulas, setFormulas] = useState<string[]>([]);
  const [extraSections, setExtraSections] = useState<CustomLessonSection[]>([]);
  const [problemTypes, setProblemTypes] = useState<ProblemTypeItem[]>([]);

  // Formula editing helper state
  const [newFormulaInput, setNewFormulaInput] = useState<string>('');
  const [editingFormulaIndex, setEditingFormulaIndex] = useState<number | null>(null);

  // Extra section creation/editing state
  const [isAddingSection, setIsAddingSection] = useState<boolean>(false);
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [sectionTitleInput, setSectionTitleInput] = useState<string>('');
  const [sectionTypeInput, setSectionTypeInput] = useState<CustomLessonSection['type']>('method');
  const [sectionContentInput, setSectionContentInput] = useState<string>('');
  const [sectionNoteInput, setSectionNoteInput] = useState<string>('');

  // Problem type editing state
  const [isAddingType, setIsAddingType] = useState<boolean>(false);
  const [editingTypeIndex, setEditingTypeIndex] = useState<number | null>(null);
  const [typeTitleInput, setTypeTitleInput] = useState<string>('');
  const [typeDescInput, setTypeDescInput] = useState<string>('');
  const [typeQuestionInput, setTypeQuestionInput] = useState<string>('');
  const [typeOptionsInput, setTypeOptionsInput] = useState<string[]>(['A. ', 'B. ', 'C. ', 'D. ']);
  const [typeAnswerInput, setTypeAnswerInput] = useState<string>('A');
  const [typeExplanationInput, setTypeExplanationInput] = useState<string>('');

  // New Lesson Creation Modal
  const [showNewLessonModal, setShowNewLessonModal] = useState<boolean>(false);
  const [newLessonNameInput, setNewLessonNameInput] = useState<string>('');

  // Status feedback
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string>('');
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  // Top-level Admin Section: 'curriculum' (Biên tập bài học) | 'question_bank' (Ngân hàng câu hỏi) | 'weekly' (Bài toán tuần) | 'exams' (Đề kiểm tra)
  const [adminSection, setAdminSection] = useState<'curriculum' | 'question_bank' | 'weekly' | 'exams'>(initialSection);

  // Weekly Challenge Form State
  const [weeklyWeek, setWeeklyWeek] = useState('Tuần 3 - Tháng 10/2026');
  const [weeklyTitle, setWeeklyTitle] = useState('Cực trị hình học không gian kết hợp bất đẳng thức AM-GM');
  const [weeklyQuestion, setWeeklyQuestion] = useState(
    'Cho khối chóp $S.ABC$ có đáy $ABC$ là tam giác đều cạnh $a$. Cạnh bên $SA$ vuông góc với mặt phẳng đáy $(ABC)$. Gọi $M, N$ lần lượt là hình chiếu vuông góc của $A$ lên $SB$ và $SC$. Biết khoảng cách từ $A$ đến mặt phẳng $(SMN)$ đạt giá trị lớn nhất. Tìm giá trị của độ dài đoạn thẳng $SA$ theo $a$.'
  );
  const [weeklyOptions, setWeeklyOptions] = useState(['A. a√2/2', 'B. a√3/2', 'C. a', 'D. a/2']);
  const [weeklyCorrect, setWeeklyCorrect] = useState('A');
  const [weeklySolution, setWeeklySolution] = useState(
    'Ta có $BC \\perp (SAB) \\Rightarrow (SAB) \\perp (SBC)$. Khi $SA = x$, thể tích tứ diện $S.AMN$ đạt giá trị lớn nhất khi $x = \\frac{a\\sqrt{2}}{2}$ theo bất đẳng thức AM-GM. Do đó đáp án là A.'
  );
  const [weeklySaveSuccess, setWeeklySaveSuccess] = useState('');

  useEffect(() => {
    try {
      const stored = localStorage.getItem('weekly_challenge_data');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.week) setWeeklyWeek(parsed.week);
        if (parsed.title) setWeeklyTitle(parsed.title);
        if (parsed.question) setWeeklyQuestion(parsed.question);
        if (parsed.options) setWeeklyOptions(parsed.options);
        if (parsed.correct) setWeeklyCorrect(parsed.correct);
        if (parsed.solution) setWeeklySolution(parsed.solution);
      }
    } catch (e) {}
  }, []);

  const handleSaveWeekly = () => {
    const data = {
      week: weeklyWeek,
      title: weeklyTitle,
      question: weeklyQuestion,
      options: weeklyOptions,
      correct: weeklyCorrect,
      solution: weeklySolution,
    };
    localStorage.setItem('weekly_challenge_data', JSON.stringify(data));
    window.dispatchEvent(new CustomEvent('weekly_challenge_updated'));
    setWeeklySaveSuccess('Đã lưu bài toán tuần thành công! Học sinh làm đúng trên 8 điểm sẽ kích hoạt hiệu ứng pháo hoa confetti.');
    setTimeout(() => setWeeklySaveSuccess(''), 4000);
  };

  // Sync props when user navigates directly to edit a specific lesson
  useEffect(() => {
    if (initialGrade) {
      setSelectedGrade(initialGrade);
      const chapters = getMergedCurriculumData(initialGrade);
      setCurriculumChapters(chapters);
      const targetChapterId = initialChapterId || chapters[0]?.id || '';
      setSelectedChapterId(targetChapterId);
      const ch = chapters.find((c) => c.id === targetChapterId) || chapters[0];
      const targetLessonId = initialLessonId || ch?.lessons[0]?.id || '';
      setSelectedLessonId(targetLessonId);
      setAdminSection('curriculum');
    }
  }, [initialGrade, initialChapterId, initialLessonId]);

  // Refresh curriculum when grade changes or custom event received
  const reloadCurriculum = () => {
    const chapters = getMergedCurriculumData(selectedGrade);
    setCurriculumChapters(chapters);

    // Ensure valid selected chapter
    let validChapter = chapters.find((c) => c.id === selectedChapterId);
    if (!validChapter && chapters.length > 0) {
      validChapter = chapters[0];
      setSelectedChapterId(chapters[0].id);
    }

    // Ensure valid selected lesson
    if (validChapter && validChapter.lessons.length > 0) {
      const validLesson = validChapter.lessons.find((l) => l.id === selectedLessonId);
      if (!validLesson) {
        setSelectedLessonId(validChapter.lessons[0].id);
      }
    }
  };

  useEffect(() => {
    reloadCurriculum();
  }, [selectedGrade]);

  useEffect(() => {
    const handleUpdate = () => reloadCurriculum();
    window.addEventListener('curriculum_data_updated', handleUpdate);
    return () => window.removeEventListener('curriculum_data_updated', handleUpdate);
  }, [selectedGrade, selectedChapterId, selectedLessonId]);

  // Find currently active chapter & lesson
  const currentChapter =
    curriculumChapters.find((c) => c.id === selectedChapterId) || curriculumChapters[0];
  const currentLesson =
    currentChapter?.lessons.find((l) => l.id === selectedLessonId) || currentChapter?.lessons[0];

  // Load lesson data into form state when selectedLessonId changes
  useEffect(() => {
    if (!currentLesson) return;

    setLessonName(currentLesson.name);
    setLessonSummary(currentLesson.theoryContent.summary || '');
    setFormulas([...(currentLesson.theoryContent.boxedFormulas || [])]);
    setExtraSections([...((currentLesson.theoryContent as any).extraSections || [])]);
    setProblemTypes([...(currentLesson.problemTypes || [])]);

    // Reset temporary editing fields
    setEditingFormulaIndex(null);
    setNewFormulaInput('');
    setIsAddingSection(false);
    setEditingSectionId(null);
    setIsAddingType(false);
    setEditingTypeIndex(null);
    setSaveSuccessMsg('');
  }, [selectedLessonId, currentLesson?.id]);

  // Check if current lesson is customized
  const overrides = getAllLessonOverrides();
  const isCustomized = Boolean(currentLesson && overrides[currentLesson.id]);

  // Save current lesson modifications
  const handleSaveLesson = () => {
    if (!currentLesson) return;

    saveLessonOverride(currentLesson.id, {
      name: lessonName,
      summary: lessonSummary,
      boxedFormulas: formulas,
      extraSections: extraSections,
      problemTypes: problemTypes,
    });

    setSaveSuccessMsg('Đã lưu thành công nội dung bài học vào hệ thống!');
    setTimeout(() => setSaveSuccessMsg(''), 4000);
    reloadCurriculum();
  };

  // Reset current lesson to original default data
  const handleResetLesson = () => {
    if (!currentLesson) return;
    if (window.confirm(`Bạn có chắc chắn muốn khôi phục bài "${currentLesson.name}" về nội dung gốc? Mọi sửa đổi sẽ bị xóa.`)) {
      resetLessonOverride(currentLesson.id);
      setSaveSuccessMsg('Đã khôi phục về nội dung mặc định ban đầu!');
      setTimeout(() => setSaveSuccessMsg(''), 4000);
      reloadCurriculum();
    }
  };

  // Math symbol quick insertion helper
  const insertLatexToField = (
    setter: React.Dispatch<React.SetStateAction<string>>,
    latex: string
  ) => {
    setter((prev) => prev + latex);
  };

  // Formula Handlers
  const handleAddOrUpdateFormula = () => {
    if (!newFormulaInput.trim()) return;
    if (editingFormulaIndex !== null) {
      const updated = [...formulas];
      updated[editingFormulaIndex] = newFormulaInput.trim();
      setFormulas(updated);
      setEditingFormulaIndex(null);
    } else {
      setFormulas([...formulas, newFormulaInput.trim()]);
    }
    setNewFormulaInput('');
  };

  const handleEditFormula = (index: number) => {
    setEditingFormulaIndex(index);
    setNewFormulaInput(formulas[index]);
  };

  const handleDeleteFormula = (index: number) => {
    setFormulas(formulas.filter((_, i) => i !== index));
    if (editingFormulaIndex === index) {
      setEditingFormulaIndex(null);
      setNewFormulaInput('');
    }
  };

  const handleMoveFormula = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= formulas.length) return;
    const updated = [...formulas];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    setFormulas(updated);
  };

  // Extra Section Handlers (Mục nội dung tùy ý)
  const handleSaveSection = () => {
    if (!sectionTitleInput.trim() || !sectionContentInput.trim()) {
      alert('Vui lòng nhập tiêu đề mục và nội dung!');
      return;
    }

    if (editingSectionId) {
      setExtraSections(
        extraSections.map((sec) =>
          sec.id === editingSectionId
            ? {
                ...sec,
                title: sectionTitleInput.trim(),
                type: sectionTypeInput,
                content: sectionContentInput.trim(),
                note: sectionNoteInput.trim() || undefined,
              }
            : sec
        )
      );
    } else {
      const newSec: CustomLessonSection = {
        id: `sec-${Date.now()}`,
        title: sectionTitleInput.trim(),
        type: sectionTypeInput,
        content: sectionContentInput.trim(),
        note: sectionNoteInput.trim() || undefined,
      };
      setExtraSections([...extraSections, newSec]);
    }

    // Reset
    setIsAddingSection(false);
    setEditingSectionId(null);
    setSectionTitleInput('');
    setSectionContentInput('');
    setSectionNoteInput('');
  };

  const handleStartEditSection = (sec: CustomLessonSection) => {
    setEditingSectionId(sec.id);
    setSectionTitleInput(sec.title);
    setSectionTypeInput(sec.type);
    setSectionContentInput(sec.content);
    setSectionNoteInput(sec.note || '');
    setIsAddingSection(true);
  };

  const handleDeleteSection = (id: string) => {
    if (window.confirm('Bạn có chắc muốn xóa mục nội dung tùy chọn này?')) {
      setExtraSections(extraSections.filter((s) => s.id !== id));
      if (editingSectionId === id) {
        setIsAddingSection(false);
        setEditingSectionId(null);
      }
    }
  };

  const handleMoveSection = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= extraSections.length) return;
    const updated = [...extraSections];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    setExtraSections(updated);
  };

  // Problem Type Handlers
  const handleSaveProblemType = () => {
    if (!typeTitleInput.trim()) {
      alert('Vui lòng nhập tên dạng toán!');
      return;
    }

    const typeObj: ProblemTypeItem = {
      id:
        editingTypeIndex !== null && problemTypes[editingTypeIndex]
          ? problemTypes[editingTypeIndex].id
          : `type-custom-${Date.now()}`,
      title: typeTitleInput.trim(),
      description: typeDescInput.trim(),
      sampleQuestion: typeQuestionInput.trim(),
      sampleOptions: typeOptionsInput.map((opt) => opt.trim()),
      correctAnswer: typeAnswerInput,
      explanation: typeExplanationInput.trim(),
    };

    if (editingTypeIndex !== null) {
      const updated = [...problemTypes];
      updated[editingTypeIndex] = typeObj;
      setProblemTypes(updated);
    } else {
      setProblemTypes([...problemTypes, typeObj]);
    }

    setIsAddingType(false);
    setEditingTypeIndex(null);
  };

  const handleStartEditType = (index: number) => {
    const pt = problemTypes[index];
    setEditingTypeIndex(index);
    setTypeTitleInput(pt.title);
    setTypeDescInput(pt.description);
    setTypeQuestionInput(pt.sampleQuestion);
    setTypeOptionsInput(pt.sampleOptions || ['A. ', 'B. ', 'C. ', 'D. ']);
    setTypeAnswerInput(pt.correctAnswer || 'A');
    setTypeExplanationInput(pt.explanation || '');
    setIsAddingType(true);
  };

  const handleDeleteType = (index: number) => {
    if (window.confirm('Bạn có chắc muốn xóa dạng toán này?')) {
      setProblemTypes(problemTypes.filter((_, i) => i !== index));
      if (editingTypeIndex === index) {
        setIsAddingType(false);
        setEditingTypeIndex(null);
      }
    }
  };

  // Create brand new lesson in current chapter
  const handleCreateNewLesson = () => {
    if (!newLessonNameInput.trim() || !currentChapter) return;

    const newLessonId = `lesson-custom-${Date.now()}`;
    const newLesson: LessonType = {
      id: newLessonId,
      name: newLessonNameInput.trim(),
      typeCount: 5,
      chapterId: currentChapter.id,
      grade: selectedGrade,
      theoryContent: {
        summary: 'Nội dung lý thuyết trọng tâm của bài học đang được biên tập.',
        boxedFormulas: ['Công thức trọng tâm 1: $y = f(x)$'],
        extraSections: [],
      },
      problemTypes: [],
    };

    saveNewCustomLesson(newLesson);
    setShowNewLessonModal(false);
    setNewLessonNameInput('');
    reloadCurriculum();
    setSelectedLessonId(newLessonId);
    setSaveSuccessMsg(`Đã tạo thành công bài học mới "${newLesson.name}"!`);
    setTimeout(() => setSaveSuccessMsg(''), 4000);
  };

  // Export JSON Backup
  const handleExportJSON = () => {
    const jsonStr = exportAdminDataJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `toan_tran_trong_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import JSON Backup
  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const success = importAdminDataJSON(content);
        if (success) {
          alert('Nhập dữ liệu thành công! Toàn bộ nội dung đã được cập nhật.');
          reloadCurriculum();
        } else {
          alert('Tệp dữ liệu không hợp lệ. Vui lòng kiểm tra lại!');
        }
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Generate TypeScript code snippet for copying
  const generateTypeScriptCode = () => {
    if (!currentLesson) return '';
    const obj = {
      id: currentLesson.id,
      name: lessonName,
      typeCount: problemTypes.length || 15,
      chapterId: currentChapter?.id || '',
      grade: selectedGrade,
      theoryContent: {
        summary: lessonSummary,
        boxedFormulas: formulas,
        ...(extraSections.length > 0 ? { extraSections } : {}),
      },
      problemTypes: problemTypes.slice(0, 15),
    };

    return `// Mã nguồn bài học: ${lessonName}\n// Bạn có thể dán đối tượng này vào mảng lessons trong file src/data/curriculumData.ts\n\n` +
      JSON.stringify(obj, null, 2);
  };

  const mathShortcuts = [
    { label: 'a/b', latex: '$\\frac{a}{b}$' },
    { label: '√x', latex: '$\\sqrt{x}$' },
    { label: 'x²', latex: '$x^2$' },
    { label: 'x₁', latex: '$x_1$' },
    { label: '∈', latex: '$\\in$' },
    { label: '∉', latex: '$\\notin$' },
    { label: '∀', latex: '$\\forall$' },
    { label: '∃', latex: '$\\exists$' },
    { label: '⇒', latex: '$\\Rightarrow$' },
    { label: '⇔', latex: '$\\Leftrightarrow$' },
    { label: '≤', latex: '$\\le$' },
    { label: '≥', latex: '$\\ge$' },
    { label: '±', latex: '$\\pm$' },
    { label: '∞', latex: '$\\infty$' },
    { label: '∫', latex: '$\\int_{a}^{b} f(x)\\,dx$' },
    { label: 'lim', latex: '$\\lim_{x \\to x_0} f(x)$' },
    { label: 'vec', latex: '$\\vec{a}$' },
    { label: 'π', latex: '$\\pi$' },
    { label: 'ℝ', latex: '$\\mathbb{R}$' },
  ];

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto my-14 p-6 sm:p-8 bg-white rounded-3xl shadow-xl border border-slate-200 animate-in fade-in duration-200">
        <div className="text-center space-y-3 mb-6">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-[#0F6B55] text-white flex items-center justify-center shadow-md">
            <Lock className="w-7 h-7 text-amber-300" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Đăng nhập Quản Trị (AdminView)
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Khu vực dành riêng cho <b>Thầy Trần Trọng</b>. Vui lòng nhập mật khẩu quản trị để vào hệ thống.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Mật khẩu quản trị *
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={passwordInput}
                onChange={(e) => {
                  setPasswordInput(e.target.value);
                  setAuthError('');
                }}
                placeholder="Nhập mật khẩu quản trị..."
                className="w-full px-4 py-2.5 pr-16 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0F6B55] focus:border-[#0F6B55] text-sm font-medium"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-teal-800 px-2 py-1 hover:bg-slate-100 rounded cursor-pointer select-none"
              >
                {showPassword ? 'Ẩn' : 'Hiện'}
              </button>
            </div>
            {authError && (
              <p className="mt-2 text-xs font-semibold text-rose-600 bg-rose-50 p-2.5 rounded-lg border border-rose-200">
                {authError}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-2.5 px-4 rounded-xl bg-[#0F6B55] hover:bg-[#0B5563] text-white font-bold text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <KeyRound className="w-4 h-4" />
            <span>Vào trang quản trị</span>
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16 animate-in fade-in duration-200">
      {/* Top Banner / Admin Header */}
      <div className="bg-gradient-to-r from-teal-900 via-teal-800 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-md border border-teal-700/50 relative overflow-hidden">
        <div className="relative z-10 space-y-3 max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-200 text-xs font-semibold border border-teal-400/30">
            <Settings className="w-3.5 h-3.5" />
            <span>Khu vực Quản trị & Biên tập nội dung</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Công cụ chỉnh sửa & Thêm nội dung bài học
          </h1>

          <p className="text-teal-100 text-xs sm:text-sm leading-relaxed">
            Hệ thống cho phép Thầy Trần Trọng trực tiếp chỉnh sửa lý thuyết, thêm/sửa công thức KaTeX,
            tự do bổ sung các khối nội dung tùy ý (phương pháp giải, ví dụ mẫu, lưu ý bẫy đề, bài tập thêm)
            và quản lý các dạng toán cho từng bài trong mỗi chương của Toán 10, 11 và 12.
          </p>

          {/* Action Bar */}
          <div className="flex flex-wrap items-center gap-2 pt-2">
            <button
              onClick={handleSaveLesson}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Lưu thay đổi bài học này</span>
            </button>

            {currentLesson && onNavigateToLesson && (
              <button
                onClick={() =>
                  onNavigateToLesson(selectedGrade, selectedChapterId, currentLesson.id)
                }
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-700 hover:bg-teal-600 text-white font-semibold text-xs sm:text-sm border border-teal-500/50 transition-all cursor-pointer"
              >
                <Eye className="w-4 h-4" />
                <span>Xem trước giao diện bài học</span>
              </button>
            )}

            <button
              onClick={handleExportJSON}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-all cursor-pointer"
              title="Xuất file sao lưu JSON"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Xuất sao lưu</span>
            </button>

            <label className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-all cursor-pointer">
              <Upload className="w-3.5 h-3.5" />
              <span>Nhập sao lưu</span>
              <input
                type="file"
                accept=".json"
                className="hidden"
                onChange={handleImportJSON}
              />
            </label>

            {isCustomized && (
              <button
                onClick={handleResetLesson}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-900/60 hover:bg-rose-900 text-rose-200 text-xs font-medium border border-rose-700/50 transition-all cursor-pointer"
                title="Khôi phục lại nội dung gốc mặc định"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Khôi phục gốc</span>
              </button>
            )}

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-600/30 hover:bg-rose-600/50 text-rose-200 text-xs font-bold border border-rose-500/40 transition-all cursor-pointer ml-auto"
              title="Đăng xuất khỏi trang quản trị"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Đăng xuất</span>
            </button>
          </div>

          {saveSuccessMsg && (
            <div className="flex items-center gap-2 p-3 bg-emerald-500/20 border border-emerald-400 text-emerald-200 rounded-xl text-xs sm:text-sm font-semibold animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
              <span>{saveSuccessMsg}</span>
            </div>
          )}
        </div>
      </div>
      <div className="bg-white rounded-2xl border border-slate-200 p-2 shadow-xs flex flex-wrap gap-2">
        <button
          onClick={() => setAdminSection('curriculum')}
          className={`flex-1 min-w-[220px] flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-xl font-extrabold text-xs sm:text-sm transition-all cursor-pointer ${
            adminSection === 'curriculum'
              ? 'bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 shadow-md ring-2 ring-amber-500'
              : 'bg-slate-50 hover:bg-slate-100 text-slate-700'
          }`}
        >
          <BookOpen className="w-4 h-4 text-slate-950" />
          <span>Biên tập bài học (Toán 10 - 11 - 12)</span>
        </button>

        <button
          onClick={() => setAdminSection('question_bank')}
          className={`flex-1 min-w-[220px] flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-xl font-extrabold text-xs sm:text-sm transition-all cursor-pointer ${
            adminSection === 'question_bank'
              ? 'bg-gradient-to-r from-indigo-700 to-indigo-800 text-white shadow-md ring-2 ring-indigo-500'
              : 'bg-slate-50 hover:bg-slate-100 text-slate-700'
          }`}
        >
          <Layers className={`w-4 h-4 ${adminSection === 'question_bank' ? 'text-amber-300' : 'text-indigo-600'}`} />
          <span>Ngân hàng câu hỏi</span>
        </button>

        <button
          onClick={() => setAdminSection('weekly')}
          className={`flex-1 min-w-[200px] flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-xl font-extrabold text-xs sm:text-sm transition-all cursor-pointer ${
            adminSection === 'weekly'
              ? 'bg-teal-800 text-white shadow-md ring-2 ring-teal-600'
              : 'bg-slate-50 hover:bg-slate-100 text-slate-700'
          }`}
        >
          <Trophy className={`w-4 h-4 ${adminSection === 'weekly' ? 'text-amber-300' : 'text-amber-600'}`} />
          <span>Đăng bài toán tuần</span>
        </button>

        <button
          onClick={() => setAdminSection('exams')}
          className={`flex-1 min-w-[190px] flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-xl font-extrabold text-xs sm:text-sm transition-all cursor-pointer ${
            adminSection === 'exams'
              ? 'bg-teal-800 text-white shadow-md ring-2 ring-teal-600'
              : 'bg-slate-50 hover:bg-slate-100 text-slate-700'
          }`}
        >
          <ClipboardCheck className={`w-4 h-4 ${adminSection === 'exams' ? 'text-teal-200' : 'text-teal-700'}`} />
          <span>Đề thi & Tài liệu</span>
        </button>
      </div>

      {adminSection === 'curriculum' && (
        /* Main Admin Grid */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Sidebar: Select Grade, Chapter, Lesson */}
        <aside className="lg:col-span-4 space-y-4">
          {/* Grade Selector Tabs */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
              1. Chọn Khối lớp
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['10', '11', '12'] as GradeLevel[]).map((grade) => (
                <button
                  key={grade}
                  onClick={() => setSelectedGrade(grade)}
                  className={`py-2 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer text-center ${
                    selectedGrade === grade
                      ? 'bg-teal-800 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Toán {grade}
                </button>
              ))}
            </div>
          </div>

          {/* Chapter & Lesson Selector Accordion */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                2. Chọn Chương & Bài học
              </label>
              <button
                onClick={() => setShowNewLessonModal(true)}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-teal-800 hover:text-teal-900 bg-teal-50 hover:bg-teal-100 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                title="Tạo bài học mới trong chương này"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Thêm bài mới</span>
              </button>
            </div>

            {/* Chapter Dropdown / List */}
            <div className="space-y-3">
              <label className="text-xs font-semibold text-slate-700 block">Chương:</label>
              <select
                value={selectedChapterId}
                onChange={(e) => {
                  setSelectedChapterId(e.target.value);
                  const ch = curriculumChapters.find((c) => c.id === e.target.value);
                  if (ch && ch.lessons.length > 0) {
                    setSelectedLessonId(ch.lessons[0].id);
                  }
                }}
                className="w-full text-xs sm:text-sm font-medium border border-slate-300 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-700"
              >
                {curriculumChapters.map((ch) => (
                  <option key={ch.id} value={ch.id}>
                    {ch.title} ({ch.lessons.length} bài)
                  </option>
                ))}
              </select>

              {/* Lesson List in Selected Chapter */}
              <label className="text-xs font-semibold text-slate-700 block pt-1">
                Danh sách bài học trong chương:
              </label>
              <div className="space-y-1.5 max-h-[380px] overflow-y-auto pr-1">
                {currentChapter?.lessons.map((lesson, idx) => {
                  const isSelected = lesson.id === selectedLessonId;
                  const hasCustom = Boolean(overrides[lesson.id]);
                  return (
                    <button
                      key={lesson.id}
                      onClick={() => setSelectedLessonId(lesson.id)}
                      className={`w-full text-left p-2.5 rounded-xl text-xs sm:text-sm transition-all flex items-center justify-between gap-2 cursor-pointer ${
                        isSelected
                          ? 'bg-teal-800 text-white font-bold shadow-xs'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      <div className="truncate flex-1">
                        <span className="block truncate">{lesson.name}</span>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        {hasCustom && (
                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                              isSelected
                                ? 'bg-amber-300 text-slate-950'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            Đã sửa
                          </span>
                        )}
                        <ChevronRight className={`w-3.5 h-3.5 ${isSelected ? 'text-teal-200' : 'text-slate-400'}`} />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </aside>

        {/* Right Panel: Content Editor for Selected Lesson */}
        <main className="lg:col-span-8 space-y-4">
          {currentLesson ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              {/* Header of Editor */}
              <div className="p-5 border-b border-slate-200 bg-slate-50/60 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-teal-800 bg-teal-50 px-2 py-0.5 rounded-md">
                      Toán {selectedGrade} · {currentChapter?.title}
                    </span>
                    {isCustomized && (
                      <span className="text-[11px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md">
                        Đang áp dụng tùy chỉnh
                      </span>
                    )}
                  </div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">
                    {currentLesson.name}
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSaveLesson}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-800 hover:bg-teal-900 text-white font-bold text-xs shadow-xs cursor-pointer transition-all"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Lưu bài học</span>
                  </button>
                </div>
              </div>

              {/* Editor Tabs */}
              <div className="border-b border-slate-200 px-4 bg-white flex overflow-x-auto gap-2 py-2">
                <button
                  onClick={() => setEditorTab('overview')}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
                    editorTab === 'overview'
                      ? 'bg-teal-800 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <BookOpen className="w-4 h-4" />
                  <span>1. Tên & Lý thuyết chính</span>
                </button>

                <button
                  onClick={() => setEditorTab('formulas')}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
                    editorTab === 'formulas'
                      ? 'bg-teal-800 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  <span>2. Công thức ({formulas.length})</span>
                </button>

                <button
                  onClick={() => setEditorTab('extra_sections')}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
                    editorTab === 'extra_sections'
                      ? 'bg-teal-800 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <ListPlus className="w-4 h-4" />
                  <span>3. Mục nội dung tùy ý ({extraSections.length})</span>
                </button>

                <button
                  onClick={() => setEditorTab('problem_types')}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
                    editorTab === 'problem_types'
                      ? 'bg-teal-800 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Layers className="w-4 h-4" />
                  <span>4. Dạng toán ({problemTypes.length})</span>
                </button>

                <button
                  onClick={() => setEditorTab('code_export')}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
                    editorTab === 'code_export'
                      ? 'bg-teal-800 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <FileCode className="w-4 h-4" />
                  <span>5. Xuất mã TS</span>
                </button>
              </div>

              {/* Tab Contents */}
              <div className="p-5 sm:p-6 space-y-6">
                {/* ======================================================== */}
                {/* TAB 1: OVERVIEW & THEORY */}
                {/* ======================================================== */}
                {editorTab === 'overview' && (
                  <div className="space-y-5">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                        Tên bài học
                      </label>
                      <input
                        type="text"
                        value={lessonName}
                        onChange={(e) => setLessonName(e.target.value)}
                        className="w-full text-sm font-semibold border border-slate-300 rounded-xl px-3.5 py-2.5 focus:outline-hidden focus:ring-2 focus:ring-teal-700"
                        placeholder="Ví dụ: Bài 1. Mệnh đề toán học"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                          Tóm tắt kiến thức / Lý thuyết cốt lõi
                        </label>
                        <span className="text-[11px] text-slate-500">
                          Hỗ trợ công thức KaTeX kẹp giữa cặp dấu <code>$ ... $</code>
                        </span>
                      </div>

                      {/* Math shortcuts */}
                      <div className="p-2 bg-slate-50 rounded-xl border border-slate-200 flex flex-wrap gap-1 items-center">
                        <span className="text-[11px] font-semibold text-slate-500 mr-1">Chèn nhanh:</span>
                        {mathShortcuts.slice(0, 12).map((item, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => insertLatexToField(setLessonSummary, ` ${item.latex} `)}
                            className="px-2 py-1 text-xs bg-white hover:bg-teal-50 hover:text-teal-900 border border-slate-200 rounded-md font-mono transition-colors cursor-pointer"
                          >
                            {item.label}
                          </button>
                        ))}
                      </div>

                      <textarea
                        value={lessonSummary}
                        onChange={(e) => setLessonSummary(e.target.value)}
                        rows={6}
                        className="w-full text-sm border border-slate-300 rounded-xl p-3.5 focus:outline-hidden focus:ring-2 focus:ring-teal-700 leading-relaxed font-sans"
                        placeholder="Nhập nội dung tóm tắt kiến thức trọng tâm cho bài học..."
                      />

                      {/* Live Preview */}
                      <div className="space-y-1.5 pt-2">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                          Xem trước hiển thị trực tiếp (Live KaTeX Preview):
                        </span>
                        <div className="p-4 bg-teal-50/50 rounded-xl border border-teal-200/80 text-sm leading-relaxed text-slate-800">
                          <MathView text={lessonSummary || 'Chưa có nội dung tóm tắt.'} />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ======================================================== */}
                {/* TAB 2: FORMULAS MANAGEMENT */}
                {/* ======================================================== */}
                {editorTab === 'formulas' && (
                  <div className="space-y-6">
                    <div className="p-4 bg-teal-50/70 border border-teal-200 rounded-2xl space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-teal-950">
                          {editingFormulaIndex !== null
                            ? `Đang sửa công thức #${editingFormulaIndex + 1}`
                            : '+ Thêm công thức mới vào bài'}
                        </h4>
                        {editingFormulaIndex !== null && (
                          <button
                            onClick={() => {
                              setEditingFormulaIndex(null);
                              setNewFormulaInput('');
                            }}
                            className="text-xs text-slate-500 hover:text-slate-800"
                          >
                            Hủy sửa
                          </button>
                        )}
                      </div>

                      {/* Math symbol toolbar */}
                      <div className="flex flex-wrap gap-1 items-center bg-white p-2 rounded-xl border border-teal-100">
                        <span className="text-[11px] font-semibold text-slate-500 mr-1">Ký hiệu:</span>
                        {mathShortcuts.map((item, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => insertLatexToField(setNewFormulaInput, item.latex)}
                            className="px-2 py-0.5 text-xs bg-slate-50 hover:bg-teal-100 hover:text-teal-900 border border-slate-200 rounded font-mono transition-colors cursor-pointer"
                          >
                            {item.label}
                          </button>
                        ))}
                      </div>

                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newFormulaInput}
                          onChange={(e) => setNewFormulaInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleAddOrUpdateFormula();
                          }}
                          placeholder="Ví dụ: Định lý sin: $\frac{a}{\sin A} = \frac{b}{\sin B} = 2R$"
                          className="flex-1 text-sm border border-slate-300 rounded-xl px-3.5 py-2.5 bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-700"
                        />
                        <button
                          type="button"
                          onClick={handleAddOrUpdateFormula}
                          className="px-4 py-2.5 rounded-xl bg-teal-800 hover:bg-teal-900 text-white font-bold text-xs shrink-0 cursor-pointer transition-all"
                        >
                          {editingFormulaIndex !== null ? 'Cập nhật' : 'Thêm công thức'}
                        </button>
                      </div>

                      {newFormulaInput && (
                        <div className="p-3 bg-white rounded-xl border border-teal-200 text-sm">
                          <span className="text-[11px] font-semibold text-slate-500 block mb-1">
                            Xem trước công thức vừa gõ:
                          </span>
                          <MathView text={newFormulaInput} />
                        </div>
                      )}
                    </div>

                    {/* Formula List */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                          Danh sách công thức hiện tại ({formulas.length})
                        </label>
                        <span className="text-xs text-slate-500">
                          Có thể đổi thứ tự bằng nút mũi tên hoặc bấm sửa trực tiếp
                        </span>
                      </div>

                      {formulas.length === 0 ? (
                        <div className="p-8 text-center text-slate-400 bg-slate-50 border border-dashed border-slate-300 rounded-xl">
                          Chưa có công thức nào. Hãy nhập ở ô phía trên và bấm "Thêm công thức".
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {formulas.map((item, idx) => (
                            <div
                              key={idx}
                              className={`flex items-start gap-2.5 p-3 rounded-xl border transition-all ${
                                editingFormulaIndex === idx
                                  ? 'bg-amber-50/80 border-amber-300 ring-2 ring-amber-300/50'
                                  : 'bg-white border-slate-200 hover:border-teal-300'
                              }`}
                            >
                              <span className="w-6 h-6 rounded-md bg-teal-100 text-teal-900 text-xs font-bold font-mono flex items-center justify-center shrink-0 mt-0.5">
                                {idx + 1}
                              </span>

                              <div className="flex-1 overflow-x-auto text-sm text-slate-800 font-medium">
                                <MathView text={item} />
                              </div>

                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => handleMoveFormula(idx, 'up')}
                                  disabled={idx === 0}
                                  className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-20 cursor-pointer"
                                  title="Di chuyển lên"
                                >
                                  <ArrowUp className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleMoveFormula(idx, 'down')}
                                  disabled={idx === formulas.length - 1}
                                  className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-20 cursor-pointer"
                                  title="Di chuyển xuống"
                                >
                                  <ArrowDown className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleEditFormula(idx)}
                                  className="p-1 text-teal-700 hover:bg-teal-50 rounded cursor-pointer"
                                  title="Chỉnh sửa"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteFormula(idx)}
                                  className="p-1 text-rose-600 hover:bg-rose-50 rounded cursor-pointer"
                                  title="Xóa công thức"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* ======================================================== */}
                {/* TAB 3: CUSTOM ARBITRARY CONTENT SECTIONS */}
                {/* ======================================================== */}
                {editorTab === 'extra_sections' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                          Các mục nội dung tùy ý của bài học
                        </h3>
                        <p className="text-xs text-slate-500">
                          Thầy có thể thêm bất kỳ mục nào vào bài học: Phương pháp giải nhanh, Ví dụ minh họa, Lưu ý bẫy đề, Bài tập về nhà...
                        </p>
                      </div>

                      {!isAddingSection && (
                        <button
                          onClick={() => {
                            setEditingSectionId(null);
                            setSectionTitleInput('');
                            setSectionTypeInput('method');
                            setSectionContentInput('');
                            setSectionNoteInput('');
                            setIsAddingSection(true);
                          }}
                          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-teal-800 hover:bg-teal-900 text-white font-bold text-xs shadow-xs cursor-pointer"
                        >
                          <Plus className="w-4 h-4" />
                          <span>+ Thêm mục nội dung mới</span>
                        </button>
                      )}
                    </div>

                    {/* Section Creator / Editor Modal Form */}
                    {isAddingSection && (
                      <div className="p-5 bg-teal-50/80 border border-teal-300 rounded-2xl space-y-4 animate-in fade-in">
                        <div className="flex items-center justify-between pb-2 border-b border-teal-200">
                          <h4 className="font-bold text-teal-950 text-sm">
                            {editingSectionId ? 'Chỉnh sửa mục nội dung' : 'Thêm mục nội dung tùy ý mới'}
                          </h4>
                          <button
                            onClick={() => {
                              setIsAddingSection(false);
                              setEditingSectionId(null);
                            }}
                            className="text-xs text-slate-500 hover:text-slate-800 font-semibold"
                          >
                            Đóng / Hủy
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div className="md:col-span-2 space-y-1">
                            <label className="text-xs font-bold text-slate-700">Tiêu đề mục:</label>
                            <input
                              type="text"
                              value={sectionTitleInput}
                              onChange={(e) => setSectionTitleInput(e.target.value)}
                              placeholder="Ví dụ: Phương pháp giải nhanh dạng cực trị"
                              className="w-full text-xs sm:text-sm font-medium border border-slate-300 rounded-xl px-3 py-2 bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-700"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-700">Kiểu hiển thị:</label>
                            <select
                              value={sectionTypeInput}
                              onChange={(e) => setSectionTypeInput(e.target.value as any)}
                              className="w-full text-xs sm:text-sm font-medium border border-slate-300 rounded-xl px-3 py-2 bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-700"
                            >
                              <option value="method">💡 Phương pháp giải nhanh</option>
                              <option value="example">📖 Ví dụ minh họa có lời giải</option>
                              <option value="notice">⚠️ Lưu ý & Bẫy đề thi</option>
                              <option value="note">📌 Ghi chú trọng tâm</option>
                              <option value="text">📝 Đoạn văn tự do</option>
                            </select>
                          </div>
                        </div>

                        {/* Math shortcuts */}
                        <div className="flex flex-wrap gap-1 items-center bg-white p-2 rounded-xl border border-teal-100">
                          <span className="text-[11px] font-semibold text-slate-500 mr-1">Chèn ký hiệu:</span>
                          {mathShortcuts.slice(0, 14).map((item, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => insertLatexToField(setSectionContentInput, item.latex)}
                              className="px-2 py-0.5 text-xs bg-slate-50 hover:bg-teal-100 hover:text-teal-900 border border-slate-200 rounded font-mono transition-colors cursor-pointer"
                            >
                              {item.label}
                            </button>
                          ))}
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-700">Nội dung chi tiết (hỗ trợ công thức $ ... $):</label>
                          <textarea
                            value={sectionContentInput}
                            onChange={(e) => setSectionContentInput(e.target.value)}
                            rows={5}
                            placeholder="Nhập nội dung chi tiết, các bước giải, hoặc ví dụ minh họa..."
                            className="w-full text-xs sm:text-sm border border-slate-300 rounded-xl p-3 bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-700"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-700">Ghi chú phụ / Lời khuyên thêm (tùy chọn):</label>
                          <input
                            type="text"
                            value={sectionNoteInput}
                            onChange={(e) => setSectionNoteInput(e.target.value)}
                            placeholder="Ví dụ: Áp dụng tốt nhất cho đề thi trắc nghiệm 2025"
                            className="w-full text-xs sm:text-sm border border-slate-300 rounded-xl px-3 py-2 bg-white"
                          />
                        </div>

                        {/* Live Preview of section */}
                        {sectionContentInput && (
                          <div className="p-3 bg-white rounded-xl border border-teal-200 space-y-1 text-xs sm:text-sm">
                            <span className="text-[11px] font-bold text-teal-800 uppercase tracking-wider block">
                              Xem trước khối nội dung:
                            </span>
                            <div className="font-bold text-slate-900">{sectionTitleInput || 'Chưa có tiêu đề'}</div>
                            <div className="text-slate-700 leading-relaxed">
                              <MathView text={sectionContentInput} />
                            </div>
                            {sectionNoteInput && (
                              <div className="text-[11px] text-slate-500 italic">
                                * Ghi chú: {sectionNoteInput}
                              </div>
                            )}
                          </div>
                        )}

                        <div className="flex justify-end gap-2 pt-2">
                          <button
                            type="button"
                            onClick={() => {
                              setIsAddingSection(false);
                              setEditingSectionId(null);
                            }}
                            className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-200 rounded-xl cursor-pointer"
                          >
                            Hủy
                          </button>
                          <button
                            type="button"
                            onClick={handleSaveSection}
                            className="px-5 py-2 text-xs font-bold bg-teal-800 hover:bg-teal-900 text-white rounded-xl shadow-xs cursor-pointer"
                          >
                            Lưu mục này vào bài học
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Section List */}
                    {extraSections.length === 0 ? (
                      <div className="p-8 text-center text-slate-400 bg-slate-50 border border-dashed border-slate-300 rounded-xl">
                        Bài học này hiện chưa có mục nội dung tùy ý nào. Hãy bấm nút <b>"+ Thêm mục nội dung mới"</b> ở trên để bổ sung phương pháp giải, ví dụ mẫu hoặc lưu ý riêng của Thầy!
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {extraSections.map((sec, idx) => (
                          <div
                            key={sec.id}
                            className="p-4 rounded-xl border border-slate-200 bg-white hover:border-teal-300 transition-all shadow-xs space-y-2"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="w-5 h-5 rounded-md bg-teal-100 text-teal-900 text-xs font-bold flex items-center justify-center font-mono">
                                  {idx + 1}
                                </span>
                                <h4 className="font-bold text-slate-900 text-sm">{sec.title}</h4>
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
                                  {sec.type === 'method' && '💡 Phương pháp'}
                                  {sec.type === 'example' && '📖 Ví dụ'}
                                  {sec.type === 'notice' && '⚠️ Lưu ý'}
                                  {sec.type === 'note' && '📌 Ghi chú'}
                                  {sec.type === 'text' && '📝 Thuyết minh'}
                                </span>
                              </div>

                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleMoveSection(idx, 'up')}
                                  disabled={idx === 0}
                                  className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-20 cursor-pointer"
                                  title="Di chuyển lên"
                                >
                                  <ArrowUp className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleMoveSection(idx, 'down')}
                                  disabled={idx === extraSections.length - 1}
                                  className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-20 cursor-pointer"
                                  title="Di chuyển xuống"
                                >
                                  <ArrowDown className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleStartEditSection(sec)}
                                  className="p-1 text-teal-700 hover:bg-teal-50 rounded cursor-pointer"
                                  title="Sửa mục này"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteSection(sec.id)}
                                  className="p-1 text-rose-600 hover:bg-rose-50 rounded cursor-pointer"
                                  title="Xóa mục này"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            <div className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50/70 p-3 rounded-lg border border-slate-100">
                              <MathView text={sec.content} />
                            </div>

                            {sec.note && (
                              <div className="text-[11px] text-slate-500 italic">
                                * Ghi chú: {sec.note}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* ======================================================== */}
                {/* TAB 4: PROBLEM TYPES (DẠNG TOÁN) */}
                {/* ======================================================== */}
                {editorTab === 'problem_types' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                          Danh sách Dạng toán & Câu hỏi mẫu ({problemTypes.length} dạng)
                        </h3>
                        <p className="text-xs text-slate-500">
                          Chỉnh sửa tên dạng toán, câu hỏi minh họa, 4 phương án, đáp án và lời giải chi tiết.
                        </p>
                      </div>

                      {!isAddingType && (
                        <button
                          onClick={() => {
                            setEditingTypeIndex(null);
                            setTypeTitleInput(`Dạng ${problemTypes.length + 1}: `);
                            setTypeDescInput('');
                            setTypeQuestionInput('');
                            setTypeOptionsInput(['A. ', 'B. ', 'C. ', 'D. ']);
                            setTypeAnswerInput('A');
                            setTypeExplanationInput('');
                            setIsAddingType(true);
                          }}
                          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-teal-800 hover:bg-teal-900 text-white font-bold text-xs shadow-xs cursor-pointer"
                        >
                          <Plus className="w-4 h-4" />
                          <span>+ Thêm dạng toán mới</span>
                        </button>
                      )}
                    </div>

                    {isAddingType && (
                      <div className="p-5 bg-teal-50/80 border border-teal-300 rounded-2xl space-y-4 animate-in fade-in">
                        <div className="flex items-center justify-between pb-2 border-b border-teal-200">
                          <h4 className="font-bold text-teal-950 text-sm">
                            {editingTypeIndex !== null
                              ? `Chỉnh sửa dạng toán #${editingTypeIndex + 1}`
                              : 'Thêm dạng toán mới'}
                          </h4>
                          <button
                            onClick={() => {
                              setIsAddingType(false);
                              setEditingTypeIndex(null);
                            }}
                            className="text-xs text-slate-500 hover:text-slate-800 font-semibold"
                          >
                            Đóng / Hủy
                          </button>
                        </div>

                        <div className="space-y-3">
                          <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-700">Tên dạng toán:</label>
                            <input
                              type="text"
                              value={typeTitleInput}
                              onChange={(e) => setTypeTitleInput(e.target.value)}
                              placeholder="Ví dụ: Dạng 1: Tìm tập xác định của hàm số"
                              className="w-full text-xs sm:text-sm font-semibold border border-slate-300 rounded-xl px-3 py-2 bg-white"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-700">Mô tả phương pháp giải:</label>
                            <textarea
                              value={typeDescInput}
                              onChange={(e) => setTypeDescInput(e.target.value)}
                              rows={2}
                              placeholder="Mô tả tóm tắt phương pháp và dấu hiệu nhận biết..."
                              className="w-full text-xs sm:text-sm border border-slate-300 rounded-xl p-2.5 bg-white"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-700">Câu hỏi mẫu:</label>
                            <textarea
                              value={typeQuestionInput}
                              onChange={(e) => setTypeQuestionInput(e.target.value)}
                              rows={3}
                              placeholder="Nhập đề bài câu hỏi mẫu..."
                              className="w-full text-xs sm:text-sm border border-slate-300 rounded-xl p-2.5 bg-white"
                            />
                          </div>

                          {/* Options */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {['A', 'B', 'C', 'D'].map((letter, optIdx) => (
                              <div key={letter} className="space-y-0.5">
                                <label className="text-[11px] font-bold text-slate-600">
                                  Phương án {letter}:
                                </label>
                                <input
                                  type="text"
                                  value={typeOptionsInput[optIdx] || ''}
                                  onChange={(e) => {
                                    const updated = [...typeOptionsInput];
                                    updated[optIdx] = e.target.value;
                                    setTypeOptionsInput(updated);
                                  }}
                                  className="w-full text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white"
                                />
                              </div>
                            ))}
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div className="space-y-1">
                              <label className="text-xs font-bold text-slate-700">Đáp án đúng:</label>
                              <select
                                value={typeAnswerInput}
                                onChange={(e) => setTypeAnswerInput(e.target.value)}
                                className="w-full text-xs sm:text-sm font-semibold border border-slate-300 rounded-xl px-3 py-2 bg-white"
                              >
                                <option value="A">A</option>
                                <option value="B">B</option>
                                <option value="C">C</option>
                                <option value="D">D</option>
                              </select>
                            </div>

                            <div className="sm:col-span-2 space-y-1">
                              <label className="text-xs font-bold text-slate-700">Lời giải chi tiết:</label>
                              <textarea
                                value={typeExplanationInput}
                                onChange={(e) => setTypeExplanationInput(e.target.value)}
                                rows={2}
                                placeholder="Các bước giải chi tiết..."
                                className="w-full text-xs sm:text-sm border border-slate-300 rounded-xl p-2 bg-white"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                          <button
                            type="button"
                            onClick={() => {
                              setIsAddingType(false);
                              setEditingTypeIndex(null);
                            }}
                            className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-200 rounded-xl cursor-pointer"
                          >
                            Hủy
                          </button>
                          <button
                            type="button"
                            onClick={handleSaveProblemType}
                            className="px-5 py-2 text-xs font-bold bg-teal-800 hover:bg-teal-900 text-white rounded-xl shadow-xs cursor-pointer"
                          >
                            Lưu dạng toán
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Problem types list */}
                    {problemTypes.length === 0 ? (
                      <div className="p-8 text-center text-slate-400 bg-slate-50 border border-dashed border-slate-300 rounded-xl">
                        Chưa có dạng toán nào trong bài học này.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {problemTypes.map((pt, idx) => (
                          <div
                            key={pt.id || idx}
                            className="p-4 rounded-xl border border-slate-200 bg-white hover:border-teal-300 transition-all shadow-xs space-y-2"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="w-5 h-5 rounded-md bg-teal-100 text-teal-900 text-xs font-bold flex items-center justify-center font-mono">
                                  {idx + 1}
                                </span>
                                <h4 className="font-bold text-slate-900 text-sm">{pt.title}</h4>
                              </div>

                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleStartEditType(idx)}
                                  className="p-1 text-teal-700 hover:bg-teal-50 rounded cursor-pointer"
                                  title="Chỉnh sửa dạng này"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteType(idx)}
                                  className="p-1 text-rose-600 hover:bg-rose-50 rounded cursor-pointer"
                                  title="Xóa dạng này"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            {pt.description && (
                              <p className="text-xs text-slate-600 italic">
                                Phương pháp: {pt.description}
                              </p>
                            )}

                            {pt.sampleQuestion && (
                              <div className="text-xs sm:text-sm text-slate-800 bg-slate-50 p-3 rounded-lg border border-slate-100 space-y-1">
                                <div className="font-semibold text-slate-700">Ví dụ minh họa:</div>
                                <MathView text={pt.sampleQuestion} />
                                {pt.sampleOptions && pt.sampleOptions.length > 0 && (
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 pt-1 text-xs">
                                    {pt.sampleOptions.map((opt, oIdx) => (
                                      <div key={oIdx} className="text-slate-600">
                                        <MathView text={opt} />
                                      </div>
                                    ))}
                                  </div>
                                )}
                                <div className="text-[11px] font-bold text-teal-800 pt-1">
                                  Đáp án đúng: {pt.correctAnswer}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* ======================================================== */}
                {/* TAB 5: TYPESCRIPT CODE EXPORT */}
                {/* ======================================================== */}
                {editorTab === 'code_export' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                          Mã nguồn TypeScript bài học
                        </h3>
                        <p className="text-xs text-slate-500">
                          Bạn có thể sao chép mã nguồn này để dán vào file <code>src/data/curriculumData.ts</code> nếu muốn lưu trữ vĩnh viễn trong code.
                        </p>
                      </div>

                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(generateTypeScriptCode());
                          setCopiedCode(true);
                          setTimeout(() => setCopiedCode(false), 2500);
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-800 text-white font-semibold text-xs hover:bg-teal-900 transition-colors cursor-pointer"
                      >
                        {copiedCode ? <Check className="w-3.5 h-3.5 text-teal-200" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedCode ? 'Đã sao chép!' : 'Sao chép mã'}</span>
                      </button>
                    </div>

                    <pre className="p-4 bg-slate-900 text-teal-200 rounded-xl text-xs font-mono overflow-x-auto max-h-[420px] leading-relaxed">
                      {generateTypeScriptCode()}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
              Vui lòng chọn một bài học ở cột bên trái để bắt đầu chỉnh sửa.
            </div>
          )}
        </main>
      </div>
      )}

      {/* ======================================================== */}
      {/* SECTION 2: NGÂN HÀNG CÂU HỎI (QUESTION BANK) */}
      {/* ======================================================== */}
      {adminSection === 'question_bank' && (
        <QuestionBankManager />
      )}

      {/* ======================================================== */}
      {/* SECTION 3: QUẢN LÝ BÀI TOÁN TUẦN (WEEKLY CHALLENGE) */}
      {/* ======================================================== */}
      {adminSection === 'weekly' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6 animate-in fade-in">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-amber-50 text-amber-700 rounded-2xl border border-amber-200">
                <Trophy className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-bold text-amber-800 uppercase font-mono">
                  Quản lý Bài toán tuần – Thử thách cùng thầy Trần Trọng
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Biên tập & Đăng đề bài toán tuần mới
                </h2>
              </div>
            </div>

            <button
              onClick={handleSaveWeekly}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm shadow-md transition-all cursor-pointer border border-amber-500"
            >
              <Save className="w-4 h-4 text-slate-950" />
              <span>Lưu & Đăng bài toán tuần</span>
            </button>
          </div>

          {weeklySaveSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-xl text-sm font-semibold flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{weeklySaveSuccess}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 uppercase">1. Tuần & Thời gian:</label>
              <input
                type="text"
                value={weeklyWeek}
                onChange={(e) => setWeeklyWeek(e.target.value)}
                placeholder="Ví dụ: Tuần 3 - Tháng 10/2026"
                className="w-full text-sm font-semibold border border-slate-300 rounded-xl px-3.5 py-2.5 focus:outline-hidden focus:ring-2 focus:ring-teal-700"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 uppercase">2. Tiêu đề thử thách:</label>
              <input
                type="text"
                value={weeklyTitle}
                onChange={(e) => setWeeklyTitle(e.target.value)}
                placeholder="Ví dụ: Cực trị hình học không gian..."
                className="w-full text-sm font-semibold border border-slate-300 rounded-xl px-3.5 py-2.5 focus:outline-hidden focus:ring-2 focus:ring-teal-700"
              />
            </div>
          </div>

          {/* Question Text */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 uppercase">
                3. Nội dung câu hỏi (hỗ trợ công thức KaTeX trong dấu $...$):
              </label>
              <span className="text-xs text-slate-400 font-mono">Ví dụ: Cho khối chóp $S.ABC$...</span>
            </div>
            <textarea
              rows={4}
              value={weeklyQuestion}
              onChange={(e) => setWeeklyQuestion(e.target.value)}
              className="w-full text-sm border border-slate-300 rounded-xl p-3 focus:outline-hidden focus:ring-2 focus:ring-teal-700"
            />
            {/* Live Preview */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-sm text-slate-800">
              <span className="text-xs font-bold text-slate-500 block mb-1">Xem trước câu hỏi:</span>
              <MathView text={weeklyQuestion} />
            </div>
          </div>

          {/* 4 Options */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-700 uppercase">4. Các phương án trả lời:</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {weeklyOptions.map((opt, oIdx) => (
                <div key={oIdx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
                    <span>Phương án {String.fromCharCode(65 + oIdx)}</span>
                    <button
                      type="button"
                      onClick={() => setWeeklyCorrect(String.fromCharCode(65 + oIdx))}
                      className={`text-[11px] font-bold px-2 py-0.5 rounded cursor-pointer ${
                        weeklyCorrect === String.fromCharCode(65 + oIdx)
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {weeklyCorrect === String.fromCharCode(65 + oIdx) ? '✓ Đáp án đúng' : 'Chọn làm đáp án đúng'}
                    </button>
                  </div>
                  <input
                    type="text"
                    value={opt}
                    onChange={(e) => {
                      const updated = [...weeklyOptions];
                      updated[oIdx] = e.target.value;
                      setWeeklyOptions(updated);
                    }}
                    className="w-full text-sm border border-slate-300 rounded-xl px-3 py-2 focus:outline-hidden focus:ring-2 focus:ring-teal-700"
                  />
                  <div className="text-xs text-slate-600 px-1">
                    <MathView text={opt} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Solution */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase">
              5. Hướng dẫn giải chi tiết từ Thầy Trần Trọng:
            </label>
            <textarea
              rows={3}
              value={weeklySolution}
              onChange={(e) => setWeeklySolution(e.target.value)}
              className="w-full text-sm border border-slate-300 rounded-xl p-3 focus:outline-hidden focus:ring-2 focus:ring-teal-700"
            />
            <div className="p-3 bg-teal-50/60 rounded-xl border border-teal-200 text-xs sm:text-sm text-slate-800">
              <span className="text-xs font-bold text-teal-800 block mb-1">Xem trước lời giải:</span>
              <MathView text={weeklySolution} />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-amber-800 font-semibold bg-amber-50 px-3 py-2 rounded-xl border border-amber-200">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>Hiệu ứng pháo hoa confetti được tự động kích hoạt khi học sinh nộp bài và đạt điểm trên 8!</span>
            </div>

            <button
              onClick={handleSaveWeekly}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-black text-sm shadow-md transition-all cursor-pointer border-2 border-amber-500"
            >
              <Save className="w-4 h-4 text-slate-950" />
              <span>Lưu bài toán tuần này</span>
            </button>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SECTION 3: QUẢN LÝ ĐỀ KIỂM TRA & TÀI LIỆU */}
      {/* ======================================================== */}
      {adminSection === 'exams' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6 animate-in fade-in">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-teal-50 text-teal-800 rounded-2xl border border-teal-200">
                <ClipboardCheck className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-bold text-teal-800 uppercase font-mono">
                  Ngân hàng Đề thi &amp; Quản trị Kho Đề (AdminView)
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Quản lý Đề kiểm tra, Xóa đề &amp; Khôi phục Đề gốc
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => {
                  if (typeof (window as any).switchAppTab === 'function') {
                    (window as any).switchAppTab('taodethi');
                  } else if (typeof (window as any).openWordToExamModal === 'function') {
                    (window as any).openWordToExamModal();
                  }
                }}
                className="px-4 py-2 text-xs font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl shadow-xs flex items-center gap-2 cursor-pointer transition-colors"
                title="Mở giao diện Tạo Đề Online chuyên nghiệp chuẩn trang admin.taodethi.xyz"
              >
                <span>🛠️ Tạo Đề Online (taodethi.xyz)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (typeof (window as any).openWordToExamModal === 'function') {
                    (window as any).openWordToExamModal();
                  } else {
                    alert('Chức năng chuyển đổi Word sang KaTeX sẵn sàng trên giao diện Đề Tự Sinh!');
                  }
                }}
                className="px-4 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs flex items-center gap-2 cursor-pointer transition-colors"
                title="Tải đề thi từ file Word (.docx) để tự động chuyển sang KaTeX, nhận diện gạch chân và chạy trên web"
              >
                <span>📄 Tạo Đề Từ File Word (Word ➔ KaTeX)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (typeof (window as any).restoreDefaultSampleExams === 'function') {
                    (window as any).restoreDefaultSampleExams();
                  } else if (confirm('Xác nhận khôi phục toàn bộ các chủ đề và đề thi mặc định ban đầu của Thầy?')) {
                    localStorage.removeItem('lkt_hidden_default_exams');
                    alert('Đã khôi phục toàn bộ chủ đề gốc thành công!');
                  }
                }}
                className="px-4 py-2 text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl shadow-xs flex items-center gap-2 cursor-pointer transition-colors"
                title="Khôi phục lại toàn bộ danh sách các đề thi gốc chuẩn Kết nối tri thức của Thầy"
              >
                <span>🔄 Khôi phục chủ đề gốc</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (typeof (window as any).openSampleRepoModal === 'function') {
                    (window as any).openSampleRepoModal();
                  }
                }}
                className="px-4 py-2 text-xs font-bold bg-teal-800 hover:bg-teal-900 text-white rounded-xl shadow-xs flex items-center gap-2 cursor-pointer transition-colors"
                title="Mở Thư mục Kho Đề Mẫu để quản lý, xóa đề hoặc chọn đề kiểm tra"
              >
                <span>📁 Mở Kho Đề Mẫu Của Thầy</span>
              </button>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-900 leading-relaxed space-y-1">
            <p className="font-bold">🔒 Quyền hạn Quản trị viên (AdminView):</p>
            <p>
              • Chức năng <b>Xóa đề</b> và <b>Khôi phục chủ đề gốc</b> chỉ hiển thị và có tác dụng khi đăng nhập Quản trị viên.<br />
              • Nút <b>Tạo Đề Từ File Word</b> hỗ trợ tải đề Word (.docx/.txt), tự động chuyển đổi các công thức toán sang chuẩn KaTeX LaTeX, nhận dạng các chỉ số chân là số ($x_1, x_2, u_n, \log_2$), nhận diện đáp án gạch chân và chạy trực tiếp trên Web tự chấm điểm.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-900 text-sm">Đề kiểm tra Toán 10</h4>
                <span className="text-[11px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">KNTT</span>
              </div>
              <p className="text-xs text-slate-500">Gồm 6 đề trắc nghiệm chuẩn ma trận KNTT kèm lời giải chi tiết và tính năng tự sinh đề kề.</p>
              <button
                type="button"
                onClick={() => {
                  if (typeof (window as any).openSampleRepoModal === 'function') {
                    (window as any).openSampleRepoModal('10');
                  }
                }}
                className="text-xs font-bold text-teal-700 hover:text-teal-900 hover:underline cursor-pointer flex items-center gap-1"
              >
                Quản lý đề Toán 10 ➔
              </button>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-900 text-sm">Đề kiểm tra Toán 11</h4>
                <span className="text-[11px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">KNTT</span>
              </div>
              <p className="text-xs text-slate-500">Gồm 6 đề kiểm tra giữa kỳ và học kỳ có tự động chấm điểm, hỗ trợ nhập đề Word.</p>
              <button
                type="button"
                onClick={() => {
                  if (typeof (window as any).openSampleRepoModal === 'function') {
                    (window as any).openSampleRepoModal('11');
                  }
                }}
                className="text-xs font-bold text-teal-700 hover:text-teal-900 hover:underline cursor-pointer flex items-center gap-1"
              >
                Quản lý đề Toán 11 ➔
              </button>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-900 text-sm">Đề kiểm tra Toán 12</h4>
                <span className="text-[11px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">KNTT 2025</span>
              </div>
              <p className="text-xs text-slate-500">Đầy đủ đề ôn thi tốt nghiệp THPT theo cấu trúc mới 3 phần (TN, Đúng/Sai, Trả lời ngắn).</p>
              <button
                type="button"
                onClick={() => {
                  if (typeof (window as any).openSampleRepoModal === 'function') {
                    (window as any).openSampleRepoModal('12');
                  }
                }}
                className="text-xs font-bold text-teal-700 hover:text-teal-900 hover:underline cursor-pointer flex items-center gap-1"
              >
                Quản lý đề Toán 12 ➔
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Thêm bài học mới trong chương */}
      {showNewLessonModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <FolderPlus className="w-5 h-5 text-teal-800" />
              <h3 className="font-bold text-slate-900 text-base">Tạo bài học mới trong chương</h3>
            </div>

            <p className="text-xs text-slate-500">
              Chương đang chọn: <b>{currentChapter?.title}</b> (Toán {selectedGrade})
            </p>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Tên bài học mới:</label>
              <input
                type="text"
                value={newLessonNameInput}
                onChange={(e) => setNewLessonNameInput(e.target.value)}
                placeholder="Ví dụ: Bài 4. Ứng dụng thực tiễn của Đạo hàm"
                className="w-full text-xs sm:text-sm font-semibold border border-slate-300 rounded-xl px-3.5 py-2.5 focus:outline-hidden focus:ring-2 focus:ring-teal-700"
                autoFocus
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowNewLessonModal(false)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleCreateNewLesson}
                className="px-5 py-2 text-xs font-bold bg-teal-800 hover:bg-teal-900 text-white rounded-xl shadow-xs cursor-pointer"
              >
                Tạo bài học
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
