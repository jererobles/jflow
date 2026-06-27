/** Properties panel – edit selected node (bottom sheet on mobile) */

import { getState, updateNode, removeNode, subscribe, setState } from "./state";
import { ExpressionData, ForkBranchData, ForkData, NodeData } from "./types";
import { EXPRESSION_LIBRARY, createExpression, fallbackExpressionName } from "./expressionTemplates";
import { generateId } from "./ids";
import { createBlockReferenceLookup, ensureUniqueReferenceKey, resolveExpressionReferenceKey, toReferenceKey } from "../workflow/referenceKeys";

let panelEl: HTMLDivElement;
let currentNodeId: string | null = null;
const STANDALONE_RESULT_TOKEN = /(^|[^A-Za-z0-9_])\$result(?=[^A-Za-z0-9_]|$)/g;

export function initPanel(container: HTMLElement) {
  panelEl = document.createElement("div");
  panelEl.className = "jf-panel jf-collapsible";
  panelEl.innerHTML = renderPlaceholder();
  container.appendChild(panelEl);

  panelEl.addEventListener("click", handleClick);
  panelEl.addEventListener("input", handleInput);
  panelEl.addEventListener("change", handleChange);

  subscribe(() => {
    const { selectedNodeId, nodes } = getState();
    const selectedNode = nodes.find((node) => node.id === selectedNodeId) ?? null;
    const nextNodeId = selectedNode?.id ?? null;
    if (nextNodeId !== currentNodeId) {
      currentNodeId = nextNodeId;
      renderPanel(selectedNode);
    }
  });
}

function renderPanel(node: NodeData | null) {
  if (!node) {
    panelEl.innerHTML = renderPlaceholder();
    panelEl.classList.remove("jf-panel--open");
    return;
  }

  panelEl.classList.add("jf-panel--open");

  const execState = getState().executionStates[node.id];
  const stateLabel = execState ? `<span class="jf-panel__state jf-panel__state--${execState.state}">${execState.state}</span>` : "";
  const isCollapsed = panelEl.classList.contains("jf-collapsible--collapsed");
  const headerIcon = isCollapsed ? "▸" : "▾";
  const parentOptions = getParentOptions(node);

  panelEl.innerHTML = `
    <div class="jf-collapsible__header">
      <button class="jf-collapsible__toggle" aria-label="Toggle Properties">${headerIcon}</button>
      <span class="jf-collapsible__title">Node Properties</span>
      <button class="jf-panel__close" aria-label="Close" data-action="close">✕</button>
    </div>
    <div class="jf-collapsible__body">
      <div class="jf-panel__body">
        <label class="jf-field">
          <span class="jf-field__label">Name</span>
          <input class="jf-field__input" type="text" value="${escapeAttr(node.name)}" data-field="name" />
        </label>
        <div class="jf-field">
          <span class="jf-field__label">Parents</span>
          <div class="jf-reference-list">
            ${parentOptions
              .map(
                (option) => `
              <button
                class="jf-reference-chip ${option.active ? "jf-reference-chip--active" : ""}"
                data-action="toggle-parent"
                data-parent-id="${escapeAttr(option.id)}"
              >
                ${escapeHtml(option.label)}
              </button>
            `
              )
              .join("")}
          </div>
        </div>
        <div class="jf-field">
          <div class="jf-section__header">
            <span class="jf-field__label">Expressions ${stateLabel}</span>
            <div class="jf-inline-controls">
              <select class="jf-field__input jf-field__input--compact" data-field="new-expression-type">
                ${EXPRESSION_LIBRARY.map(
                  (expression) => `
                    <option value="${expression.expressionType}">${expression.label}</option>
                  `
                ).join("")}
              </select>
              <button class="jf-btn" data-action="add-expression">Add</button>
            </div>
          </div>
          <div class="jf-stack">
            ${node.expressions
              .map((expression, expressionIndex) => renderExpression(node, expression, expressionIndex))
              .join("")}
          </div>
        </div>
        <div class="jf-field">
          <div class="jf-section__header">
            <span class="jf-field__label">Forks</span>
            <button class="jf-btn" data-action="add-fork">Add Fork</button>
          </div>
          <div class="jf-stack">
            ${node.forks.length === 0 ? `<div class="jf-panel__hint">Add a fork to create decision branches.</div>` : ""}
            ${node.forks.map((fork, forkIndex) => renderFork(node, fork, forkIndex)).join("")}
          </div>
        </div>
        <div class="jf-panel__actions">
          <button class="jf-btn jf-btn--danger" data-action="delete">Delete Node</button>
        </div>
      </div>
    </div>
  `;
}

