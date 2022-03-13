import fs from 'fs'
import YAML from 'yaml'

import "./workflow";
import { WorkflowExpressionType } from "./workflow/expression";
import { WorkflowParser } from "./workflow/parser";
import { WorkflowRunner } from "./workflow/runner";

const log = require('simple-node-logger').createSimpleLogger();

const file = fs.readFileSync('./samples/multiplyAndPrint.yml', 'utf8')
const workflowDefinition = YAML.parse(file)

const wf = WorkflowParser.parse(workflowDefinition);

const runner = new WorkflowRunner(wf);

runner.onBlockFinished = (block, result) => {
    log.info(`Block "${block.id}" finished with result: ${JSON.stringify(result)}`);
};

runner.run().then(result => {
    log.info("Workflow ended.");
    log.info(JSON.stringify(result, null, 2));
});
