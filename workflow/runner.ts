// Implement workflow runner
// The workflow runner is responsible for executing a workflow.
// The workflow runner takes a workflow definition and executes it, instantiating workflow blocks and evaluating workflow expressions.

import { Workflow, WorkflowResult } from ".";
import { WorkflowBlockResult, WorkflowBlock } from "./block";
import { WorkflowExpression, WorkflowExpressionResult } from "./expression";
import { WorkflowFork } from "./fork";

export enum BlockState {
    NotStarted,
    Running,
    Finished,
    Failed
}
export class WorkflowRunner {
    public workflow: Workflow;
    public onBlockFinished: (block: WorkflowBlock, result: WorkflowBlockResult) => void = (block: WorkflowBlock, result: WorkflowBlockResult) => { };
    private depth: number;
    private state: any;


    constructor(workflow: Workflow) {
        this.workflow = workflow;
        this.depth = 0;
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
        const results = await this.executeBlocks(rootBlocks);
        return new WorkflowResult(this.workflow.id, this.workflow.name, results, new Date(), new Date(), new Date());
    }

    private setBlockState(block: WorkflowBlock, state: BlockState, result: WorkflowBlockResult | null = null) {
        this.state[block.id] = state;
        if (state === BlockState.Finished && result) {
            this.onBlockFinished(block, result);
        }
        console.log(`Block ${block.id} is now ${BlockState[state]}`);
    }

    private async executeBlocks(blocks: WorkflowBlock[]): Promise<WorkflowBlockResult[]> {
        // return multiple promises, one for each block
        const promises: Promise<WorkflowBlockResult>[] = [];
        for (const block of blocks) {
            const blockResult = this.executeBlock(block);
            blockResult.then(async (result: WorkflowBlockResult) => {
                this.setBlockState(block, BlockState.Finished, result);
                const childBlocks = this.findChildBlocks(block);
                const forkBlocks = this.evaluateFork(block, result);
                // FIXME: there is some recursion issue so killing the workflow if it gets too deep
                this.depth++;
                if (this.depth > 10) {
                    throw '';
                }
                await this.executeBlocks([...childBlocks, ...forkBlocks]);
                this.depth--;
            }).catch(err => {
                this.setBlockState(block, BlockState.Failed);
                console.log(`Block ${block.id} failed: ${err}`);
            });
            promises.push(blockResult);
        }
        // Execute all blocks in parallel
        const results = await Promise.all(promises);
        return results;
    }

    private async executeBlock(block: WorkflowBlock): Promise<WorkflowBlockResult> {
        this.setBlockState(block, BlockState.Running);
        console.log(`Executing block ${block.id}, current depth: ${this.depth}`);
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
        console.log(resultsObject)
        // for each fork, evaluate them and return the results
        for (const fork of block.forks) {
            console.log(`Evaluating fork ${JSON.stringify(fork, null, 2)}`);
            // Evaluate the fork
            const forkResult = fork.evaluate(resultsObject);
            if (forkResult) {
                // forkResult is an array of block ids
                // Fork matches one or more blocks, filter through workflow blocks and execute them
                const matchingBlocks = this.workflow.blocks.filter(b => forkResult.includes(b.id));
                console.log(`Fork matched ${matchingBlocks.length} blocks`);
                blocksToExecute.push(...matchingBlocks);
            }
        }
        return blocksToExecute;
    }

    private findChildBlocks(block: WorkflowBlock): WorkflowBlock[] {
        // Filter through workflow blocks and find all blocks that are children of this block
        const childBlocks = this.workflow.blocks.filter(b => b.parentBlocks.includes(block.id));
        console.log(`Found ${childBlocks.length} child blocks`);
        return childBlocks;
    }


}