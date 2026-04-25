# 《苍穹劫·摸金传人》商品定价策略设计文档

> 版本：1.0
> 更新日期：2026年4月24日
> 设计原则：鲸鱼玩家成长速度 = 免费玩家 × 2

---

## 一、货币体系设计

### 1.1 核心货币类型

| 货币 | 图标 | 获取方式 | 主要用途 |
|------|------|----------|----------|
| 钻石 | 💎 | 充值、月卡、活跃 | 抽卡、商城购物 |
| 金币 | 🪙 | 副本、任务、产出 | 英雄升级、强化、升星 |
| 体力 | ⚡ | 自然回复、购买 | 挑战副本消耗 |
| 抽卡券 | 🎫 | 活动赠送、周常 | 对应卡池抽卡 |
| 友情点 | 🤝 | 好友互动 | 友情抽卡 |

### 1.2 货币价值体系

```json
{
  "currency_value": {
    "diamond": {
      "display_name": "钻石",
      "icon": "currency/diamond.png",
      "rmb_conversion": 0.10,
      "rmb_per_diamond": 0.1,
      "diamond_per_rmb": 10,
      "monthly_card_daily": 150,
      "description": "核心付费货币"
    },
    "gold": {
      "display_name": "金币",
      "icon": "currency/gold.png",
      "daily_free": 50000,
      "monthly_card_bonus": 30000,
      "max_storage": 999999999,
      "description": "主要养成消耗货币"
    },
    "energy": {
      "display_name": "体力",
      "icon": "currency/energy.png",
      "max_storage": 120,
      "regen_per_minute": 1,
      "cost_per_chapter": 6,
      "description": "副本挑战消耗"
    },
    "friendship_point": {
      "display_name": "友情点",
      "icon": "currency/friendship.png",
      "daily_limit": 100,
      "friendship_draw_cost": 20,
      "description": "友情抽卡货币"
    }
  }
}
```

---

## 二、钻石定价策略

### 2.1 充值档位设计

| 档位 | 钻石数 | 原价 | 优惠价 | 折扣率 | 首充赠送 |
|:----:|:------:|:----:|:------:|:------:|:--------:|
| 小额1 | 60 | 6元 | 6元 | 100% | +30钻 |
| 小额2 | 180 | 18元 | 18元 | 100% | +90钻 |
| 中额1 | 300 | 30元 | 30元 | 100% | +150钻 |
| 中额2 | 680 | 68元 | 58元 | 85% | +340钻 |
| 大额1 | 980 | 98元 | 78元 | 80% | +490钻 |
| 大额2 | 1980 | 198元 | 148元 | 75% | +990钻 |
| 大额3 | 3280 | 328元 | 228元 | 70% | +1640钻 |
| 特大额 | 6480 | 648元 | 388元 | 60% | +3240钻 |

### 2.2 充值档位JSON配置

```json
{
  "recharge_tiers": [
    {
      "tier_id": "tier_1",
      "tier_name": "探险基金",
      "diamond_amount": 60,
      "original_price": 6,
      "final_price": 6,
      "discount_rate": 1.0,
      "first_purchase_bonus": 30,
      "is_first_purchase": true,
      "sort_order": 1
    },
    {
      "tier_id": "tier_2",
      "tier_name": "摸金补给",
      "diamond_amount": 180,
      "original_price": 18,
      "final_price": 18,
      "discount_rate": 1.0,
      "first_purchase_bonus": 90,
      "is_first_purchase": true,
      "sort_order": 2
    },
    {
      "tier_id": "tier_3",
      "tier_name": "古墓探秘",
      "diamond_amount": 300,
      "original_price": 30,
      "final_price": 30,
      "discount_rate": 1.0,
      "first_purchase_bonus": 150,
      "is_first_purchase": true,
      "sort_order": 3
    },
    {
      "tier_id": "tier_4",
      "tier_name": "宝藏猎人",
      "diamond_amount": 680,
      "original_price": 68,
      "final_price": 58,
      "discount_rate": 0.85,
      "first_purchase_bonus": 340,
      "is_first_purchase": false,
      "sort_order": 4
    },
    {
      "tier_id": "tier_5",
      "tier_name": "搬山道人",
      "diamond_amount": 980,
      "original_price": 98,
      "final_price": 78,
      "discount_rate": 0.80,
      "first_purchase_bonus": 490,
      "is_first_purchase": false,
      "sort_order": 5
    },
    {
      "tier_id": "tier_6",
      "tier_name": "发丘中郎",
      "diamond_amount": 1980,
      "original_price": 198,
      "final_price": 148,
      "discount_rate": 0.75,
      "first_purchase_bonus": 990,
      "is_first_purchase": false,
      "sort_order": 6
    },
    {
      "tier_id": "tier_7",
      "tier_name": "摸金校尉",
      "diamond_amount": 3280,
      "original_price": 328,
      "final_price": 228,
      "discount_rate": 0.70,
      "first_purchase_bonus": 1640,
      "is_first_purchase": false,
      "sort_order": 7
    },
    {
      "tier_id": "tier_8",
      "tier_name": "卸岭力士",
      "diamond_amount": 6480,
      "original_price": 648,
      "final_price": 388,
      "discount_rate": 0.60,
      "first_purchase_bonus": 3240,
      "is_first_purchase": false,
      "sort_order": 8
    }
  ]
}
```

