/**
 * BioLabEscape - main.js
 * 遊戲狀態機、主迴圈、全域事件監聽、答題彈窗與博士評估日誌結算
 */

(function () {
  // DOM 元素引用
  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');

  // HUD 元素
  const hpFill = document.getElementById('hpFill');
  const hpText = document.getElementById('hpText');
  const scoreDisplay = document.getElementById('scoreDisplay');
  const levelBadge = document.getElementById('levelBadge');
  const terminalProgress = document.getElementById('terminalProgress');
  const terminalIcons = document.getElementById('terminalIcons');
  const mirrorWarning = document.getElementById('mirrorWarning');
  const speedBonusBadge = document.getElementById('speedBonusBadge');
  const muteBtn = document.getElementById('muteBtn');

  // 浮動提示
  const floatingFeedback = document.getElementById('floatingFeedback');
  const feedbackTitle = document.getElementById('feedbackTitle');
  const feedbackMsg = document.getElementById('feedbackMsg');

  // 彈窗模態框
  const startModal = document.getElementById('startModal');
  const startBtn = document.getElementById('startBtn');
  const quizModal = document.getElementById('quizModal');
  const quizChapter = document.getElementById('quizChapter');
  const quizCategory = document.getElementById('quizCategory');
  const quizQuestion = document.getElementById('quizQuestion');
  const quizOptionsContainer = document.getElementById('quizOptionsContainer');
  const evalModal = document.getElementById('evalModal');
  const evalTitle = document.getElementById('evalTitle');
  const evalScore = document.getElementById('evalScore');
  const evalAccuracy = document.getElementById('evalAccuracy');
  const evalLevel = document.getElementById('evalLevel');
  const evalDoctorQuote = document.getElementById('evalDoctorQuote');
  const evalList = document.getElementById('evalList');
  const restartBtn = document.getElementById('restartBtn');

  // 系統物件實例
  const soundFX = new SoundFX();
  const levelManager = new LevelManager(1024, 640);
  let player = new Player(100, 320);

  // 遊戲狀態
  const State = {
    START: 'START',
    PLAYING: 'PLAYING',
    QUIZ: 'QUIZ',
    PURGE: 'PURGE',
    GAMEOVER: 'GAMEOVER',
    VICTORY: 'VICTORY'
  };

  let gameState = State.START;
  let playerHP = 100;
  let maxHP = 100;
  let score = 0;
  let currentLevel = 1;
  const maxLevels = 3;

  let usedQuizIds = new Set();
  let answersLog = [];
  let currentQuiz = null;
  let activeTerminal = null;

  // 實體清單
  let enemies = [];
  let bullets = [];
  let particles = [];

  // 計時與生成
  let spawnTimer = 0;
  let lastTime = performance.now();
  let screenShake = 0;
  let feedbackTimer = null;
  let purgeTimer = 0;

  // 輸入狀態
  const input = {
    keys: {},
    mouseX: 512,
    mouseY: 320,
    isMouseDown: false,
    shootCooldown: 0
  };

  // ==========================================
  // 事件監聽 (鍵盤、滑鼠、自適應)
  // ==========================================
  window.addEventListener('keydown', (e) => {
    input.keys[e.code] = true;

    // 答題快捷鍵 (A, B, C, D)
    if (gameState === State.QUIZ && currentQuiz) {
      const keyUpper = e.key.toUpperCase();
      if (['A', 'B', 'C', 'D'].includes(keyUpper)) {
        handleOptionSelect(keyUpper);
      } else if (['1', '2', '3', '4'].includes(e.key)) {
        const mapping = { '1': 'A', '2': 'B', '3': 'C', '4': 'D' };
        handleOptionSelect(mapping[e.key]);
      }
    }
  });

  window.addEventListener('keyup', (e) => {
    input.keys[e.code] = false;
  });

  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    input.mouseX = (e.clientX - rect.left) * scaleX;
    input.mouseY = (e.clientY - rect.top) * scaleY;
  });

  canvas.addEventListener('mousedown', (e) => {
    if (e.button === 0) {
      input.isMouseDown = true;
      if (gameState === State.PLAYING && input.shootCooldown <= 0) {
        shootBullet();
      }
    }
  });

  window.addEventListener('mouseup', (e) => {
    if (e.button === 0) {
      input.isMouseDown = false;
    }
  });

  // 音效靜音切換
  muteBtn.addEventListener('click', () => {
    const isMuted = soundFX.toggleMute();
    muteBtn.innerHTML = isMuted ? '🔇 靜音' : '🔊 音效';
    muteBtn.classList.toggle('muted', isMuted);
  });

  // 開始遊戲
  startBtn.addEventListener('click', () => {
    soundFX.init();
    startModal.classList.add('hidden');
    initNewGame();
  });

  // 再玩一次
  restartBtn.addEventListener('click', () => {
    evalModal.classList.add('hidden');
    initNewGame();
  });

  // ==========================================
  // 遊戲生命週期控制
  // ==========================================
  function initNewGame() {
    playerHP = 100;
    score = 0;
    currentLevel = 1;
    usedQuizIds.clear();
    answersLog = [];
    enemies = [];
    bullets = [];
    particles = [];
    spawnTimer = 0;
    screenShake = 0;

    levelManager.setupLevel(1);
    resetPlayerPosition();
    player.speedBonus = 0;

    gameState = State.PLAYING;
    updateHUD();
  }

  function resetPlayerPosition() {
    player.x = 90;
    player.y = 320;
    player.invulnerableTimer = 0.5;
  }

  function startNextLevel() {
    currentLevel++;
    if (currentLevel > maxLevels) {
      triggerVictory();
      return;
    }

    levelManager.setupLevel(currentLevel);
    player.speedBonus = 0; // 規格：速度增益每關重置
    resetPlayerPosition();
    enemies = [];
    bullets = [];
    spawnTimer = 0;

    showFeedback('⚡ 氣閘消毒完成！', `踏入 ${levelManager.title}，敵人速度激增！`, 'cyan');
    gameState = State.PLAYING;
    updateHUD();
  }

  // ==========================================
  // 戰鬥與射擊
  // ==========================================
  function shootBullet() {
    const angle = Math.atan2(input.mouseY - player.y, input.mouseX - player.x);
    bullets.push(new Bullet(player.x, player.y, angle));
    soundFX.playLaser();
    input.shootCooldown = 0.18; // 射擊間隔

    // 後座力微粒子
    for (let i = 0; i < 3; i++) {
      particles.push(new Particle(
        player.x,
        player.y,
        -Math.cos(angle) * (60 + Math.random() * 40) + (Math.random() - 0.5) * 30,
        -Math.sin(angle) * (60 + Math.random() * 40) + (Math.random() - 0.5) * 30,
        '#00f0ff',
        3,
        0.25
      ));
    }
  }

  function spawnEnemy() {
    // 依關卡難度隨機生成球菌、桿菌或螺旋菌
    let type = 'coccus';
    const rand = Math.random();
    if (currentLevel === 2) {
      if (rand > 0.5) type = 'bacillus';
    } else if (currentLevel >= 3) {
      if (rand < 0.4) type = 'coccus';
      else if (rand < 0.75) type = 'bacillus';
      else type = 'spirillum';
    }

    // 隨機在邊界外側生成
    let sx, sy;
    if (Math.random() < 0.5) {
      sx = Math.random() < 0.5 ? levelManager.bounds.minX + 20 : levelManager.bounds.maxX - 20;
      sy = levelManager.bounds.minY + Math.random() * (levelManager.bounds.maxY - levelManager.bounds.minY);
    } else {
      sx = levelManager.bounds.minX + Math.random() * (levelManager.bounds.maxX - levelManager.bounds.minX);
      sy = Math.random() < 0.5 ? levelManager.bounds.minY + 20 : levelManager.bounds.maxY - 20;
    }

    // 確保不會直接生成在玩家臉上
    if (Math.hypot(sx - player.x, sy - player.y) > 160) {
      enemies.push(new Enemy(sx, sy, currentLevel, type));
    }
  }

  // ==========================================
  // 知識終端機與答題系統
  // ==========================================
  function triggerQuiz(terminal) {
    activeTerminal = terminal;
    gameState = State.QUIZ;
    soundFX.playTerminalOpen();

    // 從題庫抽取未作答的題目 (依關卡傾向)
    currentQuiz = window.getRandomQuiz(usedQuizIds, currentLevel);
    if (!currentQuiz) {
      // 題庫抽完防禦容錯
      currentQuiz = window.QUIZ_BANK[Math.floor(Math.random() * window.QUIZ_BANK.length)];
    }
    usedQuizIds.add(currentQuiz.id);

    // 渲染彈窗介面
    quizChapter.textContent = `國中生物 ${currentQuiz.chapter}`;
    quizCategory.textContent = currentQuiz.category;
    quizQuestion.textContent = currentQuiz.question;

    quizOptionsContainer.innerHTML = '';
    const letters = ['A', 'B', 'C', 'D'];
    currentQuiz.options.forEach((optText, idx) => {
      const letter = letters[idx];
      const btn = document.createElement('button');
      btn.className = 'quiz-option-btn';
      btn.innerHTML = `<span class="opt-letter">${letter}</span><span class="opt-text">${optText}</span>`;
      btn.addEventListener('click', () => handleOptionSelect(letter));
      quizOptionsContainer.appendChild(btn);
    });

    quizModal.classList.remove('hidden');
  }

  function handleOptionSelect(choiceLetter) {
    if (!currentQuiz || gameState !== State.QUIZ) return;

    const isCorrect = (choiceLetter === currentQuiz.answer);
    const letters = ['A', 'B', 'C', 'D'];
    const choiceIdx = letters.indexOf(choiceLetter);
    const correctIdx = letters.indexOf(currentQuiz.answer);

    const userChoiceStr = `${choiceLetter}. ${currentQuiz.options[choiceIdx] || ''}`;
    const ansTextStr = `${currentQuiz.answer}. ${currentQuiz.options[correctIdx] || ''}`;

    // 紀錄作答於日誌中
    answersLog.push({
      category: currentQuiz.category,
      question: currentQuiz.question,
      isCorrect: isCorrect,
      userChoice: userChoiceStr,
      ansText: ansTextStr,
      log: currentQuiz.log,
      fail_msg: currentQuiz.fail_msg
    });

    // 標記該終端機已解答
    if (activeTerminal) {
      activeTerminal.solved = true;
    }

    // 規格 3.2 雙層回饋系統：
    if (isCorrect) {
      score += 300;
      playerHP = Math.min(maxHP, playerHP + 20);
      player.speedBonus = Math.min(0.60, player.speedBonus + 0.15);
      soundFX.playCorrect();
      showFeedback('🎉 答對！試煉推進！', '+300 分 ｜ 生命 +20 ｜ 移動速度 +15%', 'green');
    } else {
      playerHP = Math.max(0, playerHP - 10);
      soundFX.playWrong();
      showFeedback('⚠️ 答錯受罰！', `生命 -10 ｜ 博士提示：${currentQuiz.fail_msg}`, 'orange');
    }

    // 關閉答題彈窗
    quizModal.classList.add('hidden');
    currentQuiz = null;
    activeTerminal = null;

    // 檢查本關 3 台終端機是否全數解鎖
    if (levelManager.isAllTerminalsSolved() && !levelManager.portalUnlocked) {
      levelManager.unlockPortal();
      soundFX.playPortalUnlock();
      showFeedback('🚨 氣閘警報解除！', '本區 3 台終端機全數連線！右側逃脫氣閘已啟動！', 'cyan');
    }

    updateHUD();

    // 判斷若因答錯扣血扣至 0
    if (playerHP <= 0) {
      triggerGameOver();
    } else {
      gameState = State.PLAYING;
    }
  }

  // ==========================================
  // 即時浮動提示 (規格 5：不遮擋主畫面中央)
  // ==========================================
  function showFeedback(title, msg, type = 'green') {
    if (feedbackTimer) clearTimeout(feedbackTimer);

    feedbackTitle.textContent = title;
    feedbackMsg.textContent = msg;

    floatingFeedback.className = 'floating-feedback show';
    floatingFeedback.classList.add(type);

    feedbackTimer = setTimeout(() => {
      floatingFeedback.className = 'floating-feedback';
    }, 2800);
  }

  // ==========================================
  // 紫外線清屏過關動畫 (UV Purge)
  // ==========================================
  function triggerUVPurge() {
    gameState = State.PURGE;
    purgeTimer = 1.0;
    soundFX.playUVPurge();
    screenShake = 15;

    // 消滅畫面中所有細菌怪
    for (const enemy of enemies) {
      score += 50;
      for (let i = 0; i < 10; i++) {
        particles.push(new Particle(
          enemy.x,
          enemy.y,
          (Math.random() - 0.5) * 220,
          (Math.random() - 0.5) * 220,
          '#a855f7',
          4,
          0.6
        ));
      }
    }
    enemies = [];
    bullets = [];
  }

  // ==========================================
  // 遊戲結束與結算復盤 (博士實驗評估日誌)
  // ==========================================
  function triggerGameOver() {
    gameState = State.GAMEOVER;
    showEvaluationLog(false);
  }

  function triggerVictory() {
    gameState = State.VICTORY;
    showEvaluationLog(true);
  }

  function showEvaluationLog(isPassed) {
    const totalAnswered = answersLog.length;
    const correctCount = answersLog.filter(a => a.isCorrect).length;
    const accuracy = totalAnswered > 0 ? Math.round((correctCount / totalAnswered) * 100) : 0;

    evalTitle.textContent = isPassed ? '🏆 試煉合格：正式研究員證書' : '⚠️ 試煉中斷：突變細菌入侵警報';
    evalTitle.style.color = isPassed ? '#10b981' : '#ef4444';

    evalScore.textContent = score;
    evalAccuracy.textContent = `${accuracy}% (${correctCount} / ${totalAnswered})`;
    evalLevel.textContent = isPassed ? '全部通過 (3/3 區)' : `第 ${currentLevel} 區中斷`;

    // 博士總評語
    let quote = '';
    if (isPassed && accuracy >= 90) {
      quote = '🌟 完美無瑕！博士讚嘆道：「你簡直是行走的生物大百科！無論顯微鏡技巧或生物圈概念皆無懈可擊，實驗室首席研究員非你莫屬！」';
    } else if (isPassed) {
      quote = '🔬 通過考驗！博士點點頭說：「身手敏捷，基礎觀念扎實！正式研究員識別證發放給你，記得複習下方錯題觀念！」';
    } else if (accuracy >= 60) {
      quote = '🧪 功虧一簣！博士推了推眼鏡：「學科知識其實不錯，但面對顯微鏡倒立像的操作走位還需加強練習，下回一定能成功逃脫！」';
    } else {
      quote = '⚠️ 觀念告急！博士嘆了一口氣：「看來你被突變細菌嚇壞了！趕快閱讀下方的課本詳解，把第 1 章觀念再複習一遍吧！」';
    }
    evalDoctorQuote.textContent = quote;

    // 逐題檢視列表 (規格 4.2 & 5)
    evalList.innerHTML = '';
    if (answersLog.length === 0) {
      evalList.innerHTML = '<div class="eval-empty">本局尚未作答任何題目即陣亡。</div>';
    } else {
      answersLog.forEach((item, idx) => {
        const itemCard = document.createElement('div');
        itemCard.className = `eval-item ${item.isCorrect ? 'correct' : 'wrong'}`;
        itemCard.innerHTML = `
          <div class="eval-item-header">
            <span class="eval-badge ${item.isCorrect ? 'badge-correct' : 'badge-wrong'}">
              ${item.isCorrect ? '✓ 答對' : '✕ 答錯'}
            </span>
            <span class="eval-category">${item.category}</span>
            <span class="eval-num">第 ${idx + 1} 題</span>
          </div>
          <div class="eval-q-text">${item.question}</div>
          <div class="eval-choices-compare">
            <div class="choice-row"><span class="label">你的選擇：</span><span class="${item.isCorrect ? 'text-green' : 'text-red'}">${item.userChoice}</span></div>
            ${!item.isCorrect ? `<div class="choice-row"><span class="label">正確答案：</span><span class="text-green font-bold">${item.ansText}</span></div>` : ''}
          </div>
          <div class="eval-log-box">
            <span class="log-tag">📘 課本觀念解析：</span>${item.log}
          </div>
        `;
        evalList.appendChild(itemCard);
      });
    }

    evalModal.classList.remove('hidden');
  }

  // ==========================================
  // 更新 HUD 抬頭顯示
  // ==========================================
  function updateHUD() {
    // 血條百分比
    const hpPercent = Math.max(0, Math.min(100, (playerHP / maxHP) * 100));
    hpFill.style.width = `${hpPercent}%`;
    hpText.textContent = `${Math.ceil(playerHP)} / ${maxHP}`;

    // 血條色系變化
    if (hpPercent > 50) {
      hpFill.style.background = 'linear-gradient(90deg, #10b981, #34d399)';
    } else if (hpPercent > 25) {
      hpFill.style.background = 'linear-gradient(90deg, #f59e0b, #fbbf24)';
    } else {
      hpFill.style.background = 'linear-gradient(90deg, #ef4444, #f87171)';
    }

    // 分數
    scoreDisplay.textContent = score;

    // 關卡
    levelBadge.textContent = `區域 ${currentLevel} / ${maxLevels}`;

    // 終端機解鎖狀態
    const solved = levelManager.getSolvedCount();
    terminalProgress.textContent = `${solved} / 3`;

    // 終端機 3 顆菱形指示燈
    terminalIcons.innerHTML = '';
    for (let i = 0; i < 3; i++) {
      const dot = document.createElement('span');
      dot.className = `term-dot ${i < solved ? 'active' : ''}`;
      terminalIcons.appendChild(dot);
    }

    // 鏡像區提示 (規格 3.2 鏡像中提示)
    const inMirror = levelManager.isInMirrorZone(player.x, player.y);
    if (inMirror) {
      mirrorWarning.classList.remove('hidden');
    } else {
      mirrorWarning.classList.add('hidden');
    }

    // 跑速加成指示
    if (player.speedBonus > 0) {
      speedBonusBadge.classList.remove('hidden');
      speedBonusBadge.textContent = `⚡ 速度 +${Math.round(player.speedBonus * 100)}%`;
    } else {
      speedBonusBadge.classList.add('hidden');
    }
  }

  // ==========================================
  // 主遊戲迴圈 (60 FPS requestAnimationFrame)
  // ==========================================
  function gameLoop(now) {
    const dt = Math.min((now - lastTime) / 1000, 0.1);
    lastTime = now;

    if (gameState === State.PLAYING) {
      updateGame(dt);
    } else if (gameState === State.PURGE) {
      updatePurge(dt);
    }

    renderGame();
    requestAnimationFrame(gameLoop);
  }

  function updateGame(dt) {
    // 1. 自動連續射擊冷卻
    if (input.shootCooldown > 0) {
      input.shootCooldown -= dt;
    }
    if (input.isMouseDown && input.shootCooldown <= 0) {
      shootBullet();
    }

    // 2. 鏡像區判定與玩家更新
    const isMirrored = levelManager.isInMirrorZone(player.x, player.y);
    player.update(dt, input, isMirrored, levelManager.bounds, levelManager.obstacles);

    // 3. 關卡與環境更新
    levelManager.update(dt);

    // 4. 終端機靠近檢測
    const nearTerm = levelManager.checkTerminalProximity(player.x, player.y);
    if (nearTerm) {
      triggerQuiz(nearTerm);
      return;
    }

    // 5. 出口氣閘門踏入判定
    if (levelManager.checkExitPortal(player.x, player.y)) {
      triggerUVPurge();
      return;
    }

    // 6. 細菌怪物生成 (限制場上最多 40 隻以保證 60 FPS)
    spawnTimer += dt;
    if (spawnTimer >= levelManager.spawnInterval && enemies.length < 40) {
      spawnTimer = 0;
      spawnEnemy();
    }

    // 7. 更新細菌怪與玩家碰撞
    for (let i = enemies.length - 1; i >= 0; i--) {
      const e = enemies[i];
      e.update(dt, player.x, player.y);

      // 與玩家碰撞判定 (扣 15 HP，無敵 0.5 秒)
      const distToPlayer = Math.hypot(player.x - e.x, player.y - e.y);
      if (distToPlayer < player.radius + e.radius) {
        if (player.invulnerableTimer <= 0) {
          playerHP = Math.max(0, playerHP - 15);
          player.invulnerableTimer = 0.5;
          soundFX.playHit();
          screenShake = 8;

          // 受傷血液/粒子火花
          for (let p = 0; p < 8; p++) {
            particles.push(new Particle(
              player.x,
              player.y,
              (Math.random() - 0.5) * 160,
              (Math.random() - 0.5) * 160,
              '#ef4444',
              3,
              0.4
            ));
          }

          updateHUD();
          if (playerHP <= 0) {
            triggerGameOver();
            return;
          }
        }
      }
    }

    // 8. 更新子彈與碰撞判定
    for (let bIdx = bullets.length - 1; bIdx >= 0; bIdx--) {
      const b = bullets[bIdx];
      b.update(dt);

      // 檢查子彈是否飛出邊界
      if (
        b.x < levelManager.bounds.minX ||
        b.x > levelManager.bounds.maxX ||
        b.y < levelManager.bounds.minY ||
        b.y > levelManager.bounds.maxY ||
        b.life <= 0
      ) {
        bullets.splice(bIdx, 1);
        continue;
      }

      // 檢查子彈是否擊中小怪
      let bulletHit = false;
      for (let eIdx = enemies.length - 1; eIdx >= 0; eIdx--) {
        const e = enemies[eIdx];
        if (Math.hypot(b.x - e.x, b.y - e.y) < b.radius + e.radius) {
          bulletHit = true;
          e.hp -= 1;

          // 命中火花
          for (let p = 0; p < 4; p++) {
            particles.push(new Particle(
              b.x,
              b.y,
              (Math.random() - 0.5) * 120,
              (Math.random() - 0.5) * 120,
              '#38bdf8',
              2.5,
              0.2
            ));
          }

          if (e.hp <= 0) {
            // 消滅怪物
            soundFX.playPop();
            score += 50;
            const popColor = e.type === 'bacillus' ? '#10b981' : (e.type === 'spirillum' ? '#ec4899' : '#f97316');
            for (let p = 0; p < 10; p++) {
              particles.push(new Particle(
                e.x,
                e.y,
                (Math.random() - 0.5) * 180,
                (Math.random() - 0.5) * 180,
                popColor,
                3.5,
                0.4
              ));
            }
            enemies.splice(eIdx, 1);
          }
          break;
        }
      }

      if (bulletHit) {
        bullets.splice(bIdx, 1);
      }
    }

    // 9. 更新粒子
    for (let i = particles.length - 1; i >= 0; i--) {
      particles[i].update(dt);
      if (particles[i].life <= 0) {
        particles.splice(i, 1);
      }
    }

    // 10. 震動衰減
    if (screenShake > 0) {
      screenShake = Math.max(0, screenShake - dt * 25);
    }

    updateHUD();
  }

  function updatePurge(dt) {
    purgeTimer -= dt;
    levelManager.update(dt);

    for (let i = particles.length - 1; i >= 0; i--) {
      particles[i].update(dt);
      if (particles[i].life <= 0) {
        particles.splice(i, 1);
      }
    }

    if (screenShake > 0) {
      screenShake = Math.max(0, screenShake - dt * 25);
    }

    if (purgeTimer <= 0) {
      startNextLevel();
    }
  }

  // ==========================================
  // 畫面繪製渲染
  // ==========================================
  function renderGame() {
    ctx.save();
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 畫面震動效果
    if (screenShake > 0) {
      const shakeX = (Math.random() - 0.5) * screenShake * 2;
      const shakeY = (Math.random() - 0.5) * screenShake * 2;
      ctx.translate(shakeX, shakeY);
    }

    // 1. 繪製關卡背景與設施
    levelManager.draw(ctx);

    // 2. 繪製子彈
    for (const b of bullets) {
      b.draw(ctx);
    }

    // 3. 繪製細菌怪
    for (const e of enemies) {
      e.draw(ctx);
    }

    // 4. 繪製玩家
    player.draw(ctx, input);

    // 5. 繪製粒子
    for (const p of particles) {
      p.draw(ctx);
    }

    // 6. 紫外線清屏特效覆蓋層
    if (gameState === State.PURGE) {
      const alpha = Math.max(0, purgeTimer / 1.0);
      ctx.save();
      ctx.fillStyle = `rgba(168, 85, 247, ${alpha * 0.45})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 紫外線雷射掃描光束
      ctx.strokeStyle = `rgba(192, 132, 252, ${alpha * 0.8})`;
      ctx.lineWidth = 6;
      ctx.beginPath();
      const sweepX = (1 - alpha) * canvas.width;
      ctx.moveTo(sweepX, 0);
      ctx.lineTo(sweepX, canvas.height);
      ctx.stroke();

      ctx.fillStyle = '#f3e8ff';
      ctx.font = 'bold 36px "Segoe UI", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('⚡ 紫外線滅菌消毒中 ⚡', canvas.width / 2, canvas.height / 2);
      ctx.restore();
    }

    ctx.restore();
  }

  // 啟動主迴圈
  requestAnimationFrame(gameLoop);
})();
