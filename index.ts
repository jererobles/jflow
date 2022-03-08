import "./workflow";
import { Workflow } from "./workflow";
import { WorkflowBlock } from "./workflow/block";
import { WorkflowExpressionMath, WorkflowExpressionType } from "./workflow/expression";
import { WorkflowRunner } from "./workflow/runner";

const date = new Date();

const wf = new Workflow("", "", [
    new WorkflowBlock("", "", [
        new WorkflowExpressionMath("", "", WorkflowExpressionType.Math, [], [], "2 * 2")
    ], [], [], date, date, date),
    new WorkflowBlock("", "", [
        new WorkflowExpressionMath("", "", WorkflowExpressionType.Math, [], [], "4 * 4")
    ], [], [], date, date, date)
], date, date, date);

const runner = new WorkflowRunner(wf);
runner.run().then(result => {
    console.log(result);
});
