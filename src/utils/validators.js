// 输入与结果验证工具

import { Lexer } from "../core/Lexer.js";
import { Parser } from "../core/Parser.js";

/**
 * 验证表达式是否合法
 * @param {string} expr - 表达式字符串
 * @returns {Object} 验证结果
 * @returns {boolean} return.ok - 是否合法
 * @returns {string} [return.error] - 错误信息（如果不合法）
 */
export function validateExpression(expr) {
  if (typeof expr !== "string") {
    return { ok: false, error: "表达式必须是字符串" };
  }
  const trimmed = expr.trim();
  if (!trimmed) {
    return { ok: false, error: "表达式不能为空" };
  }
  try {
    const lexer = new Lexer(trimmed);
    const tokens = lexer.tokenize();
    const parser = new Parser(tokens);
    parser.parse();
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err.message || "表达式语法错误" };
  }
}

/**
 * 检查表达式是否合法
 * @param {string} expr - 表达式字符串
 * @returns {boolean} 是否合法
 */
export function isValidExpression(expr) {
  return validateExpression(expr).ok;
}

/**
 * 检查值是否为有效数字
 * @param {*} value - 需要检查的值
 * @returns {boolean} 是否为有效数字
 */
export function isNumeric(value) {
  return typeof value === "number" && Number.isFinite(value);
}