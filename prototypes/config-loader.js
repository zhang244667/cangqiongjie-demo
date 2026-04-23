/**
 * 配置加载器
 * 负责从配置文件加载游戏数据
 */

const ConfigLoader = {
  // 配置缓存
  _cache: {},
  
  // 配置文件路径
  _configPath: './config/',
  
  // 是否已初始化
  _initialized: false,
  
  // 加载状态
  _loadPromise: null,

  /**
   * 初始化加载所有配置
   * @returns {Promise<void>}
   */
  async init() {
    if (this._initialized) return;
    if (this._loadPromise) return this._loadPromise;
    
    this._loadPromise = this._loadAllConfigs();
    await this._loadPromise;
    this._initialized = true;
  },

  /**
   * 加载所有配置文件
   */
  async _loadAllConfigs() {
    const configs = ['heroes', 'enemies', 'levels', 'scenes', 'battle'];
    
    await Promise.all(configs.map(async (name) => {
      try {
        const response = await fetch(`${this._configPath}${name}.json`);
        if (!response.ok) throw new Error(`Failed to load ${name}.json`);
        this._cache[name] = await response.json();
        console.log(`[ConfigLoader] Loaded ${name}.json`);
      } catch (error) {
        console.error(`[ConfigLoader] Error loading ${name}.json:`, error);
        // 使用默认配置
        this._cache[name] = this._getDefaultConfig(name);
      }
    }));
    
    // 加载剧情配置（从预编译的JS）
    // stories.md 需要预先解析为 stories.config.js
    if (typeof STORIES_CONFIG !== 'undefined') {
      this._cache.stories = STORIES_CONFIG;
    }
  },

  /**
   * 获取默认配置（加载失败时使用）
   */
  _getDefaultConfig(name) {
    const defaults = {
      heroes: { version: '1.0.0', heroes: {} },
      enemies: { version: '1.0.0', enemyTypes: {}, encounterConfigs: {} },
      levels: { version: '1.0.0', levels: {} },
      scenes: { version: '1.0.0', scenes: {} },
      battle: {
        version: '1.0.0',
        rage: { initial: 30, gainOnAttack: 20, gainOnHit: 15, max: 100 },
        damage: { criticalChance: 0.15, criticalMultiplier: 1.5 }
      }
    };
    return defaults[name] || {};
  },

  /**
   * 获取英雄配置
   * @param {string} heroId - 英雄ID
   * @returns {Object} 英雄配置
   */
  getHero(heroId) {
    const heroes = this._cache.heroes?.heroes || {};
    return heroes[heroId] || null;
  },

  /**
   * 获取所有英雄配置
   * @returns {Object} 所有英雄配置
   */
  getAllHeroes() {
    return this._cache.heroes?.heroes || {};
  },

  /**
   * 获取敌人配置
   * @param {string} enemyId - 敌人ID
   * @returns {Object} 敌人配置
   */
  getEnemy(enemyId) {
    const enemies = this._cache.enemies?.enemyTypes || {};
    return enemies[enemyId] || null;
  },

  /**
   * 获取遭遇战配置
   * @param {string} type - 遭遇类型 (normal/boss)
   * @returns {Object} 遭遇配置
   */
  getEncounterConfig(type) {
    return this._cache.enemies?.encounterConfigs?.[type] || null;
  },

  /**
   * 获取关卡配置
   * @param {number} levelId - 关卡ID
   * @returns {Object} 关卡配置
   */
  getLevel(levelId) {
    return this._cache.levels?.levels?.[levelId] || null;
  },

  /**
   * 获取所有关卡配置
   * @returns {Object} 所有关卡配置
   */
  getAllLevels() {
    return this._cache.levels?.levels || {};
  },

  /**
   * 获取场景配置
   * @param {string} sceneId - 场景ID
   * @returns {Object} 场景配置
   */
  getScene(sceneId) {
    return this._cache.scenes?.scenes?.[sceneId] || null;
  },

  /**
   * 获取战斗参数
   * @param {string} category - 参数分类 (rage/damage/battle/targetSelection)
   * @returns {Object} 参数配置
   */
  getBattleParams(category) {
    return this._cache.battle?.[category] || {};
  },

  /**
   * 获取剧情配置
   * @param {string} type - 剧情类型 (levelIntro/bossIntro/victory/defeat)
   * @param {number} levelId - 关卡ID
   * @returns {Array} 剧情场景列表
   */
  getStory(type, levelId) {
    return this._cache.stories?.[type]?.[levelId] || [];
  },

  /**
   * 获取原始配置（调试用）
   * @param {string} name - 配置名称
   * @returns {Object} 原始配置
   */
  getRawConfig(name) {
    return this._cache[name] || null;
  },

  /**
   * 重新加载配置（热更新）
   */
  async reload() {
    this._initialized = false;
    this._cache = {};
    this._loadPromise = null;
    await this.init();
  }
};

// 导出（兼容不同模块系统）
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ConfigLoader;
}
