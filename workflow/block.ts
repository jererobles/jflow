// Google Workflows clone
// Implement Workflow and WorkflowBlock classes and export them
// This will be the foundational buiding blocks for the workflow system.
// The workflow definition is stored in a JSON file.

import { WorkflowExpression, WorkflowExpressionParameter as WorkflowExpressionParameter, WorkflowExpressionResult as WorkflowExpressionResult } from "./expression";

export type WorkflowBlockResultType = 'Number' | 'String' | 'Boolean' | 'Array' | 'Object';

export class WorkflowBlock {
  public id: string;
  public name: string;
  public expressions: WorkflowExpression[];
  public parameters: WorkflowBlockParameter[];
  public results: WorkflowExpressionResult[];
  public createdAt: Date;
  public updatedAt: Date;
  public deletedAt: Date;

  constructor(id: string, name: string, expressions: WorkflowExpression[], parameters: WorkflowExpressionParameter[], results: WorkflowExpressionResult[], createdAt: Date, updatedAt: Date, deletedAt: Date) {
    this.id = id;
    this.name = name;
    this.expressions = expressions;
    this.parameters = parameters;
    this.results = results;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.deletedAt = deletedAt;
  }

}

export class WorkflowBlockParameter {
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



export class WorkflowBlockResult {
    public id: string;
    public name: string;
    public type: WorkflowBlockResultType;
    public value: string;
  
    constructor(id: string, name: string, type: WorkflowBlockResultType, value: string) {
      this.id = id;
      this.name = name;
      this.type = type;
      this.value = value;
    }
  }
  
  