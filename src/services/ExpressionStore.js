// 表达式与内存状态管理

import { Decimal } from "../core/decimal-config.js";
import { formatExpression } from "../utils/formatters.js";
import { isValidExpression } from "../utils/validators.js";

/**
 * ExpressionStore类 - 表达式与内存状态管理
 * 
 * @class ExpressionStore
 * @property {Calculator} calculator - 计算器实例
 * @property {string} expression - 当前表达式
 * @property {Decimal|null} lastResultValue - 上次计算结果
 * @property {Decimal|null} memoryValue - 内存值
 */
export class ExpressionStore {
  /**
   * 创建ExpressionStore实例
   * @param {Object} [options] - 配置选项
   * @param {Calculator} [options.calculator] - 计算器实例
   */
  constructor({ calculator } = {}) {
    this.calculator = calculator;
    this.expression = "";
    this.lastResultValue = null;
    this.memoryValue = null;
  }

  /**
   * 获取当前表达式
   * @returns {string} 当前表达式
   */
  getExpression() {
    return this.expression;
  }

  /**
   * 设置表达式
   * @param {string} value - 表达式值
   * @returns {void}
   */
  setExpression(value) {
    this.expression = String(value || "");
    this.lastResultValue = null;
  }

  /**
   * 追加内容到表达式
   * @param {string} token - 要追加的内容
   * @returns {void}
   */
  append(token) {
    this._resetLastResult();
    this.expression += token;
  }

  /**
   * 删除表达式最后一个字符
   * @returns {void}
   */
  deleteLast() {
    this._resetLastResult();
    this.expression = this.expression.slice(0, -1);
  }

  /**
   * 清除整个表达式
   * @returns {void}
   */
  clearExpression() {
    this.expression = "";
    this._resetLastResult();
  }

  /**
   * 清除当前输入项
   * @returns {void}
   */
  clearEntry() {
    this._resetLastResult();
    const bounds = this._getLastEntryBounds();
    if (!bounds) {
      this.clearExpression();
      return;
    }
    this.expression = this.expression.slice(0, bounds.start);
  }

  /**
   * 切换最后数字的符号
   * @returns {boolean} 是否成功切换
   */
  toggleLastNumberSign() {
    this._resetLastResult();
    const bounds = this._getLastEntryBounds();
    if (!bounds) return false;
    const segment = this.expression.slice(bounds.start, bounds.end);
    if (!segment) return false;
    const toggled = segment.startsWith("-") ? segment.slice(1) : `-${segment}`;
    this.expression = `${this.expression.slice(0, bounds.start)}${toggled}${this.expression.slice(bounds.end)}`;
    return true;
  }

  /**
   * 应用百分比转换
   * @returns {Object} 操作结果
   */
  applyPercent() {
    const bounds = this._getLastEntryBounds();
    if (!bounds) {
      return { ok: false, error: "无可转换的数字" };
    }
    const segment = this.expression.slice(bounds.start, bounds.end);
    if (!segment) {
      return { ok: false, error: "无可转换的数字" };
    }

    let percentValue;
    try {
      percentValue = new Decimal(segment);
    } catch (err) {
      return { ok: false, error: "当前数字不可转换为百分比" };
    }

    const opIndex = this._findLastTopLevelOperatorIndex(bounds.start);
    let replacement;
    if (opIndex === -1) {
      replacement = percentValue.div(100);
    } else {
      const operand = this._extractOperandBefore(opIndex);
      let baseValue = null;
      if (operand) {
        const formatted = formatExpression(operand);
        if (formatted && isValidExpression(formatted)) {
          const evaluated = this.calculator.evaluate(formatted);
          if (evaluated.ok) {
            baseValue = evaluated.value;
          }
        }
      }
      if (!baseValue) {
        replacement = percentValue.div(100);
      } else {
        replacement = baseValue.mul(percentValue).div(100);
      }
    }

    this._replaceLastEntry(bounds, replacement.toString());
    return { ok: true, expression: this.expression };
  }

  /**
   * 获取当前输入项的Decimal值
   * @returns {Decimal|null} Decimal值或null
   */
  getCurrentEntryDecimal() {
    if (this.lastResultValue instanceof Decimal) {
      return this.lastResultValue;
    }
    const bounds = this._getLastEntryBounds();
    if (bounds) {
      const segment = this.expression.slice(bounds.start, bounds.end);
      const parsed = this._parseDecimal(segment);
      if (parsed) return parsed;
    }
    const expr = formatExpression(this.expression);
    if (expr && isValidExpression(expr)) {
      const evaluated = this.calculator.evaluate(expr);
      if (evaluated.ok) {
        return evaluated.value;
      }
    }
    return null;
  }

  /**
   * 设置上次计算结果
   * @param {Decimal|number} value - 结果值
   * @returns {void}
   */
  setLastResult(value) {
    if (value instanceof Decimal) {
      this.lastResultValue = value;
    } else if (value != null) {
      this.lastResultValue = new Decimal(value);
    } else {
      this.lastResultValue = null;
    }
  }

  /**
   * 获取上次计算结果
   * @returns {Decimal|null} 上次计算结果
   */
  getLastResult() {
    return this.lastResultValue;
  }

  /**
   * 处理内存操作
   * @param {string} action - 内存操作类型
   * @returns {Object} 操作结果
   */
  handleMemoryAction(action) {
    switch (action) {
      case "memory-clear":
        this.memoryValue = null;
        return { ok: true, cleared: true };
      case "memory-store":
        return this._memoryStore();
      case "memory-plus":
        return this._memoryPlus();
      case "memory-minus":
        return this._memoryMinus();
      case "memory-recall":
        return this._memoryRecall();
      default:
        return { ok: false };
    }
  }

