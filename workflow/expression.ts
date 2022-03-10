// Implement workflow block expression types.
// A workflow block takes a set of parameters, performs some computation, and returns a set of results.
// A workflow block computation depends on the type of the workflow block expression.
// Workflow block expression types: Math, Data, and Control.
import math = require("mathjs")

/**
 * There are 3 WorkflowBlockExpressionTypes: Math, Data, and Control.
 * Math: A workflow block expression that performs some mathematical computation, such as:
 *  - (pi * e)^x
 *  - sin(x)
 *  - max(x, y)
 * Data: A workflow block expression that reads and writes data, such as:
 *  - Reading and writing a file or a database.
 *  - Reading and writing a message queue.
 *  - Requesting and receiving a web service.
 * Control: A workflow block expression that performs some control operation, such as:
 *  - Wait for a certain amount of time.
 *  - Execute a workflow block.
 *  - End the workflow.
 */

// TODO: these could be their own classes and enums could instead be used for subtypes such as "log to console"
export enum WorkflowExpressionType {
    Math = 'Math',
    Data = 'Data',
    Control = 'Control'
}

export enum WorkflowExpressionResultType {
    Number = 'Number',
    String = 'String',
    Boolean = 'Boolean',
    Array = 'Array',
    Object = 'Object',
}

export class WorkflowExpressionParameter {
    public id: string;
    public name: string;
    public type: string;
    public defaultValue: any;
    public value: any;
    public description: string;

    constructor(id: string, name: string, type: string, defaultValue: any, value: any, description: string) {
        this.id = id;
        this.name = name;
        this.type = type;
        this.defaultValue = defaultValue;
        this.value = value;
        this.description = description;
    }
}

export class WorkflowExpression {
    public id: string;
    public name: string;
    public type: WorkflowExpressionType;
    public parameters: any;
    public results: WorkflowExpressionResult[];

    constructor(id: string, name: string, type: WorkflowExpressionType, parameters: WorkflowExpressionParameter[], results: WorkflowExpressionResult[]) {
        this.id = id;
        this.name = name;
        this.type = type;
        this.results = results;
        this.parameters = {};
        for (let param of parameters) {
            this.parameters[param.name] = param.value || param.defaultValue;
        }
    }

    public async compute(): Promise<WorkflowExpressionResult> {
        // FIXME: placeholder
        return new WorkflowExpressionResult('', '', WorkflowExpressionResultType.Number, '0');
    }
}

// WorkflowBlockExpressionMath is a workflow block expression that performs a mathematical operation.
// The mathematical operation can be any operation supported by the imported mathjs library.
// The class takes a `mathExpression` parameter that specifies the mathematical operation to perform.
export class WorkflowExpressionMath extends WorkflowExpression {

    constructor(id: string, name: string, type: WorkflowExpressionType, parameters: WorkflowExpressionParameter[], results: WorkflowExpressionResult[]) {
        super(id, name, type, parameters, results);
    }

    /**
     * 
     * @returns The result of the mathematical operation wrapped in a WorkflowExpressionResult.
     */
    public async compute(): Promise<WorkflowExpressionResult> {
        // FIXME: this.parameters.expression is untyped
        const result = math.evaluate(this.parameters.expression);
        return new WorkflowExpressionResult("result", "result", WorkflowExpressionResultType.String, result.toString());
    }
}

export class WorkflowExpressionData extends WorkflowExpression {

    constructor(id: string, name: string, type: WorkflowExpressionType, parameters: WorkflowExpressionParameter[], results: WorkflowExpressionResult[]) {
        super(id, name, type, parameters, results);
    }

    /**
     * 
     * @returns The result of the mathematical operation wrapped in a WorkflowExpressionResult.
     */
    public async compute(): Promise<WorkflowExpressionResult> {
        // FIXME: this.parameters.data is untyped
        const result = this.parameters.data;
        console.log(result);
        return new WorkflowExpressionResult("", "", WorkflowExpressionResultType.String, result.toString());
    }
}


export class WorkflowExpressionResult {
    public id: string;
    public name: string;
    public type: WorkflowExpressionResultType;
    public value: string;

    constructor(id: string, name: string, type: WorkflowExpressionResultType, value: string) {
        this.id = id;
        this.name = name;
        this.type = type;
        this.value = value;
    }
}

