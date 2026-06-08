import "server-only";
import Database from "better-sqlite3";
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import type { RoadmapGraph, UserProfile } from "@/lib/schema";

/**
 * SQLite-backed persistence. A single file keeps the app deployable as one
 * stateless-ish container; mount the DATA_DIR as a Docker volume to persist.
 *
 * Maps are keyed by the signed-in user's email.
 */

const DATA_DIR = process.env.DATA_DIR || join(process.cwd(), "data");
const DB_PATH = process.env.DATABASE_PATH || join(DATA_DIR, "careercompass.db");

/** Free-tier limit on the number of saved maps per user. */
export const FREE_MAP_LIMIT = 3;

let _db: Database.Database | null = null;

function db(): Database.Database {
  if (_db) return _db;
  mkdirSync(dirname(DB_PATH), { recursive: true });
  const database = new Database(DB_PATH);
  database.pragma("journal_mode = WAL");
  database.exec(`
    CREATE TABLE IF NOT EXISTS maps (
      id          TEXT PRIMARY KEY,
      user_email  TEXT NOT NULL,
      title       TEXT NOT NULL,
      goal        TEXT NOT NULL,
      profile     TEXT NOT NULL,
      roadmap     TEXT NOT NULL,
      completed   TEXT NOT NULL DEFAULT '[]',
      created_at  INTEGER NOT NULL,
      updated_at  INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_maps_user ON maps (user_email, updated_at DESC);
  `);
  _db = database;
  return database;
}

export type StoredMap = {
  id: string;
  title: string;
  goal: string;
  profile: UserProfile;
  roadmap: RoadmapGraph;
  completed: string[];
  createdAt: number;
  updatedAt: number;
};

type MapRow = {
  id: string;
  user_email: string;
  title: string;
  goal: string;
  profile: string;
  roadmap: string;
  completed: string;
  created_at: number;
  updated_at: number;
};

function rowToMap(row: MapRow): StoredMap {
  return {
    id: row.id,
    title: row.title,
    goal: row.goal,
    profile: JSON.parse(row.profile) as UserProfile,
    roadmap: JSON.parse(row.roadmap) as RoadmapGraph,
    completed: JSON.parse(row.completed) as string[],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function listMaps(userEmail: string): StoredMap[] {
  const rows = db()
    .prepare(
      "SELECT * FROM maps WHERE user_email = ? ORDER BY updated_at DESC",
    )
    .all(userEmail) as MapRow[];
  return rows.map(rowToMap);
}

export function countMaps(userEmail: string): number {
  const row = db()
    .prepare("SELECT COUNT(*) AS n FROM maps WHERE user_email = ?")
    .get(userEmail) as { n: number };
  return row.n;
}

export function getMap(userEmail: string, id: string): StoredMap | null {
  const row = db()
    .prepare("SELECT * FROM maps WHERE id = ? AND user_email = ?")
    .get(id, userEmail) as MapRow | undefined;
  return row ? rowToMap(row) : null;
}

export type CreateMapInput = {
  profile: UserProfile;
  roadmap: RoadmapGraph;
  completed?: string[];
};

export function createMap(
  userEmail: string,
  input: CreateMapInput,
): StoredMap {
  const now = Date.now();
  const id = `map_${now.toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  const title = input.roadmap.title || input.profile.goal;
  db()
    .prepare(
      `INSERT INTO maps
        (id, user_email, title, goal, profile, roadmap, completed, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      id,
      userEmail,
      title,
      input.profile.goal,
      JSON.stringify(input.profile),
      JSON.stringify(input.roadmap),
      JSON.stringify(input.completed ?? []),
      now,
      now,
    );
  return getMap(userEmail, id)!;
}

export function updateMapCompleted(
  userEmail: string,
  id: string,
  completed: string[],
): StoredMap | null {
  const existing = getMap(userEmail, id);
  if (!existing) return null;
  db()
    .prepare(
      "UPDATE maps SET completed = ?, updated_at = ? WHERE id = ? AND user_email = ?",
    )
    .run(JSON.stringify(completed), Date.now(), id, userEmail);
  return getMap(userEmail, id);
}

export function deleteMap(userEmail: string, id: string): boolean {
  const res = db()
    .prepare("DELETE FROM maps WHERE id = ? AND user_email = ?")
    .run(id, userEmail);
  return res.changes > 0;
}
