// Implement workflow runner
// The workflow runner is responsible for executing a workflow.
// The workflow runner takes a workflow definition and executes it, instantiating workflow blocks and evaluating workflow expressions.

import { Workflow, WorkflowResult } from ".";
import { WorkflowBlockResult, WorkflowBlock } from "./block";
import { WorkflowExpressionResult } from "./expression";

export class WorkflowRunner {
    public workflow: Workflow;

    constructor(workflow: Workflow) {
        this.workflow = workflow;
    }

    public async run(): Promise<WorkflowResult> {
        const results = await this.executeBlocks();
        // const result = this.evaluateExpressions(results);
        return new WorkflowResult(this.workflow.id, this.workflow.name, results, new Date(), new Date(), new Date());
    }

    private async executeBlocks(): Promise<WorkflowBlockResult[]> {
        const results = [];
        for (const block of this.workflow.blocks) {
            const blockResults = await this.executeBlock(block);
            results.push(...blockResults);
        }
        return results;
    }

    private async executeBlock(block: WorkflowBlock): Promise<WorkflowBlockResult[]> {
        const blockResults = <WorkflowExpressionResult[]>[];
        for (const expression of block.expressions) {
            const result = await expression.compute();
            blockResults.push(result);
        }
        Promise.allSettled(blockResults).then(results => {
            // TODO: do something with results, possibly log them and execute the next step recursively
        });
        return blockResults;
    }

    // private evaluateExpressions(results: WorkflowBlockResult[]): WorkflowResult {
    //     const result = {};
    //     for (const expression of this.workflow.expressions) {
    //         const expressionResult = expression.results.map(result => result.id);
    //         const expressionResultValues = results.filter(result => expressionResult.includes(result.id)).map(result => result.value);
    //         result[expression.id] = expressionResultValues;
    //     }
    //     return result;
    // }
}