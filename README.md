# Web-MCP：AI 驅動的瀏覽器自動化

本專案旨在建立一個工具，讓 AI 代理能夠使用 `puppeteer` 控制網頁瀏覽器。AI 將透過 MCP (Multi-agent Communications Protocol) 框架與瀏覽器互動。

## 專案目標

最終目標是創建一套強大的工具，使 AI 能夠執行複雜的網頁自動化任務，例如資料爬取、表單填寫以及與網頁應用程式互動。

## 第一階段：開啟網址

本專案的第一個里程碑是實作一個基本功能，讓 AI 可以在本地瀏覽器中開啟指定的 URL。

### 運作方式
1. AI 提供一個 URL 作為輸入。
2. MCP 工具使用 `puppeteer` 啟動一個本地瀏覽器實例。
3. 瀏覽器將導航到指定的 URL。

## 未來發展

未來的階段將包括：
-   與頁面元素互動（點擊、輸入）。
-   從頁面中提取資料。
-   管理瀏覽器狀態（Cookie、Session）。
-   與更先進的 AI 模型整合以進行決策。

---

## 專案架構設計

本專案採用一系列清晰的設計原則，以確保程式碼的可維護性、可擴展性和健壯性。

### 1. 專案目錄設計 (Project Directory Design)

專案遵循標準的 Node.js/TypeScript 結構，實現關注點分離。

```
web-mcp/
├── .env              # 環境變數 (不提交到 Git)
├── .gitignore        # Git 忽略配置
├── package.json      # 專案依賴與腳本
├── tsconfig.json     # TypeScript 編譯器配置
├── README.md         # 專案說明文件
│
├── dist/             # 編譯後的 JavaScript 輸出目錄
│
└── src/              # TypeScript 原始碼目錄
    ├── index.ts      # MCP 伺服器啟動入口
    └── tools/        # 所有 MCP 工具模組
        └── OpenPageTool.ts
        └── ... (其他工具)
```

### 2. 模組設計 (Module Design)

模組設計的核心是**關注點分離**，透過一個中心的 `BrowserManager` 來管理瀏覽器狀態，讓工具模組保持無狀態和原子化。

*   **`BrowserManager` (Singleton)**:
    *   **職責**: 作為一個單例服務，它負責處理 Puppeteer `Browser` 實例和所有 `Page` 實例的生命週期。
    *   **功能**: 提供 `createPage()`、`getPage(page_id)`、`closePage(page_id)` 等方法，統一管理瀏覽器資源。

*   **MCP 工具 (Tools)**:
    *   **職責**: 每個工具都是一個獨立的類，僅負責執行單一的、原子化的瀏覽器操作（如點擊、輸入）。
    *   **無狀態**: 工具本身不持有 `Page` 或 `Browser` 的狀態。它們在執行時接收一個 `page_id`，並透過 `BrowserManager` 來獲取對應的頁面物件進行操作。

### 3. 資料流 (Data Flow)

資料流被設計為一個清晰的單向循環，確保了操作的可追蹤性和除錯的便利性。

1.  **請求 (Request)**: AI Agent 發送一個 JSON-RPC 請求，指定工具名稱和參數 (如 `page_id`, `selector`)。
2.  **路由 (Routing)**: MCP 伺服器接收請求，並將其路由到對應的工具模組。
3.  **執行 (Execution)**: 工具模組從中心的 `BrowserManager` 獲取 `Page` 物件，並執行相應的 Puppeteer 操作。
4.  **回傳 (Response)**: 操作結果（如文字內容、狀態）沿原路返回，由工具模組進行包裝，伺服器進行格式化，最終傳回給 AI Agent。

這個流程確保了所有狀態管理都集中在 `BrowserManager`，而工具本身只負責執行邏輯。

### 4. 工具功能時序 (Tool Function Sequence)

一個典型的自動化任務是透過一系列原子化工具的有序呼叫來完成的。`page_id` 作為核心線索，將所有操作串聯起來。

