# 《苍穹劫·摸金传人》VIP系统设计文档

> 版本：1.0
> 更新日期：2026年4月24日
> 设计原则：鲸鱼玩家成长速度 = 免费玩家 × 2

---

## 一、VIP等级划分

### 1.1 VIP等级总览

| VIP等级 | 月消费门槛 | 累计消费 | 等级标识 | 解锁称号 |
|:-------:|:----------:|:--------:|:--------:|----------|
| VIP 0 | 0元 | 0元 | - | 平民摸金人 |
| VIP 1 | 6元 | 6元 | 铜印 | 初入摸金 |
| VIP 2 | 30元 | 30元 | 银印 | 探墓学徒 |
| VIP 3 | 68元 | 68元 | 金印 | 摸金新手 |
| VIP 4 | 128元 | 128元 | 玉印 | 古墓猎人 |
| VIP 5 | 228元 | 228元 | 琉璃印 | 搬山道人 |
| VIP 6 | 328元 | 328元 | 玛瑙印 | 发丘中郎 |
| VIP 7 | 500元 | 500元 | 翡翠印 | 摸金校尉 |
| VIP 8 | 800元 | 800元 | 珍珠印 | 卸岭力士 |
| VIP 9 | 1200元 | 1200元 | 红宝石印 | 搬山魁首 |
| VIP 10 | 1800元 | 1800元 | 蓝宝石印 | 发丘天官 |
| VIP 11 | 2600元 | 2600元 | 钻石印 | 摸金大校 |
| VIP 12 | 3600元 | 3600元 | 皇冠印 | 卸岭至尊 |
| VIP 13 | 5000元 | 5000元 | 鑲金印 | 古墓王者 |
| VIP 14 | 7000元 | 7000元 | 水晶王印 | 摸金传奇 |
| VIP 15 | 10000元 | 10000元 | 紫金印 | 苍穹之主 |
| VIP 16 | 15000元 | 15000元 | 龙纹印 | 苍穹霸主 |
| VIP 17 | 22000元 | 22000元 | 凤翼印 | 苍穹帝王 |
| VIP 18 | 32000元 | 32000元 | 神兽印 | 苍穹神尊 |
| VIP 19 | 50000元 | 50000元 | 天尊印 | 苍穹天尊 |
| VIP 20 | 80000元 | 80000元 | 帝王印 | 苍穹帝王·神 |

### 1.2 VIP等级JSON配置

```json
{
  "vip_levels": {
    "0": {
      "level": 0,
      "monthly_threshold": 0,
      "cumulative_threshold": 0,
      "title": "平民摸金人",
      "badge": null,
      "badge_color": null
    },
    "1": {
      "level": 1,
      "monthly_threshold": 6,
      "cumulative_threshold": 6,
      "title": "初入摸金",
      "badge": "铜印",
      "badge_color": "CD7F32"
    },
    "2": {
      "level": 2,
      "monthly_threshold": 30,
      "cumulative_threshold": 30,
      "title": "探墓学徒",
      "badge": "银印",
      "badge_color": "C0C0C0"
    },
    "3": {
      "level": 3,
      "monthly_threshold": 68,
      "cumulative_threshold": 68,
      "title": "摸金新手",
      "badge": "金印",
      "badge_color": "FFD700"
    },
    "5": {
      "level": 5,
      "monthly_threshold": 228,
      "cumulative_threshold": 228,
      "title": "搬山道人",
      "badge": "琉璃印",
      "badge_color": "50C878"
    },
    "10": {
      "level": 10,
      "monthly_threshold": 1800,
      "cumulative_threshold": 1800,
      "title": "发丘天官",
      "badge": "蓝宝石印",
      "badge_color": "4169E1"
    },
    "15": {
      "level": 15,
      "monthly_threshold": 10000,
      "cumulative_threshold": 10000,
      "title": "苍穹之主",
      "badge": "紫金印",
      "badge_color": "9966CC"
    },
    "20": {
      "level": 20,
      "monthly_threshold": 80000,
      "cumulative_threshold": 80000,
      "title": "苍穹帝王·神",
      "badge": "帝王印",
      "badge_color": "FF4500"
    }
  }
}
```

---

## 二、VIP特权设计

### 2.1 特权分类总览

