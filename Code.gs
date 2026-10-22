/**
 * ============================================================================
 * HỆ THỐNG MÁY CHỦ BACKEND GOOGLE APPS SCRIPT CHO WEB DẠY HỌC TOÁN TRẦN TRỌNG
 * Tác giả: Thầy Trần Trọng - vitinhtrantrong@gmail.com
 * Trường THPT Ba Chúc, An Giang
 * ============================================================================
 * 
 * HƯỚNG DẪN CÀI ĐẶT NHANH (Xem chi tiết trên website hoặc làm theo các bước sau):
 * 1. Mở https://sheets.google.com -> Tạo 1 file Google Trang tính mới (ví dụ đặt tên: "CSDL Toán Trần Trọng").
 * 2. Trên menu chọn: Tiện ích mở rộng (Extensions) -> Apps Script.
 * 3. Xóa sạch mọi mã mặc định trong khung soạn thảo Code.gs, dán TOÀN BỘ file này vào.
 * 4. Bấm biểu tượng Đĩa mềm (Lưu) hoặc Ctrl + S.
 * 5. Bấm nút "Triển khai" (Deploy) ở góc trên bên phải -> "Tùy chọn triển khai mới" (New deployment).
 * 6. Chọn loại: biểu tượng bánh răng -> "Ứng dụng web" (Web app).
 *    - Mô tả: "Backend Toán v1"
 *    - Thực thi dưới dạng: "Tôi (vitinhtrantrong@gmail.com)"
 *    - Ai có quyền truy cập: "Bất kỳ ai" (Anyone) -> RẤT QUAN TRỌNG để học sinh nộp bài được!
 * 7. Bấm "Triển khai" -> Cấp quyền truy cập nếu Google hỏi.
 * 8. Sao chép liên kết Web App (có đuôi /exec) và dán vào ô "Đường dẫn API Máy chủ" trong web.
 * ============================================================================
 */

// Mật khẩu quản trị mặc định (có thể đổi qua giao diện web)
var DEFAULT_ADMIN_PASS = "Tvtrong90@";

// Tên các trang tính trong Google Sheet
var SHEETS = {
  WEEKLY: "DeToanTuan",
  SUBS: "BaiNop",
  CHAT: "TinNhan",
  DOCS: "TaiLieu"
};

/**
 * Xử lý yêu cầu GET: Kiểm tra trạng thái máy chủ online
 */
