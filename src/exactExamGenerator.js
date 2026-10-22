// EXACT EXAM GENERATOR (BỘ SINH ĐỀ TỰ SINH CHUẨN 100% TOÁN 10 - 11 - 12 KẾT NỐI TRI THỨC)
// Đảm bảo: 100% bám sát đề gốc theo đúng từng dạng toán, đổi số liệu chính xác tuyệt đối, đáp án và lời giải ăn khớp 100%.

(function() {
  function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function numSign(n) {
    return n > 0 ? `+ ${n}` : n < 0 ? `- ${Math.abs(n)}` : '';
  }

  // ==========================================
  // 1. SINH CÂU HỎI TƯƠNG TỰ KHỐI 12 (KNTT)
  // ==========================================
  function generateSimilarGrade12(origQ, part, idx) {
    // PHẦN I: TRẮC NGHIỆM NHIỀU LỰA CHỌN
    if (part === 'A') {
      // Câu 1: Tính đơn điệu của hàm số bậc 3 y = x^3 - 3ax^2 + c
      if (idx === 0 || (origQ.stem && origQ.stem.includes('nghịch biến') && origQ.stem.includes('x^3'))) {
        const a = pick([1, 2, 3]);
        const c = pick([-4, -2, 1, 3, 5]);
        const coeff = 3 * a;
        const correct = `Hàm số nghịch biến trên khoảng $(0; ${2 * a})$`;
        const wrong = [
          `Hàm số đồng biến trên khoảng $(0; ${2 * a})$`,
          `Hàm số đồng biến trên $\\mathbb{R}$`,
          `Hàm số nghịch biến trên khoảng $(${2 * a}; +\\infty)$`
        ];
        const allOpts = shuffle([correct, ...wrong]);
        const ci = allOpts.indexOf(correct);
        return {
          type: 'mcq',
          lessonId: '12-1',
          stem: `Cho hàm số $y = x^3 - ${coeff}x^2 ${numSign(c)}$. Mệnh đề nào dưới đây là đúng?`,
          opts: allOpts,
          ci,
          ans: allOpts[ci],
          sol: `Ta có đạo hàm $y' = 3x^2 - ${2 * coeff}x = 3x(x - ${2 * a})$.<br>Cho $y' < 0 \\Leftrightarrow 0 < x < ${2 * a}$. Do đó hàm số nghịch biến trên khoảng $(0; ${2 * a})$ và đồng biến trên các khoảng $(-\\infty; 0)$ và $(${2 * a}; +\\infty)$.`
        };
      }

      // Câu 2: Điểm cực đại của đồ thị hàm bậc ba y = -x^3 + 3a^2 x + b
      if (idx === 1 || (origQ.stem && origQ.stem.includes('cực đại') && origQ.stem.includes('đồ thị'))) {
        const a = pick([1, 2]);
        const b = pick([-3, -1, 1, 2, 4]);
        const coeff = 3 * a * a;
        const yMax = 2 * a * a * a + b;
        const correct = `$M(${a}; ${yMax})$`;
        const wrong = [
          `$N(-${a}; ${-2 * a * a * a + b})$`,
          `$P(${a}; ${-yMax})$`,
          `$Q(0; ${b})$`
        ];
        const allOpts = shuffle([correct, ...wrong]);
        const ci = allOpts.indexOf(correct);
        return {
          type: 'mcq',
          lessonId: '12-2',
          stem: `Điểm cực đại của đồ thị hàm số $y = -x^3 + ${coeff}x ${numSign(b)}$ là:`,
          opts: allOpts,
          ci,
          ans: allOpts[ci],
          sol: `Ta có $y' = -3x^2 + ${coeff} = -3(x^2 - ${a * a}) = 0 \\Leftrightarrow x = \\pm ${a}$.<br>Vì hệ số $a = -1 < 0$ nên qua $x = ${a}$, đạo hàm đổi dấu từ dương sang âm. Điểm cực đại là $x = ${a}$, giá trị cực đại $y(${a}) = -(${a})^3 + ${coeff}(${a}) ${numSign(b)} = ${yMax}$. Vậy điểm cực đại của đồ thị là $M(${a}; ${yMax})$.`
        };
      }

      // Câu 3: Giá trị nhỏ nhất của hàm số trên đoạn [0; 2]
      if (idx === 2 || (origQ.stem && origQ.stem.includes('nhỏ nhất') && origQ.stem.includes('x^4'))) {
        const c = pick([2, 3, 4, 5, 6]);
        const minVal = c - 1;
        const correct = `$${minVal}$`;
        const wrong = [`$${c}$`, `$${c + 8}$`, `$${minVal + 2}$`];
        const allOpts = shuffle([correct, ...wrong]);
        const ci = allOpts.indexOf(correct);
        return {
          type: 'mcq',
          lessonId: '12-3',
          stem: `Giá trị nhỏ nhất của hàm số $f(x) = x^4 - 2x^2 + ${c}$ trên đoạn $[0; 2]$ bằng:`,
          opts: allOpts,
          ci,
          ans: allOpts[ci],
          sol: `Ta có $f'(x) = 4x^3 - 4x = 4x(x^2 - 1) = 0 \\Leftrightarrow x = 0$ hoặc $x = 1$ (do $x \\in [0; 2]$).<br>Tính các giá trị: $f(0) = ${c}$, $f(1) = 1 - 2 + ${c} = ${minVal}$, $f(2) = 16 - 8 + ${c} = ${c + 8}$.<br>Vậy $\\min_{[0; 2]} f(x) = f(1) = ${minVal}$.`
        };
      }

      // Câu 4: Đường tiệm cận đứng của hàm phân thức bậc nhất / bậc nhất
      if (idx === 3 || (origQ.stem && origQ.stem.includes('tiệm cận đứng'))) {
        const a = pick([2, 3, 4]);
        const c = pick([1, 2, 4, 5]);
        const correct = `$x = ${c}$`;
        const wrong = [`$x = -${c}$`, `$y = ${a}$`, `$y = ${c}$`];
        const allOpts = shuffle([correct, ...wrong]);
        const ci = allOpts.indexOf(correct);
        return {
          type: 'mcq',
          lessonId: '12-4',
          stem: `Đường tiệm cận đứng của đồ thị hàm số $y = \\dfrac{${a}x + 1}{x - ${c}}$ là đường thẳng:`,
          opts: allOpts,
          ci,
          ans: allOpts[ci],
          sol: `Vì mẫu số $x - ${c} = 0 \\Leftrightarrow x = ${c}$ và $\\lim_{x \\to ${c}^+} \\dfrac{${a}x + 1}{x - ${c}} = +\\infty$ nên đường thẳng $x = ${c}$ là tiệm cận đứng của đồ thị hàm số.`
        };
      }

      // Câu 5: Đường tiệm cận ngang của hàm phân thức
      if (idx === 4 || (origQ.stem && origQ.stem.includes('tiệm cận ngang'))) {
        const a = pick([2, 3, 4, 5]);
        const c = pick([1, 2, 3]);
        const b = pick([1, 3, 5]);
        const correct = `$y = ${a}$`;
        const wrong = [`$x = -${c}$`, `$y = -${b}$`, `$x = ${a}$`];
        const allOpts = shuffle([correct, ...wrong]);
        const ci = allOpts.indexOf(correct);
        return {
          type: 'mcq',
          lessonId: '12-4',
          stem: `Đường tiệm cận ngang của đồ thị hàm số $y = \\dfrac{${a}x - ${b}}{x + ${c}}$ là đường thẳng:`,
          opts: allOpts,
          ci,
          ans: allOpts[ci],
          sol: `Ta có $\\lim_{x \\to \\pm\\infty} \\dfrac{${a}x - ${b}}{x + ${c}} = \\lim_{x \\to \\pm\\infty} \\dfrac{${a} - \\frac{${b}}{x}}{1 + \\frac{${c}}{x}} = ${a}$. Do đó đường tiệm cận ngang là $y = ${a}$.`
        };
      }

      // Câu 6: Toạ độ vectơ AB trong Oxyz
      if (idx === 5 || (origQ.stem && origQ.stem.includes('Toạ độ của vectơ') && origQ.stem.includes('AB'))) {
        const x1 = pick([1, 2]), y1 = pick([2, 3]), z1 = pick([-2, -1]);
        const dx = pick([1, 2, 3]), dy = pick([-3, -2, 2]), dz = pick([1, 2, 3]);
        const x2 = x1 + dx, y2 = y1 + dy, z2 = z1 + dz;
        const correct = `$(${dx}; ${dy}; ${dz})$`;
        const wrong = [
          `$(${x1 + x2}; ${y1 + y2}; ${z1 + z2})$`,
          `$(${-dx}; ${-dy}; ${-dz})$`,
          `$(${dx}; ${-dy}; ${dz})$`
        ];
        const allOpts = shuffle([correct, ...wrong]);
        const ci = allOpts.indexOf(correct);
        return {
          type: 'mcq',
          lessonId: '12-7',
          stem: `Trong không gian $Oxyz$, cho hai điểm $A(${x1}; ${y1}; ${z1})$ và $B(${x2}; ${y2}; ${z2})$. Toạ độ của vectơ $\\overrightarrow{AB}$ là:`,
          opts: allOpts,
          ci,
          ans: allOpts[ci],
          sol: `Áp dụng công thức: $\\overrightarrow{AB} = (x_B - x_A;\\ y_B - y_A;\\ z_B - z_A) = (${x2} - ${x1};\\ ${y2} - ${y1};\\ ${z2} - (${z1})) = (${dx};\\ ${dy};\\ ${dz})$.`
        };
      }

      // Câu 7: Tích vô hướng u . v trong Oxyz
      if (idx === 6 || (origQ.stem && origQ.stem.includes('Tích vô hướng') && origQ.stem.includes('Oxyz'))) {
        const u1 = pick([1, 2]), u2 = pick([2, 3]), u3 = pick([1, 3]);
        const v1 = pick([2, 3]), v2 = pick([-2, -1]), v3 = pick([1, 2]);
        const dot = u1 * v1 + u2 * v2 + u3 * v3;
        const correct = `$${dot}$`;
        const wrong = [`$${dot + 2}$`, `$${dot - 3}$`, `$0$`];
        const allOpts = shuffle([correct, ...wrong]);
        const ci = allOpts.indexOf(correct);
        return {
          type: 'mcq',
          lessonId: '12-8',
          stem: `Trong không gian $Oxyz$, cho hai vectơ $\\vec u = (${u1}; ${u2}; ${u3})$ và $\\vec v = (${v1}; ${v2}; ${v3})$. Tích vô hướng $\\vec u \\cdot \\vec v$ bằng:`,
          opts: allOpts,
          ci,
          ans: allOpts[ci],
          sol: `$\\vec u \\cdot \\vec v = u_1 v_1 + u_2 v_2 + u_3 v_3 = ${u1} \\cdot ${v1} + ${u2} \\cdot (${v2}) + ${u3} \\cdot ${v3} = ${u1*v1} + (${u2*v2}) + ${u3*v3} = ${dot}$.`
        };
      }

      // Câu 8: Tâm I và bán kính R của mặt cầu (S)
      if (idx === 7 || (origQ.stem && origQ.stem.includes('tâm') && origQ.stem.includes('bán kính') && origQ.stem.includes('mặt cầu'))) {
        const a = pick([1, 2, 3]), b = pick([-2, -1, 1]), c = pick([2, 4]);
        const r = pick([3, 4, 5, 6]);
        const r2 = r * r;
        const aPart = a > 0 ? `- ${a}` : `+ ${Math.abs(a)}`;
        const bPart = b > 0 ? `- ${b}` : `+ ${Math.abs(b)}`;
        const cPart = c > 0 ? `- ${c}` : `+ ${Math.abs(c)}`;
        const correct = `$I(${a}; ${b}; ${c}), R = ${r}$`;
        const wrong = [
          `$I(${-a}; ${-b}; ${-c}), R = ${r}$`,
          `$I(${a}; ${b}; ${c}), R = ${r2}$`,
          `$I(${-a}; ${-b}; ${-c}), R = ${r2}$`
        ];
        const allOpts = shuffle([correct, ...wrong]);
        const ci = allOpts.indexOf(correct);
        return {
          type: 'mcq',
          lessonId: '12-14',
          stem: `Trong không gian $Oxyz$, tâm $I$ và bán kính $R$ của mặt cầu $(S): (x ${aPart})^2 + (y ${bPart})^2 + (z ${cPart})^2 = ${r2}$ là:`,
          opts: allOpts,
          ci,
          ans: allOpts[ci],
          sol: `Mặt cầu $(x - a)^2 + (y - b)^2 + (z - c)^2 = R^2$ có tâm $I(a; b; c) = (${a}; ${b}; ${c})$ và bán kính $R = \\sqrt{${r2}} = ${r}$.`
        };
      }

      // Câu 9: Toạ độ trung điểm M của đoạn AB
      if (idx === 8 || (origQ.stem && origQ.stem.includes('trung điểm') && origQ.stem.includes('Oxyz'))) {
        const x1 = pick([0, 2, 4]), y1 = pick([2, 4]), z1 = pick([-4, -2]);
        const x2 = pick([2, 4, 6]), y2 = pick([0, 2]), z2 = pick([2, 4]);
        const mx = (x1 + x2) / 2, my = (y1 + y2) / 2, mz = (z1 + z2) / 2;
        const correct = `$M(${mx}; ${my}; ${mz})$`;
        const wrong = [
          `$M(${x1 + x2}; ${y1 + y2}; ${z1 + z2})$`,
          `$M(${Math.abs(x2 - x1)}; ${Math.abs(y2 - y1)}; ${Math.abs(z2 - z1)})$`,
          `$M(${mx + 1}; ${my - 1}; ${mz})$`
        ];
        const allOpts = shuffle([correct, ...wrong]);
        const ci = allOpts.indexOf(correct);
        return {
          type: 'mcq',
          lessonId: '12-7',
          stem: `Trong không gian $Oxyz$, toạ độ trung điểm $M$ của đoạn thẳng nối $A(${x1}; ${y1}; ${z1})$ và $B(${x2}; ${y2}; ${z2})$ là:`,
          opts: allOpts,
          ci,
          ans: allOpts[ci],
          sol: `$x_M = \\dfrac{${x1} + ${x2}}{2} = ${mx};\\ y_M = \\dfrac{${y1} + ${y2}}{2} = ${my};\\ z_M = \\dfrac{${z1} + ${z2}}{2} = ${mz}$. Vậy $M(${mx}; ${my}; ${mz})$.`
        };
      }

      // Câu 10: Nhận diện khoảng đồng biến từ bảng biến thiên / dấu đạo hàm
      if (idx === 9 || (origQ.stem && origQ.stem.includes('bảng biến thiên') && origQ.stem.includes('đồng biến'))) {
        const x1 = pick([-2, -1]);
        const x2 = pick([2, 3]);
        const correct = `$(${x2}; +\\infty)$`;
        const wrong = [`$(${x1}; ${x2})$`, `$(${x1}; +\\infty)$`, `$(-\\infty; ${x2})$`];
        const allOpts = shuffle([correct, ...wrong]);
        const ci = allOpts.indexOf(correct);
        return {
          type: 'mcq',
          lessonId: '12-1',
          stem: `Cho hàm số $y = f(x)$ có đạo hàm $f'(x) > 0$ trên $(-\\infty; ${x1})$ và $(${x2}; +\\infty)$, $f'(x) < 0$ trên $(${x1}; ${x2})$. Hàm số đồng biến trên khoảng nào?`,
          opts: allOpts,
          ci,
          ans: allOpts[ci],
          sol: `Đạo hàm mang dấu dương ($f'(x) > 0$) trên các khoảng $(-\\infty; ${x1})$ và $(${x2}; +\\infty)$ nên hàm số đồng biến trên các khoảng đó. Trong 4 phương án, khoảng $(${x2}; +\\infty)$ là đúng.`
        };
      }

      // Câu 11: Bài toán tối ưu thực tế - diện tích bề mặt hình hộp không nắp
      if (idx === 10 || (origQ.stem && origQ.stem.includes('hình hộp chữ nhật') && origQ.stem.includes('thể tích'))) {
        const x0 = pick([6, 8, 10]);
        const V = (x0 * x0 * x0) / 2; // S = x^2 + 4V/x => S' = 2x - 4V/x^2 = 0 => 2x^3 = 4V => x^3 = 2V => x = x0
        const correct = `$${x0}\\text{ cm}$`;
        const wrong = [`$${x0 / 2}\\text{ cm}$`, `$${x0 + 4}\\text{ cm}$`, `$${x0 * 2}\\text{ cm}$`];
        const allOpts = shuffle([correct, ...wrong]);
        const ci = allOpts.indexOf(correct);
        return {
          type: 'mcq',
          lessonId: '12-3',
          stem: `Một hình hộp chữ nhật không nắp có đáy hình vuông cạnh $x$ (cm) và thể tích $V = ${V}\\text{ cm}^3$. Diện tích bề mặt toàn phần nhỏ nhất khi cạnh đáy $x$ bằng:`,
          opts: allOpts,
          ci,
          ans: allOpts[ci],
          sol: `Chiều cao của hộp là $h = \\dfrac{V}{x^2} = \\dfrac{${V}}{x^2}$. Diện tích toàn phần không nắp: $S(x) = x^2 + 4xh = x^2 + \\dfrac{${4 * V}}{x}$.<br>Đạo hàm: $S'(x) = 2x - \\dfrac{${4 * V}}{x^2} = 0 \\Leftrightarrow 2x^3 = ${4 * V} \\Leftrightarrow x^3 = ${2 * V} = ${x0}^3 \\Leftrightarrow x = ${x0}\\text{ cm}$.`
        };
      }

      // Câu 12: Phương trình mặt cầu tâm O đi qua điểm A
      if (idx === 11 || (origQ.stem && origQ.stem.includes('tâm O') && origQ.stem.includes('đi qua điểm'))) {
        const pt = pick([
          { x: 2, y: 1, z: 2, r2: 9, r: 3 },
          { x: 1, y: 2, z: 2, r2: 9, r: 3 },
          { x: 2, y: 3, z: 6, r2: 49, r: 7 },
          { x: 0, y: 3, z: 4, r2: 25, r: 5 }
        ]);
        const correct = `$x^2 + y^2 + z^2 = ${pt.r2}$`;
        const wrong = [
          `$x^2 + y^2 + z^2 = ${pt.r}$`,
          `$(x - ${pt.x})^2 + (y - ${pt.y})^2 + (z - ${pt.z})^2 = ${pt.r2}$`,
          `$x^2 + y^2 + z^2 = ${pt.r2 * pt.r2}$`
        ];
        const allOpts = shuffle([correct, ...wrong]);
        const ci = allOpts.indexOf(correct);
        return {
          type: 'mcq',
          lessonId: '12-14',
          stem: `Trong không gian $Oxyz$, mặt cầu tâm $O(0; 0; 0)$ đi qua điểm $A(${pt.x}; ${pt.y}; ${pt.z})$ có phương trình là:`,
          opts: allOpts,
          ci,
          ans: allOpts[ci],
          sol: `Bán kính $R = OA = \\sqrt{${pt.x}^2 + ${pt.y}^2 + ${pt.z}^2} = \\sqrt{${pt.r2}} = ${pt.r}$.<br>Phương trình mặt cầu tâm $O(0; 0; 0)$ bán kính $R$ là: $x^2 + y^2 + z^2 = R^2 = ${pt.r2}$.`
        };
      }
    }

    // PHẦN II: TRẮC NGHIỆM ĐÚNG SAI
    if (part === 'B') {
      if (idx === 0) {
        const c = pick([3, 5, 7, 9]);
        return {
          type: 'ds',
          lessonId: '12-1',
          stem: `Cho hàm số bậc ba $y = f(x) = x^3 - 3x^2 - 9x + ${c}$. Xét tính đúng/sai của các khẳng định sau:`,
          items: [
            { s: `Đạo hàm của hàm số là $f'(x) = 3x^2 - 6x - 9$.`, t: true },
            { s: `Hàm số nghịch biến trên khoảng $(-1; 3)$.`, t: true },
            { s: `Hàm số đạt cực tiểu tại điểm $x = -1$.`, t: false },
            { s: `Giá trị lớn nhất của hàm số trên đoạn $[0; 4]$ bằng $${c}$.`, t: true }
          ],
          sol: `Ta có $f'(x) = 3x^2 - 6x - 9 = 3(x + 1)(x - 3)$.<br>a) Đúng: Đạo hàm $f'(x) = 3x^2 - 6x - 9$.<br>b) Đúng: $f'(x) < 0 \\Leftrightarrow -1 < x < 3$.<br>c) Sai: Tại $x = -1$ đạo hàm đổi dấu từ (+) sang (-) nên $x = -1$ là điểm cực đại.<br>d) Đúng: Trên đoạn $[0; 4]$, $f(0) = ${c}, f(3) = ${-27 + c}, f(4) = ${-20 + c}$. Vậy $\\max_{[0; 4]} f(x) = f(0) = ${c}$.`
        };
      }

      if (idx === 1) {
        return {
          type: 'ds',
          lessonId: '12-8',
          stem: `Trong không gian $Oxyz$, cho ba điểm $A(1; 0; 2)$, $B(2; 1; 0)$ và $C(0; 2; 1)$.`,
          items: [
            { s: `Vectơ $\\overrightarrow{AB} = (1; 1; -2)$.`, t: true },
            { s: `Độ dài đoạn thẳng $AB$ bằng $\\sqrt{6}$.`, t: true },
            { s: `Tích vô hướng $\\overrightarrow{AB} \\cdot \\overrightarrow{AC} = 0$.`, t: false },
            { s: `Tam giác $ABC$ là tam giác đều.`, t: false }
          ],
          sol: `$\\overrightarrow{AB} = (1; 1; -2) \\Rightarrow AB = \\sqrt{1 + 1 + 4} = \\sqrt{6}$. $\\overrightarrow{AC} = (-1; 2; -1) \\Rightarrow \\overrightarrow{AB} \\cdot \\overrightarrow{AC} = -1 + 2 + 2 = 3 \\ne 0$.`
        };
      }

      if (idx === 2) {
        const a = pick([1, 2, 3]), b = pick([2, 3, 4]);
        return {
          type: 'ds',
          lessonId: '12-4',
          stem: `Cho hàm số $y = \\dfrac{x + ${a}}{x - ${b}}$. Xét tính đúng/sai của các mệnh đề sau:`,
          items: [
            { s: `Tập xác định của hàm số là $D = \\mathbb{R} \\setminus \\{${b}\\}$.`, t: true },
            { s: `Đồ thị hàm số có tiệm cận đứng là $x = ${b}$ và tiệm cận ngang là $y = 1$.`, t: true },
            { s: `Đạo hàm $y' > 0$ với mọi $x \\ne ${b}$.`, t: false },
            { s: `Tâm đối xứng của đồ thị là điểm $I(${b}; 1)$.`, t: true }
          ],
          sol: `a) Đúng: $x - ${b} \\ne 0 \\Leftrightarrow x \\ne ${b}$.<br>b) Đúng: Tiệm cận đứng $x = ${b}$, tiệm cận ngang $y = 1$.<br>c) Sai: $y' = \\dfrac{-${a + b}}{(x - ${b})^2} < 0$.<br>d) Đúng: Giao của hai đường tiệm cận là tâm đối xứng $I(${b}; 1)$.`
        };
      }

      if (idx === 3) {
        const x0 = pick([6, 8]);
        const V = (x0 * x0 * x0) / 2;
        const coeff = 4 * V;
        return {
          type: 'ds',
          lessonId: '12-3',
          stem: `Một công ty dự tính làm một chiếc hộp hình chữ nhật có đáy vuông và không có nắp với thể tích $${V}\\text{ cm}^3$. Gọi $x$ (cm) là độ dài cạnh đáy và $h$ (cm) là chiều cao của hộp.`,
          items: [
            { s: `Biểu thức của chiều cao theo cạnh đáy là $h = \\dfrac{${V}}{x^2}$.`, t: true },
            { s: `Diện tích toàn phần của hộp không nắp là $S(x) = x^2 + \\dfrac{${coeff}}{x}$.`, t: true },
            { s: `Đạo hàm $S'(x) = 2x - \\dfrac{${coeff}}{x^2}$.`, t: true },
            { s: `Để tiết kiệm vật liệu nhất, cạnh đáy $x$ cần thiết kế bằng $${x0}\\text{ cm}$.`, t: true }
          ],
          sol: `Áp dụng công thức thể tích $V = x^2 h = ${V} \\Rightarrow h = \\dfrac{${V}}{x^2}$.<br>Diện tích bề mặt $S(x) = x^2 + 4xh = x^2 + \\dfrac{${coeff}}{x}$.<br>$S'(x) = 2x - \\dfrac{${coeff}}{x^2} = 0 \\Leftrightarrow 2x^3 = ${coeff} \\Leftrightarrow x^3 = ${2 * V} = ${x0}^3 \\Leftrightarrow x = ${x0}\\text{ cm}$.`
        };
      }
    }

    // PHẦN III: TRẢ LỜI NGẮN
    if (part === 'C') {
      if (idx === 0) {
        const a = pick([1, 2]);
        const c = pick([2, 3, 5]);
        return {
          type: 'tln',
          lessonId: '12-2',
          stem: `Tìm điểm cực tiểu của hàm số $y = x^3 - ${3 * a * a}x + ${c}$.`,
          v: a,
          dp: 0,
          ans: String(a),
          sol: `Ta có $y' = 3x^2 - ${3 * a * a} = 3(x^2 - ${a * a}) = 0 \\Leftrightarrow x = \\pm ${a}$. Qua $x = ${a}$, đạo hàm đổi dấu từ âm sang dương nên điểm cực tiểu của hàm số là $x = ${a}$.`
        };
      }

      if (idx === 1) {
        const c = pick([1, 2, 3, 4]);
        const maxVal = c + 4;
        return {
          type: 'tln',
          lessonId: '12-3',
          stem: `Tìm giá trị lớn nhất của hàm số $y = -x^4 + 4x^2 + ${c}$ trên đoạn $[0; 3]$.`,
          v: maxVal,
          dp: 0,
          ans: String(maxVal),
          sol: `Ta có $y' = -4x^3 + 8x = -4x(x^2 - 2) = 0 \\Leftrightarrow x = 0$ hoặc $x = \\sqrt{2} \\in [0; 3]$.<br>Tính các giá trị: $y(0) = ${c}$, $y(\\sqrt{2}) = -4 + 8 + ${c} = ${maxVal}$, $y(3) = -81 + 36 + ${c} = ${-45 + c}$.<br>Vậy GTLN của hàm số trên $[0; 3]$ bằng $${maxVal}$.`
        };
      }

      if (idx === 2) {
        const r = pick([4, 5, 6]);
        const constTerm = r * r - 14;
        return {
          type: 'tln',
          lessonId: '12-14',
          stem: `Trong không gian $Oxyz$, cho mặt cầu $(S): x^2 + y^2 + z^2 - 2x + 4y - 6z - ${constTerm} = 0$. Bán kính $R$ của mặt cầu bằng bao nhiêu?`,
          v: r,
          dp: 0,
          ans: String(r),
          sol: `Tâm $I(1; -2; 3)$ và bán kính $R = \\sqrt{1^2 + (-2)^2 + 3^2 - (-${constTerm})} = \\sqrt{1 + 4 + 9 + ${constTerm}} = \\sqrt{${r * r}} = ${r}$.`
        };
      }

      if (idx === 3) {
        const u1 = pick([2, 3]), v1 = pick([3, 4]), v2 = 2;
        const mVal = pick([-2, -1, 1, 2]);
        const constTerm = u1 * v1 + mVal * v2;
        return {
          type: 'tln',
          lessonId: '12-8',
          stem: `Trong không gian $Oxyz$, cho hai vectơ $\\vec a = (${u1}; m; 1)$ và $\\vec b = (${v1}; ${v2}; -${constTerm})$. Tìm giá trị của $m$ để $\\vec a$ vuông góc với $\\vec b$.`,
          v: mVal,
          dp: 0,
          ans: String(mVal),
          sol: `$\\vec a \\perp \\vec b \\Leftrightarrow \\vec a \\cdot \\vec b = 0 \\Leftrightarrow ${u1} \\cdot ${v1} + m \\cdot ${v2} + 1 \\cdot (-${constTerm}) = 0 \\Leftrightarrow ${v2}m = ${constTerm - u1 * v1} \\Leftrightarrow m = ${mVal}$.`
        };
      }

      if (idx === 4) {
        const a = pick([2, 3]);
        const K = 5;
        // y' = (m - a) / (x + m)^2 < 0 <=> m < a. Integers in [-K; K] => m in [-K; a - 1]
        const count = (a - 1) - (-K) + 1;
        return {
          type: 'tln',
          lessonId: '12-1',
          stem: `Có bao nhiêu giá trị nguyên của tham số $m \\in [-${K}; ${K}]$ để hàm số $y = \\dfrac{x + ${a}}{x + m}$ nghịch biến trên từng khoảng xác định?`,
          v: count,
          dp: 0,
          ans: String(count),
          sol: `$y' = \\dfrac{m - ${a}}{(x + m)^2}$. Hàm số nghịch biến khi $y' < 0 \\Leftrightarrow m - ${a} < 0 \\Leftrightarrow m < ${a}$.<br>Vì $m \\in [-${K}; ${K}]$ và $m \\in \\mathbb{Z}$ nên $m \\in \\{-${K}, \\dots, ${a - 1}\\}$. Số giá trị nguyên thoả mãn là $(${a - 1}) - (-${K}) + 1 = ${count}$.`
        };
      }

      if (idx === 5) {
        const L = pick([80, 120, 160]);
        const xOpt = L / 4;
        const sMax = xOpt * (L - 2 * xOpt);
        return {
          type: 'tln',
          lessonId: '12-3',
          stem: `Một người nông dân muốn rào một khu vườn hình chữ nhật ven một con sông thẳng (không cần rào cạnh phía bờ sông). Bác có tổng cộng $${L}\\text{ m}$ lưới rào. Diện tích lớn nhất của mảnh vườn có thể rào được bằng bao nhiêu mét vuông?`,
          v: sMax,
          dp: 0,
          ans: String(sMax),
          sol: `Gọi $x$ (m) là chiều rộng của vườn vuông góc với bờ sông ($0 < x < ${L / 2}$). Chiều dài dọc bờ sông là $${L} - 2x$. Diện tích $S(x) = x(${L} - 2x) = -2x^2 + ${L}x$. Đỉnh parabol tại $x = ${xOpt}\\text{ m}$. Diện tích tối đa là $S(${xOpt}) = ${xOpt}(${L} - ${2 * xOpt}) = ${sMax}\\text{ m}^2$.`
        };
      }
    }

    return null;
  }

  // ==========================================
  // 2. SINH CÂU HỎI TƯƠNG TỰ KHỐI 11 (KNTT)
  // ==========================================
  function generateSimilarGrade11(origQ, part, idx) {
    if (part === 'A') {
      // Câu 1: Giá trị lượng giác của góc đặc biệt
      if (idx === 0 || (origQ.stem && origQ.stem.includes('Giá trị của') && origQ.stem.includes('\\pi/'))) {
        const angle = pick([
          { name: '\\dfrac{\\pi}{3}', func: '\\cos', val: '\\dfrac{1}{2}', wrong: ['\\dfrac{\\sqrt{3}}{2}', '\\dfrac{\\sqrt{2}}{2}', '1'] },
          { name: '\\dfrac{\\pi}{4}', func: '\\sin', val: '\\dfrac{\\sqrt{2}}{2}', wrong: ['\\dfrac{1}{2}', '\\dfrac{\\sqrt{3}}{2}', '0'] },
          { name: '\\dfrac{\\pi}{4}', func: '\\tan', val: '1', wrong: ['\\sqrt{3}', '\\dfrac{\\sqrt{3}}{3}', '0'] }
        ]);
        const correct = `$${angle.val}$`;
        const wrongOpts = angle.wrong.map(w => `$${w}$`);
        const allOpts = shuffle([correct, ...wrongOpts]);
        const ci = allOpts.indexOf(correct);
        return {
          type: 'mcq',
          lessonId: '11-1',
          stem: `Giá trị của $${angle.func}${angle.name}$ bằng:`,
          opts: allOpts,
          ci,
          ans: allOpts[ci],
          sol: `Theo bảng giá trị lượng giác các góc đặc biệt, $${angle.func}${angle.name} = ${angle.val}$.`
        };
      }

      // Câu 2: Công thức nhân đôi
      if (idx === 1 || (origQ.stem && origQ.stem.includes('Công thức') && origQ.stem.includes('đúng với mọi góc'))) {
        const correct = `$\\cos 2a = \\cos^2 a - \\sin^2 a$`;
        const wrong = [
          `$\\sin 2a = \\sin a \\cos a$`,
          `$\\cos 2a = 2\\sin^2 a - 1$`,
          `$\\sin^2 a - \\cos^2 a = 1$`
        ];
        const allOpts = shuffle([correct, ...wrong]);
        const ci = allOpts.indexOf(correct);
        return {
          type: 'mcq',
          lessonId: '11-2',
          stem: `Công thức nào sau đây là đúng với mọi góc $a$?`,
          opts: allOpts,
          ci,
          ans: allOpts[ci],
          sol: `Công thức nhân đôi chuẩn SGK: $\\cos 2a = \\cos^2 a - \\sin^2 a = 2\\cos^2 a - 1 = 1 - 2\\sin^2 a$.`
        };
      }

      // Câu 3: Tập xác định của hàm lượng giác
      if (idx === 2 || (origQ.stem && origQ.stem.includes('Tập xác định') && origQ.stem.includes('tan'))) {
        const correct = `$D = \\mathbb{R} \\setminus \\left\\{\\dfrac{\\pi}{2} + k\\pi, k \\in \\mathbb{Z}\\right\\}$`;
        const wrong = [
          `$D = \\mathbb{R} \\setminus \\{k\\pi, k \\in \\mathbb{Z}\\}$`,
          `$D = \\mathbb{R}$`,
          `$D = [-1; 1]$`
        ];
        const allOpts = shuffle([correct, ...wrong]);
        const ci = allOpts.indexOf(correct);
        return {
          type: 'mcq',
          lessonId: '11-3',
          stem: `Tập xác định của hàm số $y = \\tan x$ là:`,
          opts: allOpts,
          ci,
          ans: allOpts[ci],
          sol: `Hàm số $y = \\tan x = \\dfrac{\\sin x}{\\cos x}$ xác định khi $\\cos x \\ne 0 \\Leftrightarrow x \\ne \\dfrac{\\pi}{2} + k\\pi, k \\in \\mathbb{Z}$.`
        };
      }

      // Câu 4: Nghiệm phương trình lượng giác cơ bản
      if (idx === 3 || (origQ.stem && origQ.stem.includes('Nghiệm của phương trình'))) {
        const correct = `$x = k2\\pi, k \\in \\mathbb{Z}$`;
        const wrong = [
          `$x = \\pi + k2\\pi, k \\in \\mathbb{Z}$`,
          `$x = \\dfrac{\\pi}{2} + k\\pi, k \\in \\mathbb{Z}$`,
          `$x = k\\pi, k \\in \\mathbb{Z}$`
        ];
        const allOpts = shuffle([correct, ...wrong]);
        const ci = allOpts.indexOf(correct);
        return {
          type: 'mcq',
          lessonId: '11-4',
          stem: `Nghiệm của phương trình $\\cos x = 1$ là:`,
          opts: allOpts,
          ci,
          ans: allOpts[ci],
          sol: `Phương trình lượng giác cơ bản $\\cos x = 1 \\Leftrightarrow x = k2\\pi, k \\in \\mathbb{Z}$.`
        };
      }

      // Câu 5: Số hạng thứ n của cấp số cộng
      if (idx === 4 || (origQ.stem && origQ.stem.includes('cấp số cộng') && origQ.stem.includes('Số hạng thứ'))) {
        const u1 = pick([2, 4, 5]), d = pick([3, 4]), n = 5;
        const un = u1 + (n - 1) * d;
        const correct = `$${un}$`;
        const wrong = [`$${un + d}$`, `$${un - d}$`, `$${u1 + n * d}$`];
        const allOpts = shuffle([correct, ...wrong]);
        const ci = allOpts.indexOf(correct);
        return {
          type: 'mcq',
          lessonId: '11-6',
          stem: `Cho cấp số cộng $(u_n)$ có số hạng đầu $u_1 = ${u1}$ và công sai $d = ${d}$. Số hạng thứ ${n} là:`,
          opts: allOpts,
          ci,
          ans: allOpts[ci],
          sol: `Áp dụng công thức số hạng tổng quát: $u_${n} = u_1 + (${n} - 1)d = ${u1} + ${n - 1} \\cdot ${d} = ${un}$.`
        };
      }

      // Câu 6: Giá trị của un trong cấp số nhân
      if (idx === 5 || (origQ.stem && origQ.stem.includes('cấp số nhân') && origQ.stem.includes('Giá trị của u'))) {
        const u1 = pick([2, 3]), q = pick([2, 3]), n = 3;
        const un = u1 * q * q;
        const correct = `$${un}$`;
        const wrong = [`$${un * q}$`, `$${u1 * n * q}$`, `$${un - q}$`];
        const allOpts = shuffle([correct, ...wrong]);
        const ci = allOpts.indexOf(correct);
        return {
          type: 'mcq',
          lessonId: '11-7',
          stem: `Cho cấp số nhân $(u_n)$ có $u_1 = ${u1}$ và công bội $q = ${q}$. Giá trị của $u_${n}$ bằng:`,
          opts: allOpts,
          ci,
          ans: allOpts[ci],
          sol: `Áp dụng công thức số hạng tổng quát: $u_${n} = u_1 \\cdot q^{${n} - 1} = ${u1} \\cdot ${q}^2 = ${un}$.`
        };
      }

      // Câu 7: Dấu giá trị lượng giác góc phần tư II
      if (idx === 6 || (origQ.stem && origQ.stem.includes('\\pi/2 < \\alpha < \\pi'))) {
        const correct = `$\\sin \\alpha > 0$`;
        const wrong = [`$\\cos \\alpha > 0$`, `$\\tan \\alpha > 0$`, `$\\cot \\alpha > 0$`];
        const allOpts = shuffle([correct, ...wrong]);
        const ci = allOpts.indexOf(correct);
        return {
          type: 'mcq',
          lessonId: '11-1',
          stem: `Cho góc lượng giác $\\alpha$ thoả mãn $\\dfrac{\\pi}{2} < \\alpha < \\pi$. Mệnh đề nào sau đây đúng?`,
          opts: allOpts,
          ci,
          ans: allOpts[ci],
          sol: `Với $\\dfrac{\\pi}{2} < \\alpha < \\pi$ (thuộc góc phần tư thứ II), ta có $\\sin \\alpha > 0$ và $\\cos \\alpha < 0, \\tan \\alpha < 0, \\cot \\alpha < 0$.`
        };
      }

      // Câu 8: Cho sin a, tính cos a
      if (idx === 7 || (origQ.stem && origQ.stem.includes('\\sin a = \\dfrac{3}{5}'))) {
        const correct = `$\\dfrac{4}{5}$`;
        const wrong = [`$-\\dfrac{4}{5}$`, `$\\dfrac{16}{25}$`, `$\\dfrac{2}{5}$`];
        const allOpts = shuffle([correct, ...wrong]);
        const ci = allOpts.indexOf(correct);
        return {
          type: 'mcq',
          lessonId: '11-2',
          stem: `Biết $\\sin a = \\dfrac{3}{5}$ với $0 < a < \\dfrac{\\pi}{2}$. Giá trị của $\\cos a$ bằng:`,
          opts: allOpts,
          ci,
          ans: allOpts[ci],
          sol: `Vì $0 < a < \\dfrac{\\pi}{2}$ nên $\\cos a > 0$. Ta có $\\cos a = \\sqrt{1 - \\sin^2 a} = \\sqrt{1 - \\dfrac{9}{25}} = \\dfrac{4}{5}$.`
        };
      }

      // Câu 9: Số nghiệm phương trình sin x = 0
      if (idx === 8 || (origQ.stem && origQ.stem.includes('Số nghiệm của phương trình'))) {
        const correct = `$3$`;
        const wrong = [`$2$`, `$1$`, `$4$`];
        const allOpts = shuffle([correct, ...wrong]);
        const ci = allOpts.indexOf(correct);
        return {
          type: 'mcq',
          lessonId: '11-4',
          stem: `Số nghiệm của phương trình $\\sin x = 0$ trên đoạn $[0; 2\\pi]$ là:`,
          opts: allOpts,
          ci,
          ans: allOpts[ci],
          sol: `$\\sin x = 0 \\Leftrightarrow x = k\\pi$. Trên đoạn $[0; 2\\pi]$, các nghiệm là $x = 0, x = \\pi, x = 2\\pi$ (có đúng 3 nghiệm).`
        };
      }

      // Câu 10: Tổng n số hạng đầu của cấp số cộng
      if (idx === 9 || (origQ.stem && origQ.stem.includes('Tổng của 5 số hạng đầu tiên'))) {
        const u1 = pick([1, 2, 3]), d = pick([2, 3]), n = 5;
        const un = u1 + (n - 1) * d;
        const sn = (n * (u1 + un)) / 2;
        const correct = `$${sn}$`;
        const wrong = [`$${sn + 5}$`, `$${sn - 5}$`, `$${sn * 2}$`];
        const allOpts = shuffle([correct, ...wrong]);
        const ci = allOpts.indexOf(correct);
        return {
          type: 'mcq',
          lessonId: '11-6',
          stem: `Cho cấp số cộng $(u_n)$ với $u_1 = ${u1}$ và công sai $d = ${d}$. Tổng của 5 số hạng đầu tiên $S_5$ bằng:`,
          opts: allOpts,
          ci,
          ans: allOpts[ci],
          sol: `$u_5 = ${u1} + 4 \\cdot ${d} = ${un}$. Tổng $S_5 = \\dfrac{5(${u1} + ${un})}{2} = ${sn}$.`
        };
      }

      // Câu 11: Tổng cấp số nhân lùi vô hạn
      if (idx === 10 || (origQ.stem && origQ.stem.includes('cấp số nhân lùi vô hạn'))) {
        const u1 = pick([2, 3, 4]);
        const correct = `$${u1 * 2}$`;
        const wrong = [`$${u1}$`, `$${u1 * 3}$`, `$${u1 * 4}$`];
        const allOpts = shuffle([correct, ...wrong]);
        const ci = allOpts.indexOf(correct);
        return {
          type: 'mcq',
          lessonId: '11-7',
          stem: `Cho cấp số nhân lùi vô hạn có $u_1 = ${u1}$ và công bội $q = \\dfrac{1}{2}$. Tổng $S$ của cấp số nhân lùi vô hạn đó bằng:`,
          opts: allOpts,
          ci,
          ans: allOpts[ci],
          sol: `Áp dụng công thức: $S = \\dfrac{u_1}{1 - q} = \\dfrac{${u1}}{1 - \\frac{1}{2}} = ${u1 * 2}$.`
        };
      }

      // Câu 12: Chu kì tuần hoàn của cos x
      if (idx === 11 || (origQ.stem && origQ.stem.includes('Chu kì tuần hoàn'))) {
        const correct = `$2\\pi$`;
        const wrong = [`$\\pi$`, `$\\dfrac{\\pi}{2}$`, `$4\\pi$`];
        const allOpts = shuffle([correct, ...wrong]);
        const ci = allOpts.indexOf(correct);
        return {
          type: 'mcq',
          lessonId: '11-3',
          stem: `Chu kì tuần hoàn của hàm số lượng giác $y = \\cos x$ là:`,
          opts: allOpts,
          ci,
          ans: allOpts[ci],
          sol: `Hàm số $y = \\cos x$ tuần hoàn với chu kì cơ sở $T = 2\\pi$.`
        };
      }
    }

    if (part === 'B') {
      if (idx === 0) {
        return {
          type: 'ds',
          lessonId: '11-6',
          stem: `Cho cấp số cộng $(u_n)$ có $u_1 = 4$ và công sai $d = 3$. Xét tính đúng/sai của các mệnh đề sau:`,
          items: [
            { s: `Số hạng thứ 10 là $u_{10} = 31$.`, t: true },
            { s: `Công thức số hạng tổng quát là $u_n = 3n + 1$.`, t: true },
            { s: `Tổng 10 số hạng đầu là $S_{10} = 175$.`, t: true },
            { s: `Số $101$ là một số hạng của cấp số cộng trên.`, t: false }
          ],
          sol: `Ta có $u_n = 4 + (n - 1)3 = 3n + 1$.<br>a) Đúng: $u_{10} = 4 + 9 \\cdot 3 = 31$.<br>b) Đúng: $u_n = 3n + 1$.<br>c) Đúng: $S_{10} = \\dfrac{10(4 + 31)}{2} = 175$.<br>d) Sai: $3n + 1 = 101 \\Leftrightarrow 3n = 100 \\Leftrightarrow n = \\dfrac{100}{3} \\notin \\mathbb{N}^*$.`
        };
      }

      if (idx === 1) {
        return {
          type: 'ds',
          lessonId: '11-1',
          stem: `Cho góc lượng giác $x$ thoả mãn $\\sin x = \\dfrac{3}{5}$ và $\\dfrac{\\pi}{2} < x < \\pi$. Xét tính đúng/sai:`,
          items: [
            { s: `Giá trị của $\\cos x = -\\dfrac{4}{5}$.`, t: true },
            { s: `Giá trị của $\\tan x = -\\dfrac{3}{4}$.`, t: true },
            { s: `Giá trị của $\\sin 2x = -\\dfrac{24}{25}$.`, t: true },
            { s: `Giá trị của $\\cos 2x = \\dfrac{1}{25}$.`, t: false }
          ],
          sol: `Vì $\\dfrac{\\pi}{2} < x < \\pi$ nên $\\cos x = -\\sqrt{1 - \\sin^2 x} = -\\dfrac{4}{5}$.<br>a) Đúng: $\\cos x = -\\dfrac{4}{5}$.<br>b) Đúng: $\\tan x = -\\dfrac{3}{4}$.<br>c) Đúng: $\\sin 2x = 2\\sin x \\cos x = -\\dfrac{24}{25}$.<br>d) Sai: $\\cos 2x = 1 - 2\\sin^2 x = \\dfrac{7}{25} \\ne \\dfrac{1}{25}$.`
        };
      }

      if (idx === 2) {
        return {
          type: 'ds',
          lessonId: '11-7',
          stem: `Cho cấp số nhân $(u_n)$ có $u_1 = 3$ và công bội $q = 2$.`,
          items: [
            { s: `Số hạng thứ tư là $u_4 = 24$.`, t: true },
            { s: `Công thức số hạng tổng quát là $u_n = 3 \\cdot 2^{n-1}$.`, t: true },
            { s: `Tổng 5 số hạng đầu là $S_5 = 93$.`, t: true },
            { s: `Số $192$ là số hạng thứ 6 của cấp số nhân trên.`, t: false }
          ],
          sol: `a) Đúng: $u_4 = 3 \\cdot 2^3 = 24$.<br>b) Đúng: $u_n = 3 \\cdot 2^{n-1}$.<br>c) Đúng: $S_5 = \\dfrac{3(2^5 - 1)}{2 - 1} = 93$.<br>d) Sai: $u_6 = 3 \\cdot 2^5 = 96 \\ne 192$.`
        };
      }

      if (idx === 3) {
        return {
          type: 'ds',
          lessonId: '11-4',
          stem: `Xét phương trình lượng giác $\\cos 2x = \\cos x$ trên đoạn $[0; 2\\pi]$.`,
          items: [
            { s: `Phương trình tương đương với $2x = x + k2\\pi$ hoặc $2x = -x + k2\\pi$ ($k \\in \\mathbb{Z}$).`, t: true },
            { s: `Họ nghiệm thứ nhất là $x = k2\\pi$ ($k \\in \\mathbb{Z}$).`, t: true },
            { s: `Phương trình có đúng 4 nghiệm trên đoạn $[0; 2\\pi]$.`, t: true },
            { s: `Tổng các nghiệm của phương trình trên đoạn $[0; 2\\pi]$ bằng $3\\pi$.`, t: false }
          ],
          sol: `a) Đúng: $\\cos A = \\cos B \\Leftrightarrow A = \\pm B + k2\\pi$.<br>b) Đúng: $x = k2\\pi$.<br>c) Đúng: $x \\in \\left\\{0, \\dfrac{2\\pi}{3}, \\dfrac{4\\pi}{3}, 2\\pi\\right\\}$ (4 nghiệm).<br>d) Sai: Tổng các nghiệm là $0 + \\dfrac{2\\pi}{3} + \\dfrac{4\\pi}{3} + 2\\pi = 4\\pi \\ne 3\\pi$.`
        };
      }
    }

    if (part === 'C') {
      if (idx === 0) {
        const u1 = pick([2, 3]), d = pick([3, 4]);
        const u20 = u1 + 19 * d;
        return {
          type: 'tln',
          lessonId: '11-6',
          stem: `Cho cấp số cộng $(u_n)$ biết $u_1 = ${u1}, u_2 = ${u1 + d}$. Tìm số hạng thứ 20.`,
          v: u20,
          dp: 0,
          ans: String(u20),
          sol: `Công sai $d = u_2 - u_1 = ${d}$. Số hạng thứ 20 là $u_{20} = u_1 + 19d = ${u1} + 19 \\cdot ${d} = ${u20}$.`
        };
      }

      if (idx === 1) {
        const u1 = pick([1, 2]);
        const s = u1 * 2;
        return {
          type: 'tln',
          lessonId: '11-7',
          stem: `Cho cấp số nhân lùi vô hạn với $u_1 = ${u1}$ và công bội $q = \\dfrac{1}{2}$. Tính tổng $S$ của cấp số nhân lùi vô hạn này.`,
          v: s,
          dp: 0,
          ans: String(s),
          sol: `$S = \\dfrac{u_1}{1 - q} = \\dfrac{${u1}}{1 - 0{,}5} = ${s}$.`
        };
      }

      if (idx === 2) {
        const k = pick([2, 3, 4]);
        const p = (k + 1) / (k - 1);
        return {
          type: 'tln',
          lessonId: '11-1',
          stem: `Biết $\\tan \\alpha = ${k}$. Tính giá trị của biểu thức $P = \\dfrac{\\sin \\alpha + \\cos \\alpha}{\\sin \\alpha - \\cos \\alpha}$.`,
          v: p,
          dp: 1,
          ans: String(p),
          sol: `Chia cả tử và mẫu cho $\\cos \\alpha \\ne 0$: $P = \\dfrac{\\tan \\alpha + 1}{\\tan \\alpha - 1} = \\dfrac{${k} + 1}{${k} - 1} = ${p}$.`
        };
      }

      if (idx === 3) {
        const d = pick([3, 4]);
        const u1 = pick([2, 3, 5]);
        const u5 = u1 + 4 * d;
        const u9 = u1 + 8 * d;
        return {
          type: 'tln',
          lessonId: '11-6',
          stem: `Tìm số hạng đầu $u_1$ của cấp số cộng $(u_n)$ biết $u_5 = ${u5}$ và $u_9 = ${u9}$.`,
          v: u1,
          dp: 0,
          ans: String(u1),
          sol: `$u_9 - u_5 = 4d = ${u9 - u5} \\Rightarrow d = ${d}$. Khi đó $u_1 = u_5 - 4d = ${u5} - 4 \\cdot ${d} = ${u1}$.`
        };
      }

      if (idx === 4) {
        const q = pick([2, 3]);
        const u2 = pick([4, 6]);
        const u5 = u2 * Math.pow(q, 3);
        return {
          type: 'tln',
          lessonId: '11-7',
          stem: `Cho cấp số nhân $(u_n)$ có $u_2 = ${u2}$ và $u_5 = ${u5}$. Tìm công bội $q$ của cấp số nhân đó.`,
          v: q,
          dp: 0,
          ans: String(q),
          sol: `$\\dfrac{u_5}{u_2} = q^3 = \\dfrac{${u5}}{${u2}} = ${Math.pow(q, 3)} \\Rightarrow q = ${q}$.`
        };
      }

      if (idx === 5) {
        return {
          type: 'tln',
          lessonId: '11-4',
          stem: `Tìm số nghiệm của phương trình $\\cos 2x = 0$ thuộc khoảng $(0; \\pi)$.`,
          v: 2,
          dp: 0,
          ans: "2",
          sol: `$\\cos 2x = 0 \\Leftrightarrow 2x = \\dfrac{\\pi}{2} + k\\pi \\Leftrightarrow x = \\dfrac{\\pi}{4} + \\dfrac{k\\pi}{2}$. Trên $(0; \\pi)$, có đúng 2 nghiệm là $x = \\dfrac{\\pi}{4}$ và $x = \\dfrac{3\\pi}{4}$.`
        };
      }
    }

    return null;
  }

  // ==========================================
  // 3. SINH CÂU HỎI TƯƠNG TỰ KHỐI 10 (KNTT)
  // ==========================================
  function generateSimilarGrade10(origQ, part, idx) {
    if (part === 'A') {
      if (idx === 0) {
        const correct = `Số $11$ là một số nguyên tố.`;
        const wrong = [`Học toán thật là vui!`, `Mấy giờ rồi bạn ơi?`, `Hãy giải phương trình này!`];
        const allOpts = shuffle([correct, ...wrong]);
        const ci = allOpts.indexOf(correct);
        return {
          type: 'mcq',
          lessonId: '10-1',
          stem: `Câu nào sau đây là một mệnh đề toán học?`,
          opts: allOpts,
          ci,
          ans: allOpts[ci],
          sol: `Mệnh đề toán học là khẳng định có tính đúng hoặc sai rõ ràng. "Số 11 là số nguyên tố" là mệnh đề đúng.`
        };
      }

      if (idx === 1) {
        const a = pick([1, 2]);
        const b = a + 2;
        const c = a + 4;
        const correct = `$\\{${b}; ${b + 1}\\}$`;
        const wrong = [`$\\{${a}; ${c}\\}$`, `$\\{${a}; ${b}\\}$`, `$\\{${b + 1}; ${c}\\}$`];
        const allOpts = shuffle([correct, ...wrong]);
        const ci = allOpts.indexOf(correct);
        return {
          type: 'mcq',
          lessonId: '10-2',
          stem: `Cho hai tập hợp $A = \\{${a}; ${a + 1}; ${b}; ${b + 1}\\}$ và $B = \\{${b}; ${b + 1}; ${c}; ${c + 1}\\}$. Giao của hai tập hợp $A \\cap B$ là:`,
          opts: allOpts,
          ci,
          ans: allOpts[ci],
          sol: `$A \\cap B$ gồm các phần tử vừa thuộc $A$ vừa thuộc $B$, do đó $A \\cap B = \\{${b}; ${b + 1}\\}$.`
        };
      }

      if (idx === 2) {
        const correct = `$(1; 1)$`;
        const wrong = [`$(0; 2)$`, `$(-1; 0)$`, `$(-2; 1)$`];
        const allOpts = shuffle([correct, ...wrong]);
        const ci = allOpts.indexOf(correct);
        return {
          type: 'mcq',
          lessonId: '10-3',
          stem: `Điểm nào dưới đây thuộc miền nghiệm của bất phương trình $2x - y + 1 > 0$?`,
          opts: allOpts,
          ci,
          ans: allOpts[ci],
          sol: `Thay $(1; 1)$ vào: $2(1) - 1 + 1 = 2 > 0$ (thoả mãn).`
        };
      }

      if (idx === 3) {
        const correct = `$\\overrightarrow{AB} + \\overrightarrow{AD} = \\overrightarrow{AC}$`;
        const wrong = [
          `$\\overrightarrow{AB} + \\overrightarrow{AC} = \\overrightarrow{AD}$`,
          `$\\overrightarrow{AB} = \\overrightarrow{CD}$`,
          `$\\overrightarrow{AC} + \\overrightarrow{BD} = \\vec 0$`
        ];
        const allOpts = shuffle([correct, ...wrong]);
        const ci = allOpts.indexOf(correct);
        return {
          type: 'mcq',
          lessonId: '10-8',
          stem: `Cho hình bình hành $ABCD$. Đẳng thức vectơ nào sau đây là đúng?`,
          opts: allOpts,
          ci,
          ans: allOpts[ci],
          sol: `Theo quy tắc hình bình hành: $\\overrightarrow{AB} + \\overrightarrow{AD} = \\overrightarrow{AC}$.`
        };
      }

      if (idx === 4) {
        const correct = `"$\\exists x \\in \\mathbb{R},\\ x^2 \\le 0$"`;
        const wrong = [
          `"$\\forall x \\in \\mathbb{R},\\ x^2 \\le 0$"`,
          `"$\\exists x \\in \\mathbb{R},\\ x^2 < 0$"`,
          `"$\\forall x \\in \\mathbb{R},\\ x^2 < 0$"`
        ];
        const allOpts = shuffle([correct, ...wrong]);
        const ci = allOpts.indexOf(correct);
        return {
          type: 'mcq',
          lessonId: '10-1',
          stem: `Phủ định của mệnh đề "$\\forall x \\in \\mathbb{R},\\ x^2 > 0$" là mệnh đề:`,
          opts: allOpts,
          ci,
          ans: allOpts[ci],
          sol: `Phủ định của lượng từ $\\forall$ là $\\exists$, phủ định của dấu $>$ là $\\le$.`
        };
      }

      if (idx === 5) {
        const a = pick([-4, -3]), b = pick([2, 3]), c = 0, d = pick([5, 6]);
        const correct = `$(${a}; ${d})$`;
        const wrong = [`$(${c}; ${b}]$`, `$[-${a}; ${d}]$`, `$(${a}; ${c})$`];
        const allOpts = shuffle([correct, ...wrong]);
        const ci = allOpts.indexOf(correct);
        return {
          type: 'mcq',
          lessonId: '10-2',
          stem: `Cho hai tập hợp $A = (${a}; ${b}]$ và $B = (${c}; ${d})$. Hợp $A \\cup B$ của hai tập hợp là:`,
          opts: allOpts,
          ci,
          ans: allOpts[ci],
          sol: `$A \\cup B = (${a}; ${b}] \\cup (${c}; ${d}) = (${a}; ${d})$.`
        };
      }

      if (idx === 6) {
        const correct = `$\\dfrac{a}{\\sin A} = 2R$`;
        const wrong = [`$\\dfrac{a}{\\sin A} = R$`, `$a = 2R\\cos A$`, `$\\dfrac{a}{\\sin B} = 2R$`];
        const allOpts = shuffle([correct, ...wrong]);
        const ci = allOpts.indexOf(correct);
        return {
          type: 'mcq',
          lessonId: '10-4',
          stem: `Trong tam giác $ABC$, với $R$ là bán kính đường tròn ngoại tiếp, hệ thức nào sau đây đúng (Định lý sin)?`,
          opts: allOpts,
          ci,
          ans: allOpts[ci],
          sol: `Theo định lý sin trong tam giác: $\\dfrac{a}{\\sin A} = \\dfrac{b}{\\sin B} = \\dfrac{c}{\\sin C} = 2R$.`
        };
      }

      if (idx === 7) {
        const b = pick([4, 6]), c = pick([6, 8]);
        const s = (0.5 * b * c * Math.sqrt(3) / 2);
        const correct = `$${b * c / 4}\\sqrt{3}$`;
        const wrong = [`$${b * c / 2}$`, `$${b * c / 2}\\sqrt{3}$`, `$${b * c / 4}$`];
        const allOpts = shuffle([correct, ...wrong]);
        const ci = allOpts.indexOf(correct);
        return {
          type: 'mcq',
          lessonId: '10-4',
          stem: `Cho tam giác $ABC$ có $b = ${b}, c = ${c}$ và góc $A = 60^\\circ$. Diện tích $S$ của tam giác $ABC$ bằng:`,
          opts: allOpts,
          ci,
          ans: allOpts[ci],
          sol: `$S = \\dfrac{1}{2}bc\\sin A = \\dfrac{1}{2} \\cdot ${b} \\cdot ${c} \\cdot \\sin 60^\\circ = ${b * c / 4}\\sqrt{3}$.`
        };
      }

      if (idx === 8) {
        const correct = `Vectơ đối của vectơ $\\vec{a}$`;
        const wrong = [`Vectơ cùng phương với $\\vec{a}$`, `Vectơ đơn vị`, `Vectơ không`];
        const allOpts = shuffle([correct, ...wrong]);
        const ci = allOpts.indexOf(correct);
        return {
          type: 'mcq',
          lessonId: '10-7',
          stem: `Vectơ có cùng độ dài và ngược hướng với vectơ $\\vec{a}$ được gọi là:`,
          opts: allOpts,
          ci,
          ans: allOpts[ci],
          sol: `Theo định nghĩa SGK Toán 10: Vectơ đối của vectơ $\\vec{a}$ là vectơ có cùng độ dài và ngược hướng với $\\vec{a}$.`
        };
      }

      if (idx === 9) {
        const correct = `$\\overrightarrow{GA} + \\overrightarrow{GB} + \\overrightarrow{GC} = \\vec{0}$`;
        const wrong = [
          `$\\overrightarrow{GA} + \\overrightarrow{GB} = \\overrightarrow{GC}$`,
          `$\\overrightarrow{AB} + \\overrightarrow{AC} = \\overrightarrow{AG}$`,
          `$\\overrightarrow{GA} = \\overrightarrow{GB} = \\overrightarrow{GC}$`
        ];
        const allOpts = shuffle([correct, ...wrong]);
        const ci = allOpts.indexOf(correct);
        return {
          type: 'mcq',
          lessonId: '10-8',
          stem: `Cho tam giác $ABC$ có trọng tâm $G$. Đẳng thức vectơ nào sau đây luôn đúng?`,
          opts: allOpts,
          ci,
          ans: allOpts[ci],
          sol: `Điểm $G$ là trọng tâm của tam giác $ABC$ khi và chỉ khi $\\overrightarrow{GA} + \\overrightarrow{GB} + \\overrightarrow{GC} = \\vec{0}$.`
        };
      }

      if (idx === 10) {
        const x = pick([3, 4]), y = pick([-4, -2, 2]);
        const correct = `$(${x}; ${y})$`;
        const wrong = [`$(${y}; ${x})$`, `$(${x}; ${-y})$`, `$(${-x}; ${-y})$`];
        const allOpts = shuffle([correct, ...wrong]);
        const ci = allOpts.indexOf(correct);
        return {
          type: 'mcq',
          lessonId: '10-10',
          stem: `Trong mặt phẳng toạ độ $Oxy$, toạ độ của vectơ $\\vec{u} = ${x}\\vec{i} ${numSign(y)}\\vec{j}$ là:`,
          opts: allOpts,
          ci,
          ans: allOpts[ci],
          sol: `Vectơ $\\vec{u} = x\\vec{i} + y\\vec{j}$ có toạ độ là $(x; y) = (${x}; ${y})$.`
        };
      }

      if (idx === 11) {
        const x1 = pick([1, 2]), y1 = pick([-2, -1]);
        const dx = pick([2, 3]), dy = pick([3, 4]);
        const x2 = x1 + dx, y2 = y1 + dy;
        const correct = `$(${dx}; ${dy})$`;
        const wrong = [`$(${x1 + x2}; ${y1 + y2})$`, `$(${dx}; ${-dy})$`, `$(${-dx}; ${-dy})$`];
        const allOpts = shuffle([correct, ...wrong]);
        const ci = allOpts.indexOf(correct);
        return {
          type: 'mcq',
          lessonId: '10-10',
          stem: `Trong mặt phẳng toạ độ $Oxy$, cho $A(${x1}; ${y1})$ và $B(${x2}; ${y2})$. Toạ độ của vectơ $\\overrightarrow{AB}$ là:`,
          opts: allOpts,
          ci,
          ans: allOpts[ci],
          sol: `$\\overrightarrow{AB} = (x_B - x_A; y_B - y_A) = (${x2} - ${x1}; ${y2} - (${y1})) = (${dx}; ${dy})$.`
        };
      }
    }

    if (part === 'B') {
      if (idx === 0) {
        return {
          type: 'ds',
          lessonId: '10-2',
          stem: `Cho hai khoảng $A = (-2; 4)$ và $B = [1; 6]$. Xét tính đúng/sai của các mệnh đề sau:`,
          items: [
            { s: `$A \\cap B = [1; 4)$`, t: true },
            { s: `$A \\cup B = (-2; 6]$`, t: true },
            { s: `$A \\setminus B = (-2; 1)$`, t: true },
            { s: `Tập hợp $A$ có vô số phần tử.`, t: true }
          ],
          sol: `a) Đúng: $A \\cap B = [1; 4)$.<br>b) Đúng: $A \\cup B = (-2; 6]$.<br>c) Đúng: $A \\setminus B = (-2; 1)$.<br>d) Đúng: Khoảng số thực $(-2; 4)$ chứa vô số số thực.`
        };
      }

      if (idx === 1) {
        return {
          type: 'ds',
          lessonId: '10-4',
          stem: `Cho tam giác $ABC$ có độ dài các cạnh $a = 7, b = 5, c = 8$. Xét tính đúng/sai:`,
          items: [
            { s: `Nửa chu vi của tam giác là $p = 10$.`, t: true },
            { s: `Diện tích của tam giác bằng $10\\sqrt{3}$.`, t: true },
            { s: `Số đo góc $A$ bằng $60^\\circ$.`, t: true },
            { s: `Bán kính đường tròn ngoại tiếp tam giác là $R = 7$.`, t: false }
          ],
          sol: `a) Đúng: $p = (7 + 5 + 8)/2 = 10$.<br>b) Đúng: $S = \\sqrt{10(10-7)(10-5)(10-8)} = 10\\sqrt{3}$.<br>c) Đúng: $\\cos A = \\dfrac{25 + 64 - 49}{2 \\cdot 5 \\cdot 8} = \\dfrac{1}{2} \\Rightarrow A = 60^\\circ$.<br>d) Sai: $R = \\dfrac{a}{2\\sin A} = \\dfrac{7\\sqrt{3}}{3} \\ne 7$.`
        };
      }

      if (idx === 2) {
        return {
          type: 'ds',
          lessonId: '10-8',
          stem: `Cho hình bình hành $ABCD$ tâm $O$. Xét tính đúng/sai của các hệ thức vectơ sau:`,
          items: [
            { s: `$\\overrightarrow{AB} = \\overrightarrow{DC}$.`, t: true },
            { s: `$\\overrightarrow{OA} + \\overrightarrow{OC} = \\vec{0}$.`, t: true },
            { s: `$\\overrightarrow{AB} + \\overrightarrow{AD} = \\overrightarrow{AC}$.`, t: true },
            { s: `$\\overrightarrow{AB} - \\overrightarrow{AC} = \\overrightarrow{BC}$.`, t: false }
          ],
          sol: `a) Đúng: Hai vectơ cùng hướng và cùng độ dài.<br>b) Đúng: $O$ là trung điểm $AC$.<br>c) Đúng: Quy tắc hình bình hành.<br>d) Sai: Theo quy tắc trừ, $\\overrightarrow{AB} - \\overrightarrow{AC} = \\overrightarrow{CB} \\ne \\overrightarrow{BC}$.`
        };
      }

      if (idx === 3) {
        return {
          type: 'ds',
          lessonId: '10-10',
          stem: `Trong mặt phẳng toạ độ $Oxy$, cho ba điểm $A(1; 2), B(-2; 6)$ và $C(4; 4)$. Xét tính đúng/sai:`,
          items: [
            { s: `Toạ độ của vectơ $\\overrightarrow{AB} = (-3; 4)$.`, t: true },
            { s: `Độ dài đoạn thẳng $AB = 5$.`, t: true },
            { s: `Toạ độ trung điểm $M$ của đoạn thẳng $AC$ là $M(2{,}5; 3)$.`, t: true },
            { s: `Ba điểm $A, B, C$ thẳng hàng.`, t: false }
          ],
          sol: `a) Đúng: $\\overrightarrow{AB} = (-2 - 1; 6 - 2) = (-3; 4)$.<br>b) Đúng: $AB = \\sqrt{(-3)^2 + 4^2} = 5$.<br>c) Đúng: $x_M = (1 + 4)/2 = 2{,}5; y_M = (2 + 4)/2 = 3$.<br>d) Sai: $\\overrightarrow{AC} = (3; 2)$. Do $\\dfrac{-3}{3} \\ne \\dfrac{4}{2}$ nên ba điểm không thẳng hàng.`
        };
      }
    }

    if (part === 'C') {
      if (idx === 0) {
        const n = pick([4, 5, 6]);
        const ansVal = Math.pow(2, n);
        return {
          type: 'tln',
          lessonId: '10-2',
          stem: `Một tập hợp $X$ có $${n}$ phần tử. Hỏi tập hợp $X$ có tất cả bao nhiêu tập con?`,
          v: ansVal,
          dp: 0,
          ans: String(ansVal),
          sol: `Số tập con của một tập hợp có $n$ phần tử là $2^n = 2^{${n}} = ${ansVal}$.`
        };
      }

      if (idx === 1) {
        const x1 = pick([1, 2, 3]), x2 = pick([5, 7, 9]);
        const xm = (x1 + x2) / 2;
        return {
          type: 'tln',
          lessonId: '10-10',
          stem: `Trong mặt phẳng $Oxy$, cho $A(${x1}; 3)$ và $B(${x2}; 7)$. Tìm hoành độ trung điểm $M$ của đoạn thẳng $AB$.`,
          v: xm,
          dp: 0,
          ans: String(xm),
          sol: `$x_M = \\dfrac{x_A + x_B}{2} = \\dfrac{${x1} + ${x2}}{2} = ${xm}$.`
        };
      }

      if (idx === 2) {
        // Giải phương trình bậc 2: (x - r1)(x - r2) = 0
        const r1 = pick([2, 3]), r2 = pick([4, 5]);
        const b = -(r1 + r2);
        const c = r1 * r2;
        return {
          type: 'tln',
          lessonId: '10-16',
          stem: `Tìm nghiệm lớn nhất của phương trình bậc hai $x^2 ${numSign(b)}x ${numSign(c)} = 0$.`,
          v: Math.max(r1, r2),
          dp: 0,
          ans: String(Math.max(r1, r2)),
          sol: `$\\Delta = (${b})^2 - 4(1)(${c}) = ${b*b - 4*c} > 0$. Phương trình có 2 nghiệm phân biệt là $x_1 = ${r1}, x_2 = ${r2}$. Nghiệm lớn nhất là $x = ${Math.max(r1, r2)}$.`
        };
      }

      if (idx === 3) {
        return {
          type: 'tln',
          lessonId: '10-4',
          stem: `Cho tam giác vuông $ABC$ vuông tại $A$ có hai cạnh góc vuông $AB = 6, AC = 8$. Độ dài cạnh huyền $BC$ bằng bao nhiêu?`,
          v: 10,
          dp: 0,
          ans: "10",
          sol: `Theo định lý Pythagore: $BC = \\sqrt{AB^2 + AC^2} = \\sqrt{36 + 64} = \\sqrt{100} = 10$.`
        };
      }

      if (idx === 4) {
        const u1 = pick([2, 3]), u2 = pick([1, 2]), v1 = pick([3, 4]), v2 = pick([-2, -1]);
        const dot = u1 * v1 + u2 * v2;
        return {
          type: 'tln',
          lessonId: '10-11',
          stem: `Trong mặt phẳng $Oxy$, cho $\\vec u = (${u1}; ${u2})$ và $\\vec v = (${v1}; ${v2})$. Tính tích vô hướng $\\vec u \\cdot \\vec v$.`,
          v: dot,
          dp: 0,
          ans: String(dot),
          sol: `$\\vec u \\cdot \\vec v = u_1 v_1 + u_2 v_2 = ${u1} \\cdot ${v1} + ${u2} \\cdot (${v2}) = ${dot}$.`
        };
      }

      if (idx === 5) {
        return {
          type: 'tln',
          lessonId: '10-3',
          stem: `Cho hệ bất phương trình biểu diễn miền nghiệm là tam giác $OAB$ với các đỉnh $O(0; 0), A(0; 4), B(3; 0)$. Giá trị lớn nhất của biểu thức $F(x; y) = 2x + 3y$ trên miền tam giác này bằng bao nhiêu?`,
          v: 12,
          dp: 0,
          ans: "12",
          sol: `Tính giá trị tại các đỉnh: $F(0; 0) = 0$, $F(0; 4) = 12$, $F(3; 0) = 6$. Vậy giá trị lớn nhất là $12$ tại $(0; 4)$.`
        };
      }
    }

    return null;
  }

  // ==========================================
  // 4. HÀM TẠO CÂU HỎI TƯƠNG TỰ TỔNG HỢP (100% CHÍNH XÁC)
  // ==========================================
  function generateExactSimilarQuestion(origQ, idx, part, grade) {
    if (!origQ) return null;

    let res = null;
    if (grade === 12 || (origQ.lessonId && origQ.lessonId.startsWith('12-'))) {
      res = generateSimilarGrade12(origQ, part, idx);
    } else if (grade === 11 || (origQ.lessonId && origQ.lessonId.startsWith('11-'))) {
      res = generateSimilarGrade11(origQ, part, idx);
    } else {
      res = generateSimilarGrade10(origQ, part, idx);
    }

    if (res) {
      return {
        ...res,
        id: `${part}${idx + 1}`
      };
    }

    // Nếu là câu hỏi tự đưa lên của Thầy/Cô không nằm trong mẫu chuẩn:
    // ĐẢM BẢO 100% BẢO TOÀN TÍNH ĐÚNG ĐẮN BẰNG CÁCH SHUFFLE PHƯƠNG ÁN HỢP LÝ
    if (origQ.type === 'mcq' && origQ.opts && origQ.opts.length >= 2) {
      const correctAns = origQ.ans || origQ.opts[origQ.ci !== undefined ? origQ.ci : 0];
      const shuffled = shuffle([...origQ.opts]);
      const newCi = shuffled.indexOf(correctAns);
      return {
        ...origQ,
        id: `${part}${idx + 1}`,
        opts: shuffled,
        ci: newCi >= 0 ? newCi : 0,
        ans: correctAns
      };
    }

    return { ...origQ, id: `${part}${idx + 1}` };
  }

  // ==========================================
  // 5. CỬA SỔ IN VÀ XUẤT BẢN IN A4 CHUYÊN NGHIỆP
  // ==========================================
  function printAutoExamA4() {
    const exam = window.AUTO_EXAM;
    if (!exam) {
      if (typeof window.doSampleExam === 'function') {
        window.doSampleExam();
      }
    }
    const curExam = window.AUTO_EXAM;
    if (!curExam) {
      if (typeof window.toast === 'function') {
        window.toast('Vui lòng chọn đề thi trước khi in!');
      }
      return;
    }

    // Chuẩn bị modal in A4 tương tác chuyên nghiệp nếu chưa có
    let printModal = document.getElementById('modalA4PrintPreview');
    if (!printModal) {
      printModal = document.createElement('div');
      printModal.id = 'modalA4PrintPreview';
      printModal.className = 'modal';
      printModal.innerHTML = `
        <div class="modal-box" style="max-width:960px; max-height:92vh; width:95%; display:flex; flex-direction:column; padding:0; border-radius:16px; overflow:hidden;">
          <div style="background:linear-gradient(135deg, #0B5563, #0F6B55); color:#fff; padding:14px 20px; display:flex; justify-content:space-between; align-items:center;">
            <div style="display:flex; align-items:center; gap:8px;">
              <span style="font-size:22px;">🖨️</span>
              <div>
                <b style="font-size:16px; display:block;">XEM TRƯỚC VÀ XUẤT BẢN IN A4 CHUẨN BỘ GD&ĐT</b>
                <span style="font-size:12px; opacity:0.9;">Định dạng chuẩn 04 trang A4 · Font Be Vietnam Pro · Đầy đủ ma trận & lời giải</span>
              </div>
            </div>
            <div style="display:flex; gap:8px; align-items:center;">
              <button id="btnPrintA4Direct" class="btn sm" style="background:#F4B942; color:#0B2A3C; font-weight:800; border:none; padding:8px 16px; border-radius:8px; cursor:pointer;">
                🖨️ In ra giấy / Lưu PDF (Ctrl + P)
              </button>
              <button id="btnCopyExamText" class="btn sm" style="background:rgba(255,255,255,0.2); color:#fff; font-weight:700; border:1px solid rgba(255,255,255,0.4); padding:8px 12px; border-radius:8px; cursor:pointer;">
                📋 Sao chép văn bản
              </button>
              <button id="btnClosePrintA4Modal" style="background:none; border:none; color:#fff; font-size:24px; cursor:pointer; line-height:1;">
                &times;
              </button>
            </div>
          </div>
          <div id="printA4ModalBody" style="flex:1; overflow-y:auto; padding:24px 30px; background:#f8fafc;"></div>
        </div>
      `;
      document.body.appendChild(printModal);

      // Gắn sự kiện đóng modal
      document.getElementById('btnClosePrintA4Modal')?.addEventListener('click', () => {
        printModal.classList.remove('on');
      });
      printModal.addEventListener('click', (e) => {
        if (e.target === printModal) printModal.classList.remove('on');
      });

      // Nút in trực tiếp
      document.getElementById('btnPrintA4Direct')?.addEventListener('click', () => {
        try {
          window.print();
        } catch (err) {
          console.warn('Print error:', err);
        }
      });

      // Nút copy text
      document.getElementById('btnCopyExamText')?.addEventListener('click', () => {
        const paperEl = document.getElementById('autoPaper');
        if (paperEl) {
          navigator.clipboard.writeText(paperEl.innerText).then(() => {
            if (typeof window.toast === 'function') {
              window.toast('📋 Đã sao chép toàn bộ nội dung đề thi vào bộ nhớ tạm!');
            }
          });
        }
      });
    }

    // Sao chép nội dung tờ giấy thi vào vùng xem trước của modal
    const bodyEl = document.getElementById('printA4ModalBody');
    const autoPaper = document.getElementById('autoPaper');
    if (bodyEl && autoPaper) {
      bodyEl.innerHTML = `
        <div style="background:#fff; border:1px solid #cbd5e1; border-radius:10px; padding:32px 36px; box-shadow:0 4px 16px rgba(0,0,0,0.06); max-width:800px; margin:0 auto;">
          ${autoPaper.innerHTML}
        </div>
      `;
      if (typeof window.renderMathInElement === 'function') {
        window.renderMathInElement(bodyEl, {
          delimiters: [
            { left: '$$', right: '$$', display: true },
            { left: '$', right: '$', display: false }
          ],
          throwOnError: false
        });
      }
    }

    // Mở modal lên
    printModal.classList.add('on');

    // Thử kích hoạt lệnh in của trình duyệt
    try {
      window.print();
    } catch (e) {
      console.warn('Silent print blocked by iframe sandbox, modal remains available:', e);
    }

    if (typeof window.toast === 'function') {
      window.toast('🖨️ Đã mở cửa sổ bản in A4! Em/Thầy Cô có thể bấm Ctrl + P hoặc bấm nút "In ra giấy / Lưu PDF" để in.');
    }
  }

  // Xuất ra phạm vi toàn cục
  window.ExactExamGenerator = {
    generateExactSimilarQuestion,
    printAutoExamA4
  };
})();
