const STORAGE_KEY = "tokenforge.history";

export interface HistoryEntry {
  chain: string;
  chainId: number;
  template: string;
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  txHash: string;
  timestamp: number;
}

export function getHistory(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as HistoryEntry[];
  } catch {
    return [];
  }
}

export function addToHistory(entry: HistoryEntry): void {
  const list = getHistory();
  list.unshift(entry);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

export function clearHistory(): void {
  localStorage.removeItem(STORAGE_KEY);
}
