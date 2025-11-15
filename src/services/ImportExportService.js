import { STORAGE_KEYS, DEFAULT_PREFERENCES, THEMES } from "../utils/constants.js";
import { formatExpression } from "../utils/formatters.js";
import { isValidExpression } from "../utils/validators.js";

const DEFAULT_IMPORT_LIMITS = {
  maxPayloadBytes: 200 * 1024, // 200 KB
  maxHistoryEntries: 500,
  maxPrecision: 100,
};

function computeByteLength(raw) {
  if (typeof raw !== "string") return 0;
  if (typeof TextEncoder !== "undefined") {
    return new TextEncoder().encode(raw).length;
  }
  if (typeof Buffer !== "undefined" && typeof Buffer.byteLength === "function") {
    return Buffer.byteLength(raw, "utf8");
  }
  return raw.length * 2; // 估算 UTF-16
}

export class ImportExportService {
  constructor({ historyManager, preferencesManager, storage, limits } = {}) {
    this.historyManager = historyManager;
    this.preferencesManager = preferencesManager;
    this.storage = storage;
    this.limits = { ...DEFAULT_IMPORT_LIMITS, ...limits };
  }

  createExportPayload() {
    if (!this.historyManager || !this.preferencesManager || !this.storage) {
      throw new Error("ImportExportService 缺少必要依赖");
    }
    return {
      history: this.historyManager.items || [],
      preferences: this.preferencesManager.get(),
      theme: this.storage.get(STORAGE_KEYS.THEME, null),
    };
  }

  createExportJson() {
    return JSON.stringify(this.createExportPayload(), null, 2);
  }

  applyImportFromJson(rawJson) {
    if (!this.historyManager || !this.preferencesManager || !this.storage) {
      throw new Error("ImportExportService 缺少必要依赖");
    }
    const payload = this.parseImportPayload(rawJson);
    const summary = { history: false, preferences: false, theme: false };

    if (payload.history) {
      this.historyManager.items = payload.history;
      if (typeof this.historyManager.save === "function") {
        this.historyManager.save();
      }
      summary.history = true;
    }

    if (payload.preferences) {
      this.preferencesManager.set(payload.preferences);
      summary.preferences = true;
    }

    if (payload.theme) {
      this.storage.set(STORAGE_KEYS.THEME, payload.theme);
      summary.theme = true;
    }

    if (!summary.history && !summary.preferences && !summary.theme) {
      throw new Error("导入数据未包含可应用的内容");
    }

    return summary;
  }

  parseImportPayload(rawJson) {
    if (!rawJson || typeof rawJson !== "string") {
      throw new Error("导入内容不能为空");
    }
    const bytes = computeByteLength(rawJson);
    if (bytes > this.limits.maxPayloadBytes) {
      const limitKb = Math.floor(this.limits.maxPayloadBytes / 1024);
      throw new Error(`导入数据过大，超过 ${limitKb}KB 限制`);
    }

    let data;
    try {
      data = JSON.parse(rawJson);
    } catch (err) {
      throw new Error(`JSON 解析失败：${err.message || err}`);
    }

    if (!data || typeof data !== "object" || Array.isArray(data)) {
      throw new Error("导入内容必须是 JSON 对象");
    }

    const history = this.sanitizeHistory(data.history);
    const preferences = this.sanitizePreferences(data.preferences);
    const theme = this.sanitizeTheme(data.theme);

    if (!history && !preferences && !theme) {
      throw new Error("导入数据缺少 history/preferences/theme 字段");
    }

    return { history, preferences, theme };
  }

  sanitizeHistory(rawHistory) {
    if (typeof rawHistory === "undefined") return null;
    if (!Array.isArray(rawHistory)) {
      throw new Error("history 字段必须是数组");
    }
    const limit = this.getHistoryLimit();
    const normalized = [];
    rawHistory.forEach((item, index) => {
      if (!item || typeof item !== "object") {
        throw new Error(`history 第 ${index + 1} 个条目不是对象`);
      }
      const expression = formatExpression(item.expression);
      const result = item.result != null ? String(item.result).trim() : "";
      if (!expression || !result) {
        throw new Error(`history 第 ${index + 1} 个条目缺少 expression/result`);
      }
      if (!isValidExpression(expression)) {
        throw new Error(`history 第 ${index + 1} 个表达式不合法`);
      }
      const timestampValue = Number(item.timestamp);
      normalized.push({
        expression,
        result,
        timestamp: Number.isFinite(timestampValue) ? timestampValue : Date.now() + index,
      });
    });
    if (!normalized.length) {
      throw new Error("history 数组不能为空");
    }
    return normalized.slice(0, limit);
  }

  sanitizePreferences(rawPrefs) {
    if (typeof rawPrefs === "undefined") return null;
    if (!rawPrefs || typeof rawPrefs !== "object" || Array.isArray(rawPrefs)) {
      throw new Error("preferences 字段必须是对象");
    }
    const sanitized = {};
    const validAngleUnits = ["deg", "rad", "grad"];
    if (rawPrefs.angleUnit && validAngleUnits.includes(rawPrefs.angleUnit)) {
      sanitized.angleUnit = rawPrefs.angleUnit;
    }
    if (typeof rawPrefs.precision === "number" && Number.isFinite(rawPrefs.precision)) {
      const minPrecision = DEFAULT_PREFERENCES.precision;
      const clamped = Math.min(Math.max(Math.floor(rawPrefs.precision), minPrecision), this.limits.maxPrecision);
      sanitized.precision = clamped;
    }
    if (typeof rawPrefs.maxHistory === "number" && Number.isFinite(rawPrefs.maxHistory)) {
      const clamped = Math.min(Math.max(Math.floor(rawPrefs.maxHistory), 1), this.limits.maxHistoryEntries);
      sanitized.maxHistory = clamped;
    }
    const validModes = ["standard", "scientific"];
    if (rawPrefs.mode && validModes.includes(rawPrefs.mode)) {
      sanitized.mode = rawPrefs.mode;
    }
    return Object.keys(sanitized).length ? sanitized : null;
  }

  sanitizeTheme(rawTheme) {
    if (typeof rawTheme === "undefined" || rawTheme === null) return null;
    if (rawTheme === THEMES.LIGHT || rawTheme === THEMES.DARK || rawTheme === THEMES.AUTO) {
      return rawTheme;
    }
    throw new Error("theme 字段必须是 light/dark/auto 之一");
  }

  getHistoryLimit() {
    const preferenceLimit = this.preferencesManager
      ? this.preferencesManager.get().maxHistory || DEFAULT_PREFERENCES.maxHistory
      : DEFAULT_PREFERENCES.maxHistory;
    const normalized = Math.max(1, Math.floor(preferenceLimit));
    return Math.min(normalized, this.limits.maxHistoryEntries);
  }
}
