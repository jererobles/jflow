// Implement workflow block expression types.
// A workflow block takes a set of parameters, performs some computation, and returns a set of results.
// A workflow block computation depends on the type of the workflow block expression.
// Workflow block expression types: Math, Data, and Control.
const fetch = require("node-fetch");
import math = require("mathjs")
// import math from 'mathjs'

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

// https://stackoverflow.com/a/6491621
// @ts-ignore
Object.byString = function (o, s) {
    s = s.replace(/\[(\w+)\]/g, '.$1'); // convert indexes to properties
    s = s.replace(/^\./, '');           // strip a leading dot
    var a = s.split('.');
    for (var i = 0, n = a.length; i < n; ++i) {
        var k = a[i];
        if (k in o) {
            o = o[k];
        } else {
            return;
        }
    }
    return o;
}

// TODO: these could be their own classes and enums could instead be used for subtypes such as "log to console"
export enum WorkflowExpressionType {
    Math = 'Math',
    ConsoleLog = 'ConsoleLog',
    HTTPRequest = 'HTTPRequest',
    Wait = 'Wait'
}

// TODO: implement type checking for parameters
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
    public defaultValue: any; // TODO: implement default value for parameters
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
    public parameters: any;
    public withResult: WorkflowExpression | null | null = null;
    public results: WorkflowExpressionResult[] = [];

    constructor(id: string, name: string, parameters: WorkflowExpressionParameter[], withResult: WorkflowExpression | null = null) {
        this.id = id;
        this.name = name;
        this.parameters = {};
        this.withResult = withResult;
        for (let param of parameters) {
            this.parameters[param.name] = param.value || param.defaultValue;
        }
    }

    // FIXME: context is not typed
    public async compute(context: any = {}): Promise<WorkflowExpressionResult> {
        // FIXME: placeholder
        return new WorkflowExpressionResult('', '', WorkflowExpressionResultType.Number, '0');
    }

    public contextualize(context: any, template: string): string {
        // Replace all instances of {{parameter}} in template with the value of the parameter in the context
        // if template has method "replace"
        if (typeof template === 'string' && typeof template.replace === 'function') {
            return template.replace(/\{\{(.+?)\}\}/gm, function (_, match) {
                // @ts-ignore
                return Object.byString(context, match);
            });
        }
        return template;
    }

    // create a new WorkflowExpression from a JSON object
    public static fromObject(obj: any): WorkflowExpression {
        let parameters: WorkflowExpressionParameter[] = [];
        for (let param of obj.parameters) {
            parameters.push(new WorkflowExpressionParameter(param.id, param.name, param.type, param.defaultValue, param.value, param.description));
        }

        let withResult: WorkflowExpression | null = null;
        if (obj.withResult) {
            withResult = WorkflowExpression.fromObject(obj.withResult);
        }

        // use WorkflowExpressionType to instantiate the correct type
        if (obj.type === WorkflowExpressionType.Math) {
            return new WorkflowExpressionMath(obj.id, obj.name, parameters, withResult);
        }
        else if (obj.type === WorkflowExpressionType.ConsoleLog) {
            return new WorkflowExpressionConsoleLog(obj.id, obj.name, parameters, withResult);
        }
        else if (obj.type === WorkflowExpressionType.Wait) {
            return new WorkflowExpressionWait(obj.id, obj.name, parameters, withResult);
        }
        else if (obj.type === WorkflowExpressionType.HTTPRequest) {
            return new WorkflowExpressionHTTPRequest(obj.id, obj.name, parameters, withResult);
        }
        throw new Error('Unknown workflow expression type: ' + obj.type);

    }
}

// WorkflowBlockExpressionMath is a workflow block expression that performs a mathematical operation.
// The mathematical operation can be any operation supported by the imported mathjs library.
export class WorkflowExpressionMath extends WorkflowExpression {

    constructor(id: string, name: string, parameters: WorkflowExpressionParameter[], withResult: WorkflowExpression | null = null) {
        super(id, name, parameters, withResult);
    }

    /**
     * 
     * @returns The result of the mathematical operation wrapped in a WorkflowExpressionResult.
     */
    public async compute(context: any = {}): Promise<WorkflowExpressionResult> {
        // FIXME: this.parameters.expression is untyped
        let result = math.evaluate(this.parameters.expression);
        if (context) {
            result = this.contextualize(context, result);
        }
        if (this.withResult) {
            result = await this.withResult.compute(result);
        }
        return new WorkflowExpressionResult("result", "result", WorkflowExpressionResultType.String, result.toString());
    }
}

export class WorkflowExpressionConsoleLog extends WorkflowExpression {

    constructor(id: string, name: string, parameters: WorkflowExpressionParameter[], withResult: WorkflowExpression | null = null) {
        super(id, name, parameters, withResult);
    }

    /**
     * 
     * @returns The result of console.log operation wrapped in a WorkflowExpressionResult.
     */
    public async compute(context: any = {}): Promise<WorkflowExpressionResult> {
        // FIXME: this.parameters.data is untyped
        let result = this.parameters.data;
        if (context) {
            result = this.contextualize(context, result);
        }
        if (this.withResult) {
            result = await this.withResult.compute(result);
        }
        console.log(result);
        return new WorkflowExpressionResult("", "", WorkflowExpressionResultType.String, result.toString());
    }
}

export class WorkflowExpressionWait extends WorkflowExpression {

    constructor(id: string, name: string, parameters: WorkflowExpressionParameter[], withResult: WorkflowExpression | null = null) {
        super(id, name, parameters, withResult);
    }

    /**
     * 
     * @returns The result of a control operation wrapped in a WorkflowExpressionResult.
     */
    public async compute(context: any = {}): Promise<WorkflowExpressionResult> {
        // FIXME: this.parameters.seconds is untyped
        let result = this.parameters.seconds;
        if (context) {
            result = this.contextualize(context, result);
        }
        if (this.withResult) {
            result = await this.withResult.compute(result);
        }
        await new Promise(resolve => setTimeout(resolve, result * 1000));
        return new WorkflowExpressionResult("", "", WorkflowExpressionResultType.String, result.toString());
    }
}

export class WorkflowExpressionHTTPRequest extends WorkflowExpression {

    constructor(id: string, name: string, parameters: WorkflowExpressionParameter[], withResult: WorkflowExpression | null = null) {
        super(id, name, parameters, withResult);
    }

    /**
     * 
     * @returns The result of an HTTP request wrapped in a WorkflowExpressionResult.
     */
    public async compute(context: any = {}): Promise<WorkflowExpressionResult> {
        const { url, method, headers, data } = this.parameters;
        const response = await fetch(url, {
            method: method,
            headers: headers,
            body: data
        });
        const json = await response.json();
        let result: any;
        if (this.withResult) {
            result = await this.withResult.compute(json);
        } else {
            result = JSON.stringify(json);
        }
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

