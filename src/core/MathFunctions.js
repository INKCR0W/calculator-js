// 数学函数库

import { Decimal } from "./decimal-config.js";
import { MATH_CONSTANTS } from "../utils/constants.js";

/**
 * 将角度值转换为弧度
 * @param {Decimal|number} value - 角度值
 * @param {string} angleUnit - 角度单位 ("deg"|"rad"|"grad")
 * @returns {Decimal} 弧度值
 */
export function toRadians(value, angleUnit) {
  const v = value instanceof Decimal ? value : new Decimal(value);
  if (angleUnit === "deg") {
    return v.times(MATH_CONSTANTS.PI).div(180);
  }
  if (angleUnit === "grad") {
    return v.times(MATH_CONSTANTS.PI).div(200);
  }
  return v;
}

/**
 * 将弧度值转换为角度
 * @param {Decimal|number} value - 弧度值
 * @param {string} angleUnit - 角度单位 ("deg"|"rad"|"grad")
 * @returns {Decimal} 角度值
 */
export function fromRadians(value, angleUnit) {
  const v = value instanceof Decimal ? value : new Decimal(value);
  if (angleUnit === "deg") {
    return v.times(180).div(MATH_CONSTANTS.PI);
  }
  if (angleUnit === "grad") {
    return v.times(200).div(MATH_CONSTANTS.PI);
  }
  return v;
}

/**
 * 计算阶乘
 * @param {Decimal|number} n - 需要计算阶乘的数
 * @returns {Decimal} 阶乘结果
 */
export function factorial(n) {
  const d = n instanceof Decimal ? n : new Decimal(n);
  if (!d.isFinite() || d.isNeg()) throw new Error("阶乘仅支持非负有限数");
  if (!d.isInteger()) throw new Error("阶乘仅支持整数");
  if (d.isZero() || d.equals(1)) return new Decimal(1);

  let result = new Decimal(1);
  for (let i = new Decimal(2); i.lte(d); i = i.plus(1)) {
    result = result.times(i);
  }
  return result;
}

/**
 * 数学函数映射表
 * @type {Object.<string, Function>}
 */
