// Google Workflows clone
// Do a PoC of https://cloud.google.com/workflows/docs/ style asynchronous long-standing task orchestration.
// The idea is to define the steps of a flow using a meta language/JSON/YAML descriptor (syntax can be whatever you decide, as close to or different from the Google implementation as you like), then have a runner that can interpret and execute these steps. You can decide how many different function types you want to implement, but some dynamic parameters and passing parameters between steps would be nice.
// The user can then start an instance of the flow with an API call, which then causes the system to run the defined functions in the backend step by step.
// The execution state should eventually be saved in a database, but can be stored in memory for the PoC. A step can take as long as it needs to finish, and the user should be able to query an API for the flow execution state.
// If you want to show off your frontend skills, you can create some sort of visualization for the execution state, or for constructing the workflow definition.
// Code with Node.js + TypeScript and deploy wherever.
// The workflow definition is stored in a JSON file.

// Import the required modules
import { Workflow, WorkflowStep, WorkflowStepFunction, WorkflowStepFunctionType, WorkflowStepFunctionParameter } from './workflow';
