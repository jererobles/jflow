// Implement workflow runner
// The workflow runner is responsible for executing a workflow.
// The workflow runner takes a workflow definition and executes it, instantiating workflow blocks and evaluating workflow expressions.

import { Workflow, WorkflowResult } from "./index";
import { WorkflowBlockResult, WorkflowBlock } from "./block";
import { WorkflowExpression, WorkflowExpressionResult } from "./expression";

export enum BlockState {
    NotStarted,
    Running,
    Finished,
    Failed,
}

export class WorkflowRunner {
    public workflow: Workflow;
    public onBlockFinished: (block: WorkflowBlock, result: WorkflowBlockResult) => void = (block: WorkflowBlock, result: WorkflowBlockResult) => { };
    private state: { [key: string]: BlockState };

    private static MAX_DEPTH = 100;

    constructor(workflow: Workflow) {
        this.workflow = workflow;
        this.state = {};
    }

    public async run(): Promise<WorkflowResult> {
        // Set all blocks to not started, and execute the blocks that are the root blocks
        const rootBlocks = [];
        for (const block of this.workflow.blocks) {
            this.setBlockState(block, BlockState.NotStarted);
            if (block.parentBlocks.includes("workflow")) {
                rootBlocks.push(block);
            }
        }
        const results = await Promise.all(rootBlocks.map(block => this.executeBlockTree(block, 0)));
        return new WorkflowResult(this.workflow.id, this.workflow.name, results.flat(), new Date(), new Date(), new Date());
    }

    private setBlockState(block: WorkflowBlock, state: BlockState, result: WorkflowBlockResult | null = null) {
        this.state[block.id] = state;
        if (state === BlockState.Finished && result) {
            this.onBlockFinished(block, result);
        }
    }

    private async executeBlockTree(block: WorkflowBlock, depth: number): Promise<WorkflowBlockResult[]> {
        if (depth > WorkflowRunner.MAX_DEPTH) {
            throw new Error(`Workflow exceeded maximum depth of ${WorkflowRunner.MAX_DEPTH} blocks`);
        }

        try {
            const result = await this.executeBlock(block);
            this.setBlockState(block, BlockState.Finished, result);

            const nextBlocks = [...this.findChildBlocks(block), ...this.evaluateFork(block, result)];
            const nestedResults = await Promise.all(nextBlocks.map(nextBlock => this.executeBlockTree(nextBlock, depth + 1)));

            return [result, ...nestedResults.flat()];
        } catch (err) {
            this.setBlockState(block, BlockState.Failed);
            throw err;
        }
    }

    private async executeBlock(block: WorkflowBlock): Promise<WorkflowBlockResult> {
        this.setBlockState(block, BlockState.Running);
        const expressionsResults = await this.evaluateExpressions(block.expressions);
        // Flatten the expressionsResults into a single object with all of the results.name and results.value properties
        const resultsObject: { [key: string]: any } = {};
        for (const result of expressionsResults) {
            resultsObject[result.name] = result.value;
        }
        return new WorkflowBlockResult(block.id, block.name, "String", resultsObject);
    }

    private async evaluateExpressions(expressions: WorkflowExpression[]): Promise<WorkflowExpressionResult[]> {
        // Compute all expressions by calling expression.compute() at the same time and return the results as an array of Promises
        const results = await Promise.all(expressions.map(e => e.compute()));
        return results;

    }

    private evaluateFork(block: WorkflowBlock, results: WorkflowBlockResult): WorkflowBlock[] {
        // First, flatten the results into a single object with all of the results.name and results.value properties
        const blocksToExecute: WorkflowBlock[] = [];
        const resultsObject = results.value;
        // for each fork, evaluate them and return the results
        for (const fork of block.forks) {
            // Evaluate the fork
            const forkResult = fork.evaluate(resultsObject);
            if (forkResult) {
                // forkResult is an array of block ids
                // Fork matches one or more blocks, filter through workflow blocks and execute them
                const matchingBlocks = this.workflow.blocks.filter(b => forkResult.includes(b.id));
                blocksToExecute.push(...matchingBlocks);
            }
        }
        return blocksToExecute;
    }

    private findChildBlocks(block: WorkflowBlock): WorkflowBlock[] {
        // Filter through workflow blocks and find all blocks that are children of this block
        return this.workflow.blocks.filter(b => b.parentBlocks.includes(block.id));
    }
}