| 特权类别 | 影响系统 | 解锁等级 | 说明 |
|----------|----------|:--------:|------|
| **资源特权** | 体力、副本收益 | VIP 1+ | 资源获取加成 |
| **功能特权** | 背包、背包扩展 | VIP 2+ | 游戏功能解锁 |
| **社交特权** | 好友、公会 | VIP 3+ | 社交功能增强 |
| **战斗特权** | 自动战斗、扫荡 | VIP 4+ | 战斗效率提升 |
| **商城特权** | 每日特惠、限购 | VIP 5+ | 购物优惠 |
| **专属特权** | 专属副本、称号 | VIP 10+ | 独享内容 |

### 2.2 详细特权表

```json
{
  "vip_privileges": {
    "resource_privileges": {
      "1": {
        "privilege": "体力上限+20",
        "description": "体力存储上限提升至140",
        "icon": "vip/privilege/energy.png"
      },
      "3": {
        "privilege": "体力上限+50",
        "description": "体力存储上限提升至170",
        "icon": "vip/privilege/energy.png"
      },
      "5": {
        "privilege": "体力上限+100",
        "description": "体力存储上限提升至220",
        "icon": "vip/privilege/energy.png"
      },
      "8": {
        "privilege": "体力上限+150",
        "description": "体力存储上限提升至270",
        "icon": "vip/privilege/energy.png"
      },
      "12": {
        "privilege": "体力上限+200",
        "description": "体力存储上限提升至320",
        "icon": "vip/privilege/energy.png"
      },
      "15": {
        "privilege": "体力上限+300",
        "description": "体力存储上限提升至420",
        "icon": "vip/privilege/energy.png"
      }
    },
    "dungeon_privileges": {
      "2": {
        "privilege": "精英副本双倍掉落",
        "description": "精英副本首次通关双倍奖励",
        "icon": "vip/privilege/drop.png"
      },
      "5": {
        "privilege": "全体副本双倍掉落",
        "description": "所有副本首次通关双倍奖励",
        "icon": "vip/privilege/drop.png"
      },
      "10": {
        "privilege": "全体副本三倍掉落",
        "description": "所有副本首次通关三倍奖励",
        "icon": "vip/privilege/drop.png"
      }
    },
    "battle_privileges": {
      "3": {
        "privilege": "解锁自动战斗II",
        "description": "可设置自动释放技能",
        "icon": "vip/privilege/auto.png"
      },
      "6": {
        "privilege": "解锁一键扫荡",
        "description": "快速通关已通关关卡",
        "icon": "vip/privilege/sweep.png"
      },
      "9": {
        "privilege": "扫荡10次",
        "description": "单次扫荡最多10关",
        "icon": "vip/privilege/sweep.png"
      },
      "14": {
        "privilege": "扫荡50次",
        "description": "单次扫荡最多50关",
        "icon": "vip/privilege/sweep.png"
      }
    },
    "social_privileges": {
      "2": {
        "privilege": "好友上限+20",
        "description": "好友数量上限提升至70",
        "icon": "vip/privilege/social.png"
      },
      "5": {
        "privilege": "好友上限+50",
        "description": "好友数量上限提升至100",
        "icon": "vip/privilege/social.png"
      },
      "8": {
        "privilege": "创建公会",
        "description": "解锁创建公会功能",
        "icon": "vip/privilege/guild.png"
      }
    },
    "shop_privileges": {
      "4": {
        "privilege": "商城每日特惠",
        "description": "每日可购买特惠礼包",
        "icon": "vip/privilege/shop.png"
      },
      "7": {
        "privilege": "限购商品双倍",
        "description": "每日限购商品数量翻倍",
        "icon": "vip/privilege/shop.png"
      },
      "11": {
        "privilege": "专属VIP商品",
        "description": "解锁VIP专属商城",
        "icon": "vip/privilege/shop.png"
      }
    },
    "exclusive_privileges": {
      "10": {
        "privilege": "专属称号",
        "description": "获得VIP专属游戏称号",
        "icon": "vip/privilege/title.png"
      },
      "15": {
        "privilege": "专属头像框",
        "description": "获得VIP专属头像框",
        "icon": "vip/privilege/avatar.png"
      },
      "18": {
        "privilege": "专属特效",
        "description": "获得VIP专属技能特效",
        "icon": "vip/privilege/effect.png"
      },
      "20": {
        "privilege": "角色命名权",
        "description": "可命名游戏内NPC或地点",
        "icon": "vip/privilege/naming.png"
      }
    }
  }
}
```

---

## 三、VIP礼包内容

### 3.1 每月VIP礼包

