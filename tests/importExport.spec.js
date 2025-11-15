import { describe, expect, it, beforeEach } from "vitest";
import { ImportExportService } from "../src/services/ImportExportService.js";
import { HistoryManager } from "../src/services/HistoryManager.js";
import { PreferencesManager } from "../src/services/PreferencesManager.js";
import { StorageService } from "../src/services/StorageService.js";
import { THEMES } from "../src/utils/constants.js";

function createMemoryStorage() {
  return new StorageService(StorageService.createMemoryStorage());
}

function createService(options = {}) {
  const storage = createMemoryStorage();
  const historyManager = new HistoryManager({ storage });
  const preferencesManager = new PreferencesManager({ storage });
  if (options.initialMaxHistory) {
    preferencesManager.set({ maxHistory: options.initialMaxHistory });
  }
  const service = new ImportExportService({
    historyManager,
    preferencesManager,
    storage,
    limits: options.limits,
  });
  return { service, historyManager, preferencesManager, storage };
}

describe("ImportExportService", () => {
  let deps;

  beforeEach(() => {
    deps = createService();
  });

  it("拒绝超过大小限制的导入", () => {
    const tiny = createService({ limits: { maxPayloadBytes: 10 } });
    expect(() => tiny.service.parseImportPayload("{\"history\":[]}"))
      .toThrow(/过大/);
  });

  it("成功应用历史/偏好/主题并返回摘要", () => {
    const { service, historyManager, preferencesManager, storage } = deps;
    preferencesManager.set({ maxHistory: 1 });
    const payload = {
      history: [
        { expression: "1+1", result: "2", timestamp: 1 },
        { expression: "2+2", result: "4", timestamp: 2 },
      ],
      preferences: {
        angleUnit: "rad",
        precision: 60,
        maxHistory: 9999,
        mode: "scientific",
      },
      theme: THEMES.DARK,
    };
    const summary = service.applyImportFromJson(JSON.stringify(payload));
    expect(summary).toEqual({ history: true, preferences: true, theme: true });
    expect(historyManager.items.length).toBe(1);
    expect(historyManager.items[0].expression).toBe("1+1");
    expect(preferencesManager.get()).toMatchObject({
      angleUnit: "rad",
      precision: 60,
      maxHistory: 500,
      mode: "scientific",
    });
    expect(storage.get("calculator.theme", null)).toBe(THEMES.DARK);
  });

  it("在遇到非法 history 条目时抛错", () => {
    const { service } = deps;
    const payload = {
      history: [{ expression: "???", result: "0" }],
    };
    expect(() => service.applyImportFromJson(JSON.stringify(payload))).toThrow();
  });
});
