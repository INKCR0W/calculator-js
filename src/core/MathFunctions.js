// 数学函数库

import { Decimal } from "./decimal-config.js";
import { MATH_CONSTANTS } from "../utils/constants.js";

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

export const MATH_FUNCTIONS = {
  // 三角函数：根据角度单位解释或返回角度
  sin: (x, options) => Decimal.sin(toRadians(x, options.angleUnit)),
  cos: (x, options) => Decimal.cos(toRadians(x, options.angleUnit)),
  tan: (x, options) => Decimal.tan(toRadians(x, options.angleUnit)),
  asin: (x, options) => fromRadians(Decimal.asin(x), options.angleUnit),
  acos: (x, options) => fromRadians(Decimal.acos(x), options.angleUnit),
  atan: (x, options) => fromRadians(Decimal.atan(x), options.angleUnit),

  // 对数与指数
  ln: (x) => {
    if (!(x instanceof Decimal)) x = new Decimal(x);
    if (x.lte(0)) throw new Error("ln 定义域为 x > 0");
    return Decimal.ln(x);
  },
  log: (x) => {
    if (!(x instanceof Decimal)) x = new Decimal(x);
    if (x.lte(0)) throw new Error("log 定义域为 x > 0");
    return Decimal.log10(x);
  },
  exp: (x) => {
    const value = x instanceof Decimal ? x : new Decimal(x);
    return Decimal.exp(value);
  },
  tenpow: (x) => {
    const value = x instanceof Decimal ? x : new Decimal(x);
    return Decimal.pow(new Decimal(10), value);
  },

  // 基础代数
  abs: (x) => {
    const value = x instanceof Decimal ? x : new Decimal(x);
    return value.abs();
  },
  inv: (x) => {
    const value = x instanceof Decimal ? x : new Decimal(x);
    if (value.isZero()) throw new Error("倒数不存在：除数为 0");
    return new Decimal(1).div(value);
  },

  // 开方与幂运算
  sqrt: (x) => {
    if (!(x instanceof Decimal)) x = new Decimal(x);
    if (x.isNeg()) throw new Error("不能对负数开平方根");
    return Decimal.sqrt(x);
  },
  cbrt: (x) => {
    if (!(x instanceof Decimal)) x = new Decimal(x);
    return Decimal.cbrt(x);
  },
  square: (x) => {
    if (!(x instanceof Decimal)) x = new Decimal(x);
    return x.times(x);
  },
  cube: (x) => {
    if (!(x instanceof Decimal)) x = new Decimal(x);
    return x.times(x).times(x);
  },
  pow: (x, _options, y) => {
    const base = x instanceof Decimal ? x : new Decimal(x);
    const exp = y instanceof Decimal ? y : new Decimal(y);
    return Decimal.pow(base, exp);
  },
  root: (x, _options, n) => {
    const base = x instanceof Decimal ? x : new Decimal(x);
    const deg = n instanceof Decimal ? n : new Decimal(n);
    if (deg.isZero()) throw new Error("零次方根未定义");
    if (base.isNeg() && deg.mod(2).equals(0)) throw new Error("偶次根号不能对负数开方");
    return Decimal.pow(base, new Decimal(1).div(deg));
  },

  // 阶乘
  fact: (x) => factorial(x),

  // 常数
  pi: () => MATH_CONSTANTS.PI,
  e: () => MATH_CONSTANTS.E,
};
