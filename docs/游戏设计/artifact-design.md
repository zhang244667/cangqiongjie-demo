# 《苍穹劫·摸金传人》宝物系统深化设计文档

> 版本：1.0
> 更新日期：2026年4月24日
> 设计原则：每英雄1宝物槽，可自由转移

---

## 一、宝物分类设计

### 1.1 宝物类型总览

| 类型 | 子类 | 效果定位 | 获取难度 |
|------|------|----------|----------|
| **武器** | 古剑、古刀、长枪、弓箭 | 攻击型属性 | 中等 |
| **饰品** | 玉佩、戒指、项链、手镯 | 防御/功能属性 | 中等 |
| **特殊** | 古符、古镜、古鼎、古钟 | 特殊效果 | 稀有 |

### 1.2 宝物详细分类JSON

```json
{
  "artifact_categories": {
    "weapon": {
      "category_id": "weapon",
      "category_name": "武器",
      "sub_types": [
        {"type_id": "ancient_sword", "name": "古剑", "icon": "artifact/weapon/sword"},
        {"type_id": "ancient_blade", "name": "古刀", "icon": "artifact/weapon/blade"},
        {"type_id": "spear", "name": "长枪", "icon": "artifact/weapon/spear"},
        {"type_id": "bow", "name": "弓箭", "icon": "artifact/weapon/bow"}
      ],
      "primary_stats": ["attack", "crit_rate", "crit_damage"],
      "secondary_stats": ["hp", "defense", "speed"]
    },
    "accessory": {
      "category_id": "accessory",
      "category_name": "饰品",
      "sub_types": [
        {"type_id": "jade_pendant", "name": "玉佩", "icon": "artifact/accessory/pendant"},
        {"type_id": "ring", "name": "戒指", "icon": "artifact/accessory/ring"},
        {"type_id": "necklace", "name": "项链", "icon": "artifact/accessory/necklace"},
        {"type_id": "bracelet", "name": "手镯", "icon": "artifact/accessory/bracelet"}
      ],
      "primary_stats": ["hp", "defense", "resist"],
      "secondary_stats": ["attack", "speed", "crit_rate"]
    },
    "special": {
      "category_id": "special",
      "category_name": "特殊",
      "sub_types": [
        {"type_id": "ancient_charm", "name": "古符", "icon": "artifact/special/charm"},
        {"type_id": "ancient_mirror", "name": "古镜", "icon": "artifact/special/mirror"},
        {"type_id": "ancient_ding", "name": "古鼎", "icon": "artifact/special/ding"},
        {"type_id": "ancient_bell", "name": "古钟", "icon": "artifact/special/bell"}
      ],
      "primary_stats": ["attack", "hp"],
      "secondary_stats": ["special_effect"],
      "has_unique_passive": true
    }
  }
}
```

---

## 二、宝物品质与星级

### 2.1 品质等级划分

| 品质 | 英文标识 | 颜色 | 基础属性倍率 | 套装效果 |
|:----:|:--------:|:----:|:------------:|----------|
| 白色 | White | #FFFFFF | 1.0x | 无 |
| 绿色 | Green | #00FF00 | 1.3x | 2件套+5%属性 |
| 蓝色 | Blue | #0080FF | 1.6x | 2件套+10%属性 |
| 紫色 | Purple | #8000FF | 2.0x | 2件套+15%属性 |
| 橙色 | Orange | #FF8000 | 2.5x | 2件套+20%属性 |
| 红色 | Red | #FF0000 | 3.0x | 2件套+25%属性 |

### 2.2 星级等级划分

| 星级 | 品质要求 | 属性加成 | 强化上限 | 升星消耗 |
|:----:|:--------:|:--------:|:--------:|----------|
| 1★ | 白色+ | +0% | +15 | - |
| 2★ | 绿色+ | +10% | +20 | 白色碎片×20 |
| 3★ | 绿色+ | +25% | +25 | 绿色碎片×15 |
| 4★ | 蓝色+ | +45% | +30 | 蓝色碎片×10 |
| 5★ | 紫色+ | +70% | +40 | 紫色碎片×8 |
| 6★ | 橙色+ | +100% | +50 | 橙色碎片×5 |
| 7★ | 红色 | +150% | +60 | 红色碎片×3 |