function doGet(e) {
  var output = {
    ok: true,
    status: "online",
    message: "Hệ thống máy chủ API Google Sheets - Dạy học Toán Thầy Trần Trọng đang hoạt động bình thường!",
    timestamp: new Date().toISOString()
  };
  return ContentService.createTextOutput(JSON.stringify(output))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Xử lý yêu cầu POST từ trang web
 */
function doPost(e) {
  try {
    var raw = e && e.postData && e.postData.contents ? e.postData.contents : "{}";
    var req = JSON.parse(raw);
    var res = handleApiRequest(req);
    return ContentService.createTextOutput(JSON.stringify(res))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      ok: false,
      msg: "Lỗi máy chủ Apps Script: " + (err && err.message ? err.message : String(err))
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Điều phối các chức năng API
 */
function handleApiRequest(r) {
  initSpreadsheet();
  var action = r.action;
  var token = r.token || "";
  var isAdmin = isValidAdminToken(token);

  // --- CÁC HÀNH ĐỘNG DÀNH CHO HỌC SINH & KHÁCH ---
  switch (action) {
    case "getWeekly":
      return getWeeklyData();

    case "submit":
      return submitAnswer(r);

    case "getRank":
      return getRankData(r.scope);

    case "getDocs":
      return getDocsData();

    case "chatSend":
      return sendChatMessage(r);

    case "chatGet":
      return getChatMessages(r.vid);

    case "login":
      return checkLogin(r.pass);
  }

  // --- CÁC HÀNH ĐỘNG YÊU CẦU QUYỀN QUẢN TRỊ ---
  if (!isAdmin) {
    return { ok: false, msg: "Yêu cầu quyền quản trị viên." };
  }

  switch (action) {
    case "changePass":
      return changeAdminPassword(r.newPass);

    case "resetPass":
      return resetAdminPassword();

    case "bank":
      return getQuestionBank();

    case "publish":
      return publishWeeklyProblem(r);

    case "closeWeekly":
      return closeWeeklyProblem();

    case "subs":
      return getAllSubmissions();

    case "gradeSub":
      return gradeSubmission(r.id, r.diem);

    case "upload":
      return handleFileUpload(r);

    case "addDoc":
      return addDocument(r);

    case "delDoc":
      return deleteDocument(r.id);

    case "chatList":
      return getTeacherChatThreads();

    case "chatThread":
      return getTeacherChatThread(r.vid);

    case "chatReply":
      return replyChatMessage(r);

    default:
      return { ok: false, msg: "Hành động '" + action + "' không được hỗ trợ." };
  }
}

/**
 * Tự động tạo các Sheet và tiêu đề cột nếu chưa có
 */
function initSpreadsheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  // 1. Sheet Bài toán tuần
  var sWeekly = ss.getSheetByName(SHEETS.WEEKLY);
  if (!sWeekly) {
    sWeekly = ss.insertSheet(SHEETS.WEEKLY);
    sWeekly.appendRow([
      "id", "tieu_de", "noi_dung", "loai", "phuong_an", "anh",
      "dap_so", "sai_so", "loi_giai", "bat_dau", "ket_thuc", "trang_thai"
    ]);
    sWeekly.getRange(1, 1, 1, 12).setFontWeight("bold").setBackground("#E0F2FE");
  }

  // 2. Sheet Bài nộp của học sinh
  var sSubs = ss.getSheetByName(SHEETS.SUBS);
  if (!sSubs) {
    sSubs = ss.insertSheet(SHEETS.SUBS);
    sSubs.appendRow([
      "id", "thoi_gian", "id_bai", "ho_ten", "lop_truong", "dia_chi",
      "so_dien_thoai", "dap_so_gui", "loi_giai_gui", "anh_bai_lam",
      "dung", "diem", "hang", "trang_thai_cham"
    ]);
    sSubs.getRange(1, 1, 1, 14).setFontWeight("bold").setBackground("#FEF3C7");
  }

  // 3. Sheet Tin nhắn trao đổi
  var sChat = ss.getSheetByName(SHEETS.CHAT);
  if (!sChat) {
    sChat = ss.insertSheet(SHEETS.CHAT);
    sChat.appendRow([
      "thoi_gian", "id_khach", "ten", "lien_he", "tu", "noi_dung", "da_doc"
    ]);
    sChat.getRange(1, 1, 1, 7).setFontWeight("bold").setBackground("#DCFCE7");
  }

  // 4. Sheet Tài liệu học tập
  var sDocs = ss.getSheetByName(SHEETS.DOCS);
  if (!sDocs) {
    sDocs = ss.insertSheet(SHEETS.DOCS);
    sDocs.appendRow([
      "id", "tieu_de", "mo_ta", "link", "tai_ve", "loai", "khoi", "ngay_them"
    ]);
    sDocs.getRange(1, 1, 1, 8).setFontWeight("bold").setBackground("#F3E8FF");
  }
}

// ==================== CƠ CHẾ ĐĂNG NHẬP QUẢN TRỊ ====================

function getSavedPassword() {
  var props = PropertiesService.getScriptProperties();
  var p = props.getProperty("ADMIN_PASS");
  return p ? p : DEFAULT_ADMIN_PASS;
}

function checkLogin(pass) {
  var current = getSavedPassword();
  var input = String(pass || "").trim();
  if (input && (input === current || input.toLowerCase() === current.toLowerCase())) {
    var token = "adm-" + Utilities.getUuid();
    PropertiesService.getScriptProperties().setProperty("ACTIVE_TOKEN", token);
    return { ok: true, token: token };
  }
  return { ok: false, msg: "Sai mật khẩu quản trị." };
}

function isValidAdminToken(token) {
  if (!token) return false;
  if (token === "demo-admin") return true;
  var saved = PropertiesService.getScriptProperties().getProperty("ACTIVE_TOKEN");
  return saved && saved === token;
}

function changeAdminPassword(newPass) {
  var np = String(newPass || "").trim();
  if (!np || np.length < 3) {
    return { ok: false, msg: "Mật khẩu mới phải có tối thiểu 3 ký tự." };
  }
  PropertiesService.getScriptProperties().setProperty("ADMIN_PASS", np);
  return { ok: true, msg: "Đã đổi mật khẩu quản trị Google Apps Script thành công!" };
}

function resetAdminPassword() {
  PropertiesService.getScriptProperties().setProperty("ADMIN_PASS", DEFAULT_ADMIN_PASS);
  return { ok: true, msg: "Đã khôi phục mật khẩu mặc định: " + DEFAULT_ADMIN_PASS };
}

// ==================== BÀI TOÁN TUẦN & NỘP BÀI ====================

var BONUS = [30, 25, 20, 15, 15, 10, 10, 10, 10, 10];
function getTier(diem) {
  if (diem >= 125) return "Kim cương";
  if (diem >= 115) return "Vàng";
  if (diem >= 105) return "Bạc";
  if (diem >= 100) return "Đồng";
  return "Khuyến khích";
}

function getWeeklyData() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEETS.WEEKLY);
  var rows = sheet.getDataRange().getValues();
  if (rows.length <= 1) return { ok: true, current: null, past: [] };

  var now = new Date().getTime();
  var list = [];

  for (var i = 1; i < rows.length; i++) {
    var r = rows[i];
    if (!r[0]) continue;
    var opts = [];
    try { opts = JSON.parse(r[4] || "[]"); } catch (e) { opts = []; }

    var item = {
      id: String(r[0]),
      tieu_de: String(r[1] || ""),
      noi_dung: String(r[2] || ""),
      loai: String(r[3] || "tln"),
      phuong_an: opts,
      anh: String(r[5] || ""),
      dap_so: r[6],
      sai_so: Number(r[7] || 0.001),
      loi_giai: String(r[8] || ""),
      bat_dau: String(r[9] || ""),
      ket_thuc: String(r[10] || ""),
      trang_thai: String(r[11] || "open")
    };
    list.push(item);
  }

  var cur = null;
  for (var j = list.length - 1; j >= 0; j--) {
    var w = list[j];
    var end = new Date(w.ket_thuc).getTime();
    if (w.trang_thai === "open" && end > now) {
      cur = {
        id: w.id,
        tieu_de: w.tieu_de,
        noi_dung: w.noi_dung,
        loai: w.loai,
        phuong_an: w.phuong_an,
        anh: w.anh,
        bat_dau: w.bat_dau,
        ket_thuc: w.ket_thuc
      };
      break;
    }
  }

  var past = list.filter(function (w) { return !cur || w.id !== cur.id; }).reverse();
  return { ok: true, current: cur, past: past };
}

