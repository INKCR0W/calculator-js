// 语法分析器：将 token 序列转换为 AST

import { TOKEN_TYPES } from "./Lexer.js";

export class Parser {
  constructor(tokens) {
    this.tokens = tokens;
    this.position = 0;
  }

  isEOF() {
    return this.position >= this.tokens.length;
  }

  peek() {
    return this.tokens[this.position];
  }

  advance() {
    const t = this.tokens[this.position];
    this.position += 1;
    return t;
  }

  match(type, value) {
    const t = this.peek();
    if (!t || t.type !== type) return false;
    if (value !== undefined && t.value !== value) return false;
    this.advance();
    return true;
  }

  expect(type, message) {
    const t = this.peek();
    if (!t || t.type !== type) {
      throw new Error(message || `语法错误，期望 ${type}`);
    }
    return this.advance();
  }

  parse() {
    if (this.tokens.length === 0) return { type: "Literal", value: 0 };
    const expr = this.parseExpression();
    if (!this.isEOF()) {
      throw new Error("多余的输入");
    }
    return expr;
  }

  // 表达式：处理加减
  parseExpression() {
    let node = this.parseTerm();
    while (!this.isEOF()) {
      const t = this.peek();
      if (t.type === TOKEN_TYPES.OPERATOR && (t.value === "+" || t.value === "-")) {
        this.advance();
        const right = this.parseTerm();
        node = { type: "BinaryExpression", operator: t.value, left: node, right };
      } else {
        break;
      }
    }
    return node;
  }

  // 项：处理乘除和取模
  parseTerm() {
    let node = this.parsePower();
    while (!this.isEOF()) {
      const t = this.peek();
      if (t.type === TOKEN_TYPES.OPERATOR && (t.value === "*" || t.value === "/" || t.value === "%")) {
        this.advance();
        const right = this.parsePower();
        node = { type: "BinaryExpression", operator: t.value, left: node, right };
      } else {
        break;
      }
    }
    return node;
  }

  // 幂运算：右结合（例如 2^3^2 => 2^(3^2)）
  parsePower() {
    let node = this.parseUnary();
    const t = this.peek();
    if (t && t.type === TOKEN_TYPES.OPERATOR && t.value === "^") {
      this.advance();
      const right = this.parsePower();
      node = { type: "BinaryExpression", operator: "^", left: node, right };
    }
    return node;
  }

  // 一元运算：正负号
  parseUnary() {
    const t = this.peek();
    if (t && t.type === TOKEN_TYPES.OPERATOR && (t.value === "+" || t.value === "-")) {
      this.advance();
      const argument = this.parseUnary();
      return {
        type: "UnaryExpression",
        operator: t.value,
        argument,
      };
    }
    return this.parsePostfix();
  }

  // 后缀运算：阶乘 5! 等，转换为 fact(5)
  parsePostfix() {
    let node = this.parsePrimary();
    while (!this.isEOF()) {
      const t = this.peek();
      if (t.type === TOKEN_TYPES.OPERATOR && t.value === "!") {
        this.advance();
        node = {
          type: "CallExpression",
          callee: "fact",
          arguments: [node],
        };
      } else {
        break;
      }
    }
    return node;
  }

  // 基本单元：数字、常量、函数调用、括号
  parsePrimary() {
    const t = this.peek();
    if (!t) throw new Error("意外结束");

    if (t.type === TOKEN_TYPES.NUMBER) {
      this.advance();
      return { type: "Literal", value: t.value };
    }

    if (t.type === TOKEN_TYPES.CONSTANT) {
      this.advance();
      return { type: "Constant", name: t.value };
    }

    if (t.type === TOKEN_TYPES.FUNCTION) {
      return this.parseFunctionCall();
    }

    if (t.type === TOKEN_TYPES.LPAREN) {
      this.advance();
      const expr = this.parseExpression();
      this.expect(TOKEN_TYPES.RPAREN, "缺少右括号 )");
      return expr;
    }

    throw new Error("无法解析的表达式起始位置");
  }

  parseFunctionCall() {
    const fnToken = this.expect(TOKEN_TYPES.FUNCTION, "期望函数名");
    this.expect(TOKEN_TYPES.LPAREN, "函数调用缺少左括号 (");
    const args = [];
    if (!this.match(TOKEN_TYPES.RPAREN)) {
      // 至少一个参数
      args.push(this.parseExpression());
      while (this.match(TOKEN_TYPES.COMMA)) {
        args.push(this.parseExpression());
      }
      this.expect(TOKEN_TYPES.RPAREN, "函数调用缺少右括号 )");
    }
    return {
      type: "CallExpression",
      callee: fnToken.value,
      arguments: args,
    };
  }
}
