// Implement workflow forks
// A workflow fork is a logical statement that can be evaluated to determine if a workflow step should be executed.
// The statement is evaluated by the imported `illogical` engine.
// A workflow fork type can be any of the following:
// - Simple: A simple statement is a logical expression that can be evaluated to determine if a workflow step should be executed.
// - Mapped: A mapped statement maps block results to a specific workflow step.

import Engine from '@briza/illogical'
import { Evaluable } from '@briza/illogical/types/common/evaluable';
import { ExpressionInput } from '@briza/illogical/types/parser';
import { WorkflowBlock } from './block';


export class WorkflowFork {
    public id: string;
    public name: string;
    public input: any;
    public branches: WorkflowForkBranch[];

    /**
     * 
     * @param id 
     * @param name 
     * @param branches
     */
    constructor(id: string, name: string, branches: WorkflowForkBranch[]) {
        this.id = id;
        this.name = name;
        this.branches = branches;

        const engine = new Engine();
        // for each branch, create an evaluable statement and add it to the branch object
        for (const branch of this.branches) {
            branch.evaluable = engine.parse(branch.statement);
        }
    }

    /**
     * Evaluate a mapped fork statement, similar to a simple fork statement
     * but the result can be other than true or false
     * For instance:
     *  - input: { name: 'peter' }
     *  - branches: [{
     *       statement: ['==', '$name', 'peter'],
     *       resultTrueBlocks: ['block1'],
     *       resultFalseBlocks: ['block3'],
     *    }, {
     *       statement: ['==', '$name', 'john'],
     *       resultTrueBlocks: ['block2'],
     *       resultFalseBlocks: ['block4'],
     *    }]
     *  - result: ['block1', 'block4']
     * @param input object containing the combined results of all the expressions in the input block
     * @returns {string} The workflow block to execute
     */
    public evaluate(input: any): string[] {
        const results: string[] = [];
        for (const branch of this.branches) {
            if (branch.evaluable) {
                const result = branch.evaluable.evaluate(input);
                if (result) {
                    results.push(...branch.resultTrueBlocks);
                } else {
                    results.push(...branch.resultFalseBlocks);
                }
            }
        }
        return results;
    }

    public static fromObject(object: any): WorkflowFork {
        return new WorkflowFork(object.id, object.name, object.branches);
    }
}

export interface WorkflowForkBranch {
    statement: ExpressionInput;
    resultTrueBlocks: string[];
    resultFalseBlocks: string[];
    evaluable?: Evaluable;
}