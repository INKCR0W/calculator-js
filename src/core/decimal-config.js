/**
 * Decimal配置模块
 * 导入并重新导出Decimal类，统一管理decimal.js的引入
 * 
 * @module decimal-config
 * @requires decimal.js
 */

/**
 * Decimal类 - 高精度十进制计算库
 * @type {Class}
 * @see {@link https://mikemcl.github.io/decimal.js/}
 */
import Decimal from "../../node_modules/decimal.js/decimal.mjs";

export { Decimal };