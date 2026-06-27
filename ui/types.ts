/** Shared types for the visual workflow editor */

export interface Position {
  x: number;
  y: number;
}

export interface NodeData {
  id: string;
  name: string;
  type: "block";
  position: Position;
  expressions: ExpressionData[];
  forks: ForkData[];
  parentBlocks: string[];
}

export interface ExpressionData {
  id: string;
  name: string;
  type: string;
  parameters: { id: string; name: string; value: string }[];
}

export interface ForkBranchData {
  statement: any;
  resultTrueBlocks: string[];
  resultFalseBlocks: string[];
}

export interface ForkData {
  id: string;
  name: string;
  branches: ForkBranchData[];
}

export type ExecutionState = "idle" | "running" | "success" | "failed";

export interface NodeExecutionState {
  state: ExecutionState;
  result?: any;
  startedAt?: number;
  finishedAt?: number;
}
