# Worth it？珍的嗎

手機優先的台幣、美元/USDT、日常商品、ETF 與一桶金 等值換算器。React + TypeScript + Vite，無會員、資料庫或付費服務。

## 在電腦啟動

1. 安裝 Node.js 24 LTS。
2. 在專案資料夾開啟終端機，執行：

```sh
npm ci
npm run dev
```

打開終端機顯示的開發網址即可。修改 `src` 內的程式，畫面會自動更新。

## 建置與預覽正式版本

```sh
npm test
npm run build
npm run preview
```

`dist` 是可部署的網站。離線功能只在正式建置啟用；首次連線載入並快取完成後，可離線重新開啟。部署必須使用 HTTPS（本機開發例外）。

## 免費部署到 GitHub Pages（不用買網域）

1. 把本專案檔案提交並推送到 `dragonjimmy-max/value-app2` 的 `main` 分支。
2. 開啟 GitHub 儲存庫 → **Settings → Pages**。
3. 在 **Build and deployment → Source** 選擇 **GitHub Actions**。
4. 開啟 **Actions**，等待 **Deploy GitHub Pages** 工作完成；也可按 **Run workflow** 手動執行。
5. 部署成功後，預期網址為 `https://dragonjimmy-max.github.io/value-app2/`。以 Pages 顯示的實際網址為準。

已附 `.github/workflows/deploy.yml`；網站資源採相對路徑，支援 GitHub Pages 的 `/value-app2/` 子目錄。免費帳號可使用公開儲存庫的 Pages；私人儲存庫的支援依 GitHub 方案而定。程式已準備推送至新儲存庫；啟用 Pages 並等待部署成功後，網站才會公開。

## Google Analytics 4

正式網站已使用 GA4 網頁資料串流 `G-LMTMCMGQ5Q`。GitHub Actions 在建置時透過 `VITE_GA_MEASUREMENT_ID` 啟用分析；格式不正確時不會載入 Google Analytics。分享連結的雜湊資料不會送進 page view，避免把換算設定放入分析網址。評估 ID 是公開識別碼，不是 API 密鑰。

## 價格與計算

尚未取得外部資料前，下列預設價格皆為**示範值，請自行調整**，不代表官方售價、ETF 收盤價或即時行情：

| 項目 | 初始示範價格 |
| --- | --- |
| 美元兌台幣 | 1 美元 = 32 元 |
| iPhone 18 | 39,900 元／支；型號與容量可修改，無已驗證官方售價 |
| 大麥克 | 85 元／個 |
| 0050 | 60 元／股 |
| SPY | 600 美元／股 |
| 滷肉飯 | 50 元／碗 |
| 珍奶 | 65 元／杯 |

商品採手動參考價；0050、SPY 與美元匯率由 GitHub Actions 在台灣時間每天約 14:30 更新一次本站的 market-prices.json，排程可能延遲。0050 使用證交所每股收盤價；SPY 使用 Yahoo Finance 完成的日線收盤價，失敗時嘗試 Stooq 日線參考價（可能經股息調整），網站顯示實際來源；匯率使用 ExchangeRate-API 免金鑰每日參考匯率。瀏覽器載入時及每 15 分鐘重新讀取本站快照。價格設定可關閉自動行情改用手動值；分享連結會鎖定價格以維持原結果。價格面板顯示來源、設定時間及狀態。商品價格依店家與規格而異。價格和主題儲存於此瀏覽器的 localStorage；離線不會把價格稱為最新行情。

來源數量 × 每單位台幣價格 = 台幣總值。美元/USDT 共用手動參考匯率，USDT 實際價格可能不同；SPY 使用每股美元價格 × 匯率；0050 直接使用每股台幣價格。所有商品及 ETF 允許小數，僅表示等值，非實際交易數量。

修改價格保留來源數量並重新計算；切換項目保留台幣總值。內部使用 JavaScript 雙精度數值，顯示通常保留最多六位小數，極小或極大值改用科學記號。可輸入 0 到 10¹⁵，價格可設 10⁻¹² 到 10¹⁵；無效輸入保留最後有效結果並提示。空輸入按零計算。

預設十列依序為：台幣、美元/USDT、滷肉飯、珍奶、大麥克、0050、標普500、iPhone 18、LV 包包、一桶金。已移除計算機與新增列按鈕；使用原生數字鍵盤輸入數量。

一桶金固定為 1,000,000 元，不是黃金行情；LV 包包預設 150,000 元，可在價格設定自訂參考價，不代表特定款式或官方定價。0050 嚴格超過 1,000 股時改以張顯示（1 張 = 1,000 股），內部與分享資料仍以股計算。編輯期間維持欄位目前單位，離開欄位或按 Enter 再切換，避免打斷輸入；以張顯示時輸入 2 即代表 2,000 股。

## 分享與 PWA

- 結果連結含來源、數量、換算列、賺／虧狀態及全部價格，讀取時驗證格式。只分享換算資料；型號欄請填商品規格。
- 結果圖片使用本機 Canvas 產生；可選「賺」的金橘牛市風，或「虧」的淡紫 QQ 風。點擊後先預覽，再選系統分享或下載 PNG。圖片底部含 App 名稱、價格設定時間及網站 QR Code；QR 在本機產生，無外部服務。QR 連到正式首頁，完整結果連結另以「複製結果連結」分享。
- 含 manifest、192／512 圖示及 Apple touch icon，使用 standalone 模式。
- 支援安裝提示才顯示安裝按鈕，其餘瀏覽器顯示 iPhone／Android 手動操作說明。
- Service worker 快取基本介面與同來源資源；首次載入成功後離線可用。更新發佈時請同步遞增 `public/sw.js` 的 CACHE 版本。

## 驗證

```sh
npm test           # 核心換算、解析、分享格式驗證
npm run build     # TypeScript + 正式建置
npm run preview -- --port 4173
npm run test:e2e  # 另一個終端機：Chromium 瀏覽器完整操作與離線測試
```

雲端環境已有 `/usr/bin/chromium`，Playwright 設定使用它。其他電腦需安裝 Chromium 或修改 `playwright.config.ts` 指向當地瀏覽器。瀏覽器測試涵蓋價格儲存、換算、0050 張股切換、一桶金、分享連結／圖片下載、主題、PWA 離線與 360／390／1280px 版面。iOS／Android 原生安裝及系統分享仍需實機驗證。

主畫面圖示採用使用者提供珍奶圖案為參考製作的可愛吉祥物，包含 180／192／512 px 圖示。賺／虧選擇是分享情境，金額輸入仍為非負數，分享圖使用正／負號表達賺虧。

## 定期行情與失敗處理

GitHub Actions 使用平台提供的 GITHUB_TOKEN 提交公開價格快照，不需要自行提供行情 API 金鑰。請確保儲存庫允許執行 Actions 與工作流程寫入內容，並在 Settings → Pages 選擇 GitHub Actions。排程通常自動啟用；可在 Actions → Update prices and deploy GitHub Pages → Run workflow 手動更新。

外部更新失敗會保留最後成功的價格與日期，紀錄錯誤；不填入零或隨機數。超過四天未有新交易日期會提示過期（連假也可能顯示過期），離線使用本機保存的價格並顯示離線。ETF 都不是即時報價；商品及 LV 均不是官方售價。

```sh
python scripts/update_market_prices.py
python -m unittest discover -s scripts -p 'test_*.py'
```

取得外部行情需要對證交所、Yahoo Finance／Stooq、ExchangeRate-API 的網路連線。本雲端的外部網路政策可能阻擋這些站台；正式更新由 GitHub 主機執行，前端只讀本站 JSON。
