const DRAFT_STORAGE_PREFIX = 'sebo:transaction-draft:';

export function transactionDraftKey(name: string): string {
  return `${DRAFT_STORAGE_PREFIX}${name}`;
}

export function loadTransactionDraft<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;

  try {
    const rawDraft = window.localStorage.getItem(key);
    return rawDraft ? (JSON.parse(rawDraft) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function saveTransactionDraft<T>(key: string, draft: T): void {
  if (typeof window === 'undefined') return;

  try {
    window.localStorage.setItem(key, JSON.stringify(draft));
  } catch {
    // Storage can be unavailable in private browsing or full quota states.
  }
}

export function clearTransactionDraft(key: string): void {
  if (typeof window === 'undefined') return;

  try {
    window.localStorage.removeItem(key);
  } catch {
    // Ignore storage failures; the transaction itself should not be blocked.
  }
}