function renderExpression(node: NodeData, expression: ExpressionData, expressionIndex: number): string {
  const referenceOptions = getReferenceOptions(node, expressionIndex);

  return `
    <div class="jf-expr">
      <div class="jf-card__header">
        <span class="jf-expr__type">${escapeHtml(expression.type)}</span>
        <button
          class="jf-btn jf-btn--ghost jf-btn--danger"
          data-action="remove-expression"
          data-expression-index="${expressionIndex}"
          aria-label="${node.expressions.length === 1 ? "Cannot remove last expression" : "Remove expression"}"
          title="${node.expressions.length === 1 ? "A block needs at least one expression" : "Remove expression"}"
          ${node.expressions.length === 1 ? "disabled" : ""}
        >
          Remove
        </button>
      </div>
      <label class="jf-field">
        <span class="jf-field__label">Result Key</span>
        <input
          class="jf-field__input"
          type="text"
          value="${escapeAttr(expression.name)}"
          data-expression-index="${expressionIndex}"
          data-expression-field="name"
        />
      </label>
      <label class="jf-field">
        <span class="jf-field__label">Type</span>
        <select class="jf-field__input" data-expression-index="${expressionIndex}" data-expression-field="type">
          ${EXPRESSION_LIBRARY.map(
            (option) => `
            <option value="${option.expressionType}" ${option.expressionType === expression.type ? "selected" : ""}>${option.label}</option>
          `
          ).join("")}
        </select>
      </label>
      ${expression.parameters
        .map(
          (parameter) => `
          <label class="jf-field jf-field--nested">
            <span class="jf-field__label">${escapeHtml(parameter.name)}</span>
            <input
              class="jf-field__input"
              type="text"
              value="${escapeAttr(parameter.value)}"
              data-expression-index="${expressionIndex}"
              data-param-name="${escapeAttr(parameter.name)}"
            />
          </label>
        `
        )
        .join("")}
      ${
        referenceOptions.length > 0
          ? `
        <div class="jf-field jf-field--nested">
          <span class="jf-field__label">Reference values</span>
          <div class="jf-reference-list">
            ${referenceOptions
              .map(
                (reference) => `
                <button
                  class="jf-reference-chip"
                  data-action="insert-reference"
                  data-expression-index="${expressionIndex}"
                  data-reference="${escapeAttr(reference.template)}"
                >
                  ${escapeHtml(reference.label)}
                </button>
              `
              )
              .join("")}
          </div>
        </div>
      `
          : ""
      }
    </div>
  `;
}

function renderFork(node: NodeData, fork: ForkData, forkIndex: number): string {
  return `
    <div class="jf-fork">
      <div class="jf-card__header">
        <label class="jf-field jf-field--fill">
          <span class="jf-field__label">Fork Name</span>
          <input
            class="jf-field__input"
            type="text"
            value="${escapeAttr(fork.name)}"
            data-fork-index="${forkIndex}"
            data-fork-field="name"
          />
        </label>
        <button class="jf-btn jf-btn--ghost jf-btn--danger" data-action="remove-fork" data-fork-index="${forkIndex}">Remove</button>
      </div>
      <div class="jf-stack">
        ${fork.branches.map((branch, branchIndex) => renderForkBranch(node, branch, forkIndex, branchIndex)).join("")}
        <button class="jf-btn" data-action="add-branch" data-fork-index="${forkIndex}">Add Branch</button>
      </div>
    </div>
  `;
}