### 2.3 品质星级JSON配置

```json
{
  "artifact_quality_star": {
    "white": {
      "quality_level": 1,
      "color_hex": "FFFFFF",
      "base_stat_multiplier": 1.0,
      "min_star": 1,
      "max_star": 2,
      "suit_effect": null,
      "drop_rate": 0.40
    },
    "green": {
      "quality_level": 2,
      "color_hex": "00FF00",
      "base_stat_multiplier": 1.3,
      "min_star": 2,
      "max_star": 3,
      "suit_effect": {"2pc": {"stat_bonus": 0.05, "desc": "+5%全属性"}},
      "drop_rate": 0.30
    },
    "blue": {
      "quality_level": 3,
      "color_hex": "0080FF",
      "base_stat_multiplier": 1.6,
      "min_star": 3,
      "max_star": 4,
      "suit_effect": {"2pc": {"stat_bonus": 0.10, "desc": "+10%全属性"}},
      "drop_rate": 0.18
    },
    "purple": {
      "quality_level": 4,
      "color_hex": "8000FF",
      "base_stat_multiplier": 2.0,
      "min_star": 4,
      "max_star": 5,
      "suit_effect": {"2pc": {"stat_bonus": 0.15, "desc": "+15%全属性"}},
      "drop_rate": 0.08
    },
    "orange": {
      "quality_level": 5,
      "color_hex": "FF8000",
      "base_stat_multiplier": 2.5,
      "min_star": 5,
      "max_star": 6,
      "suit_effect": {"2pc": {"stat_bonus": 0.20, "desc": "+20%全属性"}},
      "drop_rate": 0.03
    },
    "red": {
      "quality_level": 6,
      "color_hex": "FF0000",
      "base_stat_multiplier": 3.0,
      "min_star": 6,
      "max_star": 7,
      "suit_effect": {"2pc": {"stat_bonus": 0.25, "desc": "+25%全属性"}},
      "drop_rate": 0.01
    }
  }
}
```

---

## 三、宝物属性数值表

### 3.1 基础属性数值（1星白品质）

| 属性类型 | 武器 | 饰品 | 特殊 |
|----------|:----:|:----:|:----:|
| 攻击 | 150 | 50 | 120 |
| 生命 | 800 | 1500 | 1000 |
| 防御 | 30 | 80 | 50 |
| 速度 | 5 | 8 | 3 |
| 暴击率 | 3% | 1% | 2% |
| 暴击伤害 | 5% | 2% | 4% |
| 抗性 | 0% | 3% | 1% |

### 3.2 强化属性成长表（每级）

| 星级 | 攻击/级 | 生命/级 | 防御/级 | 速度/级 |
|:----:|:-------:|:-------:|:-------:|:-------:|
| 1★ | +8 | +50 | +3 | +0.5 |
| 2★ | +12 | +75 | +5 | +0.8 |
| 3★ | +18 | +110 | +8 | +1.2 |
| 4★ | +25 | +160 | +12 | +1.8 |
| 5★ | +35 | +220 | +16 | +2.5 |
| 6★ | +48 | +300 | +22 | +3.5 |
| 7★ | +65 | +400 | +30 | +5.0 |

### 3.3 属性数值JSON配置

