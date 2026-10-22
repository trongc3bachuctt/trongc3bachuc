import React, { useState } from 'react';
import {
  BookOpen,
  TrendingUp,
  Box,
  Zap,
  ClipboardCheck,
  Search,
  RefreshCw,
  Award,
  ChevronRight,
  MessageCircle,
  X,
  Send,
  Settings,
  Sparkles,
} from 'lucide-react';
import { NavTab } from './Navbar';
import { InteractiveGraph } from './InteractiveGraph';

interface HomeViewProps {
  onNavigate: (tab: NavTab) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ onNavigate }) => {
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactSent, setContactSent] = useState(false);
  const [contactForm, setContactForm] = useState({ name: '', phone: '', message: '' });

  const stats = [
    { count: '79', label: 'bài học lý thuyết' },
    { count: '1190', label: 'dạng toán tự sinh' },
    { count: '68', label: 'bài toán thực tiễn' },
    { count: '4', label: 'loại câu hỏi' },
  ];

  const features = [
    {
      icon: Search,
      title: 'Tra cứu lý thuyết và đồ thị',
      desc: 'Mỗi bài có công thức cốt lõi, hình vẽ trực quan, bảng biến thiên và đồ thị hàm số động.',
      actionTab: 'grade12' as NavTab,
    },
    {
      icon: RefreshCw,
      title: 'Luyện dạng toán không trùng lặp',
      desc: 'Ví dụ mẫu tự đổi số mỗi lần sinh, đầy đủ 4 loại câu: trắc nghiệm, đúng/sai, trả lời ngắn, tự luận.',
      actionTab: 'grade11' as NavTab,
    },
    {
      icon: Zap,
      title: 'Giải toán thực tiễn đời sống',
      desc: 'Lãi suất ngân hàng, tối ưu hoá chi phí, chuyển động vật rơi, xác suất xét nghiệm y tế và đo đạc.',
      actionTab: 'practical' as NavTab,
    },
    {
      icon: ClipboardCheck,
      title: 'Làm đề kiểm tra tự chấm',
      desc: 'Giữa kì, cuối kì, luyện tập theo chương, ôn thi tốt nghiệp THPT — cấu trúc chuẩn 2025 Bộ GD&ĐT.',
      actionTab: 'exam' as NavTab,
    },
    {
      icon: Sparkles,
      title: 'Đề Tự Sinh từ Đề Mẫu của Thầy',
      desc: 'Thầy đưa đề mẫu lên, học sinh làm đề mẫu và bấm "Sinh Đề" để sinh các đề tương tự đổi số liệu và phương án.',
      actionTab: 'autoexam' as NavTab,
    },
  ];

  const grades = [
    {
      id: 'grade10' as NavTab,
      badge: 'Khối 10',
      title: 'Toán 10 – Kết nối tri thức',
      desc: 'Mệnh đề, tập hợp, hệ thức lượng trong tam giác, vectơ, hàm số bậc hai, đại số tổ hợp và xác suất.',
      color: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    },
    {
      id: 'grade11' as NavTab,
      badge: 'Khối 11',
      title: 'Toán 11 – Kết nối tri thức',
      desc: 'Hàm số lượng giác, cấp số cộng - nhân, giới hạn, đạo hàm và ý nghĩa vật lý chuyển động tức thời.',
      color: 'bg-sky-50 text-sky-800 border-sky-200',
    },
    {
      id: 'grade12' as NavTab,
      badge: 'Khối 12',
      title: 'Toán 12 – Kết nối tri thức',
      desc: 'Khảo sát và vẽ đồ thị hàm số, toạ độ không gian Oxyz, nguyên hàm - tích phân và xác suất có điều kiện.',
      color: 'bg-teal-50 text-teal-800 border-teal-200',
    },
  ];

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setContactSent(true);
    setTimeout(() => {
      setContactSent(false);
      setShowContactModal(false);
      setContactForm({ name: '', phone: '', message: '' });
    }, 1800);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Banner matching screenshot 1 */}
      <section className="relative rounded-2xl overflow-hidden math-chalkboard-bg text-white shadow-xl border border-teal-900/40">
        <div className="absolute inset-0 bg-radial from-transparent to-teal-950/70 pointer-events-none" />

        <div className="relative p-6 sm:p-10 lg:p-12 flex flex-col lg:flex-row items-center gap-8 justify-between">
          {/* Left Text */}
          <div className="max-w-xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-900/80 border border-teal-600/50 text-teal-200 text-xs font-semibold">
              <span>Toán 10 · 11 · 12 – Kết nối tri thức</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
              Dạy học <br />
              <span className="text-amber-400">Toán Trần Trọng</span>
            </h1>

            <p className="text-slate-200 text-sm sm:text-base leading-relaxed">
              Lý thuyết có đồ thị, dạng toán tự đổi số mỗi lần bấm, lời giải chi tiết — học mọi lúc, luyện không trùng lặp.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => onNavigate('grade12')}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md transition-all cursor-pointer"
              >
                <BookOpen className="w-4 h-4 text-slate-950" />
                <span>Bắt đầu học</span>
              </button>

              <button
                onClick={() => setShowContactModal(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm bg-teal-950/80 hover:bg-teal-900 text-white border border-teal-600/60 transition-all cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 text-teal-300" />
                <span>Nhắn tin cho thầy</span>
              </button>

              <button
                onClick={() => onNavigate('admin')}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 shadow-md transition-all cursor-pointer"
                title="Trung tâm Quản trị & Biên tập nội dung bài học trực tiếp (AdminView)"
              >
                <Settings className="w-4 h-4 text-slate-950" />
                <span>Trung tâm Quản trị & Biên tập (AdminView)</span>
              </button>
            </div>
          </div>

          {/* Right Hero Graph visual matching screenshot 1 */}
          <div className="w-full lg:w-[420px] shrink-0">
            <InteractiveGraph initialType="cubic" />
          </div>
        </div>
      </section>

      {/* Stats Counter Strip matching screenshot 1 */}
      <section className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
        <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-slate-100 text-center">
          {stats.map((s, idx) => (
            <div key={idx} className="p-3">
              <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-mono tracking-tight">
                {s.count}
              </div>
              <div className="text-xs text-slate-500 font-medium mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Banner Trung tâm Quản trị & Biên tập nội dung bài học trực tiếp */}
      <section className="bg-gradient-to-r from-teal-950 via-slate-900 to-emerald-950 text-white rounded-2xl p-5 sm:p-6 shadow-md border border-teal-700/50 flex flex-col sm:flex-row items-center justify-between gap-5">
        <div className="space-y-1.5 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-xs font-bold border border-amber-400/30">
            <Settings className="w-3.5 h-3.5 animate-spin" />
            <span>Dành cho Quản trị viên & Giáo viên</span>
          </div>
          <h2 className="text-lg sm:text-xl font-extrabold text-white">
            Trung tâm Quản trị & Biên tập nội dung bài học trực tiếp (AdminView)
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
            Công cụ chỉnh sửa trực tiếp công thức cốt lõi, tóm tắt lý thuyết, bổ sung mục tùy ý, dạng toán và bộ câu hỏi trắc nghiệm của từng bài học Toán 10, 11, 12 với khả năng lưu trữ tức thì và sao lưu dữ liệu.
          </p>
        </div>
        <button
          onClick={() => onNavigate('admin')}
          className="shrink-0 inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs sm:text-sm shadow-md transition-all cursor-pointer hover:scale-105"
        >
          <Settings className="w-4 h-4 text-slate-950" />
          <span>Vào trang Quản trị (AdminView)</span>
        </button>
      </section>

      {/* 4 Feature Cards: "Học sinh dùng trang này để" */}
      <section className="space-y-4">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Học sinh dùng trang này để
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {features.map((f, idx) => {
            const Icon = f.icon;
            return (
              <div
                key={idx}
                onClick={() => onNavigate(f.actionTab)}
                className="p-5 bg-white rounded-xl border border-slate-200 hover:border-teal-600/60 hover:shadow-md transition-all cursor-pointer group flex items-start gap-4"
              >
                <div className="p-2.5 rounded-xl bg-teal-50 text-teal-800 group-hover:bg-teal-800 group-hover:text-white transition-colors shrink-0">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-slate-900 group-hover:text-teal-900 text-base flex items-center justify-between">
                    <span>{f.title}</span>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Grade Quick Jump Sections */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Chương trình Toán THPT Kết nối tri thức
          </h2>
          <span className="text-xs text-slate-500">Chuẩn chương trình GDPT 2018</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {grades.map((g) => (
            <div
              key={g.id}
              onClick={() => onNavigate(g.id)}
              className="bg-white rounded-xl p-5 border border-slate-200 hover:border-teal-700 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div className="space-y-3">
                <span className={`inline-block px-2.5 py-0.5 rounded text-xs font-bold border ${g.color}`}>
                  {g.badge}
                </span>
                <h3 className="font-bold text-slate-900 text-lg group-hover:text-teal-800 transition-colors">
                  {g.title}
                </h3>
                <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">{g.desc}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-teal-800">
                <span>Vào học chương trình</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Exam CTA Box */}
      <section className="bg-gradient-to-r from-teal-900 to-emerald-900 rounded-2xl p-6 sm:p-8 text-white shadow-lg flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="flex items-center gap-2 text-amber-300 text-xs font-semibold uppercase tracking-wider">
            <Award className="w-4 h-4" />
            <span>Kỳ thi THPT Quốc Gia & Kiểm tra định kỳ</span>
          </div>
          <h3 className="text-2xl font-bold tracking-tight">
            Bộ đề kiểm tra tự sinh ma trận 2025
          </h3>
          <p className="text-sm text-teal-100">
            Tự động chấm điểm Phần I (12 TN), Phần II (4 Đ/S) và Phần III (6 Trả lời ngắn). Có đồng hồ đếm ngược và xuất bản in A4 tiêu chuẩn.
          </p>
        </div>

        <button
          onClick={() => onNavigate('exam')}
          className="px-6 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-sm shadow-md transition-all shrink-0 cursor-pointer"
        >
          Làm đề kiểm tra ngay
        </button>
      </section>

      {/* Contact Modal */}
      {showContactModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-teal-800" />
                <h3 className="font-bold text-slate-900 text-base">Gửi câu hỏi / Nhắn tin cho thầy</h3>
              </div>
              <button
                onClick={() => setShowContactModal(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {contactSent ? (
              <div className="py-8 text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center font-bold text-xl">
                  ✓
                </div>
                <p className="font-bold text-slate-900">Đã gửi tin nhắn thành công!</p>
                <p className="text-xs text-slate-500">Thầy Trần Trọng sẽ sớm phản hồi cho bạn.</p>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="space-y-3.5 text-sm">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Họ và tên của bạn:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: Nguyễn Văn An"
                    value={contactForm.name}
                    onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-teal-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Số điện thoại / Zalo (để nhận phản hồi):
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: 0912 345 678"
                    value={contactForm.phone}
                    onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-teal-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nội dung thắc mắc / Bài toán cần hỗ trợ:
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Nhập nội dung bài toán hoặc câu hỏi..."
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-teal-700"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowContactModal(false)}
                    className="px-4 py-2 text-xs font-medium rounded-lg text-slate-600 hover:bg-slate-100"
                  >
                    Huỷ
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg bg-teal-800 text-white hover:bg-teal-900"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Gửi tin nhắn</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
