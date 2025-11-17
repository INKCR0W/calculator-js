// 主题管理

import { STORAGE_KEYS, THEMES } from "../utils/constants.js";
import { StorageService } from "./StorageService.js";

export { THEMES };

/**
 * ThemeManager类 - 主题管理
 * 
 * @class ThemeManager
 * @property {StorageService} storage - 存储服务实例
 * @property {string} currentTheme - 当前主题
 */
export class ThemeManager {
  /**
   * 创建ThemeManager实例
   * @param {Object} [options] - 配置选项
   * @param {StorageService} [options.storage] - 存储服务实例
   */
  constructor(options = {}) {
    this.storage = options.storage || new StorageService();
    this.currentTheme = this.loadTheme();
    this.applyTheme(this.currentTheme);
  }

  /**
   * 从存储中加载主题设置
   * @returns {string} 主题设置
   */
  loadTheme() {
    const saved = this.storage.get(STORAGE_KEYS.THEME, THEMES.AUTO);
    if (saved === THEMES.LIGHT || saved === THEMES.DARK || saved === THEMES.AUTO) {
      return saved;
    }
    return THEMES.AUTO;
  }

  /**
   * 检测系统主题
   * @returns {string} 系统主题
   */
  detectSystemTheme() {
    if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      return THEMES.DARK;
    }
    return THEMES.LIGHT;
  }

  /**
   * 获取有效的主题
   * @returns {string} 有效主题
   */
  effectiveTheme() {
    if (this.currentTheme === THEMES.AUTO) {
      return this.detectSystemTheme();
    }
    return this.currentTheme;
  }

  /**
   * 获取当前主题
   * @returns {string} 当前主题
   */
  getTheme() {
    return this.currentTheme;
  }

  /**
   * 应用主题
   * @param {string} theme - 主题
   * @returns {void}
   */
  applyTheme(theme) {
    this.currentTheme = theme;
    const effective = this.effectiveTheme();
    document.documentElement.setAttribute("data-theme", effective);
    this.storage.set(STORAGE_KEYS.THEME, theme);
  }

  /**
   * 设置主题
   * @param {string} theme - 主题
   * @returns {void}
   */
  setTheme(theme) {
    if (theme === THEMES.LIGHT || theme === THEMES.DARK || theme === THEMES.AUTO) {
      this.applyTheme(theme);
      return;
    }
    this.applyTheme(THEMES.AUTO);
  }

  /**
   * 切换主题
   * @returns {void}
   */
  toggle() {
    const next = this.currentTheme === THEMES.LIGHT ? THEMES.DARK : THEMES.LIGHT;
    this.setTheme(next);
  }
}