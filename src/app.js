// 应用入口：组装各个组件

import { Display } from "./ui/Display.js";
import { Keyboard } from "./ui/Keyboard.js";
import { HistoryView } from "./ui/History.js";
import { ThemeToggle } from "./ui/ThemeToggle.js";
import { AngleUnitToggle } from "./ui/AngleUnitToggle.js";
import { ModeToggle } from "./ui/ModeToggle.js";
import { AppController } from "./controllers/AppController.js";

import { DEFAULT_MODE } from "./utils/constants.js";

/**
 * 创建应用实例并初始化各组件
 * @returns {void}
 */
function createApp() {
  const controller = new AppController();
  const { preferencesManager, expressionStore, historyManager } = controller.getServices();

  const displayRoot = document.querySelector("[data-component='display']");
  const keyboardRoot = document.querySelector("[data-component='keyboard']");
  const historyRoot = document.querySelector("[data-component='history']");
  const themeRoot = document.querySelector("[data-component='theme-toggle']");
  const angleRoot = document.querySelector("[data-component='angle-toggle']");
  const modeRoot = document.querySelector("[data-component='mode-toggle']");
  const modeLabelEl = document.querySelector("[data-role='mode-label']");
  const memoryIndicatorEl = document.querySelector("[data-role='memory-indicator']");

  const display = new Display(displayRoot);
  const historyView = new HistoryView(historyRoot, {
    onSelect: (item) => {
      expressionStore.setExpressionFromHistory(item.expression);
      syncExpressionDisplay();
      display.setResult(item.result);
      display.setError("");
    },
    onDelete: (timestamp) => {
      historyManager.remove(timestamp);
      refreshHistory();
    },
  });


  new ThemeToggle(themeRoot, { themeManager: controller.getServices().themeManager });


  new AngleUnitToggle(angleRoot, {
    preferencesManager,
    onChange: (angleUnit) => {
      controller.refreshPreferences({ angleUnit });
    },
  });

  /** @type {Keyboard|null} */
  let keyboard = null;

  /**
   * 同步表达式显示
   * @returns {void}
   */
  function syncExpressionDisplay() {
    display.setExpression(expressionStore.getExpression() || "0");
  }

  /**
   * 刷新历史记录显示
   * @param {number} [highlightId] - 高亮项ID
   * @returns {void}
   */
  function refreshHistory(highlightId) {
    historyView.render(historyManager.items, { highlightId });
  }

  /**
   * 更新模式标签显示
   * @returns {void}
   */
  function updateModeLabel() {
    if (!modeLabelEl) return;
    modeLabelEl.textContent = controller.getCurrentMode() === "scientific" ? "科学" : "标准";
  }

  /**
   * 更新内存指示器显示
   * @returns {void}
   */
  function updateMemoryIndicator() {
    if (!memoryIndicatorEl) return;
    memoryIndicatorEl.textContent = controller.getMemoryIndicator();
  }

  /**
   * 处理动作类型按钮
   * @param {string} value - 动作值
   * @returns {void}
   */
  function handleAction(value) {
    switch (value) {
      case "all-clear":
        controller.handleClearAll();
        syncExpressionDisplay();
        refreshHistory();
        break;
      case "clear-entry":
        controller.handleClearEntry();
        syncExpressionDisplay();
        display.setResult("");
        display.setError("");
        break;
      case "clear-expression":
      case "clear":
        controller.handleClearExpression();
        syncExpressionDisplay();
        display.setResult("");
        display.setError("");
        break;
      case "delete":
        controller.handleDelete();
        syncExpressionDisplay();
        break;
      case "equals":
        {
          const outcome = controller.evaluateExpression();
          if (!outcome.ok) {
            display.setError(outcome.error || "表达式不合法或括号不匹配");
            return;
          }
          display.setResult(outcome.formatted);
          display.setError("");
          refreshHistory(outcome.historyTimestamp);
        }
        break;
      case "toggle-second":
        controller.toggleScientificSecond();
        if (keyboard) {
          keyboard.setLayout();
        }
        break;
      case "negate":
        controller.handleToggleSign();
        syncExpressionDisplay();
        break;
      case "percent":
        {
          const result = controller.handlePercent();
          if (!result.ok) {
            if (result.error) display.setError(result.error);
            return;
          }
          syncExpressionDisplay();
          display.setError("");
        }
        break;
      case "(":
      case ")":
      case ".":
        controller.handleInputAppend(value);
        syncExpressionDisplay();
        display.setError("");
        break;
      default:
        break;
    }
  }

  /**
   * 处理内存操作
   * @param {string} action - 内存操作类型
   * @returns {void}
   */
  function handleMemory(action) {
    const result = controller.handleMemoryAction(action);
    if (!result.ok) {
      if (result.error) display.setError(result.error);
      return;
    }
    if (result.shouldClearResult) {
      display.setResult("");
    }
    display.setError("");
    syncExpressionDisplay();
    updateMemoryIndicator();
  }

  display.bindExpressionInput((text) => {
    expressionStore.setExpression(text);
  });

  /**
   * 导出数据
   * @returns {void}
   */
  function exportData() {
    try {
      const json = controller.createExportJson();
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(json).then(() => {

          alert("配置已复制到剪贴板，可保存为 .json 文件");
        }).catch(() => {

          alert(json);
        });
      } else {

        alert(json);
      }
    } catch (err) {

      alert(`导出失败: ${err.message || err}`);
    }
  }

  /**
   * 导入数据
   * @returns {void}
   */
  function importData() {
    const json = window.prompt("粘贴导出的 JSON 配置：");
    if (!json) return;
    try {
      const summary = controller.applyImport(json);
      const applied = [
        summary.history ? "历史" : null,
        summary.preferences ? "偏好" : null,
        summary.theme ? "主题" : null,
      ].filter(Boolean);
      const message = applied.length ? `已导入：${applied.join("、")}` : "导入完成";

      alert(`${message}，页面将刷新以应用新配置。`);
      window.location.reload();
    } catch (err) {

      alert(`导入失败: ${err.message || err}`);
    }
  }

  /**
   * 处理按钮按下事件
   * @param {Object} param - 事件参数
   * @param {string} param.type - 按钮类型
   * @param {string} param.value - 按钮值
   * @returns {void}
   */
  function handleButtonPress({ type, value }) {
    if (type === "digit" || type === "operator" || type === "postfix") {
      controller.handleInputAppend(value);
      syncExpressionDisplay();
      display.setError("");
      return;
    }
    if (type === "function") {
      controller.handleInputAppend(`${value}(`);
      syncExpressionDisplay();
      display.setError("");
      return;
    }
    if (type === "constant") {
      controller.handleInputAppend(value === "pi" ? "pi" : "e");
      syncExpressionDisplay();
      display.setError("");
      return;
    }
    if (type === "memory") {
      handleMemory(value);
      return;
    }
    if (type === "action") {
      handleAction(value);
    }
  }

  keyboard = new Keyboard(keyboardRoot, {
    getLayout: () => controller.getLayout(),
    onButtonPress: handleButtonPress,
    mapKey: ({ key }) => {
      if (key === "%" && controller.getCurrentMode() === "standard") {
        return { type: "action", value: "percent" };
      }
      return null;
    },
  });


  new ModeToggle(modeRoot, {
    preferencesManager,
    onChange: (mode) => {
      controller.setMode(mode || DEFAULT_MODE);
      controller.refreshPreferences({ mode });
      updateModeLabel();
      if (keyboard) {
        keyboard.setLayout();
      }
    },
  });

  updateModeLabel();
  syncExpressionDisplay();
  display.setResult("");
  display.setError("");
  refreshHistory();
  updateMemoryIndicator();

  const exportBtn = document.querySelector("[data-action='export-data']");
  const importBtn = document.querySelector("[data-action='import-data']");
  const clearHistoryBtn = document.querySelector("[data-action='clear-history']");

  if (exportBtn) {
    exportBtn.addEventListener("click", exportData);
  }
  if (importBtn) {
    importBtn.addEventListener("click", importData);
  }
  if (clearHistoryBtn) {
    clearHistoryBtn.addEventListener("click", () => {
      controller.handleClearAll();
      syncExpressionDisplay();
      refreshHistory();
    });
  }
}

window.addEventListener("DOMContentLoaded", () => {
  createApp();
});