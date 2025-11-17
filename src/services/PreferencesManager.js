// 用户偏好管理：角度单位、精度等

import { DEFAULT_PREFERENCES, STORAGE_KEYS } from "../utils/constants.js";
import { StorageService } from "./StorageService.js";

/**
 * PreferencesManager类 - 用户偏好管理
 * 
 * @class PreferencesManager
 * @property {StorageService} storage - 存储服务实例
 * @property {Object} preferences - 偏好设置
 */
export class PreferencesManager {
  /**
   * 创建PreferencesManager实例
   * @param {Object} [options] - 配置选项
   * @param {StorageService} [options.storage] - 存储服务实例
   */
  constructor({ storage } = {}) {
    this.storage = storage || new StorageService();
    this.preferences = this.load();
  }

  /**
   * 从存储中加载偏好设置
   * @returns {Object} 偏好设置
   */
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

  /**
   * 获取偏好设置副本
   * @returns {Object} 偏好设置副本
   */
  get() {
    return { ...this.preferences }; // 返回副本，避免外部直接修改
  }

  /**
   * 设置偏好设置
   * @param {Object} partial - 部分偏好设置
   * @returns {void}
   */
  set(partial) {
    this.preferences = { ...this.preferences, ...partial };
    this.storage.set(STORAGE_KEYS.PREFERENCES, this.preferences);
  }
}