```json
{
  "artifact_base_stats": {
    "weapon": {
      "attack_base": 150,
      "hp_base": 800,
      "defense_base": 30,
      "speed_base": 5,
      "crit_rate_base": 0.03,
      "crit_damage_base": 0.05
    },
    "accessory": {
      "attack_base": 50,
      "hp_base": 1500,
      "defense_base": 80,
      "speed_base": 8,
      "crit_rate_base": 0.01,
      "crit_damage_base": 0.02
    },
    "special": {
      "attack_base": 120,
      "hp_base": 1000,
      "defense_base": 50,
      "speed_base": 3,
      "crit_rate_base": 0.02,
      "crit_damage_base": 0.04
    }
  },
  "artifact_levelup_stats": {
    "1": {"atk": 8, "hp": 50, "def": 3, "spd": 0.5},
    "2": {"atk": 12, "hp": 75, "def": 5, "spd": 0.8},
    "3": {"atk": 18, "hp": 110, "def": 8, "spd": 1.2},
    "4": {"atk": 25, "hp": 160, "def": 12, "spd": 1.8},
    "5": {"atk": 35, "hp": 220, "def": 16, "spd": 2.5},
    "6": {"atk": 48, "hp": 300, "def": 22, "spd": 3.5},
    "7": {"atk": 65, "hp": 400, "def": 30, "spd": 5.0}
  }
}
```

---

## 四、宝物强化与升星规则

### 4.1 强化系统

| 强化等级 | 消耗金币 | 消耗经验 | 成功率 |
|:--------:|:--------:|:--------:|:------:|
| 1→5 | 1,000/级 | 100 | 100% |
| 6→10 | 2,500/级 | 300 | 100% |
| 11→20 | 5,000/级 | 600 | 95% |
| 21→30 | 10,000/级 | 1,200 | 90% |
| 31→40 | 20,000/级 | 2,500 | 85% |
| 41→50 | 40,000/级 | 5,000 | 80% |
| 51→60 | 80,000/级 | 10,000 | 70% |

### 4.2 升星系统

| 升星 | 消耗碎片 | 消耗金币 | 成功率 | 失败惩罚 |
|:----:|:--------:|:--------:|:------:|----------|
| 1→2★ | 白×20 | 5,000 | 100% | - |
| 2→3★ | 绿×15 | 15,000 | 100% | - |
| 3→4★ | 蓝×10 | 40,000 | 95% | 返还80%碎片 |
| 4→5★ | 紫×8 | 100,000 | 90% | 返还70%碎片 |
| 5→6★ | 橙×5 | 250,000 | 85% | 返还60%碎片 |
| 6→7★ | 红×3 | 500,000 | 80% | 返还50%碎片 |

### 4.3 强化升星JSON配置

```json
{
  "artifact_enhancement": {
    "cost_per_level": {
      "1": {"coin": 1000, "exp": 100, "success_rate": 1.0},
      "5": {"coin": 1000, "exp": 100, "success_rate": 1.0},
      "10": {"coin": 2500, "exp": 300, "success_rate": 1.0},
      "15": {"coin": 5000, "exp": 600, "success_rate": 0.95},
      "20": {"coin": 5000, "exp": 600, "success_rate": 0.95},
      "25": {"coin": 10000, "exp": 1200, "success_rate": 0.90},
      "30": {"coin": 10000, "exp": 1200, "success_rate": 0.90},
      "35": {"coin": 20000, "exp": 2500, "success_rate": 0.85},
      "40": {"coin": 20000, "exp": 2500, "success_rate": 0.85},
      "45": {"coin": 40000, "exp": 5000, "success_rate": 0.80},
      "50": {"coin": 40000, "exp": 5000, "success_rate": 0.80},
      "55": {"coin": 80000, "exp": 10000, "success_rate": 0.75},
      "60": {"coin": 80000, "exp": 10000, "success_rate": 0.70}
    }
  },
  "artifact_star_upgrade": {
    "white_to_green": {"fragment": 20, "coin": 5000, "success_rate": 1.0, "fail_refund": 0},
    "green_to_blue": {"fragment": 15, "coin": 15000, "success_rate": 1.0, "fail_refund": 0},
    "blue_to_purple": {"fragment": 10, "coin": 40000, "success_rate": 0.95, "fail_refund": 0.8},
    "purple_to_orange": {"fragment": 8, "coin": 100000, "success_rate": 0.90, "fail_refund": 0.7},
    "orange_to_red": {"fragment": 5, "coin": 250000, "success_rate": 0.85, "fail_refund": 0.6},
    "red_to_max": {"fragment": 3, "coin": 500000, "success_rate": 0.80, "fail_refund": 0.5}
  }
}
```

