import { Workflow } from "./";
import { WorkflowBlock } from "./block";
import { WorkflowExpression, WorkflowExpressionParameter } from "./expression";
import { WorkflowFork } from "./fork";


// The Parser class parses a workflow definition and returns a Workflow object.
export class WorkflowParser {
    public static parse(workflowDefinition: any): Workflow {
        // parse environment variables
        let environment: any = {};
        for (let key in workflowDefinition.environment) {
            environment[key] = workflowDefinition.environment[key];
        }

        // parse blocks
        let blocks: WorkflowBlock[] = [];
        for (let blockDefinition of workflowDefinition.blocks) {
            // parse parent blocks
            let parentBlocks: string[] = blockDefinition.parentBlocks;

            // parse expressions
            let expressions: WorkflowExpression[] = blockDefinition.expressions.map((expressionDefinition: any) =>
                WorkflowExpression.fromObject(expressionDefinition));

            // parse forks
            let forks: WorkflowFork[] = blockDefinition.forks.map((forkDefinition: any) =>
                WorkflowFork.fromObject(forkDefinition));

            // parse parameters
            // let parameters: WorkflowExpressionParameter[] = blockDefinition.parameters.map((parameterDefinition: any) =>
            //     WorkflowExpressionParameter.fromObject(parameterDefinition));
            let parameters: WorkflowExpressionParameter[] = [];

            // parse dates
            // let createdAt: Date = new Date(blockDefinition.createdAt);
            // let updatedAt: Date = new Date(blockDefinition.updatedAt);
            // let deletedAt: Date = new Date(blockDefinition.deletedAt);

            let createdAt: Date = new Date();
            let updatedAt: Date = new Date();
            let deletedAt: Date = new Date();

            // create block
            let block = new WorkflowBlock(
                blockDefinition.id,
                blockDefinition.name,
                expressions,
                forks,
                parentBlocks,
                parameters,
                createdAt,
                updatedAt,
                deletedAt
            );

            // add block to list
            blocks.push(block);
        }

        // parse dates
        let createdAt: Date = new Date(workflowDefinition.createdAt);
        let updatedAt: Date = new Date(workflowDefinition.updatedAt);
        let deletedAt: Date = new Date(workflowDefinition.deletedAt);

        // create workflow
        let workflow = new Workflow(
            workflowDefinition.id,
            workflowDefinition.name,
            environment,
            blocks,
            createdAt,
            updatedAt,
            deletedAt
        );

        return workflow;
    }
}