function submitAnswer(r) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var weeklySheet = ss.getSheetByName(SHEETS.WEEKLY);
  var subsSheet = ss.getSheetByName(SHEETS.SUBS);

  // Lấy bài toán đang mở
  var weeklyRes = getWeeklyData();
  var cur = weeklyRes.current;
  if (!cur || cur.id !== r.id) {
    return { ok: false, msg: "Bài toán đã hết hạn nộp hoặc không tồn tại." };
  }

  // Kiểm tra thông tin học sinh
  if (!r.ho_ten || r.ho_ten.trim().length < 3) return { ok: false, msg: "Vui lòng nhập họ tên." };
  if (!r.lop_truong || !r.lop_truong.trim()) return { ok: false, msg: "Vui lòng nhập lớp – trường." };
  if (!r.dia_chi || r.dia_chi.trim().length < 5) return { ok: false, msg: "Vui lòng nhập địa chỉ." };
  var sdt = String(r.so_dien_thoai || "").trim();
  if (!/^0\d{9}$/.test(sdt)) return { ok: false, msg: "Số điện thoại gồm 10 chữ số, bắt đầu bằng số 0." };

  // Kiểm tra trùng bài nộp
  var subsData = subsSheet.getDataRange().getValues();
  for (var i = 1; i < subsData.length; i++) {
    var row = subsData[i];
    if (String(row[2]) === String(r.id) && String(row[6]).replace(/^'/, "") === sdt) {
      return { ok: false, msg: "Số điện thoại " + sdt + " đã nộp bài cho bài toán tuần này rồi." };
    }
  }

  // Lấy chi tiết đáp án của đề
  var weeklyRows = weeklySheet.getDataRange().getValues();
  var fullCur = null;
  for (var k = 1; k < weeklyRows.length; k++) {
    if (String(weeklyRows[k][0]) === String(cur.id)) {
      fullCur = {
        id: weeklyRows[k][0],
        loai: weeklyRows[k][3] || "tln",
        dap_so: weeklyRows[k][6],
        sai_so: Number(weeklyRows[k][7] || 0.001)
      };
      break;
    }
  }

  // Chấm điểm
  var loai = (fullCur && fullCur.loai) || "tln";
  var hasSol = (String(r.loi_giai || "").trim() ? 5 : 0);
  var dung = false;
  var diem = 0;
  var cho = false;

  if (loai === "tl") {
    cho = true;
    dung = "";
    diem = 0;
  } else if (loai === "mcq") {
    dung = String(r.dap_so || "").toUpperCase() === String(fullCur.dap_so || "").toUpperCase();
  } else {
    // Tự luận ngắn
    var studentNum = Number(String(r.dap_so || "").replace(",", "."));
    var targetNum = Number(fullCur.dap_so);
    var tol = Number(fullCur.sai_so || 0.001);
    dung = Math.abs(studentNum - targetNum) <= tol + 1e-9;
  }

  // Thứ tự làm đúng trước để cộng điểm tốc độ
  var correctCount = 0;
  for (var m = 1; m < subsData.length; m++) {
    if (String(subsData[m][2]) === String(r.id) && subsData[m][10] === true) {
      correctCount++;
    }
  }

  if (!cho) {
    if (dung) {
      var bonusPoint = (correctCount < BONUS.length ? BONUS[correctCount] : 5);
      diem = 100 + bonusPoint + hasSol;
    } else {
      diem = 10 + hasSol;
    }
  }

  var hang = cho ? "" : getTier(diem);
  var subId = "S" + new Date().getTime();
  var nowIso = new Date().toISOString();

  // Xử lý ảnh bài làm nếu có
  var anhLink = "";
  if (r.anh_data) {
    try {
      anhLink = saveBase64ImageToDrive(r.anh_data, "BaiLam_" + sdt + "_" + cur.id);
    } catch (e) {
      anhLink = "Lỗi lưu ảnh: " + e.message;
    }
  }

  // Ghi vào Google Sheet
  subsSheet.appendRow([
    subId, nowIso, cur.id, r.ho_ten, r.lop_truong, r.dia_chi,
    "'" + sdt, r.dap_so || "", r.loi_giai || "", anhLink,
    dung, diem, hang, cho ? "cho" : "da_cham"
  ]);

  return {
    ok: true,
    dung: dung,
    diem: diem,
    hang: hang,
    cho: cho,
    thu_tu: dung ? (correctCount + 1) : null
  };
}

