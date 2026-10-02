/**
 * BioLabEscape - levelManager.js
 * 關卡進程、光學鏡像區、知識終端機、障礙物與氣閘門判定
 */

class LevelManager {
  constructor(canvasWidth = 1024, canvasHeight = 640) {
    this.width = canvasWidth;
    this.height = canvasHeight;
    this.bounds = { minX: 30, minY: 30, maxX: canvasWidth - 30, maxY: canvasHeight - 30 };
    this.currentLevel = 1;
    this.maxLevels = 3;

    this.mirrorZones = [];
    this.terminals = [];
    this.obstacles = [];
    this.exitPortal = null;
    this.portalUnlocked = false;

    // 顯微鏡內浮游細胞雜質動畫種子
    this.floaters = [];
    this.initFloaters();

    this.setupLevel(1);
  }

  initFloaters() {
    this.floaters = [];
    for (let i = 0; i < 20; i++) {
      this.floaters.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        vx: (Math.random() - 0.5) * 15,
        vy: (Math.random() - 0.5) * 15,
        radius: 4 + Math.random() * 8,
        alpha: 0.15 + Math.random() * 0.25
      });
    }
  }

  setupLevel(level) {
    this.currentLevel = level;
    this.portalUnlocked = false;
    this.mirrorZones = [];
    this.terminals = [];
    this.obstacles = [];

    // 出口氣閘門位置 (固定於最右側走廊中央)
    this.exitPortal = {
      x: this.width - 70,
      y: this.height / 2 - 60,
      w: 50,
      h: 120,
      pulse: 0
    };

    if (level === 1) {
      // 關卡 1：初級培養室 (1 處鏡像區，3 台終端機)
      this.title = "第 1 區：初級微生物培育室";
      this.enemySpeedMult = 1.0;
      this.spawnInterval = 3.0; // 秒

      // 1 處光學鏡像區 (中央通道)
      this.mirrorZones.push({
        x: 420,
        y: 180,
        w: 240,
        h: 280,
        type: 'rect',
        name: '低倍物鏡視野區 (10X)'
      });

      // 3 台終端機
      this.terminals.push({ id: 1, x: 200, y: 150, solved: false, pulse: 0 });
      this.terminals.push({ id: 2, x: 540, y: 480, solved: false, pulse: 0 });
      this.terminals.push({ id: 3, x: 780, y: 160, solved: false, pulse: 0 });

      // 實驗室桌台障礙物
      this.obstacles.push({ x: 260, y: 260, w: 90, h: 120, label: '培育箱' });
      this.obstacles.push({ x: 700, y: 320, w: 90, h: 120, label: '滅菌釜' });
    } else if (level === 2) {
      // 關卡 2：高倍光學顯微走廊 (2 處鏡像區，3 台終端機)
      this.title = "第 2 區：高倍顯微鏡光學走廊";
      this.enemySpeedMult = 1.3;
      this.spawnInterval = 2.5;

      // 2 處鏡像區
      this.mirrorZones.push({
        x: 220,
        y: 100,
        w: 220,
        h: 220,
        type: 'rect',
        name: '高倍視野區 A (40X)'
      });
      this.mirrorZones.push({
        x: 580,
        y: 320,
        w: 250,
        h: 240,
        type: 'rect',
        name: '高倍視野區 B (40X)'
      });

      // 3 台終端機 (放置在具戰略意義位置)
      this.terminals.push({ id: 1, x: 330, y: 210, solved: false, pulse: 0 }); // 位於鏡像區內！
      this.terminals.push({ id: 2, x: 480, y: 480, solved: false, pulse: 0 });
      this.terminals.push({ id: 3, x: 700, y: 150, solved: false, pulse: 0 });

      // 障礙物
      this.obstacles.push({ x: 480, y: 120, w: 60, h: 160, label: '光學分析台' });
      this.obstacles.push({ x: 480, y: 360, w: 60, h: 140, label: '高速離心機' });
    } else {
      // 關卡 3：深層基因突變核心 (3 處鏡像區，3 台終端機)
      this.title = "第 3 區：深層基因突變核心";
      this.enemySpeedMult = 1.6;
      this.spawnInterval = 2.0;

      // 3 處鏡像區
      this.mirrorZones.push({
        x: 180,
        y: 80,
        w: 220,
        h: 200,
        type: 'rect',
        name: '油鏡光學浸潤區 (100X)'
      });
      this.mirrorZones.push({
        x: 480,
        y: 200,
        w: 240,
        h: 240,
        type: 'rect',
        name: '基因重組核心鏡像場'
      });
      this.mirrorZones.push({
        x: 200,
        y: 360,
        w: 220,
        h: 220,
        type: 'rect',
        name: '紫外線共軛視野區'
      });

      // 3 台終端機
      this.terminals.push({ id: 1, x: 290, y: 180, solved: false, pulse: 0 });
      this.terminals.push({ id: 2, x: 600, y: 320, solved: false, pulse: 0 });
      this.terminals.push({ id: 3, x: 800, y: 480, solved: false, pulse: 0 });

      // 障礙物形成迷宮隔板
      this.obstacles.push({ x: 420, y: 80, w: 40, h: 180, label: '高壓隔離屏' });
      this.obstacles.push({ x: 740, y: 220, w: 40, h: 220, label: '基因定序儀' });
      this.obstacles.push({ x: 260, y: 280, w: 140, h: 40, label: '冷凍電鏡台' });
    }
  }

  getSolvedCount() {
    return this.terminals.filter(t => t.solved).length;
  }

  isAllTerminalsSolved() {
    return this.getSolvedCount() === this.terminals.length;
  }

  unlockPortal() {
    this.portalUnlocked = true;
  }

  // 判定座標是否身處光學鏡像污染區
  isInMirrorZone(x, y) {
    for (const zone of this.mirrorZones) {
      if (x >= zone.x && x <= zone.x + zone.w && y >= zone.y && y <= zone.y + zone.h) {
        return true;
      }
    }
    return false;
  }

  // 判定玩家是否靠近尚未解開的終端機 (觸發距離約 42px)
  checkTerminalProximity(playerX, playerY) {
    for (const term of this.terminals) {
      if (!term.solved) {
        const dist = Math.hypot(playerX - term.x, playerY - term.y);
        if (dist <= 42) {
          return term;
        }
      }
    }
    return null;
  }

  // 判定玩家是否踏入已解鎖的氣閘門
  checkExitPortal(playerX, playerY) {
    if (!this.portalUnlocked || !this.exitPortal) return false;
    const ep = this.exitPortal;
    return (
      playerX >= ep.x - 10 &&
      playerX <= ep.x + ep.w + 10 &&
      playerY >= ep.y - 10 &&
      playerY <= ep.y + ep.h + 10
    );
  }

  update(dt) {
    // 更新浮游細胞動畫
    for (const f of this.floaters) {
      f.x += f.vx * dt;
      f.y += f.vy * dt;
      if (f.x < 0) f.x = this.width;
      if (f.x > this.width) f.x = 0;
      if (f.y < 0) f.y = this.height;
      if (f.y > this.height) f.y = 0;
    }

    // 終端機脈動呼吸光
    for (const t of this.terminals) {
      t.pulse = (t.pulse || 0) + dt * 3.5;
    }

    if (this.exitPortal) {
      this.exitPortal.pulse = (this.exitPortal.pulse || 0) + dt * 4;
    }
  }

  draw(ctx) {
    // 1. 繪製實驗室科技地磚網格背景
    this.drawFloorGrid(ctx);

    // 2. 繪製複式顯微鏡「光學鏡像污染區」
    this.drawMirrorZones(ctx);

    // 3. 繪製實驗室桌台/器材障礙物
    this.drawObstacles(ctx);

    // 4. 繪製知識終端機
    this.drawTerminals(ctx);

    // 5. 繪製逃脫氣閘門 (EXIT PORTAL)
    this.drawExitPortal(ctx);
  }

  drawFloorGrid(ctx) {
    ctx.save();
    ctx.strokeStyle = 'rgba(30, 41, 59, 0.4)';
    ctx.lineWidth = 1;
    const gridSize = 40;

    for (let x = 0; x < this.width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, this.height);
      ctx.stroke();
    }
    for (let y = 0; y < this.height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(this.width, y);
      ctx.stroke();
    }

    // 實驗室外圍警戒線
    ctx.strokeStyle = 'rgba(234, 179, 8, 0.3)';
    ctx.lineWidth = 4;
    ctx.strokeRect(this.bounds.minX, this.bounds.minY, this.bounds.maxX - this.bounds.minX, this.bounds.maxY - this.bounds.minY);

    ctx.restore();
  }

  drawMirrorZones(ctx) {
    ctx.save();
    for (const zone of this.mirrorZones) {
      // 紫色微光底層
      ctx.fillStyle = 'rgba(168, 85, 247, 0.12)';
      ctx.fillRect(zone.x, zone.y, zone.w, zone.h);

      // 紫色虛線邊框 (規格 3.2 要求)
      ctx.setLineDash([8, 6]);
      ctx.strokeStyle = '#c084fc';
      ctx.shadowColor = '#c084fc';
      ctx.shadowBlur = 10;
      ctx.lineWidth = 2.5;
      ctx.strokeRect(zone.x, zone.y, zone.w, zone.h);
      ctx.setLineDash([]);

      // 顯微鏡目鏡圓形十字瞄準刻度 (模擬顯微鏡視野)
      const cx = zone.x + zone.w / 2;
      const cy = zone.y + zone.h / 2;
      const r = Math.min(zone.w, zone.h) * 0.42;

      ctx.save();
      ctx.strokeStyle = 'rgba(192, 132, 252, 0.35)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.moveTo(cx - r - 10, cy);
      ctx.lineTo(cx + r + 10, cy);
      ctx.moveTo(cx, cy - r - 10);
      ctx.lineTo(cx, cy + r + 10);
      ctx.stroke();
      ctx.restore();

      // 在鏡像區內繪製浮游顆粒 (模擬載玻片微觀雜質)
      ctx.save();
      for (const f of this.floaters) {
        if (f.x >= zone.x && f.x <= zone.x + zone.w && f.y >= zone.y && f.y <= zone.y + zone.h) {
          ctx.fillStyle = `rgba(216, 180, 254, ${f.alpha})`;
          ctx.beginPath();
          ctx.arc(f.x, f.y, f.radius, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.restore();

      // 標註提示文字
      ctx.fillStyle = '#f3e8ff';
      ctx.font = '12px "Segoe UI", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`🔬 ${zone.name}`, cx, zone.y + 20);
      ctx.fillStyle = '#e9d5ff';
      ctx.font = '11px "Segoe UI", sans-serif';
      ctx.fillText('【上下顛倒 / 左右相反】', cx, zone.y + 36);
    }
    ctx.restore();
  }

  drawObstacles(ctx) {
    ctx.save();
    for (const obs of this.obstacles) {
      // 陰影
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(obs.x + 4, obs.y + 4, obs.w, obs.h);

      // 台座主體
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(obs.x, obs.y, obs.w, obs.h);

      // 科技青藍色邊條
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 2;
      ctx.strokeRect(obs.x, obs.y, obs.w, obs.h);

      // 儀器指示燈
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(obs.x + 8, obs.y + 8, 6, 6);
      ctx.fillStyle = '#10b981';
      ctx.fillRect(obs.x + 18, obs.y + 8, 6, 6);

      // 設備文字
      ctx.fillStyle = '#94a3b8';
      ctx.font = '11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(obs.label, obs.x + obs.w / 2, obs.y + obs.h / 2 + 4);
    }
    ctx.restore();
  }

  drawTerminals(ctx) {
    ctx.save();
    for (const term of this.terminals) {
      const hover = Math.sin(term.pulse) * 4;
      const ty = term.y + hover;

      if (!term.solved) {
        // 未解鎖：黃色問號發光方塊 (規格 3.2 要求：黃色問號方塊)
        // 互動半徑光圈
        ctx.save();
        ctx.strokeStyle = 'rgba(245, 158, 11, 0.4)';
        ctx.setLineDash([4, 4]);
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(term.x, term.y, 42, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();

        // 終端機底座
        ctx.fillStyle = '#451a03';
        ctx.beginPath();
        ctx.ellipse(term.x, term.y + 20, 22, 10, 0, 0, Math.PI * 2);
        ctx.fill();

        // 黃色浮空方塊
        ctx.shadowColor = '#f59e0b';
        ctx.shadowBlur = 16;
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.roundRect(term.x - 18, ty - 18, 36, 36, 8);
        ctx.fill();

        // 內框
        ctx.strokeStyle = '#fef08a';
        ctx.lineWidth = 2;
        ctx.stroke();

        // 符號 [ ? ]
        ctx.fillStyle = '#78350f';
        ctx.font = 'bold 22px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('?', term.x, ty);

        // 提示字
        ctx.fillStyle = '#fef08a';
        ctx.font = 'bold 11px sans-serif';
        ctx.fillText('靠近答題', term.x, term.y + 36);
      } else {
        // 已解鎖：綠色安全方塊 [ ✓ ]
        ctx.fillStyle = '#064e3b';
        ctx.beginPath();
        ctx.ellipse(term.x, term.y + 20, 20, 9, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowColor = '#10b981';
        ctx.shadowBlur = 12;
        ctx.fillStyle = '#10b981';
        ctx.beginPath();
        ctx.roundRect(term.x - 16, ty - 16, 32, 32, 6);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 18px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('✓', term.x, ty);

        ctx.fillStyle = '#6ee7b7';
        ctx.font = '10px sans-serif';
        ctx.fillText('已解鎖', term.x, term.y + 34);
      }
    }
    ctx.restore();
  }

  drawExitPortal(ctx) {
    if (!this.exitPortal) return;
    const ep = this.exitPortal;
    ctx.save();

    // 氣閘門基座框架
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(ep.x - 6, ep.y - 6, ep.w + 12, ep.h + 12);
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 3;
    ctx.strokeRect(ep.x - 6, ep.y - 6, ep.w + 12, ep.h + 12);

    if (!this.portalUnlocked) {
      // 紅色鎖定狀態 (規格 3.3：紅色鎖定 LOCK)
      ctx.fillStyle = 'rgba(239, 68, 68, 0.2)';
      ctx.fillRect(ep.x, ep.y, ep.w, ep.h);

      // 紅色激光防護網
      ctx.strokeStyle = '#ef4444';
      ctx.shadowColor = '#ef4444';
      ctx.shadowBlur = 12;
      ctx.lineWidth = 2.5;

      const pulsePhase = Math.sin(ep.pulse * 2) * 5;
      for (let y = ep.y + 15; y < ep.y + ep.h; y += 20) {
        ctx.beginPath();
        ctx.moveTo(ep.x, y + pulsePhase);
        ctx.lineTo(ep.x + ep.w, y - pulsePhase);
        ctx.stroke();
      }

      // 門上文字
      ctx.save();
      ctx.translate(ep.x - 14, ep.y + ep.h / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.fillStyle = '#fca5a5';
      ctx.font = 'bold 13px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🔒 LOCK 氣閘鎖定', 0, 0);
      ctx.restore();
    } else {
      // 綠色脈衝光圈開啟狀態 (規格 3.3：全場警報解除，氣閘門轉綠色脈衝光圈 EXIT)
      const pulseAlpha = 0.5 + Math.sin(ep.pulse * 3) * 0.35;
      ctx.fillStyle = `rgba(16, 185, 129, ${pulseAlpha})`;
      ctx.fillRect(ep.x, ep.y, ep.w, ep.h);

      ctx.strokeStyle = '#34d399';
      ctx.shadowColor = '#10b981';
      ctx.shadowBlur = 24;
      ctx.lineWidth = 4;
      ctx.strokeRect(ep.x, ep.y, ep.w, ep.h);

      // 旋轉傳送門渦流
      ctx.save();
      ctx.translate(ep.x + ep.w / 2, ep.y + ep.h / 2);
      ctx.rotate(ep.pulse * 2);
      ctx.strokeStyle = '#a7f3d0';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.ellipse(0, 0, ep.w * 0.45, ep.h * 0.4, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // 門上提示文字
      ctx.save();
      ctx.translate(ep.x - 16, ep.y + ep.h / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.fillStyle = '#6ee7b7';
      ctx.font = 'bold 14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('⚡ EXIT 踏入逃脫！', 0, 0);
      ctx.restore();
    }

    ctx.restore();
  }
}

window.LevelManager = LevelManager;
