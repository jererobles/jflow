/** Canvas: pannable/zoomable workspace with nodes and connections */

import { getState, setState, updateNode, subscribe } from "./state";
import { Position, NodeData } from "./types";
import { renderConnections } from "./connections";
import { createNodeElement } from "./node";

let canvasEl: HTMLDivElement;
let nodesLayer: HTMLDivElement;
let svgLayer: SVGSVGElement;
let containerEl: HTMLDivElement;

// Pan state
let isPanning = false;
let panStart: Position = { x: 0, y: 0 };
let panOffsetStart: Position = { x: 0, y: 0 };

// Drag node state
let dragNodeId: string | null = null;
let dragStart: Position = { x: 0, y: 0 };
let dragNodeStart: Position = { x: 0, y: 0 };
let dragPointerId: number | null = null;

export function initCanvas(container: HTMLDivElement) {
  containerEl = container;
  container.innerHTML = "";

  canvasEl = document.createElement("div");
  canvasEl.className = "jf-canvas";

  svgLayer = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svgLayer.classList.add("jf-connections");
  svgLayer.setAttribute("width", "100%");
  svgLayer.setAttribute("height", "100%");

  nodesLayer = document.createElement("div");
  nodesLayer.className = "jf-nodes-layer";

  canvasEl.appendChild(svgLayer);
  canvasEl.appendChild(nodesLayer);
  container.appendChild(canvasEl);

  bindPanEvents(container);
  subscribe(render);
  render();
}

function bindPanEvents(container: HTMLDivElement) {
  // Mouse pan (middle click or right-click + drag on canvas background)
  container.addEventListener("pointerdown", (e) => {
    const target = e.target as HTMLElement;
    if (target === canvasEl || target === container || target === nodesLayer) {
      if (e.button === 0 || e.button === 1) {
        isPanning = true;
        panStart = { x: e.clientX, y: e.clientY };
        panOffsetStart = { ...getState().panOffset };
        container.setPointerCapture(e.pointerId);
        e.preventDefault();
      }
    }
  });

  container.addEventListener("pointermove", (e) => {
    if (isPanning) {
      const dx = e.clientX - panStart.x;
      const dy = e.clientY - panStart.y;
      setState({
        panOffset: {
          x: panOffsetStart.x + dx,
          y: panOffsetStart.y + dy,
        },
      });
    }
    if (dragNodeId) {
      const zoom = getState().zoom;
      const dx = (e.clientX - dragStart.x) / zoom;
      const dy = (e.clientY - dragStart.y) / zoom;
      updateNode(dragNodeId, {
        position: {
          x: dragNodeStart.x + dx,
          y: dragNodeStart.y + dy,
        },
      });
    }
  });

  container.addEventListener("pointerup", (e) => {
    if (isPanning) {
      isPanning = false;
      container.releasePointerCapture(e.pointerId);
    }
    if (dragNodeId) {
      dragNodeId = null;
      if (dragPointerId !== null && container.hasPointerCapture(dragPointerId)) {
        container.releasePointerCapture(dragPointerId);
      }
      dragPointerId = null;
    }
  });

  // Zoom with wheel
  container.addEventListener("wheel", (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.min(2, Math.max(0.3, getState().zoom * delta));
    setState({ zoom: newZoom });
  }, { passive: false });
}

export function startNodeDrag(nodeId: string, clientX: number, clientY: number, pointerId?: number) {
  const node = getState().nodes.find((n) => n.id === nodeId);
  if (!node) return;
  dragNodeId = nodeId;
  dragStart = { x: clientX, y: clientY };
  dragNodeStart = { ...node.position };
  if (containerEl && pointerId != null) {
    dragPointerId = pointerId;
    containerEl.setPointerCapture(pointerId);
  }
  setState({ selectedNodeId: nodeId });
}

function render() {
  const { nodes, panOffset, zoom, executionStates, selectedNodeId } = getState();

  canvasEl.style.transform = `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoom})`;

  // Render nodes
  const existingEls = new Map<string, HTMLElement>();
  nodesLayer.querySelectorAll<HTMLElement>(".jf-node").forEach((el) => {
    existingEls.set(el.dataset.nodeId!, el);
  });

  const activeIds = new Set(nodes.map((n) => n.id));

  // Remove stale
  existingEls.forEach((el, id) => {
    if (!activeIds.has(id)) el.remove();
  });

  // Add/update
  for (const node of nodes) {
    let el = existingEls.get(node.id);
    if (!el) {
      el = createNodeElement(node);
      nodesLayer.appendChild(el);
    }
    // Position
    el.style.transform = `translate(${node.position.x}px, ${node.position.y}px)`;

    // Execution state styling
    const exec = executionStates[node.id];
    el.classList.toggle("jf-node--running", exec?.state === "running");
    el.classList.toggle("jf-node--success", exec?.state === "success");
    el.classList.toggle("jf-node--failed", exec?.state === "failed");
    el.classList.toggle("jf-node--selected", node.id === selectedNodeId);

    // Update name
    const nameEl = el.querySelector(".jf-node__name");
    if (nameEl && nameEl.textContent !== node.name) {
      nameEl.textContent = node.name;
    }

    // Update expression badges
    const badgesEl = el.querySelector(".jf-node__badges");
    if (badgesEl) {
      const badgeHTML = node.expressions
        .map((ex) => `<span class="jf-badge jf-badge--${ex.type.toLowerCase()}">${ex.type}</span>`)
        .join("");
      if (badgesEl.innerHTML !== badgeHTML) badgesEl.innerHTML = badgeHTML;
    }
  }

  // Render connections
  renderConnections(svgLayer, nodes, executionStates);
}
