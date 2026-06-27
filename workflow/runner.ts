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
        const baseContext = this.createContext();
        const results = await Promise.all(rootBlocks.map(block => this.executeBlockTree(block, 0, baseContext)));
        return new WorkflowResult(this.workflow.id, this.workflow.name, results.flat(), new Date(), new Date(), new Date());
    }

    private setBlockState(block: WorkflowBlock, state: BlockState, result: WorkflowBlockResult | null = null) {
        this.state[block.id] = state;
        if (state === BlockState.Finished && result) {
            this.onBlockFinished(block, result);
        }
    }

    private async executeBlockTree(block: WorkflowBlock, depth: number, context: ExecutionContext): Promise<WorkflowBlockResult[]> {
        if (depth > WorkflowRunner.MAX_DEPTH) {
            throw new Error(`Workflow exceeded maximum depth of ${WorkflowRunner.MAX_DEPTH} blocks`);
        }

        try {
            const result = await this.executeBlock(block, context);
            this.setBlockState(block, BlockState.Finished, result);

            const nextContext = this.extendContext(context, block, result);
            const nextBlocks = this.dedupeBlocks([...this.findChildBlocks(block), ...this.evaluateFork(block, result, nextContext)]);
            const nestedResults = await Promise.all(nextBlocks.map(nextBlock => this.executeBlockTree(nextBlock, depth + 1, nextContext)));

            return [result, ...nestedResults.flat()];
        } catch (err) {
            this.setBlockState(block, BlockState.Failed);
            throw err;
        }
    }

    private async executeBlock(block: WorkflowBlock, context: ExecutionContext): Promise<WorkflowBlockResult> {
        this.setBlockState(block, BlockState.Running);
        const expressionsResults = await this.evaluateExpressions(block.expressions, context);
        // Flatten the expressionsResults into a single object with all of the results.name and results.value properties
        const resultsObject: { [key: string]: any } = {};
        for (const result of expressionsResults) {
            resultsObject[result.name] = result.value;
        }
        return new WorkflowBlockResult(block.id, block.name, "String", resultsObject);
    }

    private async evaluateExpressions(expressions: WorkflowExpression[], context: ExecutionContext): Promise<WorkflowExpressionResult[]> {
        const results: WorkflowExpressionResult[] = [];
        const currentResults: { [key: string]: any } = {};
        for (const expression of expressions) {
            const scopedContext = this.toExpressionContext(context, currentResults);
            const result = await expression.compute(scopedContext);
            results.push(result);
            currentResults[result.name] = result.value;
            currentResults.result = result.value;
            currentResults.last = result.value;
        }
        return results;
    }

    private evaluateFork(block: WorkflowBlock, results: WorkflowBlockResult, context: ExecutionContext): WorkflowBlock[] {
        const blocksToExecute: WorkflowBlock[] = [];
        const resultsObject = {
            ...context.workflow,
            ...context.blocks,
            ...results.value,
            current: results.value,
            workflow: context.workflow,
            blocks: context.blocks,
            result: results.value.result ?? Object.values(results.value)[0],
        };
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

    private dedupeBlocks(blocks: WorkflowBlock[]): WorkflowBlock[] {
        const seen = new Set<string>();
        return blocks.filter(block => {
            if (seen.has(block.id)) return false;
            seen.add(block.id);
            return true;
        });
    }

    private createContext(): ExecutionContext {
        return {
            workflow: {},
            blocks: {},
        };
    }

    private extendContext(context: ExecutionContext, block: WorkflowBlock, result: WorkflowBlockResult): ExecutionContext {
        const blockResults = result.value;
        return {
            workflow: {
                ...context.workflow,
                [block.id]: blockResults,
            },
            blocks: {
                ...context.blocks,
                [block.id]: blockResults,
            },
            lastResult: blockResults.result ?? Object.values(blockResults)[0],
        };
    }

    private toExpressionContext(context: ExecutionContext, currentResults: { [key: string]: any }): any {
        return {
            ...context.workflow,
            ...context.blocks,
            ...currentResults,
            current: currentResults,
            workflow: context.workflow,
            blocks: context.blocks,
            last: currentResults.last,
            result: currentResults.result ?? context.lastResult,
        };
    }
}

interface ExecutionContext {
    workflow: Record<string, any>;
    blocks: Record<string, any>;
    lastResult?: any;
}