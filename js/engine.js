/**
 * BioLabEscape - engine.js
 * 玩家、細菌怪物、子彈、粒子系統、Web Audio 音效與 Canvas 繪圖渲染引擎
 */

// ==========================================
// 1. 音效合成系統 (Web Audio API - 免外掛資源)
// ==========================================
class SoundFX {
  constructor() {
    this.ctx = null;
    this.muted = false;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    return this.muted;
  }

  playLaser() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      const now = this.ctx.currentTime;
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(160, now + 0.12);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.12);
    } catch (e) {}
  }

  playHit() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      const now = this.ctx.currentTime;
      osc.frequency.setValueAtTime(120, now);
      osc.frequency.linearRampToValueAtTime(40, now + 0.2);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.2);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.2);
    } catch (e) {}
  }

  playPop() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      const now = this.ctx.currentTime;
      osc.frequency.setValueAtTime(350, now);
      osc.frequency.exponentialRampToValueAtTime(700, now + 0.08);
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.08);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.08);
    } catch (e) {}
  }

  playCorrect() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    try {
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const now = this.ctx.currentTime + idx * 0.08;
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.25);
      });
    } catch (e) {}
  }

  playWrong() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.setValueAtTime(110, now + 0.15);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.35);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.35);
    } catch (e) {}
  }

  playTerminalOpen() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.15); // A5
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.2);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.2);
    } catch (e) {}
  }

  playPortalUnlock() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.4);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.5);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.5);
    } catch (e) {}
  }

  playUVPurge() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(200, now);
      osc.frequency.exponentialRampToValueAtTime(1200, now + 0.6);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.7);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.7);
    } catch (e) {}
  }
}

