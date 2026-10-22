import React, { useMemo } from 'react';
import katex from 'katex';

interface MathViewProps {
  math?: string;
  text?: string;
  content?: string;
  display?: boolean;
  inline?: boolean;
  className?: string;
}

/**
 * Tự động sửa chữa và phòng ngừa lỗi KaTeX trước khi ném ngoại lệ
 */
function safeKatexRender(latex: string, displayMode: boolean): string {
  if (!latex || !latex.trim()) return '';
  let cleanLatex = latex.trim();

  // 1. Khử triệt để ký tự điều khiển ẩn, zero-width, ký tự quotes và ký tự hộp vuông (□)
  cleanLatex = cleanLatex.replace(/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f\ufffd\ufeff]/g, ' ');
  cleanLatex = cleanLatex.replace(/[\u200b-\u200f\u202a-\u202e\u2060]/g, '');
  cleanLatex = cleanLatex.replace(/[\u25a0-\u25ff]/g, ' ');
  // Khử quotes và dấu ngoặc kép bên trong công thức KaTeX
  cleanLatex = cleanLatex.replace(/["“”'‘’]/g, '');

  // 2. Khử triệt để escape kép \\\\alpha -> \alpha, \\left -> \left
  cleanLatex = cleanLatex.replace(/\\\\+([a-zA-Z{}()\[\]|])/g, (_, w) => '\\' + w);
  cleanLatex = cleanLatex.replace(/\\\\+/g, '\\');

  // 3. Khử lỗi ký hiệu độ OMML: 0{}^\circ, 180{}^\circ, {}^\circ -> 0^\circ, 180^\circ
  cleanLatex = cleanLatex.replace(/(-?\d+)\s*(?:\{\}\s*)?\^\{\s*\\circ\s*\}/g, '$1^\\circ');
  cleanLatex = cleanLatex.replace(/(-?\d+)\s*\{\}\s*\^\\circ/g, '$1^\\circ');
  cleanLatex = cleanLatex.replace(/\{\}\s*\^\\circ/g, '^\\circ');
  cleanLatex = cleanLatex.replace(/(-?\d+)\s*(?:°|độ)/g, '$1^\\circ');
  cleanLatex = cleanLatex.replace(/\{([0-9a-zA-Z]+)\}\^\{\^\\circ\}/g, '{$1}^\\circ');
  cleanLatex = cleanLatex.replace(/\^\{\^\\circ\}/g, '^\\circ');

  // 4. Chuẩn hóa ký hiệu hộp vuông \Box và \square thành \quad hoặc khoảng trắng
  cleanLatex = cleanLatex.replace(/\\(?:Box|square)\b/g, '\\quad ');

  // 5. Chuẩn hóa khoảng cách \\,\\, thành \quad
  cleanLatex = cleanLatex.replace(/\\,\\,/g, '\\quad ');
  cleanLatex = cleanLatex.replace(/\\\\,/g, '\\,');

  // 6. Sửa ngoặc rỗng \left(\right) -> ()
  cleanLatex = cleanLatex.replace(/\\left\(\s*\\right\)/g, '()');
  cleanLatex = cleanLatex.replace(/\\left\[\s*\\right\]/g, '[]');
  cleanLatex = cleanLatex.replace(/\\left\\\{\s*\\right\\\}/g, '\\{\\}');

  // 7. Khử lỗi gạch chéo kép \\ bên trong biểu thức không phải ma trận hoặc hệ phương trình
  if (!cleanLatex.includes('\\begin{matrix}') && !cleanLatex.includes('\\begin{cases}') && !cleanLatex.includes('\\begin{aligned}') && !cleanLatex.includes('\\begin{array}')) {
    cleanLatex = cleanLatex.replace(/\\\\(?![a-zA-Z{}()\[\]|])/g, ' ');
  }

  // 8. Sửa lỗi % không escape
  cleanLatex = cleanLatex.replace(/(?<!\\)%/g, '\\%');

  // 9. Sửa lỗi thiếu ngoặc đóng \left( không có \right)
  const leftCount = (cleanLatex.match(/\\left\b/g) || []).length;
  const rightCount = (cleanLatex.match(/\\right\b/g) || []).length;
  if (leftCount > rightCount) {
    cleanLatex += ' \\right.'.repeat(leftCount - rightCount);
  } else if (rightCount > leftCount) {
    cleanLatex = '\\left.'.repeat(rightCount - leftCount) + cleanLatex;
  }

  // 10. Thử render lần 1 với KaTeX
  try {
    return katex.renderToString(cleanLatex, {
      displayMode,
      throwOnError: true,
      strict: false,
    });
  } catch {
    // Thử auto-repair lần 2 nếu lỗi cú pháp delimiter
    try {
      let repaired = cleanLatex.replace(/\\left\s*\\?([([{])/g, '\\$1').replace(/\\right\s*\\?([)\]}])/g, '\\$1');
      repaired = repaired.replace(/\\left\./g, '').replace(/\\right\./g, '');
      return katex.renderToString(repaired, {
        displayMode,
        throwOnError: true,
        strict: false,
      });
    } catch {
      // Thử lần 3: bọc văn bản an toàn
      try {
        const textRepaired = cleanLatex.replace(/[^\x20-\x7E\u00A0-\u024F\u0370-\u03FF\u2100-\u214F\u2200-\u22FF]/g, ' ');
        return katex.renderToString(textRepaired, {
          displayMode,
          throwOnError: true,
          strict: false,
        });
      } catch {
        // Fallback: Tuyệt đối không để KaTeX render chữ đỏ lỗi
        const displaySafe = cleanLatex
          .replace(/\\left|\\right/g, '')
          .replace(/\\([a-zA-Z]+)/g, '$1')
          .replace(/[{}]/g, '');
        return `<span class="font-mono text-slate-800 dark:text-slate-200">${displaySafe}</span>`;
      }
    }
  }
}

/**
 * Chuẩn hóa chuỗi văn bản chứa công thức toán sang định dạng KaTeX sạch.
 * Sử dụng cơ chế tokenization an toàn tuyệt đối không gây lồng dấu $ (nested $)
 */
export function normalizeMathString(raw: string): string {
  if (!raw) return '';
  let str = String(raw).trim();

  // 0. Khử triệt để ký tự điều khiển ẩn (\x00 - \x1f), zero-width và ký tự hộp vuông (□)
  str = str.replace(/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f\ufffd\ufeff]/g, ' ')
           .replace(/[\u200b-\u200f\u202a-\u202e\u2060]/g, '')
           .replace(/[\u25a0-\u25ff]/g, ' ');

  // Khử quotes bọc ngoài hoặc bên trong $...$
  str = str.replace(/\$["“”']\s*([^$]+?)\s*["“”']\$/g, '$$$1$$');

  // 1. Chuẩn hóa escape backslash kép thành đơn: \\alpha -> \alpha, \\left -> \left
  str = str.replace(/\\\\+([a-zA-Z{}()\[\]|])/g, (_, w) => `\\${w}`);

  // 2. Chuẩn hóa ký hiệu độ OMML: 0{}^\circ, 180{}^\circ, {}^\circ -> 0^\circ, 180^\circ
  str = str.replace(/(-?\d+)\s*(?:\{\}\s*)?\^\{\s*\\circ\s*\}/g, '$1^\\circ');
  str = str.replace(/(-?\d+)\s*\{\}\s*\^\\circ/g, '$1^\\circ');
  str = str.replace(/\{\}\s*\^\\circ/g, '^\\circ');
  str = str.replace(/(-?\d+)\s*(?:°|độ)/g, '$1^\\circ');
  str = str.replace(/\{([0-9a-zA-Z]+)\}\^\{\^\\circ\}/g, '{$1}^\\circ');
  str = str.replace(/\^\{\^\\circ\}/g, '^\\circ');

  // 3. Chuẩn hóa hiệu hai tập hợp: A\B -> A \setminus B
  str = str.replace(/\b([A-Z])\s*\\\s*([A-Z])\b/g, '$1 \\setminus $2');

  // 4. Chuẩn hóa hộp vuông \square và \Box thành \quad
  str = str.replace(/\\(?:Box|square)\b/g, '\\quad ');
  str = str.replace(/\\,\\,/g, '\\quad ');
  str = str.replace(/\\\\,/g, '\\,');

  // 5. Kiểm tra xem toàn bộ chuỗi có phải là một biểu thức toán thuần túy (không có văn bản tiếng Việt dài)
  const hasVietnamese = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i.test(str);

  // Nếu chuỗi đã được bao bọc trọn vẹn bởi $...$ hoặc $$...$$
  if (/^\$[^$]+\$$/.test(str)) {
    const inner = str.slice(1, -1).trim().replace(/\$/g, '');
    return `$${inner}$`;
  }
  if (/^\$\$[\s\S]+\$\$$/.test(str)) {
    const inner = str.slice(2, -2).trim().replace(/\$/g, '');
    return `$$${inner}$$`;
  }

  // Nếu là biểu thức toán học hoặc phương án trắc nghiệm không có tiếng Việt
  // Ví dụ: -\frac{5\pi}{4}, 6\pi\text{ cm}, \tan\alpha = -3, \cos\alpha = -\frac{4}{5}, A(1; 0)
  const isPureMathExpression = !hasVietnamese && (
    /[\\^_{}=<>]/.test(str) ||
    /^[A-D]\([0-9; -]+\)$/.test(str) ||
    /^[-+]?[0-9]*\s*\\?(?:pi|alpha|beta|gamma|theta|varphi|sqrt|frac|sin|cos|tan|cot)/i.test(str) ||
    /\\text\{[^}]+\}/.test(str)
  );

  if (isPureMathExpression) {
    const cleanMath = str.replace(/\$/g, '').trim();
    return `$${cleanMath}$`;
  }

  // 6. Xử lý văn bản hỗn hợp (câu hỏi, đề bài, lời giải):
  // BẢO VỆ TUYỆT ĐỐI các khối $...$ và $$...$$ đã có sẵn bằng token
  const placeholders: string[] = [];
  str = str.replace(/(\$\$[\s\S]*?\$\$|\$[^$]+?\$)/g, (match) => {
    // Làm sạch bên trong khối $ hiện tại để không có dấu $ thừa lồng nhau
    const isDouble = match.startsWith('$$');
    const content = isDouble ? match.slice(2, -2).replace(/\$/g, '') : match.slice(1, -1).replace(/\$/g, '');
    const cleanBlock = isDouble ? `$$${content}$$` : `$${content}$`;
    const token = `___MATH_TOKEN_${placeholders.length}___`;
    placeholders.push(cleanBlock);
    return token;
  });

  // 7. Chuẩn hóa hàm lượng giác chưa bọc $
  str = str.replace(/(?<![\\a-zA-Z])(cot|tan|sin|cos)(?:\^([0-9]+))?\s*\\?(alpha|beta|gamma|theta|varphi|phi)\b/gi, (_, fn, p, arg) => {
    const pow = p ? `^${p}` : '';
    return `$\\${fn.toLowerCase()}${pow}\\${arg.toLowerCase()}$`;
  });

  // 8. Chuẩn hóa phân số độc lập: -\frac{a}{b} hoặc \frac{a}{b}
  str = str.replace(/(-?\\frac\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\})/g, (_, m) => `$${m.trim()}$`);

  // 9. Chuẩn hóa căn thức độc lập: \sqrt{...}
  str = str.replace(/(-?\\sqrt(?:\[[^\]]+\])?\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\})/g, (_, m) => `$${m.trim()}$`);

  // 10. Chuẩn hóa hệ phương trình
  str = str.replace(/(\\begin\{cases\}[\s\S]*?\\end\{cases\})/g, (_, m) => `$${m.trim()}$`);

  // 11. Chuẩn hóa phương trình / đẳng thức toán học có dấu = hoặc bất đẳng thức
  str = str.replace(/([a-zA-Z0-9\\_\^()]+\s*(?:=|\\ne|\\le|\\ge|<|>)\s*-?[a-zA-Z0-9\\_\^/{}\(\)]+(?:\s*[+\-*/]\s*[a-zA-Z0-9\\_\^/{}\(\)]+)*)/g, (m) => {
    if (/[\\^_{}=<>]/.test(m)) return `$${m.trim()}$`;
    return m;
  });

  // 12. Khôi phục các token đã bảo vệ
  str = str.replace(/___MATH_TOKEN_(\d+)___/g, (_, id) => placeholders[parseInt(id, 10)] || '');

  // 13. Dọn dẹp khoảng trống và dấu $ liền kề
  str = str.replace(/\$\s*\$/g, ' ');

  return str.trim();
}

