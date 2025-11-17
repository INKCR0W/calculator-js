import { Calculator } from "../core/Calculator.js";
import { StorageService } from "../services/StorageService.js";
import { PreferencesManager } from "../services/PreferencesManager.js";
import { ExpressionStore } from "../services/ExpressionStore.js";
import { HistoryManager } from "../services/HistoryManager.js";
import { ThemeManager } from "../services/ThemeManager.js";
import { ImportExportService } from "../services/ImportExportService.js";
import { Decimal } from "../core/decimal-config.js";
import { formatExpression, formatNumber } from "../utils/formatters.js";
import { validateExpression } from "../utils/validators.js";
import { BUTTON_LAYOUTS, DEFAULT_MODE, DEFAULT_PREFERENCES } from "../utils/constants.js";

/**
 * AppController类 - 应用控制器，协调各组件工作
 * 
 * @class AppController
 * @property {StorageService} storage - 存储服务实例
 * @property {PreferencesManager} preferencesManager - 偏好管理器实例
 * @property {Calculator} calculator - 计算器实例
 * @property {ExpressionStore} expressionStore - 表达式存储实例
 * @property {HistoryManager} historyManager - 历史记录管理器实例
 * @property {ThemeManager} themeManager - 主题管理器实例
 * @property {ImportExportService} importExportService - 导入导出服务实例
 * @property {string} currentMode - 当前模式（standard|scientific）
 * @property {boolean} scientificSecondMode - 科学计算器第二功能模式状态
 */
export class AppController {
  /**
   * 创建AppController实例
   */
  constructor() {
    this.storage = new StorageService();
    this.preferencesManager = new PreferencesManager({ storage: this.storage });
    this.calculator = new Calculator({ preferences: this.preferencesManager.get() });
    this.expressionStore = new ExpressionStore({ calculator: this.calculator });
    this.historyManager = new HistoryManager({ storage: this.storage });
    this.themeManager = new ThemeManager({ storage: this.storage });
    this.importExportService = new ImportExportService({
      historyManager: this.historyManager,
      preferencesManager: this.preferencesManager,
      storage: this.storage,
    });
    this.currentMode = this.preferencesManager.get().mode || DEFAULT_MODE;
    this.scientificSecondMode = false;
  }

  /**
   * 获取所有服务实例
   * @returns {Object} 包含所有服务实例的对象
   */
  getServices() {
    return {
      storage: this.storage,
      preferencesManager: this.preferencesManager,
      calculator: this.calculator,
      expressionStore: this.expressionStore,
      historyManager: this.historyManager,
      themeManager: this.themeManager,
      importExportService: this.importExportService,
    };
  }

  /**
   * 设置计算器模式
   * @param {string} mode - 模式（standard|scientific）
   * @returns {void}
   */
  setMode(mode) {
    this.currentMode = mode || DEFAULT_MODE;
    if (this.currentMode !== "scientific") {
      this.scientificSecondMode = false;
    }
  }

  /**
   * 获取当前模式
   * @returns {string} 当前模式
   */
  getCurrentMode() {
    return this.currentMode;
  }

  /**
   * 切换科学计算器第二功能模式
   * @returns {boolean} 切换后的状态
   */
  toggleScientificSecond() {
    this.scientificSecondMode = !this.scientificSecondMode;
    return this.scientificSecondMode;
  }

  /**
   * 获取当前按钮布局
   * @returns {Array} 按钮布局数组
   */
  getLayout() {
    const layoutDef = BUTTON_LAYOUTS[this.currentMode] || BUTTON_LAYOUTS[DEFAULT_MODE];
    if (typeof layoutDef === "function") {
      return layoutDef({ secondMode: this.scientificSecondMode });
    }
    return layoutDef;
  }

  /**
   * 刷新偏好设置
   * @param {Object} [partial] - 部分偏好设置
   * @returns {void}
   */
  refreshPreferences(partial) {
    if (partial) {
      this.preferencesManager.set(partial);
    }
    this.calculator.setPreferences(this.preferencesManager.get());
  }

  /**
   * 添加输入内容
   * @param {string} value - 要添加的值
   * @returns {void}
   */
  handleInputAppend(value) {
    this.expressionStore.append(value);
  }

  /**
   * 删除最后一个字符
   * @returns {void}
   */
  handleDelete() {
    this.expressionStore.deleteLast();
  }

  /**
   * 清除当前输入
   * @returns {void}
   */
  handleClearEntry() {
    this.expressionStore.clearEntry();
  }

  /**
   * 清除表达式
   * @returns {void}
   */
  handleClearExpression() {
    this.expressionStore.clearExpression();
  }

  /**
   * 全部清除（表达式和历史记录）
   * @returns {void}
   */
  handleClearAll() {
    this.expressionStore.clearExpression();
    this.historyManager.clear();
  }

  /**
   * 切换最后数字的符号
   * @returns {boolean} 是否成功切换
   */
  handleToggleSign() {
    return this.expressionStore.toggleLastNumberSign();
  }

  /**
   * 应用百分比转换
   * @returns {Object} 操作结果
   */
  handlePercent() {
    return this.expressionStore.applyPercent();
  }

  /**
   * 处理内存操作
   * @param {string} action - 内存操作类型
   * @returns {Object} 操作结果
   */
  handleMemoryAction(action) {
    return this.expressionStore.handleMemoryAction(action);
  }

  /**
   * 获取内存指示器文本
   * @returns {string} 内存指示器文本
   */
  getMemoryIndicator() {
    const value = this.expressionStore.getMemoryValue();
    if (value instanceof Decimal) {
      return `内存：${formatNumber(value)}`;
    }
    return "内存：空";
  }

  /**
   * 计算表达式
   * @returns {Object} 计算结果
   */
  evaluateExpression() {
    const expr = formatExpression(this.expressionStore.getExpression());
    if (!expr) {
      return { ok: false, error: "" };
    }
    const validation = validateExpression(expr);
    if (!validation.ok) {
      return { ok: false, error: validation.error };
    }
    const result = this.calculator.evaluate(expr);
    if (!result.ok) {
      return { ok: false, error: result.error || "计算出错" };
    }
    const formatted = formatNumber(result.value);
    this.expressionStore.setLastResult(result.value);
    const historyItem = this.historyManager.add({ expression: expr, result: formatted });
    return { ok: true, formatted, historyTimestamp: historyItem.timestamp };
  }

  /**
   * 创建导出JSON数据
   * @returns {string} JSON格式的导出数据
   */
  createExportJson() {
    return this.importExportService.createExportJson();
  }

  /**
   * 应用导入的JSON数据
   * @param {string} json - JSON格式的导入数据
   * @returns {Object} 导入结果摘要
   */
  applyImport(json) {
    return this.importExportService.applyImportFromJson(json);
  }
}