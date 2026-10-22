import React, { useState, useMemo } from 'react';
import {
  ChevronDown,
  ChevronRight,
  BookOpen,
  RefreshCw,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Eye,
  Sparkles,
  Check,
  Send,
  MessageCircle,
  Plus,
  Edit3,
  FileCode,
  Lightbulb,
  AlertTriangle,
  Bookmark,
  FileText,
} from 'lucide-react';
import { GradeLevel, LessonType, QuestionFormat, DifficultyLevel, PracticeQuestionItem } from '../types';
import { CURRICULUM_DATA } from '../data/curriculumData';
import { getLessonTypes, generateLessonPracticeQuestions } from '../data/lessonPracticeGenerator';
import { MathView } from './MathView';
import { TrigCircle } from './TrigCircle';
import { VariationTable } from './VariationTable';
import { InteractiveGraph } from './InteractiveGraph';
import { FormulaEditorModal } from './FormulaEditorModal';
import { getMergedCurriculumData } from '../utils/curriculumStorage';
import { Settings } from 'lucide-react';

interface CurriculumViewProps {
  grade: GradeLevel;
  onNavigateToExam?: () => void;
  onOpenAIModal?: (topic?: string, question?: string) => void;
  onNavigateToAdmin?: (grade: GradeLevel, chapterId: string, lessonId: string) => void;
}

