// 主题管理

import { STORAGE_KEYS, THEMES } from "../utils/constants.js";
import { StorageService } from "./StorageService.js";

export { THEMES };

export class ThemeManager {
  constructor(options = {}) {
    this.storage = options.storage || new StorageService();
    this.currentTheme = this.loadTheme();
    this.applyTheme(this.currentTheme);
  }

  loadTheme() {
    const saved = this.storage.get(STORAGE_KEYS.THEME, THEMES.AUTO);
    if (saved === THEMES.LIGHT || saved === THEMES.DARK || saved === THEMES.AUTO) {
      return saved;
    }
    return THEMES.AUTO;
  }

  detectSystemTheme() {
    if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      return THEMES.DARK;
    }
    return THEMES.LIGHT;
  }

  effectiveTheme() {
    if (this.currentTheme === THEMES.AUTO) {
      return this.detectSystemTheme();
    }
    return this.currentTheme;
  }

  getTheme() {
    return this.currentTheme;
  }

  applyTheme(theme) {
    this.currentTheme = theme;
    const effective = this.effectiveTheme();
    document.documentElement.setAttribute("data-theme", effective);
    this.storage.set(STORAGE_KEYS.THEME, theme);
  }

  setTheme(theme) {
    if (theme === THEMES.LIGHT || theme === THEMES.DARK || theme === THEMES.AUTO) {
      this.applyTheme(theme);
      return;
    }
    this.applyTheme(THEMES.AUTO);
  }

  toggle() {
    const next = this.currentTheme === THEMES.LIGHT ? THEMES.DARK : THEMES.LIGHT;
    this.setTheme(next);
  }
}
