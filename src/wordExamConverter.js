// @ts-nocheck
import JSZip from 'jszip';
import { MTEF_CHARS } from './mtefChars.js';

/**
 * MODULE CHUYỂN ĐỔI ĐỀ THI TỪ WORD (.DOCX / .TXT / DÁN VĂN BẢN) SANG KATEX LATEX
 * - Giải mã nhị phân toàn diện công thức MathType & Equation Editor 3.0 (OLE Compound Document CFBF + MTEF v3/v5)
 * - Giải mã công thức OMML (Office Math Markup Language) của Microsoft Word
 * - Giải mã công thức nhúng trong WMF / EMF image comments (MathType001)
 * - Tự động nhận diện phương án gạch chân (<u>...</u>) là đáp án đúng
 * - Tự động bọc chuẩn KaTeX $...$ hiển thị trực tiếp và chấm điểm tự động
 */

/* =========================================================================
   1. GIẢI MÃ OLE COMPOUND FILE (CFBF) ĐỂ TRÍCH XUẤT STREAM "Equation Native"
   ========================================================================= */

export function extractEquationNativeFromOle(buf) {
  if (!buf || buf.length < 512) return null;

  // Kiểm tra magic bytes OLE CFBF: D0 CF 11 E0 A1 B1 1A E1
  if (buf[0] === 0xd0 && buf[1] === 0xcf && buf[2] === 0x11 && buf[3] === 0xe0) {
    try {
      const view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
      const sectorShift = view.getUint16(30, true);
      const sectorSize = 1 << sectorShift;
      const miniSectorShift = view.getUint16(32, true);
      const miniSectorSize = 1 << miniSectorShift;
      const numFatSectors = view.getUint32(44, true);
      const firstDirSector = view.getUint32(48, true);
      const miniCutoff = view.getUint32(56, true);
      const firstMiniFatSector = view.getUint32(60, true);

      const getSectorOffset = (secId) => 512 + secId * sectorSize;

      // Xây dựng bảng FAT
      const fat = [];
      const msatCount = Math.min(numFatSectors, 109);
      for (let i = 0; i < msatCount; i++) {
        const secId = view.getUint32(76 + i * 4, true);
        if (secId >= 0xfffffffa) continue;
        const off = getSectorOffset(secId);
        if (off + sectorSize <= buf.length) {
          for (let j = 0; j < sectorSize; j += 4) {
            fat.push(view.getUint32(off + j, true));
          }
        }
      }

      const readChain = (startSec, size) => {
        const out = [];
        let sec = startSec;
        let left = size;
        while (sec < 0xfffffffe && left > 0 && sec < fat.length) {
          const off = getSectorOffset(sec);
          if (off >= buf.length) break;
          const take = Math.min(sectorSize, left, buf.length - off);
          for (let b = 0; b < take; b++) out.push(buf[off + b]);
          left -= take;
          sec = fat[sec];
        }
        return new Uint8Array(out);
      };

      // Đọc các mục Directory (mỗi mục 128 bytes)
      const dirBytes = readChain(firstDirSector, 128 * 64);
      let rootEntry = null;
      let eqEntry = null;

      const dirView = new DataView(dirBytes.buffer, dirBytes.byteOffset, dirBytes.byteLength);
      for (let i = 0; i < dirBytes.length; i += 128) {
        if (i + 128 > dirBytes.length) break;
        const nameLen = dirView.getUint16(i + 64, true);
        if (nameLen === 0) continue;
        let name = '';
        for (let c = 0; c < Math.min(nameLen - 2, 62); c += 2) {
          name += String.fromCharCode(dirView.getUint16(i + c, true));
        }
        const startSec = dirView.getUint32(i + 116, true);
        const size = dirView.getUint32(i + 120, true);
        const type = dirBytes[i + 66];

        if (type === 5) rootEntry = { startSec, size };
        if (name === 'Equation Native' || name.toLowerCase().includes('equation')) {
          eqEntry = { startSec, size };
        }
      }

      if (eqEntry) {
        if (eqEntry.size < miniCutoff && rootEntry) {
          // Xây dựng MiniFAT
          const miniFat = [];
          let msec = firstMiniFatSector;
          while (msec < 0xfffffffe && msec < fat.length) {
            const off = getSectorOffset(msec);
            if (off + sectorSize <= buf.length) {
              for (let j = 0; j < sectorSize; j += 4) {
                miniFat.push(view.getUint32(off + j, true));
              }
            }
            msec = fat[msec];
          }

          const miniContainer = readChain(rootEntry.startSec, rootEntry.size);
          const out = [];
          let ssec = eqEntry.startSec;
          let left = eqEntry.size;
          while (ssec < 0xfffffffe && left > 0 && ssec < miniFat.length) {
            const off = ssec * miniSectorSize;
            if (off >= miniContainer.length) break;
            const take = Math.min(miniSectorSize, left, miniContainer.length - off);
            for (let b = 0; b < take; b++) out.push(miniContainer[off + b]);
            left -= take;
            ssec = miniFat[ssec];
          }
          return new Uint8Array(out);
        } else {
          return readChain(eqEntry.startSec, eqEntry.size);
        }
      }
    } catch (e) {
      console.warn('Lỗi đọc cấu trúc OLE CFBF:', e);
    }
  }

  // Nếu buffer là luồng Equation Native có header 28 bytes
  if (buf[0] === 28 && buf[1] === 0) {
    const view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
    const cbSize = view.getUint32(8, true);
    return buf.slice(28, Math.min(28 + cbSize, buf.length));
  }

  // Nếu buffer trực tiếp là bytecode MTEF (version 3 hoặc 5)
  if ((buf[0] === 3 || buf[0] === 5) && (buf[1] === 0 || buf[1] === 1)) {
    return buf;
  }

  return null;
}

/**
 * Quét tìm MTEF trong các định dạng khác (WMF / EMF comment header "MathType001" hoặc "MTEF")
 */
export function extractMTEFFromAnyBuffer(buf) {
  if (!buf || buf.length < 4) return null;

  // 1. Thử phân tích dạng OLE CFBF container (thường là oleObject*.bin)
  try {
    const oleStream = extractEquationNativeFromOle(buf);
    if (oleStream && oleStream.length > 5) return oleStream;
  } catch (err) {
    console.warn('extractEquationNativeFromOle error:', err);
  }

  // 2. Nếu buffer trực tiếp có 28-byte OLE header Equation Native
  if (buf[0] === 28 && buf[1] === 0) {
    return buf;
  }

  // 3. Quét tìm chữ ký "MathType001" (phổ biến trong file WMF / EMF nhúng)
  const sig1 = [77, 97, 116, 104, 84, 121, 112, 101, 48, 48, 49]; // "MathType001"
  for (let i = 0; i <= buf.length - sig1.length - 4; i++) {
    let match = true;
    for (let j = 0; j < sig1.length; j++) {
      if (buf[i + j] !== sig1[j]) { match = false; break; }
    }
    if (match) {
      const candidate = buf.slice(i + sig1.length);
      // Tìm điểm bắt đầu MTEF ver 3 hoặc ver 5 trong 16 byte tiếp theo
      for (let k = 0; k < Math.min(16, candidate.length - 4); k++) {
        if ((candidate[k] === 5 || candidate[k] === 3) && (candidate[k + 1] === 1 || candidate[k + 1] === 0)) {
          return candidate.slice(k);
        }
      }
      return candidate;
    }
  }

  // 4. Quét tìm chữ ký "MTEF"
  const sig2 = [77, 84, 69, 70]; // "MTEF"
  for (let i = 0; i <= buf.length - sig2.length - 4; i++) {
    let match = true;
    for (let j = 0; j < sig2.length; j++) {
      if (buf[i + j] !== sig2[j]) { match = false; break; }
    }
    if (match) {
      const candidate = buf.slice(i + sig2.length);
      for (let k = 0; k < Math.min(16, candidate.length - 4); k++) {
        if ((candidate[k] === 5 || candidate[k] === 3) && (candidate[k + 1] === 1 || candidate[k + 1] === 0)) {
          return candidate.slice(k);
        }
      }
      return candidate;
    }
  }

  return null;
}

/* =========================================================================
   2. TRÌNH BIÊN DỊCH BYTECODE MATHTYPE MTEF SANG LATEX (CHUẨN KATEX)
   ========================================================================= */

const OptionType = {
  MtefOptNudge: 0x08,
  MtefOptCharEmbell: 0x01,
  MtefOptCharFuncStart: 0x02,
  MtefOptCharEncChar8: 0x04,
  MtefOptCharEncChar16: 0x10,
  MtefOptCharEncNoMtcode: 0x20,
  MtefOptLineNull: 0x01,
  mtefOPT_LP_RULER: 0x02,
  MtefOptLineLspace: 0x04
};

const SelectorType = {
  tmANGLE: 0,
  tmPAREN: 1,
  tmBRACE: 2,
  tmBRACK: 3,
  tmBAR: 4,
  tmDBAR: 5,
  tmFLOOR: 6,
  tmCEILING: 7,
  tmOBRACK: 8,
  tmINTERVAL: 9,
  tmROOT: 10,
  tmFRACT: 11,
  tmUBAR: 12,
  tmOBAR: 13,
  tmARROW: 14,
  tmINTEG: 15,
  tmSUM: 16,
  tmPROD: 17,
  tmCOPROD: 18,
  tmUNION: 19,
  tmINTER: 20,
  tmINTOP: 21,
  tmSUMOP: 22,
  tmLIM: 23,
  tmHBRACE: 24,
  tmHBRACK: 25,
  tmLDIV: 26,
  tmSUB: 27,
  tmSUP: 28,
  tmSUBSUP: 29,
  tmDIRAC: 30,
  tmVEC: 31,
  tmTILDE: 32,
  tmHAT: 33,
  tmARC: 34
};

class MTEFReader {
  constructor(buf) {
    this.buf = buf;
    this.view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
    this.pos = 0;
  }
  readByte() {
    if (this.pos >= this.buf.length) return null;
    return this.buf[this.pos++];
  }
  readUInt16() {
    if (this.pos + 2 > this.buf.length) return 0;
    const val = this.view.getUint16(this.pos, true);
    this.pos += 2;
    return val;
  }
  seek(offset) {
    this.pos += offset;
  }
  readNullTerminated() {
    let s = '';
    while (this.pos < this.buf.length) {
      const b = this.buf[this.pos++];
      if (b === 0) break;
      s += String.fromCharCode(b);
    }
    return s;
  }
}

