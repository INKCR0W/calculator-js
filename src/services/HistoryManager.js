// 历史记录管理

import { STORAGE_KEYS, DEFAULT_PREFERENCES } from "../utils/constants.js";
import { StorageService } from "./StorageService.js";

export class HistoryManager {
  constructor(options = {}) {
    this.storage = options.storage || new StorageService();
    this.maxHistory = options.maxHistory || DEFAULT_PREFERENCES.maxHistory;
    this.items = this.load();
  }

  load() {
    const saved = this.storage.get(STORAGE_KEYS.HISTORY, []);
    if (!Array.isArray(saved)) return [];
    return saved;
  }

  save() {
    this.storage.set(STORAGE_KEYS.HISTORY, this.items);
  }

  add(entry) {
    const normalized = {
      expression: String(entry.expression || ""),
      result: String(entry.result || ""),
      timestamp: entry.timestamp || Date.now(),
    };
    this.items.unshift(normalized);
    if (this.items.length > this.maxHistory) {
      this.items.length = this.maxHistory;
    }
    this.save();
    return normalized;
  }

  remove(timestamp) {
    if (!timestamp) return;
    this.items = this.items.filter((item) => item.timestamp !== timestamp);
    this.save();
  }

  clear() {
    this.items = [];
    this.save();
  }
}
