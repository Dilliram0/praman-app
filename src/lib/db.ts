import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { products } from './catalog';

const globalDb = globalThis as typeof globalThis & { pramanDb?: DatabaseSync };
function database() {
  if (globalDb.pramanDb) return globalDb.pramanDb;
  const isNetlify = process.env.NETLIFY === 'true';
  const basePath = isNetlify ? tmpdir() : process.cwd();
  const location = process.env.DATABASE_PATH || (isNetlify ? 'praman.db' : './data/praman.db');
  const fullPath = path.resolve(/* turbopackIgnore: true */ basePath, location);
  mkdirSync(path.dirname(fullPath), { recursive: true });
  const db = new DatabaseSync(fullPath);
  db.exec(`PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS products (id TEXT PRIMARY KEY, data TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS user_state (user_id TEXT PRIMARY KEY, saved TEXT NOT NULL DEFAULT '[]', shopping_list TEXT NOT NULL DEFAULT '[]', preferences TEXT NOT NULL DEFAULT '{}');
    CREATE TABLE IF NOT EXISTS submissions (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, barcode TEXT, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);`);
  const insert = db.prepare('INSERT INTO products (id,data) VALUES (?,?) ON CONFLICT(id) DO UPDATE SET data=excluded.data');
  db.exec('BEGIN IMMEDIATE');
  try { for (const item of products) insert.run(item.id, JSON.stringify(item)); db.exec('COMMIT'); }
  catch (error) { db.exec('ROLLBACK'); throw error; }
  globalDb.pramanDb = db;
  return db;
}

export function allProducts() { return database().prepare('SELECT data FROM products ORDER BY rowid').all().map((row) => JSON.parse((row as {data:string}).data)); }
export function getProduct(id: string) { const row = database().prepare('SELECT data FROM products WHERE id=?').get(id) as {data:string}|undefined; return row ? JSON.parse(row.data) : null; }
export type PramanState = { saved:string[]; shoppingList:string[]; preferences:{diet:string; allergens:string[]}; submissions:{id:number;name:string;barcode:string|null;createdAt:string}[] };
export function getState(userId = 'guest'): PramanState {
  const db = database();
  db.prepare('INSERT OR IGNORE INTO user_state(user_id) VALUES (?)').run(userId);
  const row = db.prepare('SELECT saved,shopping_list,preferences FROM user_state WHERE user_id=?').get(userId) as {saved:string;shopping_list:string;preferences:string};
  const submissions = db.prepare('SELECT id,name,barcode,created_at as createdAt FROM submissions ORDER BY id DESC').all() as PramanState['submissions'];
  const preferences = JSON.parse(row.preferences) as Partial<PramanState['preferences']>;
  return { saved:JSON.parse(row.saved), shoppingList:JSON.parse(row.shopping_list), preferences:{diet:preferences.diet||'No preference',allergens:Array.isArray(preferences.allergens)?preferences.allergens:[]}, submissions };
}
export function saveState(input: Pick<PramanState,'saved'|'shoppingList'|'preferences'>, userId = 'guest') {
  database().prepare(`INSERT INTO user_state(user_id,saved,shopping_list,preferences) VALUES (?,?,?,?)
    ON CONFLICT(user_id) DO UPDATE SET saved=excluded.saved,shopping_list=excluded.shopping_list,preferences=excluded.preferences`)
    .run(userId, JSON.stringify(input.saved), JSON.stringify(input.shoppingList), JSON.stringify(input.preferences));
  return getState(userId);
}
export function addSubmission(name:string, barcode:string|null) {
  const db=database(); const result=db.prepare('INSERT INTO submissions(name,barcode) VALUES (?,?)').run(name,barcode);
  return db.prepare('SELECT id,name,barcode,created_at as createdAt FROM submissions WHERE id=?').get(result.lastInsertRowid);
}
