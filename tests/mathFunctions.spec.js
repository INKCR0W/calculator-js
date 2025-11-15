import { describe, expect, it } from "vitest";
import { Calculator } from "../src/core/Calculator.js";

describe("科学函数", () => {
  const calculator = new Calculator({ preferences: { angleUnit: "deg" } });

  it("支持 tenpow", () => {
    const result = calculator.evaluate("tenpow(3)");
    expect(result.ok).toBe(true);
    expect(result.value.toNumber()).toBe(1000);
  });

  it("支持 y√x", () => {
    const result = calculator.evaluate("root(27,3)");
    expect(result.ok).toBe(true);
    expect(result.value.toNumber()).toBeCloseTo(3, 10);
  });
});
