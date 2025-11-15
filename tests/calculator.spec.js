import { describe, expect, it } from "vitest";
import { Calculator } from "../src/core/Calculator.js";

function createCalculator(prefs = {}) {
  return new Calculator({ preferences: { ...prefs } });
}

describe("Calculator integration", () => {
  it("treats exponentiation as right associative", () => {
    const calculator = createCalculator();
    const result = calculator.evaluate("2^3^2");
    expect(result.ok).toBe(true);
    expect(result.value.toNumber()).toBe(512);
  });

  it("respects角度单位设置", () => {
    const calculator = createCalculator({ angleUnit: "deg" });
    const result = calculator.evaluate("sin(30)");
    expect(result.ok).toBe(true);
    expect(result.value.toNumber()).toBeCloseTo(0.5, 10);
  });
});
