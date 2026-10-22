# Dạy học Toán LKT - Nền tảng Học tập & Ôn luyện Toán THPT (10, 11, 12)

Xây dựng ứng dụng học tập và luyện thi Toán THPT chuẩn chương trình Kết nối tri thức và cấu trúc đề thi 2025 của Bộ GD&ĐT, tích hợp mô phỏng đồ thị trực quan, ngân hàng toán thực tiễn tự đổi số, hệ thống đề kiểm tra tự sinh với chức năng chấm điểm tự động và lời giải chi tiết từng bước.

---

### User Review & Critical Decisions

> [!IMPORTANT]
> **Các quyết định trọng tâm đã xác nhận cùng người dùng:**
> - **Bộ sách chuẩn:** Bám sát chương trình GDPT 2018 bộ sách **Kết nối tri thức với cuộc sống** (Toán 10, 11, 12).
> - **Chế độ kiểm tra:** Hỗ trợ đồng thời 2 chế độ: **Luyện tập tự do** (xem đáp án ngay) và **Thi thử có tính giờ** (đồng hồ đếm ngược, nộp bài chấm điểm phân loại theo chuẩn cấu trúc 2025: Trắc nghiệm 4 phương án, Đúng/Sai, Trả lời ngắn).
> - **In & Xuất đề:** Hỗ trợ xem dạng trang in (Print preview / Xuất A4) có tiêu đề tên trường (Trường THPT Bình Thạnh Đông, An Giang) kèm phiếu làm bài và đáp án.

---

### 1. Overview & Core Concept

- **Mục tiêu ứng dụng:** Tái hiện chính xác và nâng cấp trải nghiệm từ website "Dạy học Toán LKT", cung cấp một hệ sinh thái học tập toán học trực quan, sinh động cho học sinh lớp 10, 11, 12 và giáo viên luyện thi.
- **Đối tượng sử dụng:**
  - Học sinh THPT lớp 10, 11, 12 ôn tập kiến thức trọng tâm, rèn luyện bài tập thực tế đời sống và thi thử.
  - Giáo viên và phụ huynh cần ngân hàng đề tự sinh đổi số liệu, in ấn đề thi và barem đáp án chuẩn xác.
- **Giá trị cốt lõi:**
  - **Lý thuyết tương tác:** Đóng khung công thức trọng tâm, hiển thị ký hiệu toán học sắc nét (KaTeX style), kèm đồ thị hàm số và đường tròn lượng giác tương tác trực tiếp.
  - **Dạng toán tự sinh số liệu:** Thuật toán đổi số tự động (parametric generator), giúp học sinh luyện tập vô hạn lần mà không bị trùng đề.
  - **Toán thực tiễn đời sống:** Kho bài toán ứng dụng thực tế (chuyển động rơi tự do, tối ưu doanh thu - lợi nhuận, lãi suất ngân hàng, bài toán ngắm hải đăng, góc nghiêng mặt trời, v.v.).
  - **Chấm điểm tự động cấu trúc mới 2025:** Tự động chấm Phần I (12 câu trắc nghiệm), Phần II (4 câu đúng/sai với quy tắc tính điểm chuẩn: 1 ý đúng 0.1đ, 2 ý 0.25đ, 3 ý 0.5đ, 4 ý 1.0đ), và Phần III (6 câu trả lời ngắn điền số/thập phân).

---

### 2. User Experience & Visual Design

#### A. Key User Flows
1. **Khám phá Trang chủ:** Hero banner phong cách đồ họa lưới ô vuông toán học (mathematical grid) với đồ thị cubic sinh động $y = x^3 - 3x + 1$, thống kê tổng quan (79 bài học, 1190 dạng tự sinh, 68 toán thực tiễn, 4 loại câu hỏi), điều hướng nhanh tới các khối lớp và bài kiểm tra.
2. **Học theo khối lớp (Toán 10, 11, 12):**
   - Thanh chuyên mục bên trái (Sidebar) tổ chức theo các Chương chuẩn Kết nối tri thức (Chương I đến IX).
   - Nội dung bài học có 2 chế độ tab: **Lý thuyết** (công thức trọng tâm, đồ thị tương tác, bảng biến thiên BBT) và **Dạng toán & ví dụ** (danh sách các dạng bài tập phân loại kèm ví dụ mẫu, nút đổi số liệu mới).