export function parseMTEFToLatex(rawEqn) {
  if (!rawEqn || rawEqn.length < 5) return '';

  let reader;
  // Bỏ qua header 28 bytes nếu có
  if (rawEqn[0] === 28 && rawEqn[1] === 0) {
    const view = new DataView(rawEqn.buffer, rawEqn.byteOffset, rawEqn.byteLength);
    const cbSize = view.getUint32(8, true);
    reader = new MTEFReader(rawEqn.slice(28, Math.min(28 + cbSize, rawEqn.length)));
  } else {
    reader = new MTEFReader(rawEqn);
  }

  // Đọc Header MTEF
  const ver = reader.readByte();
  const platform = reader.readByte();
  const product = reader.readByte();
  const version = reader.readByte();
  const versionSub = reader.readByte();
  const app = reader.readNullTerminated();
  const inline = reader.readByte();

  // Xác thực header MTEF hợp lệ để tránh giải mã nhầm file ảnh bitmap
  const isAppValid = typeof app === 'string' && (
    app.toLowerCase().includes('mathtype') ||
    app.toLowerCase().includes('equation') ||
    app.toLowerCase().includes('dsmt') ||
    app.toLowerCase().includes('math') ||
    (app.length >= 3 && app.length <= 40 && /^[a-zA-Z0-9_\-\s.]+$/.test(app))
  );
  if (!isAppValid) return '';

  const nodes = [];
  while (reader.pos < reader.buf.length) {
    const b = reader.readByte();
    if (b === null) break;

    // Record tương lai (FUTURE) >= 100
    if (b >= 100) {
      const skip = reader.readByte() || 0;
      reader.seek(skip);
      continue;
    }

    if (b === 0) { // END
      nodes.push({ tag: 0 });
    } else if (b === 1) { // LINE
      const options = reader.readByte() || 0;
      if (options & OptionType.MtefOptNudge) {
        reader.readUInt16();
        reader.readUInt16();
      }
      if (options & OptionType.MtefOptLineLspace) reader.readByte();
      if (options & OptionType.mtefOPT_LP_RULER) {
        const nStops = reader.readByte() || 0;
        for (let s = 0; s < nStops; s++) {
          reader.readByte();
          reader.readUInt16();
        }
      }
      const isNull = (options & OptionType.MtefOptLineNull) !== 0;
      nodes.push({ tag: 1, isNull });
    } else if (b === 2) { // CHAR
      const options = reader.readByte() || 0;
      if (options & OptionType.MtefOptNudge) {
        reader.readUInt16();
        reader.readUInt16();
      }
      const typeface = reader.readByte() || 0;
      let mtcode = 0;
      if ((options & OptionType.MtefOptCharEncNoMtcode) === 0) {
        mtcode = reader.readUInt16();
      }
      if (options & OptionType.MtefOptCharEncChar8) reader.readByte();
      if (options & OptionType.MtefOptCharEncChar16) reader.readUInt16();
      nodes.push({ tag: 2, mtcode, typeface, options });
    } else if (b === 3) { // TMPL
      const options = reader.readByte() || 0;
      if (options & OptionType.MtefOptNudge) {
        reader.readUInt16();
        reader.readUInt16();
      }
      const selector = reader.readByte() || 0;
      let b1 = reader.readByte() || 0;
      let variation = b1;
      if (b1 & 0x80) {
        let b2 = reader.readByte() || 0;
        variation = (b1 & 0x7f) | (b2 << 8);
      }
      const tmplOpts = reader.readByte() || 0;
      nodes.push({ tag: 3, selector, variation, tmplOpts });
    } else if (b === 4) { // PILE
      const options = reader.readByte() || 0;
      if (options & OptionType.MtefOptNudge) { reader.readUInt16(); reader.readUInt16(); }
      reader.readByte();
      reader.readByte();
      nodes.push({ tag: 4 });
    } else if (b === 5) { // MATRIX
      const options = reader.readByte() || 0;
      if (options & OptionType.MtefOptNudge) { reader.readUInt16(); reader.readUInt16(); }
      reader.readByte();
      reader.readByte();
      reader.readByte();
      const rows = reader.readByte() || 0;
      const cols = reader.readByte() || 0;
      for (let r = 0; r < rows; r++) reader.readByte();
      for (let c = 0; c < cols; c++) reader.readByte();
      nodes.push({ tag: 5, rows, cols });
      nodes.push({ tag: 1, isNull: true });
      nodes.push({ tag: 1, isNull: true });
    } else if (b === 6) { // EMBELL
      const options = reader.readByte() || 0;
      if (options & OptionType.MtefOptNudge) { reader.readUInt16(); reader.readUInt16(); }
      const embellType = reader.readByte() || 0;
      nodes.push({ tag: 6, embellType });
    } else if (b === 7) { // RULER
      const nStops = reader.readByte() || 0;
      for (let s = 0; s < nStops; s++) { reader.readByte(); reader.readUInt16(); }
    } else if (b === 8) { // FONT_STYLE_DEF
      reader.readByte();
      reader.readNullTerminated();
    } else if (b === 9) { // SIZE
      reader.readByte();
      reader.readByte();
    } else if (b === 10) { // FULL
      nodes.push({ tag: 10 });
    } else if (b === 11 || b === 12 || b === 13 || b === 14) {
      nodes.push({ tag: b });
    } else if (b === 15) { // COLOR
      reader.readByte();
    } else if (b === 16) { // COLOR_DEF
      reader.readByte();
      reader.readByte();
      reader.readByte();
    } else if (b === 17) { // FONT_DEF
      reader.readByte();
      reader.readNullTerminated();
    } else if (b === 18) { // EQN_PREFS
      reader.readByte();
      for (let i = 0; i < 7; i++) reader.readByte();
      for (let i = 0; i < 30; i++) {
        reader.readByte();
        reader.readUInt16();
      }
    } else if (b === 19) { // ENCODING_DEF
      reader.readNullTerminated();
    }
  }

  // Xây dựng cây AST bằng cơ chế Stack (ngăn xếp)
  const root = { tag: 0xff, children: [] };
  const stack = [root];

  for (const node of nodes) {
    const parent = stack[stack.length - 1];
    if (node.tag === 1) { // LINE
      if (parent) {
        if (!parent.children) parent.children = [];
        parent.children.push(node);
      }
      if (!node.isNull) stack.push(node);
    } else if (node.tag === 3 || node.tag === 4 || node.tag === 5) {
      if (parent) {
        if (!parent.children) parent.children = [];
        parent.children.push(node);
      }
      stack.push(node);
    } else if (node.tag === 0) { // END
      if (stack.length > 1) stack.pop();
    } else if (node.tag === 2 || node.tag === 6) { // CHAR, EMBELL
      if (parent) {
        if (!parent.children) parent.children = [];
        parent.children.push(node);
      }
    }
  }

  // Đệ quy chuyển đổi AST sang chuỗi KaTeX LaTeX
  function renderLatex(ast) {
    if (!ast) return '';
    let buf = '';

    if (ast.tag === 0xff || ast.tag === 1) { // ROOT hoặc LINE
      for (const child of ast.children || []) {
        buf += renderLatex(child);
      }
      return buf;
    }

    if (ast.tag === 2) { // CHAR
      const mtcode = ast.mtcode;
      const hexCode = ('0000' + mtcode.toString(16)).slice(-4).toLowerCase();
      let char = MTEF_CHARS['char/0x' + hexCode] || MTEF_CHARS['char/0x' + hexCode + '/mathmode'];

      // Fallback for Symbol font & Private Use Area (0xF020 - 0xF0FF)
      if (!char && mtcode >= 0xf020 && mtcode <= 0xf0ff) {
        const ascii = mtcode - 0xf000;
        const hexAscii = ('0000' + ascii.toString(16)).slice(-4).toLowerCase();
        char = MTEF_CHARS['char/0x' + hexAscii] || MTEF_CHARS['char/0x' + hexAscii + '/mathmode'];
        if (!char) {
          // Bảng ánh xạ Symbol font sang ký hiệu toán và chữ Hy Lạp
          const symbolMap = {
            0x61: '\\alpha ', 0x62: '\\beta ', 0x67: '\\gamma ', 0x64: '\\delta ',
            0x65: '\\epsilon ', 0x7a: '\\zeta ', 0x68: '\\eta ', 0x71: '\\theta ',
            0x69: '\\iota ', 0x6b: '\\kappa ', 0x6c: '\\lambda ', 0x6d: '\\mu ',
            0x6e: '\\nu ', 0x78: '\\xi ', 0x70: '\\pi ', 0x72: '\\rho ',
            0x73: '\\sigma ', 0x74: '\\tau ', 0x75: '\\upsilon ', 0x6a: '\\varphi ',
            0x63: '\\chi ', 0x79: '\\psi ', 0x77: '\\omega ',
            0x41: 'A', 0x42: 'B', 0x47: '\\Gamma ', 0x44: '\\Delta ',
            0x45: 'E', 0x5a: 'Z', 0x48: 'H', 0x51: '\\Theta ',
            0x49: 'I', 0x4b: 'K', 0x4c: '\\Lambda ', 0x4d: 'M',
            0x4e: 'N', 0x58: '\\Xi ', 0x50: '\\Pi ', 0x52: 'P',
            0x53: '\\Sigma ', 0x54: 'T', 0x55: '\\Upsilon ', 0x46: '\\Phi ',
            0x43: 'X', 0x59: '\\Psi ', 0x57: '\\Omega ',
            0x2b: '+', 0x2d: '-', 0x3d: '=', 0x28: '(', 0x29: ')', 0x2f: '/',
            0xb1: '\\pm ', 0xa3: '\\le ', 0xb3: '\\ge ', 0xb9: '\\neq ', 0xa5: '\\infty ',
            0xce: '\\in ', 0xcf: '\\notin ', 0xc7: '\\cap ', 0xc8: '\\cup ', 0xcc: '\\subset ',
            0xde: '\\Rightarrow ', 0xdb: '\\Leftrightarrow ', 0xae: '\\rightarrow '
          };
          char = symbolMap[ascii] || String.fromCharCode(ascii);
        }
      }

      if (!char) {
        char = String.fromCharCode(mtcode);
      }

      // Chuẩn hóa các ký tự và toán tử thông dụng
      if (char === '±') char = '\\pm ';
      else if (char === '×') char = '\\cdot ';
      else if (char === '÷') char = '\\div ';
      else if (char === '≠') char = '\\neq ';
      else if (char === '≤') char = '\\le ';
      else if (char === '≥') char = '\\ge ';
      else if (char === 'π') char = '\\pi ';
      else if (char === 'α') char = '\\alpha ';
      else if (char === 'β') char = '\\beta ';
      else if (char === 'θ') char = '\\theta ';
      else if (char === 'φ') char = '\\varphi ';
      else if (char === 'λ') char = '\\lambda ';
      else if (char === 'Δ') char = '\\Delta ';
      else if (char === '∞') char = '\\infty ';
      else if (char === '∈') char = '\\in ';
      else if (char === '∉') char = '\\notin ';
      else if (char === '⊂') char = '\\subset ';
      else if (char === '∪') char = '\\cup ';
      else if (char === '∩') char = '\\cap ';
      else if (char === '→') char = '\\to ';
      else if (char === '⇒') char = '\\Rightarrow ';
      else if (char === '⇔') char = '\\Leftrightarrow ';
      else if (char === '∀') char = '\\forall ';
      else if (char === '∃') char = '\\exists ';
      else if (char === '°') char = '^\\circ ';
      return char;
    }

    if (ast.tag === 3) { // TMPL
      const sel = ast.selector;
      const ch = ast.children || [];

      // Căn bậc: ROOT = 10
      if (sel === SelectorType.tmROOT) {
        const main = ch[0] ? renderLatex(ch[0]) : '';
        const deg = ch[1] ? renderLatex(ch[1]) : '';
        return deg.trim() ? `\\sqrt[${deg.trim()}]{${main.trim()}}` : `\\sqrt{${main.trim()}}`;
      }

      // Phân số: FRACT = 11
      if (sel === SelectorType.tmFRACT) {
        const num = ch[0] ? renderLatex(ch[0]) : '';
        const den = ch[1] ? renderLatex(ch[1]) : '';
        return `\\frac{${num.trim()}}{${den.trim()}}`;
      }

      // Số mũ: SUP = 28
      if (sel === SelectorType.tmSUP) {
        if (ch.length === 1) {
          return `^{${renderLatex(ch[0]).trim()}}`;
        }
        const first = ch[0] ? renderLatex(ch[0]).trim() : '';
        const second = ch[1] ? renderLatex(ch[1]).trim() : '';
        if (second) {
          return first ? `{${first}}^{${second}}` : `^{${second}}`;
        }
        return `^{${first}}`;
      }

      // Chỉ số dưới: SUB = 27
      if (sel === SelectorType.tmSUB) {
        if (ch.length === 1) {
          return `_{${renderLatex(ch[0]).trim()}}`;
        }
        const first = ch[0] ? renderLatex(ch[0]).trim() : '';
        const second = ch[1] ? renderLatex(ch[1]).trim() : '';
        if (first && second) return `{${first}}_{${second}}`;
        return `_{${first || second}}`;
      }

      // Cả chỉ số dưới và trên: SUBSUP = 29
      if (sel === SelectorType.tmSUBSUP) {
        const sub = ch[0] ? renderLatex(ch[0]).trim() : '';
        const sup = ch[1] ? renderLatex(ch[1]).trim() : '';
        return `_{${sub}}^{${sup}}`;
      }

      // Tích phân: INTEG = 15
      if (sel === SelectorType.tmINTEG) {
        if (ch.length === 1) {
          return `\\int {${renderLatex(ch[0]).trim()}}`;
        }
        if (ch.length === 2) {
          const s1 = renderLatex(ch[0]).trim();
          const s2 = renderLatex(ch[1]).trim();
          return `\\int_{${s1}}^{${s2}}`;
        }
        const low = ch[0] ? renderLatex(ch[0]).trim() : '';
        const high = ch[1] ? renderLatex(ch[1]).trim() : '';
        const body = ch[2] ? renderLatex(ch[2]).trim() : '';
        let res = '\\int';
        if (low) res += `_{${low}}`;
        if (high) res += `^{${high}}`;
        if (body) res += ` {${body}}`;
        return res;
      }

      // Tổng & Tích n-ary: SUM = 16, PROD = 17
      if (sel === SelectorType.tmSUM) {
        if (ch.length === 1) return `\\sum {${renderLatex(ch[0]).trim()}}`;
        if (ch.length === 2) return `\\sum_{${renderLatex(ch[0]).trim()}} {${renderLatex(ch[1]).trim()}}`;
        const low = ch[0] ? renderLatex(ch[0]).trim() : '';
        const high = ch[1] ? renderLatex(ch[1]).trim() : '';
        const body = ch[2] ? renderLatex(ch[2]).trim() : '';
        return `\\sum_{${low}}^{${high}} {${body}}`;
      }
      if (sel === SelectorType.tmPROD) {
        if (ch.length === 1) return `\\prod {${renderLatex(ch[0]).trim()}}`;
        if (ch.length === 2) return `\\prod_{${renderLatex(ch[0]).trim()}} {${renderLatex(ch[1]).trim()}}`;
        const low = ch[0] ? renderLatex(ch[0]).trim() : '';
        const high = ch[1] ? renderLatex(ch[1]).trim() : '';
        const body = ch[2] ? renderLatex(ch[2]).trim() : '';
        return `\\prod_{${low}}^{${high}} {${body}}`;
      }

      // Dấu ngoặc: PAREN = 1, BRACK = 3, BRACE = 2, BAR = 4, INTERVAL = 9
      if (sel === SelectorType.tmPAREN) {
        const inner = ch[0] ? renderLatex(ch[0]).trim() : '';
        return `\\left( ${inner} \\right)`;
      }
      if (sel === SelectorType.tmBRACK) {
        const inner = ch[0] ? renderLatex(ch[0]).trim() : '';
        return `\\left[ ${inner} \\right]`;
      }
      if (sel === SelectorType.tmBRACE) {
        const inner = ch[0] ? renderLatex(ch[0]).trim() : '';
        return `\\left\\{ ${inner} \\right\\}`;
      }
      if (sel === SelectorType.tmBAR) {
        const inner = ch[0] ? renderLatex(ch[0]).trim() : '';
        return `\\left| ${inner} \\right|`;
      }

      // Vectơ: VEC = 31, ARROW = 14
      if (sel === SelectorType.tmVEC || sel === SelectorType.tmARROW) {
        const main = ch[0] ? renderLatex(ch[0]).trim() : '';
        return `\\vec{${main}}`;
      }

      // Giới hạn: LIM = 23
      if (sel === SelectorType.tmLIM) {
        const main = ch[0] ? renderLatex(ch[0]).trim() : '';
        const low = ch[1] ? renderLatex(ch[1]).trim() : '';
        return `\\lim_{${low}} {${main}}`;
      }

      // Gạch ngang trên / dưới: OBAR = 13, UBAR = 12
      if (sel === SelectorType.tmOBAR) {
        const main = ch[0] ? renderLatex(ch[0]).trim() : '';
        return `\\overline{${main}}`;
      }
      if (sel === SelectorType.tmUBAR) {
        const main = ch[0] ? renderLatex(ch[0]).trim() : '';
        return `\\underline{${main}}`;
      }

      // Mặc định
      let fallback = '';
      for (const child of ch) fallback += renderLatex(child);
      return fallback;
    }

    if (ast.tag === 4) { // PILE (hệ phương trình hoặc các dòng)
      const lines = (ast.children || []).map(renderLatex).filter(Boolean);
      return lines.join(' \\\\ ');
    }

    if (ast.tag === 5) { // MATRIX (ma trận)
      const ch = ast.children || [];
      const cols = ast.cols || 1;
      const cells = ch.map(renderLatex);
      let out = '\\begin{matrix} ';
      for (let i = 0; i < cells.length; i++) {
        out += cells[i];
        if ((i + 1) % cols === 0) {
          if (i + 1 < cells.length) out += ' \\\\ ';
        } else {
          out += ' & ';
        }
      }
      out += ' \\end{matrix}';
      return out;
    }

    if (ast.tag === 6) { // EMBELL (dấu phẩy đạo hàm, chấm, mũ)
      if (ast.embellType === 1) return "'";
      if (ast.embellType === 2) return "''";
      if (ast.embellType === 3) return "'''";
      if (ast.embellType === 4) return '\\dot ';
      if (ast.embellType === 5) return '\\ddot ';
      if (ast.embellType === 6) return '\\bar ';
      if (ast.embellType === 7) return '\\hat ';
    }

    return '';
  }

  const finalLatex = renderLatex(root).trim();
  // Khử chữ tượng hình Trung Quốc hoặc rác nhị phân nếu giải mã nhầm ảnh
  if (/[\u4e00-\u9fa5\u3400-\u4dbf]/.test(finalLatex)) return '';
  if ((finalLatex.match(/\\begin\{matrix\}\s*\\\\\s*\\end\{matrix\}/g) || []).length >= 2) return '';
  return finalLatex;
}

