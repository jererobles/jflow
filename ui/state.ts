/** Reactive state store for the workflow editor */

import { NodeData, NodeExecutionState, Position } from "./types";

export interface EditorState {
  nodes: NodeData[];
  workflowId: string;
  workflowName: string;
  selectedNodeId: string | null;
  panOffset: Position;
  zoom: number;
  executionStates: Record<string, NodeExecutionState>;
  isRunning: boolean;
}

type Listener = () => void;

let state: EditorState = {
  nodes: [],
  workflowId: "new-workflow",
  workflowName: "New Workflow",
  selectedNodeId: null,
  panOffset: { x: 0, y: 0 },
  zoom: 1,
  executionStates: {},
  isRunning: false,
};

const listeners: Set<Listener> = new Set();

export function getState(): EditorState {
  return state;
}

export function setState(partial: Partial<EditorState>) {
  state = { ...state, ...partial };
  notify();
}

export function updateNode(id: string, updates: Partial<NodeData>) {
  state = {
    ...state,
    nodes: state.nodes.map((n) => (n.id === id ? { ...n, ...updates } : n)),
  };
  notify();
}

export function addNode(node: NodeData) {
  state = { ...state, nodes: [...state.nodes, node] };
  notify();
}

export function removeNode(id: string) {
  state = {
    ...state,
    nodes: state.nodes
      .filter((n) => n.id !== id)
      .map((n) => ({
        ...n,
        parentBlocks: n.parentBlocks.filter((p) => p !== id),
      })),
    selectedNodeId: state.selectedNodeId === id ? null : state.selectedNodeId,
  };
  notify();
}

export function setExecutionState(nodeId: string, execState: NodeExecutionState) {
  state = {
    ...state,
    executionStates: { ...state.executionStates, [nodeId]: execState },
  };
  notify();
}

export function clearExecutionStates() {
  state = { ...state, executionStates: {}, isRunning: false };
  notify();
}

export function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function notify() {
  listeners.forEach((l) => l());
}