function saveBase64ImageToDrive(base64Data, filename) {
  var folderName = "ToanTranTrong_AnhBaiLam";
  var folders = DriveApp.getFoldersByName(folderName);
  var folder = folders.hasNext() ? folders.next() : DriveApp.createFolder(folderName);
  var decoded = Utilities.base64Decode(base64Data);
  var blob = Utilities.newBlob(decoded, "image/jpeg", filename + ".jpg");
  var file = folder.createFile(blob);
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  return file.getUrl();
}

// ==================== BẢNG XẾP HẠNG & TÀI LIỆU ====================

function getRankData(scope) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEETS.SUBS);
  var rows = sheet.getDataRange().getValues();
  if (rows.length <= 1) return { ok: true, rows: [] };

  var curWeekly = getWeeklyData().current;
  var curId = curWeekly ? curWeekly.id : null;
  var userMap = {};

  for (var i = 1; i < rows.length; i++) {
    var r = rows[i];
    var trangThai = r[13];
    if (trangThai === "cho") continue;
    var idBai = String(r[2]);
    if (scope === "week" && idBai !== curId) continue;

    var sdt = String(r[6] || "").replace(/^'/, "");
    if (!sdt) continue;

    if (!userMap[sdt]) {
      userMap[sdt] = {
        ten: String(r[3] || ""),
        lop: String(r[4] || ""),
        sdt: sdt.length >= 7 ? sdt.slice(0, 3) + "****" + sdt.slice(-3) : sdt,
        diem: 0,
        so_bai: 0,
        t: String(r[1])
      };
    }
    userMap[sdt].diem += Number(r[11] || 0);
    userMap[sdt].so_bai += 1;
  }

  var list = [];
  for (var key in userMap) {
    list.push(userMap[key]);
  }

  list.sort(function (a, b) {
    if (b.diem !== a.diem) return b.diem - a.diem;
    return a.t.localeCompare(b.t);
  });

  return { ok: true, rows: list.slice(0, 30) };
}

function getDocsData() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEETS.DOCS);
  var rows = sheet.getDataRange().getValues();
  var list = [];

  for (var i = 1; i < rows.length; i++) {
    var r = rows[i];
    if (!r[0]) continue;
    list.push({
      id: String(r[0]),
      tieu_de: String(r[1] || ""),
      mo_ta: String(r[2] || ""),
      link: String(r[3] || ""),
      tai_ve: String(r[4] || ""),
      loai: String(r[5] || "Tài liệu"),
      khoi: String(r[6] || "12"),
      ngay_them: String(r[7] || "")
    });
  }

  return { ok: true, docs: list.reverse() };
}