| VIP等级 | 礼包名称 | 价格 | 内容 | 性价比 |
|:-------:|----------|:----:|------|:------:|
| VIP 1 | 铜印礼包 | 6元 | 60钻+体力药水×10 | 1.0x |
| VIP 2 | 银印礼包 | 30元 | 300钻+抽卡券×2+金币×50000 | 1.0x |
| VIP 3 | 金印礼包 | 68元 | 680钻+SR碎片×5+金币×100000 | 1.0x |
| VIP 4 | 玉印礼包 | 60元 | 600钻+SR碎片×10 | 1.0x |
| VIP 5 | 琉璃礼包 | 128元 | 1280钻+限定抽卡券×3+金币×200000 | 1.0x |
| VIP 6-20 | 高级礼包 | 递增 | 钻石+碎片+专属道具 | 1.2x |

### 3.2 VIP专属礼包JSON配置

```json
{
  "vip_monthly_packages": {
    "1": {
      "package_id": "vip1_monthly",
      "vip_level_required": 1,
      "name": "铜印礼包",
      "price": 6,
      "contents": {
        "diamond": 60,
        "energy_potion": 10
      },
      "purchase_limit": "monthly"
    },
    "3": {
      "package_id": "vip3_monthly",
      "vip_level_required": 3,
      "name": "金印礼包",
      "price": 68,
      "contents": {
        "diamond": 680,
        "sr_fragment": 5,
        "gold": 100000
      },
      "purchase_limit": "monthly"
    },
    "5": {
      "package_id": "vip5_monthly",
      "vip_level_required": 5,
      "name": "琉璃礼包",
      "price": 128,
      "contents": {
        "diamond": 1280,
        "limited_ticket": 3,
        "gold": 200000
      },
      "purchase_limit": "monthly"
    },
    "10": {
      "package_id": "vip10_monthly",
      "vip_level_required": 10,
      "name": "蓝宝石礼包",
      "price": 198,
      "contents": {
        "diamond": 1980,
        "ssr_fragment": 10,
        "limited_ticket": 5,
        "exclusive_artifact_shard": 5
      },
      "purchase_limit": "monthly"
    },
    "15": {
      "package_id": "vip15_monthly",
      "vip_level_required": 15,
      "name": "紫金礼包",
      "price": 328,
      "contents": {
        "diamond": 3280,
        "ur_fragment": 5,
        "limited_ticket": 10,
        "exclusive_artifact": 1,
        "vip_exclusive_skin_token": 1
      },
      "purchase_limit": "monthly"
    }
  }
}
```

### 3.3 VIP专属商店

| VIP等级 | 商店名称 | 商品类型 | 刷新频率 |
|:-------:|----------|----------|:--------:|
| VIP 5+ | 珍宝商店 | SSR碎片、稀有道具 | 每周 |
| VIP 10+ | 摸金商店 | UR碎片、专属装备 | 每周 |
| VIP 15+ | 帝王商店 | 限定英雄、专属外观 | 每月 |

---

## 四、VIP积分获取规则

### 4.1 积分获取途径

| 消费行为 | 积分比例 | 说明 |
|----------|:--------:|------|
| 充值钻石 | 1元=10积分 | 100%获得VIP积分 |
| 购买月卡 | 1元=15积分 | 额外50%积分加成 |
| 购买通行证 | 1元=12积分 | 额外20%积分加成 |
| 购买礼包 | 1元=8积分 | 部分道具消费 |

### 4.2 积分与等级换算

| VIP等级 | 累计积分 | 月均积分 | 达成方式 |
|:-------:|:--------:|:--------:|----------|
| VIP 1 | 60 | 60 | 首充6元 |
| VIP 2 | 300 | 300 | 月卡 |
| VIP 3 | 680 | 680 | 高级月卡 |
| VIP 5 | 2280 | 760 | 中等消费 |
| VIP 10 | 18000 | 1800 | 重度消费 |
| VIP 15 | 100000 | 6667 | 鲸鱼玩家 |
| VIP 20 | 800000 | 40000 | 超鲸鱼玩家 |

### 4.3 VIP积分JSON配置

