// Implement workflow runner
// The workflow runner is responsible for executing a workflow.
// The workflow runner takes a workflow definition and executes it, instantiating workflow blocks and evaluating workflow expressions.

import { Workflow, WorkflowResult } from ".";
import { WorkflowBlockResult, WorkflowBlock } from "./block";
import { WorkflowExpression, WorkflowExpressionResult } from "./expression";
import { WorkflowFork } from "./fork";

export class WorkflowRunner {
    public workflow: Workflow;
    private depth: number;

    constructor(workflow: Workflow) {
        this.workflow = workflow;
        this.depth = 0;
    }

    public async run(): Promise<WorkflowResult> {
        const results = await this.executeBlocks(this.workflow.blocks);
        return new WorkflowResult(this.workflow.id, this.workflow.name, results, new Date(), new Date(), new Date());
    }

    private async executeBlocks(blocks: WorkflowBlock[]): Promise<WorkflowBlockResult[]> {
        const results = [];
        for (const block of blocks) {
            const blockResult = await this.executeBlock(block);
            results.push(blockResult);
        }
        return results;
    }

    private async executeBlock(block: WorkflowBlock): Promise<WorkflowBlockResult> {
        // FIXME: there is some recursion issue so killing the workflow if it gets too deep
        this.depth++;
        if (this.depth > 10) {
            console.log(`${this.depth}`);
            throw '';
        }
        const expressionsResults = await this.evaluateExpressions(block.expressions);
        const blockResults = await this.evaluateForkOrNextBlock(block, expressionsResults);
        this.depth--;
        return new WorkflowBlockResult("", "", "String", "ok");
    }

    private async evaluateExpressions(expressions: WorkflowExpression[]): Promise<WorkflowExpressionResult[]> {
        const expressionResults = <WorkflowExpressionResult[]>[];
        for (const expression of expressions) {
            const result = await expression.compute();
            expressionResults.push(result);
        }
        return expressionResults;
    }

    private async evaluateForkOrNextBlock(block: WorkflowBlock, results: WorkflowExpressionResult[]): Promise<WorkflowBlockResult[] | undefined> {
        // TODO: do something with results, possibly log them and execute the next step recursively
        // execute the next step, which could be a fork or a block
        if (block.fork) {
            // Evaluate the fork
            // First, flatten the results into a single object with all of the results.name and results.value properties
            const resultsObject: { [key: string]: any } = {};
            for (const result of results) {
                resultsObject[result.name] = result.value;
            }
            console.log(resultsObject)
            const forkResult = block.fork.evaluate(resultsObject);
            if (forkResult) {
                // forkResult is an array of block ids
                // Fork matches one or more blocks, filter through workflow blocks and execute them
                const matchingBlocks = this.workflow.blocks.filter(b => forkResult.includes(b.id));
                return this.executeBlocks(matchingBlocks);
            }
        } else {
            // Find if there is a linked block to execute
            const linkedBlock = this.workflow.blocks.find(b => b.id === block.id);
            if (linkedBlock) {
                // Execute the linked block
                return this.executeBlocks([linkedBlock]);
            }
        }
    }


}