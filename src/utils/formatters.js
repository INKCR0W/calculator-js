// 数字与表达式格式化

import { Decimal } from "../core/decimal-config.js";

export function formatNumber(value, options = {}) {
  const { maximumFractionDigits = 28 } = options;

  if (value instanceof Decimal) {
    // 使用 Decimal 的有效位/小数位控制，避免科学计数法影响阅读
    return value.toSignificantDigits(maximumFractionDigits).toString();
  }

  if (typeof value === "number") {
    if (!Number.isFinite(value)) return "NaN";
    return Number(value.toFixed(maximumFractionDigits)).toString();
  }

  // 兜底：直接转字符串
  return String(value);
}

export function formatExpression(expr) {
  return String(expr || "").trim();
}
