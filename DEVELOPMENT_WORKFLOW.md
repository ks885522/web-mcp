# AI 協同開發標準作業流程 (SOP)

本文檔記錄並標準化一次成功、高效的 AI 協同開發流程。此流程旨在確保專案從設計、開發到提交的每一步都清晰、可追蹤且品質優良。

---

## 1. 開發規則 (Development Rules)

整個開發過程被劃分為三個獨立且連續的階段，確保在進入下一階段前，當前階段的目標已完全達成。

*   **第一階段：設計工作區 (Design Phase)**
    1.  **目標**: 確立清晰的設計藍圖。
    2.  **活動**:
        *   透過 `README.md` 和 Serena 記憶回顧現有設計。
        *   使用 `think_about_collected_information` 進行反思，確保資訊完整。
        *   將高階目標拆解為具體的、有依賴關係的 To-do 列表 (`todo_write`)。
        *   將所有設計原則寫入 Serena 記憶 (`write_memory`) 並更新 `README.md`。

*   **第二階段：To-dos 執行階段 (Execution Phase)**
    1.  **目標**: 逐一完成開發任務。
    2.  **活動 (循環執行)**:
        *   從 To-do 列表中選取一個任務，並更新其狀態為 `in_progress`。
        *   使用 `think_about_task_adherence` 確保任務執行不偏離設計。
        *   進行程式碼實作。遇到第三方函式庫問題時，優先使用 Context7 和 Web 搜尋；遇到架構問題時，使用 Serena 進行分析。
        *   任務完成後，使用 `think_about_whether_you_are_done` 進行自我檢查，確保所有相關工作（如文件更新）皆已完成。
        *   使用 `write_memory` 記錄開發進度。
        *   更新 `README.md` 以反映最新的變更。
        *   更新 To-do 任務狀態為 `completed`。

*   **第三階段：最終審查與提交 (Finalization Phase)**
    1.  **目標**: 確保所有工作都已完成且品質達標，並將其永久記錄。
    2.  **活動**:
        *   全面審查 `README.md` 和所有 Serena 記憶，確認其與最終的程式碼狀態一致。
        *   使用 `git add .` 和 `git commit` 將所有變更提交到版本控制中，並撰寫清晰的提交訊息。
        *   將最終的 To-do 任務標記為 `completed`。

---

## 2. 流程說明 (Process Description)

本次 `web-mcp` 瀏覽器工具集的開發，嚴格遵循了上述三階段規則：

1.  **設計階段**: 我們首先透過 Serena 的能力，對 Puppeteer 進行了深入分析，並模擬了「蒐集資訊」的真人操作流程。基於此，我們設計了一套包含 `BrowserManager` 核心和多個原子化工具的健壯架構。我們將專案目錄、模組設計、資料流、時序、API 規格、日誌與錯誤處理等六大核心設計，全部文件化並存入 Serena 記憶，最後拆解成了一個包含 10 個步驟的 To-do 列表。

2.  **執行階段**: 我們逐一完成了 To-do 列表中的每一個任務。從建立核心的 `BrowserManager` 開始，到依序開發 `open_page`, `close_page`, `type_text` 等八個工具。在每一步中，我們都遵循了「程式碼實作 -> 更新文件 -> 記錄記憶 -> 更新 To-do」的循環，確保了工作的完整性。

3.  **最終審查與提交**: 在所有工具開發完成後，我們進入了第三階段。我們全面回顧了 `README.md` 和 Serena 記憶，確認所有內容都準確無誤，然後將這個開發階段的所有成果，以一個清晰的 `feat: implement core browser toolset` 訊息提交到了 Git 版本控制中，圓滿地完成了整個開發任務。

---

## 3. 使用工具 (Tools Used)

*   **核心框架**:
    *   `mcp-framework`: 作為 MCP 伺服器與工具的基礎框架。
    *   `puppeteer`: 核心的瀏覽器自動化函式庫。
*   **開發與執行環境**:
    *   `typescript`: 提供強型別，增加程式碼的健壯性。
    *   `tsx`: 高效能的 TypeScript 執行器，用於開發環境的即時編譯與運行。
    *   `rimraf`: 用於確保每次建置 (`build`) 都是在乾淨的環境下進行。
*   **AI 輔助與診斷工具 (Serena & Context7)**:
    *   `mcp_serena-mcp_write_memory` / `read_memory`: 用於持久化和讀取關鍵的設計原則與進度。
    *   `mcp_serena-mcp_think_about_*`: Serena 的思考鏈工具，用於在關鍵節點進行反思、檢查任務依從性與完整性。
    *   `Context7` / `Web Search`: 在遇到第三方函式庫（如 `puppeteer`）或未知錯誤時，提供權威的文件與解決方案，是解決棘手問題的關鍵。

