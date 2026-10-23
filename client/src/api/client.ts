import { AnalysisReport, HealthStatus, HistoryItemSummary } from '../types/index.js';

const API_BASE = '/api';

export async function checkHealth(): Promise<HealthStatus> {
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) {
    throw new Error(`Health check failed with status ${res.status}`);
  }
  return res.json();
}

export async function analyzeContent(content: string): Promise<AnalysisReport> {
  const res = await fetch(`${API_BASE}/analyze`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ content }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || data.error || `Analysis request failed with status ${res.status}`);
  }

  return data as AnalysisReport;
}

export async function fetchHistory(): Promise<HistoryItemSummary[]> {
  const res = await fetch(`${API_BASE}/history`);
  if (!res.ok) {
    throw new Error(`Failed to load history (${res.status})`);
  }
  const data = await res.json();
  return data.history || [];
}

export async function fetchHistoryItem(id: string): Promise<AnalysisReport> {
  const res = await fetch(`${API_BASE}/history/${encodeURIComponent(id)}`);
  if (!res.ok) {
    throw new Error(`Failed to load analysis record ${id} (${res.status})`);
  }
  return res.json();
}

export async function deleteHistoryItem(id: string): Promise<boolean> {
  const res = await fetch(`${API_BASE}/history/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    throw new Error(`Failed to delete analysis record ${id} (${res.status})`);
  }
  const data = await res.json();
  return Boolean(data.success);
}