---

## 三、月卡/通行证设计

### 3.1 月卡体系

| 产品 | 价格 | 有效期 | 每日收益 | 总收益 | ROI |
|------|:----:|:------:|:--------:|:------:|:---:|
| 月卡 | 30元 | 30天 | 150钻+3万金币 | 4500钻+90万金币 | 15元/100钻 |
| 高级月卡 | 68元 | 30天 | 300钻+6万金币+专属抽卡券 | 9000钻+180万金币 | 7.5元/100钻 |
| 终身月卡 | 298元 | 永久 | 150钻 | 无限 | 递减 |

### 3.2 通行证体系（赛季制）

| 类型 | 价格 | 持续时间 | 基础奖励 | 高级奖励 | 等级上限 |
|------|:----:|:--------:|----------|----------|:--------:|
| 免费通行证 | 0元 | 6周 | 基础奖励 | - | 30级 |
| 高级通行证 | 68元 | 6周 | 基础奖励 | 高级奖励 | 50级 |
| 豪华通行证 | 198元 | 6周 | 基础奖励 | 高级+豪华奖励 | 50级 |

### 3.3 月卡通行证JSON配置

```json
{
  "subscription_products": {
    "monthly_card": {
      "product_id": "monthly_card",
      "name": "摸金月卡",
      "price": 30,
      "duration_days": 30,
      "daily_rewards": {
        "diamond": 150,
        "gold": 30000
      },
      "total_rewards": {
        "diamond": 4500,
        "gold": 900000
      },
      "benefits": [
        "每日领取150钻石",
        "每日领取3万金币",
        "体力上限+20"
      ],
      "auto_renew": true
    },
    "premium_monthly_card": {
      "product_id": "premium_monthly_card",
      "name": "搬山月卡",
      "price": 68,
      "duration_days": 30,
      "daily_rewards": {
        "diamond": 300,
        "gold": 60000,
        "limited_ticket": 1
      },
      "total_rewards": {
        "diamond": 9000,
        "gold": 1800000,
        "limited_ticket": 30
      },
      "benefits": [
        "每日领取300钻石",
        "每日领取6万金币",
        "每日赠送限定抽卡券",
        "体力上限+50",
        "专属月卡头像框"
      ],
      "auto_renew": true
    },
    "battle_pass": {
      "product_id": "battle_pass",
      "name": "古墓通行证",
      "price": 68,
      "duration_days": 42,
      "total_levels": 50,
      "level_duration_days": 0.84,
      "free_track_rewards": {
        "coin": 500000,
        "exp_potion": 1000,
        "common_ticket": 5
      },
      "premium_track_rewards": {
        "diamond": 2000,
        "ssr_fragment": 30,
        "exclusive_artifact": 1,
        "hero_choice_chest": 2
      }
    }
  }
}
```

---

## 四、礼包定价设计

### 4.1 新手礼包

| 礼包名称 | 价格 | 钻石价值 | 赠送内容 | 限购 |
|----------|:----:|:--------:|----------|:----:|
| 1元新手礼包 | 1元 | 100钻等值 | 10连抽卡券×1+金币×50000 | 永久 |
| 6元成长礼包 | 6元 | 600钻等值 | SR英雄自选×1+抽卡券×3 | 7天 |
| 30元新手礼包 | 30元 | 2000钻等值 | SSR英雄×1+限定抽卡券×5 | 永久 |

