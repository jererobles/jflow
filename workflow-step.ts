// Implement workflow step function types.
// A workflow step takes a set of parameters, performs some computation, and returns a set of results.
// A workflow step computation depends on the type of the workflow step function.
// Workflow step function types: Math, Data, and Control.
import math from 'mathjs';

/**
 * There are 3 WorkflowStepFunctionTypes: Math, Data, and Control.
 * Math: A workflow step function that performs some mathematical computation, such as:
 *  - (pi * e)^x
 *  - sin(x)
 *  - max(x, y)
 * Data: A workflow step function that reads and writes data, such as:
 *  - Reading and writing a file or a database.
 *  - Reading and writing a message queue.
 *  - Requesting and receiving a web service.
 * Control: A workflow step function that performs some control operation, such as:
 *  - Wait for a certain amount of time.
 *  - Execute a workflow step.
 *  - End the workflow.
 */
type WorkflowStepFunctionType = 'Math' | 'Data' | 'Control';
type WorkflowStepFunctionResultType = 'Number' | 'String' | 'Boolean' | 'Array' | 'Object';

class WorkflowStepFunctionParameter {
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

class WorkflowStepFunction {
    public id: string;
    public name: string;
    public type: WorkflowStepFunctionType;
    public parameters: WorkflowStepFunctionParameter[];
    public results: WorkflowStepFunctionResult[];
    public createdAt: Date;
    public updatedAt: Date;
    public deletedAt: Date;

    constructor(id: string, name: string, type: WorkflowStepFunctionType, parameters: WorkflowStepFunctionParameter[], results: WorkflowStepFunctionResult[], createdAt: Date, updatedAt: Date, deletedAt: Date) {
        this.id = id;
        this.name = name;
        this.type = type;
        this.parameters = parameters;
        this.results = results;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.deletedAt = deletedAt;
    }
}

// WorkflowStepFunctionMath is a workflow step function that performs a mathematical operation.
// The mathematical operation can be any operation supported by the imported mathjs library.
// The class takes a `mathExpression` parameter that specifies the mathematical operation to perform.
class WorkflowStepFunctionMath extends WorkflowStepFunction {
    public mathExpression: string;

    constructor(id: string, name: string, type: WorkflowStepFunctionType, parameters: WorkflowStepFunctionParameter[], results: WorkflowStepFunctionResult[], createdAt: Date, updatedAt: Date, deletedAt: Date, mathExpression: string) {
        super(id, name, type, parameters, results, createdAt, updatedAt, deletedAt);
        this.mathExpression = mathExpression;
    }

    public compute(): string {
        return math.evaluate(this.mathExpression);
    }
}


class WorkflowStepFunctionResult {
    public id: string;
    public name: string;
    public type: WorkflowStepFunctionResultType;
    public value: string;
  
    constructor(id: string, name: string, type: WorkflowStepFunctionResultType, value: string) {
      this.id = id;
      this.name = name;
      this.type = type;
      this.value = value;
    }
  }
  
  