import React, { useState } from 'react';
import { Navbar, NavTab } from './components/Navbar';
import { HomeView } from './components/HomeView';
import { CurriculumView } from './components/CurriculumView';
import { PracticalView } from './components/PracticalView';
import { ExamView } from './components/ExamView';
import { AutoExamView } from './components/AutoExamView';
import { WeeklyChallengeModal } from './components/WeeklyChallengeModal';
import { DocumentsView } from './components/DocumentsView';
import { AIAssistantModal } from './components/AIAssistantModal';
import { AdminView } from './components/AdminView';
import { Casio880Calculator } from './components/Casio880Calculator';
import { TaoDeThiView } from './components/TaoDeThiView';
import { GradeLevel } from './types';
import { GraduationCap, Phone, MapPin, Sparkles, Settings } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [showAIModal, setShowAIModal] = useState<boolean>(false);
  const [aiTopic, setAiTopic] = useState<string>('Khảo sát hàm số & Cực trị');
  const [aiQuestionToMutate, setAiQuestionToMutate] = useState<string>('');

  const [adminTarget, setAdminTarget] = useState<{
    grade: GradeLevel;
    chapterId?: string;
    lessonId?: string;
  }>({ grade: '12' });

  const handleOpenAIAssistant = (topic?: string, question?: string) => {
    if (topic) setAiTopic(topic);
    if (question) setAiQuestionToMutate(question);
    setShowAIModal(true);
  };

  const handleNavigateToAdmin = (grade: GradeLevel, chapterId?: string, lessonId?: string) => {
    setAdminTarget({ grade, chapterId, lessonId });
    setActiveTab('admin');
  };

  const handleNavigateFromAdminToLesson = (grade: GradeLevel, chapterId: string, lessonId: string) => {
    setActiveTab(grade === '10' ? 'grade10' : grade === '11' ? 'grade11' : 'grade12');
  };

  React.useEffect(() => {
    (window as any).switchAppTab = (tab: NavTab) => setActiveTab(tab);
  }, []);

  return (
    <div className="min-h-screen math-grid-bg text-slate-800 flex flex-col selection:bg-teal-700 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenAIModal={() => setShowAIModal(true)}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        {activeTab === 'home' && <HomeView onNavigate={setActiveTab} />}

        {activeTab === 'grade10' && (
          <CurriculumView
            grade="10"
            onNavigateToExam={() => setActiveTab('exam')}
            onOpenAIModal={handleOpenAIAssistant}
            onNavigateToAdmin={handleNavigateToAdmin}
          />
        )}

        {activeTab === 'grade11' && (
          <CurriculumView
            grade="11"
            onNavigateToExam={() => setActiveTab('exam')}
            onOpenAIModal={handleOpenAIAssistant}
            onNavigateToAdmin={handleNavigateToAdmin}
          />
        )}

        {activeTab === 'grade12' && (
          <CurriculumView
            grade="12"
            onNavigateToExam={() => setActiveTab('exam')}
            onOpenAIModal={handleOpenAIAssistant}
            onNavigateToAdmin={handleNavigateToAdmin}
          />
        )}

        {activeTab === 'practical' && <PracticalView />}

        {activeTab === 'exam' && <ExamView />}

        {activeTab === 'autoexam' && <AutoExamView />}

        {activeTab === 'taodethi' && (
          <div className="-mx-4 sm:-mx-6 lg:-mx-8 -mt-6 sm:-mt-8">
            <TaoDeThiView
              onRunExamOnWeb={(exam) => {
                setActiveTab('autoexam');
              }}
              onBackToMain={() => setActiveTab('home')}
            />
          </div>
        )}

        {activeTab === 'weekly' && <WeeklyChallengeModal />}

        {activeTab === 'documents' && <DocumentsView />}

        {activeTab === 'calc880' && <Casio880Calculator />}

        {activeTab === 'admin' && (
          <AdminView
            initialGrade={adminTarget.grade}
            initialChapterId={adminTarget.chapterId}
            initialLessonId={adminTarget.lessonId}
            onNavigateToLesson={handleNavigateFromAdminToLesson}
          />
        )}
      </main>


      {/* Floating AI Assistant Button */}
      <div className="fixed bottom-6 right-6 z-40 no-print">
        <button
          onClick={() => setShowAIModal(true)}
          className="flex items-center gap-2 px-4 py-3 rounded-full bg-teal-800 hover:bg-teal-900 text-white font-bold text-xs sm:text-sm shadow-xl hover:shadow-2xl hover:scale-105 transition-all cursor-pointer border border-teal-700"
          title="Trợ lý AI tự sinh và đổi bài toán"
        >
          <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
          <span>Trợ lý AI Toán học</span>
        </button>
      </div>

      {/* AI Assistant Modal */}
      <AIAssistantModal
        isOpen={showAIModal}
        onClose={() => setShowAIModal(false)}
        defaultTopic={aiTopic}
        questionToMutate={aiQuestionToMutate}
      />

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 py-10 mt-12 border-t border-slate-800 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8 text-xs sm:text-sm">
          {/* Col 1: Brand & Teacher */}
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-xs">
                TT
              </div>
              <span className="text-base font-bold text-white tracking-tight">
                Dạy học Toán Trần Trọng
              </span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed max-w-md">
              Hệ thống học tập, tra cứu lý thuyết trực quan và luyện thi Toán THPT bám sát chương trình sách Kết nối tri thức với cuộc sống. Ngân hàng đề thi tự sinh ma trận 2025 với lời giải chi tiết và tự động chấm điểm.
            </p>
            <div className="text-xs text-slate-400 space-y-1.5 pt-1">
              <p className="flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-teal-400" />
                <span>Giáo viên phụ trách: <b>Thầy Trần Trọng</b></span>
              </p>
              <p className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-teal-400" />
                <span>Số điện thoại liên hệ: <a href="tel:0937869586" className="phone-highlight">0937.86.95.86</a></span>
              </p>
              <p className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-teal-400" />
                <span>Địa chỉ: <b>Tổ 1 - Thanh Lương - Xã Ba Chúc - An Giang</b> (Trường THPT Ba Chúc)</span>
              </p>
            </div>
          </div>

          {/* Col 2: Chương trình học */}
          <div className="space-y-2">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider">
              Khối lớp & Chuyên đề
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-400">
              <li>
                <button
                  onClick={() => setActiveTab('grade10')}
                  className="hover:text-teal-300 transition-colors cursor-pointer"
                >
                  Toán 10 (Mệnh đề, Vectơ, Tổ hợp)
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('grade11')}
                  className="hover:text-teal-300 transition-colors cursor-pointer"
                >
                  Toán 11 (Lượng giác, Đạo hàm, Cấp số)
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('grade12')}
                  className="hover:text-teal-300 transition-colors cursor-pointer"
                >
                  Toán 12 (Khảo sát hàm số, Oxyz, Tích phân)
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('practical')}
                  className="hover:text-teal-300 transition-colors cursor-pointer"
                >
                  Toán thực tiễn & Tối ưu hoá
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Đề thi & Tiện ích AI */}
          <div className="space-y-2">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider">
              Thi thử & Trợ lý AI
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-400">
              <li>
                <button
                  onClick={() => setActiveTab('exam')}
                  className="hover:text-teal-300 transition-colors cursor-pointer"
                >
                  Đề kiểm tra tự sinh ma trận 2025
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('autoexam')}
                  className="hover:text-amber-300 text-teal-300 font-semibold transition-colors cursor-pointer flex items-center gap-1"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Đề Tự Sinh từ Đề Mẫu (Mới)</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => setShowAIModal(true)}
                  className="text-amber-400 font-semibold hover:text-amber-300 transition-colors cursor-pointer flex items-center gap-1"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Trợ lý AI sinh & đổi bài toán</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('weekly')}
                  className="hover:text-teal-300 transition-colors cursor-pointer"
                >
                  Bài toán thử thách tuần
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('documents')}
                  className="hover:text-teal-300 transition-colors cursor-pointer"
                >
                  Sổ tay công thức & Tài liệu PDF
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('admin')}
                  className="text-teal-400 font-semibold hover:text-teal-300 transition-colors cursor-pointer flex items-center gap-1"
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>Quản trị & Biên tập nội dung bài học</span>
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 pt-4 border-t border-slate-800 text-center text-[11px] text-slate-500">
          © 2026 Dạy học Toán Trần Trọng · Trường THPT Ba Chúc, An Giang. Phát triển phục vụ học sinh và giáo viên ôn thi môn Toán.
        </div>
      </footer>
    </div>
  );
}
