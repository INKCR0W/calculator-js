// 历史记录管理

import { STORAGE_KEYS, DEFAULT_PREFERENCES } from "../utils/constants.js";
import { StorageService } from "./StorageService.js";

/**
 * @typedef {Object} HistoryItem
 * @property {string} expression - 表达式
 * @property {string} result - 结果
 * @property {number} timestamp - 时间戳
 */

/**
 * HistoryManager类 - 历史记录管理
 * 
 * @class HistoryManager
 * @property {StorageService} storage - 存储服务实例
 * @property {number} maxHistory - 最大历史记录数
 * @property {HistoryItem[]} items - 历史记录项数组
 */
export class HistoryManager {
  /**
   * 创建HistoryManager实例
   * @param {Object} [options] - 配置选项
   * @param {StorageService} [options.storage] - 存储服务实例
   * @param {number} [options.maxHistory] - 最大历史记录数
   */
  constructor(options = {}) {
    this.storage = options.storage || new StorageService();
    this.maxHistory = options.maxHistory || DEFAULT_PREFERENCES.maxHistory;
    this.items = this.load();
  }

  /**
   * 从存储中加载历史记录
   * @returns {HistoryItem[]} 历史记录项数组
   */
  load() {
    const saved = this.storage.get(STORAGE_KEYS.HISTORY, []);
    if (!Array.isArray(saved)) return [];
    return saved;
  }

  /**
   * 保存历史记录到存储
   * @returns {void}
   */
  save() {
    this.storage.set(STORAGE_KEYS.HISTORY, this.items);
  }

  /**
   * 添加历史记录项
   * @param {Object} entry - 历史记录项
   * @param {string} entry.expression - 表达式
   * @param {string} entry.result - 结果
   * @param {number} [entry.timestamp] - 时间戳
   * @returns {HistoryItem} 添加的历史记录项
   */
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

  /**
   * 移除指定时间戳的历史记录项
   * @param {number} timestamp - 时间戳
   * @returns {void}
   */
  remove(timestamp) {
    if (!timestamp) return;
    this.items = this.items.filter((item) => item.timestamp !== timestamp);
    this.save();
  }

  /**
   * 清除所有历史记录
   * @returns {void}
   */
  clear() {
    this.items = [];
    this.save();
  }
}