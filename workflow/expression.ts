// Implement workflow block expression types.
// A workflow block takes a set of parameters, performs some computation, and returns a set of results.
// A workflow block computation depends on the type of the workflow block expression.
// Workflow block expression types: Math, Data, and Control.
import math from 'mathjs';

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
type WorkflowBlockExpressionType = 'Math' | 'Data' | 'Control';
type WorkflowBlockExpressionResultType = 'Number' | 'String' | 'Boolean' | 'Array' | 'Object';

class WorkflowBlockExpressionParameter {
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

class WorkflowBlockExpression {
    public id: string;
    public name: string;
    public type: WorkflowBlockExpressionType;
    public parameters: WorkflowBlockExpressionParameter[];
    public results: WorkflowBlockExpressionResult[];

    constructor(id: string, name: string, type: WorkflowBlockExpressionType, parameters: WorkflowBlockExpressionParameter[], results: WorkflowBlockExpressionResult[]) {
        this.id = id;
        this.name = name;
        this.type = type;
        this.parameters = parameters;
        this.results = results;
    }
}

// WorkflowBlockExpressionMath is a workflow block expression that performs a mathematical operation.
// The mathematical operation can be any operation supported by the imported mathjs library.
// The class takes a `mathExpression` parameter that specifies the mathematical operation to perform.
class WorkflowBlockExpressionMath extends WorkflowBlockExpression {
    public mathExpression: string;

    constructor(id: string, name: string, type: WorkflowBlockExpressionType, parameters: WorkflowBlockExpressionParameter[], results: WorkflowBlockExpressionResult[], mathExpression: string) {
        super(id, name, type, parameters, results);
        this.mathExpression = mathExpression;
    }

    public compute(): string {
        return math.evaluate(this.mathExpression);
    }
}


class WorkflowBlockExpressionResult {
    public id: string;
    public name: string;
    public type: WorkflowBlockExpressionResultType;
    public value: string;
  
    constructor(id: string, name: string, type: WorkflowBlockExpressionResultType, value: string) {
      this.id = id;
      this.name = name;
      this.type = type;
      this.value = value;
    }
  }
  
  