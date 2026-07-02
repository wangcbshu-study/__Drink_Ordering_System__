# 🥤 辦公室飲料點單系統 (Office Drink Ordering System)

這是一個專為辦公室下午茶揪團所設計的**精美飲料點單系統**。前端採用 React + Vite + Tailwind CSS v4 建構，後端則整合 Google Sheets 試算表（透過 Google Apps Script API），讓團購發起人可以非常輕鬆地發起點單、即時統計，並直接複製格式化的名單去向飲料店訂購。

---

## ✨ 核心特色

- **🎨 精美質感介面**：使用精心調配的茶金與可可色調，搭配玻璃擬態與微互動動畫，提供極佳的視覺與使用體驗。
- **📊 即時數據統計**：頂部卡片自動化計算並呈現「今日總杯數」、「累計總金額」、「參與人數」與「當日人氣王」。
- **📋 彈性跟單編輯**：支援即時的新增、修改與刪除個人訂單，並有姓名本機記憶功能（下次免重複輸入）。
- **🔍 便捷搜尋篩選**：支援飲料品項與訂單名單關鍵字即時搜尋，快速查找特定同仁的跟單。
- **📥 多格式一鍵導出**：
  - 📥 **下載 Excel 報表**：匯出 CSV 檔案（已處理中文 Windows Excel 亂碼問題）。
  - 📄 **下載純文字檔**：下載點單明細的文字彙整。
  - 💬 **複製 LINE 格式**：一鍵格式化複製為「店家點單總計」與「訂購人明細」，方便直接貼到 LINE / Slack 叫外送。

---

## 🛠️ 本機運行指南

### 先決條件
- 已安裝 [Node.js](https://nodejs.org/) (建議 v18 以上)

### 運行步驟

1. **安裝相依套件**：
   ```bash
   npm install
   ```

2. **設定環境變數**：
   - 複製 `.env.example` 為 `.env`
   - 將其中的 `VITE_API_URL` 設定為您的 Google Apps Script Web App API 網址：
     ```env
     VITE_API_URL="https://script.google.com/macros/s/您的API_ID/exec"
     ```

3. **啟動本機開發伺服器**：
   ```bash
   npm run dev
   ```
   啟動後，瀏覽器打開 `http://localhost:3000` 即可訪問。

4. **專案打包編譯**：
   ```bash
   npm run build
   ```
   編譯完成後的靜態檔案將儲存於 `dist` 資料夾中。

---

## ☁️ 後端設定 (Google Sheets + Apps Script)

本系統使用 Google 試算表作為資料庫，並透過 Apps Script 提供 REST API 介面。

1. 在您的 **Google 雲端硬碟**中建立一個新的 **Google 試算表**。
2. 建立兩個分頁，命名為：
   - `Menu`：設定欄位為 `name` (飲料名稱), `price` (價格), `category` (類別), `description` (描述)。
   - `Orders`：設定欄位為 `orderId` (訂單ID), `name` (姓名), `drink` (飲料), `sugar` (甜度), `ice` (冰塊), `quantity` (數量), `totalPrice` (總金額), `timestamp` (時間)。
3. 在試算表選單中點選「**擴充功能**」->「**Apps Script**」。
4. 將您的後端讀寫處理邏輯寫入 `Code.gs` 並「**部署為網頁應用程式 (Web App)**」。
5. 將權限設為 `任何人 (Anyone)`，並複製產生的網頁應用程式網址，填入前端專案的 `.env` 中即可！
