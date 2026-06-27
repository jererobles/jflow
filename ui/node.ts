/** Node element factory */

import { NodeData } from "./types";
import { startNodeDrag } from "./canvas";
import { setState, getState } from "./state";

export function createNodeElement(node: NodeData): HTMLElement {
  const el = document.createElement("div");
  el.className = "jf-node";
  el.dataset.nodeId = node.id;

  el.innerHTML = `
    <div class="jf-node__header">
      <span class="jf-node__icon">${getNodeIcon(node)}</span>
      <span class="jf-node__name">${node.name}</span>
    </div>
    <div class="jf-node__badges"></div>
    <div class="jf-node__pulse"></div>
  `;

  // Drag handler
  el.addEventListener("pointerdown", (e) => {
    e.stopPropagation();
    startNodeDrag(node.id, e.clientX, e.clientY, e.pointerId);
  });

  // Tap to select
  el.addEventListener("click", (e) => {
    e.stopPropagation();
    setState({ selectedNodeId: node.id });
  });

  return el;
}

function getNodeIcon(node: NodeData): string {
  if (node.parentBlocks.includes("workflow")) return "⚡";
  if (node.forks.length > 0) return "🔀";
  return "◆";
}