export const MATH_FUNCTIONS = {
  // 三角函数：根据角度单位解释或返回角度
  /**
   * 正弦函数
   * @param {Decimal} x - 输入值
   * @param {Object} options - 配置选项
   * @returns {Decimal} 正弦值
   */
  sin: (x, options) => Decimal.sin(toRadians(x, options.angleUnit)),
  
  /**
   * 余弦函数
   * @param {Decimal} x - 输入值
   * @param {Object} options - 配置选项
   * @returns {Decimal} 余弦值
   */
  cos: (x, options) => Decimal.cos(toRadians(x, options.angleUnit)),
  
  /**
   * 正切函数
   * @param {Decimal} x - 输入值
   * @param {Object} options - 配置选项
   * @returns {Decimal} 正切值
   */
  tan: (x, options) => Decimal.tan(toRadians(x, options.angleUnit)),
  
  /**
   * 反正弦函数
   * @param {Decimal} x - 输入值
   * @param {Object} options - 配置选项
   * @returns {Decimal} 反正弦值
   */
  asin: (x, options) => fromRadians(Decimal.asin(x), options.angleUnit),
  
  /**
   * 反余弦函数
   * @param {Decimal} x - 输入值
   * @param {Object} options - 配置选项
   * @returns {Decimal} 反余弦值
   */
  acos: (x, options) => fromRadians(Decimal.acos(x), options.angleUnit),
  
  /**
   * 反正切函数
   * @param {Decimal} x - 输入值
   * @param {Object} options - 配置选项
   * @returns {Decimal} 反正切值
   */
  atan: (x, options) => fromRadians(Decimal.atan(x), options.angleUnit),

  // 对数与指数
  /**
   * 自然对数函数
   * @param {Decimal|number} x - 输入值
   * @returns {Decimal} 自然对数
   */
  ln: (x) => {
    if (!(x instanceof Decimal)) x = new Decimal(x);
    if (x.lte(0)) throw new Error("ln 定义域为 x > 0");
    return Decimal.ln(x);
  },
  
  /**
   * 常用对数函数
   * @param {Decimal|number} x - 输入值
   * @returns {Decimal} 常用对数
   */
  log: (x) => {
    if (!(x instanceof Decimal)) x = new Decimal(x);
    if (x.lte(0)) throw new Error("log 定义域为 x > 0");
    return Decimal.log10(x);
  },
  
  /**
   * 指数函数 e^x
   * @param {Decimal|number} x - 输入值
   * @returns {Decimal} 指数结果
   */
  exp: (x) => {
    const value = x instanceof Decimal ? x : new Decimal(x);
    return Decimal.exp(value);
  },
  
  /**
   * 10的幂函数 10^x
   * @param {Decimal|number} x - 输入值
   * @returns {Decimal} 幂运算结果
   */
  tenpow: (x) => {
    const value = x instanceof Decimal ? x : new Decimal(x);
    return Decimal.pow(new Decimal(10), value);
  },

  // 基础代数
  /**
   * 绝对值函数
   * @param {Decimal|number} x - 输入值
   * @returns {Decimal} 绝对值
   */
  abs: (x) => {
    const value = x instanceof Decimal ? x : new Decimal(x);
    return value.abs();
  },
  
  /**
   * 倒数函数
   * @param {Decimal|number} x - 输入值
   * @returns {Decimal} 倒数
   */
  inv: (x) => {
    const value = x instanceof Decimal ? x : new Decimal(x);
    if (value.isZero()) throw new Error("倒数不存在：除数为 0");
    return new Decimal(1).div(value);
  },

  // 开方与幂运算
  /**
   * 平方根函数
   * @param {Decimal|number} x - 输入值
   * @returns {Decimal} 平方根
   */
  sqrt: (x) => {
    if (!(x instanceof Decimal)) x = new Decimal(x);
    if (x.isNeg()) throw new Error("不能对负数开平方根");
    return Decimal.sqrt(x);
  },
  
  /**
   * 立方根函数
   * @param {Decimal|number} x - 输入值
   * @returns {Decimal} 立方根
   */
  cbrt: (x) => {
    if (!(x instanceof Decimal)) x = new Decimal(x);
    return Decimal.cbrt(x);
  },
  
  /**
   * 平方函数
   * @param {Decimal|number} x - 输入值
   * @returns {Decimal} 平方值
   */
  square: (x) => {
    if (!(x instanceof Decimal)) x = new Decimal(x);
    return x.times(x);
  },
  
  /**
   * 立方函数
   * @param {Decimal|number} x - 输入值
   * @returns {Decimal} 立方值
   */
  cube: (x) => {
    if (!(x instanceof Decimal)) x = new Decimal(x);
    return x.times(x).times(x);
  },
  
  /**
   * 幂函数 x^y
   * @param {Decimal|number} x - 底数
   * @param {Object} _options - 配置选项（未使用）
   * @param {Decimal|number} y - 指数
   * @returns {Decimal} 幂运算结果
   */
  pow: (x, _options, y) => {
    const base = x instanceof Decimal ? x : new Decimal(x);
    const exp = y instanceof Decimal ? y : new Decimal(y);
    return Decimal.pow(base, exp);
  },
  
  /**
   * n次方根函数 x^(1/n)
   * @param {Decimal|number} x - 被开方数
   * @param {Object} _options - 配置选项（未使用）
   * @param {Decimal|number} n - 根指数
   * @returns {Decimal} 开方结果
   */
  root: (x, _options, n) => {
    const base = x instanceof Decimal ? x : new Decimal(x);
    const deg = n instanceof Decimal ? n : new Decimal(n);
    if (deg.isZero()) throw new Error("零次方根未定义");
    if (base.isNeg() && deg.mod(2).equals(0)) throw new Error("偶次根号不能对负数开方");
    return Decimal.pow(base, new Decimal(1).div(deg));
  },

  // 阶乘
  /**
   * 阶乘函数
   * @param {Decimal|number} x - 输入值
   * @returns {Decimal} 阶乘结果
   */
  fact: (x) => factorial(x),

  // 常数
  /**
   * 圆周率π
   * @returns {Decimal} π值
   */
  pi: () => MATH_CONSTANTS.PI,
  
  /**
   * 自然常数e
   * @returns {Decimal} e值
   */
  e: () => MATH_CONSTANTS.E,
};