import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = parseInt(process.env.PORT || '3000', 10);

app.use(express.json({ limit: '25mb' }));
app.use(express.text({ type: ['text/*', 'application/json'], limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

app.use((req, _res, next) => {
  if (typeof req.body === 'string') {
    try {
      req.body = JSON.parse(req.body);
    } catch (e) {
      // Keep as string if not valid JSON
    }
  }
  next();
});

// Initialize GoogleGenAI according to gemini-api guidelines
let ai: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  try {
    ai = new GoogleGenAI({});
  } catch (err) {
    console.error('Failed to init GoogleGenAI:', err);
  }
}

// Fallback generator when API key is unavailable or fails
function generateFallbackQuestion(topic: string, grade: string, difficulty: string) {
  const seeds = [
    {
      question: `Cho hàm số $y = x^3 - 3x^2 + 2$. Tìm khoảng đồng biến của hàm số trên $\\mathbb{R}$.`,
      options: [
        { id: 'A', text: '$(-\\infty; 0)$ và $(2; +\\infty)$' },
        { id: 'B', text: '$(0; 2)$' },
        { id: 'C', text: '$(-\\infty; 2)$' },
        { id: 'D', text: '$(0; +\\infty)$' },
      ],
      correctAnswer: 'A',
      explanation: `Ta có đạo hàm $y' = 3x^2 - 6x = 3x(x - 2)$. Cho $y' > 0 \\Leftrightarrow x < 0$ hoặc $x > 2$. Vậy hàm số đồng biến trên $(-\\infty; 0)$ và $(2; +\\infty)$.`,
      topic: topic || 'Đơn điệu hàm số',
      difficulty: difficulty || 'Thông hiểu',
    },
    {
      id: 'fb-2',
      question: `Trong không gian $Oxyz$, cho mặt cầu $(S): (x - 2)^2 + (y + 1)^2 + (z - 3)^2 = 25$. Toạ độ tâm $I$ và bán kính $R$ của mặt cầu là:`,
      options: [
        { id: 'A', text: '$I(2, -1, 3); R = 5$' },
        { id: 'B', text: '$I(-2, 1, -3); R = 5$' },
        { id: 'C', text: '$I(2, -1, 3); R = 25$' },
        { id: 'D', text: '$I(-2, 1, -3); R = 25$' },
      ],
      correctAnswer: 'A',
      explanation: `Phương trình mặt cầu $(x - a)^2 + (y - b)^2 + (z - c)^2 = R^2$ có tâm $I(a, b, c) = (2, -1, 3)$ và bán kính $R = \\sqrt{25} = 5$.`,
      topic: topic || 'Mặt cầu Oxyz',
      difficulty: difficulty || 'Nhận biết',
    },
    {
      id: 'fb-3',
      question: `Một vật rơi tự do với phương trình quãng đường $s(t) = 4,9t^2$ (m). Tính vận tốc tức thời của vật tại thời điểm $t = 5\\text{ s}$.`,
      options: [
        { id: 'A', text: '$49,0\\text{ m/s}$' },
        { id: 'B', text: '$24,5\\text{ m/s}$' },
        { id: 'C', text: '$98,0\\text{ m/s}$' },
        { id: 'D', text: '$9,8\\text{ m/s}$' },
      ],
      correctAnswer: 'A',
      explanation: `Vận tốc tức thời $v(t) = s'(t) = 9,8t$. Tại $t = 5\\text{ s}$, $v(5) = 9,8 \\times 5 = 49,0\\text{ m/s}$.`,
      topic: topic || 'Toán thực tiễn đạo hàm',
      difficulty: difficulty || 'Vận dụng',
    },
  ];

  const pick = seeds[Math.floor(Math.random() * seeds.length)];
  return pick;
}

// API: AI Generate New Math Question
app.post('/api/ai/generate-question', async (req, res) => {
  const { topic, grade = '12', difficulty = 'Thông hiểu', requestPrompt = '' } = req.body;

  if (!ai || !process.env.GEMINI_API_KEY) {
    const fallback = generateFallbackQuestion(topic, grade, difficulty);
    return res.json({ success: true, question: fallback, source: 'fallback_engine' });
  }

  try {
    const prompt = `Bạn là Thầy Trần Trọng, chuyên gia Toán THPT tại Việt Nam (sách Kết nối tri thức).
Hãy sinh một câu hỏi toán trắc nghiệm mới, sáng tạo, chính xác 100% về mặt toán học.
Khối lớp: ${grade}. Chuyên đề: ${topic}. Mức độ: ${difficulty}.
Yêu cầu bổ sung của học sinh: ${requestPrompt || 'Sinh một bài toán hay, sát đề thi tốt nghiệp THPT mới 2025'}.

Phải trả về JSON đúng cấu trúc sau (không kèm markdown ngoài JSON):
{
  "question": "Nội dung câu hỏi có công thức LaTeX dạng $...$ hoặc $$...$$",
  "options": [
    { "id": "A", "text": "Phương án A có LaTeX" },
    { "id": "B", "text": "Phương án B có LaTeX" },
    { "id": "C", "text": "Phương án C có LaTeX" },
    { "id": "D", "text": "Phương án D có LaTeX" }
  ],
  "correctAnswer": "A", // hoặc B, C, D
  "explanation": "Lời giải chi tiết từng bước, biến đổi rõ ràng có công thức LaTeX",
  "topic": "${topic}",
  "difficulty": "${difficulty}"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text || '';
    const parsed = JSON.parse(text);
    return res.json({ success: true, question: parsed, source: 'gemini-3.8-flash' });
  } catch (error: any) {
    console.error('Gemini error, using fallback:', error?.message);
    const fallback = generateFallbackQuestion(topic, grade, difficulty);
    return res.json({ success: true, question: fallback, source: 'fallback_engine' });
  }
});

// API: AI Transform / Mutate Question (Change numbers and parameters)
app.post('/api/ai/transform-question', async (req, res) => {
  const { originalQuestion, lessonTitle = 'Toán THPT' } = req.body;

  if (!ai || !process.env.GEMINI_API_KEY) {
    const fallback = generateFallbackQuestion(lessonTitle, '12', 'Vận dụng');
    return res.json({ success: true, question: fallback, source: 'fallback_engine' });
  }

  try {
    const prompt = `Bạn là Thầy Trần Trọng, giáo viên Toán THPT.
Dưới đây là một câu hỏi toán học:
"${originalQuestion}"
Chuyên đề: ${lessonTitle}.

Nhiệm vụ của bạn:
1. Giữ nguyên dạng toán và phương pháp giải cốt lõi, nhưng ĐỔI SỐ LIỆU (hoặc đổi ngữ cảnh thực tế) để tạo ra một bài toán mới hoàn toàn.
2. Đảm bảo số liệu nghiệm đẹp, tính toán logic, chính xác 100%.
3. Viết đầy đủ 4 phương án A, B, C, D và lời giải chi tiết từng bước có công thức LaTeX dạng $...$.

Trả về JSON:
{
  "question": "Nội dung câu hỏi mới đổi số",
  "options": [
    { "id": "A", "text": "Phương án A" },
    { "id": "B", "text": "Phương án B" },
    { "id": "C", "text": "Phương án C" },
    { "id": "D", "text": "Phương án D" }
  ],
  "correctAnswer": "A",
  "explanation": "Các bước biến đổi giải chi tiết cho số liệu mới",
  "topic": "${lessonTitle}",
  "difficulty": "Vận dụng"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text || '';
    const parsed = JSON.parse(text);
    return res.json({ success: true, question: parsed, source: 'gemini-3.8-flash' });
  } catch (error: any) {
    console.error('Gemini transform error:', error?.message);
    const fallback = generateFallbackQuestion(lessonTitle, '12', 'Vận dụng');
    return res.json({ success: true, question: fallback, source: 'fallback_engine' });
  }
});

// Function providing 100% accurate textbook-based math guidance according to SGK Kết nối tri thức (Tiểu học, THCS, THPT)
function getAccurateMathAnswer(rawQuery: string): string {
  const q = (rawQuery || '').toLowerCase();

  // ====== 1. CẤP THCS & THPT: PHƯƠNG TRÌNH BẬC 2 & ĐỊNH LÝ VI-ÉT ======
  if (q.includes('phương trình bậc 2') || q.includes('phương trình bậc hai') || (q.includes('bậc 2') && (q.includes('giải') || q.includes('bước')))) {
    return `### Hướng dẫn giải phương trình bậc hai một ẩn $ax^2 + bx + c = 0$ ($a \\neq 0$)
*(Chuẩn SGK Toán THCS & THPT Kết nối tri thức với cuộc sống)*

#### 1. Dạng tổng quát & Điều kiện:
$$ax^2 + bx + c = 0 \\quad (a \\neq 0)$$

---

#### 2. Các bước giải chi tiết từng bước:
- **Bước 1: Chuyển vế & Xác định hệ số**
  Chuyển tất cả hạng tử về vế trái, xác định chính xác các hệ số $a$ (hệ số $x^2$, $a \\neq 0$), $b$ (hệ số $x$), $c$ (hạng tử tự do).

- **Bước 2: Mẹo nhẩm nghiệm nhanh (rất thường gặp trong trắc nghiệm)**
  - Nếu $a + b + c = 0 \\implies$ Phương trình có 2 nghiệm: $x_1 = 1$ và $x_2 = \\dfrac{c}{a}$.
  - Nếu $a - b + c = 0 \\implies$ Phương trình có 2 nghiệm: $x_1 = -1$ và $x_2 = -\\dfrac{c}{a}$.

- **Bước 3: Dùng biệt thức $\\Delta = b^2 - 4ac$**
  - **Trường hợp $\\Delta < 0$:** Phương trình vô nghiệm trên tập số thực $\\mathbb{R}$.
  - **Trường hợp $\\Delta = 0$:** Phương trình có nghiệm kép:
    $$x_1 = x_2 = -\\frac{b}{2a}$$
  - **Trường hợp $\\Delta > 0$:** Phương trình có hai nghiệm phân biệt:
    $$x_1 = \\frac{-b + \\sqrt{\\Delta}}{2a}, \\quad x_2 = \\frac{-b - \\sqrt{\\Delta}}{2a}$$

> **Mẹo Casio fx-880 BTG:** Bấm phím **HOME** ➔ chọn **Equation** ➔ chọn **Simul/Polynomial** ➔ chọn **ax² + bx + c = 0** ➔ nhập hệ số $a, b, c$ và bấm **EXE**. Máy tính còn cho toạ độ đỉnh Parabol $x_{min/max}, y_{min/max}$.

---

#### 3. Ví dụ áp dụng:
Giải phương trình: $x^2 - 5x + 6 = 0$
- Hệ số: $a = 1, b = -5, c = 6$.
- Biệt thức: $\\Delta = (-5)^2 - 4 \\cdot 1 \\cdot 6 = 25 - 24 = 1 > 0$.
- Do $\\Delta > 0$, phương trình có 2 nghiệm phân biệt:
  $$x_1 = \\frac{5 + \\sqrt{1}}{2} = 3, \\quad x_2 = \\frac{5 - \\sqrt{1}}{2} = 2$$
- Kết luận: Tập nghiệm là $S = \\{2; 3\\}$.`;
  }

  // ====== 2. CẤP TIỂU HỌC: TOÁN CÓ LỜI VĂN TỔNG - HIỆU, TỔNG - TỈ, RÚT VỀ ĐƠN VỊ ======
  if (q.includes('tổng và hiệu') || q.includes('tổng hiệu')) {
    return `### Hướng dẫn giải bài toán Tìm hai số khi biết Tổng và Hiệu (Toán Tiểu học - Lớp 4, 5)

#### 1. Công thức cốt lõi:
- **Số bé** = $(\\text{Tổng} - \\text{Hiệu}) : 2$
- **Số lớn** = $(\\text{Tổng} + \\text{Hiệu}) : 2$
*(Hoặc: Số lớn = Số bé + Hiệu)*

---

#### 2. Các bước giải chuẩn sư phạm:
- **Bước 1:** Đọc kỹ đề bài, xác định rõ đâu là **Tổng** của hai số, đâu là **Hiệu** của hai số.
- **Bước 2:** Vẽ sơ đồ đoạn thẳng biểu thị hai số (Số lớn là đoạn dài, số bé là đoạn ngắn, phần hơn kém chính là Hiệu).
- **Bước 3:** Áp dụng một trong hai công thức tính Số bé hoặc Số lớn.
- **Bước 4:** Thử lại kết quả (Tổng = Số lớn + Số bé; Hiệu = Số lớn - Số bé) và viết đáp số.

---

#### 3. Ví dụ minh hoạ:
*Đề bài:* Tổng số tuổi của hai anh em là $24$ tuổi. Anh hơn em $6$ tuổi. Hỏi mỗi người bao nhiêu tuổi?
- **Bài giải:**
  - Tuổi của em (số bé) là:
    $$(24 - 6) : 2 = 9 \\text{ (tuổi)}$$
  - Tuổi của anh (số lớn) là:
    $$9 + 6 = 15 \\text{ (tuổi)}$$
  - *Đáp số:* Anh: $15$ tuổi; Em: $9$ tuổi.`;
  }

  if (q.includes('tổng và tỉ') || q.includes('hiệu và tỉ') || q.includes('tổng tỉ') || q.includes('hiệu tỉ')) {
    return `### Hướng dẫn giải bài toán Tìm hai số khi biết Tổng (hoặc Hiệu) và Tỉ số (Toán Tiểu học)

#### 1. Phương pháp chung theo 4 bước chuẩn:
- **Bước 1: Vẽ sơ đồ đoạn thẳng**
  Dựa vào tỉ số $\\dfrac{a}{b}$ để biểu thị số thứ nhất gồm $a$ phần bằng nhau, số thứ hai gồm $b$ phần như thế.
- **Bước 2: Tìm tổng (hoặc hiệu) số phần bằng nhau**
  - Nếu biết Tổng: Tổng số phần = $a + b$ (phần).
  - Nếu biết Hiệu: Hiệu số phần = $|a - b|$ (phần).
- **Bước 3: Tìm giá trị của một phần**
  - Giá trị 1 phần = $\\text{Tổng (hoặc Hiệu)} : \\text{Số phần tương ứng}$.
- **Bước 4: Tìm từng số**
  - Số bé = Giá trị $1$ phần $\\times$ Số phần của số bé.
  - Số lớn = Giá trị $1$ phần $\\times$ Số phần của số lớn (hoặc lấy Tổng trừ số bé).

---

#### 2. Ví dụ minh hoạ (Tổng và Tỉ số):
*Đề bài:* Hai kho chứa $120$ tấn thóc, biết số thóc kho A bằng $\\dfrac{2}{3}$ số thóc kho B. Tính số thóc mỗi kho.
- Tổng số phần bằng nhau: $2 + 3 = 5$ (phần).
- Giá trị một phần: $120 : 5 = 24$ (tấn).
- Số thóc kho A là: $24 \\times 2 = 48$ (tấn).
- Số thóc kho B là: $120 - 48 = 72$ (tấn).
- *Đáp số:* Kho A: $48$ tấn; Kho B: $72$ tấn.`;
  }

  if (q.includes('rút về đơn vị') || q.includes('rut ve don vi')) {
    return `### Phương pháp giải bài toán liên quan đến Rút Về Đơn Vị (Toán Tiểu học)

#### 1. Bản chất phương pháp:
"Rút về đơn vị" là tìm giá trị tương ứng với **$1$ đơn vị** của đại lượng (thực hiện phép chia), sau đó từ giá trị $1$ đơn vị tính ra giá trị của nhiều đơn vị hoặc số đơn vị cần tìm.

---

#### 2. Hai dạng toán cơ bản:
- **Kiểu 1 (Giải bằng phép nhân ở bước 2):**
  - *Bước 1 (Rút về đơn vị):* Tìm giá trị của $1$ đơn vị $\\Rightarrow$ Làm phép chia $:$.
  - *Bước 2:* Tìm giá trị của nhiều đơn vị $\\Rightarrow$ Lấy giá trị $1$ đơn vị nhân $\\times$ số lượng.
- **Kiểu 2 (Giải bằng phép chia ở bước 2):**
  - *Bước 1 (Rút về đơn vị):* Tìm giá trị của $1$ đơn vị $\\Rightarrow$ Làm phép chia $:$.
  - *Bước 2:* Tìm số lượng đơn vị $\\Rightarrow$ Lấy tổng số chia $:$ cho giá trị của $1$ đơn vị.

---

#### 3. Ví dụ minh hoạ:
*Đề bài:* Có $5$ can đựng đều $35$ lít dầu. Hỏi $8$ can như thế đựng bao nhiêu lít dầu?
- **Bài giải:**
  - Mỗi can đựng số lít dầu là:
    $$35 : 5 = 7 \\text{ (lít)}$$
  - $8$ can như thế đựng số lít dầu là:
    $$7 \\times 8 = 56 \\text{ (lít)}$$
  - *Đáp số:* $56$ lít dầu.`;
  }

  if (q.includes('chuyển động') || q.includes('vận tốc') || q.includes('quãng đường')) {
    return `### Hướng dẫn giải bài toán Chuyển động đều (Toán Tiểu học & THCS)

#### 1. Ba công thức cốt lõi:
$$s = v \\times t, \\quad v = s : t, \\quad t = s : v$$
- $s$: Quãng đường (km, m).
- $v$: Vận tốc (km/h, m/s).
- $t$: Thời gian (giờ, giây).

---

#### 2. Chuyển động cùng chiều & ngược chiều:
- **Hai vật đi ngược chiều gặp nhau:**
  $$v_{\\text{gặp}} = v_1 + v_2$$
  $$t_{\\text{gặp}} = s : (v_1 + v_2)$$
- **Hai vật đi cùng chiều đuổi nhau:**
  $$v_{\\text{đuổi}} = v_1 - v_2 \\quad (v_1 > v_2)$$
  $$t_{\\text{đuổi}} = \\text{Khoảng cách ban đầu} : (v_1 - v_2)$$

> **Lưu ý quan trọng:** Luôn đổi các đại lượng về cùng một đơn vị đo trước khi tính (ví dụ: km đi cùng giờ; mét đi cùng phút hoặc giây).`;
  }

  // ====== 3. CẤP THCS: HỆ PHƯƠNG TRÌNH, HẰNG ĐẲNG THỨC, HỆ THỨC LƯỢNG ======
  if (q.includes('hệ phương trình') || q.includes('he phuong trinh')) {
    return `### Các phương pháp giải Hệ hai phương trình bậc nhất hai ẩn (Toán 9 - THCS)
$$\\begin{cases} a_1 x + b_1 y = c_1 \\\\ a_2 x + b_2 y = c_2 \\end{cases}$$

#### Cách 1: Phương pháp Thế
1. **Bước 1:** Từ một phương trình, biểu diễn một ẩn theo ẩn kia (ví dụ rút $x = \\dots$ theo $y$).
2. **Bước 2:** Thế biểu thức vừa rút vào phương trình còn lại để thu được phương trình một ẩn.
3. **Bước 3:** Giải phương trình một ẩn tìm được $y$, sau đó thay lại tìm $x$.

#### Cách 2: Phương pháp Cộng đại số
1. **Bước 1:** Nhân cả hai vế của mỗi phương trình với số thích hợp sao cho hệ số của một ẩn (hoặc $x$ hoặc $y$) bằng nhau hoặc đối nhau.
2. **Bước 2:** Cộng (nếu hệ số đối nhau) hoặc trừ (nếu hệ số bằng nhau) hai vế của hệ để triệt tiêu ẩn đó.
3. **Bước 3:** Giải phương trình một ẩn thu được, rồi thay vào tìm ẩn còn lại.

> **Mẹo Casio fx-880 BTG:** Nhấn **HOME** ➔ **Simul Equation** ➔ chọn **2 Unknowns** ➔ nhập lần lượt $a_1, b_1, c_1, a_2, b_2, c_2$ và nhấn **EXE**.`;
  }

  // ====== 4. CẤP THPT: HÀM SỐ, CỰC TRỊ, TIỆM CẬN, OXYZ, NGUYÊN HÀM TÍCH PHÂN ======
  if (q.includes('cực trị') || q.includes('cực đại') || q.includes('cực tiểu')) {
    return `### Phương pháp tìm cực trị của hàm số (Toán 12 - SGK Kết nối tri thức)

#### 1. Quy tắc xét dấu đạo hàm cấp 1:
- **Bước 1:** Tìm tập xác định $D$ của hàm số $y = f(x)$.
- **Bước 2:** Tính đạo hàm $f'(x)$. Giải phương trình $f'(x) = 0$ và tìm các điểm tại đó đạo hàm không xác định.
- **Bước 3:** Lập bảng biến thiên hoặc xét dấu của $f'(x)$:
  - Nếu $f'(x)$ đổi dấu từ **dương $(+)$ sang âm $(-)$** khi qua $x_0$ theo chiều tăng dần $\\Rightarrow x_0$ là **điểm cực đại**, giá trị cực đại là $y_{CĐ} = f(x_0)$.
  - Nếu $f'(x)$ đổi dấu từ **âm $(-)$ sang dương $(+)$** khi qua $x_0$ theo chiều tăng dần $\\Rightarrow x_0$ là **điểm cực tiểu**, giá trị cực tiểu là $y_{CT} = f(x_0)$.
  - Nếu $f'(x)$ không đổi dấu khi qua $x_0 \\Rightarrow x_0$ không phải là điểm cực trị.

#### 2. Phân biệt các thuật ngữ chuẩn sách Kết nối tri thức:
- **Điểm cực trị của hàm số:** là giá trị $x_0$.
- **Giá trị cực trị của hàm số (cực trị):** là giá trị $y_0 = f(x_0)$.
- **Điểm cực trị của đồ thị hàm số:** là điểm $M(x_0; y_0)$ trong mặt phẳng toạ độ.`;
  }

  if (q.includes('tiệm cận')) {
    return `### Phương pháp tìm đường tiệm cận của đồ thị hàm số (Toán 12 - KNTT)

Cho hàm số $y = f(x)$:

1. **Đường tiệm cận đứng:**
   - Đường thẳng $x = x_0$ là tiệm cận đứng nếu ít nhất một trong các điều kiện sau thoả mãn:
     $$\\lim_{x \\to x_0^+} f(x) = \\pm\\infty \\quad \\text{hoặc} \\quad \\lim_{x \\to x_0^-} f(x) = \\pm\\infty$$
   - *(Thường xuất hiện tại nghiệm của mẫu số mà tử số khác $0$).*

2. **Đường tiệm cận ngang:**
   - Đường thẳng $y = y_0$ là tiệm cận ngang nếu:
     $$\\lim_{x \\to +\\infty} f(x) = y_0 \\quad \\text{hoặc} \\quad \\lim_{x \\to -\\infty} f(x) = y_0$$

3. **Đường tiệm cận xiên (Hàm phân thức bậc 2 trên bậc 1):**
   - Đường thẳng $y = ax + b$ ($a \\neq 0$) là tiệm cận xiên nếu:
     $$\\lim_{x \\to \\pm\\infty} [f(x) - (ax + b)] = 0$$
   - Cách tìm nhanh: Thực hiện phép chia đa thức tử cho mẫu:
     $$f(x) = ax + b + \\frac{r}{cx + d} \\implies y = ax + b \\text{ là tiệm cận xiên.}$$`;
  }

  if (q.includes('oxyz') || q.includes('toạ độ trong không gian') || q.includes('mặt cầu')) {
    return `### Trọng tâm Toạ độ trong không gian Oxyz (Toán 12 - KNTT)

1. **Toạ độ vectơ và toạ độ điểm:**
   - $\\overrightarrow{AB} = (x_B - x_A;\\ y_B - y_A;\\ z_B - z_A)$.
   - Trung điểm $M$ của $AB$: $M\\left(\\dfrac{x_A + x_B}{2};\\ \\dfrac{y_A + y_B}{2};\\ \\dfrac{z_A + z_B}{2}\\right)$.
   - Độ dài đoạn thẳng: $AB = \\sqrt{(x_B - x_A)^2 + (y_B - y_A)^2 + (z_B - z_A)^2}$.

2. **Tích vô hướng và tích có hướng:**
   - Tích vô hướng: $\\vec{u} \\cdot \\vec{v} = u_1 v_1 + u_2 v_2 + u_3 v_3$.
   - $\\vec{u} \\perp \\vec{v} \\Leftrightarrow \\vec{u} \\cdot \\vec{v} = 0$.
   - Tích có hướng $[\\vec{u}, \\vec{v}] = (u_2 v_3 - u_3 v_2;\\ u_3 v_1 - u_1 v_3;\\ u_1 v_2 - u_2 v_1)$.

3. **Phương trình mặt cầu:**
   - Tâm $I(a; b; c)$, bán kính $R$:
     $$(x - a)^2 + (y - b)^2 + (z - c)^2 = R^2$$`;
  }

  if (q.includes('tích phân') || q.includes('nguyên hàm')) {
    return `### Phương pháp tính Nguyên hàm & Tích phân (Toán 12 - Kết nối tri thức)

#### 1. Định nghĩa và công thức Newton - Leibniz:
$$\\int_a^b f(x) \\, dx = F(b) - F(a) = \\left. F(x) \\right|_a^b$$
trong đó $F(x)$ là một nguyên hàm của $f(x)$ trên $[a; b]$.

#### 2. Hai phương pháp giải cơ bản:
- **Phương pháp đổi biến số:** Đặt $u = u(x) \\implies du = u'(x)dx$. Đổi cận $x=a \\to u=u(a), x=b \\to u=u(b)$.
- **Phương pháp tích phân từng phần:**
  $$\\int_a^b u \\, dv = \\left. (u \\cdot v) \\right|_a^b - \\int_a^b v \\, du$$
  Thứ tự ưu tiên đặt $u$: *"Nhất lô (logarit), nhì đa (đa thức), tam lượng (lượng giác), tứ mũ (hàm mũ)"*.`;
  }

  // Fallback tổng quát chuẩn sư phạm
  return `### Hướng dẫn sư phạm từ Thầy Trần Trọng (Sách Kết nối tri thức)

Đối với câu hỏi của em:
> *\"${rawQuery}\"*

#### 1. Định hướng theo chuẩn bộ sách Kết nối tri thức:
- **Xác định cấp học và dạng toán:** Xác định câu hỏi thuộc phạm vi Tiểu học, THCS hay THPT (Lớp 10, 11, 12).
- **Công thức cốt lõi:** Luôn xuất phát từ định nghĩa, định lý chuẩn trong SGK Kết nối tri thức.
- **Các bước thực hiện:**
  - *Bước 1:* Viết rõ giả thiết đã cho và điều kiện xác định của các biểu thức.
  - *Bước 2:* Biến đổi tuần tự từng biểu thức đại số / hình học.
  - *Bước 3:* Đối chiếu điều kiện và đưa ra kết luận nghiệm.

Em có thể nhập đề bài cụ thể từng số liệu vào khung câu hỏi để Thầy giải thích chi tiết từng bước cho em nhé!`;
}

// API: AI Step Explanation / Math Tutor Chat
app.post('/api/ai/explain', async (req, res) => {
  const { question, step, userQuery } = req.body;
  const targetQuery = userQuery || step || question || 'Giải toán THPT';

  if (!ai || !process.env.GEMINI_API_KEY) {
    const answer = getAccurateMathAnswer(targetQuery);
    return res.json({ success: true, explanation: answer, source: 'curriculum_engine' });
  }

  try {
    const prompt = `Bạn là Thầy Trần Trọng, chuyên gia sư phạm dạy Toán 3 cấp học (Tiểu học, THCS, THPT) tại Việt Nam, đặc biệt am hiểu sâu sắc bộ sách Kết nối tri thức với cuộc sống (Chương trình GDPT 2018).

Câu hỏi của học sinh:
"${targetQuery}"

Ngữ cảnh bài học liên quan (nếu có):
"${question || 'Toán học Kết nối tri thức'}"

YÊU CẦU BẮT BUỘC:
1. Xác định cấp học của bài toán (Tiểu học: Lớp 1-5; THCS: Lớp 6-9; THPT: Lớp 10-12).
2. Trả lời GỌN GÀNG, CÂN ĐỐI, DỄ HIỂU, ĐÚNG TRỌNG TÂM, phù hợp tuyệt đối với lứa tuổi học sinh:
   - Nếu là Toán Tiểu học: Trình bày từng bước, vẽ sơ đồ đoạn thẳng nếu cần, giải toán có lời văn trong sáng.
   - Nếu là Toán THCS: Trình bày logic, chặt chẽ, nêu rõ các bước biến đổi, Vi-ét, hệ thức lượng, hằng đẳng thức.
   - Nếu là Toán THPT: Trình bày chuẩn ma trận 2025, có bảng biến thiên, toạ độ Oxyz, tích phân, xác suất, kèm mẹo bấm máy Casio fx-880 BTG.
3. Tất cả công thức toán học phải định dạng bằng LaTeX chuẩn KaTeX đặt trong $...$ (nội dòng) hoặc $$...$$ (khối riêng).
4. Sử dụng định dạng Markdown rõ ràng (tiêu đề ###, in đậm **, danh sách gạch đầu dòng).
5. Giữ phong thái sư phạm tận tâm, mẫu mực, khích lệ học sinh của Thầy Trần Trọng.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    const explanation = response.text || getAccurateMathAnswer(targetQuery);
    return res.json({ success: true, explanation, source: 'gemini-3.8-flash' });
  } catch (error: any) {
    console.error('Gemini explain error, fallback to curriculum engine:', error?.message);
    const answer = getAccurateMathAnswer(targetQuery);
    return res.json({ success: true, explanation: answer, source: 'curriculum_engine' });
  }
});

// API: Parse Word / Text Exam with KaTeX formulas and numeric subscripts
app.post('/api/parse-word-exam', (req, res) => {
  try {
    const { rawText, title, grade = '12' } = req.body;
    if (!rawText) return res.status(400).json({ ok: false, msg: 'Nội dung đề thi trống' });

    // Server-side parsing
    const lines = String(rawText).split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    const partA: any[] = [];
    const partB: any[] = [];
    const partC: any[] = [];

    let curSection = 'A';
    let curQ: any = null;
    let qIndex = 1;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (/phần\s+(?:i|1|một)|trắc\s*nghiệm\s*nhiều\s*phương\s*án/i.test(line)) {
        curSection = 'A';
        continue;
      }
      if (/phần\s+(?:ii|2|hai)|đúng\s*[\/-]?\s*sai/i.test(line)) {
        curSection = 'B';
        continue;
      }
      if (/phần\s+(?:iii|3|ba)|trả\s*lời\s*ngắn|điền\s*khuyết/i.test(line)) {
        curSection = 'C';
        continue;
      }

      const qMatch = line.match(/^(?:câu|bài)\s*([0-9]+)\s*[:.]\s*(.*)/i);
      if (qMatch) {
        if (curQ) {
          if (curQ.section === 'A') partA.push(curQ);
          else if (curQ.section === 'B') partB.push(curQ);
          else if (curQ.section === 'C') partC.push(curQ);
        }

        curQ = {
          id: `w-q-${qIndex++}`,
          section: curSection,
          stem: qMatch[2],
          opts: [],
          items: [],
          ci: 0,
          ans: '',
          sol: ''
        };
        continue;
      }

      const optMatch = line.match(/^([A-D])\s*[:.)]\s*(.*)/i);
      if (optMatch && curQ && curQ.section === 'A') {
        const optLetter = optMatch[1].toUpperCase();
        let optText = optMatch[2].trim();
        const isUnderlined = /<u>|\bunderline\*|\*$/i.test(line) || /<u>/i.test(optText);
        optText = optText.replace(/<\/?u>/gi, '').replace(/\*$/g, '').trim();

        const optIdx = { 'A': 0, 'B': 1, 'C': 2, 'D': 3 }[optLetter] ?? curQ.opts.length;
        curQ.opts[optIdx] = optText;
        if (isUnderlined) {
          curQ.ci = optIdx;
          curQ.ans = optText;
        }
        continue;
      }

      const dsMatch = line.match(/^([a-d])\s*[:.)]\s*(.*)/i);
      if (dsMatch && curQ && curQ.section === 'B') {
        const isTrue = /đúng|true|\bđ\b/i.test(line);
        curQ.items.push({
          s: dsMatch[2].replace(/\[?(đúng|sai|true|false)\]?/gi, '').trim(),
          t: isTrue
        });
        continue;
      }

      const ansMatch = line.match(/^(?:đáp\s*(?:án|số)|key)\s*[:.]\s*(.*)/i);
      if (ansMatch && curQ) {
        curQ.ans = ansMatch[1].trim();
        continue;
      }

      if (curQ) {
        if (curQ.opts.length === 0 && curQ.items.length === 0) curQ.stem += ' ' + line;
      }
    }

    if (curQ) {
      if (curQ.section === 'A') partA.push(curQ);
      else if (curQ.section === 'B') partB.push(curQ);
      else if (curQ.section === 'C') partC.push(curQ);
    }

    const exam = {
      id: `custom-word-${Date.now()}`,
      title: title || 'Đề thi dạng từ đã chuyển sang KaTeX',
      grade: String(grade),
      min: 90,
      desc: 'Đề thi tự động nhận diện công thức LaTeX và các chuỗi chân là số.',
      isCustom: true,
      A: partA,
      B: partB,
      C: partC
    };

    return res.json({ ok: true, exam });
  } catch (err: any) {
    return res.status(500).json({ ok: false, msg: err?.message || 'Lỗi xử lý file đề thi' });
  }
});

// Serve Code.gs for direct viewing or downloading
app.get('/Code.gs', (_req, res) => {
  res.sendFile(path.resolve(__dirname, 'Code.gs'));
});
app.get('/api/code-gs', (_req, res) => {
  res.sendFile(path.resolve(__dirname, 'Code.gs'));
});
app.get('/api/download-code-gs', (_req, res) => {
  res.download(path.resolve(__dirname, 'Code.gs'), 'Code.gs');
});

// Built-in backend database storage persisted on disk
interface ServerStore {
  adminPass: string;
  weekly: any[];
  subs: any[];
  chat: any[];
  docs: any[];
  customLessons: Record<string, any>;
  sampleExams: any[];
}

const DATA_DIR = path.resolve(__dirname, 'data');
const STORE_FILE = path.resolve(DATA_DIR, 'db_store.json');

const DEFAULT_STORE: ServerStore = {
  adminPass: 'Tvtrong90@',
  weekly: [],
  subs: [],
  chat: [],
  sampleExams: [],
  docs: [
    {
      id: 'x1',
      tieu_de: 'Đề minh họa tốt nghiệp THPT môn Toán (Bộ GD&ĐT)',
      mo_ta: 'Đề chuẩn cấu trúc định dạng mới theo chương trình GDPT 2018',
      link: 'https://moet.gov.vn',
      tai_ve: '',
      loai: 'Đề thi',
      khoi: '12',
      ngay_them: new Date().toISOString()
    }
  ],
  customLessons: {
    "11-4": {
      title: "Bài 4. Phương trình lượng giác cơ bản",
      theory: `<div class="box">$\\sin u=\\sin v\\Leftrightarrow u=v+k2\\pi$ hoặc $u=\\pi-v+k2\\pi$<br>$\\cos u=\\cos v\\Leftrightarrow u=\\pm v+k2\\pi$<br>$\\tan u=\\tan v\\Leftrightarrow u=v+k\\pi$, &nbsp; $\\cot u=\\cot v\\Leftrightarrow u=v+k\\pi$ &nbsp; $(k\\in\\mathbb Z)$</div><p>Đặc biệt: $\\sin u=0\\Leftrightarrow u=k\\pi$; $\\cos u=0\\Leftrightarrow u=\\tfrac\\pi2+k\\pi$.</p>`
    }
  }
};

function initDbStore(): ServerStore {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(STORE_FILE)) {
      const raw = fs.readFileSync(STORE_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      const merged: ServerStore = Object.assign({}, DEFAULT_STORE, parsed);
      merged.customLessons = Object.assign({}, DEFAULT_STORE.customLessons, parsed.customLessons || {});
      return merged;
    }
    fs.writeFileSync(STORE_FILE, JSON.stringify(DEFAULT_STORE, null, 2), 'utf-8');
  } catch (e) {
    console.error('Failed to init persistent store:', e);
  }
  return Object.assign({}, DEFAULT_STORE);
}

const dbStore: ServerStore = initDbStore();

function persistDbStore() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(STORE_FILE, JSON.stringify(dbStore, null, 2), 'utf-8');
  } catch (e) {
    console.error('Failed to write dbStore to disk:', e);
  }
}

const BONUS_PTS = [30, 25, 20, 15, 15, 10, 10, 10, 10, 10];
function calcTier(score: number) {
  if (score >= 125) return 'Kim cương';
  if (score >= 115) return 'Vàng';
  if (score >= 105) return 'Bạc';
  if (score >= 100) return 'Đồng';
  return 'Khuyến khích';
}

// API: Backend handler supporting full school workflows
app.all('/api/backend', (req, res) => {
  if (req.method === 'GET') {
    return res.json({
      ok: true,
      status: 'online',
      message: 'Máy chủ Cloud Dạy học Toán Thầy Trần Trọng đang trực tuyến!'
    });
  }

  const r = req.body || {};
  const action = r.action;
  const now = Date.now();
  const isAdmin = r.token === 'cloud-admin' || r.token === 'demo-admin' || (r.pass && (r.pass === dbStore.adminPass || String(r.pass).toLowerCase() === dbStore.adminPass.toLowerCase()));

  // Public Actions
  if (action === 'getCustomLessons') {
    return res.json({ ok: true, customLessons: dbStore.customLessons || {} });
  }

  if (action === 'saveCustomLesson') {
    const id = String(r.id || '').trim();
    if (!id) return res.json({ ok: false, msg: 'Thiếu ID bài học.' });
    if (!dbStore.customLessons) dbStore.customLessons = {};
    dbStore.customLessons[id] = Object.assign({}, dbStore.customLessons[id] || {}, r.data || {});
    persistDbStore();
    return res.json({ ok: true, msg: 'Đã lưu bài học thành công lên máy chủ.' });
  }

  if (action === 'getSampleExams') {
    return res.json({ ok: true, sampleExams: dbStore.sampleExams || [] });
  }

  if (action === 'saveSampleExam') {
    const exam = r.exam;
    if (!exam || !exam.id) return res.json({ ok: false, msg: 'Thiếu dữ liệu đề mẫu.' });
    if (!dbStore.sampleExams) dbStore.sampleExams = [];
    const idx = dbStore.sampleExams.findIndex(x => x.id === exam.id);
    if (idx >= 0) {
      dbStore.sampleExams[idx] = exam;
    } else {
      dbStore.sampleExams.push(exam);
    }
    persistDbStore();
    return res.json({ ok: true, msg: 'Đã lưu đề mẫu lên máy chủ thành công!' });
  }

  if (action === 'deleteSampleExam') {
    const id = r.id;
    if (dbStore.sampleExams) {
      dbStore.sampleExams = dbStore.sampleExams.filter(x => x.id !== id);
      persistDbStore();
    }
    return res.json({ ok: true, msg: 'Đã xóa đề mẫu.' });
  }

  if (action === 'getWeekly') {
    const cur = dbStore.weekly.find(w => w.trang_thai === 'open' && new Date(w.ket_thuc).getTime() > now);
    const past = dbStore.weekly.filter(w => w !== cur).reverse();
    return res.json({
      ok: true,
      current: cur ? {
        id: cur.id,
        tieu_de: cur.tieu_de,
        noi_dung: cur.noi_dung,
        bat_dau: cur.bat_dau,
        ket_thuc: cur.ket_thuc,
        loai: cur.loai || 'tln',
        phuong_an: cur.phuong_an || [],
        anh: cur.anh || ''
      } : null,
      past: past
    });
  }

  if (action === 'submit') {
    const cur = dbStore.weekly.find(w => w.id === r.id && w.trang_thai === 'open');
    if (!cur) return res.json({ ok: false, msg: 'Bài toán đã hết hạn nộp hoặc không tồn tại.' });

    const sdt = String(r.so_dien_thoai || '').trim();
    if (dbStore.subs.some(s => s.id_bai === r.id && s.so_dien_thoai === sdt)) {
      return res.json({ ok: false, msg: 'Số điện thoại này đã nộp bài tuần này rồi.' });
    }

    const loai = cur.loai || 'tln';
    const hasSol = String(r.loi_giai || '').trim() ? 5 : 0;
    let dung: any = false;
    let diem = 0;
    let cho = false;

    if (loai === 'tl') {
      cho = true;
      dung = '';
    } else if (loai === 'mcq') {
      dung = String(r.dap_so || '').toUpperCase() === String(cur.dap_so || '').toUpperCase();
    } else {
      const studentNum = Number(String(r.dap_so || '').replace(',', '.'));
      const targetNum = Number(cur.dap_so);
      const tol = Number(cur.sai_so || 0.001);
      dung = Math.abs(studentNum - targetNum) <= tol + 1e-9;
    }

    const correctOrder = dbStore.subs.filter(s => s.id_bai === r.id && s.dung === true).length;
    if (!cho) {
      if (dung) {
        const bonus = correctOrder < BONUS_PTS.length ? BONUS_PTS[correctOrder] : 5;
        diem = 100 + bonus + hasSol;
      } else {
        diem = 10 + hasSol;
      }
    }

    const hang = cho ? '' : calcTier(diem);
    dbStore.subs.push({
      id: 'S' + now,
      thoi_gian: new Date().toISOString(),
      id_bai: r.id,
      ho_ten: r.ho_ten,
      lop_truong: r.lop_truong,
      dia_chi: r.dia_chi,
      so_dien_thoai: sdt,
      dap_so_gui: r.dap_so || '',
      loi_giai_gui: r.loi_giai || '',
      anh_bai_lam: r.anh_data ? 'data:image/jpeg;base64,' + r.anh_data : '',
      dung,
      diem,
      hang,
      trang_thai_cham: cho ? 'cho' : 'da_cham'
    });

    return res.json({
      ok: true,
      dung,
      diem,
      hang,
      cho,
      thu_tu: dung ? (correctOrder + 1) : null
    });
  }

  if (action === 'getRank') {
    const map: Record<string, any> = {};
    const curWeekly = dbStore.weekly.find(w => w.trang_thai === 'open');
    const curId = curWeekly ? curWeekly.id : null;

    dbStore.subs.forEach(s => {
      if (s.trang_thai_cham === 'cho') return;
      if (r.scope === 'week' && s.id_bai !== curId) return;
      const k = String(s.so_dien_thoai || '').replace(/^'/, '');
      if (!k) return;
      if (!map[k]) {
        map[k] = {
          ten: s.ho_ten,
          lop: s.lop_truong,
          sdt: k.length >= 7 ? k.slice(0, 3) + '****' + k.slice(-3) : k,
          diem: 0,
          so_bai: 0,
          t: s.thoi_gian
        };
      }
      map[k].diem += Number(s.diem || 0);
      map[k].so_bai += 1;
    });

    const rows = Object.values(map).sort((a: any, b: any) => b.diem - a.diem || a.t.localeCompare(b.t)).slice(0, 30);
    return res.json({ ok: true, rows });
  }

  if (action === 'getDocs') {
    return res.json({ ok: true, docs: dbStore.docs.slice().reverse() });
  }

  if (action === 'chatSend') {
    const text = String(r.noi_dung || '').trim().slice(0, 1000);
    if (!text) return res.json({ ok: false, msg: 'Tin nhắn trống.' });
    dbStore.chat.push({
      thoi_gian: new Date().toISOString(),
      id_khach: r.vid || 'guest',
      ten: r.ten || 'Học sinh',
      lien_he: r.lien_he || '',
      tu: 'khach',
      noi_dung: text,
      da_doc: false
    });
    return res.json({ ok: true });
  }

  if (action === 'chatGet') {
    const msgs = dbStore.chat
      .filter(m => m.id_khach === r.vid)
      .map(m => ({ tu: m.tu, noi_dung: m.noi_dung, thoi_gian: m.thoi_gian }));
    return res.json({ ok: true, msgs });
  }

  if (action === 'login') {
    const input = String(r.pass || '').trim();
    if (input && (input === dbStore.adminPass || input.toLowerCase() === dbStore.adminPass.toLowerCase())) {
      return res.json({ ok: true, token: 'cloud-admin' });
    }
    return res.json({ ok: false, msg: 'Sai mật khẩu quản trị.' });
  }

  // Admin Actions
  if (!isAdmin) {
    return res.json({ ok: false, msg: 'Yêu cầu quyền quản trị.' });
  }

  if (action === 'changePass') {
    const np = String(r.newPass || '').trim();
    if (!np || np.length < 3) return res.json({ ok: false, msg: 'Mật khẩu tối thiểu 3 ký tự.' });
    dbStore.adminPass = np;
    return res.json({ ok: true, msg: 'Đã đổi mật khẩu thành công!' });
  }

  if (action === 'resetPass') {
    dbStore.adminPass = 'Tvtrong90@';
    return res.json({ ok: true, msg: 'Đã đặt lại mật khẩu mặc định!' });
  }

  if (action === 'bank') {
    return res.json({
      ok: true,
      bank: [
        { key: 'd1', tieu_de: 'Giá trị lớn nhất', noi_dung: 'Tìm giá trị lớn nhất của hàm số $y=-x^2+4x+1$.', loai: 'tln', dap_so: 5, sai_so: 0.001, loi_giai: '$y=5-(x-2)^2\\le5$, dấu bằng khi $x=2$.' },
        { key: 'd2', tieu_de: 'Đếm tập con', noi_dung: 'Tập hợp $A$ có $5$ phần tử. Hỏi $A$ có bao nhiêu tập con?', loai: 'tln', dap_so: 32, sai_so: 0.001, loi_giai: 'Số tập con là $2^5=32$.' }
      ]
    });
  }

  if (action === 'publish') {
    const b = r.custom;
    if (!b) return res.json({ ok: false, msg: 'Thiếu nội dung bài toán.' });
    dbStore.weekly.forEach(w => {
      if (w.trang_thai === 'open') {
        w.trang_thai = 'closed';
        w.ket_thuc = new Date().toISOString();
      }
    });
    dbStore.weekly.push({
      id: 'W' + now,
      tieu_de: b.tieu_de,
      noi_dung: b.noi_dung,
      loai: b.loai || 'tln',
      phuong_an: b.phuong_an || [],
      anh: b.anh || '',
      dap_so: b.dap_so,
      sai_so: b.sai_so || 0.001,
      loi_giai: b.loi_giai || '',
      bat_dau: new Date().toISOString(),
      ket_thuc: new Date(now + (Number(r.days || 7)) * 864e5).toISOString(),
      trang_thai: 'open'
    });
    return res.json({ ok: true });
  }

  if (action === 'closeWeekly') {
    dbStore.weekly.forEach(w => {
      if (w.trang_thai === 'open') {
        w.trang_thai = 'closed';
        w.ket_thuc = new Date().toISOString();
      }
    });
    return res.json({ ok: true });
  }

  if (action === 'subs') {
    return res.json({
      ok: true,
      rows: dbStore.subs.slice().reverse(),
      weekly: dbStore.weekly.map(w => ({ id: w.id, tieu_de: w.tieu_de, loai: w.loai || 'tln' }))
    });
  }

  if (action === 'gradeSub') {
    const s = dbStore.subs.find(x => x.id === r.id);
    if (!s) return res.json({ ok: false, msg: 'Không tìm thấy bài nộp.' });
    const p = Math.max(0, Math.min(150, Number(r.diem || 0)));
    s.diem = p;
    s.hang = calcTier(p);
    s.dung = p >= 100;
    s.trang_thai_cham = 'da_cham';
    return res.json({ ok: true });
  }

  if (action === 'upload') {
    return res.json({
      ok: true,
      url: 'data:' + r.mime + ';base64,' + r.data,
      img: 'data:' + r.mime + ';base64,' + r.data,
      dl: 'data:' + r.mime + ';base64,' + r.data
    });
  }

  if (action === 'addDoc') {
    dbStore.docs.push({
      id: 'D' + now,
      tieu_de: r.tieu_de,
      mo_ta: r.mo_ta || '',
      link: r.link,
      tai_ve: r.tai_ve || '',
      loai: r.loai,
      khoi: r.khoi,
      ngay_them: new Date().toISOString()
    });
    persistDbStore();
    return res.json({ ok: true });
  }

  if (action === 'delDoc') {
    dbStore.docs = dbStore.docs.filter(x => x.id !== r.id);
    persistDbStore();
    return res.json({ ok: true });
  }

  if (action === 'chatList') {
    const m: Record<string, any> = {};
    dbStore.chat.forEach(x => {
      const o = m[x.id_khach] = m[x.id_khach] || { vid: x.id_khach, ten: '', lien_he: '', unread: 0 };
      if (x.tu === 'khach') {
        o.ten = x.ten;
        o.lien_he = x.lien_he;
        if (!x.da_doc) o.unread++;
      }
      o.last = x.noi_dung;
      o.time = x.thoi_gian;
    });
    return res.json({ ok: true, threads: Object.values(m).sort((a: any, b: any) => b.time.localeCompare(a.time)) });
  }

  if (action === 'chatThread') {
    dbStore.chat.forEach(x => { if (x.id_khach === r.vid) x.da_doc = true; });
    return res.json({ ok: true, msgs: dbStore.chat.filter(m => m.id_khach === r.vid) });
  }

  if (action === 'chatReply') {
    const t = String(r.noi_dung || '').trim().slice(0, 1000);
    if (!t) return res.json({ ok: false, msg: 'Tin nhắn trống.' });
    dbStore.chat.push({
      thoi_gian: new Date().toISOString(),
      id_khach: r.vid,
      ten: 'Thầy Trần Trọng',
      lien_he: '',
      tu: 'thay',
      noi_dung: t,
      da_doc: true
    });
    return res.json({ ok: true });
  }

  return res.json({ ok: false, msg: 'Hành động không hợp lệ: ' + action });
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${port}`);
  });
}

startServer();
