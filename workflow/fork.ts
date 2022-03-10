// Implement workflow forks
// A workflow fork is a logical statement that can be evaluated to determine if a workflow step should be executed.
// The statement is evaluated by the imported `illogical` engine.
// A workflow fork type can be any of the following:
// - Simple: A simple statement is a logical expression that can be evaluated to determine if a workflow step should be executed.
// - Mapped: A mapped statement maps block results to a specific workflow step.

import Engine from '@briza/illogical'
import { Evaluable } from '@briza/illogical/types/common/evaluable';
import { ExpressionInput } from '@briza/illogical/types/parser';


export type WorkflowForkType = 'simple' | 'mapped';

export class WorkflowFork {
    public id: string;
    public name: string;
    public type: WorkflowForkType;
    public input: any;
    public statement: ExpressionInput;
    public mapping: any;
    private evaluable: Evaluable;

    /**
     * 
     * @param id 
     * @param name 
     * @param type 
     * @param statement 
     * @param mapping 
     */
    constructor(id: string, name: string, type: WorkflowForkType, statement: ExpressionInput, mapping: any) {
        this.id = id;
        this.name = name;
        this.type = type;
        this.statement = statement;
        this.mapping = mapping;

        const engine = new Engine();
        this.evaluable = engine.parse(statement);
    }

    /**
     * Evaluate the fork statement
     * @param input object containing the combined results of all the expressions in the input block
     * @returns {string} The workflow step to execute
     */
    public evaluate(input: any): string[] {
        if (this.type === 'simple') {
            return this.evaluateSimple(input);
        } else {
            return this.evaluateMapped(input);
        }
    }

    /**
     * Evaluate a simple fork statement
     * For instance:
     *  - input: { name: 'peter' }
     *  - statement: ['==', '$name', 'peter']
     *  - result: true
     * @param input object containing the combined results of all the expressions in the input block
     * @returns {string} The workflow step to execute
     */
    private evaluateSimple(input: any): string[] {
        const result = this.evaluable.evaluate(input);
        if (result === true) {
            return [this.mapping.true];
        } else {
            return [this.mapping.false];
        }
    }

    /**
     * Evaluate a mapped fork statement, similar to a simple fork statement
     * but the result can be other than true or false
     * For instance:
     *  - input: { name: 'peter' }
     *  - branches: [{
     *       statement: ['==', '$name', 'peter'],
     *       block: 'block1'
     *    }, {
     *       statement: ['==', '$name', 'john'],
     *       block: 'block2'
     *    }]
     *  - result: 'block1'
     * @param input object containing the combined results of all the expressions in the input block
     * @returns {string} The workflow block to execute
     */
    private evaluateMapped(input: any): string[] {
        let blocks = [];
        for (const branch of this.mapping.branches) {
            const result = this.evaluable.evaluate(input);
            if (result === true) {
                blocks.push(branch.block);
            }
        }
        return blocks;
    }

}