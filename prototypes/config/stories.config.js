/**
 * 剧情配置（从 stories.md 编译生成）
 * 编辑剧情请修改 stories.md，然后运行 npm run build:stories
 */

const STORIES_CONFIG = {
  // 关卡开场剧情
  levelIntro: {
    1: [{
      background: 'tomb_entrance',
      dialogues: [
        { speaker: '旁白', text: '在这座被封印千年的古老墓穴中，传说埋藏着失落王朝的宝藏...', position: 'center' },
        { speaker: '铁柱', text: '这里就是传说中的古老墓穴吗？感觉阴森森的...', position: 'left' },
        { speaker: '星祭司', text: '小心，这里布满了机关。跟随我的指引。', position: 'right' }
      ]
    }],
    2: [{
      background: 'ancient_corridor',
      dialogues: [
        { speaker: '旁白', text: '深入地宫，银色的墙壁闪烁着神秘的光芒...', position: 'center' },
        { speaker: '星祭司', text: '这是沉银地宫，只有解开所有机关才能到达藏宝室。', position: 'right' },
        { speaker: '铁柱', text: '管他什么机关，有宝箱就行！', position: 'left' }
      ]
    }],
    3: [{
      background: 'tomb_entrance',
      dialogues: [
        { speaker: '旁白', text: '星陨古墓，这里埋葬着来自天外的神秘力量...', position: 'center' },
        { speaker: '星祭司', text: '这里的每一个角落都充满了未知的危险。', position: 'right' },
        { speaker: '铁柱', text: '不管多危险，我都要找到最终的秘密！', position: 'left' }
      ]
    }]
  },

  // Boss战剧情
  bossIntro: {
    1: [{
      background: 'boss_room',
      effects: ['shake', 'flash'],
      dialogues: [
        { speaker: '旁白', text: '墓穴深处，一股强大的气息正在苏醒...', position: 'center' },
        { speaker: '石棺守卫', text: '是谁...打扰了我的沉睡...', position: 'center', isBoss: true },
        { speaker: '铁柱', text: '你是谁？快交出宝藏！', position: 'left' },
        { speaker: '石棺守卫', text: '愚蠢的凡人...想得到宝藏，先过我这一关！', position: 'center', isBoss: true }
      ],
      choices: [{ text: '准备战斗！', action: 'startBattle' }]
    }],
    2: [{
      background: 'starlight_hall',
      effects: ['shake'],
      dialogues: [
        { speaker: '旁白', text: '巨大的银门缓缓打开，里面是传说中的藏宝大厅...', position: 'center' },
        { speaker: '守财奴', text: '贪婪的人啊...你们永远得不到这里的宝藏！', position: 'center', isBoss: true },
        { speaker: '铁柱', text: '什么守财奴！看打！', position: 'left' }
      ],
      choices: [{ text: '准备战斗！', action: 'startBattle' }]
    }],
    3: [{
      background: 'boss_room',
      effects: ['shake', 'flash'],
      dialogues: [
        { speaker: '旁白', text: '星棺之中，沉睡的力量正在觉醒...', position: 'center' },
        { speaker: '星棺之主', text: '闯入者...你们将永远留在这里...', position: 'center', isBoss: true },
        { speaker: '铁柱', text: '少废话！接招吧！', position: 'left' }
      ],
      choices: [{ text: '准备战斗！', action: 'startBattle' }]
    }]
  },

  // 胜利剧情
  victory: [{
    background: 'victory_scene',
    dialogues: [
      { speaker: '星祭司', text: '做得好，我们成功拿回了宝藏！', position: 'right' },
      { speaker: '铁柱', text: '哈哈，这下发财啦！', position: 'left' }
    ]
  }],

  // 失败剧情
  defeat: [{
    background: 'ancient_corridor',
    dialogues: [
      { speaker: '铁柱', text: '我不甘心...下次一定...', position: 'left' }
    ]
  }]
};

// 场景背景配置（从 scenes.json 同步）
const SCENE_CONFIGS = {
  tomb_entrance: {
    image: '场景/tomb_entrance.jpg',
    gradient: 'linear-gradient(180deg, #0f0f08 0%, #1a1a12 50%, #0a0a05 100%)'
  },
  ancient_corridor: {
    image: '场景/ancient_corridor.jpg',
    gradient: 'linear-gradient(180deg, #0a0a15 0%, #1a1a2a 50%, #0f0f1a 100%)'
  },
  boss_room: {
    image: '场景/boss_room.jpg',
    gradient: 'linear-gradient(180deg, #1a0a0a 0%, #2a1515 50%, #0f0808 100%)'
  },
  starlight_hall: {
    image: '场景/starlight_hall.jpg',
    gradient: 'linear-gradient(180deg, #0a0a1a 0%, #15152a 50%, #080810 100%)'
  },
  victory_scene: {
    image: '场景/victory_scene.jpg',
    gradient: 'linear-gradient(180deg, #1a1a0a 0%, #2a2a15 50%, #0f0f05 100%)'
  }
};