3. **Luyện Toán thực tiễn:**
   - Bộ lọc theo khối (Tất cả, 10, 11, 12) và dạng câu hỏi (Trắc nghiệm, Đúng/Sai, Trả lời ngắn, Tự luận).
   - Nút "Sinh bài mới" cập nhật số liệu bài toán thực tế ngay lập tức.
   - Thao tác chọn đáp án, bấm "Kiểm tra" để nhận phản hồi đúng/sai tức thì và nút "Xem lời giải" mở rộng các bước biến đổi chi tiết.
4. **Tạo & Làm đề kiểm tra tự sinh:**
   - Lựa chọn: Khối (10, 11, 12), Loại kiểm tra (Giữa kì I, Cuối kì I, Giữa kì II, Cuối kì II, Ôn thi tốt nghiệp THPT), Cấu trúc đề chuẩn 2025.
   - Tuỳ biến Tên trường in trên đề (mặc định: *Trường THPT Bình Thạnh Đông, An Giang*).
   - Các nút điều khiển: "Tạo đề mới", "Bắt đầu làm bài (Tính giờ)", "Nộp bài và chấm", "Xem đáp án & Lời giải", "In đề thi (A4)".
   - Kết quả chấm chi tiết: Điểm tổng kết /10.0, thống kê số câu đúng/sai từng phần, giải thích cặn kẽ từng câu.

#### B. Visual Identity & Palette
- **Phong cách thẩm mỹ:** Học thuật hiện đại, chuẩn mực giáo dục, nền lưới tập kẻ ô vuông toán học thanh lịch (`graph-paper grid`).
- **Bảng màu (Tuân thủ kỷ luật 60-30-10):**
  - **Canvas (60%):** `#F8FAFC` sạch sẽ kết hợp background grid line tinh tế `#E2E8F0`.
  - **Bề mặt cấu trúc (30%):** Card màu trắng thuần khiết `#FFFFFF`, viền hairline `#E2E8F0`, thanh menu xanh ngọc sẫm (Dark Teal/Petrol Green `#0F4C45` & `#134E48`) tạo cảm giác phấn bảng trường học quen thuộc nhưng cao cấp.
  - **Điểm nhấn hành động (10%):** Màu vàng ấm hổ phách `#F59E0B` (nút Bắt đầu, huy hiệu nổi bật) và xanh Cyan `#0EA5E9` (trục tọa độ, điểm uốn).
- **Typography:**
  - Tiêu đề & Logo: `Plus Jakarta Sans` trọng số SemiBold 600/Bold 700.
  - Nội dung & Đọc hiểu: `DM Sans` dễ đọc ở kích cỡ 15px.
  - Ký hiệu & Công thức toán học: Font serif toán học KaTeX/MathJax style với cấu trúc đóng khung công thức `math-callout`.

---

### 3. Key Product Decisions & Trade-Offs

- **Sinh số liệu ngẫu nhiên (Parametric Math Engine):**
  - *Phương pháp:* Sử dụng các hàm sinh ngẫu nhiên có ràng buộc toán học (nghiệm số đẹp, biệt thức $\Delta > 0$ là số chính phương, tọa độ nguyên) để đảm bảo bài toán sau khi đổi số luôn có lời giải đẹp và đáp án chính xác 100%.
  - *Lý do:* Giúp học sinh làm bài không bị số lẻ xấu và rèn luyện kỹ năng tư duy tính toán thực chất.
