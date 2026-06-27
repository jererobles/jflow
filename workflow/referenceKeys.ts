export interface ReferenceSource {
    id?: string;
    name?: string;
    type?: string;
}

export function toReferenceKey(value: string | undefined | null, fallback = "value"): string {
    const normalized = normalizeReferenceValue(value);
    if (normalized) {
        return normalized;
    }

    const fallbackNormalized = normalizeReferenceValue(fallback);
    return fallbackNormalized || "value";
}

export function ensureUniqueReferenceKey(baseKey: string, taken: Iterable<string>): string {
    const normalizedBaseKey = toReferenceKey(baseKey, "value");
    const used = new Set(taken);

    if (!used.has(normalizedBaseKey)) {
        return normalizedBaseKey;
    }

    let counter = 2;
    let candidate = `${normalizedBaseKey}_${counter}`;
    while (used.has(candidate)) {
        counter += 1;
        candidate = `${normalizedBaseKey}_${counter}`;
    }
    return candidate;
}

export function resolveExpressionReferenceKey(source: ReferenceSource, taken: Iterable<string> = []): string {
    const fallback = source.type ? toReferenceKey(source.type, "expression") : "expression";
    const baseKey = toReferenceKey(source.name || source.id || fallback, fallback);
    return ensureUniqueReferenceKey(baseKey, taken);
}

export function createBlockReferenceLookup<T extends { id: string; name?: string }>(blocks: T[]): Map<string, string> {
    const taken = new Set<string>();
    const lookup = new Map<string, string>();

    for (const block of blocks) {
        const key = ensureUniqueReferenceKey(toReferenceKey(block.name || block.id, "block"), taken);
        taken.add(key);
        lookup.set(block.id, key);
    }

    return lookup;
}

function normalizeReferenceValue(value: string | undefined | null): string {
    const normalized = String(value ?? "")
        .trim()
        .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
        .replace(/[^A-Za-z0-9]+/g, "_")
        .replace(/^_+|_+$/g, "")
        .toLowerCase();

    if (!normalized) {
        return "";
    }

    return /^\d/.test(normalized) ? `n_${normalized}` : normalized;
}