/* =========================================================================
   3. GIẢI MÃ CÔNG THỨC TOÁN MICROSOFT WORD OMML (m:oMath)
   ========================================================================= */

export function ommlNodeToLatex(node) {
  if (!node) return '';
  const name = node.localName || node.nodeName || '';

  // Nút văn bản toán học m:t
  if (name === 't') {
    let t = node.textContent || '';
    t = t.replace(/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f\ufffd\ufeff]/g, ' ')
         .replace(/[\u200b-\u200f\u202a-\u202e\u2060]/g, '')
         .replace(/[\u25a0-\u25af\u25fd\u25fe]/g, ' ');
    t = t.replace(/±/g, '\\pm ')
         .replace(/×/g, '\\cdot ')
         .replace(/÷/g, '\\div ')
         .replace(/≤/g, '\\le ')
         .replace(/≥/g, '\\ge ')
         .replace(/≠/g, '\\ne ')
         .replace(/≈/g, '\\approx ')
         .replace(/∞/g, '\\infty ')
         .replace(/∈/g, '\\in ')
         .replace(/∉/g, '\\notin ')
         .replace(/⊂/g, '\\subset ')
         .replace(/∪/g, '\\cup ')
         .replace(/∩/g, '\\cap ')
         .replace(/→/g, '\\to ')
         .replace(/⇒/g, '\\Rightarrow ')
         .replace(/⇔/g, '\\Leftrightarrow ')
         .replace(/∀/g, '\\forall ')
         .replace(/∃/g, '\\exists ')
         .replace(/Δ/g, '\\Delta ')
         .replace(/π/g, '\\pi ')
         .replace(/α/g, '\\alpha ')
         .replace(/β/g, '\\beta ')
         .replace(/γ/g, '\\gamma ')
         .replace(/θ/g, '\\theta ')
         .replace(/φ/g, '\\varphi ')
         .replace(/λ/g, '\\lambda ')
         .replace(/ω/g, '\\omega ')
         .replace(/σ/g, '\\sigma ')
         .replace(/μ/g, '\\mu ')
         .replace(/ρ/g, '\\rho ')
         .replace(/°/g, '^\\circ ')
         .replace(/′/g, "'");
    t = t.replace(/(?<!\\)\b(sin|cos|tan|cot|ln|log)\b/gi, (m, f) => `\\${f.toLowerCase()} `);
    return t;
  }

  // Phân số m:f
  if (name === 'f') {
    let num = '';
    let den = '';
    for (const child of node.childNodes) {
      const cName = child.localName || child.nodeName;
      if (cName === 'num') num = ommlNodeToLatex(child);
      else if (cName === 'den') den = ommlNodeToLatex(child);
    }
    const cleanNum = num.trim() || '1';
    const cleanDen = den.trim() || '1';
    return `\\frac{${cleanNum}}{${cleanDen}}`;
  }

  // Căn thức m:rad
  if (name === 'rad') {
    let deg = '';
    let base = '';
    for (const child of node.childNodes) {
      const cName = child.localName || child.nodeName;
      if (cName === 'deg') deg = ommlNodeToLatex(child).trim();
      else if (cName === 'e') base = ommlNodeToLatex(child);
    }
    return deg ? `\\sqrt[${deg}]{${base.trim()}}` : `\\sqrt{${base.trim()}}`;
  }

  // Số mũ m:sSup
  if (name === 'sSup') {
    let base = '';
    let sup = '';
    for (const child of node.childNodes) {
      const cName = child.localName || child.nodeName;
      if (cName === 'e') base = ommlNodeToLatex(child);
      else if (cName === 'sup') sup = ommlNodeToLatex(child);
    }
    // Tránh lỗi KaTeX Double exponent nếu sup bắt đầu bằng ^ (ví dụ ^\circ)
    const cleanSup = sup.trim().replace(/^\^/, '');
    return `{${base.trim()}}^{${cleanSup}}`;
  }

  // Chỉ số dưới m:sSub
  if (name === 'sSub') {
    let base = '';
    let sub = '';
    for (const child of node.childNodes) {
      const cName = child.localName || child.nodeName;
      if (cName === 'e') base = ommlNodeToLatex(child);
      else if (cName === 'sub') sub = ommlNodeToLatex(child);
    }
    const cleanSub = sub.trim().replace(/^_/, '');
    return `{${base.trim()}}_{${cleanSub}}`;
  }

  // Cả chỉ số dưới và trên m:sSubSup
  if (name === 'sSubSup') {
    let base = '';
    let sub = '';
    let sup = '';
    for (const child of node.childNodes) {
      const cName = child.localName || child.nodeName;
      if (cName === 'e') base = ommlNodeToLatex(child);
      else if (cName === 'sub') sub = ommlNodeToLatex(child);
      else if (cName === 'sup') sup = ommlNodeToLatex(child);
    }
    const cleanSub = sub.trim().replace(/^_/, '');
    const cleanSup = sup.trim().replace(/^\^/, '');
    return `{${base.trim()}}_{${cleanSub}}^{${cleanSup}}`;
  }

  // Tích phân / Tổng / Tích n-ary: m:nary
  if (name === 'nary') {
    let sub = '';
    let sup = '';
    let base = '';
    let chr = '\\int';
    for (const child of node.childNodes) {
      const cName = child.localName || child.nodeName;
      if (cName === 'naryPr') {
        const chrEl = child.querySelector ? child.querySelector('chr') : null;
        const val = chrEl ? chrEl.getAttribute('m:val') || chrEl.getAttribute('val') : '';
        if (val === '∑' || val === 'sum') chr = '\\sum';
        else if (val === '∏' || val === 'prod') chr = '\\prod';
      } else if (cName === 'sub') sub = ommlNodeToLatex(child);
      else if (cName === 'sup') sup = ommlNodeToLatex(child);
      else if (cName === 'e') base = ommlNodeToLatex(child);
    }
    let res = chr;
    if (sub.trim()) res += `_{${sub.trim()}}`;
    if (sup.trim()) res += `^{${sup.trim()}}`;
    res += ` {${base.trim()}}`;
    return res;
  }

  // Dấu ngoặc / Khối bao bọc m:d
  if (name === 'd') {
    const elements = [];
    let begChr = '(';
    let endChr = ')';
    for (const child of node.childNodes) {
      const cName = child.localName || child.nodeName;
      if (cName === 'dPr') {
        const b = child.getElementsByTagName ? (child.getElementsByTagName('m:begChr')[0] || child.getElementsByTagName('begChr')[0]) : null;
        const e = child.getElementsByTagName ? (child.getElementsByTagName('m:endChr')[0] || child.getElementsByTagName('endChr')[0]) : null;
        if (b) begChr = b.getAttribute('m:val') || b.getAttribute('val') || '(';
        if (e) endChr = e.getAttribute('m:val') || e.getAttribute('val') || ')';
      } else if (cName === 'e') {
        const item = ommlNodeToLatex(child).trim();
        if (item) elements.push(item);
      }
    }
    const content = elements.join(' \\\\ ');
    if (!content.trim()) return ''; // Không bao giờ trả về ngoặc rỗng \left(\right)
    // Hệ phương trình: ngoặc nhọn mở nhưng không có ngoặc đóng hoặc ngoặc đóng rỗng/none/.
    if (begChr === '{' && (!endChr || endChr === '' || endChr === 'none' || endChr === '.' || endChr === ' ' || endChr === '\u0000' || endChr === '├')) {
      return `\\begin{cases} ${content} \\end{cases}`;
    }
    if (begChr === '[' && endChr === ']') return `\\left[ ${content} \\right]`;
    if (begChr === '{' && endChr === '}') return `\\left\\{ ${content} \\right\\}`;
    if (begChr === '|' && endChr === '|') return `\\left| ${content} \\right|`;
    if (begChr === '[' && endChr === ')') return `\\left[ ${content} \\right)`;
    if (begChr === '(' && endChr === ']') return `\\left( ${content} \\right]`;
    return `\\left( ${content} \\right)`;
  }

  // Vectơ m:acc
  if (name === 'acc') {
    let base = '';
    for (const child of node.childNodes) {
      const cName = child.localName || child.nodeName;
      if (cName === 'e') base = ommlNodeToLatex(child);
    }
    const cleanBase = base.trim();
    return cleanBase.length > 1 ? `\\overrightarrow{${cleanBase}}` : `\\vec{${cleanBase}}`;
  }

  // Gạch đầu m:bar
  if (name === 'bar') {
    let base = '';
    for (const child of node.childNodes) {
      const cName = child.localName || child.nodeName;
      if (cName === 'e') base = ommlNodeToLatex(child);
    }
    return `\\overline{${base.trim()}}`;
  }

  // Hàm m:func (sin, cos, lim...)
  if (name === 'func') {
    let fName = '';
    let arg = '';
    for (const child of node.childNodes) {
      const cName = child.localName || child.nodeName;
      if (cName === 'fName') fName = ommlNodeToLatex(child);
      else if (cName === 'e') arg = ommlNodeToLatex(child);
    }
    let fn = fName.trim();
    if (/^(sin|cos|tan|cot|ln|log|lim|max|min|det|exp|deg|arcsin|arccos|arctan)$/i.test(fn)) {
      fn = '\\' + fn.toLowerCase();
    }
    return `${fn} ${arg.trim()}`;
  }

  // Giới hạn m:limLow
  if (name === 'limLow') {
    let base = '';
    let lim = '';
    for (const child of node.childNodes) {
      const cName = child.localName || child.nodeName;
      if (cName === 'e') base = ommlNodeToLatex(child);
      else if (cName === 'lim') lim = ommlNodeToLatex(child);
    }
    return `\\lim_{${lim.trim()}} {${base.trim()}}`;
  }

  // Ma trận m:m
  if (name === 'm') {
    let out = '\\begin{matrix} ';
    const rows = [];
    for (const child of node.childNodes) {
      if ((child.localName || child.nodeName) === 'mr') {
        const rowCells = [];
        for (const cell of child.childNodes) {
          if ((cell.localName || cell.nodeName) === 'e') {
            rowCells.push(ommlNodeToLatex(cell).trim());
          }
        }
        rows.push(rowCells.join(' & '));
      }
    }
    out += rows.join(' \\\\ ') + ' \\end{matrix}';
    return out;
  }

  // Mảng phương trình m:eqArr (hệ phương trình hoặc các dòng phương trình liên tiếp)
  if (name === 'eqArr') {
    const lines = [];
    for (const child of node.childNodes) {
      if ((child.localName || child.nodeName) === 'e') {
        const item = ommlNodeToLatex(child).trim();
        if (item) lines.push(item);
      }
    }
    return lines.join(' \\\\ ');
  }

  // Đệ quy tất cả các nút con khác
  let out = '';
  for (const child of node.childNodes) {
    out += ommlNodeToLatex(child);
  }
  return out;
}