function renderForkBranch(node: NodeData, branch: ForkBranchData, forkIndex: number, branchIndex: number): string {
  const branchTargets = getBranchTargets(node);
  const branchReferences = getForkReferenceOptions(node);

  return `
    <div class="jf-fork-branch">
      <div class="jf-card__header">
        <span class="jf-field__label">Branch ${branchIndex + 1}</span>
        <button
          class="jf-btn jf-btn--ghost jf-btn--danger"
          data-action="remove-branch"
          data-fork-index="${forkIndex}"
          data-branch-index="${branchIndex}"
        >
          Remove
        </button>
      </div>
      <label class="jf-field">
        <span class="jf-field__label">Condition</span>
        <textarea
          class="jf-field__input jf-field__textarea"
          data-fork-index="${forkIndex}"
          data-branch-index="${branchIndex}"
          data-branch-field="statement"
          rows="3"
        >${escapeHtml(stringifyStatement(branch.statement))}</textarea>
      </label>
      ${
        branchReferences.length > 0
          ? `
        <div class="jf-field">
          <span class="jf-field__label">Reference values</span>
          <div class="jf-reference-list">
            ${branchReferences
              .map(
                (reference) => `
                <button
                  class="jf-reference-chip"
                  data-action="insert-branch-reference"
                  data-fork-index="${forkIndex}"
                  data-branch-index="${branchIndex}"
                  data-reference="${escapeAttr(reference.forkToken)}"
                >
                  ${escapeHtml(reference.label)}
                </button>
              `
              )
              .join("")}
          </div>
        </div>
      `
          : ""
      }
      <div class="jf-field">
        <span class="jf-field__label">If true</span>
        <div class="jf-reference-list">
          ${branchTargets
            .map((target) =>
              renderTargetChip(target.id, target.label, branch.resultTrueBlocks.includes(target.id), forkIndex, branchIndex, "true")
            )
            .join("")}
        </div>
      </div>
      <div class="jf-field">
        <span class="jf-field__label">If false</span>
        <div class="jf-reference-list">
          ${branchTargets
            .map((target) =>
              renderTargetChip(target.id, target.label, branch.resultFalseBlocks.includes(target.id), forkIndex, branchIndex, "false")
            )
            .join("")}
        </div>
      </div>
    </div>
  `;
}

function renderTargetChip(
  id: string,
  label: string,
  active: boolean,
  forkIndex: number,
  branchIndex: number,
  branchType: "true" | "false"
): string {
  return `
    <button
      class="jf-reference-chip ${active ? "jf-reference-chip--active" : ""}"
      data-action="toggle-branch-target"
      data-fork-index="${forkIndex}"
      data-branch-index="${branchIndex}"
      data-branch-target-type="${branchType}"
      data-target-id="${escapeAttr(id)}"
    >
      ${escapeHtml(label)}
    </button>
  `;
}

