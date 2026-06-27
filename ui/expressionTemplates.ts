import { ExpressionData } from "./types";
import { generateId } from "./ids";

export const EXPRESSION_LIBRARY: { label: string; icon: string; expressionType: string }[] = [
  { label: "Math", icon: "🧮", expressionType: "Math" },
  { label: "Console Log", icon: "📝", expressionType: "ConsoleLog" },
  { label: "HTTP Request", icon: "🌐", expressionType: "HTTPRequest" },
  { label: "Wait", icon: "⏱️", expressionType: "Wait" },
];

export function createExpression(type: string, existingExpressions: ExpressionData[] = []): ExpressionData {
  return {
    id: generateId("expr"),
    name: createExpressionName(type, existingExpressions),
    type,
    parameters: getDefaultParams(type),
  };
}

export function fallbackExpressionName(type: string, index: number): string {
  return `${toExpressionNameBase(type)}_${index + 1}`;
}

export function getDefaultParams(type: string): { id: string; name: string; value: string }[] {
  switch (type) {
    case "Math":
      return [{ id: "p1", name: "expression", value: "2 + 2" }];
    case "ConsoleLog":
      return [{ id: "p1", name: "data", value: "Hello from JFlow" }];
    case "HTTPRequest":
      return [
        { id: "p1", name: "url", value: "https://httpbin.org/get" },
        { id: "p2", name: "method", value: "GET" },
      ];
    case "Wait":
      return [{ id: "p1", name: "seconds", value: "2" }];
    default:
      return [];
  }
}

export function getExpressionMeta(type: string) {
  return (
    EXPRESSION_LIBRARY.find((entry) => entry.expressionType === type) ?? {
      label: type,
      icon: "◆",
      expressionType: type,
    }
  );
}

function createExpressionName(type: string, existingExpressions: ExpressionData[]): string {
  const base = toExpressionNameBase(type);
  const taken = new Set(existingExpressions.map((expression) => expression.name));
  let counter = 1;
  let candidate = `${base}_${counter}`;
  while (taken.has(candidate)) {
    counter += 1;
    candidate = `${base}_${counter}`;
  }
  return candidate;
}

function toExpressionNameBase(type: string): string {
  // Best-effort conversion from display names/types into stable snake_case keys.
  return type
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1_$2")
    .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
    .replace(/\s+/g, "_")
    .toLowerCase();
}
