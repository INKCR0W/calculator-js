// 用户偏好管理：角度单位、精度等

import { DEFAULT_PREFERENCES, STORAGE_KEYS } from "../utils/constants.js";
import { StorageService } from "./StorageService.js";

export class PreferencesManager {
  constructor({ storage } = {}) {
    this.storage = storage || new StorageService();
    this.preferences = this.load();
  }

  load() {
    const saved = this.storage.get(STORAGE_KEYS.PREFERENCES, null);
    if (!saved || typeof saved !== "object") return { ...DEFAULT_PREFERENCES };

    const prefs = { ...DEFAULT_PREFERENCES, ...saved };

    if (typeof prefs.precision === "number" && prefs.precision < DEFAULT_PREFERENCES.precision) {
      prefs.precision = DEFAULT_PREFERENCES.precision;
      this.storage.set(STORAGE_KEYS.PREFERENCES, prefs);
    }

    return prefs;
  }

  get() {
    return { ...this.preferences }; // 返回副本，避免外部直接修改
  }

  set(partial) {
    this.preferences = { ...this.preferences, ...partial };
    this.storage.set(STORAGE_KEYS.PREFERENCES, this.preferences);
  }
}