export const MathView: React.FC<MathViewProps> = ({
  math,
  text,
  content,
  display = false,
  className = '',
}) => {
  const rawInput = content ?? text ?? math ?? '';

  const normalizedInput = useMemo(() => {
    return normalizeMathString(rawInput);
  }, [rawInput]);

  const renderedContent = useMemo(() => {
    if (!normalizedInput) return null;

    // Tách văn bản theo $$...$$ (khối hiển thị) và $...$ (nội dòng)
    const parts = normalizedInput.split(/(\$\$[\s\S]+?\$\$|\$[^$]+?\$)/g);

    return parts.map((part, index) => {
      if (part.startsWith('$$') && part.endsWith('$$')) {
        const formula = part.slice(2, -2).trim();
        const html = safeKatexRender(formula, true);
        return (
          <span
            key={index}
            className="block my-2 overflow-x-auto text-center"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        );
      } else if (part.startsWith('$') && part.endsWith('$')) {
        const formula = part.slice(1, -1).trim();
        const html = safeKatexRender(formula, false);
        return (
          <span
            key={index}
            className="inline-block mx-0.5 align-baseline"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        );
      } else {
        return <span key={index}>{part}</span>;
      }
    });
  }, [normalizedInput, display]);

  return <span className={className}>{renderedContent}</span>;
};