**範例：搜尋「中華豆腐」**
1.  **`open_page`**: AI 請求開啟 Google，取得 `page_id: 'page_1'`。
2.  **`type_text`**: AI 使用 `page_1` 在搜尋框中輸入「中華豆腐」。
3.  **`click_element`**: AI 點擊搜尋按鈕。
4.  **`wait_for_navigation`**: AI 等待頁面跳轉至搜尋結果。
5.  **`list_elements`**: AI 請求列出所有搜尋結果的標題，以進行分析。
6.  **`read_text` / `click_element`**: AI 根據上一步的結果，決定是進一步讀取摘要還是直接點擊最相關的連結。
7.  **`close_page`**: 任務完成後，AI 使用 `page_1` 來關閉分頁，釋放資源。

這個序列清晰地展示了如何組合原子工具來完成複雜任務，以及 `wait_for_navigation` 在處理頁面跳轉時的關鍵作用。

### 5. 工具說明 (Tool Specification)

以下是我們核心工具集的 API 規格，這將是我們開發工作的主要藍圖。

| 工具名稱 (`name`)           | 描述 (`description`)                                    | 輸入 (`schema`)                                                                                                 | 回傳 (`return`)                                                                    |
| --------------------------- | ------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| **`open_page`**             | 開啟一個新分頁並導航到指定 URL。                        | `url: z.string().url()`                                                                                         | `{ page_id: string }`                                                              |
| **`close_page`**            | 關閉指定的分頁。                                        | `page_id: z.string()`                                                                                           | `{ status: 'success' }`                                                            |
| **`type_text`**             | 在指定的元素中輸入文字。                                | `page_id: z.string()`, `selector: z.string()`, `text: z.string()`                                               | `{ status: 'success' }`                                                            |
| **`click_element`**         | 點擊指定的元素。                                        | `page_id: z.string()`, `selector: z.string()`                                                                   | `{ status: 'success' }`                                                            |
| **`read_text`**             | 讀取指定元素的文字內容。                                | `page_id: z.string()`, `selector: z.string()`                                                                   | `{ text: string }`                                                                 |
| **`list_elements`**         | 列出符合選擇器的所有元素的簡要資訊。                    | `page_id: z.string()`, `selector: z.string()`                                                                   | `{ elements: Array<{ id: string, text: string, attributes: Record<string, string> }> }` |
| **`wait_for_navigation`**   | 等待頁面完成導航。                                      | `page_id: z.string()`                                                                                           | `{ status: 'success' }`                                                            |
| **`screenshot`**            | 對指定分頁進行截圖。                                    | `page_id: z.string()`                                                                                           | `{ image_base64: string }`                                                         |

### 6. Log 與錯誤回報設計 (Logging and Error Reporting)

為了系統的健壯性和可觀測性，我們採用統一的日誌與錯誤回報標準。

*   **日誌 (Logging)**:
    *   **統一工具**: 所有工具內部的日誌都**必須**使用 `mcp-framework` 提供的 `logger` 物件，而不是 `console.log`。
    *   **日誌層級**:
        *   `logger.info()`: 用於記錄關鍵的、非錯誤性的流程節點（如：正在點擊某個按鈕）。
        *   `logger.debug()`: 用於記錄僅在開發和除錯時需要的詳細資訊。

*   **錯誤回報 (Error Reporting)**:
    *   **內部捕獲**: 工具的 `execute` 方法必須包含 `try...catch` 區塊，以防止未處理的異常導致伺服器崩潰。
    *   **結構化錯誤**: 當操作失敗時，工具應回傳一個結構化的 JSON 物件，而不是簡單的錯誤訊息字串。這使得 AI Agent 能夠以編程方式理解錯誤原因。
        ```json
        {
          "status": "error",
          "error_type": "SELECTOR_NOT_FOUND",
          "message": "Element with selector '#login-button' could not be found."
        }
        ```
    *   **常見錯誤類型**: `PAGE_NOT_FOUND`, `SELECTOR_NOT_FOUND`, `TIMEOUT_ERROR`, `NAVIGATION_FAILED`, `UNEXPECTED_ERROR`。 