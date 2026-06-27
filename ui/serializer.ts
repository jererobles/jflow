/** Serialize/deserialize between editor state and YAML workflow definitions */

import YAML from "yaml";
import { getState, setState } from "./state";
import { NodeData, ExpressionData, ForkData } from "./types";
import { resolveExpressionReferenceKey } from "../workflow/referenceKeys";

export function serialize(): string {
  const { nodes, workflowId, workflowName } = getState();

  const blocks = nodes.map((node) => ({
    id: node.id,
    name: node.name,
    expressions: node.expressions.map((expr) => ({
      id: expr.id,
      name: expr.name,
      type: expr.type,
      parameters: expr.parameters.map((p) => ({
        id: p.id,
        name: p.name,
        value: p.value,
      })),
    })),
    forks: node.forks.map((fork) => ({
      id: fork.id,
      name: fork.name,
      branches: fork.branches.map((b) => ({
        statement: b.statement,
        resultTrueBlocks: b.resultTrueBlocks,
        resultFalseBlocks: b.resultFalseBlocks,
      })),
    })),
    parentBlocks: node.parentBlocks,
    parameters: [],
  }));

  return YAML.stringify({
    id: workflowId,
    name: workflowName,
    environment: {},
    blocks,
  });
}

export function deserialize(yamlStr: string) {
  const def = YAML.parse(yamlStr);
  if (!def) return;

  const nodes: NodeData[] = (def.blocks ?? []).map((block: any, index: number) => {
    const takenExpressionNames = new Set<string>();
    const expressions: ExpressionData[] = (block.expressions ?? []).map((expr: any) => {
      const id = expr.id || `expr_${Math.random().toString(36).slice(2, 6)}`;
      const name = resolveExpressionReferenceKey(
        { id, name: expr.name, type: expr.type },
        takenExpressionNames
      );
      takenExpressionNames.add(name);

      return {
        id,
        name,
        type: expr.type,
        parameters: (expr.parameters ?? []).map((p: any) => ({
          id: p.id || "",
          name: p.name,
          value: p.value ?? p.defaultValue ?? "",
        })),
      };
    });

    const forks: ForkData[] = (block.forks ?? []).map((fork: any) => ({
      id: fork.id || `fork_${Math.random().toString(36).slice(2, 6)}`,
      name: fork.name || "Fork",
      branches: (fork.branches ?? []).map((b: any) => ({
        statement: b.statement,
        resultTrueBlocks: b.resultTrueBlocks ?? [],
        resultFalseBlocks: b.resultFalseBlocks ?? [],
      })),
    }));

    return {
      id: block.id,
      name: block.name || block.id,
      type: "block" as const,
      position: autoLayout(index, def.blocks.length),
      expressions,
      forks,
      parentBlocks: block.parentBlocks ?? [],
    };
  });

  setState({
    nodes,
    workflowId: def.id || "workflow",
    workflowName: def.name || "Workflow",
    selectedNodeId: null,
  });
}

function autoLayout(index: number, total: number): { x: number; y: number } {
  // Simple tree-like layout
  const cols = Math.max(2, Math.ceil(Math.sqrt(total)));
  const col = index % cols;
  const row = Math.floor(index / cols);
  return {
    x: 80 + col * 280,
    y: 80 + row * 180,
  };
}