function handleClick(event: Event) {
  const target = event.target as HTMLElement;

  if (target.closest(".jf-collapsible__toggle")) {
    panelEl.classList.toggle("jf-collapsible--collapsed");
    const btn = panelEl.querySelector(".jf-collapsible__toggle");
    if (btn) btn.textContent = panelEl.classList.contains("jf-collapsible--collapsed") ? "▸" : "▾";
    return;
  }

  const actionEl = target.closest<HTMLElement>("[data-action]");
  if (!actionEl) return;

  const action = actionEl.dataset.action;
  const node = getCurrentNode();
  if (!node) return;

  switch (action) {
    case "close":
      setState({ selectedNodeId: null });
      return;
    case "delete":
      removeNode(node.id);
      return;
    case "add-expression": {
      const type = (panelEl.querySelector('[data-field="new-expression-type"]') as HTMLSelectElement | null)?.value ?? "Math";
      forcePanelRefresh();
      updateNode(node.id, { expressions: [...node.expressions, createExpression(type, node.expressions)] });
      return;
    }
    case "remove-expression": {
      if (node.expressions.length === 1) return;
      const expressionIndex = Number(actionEl.dataset.expressionIndex);
      forcePanelRefresh();
      updateNode(node.id, { expressions: node.expressions.filter((_, index) => index !== expressionIndex) });
      return;
    }
    case "add-fork":
      forcePanelRefresh();
      updateNode(node.id, {
        forks: [
          ...node.forks,
          {
            id: generateId("fork"),
            name: `Fork ${node.forks.length + 1}`,
            branches: [createForkBranch()],
          },
        ],
      });
      return;
    case "remove-fork": {
      const forkIndex = Number(actionEl.dataset.forkIndex);
      forcePanelRefresh();
      updateNode(node.id, { forks: node.forks.filter((_, index) => index !== forkIndex) });
      return;
    }
    case "add-branch": {
      const forkIndex = Number(actionEl.dataset.forkIndex);
      forcePanelRefresh();
      const forks = node.forks.map((fork, index) =>
        index === forkIndex ? { ...fork, branches: [...fork.branches, createForkBranch()] } : fork
      );
      updateNode(node.id, { forks });
      return;
    }
    case "remove-branch": {
      const forkIndex = Number(actionEl.dataset.forkIndex);
      const branchIndex = Number(actionEl.dataset.branchIndex);
      forcePanelRefresh();
      const forks = node.forks.map((fork, index) =>
        index === forkIndex
          ? { ...fork, branches: fork.branches.filter((_, nestedIndex) => nestedIndex !== branchIndex) }
          : fork
      );
      updateNode(node.id, { forks });
      return;
    }
    case "toggle-parent": {
      const parentId = actionEl.dataset.parentId!;
      const nextParents = node.parentBlocks.includes(parentId)
        ? node.parentBlocks.filter((parent) => parent !== parentId)
        : [...node.parentBlocks, parentId];
      forcePanelRefresh();
      updateNode(node.id, { parentBlocks: dedupeIds(nextParents) });
      return;
    }
    case "toggle-branch-target": {
      const forkIndex = Number(actionEl.dataset.forkIndex);
      const branchIndex = Number(actionEl.dataset.branchIndex);
      const branchType = actionEl.dataset.branchTargetType as "true" | "false";
      const targetId = actionEl.dataset.targetId!;
      forcePanelRefresh();
      updateNode(node.id, {
        forks: node.forks.map((fork, index) => {
          if (index !== forkIndex) return fork;
          return {
            ...fork,
            branches: fork.branches.map((branch, nestedIndex) => {
              if (nestedIndex !== branchIndex) return branch;
              const currentTargets = branchType === "true" ? branch.resultTrueBlocks : branch.resultFalseBlocks;
              const nextTargets = currentTargets.includes(targetId)
                ? currentTargets.filter((id) => id !== targetId)
                : [...currentTargets, targetId];
              return branchType === "true"
                ? { ...branch, resultTrueBlocks: dedupeIds(nextTargets) }
                : { ...branch, resultFalseBlocks: dedupeIds(nextTargets) };
            }),
          };
        }),
      });
      return;
    }
    case "insert-reference": {
      const expressionIndex = Number(actionEl.dataset.expressionIndex);
      const reference = actionEl.dataset.reference ?? "";
      forcePanelRefresh();
      const expressions = node.expressions.map((expression, index) =>
        index !== expressionIndex
          ? expression
          : {
              ...expression,
              parameters: expression.parameters.map((parameter, parameterIndex) =>
                parameterIndex === 0 ? { ...parameter, value: appendReference(parameter.value, reference) } : parameter
              ),
            }
      );
      updateNode(node.id, { expressions });
      return;
    }
    case "insert-branch-reference": {
      const forkIndex = Number(actionEl.dataset.forkIndex);
      const branchIndex = Number(actionEl.dataset.branchIndex);
      const reference = actionEl.dataset.reference ?? "";
      forcePanelRefresh();
      updateNode(node.id, {
        forks: node.forks.map((fork, index) =>
          index !== forkIndex
            ? fork
            : {
                ...fork,
                branches: fork.branches.map((branch, nestedIndex) =>
                  nestedIndex !== branchIndex
                    ? branch
                    : {
                        ...branch,
                        statement: insertBranchReference(branch.statement, reference),
                      }
                ),
              }
        ),
      });
      return;
    }
  }
}

