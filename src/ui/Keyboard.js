// 键盘组件：渲染按钮并将点击事件转化为高层事件

/**
 * @typedef {Object} ButtonConfig
 * @property {string} type - 按钮类型
 * @property {string} label - 按钮标签
 * @property {string} value - 按钮值
 * @property {number} [span] - 跨列数
 * @property {boolean} [active] - 是否激活状态
 * @property {boolean} [disabled] - 是否禁用
 */

/**
 * @typedef {Object} LayoutRow
 * @property {ButtonConfig[]} buttons - 按钮配置数组
 */

/**
 * Keyboard类 - 键盘组件，渲染按钮并将点击事件转化为高层事件
 * 
 * @class Keyboard
 * @property {HTMLElement} root - 根元素
 * @property {Function} onButtonPress - 按钮按下回调函数
 * @property {Function} getLayout - 获取布局函数
 * @property {Function} mapKey - 键盘映射函数
 */
export class Keyboard {
  /**
   * 创建Keyboard实例
   * @param {HTMLElement} root - 根元素
   * @param {Object} [options] - 配置选项
   * @param {Function} [options.onButtonPress] - 按钮按下回调函数
   * @param {Function} [options.getLayout] - 获取布局函数
   * @param {Function} [options.mapKey] - 键盘映射函数
   */
  constructor(root, { onButtonPress, getLayout, mapKey } = {}) {
    this.root = root;
    this.onButtonPress = onButtonPress;
    this.getLayout = typeof getLayout === "function" ? getLayout : () => [];
    this.mapKey = typeof mapKey === "function" ? mapKey : null;
    this.render();
    this.bindKeyboardEvents();
  }

  /**
   * 渲染键盘界面
   * @returns {void}
   */
  render() {
    if (!this.root) return;
    this.root.innerHTML = "";
    const layout = this.getLayout();
    if (!layout || layout.length === 0) return;

    layout.forEach((row) => {
      const rowButtons = Array.isArray(row) ? row : row.buttons || [];
      const rowEl = document.createElement("div");
      rowEl.className = "keyboard-row";
      const columns = rowButtons.length || 4;
      rowEl.style.setProperty("--columns", columns);

      rowButtons.forEach((btn) => {
        const buttonEl = document.createElement("button");
        const typeClass = btn.type ? ` key-${btn.type}` : "";
        buttonEl.className = `key${typeClass}`;
        buttonEl.textContent = btn.label;
        buttonEl.dataset.type = btn.type;
        buttonEl.dataset.value = btn.value;
        if (btn.span) {
          buttonEl.style.gridColumn = `span ${btn.span}`;
        }
        if (btn.active) {
          buttonEl.classList.add("key--active");
        }
        if (btn.disabled) {
          buttonEl.disabled = true;
        }
        buttonEl.addEventListener("click", () => {
          this.emit(btn.type, btn.value);
        });
        rowEl.appendChild(buttonEl);
      });
      this.root.appendChild(rowEl);
    });
  }

  /**
   * 当模式或布局切换时，外部可以调用该方法重新渲染键盘
   * @returns {void}
   */
  setLayout() {
    this.render();
  }

  /**
   * 发出按钮按下事件
   * @param {string} type - 按钮类型
   * @param {string} value - 按钮值
   * @returns {void}
   */
  emit(type, value) {
    if (typeof this.onButtonPress === "function") {
      this.onButtonPress({ type, value });
    }
  }

  /**
   * 绑定键盘事件
   * @returns {void}
   */
  bindKeyboardEvents() {
    window.addEventListener("keydown", (event) => {
      const { key, target } = event;

      const active = target || document.activeElement;
      const tag = active && active.tagName;
      const isEditable =
        active &&
        (active.isContentEditable || tag === "INPUT" || tag === "TEXTAREA");

      if (isEditable) {
        if (key === "Enter" || key === "=") {
          event.preventDefault();
          this.emit("action", "equals");
        } else if (key === "Escape") {
          this.emit("action", "clear-expression");
        }
        return;
      }

      if (this.mapKey) {
        const mapped = this.mapKey({ key, event });
        if (mapped && mapped.type && mapped.value) {
          event.preventDefault();
          this.emit(mapped.type, mapped.value);
          return;
        }
      }

      if (/^[0-9]$/.test(key)) {
        this.emit("digit", key);
        return;
      }
      if (key === ".") {
        this.emit("action", ".");
        return;
      }
      if (["+", "-", "*", "/", "%"].includes(key)) {
        this.emit("operator", key);
        return;
      }
      if (key === "Enter" || key === "=") {
        event.preventDefault();
        this.emit("action", "equals");
        return;
      }
      if (key === "Backspace") {
        this.emit("action", "delete");
        return;
      }
      if (key === "Escape") {
        this.emit("action", "clear-entry");
        return;
      }

      if (key === "(" || key === ")") {
        this.emit("action", key);
        return;
      }

      if (key === "!") {
        this.emit("postfix", "!");
      }
    });
  }
}