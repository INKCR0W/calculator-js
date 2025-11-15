// 输入与结果验证工具

import { Lexer } from "../core/Lexer.js";
import { Parser } from "../core/Parser.js";

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

export function isValidExpression(expr) {
  return validateExpression(expr).ok;
}

export function isNumeric(value) {
  return typeof value === "number" && Number.isFinite(value);
}
