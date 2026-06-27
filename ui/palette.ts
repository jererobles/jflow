/** Node palette – drag new blocks onto canvas */

import { addNode, getState } from "./state";
import { NodeData, ExpressionData } from "./types";

const BLOCK_TEMPLATES: { label: string; icon: string; expressionType: string }[] = [
  { label: "Math", icon: "🧮", expressionType: "Math" },
  { label: "Console Log", icon: "📝", expressionType: "ConsoleLog" },
  { label: "HTTP Request", icon: "🌐", expressionType: "HTTPRequest" },
  { label: "Wait", icon: "⏱️", expressionType: "Wait" },
];

let paletteEl: HTMLDivElement;

export function initPalette(container: HTMLElement) {
  paletteEl = document.createElement("div");
  paletteEl.className = "jf-palette jf-collapsible";

  paletteEl.innerHTML = `
    <div class="jf-collapsible__header">
      <button class="jf-collapsible__toggle" aria-label="Toggle Palette">▾</button>
      <span class="jf-collapsible__title">Add Block</span>
    </div>
    <div class="jf-collapsible__body">
      <div class="jf-palette__items">
        ${BLOCK_TEMPLATES.map(
          (t, i) => `
          <button class="jf-palette__item" data-idx="${i}" draggable="true">
            <span class="jf-palette__icon">${t.icon}</span>
            <span class="jf-palette__label">${t.label}</span>
          </button>
        `
        ).join("")}
      </div>
    </div>
  `;

  // Toggle collapse
  paletteEl.querySelector(".jf-collapsible__toggle")?.addEventListener("click", () => {
    paletteEl.classList.toggle("jf-collapsible--collapsed");
    const btn = paletteEl.querySelector(".jf-collapsible__toggle")!;
    btn.textContent = paletteEl.classList.contains("jf-collapsible--collapsed") ? "▸" : "▾";
  });

  // Click to add
  paletteEl.querySelectorAll<HTMLButtonElement>(".jf-palette__item").forEach((btn) => {
    btn.addEventListener("click", () => {
      const idx = parseInt(btn.dataset.idx!, 10);
      addBlockFromTemplate(idx);
    });

    // Drag support
    btn.addEventListener("dragstart", (e) => {
      e.dataTransfer?.setData("text/plain", btn.dataset.idx!);
    });
  });

  container.appendChild(paletteEl);
}

export function handleCanvasDrop(e: DragEvent) {
  const idx = parseInt(e.dataTransfer?.getData("text/plain") ?? "", 10);
  if (isNaN(idx)) return;
  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
  const { panOffset, zoom } = getState();
  const x = (e.clientX - rect.left - panOffset.x) / zoom;
  const y = (e.clientY - rect.top - panOffset.y) / zoom;
  addBlockFromTemplate(idx, { x, y });
}

function addBlockFromTemplate(idx: number, position?: { x: number; y: number }) {
  const template = BLOCK_TEMPLATES[idx];
  if (!template) return;

  const id = `block_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  const nodes = getState().nodes;

  // Auto-position if not specified
  const pos = position ?? {
    x: 100 + (nodes.length % 3) * 240,
    y: 100 + Math.floor(nodes.length / 3) * 150,
  };

  const expression: ExpressionData = {
    id: `expr_${Date.now()}`,
    type: template.expressionType,
    parameters: getDefaultParams(template.expressionType),
  };

  const node: NodeData = {
    id,
    name: template.label + " Block",
    type: "block",
    position: pos,
    expressions: [expression],
    forks: [],
    parentBlocks: nodes.length === 0 ? ["workflow"] : [],
  };

  addNode(node);
}

function getDefaultParams(type: string): { id: string; name: string; value: string }[] {
  switch (type) {
    case "Math":
      return [{ id: "p1", name: "expression", value: "2 + 2" }];
    case "ConsoleLog":
      return [{ id: "p1", name: "data", value: "Hello from JFlow" }];
    case "HTTPRequest":
      return [
        { id: "p1", name: "url", value: "https://httpbin.org/get" },
        { id: "p2", name: "method", value: "GET" },
      ];
    case "Wait":
      return [{ id: "p1", name: "seconds", value: "2" }];
    default:
      return [];
  }
}
