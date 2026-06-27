import "./styles.css";
import YAML from "yaml";

import fetchAndPrintSample from "./samples/fetchAndPrint.yml?raw";
import mathAndForkSample from "./samples/mathAndFork.yml?raw";
import { WorkflowParser } from "./workflow/parser";
import { WorkflowRunner } from "./workflow/runner";

const samples: Record<string, string> = {
  mathAndFork: mathAndForkSample,
  fetchAndPrint: fetchAndPrintSample,
};

const app = document.querySelector<HTMLDivElement>("#app");

if (!app) {
  throw new Error("App container not found.");
}

app.innerHTML = `
  <main class="shell">
    <section class="hero">
      <h1>JFlow in the browser</h1>
      <p>
        Load a workflow definition, run it in the browser, and inspect the execution
        result without any server process.
      </p>
    </section>
    <section class="workspace">
      <section class="panel">
        <h2>Workflow definition</h2>
        <div class="toolbar">
          <label for="sample-select">Sample</label>
          <select id="sample-select">
            <option value="mathAndFork">Math and fork</option>
            <option value="fetchAndPrint">Fetch and print</option>
          </select>
          <span class="meta">Edit the YAML directly before running.</span>
        </div>
        <textarea id="workflow-source" spellcheck="false"></textarea>
        <div class="actions">
          <button id="run-workflow" class="button button-primary" type="button">Run workflow</button>
          <button id="reset-workflow" class="button button-secondary" type="button">Reset sample</button>
        </div>
        <div id="run-status" class="status">Ready</div>
      </section>
      <aside class="stack">
        <section class="panel">
          <h3>Workflow summary</h3>
          <ul id="workflow-meta" class="meta-list"></ul>
        </section>
        <section class="panel">
          <h3>Execution log</h3>
          <pre id="execution-log" class="output">No blocks have finished yet.</pre>
        </section>
        <section class="panel">
          <h3>Result</h3>
          <pre id="execution-result" class="output">Run a workflow to see the result.</pre>
        </section>
      </aside>
    </section>
  </main>
`;

const sampleSelect = document.querySelector<HTMLSelectElement>("#sample-select");
const sourceField = document.querySelector<HTMLTextAreaElement>("#workflow-source");
const runButton = document.querySelector<HTMLButtonElement>("#run-workflow");
const resetButton = document.querySelector<HTMLButtonElement>("#reset-workflow");
const statusLabel = document.querySelector<HTMLDivElement>("#run-status");
const metaList = document.querySelector<HTMLUListElement>("#workflow-meta");
const logOutput = document.querySelector<HTMLPreElement>("#execution-log");
const resultOutput = document.querySelector<HTMLPreElement>("#execution-result");

if (!sampleSelect || !sourceField || !runButton || !resetButton || !statusLabel || !metaList || !logOutput || !resultOutput) {
  throw new Error("App controls not found.");
}

const renderMeta = () => {
  try {
    const parsed = YAML.parse(sourceField.value);
    const blocks = Array.isArray(parsed?.blocks) ? parsed.blocks.length : 0;
    metaList.innerHTML = `
      <li><strong>ID:</strong> ${parsed?.id ?? "Unknown"}</li>
      <li><strong>Name:</strong> ${parsed?.name ?? "Unknown"}</li>
      <li><strong>Blocks:</strong> ${blocks}</li>
    `;
  } catch {
    metaList.innerHTML = `
      <li><strong>Status:</strong> Invalid YAML</li>
    `;
  }
};

const setSample = (key: string) => {
  sourceField.value = samples[key] ?? samples.mathAndFork;
  logOutput.textContent = "No blocks have finished yet.";
  resultOutput.textContent = "Run a workflow to see the result.";
  setStatus("Ready", "status");
  renderMeta();
};

const setStatus = (message: string, className: string) => {
  statusLabel.textContent = message;
  statusLabel.className = className;
};

sampleSelect.addEventListener("change", () => {
  setSample(sampleSelect.value);
});

sourceField.addEventListener("input", renderMeta);

resetButton.addEventListener("click", () => {
  setSample(sampleSelect.value);
});

runButton.addEventListener("click", async () => {
  setStatus("Running workflow…", "status status-running");
  runButton.disabled = true;
  logOutput.textContent = "Waiting for completed blocks…";
  resultOutput.textContent = "Running…";

  try {
    const workflowDefinition = YAML.parse(sourceField.value);
    const workflow = WorkflowParser.parse(workflowDefinition);
    const runner = new WorkflowRunner(workflow);
    const blockLogs: string[] = [];

    runner.onBlockFinished = (block, result) => {
      blockLogs.push(`${block.id}: ${JSON.stringify(result.value)}`);
      logOutput.textContent = blockLogs.join("\n");
    };

    const result = await runner.run();
    resultOutput.textContent = JSON.stringify(result, null, 2);
    if (!blockLogs.length) {
      logOutput.textContent = "Workflow completed without block output.";
    }
    setStatus("Workflow completed.", "status status-success");
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    resultOutput.textContent = message;
    setStatus("Workflow failed.", "status status-error");
  } finally {
    runButton.disabled = false;
    renderMeta();
  }
});

setSample("mathAndFork");
