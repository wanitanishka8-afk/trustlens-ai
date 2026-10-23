import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { AnalysisReport, HistoryItemSummary } from '../types/index.js';

let dbInstance: DatabaseSync | null = null;
const memoryStore = new Map<string, { summary: HistoryItemSummary; report: AnalysisReport }>();

export function getDatabasePath(): string {
  const customPath = process.env.DATABASE_PATH || './data/trustlens.db';
  return path.resolve(process.cwd(), customPath);
}

export function initDatabase(dbPath?: string): DatabaseSync | null {
  if (dbInstance) return dbInstance;

  try {
    const resolvedPath = dbPath || getDatabasePath();
    const dir = path.dirname(resolvedPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const db = new DatabaseSync(resolvedPath);
    db.exec(`
      CREATE TABLE IF NOT EXISTS analysis_history (
        id TEXT PRIMARY KEY,
        timestamp TEXT NOT NULL,
        snippet TEXT NOT NULL,
        overallScore INTEGER NOT NULL,
        overallRiskLevel TEXT NOT NULL,
        analysisMode TEXT NOT NULL,
        warningCount INTEGER NOT NULL,
        fullReportJson TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_history_timestamp ON analysis_history(timestamp DESC);
    `);

    dbInstance = db;
    return dbInstance;
  } catch (err) {
    console.warn('Failed to initialize SQLite on disk, falling back to in-memory store:', err);
    return null;
  }
}

export function saveAnalysis(report: AnalysisReport): void {
  const db = initDatabase();

  const summary: HistoryItemSummary = {
    id: report.id,
    timestamp: report.timestamp,
    snippet: report.submittedSnippet,
    overallScore: report.overallScore,
    overallRiskLevel: report.overallRiskLevel,
    analysisMode: report.analysisMode,
    warningCount: report.combinedWarningSigns.length,
  };

  if (db) {
    try {
      const stmt = db.prepare(`
        INSERT OR REPLACE INTO analysis_history 
        (id, timestamp, snippet, overallScore, overallRiskLevel, analysisMode, warningCount, fullReportJson)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);
      stmt.run(
        report.id,
        report.timestamp,
        report.submittedSnippet,
        report.overallScore,
        report.overallRiskLevel,
        report.analysisMode,
        report.combinedWarningSigns.length,
        JSON.stringify(report)
      );
      return;
    } catch (err) {
      console.error('Error inserting into SQLite:', err);
    }
  }

  // In-memory fallback
  memoryStore.set(report.id, { summary, report });
}

export function getHistory(limit = 50): HistoryItemSummary[] {
  const db = initDatabase();

  if (db) {
    try {
      const stmt = db.prepare(`
        SELECT id, timestamp, snippet, overallScore, overallRiskLevel, analysisMode, warningCount
        FROM analysis_history
        ORDER BY timestamp DESC
        LIMIT ?
      `);
      const rows = stmt.all(limit) as Array<{
        id: string;
        timestamp: string;
        snippet: string;
        overallScore: number;
        overallRiskLevel: string;
        analysisMode: string;
        warningCount: number;
      }>;

      return rows.map((r) => ({
        id: r.id,
        timestamp: r.timestamp,
        snippet: r.snippet,
        overallScore: r.overallScore,
        overallRiskLevel: r.overallRiskLevel as HistoryItemSummary['overallRiskLevel'],
        analysisMode: r.analysisMode as HistoryItemSummary['analysisMode'],
        warningCount: r.warningCount,
      }));
    } catch (err) {
      console.error('Error querying SQLite history:', err);
    }
  }

  // In-memory fallback
  return Array.from(memoryStore.values())
    .map((v) => v.summary)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, limit);
}

export function getAnalysisById(id: string): AnalysisReport | null {
  const db = initDatabase();

  if (db) {
    try {
      const stmt = db.prepare(`
        SELECT fullReportJson FROM analysis_history WHERE id = ?
      `);
      const row = stmt.get(id) as { fullReportJson: string } | undefined;
      if (row && row.fullReportJson) {
        return JSON.parse(row.fullReportJson) as AnalysisReport;
      }
      return null;
    } catch (err) {
      console.error('Error fetching SQLite analysis by id:', err);
    }
  }

  const memoryItem = memoryStore.get(id);
  return memoryItem ? memoryItem.report : null;
}

export function deleteAnalysis(id: string): boolean {
  const db = initDatabase();
  let deleted = false;

  if (db) {
    try {
      const stmt = db.prepare(`
        DELETE FROM analysis_history WHERE id = ?
      `);
      stmt.run(id);
      deleted = true;
    } catch (err) {
      console.error('Error deleting from SQLite:', err);
    }
  }

  if (memoryStore.has(id)) {
    memoryStore.delete(id);
    deleted = true;
  }

  return deleted;
}

export function clearDatabaseForTesting(): void {
  const db = initDatabase();
  if (db) {
    try {
      db.exec('DELETE FROM analysis_history;');
    } catch {
      // ignore
    }
  }
  memoryStore.clear();
}
