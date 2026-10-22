import React, { useState } from 'react';
import {
  Home,
  BookOpen,
  TrendingUp,
  Box,
  Zap,
  ClipboardCheck,
  Sparkles,
  Trophy,
  FolderArchive,
  Lock,
  X,
  Menu,
  Settings,
  Calculator,
  FileText,
} from 'lucide-react';
import { GradeLevel } from '../types';

export type NavTab = 'home' | 'grade10' | 'grade11' | 'grade12' | 'practical' | 'exam' | 'autoexam' | 'taodethi' | 'weekly' | 'documents' | 'calc880' | 'admin';

interface NavbarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onSelectGrade?: (grade: GradeLevel) => void;
  onOpenAIModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, onSelectTab, onOpenAIModal }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems: { id: NavTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'home', label: 'Trang chủ', icon: Home },
    { id: 'grade10', label: 'Toán 10', icon: BookOpen },
    { id: 'grade11', label: 'Toán 11', icon: TrendingUp },
    { id: 'grade12', label: 'Toán 12', icon: Box },
    { id: 'practical', label: 'Toán thực tiễn', icon: Zap },
    { id: 'exam', label: 'Đề kiểm tra', icon: ClipboardCheck },
    { id: 'autoexam', label: 'Đề Tự Sinh', icon: Sparkles },
    { id: 'taodethi', label: 'Tạo đề từ Word', icon: FileText },
    { id: 'weekly', label: 'Bài toán tuần', icon: Trophy },
    { id: 'documents', label: 'Tài liệu', icon: FolderArchive },
    { id: 'calc880', label: 'Máy Tính 880 Plus', icon: Calculator },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-xs no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
          {/* Logo Brand */}
          <div
            onClick={() => onSelectTab('home')}
            className="flex items-center gap-2.5 cursor-pointer select-none shrink-0"
          >
            <div className="w-10 h-10 rounded-full bg-teal-800 text-white flex items-center justify-center font-bold text-sm tracking-wider shadow-sm border border-teal-900">
              TT
            </div>
            <div>
              <span className="text-lg font-bold text-slate-900 tracking-tight block leading-tight">
                Dạy học Toán Trần Trọng
              </span>
              <span className="text-[11px] text-teal-800 font-semibold block">
                THPT Ba Chúc, An Giang
              </span>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden xl:flex items-center gap-1 overflow-x-auto py-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs 2xl:text-sm font-medium transition-all whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-teal-800 text-white shadow-xs font-bold'
                      : 'text-slate-700 hover:text-teal-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 2xl:w-4 2xl:h-4 ${isActive ? 'text-teal-200' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2 shrink-0">
            {onOpenAIModal && (
              <button
                onClick={onOpenAIModal}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#0F6B55] hover:bg-[#0B5563] text-white shadow-xs transition-all cursor-pointer"
                title="Trợ lý AI tự sinh và đổi câu hỏi"
              >
                <Zap className="w-3.5 h-3.5 fill-white text-white" />
                <span>Trợ lý AI</span>
              </button>
            )}

            {/* 1 nút Quản Trị (AdminView) màu xanh giống nút Trợ Lý AI */}
            <button
              onClick={() => onSelectTab('admin')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer shadow-xs ${
                activeTab === 'admin'
                  ? 'bg-[#0B5563] text-white ring-2 ring-teal-400'
                  : 'bg-[#0F6B55] hover:bg-[#0B5563] text-white'
              }`}
              title="Quản Trị (AdminView)"
            >
              <Settings className={`w-3.5 h-3.5 text-white ${activeTab === 'admin' ? 'animate-spin' : ''}`} />
              <span>Quản Trị (AdminView)</span>
            </button>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="xl:hidden border-t border-slate-200 bg-white px-4 py-3 shadow-lg space-y-2">
            {/* Mobile Admin Button */}
            <button
              onClick={() => {
                onSelectTab('admin');
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-[#0F6B55] hover:bg-[#0B5563] text-white font-bold text-sm shadow-md cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-white" />
                <span>Quản Trị (AdminView)</span>
              </div>
            </button>

            <div className="grid grid-cols-2 gap-1.5">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onSelectTab(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left ${
                      isActive
                        ? 'bg-teal-800 text-white font-semibold'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </button>
                );
              })}

              <button
                onClick={() => {
                  onSelectTab('admin');
                  setMobileMenuOpen(false);
                }}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left ${
                  activeTab === 'admin'
                    ? 'bg-teal-800 text-white font-semibold'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Settings className="w-4 h-4" />
                <span>Quản trị</span>
              </button>
            </div>
          </div>
        )}
      </header>
    </>
  );
};