/* =========================================================================
   4. GIẢI MÃ FIELD CODES EQ CỦA WORD: EQ \f(1, 2) ➔ \frac{1}{2}
   ========================================================================= */

export function parseWordEqField(code) {
  if (!code || !code.trim().toUpperCase().startsWith('EQ')) return '';
  let str = code.trim().replace(/^EQ\s+/i, '');

  // Phân số: \f(num, den)
  str = str.replace(/\\f\s*\(\s*([^,()]+)\s*,\s*([^)]+)\)/gi, '\\frac{$1}{$2}');
  // Căn thức: \r(deg, rad) hoặc \r(, rad)
  str = str.replace(/\\r\s*\(\s*([^,()]*)\s*,\s*([^)]+)\)/gi, (m, deg, rad) => {
    return deg.trim() ? `\\sqrt[${deg.trim()}]{${rad.trim()}}` : `\\sqrt{${rad.trim()}}`;
  });
  // Số mũ & chỉ số: \s\up(n), \s\do(n)
  str = str.replace(/\\s\\up\s*\(\s*([^)]+)\)/gi, '^{$1}');
  str = str.replace(/\\s\\do\s*\(\s*([^)]+)\)/gi, '_{$1}');
  // Tích phân: \i(from, to, integrand)
  str = str.replace(/\\i\s*\(\s*([^,()]*)\s*,\s*([^,()]*)\s*,\s*([^)]+)\)/gi, (m, from, to, body) => {
    let res = '\\int';
    if (from.trim()) res += `_{${from.trim()}}`;
    if (to.trim()) res += `^{${to.trim()}}`;
    res += ` {${body.trim()}}`;
    return res;
  });

  return str;
}

/* =========================================================================
   5. TRÍCH XUẤT TOÀN DIỆN VĂN BẢN VÀ CÔNG THỨC TỪ TỆP WORD (.DOCX)
   ========================================================================= */

