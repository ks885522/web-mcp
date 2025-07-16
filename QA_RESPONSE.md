# `web-mcp` 工具集針對 Shadow DOM 與 iframe 支援的修復與增強報告

**日期：** 2024年07月23日
**提交者：** AI 技術領導 (AI Tech Lead)
**參考報告：** [UPCC 倉庫控制系統網站自動化登入失敗技術分析報告](#)

---

### 1. 概述

本報告旨在回應 QA 團隊先前提交的關於 `web-mcp` 無法在目標網站 `https://upcc.lantern-reach.com/` 上定位元素的技術分析報告。我們完全認同 QA 團隊的結論：問題的根源在於目標網站使用了 Shadow DOM 或 iframe 來封裝其登入表單，而我們現有的工具集無法穿透這些 DOM 邊界。

根據 QA 團隊的寶貴建議，我們對 `web-mcp` 工具集進行了一次重要的架構升級。目前，**所有相關的開發與重構工作均已完成**，工具集現在具備了處理 Shadow DOM 和 iframe 的能力。

---

### 2. 技術修復與功能增強詳解

我們採納了 QA 團隊的所有建議，並將其轉化為以下具體的技術實現：

#### 2.1 新增：DOM 結構探測工具 (`get_dom_tree`)

為了賦予測試人員和 AI Agent 程式化的 DOM 分析能力，我們開發了一個全新的診斷工具。

*   **工具名稱：** `get_dom_tree`
*   **功能：** 此工具可以序列化整個頁面或指定 iframe 的 DOM 結構，並以文字形式回傳。其輸出明確地標示了 `#shadow-root` 節點，讓使用者可以清晰地看到 DOM 的層級關係，為後續的選擇器構建提供了“地圖”。

#### 2.2 增強：Shadow DOM 穿透能力

我們對所有與元素定位相關的工具進行了核心升級，使其能夠無縫地處理 Shadow DOM。

*   **引入 `>>>` 組合器：** 我們實現了一個特殊的選擇器語法。使用者現在可以使用 `>>>` 組合器來指定穿透路徑。
    *   **語法示例：** `"app-root >>> user-login-card >>> #username-input"`
    *   **能力：** 此語法支援**多層巢狀**的 Shadow DOM 穿透，滿足了 QA 報告中的遞迴處理建議。
*   **底層實現：** 我們在核心的 `BrowserManager` 中實現了 `findElement(s)` 輔助函式，該函式負責解析此新語法，並依序進入每一個 `shadowRoot` 進行查詢，確保了定位的準確性。

#### 2.3 新增與重構：iframe 上下文處理

為了應對 iframe 帶來的挑戰，我們引入了完整的上下文管理機制。

*   **新增 `switch_to_frame` 工具：**
    *   **功能：** QA 可以使用此工具，透過 `iframe` 的 CSS 選擇器，將操作的「焦點」切換到該 `iframe` 內部。
    *   **回傳值：** 成功切換後，工具會回傳一個唯一的 `frame_id`，用於後續的操作。

*   **重構所有元素操作工具：**
    *   `click_element`, `type_text`, `read_text`, `list_elements` 等所有與元素互動的工具，其 schema 現已增加一個可選的 `frame_id` 參數。
    *   **運作模式：**
        *   如果提供了 `frame_id`，操作將在指定的 iframe 上下文中執行。
        *   如果未提供 `frame_id`，操作將預設在主文檔中執行。
    *   `screenshot` 工具已被更新，明確告知使用者它無法對單獨的 iframe 進行截圖，只能對整個頁面操作。

---

### 3. 給予 QA 團隊的後續測試建議

我們相信，經過本次升級，`web-mcp` 工具集已能成功完成對 `https://upcc.lantern-reach.com/` 的自動化登入任務。我們建議 QA 團隊可以採用以下新的測試流程：

1.  **開啟頁面 (`open_page`)**：此步驟不變。
2.  **（可選）探測 DOM (`get_dom_tree`)**：執行此工具，獲取頁面結構，確認登入表單是否確實位於 Shadow DOM 或 iframe 中，並找到其選擇器。
3.  **（如果為 iframe）切換上下文 (`switch_to_frame`)**：使用 `iframe` 的選擇器，獲取 `frame_id`。
4.  **定位與互動**：
    *   **Shadow DOM 場景：** 使用 `>>>` 組合器來構建選擇器，例如 `list_elements({ selector: "login-form >>> input[type=text]" })`。
    *   **iframe 場景：** 在所有操作中傳入上一步獲取的 `frame_id`，例如 `list_elements({ frame_id: "{id}", selector: "input[type=text]" })`。
5.  **完成後續操作**。

---

我們已經完成了內部的開發與重構，並將所有變更提交到了 `feature/phase-1-open-page` 分支。我們期待 QA 團隊的再次驗證，並對您們提出的專業建議表示誠摯的感謝。 