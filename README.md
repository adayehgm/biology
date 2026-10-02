# 實驗室大危機：博士的合格試煉 (Lab Danger: The Doctor's Trial)

> 國中七年級生物 CH1 遊戲化複習 2D 動作射擊與解謎闖關網頁遊戲

![Version](https://img.shields.io/badge/version-v1.0-blue.svg)
![Target](https://img.shields.io/badge/target-GitHub%20Pages-brightgreen.svg)
![Curriculum](https://img.shields.io/badge/curriculum-Junior%20High%20Biology%20CH1-orange.svg)

---

## 📖 遊戲故事背景

警報響起！生物實驗室突變細菌全面失控！  
身為實習研究員的你，必須穿越三處高危險隔離區域，解鎖博士配置的【知識終端機】以解除氣閘封鎖。  
注意！在通過顯微鏡光學走廊時，視野將受到複式顯微鏡倒立像的干擾，操作將會完全顛倒！只有兼具敏捷走位與扎實生物觀念的研究員，才能順利通過博士的合格試煉！

---

## 🎮 操作說明

| 操作 | 動作說明 |
|---|---|
| **W / A / S / D** 或 **方向鍵** | 移動角色避開細菌與障礙物 |
| **滑鼠游標** | 定向瞄準 |
| **滑鼠左鍵** | 發射能量射線消滅突變菌（支援連發） |
| **靠近黃色 [ ? ] 終端機** | 暫停遊戲並啟動知識考核 |
| **A / B / C / D 鍵** 或 **滑鼠點選** | 選擇題目選項 |
| **右上角音效按鈕** | 切換音效開啟／靜音 |

---

## 🧬 核心學科機制整合 (國七生物 CH1)

1. **複式顯微鏡「光學鏡像污染區」**
   - 地圖上以紫色虛線與視野光圈標示。
   - 進入該區域時，移動方向**上下顛倒、左右相反**，完美還原複式顯微鏡操作玻片標本時的倒像手感。
   - 離開區域後即刻恢復正常操作，抬頭 HUD 會即時顯示鏡像警告。

2. **知識終端機 (Quiz Terminal)**
   - 每關配置 3 台（黃色問號方塊），共 3 區 9 台。
   - 靠近自動暫停遊戲並由 86 題 CH1 題庫中隨機抽題（同局不重複）。

3. **雙層回饋系統**
   - **即時戰鬥反饋**：
     - **答對**：HP +20（上限 100）、+300 分、跑速提升 +15%（每關重置）。
     - **答錯**：HP -10，右上角浮現 1～2 秒幽默因果短語（`fail_msg`），不中斷戰鬥走位節奏。
   - **結算復盤（博士實驗評估日誌）**：
     - 通關或陣亡後展示詳細評估報告：總得分、答對率、博士生動評語。
     - 逐題展開：題目、學生選項、正確答案與**課本觀念詳解 (`log`)**。

4. **逃脫氣閘門 (EXIT PORTAL)**
   - 初始為紅色鎖定狀態（LOCK 🔒）。
   - 解鎖該區 3 台終端機後，警報解除並轉為綠色脈衝光圈（EXIT ⚡）。
   - 踏入氣閘門觸發全場紫外線清屏消毒，消滅剩餘細菌並挺進下一區！

---

## 📁 專案目錄結構

```text
BioLabEscape/
├── .gitignore             # 忽略 VS / 系統暫存檔案
├── README.md              # 專案說明與操作指南
├── SPECIFICATION.md       # 需求規格說明書
├── 1-1_題庫_等級_易.json    # 原始題目題庫 JSON (86題)
├── index.html             # 遊戲主入口 (純前端，GitHub Pages 根目錄)
├── css/
│   └── style.css          # 科幻生物實驗室 HUD、彈窗、結算日誌樣式
├── js/
│   ├── quizBank.js        # 86 題題庫陣列與無重複隨機抽題邏輯
│   ├── engine.js          # 玩家／小怪／子彈物理、Web Audio 音效合成與 Canvas 繪圖
│   ├── levelManager.js    # 關卡進程、光學鏡像區、終端機與氣閘門判定
│   └── main.js            # 遊戲狀態機、主迴圈與事件監聽
└── assets/
    ├── images/            # 圖像資源目錄
    └── sounds/            # 音效資源目錄
```

---

## 🚀 部署至 GitHub Pages

本專案為純前端架構（Vanilla HTML5 / CSS3 / ES6 JavaScript + Canvas），無任何第三方 npm 套件或後端伺服器依賴，資源皆採用相對路徑：

1. 將本專案儲存庫推送至 GitHub：
   ```bash
   git init
   git add .
   git commit -m "feat: complete BioLabEscape game project"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/BioLabEscape.git
   git push -u origin main
   ```
2. 進入 GitHub 儲存庫頁面，點選 **Settings** -> **Pages**。
3. 在 **Branch** 選項選擇 `main` 分支與 `/ (root)` 目錄，按 **Save**。
4. 等候約 1 分鐘，即可透過 `https://YOUR_USERNAME.github.io/BioLabEscape/` 直接開啟遊玩！
5. 亦可直接在本地端雙擊 `index.html` 或以任一本地 HTTP 伺服器開啟。

---

## 🧪 驗收清單

- [x] WASD／方向鍵平滑移動，且受邊界與障礙物碰撞限制。
- [x] 滑鼠定向瞄準射擊消滅細菌怪；小怪觸碰扣 15 HP 並具 0.5 秒無敵閃爍。
- [x] 進入顯微鏡鏡像區後，操作自動反轉（上下顛倒、左右相反），離開後復原。
- [x] 靠近終端機暫停答題；答對補血加速、答錯扣血並顯示幽默因果短語。
- [x] 局內題目完全不重複，解鎖 3 台終端機後氣閘門轉為綠色光圈。
- [x] 踏入氣閘門觸發紫外線滅菌清屏特效，進入更高等級區域；第 3 區通過後觸發通關。
- [x] HP 歸零或通關即時顯示「博士實驗評估日誌」，可捲動複習所有題目的課本觀念解析。