function handleInput(event: Event) {
  const target = event.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
  const node = getCurrentNode();
  if (!node) return;

  if (target.dataset.paramName) {
    const expressionIndex = Number(target.dataset.expressionIndex);
    const paramName = target.dataset.paramName;
    updateNode(node.id, {
      expressions: node.expressions.map((expression, index) =>
        index !== expressionIndex
          ? expression
          : {
              ...expression,
              parameters: expression.parameters.map((parameter) =>
                parameter.name === paramName ? { ...parameter, value: target.value } : parameter
              ),
            }
      ),
    });
    return;
  }

  if (target.dataset.forkField === "name") {
    const forkIndex = Number(target.dataset.forkIndex);
    updateNode(node.id, {
      forks: node.forks.map((fork, index) => (index === forkIndex ? { ...fork, name: target.value } : fork)),
    });
    return;
  }

  if (target.dataset.branchField === "statement") {
    const forkIndex = Number(target.dataset.forkIndex);
    const branchIndex = Number(target.dataset.branchIndex);
    updateNode(node.id, {
      forks: node.forks.map((fork, index) =>
        index !== forkIndex
          ? fork
          : {
              ...fork,
              branches: fork.branches.map((branch, nestedIndex) =>
                nestedIndex === branchIndex ? { ...branch, statement: target.value } : branch
              ),
            }
      ),
    });
  }
}

function handleChange(event: Event) {
  const target = event.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
  const node = getCurrentNode();
  if (!node) return;

  if (target.dataset.field === "name") {
    renameNodeDisplay(node, target.value);
    return;
  }

  if (target.dataset.expressionField === "name") {
    const expressionIndex = Number(target.dataset.expressionIndex);
    renameExpressionResult(node, expressionIndex, target.value);
    return;
  }

  if (target.dataset.expressionField === "type") {
    const expressionIndex = Number(target.dataset.expressionIndex);
    forcePanelRefresh();
    updateNode(node.id, {
      expressions: node.expressions.map((expression, index) =>
        index === expressionIndex
          ? {
              ...expression,
              type: target.value,
              parameters: createExpression(target.value).parameters,
            }
          : expression
      ),
    });
    return;
  }

  if (target.dataset.branchField === "statement") {
    const forkIndex = Number(target.dataset.forkIndex);
    const branchIndex = Number(target.dataset.branchIndex);
    forcePanelRefresh();
    updateNode(node.id, {
      forks: node.forks.map((fork, index) =>
        index !== forkIndex
          ? fork
          : {
              ...fork,
              branches: fork.branches.map((branch, nestedIndex) =>
                nestedIndex === branchIndex ? { ...branch, statement: parseStatementInput(target.value) } : branch
              ),
            }
      ),
    });
  }
}

function renameNodeDisplay(node: NodeData, nextValue: string) {
  const nextName = nextValue.trim() || node.name;
  if (nextName === node.name) {
    updateNode(node.id, { name: nextName });
    return;
  }

  const { nodes } = getState();
  const renamedNodes = nodes.map((candidate) => (candidate.id === node.id ? { ...candidate, name: nextName } : candidate));
  applyReferenceAwareNodes(nodes, renamedNodes);
}

function renameExpressionResult(node: NodeData, expressionIndex: number, nextValue: string) {
  const expression = node.expressions[expressionIndex];
  if (!expression) return;

  const nextName = getNormalizedExpressionName(node, expressionIndex, nextValue);
  if (nextName === expression.name) {
    updateNode(node.id, {
      expressions: node.expressions.map((candidate, index) =>
        index === expressionIndex ? { ...candidate, name: nextName } : candidate
      ),
    });
    return;
  }

  const nextExpressions = node.expressions.map((candidate, index) =>
    index === expressionIndex ? { ...candidate, name: nextName } : candidate
  );
  const { nodes } = getState();
  const renamedNodes = nodes.map((candidate) =>
    candidate.id === node.id ? { ...candidate, expressions: nextExpressions } : candidate
  );
  applyReferenceAwareNodes(nodes, renamedNodes);
}

function applyReferenceAwareNodes(previousNodes: NodeData[], nextNodes: NodeData[]) {
  forcePanelRefresh();
  setState({ nodes: rewriteReferences(previousNodes, nextNodes) });
}