export const CurriculumView: React.FC<CurriculumViewProps> = ({
  grade,
  onNavigateToExam,
  onOpenAIModal,
  onNavigateToAdmin,
}) => {
  const [curriculumVersion, setCurriculumVersion] = useState<number>(0);
  const isAdmin = typeof sessionStorage !== 'undefined' && sessionStorage.getItem('tt_admin_authenticated') === '1';

  // Lấy dữ liệu chương trình học đã gộp các bài học tùy chỉnh và các chỉnh sửa của giáo viên
  const chapters = useMemo(() => {
    // depend on grade and curriculumVersion
    return getMergedCurriculumData(grade);
  }, [grade, curriculumVersion]);

  // Lắng nghe sự kiện cập nhật dữ liệu từ trang Quản trị
  React.useEffect(() => {
    const handleUpdate = () => setCurriculumVersion((v) => v + 1);
    window.addEventListener('curriculum_data_updated', handleUpdate);
    return () => window.removeEventListener('curriculum_data_updated', handleUpdate);
  }, []);

  // Currently selected chapter and lesson
  const [selectedChapterId, setSelectedChapterId] = useState<string>(chapters[0]?.id || '');
  const [selectedLessonId, setSelectedLessonId] = useState<string>(
    chapters[0]?.lessons[0]?.id || ''
  );
  const [activeTab, setActiveTab] = useState<'theory' | 'practice'>('practice');

  // Accordion open/close state
  const [expandedChapters, setExpandedChapters] = useState<Record<string, boolean>>({
    [chapters[0]?.id || '']: true,
  });

  const toggleChapter = (chapterId: string) => {
    setExpandedChapters((prev) => ({
      ...prev,
      [chapterId]: !prev[chapterId],
    }));
  };

  const currentChapter = chapters.find((c) => c.id === selectedChapterId) || chapters[0];
  const currentLesson: LessonType =
    currentChapter?.lessons.find((l) => l.id === selectedLessonId) ||
    currentChapter?.lessons[0] ||
    chapters[0]?.lessons[0];

  // ==========================================
  // CUSTOM FORMULAS MANAGEMENT (PER LESSON)
  // ==========================================
  const [customFormulasMap, setCustomFormulasMap] = useState<Record<string, string[]>>(() => {
    try {
      const saved = localStorage.getItem('curriculum_custom_formulas');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [isFormulaModalOpen, setIsFormulaModalOpen] = useState<boolean>(false);

  // Active formulas for current lesson (custom override or default)
  const activeFormulas = useMemo(() => {
    if (!currentLesson) return [];
    if (customFormulasMap[currentLesson.id]) {
      return customFormulasMap[currentLesson.id];
    }
    return currentLesson.theoryContent?.boxedFormulas || [];
  }, [currentLesson, customFormulasMap]);

  const isCurrentLessonFormulasCustomized = Boolean(
    currentLesson && customFormulasMap[currentLesson.id]
  );

  const handleSaveLessonFormulas = (newFormulas: string[]) => {
    if (!currentLesson) return;
    const updatedMap = {
      ...customFormulasMap,
      [currentLesson.id]: newFormulas,
    };
    setCustomFormulasMap(updatedMap);
    try {
      localStorage.setItem('curriculum_custom_formulas', JSON.stringify(updatedMap));
    } catch (e) {
      console.error('Failed to save custom formulas to localStorage', e);
    }
  };

  const handleResetLessonFormulas = () => {
    if (!currentLesson) return;
    const updatedMap = { ...customFormulasMap };
    delete updatedMap[currentLesson.id];
    setCustomFormulasMap(updatedMap);
    try {
      localStorage.setItem('curriculum_custom_formulas', JSON.stringify(updatedMap));
    } catch (e) {
      console.error('Failed to reset custom formulas', e);
    }
  };

  // PRACTICE SECTION CONTROLS (MATCHING VIDEO)
  // ==========================================
  // 1. Dropdown: Dạng toán (All or specific type 1..15)
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<number | 'all'>('all');

  // 2. Dropdown: Mức độ (Mọi mức độ, Nhận biết, Thông hiểu, Vận dụng, Vận dụng cao)
  const [selectedDifficulty, setSelectedDifficulty] = useState<'all' | DifficultyLevel>('all');

  // 3. Format buttons: Trắc nghiệm | Đúng/Sai | Trả lời ngắn | Tự luận | Trộn 4 loại
  const [selectedFormat, setSelectedFormat] = useState<QuestionFormat | 'mix'>('mix');

  // 4. Number of questions: 3, 5, 10, 15
  const [questionLimit, setQuestionLimit] = useState<number>(3);

  // 5. Seed for parametric generation ("Sinh câu mới")
  const [practiceSeed, setPracticeSeed] = useState<number>(0);

  // User answers per question
  const [userAnswers, setUserAnswers] = useState<Record<string, any>>({});
  const [checkedResults, setCheckedResults] = useState<Record<string, boolean>>({});
  const [showSolutions, setShowSolutions] = useState<Record<string, boolean>>({});

  // 15 types definition for this lesson
  const lessonTypes = useMemo(() => {
    return getLessonTypes(currentLesson?.id || '', currentLesson?.name || '');
  }, [currentLesson]);

  // All generated practice questions for this lesson
  const allGeneratedQuestions = useMemo(() => {
    return generateLessonPracticeQuestions(
      currentLesson?.id || '',
      currentLesson?.name || '',
      grade,
      practiceSeed
    );
  }, [currentLesson, grade, practiceSeed]);

  // Counts per difficulty
  const countsPerDifficulty = useMemo(() => {
    const counts = { 'Nhận biết': 0, 'Thông hiểu': 0, 'Vận dụng': 0, 'Vận dụng cao': 0 };
    lessonTypes.forEach((t) => {
      counts[t.difficulty] = (counts[t.difficulty] || 0) + 1;
    });
    return counts;
  }, [lessonTypes]);

  // Filtered and limited questions
  const displayedQuestions = useMemo(() => {
    let list = allGeneratedQuestions.filter((q) => {
      const matchType = selectedTypeFilter === 'all' || q.typeIndex === selectedTypeFilter;
      const matchDiff = selectedDifficulty === 'all' || q.difficulty === selectedDifficulty;
      const matchFormat = selectedFormat === 'mix' || q.format === selectedFormat;
      return matchType && matchDiff && matchFormat;
    });

    return list.slice(0, questionLimit);
  }, [allGeneratedQuestions, selectedTypeFilter, selectedDifficulty, selectedFormat, questionLimit]);

  // Handle "Sinh câu mới" button click
  const handleRegenerate = () => {
    setPracticeSeed((prev) => prev + 1);
    setUserAnswers({});
    setCheckedResults({});
    setShowSolutions({});
  };

  // Multiple choice selection
  const handleSelectMC = (questionId: string, key: string) => {
    setUserAnswers((prev) => ({ ...prev, [questionId]: key }));
    setCheckedResults((prev) => {
      const copy = { ...prev };
      delete copy[questionId];
      return copy;
    });
  };

  // True/False selection
  const handleSelectTF = (questionId: string, subKey: string, val: boolean) => {
    setUserAnswers((prev) => {
      const current = prev[questionId] || {};
      return {
        ...prev,
        [questionId]: { ...current, [subKey]: val },
      };
    });
  };

  // Short answer input
  const handleInputShort = (questionId: string, val: string) => {
    setUserAnswers((prev) => ({ ...prev, [questionId]: val }));
  };

  // Check button handler
  const handleCheck = (q: PracticeQuestionItem) => {
    if (q.format === 'multiple_choice') {
      const ans = userAnswers[q.id];
      setCheckedResults((prev) => ({ ...prev, [q.id]: ans === q.correctAnswer }));
    } else if (q.format === 'true_false') {
      const ans = userAnswers[q.id] || {};
      let allCorrect = true;
      (q.tfItems || []).forEach((item) => {
        if (ans[item.key] !== item.correct) allCorrect = false;
      });
      setCheckedResults((prev) => ({ ...prev, [q.id]: allCorrect }));
    } else if (q.format === 'short_answer') {
      const userText = (userAnswers[q.id] || '').toString().trim().toLowerCase();
      const isCorrect = userText === q.correctAnswer.toLowerCase();
      setCheckedResults((prev) => ({ ...prev, [q.id]: isCorrect }));
    } else {
      // Essay format
      setCheckedResults((prev) => ({ ...prev, [q.id]: true }));
    }
  };

  const toggleSolution = (questionId: string) => {
    setShowSolutions((prev) => ({ ...prev, [questionId]: !prev[questionId] }));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start pb-20 relative">
      {/* Left Sidebar: Chapters & Lessons List */}
      <aside className="lg:col-span-3 bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs space-y-3">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 px-1">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-700" />
            Toán {grade} – KNTT
          </h2>
          <span className="text-xs text-slate-500 font-mono">
            {chapters.reduce((acc, c) => acc + c.lessons.length, 0)} bài học
          </span>
        </div>

        {isAdmin && onNavigateToAdmin && (
          <button
            onClick={() =>
              onNavigateToAdmin(grade, currentChapter?.id || '', currentLesson?.id || '')
            }
            className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-black text-xs sm:text-sm shadow-md transition-all cursor-pointer border-2 border-amber-600"
            title="Mở Trung tâm Quản trị & Biên tập nội dung bài học trực tiếp (AdminView)"
          >
            <Settings className="w-4 h-4 text-slate-950 animate-pulse" />
            <span>Trung tâm Quản trị & Biên tập (AdminView)</span>
          </button>
        )}

        <div className="space-y-1.5 max-h-[calc(100vh-210px)] overflow-y-auto pr-1">
          {chapters.map((ch) => {
            const isExpanded = expandedChapters[ch.id];
            const hasActiveLesson = ch.lessons.some((l) => l.id === currentLesson?.id);

            return (
              <div key={ch.id} className="rounded-xl border border-slate-100 overflow-hidden">
                <button
                  onClick={() => toggleChapter(ch.id)}
                  className={`w-full flex items-center justify-between p-3 text-left transition-colors cursor-pointer text-xs sm:text-sm font-semibold ${
                    hasActiveLesson ? 'bg-teal-50/70 text-teal-900' : 'bg-slate-50 hover:bg-slate-100 text-slate-800'
                  }`}
                >
                  <span className="flex-1 pr-2 line-clamp-1">{ch.title}</span>
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                </button>

                {isExpanded && (
                  <div className="p-1 space-y-1 bg-white">
                    {ch.lessons.map((lesson) => {
                      const isSelected = lesson.id === currentLesson?.id;
                      return (
                        <button
                          key={lesson.id}
                          onClick={() => {
                            setSelectedChapterId(ch.id);
                            setSelectedLessonId(lesson.id);
                            setUserAnswers({});
                            setCheckedResults({});
                            setShowSolutions({});
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs sm:text-sm text-left transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-teal-800 text-white font-semibold shadow-xs'
                              : 'text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <span className="line-clamp-1 flex-1 pr-2">{lesson.name}</span>
                          <span
                            className={`text-[11px] px-2 py-0.5 rounded font-mono shrink-0 ${
                              isSelected ? 'bg-teal-900 text-teal-200' : 'bg-slate-100 text-slate-500'
                            }`}
                          >
                            15 dạng
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="lg:col-span-9 bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-7 shadow-xs space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <span>Toán {grade}</span>
          <span>&gt;</span>
          <span className="text-slate-800 font-medium truncate">{currentChapter?.title}</span>
        </div>

        {/* PROMINENT TEACHER ADMIN BANNER - Only visible when logged in as Admin */}
        {isAdmin && onNavigateToAdmin && (
          <div className="bg-gradient-to-r from-amber-100 via-yellow-50 to-amber-100 border-2 border-amber-500 rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500 text-slate-950 shrink-0 shadow-xs mt-0.5">
                <Settings className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-amber-400 text-slate-950">
                    Dành riêng cho Thầy Trần Trọng
                  </span>
                  <span className="text-xs font-bold text-amber-900">
                    Toán {grade} · {currentLesson?.name}
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 mt-1">
                  Trung tâm Quản trị & Biên tập nội dung bài học trực tiếp (AdminView)
                </h3>
                <p className="text-xs text-slate-700 mt-0.5">
                  Bấm nút để trực tiếp chỉnh sửa lý thuyết, thêm/sửa công thức KaTeX, bổ sung các mục tùy ý và 15 dạng toán cho bài này.
                </p>
              </div>
            </div>

            <button
              onClick={() =>
                onNavigateToAdmin(grade, currentChapter?.id || '', currentLesson?.id || '')
              }
              className="w-full md:w-auto shrink-0 flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs sm:text-sm shadow-md transition-all cursor-pointer border-2 border-amber-600 hover:scale-[1.02]"
            >
              <Edit3 className="w-4 h-4 text-slate-950" />
              <span>Chỉnh sửa & Thêm nội dung bài này ngay</span>
            </button>
          </div>
        )}

        {/* Lesson Title & Segmented Tab Switch */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  {currentLesson?.name}
                </h1>
                {isCurrentLessonFormulasCustomized && (
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold">
                    Đã sửa nội dung
                  </span>
                )}
              </div>
            </div>

            {isAdmin && onNavigateToAdmin && (
              <button
                onClick={() =>
                  onNavigateToAdmin(grade, currentChapter?.id || '', currentLesson?.id || '')
                }
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs sm:text-sm font-black transition-all shadow-sm cursor-pointer border border-amber-600 hover:shadow-md"
                title="Mở Trung tâm Quản trị & Biên tập nội dung bài học trực tiếp (AdminView)"
              >
                <Settings className="w-4 h-4 text-slate-950" />
                <span>Trung tâm Quản trị & Biên tập (AdminView)</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
            <button
              onClick={() => setActiveTab('theory')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                activeTab === 'theory'
                  ? 'bg-teal-800 text-white shadow-xs font-bold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Lý thuyết</span>
            </button>

            <button
              onClick={() => setActiveTab('practice')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                activeTab === 'practice'
                  ? 'bg-teal-800 text-white shadow-xs font-bold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <RefreshCw className="w-4 h-4" />
              <span>Dạng toán & ví dụ (15)</span>
            </button>
          </div>
        </div>

        {/* ======================================================== */}
        {/* TAB 1: THEORY VIEW */}
        {/* ======================================================== */}
        {activeTab === 'theory' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="text-slate-700 text-sm sm:text-base leading-relaxed bg-slate-50/80 p-4 rounded-xl border border-slate-200/70">
              <MathView text={currentLesson?.theoryContent.summary} />
            </div>

            {/* Công thức & Quy tắc cốt lõi (Có chức năng Thêm & Sửa công thức) */}
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 text-[11px] font-bold font-mono">
                    {activeFormulas.length} công thức cốt lõi
                  </span>
                  {isCurrentLessonFormulasCustomized && (
                    <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[11px] font-semibold">
                      Tùy chỉnh
                    </span>
                  )}
                </div>

                {/* Nút chức năng Sửa & Thêm công thức cho bài học - Chỉ hiển thị khi đăng nhập quản trị */}
                {isAdmin && (
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setIsFormulaModalOpen(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                      title="Chỉnh sửa hoặc thêm công thức cho bài học này"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-teal-200" />
                      <span>Sửa / Thêm công thức</span>
                    </button>
                  </div>
                )}
              </div>

              {activeFormulas.length === 0 ? (
                <div className="p-6 bg-slate-50 border border-dashed border-slate-300 rounded-xl text-center space-y-2">
                  <p className="text-slate-500 text-sm">
                    Bài học này hiện chưa có công thức nào được liệt kê.
                  </p>
                  {isAdmin && (
                    <button
                      onClick={() => setIsFormulaModalOpen(true)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-800 text-white text-xs font-semibold hover:bg-teal-900 transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Thêm công thức ngay</span>
                    </button>
                  )}
                </div>
              ) : (
                <div className="border border-teal-200 bg-teal-50/40 rounded-xl p-3.5 sm:p-5 space-y-2.5">
                  {activeFormulas.map((formula, idx) => (
                    <div
                      key={idx}
                      className="group relative flex items-start gap-3 py-2 px-3.5 bg-white rounded-lg border border-teal-100/90 text-sm font-medium text-slate-800 shadow-xs hover:border-teal-300 transition-all"
                    >
                      <span className="shrink-0 inline-flex items-center justify-center w-5 h-5 rounded-md bg-teal-100/80 text-teal-900 text-[11px] font-bold font-mono mt-0.5">
                        {idx + 1}
                      </span>
                      <div className="flex-1 min-w-0 overflow-x-auto">
                        <MathView text={formula} />
                      </div>
                      <button
                        onClick={() => setIsFormulaModalOpen(true)}
                        title="Chỉnh sửa công thức này"
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-slate-400 hover:text-teal-800 hover:bg-slate-100 rounded shrink-0 cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {currentLesson?.theoryContent.diagramType === 'trig_circle' && (
              <div className="space-y-2">
                <TrigCircle />
              </div>
            )}

            {currentLesson?.theoryContent.diagramType === 'variation_table' && (
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <VariationTable
                  data={currentLesson.theoryContent.variationTableData}
                  funcText="y = x³ - 3x : y' = 3x² - 3"
                />
              </div>
            )}

            {(currentLesson?.theoryContent.diagramType === 'cubic_curve' ||
              currentLesson?.theoryContent.diagramType === 'quadratic_curve' ||
              currentLesson?.theoryContent.diagramType === 'rational_curve') && (
              <div className="space-y-2">
                <InteractiveGraph
                  initialType={
                    currentLesson.theoryContent.diagramType === 'quadratic_curve'
                      ? 'quadratic'
                      : currentLesson.theoryContent.diagramType === 'rational_curve'
                      ? 'rational'
                      : 'cubic'
                  }
                />
              </div>
            )}

            {/* Các mục nội dung bổ sung tùy ý do giáo viên tạo/chỉnh sửa */}
            {currentLesson?.theoryContent.extraSections &&
              currentLesson.theoryContent.extraSections.length > 0 && (
                <div className="space-y-4 pt-2">
                  <div className="flex items-center justify-between border-t border-slate-200/80 pt-4">
                    <h3 className="text-xs uppercase font-bold text-slate-600 tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-teal-700" />
                      <span>Nội dung bổ trợ & Phương pháp chuyên sâu</span>
                    </h3>
                    <span className="text-[11px] font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-md">
                      {currentLesson.theoryContent.extraSections.length} mục bổ sung
                    </span>
                  </div>

                  <div className="space-y-3">
                    {currentLesson.theoryContent.extraSections.map((sec, sIdx) => {
                      const isMethod = sec.type === 'method';
                      const isExample = sec.type === 'example';
                      const isNotice = sec.type === 'notice';
                      const isNote = sec.type === 'note';

                      return (
                        <div
                          key={sec.id || sIdx}
                          className={`rounded-xl border p-4 sm:p-5 transition-all shadow-xs ${
                            isNotice
                              ? 'bg-amber-50/60 border-amber-300'
                              : isMethod
                              ? 'bg-teal-50/50 border-teal-200'
                              : isExample
                              ? 'bg-sky-50/50 border-sky-200'
                              : isNote
                              ? 'bg-purple-50/40 border-purple-200'
                              : 'bg-slate-50/70 border-slate-200'
                          }`}
                        >
                          <div className="flex items-center justify-between pb-2 mb-2 border-b border-black/5">
                            <div className="flex items-center gap-2">
                              {isNotice && <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />}
                              {isMethod && <Lightbulb className="w-4 h-4 text-teal-700 shrink-0" />}
                              {isExample && <BookOpen className="w-4 h-4 text-sky-700 shrink-0" />}
                              {isNote && <Bookmark className="w-4 h-4 text-purple-700 shrink-0" />}
                              {!isNotice && !isMethod && !isExample && !isNote && (
                                <FileText className="w-4 h-4 text-slate-600 shrink-0" />
                              )}
                              <h4 className="font-bold text-slate-900 text-sm sm:text-base">
                                {sec.title}
                              </h4>
                            </div>

                            <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-white/80 text-slate-700 border border-slate-200/80">
                              {isMethod && 'Phương pháp'}
                              {isExample && 'Ví dụ mẫu'}
                              {isNotice && 'Lưu ý / Bẫy đề'}
                              {isNote && 'Ghi chú'}
                              {!isMethod && !isExample && !isNotice && !isNote && 'Nội dung thêm'}
                            </span>
                          </div>

                          <div className="text-slate-800 text-sm sm:text-base leading-relaxed space-y-2">
                            <MathView text={sec.content} />
                          </div>

                          {sec.note && (
                            <div className="mt-3 pt-2 border-t border-black/5 text-xs text-slate-500 italic">
                              💡 <b>Ghi chú:</b> {sec.note}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

            <div className="pt-2">
              <button
                onClick={() => setActiveTab('practice')}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-800 text-white font-semibold text-sm hover:bg-teal-900 shadow-sm transition-all cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Luyện các dạng toán của bài</span>
              </button>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: PRACTICE VIEW (DESIGNED EXACTLY LIKE THE VIDEO)  */}
        {/* ======================================================== */}
        {activeTab === 'practice' && (
          <div className="space-y-5 animate-in fade-in duration-200">
            {/* TOOLBAR ROW 1: 2 DROPDOWNS (matching video 00:07 - 00:10) */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
              {/* Dropdown 1: Tất cả các dạng (15) */}
              <div className="md:col-span-8">
                <select
                  value={selectedTypeFilter}
                  onChange={(e) => {
                    const val = e.target.value === 'all' ? 'all' : Number(e.target.value);
                    setSelectedTypeFilter(val);
                  }}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 bg-white font-medium text-slate-800 focus:outline-teal-700 shadow-xs cursor-pointer"
                >
                  <option value="all">Tất cả các dạng (15)</option>
                  {lessonTypes.map((t) => (
                    <option key={t.index} value={t.index}>
                      Dạng {t.index} [{t.code}]: {t.title.replace(`${currentLesson?.name} - `, '')} (1)
                    </option>
                  ))}
                </select>
              </div>

              {/* Dropdown 2: Mọi mức độ (15) (matching video 00:56 - 01:06) */}
              <div className="md:col-span-4">
                <select
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 bg-white font-medium text-slate-800 focus:outline-teal-700 shadow-xs cursor-pointer"
                >
                  <option value="all">Mọi mức độ (15)</option>
                  <option value="Nhận biết">Nhận biết ({countsPerDifficulty['Nhận biết']})</option>
                  <option value="Thông hiểu">Thông hiểu ({countsPerDifficulty['Thông hiểu']})</option>
                  <option value="Vận dụng">Vận dụng ({countsPerDifficulty['Vận dụng']})</option>
                  <option value="Vận dụng cao">Vận dụng cao ({countsPerDifficulty['Vận dụng cao']})</option>
                </select>
              </div>
            </div>

            {/* TOOLBAR ROW 2: FORMAT BUTTONS + COUNT + SINH CÂU MỚI (matching video 00:12 - 00:41) */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              {/* Segmented Format Buttons */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs sm:text-sm font-semibold">
                <button
                  onClick={() => setSelectedFormat('multiple_choice')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    selectedFormat === 'multiple_choice'
                      ? 'bg-teal-800 text-white shadow-xs font-bold'
                      : 'text-slate-700 hover:text-slate-900'
                  }`}
                >
                  Trắc nghiệm
                </button>
                <button
                  onClick={() => setSelectedFormat('true_false')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    selectedFormat === 'true_false'
                      ? 'bg-teal-800 text-white shadow-xs font-bold'
                      : 'text-slate-700 hover:text-slate-900'
                  }`}
                >
                  Đúng/Sai
                </button>
                <button
                  onClick={() => setSelectedFormat('short_answer')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    selectedFormat === 'short_answer'
                      ? 'bg-teal-800 text-white shadow-xs font-bold'
                      : 'text-slate-700 hover:text-slate-900'
                  }`}
                >
                  Trả lời ngắn
                </button>
                <button
                  onClick={() => setSelectedFormat('essay')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    selectedFormat === 'essay'
                      ? 'bg-teal-800 text-white shadow-xs font-bold'
                      : 'text-slate-700 hover:text-slate-900'
                  }`}
                >
                  Tự luận
                </button>
                <button
                  onClick={() => setSelectedFormat('mix')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    selectedFormat === 'mix'
                      ? 'bg-teal-800 text-white shadow-xs font-bold'
                      : 'text-slate-700 hover:text-slate-900'
                  }`}
                >
                  Trộn 4 loại
                </button>
              </div>

              {/* Right side: Number of questions select + "Sinh câu mới" button */}
              <div className="flex items-center gap-2 ml-auto">
                {/* Count selector: 3, 5, 10, 15 */}
                <select
                  value={questionLimit}
                  onChange={(e) => setQuestionLimit(Number(e.target.value))}
                  className="px-3 py-1.5 text-xs sm:text-sm rounded-xl border border-slate-300 bg-white font-bold text-slate-800 shadow-xs cursor-pointer"
                >
                  <option value={3}>3</option>
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={15}>15</option>
                </select>

                {/* "Sinh câu mới" Button (Green button with refresh icon matching video 00:41) */}
                <button
                  onClick={handleRegenerate}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-800 hover:bg-teal-900 text-white font-bold text-xs sm:text-sm shadow-xs transition-all cursor-pointer"
                  title="Sinh câu hỏi mới và đổi số liệu ngẫu nhiên"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Sinh câu mới</span>
                </button>
              </div>
            </div>

            {/* SUMMARY BOX: Dạng toán của bài (matching video 00:07) */}
            <div className="p-3.5 bg-slate-50/90 rounded-xl border border-slate-200/90 text-xs text-slate-600 leading-relaxed font-normal">
              <span className="font-bold text-slate-800 mr-1.5">Dạng toán của bài:</span>
              {lessonTypes.map((t, i) => (
                <span key={t.index} className="mr-2">
                  <span className="font-semibold text-slate-700">{t.index}.</span> {t.title.replace(`${currentLesson?.name} - `, '')}
                  {i < lessonTypes.length - 1 ? ' ·' : ''}
                </span>
              ))}
            </div>

            {/* QUESTIONS LIST (MATCHING VIDEO CARDS) */}
            <div className="space-y-6 pt-1">
              {displayedQuestions.map((q, qIndex) => {
                const isSubmitted = checkedResults[q.id] !== undefined;
                const isCorrect = checkedResults[q.id];
                const isOpenSolution = showSolutions[q.id];

                return (
                  <div
                    key={q.id}
                    className="p-5 sm:p-6 rounded-2xl border border-slate-200/90 bg-white space-y-4 shadow-xs hover:border-slate-300 transition-all"
                  >
                    {/* Header Row: Câu X. [Code] Title + Badges (matching video 00:13) */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-rose-600 text-sm sm:text-base">
                          Câu {qIndex + 1}.
                        </span>
                        <span className="font-semibold text-slate-800 text-xs sm:text-sm">
                          [{q.typeLevelCode}] {q.typeTitle.replace(`${currentLesson?.name} - `, '')}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-xs">
                        <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 font-medium">
                          {q.format === 'multiple_choice'
                            ? 'Trắc nghiệm'
                            : q.format === 'true_false'
                            ? 'Đúng/Sai'
                            : q.format === 'short_answer'
                            ? 'Trả lời ngắn'
                            : 'Tự luận'}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-800 border border-sky-200 font-medium">
                          {q.difficulty}
                        </span>
                      </div>
                    </div>

                    {/* Question Statement */}
                    <div className="text-sm sm:text-base text-slate-900 font-medium leading-relaxed">
                      <MathView text={q.question} />
                    </div>

                    {/* FORMAT 1: TRẮC NGHIỆM (4 Options A, B, C, D) */}
                    {q.format === 'multiple_choice' && q.options && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                        {q.options.map((opt) => {
                          const isSelected = userAnswers[q.id] === opt.key;
                          const isOptionCorrect = q.correctAnswer === opt.key;

                          let style = 'bg-white border-slate-200 hover:bg-slate-50 text-slate-800';
                          if (isSelected) {
                            style = 'bg-teal-50 border-teal-700 text-teal-950 font-semibold ring-1 ring-teal-700';
                          }
                          if (isSubmitted && isOptionCorrect) {
                            style = 'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold ring-1 ring-emerald-500';
                          }

                          return (
                            <button
                              key={opt.key}
                              onClick={() => handleSelectMC(q.id, opt.key)}
                              className={`p-3 rounded-xl border text-left text-xs sm:text-sm font-medium transition-all flex items-center gap-3 cursor-pointer ${style}`}
                            >
                              <span
                                className={`w-6 h-6 rounded-md flex items-center justify-center font-bold text-xs shrink-0 ${
                                  isSelected ? 'bg-teal-800 text-white' : 'bg-slate-100 text-slate-700'
                                }`}
                              >
                                {opt.key}
                              </span>
                              <div className="flex-1">
                                <MathView text={opt.text} />
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {/* FORMAT 2: ĐÚNG/SAI (TABLE WITH Đ / S RADIO COLUMNS matching video 00:18) */}
                    {q.format === 'true_false' && q.tfItems && (
                      <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 text-xs sm:text-sm">
                        {/* Table Header */}
                        <div className="bg-slate-50 px-4 py-2 flex items-center justify-between text-slate-500 font-semibold text-xs">
                          <span>Mệnh đề / Khẳng định</span>
                          <div className="flex items-center gap-8 pr-4">
                            <span>Đúng</span>
                            <span>Sai</span>
                          </div>
                        </div>

                        {/* Sub-items a, b, c, d */}
                        {q.tfItems.map((sub) => {
                          const userChoice = userAnswers[q.id]?.[sub.key];

                          return (
                            <div
                              key={sub.key}
                              className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white"
                            >
                              <div className="flex-1 pr-4">
                                <span className="font-bold text-slate-800 mr-2">{sub.key})</span>
                                <MathView text={sub.statement} />
                              </div>

                              {/* Radio selector with Đ and S circular buttons (matching video!) */}
                              <div className="flex items-center gap-6 shrink-0 pr-2">
                                <button
                                  onClick={() => handleSelectTF(q.id, sub.key, true)}
                                  className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs transition-all cursor-pointer ${
                                    userChoice === true
                                      ? 'bg-teal-800 text-white shadow-xs'
                                      : 'border border-slate-300 text-slate-600 hover:bg-slate-100'
                                  }`}
                                >
                                  Đ
                                </button>
                                <button
                                  onClick={() => handleSelectTF(q.id, sub.key, false)}
                                  className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs transition-all cursor-pointer ${
                                    userChoice === false
                                      ? 'bg-teal-800 text-white shadow-xs'
                                      : 'border border-slate-300 text-slate-600 hover:bg-slate-100'
                                  }`}
                                >
                                  S
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* FORMAT 3: TRẢ LỜI NGẮN (matching video 00:23) */}
                    {q.format === 'short_answer' && (
                      <div className="pt-1 max-w-sm">
                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                          Nhập câu trả lời của bạn:
                        </label>
                        <input
                          type="text"
                          placeholder="Điền kết quả..."
                          value={userAnswers[q.id] || ''}
                          onChange={(e) => handleInputShort(q.id, e.target.value)}
                          className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-teal-700 font-mono"
                        />
                      </div>
                    )}

                    {/* FORMAT 4: TỰ LUẬN (matching video 00:28) */}
                    {q.format === 'essay' && (
                      <div className="pt-1">
                        <textarea
                          rows={2}
                          placeholder="Ghi chú các bước biến đổi hoặc giải ra giấy rồi bấm 'Xem lời giải' để đối chiếu..."
                          value={userAnswers[q.id] || ''}
                          onChange={(e) => handleInputShort(q.id, e.target.value)}
                          className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-teal-700"
                        />
                      </div>
                    )}

                    {/* FOOTER ACTIONS: [Kiểm tra] + [Xem lời giải] (matching video 00:15 - 00:50) */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                      <div className="flex items-center gap-2.5">
                        <button
                          onClick={() => handleCheck(q)}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-800 hover:bg-teal-900 text-white font-bold text-xs sm:text-sm shadow-xs transition-all cursor-pointer"
                        >
                          <Check className="w-4 h-4" />
                          <span>Kiểm tra</span>
                        </button>

                        <button
                          onClick={() => toggleSolution(q.id)}
                          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold text-xs sm:text-sm transition-all cursor-pointer"
                        >
                          <Eye className="w-4 h-4 text-slate-500" />
                          <span>{isOpenSolution ? 'Ẩn lời giải' : 'Xem lời giải'}</span>
                        </button>

                        {onOpenAIModal && (
                          <button
                            onClick={() => onOpenAIModal(q.typeTitle, q.question)}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-semibold transition-colors cursor-pointer"
                            title="Nhờ AI đổi số liệu câu này"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                            <span>AI đổi số</span>
                          </button>
                        )}
                      </div>

                      {/* Result Badge after check */}
                      {isSubmitted && (
                        <div
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold ${
                            isCorrect
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : 'bg-rose-50 text-rose-800 border border-rose-200'
                          }`}
                        >
                          {isCorrect ? (
                            <>
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                              <span>Chính xác!</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-4 h-4 text-rose-600" />
                              <span>Chưa đúng! Đáp án đúng: {q.correctAnswer}</span>
                            </>
                          )}
                        </div>
                      )}
                    </div>

                    {/* EXPANDABLE SOLUTION (matching video 00:50) */}
                    {isOpenSolution && (
                      <div className="p-4 bg-slate-50/90 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 space-y-2 animate-in fade-in duration-150">
                        <div className="font-bold text-teal-900">
                          Đáp án:{' '}
                          <span className="font-mono text-emerald-700 font-bold ml-1">
                            {q.correctAnswer}
                          </span>
                        </div>
                        <div className="text-slate-700 leading-relaxed whitespace-pre-line pl-2 border-l-2 border-teal-600">
                          <MathView text={q.explanation} />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {/* Floating "Hỏi thầy" pill button (matching video bottom-right at 00:44!) */}
      <div className="fixed bottom-6 right-24 z-40 no-print">
        {onOpenAIModal && (
          <button
            onClick={() => onOpenAIModal('Giải đáp bài học', currentLesson?.name)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-teal-800 hover:bg-teal-900 text-white font-bold text-xs sm:text-sm shadow-lg hover:shadow-xl transition-all cursor-pointer border border-teal-700"
          >
            <MessageCircle className="w-4 h-4 text-teal-200" />
            <span>Hỏi thầy</span>
          </button>
        )}
      </div>

      {/* Formula Editor Modal */}
      {currentLesson && (
        <FormulaEditorModal
          isOpen={isFormulaModalOpen}
          onClose={() => setIsFormulaModalOpen(false)}
          lessonId={currentLesson.id}
          lessonName={currentLesson.name}
          chapterTitle={currentChapter?.title}
          defaultFormulas={currentLesson.theoryContent?.boxedFormulas || []}
          currentFormulas={activeFormulas}
          onSaveFormulas={handleSaveLessonFormulas}
          onResetToDefault={handleResetLessonFormulas}
          isCustomized={isCurrentLessonFormulasCustomized}
        />
      )}
    </div>
  );
};