export async function extractDocxTextAndMath(arrayBuffer) {
  const zip = await JSZip.loadAsync(arrayBuffer);
  const docXmlFile = zip.file('word/document.xml');
  if (!docXmlFile) {
    throw new Error('Không tìm thấy tệp word/document.xml trong file Word .docx!');
  }

  // 1. Đọc tệp quan hệ relationships để ánh xạ r:id ➔ target path (embeddings/oleObject*.bin hoặc media/*.wmf)
  const relMap = {};
  const relFile = zip.file('word/_rels/document.xml.rels');
  if (relFile) {
    try {
      const relXml = await relFile.async('text');
      const parser = new DOMParser();
      const relDoc = parser.parseFromString(relXml, 'application/xml');
      const relElements = relDoc.getElementsByTagName('Relationship');
      for (let i = 0; i < relElements.length; i++) {
        const id = relElements[i].getAttribute('Id');
        let target = relElements[i].getAttribute('Target') || '';
        target = target.replace(/^(\.\.\/)+/, '').replace(/^\//, '');
        if (!target.toLowerCase().startsWith('word/')) {
          target = 'word/' + target;
        }
        relMap[id] = target;
      }
    } catch (e) {
      console.warn('Lỗi phân tích word/_rels/document.xml.rels:', e);
    }
  }

  function findZipEntry(targetPath) {
    if (!targetPath) return null;
    const clean = targetPath.replace(/^\//, '');
    if (zip.file(clean)) return zip.file(clean);
    const lower = clean.toLowerCase();
    for (const key of Object.keys(zip.files)) {
      if (key.toLowerCase() === lower || key.toLowerCase().endsWith('/' + lower)) {
        return zip.files[key];
      }
    }
    return null;
  }

  const mtefCache = new Map();

  async function resolveTargetToLatex(targetPath) {
    if (!targetPath) return '';
    if (mtefCache.has(targetPath)) return mtefCache.get(targetPath);

    const f = findZipEntry(targetPath);
    if (!f) return '';

    try {
      const bytes = await f.async('uint8array');
      const mtefBytes = extractMTEFFromAnyBuffer(bytes);
      if (mtefBytes) {
        const latex = parseMTEFToLatex(mtefBytes);
        if (latex) {
          mtefCache.set(targetPath, latex);
          return latex;
        }
      }
    } catch (err) {
      console.warn(`Lỗi phân tích đối tượng nhị phân ${targetPath}:`, err);
    }

    return '';
  }

  function getAllDescendants(root) {
    const list = [root];
    function walk(el) {
      if (!el) return;
      const ch = el.children || el.childNodes || [];
      for (let i = 0; i < ch.length; i++) {
        const c = ch[i];
        if (c.nodeType === 1) {
          list.push(c);
          walk(c);
        }
      }
    }
    walk(root);
    return list;
  }

  function getElementRelId(el) {
    if (!el) return null;
    let rid = el.getAttribute('r:id') || el.getAttribute('id') || el.getAttribute('r:embed');
    if (rid) return rid;
    if (el.getAttributeNS) {
      rid = el.getAttributeNS('http://schemas.openxmlformats.org/officeDocument/2006/relationships', 'id') ||
            el.getAttributeNS('http://schemas.openxmlformats.org/officeDocument/2006/relationships', 'embed');
      if (rid) return rid;
    }
    if (el.attributes) {
      for (let i = 0; i < el.attributes.length; i++) {
        const attr = el.attributes[i];
        const name = (attr.name || '').toLowerCase();
        const local = (attr.localName || '').toLowerCase();
        if (local === 'id' || name === 'r:id' || name.endsWith(':id') || local === 'embed' || name.endsWith(':embed')) {
          return attr.value;
        }
      }
    }
    return null;
  }

  // Duyệt cây XML của một node bất kỳ
  async function traverseNode(node, isInheritedUnderline = false) {
    if (!node) return '';
    const localName = (node.localName || node.nodeName || '').replace(/^w:/, '');

    // 1. Văn bản thường w:t
    if (localName === 't') {
      const text = node.textContent || '';
      return isInheritedUnderline ? `<u>${text}</u>` : text;
    }

    // 2. Chuyển đổi công thức OMML (m:oMath hoặc m:oMathPara)
    if (localName === 'oMath' || localName === 'oMathPara') {
      const latex = ommlNodeToLatex(node).trim();
      if (latex) {
        return isInheritedUnderline ? ` <u>$${latex}$</u> ` : ` $${latex}$ `;
      }
      return '';
    }

    // 3. Đối tượng MathType (w:object, o:OLEObject, w:pict, w:drawing)
    if (localName === 'object' || localName === 'pict' || localName === 'drawing' || localName === 'OLEObject') {
      let latex = '';
      const candidateElements = getAllDescendants(node);
      const binTargets = [];
      const imageTargets = [];

      for (const el of candidateElements) {
        const elLocal = (el.localName || el.nodeName || '').replace(/^m:/, '');
        if (elLocal === 'oMath' || elLocal === 'oMathPara') {
          const mathLatex = ommlNodeToLatex(el).trim();
          if (mathLatex) {
            latex = mathLatex;
            break;
          }
        }

        const rid = getElementRelId(el);
        if (rid && relMap[rid]) {
          const targetPath = relMap[rid];
          if (targetPath.toLowerCase().endsWith('.bin')) {
            binTargets.push(targetPath);
          } else if (targetPath.toLowerCase().endsWith('.wmf') || targetPath.toLowerCase().endsWith('.emf')) {
            imageTargets.push(targetPath);
          }
        }
      }

      if (!latex) {
        for (const bp of binTargets) {
          latex = await resolveTargetToLatex(bp);
          if (latex) break;
        }
      }

      if (!latex) {
        for (const ip of imageTargets) {
          latex = await resolveTargetToLatex(ip);
          if (latex) break;
        }
      }

      if (!latex) {
        for (const el of candidateElements) {
          const altText = el.getAttribute('alt') || el.getAttribute('o:title') || el.getAttribute('descr') || el.getAttribute('title');
          if (
            altText &&
            !/automatically\s*generated|description|hình\s*ảnh|picture|diagram|image/i.test(altText) &&
            !altText.toLowerCase().endsWith('.png') &&
            !altText.toLowerCase().endsWith('.jpg') &&
            !altText.toLowerCase().endsWith('.jpeg') &&
            /(\\[a-zA-Z]+|\^|_|=|<|>|\+|-|\/|\{|\})/.test(altText) &&
            altText.length < 300
          ) {
            latex = altText.trim();
            break;
          }
        }
      }

      if (latex) {
        return isInheritedUnderline ? ` <u>$${latex}$</u> ` : ` $${latex}$ `;
      }
    }

    // 4. Trường Word Field (w:fldSimple hoặc w:instrText)
    if (localName === 'fldSimple') {
      const instr = node.getAttribute('w:instr') || '';
      const eqLatex = parseWordEqField(instr);
      if (eqLatex) {
        return isInheritedUnderline ? ` <u>$${eqLatex}$</u> ` : ` $${eqLatex}$ `;
      }
    }
    if (localName === 'instrText') {
      const instr = node.textContent || '';
      const eqLatex = parseWordEqField(instr);
      if (eqLatex) {
        return isInheritedUnderline ? ` <u>$${eqLatex}$</u> ` : ` $${eqLatex}$ `;
      }
      return '';
    }

    // 5. Thẻ tab hoặc xuống dòng
    if (localName === 'tab') return '    ';
    if (localName === 'br') return '\n';

    // 6. Nút w:r (chạy văn bản): kiểm tra định dạng gạch chân, in đậm, màu đỏ, highlight, số mũ, chỉ số dưới
    let isUnderline = isInheritedUnderline;
    let isBold = false;
    let isRed = false;
    let isHighlight = false;
    let isSubscript = false;
    let isSuperscript = false;

    if (localName === 'r') {
      const rPr = node.getElementsByTagName('w:rPr')[0] || node.getElementsByTagName('rPr')[0];
      if (rPr) {
        const uTag = rPr.getElementsByTagName('w:u')[0] || rPr.getElementsByTagName('u')[0];
        if (uTag) {
          const val = uTag.getAttribute('w:val') || uTag.getAttribute('val');
          if (val !== 'none') isUnderline = true;
        }
        const bTag = rPr.getElementsByTagName('w:b')[0] || rPr.getElementsByTagName('b')[0];
        if (bTag) {
          const val = bTag.getAttribute('w:val') || bTag.getAttribute('val');
          if (val !== '0' && val !== 'false' && val !== 'none') isBold = true;
        }
        const colorTag = rPr.getElementsByTagName('w:color')[0] || rPr.getElementsByTagName('color')[0];
        if (colorTag) {
          const cVal = (colorTag.getAttribute('w:val') || colorTag.getAttribute('val') || '').toLowerCase();
          if (cVal.startsWith('ff00') || cVal.startsWith('ed1c') || cVal === 'red') isRed = true;
        }
        const hlTag = rPr.getElementsByTagName('w:highlight')[0] || rPr.getElementsByTagName('highlight')[0];
        if (hlTag) {
          const hVal = (hlTag.getAttribute('w:val') || hlTag.getAttribute('val') || '').toLowerCase();
          if (hVal && hVal !== 'none') isHighlight = true;
        }
        const vAlign = rPr.getElementsByTagName('w:vertAlign')[0] || rPr.getElementsByTagName('vertAlign')[0];
        if (vAlign) {
          const vVal = vAlign.getAttribute('w:val') || vAlign.getAttribute('val');
          if (vVal === 'subscript') isSubscript = true;
          else if (vVal === 'superscript') isSuperscript = true;
        }
      }
    }

    let result = '';
    for (let i = 0; i < node.childNodes.length; i++) {
      const childRes = await traverseNode(node.childNodes[i], isUnderline);
      result += childRes;
    }

    if (isSubscript && result) result = `_{${result}}`;
    if (isSuperscript && result) result = `^{${result}}`;
    if (isHighlight && result) result = `<mark>${result}</mark>`;
    if (isRed && result) result = `<span data-red="1">${result}</span>`;
    if (isBold && result) result = `<b data-bold="1">${result}</b>`;

    return result;
  }

  // Hàm chuyển đổi một đoạn văn w:p thành chuỗi ký tự
  async function parseParagraphElement(pEl) {
    let pLine = '';
    for (let cIdx = 0; cIdx < pEl.childNodes.length; cIdx++) {
      pLine += await traverseNode(pEl.childNodes[cIdx], false);
    }
    return pLine.trim();
  }

  const xmlText = await docXmlFile.async('text');
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlText, 'application/xml');

  const bodyEl = xmlDoc.getElementsByTagName('w:body')[0];
  const resultLines = [];

  if (bodyEl) {
    for (let i = 0; i < bodyEl.childNodes.length; i++) {
      const child = bodyEl.childNodes[i];
      const local = (child.localName || child.nodeName || '').replace(/^w:/, '');

      if (local === 'p') {
        const line = await parseParagraphElement(child);
        if (line) resultLines.push(line);
      } else if (local === 'tbl') {
        // Xử lý bảng trong Word
        const rows = child.getElementsByTagName('w:tr');
        const tableMatrix = [];

        for (let rIdx = 0; rIdx < rows.length; rIdx++) {
          const rowEl = rows[rIdx];
          const cells = rowEl.getElementsByTagName('w:tc');
          const rowTexts = [];

          for (let cIdx = 0; cIdx < cells.length; cIdx++) {
            const cellEl = cells[cIdx];
            const cellParas = cellEl.getElementsByTagName('w:p');
            const cellLines = [];
            for (let cpIdx = 0; cpIdx < cellParas.length; cpIdx++) {
              const cl = await parseParagraphElement(cellParas[cpIdx]);
              if (cl) cellLines.push(cl);
            }
            rowTexts.push(cellLines.join(' '));
          }
          if (rowTexts.length > 0) {
            tableMatrix.push(rowTexts);
          }
        }

        // Nếu bảng 2 dòng có dạng bảng đáp án:
        // Hàng 1: 1, 2, 3, 4, ...
        // Hàng 2: A, B, C, D, ...
        if (tableMatrix.length === 2 && tableMatrix[0].length >= 3 && tableMatrix[1].length >= 3) {
          const isRow1Numbers = tableMatrix[0].every(c => /^\d+$/.test(c.trim()));
          const isRow2Options = tableMatrix[1].every(c => /^[A-Da-d]$/.test(c.trim()));
          if (isRow1Numbers && isRow2Options) {
            const answerPairs = [];
            for (let k = 0; k < Math.min(tableMatrix[0].length, tableMatrix[1].length); k++) {
              answerPairs.push(`${tableMatrix[0][k].trim()}.${tableMatrix[1][k].trim().toUpperCase()}`);
            }
            resultLines.push('BẢNG ĐÁP ÁN: ' + answerPairs.join(' '));
            continue;
          }
        }

        // Nếu bảng thông thường, nối các ô thành dòng câu hỏi hoặc phương án
        for (const row of tableMatrix) {
          const rowClean = row.map(c => c.trim()).filter(Boolean);
          if (rowClean.length > 0) {
            // Nếu các ô là các phương án A, B, C, D thì giữ trên cùng 1 dòng
            resultLines.push(rowClean.join('    '));
          }
        }
      }
    }
  } else {
    // Fallback nếu không có thẻ w:body
    const paragraphs = xmlDoc.getElementsByTagName('w:p');
    for (let pIdx = 0; pIdx < paragraphs.length; pIdx++) {
      const line = await parseParagraphElement(paragraphs[pIdx]);
      if (line) resultLines.push(line);
    }
  }

  return resultLines.join('\n');
}

/* =========================================================================
   6. CHUẨN HÓA CÔNG THỨC TOÁN HỌC TRONG ĐỀ THI SANG CHUẨN KATEX LATEX
   ========================================================================= */

export function sanitizeLatexMath(latex) {
  if (!latex) return '';
  let s = String(latex);
  // Khử triệt để ký tự điều khiển ẩn (\x00 - \x1f), zero-width và ký tự hộp vuông (□)
  s = s.replace(/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f\ufffd\ufeff]/g, ' ')
       .replace(/[\u200b-\u200f\u202a-\u202e\u2060]/g, '')
       .replace(/[\u25a0-\u25ff\u2b1b-\u2b1f\u2580-\u259f\u2500-\u257f]/g, ' ')
       .replace(/□|■|◻|◼|◽|◾|⬚/g, ' ');
  // Khử triệt để \Box, \square, \blacksquare tránh lỗi Undefined control sequence
  s = s.replace(/\\(?:Box|square|blacksquare)\b/g, ' ');
  // Chuẩn hóa escape kép \\alpha -> \alpha
  s = s.replace(/\\\\+([a-zA-Z{}()\[\]|])/g, (_, w) => `\\${w}`);
  // Khử ngoặc rỗng \left( \right)
  s = s.replace(/\\left\s*\\?\(\s*\\right\s*\\?\)/g, '');
  s = s.replace(/\\left\s*\\?\[\s*\\right\s*\\?\]/g, '');
  s = s.replace(/\\left\s*\\?\{\s*\\right\s*\\?\}/g, '');
  // Khử quotes và dấu ngoặc kép trong toán
  s = s.replace(/["“”'‘’]/g, '');
  // Chuẩn hóa dấu phẩy và khoảng cách
  s = s.replace(/(?:\\+,)+/g, ', ');
  s = s.replace(/,\s*,+/g, ', ');
  s = s.replace(/,\s*\\quad/g, ', ');
  s = s.replace(/,\s*([A-Za-z0-9])/g, ', $1');
  // Ký hiệu độ
  s = s.replace(/(-?\d+)\s*(?:\{\}\s*)?\^\{\s*\\circ\s*\}/g, '$1^\\circ');
  s = s.replace(/(-?\d+)\s*\{\}\s*\^\\circ/g, '$1^\\circ');
  s = s.replace(/\{\}\s*\^\\circ/g, '^\\circ');
  s = s.replace(/(-?\d+)\s*(?:°|độ)/g, '$1^\\circ');
  // Fix double exponent
  s = s.replace(/\{([0-9a-zA-Z]+)\}\^\{\^\\circ\}/g, '{$1}^\\circ');
  s = s.replace(/\^\{\^\\circ\}/g, '^\\circ');
  // Cân bằng \left và \right tự động tránh lỗi KaTeX delimiter mismatch
  const lefts = (s.match(/\\left\b/g) || []).length;
  const rights = (s.match(/\\right\b/g) || []).length;
  if (lefts > rights) {
    s += ' \\right.'.repeat(lefts - rights);
  } else if (rights > lefts) {
    s = '\\left.'.repeat(rights - lefts) + s;
  }
  return s.trim();
}

export function convertWordMathToLatex(text) {
  if (!text) return '';
  let str = String(text);

  // 0. Khử triệt để ký tự điều khiển ẩn (\x00 - \x1f), zero-width và ký tự hộp vuông (□)
  str = str.replace(/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f\ufffd\ufeff]/g, ' ')
           .replace(/[\u200b-\u200f\u202a-\u202e\u2060]/g, '')
           .replace(/[\u25a0-\u25ff\u2b1b-\u2b1f\u2580-\u259f\u2500-\u257f]/g, ' ')
           .replace(/□|■|◻|◼|◽|◾|⬚/g, ' ');

  // 1. Chuẩn hóa escape backslash kép thành đơn: \\alpha -> \alpha, \\left -> \left
  str = str.replace(/\\\\+([a-zA-Z{}()\[\]|])/g, (m, w) => `\\${w}`);

  // 2. Chuẩn hóa ký hiệu độ OMML: 0{}^\circ, 180{}^\circ, {}^\circ -> 0^\circ, 180^\circ
  str = str.replace(/(-?\d+)\s*(?:\{\}\s*)?\^\{\s*\\circ\s*\}/g, '$1^\\circ');
  str = str.replace(/(-?\d+)\s*\{\}\s*\^\\circ/g, '$1^\\circ');
  str = str.replace(/\{\}\s*\^\\circ/g, '^\\circ');
  str = str.replace(/(-?\d+)\s*(?:°|độ)/g, '$1^\\circ');
  str = str.replace(/\{([0-9a-zA-Z]+)\}\^\{\^\\circ\}/g, '{$1}^\\circ');
  str = str.replace(/\^\{\^\\circ\}/g, '^\\circ');

  // 3. Chuẩn hóa hiệu hai tập hợp: A\B -> A \setminus B
  str = str.replace(/\b([A-Z])\s*\\\s*([A-Z])\b/g, '$1 \\setminus $2');

  // 4. Khử triệt để hộp vuông \Box và \square
  str = str.replace(/\\(?:Box|square|blacksquare)\b/g, ' ');

  // 5. Chuẩn hóa hàm lượng giác dính liền: 2sinalpha -> 2\sin\alpha, 3cosalpha -> 3\cos\alpha
  str = str.replace(/([0-9]*)\s*\\?(sin|cos|tan|cot)(?:\^([0-9]+))?\s*\\?(alpha|beta|gamma|theta|varphi|phi|omega)\b/gi, (m, coef, fn, p, arg) => {
    const pow = p ? `^${p}` : '';
    return `${coef}\\${fn.toLowerCase()}${pow}\\${arg.toLowerCase()}`;
  });

  // 6. Chuẩn hóa hàm lượng giác thiếu backslash: cot alpha -> \cot\alpha, sin 2x -> \sin 2x
  str = str.replace(/(?<![\\a-zA-Z])(cot|tan|sin|cos)(?:\^([0-9]+))?\s*\\?(alpha|beta|gamma|theta|varphi|phi)\b/gi, (m, fn, p, arg) => {
    const pow = p ? `^${p}` : '';
    return `\\${fn.toLowerCase()}${pow}\\${arg.toLowerCase()}`;
  });
  str = str.replace(/(?<![\\a-zA-Z])(cot|tan|sin|cos)(?:\^([0-9]+))?\s+([a-zA-Z0-9]+)\b/gi, (m, fn, p, arg) => {
    const pow = p ? `^${p}` : '';
    return `\\${fn.toLowerCase()}${pow} ${arg}`;
  });

  // 7. Chuẩn hóa phân số dạng = -1/3 -> = -\frac{1}{3}
  str = str.replace(/=\s*(-?)([0-9]+)\s*\/\s*([0-9]+)\b/g, '= $1\\frac{$2}{$3}');

  // 8. Chuẩn hóa các chữ cái Hy Lạp trong ngữ cảnh toán nếu chưa có backslash:
  str = str.replace(/(?<![\\a-zA-Z])(alpha|beta|gamma|theta|varphi|phi|omega|lambda)(?![a-zA-Z])/gi, (m, w) => `\\${w.toLowerCase()}`);

  // 9. Chuyển đổi các chuỗi chân là số: x1 -> x_1, x_2, y1, u1, un, a1
  str = str.replace(/\b([xyzuabck])([0-9]+)\b/g, '$1_{$2}');
  str = str.replace(/\bu_?n\b/g, 'u_n');
  str = str.replace(/\bu_?\{n\+1\}\b/g, 'u_{n+1}');
  str = str.replace(/\bu\(n\+1\)\b/g, 'u_{n+1}');

  // Chuỗi chân logarit cơ số là số: log2(x), log3, log5
  str = str.replace(/\blog_?([0-9]+)\s*\(/g, '\\log_{$1}(');
  str = str.replace(/\blog_?([0-9]+)\s+([a-zA-Z])/g, '\\log_{$1} $2');
  str = str.replace(/\bln\s*\(/g, '\\ln(');

  // 10. Căn thức: sqrt(A), căn(A)
  str = str.replace(/(?:sqrt|căn)\s*\(([^()]+)\)/gi, '\\sqrt{$1}');
  str = str.replace(/(?:sqrt|căn)\s+([0-9a-zA-Z]+)/gi, '\\sqrt{$1}');

  // 11. Vectơ: vecto AB, vecto u, \vec{AB}
  str = str.replace(/(?:vecto|vectơ|vector)\s+([A-Z]{2})\b/gi, '\\overrightarrow{$1}');
  str = str.replace(/(?:vecto|vectơ|vector)\s+([a-z])\b/gi, '\\vec{$1}');

  // 12. Ký hiệu toán học thông dụng
  str = str.replace(/<=>|⟺|⇔/g, '\\Leftrightarrow ');
  str = str.replace(/=>|⟹|⇒/g, '\\Rightarrow ');
  str = str.replace(/<=|≤/g, '\\le ');
  str = str.replace(/>=|≥/g, '\\ge ');
  str = str.replace(/!=|≠/g, '\\neq ');
  str = str.replace(/\+\-/g, '\\pm ');
  str = str.replace(/\bDelta\b|Δ/g, '\\Delta');
  str = str.replace(/(?<![\\a-zA-Z])pi(?![a-zA-Z])|π/gi, '\\pi');
  str = str.replace(/\b(oo|vô cùng|vô cực)\b/gi, '\\infty');
  str = str.replace(/\bthuộc\b/g, '\\in ');
  str = str.replace(/\bkhông thuộc\b/g, '\\notin ');

  // Khử triệt để ngoặc rỗng \left(\right)
  str = str.replace(/\\left\s*\\?\(\s*\\right\s*\\?\)/g, '');
  str = str.replace(/\\left\s*\\?\[\s*\\right\s*\\?\]/g, '');
  str = str.replace(/\\left\s*\\?\{\s*\\right\s*\\?\}/g, '');

  // Khử quotes bao quanh hoặc bên trong math: $"..." -> "$..."
  str = str.replace(/\$\s*["“”']\s*([^$]+?)\s*["“”']\s*\$/g, '"$$$1$$"');

  // Khử dấu phẩy treo và khoảng cách thừa
  str = str.replace(/(?:\\+,)+/g, ', ');
  str = str.replace(/,\s*,+/g, ', ');
  str = str.replace(/,\s*\\quad/g, ', ');

  // 13. TỰ ĐỘNG BỌC $ THÔNG MINH BẢO VỆ TOKEN TRÁNH LỖI LỒNG DẤU $
  const hasVietnamese = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i.test(str);

  // Nếu là phương án toán ngắn hoặc biểu thức toán thuần túy không có tiếng Việt
  const isPureMath = !hasVietnamese && (
    /[\\^_{}=<>]/.test(str) ||
    /^[A-D]\([0-9; -]+\)$/.test(str) ||
    /^[-+]?[0-9]*\s*\\?(?:pi|alpha|beta|gamma|theta|varphi|sqrt|frac|sin|cos|tan|cot)/i.test(str) ||
    /\\text\{[^}]+\}/.test(str)
  );

  if (isPureMath) {
    const clean = sanitizeLatexMath(str.replace(/\$/g, ''));
    return clean ? `$${clean}$` : '';
  }

  // Bảo vệ các khối $...$ và $$...$$ đã có sẵn và sanitize nội dung bên trong
  const placeholders = [];
  str = str.replace(/(\$\$[\s\S]*?\$\$|\$[^$]+?\$)/g, (match) => {
    const isDouble = match.startsWith('$$');
    const rawContent = isDouble ? match.slice(2, -2).replace(/\$/g, '') : match.slice(1, -1).replace(/\$/g, '');
    const cleanContent = sanitizeLatexMath(rawContent);
    const cleanBlock = isDouble ? `$$${cleanContent}$$` : `$${cleanContent}$`;
    const token = `___MATH_TOKEN_${placeholders.length}___`;
    placeholders.push(cleanBlock);
    return token;
  });

  // Bọc các biểu thức toán trần chưa có $
  // 1. Phân số, căn thức
  str = str.replace(/(-?\\frac\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\})/g, (_, m) => `$${sanitizeLatexMath(m)}$`);
  str = str.replace(/(-?\\sqrt(?:\[[^\]]+\])?\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\})/g, (_, m) => `$${sanitizeLatexMath(m)}$`);

  // 2. Biểu thức logic toán học: \forall x\in ..., \exists n\in ..., A \setminus B, \left\{ 2; 4; 6 \right\}
  str = str.replace(/((?:\\forall|\\exists)\s+[a-zA-Z0-9_\^\\{}\s,=<>]+\b)/g, (_, m) => `$${sanitizeLatexMath(m)}$`);
  str = str.replace(/(\\left\\\{[^{}]*\\right\\\})/g, (_, m) => `$${sanitizeLatexMath(m)}$`);
  str = str.replace(/([A-Z]\s*\\setminus\s*[A-Z])/g, (_, m) => `$${sanitizeLatexMath(m)}$`);

  // 3. Hàm lượng giác độc lập
  str = str.replace(/(?<![\\a-zA-Z])(cot|tan|sin|cos)(?:\^([0-9]+))?\s*\\?(alpha|beta|gamma|theta|varphi|phi)\b/gi, (_, fn, p, arg) => {
    const pow = p ? `^${p}` : '';
    return `$\\${fn.toLowerCase()}${pow}\\${arg.toLowerCase()}$`;
  });

  // 4. Bọc phương trình / đẳng thức có dấu = hoặc so sánh
  str = str.replace(/([a-zA-Z0-9\\_\^()]+\s*(?:=|\\ne|\\le|\\ge|<|>)\s*-?[a-zA-Z0-9\\_\^/{}\(\)]+(?:\s*[+\-*/]\s*[a-zA-Z0-9\\_\^/{}\(\)]+)*)/g, (m) => {
    if (/[\\^_{}=<>]/.test(m)) return `$${sanitizeLatexMath(m)}$`;
    return m;
  });

  // 5. Khôi phục các token đã bảo vệ
  str = str.replace(/___MATH_TOKEN_(\d+)___/g, (_, id) => placeholders[parseInt(id, 10)] || '');
  str = str.replace(/\$\s*\$/g, ' ');

  return str.trim();
}

/* =========================================================================
   7. TRÍCH XUẤT BẢNG ĐÁP ÁN (ANSWER KEY EXTRACTOR) TỪ CUỐI FILE HOẶC NỘI DUNG
   ========================================================================= */

export function extractAnswerKeyMap(text) {
  const ansMapA = new Map();
  const ansMapB = new Map();
  const ansMapC = new Map();

  if (!text) return { A: ansMapA, B: ansMapB, C: ansMapC };

  // 1. Quét dạng bảng đáp án trắc nghiệm: "1.A 2.B 3.C 4.D" hoặc "1-A, 2-B" hoặc "1A 2B 3C"
  const tableMatches = text.matchAll(/(?:câu\s*)?([0-9]+)\s*[:.\-\s]\s*([A-D])\b/gi);
  for (const m of tableMatches) {
    const qNum = parseInt(m[1], 10);
    const optLetter = m[2].toUpperCase();
    if (qNum > 0 && qNum <= 100) {
      ansMapA.set(qNum, optLetter);
    }
  }

  // 1b. Quét bảng đáp án 2 dòng phân cách khoảng trắng (Ví dụ: Dòng 1: "1 2 3 4 5...", Dòng 2: "C D A B C..." hoặc "Chọn C D A B...")
  const docLines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  for (let i = 0; i < docLines.length - 1; i++) {
    const l1 = docLines[i].replace(/^(?:câu|bài|stt|số)\s*/i, '');
    const l2 = docLines[i + 1].replace(/^(?:đáp\s*án|chọn|kq)\s*[:.]?\s*/i, '');
    const nums = l1.split(/[\s,\t]+/).map(n => parseInt(n, 10)).filter(n => !isNaN(n));
    const letters = l2.split(/[\s,\t]+/).map(s => s.trim().toUpperCase()).filter(s => /^[A-D]$/.test(s));
    if (nums.length >= 3 && letters.length >= 3 && nums.length === letters.length) {
      for (let k = 0; k < nums.length; k++) {
        ansMapA.set(nums[k], letters[k]);
      }
    }
  }

  // 2. Quét dạng cụm dính: 1A 2B 3C 4D 5A
  const compactMatches = text.matchAll(/\b([0-9]+)([A-D])\b/g);
  for (const m of compactMatches) {
    const qNum = parseInt(m[1], 10);
    const optLetter = m[2].toUpperCase();
    if (qNum > 0 && qNum <= 100 && !ansMapA.has(qNum)) {
      ansMapA.set(qNum, optLetter);
    }
  }

  // 3. Quét dạng lời giải: "Chọn A", "Chọn đáp án A", "Đáp án là A"
  const solMatches = text.matchAll(/(?:câu|bài)\s*([0-9]+)[\s\S]*?(?:chọn\s*(?:đáp\s*án\s*)?|đáp\s*án\s*(?:đúng\s*)?(?:là\s*)?)([A-D])\b/gi);
  for (const m of solMatches) {
    const qNum = parseInt(m[1], 10);
    const optLetter = m[2].toUpperCase();
    if (qNum > 0 && qNum <= 100) {
      ansMapA.set(qNum, optLetter);
    }
  }

  // 4. Quét đáp án Phần II Đúng/Sai: "Câu 1: a-Đ, b-S, c-Đ, d-S"
  const tfMatches = text.matchAll(/(?:câu|bài)\s*([0-9]+)\s*[:.]\s*a[\s\S]*?(?:đúng|sai|đ|s)[\s\S]*?b[\s\S]*?(?:đúng|sai|đ|s)/gi);
  for (const m of tfMatches) {
    const qNum = parseInt(m[1], 10);
    const block = m[0];
    const itemMap = [];
    const itemMatches = block.matchAll(/([a-d])\s*[:.)\-\s]\s*(đúng|sai|đ|s)\b/gi);
    for (const im of itemMatches) {
      const sub = im[1].toLowerCase();
      const val = /đúng|đ/i.test(im[2]);
      itemMap.push({ sub, val });
    }
    if (itemMap.length > 0) {
      ansMapB.set(qNum, itemMap);
    }
  }

  // 5. Quét đáp án Phần III Trả lời ngắn: "Câu 1: 12", "1) 12"
  const shortMatches = text.matchAll(/(?:phần\s*(?:iii|3)|trả\s*lời\s*ngắn)[\s\S]*?(?:câu\s*)?([0-9]+)\s*[:.)\-\s]\s*(-?[0-9]+(?:[,.][0-9]+)?)/gi);
  for (const m of shortMatches) {
    const qNum = parseInt(m[1], 10);
    const val = m[2].replace(',', '.');
    if (qNum > 0 && qNum <= 100) {
      ansMapC.set(qNum, val);
    }
  }

  return { A: ansMapA, B: ansMapB, C: ansMapC };
}

