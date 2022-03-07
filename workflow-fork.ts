// Implement workflow forks
// A workflow fork is a logical statement that can be evaluated to determine if a workflow step should be executed.
// The statement is evaluated by the workflow engine.
// A workflow fork type can be any of the following:
// - Simple: A simple statement is a logical expression that can be evaluated to determine if a workflow step should be executed.
// - Mapped: A mapped statement maps block results to a specific workflow step.

type WorkflowForkType = 'simple' | 'mapped';

class WorkflowFork {
    public id: string;
    public name: string;
    public type: WorkflowForkType;
    public block: string;
    public statement: string;
    public mapping: any;


    constructor(id: string, name: string, type: WorkflowForkType, block: string, statement: string, mapping: any) {
        this.id = id;
        this.name = name;
        this.type = type;
        this.block = block;
        this.statement = statement;
        this.mapping = mapping;
    }
}