import confetti from 'canvas-confetti';
import './index.css';
import './exactExamGenerator.js';
import './wordExamConverter.js';
import './mathEngine.js';

/**
 * Hiệu ứng pháo hoa mừng học sinh nộp bài và đạt điểm giỏi (>= 8 điểm)
 * Sử dụng thư viện canvas-confetti với nhiều đợt bắn pháo hoa từ 2 bên màn hình
 */
export function triggerFireworks() {
  const duration = 3.5 * 1000;
  const animationEnd = Date.now() + duration;
  const defaults = { startVelocity: 35, spread: 360, ticks: 70, zIndex: 99999 };

  function randomInRange(min: number, max: number) {
    return Math.random() * (max - min) + min;
  }

  // Tiếng pháo hoa & chùm pháo mở đầu rực rỡ
  confetti({
    particleCount: 80,
    spread: 100,
    origin: { y: 0.6 },
    colors: ['#fbbf24', '#f59e0b', '#ef4444', '#10b981', '#3b82f6', '#ec4899']
  });

  // Loạt pháo hoa liên hoàn từ hai bên góc màn hình
  const interval: any = setInterval(() => {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      clearInterval(interval);
      return;
    }

    const particleCount = Math.floor(45 * (timeLeft / duration));

    // Bắn từ bên trái
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.1, 0.35), y: Math.random() * 0.4 + 0.1 },
      colors: ['#fbbf24', '#f59e0b', '#ef4444', '#10b981', '#ffffff']
    });

    // Bắn từ bên phải
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.65, 0.9), y: Math.random() * 0.4 + 0.1 },
      colors: ['#38bdf8', '#818cf8', '#ec4899', '#facc15', '#4ade80']
    });
  }, 250);
}

// Gắn vào window để gọi từ mathEngine.js và các component
(window as any).confetti = confetti;
(window as any).triggerFireworks = triggerFireworks;

