// 数字与表达式格式化

import { Decimal } from "../core/decimal-config.js";

/**
 * 格式化数字
 * @param {Decimal|number|string} value - 需要格式化的值
 * @param {Object} [options] - 格式化选项
 * @param {number} [options.maximumFractionDigits=28] - 最大小数位数
 * @returns {string} 格式化后的数字字符串
 */
export function formatNumber(value, options = {}) {
  const { maximumFractionDigits = 12 } = options;

  if (value instanceof Decimal) {
    // 使用 Decimal 的有效位/小数位控制，避免科学计数法影响阅读
    return value.toPrecision(maximumFractionDigits).toString();
  }

  if (typeof value === "number") {
    if (!Number.isFinite(value)) return "NaN";
    return Number(value.toFixed(maximumFractionDigits)).toString();
  }

  // 兜底：直接转字符串
  return String(value);
}

/**
 * 格式化表达式
 * @param {string} expr - 表达式字符串
 * @returns {string} 格式化后的表达式
 */
export function formatExpression(expr) {
  return String(expr || "").trim();
}