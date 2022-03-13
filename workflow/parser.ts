import { Workflow } from "./";
import { WorkflowBlock } from "./block";
import { WorkflowExpression, WorkflowExpressionData, WorkflowExpressionMath, WorkflowExpressionParameter, WorkflowExpressionType } from "./expression";
import { WorkflowFork } from "./fork";

// The workflow definition is stored in a JSON file.
// The definition has a schema that looks like this:
const workflowDefinitionExample = {
    id: "string",
    name: "string",
    environment: {
        // environment variables, key: value
        string: "string",
    },
    forks: [
        // a fork is a conditional statements to be evaluated
        // a block may have multiple forks
        // statements are expressed as a string from the `illogical` library
        {
            id: "string",
            name: "string",
            block: "string",
            branches: [
                {
                    statement: "string",
                    // mapping of block ids to be invoked after each statement is evaluated
                    // the mappings are "true" and "false" for each statement
                    resultTrueBlocks: ["string"], // or empty array
                    resultFalseBlocks: ["string"], // or empty array
                },
            ],
        },
    ],
    blocks: [
        // collection of one or more expressions
        // one block can be used multiple times
        // a block output can be used as input for another block or a fork
        {
            id: "string",
            name: "string",
            parentBlocks: ["string"], // or empty array for root blocks
            expressions: [
                // raw compute expressions
                // can be reused multiple times by different blocks
                // result is computed on every execution
                // one or more per block
                // a block with only one expression is referred to as an "inline" block
                {
                    id: "string",
                    name: "string",
                    type: "string",
                    retry: "number",
                    parameters: [
                        // parameters, key: value
                        {
                            id: "string",
                            name: "string",
                            type: "string",
                            defaultValue: "string",
                            description: "string",
                        },
                    ],
                    results: [
                        // one or more results
                        {
                            id: "string",
                            name: "string",
                            type: "string",
                            description: "string",
                        },
                    ],
                },
            ],
            parameters: [
                {
                    id: "string",
                    name: "string",
                    type: "string",
                    defaultValue: "string",
                    description: "string",
                },
            ],
            results: [
                {
                    id: "string",
                    name: "string",
                    type: "string",
                    description: "string",
                },
            ],
        },
    ],
};




// The Parser class parses a workflow definition and returns a Workflow object.
class Parser {
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
            let parameters = [];

            // parse results
            // let results: WorkflowExpression[] = blockDefinition.results.map((resultDefinition: any) =>
            //     WorkflowExpression.fromObject(resultDefinition));
            let results = [];

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
                results,
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