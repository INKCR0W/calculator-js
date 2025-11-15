// 计算器主类：对外提供表达式计算能力

import { Decimal } from "./decimal-config.js";
import { Lexer } from "./Lexer.js";
import { Parser } from "./Parser.js";
import { Evaluator } from "./Evaluator.js";
import { DEFAULT_PREFERENCES } from "../utils/constants.js";

export class Calculator {
  constructor(options = {}) {
    this.preferences = { ...DEFAULT_PREFERENCES, ...options.preferences };
    this.evaluator = new Evaluator(this.preferences);
  }

  setPreferences(prefs) {
    this.preferences = { ...this.preferences, ...prefs };
    this.evaluator = new Evaluator(this.preferences);
  }

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
