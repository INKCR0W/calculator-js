import { describe, expect, it, beforeEach } from "vitest";
import { HistoryManager } from "../src/services/HistoryManager.js";
import { StorageService } from "../src/services/StorageService.js";
import { DEFAULT_PREFERENCES } from "../src/utils/constants.js";

function createManager(options = {}) {
  const storage = new StorageService(StorageService.createMemoryStorage());
  return new HistoryManager({ storage, ...options });
}

describe("HistoryManager", () => {
  let manager;

  beforeEach(() => {
    manager = createManager();
    manager.clear();
  });

  it("添加条目时会自动限制数量", () => {
    const max = 5;
    manager = createManager({ maxHistory: max });
    for (let i = 0; i < max + 3; i += 1) {
      manager.add({ expression: `${i}`, result: `${i}` });
    }
    expect(manager.items.length).toBe(max);
    expect(manager.items[0].expression).toBe(String(max + 2));
  });

  it("remove 会删除指定时间戳", () => {
    const entry = manager.add({ expression: "1+1", result: "2" });
    manager.remove(entry.timestamp);
    expect(manager.items).toHaveLength(0);
  });

  it("clear 会清空所有历史", () => {
    manager.add({ expression: "1", result: "1" });
    manager.clear();
    expect(manager.items).toHaveLength(0);
  });

  it("默认上限来自用户偏好", () => {
    const max = DEFAULT_PREFERENCES.maxHistory;
    for (let i = 0; i < max + 10; i += 1) {
      manager.add({ expression: `${i}`, result: `${i}` });
    }
    expect(manager.items.length).toBe(max);
  });
});