- **Mô phỏng đồ thị & Bảng biến thiên (Interactive SVG Components):**
  - *Phương pháp:* Xây dựng component đồ thị hàm số và Bảng biến thiên (BBT) bằng SVG động, có mũi tên chiều biến thiên, điểm cực đại/cực tiểu, đường tròn lượng giác với điểm $M$ xoay theo góc $\alpha$.
  - *Lý do:* Nhẹ, tải tức thì, không phụ thuộc vào thư viện bên ngoài cồng kềnh, hoạt động mượt mà offline.
- **Hệ thống chấm thi 3 phần chuẩn Bộ GD&ĐT 2025:**
  - *Phần I:* Trắc nghiệm nhiều lựa chọn (12 câu, 0.25đ/câu = 3.0 điểm).
  - *Phần II:* Đúng/Sai (4 câu, mỗi câu 4 ý a,b,c,d; tính điểm chuẩn bậc thang Bộ GD&ĐT: đúng 1 ý 0.1đ, đúng 2 ý 0.25đ, đúng 3 ý 0.5đ, đúng 4 ý 1.0đ = 4.0 điểm).
  - *Phần III:* Trả lời ngắn (6 câu, 0.5đ/câu = 3.0 điểm).
  - Tổng điểm: 10.0 điểm.

---

### 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                               App State                                │
│  Active Tab (Home | Grade 10 | 11 | 12 | Practical | Exam | Doc)       │
│  User Answers | Exam Timer | Grading Report | Filter Options           │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
        ┌───────────────────────────┼───────────────────────────┐
        ▼                           ▼                           ▼
┌──────────────────┐      ┌──────────────────┐      ┌──────────────────┐
│  Curriculum View │      │  Practical Math  │      │  Exam Simulator  │
│  - Chapters Nav  │      │  - Grade Filters │      │  - Config & Seed │
│  - Theory Cards  │      │  - Parametric Gen│      │  - 3-Part Test   │
│  - Practice Sets │      │  - Instant Check │      │  - Auto Grader   │
│  - Graph & BBT   │      │  - Step Solution │      │  - Print View A4 │
└──────────────────┘      └──────────────────┘      └──────────────────┘
        │                           │                           │
        └───────────────────────────┼───────────────────────────┘
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                             Math Data Core                             │
│  - KNTT Grade 10, 11, 12 Syllabus Data (Chapters, Lessons, Formulas)   │
│  - Parametric Math Question Generators (Algebra, Calculus, Geometry)   │
│  - Standard 2025 Exam Matrix & Rubric Scoring Logic                    │
└────────────────────────────────────────────────────────────────────────┘
```

#### Chi tiết các module:
1. `src/data/curriculumData.ts`: Dữ liệu chi tiết các chương và bài học chuẩn Kết nối tri thức lớp 10, 11, 12 kèm công thức tóm tắt, hình ảnh minh họa tọa độ SVG, bảng biến thiên.
2. `src/data/practicalMathData.ts`: Danh mục bài toán thực tiễn phong phú bám sát đời sống (vật lý, kinh tế, trắc địa, xác suất đời thực).
3. `src/utils/mathGenerator.ts`: Bộ sinh đề ngẫu nhiên tham số hóa, tính toán tự động nghiệm, cực trị, đạo hàm, giá trị góc lượng giác.
4. `src/components/MathFormula.tsx`: Component hiển thị công thức toán học format chuẩn xác, đẹp mắt.
5. `src/components/InteractiveGraph.tsx`: Vẽ đồ thị hàm số bậc ba, bậc hai, phân thức và đường tròn lượng giác.
6. `src/components/VariationTable.tsx`: Vẽ bảng biến thiên hàm số trực quan với các giá trị giới hạn $\pm\infty$ và cực trị.
7. `src/components/ExamView.tsx`: Bộ làm đề và thi thử với đồng hồ đếm ngược, phiếu điền đáp án 3 phần, nộp bài, phân tích kết quả và in ấn.
