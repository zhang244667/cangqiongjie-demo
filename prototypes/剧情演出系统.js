/**
 * 《苍穹劫》剧情演出系统
 * 提供完整的视觉小说式剧情表现功能
 */

// 场景图片配置
const SCENE_IMAGES = {
    boss_room: './场景/boss_room.jpg',
    ancient_corridor: './场景/ancient_corridor.jpg',
    tomb_entrance: './场景/tomb_entrance.jpg',
    starlight_hall: './场景/starlight_hall.jpg',
    victory_scene: './场景/victory_scene.jpg'
};

/**
 * StoryScene - 单个场景演出管理
 */
class StoryScene {
    constructor(config) {
        this.background = config.background;
        this.music = config.music || null;
        this.dialogues = config.dialogues || [];
        this.effects = config.effects || [];
        this.choices = config.choices || [];
        this.onNext = config.onNext || null;
        
        this.currentDialogueIndex = 0;
        this.isTyping = false;
        this.typingSpeed = 30; // 打字速度(ms)
        this.container = null;
        this.containerInner = null;
        this.bgImage = null;
        this.dialogBox = null;
        this.dialogText = null;
        this.dialogSpeaker = null;
        this.choiceContainer = null;
        this.effectOverlay = null;
    }

    /**
     * 渲染场景
     */
    render(containerId = 'story-container') {
        let container = document.getElementById(containerId);
        if (!container) {
            container = document.createElement('div');
            container.id = containerId;
            container.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                z-index: 3000;
                display: flex;
                flex-direction: column;
                overflow: hidden;
            `;
            document.body.appendChild(container);
        }

        container.innerHTML = `
            <div class="scene-inner" style="
                flex: 1;
                position: relative;
                background: #000;
                overflow: hidden;
            ">
                <!-- 背景图片 -->
                <div class="scene-background" style="
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background-image: url('${SCENE_IMAGES[this.background] || this.background}');
                    background-size: cover;
                    background-position: center;
                    background-repeat: no-repeat;
                    transition: opacity 0.8s ease-in-out;
                    opacity: 0;
                "></div>

                <!-- 特效层 -->
                <div class="scene-effects" style="
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    pointer-events: none;
                "></div>

                <!-- 立绘层 -->
                <div class="character-layer" style="
                    position: absolute;
                    bottom: 20%;
                    left: 0;
                    right: 0;
                    height: 60%;
                    display: flex;
                    justify-content: center;
                    align-items: flex-end;
                    pointer-events: none;
                "></div>

                <!-- 对话框 -->
                <div class="dialog-box" style="
                    position: absolute;
                    bottom: 5%;
                    left: 5%;
                    right: 5%;
                    background: rgba(0, 0, 0, 0.85);
                    border: 2px solid rgba(212, 175, 55, 0.6);
                    border-radius: 8px;
                    padding: 15px 20px;
                    color: #fff;
                    font-family: 'Microsoft YaHei', sans-serif;
                    display: none;
                    z-index: 10;
                ">
                    <div class="speaker-name" style="
                        font-size: 14px;
                        color: #d4af37;
                        margin-bottom: 8px;
                        font-weight: bold;
                    "></div>
                    <div class="dialog-text" style="
                        font-size: 16px;
                        line-height: 1.6;
                        min-height: 60px;
                    "></div>
                </div>

                <!-- 选择分支 -->
                <div class="choice-container" style="
                    position: absolute;
                    bottom: 15%;
                    left: 50%;
                    transform: translateX(-50%);
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                    z-index: 20;
                    width: 80%;
                    max-width: 400px;
                "></div>

                <!-- 点击继续提示 -->
                <div class="click-hint" style="
                    position: absolute;
                    bottom: 25%;
                    right: 8%;
                    color: rgba(255, 255, 255, 0.7);
                    font-size: 12px;
                    animation: pulse 1.5s infinite;
                    display: none;
                ">▼ 点击继续</div>
            </div>

            <style>
                @keyframes pulse {
                    0%, 100% { opacity: 0.3; }
                    50% { opacity: 1; }
                }

                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-10px); }
                    75% { transform: translateX(10px); }
                }

                @keyframes flash {
                    0%, 100% { opacity: 0; }
                    50% { opacity: 0.8; }
                }

                .shake-effect {
                    animation: shake 0.5s ease-in-out;
                }

                .flash-effect::after {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: white;
                    animation: flash 0.3s ease-in-out;
                }

                .choice-btn {
                    background: rgba(30, 20, 50, 0.95);
                    border: 1px solid rgba(212, 175, 55, 0.6);
                    color: #c0c0c0;
                    padding: 12px 20px;
                    font-size: 14px;
                    cursor: pointer;
                    transition: all 0.3s;
                    border-radius: 6px;
                }

                .choice-btn:hover {
                    background: rgba(50, 40, 70, 0.95);
                    border-color: #d4af37;
                    color: #fff;
                }
            </style>
        `;

        this.container = container;
        this.containerInner = container.querySelector('.scene-inner');
        this.bgImage = container.querySelector('.scene-background');
        this.dialogBox = container.querySelector('.dialog-box');
        this.dialogText = container.querySelector('.dialog-text');
        this.dialogSpeaker = container.querySelector('.speaker-name');
        this.choiceContainer = container.querySelector('.choice-container');
        this.effectOverlay = container.querySelector('.scene-effects');
    }

    /**
     * 播放场景
     */
    async play() {
        // 背景淡入
        await this.fadeIn();

        // 播放特效
        this.playEffects();

        // 开始对话
        this.startDialogues();
    }

    /**
     * 淡入背景
     */
    fadeIn() {
        return new Promise(resolve => {
            setTimeout(() => {
                this.bgImage.style.opacity = '1';
                setTimeout(resolve, 800);
            }, 100);
        });
    }

    /**
     * 播放特效
     */
    playEffects() {
        this.effects.forEach(effect => {
            switch(effect) {
                case 'shake':
                    this.containerInner.classList.add('shake-effect');
                    setTimeout(() => {
                        this.containerInner.classList.remove('shake-effect');
                    }, 500);
                    break;
                case 'flash':
                    this.containerInner.classList.add('flash-effect');
                    setTimeout(() => {
                        this.containerInner.classList.remove('flash-effect');
                    }, 300);
                    break;
            }
        });
    }

    /**
     * 开始对话
     */
    startDialogues() {
        if (this.currentDialogueIndex < this.dialogues.length) {
            this.showDialogue(this.dialogues[this.currentDialogueIndex]);
        } else {
            // 对话结束，显示选择或进入下一场景
            this.onDialoguesComplete();
        }
    }

    /**
     * 显示单条对话
     */
    showDialogue(dialogue) {
        this.dialogBox.style.display = 'block';
        this.dialogSpeaker.textContent = dialogue.speaker || '';
        this.dialogText.textContent = '';

        // 根据说话人位置调整对话框
        this.dialogBox.style.left = dialogue.position === 'left' ? '5%' :
                                    dialogue.position === 'right' ? '5%' : '15%';

        // Boss对话特殊样式
        if (dialogue.isBoss) {
            this.dialogBox.style.borderColor = '#ff4444';
            this.dialogSpeaker.style.color = '#ff4444';
        } else {
            this.dialogBox.style.borderColor = 'rgba(212, 175, 55, 0.6)';
            this.dialogSpeaker.style.color = '#d4af37';
        }

        // 打字机效果
        this.isTyping = true;
        let charIndex = 0;
        const text = dialogue.text;

        const typeChar = () => {
            if (charIndex < text.length) {
                this.dialogText.textContent += text[charIndex];
                charIndex++;
                setTimeout(typeChar, this.typingSpeed);
            } else {
                this.isTyping = false;
                // 显示点击继续提示
                const hint = this.container.querySelector('.click-hint');
                hint.style.display = 'block';
            }
        };

        typeChar();

        // 点击继续
        this.bgImage.onclick = () => {
            if (this.isTyping) {
                // 立即显示全部文本
                this.isTyping = false;
                this.dialogText.textContent = text;
            } else {
                // 继续下一条对话
                hint.style.display = 'none';
                this.bgImage.onclick = null;
                this.currentDialogueIndex++;
                this.startDialogues();
            }
        };
    }

    /**
     * 对话完成
     */
    onDialoguesComplete() {
        if (this.choices.length > 0) {
            this.showChoices();
        } else if (this.onNext) {
            setTimeout(() => this.onNext(), 1000);
        } else {
            this.hide();
        }
    }

    /**
     * 显示选择分支
     */
    showChoices() {
        this.dialogBox.style.display = 'none';
        const hint = this.container.querySelector('.click-hint');
        hint.style.display = 'none';

        this.choices.forEach(choice => {
            const btn = document.createElement('button');
            btn.className = 'choice-btn';
            btn.textContent = choice.text;
            btn.onclick = () => {
                this.container.onclick = null;
                if (choice.action === 'dialogue' && choice.nextScene) {
                    this.onNext(choice.nextScene);
                } else if (choice.action === 'startBattle') {
                    this.hide();
                    // 触发战斗系统
                    if (window.game && window.game.startBattle) {
                        window.game.startBattle();
                    }
                } else if (this.onNext) {
                    this.onNext();
                }
            };
            this.choiceContainer.appendChild(btn);
        });
    }

    /**
     * 隐藏场景
     */
    hide() {
        this.bgImage.style.opacity = '0';
        setTimeout(() => {
            if (this.container && this.container.parentNode) {
                this.container.parentNode.removeChild(this.container);
            }
        }, 800);
    }
}

/**
 * StoryPlayer - 剧情流程管理
 */
class StoryPlayer {
    constructor(config) {
        this.scenes = config.scenes || [];
        this.currentSceneIndex = 0;
        this.containerId = config.containerId || 'story-container';
        this.onComplete = config.onComplete || null;
        this.currentScene = null;
        this.isPlaying = false;
    }

    /**
     * 开始播放剧情
     */
    async play() {
        if (this.isPlaying) return;
        this.isPlaying = true;
        this.currentSceneIndex = 0;
        await this.playScene(this.currentSceneIndex);
    }

    /**
     * 播放指定场景
     */
    async playScene(index, skipToIndex = null) {
        if (index >= this.scenes.length) {
            // 剧情结束
            this.isPlaying = false;
            if (this.onComplete) {
                this.onComplete();
            }
            return;
        }

        const sceneConfig = this.scenes[index];
        this.currentScene = new StoryScene({
            ...sceneConfig,
            onNext: (nextSceneIndex) => {
                const nextIdx = nextSceneIndex !== undefined ? nextSceneIndex : index + 1;
                this.playScene(nextIdx);
            }
        });

        this.currentScene.render(this.containerId);
        await this.currentScene.play();
    }

    /**
     * 跳转到指定场景
     */
    jumpTo(sceneIndex) {
        if (this.currentScene) {
            this.currentScene.hide();
        }
        this.playScene(sceneIndex);
    }

    /**
     * 停止播放
     */
    stop() {
        this.isPlaying = false;
        if (this.currentScene) {
            this.currentScene.hide();
        }
    }

    /**
     * 是否正在播放
     */
    isActive() {
        return this.isPlaying;
    }
}

/**
 * 预设剧情场景
 */
const PREDEFINED_STORIES = {
    // 第1关开场
    level1_intro: {
        scenes: [
            {
                background: 'tomb_entrance',
                dialogues: [
                    { speaker: '旁白', text: '在这座被封印千年的古老墓穴中，传说埋藏着失落王朝的宝藏...', position: 'center' },
                    { speaker: '铁柱', text: '这里就是传说中的古老墓穴吗？感觉阴森森的。', position: 'left' },
                    { speaker: '星祭司', text: '小心，这里布满了机关。跟随我的指引。', position: 'right' }
                ]
            }
        ]
    },

    // 第1关Boss战前
    level1_boss: {
        scenes: [
            {
                background: 'boss_room',
                music: 'tense',
                dialogues: [
                    { speaker: '旁白', text: '墓穴深处，一股强大的气息正在苏醒...', position: 'center' },
                    { speaker: '石棺守卫', text: '是谁...打扰了我的沉睡...', position: 'center', isBoss: true },
                    { speaker: '铁柱', text: '你是谁？快交出宝藏！', position: 'left' },
                    { speaker: '石棺守卫', text: '愚蠢的凡人...想得到宝藏，先过我这一关！', position: 'center', isBoss: true }
                ],
                effects: ['shake', 'flash'],
                choices: [
                    { text: '准备战斗！', action: 'startBattle' }
                ]
            }
        ]
    },

    // 第2关开场
    level2_intro: {
        scenes: [
            {
                background: 'ancient_corridor',
                dialogues: [
                    { speaker: '旁白', text: '深入地宫，银色的墙壁闪烁着神秘的光芒...', position: 'center' },
                    { speaker: '星祭司', text: '这是沉银地宫，只有解开所有机关才能到达藏宝室。', position: 'right' },
                    { speaker: '铁柱', text: '管他什么机关，有宝箱就行！', position: 'left' }
                ]
            }
        ]
    },

    // 第2关Boss战前
    level2_boss: {
        scenes: [
            {
                background: 'starlight_hall',
                music: 'tense',
                dialogues: [
                    { speaker: '旁白', text: '巨大的银门缓缓打开，里面是传说中的藏宝大厅...', position: 'center' },
                    { speaker: '守财奴', text: '贪婪的人啊...你们永远得不到这里的宝藏！', position: 'center', isBoss: true },
                    { speaker: '铁柱', text: '什么守财奴！看打！', position: 'left' }
                ],
                effects: ['shake'],
                choices: [
                    { text: '准备战斗！', action: 'startBattle' }
                ]
            }
        ]
    },

    // 第3关开场
    level3_intro: {
        scenes: [
            {
                background: 'tomb_entrance',
                dialogues: [
                    { speaker: '旁白', text: '星陨古墓，这里埋葬着来自天外的神秘力量...', position: 'center' },
                    { speaker: '星祭司', text: '这里的每一个角落都充满了未知的危险。', position: 'right' },
                    { speaker: '铁柱', text: '不管多危险，我都要找到最终的秘密！', position: 'left' }
                ]
            }
        ]
    },

    // 第3关Boss战前
    level3_boss: {
        scenes: [
            {
                background: 'boss_room',
                music: 'tense',
                dialogues: [
                    { speaker: '旁白', text: '巨大的星棺悬浮在空中，散发着恐怖的气息...', position: 'center' },
                    { speaker: '星主', text: '凡人...你们终于来了...', position: 'center', isBoss: true },
                    { speaker: '星主', text: '既然来了，就留下来陪葬吧！', position: 'center', isBoss: true },
                    { speaker: '铁柱', text: '少废话！接招吧！', position: 'left' }
                ],
                effects: ['shake', 'flash'],
                choices: [
                    { text: '准备战斗！', action: 'startBattle' }
                ]
            }
        ]
    },

    // 胜利结算
    victory: {
        scenes: [
            {
                background: 'victory_scene',
                dialogues: [
                    { speaker: '旁白', text: '战斗胜利！宝藏的光芒照亮了整个墓穴...', position: 'center' },
                    { speaker: '星祭司', text: '做得好，我们成功拿回了宝藏！', position: 'right' },
                    { speaker: '铁柱', text: '哈哈，这下发财啦！', position: 'left' }
                ]
            }
        ]
    },

    // 失败结算
    defeat: {
        scenes: [
            {
                background: 'boss_room',
                dialogues: [
                    { speaker: '旁白', text: '眼前一黑，意识逐渐模糊...', position: 'center' },
                    { speaker: '铁柱', text: '我不甘心...下次一定...', position: 'left' }
                ],
                effects: ['flash']
            }
        ]
    }
};

/**
 * 快捷启动函数
 */
function playStory(storyKey, onComplete) {
    const story = PREDEFINED_STORIES[storyKey];
    if (!story) {
        console.error(`剧情 ${storyKey} 不存在`);
        return null;
    }

    const player = new StoryPlayer({
        scenes: story.scenes,
        onComplete: onComplete
    });

    player.play();
    return player;
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { StoryScene, StoryPlayer, playStory, PREDEFINED_STORIES };
}
