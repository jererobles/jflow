/** Properties panel – edit selected node (bottom sheet on mobile) */

import { getState, updateNode, removeNode, subscribe, setState } from "./state";
import { NodeData } from "./types";

let panelEl: HTMLDivElement;
let currentNodeId: string | null = null;

export function initPanel(container: HTMLElement) {
  panelEl = document.createElement("div");
  panelEl.className = "jf-panel";
  panelEl.innerHTML = `<div class="jf-panel__placeholder">Select a node to edit its properties</div>`;
  container.appendChild(panelEl);

  subscribe(() => {
    const { selectedNodeId, nodes } = getState();
    if (selectedNodeId !== currentNodeId) {
      currentNodeId = selectedNodeId;
      renderPanel(nodes.find((n) => n.id === selectedNodeId) ?? null);
    }
  });
}

function renderPanel(node: NodeData | null) {
  if (!node) {
    panelEl.innerHTML = `<div class="jf-panel__placeholder">Select a node to edit its properties</div>`;
    panelEl.classList.remove("jf-panel--open");
    return;
  }

  panelEl.classList.add("jf-panel--open");

  const execState = getState().executionStates[node.id];
  const stateLabel = execState ? `<span class="jf-panel__state jf-panel__state--${execState.state}">${execState.state}</span>` : "";

  panelEl.innerHTML = `
    <div class="jf-panel__header">
      <h3 class="jf-panel__title">Node Properties</h3>
      <button class="jf-panel__close" aria-label="Close">✕</button>
    </div>
    <div class="jf-panel__body">
      <label class="jf-field">
        <span class="jf-field__label">Name</span>
        <input class="jf-field__input" type="text" value="${escapeAttr(node.name)}" data-field="name" />
      </label>
      <label class="jf-field">
        <span class="jf-field__label">ID</span>
        <input class="jf-field__input" type="text" value="${escapeAttr(node.id)}" data-field="id" />
      </label>
      <div class="jf-field">
        <span class="jf-field__label">Parent Blocks</span>
        <div class="jf-chips">
          ${node.parentBlocks.map((p) => `<span class="jf-chip">${p}</span>`).join("")}
          <button class="jf-chip jf-chip--add" data-action="add-parent">+ Add</button>
        </div>
      </div>
      <div class="jf-field">
        <span class="jf-field__label">Expressions ${stateLabel}</span>
        ${node.expressions
          .map(
            (expr, i) => `
          <div class="jf-expr">
            <span class="jf-expr__type">${expr.type}</span>
            ${expr.parameters
              .map(
                (p) => `
              <label class="jf-field jf-field--nested">
                <span class="jf-field__label">${p.name}</span>
                <input class="jf-field__input" type="text" value="${escapeAttr(p.value)}" data-expr="${i}" data-param="${p.name}" />
              </label>
            `
              )
              .join("")}
          </div>
        `
          )
          .join("")}
      </div>
      <div class="jf-panel__actions">
        <button class="jf-btn jf-btn--danger" data-action="delete">Delete Node</button>
      </div>
    </div>
  `;

  // Event bindings
  panelEl.querySelector(".jf-panel__close")?.addEventListener("click", () => {
    setState({ selectedNodeId: null });
  });

  panelEl.querySelector('[data-field="name"]')?.addEventListener("input", (e) => {
    updateNode(node.id, { name: (e.target as HTMLInputElement).value });
  });

  panelEl.querySelector('[data-field="id"]')?.addEventListener("change", (e) => {
    const newId = (e.target as HTMLInputElement).value.trim();
    if (newId && newId !== node.id) {
      // Update references in other nodes
      const { nodes } = getState();
      nodes.forEach((n) => {
        if (n.parentBlocks.includes(node.id)) {
          updateNode(n.id, {
            parentBlocks: n.parentBlocks.map((p) => (p === node.id ? newId : p)),
          });
        }
      });
      updateNode(node.id, { id: newId });
    }
  });

  // Expression parameter editing
  panelEl.querySelectorAll<HTMLInputElement>("[data-expr]").forEach((input) => {
    input.addEventListener("input", (e) => {
      const exprIdx = parseInt(input.dataset.expr!, 10);
      const paramName = input.dataset.param!;
      const newExprs = [...node.expressions];
      newExprs[exprIdx] = {
        ...newExprs[exprIdx],
        parameters: newExprs[exprIdx].parameters.map((p) =>
          p.name === paramName ? { ...p, value: (e.target as HTMLInputElement).value } : p
        ),
      };
      updateNode(node.id, { expressions: newExprs });
    });
  });

  // Add parent
  panelEl.querySelector('[data-action="add-parent"]')?.addEventListener("click", () => {
    const other = getState().nodes.filter((n) => n.id !== node.id && !node.parentBlocks.includes(n.id));
    if (other.length === 0) {
      // Set as root
      updateNode(node.id, { parentBlocks: [...node.parentBlocks, "workflow"] });
    } else {
      // Pick first available (in a real app we'd show a picker)
      const picked = prompt("Enter parent block ID:", other[0]?.id ?? "workflow");
      if (picked) {
        updateNode(node.id, { parentBlocks: [...node.parentBlocks, picked] });
      }
    }
    currentNodeId = null; // force re-render
  });

  // Delete
  panelEl.querySelector('[data-action="delete"]')?.addEventListener("click", () => {
    removeNode(node.id);
  });
}

function escapeAttr(s: string): string {
  return s.replace(/"/g, "&quot;").replace(/</g, "&lt;");
}