function rewriteReferences(previousNodes: NodeData[], nextNodes: NodeData[]): NodeData[] {
  const previousBlockReferences = createBlockReferenceLookup(previousNodes);
  const nextBlockReferences = createBlockReferenceLookup(nextNodes);
  const blockChanges = previousNodes
    .map((node) => ({
      previous: previousBlockReferences.get(node.id) ?? node.id,
      next: nextBlockReferences.get(node.id) ?? node.id,
    }))
    .filter((change) => change.previous !== change.next);

  const expressionChanges = previousNodes.flatMap((previousNode) => {
    const nextNode = nextNodes.find((candidate) => candidate.id === previousNode.id);
    if (!nextNode) return [];

    const previousExpressions = createExpressionReferenceLookup(previousNode.expressions);
    const nextExpressions = createExpressionReferenceLookup(nextNode.expressions);
    const previousBlockKey = previousBlockReferences.get(previousNode.id) ?? previousNode.id;
    const nextBlockKey = nextBlockReferences.get(previousNode.id) ?? previousNode.id;

    return previousNode.expressions
      .map((expression) => {
        const previousKey = previousExpressions.get(expression.id);
        const nextKey = nextExpressions.get(expression.id);
        if (!previousKey || !nextKey || previousKey === nextKey) return null;
        return { previousBlockKey, nextBlockKey, previousKey, nextKey };
      })
      .filter((change): change is NonNullable<typeof change> => Boolean(change));
  });

  if (blockChanges.length === 0 && expressionChanges.length === 0) {
    return nextNodes;
  }

  return nextNodes.map((node) => ({
    ...node,
    expressions: node.expressions.map((expression) => ({
      ...expression,
      parameters: expression.parameters.map((parameter) => ({
        ...parameter,
        value: rewriteReferenceText(parameter.value, blockChanges, expressionChanges),
      })),
    })),
    forks: node.forks.map((fork) => ({
      ...fork,
      branches: fork.branches.map((branch) => ({
        ...branch,
        statement: rewriteBranchStatement(branch.statement, blockChanges, expressionChanges),
      })),
    })),
  }));
}

function rewriteBranchStatement(
  statement: any,
  blockChanges: ReferenceChange[],
  expressionChanges: ExpressionReferenceChange[]
) {
  const rewritten = rewriteReferenceText(stringifyStatement(statement), blockChanges, expressionChanges);
  return typeof statement === "string" ? rewritten : parseStatementInput(rewritten);
}

function rewriteReferenceText(
  value: string,
  blockChanges: ReferenceChange[],
  expressionChanges: ExpressionReferenceChange[]
): string {
  let nextValue = value;

  for (const change of blockChanges) {
    // `{{...}}` references are template interpolations inside expression inputs,
    // while `$...` references are fork tokens evaluated by the branching engine.
    const blockForkPattern = new RegExp(`\\$blocks\\.${escapeRegex(change.previous)}\\.`, "g");
    const legacyBlockForkPattern = new RegExp(`\\$${escapeRegex(change.previous)}\\.`, "g");
    nextValue = replaceAll(nextValue, `{{blocks.${change.previous}.`, `{{blocks.${change.next}.`);
    nextValue = nextValue.replace(blockForkPattern, `$blocks.${change.next}.`);
    nextValue = replaceAll(nextValue, `{{${change.previous}.`, `{{${change.next}.`);
    nextValue = nextValue.replace(legacyBlockForkPattern, `$${change.next}.`);
  }

  for (const change of expressionChanges) {
    const currentForkPattern = new RegExp(`\\$current\\.${escapeRegex(change.previousKey)}(?=\\b|\\.)`, "g");
    const blockForkPattern = new RegExp(
      `\\$blocks\\.${escapeRegex(change.previousBlockKey)}\\.${escapeRegex(change.previousKey)}(?=\\b|\\.)`,
      "g"
    );
    const legacyBlockForkPattern = new RegExp(
      `\\$${escapeRegex(change.previousBlockKey)}\\.${escapeRegex(change.previousKey)}(?=\\b|\\.)`,
      "g"
    );
    const legacyCurrentForkPattern = new RegExp(`(^|[^A-Za-z0-9_])\\$${escapeRegex(change.previousKey)}(?=\\b|\\.)`, "g");
    nextValue = replaceAll(nextValue, `{{current.${change.previousKey}}}`, `{{current.${change.nextKey}}}`);
    nextValue = replaceAll(nextValue, `{{current.${change.previousKey}.`, `{{current.${change.nextKey}.`);
    nextValue = nextValue.replace(currentForkPattern, `$current.${change.nextKey}`);

    nextValue = replaceAll(nextValue, `{{blocks.${change.previousBlockKey}.${change.previousKey}}}`, `{{blocks.${change.nextBlockKey}.${change.nextKey}}}`);
    nextValue = replaceAll(nextValue, `{{blocks.${change.previousBlockKey}.${change.previousKey}.`, `{{blocks.${change.nextBlockKey}.${change.nextKey}.`);
    nextValue = nextValue.replace(blockForkPattern, `$blocks.${change.nextBlockKey}.${change.nextKey}`);

    nextValue = replaceAll(nextValue, `{{${change.previousBlockKey}.${change.previousKey}}}`, `{{${change.nextBlockKey}.${change.nextKey}}}`);
    nextValue = replaceAll(nextValue, `{{${change.previousBlockKey}.${change.previousKey}.`, `{{${change.nextBlockKey}.${change.nextKey}.`);
    nextValue = nextValue.replace(legacyBlockForkPattern, `$${change.nextBlockKey}.${change.nextKey}`);

    nextValue = replaceAll(nextValue, `{{${change.previousKey}}}`, `{{${change.nextKey}}}`);
    nextValue = replaceAll(nextValue, `{{${change.previousKey}.`, `{{${change.nextKey}.`);
    nextValue = nextValue.replace(legacyCurrentForkPattern, (_match, prefix: string) => `${prefix}$${change.nextKey}`);
  }

  return nextValue;
}

