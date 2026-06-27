/** SVG connection rendering between nodes */

import { NodeData, NodeExecutionState } from "./types";

const MOBILE_BREAKPOINT = 768;
const MOBILE_NODE_MARGIN = 32;
const MOBILE_NODE_MAX_WIDTH = 180;
const DESKTOP_NODE_WIDTH = 200;

let cachedNodeWidth = typeof window !== "undefined" ? calculateNodeWidth(window.innerWidth) : DESKTOP_NODE_WIDTH;

if (typeof window !== "undefined") {
  window.addEventListener("resize", () => {
    cachedNodeWidth = calculateNodeWidth(window.innerWidth);
  });
}

const getNodeWidth = () => cachedNodeWidth;
const NODE_HEIGHT = 80;

function calculateNodeWidth(windowWidth: number): number {
  return windowWidth <= MOBILE_BREAKPOINT
    ? Math.min(MOBILE_NODE_MAX_WIDTH, windowWidth - MOBILE_NODE_MARGIN)
    : DESKTOP_NODE_WIDTH;
}

export function renderConnections(
  svg: SVGSVGElement,
  nodes: NodeData[],
  executionStates: Record<string, NodeExecutionState>
) {
  // Clear previous
  svg.innerHTML = "";

  const nodeMap = new Map(nodes.map((n) => [n.id, n]));
  const nodeWidth = getNodeWidth();

  for (const node of nodes) {
    // Parent → child connections
    for (const parentId of node.parentBlocks) {
      if (parentId === "workflow") continue;
      const parent = nodeMap.get(parentId);
      if (!parent) continue;
      drawConnection(svg, parent, node, "parent", executionStates, nodeWidth);
    }

    // Fork connections
    for (const fork of node.forks) {
      for (const branch of fork.branches) {
        for (const targetId of branch.resultTrueBlocks) {
          const target = nodeMap.get(targetId);
          if (target) drawConnection(svg, node, target, "true", executionStates, nodeWidth);
        }
        for (const targetId of branch.resultFalseBlocks) {
          const target = nodeMap.get(targetId);
          if (target) drawConnection(svg, node, target, "false", executionStates, nodeWidth);
        }
      }
    }
  }
}

function drawConnection(
  svg: SVGSVGElement,
  from: NodeData,
  to: NodeData,
  type: "parent" | "true" | "false",
  executionStates: Record<string, NodeExecutionState>,
  nodeWidth: number
) {
  const fromX = from.position.x + nodeWidth / 2;
  const fromY = from.position.y + NODE_HEIGHT;
  const toX = to.position.x + nodeWidth / 2;
  const toY = to.position.y;

  // Bezier curve
  const midY = (fromY + toY) / 2;
  const d = `M ${fromX} ${fromY} C ${fromX} ${midY}, ${toX} ${midY}, ${toX} ${toY}`;

  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute("d", d);
  path.setAttribute("fill", "none");
  path.setAttribute("stroke-width", "2.5");
  path.setAttribute("stroke-linecap", "round");

  // Color based on type and execution state
  let color = "rgba(148,163,184,0.5)";
  if (type === "true") color = "rgba(16,185,129,0.7)";
  if (type === "false") color = "rgba(248,113,113,0.7)";

  const fromExec = executionStates[from.id];
  const toExec = executionStates[to.id];
  if (fromExec?.state === "success" && toExec?.state !== "idle") {
    color = type === "false" ? "rgba(248,113,113,1)" : "rgba(16,185,129,1)";
  }
  if (fromExec?.state === "running" || toExec?.state === "running") {
    path.classList.add("jf-conn--animated");
  }

  path.setAttribute("stroke", color);
  svg.appendChild(path);

  // Arrow indicator
  const arrow = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  arrow.setAttribute("cx", String(toX));
  arrow.setAttribute("cy", String(toY));
  arrow.setAttribute("r", "4");
  arrow.setAttribute("fill", color);
  svg.appendChild(arrow);
}
