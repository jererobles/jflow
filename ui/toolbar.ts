/** Top toolbar with workflow actions */

import { getState, setState, clearExecutionStates } from "./state";
import { serialize, deserialize } from "./serializer";
import { runWorkflow } from "./executor";

import fetchAndPrintSample from "../samples/fetchAndPrint.yml?raw";
import mathAndForkSample from "../samples/mathAndFork.yml?raw";

const samples: Record<string, string> = {
  mathAndFork: mathAndForkSample,
  fetchAndPrint: fetchAndPrintSample,
};

let toolbarEl: HTMLElement;

export function initToolbar(container: HTMLElement) {
  toolbarEl = document.createElement("header");
  toolbarEl.className = "jf-toolbar";
  toolbarEl.innerHTML = `
    <div class="jf-toolbar__brand">
      <span class="jf-toolbar__logo">⚡</span>
      <span class="jf-toolbar__title">JFlow</span>
    </div>
    <div class="jf-toolbar__actions">
      <select class="jf-toolbar__select" id="jf-sample-select">
        <option value="">Load sample...</option>
        <option value="mathAndFork">Math &amp; Fork</option>
        <option value="fetchAndPrint">Fetch &amp; Print</option>
      </select>
      <button class="jf-toolbar__btn jf-toolbar__btn--run" id="jf-run-btn">
        <span class="jf-toolbar__btn-icon">▶</span>
        <span class="jf-toolbar__btn-label">Run</span>
      </button>
      <button class="jf-toolbar__btn" id="jf-reset-btn">
        <span class="jf-toolbar__btn-icon">↺</span>
        <span class="jf-toolbar__btn-label">Reset</span>
      </button>
      <button class="jf-toolbar__btn" id="jf-export-btn">
        <span class="jf-toolbar__btn-icon">⬇</span>
        <span class="jf-toolbar__btn-label">YAML</span>
      </button>
    </div>
  `;

  container.prepend(toolbarEl);

  // Sample select
  const sampleSelect = toolbarEl.querySelector<HTMLSelectElement>("#jf-sample-select")!;
  sampleSelect.addEventListener("change", () => {
    const key = sampleSelect.value;
    if (key && samples[key]) {
      deserialize(samples[key]);
      clearExecutionStates();
      sampleSelect.value = "";
    }
  });

  // Run
  toolbarEl.querySelector("#jf-run-btn")!.addEventListener("click", () => {
    if (getState().isRunning) return;
    runWorkflow();
  });

  // Reset
  toolbarEl.querySelector("#jf-reset-btn")!.addEventListener("click", () => {
    clearExecutionStates();
  });

  // Export YAML
  toolbarEl.querySelector("#jf-export-btn")!.addEventListener("click", () => {
    const yaml = serialize();
    const blob = new Blob([yaml], { type: "text/yaml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${getState().workflowId}.yml`;
    a.click();
    URL.revokeObjectURL(url);
  });
}
