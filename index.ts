import "./workflow";
import { Workflow } from "./workflow";
import { WorkflowBlock } from "./workflow/block";
import { WorkflowExpressionData, WorkflowExpressionMath, WorkflowExpressionParameter, WorkflowExpressionType } from "./workflow/expression";
import { WorkflowFork } from "./workflow/fork";
import { WorkflowRunner } from "./workflow/runner";

const date = new Date();

const wf = new Workflow("wf1", "Wf1", [
    new WorkflowBlock("main", "Main", [
        new WorkflowExpressionMath("", "", WorkflowExpressionType.Math, [
            new WorkflowExpressionParameter("", "expression", "", "", "2 * 2", "")
        ], [])
    ], [new WorkflowFork("fork1", "Fork1", "simple",
        [
            '==', '$result', '4'
        ],
        {
            "true": "step1",
            "false": "step2"
        }
    )], ["workflow"], [], [], date, date, date),
    new WorkflowBlock("step1", "Step1", [
        new WorkflowExpressionData("", "", WorkflowExpressionType.Math, [
            new WorkflowExpressionParameter("", "data", "", "", "result is four", "")
        ], [])
    ], null, [], [], [], date, date, date),
    new WorkflowBlock("step2", "Step2", [
        new WorkflowExpressionData("", "", WorkflowExpressionType.Math, [
            new WorkflowExpressionParameter("", "data", "", "", "result is not four", "")
        ], [])
    ], null, [], [], [], date, date, date)
], date, date, date);


const runner = new WorkflowRunner(wf);
runner.run().then(result => {
    console.log(result);
});
