import { ExpressionData } from "./types";
import { generateId } from "./ids";
import { ensureUniqueReferenceKey, resolveExpressionReferenceKey, toReferenceKey } from "../workflow/referenceKeys";

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
  return `${toReferenceKey(type, "expression")}_${index + 1}`;
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
  const taken = new Set(existingExpressions.map((expression) => expression.name));
  const base = resolveExpressionReferenceKey({ type }, []);
  return ensureUniqueReferenceKey(base, taken);
}