### 4.2 限时礼包（周循环）

| 礼包名称 | 原价 | 现价 | 折扣 | 内容 | 刷新 |
|----------|:----:|:----:|:----:|------|:----:|
| 每日特惠 | 30元 | 6元 | 80%off | 100钻+体力药水×5 | 每日 |
| 体力补给 | 18元 | 9元 | 50%off | 体力×120+金币×50000 | 每日 |
| 摸金礼包 | 68元 | 30元 | 56%off | 300钻+抽卡券×3+金币×100000 | 每周 |
| 宝藏礼包 | 198元 | 98元 | 50%off | 980钻+限定抽卡券×5+SR碎片×20 | 每周 |
| 古墓礼包 | 328元 | 168元 | 49%off | 1980钻+限定十连×1+UR碎片×5 | 每月 |

### 4.3 成长礼包（等级解锁）

| 等级 | 礼包名称 | 价格 | 内容 |
|:----:|----------|:----:|------|
| 10级 | 10级成长礼 | 18元 | 200钻+抽卡券×2+金币×100000 |
| 20级 | 20级成长礼 | 30元 | 300钻+SR碎片×10+金币×200000 |
| 30级 | 30级成长礼 | 68元 | 500钻+SR自选×1+限定抽卡券×3 |
| 40级 | 40级成长礼 | 98元 | 800钻+SSR碎片×10+金币×500000 |
| 50级 | 50级成长礼 | 128元 | 1000钻+SSR自选×1+限定抽卡券×5 |

### 4.4 礼包JSON配置

```json
{
  "limited_time_packages": {
    "daily_deal": {
      "package_id": "daily_deal_001",
      "name": "每日特惠",
      "original_price": 30,
      "final_price": 6,
      "discount_rate": 0.20,
      "refresh_type": "daily",
      "contents": {
        "diamond": 100,
        "energy_potion": 5
      },
      "purchase_limit": 1,
      "limit_reset_time": "00:00"
    },
    "weekly_gacha_package": {
      "package_id": "weekly_gacha_001",
      "name": "摸金礼包",
      "original_price": 68,
      "final_price": 30,
      "discount_rate": 0.44,
      "refresh_type": "weekly",
      "contents": {
        "diamond": 300,
        "common_ticket": 3,
        "gold": 100000
      },
      "purchase_limit": 1
    },
    "monthly_premium_package": {
      "package_id": "monthly_premium_001",
      "name": "古墓礼包",
      "original_price": 328,
      "final_price": 168,
      "discount_rate": 0.49,
      "refresh_type": "monthly",
      "contents": {
        "diamond": 1980,
        "limited_ten_ticket": 1,
        "ur_fragment": 5
      },
      "purchase_limit": 1
    }
  },
  "level_unlock_packages": {
    "level_10_package": {
      "unlock_level": 10,
      "package_id": "level_10_package",
      "name": "10级成长礼",
      "price": 18,
      "contents": {
        "diamond": 200,
        "common_ticket": 2,
        "gold": 100000
      },
      "purchase_limit": 1
    },
    "level_20_package": {
      "unlock_level": 20,
      "package_id": "level_20_package",
      "name": "20级成长礼",
      "price": 30,
      "contents": {
        "diamond": 300,
        "sr_fragment": 10,
        "gold": 200000
      },
      "purchase_limit": 1
    }
  }
}
```

---

## 五、付费点节奏设计

### 5.1 新手期付费节奏（1-7天）

| 时间点 | 付费产品 | 价格 | 目的 |
|--------|----------|:----:|------|
| 第1天 | 1元新手礼包 | 1元 | 降低付费门槛 |
| 第1天 | 首充6元 | 6元 | 建立付费习惯 |
| 第3天 | 月卡 | 30元 | 稳定日活 |
| 第5天 | 30元新手礼包 | 30元 | 获取SSR英雄 |
| 第7天 | 成长礼包 | 18-30元 | 加速成长 |

### 5.2 成长期付费节奏（8-30天）

