// localStorage 封装：在浏览器环境优先使用原生 localStorage，
// 在 Node/SSR/测试环境则自动回退到内存实现，避免 ReferenceError。

let sharedMemoryStorage = null;

function createMemoryStorage() {
  const store = new Map();
  return {
    getItem(key) {
      return store.has(key) ? store.get(key) : null;
    },
    setItem(key, value) {
      store.set(key, value);
    },
    removeItem(key) {
      store.delete(key);
    },
  };
}

function resolveDefaultStorage() {
  if (typeof window !== "undefined" && window.localStorage) {
    return window.localStorage;
  }
  if (!sharedMemoryStorage) {
    sharedMemoryStorage = createMemoryStorage();
  }
  return sharedMemoryStorage;
}

export class StorageService {
  constructor(storage) {
    this.storage = storage || resolveDefaultStorage();
  }

  get(key, defaultValue = null) {
    try {
      const raw = this.storage.getItem(key);
      if (raw == null) return defaultValue;
      return JSON.parse(raw);
    } catch (e) {
      return defaultValue;
    }
  }

  set(key, value) {
    try {
      this.storage.setItem(key, JSON.stringify(value));
    } catch (e) {
      // 忽略存储错误
    }
  }

  remove(key) {
    try {
      this.storage.removeItem(key);
    } catch (e) {
      // 忽略
    }
  }

  static createMemoryStorage() {
    return createMemoryStorage();
  }
}
