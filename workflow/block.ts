// Google Workflows clone
// Implement Workflow and WorkflowStep classes and export them
// This will be the foundational buiding blocks for the workflow system.
// The workflow definition is stored in a JSON file.

class Workflow {
  public id: string;
  public name: string;
  public steps: WorkflowStep[];
  public createdAt: Date;
  public updatedAt: Date;
  public deletedAt: Date;

  constructor(id: string, name: string, steps: WorkflowStep[], createdAt: Date, updatedAt: Date, deletedAt: Date) {
    this.id = id;
    this.name = name;
    this.steps = steps;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.deletedAt = deletedAt;
  }
}

class WorkflowStep {
  public id: string;
  public name: string;
  public functionObj: WorkflowStepFunction;
  public parameters: WorkflowStepFunctionParameter[];
  public results: WorkflowStepFunctionResult[];
  public createdAt: Date;
  public updatedAt: Date;
  public deletedAt: Date;

  constructor(id: string, name: string, functionObj: WorkflowStepFunction, parameters: WorkflowStepFunctionParameter[], results: WorkflowStepFunctionResult[], createdAt: Date, updatedAt: Date, deletedAt: Date) {
    this.id = id;
    this.name = name;
    this.functionObj = functionObj;
    this.parameters = parameters;
    this.results = results;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.deletedAt = deletedAt;
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

type WorkflowStepFunctionType = string;

export { Workflow, WorkflowStep, WorkflowStepFunction, WorkflowStepFunctionParameter, WorkflowStepFunctionResult, WorkflowStepFunctionType, WorkflowStepFunctionParameterType, WorkflowStepFunctionResult };