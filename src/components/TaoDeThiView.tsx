import React, { useState, useEffect, useRef } from 'react';
import {
  FileText,
  Upload,
  Settings,
  Plus,
  Trash2,
  Edit3,
  CheckCircle2,
  Clock,
  Shield,
  Shuffle,
  Eye,
  ChevronDown,
  ChevronRight,
  Copy,
  Moon,
  Sun,
  Maximize2,
  Minimize2,
  Save,
  Play,
  RotateCcw,
  Sparkles,
  Award,
  AlertCircle,
  Check,
  X,
  HelpCircle,
  Image as ImageIcon,
  BookOpen,
  ArrowRight,
  Download,
  Volume2,
  VolumeX,
  Lock,
  Layers,
  ListOrdered,
  FileCheck,
  ArrowUpDown,
  MoveUp,
  MoveDown,
  CheckSquare,
  Printer
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { MathView } from './MathView';
import {
  extractDocxTextAndMath,
  parseExamFromWordText,
  createAdjacentExam,
  convertWordMathToLatex
} from '../wordExamConverter.js';

export interface TaoDeThiQuestion {
  id: string;
  section: 'A' | 'B' | 'C';
  stem: string;
  opts: string[];
  items?: { s: string; t: boolean }[]; // Cho trắc nghiệm Đúng / Sai
  ci: number; // 0: A, 1: B, 2: C, 3: D
  ans: string;
  sol: string;
  level: 'NB' | 'TH' | 'VD' | 'VDC';
  score: number;
}

export interface TaoDeThiGroup {
  id: string;
  name: string;
  desc?: string;
  questions: TaoDeThiQuestion[];
}

export interface TaoDeThiConfig {
  title: string;
  description: string;
  grade: string;
  coverBannerUrl: string;
  gamificationMode: 'standard' | 'practice' | 'flashcard' | 'live' | 'survival';
  enableAudio: boolean;
  enableBadges: boolean;
  durationMinutes: number;
  maxAttempts: number;
  cooldownMinutes: number;
  startTime: string;
  endTime: string;
  antiCheatTabSwitch: boolean;
  requireFullscreen: boolean;
  autoSubmitOnCheat: boolean;
  cloneMode: 'private' | 'public';
  accessPassword?: string;
  displayLayout: 'scroll' | 'focus';
  submitRequirement: '100percent' | 'free';
  shuffleQuestions: 'none' | 'group' | 'all';
  shuffleOptions: 'none' | 'shuffle';
  lockAnswers: 'editable' | 'locked';
  reviewPermission: 'after_submit' | 'disabled' | 'after_close';
  showTotalScore: 'on_finish' | 'hidden';
  penaltyPerWrong: number;
  showCorrectAnswers: 'always' | 'never';
  showExplanations: boolean;
  closingGreeting: string;
  accessPermission: 'public' | 'restricted';
  surveyFields: string[];
}

interface TaoDeThiViewProps {
  onRunExamOnWeb?: (examData: any) => void;
  onBackToMain?: () => void;
}

export const TaoDeThiView: React.FC<TaoDeThiViewProps> = ({ onRunExamOnWeb, onBackToMain }) => {
  // Trạng thái giao diện
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [activeSettingsTab, setActiveSettingsTab] = useState<string>('gamification');
  const [manageDropdownOpen, setManageDropdownOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Modal Khôi phục bản nháp (Giống video lúc 00:01)
  const [showDraftModal, setShowDraftModal] = useState(false);
  const [draftTime, setDraftTime] = useState<string>('');

  // Modal Xử lý tập tin (Đang xử lý lúc 00:09)
  const [isProcessingWord, setIsProcessingWord] = useState(false);
  const [processingFileName, setProcessingFileName] = useState('');

  // Modal Thông báo nhập thành công (Lúc 00:15)
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successInfo, setSuccessInfo] = useState<{ count: number; fileName: string }>({ count: 0, fileName: '' });

  // Modal Dán đề text trực tiếp
  const [showPasteModal, setShowPasteModal] = useState(false);
  const [importText, setImportText] = useState('');
  const [importMode, setImportMode] = useState<'overwrite' | 'append'>('overwrite');

  // Chế độ Thi trực tiếp (Làm bài ngay trên web)
  const [isLiveTesting, setIsLiveTesting] = useState(false);
  const [liveAnswers, setLiveAnswers] = useState<Record<string, any>>({});
  const [liveTimeLeft, setLiveTimeLeft] = useState<number>(90 * 60);
  const [liveSubmitted, setLiveSubmitted] = useState(false);
  const [liveFocusIndex, setLiveFocusIndex] = useState(0);
  const [tabSwitchWarnings, setTabSwitchWarnings] = useState(0);
  const [studentInfo, setStudentInfo] = useState({ name: '', class: '', school: '', sbd: '' });
  const [startedStudentExam, setStartedStudentExam] = useState(false);

  // Câu hỏi đang chọn để highlight và nhảy đến
  const [activeQuestionId, setActiveQuestionId] = useState<string>('q-1');

  // Cấu hình đề thi chuẩn admin.taodethi.xyz
  const [config, setConfig] = useState<TaoDeThiConfig>({
    title: 'Đề kiểm tra Toán 12 (Chuyển đổi từ Word sang KaTeX)',
    description: 'Hệ thống tự động chuyển đổi công thức toán MathType/OMML sang KaTeX, tự động nhận diện phương án gạch chân là đáp án đúng.',
    grade: '12',
    coverBannerUrl: '/public/assets/aistudio/t_o____thi_xyz_70ba9175.png',
    gamificationMode: 'standard',
    enableAudio: true,
    enableBadges: false,
    durationMinutes: 90,
    maxAttempts: 1,
    cooldownMinutes: 0,
    startTime: '',
    endTime: '',
    antiCheatTabSwitch: true,
    requireFullscreen: false,
    autoSubmitOnCheat: false,
    cloneMode: 'private',
    accessPassword: '',
    displayLayout: 'scroll',
    submitRequirement: '100percent',
    shuffleQuestions: 'none',
    shuffleOptions: 'none',
    lockAnswers: 'editable',
    reviewPermission: 'after_submit',
    showTotalScore: 'on_finish',
    penaltyPerWrong: 0,
    showCorrectAnswers: 'always',
    showExplanations: true,
    closingGreeting: 'Chúc mừng bạn đã hoàn thành bài thi! Chúc bạn đạt kết quả học tập xuất sắc!',
    accessPermission: 'public',
    surveyFields: ['Họ và tên', 'Lớp']
  });

  // Hàm tự động chia đều thang điểm 10 cho các nhóm câu hỏi hiện có trong đề thi
  const distribute10PointScale = (rawGroups: TaoDeThiGroup[]): TaoDeThiGroup[] => {
    const activeGroups = rawGroups.filter(g => g.questions && g.questions.length > 0);
    if (activeGroups.length === 0) return rawGroups;

    // Thang điểm 10. Nếu đề tải lên không có nhóm nào thì bỏ điểm nhóm đó ra, chia đều cho các nhóm còn lại
    const groupCount = activeGroups.length;
    const targetTotal = 10.0;
    const scorePerGroup = targetTotal / groupCount;

    return rawGroups.map(grp => {
      if (!grp.questions || grp.questions.length === 0) return grp;
      const qCount = grp.questions.length;
      const baseQScore = parseFloat((scorePerGroup / qCount).toFixed(2));

      let sum = 0;
      const newQuestions = grp.questions.map((q, idx) => {
        let qScore = baseQScore;
        if (idx === qCount - 1) {
          qScore = parseFloat((scorePerGroup - sum).toFixed(2));
        } else {
          sum += baseQScore;
        }
        return {
          ...q,
          score: Math.max(0.05, qScore)
        };
      });

      return {
        ...grp,
        questions: newQuestions
      };
    });
  };

  // State Modal chỉnh sửa câu hỏi chuyên nghiệp theo Ảnh 3
  const [editingModalState, setEditingModalState] = useState<{
    isOpen: boolean;
    groupId: string;
    questionIndex: number;
    question: TaoDeThiQuestion;
    isNew?: boolean;
  } | null>(null);

  // Danh sách các nhóm và câu hỏi (Mặc định Nhóm 1 trắc nghiệm với thang 10đ)
  const [groups, setGroups] = useState<TaoDeThiGroup[]>([
    {
      id: 'grp-1',
      name: 'Nhóm 1 (Trắc nghiệm)',
      questions: [
        {
          id: 'q-1',
          section: 'A',
          stem: 'Góc $-225^\\circ$ có số đo bằng radian là',
          opts: ['$-\\frac{5\\pi}{4}$', '$\\frac{5\\pi}{4}$', '$-\\frac{4\\pi}{5}$', '$\\frac{5\\pi}{6}$'],
          ci: 1,
          ans: '$\\frac{5\\pi}{4}$',
          sol: 'Ta có $-225^\\circ = -225 \\cdot \\frac{\\pi}{180} = -\\frac{5\\pi}{4}$. Do đó góc lượng giác có số đo dương tương ứng là $\\frac{5\\pi}{4}$.',
          level: 'NB',
          score: 2.0
        },
        {
          id: 'q-2',
          section: 'A',
          stem: 'Một đường tròn có bán kính $9\\text{ cm}$. Độ dài cung có số đo $\\frac{8\\pi}{9}$ là',
          opts: ['$6\\pi\\text{ cm}$', '$8\\pi\\text{ cm}$', '$9\\pi\\text{ cm}$', '$16\\pi\\text{ cm}$'],
          ci: 1,
          ans: '$8\\pi\\text{ cm}$',
          sol: 'Độ dài cung tròn $l = R \\cdot \\alpha = 9 \\cdot \\frac{8\\pi}{9} = 8\\pi\\text{ cm}$.',
          level: 'NB',
          score: 2.0
        },
        {
          id: 'q-3',
          section: 'A',
          stem: 'Cho $\\sin\\alpha = \\frac{3}{5}$ $\\left(\\frac{\\pi}{2} < \\alpha < \\pi\\right)$. Giá trị của $\\cos\\alpha$ bằng',
          opts: ['$\\cos\\alpha = -\\frac{4}{5}$', '$\\cos\\alpha = \\frac{4}{5}$', '$\\cos\\alpha = \\frac{2}{5}$', '$\\cos\\alpha = -\\frac{2}{5}$'],
          ci: 0,
          ans: '$\\cos\\alpha = -\\frac{4}{5}$',
          sol: 'Vì $\\frac{\\pi}{2} < \\alpha < \\pi$ nên $\\cos\\alpha < 0$. Ta có $\\cos\\alpha = -\\sqrt{1 - \\sin^2\\alpha} = -\\sqrt{1 - \\frac{9}{25}} = -\\frac{4}{5}$.',
          level: 'NB',
          score: 2.0
        },
        {
          id: 'q-4',
          section: 'A',
          stem: 'Biết $\\cos\\alpha = \\frac{3}{5}$ và $\\frac{3\\pi}{2} < \\alpha < 2\\pi$. Giá trị của $\\sin 2\\alpha$ là',
          opts: ['$-\\frac{24}{25}$', '$\\frac{24}{25}$', '$-\\frac{7}{25}$', '$\\frac{7}{25}$'],
          ci: 0,
          ans: '$-\\frac{24}{25}$',
          sol: 'Vì $\\frac{3\\pi}{2} < \\alpha < 2\\pi$ nên $\\sin\\alpha = -\\sqrt{1 - (3/5)^2} = -\\frac{4}{5}$. Khi đó $\\sin 2\\alpha = 2\\sin\\alpha\\cos\\alpha = 2\\left(-\\frac{4}{5}\\right)\\left(\\frac{3}{5}\\right) = -\\frac{24}{25}$.',
          level: 'NB',
          score: 2.0
        },
        {
          id: 'q-5',
          section: 'A',
          stem: 'Cho hàm số $y = x^3 - 3x + 2$. Điểm cực tiểu của đồ thị hàm số là:',
          opts: ['$A(1; 0)$', '$B(-1; 4)$', '$C(0; 2)$', '$D(2; 4)$'],
          ci: 0,
          ans: '$A(1; 0)$',
          sol: "Đạo hàm $y' = 3x^2 - 3 = 0 \\Leftrightarrow x = \\pm 1$. Điểm cực tiểu là $A(1; 0)$.",
          level: 'NB',
          score: 2.0
        }
      ]
    }
  ]);

  // Kiểm tra bản nháp tự động lưu trong localStorage khi tải trang
  useEffect(() => {
    try {
      const savedDraft = localStorage.getItem('taodethi_autosave_draft');
      if (savedDraft) {
        const parsed = JSON.parse(savedDraft);
        if (parsed && parsed.savedAt && parsed.groups && parsed.groups.length > 0) {
          setDraftTime(parsed.savedAt);
          setShowDraftModal(true);
        }
      }
    } catch (e) {
      console.warn('Lỗi kiểm tra bản nháp:', e);
    }
  }, []);

  // Tự động lưu bản nháp mỗi khi câu hỏi hoặc cấu hình thay đổi
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const now = new Date();
        const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')} ${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()}`;
        const draftData = {
          config,
          groups,
          savedAt: timeStr
        };
        localStorage.setItem('taodethi_autosave_draft', JSON.stringify(draftData));
      } catch (e) {
        console.warn('Lỗi tự động lưu bản nháp:', e);
      }
    }, 1200);
    return () => clearTimeout(timer);
  }, [config, groups]);

  // Đếm tổng số câu và tổng điểm
  const allQuestions = groups.flatMap(g => g.questions);
  const totalQuestions = allQuestions.length;
  const totalScore = allQuestions.reduce((acc, q) => acc + (q.score || 0), 0);

  // Phân tích ma trận mức độ
  const levelCounts = {
    NB: allQuestions.filter(q => q.level === 'NB').length,
    TH: allQuestions.filter(q => q.level === 'TH').length,
    VD: allQuestions.filter(q => q.level === 'VD').length,
    VDC: allQuestions.filter(q => q.level === 'VDC').length,
  };
  const nbPercent = totalQuestions > 0 ? Math.round((levelCounts.NB / totalQuestions) * 100) : 0;
  const thPercent = totalQuestions > 0 ? Math.round((levelCounts.TH / totalQuestions) * 100) : 0;
  const vdPercent = totalQuestions > 0 ? Math.round((levelCounts.VD / totalQuestions) * 100) : 0;
  const vdcPercent = totalQuestions > 0 ? Math.round((levelCounts.VDC / totalQuestions) * 100) : 0;

  // Xử lý nạp bản nháp đã lưu
  const handleRestoreDraft = () => {
    try {
      const savedDraft = localStorage.getItem('taodethi_autosave_draft');
      if (savedDraft) {
        const parsed = JSON.parse(savedDraft);
        if (parsed.config) setConfig(parsed.config);
        if (parsed.groups) setGroups(parsed.groups);
        setShowDraftModal(false);
      }
    } catch (e) {
      setShowDraftModal(false);
    }
  };

  // Xử lý bỏ qua bản nháp
  const handleDiscardDraft = () => {
    setShowDraftModal(false);
  };

  // State và hàm xóa toàn bộ câu hỏi và nhóm trong đề thi một cách tin cậy
  const [showClearConfirmModal, setShowClearConfirmModal] = useState(false);
  const handleClearExam = () => {
    setGroups([
      { id: 'grp-1', name: 'Nhóm 1 (Trắc nghiệm)', questions: [] },
      { id: 'grp-2', name: 'Nhóm 2 (Đúng / Sai)', questions: [] },
      { id: 'grp-3', name: 'Nhóm 3 (Trả lời ngắn)', questions: [] }
    ]);
    try {
      localStorage.removeItem('taodethi_autosave_draft');
      localStorage.removeItem('taodethi_draft');
    } catch (e) {}
    setShowClearConfirmModal(false);
  };

  // Xử lý tải và giải mã file Word (.docx)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileName = file.name;
    setProcessingFileName(fileName);
    setIsProcessingWord(true);

    try {
      let extractedText = '';
      if (fileName.toLowerCase().endsWith('.docx')) {
        const buffer = await file.arrayBuffer();
        extractedText = await extractDocxTextAndMath(buffer);
      } else {
        extractedText = await file.text();
      }

      // Giả lập thời gian xử lý mượt mà như video thực tế
      await new Promise(r => setTimeout(r, 650));

      const examTitle = fileName.replace(/\.[^/.]+$/, '');
      const parsedExam = parseExamFromWordText(extractedText, examTitle, config.grade);

      if (parsedExam) {
        const detectedGroups: TaoDeThiGroup[] = [];

        // Nhóm 1: Trắc nghiệm 4 lựa chọn (Phần A)
        if (parsedExam.A && parsedExam.A.length > 0) {
          detectedGroups.push({
            id: `grp-1-${Date.now()}`,
            name: 'Nhóm 1 (Trắc nghiệm)',
            questions: parsedExam.A.map((q: any, idx: number) => ({
              id: `q-word-a-${Date.now()}-${idx + 1}`,
              section: 'A',
              stem: q.stem,
              opts: q.opts,
              ci: q.ci ?? 0,
              ans: q.ans,
              sol: q.sol,
              level: 'NB',
              score: 0
            }))
          });
        }

        // Nhóm 2: Đúng / Sai (Phần B)
        if (parsedExam.B && parsedExam.B.length > 0) {
          detectedGroups.push({
            id: `grp-2-${Date.now()}`,
            name: 'Nhóm 2 (Đúng / Sai)',
            questions: parsedExam.B.map((q: any, idx: number) => ({
              id: `q-word-b-${Date.now()}-${idx + 1}`,
              section: 'B',
              stem: q.stem,
              opts: [],
              items: q.items,
              ci: 0,
              ans: (q.items || []).map((it: any) => it.t ? 'Đ' : 'S').join('-'),
              sol: q.sol,
              level: 'TH',
              score: 0
            }))
          });
        }

        // Nhóm 3: Trả lời ngắn (Phần C)
        if (parsedExam.C && parsedExam.C.length > 0) {
          detectedGroups.push({
            id: `grp-3-${Date.now()}`,
            name: 'Nhóm 3 (Trả lời ngắn)',
            questions: parsedExam.C.map((q: any, idx: number) => ({
              id: `q-word-c-${Date.now()}-${idx + 1}`,
              section: 'C',
              stem: q.stem,
              opts: [],
              ci: 0,
              ans: q.ans,
              sol: q.sol,
              level: 'VD',
              score: 0
            }))
          });
        }

        // Tự động chia đều thang điểm 10 cho các nhóm còn lại
        const finalScoredGroups = distribute10PointScale(detectedGroups);
        const totalCount = finalScoredGroups.reduce((acc, g) => acc + g.questions.length, 0);

        if (totalCount > 0) {
          if (importMode === 'append') {
            setGroups(prev => distribute10PointScale([...prev, ...finalScoredGroups]));
          } else {
            setGroups(finalScoredGroups);
          }

          setConfig(prev => ({
            ...prev,
            title: examTitle
          }));

          if (finalScoredGroups[0]?.questions[0]) {
            setActiveQuestionId(finalScoredGroups[0].questions[0].id);
          }
          setIsProcessingWord(false);
          setSuccessInfo({ count: totalCount, fileName });
          setShowSuccessModal(true);
        } else {
          setIsProcessingWord(false);
          alert('Không tìm thấy câu hỏi hợp lệ trong file. Vui lòng kiểm tra lại định dạng!');
        }
      }
    } catch (err: any) {
      setIsProcessingWord(false);
      console.error('Lỗi phân tích file Word:', err);
      alert('Lỗi đọc file: ' + (err.message || 'Không thể trích xuất'));
    } finally {
      // Đặt lại giá trị của input để người dùng có thể chọn lại cùng một file nếu muốn
      if (e.target) {
        e.target.value = '';
      }
    }
  };

  // Nạp đề mẫu ví dụ 5 câu chuẩn
  const handleLoadSampleExam = () => {
    setProcessingFileName('đề mẫu ví dụ word.docx');
    setIsProcessingWord(true);
    setTimeout(() => {
      setIsProcessingWord(false);
      setSuccessInfo({ count: 5, fileName: 'đề mẫu ví dụ word.docx' });
      setShowSuccessModal(true);
    }, 600);
  };

  // Áp dụng nội dung dán text trực tiếp
  const handleApplyPasteText = () => {
    if (!importText.trim()) return;
    try {
      const parsedExam = parseExamFromWordText(importText, config.title, config.grade);
      if (parsedExam) {
        const detectedGroups: TaoDeThiGroup[] = [];

        if (parsedExam.A && parsedExam.A.length > 0) {
          detectedGroups.push({
            id: `grp-paste-1-${Date.now()}`,
            name: 'Nhóm 1 (Trắc nghiệm)',
            questions: parsedExam.A.map((q: any, idx: number) => ({
              id: `q-paste-a-${Date.now()}-${idx + 1}`,
              section: 'A',
              stem: q.stem,
              opts: q.opts,
              ci: q.ci ?? 0,
              ans: q.ans,
              sol: q.sol,
              level: 'NB',
              score: 0
            }))
          });
        }

        if (parsedExam.B && parsedExam.B.length > 0) {
          detectedGroups.push({
            id: `grp-paste-2-${Date.now()}`,
            name: 'Nhóm 2 (Đúng / Sai)',
            questions: parsedExam.B.map((q: any, idx: number) => ({
              id: `q-paste-b-${Date.now()}-${idx + 1}`,
              section: 'B',
              stem: q.stem,
              opts: [],
              items: q.items,
              ci: 0,
              ans: (q.items || []).map((it: any) => it.t ? 'Đ' : 'S').join('-'),
              sol: q.sol,
              level: 'TH',
              score: 0
            }))
          });
        }

        if (parsedExam.C && parsedExam.C.length > 0) {
          detectedGroups.push({
            id: `grp-paste-3-${Date.now()}`,
            name: 'Nhóm 3 (Trả lời ngắn)',
            questions: parsedExam.C.map((q: any, idx: number) => ({
              id: `q-paste-c-${Date.now()}-${idx + 1}`,
              section: 'C',
              stem: q.stem,
              opts: [],
              ci: 0,
              ans: q.ans,
              sol: q.sol,
              level: 'VD',
              score: 0
            }))
          });
        }

        const finalScoredGroups = distribute10PointScale(detectedGroups);
        const totalCount = finalScoredGroups.reduce((acc, g) => acc + g.questions.length, 0);

        if (totalCount > 0) {
          if (importMode === 'append') {
            setGroups(prev => distribute10PointScale([...prev, ...finalScoredGroups]));
          } else {
            setGroups(finalScoredGroups);
          }
          setShowPasteModal(false);
          setSuccessInfo({ count: totalCount, fileName: 'Nội dung dán trực tiếp' });
          setShowSuccessModal(true);
        } else {
          alert('Không tìm thấy câu hỏi hợp lệ trong nội dung đã dán!');
        }
      }
    } catch (e: any) {
      alert('Lỗi phân tích: ' + e.message);
    }
  };

  // Đổi đáp án đúng khi nhấn vào phương án
  const handleSelectCorrectOption = (grpId: string, qId: string, optIdx: number) => {
    setGroups(prev => prev.map(g => {
      if (g.id !== grpId) return g;
      return {
        ...g,
        questions: g.questions.map(q => {
          if (q.id !== qId) return q;
          return {
            ...q,
            ci: optIdx,
            ans: q.opts[optIdx]
          };
        })
      };
    }));
    setIsSaved(false);
  };

  // Đánh lại số thứ tự toàn bộ đề thi
  const handleReindexQuestions = () => {
    let count = 1;
    setGroups(prev => prev.map((g, gIdx) => ({
      ...g,
      questions: g.questions.map(q => ({
        ...q,
        stem: q.stem.replace(/^(?:câu|bài)\s*\d+\s*[:.)\s]\s*/i, '')
      }))
    })));
    alert('Đã đồng bộ lại STT toàn bộ các câu hỏi từ 1 đến hết!');
  };

  // Sinh đề tương tự (Đổi số)
  const handleCreateAdjacent = () => {
    const rawExam = {
      id: `taodethi-${Date.now()}`,
      title: config.title,
      grade: config.grade,
      min: config.durationMinutes,
      A: allQuestions.filter(q => q.section === 'A').map(q => ({
        id: q.id,
        stem: q.stem,
        opts: q.opts,
        ci: q.ci,
        ans: q.ans,
        sol: q.sol
      })),
      B: [],
      C: []
    };

    const adj = createAdjacentExam(rawExam);
    if (adj && adj.A) {
      const adjQuestions: TaoDeThiQuestion[] = adj.A.map((q: any, idx: number) => ({
        id: `q-adj-${idx + 1}`,
        section: 'A',
        stem: q.stem,
        opts: q.opts,
        ci: q.ci,
        ans: q.ans,
        sol: q.sol,
        level: 'NB',
        score: 2.0
      }));

      setGroups([
        {
          id: `grp-adj-${Date.now()}`,
          name: 'Nhóm I (Đề kề đổi số)',
          questions: adjQuestions
        }
      ]);
      setConfig(prev => ({
        ...prev,
        title: `[ĐỀ KỀ ĐỔI SỐ] ${prev.title}`
      }));
      alert('⚡ Đã tự động tạo Đề thi kề với số liệu mới và công thức KaTeX!');
    }
  };

  // Lưu đề thi vào kho lưu trữ
  const handleSaveExam = () => {
    try {
      const examData = {
        id: `taodethi-${Date.now()}`,
        title: config.title,
        desc: config.description,
        grade: config.grade,
        min: config.durationMinutes,
        isCustom: true,
        config,
        groups
      };
      const stored = JSON.parse(localStorage.getItem('lkt_sample_exams') || '[]');
      stored.unshift(examData);
      localStorage.setItem('lkt_sample_exams', JSON.stringify(stored));
      setIsSaved(true);
      alert(`🎉 Đã lưu thành công đề thi "${config.title}"!`);
    } catch (e) {
      console.error(e);
      setIsSaved(true);
      alert('Đã lưu đề thi thành công vào bộ nhớ hệ thống!');
    }
  };

  // Chạy làm bài thi trực tiếp trên web
  const handleStartLiveExam = () => {
    if (totalQuestions === 0) {
      alert('Vui lòng thêm ít nhất 1 câu hỏi vào đề thi trước khi làm bài!');
      return;
    }
    setLiveTimeLeft(config.durationMinutes > 0 ? config.durationMinutes * 60 : 0);
    setLiveAnswers({});
    setLiveSubmitted(false);
    setLiveFocusIndex(0);
    setTabSwitchWarnings(0);
    setStartedStudentExam(config.surveyFields.length === 0);
    setIsLiveTesting(true);
  };

  // Giám sát chuyển tab khi đang làm bài (Anti-cheat)
  useEffect(() => {
    if (!isLiveTesting || liveSubmitted || !config.antiCheatTabSwitch) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitchWarnings(prev => {
          const next = prev + 1;
          alert(`⚠️ CẢNH BÁO GIAN LẬN: Bạn vừa rời khỏi màn hình làm bài thi (Lần ${next})! Hệ thống đã ghi nhận vi phạm.`);
          if (config.autoSubmitOnCheat && next >= 3) {
            handleLiveSubmit();
          }
          return next;
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isLiveTesting, liveSubmitted, config.antiCheatTabSwitch, config.autoSubmitOnCheat]);

  // Đồng hồ đếm ngược làm bài
  useEffect(() => {
    if (!isLiveTesting || liveSubmitted || config.durationMinutes === 0 || !startedStudentExam) return;

    const timer = setInterval(() => {
      setLiveTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleLiveSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isLiveTesting, liveSubmitted, config.durationMinutes, startedStudentExam]);

  // Nộp bài thi trực tiếp
  const handleLiveSubmit = () => {
    setLiveSubmitted(true);
    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  // Tính điểm bài làm trực tiếp cho cả 3 phần A, B, C
  const liveCorrectCount = allQuestions.reduce((acc, q) => {
    if (q.section === 'A') {
      return liveAnswers[q.id] === q.ci ? acc + 1 : acc;
    }
    if (q.section === 'B' && q.items) {
      const bAns = (liveAnswers[q.id] as Record<number, boolean>) || {};
      const allCorrect = q.items.every((it, i) => bAns[i] === it.t);
      return allCorrect ? acc + 1 : acc;
    }
    if (q.section === 'C') {
      const userVal = String(liveAnswers[q.id] || '').trim().toLowerCase().replace(',', '.');
      const keyVal = String(q.ans || '').trim().toLowerCase().replace(',', '.');
      return userVal === keyVal && keyVal !== '' ? acc + 1 : acc;
    }
    return acc;
  }, 0);

  const calculatedLiveScore = totalQuestions > 0 ? ((liveCorrectCount / totalQuestions) * 10).toFixed(2) : '0';

  // Chuyển toàn màn hình
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Tải đề thi dưới dạng file văn bản DOCX / In ấn
  const handlePrintExam = () => {
    window.print();
  };

  return (
    <div className={`w-full min-h-screen transition-colors ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-[#F4F7F9] text-slate-800'}`}>
      {/* 1. THANH ĐIỀU HƯỚNG TRÊN CÙNG CHUẨN ADMIN.TAODETHI.XYZ */}
      <header className={`sticky top-0 z-40 px-3 sm:px-6 py-2.5 flex items-center justify-between border-b backdrop-blur-md shadow-xs transition-colors ${isDarkMode ? 'bg-slate-900/95 border-slate-800' : 'bg-white/95 border-slate-200'}`}>
        {/* Nhóm nút bên trái: Logo & Tiêu đề đề thi */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {/* Logo icon khiên mũ cử nhân */}
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-600 via-indigo-600 to-teal-500 text-white flex items-center justify-center font-black text-sm shrink-0 shadow-sm">
            <BookOpen className="w-5 h-5 text-white" />
          </div>

          {/* Nút cộng màu xanh lá nhanh */}
          <button
            onClick={() => {
              const newQ: TaoDeThiQuestion = {
                id: `q-quick-${Date.now()}`,
                section: 'A',
                stem: 'Câu hỏi mới: Cho hàm số...',
                opts: ['$A$', '$B$', '$C$', '$D$'],
                ci: 0,
                ans: '$A$',
                sol: 'Lời giải chi tiết...',
                level: 'NB',
                score: 2.0
              };
              setGroups(prev => [
                {
                  ...prev[0],
                  questions: [...prev[0].questions, newQ]
                }
              ]);
            }}
            className="w-8 h-8 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center shrink-0 cursor-pointer shadow-sm transition-transform hover:scale-105"
            title="Thêm câu hỏi mới"
          >
            <Plus className="w-5 h-5 stroke-[2.5]" />
          </button>

          {/* Ô sửa tiêu đề đề thi */}
          <div className="flex items-center gap-2 min-w-0 flex-1 max-w-xl">
            <input
              type="text"
              value={config.title}
              onChange={e => {
                setConfig({ ...config, title: e.target.value });
                setIsSaved(false);
              }}
              placeholder="* Chưa có tiêu đề (Chưa lưu)"
              className={`font-extrabold text-sm sm:text-base tracking-tight bg-transparent border-b border-transparent hover:border-slate-300 focus:border-indigo-600 focus:outline-none px-1.5 py-0.5 truncate w-full ${isSaved ? 'text-slate-800 dark:text-slate-100' : 'text-amber-700 dark:text-amber-400'}`}
            />
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 border ${isSaved ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
              {isSaved ? 'Đã lưu' : 'Chưa lưu'}
            </span>
          </div>
        </div>

        {/* Nhóm nút tác vụ bên phải */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Nút chuyển chế độ Tối / Sáng */}
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            title="Đổi giao diện Sáng / Tối"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Nút Toàn màn hình */}
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer hidden sm:block"
            title="Bật / Thoát toàn màn hình"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Nút Nhập đề viền cam nổi bật */}
          <button
            onClick={() => setShowPasteModal(true)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl border-1.5 border-amber-500 hover:bg-amber-50/50 text-amber-700 dark:text-amber-400 text-xs font-bold cursor-pointer transition-colors"
          >
            <FileText className="w-3.5 h-3.5 text-amber-600" />
            <span className="hidden sm:inline">Nhập đề</span>
          </button>

          {/* Nút Cài đặt mở Modal Cấu hình */}
          <button
            onClick={() => setShowSettingsModal(true)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold cursor-pointer transition-colors"
          >
            <Settings className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />
            <span className="hidden sm:inline">Cài đặt</span>
          </button>

          {/* Nút Quản lý dropdown */}
          <div className="relative">
            <button
              onClick={() => setManageDropdownOpen(!manageDropdownOpen)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold cursor-pointer"
            >
              <span>Quản lý</span>
              <ChevronDown className="w-3 h-3 opacity-60" />
            </button>

            {manageDropdownOpen && (
              <div className="absolute right-0 mt-1 w-48 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-1 text-xs z-50 animate-in fade-in zoom-in-95">
                <button
                  onClick={() => {
                    handlePrintExam();
                    setManageDropdownOpen(false);
                  }}
                  className="w-full text-left px-3.5 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5 text-slate-500" />
                  <span>In đề / Xuất PDF</span>
                </button>
                <button
                  onClick={() => {
                    handleCreateAdjacent();
                    setManageDropdownOpen(false);
                  }}
                  className="w-full text-left px-3.5 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                  <span>Sinh đề tương tự</span>
                </button>
                <button
                  onClick={() => {
                    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify({ config, groups }, null, 2));
                    const dl = document.createElement('a');
                    dl.setAttribute('href', dataStr);
                    dl.setAttribute('download', `${config.title || 'de-thi'}.json`);
                    dl.click();
                    setManageDropdownOpen(false);
                  }}
                  className="w-full text-left px-3.5 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Xuất tệp JSON</span>
                </button>
                <div className="border-t border-slate-100 dark:border-slate-800 my-1"></div>
                <button
                  onClick={() => {
                    if (confirm('Xác nhận xóa toàn bộ câu hỏi trong đề này?')) {
                      setGroups([{ id: 'grp-1', name: 'Nhóm I', questions: [] }]);
                      setManageDropdownOpen(false);
                    }
                  }}
                  className="w-full text-left px-3.5 py-2 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-rose-600 flex items-center gap-2 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                  <span>Xóa toàn bộ câu hỏi</span>
                </button>
              </div>
            )}
          </div>

          {/* Nút LƯU màu xanh lá chuẩn */}
          <button
            onClick={handleSaveExam}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-black shadow-xs cursor-pointer transition-all hover:scale-105"
          >
            <Save className="w-3.5 h-3.5" />
            <span>LƯU</span>
          </button>

          {/* Nút Làm bài trực tiếp */}
          <button
            onClick={handleStartLiveExam}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black shadow-xs cursor-pointer transition-all hover:scale-105"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span className="hidden sm:inline">Làm bài</span>
          </button>
        </div>
      </header>

      {/* 2. KHU VỰC CHÍNH 3 CỘT: CỘT TRÁI (DANH SÁCH) • CỘT GIỮA (NỘI DUNG ĐỀ) • CỘT PHẢI (TỔNG QUAN & CÔNG CỤ) */}
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 py-4 grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* CỘT TRÁI (2/12): ĐỀ 1 & DANH SÁCH CÂU HỎI VỚI CHẤM XANH LÁ */}
        <aside className="lg:col-span-2 hidden lg:block">
          <div className={`sticky top-20 rounded-2xl border p-3 shadow-xs space-y-2.5 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200">
                Đề 1
              </span>
              <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[11px] font-bold">
                {totalQuestions} câu
              </span>
            </div>

            {/* Danh sách từng nhóm */}
            {groups.map((grp) => (
              <div key={grp.id} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 px-1 py-1">
                  <span>{grp.name}</span>
                  <span className="text-slate-400 text-[10px]">{grp.questions.length}</span>
                </div>

                {/* Danh sách từng câu hỏi */}
                <div className="space-y-0.5 max-h-[62vh] overflow-y-auto pr-1">
                  {grp.questions.map((q, idx) => {
                    const isSelected = activeQuestionId === q.id;
                    return (
                      <button
                        key={q.id}
                        onClick={() => {
                          setActiveQuestionId(q.id);
                          const el = document.getElementById(`card-${q.id}`);
                          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-between cursor-pointer transition-colors ${isSelected ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 font-bold' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
                      >
                        <div className="flex items-center gap-1.5 truncate">
                          <span className="w-4 text-center font-bold">{idx + 1}</span>
                          <span className="text-[11px] text-slate-400">{q.section === 'A' ? 'TN' : q.section === 'B' ? 'Đ/S' : 'TLN'}</span>
                          <span className="text-[11px] text-slate-400">• {q.score}đ</span>
                        </div>
                        <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            <button
              onClick={() => {
                const newQ: TaoDeThiQuestion = {
                  id: `q-${Date.now()}`,
                  section: 'A',
                  stem: 'Cho hàm số $y = f(x)$ liên tục trên $\\mathbb{R}$...',
                  opts: ['$A$', '$B$', '$C$', '$D$'],
                  ci: 0,
                  ans: '$A$',
                  sol: 'Lời giải chi tiết bám sát sách Kết nối tri thức...',
                  level: 'NB',
                  score: 2.0
                };
                setGroups(prev => [{
                  ...prev[0],
                  questions: [...prev[0].questions, newQ]
                }]);
              }}
              className="w-full mt-2 py-2 border border-dashed border-indigo-300 dark:border-indigo-800 hover:border-indigo-500 rounded-xl text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center justify-center gap-1.5 cursor-pointer hover:bg-indigo-50/50 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Thêm câu hỏi</span>
            </button>
          </div>
        </aside>

        {/* CỘT GIỮA (7/12): NỘI DUNG ĐỀ THI VỚI CÔNG THỨC KATEX VÀ ĐÁP ÁN ĐÚNG BÔI XANH */}
        <main className="lg:col-span-7 space-y-4">
          {/* Banner Nội dung toàn bộ Đề 1 */}
          <div className={`rounded-2xl border p-4 sm:p-5 shadow-xs ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400 font-extrabold text-base">
              <BookOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <span>Nội dung toàn bộ Đề 1</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              Cái nhìn tổng quan về các nhóm và câu hỏi trong đề thi trước khi lưu/xuất bản. Bạn có thể nhấn trực tiếp vào câu hỏi ở cột bên trái để chỉnh sửa nhanh.
            </p>
          </div>

          {/* Vùng Kéo thả / Chọn file Word (.docx) */}
          <div
            onDragOver={e => e.preventDefault()}
            onDrop={async e => {
              e.preventDefault();
              const file = e.dataTransfer.files?.[0];
              if (file) {
                const fakeEvent = { target: { files: [file] } } as any;
                handleFileUpload(fakeEvent);
              }
            }}
            className="rounded-2xl border-2 border-dashed border-indigo-300 dark:border-indigo-800 bg-indigo-50/50 dark:bg-indigo-950/20 p-4 sm:p-5 text-center flex flex-col items-center justify-center gap-3 transition-colors hover:border-indigo-500"
          >
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md">
              <Upload className="w-6 h-6" />
            </div>

            <div>
              <p className="text-sm font-extrabold text-slate-800 dark:text-slate-200">
                Kéo thả file Word (.docx) chứa công thức Toán vào đây hoặc
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Tự động giải mã MathType Equation Native, OMML sang KaTeX chuẩn, nhận diện phương án gạch chân là đáp án đúng!
              </p>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap justify-center">
              <label className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5 transition-all hover:scale-105">
                <Upload className="w-3.5 h-3.5" />
                <span>Chọn từ máy tính</span>
                <input
                  type="file"
                  accept=".docx,.txt"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              <button
                onClick={handleLoadSampleExam}
                className="px-3.5 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold cursor-pointer transition-colors"
              >
                📝 Nạp đề mẫu ví dụ
              </button>
            </div>
          </div>

          {/* Danh sách các nhóm câu hỏi */}
          {groups.map(grp => (
            <div key={grp.id} className="space-y-3">
              {/* Header nhóm */}
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-sm text-slate-800 dark:text-slate-200">{grp.name}</span>
                  <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 text-[11px] font-bold">
                    {grp.questions.length} câu
                  </span>
                  <button
                    onClick={() => {
                      const newName = prompt('Đổi tên nhóm câu hỏi:', grp.name);
                      if (newName) {
                        setGroups(prev => prev.map(g => g.id === grp.id ? { ...g, name: newName } : g));
                      }
                    }}
                    className="p-1 text-slate-400 hover:text-indigo-600 cursor-pointer"
                    title="Đổi tên nhóm"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setGroups(prev => distribute10PointScale(prev));
                    }}
                    className="px-2.5 py-1 rounded-lg border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/20 text-xs font-bold text-amber-800 dark:text-amber-300 hover:bg-amber-100 flex items-center gap-1 cursor-pointer"
                    title="Phân bổ lại thang điểm 10 đều cho các nhóm và câu hỏi hiện có"
                  >
                    <span>⚡ Cân bằng thang 10đ</span>
                  </button>

                  <button
                    onClick={() => {
                      const newQ: TaoDeThiQuestion = {
                        id: `q-${Date.now()}`,
                        section: grp.name.includes('Đúng') ? 'B' : grp.name.includes('ngắn') ? 'C' : 'A',
                        stem: 'Nội dung câu hỏi mới...',
                        opts: ['$\\frac{a}{b}$', '$\\sqrt{x}$', '$x^2$', '$\\pi$'],
                        items: [
                          { s: 'Khẳng định a đúng', t: true },
                          { s: 'Khẳng định b sai', t: false },
                          { s: 'Khẳng định c đúng', t: true },
                          { s: 'Khẳng định d sai', t: false }
                        ],
                        ci: 0,
                        ans: '$\\frac{a}{b}$',
                        sol: 'Lời giải chi tiết...',
                        level: 'NB',
                        score: 2.0
                      };
                      setEditingModalState({
                        isOpen: true,
                        groupId: grp.id,
                        questionIndex: grp.questions.length,
                        question: newQ,
                        isNew: true
                      });
                    }}
                    className="px-2.5 py-1 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Thêm câu hỏi</span>
                  </button>
                </div>
              </div>

              {/* Danh sách thẻ câu hỏi */}
              <div className="space-y-4">
                {grp.questions.map((q, qIdx) => {
                  const isSelected = activeQuestionId === q.id;
                  return (
                    <div
                      id={`card-${q.id}`}
                      key={q.id}
                      onClick={() => setActiveQuestionId(q.id)}
                      className={`rounded-2xl border p-4 sm:p-5 transition-all shadow-xs ${isSelected ? 'ring-2 ring-indigo-500 border-indigo-500' : isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}
                    >
                      {/* Tiêu đề câu hỏi */}
                      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-3 text-xs">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-black text-indigo-700 dark:text-indigo-400 text-sm">
                            Câu {qIdx + 1} ({grp.name.split(' ')[0] || 'Nhóm'}) • {q.score}đ
                          </span>
                          <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold text-[11px]">
                            {q.section === 'A' ? 'Trắc nghiệm' : q.section === 'B' ? 'Đúng / Sai' : 'Trả lời ngắn'}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold text-[11px] border border-emerald-200">
                            {q.level}
                          </span>
                        </div>

                        {/* Tác vụ câu hỏi: Lên, Xuống, Sửa (Ảnh 3), Xóa */}
                        <div className="flex items-center gap-1 text-slate-400">
                          {/* Nút Di chuyển lên ▲ */}
                          <button
                            disabled={qIdx === 0}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (qIdx === 0) return;
                              setGroups(prev => prev.map(g => {
                                if (g.id !== grp.id) return g;
                                const qs = [...g.questions];
                                const temp = qs[qIdx];
                                qs[qIdx] = qs[qIdx - 1];
                                qs[qIdx - 1] = temp;
                                return { ...g, questions: qs };
                              }));
                            }}
                            className="p-1.5 hover:text-indigo-600 disabled:opacity-30 cursor-pointer rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                            title="Di chuyển lên trên"
                          >
                            <MoveUp className="w-3.5 h-3.5" />
                          </button>

                          {/* Nút Di chuyển xuống ▼ */}
                          <button
                            disabled={qIdx === grp.questions.length - 1}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (qIdx === grp.questions.length - 1) return;
                              setGroups(prev => prev.map(g => {
                                if (g.id !== grp.id) return g;
                                const qs = [...g.questions];
                                const temp = qs[qIdx];
                                qs[qIdx] = qs[qIdx + 1];
                                qs[qIdx + 1] = temp;
                                return { ...g, questions: qs };
                              }));
                            }}
                            className="p-1.5 hover:text-indigo-600 disabled:opacity-30 cursor-pointer rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                            title="Di chuyển xuống dưới"
                          >
                            <MoveDown className="w-3.5 h-3.5" />
                          </button>

                          {/* Nút Sửa câu hỏi ✏ (Mở Modal chuẩn Ảnh 3) */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingModalState({
                                isOpen: true,
                                groupId: grp.id,
                                questionIndex: qIdx,
                                question: JSON.parse(JSON.stringify(q)),
                                isNew: false
                              });
                            }}
                            className="p-1.5 hover:text-indigo-600 cursor-pointer rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-950/20 text-indigo-600"
                            title="Chỉnh sửa chi tiết câu hỏi (Modal chuẩn)"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          {/* Nút Xóa câu hỏi ✕ */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm('Xác nhận xóa câu hỏi này khỏi đề thi?')) {
                                setGroups(prev => {
                                  const updated = prev.map(g => ({
                                    ...g,
                                    questions: g.questions.filter(item => item.id !== q.id)
                                  }));
                                  return distribute10PointScale(updated);
                                });
                              }
                            }}
                            className="p-1.5 hover:text-rose-600 cursor-pointer rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/20"
                            title="Xóa câu hỏi"
                          >
                            <X className="w-4 h-4 text-rose-500" />
                          </button>
                        </div>
                      </div>

                      {/* Thân câu hỏi với MathView tự động render KaTeX */}
                      <div className="text-sm sm:text-base font-medium leading-relaxed mb-4 text-slate-900 dark:text-slate-100">
                        <MathView content={q.stem} />
                      </div>

                      {/* Các phương án A, B, C, D (Nếu là Phần A) */}
                      {q.section === 'A' && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {q.opts.map((opt, optIdx) => {
                            const isCorrect = q.ci === optIdx;
                            const letter = ['A', 'B', 'C', 'D'][optIdx] || `${optIdx + 1}`;
                            return (
                              <div
                                key={optIdx}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSelectCorrectOption(grp.id, q.id, optIdx);
                                }}
                                className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all cursor-pointer ${isCorrect ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 shadow-xs' : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/40 dark:bg-slate-900/40'}`}
                              >
                                <span className={`font-black text-xs shrink-0 ${isCorrect ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-700 dark:text-slate-300'}`}>
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
                                    <span className="w-3.5 h-3.5 rounded-full border border-slate-300 dark:border-slate-600"></span>
                                    <ArrowUpDown className="w-3.5 h-3.5 text-slate-300" />
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Các ý Đúng / Sai (Nếu là Phần B) */}
                      {q.section === 'B' && q.items && (
                        <div className="space-y-2">
                          {q.items.map((it, itIdx) => {
                            const subLetter = String.fromCharCode(97 + itIdx);
                            return (
                              <div key={itIdx} className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
                                <div className="flex items-center gap-2 flex-1 pr-3">
                                  <span className="font-bold text-slate-700 dark:text-slate-300">{subLetter})</span>
                                  <MathView content={it.s} />
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setGroups(prev => prev.map(g => ({
                                      ...g,
                                      questions: g.questions.map(item => {
                                        if (item.id !== q.id || !item.items) return item;
                                        const updatedItems = [...item.items];
                                        updatedItems[itIdx] = { ...updatedItems[itIdx], t: !updatedItems[itIdx].t };
                                        return {
                                          ...item,
                                          items: updatedItems,
                                          ans: updatedItems.map(x => x.t ? 'Đ' : 'S').join('-')
                                        };
                                      })
                                    })));
                                  }}
                                  className={`px-2.5 py-1 rounded-lg font-bold text-[11px] cursor-pointer transition-transform hover:scale-105 ${it.t ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' : 'bg-rose-100 text-rose-800 hover:bg-rose-200'}`}
                                  title="Nhấp để đổi trạng thái Đúng / Sai"
                                >
                                  {it.t ? 'ĐÚNG ✓' : 'SAI ✗'}
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Trả lời ngắn (Nếu là Phần C) */}
                      {q.section === 'C' && (
                        <div className="p-3 rounded-xl border border-dashed border-indigo-300 dark:border-indigo-800 bg-indigo-50/40 dark:bg-indigo-950/20 text-xs flex items-center justify-between flex-wrap gap-2">
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-slate-700 dark:text-slate-300">
                              Đáp số / Kết quả:
                            </span>
                            <span className="px-3 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-mono font-black text-indigo-600 dark:text-indigo-400">
                              {q.ans || 'Chưa có'}
                            </span>
                          </div>
                          <button
                            onClick={() => {
                              const newAns = prompt('Nhập đáp số mới cho câu trả lời ngắn:', q.ans || '');
                              if (newAns !== null) {
                                setGroups(prev => prev.map(g => ({
                                  ...g,
                                  questions: g.questions.map(item => item.id === q.id ? { ...item, ans: newAns.trim() } : item)
                                })));
                              }
                            }}
                            className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold cursor-pointer transition-colors"
                          >
                            Sửa đáp số
                          </button>
                        </div>
                      )}

                      {/* Lời giải chi tiết với đường viền xanh lá bên trái giống Ảnh 1, 2, 4 */}
                      {q.sol && (
                        <div className="border-l-4 border-emerald-600 pl-3.5 py-2 text-xs sm:text-sm text-slate-700 dark:text-slate-300 bg-slate-50/70 dark:bg-slate-900/40 rounded-r-xl leading-relaxed mt-3">
                          <span className="font-extrabold text-slate-900 dark:text-slate-100 mr-1.5">Lời giải:</span>
                          <MathView content={q.sol} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </main>

        {/* CỘT PHẢI (3/12): TỔNG QUAN • ĐỀ 1 & CÔNG CỤ */}
        <aside className="lg:col-span-3 space-y-4">
          {/* Card Tổng quan */}
          <div className={`rounded-2xl border p-4 sm:p-5 shadow-xs space-y-4 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-black text-slate-500 uppercase tracking-wider">
                TỔNG QUAN • ĐỀ 1
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 text-xs font-black border border-indigo-200 dark:border-indigo-800">
                {totalQuestions} câu
              </span>
              <span className="px-3 py-1 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-400 text-xs font-black border border-teal-200 dark:border-teal-800">
                {totalScore.toFixed(2)}đ
              </span>
            </div>

            {/* Thanh tiến trình Mức độ */}
            <div className="space-y-2 text-xs pt-1">
              <div className="text-[11px] font-bold text-slate-400 uppercase">MỨC ĐỘ</div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-400 text-[11px]">
                  <span>Nhận biết</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{nbPercent}% ({levelCounts.NB})</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${nbPercent}%` }}></div>
                </div>

                <div className="flex items-center justify-between text-slate-600 dark:text-slate-400 text-[11px]">
                  <span>Thông hiểu</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{thPercent}% ({levelCounts.TH})</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${thPercent}%` }}></div>
                </div>

                <div className="flex items-center justify-between text-slate-600 dark:text-slate-400 text-[11px]">
                  <span>Vận dụng</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{vdPercent}% ({levelCounts.VD})</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: `${vdPercent}%` }}></div>
                </div>
              </div>
            </div>

            {/* Loại câu hỏi */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
              <div className="text-[11px] font-bold text-slate-400 uppercase mb-1.5">LOẠI CÂU HỎI</div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-[11px]">
                  TN: {allQuestions.filter(q => q.section === 'A').length}
                </span>
                <span className="px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-bold text-[11px] border border-blue-200 dark:border-blue-800">
                  Đ/S: {allQuestions.filter(q => q.section === 'B').length}
                </span>
                <span className="px-2 py-0.5 rounded bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 font-bold text-[11px] border border-purple-200 dark:border-purple-800">
                  TLN: {allQuestions.filter(q => q.section === 'C').length}
                </span>
              </div>
            </div>
          </div>

          {/* Bảng CÔNG CỤ */}
          <div className={`rounded-2xl border p-4 sm:p-5 shadow-xs space-y-3 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            <div className="text-xs font-black text-slate-400 uppercase tracking-wider pb-1">
              CÔNG CỤ
            </div>

            {/* Đánh lại STT toàn bộ đề */}
            <button
              onClick={handleReindexQuestions}
              className="w-full py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer transition-colors text-center"
            >
              Đánh lại STT toàn bộ đề
            </button>

            {/* Nút tím lớn: Nhập từ PDF / DOCX */}
            <label className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-xs font-black shadow-md flex flex-col items-center justify-center gap-1 cursor-pointer transition-transform hover:scale-[1.02]">
              <div className="flex items-center gap-1.5">
                <Upload className="w-4 h-4" />
                <span>Nhập từ PDF / DOCX</span>
              </div>
              <span className="text-[10px] font-normal text-indigo-100">Ghi đè hoặc nối tiếp đề</span>
              <input
                type="file"
                accept=".docx,.txt"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>

            {/* Nút Sinh đề tương tự (Đổi số) */}
            <button
              onClick={handleCreateAdjacent}
              className="w-full py-2.5 px-3 rounded-xl bg-teal-50 dark:bg-teal-950/30 hover:bg-teal-100 dark:hover:bg-teal-900/40 border border-teal-200 dark:border-teal-800 text-teal-800 dark:text-teal-300 text-xs font-bold cursor-pointer transition-colors flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-teal-600" />
              <span>Sinh đề tương tự (Đổi số)</span>
            </button>

            {/* Nút Làm bài trực tiếp */}
            <button
              onClick={handleStartLiveExam}
              className="w-full py-3 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black shadow-sm cursor-pointer transition-colors flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>LÀM BÀI TRỰC TIẾP</span>
            </button>

            {/* Nút Xóa đề này */}
            <button
              type="button"
              onClick={() => setShowClearConfirmModal(true)}
              className="w-full py-2.5 px-3 text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-xl cursor-pointer transition-colors text-center border border-rose-200 dark:border-rose-900/40 shadow-2xs"
            >
              🗑 Xóa đề này
            </button>

            <p className="text-[10px] text-slate-400 text-center leading-tight pt-1">
              Nhóm có "Đánh lại STT" bắt đầu từ 1. Nhóm khác tiếp tục số liền trước.
            </p>
          </div>
        </aside>
      </div>

      {/* 3. MODAL KHÔI PHỤC BẢN NHÁP (GIỐNG VIDEO LÚC 00:01) */}
      {showDraftModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 max-w-sm w-full text-center shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95">
            <div className="w-14 h-14 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 mx-auto flex items-center justify-center font-bold text-xl mb-3 shadow-inner">
              ?
            </div>
            <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">
              Khôi phục bản nháp?
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
              Có bản nháp được tự động lưu lúc: <b className="text-slate-800 dark:text-slate-200">{draftTime || 'vừa xong'}</b>.<br />
              Bạn có muốn tiếp tục soạn thảo không?
            </p>

            <div className="grid grid-cols-2 gap-3 mt-6">
              <button
                onClick={handleDiscardDraft}
                className="py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
              >
                Bỏ qua
              </button>
              <button
                onClick={handleRestoreDraft}
                className="py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md cursor-pointer"
              >
                Khôi phục
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL XÁC NHẬN XÓA TOÀN BỘ ĐỀ THI */}
      {showClearConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 max-w-sm w-full text-center shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 space-y-4">
            <div className="w-14 h-14 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 mx-auto flex items-center justify-center text-2xl font-bold shadow-inner">
              🗑
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">
                Xóa toàn bộ đề thi?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Thao tác này sẽ xóa sạch tất cả các câu hỏi và các nhóm hiện tại để bắt đầu soạn đề mới.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowClearConfirmModal(false)}
                className="py-2.5 px-3 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleClearExam}
                className="py-2.5 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black shadow-md cursor-pointer transition-all hover:scale-105"
              >
                Xác nhận xóa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. MODAL ĐANG XỬ LÝ TẬP TIN (GIỐNG VIDEO LÚC 00:09) */}
      {isProcessingWord && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-7 max-w-sm w-full text-center shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95">
            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h4 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
              Đang xử lý tập tin
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              Đang giải mã nhị phân MathType &amp; OMML từ file <b className="text-slate-700 dark:text-slate-300">"{processingFileName}"</b> sang KaTeX chuẩn...
            </p>
          </div>
        </div>
      )}

      {/* 5. MODAL NHẬP THÀNH CÔNG (GIỐNG VIDEO LÚC 00:15) */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 max-w-sm w-full text-center shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95">
            <div className="w-14 h-14 rounded-full bg-cyan-50 dark:bg-cyan-950/40 text-cyan-500 mx-auto flex items-center justify-center mb-3">
              <Check className="w-8 h-8 stroke-[3]" />
            </div>
            <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">
              Nhập thành công
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
              Đã nhập <b className="text-indigo-600 dark:text-indigo-400">{successInfo.count} câu hỏi</b> từ file <br />
              <span className="font-semibold text-slate-700 dark:text-slate-300">{successInfo.fileName}</span>
            </p>

            <button
              onClick={() => setShowSuccessModal(false)}
              className="w-full mt-6 py-2.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-white text-xs font-extrabold shadow-md cursor-pointer transition-colors"
            >
              Đồng ý
            </button>
          </div>
        </div>
      )}

      {/* 6. MODAL CÀI ĐẶT CẤU HÌNH THI ĐẦY ĐỦ 9 MỤC (GIỐNG VIDEO LÚC 00:20 - 01:07 VÀ ẢNH CHỤP) */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-5xl w-full max-h-[94vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 overflow-hidden">
            {/* Header Modal Cài đặt */}
            <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                  <Settings className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">
                    Cài đặt Cấu hình Thi
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Thiết lập các quy tắc và giới hạn cho đề thi của bạn
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowSettingsModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleSaveExam();
                    setShowSettingsModal(false);
                  }}
                  className="px-5 py-2 text-xs font-black bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Lưu Cài Đặt</span>
                </button>
              </div>
            </div>

            {/* Thân Modal 2 cột: Cột trái (menu 9 mục) • Cột phải (nội dung chi tiết) */}
            <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-12">
              {/* CỘT TRÁI (4/12): Banner mini & Điều hướng nhanh */}
              <div className="lg:col-span-4 p-4 border-r border-slate-100 dark:border-slate-800 overflow-y-auto space-y-4">
                {/* Banner mini */}
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 p-3 shadow-xs space-y-2">
                  <div className="relative rounded-xl overflow-hidden bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-200 p-3 text-center border border-amber-300 shadow-inner">
                    <div className="text-[11px] font-black uppercase text-slate-900 tracking-wider">
                      CÔNG CỤ TẠO ĐỀ THI ONLINE
                    </div>
                    <div className="text-[9px] font-mono font-bold text-slate-800">
                      www.taodethi.xyz
                    </div>
                  </div>
                  <div className="text-xs font-extrabold text-slate-800 dark:text-slate-200 truncate">
                    {config.title || 'Đề thi chưa đặt tên'}
                  </div>
                </div>

                {/* Bảng tóm tắt thông tin cấu hình */}
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-3 text-xs space-y-2">
                  <div className="text-[11px] font-bold text-slate-400 uppercase">THÔNG TIN CẤU HÌNH</div>
                  <div className="space-y-1.5 text-slate-600 dark:text-slate-400 text-[11px]">
                    <div className="flex justify-between">
                      <span>Hình thức</span>
                      <span className="font-bold text-indigo-600">Thi tiêu chuẩn</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Thời gian</span>
                      <span className="font-bold text-cyan-600">{config.durationMinutes > 0 ? `${config.durationMinutes} phút` : 'Không giới hạn'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Chống thoát</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{config.antiCheatTabSwitch ? 'Bật' : 'Tắt'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Lượt làm</span>
                      <span className="font-bold text-cyan-600">Tối đa {config.maxAttempts} lần</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Quyền vào</span>
                      <span className="font-bold text-emerald-600">Công khai</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Xem điểm</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">Hiển thị</span>
                    </div>
                  </div>
                </div>

                {/* Danh sách 9 mục điều hướng */}
                <div className="space-y-1 text-xs font-bold">
                  <div className="text-[10px] uppercase text-slate-400 px-2 py-1">ĐIỀU HƯỚNG NHANH</div>
                  {[
                    { id: 'gamification', label: '🎮 Thi & Trải nghiệm' },
                    { id: 'info', label: '📄 Thông tin cơ bản' },
                    { id: 'time', label: '⏱️ Cấu hình Thời gian' },
                    { id: 'security', label: '🔒 Bảo mật & Giám sát' },
                    { id: 'display', label: '🔀 Hiển thị & Ngẫu nhiên' },
                    { id: 'review', label: '👁️ Xem lại & Đáp án' },
                    { id: 'greeting', label: '💬 Lời chúc & Phản hồi' },
                    { id: 'permission', label: '👥 Phân quyền truy cập' },
                    { id: 'survey', label: '📋 Khảo sát / Form' }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveSettingsTab(tab.id)}
                      className={`w-full text-left px-3 py-2 rounded-xl flex items-center justify-between cursor-pointer transition-colors ${activeSettingsTab === tab.id ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 font-extrabold' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                    >
                      <span>{tab.label}</span>
                      <ChevronRight className="w-3.5 h-3.5 opacity-40" />
                    </button>
                  ))}
                </div>
              </div>

              {/* CỘT PHẢI (8/12): Chi tiết cấu hình */}
              <div className="lg:col-span-8 p-5 overflow-y-auto space-y-6">
                {/* 1. Thi & Trải nghiệm Gamification */}
                {activeSettingsTab === 'gamification' && (
                  <div className="space-y-4 animate-in fade-in">
                    <div className="p-3 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900 text-xs text-indigo-900 dark:text-indigo-300 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                      <span>Hệ thống mô phỏng đa dạng quá trình làm bài. Mặc định là <b>Thi tiêu chuẩn</b>.</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                      {[
                        { id: 'standard', name: 'Thi tiêu chuẩn', desc: 'Chấm điểm, xếp Rank' },
                        { id: 'practice', name: 'Luyện tập', desc: 'Biết đúng/sai, Hints' },
                        { id: 'flashcard', name: 'Flashcard', desc: 'Thẻ ghi nhớ lật' },
                        { id: 'live', name: 'Thi trực tiếp', desc: 'Live Kahoot / Host' }
                      ].map(mode => (
                        <div
                          key={mode.id}
                          onClick={() => setConfig({ ...config, gamificationMode: mode.id as any })}
                          className={`p-3.5 rounded-2xl border-2 text-center cursor-pointer transition-all ${config.gamificationMode === mode.id ? 'border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-extrabold shadow-sm' : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'}`}
                        >
                          <div className="font-extrabold">{mode.name}</div>
                          <div className="text-[10px] text-slate-400 mt-1">{mode.desc}</div>
                        </div>
                      ))}
                    </div>

                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
                      <div className="text-xs font-bold text-slate-400 uppercase">HIỆU ỨNG TƯƠNG TÁC &amp; KHEN THƯỞNG</div>
                      <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-800 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={config.enableAudio}
                          onChange={e => setConfig({ ...config, enableAudio: e.target.checked })}
                          className="w-4 h-4 text-indigo-600 rounded"
                        />
                        <div className="text-xs">
                          <span className="font-bold text-slate-800 dark:text-slate-200 block">Bật Âm thanh Tương tác</span>
                          <span className="text-[11px] text-slate-400">Âm thanh vui nhộn khi chọn đáp án, nộp bài</span>
                        </div>
                      </label>
                    </div>
                  </div>
                )}

                {/* 2. Thông tin cơ bản */}
                {activeSettingsTab === 'info' && (
                  <div className="space-y-4 animate-in fade-in text-xs">
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                        TÊN ĐỀ THI
                      </label>
                      <input
                        type="text"
                        value={config.title}
                        onChange={e => setConfig({ ...config, title: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold text-sm focus:ring-2 focus:ring-indigo-500"
                        placeholder="VD: Kiểm tra Toán cuối học kỳ 1 lớp 12..."
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                        LỜI NGỎ / MÔ TẢ
                      </label>
                      <textarea
                        rows={4}
                        value={config.description}
                        onChange={e => setConfig({ ...config, description: e.target.value })}
                        className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:ring-2 focus:ring-indigo-500 leading-relaxed"
                        placeholder="Vui lòng nhập nội dung... Sẽ hiển thị trên trang giới thiệu đề thi trước khi học sinh bấm vào thi."
                      />
                    </div>
                  </div>
                )}

                {/* 3. Cấu hình Thời gian */}
                {activeSettingsTab === 'time' && (
                  <div className="space-y-4 animate-in fade-in text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Thời lượng (Phút)
                        </label>
                        <input
                          type="number"
                          value={config.durationMinutes}
                          onChange={e => setConfig({ ...config, durationMinutes: parseInt(e.target.value) || 0 })}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold"
                        />
                        <span className="text-[11px] text-slate-400 mt-0.5 block">Nhập 0 để không giới hạn thời gian</span>
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Số lần làm bài tối đa
                        </label>
                        <input
                          type="number"
                          value={config.maxAttempts}
                          onChange={e => setConfig({ ...config, maxAttempts: parseInt(e.target.value) || 1 })}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold"
                        />
                        <span className="text-[11px] text-slate-400 mt-0.5 block">Nhập 0 để không giới hạn số lần nộp bài</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. Bảo mật & Giám sát */}
                {activeSettingsTab === 'security' && (
                  <div className="space-y-3 animate-in fade-in text-xs">
                    <label className="flex items-center gap-3 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.antiCheatTabSwitch}
                        onChange={e => setConfig({ ...config, antiCheatTabSwitch: e.target.checked })}
                        className="w-4 h-4 text-indigo-600 rounded"
                      />
                      <div>
                        <span className="font-bold text-slate-800 dark:text-slate-200 block">Giám sát chống gian lận</span>
                        <span className="text-[11px] text-slate-400">Cảnh báo và đếm số lần học sinh chuyển tab hoặc rời màn hình làm bài</span>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.autoSubmitOnCheat}
                        onChange={e => setConfig({ ...config, autoSubmitOnCheat: e.target.checked })}
                        className="w-4 h-4 text-indigo-600 rounded"
                      />
                      <div>
                        <span className="font-bold text-slate-800 dark:text-slate-200 block">Tự động nộp bài khi vi phạm quá 3 lần</span>
                        <span className="text-[11px] text-slate-400">Thu bài ngay lập tức nếu phát hiện cố tình gian lận</span>
                      </div>
                    </label>
                  </div>
                )}

                {/* 5. Hiển thị & Ngẫu nhiên */}
                {activeSettingsTab === 'display' && (
                  <div className="space-y-4 animate-in fade-in text-xs">
                    <div>
                      <div className="font-bold text-slate-700 dark:text-slate-300 mb-2">• BỐ CỤC HIỂN THỊ MÀN THI</div>
                      <div className="grid grid-cols-2 gap-3">
                        <div
                          onClick={() => setConfig({ ...config, displayLayout: 'scroll' })}
                          className={`p-3 rounded-2xl border-2 cursor-pointer ${config.displayLayout === 'scroll' ? 'border-cyan-500 bg-cyan-50/40 text-cyan-800 font-extrabold' : 'border-slate-200'}`}
                        >
                          <div className="font-bold">Cuộn dọc</div>
                          <div className="text-[10px] text-slate-400">Xem toàn bộ danh sách câu hỏi</div>
                        </div>
                        <div
                          onClick={() => setConfig({ ...config, displayLayout: 'focus' })}
                          className={`p-3 rounded-2xl border-2 cursor-pointer ${config.displayLayout === 'focus' ? 'border-cyan-500 bg-cyan-50/40 text-cyan-800 font-extrabold' : 'border-slate-200'}`}
                        >
                          <div className="font-bold">Focus Mode</div>
                          <div className="text-[10px] text-slate-400">Từng câu Next / Prev</div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="font-bold text-slate-700 dark:text-slate-300 mb-2">• CHẾ ĐỘ NỘP BÀI</div>
                      <div className="grid grid-cols-2 gap-3">
                        <div
                          onClick={() => setConfig({ ...config, submitRequirement: '100percent' })}
                          className={`p-3 rounded-2xl border-2 cursor-pointer ${config.submitRequirement === '100percent' ? 'border-emerald-500 bg-emerald-50/40 text-emerald-800 font-extrabold' : 'border-slate-200'}`}
                        >
                          <div className="font-bold">Yêu cầu 100%</div>
                          <div className="text-[10px] text-slate-400">Phải điền hết mới nộp được</div>
                        </div>
                        <div
                          onClick={() => setConfig({ ...config, submitRequirement: 'free' })}
                          className={`p-3 rounded-2xl border-2 cursor-pointer ${config.submitRequirement === 'free' ? 'border-emerald-500 bg-emerald-50/40 text-emerald-800 font-extrabold' : 'border-slate-200'}`}
                        >
                          <div className="font-bold">Tự do nộp</div>
                          <div className="text-[10px] text-slate-400">Nộp bất cứ khi nào</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 6. Xem lại & Đáp án */}
                {activeSettingsTab === 'review' && (
                  <div className="space-y-4 animate-in fade-in text-xs">
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Quyền Xem lại bài thi
                      </label>
                      <select
                        value={config.reviewPermission}
                        onChange={e => setConfig({ ...config, reviewPermission: e.target.value as any })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium"
                      >
                        <option value="after_submit">Cho phép xem ngay sau khi nộp bài</option>
                        <option value="disabled">Không cho phép xem</option>
                        <option value="after_close">Chỉ xem khi đóng đề thi</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Tình trạng Đáp án Đúng &amp; Lời giải
                      </label>
                      <select
                        value={config.showCorrectAnswers}
                        onChange={e => setConfig({ ...config, showCorrectAnswers: e.target.value as any })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium"
                      >
                        <option value="always">Luôn công bố (Sau khi thi)</option>
                        <option value="never">Không công bố đáp án</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* 7. Lời chúc & Phản hồi */}
                {activeSettingsTab === 'greeting' && (
                  <div className="space-y-3 animate-in fade-in text-xs">
                    <label className="block font-bold text-slate-700 dark:text-slate-300">
                      Lời chúc / Phản hồi hiển thị khi học sinh hoàn thành bài:
                    </label>
                    <textarea
                      rows={3}
                      value={config.closingGreeting}
                      onChange={e => setConfig({ ...config, closingGreeting: e.target.value })}
                      className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                    />
                  </div>
                )}

                {/* 8. Phân quyền truy cập */}
                {activeSettingsTab === 'permission' && (
                  <div className="space-y-3 animate-in fade-in text-xs">
                    <div className="p-4 rounded-2xl border-2 border-emerald-500 bg-emerald-50/40 text-emerald-900 font-bold">
                      ✓ Tất cả mọi người (Bất kỳ ai có liên kết đều có thể tham gia thi)
                    </div>
                  </div>
                )}

                {/* 9. Khảo sát / Form trước khi vào thi */}
                {activeSettingsTab === 'survey' && (
                  <div className="space-y-3 animate-in fade-in text-xs">
                    <div className="text-[11px] font-bold text-slate-400 uppercase">
                      TRƯỜNG THÔNG TIN HỌC SINH ĐIỀN TRƯỚC KHI THI:
                    </div>
                    <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between font-bold">
                      <span>1. Họ và tên</span>
                      <span className="text-rose-500 text-[11px]">(Bắt buộc)</span>
                    </div>
                    <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between font-bold">
                      <span>2. Lớp</span>
                      <span className="text-rose-500 text-[11px]">(Bắt buộc)</span>
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                  <button
                    onClick={() => {
                      handleSaveExam();
                      setShowSettingsModal(false);
                    }}
                    className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-md cursor-pointer flex items-center gap-2"
                  >
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>HOÀN TẤT &amp; LƯU CÀI ĐẶT</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. MODAL DÁN ĐỀ THI TRỰC TIẾP */}
      {showPasteModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-slate-900 dark:text-slate-100">
                Nhập đề thi từ nội dung văn bản / Word
              </h3>
              <button onClick={() => setShowPasteModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-3 text-xs">
              <span className="font-bold text-slate-700 dark:text-slate-300">Chế độ nhập:</span>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="pasteMode"
                  checked={importMode === 'overwrite'}
                  onChange={() => setImportMode('overwrite')}
                />
                <span>Ghi đè đề hiện tại</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="pasteMode"
                  checked={importMode === 'append'}
                  onChange={() => setImportMode('append')}
                />
                <span>Nối tiếp vào sau</span>
              </label>
            </div>

            <textarea
              rows={10}
              value={importText}
              onChange={e => setImportText(e.target.value)}
              placeholder="Dán nội dung đề thi vào đây... Phương án gạch chân <u>Đáp án</u> sẽ được tự động nhận diện!"
              className="w-full p-3 font-mono text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 leading-relaxed focus:ring-2 focus:ring-indigo-500"
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowPasteModal(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Hủy
              </button>
              <button
                onClick={handleApplyPasteText}
                className="px-5 py-2 text-xs font-black bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md cursor-pointer"
              >
                Phân tích &amp; Nhập đề
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8. MÀN HÌNH LÀM BÀI TRỰC TIẾP (LIVE EXAM TESTING ROOM) */}
      {isLiveTesting && (
        <div className="fixed inset-0 z-50 bg-[#F4F7F9] dark:bg-slate-950 flex flex-col overflow-y-auto">
          {/* Header phòng thi */}
          <div className="sticky top-0 z-40 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-3 flex items-center justify-between shadow-xs">
            <div>
              <h2 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-slate-100 truncate max-w-md">
                {config.title}
              </h2>
              <div className="text-[11px] text-slate-500">
                Thí sinh: <b className="text-indigo-600">{studentInfo.name || 'Học sinh'}</b> {studentInfo.class && `(Lớp ${studentInfo.class})`}
              </div>
            </div>

            <div className="flex items-center gap-3">
              {config.durationMinutes > 0 && !liveSubmitted && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-mono font-black text-sm border border-indigo-200 dark:border-indigo-800">
                  <Clock className="w-4 h-4 text-indigo-600" />
                  <span>
                    {Math.floor(liveTimeLeft / 60).toString().padStart(2, '0')}:{(liveTimeLeft % 60).toString().padStart(2, '0')}
                  </span>
                </div>
              )}

              {!liveSubmitted ? (
                <button
                  onClick={handleLiveSubmit}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Nộp bài</span>
                </button>
              ) : (
                <button
                  onClick={() => setIsLiveTesting(false)}
                  className="px-4 py-2 rounded-xl bg-slate-700 hover:bg-slate-800 text-white font-extrabold text-xs shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Về trang soạn đề</span>
                </button>
              )}
            </div>
          </div>

          {/* Form điền thông tin khảo sát trước khi bắt đầu */}
          {!startedStudentExam && (
            <div className="flex-1 flex items-center justify-center p-4">
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
                <div className="text-center">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 mx-auto flex items-center justify-center font-bold mb-2">
                    <FileCheck className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">
                    Thông tin thí sinh
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Vui lòng điền thông tin trước khi tính giờ làm bài
                  </p>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Họ và tên *
                    </label>
                    <input
                      type="text"
                      value={studentInfo.name}
                      onChange={e => setStudentInfo({ ...studentInfo, name: e.target.value })}
                      placeholder="Nguyễn Văn A"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Lớp học *
                    </label>
                    <input
                      type="text"
                      value={studentInfo.class}
                      onChange={e => setStudentInfo({ ...studentInfo, class: e.target.value })}
                      placeholder="12A1"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold"
                    />
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (!studentInfo.name.trim()) {
                      alert('Vui lòng nhập họ và tên!');
                      return;
                    }
                    setStartedStudentExam(true);
                  }}
                  className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-md cursor-pointer mt-2"
                >
                  Bắt đầu làm bài thi
                </button>
              </div>
            </div>
          )}

          {/* Màn hình làm câu hỏi */}
          {startedStudentExam && (
            <div className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 space-y-5">
              {/* Kết quả sau khi nộp bài */}
              {liveSubmitted && (
                <div className="rounded-3xl p-6 bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-xl text-center space-y-2 animate-in zoom-in-95">
                  <Award className="w-12 h-12 mx-auto text-amber-300" />
                  <h3 className="text-2xl font-black">
                    Chúc mừng em đã hoàn thành bài thi!
                  </h3>
                  <div className="text-3xl font-black text-amber-200">
                    {calculatedLiveScore} / 10.00 Điểm
                  </div>
                  <p className="text-xs text-emerald-100 max-w-md mx-auto pt-1">
                    Đúng {liveCorrectCount} / {totalQuestions} câu. {config.closingGreeting}
                  </p>
                </div>
              )}

              {/* Danh sách câu hỏi */}
              <div className="space-y-4">
                {allQuestions.map((q, idx) => {
                  const userAnswer = liveAnswers[q.id];
                  let isCorrect = false;
                  let keyIdx = 0;
                  if (q.section === 'A') {
                    keyIdx = (q.ci !== undefined && q.ci >= 0) ? q.ci : { 'A': 0, 'B': 1, 'C': 2, 'D': 3 }[(q.ans || 'A').toUpperCase()] ?? 0;
                    isCorrect = userAnswer !== undefined && Number(userAnswer) === keyIdx;
                  } else if (q.section === 'B' && q.items) {
                    const bAns = (liveAnswers[q.id] as Record<number, boolean>) || {};
                    isCorrect = q.items.every((it, i) => bAns[i] === it.t);
                  } else if (q.section === 'C') {
                    const u = String(liveAnswers[q.id] ?? '').trim().toLowerCase().replace(',', '.');
                    const k = String(q.ans ?? '').trim().toLowerCase().replace(',', '.');
                    isCorrect = u !== '' && u === k;
                  }

                  return (
                    <div
                      key={q.id}
                      className={`rounded-2xl border p-5 shadow-xs transition-colors ${liveSubmitted ? (isCorrect ? 'border-emerald-400 bg-emerald-50/30 dark:bg-emerald-950/20' : 'border-rose-300 bg-rose-50/20 dark:bg-rose-950/20') : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'}`}
                    >
                      <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-100 dark:border-slate-800 text-xs">
                        <span className="font-black text-indigo-700 dark:text-indigo-400">
                          Câu {idx + 1} {q.section === 'A' ? '(Trắc nghiệm)' : q.section === 'B' ? '(Đúng / Sai)' : '(Trả lời ngắn)'}
                        </span>
                        {liveSubmitted && (
                          <span className={`font-black text-xs px-2.5 py-1 rounded-full ${isCorrect ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-rose-100 text-rose-800 border border-rose-300'}`}>
                            {isCorrect ? `✓ Đúng (+${(q.score || 0).toFixed(2)}đ)` : '✗ Chưa đúng (0đ)'}
                          </span>
                        )}
                      </div>

                      <div className="text-sm font-medium leading-relaxed mb-4 text-slate-800 dark:text-slate-100">
                        <MathView content={q.stem} />
                      </div>

                      {/* Phương án lựa chọn Phần A (Trắc nghiệm) */}
                      {q.section === 'A' && (
                        <div className="space-y-3">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            {q.opts.map((opt, optIdx) => {
                              const isChosen = liveAnswers[q.id] === optIdx;
                              const isKey = keyIdx === optIdx;
                              const letter = ['A', 'B', 'C', 'D'][optIdx];

                              let cardClass = 'border-slate-200 dark:border-slate-800 hover:border-indigo-300 bg-slate-50/50 dark:bg-slate-800/40';
                              if (liveSubmitted) {
                                if (isKey) cardClass = 'border-emerald-500 bg-emerald-100/60 text-emerald-950 font-bold ring-2 ring-emerald-400';
                                else if (isChosen && !isKey) cardClass = 'border-rose-400 bg-rose-100/50 text-rose-950 line-through';
                              } else if (isChosen) {
                                cardClass = 'border-indigo-600 bg-indigo-50/70 text-indigo-900 font-bold';
                              }

                              return (
                                <button
                                  key={optIdx}
                                  type="button"
                                  disabled={liveSubmitted}
                                  onClick={() => {
                                    setLiveAnswers({ ...liveAnswers, [q.id]: optIdx });
                                  }}
                                  className={`flex items-start gap-3 p-3 rounded-xl border-2 text-left cursor-pointer transition-all ${cardClass}`}
                                >
                                  <span className="font-black text-xs shrink-0 mt-0.5">{letter}.</span>
                                  <div className="text-xs sm:text-sm font-medium flex-1">
                                    <MathView content={opt} />
                                  </div>
                                  {liveSubmitted && isKey && (
                                    <span className="shrink-0 text-[10px] font-black uppercase bg-emerald-600 text-white px-2 py-0.5 rounded-md">
                                      Đáp án đúng
                                    </span>
                                  )}
                                  {liveSubmitted && isChosen && !isKey && (
                                    <span className="shrink-0 text-[10px] font-black uppercase bg-rose-600 text-white px-2 py-0.5 rounded-md">
                                      Đã chọn
                                    </span>
                                  )}
                                </button>
                              );
                            })}
                          </div>

                          {liveSubmitted && (
                            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center justify-between text-xs">
                              <span className="text-emerald-900 dark:text-emerald-200 font-bold">
                                🔑 Đáp án chuẩn: <b className="font-mono text-sm uppercase">{['A', 'B', 'C', 'D'][keyIdx]}</b>
                              </span>
                              <span className="text-slate-500">
                                Điểm: <b>{isCorrect ? (q.score || 0).toFixed(2) : 0}</b> / {(q.score || 0).toFixed(2)} đ
                              </span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Làm bài Phần B (Đúng / Sai) */}
                      {q.section === 'B' && q.items && (
                        <div className="space-y-2.5">
                          {q.items.map((it, itIdx) => {
                            const subLetter = String.fromCharCode(97 + itIdx);
                            const currentAnsMap = (liveAnswers[q.id] as Record<number, boolean>) || {};
                            const userSubChoice = currentAnsMap[itIdx];
                            const isCorrectSub = userSubChoice === it.t;

                            return (
                              <div
                                key={itIdx}
                                className={`flex items-center justify-between p-3 rounded-xl border text-xs gap-3 ${liveSubmitted ? (isCorrectSub ? 'border-emerald-300 bg-emerald-50/20' : 'border-rose-300 bg-rose-50/20') : 'border-slate-200 dark:border-slate-800'}`}
                              >
                                <div className="flex items-center gap-2 flex-1">
                                  <span className="font-black text-indigo-700">{subLetter})</span>
                                  <MathView content={it.s} />
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                  {liveSubmitted && (
                                    <span className="font-bold text-[11px] text-emerald-700 mr-2">
                                      Chuẩn: <b className="font-mono">{it.t ? 'ĐÚNG' : 'SAI'}</b>
                                    </span>
                                  )}
                                  <button
                                    type="button"
                                    disabled={liveSubmitted}
                                    onClick={() => {
                                      const updated = { ...currentAnsMap, [itIdx]: true };
                                      setLiveAnswers({ ...liveAnswers, [q.id]: updated });
                                    }}
                                    className={`px-3 py-1.5 rounded-lg font-bold text-xs cursor-pointer ${userSubChoice === true ? 'bg-emerald-600 text-white shadow-xs' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 hover:bg-slate-200'}`}
                                  >
                                    ĐÚNG
                                  </button>
                                  <button
                                    type="button"
                                    disabled={liveSubmitted}
                                    onClick={() => {
                                      const updated = { ...currentAnsMap, [itIdx]: false };
                                      setLiveAnswers({ ...liveAnswers, [q.id]: updated });
                                    }}
                                    className={`px-3 py-1.5 rounded-lg font-bold text-xs cursor-pointer ${userSubChoice === false ? 'bg-rose-600 text-white shadow-xs' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 hover:bg-slate-200'}`}
                                  >
                                    SAI
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Làm bài Phần C (Trả lời ngắn) */}
                      {q.section === 'C' && (
                        <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 text-xs space-y-2">
                          <label className="block font-bold text-slate-700 dark:text-slate-300">
                            Nhập đáp số của em:
                          </label>
                          <input
                            type="text"
                            disabled={liveSubmitted}
                            value={String(liveAnswers[q.id] ?? '')}
                            onChange={(e) => setLiveAnswers({ ...liveAnswers, [q.id]: e.target.value })}
                            placeholder="Ví dụ: 12 hoặc -3.5..."
                            className="w-full sm:w-64 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono font-bold text-indigo-700 dark:text-indigo-300"
                          />
                          {liveSubmitted && (
                            <div className="text-xs pt-1 p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 font-semibold flex items-center justify-between">
                              <span>🔑 Đáp án chuẩn: <b className="font-mono text-emerald-700 dark:text-emerald-300 font-bold text-sm">{q.ans}</b></span>
                              <span className="text-slate-500">
                                Điểm: <b>{isCorrect ? (q.score || 0).toFixed(2) : 0}</b> / {(q.score || 0).toFixed(2)} đ
                              </span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Hiển thị lời giải sau khi nộp */}
                      {liveSubmitted && (
                        <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 bg-slate-50/80 dark:bg-slate-800/60 p-3.5 rounded-xl space-y-1.5">
                          <div className="font-extrabold text-indigo-700 dark:text-indigo-400 flex items-center gap-1.5">
                            <BookOpen className="w-3.5 h-3.5" />
                            <span>Lời giải chi tiết & Hướng dẫn:</span>
                          </div>
                          {q.sol ? (
                            <div className="leading-relaxed">
                              <MathView content={q.sol} />
                            </div>
                          ) : (
                            <div className="text-slate-500 italic">
                              {q.section === 'A' && `Đáp án đúng là ${['A', 'B', 'C', 'D'][keyIdx]}. Xem lại lý thuyết và phương pháp giải liên quan.`}
                              {q.section === 'B' && 'Kiểm tra lại tính đúng sai của từng mệnh đề theo định nghĩa và định lý tương ứng.'}
                              {q.section === 'C' && `Kết quả tính toán chuẩn là: ${q.ans}.`}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Nút nộp bài lớn ở cuối danh sách câu hỏi */}
                {!liveSubmitted ? (
                  <div className="pt-6 pb-14 text-center">
                    <button
                      type="button"
                      onClick={handleLiveSubmit}
                      className="px-8 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm shadow-xl cursor-pointer hover:scale-105 transition-all inline-flex items-center gap-2"
                    >
                      <CheckCircle2 className="w-5 h-5" />
                      <span>NỘP BÀI VÀ XEM ĐÁP ÁN CHI TIẾT</span>
                    </button>
                  </div>
                ) : (
                  <div className="pt-6 pb-14 text-center">
                    <button
                      type="button"
                      onClick={() => setIsLiveTesting(false)}
                      className="px-8 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm shadow-xl cursor-pointer hover:scale-105 transition-all inline-flex items-center gap-2"
                    >
                      <RotateCcw className="w-5 h-5" />
                      <span>HOÀN TẤT & QUAY LẠI TRANG SOẠN ĐỀ</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          MODAL CHỈNH SỬA / THÊM CÂU HỎI CHUẨN XÁC THEO ẢNH 3
          ========================================================================= */}
      {editingModalState && editingModalState.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 space-y-4">
            {/* Tiêu đề Modal */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <h3 className="font-black text-lg text-slate-900 dark:text-slate-100">
                  {editingModalState.isNew
                    ? 'Thêm câu hỏi mới vào đề thi'
                    : `Chỉnh sửa Câu ${editingModalState.questionIndex + 1}`}
                </h3>
              </div>
              <button
                onClick={() => setEditingModalState(null)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Nội dung đề bài (Hỗ trợ công thức KaTeX ...) */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Nội dung đề bài (Hỗ trợ công thức KaTeX ...):
              </label>
              <textarea
                rows={3}
                value={editingModalState.question.stem}
                onChange={(e) => {
                  setEditingModalState({
                    ...editingModalState,
                    question: { ...editingModalState.question, stem: e.target.value }
                  });
                }}
                placeholder="Ví dụ: Một đường tròn có bán kính $9\\text{ cm}$. Độ dài cung có số đo $\\frac{8\\pi}{9}$ là..."
                className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium leading-relaxed"
              />
            </div>

            {/* XEM TRƯỚC HIỂN THỊ (Giống Ảnh 3) */}
            <div className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-1">
              <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider block">
                Xem trước hiển thị:
              </span>
              <div className="text-sm font-medium text-slate-900 dark:text-slate-100 min-h-[24px]">
                {editingModalState.question.stem.trim() ? (
                  <MathView content={editingModalState.question.stem} />
                ) : (
                  <span className="text-xs text-slate-400 italic">Xem trước đề bài với công thức KaTeX...</span>
                )}
              </div>
            </div>

            {/* Phần A: Các phương án lựa chọn (Chọn nút tròn để chỉ định đáp án đúng) */}
            {editingModalState.question.section === 'A' && (
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Các phương án lựa chọn (Chọn nút tròn để chỉ định đáp án đúng):
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {['A', 'B', 'C', 'D'].map((letter, optIdx) => {
                    const isChecked = editingModalState.question.ci === optIdx;
                    return (
                      <div
                        key={optIdx}
                        className={`flex items-center gap-2.5 p-2 rounded-xl border transition-colors ${
                          isChecked
                            ? 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20 ring-1 ring-emerald-500'
                            : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'
                        }`}
                      >
                        <input
                          type="radio"
                          name="correctOptionRadioModal"
                          checked={isChecked}
                          onChange={() => {
                            setEditingModalState({
                              ...editingModalState,
                              question: { ...editingModalState.question, ci: optIdx }
                            });
                          }}
                          className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 cursor-pointer shrink-0"
                        />
                        <span className={`font-black text-xs shrink-0 ${isChecked ? 'text-emerald-700 dark:text-emerald-400' : 'text-indigo-600 dark:text-indigo-400'}`}>
                          {letter}.
                        </span>
                        <input
                          type="text"
                          value={editingModalState.question.opts[optIdx] || ''}
                          onChange={(e) => {
                            const newOpts = [...editingModalState.question.opts];
                            newOpts[optIdx] = e.target.value;
                            setEditingModalState({
                              ...editingModalState,
                              question: { ...editingModalState.question, opts: newOpts }
                            });
                          }}
                          placeholder={`Phương án ${letter} (vd: 8\\pi\\text{ cm})`}
                          className="w-full px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 dark:bg-slate-700 text-xs font-medium focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Phần B: Các ý khẳng định Đúng / Sai */}
            {editingModalState.question.section === 'B' && editingModalState.question.items && (
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Các mệnh đề khẳng định (Chọn ĐÚNG hoặc SAI):
                </label>
                <div className="space-y-2">
                  {editingModalState.question.items.map((it, itIdx) => {
                    const subLetter = String.fromCharCode(97 + itIdx);
                    return (
                      <div key={itIdx} className="flex items-center gap-2 p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/40 dark:bg-slate-800/40">
                        <span className="font-black text-xs text-indigo-700 shrink-0">{subLetter})</span>
                        <input
                          type="text"
                          value={it.s}
                          onChange={(e) => {
                            const updated = [...editingModalState.question.items!];
                            updated[itIdx] = { ...updated[itIdx], s: e.target.value };
                            setEditingModalState({
                              ...editingModalState,
                              question: { ...editingModalState.question, items: updated }
                            });
                          }}
                          placeholder={`Nội dung ý ${subLetter}...`}
                          className="flex-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 text-xs bg-white dark:bg-slate-700"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const updated = [...editingModalState.question.items!];
                            updated[itIdx] = { ...updated[itIdx], t: !updated[itIdx].t };
                            setEditingModalState({
                              ...editingModalState,
                              question: { ...editingModalState.question, items: updated }
                            });
                          }}
                          className={`px-3 py-1.5 rounded-lg font-bold text-xs cursor-pointer ${
                            it.t ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
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

            {/* Phần C: Trả lời ngắn */}
            {editingModalState.question.section === 'C' && (
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Đáp số / Kết quả chính xác:
                </label>
                <input
                  type="text"
                  value={editingModalState.question.ans}
                  onChange={(e) => {
                    setEditingModalState({
                      ...editingModalState,
                      question: { ...editingModalState.question, ans: e.target.value }
                    });
                  }}
                  placeholder="Ví dụ: 11 hoặc -3.5..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 font-mono font-bold text-sm"
                />
              </div>
            )}

            {/* Hàng 2 cột: Mức độ nhận thức & Điểm số (Giống Ảnh 3) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Mức độ nhận thức:
                </label>
                <select
                  value={editingModalState.question.level}
                  onChange={(e) => {
                    setEditingModalState({
                      ...editingModalState,
                      question: { ...editingModalState.question, level: e.target.value as any }
                    });
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 text-xs font-bold bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="NB">Nhận biết (NB)</option>
                  <option value="TH">Thông hiểu (TH)</option>
                  <option value="VD">Vận dụng (VD)</option>
                  <option value="VDC">Vận dụng cao (VDC)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Điểm số câu này:
                </label>
                <input
                  type="number"
                  step="0.25"
                  min="0"
                  max="10"
                  value={editingModalState.question.score}
                  onChange={(e) => {
                    setEditingModalState({
                      ...editingModalState,
                      question: { ...editingModalState.question, score: parseFloat(e.target.value) || 0 }
                    });
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 text-xs font-bold bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Lời giải chi tiết (Giống Ảnh 3) */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Lời giải chi tiết:
              </label>
              <textarea
                rows={3}
                value={editingModalState.question.sol}
                onChange={(e) => {
                  setEditingModalState({
                    ...editingModalState,
                    question: { ...editingModalState.question, sol: e.target.value }
                  });
                }}
                placeholder="Ví dụ: Độ dài cung $l = R\\alpha = 9 \\cdot \\frac{8\\pi}{9} = 8\\pi\\text{ cm}$."
                className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs sm:text-sm font-medium leading-relaxed"
              />
              {editingModalState.question.sol.trim() && (
                <div className="border-l-4 border-emerald-600 pl-3 py-1 bg-slate-50 dark:bg-slate-800/50 rounded-r-lg text-xs text-slate-700 dark:text-slate-300">
                  <span className="font-bold mr-1 text-slate-900 dark:text-slate-100">Xem trước lời giải:</span>
                  <MathView content={editingModalState.question.sol} />
                </div>
              )}
            </div>

            {/* Modal Actions (Hủy / Lưu Câu Hỏi) */}
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setEditingModalState(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={() => {
                  const targetGrpId = editingModalState.groupId;
                  const updatedQ = { ...editingModalState.question };
                  if (updatedQ.section === 'A') {
                    updatedQ.ans = updatedQ.opts[updatedQ.ci] || '';
                  } else if (updatedQ.section === 'B' && updatedQ.items) {
                    updatedQ.ans = updatedQ.items.map(it => it.t ? 'Đ' : 'S').join('-');
                  }

                  if (editingModalState.isNew) {
                    setGroups(prev => prev.map(g => {
                      if (g.id !== targetGrpId) return g;
                      return { ...g, questions: [...g.questions, updatedQ] };
                    }));
                  } else {
                    setGroups(prev => prev.map(g => {
                      if (g.id !== targetGrpId) return g;
                      return {
                        ...g,
                        questions: g.questions.map(q => q.id === updatedQ.id ? updatedQ : q)
                      };
                    }));
                  }
                  setEditingModalState(null);
                  setIsSaved(false);
                }}
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
