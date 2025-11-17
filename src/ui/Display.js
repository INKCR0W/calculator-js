// 显示屏组件：负责表达式、结果与错误信息的展示

/**
 * Display类 - 显示屏组件，负责表达式、结果与错误信息的展示
 * 
 * @class Display
 * @property {HTMLElement} root - 根元素
 * @property {HTMLElement} expressionEl - 表达式显示元素
 * @property {HTMLElement} resultEl - 结果显示元素
 * @property {HTMLElement} errorEl - 错误信息显示元素
 */
export class Display {
  /**
   * 创建Display实例
   * @param {HTMLElement} root - 根元素
   */
  constructor(root) {
    this.root = root;
    this.expressionEl = root.querySelector("[data-role='expression']");
    this.resultEl = root.querySelector("[data-role='result']");
    this.errorEl = root.querySelector("[data-role='error']");
  }

  /**
   * 设置表达式显示内容
   * @param {string} text - 表达式文本
   * @returns {void}
   */
  setExpression(text) {
    if (this.expressionEl) {
      this.expressionEl.textContent = text || "0";
    }
  }

  /**
   * 设置结果显示内容
   * @param {string} value - 结果值
   * @returns {void}
   */
  setResult(value) {
    if (this.resultEl) {
      this.resultEl.textContent = value === "" || value === null || value === undefined ? "" : String(value);
    }
  }

  /**
   * 设置错误信息显示内容
   * @param {string} message - 错误信息
   * @returns {void}
   */
  setError(message) {
    if (this.errorEl) {
      this.errorEl.textContent = message || "";
      this.errorEl.hidden = !message;
    }
    if (message) {
      this.root.classList.add("has-error");
    } else {
      this.root.classList.remove("has-error");
    }
  }

  /**
   * 绑定表达式输入事件
   * @param {Function} onChange - 输入变化回调函数
   * @returns {void}
   */
  // 绑定表达式输入事件：用于 contenteditable 区域手动输入时同步外部状态
  bindExpressionInput(onChange) {
    if (!this.expressionEl || typeof onChange !== "function") return;
    this.expressionEl.addEventListener("input", () => {
      onChange(this.expressionEl.textContent || "");
    });
  }
}