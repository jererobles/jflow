// Implement workflow step conditions
// A workflow step condition is a logical expression that can be evaluated to determine if a workflow step should be executed.
// The condition is evaluated by the workflow engine.
// A workflow step condition type can be any of the following:
// - Simple: A simple condition is a logical expression that can be evaluated to determine if a workflow step should be executed.
// - Mapped: A mapped condition maps block results to a specific workflow step.

type WorkflowConditionType = 'simple' | 'mapped';

class WorkflowCondition {
  public id: string;
  public name: string;
  public type: WorkflowConditionType;
  public value: string;

  constructor(id: string, name: string, type: WorkflowConditionType, value: string) {
    this.id = id;
    this.name = name;
    this.type = type;
    this.value = value;
  }
}