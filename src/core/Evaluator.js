// 求值器：遍历 AST 并计算结果

import { Decimal } from "./decimal-config.js";
import { MATH_CONSTANTS, DEFAULT_PREFERENCES } from "../utils/constants.js";
import { MATH_FUNCTIONS } from "./MathFunctions.js";

/**
 * Evaluator类 - 负责遍历AST并计算表达式结果
 * 
 * @class Evaluator
 * @property {Object} options - 求值器配置选项
 */
export class Evaluator {
  /**
   * 创建Evaluator实例
   * @param {Object} [options={}] - 配置选项
   */
  constructor(options = {}) {
    this.options = { ...DEFAULT_PREFERENCES, ...options };
    // 配置全局 Decimal 精度：
    // 1. 使用用户偏好中的 precision
    // 2. 但不允许低于默认精度（避免大整数被截断）
    if (typeof Decimal !== "undefined") {
      const minPrecision = DEFAULT_PREFERENCES.precision || 28;
      const requested = this.options.precision || minPrecision;
      const precision = Math.max(requested, minPrecision);
      Decimal.set({ precision });
      this.options.precision = precision;
    }
  }

  /**
   * 计算AST节点的值
   * @param {Object} ast - 抽象语法树根节点
   * @returns {Decimal} 计算结果
   */
  evaluate(ast) {
    const value = this.evalNode(ast);
    return this.round(value);
  }

  /**
   * 对值进行精度舍入
   * @param {Decimal|number} value - 需要舍入的值
   * @returns {Decimal} 舍入后的值
   */
  round(value) {
    const { precision } = this.options;
    const v = value instanceof Decimal ? value : new Decimal(value);
    return v.toSignificantDigits(precision || 28, Decimal.ROUND_HALF_EVEN);
  }

  /**
   * 递归计算AST节点
   * @param {Object} node - AST节点
   * @returns {Decimal} 节点计算结果
   */
  evalNode(node) {
    switch (node.type) {
      case "Literal":
        // NUMBER token 已经保留为字符串，这里统一转为 Decimal
        return new Decimal(node.value);
      case "Constant":
        return this.evalConstant(node);
      case "BinaryExpression":
        return this.evalBinary(node);
      case "UnaryExpression":
        return this.evalUnary(node);
      case "CallExpression":
        return this.evalCall(node);
      default:
        throw new Error(`未知的 AST 节点类型: ${node.type}`);
    }
  }

  /**
   * 计算常量节点
   * @param {Object} node - 常量节点
   * @returns {Decimal} 常量值
   */
  evalConstant(node) {
    if (node.name === "pi") return MATH_CONSTANTS.PI;
    if (node.name === "e") return MATH_CONSTANTS.E;
    throw new Error(`未知常量: ${node.name}`);
  }

  /**
   * 计算二元表达式节点
   * @param {Object} node - 二元表达式节点
   * @returns {Decimal} 计算结果
   */
  evalBinary(node) {
    const left = this.evalNode(node.left);
    const right = this.evalNode(node.right);
    const l = left instanceof Decimal ? left : new Decimal(left);
    const r = right instanceof Decimal ? right : new Decimal(right);
    switch (node.operator) {
      case "+":
        return l.add(r);
      case "-":
        return l.sub(r);
      case "*":
        return l.mul(r);
      case "/":
        if (r.isZero()) throw new Error("除数不能为 0");
        return l.div(r);
      case "%":
        if (r.isZero()) throw new Error("模运算除数不能为 0");
        return l.mod(r);
      case "^":
        return Decimal.pow(l, r);
      default:
        throw new Error(`未知二元运算符: ${node.operator}`);
    }
  }

  /**
   * 计算一元表达式节点
   * @param {Object} node - 一元表达式节点
   * @returns {Decimal} 计算结果
   */
  evalUnary(node) {
    const value = this.evalNode(node.argument);
    const v = value instanceof Decimal ? value : new Decimal(value);
    switch (node.operator) {
      case "+":
        return v;
      case "-":
        return v.neg();
      default:
        throw new Error(`未知一元运算符: ${node.operator}`);
    }
  }

  /**
   * 计算函数调用节点
   * @param {Object} node - 函数调用节点
   * @returns {Decimal} 计算结果
   */
  evalCall(node) {
    const fn = MATH_FUNCTIONS[node.callee];
    if (!fn) {
      throw new Error(`未知函数: ${node.callee}`);
    }
    const args = node.arguments.map((arg) => this.evalNode(arg));
    return fn(args[0], this.options, ...args.slice(1));
  }
}