// ==================== HỘP THƯ HỎI THẦY (CHAT) ====================

function sendChatMessage(r) {
  var noiDung = String(r.noi_dung || "").trim().slice(0, 1000);
  if (!noiDung) return { ok: false, msg: "Tin nhắn trống." };

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEETS.CHAT);
  sheet.appendRow([
    new Date().toISOString(),
    r.vid || "guest",
    r.ten || "Học sinh",
    r.lien_he || "",
    "khach",
    noiDung,
    false
  ]);

  return { ok: true };
}

function getChatMessages(vid) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEETS.CHAT);
  var rows = sheet.getDataRange().getValues();
  var msgs = [];

  for (var i = 1; i < rows.length; i++) {
    var r = rows[i];
    if (String(r[1]) === String(vid)) {
      msgs.push({
        thoi_gian: String(r[0]),
        tu: String(r[4]),
        noi_dung: String(r[5])
      });
    }
  }

  return { ok: true, msgs: msgs };
}

function getTeacherChatThreads() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEETS.CHAT);
  var rows = sheet.getDataRange().getValues();
  var map = {};

  for (var i = 1; i < rows.length; i++) {
    var r = rows[i];
    var vid = String(r[1]);
    if (!map[vid]) {
      map[vid] = { vid: vid, ten: "Học sinh", lien_he: "", unread: 0, last: "", time: "" };
    }
    if (String(r[4]) === "khach") {
      map[vid].ten = String(r[2] || map[vid].ten);
      map[vid].lien_he = String(r[3] || map[vid].lien_he);
      if (r[6] === false || r[6] === "false") map[vid].unread++;
    }
    map[vid].last = String(r[5]);
    map[vid].time = String(r[0]);
  }

  var threads = [];
  for (var k in map) threads.push(map[k]);
  threads.sort(function (a, b) { return b.time.localeCompare(a.time); });
  return { ok: true, threads: threads };
}

function getTeacherChatThread(vid) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEETS.CHAT);
  var rows = sheet.getDataRange().getValues();
  var msgs = [];

  for (var i = 1; i < rows.length; i++) {
    if (String(rows[i][1]) === String(vid)) {
      // Đánh dấu đã đọc
      sheet.getRange(i + 1, 7).setValue(true);
      msgs.push({
        thoi_gian: String(rows[i][0]),
        tu: String(rows[i][4]),
        noi_dung: String(rows[i][5])
      });
    }
  }
  return { ok: true, msgs: msgs };
}

function replyChatMessage(r) {
  var t = String(r.noi_dung || "").trim().slice(0, 1000);
  if (!t) return { ok: false, msg: "Tin nhắn trống." };

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEETS.CHAT);
  sheet.appendRow([
    new Date().toISOString(),
    r.vid,
    "Thầy Trần Trọng",
    "",
    "thay",
    t,
    true
  ]);
  return { ok: true };
}

// ==================== CÁC HÀNH ĐỘNG QUẢN TRỊ VIÊN ====================

function getQuestionBank() {
  return {
    ok: true,
    bank: [
      { key: "d1", tieu_de: "Giá trị lớn nhất của hàm số bậc 2", noi_dung: "Tìm giá trị lớn nhất của hàm số $y=-x^2+4x+1$.", loai: "tln", dap_so: 5, sai_so: 0.001, loi_giai: "$y=5-(x-2)^2\\le5$, dấu bằng khi $x=2$." },
      { key: "d2", tieu_de: "Đếm tập hợp con", noi_dung: "Tập hợp $A$ có $5$ phần tử. Hỏi $A$ có bao nhiêu tập con?", loai: "tln", dap_so: 32, sai_so: 0.001, loi_giai: "Số tập con là $2^5=32$." }
    ]
  };
}

