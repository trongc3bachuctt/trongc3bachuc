import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  RotateCcw,
  CheckSquare,
  Eye,
  Printer,
  Clock,
  Award,
  AlertCircle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  FileText,
  ChevronDown,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  ExamQuestionPart1,
  ExamQuestionPart2,
  ExamQuestionPart3,
  ExamScoreReport,
  ExamSubmission,
  GeneratedExam,
  GradeLevel,
} from '../types';
import { generateExam, gradeExam } from '../utils/mathGenerator';
import { MathView } from './MathView';

export const ExamView: React.FC = () => {
  // Config state
  const [grade, setGrade] = useState<GradeLevel>('12');
  const [examType, setExamType] = useState<
    'Giữa học kì I' | 'Cuối học kì I' | 'Giữa học kì II' | 'Cuối học kì II' | 'Ôn tốt nghiệp'
  >('Giữa học kì I');
  const [schoolName, setSchoolName] = useState<string>('Trường THPT Ba Chúc, An Giang');

  // Exam instance
  const [exam, setExam] = useState<GeneratedExam>(() =>
    generateExam('12', 'Giữa học kì I', 'Trường THPT Ba Chúc, An Giang')
  );

  // User answers
  const [submission, setSubmission] = useState<ExamSubmission>({
    part1Answers: {},
    part2Answers: {},
    part3Answers: {},
  });

  // Timer state
  const [timeRemaining, setTimeRemaining] = useState<number>(90 * 60); // 90 mins in seconds
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);

  // Grading report
  const [scoreReport, setScoreReport] = useState<ExamScoreReport | null>(null);
  const [showSolutions, setShowSolutions] = useState<boolean>(false);
  const [showReportModal, setShowReportModal] = useState<boolean>(false);

  // Timer interval
  useEffect(() => {
    let timer: any = null;
    if (isTimerRunning && timeRemaining > 0) {
      timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setIsTimerRunning(false);
            handleAutoSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTimerRunning, timeRemaining]);

  // Format time MM:SS
  const formattedTime = useMemo(() => {
    const mins = Math.floor(timeRemaining / 60);
    const secs = timeRemaining % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, [timeRemaining]);

  // Count answered questions
  const totalAnswered = useMemo(() => {
    const p1Count = Object.keys(submission.part1Answers).length;
    let p2Count = 0;
    Object.values(submission.part2Answers).forEach((subs) => {
      if (subs.a !== null || subs.b !== null || subs.c !== null || subs.d !== null) p2Count++;
    });
    const p3Count = Object.values(submission.part3Answers).filter((v) => v.trim() !== '').length;
    return p1Count + p2Count + p3Count;
  }, [submission]);

  // Handlers
  const handleGenerateNewExam = () => {
    const newExam = generateExam(grade, examType, schoolName);
    setExam(newExam);
    setSubmission({
      part1Answers: {},
      part2Answers: {},
      part3Answers: {},
    });
    setScoreReport(null);
    setShowSolutions(false);
    setTimeRemaining(90 * 60);
    setIsTimerRunning(true);
  };

  const handleAutoSubmit = () => {
    const report = gradeExam(exam, submission);
    setScoreReport(report);
    setShowSolutions(true);
    setShowReportModal(true);
    if (report.totalScore >= 8.0) {
      if (typeof window !== 'undefined' && (window as any).triggerFireworks) {
        (window as any).triggerFireworks();
      } else {
        confetti({
          particleCount: 120,
          spread: 90,
          origin: { y: 0.6 },
          colors: ['#fbbf24', '#f59e0b', '#ef4444', '#10b981', '#3b82f6', '#ec4899'],
        });
      }
    }
  };

  const handleManualSubmit = () => {
    setIsTimerRunning(false);
    handleAutoSubmit();
  };

  const handlePrint = () => {
    window.print();
  };

  // Part 1 answer selection
  const handlePart1Select = (questionId: string, optKey: 'A' | 'B' | 'C' | 'D') => {
    setSubmission((prev) => ({
      ...prev,
      part1Answers: { ...prev.part1Answers, [questionId]: optKey },
    }));
  };

  // Part 2 True/False selection
  const handlePart2Select = (questionId: string, subKey: 'a' | 'b' | 'c' | 'd', val: boolean) => {
    setSubmission((prev) => {
      const current = prev.part2Answers[questionId] || { a: null, b: null, c: null, d: null };
      return {
        ...prev,
        part2Answers: {
          ...prev.part2Answers,
          [questionId]: { ...current, [subKey]: val },
        },
      };
    });
  };

  // Part 3 text answer change
  const handlePart3Change = (questionId: string, val: string) => {
    setSubmission((prev) => ({
      ...prev,
      part3Answers: { ...prev.part3Answers, [questionId]: val },
    }));
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Top Configuration Bar matching screenshot 6 */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4 no-print">
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <FileText className="w-6 h-6 text-teal-800" />
          <span>Đề kiểm tra tự sinh</span>
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          {/* Khối */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Khối</label>
            <select
              value={grade}
              onChange={(e) => setGrade(e.target.value as GradeLevel)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-medium focus:outline-teal-700"
            >
              <option value="12">12</option>
              <option value="11">11</option>
              <option value="10">10</option>
            </select>
          </div>

          {/* Loại kiểm tra */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Loại kiểm tra</label>
            <select
              value={examType}
              onChange={(e) => setExamType(e.target.value as any)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-medium focus:outline-teal-700"
            >
              <option value="Giữa học kì I">Giữa học kì I</option>
              <option value="Cuối học kì I">Cuối học kì I</option>
              <option value="Giữa học kì II">Giữa học kì II</option>
              <option value="Cuối học kì II">Cuối học kì II</option>
              <option value="Ôn tốt nghiệp">Ôn tốt nghiệp THPT</option>
            </select>
          </div>

          {/* Cấu trúc */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Cấu trúc</label>
            <select
              disabled
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-slate-100 text-slate-700 font-medium cursor-not-allowed"
            >
              <option>Chuẩn 2025: 12 TN · 4 Đ/S · 6 TLN</option>
            </select>
          </div>
        </div>

        {/* School Name */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">
            Tên trường in trên đề
          </label>
          <input
            type="text"
            value={schoolName}
            onChange={(e) => setSchoolName(e.target.value)}
            className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:outline-teal-700 font-medium text-slate-800"
          />
        </div>

        {/* Action Buttons matching screenshot 6 */}
        <div className="flex flex-wrap items-center gap-2.5 pt-1">
          <button
            onClick={handleGenerateNewExam}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-800 hover:bg-teal-900 text-white font-semibold text-xs sm:text-sm shadow-xs transition-all cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Tạo đề mới</span>
          </button>

          <button
            onClick={handleManualSubmit}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs sm:text-sm shadow-xs transition-all cursor-pointer"
          >
            <CheckSquare className="w-4 h-4" />
            <span>Nộp bài và chấm</span>
          </button>

          <button
            onClick={() => setShowSolutions(!showSolutions)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold text-xs sm:text-sm transition-all cursor-pointer"
          >
            <Eye className="w-4 h-4 text-slate-500" />
            <span>{showSolutions ? 'Ẩn đáp án & Lời giải' : 'Xem đáp án & Lời giải'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold text-xs sm:text-sm transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>In đề thi</span>
          </button>
        </div>

        <p className="text-xs text-slate-500 italic pt-1 border-t border-slate-100">
          Chọn khối, loại kiểm tra rồi bấm &quot;Tạo đề mới&quot;. Mỗi lần tạo là một đề có số liệu khác biệt không trùng lặp.
        </p>
      </div>

      {/* Floating Exam Status Ribbon (Timer & Answer count) */}
      <div className="sticky top-16 z-30 bg-teal-950 text-white p-3.5 rounded-2xl shadow-lg flex flex-wrap items-center justify-between gap-3 border border-teal-800 no-print">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-teal-900 text-amber-300 font-mono font-bold text-sm">
            <Clock className="w-4 h-4 text-amber-400" />
            <span>{formattedTime}</span>
          </div>
          <span className="text-xs text-slate-300 hidden sm:inline">
            Đã làm: <b className="text-white font-mono">{totalAnswered}/22</b> câu
          </span>
        </div>

        <div className="flex items-center gap-2">
          {scoreReport ? (
            <button
              onClick={() => setShowReportModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shadow-xs cursor-pointer"
            >
              <Award className="w-4 h-4" />
              <span>Xem bảng điểm: {scoreReport.totalScore}/10</span>
            </button>
          ) : (
            <button
              onClick={handleManualSubmit}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs cursor-pointer"
            >
              Nộp bài ngay
            </button>
          )}
        </div>
      </div>

      {/* EXAM PAPER CONTAINER (Screen & Print Mode) */}
      <div className="bg-white rounded-2xl p-6 sm:p-10 border border-slate-200/90 shadow-sm space-y-8 print:p-0 print:border-none print:shadow-none">
        {/* Print Header */}
        <div className="border-b-2 border-slate-900 pb-4 text-center space-y-1">
          <div className="flex justify-between items-start text-xs sm:text-sm font-semibold text-slate-800">
            <div>
              <p className="uppercase">{schoolName}</p>
              <p className="text-xs text-slate-500">Mã đề: {exam.id}</p>
            </div>
            <div className="text-right">
              <p className="uppercase font-bold">KỲ KIỂM TRA ĐỊNH KỲ NĂM HỌC 2024 - 2025</p>
              <p className="text-xs text-slate-500">Môn: TOÁN - KHỐI {exam.grade}</p>
            </div>
          </div>

          <h2 className="text-lg sm:text-xl font-extrabold uppercase text-slate-900 pt-2 tracking-wide">
            {exam.title}
          </h2>
          <p className="text-xs text-slate-600">
            Thời gian làm bài: 90 phút (không kể thời gian phát đề) · {exam.structure}
          </p>

          {/* Student Info Box */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 text-xs text-left font-medium border-t border-dashed border-slate-300 mt-2">
            <div>Họ và tên thí sinh: .......................................</div>
            <div>Lớp: ........................</div>
            <div>Số báo danh: ........................</div>
            <div>Phòng thi: ........................</div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* PHẦN I: 12 CÂU TRẮC NGHIỆM NHIỀU LỰA CHỌN (3.0 ĐIỂM) */}
        {/* ======================================================== */}
        <section className="space-y-6">
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <h3 className="font-extrabold text-sm sm:text-base text-teal-900 uppercase">
              PHẦN I. Câu trắc nghiệm nhiều phương án lựa chọn (3,0 điểm)
            </h3>
            <p className="text-xs text-slate-600 mt-0.5">
              Thí sinh trả lời từ câu 1 đến câu 12. Mỗi câu hỏi thí sinh chỉ chọn một phương án. Mỗi câu đúng được 0,25 điểm.
            </p>
          </div>

          <div className="space-y-6">
            {exam.part1Questions.map((q) => {
              const selected = submission.part1Answers[q.id];
              const isSubmitted = scoreReport !== null;
              const isCorrect = selected === q.correctAnswer;

              return (
                <div
                  key={q.id}
                  className="p-4 sm:p-5 rounded-xl border border-slate-200/90 bg-white space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="text-sm sm:text-base font-medium text-slate-900 leading-relaxed">
                      <span className="font-extrabold text-teal-900 mr-1.5">
                        Câu {q.questionNumber}:
                      </span>
                      <MathView text={q.question} />
                    </div>
                  </div>

                  {/* Options A, B, C, D */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    {q.options.map((opt) => {
                      const isOptionSelected = selected === opt.key;
                      const isOptionCorrect = q.correctAnswer === opt.key;

                      let btnStyle = 'bg-white border-slate-200 hover:bg-slate-50 text-slate-800';
                      if (isOptionSelected) {
                        btnStyle = 'bg-teal-50 border-teal-700 text-teal-950 font-semibold ring-1 ring-teal-700';
                      }

                      if (isSubmitted || showSolutions) {
                        if (isOptionCorrect) {
                          btnStyle = 'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold ring-1 ring-emerald-500';
                        } else if (isOptionSelected && !isCorrect) {
                          btnStyle = 'bg-rose-50 border-rose-500 text-rose-950 ring-1 ring-rose-500';
                        }
                      }

                      return (
                        <button
                          key={opt.key}
                          onClick={() => handlePart1Select(q.id, opt.key)}
                          className={`p-3 rounded-xl border text-left text-xs sm:text-sm font-medium transition-all flex items-center gap-3 cursor-pointer ${btnStyle}`}
                        >
                          <span
                            className={`w-6 h-6 rounded-md flex items-center justify-center font-bold text-xs shrink-0 ${
                              isOptionSelected ? 'bg-teal-800 text-white' : 'bg-slate-100 text-slate-700'
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

                  {/* Solution display if enabled */}
                  {(showSolutions || isSubmitted) && (
                    <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-800 space-y-1">
                      <div className="font-bold text-teal-900 flex items-center gap-1.5">
                        <HelpCircle className="w-3.5 h-3.5 text-teal-700" />
                        <span>
                          Đáp án đúng: <b className="text-emerald-700 font-mono">{q.correctAnswer}</b>
                        </span>
                      </div>
                      <div className="text-slate-600 pl-5 leading-relaxed">
                        <MathView text={q.explanation} />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* ======================================================== */}
        {/* PHẦN II: 4 CÂU TRẮC NGHIỆM ĐÚNG/SAI (4.0 ĐIỂM) */}
        {/* ======================================================== */}
        <section className="space-y-6">
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <h3 className="font-extrabold text-sm sm:text-base text-teal-900 uppercase">
              PHẦN II. Câu trắc nghiệm đúng sai (4,0 điểm)
            </h3>
            <p className="text-xs text-slate-600 mt-0.5">
              Thí sinh trả lời từ câu 1 đến câu 4. Trong mỗi ý a), b), c), d) ở mỗi câu, thí sinh chọn Đúng hoặc Sai.
              Thang điểm 2025: Đúng 1 ý: 0,1đ · Đúng 2 ý: 0,25đ · Đúng 3 ý: 0,5đ · Đúng 4 ý: 1,0đ.
            </p>
          </div>

          <div className="space-y-6">
            {exam.part2Questions.map((q) => {
              const qAnswers = submission.part2Answers[q.id] || { a: null, b: null, c: null, d: null };

              return (
                <div
                  key={q.id}
                  className="p-4 sm:p-5 rounded-xl border border-slate-200/90 bg-white space-y-3"
                >
                  <div className="text-sm sm:text-base font-medium text-slate-900 leading-relaxed">
                    <span className="font-extrabold text-teal-900 mr-1.5">
                      Câu {q.questionNumber}:
                    </span>
                    <MathView text={q.stem} />
                  </div>

                  {/* Sub-items table */}
                  <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 text-xs sm:text-sm">
                    {q.subItems.map((sub) => {
                      const userChoice = qAnswers[sub.key];
                      const isCorrect = userChoice === sub.correct;
                      const hasSubmitted = scoreReport !== null;

                      return (
                        <div
                          key={sub.key}
                          className="p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white"
                        >
                          <div className="flex-1 pr-2">
                            <span className="font-bold text-slate-700 mr-2">{sub.key})</span>
                            <MathView text={sub.statement} />
                          </div>

                          {/* Choice radio buttons */}
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              onClick={() => handlePart2Select(q.id, sub.key, true)}
                              className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                                userChoice === true
                                  ? 'bg-emerald-700 text-white shadow-xs'
                                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                              }`}
                            >
                              Đúng
                            </button>

                            <button
                              onClick={() => handlePart2Select(q.id, sub.key, false)}
                              className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                                userChoice === false
                                  ? 'bg-rose-700 text-white shadow-xs'
                                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                              }`}
                            >
                              Sai
                            </button>

                            {/* Verification icon if graded */}
                            {(hasSubmitted || showSolutions) && (
                              <span
                                className={`text-xs font-bold px-2 py-1 rounded ml-2 ${
                                  sub.correct ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                                }`}
                              >
                                ĐA: {sub.correct ? 'ĐÚNG' : 'SAI'}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Solution if opened */}
                  {(showSolutions || scoreReport !== null) && (
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                      <div className="font-bold text-teal-900">Giải thích từng ý:</div>
                      {q.subItems.map((sub) => (
                        <div key={sub.key} className="text-slate-600 pl-3">
                          <b>{sub.key})</b>: {sub.explanation}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* ======================================================== */}
        {/* PHẦN III: 6 CÂU TRẢ LỜI NGẮN (3.0 ĐIỂM) */}
        {/* ======================================================== */}
        <section className="space-y-6">
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <h3 className="font-extrabold text-sm sm:text-base text-teal-900 uppercase">
              PHẦN III. Câu trắc nghiệm trả lời ngắn (3,0 điểm)
            </h3>
            <p className="text-xs text-slate-600 mt-0.5">
              Thí sinh trả lời từ câu 1 đến câu 6. Điền kết quả dạng số hoặc số thập phân. Mỗi câu đúng được 0,5 điểm.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {exam.part3Questions.map((q) => {
              const userVal = submission.part3Answers[q.id] || '';
              const isSubmitted = scoreReport !== null;

              return (
                <div
                  key={q.id}
                  className="p-4 sm:p-5 rounded-xl border border-slate-200/90 bg-white space-y-3 flex flex-col justify-between"
                >
                  <div className="text-sm font-medium text-slate-900 leading-relaxed">
                    <span className="font-extrabold text-teal-900 mr-1.5">
                      Câu {q.questionNumber}:
                    </span>
                    <MathView text={q.question} />
                  </div>

                  <div className="pt-2 space-y-2">
                    <div className="flex items-center gap-2">
                      <label className="text-xs font-semibold text-slate-600">Đáp số của bạn:</label>
                      <input
                        type="text"
                        placeholder="Nhập số..."
                        value={userVal}
                        onChange={(e) => handlePart3Change(q.id, e.target.value)}
                        className="flex-1 px-3 py-1.5 text-sm rounded-lg border border-slate-300 focus:outline-teal-700 font-mono"
                      />
                    </div>

                    {(isSubmitted || showSolutions) && (
                      <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                        <p className="font-bold text-teal-900">
                          Đáp án đúng: <span className="font-mono text-emerald-700">{q.correctAnswer}</span>
                        </p>
                        <p className="text-slate-600 mt-0.5">{q.explanation}</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Bottom Submit Action Bar */}
        <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4 no-print">
          <div className="text-xs text-slate-500">
            Số câu đã trả lời: <b>{totalAnswered}</b> / 22 câu
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleManualSubmit}
              className="px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm shadow-md transition-all cursor-pointer"
            >
              Nộp bài và chấm điểm
            </button>
          </div>
        </div>
      </div>

      {/* Auto-Grading Score Report Modal */}
      {showReportModal && scoreReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 no-print">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 rounded-full bg-teal-50 text-teal-800 border-2 border-teal-200 flex items-center justify-center mx-auto">
                <Award className="w-9 h-9" />
              </div>

              <h3 className="text-2xl font-extrabold text-slate-900">
                KẾT QUẢ CHẤM ĐIỂM TỰ ĐỘNG
              </h3>
              <p className="text-xs text-slate-500 font-mono">
                Chuẩn thang điểm Bộ GD&ĐT 2025
              </p>
            </div>

            {/* Total Score big box */}
            <div className="bg-gradient-to-br from-teal-800 to-emerald-900 text-white rounded-2xl p-4 text-center shadow-inner">
              <span className="text-xs text-teal-200 uppercase font-semibold tracking-wider">
                Tổng điểm đạt được
              </span>
              <div className="text-5xl font-extrabold font-mono my-1 tracking-tight">
                {scoreReport.totalScore}
                <span className="text-2xl text-teal-300 font-normal"> / 10.0</span>
              </div>
              <p className="text-xs text-teal-100 font-medium">{scoreReport.feedback}</p>
            </div>

            {/* Breakdown per part */}
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-500 block font-medium">Phần I (12 TN)</span>
                <span className="text-base font-extrabold text-slate-900 font-mono block mt-1">
                  {scoreReport.part1Score} / 3.0
                </span>
                <span className="text-[11px] text-teal-700">
                  {scoreReport.correctPart1Count}/12 câu đúng
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-500 block font-medium">Phần II (4 Đ/S)</span>
                <span className="text-base font-extrabold text-slate-900 font-mono block mt-1">
                  {scoreReport.part2Score} / 4.0
                </span>
                <span className="text-[11px] text-teal-700">
                  {scoreReport.correctPart2SubCount}/16 ý đúng
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-500 block font-medium">Phần III (6 TLN)</span>
                <span className="text-base font-extrabold text-slate-900 font-mono block mt-1">
                  {scoreReport.part3Score} / 3.0
                </span>
                <span className="text-[11px] text-teal-700">
                  {scoreReport.correctPart3Count}/6 câu đúng
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowReportModal(false)}
                className="px-5 py-2.5 rounded-xl bg-teal-800 text-white font-semibold text-xs hover:bg-teal-900 transition-colors w-full sm:w-auto"
              >
                Xem lời giải chi tiết từng câu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