/* =========================================================================
   8. TÁCH DÒNG PHƯƠNG ÁN TRÊN CÙNG MỘT DÒNG THÀNH CÁC DÒNG ĐỘC LẬP
   ========================================================================= */

function expandOptionLines(rawLines) {
  const expanded = [];
  // Hỗ trợ phương án có thẻ <u> (kể cả <u >, <u class="...">), *, [, (, dấu hai chấm, gạch ngang
  const optRegex = /(?:<u\b[^>]*>)?\s*(?:(?:\*|\(|\[)([A-D])(?:\*|\)|\])|([A-D])\s*[:.)\-\/])\s*(?:<\/u>)?\s*/gi;

  for (const line of rawLines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    // Bỏ qua dòng chỉ toàn dấu phẩy, chấm, gạch ngang thừa
    if (/^[,.\s\-–—]+$/.test(trimmed)) continue;

    // Tìm tất cả vị trí xuất hiện của phương án A, B, C, D
    const matches = [...trimmed.matchAll(optRegex)];

    if (matches.length >= 1) {
      const firstMatch = matches[0];
      // Nếu trước match đầu tiên có nội dung câu hỏi hoặc phương án trước
      if (firstMatch.index > 0) {
        const prefix = trimmed.slice(0, firstMatch.index).trim();
        if (prefix && !/^[,.\s\-–—]+$/.test(prefix)) {
          expanded.push(prefix);
        }
      }

      for (let i = 0; i < matches.length; i++) {
        const match = matches[i];
        const matchStart = match.index;
        const nextStart = (i + 1 < matches.length) ? matches[i + 1].index : trimmed.length;
        const optChunk = trimmed.slice(matchStart, nextStart).trim();
        if (optChunk && !/^[,.\s\-–—]+$/.test(optChunk)) {
          expanded.push(optChunk);
        }
      }
    } else {
      expanded.push(trimmed);
    }
  }

  return expanded;
}