| 时间点 | 付费产品 | 触发条件 | 目的 |
|--------|----------|----------|------|
| 第8天 | 高级月卡 | 月卡到期 | 升级付费 |
| 每周末 | 周末特惠礼包 | 周六日 | 促进周活 |
| 卡关时 | 体力礼包 | 战力不足 | 辅助通关 |
| 第14天 | 古墓通行证 | 首期结束 | 赛季内容 |

### 5.3 成熟期付费节奏（30天+）

| 时间点 | 付费产品 | 频率 | 目的 |
|--------|----------|:----:|------|
| 每月 | 月卡续费 | 月 | 稳定留存 |
| 每期 | 限定池 | 14-21天 | 收集驱动 |
| 每月 | 古墓通行证 | 月 | 赛季内容 |
| 卡关 | 加速礼包 | 需要时 | 付费突破 |

### 5.4 付费节奏JSON配置

```json
{
  "payment_timeline": {
    "newbie_phase": {
      "day_1": [
        {"product": "newbie_1yuan", "price": 1, "purpose": "lower_entry_barrier"},
        {"product": "first_recharge_6yuan", "price": 6, "purpose": "establish_payment_habit"}
      ],
      "day_3": [{"product": "monthly_card", "price": 30, "purpose": "stable_dau"}],
      "day_5": [{"product": "newbie_30yuan", "price": 30, "purpose": "provide_ssr_hero"}],
      "day_7": [{"product": "level_growth_pack", "price": 18, "purpose": "accelerate_growth"}]
    },
    "growth_phase": {
      "week_2": [{"product": "premium_monthly_card", "price": 68, "purpose": "upgrade_subscription"}],
      "weekly": [{"product": "weekend_special_pack", "price": 30, "purpose": "weekly_retention"}],
      "stuck_point": [{"product": "energy_pack", "price": 18, "purpose": "assist_progress"}]
    },
    "mature_phase": {
      "monthly": [
        {"product": "monthly_card", "price": 30, "purpose": "subscription_retention"},
        {"product": "battle_pass", "price": 68, "purpose": "season_content"}
      ],
      "event_cycle": [
        {"product": "limited_pool_spending", "price": 280, "purpose": "collection_driven"},
        {"product": "premium_artifact_pack", "price": 98, "purpose": "power_progression"}
      ]
    }
  }
}
```

---

## 六、鲸鱼玩家消费路径

### 6.1 鲸鱼玩家消费画像

| 消费层级 | 月消费 | 主要消费点 | 追求目标 |
|----------|:------:|------------|----------|
| 小鲸鱼 | 500-2000元 | 月卡+通行证+活动 | 全SR+部分SSR |
| 中鲸鱼 | 2000-5000元 | 限定池+成长礼包 | 全SSR+部分UR |
| 大鲸鱼 | 5000-20000元 | 全部付费内容 | 满UR+高星 |
| 鲨鱼鲸 | 20000+元 | 无差别消费 | 极致收集+战力 |

### 6.2 鲸鱼专属内容

```json
{
  "whale_content": {
    "vip_tiers": {
      "vip_15": {"monthly_spend_threshold": 500, "exclusive_dungeon": true},
      "vip_16": {"monthly_spend_threshold": 1000, "exclusive_shop": true},
      "vip_17": {"monthly_spend_threshold": 2000, "whale_exclusive_arena": true},
      "vip_18": {"monthly_spend_threshold": 5000, "early_access_new_hero": true},
      "vip_19": {"monthly_spend_threshold": 10000, "exclusive_legendary_hero": true},
      "vip_20": {"monthly_spend_threshold": 20000, "naming_rights": true}
    },
    "whale_exclusive": {
      "exclusive_artifact_set": {
        "set_name": "帝王套装",
        "stat_bonus": "全属性+30%",
        "acquisition": "VIP15+专属商店"
      },
      "whale_arena": {
        "name": "摸金排行榜",
        "rewards": "限定称号+专属头像框+大量钻石"
      },
      "personal_concierge": {
        "name": "专属客服",
        "threshold": "VIP18+",
        "services": ["优先处理", "定制补偿", "需求反馈"]
      }
    }
  }
}
```

---

## 七、版本记录

| 版本 | 日期 | 修改内容 |
|:----:|:----:|----------|
| 1.0 | 2026-04-24 | 初始版本，完成定价策略框架 |