```json
{
  "vip_points": {
    "acquisition_rules": {
      "diamond_recharge": {
        "ratio": 10,
        "description": "1元充值获得10VIP积分",
        "cap_per_day": null
      },
      "monthly_card": {
        "ratio": 15,
        "description": "月卡消费获得1.5倍积分",
        "bonus_multiplier": 1.5
      },
      "battle_pass": {
        "ratio": 12,
        "description": "通行证消费获得1.2倍积分",
        "bonus_multiplier": 1.2
      },
      "package_purchase": {
        "ratio": 8,
        "description": "礼包消费获得0.8倍积分",
        "bonus_multiplier": 0.8
      }
    },
    "level_thresholds": {
      "1": 60,
      "2": 300,
      "3": 680,
      "4": 1280,
      "5": 2280,
      "6": 3280,
      "7": 5000,
      "8": 8000,
      "9": 12000,
      "10": 18000,
      "11": 26000,
      "12": 36000,
      "13": 50000,
      "14": 70000,
      "15": 100000,
      "16": 150000,
      "17": 220000,
      "18": 320000,
      "19": 500000,
      "20": 800000
    }
  }
}
```

---

## 五、VIP成长加速

### 5.1 VIP专属成长资源

| VIP等级 | 每日赠送 | 每周赠送 | 每月赠送 |
|:-------:|:--------:|:--------:|:--------:|
| VIP 1 | 体力药水×2 | 金币×50000 | SR碎片×3 |
| VIP 3 | 体力药水×5 | 金币×100000 | SR碎片×5 |
| VIP 5 | 体力药水×10 | 抽卡券×1 | SSR碎片×3 |
| VIP 10 | 体力药水×20 | 限定抽卡券×1 | UR碎片×2 |
| VIP 15 | 体力药水×30 | 限定抽卡券×2 | UR碎片×5 |
| VIP 20 | 体力药水×50 | 限定十连券×1 | UR碎片×10 |

### 5.2 VIP专属功能解锁

```json
{
  "vip_exclusive_features": {
    "function_unlock": {
      "vip_2": ["elite_double_drop", "friend_limit_plus_20"],
      "vip_3": ["auto_battle_II", "vip_daily_pack"],
      "vip_4": ["daily_special_shop"],
      "vip_5": ["one_key_sweep", "all_dungeon_double_drop", "create_guild"],
      "vip_6": ["friend_limit_plus_50"],
      "vip_7": ["shop_purchase_limit_double"],
      "vip_8": ["friend_limit_plus_100"],
      "vip_9": ["sweep_10_times"],
      "vip_10": ["all_dungeon_triple_drop", "vip_exclusive_title", "sweep_20_times"],
      "vip_12": ["sweep_30_times"],
      "vip_14": ["sweep_50_times"],
      "vip_15": ["vip_exclusive_frame", "vip_exclusive_shop"],
      "vip_18": ["vip_exclusive_effect", "whale_arena_access"],
      "vip_20": ["naming_rights", "legendary_hero_guarantee"]
    }
  }
}
```

---

## 六、VIP专属活动

### 6.1 VIP专属活动类型

| 活动名称 | 开放条件 | 频率 | 奖励 |
|----------|----------|:----:|------|
| 摸金大回馈 | VIP 5+ | 月 | 大量钻石+碎片 |
| 限时UP池 | VIP 8+ | 活动 | 限定英雄概率翻倍 |
| 专属副本 | VIP 10+ | 常驻 | 稀有材料 |
| 鲸鱼排行榜 | VIP 15+ | 赛季 | 限定称号+头像 |
| 线下聚会 | VIP 18+ | 年 | 实物奖励 |

### 6.2 专属活动JSON配置

```json
{
  "vip_exclusive_events": {
    "vip_feedback": {
      "event_id": "vip_feedback_monthly",
      "name": "摸金大回馈",
      "vip_requirement": 5,
      "frequency": "monthly",
      "duration_days": 7,
      "rewards": {
        "diamond": 1000,
        "sr_fragment": 20,
        "ssr_fragment": 5,
        "limited_ticket": 3
      }
    },
    "whale_arena": {
      "event_id": "whale_arena_season",
      "name": "摸金排行榜",
      "vip_requirement": 15,
      "frequency": "season",
      "duration_days": 42,
      "rewards": {
        "rank_1": {"exclusive_title": "摸金帝王", "diamond": 10000, "skin": "legendary"},
        "rank_2_10": {"exclusive_title": "摸金至尊", "diamond": 5000, "artifact": "epic"},
        "rank_11_100": {"exclusive_title": "摸金大师", "diamond": 2000, "fragment": "ur_10"}
      }
    }
  }
}
```

---

## 七、版本记录

| 版本 | 日期 | 修改内容 |
|:----:|:----:|----------|
| 1.0 | 2026-04-24 | 初始版本，完成VIP系统基础框架 |
