// 词法分析器：将表达式字符串转换为 token 序列

const TOKEN_TYPES = {
  NUMBER: "NUMBER",
  OPERATOR: "OPERATOR",
  LPAREN: "LPAREN",
  RPAREN: "RPAREN",
  FUNCTION: "FUNCTION",
  CONSTANT: "CONSTANT",
  COMMA: "COMMA",
};

const OPERATORS = new Set(["+", "-", "*", "/", "%", "^", "!"]);

export { TOKEN_TYPES };

export class Lexer {
  constructor(input) {
    this.input = input;
    this.position = 0;
    this.length = input.length;
  }

  isEOF() {
    return this.position >= this.length;
  }

  peek() {
    return this.input[this.position];
  }

  advance() {
    const ch = this.input[this.position];
    this.position += 1;
    return ch;
  }

  skipWhitespace() {
    while (!this.isEOF() && /\s/.test(this.peek())) {
      this.advance();
    }
  }

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
