import "./workflow";
import { WorkflowExpressionType } from "./workflow/expression";
import { WorkflowParser } from "./workflow/parser";
import { WorkflowRunner } from "./workflow/runner";

const log = require('simple-node-logger').createSimpleLogger();

const date = new Date();

const workflowDefinition = {
    id: "wf1",
    name: "Wf1",
    environment: {},
    blocks: [
        {
            id: "multiply",
            name: "Multiply",
            expressions: [
                {
                    id: "",
                    type: WorkflowExpressionType.Math,
                    parameters: [
                        {
                            id: "",
                            name: "expression",
                            value: "2 * 2",
                        }
                    ],
                }
            ],
            forks: [
                {
                    id: "fork1",
                    name: "Fork1",
                    branches: [{
                        statement: ["==",
                            "$result",
                            "4"
                        ],
                        resultTrueBlocks: ["step1"],
                        resultFalseBlocks: ["step2"]
                    }],
                }
            ],
            parentBlocks: [
                "workflow"
            ],
            parameters: [],
            createdAt: date,
            updatedAt: date,
            deletedAt: date
        },
        {
            id: "delay",
            name: "Delay",
            expressions: [
                {
                    id: "",
                    type: WorkflowExpressionType.Wait,
                    parameters: [
                        {
                            id: "",
                            name: "seconds",
                            value: "6",
                        }
                    ],
                }
            ],
            forks: [],
            parentBlocks: [
                "workflow"
            ],
            parameters: [],
            createdAt: date,
            updatedAt: date,
            deletedAt: date
        },
        {
            id: "step1",
            name: "Step1",
            expressions: [
                {
                    id: "",
                    type: WorkflowExpressionType.Wait,
                    parameters: [
                        {
                            id: "",
                            name: "seconds",
                            value: "3"
                        }
                    ],
                },
                {
                    id: "",
                    type: WorkflowExpressionType.Data,
                    parameters: [
                        {
                            id: "",
                            name: "data",
                            value: "result is four"
                        }
                    ],
                }
            ],
            forks: [],
            parentBlocks: [],
            parameters: [],
            createdAt: date,
            updatedAt: date,
            deletedAt: date
        },
        {
            id: "step2",
            name: "Step2",
            expressions: [
                {
                    id: "",
                    type: WorkflowExpressionType.Data,
                    parameters: [
                        {
                            id: "",
                            name: "data",
                            value: "result is not four"
                        }
                    ],
                }
            ],
            forks: [],
            parentBlocks: [],
            parameters: [],
            createdAt: date,
            updatedAt: date,
            deletedAt: date
        }
    ],
    createdAt: date,
    updatedAt: date,
    deletedAt: date
};

const wf = WorkflowParser.parse(workflowDefinition);

const runner = new WorkflowRunner(wf);

runner.onBlockFinished = (block, result) => {
    log.info(`Block ${block.name} finished with result: ${JSON.stringify(result)}`);
};

runner.run().then(result => {
    log.info("Workflow ended.");
    log.info(JSON.stringify(result, null, 2));
});