/* =========================================================================
   9. PHÂN TÍCH ĐỀ THI TỪ CHUỖI VĂN BẢN WORD SANG CẤU TRÚC ĐỀ CHUẨN 2025
   ========================================================================= */

export function parseExamFromWordText(rawText, title = '', grade = '12') {
  if (!rawText) return null;

  // 1. Quét tìm trước Bảng đáp án nếu có
  const ansKeys = extractAnswerKeyMap(rawText);

  // 2. Tách các dòng phương án nằm cùng dòng TRƯỚC khi convert toán để tránh Option A nuốt Option B
  const initialRawLines = rawText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const preExpandedLines = expandOptionLines(initialRawLines);

  // 3. Chuẩn hóa công thức toán toàn bài cho từng dòng đã tách riêng
  const convertedLines = preExpandedLines.map(l => convertWordMathToLatex(l));
  const lines = expandOptionLines(convertedLines);

  const partA = [];
  const partB = [];
  const partC = [];

  let curSection = 'A';
  let curQ = null;
  let qNumber = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Phát hiện phân tách phần thi chuẩn 2025
    if (/(?:phần\s*(?:i\b|1\b|một)|trắc\s*nghiệm\s*nhiều\s*phương\s*án)/i.test(line) && !/phần\s*(?:ii|2|hai|iii|3|ba)/i.test(line)) {
      if (curQ) {
        pushCurrentQuestion(curQ, partA, partB, partC, ansKeys);
        curQ = null;
      }
      curSection = 'A';
      continue;
    }
    if (/(?:phần\s*(?:ii\b|2\b|hai)|đúng\s*[\/-]?\s*sai)/i.test(line) && !/phần\s*(?:iii|3|ba)/i.test(line)) {
      if (curQ) {
        pushCurrentQuestion(curQ, partA, partB, partC, ansKeys);
        curQ = null;
      }
      curSection = 'B';
      continue;
    }
    if (/(?:phần\s*(?:iii\b|3\b|ba)|trả\s*lời\s*ngắn|điền\s*khuyết|tự\s*luận)/i.test(line)) {
      if (curQ) {
        pushCurrentQuestion(curQ, partA, partB, partC, ansKeys);
        curQ = null;
      }
      curSection = 'C';
      continue;
    }

    // Bỏ qua dòng tiêu đề bảng đáp án cuối bài để không bị biến thành câu hỏi
    if (/^(?:bảng\s*đáp\s*án|đáp\s*án\s*(?:và\s*lời\s*giải)?)\s*[:.]?/i.test(line)) {
      if (curQ) {
        pushCurrentQuestion(curQ, partA, partB, partC, ansKeys);
        curQ = null;
      }
      continue;
    }

    // Bỏ qua dòng chỉ toàn số cách nhau (ví dụ: "1 2 3 4 5 6 7 8 9 10 11 12")
    if (/^\d+(\s+\d+){2,}$/.test(line)) {
      if (curQ) {
        pushCurrentQuestion(curQ, partA, partB, partC, ansKeys);
        curQ = null;
      }
      continue;
    }

    // Bỏ qua dòng chuỗi đáp án (ví dụ: "C D A B C C A C D A D A" hoặc "Chọn C D A B ...")
    if (/^(?:chọn\s+)?([A-D](\s+[A-D]){2,})$/i.test(line)) {
      if (curQ) {
        pushCurrentQuestion(curQ, partA, partB, partC, ansKeys);
        curQ = null;
      }
      continue;
    }

    // Phát hiện bắt đầu câu hỏi mới:
    // Hỗ trợ: "Câu 1:", "Câu 1.", "Câu 1 -", "Câu 1)", "Câu 1", "Bài 1:", "Câu 1 (NB):", "<b>Câu 1:</b>"
    const qMatch = line.match(/^(?:<[^>]+>)*\s*(?:câu|bài)\s*([0-9]+)\s*(?:\([^)]*\)|\[[^\]]*\])?\s*[:.)\-\/]?\s*(.*)/i);
    
    // Hỗ trợ số thứ tự đầu dòng: "1. Cho hàm số...", "1) Cho tam giác..." khi không có chữ "Câu"
    const numListMatch = !qMatch && line.match(/^([0-9]{1,2})\s*[:.)\-]\s+(?!\$?[A-D]\b)(.*)/);

    if (qMatch || numListMatch) {
      if (curQ) {
        pushCurrentQuestion(curQ, partA, partB, partC, ansKeys);
      }

      const parsedNum = qMatch ? parseInt(qMatch[1], 10) : parseInt(numListMatch[1], 10);
      const stemContent = qMatch ? qMatch[2] : numListMatch[2];
      qNumber = parsedNum || (qNumber + 1);

      curQ = {
        id: `word-q-${Date.now()}-${qNumber}`,
        qNum: qNumber,
        section: curSection,
        stem: stemContent ? stemContent.trim() : '',
        opts: [],
        items: [],
        ci: -1,
        ans: '',
        sol: ''
      };
      continue;
    }

    // Nếu chưa gặp bất kỳ câu hỏi nào (dòng tiêu đề trường, sở, hướng dẫn làm bài), bỏ qua không tạo câu hỏi rác
    if (!curQ) {
      continue;
    }

    // Phát hiện câu trả lời / hướng dẫn giải: "Chọn A", "Chọn đáp án A", "Đáp án đúng là A", "HD: Chọn A"
    const chonMatch = line.match(/^(?:(?:hướng\s*dẫn\s*(?:giải)?|lời\s*giải|hd)\s*[:.]\s*)?(?:chọn|lựa\s*chọn|đáp\s*án\s*(?:đúng)?\s*là)\s*(?:đáp\s*án\s*)?([A-D])\b/i);
    if (chonMatch && curQ) {
      const chosenLetter = chonMatch[1].toUpperCase();
      const cIdx = { 'A': 0, 'B': 1, 'C': 2, 'D': 3 }[chosenLetter];
      if (cIdx !== undefined) {
        curQ.ci = cIdx;
        if (curQ.opts[cIdx]) curQ.ans = curQ.opts[cIdx];
      }
      if (curQ.sol) {
        curQ.sol += ' ' + line;
      } else {
        curQ.sol = line;
      }
      continue;
    }

    // Phát hiện phương án trắc nghiệm A, B, C, D:
    // Bắt buộc phải có dấu phân cách (:.)-/ hoặc ngoặc để không nhầm chữ Tiếng Việt (như "Chọn", "Cho")
    const optMatch = line.match(/^(?:<u\b[^>]*>)?\s*(?:(?:\*|\(|\[)([A-D])(?:\*|\)|\])|([A-D])\s*[:.)\-\/])\s*(?:<\/u>)?\s*(.*)/i);

    if (optMatch && (curSection === 'A' || curQ.section === 'A' || curQ.items.length === 0)) {
      curQ.section = 'A';
      const optLetter = (optMatch[1] || optMatch[2]).toUpperCase();
      let optText = optMatch[3] ? optMatch[3].trim() : '';

      // Kiểm tra phương án gạch chân, in đậm, hoa thị, highlight
      const isUnderlined = /<u\b|\\underline\{|\bunderline\*|\*$/i.test(line) ||
                           /<u\b|\\underline\{/i.test(optText) ||
                           /^\*/.test(line) ||
                           /<b>|<strong>|<w:b\b|font-weight:\s*bold/i.test(line) ||
                           /color:\s*(?:red|#f[0-9a-f]{5})/i.test(line) ||
                           /<mark\b/i.test(line);

      // Làm sạch thẻ HTML, quotes và dấu hoa thị trong phương án
      let cleanOptText = optText.replace(/<\/?(?:u|b|strong|mark|span)[^>]*>/gi, '')
                                .replace(/\\underline\{([^}]+)\}/gi, '$1')
                                .replace(/^\*|\*$/g, '')
                                .replace(/^"|"$/g, '')
                                .replace(/\$"\s*/g, '$')
                                .replace(/\s*"\$/g, '$')
                                .trim();

      const optIdx = { 'A': 0, 'B': 1, 'C': 2, 'D': 3 }[optLetter] ?? curQ.opts.length;

      // Phòng trường hợp dòng phương án vẫn còn dính phương án kế tiếp: ví dụ "$1 . B. -1.$"
      const nextOptMatch = cleanOptText.match(/^(.*?)\s+(?:<[^>]+>)*\s*([B-D])\s*[:.)\-\/]\s*(.*)$/);
      if (nextOptMatch) {
        const curOptVal = nextOptMatch[1].trim();
        const nextLetter = nextOptMatch[2].toUpperCase();
        const nextOptVal = nextOptMatch[3].trim();
        curQ.opts[optIdx] = curOptVal;
        const nextIdx = { 'A': 0, 'B': 1, 'C': 2, 'D': 3 }[nextLetter];
        if (nextIdx !== undefined) {
          curQ.opts[nextIdx] = nextOptVal;
        }
      } else {
        curQ.opts[optIdx] = cleanOptText;
      }

      if (isUnderlined) {
        curQ.ci = optIdx;
        curQ.ans = curQ.opts[optIdx];
      }
      continue;
    }

    // Phát hiện các ý Đúng / Sai a), b), c), d) cho Phần II
    const dsMatch = line.match(/^(?:<[^>]+>)*\s*([a-d])\s*[:.)\-]\s*(.*)/i);
    if (dsMatch && (curSection === 'B' || curQ.section === 'B' || curQ.opts.length === 0)) {
      curQ.section = 'B';
      const isUnderlined = /<u\b|\\underline\{|<b>|<strong>|<w:b\b|font-weight:\s*bold|<mark\b|color:\s*(?:red|#f[0-9a-f]{5})/i.test(line);
      const isMarkedTrue = /đúng|true|\bđ\b/i.test(line) || isUnderlined;
      const cleanStem = dsMatch[2].replace(/<\/?(?:u|b|strong|mark|span)[^>]*>/gi, '').replace(/\[?(?:đúng|sai|true|false|đ|s)\]?/gi, '').trim();
      curQ.items.push({
        s: cleanStem,
        t: isMarkedTrue
      });
      continue;
    }

    // Phát hiện đáp án hoặc lời giải
    const ansMatch = line.match(/^(?:đáp\s*(?:án|số)|key|kết\s*quả|kq)\s*[:.]\s*(.*)/i);
    if (ansMatch) {
      curQ.ans = ansMatch[1].replace(/<\/?(?:u|b|strong|mark|span)[^>]*>/gi, '').trim();
      continue;
    }

    const solMatch = line.match(/^(?:lời\s*giải|hướng\s*dẫn\s*giải|hd)\s*[:.]\s*(.*)/i);
    if (solMatch) {
      curQ.sol = solMatch[1].replace(/<\/?(?:u|b|strong|mark|span)[^>]*>/gi, '').trim();
      continue;
    }

    // Nối tiếp nội dung thân câu hỏi nếu chưa qua phương án
    if (curQ.opts.length === 0 && curQ.items.length === 0) {
      curQ.stem = curQ.stem ? (curQ.stem + ' ' + line) : line;
      curQ.stem = curQ.stem.replace(/,\s*,+/g, ', ').replace(/\s+,/g, ',');
    } else if (curQ.sol) {
      curQ.sol += ' ' + line;
    }
  }

  // Đẩy câu hỏi cuối cùng vào
  if (curQ) {
    pushCurrentQuestion(curQ, partA, partB, partC, ansKeys);
  }

  const hasAnyQuestions = partA.length > 0 || partB.length > 0 || partC.length > 0;

  return {
    id: `word-exam-${Date.now()}`,
    title: title || 'Đề thi chuyển đổi từ file Word',
    grade: String(grade || '12'),
    min: 90,
    desc: 'Đề thi chuyển đổi từ file Word: công thức toán MathType/OMML hiển thị chuẩn KaTeX, tự động phân 3 nhóm câu hỏi và nhận diện đáp án đúng.',
    isCustom: true,
    A: partA.length > 0 ? partA : (hasAnyQuestions ? [] : getSampleFallbackPartA()),
    B: partB.length > 0 ? partB : (hasAnyQuestions ? [] : getSampleFallbackPartB()),
    C: partC.length > 0 ? partC : (hasAnyQuestions ? [] : getSampleFallbackPartC())
  };
}

function pushCurrentQuestion(q, partA, partB, partC, ansKeys) {
  // Tự động phân loại chính xác nhóm câu hỏi nếu tài liệu Word không có tiêu đề Phần I, II, III rõ ràng:
  let effectiveSection = q.section;
  if (q.items && q.items.length >= 2) {
    effectiveSection = 'B';
  } else if (q.opts && q.opts.length >= 2) {
    effectiveSection = 'A';
  } else if (!q.opts || q.opts.length === 0) {
    if (effectiveSection !== 'B') effectiveSection = 'C';
  }

  q.section = effectiveSection;

  if (effectiveSection === 'A') {
    // Backfill đáp án đúng từ Answer Key nếu câu hỏi chưa có gạch chân/in đậm
    if (q.ci < 0 && ansKeys.A.has(q.qNum)) {
      const letter = ansKeys.A.get(q.qNum);
      const idx = { 'A': 0, 'B': 1, 'C': 2, 'D': 3 }[letter];
      if (idx !== undefined) {
        q.ci = idx;
        if (q.opts[idx]) q.ans = q.opts[idx];
      }
    }
    partA.push(finalizePartAQ(q));
  } else if (effectiveSection === 'B') {
    if (ansKeys.B.has(q.qNum)) {
      const keyItems = ansKeys.B.get(q.qNum);
      q.items.forEach((it, idx) => {
        const subLetter = String.fromCharCode(97 + idx);
        const match = keyItems.find(k => k.sub === subLetter);
        if (match) it.t = match.val;
      });
    }
    partB.push(finalizePartBQ(q));
  } else if (effectiveSection === 'C') {
    if (!q.ans && ansKeys.C.has(q.qNum)) {
      q.ans = ansKeys.C.get(q.qNum);
    }
    partC.push(finalizePartCQ(q));
  }
}

function finalizePartAQ(q) {
  const defaultOpts = ['$A$', '$B$', '$C$', '$D$'];
  const rawOpts = q.opts.length === 4 ? q.opts : [...q.opts, ...defaultOpts].slice(0, 4);
  const ci = q.ci >= 0 && q.ci < 4 ? q.ci : 0;
  
  // Dọn dẹp tiền tố Câu X: ở thân câu hỏi để tránh lặp lại "Câu 1: Câu 1..."
  const cleanStem = (q.stem || 'Câu hỏi chưa có nội dung').replace(/^(?:<[^>]+>)*\s*(?:câu|bài)\s*\d+\s*(?:\([^)]*\)|\[[^\]]*\])?\s*[:.)\-\/]?\s*/i, '').trim();
  const convertedStem = convertWordMathToLatex(cleanStem);
  const convertedOpts = rawOpts.map(opt => convertWordMathToLatex(String(opt || '').trim()));
  const chosenAns = convertedOpts[ci] || convertWordMathToLatex(q.ans || '');
  const cleanSol = q.sol ? convertWordMathToLatex(q.sol) : `Ta phân tích và biến đổi bài toán: Đáp án đúng là ${chosenAns}.`;

  return {
    id: q.id,
    type: 'mcq',
    section: 'A',
    stem: convertedStem,
    opts: convertedOpts,
    ci: ci,
    ans: chosenAns,
    sol: cleanSol
  };
}

