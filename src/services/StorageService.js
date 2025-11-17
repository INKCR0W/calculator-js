// localStorage 封装：在浏览器环境优先使用原生 localStorage，
// 在 Node/SSR/测试环境则自动回退到内存实现，避免 ReferenceError。

/**
 * 共享内存存储实例
 * @type {Object|null}
 */
let sharedMemoryStorage = null;

/**
 * 创建内存存储实例
 * @returns {Object} 内存存储对象
 */
function createMemoryStorage() {
  const store = new Map();
  return {
    /**
     * 获取存储项
     * @param {string} key - 键名
     * @returns {*} 存储的值
     */
    getItem(key) {
      return store.has(key) ? store.get(key) : null;
    },
    
    /**
     * 设置存储项
     * @param {string} key - 键名
     * @param {*} value - 值
     * @returns {void}
     */
    setItem(key, value) {
      store.set(key, value);
    },
    
    /**
     * 移除存储项
     * @param {string} key - 键名
     * @returns {void}
     */
    removeItem(key) {
      store.delete(key);
    },
  };
}

/**
 * 解析默认存储实现
 * @returns {Object} 存储对象
 */
function resolveDefaultStorage() {
  if (typeof window !== "undefined" && window.localStorage) {
    return window.localStorage;
  }
  if (!sharedMemoryStorage) {
    sharedMemoryStorage = createMemoryStorage();
  }
  return sharedMemoryStorage;
}

/**
 * StorageService类 - 存储服务，封装localStorage操作
 * 
 * @class StorageService
 * @property {Object} storage - 实际的存储实现
 */
export class StorageService {
  /**
   * 创建StorageService实例
   * @param {Object} [storage] - 存储实现
   */
  constructor(storage) {
    this.storage = storage || resolveDefaultStorage();
  }

  /**
   * 获取存储项
   * @param {string} key - 键名
   * @param {*} [defaultValue=null] - 默认值
   * @returns {*} 存储的值或默认值
   */
  get(key, defaultValue = null) {
    try {
      const raw = this.storage.getItem(key);
      if (raw == null) return defaultValue;
      return JSON.parse(raw);
    } catch (e) {
      return defaultValue;
    }
  }

  /**
   * 设置存储项
   * @param {string} key - 键名
   * @param {*} value - 值
   * @returns {void}
   */
  set(key, value) {
    try {
      this.storage.setItem(key, JSON.stringify(value));
    } catch (e) {
      // 忽略存储错误
    }
  }

  /**
   * 移除存储项
   * @param {string} key - 键名
   * @returns {void}
   */
  remove(key) {
    try {
      this.storage.removeItem(key);
    } catch (e) {
      // 忽略
    }
  }

  /**
   * 创建内存存储实例
   * @returns {Object} 内存存储对象
   */
  static createMemoryStorage() {
    return createMemoryStorage();
  }
}