/**
 * 《苍穹劫》战斗系统独立模块
 * 包含完整的战斗逻辑、粒子特效和音效系统
 * 使用方式：在HTML中引入 <script src="battle-system.js"></script>
 */

(function() {
    'use strict';

    // ============================================
    // CSS样式注入
    // ============================================
    
    const BATTLE_CSS = `
        /* 战斗系统样式 */
        .battle-modal {
            position: fixed;
            top: 0; left: 0; right: 0; bottom: 0;
            z-index: 3500;
            display: none;
            flex-direction: column;
            padding: 10px;
            background: rgba(0, 0, 0, 0.95);
        }
        .battle-modal.active { display: flex; }
        
        .battle-bg {
            position: fixed;
            top: 0; left: 0; right: 0; bottom: 0;
            background: 
                radial-gradient(ellipse at 50% 100%, rgba(80, 40, 60, 0.4) 0%, transparent 60%),
                radial-gradient(ellipse at 20% 50%, rgba(60, 30, 80, 0.3) 0%, transparent 40%),
                radial-gradient(ellipse at 80% 50%, rgba(40, 60, 80, 0.3) 0%, transparent 40%),
                linear-gradient(180deg, #0a0812 0%, #15101f 30%, #1a1525 60%, #0f0a15 100%);
            z-index: -1;
        }
        
        .battle-bg::before {
            content: '';
            position: absolute;
            top: 0; left: 0; right: 0; bottom: 0;
            background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='1' fill='%23d4af37' opacity='0.1'/%3E%3C/svg%3E");
            background-size: 100px 100px;
            animation: stars-twinkle 4s ease-in-out infinite;
        }
        @keyframes stars-twinkle { 0%, 100% { opacity: 0.5; } 50% { opacity: 1; } }
        
        .battle-header {
            text-align: center;
            padding: 12px;
            background: linear-gradient(180deg, rgba(40, 20, 50, 0.9) 0%, rgba(30, 15, 40, 0.8) 100%);
            border: 1px solid rgba(212,175,55,0.3);
            border-radius: 12px;
            margin-bottom: 15px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05);
        }
        .battle-title { font-size: 18px; color: #d4af37; text-shadow: 0 0 10px rgba(212,175,55,0.5); }
        .battle-turn { font-size: 12px; color: #888; margin-top: 5px; }
        
        .battle-field {
            display: flex;
            flex-direction: column;
            gap: 15px;
            flex: 1;
            max-width: 600px;
            width: 100%;
            margin: 0 auto;
        }
        
        .enemy-area { display: flex; justify-content: center; gap: 15px; flex-wrap: wrap; padding: 10px; }
        .hero-area { display: flex; justify-content: center; gap: 10px; flex-wrap: wrap; padding: 10px; }
        
        .card-unit {
            display: flex;
            flex-direction: column;
            align-items: center;
            background: linear-gradient(180deg, rgba(40, 35, 50, 0.9) 0%, rgba(25, 20, 35, 0.95) 100%);
            border: 2px solid rgba(100, 80, 120, 0.5);
            border-radius: 12px;
            transition: all 0.3s;
            cursor: pointer;
            position: relative;
            overflow: visible;
            min-width: 130px;
            min-height: 180px;
        }
        
        .card-unit::before {
            content: '';
            position: absolute;
            top: -2px; left: -2px; right: -2px; bottom: -2px;
            background: linear-gradient(45deg, transparent, rgba(212,175,55,0.3), transparent);
            border-radius: 14px;
            opacity: 0;
            transition: opacity 0.3s;
        }
        .card-unit:hover::before { opacity: 1; }
        
        .enemy-unit {
            border-color: rgba(150, 60, 80, 0.6);
            box-shadow: 0 4px 15px rgba(0,0,0,0.4), inset 0 0 20px rgba(150,60,80,0.1);
        }
        .hero-unit {
            border-color: rgba(80, 120, 180, 0.6);
            box-shadow: 0 4px 15px rgba(0,0,0,0.4), inset 0 0 20px rgba(80,120,180,0.1);
        }
        
        .card-unit.dead { opacity: 0.3; filter: grayscale(1) brightness(0.5); transform: scale(0.9); }
        
        .hero-unit.ready {
            border-color: rgba(255, 200, 50, 0.8);
            box-shadow: 0 0 20px rgba(255, 200, 50, 0.4), 0 4px 15px rgba(0,0,0,0.4);
            animation: ready-pulse 1s ease-in-out infinite;
        }
        @keyframes ready-pulse {
            0%, 100% { box-shadow: 0 0 20px rgba(255, 200, 50, 0.4), 0 4px 15px rgba(0,0,0,0.4); }
            50% { box-shadow: 0 0 35px rgba(255, 200, 50, 0.7), 0 4px 20px rgba(0,0,0,0.4); }
        }
        .hero-unit.ready::after {
            content: '⚡';
            position: absolute;
            top: -5px; right: -5px;
            font-size: 16px;
            animation: pulse-glow 1s ease-in-out infinite;
        }
        @keyframes pulse-glow { 0%, 100% { transform: scale(1); opacity: 0.8; } 50% { transform: scale(1.2); opacity: 1; } }
        
        .card-portrait {
            width: 120px;
            height: 160px;
            background: linear-gradient(180deg, rgba(60,50,70,0.8) 0%, rgba(40,30,50,0.9) 100%);
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
            border: 1px solid rgba(100,80,120,0.4);
            position: relative;
        }
        .card-portrait img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            object-position: top center;
            border-radius: 7px;
        }
        .card-icon { font-size: 32px; margin-bottom: 5px; filter: drop-shadow(0 0 5px rgba(0,0,0,0.5)); }
        
        .card-overlay {
            position: absolute;
            bottom: 0; left: 0; right: 0;
            background: linear-gradient(180deg, rgba(25, 20, 35, 0.6) 0%, rgba(25, 20, 35, 0.6) 100%);
            border-top: 1px solid rgba(100, 80, 120, 0.4);
            border-radius: 0 0 10px 10px;
            padding: 5px 8px 8px;
            backdrop-filter: blur(3px);
        }
        
        .card-name-overlay { font-size: 11px; font-weight: bold; text-align: center; text-shadow: 0 1px 2px rgba(0,0,0,0.8); margin-bottom: 3px; }
        .enemy-unit .card-name-overlay { color: #ff8a8a; }
        .hero-unit .card-name-overlay { color: #8ac4ff; }
        .card-name { font-size: 11px; font-weight: bold; margin-bottom: 5px; text-shadow: 0 1px 2px rgba(0,0,0,0.8); }
        .enemy-unit .card-name { color: #ff8a8a; }
        .hero-unit .card-name { color: #8ac4ff; }
        
        .hp-bar-overlay { margin-bottom: 2px; }
        .hp-bar {
            width: 100%;
            height: 10px;
            background: rgba(20, 15, 30, 0.9);
            border-radius: 5px;
            overflow: hidden;
            border: 1px solid rgba(80,60,100,0.5);
            box-shadow: inset 0 2px 4px rgba(0,0,0,0.5);
            position: relative;
        }
        .hp-value {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: 9px;
            color: #fff;
            text-shadow: 0 1px 2px rgba(0,0,0,0.8);
            z-index: 1;
            pointer-events: none;
        }
        .hp-fill { 
            height: 100%; 
            background: linear-gradient(180deg, #6b9fd5 0%, #4a6fa5 50%, #3a5a8a 100%);
            transition: width 0.3s;
            position: relative;
        }
        .hp-fill::after {
            content: '';
            position: absolute;
            top: 0; left: 0; right: 0;
            height: 50%;
            background: linear-gradient(180deg, rgba(255,255,255,0.3) 0%, transparent 100%);
            border-radius: 5px 5px 0 0;
        }
        .hp-fill.low { background: linear-gradient(180deg, #ff8a8a 0%, #cc5050 50%, #aa3030 100%); }
        .hp-fill.critical {
            background: linear-gradient(180deg, #ff6b6b 0%, #cc2020 50%, #aa1010 100%);
            animation: hp-critical 0.5s ease-in-out infinite;
        }
        @keyframes hp-critical { 0%, 100% { opacity: 1; } 50% { opacity: 0.7; } }
        .hp-text { display: none; }
        
        .rage-bar { width: 100%; height: 6px; background: rgba(20, 15, 30, 0.9); border-radius: 3px; overflow: hidden; border: 1px solid rgba(100,80,50,0.5); position: relative; }
        .rage-value { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-size: 9px; color: #fff; text-shadow: 0 1px 2px rgba(0,0,0,0.8); z-index: 1; pointer-events: none; }
        .rage-fill { height: 100%; background: linear-gradient(90deg, #cc8800, #ffaa00); transition: width 0.3s; }
        .rage-fill.full { background: linear-gradient(90deg, #ff6600, #ffcc00); box-shadow: 0 0 8px rgba(255,200,0,0.5); animation: rage-glow 0.5s ease-in-out infinite; }
        @keyframes rage-glow { 0%, 100% { box-shadow: 0 0 8px rgba(255,200,0,0.5); } 50% { box-shadow: 0 0 15px rgba(255,200,0,0.8); } }
        .rage-text { display: none; }
        
        .action-bar-area { padding: 10px; background: linear-gradient(180deg, rgba(30, 20, 40, 0.9) 0%, rgba(20, 15, 30, 0.9) 100%); border: 1px solid rgba(100,80,120,0.4); border-radius: 10px; margin-bottom: 10px; }
        .action-bar { display: flex; gap: 6px; overflow-x: auto; padding: 8px 0; justify-content: center; }
        .action-slot { width: 45px; height: 45px; background: linear-gradient(180deg, rgba(50, 40, 60, 0.8) 0%, rgba(35, 25, 45, 0.9) 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 20px; border: 2px solid rgba(100,80,120,0.4); flex-shrink: 0; transition: all 0.3s; overflow: hidden; }
        .action-slot.current { border-color: #d4af37; box-shadow: 0 0 15px rgba(212,175,55,0.6); transform: scale(1.1); }
        .action-slot.acted { opacity: 0.4; filter: grayscale(0.5); }
        .action-slot.hero { background: linear-gradient(180deg, rgba(60, 80, 120, 0.8) 0%, rgba(45, 60, 90, 0.9) 100%); border-color: rgba(80, 120, 180, 0.5); }
        .action-slot.enemy { background: linear-gradient(180deg, rgba(120, 60, 80, 0.8) 0%, rgba(90, 45, 60, 0.9) 100%); border-color: rgba(180, 80, 100, 0.5); }
        .action-slot-img { width: 100%; height: 100%; border-radius: 50%; object-fit: cover; transform: scale(1.6); object-position: top center; }
        .action-slot-icon { font-size: 20px; }
        
        .battle-log { flex: 1; background: linear-gradient(180deg, rgba(15, 10, 25, 0.9) 0%, rgba(10, 8, 18, 0.95) 100%); border: 1px solid rgba(80,60,100,0.3); border-radius: 10px; padding: 10px; overflow-y: auto; font-size: 12px; min-height: 80px; max-height: 120px; margin-bottom: 10px; box-shadow: inset 0 2px 10px rgba(0,0,0,0.5); }
        .battle-log-entry { margin: 5px 0; padding: 6px 10px; border-radius: 6px; background: rgba(40, 30, 50, 0.4); border-left: 3px solid rgba(100,80,120,0.4); animation: log-appear 0.3s ease-out; }
        @keyframes log-appear { from { opacity: 0; transform: translateX(-10px); } to { opacity: 1; transform: translateX(0); } }
        .battle-log-entry.player-attack { color: #8ac4ff; border-left-color: #4a7fc0; }
        .battle-log-entry.player-skill { color: #ffcc66; border-left-color: #d4af37; background: rgba(212,175,55,0.1); }
        .battle-log-entry.enemy-attack { color: #ff9999; border-left-color: #cc6060; }
        .battle-log-entry.enemy-death { color: #88ff88; border-left-color: #50cc50; }
        
        .battle-actions { display: flex; gap: 10px; padding: 12px; background: linear-gradient(180deg, rgba(30, 20, 40, 0.9) 0%, rgba(20, 15, 30, 0.9) 100%); border: 1px solid rgba(100,80,120,0.4); border-radius: 12px; }
        .battle-btn { flex: 1; padding: 14px; border: none; border-radius: 10px; font-size: 14px; font-weight: bold; cursor: pointer; transition: all 0.2s; text-shadow: 0 1px 2px rgba(0,0,0,0.5); }
        .battle-btn:active { transform: scale(0.95); }
        .battle-btn.attack { background: linear-gradient(180deg, #5a4a3a, #4a3a2a); color: #ffcc88; border: 1px solid #8a7a5a; }
        .battle-btn.skill { background: linear-gradient(180deg, #6a3a2a, #5a2a1a); color: #ffcc44; border: 1px solid #aa6a3a; }
        .battle-btn.retreat { background: rgba(60, 40, 40, 0.8); color: #ff8888; flex: 0.6; border: 1px solid rgba(100,60,60,0.5); }
        .battle-btn:hover { filter: brightness(1.2); box-shadow: 0 0 15px rgba(255,200,100,0.3); }
        .battle-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        
        /* ========== 特效系统 ========== */
        .damage-number { position: absolute; font-size: 22px; font-weight: bold; color: #ff6b6b; text-shadow: 0 0 10px rgba(0,0,0,0.8), 0 0 20px rgba(255,100,100,0.5); animation: damage-float 1s forwards; pointer-events: none; z-index: 100; font-family: 'Arial Black', sans-serif; }
        .damage-number.crit { color: #ffcc00; font-size: 28px; text-shadow: 0 0 10px rgba(0,0,0,0.8), 0 0 30px rgba(255,200,0,0.8); }
        .damage-number.heal { color: #88ff88; }
        @keyframes damage-float { 0% { opacity: 1; transform: translateY(0) scale(1.2); } 20% { transform: translateY(-10px) scale(1); } 100% { opacity: 0; transform: translateY(-50px) scale(0.8); } }
        
        .shake { animation: shake 0.3s; }
        .shake-heavy { animation: shake-heavy 0.5s; }
        @keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-8px); } 75% { transform: translateX(8px); } }
        @keyframes shake-heavy { 0%, 100% { transform: translateX(0) rotate(0); } 20% { transform: translateX(-12px) rotate(-2deg); } 40% { transform: translateX(12px) rotate(2deg); } 60% { transform: translateX(-10px) rotate(-1deg); } 80% { transform: translateX(10px) rotate(1deg); } }
        
        .enemy-death-anim { animation: death 0.6s forwards; }
        @keyframes death { 0% { opacity: 1; transform: scale(1) rotate(0); } 50% { transform: scale(1.1) rotate(5deg); } 100% { opacity: 0; transform: scale(0.3) rotate(-10deg); filter: grayscale(1) brightness(0.3); } }
        
        .attack-flash { animation: attack-flash 0.3s; }
        @keyframes attack-flash { 0%, 100% { filter: brightness(1); } 50% { filter: brightness(2) saturate(1.5); } }
        
        .battle-victory-glow { animation: victory-glow 0.5s ease-in-out 3; }
        @keyframes victory-glow { 0%, 100% { box-shadow: inset 0 0 30px rgba(107, 255, 107, 0.2); } 50% { box-shadow: inset 0 0 60px rgba(107, 255, 107, 0.4); } }
        
        .skill-effect { position: absolute; top: 50%; left: 50%; width: 100px; height: 100px; transform: translate(-50%, -50%); background: radial-gradient(circle, rgba(255,200,0,0.6) 0%, transparent 70%); border-radius: 50%; animation: skill-burst 0.5s forwards; pointer-events: none; }
        @keyframes skill-burst { 0% { transform: translate(-50%, -50%) scale(0); opacity: 1; } 100% { transform: translate(-50%, -50%) scale(3); opacity: 0; } }
        
        /* 角色差异化普攻特效 */
        .slash-gold { position: absolute; top: 50%; left: 50%; width: 80px; height: 80px; transform: translate(-50%, -50%); pointer-events: none; z-index: 60; }
        .slash-gold::before { content: ''; position: absolute; top: 50%; left: 50%; width: 100%; height: 20px; background: linear-gradient(90deg, transparent, #ffd700, #ffaa00, transparent); transform: translate(-50%, -50%) rotate(-30deg); animation: slash-wave 0.4s ease-out forwards; border-radius: 50%; box-shadow: 0 0 20px #ffd700; }
        .slash-gold::after { content: ''; position: absolute; top: 50%; left: 50%; width: 60px; height: 60px; background: radial-gradient(circle, rgba(255,215,0,0.8) 0%, transparent 70%); transform: translate(-50%, -50%); animation: slash-pulse 0.3s ease-out forwards; }
        @keyframes slash-wave { 0% { opacity: 1; transform: translate(-50%, -50%) rotate(-30deg) scaleX(0.5); } 50% { opacity: 1; transform: translate(-50%, -50%) rotate(-30deg) scaleX(1.5); } 100% { opacity: 0; transform: translate(-50%, -50%) rotate(-30deg) scaleX(2); } }
        @keyframes slash-pulse { 0% { opacity: 1; transform: translate(-50%, -50%) scale(0.5); } 100% { opacity: 0; transform: translate(-50%, -50%) scale(2); } }
        
        .slash-star, .slash-rune { position: absolute; top: 50%; left: 50%; width: 100px; height: 100px; transform: translate(-50%, -50%); pointer-events: none; z-index: 60; }
        .slash-gear { position: absolute; top: 50%; left: 50%; width: 80px; height: 80px; transform: translate(-50%, -50%); pointer-events: none; z-index: 60; }
        .slash-gear svg { width: 100%; height: 100%; animation: gear-spin 0.5s linear forwards; }
        @keyframes gear-spin { 0% { transform: rotate(0deg); opacity: 1; } 100% { transform: rotate(180deg); opacity: 0; } }
        
        /* 受击特效 */
        .hit-flash { animation: hit-red-flash 0.15s ease-out 3; }
        @keyframes hit-red-flash { 0%, 100% { filter: brightness(1) sepia(0); box-shadow: none; } 50% { filter: brightness(2) sepia(1) hue-rotate(-50deg) saturate(3); box-shadow: 0 0 30px rgba(255, 50, 50, 0.8), inset 0 0 20px rgba(255, 50, 50, 0.5); } }
        .hit-shake { animation: hit-intense-shake 0.4s ease-out; }
        @keyframes hit-intense-shake { 0%, 100% { transform: translateX(0) translateY(0); } 10% { transform: translateX(-10px) translateY(-3px); } 20% { transform: translateX(10px) translateY(2px); } 30% { transform: translateX(-8px) translateY(-2px); } 40% { transform: translateX(8px) translateY(3px); } 50% { transform: translateX(-6px) translateY(-1px); } 60% { transform: translateX(6px) translateY(2px); } 70% { transform: translateX(-4px) translateY(-1px); } 80% { transform: translateX(4px) translateY(1px); } 90% { transform: translateX(-2px) translateY(0); } }
        
        /* 暴击特效 */
        .crit-effect { position: absolute; top: 50%; left: 50%; width: 120px; height: 120px; transform: translate(-50%, -50%); pointer-events: none; z-index: 70; }
        .crit-effect::before { content: '💥'; position: absolute; top: 50%; left: 50%; font-size: 40px; transform: translate(-50%, -50%); animation: crit-burst 0.5s ease-out forwards; }
        .crit-effect::after { content: ''; position: absolute; top: 50%; left: 50%; width: 150px; height: 150px; background: radial-gradient(circle, rgba(255,215,0,0.6) 0%, transparent 70%); transform: translate(-50%, -50%); animation: crit-glow 0.6s ease-out forwards; }
        @keyframes crit-burst { 0% { transform: translate(-50%, -50%) scale(0.3) rotate(0deg); opacity: 1; } 50% { transform: translate(-50%, -50%) scale(1.5) rotate(15deg); opacity: 1; } 100% { transform: translate(-50%, -50%) scale(2) rotate(30deg); opacity: 0; } }
        @keyframes crit-glow { 0% { transform: translate(-50%, -50%) scale(0); opacity: 1; } 50% { transform: translate(-50%, -50%) scale(1.2); opacity: 0.8; } 100% { transform: translate(-50%, -50%) scale(2); opacity: 0; } }
        .crit-hit { animation: crit-zoom 0.3s ease-out; }
        @keyframes crit-zoom { 0% { transform: scale(1); } 30% { transform: scale(1.15); filter: brightness(1.5); } 100% { transform: scale(1); } }
        
        /* 技能特效 */
        .skill-charge { position: absolute; top: 50%; left: 50%; width: 60px; height: 60px; transform: translate(-50%, -50%); pointer-events: none; z-index: 80; }
        .skill-charge::before { content: ''; position: absolute; top: 50%; left: 50%; width: 100%; height: 100%; border: 3px solid rgba(255, 200, 0, 0.8); border-radius: 50%; transform: translate(-50%, -50%); animation: charge-pulse 0.3s ease-in-out infinite; }
        .skill-charge::after { content: ''; position: absolute; top: 50%; left: 50%; width: 30px; height: 30px; background: radial-gradient(circle, rgba(255,255,100,0.9) 0%, transparent 70%); border-radius: 50%; transform: translate(-50%, -50%); animation: charge-core 0.3s ease-in-out infinite; }
        @keyframes charge-pulse { 0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.8; } 50% { transform: translate(-50%, -50%) scale(1.3); opacity: 0.4; } }
        @keyframes charge-core { 0%, 100% { transform: translate(-50%, -50%) scale(1); } 50% { transform: translate(-50%, -50%) scale(1.2); } }
        
        .skill-tiezhu-impact { position: absolute; top: 50%; left: 50%; width: 200px; height: 100px; transform: translate(-50%, -50%); pointer-events: none; z-index: 80; }
        .skill-tiezhu-impact::before { content: ''; position: absolute; top: 50%; left: 50%; width: 0; height: 60px; background: linear-gradient(90deg, rgba(255,215,0,0), rgba(255,215,0,0.8), rgba(255,255,200,1), rgba(255,215,0,0.8), rgba(255,215,0,0)); transform: translate(-50%, -50%); border-radius: 50%; animation: tiezhu-wave 0.6s ease-out forwards; box-shadow: 0 0 40px #ffd700, 0 0 80px #ffaa00; }
        @keyframes tiezhu-wave { 0% { width: 0; opacity: 1; } 50% { width: 250px; opacity: 0.8; } 100% { width: 300px; opacity: 0; } }
        
        .skill-xingjisi-particles, .skill-mojinshou-runes, .skill-banshanke-gears { position: absolute; top: 50%; left: 50%; width: 180px; height: 180px; transform: translate(-50%, -50%); pointer-events: none; z-index: 80; }
        
        .area-burst { position: absolute; top: 50%; left: 50%; width: 150px; height: 150px; transform: translate(-50%, -50%); pointer-events: none; z-index: 75; }
        .area-burst::before { content: ''; position: absolute; top: 50%; left: 50%; width: 100%; height: 100%; background: radial-gradient(circle, rgba(255,255,255,0.9) 0%, rgba(255,200,0,0.6) 30%, transparent 70%); border-radius: 50%; transform: translate(-50%, -50%) scale(0); animation: area-expand 0.5s ease-out forwards; }
        @keyframes area-expand { 0% { transform: translate(-50%, -50%) scale(0); opacity: 1; } 60% { opacity: 0.8; } 100% { transform: translate(-50%, -50%) scale(2); opacity: 0; } }
        
        /* 屏幕震动 */
        .screen-shake { animation: screen-tremor 0.3s ease-out; }
        @keyframes screen-tremor { 0%, 100% { transform: translate(0, 0); } 10% { transform: translate(-5px, -3px); } 20% { transform: translate(5px, 3px); } 30% { transform: translate(-4px, 2px); } 40% { transform: translate(4px, -2px); } 50% { transform: translate(-3px, -3px); } 60% { transform: translate(3px, 3px); } 70% { transform: translate(-2px, 1px); } 80% { transform: translate(2px, -1px); } 90% { transform: translate(-1px, 0); } }
        .screen-shake-heavy { animation: screen-heavy-tremor 0.5s ease-out; }
        @keyframes screen-heavy-tremor { 0%, 100% { transform: translate(0, 0); } 5% { transform: translate(-8px, -5px); } 10% { transform: translate(8px, 5px); } 15% { transform: translate(-7px, -4px); } 20% { transform: translate(7px, 4px); } 25% { transform: translate(-6px, 3px); } 30% { transform: translate(6px, -3px); } 35% { transform: translate(-5px, -4px); } 40% { transform: translate(5px, 4px); } 45% { transform: translate(-4px, -3px); } 50% { transform: translate(4px, 3px); } 55% { transform: translate(-3px, -2px); } 60% { transform: translate(3px, 2px); } 65% { transform: translate(-2px, -1px); } 70% { transform: translate(2px, 1px); } 75% { transform: translate(-1px, -1px); } 80% { transform: translate(1px, 1px); } 85% { transform: translate(-1px, 0); } 90% { transform: translate(1px, 0); } }
        
        /* 死亡特效 */
        .death-particle { position: absolute; width: 8px; height: 8px; border-radius: 50%; pointer-events: none; z-index: 90; }
        @keyframes particle-scatter { 0% { opacity: 1; transform: translate(0, 0) scale(1); } 100% { opacity: 0; transform: translate(var(--tx), var(--ty)) scale(0); } }
        .death-spirit { position: absolute; font-size: 20px; pointer-events: none; z-index: 90; animation: spirit-rise 1s ease-out forwards; }
        @keyframes spirit-rise { 0% { opacity: 1; transform: translateY(0) scale(1); } 100% { opacity: 0; transform: translateY(-60px) scale(0.5); } }
        
        /* 攻击冲击 */
        .attack-lunge { animation: lunge-forward 0.3s ease-out; }
        @keyframes lunge-forward { 0% { transform: translateY(0); } 30% { transform: translateY(-15px); } 60% { transform: translateY(5px); } 100% { transform: translateY(0); } }
        .attack-dive { animation: dive-down 0.3s ease-out; }
        @keyframes dive-down { 0% { transform: translateY(0); } 30% { transform: translateY(15px); } 60% { transform: translateY(-5px); } 100% { transform: translateY(0); } }
        
        /* Canvas特效层 */
        #particleCanvas {
            position: absolute;
            top: 0; left: 0;
            width: 100%; height: 100%;
            pointer-events: none;
            z-index: 2050;
        }
        
        /* 手机端适配 */
        @media (max-width: 480px) {
            .battle-modal { padding: 5px; }
            .battle-header { padding: 8px; margin-bottom: 8px; }
            .battle-title { font-size: 14px; }
            .battle-turn { font-size: 10px; margin-top: 3px; }
            .battle-field { gap: 8px; }
            .enemy-area, .hero-area { gap: 6px; padding: 6px; }
            .card-unit { min-width: 90px; min-height: 120px; border-radius: 8px; }
            .card-portrait { width: 80px; height: 100px; border-radius: 6px; }
            .card-overlay { padding: 3px 5px 5px; }
            .card-name-overlay, .card-name { font-size: 9px; }
            .hp-bar { height: 8px; }
            .hp-value { font-size: 7px; }
            .rage-bar { height: 5px; }
            .rage-value { font-size: 7px; }
            .action-bar-area { padding: 6px; margin-bottom: 6px; }
            .action-bar { gap: 4px; padding: 5px 0; }
            .action-slot { width: 35px; height: 35px; font-size: 16px; border-width: 1.5px; }
            .action-slot.current { transform: scale(1.05); }
            .action-slot-icon { font-size: 16px; }
            .battle-log { padding: 6px; font-size: 10px; min-height: 60px; max-height: 80px; margin-bottom: 6px; }
            .battle-log-entry { margin: 3px 0; padding: 4px 6px; border-left-width: 2px; }
            .battle-actions { gap: 6px; padding: 8px; }
            .battle-btn { padding: 10px 8px; font-size: 11px; border-radius: 8px; }
            .battle-btn.retreat { flex: 0.5; }
            .damage-number { font-size: 16px; }
            .damage-number.crit { font-size: 20px; }
            .hero-unit.ready::after { font-size: 12px; top: -3px; right: -3px; }
            .card-icon { font-size: 24px; margin-bottom: 3px; }
            .slash-gold, .slash-star, .slash-rune, .slash-gear { width: 60px; height: 60px; }
            .crit-effect { width: 80px; height: 80px; }
            .crit-effect::before { font-size: 28px; }
        }
    `;

    // 注入CSS
    function injectCSS() {
        if (document.getElementById('battle-system-css')) return;
        const style = document.createElement('style');
        style.id = 'battle-system-css';
        style.textContent = BATTLE_CSS;
        document.head.appendChild(style);
    }

    // ============================================
    // 音频系统 - Web Audio API 合成音效
    // ============================================
    
    class AudioSystem {
        constructor() {
            this.audioContext = null;
            this.masterGain = null;
            this.musicGain = null;
            this.sfxGain = null;
            this.isMusicPlaying = false;
            this.musicOscillators = [];
            this.musicNodes = [];
            this.isMuted = { music: false, sfx: false };
            this.volume = 0.7;
        }
        
        init() {
            if (this.audioContext) return;
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            this.masterGain = this.audioContext.createGain();
            this.masterGain.gain.value = this.volume;
            this.masterGain.connect(this.audioContext.destination);
            
            this.musicGain = this.audioContext.createGain();
            this.musicGain.gain.value = 0.3;
            this.musicGain.connect(this.masterGain);
            
            this.sfxGain = this.audioContext.createGain();
            this.sfxGain.gain.value = 0.5;
            this.sfxGain.connect(this.masterGain);
        }
        
        setVolume(value) {
            this.volume = value;
            if (this.masterGain) {
                this.masterGain.gain.setTargetAtTime(value, this.audioContext.currentTime, 0.1);
            }
        }
        
        toggleMusic() {
            this.isMuted.music = !this.isMuted.music;
            if (this.musicGain) {
                this.musicGain.gain.setTargetAtTime(this.isMuted.music ? 0 : 0.3, this.audioContext.currentTime, 0.1);
            }
            return !this.isMuted.music;
        }
        
        toggleSfx() {
            this.isMuted.sfx = !this.isMuted.sfx;
            if (this.sfxGain) {
                this.sfxGain.gain.setTargetAtTime(this.isMuted.sfx ? 0 : 0.5, this.audioContext.currentTime, 0.1);
            }
            return !this.isMuted.sfx;
        }
        
        playAttack() {
            if (!this.audioContext) this.init();
            const ctx = this.audioContext;
            const now = ctx.currentTime;
            
            const noise = ctx.createBufferSource();
            const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.1, ctx.sampleRate);
            const noiseData = noiseBuffer.getChannelData(0);
            for (let i = 0; i < noiseData.length; i++) {
                noiseData[i] = (Math.random() * 2 - 1) * 0.3;
            }
            noise.buffer = noiseBuffer;
            
            const noiseFilter = ctx.createBiquadFilter();
            noiseFilter.type = 'highpass';
            noiseFilter.frequency.value = 2000;
            
            const noiseGain = ctx.createGain();
            noiseGain.gain.setValueAtTime(0.4, now);
            noiseGain.gain.setTargetAtTime(0.01, now, 0.03);
            
            noise.connect(noiseFilter);
            noiseFilter.connect(noiseGain);
            noiseGain.connect(this.sfxGain);
            
            const osc = ctx.createOscillator();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(150, now);
            osc.frequency.exponentialRampToValueAtTime(50, now + 0.1);
            
            const oscGain = ctx.createGain();
            oscGain.gain.setValueAtTime(0.5, now);
            oscGain.gain.setTargetAtTime(0.01, now, 0.05);
            
            osc.connect(oscGain);
            oscGain.connect(this.sfxGain);
            
            noise.start(now);
            noise.stop(now + 0.1);
            osc.start(now);
            osc.stop(now + 0.15);
        }
        
        playCrit() {
            if (!this.audioContext) this.init();
            const ctx = this.audioContext;
            const now = ctx.currentTime;
            
            const noise = ctx.createBufferSource();
            const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.2, ctx.sampleRate);
            const noiseData = noiseBuffer.getChannelData(0);
            for (let i = 0; i < noiseData.length; i++) {
                noiseData[i] = (Math.random() * 2 - 1);
            }
            noise.buffer = noiseBuffer;
            
            const noiseFilter = ctx.createBiquadFilter();
            noiseFilter.type = 'lowpass';
            noiseFilter.frequency.value = 3000;
            
            const noiseGain = ctx.createGain();
            noiseGain.gain.setValueAtTime(0.6, now);
            noiseGain.gain.setTargetAtTime(0.01, now, 0.08);
            
            noise.connect(noiseFilter);
            noiseFilter.connect(noiseGain);
            noiseGain.connect(this.sfxGain);
            
            const osc = ctx.createOscillator();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(200, now);
            osc.frequency.exponentialRampToValueAtTime(30, now + 0.2);
            
            const oscGain = ctx.createGain();
            oscGain.gain.setValueAtTime(0.8, now);
            oscGain.gain.setTargetAtTime(0.01, now, 0.1);
            
            osc.connect(oscGain);
            oscGain.connect(this.sfxGain);
            
            const metal = ctx.createOscillator();
            metal.type = 'square';
            metal.frequency.setValueAtTime(800, now);
            metal.frequency.exponentialRampToValueAtTime(200, now + 0.1);
            
            const metalGain = ctx.createGain();
            metalGain.gain.setValueAtTime(0.2, now);
            metalGain.gain.setTargetAtTime(0.01, now, 0.05);
            
            metal.connect(metalGain);
            metalGain.connect(this.sfxGain);
            
            noise.start(now);
            noise.stop(now + 0.2);
            osc.start(now);
            osc.stop(now + 0.25);
            metal.start(now);
            metal.stop(now + 0.12);
        }
        
        playHit() {
            if (!this.audioContext) this.init();
            const ctx = this.audioContext;
            const now = ctx.currentTime;
            
            const osc = ctx.createOscillator();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(120, now);
            osc.frequency.exponentialRampToValueAtTime(60, now + 0.08);
            
            const oscGain = ctx.createGain();
            oscGain.gain.setValueAtTime(0.4, now);
            oscGain.gain.setTargetAtTime(0.01, now, 0.03);
            
            osc.connect(oscGain);
            oscGain.connect(this.sfxGain);
            
            const noise = ctx.createBufferSource();
            const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.05, ctx.sampleRate);
            const noiseData = noiseBuffer.getChannelData(0);
            for (let i = 0; i < noiseData.length; i++) {
                noiseData[i] = (Math.random() * 2 - 1) * 0.2;
            }
            noise.buffer = noiseBuffer;
            
            const noiseGain = ctx.createGain();
            noiseGain.gain.setValueAtTime(0.3, now);
            noiseGain.gain.setTargetAtTime(0.01, now, 0.02);
            
            noise.connect(noiseGain);
            noiseGain.connect(this.sfxGain);
            
            osc.start(now);
            osc.stop(now + 0.1);
            noise.start(now);
            noise.stop(now + 0.05);
        }
        
        playSkill() {
            if (!this.audioContext) this.init();
            const ctx = this.audioContext;
            const now = ctx.currentTime;
            
            const osc1 = ctx.createOscillator();
            osc1.type = 'sine';
            osc1.frequency.setValueAtTime(300, now);
            osc1.frequency.exponentialRampToValueAtTime(1200, now + 0.3);
            
            const osc2 = ctx.createOscillator();
            osc2.type = 'triangle';
            osc2.frequency.setValueAtTime(450, now);
            osc2.frequency.exponentialRampToValueAtTime(1800, now + 0.3);
            
            const gain1 = ctx.createGain();
            gain1.gain.setValueAtTime(0.3, now);
            gain1.gain.setTargetAtTime(0.01, now + 0.2, 0.1);
            
            const gain2 = ctx.createGain();
            gain2.gain.setValueAtTime(0.2, now);
            gain2.gain.setTargetAtTime(0.01, now + 0.25, 0.1);
            
            osc1.connect(gain1);
            osc2.connect(gain2);
            gain1.connect(this.sfxGain);
            gain2.connect(this.sfxGain);
            
            const noise = ctx.createBufferSource();
            const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.15, ctx.sampleRate);
            const noiseData = noiseBuffer.getChannelData(0);
            for (let i = 0; i < noiseData.length; i++) {
                noiseData[i] = (Math.random() * 2 - 1);
            }
            noise.buffer = noiseBuffer;
            
            const noiseFilter = ctx.createBiquadFilter();
            noiseFilter.type = 'bandpass';
            noiseFilter.frequency.value = 2000;
            noiseFilter.Q.value = 2;
            
            const noiseGain = ctx.createGain();
            noiseGain.gain.setValueAtTime(0.2, now + 0.2);
            noiseGain.gain.setTargetAtTime(0.01, now + 0.3, 0.05);
            
            noise.connect(noiseFilter);
            noiseFilter.connect(noiseGain);
            noiseGain.connect(this.sfxGain);
            
            osc1.start(now);
            osc1.stop(now + 0.4);
            osc2.start(now);
            osc2.stop(now + 0.4);
            noise.start(now + 0.2);
            noise.stop(now + 0.35);
        }
        
        playDeath() {
            if (!this.audioContext) this.init();
            const ctx = this.audioContext;
            const now = ctx.currentTime;
            
            const osc = ctx.createOscillator();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(400, now);
            osc.frequency.exponentialRampToValueAtTime(50, now + 0.5);
            
            const gain = ctx.createGain();
            gain.gain.setValueAtTime(0.4, now);
            gain.gain.setTargetAtTime(0.01, now + 0.3, 0.15);
            
            osc.connect(gain);
            gain.connect(this.sfxGain);
            
            const noise = ctx.createBufferSource();
            const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.3, ctx.sampleRate);
            const noiseData = noiseBuffer.getChannelData(0);
            for (let i = 0; i < noiseData.length; i++) {
                noiseData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.1));
            }
            noise.buffer = noiseBuffer;
            
            const noiseGain = ctx.createGain();
            noiseGain.gain.setValueAtTime(0.3, now + 0.1);
            noiseGain.gain.setTargetAtTime(0.01, now + 0.2, 0.1);
            
            noise.connect(noiseGain);
            noiseGain.connect(this.sfxGain);
            
            osc.start(now);
            osc.stop(now + 0.6);
            noise.start(now + 0.1);
            noise.stop(now + 0.4);
        }
        
        playVictory() {
            if (!this.audioContext) this.init();
            const ctx = this.audioContext;
            const now = ctx.currentTime;
            
            const freqs = [523.25, 659.25, 783.99, 1046.50];
            
            freqs.forEach((freq, i) => {
                const osc = ctx.createOscillator();
                osc.type = 'triangle';
                osc.frequency.value = freq;
                
                const gain = ctx.createGain();
                gain.gain.setValueAtTime(0, now + i * 0.1);
                gain.gain.linearRampToValueAtTime(0.2, now + i * 0.1 + 0.05);
                gain.gain.setTargetAtTime(0.01, now + 1, 0.3);
                
                osc.connect(gain);
                gain.connect(this.sfxGain);
                
                osc.start(now + i * 0.1);
                osc.stop(now + 1.5);
            });
            
            for (let i = 0; i < 5; i++) {
                const osc = ctx.createOscillator();
                osc.type = 'sine';
                osc.frequency.value = 1500 + i * 200;
                
                const gain = ctx.createGain();
                gain.gain.setValueAtTime(0, now + 0.8 + i * 0.08);
                gain.gain.linearRampToValueAtTime(0.1, now + 0.85 + i * 0.08);
                gain.gain.setTargetAtTime(0.01, now + 1 + i * 0.08, 0.05);
                
                osc.connect(gain);
                gain.connect(this.sfxGain);
                
                osc.start(now + 0.8 + i * 0.08);
                osc.stop(now + 1.2 + i * 0.08);
            }
        }
        
        playDefeat() {
            if (!this.audioContext) this.init();
            const ctx = this.audioContext;
            const now = ctx.currentTime;
            
            const osc = ctx.createOscillator();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(300, now);
            osc.frequency.exponentialRampToValueAtTime(80, now + 0.8);
            
            const gain = ctx.createGain();
            gain.gain.setValueAtTime(0.3, now);
            gain.gain.setTargetAtTime(0.01, now + 0.5, 0.2);
            
            const filter = ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.value = 800;
            
            osc.connect(filter);
            filter.connect(gain);
            gain.connect(this.sfxGain);
            
            osc.start(now);
            osc.stop(now + 1);
        }
        
        startBattleMusic() {
            if (!this.audioContext) this.init();
            if (this.isMusicPlaying) return;
            this.isMusicPlaying = true;
            
            const ctx = this.audioContext;
            const now = ctx.currentTime;
            
            const bassPattern = [60, 0, 55, 0, 60, 60, 0, 55];
            const beatDuration = 0.3;
            
            const scheduleBeat = (startTime) => {
                bassPattern.forEach((freq, i) => {
                    if (freq === 0) return;
                    
                    const osc = ctx.createOscillator();
                    osc.type = 'triangle';
                    osc.frequency.value = freq;
                    
                    const gain = ctx.createGain();
                    gain.gain.setValueAtTime(0.15, startTime + i * beatDuration);
                    gain.gain.setTargetAtTime(0.01, startTime + i * beatDuration + 0.1, 0.05);
                    
                    osc.connect(gain);
                    gain.connect(this.musicGain);
                    
                    osc.start(startTime + i * beatDuration);
                    osc.stop(startTime + i * beatDuration + 0.2);
                });
            };
            
            for (let loop = 0; loop < 4; loop++) {
                scheduleBeat(now + loop * bassPattern.length * beatDuration);
            }
            
            const drone = ctx.createOscillator();
            drone.type = 'sine';
            drone.frequency.value = 40;
            
            const droneGain = ctx.createGain();
            droneGain.gain.value = 0.1;
            
            drone.connect(droneGain);
            droneGain.connect(this.musicGain);
            
            drone.start(now);
            this.musicNodes.push(drone, droneGain);
            
            const melodyNotes = [261.63, 329.63, 392.00, 349.23, 392.00, 329.63, 261.63, 220.00];
            const melodyDuration = 2.4;
            
            melodyNotes.forEach((freq, i) => {
                const osc = ctx.createOscillator();
                osc.type = 'sine';
                osc.frequency.value = freq;
                
                const gain = ctx.createGain();
                const noteStart = now + (i / melodyNotes.length) * melodyDuration;
                gain.gain.setValueAtTime(0, noteStart);
                gain.gain.linearRampToValueAtTime(0.08, noteStart + 0.05);
                gain.gain.setTargetAtTime(0.01, noteStart + 0.2, 0.1);
                
                osc.connect(gain);
                gain.connect(this.musicGain);
                
                osc.start(noteStart);
                osc.stop(noteStart + 0.3);
                this.musicNodes.push(osc, gain);
            });
            
            this.musicLoopInterval = setInterval(() => {
                if (!this.isMusicPlaying) return;
                this.startBattleMusicLoop();
            }, 9600);
        }
        
        startBattleMusicLoop() {
            if (!this.isMusicPlaying) return;
            const ctx = this.audioContext;
            const now = ctx.currentTime;
            
            for (let bar = 0; bar < 2; bar++) {
                for (let beat = 0; beat < 8; beat++) {
                    if (beat % 2 === 0) {
                        const noise = ctx.createBufferSource();
                        const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.05, ctx.sampleRate);
                        const noiseData = noiseBuffer.getChannelData(0);
                        for (let i = 0; i < noiseData.length; i++) {
                            noiseData[i] = (Math.random() * 2 - 1) * 0.3;
                        }
                        noise.buffer = noiseBuffer;
                        
                        const filter = ctx.createBiquadFilter();
                        filter.type = 'lowpass';
                        filter.frequency.value = 150;
                        
                        const gain = ctx.createGain();
                        gain.gain.setValueAtTime(0.15, now + bar * 2.4 + beat * 0.3);
                        gain.gain.setTargetAtTime(0.01, now + bar * 2.4 + beat * 0.3 + 0.02, 0.02);
                        
                        noise.connect(filter);
                        filter.connect(gain);
                        gain.connect(this.musicGain);
                        
                        noise.start(now + bar * 2.4 + beat * 0.3);
                        noise.stop(now + bar * 2.4 + beat * 0.3 + 0.05);
                    }
                }
            }
            
            const melodyNotes = [261.63, 329.63, 392.00, 349.23, 392.00, 329.63, 261.63, 220.00];
            melodyNotes.forEach((freq, i) => {
                const osc = ctx.createOscillator();
                osc.type = 'sine';
                osc.frequency.value = freq;
                
                const gain = ctx.createGain();
                const noteStart = now + (i / melodyNotes.length) * 2.4;
                gain.gain.setValueAtTime(0, noteStart);
                gain.gain.linearRampToValueAtTime(0.06, noteStart + 0.05);
                gain.gain.setTargetAtTime(0.01, noteStart + 0.15, 0.08);
                
                osc.connect(gain);
                gain.connect(this.musicGain);
                
                osc.start(noteStart);
                osc.stop(noteStart + 0.25);
            });
        }
        
        switchToVictoryMusic() {
            this.stopMusic();
            
            if (!this.audioContext) return;
            const ctx = this.audioContext;
            const now = ctx.currentTime;
            
            const chord = [523.25, 659.25, 783.99];
            chord.forEach(freq => {
                const osc = ctx.createOscillator();
                osc.type = 'triangle';
                osc.frequency.value = freq;
                
                const gain = ctx.createGain();
                gain.gain.setValueAtTime(0.15, now);
                gain.gain.setTargetAtTime(0.08, now + 1, 0.5);
                
                osc.connect(gain);
                gain.connect(this.musicGain);
                
                osc.start(now);
                this.musicNodes.push(osc, gain);
            });
        }
        
        stopMusic() {
            this.isMusicPlaying = false;
            if (this.musicLoopInterval) {
                clearInterval(this.musicLoopInterval);
                this.musicLoopInterval = null;
            }
            this.musicNodes.forEach(node => {
                try { node.stop(); } catch(e) {}
            });
            this.musicNodes = [];
        }
    }

    // ============================================
    // Canvas粒子特效系统
    // ============================================
    
    class ParticleSystem {
        constructor() {
            this.canvas = null;
            this.ctx = null;
            this.particles = [];
            this.animationId = null;
            this.isRunning = false;
        }
        
        init() {
            this.canvas = document.getElementById('particleCanvas');
            if (!this.canvas) return;
            this.ctx = this.canvas.getContext('2d');
            this.resizeCanvas();
        }
        
        resizeCanvas() {
            if (!this.canvas) return;
            const modal = document.getElementById('battleModal');
            if (modal) {
                this.canvas.width = modal.clientWidth;
                this.canvas.height = modal.clientHeight;
            }
        }
        
        start() {
            if (this.isRunning) return;
            this.isRunning = true;
            this.animate();
        }
        
        stop() {
            this.isRunning = false;
            if (this.animationId) {
                cancelAnimationFrame(this.animationId);
                this.animationId = null;
            }
        }
        
        clear() {
            this.particles = [];
        }
        
        animate() {
            if (!this.isRunning) return;
            
            if (!this.ctx || !this.canvas) {
                this.animationId = requestAnimationFrame(() => this.animate());
                return;
            }
            
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            
            for (let i = this.particles.length - 1; i >= 0; i--) {
                const p = this.particles[i];
                p.update();
                p.draw(this.ctx);
                
                if (p.isDead()) {
                    this.particles.splice(i, 1);
                }
            }
            
            this.animationId = requestAnimationFrame(() => this.animate());
        }
        
        createCircleParticle(x, y, options = {}) {
            return new CircleParticle(x, y, {
                color: options.color || '#ffaa00',
                colorEnd: options.colorEnd || '#ff4400',
                size: options.size || 8,
                vx: options.vx || (Math.random() - 0.5) * 8,
                vy: options.vy || (Math.random() - 0.5) * 8,
                life: options.life || 60,
                gravity: options.gravity || 0.1,
                glow: options.glow !== false,
                ...options
            });
        }
        
        createStarParticle(x, y, options = {}) {
            return new StarParticle(x, y, {
                color: options.color || '#ffdd00',
                size: options.size || 12,
                vx: options.vx || (Math.random() - 0.5) * 6,
                vy: options.vy || (Math.random() - 0.5) * 6,
                life: options.life || 80,
                rotation: options.rotation || 0,
                rotationSpeed: options.rotationSpeed || (Math.random() - 0.5) * 0.2,
                points: options.points || 5,
                ...options
            });
        }
        
        emitBurst(x, y, colors, count = 20) {
            for (let i = 0; i < count; i++) {
                const angle = (i / count) * Math.PI * 2;
                const speed = 3 + Math.random() * 5;
                
                this.particles.push(this.createCircleParticle(x, y, {
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,
                    color: colors[Math.floor(Math.random() * colors.length)],
                    size: 4 + Math.random() * 6,
                    life: 40 + Math.random() * 20,
                    gravity: 0.05,
                    glow: true
                }));
            }
        }
        
        getHeroColors(heroId) {
            const heroColors = {
                tieZhu: ['#ffd700', '#ffaa00', '#ff8800', '#ffcc44'],
                xingJiSi: ['#aaddff', '#9400d3', '#da70d6', '#ffffff'],
                moJinShou: ['#88ff88', '#44cc44', '#ffd700', '#ffcc00'],
                banShanKe: ['#ffaa66', '#ff6600', '#ff4400', '#ffaa00']
            };
            return heroColors[heroId] || ['#ffffff', '#ffaa00'];
        }
    }
    
    // 粒子基类
    class Particle {
        constructor(x, y, options = {}) {
            this.x = x;
            this.y = y;
            this.vx = options.vx || 0;
            this.vy = options.vy || 0;
            this.size = options.size || 10;
            this.sizeEnd = options.sizeEnd !== undefined ? options.sizeEnd : 0;
            this.color = options.color || '#ffffff';
            this.colorEnd = options.colorEnd || this.color;
            this.life = options.life || 60;
            this.maxLife = this.life;
            this.gravity = options.gravity || 0;
            this.friction = options.friction || 0.98;
            this.rotation = options.rotation || 0;
            this.rotationSpeed = options.rotationSpeed || 0;
            this.alpha = 1;
            this.fadeOut = options.fadeOut !== false;
            this.glow = options.glow || false;
        }
        
        update() {
            this.vx *= this.friction;
            this.vy *= this.friction;
            this.vy += this.gravity;
            this.x += this.vx;
            this.y += this.vy;
            this.rotation += this.rotationSpeed;
            this.life--;
            
            if (this.fadeOut) {
                this.alpha = this.life / this.maxLife;
            }
            
            if (this.sizeEnd !== undefined) {
                const progress = 1 - this.life / this.maxLife;
                this.size = this.size + (this.sizeEnd - this.size) * progress;
            }
        }
        
        draw(ctx) {}
        
        isDead() {
            return this.life <= 0;
        }
    }
    
    // 圆形粒子
    class CircleParticle extends Particle {
        constructor(x, y, options = {}) {
            super(x, y, options);
        }
        
        draw(ctx) {
            ctx.save();
            ctx.globalAlpha = this.alpha;
            
            if (this.glow) {
                const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size * 2);
                gradient.addColorStop(0, this.color);
                gradient.addColorStop(0.5, this.colorEnd);
                gradient.addColorStop(1, 'transparent');
                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size * 2, 0, Math.PI * 2);
                ctx.fill();
            }
            
            const coreGradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size);
            coreGradient.addColorStop(0, '#ffffff');
            coreGradient.addColorStop(0.3, this.color);
            coreGradient.addColorStop(1, this.colorEnd);
            ctx.fillStyle = coreGradient;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.restore();
        }
    }
    
    // 星形粒子
    class StarParticle extends Particle {
        constructor(x, y, options = {}) {
            super(x, y, options);
            this.points = options.points || 5;
        }
        
        draw(ctx) {
            ctx.save();
            ctx.globalAlpha = this.alpha;
            ctx.translate(this.x, this.y);
            ctx.rotate(this.rotation);
            
            ctx.fillStyle = this.color;
            ctx.shadowColor = this.color;
            ctx.shadowBlur = this.glow ? 15 : 0;
            
            ctx.beginPath();
            for (let i = 0; i < this.points * 2; i++) {
                const radius = i % 2 === 0 ? this.size : this.size * 0.5;
                const angle = (i * Math.PI) / this.points - Math.PI / 2;
                const px = Math.cos(angle) * radius;
                const py = Math.sin(angle) * radius;
                if (i === 0) ctx.moveTo(px, py);
                else ctx.lineTo(px, py);
            }
            ctx.closePath();
            ctx.fill();
            
            ctx.restore();
        }
    }

    // ============================================
    // 配置数据
    // ============================================
    
    const HERO_STATS = {
        tieZhu: { 
            name: '铁柱', 
            icon: '🛡️', 
            hp: 120, 
            atk: 20, 
            def: 8, 
            speed: 85, 
            portrait: 'https://www.coze.cn/s/GShA-7yOypU/', 
            job: '重装战士', 
            attackType: 'gold', 
            skillColor: '#ffd700', 
            skillType: 'single' 
        },
        xingJiSi: { 
            name: '星祭司', 
            icon: '✨', 
            hp: 75, 
            atk: 24, 
            def: 4, 
            speed: 110, 
            portrait: 'https://www.coze.cn/s/EmbK-qYRUvw/', 
            job: '秘法师', 
            attackType: 'star', 
            skillColor: '#aaddff', 
            skillType: 'single' 
        },
        moJinShou: { 
            name: '摸金手', 
            icon: '🔭', 
            hp: 90, 
            atk: 22, 
            def: 5, 
            speed: 105, 
            portrait: 'https://www.coze.cn/s/G4cwsF_5a1A/', 
            job: '风水师', 
            attackType: 'rune', 
            skillColor: '#88ff88', 
            skillType: 'single' 
        },
        banShanKe: { 
            name: '搬山客', 
            icon: '⚙️', 
            hp: 95, 
            atk: 21, 
            def: 6, 
            speed: 95, 
            portrait: 'https://www.coze.cn/s/IfrAhL1vG6I/', 
            job: '机关师', 
            attackType: 'gear', 
            skillColor: '#ffaa66', 
            skillType: 'single' 
        }
    };
    
    const RAGE_CONFIG = { 
        initial: 30, 
        perAttack: 20, 
        perHit: 15, 
        max: 100 
    };
    
    const ENEMY_PORTRAITS = {
        normal: ['https://www.coze.cn/s/GiEfwGxwWbs/'],
        boss: ['https://www.coze.cn/s/G1CDLZ4vzMs/']
    };

    // ============================================
    // 战斗状态
    // ============================================
    
    let battleHeroes = [];
    let battleState = { 
        heroes: [], 
        enemies: [], 
        actionQueue: [], 
        currentIndex: 0, 
        turn: 0, 
        logs: [], 
        isRunning: false, 
        isBoss: false 
    };

    // ============================================
    // 全局实例
    // ============================================
    
    const audioSystem = new AudioSystem();
    const particleSystem = new ParticleSystem();

    // ============================================
    // 战斗核心函数
    // ============================================

    const starBonus = { 1: 1.0, 2: 1.1, 3: 1.2, 4: 1.35, 5: 1.5, 6: 1.8 };

    function calcBattleStats(heroData, treasureData) {
        const starMult = starBonus[heroData.starLevel] || 1.0;
        const breakMult = 1 + (heroData.breakLevel * 0.05);
        const rarityMult = { 'N': 0.7, 'R': 0.85, 'SR': 1.0, 'SSR': 1.3, 'UR': 1.5 }[heroData.rarity] || 1.0;
        const g = heroData.growth;
        const l = heroData.level;

        let baseHp = (heroData.stats.hp + g.hp * (l - 1)) * starMult * breakMult * rarityMult;
        let baseAtk = (heroData.stats.atk + g.atk * (l - 1)) * starMult * breakMult * rarityMult;
        let baseDef = (heroData.stats.def + g.def * (l - 1)) * starMult * breakMult * rarityMult;
        let baseSpd = (heroData.stats.speed + g.speed * (l - 1)) * starMult * breakMult * rarityMult;

        if (heroData.equippedTreasure && treasureData) {
            const treasure = treasureData[heroData.equippedTreasure];
            if (treasure) {
                const qualityMult = { 'N': 0.7, 'R': 0.85, 'SR': 1.0, 'SSR': 1.2, 'UR': 1.5 }[treasure.quality] || 1.0;
                const treasureBonus = treasure.mainAttr.value * qualityMult * (1 + treasure.breakLevel * 0.1);
                if (treasure.mainAttr.type === 'hp') baseHp *= (1 + treasureBonus / 100);
                if (treasure.mainAttr.type === 'atk') baseAtk *= (1 + treasureBonus / 100);
                if (treasure.mainAttr.type === 'def') baseDef *= (1 + treasureBonus / 100);
            }
        }

        return {
            hp: Math.floor(baseHp),
            maxHp: Math.floor(baseHp),
            atk: Math.floor(baseAtk),
            def: Math.floor(baseDef),
            speed: Math.floor(baseSpd),
            critRate: heroData.stats.critRate || 5,
            critDamage: heroData.stats.critDamage || 150
        };
    }

    function initBattleHeroes() {
        const useGameData = typeof GameDataManager !== 'undefined' && GameDataManager.data;
        const treasures = useGameData ? GameDataManager.data.treasures : null;

        if (useGameData) {
            const heroesData = GameDataManager.data.heroes;
            battleHeroes = Object.values(heroesData).map(hero => {
                const stats = calcBattleStats(hero, treasures);
                const portraitMap = {
                    'tieZhu': 'https://www.coze.cn/s/GShA-7yOypU/',
                    'xingJiSi': 'https://www.coze.cn/s/EmbK-qYRUvw/',
                    'moJinShou': 'https://www.coze.cn/s/G4cwsF_5a1A/',
                    'banShanKe': 'https://www.coze.cn/s/IfrAhL1vG6I/'
                };
                return {
                    id: hero.id,
                    name: hero.name,
                    icon: hero.icon,
                    hp: stats.hp,
                    maxHp: stats.maxHp,
                    atk: stats.atk,
                    def: stats.def,
                    speed: stats.speed,
                    critRate: stats.critRate,
                    critDamage: stats.critDamage,
                    portrait: portraitMap[hero.id] || '',
                    job: hero.class,
                    rage: RAGE_CONFIG.initial,
                    level: hero.level,
                    starLevel: hero.starLevel
                };
            });
        } else {
            battleHeroes = [
                { ...HERO_STATS.tieZhu, id: 'tieZhu', hp: HERO_STATS.tieZhu.hp, maxHp: HERO_STATS.tieZhu.hp, rage: RAGE_CONFIG.initial },
                { ...HERO_STATS.xingJiSi, id: 'xingJiSi', hp: HERO_STATS.xingJiSi.hp, maxHp: HERO_STATS.xingJiSi.hp, rage: RAGE_CONFIG.initial },
                { ...HERO_STATS.moJinShou, id: 'moJinShou', hp: HERO_STATS.moJinShou.hp, maxHp: HERO_STATS.moJinShou.hp, rage: RAGE_CONFIG.initial },
                { ...HERO_STATS.banShanKe, id: 'banShanKe', hp: HERO_STATS.banShanKe.hp, maxHp: HERO_STATS.banShanKe.hp, rage: RAGE_CONFIG.initial }
            ];
        }
        battleState.heroes = [...battleHeroes];
    }

    function startBattle(isBoss = false) {
        battleState.isBoss = isBoss;
        battleState.turn = 0;
        battleState.logs = [];
        battleState.isRunning = false;

        initBattleHeroes();

        const enemyCount = isBoss ? 2 : 3;
        battleState.enemies = [];
        
        const portraits = isBoss ? ENEMY_PORTRAITS.boss : ENEMY_PORTRAITS.normal;
        
        for (let i = 0; i < enemyCount; i++) {
            battleState.enemies.push({
                id: `enemy_${i}`, 
                name: isBoss ? '星棺守卫' : '墓穴守卫',
                icon: isBoss ? '💀' : '👹', 
                portrait: portraits[i % portraits.length],
                hp: isBoss ? 80 : 40, 
                maxHp: isBoss ? 80 : 40,
                atk: isBoss ? 18 : 12, 
                def: isBoss ? 6 : 3,
                speed: isBoss ? 80 : 92, 
                isBoss: isBoss
            });
        }

        rebuildActionQueue();
        battleState.turn = 1;

        document.getElementById('battleTitle').textContent = isBoss ? '💀 Boss战 - 星棺守卫' : '⚔️ 遭遇战斗 - 墓穴守卫';
        document.getElementById('battleModal').classList.add('active');

        renderBattle();
        
        audioSystem.init();
        audioSystem.startBattleMusic();

        setTimeout(() => {
            battleState.isRunning = true;
            executeNextAction();
        }, 1000);
    }

    function closeBattle() {
        audioSystem.stopMusic();
        document.getElementById('battleModal').classList.remove('active');
    }

    function rebuildActionQueue() {
        battleState.actionQueue = [];
        battleState.heroes.forEach(hero => {
            if (hero.hp > 0) battleState.actionQueue.push({ type: 'hero', id: hero.id, acted: false });
        });
        battleState.enemies.forEach(enemy => {
            if (enemy.hp > 0) battleState.actionQueue.push({ type: 'enemy', id: enemy.id, acted: false });
        });
        battleState.actionQueue.sort((a, b) => {
            const aSpeed = a.type === 'hero' ? battleState.heroes.find(h => h.id === a.id).speed : battleState.enemies.find(e => e.id === a.id).speed;
            const bSpeed = b.type === 'hero' ? battleState.heroes.find(h => h.id === b.id).speed : battleState.enemies.find(e => e.id === b.id).speed;
            return bSpeed - aSpeed;
        });
    }

    function renderBattle() {
        const enemyArea = document.getElementById('enemyArea');
        enemyArea.innerHTML = battleState.enemies.map(e => `
            <div class="card-unit enemy-unit ${e.hp <= 0 ? 'dead' : ''}" id="enemy-${e.id}">
                <div class="card-portrait">
                    ${e.portrait ? `<img src="${e.portrait}" alt="${e.name}" onerror="this.parentElement.innerHTML='<div class=card-icon>${e.icon}</div>'">` : `<div class="card-icon">${e.icon}</div>`}
                </div>
                <div class="card-overlay">
                    <div class="card-name-overlay">${e.name}</div>
                    <div class="hp-bar-overlay">
                        <div class="hp-bar"><div class="hp-fill ${e.hp/e.maxHp < 0.3 ? 'low' : ''} ${e.hp/e.maxHp < 0.15 ? 'critical' : ''}" style="width:${(e.hp/e.maxHp)*100}%"></div><span class="hp-value">${e.hp}/${e.maxHp}</span></div>
                    </div>
                </div>
            </div>
        `).join('');

        const heroArea = document.getElementById('heroArea');
        heroArea.innerHTML = battleState.heroes.map(h => `
            <div class="card-unit hero-unit ${h.hp <= 0 ? 'dead' : ''} ${h.rage >= RAGE_CONFIG.max ? 'ready' : ''}" id="hero-${h.id}" onclick="onHeroCardClick('${h.id}')" style="cursor: ${h.rage >= RAGE_CONFIG.max && h.hp > 0 ? 'pointer' : 'default'}">
                <div class="card-portrait">
                    <img src="${HERO_STATS[h.id].portrait}" alt="${h.name}" onerror="this.parentElement.innerHTML='<div class=card-icon>${HERO_STATS[h.id].icon}</div>'">
                </div>
                <div class="card-overlay">
                    <div class="card-name-overlay">${h.name}</div>
                    <div class="hp-bar-overlay">
                        <div class="hp-bar"><div class="hp-fill ${h.hp/h.maxHp < 0.3 ? 'low' : ''} ${h.hp/h.maxHp < 0.15 ? 'critical' : ''}" style="width:${(h.hp/h.maxHp)*100}%"></div><span class="hp-value">${h.hp}/${h.maxHp}</span></div>
                    </div>
                    <div class="rage-bar-overlay">
                        <div class="rage-bar"><div class="rage-fill ${h.rage >= RAGE_CONFIG.max ? 'full' : ''}" style="width:${h.rage}%"></div><span class="rage-value">${h.rage}</span></div>
                    </div>
                    ${h.rage >= RAGE_CONFIG.max ? '<div style="text-align:center;font-size:9px;color:#ffcc00;margin-top:2px;">⚡可释放技能</div>' : ''}
                </div>
            </div>
        `).join('');

        const currentAction = battleState.actionQueue.find(a => !a.acted);
        const actionBar = document.getElementById('actionBarArea');
        actionBar.innerHTML = '<div class="action-bar">' + battleState.actionQueue.map(a => {
            const isHero = a.type === 'hero';
            const stats = isHero ? HERO_STATS[a.id] : battleState.enemies.find(e => e.id === a.id);
            const portrait = isHero ? stats.portrait : (battleState.enemies.find(e => e.id === a.id)?.portrait);
            const icon = stats.icon;
            const actedClass = a.acted ? 'acted' : '';
            const typeClass = isHero ? 'hero' : 'enemy';
            const isCurrent = currentAction && currentAction.id === a.id && currentAction.type === a.type;
            let content = portrait && !a.acted ? `<img class="action-slot-img" src="${portrait}" alt="${stats.name}">` : `<span class="action-slot-icon">${icon}</span>`;
            return `<div class="action-slot ${typeClass} ${actedClass} ${isCurrent ? 'current' : ''}" title="${stats.name}">${content}</div>`;
        }).join('') + '</div>';

        document.getElementById('battleTurn').textContent = `回合 ${battleState.turn}`;
        document.getElementById('battleLog').innerHTML = battleState.logs.slice(-6).map(l => `<div class="battle-log-entry ${l.type}">${l.text}</div>`).join('');
    }

    function addBattleLog(text, type) { 
        battleState.logs.push({ text, type }); 
    }

    function onHeroCardClick(heroId) {
        const hero = battleState.heroes.find(h => h.id === heroId);
        if (!hero || hero.hp <= 0) return;

        if (hero.rage >= RAGE_CONFIG.max) {
            addBattleLog(`${hero.name}释放怒气技能！`, 'player-skill');
            useHeroSkill(hero, true);
        }
    }

    function calculateDamage(atk, def, isCrit = false) {
        const base = Math.max(1, atk - def * 0.5);
        const variance = base * 0.2;
        let damage = Math.floor(base + (Math.random() * 2 - 1) * variance);
        if (isCrit) damage = Math.floor(damage * 1.8);
        return damage;
    }

    function selectRandomTarget(targets) {
        if (!targets || targets.length === 0) return null;
        return targets[Math.floor(Math.random() * targets.length)];
    }

    function executeNextAction() {
        if (!battleState.isRunning) return;

        const aliveHeroes = battleState.heroes.filter(h => h.hp > 0);
        const aliveEnemies = battleState.enemies.filter(e => e.hp > 0);

        if (aliveEnemies.length === 0) { endBattle(true); return; }
        if (aliveHeroes.length === 0) { endBattle(false); return; }

        const current = battleState.actionQueue.find(a => !a.acted && (a.type === 'hero' ? battleState.heroes.find(h => h.id === a.id).hp > 0 : battleState.enemies.find(e => e.id === a.id).hp > 0));

        if (!current) {
            battleState.turn++;
            battleState.actionQueue.forEach(a => a.acted = false);
            rebuildActionQueue();
            renderBattle();
            setTimeout(() => executeNextAction(), 500);
            return;
        }

        current.acted = true;
        highlightCurrentActor(current);

        if (current.type === 'hero') {
            const hero = battleState.heroes.find(h => h.id === current.id);
            if (hero.rage >= RAGE_CONFIG.max) { heroUseSkill(current.id); }
            else { heroAttack(current.id); }
        } else { enemyAttack(current.id); }
    }
    
    function highlightCurrentActor(current) {
        const prefix = current.type === 'hero' ? 'hero' : 'enemy';
        const el = document.getElementById(`${prefix}-${current.id}`);
        if (el) { el.classList.add('attack-flash'); setTimeout(() => el.classList.remove('attack-flash'), 300); }
    }

    // ========== 特效函数 ==========
    function showDamageNumber(element, damage, type) {
        const rect = element.getBoundingClientRect();
        const num = document.createElement('div');
        num.className = `damage-number ${type}`;
        num.textContent = '-' + damage;
        num.style.left = `${rect.left + rect.width/2 - 20}px`;
        num.style.top = `${rect.top + 20}px`;
        document.body.appendChild(num);
        setTimeout(() => num.remove(), 1000);
    }

    function createParticles(container, count, color, size = 8) {
        const particles = [];
        for (let i = 0; i < count; i++) {
            const particle = document.createElement('div');
            particle.className = 'death-particle';
            particle.style.background = color;
            particle.style.width = size + 'px';
            particle.style.height = size + 'px';
            particle.style.left = '50%';
            particle.style.top = '50%';
            const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
            const distance = 40 + Math.random() * 60;
            const tx = Math.cos(angle) * distance;
            const ty = Math.sin(angle) * distance - 20;
            particle.style.setProperty('--tx', tx + 'px');
            particle.style.setProperty('--ty', ty + 'px');
            particle.style.animation = `particle-scatter ${0.5 + Math.random() * 0.3}s ease-out forwards`;
            container.appendChild(particle);
            particles.push(particle);
        }
        setTimeout(() => particles.forEach(p => p.remove()), 1000);
    }

    function showCritEffect(element) {
        const crit = document.createElement('div');
        crit.className = 'crit-effect';
        element.appendChild(crit);
        element.classList.add('crit-hit');
        setTimeout(() => { crit.remove(); element.classList.remove('crit-hit'); }, 600);
    }

    function showHitEffect(element, isCrit = false) {
        element.classList.add('hit-flash');
        element.classList.add('hit-shake');
        setTimeout(() => { element.classList.remove('hit-flash'); element.classList.remove('hit-shake'); }, isCrit ? 600 : 450);
    }

    function showDeathEffect(element, unit) {
        element.classList.add('enemy-death-anim');
        const spirit = document.createElement('div');
        spirit.className = 'death-spirit';
        spirit.textContent = '💨';
        spirit.style.left = '50%';
        spirit.style.top = '50%';
        spirit.style.transform = 'translate(-50%, -50%)';
        element.appendChild(spirit);
        const colors = ['#ff6666', '#ffaa66', '#ffdd66', '#ffffff'];
        createParticles(element, 12, colors[Math.floor(Math.random() * colors.length)], 6);
        audioSystem.playDeath();
        setTimeout(() => spirit.remove(), 1000);
    }

    function showAttackEffect(attackerElement, defenderElement, heroId, isCrit) {
        const attackType = HERO_STATS[heroId]?.attackType || 'gold';
        const skillColor = HERO_STATS[heroId]?.skillColor || '#ffd700';
        
        const slash = document.createElement('div');
        slash.className = `slash-${attackType}`;
        
        if (attackType === 'star') {
            slash.style.background = `radial-gradient(circle, ${skillColor}88 0%, transparent 70%)`;
            slash.style.animation = 'slash-pulse 0.4s ease-out forwards';
            for (let i = 0; i < 5; i++) {
                const star = document.createElement('div');
                star.style.cssText = `position: absolute; font-size: 12px; left: ${30 + Math.random() * 40}%; top: ${20 + Math.random() * 60}%; animation: spirit-rise 0.5s ease-out forwards; animation-delay: ${i * 0.05}s;`;
                star.textContent = '✨';
                slash.appendChild(star);
            }
        } else if (attackType === 'rune') {
            const runes = ['☯', '☰', '☱', '☲', '☳', '⚶'];
            for (let i = 0; i < 4; i++) {
                const rune = document.createElement('div');
                rune.style.cssText = `position: absolute; font-size: 16px; left: ${20 + Math.random() * 60}%; top: ${20 + Math.random() * 60}%; color: ${skillColor}; animation: spirit-rise 0.6s ease-out forwards; animation-delay: ${i * 0.08}s; text-shadow: 0 0 10px ${skillColor};`;
                rune.textContent = runes[Math.floor(Math.random() * runes.length)];
                slash.appendChild(rune);
            }
        } else if (attackType === 'gear') {
            slash.innerHTML = `<svg viewBox="0 0 100 100" style="animation: gear-spin 0.4s linear forwards;"><circle cx="50" cy="50" r="20" fill="${skillColor}" opacity="0.8"/><circle cx="50" cy="50" r="35" fill="none" stroke="${skillColor}" stroke-width="6"/>${[0,45,90,135,180,225,270,315].map(angle => `<circle cx="${50 + 30*Math.cos(angle*Math.PI/180)}" cy="${50 + 30*Math.sin(angle*Math.PI/180)}" r="8" fill="${skillColor}"/>`).join('')}</svg>`;
        }
        
        attackerElement.appendChild(slash);
        setTimeout(() => slash.remove(), 500);
        
        attackerElement.classList.add('attack-lunge');
        setTimeout(() => attackerElement.classList.remove('attack-lunge'), 300);
        
        defenderElement.classList.add('attack-flash');
        setTimeout(() => defenderElement.classList.remove('attack-flash'), 300);
        
        showHitEffect(defenderElement, isCrit);
        if (isCrit) showCritEffect(defenderElement);
    }

    function showSkillEffect(heroId, targetElement) {
        const heroStats = HERO_STATS[heroId];
        if (!heroStats) return;
        
        const heroElement = document.getElementById(`hero-${heroId}`);
        if (!heroElement) return;
        
        audioSystem.playSkill();
        
        const charge = document.createElement('div');
        charge.className = 'skill-charge';
        charge.style.borderColor = heroStats.skillColor;
        heroElement.appendChild(charge);
        
        const battleModal = document.getElementById('battleModal');
        battleModal.classList.add('screen-shake-heavy');
        setTimeout(() => battleModal.classList.remove('screen-shake-heavy'), 500);
        
        setTimeout(() => {
            charge.remove();
            
            let skillEffect;
            switch(heroId) {
                case 'tieZhu':
                    skillEffect = document.createElement('div');
                    skillEffect.className = 'skill-tiezhu-impact';
                    break;
                case 'xingJiSi':
                    skillEffect = document.createElement('div');
                    skillEffect.className = 'skill-xingjisi-particles';
                    for (let i = 0; i < 20; i++) {
                        const particle = document.createElement('div');
                        particle.style.cssText = `position: absolute; font-size: ${10 + Math.random() * 10}px; left: ${Math.random() * 100}%; top: ${Math.random() * 100}%; animation: spirit-rise ${0.5 + Math.random() * 0.5}s ease-out forwards; animation-delay: ${Math.random() * 0.3}s; color: ${['#aaddff', '#ffffff', '#ffddaa'][Math.floor(Math.random() * 3)]}; text-shadow: 0 0 10px currentColor;`;
                        particle.textContent = ['✨', '⭐', '🌟'][Math.floor(Math.random() * 3)];
                        skillEffect.appendChild(particle);
                    }
                    targetElement.appendChild(skillEffect);
                    setTimeout(() => skillEffect.remove(), 1000);
                    break;
                case 'moJinShou':
                    skillEffect = document.createElement('div');
                    skillEffect.className = 'skill-mojinshou-runes';
                    const runes = ['☯', '☰', '☱', '☲', '☳', '⚶', '᚛', '᚜', '卍', '☸'];
                    for (let i = 0; i < 8; i++) {
                        const rune = document.createElement('div');
                        const angle = (360 / 8) * i;
                        rune.style.cssText = `position: absolute; font-size: 20px; left: calc(50% + ${60 * Math.cos(angle * Math.PI / 180)}px - 10px); top: calc(50% + ${60 * Math.sin(angle * Math.PI / 180)}px - 10px); color: #88ff88; animation: gear-spin 1s linear forwards; text-shadow: 0 0 15px #88ff88;`;
                        rune.textContent = runes[i % runes.length];
                        skillEffect.appendChild(rune);
                    }
                    targetElement.appendChild(skillEffect);
                    setTimeout(() => skillEffect.remove(), 1000);
                    break;
                case 'banShanKe':
                    skillEffect = document.createElement('div');
                    skillEffect.className = 'skill-banshanke-gears';
                    for (let i = 0; i < 4; i++) {
                        const gear = document.createElement('div');
                        gear.style.cssText = `position: absolute; width: ${40 + i * 15}px; height: ${40 + i * 15}px; top: 50%; left: 50%; transform: translate(-50%, -50%); border: 4px solid #ffaa66; border-radius: 50%; animation: gear-spin ${0.5 + i * 0.2}s linear forwards; opacity: ${0.8 - i * 0.15};`;
                        skillEffect.appendChild(gear);
                    }
                    targetElement.appendChild(skillEffect);
                    setTimeout(() => skillEffect.remove(), 1000);
                    break;
                default:
                    skillEffect = document.createElement('div');
                    skillEffect.className = 'area-burst';
                    break;
            }
            
            if (heroId === 'tieZhu' || !['xingJiSi', 'moJinShou', 'banShanKe'].includes(heroId)) {
                targetElement.appendChild(skillEffect);
                setTimeout(() => skillEffect.remove(), 700);
            }
        }, 300);
        
        setTimeout(() => {
            const burst = document.createElement('div');
            burst.className = 'area-burst';
            targetElement.appendChild(burst);
            setTimeout(() => burst.remove(), 500);
        }, 350);
    }

    function showEnemyAttackEffect(attackerElement, defenderElement) {
        attackerElement.classList.add('attack-dive');
        setTimeout(() => attackerElement.classList.remove('attack-dive'), 300);
        
        defenderElement.classList.add('attack-flash');
        setTimeout(() => defenderElement.classList.remove('attack-flash'), 300);
        
        showHitEffect(defenderElement);
        
        const battleModal = document.getElementById('battleModal');
        battleModal.classList.add('screen-shake');
        setTimeout(() => battleModal.classList.remove('screen-shake'), 300);
    }

    // ========== 战斗动作 ==========
    function heroAttack(heroId) {
        const hero = battleState.heroes.find(h => h.id === heroId);
        const aliveEnemies = battleState.enemies.filter(e => e.hp > 0);
        const target = selectRandomTarget(aliveEnemies);
        if (!target) { setTimeout(() => executeNextAction(), 300); return; }

        const isCrit = Math.random() < (hero.critRate / 100);
        const damage = calculateDamage(hero.atk, target.def, isCrit);
        target.hp = Math.max(0, target.hp - damage);
        hero.rage = Math.min(RAGE_CONFIG.max, hero.rage + RAGE_CONFIG.perAttack);

        setTimeout(() => {
            const attackerEl = document.getElementById(`hero-${heroId}`);
            const defenderEl = document.getElementById(`enemy-${target.id}`);
            
            if (defenderEl) {
                if (attackerEl) showAttackEffect(attackerEl, defenderEl, heroId, isCrit);
                showDamageNumber(defenderEl, damage, isCrit ? 'crit' : 'damage');
            }
            if (isCrit) audioSystem.playCrit();
            else audioSystem.playAttack();
            audioSystem.playHit();
        }, 100);

        const critText = isCrit ? ' 💥暴击！' : '';
        addBattleLog(`⚔️ ${hero.name} 攻击 ${target.name}，造成 ${damage} 伤害${critText}`, 'player-attack');

        if (target.hp <= 0) {
            addBattleLog(`☠️ ${target.name} 被击败！`, 'enemy-death');
            setTimeout(() => {
                const el = document.getElementById(`enemy-${target.id}`);
                if (el) showDeathEffect(el, target);
            }, 150);
        }

        renderBattle();
        if (hero.rage >= RAGE_CONFIG.max) addBattleLog(`⚡ ${hero.name} 怒气已满，准备释放终极技能！`, 'player-skill');
        setTimeout(() => executeNextAction(), 800);
    }

    function heroUseSkill(heroId) {
        const hero = battleState.heroes.find(h => h.id === heroId);
        const heroStats = HERO_STATS[heroId];
        const aliveEnemies = battleState.enemies.filter(e => e.hp > 0);
        if (aliveEnemies.length === 0) { setTimeout(() => executeNextAction(), 300); return; }

        let targets = [];
        if (heroStats.skillType === 'aoe') targets = [...aliveEnemies];
        else {
            const target = selectRandomTarget(aliveEnemies);
            if (target) targets = [target];
        }
        if (targets.length === 0) { setTimeout(() => executeNextAction(), 300); return; }

        const damages = targets.map(target => ({ target: target, damage: Math.floor(calculateDamage(hero.atk * 2, target.def, true)) }));
        damages.forEach(d => { d.target.hp = Math.max(0, d.target.hp - d.damage); });
        hero.rage = 0;

        setTimeout(() => {
            const mainTargetEl = document.getElementById(`enemy-${targets[0].id}`);
            if (mainTargetEl) showSkillEffect(heroId, mainTargetEl);
            
            damages.forEach((d, index) => {
                const el = document.getElementById(`enemy-${d.target.id}`);
                if (el) {
                    setTimeout(() => {
                        showDamageNumber(el, d.damage, 'crit');
                        el.classList.add('shake-heavy');
                        setTimeout(() => el.classList.remove('shake-heavy'), 500);
                    }, index * 100);
                }
            });
        }, 100);

        if (targets.length === 1) addBattleLog(`🔥 ${hero.name} 释放终极技能！对 ${targets[0].name} 造成 ${damages[0].damage} 毁灭性暴击伤害！`, 'player-skill');
        else {
            const totalDamage = damages.reduce((sum, d) => sum + d.damage, 0);
            const targetNames = targets.map(t => t.name).join('、');
            addBattleLog(`🔥 ${hero.name} 释放终极技能！对 ${targetNames} 造成 ${totalDamage} 毁灭性暴击伤害！`, 'player-skill');
        }
        
        damages.forEach(d => {
            if (d.target.hp <= 0) {
                addBattleLog(`☠️ ${d.target.name} 被击杀！`, 'enemy-death');
                setTimeout(() => {
                    const el = document.getElementById(`enemy-${d.target.id}`);
                    if (el) showDeathEffect(el, d.target);
                }, 200 + damages.indexOf(d) * 100);
            }
        });

        renderBattle();
        setTimeout(() => executeNextAction(), 1200);
    }

    function enemyAttack(enemyId) {
        const enemy = battleState.enemies.find(e => e.id === enemyId);
        const aliveHeroes = battleState.heroes.filter(h => h.hp > 0);
        if (aliveHeroes.length === 0) return;
        
        const target = selectRandomTarget(aliveHeroes);
        if (!target) { setTimeout(() => executeNextAction(), 300); return; }

        const damage = calculateDamage(enemy.atk, target.def);
        target.hp = Math.max(0, target.hp - damage);
        target.rage = Math.min(RAGE_CONFIG.max, target.rage + RAGE_CONFIG.perHit);

        setTimeout(() => {
            const attackerEl = document.getElementById(`enemy-${enemyId}`);
            const defenderEl = document.getElementById(`hero-${target.id}`);
            
            if (defenderEl) {
                if (attackerEl) showEnemyAttackEffect(attackerEl, defenderEl);
                showDamageNumber(defenderEl, damage, 'damage');
            }
            audioSystem.playHit();
        }, 100);

        addBattleLog(`💀 ${enemy.name} 攻击 ${target.name}，造成 ${damage} 伤害`, 'enemy-attack');
        if (target.rage >= RAGE_CONFIG.max) addBattleLog(`⚡ ${target.name} 怒气已满！`, 'player-skill');
        renderBattle();
        setTimeout(() => executeNextAction(), 800);
    }

    function endBattle(isVictory) {
        battleState.isRunning = false;
        const modal = document.getElementById('battleModal');
        
        if (isVictory) {
            modal.classList.add('battle-victory-glow');
            addBattleLog('🏆 战斗胜利！', 'enemy-death');
            audioSystem.switchToVictoryMusic();
            audioSystem.playVictory();
            
            const particles = ['✨', '⭐', '🌟', '💫'];
            for (let i = 0; i < 10; i++) {
                setTimeout(() => {
                    const spirit = document.createElement('div');
                    spirit.className = 'death-spirit';
                    spirit.textContent = particles[Math.floor(Math.random() * particles.length)];
                    spirit.style.cssText = `left: ${20 + Math.random() * 60}%; top: ${30 + Math.random() * 40}%; font-size: ${16 + Math.random() * 16}px;`;
                    modal.appendChild(spirit);
                    setTimeout(() => spirit.remove(), 1000);
                }, i * 100);
            }
        } else {
            addBattleLog('💀 战斗失败...', 'enemy-attack');
            audioSystem.playDefeat();
        }
        renderBattle();
        setTimeout(() => modal.classList.remove('battle-victory-glow'), 1500);
    }

    // ============================================
    // 导出API
    // ============================================
    
    window.BattleSystem = {
        // 初始化
        init: injectCSS,
        
        // 启动战斗
        startBattle: startBattle,
        closeBattle: closeBattle,
        
        // 访问器
        getAudioSystem: () => audioSystem,
        getParticleSystem: () => particleSystem,
        getBattleState: () => battleState,
        getBattleHeroes: () => battleHeroes,
        getHeroStats: () => HERO_STATS,
        getRageConfig: () => RAGE_CONFIG,
        getEnemyPortraits: () => ENEMY_PORTRAITS,
        
        // 渲染
        renderBattle: renderBattle,
        
        // 特效
        showDamageNumber: showDamageNumber,
        showCritEffect: showCritEffect,
        showHitEffect: showHitEffect,
        showDeathEffect: showDeathEffect,
        showAttackEffect: showAttackEffect,
        showSkillEffect: showSkillEffect,
        showEnemyAttackEffect: showEnemyAttackEffect,
        createParticles: createParticles,
        
        // 战斗动作
        heroAttack: heroAttack,
        heroUseSkill: heroUseSkill,
        enemyAttack: enemyAttack,
        executeNextAction: executeNextAction,
        endBattle: endBattle,
        
        // 工具
        addBattleLog: addBattleLog,
        calculateDamage: calculateDamage,
        selectRandomTarget: selectRandomTarget,
        highlightCurrentActor: highlightCurrentActor,
        rebuildActionQueue: rebuildActionQueue,
        initBattleHeroes: initBattleHeroes
    };

    // 自动初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', injectCSS);
    } else {
        injectCSS();
    }

})();
