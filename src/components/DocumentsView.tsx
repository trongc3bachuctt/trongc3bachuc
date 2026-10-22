import React from 'react';
import { FolderArchive, Download, FileText, CheckCircle, ExternalLink } from 'lucide-react';

export const DocumentsView: React.FC = () => {
  const documents = [
    {
      id: 'doc-1',
      title: 'Sổ tay tóm tắt toàn bộ công thức Toán 10 (Bộ Kết nối tri thức)',
      category: 'Toán 10',
      size: '2.4 MB · PDF',
      desc: 'Tổng hợp mệnh đề, tập hợp, hệ thức lượng tam giác, vectơ, toạ độ phẳng, tổ hợp và xác suất.',
    },
    {
      id: 'doc-2',
      title: 'Bảng tra cứu giá trị và công thức Lượng giác – Cấp số nhân – Đạo hàm Toán 11',
      category: 'Toán 11',
      size: '3.1 MB · PDF',
      desc: 'Hệ thống hóa toàn bộ công thức lượng giác, ý nghĩa vật lý đạo hàm và các bài toán thực tiễn chuyển động.',
    },
    {
      id: 'doc-3',
      title: 'Cẩm nang sơ đồ tư duy & Bảng biến thiên hàm số – Toạ độ Oxyz Toán 12',
      category: 'Toán 12',
      size: '4.8 MB · PDF',
      desc: 'Bí quyết nhận diện đồ thị hàm bậc ba, phân thức bậc nhất/bậc nhất, toạ độ không gian Oxyz và nguyên hàm tích phân.',
    },
    {
      id: 'doc-4',
      title: 'Ngân hàng 68 bài toán thực tiễn có lời giải chi tiết',
      category: 'Toán thực tiễn',
      size: '5.2 MB · PDF',
      desc: 'Tuyển tập các bài toán lãi suất, tối ưu hoá lợi nhuận, thể tích hình trụ, trắc địa và xác suất dịch tễ.',
    },
    {
      id: 'doc-5',
      title: 'Bộ 20 đề thi thử tốt nghiệp THPT cấu trúc 2025 có barem chấm điểm',
      category: 'Đề thi 2025',
      size: '6.5 MB · PDF',
      desc: 'Đầy đủ 3 phần: 12 câu trắc nghiệm 4 lựa chọn, 4 câu đúng sai tính điểm chuẩn bậc thang, 6 câu trả lời ngắn.',
    },
  ];

  const handleDownload = (title: string) => {
    alert(`Đang mở tải tài liệu: "${title}"`);
  };

  return (
    <div className="space-y-6 pb-16 max-w-5xl mx-auto">
      <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
        <div className="p-3 bg-teal-50 text-teal-800 rounded-2xl border border-teal-200">
          <FolderArchive className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Tài liệu & Sổ tay Toán học – Thầy Trần Trọng
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Tổng hợp tài liệu ôn tập, sổ tay công thức và đề thi mẫu chuẩn Bộ GD&ĐT 2025
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {documents.map((doc) => (
          <div
            key={doc.id}
            className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:border-teal-700 hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-teal-50 text-teal-800 border border-teal-200">
                  {doc.category}
                </span>
                <span className="text-xs text-slate-400 font-mono">{doc.size}</span>
              </div>
              <h3 className="font-bold text-slate-900 text-base leading-snug">{doc.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{doc.desc}</p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs font-medium text-emerald-700 flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" />
                Miễn phí tải về
              </span>
              <button
                onClick={() => handleDownload(doc.title)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-teal-800 text-white hover:bg-teal-900 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Tải tài liệu</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