// ==========================================
// 2. 粒子系統 (Particles)
// ==========================================
class Particle {
  constructor(x, y, vx, vy, color, size, life) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.color = color;
    this.size = size;
    this.maxLife = life;
    this.life = life;
  }

  update(dt) {
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.vx *= 0.94;
    this.vy *= 0.94;
    this.life -= dt;
  }

  draw(ctx) {
    const alpha = Math.max(0, this.life / this.maxLife);
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = this.color;
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size * alpha, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

// ==========================================
// 3. 子彈實體 (Energy Ray Bullets)
// ==========================================
class Bullet {
  constructor(x, y, angle) {
    this.x = x;
    this.y = y;
    this.speed = 650; // px/s
    this.vx = Math.cos(angle) * this.speed;
    this.vy = Math.sin(angle) * this.speed;
    this.radius = 4;
    this.life = 1.5; // 最長飛行時間
  }

  update(dt) {
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.life -= dt;
  }

  draw(ctx) {
    ctx.save();
    ctx.shadowColor = '#00f0ff';
    ctx.shadowBlur = 10;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();

    // 拖尾光線
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    ctx.lineTo(this.x - this.vx * 0.03, this.y - this.vy * 0.03);
    ctx.stroke();
    ctx.restore();
  }
}

// ==========================================
// 4. 細菌怪物 (Bacteria Enemies)
// ==========================================
class Enemy {
  constructor(x, y, level, type = 'coccus') {
    this.x = x;
    this.y = y;
    this.type = type; // 'coccus' 球菌, 'bacillus' 桿菌, 'spirillum' 螺旋菌
    this.level = level;
    this.baseSpeed = 105;
    this.speedMult = level === 1 ? 1.0 : (level === 2 ? 1.3 : 1.6);
    this.speed = this.baseSpeed * this.speedMult;
    this.radius = 16;
    this.hp = 1;
    this.maxHp = 1;
    this.pulse = Math.random() * Math.PI * 2;

    if (type === 'bacillus') {
      this.radius = 18;
      this.hp = 2;
      this.maxHp = 2;
      this.speed *= 0.9;
    } else if (type === 'spirillum') {
      this.radius = 14;
      this.speed *= 1.15;
    }
  }

  update(dt, playerX, playerY) {
    this.pulse += dt * 5;
    const dx = playerX - this.x;
    const dy = playerY - this.y;
    const dist = Math.hypot(dx, dy);

    if (dist > 1) {
      let vx = (dx / dist) * this.speed;
      let vy = (dy / dist) * this.speed;

      // 螺旋菌具有稍微蜿蜒擺動軌跡
      if (this.type === 'spirillum') {
        const perpX = -dy / dist;
        const perpY = dx / dist;
        const wiggle = Math.sin(this.pulse * 2) * (this.speed * 0.4);
        vx += perpX * wiggle;
        vy += perpY * wiggle;
      }

      this.x += vx * dt;
      this.y += vy * dt;
    }
  }

  draw(ctx) {
    ctx.save();
    const pulseScale = 1 + Math.sin(this.pulse) * 0.08;
    ctx.translate(this.x, this.y);
    ctx.scale(pulseScale, pulseScale);

    if (this.type === 'coccus') {
      // 球菌：亮橘紅色，顆粒突起
      ctx.shadowColor = '#f97316';
      ctx.shadowBlur = 12;
      ctx.fillStyle = '#ea580c';
      ctx.beginPath();
      ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#fb923c';
      ctx.beginPath();
      ctx.arc(-4, -4, this.radius * 0.45, 0, Math.PI * 2);
      ctx.fill();

      // 表面蛋白質小球
      ctx.fillStyle = '#fef08a';
      for (let i = 0; i < 6; i++) {
        const ang = (i * Math.PI) / 3 + this.pulse * 0.5;
        const bx = Math.cos(ang) * this.radius;
        const by = Math.sin(ang) * this.radius;
        ctx.beginPath();
        ctx.arc(bx, by, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (this.type === 'bacillus') {
      // 桿菌：毒液螢光綠，膠囊狀
      ctx.shadowColor = '#10b981';
      ctx.shadowBlur = 14;
      ctx.fillStyle = '#059669';

      // 畫圓角膠囊
      ctx.beginPath();
      ctx.roundRect(-this.radius * 1.2, -this.radius * 0.7, this.radius * 2.4, this.radius * 1.4, 10);
      ctx.fill();

      ctx.fillStyle = '#34d399';
      ctx.beginPath();
      ctx.roundRect(-this.radius * 0.9, -this.radius * 0.4, this.radius * 1.8, this.radius * 0.8, 6);
      ctx.fill();

      // 血條 (若多於1滴血)
      if (this.maxHp > 1) {
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.fillRect(-14, -this.radius - 8, 28, 4);
        ctx.fillStyle = '#10b981';
        ctx.fillRect(-14, -this.radius - 8, 28 * (this.hp / this.maxHp), 4);
      }
    } else {
      // 螺旋菌：品紅色波浪
      ctx.shadowColor = '#ec4899';
      ctx.shadowBlur = 14;
      ctx.fillStyle = '#db2777';
      ctx.beginPath();
      ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#f472b6';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, this.radius + 3, 0, Math.PI * 1.5);
      ctx.stroke();
    }

    ctx.restore();
  }
}

// ==========================================
// 5. 玩家實體 (Player)
// ==========================================
class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.radius = 17;
    this.baseSpeed = 240;
    this.speedBonus = 0; // 每答對一題加成 0.15，上限 0.60
    this.invulnerableTimer = 0; // 受傷無敵時間 (秒)
    this.facingAngle = 0;
    this.isMirrored = false; // 是否身處光學鏡像區
  }

  get currentSpeed() {
    return this.baseSpeed * (1 + this.speedBonus);
  }

  update(dt, input, isInsideMirror, mapBounds, obstacles) {
    this.isMirrored = isInsideMirror;

    if (this.invulnerableTimer > 0) {
      this.invulnerableTimer -= dt;
    }

    // 計算移動向量
    let moveX = 0;
    let moveY = 0;

    if (input.keys['KeyW'] || input.keys['ArrowUp']) moveY -= 1;
    if (input.keys['KeyS'] || input.keys['ArrowDown']) moveY += 1;
    if (input.keys['KeyA'] || input.keys['ArrowLeft']) moveX -= 1;
    if (input.keys['KeyD'] || input.keys['ArrowRight']) moveX += 1;

    // 【學科核心機制】：複式顯微鏡倒像光學污染區
    // 移動方向「上下顛倒、左右相反」
    if (this.isMirrored) {
      moveX = -moveX;
      moveY = -moveY;
    }

    // 歸一化對角線移動速度
    if (moveX !== 0 || moveY !== 0) {
      const len = Math.hypot(moveX, moveY);
      const vx = (moveX / len) * this.currentSpeed;
      const vy = (moveY / len) * this.currentSpeed;

      const nextX = this.x + vx * dt;
      const nextY = this.y + vy * dt;

      // 檢查邊界碰撞
      if (nextX >= mapBounds.minX + this.radius && nextX <= mapBounds.maxX - this.radius) {
        if (!this.checkObstacleCollision(nextX, this.y, obstacles)) {
          this.x = nextX;
        }
      }
      if (nextY >= mapBounds.minY + this.radius && nextY <= mapBounds.maxY - this.radius) {
        if (!this.checkObstacleCollision(this.x, nextY, obstacles)) {
          this.y = nextY;
        }
      }
    }

    // 面向滑鼠角度
    this.facingAngle = Math.atan2(input.mouseY - this.y, input.mouseX - this.x);
  }

  checkObstacleCollision(x, y, obstacles) {
    if (!obstacles || obstacles.length === 0) return false;
    for (const obs of obstacles) {
      const closestX = Math.max(obs.x, Math.min(x, obs.x + obs.w));
      const closestY = Math.max(obs.y, Math.min(y, obs.y + obs.h));
      const dist = Math.hypot(x - closestX, y - closestY);
      if (dist < this.radius) {
        return true;
      }
    }
    return false;
  }

  draw(ctx, input) {
    ctx.save();

    // 受傷無敵閃爍
    if (this.invulnerableTimer > 0) {
      const flash = Math.floor(this.invulnerableTimer * 20) % 2 === 0;
      if (flash) ctx.globalAlpha = 0.35;
    }

    // 瞄準指示虛線
    ctx.save();
    ctx.setLineDash([4, 6]);
    ctx.strokeStyle = this.isMirrored ? 'rgba(216, 70, 239, 0.45)' : 'rgba(0, 240, 255, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    ctx.lineTo(input.mouseX, input.mouseY);
    ctx.stroke();
    ctx.restore();

    // 鏡像狀態腳下光圈
    if (this.isMirrored) {
      ctx.save();
      ctx.strokeStyle = '#c084fc';
      ctx.shadowColor = '#c084fc';
      ctx.shadowBlur = 12;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius + 8, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    ctx.translate(this.x, this.y);
    ctx.rotate(this.facingAngle);

    // 防護服身軀 (科技圓形 + 護甲)
    ctx.shadowColor = '#00f0ff';
    ctx.shadowBlur = 14;
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
    ctx.fill();

    // 外圈邊框 (防護裝備)
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // 能量光面罩 (朝向瞄準方向)
    ctx.fillStyle = this.isMirrored ? '#e879f9' : '#00f0ff';
    ctx.shadowColor = ctx.fillStyle;
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(this.radius * 0.45, 0, this.radius * 0.5, -Math.PI / 2.2, Math.PI / 2.2);
    ctx.fill();

    // 能量槍發射端
    ctx.fillStyle = '#64748b';
    ctx.fillRect(this.radius * 0.5, -3, 8, 6);
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(this.radius * 0.8, -2, 4, 4);

    ctx.restore();
  }
}

// 導出全局實例與類別供其他模組使用
window.SoundFX = SoundFX;
window.Particle = Particle;
window.Bullet = Bullet;
window.Enemy = Enemy;
window.Player = Player;