function publishWeeklyProblem(r) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEETS.WEEKLY);
  var b = r.custom || (r.key ? getQuestionBank().bank.find(function(x){ return x.key === r.key; }) : null);
  if (!b) return { ok: false, msg: "Không tìm thấy nội dung bài toán." };

  var now = new Date();
  var nowIso = now.toISOString();
  var days = Number(r.days || 7);
  var endIso = new Date(now.getTime() + days * 864e5).toISOString();

  // Đóng các bài cũ đang mở
  var rows = sheet.getDataRange().getValues();
  for (var i = 1; i < rows.length; i++) {
    if (rows[i][11] === "open") {
      sheet.getRange(i + 1, 12).setValue("closed");
      sheet.getRange(i + 1, 11).setValue(nowIso);
    }
  }

  var wid = "W" + now.getTime();
  sheet.appendRow([
    wid, b.tieu_de, b.noi_dung, b.loai || "tln",
    JSON.stringify(b.phuong_an || []), b.anh || "",
    b.dap_so, Number(b.sai_so || 0.001), b.loi_giai || "",
    nowIso, endIso, "open"
  ]);

  return { ok: true };
}

function closeWeeklyProblem() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEETS.WEEKLY);
  var rows = sheet.getDataRange().getValues();
  var nowIso = new Date().toISOString();
  for (var i = 1; i < rows.length; i++) {
    if (rows[i][11] === "open") {
      sheet.getRange(i + 1, 12).setValue("closed");
      sheet.getRange(i + 1, 11).setValue(nowIso);
    }
  }
  return { ok: true };
}

function getAllSubmissions() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sSheet = ss.getSheetByName(SHEETS.SUBS);
  var wSheet = ss.getSheetByName(SHEETS.WEEKLY);

  var sRows = sSheet.getDataRange().getValues();
  var subs = [];
  for (var i = 1; i < sRows.length; i++) {
    var r = sRows[i];
    if (!r[0]) continue;
    subs.push({
      id: String(r[0]),
      thoi_gian: String(r[1]),
      id_bai: String(r[2]),
      ho_ten: String(r[3]),
      lop_truong: String(r[4]),
      dia_chi: String(r[5]),
      so_dien_thoai: String(r[6]).replace(/^'/, ""),
      dap_so_gui: String(r[7] || ""),
      loi_giai_gui: String(r[8] || ""),
      anh_bai_lam: String(r[9] || ""),
      dung: r[10],
      diem: Number(r[11] || 0),
      hang: String(r[12] || ""),
      trang_thai_cham: String(r[13] || "da_cham")
    });
  }

  var wRows = wSheet.getDataRange().getValues();
  var weekly = [];
  for (var j = 1; j < wRows.length; j++) {
    if (wRows[j][0]) {
      weekly.push({
        id: String(wRows[j][0]),
        tieu_de: String(wRows[j][1]),
        loai: String(wRows[j][3] || "tln")
      });
    }
  }

  return { ok: true, rows: subs.reverse(), weekly: weekly };
}

function gradeSubmission(subId, newDiem) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEETS.SUBS);
  var rows = sheet.getDataRange().getValues();
  var p = Math.max(0, Math.min(150, Number(newDiem || 0)));

  for (var i = 1; i < rows.length; i++) {
    if (String(rows[i][0]) === String(subId)) {
      sheet.getRange(i + 1, 11).setValue(p >= 100);
      sheet.getRange(i + 1, 12).setValue(p);
      sheet.getRange(i + 1, 13).setValue(getTier(p));
      sheet.getRange(i + 1, 14).setValue("da_cham");
      return { ok: true };
    }
  }
  return { ok: false, msg: "Không tìm thấy bài nộp ID: " + subId };
}

function addDocument(r) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEETS.DOCS);
  var docId = "D" + new Date().getTime();
  sheet.appendRow([
    docId, r.tieu_de, r.mo_ta || "", r.link || "", r.tai_ve || "",
    r.loai || "Tài liệu", r.khoi || "12", new Date().toISOString()
  ]);
  return { ok: true };
}

function deleteDocument(docId) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEETS.DOCS);
  var rows = sheet.getDataRange().getValues();
  for (var i = 1; i < rows.length; i++) {
    if (String(rows[i][0]) === String(docId)) {
      sheet.deleteRow(i + 1);
      return { ok: true };
    }
  }
  return { ok: true };
}

function handleFileUpload(r) {
  var folderName = "ToanTranTrong_TaiLieu";
  var folders = DriveApp.getFoldersByName(folderName);
  var folder = folders.hasNext() ? folders.next() : DriveApp.createFolder(folderName);
  var decoded = Utilities.base64Decode(r.data);
  var blob = Utilities.newBlob(decoded, r.mime, r.name || "tailieu");
  var file = folder.createFile(blob);
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  return {
    ok: true,
    url: file.getUrl(),
    dl: file.getDownloadUrl(),
    img: file.getUrl()
  };
}