  /**
   * 获取内存值
   * @returns {Decimal|null} 内存值
   */
  getMemoryValue() {
    return this.memoryValue;
  }

  /**
   * 从历史记录设置表达式
   * @param {string} expression - 表达式
   * @returns {void}
   */
  setExpressionFromHistory(expression) {
    this.expression = String(expression || "");
    this.lastResultValue = null;
  }

  /**
   * 内存存储操作
   * @returns {Object} 操作结果
   */
  _memoryStore() {
    const value = this.getCurrentEntryDecimal();
    if (!value) {
      return { ok: false, error: "没有可存储的数值" };
    }
    this.memoryValue = value;
    return { ok: true };
  }

  /**
   * 内存加法操作
   * @returns {Object} 操作结果
   */
  _memoryPlus() {
    const value = this.getCurrentEntryDecimal();
    if (!value) {
      return { ok: false, error: "没有可用于内存加法的数值" };
    }
    this.memoryValue = this.memoryValue instanceof Decimal ? this.memoryValue.plus(value) : value;
    return { ok: true };
  }

  /**
   * 内存减法操作
   * @returns {Object} 操作结果
   */
  _memoryMinus() {
    const value = this.getCurrentEntryDecimal();
    if (!value) {
      return { ok: false, error: "没有可用于内存减法的数值" };
    }
    this.memoryValue = this.memoryValue instanceof Decimal ? this.memoryValue.minus(value) : value.neg();
    return { ok: true };
  }

  /**
   * 内存调用操作
   * @returns {Object} 操作结果
   */
  _memoryRecall() {
    if (!(this.memoryValue instanceof Decimal)) {
      return { ok: false, error: "内存为空" };
    }
    const replacement = this.memoryValue.toString();
    let shouldClearResult = false;
    if (this.lastResultValue instanceof Decimal) {
      this.expression = replacement;
      this.lastResultValue = null;
      shouldClearResult = true;
    } else {
      const bounds = this._getLastEntryBounds();
      if (bounds) {
        this._replaceLastEntry(bounds, replacement);
      } else {
        this.append(replacement);
      }
    }
    return { ok: true, shouldClearResult };
  }

  /**
   * 解析Decimal值
   * @param {string} segment - 字符串片段
   * @returns {Decimal|null} Decimal值或null
   */
  _parseDecimal(segment) {
    if (!segment) return null;
    try {
      return new Decimal(segment);
    } catch (err) {
      return null;
    }
  }

  /**
   * 重置上次结果
   * @returns {void}
   */
  _resetLastResult() {
    this.lastResultValue = null;
  }

  /**
   * 获取最后输入项的边界位置
   * @returns {Object|null} 边界位置对象或null
   */
  _getLastEntryBounds() {
    if (!this.expression) return null;
    let end = this.expression.length - 1;
    while (end >= 0 && this.expression[end] === " ") {
      end -= 1;
    }
    if (end < 0) return null;
    const allowed = /[0-9a-zA-Z.]/;
    if (!allowed.test(this.expression[end])) {
      return null;
    }
    let start = end;
    while (start >= 0 && allowed.test(this.expression[start])) {
      start -= 1;
    }
    start += 1;
    if (start > 0) {
      const prevChar = this.expression[start - 1];
      if (prevChar === "-") {
        const beforePrevIndex = start - 2;
        const beforePrev = beforePrevIndex >= 0 ? this.expression[beforePrevIndex] : null;
        if (beforePrevIndex < 0 || /[+\-*/^(%]/.test(beforePrev)) {
          start -= 1;
        }
      }
    }
    return { start, end: end + 1 };
  }

  /**
   * 替换最后输入项
   * @param {Object} bounds - 边界位置对象
   * @param {string} replacement - 替换内容
   * @returns {void}
   */
  _replaceLastEntry(bounds, replacement) {
    this._resetLastResult();
    this.expression = `${this.expression.slice(0, bounds.start)}${replacement}${this.expression.slice(bounds.end)}`;
  }

  /**
   * 查找最后的顶层运算符索引
   * @param {number} limit - 查找限制位置
   * @returns {number} 运算符索引或-1
   */
  _findLastTopLevelOperatorIndex(limit = this.expression.length) {
    let depth = 0;
    for (let i = limit - 1; i >= 0; i -= 1) {
      const ch = this.expression[i];
      if (ch === ")") {
        depth += 1;
        continue;
      }
      if (ch === "(") {
        if (depth > 0) {
          depth -= 1;
          continue;
        }
      }
      if (depth === 0 && "+-*/".includes(ch)) {
        const prev = this.expression[i - 1];
        if (ch === "-" && (i === 0 || "+-*/(".includes(prev))) {
          continue;
        }
        return i;
      }
    }
    return -1;
  }

  /**
   * 提取运算符前的操作数
   * @param {number} opIndex - 运算符索引
   * @returns {string|null} 操作数字符串或null
   */
  _extractOperandBefore(opIndex) {
    if (opIndex <= 0) return null;
    let end = opIndex - 1;
    while (end >= 0 && /\s/.test(this.expression[end])) {
      end -= 1;
    }
    if (end < 0) return null;
    let depth = 0;
    let start = end;
    while (start >= 0) {
      const ch = this.expression[start];
      if (ch === ")") {
        depth += 1;
      } else if (ch === "(") {
        if (depth === 0) {
          break;
        }
        depth -= 1;
      } else if (depth === 0 && "+-*/".includes(ch)) {
        if (ch === "-" && (start === 0 || "+-*/(".includes(this.expression[start - 1]))) {
          start -= 1;
          continue;
        }
        break;
      }
      start -= 1;
    }
    return this.expression.slice(start + 1, opIndex);
  }
}