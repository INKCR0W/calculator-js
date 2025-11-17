// 计算器主类：对外提供表达式计算能力

import { Decimal } from "./decimal-config.js";
import { Lexer } from "./Lexer.js";
import { Parser } from "./Parser.js";
import { Evaluator } from "./Evaluator.js";
import { DEFAULT_PREFERENCES } from "../utils/constants.js";

/**
 * Calculator类 - 提供表达式计算功能
 * 
 * @class Calculator
 * @property {Object} preferences - 计算器偏好设置
 * @property {Evaluator} evaluator - 表达式求值器实例
 */
export class Calculator {
  /**
   * 创建Calculator实例
   * @param {Object} [options={}] - 配置选项
   * @param {Object} [options.preferences] - 偏好设置
   */
  constructor(options = {}) {
    this.preferences = { ...DEFAULT_PREFERENCES, ...options.preferences };
    this.evaluator = new Evaluator(this.preferences);
  }

  /**
   * 设置计算器偏好
   * @param {Object} prefs - 偏好设置对象
   * @returns {void}
   */
  setPreferences(prefs) {
    this.preferences = { ...this.preferences, ...prefs };
    this.evaluator = new Evaluator(this.preferences);
  }

  /**
   * 计算表达式
   * @param {string} expression - 数学表达式字符串
   * @returns {Object} 计算结果对象
   * @returns {boolean} return.ok - 是否计算成功
   * @returns {Decimal} [return.value] - 计算结果值（仅在成功时存在）
   * @returns {string} [return.error] - 错误信息（仅在失败时存在）
   */
  evaluate(expression) {
    const trimmed = String(expression || "").trim();
    if (!trimmed) {
      return { ok: true, value: new Decimal(0) };
    }
    try {
      const lexer = new Lexer(trimmed);
      const tokens = lexer.tokenize();
      const parser = new Parser(tokens);
      const ast = parser.parse();
      const value = this.evaluator.evaluate(ast);
      if (!(value instanceof Decimal)) {
        throw new Error("内部错误：结果不是高精度 Decimal 类型");
      }
      if (!value.isFinite()) {
        throw new Error("结果超出可表示范围");
      }
      return { ok: true, value };
    } catch (err) {
      return { ok: false, error: err.message || String(err) };
    }
  }
}