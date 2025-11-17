// 语法分析器：将 token 序列转换为 AST

import { TOKEN_TYPES } from "./Lexer.js";

/**
 * @typedef {Object} ASTNode
 * @property {string} type - 节点类型
 */

/**
 * @typedef {ASTNode} LiteralNode
 * @property {string} type - 节点类型，固定为"Literal"
 * @property {string} value - 字面量值
 */

/**
 * @typedef {ASTNode} ConstantNode
 * @property {string} type - 节点类型，固定为"Constant"
 * @property {string} name - 常量名称
 */

/**
 * @typedef {ASTNode} BinaryExpressionNode
 * @property {string} type - 节点类型，固定为"BinaryExpression"
 * @property {string} operator - 运算符
 * @property {ASTNode} left - 左操作数
 * @property {ASTNode} right - 右操作数
 */

/**
 * @typedef {ASTNode} UnaryExpressionNode
 * @property {string} type - 节点类型，固定为"UnaryExpression"
 * @property {string} operator - 运算符
 * @property {ASTNode} argument - 操作数
 */

/**
 * @typedef {ASTNode} CallExpressionNode
 * @property {string} type - 节点类型，固定为"CallExpression"
 * @property {string} callee - 函数名
 * @property {ASTNode[]} arguments - 参数列表
 */

/**
 * Parser类 - 语法分析器，将token序列转换为抽象语法树(AST)
 * 
 * @class Parser
 * @property {Token[]} tokens - token序列
 * @property {number} position - 当前解析位置
 */
export class Parser {
  /**
   * 创建Parser实例
   * @param {Token[]} tokens - token序列
   */
  constructor(tokens) {
    this.tokens = tokens;
    this.position = 0;
  }

  /**
   * 检查是否到达token序列末尾
   * @returns {boolean} 是否到达末尾
   */
  isEOF() {
    return this.position >= this.tokens.length;
  }

  /**
   * 查看当前token但不移动位置
   * @returns {Token} 当前token
   */
  peek() {
    return this.tokens[this.position];
  }

  /**
   * 获取当前token并向前移动一位
   * @returns {Token} 当前token
   */
  advance() {
    const t = this.tokens[this.position];
    this.position += 1;
    return t;
  }

  /**
   * 匹配当前token类型和值
   * @param {string} type - 期望的token类型
   * @param {string} [value] - 期望的token值
   * @returns {boolean} 是否匹配成功
   */
  match(type, value) {
    const t = this.peek();
    if (!t || t.type !== type) return false;
    if (value !== undefined && t.value !== value) return false;
    this.advance();
    return true;
  }

  /**
   * 期望当前token为指定类型，否则抛出错误
   * @param {string} type - 期望的token类型
   * @param {string} [message] - 错误信息
   * @returns {Token} 当前token
   */
  expect(type, message) {
    const t = this.peek();
    if (!t || t.type !== type) {
      throw new Error(message || `语法错误，期望 ${type}`);
    }
    return this.advance();
  }

  /**
   * 解析整个表达式
   * @returns {ASTNode} AST根节点
   */
  parse() {
    if (this.tokens.length === 0) return { type: "Literal", value: 0 };
    const expr = this.parseExpression();
    if (!this.isEOF()) {
      throw new Error("多余的输入");
    }
    return expr;
  }

  /**
   * 解析表达式（处理加减运算）
   * @returns {ASTNode} AST节点
   */
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

  /**
   * 解析项（处理乘除和取模运算）
   * @returns {ASTNode} AST节点
   */
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

  /**
   * 解析幂运算（右结合）
   * @returns {ASTNode} AST节点
   */
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

  /**
   * 解析一元运算（正负号）
   * @returns {ASTNode} AST节点
   */
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

  /**
   * 解析后缀运算（阶乘）
   * @returns {ASTNode} AST节点
   */
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

  /**
   * 解析基本单元（数字、常量、函数调用、括号）
   * @returns {ASTNode} AST节点
   */
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

  /**
   * 解析函数调用
   * @returns {CallExpressionNode} 函数调用节点
   */
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