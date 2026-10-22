import { GradeLevel, LessonType, ProblemTypeItem, PracticeQuestionItem } from '../types';
import { CURRICULUM_DATA } from '../data/curriculumData';

export interface CustomLessonSection {
  id: string;
  title: string;
  type: 'note' | 'method' | 'example' | 'text' | 'formula_list' | 'notice';
  content: string;
  note?: string;
}

export interface CustomLessonOverride {
  lessonId: string;
  name?: string;
  summary?: string;
  boxedFormulas?: string[];
  extraSections?: CustomLessonSection[];
  problemTypes?: ProblemTypeItem[];
  customQuestions?: PracticeQuestionItem[];
  updatedAt?: string;
}

const STORAGE_KEY_OVERRIDES = 'curriculum_custom_lesson_overrides';
const STORAGE_KEY_FORMULAS_LEGACY = 'curriculum_custom_formulas';
const STORAGE_KEY_NEW_LESSONS = 'curriculum_custom_new_lessons';

/**
 * Lấy toàn bộ các thay đổi do giáo viên chỉnh sửa từ localStorage
 */
export function getAllLessonOverrides(): Record<string, CustomLessonOverride> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_OVERRIDES);
    const overrides: Record<string, CustomLessonOverride> = raw ? JSON.parse(raw) : {};

    // Backward-compat: nếu có dữ liệu ở curriculum_custom_formulas cũ, gộp vào nếu chưa có
    const legacyRaw = localStorage.getItem(STORAGE_KEY_FORMULAS_LEGACY);
    if (legacyRaw) {
      try {
        const legacyFormulas: Record<string, string[]> = JSON.parse(legacyRaw);
        for (const [id, formulas] of Object.entries(legacyFormulas)) {
          if (!overrides[id]) {
            overrides[id] = { lessonId: id, boxedFormulas: formulas };
          } else if (!overrides[id].boxedFormulas) {
            overrides[id].boxedFormulas = formulas;
          }
        }
      } catch (err) {
        console.warn('Legacy formulas parse error', err);
      }
    }

    return overrides;
  } catch (e) {
    console.error('Failed to load lesson overrides', e);
    return {};
  }
}

/**
 * Lấy dữ liệu tùy chỉnh của một bài học cụ thể
 */
export function getLessonOverride(lessonId: string): CustomLessonOverride | null {
  const all = getAllLessonOverrides();
  return all[lessonId] || null;
}

/**
 * Lưu chỉnh sửa cho một bài học
 */
export function saveLessonOverride(lessonId: string, override: Partial<CustomLessonOverride>): void {
  try {
    const all = getAllLessonOverrides();
    const existing = all[lessonId] || { lessonId };
    all[lessonId] = {
      ...existing,
      ...override,
      lessonId,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY_OVERRIDES, JSON.stringify(all));

    // Cập nhật cả khóa legacy cho các component cũ nếu có
    if (override.boxedFormulas) {
      try {
        const legacyRaw = localStorage.getItem(STORAGE_KEY_FORMULAS_LEGACY);
        const legacy: Record<string, string[]> = legacyRaw ? JSON.parse(legacyRaw) : {};
        legacy[lessonId] = override.boxedFormulas;
        localStorage.setItem(STORAGE_KEY_FORMULAS_LEGACY, JSON.stringify(legacy));
      } catch {}
    }

    // Phát custom event để các component đang mount cập nhật ngay lập tức
    window.dispatchEvent(new CustomEvent('curriculum_data_updated', { detail: { lessonId } }));
  } catch (e) {
    console.error('Failed to save lesson override', e);
  }
}

/**
 * Xóa tùy chỉnh của một bài học, quay lại nội dung mặc định gốc
 */
export function resetLessonOverride(lessonId: string): void {
  try {
    const all = getAllLessonOverrides();
    delete all[lessonId];
    localStorage.setItem(STORAGE_KEY_OVERRIDES, JSON.stringify(all));

    try {
      const legacyRaw = localStorage.getItem(STORAGE_KEY_FORMULAS_LEGACY);
      if (legacyRaw) {
        const legacy: Record<string, string[]> = JSON.parse(legacyRaw);
        delete legacy[lessonId];
        localStorage.setItem(STORAGE_KEY_FORMULAS_LEGACY, JSON.stringify(legacy));
      }
    } catch {}

    window.dispatchEvent(new CustomEvent('curriculum_data_updated', { detail: { lessonId } }));
  } catch (e) {
    console.error('Failed to reset lesson override', e);
  }
}