---

## 五、宝物获取途径

### 5.1 获取途径总表

| 途径 | 产出品质 | 产出概率 | 每日次数 |
|------|----------|:--------:|:--------:|
| 普通宝物池 | 白/绿/蓝 | 70%/25%/5% | 不限 |
| 限定宝物池 | 蓝/紫/橙 | 60%/30%/10% | 不限 |
| 主线副本 | 白/绿/蓝 | 随机 | 3次 |
| 精英副本 | 绿/蓝/紫 | 50%/35%/15% | 1次 |
| 宝物秘境 | 蓝/紫/橙 | 40%/45%/15% | 1次 |
| 公会商店 | 蓝/紫 | 可购买 | 限量 |
| 活动奖励 | 紫/橙/红 | 概率 | 活动期间 |

### 5.2 宝物碎片获取

| 碎片类型 | 每日产出 | 周常产出 | 活动产出 |
|----------|:--------:|:--------:|:--------:|
| 白色碎片 | 10个 | 30个 | 50个 |
| 绿色碎片 | 5个 | 15个 | 30个 |
| 蓝色碎片 | 2个 | 8个 | 15个 |
| 紫色碎片 | 0个 | 3个 | 8个 |
| 橙色碎片 | 0个 | 0个 | 3个 |
| 红色碎片 | 0个 | 0个 | 1个 |

### 5.3 获取途径JSON配置

```json
{
  "artifact_acquisition": {
    "gacha_pools": {
      "common_artifact_pool": {
        "pool_id": "common_artifact_pool",
        "pull_cost": 100,
        "quality_rates": {
          "white": 0.70,
          "green": 0.25,
          "blue": 0.05
        }
      },
      "limited_artifact_pool": {
        "pool_id": "limited_artifact_pool",
        "pull_cost": 280,
        "quality_rates": {
          "blue": 0.60,
          "purple": 0.30,
          "orange": 0.10
        }
      }
    },
    "dungeon_drops": {
      "main_chapter": {
        "daily_limit": 3,
        "quality_rates": {
          "white": 0.50,
          "green": 0.35,
          "blue": 0.15
        }
      },
      "elite_chapter": {
        "daily_limit": 1,
        "quality_rates": {
          "green": 0.50,
          "blue": 0.35,
          "purple": 0.15
        }
      },
      "artifact_dungeon": {
        "daily_limit": 1,
        "quality_rates": {
          "blue": 0.40,
          "purple": 0.45,
          "orange": 0.15
        }
      }
    }
  }
}
```

---

## 六、宝物转移系统

### 6.1 宝物槽配置

| 英雄等级 | 解锁槽位 | 备注 |
|:--------:|:--------:|------|
| 1级 | 1槽 | 初始即可装备 |
| 80级 | 强化槽 | 可装备2件 |
| 180级 | 完美槽 | 可装备3件 |

### 6.2 转移规则

```json
{
  "artifact_transfer": {
    "enabled": true,
    "rules": [
      {
        "rule_id": "free_transfer",
        "description": "同品质宝物自由转移",
        "cost": 0,
        "limit": "none"
      },
      {
        "rule_id": "cross_quality_transfer",
        "description": "跨品质转移需消耗转移石",
        "cost_type": "transfer_stone",
        "cost_amount": {
          "white_to_green": 1,
          "green_to_blue": 2,
          "blue_to_purple": 3,
          "purple_to_orange": 5,
          "orange_to_red": 10
        }
      }
    ],
    "transfer_cooldown": 0,
    "preserves_enhancement": true,
    "preserves_star_level": true
  }
}
```

---

## 七、版本记录

| 版本 | 日期 | 修改内容 |
|:----:|:----:|----------|
| 1.0 | 2026-04-24 | 初始版本，完成宝物系统基础框架 |