---

## 4. 總結反思 (Summary and Retrospective)

*   **挑戰與學習**: 專案初期，我們在啟動 `mcp-framework` 伺服器時遇到了巨大困難。根本原因在於對框架的「黑箱」操作，我們基於錯誤的假設（如工具自動掃描 `src` 目錄、`console.log` 可用）進行了多次失敗的嘗試。
*   **轉捩點**: 真正的轉捩點是開始使用 Context7 和 Web 搜尋來獲取**權威資訊**。我們從文件中發現了預設的 `basePath` 是 `dist`，以及必須使用框架自帶的 `logger`，這兩個關鍵資訊瞬間解決了所有啟動問題。
*   **結論**: 這次經驗證明了「設計先行」與「使用正確工具」的重要性。如果沒有預先規劃的六大設計，我們可能會在開發中途迷失方向。如果沒有 Serena 和 Context7 的輔助，我們可能會在伺服器啟動的泥潭中掙扎更久。這個標準化的流程，是未來成功的保證。

---

## 5. Prompt 示例 (For LLM)

這是一個範例，展示了 AI Agent (LLM) 應該如何使用我們開發的工具集來完成「蒐集中華豆腐資訊」的任務。

```json
[
  {
    "tool_name": "open_page",
    "parameters": { "url": "https://www.google.com" },
    "thought": "我需要先打開一個瀏覽器分頁，然後導航到 Google。"
  },
  {
    "tool_name": "type_text",
    "parameters": { "page_id": "{page_id_from_step_1}", "selector": "[name=q]", "text": "中華豆腐" },
    "thought": "現在我在 Google 首頁，我需要在搜尋框裡輸入關鍵字。"
  },
  {
    "tool_name": "click_element",
    "parameters": { "page_id": "{page_id_from_step_1}", "selector": "input[type=submit][name=btnK]" },
    "thought": "輸入完畢，我需要點擊搜尋按鈕來執行搜尋。"
  },
  {
    "tool_name": "wait_for_navigation",
    "parameters": { "page_id": "{page_id_from_step_1}" },
    "thought": "點擊後頁面會跳轉，我需要等待搜尋結果頁載入完成。"
  },
  {
    "tool_name": "list_elements",
    "parameters": { "page_id": "{page_id_from_step_1}", "selector": "h3" },
    "thought": "頁面載入完成了，我需要查看搜尋結果的標題，來判斷哪個連結最相關。"
  },
  {
    "tool_name": "read_text",
    "parameters": { "page_id": "{page_id_from_step_1}", "selector": "#search" },
    "thought": "在點擊之前，我先讀取整個搜尋結果區域的文字，做一個初步的摘要。"
  },
  {
    "tool_name": "close_page",
    "parameters": { "page_id": "{page_id_from_step_1}" },
    "thought": "任務已完成，我應該關閉分頁來釋放資源。"
  }
]
```

---

## 6. Cursor Rule 示例 (For AI Assistant)

這是一條可以加入到 AI Assistant 系統中的規則，用以指導其遵循本次建立的開發流程。

```xml
<rule name="ThreePhaseDevelopmentWorkflow">
  <description>
    Follow a strict three-phase development workflow: Design, Execution, and Finalization.
    This ensures systematic development, clear documentation, and robust version control.
  </description>

  <phase name="1_Design">
    <step>Review existing project context from README.md and Serena memories.</step>
    <step>Use `think_about_collected_information` to ensure a complete understanding.</step>
    <step>Decompose the main goal into a detailed, dependency-aware TODO list using `todo_write`.</step>
    <step>Document all high-level design principles in both `README.md` and Serena's memory using `write_memory`.</step>
  </phase>

  <phase name="2_Execution">
    <description>Iterate through the TODO list, completing one task at a time.</description>
    <loop for_each="todo_item">
      <step>Update the todo item's status to `in_progress`.</step>
      <step>Use `think_about_task_adherence` before starting implementation.</step>
      <step>Implement the code. Use `Context7` for third-party library issues and `Serena` for architectural analysis.</step>
      <step>After implementation, use `think_about_whether_you_are_done` for a self-check.</step>
      <step>Update `README.md` with any changes or new specifications.</step>
      <step>Record the progress in Serena's memory using `write_memory`.</step>
      <step>Update the todo item's status to `completed`.</step>
    </loop>
  </phase>

  <phase name="3_Finalization">
    <step>When all todos are complete, perform a final review of `README.md` and all Serena memories against the final code state.</step>
    <step>Use `git add .` to stage all changes.</step>
    <step>Use `git commit` with a clear, conventional commit message to save the work.</step>
    <step>Mark the final TODO item as `completed`.</step>
  </phase>
</rule>
``` 