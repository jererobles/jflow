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
  public defaultValue: string;
  public description: string;

  constructor(id: string, name: string, type: string, defaultValue: string, description: string) {
    this.id = id;
    this.name = name;
    this.type = type;
    this.defaultValue = defaultValue;
    this.description = description;
  }
}

export class WorkflowExpression {
  public id: string;
  public name: string;
  public type: WorkflowExpressionType;
  public parameters: WorkflowExpressionParameter[];
  public results: WorkflowExpressionResult[];

  constructor(id: string, name: string, type: WorkflowExpressionType, parameters: WorkflowExpressionParameter[], results: WorkflowExpressionResult[]) {
    this.id = id;
    this.name = name;
    this.type = type;
    this.parameters = parameters;
    this.results = results;
  }

  public async compute(parameters?: any): Promise<WorkflowExpressionResult> {
    return new WorkflowExpressionResult('', '', WorkflowExpressionResultType.Number, '0');
  }
}

// WorkflowBlockExpressionMath is a workflow block expression that performs a mathematical operation.
// The mathematical operation can be any operation supported by the imported mathjs library.
// The class takes a `mathExpression` parameter that specifies the mathematical operation to perform.
export class WorkflowExpressionMath extends WorkflowExpression {
  public mathExpression: string;

  constructor(id: string, name: string, type: WorkflowExpressionType, parameters: WorkflowExpressionParameter[], results: WorkflowExpressionResult[], mathExpression: string) {
    super(id, name, type, parameters, results);
    this.mathExpression = mathExpression;
  }

  /**
   * 
   * @returns The result of the mathematical operation wrapped in a WorkflowExpressionResult.
   */
  public async compute(): Promise<WorkflowExpressionResult> {
    const result = math.evaluate(this.mathExpression);
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