/**
 * Lấy danh sách các bài học mới được giáo viên tạo thêm
 */
export function getNewCustomLessons(): LessonType[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_NEW_LESSONS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Tạo bài học mới trong một chương
 */
export function saveNewCustomLesson(newLesson: LessonType): void {
  try {
    const list = getNewCustomLessons();
    const existingIdx = list.findIndex((l) => l.id === newLesson.id);
    if (existingIdx >= 0) {
      list[existingIdx] = newLesson;
    } else {
      list.push(newLesson);
    }
    localStorage.setItem(STORAGE_KEY_NEW_LESSONS, JSON.stringify(list));
    window.dispatchEvent(new CustomEvent('curriculum_data_updated', { detail: { lessonId: newLesson.id } }));
  } catch (e) {
    console.error('Failed to create new custom lesson', e);
  }
}

/**
 * Xóa một bài học do giáo viên tạo mới
 */
export function deleteNewCustomLesson(lessonId: string): void {
  try {
    const list = getNewCustomLessons().filter((l) => l.id !== lessonId);
    localStorage.setItem(STORAGE_KEY_NEW_LESSONS, JSON.stringify(list));
    resetLessonOverride(lessonId);
    window.dispatchEvent(new CustomEvent('curriculum_data_updated', { detail: { lessonId } }));
  } catch (e) {
    console.error('Failed to delete custom lesson', e);
  }
}

/**
 * Áp dụng các thay đổi từ override vào đối tượng LessonType gốc
 */
export function applyLessonOverride(lesson: LessonType): LessonType {
  const override = getLessonOverride(lesson.id);
  if (!override) return lesson;

  return {
    ...lesson,
    name: override.name ?? lesson.name,
    theoryContent: {
      ...lesson.theoryContent,
      summary: override.summary ?? lesson.theoryContent.summary,
      boxedFormulas: override.boxedFormulas ?? lesson.theoryContent.boxedFormulas,
      extraSections: override.extraSections ?? (lesson.theoryContent as any).extraSections ?? [],
    },
    problemTypes: override.problemTypes ?? lesson.problemTypes,
    customQuestions: override.customQuestions ?? lesson.customQuestions,
  };
}

/**
 * Lấy cấu trúc toàn bộ chương trình học (đã gộp các bài học mới & các nội dung tùy chỉnh)
 */
export function getMergedCurriculumData(grade: GradeLevel) {
  const baseChapters = CURRICULUM_DATA[grade] || [];
  const newLessons = getNewCustomLessons().filter((l) => l.grade === grade);

  return baseChapters.map((chapter) => {
    // Các bài học cơ sở đã được override
    const lessons = chapter.lessons.map(applyLessonOverride);
    // Bổ sung các bài học mới do giáo viên thêm vào chương này
    const additionalLessons = newLessons
      .filter((l) => l.chapterId === chapter.id)
      .map(applyLessonOverride);

    return {
      ...chapter,
      lessons: [...lessons, ...additionalLessons],
    };
  });
}

/**
 * Xuất toàn bộ dữ liệu quản trị ra file JSON để sao lưu / chuyển đổi máy
 */
export function exportAdminDataJSON(): string {
  const data = {
    version: '1.0',
    exportDate: new Date().toISOString(),
    overrides: getAllLessonOverrides(),
    newLessons: getNewCustomLessons(),
  };
  return JSON.stringify(data, null, 2);
}

/**
 * Nhập dữ liệu sao lưu từ file JSON
 */
export function importAdminDataJSON(jsonStr: string): boolean {
  try {
    const parsed = JSON.parse(jsonStr);
    if (parsed.overrides) {
      localStorage.setItem(STORAGE_KEY_OVERRIDES, JSON.stringify(parsed.overrides));
    }
    if (Array.isArray(parsed.newLessons)) {
      localStorage.setItem(STORAGE_KEY_NEW_LESSONS, JSON.stringify(parsed.newLessons));
    }
    window.dispatchEvent(new CustomEvent('curriculum_data_updated', { detail: { lessonId: 'all' } }));
    return true;
  } catch (err) {
    console.error('Import failed', err);
    return false;
  }
}
