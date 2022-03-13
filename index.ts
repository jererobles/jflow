import "./workflow";
import { WorkflowExpressionType } from "./workflow/expression";
import { WorkflowParser } from "./workflow/parser";
import { WorkflowRunner } from "./workflow/runner";

const date = new Date();

const workflowDefinition = {
    id: "wf1",
    name: "Wf1",
    environment: {},
    blocks: [
        {
            id: "main",
            name: "Main",
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
                    results: []
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
            results: [],
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
                    type: WorkflowExpressionType.Data,
                    parameters: [
                        {
                            id: "",
                            name: "data",
                            value: "result is four"
                        }
                    ],
                    results: []
                }
            ],
            forks: [],
            parentBlocks: [],
            parameters: [],
            results: [],
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
                    results: []
                }
            ],
            forks: [],
            parentBlocks: [],
            parameters: [],
            results: [],
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
runner.run().then(result => {
    console.log(result);
});
