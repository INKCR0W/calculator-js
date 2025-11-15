// 常量与按钮配置

import { Decimal } from "../core/decimal-config.js";

export const MATH_CONSTANTS = {
  PI: new Decimal("3.1415926535897932384626433832795029"),
  E: new Decimal("2.7182818284590452353602874713526625"),
};

export const DEFAULT_PREFERENCES = {
  angleUnit: "deg", // 角度单位：deg、rad 或 grad
  precision: 28,
  maxHistory: 100,
  mode: "standard", // standard | scientific
};

export const STORAGE_KEYS = {
  HISTORY: "calculator.history",
  PREFERENCES: "calculator.preferences",
  THEME: "calculator.theme",
};

export const THEMES = {
  LIGHT: "light",
  DARK: "dark",
  AUTO: "auto",
};

const MEMORY_ROW = [
  { type: "memory", label: "MC", value: "memory-clear" },
  { type: "memory", label: "MR", value: "memory-recall" },
  { type: "memory", label: "M+", value: "memory-plus" },
  { type: "memory", label: "M-", value: "memory-minus" },
  { type: "memory", label: "MS", value: "memory-store" },
];

const STANDARD_LAYOUT = [
  MEMORY_ROW,
  [
    { type: "action", label: "%", value: "percent" },
    { type: "action", label: "(", value: "(" },
    { type: "action", label: ")", value: ")" },
    { type: "action", label: "CE", value: "clear-entry" },
    { type: "action", label: "C", value: "clear-expression" },
    { type: "action", label: "⌫", value: "delete" },
  ],
  [
    { type: "function", label: "1/x", value: "inv" },
    { type: "function", label: "x²", value: "square" },
    { type: "function", label: "√x", value: "sqrt" },
    { type: "operator", label: "÷", value: "/" },
  ],
  [
    { type: "digit", label: "7", value: "7" },
    { type: "digit", label: "8", value: "8" },
    { type: "digit", label: "9", value: "9" },
    { type: "operator", label: "×", value: "*" },
  ],
  [
    { type: "digit", label: "4", value: "4" },
    { type: "digit", label: "5", value: "5" },
    { type: "digit", label: "6", value: "6" },
    { type: "operator", label: "−", value: "-" },
  ],
  [
    { type: "digit", label: "1", value: "1" },
    { type: "digit", label: "2", value: "2" },
    { type: "digit", label: "3", value: "3" },
    { type: "operator", label: "+", value: "+" },
  ],
  [
    { type: "action", label: "+/−", value: "negate" },
    { type: "digit", label: "0", value: "0" },
    { type: "action", label: ".", value: "." },
    { type: "action", label: "=", value: "equals" },
  ],
];

const SCIENTIFIC_PRIMARY = [
  MEMORY_ROW,
  [
    { type: "action", label: "2nd", value: "toggle-second" },
    { type: "constant", label: "π", value: "pi" },
    { type: "constant", label: "e", value: "e" },
    { type: "action", label: "C", value: "clear-expression" },
    { type: "action", label: "⌫", value: "delete" },
  ],
  [
    { type: "function", label: "x²", value: "square" },
    { type: "function", label: "1/x", value: "inv" },
    { type: "function", label: "|x|", value: "abs" },
    { type: "function", label: "exp", value: "exp" },
    { type: "operator", label: "mod", value: "%" },
  ],
  [
    { type: "function", label: "√x", value: "sqrt" },
    { type: "action", label: "(", value: "(" },
    { type: "action", label: ")", value: ")" },
    { type: "postfix", label: "n!", value: "!" },
    { type: "operator", label: "÷", value: "/" },
  ],
  [
    { type: "function", label: "xʸ", value: "pow" },
    { type: "digit", label: "7", value: "7" },
    { type: "digit", label: "8", value: "8" },
    { type: "digit", label: "9", value: "9" },
    { type: "operator", label: "×", value: "*" },
  ],
  [
    { type: "function", label: "10ˣ", value: "tenpow" },
    { type: "digit", label: "4", value: "4" },
    { type: "digit", label: "5", value: "5" },
    { type: "digit", label: "6", value: "6" },
    { type: "operator", label: "−", value: "-" },
  ],
  [
    { type: "function", label: "log", value: "log" },
    { type: "digit", label: "1", value: "1" },
    { type: "digit", label: "2", value: "2" },
    { type: "digit", label: "3", value: "3" },
    { type: "operator", label: "+", value: "+" },
  ],
  [
    { type: "function", label: "ln", value: "ln" },
    { type: "action", label: "+/−", value: "negate" },
    { type: "digit", label: "0", value: "0" },
    { type: "action", label: ".", value: "." },
    { type: "action", label: "=", value: "equals" },
  ],
];

const SCIENTIFIC_SECONDARY = [
  MEMORY_ROW,
  [
    { type: "action", label: "2nd", value: "toggle-second", active: true },
    { type: "constant", label: "π", value: "pi" },
    { type: "constant", label: "e", value: "e" },
    { type: "action", label: "C", value: "clear-expression" },
    { type: "action", label: "⌫", value: "delete" },
  ],
  [
    { type: "function", label: "x³", value: "cube" },
    { type: "function", label: "1/x", value: "inv" },
    { type: "function", label: "|x|", value: "abs" },
    { type: "function", label: "exp", value: "exp" },
    { type: "operator", label: "mod", value: "%" },
  ],
  [
    { type: "function", label: "∛x", value: "cbrt" },
    { type: "action", label: "(", value: "(" },
    { type: "action", label: ")", value: ")" },
    { type: "postfix", label: "n!", value: "!" },
    { type: "operator", label: "÷", value: "/" },
  ],
  [
    { type: "function", label: "y√x", value: "root" },
    { type: "digit", label: "7", value: "7" },
    { type: "digit", label: "8", value: "8" },
    { type: "digit", label: "9", value: "9" },
    { type: "operator", label: "×", value: "*" },
  ],
  [
    { type: "function", label: "log", value: "log" },
    { type: "digit", label: "4", value: "4" },
    { type: "digit", label: "5", value: "5" },
    { type: "digit", label: "6", value: "6" },
    { type: "operator", label: "−", value: "-" },
  ],
  [
    { type: "function", label: "10ˣ", value: "tenpow" },
    { type: "digit", label: "1", value: "1" },
    { type: "digit", label: "2", value: "2" },
    { type: "digit", label: "3", value: "3" },
    { type: "operator", label: "+", value: "+" },
  ],
  [
    { type: "function", label: "eˣ", value: "exp" },
    { type: "action", label: "+/−", value: "negate" },
    { type: "digit", label: "0", value: "0" },
    { type: "action", label: ".", value: "." },
    { type: "action", label: "=", value: "equals" },
  ],
];

export const BUTTON_LAYOUTS = {
  standard: STANDARD_LAYOUT,
  scientific: ({ secondMode } = {}) => (secondMode ? SCIENTIFIC_SECONDARY : SCIENTIFIC_PRIMARY),
};

export const DEFAULT_MODE = "standard";
