// Google Workflows clone
// Implement Workflow and WorkflowBlock classes and export them
// This will be the foundational buiding blocks for the workflow system.
// The workflow definition is stored in a JSON file.

import { WorkflowExpression, WorkflowExpressionParameter as WorkflowExpressionParameter, WorkflowExpressionResult as WorkflowExpressionResult } from "./expression";
import { WorkflowFork } from "./fork";

export type WorkflowBlockResultType = 'Number' | 'String' | 'Boolean' | 'Array' | 'Object';

export class WorkflowBlock {
    public id: string;
    public name: string;
    public expressions: WorkflowExpression[];
    public forks: WorkflowFork[];
    // TODO: implement. inlineBlocks are executed first and they don't participate in the block's fork, but they can have a result that can be passed to their own fork.
    public parentBlocks: string[];
    public parameters: WorkflowBlockParameter[];
    public results: WorkflowExpressionResult[] = [];
    public createdAt: Date;
    public updatedAt: Date;
    public deletedAt: Date;

    constructor(id: string, name: string, expressions: WorkflowExpression[], forks: WorkflowFork[] = [], parentBlocks: string[], parameters: WorkflowExpressionParameter[], createdAt: Date, updatedAt: Date, deletedAt: Date) {
        this.id = id;
        this.name = name;
        this.expressions = expressions;
        this.forks = forks;
        this.parentBlocks = parentBlocks;
        this.parameters = parameters;
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
    public value: any;

    constructor(id: string, name: string, type: WorkflowBlockResultType, value: any) {
        this.id = id;
        this.name = name;
        this.type = type;
        this.value = value;
    }
}

