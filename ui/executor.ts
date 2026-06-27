/** Run the workflow and update execution states in real-time */

import YAML from "yaml";
import { getState, setState, setExecutionState, clearExecutionStates } from "./state";
import { serialize } from "./serializer";
import { WorkflowParser } from "../workflow/parser";
import { WorkflowRunner } from "../workflow/runner";

export async function runWorkflow() {
  const state = getState();
  if (state.isRunning) return;

  // Reset execution states
  clearExecutionStates();
  setState({ isRunning: true });

  // Set all nodes to idle
  for (const node of state.nodes) {
    setExecutionState(node.id, { state: "idle" });
  }

  try {
    const yamlStr = serialize();
    const def = YAML.parse(yamlStr);
    const workflow = WorkflowParser.parse(def);
    const runner = new WorkflowRunner(workflow);

    // Hook into the runner to get real-time block state changes
    const originalRun = runner.run.bind(runner);

    // Mark blocks as running when they start
    runner.onBlockFinished = (block, result) => {
      setExecutionState(block.id, {
        state: "success",
        result: result.value,
        finishedAt: Date.now(),
      });
    };

    // Patch: mark blocks running by intercepting the state
    const origSetState = (runner as any).setBlockState;
    if (origSetState) {
      (runner as any).setBlockState = function (block: any, blockState: any, result: any) {
        origSetState.call(runner, block, blockState, result);
        if (blockState === 1) {
          // Running
          setExecutionState(block.id, { state: "running", startedAt: Date.now() });
        } else if (blockState === 3) {
          // Failed
          setExecutionState(block.id, { state: "failed", finishedAt: Date.now() });
        }
      };
    }

    await runner.run();
    setState({ isRunning: false });
  } catch (error) {
    console.error("Workflow execution failed:", error);
    setState({ isRunning: false });
  }
}