function createExpressionReferenceLookup(expressions: ExpressionData[]): Map<string, string> {
  const taken = new Set<string>();
  const lookup = new Map<string, string>();

  for (const expression of expressions) {
    const key = resolveExpressionReferenceKey(expression, taken);
    taken.add(key);
    lookup.set(expression.id, key);
  }

  return lookup;
}

function getNormalizedExpressionName(node: NodeData, expressionIndex: number, nextValue: string): string {
  const expression = node.expressions[expressionIndex];
  const fallback = fallbackExpressionName(String(expression?.type || "expression"), expressionIndex);
  const baseKey = toReferenceKey(nextValue.trim() || fallback, fallback);
  const taken = node.expressions
    .filter((_, index) => index !== expressionIndex)
    .map((candidate) => candidate.name);
  return ensureUniqueReferenceKey(baseKey, taken);
}

interface ReferenceChange {
  previous: string;
  next: string;
}

interface ExpressionReferenceChange {
  previousBlockKey: string;
  nextBlockKey: string;
  previousKey: string;
  nextKey: string;
}

function getCurrentNode(): NodeData | null {
  const { selectedNodeId, nodes } = getState();
  return nodes.find((node) => node.id === selectedNodeId) ?? null;
}

function forcePanelRefresh() {
  currentNodeId = null;
}

function getParentOptions(node: NodeData) {
  const otherNodes = getState().nodes.filter((candidate) => candidate.id !== node.id);
  return [
    { id: "workflow", label: "Workflow root", active: node.parentBlocks.includes("workflow") },
    ...otherNodes.map((candidate) => ({
      id: candidate.id,
      label: candidate.name,
      active: node.parentBlocks.includes(candidate.id),
    })),
  ];
}

function getBranchTargets(node: NodeData) {
  return getState().nodes
    .filter((candidate) => candidate.id !== node.id)
    .map((candidate) => ({ id: candidate.id, label: candidate.name }));
}

function getReferenceOptions(node: NodeData, expressionIndex: number) {
  const currentBlockReferences = node.expressions.slice(0, expressionIndex).map((expression) => ({
    label: `current.${expression.name}`,
    template: `{{current.${expression.name}}}`,
    forkToken: `$current.${expression.name}`,
  }));

  const blockReferenceLookup = createBlockReferenceLookup(getState().nodes);
  const upstreamReferences = collectUpstreamNodes(node.id).flatMap((upstreamNode) =>
    upstreamNode.expressions.map((expression) => ({
      label: `${upstreamNode.name} → ${expression.name}`,
      template: `{{blocks.${blockReferenceLookup.get(upstreamNode.id)}.${expression.name}}}`,
      forkToken: `$blocks.${blockReferenceLookup.get(upstreamNode.id)}.${expression.name}`,
    }))
  );

  return [...currentBlockReferences, ...upstreamReferences];
}

