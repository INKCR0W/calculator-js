// 词法分析器：将表达式字符串转换为 token 序列

/**
 * @typedef {Object} Token
 * @property {string} type - Token类型
 * @property {string} [value] - Token值
 */

/**
 * Token类型常量
 * @enum {string}
 */
const TOKEN_TYPES = {
  NUMBER: "NUMBER",
  OPERATOR: "OPERATOR",
  LPAREN: "LPAREN",
  RPAREN: "RPAREN",
  FUNCTION: "FUNCTION",
  CONSTANT: "CONSTANT",
  COMMA: "COMMA",
};

/**
 * 运算符集合
 * @type {Set<string>}
 */
const OPERATORS = new Set(["+", "-", "*", "/", "%", "^", "!"]);

export { TOKEN_TYPES };

/**
 * Lexer类 - 词法分析器，将表达式字符串转换为token序列
 * 
 * @class Lexer
 * @property {string} input - 输入的表达式字符串
 * @property {number} position - 当前解析位置
 * @property {number} length - 输入字符串长度
 */
export class Lexer {
  /**
   * 创建Lexer实例
   * @param {string} input - 表达式字符串
   */
  constructor(input) {
    this.input = input;
    this.position = 0;
    this.length = input.length;
  }

  /**
   * 检查是否到达输入末尾
   * @returns {boolean} 是否到达末尾
   */
  isEOF() {
    return this.position >= this.length;
  }

  /**
   * 查看当前字符但不移动位置
   * @returns {string} 当前字符
   */
  peek() {
    return this.input[this.position];
  }

  /**
   * 获取当前字符并向前移动一位
   * @returns {string} 当前字符
   */
  advance() {
    const ch = this.input[this.position];
    this.position += 1;
    return ch;
  }

  /**
   * 跳过空白字符
   * @returns {void}
   */
  skipWhitespace() {
    while (!this.isEOF() && /\s/.test(this.peek())) {
      this.advance();
    }
  }

  /**
   * 读取数字token
   * @returns {Token} 数字token
   */
  readNumber() {
    let value = "";
    let hasDot = false;
    while (!this.isEOF()) {
      const ch = this.peek();
      if (ch === ".") {
        if (hasDot) break;
        hasDot = true;
        value += this.advance();
      } else if (/\d/.test(ch)) {
        value += this.advance();
      } else {
        break;
      }
    }
    // 为了与高精度 decimal.js 配合，这里保留原始字符串形式，避免提前丢失精度
    return { type: TOKEN_TYPES.NUMBER, value };
  }

  /**
   * 读取标识符token（函数名或常量）
   * @returns {Token} 标识符token
   */
  readIdentifier() {
    let value = "";
    while (!this.isEOF() && /[a-zA-Z_]/.test(this.peek())) {
      value += this.advance();
    }
    const lower = value.toLowerCase();
    if (lower === "pi" || lower === "e") {
      return { type: TOKEN_TYPES.CONSTANT, value: lower };
    }
    return { type: TOKEN_TYPES.FUNCTION, value: lower };
  }

  /**
   * 获取下一个token
   * @returns {Token|null} 下一个token，如果到达末尾则返回null
   */
  nextToken() {
    this.skipWhitespace();
    if (this.isEOF()) return null;
    const ch = this.peek();

    if (/\d/.test(ch) || (ch === "." && /\d/.test(this.input[this.position + 1]))) {
      return this.readNumber();
    }

    if (/[a-zA-Z_]/.test(ch)) {
      return this.readIdentifier();
    }

    if (ch === "(") {
      this.advance();
      return { type: TOKEN_TYPES.LPAREN };
    }

    if (ch === ")") {
      this.advance();
      return { type: TOKEN_TYPES.RPAREN };
    }

    if (ch === ",") {
      this.advance();
      return { type: TOKEN_TYPES.COMMA };
    }

    if (OPERATORS.has(ch)) {
      this.advance();
      return { type: TOKEN_TYPES.OPERATOR, value: ch };
    }

    throw new Error(`无法识别的字符: '${ch}'`);
  }

  /**
   * 将整个输入字符串转换为token序列
   * @returns {Token[]} token序列
   */
  tokenize() {
    const tokens = [];
    let token = this.nextToken();
    while (token) {
      tokens.push(token);
      token = this.nextToken();
    }
    return tokens;
  }
}