function finalizePartBQ(q) {
  const cleanStem = (q.stem || 'Xét tính đúng sai của các khẳng định sau:').replace(/^(?:<[^>]+>)*\s*(?:câu|bài)\s*\d+\s*(?:\([^)]*\)|\[[^\]]*\])?\s*[:.)\-\/]?\s*/i, '').trim();
  const items = q.items.length > 0 ? q.items : [
    { s: 'Ý a đúng mệnh đề toán học', t: true },
    { s: 'Ý b sai mệnh đề toán học', t: false },
    { s: 'Ý c đúng mệnh đề toán học', t: true },
    { s: 'Ý d sai mệnh đề toán học', t: false }
  ];
  return {
    id: q.id,
    type: 'ds',
    section: 'B',
    stem: convertWordMathToLatex(cleanStem),
    items: items.map(it => ({
      s: convertWordMathToLatex(it.s),
      t: it.t
    })),
    sol: convertWordMathToLatex(q.sol || 'Kiểm tra chi tiết từng mệnh đề a, b, c, d bám sát lý thuyết SGK Kết nối tri thức.')
  };
}

function finalizePartCQ(q) {
  const cleanStem = (q.stem || 'Tính giá trị của đại lượng:').replace(/^(?:<[^>]+>)*\s*(?:câu|bài)\s*\d+\s*(?:\([^)]*\)|\[[^\]]*\])?\s*[:.)\-\/]?\s*/i, '').trim();
  const numVal = parseFloat(String(q.ans || '').replace(',', '.')) || 1;
  return {
    id: q.id,
    type: 'tln',
    section: 'C',
    stem: convertWordMathToLatex(cleanStem),
    v: numVal,
    ans: convertWordMathToLatex(q.ans || `${numVal}`),
    sol: convertWordMathToLatex(q.sol || `Thực hiện tính toán từng bước, kết quả là: ${numVal}.`)
  };
}

/* =========================================================================
   10. TẠO ĐỀ THI TƯƠNG TỰ (ĐỔI SỐ LIỆU TỰ ĐỘNG)
   ========================================================================= */

export function createAdjacentExam(originalExam) {
  if (!originalExam) return null;
  const shiftCode = Math.floor(Math.random() * 80 + 101);

  const shiftNumbersInLatex = (str) => {
    if (!str) return '';
    return str.replace(/\b([0-9]+)\b/g, (match, n) => {
      const val = parseInt(n, 10);
      if (val >= 2000) return match;
      const delta = (val % 2 === 0 ? 1 : -1);
      const newVal = Math.max(1, val + delta);
      return `${newVal}`;
    });
  };

  const newA = (originalExam.A || []).map((q, idx) => {
    const mutatedStem = shiftNumbersInLatex(q.stem);
    const shuffledOpts = [...q.opts].sort(() => Math.random() - 0.5);
    const newCi = shuffledOpts.indexOf(q.ans) >= 0 ? shuffledOpts.indexOf(q.ans) : 0;
    return {
      ...q,
      id: `word-adj-A-${idx}-${shiftCode}`,
      stem: mutatedStem,
      opts: shuffledOpts,
      ci: newCi,
      ans: shuffledOpts[newCi],
      sol: `[Đề thi tương tự mã ${shiftCode}] ` + q.sol
    };
  });

  const newB = (originalExam.B || []).map((q, idx) => {
    return {
      ...q,
      id: `word-adj-B-${idx}-${shiftCode}`,
      stem: shiftNumbersInLatex(q.stem),
      items: (q.items || []).map(it => ({
        s: shiftNumbersInLatex(it.s),
        t: it.t
      })),
      sol: `[Đề thi tương tự mã ${shiftCode}] ` + q.sol
    };
  });

  const newC = (originalExam.C || []).map((q, idx) => {
    const nextVal = (parseFloat(q.v) || 0) + 1;
    return {
      ...q,
      id: `word-adj-C-${idx}-${shiftCode}`,
      stem: shiftNumbersInLatex(q.stem),
      v: nextVal,
      ans: `${nextVal}`,
      sol: `[Đề thi tương tự mã ${shiftCode}] ` + q.sol
    };
  });

  return {
    ...originalExam,
    id: `adjacent-${originalExam.id}-${shiftCode}`,
    title: `[ĐỀ TƯƠNG TỰ ${shiftCode}] ` + originalExam.title,
    code: `TT-${shiftCode}`,
    desc: `Đề thi tương tự đổi số liệu tự động từ đề Word gốc.`,
    isCustom: true,
    A: newA,
    B: newB,
    C: newC
  };
}

function getSampleFallbackPartA() {
  return [
    {
      id: 'fb-w-a1',
      stem: 'Cho hàm số $y = x^3 - 3x + 2$. Tìm điểm cực tiểu của đồ thị hàm số:',
      opts: ['$A(1; 0)$', '$B(-1; 4)$', '$C(0; 2)$', '$D(2; 4)$'],
      ci: 0,
      ans: '$A(1; 0)$',
      sol: "Đạo hàm $y' = 3x^2 - 3 = 0 \\Leftrightarrow x = \\pm 1$. Điểm cực tiểu là $A(1; 0)$."
    }
  ];
}

function getSampleFallbackPartB() {
  return [
    {
      id: 'fb-w-b1',
      stem: 'Cho hàm số $f(x) = \\dfrac{2x + 1}{x - 1}$. Xét tính đúng sai của các khẳng định sau:',
      items: [
        { s: 'Đồ thị có tiệm cận đứng là $x = 1$', t: true },
        { s: 'Đồ thị có tiệm cận ngang là $y = 2$', t: true },
        { s: 'Hàm số đồng biến trên từng khoảng xác định', t: false },
        { s: 'Tâm đối xứng của đồ thị là $I(1; 2)$', t: true }
      ],
      sol: "Đạo hàm $f'(x) = \\dfrac{-3}{(x-1)^2} < 0$ nên hàm số nghịch biến."
    }
  ];
}

function getSampleFallbackPartC() {
  return [
    {
      id: 'fb-w-c1',
      stem: 'Trong không gian $Oxyz$, cho hai vectơ $\\vec{u} = (1; 2; 3)$ và $\\vec{v} = (2; -1; 1)$. Tính tích vô hướng $\\vec{u} \\cdot \\vec{v}$:',
      v: 3,
      ans: '3',
      sol: '$\\vec{u} \\cdot \\vec{v} = 1 \\cdot 2 + 2 \\cdot (-1) + 3 \\cdot 1 = 3$.'
    }
  ];
}

// Gắn toàn bộ hàm vào window để gọi từ bất kỳ đâu
if (typeof window !== 'undefined') {
  window.JSZip = JSZip;
  window.MTEF_CHARS = MTEF_CHARS;
  window.extractEquationNativeFromOle = extractEquationNativeFromOle;
  window.extractMTEFFromAnyBuffer = extractMTEFFromAnyBuffer;
  window.parseMTEFToLatex = parseMTEFToLatex;
  window.ommlNodeToLatex = ommlNodeToLatex;
  window.extractDocxTextAndMath = extractDocxTextAndMath;
  window.convertWordMathToLatex = convertWordMathToLatex;
  window.extractAnswerKeyMap = extractAnswerKeyMap;
  window.parseExamFromWordText = parseExamFromWordText;
  window.createAdjacentExam = createAdjacentExam;
}
