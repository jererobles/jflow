// Google Workflows clone
// Implement Workflow and WorkflowBlock classes and export them
// This will be the foundational buiding blocks for the workflow system.
// The workflow definition is stored in a JSON file.

import { WorkflowBlock } from "./block";
export class Workflow {
    public id: string;
    public name: string;
    public blocks: WorkflowBlock[];
    public createdAt: Date;
    public updatedAt: Date;
    public deletedAt: Date;

    constructor(id: string, name: string, blocks: WorkflowBlock[], createdAt: Date, updatedAt: Date, deletedAt: Date) {
        this.id = id;
        this.name = name;
        this.blocks = blocks;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.deletedAt = deletedAt;
    }
}

export class WorkflowResult {
    public id: string;
    public name: string;
    public results: any;
    public createdAt: Date;
    public updatedAt: Date;
    public deletedAt: Date;

    constructor(id: string, name: string, results: any, createdAt: Date, updatedAt: Date, deletedAt: Date) {
        this.id = id;
        this.name = name;
        this.results = results;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.deletedAt = deletedAt;
    }
}