function getForkReferenceOptions(node: NodeData) {
  const blockReferenceLookup = createBlockReferenceLookup(getState().nodes);
  return [
    ...node.expressions.map((expression) => ({
      label: `current.${expression.name}`,
      template: `{{current.${expression.name}}}`,
      forkToken: `$current.${expression.name}`,
    })),
    ...collectUpstreamNodes(node.id).flatMap((upstreamNode) =>
      upstreamNode.expressions.map((expression) => ({
        label: `${upstreamNode.name} → ${expression.name}`,
        template: `{{blocks.${blockReferenceLookup.get(upstreamNode.id)}.${expression.name}}}`,
        forkToken: `$blocks.${blockReferenceLookup.get(upstreamNode.id)}.${expression.name}`,
      }))
    ),
  ];
}

function collectUpstreamNodes(nodeId: string): NodeData[] {
  const { nodes } = getState();
  const visited = new Set<string>();
  const queue = [...(nodes.find((node) => node.id === nodeId)?.parentBlocks ?? [])];
  const upstreamNodes: NodeData[] = [];
  let pointer = 0;

  // Use a manual pointer so newly discovered parents can be appended in-place
  // as the breadth-first search uncovers more ancestors.
  while (pointer < queue.length) {
    const parentId = queue[pointer++];
    if (!parentId || parentId === "workflow" || visited.has(parentId)) continue;
    visited.add(parentId);

    const parentNode = nodes.find((node) => node.id === parentId);
    if (!parentNode) continue;

    upstreamNodes.push(parentNode);
    queue.push(...parentNode.parentBlocks);
  }

  return upstreamNodes;
}

function createForkBranch(): ForkBranchData {
  return {
    statement: ["==", "$result", ""],
    resultTrueBlocks: [],
    resultFalseBlocks: [],
  };
}

function renderPlaceholder(): string {
  const isCollapsed = panelEl?.classList.contains("jf-collapsible--collapsed");
  const headerIcon = isCollapsed ? "▸" : "▾";
  return `
    <div class="jf-collapsible__header">
      <button class="jf-collapsible__toggle" aria-label="Toggle Properties">${headerIcon}</button>
      <span class="jf-collapsible__title">Properties</span>
    </div>
    <div class="jf-collapsible__body">
      <div class="jf-panel__placeholder">Select a node to edit expressions, forks, and references.</div>
    </div>
  `;
}

function parseStatementInput(value: string): any {
  const trimmed = value.trim();
  if (!trimmed) return "";

  try {
    return JSON.parse(trimmed);
  } catch {
    return trimmed;
  }
}

function stringifyStatement(statement: any): string {
  if (typeof statement === "string") return statement;
  try {
    return JSON.stringify(statement);
  } catch {
    return String(statement ?? "");
  }
}

function appendReference(value: string, reference: string): string {
  return value ? `${value} ${reference}`.trim() : reference;
}

function insertBranchReference(statement: any, reference: string): string {
  const current = stringifyStatement(statement);
  if (!current.trim()) {
    return JSON.stringify(["==", reference, ""]);
  }
  if (current.includes("$result")) {
    // Replace only standalone `$result` tokens so placeholders like
    // `$result_value` or `$results` keep their original meaning.
    return current.replace(STANDALONE_RESULT_TOKEN, (_, prefix: string) => `${prefix}${reference}`);
  }
  return appendReference(current, reference);
}

function replaceAll(value: string, search: string, replacement: string): string {
  return value.split(search).join(replacement);
}

function escapeRegex(value: string): string {
  // Escape user-facing keys before building dynamic RegExp objects.
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function dedupeIds(ids: string[]): string[] {
  return Array.from(new Set(ids.filter(Boolean)));
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function escapeAttr(s: string): string {
  return escapeHtml(s).replace(/"/g, "&quot;");
}