// Setup AI Assistant Modal & Interactive Logic
function setupAIAssistant() {
  const modal = document.getElementById('aiModal');
  const closeBtn = document.getElementById('aiModalClose');
  const navAiBtn = document.getElementById('navAiBtn');
  const fabBtn = document.getElementById('aiFabBtn');

  if (!modal) return;

  const openModal = () => {
    modal.style.display = 'flex';
  };

  const closeModal = () => {
    modal.style.display = 'none';
  };

  navAiBtn?.addEventListener('click', openModal);
  fabBtn?.addEventListener('click', openModal);
  closeBtn?.addEventListener('click', closeModal);

  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  // Tab switching
  const tabExplain = document.getElementById('aiTabExplain');
  const tabGen = document.getElementById('aiTabGen');
  const viewExplain = document.getElementById('aiViewExplain');
  const viewGen = document.getElementById('aiViewGen');

  tabExplain?.addEventListener('click', () => {
    tabExplain.classList.add('on');
    tabGen?.classList.remove('on');
    if (viewExplain) viewExplain.style.display = 'block';
    if (viewGen) viewGen.style.display = 'none';
  });

  tabGen?.addEventListener('click', () => {
    tabGen.classList.add('on');
    tabExplain?.classList.remove('on');
    if (viewGen) viewGen.style.display = 'block';
    if (viewExplain) viewExplain.style.display = 'none';
  });

  // Explain Query
  const btnAsk = document.getElementById('aiBtnAsk');
  const btnClear = document.getElementById('aiBtnClear');
  const inputPrompt = document.getElementById('aiInputPrompt') as HTMLTextAreaElement | null;
  const answerBox = document.getElementById('aiAnswerBox');
  const answerText = document.getElementById('aiAnswerText');

  btnClear?.addEventListener('click', () => {
    if (inputPrompt) inputPrompt.value = '';
    if (answerBox) answerBox.style.display = 'none';
  });

  // Markdown to formatted HTML parser for AI answers
  const formatMarkdownHtml = (text: string): string => {
    if (!text) return '';
    let html = text
      // Replace headers
      .replace(/^### (.*$)/gim, '<h4 style="font-weight:800;color:#0B5563;margin:12px 0 6px;font-size:15px;">$1</h4>')
      .replace(/^## (.*$)/gim, '<h3 style="font-weight:800;color:#0B5563;margin:14px 0 8px;font-size:16px;">$1</h3>')
      .replace(/^# (.*$)/gim, '<h2 style="font-weight:900;color:#0B5563;margin:16px 0 10px;font-size:18px;">$1</h2>')
      // Bold and italic
      .replace(/\*\*(.*?)\*\*/gim, '<strong style="color:#0B2A3C;">$1</strong>')
      .replace(/\*(.*?)\*/gim, '<em>$1</em>')
      // Blockquotes
      .replace(/^\> (.*$)/gim, '<blockquote style="border-left:3px solid #0E7C86;padding-left:10px;margin:8px 0;color:#0B5563;background:#E0F2F1;padding:6px 10px;border-radius:4px;">$1</blockquote>')
      // Horizontal rules
      .replace(/^---$/gim, '<hr style="border:0;border-top:1px dashed #B5CDD2;margin:10px 0;">')
      // Lists
      .replace(/^\* (.*$)/gim, '<div style="display:flex;gap:6px;margin:3px 0 3px 12px;"><span>•</span><span>$1</span></div>')
      .replace(/^[0-9]+\. (.*$)/gim, '<div style="margin:4px 0 4px 12px;"><b>$&</b></div>')
      // Line breaks
      .replace(/\n\n/g, '<div style="height:8px"></div>')
      .replace(/\n/g, '<br>');
    return html;
  };

  btnAsk?.addEventListener('click', async () => {
    const query = inputPrompt?.value?.trim();
    if (!query) {
      alert('Vui lòng nhập thắc mắc hoặc câu hỏi cần giải thích.');
      return;
    }

    if (btnAsk) {
      btnAsk.setAttribute('disabled', 'true');
      btnAsk.textContent = 'Thầy đang soạn bài giảng chi tiết...';
    }

    if (answerBox && answerText) {
      answerBox.style.display = 'block';
      answerText.innerHTML = `<div style="color:#0B5563;font-weight:600;display:flex;align-items:center;gap:8px;"><span class="animate-spin">⏳</span> Thầy Trần Trọng đang phân tích câu hỏi và soạn lời giải chi tiết theo SGK Kết nối tri thức...</div>`;
    }

    try {
      const res = await fetch('/api/ai/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: 'Toán THPT Kết nối tri thức',
          step: query,
          userQuery: query,
        }),
      });
      const data = await res.json();
      if (answerBox && answerText) {
        answerText.innerHTML = formatMarkdownHtml(data.explanation || 'Không thể tạo lời giải thích vào lúc này.');
        answerBox.style.display = 'block';
        if ((window as any).renderMathInElement) {
          (window as any).renderMathInElement(answerText, {
            delimiters: [
              { left: '$$', right: '$$', display: true },
              { left: '$', right: '$', display: false },
            ],
            throwOnError: false,
          });
        }
      }
    } catch {
      // Local pedagogical knowledge base covering primary, secondary, and high school (Kết nối tri thức)
      const q = query.toLowerCase();
      let fallback = '';

      if (q.includes('bậc 2') || q.includes('bậc hai')) {
        fallback = `### Hướng dẫn giải phương trình bậc hai một ẩn $ax^2 + bx + c = 0$ ($a \\neq 0$)\n*(Chuẩn SGK Toán THCS & THPT Kết nối tri thức với cuộc sống)*\n\n#### 1. Dạng tổng quát & Điều kiện:\n$$ax^2 + bx + c = 0 \\quad (a \\neq 0)$$\n\n#### 2. Các bước giải chi tiết:\n- **Bước 1 (Xác định hệ số):** Đưa phương trình về dạng chuẩn, xác định $a, b, c$ ($a \\neq 0$).\n- **Bước 2 (Mẹo nhẩm nghiệm nhanh):**\n  - Nếu $a + b + c = 0 \\implies x_1 = 1, \\ x_2 = \\dfrac{c}{a}$.\n  - Nếu $a - b + c = 0 \\implies x_1 = -1, \\ x_2 = -\\dfrac{c}{a}$.\n- **Bước 3 (Công thức tổng quát $\\Delta = b^2 - 4ac$):**\n  - $\\Delta < 0$: Phương trình **vô nghiệm** trên $\\mathbb{R}$.\n  - $\\Delta = 0$: Phương trình có **nghiệm kép**: $x_1 = x_2 = -\\dfrac{b}{2a}$.\n  - $\\Delta > 0$: Phương trình có **2 nghiệm phân biệt**: $x_{1,2} = \\dfrac{-b \\pm \\sqrt{\\Delta}}{2a}$.\n\n*(Nếu $b = 2b'$ chẵn, dùng $\\Delta' = (b')^2 - ac$ với $x_{1,2} = \\dfrac{-b' \\pm \\sqrt{\\Delta'}}{a}$)*.\n\n> **Mẹo Casio fx-880 BTG:** Nhấn **HOME** ➔ chọn **Equation** ➔ chọn **Polynomial** ➔ chọn bậc 2 và nhập hệ số $a, b, c$ ➔ bấm **EXE** để hiển thị nghiệm và toạ độ đỉnh Parabol.\n\n#### 3. Ví dụ áp dụng:\nGiải phương trình: $x^2 - 5x + 6 = 0$\n- $a = 1, b = -5, c = 6$.\n- $\\Delta = (-5)^2 - 4 \\cdot 1 \\cdot 6 = 1 > 0$.\n- Do $\\Delta > 0$, phương trình có hai nghiệm phân biệt: $x_1 = 3, \\ x_2 = 2$.\n- Kết luận: Tập nghiệm $S = \\{2; 3\\}$.`;
      } else if (q.includes('tổng và hiệu') || q.includes('tổng hiệu')) {
        fallback = `### Hướng dẫn giải bài toán Tìm hai số khi biết Tổng và Hiệu (Toán Tiểu học)\n\n#### 1. Công thức cốt lõi:\n- **Số bé** = $(\\text{Tổng} - \\text{Hiệu}) : 2$\n- **Số lớn** = $(\\text{Tổng} + \\text{Hiệu}) : 2$\n\n#### 2. Các bước giải chuẩn:\n- **Bước 1:** Xác định rõ đâu là Tổng, đâu là Hiệu.\n- **Bước 2:** Vẽ sơ đồ đoạn thẳng biểu thị Số lớn và Số bé.\n- **Bước 3:** Áp dụng công thức tính và viết đáp số có kèm danh số.`;
      } else if (q.includes('rút về đơn vị') || q.includes('rut ve don vi')) {
        fallback = `### Hướng dẫn giải bài toán Rút Về Đơn Vị (Toán Tiểu học)\n\n#### 1. Bản chất phương pháp:\nTìm giá trị của **$1$ đơn vị** (bằng phép chia), sau đó tính giá trị của nhiều đơn vị (bằng phép nhân).\n\n#### 2. Các bước giải chi tiết:\n- **Bước 1 (Rút về đơn vị):** Tìm giá trị của $1$ đơn vị $\\Rightarrow$ Thực hiện phép chia $:$.\n- **Bước 2:** Tìm giá trị của số lượng đơn vị theo yêu cầu đề bài $\\Rightarrow$ Lấy giá trị $1$ đơn vị nhân $\\times$ với số lượng đó.`;
      } else if (q.includes('chuyển động') || q.includes('vận tốc')) {
        fallback = `### Hướng dẫn giải bài toán Chuyển động đều (Toán Tiểu học & THCS)\n\n#### 1. Ba công thức cốt lõi:\n$$s = v \\times t, \\quad v = s : t, \\quad t = s : v$$\n\n#### 2. Chuyển động ngược chiều và cùng chiều:\n- Hai vật chuyển động ngược chiều gặp nhau: $v_{\\text{gặp}} = v_1 + v_2 \\implies t_{\\text{gặp}} = s : (v_1 + v_2)$.\n- Hai vật chuyển động cùng chiều đuổi nhau: $v_{\\text{đuổi}} = v_1 - v_2 \\implies t_{\\text{đuổi}} = \\text{Khoảng cách} : (v_1 - v_2)$.`;
      } else if (q.includes('cực trị') || q.includes('cực đại') || q.includes('cực tiểu')) {
        fallback = `### Phương pháp tìm cực trị của hàm số (Toán 12 - Kết nối tri thức)\n\n#### 1. Quy tắc xét dấu đạo hàm cấp 1:\n- **Bước 1:** Tìm tập xác định $D$ của hàm số $y = f(x)$.\n- **Bước 2:** Tính đạo hàm $f'(x)$. Giải phương trình $f'(x) = 0$ và tìm các điểm đạo hàm không xác định.\n- **Bước 3:** Lập bảng biến thiên:\n  - Nếu $f'(x)$ đổi dấu từ **dương $(+)$ sang âm $(-)$** khi qua $x_0 \\implies x_0$ là **điểm cực đại**.\n  - Nếu $f'(x)$ đổi dấu từ **âm $(-)$ sang dương $(+)$** khi qua $x_0 \\implies x_0$ là **điểm cực tiểu**.\n\n> **Mẹo fx-880 BTG:** Sử dụng chức năng **TABLE** lập bảng giá trị của hàm số với Step nhỏ để quan sát điểm đổi chiều tăng giảm.`;
      } else {
        fallback = `### Hướng dẫn sư phạm từ Thầy Trần Trọng (Sách Kết nối tri thức)\n\nĐối với câu hỏi của em về *\"${query}\"*:\n\n1. **Nhận dạng kiến thức:** Xác định dạng toán thuộc khối lớp tương ứng (Tiểu học, THCS hoặc THPT).\n2. **Công thức cốt lõi:** Luôn xuất phát từ định nghĩa, định lý chuẩn trong SGK Kết nối tri thức với cuộc sống.\n3. **Thực hiện giải toán:** Trình bày rõ ràng từng bước theo cấu trúc tự luận logic hoặc dùng kỹ thuật bấm máy tính Casio fx-880 BTG để kiểm tra nghiệm.`;
      }
      if (answerBox && answerText) {
        answerText.innerHTML = formatMarkdownHtml(fallback);
        answerBox.style.display = 'block';
        if ((window as any).renderMathInElement) {
          (window as any).renderMathInElement(answerText, {
            delimiters: [
              { left: '$$', right: '$$', display: true },
              { left: '$', right: '$', display: false },
            ],
            throwOnError: false,
          });
        }
      }
    } finally {
      if (btnAsk) {
        btnAsk.removeAttribute('disabled');
        btnAsk.innerHTML = `<svg class="ico"><use href="#i-bolt"/></svg>Hỏi Trợ lý AI`;
      }
    }
  });

  // AI Dynamic Question Generator
  const btnGenNew = document.getElementById('aiBtnGenerateNew');
  const gradeSel = document.getElementById('aiGradeSelect') as HTMLSelectElement | null;
  const diffSel = document.getElementById('aiDiffSelect') as HTMLSelectElement | null;
  const genResult = document.getElementById('aiGenResult');
  const genContent = document.getElementById('aiGenContent');

  btnGenNew?.addEventListener('click', async () => {
    const grade = gradeSel?.value || '12';
    const diff = diffSel?.value || 'Thông hiểu';

    if (btnGenNew) {
      btnGenNew.setAttribute('disabled', 'true');
      btnGenNew.textContent = 'Đang tạo câu hỏi...';
    }

    try {
      const res = await fetch('/api/ai/generate-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: `Toán ${grade} - Chương trình GDPT 2018`,
          grade,
          difficulty: diff,
        }),
      });
      const data = await res.json();
      const q = data.question || data;
      if (genResult && genContent) {
        genContent.innerHTML = `
          <div style="font-weight:700;color:#0B5563;margin-bottom:8px">
            [Toán ${grade} - Mức độ: ${diff}]
          </div>
          <div style="font-size:15px;margin-bottom:12px">${q.question || ''}</div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:14px">
            ${(q.options || [])
              .map(
                (opt: any) => `
              <div style="border:1.5px solid #DCE7EB;border-radius:8px;padding:8px 12px;background:#F5F9FA">
                <b>${opt.id}.</b> ${opt.text}
              </div>
            `
              )
              .join('')}
          </div>
          <details style="border-top:1px dashed #DCE7EB;padding-top:10px">
            <summary style="font-weight:700;color:#1E7A4F;cursor:pointer">Xem đáp án & Lời giải chi tiết</summary>
            <div style="margin-top:8px;background:#E6F4EC;padding:10px 14px;border-radius:8px;font-size:14px">
              <b>Đáp án đúng: ${q.correctAnswer}</b>
              <p style="margin:6px 0 0">${q.explanation || ''}</p>
            </div>
          </details>
        `;
        genResult.style.display = 'block';
        if ((window as any).renderMathInElement) {
          (window as any).renderMathInElement(genContent, {
            delimiters: [
              { left: '$$', right: '$$', display: true },
              { left: '$', right: '$', display: false },
            ],
            throwOnError: false,
          });
        }
      }
    } catch {
      alert('Không thể kết nối đến máy chủ sinh đề. Vui lòng thử lại!');
    } finally {
      if (btnGenNew) {
        btnGenNew.removeAttribute('disabled');
        btnGenNew.textContent = '✨ AI Sinh câu hỏi mới';
      }
    }
  });
}

// Initialize on DOM load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setupAIAssistant);
} else {
  setupAIAssistant();
}
