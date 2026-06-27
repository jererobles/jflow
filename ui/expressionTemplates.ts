import { ExpressionData } from "./types";

export const EXPRESSION_LIBRARY: { label: string; icon: string; expressionType: string }[] = [
  { label: "Math", icon: "🧮", expressionType: "Math" },
  { label: "Console Log", icon: "📝", expressionType: "ConsoleLog" },
  { label: "HTTP Request", icon: "🌐", expressionType: "HTTPRequest" },
  { label: "Wait", icon: "⏱️", expressionType: "Wait" },
];

export function createExpression(type: string, existingExpressions: ExpressionData[] = []): ExpressionData {
  const nextIndex = existingExpressions.length + 1;
  return {
    id: `expr_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    name: createExpressionName(type, existingExpressions),
    type,
    parameters: getDefaultParams(type),
  };
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
  const base = type.replace(/([a-z0-9])([A-Z])/g, "$1_$2").replace(/\s+/g, "_").toLowerCase();
  const taken = new Set(existingExpressions.map((expression) => expression.name));
  let counter = 1;
  let candidate = `${base}_${counter}`;
  while (taken.has(candidate)) {
    counter += 1;
    candidate = `${base}_${counter}`;
  }
  return candidate;
}
