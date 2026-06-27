/** Results panel – displays workflow execution results */

import { getState, subscribe } from "./state";
import { NodeExecutionState } from "./types";

let resultsEl: HTMLDivElement;
let lastExecutionStates: Record<string, NodeExecutionState> = {};

export function initResults(container: HTMLElement) {
  resultsEl = document.createElement("div");
  resultsEl.className = "jf-results jf-collapsible";
  resultsEl.innerHTML = renderResults({});
  container.appendChild(resultsEl);

  // Single delegated click handler for toggle
  resultsEl.addEventListener("click", (e) => {
    if ((e.target as HTMLElement).closest(".jf-collapsible__toggle")) {
      resultsEl.classList.toggle("jf-collapsible--collapsed");
      const btn = resultsEl.querySelector(".jf-collapsible__toggle")!;
      btn.textContent = resultsEl.classList.contains("jf-collapsible--collapsed") ? "▸" : "▾";
    }
  });

  subscribe(() => {
    const { executionStates } = getState();
    if (executionStates !== lastExecutionStates) {
      lastExecutionStates = executionStates;
      resultsEl.innerHTML = renderResults(executionStates);
    }
  });
}

function renderResults(executionStates: Record<string, NodeExecutionState>): string {
  const entries = Object.entries(executionStates);
  const completedEntries = entries.filter(([, s]) => s.state === "success" || s.state === "failed");

  const isCollapsed = resultsEl?.classList.contains("jf-collapsible--collapsed");
  const headerIcon = isCollapsed ? "▸" : "▾";

  let body: string;
  if (completedEntries.length === 0) {
    body = `<div class="jf-results__empty">Run workflow to see results</div>`;
  } else {
    body = `<div class="jf-results__list">
      ${completedEntries
        .map(([nodeId, execState]) => {
          const node = getState().nodes.find((n) => n.id === nodeId);
          const name = node?.name ?? nodeId;
          const stateClass = execState.state === "success" ? "jf-results__item--success" : "jf-results__item--failed";
          const resultStr = execState.result != null ? formatResult(execState.result) : "—";
          return `
            <div class="jf-results__item ${stateClass}">
              <div class="jf-results__item-header">
                <span class="jf-results__item-name">${escapeHtml(name)}</span>
                <span class="jf-results__item-state">${execState.state}</span>
              </div>
              <div class="jf-results__item-value">${escapeHtml(resultStr)}</div>
            </div>`;
        })
        .join("")}
    </div>`;
  }

  return `
    <div class="jf-collapsible__header">
      <button class="jf-collapsible__toggle" aria-label="Toggle Results">${headerIcon}</button>
      <span class="jf-collapsible__title">Results</span>
      ${completedEntries.length > 0 ? `<span class="jf-results__count">${completedEntries.length}</span>` : ""}
    </div>
    <div class="jf-collapsible__body">${body}</div>
  `;
}

function formatResult(value: any): string {
  if (typeof value === "object") {
    try {
      return JSON.stringify(value, null, 2);
    } catch {
      return String(value);
    }
  }
  return String(value);
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
